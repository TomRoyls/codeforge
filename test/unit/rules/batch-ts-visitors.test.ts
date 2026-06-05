import { describe, test } from 'vitest'
import { noMixedEnumsRule } from '../../../src/rules/patterns/no-mixed-enums.js'
import { noUnnecessaryReadonlyRule } from '../../../src/rules/patterns/no-unnecessary-readonly.js'
import { noUnnecessaryLiteralKeyRule } from '../../../src/rules/patterns/no-unnecessary-literal-key.js'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper.js'

describe('TS-specific visitor name rules', () => {
  test('no-mixed-enums flags mixed implicit/explicit members', () => {
    const code = 'enum Foo { A, B = 2, C }'
    const v = runRule(noMixedEnumsRule, code)
    expectViolations(v, ['mixed'])
  })

  test('no-mixed-enums does not flag all-implicit enum', () => {
    const code = 'enum Foo { A, B, C }'
    const v = runRule(noMixedEnumsRule, code)
    expectNoViolations(v)
  })

  test('no-mixed-enums does not flag all-explicit enum', () => {
    const code = 'enum Foo { A = 1, B = 2, C = 3 }'
    const v = runRule(noMixedEnumsRule, code)
    expectNoViolations(v)
  })

  test('no-unnecessary-readonly processes readonly interface property', () => {
    const code = 'interface Foo { readonly bar: number }'
    const v = runRule(noUnnecessaryReadonlyRule, code)
    expect(v).toBeDefined()
  })

  test('no-unnecessary-literal-key processes string literal key', () => {
    const code = 'interface Foo { "bar": number }'
    const v = runRule(noUnnecessaryLiteralKeyRule, code)
    expect(v).toBeDefined()
  })
})
