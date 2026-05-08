import { describe, it, expect } from 'vitest'
import { RuleEngine } from '../../src/core/rule-engine/rule-engine.js'
import type {
  Rule,
  RuleCondition,
  RuleAction,
  RuleEvaluationContext,
} from '../../src/core/rule-engine/types.js'

function createRule(overrides: Partial<Rule> = {}): Rule {
  return {
    id: 'test-rule',
    name: 'Test Rule',
    description: 'A test rule',
    priority: 0,
    enabled: true,
    conditions: [],
    actions: [],
    tags: [],
    ...overrides,
  }
}

function createContext(
  data: Record<string, unknown> = {},
  metadata: Record<string, unknown> = {},
): RuleEvaluationContext {
  return { data, metadata }
}

describe('RuleEngine - Rule Management', () => {
  it('should add a rule', () => {
    const engine = new RuleEngine()
    const result = engine.addRule(createRule({ id: 'rule-1' }))
    expect(result).toBe(true)
    expect(engine.getRule('rule-1')).toBeDefined()
  })

  it('should return false for duplicate rule id', () => {
    const engine = new RuleEngine()
    engine.addRule(createRule({ id: 'dup-1' }))
    const result = engine.addRule(createRule({ id: 'dup-1' }))
    expect(result).toBe(false)
  })

  it('should enforce maxRules limit', () => {
    const engine = new RuleEngine({ maxRules: 2 })
    expect(engine.addRule(createRule({ id: 'r1' }))).toBe(true)
    expect(engine.addRule(createRule({ id: 'r2' }))).toBe(true)
    expect(engine.addRule(createRule({ id: 'r3' }))).toBe(false)
  })

  it('should remove a rule', () => {
    const engine = new RuleEngine()
    engine.addRule(createRule({ id: 'rem-1' }))
    expect(engine.removeRule('rem-1')).toBe(true)
    expect(engine.getRule('rem-1')).toBeUndefined()
  })

  it('should return false when removing non-existent rule', () => {
    const engine = new RuleEngine()
    expect(engine.removeRule('nonexistent')).toBe(false)
  })

  it('should get a rule by id', () => {
    const engine = new RuleEngine()
    engine.addRule(createRule({ id: 'get-1', name: 'Gettable' }))
    const rule = engine.getRule('get-1')
    expect(rule).toBeDefined()
    expect(rule!.name).toBe('Gettable')
  })

  it('should return undefined for unknown rule id', () => {
    const engine = new RuleEngine()
    expect(engine.getRule('unknown')).toBeUndefined()
  })

  it('should get all rules', () => {
    const engine = new RuleEngine()
    engine.addRule(createRule({ id: 'all-1' }))
    engine.addRule(createRule({ id: 'all-2' }))
    expect(engine.getRules()).toHaveLength(2)
  })

  it('should return empty array when no rules', () => {
    const engine = new RuleEngine()
    expect(engine.getRules()).toEqual([])
  })
})

describe('RuleEngine - Filtering', () => {
  it('should filter rules by tag', () => {
    const engine = new RuleEngine()
    engine.addRule(createRule({ id: 'tag-1', tags: ['security', 'injection'] }))
    engine.addRule(createRule({ id: 'tag-2', tags: ['style'] }))
    engine.addRule(createRule({ id: 'tag-3', tags: ['security'] }))
    expect(engine.getRulesByTag('security')).toHaveLength(2)
  })

  it('should return empty for unmatched tag', () => {
    const engine = new RuleEngine()
    engine.addRule(createRule({ id: 'tag-4', tags: ['style'] }))
    expect(engine.getRulesByTag('security')).toEqual([])
  })

  it('should get enabled rules', () => {
    const engine = new RuleEngine()
    engine.addRule(createRule({ id: 'en-1', enabled: true }))
    engine.addRule(createRule({ id: 'en-2', enabled: false }))
    engine.addRule(createRule({ id: 'en-3', enabled: true }))
    expect(engine.getEnabledRules()).toHaveLength(2)
  })

  it('should enable a rule', () => {
    const engine = new RuleEngine()
    engine.addRule(createRule({ id: 'toggle-1', enabled: false }))
    expect(engine.enable('toggle-1')).toBe(true)
    expect(engine.getRule('toggle-1')!.enabled).toBe(true)
  })

  it('should disable a rule', () => {
    const engine = new RuleEngine()
    engine.addRule(createRule({ id: 'toggle-2', enabled: true }))
    expect(engine.disable('toggle-2')).toBe(true)
    expect(engine.getRule('toggle-2')!.enabled).toBe(false)
  })

  it('should return false when enabling non-existent rule', () => {
    const engine = new RuleEngine()
    expect(engine.enable('nonexistent')).toBe(false)
  })

  it('should return false when disabling non-existent rule', () => {
    const engine = new RuleEngine()
    expect(engine.disable('nonexistent')).toBe(false)
  })
})

describe('RuleEngine - Condition Evaluation', () => {
  it('should evaluate eq operator', () => {
    const engine = new RuleEngine()
    const condition: RuleCondition = { field: 'status', operator: 'eq', value: 'active' }
    expect(engine.evaluateCondition(condition, createContext({ status: 'active' }))).toBe(true)
    expect(engine.evaluateCondition(condition, createContext({ status: 'inactive' }))).toBe(false)
  })

  it('should evaluate neq operator', () => {
    const engine = new RuleEngine()
    const condition: RuleCondition = { field: 'status', operator: 'neq', value: 'active' }
    expect(engine.evaluateCondition(condition, createContext({ status: 'inactive' }))).toBe(true)
    expect(engine.evaluateCondition(condition, createContext({ status: 'active' }))).toBe(false)
  })

  it('should evaluate gt operator', () => {
    const engine = new RuleEngine()
    const condition: RuleCondition = { field: 'count', operator: 'gt', value: 10 }
    expect(engine.evaluateCondition(condition, createContext({ count: 15 }))).toBe(true)
    expect(engine.evaluateCondition(condition, createContext({ count: 5 }))).toBe(false)
    expect(engine.evaluateCondition(condition, createContext({ count: 10 }))).toBe(false)
  })

  it('should evaluate gte operator', () => {
    const engine = new RuleEngine()
    const condition: RuleCondition = { field: 'count', operator: 'gte', value: 10 }
    expect(engine.evaluateCondition(condition, createContext({ count: 10 }))).toBe(true)
    expect(engine.evaluateCondition(condition, createContext({ count: 15 }))).toBe(true)
    expect(engine.evaluateCondition(condition, createContext({ count: 5 }))).toBe(false)
  })

  it('should evaluate lt operator', () => {
    const engine = new RuleEngine()
    const condition: RuleCondition = { field: 'count', operator: 'lt', value: 10 }
    expect(engine.evaluateCondition(condition, createContext({ count: 5 }))).toBe(true)
    expect(engine.evaluateCondition(condition, createContext({ count: 15 }))).toBe(false)
    expect(engine.evaluateCondition(condition, createContext({ count: 10 }))).toBe(false)
  })

  it('should evaluate lte operator', () => {
    const engine = new RuleEngine()
    const condition: RuleCondition = { field: 'count', operator: 'lte', value: 10 }
    expect(engine.evaluateCondition(condition, createContext({ count: 10 }))).toBe(true)
    expect(engine.evaluateCondition(condition, createContext({ count: 5 }))).toBe(true)
    expect(engine.evaluateCondition(condition, createContext({ count: 15 }))).toBe(false)
  })

  it('should evaluate contains operator', () => {
    const engine = new RuleEngine()
    const condition: RuleCondition = { field: 'name', operator: 'contains', value: 'hello' }
    expect(engine.evaluateCondition(condition, createContext({ name: 'say hello world' }))).toBe(true)
    expect(engine.evaluateCondition(condition, createContext({ name: 'say hi' }))).toBe(false)
  })

  it('should evaluate startsWith operator', () => {
    const engine = new RuleEngine()
    const condition: RuleCondition = { field: 'name', operator: 'startsWith', value: 'hello' }
    expect(engine.evaluateCondition(condition, createContext({ name: 'hello world' }))).toBe(true)
    expect(engine.evaluateCondition(condition, createContext({ name: 'world hello' }))).toBe(false)
  })

  it('should evaluate endsWith operator', () => {
    const engine = new RuleEngine()
    const condition: RuleCondition = { field: 'name', operator: 'endsWith', value: 'world' }
    expect(engine.evaluateCondition(condition, createContext({ name: 'hello world' }))).toBe(true)
    expect(engine.evaluateCondition(condition, createContext({ name: 'world hello' }))).toBe(false)
  })

  it('should evaluate in operator', () => {
    const engine = new RuleEngine()
    const condition: RuleCondition = { field: 'status', operator: 'in', value: ['active', 'pending'] }
    expect(engine.evaluateCondition(condition, createContext({ status: 'active' }))).toBe(true)
    expect(engine.evaluateCondition(condition, createContext({ status: 'pending' }))).toBe(true)
    expect(engine.evaluateCondition(condition, createContext({ status: 'closed' }))).toBe(false)
  })

  it('should evaluate notIn operator', () => {
    const engine = new RuleEngine()
    const condition: RuleCondition = { field: 'status', operator: 'notIn', value: ['active', 'pending'] }
    expect(engine.evaluateCondition(condition, createContext({ status: 'closed' }))).toBe(true)
    expect(engine.evaluateCondition(condition, createContext({ status: 'active' }))).toBe(false)
  })

  it('should evaluate matches operator with regex', () => {
    const engine = new RuleEngine()
    const condition: RuleCondition = { field: 'email', operator: 'matches', value: '^.+@.+\\..+$' }
    expect(engine.evaluateCondition(condition, createContext({ email: 'test@example.com' }))).toBe(true)
    expect(engine.evaluateCondition(condition, createContext({ email: 'invalid' }))).toBe(false)
  })

  it('should evaluate exists operator', () => {
    const engine = new RuleEngine()
    const condition: RuleCondition = { field: 'name', operator: 'exists', value: null }
    expect(engine.evaluateCondition(condition, createContext({ name: 'hello' }))).toBe(true)
    expect(engine.evaluateCondition(condition, createContext({}))).toBe(false)
  })

  it('should support nested field access via dot notation', () => {
    const engine = new RuleEngine()
    const condition: RuleCondition = { field: 'user.age', operator: 'gt', value: 18 }
    const context = createContext({ user: { age: 25 } })
    expect(engine.evaluateCondition(condition, context)).toBe(true)
  })

  it('should return false for missing nested field', () => {
    const engine = new RuleEngine()
    const condition: RuleCondition = { field: 'user.missing', operator: 'eq', value: 'test' }
    expect(engine.evaluateCondition(condition, createContext({ user: {} }))).toBe(false)
  })

  it('should return false for missing top-level field', () => {
    const engine = new RuleEngine()
    const condition: RuleCondition = { field: 'nonexistent', operator: 'eq', value: 'test' }
    expect(engine.evaluateCondition(condition, createContext({}))).toBe(false)
  })
})

describe('RuleEngine - Action Execution', () => {
  it('should execute set action', () => {
    const engine = new RuleEngine()
    const action: RuleAction = { type: 'set', target: 'result', value: 42 }
    const context = createContext({ existing: 'data' })
    const result = engine.executeAction(action, context)
    expect(result.success).toBe(true)
    expect(result.result).toBe(42)
    expect(context.data['result']).toBe(42)
  })

  it('should execute remove action', () => {
    const engine = new RuleEngine()
    const action: RuleAction = { type: 'remove', target: 'toBeRemoved', value: null }
    const context = createContext({ toBeRemoved: 'data', keep: 'this' })
    const result = engine.executeAction(action, context)
    expect(result.success).toBe(true)
    expect('toBeRemoved' in context.data).toBe(false)
    expect(context.data['keep']).toBe('this')
  })

  it('should execute add action to existing array', () => {
    const engine = new RuleEngine()
    const action: RuleAction = { type: 'add', target: 'items', value: 'new-item' }
    const context = createContext({ items: ['existing'] })
    const result = engine.executeAction(action, context)
    expect(result.success).toBe(true)
    expect(context.data['items']).toEqual(['existing', 'new-item'])
  })

  it('should execute add action creating new array', () => {
    const engine = new RuleEngine()
    const action: RuleAction = { type: 'add', target: 'items', value: 'first' }
    const context = createContext({})
    const result = engine.executeAction(action, context)
    expect(result.success).toBe(true)
    expect(context.data['items']).toEqual(['first'])
  })

  it('should execute log action', () => {
    const engine = new RuleEngine()
    const action: RuleAction = { type: 'log', target: 'message', value: 'logged' }
    const context = createContext({})
    const result = engine.executeAction(action, context)
    expect(result.success).toBe(true)
  })

  it('should execute error action', () => {
    const engine = new RuleEngine()
    const action: RuleAction = { type: 'error', target: '', value: 'Something went wrong' }
    const context = createContext({})
    const result = engine.executeAction(action, context)
    expect(result.success).toBe(false)
    expect(result.error).toBe('Something went wrong')
  })

  it('should modify context data through actions', () => {
    const engine = new RuleEngine()
    engine.addRule(createRule({
      id: 'mod-ctx',
      conditions: [{ field: 'x', operator: 'eq', value: 1 }],
      actions: [
        { type: 'set', target: 'y', value: 2 },
        { type: 'set', target: 'z', value: 3 },
      ],
    }))
    const ctx = createContext({ x: 1 })
    engine.evaluate(ctx)
    expect(ctx.data['y']).toBe(2)
    expect(ctx.data['z']).toBe(3)
  })
})

describe('RuleEngine - Rule Evaluation', () => {
  it('should match a single rule', () => {
    const engine = new RuleEngine()
    engine.addRule(createRule({
      id: 'match-1',
      conditions: [{ field: 'status', operator: 'eq', value: 'active' }],
      actions: [{ type: 'set', target: 'matched', value: true }],
    }))
    const results = engine.evaluate(createContext({ status: 'active' }))
    expect(results).toHaveLength(1)
    expect(results[0]!.matched).toBe(true)
    expect(results[0]!.ruleId).toBe('match-1')
  })

  it('should not match when conditions fail', () => {
    const engine = new RuleEngine()
    engine.addRule(createRule({
      id: 'no-match-1',
      conditions: [{ field: 'status', operator: 'eq', value: 'active' }],
      actions: [{ type: 'set', target: 'matched', value: true }],
    }))
    const results = engine.evaluate(createContext({ status: 'inactive' }))
    expect(results).toHaveLength(1)
    expect(results[0]!.matched).toBe(false)
  })

  it('should sort rules by priority (higher first)', () => {
    const engine = new RuleEngine()
    engine.addRule(createRule({
      id: 'low-priority',
      priority: 1,
      conditions: [{ field: 'x', operator: 'eq', value: 1 }],
      actions: [{ type: 'set', target: 'order', value: 'low' }],
    }))
    engine.addRule(createRule({
      id: 'high-priority',
      priority: 10,
      conditions: [{ field: 'x', operator: 'eq', value: 1 }],
      actions: [{ type: 'set', target: 'order', value: 'high' }],
    }))
    const results = engine.evaluate(createContext({ x: 1 }))
    expect(results[0]!.ruleId).toBe('high-priority')
    expect(results[1]!.ruleId).toBe('low-priority')
  })

  it('should respect stopOnFirstMatch config', () => {
    const engine = new RuleEngine({ stopOnFirstMatch: true })
    engine.addRule(createRule({
      id: 'first-match',
      priority: 10,
      conditions: [{ field: 'x', operator: 'eq', value: 1 }],
      actions: [{ type: 'set', target: 'a', value: 1 }],
    }))
    engine.addRule(createRule({
      id: 'second-match',
      priority: 5,
      conditions: [{ field: 'x', operator: 'eq', value: 1 }],
      actions: [{ type: 'set', target: 'b', value: 2 }],
    }))
    const results = engine.evaluate(createContext({ x: 1 }))
    expect(results).toHaveLength(1)
    expect(results[0]!.ruleId).toBe('first-match')
  })

  it('should skip disabled rules during evaluate', () => {
    const engine = new RuleEngine()
    engine.addRule(createRule({
      id: 'disabled-rule',
      enabled: false,
      conditions: [{ field: 'x', operator: 'eq', value: 1 }],
      actions: [{ type: 'set', target: 'a', value: 1 }],
    }))
    const results = engine.evaluate(createContext({ x: 1 }))
    expect(results).toHaveLength(0)
  })

  it('should evaluate a single rule by id', () => {
    const engine = new RuleEngine()
    engine.addRule(createRule({
      id: 'eval-single',
      conditions: [{ field: 'val', operator: 'gt', value: 5 }],
      actions: [{ type: 'log', target: '', value: '' }],
    }))
    const result = engine.evaluateRule('eval-single', createContext({ val: 10 }))
    expect(result.matched).toBe(true)
    expect(result.ruleId).toBe('eval-single')
  })

  it('should return unmatched result for unknown rule id', () => {
    const engine = new RuleEngine()
    const result = engine.evaluateRule('unknown', createContext({}))
    expect(result.matched).toBe(false)
    expect(result.actions).toEqual([])
  })
})

describe('RuleEngine - Match Helpers', () => {
  it('should return true for matchAny when at least one rule matches', () => {
    const engine = new RuleEngine()
    engine.addRule(createRule({
      id: 'any-1',
      conditions: [{ field: 'x', operator: 'eq', value: 1 }],
    }))
    engine.addRule(createRule({
      id: 'any-2',
      conditions: [{ field: 'x', operator: 'eq', value: 2 }],
    }))
    expect(engine.matchAny(createContext({ x: 1 }))).toBe(true)
  })

  it('should return false for matchAny when no rules match', () => {
    const engine = new RuleEngine()
    engine.addRule(createRule({
      id: 'any-3',
      conditions: [{ field: 'x', operator: 'eq', value: 99 }],
    }))
    expect(engine.matchAny(createContext({ x: 1 }))).toBe(false)
  })

  it('should return all matching rule ids from matchAll', () => {
    const engine = new RuleEngine()
    engine.addRule(createRule({
      id: 'all-1',
      conditions: [{ field: 'x', operator: 'gt', value: 0 }],
    }))
    engine.addRule(createRule({
      id: 'all-2',
      conditions: [{ field: 'x', operator: 'lt', value: 100 }],
    }))
    engine.addRule(createRule({
      id: 'all-3',
      conditions: [{ field: 'x', operator: 'eq', value: 999 }],
    }))
    const matches = engine.matchAll(createContext({ x: 50 }))
    expect(matches).toContain('all-1')
    expect(matches).toContain('all-2')
    expect(matches).not.toContain('all-3')
  })

  it('should return empty array from matchAll when nothing matches', () => {
    const engine = new RuleEngine()
    engine.addRule(createRule({
      id: 'all-empty',
      conditions: [{ field: 'x', operator: 'eq', value: 999 }],
    }))
    expect(engine.matchAll(createContext({ x: 1 }))).toEqual([])
  })
})

describe('RuleEngine - Statistics', () => {
  it('should return initial statistics', () => {
    const engine = new RuleEngine()
    const stats = engine.getStatistics()
    expect(stats.totalRules).toBe(0)
    expect(stats.enabledRules).toBe(0)
    expect(stats.disabledRules).toBe(0)
    expect(stats.totalEvaluations).toBe(0)
    expect(stats.totalMatches).toBe(0)
  })

  it('should count total and enabled/disabled rules', () => {
    const engine = new RuleEngine()
    engine.addRule(createRule({ id: 's-1', enabled: true }))
    engine.addRule(createRule({ id: 's-2', enabled: false }))
    engine.addRule(createRule({ id: 's-3', enabled: true }))
    const stats = engine.getStatistics()
    expect(stats.totalRules).toBe(3)
    expect(stats.enabledRules).toBe(2)
    expect(stats.disabledRules).toBe(1)
  })

  it('should track evaluations and matches', () => {
    const engine = new RuleEngine()
    engine.addRule(createRule({
      id: 'track-1',
      conditions: [{ field: 'x', operator: 'eq', value: 1 }],
    }))
    engine.evaluate(createContext({ x: 1 }))
    engine.evaluate(createContext({ x: 2 }))
    const stats = engine.getStatistics()
    expect(stats.totalEvaluations).toBe(2)
    expect(stats.totalMatches).toBe(1)
  })
})

describe('RuleEngine - Edge Cases', () => {
  it('should handle empty rule set evaluation', () => {
    const engine = new RuleEngine()
    const results = engine.evaluate(createContext({ x: 1 }))
    expect(results).toEqual([])
  })

  it('should handle rule with no conditions (always matches)', () => {
    const engine = new RuleEngine()
    engine.addRule(createRule({
      id: 'no-conditions',
      conditions: [],
      actions: [{ type: 'set', target: 'hit', value: true }],
    }))
    const results = engine.evaluate(createContext({}))
    expect(results).toHaveLength(1)
    expect(results[0]!.matched).toBe(true)
  })

  it('should handle rule with no actions', () => {
    const engine = new RuleEngine()
    engine.addRule(createRule({
      id: 'no-actions',
      conditions: [{ field: 'x', operator: 'eq', value: 1 }],
      actions: [],
    }))
    const results = engine.evaluate(createContext({ x: 1 }))
    expect(results[0]!.matched).toBe(true)
    expect(results[0]!.actions).toEqual([])
  })

  it('should handle context with no data', () => {
    const engine = new RuleEngine()
    engine.addRule(createRule({
      id: 'empty-ctx',
      conditions: [{ field: 'x', operator: 'exists', value: null }],
    }))
    const results = engine.evaluate(createContext())
    expect(results[0]!.matched).toBe(false)
  })

  it('should clear all rules', () => {
    const engine = new RuleEngine()
    engine.addRule(createRule({ id: 'clear-1' }))
    engine.addRule(createRule({ id: 'clear-2' }))
    engine.clear()
    expect(engine.getRules()).toEqual([])
    expect(engine.getStatistics().totalRules).toBe(0)
  })

  it('should reset rules and statistics', () => {
    const engine = new RuleEngine()
    engine.addRule(createRule({
      id: 'reset-1',
      conditions: [{ field: 'x', operator: 'eq', value: 1 }],
    }))
    engine.evaluate(createContext({ x: 1 }))
    engine.reset()
    expect(engine.getRules()).toEqual([])
    const stats = engine.getStatistics()
    expect(stats.totalRules).toBe(0)
    expect(stats.totalEvaluations).toBe(0)
    expect(stats.totalMatches).toBe(0)
  })

  it('should handle gt/gte/lt/lte with non-number field', () => {
    const engine = new RuleEngine()
    const cond: RuleCondition = { field: 'name', operator: 'gt', value: 5 }
    expect(engine.evaluateCondition(cond, createContext({ name: 'hello' }))).toBe(false)
  })

  it('should handle contains with non-string field', () => {
    const engine = new RuleEngine()
    const cond: RuleCondition = { field: 'num', operator: 'contains', value: 'ell' }
    expect(engine.evaluateCondition(cond, createContext({ num: 123 }))).toBe(false)
  })

  it('should handle matches with non-string field', () => {
    const engine = new RuleEngine()
    const cond: RuleCondition = { field: 'num', operator: 'matches', value: '\\d+' }
    expect(engine.evaluateCondition(cond, createContext({ num: 123 }))).toBe(false)
  })

  it('should handle in operator with non-array value', () => {
    const engine = new RuleEngine()
    const cond: RuleCondition = { field: 'x', operator: 'in', value: 'not-array' }
    expect(engine.evaluateCondition(cond, createContext({ x: 1 }))).toBe(false)
  })

  it('should handle invalid regex in matches', () => {
    const engine = new RuleEngine()
    const cond: RuleCondition = { field: 'x', operator: 'matches', value: '[' }
    expect(engine.evaluateCondition(cond, createContext({ x: 'test' }))).toBe(false)
  })

  it('should handle deeply nested field access', () => {
    const engine = new RuleEngine()
    const cond: RuleCondition = { field: 'a.b.c', operator: 'eq', value: 'deep' }
    const ctx = createContext({ a: { b: { c: 'deep' } } })
    expect(engine.evaluateCondition(cond, ctx)).toBe(true)
  })

  it('should handle nested field where intermediate is null', () => {
    const engine = new RuleEngine()
    const cond: RuleCondition = { field: 'a.b.c', operator: 'eq', value: 'test' }
    const ctx = createContext({ a: null })
    expect(engine.evaluateCondition(cond, ctx)).toBe(false)
  })

  it('should use default config when none provided', () => {
    const engine = new RuleEngine()
    const stats = engine.getStatistics()
    expect(stats.totalRules).toBe(0)
  })

  it('should handle multiple conditions with all matching', () => {
    const engine = new RuleEngine()
    engine.addRule(createRule({
      id: 'multi-cond',
      conditions: [
        { field: 'x', operator: 'gt', value: 5 },
        { field: 'y', operator: 'lt', value: 10 },
      ],
    }))
    const results = engine.evaluate(createContext({ x: 7, y: 3 }))
    expect(results[0]!.matched).toBe(true)
  })

  it('should handle multiple conditions where one fails', () => {
    const engine = new RuleEngine()
    engine.addRule(createRule({
      id: 'multi-cond-fail',
      conditions: [
        { field: 'x', operator: 'gt', value: 5 },
        { field: 'y', operator: 'lt', value: 10 },
      ],
    }))
    const results = engine.evaluate(createContext({ x: 7, y: 15 }))
    expect(results[0]!.matched).toBe(false)
  })

  it('should include duration in rule results', () => {
    const engine = new RuleEngine()
    engine.addRule(createRule({
      id: 'duration-test',
      conditions: [{ field: 'x', operator: 'eq', value: 1 }],
      actions: [{ type: 'log', target: '', value: '' }],
    }))
    const result = engine.evaluateRule('duration-test', createContext({ x: 1 }))
    expect(result.duration).toBeGreaterThanOrEqual(0)
  })

  it('should return ActionResult with action reference', () => {
    const engine = new RuleEngine()
    const action: RuleAction = { type: 'set', target: 'x', value: 1 }
    const result = engine.executeAction(action, createContext({}))
    expect(result.action).toBe(action)
  })

  it('should handle error action with non-string value', () => {
    const engine = new RuleEngine()
    const action: RuleAction = { type: 'error', target: '', value: 42 }
    const result = engine.executeAction(action, createContext({}))
    expect(result.error).toBe('Error action triggered')
  })

  it('should handle matchAny with empty rule set', () => {
    const engine = new RuleEngine()
    expect(engine.matchAny(createContext({}))).toBe(false)
  })

  it('should handle matchAll with empty rule set', () => {
    const engine = new RuleEngine()
    expect(engine.matchAll(createContext({}))).toEqual([])
  })

  it('should handle matchAny with rule with no conditions', () => {
    const engine = new RuleEngine()
    engine.addRule(createRule({ id: 'always-true', conditions: [] }))
    expect(engine.matchAny(createContext({}))).toBe(true)
  })

  it('should handle matchAll including rules with no conditions', () => {
    const engine = new RuleEngine()
    engine.addRule(createRule({ id: 'always-1', conditions: [] }))
    engine.addRule(createRule({
      id: 'conditional-1',
      conditions: [{ field: 'x', operator: 'eq', value: 1 }],
    }))
    const matches = engine.matchAll(createContext({ x: 1 }))
    expect(matches).toContain('always-1')
    expect(matches).toContain('conditional-1')
  })

  it('should preserve statistics across clear', () => {
    const engine = new RuleEngine()
    engine.addRule(createRule({
      id: 'clear-stats',
      conditions: [{ field: 'x', operator: 'eq', value: 1 }],
    }))
    engine.evaluate(createContext({ x: 1 }))
    engine.clear()
    const stats = engine.getStatistics()
    expect(stats.totalRules).toBe(0)
    expect(stats.totalEvaluations).toBe(1)
  })

  it('should not execute actions when rule does not match', () => {
    const engine = new RuleEngine()
    engine.addRule(createRule({
      id: 'no-exec',
      conditions: [{ field: 'x', operator: 'eq', value: 99 }],
      actions: [{ type: 'set', target: 'y', value: 1 }],
    }))
    const ctx = createContext({ x: 1 })
    engine.evaluate(ctx)
    expect(ctx.data['y']).toBeUndefined()
  })

  it('should handle add action overwriting non-array value', () => {
    const engine = new RuleEngine()
    const action: RuleAction = { type: 'add', target: 'val', value: 'item' }
    const ctx = createContext({ val: 'string-value' })
    const result = engine.executeAction(action, ctx)
    expect(result.success).toBe(true)
    expect(ctx.data['val']).toEqual(['item'])
  })
})

describe('RuleEngine - Integration', () => {
  it('should run full pipeline: add, evaluate, match', () => {
    const engine = new RuleEngine()
    engine.addRule(createRule({
      id: 'pipeline-1',
      priority: 10,
      conditions: [
        { field: 'user.role', operator: 'eq', value: 'admin' },
        { field: 'user.active', operator: 'eq', value: true },
      ],
      actions: [
        { type: 'set', target: 'access', value: 'full' },
        { type: 'log', target: 'message', value: 'Admin granted full access' },
      ],
      tags: ['security', 'access'],
    }))
    engine.addRule(createRule({
      id: 'pipeline-2',
      priority: 5,
      conditions: [{ field: 'user.role', operator: 'eq', value: 'user' }],
      actions: [{ type: 'set', target: 'access', value: 'limited' }],
      tags: ['security'],
    }))

    const ctx = createContext({ user: { role: 'admin', active: true } })
    const results = engine.evaluate(ctx)
    expect(results).toHaveLength(2)
    expect(results[0]!.matched).toBe(true)
    expect(results[0]!.ruleId).toBe('pipeline-1')
    expect(results[1]!.matched).toBe(false)
    expect(ctx.data['access']).toBe('full')

    const stats = engine.getStatistics()
    expect(stats.totalRules).toBe(2)
    expect(stats.enabledRules).toBe(2)
    expect(stats.totalEvaluations).toBe(2)
    expect(stats.totalMatches).toBe(1)
    expect(engine.getRulesByTag('security')).toHaveLength(2)
    expect(engine.matchAny(createContext({ user: { role: 'user', active: true } }))).toBe(true)
  })

  it('should handle disable, evaluate, enable cycle', () => {
    const engine = new RuleEngine()
    engine.addRule(createRule({
      id: 'cycle-1',
      conditions: [{ field: 'x', operator: 'eq', value: 1 }],
    }))
    expect(engine.disable('cycle-1')).toBe(true)
    expect(engine.evaluate(createContext({ x: 1 }))).toEqual([])
    expect(engine.enable('cycle-1')).toBe(true)
    const results = engine.evaluate(createContext({ x: 1 }))
    expect(results).toHaveLength(1)
    expect(results[0]!.matched).toBe(true)
  })
})
