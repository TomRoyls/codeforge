import { describe, it, expect, beforeEach } from 'vitest'
import { RuleOperators } from '../../src/core/rule-composer/rule-operators.js'
import { RuleComposer } from '../../src/core/rule-composer/rule-composer.js'
import type {
  ComposedRule,
  RulePredicate,
} from '../../src/core/rule-composer/types.js'
import { DEFAULT_CONFIG } from '../../src/core/rule-composer/types.js'

function makeRule<T>(
  name: string,
  predicate: RulePredicate<T>,
  children?: ComposedRule<T>[],
): ComposedRule<T> {
  return { name, predicate, description: name, children }
}

const alwaysTrue = makeRule<number>('always-true', () => true)
const alwaysFalse = makeRule<number>('always-false', () => false)
const isEven = makeRule<number>('is-even', (n) => n % 2 === 0)
const isPositive = makeRule<number>('is-positive', (n) => n > 0)
const isGreaterThan5 = makeRule<number>('gt5', (n) => n > 5)
const isLessThan10 = makeRule<number>('lt10', (n) => n < 10)

describe('RuleOperators', () => {
  describe('and', () => {
    it('returns true when all rules pass', () => {
      const rule = RuleOperators.and([isEven, isPositive])
      expect(rule.predicate(4)).toBe(true)
    })

    it('returns false when one rule fails', () => {
      const rule = RuleOperators.and([isEven, isPositive])
      expect(rule.predicate(-2)).toBe(false)
    })

    it('returns false when all rules fail', () => {
      const rule = RuleOperators.and([isEven, isPositive])
      expect(rule.predicate(-3)).toBe(false)
    })

    it('returns true for empty rules (vacuous truth)', () => {
      const rule = RuleOperators.and<number>([])
      expect(rule.predicate(42)).toBe(true)
    })

    it('returns true for single passing rule', () => {
      const rule = RuleOperators.and([isEven])
      expect(rule.predicate(4)).toBe(true)
    })

    it('returns false for single failing rule', () => {
      const rule = RuleOperators.and([isEven])
      expect(rule.predicate(3)).toBe(false)
    })

    it('has correct name', () => {
      const rule = RuleOperators.and([isEven, isPositive])
      expect(rule.name).toBe('and')
    })

    it('has children set', () => {
      const rule = RuleOperators.and([isEven, isPositive])
      expect(rule.children).toHaveLength(2)
    })
  })

  describe('or', () => {
    it('returns true when at least one passes', () => {
      const rule = RuleOperators.or([isEven, isPositive])
      expect(rule.predicate(3)).toBe(true)
    })

    it('returns false when all fail', () => {
      const rule = RuleOperators.or([isEven, isPositive])
      expect(rule.predicate(-3)).toBe(false)
    })

    it('returns false for empty rules', () => {
      const rule = RuleOperators.or<number>([])
      expect(rule.predicate(42)).toBe(false)
    })

    it('returns true when first rule passes', () => {
      const rule = RuleOperators.or([alwaysTrue, alwaysFalse])
      expect(rule.predicate(1)).toBe(true)
    })

    it('has correct name', () => {
      const rule = RuleOperators.or([isEven])
      expect(rule.name).toBe('or')
    })

    it('has children set', () => {
      const rule = RuleOperators.or([isEven, isPositive])
      expect(rule.children).toHaveLength(2)
    })
  })

  describe('not', () => {
    it('inverts true to false', () => {
      const rule = RuleOperators.not(alwaysTrue)
      expect(rule.predicate(1)).toBe(false)
    })

    it('inverts false to true', () => {
      const rule = RuleOperators.not(alwaysFalse)
      expect(rule.predicate(1)).toBe(true)
    })

    it('inverts isEven correctly', () => {
      const rule = RuleOperators.not(isEven)
      expect(rule.predicate(3)).toBe(true)
      expect(rule.predicate(4)).toBe(false)
    })

    it('has correct name', () => {
      const rule = RuleOperators.not(isEven)
      expect(rule.name).toBe('not')
    })

    it('has one child', () => {
      const rule = RuleOperators.not(isEven)
      expect(rule.children).toHaveLength(1)
    })
  })

  describe('xor', () => {
    it('returns true when exactly one passes (true/false)', () => {
      const rule = RuleOperators.xor(alwaysTrue, alwaysFalse)
      expect(rule.predicate(1)).toBe(true)
    })

    it('returns true when exactly one passes (false/true)', () => {
      const rule = RuleOperators.xor(alwaysFalse, alwaysTrue)
      expect(rule.predicate(1)).toBe(true)
    })

    it('returns false when both pass', () => {
      const rule = RuleOperators.xor(alwaysTrue, alwaysTrue)
      expect(rule.predicate(1)).toBe(false)
    })

    it('returns false when both fail', () => {
      const rule = RuleOperators.xor(alwaysFalse, alwaysFalse)
      expect(rule.predicate(1)).toBe(false)
    })

    it('works with isEven and isPositive', () => {
      const rule = RuleOperators.xor(isEven, isPositive)
      expect(rule.predicate(2)).toBe(false)
      expect(rule.predicate(3)).toBe(true)
      expect(rule.predicate(-2)).toBe(true)
      expect(rule.predicate(-3)).toBe(false)
    })

    it('has correct name', () => {
      const rule = RuleOperators.xor(isEven, isPositive)
      expect(rule.name).toBe('xor')
    })

    it('has two children', () => {
      const rule = RuleOperators.xor(isEven, isPositive)
      expect(rule.children).toHaveLength(2)
    })
  })

  describe('nand', () => {
    it('returns false when all pass', () => {
      const rule = RuleOperators.nand([alwaysTrue, alwaysTrue])
      expect(rule.predicate(1)).toBe(false)
    })

    it('returns true when one fails', () => {
      const rule = RuleOperators.nand([alwaysTrue, alwaysFalse])
      expect(rule.predicate(1)).toBe(true)
    })

    it('returns true when all fail', () => {
      const rule = RuleOperators.nand([alwaysFalse, alwaysFalse])
      expect(rule.predicate(1)).toBe(true)
    })

    it('returns false for empty rules (NOT of vacuous truth)', () => {
      const rule = RuleOperators.nand<number>([])
      expect(rule.predicate(1)).toBe(false)
    })

    it('has correct name', () => {
      const rule = RuleOperators.nand([isEven])
      expect(rule.name).toBe('nand')
    })
  })

  describe('nor', () => {
    it('returns true when all fail', () => {
      const rule = RuleOperators.nor([alwaysFalse, alwaysFalse])
      expect(rule.predicate(1)).toBe(true)
    })

    it('returns false when one passes', () => {
      const rule = RuleOperators.nor([alwaysTrue, alwaysFalse])
      expect(rule.predicate(1)).toBe(false)
    })

    it('returns false when all pass', () => {
      const rule = RuleOperators.nor([alwaysTrue, alwaysTrue])
      expect(rule.predicate(1)).toBe(false)
    })

    it('returns true for empty rules', () => {
      const rule = RuleOperators.nor<number>([])
      expect(rule.predicate(1)).toBe(true)
    })

    it('has correct name', () => {
      const rule = RuleOperators.nor([isEven])
      expect(rule.name).toBe('nor')
    })
  })

  describe('implies', () => {
    it('returns true when antecedent true and consequent true', () => {
      const rule = RuleOperators.implies(alwaysTrue, alwaysTrue)
      expect(rule.predicate(1)).toBe(true)
    })

    it('returns false when antecedent true and consequent false', () => {
      const rule = RuleOperators.implies(alwaysTrue, alwaysFalse)
      expect(rule.predicate(1)).toBe(false)
    })

    it('returns true when antecedent false (vacuously)', () => {
      const rule = RuleOperators.implies(alwaysFalse, alwaysFalse)
      expect(rule.predicate(1)).toBe(true)
    })

    it('returns true when antecedent false regardless of consequent', () => {
      const rule = RuleOperators.implies(alwaysFalse, alwaysTrue)
      expect(rule.predicate(1)).toBe(true)
    })

    it('works with isEven implies isPositive', () => {
      const rule = RuleOperators.implies(isEven, isPositive)
      expect(rule.predicate(4)).toBe(true)
      expect(rule.predicate(-2)).toBe(false)
      expect(rule.predicate(3)).toBe(true)
      expect(rule.predicate(-3)).toBe(true)
    })

    it('has correct name', () => {
      const rule = RuleOperators.implies(isEven, isPositive)
      expect(rule.name).toBe('implies')
    })

    it('has two children', () => {
      const rule = RuleOperators.implies(isEven, isPositive)
      expect(rule.children).toHaveLength(2)
    })
  })

  describe('ifThenElse', () => {
    it('returns then result when condition is true', () => {
      const rule = RuleOperators.ifThenElse(alwaysTrue, alwaysTrue, alwaysFalse)
      expect(rule.predicate(1)).toBe(true)
    })

    it('returns else result when condition is false', () => {
      const rule = RuleOperators.ifThenElse(alwaysFalse, alwaysTrue, alwaysFalse)
      expect(rule.predicate(1)).toBe(false)
    })

    it('branches correctly based on isEven', () => {
      const rule = RuleOperators.ifThenElse(isEven, isGreaterThan5, isLessThan10)
      expect(rule.predicate(6)).toBe(true)
      expect(rule.predicate(2)).toBe(false)
      expect(rule.predicate(15)).toBe(false)
      expect(rule.predicate(9)).toBe(true)
    })

    it('has correct name', () => {
      const rule = RuleOperators.ifThenElse(isEven, isPositive, alwaysFalse)
      expect(rule.name).toBe('if-then-else')
    })

    it('has three children', () => {
      const rule = RuleOperators.ifThenElse(isEven, isPositive, alwaysFalse)
      expect(rule.children).toHaveLength(3)
    })
  })
})

describe('RuleComposer', () => {
  let composer: RuleComposer

  beforeEach(() => {
    composer = new RuleComposer()
  })

  describe('compose', () => {
    it('composes with AND operator', () => {
      const rule = composer.compose('and-rule', 'and', [isEven, isPositive])
      expect(rule.name).toBe('and-rule')
      expect(rule.predicate(4)).toBe(true)
      expect(rule.predicate(-2)).toBe(false)
    })

    it('composes with OR operator', () => {
      const rule = composer.compose('or-rule', 'or', [isEven, isPositive])
      expect(rule.name).toBe('or-rule')
      expect(rule.predicate(3)).toBe(true)
      expect(rule.predicate(-3)).toBe(false)
    })

    it('composes with NOT operator', () => {
      const rule = composer.compose('not-rule', 'not', [isEven])
      expect(rule.name).toBe('not-rule')
      expect(rule.predicate(3)).toBe(true)
      expect(rule.predicate(4)).toBe(false)
    })

    it('uses custom description when provided', () => {
      const rule = composer.compose('my-rule', 'and', [isEven], 'custom desc')
      expect(rule.description).toBe('custom desc')
    })

    it('uses default description when not provided', () => {
      const rule = composer.compose('my-rule', 'and', [isEven])
      expect(rule.description).toContain('AND')
    })

    it('throws for NOT with empty rules', () => {
      expect(() => composer.compose('bad', 'not', [])).toThrow()
    })
  })

  describe('fromPredicate', () => {
    it('creates a rule from a raw predicate', () => {
      const rule = composer.fromPredicate('positive', (n: number) => n > 0)
      expect(rule.name).toBe('positive')
      expect(rule.predicate(5)).toBe(true)
      expect(rule.predicate(-1)).toBe(false)
    })

    it('uses custom description', () => {
      const rule = composer.fromPredicate('pos', (n: number) => n > 0, 'checks positivity')
      expect(rule.description).toBe('checks positivity')
    })

    it('uses name as default description', () => {
      const rule = composer.fromPredicate('pos', (n: number) => n > 0)
      expect(rule.description).toBe('pos')
    })

    it('has no children', () => {
      const rule = composer.fromPredicate('pos', (n: number) => n > 0)
      expect(rule.children).toBeUndefined()
    })
  })

  describe('evaluate', () => {
    it('returns true for passing rule', () => {
      expect(composer.evaluate(4, isEven)).toBe(true)
    })

    it('returns false for failing rule', () => {
      expect(composer.evaluate(3, isEven)).toBe(false)
    })

    it('works with composed rule', () => {
      const composed = RuleOperators.and([isEven, isPositive])
      expect(composer.evaluate(4, composed)).toBe(true)
      expect(composer.evaluate(-2, composed)).toBe(false)
    })
  })

  describe('evaluateAll', () => {
    it('filters items that pass', () => {
      const result = composer.evaluateAll([1, 2, 3, 4, 5, 6], isEven)
      expect(result).toEqual([2, 4, 6])
    })

    it('returns empty when none pass', () => {
      const result = composer.evaluateAll([1, 3, 5], isEven)
      expect(result).toEqual([])
    })

    it('returns all when all pass', () => {
      const result = composer.evaluateAll([2, 4, 6], isEven)
      expect(result).toEqual([2, 4, 6])
    })

    it('returns empty for empty input', () => {
      const result = composer.evaluateAll([], isEven)
      expect(result).toEqual([])
    })

    it('works with composed rule', () => {
      const composed = RuleOperators.and([isEven, isGreaterThan5])
      const result = composer.evaluateAll([2, 4, 6, 7, 8, 10], composed)
      expect(result).toEqual([6, 8, 10])
    })
  })

  describe('explain', () => {
    it('returns trace for leaf rule', () => {
      const trace = composer.explain(4, isEven)
      expect(trace.rule).toBe('is-even')
      expect(trace.passed).toBe(true)
      expect(trace.children).toEqual([])
    })

    it('returns trace for failing leaf rule', () => {
      const trace = composer.explain(3, isEven)
      expect(trace.passed).toBe(false)
    })

    it('returns trace for AND composition', () => {
      const composed = RuleOperators.and([isEven, isPositive])
      const trace = composer.explain(4, composed)
      expect(trace.passed).toBe(true)
      expect(trace.children).toHaveLength(2)
      expect(trace.children[0]!.passed).toBe(true)
      expect(trace.children[1]!.passed).toBe(true)
    })

    it('returns trace showing which child failed in AND', () => {
      const composed = RuleOperators.and([isEven, isPositive])
      const trace = composer.explain(-2, composed)
      expect(trace.passed).toBe(false)
      expect(trace.children[0]!.passed).toBe(true)
      expect(trace.children[1]!.passed).toBe(false)
    })

    it('returns trace for OR composition', () => {
      const composed = RuleOperators.or([isEven, isPositive])
      const trace = composer.explain(3, composed)
      expect(trace.passed).toBe(true)
      expect(trace.children[0]!.passed).toBe(false)
      expect(trace.children[1]!.passed).toBe(true)
    })

    it('returns trace for NOT composition', () => {
      const composed = RuleOperators.not(isEven)
      const trace = composer.explain(3, composed)
      expect(trace.passed).toBe(true)
      expect(trace.children[0]!.passed).toBe(false)
    })

    it('returns trace for nested composition', () => {
      const inner = RuleOperators.and([isEven, isPositive])
      const outer = RuleOperators.not(inner)
      const trace = composer.explain(-2, outer)
      expect(trace.passed).toBe(true)
      expect(trace.children[0]!.passed).toBe(false)
      expect(trace.children[0]!.children[0]!.passed).toBe(true)
      expect(trace.children[0]!.children[1]!.passed).toBe(false)
    })
  })

  describe('simplify', () => {
    it('returns same rule for leaf rules', () => {
      const simplified = composer.simplify(isEven)
      expect(simplified.name).toBe('is-even')
    })

    it('simplifies AND of one rule to that rule', () => {
      const composed = RuleOperators.and([isEven])
      const simplified = composer.simplify(composed)
      expect(simplified.name).toBe('is-even')
    })

    it('simplifies OR of one rule to that rule', () => {
      const composed = RuleOperators.or([isEven])
      const simplified = composer.simplify(composed)
      expect(simplified.name).toBe('is-even')
    })

    it('simplifies NOT of NOT to inner rule', () => {
      const notNot = RuleOperators.not(RuleOperators.not(isEven))
      const simplified = composer.simplify(notNot)
      expect(simplified.name).toBe('is-even')
    })

    it('does not simplify AND of multiple rules', () => {
      const composed = RuleOperators.and([isEven, isPositive])
      const simplified = composer.simplify(composed)
      expect(simplified.name).toBe('and')
    })

    it('does not simplify NOT of non-NOT rule', () => {
      const composed = RuleOperators.not(isEven)
      const simplified = composer.simplify(composed)
      expect(simplified.name).toBe('not')
    })

    it('simplifies nested: AND of single NOT NOT', () => {
      const notNot = RuleOperators.not(RuleOperators.not(isEven))
      const composed = RuleOperators.and([notNot])
      const simplified = composer.simplify(composed)
      expect(simplified.name).toBe('is-even')
    })
  })

  describe('getRuleCount', () => {
    it('returns 1 for leaf rule', () => {
      expect(composer.getRuleCount(isEven)).toBe(1)
    })

    it('counts flat AND correctly', () => {
      const composed = RuleOperators.and([isEven, isPositive, isGreaterThan5])
      expect(composer.getRuleCount(composed)).toBe(4)
    })

    it('counts flat OR correctly', () => {
      const composed = RuleOperators.or([isEven, isPositive])
      expect(composer.getRuleCount(composed)).toBe(3)
    })

    it('counts NOT correctly', () => {
      const composed = RuleOperators.not(isEven)
      expect(composer.getRuleCount(composed)).toBe(2)
    })

    it('counts nested composition', () => {
      const inner = RuleOperators.and([isEven, isPositive])
      const outer = RuleOperators.or([inner, isGreaterThan5])
      expect(composer.getRuleCount(outer)).toBe(5)
    })

    it('counts deeply nested composition', () => {
      const deep = RuleOperators.not(
        RuleOperators.and([
          RuleOperators.or([isEven, isPositive]),
          isGreaterThan5,
        ]),
      )
      expect(composer.getRuleCount(deep)).toBe(6)
    })

    it('counts empty AND as 1', () => {
      const composed = RuleOperators.and<number>([])
      expect(composer.getRuleCount(composed)).toBe(1)
    })
  })

  describe('getConfig', () => {
    it('returns default config', () => {
      const c = new RuleComposer()
      expect(c.getConfig().shortCircuit).toBe(true)
    })

    it('returns custom config', () => {
      const c = new RuleComposer({ shortCircuit: false })
      expect(c.getConfig().shortCircuit).toBe(false)
    })
  })
})

describe('DEFAULT_CONFIG', () => {
  it('has shortCircuit true by default', () => {
    expect(DEFAULT_CONFIG.shortCircuit).toBe(true)
  })
})

describe('Edge Cases', () => {
  let composer: RuleComposer

  beforeEach(() => {
    composer = new RuleComposer()
  })

  it('empty AND returns true for any input', () => {
    const rule = RuleOperators.and<number>([])
    expect(rule.predicate(0)).toBe(true)
    expect(rule.predicate(999)).toBe(true)
  })

  it('empty OR returns false for any input', () => {
    const rule = RuleOperators.or<number>([])
    expect(rule.predicate(0)).toBe(false)
    expect(rule.predicate(999)).toBe(false)
  })

  it('deeply nested composition evaluates correctly', () => {
    const level3 = RuleOperators.and([isEven, isPositive])
    const level2 = RuleOperators.or([level3, isGreaterThan5])
    const level1 = RuleOperators.not(level2)
    expect(level1.predicate(4)).toBe(false)
    expect(level1.predicate(-3)).toBe(true)
    expect(level1.predicate(7)).toBe(false)
  })

  it('all operators combined in one tree', () => {
    const a = isEven
    const b = isPositive
    const c = isGreaterThan5
    const d = isLessThan10

    const xored = RuleOperators.xor(a, b)
    const nanded = RuleOperators.nand([c, d])
    const implied = RuleOperators.implies(xored, nanded)
    const ifElse = RuleOperators.ifThenElse(implied, a, d)

    expect(ifElse.predicate(6)).toBe(true)
    expect(ifElse.predicate(7)).toBe(true)
  })

  it('explain works on deeply nested rule', () => {
    const inner = RuleOperators.and([isEven, isPositive])
    const middle = RuleOperators.or([inner, isGreaterThan5])
    const outer = RuleOperators.not(middle)
    const trace = composer.explain(4, outer)
    expect(trace.passed).toBe(false)
    expect(trace.children).toHaveLength(1)
  })

  it('fromPredicate with complex object type', () => {
    interface Item {
      value: number
      label: string
    }
    const itemComposer = new RuleComposer()
    const rule = itemComposer.fromPredicate<Item>(
      'positive',
      (item) => item.value > 0,
    )
    expect(rule.predicate({ value: 5, label: 'test' })).toBe(true)
    expect(rule.predicate({ value: -1, label: 'test' })).toBe(false)
  })

  it('RuleOperators work with string type', () => {
    const startsWithA = makeRule<string>('starts-a', (s) => s.startsWith('a'))
    const longerThan3 = makeRule<string>('long3', (s) => s.length > 3)
    const composed = RuleOperators.and([startsWithA, longerThan3])
    expect(composed.predicate('apple')).toBe(true)
    expect(composed.predicate('ant')).toBe(false)
    expect(composed.predicate('banana')).toBe(false)
  })
})
