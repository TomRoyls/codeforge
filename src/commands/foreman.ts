import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildForemanResult, type ConstructionReport, type ForemanOptions } from './foreman-helpers.js'
import { formatForemanJSON, formatForemanTable } from './foreman-format-helpers.js'

export default class Foreman extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to inspect',
      required: false,
    }),
  }

  static override description = 'Inspect codebase construction quality'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Inspect current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Inspect src directory as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show detailed inspection',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Inspect only TypeScript files',
    },
  ]

  static override flags = {
    ext: Flags.string({
      default: '',
      description: 'Comma-separated file extensions to inspect (e.g., ".ts,.tsx")',
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
    const { args, flags } = await this.parse(Foreman)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'
    const options: ForemanOptions = { verbose: flags.verbose }

    const spinner = ora('Dispatching inspectors...').start()

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

    spinner.text = 'Inspecting construction site...'

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

    const result: ConstructionReport = buildForemanResult(files, contents, options)

    spinner.succeed(`Inspection complete — grade ${result.overallGrade} with ${result.stats.totalViolations} violations`)

    const outputData = format === 'json' ? formatForemanJSON(result) : formatForemanTable(result)

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

export { buildForemanResult, inspectFoundation, inspectFraming, inspectPlumbing, inspectElectrical, inspectFinishing, inspectRoofing, computeGrade, computeAreaScore, estimateFixTime, generateForemanRecommendations, findLine } from './foreman-helpers.js'
export type { Severity, Violation, InspectionArea, ForemanStats, ConstructionReport, ForemanOptions } from './foreman-helpers.js'
export { formatForemanJSON, formatForemanTable, formatReportCard, formatViolationTable, formatPassRateMeter, formatFixQueue, formatForemanStats, formatForemanRecommendations, getGradeColor, getSeverityColor } from './foreman-format-helpers.js'
