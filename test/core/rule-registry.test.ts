import { describe, expect, it } from 'vitest'

import { createDefaultRegistry, RuleRegistry } from '../../src/core/rule-registry.js'

import type { RuleDefinition, RuleOptions } from '../../src/rules/types.js'

// ─── Helpers ───

function makeMockDefinition(name = 'mock-rule'): RuleDefinition {
  return {
    create: (_options: RuleOptions) => ({
      visitor: {},
    }),
    defaultOptions: {},
    meta: {
      category: 'patterns',
      description: `Mock rule ${name}`,
      name,
      recommended: false,
    },
  }
}

// ─── createDefaultRegistry ───

describe('createDefaultRegistry', () => {
  it('returns a RuleRegistry instance', () => {
    const registry = createDefaultRegistry()
    expect(registry).toBeInstanceOf(RuleRegistry)
  })

  it('returns empty registry', () => {
    const registry = createDefaultRegistry()
    expect(registry.getAllRules()).toEqual([])
  })
})

// ─── register ───

describe('RuleRegistry register', () => {
  it('registers a rule', () => {
    const registry = new RuleRegistry()
    registry.register('test-rule', makeMockDefinition(), 'patterns')
    const rule = registry.getRule('test-rule')
    expect(rule).toBeDefined()
    expect(rule!.enabled).toBe(true)
    expect(rule!.category).toBe('patterns')
  })

  it('registers multiple rules', () => {
    const registry = new RuleRegistry()
    registry.register('rule-a', makeMockDefinition('a'), 'complexity')
    registry.register('rule-b', makeMockDefinition('b'), 'security')
    expect(registry.getAllRules().length).toBe(2)
  })

  it('overwrites rule with same id', () => {
    const registry = new RuleRegistry()
    registry.register('rule-a', makeMockDefinition('first'), 'patterns')
    registry.register('rule-a', makeMockDefinition('second'), 'security')
    const rules = registry.getAllRules()
    expect(rules.length).toBe(1)
    expect(rules[0].category).toBe('security')
  })

  it('registers with custom options', () => {
    const registry = new RuleRegistry()
    registry.register('rule-a', makeMockDefinition(), 'patterns', { max: 5 })
    const rule = registry.getRule('rule-a')
    expect(rule!.options).toEqual({ max: 5 })
  })

  it('defaults options to empty object', () => {
    const registry = new RuleRegistry()
    registry.register('rule-a', makeMockDefinition(), 'patterns')
    const rule = registry.getRule('rule-a')
    expect(rule!.options).toEqual({})
  })
})

// ─── enable / disable ───

describe('RuleRegistry enable/disable', () => {
  it('disable sets enabled to false', () => {
    const registry = new RuleRegistry()
    registry.register('rule-a', makeMockDefinition(), 'patterns')
    registry.disable('rule-a')
    expect(registry.getRule('rule-a')!.enabled).toBe(false)
  })

  it('enable sets enabled to true', () => {
    const registry = new RuleRegistry()
    registry.register('rule-a', makeMockDefinition(), 'patterns')
    registry.disable('rule-a')
    registry.enable('rule-a')
    expect(registry.getRule('rule-a')!.enabled).toBe(true)
  })

  it('disable non-existent rule does nothing', () => {
    const registry = new RuleRegistry()
    expect(() => registry.disable('nope')).not.toThrow()
  })

  it('enable non-existent rule does nothing', () => {
    const registry = new RuleRegistry()
    expect(() => registry.enable('nope')).not.toThrow()
  })

  it('disable invalidates enabled cache', () => {
    const registry = new RuleRegistry()
    registry.register('rule-a', makeMockDefinition(), 'patterns')
    registry.register('rule-b', makeMockDefinition(), 'patterns')
    const before = registry.getEnabledRules()
    expect(before.length).toBe(2)
    registry.disable('rule-a')
    const after = registry.getEnabledRules()
    expect(after.length).toBe(1)
    expect(after[0].definition.meta.name).toBe('mock-rule')
  })
})

// ─── getRule ───

describe('RuleRegistry getRule', () => {
  it('returns rule by id', () => {
    const registry = new RuleRegistry()
    registry.register('my-rule', makeMockDefinition(), 'complexity')
    const rule = registry.getRule('my-rule')
    expect(rule).toBeDefined()
    expect(rule!.definition.meta.name).toBe('mock-rule')
  })

  it('returns undefined for non-existent rule', () => {
    const registry = new RuleRegistry()
    expect(registry.getRule('nope')).toBeUndefined()
  })
})

// ─── getAllRules ───

describe('RuleRegistry getAllRules', () => {
  it('returns empty array for empty registry', () => {
    const registry = new RuleRegistry()
    expect(registry.getAllRules()).toEqual([])
  })

  it('returns all registered rules', () => {
    const registry = new RuleRegistry()
    registry.register('a', makeMockDefinition('a'), 'patterns')
    registry.register('b', makeMockDefinition('b'), 'complexity')
    expect(registry.getAllRules().length).toBe(2)
  })

  it('includes disabled rules', () => {
    const registry = new RuleRegistry()
    registry.register('a', makeMockDefinition(), 'patterns')
    registry.disable('a')
    expect(registry.getAllRules().length).toBe(1)
  })
})

// ─── getEnabledRules ───

describe('RuleRegistry getEnabledRules', () => {
  it('returns only enabled rules', () => {
    const registry = new RuleRegistry()
    registry.register('a', makeMockDefinition('a'), 'patterns')
    registry.register('b', makeMockDefinition('b'), 'complexity')
    registry.disable('a')
    const enabled = registry.getEnabledRules()
    expect(enabled.length).toBe(1)
  })

  it('returns empty when all disabled', () => {
    const registry = new RuleRegistry()
    registry.register('a', makeMockDefinition(), 'patterns')
    registry.disable('a')
    expect(registry.getEnabledRules()).toEqual([])
  })

  it('caches result', () => {
    const registry = new RuleRegistry()
    registry.register('a', makeMockDefinition(), 'patterns')
    const first = registry.getEnabledRules()
    const second = registry.getEnabledRules()
    expect(first).toBe(second)
  })

  it('cache is invalidated by register', () => {
    const registry = new RuleRegistry()
    registry.register('a', makeMockDefinition(), 'patterns')
    const first = registry.getEnabledRules()
    registry.register('b', makeMockDefinition(), 'complexity')
    const second = registry.getEnabledRules()
    expect(first).not.toBe(second)
    expect(second.length).toBe(2)
  })

  it('cache is invalidated by enable', () => {
    const registry = new RuleRegistry()
    registry.register('a', makeMockDefinition(), 'patterns')
    registry.disable('a')
    const first = registry.getEnabledRules()
    registry.enable('a')
    const second = registry.getEnabledRules()
    expect(first).not.toBe(second)
    expect(second.length).toBe(1)
  })
})
