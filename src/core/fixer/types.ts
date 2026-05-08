export type FixConfidence = 'safe' | 'suggested' | 'unsafe' | 'manual'
export type FixCategory = 'formatting' | 'refactor' | 'type-fix' | 'security' | 'performance' | 'import' | 'deprecation'

export interface FixSuggestion {
  id: string
  ruleId: string
  filePath: string
  line: number
  column: number
  message: string
  confidence: FixConfidence
  category: FixCategory
  risk: 'low' | 'medium' | 'high'
  patch: FixPatch
  description: string
  beforeCode: string
  afterCode: string
}

export interface FixPatch {
  startLine: number
  startColumn: number
  endLine: number
  endColumn: number
  replacement: string
}

export interface FixPlan {
  filePath: string
  suggestions: FixSuggestion[]
  safeFixCount: number
  totalFixCount: number
  estimatedTimeSaved: number
  riskAssessment: FixRiskAssessment
}

export interface FixRiskAssessment {
  level: 'low' | 'medium' | 'high'
  factors: string[]
  affectedLines: number
  breakingChanges: boolean
  requiresReview: boolean
}

export interface FixerConfig {
  autoApplySafe: boolean
  maxSuggestionsPerFile: number
  minConfidence: FixConfidence
  excludedRules: string[]
  includedCategories: FixCategory[]
}

export const DEFAULT_FIXER_CONFIG: FixerConfig = {
  autoApplySafe: false,
  maxSuggestionsPerFile: 50,
  minConfidence: 'suggested',
  excludedRules: [],
  includedCategories: [],
}

export const CONFIDENCE_ORDER: Record<FixConfidence, number> = {
  safe: 4,
  suggested: 3,
  unsafe: 2,
  manual: 1,
}
