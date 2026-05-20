import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildKaleidoscopeScopeResult, type KaleidoscopeScopeOptions } from './kaleidoscope-scope-helpers.js'
import { formatKaleidoscopeScopeJson, formatKaleidoscopeScopeTable } from './kaleidoscope-scope-format-helpers.js'

export default class KaleidoscopeScope extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze scope patterns',
      required: false,
    }),
  }

  static override description = 'Analyze codebase scope and visibility patterns through a kaleidoscope lens'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze scope patterns in current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Analyze src directory as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Analyze TypeScript files only',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show detailed scope analysis',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json --output scope.json',
      description: 'Export analysis to JSON file',
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
      description: 'Show detailed output',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(KaleidoscopeScope)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'
    const verbose = flags.verbose

    const spinner = ora('Analyzing scope patterns...').start()

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

    spinner.text = 'Parsing scope layers...'

    const contents = await Promise.all(
      filteredFiles.map(async (file) => {
        try {
          return await fs.readFile(file.absolutePath, 'utf8')
        } catch {
          return ''
        }
      }),
    )

    const files = filteredFiles.map((f) => f.path)
    const options: KaleidoscopeScopeOptions = { verbose, format, output: flags.output, ignore }

    const result = buildKaleidoscopeScopeResult(files, contents, options)

    spinner.succeed(`Analyzed ${files.length} files — scope health: ${result.stats.scopeHealth}`)

    const outputData = format === 'json' ? formatKaleidoscopeScopeJson(result) : formatKaleidoscopeScopeTable(result)

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

export { buildKaleidoscopeScopeResult } from './kaleidoscope-scope-helpers.js'
export type {
  DeclKind,
  IssueSeverity,
  IssueType,
  KaleidoscopeScopeOptions,
  KaleidoscopeScopeResult,
  KaleidoscopeScopeStats,
  ScopeDeclaration,
  ScopeFile,
  ScopeHealth,
  ScopeIssue,
  ScopeLayer,
  ScopeLayerType,
  ScopePattern,
  ScopePatternName,
  ScopeType,
  Visibility,
} from './kaleidoscope-scope-helpers.js'
export {
  formatHealthLabel,
  formatIssuesTable,
  formatKaleidoscopeScopeJson,
  formatKaleidoscopeScopeStats,
  formatKaleidoscopeScopeTable,
  formatPatterns,
  formatPatternLabel,
  formatRecommendations,
  formatScopeGauge,
  formatScopeTree,
  formatSeverity,
} from './kaleidoscope-scope-format-helpers.js'
