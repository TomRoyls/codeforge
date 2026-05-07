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

vi.mock('../../../src/rules/categories.js', () => ({
  RULE_CATEGORIES: {},
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
      const { getRuleCategory } = await import('../../../src/rules/categories.js')

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
