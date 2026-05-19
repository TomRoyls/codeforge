import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { runHealthCheck } from './check-helpers.js'
import { formatCheckJson, formatCheckTable } from './check-format-helpers.js'

export default class Check extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to check',
      required: false,
    }),
  }

  static override description = 'Run a comprehensive codebase health check'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Check current directory health',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Check src directory with JSON output',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --threshold 80',
      description: 'Fail if health score below 80',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --checks todos,complexity',
      description: 'Run only specific checks',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show detailed output per check',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json --output report.json',
      description: 'Export health report to JSON file',
    },
  ]

  static override flags = {
    checks: Flags.string({
      default: 'all',
      description: 'Which checks to run (comma-separated)',
      options: ['all', 'todos', 'complexity', 'doc-coverage', 'dupes', 'unused'],
    }),
    format: Flags.string({
      char: 'f',
      default: 'table',
      description: 'Output format',
      options: ['json', 'table'],
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output file path',
    }),
    threshold: Flags.integer({
      default: 70,
      description: 'Minimum health score to pass',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed output per check',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Check)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'
    const { checks, threshold, verbose } = flags

    const spinner = ora('Running health checks...').start()

    const result = await runHealthCheck(
      targetPath,
      { checks, threshold },
      discoverFiles,
      async (path: string) => fs.readFile(path, 'utf8'),
    )

    spinner.succeed(result.summary)

    const outputData = format === 'json' ? formatCheckJson(result) : formatCheckTable(result, verbose)

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

    if (result.overallStatus === 'fail') {
      this.exit(1)
    }
  }
}

export { runHealthCheck } from './check-helpers.js'
export type { CheckResult, HealthCheckResult, HealthCheckOptions } from './check-helpers.js'
export { formatCheckJson, formatCheckTable, formatScoreBar, getStatusIcon } from './check-format-helpers.js'
