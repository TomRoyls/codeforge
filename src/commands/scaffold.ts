import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { basename, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildScaffoldResult, type ScaffoldResult } from './scaffold-helpers.js'
import { formatScaffoldCsv, formatScaffoldJson, formatScaffoldResultTable } from './scaffold-format-helpers.js'

export default class Scaffold extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze project structure',
      required: false,
    }),
  }

  static override description = 'Analyze project scaffolding and structure health'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze current project structure',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src',
      description: 'Analyze a specific directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json',
      description: 'Output as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show detailed analysis',
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
      options: ['csv', 'json', 'table'],
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
      description: 'Show detailed analysis',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Scaffold)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'csv' | 'json' | 'table'
    const { verbose } = flags
    const projectName = basename(targetPath)

    const spinner = ora('Discovering files...').start()

    const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']
    const ignore = flags.ignore ? [...defaultIgnore, ...flags.ignore] : defaultIgnore

    const discoveredFiles = await discoverFiles({
      cwd: targetPath,
      ignore,
      patterns: ['**/*'],
    })

    const extensions = flags.ext
      ? flags.ext.split(',').map((e) => e.trim()).filter(Boolean)
      : null

    const filteredFiles = extensions
      ? discoveredFiles.filter((f) => {
          const ext = '.' + f.path.split('.').pop()
          return extensions.includes(ext!)
        })
      : discoveredFiles

    spinner.text = 'Analyzing project structure...'

    const filePaths = filteredFiles.map((f) => f.path)

    const result: ScaffoldResult = buildScaffoldResult(projectName, filePaths, { verbose })

    spinner.succeed(`Health score: ${result.stats.healthScore}/100 (${result.stats.grade})`)

    const outputData =
      format === 'json'
        ? formatScaffoldJson(result)
        : format === 'csv'
          ? formatScaffoldCsv(result)
          : formatScaffoldResultTable(result, verbose)

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

export { buildScaffoldResult, detectProjectType, checkEssentialFiles, analyzeDirectoryStructure, checkDirectoryDepth, findEmptyDirectories, inferDirectoryPurpose, runStructureChecks, computeHealthScore, computeGrade, computeStructureStats, generateRecommendations } from './scaffold-helpers.js'
export type { ScaffoldResult, ProjectFile, DirectoryStructure, StructureCheck, ScaffoldStats, ScaffoldOptions } from './scaffold-helpers.js'
export { formatScaffoldCsv, formatScaffoldJson, formatScaffoldResultTable, formatFileChecklist, formatDirectoryTree, formatChecksSummary, formatHealthGauge, formatMissingFiles, formatStatsLine } from './scaffold-format-helpers.js'
