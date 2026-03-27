import { describe, test, expect, beforeEach, vi } from 'vitest'

vi.mock('../../../src/core/rule-registry.js', () => ({
  RuleRegistry: vi.fn().mockImplementation(function () {
    return {
      register: vi.fn(),
      disable: vi.fn(),
      runRules: vi.fn().mockReturnValue([]),
    }
  }),
}))

vi.mock('../../../src/rules/index.js', () => ({
  allRules: {
    'rule-one': { meta: { id: 'rule-one' } },
    'rule-two': { meta: { id: 'rule-two' } },
    'rule-three': { meta: { id: 'rule-three' } },
  },
  getRuleCategory: vi.fn().mockReturnValue('style'),
}))

vi.mock('../../../src/config/discovery.js', () => ({
  findConfigPath: vi.fn(),
}))

vi.mock('../../../src/config/cache.js', () => ({
  ConfigCache: vi.fn().mockImplementation(function () {
    return {
      getConfig: vi.fn(),
    }
  }),
}))

vi.mock('../../../src/config/validator.js', () => ({
  validateConfig: vi.fn((c) => c),
}))

vi.mock('../../../src/config/merger.js', () => ({
  mergeConfigs: vi.fn((base, cli) => ({ ...base, ...cli })),
  mergeEnvConfig: vi.fn((fileConfig, envConfig) => ({ ...fileConfig, ...envConfig })),
}))

vi.mock('../../../src/config/env-parser.js', () => ({
  parseEnvVars: vi.fn(() => ({})),
}))

vi.mock('../../../src/utils/logger.js', () => ({
  logger: { setLevel: vi.fn(), warn: vi.fn(), debug: vi.fn(), info: vi.fn() },
  LogLevel: { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, SILENT: 4 },
}))

describe('command-helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('setupRuleRegistry', () => {
    test('should register all rules when no requestedRules provided', async () => {
      const { setupRuleRegistry } = await import('../../../src/utils/command-helpers.js')
      const { RuleRegistry } = await import('../../../src/core/rule-registry.js')

      const mockRegister = vi.fn()
      const mockDisable = vi.fn()

      vi.mocked(RuleRegistry).mockImplementation(function () {
        return {
          register: mockRegister,
          disable: mockDisable,
          runRules: vi.fn().mockReturnValue([]),
        } as never
      })

      const registry = setupRuleRegistry(undefined)

      expect(mockRegister).toHaveBeenCalledTimes(3)
      expect(mockDisable).not.toHaveBeenCalled()
      expect(registry).toBeDefined()
    })

    test('should disable rules not in requestedRules', async () => {
      const { setupRuleRegistry } = await import('../../../src/utils/command-helpers.js')
      const { RuleRegistry } = await import('../../../src/core/rule-registry.js')

      const mockRegister = vi.fn()
      const mockDisable = vi.fn()

      vi.mocked(RuleRegistry).mockImplementation(function () {
        return {
          register: mockRegister,
          disable: mockDisable,
          runRules: vi.fn().mockReturnValue([]),
        } as never
      })

      const registry = setupRuleRegistry(['rule-one'])

      expect(mockRegister).toHaveBeenCalled()
      expect(mockDisable).toHaveBeenCalledTimes(2)
      expect(mockDisable).toHaveBeenCalledWith('rule-two')
      expect(mockDisable).toHaveBeenCalledWith('rule-three')
      expect(mockDisable).not.toHaveBeenCalledWith('rule-one')
      expect(registry).toBeDefined()
    })

    test('should enable only requested rules', async () => {
      const { setupRuleRegistry } = await import('../../../src/utils/command-helpers.js')
      const { RuleRegistry } = await import('../../../src/core/rule-registry.js')

      const mockRegister = vi.fn()
      const mockDisable = vi.fn()

      vi.mocked(RuleRegistry).mockImplementation(function () {
        return {
          register: mockRegister,
          disable: mockDisable,
          runRules: vi.fn().mockReturnValue([]),
        } as never
      })

      const registry = setupRuleRegistry(['rule-one', 'rule-two'])

      expect(mockRegister).toHaveBeenCalled()
      expect(mockDisable).toHaveBeenCalledTimes(1)
      expect(mockDisable).toHaveBeenCalledWith('rule-three')
      expect(mockDisable).not.toHaveBeenCalledWith('rule-one')
      expect(mockDisable).not.toHaveBeenCalledWith('rule-two')
      expect(registry).toBeDefined()
    })

    test('should handle empty requestedRules array', async () => {
      const { setupRuleRegistry } = await import('../../../src/utils/command-helpers.js')
      const { RuleRegistry } = await import('../../../src/core/rule-registry.js')

      const mockRegister = vi.fn()
      const mockDisable = vi.fn()

      vi.mocked(RuleRegistry).mockImplementation(function () {
        return {
          register: mockRegister,
          disable: mockDisable,
          runRules: vi.fn().mockReturnValue([]),
        } as never
      })

      const registry = setupRuleRegistry([])

      expect(mockRegister).toHaveBeenCalled()
      expect(mockDisable).not.toHaveBeenCalled()
      expect(registry).toBeDefined()
    })
  })

  describe('resolvePatterns', () => {
    test('should handle array args', async () => {
      const { resolvePatterns } = await import('../../../src/utils/command-helpers.js')

      expect(resolvePatterns(['a.ts', 'b.ts'], ['default.ts'])).toEqual(['a.ts', 'b.ts'])
    })

    test('should handle string args', async () => {
      const { resolvePatterns } = await import('../../../src/utils/command-helpers.js')

      expect(resolvePatterns('single.ts', ['default.ts'])).toEqual(['single.ts'])
    })

    test('should fall back to config files', async () => {
      const { resolvePatterns } = await import('../../../src/utils/command-helpers.js')

      expect(resolvePatterns(undefined, ['config.ts'])).toEqual(['config.ts'])
    })

    test('should return empty array when no patterns', async () => {
      const { resolvePatterns } = await import('../../../src/utils/command-helpers.js')

      expect(resolvePatterns(undefined, undefined)).toEqual([])
    })

    test('should return empty array when config files is empty', async () => {
      const { resolvePatterns } = await import('../../../src/utils/command-helpers.js')

      expect(resolvePatterns(undefined, [])).toEqual([])
    })

    test('should prefer args over config files', async () => {
      const { resolvePatterns } = await import('../../../src/utils/command-helpers.js')

      expect(resolvePatterns(['args.ts'], ['config.ts'])).toEqual(['args.ts'])
    })
  })

  describe('loadCommandConfig', () => {
    test('should load config from file when found', async () => {
      const { loadCommandConfig } = await import('../../../src/utils/command-helpers.js')
      const { findConfigPath } = await import('../../../src/config/discovery.js')
      const { validateConfig } = await import('../../../src/config/validator.js')

      const mockConfig = { files: ['test.ts'], ignore: ['node_modules'] }
      vi.mocked(findConfigPath).mockResolvedValue('/path/to/config.json')
      vi.mocked(validateConfig).mockReturnValue(mockConfig as never)

      const mockConfigCache = {
        getConfig: vi.fn().mockResolvedValue(mockConfig),
      } as never

      const result = await loadCommandConfig({}, mockConfigCache)

      expect(findConfigPath).toHaveBeenCalledWith(undefined, process.cwd())
      expect(validateConfig).toHaveBeenCalledWith(mockConfig)
      expect(result).toEqual(mockConfig)
    })

    test('should use defaults when no config file found', async () => {
      const { loadCommandConfig } = await import('../../../src/utils/command-helpers.js')
      const { findConfigPath } = await import('../../../src/config/discovery.js')
      const { mergeConfigs } = await import('../../../src/config/merger.js')

      vi.mocked(findConfigPath).mockResolvedValue(null)
      vi.mocked(mergeConfigs).mockReturnValue({ files: ['default.ts'] } as never)

      const mockConfigCache = {
        getConfig: vi.fn(),
      } as never

      const flags = { files: ['custom.ts'], ignore: ['dist'] }
      const result = await loadCommandConfig(flags, mockConfigCache)

      expect(findConfigPath).toHaveBeenCalledWith(undefined, process.cwd())
      expect(mergeConfigs).toHaveBeenCalled()
      expect(result).toBeDefined()
    })

    test('should use defaults when config path found but no config content', async () => {
      const { loadCommandConfig } = await import('../../../src/utils/command-helpers.js')
      const { findConfigPath } = await import('../../../src/config/discovery.js')
      const { mergeConfigs } = await import('../../../src/config/merger.js')

      vi.mocked(findConfigPath).mockResolvedValue('/path/to/config.json')
      vi.mocked(mergeConfigs).mockReturnValue({ files: [] } as never)

      const mockConfigCache = {
        getConfig: vi.fn().mockResolvedValue(null),
      } as never

      const result = await loadCommandConfig({}, mockConfigCache)

      expect(findConfigPath).toHaveBeenCalled()
      expect(result).toBeDefined()
    })

    test('should pass config flag to findConfigPath', async () => {
      const { loadCommandConfig } = await import('../../../src/utils/command-helpers.js')
      const { findConfigPath } = await import('../../../src/config/discovery.js')

      vi.mocked(findConfigPath).mockResolvedValue(null)

      const mockConfigCache = {
        getConfig: vi.fn(),
      } as never

      await loadCommandConfig({ config: '/custom/config.json' }, mockConfigCache)

      expect(findConfigPath).toHaveBeenCalledWith('/custom/config.json', process.cwd())
    })

    test('should include files flag in config', async () => {
      const { loadCommandConfig } = await import('../../../src/utils/command-helpers.js')
      const { findConfigPath } = await import('../../../src/config/discovery.js')
      const { mergeConfigs } = await import('../../../src/config/merger.js')

      vi.mocked(findConfigPath).mockResolvedValue(null)
      vi.mocked(mergeConfigs).mockImplementation(function (base, cli) {
        return { ...base, ...cli } as never
      })

      const mockConfigCache = {
        getConfig: vi.fn(),
      } as never

      await loadCommandConfig({ files: ['src/**/*.ts'] }, mockConfigCache)

      expect(mergeConfigs).toHaveBeenCalledWith({}, { files: ['src/**/*.ts'] })
    })

    test('should include ignore flag in config', async () => {
      const { loadCommandConfig } = await import('../../../src/utils/command-helpers.js')
      const { findConfigPath } = await import('../../../src/config/discovery.js')
      const { mergeConfigs } = await import('../../../src/config/merger.js')

      vi.mocked(findConfigPath).mockResolvedValue(null)
      vi.mocked(mergeConfigs).mockImplementation(function (base, cli) {
        return { ...base, ...cli } as never
      })

      const mockConfigCache = {
        getConfig: vi.fn(),
      } as never

      await loadCommandConfig({ ignore: ['node_modules', 'dist'] }, mockConfigCache)

      expect(mergeConfigs).toHaveBeenCalledWith({}, { ignore: ['node_modules', 'dist'] })
    })
  })

  describe('normalizeFlags', () => {
    test('should normalize all flags correctly', async () => {
      const { normalizeFlags } = await import('../../../src/utils/command-helpers.js')

      const result = normalizeFlags({
        ci: false,
        concurrency: 8,
        'dry-run': true,
        'fail-on-warnings': true,
        fix: true,
        format: 'json',
        'max-warnings': 10,
        output: 'output.json',
        quiet: false,
        staged: true,
        verbose: true,
      })

      expect(result).toEqual({
        ciMode: false,
        concurrency: 8,
        dryRun: true,
        failOnWarnings: true,
        format: 'json',
        maxWarnings: 10,
        output: 'output.json',
        quiet: false,
        shouldFix: true,
        stagedMode: true,
        verbose: true,
      })
    })

    test('should force JSON format in CI mode when format is console', async () => {
      const { normalizeFlags } = await import('../../../src/utils/command-helpers.js')

      const result = normalizeFlags({
        ci: true,
        concurrency: 4,
        'dry-run': false,
        'fail-on-warnings': false,
        fix: false,
        format: 'console',
        'max-warnings': -1,
        output: undefined,
        quiet: false,
        staged: false,
        verbose: true,
      })

      expect(result.format).toBe('json')
    })

    test('should preserve non-console format in CI mode', async () => {
      const { normalizeFlags } = await import('../../../src/utils/command-helpers.js')

      const result = normalizeFlags({
        ci: true,
        concurrency: 4,
        'dry-run': false,
        'fail-on-warnings': false,
        fix: false,
        format: 'junit',
        'max-warnings': -1,
        output: undefined,
        quiet: false,
        staged: false,
        verbose: true,
      })

      expect(result.format).toBe('junit')
    })

    test('should force quiet mode in CI mode', async () => {
      const { normalizeFlags } = await import('../../../src/utils/command-helpers.js')

      const result = normalizeFlags({
        ci: true,
        concurrency: 4,
        'dry-run': false,
        'fail-on-warnings': false,
        fix: false,
        format: 'json',
        'max-warnings': -1,
        output: undefined,
        quiet: false,
        staged: false,
        verbose: false,
      })

      expect(result.quiet).toBe(true)
    })

    test('should disable verbose in CI mode', async () => {
      const { normalizeFlags } = await import('../../../src/utils/command-helpers.js')

      const result = normalizeFlags({
        ci: true,
        concurrency: 4,
        'dry-run': false,
        'fail-on-warnings': false,
        fix: false,
        format: 'json',
        'max-warnings': -1,
        output: undefined,
        quiet: false,
        staged: false,
        verbose: true,
      })

      expect(result.verbose).toBe(false)
    })

    test('should handle default values', async () => {
      const { normalizeFlags } = await import('../../../src/utils/command-helpers.js')

      const result = normalizeFlags({
        ci: false,
        concurrency: 4,
        'dry-run': false,
        'fail-on-warnings': false,
        fix: false,
        format: 'console',
        'max-warnings': -1,
        output: undefined,
        quiet: false,
        staged: false,
        verbose: false,
      })

      expect(result.ciMode).toBe(false)
      expect(result.quiet).toBe(false)
      expect(result.verbose).toBe(false)
    })
  })

  describe('filterFilesByExtension', () => {
    test('should return all files when no extension specified', async () => {
      const { filterFilesByExtension } = await import('../../../src/utils/command-helpers.js')

      const files = [
        { path: 'test.ts', absolutePath: '/abs/test.ts' },
        { path: 'test.js', absolutePath: '/abs/test.js' },
      ]

      const result = filterFilesByExtension(files)

      expect(result).toEqual(files)
    })

    test('should return all files when extension string is empty', async () => {
      const { filterFilesByExtension } = await import('../../../src/utils/command-helpers.js')

      const files = [
        { path: 'test.ts', absolutePath: '/abs/test.ts' },
        { path: 'test.js', absolutePath: '/abs/test.js' },
      ]

      const result = filterFilesByExtension(files, '')

      expect(result).toEqual(files)
    })

    test('should filter by single extension', async () => {
      const { filterFilesByExtension } = await import('../../../src/utils/command-helpers.js')

      const files = [
        { path: 'test.ts', absolutePath: '/abs/test.ts' },
        { path: 'test.js', absolutePath: '/abs/test.js' },
        { path: 'another.ts', absolutePath: '/abs/another.ts' },
      ]

      const result = filterFilesByExtension(files, '.ts')

      expect(result).toHaveLength(2)
      expect(result.map((f) => f.path)).toEqual(['test.ts', 'another.ts'])
    })

    test('should filter by multiple extensions', async () => {
      const { filterFilesByExtension } = await import('../../../src/utils/command-helpers.js')

      const files = [
        { path: 'test.ts', absolutePath: '/abs/test.ts' },
        { path: 'test.js', absolutePath: '/abs/test.js' },
        { path: 'test.py', absolutePath: '/abs/test.py' },
      ]

      const result = filterFilesByExtension(files, '.ts, .js')

      expect(result).toHaveLength(2)
      expect(result.map((f) => f.path)).toEqual(['test.ts', 'test.js'])
    })

    test('should require leading dot in extension string', async () => {
      const { filterFilesByExtension } = await import('../../../src/utils/command-helpers.js')

      const files = [
        { path: 'test.ts', absolutePath: '/abs/test.ts' },
        { path: 'test.js', absolutePath: '/abs/test.js' },
      ]

      const result = filterFilesByExtension(files, 'ts, js')

      expect(result).toHaveLength(0)
    })

    test('should handle case-insensitive extensions', async () => {
      const { filterFilesByExtension } = await import('../../../src/utils/command-helpers.js')

      const files = [
        { path: 'test.TS', absolutePath: '/abs/test.TS' },
        { path: 'test.ts', absolutePath: '/abs/test.ts' },
        { path: 'test.js', absolutePath: '/abs/test.js' },
      ]

      const result = filterFilesByExtension(files, '.ts')

      expect(result).toHaveLength(2)
    })

    test('should return empty array when no files match', async () => {
      const { filterFilesByExtension } = await import('../../../src/utils/command-helpers.js')

      const files = [
        { path: 'test.ts', absolutePath: '/abs/test.ts' },
        { path: 'test.js', absolutePath: '/abs/test.js' },
      ]

      const result = filterFilesByExtension(files, '.py')

      expect(result).toHaveLength(0)
    })

    test('should handle files without extensions', async () => {
      const { filterFilesByExtension } = await import('../../../src/utils/command-helpers.js')

      const files = [
        { path: 'Makefile', absolutePath: '/abs/Makefile' },
        { path: 'test.ts', absolutePath: '/abs/test.ts' },
      ]

      const result = filterFilesByExtension(files, '.ts')

      expect(result).toHaveLength(1)
      expect(result[0].path).toBe('test.ts')
    })

    test('should return all files when extensions array is empty after parsing', async () => {
      const { filterFilesByExtension } = await import('../../../src/utils/command-helpers.js')

      const files = [{ path: 'test.ts', absolutePath: '/abs/test.ts' }]

      const result = filterFilesByExtension(files, ',,')

      expect(result).toEqual(files)
    })
  })

  describe('applyFixesToFiles', () => {
    const createMockViolation = (ruleId: string) => ({
      ruleId,
      message: 'Test violation',
      severity: 'error' as const,
      filePath: 'test.ts',
      range: {
        start: { line: 1, column: 1 },
        end: { line: 1, column: 10 },
      },
    })

    test('should return early when no violations', async () => {
      const { applyFixesToFiles } = await import('../../../src/utils/command-helpers.js')

      const mockApplyFixesFn = vi.fn().mockResolvedValue({ fixesApplied: 0, fixesSkipped: 0 })

      const result = await applyFixesToFiles({
        allViolations: [],
        applyFixesFn: mockApplyFixesFn,
        concurrency: 4,
        discoveredFiles: [],
        dryRun: false,
        parseCache: new Map(),
        parser: {} as never,
        quiet: false,
        rulesWithFixes: new Map(),
        verbose: false,
      })

      expect(result).toEqual({ fixesApplied: 0, fixesSkipped: 0 })
      expect(mockApplyFixesFn).not.toHaveBeenCalled()
    })

    test('should call applyFixesFn when violations exist', async () => {
      const { applyFixesToFiles } = await import('../../../src/utils/command-helpers.js')

      const mockApplyFixesFn = vi.fn().mockResolvedValue({ fixesApplied: 5, fixesSkipped: 2 })
      const mockViolation = createMockViolation('test-rule')

      const result = await applyFixesToFiles({
        allViolations: [mockViolation],
        applyFixesFn: mockApplyFixesFn,
        concurrency: 4,
        discoveredFiles: [],
        dryRun: true,
        parseCache: new Map(),
        parser: {} as never,
        quiet: true,
        rulesWithFixes: new Map(),
        verbose: true,
      })

      expect(mockApplyFixesFn).toHaveBeenCalledWith({
        allViolations: [mockViolation],
        concurrency: 4,
        discoveredFiles: [],
        dryRun: true,
        parseCache: expect.any(Map),
        parser: {},
        quiet: true,
        rulesWithFixes: expect.any(Map),
        verbose: true,
      })
      expect(result).toEqual({ fixesApplied: 5, fixesSkipped: 2 })
    })

    test('should pass dryRun and quiet flags correctly', async () => {
      const { applyFixesToFiles } = await import('../../../src/utils/command-helpers.js')

      const mockApplyFixesFn = vi.fn().mockResolvedValue({ fixesApplied: 1, fixesSkipped: 0 })

      await applyFixesToFiles({
        allViolations: [createMockViolation('test')],
        applyFixesFn: mockApplyFixesFn,
        concurrency: 4,
        discoveredFiles: [],
        dryRun: true,
        parseCache: new Map(),
        parser: {} as never,
        quiet: true,
        rulesWithFixes: new Map(),
        verbose: false,
      })

      const callArgs = mockApplyFixesFn.mock.calls[0][0]
      expect(callArgs.dryRun).toBe(true)
      expect(callArgs.quiet).toBe(true)
    })
  })
})
