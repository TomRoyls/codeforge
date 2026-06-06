import { Command, Flags, Args } from '@oclif/core'
import chalk from 'chalk'
import ora from 'ora'
import { discoverFiles } from '../core/file-discovery.js'
import { buildCoralResult } from './coral-helpers.js'
import { formatCoralTable, formatCoralJson } from './coral-format-helpers.js'

/**
 * Coral — code reef growth analysis
 * @example
 * codeforge coral ./src
 */
export default class Coral extends Command {
  static override description = 'Analyze codebase growth like a coral reef ecosystem'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze reef growth in the current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> src/',
      description: 'Analyze reef growth in the src directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --json',
      description: 'Output analysis results as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show all polyps and colonies in detail',
    },
  ]

  static override flags = {
    json: Flags.boolean({ char: 'j', default: false, description: 'Output as JSON' }),
    verbose: Flags.boolean({ char: 'v', default: false, description: 'Show all polyps and colonies' }),
  }

  static override args = {
    path: Args.string({ description: 'Path to analyze', default: '.' }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Coral)
    const spinner = ora('Scanning reef...').start()
    try {
      const files = await discoverFiles({ cwd: args.path, patterns: ['**/*'], ignore: [] })
      const contents = await Promise.all(
        files.map(f => import('fs').then(fs => fs.promises.readFile(f.absolutePath, 'utf-8'))),
      )
      const result = buildCoralResult(
        files.map(f => f.path),
        contents,
        flags,
      )
      spinner.succeed('Reef analysis complete')
      this.log(flags.json ? formatCoralJson(result) : formatCoralTable(result, flags.verbose))
    } catch (error) {
      spinner.fail('Analysis failed')
      this.error(chalk.red(String(error)))
    }
  }
}
