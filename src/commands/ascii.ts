/**
 * @example
 * ```bash
 * codeforge ascii "Hello World"
 * codeforge ascii "CODE" --font thin --color green
 * codeforge ascii "V1.0" --border --comment --output banner.txt
 * ```
 */
import { Args, Command, Flags } from '@oclif/core'
import { writeFileSync } from 'node:fs'

import { formatAsciiOutput } from './ascii-format-helpers.js'
import { renderText } from './ascii-helpers.js'

export default class Ascii extends Command {
  static override args = {
    text: Args.string({
      description: 'Text to render as ASCII art',
      required: true,
    }),
  }

  static override description = 'Generate ASCII art banners from text'

  static override examples = [
    {
      command: '<%= config.bin %> ascii "Hello World"',
      description: 'Generate ASCII art banner with default settings',
    },
    {
      command: '<%= config.bin %> ascii "CODE" --font thin --color green',
      description: 'Use thin font with green color',
    },
    {
      command: '<%= config.bin %> ascii "V1.0" --shadow --border --comment',
      description: 'Shadow font with border and comment wrapping',
    },
    {
      command: '<%= config.bin %> ascii "README" --output banner.txt',
      description: 'Write banner to file',
    },
    {
      command: '<%= config.bin %> ascii "CLI" --width 40',
      description: 'Limit output width to 40 columns',
    },
  ]

  static override flags = {
    border: Flags.boolean({
      description: 'Add border around the banner',
    }),
    color: Flags.string({
      char: 'c',
      default: 'cyan',
      description: 'Text color',
      options: ['red', 'green', 'blue', 'yellow', 'cyan', 'magenta', 'white'],
    }),
    font: Flags.string({
      char: 'f',
      default: 'block',
      description: 'Font style for the ASCII art',
      options: ['block', 'thin', 'shadow'],
    }),
    'no-color': Flags.boolean({
      description: 'Disable color output',
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output file path',
    }),
    comment: Flags.boolean({
      description: 'Wrap output in a comment block',
    }),
    width: Flags.integer({
      char: 'w',
      default: 80,
      description: 'Maximum width in columns',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Ascii)

    const color = flags['no-color'] ? 'none' : (flags.color as string)

    const options = {
      border: flags.border,
      color,
      comment: flags.comment,
      font: flags.font as string,
      maxWidth: flags.width as number,
    }

    const result = renderText(args.text as string, options)
    const output = formatAsciiOutput(result, options)
    const text = output.join('\n')

    if (flags.output) {
      writeFileSync(flags.output as string, text + '\n', 'utf8')
      this.log(`Banner written to ${flags.output as string}`)
    } else {
      this.log(text)
    }
  }
}

export { renderText, measureWidth, getCharMap } from './ascii-helpers.js'
export type { AsciiOptions, AsciiResult } from './ascii-helpers.js'
export { colorize, addBorder, wrapInComment, formatAsciiOutput } from './ascii-format-helpers.js'
