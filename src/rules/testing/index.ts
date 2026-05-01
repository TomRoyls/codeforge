import { consistentTestItRule } from './consistent-test-it.js'
import { expectExpectRule } from './expect-expect.js'
import { maxExpectsRule } from './max-expects.js'
import { maxNestedDescribeRule } from './max-nested-describe.js'
import { noAliasMethodsRule } from './no-alias-methods.js'
import { noAssertionInSetupRule } from './no-assertion-in-setup.js'
import { noAssertionInLoopRule } from './no-assertion-in-loop.js'
import { noRedundantExpectRule } from './no-redundant-expect.js'
import { noRestrictedMatchersRule } from './no-restricted-matchers.js'
import { noRestrictedJestMethodsRule } from './no-restricted-jest-methods.js'
import { noAsyncSuiteRule } from './no-async-suite.js'
import { noCommentedOutTestsRule } from './no-commented-out-tests.js'
import { noConditionalExpectRule } from './no-conditional-expect.js'
import { noConfusingDoubleEqualRule } from './no-confusing-double-equal.js'
import { noAssigningExpectResultRule } from './no-assigning-expect-result.js'
import { noAssigningHooksReturnRule } from './no-assigning-hooks-return.js'
import { noDynamicDescribeRule } from './no-dynamic-describe.js'
import { noEmptyHookRule } from './no-empty-hook.js'
import { noConfusingTestNameRule } from './no-confusing-test-name.js'
import { noEvalInTestRule } from './no-eval-in-test.js'
import { noMisusedMatchersRule } from './no-misused-matchers.js'
import { noMisplacedHookRule } from './no-misplaced-hook.js'
import { requireHookDescriptionRule } from './require-hook-description.js'
import { noAsyncSnapshotRule } from './no-async-snapshot.js'
import { noAsyncSetupRule } from './no-async-setup.js'
import { noConfusingConditionalAccessRule } from './no-confusing-conditional-access.js'
import { noConditionalInTestRule } from './no-conditional-in-test.js'
import { noConsoleInTestsRule } from './no-console-in-tests.js'
import { noDeprecatedFunctionsRule } from './no-deprecated-functions.js'
import { noDoneCallbackRule } from './no-done-callback.js'
import { noDuplicateHooksRule } from './no-duplicate-hooks.js'
import { noEmptyDescribeRule } from './no-empty-describe.js'
import { noFocusedTestsRule } from './no-focused-tests.js'
import { noIdenticalTitleRule } from './no-identical-title.js'
import { noInterpolationInSnapshotsRule } from './no-interpolation-in-snapshots.js'
import { noJestGlobalsRule } from './no-jest-globals.js'
import { noLargeJestSnapshotsRule } from './no-large-jest-snapshots.js'
import { noRedundantActionRule } from './no-redundant-action.js'
import { noSkippedTestsRule } from './no-skipped-tests.js'
import { noStandaloneExpectRule } from './no-standalone-expect.js'
import { noTestPrefixRule } from './no-test-prefix.js'
import { noTestReturnStatementRule } from './no-test-return-statement.js'
import { noUselessAsyncTestRule } from './no-useless-async-test.js'
import { noUnsafeMatchersRule } from './no-unsafe-matchers.js'
import { preferCalledWithRule } from './prefer-called-with.js'
import { preferEqualityMatcherRule } from './prefer-equality-matcher.js'
import { preferEachRule } from './prefer-each.js'
import { preferExpectResolvesRule } from './prefer-expect-resolves.js'
import { preferExpectAssertionsRule } from './prefer-expect-assertions.js'
import { noMisusedAsyncRule } from './no-misused-async.js'
import { noNestedDescribeRule } from './no-nested-describe.js'
import { noImplicitReturnInTestRule } from './no-implicit-return-in-test.js'
import { preferHooksOnTopRule } from './prefer-hooks-on-top.js'
import { preferInlineSnapshotRule } from './prefer-inline-snapshot.js'
import { preferLiteralMatchersRule } from './prefer-literal-matchers.js'
import { preferMockPromiseShorthandRule } from './prefer-mock-promise-shorthand.js'
import { preferMockReturnValueRule } from './prefer-mock-return-value.js'
import { preferResolvesRejectsRule } from './prefer-resolves-rejects.js'
import { preferNamedSnapshotRule } from './prefer-named-snapshot.js'
import { preferSnapshotHintRule } from './prefer-snapshot-hint.js'
import { preferSpyOnRule } from './prefer-spy-on.js'
import { preferStrictEqualRule } from './prefer-strict-equal.js'
import { preferToBeRule } from './prefer-to-be.js'
import { preferToBeNullRule } from './prefer-to-be-null.js'
import { preferToBeUndefinedRule } from './prefer-to-be-undefined.js'
import { preferToContainRule } from './prefer-to-contain.js'
import { preferToHaveLengthRule } from './prefer-to-have-length.js'
import { preferTodoRule } from './prefer-todo.js'
import { requireHookRule } from './require-hook.js'
import { requireToThrowMessageRule } from './require-to-throw-message.js'
import { requireTopLevelDescribeRule } from './require-top-level-describe.js'
import { validExpectRule } from './valid-expect.js'
import { validTitleRule } from './valid-title.js'

export const testingRules = {
  'consistent-test-it': consistentTestItRule,
  'expect-expect': expectExpectRule,
  'max-expects': maxExpectsRule,
  'max-nested-describe': maxNestedDescribeRule,
  'no-alias-methods': noAliasMethodsRule,
  'no-assigning-expect-result': noAssigningExpectResultRule,
  'no-assigning-hooks-return': noAssigningHooksReturnRule,
  'no-dynamic-describe': noDynamicDescribeRule,
  'no-empty-hook': noEmptyHookRule,
  'no-assertion-in-setup': noAssertionInSetupRule,
  'no-assertion-in-loop': noAssertionInLoopRule,
  'no-redundant-expect': noRedundantExpectRule,
  'no-restricted-matchers': noRestrictedMatchersRule,
  'no-restricted-jest-methods': noRestrictedJestMethodsRule,
  'no-async-suite': noAsyncSuiteRule,
  'no-commented-out-tests': noCommentedOutTestsRule,
  'no-conditional-expect': noConditionalExpectRule,
  'no-confusing-double-equal': noConfusingDoubleEqualRule,
  'no-confusing-test-name': noConfusingTestNameRule,
  'no-eval-in-test': noEvalInTestRule,
  'no-misused-matchers': noMisusedMatchersRule,
  'no-misplaced-hook': noMisplacedHookRule,
  'require-hook-description': requireHookDescriptionRule,
  'no-async-snapshot': noAsyncSnapshotRule,
  'no-async-setup': noAsyncSetupRule,
  'no-confusing-conditional-access': noConfusingConditionalAccessRule,
  'no-conditional-in-test': noConditionalInTestRule,
  'no-console-in-tests': noConsoleInTestsRule,
  'no-deprecated-functions': noDeprecatedFunctionsRule,
  'no-done-callback': noDoneCallbackRule,
  'no-duplicate-hooks': noDuplicateHooksRule,
  'no-empty-describe': noEmptyDescribeRule,
  'no-focused-tests': noFocusedTestsRule,
  'no-identical-title': noIdenticalTitleRule,
  'no-interpolation-in-snapshots': noInterpolationInSnapshotsRule,
  'no-jest-globals': noJestGlobalsRule,
  'no-large-jest-snapshots': noLargeJestSnapshotsRule,
  'no-redundant-action': noRedundantActionRule,
  'no-skipped-tests': noSkippedTestsRule,
  'no-standalone-expect': noStandaloneExpectRule,
  'no-test-prefix': noTestPrefixRule,
  'no-test-return-statement': noTestReturnStatementRule,
  'no-useless-async-test': noUselessAsyncTestRule,
  'no-unsafe-matchers': noUnsafeMatchersRule,
  'prefer-called-with': preferCalledWithRule,
  'prefer-equality-matcher': preferEqualityMatcherRule,
  'prefer-each': preferEachRule,
  'prefer-expect-resolves': preferExpectResolvesRule,
  'prefer-expect-assertions': preferExpectAssertionsRule,
  'no-misused-async': noMisusedAsyncRule,
  'no-nested-describe': noNestedDescribeRule,
  'no-implicit-return-in-test': noImplicitReturnInTestRule,
  'prefer-hooks-on-top': preferHooksOnTopRule,
  'prefer-inline-snapshot': preferInlineSnapshotRule,
  'prefer-literal-matchers': preferLiteralMatchersRule,
  'prefer-mock-promise-shorthand': preferMockPromiseShorthandRule,
  'prefer-mock-return-value': preferMockReturnValueRule,
  'prefer-resolves-rejects': preferResolvesRejectsRule,
  'prefer-named-snapshot': preferNamedSnapshotRule,
  'prefer-snapshot-hint': preferSnapshotHintRule,
  'prefer-spy-on': preferSpyOnRule,
  'prefer-strict-equal': preferStrictEqualRule,
  'prefer-to-be': preferToBeRule,
  'prefer-to-be-null': preferToBeNullRule,
  'prefer-to-be-undefined': preferToBeUndefinedRule,
  'prefer-to-contain': preferToContainRule,
  'prefer-to-have-length': preferToHaveLengthRule,
  'prefer-todo': preferTodoRule,
  'require-hook': requireHookRule,
  'require-to-throw-message': requireToThrowMessageRule,
  'require-top-level-describe': requireTopLevelDescribeRule,
  'valid-expect': validExpectRule,
  'valid-title': validTitleRule,
}

export { consistentTestItRule } from './consistent-test-it.js'
export { expectExpectRule } from './expect-expect.js'
export { maxExpectsRule } from './max-expects.js'
export { maxNestedDescribeRule } from './max-nested-describe.js'
export { noAliasMethodsRule } from './no-alias-methods.js'
export { noAssigningExpectResultRule } from './no-assigning-expect-result.js'
export { noAssigningHooksReturnRule } from './no-assigning-hooks-return.js'
export { noDynamicDescribeRule } from './no-dynamic-describe.js'
export { noEmptyHookRule } from './no-empty-hook.js'
export { noAssertionInSetupRule } from './no-assertion-in-setup.js'
export { noAssertionInLoopRule } from './no-assertion-in-loop.js'
export { noAssertTruthinessRule } from './no-assert-truthiness.js'
export { noRedundantExpectRule } from './no-redundant-expect.js'
export { noRestrictedMatchersRule } from './no-restricted-matchers.js'
export { noRestrictedJestMethodsRule } from './no-restricted-jest-methods.js'
export { noAsyncSuiteRule } from './no-async-suite.js'
export { noCommentedOutTestsRule } from './no-commented-out-tests.js'
export { noConditionalExpectRule } from './no-conditional-expect.js'
export { noConfusingDoubleEqualRule } from './no-confusing-double-equal.js'
export { noConfusingTestNameRule } from './no-confusing-test-name.js'
export { noEvalInTestRule } from './no-eval-in-test.js'
export { noMisusedMatchersRule } from './no-misused-matchers.js'
export { noMisplacedHookRule } from './no-misplaced-hook.js'
export { requireHookDescriptionRule } from './require-hook-description.js'
export { noAsyncSnapshotRule } from './no-async-snapshot.js'
export { noAsyncSetupRule } from './no-async-setup.js'
export { noConfusingConditionalAccessRule } from './no-confusing-conditional-access.js'
export { noConditionalInTestRule } from './no-conditional-in-test.js'
export { noConsoleInTestsRule } from './no-console-in-tests.js'
export { noDeprecatedFunctionsRule } from './no-deprecated-functions.js'
export { noDoneCallbackRule } from './no-done-callback.js'
export { noDuplicateHooksRule } from './no-duplicate-hooks.js'
export { noEmptyDescribeRule } from './no-empty-describe.js'
export { noFocusedTestsRule } from './no-focused-tests.js'
export { noIdenticalTitleRule } from './no-identical-title.js'
export { noInterpolationInSnapshotsRule } from './no-interpolation-in-snapshots.js'
export { noJestGlobalsRule } from './no-jest-globals.js'
export { noLargeJestSnapshotsRule } from './no-large-jest-snapshots.js'
export { noRedundantActionRule } from './no-redundant-action.js'
export { noSkippedTestsRule } from './no-skipped-tests.js'
export { noStandaloneExpectRule } from './no-standalone-expect.js'
export { noTestPrefixRule } from './no-test-prefix.js'
export { noTestReturnStatementRule } from './no-test-return-statement.js'
export { noUselessAsyncTestRule } from './no-useless-async-test.js'
export { noUnsafeMatchersRule } from './no-unsafe-matchers.js'
export { preferCalledWithRule } from './prefer-called-with.js'
export { preferEqualityMatcherRule } from './prefer-equality-matcher.js'
export { preferEachRule } from './prefer-each.js'
export { preferExpectResolvesRule } from './prefer-expect-resolves.js'
export { preferExpectAssertionsRule } from './prefer-expect-assertions.js'
export { noMisusedAsyncRule } from './no-misused-async.js'
export { noNestedDescribeRule } from './no-nested-describe.js'
export { noImplicitReturnInTestRule } from './no-implicit-return-in-test.js'
export { preferHooksOnTopRule } from './prefer-hooks-on-top.js'
export { preferInlineSnapshotRule } from './prefer-inline-snapshot.js'
export { preferLiteralMatchersRule } from './prefer-literal-matchers.js'
export { preferMockPromiseShorthandRule } from './prefer-mock-promise-shorthand.js'
export { preferMockReturnValueRule } from './prefer-mock-return-value.js'
export { preferResolvesRejectsRule } from './prefer-resolves-rejects.js'
export { preferNamedSnapshotRule } from './prefer-named-snapshot.js'
export { preferSnapshotHintRule } from './prefer-snapshot-hint.js'
export { preferSpyOnRule } from './prefer-spy-on.js'
export { preferStrictEqualRule } from './prefer-strict-equal.js'
export { preferToBeRule } from './prefer-to-be.js'
export { preferToBeNullRule } from './prefer-to-be-null.js'
export { preferToBeUndefinedRule } from './prefer-to-be-undefined.js'
export { preferToContainRule } from './prefer-to-contain.js'
export { preferToHaveLengthRule } from './prefer-to-have-length.js'
export { preferTodoRule } from './prefer-todo.js'
export { requireHookRule } from './require-hook.js'
export { requireToThrowMessageRule } from './require-to-throw-message.js'
export { requireTopLevelDescribeRule } from './require-top-level-describe.js'
export { validExpectRule } from './valid-expect.js'
export { validTitleRule } from './valid-title.js'
