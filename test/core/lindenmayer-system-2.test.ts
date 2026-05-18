import { describe, expect, it } from 'vitest'
import { LindenmayerSystem2 } from '../../src/core/lindenmayer-system-2/index.js'

// ─── Constructor ───

describe('LindenmayerSystem2', () => {
  describe('constructor', () => {
    it('creates an L-system with given axiom and rules', () => {
      const rules = new Map([['A', 'AB']])
      const ls = new LindenmayerSystem2('A', rules)
      expect(ls.getAxiom()).toBe('A')
      expect(ls.getCurrent()).toBe('A')
    })

    it('creates an L-system with empty rules', () => {
      const ls = new LindenmayerSystem2('A', new Map())
      expect(ls.getCurrent()).toBe('A')
    })

    it('creates an L-system with multiple rules', () => {
      const rules = new Map([
        ['A', 'AB'],
        ['B', 'A'],
      ])
      const ls = new LindenmayerSystem2('A', rules)
      expect(ls.getRules().size).toBe(2)
    })
  })

  // ─── iterateOnce ───

  describe('iterateOnce', () => {
    it('applies rules once', () => {
      const rules = new Map([['A', 'AB']])
      const ls = new LindenmayerSystem2('A', rules)
      expect(ls.iterateOnce()).toBe('AB')
    })

    it('keeps characters without rules unchanged', () => {
      const rules = new Map([['A', 'AB']])
      const ls = new LindenmayerSystem2('AB', rules)
      expect(ls.iterateOnce()).toBe('ABB')
    })

    it('handles empty axiom', () => {
      const ls = new LindenmayerSystem2('', new Map())
      expect(ls.iterateOnce()).toBe('')
    })

    it('applies rules to all matching characters', () => {
      const rules = new Map([['A', 'AA']])
      const ls = new LindenmayerSystem2('A', rules)
      expect(ls.iterateOnce()).toBe('AA')
      expect(ls.iterateOnce()).toBe('AAAA')
    })
  })

  // ─── iterate ───

  describe('iterate', () => {
    it('iterates zero times returns the axiom', () => {
      const ls = new LindenmayerSystem2('A', new Map([['A', 'AB']]))
      expect(ls.iterate(0)).toBe('A')
    })

    it('iterates once same as iterateOnce', () => {
      const rules = new Map([['A', 'AB']])
      const ls = new LindenmayerSystem2('A', rules)
      expect(ls.iterate(1)).toBe('AB')
    })

    it('iterates multiple times from axiom', () => {
      const rules = new Map([
        ['A', 'AB'],
        ['B', 'A'],
      ])
      const ls1 = new LindenmayerSystem2('A', rules)
      expect(ls1.iterate(1)).toBe('AB')
      const ls2 = new LindenmayerSystem2('A', rules)
      expect(ls2.iterate(2)).toBe('ABA')
      const ls3 = new LindenmayerSystem2('A', rules)
      expect(ls3.iterate(3)).toBe('ABAAB')
    })

    it('handles Fibonacci-like L-system', () => {
      const rules = new Map([
        ['A', 'B'],
        ['B', 'AB'],
      ])
      const ls1 = new LindenmayerSystem2('A', rules)
      expect(ls1.iterate(1)).toBe('B')
      const ls2 = new LindenmayerSystem2('A', rules)
      expect(ls2.iterate(2)).toBe('AB')
      const ls3 = new LindenmayerSystem2('A', rules)
      expect(ls3.iterate(3)).toBe('BAB')
      const ls4 = new LindenmayerSystem2('A', rules)
      expect(ls4.iterate(4)).toBe('ABBAB')
    })

    it('produces Koch curve-like growth', () => {
      const rules = new Map([['F', 'F+F-F-F+F']])
      const ls = new LindenmayerSystem2('F', rules)
      expect(ls.iterate(1)).toBe('F+F-F-F+F')
    })
  })

  // ─── getCurrent ───

  describe('getCurrent', () => {
    it('returns axiom before any iteration', () => {
      const ls = new LindenmayerSystem2('X', new Map())
      expect(ls.getCurrent()).toBe('X')
    })

    it('returns state after iteration', () => {
      const rules = new Map([['X', 'XY']])
      const ls = new LindenmayerSystem2('X', rules)
      ls.iterateOnce()
      expect(ls.getCurrent()).toBe('XY')
    })
  })

  // ─── reset ───

  describe('reset', () => {
    it('resets to axiom', () => {
      const rules = new Map([['A', 'AB']])
      const ls = new LindenmayerSystem2('A', rules)
      ls.iterate(3)
      ls.reset()
      expect(ls.getCurrent()).toBe('A')
    })

    it('allows re-iteration after reset', () => {
      const rules = new Map([['A', 'AB']])
      const ls = new LindenmayerSystem2('A', rules)
      ls.iterate(2)
      ls.reset()
      expect(ls.iterate(1)).toBe('AB')
    })
  })

  // ─── getAxiom ───

  describe('getAxiom', () => {
    it('returns the original axiom', () => {
      const ls = new LindenmayerSystem2('ABC', new Map())
      expect(ls.getAxiom()).toBe('ABC')
    })

    it('returns the axiom even after iterations', () => {
      const ls = new LindenmayerSystem2('A', new Map([['A', 'AA']]))
      ls.iterate(5)
      expect(ls.getAxiom()).toBe('A')
    })
  })

  // ─── getRules ───

  describe('getRules', () => {
    it('returns a copy of the rules map', () => {
      const rules = new Map([['A', 'B']])
      const ls = new LindenmayerSystem2('A', rules)
      const returned = ls.getRules()
      expect(returned).not.toBe(rules)
      expect(returned.get('A')).toBe('B')
    })

    it('modifications to returned map do not affect the system', () => {
      const ls = new LindenmayerSystem2('A', new Map([['A', 'B']]))
      const returned = ls.getRules()
      returned.set('A', 'C')
      expect(ls.getRules().get('A')).toBe('B')
    })
  })

  // ─── addRule ───

  describe('addRule', () => {
    it('adds a new rule', () => {
      const ls = new LindenmayerSystem2('AB', new Map())
      ls.addRule('A', 'AA')
      expect(ls.iterate(1)).toBe('AAB')
    })

    it('overwrites an existing rule', () => {
      const ls = new LindenmayerSystem2('A', new Map([['A', 'B']]))
      ls.addRule('A', 'AA')
      expect(ls.iterate(1)).toBe('AA')
    })

    it('rule is used in subsequent iterations', () => {
      const ls = new LindenmayerSystem2('A', new Map([['A', 'AB']]))
      ls.iterate(1)
      ls.addRule('B', 'BA')
      expect(ls.iterate(1)).toBe('ABBA')
    })
  })

  // ─── removeRule ───

  describe('removeRule', () => {
    it('removes an existing rule and returns true', () => {
      const ls = new LindenmayerSystem2('A', new Map([['A', 'B']]))
      expect(ls.removeRule('A')).toBe(true)
      expect(ls.iterate(1)).toBe('A')
    })

    it('returns false when removing a non-existent rule', () => {
      const ls = new LindenmayerSystem2('A', new Map())
      expect(ls.removeRule('Z')).toBe(false)
    })

    it('removed rule causes character to stay unchanged', () => {
      const rules = new Map([
        ['A', 'AB'],
        ['B', 'A'],
      ])
      const ls = new LindenmayerSystem2('AB', rules)
      ls.removeRule('B')
      expect(ls.iterate(1)).toBe('ABB')
    })
  })
})
