import { describe, test, expect } from 'vitest'
import { noUnsafeFinallyRule } from '../../../src/rules/patterns/no-unsafe-finally.js'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper.js'

describe('no-unsafe-finally', () => {
  test('flags return in finally', () => {
    const v = runRule(noUnsafeFinallyRule, 'try { } catch(e) { } finally { return 1; }')
    expectViolations(v, ['Unsafe'])
  })

  test('flags throw in finally', () => {
    const v = runRule(noUnsafeFinallyRule, 'try { } catch(e) { } finally { throw new Error(); }')
    expectViolations(v, ['Unsafe'])
  })

  test('flags break in finally', () => {
    const v = runRule(noUnsafeFinallyRule, 'while(true) { try { } finally { break; } }')
    expectViolations(v, ['Unsafe'])
  })

  test('flags continue in finally', () => {
    const v = runRule(noUnsafeFinallyRule, 'while(true) { try { } finally { continue; } }')
    expectViolations(v, ['Unsafe'])
  })

  test('flags return nested in if inside finally', () => {
    const v = runRule(noUnsafeFinallyRule, 'try { } finally { if (x) { return 1; } }')
    expectViolations(v, ['Unsafe'])
  })

  test('flags return nested in else inside finally', () => {
    const v = runRule(noUnsafeFinallyRule, 'try { } finally { if (x) { } else { return 1; } }')
    expectViolations(v, ['Unsafe'])
  })

  test('does not flag return inside nested function in finally', () => {
    const v = runRule(noUnsafeFinallyRule, 'try { } finally { const fn = () => { return 1; }; }')
    expectNoViolations(v)
  })

  test('does not flag return inside nested function expression in finally', () => {
    const v = runRule(noUnsafeFinallyRule, 'try { } finally { [1,2].forEach(() => { return; }); }')
    expectNoViolations(v)
  })

  test('does not flag safe finally block', () => {
    const v = runRule(noUnsafeFinallyRule, 'try { } finally { console.log("cleanup"); }')
    expectNoViolations(v)
  })

  test('does not flag try without finally', () => {
    const v = runRule(noUnsafeFinallyRule, 'try { } catch(e) { }')
    expectNoViolations(v)
  })
})
