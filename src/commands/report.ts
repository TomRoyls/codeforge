import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import ora from 'ora'
import { resolve } from 'node:path'

import { discoverFiles } from '../core/file-discovery.js'
import { formatReportHtml, formatReportText } from './report-format-helpers.js'
import { buildFullReport, parseSections, type FileContent } from './report-helpers.js'

export default class Report extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to generate report for',
      required: false,
    }),
  }

  static override description = 'Generate a comprehensive codebase report'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Generate report for current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format html --output report.html',
      description: 'Generate HTML report for src directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --sections summary,complexity',
      description: 'Generate report with only summary and complexity sections',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format text --output report.txt',
      description: 'Save text report to file',
    },
    {
      command: '<%= config.bin %> <%= command.id %> -i "**/test/**" --verbose',
      description: 'Generate report ignoring test files with verbose output',
    },
  ]

  static override flags = {
    format: Flags.string({
      char: 'f',
      default: 'text',
      description: 'Output format (text or html)',
      options: ['html', 'text'],
    }),
    ignore: Flags.string({
      char: 'i',
      description: 'Patterns to ignore',
      multiple: true,
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output file path (required for html format)',
    }),
    sections: Flags.string({
      default: 'all',
      description: 'Sections to include (comma-separated: all,summary,files,complexity,todos,deps,suggestions)',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed output during generation',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Report)

    const targetPath = resolve(args.path as string)
    const format = flags.format as 'html' | 'text'

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    if (format === 'html' && !flags.output) {
      this.error('--output is required when using --format html', { exit: 1 })
    }

    const sections = parseSections(flags.sections)

    const spinner = ora('Discovering files...').start()

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
        '**/*.xml',
        '**/*.sql',
      ],
    })

    spinner.text = 'Reading files...'

    const fileContents: FileContent[] = []
    for (const file of discoveredFiles) {
      try {
        const content = await fs.readFile(file.absolutePath, 'utf8')
        const stat = await fs.stat(file.absolutePath)
        fileContents.push({ content, path: file.path, size: stat.size })
      } catch {
        if (flags.verbose) {
          this.warn(`Could not read file: ${file.path}`)
        }
      }
    }

    if (flags.verbose) {
      spinner.info(`Read ${fileContents.length} files`)
    }

    spinner.text = 'Building report...'

    const report = await buildFullReport(targetPath, fileContents, { sections })

    spinner.succeed(`Report generated for ${fileContents.length} files`)

    const outputData = format === 'html' ? formatReportHtml(report) : formatReportText(report)

    if (flags.output) {
      try {
        await fs.writeFile(flags.output, outputData, 'utf8')
        this.log(`Report written to ${flags.output}`)
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

export { buildFullReport, parseSections } from './report-helpers.js'
export { formatReportHtml, formatReportText } from './report-format-helpers.js'
export type { FileContent, FullReport, ReportOptions, ReportSection } from './report-helpers.js'
