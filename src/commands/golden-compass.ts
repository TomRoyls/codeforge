// ─── Imports ───────────────────────────────────────────────────────
import { Command, Flags } from '@oclif/core'
import fg from 'fast-glob'
import ora from 'ora'
import {
  buildGoldenCompassResult,
  computeRevealing,
  computeAligning,
  computeGuiding,
  computeVirtueing,
  computeConvicting,
  classifyNeedleCondition,
  classifyScholarGrade,
} from './golden-compass-helpers.js'
import {
  formatResultTable,
  formatResultJson,
} from './golden-compass-format-helpers.js'

/**
 * @example
 * codeforge golden-compass ./src
 */
export default class GoldenCompass extends Command {
  static override description = 'Analyze code moral-clarity, bearing-truth, navigation-wisdom, cardinal-virtue, and needle-conviction'

  static override flags = {
    json: Flags.boolean({ char: 'j', description: 'Output as JSON', default: false }),
    glob: Flags.string({ char: 'g', description: 'Glob pattern for files', default: '**/*.ts' }),
  }

  static override args = [{ name: 'path', description: 'Directory to analyze', required: true }]

  async run(): Promise<void> {
    const { args, flags } = await this.parse(GoldenCompass)
    const spinner = ora('Reading golden compass...').start()

    try {
      const files = await fg(flags.glob, { cwd: args.path, absolute: true, ignore: ['**/node_modules/**'] })
      if (files.length === 0) {
        spinner.warn('No files found')
        return
      }

      const contents: string[] = []
      for (const file of files) {
        const fs = await import('node:fs')
        contents.push(fs.readFileSync(file, 'utf-8'))
      }

      spinner.text = 'Computing golden compass analysis...'
      const result = buildGoldenCompassResult(
        Array.from(files),
        contents,
        { glob: flags.glob },
      )
      spinner.succeed('Golden compass analysis complete')

      this.log(flags.json ? formatResultJson(result) : formatResultTable(result))
    } catch (error) {
      spinner.fail('Golden compass analysis failed')
      this.error(String(error))
    }
  }
}
