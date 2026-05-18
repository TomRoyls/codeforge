import { describe, it, expect } from 'vitest'
import { FlagEvaluator } from '../src/core/feature-flags/flag-evaluator.js'
import { FeatureFlags } from '../src/core/feature-flags/feature-flags.js'
import { DEFAULT_FEATURE_FLAG_CONFIG } from '../src/core/feature-flags/types.js'
import type { FeatureFlag, UserContext } from '../src/core/feature-flags/types.js'

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

// ─── FlagEvaluator.hashUserId ──────────────────────────────────────
describe('FlagEvaluator.hashUserId', () => {
  const evaluator = new FlagEvaluator()

  it('returns a positive number', () => {
    expect(evaluator.hashUserId('user1', 'flag1')).toBeGreaterThanOrEqual(0)
  })

  it('returns different hashes for different inputs', () => {
    expect(evaluator.hashUserId('user1', 'flag1')).not.toBe(evaluator.hashUserId('user2', 'flag1'))
  })

  it('returns consistent hash for same input', () => {
    const h1 = evaluator.hashUserId('user1', 'flag1')
    const h2 = evaluator.hashUserId('user1', 'flag1')
    expect(h1).toBe(h2)
  })
})

// ─── FlagEvaluator.isInRollout ─────────────────────────────────────
describe('FlagEvaluator.isInRollout', () => {
  const evaluator = new FlagEvaluator()

  it('returns true for 100% rollout', () => {
    expect(evaluator.isInRollout('anyone', 'flag', 100)).toBe(true)
  })

  it('returns false for 0% rollout', () => {
    expect(evaluator.isInRollout('anyone', 'flag', 0)).toBe(false)
  })

  it('returns consistent results for same inputs', () => {
    const r1 = evaluator.isInRollout('user1', 'flag1', 50)
    const r2 = evaluator.isInRollout('user1', 'flag1', 50)
    expect(r1).toBe(r2)
  })
})

// ─── FlagEvaluator.evaluate ────────────────────────────────────────
describe('FlagEvaluator.evaluate', () => {
  const evaluator = new FlagEvaluator()

  it('returns false when killSwitch is active', () => {
    expect(evaluator.evaluate(makeFlag({ killSwitch: true }))).toBe(false)
  })

  it('returns false when flag is disabled', () => {
    expect(evaluator.evaluate(makeFlag({ enabled: false }))).toBe(false)
  })

  it('returns true for fully enabled flag', () => {
    expect(evaluator.evaluate(makeFlag())).toBe(true)
  })

  it('returns false when targetUsers set but no context', () => {
    expect(evaluator.evaluate(makeFlag({ targetUsers: ['alice'] }))).toBe(false)
  })

  it('returns false when targetUsers set and user not in list', () => {
    const ctx: UserContext = { userId: 'bob', attributes: {} }
    expect(evaluator.evaluate(makeFlag({ targetUsers: ['alice'] }), ctx)).toBe(false)
  })

  it('returns true when user is in targetUsers', () => {
    const ctx: UserContext = { userId: 'alice', attributes: {} }
    expect(evaluator.evaluate(makeFlag({ targetUsers: ['alice'] }), ctx)).toBe(true)
  })

  it('returns false when rollout < 100 and no context', () => {
    expect(evaluator.evaluate(makeFlag({ rolloutPercentage: 50 }))).toBe(false)
  })

  it('respects rollout percentage with context', () => {
    const ctx: UserContext = { userId: 'test-user', attributes: {} }
    const result0 = evaluator.evaluate(makeFlag({ rolloutPercentage: 0 }), ctx)
    const result100 = evaluator.evaluate(makeFlag({ rolloutPercentage: 100 }), ctx)
    expect(result0).toBe(false)
    expect(result100).toBe(true)
  })

  it('killSwitch takes precedence over enabled', () => {
    expect(evaluator.evaluate(makeFlag({ enabled: true, killSwitch: true }))).toBe(false)
  })
})

// ─── FlagEvaluator.selectVariant ───────────────────────────────────
describe('FlagEvaluator.selectVariant', () => {
  const evaluator = new FlagEvaluator()

  it('returns default variant when no variants array', () => {
    expect(evaluator.selectVariant(makeFlag({ variant: 'default', variants: [] }))).toBe('default')
  })

  it('returns first variant when no context', () => {
    expect(evaluator.selectVariant(makeFlag({ variants: ['a', 'b', 'c'] }))).toBe('a')
  })

  it('selects variant based on user hash', () => {
    const ctx: UserContext = { userId: 'user1', attributes: {} }
    const variant = evaluator.selectVariant(makeFlag({ variants: ['red', 'blue'] }), ctx)
    expect(['red', 'blue']).toContain(variant)
  })

  it('returns consistent variant for same user', () => {
    const ctx: UserContext = { userId: 'user1', attributes: {} }
    const v1 = evaluator.selectVariant(makeFlag({ variants: ['a', 'b', 'c'] }), ctx)
    const v2 = evaluator.selectVariant(makeFlag({ variants: ['a', 'b', 'c'] }), ctx)
    expect(v1).toBe(v2)
  })
})

// ─── DEFAULT_FEATURE_FLAG_CONFIG ───────────────────────────────────
describe('DEFAULT_FEATURE_FLAG_CONFIG', () => {
  it('has correct defaults', () => {
    expect(DEFAULT_FEATURE_FLAG_CONFIG).toEqual({
      defaultEnabled: false,
      strictMode: false,
    })
  })
})

// ─── FeatureFlags register / unregister ────────────────────────────
describe('FeatureFlags register / unregister', () => {
  it('registerFlag adds a flag', () => {
    const ff = new FeatureFlags()
    ff.registerFlag(makeFlag())
    expect(ff.getAllFlags()).toHaveLength(1)
  })

  it('registerFlags adds multiple flags', () => {
    const ff = new FeatureFlags()
    ff.registerFlags([makeFlag({ key: 'a' }), makeFlag({ key: 'b' })])
    expect(ff.getAllFlags()).toHaveLength(2)
  })

  it('unregisterFlag removes a flag', () => {
    const ff = new FeatureFlags()
    ff.registerFlag(makeFlag({ key: 'x' }))
    ff.unregisterFlag('x')
    expect(ff.getAllFlags()).toHaveLength(0)
  })

  it('getFlag returns registered flag', () => {
    const ff = new FeatureFlags()
    ff.registerFlag(makeFlag({ key: 'f1' }))
    expect(ff.getFlag('f1')).toBeDefined()
    expect(ff.getFlag('f1')!.key).toBe('f1')
  })

  it('getFlag returns undefined for unknown', () => {
    const ff = new FeatureFlags()
    expect(ff.getFlag('unknown')).toBeUndefined()
  })

  it('getAllFlags returns all flags', () => {
    const ff = new FeatureFlags()
    ff.registerFlags([makeFlag({ key: 'a' }), makeFlag({ key: 'b' })])
    expect(ff.getAllFlags().map((f) => f.key).sort()).toEqual(['a', 'b'])
  })
})

// ─── FeatureFlags isEnabled ────────────────────────────────────────
describe('FeatureFlags isEnabled', () => {
  it('returns true for enabled flag', () => {
    const ff = new FeatureFlags()
    ff.registerFlag(makeFlag({ enabled: true }))
    expect(ff.isEnabled('test-flag')).toBe(true)
  })

  it('returns false for disabled flag', () => {
    const ff = new FeatureFlags()
    ff.registerFlag(makeFlag({ enabled: false }))
    expect(ff.isEnabled('test-flag')).toBe(false)
  })

  it('returns defaultEnabled for unknown flag in non-strict', () => {
    const ff = new FeatureFlags({ defaultEnabled: false })
    expect(ff.isEnabled('unknown')).toBe(false)
  })

  it('returns true for defaultEnabled=true on unknown flag', () => {
    const ff = new FeatureFlags({ defaultEnabled: true })
    expect(ff.isEnabled('unknown')).toBe(true)
  })

  it('throws in strictMode for unknown flag', () => {
    const ff = new FeatureFlags({ strictMode: true })
    expect(() => ff.isEnabled('unknown')).toThrow('Unknown feature flag: unknown')
  })

  it('passes context to evaluator', () => {
    const ff = new FeatureFlags()
    ff.registerFlag(makeFlag({ targetUsers: ['alice'] }))
    expect(ff.isEnabled('test-flag', { userId: 'alice', attributes: {} })).toBe(true)
    expect(ff.isEnabled('test-flag', { userId: 'bob', attributes: {} })).toBe(false)
  })
})

// ─── FeatureFlags getVariant ───────────────────────────────────────
describe('FeatureFlags getVariant', () => {
  it('returns variant for known flag', () => {
    const ff = new FeatureFlags()
    ff.registerFlag(makeFlag({ variants: ['red', 'blue'] }))
    const variant = ff.getVariant('test-flag')
    expect(variant).toBe('red')
  })

  it('returns undefined for unknown flag in non-strict', () => {
    const ff = new FeatureFlags()
    expect(ff.getVariant('unknown')).toBeUndefined()
  })

  it('throws in strictMode for unknown flag', () => {
    const ff = new FeatureFlags({ strictMode: true })
    expect(() => ff.getVariant('unknown')).toThrow()
  })

  it('passes context to evaluator', () => {
    const ff = new FeatureFlags()
    ff.registerFlag(makeFlag({ variants: ['a', 'b'] }))
    const ctx: UserContext = { userId: 'user1', attributes: {} }
    const variant = ff.getVariant('test-flag', ctx)
    expect(['a', 'b']).toContain(variant)
  })
})

// ─── FeatureFlags enable / disable ─────────────────────────────────
describe('FeatureFlags enable / disable', () => {
  it('enable sets flag to enabled', () => {
    const ff = new FeatureFlags()
    ff.registerFlag(makeFlag({ enabled: false }))
    ff.enable('test-flag')
    expect(ff.isEnabled('test-flag')).toBe(true)
  })

  it('disable sets flag to disabled', () => {
    const ff = new FeatureFlags()
    ff.registerFlag(makeFlag({ enabled: true }))
    ff.disable('test-flag')
    expect(ff.isEnabled('test-flag')).toBe(false)
  })

  it('enable on unknown flag does nothing', () => {
    const ff = new FeatureFlags()
    expect(() => ff.enable('unknown')).not.toThrow()
  })

  it('disable on unknown flag does nothing', () => {
    const ff = new FeatureFlags()
    expect(() => ff.disable('unknown')).not.toThrow()
  })
})

// ─── FeatureFlags setKillSwitch ────────────────────────────────────
describe('FeatureFlags setKillSwitch', () => {
  it('activates kill switch', () => {
    const ff = new FeatureFlags()
    ff.registerFlag(makeFlag({ enabled: true, killSwitch: false }))
    ff.setKillSwitch('test-flag', true)
    expect(ff.isEnabled('test-flag')).toBe(false)
  })

  it('deactivates kill switch', () => {
    const ff = new FeatureFlags()
    ff.registerFlag(makeFlag({ enabled: true, killSwitch: true }))
    ff.setKillSwitch('test-flag', false)
    expect(ff.isEnabled('test-flag')).toBe(true)
  })

  it('does nothing for unknown flag', () => {
    const ff = new FeatureFlags()
    expect(() => ff.setKillSwitch('unknown', true)).not.toThrow()
  })
})

// ─── FeatureFlags setRollout ───────────────────────────────────────
describe('FeatureFlags setRollout', () => {
  it('changes rollout percentage', () => {
    const ff = new FeatureFlags()
    ff.registerFlag(makeFlag({ rolloutPercentage: 0 }))
    const ctx: UserContext = { userId: 'user1', attributes: {} }
    expect(ff.isEnabled('test-flag', ctx)).toBe(false)
    ff.setRollout('test-flag', 100)
    expect(ff.isEnabled('test-flag', ctx)).toBe(true)
  })

  it('does nothing for unknown flag', () => {
    const ff = new FeatureFlags()
    expect(() => ff.setRollout('unknown', 50)).not.toThrow()
  })
})

// ─── FeatureFlags getConfig ────────────────────────────────────────
describe('FeatureFlags getConfig', () => {
  it('returns config copy', () => {
    const ff = new FeatureFlags({ strictMode: true })
    const config = ff.getConfig()
    expect(config.strictMode).toBe(true)
    config.strictMode = false
    expect(ff.getConfig().strictMode).toBe(true)
  })
})
