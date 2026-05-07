import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { getRuleCategory } from '../rules/categories.js'
import { MAX_TOP_SUGGESTIONS } from '../utils/constants.js'
import {
  addSuggestion as addSuggestionHelper,
  displaySuggestions as displaySuggestionsHelper,
  filterSuggestions as filterSuggestionsHelper,
  findMatches as findMatchesHelper,
  PATTERN_DETECTORS,
  type RuleSuggestion,
  sortSuggestions as sortSuggestionsHelper,
  type SuggestedRule,
} from './suggest-rules-helpers.js'

interface RuleSuggestionLocal {
  category: string
  confidence: 'high' | 'low' | 'medium'
  estimatedViolations: number
  impact: 'high' | 'low' | 'medium'
  reason: string
  ruleId: string
}

interface PatternDetectorLocal {
  name: string
  patterns: (RegExp | string)[]
  suggestedRules: Array<{
    confidence: 'high' | 'low' | 'medium'
    impact: 'high' | 'low' | 'medium'
    reason: string
    ruleId: string
  }>
}

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
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
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
    suggestionMap: Map<string, RuleSuggestionLocal>,
    ruleId: string,
    matches: number,
    suggested: PatternDetectorLocal['suggestedRules'][number],
  ): void {
    addSuggestionHelper(
      suggestionMap as Map<string, RuleSuggestion>,
      ruleId,
      matches,
      suggested as SuggestedRule,
      getRuleCategory,
    )
  }

  private analyzeFile(content: string, suggestionMap: Map<string, RuleSuggestionLocal>): void {
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
  ): Promise<RuleSuggestionLocal[]> {
    const suggestionMap = new Map<string, RuleSuggestionLocal>()

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

  private displaySuggestions(suggestions: RuleSuggestionLocal[], verbose: boolean): void {
    displaySuggestionsHelper(
      suggestions as RuleSuggestion[],
      verbose,
      (msg?: string) => this.log(msg ?? ''),
    )
  }

  private filterSuggestions(
    suggestions: RuleSuggestionLocal[],
    flags: { impact: string },
  ): RuleSuggestionLocal[] {
    return filterSuggestionsHelper(suggestions as RuleSuggestion[], flags.impact) as RuleSuggestionLocal[]
  }

  private findMatches(content: string, pattern: RegExp | string): number {
    return findMatchesHelper(content, pattern)
  }

  private sortSuggestions(suggestions: RuleSuggestionLocal[]): RuleSuggestionLocal[] {
    return sortSuggestionsHelper(suggestions as RuleSuggestion[]) as RuleSuggestionLocal[]
  }
}
