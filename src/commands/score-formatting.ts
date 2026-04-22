import chalk from 'chalk'

import { HEALTH_SCORE_MAX, SCORE_FIELD_WIDTH } from '../utils/constants.js'
import { getGrade, getScoreColor } from '../utils/formatting.js'
import { type FileScore, type ScoreReport } from './score-helpers.js'



export function formatScore(score: number, weight: number): string {
  const colorFn = getScoreColor(score)
  return colorFn(
    `${score.toString().padStart(SCORE_FIELD_WIDTH)} / ${HEALTH_SCORE_MAX} (weight: ${(weight * 100).toFixed(0)}%)`,
  )
}

export function generateSuggestions(
  categories: ScoreReport['categories'],
  _allViolations: Array<{ ruleId: string }>,
  fileScores: FileScore[],
): string[] {
  const suggestions: string[] = []

  if (categories.complexity.score < 70) {
    suggestions.push(
      `Reduce code complexity - ${categories.complexity.violations} complexity issues found`,
    )
  }

  if (categories.correctness.score < 70) {
    suggestions.push(
      `Improve code correctness - ${categories.correctness.violations} correctness issues found`,
    )
  }

  if (categories.security.score < 80) {
    suggestions.push(
      `Address security concerns - ${categories.security.violations} security issues found (critical)`,
    )
  }

  if (categories.patterns.score < 70) {
    suggestions.push(
      `Refactor code patterns - ${categories.patterns.violations} pattern violations found`,
    )
  }

  const firstFile = fileScores[0]
  if (firstFile && firstFile.violations > 10) {
    suggestions.push(`Focus on ${firstFile.filePath} - it has ${firstFile.violations} violations`)
  }

  return suggestions
}

export function formatDisplayOutput(
  report: ScoreReport,
  verbose: boolean,
  logFn: (msg: string) => void,
): void {
  const score = report.overall
  const colorFn = getScoreColor(score)

  logFn('')
  logFn(chalk.bold('  Code Quality Score'))
  logFn('')
  logFn(
    `  ${colorFn(`  ${score.toString().padStart(SCORE_FIELD_WIDTH)} / ${HEALTH_SCORE_MAX}`)}  ${getGrade(score)}`,
  )
  logFn('')

  logFn(chalk.gray('  Category Scores:'))
  logFn(
    `    Complexity:  ${formatScore(report.categories.complexity.score, report.categories.complexity.weight)}`,
  )
  logFn(
    `    Correctness: ${formatScore(report.categories.correctness.score, report.categories.correctness.weight)}`,
  )
  logFn(
    `    Security:    ${formatScore(report.categories.security.score, report.categories.security.weight)}`,
  )
  logFn(
    `    Patterns:    ${formatScore(report.categories.patterns.score, report.categories.patterns.weight)}`,
  )
  logFn('')

  logFn(chalk.gray('  Summary:'))
  logFn(`    Files analyzed: ${report.summary.filesAnalyzed}`)
  logFn(`    Total violations: ${report.summary.totalViolations}`)
  logFn(`    Violations per file: ${report.summary.violationsPerFile.toFixed(2)}`)
  logFn('')

  if (verbose && report.topFiles.length > 0) {
    logFn(chalk.gray('  Top Problematic Files:'))
    for (const file of report.topFiles) {
      logFn(`    ${chalk.yellow(file.filePath)}`)
      logFn(`      Violations: ${file.violations}, Score: ${file.score}/100`)
      if (Object.keys(file.categories).length > 0) {
        const categories = Object.entries(file.categories)
          .map(([cat, count]) => `${cat}: ${count}`)
          .join(', ')
        logFn(`      Categories: ${categories}`)
      }
    }

    logFn('')
  }

  if (report.suggestions.length > 0) {
    logFn(chalk.gray('  Improvement Suggestions:'))
    for (const suggestion of report.suggestions) {
      logFn(`    ${chalk.yellow('•')} ${suggestion}`)
    }

    logFn('')
  }
}

export {getGrade, getScoreColor} from '../utils/formatting.js'