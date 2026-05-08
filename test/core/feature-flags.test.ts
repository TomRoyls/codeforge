import { describe, it, expect } from 'vitest'
import { FlagEvaluator } from '../../src/core/feature-flags/flag-evaluator.js'
import { FeatureFlags } from '../../src/core/feature-flags/feature-flags.js'
import type { FeatureFlag, FeatureFlagConfig, UserContext } from '../../src/core/feature-flags/types.js'
import { DEFAULT_FEATURE_FLAG_CONFIG } from '../../src/core/feature-flags/types.js'

function makeFlag(overrides: Partial<FeatureFlag> = {}): FeatureFlag {
  return {
    key: 'test-flag',
    enabled: true,
    description: 'A test flag',
    rolloutPercentage: 100,
    targetUsers: [],
    killSwitch: false,
    variants: [],
    ...overrides,
  }
}

const evaluator = new FlagEvaluator()

describe('FlagEvaluator', () => {
  describe('hashUserId', () => {
    it('should return consistent hash for same inputs', () => {
      const hash1 = evaluator.hashUserId('user-1', 'flag-a')
      const hash2 = evaluator.hashUserId('user-1', 'flag-a')
      expect(hash1).toBe(hash2)
    })

    it('should return different hashes for different user IDs', () => {
      const hash1 = evaluator.hashUserId('user-1', 'flag-a')
      const hash2 = evaluator.hashUserId('user-2', 'flag-a')
      expect(hash1).not.toBe(hash2)
    })

    it('should return different hashes for different flag keys', () => {
      const hash1 = evaluator.hashUserId('user-1', 'flag-a')
      const hash2 = evaluator.hashUserId('user-1', 'flag-b')
      expect(hash1).not.toBe(hash2)
    })

    it('should return a number', () => {
      const hash = evaluator.hashUserId('user-1', 'flag-a')
      expect(typeof hash).toBe('number')
    })

    it('should return consistent results over multiple calls', () => {
      const results: number[] = []
      for (let i = 0; i < 10; i++) {
        results.push(evaluator.hashUserId('user-1', 'flag-a'))
      }
      expect(new Set(results).size).toBe(1)
    })
  })

  describe('isInRollout', () => {
    it('should return true for 100% rollout', () => {
      expect(evaluator.isInRollout('user-1', 'flag-a', 100)).toBe(true)
    })

    it('should return false for 0% rollout', () => {
      expect(evaluator.isInRollout('user-1', 'flag-a', 0)).toBe(false)
    })

    it('should return true for 100% rollout with any user', () => {
      expect(evaluator.isInRollout('anyone', 'any-flag', 100)).toBe(true)
    })

    it('should return false for 0% rollout with any user', () => {
      expect(evaluator.isInRollout('anyone', 'any-flag', 0)).toBe(false)
    })

    it('should be consistent for same inputs', () => {
      const r1 = evaluator.isInRollout('user-1', 'flag-a', 50)
      const r2 = evaluator.isInRollout('user-1', 'flag-a', 50)
      expect(r1).toBe(r2)
    })

    it('should roughly split users at 50%', () => {
      let inCount = 0
      const total = 100
      for (let i = 0; i < total; i++) {
        if (evaluator.isInRollout(`user-${i}`, 'flag-a', 50)) {
          inCount++
        }
      }
      expect(inCount).toBeGreaterThan(20)
      expect(inCount).toBeLessThan(80)
    })

    it('should include more users at 75%', () => {
      let inCount = 0
      for (let i = 0; i < 100; i++) {
        if (evaluator.isInRollout(`user-${i}`, 'flag-a', 75)) {
          inCount++
        }
      }
      expect(inCount).toBeGreaterThan(50)
    })

    it('should include fewer users at 25%', () => {
      let inCount = 0
      for (let i = 0; i < 100; i++) {
        if (evaluator.isInRollout(`user-${i}`, 'flag-a', 25)) {
          inCount++
        }
      }
      expect(inCount).toBeLessThan(50)
    })
  })

  describe('evaluate', () => {
    it('should return true for enabled flag with no restrictions', () => {
      const flag = makeFlag()
      expect(evaluator.evaluate(flag)).toBe(true)
    })

    it('should return false for disabled flag', () => {
      const flag = makeFlag({ enabled: false })
      expect(evaluator.evaluate(flag)).toBe(false)
    })

    it('should return false when kill switch is active', () => {
      const flag = makeFlag({ killSwitch: true })
      expect(evaluator.evaluate(flag)).toBe(false)
    })

    it('should return true when kill switch is inactive', () => {
      const flag = makeFlag({ killSwitch: false })
      expect(evaluator.evaluate(flag)).toBe(true)
    })

    it('should return false when kill switch overrides enabled', () => {
      const flag = makeFlag({ enabled: true, killSwitch: true })
      expect(evaluator.evaluate(flag)).toBe(false)
    })

    it('should return true when target users match', () => {
      const flag = makeFlag({ targetUsers: ['user-1', 'user-2'] })
      const ctx: UserContext = { userId: 'user-1', attributes: {} }
      expect(evaluator.evaluate(flag, ctx)).toBe(true)
    })

    it('should return false when target users do not match', () => {
      const flag = makeFlag({ targetUsers: ['user-1', 'user-2'] })
      const ctx: UserContext = { userId: 'user-3', attributes: {} }
      expect(evaluator.evaluate(flag, ctx)).toBe(false)
    })

    it('should return false when target users set but no context', () => {
      const flag = makeFlag({ targetUsers: ['user-1'] })
      expect(evaluator.evaluate(flag)).toBe(false)
    })

    it('should allow all users when target users is empty', () => {
      const flag = makeFlag({ targetUsers: [] })
      expect(evaluator.evaluate(flag)).toBe(true)
    })

    it('should allow all users at 100% rollout', () => {
      const flag = makeFlag({ rolloutPercentage: 100 })
      const ctx: UserContext = { userId: 'user-1', attributes: {} }
      expect(evaluator.evaluate(flag, ctx)).toBe(true)
    })

    it('should deny all users at 0% rollout', () => {
      const flag = makeFlag({ rolloutPercentage: 0 })
      const ctx: UserContext = { userId: 'user-1', attributes: {} }
      expect(evaluator.evaluate(flag, ctx)).toBe(false)
    })

    it('should return false when rollout requires context', () => {
      const flag = makeFlag({ rolloutPercentage: 50 })
      expect(evaluator.evaluate(flag)).toBe(false)
    })

    it('should produce consistent rollout results', () => {
      const flag = makeFlag({ rolloutPercentage: 50 })
      const ctx: UserContext = { userId: 'user-1', attributes: {} }
      const r1 = evaluator.evaluate(flag, ctx)
      const r2 = evaluator.evaluate(flag, ctx)
      expect(r1).toBe(r2)
    })

    it('should check target users before rollout', () => {
      const flag = makeFlag({ targetUsers: ['user-1'], rolloutPercentage: 0 })
      const ctx: UserContext = { userId: 'user-2', attributes: {} }
      expect(evaluator.evaluate(flag, ctx)).toBe(false)
    })

    it('should return false when target users match but rollout fails', () => {
      const flag = makeFlag({ targetUsers: ['user-1'], rolloutPercentage: 0 })
      const ctx: UserContext = { userId: 'user-1', attributes: {} }
      expect(evaluator.evaluate(flag, ctx)).toBe(false)
    })

    it('should return true when target users match and rollout passes', () => {
      const flag = makeFlag({ targetUsers: ['user-1'], rolloutPercentage: 100 })
      const ctx: UserContext = { userId: 'user-1', attributes: {} }
      expect(evaluator.evaluate(flag, ctx)).toBe(true)
    })
  })

  describe('selectVariant', () => {
    it('should return undefined when no variants', () => {
      const flag = makeFlag({ variants: [] })
      expect(evaluator.selectVariant(flag)).toBeUndefined()
    })

    it('should return variant property when no variants array', () => {
      const flag = makeFlag({ variants: [], variant: 'control' })
      expect(evaluator.selectVariant(flag)).toBe('control')
    })

    it('should return first variant without context', () => {
      const flag = makeFlag({ variants: ['a', 'b', 'c'] })
      expect(evaluator.selectVariant(flag)).toBe('a')
    })

    it('should select variant based on hash with context', () => {
      const flag = makeFlag({ variants: ['control', 'treatment'] })
      const ctx: UserContext = { userId: 'user-1', attributes: {} }
      const variant = evaluator.selectVariant(flag, ctx)
      expect(flag.variants).toContain(variant)
    })

    it('should return consistent variant for same user', () => {
      const flag = makeFlag({ variants: ['a', 'b', 'c'] })
      const ctx: UserContext = { userId: 'user-1', attributes: {} }
      const v1 = evaluator.selectVariant(flag, ctx)
      const v2 = evaluator.selectVariant(flag, ctx)
      expect(v1).toBe(v2)
    })

    it('should return different variants for different users', () => {
      const flag = makeFlag({ variants: ['control', 'treatment'] })
      const variants = new Set<string>()
      for (let i = 0; i < 20; i++) {
        const ctx: UserContext = { userId: `user-${i}`, attributes: {} }
        variants.add(evaluator.selectVariant(flag, ctx)!)
      }
      expect(variants.size).toBeGreaterThan(1)
    })

    it('should always return a valid variant from the list', () => {
      const flag = makeFlag({ variants: ['x', 'y', 'z'] })
      for (let i = 0; i < 50; i++) {
        const ctx: UserContext = { userId: `user-${i}`, attributes: {} }
        const variant = evaluator.selectVariant(flag, ctx)
        expect(flag.variants).toContain(variant)
      }
    })
  })
})

describe('FeatureFlags', () => {
  describe('constructor', () => {
    it('should use default config when no config provided', () => {
      const ff = new FeatureFlags()
      const config = ff.getConfig()
      expect(config.defaultEnabled).toBe(DEFAULT_FEATURE_FLAG_CONFIG.defaultEnabled)
      expect(config.strictMode).toBe(DEFAULT_FEATURE_FLAG_CONFIG.strictMode)
    })

    it('should accept partial config', () => {
      const ff = new FeatureFlags({ defaultEnabled: true })
      const config = ff.getConfig()
      expect(config.defaultEnabled).toBe(true)
      expect(config.strictMode).toBe(false)
    })

    it('should accept full config', () => {
      const ff = new FeatureFlags({ defaultEnabled: true, strictMode: true })
      const config = ff.getConfig()
      expect(config.defaultEnabled).toBe(true)
      expect(config.strictMode).toBe(true)
    })

    it('should accept empty object config', () => {
      const ff = new FeatureFlags({})
      const config = ff.getConfig()
      expect(config.defaultEnabled).toBe(false)
      expect(config.strictMode).toBe(false)
    })
  })

  describe('registerFlag', () => {
    it('should register a flag', () => {
      const ff = new FeatureFlags()
      ff.registerFlag(makeFlag({ key: 'my-flag' }))
      expect(ff.getFlag('my-flag')).toBeDefined()
    })

    it('should store flag properties correctly', () => {
      const ff = new FeatureFlags()
      const flag = makeFlag({
        key: 'my-flag',
        enabled: true,
        description: 'test description',
        rolloutPercentage: 75,
      })
      ff.registerFlag(flag)
      const stored = ff.getFlag('my-flag')!
      expect(stored.key).toBe('my-flag')
      expect(stored.enabled).toBe(true)
      expect(stored.description).toBe('test description')
      expect(stored.rolloutPercentage).toBe(75)
    })

    it('should overwrite existing flag with same key', () => {
      const ff = new FeatureFlags()
      ff.registerFlag(makeFlag({ key: 'my-flag', description: 'first' }))
      ff.registerFlag(makeFlag({ key: 'my-flag', description: 'second' }))
      expect(ff.getFlag('my-flag')!.description).toBe('second')
    })

    it('should store a copy of targetUsers', () => {
      const ff = new FeatureFlags()
      const targetUsers = ['user-1', 'user-2']
      ff.registerFlag(makeFlag({ key: 'my-flag', targetUsers }))
      targetUsers.push('user-3')
      expect(ff.getFlag('my-flag')!.targetUsers).toEqual(['user-1', 'user-2'])
    })

    it('should store a copy of variants', () => {
      const ff = new FeatureFlags()
      const variants = ['a', 'b']
      ff.registerFlag(makeFlag({ key: 'my-flag', variants }))
      variants.push('c')
      expect(ff.getFlag('my-flag')!.variants).toEqual(['a', 'b'])
    })

    it('should register flag with minimal properties', () => {
      const ff = new FeatureFlags()
      ff.registerFlag({
        key: 'minimal',
        enabled: false,
        description: '',
        rolloutPercentage: 100,
        targetUsers: [],
        killSwitch: false,
        variants: [],
      })
      expect(ff.getFlag('minimal')).toBeDefined()
    })
  })

  describe('registerFlags', () => {
    it('should register multiple flags', () => {
      const ff = new FeatureFlags()
      ff.registerFlags([
        makeFlag({ key: 'flag-a' }),
        makeFlag({ key: 'flag-b' }),
        makeFlag({ key: 'flag-c' }),
      ])
      expect(ff.getFlag('flag-a')).toBeDefined()
      expect(ff.getFlag('flag-b')).toBeDefined()
      expect(ff.getFlag('flag-c')).toBeDefined()
    })

    it('should register empty array without error', () => {
      const ff = new FeatureFlags()
      ff.registerFlags([])
      expect(ff.getAllFlags()).toEqual([])
    })

    it('should make all flags retrievable via getAllFlags', () => {
      const ff = new FeatureFlags()
      ff.registerFlags([
        makeFlag({ key: 'flag-a' }),
        makeFlag({ key: 'flag-b' }),
      ])
      expect(ff.getAllFlags()).toHaveLength(2)
    })
  })

  describe('unregisterFlag', () => {
    it('should remove a registered flag', () => {
      const ff = new FeatureFlags()
      ff.registerFlag(makeFlag({ key: 'my-flag' }))
      ff.unregisterFlag('my-flag')
      expect(ff.getFlag('my-flag')).toBeUndefined()
    })

    it('should not throw for unknown key', () => {
      const ff = new FeatureFlags()
      expect(() => ff.unregisterFlag('unknown')).not.toThrow()
    })

    it('should only remove the specified flag', () => {
      const ff = new FeatureFlags()
      ff.registerFlag(makeFlag({ key: 'flag-a' }))
      ff.registerFlag(makeFlag({ key: 'flag-b' }))
      ff.unregisterFlag('flag-a')
      expect(ff.getFlag('flag-a')).toBeUndefined()
      expect(ff.getFlag('flag-b')).toBeDefined()
    })
  })

  describe('isEnabled', () => {
    it('should return true for enabled flag', () => {
      const ff = new FeatureFlags()
      ff.registerFlag(makeFlag({ key: 'my-flag', enabled: true }))
      expect(ff.isEnabled('my-flag')).toBe(true)
    })

    it('should return false for disabled flag', () => {
      const ff = new FeatureFlags()
      ff.registerFlag(makeFlag({ key: 'my-flag', enabled: false }))
      expect(ff.isEnabled('my-flag')).toBe(false)
    })

    it('should return true for enabled flag with context', () => {
      const ff = new FeatureFlags()
      ff.registerFlag(makeFlag({ key: 'my-flag' }))
      const ctx: UserContext = { userId: 'user-1', attributes: {} }
      expect(ff.isEnabled('my-flag', ctx)).toBe(true)
    })

    it('should return false for unknown flag with default config', () => {
      const ff = new FeatureFlags()
      expect(ff.isEnabled('unknown')).toBe(false)
    })

    it('should return true for unknown flag with defaultEnabled true', () => {
      const ff = new FeatureFlags({ defaultEnabled: true })
      expect(ff.isEnabled('unknown')).toBe(true)
    })

    it('should throw in strictMode for unknown flag', () => {
      const ff = new FeatureFlags({ strictMode: true })
      expect(() => ff.isEnabled('unknown')).toThrow('Unknown feature flag: unknown')
    })

    it('should respect kill switch', () => {
      const ff = new FeatureFlags()
      ff.registerFlag(makeFlag({ key: 'my-flag', enabled: true, killSwitch: true }))
      expect(ff.isEnabled('my-flag')).toBe(false)
    })

    it('should respect target users', () => {
      const ff = new FeatureFlags()
      ff.registerFlag(makeFlag({ key: 'my-flag', targetUsers: ['user-1'] }))
      expect(ff.isEnabled('my-flag', { userId: 'user-1', attributes: {} })).toBe(true)
      expect(ff.isEnabled('my-flag', { userId: 'user-2', attributes: {} })).toBe(false)
    })

    it('should respect rollout percentage', () => {
      const ff = new FeatureFlags()
      ff.registerFlag(makeFlag({ key: 'my-flag', rolloutPercentage: 0 }))
      expect(ff.isEnabled('my-flag', { userId: 'user-1', attributes: {} })).toBe(false)
    })
  })

  describe('getVariant', () => {
    it('should return variant for flag with variants', () => {
      const ff = new FeatureFlags()
      ff.registerFlag(makeFlag({ key: 'my-flag', variants: ['a', 'b'] }))
      const variant = ff.getVariant('my-flag', { userId: 'user-1', attributes: {} })
      expect(['a', 'b']).toContain(variant)
    })

    it('should return undefined for flag without variants', () => {
      const ff = new FeatureFlags()
      ff.registerFlag(makeFlag({ key: 'my-flag', variants: [] }))
      expect(ff.getVariant('my-flag')).toBeUndefined()
    })

    it('should return variant property when no variants array', () => {
      const ff = new FeatureFlags()
      ff.registerFlag(makeFlag({ key: 'my-flag', variants: [], variant: 'control' }))
      expect(ff.getVariant('my-flag')).toBe('control')
    })

    it('should return undefined for unknown flag', () => {
      const ff = new FeatureFlags()
      expect(ff.getVariant('unknown')).toBeUndefined()
    })

    it('should throw in strictMode for unknown flag', () => {
      const ff = new FeatureFlags({ strictMode: true })
      expect(() => ff.getVariant('unknown')).toThrow('Unknown feature flag: unknown')
    })

    it('should return first variant without context', () => {
      const ff = new FeatureFlags()
      ff.registerFlag(makeFlag({ key: 'my-flag', variants: ['control', 'treatment'] }))
      expect(ff.getVariant('my-flag')).toBe('control')
    })

    it('should return consistent variant for same user', () => {
      const ff = new FeatureFlags()
      ff.registerFlag(makeFlag({ key: 'my-flag', variants: ['a', 'b', 'c'] }))
      const v1 = ff.getVariant('my-flag', { userId: 'user-1', attributes: {} })
      const v2 = ff.getVariant('my-flag', { userId: 'user-1', attributes: {} })
      expect(v1).toBe(v2)
    })
  })

  describe('getFlag', () => {
    it('should return flag definition', () => {
      const ff = new FeatureFlags()
      ff.registerFlag(makeFlag({ key: 'my-flag', description: 'hello' }))
      const flag = ff.getFlag('my-flag')!
      expect(flag.key).toBe('my-flag')
      expect(flag.description).toBe('hello')
    })

    it('should return undefined for unknown flag', () => {
      const ff = new FeatureFlags()
      expect(ff.getFlag('unknown')).toBeUndefined()
    })
  })

  describe('getAllFlags', () => {
    it('should return all registered flags', () => {
      const ff = new FeatureFlags()
      ff.registerFlags([
        makeFlag({ key: 'flag-a' }),
        makeFlag({ key: 'flag-b' }),
      ])
      const flags = ff.getAllFlags()
      expect(flags).toHaveLength(2)
      const keys = flags.map((f) => f.key)
      expect(keys).toContain('flag-a')
      expect(keys).toContain('flag-b')
    })

    it('should return empty array when no flags', () => {
      const ff = new FeatureFlags()
      expect(ff.getAllFlags()).toEqual([])
    })

    it('should not include unregistered flags', () => {
      const ff = new FeatureFlags()
      ff.registerFlag(makeFlag({ key: 'flag-a' }))
      ff.unregisterFlag('flag-a')
      expect(ff.getAllFlags()).toEqual([])
    })
  })

  describe('enable/disable', () => {
    it('should enable a disabled flag', () => {
      const ff = new FeatureFlags()
      ff.registerFlag(makeFlag({ key: 'my-flag', enabled: false }))
      expect(ff.isEnabled('my-flag')).toBe(false)
      ff.enable('my-flag')
      expect(ff.isEnabled('my-flag')).toBe(true)
    })

    it('should disable an enabled flag', () => {
      const ff = new FeatureFlags()
      ff.registerFlag(makeFlag({ key: 'my-flag', enabled: true }))
      expect(ff.isEnabled('my-flag')).toBe(true)
      ff.disable('my-flag')
      expect(ff.isEnabled('my-flag')).toBe(false)
    })

    it('should not throw when enabling unknown flag', () => {
      const ff = new FeatureFlags()
      expect(() => ff.enable('unknown')).not.toThrow()
    })

    it('should not throw when disabling unknown flag', () => {
      const ff = new FeatureFlags()
      expect(() => ff.disable('unknown')).not.toThrow()
    })

    it('should toggle flag state', () => {
      const ff = new FeatureFlags()
      ff.registerFlag(makeFlag({ key: 'my-flag', enabled: true }))
      ff.disable('my-flag')
      expect(ff.isEnabled('my-flag')).toBe(false)
      ff.enable('my-flag')
      expect(ff.isEnabled('my-flag')).toBe(true)
    })
  })

  describe('setKillSwitch', () => {
    it('should activate kill switch', () => {
      const ff = new FeatureFlags()
      ff.registerFlag(makeFlag({ key: 'my-flag', enabled: true, killSwitch: false }))
      expect(ff.isEnabled('my-flag')).toBe(true)
      ff.setKillSwitch('my-flag', true)
      expect(ff.isEnabled('my-flag')).toBe(false)
    })

    it('should deactivate kill switch', () => {
      const ff = new FeatureFlags()
      ff.registerFlag(makeFlag({ key: 'my-flag', enabled: true, killSwitch: true }))
      expect(ff.isEnabled('my-flag')).toBe(false)
      ff.setKillSwitch('my-flag', false)
      expect(ff.isEnabled('my-flag')).toBe(true)
    })

    it('should not throw for unknown flag', () => {
      const ff = new FeatureFlags()
      expect(() => ff.setKillSwitch('unknown', true)).not.toThrow()
    })
  })

  describe('setRollout', () => {
    it('should update rollout percentage', () => {
      const ff = new FeatureFlags()
      ff.registerFlag(makeFlag({ key: 'my-flag', rolloutPercentage: 100 }))
      const ctx: UserContext = { userId: 'user-1', attributes: {} }
      expect(ff.isEnabled('my-flag', ctx)).toBe(true)
      ff.setRollout('my-flag', 0)
      expect(ff.isEnabled('my-flag', ctx)).toBe(false)
    })

    it('should not throw for unknown flag', () => {
      const ff = new FeatureFlags()
      expect(() => ff.setRollout('unknown', 50)).not.toThrow()
    })

    it('should allow updating rollout to 100', () => {
      const ff = new FeatureFlags()
      ff.registerFlag(makeFlag({ key: 'my-flag', rolloutPercentage: 0 }))
      ff.setRollout('my-flag', 100)
      const ctx: UserContext = { userId: 'user-1', attributes: {} }
      expect(ff.isEnabled('my-flag', ctx)).toBe(true)
    })
  })

  describe('getConfig', () => {
    it('should return current config', () => {
      const ff = new FeatureFlags({ defaultEnabled: true, strictMode: false })
      const config = ff.getConfig()
      expect(config.defaultEnabled).toBe(true)
      expect(config.strictMode).toBe(false)
    })

    it('should return a copy of config', () => {
      const ff = new FeatureFlags({ defaultEnabled: false })
      const config = ff.getConfig()
      config.defaultEnabled = true
      expect(ff.getConfig().defaultEnabled).toBe(false)
    })
  })
})

describe('Edge Cases', () => {
  it('should deny all users at 0% rollout', () => {
    const ff = new FeatureFlags()
    ff.registerFlag(makeFlag({ key: 'zero-rollout', rolloutPercentage: 0 }))
    for (let i = 0; i < 50; i++) {
      expect(ff.isEnabled('zero-rollout', { userId: `user-${i}`, attributes: {} })).toBe(false)
    }
  })

  it('should allow all users at 100% rollout', () => {
    const ff = new FeatureFlags()
    ff.registerFlag(makeFlag({ key: 'full-rollout', rolloutPercentage: 100 }))
    for (let i = 0; i < 50; i++) {
      expect(ff.isEnabled('full-rollout', { userId: `user-${i}`, attributes: {} })).toBe(true)
    }
  })

  it('should roughly split at 50% rollout', () => {
    const ff = new FeatureFlags()
    ff.registerFlag(makeFlag({ key: 'half-rollout', rolloutPercentage: 50 }))
    let enabled = 0
    for (let i = 0; i < 100; i++) {
      if (ff.isEnabled('half-rollout', { userId: `user-${i}`, attributes: {} })) {
        enabled++
      }
    }
    expect(enabled).toBeGreaterThan(20)
    expect(enabled).toBeLessThan(80)
  })

  it('should allow all users with empty targetUsers', () => {
    const ff = new FeatureFlags()
    ff.registerFlag(makeFlag({ key: 'open-flag', targetUsers: [] }))
    expect(ff.isEnabled('open-flag')).toBe(true)
  })

  it('should block non-targeted users when targetUsers is set', () => {
    const ff = new FeatureFlags()
    ff.registerFlag(makeFlag({ key: 'restricted', targetUsers: ['alice', 'bob'] }))
    expect(ff.isEnabled('restricted', { userId: 'alice', attributes: {} })).toBe(true)
    expect(ff.isEnabled('restricted', { userId: 'charlie', attributes: {} })).toBe(false)
  })

  it('should select different variants for different users', () => {
    const ff = new FeatureFlags()
    ff.registerFlag(makeFlag({ key: 'multi-variant', variants: ['red', 'blue', 'green'] }))
    const seen = new Set<string>()
    for (let i = 0; i < 30; i++) {
      const v = ff.getVariant('multi-variant', { userId: `user-${i}`, attributes: {} })
      seen.add(v!)
    }
    expect(seen.size).toBeGreaterThan(1)
  })

  it('should return undefined variant for flag without variants', () => {
    const ff = new FeatureFlags()
    ff.registerFlag(makeFlag({ key: 'no-variants', variants: [] }))
    expect(ff.getVariant('no-variants')).toBeUndefined()
  })

  it('should handle flag with variant property but empty variants array', () => {
    const ff = new FeatureFlags()
    ff.registerFlag(makeFlag({ key: 'static-variant', variants: [], variant: 'default' }))
    expect(ff.getVariant('static-variant')).toBe('default')
  })
})

describe('DEFAULT_FEATURE_FLAG_CONFIG', () => {
  it('should have default values', () => {
    expect(DEFAULT_FEATURE_FLAG_CONFIG.defaultEnabled).toBe(false)
    expect(DEFAULT_FEATURE_FLAG_CONFIG.strictMode).toBe(false)
  })
})

describe('FeatureFlag type', () => {
  it('should have all required fields', () => {
    const flag: FeatureFlag = {
      key: 'test',
      enabled: true,
      description: 'test flag',
      rolloutPercentage: 100,
      targetUsers: [],
      killSwitch: false,
      variants: [],
    }
    expect(flag).toHaveProperty('key')
    expect(flag).toHaveProperty('enabled')
    expect(flag).toHaveProperty('description')
    expect(flag).toHaveProperty('rolloutPercentage')
    expect(flag).toHaveProperty('targetUsers')
    expect(flag).toHaveProperty('killSwitch')
    expect(flag).toHaveProperty('variants')
  })
})

describe('FeatureFlagConfig type', () => {
  it('should have all required fields', () => {
    const config: FeatureFlagConfig = {
      defaultEnabled: true,
      strictMode: false,
    }
    expect(config).toHaveProperty('defaultEnabled')
    expect(config).toHaveProperty('strictMode')
  })
})

describe('UserContext type', () => {
  it('should have all required fields', () => {
    const ctx: UserContext = {
      userId: 'user-1',
      attributes: { role: 'admin' },
    }
    expect(ctx).toHaveProperty('userId')
    expect(ctx).toHaveProperty('attributes')
  })

  it('should accept empty attributes', () => {
    const ctx: UserContext = {
      userId: 'user-1',
      attributes: {},
    }
    expect(ctx.attributes).toEqual({})
  })
})
