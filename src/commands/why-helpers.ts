import { BEST_PRACTICES } from './why-data-best-practices.js'
import { FIXES } from './why-data-fixes.js'
import { COMMON_VIOLATIONS } from './why-data-violations.js'

export function getBestPractices(ruleId: string): string[] {
  return BEST_PRACTICES[ruleId] || ['Follow general code quality guidelines']
}

export function getCommonViolations(ruleId: string): string[] {
  return COMMON_VIOLATIONS[ruleId] || ['Various violations may occur depending on usage']
}

export function getFixes(ruleId: string): string[] {
  return FIXES[ruleId] || ['Check the rule documentation for specific fixes']
}

export function analyzeViolation(_ruleId: string, violation: string): string[] {
  const suggestions: string[] = []

  if (violation.includes('parameter')) {
    suggestions.push(
      'Consider grouping related parameters into an options object with descriptive property names',
      'If some parameters are optional, use default values or overloading',
    )
  }

  if (violation.includes('nested') || violation.includes('depth')) {
    suggestions.push(
      'Look for opportunities to return early and reduce nesting',
      'Consider if the nested logic can be extracted to a well-named helper function',
    )
  }

  if (violation.includes('long') || violation.includes('line')) {
    suggestions.push(
      'Identify distinct responsibilities and extract to separate functions or modules',
      'Look for repeated code that can be deduplicated',
    )
  }

  if (suggestions.length === 0) {
    suggestions.push('Review the rule documentation for specific guidance on this violation')
  }

  return suggestions
}

export function formatBestPractices(ruleId: string, logFn: (msg: string) => void): void {
  const practices = getBestPractices(ruleId)
  for (const practice of practices) {
    logFn(`  • ${practice}`)
  }
}

export function formatCommonViolations(ruleId: string, logFn: (msg: string) => void): void {
  const violations = getCommonViolations(ruleId)
  for (const violation of violations) {
    logFn(`  • ${violation}`)
  }
}

export function formatFixes(ruleId: string, logFn: (msg: string) => void): void {
  const fixList = getFixes(ruleId)
  for (const fix of fixList) {
    logFn(`  • ${fix}`)
  }
}

export function formatViolationAnalysis(
  ruleId: string,
  violation: string,
  logFn: (msg: string) => void,
): void {
  const suggestions = analyzeViolation(ruleId, violation)
  for (const suggestion of suggestions) {
    logFn(`  • ${suggestion}`)
  }
}

export interface RuleMeta {
  description?: string
  name?: string
}

export function displayWhyOutput(
  ruleId: string,
  ruleMeta: RuleMeta | undefined,
  violation: string | undefined,
  binName: string,
  logFn: (msg: string) => void,
): void {
  logFn('')
  logFn(`Rule: ${ruleId}`)
  logFn(`Category:`)

  if (ruleMeta?.description) {
    logFn(`Description:`)
    logFn(`  ${ruleMeta.description}`)
  }

  logFn('')
  logFn('Common violations:')
  formatCommonViolations(ruleId, logFn)

  logFn('')
  logFn('How to fix:')
  formatFixes(ruleId, logFn)

  if (violation) {
    logFn('')
    logFn('Your specific violation:')
    logFn(`  "${violation}"`)
    formatViolationAnalysis(ruleId, violation, logFn)
  }

  logFn('')
  logFn('Best practices:')
  formatBestPractices(ruleId, logFn)

  logFn(`${binName} explain ${ruleId} for more details`)
}

export { BEST_PRACTICES } from './why-data-best-practices.js'
export { FIXES } from './why-data-fixes.js'
export { COMMON_VIOLATIONS } from './why-data-violations.js'
