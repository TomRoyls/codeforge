import chalk from 'chalk'

import { type ChalkColorFunction } from '../types/chalk.js'
import { RULE_ID_FIELD_WIDTH } from '../utils/constants.js'
import { type RuleSuggestion } from './suggest-rules-patterns.js'

export function filterSuggestions(suggestions: RuleSuggestion[], impact: string): RuleSuggestion[] {
  if (!impact) {
    return suggestions
  }

  return suggestions.filter((s) => s.impact === impact)
}

export function sortSuggestions(suggestions: RuleSuggestion[]): RuleSuggestion[] {
  const impactOrder = { high: 3, low: 1, medium: 2 }
  const confidenceOrder = { high: 3, low: 1, medium: 2 }

  return suggestions.sort((a, b) => {
    const impactDiff = impactOrder[b.impact] - impactOrder[a.impact]
    if (impactDiff !== 0) return impactDiff

    const confidenceDiff = confidenceOrder[b.confidence] - confidenceOrder[a.confidence]
    if (confidenceDiff !== 0) return confidenceDiff

    return b.estimatedViolations - a.estimatedViolations
  })
}

export function formatImpactColor(impact: string): ChalkColorFunction {
  if (impact === 'high') return chalk.red
  if (impact === 'medium') return chalk.yellow
  return chalk.green
}

export function formatConfidenceColor(confidence: string): ChalkColorFunction {
  if (confidence === 'high') return chalk.green
  if (confidence === 'medium') return chalk.yellow
  return chalk.red
}

export function displaySuggestions(
  suggestions: RuleSuggestion[],
  verbose: boolean,
  logFn: (msg?: string) => void,
): void {
  if (suggestions.length === 0) {
    logFn('No rule suggestions found.')
    return
  }

  logFn('\n' + chalk.bold('Rule Suggestions:') + '\n')

  for (const suggestion of suggestions) {
    const impactColor = formatImpactColor(suggestion.impact)
    const confidenceColor = formatConfidenceColor(suggestion.confidence)

    logFn(
      chalk.cyan(suggestion.ruleId.padEnd(RULE_ID_FIELD_WIDTH)) +
        impactColor(`[${suggestion.impact.toUpperCase()}]`.padEnd(8)) +
        confidenceColor(`[${suggestion.confidence.toUpperCase()}]`.padEnd(10)) +
        chalk.gray(`(~${suggestion.estimatedViolations} violations)`),
    )

    if (verbose) {
      logFn(chalk.gray(`  Category: ${suggestion.category}`))
      logFn(chalk.gray(`  Reason: ${suggestion.reason}`))
      logFn(chalk.gray(`  Enable with: codeforge analyze --rules ${suggestion.ruleId}`))
    }
  }

  logFn()
  logFn(chalk.gray(`Total: ${suggestions.length} rule suggestions`))
}
