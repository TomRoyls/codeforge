import { describe, expect, it } from 'vitest'

import type { FeatureFlag, UserContext } from '../../../src/core/feature-flags/types.js'

import { FlagEvaluator } from '../../../src/core/feature-flags/flag-evaluator.js'

// ─── Helpers ───

function makeFlag(overrides: Partial<FeatureFlag> = {}): FeatureFlag {
  return {
    key: 'test-flag',
    enabled: true,
    description: 'A test flag',
    rolloutPercentage: 100,
    targetUsers: [],
    killSwitch: false,
    variant: 'default',
    variants: ['default'],
    ...overrides,
  }
}

const userCtx = (userId: string): UserContext => ({ userId, attributes: {} })

// ─── hashUserId ───

describe('FlagEvaluator', () => {
  describe('hashUserId', () => {
    it('returns a positive number', () => {
      const evaluator = new FlagEvaluator()
      const hash = evaluator.hashUserId('user1', 'flag1')
      expect(hash).toBeGreaterThan(0)
    })

    it('returns different hashes for different users', () => {
      const evaluator = new FlagEvaluator()
      const hash1 = evaluator.hashUserId('user1', 'flag1')
      const hash2 = evaluator.hashUserId('user2', 'flag1')
      expect(hash1).not.toBe(hash2)
    })

    it('returns different hashes for different flags', () => {
      const evaluator = new FlagEvaluator()
      const hash1 = evaluator.hashUserId('user1', 'flag1')
      const hash2 = evaluator.hashUserId('user1', 'flag2')
      expect(hash1).not.toBe(hash2)
    })

    it('returns consistent hash for same inputs', () => {
      const evaluator = new FlagEvaluator()
      const hash1 = evaluator.hashUserId('user1', 'flag1')
      const hash2 = evaluator.hashUserId('user1', 'flag1')
      expect(hash1).toBe(hash2)
    })
  })

  // ─── isInRollout ───

  describe('isInRollout', () => {
    it('returns true for 100% rollout', () => {
      const evaluator = new FlagEvaluator()
      expect(evaluator.isInRollout('user1', 'flag1', 100)).toBe(true)
    })

    it('returns false for 0% rollout', () => {
      const evaluator = new FlagEvaluator()
      expect(evaluator.isInRollout('user1', 'flag1', 0)).toBe(false)
    })

    it('is deterministic for same inputs', () => {
      const evaluator = new FlagEvaluator()
      const r1 = evaluator.isInRollout('user1', 'flag1', 50)
      const r2 = evaluator.isInRollout('user1', 'flag1', 50)
      expect(r1).toBe(r2)
    })
  })

  // ─── evaluate ───

  describe('evaluate', () => {
    it('returns true for fully enabled flag with context', () => {
      const evaluator = new FlagEvaluator()
      const flag = makeFlag()
      expect(evaluator.evaluate(flag, userCtx('user1'))).toBe(true)
    })

    it('returns false when flag is disabled', () => {
      const evaluator = new FlagEvaluator()
      const flag = makeFlag({ enabled: false })
      expect(evaluator.evaluate(flag, userCtx('user1'))).toBe(false)
    })

    it('returns false when killSwitch is on', () => {
      const evaluator = new FlagEvaluator()
      const flag = makeFlag({ killSwitch: true })
      expect(evaluator.evaluate(flag, userCtx('user1'))).toBe(false)
    })

    it('killSwitch takes precedence over enabled', () => {
      const evaluator = new FlagEvaluator()
      const flag = makeFlag({ enabled: true, killSwitch: true })
      expect(evaluator.evaluate(flag, userCtx('user1'))).toBe(false)
    })

    it('returns true for targeted user', () => {
      const evaluator = new FlagEvaluator()
      const flag = makeFlag({ targetUsers: ['alice', 'bob'] })
      expect(evaluator.evaluate(flag, userCtx('alice'))).toBe(true)
    })

    it('returns false for non-targeted user', () => {
      const evaluator = new FlagEvaluator()
      const flag = makeFlag({ targetUsers: ['alice', 'bob'] })
      expect(evaluator.evaluate(flag, userCtx('charlie'))).toBe(false)
    })

    it('returns false for targeted flag without context', () => {
      const evaluator = new FlagEvaluator()
      const flag = makeFlag({ targetUsers: ['alice'] })
      expect(evaluator.evaluate(flag)).toBe(false)
    })

    it('returns false for partial rollout without context', () => {
      const evaluator = new FlagEvaluator()
      const flag = makeFlag({ rolloutPercentage: 50 })
      expect(evaluator.evaluate(flag)).toBe(false)
    })
  })

  // ─── selectVariant ───

  describe('selectVariant', () => {
    it('returns default variant when no variants array', () => {
      const evaluator = new FlagEvaluator()
      const flag = makeFlag({ variant: 'control', variants: [] })
      expect(evaluator.selectVariant(flag)).toBe('control')
    })

    it('returns first variant without context', () => {
      const evaluator = new FlagEvaluator()
      const flag = makeFlag({ variants: ['a', 'b', 'c'] })
      expect(evaluator.selectVariant(flag)).toBe('a')
    })

    it('selects variant based on user hash', () => {
      const evaluator = new FlagEvaluator()
      const flag = makeFlag({ variants: ['a', 'b', 'c'] })
      const v1 = evaluator.selectVariant(flag, userCtx('user1'))
      const v2 = evaluator.selectVariant(flag, userCtx('user1'))
      expect(v1).toBe(v2)
      expect(['a', 'b', 'c']).toContain(v1)
    })

    it('different users may get different variants', () => {
      const evaluator = new FlagEvaluator()
      const flag = makeFlag({ variants: ['a', 'b', 'c'] })
      const variants = new Set<string>()
      for (let i = 0; i < 100; i++) {
        variants.add(evaluator.selectVariant(flag, userCtx(`user${i}`)) ?? '')
      }
      expect(variants.size).toBeGreaterThan(1)
    })
  })
})
