import { Args, Command, Flags } from '@oclif/core'
import chalk from 'chalk'
import fg from 'fast-glob'
import fs from 'node:fs'
import ora from 'ora'

import {
  buildMidnightBlossomResult,
  type MidnightBlossomResult,
} from './midnight-blossom-helpers.js'
import {
  formatResultTable,
  formatResultJson,
} from './midnight-blossom-format-helpers.js'

/** @example codeforge midnight-blossom ./src */
export default class MidnightBlossom extends Command {
  static override args = {
    path: Args.string({ default: '.', description: 'Path to analyze' }),
  }

  static override description = 'Midnight blossom analysis — nocturnal-bloom/shadow-depth/moonlit-clarity/night-fragrance/dark-resilience'

  static override examples = [
    '<%= config.bin %> <%= command.id %> ./src',
    '<%= config.bin %> <%= command.id %> ./src --json',
    '<%= config.bin %> <%= command.id %> ./src --verbose',
  ]

  static override flags = {
    ext: Flags.string({
      default: '.ts',
      description: 'Comma-separated file extensions (e.g., ".ts,.tsx")',
    }),
    format: Flags.string({
      char: 'f',
      default: 'table',
      description: 'Output format',
      options: ['json', 'table'],
    }),
    help: Flags.help({ char: 'h' }),
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
      description: 'Verbose output',
    }),
  }

  /** @example MidnightBlossom.run() */
  public async run(): Promise<MidnightBlossomResult> {
    const { args, flags } = await this.parse(MidnightBlossom)
    const targetPath = args.path as string
    const spinner = ora('Analyzing midnight blossom…').start()

    try {
      const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/.git/**']
      const ignore = flags.ignore ? [...defaultIgnore, ...flags.ignore] : defaultIgnore

      const extensions = flags.ext.split(',').map((e: string) => e.trim()).filter(Boolean)
      const patterns = extensions.map((ext: string) => `**/*${ext}`)

      const entries = fg.sync(patterns, {
        absolute: true,
        cwd: targetPath,
        ignore,
      })

      const files = Array.from(new Set(entries))
      const contents = files.map((f: string) => {
        try {
          return fs.readFileSync(f, 'utf-8')
        } catch {
          return ''
        }
      })

      const result = await buildMidnightBlossomResult(files, contents)

      spinner.succeed('Midnight blossom analysis complete')

      const output = flags.format === 'json' ? formatResultJson(result) : formatResultTable(result)

      if (flags.output) {
        fs.writeFileSync(flags.output, output, 'utf-8')
        this.log(chalk.dim(`Output written to ${flags.output}`))
      } else {
        this.log(output)
      }

      if (flags.verbose) {
        this.log(chalk.dim(`\nAnalyzed ${files.length} files across ${result.gardens.length} gardens`))
      }

      return result
    } catch (error: unknown) {
      spinner.fail('Midnight blossom analysis failed')
      throw error
    }
  }
}
