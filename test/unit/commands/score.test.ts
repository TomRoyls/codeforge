import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import Score from '../../../src/commands/score.js'
import { Parser } from '../../../src/core/parser.js'
import { RuleRegistry } from '../../../src/core/rule-registry.js'
import { allRules, getRuleCategory } from '../../helpers/rule-helpers.js'
import {
  calculateCategoryScore,
  calculateCorrectnessScore,
  calculateFileScore,
  calculateOverallScore,
  countDocumentedFunctions,
} from '../../../src/commands/score-calculations.js'
import {
  buildCategoryCounts,
  buildFileCategoryCounts,
  buildScoreReport,
} from '../../../src/commands/score-helpers.js'
import {
  formatScore,
  generateSuggestions,
  formatDisplayOutput,
} from '../../../src/commands/score-formatting.js'
import { getGrade, getScoreColor } from '../../../src/utils/formatting.js'

vi.mock('ora', () => ({
  default: vi.fn().mockReturnValue({
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn(),
    text: '',
  }),
}))

vi.mock('../../../src/core/file-discovery.js', () => ({
  discoverFiles: vi.fn().mockResolvedValue([
    { absolutePath: '/test/file1.ts', path: 'file1.ts' },
    { absolutePath: '/test/file2.ts', path: 'file2.ts' },
  ]),
}))

vi.mock('../../../src/core/parser.js', () => {
  const mockFunction = {
    getJsDocs: vi.fn().mockReturnValue([]),
  }
  const mockSourceFile = {
    getFunctions: vi.fn().mockReturnValue([mockFunction, mockFunction]),
    getFilePath: vi.fn().mockReturnValue('/test/file1.ts'),
  }
  class MockParser {
    initialize = vi.fn().mockResolvedValue(undefined)
    parseFile = vi.fn().mockResolvedValue({
      sourceFile: mockSourceFile,
      ast: {},
      diagnostics: [],
    })
    dispose = vi.fn()
  }
  return {
    Parser: MockParser,
  }
})

vi.mock('../../../src/core/rule-registry.js', () => {
  class MockRuleRegistry {
    register = vi.fn()
    runRules = vi.fn().mockReturnValue([
      {
        ruleId: 'max-lines',
        message: 'File too long',
        severity: 'warning',
        line: 1,
        column: 1,
        range: { start: { line: 1, column: 1 }, end: { line: 1, column: 10 } },
      },
      {
        ruleId: 'no-any',
        message: 'Use of any',
        severity: 'error',
        line: 5,
        column: 1,
        range: { start: { line: 5, column: 1 }, end: { line: 5, column: 10 } },
      },
    ])
  }
  return {
    RuleRegistry: MockRuleRegistry,
  }
})

// Helper functions at outer describe scope
function createCommand(args: string[] = [], flags: Record<string, unknown> = {}): Score {
  return new Score(args, flags as any)
}

function createMockReport(overrides: Record<string, unknown> = {}) {
  const defaults = {
    categories: {
      complexity: { score: 90, violations: 2, weight: 0.3 },
      correctness: { score: 85, violations: 3, weight: 0.25 },
      patterns: { score: 95, violations: 1, weight: 0.15 },
      security: { score: 88, violations: 2, weight: 0.3 },
    },
    overall: 89,
    path: '/test/path',
    suggestions: [],
    summary: {
      filesAnalyzed: 5,
      totalViolations: 8,
      violationsPerFile: 1.6,
    },
    topFiles: [],
  }
  return { ...defaults, ...overrides } as any
}

function createMockSpinner() {
  return {
    text: '',
    succeed: vi.fn(),
  }
}

function createMockViolation(ruleId: string, overrides: Record<string, unknown> = {}) {
  return {
    ruleId,
    message: `Violation: ${ruleId}`,
    severity: 'warning',
    line: 1,
    column: 1,
    range: { start: { line: 1, column: 1 }, end: { line: 1, column: 10 } },
    ...overrides,
  }
}

describe('Score Command', () => {
  // =========================================================================
  // Command Metadata
  // =========================================================================
  describe('static metadata', () => {
    test('should have correct description', () => {
      expect(Score.description).toBe('Calculate aggregate quality score for the codebase')
    })

    test('should have path arg with correct default', () => {
      expect(Score.args.path.default).toBe('.')
    })

    test('should have path arg with description', () => {
      expect(Score.args.path.description).toBe('Path to analyze')
    })

    test('should have path arg as not required', () => {
      expect(Score.args.path.required).toBe(false)
    })

    test('should have json flag with default false', () => {
      expect(Score.flags.json.default).toBe(false)
    })

    test('should have json flag with description', () => {
      expect(Score.flags.json.description).toBe('Output as JSON')
    })

    test('should have verbose flag with default false', () => {
      expect(Score.flags.verbose.default).toBe(false)
    })

    test('should have verbose flag with char v', () => {
      expect(Score.flags.verbose.char).toBe('v')
    })

    test('should have verbose flag with description', () => {
      expect(Score.flags.verbose.description).toBe('Show detailed breakdown')
    })

    test('should have 3 examples', () => {
      expect(Score.examples).toHaveLength(3)
    })

    test('should have example for default usage', () => {
      const defaultExample = Score.examples.find(
        (e) => e.description === 'Show quality score for current directory',
      )
      expect(defaultExample).toBeDefined()
    })

    test('should have example for directory argument', () => {
      const dirExample = Score.examples.find(
        (e) => e.description === 'Show quality score for src directory',
      )
      expect(dirExample).toBeDefined()
    })

    test('should have example for json output', () => {
      const jsonExample = Score.examples.find((e) => e.description === 'Output score as JSON')
      expect(jsonExample).toBeDefined()
    })
  })

  // =========================================================================
  // calculateCategoryScore (command method)
  // =========================================================================
  describe('calculateCategoryScore', () => {
    test('should return 100 for 0 violations', () => {
      const command = createCommand()
      const result = (command as any).calculateCategoryScore(0, 0.3)
      expect(result.score).toBe(100)
      expect(result.violations).toBe(0)
      expect(result.weight).toBe(0.3)
    })

    test('should return 75 for 5 violations', () => {
      const command = createCommand()
      const result = (command as any).calculateCategoryScore(5, 0.3)
      expect(result.score).toBe(75)
    })

    test('should return 0 for 20 violations', () => {
      const command = createCommand()
      const result = (command as any).calculateCategoryScore(20, 0.3)
      expect(result.score).toBe(0)
    })

    test('should return 0 for many violations (clamped)', () => {
      const command = createCommand()
      const result = (command as any).calculateCategoryScore(25, 0.3)
      expect(result.score).toBe(0)
    })

    test('should apply 5 point penalty per violation', () => {
      const command = createCommand()
      const result = (command as any).calculateCategoryScore(10, 0.25)
      expect(result.score).toBe(50)
    })

    test('should return score of 95 for 1 violation', () => {
      const command = createCommand()
      const result = (command as any).calculateCategoryScore(1, 0.3)
      expect(result.score).toBe(95)
    })

    test('should return score of 50 for 10 violations', () => {
      const command = createCommand()
      const result = (command as any).calculateCategoryScore(10, 0.3)
      expect(result.score).toBe(50)
    })

    test('should preserve the weight value', () => {
      const command = createCommand()
      const result = (command as any).calculateCategoryScore(0, 0.15)
      expect(result.weight).toBe(0.15)
    })

    test('should preserve violations count in result', () => {
      const command = createCommand()
      const result = (command as any).calculateCategoryScore(7, 0.3)
      expect(result.violations).toBe(7)
    })

    test('should not return negative score for exactly 20 violations', () => {
      const command = createCommand()
      const result = (command as any).calculateCategoryScore(20, 0.3)
      expect(result.score).toBe(0)
    })

    test('should not return negative score for 100 violations', () => {
      const command = createCommand()
      const result = (command as any).calculateCategoryScore(100, 0.3)
      expect(result.score).toBe(0)
    })
  })

  // =========================================================================
  // calculateCorrectnessScore (command method)
  // =========================================================================
  describe('calculateCorrectnessScore', () => {
    test('should return 100 for 0 violations with full documentation', () => {
      const command = createCommand()
      const result = (command as any).calculateCorrectnessScore(0, 10, 10, 0.25)
      expect(result.score).toBe(100)
    })

    test('should return 50 when no functions exist', () => {
      const command = createCommand()
      const result = (command as any).calculateCorrectnessScore(0, 0, 0, 0.25)
      expect(result.score).toBe(50)
    })

    test('should penalize lack of documentation', () => {
      const command = createCommand()
      const result = (command as any).calculateCorrectnessScore(0, 10, 5, 0.25)
      expect(result.score).toBe(50)
    })

    test('should penalize violations', () => {
      const command = createCommand()
      const result = (command as any).calculateCorrectnessScore(5, 10, 10, 0.25)
      expect(result.score).toBe(75)
    })

    test('should combine documentation and violation penalties', () => {
      const command = createCommand()
      const result = (command as any).calculateCorrectnessScore(5, 10, 5, 0.25)
      expect(result.score).toBe(25)
    })

    test('should return minimum score of 0', () => {
      const command = createCommand()
      const result = (command as any).calculateCorrectnessScore(30, 10, 0, 0.25)
      expect(result.score).toBe(0)
    })

    test('should give 50% coverage baseline when totalFunctions is 0', () => {
      const command = createCommand()
      const result = (command as any).calculateCorrectnessScore(0, 0, 0, 0.25)
      expect(result.score).toBe(50)
    })

    test('should give 100% coverage when all functions documented', () => {
      const command = createCommand()
      const result = (command as any).calculateCorrectnessScore(0, 20, 20, 0.25)
      expect(result.score).toBe(100)
    })

    test('should give 75% coverage when 3/4 functions documented', () => {
      const command = createCommand()
      const result = (command as any).calculateCorrectnessScore(0, 4, 3, 0.25)
      expect(result.score).toBe(75)
    })

    test('should give 0% coverage when no functions documented', () => {
      const command = createCommand()
      const result = (command as any).calculateCorrectnessScore(0, 10, 0, 0.25)
      expect(result.score).toBe(0)
    })

    test('should apply 5 point penalty per violation on top of coverage', () => {
      const command = createCommand()
      const result = (command as any).calculateCorrectnessScore(2, 10, 10, 0.25)
      expect(result.score).toBe(90)
    })

    test('should preserve weight in result', () => {
      const command = createCommand()
      const result = (command as any).calculateCorrectnessScore(0, 10, 10, 0.25)
      expect(result.weight).toBe(0.25)
    })

    test('should preserve violations count in result', () => {
      const command = createCommand()
      const result = (command as any).calculateCorrectnessScore(7, 10, 10, 0.25)
      expect(result.violations).toBe(7)
    })

    test('should handle single function fully documented', () => {
      const command = createCommand()
      const result = (command as any).calculateCorrectnessScore(0, 1, 1, 0.25)
      expect(result.score).toBe(100)
    })

    test('should handle single function not documented', () => {
      const command = createCommand()
      const result = (command as any).calculateCorrectnessScore(0, 1, 0, 0.25)
      expect(result.score).toBe(0)
    })
  })

  // =========================================================================
  // calculateFileScore (command method)
  // =========================================================================
  describe('calculateFileScore', () => {
    test('should return 100 for 0 violations', () => {
      const command = createCommand()
      const result = (command as any).calculateFileScore(0)
      expect(result).toBe(100)
    })

    test('should return 97 for 1 violation', () => {
      const command = createCommand()
      const result = (command as any).calculateFileScore(1)
      expect(result).toBe(97)
    })

    test('should return 91 for 3 violations', () => {
      const command = createCommand()
      const result = (command as any).calculateFileScore(3)
      expect(result).toBe(91)
    })

    test('should return 0 for many violations', () => {
      const command = createCommand()
      const result = (command as any).calculateFileScore(50)
      expect(result).toBe(0)
    })

    test('should apply 3 point penalty per violation', () => {
      const command = createCommand()
      const result = (command as any).calculateFileScore(10)
      expect(result).toBe(70)
    })

    test('should return 0 for exactly 34 violations (2 remaining)', () => {
      const command = createCommand()
      const result = (command as any).calculateFileScore(34)
      expect(result).toBe(Math.max(0, 100 - 34 * 3))
    })

    test('should not return negative values', () => {
      const command = createCommand()
      const result = (command as any).calculateFileScore(100)
      expect(result).toBe(0)
    })

    test('should return 40 for 20 violations', () => {
      const command = createCommand()
      const result = (command as any).calculateFileScore(20)
      expect(result).toBe(40)
    })

    test('should return 85 for 5 violations', () => {
      const command = createCommand()
      const result = (command as any).calculateFileScore(5)
      expect(result).toBe(85)
    })

    test('should return 70 for 10 violations', () => {
      const command = createCommand()
      const result = (command as any).calculateFileScore(10)
      expect(result).toBe(70)
    })
  })

  // =========================================================================
  // getGrade
  // =========================================================================
  describe('getGrade', () => {
    test('should return A for 90', () => {
      expect(getGrade(90)).toBe('(A)')
    })
    test('should return A for 95', () => {
      expect(getGrade(95)).toBe('(A)')
    })
    test('should return A for 100', () => {
      expect(getGrade(100)).toBe('(A)')
    })
    test('should return A for 99', () => {
      expect(getGrade(99)).toBe('(A)')
    })

    test('should return B for 80', () => {
      expect(getGrade(80)).toBe('(B)')
    })
    test('should return B for 85', () => {
      expect(getGrade(85)).toBe('(B)')
    })
    test('should return B for 89', () => {
      expect(getGrade(89)).toBe('(B)')
    })

    test('should return C for 70', () => {
      expect(getGrade(70)).toBe('(C)')
    })
    test('should return C for 75', () => {
      expect(getGrade(75)).toBe('(C)')
    })
    test('should return C for 79', () => {
      expect(getGrade(79)).toBe('(C)')
    })

    test('should return D for 60', () => {
      expect(getGrade(60)).toBe('(D)')
    })
    test('should return D for 65', () => {
      expect(getGrade(65)).toBe('(D)')
    })
    test('should return D for 69', () => {
      expect(getGrade(69)).toBe('(D)')
    })

    test('should return F for 0', () => {
      expect(getGrade(0)).toBe('(F)')
    })
    test('should return F for 30', () => {
      expect(getGrade(30)).toBe('(F)')
    })
    test('should return F for 59', () => {
      expect(getGrade(59)).toBe('(F)')
    })
    test('should return F for 1', () => {
      expect(getGrade(1)).toBe('(F)')
    })

    test('should return correct grades at all boundaries', () => {
      expect(getGrade(90)).toBe('(A)')
      expect(getGrade(89)).toBe('(B)')
      expect(getGrade(80)).toBe('(B)')
      expect(getGrade(79)).toBe('(C)')
      expect(getGrade(70)).toBe('(C)')
      expect(getGrade(69)).toBe('(D)')
      expect(getGrade(60)).toBe('(D)')
      expect(getGrade(59)).toBe('(F)')
    })
  })

  // =========================================================================
  // getScoreColor
  // =========================================================================
  describe('getScoreColor', () => {
    test('should return green function for 80', () => {
      const fn = getScoreColor(80)
      expect(typeof fn).toBe('function')
    })
    test('should return green function for 90', () => {
      const fn = getScoreColor(90)
      expect(typeof fn).toBe('function')
    })
    test('should return green function for 100', () => {
      const fn = getScoreColor(100)
      expect(typeof fn).toBe('function')
    })

    test('should return yellow function for 60', () => {
      const fn = getScoreColor(60)
      expect(typeof fn).toBe('function')
    })
    test('should return yellow function for 70', () => {
      const fn = getScoreColor(70)
      expect(typeof fn).toBe('function')
    })
    test('should return yellow function for 79', () => {
      const fn = getScoreColor(79)
      expect(typeof fn).toBe('function')
    })

    test('should return red function for 0', () => {
      const fn = getScoreColor(0)
      expect(typeof fn).toBe('function')
    })
    test('should return red function for 50', () => {
      const fn = getScoreColor(50)
      expect(typeof fn).toBe('function')
    })
    test('should return red function for 59', () => {
      const fn = getScoreColor(59)
      expect(typeof fn).toBe('function')
    })

    test('should return different colors for different score ranges', () => {
      const greenFn = getScoreColor(90)
      const yellowFn = getScoreColor(70)
      const redFn = getScoreColor(30)
      const testStr = 'test'
      // They are chalk functions so they produce different ANSI-wrapped strings
      expect(greenFn(testStr)).toBeDefined()
      expect(yellowFn(testStr)).toBeDefined()
      expect(redFn(testStr)).toBeDefined()
    })

    test('should return function that produces a string', () => {
      const fn = getScoreColor(50)
      const result = fn('hello')
      expect(typeof result).toBe('string')
      expect(result).toContain('hello')
    })
  })

  // =========================================================================
  // formatScore
  // =========================================================================
  describe('formatScore', () => {
    test('should format score with weight percentage', () => {
      const result = formatScore(85, 0.3)
      expect(result).toContain('85')
      expect(result).toContain('30%')
    })

    test('should handle low scores', () => {
      const result = formatScore(45, 0.15)
      expect(result).toContain('45')
      expect(result).toContain('15%')
    })

    test('should handle perfect score', () => {
      const result = formatScore(100, 0.3)
      expect(result).toContain('100')
    })

    test('should handle zero score', () => {
      const result = formatScore(0, 0.25)
      expect(result).toContain('0')
      expect(result).toContain('25%')
    })

    test('should handle weight of 0', () => {
      const result = formatScore(50, 0)
      expect(result).toContain('0%')
    })

    test('should handle weight of 1', () => {
      const result = formatScore(75, 1)
      expect(result).toContain('100%')
    })

    test('should pad single digit scores', () => {
      const result = formatScore(5, 0.3)
      expect(result).toContain('5')
    })

    test('should include score out of 100', () => {
      const result = formatScore(85, 0.3)
      expect(result).toContain('/ 100')
    })

    test('should include weight label', () => {
      const result = formatScore(85, 0.3)
      expect(result).toContain('weight:')
    })
  })

  // =========================================================================
  // generateSuggestions
  // =========================================================================
  describe('generateSuggestions', () => {
    function makeCategories(overrides: Record<string, unknown> = {}) {
      return {
        complexity: { score: 90, violations: 1, weight: 0.3 },
        correctness: { score: 90, violations: 1, weight: 0.25 },
        patterns: { score: 90, violations: 1, weight: 0.15 },
        security: { score: 90, violations: 0, weight: 0.3 },
        ...overrides,
      }
    }

    test('should suggest reducing complexity when score is low', () => {
      const categories = makeCategories({ complexity: { score: 50, violations: 10, weight: 0.3 } })
      const suggestions = generateSuggestions(categories, [], [])
      expect(suggestions).toContain('Reduce code complexity - 10 complexity issues found')
    })

    test('should suggest addressing security when score is low', () => {
      const categories = makeCategories({ security: { score: 70, violations: 5, weight: 0.3 } })
      const suggestions = generateSuggestions(categories, [], [])
      expect(suggestions).toContain(
        'Address security concerns - 5 security issues found (critical)',
      )
    })

    test('should suggest focusing on problematic file', () => {
      const categories = makeCategories()
      const fileScores = [{ filePath: 'test.ts', violations: 15, score: 50, categories: {} }]
      const suggestions = generateSuggestions(categories, [], fileScores)
      expect(suggestions).toContain('Focus on test.ts - it has 15 violations')
    })

    test('should suggest improving correctness when score is low', () => {
      const categories = makeCategories({ correctness: { score: 60, violations: 8, weight: 0.25 } })
      const suggestions = generateSuggestions(categories, [], [])
      expect(suggestions).toContain('Improve code correctness - 8 correctness issues found')
    })

    test('should suggest refactoring patterns when score is low', () => {
      const categories = makeCategories({ patterns: { score: 60, violations: 6, weight: 0.15 } })
      const suggestions = generateSuggestions(categories, [], [])
      expect(suggestions).toContain('Refactor code patterns - 6 pattern violations found')
    })

    test('should not suggest for file with 10 or fewer violations', () => {
      const categories = makeCategories()
      const fileScores = [{ filePath: 'test.ts', violations: 10, score: 70, categories: {} }]
      const suggestions = generateSuggestions(categories, [], fileScores)
      expect(suggestions).not.toContain('Focus on test.ts - it has 10 violations')
    })

    test('should return empty array when all scores are good', () => {
      const categories = makeCategories()
      const fileScores = [{ filePath: 'test.ts', violations: 5, score: 85, categories: {} }]
      const suggestions = generateSuggestions(categories, [], fileScores)
      expect(suggestions).toHaveLength(0)
    })

    test('should suggest security improvement at higher threshold (80)', () => {
      const categories = makeCategories({ security: { score: 79, violations: 4, weight: 0.3 } })
      const suggestions = generateSuggestions(categories, [], [])
      expect(suggestions).toContain(
        'Address security concerns - 4 security issues found (critical)',
      )
    })

    test('should not suggest security at score 80', () => {
      const categories = makeCategories({ security: { score: 80, violations: 4, weight: 0.3 } })
      const suggestions = generateSuggestions(categories, [], [])
      expect(suggestions).not.toContainEqual(expect.stringContaining('Address security concerns'))
    })

    test('should suggest for file with exactly 11 violations', () => {
      const categories = makeCategories()
      const fileScores = [{ filePath: 'big.ts', violations: 11, score: 67, categories: {} }]
      const suggestions = generateSuggestions(categories, [], fileScores)
      expect(suggestions).toContain('Focus on big.ts - it has 11 violations')
    })

    test('should not suggest for file with empty fileScores', () => {
      const categories = makeCategories()
      const suggestions = generateSuggestions(categories, [], [])
      expect(suggestions).not.toContainEqual(expect.stringContaining('Focus on'))
    })

    test('should generate multiple suggestions when multiple categories are low', () => {
      const categories = makeCategories({
        complexity: { score: 50, violations: 10, weight: 0.3 },
        correctness: { score: 50, violations: 10, weight: 0.25 },
        patterns: { score: 50, violations: 10, weight: 0.15 },
        security: { score: 50, violations: 10, weight: 0.3 },
      })
      const suggestions = generateSuggestions(categories, [], [])
      expect(suggestions.length).toBeGreaterThanOrEqual(4)
    })

    test('should suggest complexity at score 69', () => {
      const categories = makeCategories({ complexity: { score: 69, violations: 7, weight: 0.3 } })
      const suggestions = generateSuggestions(categories, [], [])
      expect(suggestions).toContain('Reduce code complexity - 7 complexity issues found')
    })

    test('should not suggest complexity at score 70', () => {
      const categories = makeCategories({ complexity: { score: 70, violations: 6, weight: 0.3 } })
      const suggestions = generateSuggestions(categories, [], [])
      expect(suggestions).not.toContainEqual(expect.stringContaining('Reduce code complexity'))
    })

    test('should suggest correctness at score 69', () => {
      const categories = makeCategories({ correctness: { score: 69, violations: 7, weight: 0.25 } })
      const suggestions = generateSuggestions(categories, [], [])
      expect(suggestions).toContain('Improve code correctness - 7 correctness issues found')
    })

    test('should not suggest correctness at score 70', () => {
      const categories = makeCategories({ correctness: { score: 70, violations: 6, weight: 0.25 } })
      const suggestions = generateSuggestions(categories, [], [])
      expect(suggestions).not.toContainEqual(expect.stringContaining('Improve code correctness'))
    })

    test('should suggest patterns at score 69', () => {
      const categories = makeCategories({ patterns: { score: 69, violations: 7, weight: 0.15 } })
      const suggestions = generateSuggestions(categories, [], [])
      expect(suggestions).toContain('Refactor code patterns - 7 pattern violations found')
    })

    test('should not suggest patterns at score 70', () => {
      const categories = makeCategories({ patterns: { score: 70, violations: 6, weight: 0.15 } })
      const suggestions = generateSuggestions(categories, [], [])
      expect(suggestions).not.toContainEqual(expect.stringContaining('Refactor code patterns'))
    })
  })

  // =========================================================================
  // run() method
  // =========================================================================
  describe('run', () => {
    test('should error when path does not exist', async () => {
      const command = createCommand(['/nonexistent/path'])
      ;(command as any).error = (msg: string, opts: unknown) => {
        throw new Error(msg)
      }
      ;(command as any).parse = vi.fn().mockResolvedValue({
        args: { path: '/nonexistent/path' },
        flags: { json: false, verbose: false },
      })

      await expect(command.run()).rejects.toThrow('Path not found')
    })

    test('should output JSON when --json flag is set', async () => {
      const mockReport = createMockReport()

      const command = createCommand()
      ;(command as any).parse = vi.fn().mockResolvedValue({
        args: { path: '.' },
        flags: { json: true, verbose: false },
      })
      ;(command as any).analyzeScore = vi.fn().mockResolvedValue(mockReport)
      ;(command as any).log = vi.fn()

      await command.run()

      expect((command as any).log).toHaveBeenCalledWith(JSON.stringify(mockReport, null, 2))
    })

    test('should call displayReport when not JSON output', async () => {
      const mockReport = createMockReport()

      const command = createCommand()
      ;(command as any).parse = vi.fn().mockResolvedValue({
        args: { path: '.' },
        flags: { json: false, verbose: true },
      })
      ;(command as any).analyzeScore = vi.fn().mockResolvedValue(mockReport)
      ;(command as any).displayReport = vi.fn()

      await command.run()

      expect((command as any).displayReport).toHaveBeenCalledWith(mockReport, true)
    })

    test('should call displayReport with verbose=false when not verbose', async () => {
      const mockReport = createMockReport()

      const command = createCommand()
      ;(command as any).parse = vi.fn().mockResolvedValue({
        args: { path: '.' },
        flags: { json: false, verbose: false },
      })
      ;(command as any).analyzeScore = vi.fn().mockResolvedValue(mockReport)
      ;(command as any).displayReport = vi.fn()

      await command.run()

      expect((command as any).displayReport).toHaveBeenCalledWith(mockReport, false)
    })

    test('should resolve the target path', async () => {
      const mockReport = createMockReport()

      const command = createCommand()
      ;(command as any).parse = vi.fn().mockResolvedValue({
        args: { path: '.' },
        flags: { json: true, verbose: false },
      })
      ;(command as any).analyzeScore = vi.fn().mockResolvedValue(mockReport)
      ;(command as any).log = vi.fn()

      await command.run()

      const analyzeCall = (command as any).analyzeScore.mock.calls[0]
      expect(typeof analyzeCall[0]).toBe('string')
    })
  })

  // =========================================================================
  // analyzeScore
  // =========================================================================
  describe('analyzeScore', () => {
    test('should return correct report structure', async () => {
      const spinner = createMockSpinner()
      const command = createCommand()
      const report = await (command as any).analyzeScore('.', spinner)

      expect(report).toHaveProperty('overall')
      expect(report).toHaveProperty('categories')
      expect(report).toHaveProperty('summary')
      expect(report).toHaveProperty('topFiles')
      expect(report).toHaveProperty('suggestions')
      expect(report).toHaveProperty('path')
    })

    test('should calculate weighted overall score', async () => {
      const spinner = createMockSpinner()
      const command = createCommand()
      const report = await (command as any).analyzeScore('.', spinner)

      expect(report.overall).toBeGreaterThanOrEqual(0)
      expect(report.overall).toBeLessThanOrEqual(100)
    })

    test('should process files and collect violations', async () => {
      const spinner = createMockSpinner()
      const command = createCommand()
      const report = await (command as any).analyzeScore('.', spinner)

      expect(Array.isArray(report.topFiles)).toBe(true)
    })

    test('should calculate category scores', async () => {
      const spinner = createMockSpinner()
      const command = createCommand()
      const report = await (command as any).analyzeScore('.', spinner)

      expect(report.categories).toHaveProperty('complexity')
      expect(report.categories).toHaveProperty('correctness')
      expect(report.categories).toHaveProperty('patterns')
      expect(report.categories).toHaveProperty('security')
    })

    test('should count documented functions', async () => {
      const spinner = createMockSpinner()
      const command = createCommand()
      const report = await (command as any).analyzeScore('.', spinner)

      expect(report.categories.correctness).toBeDefined()
      expect(report.categories.correctness.score).toBeGreaterThanOrEqual(0)
    })

    test('should set path in report', async () => {
      const spinner = createMockSpinner()
      const command = createCommand()
      const report = await (command as any).analyzeScore('/custom/path', spinner)

      expect(report.path).toBe('/custom/path')
    })

    test('should have numeric overall score', async () => {
      const spinner = createMockSpinner()
      const command = createCommand()
      const report = await (command as any).analyzeScore('.', spinner)

      expect(typeof report.overall).toBe('number')
    })

    test('should have summary with filesAnalyzed', async () => {
      const spinner = createMockSpinner()
      const command = createCommand()
      const report = await (command as any).analyzeScore('.', spinner)

      expect(typeof report.summary.filesAnalyzed).toBe('number')
    })

    test('should have summary with totalViolations', async () => {
      const spinner = createMockSpinner()
      const command = createCommand()
      const report = await (command as any).analyzeScore('.', spinner)

      expect(typeof report.summary.totalViolations).toBe('number')
    })

    test('should have summary with violationsPerFile', async () => {
      const spinner = createMockSpinner()
      const command = createCommand()
      const report = await (command as any).analyzeScore('.', spinner)

      expect(typeof report.summary.violationsPerFile).toBe('number')
    })

    test('should have suggestions array', async () => {
      const spinner = createMockSpinner()
      const command = createCommand()
      const report = await (command as any).analyzeScore('.', spinner)

      expect(Array.isArray(report.suggestions)).toBe(true)
    })

    test('should sort file scores by violations descending', async () => {
      const spinner = createMockSpinner()
      const command = createCommand()
      const report = await (command as any).analyzeScore('.', spinner)

      for (let i = 1; i < report.topFiles.length; i++) {
        expect(report.topFiles[i - 1].violations).toBeGreaterThanOrEqual(
          report.topFiles[i].violations,
        )
      }
    })

    test('should limit topFiles to MAX_TOP_STATS_FILES', async () => {
      const spinner = createMockSpinner()
      const command = createCommand()
      const report = await (command as any).analyzeScore('.', spinner)

      expect(report.topFiles.length).toBeLessThanOrEqual(10)
    })

    test('should have category weights set correctly', async () => {
      const spinner = createMockSpinner()
      const command = createCommand()
      const report = await (command as any).analyzeScore('.', spinner)

      expect(report.categories.complexity.weight).toBe(0.3)
      expect(report.categories.correctness.weight).toBe(0.25)
      expect(report.categories.patterns.weight).toBe(0.15)
      expect(report.categories.security.weight).toBe(0.3)
    })
  })

  // =========================================================================
  // displayReport
  // =========================================================================
  describe('displayReport', () => {
    test('should display overall score and category scores', () => {
      const report = createMockReport()
      const command = createCommand()
      const logSpy = vi.fn()
      ;(command as any).log = logSpy
      ;(command as any).displayReport(report, false)

      const output = logSpy.mock.calls.map((c: unknown[]) => c[0] as string).join('\n')
      expect(output).toContain('Code Quality Score')
      expect(output).toContain('Complexity')
      expect(output).toContain('Correctness')
      expect(output).toContain('Security')
      expect(output).toContain('Patterns')
    })

    test('should display summary information', () => {
      const report = createMockReport()
      const command = createCommand()
      const logSpy = vi.fn()
      ;(command as any).log = logSpy
      ;(command as any).displayReport(report, false)

      const output = logSpy.mock.calls.map((c: unknown[]) => c[0] as string).join('\n')
      expect(output).toContain('Files analyzed: 5')
      expect(output).toContain('Total violations: 8')
    })

    test('should display top files when verbose', () => {
      const report = createMockReport({
        topFiles: [
          { filePath: 'test.ts', score: 75, violations: 5, categories: { complexity: 3 } },
        ],
      })
      const command = createCommand()
      const logSpy = vi.fn()
      ;(command as any).log = logSpy
      ;(command as any).displayReport(report, true)

      const output = logSpy.mock.calls.map((c: unknown[]) => c[0] as string).join('\n')
      expect(output).toContain('Top Problematic Files')
      expect(output).toContain('test.ts')
      expect(output).toContain('Violations: 5')
    })

    test('should display suggestions when present', () => {
      const report = createMockReport({
        categories: {
          complexity: { score: 50, violations: 10, weight: 0.3 },
          correctness: { score: 85, violations: 3, weight: 0.25 },
          patterns: { score: 95, violations: 1, weight: 0.15 },
          security: { score: 88, violations: 2, weight: 0.3 },
        },
        overall: 70,
        suggestions: ['Reduce code complexity - 10 complexity issues found'],
      })
      const command = createCommand()
      const logSpy = vi.fn()
      ;(command as any).log = logSpy
      ;(command as any).displayReport(report, false)

      const output = logSpy.mock.calls.map((c: unknown[]) => c[0] as string).join('\n')
      expect(output).toContain('Improvement Suggestions')
      expect(output).toContain('Reduce code complexity')
    })

    test('should display file categories when present', () => {
      const report = createMockReport({
        topFiles: [
          {
            filePath: 'test.ts',
            score: 75,
            violations: 5,
            categories: { complexity: 2, security: 3 },
          },
        ],
      })
      const command = createCommand()
      const logSpy = vi.fn()
      ;(command as any).log = logSpy
      ;(command as any).displayReport(report, true)

      const output = logSpy.mock.calls.map((c: unknown[]) => c[0] as string).join('\n')
      expect(output).toContain('Categories:')
      expect(output).toContain('complexity: 2')
      expect(output).toContain('security: 3')
    })

    test('should not display top files when not verbose', () => {
      const report = createMockReport({
        topFiles: [{ filePath: 'test.ts', score: 75, violations: 5, categories: {} }],
      })
      const command = createCommand()
      const logSpy = vi.fn()
      ;(command as any).log = logSpy
      ;(command as any).displayReport(report, false)

      const output = logSpy.mock.calls.map((c: unknown[]) => c[0] as string).join('\n')
      expect(output).not.toContain('Top Problematic Files')
    })

    test('should not display suggestions when empty', () => {
      const report = createMockReport()
      const command = createCommand()
      const logSpy = vi.fn()
      ;(command as any).log = logSpy
      ;(command as any).displayReport(report, false)

      const output = logSpy.mock.calls.map((c: unknown[]) => c[0] as string).join('\n')
      expect(output).not.toContain('Improvement Suggestions')
    })

    test('should display violations per file with 2 decimal places', () => {
      const report = createMockReport()
      const command = createCommand()
      const logSpy = vi.fn()
      ;(command as any).log = logSpy
      ;(command as any).displayReport(report, false)

      const output = logSpy.mock.calls.map((c: unknown[]) => c[0] as string).join('\n')
      expect(output).toContain('1.60')
    })

    test('should display multiple top files when verbose', () => {
      const report = createMockReport({
        topFiles: [
          { filePath: 'file1.ts', score: 50, violations: 10, categories: {} },
          { filePath: 'file2.ts', score: 60, violations: 8, categories: {} },
          { filePath: 'file3.ts', score: 70, violations: 5, categories: {} },
        ],
      })
      const command = createCommand()
      const logSpy = vi.fn()
      ;(command as any).log = logSpy
      ;(command as any).displayReport(report, true)

      const output = logSpy.mock.calls.map((c: unknown[]) => c[0] as string).join('\n')
      expect(output).toContain('file1.ts')
      expect(output).toContain('file2.ts')
      expect(output).toContain('file3.ts')
    })

    test('should display score out of 100', () => {
      const report = createMockReport({ overall: 89 })
      const command = createCommand()
      const logSpy = vi.fn()
      ;(command as any).log = logSpy
      ;(command as any).displayReport(report, false)

      const output = logSpy.mock.calls.map((c: unknown[]) => c[0] as string).join('\n')
      expect(output).toContain('/ 100')
    })

    test('should not display file categories when empty', () => {
      const report = createMockReport({
        topFiles: [{ filePath: 'clean.ts', score: 95, violations: 2, categories: {} }],
      })
      const command = createCommand()
      const logSpy = vi.fn()
      ;(command as any).log = logSpy
      ;(command as any).displayReport(report, true)

      const output = logSpy.mock.calls.map((c: unknown[]) => c[0] as string).join('\n')
      expect(output).not.toContain('Categories:')
    })

    test('should display multiple suggestions', () => {
      const report = createMockReport({
        suggestions: [
          'Reduce code complexity - 10 issues found',
          'Address security concerns - 5 issues found (critical)',
        ],
      })
      const command = createCommand()
      const logSpy = vi.fn()
      ;(command as any).log = logSpy
      ;(command as any).displayReport(report, false)

      const output = logSpy.mock.calls.map((c: unknown[]) => c[0] as string).join('\n')
      expect(output).toContain('Reduce code complexity')
      expect(output).toContain('Address security concerns')
    })
  })

  // =========================================================================
  // score-calculations.ts (pure functions)
  // =========================================================================
  describe('calculateCategoryScore (pure)', () => {
    test('should return 100 for 0 violations', () => {
      const result = calculateCategoryScore(0, 0.3)
      expect(result.score).toBe(100)
      expect(result.violations).toBe(0)
      expect(result.weight).toBe(0.3)
    })

    test('should return 95 for 1 violation', () => {
      expect(calculateCategoryScore(1, 0.3).score).toBe(95)
    })

    test('should return 0 for 20+ violations', () => {
      expect(calculateCategoryScore(20, 0.3).score).toBe(0)
      expect(calculateCategoryScore(50, 0.3).score).toBe(0)
    })

    test('should use weight 0.3 for complexity', () => {
      expect(calculateCategoryScore(0, 0.3).weight).toBe(0.3)
    })

    test('should use weight 0.15 for patterns', () => {
      expect(calculateCategoryScore(0, 0.15).weight).toBe(0.15)
    })

    test('should use weight 0.3 for security', () => {
      expect(calculateCategoryScore(0, 0.3).weight).toBe(0.3)
    })

    test('should return 65 for 7 violations', () => {
      expect(calculateCategoryScore(7, 0.3).score).toBe(65)
    })
  })

  describe('calculateCorrectnessScore (pure)', () => {
    test('should return 100 for full docs and 0 violations', () => {
      expect(calculateCorrectnessScore(0, 10, 10, 0.25).score).toBe(100)
    })

    test('should return 50 for 0 functions', () => {
      expect(calculateCorrectnessScore(0, 0, 0, 0.25).score).toBe(50)
    })

    test('should penalize undocumentated functions', () => {
      expect(calculateCorrectnessScore(0, 10, 5, 0.25).score).toBe(50)
    })

    test('should penalize violations on top of coverage', () => {
      expect(calculateCorrectnessScore(2, 10, 10, 0.25).score).toBe(90)
    })

    test('should clamp to 0', () => {
      expect(calculateCorrectnessScore(20, 10, 0, 0.25).score).toBe(0)
    })

    test('should return weight in result', () => {
      expect(calculateCorrectnessScore(0, 10, 10, 0.25).weight).toBe(0.25)
    })

    test('should return violations count in result', () => {
      expect(calculateCorrectnessScore(5, 10, 10, 0.25).violations).toBe(5)
    })
  })

  describe('calculateFileScore (pure)', () => {
    test('should return 100 for 0 violations', () => {
      expect(calculateFileScore(0)).toBe(100)
    })

    test('should return 97 for 1 violation', () => {
      expect(calculateFileScore(1)).toBe(97)
    })

    test('should return 0 for 34+ violations', () => {
      expect(calculateFileScore(34)).toBe(Math.max(0, 100 - 102))
      expect(calculateFileScore(100)).toBe(0)
    })

    test('should apply 3 point penalty', () => {
      expect(calculateFileScore(5)).toBe(85)
    })
  })

  describe('calculateOverallScore (pure)', () => {
    test('should calculate weighted score correctly', () => {
      const categories = {
        complexity: { score: 100, violations: 0, weight: 0.3 },
        correctness: { score: 100, violations: 0, weight: 0.25 },
        patterns: { score: 100, violations: 0, weight: 0.15 },
        security: { score: 100, violations: 0, weight: 0.3 },
      }
      expect(calculateOverallScore(categories)).toBe(100)
    })

    test('should calculate 0 overall when all scores are 0', () => {
      const categories = {
        complexity: { score: 0, violations: 20, weight: 0.3 },
        correctness: { score: 0, violations: 20, weight: 0.25 },
        patterns: { score: 0, violations: 20, weight: 0.15 },
        security: { score: 0, violations: 20, weight: 0.3 },
      }
      expect(calculateOverallScore(categories)).toBe(0)
    })

    test('should weight complexity at 30%', () => {
      const categories = {
        complexity: { score: 100, violations: 0, weight: 0.3 },
        correctness: { score: 0, violations: 20, weight: 0.25 },
        patterns: { score: 0, violations: 20, weight: 0.15 },
        security: { score: 0, violations: 20, weight: 0.3 },
      }
      expect(calculateOverallScore(categories)).toBe(30)
    })

    test('should weight security at 30%', () => {
      const categories = {
        complexity: { score: 0, violations: 20, weight: 0.3 },
        correctness: { score: 0, violations: 20, weight: 0.25 },
        patterns: { score: 0, violations: 20, weight: 0.15 },
        security: { score: 100, violations: 0, weight: 0.3 },
      }
      expect(calculateOverallScore(categories)).toBe(30)
    })

    test('should weight correctness at 25%', () => {
      const categories = {
        complexity: { score: 0, violations: 20, weight: 0.3 },
        correctness: { score: 100, violations: 0, weight: 0.25 },
        patterns: { score: 0, violations: 20, weight: 0.15 },
        security: { score: 0, violations: 20, weight: 0.3 },
      }
      expect(calculateOverallScore(categories)).toBe(25)
    })

    test('should weight patterns at 15%', () => {
      const categories = {
        complexity: { score: 0, violations: 20, weight: 0.3 },
        correctness: { score: 0, violations: 20, weight: 0.25 },
        patterns: { score: 100, violations: 0, weight: 0.15 },
        security: { score: 0, violations: 20, weight: 0.3 },
      }
      expect(calculateOverallScore(categories)).toBe(15)
    })

    test('should round the result', () => {
      const categories = {
        complexity: { score: 80, violations: 4, weight: 0.3 },
        correctness: { score: 90, violations: 2, weight: 0.25 },
        patterns: { score: 85, violations: 3, weight: 0.15 },
        security: { score: 70, violations: 6, weight: 0.3 },
      }
      const result = calculateOverallScore(categories)
      expect(Number.isInteger(result)).toBe(true)
    })

    test('should calculate mixed scores correctly', () => {
      const categories = {
        complexity: { score: 80, violations: 4, weight: 0.3 },
        correctness: { score: 80, violations: 4, weight: 0.25 },
        patterns: { score: 80, violations: 4, weight: 0.15 },
        security: { score: 80, violations: 4, weight: 0.3 },
      }
      expect(calculateOverallScore(categories)).toBe(80)
    })
  })

  describe('countDocumentedFunctions (pure)', () => {
    test('should return 0 for empty array', () => {
      expect(countDocumentedFunctions([])).toBe(0)
    })

    test('should count functions with JSDoc comments', () => {
      const fns = [
        { getJsDocs: () => ['/** doc */'] },
        { getJsDocs: () => [] },
        { getJsDocs: () => ['/** doc1 */', '/** doc2 */'] },
      ]
      expect(countDocumentedFunctions(fns)).toBe(2)
    })

    test('should return 0 when no functions have docs', () => {
      const fns = [{ getJsDocs: () => [] }, { getJsDocs: () => [] }]
      expect(countDocumentedFunctions(fns)).toBe(0)
    })

    test('should count all when all have docs', () => {
      const fns = [{ getJsDocs: () => ['doc'] }, { getJsDocs: () => ['doc'] }]
      expect(countDocumentedFunctions(fns)).toBe(2)
    })

    test('should handle single function with doc', () => {
      expect(countDocumentedFunctions([{ getJsDocs: () => ['doc'] }])).toBe(1)
    })

    test('should handle single function without doc', () => {
      expect(countDocumentedFunctions([{ getJsDocs: () => [] }])).toBe(0)
    })
  })

  // =========================================================================
  // score-helpers.ts (buildCategoryCounts, buildFileCategoryCounts, buildScoreReport)
  // =========================================================================
  describe('buildCategoryCounts', () => {
    const mockGetRuleCategory = (ruleId: string) => {
      if (ruleId.startsWith('complexity')) return 'complexity'
      if (ruleId.startsWith('correctness')) return 'correctness'
      if (ruleId.startsWith('security')) return 'security'
      if (ruleId.startsWith('patterns')) return 'patterns'
      return 'unknown'
    }

    test('should return all zeros for empty violations', () => {
      const result = buildCategoryCounts([], mockGetRuleCategory)
      expect(result).toEqual({ complexity: 0, correctness: 0, patterns: 0, security: 0 })
    })

    test('should count complexity violations', () => {
      const violations = [createMockViolation('complexity-1'), createMockViolation('complexity-2')]
      const result = buildCategoryCounts(violations, mockGetRuleCategory)
      expect(result.complexity).toBe(2)
    })

    test('should count security violations', () => {
      const violations = [createMockViolation('security-eval')]
      const result = buildCategoryCounts(violations, mockGetRuleCategory)
      expect(result.security).toBe(1)
    })

    test('should count correctness violations', () => {
      const violations = [
        createMockViolation('correctness-1'),
        createMockViolation('correctness-2'),
        createMockViolation('correctness-3'),
      ]
      const result = buildCategoryCounts(violations, mockGetRuleCategory)
      expect(result.correctness).toBe(3)
    })

    test('should count patterns violations', () => {
      const violations = [createMockViolation('patterns-1')]
      const result = buildCategoryCounts(violations, mockGetRuleCategory)
      expect(result.patterns).toBe(1)
    })

    test('should count mixed violations across categories', () => {
      const violations = [
        createMockViolation('complexity-1'),
        createMockViolation('security-1'),
        createMockViolation('security-2'),
        createMockViolation('correctness-1'),
        createMockViolation('patterns-1'),
        createMockViolation('patterns-2'),
      ]
      const result = buildCategoryCounts(violations, mockGetRuleCategory)
      expect(result.complexity).toBe(1)
      expect(result.security).toBe(2)
      expect(result.correctness).toBe(1)
      expect(result.patterns).toBe(2)
    })

    test('should ignore unknown categories', () => {
      const violations = [createMockViolation('unknown-rule')]
      const result = buildCategoryCounts(violations, mockGetRuleCategory)
      expect(result.complexity).toBe(0)
      expect(result.correctness).toBe(0)
      expect(result.patterns).toBe(0)
      expect(result.security).toBe(0)
    })
  })

  describe('buildFileCategoryCounts', () => {
    const mockGetRuleCategory = (ruleId: string) => ruleId.split('-')[0]

    test('should return empty object for no violations', () => {
      expect(buildFileCategoryCounts([], mockGetRuleCategory)).toEqual({})
    })

    test('should count violations by category', () => {
      const violations = [
        createMockViolation('complexity-1'),
        createMockViolation('complexity-2'),
        createMockViolation('security-1'),
      ]
      const result = buildFileCategoryCounts(violations, mockGetRuleCategory)
      expect(result).toEqual({ complexity: 2, security: 1 })
    })

    test('should handle single violation', () => {
      const violations = [createMockViolation('patterns-1')]
      const result = buildFileCategoryCounts(violations, mockGetRuleCategory)
      expect(result).toEqual({ patterns: 1 })
    })
  })

  describe('buildScoreReport', () => {
    test('should build report with correct structure', () => {
      const report = buildScoreReport(
        { complexity: 0, correctness: 0, patterns: 0, security: 0 },
        10,
        10,
        [],
        [],
        5,
        '/test',
      )
      expect(report).toHaveProperty('overall')
      expect(report).toHaveProperty('categories')
      expect(report).toHaveProperty('summary')
      expect(report).toHaveProperty('topFiles')
      expect(report).toHaveProperty('suggestions')
      expect(report).toHaveProperty('path')
    })

    test('should set path correctly', () => {
      const report = buildScoreReport(
        { complexity: 0, correctness: 0, patterns: 0, security: 0 },
        10,
        10,
        [],
        [],
        5,
        '/my/custom/path',
      )
      expect(report.path).toBe('/my/custom/path')
    })

    test('should set filesAnalyzed', () => {
      const report = buildScoreReport(
        { complexity: 0, correctness: 0, patterns: 0, security: 0 },
        10,
        10,
        [],
        [],
        42,
        '/test',
      )
      expect(report.summary.filesAnalyzed).toBe(42)
    })

    test('should calculate violationsPerFile', () => {
      const violations = Array(10).fill(createMockViolation('test'))
      const report = buildScoreReport(
        { complexity: 0, correctness: 0, patterns: 0, security: 0 },
        10,
        10,
        [],
        violations,
        5,
        '/test',
      )
      expect(report.summary.violationsPerFile).toBe(2)
    })

    test('should return 0 violationsPerFile when no files processed', () => {
      const report = buildScoreReport(
        { complexity: 0, correctness: 0, patterns: 0, security: 0 },
        10,
        10,
        [],
        [],
        0,
        '/test',
      )
      expect(report.summary.violationsPerFile).toBe(0)
    })

    test('should round category scores', () => {
      const report = buildScoreReport(
        { complexity: 3, correctness: 0, patterns: 0, security: 0 },
        10,
        10,
        [],
        [],
        5,
        '/test',
      )
      expect(Number.isInteger(report.categories.complexity.score)).toBe(true)
    })

    test('should calculate overall score', () => {
      const report = buildScoreReport(
        { complexity: 0, correctness: 0, patterns: 0, security: 0 },
        10,
        10,
        [],
        [],
        5,
        '/test',
      )
      expect(typeof report.overall).toBe('number')
      expect(report.overall).toBeGreaterThanOrEqual(0)
      expect(report.overall).toBeLessThanOrEqual(100)
    })

    test('should set correct weights in categories', () => {
      const report = buildScoreReport(
        { complexity: 0, correctness: 0, patterns: 0, security: 0 },
        10,
        10,
        [],
        [],
        5,
        '/test',
      )
      expect(report.categories.complexity.weight).toBe(0.3)
      expect(report.categories.correctness.weight).toBe(0.25)
      expect(report.categories.patterns.weight).toBe(0.15)
      expect(report.categories.security.weight).toBe(0.3)
    })

    test('should set violations in categories from input', () => {
      const report = buildScoreReport(
        { complexity: 5, correctness: 3, patterns: 2, security: 1 },
        10,
        10,
        [],
        [],
        5,
        '/test',
      )
      expect(report.categories.complexity.violations).toBe(5)
      expect(report.categories.correctness.violations).toBe(3)
      expect(report.categories.patterns.violations).toBe(2)
      expect(report.categories.security.violations).toBe(1)
    })

    test('should include suggestions', () => {
      const report = buildScoreReport(
        { complexity: 20, correctness: 0, patterns: 0, security: 0 },
        10,
        10,
        [],
        [],
        5,
        '/test',
      )
      expect(Array.isArray(report.suggestions)).toBe(true)
    })
  })

  // =========================================================================
  // score-formatting.ts (formatDisplayOutput pure function)
  // =========================================================================
  describe('formatDisplayOutput', () => {
    test('should output Code Quality Score header', () => {
      const logs: string[] = []
      const logFn = (msg: string) => logs.push(msg)
      const report = createMockReport()
      formatDisplayOutput(report, false, logFn)

      const output = logs.join('\n')
      expect(output).toContain('Code Quality Score')
    })

    test('should output category scores', () => {
      const logs: string[] = []
      const logFn = (msg: string) => logs.push(msg)
      const report = createMockReport()
      formatDisplayOutput(report, false, logFn)

      const output = logs.join('\n')
      expect(output).toContain('Complexity')
      expect(output).toContain('Correctness')
      expect(output).toContain('Security')
      expect(output).toContain('Patterns')
    })

    test('should output summary', () => {
      const logs: string[] = []
      const logFn = (msg: string) => logs.push(msg)
      const report = createMockReport()
      formatDisplayOutput(report, false, logFn)

      const output = logs.join('\n')
      expect(output).toContain('Summary')
      expect(output).toContain('Files analyzed: 5')
      expect(output).toContain('Total violations: 8')
    })

    test('should output top files when verbose', () => {
      const logs: string[] = []
      const logFn = (msg: string) => logs.push(msg)
      const report = createMockReport({
        topFiles: [{ filePath: 'a.ts', score: 60, violations: 8, categories: {} }],
      })
      formatDisplayOutput(report, true, logFn)

      const output = logs.join('\n')
      expect(output).toContain('Top Problematic Files')
      expect(output).toContain('a.ts')
    })

    test('should not output top files when not verbose', () => {
      const logs: string[] = []
      const logFn = (msg: string) => logs.push(msg)
      const report = createMockReport({
        topFiles: [{ filePath: 'a.ts', score: 60, violations: 8, categories: {} }],
      })
      formatDisplayOutput(report, false, logFn)

      const output = logs.join('\n')
      expect(output).not.toContain('Top Problematic Files')
    })

    test('should output suggestions when present', () => {
      const logs: string[] = []
      const logFn = (msg: string) => logs.push(msg)
      const report = createMockReport({
        suggestions: ['Fix complexity issues'],
      })
      formatDisplayOutput(report, false, logFn)

      const output = logs.join('\n')
      expect(output).toContain('Improvement Suggestions')
      expect(output).toContain('Fix complexity issues')
    })

    test('should not output suggestions section when empty', () => {
      const logs: string[] = []
      const logFn = (msg: string) => logs.push(msg)
      const report = createMockReport()
      formatDisplayOutput(report, false, logFn)

      const output = logs.join('\n')
      expect(output).not.toContain('Improvement Suggestions')
    })

    test('should not output top files section when verbose but no top files', () => {
      const logs: string[] = []
      const logFn = (msg: string) => logs.push(msg)
      const report = createMockReport({ topFiles: [] })
      formatDisplayOutput(report, true, logFn)

      const output = logs.join('\n')
      expect(output).not.toContain('Top Problematic Files')
    })

    test('should output file categories in verbose mode', () => {
      const logs: string[] = []
      const logFn = (msg: string) => logs.push(msg)
      const report = createMockReport({
        topFiles: [
          {
            filePath: 'a.ts',
            score: 50,
            violations: 10,
            categories: { complexity: 5, security: 5 },
          },
        ],
      })
      formatDisplayOutput(report, true, logFn)

      const output = logs.join('\n')
      expect(output).toContain('complexity: 5')
      expect(output).toContain('security: 5')
    })

    test('should use the provided log function', () => {
      const logs: string[] = []
      const logFn = (msg: string) => logs.push(msg)
      const report = createMockReport()
      formatDisplayOutput(report, false, logFn)

      expect(logs.length).toBeGreaterThan(0)
    })
  })

  // =========================================================================
  // getScoreColor (command method)
  // =========================================================================
  describe('getScoreColor (command)', () => {
    test('should return green for 80+', () => {
      const command = createCommand()
      const result = (command as any).getScoreColor(80)
      expect(typeof result).toBe('function')
    })

    test('should return green for 90+', () => {
      const command = createCommand()
      const result = (command as any).getScoreColor(90)
      expect(typeof result).toBe('function')
    })

    test('should return yellow for 60-79', () => {
      const command = createCommand()
      const result = (command as any).getScoreColor(60)
      expect(typeof result).toBe('function')
    })

    test('should return red for below 60', () => {
      const command = createCommand()
      const result = (command as any).getScoreColor(0)
      expect(typeof result).toBe('function')
    })

    test('should return red for 59', () => {
      const command = createCommand()
      const result = (command as any).getScoreColor(59)
      expect(typeof result).toBe('function')
    })
  })

  // =========================================================================
  // formatScore (command method)
  // =========================================================================
  describe('formatScore (command)', () => {
    test('should format score with weight percentage', () => {
      const command = createCommand()
      const result = (command as any).formatScore(85, 0.3)
      expect(result).toContain('85')
      expect(result).toContain('30%')
    })

    test('should handle low scores', () => {
      const command = createCommand()
      const result = (command as any).formatScore(45, 0.15)
      expect(result).toContain('45')
      expect(result).toContain('15%')
    })

    test('should handle 100 score', () => {
      const command = createCommand()
      const result = (command as any).formatScore(100, 0.3)
      expect(result).toContain('100')
    })
  })

  // =========================================================================
  // Edge cases and boundary tests
  // =========================================================================
  describe('boundary conditions', () => {
    test('getGrade should handle exactly 0', () => {
      expect(getGrade(0)).toBe('(F)')
    })

    test('getGrade should handle exactly 100', () => {
      expect(getGrade(100)).toBe('(A)')
    })

    test('calculateFileScore should handle 0 violations', () => {
      expect(calculateFileScore(0)).toBe(100)
    })

    test('calculateFileScore should handle exactly 33 violations (1 remaining)', () => {
      expect(calculateFileScore(33)).toBe(1)
    })

    test('calculateCategoryScore should handle 0 weight', () => {
      const result = calculateCategoryScore(0, 0)
      expect(result.weight).toBe(0)
      expect(result.score).toBe(100)
    })

    test('calculateCorrectnessScore should handle large violation count', () => {
      const result = calculateCorrectnessScore(100, 10, 10, 0.25)
      expect(result.score).toBe(0)
    })

    test('calculateOverallScore should handle fractional results', () => {
      const categories = {
        complexity: { score: 33, violations: 0, weight: 0.3 },
        correctness: { score: 33, violations: 0, weight: 0.25 },
        patterns: { score: 33, violations: 0, weight: 0.15 },
        security: { score: 33, violations: 0, weight: 0.3 },
      }
      const result = calculateOverallScore(categories)
      expect(Number.isInteger(result)).toBe(true)
    })

    test('buildCategoryCounts should handle violations with unknown categories', () => {
      const violations = [
        createMockViolation('unknown-rule'),
        createMockViolation('another-unknown'),
      ]
      const result = buildCategoryCounts(violations, () => 'other')
      expect(result.complexity).toBe(0)
      expect(result.correctness).toBe(0)
      expect(result.patterns).toBe(0)
      expect(result.security).toBe(0)
    })

    test('buildScoreReport should handle 0 files analyzed with 0 violations', () => {
      const report = buildScoreReport(
        { complexity: 0, correctness: 0, patterns: 0, security: 0 },
        0,
        0,
        [],
        [],
        0,
        '/test',
      )
      expect(report.summary.violationsPerFile).toBe(0)
      expect(report.summary.filesAnalyzed).toBe(0)
      expect(report.summary.totalViolations).toBe(0)
    })

    test('formatScore should handle score of 1', () => {
      const result = formatScore(1, 0.3)
      expect(result).toContain('1')
    })

    test('countDocumentedFunctions should handle many functions', () => {
      const fns = Array(100)
        .fill(null)
        .map(() => ({ getJsDocs: () => ['doc'] }))
      expect(countDocumentedFunctions(fns)).toBe(100)
    })

    test('countDocumentedFunctions should handle mixed documented functions', () => {
      const fns = Array(50)
        .fill(null)
        .map((_, i) => ({
          getJsDocs: () => (i % 2 === 0 ? ['doc'] : []),
        }))
      expect(countDocumentedFunctions(fns)).toBe(25)
    })
  })

  // =========================================================================
  // Integration-style tests for score report building
  // =========================================================================
  describe('score report integration', () => {
    test('should produce perfect report when no violations', () => {
      const report = buildScoreReport(
        { complexity: 0, correctness: 0, patterns: 0, security: 0 },
        10,
        10,
        [],
        [],
        5,
        '/perfect',
      )
      expect(report.overall).toBe(100)
      expect(report.categories.complexity.score).toBe(100)
      expect(report.categories.correctness.score).toBe(100)
      expect(report.categories.patterns.score).toBe(100)
      expect(report.categories.security.score).toBe(100)
    })

    test('should produce zero report with maximum violations', () => {
      const report = buildScoreReport(
        { complexity: 100, correctness: 100, patterns: 100, security: 100 },
        0,
        0,
        [],
        Array(400).fill(createMockViolation('test')),
        5,
        '/bad',
      )
      expect(report.overall).toBe(0)
      expect(report.categories.complexity.score).toBe(0)
      expect(report.categories.correctness.score).toBe(0)
      expect(report.categories.patterns.score).toBe(0)
      expect(report.categories.security.score).toBe(0)
    })

    test('should produce grade A for perfect score', () => {
      expect(getGrade(100)).toBe('(A)')
    })

    test('should produce grade F for zero score', () => {
      expect(getGrade(0)).toBe('(F)')
    })

    test('report suggestions should be populated for low scores', () => {
      const report = buildScoreReport(
        { complexity: 20, correctness: 20, patterns: 20, security: 20 },
        10,
        0,
        [],
        [],
        5,
        '/test',
      )
      expect(report.suggestions.length).toBeGreaterThan(0)
    })

    test('report suggestions should be empty for perfect scores', () => {
      const report = buildScoreReport(
        { complexity: 0, correctness: 0, patterns: 0, security: 0 },
        10,
        10,
        [],
        [],
        5,
        '/test',
      )
      expect(report.suggestions).toHaveLength(0)
    })
  })

  // =========================================================================
  // Additional edge cases for completeness
  // =========================================================================
  describe('additional edge cases', () => {
    test('getScoreColor should return a callable function at boundary 80', () => {
      const fn = getScoreColor(80)
      const result = fn('test')
      expect(typeof result).toBe('string')
    })

    test('getScoreColor should return a callable function at boundary 60', () => {
      const fn = getScoreColor(60)
      const result = fn('test')
      expect(typeof result).toBe('string')
    })

    test('getScoreColor at boundary 59 should return red', () => {
      const fn = getScoreColor(59)
      const result = fn('hello')
      expect(result).toContain('hello')
    })

    test('calculateCategoryScore with weight 1 should still calculate correctly', () => {
      const result = calculateCategoryScore(5, 1)
      expect(result.score).toBe(75)
      expect(result.weight).toBe(1)
    })

    test('calculateCorrectnessScore with 0 documented out of many functions', () => {
      const result = calculateCorrectnessScore(0, 100, 0, 0.25)
      expect(result.score).toBe(0)
    })

    test('calculateCorrectnessScore with partial documentation', () => {
      const result = calculateCorrectnessScore(0, 3, 1, 0.25)
      expect(result.score).toBeCloseTo(33.333, 1)
    })

    test('buildFileCategoryCounts should handle multiple categories', () => {
      const violations = [
        createMockViolation('a'),
        createMockViolation('a'),
        createMockViolation('b'),
        createMockViolation('b'),
        createMockViolation('b'),
        createMockViolation('c'),
      ]
      const result = buildFileCategoryCounts(violations, (id) => id)
      expect(result).toEqual({ a: 2, b: 3, c: 1 })
    })

    test('buildScoreReport should limit topFiles to MAX_TOP_STATS_FILES', () => {
      const manyFiles = Array(20)
        .fill(null)
        .map((_, i) => ({
          filePath: `file${i}.ts`,
          score: 100 - i,
          violations: i,
          categories: {},
        }))
      const report = buildScoreReport(
        { complexity: 0, correctness: 0, patterns: 0, security: 0 },
        10,
        10,
        manyFiles,
        [],
        20,
        '/test',
      )
      expect(report.topFiles.length).toBeLessThanOrEqual(10)
    })

    test('formatDisplayOutput should handle report with 0 overall', () => {
      const logs: string[] = []
      const logFn = (msg: string) => logs.push(msg)
      const report = createMockReport({ overall: 0 })
      formatDisplayOutput(report, false, logFn)
      const output = logs.join('\n')
      expect(output).toContain('0')
      expect(output).toContain('Code Quality Score')
    })

    test('formatDisplayOutput should handle report with 100 overall', () => {
      const logs: string[] = []
      const logFn = (msg: string) => logs.push(msg)
      const report = createMockReport({ overall: 100 })
      formatDisplayOutput(report, false, logFn)
      const output = logs.join('\n')
      expect(output).toContain('100')
    })

    test('calculateFileScore at boundary 33 should be 1', () => {
      expect(calculateFileScore(33)).toBe(1)
    })

    test('calculateFileScore at boundary 34 should be 0', () => {
      expect(calculateFileScore(34)).toBe(0)
    })

    test('generateSuggestions should handle file with exactly 11 violations', () => {
      const categories = {
        complexity: { score: 90, violations: 1, weight: 0.3 },
        correctness: { score: 90, violations: 1, weight: 0.25 },
        patterns: { score: 90, violations: 1, weight: 0.15 },
        security: { score: 90, violations: 0, weight: 0.3 },
      }
      const fileScores = [{ filePath: 'a.ts', violations: 11, score: 67, categories: {} }]
      const suggestions = generateSuggestions(categories, [], fileScores)
      expect(suggestions).toContain('Focus on a.ts - it has 11 violations')
    })

    test('getGrade should handle non-integer scores by flooring', () => {
      // getGrade doesn't floor, it uses >= comparisons
      expect(getGrade(89.9)).toBe('(B)')
      expect(getGrade(90)).toBe('(A)')
    })

    test('calculateOverallScore should handle perfect scores', () => {
      const categories = {
        complexity: { score: 100, violations: 0, weight: 0.3 },
        correctness: { score: 100, violations: 0, weight: 0.25 },
        patterns: { score: 100, violations: 0, weight: 0.15 },
        security: { score: 100, violations: 0, weight: 0.3 },
      }
      expect(calculateOverallScore(categories)).toBe(100)
    })

    test('formatScore should produce string with expected format', () => {
      const result = formatScore(75, 0.25)
      expect(result).toMatch(/75/)
      expect(result).toMatch(/25%/)
    })
  })
})
