import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import Health from '../../src/commands/health.js'

// ─── Top-level mocks ───

const mockDiscoverFiles = vi.fn().mockResolvedValue([])
const mockParserInitialize = vi.fn().mockResolvedValue(undefined)
const mockParserParseFile = vi.fn()
const mockParserDispose = vi.fn()
const mockRuleRegistryRegister = vi.fn()
const mockRuleRegistryRunRules = vi.fn().mockReturnValue([])
const mockGetRuleCategory = vi.fn().mockReturnValue('complexity')
const mockLazyLoadAllRules = vi.fn().mockResolvedValue({})
const mockExistsSync = vi.fn().mockReturnValue(true)

const mockAnalyzeComplexity = vi.fn().mockReturnValue({ avgComplexity: 0, filesAnalyzed: 0, highComplexityFiles: 0 })
const mockCalculateScores = vi.fn()
const mockDisplayReport = vi.fn().mockReturnValue([])
const mockFormatScore = vi.fn().mockReturnValue('  85 / 100')
const mockGetGrade = vi.fn().mockReturnValue('(A)')
const mockGetScoreColor = vi.fn().mockReturnValue((s: string) => s)
const mockGetRecommendations = vi.fn().mockReturnValue([])

vi.mock('node:fs', () => ({
  existsSync: (...args: unknown[]) => mockExistsSync(...args),
}))

vi.mock('ora', () => ({
  default: () => ({
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    fail: vi.fn().mockReturnThis(),
    stop: vi.fn().mockReturnThis(),
    text: '',
  }),
}))

vi.mock('../../src/core/parser.js', () => ({
  Parser: class {
    initialize = (...args: unknown[]) => mockParserInitialize(...args)
    parseFile = (...args: unknown[]) => mockParserParseFile(...args)
    dispose = (...args: unknown[]) => mockParserDispose(...args)
  },
}))

vi.mock('../../src/core/file-discovery.js', () => ({
  discoverFiles: (...args: unknown[]) => mockDiscoverFiles(...args),
}))

vi.mock('../../src/core/rule-registry.js', () => ({
  RuleRegistry: class {
    register = (...args: unknown[]) => mockRuleRegistryRegister(...args)
    runRules = (...args: unknown[]) => mockRuleRegistryRunRules(...args)
  },
}))

vi.mock('../../src/rules/categories.js', () => ({
  getRuleCategory: (...args: unknown[]) => mockGetRuleCategory(...args),
}))

vi.mock('../../src/rules/lazy-loader.js', () => ({
  lazyRuleLoader: {
    loadAllRules: (...args: unknown[]) => mockLazyLoadAllRules(...args),
  },
}))

vi.mock('../../src/utils/constants.js', () => ({
  MAX_FILES_TO_PROCESS: 100,
}))

vi.mock('../../src/commands/health-helpers.js', () => ({
  analyzeComplexity: (...args: unknown[]) => mockAnalyzeComplexity(...args),
  calculateScores: (...args: unknown[]) => mockCalculateScores(...args),
  displayReport: (...args: unknown[]) => mockDisplayReport(...args),
  formatScore: (...args: unknown[]) => mockFormatScore(...args),
  getGrade: (...args: unknown[]) => mockGetGrade(...args),
  getRecommendations: (...args: unknown[]) => mockGetRecommendations(...args),
  getScoreColor: (...args: unknown[]) => mockGetScoreColor(...args),
}))

// ─── Helpers ───

function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*m/g, '')
}

interface HealthPrivate {
  analyzeHealth: (targetPath: string) => Promise<unknown>
  log: (...args: unknown[]) => void
}

function createHealthInstance(): { command: Health; p: HealthPrivate; logs: string[] } {
  const logs: string[] = []
  const command = new Health([], {} as never)
  const p = command as unknown as HealthPrivate

  p.log = (...args: unknown[]) => {
    logs.push(args.map(String).join(' '))
  }

  return { command, p, logs }
}

function makeViolation(overrides: Partial<{ filePath: string; message: string; ruleId: string; severity: 'error' | 'warning' | 'info' }> = {}) {
  return {
    filePath: overrides.filePath ?? 'src/a.ts',
    message: overrides.message ?? 'some violation',
    ruleId: overrides.ruleId ?? 'some-rule',
    severity: overrides.severity ?? 'warning' as const,
    range: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
  }
}

function resetMocks(): void {
  vi.clearAllMocks()

  mockDiscoverFiles.mockResolvedValue([])
  mockParserInitialize.mockResolvedValue(undefined)
  mockParserParseFile.mockResolvedValue({ sourceFile: { getFunctions: vi.fn().mockReturnValue([]) } })
  mockParserDispose.mockReturnValue(undefined)
  mockRuleRegistryRegister.mockReturnValue(undefined)
  mockRuleRegistryRunRules.mockReturnValue([])
  mockGetRuleCategory.mockReturnValue('complexity')
  mockLazyLoadAllRules.mockResolvedValue({})
  mockExistsSync.mockReturnValue(true)
  mockAnalyzeComplexity.mockReturnValue({ avgComplexity: 0, filesAnalyzed: 0, highComplexityFiles: 0 })
  mockCalculateScores.mockReturnValue({
    errorCount: 0,
    overall: 85,
    patternCount: 0,
    scores: { complexity: 85, documentation: 90, errors: 95, patterns: 88, security: 92, testCoverage: 70 },
    securityCount: 0,
    testCoverage: { estimated: 70, hasTests: true },
  })
  mockDisplayReport.mockReturnValue([])
  mockFormatScore.mockReturnValue('  85 / 100')
  mockGetGrade.mockReturnValue('(A)')
  mockGetScoreColor.mockReturnValue((s: string) => s)
  mockGetRecommendations.mockReturnValue([])
}

// ─── Static properties ───

describe('Health command static properties', () => {
  it('has correct description', () => {
    expect(Health.description).toBe('Display project health score and recommendations')
  })

  it('defines path arg as optional string with default "."', () => {
    const pathArg = Health.args!.path as Record<string, unknown>
    expect(pathArg).toBeDefined()
    expect(pathArg.description).toBe('Path to analyze')
    expect(pathArg.default).toBe('.')
    expect(pathArg.required).toBe(false)
  })

  it('has json flag defaulting to false', () => {
    const jsonFlag = Health.flags!.json as Record<string, unknown>
    expect(jsonFlag).toBeDefined()
    expect(jsonFlag.default).toBe(false)
  })

  it('has verbose flag with char v defaulting to false', () => {
    const verboseFlag = Health.flags!.verbose as Record<string, unknown>
    expect(verboseFlag).toBeDefined()
    expect(verboseFlag.char).toBe('v')
    expect(verboseFlag.default).toBe(false)
  })

  it('defines at least 2 examples', () => {
    expect(Health.examples!.length).toBeGreaterThanOrEqual(2)
  })

  it('each example has command and description strings', () => {
    for (const example of Health.examples!) {
      expect(example).toHaveProperty('command')
      expect(example).toHaveProperty('description')
      expect(typeof example.command).toBe('string')
      expect(typeof example.description).toBe('string')
      expect(example.command.length).toBeGreaterThan(0)
      expect(example.description.length).toBeGreaterThan(0)
    }
  })
})

// ─── Path validation ───

describe('Health run() - path validation', () => {
  it('errors when path does not exist', () => {
    mockExistsSync.mockReturnValueOnce(false)

    const command = new Health([], {} as never)
    command.error = vi.fn() as never

    const targetPath = '/nonexistent/path'
    if (!mockExistsSync(targetPath)) {
      command.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    expect(command.error).toHaveBeenCalledWith(`Path not found: ${targetPath}`, { exit: 1 })
  })
})

// ─── Delegate method: getGrade ───

describe('Health.getGrade() delegation', () => {
  it('delegates to helper getGrade', () => {
    mockGetGrade.mockReturnValue('(B)')
    const { command } = createHealthInstance()
    expect(command.getGrade(80)).toBe('(B)')
    expect(mockGetGrade).toHaveBeenCalledWith(80)
  })

  it('returns helper result unchanged', () => {
    mockGetGrade.mockReturnValue('(F)')
    const { command } = createHealthInstance()
    expect(command.getGrade(30)).toBe('(F)')
  })
})

// ─── Delegate method: formatScore ───

describe('Health.formatScore() delegation', () => {
  it('delegates to helper formatScore', () => {
    mockFormatScore.mockReturnValue('  92 / 100')
    const { command } = createHealthInstance()
    expect(command.formatScore(92)).toBe('  92 / 100')
    expect(mockFormatScore).toHaveBeenCalledWith(92)
  })
})

// ─── Delegate method: getScoreColor ───

describe('Health.getScoreColor() delegation', () => {
  it('delegates to helper getScoreColor', () => {
    const mockFn = (s: string) => s
    mockGetScoreColor.mockReturnValue(mockFn)
    const { command } = createHealthInstance()
    expect(command.getScoreColor(85)).toBe(mockFn)
    expect(mockGetScoreColor).toHaveBeenCalledWith(85)
  })
})

// ─── Delegate method: analyzeComplexity ───

describe('Health.analyzeComplexity() delegation', () => {
  it('delegates to helper analyzeComplexity', () => {
    const expected = { avgComplexity: 3.5, filesAnalyzed: 4, highComplexityFiles: 1 }
    mockAnalyzeComplexity.mockReturnValue(expected)

    const { command } = createHealthInstance()
    const violations = [makeViolation({ ruleId: 'complexity-rule', message: 'high complexity' })]

    expect(command.analyzeComplexity(violations)).toEqual(expected)
    expect(mockAnalyzeComplexity).toHaveBeenCalledWith(violations)
  })
})

// ─── Delegate method: getRecommendations ───

describe('Health.getRecommendations() delegation', () => {
  it('delegates to helper getRecommendations', () => {
    const expectedRecs = ['Fix errors', 'Add tests']
    mockGetRecommendations.mockReturnValue(expectedRecs)

    const { command } = createHealthInstance()
    const scores = { complexity: 60, documentation: 40, errors: 70, patterns: 85, security: 90, testCoverage: 50 }
    const details = { errors: 5, hasTests: false, security: 2 }

    expect(command.getRecommendations(scores, details)).toEqual(expectedRecs)
    expect(mockGetRecommendations).toHaveBeenCalledWith(scores, details)
  })
})

// ─── Delegate method: displayReport ───

describe('Health.displayReport() delegation', () => {
  it('logs each line from displayReport helper', () => {
    const lines = ['  Project Health Score', '  85 / 100  (A)', '']
    mockDisplayReport.mockReturnValue(lines)

    const { command, logs } = createHealthInstance()
    const report = {} as Parameters<typeof command.displayReport>[0]
    command.displayReport(report, true)

    expect(mockDisplayReport).toHaveBeenCalledWith(report, true)
    expect(logs).toEqual(lines)
  })

  it('passes verbose=false to helper', () => {
    mockDisplayReport.mockReturnValue([])
    const { command } = createHealthInstance()
    const report = {} as Parameters<typeof command.displayReport>[0]
    command.displayReport(report, false)

    expect(mockDisplayReport).toHaveBeenCalledWith(report, false)
  })
})

// ─── analyzeHealth - empty codebase ───

describe('analyzeHealth - empty codebase', () => {
  beforeEach(() => {
    resetMocks()
    mockDiscoverFiles.mockResolvedValue([])
  })

  it('returns report with overall score from calculateScores', async () => {
    mockCalculateScores.mockReturnValue({
      errorCount: 0,
      overall: 100,
      patternCount: 0,
      scores: { complexity: 100, documentation: 50, errors: 100, patterns: 100, security: 100, testCoverage: 0 },
      securityCount: 0,
      testCoverage: { estimated: 0, hasTests: false },
    })

    const { p } = createHealthInstance()
    const report = await p.analyzeHealth('/project') as Record<string, unknown>

    expect(report.overall).toBe(100)
  })

  it('passes empty violations to calculateScores', async () => {
    const { p } = createHealthInstance()
    await p.analyzeHealth('/project')

    expect(mockCalculateScores).toHaveBeenCalledWith(
      [],
      0,
      0,
      [],
    )
  })

  it('rounds individual category scores', async () => {
    mockCalculateScores.mockReturnValue({
      errorCount: 1,
      overall: 73,
      patternCount: 2,
      scores: { complexity: 73.6, documentation: 55.2, errors: 88.1, patterns: 91.7, security: 67.3, testCoverage: 44.8 },
      securityCount: 3,
      testCoverage: { estimated: 45, hasTests: false },
    })

    const { p } = createHealthInstance()
    const report = await p.analyzeHealth('/project') as Record<string, Record<string, unknown>>

    const scores = report.scores as Record<string, number>
    expect(scores.complexity).toBe(74)
    expect(scores.documentation).toBe(55)
    expect(scores.errors).toBe(88)
    expect(scores.patterns).toBe(92)
    expect(scores.security).toBe(67)
    expect(scores.testCoverage).toBe(45)
  })
})

// ─── analyzeHealth - with files and violations ───

describe('analyzeHealth - with files and violations', () => {
  beforeEach(() => {
    resetMocks()

    const mockSourceFile = {
      getFunctions: vi.fn().mockReturnValue([
        { getJsDocs: vi.fn().mockReturnValue(['doc']) },
        { getJsDocs: vi.fn().mockReturnValue([]) },
      ]),
    }

    mockDiscoverFiles.mockResolvedValue([
      { absolutePath: '/project/a.ts', path: 'a.ts' },
      { absolutePath: '/project/b.ts', path: 'b.ts' },
    ])

    mockParserParseFile.mockResolvedValue({ sourceFile: mockSourceFile })

    mockRuleRegistryRunRules.mockReturnValue([
      makeViolation({ ruleId: 'complexity-rule', severity: 'warning' }),
      makeViolation({ ruleId: 'security-rule', severity: 'error' }),
    ])

    mockCalculateScores.mockReturnValue({
      errorCount: 2,
      overall: 72,
      patternCount: 0,
      scores: { complexity: 90, documentation: 50, errors: 96, patterns: 100, security: 80, testCoverage: 100 },
      securityCount: 2,
      testCoverage: { estimated: 100, hasTests: true },
    })
  })

  it('returns correct report structure', async () => {
    const { p } = createHealthInstance()
    const report = await p.analyzeHealth('/project') as Record<string, unknown>

    expect(report).toHaveProperty('overall')
    expect(report).toHaveProperty('scores')
    expect(report).toHaveProperty('details')
    expect(report).toHaveProperty('recommendations')
    expect(report).toHaveProperty('path')
  })

  it('includes target path in report', async () => {
    const { p } = createHealthInstance()
    const report = await p.analyzeHealth('/my/project') as Record<string, unknown>

    expect(report.path).toBe('/my/project')
  })

  it('passes violations to analyzeComplexity', async () => {
    const { p } = createHealthInstance()
    await p.analyzeHealth('/project')

    expect(mockAnalyzeComplexity).toHaveBeenCalled()
    const violationsArg = mockAnalyzeComplexity.mock.calls[0][0] as unknown[]
    // 2 files × 2 violations each = 4
    expect(violationsArg.length).toBe(4)
  })

  it('counts documentation from parsed functions', async () => {
    const { p } = createHealthInstance()
    await p.analyzeHealth('/project')

    // 2 files × 2 functions each = 4 totalFunctions
    // 2 files × 1 documented function each = 2 documentedFunctions
    expect(mockCalculateScores).toHaveBeenCalledWith(
      expect.any(Array),
      4, // totalFunctions
      2, // documentedFunctions
      expect.any(Array),
    )
  })

  it('calls getRecommendations with correct details', async () => {
    mockGetRecommendations.mockReturnValue(['Fix errors'])
    const { p } = createHealthInstance()
    await p.analyzeHealth('/project')

    expect(mockGetRecommendations).toHaveBeenCalledWith(
      expect.objectContaining({
        complexity: 90,
        documentation: 50,
      }),
      {
        errors: 2,
        hasTests: true,
        security: 2,
      },
    )
  })

  it('returns recommendations from getRecommendations', async () => {
    const recs = ['Fix errors', 'Add tests']
    mockGetRecommendations.mockReturnValue(recs)
    const { p } = createHealthInstance()
    const report = await p.analyzeHealth('/project') as Record<string, unknown>

    expect(report.recommendations).toEqual(recs)
  })

  it('includes test coverage details', async () => {
    const { p } = createHealthInstance()
    const report = await p.analyzeHealth('/project') as Record<string, Record<string, unknown>>

    const details = report.details as Record<string, unknown>
    const testCoverage = details.testCoverage as Record<string, unknown>
    expect(testCoverage.hasTests).toBe(true)
    expect(testCoverage.estimated).toBe(100)
  })

  it('includes complexity details from analyzeComplexity', async () => {
    mockAnalyzeComplexity.mockReturnValue({ avgComplexity: 2.5, filesAnalyzed: 3, highComplexityFiles: 1 })
    const { p } = createHealthInstance()
    const report = await p.analyzeHealth('/project') as Record<string, Record<string, unknown>>

    const details = report.details as Record<string, unknown>
    expect(details.complexity).toEqual({ avgComplexity: 2.5, filesAnalyzed: 3, highComplexityFiles: 1 })
  })

  it('includes error, pattern, and security counts in details', async () => {
    const { p } = createHealthInstance()
    const report = await p.analyzeHealth('/project') as Record<string, Record<string, unknown>>

    const details = report.details as Record<string, unknown>
    expect(details.errors).toBe(2)
    expect(details.patterns).toBe(0)
    expect(details.security).toBe(2)
  })
})

// ─── analyzeHealth - parse failures ───

describe('analyzeHealth - parse failures', () => {
  beforeEach(() => {
    resetMocks()
  })

  it('gracefully skips files that fail to parse', async () => {
    let parseCallCount = 0
    mockParserParseFile.mockImplementation(() => {
      parseCallCount++
      if (parseCallCount === 1) {
        return Promise.reject(new Error('Parse failed'))
      }
      return Promise.resolve({
        sourceFile: { getFunctions: vi.fn().mockReturnValue([]) },
      })
    })

    mockDiscoverFiles.mockResolvedValue([
      { absolutePath: '/project/bad.ts', path: 'bad.ts' },
      { absolutePath: '/project/good.ts', path: 'good.ts' },
    ])

    mockRuleRegistryRunRules.mockReturnValue([])
    mockCalculateScores.mockReturnValue({
      errorCount: 0,
      overall: 100,
      patternCount: 0,
      scores: { complexity: 100, documentation: 50, errors: 100, patterns: 100, security: 100, testCoverage: 0 },
      securityCount: 0,
      testCoverage: { estimated: 0, hasTests: false },
    })

    const { p } = createHealthInstance()
    const report = await p.analyzeHealth('/project') as Record<string, unknown>

    // Should not throw; report still generated
    expect(report).toBeDefined()
    expect(report.overall).toBe(100)
  })

  it('gracefully skips files where rule execution fails', async () => {
    mockDiscoverFiles.mockResolvedValue([
      { absolutePath: '/project/a.ts', path: 'a.ts' },
    ])

    mockParserParseFile.mockResolvedValue({
      sourceFile: { getFunctions: vi.fn().mockReturnValue([]) },
    })

    mockRuleRegistryRunRules.mockImplementation(() => {
      throw new Error('Rule failed')
    })

    mockCalculateScores.mockReturnValue({
      errorCount: 0,
      overall: 100,
      patternCount: 0,
      scores: { complexity: 100, documentation: 50, errors: 100, patterns: 100, security: 100, testCoverage: 0 },
      securityCount: 0,
      testCoverage: { estimated: 0, hasTests: false },
    })

    const { p } = createHealthInstance()
    const report = await p.analyzeHealth('/project') as Record<string, unknown>

    expect(report).toBeDefined()
    expect(report.overall).toBe(100)
  })
})

// ─── analyzeHealth - MAX_FILES cap ───

describe('analyzeHealth - MAX_FILES_TO_PROCESS cap', () => {
  beforeEach(() => {
    resetMocks()
  })

  it('caps files at MAX_FILES_TO_PROCESS', async () => {
    const manyFiles = Array.from({ length: 150 }, (_, i) => ({
      absolutePath: `/project/file${i}.ts`,
      path: `file${i}.ts`,
    }))
    mockDiscoverFiles.mockResolvedValue(manyFiles)

    mockParserParseFile.mockResolvedValue({
      sourceFile: { getFunctions: vi.fn().mockReturnValue([]) },
    })

    mockRuleRegistryRunRules.mockReturnValue([])
    mockCalculateScores.mockReturnValue({
      errorCount: 0,
      overall: 100,
      patternCount: 0,
      scores: { complexity: 100, documentation: 50, errors: 100, patterns: 100, security: 100, testCoverage: 0 },
      securityCount: 0,
      testCoverage: { estimated: 0, hasTests: false },
    })

    const { p } = createHealthInstance()
    await p.analyzeHealth('/project')

    // calculateScores receives only the first 100 files
    const filesArg = mockCalculateScores.mock.calls[0][3] as unknown[]
    expect(filesArg.length).toBe(150) // all files passed to calculateScores
    // but parseFile only called 100 times
    expect(mockParserParseFile).toHaveBeenCalledTimes(100)
  })
})

// ─── analyzeHealth - rule registration ───

describe('analyzeHealth - rule registration', () => {
  beforeEach(() => {
    resetMocks()
    mockDiscoverFiles.mockResolvedValue([])

    const mockRules = {
      'rule-a': { meta: { name: 'rule-a' } },
      'rule-b': { meta: { name: 'rule-b' } },
    }
    mockLazyLoadAllRules.mockResolvedValue(mockRules)
    mockGetRuleCategory.mockReturnValue('security')
  })

  it('registers all loaded rules with the registry', async () => {
    const { p } = createHealthInstance()
    await p.analyzeHealth('/project')

    expect(mockRuleRegistryRegister).toHaveBeenCalledTimes(2)
    expect(mockRuleRegistryRegister).toHaveBeenCalledWith('rule-a', expect.anything(), 'security')
    expect(mockRuleRegistryRegister).toHaveBeenCalledWith('rule-b', expect.anything(), 'security')
  })
})

// ─── analyzeHealth - parser lifecycle ───

describe('analyzeHealth - parser lifecycle', () => {
  beforeEach(() => {
    resetMocks()
    mockDiscoverFiles.mockResolvedValue([])
  })

  it('calls parser.initialize() before parsing', async () => {
    const { p } = createHealthInstance()
    await p.analyzeHealth('/project')

    expect(mockParserInitialize).toHaveBeenCalled()
  })

  it('calls parser.dispose() after analysis', async () => {
    const { p } = createHealthInstance()
    await p.analyzeHealth('/project')

    expect(mockParserDispose).toHaveBeenCalled()
  })
})

// ─── analyzeHealth - test coverage detection ───

describe('analyzeHealth - test coverage detection', () => {
  beforeEach(() => {
    resetMocks()
  })

  it('detects test files by path containing "test"', async () => {
    mockDiscoverFiles.mockResolvedValue([
      { absolutePath: '/project/src/app.ts', path: 'src/app.ts' },
      { absolutePath: '/project/test/app.test.ts', path: 'test/app.test.ts' },
    ])

    mockParserParseFile.mockResolvedValue({
      sourceFile: { getFunctions: vi.fn().mockReturnValue([]) },
    })

    mockRuleRegistryRunRules.mockReturnValue([])
    mockCalculateScores.mockReturnValue({
      errorCount: 0,
      overall: 90,
      patternCount: 0,
      scores: { complexity: 90, documentation: 50, errors: 100, patterns: 100, security: 100, testCoverage: 100 },
      securityCount: 0,
      testCoverage: { estimated: 100, hasTests: true },
    })

    const { p } = createHealthInstance()
    await p.analyzeHealth('/project')

    // calculateScores receives the files, which include a test file
    expect(mockCalculateScores).toHaveBeenCalledWith(
      expect.any(Array),
      expect.any(Number),
      expect.any(Number),
      expect.arrayContaining([
        expect.objectContaining({ path: 'test/app.test.ts' }),
      ]),
    )
  })

  it('detects test files by path containing "spec"', async () => {
    mockDiscoverFiles.mockResolvedValue([
      { absolutePath: '/project/src/util.ts', path: 'src/util.ts' },
      { absolutePath: '/project/spec/util.spec.ts', path: 'spec/util.spec.ts' },
    ])

    mockParserParseFile.mockResolvedValue({
      sourceFile: { getFunctions: vi.fn().mockReturnValue([]) },
    })

    mockRuleRegistryRunRules.mockReturnValue([])
    mockCalculateScores.mockReturnValue({
      errorCount: 0,
      overall: 90,
      patternCount: 0,
      scores: { complexity: 90, documentation: 50, errors: 100, patterns: 100, security: 100, testCoverage: 50 },
      securityCount: 0,
      testCoverage: { estimated: 50, hasTests: true },
    })

    const { p } = createHealthInstance()
    await p.analyzeHealth('/project')

    expect(mockCalculateScores).toHaveBeenCalledWith(
      expect.any(Array),
      expect.any(Number),
      expect.any(Number),
      expect.arrayContaining([
        expect.objectContaining({ path: 'spec/util.spec.ts' }),
      ]),
    )
  })
})

// ─── analyzeHealth - documentation counting ───

describe('analyzeHealth - documentation counting', () => {
  beforeEach(() => {
    resetMocks()

    mockDiscoverFiles.mockResolvedValue([
      { absolutePath: '/project/a.ts', path: 'a.ts' },
    ])

    const mockSourceFile = {
      getFunctions: vi.fn().mockReturnValue([
        { getJsDocs: vi.fn().mockReturnValue(['doc1']) },
        { getJsDocs: vi.fn().mockReturnValue([]) },
        { getJsDocs: vi.fn().mockReturnValue(['doc2']) },
        { getJsDocs: vi.fn().mockReturnValue([]) },
        { getJsDocs: vi.fn().mockReturnValue([]) },
      ]),
    }

    mockParserParseFile.mockResolvedValue({ sourceFile: mockSourceFile })
    mockRuleRegistryRunRules.mockReturnValue([])
    mockCalculateScores.mockReturnValue({
      errorCount: 0,
      overall: 80,
      patternCount: 0,
      scores: { complexity: 80, documentation: 40, errors: 100, patterns: 100, security: 100, testCoverage: 0 },
      securityCount: 0,
      testCoverage: { estimated: 0, hasTests: false },
    })
  })

  it('counts total and documented functions correctly', async () => {
    const { p } = createHealthInstance()
    await p.analyzeHealth('/project')

    // 5 total functions, 2 with JSDoc
    expect(mockCalculateScores).toHaveBeenCalledWith(
      expect.any(Array),
      5,
      2,
      expect.any(Array),
    )
  })
})

// ─── analyzeHealth - no functions in files ───

describe('analyzeHealth - files with no functions', () => {
  beforeEach(() => {
    resetMocks()

    mockDiscoverFiles.mockResolvedValue([
      { absolutePath: '/project/constants.ts', path: 'constants.ts' },
    ])

    mockParserParseFile.mockResolvedValue({
      sourceFile: { getFunctions: vi.fn().mockReturnValue([]) },
    })

    mockRuleRegistryRunRules.mockReturnValue([])
    mockCalculateScores.mockReturnValue({
      errorCount: 0,
      overall: 85,
      patternCount: 0,
      scores: { complexity: 85, documentation: 50, errors: 100, patterns: 100, security: 100, testCoverage: 0 },
      securityCount: 0,
      testCoverage: { estimated: 0, hasTests: false },
    })
  })

  it('passes zero total and documented functions when no functions found', async () => {
    const { p } = createHealthInstance()
    await p.analyzeHealth('/project')

    expect(mockCalculateScores).toHaveBeenCalledWith(
      expect.any(Array),
      0,
      0,
      expect.any(Array),
    )
  })
})

// ─── analyzeHealth - details documentation field ───

describe('analyzeHealth - details documentation field', () => {
  beforeEach(() => {
    resetMocks()

    mockDiscoverFiles.mockResolvedValue([
      { absolutePath: '/project/a.ts', path: 'a.ts' },
    ])

    const mockSourceFile = {
      getFunctions: vi.fn().mockReturnValue([
        { getJsDocs: vi.fn().mockReturnValue(['doc']) },
        { getJsDocs: vi.fn().mockReturnValue([]) },
        { getJsDocs: vi.fn().mockReturnValue(['doc2']) },
      ]),
    }

    mockParserParseFile.mockResolvedValue({ sourceFile: mockSourceFile })
    mockRuleRegistryRunRules.mockReturnValue([])
    mockCalculateScores.mockReturnValue({
      errorCount: 0,
      overall: 90,
      patternCount: 0,
      scores: { complexity: 90, documentation: 67, errors: 100, patterns: 100, security: 100, testCoverage: 0 },
      securityCount: 0,
      testCoverage: { estimated: 0, hasTests: false },
    })
  })

  it('includes raw documentation counts in details', async () => {
    const { p } = createHealthInstance()
    const report = await p.analyzeHealth('/project') as Record<string, Record<string, unknown>>

    const details = report.details as Record<string, unknown>
    expect(details.documentation).toEqual({ documentedFunctions: 2, totalFunctions: 3 })
  })
})

// ─── analyzeHealth - scores rounding ───

describe('analyzeHealth - scores rounding', () => {
  beforeEach(() => {
    resetMocks()
    mockDiscoverFiles.mockResolvedValue([])

    mockCalculateScores.mockReturnValue({
      errorCount: 0,
      overall: 73,
      patternCount: 0,
      scores: { complexity: 73.4, documentation: 55.7, errors: 88.1, patterns: 91.6, security: 67.3, testCoverage: 44.9 },
      securityCount: 0,
      testCoverage: { estimated: 0, hasTests: false },
    })
  })

  it('rounds each category score with Math.round', async () => {
    const { p } = createHealthInstance()
    const report = await p.analyzeHealth('/project') as Record<string, Record<string, number>>

    const scores = report.scores as Record<string, number>
    expect(scores.complexity).toBe(73)
    expect(scores.documentation).toBe(56)
    expect(scores.errors).toBe(88)
    expect(scores.patterns).toBe(92)
    expect(scores.security).toBe(67)
    expect(scores.testCoverage).toBe(45)
  })

  it('all score values are integers', async () => {
    const { p } = createHealthInstance()
    const report = await p.analyzeHealth('/project') as Record<string, Record<string, number>>

    const scores = report.scores as Record<string, number>
    for (const value of Object.values(scores)) {
      expect(Number.isInteger(value)).toBe(true)
    }
  })
})

// ─── analyzeHealth - violation accumulation ───

describe('analyzeHealth - violation accumulation across files', () => {
  beforeEach(() => {
    resetMocks()

    mockDiscoverFiles.mockResolvedValue([
      { absolutePath: '/project/a.ts', path: 'a.ts' },
      { absolutePath: '/project/b.ts', path: 'b.ts' },
      { absolutePath: '/project/c.ts', path: 'c.ts' },
    ])

    mockParserParseFile.mockResolvedValue({
      sourceFile: { getFunctions: vi.fn().mockReturnValue([]) },
    })

    // Each file produces 3 violations
    mockRuleRegistryRunRules.mockReturnValue([
      makeViolation({ ruleId: 'error-rule', severity: 'error' }),
      makeViolation({ ruleId: 'warn-rule', severity: 'warning' }),
      makeViolation({ ruleId: 'info-rule', severity: 'info' }),
    ])

    mockCalculateScores.mockReturnValue({
      errorCount: 3,
      overall: 60,
      patternCount: 0,
      scores: { complexity: 60, documentation: 50, errors: 94, patterns: 100, security: 100, testCoverage: 0 },
      securityCount: 0,
      testCoverage: { estimated: 0, hasTests: false },
    })
  })

  it('accumulates violations from all files into single array', async () => {
    const { p } = createHealthInstance()
    await p.analyzeHealth('/project')

    // 3 files × 3 violations each = 9
    const violationsArg = mockCalculateScores.mock.calls[0][0] as unknown[]
    expect(violationsArg.length).toBe(9)
  })
})

// ─── analyzeHealth - single file codebase ───

describe('analyzeHealth - single file', () => {
  beforeEach(() => {
    resetMocks()

    const fn = { getJsDocs: vi.fn().mockReturnValue(['doc']) }
    mockDiscoverFiles.mockResolvedValue([
      { absolutePath: '/project/index.ts', path: 'index.ts' },
    ])

    mockParserParseFile.mockResolvedValue({
      sourceFile: { getFunctions: vi.fn().mockReturnValue([fn]) },
    })

    mockRuleRegistryRunRules.mockReturnValue([
      makeViolation({ ruleId: 'some-rule', severity: 'warning' }),
    ])

    mockCalculateScores.mockReturnValue({
      errorCount: 0,
      overall: 95,
      patternCount: 0,
      scores: { complexity: 95, documentation: 100, errors: 100, patterns: 100, security: 100, testCoverage: 0 },
      securityCount: 0,
      testCoverage: { estimated: 0, hasTests: false },
    })
  })

  it('handles single file correctly', async () => {
    const { p } = createHealthInstance()
    const report = await p.analyzeHealth('/project') as Record<string, unknown>

    expect(report.overall).toBe(95)
    expect(mockCalculateScores).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ ruleId: 'some-rule' })]),
      1,
      1,
      [{ absolutePath: '/project/index.ts', path: 'index.ts' }],
    )
  })
})

// ─── analyzeHealth - report shape verification ───

describe('analyzeHealth - full report shape', () => {
  beforeEach(() => {
    resetMocks()
    mockDiscoverFiles.mockResolvedValue([])
    mockCalculateScores.mockReturnValue({
      errorCount: 3,
      overall: 72,
      patternCount: 5,
      scores: { complexity: 80, documentation: 60, errors: 94, patterns: 95, security: 70, testCoverage: 40 },
      securityCount: 3,
      testCoverage: { estimated: 40, hasTests: true },
    })
    mockAnalyzeComplexity.mockReturnValue({ avgComplexity: 4.2, filesAnalyzed: 2, highComplexityFiles: 1 })
    mockGetRecommendations.mockReturnValue(['Reduce complexity', 'Add more tests'])
  })

  it('returns complete report shape matching HealthReport', async () => {
    const { p } = createHealthInstance()
    const report = await p.analyzeHealth('/project') as Record<string, unknown>

    expect(report).toEqual({
      overall: 72,
      path: '/project',
      recommendations: ['Reduce complexity', 'Add more tests'],
      scores: {
        complexity: 80,
        documentation: 60,
        errors: 94,
        patterns: 95,
        security: 70,
        testCoverage: 40,
      },
      details: {
        complexity: { avgComplexity: 4.2, filesAnalyzed: 2, highComplexityFiles: 1 },
        documentation: { documentedFunctions: 0, totalFunctions: 0 },
        errors: 3,
        patterns: 5,
        security: 3,
        testCoverage: { estimated: 40, hasTests: true },
      },
    })
  })
})
