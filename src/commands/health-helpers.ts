/**
 * Pure helper functions for the health command.
 *
 * Extracted from Health class to enable independent testing and reuse.
 * All functions are stateless — they accept parameters and return results.
 */
import chalk from 'chalk'

import type { RuleViolation } from '../ast/visitor.js'

import { getRuleCategory } from '../rules/categories.js'
import {
  HEALTH_SCORE_MAX,
  HEALTH_SCORE_THRESHOLD_A,
  HEALTH_SCORE_THRESHOLD_B,
  HEALTH_SCORE_THRESHOLD_C,
  MAX_RECOMMENDATIONS,
  SCORE_FIELD_WIDTH,
} from '../utils/constants.js'
import { getGrade, getScoreColor } from '../utils/formatting.js'



export interface HealthReport {
  details: {
    complexity: { avgComplexity: number; filesAnalyzed: number; highComplexityFiles: number }
    documentation: { documentedFunctions: number; totalFunctions: number }
    errors: number
    patterns: number
    security: number
    testCoverage: { estimated: number; hasTests: boolean }
  }
  overall: number
  path: string
  recommendations: string[]
  scores: {
    complexity: number
    documentation: number
    errors: number
    patterns: number
    security: number
    testCoverage: number
  }
}

export interface ScoreBreakdown {
  complexity: number
  documentation: number
  errors: number
  patterns: number
  security: number
  testCoverage: number
}

export interface CalculatedScores {
  errorCount: number
  overall: number
  patternCount: number
  scores: ScoreBreakdown
  securityCount: number
  testCoverage: {
    estimated: number
    hasTests: boolean
  }
}

export function analyzeComplexity(violations: RuleViolation[]): {
  avgComplexity: number
  filesAnalyzed: number
  highComplexityFiles: number
} {
  const complexityViolations = violations.filter((v) => v.ruleId.includes('complexity'))
  const filesWithViolations = new Set(complexityViolations.map((v) => v.filePath))

  return {
    avgComplexity:
      complexityViolations.length > 0 ? complexityViolations.length / filesWithViolations.size : 0,
    filesAnalyzed: filesWithViolations.size,
    highComplexityFiles: complexityViolations.filter((v) => v.message.includes('high')).length,
  }
}

export function getRecommendations(
  scores: ScoreBreakdown,
  details: { errors: number; hasTests: boolean; security: number },
): string[] {
  const recommendations: string[] = []

  if (scores.errors < HEALTH_SCORE_THRESHOLD_B) {
    recommendations.push(`Fix ${details.errors} error-level violations`)
  }

  if (scores.security < HEALTH_SCORE_THRESHOLD_A) {
    recommendations.push(`Address ${details.security} security issues`)
  }

  if (scores.documentation < 50) {
    recommendations.push('Add JSDoc comments to public functions')
  }

  if (!details.hasTests) {
    recommendations.push('Add unit tests to improve code quality')
  }

  if (scores.complexity < HEALTH_SCORE_THRESHOLD_C) {
    recommendations.push('Reduce code complexity by breaking down large functions')
  }

  return recommendations.slice(0, MAX_RECOMMENDATIONS)
}

export function formatScore(score: number): string {
  const colorFn = getScoreColor(score)
  return colorFn(`${score.toString().padStart(SCORE_FIELD_WIDTH)} / ${HEALTH_SCORE_MAX}`)
}

export function displayReport(report: HealthReport, verbose: boolean): string[] {
  const lines: string[] = []
  const score = report.overall
  const grade = getGrade(score)
  const colorFn = getScoreColor(score)

  lines.push(
    '',
    chalk.bold('  Project Health Score'),
    '',
    `  ${colorFn(`  ${score.toString().padStart(SCORE_FIELD_WIDTH)} / ${HEALTH_SCORE_MAX}`)}  ${chalk.gray(grade)}`,
    '',
  )

  if (verbose) {
    lines.push(
      chalk.gray('  Category Breakdown:'),
      `    Complexity:    ${formatScore(report.scores.complexity)}`,
      `    Documentation: ${formatScore(report.scores.documentation)}`,
      `    Error Count:   ${formatScore(report.scores.errors)}`,
      `    Security:      ${formatScore(report.scores.security)}`,
      `    Patterns:      ${formatScore(report.scores.patterns)}`,
      `    Test Coverage: ${formatScore(report.scores.testCoverage)}`,
      '',
      chalk.gray('  Details:'),
      `    Files analyzed: ${report.details.complexity.filesAnalyzed}`,
      `    Errors: ${report.details.errors}`,
      `    Security issues: ${report.details.security}`,
      `    Pattern issues: ${report.details.patterns}`,
      `    Tests present: ${report.details.testCoverage.hasTests ? 'Yes' : 'No'}`,
      '',
    )
  }

  if (report.recommendations.length > 0) {
    lines.push(chalk.gray('  Recommendations:'))
    for (const rec of report.recommendations) {
      lines.push(`    ${chalk.yellow('•')} ${rec}`)
    }

    lines.push('')
  }

  return lines
}

export function calculateScores(
  violations: RuleViolation[],
  totalFunctions: number,
  documentedFunctions: number,
  files: Array<{ path: string }>,
): CalculatedScores {
  const errors = violations.filter((v) => v.severity === 'error')
  const security = violations.filter((v) => getRuleCategory(v.ruleId) === 'security')
  const patterns = violations.filter((v) => getRuleCategory(v.ruleId) === 'patterns')

  const hasTests = files.some((f) => f.path.includes('test') || f.path.includes('spec'))
  const testFiles = files.filter((f) => f.path.includes('test') || f.path.includes('spec'))
  const estimatedCoverage = hasTests
    ? Math.min(100, (testFiles.length / (files.length - testFiles.length || 1)) * 100)
    : 0

  const scores: ScoreBreakdown = {
    complexity: Math.max(0, 100 - errors.filter((e) => e.ruleId.includes('complexity')).length * 5),
    documentation: totalFunctions > 0 ? (documentedFunctions / totalFunctions) * 100 : 50,
    errors: Math.max(0, 100 - errors.length * 2),
    patterns: Math.max(0, 100 - patterns.length),
    security: Math.max(0, 100 - security.length * 10),
    testCoverage: estimatedCoverage,
  }

  const weights = {
    complexity: 0.2,
    documentation: 0.15,
    errors: 0.25,
    patterns: 0.1,
    security: 0.2,
    testCoverage: 0.1,
  }

  const overall = Math.round(
    scores.complexity * weights.complexity +
      scores.documentation * weights.documentation +
      scores.errors * weights.errors +
      scores.security * weights.security +
      scores.patterns * weights.patterns +
      scores.testCoverage * weights.testCoverage,
  )

  return {
    errorCount: errors.length,
    overall,
    patternCount: patterns.length,
    scores,
    securityCount: security.length,
    testCoverage: {
      estimated: Math.round(estimatedCoverage),
      hasTests,
    },
  }
}

export {getGrade, getScoreColor} from '../utils/formatting.js'