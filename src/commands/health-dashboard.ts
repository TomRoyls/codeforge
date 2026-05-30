import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildHealthReport, type HealthReport } from './health-dashboard-helpers.js'
import { formatHealthJson, formatHealthReport } from './health-dashboard-format-helpers.js'

export default class HealthDashboard extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze for project health',
      required: false,
    }),
  }

  static override description = 'Comprehensive project health dashboard'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Show health dashboard for current project',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src',
      description: 'Show health dashboard for src directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json',
      description: 'Output health report as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Analyze only TypeScript files',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show detailed findings per dimension',
    },
  ]

  static override flags = {
    ext: Flags.string({
      default: '',
      description: 'Comma-separated file extensions to analyze (e.g., ".ts,.tsx")',
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
      description: 'Show detailed findings',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(HealthDashboard)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'

    const spinner = ora('Analyzing project health...').start()

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
        '**/*.md',
        '**/*.lock',
      ],
    })

    const extensions = flags.ext
      ? flags.ext.split(',').map((e) => e.trim()).filter(Boolean)
      : null

    const filteredFiles = extensions
      ? discoveredFiles.filter((f) => {
          const ext = extname(f.path).toLowerCase()
          return extensions.includes(ext)
        })
      : discoveredFiles

    const fileNames = filteredFiles.map((f) => f.path)

    const contents: Record<string, string> = {}
    for (const file of filteredFiles) {
      try {
        contents[file.path] = await fs.readFile(file.absolutePath, 'utf8')
      } catch {
        continue
      }
    }

    const report: HealthReport = await buildHealthReport(fileNames, contents, {
      verbose: flags.verbose,
    })

    spinner.succeed(
      `Health: ${report.grade} (${report.overall}%) — ${report.dimensions.length} dimensions analyzed`,
    )

    const outputData = format === 'json' ? formatHealthJson(report) : formatHealthReport(report)

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

export { assessCodeQuality, assessDependencyHealth, assessDocumentationHealth, assessPerformanceHealth, assessSecurityHealth, assessTestHealth, buildHealthReport, computeOverallHealth, generatePriorityActions, scoreToGrade } from './health-dashboard-helpers.js'
export type { Grade, HealthAction, HealthDimension, HealthOptions, HealthReport } from './health-dashboard-helpers.js'
export { buildScoreBar, colorGrade, formatActions, formatDimension, formatHealthJson, formatHealthReport } from './health-dashboard-format-helpers.js'
