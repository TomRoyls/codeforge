import { describe, test } from 'vitest'
import { noInnerHTMLRule } from '../../../src/rules/security/no-innerhtml.js'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper.js'

describe('no-innerhtml', () => {
  test('flags innerHTML assignment', () => {
    const v = runRule(noInnerHTMLRule, 'el.innerHTML = "<script>alert(1)</script>";')
    expectViolations(v, ['innerHTML'])
  })

  test('flags outerHTML assignment', () => {
    const v = runRule(noInnerHTMLRule, 'el.outerHTML = "<b>x</b>";')
    expectViolations(v, ['outerHTML'])
  })

  test('does not flag innerHTML read (write-only rule)', () => {
    const v = runRule(noInnerHTMLRule, 'const x = el.innerHTML;')
    expectNoViolations(v)
  })

  test('does not flag textContent', () => {
    const v = runRule(noInnerHTMLRule, 'el.textContent = "safe";')
    expectNoViolations(v)
  })

  test('does not flag non-DOM property', () => {
    const v = runRule(noInnerHTMLRule, 'obj.value = "safe";')
    expectNoViolations(v)
  })
})
