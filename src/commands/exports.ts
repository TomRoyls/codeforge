import { Args, Command, Flags } from '@oclif/core'
import chalk from 'chalk'
import { existsSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora, { type Ora } from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { Parser } from '../core/parser.js'
import {
  type AnalysisResult,
  type ExportInfo,
  extractExports as extractExportsHelper,
  extractImports as extractImportsHelper,
  formatOutput as formatOutputHelper,
  type TypeSummary,
} from './exports-helpers.js'

export default class Exports extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze (file or directory)',
      required: false,
    }),
  }

  static override description = 'Analyze and list exports from TypeScript/JavaScript files'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'List all exports in current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> src/',
      description: 'List exports in src directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --type function',
      description: 'List only function exports',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json',
      description: 'Output exports as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --unused',
      description: 'Find potentially unused exports',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Analyze only TypeScript files',
    },
  ]

  static override flags = {
    ext: Flags.string({
      default: '',
      description: 'Comma-separated file extensions to analyze (e.g., ".ts,.tsx")',
    }),
    format: Flags.string({
      char: 'f',
      default: 'console',
      description: 'Output format',
      options: ['console', 'json', 'markdown'],
    }),
    ignore: Flags.string({
      char: 'i',
      description: 'Patterns to ignore',
      multiple: true,
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output file path',
    }),
    type: Flags.string({
      char: 't',
      description: 'Filter by export type',
      options: ['class', 'const', 'function', 'interface', 'type'],
    }),
    unused: Flags.boolean({
      char: 'u',
      default: false,
      description: 'Find potentially unused exports',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed output',
    }),
  }

  private parser: null | Parser = null

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Exports)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'console' | 'json' | 'markdown'
    const typeFilter = flags.type as
      | 'class'
      | 'const'
      | 'function'
      | 'interface'
      | 'type'
      | undefined

    const spinner = ora('Discovering files...').start()

    const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']
    const ignore = flags.ignore ? [...defaultIgnore, ...flags.ignore] : defaultIgnore

    const discoveredFiles = await discoverFiles({
      cwd: targetPath,
      ignore,
      patterns: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    })

    const extensions = flags.ext
      ? flags.ext
          .split(',')
          .map((e) => e.trim())
          .filter(Boolean)
      : null

    const filteredFiles = extensions
      ? discoveredFiles.filter((f) => {
          const ext = extname(f.path).toLowerCase()
          return extensions.includes(ext)
        })
      : discoveredFiles

    if (filteredFiles.length === 0) {
      spinner.warn('No files found to analyze')
      this.exit(0)
    }

    spinner.text = 'Analyzing files...'

    this.parser = new Parser()
    await this.parser.initialize()

    let result: AnalysisResult
    try {
      result = await this.collectExports(filteredFiles, spinner, flags.verbose)
    } finally {
      this.parser.dispose()
      this.parser = null
    }

    let filteredExports = result.exports
    if (typeFilter) {
      filteredExports = result.exports.filter((exp) => exp.type === typeFilter)
    }

    let { unusedExports } = result
    if (typeFilter) {
      unusedExports = result.unusedExports.filter((exp) => exp.type === typeFilter)
    }

    spinner.succeed(
      `Analyzed ${filteredFiles.length} files, found ${filteredExports.length} exports`,
    )

    const outputData = formatOutputHelper(filteredExports, {
      format,
      showUnused: flags.unused,
      totalFiles: result.totalFiles,
      typeSummary: result.typeSummary,
      unusedExports,
    })

    if (flags.output) {
      try {
        await writeFile(flags.output, outputData, 'utf8')
        this.log(`Results written to ${flags.output}`)
      } catch (error) {
        this.error(
          `Failed to write exports output to ${flags.output}: ${error instanceof Error ? error.message : String(error)}`,
        )
      }
    } else {
      this.log(outputData)
    }

    if (flags.unused && unusedExports.length > 0) {
      this.log(chalk.yellow(`\n⚠️  ${unusedExports.length} potentially unused export(s) found`))
    }
  }

  private async collectExports(
    files: Array<{ absolutePath: string; path: string }>,
    spinner: Ora,
    verbose: boolean,
  ): Promise<AnalysisResult> {
    const allExports: ExportInfo[] = []
    const typeSummary: TypeSummary = {
      class: 0,
      const: 0,
      function: 0,
      interface: 0,
      type: 0,
    }
    const allImports = new Map<string, number>()

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file) continue

      if (verbose) {
        spinner.text = `Analyzing ${file.path} (${i + 1}/${files.length})`
      }

      try {
        // eslint-disable-next-line no-await-in-loop -- sequential file processing needed for progress reporting
        const parseResult = await this.parser!.parseFile(file.absolutePath)
        const { sourceFile } = parseResult

        const fileExports = extractExportsHelper(sourceFile, file.path)
        allExports.push(...fileExports)

        for (const exp of fileExports) {
          typeSummary[exp.type]++
        }

        const imports = extractImportsHelper(sourceFile)
        for (const [name, count] of imports) {
          allImports.set(name, (allImports.get(name) ?? 0) + count)
        }
      } catch (error) {
        if (verbose) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          this.log(`Failed to analyze ${file.path}: ${errorMessage}`)
        }
      }
    }

    for (const exp of allExports) {
      exp.usageCount = allImports.get(exp.name) ?? 0
    }

    const unusedExports = allExports.filter((exp) => exp.usageCount === 0)

    return {
      exports: allExports,
      totalFiles: files.length,
      typeSummary,
      unusedExports,
    }
  }
}
