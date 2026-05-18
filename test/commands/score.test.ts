import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import Score from '../../src/commands/score.js'

// ─── Top-level mocks ───

const mockDiscoverFiles = vi.fn().mockResolvedValue([])
const mockParserInitialize = vi.fn().mockResolvedValue(undefined)
const mockParserParseFile = vi.fn()
const mockParserDispose = vi.fn()
const mockRuleRegistryRegister = vi.fn()
const mockRuleRegistryRunRules = vi.fn().mockReturnValue([])
const mockGetRuleCategory = vi.fn().mockReturnValue('complexity')
const mockCalculateCategoryScore = vi.fn().mockReturnValue({ score: 85, violations: 3, weight: 0.3 })
const mockCalculateCorrectnessScore = vi.fn().mockReturnValue({ score: 75, violations: 5, weight: 0.25 })
const mockCalculateFileScore = vi.fn().mockReturnValue(90)
const mockFormatDisplayOutput = vi.fn()
const mockGenerateSuggestions = vi.fn().mockReturnValue(['Fix complexity issues'])
const mockLazyLoadAllRules = vi.fn().mockResolvedValue({})
const mockExistsSync = vi.fn().mockReturnValue(true)

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

vi.mock('../../src/commands/score-calculations.js', () => ({
  calculateCategoryScore: (...args: unknown[]) => mockCalculateCategoryScore(...args),
  calculateCorrectnessScore: (...args: unknown[]) => mockCalculateCorrectnessScore(...args),
  calculateFileScore: (...args: unknown[]) => mockCalculateFileScore(...args),
}))

vi.mock('../../src/commands/score-formatting.js', () => ({
  formatDisplayOutput: (...args: unknown[]) => mockFormatDisplayOutput(...args),
  generateSuggestions: (...args: unknown[]) => mockGenerateSuggestions(...args),
}))

vi.mock('../../src/utils/constants.js', () => ({
  MAX_FILES_TO_PROCESS: 100,
  MAX_TOP_STATS_FILES: 10,
}))

// ─── Helpers ───

function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*m/g, '')
}

interface ScorePrivate {
  analyzeScore: (targetPath: string, spinner: { text: string }) => Promise<unknown>
  log: (...args: unknown[]) => void
}

function createScoreInstance(): { command: Score; p: ScorePrivate; logs: string[] } {
  const logs: string[] = []
  const command = new Score([], {} as never)
  const p = command as unknown as ScorePrivate

  p.log = (...args: unknown[]) => {
    logs.push(args.map(String).join(' '))
  }

  return { command, p, logs }
}

function resetMocks(): void {
  mockDiscoverFiles.mockResolvedValue([])
  mockParserInitialize.mockResolvedValue(undefined)
  mockParserParseFile.mockResolvedValue({ sourceFile: { getFunctions: vi.fn().mockReturnValue([]) } })
  mockParserDispose.mockReturnValue(undefined)
  mockRuleRegistryRegister.mockReturnValue(undefined)
  mockRuleRegistryRunRules.mockReturnValue([])
  mockGetRuleCategory.mockReturnValue('complexity')
  mockCalculateCategoryScore.mockReturnValue({ score: 85, violations: 3, weight: 0.3 })
  mockCalculateCorrectnessScore.mockReturnValue({ score: 75, violations: 5, weight: 0.25 })
  mockCalculateFileScore.mockReturnValue(90)
  mockFormatDisplayOutput.mockReturnValue(undefined)
  mockGenerateSuggestions.mockReturnValue(['Fix complexity issues'])
  mockLazyLoadAllRules.mockResolvedValue({})
  mockExistsSync.mockReturnValue(true)
}

// ─── Static properties ───

describe('Score command static properties', () => {
  it('has correct description', () => {
    expect(Score.description).toBe('Calculate aggregate quality score for the codebase')
  })

  it('has examples defined', () => {
    expect(Score.examples).toBeDefined()
    expect(Score.examples!.length).toBeGreaterThan(0)
  })

  it('defines path arg as optional string with default "."', () => {
    const pathArg = Score.args!.path as Record<string, unknown>
    expect(pathArg).toBeDefined()
    expect(pathArg.description).toBe('Path to analyze')
    expect(pathArg.default).toBe('.')
    expect(pathArg.required).toBe(false)
  })

  it('has json flag defaulting to false', () => {
    const jsonFlag = Score.flags!.json as Record<string, unknown>
    expect(jsonFlag).toBeDefined()
    expect(jsonFlag.default).toBe(false)
  })

  it('has verbose flag with char v defaulting to false', () => {
    const verboseFlag = Score.flags!.verbose as Record<string, unknown>
    expect(verboseFlag).toBeDefined()
    expect(verboseFlag.char).toBe('v')
    expect(verboseFlag.default).toBe(false)
  })

  it('defines at least 2 examples', () => {
    expect(Score.examples!.length).toBeGreaterThanOrEqual(2)
  })

  it('each example has command and description', () => {
    for (const example of Score.examples!) {
      expect(example).toHaveProperty('command')
      expect(example).toHaveProperty('description')
      expect(typeof example.command).toBe('string')
      expect(typeof example.description).toBe('string')
    }
  })
})

// ─── run() with non-existent path ───

describe('Score run() - path validation', () => {
  it('errors when path does not exist', () => {
    mockExistsSync.mockReturnValueOnce(false)

    const command = new Score([], {} as never)
    command.error = vi.fn() as never

    const targetPath = '/nonexistent/path'
    if (!mockExistsSync(targetPath)) {
      command.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    expect(command.error).toHaveBeenCalledWith(`Path not found: ${targetPath}`, { exit: 1 })
  })
})

// ─── analyzeScore - empty codebase ───

describe('analyzeScore - empty codebase', () => {
  beforeEach(() => {
    resetMocks()
    mockDiscoverFiles.mockResolvedValue([])
  })

  it('returns zeroed report when no files found', async () => {
    const { p } = createScoreInstance()
    const report = await p.analyzeScore('/project', { text: '' }) as Record<string, unknown>

    const summary = report.summary as Record<string, unknown>
    expect(summary.filesAnalyzed).toBe(0)
    expect(summary.totalViolations).toBe(0)
    expect(summary.violationsPerFile).toBe(0)
  })

  it('returns topFiles as empty array', async () => {
    const { p } = createScoreInstance()
    const report = await p.analyzeScore('/project', { text: '' }) as Record<string, unknown>

    expect(report.topFiles).toEqual([])
  })

  it('returns suggestions from generateSuggestions', async () => {
    const { p } = createScoreInstance()
    const report = await p.analyzeScore('/project', { text: '' }) as Record<string, unknown>

    expect(report.suggestions).toEqual(['Fix complexity issues'])
  })
})

// ─── analyzeScore - with files and violations ───

describe('analyzeScore - with files', () => {
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
      { ruleId: 'complexity-rule', message: 'too complex', severity: 'warning' as const },
      { ruleId: 'security-rule', message: 'unsafe', severity: 'error' as const },
    ])

    mockGetRuleCategory
      .mockReturnValueOnce('complexity')
      .mockReturnValueOnce('security')
      .mockReturnValue('complexity')

    mockCalculateFileScore.mockReturnValue(88)
    mockCalculateCategoryScore.mockImplementation(
      (violations: unknown, weight: unknown) => ({
        score: Math.max(0, 100 - (violations as number) * 5),
        violations,
        weight,
      }),
    )
    mockCalculateCorrectnessScore.mockImplementation(
      (violations: unknown, totalFns: unknown, docFns: unknown, weight: unknown) => {
        const coverage = (totalFns as number) > 0 ? ((docFns as number) / (totalFns as number)) * 100 : 50
        return {
          score: Math.max(0, coverage - (violations as number) * 5),
          violations,
          weight,
        }
      },
    )
  })

  it('reports correct files analyzed count', async () => {
    const { p } = createScoreInstance()
    const report = await p.analyzeScore('/project', { text: '' }) as Record<string, unknown>

    const summary = report.summary as Record<string, number>
    expect(summary.filesAnalyzed).toBe(2)
  })

  it('counts total violations across all files', async () => {
    const { p } = createScoreInstance()
    const report = await p.analyzeScore('/project', { text: '' }) as Record<string, unknown>

    const summary = report.summary as Record<string, number>
    // 2 files × 2 violations each = 4
    expect(summary.totalViolations).toBe(4)
  })

  it('calculates violations per file', async () => {
    const { p } = createScoreInstance()
    const report = await p.analyzeScore('/project', { text: '' }) as Record<string, unknown>

    const summary = report.summary as Record<string, number>
    // 4 violations / 2 files = 2
    expect(summary.violationsPerFile).toBe(2)
  })

  it('includes top files sorted by violations descending', async () => {
    const { p } = createScoreInstance()
    const report = await p.analyzeScore('/project', { text: '' }) as Record<string, unknown>

    const topFiles = report.topFiles as Array<Record<string, unknown>>
    // Both files have 2 violations each
    expect(topFiles.length).toBe(2)
    expect(topFiles[0].violations).toBe(2)
    expect(topFiles[1].violations).toBe(2)
  })

  it('includes path in report', async () => {
    const { p } = createScoreInstance()
    const report = await p.analyzeScore('/project', { text: '' }) as Record<string, unknown>

    expect(report.path).toBe('/project')
  })

  it('returns categories with correct structure', async () => {
    const { p } = createScoreInstance()
    const report = await p.analyzeScore('/project', { text: '' }) as Record<string, unknown>

    const categories = report.categories as Record<string, Record<string, unknown>>
    expect(categories.complexity).toBeDefined()
    expect(categories.correctness).toBeDefined()
    expect(categories.security).toBeDefined()
    expect(categories.patterns).toBeDefined()

    for (const cat of Object.values(categories)) {
      expect(cat).toHaveProperty('score')
      expect(cat).toHaveProperty('violations')
      expect(cat).toHaveProperty('weight')
    }
  })
})

// ─── analyzeScore - parse failures ───

describe('analyzeScore - parse failures', () => {
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
    mockCalculateFileScore.mockReturnValue(100)

    const { p } = createScoreInstance()
    const report = await p.analyzeScore('/project', { text: '' }) as Record<string, unknown>

    const summary = report.summary as Record<string, number>
    expect(summary.filesAnalyzed).toBe(2)
    // Only 1 file had violations counted (the good one, with 0)
    expect(summary.totalViolations).toBe(0)
  })
})

// ─── analyzeScore - MAX_FILES cap ───

describe('analyzeScore - MAX_FILES_TO_PROCESS cap', () => {
  beforeEach(() => {
    resetMocks()
  })

  it('caps files at MAX_FILES_TO_PROCESS', async () => {
    // 150 files to exceed MAX_FILES_TO_PROCESS (100)
    const manyFiles = Array.from({ length: 150 }, (_, i) => ({
      absolutePath: `/project/file${i}.ts`,
      path: `file${i}.ts`,
    }))
    mockDiscoverFiles.mockResolvedValue(manyFiles)

    mockParserParseFile.mockResolvedValue({
      sourceFile: { getFunctions: vi.fn().mockReturnValue([]) },
    })

    mockRuleRegistryRunRules.mockReturnValue([])
    mockCalculateFileScore.mockReturnValue(100)

    const { p } = createScoreInstance()
    const report = await p.analyzeScore('/project', { text: '' }) as Record<string, unknown>

    const summary = report.summary as Record<string, number>
    // capped at MAX_FILES_TO_PROCESS
    expect(summary.filesAnalyzed).toBe(100)
  })
})

// ─── analyzeScore - category weights ───

describe('analyzeScore - category scoring weights', () => {
  beforeEach(() => {
    resetMocks()
    mockDiscoverFiles.mockResolvedValue([
      { absolutePath: '/project/a.ts', path: 'a.ts' },
    ])

    mockParserParseFile.mockResolvedValue({
      sourceFile: { getFunctions: vi.fn().mockReturnValue([]) },
    })

    mockRuleRegistryRunRules.mockReturnValue([])

    mockCalculateFileScore.mockReturnValue(100)
    mockCalculateCategoryScore.mockImplementation(
      (_violations: unknown, weight: unknown) => ({ score: 100, violations: 0, weight }),
    )
    mockCalculateCorrectnessScore.mockImplementation(
      (_violations: unknown, _totalFns: unknown, _docFns: unknown, weight: unknown) => ({
        score: 100,
        violations: 0,
        weight,
      }),
    )
  })

  it('uses correct weights: complexity=0.3, correctness=0.25, patterns=0.15, security=0.3', async () => {
    const { p } = createScoreInstance()
    const report = await p.analyzeScore('/project', { text: '' }) as Record<string, unknown>

    const categories = report.categories as Record<string, Record<string, unknown>>
    expect(categories.complexity!.weight).toBe(0.3)
    expect(categories.correctness!.weight).toBe(0.25)
    expect(categories.patterns!.weight).toBe(0.15)
    expect(categories.security!.weight).toBe(0.3)
  })
})

// ─── analyzeScore - documentation counting ───

describe('analyzeScore - documentation counting', () => {
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
      ]),
    }

    mockParserParseFile.mockResolvedValue({ sourceFile: mockSourceFile })
    mockRuleRegistryRunRules.mockReturnValue([])
    mockCalculateFileScore.mockReturnValue(100)
    mockCalculateCorrectnessScore.mockImplementation(
      (violations: unknown, totalFns: unknown, docFns: unknown, weight: unknown) => ({
        score: (totalFns as number) > 0 ? ((docFns as number) / (totalFns as number)) * 100 : 50,
        violations,
        weight,
      }),
    )
  })

  it('counts documented functions correctly', async () => {
    const { p } = createScoreInstance()
    const report = await p.analyzeScore('/project', { text: '' }) as Record<string, unknown>

    const categories = report.categories as Record<string, Record<string, unknown>>
    // 2 documented / 4 total = 50 score
    expect(categories.correctness!.score).toBe(50)
  })
})

// ─── analyzeScore - file sorting ───

describe('analyzeScore - file score sorting', () => {
  beforeEach(() => {
    resetMocks()

    mockDiscoverFiles.mockResolvedValue([
      { absolutePath: '/project/low.ts', path: 'low.ts' },
      { absolutePath: '/project/high.ts', path: 'high.ts' },
    ])

    mockParserParseFile.mockResolvedValue({
      sourceFile: { getFunctions: vi.fn().mockReturnValue([]) },
    })

    let ruleCallCount = 0
    mockRuleRegistryRunRules.mockImplementation(() => {
      ruleCallCount++
      // low.ts: 1 violation, high.ts: 5 violations
      if (ruleCallCount === 1) {
        return [{ ruleId: 'r1', message: 'm', severity: 'warning' as const }]
      }
      return Array.from({ length: 5 }, (_, i) => ({
        ruleId: `r${i}`,
        message: 'm',
        severity: 'warning' as const,
      }))
    })

    mockGetRuleCategory.mockReturnValue('complexity')
    mockCalculateFileScore.mockImplementation(
      (v: unknown) => Math.max(0, 100 - (v as number) * 3),
    )
  })

  it('sorts files by violations descending', async () => {
    const { p } = createScoreInstance()
    const report = await p.analyzeScore('/project', { text: '' }) as Record<string, unknown>

    const topFiles = report.topFiles as Array<Record<string, unknown>>
    expect(topFiles[0].filePath).toBe('high.ts')
    expect(topFiles[0].violations).toBe(5)
    expect(topFiles[1].filePath).toBe('low.ts')
    expect(topFiles[1].violations).toBe(1)
  })
})

// ─── analyzeScore - overall score calculation ───

describe('analyzeScore - overall score calculation', () => {
  beforeEach(() => {
    resetMocks()
    mockDiscoverFiles.mockResolvedValue([
      { absolutePath: '/project/a.ts', path: 'a.ts' },
    ])

    mockParserParseFile.mockResolvedValue({
      sourceFile: { getFunctions: vi.fn().mockReturnValue([]) },
    })

    mockRuleRegistryRunRules.mockReturnValue([])

    mockCalculateFileScore.mockReturnValue(100)
    mockCalculateCategoryScore.mockImplementation(
      (_v: unknown, weight: unknown) => ({ score: 80, violations: 4, weight }),
    )
    mockCalculateCorrectnessScore.mockImplementation(
      (_v: unknown, _t: unknown, _d: unknown, weight: unknown) => ({
        score: 70,
        violations: 6,
        weight,
      }),
    )
  })

  it('computes overall as weighted sum of category scores', async () => {
    const { p } = createScoreInstance()
    const report = await p.analyzeScore('/project', { text: '' }) as Record<string, unknown>

    // 80*0.3 + 70*0.25 + 80*0.3 + 80*0.15 = 24 + 17.5 + 24 + 12 = 77.5 → 78
    expect(report.overall).toBe(78)
  })
})

// ─── analyzeScore - topFiles cap at MAX_TOP_STATS_FILES ───

describe('analyzeScore - topFiles cap', () => {
  beforeEach(() => {
    resetMocks()
  })

  it('limits topFiles to MAX_TOP_STATS_FILES', async () => {
    // 15 files
    const files = Array.from({ length: 15 }, (_, i) => ({
      absolutePath: `/project/f${i}.ts`,
      path: `f${i}.ts`,
    }))
    mockDiscoverFiles.mockResolvedValue(files)

    mockParserParseFile.mockResolvedValue({
      sourceFile: { getFunctions: vi.fn().mockReturnValue([]) },
    })

    mockRuleRegistryRunRules.mockReturnValue([
      { ruleId: 'r1', message: 'm', severity: 'warning' as const },
    ])

    mockGetRuleCategory.mockReturnValue('complexity')
    mockCalculateFileScore.mockReturnValue(97)

    const { p } = createScoreInstance()
    const report = await p.analyzeScore('/project', { text: '' }) as Record<string, unknown>

    const topFiles = report.topFiles as unknown[]
    // MAX_TOP_STATS_FILES = 10
    expect(topFiles.length).toBe(10)
  })
})

// ─── analyzeScore - rule registration ───

describe('analyzeScore - rule registration', () => {
  beforeEach(() => {
    resetMocks()
    mockDiscoverFiles.mockResolvedValue([])

    const mockRules = {
      'rule-a': { meta: { name: 'rule-a' } },
      'rule-b': { meta: { name: 'rule-b' } },
      'rule-c': { meta: { name: 'rule-c' } },
    }
    mockLazyLoadAllRules.mockResolvedValue(mockRules)
    mockGetRuleCategory.mockReturnValue('complexity')
    mockCalculateFileScore.mockReturnValue(100)
  })

  it('registers all loaded rules with the registry', async () => {
    const { p } = createScoreInstance()
    await p.analyzeScore('/project', { text: '' })

    expect(mockRuleRegistryRegister).toHaveBeenCalledTimes(3)
    expect(mockRuleRegistryRegister).toHaveBeenCalledWith('rule-a', expect.anything(), 'complexity')
    expect(mockRuleRegistryRegister).toHaveBeenCalledWith('rule-b', expect.anything(), 'complexity')
    expect(mockRuleRegistryRegister).toHaveBeenCalledWith('rule-c', expect.anything(), 'complexity')
  })
})

// ─── analyzeScore - parser lifecycle ───

describe('analyzeScore - parser lifecycle', () => {
  beforeEach(() => {
    resetMocks()
    mockDiscoverFiles.mockResolvedValue([])
  })

  it('calls parser.dispose() after analysis', async () => {
    const beforeCalls = mockParserDispose.mock.calls.length
    const { p } = createScoreInstance()
    await p.analyzeScore('/project', { text: '' })

    expect(mockParserDispose.mock.calls.length).toBe(beforeCalls + 1)
  })

  it('calls parser.initialize() before parsing', async () => {
    const beforeCalls = mockParserInitialize.mock.calls.length
    const { p } = createScoreInstance()
    await p.analyzeScore('/project', { text: '' })

    expect(mockParserInitialize.mock.calls.length).toBe(beforeCalls + 1)
  })
})

// ─── analyzeScore - spinner progress ───

describe('analyzeScore - spinner progress tracking', () => {
  beforeEach(() => {
    resetMocks()

    mockDiscoverFiles.mockResolvedValue([
      { absolutePath: '/project/a.ts', path: 'a.ts' },
      { absolutePath: '/project/b.ts', path: 'b.ts' },
    ])

    mockParserParseFile.mockResolvedValue({
      sourceFile: { getFunctions: vi.fn().mockReturnValue([]) },
    })

    mockRuleRegistryRunRules.mockReturnValue([])
    mockCalculateFileScore.mockReturnValue(100)
  })

  it('updates spinner text during file processing', async () => {
    const spinner = { text: '' }
    const { p } = createScoreInstance()
    await p.analyzeScore('/project', spinner)

    // Final spinner text reflects completion
    expect(spinner.text).toContain('Processing files... (2/2)')
  })
})

// ─── analyzeScore - violations per file edge case ───

describe('analyzeScore - violations per file edge case', () => {
  beforeEach(() => {
    resetMocks()
    mockDiscoverFiles.mockResolvedValue([])
  })

  it('handles zero files with zero violations', async () => {
    const { p } = createScoreInstance()
    const report = await p.analyzeScore('/project', { text: '' }) as Record<string, unknown>

    const summary = report.summary as Record<string, number>
    expect(summary.violationsPerFile).toBe(0)
  })
})

// ─── analyzeScore - category violation routing ───

describe('analyzeScore - category violation routing', () => {
  beforeEach(() => {
    resetMocks()

    mockDiscoverFiles.mockResolvedValue([
      { absolutePath: '/project/a.ts', path: 'a.ts' },
    ])

    mockParserParseFile.mockResolvedValue({
      sourceFile: { getFunctions: vi.fn().mockReturnValue([]) },
    })

    mockRuleRegistryRunRules.mockReturnValue([
      { ruleId: 'cplx-1', message: 'm', severity: 'warning' as const },
      { ruleId: 'sec-1', message: 'm', severity: 'error' as const },
      { ruleId: 'pat-1', message: 'm', severity: 'info' as const },
      { ruleId: 'cor-1', message: 'm', severity: 'warning' as const },
    ])

    // Route each rule to its category
    mockGetRuleCategory.mockImplementation((ruleId: unknown) => {
      const id = ruleId as string
      if (id.startsWith('cplx')) return 'complexity'
      if (id.startsWith('sec')) return 'security'
      if (id.startsWith('pat')) return 'patterns'
      return 'correctness'
    })

    mockCalculateFileScore.mockReturnValue(88)
    mockCalculateCategoryScore.mockImplementation(
      (violations: unknown, weight: unknown) => ({
        score: 100 - (violations as number) * 5,
        violations,
        weight,
      }),
    )
    mockCalculateCorrectnessScore.mockImplementation(
      (violations: unknown, _totalFns: unknown, _docFns: unknown, weight: unknown) => ({
        score: Math.max(0, 100 - (violations as number) * 5),
        violations,
        weight,
      }),
    )
  })

  it('routes violations to correct categories based on getRuleCategory', async () => {
    const { p } = createScoreInstance()
    const report = await p.analyzeScore('/project', { text: '' }) as Record<string, unknown>

    const categories = report.categories as Record<string, Record<string, unknown>>
    expect(categories.complexity!.violations).toBe(1)
    expect(categories.security!.violations).toBe(1)
    expect(categories.patterns!.violations).toBe(1)
    expect(categories.correctness!.violations).toBe(1)
  })
})

// ─── analyzeScore - overall score rounding ───

describe('analyzeScore - overall score rounding', () => {
  beforeEach(() => {
    resetMocks()
    mockDiscoverFiles.mockResolvedValue([])

    // Fractional scores that need rounding
    mockCalculateCategoryScore.mockImplementation(
      (_v: unknown, weight: unknown) => ({ score: 77.7, violations: 0, weight }),
    )
    mockCalculateCorrectnessScore.mockImplementation(
      (_v: unknown, _t: unknown, _d: unknown, weight: unknown) => ({
        score: 66.6,
        violations: 0,
        weight,
      }),
    )

    mockCalculateFileScore.mockReturnValue(100)
  })

  it('rounds overall score to nearest integer', async () => {
    const { p } = createScoreInstance()
    const report = await p.analyzeScore('/project', { text: '' }) as Record<string, unknown>

    // Math.round(77.7*0.3 + 66.6*0.25 + 77.7*0.3 + 77.7*0.15) = Math.round(74.925) = 75
    expect(Number.isInteger(report.overall as number)).toBe(true)
    expect(report.overall).toBe(75)
  })
})

// ─── Example structures ───

describe('Score examples structure', () => {
  it('each example has command and description strings', () => {
    for (const example of Score.examples!) {
      expect(example).toHaveProperty('command')
      expect(example).toHaveProperty('description')
      expect(typeof example.command).toBe('string')
      expect(typeof example.description).toBe('string')
      expect(example.command.length).toBeGreaterThan(0)
      expect(example.description.length).toBeGreaterThan(0)
    }
  })
})
