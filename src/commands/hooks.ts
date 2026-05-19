import { Command, Flags } from '@oclif/core'
import * as fs from 'node:fs/promises'

import ora from 'ora'

import { buildHooksResult, type HooksResult } from './hooks-helpers.js'
import { formatHooksJson, formatHooksTable } from './hooks-format-helpers.js'

export default class Hooks extends Command {
  static override description = 'Analyze git hooks configuration'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze hooks in current repository',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json',
      description: 'Output hooks analysis as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show hook script contents',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json --output hooks.json',
      description: 'Export hooks analysis to JSON file',
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
      description: 'Show hook script contents',
    }),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(Hooks)

    const format = flags.format as 'json' | 'table'
    const { verbose } = flags

    const spinner = ora('Analyzing git hooks...').start()

    let result: HooksResult
    try {
      result = await buildHooksResult(process.cwd())
    } catch (error) {
      spinner.fail('Failed to analyze git hooks')
      this.error(
        error instanceof Error ? error.message : String(error),
        { exit: 1 },
      )
    }

    spinner.succeed(
      `Found ${result.installedHooks} installed hooks (${result.totalHooks} possible)`,
    )

    const outputData =
      format === 'json'
        ? formatHooksJson(result)
        : formatHooksTable(result, verbose)

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

export { buildHooksResult } from './hooks-helpers.js'
export type { HookInfo, HookIssue, HooksResult } from './hooks-helpers.js'
export { formatHooksJson, formatHooksTable } from './hooks-format-helpers.js'
