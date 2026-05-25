import { Args, Command, Flags } from '@oclif/core'
import chalk from 'chalk'
import fg from 'fast-glob'
import fs from 'node:fs'
import ora from 'ora'

import {
  buildEmeraldDawnResult,
  type EmeraldDawnResult,
} from './emerald-dawn-helpers.js'
import {
  formatResultTable,
  formatResultJson,
} from './emerald-dawn-format-helpers.js'

/** @example codeforge emerald-dawn ./src */
export default class EmeraldDawn extends Command {
  static override args = {
    path: Args.string({ default: '.', description: 'Path to analyze' }),
  }

  static override description = 'Emerald dawn analysis — green-vitality/dawn-clarity/gem-wisdom/morning-freshness/sunrise-resilience'

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

  /** @example EmeraldDawn.run() */
  public async run(): Promise<EmeraldDawnResult> {
    const { args, flags } = await this.parse(EmeraldDawn)
    const targetPath = args.path as string
    const spinner = ora('Analyzing emerald dawn…').start()

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

      const result = await buildEmeraldDawnResult(files, contents)

      spinner.succeed('Emerald dawn analysis complete')

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
        for (const ray of result.rays) {
          this.log('')
          this.log(
            `  ${chalk.green(ray.file)}  ${chalk.dim(`condition=${ray.condition} score=${ray.qualityScore}`)}`,
          )
        }
      }

      return result
    } catch (error: unknown) {
      spinner.fail('Emerald dawn analysis failed')
      throw error
    }
  }
}
