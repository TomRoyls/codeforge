import { describe, test, expect } from 'vitest'
import { noConsoleLogRule } from '../../../src/rules/patterns/no-console-log.js'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper.js'

describe('no-console-log', () => {
  test('flags console.log', () => {
    const v = runRule(noConsoleLogRule, 'console.log("hello");')
    expectViolations(v, ['console.log'])
  })

  test('flags console.warn', () => {
    const v = runRule(noConsoleLogRule, 'console.warn("warning");')
    expectViolations(v, ['console.warn'])
  })

  test('flags console.error', () => {
    const v = runRule(noConsoleLogRule, 'console.error("error");')
    expectViolations(v, ['console.error'])
  })

  test('flags console.info', () => {
    const v = runRule(noConsoleLogRule, 'console.info("info");')
    expectViolations(v, ['console.info'])
  })

  test('flags console.debug', () => {
    const v = runRule(noConsoleLogRule, 'console.debug("debug");')
    expectViolations(v, ['console.debug'])
  })

  test('does not flag non-console call', () => {
    const v = runRule(noConsoleLogRule, 'myObj.log("hello");')
    expectNoViolations(v)
  })

  test('does not flag standalone function call', () => {
    const v = runRule(noConsoleLogRule, 'log("hello");')
    expectNoViolations(v)
  })

  test('does not flag console.method not in list', () => {
    const v = runRule(noConsoleLogRule, 'console.customMethod("hello");')
    expectNoViolations(v)
  })
})
