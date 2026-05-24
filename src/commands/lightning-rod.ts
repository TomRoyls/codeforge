// ─── Imports ───────────────────────────────────────────────────────
import { Command, Flags } from '@oclif/core'
import fs from 'node:fs'
import path from 'node:path'
import {
  buildLightningRodResult,
  gatherFiles,
} from './lightning-rod-helpers.js'
import {
  formatResultTable,
  formatResultJson,
} from './lightning-rod-format-helpers.js'

// ─── Command ───────────────────────────────────────────────────────

/**
 * Analyze code like a lightning rod system
 * @example
 * codeforge lightning-rod ./src
 */
export default class LightningRod extends Command {
  static override description = 'Analyze code conduction, groundedness, spark quality, surge protection, and voltage stability'

  static override examples = [
    '<%= config.bin %> <%= command.id %> ./src',
    '<%= config.bin %> <%= command.id %> ./src --format json',
    '<%= config.bin %> <%= command.id %> ./src --verbose',
  ]

  static override flags = {
    format: Flags.string({ default: 'table', description: 'Output format (table or json)', options: ['table', 'json'] }),
    output: Flags.string({ description: 'Output file path' }),
    ignore: Flags.string({ description: 'Comma-separated ignore patterns', multiple: true }),
    ext: Flags.string({ description: 'Comma-separated file extensions', multiple: true }),
    verbose: Flags.boolean({ default: false, description: 'Show verbose output' }),
  }

  static override args = [{ name: 'path', description: 'Path to analyze', default: '.' }]

  async run(): Promise<void> {
    const { args, flags } = await this.parse(LightningRod)
    const targetPath = args.path as string ?? '.'
    const exts = flags.ext?.flatMap(e => e.split(',').map(s => s.trim())) ?? []
    const ignore = flags.ignore?.flatMap(i => i.split(',').map(s => s.trim())) ?? []

    const ora = await import('ora')
    const spinner = ora.default('Analyzing electrical rods...').start()

    try {
      const files = await gatherFiles(targetPath, exts, ignore)

      if (files.length === 0) {
        spinner.warn('No files found to analyze')
        return
      }

      spinner.text = `Analyzing ${files.length} file(s)...`

      const contents = files.map(f => {
        try {
          return fs.readFileSync(f, 'utf-8')
        } catch {
          return ''
        }
      })

      const result = await buildLightningRodResult(files, contents, { verbose: flags.verbose })

      spinner.succeed(`Analyzed ${result.stats.totalFiles} file(s) across ${result.stats.totalGrids} grid(s)`)

      const output = flags.format === 'json'
        ? formatResultJson(result)
        : formatResultTable(result)

      if (flags.output) {
        const outputPath = flags.output
        const outputDir = path.dirname(outputPath)
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true })
        }
        fs.writeFileSync(outputPath, output, 'utf-8')
        this.log(`Results written to ${outputPath}`)
      } else {
        this.log(output)
      }

      if (flags.verbose) {
        this.log(`\nEngineer Grade: ${result.stats.engineerGrade}`)
        this.log(`Overall Power: ${result.stats.overallPower}`)
      }
    } catch (error: unknown) {
      spinner.fail('Analysis failed')
      throw error
    }
  }
}
