export type PatternCategory =
  | 'design-pattern'
  | 'anti-pattern'
  | 'architectural'
  | 'idiom'
  | 'code-smell'

export type PatternSeverity = 'info' | 'warning' | 'error'

export interface CodePattern {
  id: string
  name: string
  category: PatternCategory
  severity: PatternSeverity
  description: string
  detectionRegex: RegExp
  indicators: string[]
}

export interface PatternMatch {
  pattern: CodePattern
  filePath: string
  line: number
  column: number
  matchedText: string
  confidence: number
  context: string
}

export interface PatternReport {
  matches: PatternMatch[]
  summary: PatternSummary
  suggestions: PatternSuggestion[]
}

export interface PatternSummary {
  totalMatches: number
  byCategory: Record<PatternCategory, number>
  bySeverity: Record<PatternSeverity, number>
  uniquePatterns: number
  healthScore: number
}

export interface PatternSuggestion {
  pattern: CodePattern
  action: 'refactor' | 'consider' | 'review' | 'keep'
  reason: string
  effort: 'low' | 'medium' | 'high'
}
