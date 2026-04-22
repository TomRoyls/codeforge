export interface SuggestedRule {
  confidence: 'high' | 'low' | 'medium'
  impact: 'high' | 'low' | 'medium'
  reason: string
  ruleId: string
}

export interface PatternDetector {
  name: string
  patterns: (RegExp | string)[]
  suggestedRules: SuggestedRule[]
}

export interface RuleSuggestion {
  category: string
  confidence: 'high' | 'low' | 'medium'
  estimatedViolations: number
  impact: 'high' | 'low' | 'medium'
  reason: string
  ruleId: string
}

export const PATTERN_DETECTORS: PatternDetector[] = [
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

export function findMatches(content: string, pattern: RegExp | string): number {
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

// eslint-disable-next-line max-params
export function addSuggestion(
  suggestionMap: Map<string, RuleSuggestion>,
  ruleId: string,
  matches: number,
  suggested: SuggestedRule,
  getRuleCategoryFn: (ruleId: string) => string,
): void {
  const existing = suggestionMap.get(ruleId)
  const estimatedViolations = (existing?.estimatedViolations ?? 0) + matches

  suggestionMap.set(ruleId, {
    category: getRuleCategoryFn(ruleId),
    confidence: suggested.confidence,
    estimatedViolations,
    impact: suggested.impact,
    reason: suggested.reason,
    ruleId,
  })
}

export function analyzeFile(
  content: string,
  suggestionMap: Map<string, RuleSuggestion>,
  detectors: PatternDetector[],
  getRuleCategoryFn: (ruleId: string) => string,
): void {
  for (const detector of detectors) {
    for (const pattern of detector.patterns) {
      const matches = findMatches(content, pattern)
      if (matches > 0) {
        for (const suggested of detector.suggestedRules) {
          addSuggestion(suggestionMap, suggested.ruleId, matches, suggested, getRuleCategoryFn)
        }
      }
    }
  }
}
