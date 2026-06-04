import { describe, test } from 'vitest'
import { noSyncInAsyncRule } from '../../../src/rules/performance/no-sync-in-async.js'
import { runRule, expectViolations, expectNoViolations } from './rule-test-helper.js'

describe('no-sync-in-async', () => {
  test('flags readFileSync in async function', () => {
    const v = runRule(noSyncInAsyncRule, 'async function f() { const x = readFileSync("a"); }')
    expectViolations(v, ['sync'])
  })

  test('does not flag sync function call outside async', () => {
    const v = runRule(noSyncInAsyncRule, 'const x = readFileSync("a");')
    expectNoViolations(v)
  })

  test('does not flag async function call', () => {
    const v = runRule(noSyncInAsyncRule, 'async function f() { const x = await readFile("a"); }')
    expectNoViolations(v)
  })
})
