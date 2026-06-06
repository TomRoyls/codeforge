import { Command, Flags, Args } from '@oclif/core'
import chalk from 'chalk'
import ora from 'ora'
import { discoverFiles } from '../core/file-discovery.js'
import { buildAqueductResult } from './aqueduct-helpers.js'
import { formatAqueductTable, formatAqueductJson } from './aqueduct-format-helpers.js'

/**
 * Aqueduct — code data flow/channel analysis
 * @example
 * codeforge aqueduct ./src
 */
export default class Aqueduct extends Command {
  static override description = 'Analyze data flow through the codebase as an aqueduct system'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze data flow in the current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> src/',
      description: 'Analyze data flow in the src directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --json',
      description: 'Output analysis results as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show detailed output for all files',
    },
  ]

  static override flags = {
    json: Flags.boolean({ char: 'j', default: false, description: 'Output as JSON' }),
    verbose: Flags.boolean({ char: 'v', default: false, description: 'Show all files' }),
  }

  static override args = {
    path: Args.string({ description: 'Path to analyze', default: '.' }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Aqueduct)
    const spinner = ora('Mapping water channels...').start()
    try {
      const files = await discoverFiles({ cwd: args.path, patterns: ['**/*'], ignore: [] })
      const contents = await Promise.all(
        files.map(f => import('fs').then(fs => fs.promises.readFile(f.absolutePath, 'utf-8'))),
      )
      const result = buildAqueductResult(
        files.map(f => f.path),
        contents,
        flags,
      )
      spinner.succeed('Analysis complete')
      this.log(flags.json ? formatAqueductJson(result) : formatAqueductTable(result, flags.verbose))
    } catch (error) {
      spinner.fail('Analysis failed')
      this.error(chalk.red(String(error)))
    }
  }
}
