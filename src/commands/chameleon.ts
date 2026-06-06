import { Command, Flags, Args } from '@oclif/core'
import chalk from 'chalk'
import ora from 'ora'
import { discoverFiles } from '../core/file-discovery.js'
import { buildChameleonResult } from './chameleon-helpers.js'
import { formatChameleonTable, formatChameleonJson } from './chameleon-format-helpers.js'

/**
 * Chameleon — code adaptability analysis
 * @example
 * codeforge chameleon ./src
 */
export default class Chameleon extends Command {
  static override description = 'Analyze codebase adaptability and flexibility'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze adaptability of the current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> src/',
      description: 'Analyze adaptability of the src directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --json',
      description: 'Output analysis results as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show all rigid points in detail',
    },
  ]

  static override flags = {
    json: Flags.boolean({ char: 'j', default: false, description: 'Output as JSON' }),
    verbose: Flags.boolean({ char: 'v', default: false, description: 'Show all rigid points' }),
  }

  static override args = {
    path: Args.string({ description: 'Path to analyze', default: '.' }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Chameleon)
    const spinner = ora('Analyzing adaptability...').start()
    try {
      const files = await discoverFiles({ cwd: args.path, patterns: ['**/*'], ignore: [] })
      const contents = await Promise.all(
        files.map(f => import('fs').then(fs => fs.promises.readFile(f.absolutePath, 'utf-8'))),
      )
      const result = buildChameleonResult(
        files.map(f => f.path),
        contents,
        flags,
      )
      spinner.succeed('Adaptability analysis complete')
      this.log(flags.json ? formatChameleonJson(result) : formatChameleonTable(result, flags.verbose))
    } catch (error) {
      spinner.fail('Analysis failed')
      this.error(chalk.red(String(error)))
    }
  }
}
