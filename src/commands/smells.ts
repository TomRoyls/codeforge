import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildSmellsResult } from './smells-helpers.js'
import { formatSmellsCsv, formatSmellsJson, formatSmellsTable } from './smells-format-helpers.js'

// ─── Command ──────────────────────────────────────────────────────────────────

export default class SmellsCommand extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze for code smells',
      required: false,
    }),
  }

  static override description = 'Detect code smells across the codebase'

  static override examples = [
    {
      command: '<%= config.bin %> smells',
      description: 'Analyze current directory for code smells',
    },
    {
      command: '<%= config.bin %> smells ./src --format json',
      description: 'Analyze src directory with JSON output',
    },
    {
      command: '<%= config.bin %> smells --severity critical',
      description: 'Show only critical smells',
    },
    {
      command: '<%= config.bin %> smells --ext .ts,.tsx --verbose',
      description: 'Analyze TypeScript files with verbose output',
    },
    {
      command: '<%= config.bin %> smells --format csv --output smells.csv',
      description: 'Export smells to CSV file',
    },
  ]

  static override flags = {
    ext: Flags.string({
      default: '',
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
    severity: Flags.string({
      char: 's',
      default: 'all',
      description: 'Minimum severity level to report',
      options: ['all', 'info', 'warning', 'critical'],
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed output',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(SmellsCommand)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'csv' | 'json' | 'table'

    const spinner = ora('Scanning for code smells...').start()

    const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']
    const ignore = flags.ignore ? [...defaultIgnore, ...flags.ignore] : defaultIgnore

    const discoveredFiles = await discoverFiles({
      cwd: targetPath,
      ignore,
      patterns: [
        '**/*.ts',
        '**/*.tsx',
        '**/*.js',
        '**/*.jsx',
      ],
    })

    const extensions = flags.ext
      ? flags.ext
          .split(',')
          .map((e: string) => e.trim())
          .filter(Boolean)
      : null

    const filteredFiles = extensions
      ? discoveredFiles.filter((f) => {
          const ext = extname(f.path).toLowerCase()
          return extensions.includes(ext)
        })
      : discoveredFiles

    if (filteredFiles.length === 0) {
      spinner.warn('No source files found')
      return
    }

    spinner.text = `Analyzing ${filteredFiles.length} files for smells...`

    const files: string[] = []
    const contents: string[] = []

    for (const file of filteredFiles) {
      try {
        const content = await fs.readFile(file.absolutePath, 'utf8')
        files.push(file.path)
        contents.push(content)
      } catch {
        // skip unreadable files
      }
    }

    const result = buildSmellsResult(files, contents, {
      severity: flags.severity as 'all' | 'info' | 'warning' | 'critical',
    })

    spinner.succeed(`Found ${result.stats.totalSmells} smell${result.stats.totalSmells !== 1 ? 's' : ''} across ${result.stats.filesAffected} file${result.stats.filesAffected !== 1 ? 's' : ''}`)

    const outputData =
      format === 'json'
        ? formatSmellsJson(result)
        : format === 'csv'
          ? formatSmellsCsv(result)
          : formatSmellsTable(result)

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

    if (result.stats.criticalCount > 0) {
      this.exit(1)
    }
  }
}
