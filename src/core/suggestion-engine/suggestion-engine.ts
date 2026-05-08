import {
  DEFAULT_SUGGESTION_CONFIG,
} from './types.js'
import type {
  Suggestion,
  SuggestionCategory,
  SuggestionContext,
  SuggestionRule,
  SuggestionResult,
  SuggestionPriority,
  SuggestionConfig,
} from './types.js'

export {
  type Suggestion,
  type SuggestionCategory,
  type SuggestionContext,
  type SuggestionRule,
  type SuggestionResult,
  type SuggestionPriority,
  type SuggestionConfig,
  DEFAULT_SUGGESTION_CONFIG,
} from './types.js'

const CATEGORIES: SuggestionCategory[] = ['performance', 'security', 'style', 'refactor', 'error-prone', 'best-practice']
const PRIORITIES: SuggestionPriority[] = ['low', 'medium', 'high', 'critical']

export class SuggestionEngine {
  private config: SuggestionConfig
  private rules: Map<string, SuggestionRule>
  private suggestionCounter: number

  constructor(config: Partial<SuggestionConfig> = {}) {
    this.config = { ...DEFAULT_SUGGESTION_CONFIG, ...config }
    this.rules = new Map()
    this.suggestionCounter = 0
  }

  addRule(rule: SuggestionRule): boolean {
    if (this.rules.has(rule.id)) {
      return false
    }
    this.rules.set(rule.id, rule)
    return true
  }

  removeRule(ruleId: string): boolean {
    return this.rules.delete(ruleId)
  }

  getRules(): SuggestionRule[] {
    return [...this.rules.values()]
  }

  analyze(context: SuggestionContext): SuggestionResult {
    const allSuggestions: Suggestion[] = []

    const rules = this.getRules()
    for (const rule of rules) {
      if (!this.isEnabledCategory(rule.category)) continue
      if (!this.isEnabledPriority(rule.priority)) continue

      if (rule.contextCondition && !rule.contextCondition(context)) {
        continue
      }

      let match: RegExpMatchArray | null = null
      if (rule.pattern) {
        match = context.code.match(rule.pattern)
        if (!match) continue
      }

      const result = rule.suggest(match, context)
      if (result === null) continue

      const suggestions = Array.isArray(result) ? result : [result]
      for (const s of suggestions) {
        if (s.confidence >= this.config.minConfidence) {
          allSuggestions.push(this.enrichSuggestion(s, rule))
        }
      }
    }

    const sorted = allSuggestions.sort((a, b) => b.confidence - a.confidence)
    const suggestions = this.applyMaxSuggestions(sorted)

    return this.buildResult(suggestions)
  }

  getSuggestions(context: SuggestionContext): Suggestion[] {
    return this.analyze(context).suggestions
  }

  filterByCategory(suggestions: Suggestion[], category: SuggestionCategory): Suggestion[] {
    return suggestions.filter((s) => s.category === category)
  }

  filterByPriority(suggestions: Suggestion[], priority: SuggestionPriority): Suggestion[] {
    return suggestions.filter((s) => s.priority === priority)
  }

  getByConfidence(suggestions: Suggestion[], minConfidence: number): Suggestion[] {
    return suggestions.filter((s) => s.confidence >= minConfidence)
  }

  getStatistics(result: SuggestionResult): {
    total: number
    byCategory: Record<SuggestionCategory, number>
    byPriority: Record<SuggestionPriority, number>
    averageConfidence: number
    topCategories: SuggestionCategory[]
    topPriorities: SuggestionPriority[]
  } {
    const byCategory = { ...result.byCategory }
    const byPriority = { ...result.byPriority }

    const sortedCategories = CATEGORIES.slice().sort((a, b) => (byCategory[b] ?? 0) - (byCategory[a] ?? 0))
    const sortedPriorities = PRIORITIES.slice().sort((a, b) => (byPriority[b] ?? 0) - (byPriority[a] ?? 0))

    return {
      total: result.totalMatches,
      byCategory,
      byPriority,
      averageConfidence: result.averageConfidence,
      topCategories: sortedCategories,
      topPriorities: sortedPriorities,
    }
  }

  clear(): void {
    this.rules.clear()
    this.suggestionCounter = 0
  }

  private enrichSuggestion(suggestion: Suggestion, rule: SuggestionRule): Suggestion {
    const enriched = { ...suggestion, ruleId: rule.id }
    if (!enriched.category) {
      enriched.category = rule.category
    }
    if (!enriched.priority) {
      enriched.priority = rule.priority
    }
    if (!enriched.id) {
      this.suggestionCounter++
      enriched.id = `sug-${this.suggestionCounter}`
    }
    if (!this.config.includeFixes) {
      delete enriched.fix
    }
    return enriched
  }

  private isEnabledCategory(category: SuggestionCategory): boolean {
    return this.config.enabledCategories.includes(category)
  }

  private isEnabledPriority(priority: SuggestionPriority): boolean {
    return this.config.enabledPriorities.includes(priority)
  }

  private applyMaxSuggestions(suggestions: Suggestion[]): Suggestion[] {
    if (this.config.maxSuggestions < 0) return suggestions
    return suggestions.slice(0, this.config.maxSuggestions)
  }

  private buildResult(suggestions: Suggestion[]): SuggestionResult {
    const byCategory = this.buildCategoryCounts(suggestions)
    const byPriority = this.buildPriorityCounts(suggestions)
    const averageConfidence = suggestions.length > 0
      ? suggestions.reduce((sum, s) => sum + s.confidence, 0) / suggestions.length
      : 0

    return {
      suggestions,
      totalMatches: suggestions.length,
      byCategory,
      byPriority,
      averageConfidence,
    }
  }

  private buildCategoryCounts(suggestions: Suggestion[]): Record<SuggestionCategory, number> {
    const counts: Record<string, number> = {}
    for (const cat of CATEGORIES) {
      counts[cat] = 0
    }
    for (const s of suggestions) {
      counts[s.category] = (counts[s.category] ?? 0) + 1
    }
    return counts as Record<SuggestionCategory, number>
  }

  private buildPriorityCounts(suggestions: Suggestion[]): Record<SuggestionPriority, number> {
    const counts: Record<string, number> = {}
    for (const pri of PRIORITIES) {
      counts[pri] = 0
    }
    for (const s of suggestions) {
      counts[s.priority] = (counts[s.priority] ?? 0) + 1
    }
    return counts as Record<SuggestionPriority, number>
  }
}
