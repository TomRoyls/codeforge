// ─── Imports ───────────────────────────────────────────────────────
import { Command, Flags } from '@oclif/core'
import fg from 'fast-glob'
import ora from 'ora'
import {
  buildDiamondHorizonResult,
  gatherFiles,
} from './diamond-horizon-helpers.js'
import {
  formatResultTable,
  formatResultJson,
} from './diamond-horizon-format-helpers.js'

/**
 * @example
 * codeforge diamond-horizon ./src
 */
export default class DiamondHorizon extends Command {
  static override description = 'Analyze code hardness-clarity, cut-precision, fire-dispersion, brilliance-quality, and carat-substance (MILESTONE #520)'

  static override flags = {
    format: Flags.string({
      char: 'f',
      default: 'table',
      description: 'Output format',
      options: ['json', 'table'],
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output file path',
    }),
    ignore: Flags.string({
      char: 'i',
      description: 'Patterns to ignore',
      multiple: true,
    }),
    ext: Flags.string({
      description: 'Comma-separated file extensions (e.g., ".ts,.tsx")',
      default: '',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed output',
    }),
  }

  static override args = [{ name: 'path', description: 'Directory to analyze', required: true }]

  async run(): Promise<void> {
    const { args, flags } = await this.parse(DiamondHorizon)
    const spinner = ora('Scanning diamond horizon...').start()

    try {
      const extensions = flags.ext
        ? flags.ext.split(',').map((e: string) => e.trim()).filter(Boolean)
        : []
      const ignorePatterns = flags.ignore
        ? [...flags.ignore, '**/node_modules/**']
        : ['**/node_modules/**']

      const files = extensions.length > 0
        ? await gatherFiles(args.path, extensions, ignorePatterns)
        : await fg('**/*.ts', { cwd: args.path, absolute: true, ignore: ignorePatterns })

      if (files.length === 0) {
        spinner.warn('No files found')
        return
      }

      const contents: string[] = []
      for (const file of files) {
        const fs = await import('node:fs')
        contents.push(fs.readFileSync(file, 'utf-8'))
      }

      spinner.text = 'Computing diamond horizon analysis...'
      const result = await buildDiamondHorizonResult(
        Array.from(files),
        contents,
        { ext: flags.ext, verbose: flags.verbose },
      )
      spinner.succeed('Diamond horizon analysis complete')

      const outputData = flags.format === 'json'
        ? formatResultJson(result)
        : formatResultTable(result)

      if (flags.output) {
        const nodeFs = await import('node:fs/promises')
        await nodeFs.writeFile(flags.output, outputData, 'utf8')
        this.log(`Results written to ${flags.output}`)
      } else {
        this.log(outputData)
      }
    } catch (error) {
      spinner.fail('Diamond horizon analysis failed')
      this.error(String(error))
    }
  }
}
