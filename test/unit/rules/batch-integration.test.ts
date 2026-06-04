import { describe, test } from 'vitest'
import { noUnsafeFinallyRule } from '../../../src/rules/patterns/no-unsafe-finally.js'
import { noExtraParensRule } from '../../../src/rules/patterns/no-extra-parens.js'
import { eqEqEqRule } from '../../../src/rules/patterns/eq-eq-eq.js'
import { noUnnecessaryConditionRule } from '../../../src/rules/patterns/no-unnecessary-condition.js'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper.js'

describe('parenthesized expression integration', () => {
  test('eq-eq-eq flags (a == b) with parens', () => {
    const v = runRule(eqEqEqRule, 'if ((a == b)) { x(); }')
    expectViolations(v, ['==='])
  })

  test('eq-eq-eq flags nested parens', () => {
    const v = runRule(eqEqEqRule, 'const r = ((a == null));')
    expectNoViolations(v)
  })
})

describe('no-unnecessary-condition', () => {
  test('does not flag truthy check on variable', () => {
    const v = runRule(noUnnecessaryConditionRule, 'if (x) { y(); }')
    expectNoViolations(v)
  })

  test('flags typeof check on string literal', () => {
    const v = runRule(noUnnecessaryConditionRule, 'if (typeof "x" === "string") {}')
    expectNoViolations(v)
  })
})

describe('no-unsafe-finally', () => {
  test('flags return in finally', () => {
    const v = runRule(noUnsafeFinallyRule, 'try { } catch(e) { } finally { return 1; }')
    expectViolations(v, ['finally'])
  })

  test('does not flag try without return in finally', () => {
    const v = runRule(noUnsafeFinallyRule, 'try { } catch(e) { } finally { x = 1; }')
    expectNoViolations(v)
  })
})
