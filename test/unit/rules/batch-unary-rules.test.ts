import { describe, test } from 'vitest'
import { noDeleteVarRule } from '../../../src/rules/patterns/no-delete-var.js'
import { noUnnecessaryDoubleNegationRule } from '../../../src/rules/patterns/no-unnecessary-double-negation.js'
import { noNegatedConditionRule } from '../../../src/rules/patterns/no-negated-condition.js'
import { noUnnecessaryPlusNewRule } from '../../../src/rules/patterns/no-unnecessary-plus-new.js'
import { noUnnecessaryBitwiseNotRule } from '../../../src/rules/patterns/no-unnecessary-bitwise-not.js'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper.js'

describe('no-delete-var', () => {
  test('flags delete on variable', () => {
    const v = runRule(noDeleteVarRule, 'delete x;')
    expectViolations(v, ['delete'])
  })

  test('does not flag delete on property (only flags variables)', () => {
    const v = runRule(noDeleteVarRule, 'delete obj.prop;')
    expectNoViolations(v)
  })

  test('does not flag regular code', () => {
    const v = runRule(noDeleteVarRule, 'const x = 1;')
    expectNoViolations(v)
  })
})

describe('no-unnecessary-double-negation', () => {
  test('flags !! on boolean context', () => {
    const v = runRule(noUnnecessaryDoubleNegationRule, 'const x = !!true;')
    expectViolations(v, ['!!'])
  })

  test('does not flag single negation', () => {
    const v = runRule(noUnnecessaryDoubleNegationRule, 'const x = !false;')
    expectNoViolations(v)
  })
})

describe('no-negated-condition', () => {
  test('flags negated comparison: !(a === b)', () => {
    const v = runRule(noNegatedConditionRule, 'if (!(a === b)) { x(); } else { y(); }')
    expectViolations(v, ['negat'])
  })

  test('does not flag simple negation: !x', () => {
    const v = runRule(noNegatedConditionRule, 'if (!x) { a(); } else { b(); }')
    expectNoViolations(v)
  })
})

describe('no-unnecessary-plus-new', () => {
  test('flags + on number literal', () => {
    const v = runRule(noUnnecessaryPlusNewRule, 'const x = +5;')
    expectViolations(v, ['plus'])
  })

  test('does not flag +new Date()', () => {
    const v = runRule(noUnnecessaryPlusNewRule, 'const x = +new Date();')
    expectNoViolations(v)
  })
})

describe('no-unnecessary-bitwise-not', () => {
  test('flags ~~ on number', () => {
    const v = runRule(noUnnecessaryBitwiseNotRule, 'const x = ~~3.14;')
    expectViolations(v, ['~~'])
  })

  test('does not flag single bitwise not', () => {
    const v = runRule(noUnnecessaryBitwiseNotRule, 'const x = ~0;')
    expectNoViolations(v)
  })
})
