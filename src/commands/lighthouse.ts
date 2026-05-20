import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildLighthouseResult, type LighthouseOptions, type LighthouseResult } from './lighthouse-helpers.js'
import { formatLighthouseJSON, formatLighthouseTable } from './lighthouse-format-helpers.js'

export default class Lighthouse extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to scan',
      required: false,
    }),
  }

  static override description = 'Run a lighthouse health scan on your codebase'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Scan current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Scan src directory as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show detailed audit info',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Scan only TypeScript files',
    },
  ]

  static override flags = {
    ext: Flags.string({
      default: '',
      description: 'Comma-separated file extensions to scan (e.g., ".ts,.tsx")',
    }),
    format: Flags.string({
      char: 'f',
      default: 'table',
      description: 'Output format',
      options: ['json', 'table'],
    }),
    ignore: Flags.string({
      char: 'i',
      description: 'Patterns to ignore',
      multiple: true,
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output file path',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed output',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Lighthouse)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'
    const options: LighthouseOptions = { verbose: flags.verbose }

    const spinner = ora('Scanning codebase...').start()

    const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']
    const ignore = flags.ignore ? [...defaultIgnore, ...flags.ignore] : defaultIgnore

    const discoveredFiles = await discoverFiles({
      cwd: targetPath,
      ignore,
      patterns: [
        '**/*.ts',
        '**/*.tsx',
        '**/*.js',
        '**/*.jsx',
        '**/*.json',
        '**/*.css',
        '**/*.html',
        '**/*.md',
        '**/*.py',
        '**/*.rs',
        '**/*.go',
        '**/*.java',
        '**/*.rb',
        '**/*.sh',
        '**/*.yaml',
        '**/*.yml',
      ],
    })

    const extensions = flags.ext
      ? flags.ext
          .split(',')
          .map((e) => e.trim())
          .filter(Boolean)
      : null

    const filteredFiles = extensions
      ? discoveredFiles.filter((f) => {
          const ext = extname(f.path).toLowerCase()
          return extensions.includes(ext)
        })
      : discoveredFiles

    spinner.text = 'Running lighthouse audits...'

    const files: string[] = []
    const contents: string[] = []

    for (const file of filteredFiles) {
      try {
        const content = await fs.readFile(file.absolutePath, 'utf8')
        files.push(file.path)
        contents.push(content)
      } catch {
        // skip unreadable files
      }
    }

    const result: LighthouseResult = buildLighthouseResult(files, contents, options)

    spinner.succeed(`Lighthouse scan complete — score: ${result.overallScore}/100 (${result.stats.healthGrade})`)

    const outputData = format === 'json' ? formatLighthouseJSON(result) : formatLighthouseTable(result)

    if (flags.output) {
      try {
        await fs.writeFile(flags.output, outputData, 'utf8')
        this.log(`Results written to ${flags.output}`)
      } catch (error) {
        this.error(
          `Failed to write output to ${flags.output}: ${error instanceof Error ? error.message : String(error)}`,
        )
      }
    } else {
      this.log(outputData)
    }
  }
}

export { buildLighthouseResult, computeHealthGrade, computeOverallScore, computeCategoryScore, runSafetyAudits, runMaintainabilityAudits, runPerformanceAudits, runCorrectnessAudits, runStyleAudits, detectDangerZones, findSafeHarbors, generateRecommendations, findMatchingBrace } from './lighthouse-helpers.js'
export type { Audit, DangerZone, DangerZoneType, LighthouseCategory, LighthouseOptions, LighthouseResult, LighthouseStats, SafeHarbor } from './lighthouse-helpers.js'
export { formatLighthouseJSON, formatLighthouseTable, formatScoreGauge, formatCategoryScores, formatAuditDetails, formatDangerZoneMap, formatSafeHarbors, formatLighthouseStats, formatGrade, formatRecommendations } from './lighthouse-format-helpers.js'
