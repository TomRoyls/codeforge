import { type CategoryScore } from './score-helpers.js'

export function calculateCategoryScore(violations: number, weight: number): CategoryScore {
  const score = Math.max(0, 100 - violations * 5)
  return { score, violations, weight }
}

export function calculateCorrectnessScore(
  violations: number,
  totalFunctions: number,
  documentedFunctions: number,
  weight: number,
): CategoryScore {
  const coverage = totalFunctions > 0 ? (documentedFunctions / totalFunctions) * 100 : 50
  const penalty = violations * 5
  const score = Math.max(0, coverage - penalty)
  return { score, violations, weight }
}

export function calculateFileScore(violations: number): number {
  return Math.max(0, 100 - violations * 3)
}

export function calculateOverallScore(categories: {
  complexity: CategoryScore
  correctness: CategoryScore
  patterns: CategoryScore
  security: CategoryScore
}): number {
  return Math.round(
    categories.complexity.score * categories.complexity.weight +
      categories.correctness.score * categories.correctness.weight +
      categories.security.score * categories.security.weight +
      categories.patterns.score * categories.patterns.weight,
  )
}

export function countDocumentedFunctions(functions: Array<{ getJsDocs: () => unknown[] }>): number {
  let count = 0
  for (const fn of functions) {
    if (fn.getJsDocs().length > 0) {
      count++
    }
  }

  return count
}
