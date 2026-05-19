import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildHeartbeatResult, type HeartbeatResult } from './heartbeat-helpers.js'
import { formatHeartbeatJSON, formatHeartbeatTable } from './heartbeat-format-helpers.js'

export default class Heartbeat extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze',
      required: false,
    }),
  }

  static override description = 'Check project vital signs and health'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Check vital signs for current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Output vital signs as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show detailed vital information',
    },
  ]

  static override flags = {
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
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed vital information',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Heartbeat)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'

    const spinner = ora('Checking vital signs...').start()

    const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']

    const discoveredFiles = await discoverFiles({
      cwd: targetPath,
      ignore: defaultIgnore,
      patterns: [
        '**/*.ts',
        '**/*.tsx',
        '**/*.js',
        '**/*.jsx',
        '**/*.json',
      ],
    })

    const contents = await Promise.all(
      discoveredFiles.map(async (file) => {
        try {
          return await fs.readFile(file.absolutePath, 'utf8')
        } catch {
          return ''
        }
      }),
    )

    const result: HeartbeatResult = buildHeartbeatResult(
      discoveredFiles.map((f) => f.path),
      contents,
      { verbose: flags.verbose },
    )

    spinner.succeed(`Vitals: ${result.overallHealth.toUpperCase()} (score: ${result.healthScore})`)

    const outputData = format === 'json' ? formatHeartbeatJSON(result) : formatHeartbeatTable(result)

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

export { buildHeartbeatResult } from './heartbeat-helpers.js'
export type { HeartbeatResult, HeartbeatStats, OverallHealth, VitalSign, VitalStatus } from './heartbeat-helpers.js'
export { formatHeartbeatJSON, formatHeartbeatTable } from './heartbeat-format-helpers.js'
