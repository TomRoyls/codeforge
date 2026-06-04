import { describe, test } from 'vitest'
import { noDocumentWriteRule } from '../../../src/rules/security/no-document-write.js'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper.js'

describe('no-document-write', () => {
  test('flags document.write', () => {
    const v = runRule(noDocumentWriteRule, 'document.write("hello");')
    expectViolations(v, ['document.write'])
  })

  test('flags document.writeln', () => {
    const v = runRule(noDocumentWriteRule, 'document.writeln("hello");')
    expectViolations(v, ['document.write'])
  })

  test('does not flag console.log', () => {
    const v = runRule(noDocumentWriteRule, 'console.log("hello");')
    expectNoViolations(v)
  })

  test('does not flag other document methods', () => {
    const v = runRule(noDocumentWriteRule, 'document.getElementById("x");')
    expectNoViolations(v)
  })
})
