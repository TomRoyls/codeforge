import { describe, test, expect, beforeEach, vi } from 'vitest'

vi.mock('../../../src/core/file-discovery.js', () => ({
  discoverFiles: vi.fn(),
}))

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
}))

vi.mock('../../../src/core/parser.js', () => ({
  Parser: vi.fn().mockImplementation(function () {
    return {
      initialize: vi.fn().mockResolvedValue(undefined),
      dispose: vi.fn(),
      parseFile: vi.fn().mockResolvedValue({
        sourceFile: {
          getFilePath: () => '/test/file.ts',
          getText: () => 'const x = 1;',
        },
      }),
    }
  }),
}))

vi.mock('../../../src/core/rule-registry.js', () => ({
  RuleRegistry: vi.fn().mockImplementation(function () {
    return {
      register: vi.fn(),
      runRules: vi.fn().mockReturnValue([]),
    }
  }),
}))

vi.mock('../../../src/rules/index.js', () => ({
  allRules: {
    'test-rule-1': {
      meta: { name: 'test-rule-1', description: 'Test rule 1' },
      create: () => ({ visitor: {}, onComplete: () => [] }),
    },
    'test-rule-2': {
      meta: { name: 'test-rule-2', description: 'Test rule 2' },
      create: () => ({ visitor: {}, onComplete: () => [] }),
    },
  },
  getRuleCategory: vi.fn(() => 'patterns'),
}))

describe('Benchmark Command', () => {
  let Benchmark: typeof import('../../../src/commands/benchmark.js').default
  let mockConsoleLog: ReturnType<typeof vi.spyOn>
  let mockDiscoverFiles: ReturnType<typeof vi.fn>
  let mockExistsSync: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()

    mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {})

    const fileDiscovery = await import('../../../src/core/file-discovery.js')
    mockDiscoverFiles = fileDiscovery.discoverFiles as ReturnType<typeof vi.fn>

    const fs = await import('node:fs')
    mockExistsSync = fs.existsSync as ReturnType<typeof vi.fn>

    Benchmark = (await import('../../../src/commands/benchmark.js')).default
  })

  function createCommandWithMockedParse(
    flags: Record<string, unknown>,
    args: Record<string, unknown> = {},
  ) {
    const command = new Benchmark([], {} as never)
    const cmdWithMock = command as unknown as { parse: ReturnType<typeof vi.fn> }
    cmdWithMock.parse = vi.fn().mockResolvedValue({
      args,
      flags,
    })
    return command
  }

  describe('Command metadata', () => {
    test('has correct description', () => {
      expect(Benchmark.description).toBe('Benchmark rule performance on a codebase')
    })

    test('has examples defined', () => {
      expect(Benchmark.examples).toBeDefined()
      expect(Benchmark.examples.length).toBeGreaterThan(0)
    })

    test('has all required flags', () => {
      expect(Benchmark.flags).toBeDefined()
      expect(Benchmark.flags.iterations).toBeDefined()
      expect(Benchmark.flags.output).toBeDefined()
      expect(Benchmark.flags.rules).toBeDefined()
      expect(Benchmark.flags.top).toBeDefined()
      expect(Benchmark.flags.warmup).toBeDefined()
    })

    test('has path argument', () => {
      expect(Benchmark.args).toBeDefined()
      expect(Benchmark.args.path).toBeDefined()
      expect(Benchmark.args.path.default).toBe('.')
    })

    test('iterations flag has default value 3', () => {
      expect(Benchmark.flags.iterations.default).toBe(3)
    })

    test('iterations flag has char i', () => {
      expect(Benchmark.flags.iterations.char).toBe('i')
    })

    test('top flag has default value 20', () => {
      expect(Benchmark.flags.top.default).toBe(20)
    })

    test('top flag has char t', () => {
      expect(Benchmark.flags.top.char).toBe('t')
    })

    test('output flag has char o', () => {
      expect(Benchmark.flags.output.char).toBe('o')
    })

    test('rules flag has char r', () => {
      expect(Benchmark.flags.rules.char).toBe('r')
    })

    test('warmup flag has default true', () => {
      expect(Benchmark.flags.warmup.default).toBe(true)
    })
  })

  describe('run', () => {
    test('errors when path does not exist', async () => {
      mockExistsSync.mockReturnValue(false)

      const cmd = createCommandWithMockedParse(
        {
          iterations: 3,
          output: undefined,
          rules: undefined,
          top: 20,
          warmup: true,
        },
        { path: '/nonexistent' },
      )

      await expect(cmd.run()).rejects.toThrow('Path not found')
    })

    test('handles empty file list', async () => {
      mockExistsSync.mockReturnValue(true)
      mockDiscoverFiles.mockResolvedValue([])

      const cmd = createCommandWithMockedParse(
        {
          iterations: 3,
          output: undefined,
          rules: undefined,
          top: 20,
          warmup: true,
        },
        { path: '.' },
      )

      const cmdAny = cmd as unknown as { exit: ReturnType<typeof vi.fn> }
      cmdAny.exit = vi.fn()

      await cmd.run()
      expect(cmdAny.exit).toHaveBeenCalledWith(0)
    })

    test('discovers files with correct patterns', async () => {
      mockExistsSync.mockReturnValue(true)
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])

      const cmd = createCommandWithMockedParse(
        {
          iterations: 1,
          output: undefined,
          rules: undefined,
          top: 20,
          warmup: false,
        },
        { path: '/test' },
      )

      await cmd.run()

      expect(mockDiscoverFiles).toHaveBeenCalledWith(
        expect.objectContaining({
          cwd: '/test',
          patterns: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
        }),
      )
    })

    test('shows configuration info', async () => {
      mockExistsSync.mockReturnValue(true)
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])

      const cmd = createCommandWithMockedParse(
        {
          iterations: 5,
          output: undefined,
          rules: undefined,
          top: 10,
          warmup: true,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')

      expect(output).toContain('Files: 1')
      expect(output).toContain('Iterations: 5')
      expect(output).toContain('Warmup: enabled')
    })

    test('shows results header', async () => {
      mockExistsSync.mockReturnValue(true)
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])

      const cmd = createCommandWithMockedParse(
        {
          iterations: 1,
          output: undefined,
          rules: undefined,
          top: 20,
          warmup: false,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')

      expect(output).toContain('Results (sorted by average time)')
      expect(output).toContain('Avg (ms)')
      expect(output).toContain('Min (ms)')
      expect(output).toContain('Max (ms)')
    })

    test('shows summary with rule count', async () => {
      mockExistsSync.mockReturnValue(true)
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])

      const cmd = createCommandWithMockedParse(
        {
          iterations: 1,
          output: undefined,
          rules: undefined,
          top: 20,
          warmup: false,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')

      expect(output).toContain('Total rules benchmarked:')
      expect(output).toContain('Slowest rule:')
      expect(output).toContain('Fastest rule:')
    })
  })

  describe('private methods', () => {
    test('getRulesToBenchmark returns all rules when none specified', async () => {
      mockExistsSync.mockReturnValue(true)
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])

      const cmd = createCommandWithMockedParse(
        {
          iterations: 1,
          output: undefined,
          rules: undefined,
          top: 20,
          warmup: false,
        },
        { path: '.' },
      )

      const cmdAny = cmd as unknown as {
        getRulesToBenchmark: (rules: string[] | undefined) => [string, unknown][]
      }
      const result = cmdAny.getRulesToBenchmark(undefined)

      expect(result.length).toBeGreaterThan(0)
    })

    test('getRulesToBenchmark filters by requested rules', async () => {
      mockExistsSync.mockReturnValue(true)
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])

      const cmd = createCommandWithMockedParse(
        {
          iterations: 1,
          output: undefined,
          rules: ['test-rule-1'],
          top: 20,
          warmup: false,
        },
        { path: '.' },
      )

      const cmdAny = cmd as unknown as {
        getRulesToBenchmark: (rules: string[] | undefined) => [string, unknown][]
      }
      const result = cmdAny.getRulesToBenchmark(['test-rule-1'])

      expect(result.length).toBe(1)
      expect(result[0]![0]).toBe('test-rule-1')
    })
  })
})
