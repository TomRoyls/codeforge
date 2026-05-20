import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildTimeCapsuleResult } from './time-capsule-helpers.js'
import { formatTimeCapsuleJSON, formatTimeCapsuleTable } from './time-capsule-format-helpers.js'

export default class TimeCapsule extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze',
      required: false,
    }),
  }

  static override description = 'Create a time capsule of the current codebase — snapshot state, trends, and predictions'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Create time capsule of current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Analyze src directory with JSON output',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Analyze TypeScript files only',
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
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed output',
    }),
  }

  static override id = 'time-capsule'

  async run(): Promise<void> {
    const { args, flags } = await this.parse(TimeCapsule)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'

    const spinner = ora('Capturing time capsule...').start()

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
          .map((e) => e.trim())
          .filter(Boolean)
      : null

    const filteredFiles = extensions
      ? discoveredFiles.filter((f) => {
          const ext = extname(f.path).toLowerCase()
          return extensions.includes(ext)
        })
      : discoveredFiles

    spinner.text = 'Analyzing current state...'

    const contents = await Promise.all(
      filteredFiles.map(async (file) => {
        try {
          return await fs.readFile(file.absolutePath, 'utf8')
        } catch {
          return ''
        }
      }),
    )

    const files = filteredFiles.map((f) => f.path)

    let version = '0.0.0'
    try {
      const pkgPath = resolve(targetPath, 'package.json')
      const pkgContent = await fs.readFile(pkgPath, 'utf8')
      const pkg = JSON.parse(pkgContent)
      if (pkg.version) version = pkg.version
    } catch { /* use default */ }

    const result = buildTimeCapsuleResult(files, contents, { verbose: flags.verbose, version })

    spinner.succeed(`Time capsule created — health ${result.state.health}%, maturity ${result.state.maturity}`)

    const outputData = format === 'json' ? formatTimeCapsuleJSON(result) : formatTimeCapsuleTable(result)

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

export { buildTimeCapsuleResult } from './time-capsule-helpers.js'
export type { TimeCapsuleResult, CapsuleStats, CurrentState, GrowthMetrics, TrendIndicator, Prediction, Snapshot, MaturityLevel, TrendDirection } from './time-capsule-helpers.js'
export { formatTimeCapsuleJSON, formatTimeCapsuleTable } from './time-capsule-format-helpers.js'
