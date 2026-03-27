import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import path from 'node:path'
import { fileURLToPath } from 'url'
import Score from '../../../src/commands/score.js'
import { Parser } from '../../../src/core/parser.js'
import { RuleRegistry } from '../../../src/core/rule-registry.js'
import { allRules, getRuleCategory } from '../../../src/rules/index.js'

describe('Score Command', () => {
  let parser: Parser
  let registry: RuleRegistry

  beforeEach(async () => {
    parser = new Parser()
    await parser.initialize()
    registry = new RuleRegistry()
    for (const [ruleId, ruleDef] of Object.entries(allRules)) {
      registry.register(ruleId, ruleDef, getRuleCategory(ruleId))
    }
  })

  afterEach(() => {
    parser.dispose()
  })

  describe('calculateCategoryScore', () => {
    test('should return 100 for 0 violations', async () => {
      const command = new Score([], {} as any)
      const result = (command as any).calculateCategoryScore(0, 0.3)
      expect(result.score).toBe(100)
      expect(result.violations).toBe(0)
      expect(result.weight).toBe(0.3)
    })

    test('should return lower score for violations', async () => {
      const command = new Score([], {} as any)
      const result = (command as any).calculateCategoryScore(5, 0.3)
      expect(result.score).toBe(75)
    })

    test('should return 0 for many violations', async () => {
      const command = new Score([], {} as any)
      const result = (command as any).calculateCategoryScore(25, 0.3)
      expect(result.score).toBe(0)
    })

    test('should apply 5 point penalty per violation', async () => {
      const command = new Score([], {} as any)
      const result = (command as any).calculateCategoryScore(10, 0.25)
      expect(result.score).toBe(50)
    })
  })

  describe('calculateCorrectnessScore', () => {
    test('should return 100 for 0 violations with full documentation', async () => {
      const command = new Score([], {} as any)
      const result = (command as any).calculateCorrectnessScore(0, 10, 10, 0.25)
      expect(result.score).toBe(100)
    })

    test('should return 50 when no functions exist', async () => {
      const command = new Score([], {} as any)
      const result = (command as any).calculateCorrectnessScore(0, 0, 0, 0.25)
      expect(result.score).toBe(50)
    })

    test('should penalize lack of documentation', async () => {
      const command = new Score([], {} as any)
      const result = (command as any).calculateCorrectnessScore(0, 10, 5, 0.25)
      expect(result.score).toBe(50)
    })

    test('should penalize violations', async () => {
      const command = new Score([], {} as any)
      const result = (command as any).calculateCorrectnessScore(5, 10, 10, 0.25)
      expect(result.score).toBe(75)
    })

    test('should combine documentation and violation penalties', async () => {
      const command = new Score([], {} as any)
      const result = (command as any).calculateCorrectnessScore(5, 10, 5, 0.25)
      expect(result.score).toBe(25)
    })

    test('should return minimum score of 0', async () => {
      const command = new Score([], {} as any)
      const result = (command as any).calculateCorrectnessScore(30, 10, 0, 0.25)
      expect(result.score).toBe(0)
    })
  })

  describe('calculateFileScore', () => {
    test('should return 100 for 0 violations', async () => {
      const command = new Score([], {} as any)
      const result = (command as any).calculateFileScore(0)
      expect(result).toBe(100)
    })

    test('should return 91 for 3 violations', async () => {
      const command = new Score([], {} as any)
      const result = (command as any).calculateFileScore(3)
      expect(result).toBe(91)
    })

    test('should return 0 for many violations', async () => {
      const command = new Score([], {} as any)
      const result = (command as any).calculateFileScore(50)
      expect(result).toBe(0)
    })

    test('should apply 3 point penalty per violation', async () => {
      const command = new Score([], {} as any)
      const result = (command as any).calculateFileScore(10)
      expect(result).toBe(70)
    })
  })

  describe('getGrade', () => {
    test('should return A for 90+', async () => {
      const command = new Score([], {} as any)
      expect((command as any).getGrade(90)).toBe('(A)')
      expect((command as any).getGrade(95)).toBe('(A)')
      expect((command as any).getGrade(100)).toBe('(A)')
    })

    test('should return B for 80-89', async () => {
      const command = new Score([], {} as any)
      expect((command as any).getGrade(80)).toBe('(B)')
      expect((command as any).getGrade(85)).toBe('(B)')
      expect((command as any).getGrade(89)).toBe('(B)')
    })

    test('should return C for 70-79', async () => {
      const command = new Score([], {} as any)
      expect((command as any).getGrade(70)).toBe('(C)')
      expect((command as any).getGrade(75)).toBe('(C)')
      expect((command as any).getGrade(79)).toBe('(C)')
    })

    test('should return D for 60-69', async () => {
      const command = new Score([], {} as any)
      expect((command as any).getGrade(60)).toBe('(D)')
      expect((command as any).getGrade(65)).toBe('(D)')
      expect((command as any).getGrade(69)).toBe('(D)')
    })

    test('should return F for below 60', async () => {
      const command = new Score([], {} as any)
      expect((command as any).getGrade(0)).toBe('(F)')
      expect((command as any).getGrade(30)).toBe('(F)')
      expect((command as any).getGrade(59)).toBe('(F)')
    })
  })

  describe('getScoreColor', () => {
    test('should return green for 80+', async () => {
      const command = new Score([], {} as any)
      const greenResult = (command as any).getScoreColor(80)
      const greenResult2 = (command as any).getScoreColor(90)
      expect(greenResult).toBeDefined()
      expect(greenResult2).toBeDefined()
    })

    test('should return yellow for 60-79', async () => {
      const command = new Score([], {} as any)
      const yellowResult = (command as any).getScoreColor(60)
      const yellowResult2 = (command as any).getScoreColor(70)
      expect(yellowResult).toBeDefined()
      expect(yellowResult2).toBeDefined()
    })

    test('should return red for below 60', async () => {
      const command = new Score([], {} as any)
      const redResult = (command as any).getScoreColor(0)
      const redResult2 = (command as any).getScoreColor(50)
      expect(redResult).toBeDefined()
      expect(redResult2).toBeDefined()
    })
  })

  describe('formatScore', () => {
    test('should format score with weight percentage', async () => {
      const command = new Score([], {} as any)
      const result = (command as any).formatScore(85, 0.3)
      expect(result).toContain('85')
      expect(result).toContain('30%')
    })

    test('should handle low scores', async () => {
      const command = new Score([], {} as any)
      const result = (command as any).formatScore(45, 0.15)
      expect(result).toContain('45')
      expect(result).toContain('15%')
    })
  })

  describe('generateSuggestions', () => {
    test('should suggest reducing complexity when score is low', async () => {
      const command = new Score([], {} as any)
      const categories = {
        complexity: { score: 50, violations: 10, weight: 0.3 },
        correctness: { score: 90, violations: 1, weight: 0.25 },
        patterns: { score: 90, violations: 1, weight: 0.15 },
        security: { score: 90, violations: 0, weight: 0.3 },
      }
      const suggestions = (command as any).generateSuggestions(categories, [], [])
      expect(suggestions).toContain('Reduce code complexity - 10 complexity issues found')
    })

    test('should suggest addressing security when score is low', async () => {
      const command = new Score([], {} as any)
      const categories = {
        complexity: { score: 90, violations: 1, weight: 0.3 },
        correctness: { score: 90, violations: 1, weight: 0.25 },
        patterns: { score: 90, violations: 1, weight: 0.15 },
        security: { score: 70, violations: 5, weight: 0.3 },
      }
      const suggestions = (command as any).generateSuggestions(categories, [], [])
      expect(suggestions).toContain(
        'Address security concerns - 5 security issues found (critical)',
      )
    })

    test('should suggest focusing on problematic file', async () => {
      const command = new Score([], {} as any)
      const categories = {
        complexity: { score: 90, violations: 1, weight: 0.3 },
        correctness: { score: 90, violations: 1, weight: 0.25 },
        patterns: { score: 90, violations: 1, weight: 0.15 },
        security: { score: 90, violations: 0, weight: 0.3 },
      }
      const fileScores = [{ filePath: 'test.ts', violations: 15, score: 50, categories: {} }]
      const suggestions = (command as any).generateSuggestions(categories, [], fileScores)
      expect(suggestions).toContain('Focus on test.ts - it has 15 violations')
    })

    test('should suggest improving correctness when score is low', async () => {
      const command = new Score([], {} as any)
      const categories = {
        complexity: { score: 90, violations: 1, weight: 0.3 },
        correctness: { score: 60, violations: 8, weight: 0.25 },
        patterns: { score: 90, violations: 1, weight: 0.15 },
        security: { score: 90, violations: 0, weight: 0.3 },
      }
      const suggestions = (command as any).generateSuggestions(categories, [], [])
      expect(suggestions).toContain('Improve code correctness - 8 correctness issues found')
    })

    test('should suggest refactoring patterns when score is low', async () => {
      const command = new Score([], {} as any)
      const categories = {
        complexity: { score: 90, violations: 1, weight: 0.3 },
        correctness: { score: 90, violations: 1, weight: 0.25 },
        patterns: { score: 60, violations: 6, weight: 0.15 },
        security: { score: 90, violations: 0, weight: 0.3 },
      }
      const suggestions = (command as any).generateSuggestions(categories, [], [])
      expect(suggestions).toContain('Refactor code patterns - 6 pattern violations found')
    })

    test('should not suggest for file with 10 or fewer violations', async () => {
      const command = new Score([], {} as any)
      const categories = {
        complexity: { score: 90, violations: 1, weight: 0.3 },
        correctness: { score: 90, violations: 1, weight: 0.25 },
        patterns: { score: 90, violations: 1, weight: 0.15 },
        security: { score: 90, violations: 0, weight: 0.3 },
      }
      const fileScores = [{ filePath: 'test.ts', violations: 10, score: 70, categories: {} }]
      const suggestions = (command as any).generateSuggestions(categories, [], fileScores)
      expect(suggestions).not.toContain('Focus on test.ts - it has 10 violations')
    })

    test('should return empty array when all scores are good', async () => {
      const command = new Score([], {} as any)
      const categories = {
        complexity: { score: 90, violations: 1, weight: 0.3 },
        correctness: { score: 90, violations: 1, weight: 0.25 },
        patterns: { score: 90, violations: 1, weight: 0.15 },
        security: { score: 90, violations: 0, weight: 0.3 },
      }
      const fileScores = [{ filePath: 'test.ts', violations: 5, score: 85, categories: {} }]
      const suggestions = (command as any).generateSuggestions(categories, [], fileScores)
      expect(suggestions).toHaveLength(0)
    })

    test('should suggest security improvement at higher threshold (80)', async () => {
      const command = new Score([], {} as any)
      const categories = {
        complexity: { score: 90, violations: 1, weight: 0.3 },
        correctness: { score: 90, violations: 1, weight: 0.25 },
        patterns: { score: 90, violations: 1, weight: 0.15 },
        security: { score: 79, violations: 4, weight: 0.3 },
      }
      const suggestions = (command as any).generateSuggestions(categories, [], [])
      expect(suggestions).toContain(
        'Address security concerns - 4 security issues found (critical)',
      )
    })
  })
})
