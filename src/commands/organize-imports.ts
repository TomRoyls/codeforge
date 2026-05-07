import type { ImportDeclaration, SourceFile } from 'ts-morph'

import { Args, Command, Flags } from '@oclif/core'
import chalk from 'chalk'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'

import { discoverFiles } from '../core/file-discovery.js'
import { Parser } from '../core/parser.js'
import { MAX_ORGANIZE_IMPORTS_FILES } from '../utils/constants.js'
import {
  displayOrganizeResult,
  GROUP_ORDER,
  categorizeImport as helperCategorizeImport,
  detectInternalPatterns as helperDetectInternalPatterns,
  type ImportGroup,
  type OrganizeResult,
  shouldWriteChanges,
} from './organize-imports-helpers.js'

export default class OrganizeImports extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to organize imports in',
      required: false,
    }),
  }

  static override description = 'Organize and sort imports in TypeScript files'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Organize imports in current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> src/',
      description: 'Organize imports in src directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --dry-run',
      description: 'Preview changes without modifying files',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --group',
      description: 'Group imports by type (external, internal, relative)',
    },
  ]

  static override flags = {
    'dry-run': Flags.boolean({
      char: 'd',
      default: false,
      description: 'Preview changes without modifying files',
    }),
    group: Flags.boolean({
      default: false,
      description: 'Group imports by type (external, internal, relative)',
    }),
    sort: Flags.boolean({
      default: true,
      description: 'Sort imports alphabetically',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed output',
    }),
    write: Flags.boolean({
      char: 'w',
      default: false,
      description: 'Write changes to files',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(OrganizeImports)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const files = await discoverFiles({
      cwd: targetPath,
      ignore: ['node_modules', 'dist', 'coverage', '.git'],
      patterns: ['**/*.ts', '**/*.tsx'],
    })

    if (files.length === 0) {
      this.log(chalk.yellow('No TypeScript files found'))
      return
    }

    const parser = new Parser()
    await parser.initialize()

    const result: OrganizeResult = {
      filesModified: 0,
      importsOrganized: 0,
      skipped: 0,
    }

    const options = { dryRun: flags['dry-run'] ?? false, group: flags.group ?? false, sort: flags.sort ?? false }

    const filesToProcess = files.slice(0, MAX_ORGANIZE_IMPORTS_FILES)

    const parsePromises = filesToProcess.map(async (file) => {
      try {
        const parseResult = await parser.parseFile(file.absolutePath)
        return { error: null, file, parseResult }
      } catch (error) {
        return { error, file, parseResult: null }
      }
    })

    const parseResults = await Promise.all(parsePromises)

    const writePromises: Array<Promise<void>> = []

    for (const parseItem of parseResults) {
      if (parseItem.error || !parseItem.parseResult) {
        result.skipped++
        continue
      }

      const { file, parseResult } = parseItem
      const organizeResult = this.organizeFile(parseResult.sourceFile, options)

      if (organizeResult.changed) {
        if (shouldWriteChanges(flags)) {
          writePromises.push(
            fs.writeFile(file.absolutePath, organizeResult.organized, 'utf8').then(
              () => {
                result.filesModified++
                result.importsOrganized++
              },
              (writeError) => {
                this.warn(
                  `Failed to write ${file.path}: ${writeError instanceof Error ? writeError.message : String(writeError)}`,
                )
              },
            ),
          )
        } else {
          result.importsOrganized++
          if (flags.verbose) {
            this.log(chalk.gray(`  Would organize: ${file.path}`))
          }
        }
      } else {
        result.skipped++
      }
    }

    await Promise.all(writePromises)

    parser.dispose()

    displayOrganizeResult(result, files.length, flags['dry-run'], (msg) => this.log(msg ?? ''))
  }

  private categorizeImport(imp: ImportDeclaration, internalPatterns: string[]): keyof ImportGroup {
    return helperCategorizeImport(imp, internalPatterns)
  }

  private detectInternalPatterns(_sourceFile: SourceFile): string[] {
    return helperDetectInternalPatterns(_sourceFile)
  }

  private getImportGroups(sourceFile: SourceFile, internalPatterns: string[]): ImportGroup {
    const imports = sourceFile.getImportDeclarations()

    const groups: ImportGroup = {
      external: [],
      internal: [],
      relative: [],
      sideEffects: [],
    }

    for (const imp of imports) {
      if (imp.getNamespaceImport() || imp.getDefaultImport()) {
        groups.external.push(imp)
        continue
      }

      const category = this.categorizeImport(imp, internalPatterns)
      groups[category].push(imp)
    }

    return groups
  }

  private organizeFile(
    sourceFile: SourceFile,
    options: { dryRun: boolean; group: boolean; sort: boolean },
  ): { changed: boolean; organized: string; original: string } {
    const original = sourceFile.getFullText()

    if (!options.group && !options.sort) {
      return { changed: false, organized: original, original }
    }

    const internalPatterns = this.detectInternalPatterns(sourceFile)
    const groups = this.getImportGroups(sourceFile, internalPatterns)

    const importStart = sourceFile.getImportDeclarations()[0]?.getStart() ?? 0
    const lastImport = sourceFile.getImportDeclarations().at(-1)
    const importEnd = lastImport?.getEnd() ?? 0

    if (importStart === importEnd) {
      return { changed: false, organized: original, original }
    }

    const beforeImports = original.slice(0, importStart)
    const afterImports = original.slice(importEnd)

    let organizedImports = ''

    if (options.group) {
      const parts: string[] = []

      for (const groupKey of GROUP_ORDER) {
        const groupImports = groups[groupKey]
        if (groupImports.length > 0) {
          const sorted = options.sort
            ? [...groupImports].sort((a, b) =>
                a.getModuleSpecifierValue().localeCompare(b.getModuleSpecifierValue()),
              )
            : groupImports

          parts.push(sorted.map((imp) => imp.getText()).join('\n'))
        }
      }

      organizedImports = parts.join('\n\n')
    } else {
      const allImports = [...groups.external, ...groups.internal, ...groups.relative]
      const sorted = options.sort
        ? [...allImports].sort((a, b) =>
            a.getModuleSpecifierValue().localeCompare(b.getModuleSpecifierValue()),
          )
        : allImports

      organizedImports = sorted.map((imp) => imp.getText()).join('\n')
    }

    const organized = beforeImports + organizedImports + afterImports

    return {
      changed: organized !== original,
      organized,
      original,
    }
  }
}
