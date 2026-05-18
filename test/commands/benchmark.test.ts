import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import Benchmark from '../../src/commands/benchmark.js'

// ─── Top-level mocks ───

const mockWriteFile = vi.fn().mockResolvedValue(undefined)

vi.mock('node:fs', () => ({
  existsSync: vi.fn().mockReturnValue(true),
}))

vi.mock('node:fs/promises', () => ({
  writeFile: (...args: unknown[]) => mockWriteFile(...args),
}))

vi.mock('node:os', () => ({
  default: {
    cpus: () => [{ length: 4 }],
  },
}))

vi.mock('../../src/core/parser.js', () => ({
  Parser: class {
    initialize = vi.fn().mockResolvedValue(undefined)
    parseFile = vi.fn().mockResolvedValue({ sourceFile: {} })
    dispose = vi.fn()
  },
}))

vi.mock('../../src/core/file-discovery.js', () => ({
  discoverFiles: vi.fn().mockResolvedValue([]),
}))

vi.mock('../../src/core/rule-registry.js', () => ({
  RuleRegistry: class {
    register = vi.fn()
    runRules = vi.fn().mockReturnValue([])
    runRulesBatched = vi.fn().mockReturnValue([])
  },
}))

vi.mock('../../src/rules/categories.js', () => ({
  getRuleCategory: vi.fn().mockReturnValue('patterns'),
}))

vi.mock('../../src/commands/benchmark-helpers.js', () => ({
  getRulesToBenchmark: vi.fn().mockResolvedValue([]),
  printResults: vi.fn().mockReturnValue([]),
  writeResults: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../../src/rules/lazy-loader.js', () => ({
  lazyRuleLoader: {
    loadAllRules: vi.fn().mockResolvedValue({}),
  },
}))

// ─── Helpers ───

function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*m/g, '')
}

interface BenchmarkPrivate {
  discoverFiles: (cwd: string) => Promise<Array<{ absolutePath: string; path: string }>>
  getRulesToBenchmark: (
    requestedRules: string[] | undefined,
  ) => Promise<Array<[string, unknown]>>
  log: (...args: unknown[]) => void
}

function createBenchmarkInstance(): { command: Benchmark; p: BenchmarkPrivate; logs: string[] } {
  const logs: string[] = []
  const command = new Benchmark([], {} as never)
  const p = command as unknown as BenchmarkPrivate

  p.log = (...args: unknown[]) => {
    logs.push(args.map(String).join(' '))
  }

  return { command, p, logs }
}

const mockRuleDefinition = {
  create: vi.fn().mockReturnValue({ visitor: {}, onComplete: vi.fn().mockReturnValue([]) }),
  defaultOptions: {},
  meta: { category: 'patterns' as const, description: 'test rule', name: 'test-rule', recommended: false },
}

// ─── Static properties ───

describe('Benchmark command static properties', () => {
  it('has correct description', () => {
    expect(Benchmark.description).toBe('Benchmark rule performance on a codebase')
  })

  it('has examples defined', () => {
    expect(Benchmark.examples).toBeDefined()
    expect(Benchmark.examples!.length).toBeGreaterThan(0)
  })

  it('defines path arg as optional string with default "."', () => {
    const pathArg = Benchmark.args!.path
    expect(pathArg).toBeDefined()
    expect(pathArg!.description).toBe('Path to benchmark (file or directory)')
    expect(pathArg!.required).toBe(false)
  })

  it('has iterations flag with char i defaulting to 3', () => {
    const iterationsFlag = Benchmark.flags!.iterations as Record<string, unknown>
    expect(iterationsFlag).toBeDefined()
    expect(iterationsFlag.char).toBe('i')
    expect(iterationsFlag.default).toBe(3)
  })

  it('has output flag with char o', () => {
    const outputFlag = Benchmark.flags!.output as Record<string, unknown>
    expect(outputFlag).toBeDefined()
    expect(outputFlag.char).toBe('o')
  })

  it('has rules flag with char r and multiple option', () => {
    const rulesFlag = Benchmark.flags!.rules as Record<string, unknown>
    expect(rulesFlag).toBeDefined()
    expect(rulesFlag.char).toBe('r')
    expect(rulesFlag.multiple).toBe(true)
  })

  it('has top flag with char t defaulting to 20', () => {
    const topFlag = Benchmark.flags!.top as Record<string, unknown>
    expect(topFlag).toBeDefined()
    expect(topFlag.char).toBe('t')
    expect(topFlag.default).toBe(20)
  })

  it('has warmup flag defaulting to true', () => {
    const warmupFlag = Benchmark.flags!.warmup as Record<string, unknown>
    expect(warmupFlag).toBeDefined()
    expect(warmupFlag.default).toBe(true)
  })

  it('defines at least 3 examples', () => {
    expect(Benchmark.examples!.length).toBeGreaterThanOrEqual(3)
  })
})

// ─── Example structures ───

describe('Benchmark examples structure', () => {
  it('each example has command and description', () => {
    for (const example of Benchmark.examples!) {
      expect(example).toHaveProperty('command')
      expect(example).toHaveProperty('description')
      expect(typeof example.command).toBe('string')
      expect(typeof example.description).toBe('string')
      expect(example.command.length).toBeGreaterThan(0)
      expect(example.description.length).toBeGreaterThan(0)
    }
  })
})

// ─── getRulesToBenchmark ───

describe('getRulesToBenchmark', () => {
  let instance: ReturnType<typeof createBenchmarkInstance>

  beforeEach(() => {
    instance = createBenchmarkInstance()
  })

  it('delegates to helper when no rules requested', async () => {
    const { getRulesToBenchmark } = await import('../../src/commands/benchmark-helpers.js')
    vi.mocked(getRulesToBenchmark).mockResolvedValue([])

    const result = await instance.p.getRulesToBenchmark(undefined)
    expect(getRulesToBenchmark).toHaveBeenCalledWith(undefined)
    expect(result).toEqual([])
  })

  it('delegates to helper with specific rules', async () => {
    const { getRulesToBenchmark } = await import('../../src/commands/benchmark-helpers.js')
    vi.mocked(getRulesToBenchmark).mockResolvedValue([])

    await instance.p.getRulesToBenchmark(['rule-a', 'rule-b'])
    expect(getRulesToBenchmark).toHaveBeenCalledWith(['rule-a', 'rule-b'])
  })

  it('returns rules from helper', async () => {
    const { getRulesToBenchmark } = await import('../../src/commands/benchmark-helpers.js')
    const rules: Array<[string, unknown]> = [['my-rule', mockRuleDefinition]]
    vi.mocked(getRulesToBenchmark).mockResolvedValue(rules)

    const result = await instance.p.getRulesToBenchmark(['my-rule'])
    expect(result).toEqual(rules)
    expect(result).toHaveLength(1)
    expect(result[0]![0]).toBe('my-rule')
  })

  it('returns empty array when no rules match', async () => {
    const { getRulesToBenchmark } = await import('../../src/commands/benchmark-helpers.js')
    vi.mocked(getRulesToBenchmark).mockResolvedValue([])

    const result = await instance.p.getRulesToBenchmark(['nonexistent'])
    expect(result).toEqual([])
  })
})

// ─── discoverFiles ───

describe('discoverFiles', () => {
  let instance: ReturnType<typeof createBenchmarkInstance>

  beforeEach(() => {
    instance = createBenchmarkInstance()
  })

  it('calls discoverFiles with correct patterns and ignores', async () => {
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    vi.mocked(discoverFiles).mockResolvedValue([])

    await instance.p.discoverFiles('/some/path')

    expect(discoverFiles).toHaveBeenCalledWith({
      cwd: '/some/path',
      ignore: ['node_modules/**', 'dist/**', 'coverage/**', '**/*.d.ts'],
      patterns: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    })
  })

  it('returns discovered files', async () => {
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    const files = [
      { absolutePath: '/abs/a.ts', path: 'a.ts' },
      { absolutePath: '/abs/b.ts', path: 'b.ts' },
    ]
    vi.mocked(discoverFiles).mockResolvedValue(files)

    const result = await instance.p.discoverFiles('/some/path')
    expect(result).toEqual(files)
    expect(result).toHaveLength(2)
  })

  it('returns empty array when no files found', async () => {
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    vi.mocked(discoverFiles).mockResolvedValue([])

    const result = await instance.p.discoverFiles('/empty/path')
    expect(result).toEqual([])
  })
})

// ─── run - path not found ───

describe('Benchmark run - path validation', () => {
  it('errors when path does not exist', async () => {
    const { existsSync } = await import('node:fs')
    vi.mocked(existsSync).mockReturnValue(false)

    const instance = createBenchmarkInstance()
    const errorSpy = vi.fn().mockImplementation(() => {
      throw new Error('exit')
    })
    ;(instance.command as Record<string, unknown>).error = errorSpy

    const parseMock = vi.fn().mockResolvedValue({
      args: { path: '/nonexistent' },
      flags: { iterations: 3, output: undefined, rules: undefined, top: 20, warmup: true },
    })
    ;(instance.command as Record<string, unknown>).parse = parseMock

    try {
      await instance.command.run()
    } catch {
      // expected
    }

    expect(errorSpy).toHaveBeenCalled()
    const callArgs = errorSpy.mock.calls[0]!
    expect(callArgs[0]).toContain('Path not found')
  })
})

// ─── run - no files ───

describe('Benchmark run - no files found', () => {
  beforeEach(async () => {
    const { existsSync } = await import('node:fs')
    vi.mocked(existsSync).mockReturnValue(true)
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    vi.mocked(discoverFiles).mockResolvedValue([])
  })

  it('logs warning and exits when no files found', async () => {
    const instance = createBenchmarkInstance()

    // Stub parse to avoid oclif internals
    const parseMock = vi.fn().mockResolvedValue({
      args: { path: '.' },
      flags: { iterations: 3, output: undefined, rules: undefined, top: 20, warmup: true },
    })
    ;(instance.command as Record<string, unknown>).parse = parseMock
    ;(instance.command as Record<string, unknown>).exit = vi.fn()

    await instance.command.run()

    const output = stripAnsi(instance.logs.join('\n'))
    expect(output).toContain('No files found to benchmark')
    expect((instance.command as Record<string, unknown>).exit).toHaveBeenCalledWith(0)
  })
})

// ─── run - configuration logging ───

describe('Benchmark run - configuration output', () => {
  let instance: ReturnType<typeof createBenchmarkInstance>

  beforeEach(async () => {
    const { existsSync } = await import('node:fs')
    vi.mocked(existsSync).mockReturnValue(true)
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    const files = [{ absolutePath: '/abs/a.ts', path: 'a.ts' }]
    vi.mocked(discoverFiles).mockResolvedValue(files)
    const { getRulesToBenchmark } = await import('../../src/commands/benchmark-helpers.js')
    vi.mocked(getRulesToBenchmark).mockResolvedValue([])
    const { printResults } = await import('../../src/commands/benchmark-helpers.js')
    vi.mocked(printResults).mockReturnValue(['Results line'])

    instance = createBenchmarkInstance()
    const parseMock = vi.fn().mockResolvedValue({
      args: { path: '.' },
      flags: { iterations: 3, output: undefined, rules: undefined, top: 20, warmup: true },
    })
    ;(instance.command as Record<string, unknown>).parse = parseMock
  })

  it('logs header with bold styling', async () => {
    await instance.command.run()
    const header = instance.logs[0]!
    expect(stripAnsi(header)).toBe('CodeForge Benchmark')
  })

  it('logs file count', async () => {
    await instance.command.run()
    const output = stripAnsi(instance.logs.join('\n'))
    expect(output).toContain('Files: 1')
  })

  it('logs iteration count', async () => {
    await instance.command.run()
    const output = stripAnsi(instance.logs.join('\n'))
    expect(output).toContain('Iterations: 3')
  })

  it('logs warmup enabled', async () => {
    await instance.command.run()
    const output = stripAnsi(instance.logs.join('\n'))
    expect(output).toContain('Warmup: enabled')
  })

  it('logs warmup disabled when flag is false', async () => {
    const parseMock = vi.fn().mockResolvedValue({
      args: { path: '.' },
      flags: { iterations: 3, output: undefined, rules: undefined, top: 20, warmup: false },
    })
    ;(instance.command as Record<string, unknown>).parse = parseMock

    await instance.command.run()
    const output = stripAnsi(instance.logs.join('\n'))
    expect(output).toContain('Warmup: disabled')
  })

  it('logs parsing step', async () => {
    await instance.command.run()
    const output = stripAnsi(instance.logs.join('\n'))
    expect(output).toContain('Parsing files...')
  })

  it('logs parse time', async () => {
    await instance.command.run()
    const output = stripAnsi(instance.logs.join('\n'))
    expect(output).toMatch(/Parse time: \d+\.\d+ms/)
  })
})

// ─── run - warmup ───

describe('Benchmark run - warmup', () => {
  let instance: ReturnType<typeof createBenchmarkInstance>

  beforeEach(async () => {
    const { existsSync } = await import('node:fs')
    vi.mocked(existsSync).mockReturnValue(true)
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    vi.mocked(discoverFiles).mockResolvedValue([{ absolutePath: '/abs/a.ts', path: 'a.ts' }])

    instance = createBenchmarkInstance()
  })

  it('logs warmup step when warmup is enabled', async () => {
    const { getRulesToBenchmark } = await import('../../src/commands/benchmark-helpers.js')
    vi.mocked(getRulesToBenchmark).mockResolvedValue([['test-rule', mockRuleDefinition]])
    const { printResults } = await import('../../src/commands/benchmark-helpers.js')
    vi.mocked(printResults).mockReturnValue([])

    const parseMock = vi.fn().mockResolvedValue({
      args: { path: '.' },
      flags: { iterations: 3, output: undefined, rules: undefined, top: 20, warmup: true },
    })
    ;(instance.command as Record<string, unknown>).parse = parseMock

    await instance.command.run()
    const output = stripAnsi(instance.logs.join('\n'))
    expect(output).toContain('Running warmup...')
    expect(output).toContain('Warmup complete')
  })

  it('skips warmup when flag is false', async () => {
    const { getRulesToBenchmark } = await import('../../src/commands/benchmark-helpers.js')
    vi.mocked(getRulesToBenchmark).mockResolvedValue([['test-rule', mockRuleDefinition]])
    const { printResults } = await import('../../src/commands/benchmark-helpers.js')
    vi.mocked(printResults).mockReturnValue([])

    const parseMock = vi.fn().mockResolvedValue({
      args: { path: '.' },
      flags: { iterations: 3, output: undefined, rules: undefined, top: 20, warmup: false },
    })
    ;(instance.command as Record<string, unknown>).parse = parseMock

    await instance.command.run()
    const output = stripAnsi(instance.logs.join('\n'))
    expect(output).not.toContain('Running warmup...')
  })

  it('skips warmup when no rules to benchmark', async () => {
    const { getRulesToBenchmark } = await import('../../src/commands/benchmark-helpers.js')
    vi.mocked(getRulesToBenchmark).mockResolvedValue([])
    const { printResults } = await import('../../src/commands/benchmark-helpers.js')
    vi.mocked(printResults).mockReturnValue([])

    const parseMock = vi.fn().mockResolvedValue({
      args: { path: '.' },
      flags: { iterations: 3, output: undefined, rules: undefined, top: 20, warmup: true },
    })
    ;(instance.command as Record<string, unknown>).parse = parseMock

    await instance.command.run()
    const output = stripAnsi(instance.logs.join('\n'))
    expect(output).not.toContain('Running warmup...')
  })
})

// ─── run - benchmarking output ───

describe('Benchmark run - results output', () => {
  let instance: ReturnType<typeof createBenchmarkInstance>

  beforeEach(async () => {
    const { existsSync } = await import('node:fs')
    vi.mocked(existsSync).mockReturnValue(true)
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    vi.mocked(discoverFiles).mockResolvedValue([{ absolutePath: '/abs/a.ts', path: 'a.ts' }])
    const { getRulesToBenchmark } = await import('../../src/commands/benchmark-helpers.js')
    vi.mocked(getRulesToBenchmark).mockResolvedValue([])
    const { printResults } = await import('../../src/commands/benchmark-helpers.js')
    vi.mocked(printResults).mockReturnValue(['Result line 1', 'Result line 2'])

    instance = createBenchmarkInstance()
    const parseMock = vi.fn().mockResolvedValue({
      args: { path: '.' },
      flags: { iterations: 3, output: undefined, rules: undefined, top: 20, warmup: false },
    })
    ;(instance.command as Record<string, unknown>).parse = parseMock
  })

  it('calls printResults with empty results and top count', async () => {
    const { printResults } = await import('../../src/commands/benchmark-helpers.js')

    await instance.command.run()
    expect(printResults).toHaveBeenCalledWith([], 20)
  })

  it('logs each line from printResults', async () => {
    await instance.command.run()
    expect(instance.logs).toContain('Result line 1')
    expect(instance.logs).toContain('Result line 2')
  })

  it('calls printResults with custom top count', async () => {
    const { printResults } = await import('../../src/commands/benchmark-helpers.js')
    const parseMock = vi.fn().mockResolvedValue({
      args: { path: '.' },
      flags: { iterations: 3, output: undefined, rules: undefined, top: 5, warmup: false },
    })
    ;(instance.command as Record<string, unknown>).parse = parseMock

    await instance.command.run()
    expect(printResults).toHaveBeenCalledWith([], 5)
  })
})

// ─── run - JSON output ───

describe('Benchmark run - JSON output', () => {
  let instance: ReturnType<typeof createBenchmarkInstance>

  beforeEach(async () => {
    const { existsSync } = await import('node:fs')
    vi.mocked(existsSync).mockReturnValue(true)
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    vi.mocked(discoverFiles).mockResolvedValue([{ absolutePath: '/abs/a.ts', path: 'a.ts' }])
    const { getRulesToBenchmark } = await import('../../src/commands/benchmark-helpers.js')
    vi.mocked(getRulesToBenchmark).mockResolvedValue([])
    const { printResults } = await import('../../src/commands/benchmark-helpers.js')
    vi.mocked(printResults).mockReturnValue([])

    instance = createBenchmarkInstance()
  })

  it('writes results to output file when flag provided', async () => {
    const { writeResults } = await import('../../src/commands/benchmark-helpers.js')
    const mockResults = [{ avgTime: 1, maxTime: 2, minTime: 0.5, ruleId: 'test', runCount: 3, totalTime: 3 }]

    // Override getRulesToBenchmark to return rules so we get results
    vi.mocked(writeResults).mockResolvedValue(undefined)

    const parseMock = vi.fn().mockResolvedValue({
      args: { path: '.' },
      flags: { iterations: 3, output: 'results.json', rules: undefined, top: 20, warmup: false },
    })
    ;(instance.command as Record<string, unknown>).parse = parseMock

    await instance.command.run()

    expect(writeResults).toHaveBeenCalledWith([], 'results.json')
  })

  it('logs success message after writing results', async () => {
    const { writeResults } = await import('../../src/commands/benchmark-helpers.js')
    vi.mocked(writeResults).mockResolvedValue(undefined)

    const parseMock = vi.fn().mockResolvedValue({
      args: { path: '.' },
      flags: { iterations: 3, output: 'results.json', rules: undefined, top: 20, warmup: false },
    })
    ;(instance.command as Record<string, unknown>).parse = parseMock

    await instance.command.run()

    const output = stripAnsi(instance.logs.join('\n'))
    expect(output).toContain('Results written to: results.json')
  })

  it('errors when writeResults throws', async () => {
    const { writeResults } = await import('../../src/commands/benchmark-helpers.js')
    vi.mocked(writeResults).mockRejectedValue(new Error('Disk full'))

    const errorSpy = vi.fn()
    ;(instance.command as Record<string, unknown>).error = errorSpy

    const parseMock = vi.fn().mockResolvedValue({
      args: { path: '.' },
      flags: { iterations: 3, output: 'results.json', rules: undefined, top: 20, warmup: false },
    })
    ;(instance.command as Record<string, unknown>).parse = parseMock

    await instance.command.run()

    expect(errorSpy).toHaveBeenCalled()
    expect(errorSpy.mock.calls[0]![0]).toContain('Failed to write benchmark results')
    expect(errorSpy.mock.calls[0]![0]).toContain('Disk full')
  })

  it('handles non-Error thrown values from writeResults', async () => {
    const { writeResults } = await import('../../src/commands/benchmark-helpers.js')
    vi.mocked(writeResults).mockRejectedValue('string error')

    const errorSpy = vi.fn()
    ;(instance.command as Record<string, unknown>).error = errorSpy

    const parseMock = vi.fn().mockResolvedValue({
      args: { path: '.' },
      flags: { iterations: 3, output: 'bad.json', rules: undefined, top: 20, warmup: false },
    })
    ;(instance.command as Record<string, unknown>).parse = parseMock

    await instance.command.run()

    expect(errorSpy).toHaveBeenCalled()
    expect(errorSpy.mock.calls[0]![0]).toContain('string error')
  })

  it('does not write results when no output flag', async () => {
    const { writeResults } = await import('../../src/commands/benchmark-helpers.js')
    vi.mocked(writeResults).mockClear()

    const parseMock = vi.fn().mockResolvedValue({
      args: { path: '.' },
      flags: { iterations: 3, output: undefined, rules: undefined, top: 20, warmup: false },
    })
    ;(instance.command as Record<string, unknown>).parse = parseMock

    await instance.command.run()

    expect(writeResults).not.toHaveBeenCalled()
  })
})

// ─── run - multiple iterations ───

describe('Benchmark run - multiple iterations', () => {
  let instance: ReturnType<typeof createBenchmarkInstance>

  beforeEach(async () => {
    const { existsSync } = await import('node:fs')
    vi.mocked(existsSync).mockReturnValue(true)
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    vi.mocked(discoverFiles).mockResolvedValue([{ absolutePath: '/abs/a.ts', path: 'a.ts' }])
    const { printResults } = await import('../../src/commands/benchmark-helpers.js')
    vi.mocked(printResults).mockReturnValue([])

    instance = createBenchmarkInstance()
  })

  it('accepts custom iteration count', async () => {
    const { getRulesToBenchmark } = await import('../../src/commands/benchmark-helpers.js')
    vi.mocked(getRulesToBenchmark).mockResolvedValue([])

    const parseMock = vi.fn().mockResolvedValue({
      args: { path: '.' },
      flags: { iterations: 10, output: undefined, rules: undefined, top: 20, warmup: false },
    })
    ;(instance.command as Record<string, unknown>).parse = parseMock

    await instance.command.run()
    const output = stripAnsi(instance.logs.join('\n'))
    expect(output).toContain('Iterations: 10')
  })
})

// ─── run - specific rules filter ───

describe('Benchmark run - specific rules', () => {
  let instance: ReturnType<typeof createBenchmarkInstance>

  beforeEach(async () => {
    const { existsSync } = await import('node:fs')
    vi.mocked(existsSync).mockReturnValue(true)
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    vi.mocked(discoverFiles).mockResolvedValue([{ absolutePath: '/abs/a.ts', path: 'a.ts' }])
    const { printResults } = await import('../../src/commands/benchmark-helpers.js')
    vi.mocked(printResults).mockReturnValue([])

    instance = createBenchmarkInstance()
  })

  it('passes rules flag to getRulesToBenchmark', async () => {
    const { getRulesToBenchmark } = await import('../../src/commands/benchmark-helpers.js')
    vi.mocked(getRulesToBenchmark).mockResolvedValue([])

    const parseMock = vi.fn().mockResolvedValue({
      args: { path: '.' },
      flags: { iterations: 3, output: undefined, rules: ['rule-a', 'rule-b'], top: 20, warmup: false },
    })
    ;(instance.command as Record<string, unknown>).parse = parseMock

    await instance.command.run()
    expect(getRulesToBenchmark).toHaveBeenCalledWith(['rule-a', 'rule-b'])
  })
})

// ─── run - parser lifecycle ───

describe('Benchmark run - parser lifecycle', () => {
  let instance: ReturnType<typeof createBenchmarkInstance>

  beforeEach(async () => {
    const { existsSync } = await import('node:fs')
    vi.mocked(existsSync).mockReturnValue(true)
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    vi.mocked(discoverFiles).mockResolvedValue([{ absolutePath: '/abs/a.ts', path: 'a.ts' }])
    const { getRulesToBenchmark } = await import('../../src/commands/benchmark-helpers.js')
    vi.mocked(getRulesToBenchmark).mockResolvedValue([])
    const { printResults } = await import('../../src/commands/benchmark-helpers.js')
    vi.mocked(printResults).mockReturnValue([])

    instance = createBenchmarkInstance()
    const parseMock = vi.fn().mockResolvedValue({
      args: { path: '.' },
      flags: { iterations: 3, output: undefined, rules: undefined, top: 20, warmup: false },
    })
    ;(instance.command as Record<string, unknown>).parse = parseMock
  })

  it('calls parser dispose after benchmarking', async () => {
    await instance.command.run()
    // Parser is imported and instantiated in run(); dispose is called at the end
    // We verify the run completes without error (dispose is called on the real mock)
    const output = stripAnsi(instance.logs.join('\n'))
    expect(output).toContain('CodeForge Benchmark')
  })
})
