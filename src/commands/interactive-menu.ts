import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'
import ora from 'ora'

import { buildInteractiveResult, type InteractiveMenuOptions } from './interactive-menu-helpers.js'
import { formatMenuForDisplay, formatMenuJson, formatQuickRef } from './interactive-menu-format-helpers.js'

/**
 * Interactive menu-based command launcher with categorized command listing.
 *
 * @example
 * ```sh
 * codeforge interactive-menu
 * codeforge interactive-menu --format json
 * codeforge interactive-menu --quick-ref
 * ```
 */
export default class InteractiveMenu extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to project root',
      required: false,
    }),
  }

  static override description = 'Interactive menu-based command launcher'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Show interactive command menu',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json',
      description: 'Output command list as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --quick-ref',
      description: 'Show quick reference table',
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
    'quick-ref': Flags.boolean({
      char: 'q',
      default: false,
      description: 'Show quick reference table',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(InteractiveMenu)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'

    const spinner = ora('Building command menu...').start()

    const options: InteractiveMenuOptions = { format }
    const result = buildInteractiveResult(targetPath, options)

    spinner.succeed(`Found ${result.menu.totalCommands} commands in ${result.menu.totalCategories} categories`)

    let outputData: string
    if (flags['quick-ref']) {
      const allEntries = result.menu.categories.flatMap((c) => c.commands)
      outputData = formatQuickRef(allEntries)
    } else if (format === 'json') {
      outputData = formatMenuJson(result)
    } else {
      outputData = formatMenuForDisplay(result.menu)
    }

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
