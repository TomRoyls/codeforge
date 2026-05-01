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

vi.mock('../../../src/rules/lazy-loader.js', () => ({
  lazyRuleLoader: {
    getRuleIds: vi.fn().mockReturnValue(['rule-one', 'rule-two', 'rule-three']),
    loadAllRules: vi.fn().mockResolvedValue({
      'rule-one': { meta: { id: 'rule-one' } },
      'rule-two': { meta: { id: 'rule-two' } },
      'rule-three': { meta: { id: 'rule-three' } },
    }),
    loadRules: vi.fn().mockImplementation(async (ruleIds: string[]) => {
      const all: Record<string, { meta: { id: string } }> = {
        'rule-one': { meta: { id: 'rule-one' } },
        'rule-two': { meta: { id: 'rule-two' } },
        'rule-three': { meta: { id: 'rule-three' } },
      }
      const result: Record<string, { meta: { id: string } }> = {}
      for (const id of ruleIds) {
        if (all[id]) result[id] = all[id]
      }
      return result
    }),
  },
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

    test('should log warning for unknown rules', async () => {
      const { setupRuleRegistry } = await import('../../../src/utils/command-helpers.js')
      const { RuleRegistry } = await import('../../../src/core/rule-registry.js')
      const { logger } = await import('../../../src/utils/logger.js')

      const mockRegister = vi.fn()
      const mockDisable = vi.fn()

      vi.mocked(RuleRegistry).mockImplementation(function () {
        return {
          register: mockRegister,
          disable: mockDisable,
          runRules: vi.fn().mockReturnValue([]),
        } as never
      })

      setupRuleRegistry(['rule-one', 'unknown-rule', 'another-unknown'])

      expect(logger.warn).toHaveBeenCalledWith(
        'Unknown rules will be ignored: unknown-rule, another-unknown',
      )
    })

    test('should not log warning when all rules are known', async () => {
      const { setupRuleRegistry } = await import('../../../src/utils/command-helpers.js')
      const { RuleRegistry } = await import('../../../src/core/rule-registry.js')
      const { logger } = await import('../../../src/utils/logger.js')

      const mockRegister = vi.fn()
      const mockDisable = vi.fn()

      vi.mocked(RuleRegistry).mockImplementation(function () {
        return {
          register: mockRegister,
          disable: mockDisable,
          runRules: vi.fn().mockReturnValue([]),
        } as never
      })

      setupRuleRegistry(['rule-one', 'rule-two'])

      expect(logger.warn).not.toHaveBeenCalled()
    })

    test('should register each rule with getRuleCategory', async () => {
      const { setupRuleRegistry } = await import('../../../src/utils/command-helpers.js')
      const { RuleRegistry } = await import('../../../src/core/rule-registry.js')
      const { getRuleCategory } = await import('../../../src/rules/index.js')

      const mockRegister = vi.fn()
      const mockDisable = vi.fn()

      vi.mocked(RuleRegistry).mockImplementation(function () {
        return {
          register: mockRegister,
          disable: mockDisable,
          runRules: vi.fn().mockReturnValue([]),
        } as never
      })

      setupRuleRegistry(undefined)

      expect(getRuleCategory).toHaveBeenCalledWith('rule-one')
      expect(getRuleCategory).toHaveBeenCalledWith('rule-two')
      expect(getRuleCategory).toHaveBeenCalledWith('rule-three')
    })

    test('should register rules with correct rule definitions', async () => {
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

      setupRuleRegistry(undefined)

      expect(mockRegister).toHaveBeenCalledWith('rule-one', { meta: { id: 'rule-one' } }, 'style')
      expect(mockRegister).toHaveBeenCalledWith('rule-two', { meta: { id: 'rule-two' } }, 'style')
    })

    test('should not disable any rule when all rules are requested', async () => {
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

      setupRuleRegistry(['rule-one', 'rule-two', 'rule-three'])

      expect(mockDisable).not.toHaveBeenCalled()
    })

    test('should create a new RuleRegistry instance', async () => {
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

      setupRuleRegistry(undefined)

      expect(RuleRegistry).toHaveBeenCalledTimes(1)
    })

    test('should handle single requested rule that is unknown', async () => {
      const { setupRuleRegistry } = await import('../../../src/utils/command-helpers.js')
      const { RuleRegistry } = await import('../../../src/core/rule-registry.js')
      const { logger } = await import('../../../src/utils/logger.js')

      const mockRegister = vi.fn()
      const mockDisable = vi.fn()

      vi.mocked(RuleRegistry).mockImplementation(function () {
        return {
          register: mockRegister,
          disable: mockDisable,
          runRules: vi.fn().mockReturnValue([]),
        } as never
      })

      setupRuleRegistry(['totally-unknown'])

      expect(logger.warn).toHaveBeenCalledWith('Unknown rules will be ignored: totally-unknown')
      expect(mockDisable).toHaveBeenCalledTimes(3)
    })

    test('should disable all rules when only unknown rules requested', async () => {
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

      setupRuleRegistry(['fake-rule'])

      expect(mockDisable).toHaveBeenCalledWith('rule-one')
      expect(mockDisable).toHaveBeenCalledWith('rule-two')
      expect(mockDisable).toHaveBeenCalledWith('rule-three')
    })

    test('should return a registry with runRules method', async () => {
      const { setupRuleRegistry } = await import('../../../src/utils/command-helpers.js')
      const { RuleRegistry } = await import('../../../src/core/rule-registry.js')

      const mockRunRules = vi.fn().mockReturnValue([])
      vi.mocked(RuleRegistry).mockImplementation(function () {
        return {
          register: vi.fn(),
          disable: vi.fn(),
          runRules: mockRunRules,
        } as never
      })

      const registry = setupRuleRegistry(undefined)

      expect(typeof registry.runRules).toBe('function')
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

    test('should handle single element array args', async () => {
      const { resolvePatterns } = await import('../../../src/utils/command-helpers.js')

      expect(resolvePatterns(['only.ts'], ['default.ts'])).toEqual(['only.ts'])
    })

    test('should handle string arg when config files is undefined', async () => {
      const { resolvePatterns } = await import('../../../src/utils/command-helpers.js')

      expect(resolvePatterns('file.ts', undefined)).toEqual(['file.ts'])
    })

    test('should handle empty string arg as truthy', async () => {
      const { resolvePatterns } = await import('../../../src/utils/command-helpers.js')

      expect(resolvePatterns('', ['config.ts'])).toEqual(['config.ts'])
    })

    test('should handle array with multiple patterns', async () => {
      const { resolvePatterns } = await import('../../../src/utils/command-helpers.js')

      const patterns = ['src/**/*.ts', 'lib/**/*.js', 'test/**/*.test.ts']
      expect(resolvePatterns(patterns, ['default.ts'])).toEqual(patterns)
    })

    test('should handle config files with multiple entries', async () => {
      const { resolvePatterns } = await import('../../../src/utils/command-helpers.js')

      const configFiles = ['a.ts', 'b.ts', 'c.ts']
      expect(resolvePatterns(undefined, configFiles)).toEqual(configFiles)
    })

    test('should return same array reference for array input', async () => {
      const { resolvePatterns } = await import('../../../src/utils/command-helpers.js')

      const input = ['x.ts', 'y.ts']
      expect(resolvePatterns(input, ['default.ts'])).toBe(input)
    })

    test('should wrap string in array without modifying config', async () => {
      const { resolvePatterns } = await import('../../../src/utils/command-helpers.js')

      const result = resolvePatterns('solo.ts', ['ignored.ts'])
      expect(result).toEqual(['solo.ts'])
      expect(result).toHaveLength(1)
    })

    test('should handle glob patterns in args', async () => {
      const { resolvePatterns } = await import('../../../src/utils/command-helpers.js')

      expect(resolvePatterns('**/*.ts', undefined)).toEqual(['**/*.ts'])
    })

    test('should handle glob patterns array in args', async () => {
      const { resolvePatterns } = await import('../../../src/utils/command-helpers.js')

      const globs = ['src/**/*', '!src/node_modules/**']
      expect(resolvePatterns(globs, ['fallback.ts'])).toEqual(globs)
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

    test('should call parseEnvVars', async () => {
      const { loadCommandConfig } = await import('../../../src/utils/command-helpers.js')
      const { findConfigPath } = await import('../../../src/config/discovery.js')
      const { parseEnvVars } = await import('../../../src/config/env-parser.js')

      vi.mocked(findConfigPath).mockResolvedValue(null)

      const mockConfigCache = {
        getConfig: vi.fn(),
      } as never

      await loadCommandConfig({}, mockConfigCache)

      expect(parseEnvVars).toHaveBeenCalled()
    })

    test('should call mergeEnvConfig with file config and env config when config found', async () => {
      const { loadCommandConfig } = await import('../../../src/utils/command-helpers.js')
      const { findConfigPath } = await import('../../../src/config/discovery.js')
      const { mergeEnvConfig } = await import('../../../src/config/merger.js')

      const mockConfig = { files: ['src/**/*.ts'] }
      vi.mocked(findConfigPath).mockResolvedValue('/path/to/config.json')
      vi.mocked(mergeEnvConfig).mockReturnValue(mockConfig as never)

      const mockConfigCache = {
        getConfig: vi.fn().mockResolvedValue(mockConfig),
      } as never

      await loadCommandConfig({}, mockConfigCache)

      expect(mergeEnvConfig).toHaveBeenCalled()
    })

    test('should call mergeEnvConfig with empty object when no config file found', async () => {
      const { loadCommandConfig } = await import('../../../src/utils/command-helpers.js')
      const { findConfigPath } = await import('../../../src/config/discovery.js')
      const { mergeEnvConfig } = await import('../../../src/config/merger.js')

      vi.mocked(findConfigPath).mockResolvedValue(null)
      vi.mocked(mergeEnvConfig).mockReturnValue({} as never)

      const mockConfigCache = {
        getConfig: vi.fn(),
      } as never

      await loadCommandConfig({}, mockConfigCache)

      expect(mergeEnvConfig).toHaveBeenCalledWith({}, {})
    })

    test('should log info when config path is found', async () => {
      const { loadCommandConfig } = await import('../../../src/utils/command-helpers.js')
      const { findConfigPath } = await import('../../../src/config/discovery.js')
      const { logger } = await import('../../../src/utils/logger.js')

      vi.mocked(findConfigPath).mockResolvedValue('/path/to/config.json')

      const mockConfigCache = {
        getConfig: vi.fn().mockResolvedValue({ files: [] }),
      } as never

      await loadCommandConfig({}, mockConfigCache)

      expect(logger.info).toHaveBeenCalledWith('Loading config from: /path/to/config.json')
    })

    test('should log debug when no config file found', async () => {
      const { loadCommandConfig } = await import('../../../src/utils/command-helpers.js')
      const { findConfigPath } = await import('../../../src/config/discovery.js')
      const { logger } = await import('../../../src/utils/logger.js')

      vi.mocked(findConfigPath).mockResolvedValue(null)

      const mockConfigCache = {
        getConfig: vi.fn(),
      } as never

      await loadCommandConfig({}, mockConfigCache)

      expect(logger.debug).toHaveBeenCalledWith(
        'No config file found, using defaults with env vars',
      )
    })

    test('should merge env config with cli flags when no config file', async () => {
      const { loadCommandConfig } = await import('../../../src/utils/command-helpers.js')
      const { findConfigPath } = await import('../../../src/config/discovery.js')
      const { mergeConfigs, mergeEnvConfig } = await import('../../../src/config/merger.js')

      vi.mocked(findConfigPath).mockResolvedValue(null)
      const envMerged = { files: ['env.ts'] }
      vi.mocked(mergeEnvConfig).mockImplementationOnce(() => envMerged as never)
      vi.mocked(mergeConfigs).mockImplementation(function (base, cli) {
        return { ...base, ...cli } as never
      })

      const mockConfigCache = {
        getConfig: vi.fn(),
      } as never

      const result = await loadCommandConfig({ files: ['cli.ts'] }, mockConfigCache)

      expect(mergeConfigs).toHaveBeenCalledWith(envMerged, { files: ['cli.ts'] })
      expect(result).toBeDefined()
    })

    test('should handle both files and ignore flags together', async () => {
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

      await loadCommandConfig({ files: ['src/**/*.ts'], ignore: ['node_modules'] }, mockConfigCache)

      expect(mergeConfigs).toHaveBeenCalledWith(
        {},
        { files: ['src/**/*.ts'], ignore: ['node_modules'] },
      )
    })

    test('should not include undefined flags in cliFlagsConfig', async () => {
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

      await loadCommandConfig({}, mockConfigCache)

      expect(mergeConfigs).toHaveBeenCalledWith({}, {})
    })

    test('should validate raw config from cache', async () => {
      const { loadCommandConfig } = await import('../../../src/utils/command-helpers.js')
      const { findConfigPath } = await import('../../../src/config/discovery.js')
      const { validateConfig } = await import('../../../src/config/validator.js')

      const rawConfig = { files: ['raw.ts'] }
      vi.mocked(findConfigPath).mockResolvedValue('/config.json')
      vi.mocked(validateConfig).mockReturnValue({ validated: true } as never)

      const mockConfigCache = {
        getConfig: vi.fn().mockResolvedValue(rawConfig),
      } as never

      await loadCommandConfig({}, mockConfigCache)

      expect(validateConfig).toHaveBeenCalledWith(rawConfig)
    })

    test('should use configCache to read config', async () => {
      const { loadCommandConfig } = await import('../../../src/utils/command-helpers.js')
      const { findConfigPath } = await import('../../../src/config/discovery.js')

      const configPath = '/my/config.json'
      vi.mocked(findConfigPath).mockResolvedValue(configPath)

      const mockGetConfig = vi.fn().mockResolvedValue({ files: [] })
      const mockConfigCache = { getConfig: mockGetConfig } as never

      await loadCommandConfig({}, mockConfigCache)

      expect(mockGetConfig).toHaveBeenCalledWith(configPath)
    })

    test('should not call validateConfig when configCache returns null', async () => {
      const { loadCommandConfig } = await import('../../../src/utils/command-helpers.js')
      const { findConfigPath } = await import('../../../src/config/discovery.js')
      const { validateConfig } = await import('../../../src/config/validator.js')

      vi.mocked(findConfigPath).mockResolvedValue('/config.json')

      const mockConfigCache = {
        getConfig: vi.fn().mockResolvedValue(null),
      } as never

      await loadCommandConfig({}, mockConfigCache)

      expect(validateConfig).not.toHaveBeenCalled()
    })
  })

  describe('normalizeFlags', () => {
    test('should normalize all flags correctly', async () => {
      const { normalizeFlags } = await import('../../../src/utils/command-helpers.js')

      const result = normalizeFlags({
        'cache-results': true,
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
        cacheResults: true,
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
        'cache-results': false,
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
        'cache-results': false,
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
        'cache-results': false,
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
        'cache-results': false,
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
        'cache-results': false,
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

    test('should map cache-results to cacheResults', async () => {
      const { normalizeFlags } = await import('../../../src/utils/command-helpers.js')

      const result = normalizeFlags({
        'cache-results': true,
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

      expect(result.cacheResults).toBe(true)
    })

    test('should map fix to shouldFix', async () => {
      const { normalizeFlags } = await import('../../../src/utils/command-helpers.js')

      const result = normalizeFlags({
        'cache-results': false,
        ci: false,
        concurrency: 4,
        'dry-run': false,
        'fail-on-warnings': false,
        fix: true,
        format: 'console',
        'max-warnings': -1,
        output: undefined,
        quiet: false,
        staged: false,
        verbose: false,
      })

      expect(result.shouldFix).toBe(true)
    })

    test('should map dry-run to dryRun', async () => {
      const { normalizeFlags } = await import('../../../src/utils/command-helpers.js')

      const result = normalizeFlags({
        'cache-results': false,
        ci: false,
        concurrency: 4,
        'dry-run': true,
        'fail-on-warnings': false,
        fix: false,
        format: 'console',
        'max-warnings': -1,
        output: undefined,
        quiet: false,
        staged: false,
        verbose: false,
      })

      expect(result.dryRun).toBe(true)
    })

    test('should map staged to stagedMode', async () => {
      const { normalizeFlags } = await import('../../../src/utils/command-helpers.js')

      const result = normalizeFlags({
        'cache-results': false,
        ci: false,
        concurrency: 4,
        'dry-run': false,
        'fail-on-warnings': false,
        fix: false,
        format: 'console',
        'max-warnings': -1,
        output: undefined,
        quiet: false,
        staged: true,
        verbose: false,
      })

      expect(result.stagedMode).toBe(true)
    })

    test('should map fail-on-warnings to failOnWarnings', async () => {
      const { normalizeFlags } = await import('../../../src/utils/command-helpers.js')

      const result = normalizeFlags({
        'cache-results': false,
        ci: false,
        concurrency: 4,
        'dry-run': false,
        'fail-on-warnings': true,
        fix: false,
        format: 'console',
        'max-warnings': -1,
        output: undefined,
        quiet: false,
        staged: false,
        verbose: false,
      })

      expect(result.failOnWarnings).toBe(true)
    })

    test('should map max-warnings to maxWarnings', async () => {
      const { normalizeFlags } = await import('../../../src/utils/command-helpers.js')

      const result = normalizeFlags({
        'cache-results': false,
        ci: false,
        concurrency: 4,
        'dry-run': false,
        'fail-on-warnings': false,
        fix: false,
        format: 'console',
        'max-warnings': 50,
        output: undefined,
        quiet: false,
        staged: false,
        verbose: false,
      })

      expect(result.maxWarnings).toBe(50)
    })

    test('should pass through output', async () => {
      const { normalizeFlags } = await import('../../../src/utils/command-helpers.js')

      const result = normalizeFlags({
        'cache-results': false,
        ci: false,
        concurrency: 4,
        'dry-run': false,
        'fail-on-warnings': false,
        fix: false,
        format: 'console',
        'max-warnings': -1,
        output: 'report.json',
        quiet: false,
        staged: false,
        verbose: false,
      })

      expect(result.output).toBe('report.json')
    })

    test('should pass through undefined output', async () => {
      const { normalizeFlags } = await import('../../../src/utils/command-helpers.js')

      const result = normalizeFlags({
        'cache-results': false,
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

      expect(result.output).toBeUndefined()
    })

    test('should pass through concurrency', async () => {
      const { normalizeFlags } = await import('../../../src/utils/command-helpers.js')

      const result = normalizeFlags({
        'cache-results': false,
        ci: false,
        concurrency: 16,
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

      expect(result.concurrency).toBe(16)
    })

    test('should preserve json format in non-CI mode', async () => {
      const { normalizeFlags } = await import('../../../src/utils/command-helpers.js')

      const result = normalizeFlags({
        'cache-results': false,
        ci: false,
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

      expect(result.format).toBe('json')
    })

    test('should preserve html format in CI mode', async () => {
      const { normalizeFlags } = await import('../../../src/utils/command-helpers.js')

      const result = normalizeFlags({
        'cache-results': false,
        ci: true,
        concurrency: 4,
        'dry-run': false,
        'fail-on-warnings': false,
        fix: false,
        format: 'html',
        'max-warnings': -1,
        output: undefined,
        quiet: false,
        staged: false,
        verbose: true,
      })

      expect(result.format).toBe('html')
    })

    test('should preserve markdown format in CI mode', async () => {
      const { normalizeFlags } = await import('../../../src/utils/command-helpers.js')

      const result = normalizeFlags({
        'cache-results': false,
        ci: true,
        concurrency: 4,
        'dry-run': false,
        'fail-on-warnings': false,
        fix: false,
        format: 'markdown',
        'max-warnings': -1,
        output: undefined,
        quiet: false,
        staged: false,
        verbose: false,
      })

      expect(result.format).toBe('markdown')
    })

    test('should preserve sarif format in CI mode', async () => {
      const { normalizeFlags } = await import('../../../src/utils/command-helpers.js')

      const result = normalizeFlags({
        'cache-results': false,
        ci: true,
        concurrency: 4,
        'dry-run': false,
        'fail-on-warnings': false,
        fix: false,
        format: 'sarif',
        'max-warnings': -1,
        output: undefined,
        quiet: false,
        staged: false,
        verbose: false,
      })

      expect(result.format).toBe('sarif')
    })

    test('should preserve console format in non-CI mode', async () => {
      const { normalizeFlags } = await import('../../../src/utils/command-helpers.js')

      const result = normalizeFlags({
        'cache-results': false,
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

      expect(result.format).toBe('console')
    })

    test('should allow verbose when not in CI mode', async () => {
      const { normalizeFlags } = await import('../../../src/utils/command-helpers.js')

      const result = normalizeFlags({
        'cache-results': false,
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
        verbose: true,
      })

      expect(result.verbose).toBe(true)
    })

    test('should allow quiet when not in CI mode', async () => {
      const { normalizeFlags } = await import('../../../src/utils/command-helpers.js')

      const result = normalizeFlags({
        'cache-results': false,
        ci: false,
        concurrency: 4,
        'dry-run': false,
        'fail-on-warnings': false,
        fix: false,
        format: 'console',
        'max-warnings': -1,
        output: undefined,
        quiet: true,
        staged: false,
        verbose: false,
      })

      expect(result.quiet).toBe(true)
    })

    test('should force quiet when in CI mode even if quiet is false', async () => {
      const { normalizeFlags } = await import('../../../src/utils/command-helpers.js')

      const result = normalizeFlags({
        'cache-results': false,
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

    test('should force verbose false when in CI mode even if verbose is true', async () => {
      const { normalizeFlags } = await import('../../../src/utils/command-helpers.js')

      const result = normalizeFlags({
        'cache-results': false,
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

    test('should handle negative maxWarnings', async () => {
      const { normalizeFlags } = await import('../../../src/utils/command-helpers.js')

      const result = normalizeFlags({
        'cache-results': false,
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

      expect(result.maxWarnings).toBe(-1)
    })

    test('should handle zero maxWarnings', async () => {
      const { normalizeFlags } = await import('../../../src/utils/command-helpers.js')

      const result = normalizeFlags({
        'cache-results': false,
        ci: false,
        concurrency: 4,
        'dry-run': false,
        'fail-on-warnings': false,
        fix: false,
        format: 'console',
        'max-warnings': 0,
        output: undefined,
        quiet: false,
        staged: false,
        verbose: false,
      })

      expect(result.maxWarnings).toBe(0)
    })

    test('should handle large maxWarnings value', async () => {
      const { normalizeFlags } = await import('../../../src/utils/command-helpers.js')

      const result = normalizeFlags({
        'cache-results': false,
        ci: false,
        concurrency: 4,
        'dry-run': false,
        'fail-on-warnings': false,
        fix: false,
        format: 'console',
        'max-warnings': 999999,
        output: undefined,
        quiet: false,
        staged: false,
        verbose: false,
      })

      expect(result.maxWarnings).toBe(999999)
    })

    test('should preserve csv format in CI mode', async () => {
      const { normalizeFlags } = await import('../../../src/utils/command-helpers.js')

      const result = normalizeFlags({
        'cache-results': false,
        ci: true,
        concurrency: 4,
        'dry-run': false,
        'fail-on-warnings': false,
        fix: false,
        format: 'csv',
        'max-warnings': -1,
        output: undefined,
        quiet: false,
        staged: false,
        verbose: false,
      })

      expect(result.format).toBe('csv')
    })

    test('should preserve gitlab format in CI mode', async () => {
      const { normalizeFlags } = await import('../../../src/utils/command-helpers.js')

      const result = normalizeFlags({
        'cache-results': false,
        ci: true,
        concurrency: 4,
        'dry-run': false,
        'fail-on-warnings': false,
        fix: false,
        format: 'gitlab',
        'max-warnings': -1,
        output: undefined,
        quiet: false,
        staged: false,
        verbose: false,
      })

      expect(result.format).toBe('gitlab')
    })

    test('should handle cache-results false', async () => {
      const { normalizeFlags } = await import('../../../src/utils/command-helpers.js')

      const result = normalizeFlags({
        'cache-results': false,
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

      expect(result.cacheResults).toBe(false)
    })

    test('should handle concurrency of 1', async () => {
      const { normalizeFlags } = await import('../../../src/utils/command-helpers.js')

      const result = normalizeFlags({
        'cache-results': false,
        ci: false,
        concurrency: 1,
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

      expect(result.concurrency).toBe(1)
    })

    test('should handle high concurrency value', async () => {
      const { normalizeFlags } = await import('../../../src/utils/command-helpers.js')

      const result = normalizeFlags({
        'cache-results': false,
        ci: false,
        concurrency: 100,
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

      expect(result.concurrency).toBe(100)
    })

    test('should map ci to ciMode', async () => {
      const { normalizeFlags } = await import('../../../src/utils/command-helpers.js')

      const result = normalizeFlags({
        'cache-results': false,
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

      expect(result.ciMode).toBe(true)
    })

    test('should return output with file path', async () => {
      const { normalizeFlags } = await import('../../../src/utils/command-helpers.js')

      const result = normalizeFlags({
        'cache-results': false,
        ci: false,
        concurrency: 4,
        'dry-run': false,
        'fail-on-warnings': false,
        fix: false,
        format: 'json',
        'max-warnings': -1,
        output: './reports/output.json',
        quiet: false,
        staged: false,
        verbose: false,
      })

      expect(result.output).toBe('./reports/output.json')
    })

    test('should handle CI mode with console format override to json', async () => {
      const { normalizeFlags } = await import('../../../src/utils/command-helpers.js')

      const result = normalizeFlags({
        'cache-results': true,
        ci: true,
        concurrency: 8,
        'dry-run': true,
        'fail-on-warnings': true,
        fix: true,
        format: 'console',
        'max-warnings': 5,
        output: 'ci-output.json',
        quiet: false,
        staged: true,
        verbose: true,
      })

      expect(result.format).toBe('json')
      expect(result.quiet).toBe(true)
      expect(result.verbose).toBe(false)
      expect(result.ciMode).toBe(true)
      expect(result.cacheResults).toBe(true)
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

    test('should handle empty files array', async () => {
      const { filterFilesByExtension } = await import('../../../src/utils/command-helpers.js')

      const result = filterFilesByExtension([], '.ts')

      expect(result).toEqual([])
    })

    test('should handle empty files array with no extension', async () => {
      const { filterFilesByExtension } = await import('../../../src/utils/command-helpers.js')

      const result = filterFilesByExtension([])

      expect(result).toEqual([])
    })

    test('should filter .tsx files', async () => {
      const { filterFilesByExtension } = await import('../../../src/utils/command-helpers.js')

      const files = [
        { path: 'component.tsx', absolutePath: '/abs/component.tsx' },
        { path: 'component.ts', absolutePath: '/abs/component.ts' },
        { path: 'style.css', absolutePath: '/abs/style.css' },
      ]

      const result = filterFilesByExtension(files, '.tsx')

      expect(result).toHaveLength(1)
      expect(result[0].path).toBe('component.tsx')
    })

    test('should filter .jsx files', async () => {
      const { filterFilesByExtension } = await import('../../../src/utils/command-helpers.js')

      const files = [
        { path: 'app.jsx', absolutePath: '/abs/app.jsx' },
        { path: 'app.js', absolutePath: '/abs/app.js' },
      ]

      const result = filterFilesByExtension(files, '.jsx')

      expect(result).toHaveLength(1)
      expect(result[0].path).toBe('app.jsx')
    })

    test('should handle extensions with extra whitespace', async () => {
      const { filterFilesByExtension } = await import('../../../src/utils/command-helpers.js')

      const files = [
        { path: 'test.ts', absolutePath: '/abs/test.ts' },
        { path: 'test.js', absolutePath: '/abs/test.js' },
      ]

      const result = filterFilesByExtension(files, '  .ts  ,  .js  ')

      expect(result).toHaveLength(2)
    })

    test('should handle deeply nested file paths', async () => {
      const { filterFilesByExtension } = await import('../../../src/utils/command-helpers.js')

      const files = [
        { path: 'src/components/ui/Button.tsx', absolutePath: '/abs/src/components/ui/Button.tsx' },
        { path: 'src/utils/helpers.ts', absolutePath: '/abs/src/utils/helpers.ts' },
      ]

      const result = filterFilesByExtension(files, '.tsx')

      expect(result).toHaveLength(1)
      expect(result[0].path).toBe('src/components/ui/Button.tsx')
    })

    test('should handle files with multiple dots in name', async () => {
      const { filterFilesByExtension } = await import('../../../src/utils/command-helpers.js')

      const files = [
        { path: 'my.component.test.ts', absolutePath: '/abs/my.component.test.ts' },
        { path: 'my.component.tsx', absolutePath: '/abs/my.component.tsx' },
      ]

      const result = filterFilesByExtension(files, '.ts')

      expect(result).toHaveLength(1)
      expect(result[0].path).toBe('my.component.test.ts')
    })

    test('should handle .test.ts pattern matching', async () => {
      const { filterFilesByExtension } = await import('../../../src/utils/command-helpers.js')

      const files = [
        { path: 'foo.test.ts', absolutePath: '/abs/foo.test.ts' },
        { path: 'bar.spec.ts', absolutePath: '/abs/bar.spec.ts' },
        { path: 'main.ts', absolutePath: '/abs/main.ts' },
      ]

      const result = filterFilesByExtension(files, '.ts')

      expect(result).toHaveLength(3)
    })

    test('should handle case-insensitive .JS extension', async () => {
      const { filterFilesByExtension } = await import('../../../src/utils/command-helpers.js')

      const files = [
        { path: 'app.JS', absolutePath: '/abs/app.JS' },
        { path: 'app.js', absolutePath: '/abs/app.js' },
      ]

      const result = filterFilesByExtension(files, '.js')

      expect(result).toHaveLength(2)
    })

    test('should preserve absolutePath in filtered results', async () => {
      const { filterFilesByExtension } = await import('../../../src/utils/command-helpers.js')

      const files = [{ path: 'test.ts', absolutePath: '/absolute/path/test.ts' }]

      const result = filterFilesByExtension(files, '.ts')

      expect(result[0].absolutePath).toBe('/absolute/path/test.ts')
    })

    test('should filter .css files', async () => {
      const { filterFilesByExtension } = await import('../../../src/utils/command-helpers.js')

      const files = [
        { path: 'style.css', absolutePath: '/abs/style.css' },
        { path: 'style.scss', absolutePath: '/abs/style.scss' },
      ]

      const result = filterFilesByExtension(files, '.css')

      expect(result).toHaveLength(1)
      expect(result[0].path).toBe('style.css')
    })

    test('should filter .json files', async () => {
      const { filterFilesByExtension } = await import('../../../src/utils/command-helpers.js')

      const files = [
        { path: 'package.json', absolutePath: '/abs/package.json' },
        { path: 'tsconfig.json', absolutePath: '/abs/tsconfig.json' },
        { path: 'index.ts', absolutePath: '/abs/index.ts' },
      ]

      const result = filterFilesByExtension(files, '.json')

      expect(result).toHaveLength(2)
    })

    test('should handle single extension without comma', async () => {
      const { filterFilesByExtension } = await import('../../../src/utils/command-helpers.js')

      const files = [
        { path: 'test.ts', absolutePath: '/abs/test.ts' },
        { path: 'test.js', absolutePath: '/abs/test.js' },
      ]

      const result = filterFilesByExtension(files, '.ts')

      expect(result).toHaveLength(1)
    })

    test('should filter mixed case extensions', async () => {
      const { filterFilesByExtension } = await import('../../../src/utils/command-helpers.js')

      const files = [
        { path: 'test.TSX', absolutePath: '/abs/test.TSX' },
        { path: 'test.tsx', absolutePath: '/abs/test.tsx' },
        { path: 'test.ts', absolutePath: '/abs/test.ts' },
      ]

      const result = filterFilesByExtension(files, '.tsx')

      expect(result).toHaveLength(2)
    })

    test('should handle file with dot at start of name', async () => {
      const { filterFilesByExtension } = await import('../../../src/utils/command-helpers.js')

      const files = [
        { path: '.eslintrc.json', absolutePath: '/abs/.eslintrc.json' },
        { path: 'package.json', absolutePath: '/abs/package.json' },
      ]

      const result = filterFilesByExtension(files, '.json')

      expect(result).toHaveLength(2)
    })

    test('should handle .mjs extension', async () => {
      const { filterFilesByExtension } = await import('../../../src/utils/command-helpers.js')

      const files = [
        { path: 'index.mjs', absolutePath: '/abs/index.mjs' },
        { path: 'index.js', absolutePath: '/abs/index.js' },
      ]

      const result = filterFilesByExtension(files, '.mjs')

      expect(result).toHaveLength(1)
      expect(result[0].path).toBe('index.mjs')
    })

    test('should handle .cjs extension', async () => {
      const { filterFilesByExtension } = await import('../../../src/utils/command-helpers.js')

      const files = [
        { path: 'config.cjs', absolutePath: '/abs/config.cjs' },
        { path: 'config.js', absolutePath: '/abs/config.js' },
      ]

      const result = filterFilesByExtension(files, '.cjs')

      expect(result).toHaveLength(1)
      expect(result[0].path).toBe('config.cjs')
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

    test('should pass multiple violations to applyFixesFn', async () => {
      const { applyFixesToFiles } = await import('../../../src/utils/command-helpers.js')

      const mockApplyFixesFn = vi.fn().mockResolvedValue({ fixesApplied: 3, fixesSkipped: 1 })
      const violations = [
        createMockViolation('rule-a'),
        createMockViolation('rule-b'),
        createMockViolation('rule-c'),
      ]

      const result = await applyFixesToFiles({
        allViolations: violations,
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

      expect(mockApplyFixesFn).toHaveBeenCalledWith(
        expect.objectContaining({ allViolations: violations }),
      )
      expect(result).toEqual({ fixesApplied: 3, fixesSkipped: 1 })
    })

    test('should pass verbose flag to applyFixesFn', async () => {
      const { applyFixesToFiles } = await import('../../../src/utils/command-helpers.js')

      const mockApplyFixesFn = vi.fn().mockResolvedValue({ fixesApplied: 1, fixesSkipped: 0 })

      await applyFixesToFiles({
        allViolations: [createMockViolation('test')],
        applyFixesFn: mockApplyFixesFn,
        concurrency: 4,
        discoveredFiles: [],
        dryRun: false,
        parseCache: new Map(),
        parser: {} as never,
        quiet: false,
        rulesWithFixes: new Map(),
        verbose: true,
      })

      const callArgs = mockApplyFixesFn.mock.calls[0][0]
      expect(callArgs.verbose).toBe(true)
    })

    test('should pass concurrency to applyFixesFn', async () => {
      const { applyFixesToFiles } = await import('../../../src/utils/command-helpers.js')

      const mockApplyFixesFn = vi.fn().mockResolvedValue({ fixesApplied: 0, fixesSkipped: 0 })

      await applyFixesToFiles({
        allViolations: [createMockViolation('test')],
        applyFixesFn: mockApplyFixesFn,
        concurrency: 16,
        discoveredFiles: [],
        dryRun: false,
        parseCache: new Map(),
        parser: {} as never,
        quiet: false,
        rulesWithFixes: new Map(),
        verbose: false,
      })

      const callArgs = mockApplyFixesFn.mock.calls[0][0]
      expect(callArgs.concurrency).toBe(16)
    })

    test('should pass parseCache to applyFixesFn', async () => {
      const { applyFixesToFiles } = await import('../../../src/utils/command-helpers.js')

      const mockApplyFixesFn = vi.fn().mockResolvedValue({ fixesApplied: 0, fixesSkipped: 0 })
      const cache = new Map()

      await applyFixesToFiles({
        allViolations: [createMockViolation('test')],
        applyFixesFn: mockApplyFixesFn,
        concurrency: 4,
        discoveredFiles: [],
        dryRun: false,
        parseCache: cache,
        parser: {} as never,
        quiet: false,
        rulesWithFixes: new Map(),
        verbose: false,
      })

      const callArgs = mockApplyFixesFn.mock.calls[0][0]
      expect(callArgs.parseCache).toBe(cache)
    })

    test('should pass discoveredFiles to applyFixesFn', async () => {
      const { applyFixesToFiles } = await import('../../../src/utils/command-helpers.js')

      const mockApplyFixesFn = vi.fn().mockResolvedValue({ fixesApplied: 0, fixesSkipped: 0 })
      const discoveredFiles = [
        { path: 'a.ts', absolutePath: '/abs/a.ts' },
        { path: 'b.ts', absolutePath: '/abs/b.ts' },
      ]

      await applyFixesToFiles({
        allViolations: [createMockViolation('test')],
        applyFixesFn: mockApplyFixesFn,
        concurrency: 4,
        discoveredFiles,
        dryRun: false,
        parseCache: new Map(),
        parser: {} as never,
        quiet: false,
        rulesWithFixes: new Map(),
        verbose: false,
      })

      const callArgs = mockApplyFixesFn.mock.calls[0][0]
      expect(callArgs.discoveredFiles).toBe(discoveredFiles)
    })

    test('should pass rulesWithFixes to applyFixesFn', async () => {
      const { applyFixesToFiles } = await import('../../../src/utils/command-helpers.js')

      const mockApplyFixesFn = vi.fn().mockResolvedValue({ fixesApplied: 0, fixesSkipped: 0 })
      const rulesWithFixes = new Map()

      await applyFixesToFiles({
        allViolations: [createMockViolation('test')],
        applyFixesFn: mockApplyFixesFn,
        concurrency: 4,
        discoveredFiles: [],
        dryRun: false,
        parseCache: new Map(),
        parser: {} as never,
        quiet: false,
        rulesWithFixes,
        verbose: false,
      })

      const callArgs = mockApplyFixesFn.mock.calls[0][0]
      expect(callArgs.rulesWithFixes).toBe(rulesWithFixes)
    })

    test('should pass parser to applyFixesFn', async () => {
      const { applyFixesToFiles } = await import('../../../src/utils/command-helpers.js')

      const mockApplyFixesFn = vi.fn().mockResolvedValue({ fixesApplied: 0, fixesSkipped: 0 })
      const mockParser = { parse: vi.fn() }

      await applyFixesToFiles({
        allViolations: [createMockViolation('test')],
        applyFixesFn: mockApplyFixesFn,
        concurrency: 4,
        discoveredFiles: [],
        dryRun: false,
        parseCache: new Map(),
        parser: mockParser as never,
        quiet: false,
        rulesWithFixes: new Map(),
        verbose: false,
      })

      const callArgs = mockApplyFixesFn.mock.calls[0][0]
      expect(callArgs.parser).toBe(mockParser)
    })

    test('should return early result with zero counts', async () => {
      const { applyFixesToFiles } = await import('../../../src/utils/command-helpers.js')

      const mockApplyFixesFn = vi.fn().mockResolvedValue({ fixesApplied: 99, fixesSkipped: 99 })

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

      expect(result.fixesApplied).toBe(0)
      expect(result.fixesSkipped).toBe(0)
    })

    test('should propagate applyFixesFn result exactly', async () => {
      const { applyFixesToFiles } = await import('../../../src/utils/command-helpers.js')

      const expectedResult = { fixesApplied: 42, fixesSkipped: 7 }
      const mockApplyFixesFn = vi.fn().mockResolvedValue(expectedResult)

      const result = await applyFixesToFiles({
        allViolations: [createMockViolation('test')],
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

      expect(result).toBe(expectedResult)
    })

    test('should handle dryRun false correctly', async () => {
      const { applyFixesToFiles } = await import('../../../src/utils/command-helpers.js')

      const mockApplyFixesFn = vi.fn().mockResolvedValue({ fixesApplied: 1, fixesSkipped: 0 })

      await applyFixesToFiles({
        allViolations: [createMockViolation('test')],
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

      const callArgs = mockApplyFixesFn.mock.calls[0][0]
      expect(callArgs.dryRun).toBe(false)
    })
  })

  describe('setupRuleRegistryLazy', () => {
    test('should register all rules when no requestedRules provided', async () => {
      const { setupRuleRegistryLazy } = await import('../../../src/utils/command-helpers.js')
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

      const registry = await setupRuleRegistryLazy(undefined)

      expect(mockRegister).toHaveBeenCalledTimes(3)
      expect(mockDisable).not.toHaveBeenCalled()
      expect(registry).toBeDefined()
    })

    test('should disable rules not in requestedRules', async () => {
      const { setupRuleRegistryLazy } = await import('../../../src/utils/command-helpers.js')
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

      const registry = await setupRuleRegistryLazy(['rule-one'])

      expect(mockRegister).toHaveBeenCalledTimes(1)
      expect(mockRegister).toHaveBeenCalledWith('rule-one', { meta: { id: 'rule-one' } }, 'style')
      expect(mockDisable).not.toHaveBeenCalled()
      expect(registry).toBeDefined()
    })

    test('should handle empty requestedRules array', async () => {
      const { setupRuleRegistryLazy } = await import('../../../src/utils/command-helpers.js')
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

      const registry = await setupRuleRegistryLazy([])

      expect(mockRegister).toHaveBeenCalled()
      expect(mockDisable).not.toHaveBeenCalled()
      expect(registry).toBeDefined()
    })

    test('should log warning for unknown rules', async () => {
      const { setupRuleRegistryLazy } = await import('../../../src/utils/command-helpers.js')
      const { RuleRegistry } = await import('../../../src/core/rule-registry.js')
      const { logger } = await import('../../../src/utils/logger.js')

      const mockRegister = vi.fn()
      const mockDisable = vi.fn()

      vi.mocked(RuleRegistry).mockImplementation(function () {
        return {
          register: mockRegister,
          disable: mockDisable,
          runRules: vi.fn().mockReturnValue([]),
        } as never
      })

      await setupRuleRegistryLazy(['rule-one', 'unknown-rule'])

      expect(logger.warn).toHaveBeenCalledWith('Unknown rules will be ignored: unknown-rule')
    })

    test('should not log warning when all rules are known', async () => {
      const { setupRuleRegistryLazy } = await import('../../../src/utils/command-helpers.js')
      const { RuleRegistry } = await import('../../../src/core/rule-registry.js')
      const { logger } = await import('../../../src/utils/logger.js')

      const mockRegister = vi.fn()
      const mockDisable = vi.fn()

      vi.mocked(RuleRegistry).mockImplementation(function () {
        return {
          register: mockRegister,
          disable: mockDisable,
          runRules: vi.fn().mockReturnValue([]),
        } as never
      })

      await setupRuleRegistryLazy(['rule-one', 'rule-two', 'rule-three'])

      expect(logger.warn).not.toHaveBeenCalled()
    })

    test('should call lazyRuleLoader.loadAllRules', async () => {
      const { setupRuleRegistryLazy } = await import('../../../src/utils/command-helpers.js')
      const { RuleRegistry } = await import('../../../src/core/rule-registry.js')
      const { lazyRuleLoader } = await import('../../../src/rules/lazy-loader.js')

      const mockRegister = vi.fn()
      const mockDisable = vi.fn()

      vi.mocked(RuleRegistry).mockImplementation(function () {
        return {
          register: mockRegister,
          disable: mockDisable,
          runRules: vi.fn().mockReturnValue([]),
        } as never
      })

      await setupRuleRegistryLazy(undefined)

      expect(lazyRuleLoader.loadAllRules).toHaveBeenCalled()
    })

    test('should register rules with correct category', async () => {
      const { setupRuleRegistryLazy } = await import('../../../src/utils/command-helpers.js')
      const { RuleRegistry } = await import('../../../src/core/rule-registry.js')
      const { getRuleCategory } = await import('../../../src/rules/index.js')

      const mockRegister = vi.fn()
      const mockDisable = vi.fn()

      vi.mocked(RuleRegistry).mockImplementation(function () {
        return {
          register: mockRegister,
          disable: mockDisable,
          runRules: vi.fn().mockReturnValue([]),
        } as never
      })

      await setupRuleRegistryLazy(undefined)

      expect(getRuleCategory).toHaveBeenCalledWith('rule-one')
      expect(getRuleCategory).toHaveBeenCalledWith('rule-two')
      expect(getRuleCategory).toHaveBeenCalledWith('rule-three')
    })

    test('should create a new RuleRegistry instance', async () => {
      const { setupRuleRegistryLazy } = await import('../../../src/utils/command-helpers.js')
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

      await setupRuleRegistryLazy(undefined)

      expect(RuleRegistry).toHaveBeenCalledTimes(1)
    })

    test('should not disable any rule when all rules requested', async () => {
      const { setupRuleRegistryLazy } = await import('../../../src/utils/command-helpers.js')
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

      await setupRuleRegistryLazy(['rule-one', 'rule-two', 'rule-three'])

      expect(mockDisable).not.toHaveBeenCalled()
    })

    test('should not register any rules when only unknown rules requested', async () => {
      const { setupRuleRegistryLazy } = await import('../../../src/utils/command-helpers.js')
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

      await setupRuleRegistryLazy(['nonexistent'])

      expect(mockRegister).not.toHaveBeenCalled()
      expect(mockDisable).not.toHaveBeenCalled()
    })

    test('should register rules with rule definitions from lazy loader', async () => {
      const { setupRuleRegistryLazy } = await import('../../../src/utils/command-helpers.js')
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

      await setupRuleRegistryLazy(undefined)

      expect(mockRegister).toHaveBeenCalledWith('rule-one', { meta: { id: 'rule-one' } }, 'style')
    })

    test('should handle single rule requested', async () => {
      const { setupRuleRegistryLazy } = await import('../../../src/utils/command-helpers.js')
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

      await setupRuleRegistryLazy(['rule-two'])

      expect(mockRegister).toHaveBeenCalledTimes(1)
      expect(mockRegister).toHaveBeenCalledWith('rule-two', { meta: { id: 'rule-two' } }, 'style')
      expect(mockDisable).not.toHaveBeenCalled()
    })

    test('should return a registry with runRules method', async () => {
      const { setupRuleRegistryLazy } = await import('../../../src/utils/command-helpers.js')
      const { RuleRegistry } = await import('../../../src/core/rule-registry.js')

      const mockRunRules = vi.fn().mockReturnValue([])
      vi.mocked(RuleRegistry).mockImplementation(function () {
        return {
          register: vi.fn(),
          disable: vi.fn(),
          runRules: mockRunRules,
        } as never
      })

      const registry = await setupRuleRegistryLazy(undefined)

      expect(typeof registry.runRules).toBe('function')
    })

    test('should register each loaded rule exactly once', async () => {
      const { setupRuleRegistryLazy } = await import('../../../src/utils/command-helpers.js')
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

      await setupRuleRegistryLazy(undefined)

      expect(mockRegister).toHaveBeenCalledTimes(3)
    })

    test('should handle two rules requested', async () => {
      const { setupRuleRegistryLazy } = await import('../../../src/utils/command-helpers.js')
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

      await setupRuleRegistryLazy(['rule-one', 'rule-three'])

      expect(mockRegister).toHaveBeenCalledTimes(2)
      expect(mockRegister).toHaveBeenCalledWith('rule-one', { meta: { id: 'rule-one' } }, 'style')
      expect(mockRegister).toHaveBeenCalledWith('rule-three', { meta: { id: 'rule-three' } }, 'style')
      expect(mockDisable).not.toHaveBeenCalled()
    })
  })

  describe('getProfileSeverityOverrides', () => {
    test('should return lenient profile overrides', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const result = getProfileSeverityOverrides('lenient')

      expect(result).toEqual({
        'max-complexity': 'info',
        'max-depth': 'info',
        'max-file-size': 'info',
        'max-lines': 'info',
        'max-params': 'info',
        'no-console': 'info',
        'no-magic-numbers': 'info',
      })
    })

    test('should return moderate profile overrides', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const result = getProfileSeverityOverrides('moderate')

      expect(result).toEqual({
        'max-complexity': 'warning',
        'max-depth': 'warning',
        'max-file-size': 'warning',
        'no-console': 'warning',
        'no-magic-numbers': 'warning',
      })
    })

    test('should return strict profile overrides', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const result = getProfileSeverityOverrides('strict')

      expect(result).toEqual({
        'no-console': 'error',
        'no-debugger': 'error',
        'no-eval': 'error',
        'no-explicit-any': 'error',
        'no-implicit-coercion': 'error',
        'no-unused-vars': 'error',
        'prefer-const': 'error',
      })
    })

    test('should return empty object for unknown profile', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const result = getProfileSeverityOverrides('lenient')
      expect(typeof result).toBe('object')
    })

    test('should have info severity for all lenient rules', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const result = getProfileSeverityOverrides('lenient')
      const values = Object.values(result)

      expect(values.every((v) => v === 'info')).toBe(true)
    })

    test('should have warning severity for all moderate rules', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const result = getProfileSeverityOverrides('moderate')
      const values = Object.values(result)

      expect(values.every((v) => v === 'warning')).toBe(true)
    })

    test('should have error severity for all strict rules', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const result = getProfileSeverityOverrides('strict')
      const values = Object.values(result)

      expect(values.every((v) => v === 'error')).toBe(true)
    })

    test('should return 7 overrides for lenient profile', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const result = getProfileSeverityOverrides('lenient')

      expect(Object.keys(result)).toHaveLength(7)
    })

    test('should return 5 overrides for moderate profile', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const result = getProfileSeverityOverrides('moderate')

      expect(Object.keys(result)).toHaveLength(5)
    })

    test('should return 7 overrides for strict profile', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const result = getProfileSeverityOverrides('strict')

      expect(Object.keys(result)).toHaveLength(7)
    })

    test('should include no-console in lenient profile', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const result = getProfileSeverityOverrides('lenient')

      expect(result).toHaveProperty('no-console', 'info')
    })

    test('should include no-console in moderate profile', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const result = getProfileSeverityOverrides('moderate')

      expect(result).toHaveProperty('no-console', 'warning')
    })

    test('should include no-console in strict profile', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const result = getProfileSeverityOverrides('strict')

      expect(result).toHaveProperty('no-console', 'error')
    })

    test('should include no-magic-numbers in lenient profile', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const result = getProfileSeverityOverrides('lenient')

      expect(result).toHaveProperty('no-magic-numbers', 'info')
    })

    test('should include no-magic-numbers in moderate profile', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const result = getProfileSeverityOverrides('moderate')

      expect(result).toHaveProperty('no-magic-numbers', 'warning')
    })

    test('should include max-complexity in lenient profile', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const result = getProfileSeverityOverrides('lenient')

      expect(result).toHaveProperty('max-complexity', 'info')
    })

    test('should include max-complexity in moderate profile', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const result = getProfileSeverityOverrides('moderate')

      expect(result).toHaveProperty('max-complexity', 'warning')
    })

    test('should include prefer-const in strict profile', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const result = getProfileSeverityOverrides('strict')

      expect(result).toHaveProperty('prefer-const', 'error')
    })

    test('should include no-debugger in strict profile', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const result = getProfileSeverityOverrides('strict')

      expect(result).toHaveProperty('no-debugger', 'error')
    })

    test('should include no-eval in strict profile', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const result = getProfileSeverityOverrides('strict')

      expect(result).toHaveProperty('no-eval', 'error')
    })

    test('should include no-unused-vars in strict profile', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const result = getProfileSeverityOverrides('strict')

      expect(result).toHaveProperty('no-unused-vars', 'error')
    })

    test('should include no-explicit-any in strict profile', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const result = getProfileSeverityOverrides('strict')

      expect(result).toHaveProperty('no-explicit-any', 'error')
    })

    test('should include no-implicit-coercion in strict profile', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const result = getProfileSeverityOverrides('strict')

      expect(result).toHaveProperty('no-implicit-coercion', 'error')
    })

    test('should include max-depth in lenient profile', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const result = getProfileSeverityOverrides('lenient')

      expect(result).toHaveProperty('max-depth', 'info')
    })

    test('should include max-file-size in lenient profile', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const result = getProfileSeverityOverrides('lenient')

      expect(result).toHaveProperty('max-file-size', 'info')
    })

    test('should include max-lines in lenient profile', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const result = getProfileSeverityOverrides('lenient')

      expect(result).toHaveProperty('max-lines', 'info')
    })

    test('should include max-params in lenient profile', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const result = getProfileSeverityOverrides('lenient')

      expect(result).toHaveProperty('max-params', 'info')
    })

    test('should include max-depth in moderate profile', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const result = getProfileSeverityOverrides('moderate')

      expect(result).toHaveProperty('max-depth', 'warning')
    })

    test('should include max-file-size in moderate profile', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const result = getProfileSeverityOverrides('moderate')

      expect(result).toHaveProperty('max-file-size', 'warning')
    })

    test('should not include max-lines in moderate profile', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const result = getProfileSeverityOverrides('moderate')

      expect(result).not.toHaveProperty('max-lines')
    })

    test('should not include max-params in moderate profile', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const result = getProfileSeverityOverrides('moderate')

      expect(result).not.toHaveProperty('max-params')
    })

    test('should not include no-debugger in lenient profile', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const result = getProfileSeverityOverrides('lenient')

      expect(result).not.toHaveProperty('no-debugger')
    })

    test('should not include no-eval in lenient profile', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const result = getProfileSeverityOverrides('lenient')

      expect(result).not.toHaveProperty('no-eval')
    })

    test('should not include prefer-const in moderate profile', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const result = getProfileSeverityOverrides('moderate')

      expect(result).not.toHaveProperty('prefer-const')
    })

    test('should not include no-unused-vars in moderate profile', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const result = getProfileSeverityOverrides('moderate')

      expect(result).not.toHaveProperty('no-unused-vars')
    })

    test('should not include max-complexity in strict profile', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const result = getProfileSeverityOverrides('strict')

      expect(result).not.toHaveProperty('max-complexity')
    })

    test('should not include max-depth in strict profile', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const result = getProfileSeverityOverrides('strict')

      expect(result).not.toHaveProperty('max-depth')
    })

    test('should return different overrides for different profiles', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const lenient = getProfileSeverityOverrides('lenient')
      const moderate = getProfileSeverityOverrides('moderate')
      const strict = getProfileSeverityOverrides('strict')

      expect(lenient).not.toEqual(moderate)
      expect(moderate).not.toEqual(strict)
      expect(lenient).not.toEqual(strict)
    })

    test('should escalate no-console severity from lenient to strict', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const lenient = getProfileSeverityOverrides('lenient')
      const moderate = getProfileSeverityOverrides('moderate')
      const strict = getProfileSeverityOverrides('strict')

      expect(lenient['no-console']).toBe('info')
      expect(moderate['no-console']).toBe('warning')
      expect(strict['no-console']).toBe('error')
    })

    test('should escalate no-magic-numbers severity from lenient to moderate', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const lenient = getProfileSeverityOverrides('lenient')
      const moderate = getProfileSeverityOverrides('moderate')

      expect(lenient['no-magic-numbers']).toBe('info')
      expect(moderate['no-magic-numbers']).toBe('warning')
    })

    test('should escalate max-complexity from lenient to moderate', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const lenient = getProfileSeverityOverrides('lenient')
      const moderate = getProfileSeverityOverrides('moderate')

      expect(lenient['max-complexity']).toBe('info')
      expect(moderate['max-complexity']).toBe('warning')
    })

    test('should escalate max-depth from lenient to moderate', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const lenient = getProfileSeverityOverrides('lenient')
      const moderate = getProfileSeverityOverrides('moderate')

      expect(lenient['max-depth']).toBe('info')
      expect(moderate['max-depth']).toBe('warning')
    })

    test('should escalate max-file-size from lenient to moderate', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const lenient = getProfileSeverityOverrides('lenient')
      const moderate = getProfileSeverityOverrides('moderate')

      expect(lenient['max-file-size']).toBe('info')
      expect(moderate['max-file-size']).toBe('warning')
    })

    test('should not include no-explicit-any in lenient profile', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const result = getProfileSeverityOverrides('lenient')

      expect(result).not.toHaveProperty('no-explicit-any')
    })

    test('should not include no-implicit-coercion in lenient profile', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const result = getProfileSeverityOverrides('lenient')

      expect(result).not.toHaveProperty('no-implicit-coercion')
    })

    test('should not include no-unused-vars in lenient profile', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const result = getProfileSeverityOverrides('lenient')

      expect(result).not.toHaveProperty('no-unused-vars')
    })

    test('should not include prefer-const in lenient profile', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const result = getProfileSeverityOverrides('lenient')

      expect(result).not.toHaveProperty('prefer-const')
    })

    test('should not include max-lines in moderate profile', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const result = getProfileSeverityOverrides('moderate')

      expect(result).not.toHaveProperty('max-lines')
    })

    test('should not include max-params in moderate profile', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const result = getProfileSeverityOverrides('moderate')

      expect(result).not.toHaveProperty('max-params')
    })

    test('should not include no-explicit-any in moderate profile', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const result = getProfileSeverityOverrides('moderate')

      expect(result).not.toHaveProperty('no-explicit-any')
    })

    test('should not include no-debugger in moderate profile', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const result = getProfileSeverityOverrides('moderate')

      expect(result).not.toHaveProperty('no-debugger')
    })

    test('should not include no-eval in moderate profile', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const result = getProfileSeverityOverrides('moderate')

      expect(result).not.toHaveProperty('no-eval')
    })

    test('should not include no-implicit-coercion in moderate profile', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const result = getProfileSeverityOverrides('moderate')

      expect(result).not.toHaveProperty('no-implicit-coercion')
    })

    test('should not include no-unused-vars in moderate profile', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const result = getProfileSeverityOverrides('moderate')

      expect(result).not.toHaveProperty('no-unused-vars')
    })

    test('should not include max-complexity in strict profile', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const result = getProfileSeverityOverrides('strict')

      expect(result).not.toHaveProperty('max-complexity')
    })

    test('should not include max-depth in strict profile', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const result = getProfileSeverityOverrides('strict')

      expect(result).not.toHaveProperty('max-depth')
    })

    test('should not include max-file-size in strict profile', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const result = getProfileSeverityOverrides('strict')

      expect(result).not.toHaveProperty('max-file-size')
    })

    test('should not include max-lines in strict profile', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const result = getProfileSeverityOverrides('strict')

      expect(result).not.toHaveProperty('max-lines')
    })

    test('should not include max-params in strict profile', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const result = getProfileSeverityOverrides('strict')

      expect(result).not.toHaveProperty('max-params')
    })

    test('should not include no-magic-numbers in strict profile', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const result = getProfileSeverityOverrides('strict')

      expect(result).not.toHaveProperty('no-magic-numbers')
    })

    test('lenient profile should have unique set of rule keys', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const result = getProfileSeverityOverrides('lenient')
      const keys = Object.keys(result)
      const uniqueKeys = new Set(keys)

      expect(keys.length).toBe(uniqueKeys.size)
    })

    test('moderate profile should have unique set of rule keys', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const result = getProfileSeverityOverrides('moderate')
      const keys = Object.keys(result)
      const uniqueKeys = new Set(keys)

      expect(keys.length).toBe(uniqueKeys.size)
    })

    test('strict profile should have unique set of rule keys', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const result = getProfileSeverityOverrides('strict')
      const keys = Object.keys(result)
      const uniqueKeys = new Set(keys)

      expect(keys.length).toBe(uniqueKeys.size)
    })

    test('all profile values should be valid severities', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const validSeverities = new Set(['error', 'warning', 'info'])
      const profiles: Array<'lenient' | 'moderate' | 'strict'> = ['lenient', 'moderate', 'strict']

      for (const profile of profiles) {
        const overrides = getProfileSeverityOverrides(profile)
        for (const severity of Object.values(overrides)) {
          expect(validSeverities.has(severity)).toBe(true)
        }
      }
    })

    test('strict should have more error rules than moderate has warning rules', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const moderate = getProfileSeverityOverrides('moderate')
      const strict = getProfileSeverityOverrides('strict')

      expect(Object.keys(strict).length).toBeGreaterThan(Object.keys(moderate).length)
    })

    test('lenient and strict should have same override count', async () => {
      const { getProfileSeverityOverrides } = await import('../../../src/utils/command-helpers.js')

      const lenient = getProfileSeverityOverrides('lenient')
      const strict = getProfileSeverityOverrides('strict')

      expect(Object.keys(lenient).length).toBe(Object.keys(strict).length)
    })
  })
})
