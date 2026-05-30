import { Command, Flags, Args } from '@oclif/core'
import chalk from 'chalk'
import fg from 'fast-glob'
import fs from 'node:fs'
import ora from 'ora'
import path from 'node:path'

import { buildCouplingResult } from './coupling-helpers.js'
import {
  formatCouplingCsv,
  formatCouplingJson,
  formatCouplingTable,
} from './coupling-format-helpers.js'

// ─── Command ──────────────────────────────────────────────────────────────────

export default class CouplingCommand extends Command {
  static override description = 'Analyze module coupling, cohesion, and dependency metrics'

  static override examples = [
    '<%= config.bin %> coupling',
    '<%= config.bin %> coupling src/',
    '<%= config.bin %> coupling --format json',
    '<%= config.bin %> coupling --verbose',
    '<%= config.bin %> coupling --threshold-afferent 10',
  ]

  static override flags = {
    format: Flags.string({
      description: 'Output format: table, json, csv',
      default: 'table',
      options: ['table', 'json', 'csv'],
    }),
    verbose: Flags.boolean({
      description: 'Show Martin diagram and detailed metrics',
      default: false,
    }),
    'threshold-afferent': Flags.integer({
      description: 'Threshold for high afferent coupling',
      default: 8,
    }),
    'threshold-efferent': Flags.integer({
      description: 'Threshold for high efferent coupling',
      default: 8,
    }),
    'cluster-min-size': Flags.integer({
      description: 'Minimum cluster size to report',
      default: 3,
    }),
    ext: Flags.string({
      description: 'File extensions to analyze (comma-separated)',
      default: '.ts,.tsx,.js,.jsx',
    }),
  }

  static override args = {
    path: Args.string({ description: 'Directory or file to analyze', default: '.' }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(CouplingCommand)

    const targetPath = args.path ?? '.'
    const extensions = flags.ext.split(',').map((e: string) => e.trim())
    const patterns = extensions.map((ext: string) => `**/*${ext}`)

    const spinner = ora('Analyzing module coupling...').start()

    try {
      const resolvedTarget = path.resolve(targetPath)

      if (!fs.existsSync(resolvedTarget)) {
        spinner.fail(`Path not found: ${targetPath}`)
        this.exit(1)
        return
      }

      const stat = fs.statSync(resolvedTarget)
      if (!stat.isDirectory()) {
        spinner.fail(`Not a directory: ${targetPath}`)
        this.exit(1)
        return
      }

      const allFiles = await fg(patterns, {
        cwd: resolvedTarget,
        absolute: true,
        ignore: ['**/node_modules/**', '**/dist/**', '**/.git/**', '**/coverage/**'],
      })

      if (allFiles.length === 0) {
        spinner.warn('No source files found')
        return
      }

      spinner.text = `Parsing ${allFiles.length} modules...`

      const fileContents = allFiles.map((f) => fs.readFileSync(f, 'utf-8'))

      spinner.text = 'Computing coupling metrics...'

      const threshold = Math.min(flags['threshold-afferent'], flags['threshold-efferent'])
      const result = buildCouplingResult(allFiles, fileContents, { threshold })

      spinner.succeed(`Analyzed ${result.stats.totalModules} modules with ${result.stats.totalEdges} dependency edges`)

      let output: string
      switch (flags.format) {
        case 'json':
          output = formatCouplingJson(result)
          break
        case 'csv':
          output = formatCouplingCsv(result)
          break
        default:
          output = formatCouplingTable(result, flags.verbose)
      }

      this.log(output)

      if (result.violations.length > 0) {
        const criticals = result.violations.filter((v) => v.severity === 'critical').length
        if (criticals > 0) {
          this.log(chalk.red(`\n⚠ ${criticals} critical coupling violation(s) detected`))
        }
      }

      if (result.violations.some((v) => v.severity === 'critical')) {
        this.exit(1)
      }
    } catch (error: unknown) {
      spinner.fail('Analysis failed')
      const message = error instanceof Error ? error.message : String(error)
      this.error(message)
    }
  }
}
