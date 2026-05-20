import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { execSync } from 'node:child_process'
import { resolve } from 'node:path'
import ora from 'ora'

import { buildAlmanacResult, type AlmanacResult } from './almanac-helpers.js'
import { formatAlmanacJSON, formatAlmanacTable } from './almanac-format-helpers.js'

export default class Almanac extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze seasonal patterns',
      required: false,
    }),
  }

  static override description = 'Analyze code almanac — seasonal development patterns and rhythms'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze current directory development patterns',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Output almanac as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show detailed rhythm charts',
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
      description: 'Show detailed almanac output',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Almanac)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'

    const spinner = ora('Reading development history...').start()

    let gitLog = ''
    try {
      gitLog = execSync(
        'git log --no-color -200 --format="%h|%ai|%s|%I|%D"',
        { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] },
      )
    } catch {
      gitLog = ''
    }

    const result: AlmanacResult = buildAlmanacResult(gitLog, { verbose: flags.verbose })

    spinner.succeed(`Almanac: ${result.stats.totalCommits} commits, ${result.seasons.length} seasons, ${result.rhythms.length} rhythms`)

    const outputData = format === 'json' ? formatAlmanacJSON(result) : formatAlmanacTable(result)

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

export { buildAlmanacResult } from './almanac-helpers.js'
export type {
  AlmanacOptions,
  AlmanacResult,
  AlmanacStats,
  LogEntry,
  Prediction,
  Rhythm,
  Season,
} from './almanac-helpers.js'
export { formatAlmanacJSON, formatAlmanacTable } from './almanac-format-helpers.js'
