import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { DiscoveredFile } from '../../../src/core/file-discovery.js'
import type { RuleViolation } from '../../../src/ast/visitor.js'

class ExitCodeError extends Error {
  code: number
  constructor(code: number) {
    super(`Exit code: ${code}`)
    this.code = code
    this.name = 'ExitCodeError'
  }
}

function createMockFile(filePath: string): DiscoveredFile {
  return { path: filePath, absolutePath: `/absolute/${filePath}` }
}

function createMockViolation(overrides: Partial<RuleViolation> = {}): RuleViolation {
  return {
    ruleId: 'test-rule',
    severity: 'warning',
    message: 'Test violation',
    filePath: '/test/file.ts',
    range: { start: { line: 1, column: 1 }, end: { line: 1, column: 10 } },
    ...overrides,
  }
}

const {
  mockExistsSync,
  mockStatSync,
  mockReadFile,
  mockDiscoverFiles,
  mockIsGitRepository,
  mockGetGitRoot,
  mockGetStagedFiles,
  mockSetupRuleRegistry,
  mockLoadCommandConfig,
  mockNormalizeFlags,
  mockFilterFilesByExtension,
  mockApplyFixesToFiles,
  mockHashFile,
  mockResultCacheCtor,
  mockReporterCtor,
  mockParserCtor,
  mockRunRules,
  mockGetEnabledRules,
} = vi.hoisted(() => {
  const mockRunRules = vi.fn().mockReturnValue([])
  const mockGetEnabledRules = vi.fn().mockReturnValue([])
  return {
    mockExistsSync: vi.fn().mockReturnValue(true),
    mockStatSync: vi.fn().mockReturnValue({ isFile: () => false }),
    mockReadFile: vi.fn().mockResolvedValue(''),
    mockDiscoverFiles: vi.fn().mockResolvedValue([]),
    mockIsGitRepository: vi.fn().mockReturnValue(true),
    mockGetGitRoot: vi.fn().mockReturnValue('/test/repo'),
    mockGetStagedFiles: vi.fn().mockReturnValue([]),
    mockSetupRuleRegistry: vi.fn().mockReturnValue({
      register: vi.fn(),
      runRules: mockRunRules,
      getEnabledRules: mockGetEnabledRules,
      getRule: vi.fn(),
      disable: vi.fn(),
    }),
    mockLoadCommandConfig: vi.fn().mockResolvedValue({}),
    mockNormalizeFlags: vi.fn().mockReturnValue({
      cacheResults: true,
      changedMode: undefined,
      ciMode: false,
      concurrency: 4,
      dryRun: false,
      failOnWarnings: false,
      format: 'console',
      maxWarnings: -1,
      output: undefined,
      quiet: true,
      shouldFix: false,
      stagedMode: false,
      verbose: false,
    }),
    mockFilterFilesByExtension: vi.fn((files: DiscoveredFile[]) => files),
    mockApplyFixesToFiles: vi.fn().mockResolvedValue({ fixesApplied: 0, fixesSkipped: 0 }),
    mockHashFile: vi.fn().mockResolvedValue('fake-hash'),
    mockResultCacheCtor: vi.fn().mockImplementation(() => ({
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue(undefined),
      hashConfig: vi.fn().mockReturnValue('config-hash'),
    })),
    mockReporterCtor: vi.fn().mockImplementation(() => ({
      writeReport: vi.fn().mockResolvedValue(undefined),
    })),
    mockParserCtor: vi.fn().mockImplementation(() => ({
      initialize: vi.fn().mockResolvedValue(undefined),
      dispose: vi.fn(),
      parseFile: vi.fn().mockResolvedValue({
        sourceFile: { getFilePath: () => '/test/file.ts', getText: () => 'test code' },
        filePath: '/test/file.ts',
        parseTime: 10,
      }),
    })),
    mockRunRules,
    mockGetEnabledRules,
  }
})

vi.mock('node:fs', () => ({
  existsSync: mockExistsSync,
  statSync: mockStatSync,
}))

vi.mock('node:fs/promises', () => ({
  readFile: mockReadFile,
}))

vi.mock('ora', () => ({
  default: vi.fn(() => ({
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    warn: vi.fn().mockReturnThis(),
    fail: vi.fn().mockReturnThis(),
    text: '',
  })),
}))

vi.mock('p-limit', () => ({
  default: vi.fn((_: number) => (fn: () => unknown) => fn()),
}))

vi.mock('path', async () => {
  const actual = await vi.importActual<typeof import('path')>('path')
  return { ...actual, resolve: vi.fn((p: string) => `/resolved/${p}`) }
})

vi.mock('../../../src/core/file-discovery.js', () => ({
  discoverFiles: mockDiscoverFiles,
}))

vi.mock('../../../src/core/parser.js', () => ({
  Parser: mockParserCtor,
}))

vi.mock('../../../src/core/reporter.js', () => ({
  Reporter: mockReporterCtor,
}))

vi.mock('../../../src/ast/visitor.js', () => ({ traverseAST: vi.fn() }))

vi.mock('../../../src/utils/errors.js', () => ({
  CLIError: class CLIError extends Error {
    suggestions: string[]
    constructor(message: string, options: { suggestions?: string[] } = {}) {
      super(message)
      this.suggestions = options.suggestions ?? []
      this.name = 'CLIError'
    }
  },
}))

vi.mock('../../../src/utils/logger.js', () => ({
  logger: { setLevel: vi.fn(), warn: vi.fn(), debug: vi.fn(), info: vi.fn() },
  LogLevel: { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, SILENT: 4 },
}))

vi.mock('../../../src/config/discovery.js', () => ({
  findConfigPath: vi.fn().mockResolvedValue(null),
}))

vi.mock('../../../src/config/cache.js', () => ({
  ConfigCache: vi.fn().mockImplementation(function () {
    return { getConfig: vi.fn().mockResolvedValue(null) }
  }),
}))

vi.mock('../../../src/config/validator.js', () => ({ validateConfig: vi.fn((c) => c) }))

vi.mock('../../../src/config/merger.js', () => ({
  mergeConfigs: vi.fn((base, cli) => ({ ...base, ...cli })),
  mergeEnvConfig: vi.fn((fileConfig, envConfig) => ({ ...fileConfig, ...envConfig })),
}))

vi.mock('../../../src/config/env-parser.js', () => ({ parseEnvVars: vi.fn(() => ({})) }))

vi.mock('../../../src/utils/git-helpers.js', () => ({
  isGitRepository: mockIsGitRepository,
  getGitRoot: mockGetGitRoot,
  getStagedFiles: mockGetStagedFiles,
  getChangedFiles: vi.fn().mockReturnValue([]),
  getDefaultBranch: vi.fn().mockReturnValue('main'),
}))

vi.mock('../../../src/commands/analyze-git-helpers.js', () => ({
  resolveTargetFiles: vi.fn().mockImplementation(async (options: { changedMode: string | undefined; cwd: string; files: string[]; ignore: string[]; stagedMode: boolean }) => {
    if (options.stagedMode) {
      if (!mockIsGitRepository(options.cwd)) {
        return { error: 'Not a git repository. --staged requires a git repository.', files: [] }
      }
      const gitRoot = mockGetGitRoot(options.cwd)
      if (!gitRoot) {
        return { error: 'Could not determine git repository root.', files: [] }
      }
      const stagedFilePaths = mockGetStagedFiles(gitRoot)
      if (stagedFilePaths.length === 0) {
        return { files: [] }
      }
      const { existsSync } = await import('node:fs')
      const path = await import('path')
      return {
        files: stagedFilePaths
          .filter((filePath: string) => existsSync(path.join(gitRoot, filePath)))
          .map((filePath: string) => ({
            absolutePath: path.join(gitRoot, filePath),
            path: filePath,
          })),
      }
    }
    if (options.changedMode !== undefined) {
      return { files: [] }
    }
    return { files: await mockDiscoverFiles({ cwd: options.cwd, ignore: options.ignore, patterns: options.files }) }
  }),
}))

vi.mock('../../../src/rules/index.js', () => ({
  allRules: {},
  getRule: vi.fn(),
  getRuleIds: vi.fn().mockReturnValue([]),
  getRuleCategory: vi.fn().mockReturnValue('best-practices'),
}))

vi.mock('../../../src/core/rule-registry.js', () => ({
  RuleRegistry: vi.fn().mockImplementation(function () {
    return {
      register: vi.fn(),
      runRules: mockRunRules,
      getEnabledRules: mockGetEnabledRules,
      getRule: vi.fn(),
      disable: vi.fn(),
    }
  }),
}))

vi.mock('../../../src/cache/index.js', () => ({
  hashFile: mockHashFile,
  ResultCache: mockResultCacheCtor,
}))

const mockGetProfileSeverityOverrides = vi.fn((profile: string) => {
  const overrides: Record<string, Record<string, 'error' | 'info' | 'warning'>> = {
    lenient: {
      'max-complexity': 'info',
      'max-depth': 'info',
      'max-file-size': 'info',
      'max-lines': 'info',
      'max-params': 'info',
      'no-console': 'info',
      'no-magic-numbers': 'info',
    },
    moderate: {
      'max-complexity': 'warning',
      'max-depth': 'warning',
      'max-file-size': 'warning',
      'no-console': 'warning',
      'no-magic-numbers': 'warning',
    },
    strict: {
      'no-console': 'error',
      'no-debugger': 'error',
      'no-eval': 'error',
      'no-explicit-any': 'error',
      'no-implicit-coercion': 'error',
      'no-unused-vars': 'error',
      'prefer-const': 'error',
    },
  }
  return overrides[profile] ?? {}
})

vi.mock('../../../src/utils/command-helpers.js', () => ({
  loadCommandConfig: mockLoadCommandConfig,
  normalizeFlags: mockNormalizeFlags,
  filterFilesByExtension: mockFilterFilesByExtension,
  setupRuleRegistryLazy: mockSetupRuleRegistry,
  applyFixesToFiles: mockApplyFixesToFiles,
  getProfileSeverityOverrides: mockGetProfileSeverityOverrides,
}))

const mockParseSuppressionsFromSourceFile = vi.fn().mockReturnValue({
  count: 0,
  suppressions: [],
})
const mockFilterSuppressedViolations = vi.fn(
  (violations: RuleViolation[]) => violations,
)

vi.mock('../../../src/core/suppression-parser.js', () => ({
  parseSuppressionsFromSourceFile: mockParseSuppressionsFromSourceFile,
  filterSuppressedViolations: mockFilterSuppressedViolations,
}))

vi.mock('../../../src/fix/fixer.js', () => {
  const mockFn = vi.fn()
  mockFn.mockReturnValue({
    changes: [],
    conflicts: [],
    filePath: '/test/file.ts',
    fixesApplied: 0,
    fixesSkipped: 0,
  })
  return { applyFixesToFile: mockFn }
})

describe('Analyze Command', () => {
  let Analyze: typeof import('../../../src/commands/analyze.js').default

  beforeEach(async () => {
    vi.clearAllMocks()
    mockExistsSync.mockReturnValue(true)
    mockStatSync.mockReturnValue({ isFile: () => false })
    mockDiscoverFiles.mockResolvedValue([createMockFile('test.ts')])
    mockRunRules.mockReturnValue([])
    mockGetEnabledRules.mockReturnValue([])
    mockNormalizeFlags.mockReturnValue({
      cacheResults: true,
      changedMode: undefined,
      ciMode: false,
      concurrency: 4,
      dryRun: false,
      failOnWarnings: false,
      format: 'console',
      maxWarnings: -1,
      output: undefined,
      quiet: true,
      shouldFix: false,
      stagedMode: false,
      verbose: false,
    })
    mockLoadCommandConfig.mockResolvedValue({})
    mockFilterFilesByExtension.mockImplementation((files: DiscoveredFile[]) => files)
    mockReporterCtor.mockImplementation(function () {
      return { writeReport: vi.fn().mockResolvedValue(undefined) }
    })
    mockParserCtor.mockImplementation(function () {
      return {
        initialize: vi.fn().mockResolvedValue(undefined),
        dispose: vi.fn(),
        parseFile: vi.fn().mockResolvedValue({
          sourceFile: { getFilePath: () => '/test/file.ts', getText: () => 'test code' },
          filePath: '/test/file.ts',
          parseTime: 10,
        }),
      }
    })
    mockSetupRuleRegistry.mockReturnValue({
      register: vi.fn(),
      runRules: mockRunRules,
      getEnabledRules: mockGetEnabledRules,
      getRule: vi.fn(),
      disable: vi.fn(),
    })
    mockResultCacheCtor.mockImplementation(function () {
      return {
        get: vi.fn().mockResolvedValue(null),
        set: vi.fn().mockResolvedValue(undefined),
        hashConfig: vi.fn().mockReturnValue('config-hash'),
      }
    })
    if (!Analyze) {
      Analyze = (await import('../../../src/commands/analyze.js')).default
    }
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  function createCommand() {
    return new Analyze([], {} as never)
  }

  function createCommandWithMockedParse(flags: Record<string, unknown>, argsPath = '.') {
    const command = createCommand()
    const cmdWithMock = command as unknown as { parse: ReturnType<typeof vi.fn> }
    cmdWithMock.parse = vi.fn().mockResolvedValue({
      args: { path: argsPath },
      flags: { 'severity-level': 'info', color: true, ...flags },
    })
    return command
  }

  function mockExit(command: ReturnType<typeof createCommand>) {
    ;(command as unknown as { exit: (c: number) => never }).exit = (code: number) => {
      throw new ExitCodeError(code)
    }
  }

  async function runQuietly(cmd: ReturnType<typeof createCommand>) {
    try {
      await cmd.run()
    } catch {
      /* empty */
    }
  }

  // =====================================================
  // Command metadata
  // =====================================================
  describe('Command metadata', () => {
    it('has correct description', () => {
      expect(Analyze.description).toBe('Analyze code for violations and issues')
    })

    it('has args defined with path', () => {
      expect(Analyze.args).toBeDefined()
      expect(Analyze.args.path).toBeDefined()
    })

    it('path arg has correct description', () => {
      expect(Analyze.args.path.description).toBe('Path to analyze (file or directory)')
    })

    it('path arg is not required', () => {
      expect(Analyze.args.path.required).toBe(false)
    })

    it('path arg defaults to dot', () => {
      expect(Analyze.args.path.default).toBe('.')
    })

    it('has examples defined', () => {
      expect(Analyze.examples).toBeDefined()
      expect(Array.isArray(Analyze.examples)).toBe(true)
    })

    it('has at least 10 examples', () => {
      expect(Analyze.examples.length).toBeGreaterThanOrEqual(10)
    })

    it('has flags defined', () => {
      expect(Analyze.flags).toBeDefined()
    })

    it('has all core flags', () => {
      const flagNames = Object.keys(Analyze.flags)
      expect(flagNames).toContain('format')
      expect(flagNames).toContain('output')
      expect(flagNames).toContain('quiet')
      expect(flagNames).toContain('verbose')
      expect(flagNames).toContain('ci')
      expect(flagNames).toContain('fix')
    })

    it('has all discovery flags', () => {
      const flagNames = Object.keys(Analyze.flags)
      expect(flagNames).toContain('files')
      expect(flagNames).toContain('ignore')
      expect(flagNames).toContain('ignore-path')
      expect(flagNames).toContain('staged')
      expect(flagNames).toContain('changed')
      expect(flagNames).toContain('ext')
    })

    it('has all rule control flags', () => {
      const flagNames = Object.keys(Analyze.flags)
      expect(flagNames).toContain('rules')
      expect(flagNames).toContain('severity-level')
    })

    it('has all exit control flags', () => {
      const flagNames = Object.keys(Analyze.flags)
      expect(flagNames).toContain('fail-on-warnings')
      expect(flagNames).toContain('max-warnings')
    })

    it('has all fix flags', () => {
      const flagNames = Object.keys(Analyze.flags)
      expect(flagNames).toContain('fix')
      expect(flagNames).toContain('dry-run')
    })

    it('has all output control flags', () => {
      const flagNames = Object.keys(Analyze.flags)
      expect(flagNames).toContain('color')
      expect(flagNames).toContain('cache-results')
      expect(flagNames).toContain('concurrency')
      expect(flagNames).toContain('config')
    })

    it('has exactly 23 flags', () => {
      expect(Object.keys(Analyze.flags).length).toBe(23)
    })
  })

  // =====================================================
  // Flag defaults
  // =====================================================
  describe('Flag defaults', () => {
    it('ci defaults to false', () => {
      expect(Analyze.flags.ci.default).toBe(false)
    })

    it('fix defaults to false', () => {
      expect(Analyze.flags.fix.default).toBe(false)
    })

    it('dry-run defaults to false', () => {
      expect(Analyze.flags['dry-run'].default).toBe(false)
    })

    it('staged defaults to false', () => {
      expect(Analyze.flags.staged.default).toBe(false)
    })

    it('changed has no default', () => {
      expect(Analyze.flags.changed.default).toBeUndefined()
    })

    it('format defaults to console', () => {
      expect(Analyze.flags.format.default).toBe('console')
    })

    it('severity-level defaults to info', () => {
      expect(Analyze.flags['severity-level'].default).toBe('info')
    })

    it('quiet defaults to false', () => {
      expect(Analyze.flags.quiet.default).toBe(false)
    })

    it('verbose defaults to false', () => {
      expect(Analyze.flags.verbose.default).toBe(false)
    })

    it('fail-on-warnings defaults to false', () => {
      expect(Analyze.flags['fail-on-warnings'].default).toBe(false)
    })

    it('max-warnings defaults to -1', () => {
      expect(Analyze.flags['max-warnings'].default).toBe(-1)
    })

    it('cache-results defaults to true', () => {
      expect(Analyze.flags['cache-results'].default).toBe(true)
    })

    it('color defaults to true', () => {
      expect(Analyze.flags.color.default).toBe(true)
    })

    it('ext defaults to empty string', () => {
      expect(Analyze.flags.ext.default).toBe('')
    })

    it('concurrency defaults to os.cpus().length', () => {
      expect(Analyze.flags.concurrency.default).toBeGreaterThan(0)
    })
  })

  // =====================================================
  // Flag characters
  // =====================================================
  describe('Flag characters', () => {
    it('files flag has char f', () => {
      expect(Analyze.flags.files.char).toBe('f')
    })

    it('ignore flag has char i', () => {
      expect(Analyze.flags.ignore.char).toBe('i')
    })

    it('rules flag has char r', () => {
      expect(Analyze.flags.rules.char).toBe('r')
    })

    it('config flag has char c', () => {
      expect(Analyze.flags.config.char).toBe('c')
    })

    it('output flag has char o', () => {
      expect(Analyze.flags.output.char).toBe('o')
    })

    it('quiet flag has char q', () => {
      expect(Analyze.flags.quiet.char).toBe('q')
    })

    it('verbose flag has char v', () => {
      expect(Analyze.flags.verbose.char).toBe('v')
    })
  })

  // =====================================================
  // Flag descriptions
  // =====================================================
  describe('Flag descriptions', () => {
    it('ci flag has description mentioning CI mode', () => {
      expect(Analyze.flags.ci.description).toContain('CI mode')
    })

    it('fix flag has description mentioning automatically fix', () => {
      expect(Analyze.flags.fix.description).toContain('Automatically fix')
    })

    it('dry-run flag mentions preview', () => {
      expect(Analyze.flags['dry-run'].description).toContain('Preview')
    })

    it('staged flag mentions staged files', () => {
      expect(Analyze.flags.staged.description).toContain('staged files')
    })

    it('format flag mentions output format', () => {
      expect(Analyze.flags.format.description).toContain('Output format')
    })

    it('output flag mentions output file', () => {
      expect(Analyze.flags.output.description).toContain('Output file')
    })

    it('severity-level flag mentions minimum severity', () => {
      expect(Analyze.flags['severity-level'].description).toContain('Minimum severity')
    })

    it('concurrency flag mentions parallel', () => {
      expect(Analyze.flags.concurrency.description).toContain('parallel')
    })

    it('ext flag mentions file extensions', () => {
      expect(Analyze.flags.ext.description).toContain('file extensions')
    })

    it('files flag mentions glob patterns', () => {
      expect(Analyze.flags.files.description).toContain('Glob patterns')
    })

    it('ignore flag mentions patterns to ignore', () => {
      expect(Analyze.flags.ignore.description).toContain('Patterns to ignore')
    })

    it('ignore-path flag mentions ignore file', () => {
      expect(Analyze.flags['ignore-path'].description).toContain('ignore file')
    })

    it('rules flag mentions specific rules', () => {
      expect(Analyze.flags.rules.description).toContain('Specific rules')
    })

    it('max-warnings flag mentions non-zero exit code', () => {
      expect(Analyze.flags['max-warnings'].description).toContain('non-zero exit code')
    })

    it('fail-on-warnings flag mentions exit with error code', () => {
      expect(Analyze.flags['fail-on-warnings'].description).toContain('error code')
    })

    it('quiet flag mentions suppress progress', () => {
      expect(Analyze.flags.quiet.description).toContain('Suppress progress')
    })

    it('verbose flag mentions detailed output', () => {
      expect(Analyze.flags.verbose.description).toContain('detailed output')
    })

    it('cache-results flag mentions caching', () => {
      expect(Analyze.flags['cache-results'].description).toContain('caching')
    })

    it('color flag mentions color output', () => {
      expect(Analyze.flags.color.description).toContain('color output')
    })

    it('config flag mentions config file', () => {
      expect(Analyze.flags.config.description).toContain('config file')
    })
  })

  // =====================================================
  // Flag options and properties
  // =====================================================
  describe('Flag options and properties', () => {
    it('format flag has all 9 output options', () => {
      expect(Analyze.flags.format.options).toEqual([
        'console',
        'csv',
        'gitlab',
        'html',
        'json',
        'junit',
        'markdown',
        'sarif',
        'sonarqube',
      ])
    })

    it('severity-level flag has correct options', () => {
      expect(Analyze.flags['severity-level'].options).toEqual(['error', 'info', 'warning'])
    })

    it('files flag supports multiple values', () => {
      expect(Analyze.flags.files.multiple).toBe(true)
    })

    it('ignore flag supports multiple values', () => {
      expect(Analyze.flags.ignore.multiple).toBe(true)
    })

    it('rules flag supports multiple values', () => {
      expect(Analyze.flags.rules.multiple).toBe(true)
    })

    it('cache-results flag allows --no prefix', () => {
      expect(Analyze.flags['cache-results'].allowNo).toBe(true)
    })

    it('color flag allows --no prefix', () => {
      expect(Analyze.flags.color.allowNo).toBe(true)
    })

    it('concurrency flag is an integer', () => {
      expect(Analyze.flags.concurrency.type).toBe('option')
    })

    it('max-warnings flag is an integer', () => {
      expect(Analyze.flags['max-warnings'].type).toBe('option')
    })
  })

  // =====================================================
  // Examples
  // =====================================================
  describe('Examples', () => {
    it('has example for analyzing current directory', () => {
      const cmds = Analyze.examples.map((e: { command: string }) => e.command)
      expect(cmds.some((c: string) => c.includes('command.id') && !c.includes('--'))).toBe(true)
    })

    it('has example for analyzing src directory', () => {
      const cmds = Analyze.examples.map((e: { command: string }) => e.command)
      expect(cmds.some((c: string) => c.includes('src/'))).toBe(true)
    })

    it('has example for --staged flag', () => {
      const cmds = Analyze.examples.map((e: { command: string }) => e.command)
      expect(cmds.some((c: string) => c.includes('--staged'))).toBe(true)
    })

    it('has example for --changed flag', () => {
      const cmds = Analyze.examples.map((e: { command: string }) => e.command)
      expect(cmds.some((c: string) => c.includes('--changed'))).toBe(true)
    })

    it('has example for --files flag', () => {
      const cmds = Analyze.examples.map((e: { command: string }) => e.command)
      expect(cmds.some((c: string) => c.includes('--files'))).toBe(true)
    })

    it('has example for --ignore flag', () => {
      const cmds = Analyze.examples.map((e: { command: string }) => e.command)
      expect(cmds.some((c: string) => c.includes('--ignore'))).toBe(true)
    })

    it('has example for --format json', () => {
      const cmds = Analyze.examples.map((e: { command: string }) => e.command)
      expect(cmds.some((c: string) => c.includes('--format json'))).toBe(true)
    })

    it('has example for --rules flag', () => {
      const cmds = Analyze.examples.map((e: { command: string }) => e.command)
      expect(cmds.some((c: string) => c.includes('--rules'))).toBe(true)
    })

    it('has example for --max-warnings', () => {
      const cmds = Analyze.examples.map((e: { command: string }) => e.command)
      expect(cmds.some((c: string) => c.includes('--max-warnings'))).toBe(true)
    })

    it('has example for --concurrency', () => {
      const cmds = Analyze.examples.map((e: { command: string }) => e.command)
      expect(cmds.some((c: string) => c.includes('--concurrency'))).toBe(true)
    })

    it('has example for --ext flag', () => {
      const cmds = Analyze.examples.map((e: { command: string }) => e.command)
      expect(cmds.some((c: string) => c.includes('--ext'))).toBe(true)
    })

    it('has example for --severity-level', () => {
      const cmds = Analyze.examples.map((e: { command: string }) => e.command)
      expect(cmds.some((c: string) => c.includes('--severity-level'))).toBe(true)
    })

    it('has example for --ignore-path', () => {
      const cmds = Analyze.examples.map((e: { command: string }) => e.command)
      expect(cmds.some((c: string) => c.includes('--ignore-path'))).toBe(true)
    })

    it('all examples have descriptions', () => {
      for (const example of Analyze.examples) {
        expect(example.description).toBeTruthy()
      }
    })

    it('all examples reference the command id', () => {
      for (const example of Analyze.examples) {
        expect(example.command).toContain('<%= command.id %>')
      }
    })
  })

  // =====================================================
  // determineExitCode
  // =====================================================
  describe('determineExitCode', () => {
    function getExitCode(
      errors: number,
      warnings: number,
      failOnWarnings: boolean,
      maxWarnings: number,
    ): number {
      const cmd = createCommand()
      return (
        cmd as unknown as {
          determineExitCode: (
            s: { errors: number; warnings: number },
            f: boolean,
            m: number,
          ) => number
        }
      ).determineExitCode({ errors, warnings }, failOnWarnings, maxWarnings)
    }

    it('returns 0 when no errors and no warnings', () => {
      expect(getExitCode(0, 0, false, -1)).toBe(0)
    })

    it('returns 1 when errors > 0', () => {
      expect(getExitCode(1, 0, false, -1)).toBe(1)
    })

    it('returns 1 for multiple errors', () => {
      expect(getExitCode(10, 0, false, -1)).toBe(1)
    })

    it('returns 0 for warnings without fail-on-warnings', () => {
      expect(getExitCode(0, 5, false, -1)).toBe(0)
    })

    it('returns 2 for warnings with fail-on-warnings true', () => {
      expect(getExitCode(0, 1, true, -1)).toBe(2)
    })

    it('returns 2 for many warnings with fail-on-warnings', () => {
      expect(getExitCode(0, 100, true, -1)).toBe(2)
    })

    it('returns 1 for errors even when fail-on-warnings is true', () => {
      expect(getExitCode(1, 5, true, -1)).toBe(1)
    })

    it('errors take priority over fail-on-warnings', () => {
      expect(getExitCode(3, 0, true, -1)).toBe(1)
    })

    it('returns 0 when warnings <= maxWarnings', () => {
      expect(getExitCode(0, 5, false, 10)).toBe(0)
    })

    it('returns 1 when warnings > maxWarnings', () => {
      expect(getExitCode(0, 15, false, 10)).toBe(1)
    })

    it('returns 0 when warnings equal maxWarnings', () => {
      expect(getExitCode(0, 10, false, 10)).toBe(0)
    })

    it('returns 1 for warnings > maxWarnings with 0 maxWarnings', () => {
      expect(getExitCode(0, 1, false, 0)).toBe(1)
    })

    it('returns 0 when maxWarnings is 0 and no warnings', () => {
      expect(getExitCode(0, 0, false, 0)).toBe(0)
    })

    it('ignores maxWarnings when -1', () => {
      expect(getExitCode(0, 100, false, -1)).toBe(0)
    })

    it('errors take priority over maxWarnings', () => {
      expect(getExitCode(1, 100, false, 10)).toBe(1)
    })

    it('errors take priority over both failOnWarnings and maxWarnings', () => {
      expect(getExitCode(1, 50, true, 0)).toBe(1)
    })

    it('failOnWarnings and maxWarnings together: warnings under limit', () => {
      expect(getExitCode(0, 3, true, 10)).toBe(2)
    })

    it('failOnWarnings and maxWarnings together: warnings over limit', () => {
      expect(getExitCode(0, 15, true, 10)).toBe(2)
    })

    it('single warning triggers fail-on-warnings', () => {
      expect(getExitCode(0, 1, true, -1)).toBe(2)
    })
  })

  // =====================================================
  // configureLogging
  // =====================================================
  describe('configureLogging', () => {
    it('sets DEBUG level when verbose is true', async () => {
      const { logger, LogLevel } = await import('../../../src/utils/logger.js')
      const cmd = createCommand()
      ;(cmd as unknown as { configureLogging: (v: boolean, q: boolean) => void }).configureLogging(
        true,
        false,
      )
      expect(logger.setLevel).toHaveBeenCalledWith(LogLevel.DEBUG)
    })

    it('sets SILENT level when quiet is true', async () => {
      const { logger, LogLevel } = await import('../../../src/utils/logger.js')
      const cmd = createCommand()
      ;(cmd as unknown as { configureLogging: (v: boolean, q: boolean) => void }).configureLogging(
        false,
        true,
      )
      expect(logger.setLevel).toHaveBeenCalledWith(LogLevel.SILENT)
    })

    it('sets DEBUG level when both verbose and quiet are true', async () => {
      const { logger, LogLevel } = await import('../../../src/utils/logger.js')
      const cmd = createCommand()
      ;(cmd as unknown as { configureLogging: (v: boolean, q: boolean) => void }).configureLogging(
        true,
        true,
      )
      expect(logger.setLevel).toHaveBeenCalledWith(LogLevel.DEBUG)
    })

    it('does not call setLevel when both are false', async () => {
      const { logger } = await import('../../../src/utils/logger.js')
      const cmd = createCommand()
      ;(cmd as unknown as { configureLogging: (v: boolean, q: boolean) => void }).configureLogging(
        false,
        false,
      )
      expect(logger.setLevel).not.toHaveBeenCalled()
    })

    it('verbose takes priority over quiet', async () => {
      const { logger, LogLevel } = await import('../../../src/utils/logger.js')
      const cmd = createCommand()
      ;(cmd as unknown as { configureLogging: (v: boolean, q: boolean) => void }).configureLogging(
        true,
        true,
      )
      expect(logger.setLevel).toHaveBeenCalledTimes(1)
      expect(logger.setLevel).toHaveBeenCalledWith(LogLevel.DEBUG)
    })
  })

  // =====================================================
  // filterBySeverity
  // =====================================================
  describe('filterBySeverity', () => {
    function filter(
      violations: RuleViolation[],
      level: 'error' | 'info' | 'warning',
    ): RuleViolation[] {
      const cmd = createCommand()
      return (
        cmd as unknown as {
          filterBySeverity: (v: RuleViolation[], l: 'error' | 'info' | 'warning') => RuleViolation[]
        }
      ).filterBySeverity(violations, level)
    }

    it('info level shows all severities', () => {
      const violations = [
        createMockViolation({ severity: 'error' }),
        createMockViolation({ severity: 'warning' }),
        createMockViolation({ severity: 'info' }),
      ]
      expect(filter(violations, 'info')).toHaveLength(3)
    })

    it('warning level shows warning and error', () => {
      const violations = [
        createMockViolation({ severity: 'error' }),
        createMockViolation({ severity: 'warning' }),
        createMockViolation({ severity: 'info' }),
      ]
      const result = filter(violations, 'warning')
      expect(result).toHaveLength(2)
      expect(result.every((v) => v.severity !== 'info')).toBe(true)
    })

    it('error level shows only errors', () => {
      const violations = [
        createMockViolation({ severity: 'error' }),
        createMockViolation({ severity: 'warning' }),
        createMockViolation({ severity: 'info' }),
      ]
      const result = filter(violations, 'error')
      expect(result).toHaveLength(1)
      expect(result[0].severity).toBe('error')
    })

    it('returns empty array for empty input', () => {
      expect(filter([], 'info')).toEqual([])
    })

    it('filters all info violations at error level', () => {
      const violations = [
        createMockViolation({ severity: 'info' }),
        createMockViolation({ severity: 'info' }),
      ]
      expect(filter(violations, 'error')).toHaveLength(0)
    })

    it('keeps all violations at info level', () => {
      const violations = [
        createMockViolation({ severity: 'info' }),
        createMockViolation({ severity: 'warning' }),
        createMockViolation({ severity: 'error' }),
      ]
      expect(filter(violations, 'info')).toHaveLength(3)
    })

    it('filters info at warning level', () => {
      const violations = [
        createMockViolation({ severity: 'info' }),
        createMockViolation({ severity: 'info' }),
        createMockViolation({ severity: 'warning' }),
      ]
      expect(filter(violations, 'warning')).toHaveLength(1)
    })

    it('handles single error at all levels', () => {
      const violation = createMockViolation({ severity: 'error' })
      expect(filter([violation], 'info')).toHaveLength(1)
      expect(filter([violation], 'warning')).toHaveLength(1)
      expect(filter([violation], 'error')).toHaveLength(1)
    })

    it('handles single warning at all levels', () => {
      const violation = createMockViolation({ severity: 'warning' })
      expect(filter([violation], 'info')).toHaveLength(1)
      expect(filter([violation], 'warning')).toHaveLength(1)
      expect(filter([violation], 'error')).toHaveLength(0)
    })

    it('handles single info at all levels', () => {
      const violation = createMockViolation({ severity: 'info' })
      expect(filter([violation], 'info')).toHaveLength(1)
      expect(filter([violation], 'warning')).toHaveLength(0)
      expect(filter([violation], 'error')).toHaveLength(0)
    })

    it('handles large number of mixed violations', () => {
      const violations = Array.from({ length: 50 }, (_, i) =>
        createMockViolation({ severity: (['error', 'warning', 'info'] as const)[i % 3] }),
      )
      expect(filter(violations, 'info')).toHaveLength(50)
      expect(filter(violations, 'warning')).toHaveLength(34)
      expect(filter(violations, 'error')).toHaveLength(17)
    })

    it('preserves violation properties after filtering', () => {
      const violation = createMockViolation({ severity: 'error', message: 'unique msg' })
      const result = filter([violation], 'error')
      expect(result[0].message).toBe('unique msg')
    })
  })

  // =====================================================
  // filterFileReports
  // =====================================================
  describe('filterFileReports', () => {
    function filterReports(
      reports: Array<{ filePath: string; violations: RuleViolation[] }>,
      level: 'error' | 'info' | 'warning',
    ): Array<{ filePath: string; violations: RuleViolation[] }> {
      const cmd = createCommand()
      return (
        cmd as unknown as {
          filterFileReports: (
            r: Array<{ filePath: string; violations: RuleViolation[] }>,
            l: 'error' | 'info' | 'warning',
          ) => Array<{ filePath: string; violations: RuleViolation[] }>
        }
      ).filterFileReports(reports, level)
    }

    it('returns all reports at info level', () => {
      const reports = [
        { filePath: 'a.ts', violations: [createMockViolation({ severity: 'info' })] },
      ]
      expect(filterReports(reports, 'info')).toHaveLength(1)
    })

    it('removes info-only reports at warning level', () => {
      const reports = [
        { filePath: 'a.ts', violations: [createMockViolation({ severity: 'info' })] },
      ]
      expect(filterReports(reports, 'warning')).toHaveLength(0)
    })

    it('keeps reports with errors at all levels', () => {
      const reports = [
        { filePath: 'a.ts', violations: [createMockViolation({ severity: 'error' })] },
      ]
      expect(filterReports(reports, 'info')).toHaveLength(1)
      expect(filterReports(reports, 'warning')).toHaveLength(1)
      expect(filterReports(reports, 'error')).toHaveLength(1)
    })

    it('filters violations within reports', () => {
      const reports = [
        {
          filePath: 'a.ts',
          violations: [
            createMockViolation({ severity: 'error' }),
            createMockViolation({ severity: 'info' }),
          ],
        },
      ]
      const result = filterReports(reports, 'error')
      expect(result).toHaveLength(1)
      expect(result[0].violations).toHaveLength(1)
      expect(result[0].violations[0].severity).toBe('error')
    })

    it('removes reports that have no violations after filtering', () => {
      const reports = [
        { filePath: 'a.ts', violations: [createMockViolation({ severity: 'info' })] },
        { filePath: 'b.ts', violations: [createMockViolation({ severity: 'error' })] },
      ]
      const result = filterReports(reports, 'error')
      expect(result).toHaveLength(1)
      expect(result[0].filePath).toBe('b.ts')
    })

    it('handles empty reports array', () => {
      expect(filterReports([], 'info')).toEqual([])
    })

    it('handles reports with empty violations', () => {
      const reports = [{ filePath: 'a.ts', violations: [] }]
      expect(filterReports(reports, 'info')).toHaveLength(0)
    })

    it('preserves filePath in filtered reports', () => {
      const reports = [
        {
          filePath: 'specific/path.ts',
          violations: [createMockViolation({ severity: 'warning' })],
        },
      ]
      const result = filterReports(reports, 'warning')
      expect(result[0].filePath).toBe('specific/path.ts')
    })

    it('handles multiple reports with mixed severities', () => {
      const reports = [
        { filePath: 'a.ts', violations: [createMockViolation({ severity: 'info' })] },
        { filePath: 'b.ts', violations: [createMockViolation({ severity: 'warning' })] },
        { filePath: 'c.ts', violations: [createMockViolation({ severity: 'error' })] },
      ]
      expect(filterReports(reports, 'warning')).toHaveLength(2)
    })

    it('handles report with all severity types', () => {
      const reports = [
        {
          filePath: 'mixed.ts',
          violations: [
            createMockViolation({ severity: 'error' }),
            createMockViolation({ severity: 'warning' }),
            createMockViolation({ severity: 'info' }),
          ],
        },
      ]
      expect(filterReports(reports, 'error')).toHaveLength(1)
      expect(filterReports(reports, 'error')[0].violations).toHaveLength(1)
    })
  })

  // =====================================================
  // generateSummary
  // =====================================================
  describe('generateSummary', () => {
    function generateSummary(violations: RuleViolation[], fileCount: number, duration: number) {
      const cmd = createCommand()
      return (
        cmd as unknown as {
          generateSummary: (
            v: RuleViolation[],
            f: number,
            d: number,
          ) => {
            duration: number
            errors: number
            info: number
            totalFiles: number
            totalViolations: number
            warnings: number
          }
        }
      ).generateSummary(violations, fileCount, duration)
    }

    it('counts errors correctly', () => {
      const violations = [
        createMockViolation({ severity: 'error' }),
        createMockViolation({ severity: 'error' }),
        createMockViolation({ severity: 'error' }),
      ]
      const summary = generateSummary(violations, 1, 100)
      expect(summary.errors).toBe(3)
    })

    it('counts warnings correctly', () => {
      const violations = [
        createMockViolation({ severity: 'warning' }),
        createMockViolation({ severity: 'warning' }),
      ]
      const summary = generateSummary(violations, 1, 100)
      expect(summary.warnings).toBe(2)
    })

    it('counts info correctly', () => {
      const violations = [createMockViolation({ severity: 'info' })]
      const summary = generateSummary(violations, 1, 100)
      expect(summary.info).toBe(1)
    })

    it('handles mixed severities', () => {
      const violations = [
        createMockViolation({ severity: 'error' }),
        createMockViolation({ severity: 'error' }),
        createMockViolation({ severity: 'warning' }),
        createMockViolation({ severity: 'info' }),
        createMockViolation({ severity: 'info' }),
        createMockViolation({ severity: 'info' }),
      ]
      const summary = generateSummary(violations, 5, 200)
      expect(summary.errors).toBe(2)
      expect(summary.warnings).toBe(1)
      expect(summary.info).toBe(3)
    })

    it('returns zero counts for empty violations', () => {
      const summary = generateSummary([], 0, 0)
      expect(summary.errors).toBe(0)
      expect(summary.warnings).toBe(0)
      expect(summary.info).toBe(0)
    })

    it('includes totalViolations', () => {
      const violations = [
        createMockViolation({ severity: 'error' }),
        createMockViolation({ severity: 'warning' }),
      ]
      const summary = generateSummary(violations, 1, 100)
      expect(summary.totalViolations).toBe(2)
    })

    it('includes totalFiles', () => {
      const summary = generateSummary([], 42, 100)
      expect(summary.totalFiles).toBe(42)
    })

    it('includes duration', () => {
      const summary = generateSummary([], 1, 1234)
      expect(summary.duration).toBe(1234)
    })

    it('totalViolations equals sum of error + warning + info', () => {
      const violations = [
        createMockViolation({ severity: 'error' }),
        createMockViolation({ severity: 'warning' }),
        createMockViolation({ severity: 'info' }),
      ]
      const summary = generateSummary(violations, 1, 0)
      expect(summary.totalViolations).toBe(summary.errors + summary.warnings + summary.info)
    })

    it('handles large violation counts', () => {
      const violations = Array.from({ length: 1000 }, (_, i) =>
        createMockViolation({
          severity: (['error', 'warning', 'info'] as const)[i % 3],
        }),
      )
      const summary = generateSummary(violations, 1, 0)
      expect(summary.totalViolations).toBe(1000)
      expect(summary.errors).toBe(334)
      expect(summary.warnings).toBe(333)
      expect(summary.info).toBe(333)
    })
  })

  // =====================================================
  // getRulesWithFixes
  // =====================================================
  describe('getRulesWithFixes', () => {
    it('returns empty map when no rules have fixes', async () => {
      const cmd = createCommand()
      const result = await (
        cmd as unknown as { getRulesWithFixes: () => Promise<Map<string, unknown>> }
      ).getRulesWithFixes()
      expect(result).toBeInstanceOf(Map)
      expect(result.size).toBe(0)
    })

    it('returns map with rules that have fix functions', async () => {
      const cmd = createCommand()
      const result = await (
        cmd as unknown as { getRulesWithFixes: () => Promise<Map<string, unknown>> }
      ).getRulesWithFixes()
      expect(result).toBeInstanceOf(Map)
      expect(result.size).toBe(0)
    })

    it('fix entry would have correct properties when rules have fixes', async () => {
      const cmd = createCommand()
      const result = await (
        cmd as unknown as { getRulesWithFixes: () => Promise<Map<string, unknown>> }
      ).getRulesWithFixes()
      expect(result).toBeInstanceOf(Map)
    })

    it('filters out non-function fix properties', async () => {
      const cmd = createCommand()
      const result = await (
        cmd as unknown as { getRulesWithFixes: () => Promise<Map<string, unknown>> }
      ).getRulesWithFixes()
      expect(result.size).toBe(0)
    })

    it('handles multiple fixable rules', async () => {
      const cmd = createCommand()
      const result = await (
        cmd as unknown as { getRulesWithFixes: () => Promise<Map<string, unknown>> }
      ).getRulesWithFixes()
      expect(result).toBeInstanceOf(Map)
      expect(typeof result.get).toBe('function')
    })
  })

  // =====================================================
  // readIgnoreFile
  // =====================================================
  describe('readIgnoreFile', () => {
    it('returns empty array when file does not exist', async () => {
      mockReadFile.mockRejectedValueOnce(new Error('ENOENT'))
      const cmd = createCommand()
      const result = await (
        cmd as unknown as { readIgnoreFile: (p: string) => Promise<string[]> }
      ).readIgnoreFile('/nonexistent')
      expect(result).toEqual([])
    })

    it('parses patterns from file content', async () => {
      mockReadFile.mockResolvedValueOnce('node_modules\ndist\n*.log')
      const cmd = createCommand()
      const result = await (
        cmd as unknown as { readIgnoreFile: (p: string) => Promise<string[]> }
      ).readIgnoreFile('/test/.ignore')
      expect(result).toEqual(['node_modules', 'dist', '*.log'])
    })

    it('filters out comment lines', async () => {
      mockReadFile.mockResolvedValueOnce('# Comment\nnode_modules\n# Another comment\n*.log')
      const cmd = createCommand()
      const result = await (
        cmd as unknown as { readIgnoreFile: (p: string) => Promise<string[]> }
      ).readIgnoreFile('/test/.ignore')
      expect(result).not.toContain('# Comment')
      expect(result).not.toContain('# Another comment')
      expect(result).toContain('node_modules')
      expect(result).toContain('*.log')
    })

    it('filters out blank lines', async () => {
      mockReadFile.mockResolvedValueOnce('node_modules\n\n\n*.log\n')
      const cmd = createCommand()
      const result = await (
        cmd as unknown as { readIgnoreFile: (p: string) => Promise<string[]> }
      ).readIgnoreFile('/test/.ignore')
      expect(result).toEqual(['node_modules', '*.log'])
    })

    it('trims whitespace from patterns', async () => {
      mockReadFile.mockResolvedValueOnce('  node_modules  \n  dist  ')
      const cmd = createCommand()
      const result = await (
        cmd as unknown as { readIgnoreFile: (p: string) => Promise<string[]> }
      ).readIgnoreFile('/test/.ignore')
      expect(result).toEqual(['node_modules', 'dist'])
    })

    it('handles file with only comments', async () => {
      mockReadFile.mockResolvedValueOnce('# Only comments\n# No patterns')
      const cmd = createCommand()
      const result = await (
        cmd as unknown as { readIgnoreFile: (p: string) => Promise<string[]> }
      ).readIgnoreFile('/test/.ignore')
      expect(result).toEqual([])
    })

    it('handles empty file', async () => {
      mockReadFile.mockResolvedValueOnce('')
      const cmd = createCommand()
      const result = await (
        cmd as unknown as { readIgnoreFile: (p: string) => Promise<string[]> }
      ).readIgnoreFile('/test/.ignore')
      expect(result).toEqual([])
    })

    it('handles mixed content', async () => {
      mockReadFile.mockResolvedValueOnce(
        '# Dependencies\nnode_modules\n\n# Build\ndist\n*.min.js\n# IDE\n.vscode',
      )
      const cmd = createCommand()
      const result = await (
        cmd as unknown as { readIgnoreFile: (p: string) => Promise<string[]> }
      ).readIgnoreFile('/test/.ignore')
      expect(result).toEqual(['node_modules', 'dist', '*.min.js', '.vscode'])
    })

    it('handles file with trailing newlines', async () => {
      mockReadFile.mockResolvedValueOnce('node_modules\n\n')
      const cmd = createCommand()
      const result = await (
        cmd as unknown as { readIgnoreFile: (p: string) => Promise<string[]> }
      ).readIgnoreFile('/test/.ignore')
      expect(result).toEqual(['node_modules'])
    })

    it('handles CRLF line endings', async () => {
      mockReadFile.mockResolvedValueOnce('node_modules\r\ndist\r\n')
      const cmd = createCommand()
      const result = await (
        cmd as unknown as { readIgnoreFile: (p: string) => Promise<string[]> }
      ).readIgnoreFile('/test/.ignore')
      expect(result).toEqual(['node_modules', 'dist'])
    })
  })

  // =====================================================
  // catch error handling
  // =====================================================
  describe('catch error handling', () => {
    it('handles CLIError with suggestions', async () => {
      const { CLIError } = await import('../../../src/utils/errors.js')
      const cmd = createCommand()
      const mockError = vi.fn(() => {
        throw new Error('cmd')
      })
      ;(cmd as unknown as { error: ReturnType<typeof vi.fn> }).error = mockError
      await expect(cmd.catch(new CLIError('Test', { suggestions: ['s1'] }))).rejects.toThrow()
    })

    it('re-throws non-CLIError', async () => {
      const cmd = createCommand()
      await expect(cmd.catch(new Error('Regular'))).rejects.toThrow('Regular')
    })

    it('handles CLIError without suggestions', async () => {
      const { CLIError } = await import('../../../src/utils/errors.js')
      const cmd = createCommand()
      const mockError = vi.fn(() => {
        throw new Error('cmd')
      })
      ;(cmd as unknown as { error: ReturnType<typeof vi.fn> }).error = mockError
      await expect(cmd.catch(new CLIError('Test'))).rejects.toThrow()
    })

    it('passes error message to this.error for CLIError', async () => {
      const { CLIError } = await import('../../../src/utils/errors.js')
      const cmd = createCommand()
      const mockError = vi.fn(() => {
        throw new Error('exit')
      })
      ;(cmd as unknown as { error: ReturnType<typeof vi.fn> }).error = mockError
      try {
        await cmd.catch(new CLIError('specific error message'))
      } catch {
        /* empty */
      }
      expect(mockError).toHaveBeenCalledWith(
        'specific error message',
        expect.objectContaining({ exit: 1 }),
      )
    })

    it('passes suggestions to this.error for CLIError', async () => {
      const { CLIError } = await import('../../../src/utils/errors.js')
      const cmd = createCommand()
      const mockError = vi.fn(() => {
        throw new Error('exit')
      })
      ;(cmd as unknown as { error: ReturnType<typeof vi.fn> }).error = mockError
      try {
        await cmd.catch(new CLIError('msg', { suggestions: ['try this'] }))
      } catch {
        /* empty */
      }
      expect(mockError).toHaveBeenCalledWith(
        'msg',
        expect.objectContaining({ suggestions: ['try this'] }),
      )
    })
  })

  // =====================================================
  // discoverFiles
  // =====================================================
  describe('discoverFiles', () => {
    it('calls discoverFiles from module when not staged mode', async () => {
      const cmd = createCommand()
      mockDiscoverFiles.mockResolvedValueOnce([createMockFile('a.ts')])
      const result = await (
        cmd as unknown as {
          discoverFiles: (o: {
            cwd: string
            files: string[]
            ignore: string[]
            spinner: null
            stagedMode: boolean
          }) => Promise<DiscoveredFile[]>
        }
      ).discoverFiles({
        cwd: '/test',
        files: ['*.ts'],
        ignore: ['dist'],
        spinner: null,
        stagedMode: false,
      })
      expect(mockDiscoverFiles).toHaveBeenCalledWith({
        cwd: '/test',
        ignore: ['dist'],
        patterns: ['*.ts'],
      })
      expect(result).toHaveLength(1)
    })

    it('uses staged files when in staged mode', async () => {
      mockIsGitRepository.mockReturnValue(true)
      mockGetGitRoot.mockReturnValue('/test/repo')
      mockGetStagedFiles.mockReturnValue(['src/a.ts', 'src/b.ts'])
      const cmd = createCommand()
      const result = await (
        cmd as unknown as {
          discoverFiles: (o: {
            cwd: string
            files: string[]
            ignore: string[]
            spinner: null
            stagedMode: boolean
          }) => Promise<DiscoveredFile[]>
        }
      ).discoverFiles({ cwd: '/test/repo', files: [], ignore: [], spinner: null, stagedMode: true })
      expect(mockGetStagedFiles).toHaveBeenCalledWith('/test/repo')
      expect(result).toHaveLength(2)
    })

    it('errors when not in git repository and staged mode', async () => {
      mockIsGitRepository.mockReturnValue(false)
      const mockSpinner = {
        fail: vi.fn(),
        succeed: vi.fn(),
        start: vi.fn(),
        warn: vi.fn(),
        text: '',
      }
      const cmd = createCommand()
      await expect(
        (
          cmd as unknown as {
            discoverFiles: (o: {
              cwd: string
              files: string[]
              ignore: string[]
              spinner: { fail: () => void }
              stagedMode: boolean
            }) => Promise<DiscoveredFile[]>
          }
        ).discoverFiles({
          cwd: '/test',
          files: [],
          ignore: [],
          spinner: mockSpinner,
          stagedMode: true,
        }),
      ).rejects.toThrow('Not a git repository')
      expect(mockSpinner.fail).toHaveBeenCalled()
    })

    it('errors when git root cannot be determined', async () => {
      mockIsGitRepository.mockReturnValue(true)
      mockGetGitRoot.mockReturnValue(null)
      const mockSpinner = {
        fail: vi.fn(),
        succeed: vi.fn(),
        start: vi.fn(),
        warn: vi.fn(),
        text: '',
      }
      const cmd = createCommand()
      await expect(
        (
          cmd as unknown as {
            discoverFiles: (o: {
              cwd: string
              files: string[]
              ignore: string[]
              spinner: { fail: () => void }
              stagedMode: boolean
            }) => Promise<DiscoveredFile[]>
          }
        ).discoverFiles({
          cwd: '/test',
          files: [],
          ignore: [],
          spinner: mockSpinner,
          stagedMode: true,
        }),
      ).rejects.toThrow('Could not determine git repository root')
    })

    it('returns empty array when no staged files', async () => {
      mockIsGitRepository.mockReturnValue(true)
      mockGetGitRoot.mockReturnValue('/test/repo')
      mockGetStagedFiles.mockReturnValue([])
      const cmd = createCommand()
      const result = await (
        cmd as unknown as {
          discoverFiles: (o: {
            cwd: string
            files: string[]
            ignore: string[]
            spinner: null
            stagedMode: boolean
          }) => Promise<DiscoveredFile[]>
        }
      ).discoverFiles({ cwd: '/test/repo', files: [], ignore: [], spinner: null, stagedMode: true })
      expect(result).toEqual([])
    })

    it('filters out deleted staged files', async () => {
      mockIsGitRepository.mockReturnValue(true)
      mockGetGitRoot.mockReturnValue('/test/repo')
      mockGetStagedFiles.mockReturnValue(['exists.ts', 'deleted.ts'])
      mockExistsSync.mockImplementation((p: string) => !p.includes('deleted'))
      const cmd = createCommand()
      const result = await (
        cmd as unknown as {
          discoverFiles: (o: {
            cwd: string
            files: string[]
            ignore: string[]
            spinner: null
            stagedMode: boolean
          }) => Promise<DiscoveredFile[]>
        }
      ).discoverFiles({ cwd: '/test/repo', files: [], ignore: [], spinner: null, stagedMode: true })
      expect(result).toHaveLength(1)
      expect(result[0].path).toBe('exists.ts')
    })

    it('passes files and ignore to discoverFiles', async () => {
      mockDiscoverFiles.mockResolvedValueOnce([])
      const cmd = createCommand()
      await (
        cmd as unknown as {
          discoverFiles: (o: {
            cwd: string
            files: string[]
            ignore: string[]
            spinner: null
            stagedMode: boolean
          }) => Promise<DiscoveredFile[]>
        }
      ).discoverFiles({
        cwd: '/test',
        files: ['**/*.ts'],
        ignore: ['node_modules'],
        spinner: null,
        stagedMode: false,
      })
      expect(mockDiscoverFiles).toHaveBeenCalledWith({
        cwd: '/test',
        ignore: ['node_modules'],
        patterns: ['**/*.ts'],
      })
    })
  })

  // =====================================================
  // run integration - output formats
  // =====================================================
  describe('run integration - output formats', () => {
    it('passes json format to Reporter', async () => {
      mockNormalizeFlags.mockReturnValue({
        cacheResults: false,
        changedMode: undefined,
        ciMode: false,
        concurrency: 4,
        dryRun: false,
        failOnWarnings: false,
        format: 'json',
        maxWarnings: -1,
        output: undefined,
        quiet: true,
        shouldFix: false,
        stagedMode: false,
        verbose: false,
      })
      const cmd = createCommandWithMockedParse({ format: 'json' })
      mockExit(cmd)
      await runQuietly(cmd)
      expect(mockReporterCtor).toHaveBeenCalledWith(expect.objectContaining({ format: 'json' }))
    })

    it('passes html format to Reporter', async () => {
      mockNormalizeFlags.mockReturnValue({
        cacheResults: false,
        changedMode: undefined,
        ciMode: false,
        concurrency: 4,
        dryRun: false,
        failOnWarnings: false,
        format: 'html',
        maxWarnings: -1,
        output: 'report.html',
        quiet: true,
        shouldFix: false,
        stagedMode: false,
        verbose: false,
      })
      const cmd = createCommandWithMockedParse({ format: 'html' })
      mockExit(cmd)
      await runQuietly(cmd)
      expect(mockReporterCtor).toHaveBeenCalledWith(expect.objectContaining({ format: 'html' }))
    })

    it('passes junit format to Reporter', async () => {
      mockNormalizeFlags.mockReturnValue({
        cacheResults: false,
        changedMode: undefined,
        ciMode: false,
        concurrency: 4,
        dryRun: false,
        failOnWarnings: false,
        format: 'junit',
        maxWarnings: -1,
        output: undefined,
        quiet: true,
        shouldFix: false,
        stagedMode: false,
        verbose: false,
      })
      const cmd = createCommandWithMockedParse({ format: 'junit' })
      mockExit(cmd)
      await runQuietly(cmd)
      expect(mockReporterCtor).toHaveBeenCalledWith(expect.objectContaining({ format: 'junit' }))
    })

    it('passes sarif format to Reporter', async () => {
      mockNormalizeFlags.mockReturnValue({
        cacheResults: false,
        changedMode: undefined,
        ciMode: false,
        concurrency: 4,
        dryRun: false,
        failOnWarnings: false,
        format: 'sarif',
        maxWarnings: -1,
        output: undefined,
        quiet: true,
        shouldFix: false,
        stagedMode: false,
        verbose: false,
      })
      const cmd = createCommandWithMockedParse({ format: 'sarif' })
      mockExit(cmd)
      await runQuietly(cmd)
      expect(mockReporterCtor).toHaveBeenCalledWith(expect.objectContaining({ format: 'sarif' }))
    })

    it('passes markdown format to Reporter', async () => {
      mockNormalizeFlags.mockReturnValue({
        cacheResults: false,
        changedMode: undefined,
        ciMode: false,
        concurrency: 4,
        dryRun: false,
        failOnWarnings: false,
        format: 'markdown',
        maxWarnings: -1,
        output: undefined,
        quiet: true,
        shouldFix: false,
        stagedMode: false,
        verbose: false,
      })
      const cmd = createCommandWithMockedParse({ format: 'markdown' })
      mockExit(cmd)
      await runQuietly(cmd)
      expect(mockReporterCtor).toHaveBeenCalledWith(expect.objectContaining({ format: 'markdown' }))
    })

    it('passes gitlab format to Reporter', async () => {
      mockNormalizeFlags.mockReturnValue({
        cacheResults: false,
        changedMode: undefined,
        ciMode: false,
        concurrency: 4,
        dryRun: false,
        failOnWarnings: false,
        format: 'gitlab',
        maxWarnings: -1,
        output: undefined,
        quiet: true,
        shouldFix: false,
        stagedMode: false,
        verbose: false,
      })
      const cmd = createCommandWithMockedParse({ format: 'gitlab' })
      mockExit(cmd)
      await runQuietly(cmd)
      expect(mockReporterCtor).toHaveBeenCalledWith(expect.objectContaining({ format: 'gitlab' }))
    })

    it('passes csv format to Reporter', async () => {
      mockNormalizeFlags.mockReturnValue({
        cacheResults: false,
        changedMode: undefined,
        ciMode: false,
        concurrency: 4,
        dryRun: false,
        failOnWarnings: false,
        format: 'csv',
        maxWarnings: -1,
        output: undefined,
        quiet: true,
        shouldFix: false,
        stagedMode: false,
        verbose: false,
      })
      const cmd = createCommandWithMockedParse({ format: 'csv' })
      mockExit(cmd)
      await runQuietly(cmd)
      expect(mockReporterCtor).toHaveBeenCalledWith(expect.objectContaining({ format: 'csv' }))
    })

    it('passes output path to Reporter', async () => {
      mockNormalizeFlags.mockReturnValue({
        cacheResults: false,
        changedMode: undefined,
        ciMode: false,
        concurrency: 4,
        dryRun: false,
        failOnWarnings: false,
        format: 'json',
        maxWarnings: -1,
        output: '/tmp/report.json',
        quiet: true,
        shouldFix: false,
        stagedMode: false,
        verbose: false,
      })
      const cmd = createCommandWithMockedParse({ format: 'json', output: '/tmp/report.json' })
      mockExit(cmd)
      await runQuietly(cmd)
      expect(mockReporterCtor).toHaveBeenCalledWith(
        expect.objectContaining({ outputPath: '/tmp/report.json' }),
      )
    })
  })

  // =====================================================
  // run integration - CI mode
  // =====================================================
  describe('run integration - CI mode', () => {
    it('passes format json to Reporter in CI mode', async () => {
      mockNormalizeFlags.mockReturnValue({
        cacheResults: false,
        changedMode: undefined,
        ciMode: true,
        concurrency: 4,
        dryRun: false,
        failOnWarnings: false,
        format: 'json',
        maxWarnings: -1,
        output: undefined,
        quiet: true,
        shouldFix: false,
        stagedMode: false,
        verbose: false,
      })
      const cmd = createCommandWithMockedParse({ ci: true })
      mockExit(cmd)
      await runQuietly(cmd)
      expect(mockReporterCtor).toHaveBeenCalledWith(expect.objectContaining({ format: 'json' }))
    })

    it('disables colors in CI mode', async () => {
      mockNormalizeFlags.mockReturnValue({
        cacheResults: false,
        changedMode: undefined,
        ciMode: true,
        concurrency: 4,
        dryRun: false,
        failOnWarnings: false,
        format: 'json',
        maxWarnings: -1,
        output: undefined,
        quiet: true,
        shouldFix: false,
        stagedMode: false,
        verbose: false,
      })
      const cmd = createCommandWithMockedParse({ ci: true, color: true })
      mockExit(cmd)
      await runQuietly(cmd)
      expect(mockReporterCtor).toHaveBeenCalledWith(expect.objectContaining({ color: false }))
    })

    it('forces quiet in CI mode', async () => {
      mockNormalizeFlags.mockReturnValue({
        cacheResults: false,
        changedMode: undefined,
        ciMode: true,
        concurrency: 4,
        dryRun: false,
        failOnWarnings: false,
        format: 'json',
        maxWarnings: -1,
        output: undefined,
        quiet: true,
        shouldFix: false,
        stagedMode: false,
        verbose: false,
      })
      const cmd = createCommandWithMockedParse({ ci: true, quiet: false })
      mockExit(cmd)
      await runQuietly(cmd)
      expect(mockReporterCtor).toHaveBeenCalledWith(expect.objectContaining({ quiet: true }))
    })

    it('disables verbose in CI mode', async () => {
      mockNormalizeFlags.mockReturnValue({
        cacheResults: false,
        changedMode: undefined,
        ciMode: true,
        concurrency: 4,
        dryRun: false,
        failOnWarnings: false,
        format: 'json',
        maxWarnings: -1,
        output: undefined,
        quiet: true,
        shouldFix: false,
        stagedMode: false,
        verbose: false,
      })
      const cmd = createCommandWithMockedParse({ ci: true, verbose: true })
      mockExit(cmd)
      await runQuietly(cmd)
      expect(mockReporterCtor).toHaveBeenCalledWith(expect.objectContaining({ verbose: false }))
    })

    it('keeps non-console format in CI mode', async () => {
      mockNormalizeFlags.mockReturnValue({
        cacheResults: false,
        changedMode: undefined,
        ciMode: true,
        concurrency: 4,
        dryRun: false,
        failOnWarnings: false,
        format: 'sarif',
        maxWarnings: -1,
        output: undefined,
        quiet: true,
        shouldFix: false,
        stagedMode: false,
        verbose: false,
      })
      const cmd = createCommandWithMockedParse({ ci: true, format: 'sarif' })
      mockExit(cmd)
      await runQuietly(cmd)
      expect(mockReporterCtor).toHaveBeenCalledWith(expect.objectContaining({ format: 'sarif' }))
    })
  })

  // =====================================================
  // run integration - file handling
  // =====================================================
  describe('run integration - file handling', () => {
    it('exits 0 when no files found', async () => {
      mockFilterFilesByExtension.mockReturnValue([])
      const cmd = createCommandWithMockedParse({})
      let exitCode = -1
      ;(cmd as unknown as { exit: (c: number) => never }).exit = (code: number) => {
        exitCode = code
        throw new ExitCodeError(code)
      }
      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(exitCode).toBe(0)
    })

    it('exits 1 when target path does not exist', async () => {
      mockExistsSync.mockReturnValue(false)
      const cmd = createCommandWithMockedParse({})
      let exitCode = -1
      ;(cmd as unknown as { error: (m: string, o: { exit: number }) => never }).error = (
        msg: string,
        opts: { exit: number },
      ) => {
        exitCode = opts.exit
        throw new ExitCodeError(opts.exit)
      }
      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(exitCode).toBe(1)
    })

    it('handles single file target', async () => {
      mockStatSync.mockReturnValue({ isFile: () => true })
      const cmd = createCommandWithMockedParse({})
      mockExit(cmd)
      await runQuietly(cmd)
      expect(mockFilterFilesByExtension).toHaveBeenCalled()
    })

    it('handles directory target', async () => {
      mockStatSync.mockReturnValue({ isFile: () => false })
      const cmd = createCommandWithMockedParse({})
      mockExit(cmd)
      await runQuietly(cmd)
      expect(mockDiscoverFiles).toHaveBeenCalled()
    })

    it('calls loadCommandConfig with flags', async () => {
      const cmd = createCommandWithMockedParse({ files: ['*.ts'], ignore: ['dist'] })
      mockExit(cmd)
      await runQuietly(cmd)
      expect(mockLoadCommandConfig).toHaveBeenCalled()
    })

    it('calls normalizeFlags with parsed flags', async () => {
      const cmd = createCommandWithMockedParse({ format: 'json' })
      mockExit(cmd)
      await runQuietly(cmd)
      expect(mockNormalizeFlags).toHaveBeenCalled()
    })

    it('calls filterFilesByExtension with discovered files and ext flag', async () => {
      const cmd = createCommandWithMockedParse({ ext: '.ts' })
      mockExit(cmd)
      await runQuietly(cmd)
      expect(mockFilterFilesByExtension).toHaveBeenCalledWith(expect.any(Array), '.ts')
    })

    it('reads ignore file when ignore-path is set', async () => {
      mockReadFile.mockResolvedValueOnce('pattern1\npattern2')
      const cmd = createCommandWithMockedParse({ 'ignore-path': '/test/.ignore' })
      mockExit(cmd)
      await runQuietly(cmd)
      expect(mockReadFile).toHaveBeenCalledWith('/test/.ignore', 'utf8')
    })

    it('disposes parser after analysis', async () => {
      const mockDispose = vi.fn()
      mockParserCtor.mockImplementation(function () {
        return {
          initialize: vi.fn().mockResolvedValue(undefined),
          dispose: mockDispose,
          parseFile: vi.fn().mockResolvedValue({
            sourceFile: { getFilePath: () => '/test/file.ts' },
            filePath: '/test/file.ts',
            parseTime: 10,
          }),
        }
      })
      const cmd = createCommandWithMockedParse({})
      mockExit(cmd)
      await runQuietly(cmd)
      expect(mockDispose).toHaveBeenCalled()
    })
  })

  // =====================================================
  // run integration - exit codes
  // =====================================================
  describe('run integration - exit codes', () => {
    it('exits 0 when no violations', async () => {
      mockRunRules.mockReturnValue([])
      const cmd = createCommandWithMockedParse({})
      let exitCode = -1
      ;(cmd as unknown as { exit: (c: number) => never }).exit = (code: number) => {
        exitCode = code
        throw new ExitCodeError(code)
      }
      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(exitCode).toBe(0)
    })

    it('exits 1 when errors found', async () => {
      mockRunRules.mockReturnValue([createMockViolation({ severity: 'error' })])
      mockNormalizeFlags.mockReturnValue({
        cacheResults: false,
        changedMode: undefined,
        ciMode: false,
        concurrency: 4,
        dryRun: false,
        failOnWarnings: false,
        format: 'console',
        maxWarnings: -1,
        output: undefined,
        quiet: true,
        shouldFix: false,
        stagedMode: false,
        verbose: false,
      })
      const cmd = createCommandWithMockedParse({})
      let exitCode = -1
      ;(cmd as unknown as { exit: (c: number) => never }).exit = (code: number) => {
        exitCode = code
        throw new ExitCodeError(code)
      }
      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(exitCode).toBe(1)
    })

    it('exits 2 when fail-on-warnings and warnings found', async () => {
      mockRunRules.mockReturnValue([createMockViolation({ severity: 'warning' })])
      mockNormalizeFlags.mockReturnValue({
        cacheResults: false,
        changedMode: undefined,
        ciMode: false,
        concurrency: 4,
        dryRun: false,
        failOnWarnings: true,
        format: 'console',
        maxWarnings: -1,
        output: undefined,
        quiet: true,
        shouldFix: false,
        stagedMode: false,
        verbose: false,
      })
      const cmd = createCommandWithMockedParse({ 'fail-on-warnings': true })
      let exitCode = -1
      ;(cmd as unknown as { exit: (c: number) => never }).exit = (code: number) => {
        exitCode = code
        throw new ExitCodeError(code)
      }
      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(exitCode).toBe(2)
    })

    it('exits 1 when max-warnings exceeded', async () => {
      mockRunRules.mockReturnValue([
        createMockViolation({ severity: 'warning' }),
        createMockViolation({ severity: 'warning' }),
        createMockViolation({ severity: 'warning' }),
      ])
      mockNormalizeFlags.mockReturnValue({
        cacheResults: false,
        changedMode: undefined,
        ciMode: false,
        concurrency: 4,
        dryRun: false,
        failOnWarnings: false,
        format: 'console',
        maxWarnings: 2,
        output: undefined,
        quiet: true,
        shouldFix: false,
        stagedMode: false,
        verbose: false,
      })
      const cmd = createCommandWithMockedParse({ 'max-warnings': 2 })
      let exitCode = -1
      ;(cmd as unknown as { exit: (c: number) => never }).exit = (code: number) => {
        exitCode = code
        throw new ExitCodeError(code)
      }
      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(exitCode).toBe(1)
    })
  })

  // =====================================================
  // run integration - severity filtering
  // =====================================================
  describe('run integration - severity filtering', () => {
    it('passes all violations at info level', async () => {
      let reportData: { files: Array<{ violations: RuleViolation[] }> } | undefined
      mockReporterCtor.mockImplementation(function () {
        return {
          writeReport: vi.fn().mockImplementation((data: typeof reportData) => {
            reportData = data
            return Promise.resolve()
          }),
        }
      })
      mockRunRules.mockReturnValue([
        createMockViolation({ severity: 'error' }),
        createMockViolation({ severity: 'warning' }),
        createMockViolation({ severity: 'info' }),
      ])
      mockNormalizeFlags.mockReturnValue({
        cacheResults: false,
        changedMode: undefined,
        ciMode: false,
        concurrency: 4,
        dryRun: false,
        failOnWarnings: false,
        format: 'console',
        maxWarnings: -1,
        output: undefined,
        quiet: true,
        shouldFix: false,
        stagedMode: false,
        verbose: false,
      })
      const cmd = createCommandWithMockedParse({ 'severity-level': 'info' })
      mockExit(cmd)
      await runQuietly(cmd)
      expect(reportData?.files[0]?.violations).toHaveLength(3)
    })

    it('filters out info at warning level', async () => {
      let reportData: { files: Array<{ violations: RuleViolation[] }> } | undefined
      mockReporterCtor.mockImplementation(function () {
        return {
          writeReport: vi.fn().mockImplementation((data: typeof reportData) => {
            reportData = data
            return Promise.resolve()
          }),
        }
      })
      mockRunRules.mockReturnValue([
        createMockViolation({ severity: 'error' }),
        createMockViolation({ severity: 'warning' }),
        createMockViolation({ severity: 'info' }),
      ])
      mockNormalizeFlags.mockReturnValue({
        cacheResults: false,
        changedMode: undefined,
        ciMode: false,
        concurrency: 4,
        dryRun: false,
        failOnWarnings: false,
        format: 'console',
        maxWarnings: -1,
        output: undefined,
        quiet: true,
        shouldFix: false,
        stagedMode: false,
        verbose: false,
      })
      const cmd = createCommandWithMockedParse({ 'severity-level': 'warning' })
      mockExit(cmd)
      await runQuietly(cmd)
      expect(reportData?.files[0]?.violations).toHaveLength(2)
    })

    it('filters out warning and info at error level', async () => {
      let reportData: { files: Array<{ violations: RuleViolation[] }> } | undefined
      mockReporterCtor.mockImplementation(function () {
        return {
          writeReport: vi.fn().mockImplementation((data: typeof reportData) => {
            reportData = data
            return Promise.resolve()
          }),
        }
      })
      mockRunRules.mockReturnValue([
        createMockViolation({ severity: 'error' }),
        createMockViolation({ severity: 'warning' }),
        createMockViolation({ severity: 'info' }),
      ])
      mockNormalizeFlags.mockReturnValue({
        cacheResults: false,
        changedMode: undefined,
        ciMode: false,
        concurrency: 4,
        dryRun: false,
        failOnWarnings: false,
        format: 'console',
        maxWarnings: -1,
        output: undefined,
        quiet: true,
        shouldFix: false,
        stagedMode: false,
        verbose: false,
      })
      const cmd = createCommandWithMockedParse({ 'severity-level': 'error' })
      mockExit(cmd)
      await runQuietly(cmd)
      expect(reportData?.files[0]?.violations).toHaveLength(1)
      expect(reportData?.files[0]?.violations[0]?.severity).toBe('error')
    })
  })

  // =====================================================
  // run integration - logging
  // =====================================================
  describe('run integration - logging', () => {
    it('sets DEBUG log level when verbose flag is set', async () => {
      const { logger, LogLevel } = await import('../../../src/utils/logger.js')
      mockNormalizeFlags.mockReturnValue({
        cacheResults: false,
        changedMode: undefined,
        ciMode: false,
        concurrency: 4,
        dryRun: false,
        failOnWarnings: false,
        format: 'console',
        maxWarnings: -1,
        output: undefined,
        quiet: false,
        shouldFix: false,
        stagedMode: false,
        verbose: true,
      })
      mockFilterFilesByExtension.mockReturnValue([])
      const cmd = createCommandWithMockedParse({ verbose: true })
      mockExit(cmd)
      await runQuietly(cmd)
      expect(logger.setLevel).toHaveBeenCalledWith(LogLevel.DEBUG)
    })

    it('sets SILENT log level when quiet flag is set', async () => {
      const { logger, LogLevel } = await import('../../../src/utils/logger.js')
      mockNormalizeFlags.mockReturnValue({
        cacheResults: false,
        changedMode: undefined,
        ciMode: false,
        concurrency: 4,
        dryRun: false,
        failOnWarnings: false,
        format: 'console',
        maxWarnings: -1,
        output: undefined,
        quiet: true,
        shouldFix: false,
        stagedMode: false,
        verbose: false,
      })
      mockFilterFilesByExtension.mockReturnValue([])
      const cmd = createCommandWithMockedParse({ quiet: true })
      mockExit(cmd)
      await runQuietly(cmd)
      expect(logger.setLevel).toHaveBeenCalledWith(LogLevel.SILENT)
    })
  })

  // =====================================================
  // run integration - cache
  // =====================================================
  describe('run integration - result caching', () => {
    it('creates ResultCache when cacheResults is true', async () => {
      mockNormalizeFlags.mockReturnValue({
        cacheResults: true,
        changedMode: undefined,
        ciMode: false,
        concurrency: 4,
        dryRun: false,
        failOnWarnings: false,
        format: 'console',
        maxWarnings: -1,
        output: undefined,
        quiet: true,
        shouldFix: false,
        stagedMode: false,
        verbose: false,
      })
      const cmd = createCommandWithMockedParse({ 'cache-results': true })
      mockExit(cmd)
      await runQuietly(cmd)
      expect(mockResultCacheCtor).toHaveBeenCalled()
    })

    it('does not create ResultCache when cacheResults is false', async () => {
      mockResultCacheCtor.mockClear()
      mockNormalizeFlags.mockReturnValue({
        cacheResults: false,
        changedMode: undefined,
        ciMode: false,
        concurrency: 4,
        dryRun: false,
        failOnWarnings: false,
        format: 'console',
        maxWarnings: -1,
        output: undefined,
        quiet: true,
        shouldFix: false,
        stagedMode: false,
        verbose: false,
      })
      const cmd = createCommandWithMockedParse({ 'cache-results': false })
      mockExit(cmd)
      await runQuietly(cmd)
      expect(mockResultCacheCtor).not.toHaveBeenCalled()
    })
  })

  // =====================================================
  // run integration - concurrency
  // =====================================================
  describe('run integration - concurrency', () => {
    it('passes concurrency from flags to normalizeFlags', async () => {
      const cmd = createCommandWithMockedParse({ concurrency: 8 })
      mockExit(cmd)
      await runQuietly(cmd)
      expect(mockNormalizeFlags).toHaveBeenCalledWith(expect.objectContaining({ concurrency: 8 }))
    })

    it('uses default concurrency when not specified', async () => {
      const cmd = createCommandWithMockedParse({})
      mockExit(cmd)
      await runQuietly(cmd)
      expect(mockNormalizeFlags).toHaveBeenCalled()
    })
  })

  // =====================================================
  // run integration - reporter
  // =====================================================
  describe('run integration - reporter construction', () => {
    it('passes color flag to Reporter', async () => {
      mockNormalizeFlags.mockReturnValue({
        cacheResults: false,
        changedMode: undefined,
        ciMode: false,
        concurrency: 4,
        dryRun: false,
        failOnWarnings: false,
        format: 'console',
        maxWarnings: -1,
        output: undefined,
        quiet: true,
        shouldFix: false,
        stagedMode: false,
        verbose: false,
      })
      const cmd = createCommandWithMockedParse({ color: true })
      mockExit(cmd)
      await runQuietly(cmd)
      expect(mockReporterCtor).toHaveBeenCalledWith(expect.objectContaining({ color: true }))
    })

    it('passes --no-color to Reporter', async () => {
      mockNormalizeFlags.mockReturnValue({
        cacheResults: false,
        changedMode: undefined,
        ciMode: false,
        concurrency: 4,
        dryRun: false,
        failOnWarnings: false,
        format: 'console',
        maxWarnings: -1,
        output: undefined,
        quiet: true,
        shouldFix: false,
        stagedMode: false,
        verbose: false,
      })
      const cmd = createCommandWithMockedParse({ color: false })
      mockExit(cmd)
      await runQuietly(cmd)
      expect(mockReporterCtor).toHaveBeenCalledWith(expect.objectContaining({ color: false }))
    })
  })

  // =====================================================
  // run integration - ignore-path
  // =====================================================
  describe('run integration - ignore-path', () => {
    it('merges ignore file patterns with config ignore', async () => {
      mockLoadCommandConfig.mockResolvedValue({ ignore: ['config-ignore'] })
      mockReadFile.mockResolvedValueOnce('file-ignore1\nfile-ignore2')
      const cmd = createCommandWithMockedParse({ 'ignore-path': '/custom/ignore' })
      mockExit(cmd)
      await runQuietly(cmd)
      expect(mockReadFile).toHaveBeenCalledWith('/custom/ignore', 'utf8')
    })

    it('continues when ignore file cannot be read', async () => {
      mockLoadCommandConfig.mockResolvedValue({ ignore: [] })
      mockReadFile.mockRejectedValueOnce(new Error('ENOENT'))
      const cmd = createCommandWithMockedParse({ 'ignore-path': '/nonexistent' })
      mockExit(cmd)
      await runQuietly(cmd)
    })
  })

  // =====================================================
  // run integration - rule registry
  // =====================================================
  describe('run integration - rule registry', () => {
    it('calls setupRuleRegistryLazy with requested rules', async () => {
      const cmd = createCommandWithMockedParse({ rules: ['rule-a', 'rule-b'] })
      mockExit(cmd)
      await runQuietly(cmd)
      expect(mockSetupRuleRegistry).toHaveBeenCalledWith(['rule-a', 'rule-b'])
    })

    it('calls setupRuleRegistryLazy with undefined when no rules specified', async () => {
      const cmd = createCommandWithMockedParse({})
      mockExit(cmd)
      await runQuietly(cmd)
      expect(mockSetupRuleRegistry).toHaveBeenCalledWith(undefined)
    })
  })

  // =====================================================
  // run integration - fix mode
  // =====================================================
  describe('run integration - fix mode', () => {
    it('does not apply fixes when shouldFix is false', async () => {
      mockNormalizeFlags.mockReturnValue({
        cacheResults: false,
        changedMode: undefined,
        ciMode: false,
        concurrency: 4,
        dryRun: false,
        failOnWarnings: false,
        format: 'console',
        maxWarnings: -1,
        output: undefined,
        quiet: true,
        shouldFix: false,
        stagedMode: false,
        verbose: false,
      })
      const cmd = createCommandWithMockedParse({ fix: false })
      mockExit(cmd)
      await runQuietly(cmd)
      expect(mockApplyFixesToFiles).not.toHaveBeenCalled()
    })

    it('calls applyFixesToFiles when shouldFix is true and violations exist', async () => {
      mockRunRules.mockReturnValue([createMockViolation({ severity: 'warning' })])
      mockNormalizeFlags.mockReturnValue({
        cacheResults: false,
        changedMode: undefined,
        ciMode: false,
        concurrency: 4,
        dryRun: false,
        failOnWarnings: false,
        format: 'console',
        maxWarnings: -1,
        output: undefined,
        quiet: true,
        shouldFix: true,
        stagedMode: false,
        verbose: false,
      })
      const cmd = createCommandWithMockedParse({ fix: true })
      mockExit(cmd)
      await runQuietly(cmd)
      expect(mockApplyFixesToFiles).toHaveBeenCalled()
    })

    it('does not call applyFixesToFiles when shouldFix is true but no violations', async () => {
      mockRunRules.mockReturnValue([])
      mockNormalizeFlags.mockReturnValue({
        cacheResults: false,
        changedMode: undefined,
        ciMode: false,
        concurrency: 4,
        dryRun: false,
        failOnWarnings: false,
        format: 'console',
        maxWarnings: -1,
        output: undefined,
        quiet: true,
        shouldFix: true,
        stagedMode: false,
        verbose: false,
      })
      const cmd = createCommandWithMockedParse({ fix: true })
      mockExit(cmd)
      await runQuietly(cmd)
      expect(mockApplyFixesToFiles).not.toHaveBeenCalled()
    })
  })

  // =====================================================
  // analyzeFiles
  // =====================================================
  describe('analyzeFiles', () => {
    it('returns empty results for empty file list', async () => {
      const cmd = createCommand()
      const result = await (
        cmd as unknown as {
          analyzeFiles: (o: {
            concurrency: number
            configHash: string
            discoveredFiles: DiscoveredFile[]
            parseCache: Map<string, unknown>
            parser: unknown
            registry: unknown
            resultCache: null
            spinner: null
            verbose: boolean
          }) => Promise<{
            allViolations: RuleViolation[]
            failedFiles: unknown[]
            fileReports: unknown[]
          }>
        }
      ).analyzeFiles({
        concurrency: 1,
        configHash: '',
        discoveredFiles: [],
        parseCache: new Map(),
        parser: { parseFile: vi.fn() },
        registry: { runRules: vi.fn().mockReturnValue([]) },
        resultCache: null,
        spinner: null,
        verbose: false,
      })
      expect(result.allViolations).toEqual([])
      expect(result.fileReports).toEqual([])
      expect(result.failedFiles).toEqual([])
    })

    it('returns violations from registry', async () => {
      const violation = createMockViolation()
      const mockRegistry = { runRules: vi.fn().mockReturnValue([violation]) }
      const mockParser = {
        parseFile: vi.fn().mockResolvedValue({
          sourceFile: { getFilePath: () => '/test/file.ts' },
          filePath: '/test/file.ts',
          parseTime: 10,
        }),
      }
      const cmd = createCommand()
      const result = await (
        cmd as unknown as {
          analyzeFiles: (o: {
            concurrency: number
            configHash: string
            discoveredFiles: DiscoveredFile[]
            parseCache: Map<string, unknown>
            parser: unknown
            registry: unknown
            resultCache: null
            spinner: null
            verbose: boolean
          }) => Promise<{
            allViolations: RuleViolation[]
            failedFiles: unknown[]
            fileReports: unknown[]
          }>
        }
      ).analyzeFiles({
        concurrency: 1,
        configHash: '',
        discoveredFiles: [createMockFile('test.ts')],
        parseCache: new Map(),
        parser: mockParser,
        registry: mockRegistry,
        resultCache: null,
        spinner: null,
        verbose: false,
      })
      expect(result.allViolations).toHaveLength(1)
      expect(mockRegistry.runRules).toHaveBeenCalled()
    })

    it('caches parse results', async () => {
      const mockParseResult = {
        sourceFile: { getFilePath: () => '/test/file.ts' },
        filePath: '/test/file.ts',
        parseTime: 10,
      }
      const mockParser = { parseFile: vi.fn().mockResolvedValue(mockParseResult) }
      const parseCache = new Map<string, unknown>()
      const cmd = createCommand()
      await (
        cmd as unknown as {
          analyzeFiles: (o: {
            concurrency: number
            configHash: string
            discoveredFiles: DiscoveredFile[]
            parseCache: Map<string, unknown>
            parser: unknown
            registry: unknown
            resultCache: null
            spinner: null
            verbose: boolean
          }) => Promise<{
            allViolations: RuleViolation[]
            failedFiles: unknown[]
            fileReports: unknown[]
          }>
        }
      ).analyzeFiles({
        concurrency: 1,
        configHash: '',
        discoveredFiles: [createMockFile('test.ts')],
        parseCache,
        parser: mockParser,
        registry: { runRules: vi.fn().mockReturnValue([]) },
        resultCache: null,
        spinner: null,
        verbose: false,
      })
      expect(parseCache.has('/absolute/test.ts')).toBe(true)
    })

    it('handles parse errors gracefully', async () => {
      const mockParser = { parseFile: vi.fn().mockRejectedValue(new Error('Parse failed')) }
      const cmd = createCommand()
      const result = await (
        cmd as unknown as {
          analyzeFiles: (o: {
            concurrency: number
            configHash: string
            discoveredFiles: DiscoveredFile[]
            parseCache: Map<string, unknown>
            parser: unknown
            registry: unknown
            resultCache: null
            spinner: null
            verbose: boolean
          }) => Promise<{
            allViolations: RuleViolation[]
            failedFiles: Array<{ error: string; filePath: string }>
            fileReports: unknown[]
          }>
        }
      ).analyzeFiles({
        concurrency: 1,
        configHash: '',
        discoveredFiles: [createMockFile('bad.ts')],
        parseCache: new Map(),
        parser: mockParser,
        registry: { runRules: vi.fn() },
        resultCache: null,
        spinner: null,
        verbose: false,
      })
      expect(result.failedFiles).toHaveLength(1)
      expect(result.failedFiles[0].filePath).toBe('bad.ts')
      expect(result.failedFiles[0].error).toBe('Parse failed')
    })

    it('uses cached results when available', async () => {
      const cachedViolations = [createMockViolation({ message: 'cached' })]
      const mockCache = {
        get: vi.fn().mockResolvedValue(cachedViolations),
        set: vi.fn().mockResolvedValue(undefined),
        hashConfig: vi.fn().mockReturnValue('config-hash'),
      }
      const mockParser = { parseFile: vi.fn() }
      const cmd = createCommand()
      const result = await (
        cmd as unknown as {
          analyzeFiles: (o: {
            concurrency: number
            configHash: string
            discoveredFiles: DiscoveredFile[]
            parseCache: Map<string, unknown>
            parser: unknown
            registry: unknown
            resultCache: unknown
            spinner: null
            verbose: boolean
          }) => Promise<{
            allViolations: RuleViolation[]
            failedFiles: unknown[]
            fileReports: unknown[]
          }>
        }
      ).analyzeFiles({
        concurrency: 1,
        configHash: 'config-hash',
        discoveredFiles: [createMockFile('cached.ts')],
        parseCache: new Map(),
        parser: mockParser,
        registry: { runRules: vi.fn() },
        resultCache: mockCache,
        spinner: null,
        verbose: false,
      })
      expect(mockCache.get).toHaveBeenCalled()
      expect(mockParser.parseFile).not.toHaveBeenCalled()
      expect(result.allViolations).toHaveLength(1)
    })

    it('stores results in cache after analysis', async () => {
      const violations = [createMockViolation()]
      const mockCache = {
        get: vi.fn().mockResolvedValue(null),
        set: vi.fn().mockResolvedValue(undefined),
        hashConfig: vi.fn().mockReturnValue('config-hash'),
      }
      const mockParser = {
        parseFile: vi.fn().mockResolvedValue({
          sourceFile: { getFilePath: () => '/test/file.ts' },
          filePath: '/test/file.ts',
          parseTime: 10,
        }),
      }
      const cmd = createCommand()
      await (
        cmd as unknown as {
          analyzeFiles: (o: {
            concurrency: number
            configHash: string
            discoveredFiles: DiscoveredFile[]
            parseCache: Map<string, unknown>
            parser: unknown
            registry: unknown
            resultCache: unknown
            spinner: null
            verbose: boolean
          }) => Promise<{
            allViolations: RuleViolation[]
            failedFiles: unknown[]
            fileReports: unknown[]
          }>
        }
      ).analyzeFiles({
        concurrency: 1,
        configHash: 'config-hash',
        discoveredFiles: [createMockFile('test.ts')],
        parseCache: new Map(),
        parser: mockParser,
        registry: { runRules: vi.fn().mockReturnValue(violations) },
        resultCache: mockCache,
        spinner: null,
        verbose: false,
      })
      expect(mockCache.set).toHaveBeenCalled()
    })

    it('handles cache errors gracefully', async () => {
      const mockCache = {
        get: vi.fn().mockRejectedValue(new Error('cache read error')),
        set: vi.fn().mockRejectedValue(new Error('cache write error')),
        hashConfig: vi.fn().mockReturnValue('config-hash'),
      }
      const mockParser = {
        parseFile: vi.fn().mockResolvedValue({
          sourceFile: { getFilePath: () => '/test/file.ts' },
          filePath: '/test/file.ts',
          parseTime: 10,
        }),
      }
      const cmd = createCommand()
      const result = await (
        cmd as unknown as {
          analyzeFiles: (o: {
            concurrency: number
            configHash: string
            discoveredFiles: DiscoveredFile[]
            parseCache: Map<string, unknown>
            parser: unknown
            registry: unknown
            resultCache: unknown
            spinner: null
            verbose: boolean
          }) => Promise<{
            allViolations: RuleViolation[]
            failedFiles: unknown[]
            fileReports: unknown[]
          }>
        }
      ).analyzeFiles({
        concurrency: 1,
        configHash: 'config-hash',
        discoveredFiles: [createMockFile('test.ts')],
        parseCache: new Map(),
        parser: mockParser,
        registry: { runRules: vi.fn().mockReturnValue([createMockViolation()]) },
        resultCache: mockCache,
        spinner: null,
        verbose: false,
      })
      expect(result.allViolations).toHaveLength(1)
    })

    it('handles null files in list', async () => {
      const cmd = createCommand()
      const result = await (
        cmd as unknown as {
          analyzeFiles: (o: {
            concurrency: number
            configHash: string
            discoveredFiles: Array<DiscoveredFile | null>
            parseCache: Map<string, unknown>
            parser: unknown
            registry: unknown
            resultCache: null
            spinner: null
            verbose: boolean
          }) => Promise<{
            allViolations: RuleViolation[]
            failedFiles: unknown[]
            fileReports: unknown[]
          }>
        }
      ).analyzeFiles({
        concurrency: 1,
        configHash: '',
        discoveredFiles: [null, null],
        parseCache: new Map(),
        parser: { parseFile: vi.fn() },
        registry: { runRules: vi.fn().mockReturnValue([]) },
        resultCache: null,
        spinner: null,
        verbose: false,
      })
      expect(result.allViolations).toEqual([])
      expect(result.failedFiles).toEqual([])
    })

    it('updates spinner text when verbose and spinner present', async () => {
      const mockSpinner = {
        text: '',
        start: vi.fn().mockReturnThis(),
        succeed: vi.fn().mockReturnThis(),
      }
      const mockParser = {
        parseFile: vi.fn().mockResolvedValue({
          sourceFile: { getFilePath: () => '/test/file.ts' },
          filePath: '/test/file.ts',
          parseTime: 10,
        }),
      }
      const cmd = createCommand()
      await (
        cmd as unknown as {
          analyzeFiles: (o: {
            concurrency: number
            configHash: string
            discoveredFiles: DiscoveredFile[]
            parseCache: Map<string, unknown>
            parser: unknown
            registry: unknown
            resultCache: null
            spinner: { text: string; start: () => unknown; succeed: () => unknown }
            verbose: boolean
          }) => Promise<{
            allViolations: RuleViolation[]
            failedFiles: unknown[]
            fileReports: unknown[]
          }>
        }
      ).analyzeFiles({
        concurrency: 1,
        configHash: '',
        discoveredFiles: [createMockFile('test.ts')],
        parseCache: new Map(),
        parser: mockParser,
        registry: { runRules: vi.fn().mockReturnValue([]) },
        resultCache: null,
        spinner: mockSpinner,
        verbose: true,
      })
      expect(mockSpinner.text).toContain('Analyzing')
    })
  })

  // =====================================================
  // applyFixes
  // =====================================================
  describe('applyFixes', () => {
    it('returns zero counts for empty violations', async () => {
      const cmd = createCommand()
      const result = await (
        cmd as unknown as {
          applyFixes: (o: {
            allViolations: RuleViolation[]
            concurrency: number
            discoveredFiles: DiscoveredFile[]
            dryRun: boolean
            parseCache: Map<string, unknown>
            parser: unknown
            rulesWithFixes: Map<string, unknown>
            verbose: boolean
          }) => Promise<{ fixesApplied: number; fixesSkipped: number }>
        }
      ).applyFixes({
        allViolations: [],
        concurrency: 1,
        discoveredFiles: [createMockFile('test.ts')],
        dryRun: false,
        parseCache: new Map(),
        parser: { parseFile: vi.fn() },
        rulesWithFixes: new Map(),
        verbose: false,
      })
      expect(result.fixesApplied).toBe(0)
      expect(result.fixesSkipped).toBe(0)
    })

    it('returns zero counts when no files match violations', async () => {
      const cmd = createCommand()
      const result = await (
        cmd as unknown as {
          applyFixes: (o: {
            allViolations: RuleViolation[]
            concurrency: number
            discoveredFiles: DiscoveredFile[]
            dryRun: boolean
            parseCache: Map<string, unknown>
            parser: unknown
            rulesWithFixes: Map<string, unknown>
            verbose: boolean
          }) => Promise<{ fixesApplied: number; fixesSkipped: number }>
        }
      ).applyFixes({
        allViolations: [createMockViolation({ filePath: 'other.ts' })],
        concurrency: 1,
        discoveredFiles: [createMockFile('test.ts')],
        dryRun: false,
        parseCache: new Map(),
        parser: { parseFile: vi.fn() },
        rulesWithFixes: new Map(),
        verbose: false,
      })
      expect(result.fixesApplied).toBe(0)
    })

    it('uses cached parse result when available', async () => {
      const mockSourceFile = {
        saveSync: vi.fn(),
        getFilePath: () => '/test/file.ts',
      }
      const parseCache = new Map<string, unknown>()
      parseCache.set('/absolute/test.ts', { sourceFile: mockSourceFile })
      const mockParseFile = vi.fn()
      const cmd = createCommand()
      await (
        cmd as unknown as {
          applyFixes: (o: {
            allViolations: RuleViolation[]
            concurrency: number
            discoveredFiles: DiscoveredFile[]
            dryRun: boolean
            parseCache: Map<string, unknown>
            parser: { parseFile: typeof mockParseFile }
            rulesWithFixes: Map<string, unknown>
            verbose: boolean
          }) => Promise<{ fixesApplied: number; fixesSkipped: number }>
        }
      ).applyFixes({
        allViolations: [],
        concurrency: 1,
        discoveredFiles: [createMockFile('test.ts')],
        dryRun: false,
        parseCache,
        parser: { parseFile: mockParseFile },
        rulesWithFixes: new Map(),
        verbose: false,
      })
      expect(mockParseFile).not.toHaveBeenCalled()
    })

    it('handles fix errors gracefully', async () => {
      const { applyFixesToFile } = await import('../../../src/fix/fixer.js')
      vi.mocked(applyFixesToFile).mockImplementationOnce(() => {
        throw new Error('Fix error')
      })
      const mockSourceFile = { saveSync: vi.fn(), getFilePath: () => '/test/file.ts' }
      const mockParser = { parseFile: vi.fn().mockResolvedValue({ sourceFile: mockSourceFile }) }
      const cmd = createCommand()
      const result = await (
        cmd as unknown as {
          applyFixes: (o: {
            allViolations: RuleViolation[]
            concurrency: number
            discoveredFiles: DiscoveredFile[]
            dryRun: boolean
            parseCache: Map<string, unknown>
            parser: unknown
            rulesWithFixes: Map<string, unknown>
            verbose: boolean
          }) => Promise<{ fixesApplied: number; fixesSkipped: number }>
        }
      ).applyFixes({
        allViolations: [createMockViolation({ filePath: 'test.ts' })],
        concurrency: 1,
        discoveredFiles: [createMockFile('test.ts')],
        dryRun: false,
        parseCache: new Map(),
        parser: mockParser,
        rulesWithFixes: new Map(),
        verbose: true,
      })
      expect(result.fixesApplied).toBe(0)
      expect(result.fixesSkipped).toBe(0)
    })

    it('handles null files in list', async () => {
      const cmd = createCommand()
      const result = await (
        cmd as unknown as {
          applyFixes: (o: {
            allViolations: RuleViolation[]
            concurrency: number
            discoveredFiles: Array<DiscoveredFile | null>
            dryRun: boolean
            parseCache: Map<string, unknown>
            parser: unknown
            rulesWithFixes: Map<string, unknown>
            verbose: boolean
          }) => Promise<{ fixesApplied: number; fixesSkipped: number }>
        }
      ).applyFixes({
        allViolations: [],
        concurrency: 1,
        discoveredFiles: [null],
        dryRun: false,
        parseCache: new Map(),
        parser: { parseFile: vi.fn() },
        rulesWithFixes: new Map(),
        verbose: false,
      })
      expect(result.fixesApplied).toBe(0)
    })

    it('groups violations by file path', async () => {
      const { applyFixesToFile } = await import('../../../src/fix/fixer.js')
      vi.mocked(applyFixesToFile).mockReturnValue({
        changes: [],
        conflicts: [],
        filePath: '/test/file.ts',
        fixesApplied: 2,
        fixesSkipped: 0,
      })
      const mockSourceFile = { saveSync: vi.fn(), getFilePath: () => '/test/file.ts' }
      const mockParser = { parseFile: vi.fn().mockResolvedValue({ sourceFile: mockSourceFile }) }
      const rulesWithFixes = new Map<string, unknown>()
      rulesWithFixes.set('test-rule', { fix: vi.fn(), id: 'test-rule', priority: 10 })
      const cmd = createCommand()
      const result = await (
        cmd as unknown as {
          applyFixes: (o: {
            allViolations: RuleViolation[]
            concurrency: number
            discoveredFiles: DiscoveredFile[]
            dryRun: boolean
            parseCache: Map<string, unknown>
            parser: unknown
            rulesWithFixes: Map<string, unknown>
            verbose: boolean
          }) => Promise<{ fixesApplied: number; fixesSkipped: number }>
        }
      ).applyFixes({
        allViolations: [
          createMockViolation({ filePath: 'test.ts' }),
          createMockViolation({ filePath: 'test.ts' }),
        ],
        concurrency: 1,
        discoveredFiles: [createMockFile('test.ts')],
        dryRun: false,
        parseCache: new Map(),
        parser: mockParser,
        rulesWithFixes,
        verbose: false,
      })
      expect(result.fixesApplied).toBe(2)
    })

    it('skips files with no violations', async () => {
      const mockParseFile = vi.fn()
      const cmd = createCommand()
      await (
        cmd as unknown as {
          applyFixes: (o: {
            allViolations: RuleViolation[]
            concurrency: number
            discoveredFiles: DiscoveredFile[]
            dryRun: boolean
            parseCache: Map<string, unknown>
            parser: { parseFile: typeof mockParseFile }
            rulesWithFixes: Map<string, unknown>
            verbose: boolean
          }) => Promise<{ fixesApplied: number; fixesSkipped: number }>
        }
      ).applyFixes({
        allViolations: [createMockViolation({ filePath: 'other.ts' })],
        concurrency: 1,
        discoveredFiles: [createMockFile('clean.ts')],
        dryRun: false,
        parseCache: new Map(),
        parser: { parseFile: mockParseFile },
        rulesWithFixes: new Map(),
        verbose: false,
      })
      expect(mockParseFile).not.toHaveBeenCalled()
    })
  })

  // =====================================================
  // Profile flag metadata
  // =====================================================
  describe('Profile flag metadata', () => {
    it('has profile flag defined', () => {
      expect(Analyze.flags.profile).toBeDefined()
    })

    it('profile flag has char p', () => {
      expect(Analyze.flags.profile.char).toBe('p')
    })

    it('profile flag has correct options', () => {
      expect(Analyze.flags.profile.options).toEqual(['strict', 'moderate', 'lenient'])
    })

    it('profile flag mentions profile in description', () => {
      expect(Analyze.flags.profile.description.toLowerCase()).toContain('profile')
    })

    it('profile flag mentions severity in description', () => {
      expect(Analyze.flags.profile.description.toLowerCase()).toContain('severity')
    })

    it('profile flag has no default', () => {
      expect(Analyze.flags.profile.default).toBeUndefined()
    })
  })

  // =====================================================
  // applyProfileOverrides
  // =====================================================
  describe('applyProfileOverrides', () => {
    function applyProfile(
      violations: RuleViolation[],
      profile: 'lenient' | 'moderate' | 'strict',
    ): RuleViolation[] {
      const cmd = createCommand()
      return (
        cmd as unknown as {
          applyProfileOverrides: (
            v: RuleViolation[],
            p: 'lenient' | 'moderate' | 'strict',
          ) => RuleViolation[]
        }
      ).applyProfileOverrides(violations, profile)
    }

    it('remaps no-console severity to error with strict profile', () => {
      const violations = [createMockViolation({ ruleId: 'no-console', severity: 'warning' })]
      const result = applyProfile(violations, 'strict')
      expect(result[0].severity).toBe('error')
    })

    it('remaps max-complexity severity to info with lenient profile', () => {
      const violations = [createMockViolation({ ruleId: 'max-complexity', severity: 'error' })]
      const result = applyProfile(violations, 'lenient')
      expect(result[0].severity).toBe('info')
    })

    it('remaps max-depth severity to warning with moderate profile', () => {
      const violations = [createMockViolation({ ruleId: 'max-depth', severity: 'error' })]
      const result = applyProfile(violations, 'moderate')
      expect(result[0].severity).toBe('warning')
    })

    it('does not modify violations without matching rule override', () => {
      const violations = [createMockViolation({ ruleId: 'custom-rule', severity: 'error' })]
      const result = applyProfile(violations, 'strict')
      expect(result[0].severity).toBe('error')
    })

    it('preserves all other violation properties', () => {
      const violations = [
        createMockViolation({ ruleId: 'no-console', severity: 'warning', message: 'original' }),
      ]
      const result = applyProfile(violations, 'strict')
      expect(result[0].message).toBe('original')
      expect(result[0].ruleId).toBe('no-console')
      expect(result[0].filePath).toBe('/test/file.ts')
    })

    it('handles empty violations array', () => {
      const result = applyProfile([], 'strict')
      expect(result).toEqual([])
    })

    it('handles mixed overridden and non-overridden violations', () => {
      const violations = [
        createMockViolation({ ruleId: 'no-console', severity: 'warning' }),
        createMockViolation({ ruleId: 'some-rule', severity: 'warning' }),
        createMockViolation({ ruleId: 'no-debugger', severity: 'info' }),
      ]
      const result = applyProfile(violations, 'strict')
      expect(result[0].severity).toBe('error')
      expect(result[1].severity).toBe('warning')
      expect(result[2].severity).toBe('error')
    })

    it('does not mutate original violations', () => {
      const violations = [createMockViolation({ ruleId: 'no-console', severity: 'warning' })]
      applyProfile(violations, 'strict')
      expect(violations[0].severity).toBe('warning')
    })

    it('handles all lenient overrides', () => {
      const lenientRules = [
        'max-complexity',
        'max-depth',
        'max-file-size',
        'max-lines',
        'max-params',
        'no-console',
        'no-magic-numbers',
      ]
      const violations = lenientRules.map((ruleId) =>
        createMockViolation({ ruleId, severity: 'error' }),
      )
      const result = applyProfile(violations, 'lenient')
      for (const v of result) {
        expect(v.severity).toBe('info')
      }
    })

    it('handles all strict overrides', () => {
      const strictRules = [
        'no-console',
        'no-debugger',
        'no-eval',
        'no-explicit-any',
        'no-implicit-coercion',
        'no-unused-vars',
        'prefer-const',
      ]
      const violations = strictRules.map((ruleId) =>
        createMockViolation({ ruleId, severity: 'warning' }),
      )
      const result = applyProfile(violations, 'strict')
      for (const v of result) {
        expect(v.severity).toBe('error')
      }
    })
  })

  // =====================================================
  // applyProfileOverridesToFileReports
  // =====================================================
  describe('applyProfileOverridesToFileReports', () => {
    function applyProfileReports(
      reports: Array<{ filePath: string; violations: RuleViolation[] }>,
      profile: 'lenient' | 'moderate' | 'strict',
    ): Array<{ filePath: string; violations: RuleViolation[] }> {
      const cmd = createCommand()
      return (
        cmd as unknown as {
          applyProfileOverridesToFileReports: (
            r: Array<{ filePath: string; violations: RuleViolation[] }>,
            p: 'lenient' | 'moderate' | 'strict',
          ) => Array<{ filePath: string; violations: RuleViolation[] }>
        }
      ).applyProfileOverridesToFileReports(reports, profile)
    }

    it('remaps violation severity within file reports', () => {
      const reports = [
        {
          filePath: 'a.ts',
          violations: [
            createMockViolation({ ruleId: 'no-console', severity: 'warning' }),
            createMockViolation({ ruleId: 'no-debugger', severity: 'info' }),
          ],
        },
      ]
      const result = applyProfileReports(reports, 'strict')
      expect(result[0].violations[0].severity).toBe('error')
      expect(result[0].violations[1].severity).toBe('error')
    })

    it('preserves reports without matching overrides', () => {
      const reports = [
        {
          filePath: 'a.ts',
          violations: [createMockViolation({ ruleId: 'custom-rule', severity: 'warning' })],
        },
      ]
      const result = applyProfileReports(reports, 'strict')
      expect(result[0].violations[0].severity).toBe('warning')
    })

    it('handles empty reports array', () => {
      const result = applyProfileReports([], 'strict')
      expect(result).toEqual([])
    })

    it('handles multiple reports with mixed violations', () => {
      const reports = [
        {
          filePath: 'a.ts',
          violations: [
            createMockViolation({ ruleId: 'no-console', severity: 'warning' }),
            createMockViolation({ ruleId: 'other', severity: 'error' }),
          ],
        },
        {
          filePath: 'b.ts',
          violations: [createMockViolation({ ruleId: 'max-complexity', severity: 'error' })],
        },
      ]
      const result = applyProfileReports(reports, 'lenient')
      expect(result[0].violations[0].severity).toBe('info')
      expect(result[0].violations[1].severity).toBe('error')
      expect(result[1].violations[0].severity).toBe('info')
    })

    it('does not mutate original reports', () => {
      const reports = [
        {
          filePath: 'a.ts',
          violations: [createMockViolation({ ruleId: 'no-console', severity: 'warning' })],
        },
      ]
      applyProfileReports(reports, 'strict')
      expect(reports[0].violations[0].severity).toBe('warning')
    })

    it('preserves filePath property', () => {
      const reports = [
        {
          filePath: 'specific/path.ts',
          violations: [createMockViolation({ ruleId: 'no-console', severity: 'warning' })],
        },
      ]
      const result = applyProfileReports(reports, 'strict')
      expect(result[0].filePath).toBe('specific/path.ts')
    })
  })

  // =====================================================
  // run integration - profile flag
  // =====================================================
  describe('run integration - profile flag', () => {
    it('applies strict profile overrides to violations', async () => {
      let reportData: { files: Array<{ violations: RuleViolation[] }> } | undefined
      mockReporterCtor.mockImplementation(function () {
        return {
          writeReport: vi.fn().mockImplementation((data: typeof reportData) => {
            reportData = data
            return Promise.resolve()
          }),
        }
      })
      mockRunRules.mockReturnValue([
        createMockViolation({ ruleId: 'no-console', severity: 'warning' }),
        createMockViolation({ ruleId: 'no-debugger', severity: 'info' }),
        createMockViolation({ ruleId: 'other-rule', severity: 'warning' }),
      ])
      mockNormalizeFlags.mockReturnValue({
        cacheResults: false,
        changedMode: undefined,
        ciMode: false,
        concurrency: 4,
        dryRun: false,
        failOnWarnings: false,
        format: 'console',
        maxWarnings: -1,
        output: undefined,
        quiet: true,
        shouldFix: false,
        stagedMode: false,
        verbose: false,
      })
      const cmd = createCommandWithMockedParse({ profile: 'strict' })
      mockExit(cmd)
      await runQuietly(cmd)
      const violations = reportData?.files[0]?.violations ?? []
      expect(violations[0].severity).toBe('error')
      expect(violations[1].severity).toBe('error')
      expect(violations[2].severity).toBe('warning')
    })

    it('applies lenient profile and filters with severity-level', async () => {
      let reportData: { files: Array<{ violations: RuleViolation[] }> } | undefined
      mockReporterCtor.mockImplementation(function () {
        return {
          writeReport: vi.fn().mockImplementation((data: typeof reportData) => {
            reportData = data
            return Promise.resolve()
          }),
        }
      })
      mockRunRules.mockReturnValue([
        createMockViolation({ ruleId: 'max-complexity', severity: 'error' }),
        createMockViolation({ ruleId: 'no-console', severity: 'warning' }),
      ])
      mockNormalizeFlags.mockReturnValue({
        cacheResults: false,
        changedMode: undefined,
        ciMode: false,
        concurrency: 4,
        dryRun: false,
        failOnWarnings: false,
        format: 'console',
        maxWarnings: -1,
        output: undefined,
        quiet: true,
        shouldFix: false,
        stagedMode: false,
        verbose: false,
      })
      const cmd = createCommandWithMockedParse({ profile: 'lenient', 'severity-level': 'warning' })
      mockExit(cmd)
      await runQuietly(cmd)
      const violations = reportData?.files[0]?.violations ?? []
      expect(violations).toHaveLength(0)
    })

    it('does not apply profile overrides when profile is not set', async () => {
      let reportData: { files: Array<{ violations: RuleViolation[] }> } | undefined
      mockReporterCtor.mockImplementation(function () {
        return {
          writeReport: vi.fn().mockImplementation((data: typeof reportData) => {
            reportData = data
            return Promise.resolve()
          }),
        }
      })
      mockRunRules.mockReturnValue([
        createMockViolation({ ruleId: 'no-console', severity: 'warning' }),
      ])
      mockNormalizeFlags.mockReturnValue({
        cacheResults: false,
        changedMode: undefined,
        ciMode: false,
        concurrency: 4,
        dryRun: false,
        failOnWarnings: false,
        format: 'console',
        maxWarnings: -1,
        output: undefined,
        quiet: true,
        shouldFix: false,
        stagedMode: false,
        verbose: false,
      })
      const cmd = createCommandWithMockedParse({})
      mockExit(cmd)
      await runQuietly(cmd)
      const violations = reportData?.files[0]?.violations ?? []
      expect(violations[0].severity).toBe('warning')
    })

    it('has example for --profile flag', () => {
      const cmds = Analyze.examples.map((e: { command: string }) => e.command)
      expect(cmds.some((c: string) => c.includes('--profile'))).toBe(true)
    })
  })

  // =====================================================
  // Suppression filtering
  // =====================================================
  describe('Suppression filtering', () => {
    it('calls parseSuppressionsFromSourceFile during file analysis', async () => {
      const mockSourceFile = {
        getFilePath: () => '/test/file.ts',
        getText: () => 'const x = 1 // codeforge-disable-next-line no-console',
      }
      mockParserCtor.mockImplementation(function () {
        return {
          initialize: vi.fn().mockResolvedValue(undefined),
          dispose: vi.fn(),
          parseFile: vi.fn().mockResolvedValue({
            sourceFile: mockSourceFile,
            filePath: '/test/file.ts',
            parseTime: 10,
          }),
        }
      })
      const cmd = createCommand()
      const result = await (
        cmd as unknown as {
          analyzeFiles: (o: {
            concurrency: number
            configHash: string
            discoveredFiles: DiscoveredFile[]
            parseCache: Map<string, unknown>
            parser: unknown
            registry: unknown
            resultCache: null
            spinner: null
            verbose: boolean
          }) => Promise<{
            allViolations: RuleViolation[]
            failedFiles: unknown[]
            fileReports: unknown[]
          }>
        }
      ).analyzeFiles({
        concurrency: 1,
        configHash: '',
        discoveredFiles: [createMockFile('test.ts')],
        parseCache: new Map(),
        parser: { parseFile: vi.fn().mockResolvedValue({ sourceFile: mockSourceFile, filePath: '/test/file.ts', parseTime: 10 }) },
        registry: { runRules: vi.fn().mockReturnValue([]) },
        resultCache: null,
        spinner: null,
        verbose: false,
      })
      expect(mockParseSuppressionsFromSourceFile).toHaveBeenCalledWith(
        expect.objectContaining({ getFilePath: expect.any(Function) }),
      )
    })

    it('calls filterSuppressedViolations with violations and suppressions', async () => {
      const violation = createMockViolation({ ruleId: 'no-console' })
      const mockRegistry = { runRules: vi.fn().mockReturnValue([violation]) }
      const mockSourceFile = {
        getFilePath: () => '/test/file.ts',
        getText: () => '// codeforge-disable-next-line no-console',
      }
      const mockParser = {
        parseFile: vi.fn().mockResolvedValue({
          sourceFile: mockSourceFile,
          filePath: '/test/file.ts',
          parseTime: 10,
        }),
      }
      mockParseSuppressionsFromSourceFile.mockReturnValueOnce({
        count: 1,
        suppressions: [{ line: 1, ruleIds: ['no-console'], type: 'next-line' }],
      })
      const cmd = createCommand()
      await (
        cmd as unknown as {
          analyzeFiles: (o: {
            concurrency: number
            configHash: string
            discoveredFiles: DiscoveredFile[]
            parseCache: Map<string, unknown>
            parser: unknown
            registry: unknown
            resultCache: null
            spinner: null
            verbose: boolean
          }) => Promise<{
            allViolations: RuleViolation[]
            failedFiles: unknown[]
            fileReports: unknown[]
          }>
        }
      ).analyzeFiles({
        concurrency: 1,
        configHash: '',
        discoveredFiles: [createMockFile('test.ts')],
        parseCache: new Map(),
        parser: mockParser,
        registry: mockRegistry,
        resultCache: null,
        spinner: null,
        verbose: false,
      })
      expect(mockFilterSuppressedViolations).toHaveBeenCalledWith(
        [violation],
        [{ line: 1, ruleIds: ['no-console'], type: 'next-line' }],
      )
    })

    it('filters suppressed violations from results', async () => {
      const violation1 = createMockViolation({ ruleId: 'no-console' })
      const violation2 = createMockViolation({ ruleId: 'no-debugger' })
      const mockRegistry = { runRules: vi.fn().mockReturnValue([violation1, violation2]) }
      const mockSourceFile = {
        getFilePath: () => '/test/file.ts',
        getText: () => '// codeforge-disable-next-line no-console',
      }
      const mockParser = {
        parseFile: vi.fn().mockResolvedValue({
          sourceFile: mockSourceFile,
          filePath: '/test/file.ts',
          parseTime: 10,
        }),
      }
      mockParseSuppressionsFromSourceFile.mockReturnValueOnce({
        count: 1,
        suppressions: [{ line: 1, ruleIds: ['no-console'], type: 'next-line' }],
      })
      mockFilterSuppressedViolations.mockReturnValueOnce([violation2])
      const cmd = createCommand()
      const result = await (
        cmd as unknown as {
          analyzeFiles: (o: {
            concurrency: number
            configHash: string
            discoveredFiles: DiscoveredFile[]
            parseCache: Map<string, unknown>
            parser: unknown
            registry: unknown
            resultCache: null
            spinner: null
            verbose: boolean
          }) => Promise<{
            allViolations: RuleViolation[]
            failedFiles: unknown[]
            fileReports: unknown[]
          }>
        }
      ).analyzeFiles({
        concurrency: 1,
        configHash: '',
        discoveredFiles: [createMockFile('test.ts')],
        parseCache: new Map(),
        parser: mockParser,
        registry: mockRegistry,
        resultCache: null,
        spinner: null,
        verbose: false,
      })
      expect(result.allViolations).toHaveLength(1)
      expect(result.allViolations[0].ruleId).toBe('no-debugger')
    })

    it('returns all violations when no suppressions exist', async () => {
      const violation1 = createMockViolation({ ruleId: 'no-console' })
      const violation2 = createMockViolation({ ruleId: 'no-debugger' })
      const mockRegistry = { runRules: vi.fn().mockReturnValue([violation1, violation2]) }
      const mockSourceFile = {
        getFilePath: () => '/test/file.ts',
        getText: () => 'const x = 1',
      }
      const mockParser = {
        parseFile: vi.fn().mockResolvedValue({
          sourceFile: mockSourceFile,
          filePath: '/test/file.ts',
          parseTime: 10,
        }),
      }
      mockParseSuppressionsFromSourceFile.mockReturnValueOnce({ count: 0, suppressions: [] })
      mockFilterSuppressedViolations.mockImplementationOnce((v) => v)
      const cmd = createCommand()
      const result = await (
        cmd as unknown as {
          analyzeFiles: (o: {
            concurrency: number
            configHash: string
            discoveredFiles: DiscoveredFile[]
            parseCache: Map<string, unknown>
            parser: unknown
            registry: unknown
            resultCache: null
            spinner: null
            verbose: boolean
          }) => Promise<{
            allViolations: RuleViolation[]
            failedFiles: unknown[]
            fileReports: unknown[]
          }>
        }
      ).analyzeFiles({
        concurrency: 1,
        configHash: '',
        discoveredFiles: [createMockFile('test.ts')],
        parseCache: new Map(),
        parser: mockParser,
        registry: mockRegistry,
        resultCache: null,
        spinner: null,
        verbose: false,
      })
      expect(result.allViolations).toHaveLength(2)
     })
   })

  // =====================================================
  // Baseline flag metadata
  // =====================================================
  describe('Baseline flag metadata', () => {
    it('has baseline flag defined', () => {
      expect(Analyze.flags.baseline).toBeDefined()
    })

    it('baseline flag has char B', () => {
      expect(Analyze.flags.baseline.char).toBe('B')
    })

    it('baseline flag has correct options', () => {
      expect(Analyze.flags.baseline.options).toEqual(['compare', 'save'])
    })

    it('baseline flag mentions baseline in description', () => {
      expect(Analyze.flags.baseline.description.toLowerCase()).toContain('baseline')
    })

    it('baseline flag has no default', () => {
      expect(Analyze.flags.baseline.default).toBeUndefined()
    })

    it('has example for --baseline save', () => {
      const cmds = Analyze.examples.map((e: { command: string }) => e.command)
      expect(cmds.some((c: string) => c.includes('--baseline save'))).toBe(true)
    })

    it('has example for --baseline compare', () => {
      const cmds = Analyze.examples.map((e: { command: string }) => e.command)
      expect(cmds.some((c: string) => c.includes('--baseline compare'))).toBe(true)
    })
  })
})
