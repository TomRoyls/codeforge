import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import ora from 'ora'
import { resolve } from 'node:path'

import { discoverFiles } from '../core/file-discovery.js'
import { buildPerfResult, type PerfResult } from './performance-helpers.js'
import { formatPerfJson, formatPerfTable } from './performance-format-helpers.js'

export default class Performance extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to scan for performance anti-patterns',
      required: false,
    }),
  }

  static override description = 'Scan code for performance anti-patterns'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Scan current directory for performance issues',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Scan src directory and output JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Scan TypeScript files only',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --severity high',
      description: 'Show only high-severity findings',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show suggestions and code context',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json --output perf.json',
      description: 'Export results to JSON file',
    },
  ]

  static override flags = {
    ext: Flags.string({
      default: '.ts,.tsx,.js,.jsx',
      description: 'Comma-separated file extensions to scan (e.g., ".ts,.tsx")',
    }),
    format: Flags.string({
      char: 'f',
      default: 'table',
      description: 'Output format',
      options: ['json', 'table'],
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
      description: 'Filter by severity level',
      options: ['high', 'low', 'medium'],
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show suggestions and context',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Performance)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'
    const verbose = flags.verbose
    const severityFilter = flags.severity as 'high' | 'low' | 'medium' | undefined

    const spinner = ora('Discovering files...').start()

    const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']
    const ignore = flags.ignore ? [...defaultIgnore, ...flags.ignore] : defaultIgnore

    const extensions = flags.ext
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean)

    const patterns = extensions.map((ext) => `**/*${ext}`)

    const discoveredFiles = await discoverFiles({
      cwd: targetPath,
      ignore,
      patterns,
    })

    spinner.text = 'Scanning for performance issues...'

    const filePaths = discoveredFiles.map((f) => f.absolutePath)

    const result: PerfResult = await buildPerfResult(
      filePaths,
      async (filePath: string) => fs.readFile(filePath, 'utf8'),
      { severity: severityFilter },
    )

    spinner.succeed(`Scanned ${filePaths.length} files, found ${result.stats.total} issues`)

    const outputData =
      format === 'json' ? formatPerfJson(result) : formatPerfTable(result, verbose)

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
  }
}

export { buildPerfResult, computePerfStats, getPerfRules, scanFile } from './performance-helpers.js'
export type { PerfFinding, PerfResult, PerfRule, PerfScanOptions, PerfStats } from './performance-helpers.js'
export { formatPerfCategory, formatPerfJson, formatPerfSeverity, formatPerfTable } from './performance-format-helpers.js'
