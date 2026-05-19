import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'
import ora from 'ora'

import { buildEnvResult, type EnvOptions } from './env-helpers.js'
import { formatEnvJson, formatEnvTable } from './env-format-helpers.js'

/**
 * Analyze the development environment — tools, versions, compatibility.
 *
 * @example
 * ```sh
 * codeforge env
 * codeforge env --format json
 * codeforge env --check --verbose
 * ```
 */
export default class Env extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to project root',
      required: false,
    }),
  }

  static override description = 'Analyze development environment'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze current environment',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json',
      description: 'Output as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --check',
      description: 'Verify tool versions against project requirements',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show fix suggestions for issues',
    },
  ]

  static override flags = {
    check: Flags.boolean({
      char: 'c',
      default: false,
      description: 'Verify tool versions against project requirements',
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
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show fix suggestions for issues',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Env)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'

    const spinner = ora('Analyzing environment...').start()

    const options: EnvOptions = { check: flags.check, verbose: flags.verbose }

    const result = buildEnvResult(targetPath, options)

    spinner.succeed(`Environment score: ${result.score}/100`)

    const outputData =
      format === 'json'
        ? formatEnvJson(result)
        : formatEnvTable(result, flags.verbose)

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
