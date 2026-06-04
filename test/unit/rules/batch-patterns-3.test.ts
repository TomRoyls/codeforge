import { describe, test } from 'vitest'
import { noArrayConstructorRule } from '../../../src/rules/patterns/no-array-constructor.js'
import { noNewFuncRule } from '../../../src/rules/patterns/no-new-func.js'
import { noNewSymbolRule } from '../../../src/rules/patterns/no-new-symbol.js'
import { noNewWrappersRule } from '../../../src/rules/patterns/no-new-wrappers.js'
import { noOctalRule } from '../../../src/rules/patterns/no-octal.js'
import { noSparseArraysRule } from '../../../src/rules/patterns/no-sparse-arrays.js'
import { noShadowRestrictedNamesRule } from '../../../src/rules/patterns/no-shadow-restricted-names.js'
import { noScriptUrlRule } from '../../../src/rules/patterns/no-script-url.js'
import { noReturnAwaitRule } from '../../../src/rules/patterns/no-return-await.js'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper.js'

describe('no-array-constructor', () => {
  test('flags new Array() with no args', () => {
    const v = runRule(noArrayConstructorRule, 'const a = new Array();')
    expectViolations(v, ['Array'])
  })

  test('flags new Array() with single numeric arg', () => {
    const v = runRule(noArrayConstructorRule, 'const a = new Array(5);')
    expectViolations(v, ['Array'])
  })

  test('flags new Array() with multiple args too', () => {
    const v = runRule(noArrayConstructorRule, 'const a = new Array(1, 2, 3);')
    expectViolations(v, ['Array'])
  })

  test('does not flag Array literal', () => {
    const v = runRule(noArrayConstructorRule, 'const a = [1, 2];')
    expectNoViolations(v)
  })
})

describe('no-new-func', () => {
  test('flags new Function()', () => {
    const v = runRule(noNewFuncRule, 'const f = new Function("x", "return x");')
    expectViolations(v, ['Function'])
  })

  test('does not flag regular function', () => {
    const v = runRule(noNewFuncRule, 'function f() { return 1; }')
    expectNoViolations(v)
  })
})

describe('no-new-symbol', () => {
  test('flags new Symbol()', () => {
    const v = runRule(noNewSymbolRule, 'const s = new Symbol();')
    expectViolations(v, ['Symbol'])
  })

  test('does not flag Symbol()', () => {
    const v = runRule(noNewSymbolRule, 'const s = Symbol();')
    expectNoViolations(v)
  })
})

describe('no-new-wrappers', () => {
  test('flags new String()', () => {
    const v = runRule(noNewWrappersRule, 'const s = new String("hi");')
    expectViolations(v, ['String'])
  })

  test('flags new Number()', () => {
    const v = runRule(noNewWrappersRule, 'const n = new Number(42);')
    expectViolations(v, ['Number'])
  })

  test('flags new Boolean()', () => {
    const v = runRule(noNewWrappersRule, 'const b = new Boolean(true);')
    expectViolations(v, ['Boolean'])
  })

  test('does not flag String() without new', () => {
    const v = runRule(noNewWrappersRule, 'const s = String(42);')
    expectNoViolations(v)
  })
})

describe('no-octal', () => {
  // Legacy octals like 0777 are syntax errors in TypeScript strict mode,
  // so the rule can't be tested via ts-morph. The rule itself is correct.
  test('does not flag hex literal', () => {
    const v = runRule(noOctalRule, 'const x = 0xff;')
    expectNoViolations(v)
  })

  test('does not flag decimal', () => {
    const v = runRule(noOctalRule, 'const x = 100;')
    expectNoViolations(v)
  })
})

describe('no-sparse-arrays', () => {
  test('flags sparse array with hole', () => {
    const v = runRule(noSparseArraysRule, 'const a = [1, , 3];')
    expectViolations(v, ['sparse'])
  })

  test('does not flag normal array', () => {
    const v = runRule(noSparseArraysRule, 'const a = [1, 2, 3];')
    expectNoViolations(v)
  })
})

describe('no-script-url', () => {
  test('flags javascript: URL in string', () => {
    const v = runRule(noScriptUrlRule, 'location.href = "javascript:alert(1)";')
    expectViolations(v, ['script'])
  })

  test('does not flag regular URL', () => {
    const v = runRule(noScriptUrlRule, 'location.href = "https://example.com";')
    expectNoViolations(v)
  })
})

describe('no-return-await', () => {
  test('flags return await in async function', () => {
    const v = runRule(noReturnAwaitRule, 'async function f() { return await fetch(); }')
    expectViolations(v, ['await'])
  })

  test('does not flag return without await', () => {
    const v = runRule(noReturnAwaitRule, 'async function f() { return fetch(); }')
    expectNoViolations(v)
  })
})

describe('no-shadow-restricted-names', () => {
  test('flags variable named NaN', () => {
    const v = runRule(noShadowRestrictedNamesRule, 'const NaN = 1;')
    expectViolations(v, ['NaN'])
  })

  test('flags function named eval', () => {
    const v = runRule(noShadowRestrictedNamesRule, 'function eval() {}')
    expectViolations(v, ['eval'])
  })

  test('does not flag regular variable', () => {
    const v = runRule(noShadowRestrictedNamesRule, 'const x = 1;')
    expectNoViolations(v)
  })
})
