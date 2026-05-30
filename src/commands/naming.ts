import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import ora from 'ora'
import { resolve } from 'node:path'

import { discoverFiles } from '../core/file-discovery.js'
import {
  buildNamingResult,
  detectFileNamingConvention,
  extractNames,
  type NamingResult,
} from './naming-helpers.js'
import { formatNamingCsv, formatNamingJson, formatNamingTable } from './naming-format-helpers.js'

export default class Naming extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze naming conventions in',
      required: false,
    }),
  }

  static override description = 'Analyze naming conventions across the codebase'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze naming conventions in current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Analyze naming in src directory as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Analyze naming for TypeScript files only',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --check',
      description: 'Check for naming issues',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show detailed naming analysis',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format csv --output naming.csv',
      description: 'Export naming analysis to CSV file',
    },
  ]

  static override flags = {
    check: Flags.boolean({
      default: false,
      description: 'Check for naming issues (exit 1 if issues found)',
    }),
    ext: Flags.string({
      default: '.ts,.tsx,.js,.jsx',
      description: 'Comma-separated file extensions to analyze (e.g., ".ts,.tsx")',
    }),
    format: Flags.string({
      char: 'f',
      default: 'table',
      description: 'Output format',
      options: ['csv', 'json', 'table'],
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
    verbose: Flags.boolean({
      default: false,
      description: 'Show detailed output',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Naming)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'csv' | 'json' | 'table'
    const { check, verbose } = flags

    const spinner = ora('Discovering files...').start()

    const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']
    const ignore = flags.ignore ? [...defaultIgnore, ...flags.ignore] : defaultIgnore

    const extensions = flags.ext
      .split(',')
      .map((e: string) => e.trim())
      .filter(Boolean)

    const patterns = extensions.map((ext: string) => `**/*${ext}`)

    const discoveredFiles = await discoverFiles({
      cwd: targetPath,
      ignore,
      patterns,
    })

    spinner.text = 'Analyzing naming conventions...'

    const allItems = await Promise.all(
      discoveredFiles.map(async (file) => {
        try {
          const content = await fs.readFile(file.absolutePath, 'utf8')
          return extractNames(content, file.path)
        } catch {
          return []
        }
      }),
    )

    const items = allItems.flat()
    const filePaths = discoveredFiles.map((f) => f.path)
    const fileNaming = detectFileNamingConvention(filePaths)

    const result: NamingResult = buildNamingResult(items, fileNaming)

    spinner.succeed(
      `Analyzed ${discoveredFiles.length} files, found ${result.totalItems} named items`,
    )

    const outputData =
      format === 'json'
        ? formatNamingJson(result)
        : format === 'csv'
          ? formatNamingCsv(result)
          : formatNamingTable(result, verbose)

    if (flags.output) {
      try {
        await fs.writeFile(flags.output, outputData, 'utf8')
        this.log(`Results written to ${flags.output}`)
      } catch (error) {
        this.error(
          `Failed to write output to ${flags.output}: ${error instanceof Error ? error.message : String(error)}`,
        )
      }
    } else {
      this.log(outputData)
    }

    if (check && result.issues.length > 0) {
      this.error(
        `Found ${result.issues.length} naming issues`,
        { exit: 1 },
      )
    }
  }
}

export { buildNamingResult, detectFileNamingConvention, extractNames } from './naming-helpers.js'
export type { FileNaming, NamedItem, NamingConvention, NamingIssue, NamingResult, NamingStats } from './naming-helpers.js'
export { formatNamingCsv, formatNamingJson, formatNamingTable } from './naming-format-helpers.js'
