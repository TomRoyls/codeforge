import { beforeEach, describe, expect, it, vi } from 'vitest'

import Complexity from '../../src/commands/complexity.js'

const {
  mockDiscoverFiles,
  mockParseExtensions,
  mockFilterFilesByExtension,
  mockAnalyzeFileComplexity,
  mockCalculateSummary,
} = vi.hoisted(() => ({
  mockDiscoverFiles: vi.fn().mockResolvedValue([]),
  mockParseExtensions: vi.fn().mockReturnValue([]),
  mockFilterFilesByExtension: vi.fn((files: unknown[]) => files),
  mockAnalyzeFileComplexity: vi.fn().mockReturnValue([]),
  mockCalculateSummary: vi.fn().mockReturnValue({
    averageCognitive: 0,
    averageCyclomatic: 0,
    categoryBreakdown: {},
    maxCognitive: 0,
    maxCyclomatic: 0,
    totalFunctions: 0,
  }),
}))

vi.mock('node:fs', () => ({
  existsSync: vi.fn().mockReturnValue(true),
}))

vi.mock('node:fs/promises', () => ({
  default: {
    writeFile: vi.fn().mockResolvedValue(undefined),
  },
  writeFile: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('ora', () => ({
  default: vi.fn(() => ({
    fail: vi.fn().mockReturnThis(),
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    text: '',
  })),
}))

vi.mock('../../src/core/file-discovery.js', () => ({
  discoverFiles: mockDiscoverFiles,
}))

vi.mock('../../src/core/parser.js', () => ({
  Parser: class MockParser {
    async initialize() {}
    async parseFile() {
      return { sourceFile: {} }
    }
    dispose() {}
  },
}))

vi.mock('../../src/core/complexity.js', () => ({
  analyzeFileComplexity: mockAnalyzeFileComplexity,
  calculateComplexitySummary: mockCalculateSummary,
}))

vi.mock('../../src/commands/complexity-helpers.js', () => ({
  filterFilesByExtension: mockFilterFilesByExtension,
  parseExtensions: mockParseExtensions,
}))

// ─── Helpers ───

interface ComplexityPrivate {
  log: (...args: unknown[]) => void
  run: () => Promise<void>
  error: (msg: string, opts?: { exit?: number }) => never
  parse: () => Promise<{ args: Record<string, unknown>; flags: Record<string, unknown> }>
}

function createComplexityInstance(): {
  command: Complexity
  p: ComplexityPrivate
  logs: string[]
} {
  const logs: string[] = []
  const command = new Complexity([], {} as never)
  const p = command as unknown as ComplexityPrivate
  p.log = (...args: unknown[]) => {
    logs.push(args.map(String).join(' '))
  }
  return { command, p, logs }
}

function makeFunction(overrides: Record<string, unknown> = {}) {
  return {
    category: 'moderate',
    cognitive: 2,
    cyclomatic: 3,
    filePath: 'src/test.ts',
    functionName: 'testFn',
    ...overrides,
  }
}

// ─── Static properties ───

describe('Complexity command static properties', () => {
  it('has correct description', () => {
    expect(Complexity.description).toBe(
      'Analyze and report cyclomatic and cognitive complexity metrics for TypeScript files',
    )
  })

  it('has path arg as optional string with default "."', () => {
    const pathArg = Complexity.args!.path as Record<string, unknown>
    expect(pathArg).toBeDefined()
    expect(pathArg.default).toBe('.')
    expect(pathArg.required).toBe(false)
  })

  it('has examples defined', () => {
    expect(Complexity.examples).toBeDefined()
    expect(Complexity.examples!.length).toBeGreaterThan(0)
  })

  it('defines at least 3 examples', () => {
    expect(Complexity.examples!.length).toBeGreaterThanOrEqual(3)
  })

  it('each example has command and description', () => {
    for (const example of Complexity.examples!) {
      expect(example).toHaveProperty('command')
      expect(example).toHaveProperty('description')
    }
  })
})

// ─── Flags ───

describe('Complexity flags', () => {
  it('has format flag with options json, markdown, table', () => {
    const formatFlag = Complexity.flags!.format as Record<string, unknown>
    expect(formatFlag).toBeDefined()
    expect(formatFlag.char).toBe('f')
    expect(formatFlag.default).toBe('table')
    expect(formatFlag.options).toEqual(['json', 'markdown', 'table'])
  })

  it('has threshold flag as integer defaulting to 0', () => {
    const thresholdFlag = Complexity.flags!.threshold as Record<string, unknown>
    expect(thresholdFlag).toBeDefined()
    expect(thresholdFlag.char).toBe('t')
    expect(thresholdFlag.default).toBe(0)
  })

  it('has top flag defaulting to 20', () => {
    const topFlag = Complexity.flags!.top as Record<string, unknown>
    expect(topFlag).toBeDefined()
    expect(topFlag.char).toBe('n')
    expect(topFlag.default).toBe(20)
  })

  it('has sort-by flag with correct options', () => {
    const sortByFlag = Complexity.flags!['sort-by'] as Record<string, unknown>
    expect(sortByFlag).toBeDefined()
    expect(sortByFlag.char).toBe('s')
    expect(sortByFlag.default).toBe('complexity')
    expect(sortByFlag.options).toEqual(['complexity', 'file', 'name'])
  })

  it('has ext flag with correct default', () => {
    const extFlag = Complexity.flags!.ext as Record<string, unknown>
    expect(extFlag).toBeDefined()
    expect(extFlag.default).toBe('')
  })

  it('has output flag', () => {
    const outputFlag = Complexity.flags!.output as Record<string, unknown>
    expect(outputFlag).toBeDefined()
    expect(outputFlag.char).toBe('o')
  })

  it('has ignore flag', () => {
    const ignoreFlag = Complexity.flags!.ignore as Record<string, unknown>
    expect(ignoreFlag).toBeDefined()
    expect(ignoreFlag.char).toBe('i')
  })
})

// ─── run() ───

describe('Complexity run', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDiscoverFiles.mockResolvedValue([])
    mockFilterFilesByExtension.mockImplementation((files: unknown[]) => files)
    mockParseExtensions.mockReturnValue([])
    mockAnalyzeFileComplexity.mockReturnValue([])
    mockCalculateSummary.mockReturnValue({
      averageCognitive: 0,
      averageCyclomatic: 0,
      categoryBreakdown: {},
      maxCognitive: 0,
      maxCyclomatic: 0,
      totalFunctions: 0,
    })
  })

  it('handles no discovered files gracefully', async () => {
    mockDiscoverFiles.mockResolvedValue([])
    const { p } = createComplexityInstance()
    vi.spyOn(p, 'parse').mockResolvedValue({
      args: { path: '.' },
      flags: { ext: '', format: 'table', 'sort-by': 'complexity', threshold: 0, top: 20 },
    })
    await p.run()
    expect(true).toBe(true)
  })

  it('handles empty complexity results from all files', async () => {
    mockDiscoverFiles.mockResolvedValue([
      { absolutePath: '/fake/file.ts' },
    ])
    mockAnalyzeFileComplexity.mockReturnValue([])
    const { p } = createComplexityInstance()
    vi.spyOn(p, 'parse').mockResolvedValue({
      args: { path: '.' },
      flags: { ext: '', format: 'table', 'sort-by': 'complexity', threshold: 0, top: 20 },
    })
    await p.run()
    expect(true).toBe(true)
  })

  it('handles errors when path does not exist', async () => {
    const { existsSync } = await import('node:fs')
    vi.mocked(existsSync).mockReturnValue(false)
    const { p } = createComplexityInstance()
    vi.spyOn(p, 'error').mockImplementation((msg: string) => {
      throw new Error(String(msg))
    })
    vi.spyOn(p, 'parse').mockResolvedValue({
      args: { path: '/nonexistent' },
      flags: { ext: '', format: 'table', 'sort-by': 'complexity', threshold: 0, top: 20 },
    })
    await expect(p.run()).rejects.toThrow('Path not found')
  })
})

// ─── Static metadata ───

describe('Complexity static metadata', () => {
  it('has correct number of flags', () => {
    const flagKeys = Object.keys(Complexity.flags!)
    expect(flagKeys.length).toBeGreaterThanOrEqual(6)
  })

  it('flags include all expected keys', () => {
    const flagKeys = Object.keys(Complexity.flags!)
    expect(flagKeys).toContain('ext')
    expect(flagKeys).toContain('format')
    expect(flagKeys).toContain('output')
    expect(flagKeys).toContain('sort-by')
    expect(flagKeys).toContain('threshold')
    expect(flagKeys).toContain('top')
  })
})
