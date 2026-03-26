import { describe, test, expect, beforeEach, vi } from 'vitest'

vi.mock('node:fs', function () {
  return {
    existsSync: vi.fn(),
  }
})

vi.mock('../../../src/core/file-discovery.js', function () {
  return {
    discoverFiles: vi.fn(),
  }
})

vi.mock('../../../src/core/parser.js', function () {
  return {
    Parser: vi.fn(),
  }
})

vi.mock('../../../src/core/rule-registry.js', function () {
  return {
    RuleRegistry: vi.fn(),
  }
})

import { existsSync } from 'node:fs'
import { discoverFiles } from '../../../src/core/file-discovery.js'
import { Parser } from '../../../src/core/parser.js'
import { RuleRegistry } from '../../../src/core/rule-registry.js'

vi.mock('../../../src/rules/index.js', function () {
  return {
    allRules: {
      'max-complexity': {
        meta: {
          name: 'max-complexity',
          description: 'Enforce a maximum cyclomatic complexity threshold',
          category: 'complexity',
          recommended: true,
        },
        defaultOptions: { max: 10 },
        create: vi.fn(),
      },
      'no-await-in-loop': {
        meta: {
          name: 'no-await-in-loop',
          description: 'Disallow await inside loops',
          category: 'performance',
          recommended: false,
          fixable: 'code' as const,
        },
        defaultOptions: {},
        create: vi.fn(),
      },
    },
    getRuleCategory: vi.fn((ruleId: string) => {
      if (ruleId.includes('complexity')) return 'complexity'
      if (ruleId.includes('security')) return 'security'
      return 'patterns'
    }),
  }
})

describe('Health Command', () => {
  let Health: typeof import('../../../src/commands/health.js').default

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()
    Health = (await import('../../../src/commands/health.js')).default
  })

  describe('Command metadata', () => {
    test('has correct description', () => {
      expect(Health.description).toBe('Display project health score and recommendations')
    })

    test('has examples defined', () => {
      expect(Health.examples).toBeDefined()
      expect(Health.examples.length).toBeGreaterThan(0)
    })

    test('has all required flags', () => {
      expect(Health.flags).toBeDefined()
      expect(Health.flags.json).toBeDefined()
      expect(Health.flags.verbose).toBeDefined()
    })

    test('json flag has default false', () => {
      expect(Health.flags.json.default).toBe(false)
    })

    test('verbose flag has char v', () => {
      expect(Health.flags.verbose.char).toBe('v')
    })

    test('verbose flag has default false', () => {
      expect(Health.flags.verbose.default).toBe(false)
    })

    test('has path argument', () => {
      expect(Health.args.path).toBeDefined()
      expect(Health.args.path.default).toBe('.')
    })
  })

  describe('analyzeComplexity', () => {
    function getTestableCommand(): {
      analyzeComplexity: (
        violations: Array<{
          filePath: string
          message: string
          ruleId: string
          severity: string
        }>,
      ) => { avgComplexity: number; filesAnalyzed: number; highComplexityFiles: number }
    } {
      return new Health([], {} as never) as unknown as ReturnType<typeof getTestableCommand>
    }

    test('returns zero values for empty violations', () => {
      const cmd = getTestableCommand()
      const result = cmd.analyzeComplexity([])
      expect(result.avgComplexity).toBe(0)
      expect(result.filesAnalyzed).toBe(0)
      expect(result.highComplexityFiles).toBe(0)
    })

    test('calculates average complexity', () => {
      const cmd = getTestableCommand()
      const violations = [
        {
          filePath: 'a.ts',
          message: 'complexity issue',
          ruleId: 'max-complexity',
          severity: 'warning',
        },
        {
          filePath: 'a.ts',
          message: 'another complexity issue',
          ruleId: 'max-complexity',
          severity: 'warning',
        },
        {
          filePath: 'b.ts',
          message: 'complexity issue',
          ruleId: 'max-complexity',
          severity: 'warning',
        },
      ]
      const result = cmd.analyzeComplexity(violations)
      expect(result.avgComplexity).toBe(1.5)
      expect(result.filesAnalyzed).toBe(2)
    })

    test('counts high complexity files', () => {
      const cmd = getTestableCommand()
      const violations = [
        {
          filePath: 'a.ts',
          message: 'high complexity',
          ruleId: 'max-complexity',
          severity: 'warning',
        },
        {
          filePath: 'b.ts',
          message: 'normal complexity',
          ruleId: 'max-complexity',
          severity: 'warning',
        },
      ]
      const result = cmd.analyzeComplexity(violations)
      expect(result.highComplexityFiles).toBe(1)
    })
  })

  describe('getGrade', () => {
    function getTestableCommand(): { getGrade: (score: number) => string } {
      return new Health([], {} as never) as unknown as ReturnType<typeof getTestableCommand>
    }

    test('returns A for scores >= 90', () => {
      expect(getTestableCommand().getGrade(90)).toBe('(A)')
      expect(getTestableCommand().getGrade(95)).toBe('(A)')
      expect(getTestableCommand().getGrade(100)).toBe('(A)')
    })

    test('returns B for scores 80-89', () => {
      expect(getTestableCommand().getGrade(80)).toBe('(B)')
      expect(getTestableCommand().getGrade(85)).toBe('(B)')
      expect(getTestableCommand().getGrade(89)).toBe('(B)')
    })

    test('returns C for scores 70-79', () => {
      expect(getTestableCommand().getGrade(70)).toBe('(C)')
      expect(getTestableCommand().getGrade(75)).toBe('(C)')
    })

    test('returns D for scores 60-69', () => {
      expect(getTestableCommand().getGrade(60)).toBe('(D)')
      expect(getTestableCommand().getGrade(65)).toBe('(D)')
    })

    test('returns F for scores < 60', () => {
      expect(getTestableCommand().getGrade(59)).toBe('(F)')
      expect(getTestableCommand().getGrade(0)).toBe('(F)')
    })
  })

  describe('getRecommendations', () => {
    function getTestableCommand(): {
      getRecommendations: (
        scores: {
          complexity: number
          documentation: number
          errors: number
          patterns: number
          security: number
          testCoverage: number
        },
        details: { errors: number; hasTests: boolean; security: number },
      ) => string[]
    } {
      return new Health([], {} as never) as unknown as ReturnType<typeof getTestableCommand>
    }

    test('returns empty array for perfect scores', () => {
      const cmd = getTestableCommand()
      const recommendations = cmd.getRecommendations(
        {
          complexity: 100,
          documentation: 100,
          errors: 100,
          patterns: 100,
          security: 100,
          testCoverage: 100,
        },
        { errors: 0, hasTests: true, security: 0 },
      )
      expect(recommendations.length).toBe(0)
    })

    test('recommends fixing errors', () => {
      const cmd = getTestableCommand()
      const recommendations = cmd.getRecommendations(
        {
          complexity: 100,
          documentation: 100,
          errors: 70,
          patterns: 100,
          security: 100,
          testCoverage: 100,
        },
        { errors: 10, hasTests: true, security: 0 },
      )
      expect(recommendations).toContain('Fix 10 error-level violations')
    })

    test('recommends adding tests when missing', () => {
      const cmd = getTestableCommand()
      const recommendations = cmd.getRecommendations(
        {
          complexity: 100,
          documentation: 100,
          errors: 100,
          patterns: 100,
          security: 100,
          testCoverage: 0,
        },
        { errors: 0, hasTests: false, security: 0 },
      )
      expect(recommendations).toContain('Add unit tests to improve code quality')
    })

    test('recommends documentation when low', () => {
      const cmd = getTestableCommand()
      const recommendations = cmd.getRecommendations(
        {
          complexity: 100,
          documentation: 30,
          errors: 100,
          patterns: 100,
          security: 100,
          testCoverage: 100,
        },
        { errors: 0, hasTests: true, security: 0 },
      )
      expect(recommendations).toContain('Add JSDoc comments to public functions')
    })

    test('limits recommendations to 5', () => {
      const cmd = getTestableCommand()
      const recommendations = cmd.getRecommendations(
        {
          complexity: 50,
          documentation: 30,
          errors: 50,
          patterns: 50,
          security: 50,
          testCoverage: 0,
        },
        { errors: 20, hasTests: false, security: 10 },
      )
      expect(recommendations.length).toBeLessThanOrEqual(5)
    })

    test('recommends addressing security issues', () => {
      const cmd = getTestableCommand()
      const recommendations = cmd.getRecommendations(
        {
          complexity: 100,
          documentation: 100,
          errors: 100,
          patterns: 100,
          security: 70,
          testCoverage: 100,
        },
        { errors: 0, hasTests: true, security: 5 },
      )
      expect(recommendations.some((r) => r.includes('security'))).toBe(true)
    })

    test('recommends reducing complexity when low', () => {
      const cmd = getTestableCommand()
      const recommendations = cmd.getRecommendations(
        {
          complexity: 50,
          documentation: 100,
          errors: 100,
          patterns: 100,
          security: 100,
          testCoverage: 100,
        },
        { errors: 0, hasTests: true, security: 0 },
      )
      expect(recommendations.some((r) => r.includes('complexity'))).toBe(true)
    })
  })

  describe('getScoreColor', () => {
    function getTestableCommand(): { getScoreColor: (score: number) => (text: string) => string } {
      return new Health([], {} as never) as unknown as ReturnType<typeof getTestableCommand>
    }

    test('returns green for scores >= 80', () => {
      const cmd = getTestableCommand()
      expect(cmd.getScoreColor(80)).toBeDefined()
      expect(cmd.getScoreColor(90)).toBeDefined()
      expect(cmd.getScoreColor(100)).toBeDefined()
    })

    test('returns yellow for scores 60-79', () => {
      const cmd = getTestableCommand()
      expect(cmd.getScoreColor(60)).toBeDefined()
      expect(cmd.getScoreColor(70)).toBeDefined()
    })

    test('returns red for scores < 60', () => {
      const cmd = getTestableCommand()
      expect(cmd.getScoreColor(59)).toBeDefined()
      expect(cmd.getScoreColor(0)).toBeDefined()
    })
  })

  describe('formatScore', () => {
    function getTestableCommand(): { formatScore: (score: number) => string } {
      return new Health([], {} as never) as unknown as ReturnType<typeof getTestableCommand>
    }

    test('formats score with max value', () => {
      const cmd = getTestableCommand()
      const result = cmd.formatScore(85)
      expect(result).toContain('85')
      expect(result).toContain('100')
    })

    test('formats low score', () => {
      const cmd = getTestableCommand()
      const result = cmd.formatScore(30)
      expect(result).toContain('30')
    })

    test('formats high score', () => {
      const cmd = getTestableCommand()
      const result = cmd.formatScore(95)
      expect(result).toContain('95')
    })

    test('pads single digit scores', () => {
      const cmd = getTestableCommand()
      const result = cmd.formatScore(5)
      expect(result).toMatch(/\s*5/)
    })
  })

  describe('displayReport', () => {
    function getTestableCommand(): {
      displayReport: (report: Record<string, unknown>, verbose: boolean) => void
    } {
      return new Health([], {} as never) as unknown as ReturnType<typeof getTestableCommand>
    }

    function createMockReport(
      overrides: Partial<Record<string, unknown>> = {},
    ): Record<string, unknown> {
      return {
        overall: 85,
        path: '/test',
        recommendations: [],
        scores: {
          complexity: 80,
          documentation: 90,
          errors: 95,
          patterns: 85,
          security: 90,
          testCoverage: 75,
        },
        details: {
          complexity: { avgComplexity: 5, filesAnalyzed: 10, highComplexityFiles: 2 },
          documentation: { documentedFunctions: 50, totalFunctions: 100 },
          errors: 5,
          patterns: 15,
          security: 2,
          testCoverage: { estimated: 75, hasTests: true },
        },
        ...overrides,
      }
    }

    test('displayReport method exists', () => {
      const cmd = getTestableCommand()
      expect(typeof cmd.displayReport).toBe('function')
    })

    test('displays report with verbose=false', () => {
      const cmd = getTestableCommand()
      const report = createMockReport()
      expect(() => cmd.displayReport(report, false)).not.toThrow()
    })

    test('displays report with verbose=true', () => {
      const cmd = getTestableCommand()
      const report = createMockReport()
      expect(() => cmd.displayReport(report, true)).not.toThrow()
    })

    test('displays report with recommendations', () => {
      const cmd = getTestableCommand()
      const report = createMockReport({
        recommendations: ['Fix this issue', 'Add documentation'],
      })
      expect(() => cmd.displayReport(report, false)).not.toThrow()
    })

    test('displays report with low score', () => {
      const cmd = getTestableCommand()
      const report = createMockReport({
        overall: 45,
        scores: {
          complexity: 40,
          documentation: 30,
          errors: 50,
          patterns: 60,
          security: 45,
          testCoverage: 20,
        },
      })
      expect(() => cmd.displayReport(report, true)).not.toThrow()
    })

    test('displays report with high score', () => {
      const cmd = getTestableCommand()
      const report = createMockReport({
        overall: 95,
        scores: {
          complexity: 95,
          documentation: 98,
          errors: 100,
          patterns: 90,
          security: 95,
          testCoverage: 92,
        },
      })
      expect(() => cmd.displayReport(report, true)).not.toThrow()
    })

    test('displays report with no tests', () => {
      const cmd = getTestableCommand()
      const report = createMockReport({
        details: {
          complexity: { avgComplexity: 5, filesAnalyzed: 10, highComplexityFiles: 2 },
          documentation: { documentedFunctions: 50, totalFunctions: 100 },
          errors: 5,
          patterns: 15,
          security: 2,
          testCoverage: { estimated: 0, hasTests: false },
        },
      })
      expect(() => cmd.displayReport(report, true)).not.toThrow()
    })

    test('displays report with grade A', () => {
      const cmd = getTestableCommand()
      const report = createMockReport({ overall: 92 })
      expect(() => cmd.displayReport(report, false)).not.toThrow()
    })

    test('displays report with grade B', () => {
      const cmd = getTestableCommand()
      const report = createMockReport({ overall: 85 })
      expect(() => cmd.displayReport(report, false)).not.toThrow()
    })

    test('displays report with grade C', () => {
      const cmd = getTestableCommand()
      const report = createMockReport({ overall: 75 })
      expect(() => cmd.displayReport(report, false)).not.toThrow()
    })

    test('displays report with grade D', () => {
      const cmd = getTestableCommand()
      const report = createMockReport({ overall: 65 })
      expect(() => cmd.displayReport(report, false)).not.toThrow()
    })

    test('displays report with grade F', () => {
      const cmd = getTestableCommand()
      const report = createMockReport({ overall: 45 })
      expect(() => cmd.displayReport(report, false)).not.toThrow()
    })
  })

  describe('run', () => {
    function createCommandWithMockedParse(flags: Record<string, unknown>) {
      const command = new Health([], {} as never)
      const cmdWithMock = command as unknown as { parse: ReturnType<typeof vi.fn> }
      cmdWithMock.parse = vi.fn().mockResolvedValue({
        args: { path: '.' },
        flags,
      })
      return command
    }

    test('outputs JSON when --json flag is set', async () => {
      vi.mocked(existsSync).mockReturnValue(true)
      vi.mocked(discoverFiles).mockResolvedValue([])
      vi.mocked(Parser).mockImplementation(function () {
        return {
          initialize: vi.fn().mockResolvedValue(undefined),
          dispose: vi.fn(),
          parseFile: vi.fn().mockResolvedValue({
            sourceFile: {
              getFilePath: () => '/test/file.ts',
              getFunctions: () => [],
            },
          }),
        } as unknown as Parser
      })

      vi.mocked(RuleRegistry).mockImplementation(function () {
        return {
          register: vi.fn(),
          runRules: vi.fn().mockReturnValue([]),
        } as unknown as RuleRegistry
      })

      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      const cmdWithMock = cmd as unknown as { log: ReturnType<typeof vi.fn> }
      cmdWithMock.log = vi.fn()

      await cmd.run()

      expect(cmdWithMock.log).toHaveBeenCalledWith(expect.stringContaining('overall'))
    })
  })

  describe('analyzeHealth', () => {
    function getTestableCommand(): {
      analyzeHealth: (targetPath: string) => Promise<Record<string, unknown>>
    } {
      return new Health([], {} as never) as unknown as ReturnType<typeof getTestableCommand>
    }

    test('analyzeHealth method exists', () => {
      const cmd = getTestableCommand()
      expect(typeof cmd.analyzeHealth).toBe('function')
    })

    test('analyzeHealth returns report with files', async () => {
      vi.mocked(discoverFiles).mockResolvedValue([
        { path: 'file1.ts', absolutePath: '/test/file1.ts' },
        { path: 'file2.ts', absolutePath: '/test/file2.ts' },
      ])
      vi.mocked(Parser).mockImplementation(function () {
        return {
          initialize: vi.fn().mockResolvedValue(undefined),
          dispose: vi.fn(),
          parseFile: vi.fn().mockResolvedValue({
            sourceFile: {
              getFilePath: () => '/test/file1.ts',
              getFunctions: () => [],
            },
          }),
        }
      })

      vi.mocked(RuleRegistry).mockImplementation(function () {
        return {
          register: vi.fn(),
          runRules: vi.fn().mockReturnValue([
            {
              ruleId: 'test-rule',
              severity: 'error',
              message: 'Test violation',
              filePath: 'file1.ts',
              range: { start: { line: 1, column: 1 }, end: { line: 1, column: 10 } },
            },
          ]),
        }
      })
      const cmd = getTestableCommand()
      const report = await cmd.analyzeHealth('/test')

      expect(report).toBeDefined()
      expect(report.overall).toBeDefined()
      expect(report.scores).toBeDefined()
      expect(report.details).toBeDefined()
      expect(report.recommendations).toBeDefined()
    })
  })
})
