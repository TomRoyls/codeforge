import { join } from 'node:path'

import { type RuleViolation } from '../ast/visitor.js'
import { type RuleCategory, RuleRegistry } from '../core/rule-registry.js'
import { getRuleCategory } from '../rules/categories.js'
import { lazyRuleLoader } from '../rules/lazy-loader.js'
import {
  DEBT_COST_PER_POINT_MINUTES,
  DEBT_WEIGHT_COMPLEXITY,
  DEBT_WEIGHT_DEPENDENCIES,
  DEBT_WEIGHT_DOCUMENTATION,
  DEBT_WEIGHT_PATTERNS,
  DEBT_WEIGHT_SECURITY,
  MAX_DEBT_HISTORY_ENTRIES,
} from '../utils/constants.js'

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface DebtBreakdown {
  complexity: number
  dependencies: number
  documentation: number
  patterns: number
  security: number
}

export interface DebtHistoryEntry {
  breakdown: DebtBreakdown
  filesAnalyzed: number
  overall: number
  timestamp: string
}

export interface DebtReport {
  breakdown: DebtBreakdown
  filesAnalyzed: number
  interest: {
    annual: number
    monthly: number
    weekly: number
  }
  overall: number
  path: string
  trend: {
    change: number
    direction: 'decreasing' | 'increasing' | 'stable'
    previous: null | number
  }
}

// ============================================================================
// Constants
// ============================================================================

export const WEEKS_PER_YEAR = 52

// ============================================================================
// Pure Helper Functions
// ============================================================================

export function calculateBreakdown(violations: RuleViolation[]): DebtBreakdown {
  const weights = {
    complexity: DEBT_WEIGHT_COMPLEXITY,
    dependencies: DEBT_WEIGHT_DEPENDENCIES,
    documentation: DEBT_WEIGHT_DOCUMENTATION,
    patterns: DEBT_WEIGHT_PATTERNS,
    security: DEBT_WEIGHT_SECURITY,
  }

  const counts = {
    complexity: 0,
    dependencies: 0,
    documentation: 0,
    patterns: 0,
    security: 0,
  }

  for (const v of violations) {
    const category = getRuleCategory(v.ruleId)
    if (category in counts) {
      counts[category as keyof typeof counts]++
    }
  }

  const undocumented = violations.filter(
    (v) => v.ruleId.includes('documentation') || v.ruleId.includes('jsdoc'),
  ).length

  return {
    complexity: counts.complexity * weights.complexity,
    dependencies: counts.dependencies * weights.dependencies,
    documentation: counts.documentation * weights.documentation + undocumented,
    patterns: counts.patterns * weights.patterns,
    security: counts.security * weights.security,
  }
}

export function calculateInterest(debtPoints: number): DebtReport['interest'] {
  const hoursPerPoint = DEBT_COST_PER_POINT_MINUTES / 60
  const weeklyHours = debtPoints * hoursPerPoint

  return {
    annual: Math.round(weeklyHours * WEEKS_PER_YEAR),
    monthly: Math.round(weeklyHours * 4),
    weekly: Math.round(weeklyHours),
  }
}

export function calculateOverall(breakdown: DebtBreakdown, filesCount: number): number {
  const total =
    breakdown.complexity +
    breakdown.dependencies +
    breakdown.documentation +
    breakdown.patterns +
    breakdown.security

  const normalizedFiles = Math.max(filesCount, 1)

  return Math.round(total / normalizedFiles)
}

export function getHistoryPath(targetPath: string): string {
  return join(targetPath, '.codeforge', 'debt-history.json')
}

export async function setupDebtRuleRegistry(): Promise<RuleRegistry> {
  const registry = new RuleRegistry()
  const loadedRules = await lazyRuleLoader.loadAllRules()

  for (const [ruleId, ruleDef] of Object.entries(loadedRules)) {
    registry.register(ruleId, ruleDef, lazyRuleLoader.getRuleCategory(ruleId) as RuleCategory)
  }

  return registry
}

export function computeTrend(history: DebtHistoryEntry[], current: number): DebtReport['trend'] {
  if (history.length === 0) {
    return { change: 0, direction: 'stable', previous: null }
  }

  const previous = history.at(-1)!.overall
  const change = current - previous

  let direction: DebtReport['trend']['direction'] = 'stable'
  if (change < -1) {
    direction = 'decreasing'
  } else if (change > 1) {
    direction = 'increasing'
  }

  return { change, direction, previous }
}

export function appendHistoryEntry(
  history: DebtHistoryEntry[],
  report: DebtReport,
  timestamp: string,
): DebtHistoryEntry[] {
  const entry: DebtHistoryEntry = {
    breakdown: report.breakdown,
    filesAnalyzed: report.filesAnalyzed,
    overall: report.overall,
    timestamp,
  }

  const updated = [...history, entry]

  if (updated.length > MAX_DEBT_HISTORY_ENTRIES) {
    return updated.slice(-MAX_DEBT_HISTORY_ENTRIES)
  }

  return updated
}

// ============================================================================
// Re-exports from debt-format-helpers
// ============================================================================

export {
  formatDebt,
  formatHistoryLines,
  formatReportLines,
  getDebtColor,
  getRecommendations,
} from './debt-format-helpers.js'
