import { Args, Command, Flags } from '@oclif/core'
import chalk from 'chalk'
import fg from 'fast-glob'
import fs from 'node:fs'
import ora from 'ora'

import {
  buildSapphireTideResult,
  type SapphireTideResult,
} from './sapphire-tide-helpers.js'
import {
  formatResultTable,
  formatResultJson,
} from './sapphire-tide-format-helpers.js'

/** @example codeforge sapphire-tide ./src */
export default class SapphireTide extends Command {
  static override args = {
    path: Args.string({ default: '.', description: 'Path to analyze' }),
  }

  static override description = 'Sapphire tide analysis — gem-depth/tidal-rhythm/wave-purity/ocean-wisdom/tide-resilience ★ MILESTONE #560 ★'

  static override examples = [
    '<%= config.bin %> <%= command.id %> ./src',
    '<%= config.bin %> <%= command.id %> ./src --json',
    '<%= config.bin %> <%= command.id %> ./src --verbose',
  ]

  static override flags = {
    help: Flags.help({ char: 'h' }),
    json: Flags.boolean({ char: 'j', default: false, description: 'Output as JSON' }),
    verbose: Flags.boolean({ char: 'v', default: false, description: 'Verbose output' }),
  }

  /** @example SapphireTide.run() */
  public async run(): Promise<SapphireTideResult> {
    const { args, flags } = await this.parse(SapphireTide)
    const targetPath = args.path as string
    const spinner = ora('Analyzing sapphire tide…').start()

    try {
      const entries = fg.sync('**/*.ts', {
        absolute: true,
        cwd: targetPath,
        ignore: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
      })

      const files = Array.from(new Set(entries))
      const contents = files.map((f: string) => {
        try {
          return fs.readFileSync(f, 'utf-8')
        } catch {
          return ''
        }
      })

      const result = await buildSapphireTideResult(files, contents)

      spinner.succeed('Sapphire tide analysis complete')

      if (flags.json) {
        this.log(formatResultJson(result))
      } else {
        this.log(formatResultTable(result))
        if (flags.verbose) {
          for (const wave of result.waves) {
            this.log('')
            this.log(
              `  ${chalk.cyan(wave.file)}  ${chalk.dim(`condition=${wave.condition} score=${wave.qualityScore}`)}`,
            )
          }
        }
      }

      return result
    } catch (error: unknown) {
      spinner.fail('Sapphire tide analysis failed')
      throw error
    }
  }
}
