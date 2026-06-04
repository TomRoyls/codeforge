import { describe, test } from 'vitest'
import { noMultiStrRule } from '../../../src/rules/patterns/no-multi-str.js'
import { noTabsRule } from '../../../src/rules/patterns/no-tabs.js'
import { noUnnecessaryEscapeRule } from '../../../src/rules/patterns/no-unnecessary-escape.js'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper.js'

describe('no-multi-str', () => {
  test('does not flag regular string', () => {
    const v = runRule(noMultiStrRule, 'const x = "hello";')
    expectNoViolations(v)
  })

  test('does not flag template literal', () => {
    const v = runRule(noMultiStrRule, 'const x = `multi\nline`;')
    expectNoViolations(v)
  })
})

describe('no-tabs', () => {
  test('flags string with tab', () => {
    const v = runRule(noTabsRule, 'const x = "hello\tworld";')
    expectViolations(v, ['tab'])
  })

  test('does not flag string without tabs', () => {
    const v = runRule(noTabsRule, 'const x = "hello world";')
    expectNoViolations(v)
  })
})

describe('no-unnecessary-escape', () => {
  test('does not flag string without escapes', () => {
    const v = runRule(noUnnecessaryEscapeRule, 'const x = "hello";')
    expectNoViolations(v)
  })

  test('does not flag valid escape sequences', () => {
    const v = runRule(noUnnecessaryEscapeRule, 'const x = "hello\\n";')
    expectNoViolations(v)
  })
})
