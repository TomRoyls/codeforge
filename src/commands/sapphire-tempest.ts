import { Args, Command, Flags } from '@oclif/core'
import chalk from 'chalk'
import fg from 'fast-glob'
import fs from 'node:fs'
import ora from 'ora'

import {
  buildSapphireStormResult,
  type SapphireStormResult,
} from './sapphire-tempest-helpers.js'
import {
  formatResultTable,
  formatResultJson,
} from './sapphire-tempest-format-helpers.js'

/** @example codeforge sapphire-tempest ./src */
export default class SapphireTempest extends Command {
  static override args = {
    path: Args.string({ default: '.', description: 'Path to analyze' }),
  }

  static override description = 'Sapphire tempest analysis — gem-fury/strike-precision/lightning-clarity/thunder-resilience/rain-wisdom'

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

  /** @example SapphireTempest.run() */
  public async run(): Promise<SapphireStormResult> {
    const { args, flags } = await this.parse(SapphireTempest)
    const targetPath = args.path as string
    const spinner = ora('Analyzing sapphire tempest…').start()

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

      const result = await buildSapphireStormResult(files, contents)

      spinner.succeed('Sapphire tempest analysis complete')

      const output = flags.format === 'json' ? formatResultJson(result) : formatResultTable(result)

      if (flags.output) {
        fs.writeFileSync(flags.output, output, 'utf-8')
        this.log(chalk.dim(`Output written to ${flags.output}`))
      } else {
        this.log(output)
      }

      if (flags.verbose) {
        this.log(chalk.dim(`\nAnalyzed ${files.length} files across ${result.clouds.length} clouds`))
      }

      return result
    } catch (error: unknown) {
      spinner.fail('Sapphire tempest analysis failed')
      throw error
    }
  }
}
