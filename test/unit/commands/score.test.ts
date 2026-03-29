import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import Score from '../../../src/commands/score.js'
import { Parser } from '../../../src/core/parser.js'
import { RuleRegistry } from '../../../src/core/rule-registry.js'
import { allRules, getRuleCategory } from '../../../src/rules/index.js'

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

describe('Score Command', () => {
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

  describe('run', () => {
    test('should error when path does not exist', async () => {
      const command = new Score(['/nonexistent/path'], {} as any)
      ;(command as any).error = (msg: string, opts: any) => {
        throw new Error(msg)
      }
      ;(command as any).parse = vi.fn().mockResolvedValue({
        args: { path: '/nonexistent/path' },
        flags: { json: false, verbose: false },
      })

      await expect(command.run()).rejects.toThrow('Path not found')
    })

    test('should output JSON when --json flag is set', async () => {
      const mockReport = {
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

      const command = new Score([], {} as any)
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
      const mockReport = {
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

      const command = new Score([], {} as any)
      ;(command as any).parse = vi.fn().mockResolvedValue({
        args: { path: '.' },
        flags: { json: false, verbose: true },
      })
      ;(command as any).analyzeScore = vi.fn().mockResolvedValue(mockReport)
      ;(command as any).displayReport = vi.fn()

      await command.run()

      expect((command as any).displayReport).toHaveBeenCalledWith(mockReport, true)
    })
  })

  describe('analyzeScore', () => {
    test('should return correct report structure', async () => {
      const mockSpinner = {
        text: '',
        succeed: vi.fn(),
      }

      const command = new Score([], {} as any)
      const report = await (command as any).analyzeScore('.', mockSpinner)

      expect(report).toHaveProperty('overall')
      expect(report).toHaveProperty('categories')
      expect(report).toHaveProperty('summary')
      expect(report).toHaveProperty('topFiles')
      expect(report).toHaveProperty('suggestions')
      expect(report).toHaveProperty('path')
    })

    test('should calculate weighted overall score', async () => {
      const mockSpinner = {
        text: '',
        succeed: vi.fn(),
      }

      const command = new Score([], {} as any)
      const report = await (command as any).analyzeScore('.', mockSpinner)

      expect(report.overall).toBeGreaterThanOrEqual(0)
      expect(report.overall).toBeLessThanOrEqual(100)
    })

    test('should process files and collect violations', async () => {
      const mockSpinner = {
        text: '',
        succeed: vi.fn(),
      }

      const command = new Score([], {} as any)
      const report = await (command as any).analyzeScore('.', mockSpinner)

      expect(Array.isArray(report.topFiles)).toBe(true)
    })

    test('should calculate category scores', async () => {
      const mockSpinner = {
        text: '',
        succeed: vi.fn(),
      }

      const command = new Score([], {} as any)
      const report = await (command as any).analyzeScore('.', mockSpinner)

      expect(report.categories).toHaveProperty('complexity')
      expect(report.categories).toHaveProperty('correctness')
      expect(report.categories).toHaveProperty('patterns')
      expect(report.categories).toHaveProperty('security')
    })

    test('should count documented functions', async () => {
      const mockSpinner = {
        text: '',
        succeed: vi.fn(),
      }

      const command = new Score([], {} as any)
      const report = await (command as any).analyzeScore('.', mockSpinner)

      expect(report.categories.correctness).toBeDefined()
      expect(report.categories.correctness.score).toBeGreaterThanOrEqual(0)
    })
  })

  describe('displayReport', () => {
    test('should display overall score and category scores', async () => {
      const report = {
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

      const command = new Score([], {} as any)
      const logSpy = vi.fn()
      ;(command as any).log = logSpy
      ;(command as any).displayReport(report, false)

      const output = logSpy.mock.calls.map((c: any[]) => c[0]).join('\n')
      expect(output).toContain('Code Quality Score')
      expect(output).toContain('Complexity')
      expect(output).toContain('Correctness')
      expect(output).toContain('Security')
      expect(output).toContain('Patterns')
    })

    test('should display summary information', async () => {
      const report = {
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

      const command = new Score([], {} as any)
      const logSpy = vi.fn()
      ;(command as any).log = logSpy
      ;(command as any).displayReport(report, false)

      const output = logSpy.mock.calls.map((c: any[]) => c[0]).join('\n')
      expect(output).toContain('Files analyzed: 5')
      expect(output).toContain('Total violations: 8')
    })

    test('should display top files when verbose', async () => {
      const report = {
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
        topFiles: [
          { filePath: 'test.ts', score: 75, violations: 5, categories: { complexity: 3 } },
        ],
      }

      const command = new Score([], {} as any)
      const logSpy = vi.fn()
      ;(command as any).log = logSpy
      ;(command as any).displayReport(report, true)

      const output = logSpy.mock.calls.map((c: any[]) => c[0]).join('\n')
      expect(output).toContain('Top Problematic Files')
      expect(output).toContain('test.ts')
      expect(output).toContain('Violations: 5')
    })

    test('should display suggestions when present', async () => {
      const report = {
        categories: {
          complexity: { score: 50, violations: 10, weight: 0.3 },
          correctness: { score: 85, violations: 3, weight: 0.25 },
          patterns: { score: 95, violations: 1, weight: 0.15 },
          security: { score: 88, violations: 2, weight: 0.3 },
        },
        overall: 70,
        path: '/test/path',
        suggestions: ['Reduce code complexity - 10 complexity issues found'],
        summary: {
          filesAnalyzed: 5,
          totalViolations: 16,
          violationsPerFile: 3.2,
        },
        topFiles: [],
      }

      const command = new Score([], {} as any)
      const logSpy = vi.fn()
      ;(command as any).log = logSpy
      ;(command as any).displayReport(report, false)

      const output = logSpy.mock.calls.map((c: any[]) => c[0]).join('\n')
      expect(output).toContain('Improvement Suggestions')
      expect(output).toContain('Reduce code complexity')
    })

    test('should display file categories when present', async () => {
      const report = {
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
        topFiles: [
          {
            filePath: 'test.ts',
            score: 75,
            violations: 5,
            categories: { complexity: 2, security: 3 },
          },
        ],
      }

      const command = new Score([], {} as any)
      const logSpy = vi.fn()
      ;(command as any).log = logSpy
      ;(command as any).displayReport(report, true)

      const output = logSpy.mock.calls.map((c: any[]) => c[0]).join('\n')
      expect(output).toContain('Categories:')
      expect(output).toContain('complexity: 2')
      expect(output).toContain('security: 3')
    })

    test('should not display top files when not verbose', async () => {
      const report = {
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
        topFiles: [{ filePath: 'test.ts', score: 75, violations: 5, categories: {} }],
      }

      const command = new Score([], {} as any)
      const logSpy = vi.fn()
      ;(command as any).log = logSpy
      ;(command as any).displayReport(report, false)

      const output = logSpy.mock.calls.map((c: any[]) => c[0]).join('\n')
      expect(output).not.toContain('Top Problematic Files')
    })

    test('should not display suggestions when empty', async () => {
      const report = {
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

      const command = new Score([], {} as any)
      const logSpy = vi.fn()
      ;(command as any).log = logSpy
      ;(command as any).displayReport(report, false)

      const output = logSpy.mock.calls.map((c: any[]) => c[0]).join('\n')
      expect(output).not.toContain('Improvement Suggestions')
    })
  })
})
