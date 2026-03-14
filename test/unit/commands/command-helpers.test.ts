import { describe, test, expect, beforeEach, vi } from 'vitest'

vi.mock('../../../src/core/rule-registry.js', () => ({
  RuleRegistry: vi.fn().mockImplementation(() => ({
    register: vi.fn(),
    disable: vi.fn(),
    runRules: vi.fn().mockReturnValue([]),
  })),
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
  ConfigCache: vi.fn().mockImplementation(() => ({
    getConfig: vi.fn(),
  })),
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
      const { setupRuleRegistry } = await import('../../../src/commands/command-helpers.js')
      const { RuleRegistry } = await import('../../../src/core/rule-registry.js')

      const mockRegister = vi.fn()
      const mockDisable = vi.fn()

      vi.mocked(RuleRegistry).mockImplementation(
        () =>
          ({
            register: mockRegister,
            disable: mockDisable,
            runRules: vi.fn().mockReturnValue([]),
          }) as never,
      )

      const registry = setupRuleRegistry(undefined)

      expect(mockRegister).toHaveBeenCalledTimes(3)
      expect(mockDisable).not.toHaveBeenCalled()
      expect(registry).toBeDefined()
    })

    test('should disable rules not in requestedRules', async () => {
      const { setupRuleRegistry } = await import('../../../src/commands/command-helpers.js')
      const { RuleRegistry } = await import('../../../src/core/rule-registry.js')

      const mockRegister = vi.fn()
      const mockDisable = vi.fn()

      vi.mocked(RuleRegistry).mockImplementation(
        () =>
          ({
            register: mockRegister,
            disable: mockDisable,
            runRules: vi.fn().mockReturnValue([]),
          }) as never,
      )

      const registry = setupRuleRegistry(['rule-one'])

      expect(mockRegister).toHaveBeenCalled()
      expect(mockDisable).toHaveBeenCalledTimes(2)
      expect(mockDisable).toHaveBeenCalledWith('rule-two')
      expect(mockDisable).toHaveBeenCalledWith('rule-three')
      expect(mockDisable).not.toHaveBeenCalledWith('rule-one')
      expect(registry).toBeDefined()
    })

    test('should enable only requested rules', async () => {
      const { setupRuleRegistry } = await import('../../../src/commands/command-helpers.js')
      const { RuleRegistry } = await import('../../../src/core/rule-registry.js')

      const mockRegister = vi.fn()
      const mockDisable = vi.fn()

      vi.mocked(RuleRegistry).mockImplementation(
        () =>
          ({
            register: mockRegister,
            disable: mockDisable,
            runRules: vi.fn().mockReturnValue([]),
          }) as never,
      )

      const registry = setupRuleRegistry(['rule-one', 'rule-two'])

      expect(mockRegister).toHaveBeenCalled()
      expect(mockDisable).toHaveBeenCalledTimes(1)
      expect(mockDisable).toHaveBeenCalledWith('rule-three')
      expect(mockDisable).not.toHaveBeenCalledWith('rule-one')
      expect(mockDisable).not.toHaveBeenCalledWith('rule-two')
      expect(registry).toBeDefined()
    })

    test('should handle empty requestedRules array', async () => {
      const { setupRuleRegistry } = await import('../../../src/commands/command-helpers.js')
      const { RuleRegistry } = await import('../../../src/core/rule-registry.js')

      const mockRegister = vi.fn()
      const mockDisable = vi.fn()

      vi.mocked(RuleRegistry).mockImplementation(
        () =>
          ({
            register: mockRegister,
            disable: mockDisable,
            runRules: vi.fn().mockReturnValue([]),
          }) as never,
      )

      const registry = setupRuleRegistry([])

      expect(mockRegister).toHaveBeenCalled()
      expect(mockDisable).not.toHaveBeenCalled()
      expect(registry).toBeDefined()
    })
  })

  describe('resolvePatterns', () => {
    test('should handle array args', async () => {
      const { resolvePatterns } = await import('../../../src/commands/command-helpers.js')

      expect(resolvePatterns(['a.ts', 'b.ts'], ['default.ts'])).toEqual(['a.ts', 'b.ts'])
    })

    test('should handle string args', async () => {
      const { resolvePatterns } = await import('../../../src/commands/command-helpers.js')

      expect(resolvePatterns('single.ts', ['default.ts'])).toEqual(['single.ts'])
    })

    test('should fall back to config files', async () => {
      const { resolvePatterns } = await import('../../../src/commands/command-helpers.js')

      expect(resolvePatterns(undefined, ['config.ts'])).toEqual(['config.ts'])
    })

    test('should return empty array when no patterns', async () => {
      const { resolvePatterns } = await import('../../../src/commands/command-helpers.js')

      expect(resolvePatterns(undefined, undefined)).toEqual([])
    })

    test('should return empty array when config files is empty', async () => {
      const { resolvePatterns } = await import('../../../src/commands/command-helpers.js')

      expect(resolvePatterns(undefined, [])).toEqual([])
    })

    test('should prefer args over config files', async () => {
      const { resolvePatterns } = await import('../../../src/commands/command-helpers.js')

      expect(resolvePatterns(['args.ts'], ['config.ts'])).toEqual(['args.ts'])
    })
  })

  describe('loadCommandConfig', () => {
    test('should load config from file when found', async () => {
      const { loadCommandConfig } = await import('../../../src/commands/command-helpers.js')
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
      const { loadCommandConfig } = await import('../../../src/commands/command-helpers.js')
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
      const { loadCommandConfig } = await import('../../../src/commands/command-helpers.js')
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
      const { loadCommandConfig } = await import('../../../src/commands/command-helpers.js')
      const { findConfigPath } = await import('../../../src/config/discovery.js')

      vi.mocked(findConfigPath).mockResolvedValue(null)

      const mockConfigCache = {
        getConfig: vi.fn(),
      } as never

      await loadCommandConfig({ config: '/custom/config.json' }, mockConfigCache)

      expect(findConfigPath).toHaveBeenCalledWith('/custom/config.json', process.cwd())
    })

    test('should include files flag in config', async () => {
      const { loadCommandConfig } = await import('../../../src/commands/command-helpers.js')
      const { findConfigPath } = await import('../../../src/config/discovery.js')
      const { mergeConfigs } = await import('../../../src/config/merger.js')

      vi.mocked(findConfigPath).mockResolvedValue(null)
      vi.mocked(mergeConfigs).mockImplementation((base, cli) => ({ ...base, ...cli }) as never)

      const mockConfigCache = {
        getConfig: vi.fn(),
      } as never

      await loadCommandConfig({ files: ['src/**/*.ts'] }, mockConfigCache)

      expect(mergeConfigs).toHaveBeenCalledWith({}, { files: ['src/**/*.ts'] })
    })

    test('should include ignore flag in config', async () => {
      const { loadCommandConfig } = await import('../../../src/commands/command-helpers.js')
      const { findConfigPath } = await import('../../../src/config/discovery.js')
      const { mergeConfigs } = await import('../../../src/config/merger.js')

      vi.mocked(findConfigPath).mockResolvedValue(null)
      vi.mocked(mergeConfigs).mockImplementation((base, cli) => ({ ...base, ...cli }) as never)

      const mockConfigCache = {
        getConfig: vi.fn(),
      } as never

      await loadCommandConfig({ ignore: ['node_modules', 'dist'] }, mockConfigCache)

      expect(mergeConfigs).toHaveBeenCalledWith({}, { ignore: ['node_modules', 'dist'] })
    })
  })
})
