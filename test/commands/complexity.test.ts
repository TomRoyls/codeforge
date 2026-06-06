import { beforeEach, describe, expect, it, vi } from 'vitest'

import Complexity from '../../src/commands/complexity.js'

// ─── Top-level mocks ───

const mockDiscoverFiles = vi.fn().mockResolvedValue([])
const mockExistsSync = vi.fn().mockReturnValue(true)
const mockReadFile = vi.fn().mockResolvedValue('')
const mockWriteFile = vi.fn().mockResolvedValue(undefined)

const mockAnalyzeFileComplexity = vi.fn()
const mockBuildComplexityResult = vi.fn()
const mockBuildIgnorePatterns = vi.fn(
  (defaults: string[], custom?: string[]) => [...defaults, ...(custom ?? [])],
)
const mockFilterByThreshold = vi.fn()
const mockFilterFilesByExtension = vi.fn(
  <T extends { path: string }>(files: T[], exts: string[] | null): T[] => {
    if (!exts || exts.length === 0) return files
    const lowerExts = exts.map((e) => e.toLowerCase())
    return files.filter((f) => {
      const basename = f.path.split('/').pop() ?? f.path
      if (basename.startsWith('.') && !basename.slice(1).includes('.')) return false
      const ext = basename.match(/\.[^.]+$/)?.[0]?.toLowerCase() ?? ''
      return lowerExts.includes(ext)
    })
  },
)
const mockLimitResults = vi.fn(<T>(items: T[], _limit: number): T[] => items)
const mockBuildJsonOutput = vi.fn((): string => '{}')
const mockFormatOutput = vi.fn((): string => 'formatted output')
const mockParseExtensions = vi.fn(
  (input: string): string[] =>
    input
      .split(',')
      .map((e) => e.trim())
      .filter((e) => e.length > 0),
)
const mockSortByField = vi.fn(
  <T extends { name?: string; filePath: string; complexity?: number }>(
    items: T[],
    field: string,
  ): T[] => {
    const sorted = [...items]
    switch (field) {
      case 'complexity':
        sorted.sort((a, b) => (b.complexity ?? 0) - (a.complexity ?? 0))
        break
      case 'file':
        sorted.sort((a, b) => a.filePath.localeCompare(b.filePath))
        break
      case 'name':
      default:
        sorted.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
        break
    }
    return sorted
  },
)
const mockTakeTop = vi.fn()

const mockFormatComplexityJson = vi.fn().mockReturnValue('{}')
const mockFormatComplexityCsv = vi.fn().mockReturnValue('')
const mockFormatComplexityTable = vi.fn().mockReturnValue('')

vi.mock('node:fs', () => ({
  existsSync: (...args: unknown[]) => mockExistsSync(...args),
}))

vi.mock('node:fs/promises', () => ({
  readFile: (...args: unknown[]) => mockReadFile(...args),
  writeFile: (...args: unknown[]) => mockWriteFile(...args),
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

vi.mock('../../src/core/file-discovery.js', () => ({
  discoverFiles: (...args: unknown[]) => mockDiscoverFiles(...args),
}))

vi.mock('../../src/commands/complexity-helpers.js', () => ({
  analyzeFileComplexity: (...args: unknown[]) => mockAnalyzeFileComplexity(...args),
  buildComplexityResult: (...args: unknown[]) => mockBuildComplexityResult(...args),
  buildIgnorePatterns: (...args: unknown[]) => mockBuildIgnorePatterns(...args),
  buildJsonOutput: (...args: unknown[]) => mockBuildJsonOutput(...args),
  filterByThreshold: (...args: unknown[]) => mockFilterByThreshold(...args),
  filterFilesByExtension: (...args: unknown[]) => mockFilterFilesByExtension(...args),
  formatOutput: (...args: unknown[]) => mockFormatOutput(...args),
  limitResults: (...args: unknown[]) => mockLimitResults(...args),
  parseExtensions: (...args: unknown[]) => mockParseExtensions(...args),
  sortByField: (...args: unknown[]) => mockSortByField(...args),
  takeTop: (...args: unknown[]) => mockTakeTop(...args),
}))

vi.mock('../../src/commands/complexity-format-helpers.js', () => ({
  formatComplexityJson: (...args: unknown[]) => mockFormatComplexityJson(...args),
  formatComplexityCsv: (...args: unknown[]) => mockFormatComplexityCsv(...args),
  formatComplexityTable: (...args: unknown[]) => mockFormatComplexityTable(...args),
}))

// ─── Helpers ───

interface FunctionInfo {
  name: string
  filePath: string
  startLine: number
  endLine: number
  complexity: number
  params: number
  linesOfCode: number
  riskLevel: 'high' | 'low' | 'medium' | 'very-high'
}

interface FileComplexity {
  filePath: string
  relativePath: string
  functions: FunctionInfo[]
  totalComplexity: number
  averageComplexity: number
  maxComplexity: number
}

interface ComplexityResult {
  files: FileComplexity[]
  functions: FunctionInfo[]
  totalFunctions: number
  totalComplexity: number
  averageComplexity: number
  byRiskLevel: { level: string; count: number }[]
  byFile: { file: string; complexity: number; functions: number }[]
}

interface ParsedFlags {
  ext: string
  format: string
  ignore: string[] | undefined
  output: string | undefined
  sort: string
  threshold: number
  top: number
  verbose: boolean
}

interface ParsedArgs {
  path: string
}

interface CreateInstanceOptions {
  flags?: Partial<ParsedFlags>
  path?: string
}

const DEFAULT_IGNORE = [
  '**/node_modules/**',
  '**/dist/**',
  '**/coverage/**',
  '**/.git/**',
]

function createInstance(options: CreateInstanceOptions = {}): {
  command: Complexity
  logs: string[]
} {
  const logs: string[] = []
  const command = new Complexity([], {} as never)

  const defaultFlags: ParsedFlags = {
    ext: '.ts,.tsx,.js,.jsx',
    format: 'table',
    ignore: undefined,
    output: undefined,
    sort: 'complexity',
    threshold: 1,
    top: 0,
    verbose: false,
  }

  const mergedFlags: ParsedFlags = { ...defaultFlags, ...options.flags }
  const parsedArgs: ParsedArgs = { path: options.path ?? '.' }

  // Stub this.parse to avoid oclif's full machinery
  command.parse = vi.fn().mockResolvedValue({
    args: parsedArgs,
    flags: mergedFlags,
  })

  command.log = (...args: unknown[]) => {
    logs.push(args.map(String).join(' '))
  }

  return { command, logs }
}

function makeFile(path: string, absPath?: string) {
  return { absolutePath: absPath ?? `/project/${path}`, path }
}

function makeFunction(overrides: Partial<FunctionInfo> = {}): FunctionInfo {
  return {
    name: overrides.name ?? 'myFunc',
    filePath: overrides.filePath ?? 'src/app.ts',
    startLine: overrides.startLine ?? 10,
    endLine: overrides.endLine ?? 15,
    complexity: overrides.complexity ?? 5,
    params: overrides.params ?? 2,
    linesOfCode: overrides.linesOfCode ?? 6,
    riskLevel: overrides.riskLevel ?? 'low',
  }
}

function makeFileComplexity(overrides: Partial<FileComplexity> & { functions?: FunctionInfo[] } = {}): FileComplexity {
  const functions = overrides.functions ?? [makeFunction()]
  const filePath = overrides.filePath ?? 'src/app.ts'
  const total = functions.reduce((s, f) => s + f.complexity, 0)
  return {
    filePath,
    relativePath: overrides.relativePath ?? filePath,
    functions,
    totalComplexity: overrides.totalComplexity ?? total,
    averageComplexity: overrides.averageComplexity ?? (functions.length > 0 ? total / functions.length : 0),
    maxComplexity: overrides.maxComplexity ?? (functions.length > 0 ? Math.max(...functions.map((f) => f.complexity)) : 0),
  }
}

function makeComplexityResult(overrides: Partial<ComplexityResult> = {}): ComplexityResult {
  const functions = overrides.functions ?? []
  return {
    files: overrides.files ?? [],
    functions,
    totalFunctions: overrides.totalFunctions ?? functions.length,
    totalComplexity: overrides.totalComplexity ?? 0,
    averageComplexity: overrides.averageComplexity ?? 0,
    byRiskLevel: overrides.byRiskLevel ?? [],
    byFile: overrides.byFile ?? [],
  }
}

function resetMocks(): void {
  vi.clearAllMocks()

  mockExistsSync.mockReturnValue(true)
  mockDiscoverFiles.mockResolvedValue([])
  mockReadFile.mockResolvedValue('')
  mockWriteFile.mockResolvedValue(undefined)
  mockAnalyzeFileComplexity.mockReturnValue(makeFileComplexity({ functions: [] }))
  mockBuildComplexityResult.mockReturnValue(makeComplexityResult({ functions: [] }))
  mockFilterByThreshold.mockImplementation((items: unknown[]) => items)
  mockTakeTop.mockImplementation((items: unknown[]) => items)

  mockBuildIgnorePatterns.mockImplementation(
    (defaults: string[], custom?: string[]) => [...defaults, ...(custom ?? [])],
  )
  mockParseExtensions.mockImplementation(
    (input: string): string[] =>
      input
        .split(',')
        .map((e) => e.trim())
        .filter((e) => e.length > 0),
  )
  mockFilterFilesByExtension.mockImplementation(
    <T extends { path: string }>(files: T[], exts: string[] | null): T[] => {
      if (!exts || exts.length === 0) return files
      const lowerExts = exts.map((e) => e.toLowerCase())
      return files.filter((f) => {
        const basename = f.path.split('/').pop() ?? f.path
        if (basename.startsWith('.') && !basename.slice(1).includes('.')) return false
        const ext = basename.match(/\.[^.]+$/)?.[0]?.toLowerCase() ?? ''
        return lowerExts.includes(ext)
      })
    },
  )
  mockSortByField.mockImplementation(
    <T extends { name?: string; filePath: string; complexity?: number }>(
      items: T[],
      field: string,
    ): T[] => {
      const sorted = [...items]
      switch (field) {
        case 'complexity':
          sorted.sort((a, b) => (b.complexity ?? 0) - (a.complexity ?? 0))
          break
        case 'file':
          sorted.sort((a, b) => a.filePath.localeCompare(b.filePath))
          break
        case 'name':
        default:
          sorted.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
          break
      }
      return sorted
    },
  )
  mockLimitResults.mockImplementation(<T>(items: T[], _limit: number): T[] => items)
  mockBuildJsonOutput.mockReturnValue('{}')
  mockFormatOutput.mockReturnValue('formatted output')

  mockFormatComplexityJson.mockReturnValue('{}')
  mockFormatComplexityCsv.mockReturnValue('')
  mockFormatComplexityTable.mockReturnValue('')
}

// ─── Static properties ───

describe('Complexity command static properties', () => {
  it('has correct description mentioning complexity', () => {
    expect(Complexity.description).toContain('complexity')
  })

  it('defines path arg as optional string with default "."', () => {
    const pathArg = Complexity.args!.path as Record<string, unknown>
    expect(pathArg).toBeDefined()
    expect(pathArg.description).toBe('Path to analyze for complexity')
    expect(pathArg.default).toBe('.')
    expect(pathArg.required).toBe(false)
  })

  it('has format flag with options csv, json, table', () => {
    const formatFlag = Complexity.flags!.format as Record<string, unknown>
    expect(formatFlag).toBeDefined()
    expect(formatFlag.char).toBe('f')
    expect(formatFlag.default).toBe('table')
    expect(formatFlag.options).toEqual(['csv', 'json', 'table'])
  })

  it('has threshold flag as integer defaulting to 1', () => {
    const thresholdFlag = Complexity.flags!.threshold as Record<string, unknown>
    expect(thresholdFlag).toBeDefined()
    expect(thresholdFlag.default).toBe(1)
  })

  it('has top flag defaulting to 0', () => {
    const topFlag = Complexity.flags!.top as Record<string, unknown>
    expect(topFlag).toBeDefined()
    expect(topFlag.default).toBe(0)
  })

  it('has sort flag with correct options', () => {
    const sortFlag = Complexity.flags!.sort as Record<string, unknown>
    expect(sortFlag).toBeDefined()
    expect(sortFlag.default).toBe('complexity')
    expect(sortFlag.options).toEqual(['complexity', 'file', 'name'])
  })

  it('has output flag with char o', () => {
    const outputFlag = Complexity.flags!.output as Record<string, unknown>
    expect(outputFlag).toBeDefined()
    expect(outputFlag.char).toBe('o')
  })

  it('has ignore flag with multiple true', () => {
    const ignoreFlag = Complexity.flags!.ignore as Record<string, unknown>
    expect(ignoreFlag).toBeDefined()
    expect(ignoreFlag.char).toBe('i')
    expect(ignoreFlag.multiple).toBe(true)
  })

  it('has ext flag with correct default', () => {
    const extFlag = Complexity.flags!.ext as Record<string, unknown>
    expect(extFlag).toBeDefined()
    expect(extFlag.default).toBe('.ts,.tsx,.js,.jsx')
  })

  it('has verbose flag with char v', () => {
    const verboseFlag = Complexity.flags!.verbose as Record<string, unknown>
    expect(verboseFlag).toBeDefined()
    expect(verboseFlag.char).toBe('v')
    expect(verboseFlag.default).toBe(false)
  })

  it('defines at least 2 examples', () => {
    expect(Complexity.examples!.length).toBeGreaterThanOrEqual(2)
  })

  it('each example has command and description strings', () => {
    for (const example of Complexity.examples!) {
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

describe('Complexity run() - path validation', () => {
  beforeEach(resetMocks)

  it('errors when path does not exist', async () => {
    mockExistsSync.mockReturnValueOnce(false)
    const { command } = createInstance()
    command.error = vi.fn() as never

    await command.run()

    expect(command.error).toHaveBeenCalledWith(
      expect.stringContaining('Path not found'),
      { exit: 1 },
    )
  })
})

// ─── File discovery and filtering ───

describe('Complexity run() - file discovery', () => {
  beforeEach(resetMocks)

  it('calls discoverFiles with default patterns from ext flag', async () => {
    const { command } = createInstance()
    mockDiscoverFiles.mockResolvedValue([])

    await command.run()

    expect(mockDiscoverFiles).toHaveBeenCalledWith(
      expect.objectContaining({
        patterns: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
        ignore: DEFAULT_IGNORE,
      }),
    )
  })

  it('combines default ignore with user-supplied ignore patterns', async () => {
    const { command } = createInstance({
      flags: { ignore: ['coverage/**', 'vendor/**'] },
    })

    await command.run()

    expect(mockDiscoverFiles).toHaveBeenCalledWith(
      expect.objectContaining({
        ignore: [...DEFAULT_IGNORE, 'coverage/**', 'vendor/**'],
      }),
    )
  })

  it('parses ext flag into patterns', async () => {
    const { command } = createInstance({ flags: { ext: '.ts,.tsx' } })

    await command.run()

    expect(mockDiscoverFiles).toHaveBeenCalledWith(
      expect.objectContaining({
        patterns: ['**/*.ts', '**/*.tsx'],
      }),
    )
  })

  it('filters discovered files by extension when ext is set', async () => {
    const files = [makeFile('a.ts'), makeFile('b.md')]
    const { command } = createInstance({ flags: { ext: '.ts' } })
    mockDiscoverFiles.mockResolvedValue(files)
    mockAnalyzeFileComplexity.mockReturnValue(makeFileComplexity({ functions: [] }))

    await command.run()

    expect(mockReadFile).toHaveBeenCalledTimes(1)
    expect(mockReadFile).toHaveBeenCalledWith('/project/a.ts', 'utf8')
  })

  it('reads all files when ext matches multiple extensions', async () => {
    const files = [makeFile('a.ts'), makeFile('b.js')]
    const { command } = createInstance({ flags: { ext: '.ts,.js' } })
    mockDiscoverFiles.mockResolvedValue(files)
    mockAnalyzeFileComplexity.mockReturnValue(makeFileComplexity({ functions: [] }))

    await command.run()

    expect(mockReadFile).toHaveBeenCalledTimes(2)
    expect(mockReadFile).toHaveBeenCalledWith('/project/a.ts', 'utf8')
    expect(mockReadFile).toHaveBeenCalledWith('/project/b.js', 'utf8')
  })
})

// ─── Parsing and analysis ───

describe('Complexity run() - parsing and analysis', () => {
  beforeEach(resetMocks)

  it('reads each discovered file via fs.readFile', async () => {
    const files = [makeFile('a.ts'), makeFile('b.ts'), makeFile('c.ts')]
    const { command } = createInstance({ flags: { ext: '.ts' } })
    mockDiscoverFiles.mockResolvedValue(files)
    mockReadFile.mockResolvedValue('source code')
    mockAnalyzeFileComplexity.mockReturnValue(makeFileComplexity({ functions: [] }))

    await command.run()

    expect(mockReadFile).toHaveBeenCalledTimes(3)
    expect(mockReadFile).toHaveBeenCalledWith('/project/a.ts', 'utf8')
    expect(mockReadFile).toHaveBeenCalledWith('/project/b.ts', 'utf8')
    expect(mockReadFile).toHaveBeenCalledWith('/project/c.ts', 'utf8')
  })

  it('calls analyzeFileComplexity with content and file path', async () => {
    const { command } = createInstance({ flags: { ext: '.ts' } })
    mockDiscoverFiles.mockResolvedValue([makeFile('a.ts')])
    mockReadFile.mockResolvedValue('export function foo() {}')
    mockAnalyzeFileComplexity.mockReturnValue(makeFileComplexity({ functions: [] }))

    await command.run()

    expect(mockAnalyzeFileComplexity).toHaveBeenCalledWith('export function foo() {}', 'a.ts')
  })

  it('calls analyzeFileComplexity for each filtered file', async () => {
    const files = [makeFile('a.ts'), makeFile('b.ts')]
    const { command } = createInstance({ flags: { ext: '.ts' } })
    mockDiscoverFiles.mockResolvedValue(files)
    mockAnalyzeFileComplexity.mockReturnValue(makeFileComplexity({ functions: [] }))

    await command.run()

    expect(mockAnalyzeFileComplexity).toHaveBeenCalledTimes(2)
    expect(mockAnalyzeFileComplexity).toHaveBeenCalledWith(expect.any(String), 'a.ts')
    expect(mockAnalyzeFileComplexity).toHaveBeenCalledWith(expect.any(String), 'b.ts')
  })

  it('passes file results to buildComplexityResult', async () => {
    const files = [makeFile('a.ts'), makeFile('b.ts')]
    const { command } = createInstance({ flags: { ext: '.ts' } })
    mockDiscoverFiles.mockResolvedValue(files)

    const fileResultA = makeFileComplexity({ filePath: 'a.ts', functions: [makeFunction({ name: 'funcA' })] })
    const fileResultB = makeFileComplexity({ filePath: 'b.ts', functions: [makeFunction({ name: 'funcB' })] })
    mockAnalyzeFileComplexity
      .mockReturnValueOnce(fileResultA)
      .mockReturnValueOnce(fileResultB)

    await command.run()

    expect(mockBuildComplexityResult).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ filePath: 'a.ts' }),
        expect.objectContaining({ filePath: 'b.ts' }),
      ]),
    )
  })

  it('gracefully handles files that fail to read', async () => {
    const files = [makeFile('bad.ts'), makeFile('good.ts')]
    const { command } = createInstance({ flags: { ext: '.ts' } })
    mockDiscoverFiles.mockResolvedValue(files)
    mockReadFile.mockImplementation((path: string) => {
      if (path.includes('bad')) return Promise.reject(new Error('read error'))
      return Promise.resolve('ok')
    })
    const goodResult = makeFileComplexity({ filePath: 'good.ts', functions: [makeFunction({ name: 'goodFunc' })] })
    mockAnalyzeFileComplexity.mockReturnValue(goodResult)
    mockBuildComplexityResult.mockReturnValue(makeComplexityResult({ functions: [] }))

    await command.run()

    // buildComplexityResult gets 2 entries: one fallback for bad.ts, one for good.ts
    expect(mockBuildComplexityResult).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ filePath: 'good.ts' }),
        expect.objectContaining({ filePath: 'bad.ts', functions: [] }),
      ]),
    )
    // The good file still got analyzed
    expect(mockAnalyzeFileComplexity).toHaveBeenCalledWith('ok', 'good.ts')
  })

  it('returns empty file result when readFile throws', async () => {
    const { command } = createInstance({ flags: { ext: '.ts' } })
    mockDiscoverFiles.mockResolvedValue([makeFile('bad.ts')])
    mockReadFile.mockRejectedValue(new Error('EACCES'))

    await command.run()

    // The fallback result should have empty functions
    const passedToBuild = mockBuildComplexityResult.mock.calls[0]?.[0] as Array<{ functions: unknown[] }>
    expect(passedToBuild).toHaveLength(1)
    expect(passedToBuild[0].functions).toEqual([])
  })
})

// ─── Threshold and sorting pipeline ───

describe('Complexity run() - threshold and sorting', () => {
  beforeEach(resetMocks)

  it('applies threshold filter to result functions', async () => {
    const funcs = [makeFunction({ name: 'f1', complexity: 5 })]
    const result = makeComplexityResult({ functions: funcs })
    const { command } = createInstance({ flags: { ext: '.ts' } })
    mockDiscoverFiles.mockResolvedValue([makeFile('a.ts')])
    mockBuildComplexityResult.mockReturnValue(result)

    await command.run()

    expect(mockFilterByThreshold).toHaveBeenCalledWith(funcs, 1)
  })

  it('applies custom threshold value', async () => {
    const { command } = createInstance({ flags: { ext: '.ts', threshold: 10 } })
    mockDiscoverFiles.mockResolvedValue([makeFile('a.ts')])
    const funcs = [makeFunction({ name: 'f1' })]
    mockBuildComplexityResult.mockReturnValue(makeComplexityResult({ functions: funcs }))

    await command.run()

    expect(mockFilterByThreshold).toHaveBeenCalledWith(expect.any(Array), 10)
  })

  it('sorts by name when sort is name', async () => {
    const funcs = [
      makeFunction({ name: 'beta', filePath: 'b.ts' }),
      makeFunction({ name: 'alpha', filePath: 'a.ts' }),
    ]
    mockFilterByThreshold.mockImplementation((items: unknown[]) => items)
    const { command } = createInstance({ flags: { ext: '.ts', sort: 'name' } })
    mockDiscoverFiles.mockResolvedValue([makeFile('a.ts')])
    mockBuildComplexityResult.mockReturnValue(makeComplexityResult({ functions: funcs }))

    await command.run()

    const passedToTable = mockFormatComplexityTable.mock.calls[0]?.[0] as ComplexityResult
    expect(passedToTable.functions[0].name).toBe('alpha')
    expect(passedToTable.functions[1].name).toBe('beta')
  })

  it('sorts by file when sort is file', async () => {
    const funcs = [
      makeFunction({ name: 'beta', filePath: 'z.ts' }),
      makeFunction({ name: 'alpha', filePath: 'a.ts' }),
    ]
    mockFilterByThreshold.mockImplementation((items: unknown[]) => items)
    const { command } = createInstance({ flags: { ext: '.ts', sort: 'file' } })
    mockDiscoverFiles.mockResolvedValue([makeFile('a.ts')])
    mockBuildComplexityResult.mockReturnValue(makeComplexityResult({ functions: funcs }))

    await command.run()

    const passedToTable = mockFormatComplexityTable.mock.calls[0]?.[0] as ComplexityResult
    expect(passedToTable.functions[0].filePath).toBe('a.ts')
    expect(passedToTable.functions[1].filePath).toBe('z.ts')
  })

  it('limits results to top N when top > 0', async () => {
    const funcs = Array.from({ length: 30 }, (_, i) =>
      makeFunction({ name: `func${i}`, complexity: i + 1 }),
    )
    mockFilterByThreshold.mockReturnValue(funcs)
    mockTakeTop.mockImplementation((items: unknown[], n: number) => items.slice(0, n))
    const { command } = createInstance({ flags: { ext: '.ts', top: 5 } })
    mockDiscoverFiles.mockResolvedValue([makeFile('a.ts')])
    mockBuildComplexityResult.mockReturnValue(makeComplexityResult({ functions: funcs }))

    await command.run()

    expect(mockTakeTop).toHaveBeenCalledWith(expect.any(Array), 5)
    const passedToTable = mockFormatComplexityTable.mock.calls[0]?.[0] as ComplexityResult
    expect(passedToTable.functions).toHaveLength(5)
  })

  it('does not call takeTop when top is 0 (default)', async () => {
    const funcs = Array.from({ length: 50 }, (_, i) =>
      makeFunction({ name: `func${i}`, complexity: i + 1 }),
    )
    mockFilterByThreshold.mockReturnValue(funcs)
    const { command } = createInstance({ flags: { ext: '.ts' } })
    mockDiscoverFiles.mockResolvedValue([makeFile('a.ts')])
    mockBuildComplexityResult.mockReturnValue(makeComplexityResult({ functions: funcs }))

    await command.run()

    expect(mockTakeTop).not.toHaveBeenCalled()
    const passedToTable = mockFormatComplexityTable.mock.calls[0]?.[0] as ComplexityResult
    expect(passedToTable.functions).toHaveLength(50)
  })
})

// ─── Output formatting ───

describe('Complexity run() - output formatting', () => {
  beforeEach(resetMocks)

  it('uses formatComplexityJson when format is json', async () => {
    const { command } = createInstance({ flags: { ext: '.ts', format: 'json' } })
    mockDiscoverFiles.mockResolvedValue([makeFile('a.ts')])
    mockFormatComplexityJson.mockReturnValue('{"json":true}')

    await command.run()

    expect(mockFormatComplexityJson).toHaveBeenCalled()
    expect(mockFormatComplexityCsv).not.toHaveBeenCalled()
    expect(mockFormatComplexityTable).not.toHaveBeenCalled()
  })

  it('uses formatComplexityCsv when format is csv', async () => {
    const { command } = createInstance({ flags: { ext: '.ts', format: 'csv' } })
    mockDiscoverFiles.mockResolvedValue([makeFile('a.ts')])
    mockFormatComplexityCsv.mockReturnValue('csv,data')

    await command.run()

    expect(mockFormatComplexityCsv).toHaveBeenCalled()
    expect(mockFormatComplexityJson).not.toHaveBeenCalled()
    expect(mockFormatComplexityTable).not.toHaveBeenCalled()
  })

  it('uses formatComplexityTable when format is table', async () => {
    const { command } = createInstance({ flags: { ext: '.ts', format: 'table' } })
    mockDiscoverFiles.mockResolvedValue([makeFile('a.ts')])
    mockFormatComplexityTable.mockReturnValue('table output')

    await command.run()

    expect(mockFormatComplexityTable).toHaveBeenCalled()
    expect(mockFormatComplexityJson).not.toHaveBeenCalled()
    expect(mockFormatComplexityCsv).not.toHaveBeenCalled()
  })

  it('defaults to table format when format not specified', async () => {
    const { command } = createInstance({ flags: { ext: '.ts' } })
    mockDiscoverFiles.mockResolvedValue([makeFile('a.ts')])

    await command.run()

    expect(mockFormatComplexityTable).toHaveBeenCalled()
  })

  it('logs output to stdout when no output file specified', async () => {
    const { command, logs } = createInstance({ flags: { ext: '.ts' } })
    mockDiscoverFiles.mockResolvedValue([makeFile('a.ts')])
    mockFormatComplexityTable.mockReturnValue('table output')

    await command.run()

    expect(logs).toContain('table output')
  })

  it('logs JSON output to stdout when format is json with no output file', async () => {
    const { command, logs } = createInstance({ flags: { ext: '.ts', format: 'json' } })
    mockDiscoverFiles.mockResolvedValue([makeFile('a.ts')])
    mockFormatComplexityJson.mockReturnValue('{"functions":[]}')

    await command.run()

    expect(logs).toContain('{"functions":[]}')
  })

  it('writes output to file when --output is specified', async () => {
    const { command, logs } = createInstance({ flags: { ext: '.ts', output: 'report.json' } })
    mockDiscoverFiles.mockResolvedValue([makeFile('a.ts')])
    mockFormatComplexityTable.mockReturnValue('table data')

    await command.run()

    expect(mockWriteFile).toHaveBeenCalledWith('report.json', 'table data', 'utf8')
    expect(logs).toContain('Results written to report.json')
  })

  it('logs verbose info when --verbose is set', async () => {
    const { command, logs } = createInstance({
      flags: { ext: '.ts', verbose: true, threshold: 5, sort: 'name', top: 10 },
    })
    mockDiscoverFiles.mockResolvedValue([makeFile('a.ts')])
    const funcs = Array.from({ length: 15 }, (_, i) => makeFunction({ name: `f${i}` }))
    mockFilterByThreshold.mockReturnValue(funcs)

    await command.run()

    expect(logs.some((l) => l.includes('Threshold: >= 5'))).toBe(true)
    expect(logs.some((l) => l.includes('Sort by: name'))).toBe(true)
    expect(logs.some((l) => l.includes('Showing top: 10'))).toBe(true)
  })
})

// ─── Empty results ───

describe('Complexity run() - empty results', () => {
  beforeEach(resetMocks)

  it('handles no discovered files gracefully', async () => {
    const { command } = createInstance()
    mockDiscoverFiles.mockResolvedValue([])

    await command.run()

    expect(mockReadFile).not.toHaveBeenCalled()
    expect(mockBuildComplexityResult).toHaveBeenCalledWith([])
  })

  it('handles empty complexity results from all files', async () => {
    const { command } = createInstance({ flags: { ext: '.ts' } })
    mockDiscoverFiles.mockResolvedValue([makeFile('a.ts'), makeFile('b.ts')])
    mockAnalyzeFileComplexity.mockReturnValue(makeFileComplexity({ functions: [] }))
    mockBuildComplexityResult.mockReturnValue(makeComplexityResult({ functions: [] }))

    await command.run()

    expect(mockBuildComplexityResult).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ functions: [] }),
        expect.objectContaining({ functions: [] }),
      ]),
    )
    expect(mockFilterByThreshold).toHaveBeenCalledWith([], 1)
  })

  it('still produces output for empty results', async () => {
    const { command, logs } = createInstance()
    mockDiscoverFiles.mockResolvedValue([])
    mockFormatComplexityTable.mockReturnValue('')

    await command.run()

    // At minimum, the table output (even if empty) should be logged
    expect(logs.length).toBeGreaterThan(0)
  })
})

// ─── Spinner lifecycle ───

describe('Complexity run() - spinner', () => {
  beforeEach(resetMocks)

  it('invokes discoverFiles during the run', async () => {
    const { command } = createInstance()
    mockDiscoverFiles.mockResolvedValue([])

    await command.run()

    expect(mockDiscoverFiles).toHaveBeenCalled()
  })
})
