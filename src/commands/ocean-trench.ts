// ─── Imports ───────────────────────────────────────────────────────
import { Command, Flags } from '@oclif/core'
import fs from 'node:fs'
import path from 'node:path'
import { buildOceanTrenchResult, gatherFiles } from './ocean-trench-helpers.js'
import { formatResultTable, formatResultJson } from './ocean-trench-format-helpers.js'

// ─── Command ───────────────────────────────────────────────────────

/**
 * Analyze code like exploring ocean trenches
 * @example
 * codeforge ocean-trench ./src
 */
export default class OceanTrench extends Command {
  static override description = 'Analyze code depth, pressure resilience, bioluminescence, current mapping, and abyssal quality'

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
    const { args, flags } = await this.parse(OceanTrench)
    const targetPath = args.path as string ?? '.'
    const exts = flags.ext?.flatMap(e => e.split(',').map(s => s.trim())) ?? []
    const ignore = flags.ignore?.flatMap(i => i.split(',').map(s => s.trim())) ?? []

    const ora = await import('ora')
    const spinner = ora.default('Diving into ocean trenches...').start()

    try {
      const files = await gatherFiles(targetPath, exts, ignore)
      if (files.length === 0) { spinner.warn('No files found to analyze'); return }

      spinner.text = `Analyzing ${files.length} file(s)...`
      const contents = files.map(f => { try { return fs.readFileSync(f, 'utf-8') } catch { return '' } })
      const result = await buildOceanTrenchResult(files, contents, { verbose: flags.verbose })
      spinner.succeed(`Analyzed ${result.stats.totalFiles} file(s) across ${result.stats.totalTrenches} trench(es)`)

      const output = flags.format === 'json' ? formatResultJson(result) : formatResultTable(result)
      if (flags.output) {
        const outputDir = path.dirname(flags.output)
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })
        fs.writeFileSync(flags.output, output, 'utf-8')
        this.log(`Results written to ${flags.output}`)
      } else { this.log(output) }

      if (flags.verbose) {
        this.log(`\nExplorer Grade: ${result.stats.explorerGrade}`)
        this.log(`Overall Depth: ${result.stats.overallDepth}`)
      }
    } catch (error: unknown) { spinner.fail('Analysis failed'); throw error }
  }
}
