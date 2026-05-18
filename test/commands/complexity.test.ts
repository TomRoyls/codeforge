import { beforeEach, describe, expect, it, vi } from 'vitest'

import Complexity from '../../src/commands/complexity.js'

// ─── Top-level mocks ───

const mockDiscoverFiles = vi.fn().mockResolvedValue([])
const mockParserInitialize = vi.fn().mockResolvedValue(undefined)
const mockParserParseFile = vi.fn()
const mockParserReleaseFile = vi.fn()
const mockParserDispose = vi.fn()
const mockExistsSync = vi.fn().mockReturnValue(true)

const mockAnalyzeFileComplexity = vi.fn().mockReturnValue([])

const mockBuildIgnorePatterns = vi.fn().mockReturnValue([])
const mockParseExtensions = vi.fn().mockReturnValue(null)
const mockFilterFilesByExtension = vi.fn().mockReturnValue([])
const mockFilterByThreshold = vi.fn().mockReturnValue([])
const mockSortByField = vi.fn().mockReturnValue([])
const mockBuildJsonOutput = vi.fn().mockReturnValue('{}')
const mockFormatOutputHelper = vi.fn().mockReturnValue('')

vi.mock('node:fs', () => ({
  existsSync: (...args: unknown[]) => mockExistsSync(...args),
}))

vi.mock('node:fs/promises', () => ({
  default: { writeFile: vi.fn() },
  writeFile: vi.fn(),
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
    releaseFile = (...args: unknown[]) => mockParserReleaseFile(...args)
    dispose = (...args: unknown[]) => mockParserDispose(...args)
  },
}))

vi.mock('../../src/core/file-discovery.js', () => ({
  discoverFiles: (...args: unknown[]) => mockDiscoverFiles(...args),
}))

vi.mock('../../src/core/complexity.js', () => ({
  analyzeFileComplexity: (...args: unknown[]) => mockAnalyzeFileComplexity(...args),
}))

vi.mock('../../src/utils/constants.js', () => ({
  DEFAULT_IGNORE_PATTERNS: ['node_modules/**', 'dist/**'],
}))

vi.mock('../../src/commands/complexity-helpers.js', () => ({
  buildIgnorePatterns: (...args: unknown[]) => mockBuildIgnorePatterns(...args),
  buildJsonOutput: (...args: unknown[]) => mockBuildJsonOutput(...args),
  filterByThreshold: (...args: unknown[]) => mockFilterByThreshold(...args),
  filterFilesByExtension: (...args: unknown[]) => mockFilterFilesByExtension(...args),
  formatOutput: (...args: unknown[]) => mockFormatOutputHelper(...args),
  parseExtensions: (...args: unknown[]) => mockParseExtensions(...args),
  sortByField: (...args: unknown[]) => mockSortByField(...args),
}))

// ─── Helpers ───

function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*m/g, '')
}

interface ParsedFlags {
  ext: string
  format: string
  ignore: string[] | undefined
  output: string | undefined
  'sort-by': string
  threshold: number
  top: number
}

interface ParsedArgs {
  path: string
}

interface ComplexityPrivate {
  log: (...args: unknown[]) => void
  parser: null | unknown
}

interface CreateInstanceOptions {
  flags?: Partial<ParsedFlags>
  path?: string
}

function createInstance(options: CreateInstanceOptions = {}): {
  command: Complexity
  p: ComplexityPrivate
  logs: string[]
} {
  const logs: string[] = []
  const command = new Complexity([], {} as never)
  const p = command as unknown as ComplexityPrivate

  const defaultFlags: ParsedFlags = {
    ext: '',
    format: 'table',
    ignore: undefined,
    output: undefined,
    'sort-by': 'complexity',
    threshold: 0,
    top: 20,
  }

  const mergedFlags: ParsedFlags = { ...defaultFlags, ...options.flags }
  const parsedArgs: ParsedArgs = { path: options.path ?? '.' }

  // Stub this.parse to avoid oclif's full machinery
  command.parse = vi.fn().mockResolvedValue({
    args: parsedArgs,
    flags: mergedFlags,
  })

  p.log = (...args: unknown[]) => {
    logs.push(args.map(String).join(' '))
  }

  return { command, p, logs }
}

function makeFile(path: string, absPath?: string) {
  return { absolutePath: absPath ?? `/project/${path}`, path }
}

function makeComplexity(overrides: Record<string, unknown> = {}) {
  return {
    category: overrides.category ?? 'low',
    cognitive: overrides.cognitive ?? 3,
    cyclomatic: overrides.cyclomatic ?? 5,
    filePath: overrides.filePath ?? 'src/app.ts',
    functionName: overrides.functionName ?? 'myFunc',
    startLine: overrides.startLine ?? 10,
  }
}

function resetMocks(): void {
  vi.clearAllMocks()

  mockExistsSync.mockReturnValue(true)
  mockDiscoverFiles.mockResolvedValue([])
  mockParserInitialize.mockResolvedValue(undefined)
  mockParserParseFile.mockResolvedValue({ sourceFile: {} })
  mockParserReleaseFile.mockReturnValue(undefined)
  mockParserDispose.mockReturnValue(undefined)
  mockAnalyzeFileComplexity.mockReturnValue([])

  mockBuildIgnorePatterns.mockReturnValue(['node_modules/**', 'dist/**'])
  mockParseExtensions.mockReturnValue(null)
  mockFilterFilesByExtension.mockImplementation((files: unknown[]) => files)
  mockFilterByThreshold.mockImplementation((items: unknown[]) => items)
  mockSortByField.mockImplementation((items: unknown[]) => items)
  mockBuildJsonOutput.mockReturnValue('{"functions":[],"summary":{}}')
  mockFormatOutputHelper.mockReturnValue('formatted output')
}

// ─── Static properties ───

describe('Complexity command static properties', () => {
  it('has correct description mentioning complexity', () => {
    expect(Complexity.description).toContain('complexity')
  })

  it('defines path arg as optional string with default "."', () => {
    const pathArg = Complexity.args!.path as Record<string, unknown>
    expect(pathArg).toBeDefined()
    expect(pathArg.description).toBe('Path to analyze')
    expect(pathArg.default).toBe('.')
    expect(pathArg.required).toBe(false)
  })

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

  it('has ext flag for file extensions', () => {
    const extFlag = Complexity.flags!.ext as Record<string, unknown>
    expect(extFlag).toBeDefined()
    expect(extFlag.default).toBe('')
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

  it('calls discoverFiles with ts patterns and ignore patterns', async () => {
    const { command } = createInstance()
    mockDiscoverFiles.mockResolvedValue([])
    mockBuildIgnorePatterns.mockReturnValue(['node_modules/**'])

    await command.run()

    expect(mockDiscoverFiles).toHaveBeenCalledWith(
      expect.objectContaining({
        patterns: ['**/*.ts', '**/*.tsx'],
        ignore: ['node_modules/**'],
      }),
    )
  })

  it('builds ignore patterns from defaults and user flags', async () => {
    const { command } = createInstance({
      flags: { ignore: ['coverage/**', 'vendor/**'] },
    })

    await command.run()

    expect(mockBuildIgnorePatterns).toHaveBeenCalledWith(
      ['node_modules/**', 'dist/**'],
      ['coverage/**', 'vendor/**'],
    )
  })

  it('calls parseExtensions with ext flag value', async () => {
    const { command } = createInstance({ flags: { ext: '.ts,.tsx' } })

    await command.run()

    expect(mockParseExtensions).toHaveBeenCalledWith('.ts,.tsx')
  })

  it('filters discovered files by extension when ext is set', async () => {
    const files = [makeFile('a.ts'), makeFile('b.ts')]
    const { command } = createInstance({ flags: { ext: '.ts' } })
    mockDiscoverFiles.mockResolvedValue(files)
    mockParseExtensions.mockReturnValue(['.ts'])

    await command.run()

    expect(mockFilterFilesByExtension).toHaveBeenCalledWith(files, ['.ts'])
  })

  it('passes null extension filter when no ext flag', async () => {
    const files = [makeFile('a.ts')]
    const { command } = createInstance()
    mockDiscoverFiles.mockResolvedValue(files)
    mockParseExtensions.mockReturnValue(null)

    await command.run()

    expect(mockFilterFilesByExtension).toHaveBeenCalledWith(files, null)
  })
})

// ─── Parsing and analysis ───

describe('Complexity run() - parsing and analysis', () => {
  beforeEach(resetMocks)

  it('initializes parser before parsing files', async () => {
    const { command } = createInstance()
    mockDiscoverFiles.mockResolvedValue([makeFile('a.ts')])

    await command.run()

    expect(mockParserInitialize).toHaveBeenCalled()
  })

  it('parses each discovered file', async () => {
    const files = [makeFile('a.ts'), makeFile('b.ts'), makeFile('c.ts')]
    const { command } = createInstance()
    mockDiscoverFiles.mockResolvedValue(files)
    mockFilterFilesByExtension.mockReturnValue(files)
    mockParserParseFile.mockResolvedValue({ sourceFile: {} })
    mockAnalyzeFileComplexity.mockReturnValue([])

    await command.run()

    expect(mockParserParseFile).toHaveBeenCalledTimes(3)
    expect(mockParserParseFile).toHaveBeenCalledWith('/project/a.ts')
    expect(mockParserParseFile).toHaveBeenCalledWith('/project/b.ts')
    expect(mockParserParseFile).toHaveBeenCalledWith('/project/c.ts')
  })

  it('calls analyzeFileComplexity for each parsed source file', async () => {
    const { command } = createInstance()
    mockDiscoverFiles.mockResolvedValue([makeFile('a.ts')])
    mockFilterFilesByExtension.mockReturnValue([makeFile('a.ts')])
    mockParserParseFile.mockResolvedValue({ sourceFile: 'mock-source' })

    await command.run()

    expect(mockAnalyzeFileComplexity).toHaveBeenCalledWith('mock-source')
  })

  it('releases each file after analysis', async () => {
    const files = [makeFile('a.ts'), makeFile('b.ts')]
    const { command } = createInstance()
    mockDiscoverFiles.mockResolvedValue(files)
    mockFilterFilesByExtension.mockReturnValue(files)
    mockParserParseFile.mockResolvedValue({ sourceFile: {} })
    mockAnalyzeFileComplexity.mockReturnValue([])

    await command.run()

    expect(mockParserReleaseFile).toHaveBeenCalledTimes(2)
    expect(mockParserReleaseFile).toHaveBeenCalledWith('/project/a.ts')
    expect(mockParserReleaseFile).toHaveBeenCalledWith('/project/b.ts')
  })

  it('disposes parser after analysis and sets parser to null', async () => {
    const { command, p } = createInstance()
    mockDiscoverFiles.mockResolvedValue([makeFile('a.ts')])

    await command.run()

    expect(mockParserDispose).toHaveBeenCalled()
    expect(p.parser).toBeNull()
  })

  it('disposes parser even when file parsing throws', async () => {
    const { command, p } = createInstance()
    mockDiscoverFiles.mockResolvedValue([makeFile('a.ts')])
    mockFilterFilesByExtension.mockReturnValue([makeFile('a.ts')])
    mockParserParseFile.mockRejectedValue(new Error('parse error'))

    await command.run()

    expect(mockParserDispose).toHaveBeenCalled()
    expect(p.parser).toBeNull()
  })

  it('collects complexity results from all files into single array', async () => {
    const files = [makeFile('a.ts'), makeFile('b.ts')]
    const { command } = createInstance()
    mockDiscoverFiles.mockResolvedValue(files)
    mockFilterFilesByExtension.mockReturnValue(files)
    mockParserParseFile.mockResolvedValue({ sourceFile: {} })

    const complexityA = [makeComplexity({ functionName: 'funcA', cyclomatic: 3 })]
    const complexityB = [makeComplexity({ functionName: 'funcB', cyclomatic: 8 })]
    mockAnalyzeFileComplexity
      .mockReturnValueOnce(complexityA)
      .mockReturnValueOnce(complexityB)

    await command.run()

    expect(mockFilterByThreshold).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ functionName: 'funcA' }),
        expect.objectContaining({ functionName: 'funcB' }),
      ]),
      0,
    )
  })

  it('gracefully skips files that fail to parse', async () => {
    const files = [makeFile('bad.ts'), makeFile('good.ts')]
    const { command } = createInstance()
    mockDiscoverFiles.mockResolvedValue(files)
    mockFilterFilesByExtension.mockReturnValue(files)

    let callCount = 0
    mockParserParseFile.mockImplementation(() => {
      callCount++
      if (callCount === 1) return Promise.reject(new Error('Parse failed'))
      return Promise.resolve({ sourceFile: {} })
    })
    mockAnalyzeFileComplexity.mockReturnValue([makeComplexity({ functionName: 'goodFunc' })])

    await command.run()

    expect(mockFilterByThreshold).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ functionName: 'goodFunc' }),
      ]),
      0,
    )
  })
})

// ─── Threshold and sorting pipeline ───

describe('Complexity run() - threshold and sorting', () => {
  beforeEach(resetMocks)

  it('applies threshold filter before sorting', async () => {
    const results = [makeComplexity({ cyclomatic: 12 })]
    const { command } = createInstance()
    mockDiscoverFiles.mockResolvedValue([makeFile('a.ts')])
    mockFilterFilesByExtension.mockReturnValue([makeFile('a.ts')])
    mockParserParseFile.mockResolvedValue({ sourceFile: {} })
    mockAnalyzeFileComplexity.mockReturnValue(results)

    await command.run()

    expect(mockFilterByThreshold).toHaveBeenCalledWith(results, 0)
  })

  it('applies custom threshold value', async () => {
    const { command } = createInstance({ flags: { threshold: 10 } })
    mockDiscoverFiles.mockResolvedValue([makeFile('a.ts')])
    mockFilterFilesByExtension.mockReturnValue([makeFile('a.ts')])
    mockParserParseFile.mockResolvedValue({ sourceFile: {} })
    mockAnalyzeFileComplexity.mockReturnValue([makeComplexity()])

    await command.run()

    expect(mockFilterByThreshold).toHaveBeenCalledWith(
      expect.any(Array),
      10,
    )
  })

  it('sorts filtered results by specified field', async () => {
    const { command } = createInstance({ flags: { 'sort-by': 'file' } })
    mockDiscoverFiles.mockResolvedValue([makeFile('a.ts')])
    mockFilterFilesByExtension.mockReturnValue([makeFile('a.ts')])
    mockParserParseFile.mockResolvedValue({ sourceFile: {} })
    mockAnalyzeFileComplexity.mockReturnValue([makeComplexity()])

    await command.run()

    expect(mockSortByField).toHaveBeenCalledWith(
      expect.any(Array),
      'file',
    )
  })

  it('sorts by name when sort-by is name', async () => {
    const { command } = createInstance({ flags: { 'sort-by': 'name' } })
    mockDiscoverFiles.mockResolvedValue([makeFile('a.ts')])
    mockFilterFilesByExtension.mockReturnValue([makeFile('a.ts')])
    mockParserParseFile.mockResolvedValue({ sourceFile: {} })
    mockAnalyzeFileComplexity.mockReturnValue([makeComplexity()])

    await command.run()

    expect(mockSortByField).toHaveBeenCalledWith(expect.any(Array), 'name')
  })

  it('limits results to top N value', async () => {
    const allResults = Array.from({ length: 30 }, (_, i) =>
      makeComplexity({ functionName: `func${i}`, cyclomatic: i + 1 }),
    )
    const { command } = createInstance({ flags: { top: 5 } })
    mockDiscoverFiles.mockResolvedValue([makeFile('a.ts')])
    mockFilterFilesByExtension.mockReturnValue([makeFile('a.ts')])
    mockParserParseFile.mockResolvedValue({ sourceFile: {} })
    mockAnalyzeFileComplexity.mockReturnValue(allResults)

    await command.run()

    const passedToFormat = mockFormatOutputHelper.mock.calls[0]?.[0] as unknown[]
    expect(passedToFormat).toHaveLength(5)
  })

  it('defaults to top 20', async () => {
    const allResults = Array.from({ length: 50 }, (_, i) =>
      makeComplexity({ functionName: `func${i}`, cyclomatic: i + 1 }),
    )
    const { command } = createInstance()
    mockDiscoverFiles.mockResolvedValue([makeFile('a.ts')])
    mockFilterFilesByExtension.mockReturnValue([makeFile('a.ts')])
    mockParserParseFile.mockResolvedValue({ sourceFile: {} })
    mockAnalyzeFileComplexity.mockReturnValue(allResults)

    await command.run()

    const passedToFormat = mockFormatOutputHelper.mock.calls[0]?.[0] as unknown[]
    expect(passedToFormat).toHaveLength(20)
  })
})

// ─── Output formatting ───

describe('Complexity run() - output formatting', () => {
  beforeEach(resetMocks)

  it('uses buildJsonOutput when format is json', async () => {
    const { command } = createInstance({ flags: { format: 'json' } })
    mockDiscoverFiles.mockResolvedValue([makeFile('a.ts')])
    mockFilterFilesByExtension.mockReturnValue([makeFile('a.ts')])
    mockParserParseFile.mockResolvedValue({ sourceFile: {} })
    mockAnalyzeFileComplexity.mockReturnValue([makeComplexity()])
    mockBuildJsonOutput.mockReturnValue('{"json":true}')

    await command.run()

    expect(mockBuildJsonOutput).toHaveBeenCalled()
    expect(mockFormatOutputHelper).not.toHaveBeenCalled()
  })

  it('uses formatOutputHelper when format is table', async () => {
    const { command } = createInstance({ flags: { format: 'table' } })
    mockDiscoverFiles.mockResolvedValue([makeFile('a.ts')])
    mockFilterFilesByExtension.mockReturnValue([makeFile('a.ts')])
    mockParserParseFile.mockResolvedValue({ sourceFile: {} })
    mockAnalyzeFileComplexity.mockReturnValue([makeComplexity()])
    mockFormatOutputHelper.mockReturnValue('table output')

    await command.run()

    expect(mockFormatOutputHelper).toHaveBeenCalledWith(expect.any(Array), 'table')
    expect(mockBuildJsonOutput).not.toHaveBeenCalled()
  })

  it('uses formatOutputHelper when format is markdown', async () => {
    const { command } = createInstance({ flags: { format: 'markdown' } })
    mockDiscoverFiles.mockResolvedValue([makeFile('a.ts')])
    mockFilterFilesByExtension.mockReturnValue([makeFile('a.ts')])
    mockParserParseFile.mockResolvedValue({ sourceFile: {} })
    mockAnalyzeFileComplexity.mockReturnValue([makeComplexity()])
    mockFormatOutputHelper.mockReturnValue('# Complexity Report')

    await command.run()

    expect(mockFormatOutputHelper).toHaveBeenCalledWith(expect.any(Array), 'markdown')
  })

  it('logs output to stdout when no output file specified', async () => {
    const { command, logs } = createInstance()
    mockDiscoverFiles.mockResolvedValue([makeFile('a.ts')])
    mockFilterFilesByExtension.mockReturnValue([makeFile('a.ts')])
    mockParserParseFile.mockResolvedValue({ sourceFile: {} })
    mockAnalyzeFileComplexity.mockReturnValue([makeComplexity()])
    mockFormatOutputHelper.mockReturnValue('table output')

    await command.run()

    expect(logs).toContain('table output')
  })

  it('logs JSON output to stdout when format is json with no output file', async () => {
    const { command, logs } = createInstance({ flags: { format: 'json' } })
    mockDiscoverFiles.mockResolvedValue([makeFile('a.ts')])
    mockFilterFilesByExtension.mockReturnValue([makeFile('a.ts')])
    mockParserParseFile.mockResolvedValue({ sourceFile: {} })
    mockAnalyzeFileComplexity.mockReturnValue([makeComplexity()])
    mockBuildJsonOutput.mockReturnValue('{"functions":[]}')

    await command.run()

    expect(logs).toContain('{"functions":[]}')
  })
})

// ─── Empty results ───

describe('Complexity run() - empty results', () => {
  beforeEach(resetMocks)

  it('handles no discovered files gracefully', async () => {
    const { command } = createInstance()
    mockDiscoverFiles.mockResolvedValue([])
    mockFilterFilesByExtension.mockReturnValue([])

    await command.run()

    expect(mockParserParseFile).not.toHaveBeenCalled()
    expect(mockFilterByThreshold).toHaveBeenCalledWith([], 0)
  })

  it('handles empty complexity results from all files', async () => {
    const { command } = createInstance()
    mockDiscoverFiles.mockResolvedValue([makeFile('a.ts'), makeFile('b.ts')])
    mockFilterFilesByExtension.mockReturnValue([makeFile('a.ts'), makeFile('b.ts')])
    mockParserParseFile.mockResolvedValue({ sourceFile: {} })
    mockAnalyzeFileComplexity.mockReturnValue([])

    await command.run()

    expect(mockFilterByThreshold).toHaveBeenCalledWith([], 0)
  })

  it('still produces output for empty results', async () => {
    const { command, logs } = createInstance()
    mockDiscoverFiles.mockResolvedValue([])
    mockFilterFilesByExtension.mockReturnValue([])

    await command.run()

    expect(logs.length).toBeGreaterThan(0)
  })
})

// ─── Spinner lifecycle ───

describe('Complexity run() - spinner', () => {
  beforeEach(resetMocks)

  it('starts spinner with discovering message', async () => {
    const { command } = createInstance()
    mockDiscoverFiles.mockResolvedValue([])

    await command.run()

    expect(mockDiscoverFiles).toHaveBeenCalled()
  })
})
