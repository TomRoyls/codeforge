export type SuggestionCategory =
  | 'performance'
  | 'security'
  | 'style'
  | 'refactor'
  | 'error-prone'
  | 'best-practice'

export type SuggestionPriority = 'low' | 'medium' | 'high' | 'critical'

export interface Suggestion {
  id: string
  ruleId: string
  message: string
  category: SuggestionCategory
  priority: SuggestionPriority
  confidence: number
  line: number
  column: number
  fix?: string
}

export interface SuggestionContext {
  code: string
  fileName?: string
  language?: string
  ast?: unknown
  metadata?: Record<string, unknown>
}

export interface SuggestionRule {
  id: string
  description: string
  category: SuggestionCategory
  priority: SuggestionPriority
  pattern?: RegExp
  contextCondition?: (context: SuggestionContext) => boolean
  suggest: (match: RegExpMatchArray | null, context: SuggestionContext) => Suggestion | Suggestion[] | null
}

export interface SuggestionResult {
  suggestions: Suggestion[]
  totalMatches: number
  byCategory: Record<SuggestionCategory, number>
  byPriority: Record<SuggestionPriority, number>
  averageConfidence: number
}

export interface SuggestionConfig {
  minConfidence: number
  maxSuggestions: number
  enabledCategories: SuggestionCategory[]
  enabledPriorities: SuggestionPriority[]
  includeFixes: boolean
}

export const DEFAULT_SUGGESTION_CONFIG: SuggestionConfig = {
  minConfidence: 0,
  maxSuggestions: -1,
  enabledCategories: ['performance', 'security', 'style', 'refactor', 'error-prone', 'best-practice'],
  enabledPriorities: ['low', 'medium', 'high', 'critical'],
  includeFixes: true,
}
