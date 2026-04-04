import { noSkippedTestsRule } from './no-skipped-tests.js'
import { noFocusedTestsRule } from './no-focused-tests.js'

export const testingRules = {
  'no-skipped-tests': noSkippedTestsRule,
  'no-focused-tests': noFocusedTestsRule,
}

export { noSkippedTestsRule, noFocusedTestsRule }
