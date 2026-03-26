import { Args, Command, Flags } from '@oclif/core'
import chalk from 'chalk'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { getRuleCategory } from '../rules/index.js'
import { MAX_TOP_SUGGESTIONS, RULE_ID_FIELD_WIDTH } from '../utils/constants.js'

interface RuleSuggestion {
  category: string
  confidence: 'high' | 'low' | 'medium'
  estimatedViolations: number
  impact: 'high' | 'low' | 'medium'
  reason: string
  ruleId: string
}

interface PatternDetector {
  name: string
  patterns: (RegExp | string)[]
  suggestedRules: Array<{
    confidence: 'high' | 'low' | 'medium'
    impact: 'high' | 'low' | 'medium'
    reason: string
    ruleId: string
  }>
}

const PATTERN_DETECTORS: PatternDetector[] = [
  {
    name: 'Console logs',
    patterns: ['console.log', 'console.warn', 'console.error', 'console.debug'],
    suggestedRules: [
      {
        confidence: 'high',
        impact: 'medium',
        reason: 'Found console statements that should be replaced with proper logging',
        ruleId: 'no-console-log',
      },
    ],
  },
  {
    name: 'Any type usage',
    patterns: [': any', '<any>', 'as any'],
    suggestedRules: [
      {
        confidence: 'high',
        impact: 'high',
        reason: 'Found explicit any usage that weakens type safety',
        ruleId: 'no-explicit-any',
      },
    ],
  },
  {
    name: 'Var declarations',
    patterns: ['var '],
    suggestedRules: [
      {
        confidence: 'high',
        impact: 'medium',
        reason: 'Found var declarations that should use const or let',
        ruleId: 'prefer-const',
      },
    ],
  },
  {
    name: 'Loose equality',
    patterns: [' == ', ' != '],
    suggestedRules: [
      {
        confidence: 'high',
        impact: 'high',
        reason: 'Found loose equality operators that should use strict equality',
        ruleId: 'eq-eq-eq',
      },
    ],
  },
  {
    name: 'Eval usage',
    patterns: ['eval(', 'new Function('],
    suggestedRules: [
      {
        confidence: 'high',
        impact: 'high',
        reason: 'Found eval or Function constructor usage - security risk',
        ruleId: 'no-eval',
      },
    ],
  },
  {
    name: 'Magic numbers',
    patterns: [/\b\d{2,}\b/],
    suggestedRules: [
      {
        confidence: 'medium',
        impact: 'medium',
        reason: 'Found numeric literals that should be named constants',
        ruleId: 'no-magic-numbers',
      },
    ],
  },
  {
    name: 'Nested conditionals',
    patterns: [/if\s*\([^)]*\)\s*\{[^}]*if\s*\(/],
    suggestedRules: [
      {
        confidence: 'medium',
        impact: 'medium',
        reason: 'Found deeply nested conditionals that reduce readability',
        ruleId: 'max-depth',
      },
    ],
  },
  {
    name: 'Long functions',
    patterns: [],
    suggestedRules: [
      {
        confidence: 'low',
        impact: 'medium',
        reason: 'Some functions may be too long and should be split',
        ruleId: 'max-lines-per-function',
      },
    ],
  },
  {
    name: 'TODO/FIXME comments',
    patterns: [/\/\/\s*(TODO|FIXME|HACK|XXX)/i, /\/\*[\s\S]*?(TODO|FIXME|HACK|XXX)/i],
    suggestedRules: [
      {
        confidence: 'low',
        impact: 'low',
        reason: 'Found TODO/FIXME comments indicating technical debt',
        ruleId: 'no-duplicate-code',
      },
    ],
  },
  {
    name: 'Async without await',
    patterns: [/async\s+function\s+\w+\s*\([^)]*\)\s*\{[^}]*\}/],
    suggestedRules: [
      {
        confidence: 'medium',
        impact: 'low',
        reason: 'Found async functions without await that may not need to be async',
        ruleId: 'no-async-without-await',
      },
    ],
  },
  {
    name: 'Null checks',
    patterns: [/===\s*null/, /!==\s*null/, /===\s*undefined/, /!==\s*undefined/],
    suggestedRules: [
      {
        confidence: 'medium',
        impact: 'low',
        reason: 'Found explicit null/undefined checks that could use nullish coalescing',
        ruleId: 'prefer-nullish-coalescing',
      },
    ],
  },
  {
    name: 'Type assertions',
    patterns: [' as '],
    suggestedRules: [
      {
        confidence: 'low',
        impact: 'medium',
        reason: 'Found type assertions that may be unsafe',
        ruleId: 'no-unsafe-type-assertion',
      },
    ],
  },
]

export default class SuggestRules extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze for rule suggestions',
      required: false,
    }),
  }

  static override description = 'Analyze codebase and suggest which rules would be most beneficial'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze current directory for rule suggestions',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src',
      description: 'Analyze src directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --top 10',
      description: 'Show top 10 suggestions',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json',
      description: 'Output suggestions as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --impact high',
      description: 'Show only high-impact suggestions',
    },
  ]

  static override flags = {
    format: Flags.string({
      default: 'console',
      description: 'Output format',
      options: ['console', 'json'],
    }),
    impact: Flags.string({
      default: '',
      description: 'Filter by impact level (high, medium, low)',
      options: ['high', 'medium', 'low', ''],
    }),
    top: Flags.integer({
      default: MAX_TOP_SUGGESTIONS,
      description: 'Number of top suggestions to show',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed analysis information',
    }),
  }

  override async run(): Promise<void> {
    const { args, flags } = await this.parse(SuggestRules)
    const targetPath = resolve(args.path)

    if (!existsSync(targetPath)) {
      this.error(`Path does not exist: ${targetPath}`)
    }

    const spinner = ora('Analyzing codebase patterns...').start()

    try {
      const files = await discoverFiles({
        cwd: targetPath,
        ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.git/**', '**/coverage/**'],
        patterns: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
      })

      if (files.length === 0) {
        spinner.fail('No files found to analyze')
        return
      }

      spinner.text = `Analyzing ${files.length} files for patterns...`

      const suggestions = await this.analyzePatterns(files, flags.verbose)

      spinner.succeed(`Analyzed ${files.length} files, found ${suggestions.length} suggestions`)

      const filteredSuggestions = this.filterSuggestions(suggestions, flags)
      const sortedSuggestions = this.sortSuggestions(filteredSuggestions).slice(0, flags.top)

      if (flags.format === 'json') {
        this.log(JSON.stringify(sortedSuggestions, null, 2))
      } else {
        this.displaySuggestions(sortedSuggestions, flags.verbose)
      }
    } catch (error) {
      spinner.fail('Analysis failed')
      throw error
    }
  }

  private addSuggestion(
    suggestionMap: Map<string, RuleSuggestion>,
    ruleId: string,
    matches: number,
    suggested: PatternDetector['suggestedRules'][number],
  ): void {
    const existing = suggestionMap.get(ruleId)
    const estimatedViolations = (existing?.estimatedViolations ?? 0) + matches

    suggestionMap.set(ruleId, {
      category: getRuleCategory(ruleId),
      confidence: suggested.confidence,
      estimatedViolations,
      impact: suggested.impact,
      reason: suggested.reason,
      ruleId,
    })
  }

  private analyzeFile(content: string, suggestionMap: Map<string, RuleSuggestion>): void {
    for (const detector of PATTERN_DETECTORS) {
      for (const pattern of detector.patterns) {
        const matches = this.findMatches(content, pattern)
        if (matches > 0) {
          for (const suggested of detector.suggestedRules) {
            this.addSuggestion(suggestionMap, suggested.ruleId, matches, suggested)
          }
        }
      }
    }
  }

  private async analyzePatterns(
    files: Array<{ absolutePath: string; path: string }>,
    verbose: boolean,
  ): Promise<RuleSuggestion[]> {
    const suggestionMap = new Map<string, RuleSuggestion>()

    const results = await Promise.allSettled(
      files.map(async (file) => {
        const content = await readFile(file.absolutePath, 'utf8')
        return { content, path: file.path }
      }),
    )

    for (const result of results) {
      if (result.status === 'fulfilled') {
        this.analyzeFile(result.value.content, suggestionMap)
      } else if (verbose) {
        const fileIndex = results.indexOf(result)
        const file = files[fileIndex]
        if (file) {
          this.log(`Skipping file ${file.path}: ${(result.reason as Error).message}`)
        }
      }
    }

    return [...suggestionMap.values()]
  }

  private displaySuggestions(suggestions: RuleSuggestion[], verbose: boolean): void {
    if (suggestions.length === 0) {
      this.log('No rule suggestions found.')
      return
    }

    this.log('\n' + chalk.bold('Rule Suggestions:') + '\n')

    for (const suggestion of suggestions) {
      const impactColor =
        suggestion.impact === 'high'
          ? chalk.red
          : suggestion.impact === 'medium'
            ? chalk.yellow
            : chalk.green

      const confidenceColor =
        suggestion.confidence === 'high'
          ? chalk.green
          : suggestion.confidence === 'medium'
            ? chalk.yellow
            : chalk.red

      this.log(
        chalk.cyan(suggestion.ruleId.padEnd(RULE_ID_FIELD_WIDTH)) +
          impactColor(`[${suggestion.impact.toUpperCase()}]`.padEnd(8)) +
          confidenceColor(`[${suggestion.confidence.toUpperCase()}]`.padEnd(10)) +
          chalk.gray(`(~${suggestion.estimatedViolations} violations)`),
      )

      if (verbose) {
        this.log(chalk.gray(`  Category: ${suggestion.category}`))
        this.log(chalk.gray(`  Reason: ${suggestion.reason}`))
        this.log(chalk.gray(`  Enable with: codeforge analyze --rules ${suggestion.ruleId}`))
      }
    }

    this.log()
    this.log(chalk.gray(`Total: ${suggestions.length} rule suggestions`))
  }

  private filterSuggestions(
    suggestions: RuleSuggestion[],
    flags: { impact: string },
  ): RuleSuggestion[] {
    if (!flags.impact) {
      return suggestions
    }

    return suggestions.filter((s) => s.impact === flags.impact)
  }

  private findMatches(content: string, pattern: RegExp | string): number {
    if (typeof pattern === 'string') {
      let count = 0
      let index = content.indexOf(pattern)
      while (index !== -1) {
        count++
        index = content.indexOf(pattern, index + 1)
      }

      return count
    }

    const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, 'g')
    const matches = content.match(globalPattern)
    return matches ? matches.length : 0
  }

  private sortSuggestions(suggestions: RuleSuggestion[]): RuleSuggestion[] {
    const impactOrder = { high: 3, low: 1, medium: 2 }
    const confidenceOrder = { high: 3, low: 1, medium: 2 }

    return suggestions.sort((a, b) => {
      const impactDiff = impactOrder[b.impact] - impactOrder[a.impact]
      if (impactDiff !== 1) return impactDiff

      const confidenceDiff = confidenceOrder[b.confidence] - confidenceOrder[a.confidence]
      if (confidenceDiff !== 1) return confidenceDiff

      return b.estimatedViolations - a.estimatedViolations
    })
  }
}
