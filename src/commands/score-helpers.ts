import { type RuleViolation } from '../ast/visitor.js'
import { MAX_TOP_STATS_FILES } from '../utils/constants.js'
import {
  calculateCategoryScore,
  calculateCorrectnessScore,
  calculateOverallScore,
} from './score-calculations.js'
import { generateSuggestions } from './score-formatting.js'

// Re-export for backward compatibility

export interface CategoryScore {
  score: number
  violations: number
  weight: number
}

export interface FileScore {
  categories: Record<string, number>
  filePath: string
  score: number
  violations: number
}

export interface ScoreReport {
  categories: {
    complexity: CategoryScore
    correctness: CategoryScore
    patterns: CategoryScore
    security: CategoryScore
  }
  overall: number
  path: string
  suggestions: string[]
  summary: {
    filesAnalyzed: number
    totalViolations: number
    violationsPerFile: number
  }
  topFiles: FileScore[]
}

export interface CategoryViolationCounts {
  complexity: number
  correctness: number
  patterns: number
  security: number
}

export function buildCategoryCounts(
  violationsWithPath: RuleViolation[],
  getRuleCategoryFn: (ruleId: string) => string,
): CategoryViolationCounts {
  let complexity = 0
  let correctness = 0
  let security = 0
  let patterns = 0

  for (const v of violationsWithPath) {
    const cat = getRuleCategoryFn(v.ruleId)
    switch (cat) {
      case 'complexity': {
        complexity++
        break
      }

      case 'correctness': {
        correctness++
        break
      }

      case 'patterns': {
        patterns++
        break
      }

      case 'security': {
        security++
        break
      }
    }
  }

  return { complexity, correctness, patterns, security }
}

export function buildFileCategoryCounts(
  violationsWithPath: RuleViolation[],
  getRuleCategoryFn: (ruleId: string) => string,
): Record<string, number> {
  const categoryCounts: Record<string, number> = {}
  for (const violation of violationsWithPath) {
    const category = getRuleCategoryFn(violation.ruleId)
    categoryCounts[category] = (categoryCounts[category] || 0) + 1
  }

  return categoryCounts
}

// eslint-disable-next-line max-params
export function buildScoreReport(
  categoryViolations: CategoryViolationCounts,
  totalFunctions: number,
  documentedFunctions: number,
  fileScores: FileScore[],
  allViolations: RuleViolation[],
  filesToProcess: number,
  targetPath: string,
): ScoreReport {
  const categories = {
    complexity: calculateCategoryScore(categoryViolations.complexity, 0.3),
    correctness: calculateCorrectnessScore(
      categoryViolations.correctness,
      totalFunctions,
      documentedFunctions,
      0.25,
    ),
    patterns: calculateCategoryScore(categoryViolations.patterns, 0.15),
    security: calculateCategoryScore(categoryViolations.security, 0.3),
  }

  const overall = calculateOverallScore(categories)
  const suggestions = generateSuggestions(categories, allViolations, fileScores)

  return {
    categories: {
      complexity: {
        score: Math.round(categories.complexity.score),
        violations: categoryViolations.complexity,
        weight: categories.complexity.weight,
      },
      correctness: {
        score: Math.round(categories.correctness.score),
        violations: categoryViolations.correctness,
        weight: categories.correctness.weight,
      },
      patterns: {
        score: Math.round(categories.patterns.score),
        violations: categoryViolations.patterns,
        weight: categories.patterns.weight,
      },
      security: {
        score: Math.round(categories.security.score),
        violations: categoryViolations.security,
        weight: categories.security.weight,
      },
    },
    overall,
    path: targetPath,
    suggestions,
    summary: {
      filesAnalyzed: filesToProcess,
      totalViolations: allViolations.length,
      violationsPerFile: filesToProcess > 0 ? allViolations.length / filesToProcess : 0,
    },
    topFiles: fileScores.slice(0, MAX_TOP_STATS_FILES),
  }
}

export {
  calculateCategoryScore,
  calculateCorrectnessScore,
  calculateFileScore,
  calculateOverallScore,
  countDocumentedFunctions,
} from './score-calculations.js'
export {
  formatDisplayOutput,
  formatScore,
  generateSuggestions,
  getGrade,
  getScoreColor,
} from './score-formatting.js'
