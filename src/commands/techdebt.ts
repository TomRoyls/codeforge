import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildDebtScore } from './techdebt-helpers.js'
import { formatDebtJson, formatDebtTable } from './techdebt-format-helpers.js'

export default class TechDebt extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to assess for technical debt',
      required: false,
    }),
  }

  static override description = 'Track and score technical debt in your codebase'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Assess technical debt in current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Assess debt in src directory with JSON output',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Assess debt for TypeScript files only',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ignore "**/test/**"',
      description: 'Ignore test directory in assessment',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show all debt items per category',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json --output debt.json',
      description: 'Export debt report to JSON file',
    },
  ]

  static override flags = {
    ext: Flags.string({
      char: 'e',
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
      description: 'Show detailed debt items per category',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(TechDebt)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'
    const { verbose } = flags

    const spinner = ora('Scanning for technical debt...').start()

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

    spinner.text = `Analyzing ${filteredFiles.length} files...`

    const contents = new Map<string, string>()
    await Promise.all(
      filteredFiles.map(async (file) => {
        try {
          const content = await fs.readFile(file.absolutePath, 'utf8')
          contents.set(file.path, content)
        } catch {
          // Skip unreadable files
        }
      }),
    )

    const score = await buildDebtScore(
      targetPath,
      filteredFiles.map((f) => f.path),
      contents,
      {
        extensions,
        ignorePatterns: ignore,
      },
    )

    spinner.succeed(
      `Debt score: ${score.total}/100 (Grade ${score.grade}) — ${score.totalItems} items found`,
    )

    const outputData =
      format === 'json' ? formatDebtJson(score) : formatDebtTable(score, verbose)

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

export {
  assessComplexity,
  assessTesting,
  assessDocumentation,
  assessTodos,
  assessCoupling,
  assessStaleCode,
  assessDependencies,
  computeDebtScore,
  generateRepaymentPlan,
  buildDebtScore,
  scoreToGrade,
} from './techdebt-helpers.js'
export type {
  DebtCategory,
  DebtItem,
  DebtScore,
  RepaymentAction,
  TechDebtOptions,
  FileContent,
} from './techdebt-helpers.js'
export { formatDebtMeter, formatGrade, formatCategoryScore, formatDebtTable, formatDebtJson } from './techdebt-format-helpers.js'
