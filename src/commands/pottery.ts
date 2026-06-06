import { Command, Flags, Args } from '@oclif/core'
import chalk from 'chalk'
import ora from 'ora'
import { discoverFiles } from '../core/file-discovery.js'
import { buildPotteryResult } from './pottery-helpers.js'
import { formatPotteryTable, formatPotteryJson } from './pottery-format-helpers.js'

/**
 * Pottery — code shaping quality analysis
 * @example
 * codeforge pottery ./src
 */
export default class Pottery extends Command {
  static override description = 'Analyze code quality through pottery craftsmanship metaphors'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src',
      description: 'Analyze specific directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --json',
      description: 'Output as JSON',
    },
  ]

  static override flags = {
    json: Flags.boolean({ char: 'j', default: false, description: 'Output as JSON' }),
    verbose: Flags.boolean({ char: 'v', default: false, description: 'Show all pieces' }),
  }

  static override args = {
    path: Args.string({ description: 'Path to analyze', default: '.' }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Pottery)
    const spinner = ora('Shaping clay...').start()
    try {
      const files = await discoverFiles({ cwd: args.path, patterns: ['**/*'], ignore: [] })
      const contents = await Promise.all(
        files.map(f => import('fs').then(fs => fs.promises.readFile(f.absolutePath, 'utf-8'))),
      )
      const result = buildPotteryResult(
        files.map(f => f.path),
        contents,
        flags,
      )
      spinner.succeed('Analysis complete')
      this.log(flags.json ? formatPotteryJson(result) : formatPotteryTable(result, flags.verbose))
    } catch (error) {
      spinner.fail('Analysis failed')
      this.error(chalk.red(String(error)))
    }
  }
}
