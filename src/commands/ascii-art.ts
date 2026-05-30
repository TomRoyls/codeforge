import { Args, Command, Flags } from '@oclif/core'
import chalk from 'chalk'
import ora from 'ora'

import {
  buildAsciiResult,
  centerText,
  type FontName,
} from './ascii-art-helpers.js'
import {
  colorize,
  formatAsciiJson,
  formatBanner,
} from './ascii-art-format-helpers.js'

/**
 * @example
 * codeforge ascii-art --font banner --color green
 */
export default class AsciiArt extends Command {
  static override args = {
    text: Args.string({ default: 'CODEFORGE', description: 'Text to render' }),
  }

  static override description = 'Generate ASCII art banner for the project'

  static override examples = [
    '<%= config.bin %> <%= command.id %> "HELLO"',
    '<%= config.bin %> <%= command.id %> --font block',
    '<%= config.bin %> <%= command.id %> --color "#ff0000" --width 120',
    '<%= config.bin %> <%= command.id %> --format json',
  ]

  static override flags = {
    color: Flags.string({ description: 'ANSI color name or hex (#ff0000) or rgb (255,0,0)', required: false }),
    font: Flags.string({ default: 'standard', description: 'Font: standard, simple, block, shadow, banner', options: ['standard', 'simple', 'block', 'shadow', 'banner'] }),
    format: Flags.string({ default: 'text', description: 'Output format', options: ['text', 'json'] }),
    output: Flags.string({ description: 'Output file path', required: false }),
    stats: Flags.boolean({ default: true, description: 'Show project stats' }),
    width: Flags.integer({ default: 80, description: 'Terminal width for centering' }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(AsciiArt)
    const spinner = ora('Generating ASCII art...').start()

    try {
      const config = {
        color: flags.color ?? '',
        font: flags.font as FontName,
        showStats: flags.stats,
        text: (args.text as string) ?? 'CODEFORGE',
        width: flags.width,
      }

      const result = await buildAsciiResult(this.config.root, config)

      if (flags.color) {
        result.banner = colorize(result.banner, flags.color)
      }

      result.banner = centerText(result.banner, config.width)

      const output = flags.format === 'json'
        ? formatAsciiJson(result)
        : formatBanner(result)

      spinner.succeed(chalk.green('ASCII art generated'))

      if (flags.output) {
        const { writeFile } = await import('node:fs/promises')
        await writeFile(String(flags.output), output, 'utf8')
        this.log(chalk.gray(`Written to ${String(flags.output)}`))
      } else {
        this.log(output)
      }
    } catch (error: unknown) {
      spinner.fail(chalk.red('Failed to generate ASCII art'))
      throw error
    }
  }
}
