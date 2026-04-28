import { consistentTestItRule } from './consistent-test-it.js'
import { expectExpectRule } from './expect-expect.js'
import { maxNestedDescribeRule } from './max-nested-describe.js'
import { noAsyncSuiteRule } from './no-async-suite.js'
import { noConditionalExpectRule } from './no-conditional-expect.js'
import { noFocusedTestsRule } from './no-focused-tests.js'
import { noIdenticalTitleRule } from './no-identical-title.js'
import { noSkippedTestsRule } from './no-skipped-tests.js'
import { noTestReturnStatementRule } from './no-test-return-statement.js'
import { requireTopLevelDescribeRule } from './require-top-level-describe.js'

export const testingRules = {
  'consistent-test-it': consistentTestItRule,
  'expect-expect': expectExpectRule,
  'max-nested-describe': maxNestedDescribeRule,
  'no-async-suite': noAsyncSuiteRule,
  'no-conditional-expect': noConditionalExpectRule,
  'no-focused-tests': noFocusedTestsRule,
  'no-identical-title': noIdenticalTitleRule,
  'no-skipped-tests': noSkippedTestsRule,
  'no-test-return-statement': noTestReturnStatementRule,
  'require-top-level-describe': requireTopLevelDescribeRule,
}

export { consistentTestItRule } from './consistent-test-it.js'
export { expectExpectRule } from './expect-expect.js'
export { maxNestedDescribeRule } from './max-nested-describe.js'
export { noAsyncSuiteRule } from './no-async-suite.js'
export { noConditionalExpectRule } from './no-conditional-expect.js'
export { noFocusedTestsRule } from './no-focused-tests.js'
export { noIdenticalTitleRule } from './no-identical-title.js'
export { noSkippedTestsRule } from './no-skipped-tests.js'
export { noTestReturnStatementRule } from './no-test-return-statement.js'
export { requireTopLevelDescribeRule } from './require-top-level-describe.js'
