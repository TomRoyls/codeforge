// ─── Imports ───────────────────────────────────────────────────────
import { Command, Flags } from '@oclif/core'
import fs from 'node:fs'
import path from 'node:path'
import {
  buildCoralReefResult,
  gatherFiles,
} from './coral-reef-helpers.js'
import {
  formatResultTable,
  formatResultJson,
} from './coral-reef-format-helpers.js'

// ─── Command ───────────────────────────────────────────────────────

/**
 * Analyze code like a coral reef ecosystem
 * @example
 * codeforge coral-reef ./src
 */
export default class CoralReef extends Command {
  static override description = 'Analyze code biodiversity, colony health, polyp strength, reef structure, and current resilience'

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
    const { args, flags } = await this.parse(CoralReef)
    const targetPath = args.path as string ?? '.'
    const exts = flags.ext?.flatMap(e => e.split(',').map(s => s.trim())) ?? []
    const ignore = flags.ignore?.flatMap(i => i.split(',').map(s => s.trim())) ?? []

    const ora = await import('ora')
    const spinner = ora.default('Analyzing coral polyps...').start()

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

      const result = await buildCoralReefResult(files, contents, { verbose: flags.verbose })

      spinner.succeed(`Analyzed ${result.stats.totalFiles} file(s) across ${result.stats.totalReefs} reef(s)`)

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
        this.log(`\nMarine Grade: ${result.stats.marineGrade}`)
        this.log(`Overall Health: ${result.stats.overallHealth}`)
      }
    } catch (error: unknown) {
      spinner.fail('Analysis failed')
      throw error
    }
  }
}
