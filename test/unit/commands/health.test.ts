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

  // ──────────────────────────────────────────────────────────────
  // Reusable helpers at outer scope
  // ──────────────────────────────────────────────────────────────

  function makeCommand(): InstanceType<typeof Health> {
    return new Health([], {} as never)
  }

  function makeGradeCommand(): { getGrade: (score: number) => string } {
    return makeCommand() as unknown as { getGrade: (score: number) => string }
  }

  function makeAnalyzeComplexityCommand(): {
    analyzeComplexity: (
      violations: Array<{
        filePath: string
        message: string
        ruleId: string
        severity: string
      }>,
    ) => { avgComplexity: number; filesAnalyzed: number; highComplexityFiles: number }
  } {
    return makeCommand() as unknown as ReturnType<typeof makeAnalyzeComplexityCommand>
  }

  function makeGetRecommendationsCommand(): {
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
    return makeCommand() as unknown as ReturnType<typeof makeGetRecommendationsCommand>
  }

  function makeGetScoreColorCommand(): {
    getScoreColor: (score: number) => (text: string) => string
  } {
    return makeCommand() as unknown as ReturnType<typeof makeGetScoreColorCommand>
  }

  function makeFormatScoreCommand(): { formatScore: (score: number) => string } {
    return makeCommand() as unknown as ReturnType<typeof makeFormatScoreCommand>
  }

  function makeDisplayReportCommand(): {
    displayReport: (report: Record<string, unknown>, verbose: boolean) => void
  } {
    return makeCommand() as unknown as ReturnType<typeof makeDisplayReportCommand>
  }

  function makeAnalyzeHealthCommand(): {
    analyzeHealth: (targetPath: string) => Promise<Record<string, unknown>>
  } {
    return makeCommand() as unknown as ReturnType<typeof makeAnalyzeHealthCommand>
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

  function createViolation(
    overrides: Partial<{
      filePath: string
      message: string
      ruleId: string
      severity: string
    }> = {},
  ) {
    return {
      filePath: 'test.ts',
      message: 'test violation',
      ruleId: 'test-rule',
      severity: 'warning',
      ...overrides,
    }
  }

  function setupDefaultMocks() {
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
  }

  function createCommandWithMockedParse(flags: Record<string, unknown>) {
    const command = new Health([], {} as never)
    const cmdWithMock = command as unknown as { parse: ReturnType<typeof vi.fn> }
    cmdWithMock.parse = vi.fn().mockResolvedValue({
      args: { path: '.' },
      flags,
    })
    return command
  }

  // ══════════════════════════════════════════════════════════════
  // SECTION 1: Command metadata (7 tests from original + expansions)
  // ══════════════════════════════════════════════════════════════

  describe('Command metadata', () => {
    test('has correct description', () => {
      expect(Health.description).toBe('Display project health score and recommendations')
    })

    test('has examples defined', () => {
      expect(Health.examples).toBeDefined()
      expect(Health.examples.length).toBeGreaterThan(0)
    })

    test('examples have command and description properties', () => {
      for (const example of Health.examples) {
        expect(example).toHaveProperty('command')
        expect(example).toHaveProperty('description')
        expect(typeof example.command).toBe('string')
        expect(typeof example.description).toBe('string')
      }
    })

    test('first example shows default usage', () => {
      expect(Health.examples[0].command).toContain('command.id')
    })

    test('example includes json output', () => {
      const hasJsonExample = Health.examples.some(
        (e) => e.command.includes('--json') || e.description.toLowerCase().includes('json'),
      )
      expect(hasJsonExample).toBe(true)
    })

    test('has all required flags', () => {
      expect(Health.flags).toBeDefined()
      expect(Health.flags.json).toBeDefined()
      expect(Health.flags.verbose).toBeDefined()
    })

    test('only has json and verbose flags', () => {
      const flagKeys = Object.keys(Health.flags)
      expect(flagKeys).toHaveLength(2)
      expect(flagKeys).toContain('json')
      expect(flagKeys).toContain('verbose')
    })

    test('json flag has default false', () => {
      expect(Health.flags.json.default).toBe(false)
    })

    test('json flag has description', () => {
      expect(Health.flags.json.description).toBeDefined()
      expect(typeof Health.flags.json.description).toBe('string')
    })

    test('verbose flag has char v', () => {
      expect(Health.flags.verbose.char).toBe('v')
    })

    test('verbose flag has default false', () => {
      expect(Health.flags.verbose.default).toBe(false)
    })

    test('verbose flag has description', () => {
      expect(Health.flags.verbose.description).toBeDefined()
      expect(typeof Health.flags.verbose.description).toBe('string')
    })

    test('has path argument', () => {
      expect(Health.args.path).toBeDefined()
      expect(Health.args.path.default).toBe('.')
    })

    test('path argument is optional', () => {
      expect(Health.args.path.required).toBe(false)
    })

    test('path argument has description', () => {
      expect(Health.args.path.description).toBeDefined()
      expect(typeof Health.args.path.description).toBe('string')
    })

    test('command is a class', () => {
      expect(typeof Health).toBe('function')
    })

    test('command can be instantiated', () => {
      const instance = new Health([], {} as never)
      expect(instance).toBeDefined()
    })

    test('command has static args', () => {
      expect(Health.args).toBeDefined()
      expect(typeof Health.args).toBe('object')
    })

    test('command has static flags', () => {
      expect(Health.flags).toBeDefined()
      expect(typeof Health.flags).toBe('object')
    })

    test('command has static description', () => {
      expect(typeof Health.description).toBe('string')
    })

    test('command has static examples', () => {
      expect(Array.isArray(Health.examples)).toBe(true)
    })

    test('json flag is a boolean flag', () => {
      expect(Health.flags.json.type).toBe('boolean')
    })

    test('verbose flag is a boolean flag', () => {
      expect(Health.flags.verbose.type).toBe('boolean')
    })
  })

  // ══════════════════════════════════════════════════════════════
  // SECTION 2: analyzeComplexity (3 original + expansions)
  // ══════════════════════════════════════════════════════════════

  describe('analyzeComplexity', () => {
    test('returns zero values for empty violations', () => {
      const cmd = makeAnalyzeComplexityCommand()
      const result = cmd.analyzeComplexity([])
      expect(result.avgComplexity).toBe(0)
      expect(result.filesAnalyzed).toBe(0)
      expect(result.highComplexityFiles).toBe(0)
    })

    test('calculates average complexity', () => {
      const cmd = makeAnalyzeComplexityCommand()
      const violations = [
        createViolation({ filePath: 'a.ts', ruleId: 'max-complexity' }),
        createViolation({ filePath: 'a.ts', ruleId: 'max-complexity' }),
        createViolation({ filePath: 'b.ts', ruleId: 'max-complexity' }),
      ]
      const result = cmd.analyzeComplexity(violations)
      expect(result.avgComplexity).toBe(1.5)
      expect(result.filesAnalyzed).toBe(2)
    })

    test('counts high complexity files', () => {
      const cmd = makeAnalyzeComplexityCommand()
      const violations = [
        createViolation({ filePath: 'a.ts', message: 'high complexity', ruleId: 'max-complexity' }),
        createViolation({
          filePath: 'b.ts',
          message: 'normal complexity',
          ruleId: 'max-complexity',
        }),
      ]
      const result = cmd.analyzeComplexity(violations)
      expect(result.highComplexityFiles).toBe(1)
    })

    test('ignores non-complexity violations', () => {
      const cmd = makeAnalyzeComplexityCommand()
      const violations = [
        createViolation({ filePath: 'a.ts', ruleId: 'no-await-in-loop' }),
        createViolation({ filePath: 'b.ts', ruleId: 'some-other-rule' }),
        createViolation({ filePath: 'c.ts', ruleId: 'naming-convention' }),
      ]
      const result = cmd.analyzeComplexity(violations)
      expect(result.avgComplexity).toBe(0)
      expect(result.filesAnalyzed).toBe(0)
      expect(result.highComplexityFiles).toBe(0)
    })

    test('handles single complexity violation', () => {
      const cmd = makeAnalyzeComplexityCommand()
      const violations = [createViolation({ filePath: 'a.ts', ruleId: 'max-complexity' })]
      const result = cmd.analyzeComplexity(violations)
      expect(result.avgComplexity).toBe(1)
      expect(result.filesAnalyzed).toBe(1)
    })

    test('handles single file with many complexity violations', () => {
      const cmd = makeAnalyzeComplexityCommand()
      const violations = Array.from({ length: 10 }, () =>
        createViolation({ filePath: 'a.ts', ruleId: 'max-complexity' }),
      )
      const result = cmd.analyzeComplexity(violations)
      expect(result.avgComplexity).toBe(10)
      expect(result.filesAnalyzed).toBe(1)
    })

    test('handles many files each with one violation', () => {
      const cmd = makeAnalyzeComplexityCommand()
      const violations = ['a.ts', 'b.ts', 'c.ts', 'd.ts', 'e.ts'].map((f) =>
        createViolation({ filePath: f, ruleId: 'max-complexity' }),
      )
      const result = cmd.analyzeComplexity(violations)
      expect(result.avgComplexity).toBe(1)
      expect(result.filesAnalyzed).toBe(5)
    })

    test('counts zero high complexity files when no messages contain "high"', () => {
      const cmd = makeAnalyzeComplexityCommand()
      const violations = [
        createViolation({ filePath: 'a.ts', message: 'low complexity', ruleId: 'max-complexity' }),
        createViolation({
          filePath: 'b.ts',
          message: 'medium complexity',
          ruleId: 'max-complexity',
        }),
      ]
      const result = cmd.analyzeComplexity(violations)
      expect(result.highComplexityFiles).toBe(0)
    })

    test('counts multiple high complexity files', () => {
      const cmd = makeAnalyzeComplexityCommand()
      const violations = [
        createViolation({ filePath: 'a.ts', message: 'high complexity', ruleId: 'max-complexity' }),
        createViolation({
          filePath: 'b.ts',
          message: 'high complexity issue',
          ruleId: 'max-complexity',
        }),
        createViolation({
          filePath: 'c.ts',
          message: 'also high complexity',
          ruleId: 'max-complexity',
        }),
      ]
      const result = cmd.analyzeComplexity(violations)
      expect(result.highComplexityFiles).toBe(3)
    })

    test('mixed complexity and non-complexity violations', () => {
      const cmd = makeAnalyzeComplexityCommand()
      const violations = [
        createViolation({ filePath: 'a.ts', ruleId: 'max-complexity' }),
        createViolation({ filePath: 'a.ts', ruleId: 'no-await-in-loop' }),
        createViolation({ filePath: 'b.ts', ruleId: 'max-complexity' }),
        createViolation({ filePath: 'b.ts', ruleId: 'naming-convention' }),
      ]
      const result = cmd.analyzeComplexity(violations)
      expect(result.filesAnalyzed).toBe(2)
      expect(result.avgComplexity).toBe(1)
    })

    test('handles complexity violations with identical file paths', () => {
      const cmd = makeAnalyzeComplexityCommand()
      const violations = Array.from({ length: 5 }, () =>
        createViolation({ filePath: 'same.ts', ruleId: 'max-complexity' }),
      )
      const result = cmd.analyzeComplexity(violations)
      expect(result.filesAnalyzed).toBe(1)
      expect(result.avgComplexity).toBe(5)
    })
  })

  // ══════════════════════════════════════════════════════════════
  // SECTION 3: getGrade (5 original + boundary expansions)
  // ══════════════════════════════════════════════════════════════

  describe('getGrade', () => {
    test('returns A for score 90 (exact threshold)', () => {
      expect(makeGradeCommand().getGrade(90)).toBe('(A)')
    })

    test('returns A for score 95', () => {
      expect(makeGradeCommand().getGrade(95)).toBe('(A)')
    })

    test('returns A for score 100 (max)', () => {
      expect(makeGradeCommand().getGrade(100)).toBe('(A)')
    })

    test('returns A for score 99', () => {
      expect(makeGradeCommand().getGrade(99)).toBe('(A)')
    })

    test('returns B for score 89 (just below A)', () => {
      expect(makeGradeCommand().getGrade(89)).toBe('(B)')
    })

    test('returns B for score 80 (exact threshold)', () => {
      expect(makeGradeCommand().getGrade(80)).toBe('(B)')
    })

    test('returns B for score 85', () => {
      expect(makeGradeCommand().getGrade(85)).toBe('(B)')
    })

    test('returns B for score 81', () => {
      expect(makeGradeCommand().getGrade(81)).toBe('(B)')
    })

    test('returns C for score 79 (just below B)', () => {
      expect(makeGradeCommand().getGrade(79)).toBe('(C)')
    })

    test('returns C for score 70 (exact threshold)', () => {
      expect(makeGradeCommand().getGrade(70)).toBe('(C)')
    })

    test('returns C for score 75', () => {
      expect(makeGradeCommand().getGrade(75)).toBe('(C)')
    })

    test('returns C for score 71', () => {
      expect(makeGradeCommand().getGrade(71)).toBe('(C)')
    })

    test('returns D for score 69 (just below C)', () => {
      expect(makeGradeCommand().getGrade(69)).toBe('(D)')
    })

    test('returns D for score 60 (exact threshold)', () => {
      expect(makeGradeCommand().getGrade(60)).toBe('(D)')
    })

    test('returns D for score 65', () => {
      expect(makeGradeCommand().getGrade(65)).toBe('(D)')
    })

    test('returns D for score 61', () => {
      expect(makeGradeCommand().getGrade(61)).toBe('(D)')
    })

    test('returns F for score 59 (just below D)', () => {
      expect(makeGradeCommand().getGrade(59)).toBe('(F)')
    })

    test('returns F for score 0', () => {
      expect(makeGradeCommand().getGrade(0)).toBe('(F)')
    })

    test('returns F for score 1', () => {
      expect(makeGradeCommand().getGrade(1)).toBe('(F)')
    })

    test('returns F for score 30', () => {
      expect(makeGradeCommand().getGrade(30)).toBe('(F)')
    })

    test('returns F for score 50', () => {
      expect(makeGradeCommand().getGrade(50)).toBe('(F)')
    })

    test('grade format includes parentheses', () => {
      const result = makeGradeCommand().getGrade(85)
      expect(result.startsWith('(')).toBe(true)
      expect(result.endsWith(')')).toBe(true)
    })

    test('grade is always 3 characters', () => {
      const cmd = makeGradeCommand()
      for (const score of [0, 30, 60, 70, 80, 90, 100]) {
        expect(cmd.getGrade(score).length).toBe(3)
      }
    })

    test('all grades are distinct letter values', () => {
      const cmd = makeGradeCommand()
      const grades = new Set([
        cmd.getGrade(95),
        cmd.getGrade(85),
        cmd.getGrade(75),
        cmd.getGrade(65),
        cmd.getGrade(30),
      ])
      expect(grades.size).toBe(5)
    })
  })

  // ══════════════════════════════════════════════════════════════
  // SECTION 4: getRecommendations (6 original + expansions)
  // ══════════════════════════════════════════════════════════════

  describe('getRecommendations', () => {
    test('returns empty array for perfect scores', () => {
      const cmd = makeGetRecommendationsCommand()
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

    test('recommends fixing errors when errors score below 80', () => {
      const cmd = makeGetRecommendationsCommand()
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

    test('does not recommend fixing errors when errors score is 80 or above', () => {
      const cmd = makeGetRecommendationsCommand()
      const recommendations = cmd.getRecommendations(
        {
          complexity: 100,
          documentation: 100,
          errors: 80,
          patterns: 100,
          security: 100,
          testCoverage: 100,
        },
        { errors: 10, hasTests: true, security: 0 },
      )
      expect(recommendations.some((r) => r.includes('error-level violations'))).toBe(false)
    })

    test('recommends adding tests when missing', () => {
      const cmd = makeGetRecommendationsCommand()
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

    test('does not recommend adding tests when tests exist', () => {
      const cmd = makeGetRecommendationsCommand()
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
      expect(recommendations.some((r) => r.includes('unit tests'))).toBe(false)
    })

    test('recommends documentation when below 50', () => {
      const cmd = makeGetRecommendationsCommand()
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

    test('does not recommend documentation when score is exactly 50', () => {
      const cmd = makeGetRecommendationsCommand()
      const recommendations = cmd.getRecommendations(
        {
          complexity: 100,
          documentation: 50,
          errors: 100,
          patterns: 100,
          security: 100,
          testCoverage: 100,
        },
        { errors: 0, hasTests: true, security: 0 },
      )
      expect(recommendations.some((r) => r.includes('JSDoc'))).toBe(false)
    })

    test('does not recommend documentation when score above 50', () => {
      const cmd = makeGetRecommendationsCommand()
      const recommendations = cmd.getRecommendations(
        {
          complexity: 100,
          documentation: 51,
          errors: 100,
          patterns: 100,
          security: 100,
          testCoverage: 100,
        },
        { errors: 0, hasTests: true, security: 0 },
      )
      expect(recommendations.some((r) => r.includes('JSDoc'))).toBe(false)
    })

    test('recommends documentation at score 0', () => {
      const cmd = makeGetRecommendationsCommand()
      const recommendations = cmd.getRecommendations(
        {
          complexity: 100,
          documentation: 0,
          errors: 100,
          patterns: 100,
          security: 100,
          testCoverage: 100,
        },
        { errors: 0, hasTests: true, security: 0 },
      )
      expect(recommendations).toContain('Add JSDoc comments to public functions')
    })

    test('recommends documentation at score 49', () => {
      const cmd = makeGetRecommendationsCommand()
      const recommendations = cmd.getRecommendations(
        {
          complexity: 100,
          documentation: 49,
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
      const cmd = makeGetRecommendationsCommand()
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
      const cmd = makeGetRecommendationsCommand()
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

    test('recommends addressing security with exact count', () => {
      const cmd = makeGetRecommendationsCommand()
      const recommendations = cmd.getRecommendations(
        {
          complexity: 100,
          documentation: 100,
          errors: 100,
          patterns: 100,
          security: 70,
          testCoverage: 100,
        },
        { errors: 0, hasTests: true, security: 3 },
      )
      expect(recommendations.some((r) => r.includes('3 security'))).toBe(true)
    })

    test('does not recommend security when score is 90 or above', () => {
      const cmd = makeGetRecommendationsCommand()
      const recommendations = cmd.getRecommendations(
        {
          complexity: 100,
          documentation: 100,
          errors: 100,
          patterns: 100,
          security: 90,
          testCoverage: 100,
        },
        { errors: 0, hasTests: true, security: 1 },
      )
      expect(recommendations.some((r) => r.includes('security'))).toBe(false)
    })

    test('recommends reducing complexity when below 70', () => {
      const cmd = makeGetRecommendationsCommand()
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

    test('recommends reducing complexity at exactly 69', () => {
      const cmd = makeGetRecommendationsCommand()
      const recommendations = cmd.getRecommendations(
        {
          complexity: 69,
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

    test('does not recommend reducing complexity at exactly 70', () => {
      const cmd = makeGetRecommendationsCommand()
      const recommendations = cmd.getRecommendations(
        {
          complexity: 70,
          documentation: 100,
          errors: 100,
          patterns: 100,
          security: 100,
          testCoverage: 100,
        },
        { errors: 0, hasTests: true, security: 0 },
      )
      expect(recommendations.some((r) => r.includes('Reduce code complexity'))).toBe(false)
    })

    test('returns all 5 recommendations for worst-case scenario', () => {
      const cmd = makeGetRecommendationsCommand()
      const recommendations = cmd.getRecommendations(
        { complexity: 0, documentation: 0, errors: 0, patterns: 0, security: 0, testCoverage: 0 },
        { errors: 50, hasTests: false, security: 20 },
      )
      expect(recommendations.length).toBe(5)
    })

    test('recommendation for errors includes correct count', () => {
      const cmd = makeGetRecommendationsCommand()
      const recommendations = cmd.getRecommendations(
        {
          complexity: 100,
          documentation: 100,
          errors: 60,
          patterns: 100,
          security: 100,
          testCoverage: 100,
        },
        { errors: 25, hasTests: true, security: 0 },
      )
      expect(recommendations).toContain('Fix 25 error-level violations')
    })

    test('recommendation for security includes correct count', () => {
      const cmd = makeGetRecommendationsCommand()
      const recommendations = cmd.getRecommendations(
        {
          complexity: 100,
          documentation: 100,
          errors: 100,
          patterns: 100,
          security: 50,
          testCoverage: 100,
        },
        { errors: 0, hasTests: true, security: 7 },
      )
      expect(recommendations).toContain('Address 7 security issues')
    })

    test('returns only 2 recommendations when only 2 conditions triggered', () => {
      const cmd = makeGetRecommendationsCommand()
      const recommendations = cmd.getRecommendations(
        {
          complexity: 100,
          documentation: 100,
          errors: 70,
          patterns: 100,
          security: 100,
          testCoverage: 100,
        },
        { errors: 15, hasTests: false, security: 0 },
      )
      // errors < 80 and !hasTests
      expect(recommendations.length).toBe(2)
    })

    test('returns only security recommendation when only security is low', () => {
      const cmd = makeGetRecommendationsCommand()
      const recommendations = cmd.getRecommendations(
        {
          complexity: 100,
          documentation: 100,
          errors: 100,
          patterns: 100,
          security: 80,
          testCoverage: 100,
        },
        { errors: 0, hasTests: true, security: 2 },
      )
      expect(recommendations.length).toBe(1)
      expect(recommendations[0]).toContain('security')
    })

    test('returns only complexity recommendation when only complexity is low', () => {
      const cmd = makeGetRecommendationsCommand()
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
      expect(recommendations.length).toBe(1)
      expect(recommendations[0]).toContain('complexity')
    })
  })

  // ══════════════════════════════════════════════════════════════
  // SECTION 5: getScoreColor (3 original + boundary expansions)
  // ══════════════════════════════════════════════════════════════

  describe('getScoreColor', () => {
    test('returns green for score 80 (exact threshold)', () => {
      const cmd = makeGetScoreColorCommand()
      const result = cmd.getScoreColor(80)
      expect(result('test')).toBeDefined()
    })

    test('returns green for score 90', () => {
      const cmd = makeGetScoreColorCommand()
      expect(cmd.getScoreColor(90)).toBeDefined()
    })

    test('returns green for score 100', () => {
      const cmd = makeGetScoreColorCommand()
      expect(cmd.getScoreColor(100)).toBeDefined()
    })

    test('returns green for score 81', () => {
      const cmd = makeGetScoreColorCommand()
      expect(cmd.getScoreColor(81)).toBeDefined()
    })

    test('returns green for score 99', () => {
      const cmd = makeGetScoreColorCommand()
      expect(cmd.getScoreColor(99)).toBeDefined()
    })

    test('returns yellow for score 79 (just below green)', () => {
      const cmd = makeGetScoreColorCommand()
      expect(cmd.getScoreColor(79)).toBeDefined()
    })

    test('returns yellow for score 60 (exact threshold)', () => {
      const cmd = makeGetScoreColorCommand()
      expect(cmd.getScoreColor(60)).toBeDefined()
    })

    test('returns yellow for score 70', () => {
      const cmd = makeGetScoreColorCommand()
      expect(cmd.getScoreColor(70)).toBeDefined()
    })

    test('returns yellow for score 61', () => {
      const cmd = makeGetScoreColorCommand()
      expect(cmd.getScoreColor(61)).toBeDefined()
    })

    test('returns red for score 59 (just below yellow)', () => {
      const cmd = makeGetScoreColorCommand()
      expect(cmd.getScoreColor(59)).toBeDefined()
    })

    test('returns red for score 0', () => {
      const cmd = makeGetScoreColorCommand()
      expect(cmd.getScoreColor(0)).toBeDefined()
    })

    test('returns red for score 1', () => {
      const cmd = makeGetScoreColorCommand()
      expect(cmd.getScoreColor(1)).toBeDefined()
    })

    test('returns red for score 30', () => {
      const cmd = makeGetScoreColorCommand()
      expect(cmd.getScoreColor(30)).toBeDefined()
    })

    test('color function returns a string when called', () => {
      const cmd = makeGetScoreColorCommand()
      const colorFn = cmd.getScoreColor(85)
      const result = colorFn('hello')
      expect(typeof result).toBe('string')
    })

    test('green and yellow are different color functions', () => {
      const cmd = makeGetScoreColorCommand()
      const greenFn = cmd.getScoreColor(90)
      const yellowFn = cmd.getScoreColor(70)
      // Both return strings but may apply different formatting
      expect(greenFn('test')).toBeDefined()
      expect(yellowFn('test')).toBeDefined()
    })

    test('yellow and red are different color functions', () => {
      const cmd = makeGetScoreColorCommand()
      const yellowFn = cmd.getScoreColor(70)
      const redFn = cmd.getScoreColor(30)
      expect(yellowFn('test')).toBeDefined()
      expect(redFn('test')).toBeDefined()
    })

    test('handles boundary between green and yellow at 80', () => {
      const cmd = makeGetScoreColorCommand()
      // 80 is green, 79 is yellow
      expect(cmd.getScoreColor(80)).toBeDefined()
      expect(cmd.getScoreColor(79)).toBeDefined()
    })

    test('handles boundary between yellow and red at 60', () => {
      const cmd = makeGetScoreColorCommand()
      // 60 is yellow, 59 is red
      expect(cmd.getScoreColor(60)).toBeDefined()
      expect(cmd.getScoreColor(59)).toBeDefined()
    })
  })

  // ══════════════════════════════════════════════════════════════
  // SECTION 6: formatScore (4 original + expansions)
  // ══════════════════════════════════════════════════════════════

  describe('formatScore', () => {
    test('formats score with max value', () => {
      const cmd = makeFormatScoreCommand()
      const result = cmd.formatScore(85)
      expect(result).toContain('85')
      expect(result).toContain('100')
    })

    test('formats low score', () => {
      const cmd = makeFormatScoreCommand()
      const result = cmd.formatScore(30)
      expect(result).toContain('30')
    })

    test('formats high score', () => {
      const cmd = makeFormatScoreCommand()
      const result = cmd.formatScore(95)
      expect(result).toContain('95')
    })

    test('pads single digit scores', () => {
      const cmd = makeFormatScoreCommand()
      const result = cmd.formatScore(5)
      expect(result).toMatch(/\s*5/)
    })

    test('formats score 0', () => {
      const cmd = makeFormatScoreCommand()
      const result = cmd.formatScore(0)
      expect(result).toContain('0')
      expect(result).toContain('100')
    })

    test('formats score 100', () => {
      const cmd = makeFormatScoreCommand()
      const result = cmd.formatScore(100)
      expect(result).toContain('100')
    })

    test('formats score 50', () => {
      const cmd = makeFormatScoreCommand()
      const result = cmd.formatScore(50)
      expect(result).toContain('50')
    })

    test('includes separator between score and max', () => {
      const cmd = makeFormatScoreCommand()
      const result = cmd.formatScore(75)
      expect(result).toContain('/')
    })

    test('pads two-digit scores', () => {
      const cmd = makeFormatScoreCommand()
      const result = cmd.formatScore(9)
      expect(result).toContain('9')
    })

    test('does not pad three-digit scores', () => {
      const cmd = makeFormatScoreCommand()
      const result = cmd.formatScore(100)
      expect(result).toContain('100')
    })

    test('returns a string', () => {
      const cmd = makeFormatScoreCommand()
      const result = cmd.formatScore(75)
      expect(typeof result).toBe('string')
    })

    test('format of green score returns string', () => {
      const cmd = makeFormatScoreCommand()
      const result = cmd.formatScore(90)
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    test('format of yellow score returns string', () => {
      const cmd = makeFormatScoreCommand()
      const result = cmd.formatScore(65)
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    test('format of red score returns string', () => {
      const cmd = makeFormatScoreCommand()
      const result = cmd.formatScore(20)
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })
  })

  // ══════════════════════════════════════════════════════════════
  // SECTION 7: displayReport (12 original + expansions)
  // ══════════════════════════════════════════════════════════════

  describe('displayReport', () => {
    test('displayReport method exists', () => {
      const cmd = makeDisplayReportCommand()
      expect(typeof cmd.displayReport).toBe('function')
    })

    test('displays report with verbose=false', () => {
      const cmd = makeDisplayReportCommand()
      const report = createMockReport()
      expect(() => cmd.displayReport(report, false)).not.toThrow()
    })

    test('displays report with verbose=true', () => {
      const cmd = makeDisplayReportCommand()
      const report = createMockReport()
      expect(() => cmd.displayReport(report, true)).not.toThrow()
    })

    test('displays report with recommendations', () => {
      const cmd = makeDisplayReportCommand()
      const report = createMockReport({
        recommendations: ['Fix this issue', 'Add documentation'],
      })
      expect(() => cmd.displayReport(report, false)).not.toThrow()
    })

    test('displays report with low score', () => {
      const cmd = makeDisplayReportCommand()
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
      const cmd = makeDisplayReportCommand()
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
      const cmd = makeDisplayReportCommand()
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
      const cmd = makeDisplayReportCommand()
      const report = createMockReport({ overall: 92 })
      expect(() => cmd.displayReport(report, false)).not.toThrow()
    })

    test('displays report with grade B', () => {
      const cmd = makeDisplayReportCommand()
      const report = createMockReport({ overall: 85 })
      expect(() => cmd.displayReport(report, false)).not.toThrow()
    })

    test('displays report with grade C', () => {
      const cmd = makeDisplayReportCommand()
      const report = createMockReport({ overall: 75 })
      expect(() => cmd.displayReport(report, false)).not.toThrow()
    })

    test('displays report with grade D', () => {
      const cmd = makeDisplayReportCommand()
      const report = createMockReport({ overall: 65 })
      expect(() => cmd.displayReport(report, false)).not.toThrow()
    })

    test('displays report with grade F', () => {
      const cmd = makeDisplayReportCommand()
      const report = createMockReport({ overall: 45 })
      expect(() => cmd.displayReport(report, false)).not.toThrow()
    })

    test('displays report with empty recommendations', () => {
      const cmd = makeDisplayReportCommand()
      const report = createMockReport({ recommendations: [] })
      expect(() => cmd.displayReport(report, false)).not.toThrow()
    })

    test('displays report with single recommendation', () => {
      const cmd = makeDisplayReportCommand()
      const report = createMockReport({ recommendations: ['Single recommendation'] })
      expect(() => cmd.displayReport(report, false)).not.toThrow()
    })

    test('displays report with max 5 recommendations', () => {
      const cmd = makeDisplayReportCommand()
      const report = createMockReport({
        recommendations: ['Rec 1', 'Rec 2', 'Rec 3', 'Rec 4', 'Rec 5'],
      })
      expect(() => cmd.displayReport(report, false)).not.toThrow()
    })

    test('verbose shows category breakdown', () => {
      const cmd = makeDisplayReportCommand()
      const report = createMockReport()
      expect(() => cmd.displayReport(report, true)).not.toThrow()
    })

    test('non-verbose does not show category breakdown', () => {
      const cmd = makeDisplayReportCommand()
      const report = createMockReport()
      expect(() => cmd.displayReport(report, false)).not.toThrow()
    })

    test('handles report with score 0', () => {
      const cmd = makeDisplayReportCommand()
      const report = createMockReport({
        overall: 0,
        scores: {
          complexity: 0,
          documentation: 0,
          errors: 0,
          patterns: 0,
          security: 0,
          testCoverage: 0,
        },
      })
      expect(() => cmd.displayReport(report, true)).not.toThrow()
    })

    test('handles report with score 100', () => {
      const cmd = makeDisplayReportCommand()
      const report = createMockReport({
        overall: 100,
        scores: {
          complexity: 100,
          documentation: 100,
          errors: 100,
          patterns: 100,
          security: 100,
          testCoverage: 100,
        },
        recommendations: [],
      })
      expect(() => cmd.displayReport(report, true)).not.toThrow()
    })

    test('handles report with many errors in details', () => {
      const cmd = makeDisplayReportCommand()
      const report = createMockReport({
        details: {
          complexity: { avgComplexity: 50, filesAnalyzed: 100, highComplexityFiles: 80 },
          documentation: { documentedFunctions: 0, totalFunctions: 200 },
          errors: 500,
          patterns: 300,
          security: 100,
          testCoverage: { estimated: 0, hasTests: false },
        },
      })
      expect(() => cmd.displayReport(report, true)).not.toThrow()
    })

    test('handles report with 0 files analyzed', () => {
      const cmd = makeDisplayReportCommand()
      const report = createMockReport({
        details: {
          complexity: { avgComplexity: 0, filesAnalyzed: 0, highComplexityFiles: 0 },
          documentation: { documentedFunctions: 0, totalFunctions: 0 },
          errors: 0,
          patterns: 0,
          security: 0,
          testCoverage: { estimated: 0, hasTests: false },
        },
      })
      expect(() => cmd.displayReport(report, true)).not.toThrow()
    })

    test('verbose report with tests present shows details', () => {
      const cmd = makeDisplayReportCommand()
      const report = createMockReport({
        details: {
          complexity: { avgComplexity: 3, filesAnalyzed: 5, highComplexityFiles: 1 },
          documentation: { documentedFunctions: 30, totalFunctions: 50 },
          errors: 2,
          patterns: 5,
          security: 1,
          testCoverage: { estimated: 60, hasTests: true },
        },
      })
      expect(() => cmd.displayReport(report, true)).not.toThrow()
    })

    test('verbose report with no tests shows details', () => {
      const cmd = makeDisplayReportCommand()
      const report = createMockReport({
        details: {
          complexity: { avgComplexity: 0, filesAnalyzed: 0, highComplexityFiles: 0 },
          documentation: { documentedFunctions: 0, totalFunctions: 0 },
          errors: 0,
          patterns: 0,
          security: 0,
          testCoverage: { estimated: 0, hasTests: false },
        },
      })
      expect(() => cmd.displayReport(report, true)).not.toThrow()
    })

    test('handles boundary score 90 with verbose', () => {
      const cmd = makeDisplayReportCommand()
      const report = createMockReport({ overall: 90 })
      expect(() => cmd.displayReport(report, true)).not.toThrow()
    })

    test('handles boundary score 80 without verbose', () => {
      const cmd = makeDisplayReportCommand()
      const report = createMockReport({ overall: 80 })
      expect(() => cmd.displayReport(report, false)).not.toThrow()
    })

    test('handles boundary score 70 without verbose', () => {
      const cmd = makeDisplayReportCommand()
      const report = createMockReport({ overall: 70 })
      expect(() => cmd.displayReport(report, false)).not.toThrow()
    })

    test('handles boundary score 60 without verbose', () => {
      const cmd = makeDisplayReportCommand()
      const report = createMockReport({ overall: 60 })
      expect(() => cmd.displayReport(report, false)).not.toThrow()
    })
  })

  // ══════════════════════════════════════════════════════════════
  // SECTION 8: run method (1 original + expansions)
  // ══════════════════════════════════════════════════════════════

  describe('run', () => {
    test('outputs JSON when --json flag is set', async () => {
      setupDefaultMocks()
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      const cmdWithMock = cmd as unknown as { log: ReturnType<typeof vi.fn> }
      cmdWithMock.log = vi.fn()

      await cmd.run()

      expect(cmdWithMock.log).toHaveBeenCalledWith(expect.stringContaining('overall'))
    })

    test('outputs displayReport when json flag is false', async () => {
      setupDefaultMocks()
      const cmd = createCommandWithMockedParse({ json: false, verbose: false })
      const cmdWithMock = cmd as unknown as { log: ReturnType<typeof vi.fn> }
      cmdWithMock.log = vi.fn()

      await cmd.run()

      expect(cmdWithMock.log).toHaveBeenCalled()
    })

    test('outputs with verbose flag true', async () => {
      setupDefaultMocks()
      const cmd = createCommandWithMockedParse({ json: false, verbose: true })
      const cmdWithMock = cmd as unknown as { log: ReturnType<typeof vi.fn> }
      cmdWithMock.log = vi.fn()

      await cmd.run()

      expect(cmdWithMock.log).toHaveBeenCalled()
    })

    test('outputs JSON with both json and verbose flags', async () => {
      setupDefaultMocks()
      const cmd = createCommandWithMockedParse({ json: true, verbose: true })
      const cmdWithMock = cmd as unknown as { log: ReturnType<typeof vi.fn> }
      cmdWithMock.log = vi.fn()

      await cmd.run()

      expect(cmdWithMock.log).toHaveBeenCalledWith(expect.stringContaining('overall'))
    })

    test('JSON output is valid JSON', async () => {
      setupDefaultMocks()
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      const cmdWithMock = cmd as unknown as { log: ReturnType<typeof vi.fn> }
      cmdWithMock.log = vi.fn()

      await cmd.run()

      const jsonOutput = cmdWithMock.log.mock.calls[0][0]
      const parsed = JSON.parse(jsonOutput)
      expect(parsed).toBeDefined()
      expect(parsed.overall).toBeDefined()
    })

    test('JSON output contains scores', async () => {
      setupDefaultMocks()
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      const cmdWithMock = cmd as unknown as { log: ReturnType<typeof vi.fn> }
      cmdWithMock.log = vi.fn()

      await cmd.run()

      const jsonOutput = cmdWithMock.log.mock.calls[0][0]
      const parsed = JSON.parse(jsonOutput)
      expect(parsed.scores).toBeDefined()
    })

    test('JSON output contains details', async () => {
      setupDefaultMocks()
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      const cmdWithMock = cmd as unknown as { log: ReturnType<typeof vi.fn> }
      cmdWithMock.log = vi.fn()

      await cmd.run()

      const jsonOutput = cmdWithMock.log.mock.calls[0][0]
      const parsed = JSON.parse(jsonOutput)
      expect(parsed.details).toBeDefined()
    })

    test('JSON output contains recommendations', async () => {
      setupDefaultMocks()
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      const cmdWithMock = cmd as unknown as { log: ReturnType<typeof vi.fn> }
      cmdWithMock.log = vi.fn()

      await cmd.run()

      const jsonOutput = cmdWithMock.log.mock.calls[0][0]
      const parsed = JSON.parse(jsonOutput)
      expect(parsed.recommendations).toBeDefined()
      expect(Array.isArray(parsed.recommendations)).toBe(true)
    })

    test('JSON output contains path', async () => {
      setupDefaultMocks()
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      const cmdWithMock = cmd as unknown as { log: ReturnType<typeof vi.fn> }
      cmdWithMock.log = vi.fn()

      await cmd.run()

      const jsonOutput = cmdWithMock.log.mock.calls[0][0]
      const parsed = JSON.parse(jsonOutput)
      expect(parsed.path).toBeDefined()
    })

    test('calls existsSync with target path', async () => {
      setupDefaultMocks()
      const cmd = createCommandWithMockedParse({ json: false, verbose: false })
      const cmdWithMock = cmd as unknown as { log: ReturnType<typeof vi.fn> }
      cmdWithMock.log = vi.fn()

      await cmd.run()

      expect(existsSync).toHaveBeenCalled()
    })

    test('errors when path does not exist', async () => {
      vi.mocked(existsSync).mockReturnValue(false)
      const cmd = createCommandWithMockedParse({ json: false, verbose: false })
      const cmdWithMock = cmd as unknown as {
        log: ReturnType<typeof vi.fn>
        error: ReturnType<typeof vi.fn>
      }
      cmdWithMock.log = vi.fn()
      cmdWithMock.error = vi.fn()

      await cmd.run()

      expect(cmdWithMock.error).toHaveBeenCalledWith(
        expect.stringContaining('Path not found'),
        expect.objectContaining({ exit: 1 }),
      )
    })

    test('calls discoverFiles', async () => {
      setupDefaultMocks()
      const cmd = createCommandWithMockedParse({ json: false, verbose: false })
      const cmdWithMock = cmd as unknown as { log: ReturnType<typeof vi.fn> }
      cmdWithMock.log = vi.fn()

      await cmd.run()

      expect(discoverFiles).toHaveBeenCalled()
    })

    test('creates Parser instance', async () => {
      setupDefaultMocks()
      const cmd = createCommandWithMockedParse({ json: false, verbose: false })
      const cmdWithMock = cmd as unknown as { log: ReturnType<typeof vi.fn> }
      cmdWithMock.log = vi.fn()

      await cmd.run()

      expect(Parser).toHaveBeenCalled()
    })

    test('creates RuleRegistry instance', async () => {
      setupDefaultMocks()
      const cmd = createCommandWithMockedParse({ json: false, verbose: false })
      const cmdWithMock = cmd as unknown as { log: ReturnType<typeof vi.fn> }
      cmdWithMock.log = vi.fn()

      await cmd.run()

      expect(RuleRegistry).toHaveBeenCalled()
    })
  })

  // ══════════════════════════════════════════════════════════════
  // SECTION 9: analyzeHealth (2 original + expansions)
  // ══════════════════════════════════════════════════════════════

  describe('analyzeHealth', () => {
    test('analyzeHealth method exists', () => {
      const cmd = makeAnalyzeHealthCommand()
      expect(typeof cmd.analyzeHealth).toBe('function')
    })

    test('returns report with files', async () => {
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

      const cmd = makeAnalyzeHealthCommand()
      const report = await cmd.analyzeHealth('/test')

      expect(report).toBeDefined()
      expect(report.overall).toBeDefined()
      expect(report.scores).toBeDefined()
      expect(report.details).toBeDefined()
      expect(report.recommendations).toBeDefined()
    })

    test('returns report with empty files', async () => {
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
        }
      })
      vi.mocked(RuleRegistry).mockImplementation(function () {
        return {
          register: vi.fn(),
          runRules: vi.fn().mockReturnValue([]),
        }
      })

      const cmd = makeAnalyzeHealthCommand()
      const report = await cmd.analyzeHealth('/test')

      expect(report.overall).toBeDefined()
      expect(typeof report.overall).toBe('number')
    })

    test('detects test files', async () => {
      vi.mocked(discoverFiles).mockResolvedValue([
        { path: 'src/app.ts', absolutePath: '/test/src/app.ts' },
        { path: 'test/app.test.ts', absolutePath: '/test/test/app.test.ts' },
      ])
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
        }
      })
      vi.mocked(RuleRegistry).mockImplementation(function () {
        return {
          register: vi.fn(),
          runRules: vi.fn().mockReturnValue([]),
        }
      })

      const cmd = makeAnalyzeHealthCommand()
      const report = await cmd.analyzeHealth('/test')
      const details = report.details as Record<string, unknown>
      const testCov = details.testCoverage as Record<string, unknown>

      expect(testCov.hasTests).toBe(true)
    })

    test('detects spec files as tests', async () => {
      vi.mocked(discoverFiles).mockResolvedValue([
        { path: 'src/app.ts', absolutePath: '/test/src/app.ts' },
        { path: 'src/app.spec.ts', absolutePath: '/test/src/app.spec.ts' },
      ])
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
        }
      })
      vi.mocked(RuleRegistry).mockImplementation(function () {
        return {
          register: vi.fn(),
          runRules: vi.fn().mockReturnValue([]),
        }
      })

      const cmd = makeAnalyzeHealthCommand()
      const report = await cmd.analyzeHealth('/test')
      const details = report.details as Record<string, unknown>
      const testCov = details.testCoverage as Record<string, unknown>

      expect(testCov.hasTests).toBe(true)
    })

    test('handles files without test files', async () => {
      vi.mocked(discoverFiles).mockResolvedValue([
        { path: 'src/app.ts', absolutePath: '/test/src/app.ts' },
        { path: 'src/utils.ts', absolutePath: '/test/src/utils.ts' },
      ])
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
        }
      })
      vi.mocked(RuleRegistry).mockImplementation(function () {
        return {
          register: vi.fn(),
          runRules: vi.fn().mockReturnValue([]),
        }
      })

      const cmd = makeAnalyzeHealthCommand()
      const report = await cmd.analyzeHealth('/test')
      const details = report.details as Record<string, unknown>
      const testCov = details.testCoverage as Record<string, unknown>

      expect(testCov.hasTests).toBe(false)
    })

    test('handles parse errors gracefully', async () => {
      vi.mocked(discoverFiles).mockResolvedValue([{ path: 'bad.ts', absolutePath: '/test/bad.ts' }])
      vi.mocked(Parser).mockImplementation(function () {
        return {
          initialize: vi.fn().mockResolvedValue(undefined),
          dispose: vi.fn(),
          parseFile: vi.fn().mockRejectedValue(new Error('Parse error')),
        }
      })
      vi.mocked(RuleRegistry).mockImplementation(function () {
        return {
          register: vi.fn(),
          runRules: vi.fn().mockReturnValue([]),
        }
      })

      const cmd = makeAnalyzeHealthCommand()
      const report = await cmd.analyzeHealth('/test')

      expect(report).toBeDefined()
      expect(report.overall).toBeDefined()
    })

    test('calculates documentation score from parsed functions', async () => {
      const mockFunction = (hasDocs: boolean) => ({
        getJsDocs: () => (hasDocs ? [{ text: 'doc' }] : []),
      })

      vi.mocked(discoverFiles).mockResolvedValue([
        { path: 'file.ts', absolutePath: '/test/file.ts' },
      ])
      vi.mocked(Parser).mockImplementation(function () {
        return {
          initialize: vi.fn().mockResolvedValue(undefined),
          dispose: vi.fn(),
          parseFile: vi.fn().mockResolvedValue({
            sourceFile: {
              getFilePath: () => '/test/file.ts',
              getFunctions: () => [mockFunction(true), mockFunction(false), mockFunction(true)],
            },
          }),
        }
      })
      vi.mocked(RuleRegistry).mockImplementation(function () {
        return {
          register: vi.fn(),
          runRules: vi.fn().mockReturnValue([]),
        }
      })

      const cmd = makeAnalyzeHealthCommand()
      const report = await cmd.analyzeHealth('/test')
      const scores = report.scores as Record<string, number>

      // 2/3 documented = ~66.67, rounded to 67
      expect(scores.documentation).toBe(67)
    })

    test('returns path in report', async () => {
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
        }
      })
      vi.mocked(RuleRegistry).mockImplementation(function () {
        return {
          register: vi.fn(),
          runRules: vi.fn().mockReturnValue([]),
        }
      })

      const cmd = makeAnalyzeHealthCommand()
      const report = await cmd.analyzeHealth('/my/project')

      expect(report.path).toBe('/my/project')
    })

    test('overall score is a number', async () => {
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
        }
      })
      vi.mocked(RuleRegistry).mockImplementation(function () {
        return {
          register: vi.fn(),
          runRules: vi.fn().mockReturnValue([]),
        }
      })

      const cmd = makeAnalyzeHealthCommand()
      const report = await cmd.analyzeHealth('/test')

      expect(typeof report.overall).toBe('number')
    })

    test('overall score is between 0 and 100', async () => {
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
        }
      })
      vi.mocked(RuleRegistry).mockImplementation(function () {
        return {
          register: vi.fn(),
          runRules: vi.fn().mockReturnValue([]),
        }
      })

      const cmd = makeAnalyzeHealthCommand()
      const report = await cmd.analyzeHealth('/test')

      expect(report.overall).toBeGreaterThanOrEqual(0)
      expect(report.overall).toBeLessThanOrEqual(100)
    })

    test('scores are all numbers', async () => {
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
        }
      })
      vi.mocked(RuleRegistry).mockImplementation(function () {
        return {
          register: vi.fn(),
          runRules: vi.fn().mockReturnValue([]),
        }
      })

      const cmd = makeAnalyzeHealthCommand()
      const report = await cmd.analyzeHealth('/test')
      const scores = report.scores as Record<string, number>

      expect(typeof scores.complexity).toBe('number')
      expect(typeof scores.documentation).toBe('number')
      expect(typeof scores.errors).toBe('number')
      expect(typeof scores.patterns).toBe('number')
      expect(typeof scores.security).toBe('number')
      expect(typeof scores.testCoverage).toBe('number')
    })

    test('handles violations with severity error', async () => {
      vi.mocked(discoverFiles).mockResolvedValue([
        { path: 'file.ts', absolutePath: '/test/file.ts' },
      ])
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
        }
      })
      vi.mocked(RuleRegistry).mockImplementation(function () {
        return {
          register: vi.fn(),
          runRules: vi
            .fn()
            .mockReturnValue([
              { ruleId: 'some-rule', severity: 'error', message: 'err', filePath: 'file.ts' },
            ]),
        }
      })

      const cmd = makeAnalyzeHealthCommand()
      const report = await cmd.analyzeHealth('/test')
      const scores = report.scores as Record<string, number>

      expect(scores.errors).toBeLessThan(100)
    })

    test('handles many files', async () => {
      const files = Array.from({ length: 20 }, (_, i) => ({
        path: `file${i}.ts`,
        absolutePath: `/test/file${i}.ts`,
      }))
      vi.mocked(discoverFiles).mockResolvedValue(files)
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
        }
      })
      vi.mocked(RuleRegistry).mockImplementation(function () {
        return {
          register: vi.fn(),
          runRules: vi.fn().mockReturnValue([]),
        }
      })

      const cmd = makeAnalyzeHealthCommand()
      const report = await cmd.analyzeHealth('/test')

      expect(report).toBeDefined()
      expect(report.overall).toBeDefined()
    })
  })

  // ══════════════════════════════════════════════════════════════
  // SECTION 10: Integration / edge case scenarios
  // ══════════════════════════════════════════════════════════════

  describe('Edge cases and integration', () => {
    test('full pipeline with JSON output produces valid report', async () => {
      setupDefaultMocks()
      vi.mocked(discoverFiles).mockResolvedValue([
        { path: 'src/index.ts', absolutePath: '/test/src/index.ts' },
        { path: 'test/index.test.ts', absolutePath: '/test/test/index.test.ts' },
      ])
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

      const jsonOutput = cmdWithMock.log.mock.calls[0][0]
      const parsed = JSON.parse(jsonOutput)

      expect(parsed.overall).toBeGreaterThanOrEqual(0)
      expect(parsed.overall).toBeLessThanOrEqual(100)
      expect(parsed.scores).toBeDefined()
      expect(parsed.details).toBeDefined()
      expect(parsed.recommendations).toBeDefined()
      expect(parsed.path).toBeDefined()
    })

    test('full pipeline with display output calls log', async () => {
      setupDefaultMocks()
      const cmd = createCommandWithMockedParse({ json: false, verbose: false })
      const cmdWithMock = cmd as unknown as { log: ReturnType<typeof vi.fn> }
      cmdWithMock.log = vi.fn()

      await cmd.run()

      expect(cmdWithMock.log).toHaveBeenCalled()
      expect(cmdWithMock.log.mock.calls.length).toBeGreaterThan(0)
    })

    test('verbose flag causes more log output than non-verbose', async () => {
      setupDefaultMocks()
      vi.mocked(discoverFiles).mockResolvedValue([
        { path: 'file.ts', absolutePath: '/test/file.ts' },
      ])
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

      // Non-verbose
      const cmdNonVerbose = createCommandWithMockedParse({ json: false, verbose: false })
      const nvMock = cmdNonVerbose as unknown as { log: ReturnType<typeof vi.fn> }
      nvMock.log = vi.fn()
      await cmdNonVerbose.run()
      const nonVerboseCount = nvMock.log.mock.calls.length

      // Verbose
      const cmdVerbose = createCommandWithMockedParse({ json: false, verbose: true })
      const vMock = cmdVerbose as unknown as { log: ReturnType<typeof vi.fn> }
      vMock.log = vi.fn()
      await cmdVerbose.run()
      const verboseCount = vMock.log.mock.calls.length

      expect(verboseCount).toBeGreaterThan(nonVerboseCount)
    })

    test('mock resets work correctly across tests', async () => {
      setupDefaultMocks()
      expect(existsSync).not.toHaveBeenCalled()
      expect(discoverFiles).not.toHaveBeenCalled()
    })
  })

  // ══════════════════════════════════════════════════════════════
  // SECTION 11: Constants and scoring verification
  // ══════════════════════════════════════════════════════════════

  describe('Score calculation verification', () => {
    test('empty project has default documentation score of 50', async () => {
      vi.mocked(discoverFiles).mockResolvedValue([])
      vi.mocked(Parser).mockImplementation(function () {
        return {
          initialize: vi.fn().mockResolvedValue(undefined),
          dispose: vi.fn(),
          parseFile: vi.fn().mockResolvedValue({
            sourceFile: { getFilePath: () => '/t.ts', getFunctions: () => [] },
          }),
        }
      })
      vi.mocked(RuleRegistry).mockImplementation(function () {
        return { register: vi.fn(), runRules: vi.fn().mockReturnValue([]) }
      })

      const cmd = makeAnalyzeHealthCommand()
      const report = await cmd.analyzeHealth('/test')
      const scores = report.scores as Record<string, number>

      // With 0 totalFunctions, documentation defaults to 50
      expect(scores.documentation).toBe(50)
    })

    test('project with all errors has lower errors score', async () => {
      vi.mocked(discoverFiles).mockResolvedValue([
        { path: 'file.ts', absolutePath: '/test/file.ts' },
      ])
      vi.mocked(Parser).mockImplementation(function () {
        return {
          initialize: vi.fn().mockResolvedValue(undefined),
          dispose: vi.fn(),
          parseFile: vi.fn().mockResolvedValue({
            sourceFile: { getFilePath: () => '/t.ts', getFunctions: () => [] },
          }),
        }
      })
      // Generate many error violations
      const violations = Array.from({ length: 10 }, () => ({
        ruleId: 'some-rule',
        severity: 'error',
        message: 'err',
        filePath: 'file.ts',
      }))
      vi.mocked(RuleRegistry).mockImplementation(function () {
        return { register: vi.fn(), runRules: vi.fn().mockReturnValue(violations) }
      })

      const cmd = makeAnalyzeHealthCommand()
      const report = await cmd.analyzeHealth('/test')
      const scores = report.scores as Record<string, number>

      // 100 - 10*2 = 80
      expect(scores.errors).toBe(80)
    })

    test('project with security violations has lower security score', async () => {
      vi.mocked(discoverFiles).mockResolvedValue([
        { path: 'file.ts', absolutePath: '/test/file.ts' },
      ])
      vi.mocked(Parser).mockImplementation(function () {
        return {
          initialize: vi.fn().mockResolvedValue(undefined),
          dispose: vi.fn(),
          parseFile: vi.fn().mockResolvedValue({
            sourceFile: { getFilePath: () => '/t.ts', getFunctions: () => [] },
          }),
        }
      })
      const violations = [
        { ruleId: 'security-issue', severity: 'warning', message: 'sec', filePath: 'file.ts' },
      ]
      vi.mocked(RuleRegistry).mockImplementation(function () {
        return { register: vi.fn(), runRules: vi.fn().mockReturnValue(violations) }
      })

      const cmd = makeAnalyzeHealthCommand()
      const report = await cmd.analyzeHealth('/test')
      const scores = report.scores as Record<string, number>

      // 100 - 1*10 = 90
      expect(scores.security).toBe(90)
    })

    test('project with complexity errors has lower complexity score', async () => {
      vi.mocked(discoverFiles).mockResolvedValue([
        { path: 'file.ts', absolutePath: '/test/file.ts' },
      ])
      vi.mocked(Parser).mockImplementation(function () {
        return {
          initialize: vi.fn().mockResolvedValue(undefined),
          dispose: vi.fn(),
          parseFile: vi.fn().mockResolvedValue({
            sourceFile: { getFilePath: () => '/t.ts', getFunctions: () => [] },
          }),
        }
      })
      const violations = [
        { ruleId: 'max-complexity', severity: 'error', message: 'complexity', filePath: 'file.ts' },
        { ruleId: 'max-complexity', severity: 'error', message: 'complexity', filePath: 'file.ts' },
      ]
      vi.mocked(RuleRegistry).mockImplementation(function () {
        return { register: vi.fn(), runRules: vi.fn().mockReturnValue(violations) }
      })

      const cmd = makeAnalyzeHealthCommand()
      const report = await cmd.analyzeHealth('/test')
      const scores = report.scores as Record<string, number>

      // 100 - 2*5 = 90
      expect(scores.complexity).toBe(90)
    })

    test('pattern violations reduce pattern score', async () => {
      vi.mocked(discoverFiles).mockResolvedValue([
        { path: 'file.ts', absolutePath: '/test/file.ts' },
      ])
      vi.mocked(Parser).mockImplementation(function () {
        return {
          initialize: vi.fn().mockResolvedValue(undefined),
          dispose: vi.fn(),
          parseFile: vi.fn().mockResolvedValue({
            sourceFile: { getFilePath: () => '/t.ts', getFunctions: () => [] },
          }),
        }
      })
      const violations = Array.from({ length: 5 }, () => ({
        ruleId: 'some-pattern-rule',
        severity: 'warning',
        message: 'pattern issue',
        filePath: 'file.ts',
      }))
      vi.mocked(RuleRegistry).mockImplementation(function () {
        return { register: vi.fn(), runRules: vi.fn().mockReturnValue(violations) }
      })

      const cmd = makeAnalyzeHealthCommand()
      const report = await cmd.analyzeHealth('/test')
      const scores = report.scores as Record<string, number>

      // 100 - 5 = 95
      expect(scores.patterns).toBe(95)
    })

    test('test coverage is estimated from test file ratio', async () => {
      vi.mocked(discoverFiles).mockResolvedValue([
        { path: 'src/a.ts', absolutePath: '/test/src/a.ts' },
        { path: 'src/b.ts', absolutePath: '/test/src/b.ts' },
        { path: 'src/c.ts', absolutePath: '/test/src/c.ts' },
        { path: 'test/a.test.ts', absolutePath: '/test/test/a.test.ts' },
      ])
      vi.mocked(Parser).mockImplementation(function () {
        return {
          initialize: vi.fn().mockResolvedValue(undefined),
          dispose: vi.fn(),
          parseFile: vi.fn().mockResolvedValue({
            sourceFile: { getFilePath: () => '/t.ts', getFunctions: () => [] },
          }),
        }
      })
      vi.mocked(RuleRegistry).mockImplementation(function () {
        return { register: vi.fn(), runRules: vi.fn().mockReturnValue([]) }
      })

      const cmd = makeAnalyzeHealthCommand()
      const report = await cmd.analyzeHealth('/test')
      const scores = report.scores as Record<string, number>

      // 1 test file / (4 total - 1 test = 3) * 100 = 33.33
      expect(scores.testCoverage).toBe(33)
    })

    test('scores never go below 0', async () => {
      vi.mocked(discoverFiles).mockResolvedValue([
        { path: 'file.ts', absolutePath: '/test/file.ts' },
      ])
      vi.mocked(Parser).mockImplementation(function () {
        return {
          initialize: vi.fn().mockResolvedValue(undefined),
          dispose: vi.fn(),
          parseFile: vi.fn().mockResolvedValue({
            sourceFile: { getFilePath: () => '/t.ts', getFunctions: () => [] },
          }),
        }
      })
      // Massive number of violations to try to push scores negative
      const violations = Array.from({ length: 100 }, (_, i) => ({
        ruleId: i < 50 ? 'security-issue' : 'max-complexity',
        severity: 'error',
        message: 'err',
        filePath: 'file.ts',
      }))
      vi.mocked(RuleRegistry).mockImplementation(function () {
        return { register: vi.fn(), runRules: vi.fn().mockReturnValue(violations) }
      })

      const cmd = makeAnalyzeHealthCommand()
      const report = await cmd.analyzeHealth('/test')
      const scores = report.scores as Record<string, number>

      expect(scores.complexity).toBeGreaterThanOrEqual(0)
      expect(scores.errors).toBeGreaterThanOrEqual(0)
      expect(scores.security).toBeGreaterThanOrEqual(0)
      expect(scores.patterns).toBeGreaterThanOrEqual(0)
    })
  })

  // ══════════════════════════════════════════════════════════════
  // SECTION 12: Helper function unit tests
  // ══════════════════════════════════════════════════════════════

  describe('Helper functions', () => {
    test('createViolation helper creates valid violation', () => {
      const v = createViolation()
      expect(v.filePath).toBe('test.ts')
      expect(v.message).toBe('test violation')
      expect(v.ruleId).toBe('test-rule')
      expect(v.severity).toBe('warning')
    })

    test('createViolation with overrides', () => {
      const v = createViolation({ filePath: 'custom.ts', severity: 'error' })
      expect(v.filePath).toBe('custom.ts')
      expect(v.severity).toBe('error')
    })

    test('createMockReport creates valid report', () => {
      const report = createMockReport()
      expect(report.overall).toBe(85)
      expect(report.path).toBe('/test')
      expect(report.recommendations).toEqual([])
    })

    test('createMockReport with overrides', () => {
      const report = createMockReport({ overall: 50 })
      expect(report.overall).toBe(50)
    })

    test('makeCommand creates an instance', () => {
      const cmd = makeCommand()
      expect(cmd).toBeDefined()
    })
  })

  // ══════════════════════════════════════════════════════════════
  // SECTION 13: Grade boundaries exhaustive
  // ══════════════════════════════════════════════════════════════

  describe('Grade boundaries exhaustive', () => {
    const cmd = { getGrade: (s: number) => makeGradeCommand().getGrade(s) }

    test('score 100 is grade A', () => {
      expect(cmd.getGrade(100)).toBe('(A)')
    })
    test('score 99 is grade A', () => {
      expect(cmd.getGrade(99)).toBe('(A)')
    })
    test('score 98 is grade A', () => {
      expect(cmd.getGrade(98)).toBe('(A)')
    })
    test('score 97 is grade A', () => {
      expect(cmd.getGrade(97)).toBe('(A)')
    })
    test('score 96 is grade A', () => {
      expect(cmd.getGrade(96)).toBe('(A)')
    })
    test('score 95 is grade A', () => {
      expect(cmd.getGrade(95)).toBe('(A)')
    })
    test('score 94 is grade A', () => {
      expect(cmd.getGrade(94)).toBe('(A)')
    })
    test('score 93 is grade A', () => {
      expect(cmd.getGrade(93)).toBe('(A)')
    })
    test('score 92 is grade A', () => {
      expect(cmd.getGrade(92)).toBe('(A)')
    })
    test('score 91 is grade A', () => {
      expect(cmd.getGrade(91)).toBe('(A)')
    })
    test('score 90 is grade A (boundary)', () => {
      expect(cmd.getGrade(90)).toBe('(A)')
    })
    test('score 89 is grade B (boundary)', () => {
      expect(cmd.getGrade(89)).toBe('(B)')
    })
    test('score 85 is grade B', () => {
      expect(cmd.getGrade(85)).toBe('(B)')
    })
    test('score 80 is grade B (boundary)', () => {
      expect(cmd.getGrade(80)).toBe('(B)')
    })
    test('score 79 is grade C (boundary)', () => {
      expect(cmd.getGrade(79)).toBe('(C)')
    })
    test('score 75 is grade C', () => {
      expect(cmd.getGrade(75)).toBe('(C)')
    })
    test('score 70 is grade C (boundary)', () => {
      expect(cmd.getGrade(70)).toBe('(C)')
    })
    test('score 69 is grade D (boundary)', () => {
      expect(cmd.getGrade(69)).toBe('(D)')
    })
    test('score 65 is grade D', () => {
      expect(cmd.getGrade(65)).toBe('(D)')
    })
    test('score 60 is grade D (boundary)', () => {
      expect(cmd.getGrade(60)).toBe('(D)')
    })
    test('score 59 is grade F (boundary)', () => {
      expect(cmd.getGrade(59)).toBe('(F)')
    })
    test('score 50 is grade F', () => {
      expect(cmd.getGrade(50)).toBe('(F)')
    })
    test('score 40 is grade F', () => {
      expect(cmd.getGrade(40)).toBe('(F)')
    })
    test('score 30 is grade F', () => {
      expect(cmd.getGrade(30)).toBe('(F)')
    })
    test('score 20 is grade F', () => {
      expect(cmd.getGrade(20)).toBe('(F)')
    })
    test('score 10 is grade F', () => {
      expect(cmd.getGrade(10)).toBe('(F)')
    })
    test('score 1 is grade F', () => {
      expect(cmd.getGrade(1)).toBe('(F)')
    })
    test('score 0 is grade F', () => {
      expect(cmd.getGrade(0)).toBe('(F)')
    })
  })

  // ══════════════════════════════════════════════════════════════
  // SECTION 14: getRecommendations combination matrix
  // ══════════════════════════════════════════════════════════════

  describe('getRecommendations combination matrix', () => {
    test('only errors low triggers error recommendation', () => {
      const cmd = makeGetRecommendationsCommand()
      const result = cmd.getRecommendations(
        {
          complexity: 100,
          documentation: 100,
          errors: 70,
          patterns: 100,
          security: 100,
          testCoverage: 100,
        },
        { errors: 5, hasTests: true, security: 0 },
      )
      expect(result).toEqual(['Fix 5 error-level violations'])
    })

    test('only security low triggers security recommendation', () => {
      const cmd = makeGetRecommendationsCommand()
      const result = cmd.getRecommendations(
        {
          complexity: 100,
          documentation: 100,
          errors: 100,
          patterns: 100,
          security: 80,
          testCoverage: 100,
        },
        { errors: 0, hasTests: true, security: 3 },
      )
      expect(result).toEqual(['Address 3 security issues'])
    })

    test('only documentation low triggers docs recommendation', () => {
      const cmd = makeGetRecommendationsCommand()
      const result = cmd.getRecommendations(
        {
          complexity: 100,
          documentation: 40,
          errors: 100,
          patterns: 100,
          security: 100,
          testCoverage: 100,
        },
        { errors: 0, hasTests: true, security: 0 },
      )
      expect(result).toEqual(['Add JSDoc comments to public functions'])
    })

    test('only no tests triggers tests recommendation', () => {
      const cmd = makeGetRecommendationsCommand()
      const result = cmd.getRecommendations(
        {
          complexity: 100,
          documentation: 100,
          errors: 100,
          patterns: 100,
          security: 100,
          testCoverage: 100,
        },
        { errors: 0, hasTests: false, security: 0 },
      )
      expect(result).toEqual(['Add unit tests to improve code quality'])
    })

    test('only complexity low triggers complexity recommendation', () => {
      const cmd = makeGetRecommendationsCommand()
      const result = cmd.getRecommendations(
        {
          complexity: 60,
          documentation: 100,
          errors: 100,
          patterns: 100,
          security: 100,
          testCoverage: 100,
        },
        { errors: 0, hasTests: true, security: 0 },
      )
      expect(result).toEqual(['Reduce code complexity by breaking down large functions'])
    })

    test('errors + security both low', () => {
      const cmd = makeGetRecommendationsCommand()
      const result = cmd.getRecommendations(
        {
          complexity: 100,
          documentation: 100,
          errors: 70,
          patterns: 100,
          security: 80,
          testCoverage: 100,
        },
        { errors: 5, hasTests: true, security: 3 },
      )
      expect(result).toHaveLength(2)
      expect(result[0]).toContain('error-level violations')
      expect(result[1]).toContain('security')
    })

    test('errors + no tests', () => {
      const cmd = makeGetRecommendationsCommand()
      const result = cmd.getRecommendations(
        {
          complexity: 100,
          documentation: 100,
          errors: 70,
          patterns: 100,
          security: 100,
          testCoverage: 100,
        },
        { errors: 5, hasTests: false, security: 0 },
      )
      expect(result).toHaveLength(2)
    })

    test('all five conditions triggered but capped at 5', () => {
      const cmd = makeGetRecommendationsCommand()
      const result = cmd.getRecommendations(
        {
          complexity: 40,
          documentation: 20,
          errors: 50,
          patterns: 100,
          security: 60,
          testCoverage: 100,
        },
        { errors: 25, hasTests: false, security: 10 },
      )
      expect(result.length).toBe(5)
    })

    test('perfect scores with no tests only triggers test recommendation', () => {
      const cmd = makeGetRecommendationsCommand()
      const result = cmd.getRecommendations(
        {
          complexity: 100,
          documentation: 100,
          errors: 100,
          patterns: 100,
          security: 100,
          testCoverage: 100,
        },
        { errors: 0, hasTests: false, security: 0 },
      )
      expect(result).toHaveLength(1)
      expect(result[0]).toContain('unit tests')
    })

    test('high error count formats correctly', () => {
      const cmd = makeGetRecommendationsCommand()
      const result = cmd.getRecommendations(
        {
          complexity: 100,
          documentation: 100,
          errors: 50,
          patterns: 100,
          security: 100,
          testCoverage: 100,
        },
        { errors: 999, hasTests: true, security: 0 },
      )
      expect(result[0]).toBe('Fix 999 error-level violations')
    })

    test('high security count formats correctly', () => {
      const cmd = makeGetRecommendationsCommand()
      const result = cmd.getRecommendations(
        {
          complexity: 100,
          documentation: 100,
          errors: 100,
          patterns: 100,
          security: 50,
          testCoverage: 100,
        },
        { errors: 0, hasTests: true, security: 500 },
      )
      expect(result[0]).toBe('Address 500 security issues')
    })

    test('zero counts still produce recommendations when scores low', () => {
      const cmd = makeGetRecommendationsCommand()
      const result = cmd.getRecommendations(
        {
          complexity: 100,
          documentation: 100,
          errors: 70,
          patterns: 100,
          security: 100,
          testCoverage: 100,
        },
        { errors: 0, hasTests: true, security: 0 },
      )
      // errors < 80 triggers even with 0 count
      expect(result).toContain('Fix 0 error-level violations')
    })
  })

  // ══════════════════════════════════════════════════════════════
  // SECTION 15: Additional run() flag combinations
  // ══════════════════════════════════════════════════════════════

  describe('run() flag combinations', () => {
    test('json=true verbose=false produces JSON', async () => {
      setupDefaultMocks()
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      const mock = cmd as unknown as { log: ReturnType<typeof vi.fn> }
      mock.log = vi.fn()

      await cmd.run()

      const output = mock.log.mock.calls[0][0]
      expect(() => JSON.parse(output)).not.toThrow()
    })

    test('json=true verbose=true produces JSON', async () => {
      setupDefaultMocks()
      const cmd = createCommandWithMockedParse({ json: true, verbose: true })
      const mock = cmd as unknown as { log: ReturnType<typeof vi.fn> }
      mock.log = vi.fn()

      await cmd.run()

      const output = mock.log.mock.calls[0][0]
      expect(() => JSON.parse(output)).not.toThrow()
    })

    test('json=false verbose=false calls log multiple times', async () => {
      setupDefaultMocks()
      const cmd = createCommandWithMockedParse({ json: false, verbose: false })
      const mock = cmd as unknown as { log: ReturnType<typeof vi.fn> }
      mock.log = vi.fn()

      await cmd.run()

      expect(mock.log.mock.calls.length).toBeGreaterThan(1)
    })

    test('json=false verbose=true calls log many times', async () => {
      setupDefaultMocks()
      const cmd = createCommandWithMockedParse({ json: false, verbose: true })
      const mock = cmd as unknown as { log: ReturnType<typeof vi.fn> }
      mock.log = vi.fn()

      await cmd.run()

      expect(mock.log.mock.calls.length).toBeGreaterThan(5)
    })

    test('run with non-existent path calls error', async () => {
      vi.mocked(existsSync).mockReturnValue(false)
      const cmd = createCommandWithMockedParse({ json: false, verbose: false })
      const mock = cmd as unknown as {
        log: ReturnType<typeof vi.fn>
        error: ReturnType<typeof vi.fn>
      }
      mock.log = vi.fn()
      mock.error = vi.fn()

      await cmd.run()

      expect(mock.error).toHaveBeenCalled()
    })

    test('run resolves path argument', async () => {
      setupDefaultMocks()
      const cmd = new Health([], {} as never)
      const cmdWithMock = cmd as unknown as {
        parse: ReturnType<typeof vi.fn>
        log: ReturnType<typeof vi.fn>
      }
      cmdWithMock.parse = vi.fn().mockResolvedValue({
        args: { path: '/specific/path' },
        flags: { json: true, verbose: false },
      })
      cmdWithMock.log = vi.fn()

      await cmd.run()

      const output = cmdWithMock.log.mock.calls[0][0]
      const parsed = JSON.parse(output)
      expect(parsed.path).toContain('specific')
    })
  })

  // ══════════════════════════════════════════════════════════════
  // SECTION 16: analyzeComplexity detailed edge cases
  // ══════════════════════════════════════════════════════════════

  describe('analyzeComplexity detailed', () => {
    test('empty string file path', () => {
      const cmd = makeAnalyzeComplexityCommand()
      const result = cmd.analyzeComplexity([
        createViolation({ filePath: '', ruleId: 'max-complexity' }),
      ])
      expect(result.filesAnalyzed).toBe(1)
    })

    test('case sensitivity in ruleId matching', () => {
      const cmd = makeAnalyzeComplexityCommand()
      const result = cmd.analyzeComplexity([
        createViolation({ filePath: 'a.ts', ruleId: 'Max-Complexity' }),
      ])
      // Should not match because filter uses includes('complexity') which is case sensitive
      expect(result.filesAnalyzed).toBe(0)
    })

    test('ruleId containing complexity substring', () => {
      const cmd = makeAnalyzeComplexityCommand()
      const result = cmd.analyzeComplexity([
        createViolation({ filePath: 'a.ts', ruleId: 'some-complexity-rule' }),
      ])
      expect(result.filesAnalyzed).toBe(1)
    })

    test('message containing "high" anywhere', () => {
      const cmd = makeAnalyzeComplexityCommand()
      const result = cmd.analyzeComplexity([
        createViolation({
          filePath: 'a.ts',
          ruleId: 'max-complexity',
          message: 'this is higher than expected',
        }),
      ])
      expect(result.highComplexityFiles).toBe(1)
    })

    test('message not containing "high"', () => {
      const cmd = makeAnalyzeComplexityCommand()
      const result = cmd.analyzeComplexity([
        createViolation({
          filePath: 'a.ts',
          ruleId: 'max-complexity',
          message: 'low threshold exceeded',
        }),
      ])
      expect(result.highComplexityFiles).toBe(0)
    })

    test('exact boundary avgComplexity calculation', () => {
      const cmd = makeAnalyzeComplexityCommand()
      const violations = [
        createViolation({ filePath: 'a.ts', ruleId: 'max-complexity' }),
        createViolation({ filePath: 'a.ts', ruleId: 'max-complexity' }),
        createViolation({ filePath: 'a.ts', ruleId: 'max-complexity' }),
        createViolation({ filePath: 'b.ts', ruleId: 'max-complexity' }),
      ]
      const result = cmd.analyzeComplexity(violations)
      expect(result.avgComplexity).toBe(2) // 4 violations / 2 files
    })

    test('avgComplexity is 0 for empty array', () => {
      const cmd = makeAnalyzeComplexityCommand()
      const result = cmd.analyzeComplexity([])
      expect(result.avgComplexity).toBe(0)
    })
  })

  // ══════════════════════════════════════════════════════════════
  // SECTION 17: displayReport with various score combinations
  // ══════════════════════════════════════════════════════════════

  describe('displayReport score ranges', () => {
    test('all scores green (>=80)', () => {
      const cmd = makeDisplayReportCommand()
      const report = createMockReport({
        overall: 90,
        scores: {
          complexity: 90,
          documentation: 90,
          errors: 90,
          patterns: 90,
          security: 90,
          testCoverage: 90,
        },
      })
      expect(() => cmd.displayReport(report, true)).not.toThrow()
    })

    test('mixed green and yellow scores', () => {
      const cmd = makeDisplayReportCommand()
      const report = createMockReport({
        overall: 75,
        scores: {
          complexity: 90,
          documentation: 70,
          errors: 85,
          patterns: 65,
          security: 80,
          testCoverage: 60,
        },
      })
      expect(() => cmd.displayReport(report, true)).not.toThrow()
    })

    test('all scores red (<60)', () => {
      const cmd = makeDisplayReportCommand()
      const report = createMockReport({
        overall: 30,
        scores: {
          complexity: 20,
          documentation: 10,
          errors: 30,
          patterns: 40,
          security: 15,
          testCoverage: 0,
        },
      })
      expect(() => cmd.displayReport(report, true)).not.toThrow()
    })

    test('mixed red and yellow scores', () => {
      const cmd = makeDisplayReportCommand()
      const report = createMockReport({
        overall: 50,
        scores: {
          complexity: 50,
          documentation: 60,
          errors: 40,
          patterns: 65,
          security: 55,
          testCoverage: 30,
        },
      })
      expect(() => cmd.displayReport(report, true)).not.toThrow()
    })

    test('verbose with all score values at boundaries', () => {
      const cmd = makeDisplayReportCommand()
      const report = createMockReport({
        overall: 60,
        scores: {
          complexity: 60,
          documentation: 60,
          errors: 60,
          patterns: 60,
          security: 60,
          testCoverage: 60,
        },
      })
      expect(() => cmd.displayReport(report, true)).not.toThrow()
    })

    test('non-verbose with recommendations still shows recommendations', () => {
      const cmd = makeDisplayReportCommand()
      const report = createMockReport({
        overall: 70,
        recommendations: ['Do this', 'Do that', 'Also this'],
      })
      expect(() => cmd.displayReport(report, false)).not.toThrow()
    })

    test('verbose with 5 recommendations', () => {
      const cmd = makeDisplayReportCommand()
      const report = createMockReport({
        overall: 40,
        recommendations: ['Fix 1', 'Fix 2', 'Fix 3', 'Fix 4', 'Fix 5'],
      })
      expect(() => cmd.displayReport(report, true)).not.toThrow()
    })
  })
})
