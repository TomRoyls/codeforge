import { Command, Flags } from '@oclif/core'
import chalk from 'chalk'
import ora from 'ora'
import { discoverFiles } from '../core/file-discovery.js'
import { buildTelescopeLensResult } from './telescope-lens-helpers.js'
import { formatTelescopeLensTable, formatTelescopeLensJson } from './telescope-lens-format-helpers.js'

/**
 * Telescope Lens — code zoom/focus depth analysis
 * @example
 * codeforge telescope-lens ./src
 */
export default class TelescopeLens extends Command {
  static override description = 'Analyze code at different zoom levels like adjusting a telescope lens'

  static override flags = {
    json: Flags.boolean({ char: 'j', default: false, description: 'Output as JSON' }),
    verbose: Flags.boolean({ char: 'v', default: false, description: 'Show all reports' }),
  }

  static override args = [{ name: 'path', description: 'Path to analyze', default: '.' }]

  async run(): Promise<void> {
    const { args, flags } = await this.parse(TelescopeLens)
    const spinner = ora('Adjusting lens focus...').start()
    try {
      const files = await discoverFiles(args.path)
      const contents = await Promise.all(
        files.map(f => import('fs').then(fs => fs.promises.readFile(f.absolutePath, 'utf-8'))),
      )
      const result = buildTelescopeLensResult(
        files.map(f => f.path),
        contents,
        flags,
      )
      spinner.succeed('Analysis complete')
      this.log(flags.json ? formatTelescopeLensJson(result) : formatTelescopeLensTable(result, flags.verbose))
    } catch (error) {
      spinner.fail('Analysis failed')
      this.error(chalk.red(String(error)))
    }
  }
}
