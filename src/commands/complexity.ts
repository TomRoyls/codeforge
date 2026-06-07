import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'

import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import {
  type FunctionComplexity,
  analyzeFileComplexity,
  calculateComplexitySummary,
} from '../core/complexity.js'
import { Parser } from '../core/parser.js'
import {
  filterFilesByExtension,
  parseExtensions,
} from './complexity-helpers.js'

const DEFAULT_IGNORE = [
  '**/node_modules/**',
  '**/dist/**',
  '**/coverage/**',
  '**/.git/**',
]

const CATEGORY_UPPERCASE: Record<string, string> = {
  extreme: 'EXTREME',
  high: 'HIGH',
  low: 'LOW',
  moderate: 'MODERATE',
}

const CATEGORY_CAPITALIZED: Record<string, string> = {
  extreme: 'Extreme',
  high: 'High',
  low: 'Low',
  moderate: 'Moderate',
}

export default class Complexity extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze',
      required: false,
    }),
  }

  static override description =
    'Analyze and report cyclomatic and cognitive complexity metrics for TypeScript files'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze complexity in current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Analyze complexity in src directory as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Analyze only TypeScript files',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --threshold 5',
      description: 'Show only functions with complexity above threshold',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --top 10',
      description: 'Show top 10 most complex functions',
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
      options: ['json', 'markdown', 'table'],
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
    'sort-by': Flags.string({
      char: 's',
      default: 'complexity',
      description: 'Sort results by',
      options: ['complexity', 'file', 'name'],
    }),
    threshold: Flags.integer({
      char: 't',
      default: 0,
      description: 'Minimum complexity threshold (only show functions with cyclomatic > threshold)',
    }),
    top: Flags.integer({
      char: 'n',
      default: 20,
      description: 'Show top N most complex functions (0 = no results)',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Complexity)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const spinner = ora('Discovering files...').start()

    const ignorePatterns = flags.ignore ?? []
    const allIgnore = [...DEFAULT_IGNORE, ...ignorePatterns]
    const extensions = parseExtensions(flags.ext)

    const discoveredFiles = await discoverFiles({
      cwd: targetPath,
      ignore: allIgnore,
      patterns: extensions
        ? extensions.map((ext) => `**/*${ext}`)
        : ['**/*.ts', '**/*.tsx'],
    })

    const filteredFiles = filterFilesByExtension(discoveredFiles, extensions)

    spinner.text = 'Analyzing files...'

    const parser = new Parser()
    await parser.initialize()

    const allFunctions: FunctionComplexity[] = []

    for (const file of filteredFiles) {
      try {
        const parseResult = await parser.parseFile(file.absolutePath)
        const functions = analyzeFileComplexity(parseResult.sourceFile)
        allFunctions.push(...functions)
      } catch {
        // empty: unparseable files contribute zero functions
      }
    }

    parser.dispose()

    spinner.succeed(`Analyzed ${filteredFiles.length} files`)

    const summary = calculateComplexitySummary(allFunctions)

    const filtered = allFunctions.filter((fn) => fn.cyclomatic > flags.threshold)
    const sorted = [...filtered].sort((a, b) => {
      switch (flags['sort-by']) {
        case 'file':
          return a.filePath.localeCompare(b.filePath)
        case 'name':
          return a.functionName.localeCompare(b.functionName)
        default:
          return b.cyclomatic - a.cyclomatic
      }
    })
    const limited: FunctionComplexity[] =
      flags.top > 0 ? sorted.slice(0, flags.top) : []

    let output: string
    if (flags.format === 'json') {
      output = JSON.stringify({ functions: limited, summary }, null, 2)
    } else if (flags.format === 'markdown') {
      output = this.formatMarkdown(limited, summary)
    } else {
      output = this.formatTable(limited, summary)
    }

    if (flags.output) {
      try {
        await fs.writeFile(flags.output, output, 'utf8')
        this.log(`Results written to ${flags.output}`)
      } catch (error) {
        this.error(
          `Failed to write output to ${flags.output}: ${error instanceof Error ? error.message : String(error)}`,
        )
      }
    } else {
      this.log(output)
    }
  }

  private formatTable(
    functions: FunctionComplexity[],
    summary: ReturnType<typeof calculateComplexitySummary>,
  ): string {
    const lines: string[] = ['Complexity Analysis', '']

    if (functions.length === 0) {
      lines.push('No functions found.')
      return lines.join('\n')
    }

    const headers = ['Function', 'Cyclomatic', 'Cognitive', 'Category', 'File']
    const rows = functions.map((fn) => [
      fn.functionName,
      String(fn.cyclomatic),
      String(fn.cognitive),
      CATEGORY_UPPERCASE[fn.category] ?? fn.category,
      fn.filePath,
    ])

    const colWidths = headers.map((header, i) =>
      Math.max(header.length, ...rows.map((row) => row[i]!.length)),
    )

    lines.push(
      headers.map((h, i) => h.padEnd(colWidths[i]!)).join('  '),
    )

    lines.push(colWidths.map((w) => '─'.repeat(w)).join('  '))

    for (const row of rows) {
      lines.push(row.map((cell, i) => cell.padEnd(colWidths[i]!)).join('  '))
    }

    lines.push('')
    lines.push('Summary:')
    lines.push(`  Total functions: ${summary.totalFunctions}`)
    lines.push(`  Average cyclomatic: ${summary.averageCyclomatic.toFixed(1)}`)
    lines.push(`  Average cognitive: ${summary.averageCognitive.toFixed(1)}`)
    lines.push(`  Max cyclomatic: ${summary.maxCyclomatic}`)
    lines.push(`  Max cognitive: ${summary.maxCognitive ?? 0}`)
    lines.push('  Category breakdown:')
    for (const [category, count] of Object.entries(summary.categoryBreakdown ?? {})) {
      lines.push(`    ${category}: ${count}`)
    }

    return lines.join('\n')
  }

  private formatMarkdown(
    functions: FunctionComplexity[],
    summary: ReturnType<typeof calculateComplexitySummary>,
  ): string {
    const lines: string[] = ['# Complexity Analysis', '']

    if (functions.length === 0) {
      lines.push('No functions found.')
      return lines.join('\n')
    }

    lines.push('| Function | Cyclomatic | Cognitive | Category | File |')
    lines.push('|--------|------------|-----------|----------|------|')

    for (const fn of functions) {
      lines.push(
        `| ${fn.functionName} | ${fn.cyclomatic} | ${fn.cognitive} | ${fn.category} | ${fn.filePath} |`,
      )
    }

    lines.push('')
    lines.push('## Summary')
    lines.push(`- **Total functions**: ${summary.totalFunctions}`)
    lines.push(`- **Average cyclomatic**: ${summary.averageCyclomatic.toFixed(1)}`)
    lines.push(`- **Average cognitive**: ${summary.averageCognitive.toFixed(1)}`)
    lines.push(`- **Max cyclomatic**: ${summary.maxCyclomatic ?? 0}`)
    lines.push(`- **Max cognitive**: ${summary.maxCognitive ?? 0}`)

    lines.push('')
    lines.push('## Category Breakdown')
    for (const [category, count] of Object.entries(summary.categoryBreakdown ?? {})) {
      const label = CATEGORY_CAPITALIZED[category] ?? category
      lines.push(`- **${label}**: ${count}`)
    }

    return lines.join('\n')
  }
}
