export interface ProfileEntry {
  name: string
  duration: number
  calls: number
  memory: number
  category: string
}

export interface ProfileSnapshot {
  entries: ProfileEntry[]
  timestamp: number
  label: string
}

export interface OptimizationSuggestion {
  target: string
  category: 'performance' | 'memory' | 'calls'
  description: string
  impact: 'high' | 'medium' | 'low'
  estimatedSaving: number
}

export interface Regression {
  name: string
  baselineDuration: number
  currentDuration: number
  increase: number
  percentageChange: number
}

export interface Improvement {
  name: string
  baselineDuration: number
  currentDuration: number
  decrease: number
  percentageChange: number
}

export interface ComparisonResult {
  baseline: ProfileSnapshot
  current: ProfileSnapshot
  regressions: Regression[]
  improvements: Improvement[]
}

export interface BudgetRule {
  name: string
  target: string
  maxDuration: number
  maxCalls: number
  maxMemory: number
}

export interface BudgetResult {
  rule: BudgetRule
  passed: boolean
  actualDuration: number
  actualCalls: number
  actualMemory: number
}

export interface ProfileStatistics {
  totalEntries: number
  totalDuration: number
  totalMemory: number
  totalCalls: number
  avgDuration: number
  maxDuration: number
  categories: Record<string, number>
}
