import { Args, Command, Flags } from '@oclif/core'
import chalk from 'chalk'
import fg from 'fast-glob'
import fs from 'node:fs'
import ora from 'ora'

import {
  buildRubyPhoenixResult,
  type RubyPhoenixResult,
} from './ruby-phoenix-helpers.js'
import {
  formatResultTable,
  formatResultJson,
} from './ruby-phoenix-format-helpers.js'

/** @example codeforge ruby-phoenix ./src */
export default class RubyPhoenix extends Command {
  static override args = {
    path: Args.string({ default: '.', description: 'Path to analyze' }),
  }

  static override description = 'Ruby phoenix analysis — crimson-vitality/rebirth-quality/ash-wisdom/flame-precision/ember-resilience'

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

  /** @example RubyPhoenix.run() */
  public async run(): Promise<RubyPhoenixResult> {
    const { args, flags } = await this.parse(RubyPhoenix)
    const targetPath = args.path as string
    const spinner = ora('Analyzing ruby phoenix…').start()

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

      const result = await buildRubyPhoenixResult(files, contents)

      spinner.succeed('Ruby phoenix analysis complete')

      const outputData = flags.format === 'json'
        ? formatResultJson(result)
        : formatResultTable(result)

      if (flags.output) {
        try {
          fs.writeFileSync(flags.output, outputData, 'utf8')
          this.log(`Results written to ${flags.output}`)
        } catch (error: unknown) {
          this.error(`Failed to write output: ${error instanceof Error ? error.message : String(error)}`)
        }
      } else {
        this.log(outputData)
      }

      if (flags.verbose && flags.format !== 'json') {
        for (const feather of result.feathers) {
          this.log('')
          this.log(
            `  ${chalk.red(feather.file)}  ${chalk.dim(`condition=${feather.condition} score=${feather.qualityScore}`)}`,
          )
        }
      }

      return result
    } catch (error: unknown) {
      spinner.fail('Ruby phoenix analysis failed')
      throw error
    }
  }
}
