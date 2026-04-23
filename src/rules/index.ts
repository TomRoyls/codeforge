import type { RuleDefinition } from './types.js'

import { adaptPluginRule } from './adapter.js'
// Best practices rules
import {
  explicitReturnTypeRule,
  noConsoleRule,
  noMagicNumbersRule,
  noUnnecessaryTypeAssertionRule,
  preferArrayFindRule,
  preferArraySomeRule,
  preferArrowCallbackRule,
  preferConstAssertionsRule,
  preferDefaultExportRule,
  preferExponentOperatorRule,
  preferFlatMapRule,
  preferForOfRule,
  preferRegexLiteralRule,
  preferStringStartEndRule,
  preferStringTemplateRule,
  strictBooleanExpressionsRule,
} from './best-practices/index.js'
// Complexity rules
import {
  maxComplexityRule,
  maxDepthRule,
  maxLinesPerFunctionRule,
  maxLinesRule,
  maxParamsRule,
} from './complexity/index.js'
import {
  noConstantBinaryExpressionRule,
  noEmptyCatchRule,
  noEmptyCharacterClassRule,
  noEmptyFunctionRule,
  noThrowLiteralRule,
  noUselessCatchRule,
} from './correctness/index.js'
// Dependencies rules
import {
  consistentImportsRule,
  noBarrelImportsRule,
  noCircularDepsRule,
  noUnusedExportsRule,
} from './dependencies/index.js'
// Pattern rules
import {
  consistentTypeExportsRule,
  // Orphan pattern rules
  constructorSuperRule,
  curlyRule,
  defaultCaseRule,
  eqEqEqRule,
  explicitModuleBoundaryTypesRule,
  forDirectionRule,
  getterReturnRule,
  maxFileSizeRule,
  maxUnionSizeRule,
  noAlertRule,
  noArrayConstructorRule,
  noArrayDestructuringRule,
  noAsyncPromiseExecutorRule,
  noAsyncWithoutAwaitRule,
  noBitwiseRule,
  noCallerRule,
  noCaseDeclarationsRule,
  noClassAssignRule,
  noCompareNegZeroRule,
  noCondAssignRule,
  noConfusingVoidExpressionRule,
  noConsoleLogRule,
  noConstantConditionRule,
  noConstAssignRule,
  noConstructorReturnRule,
  noControlRegexRule,
  noDebuggerRule,
  noDeleteVarRule,
  noDivRegexRule,
  noDupeArgsRule,
  noDupeClassMembersRule,
  noDupeKeysRule,
  noDuplicateCaseRule,
  noDuplicateCodeRule,
  noDuplicateElseIfRule,
  noDuplicateImportsRule,
  noElseReturnRule,
  noEmptyPatternRule,
  noEmptyRule,
  noEmptyStaticBlockRule,
  noExAssignRule,
  noExplicitAnyRule,
  noExtendNativeRule,
  noExtraBooleanCastRule,
  noFallthroughRule,
  noFloatingPromisesRule,
  noFuncAssignRule,
  noGlobalAssignRule,
  noImplicitCoercionRule,
  noImpliedEvalRule,
  noImportAssignRule,
  noInferrableTypesRule,
  noInvalidRegexpRule,
  noIrregularWhitespaceRule,
  noIteratorRule,
  noLonelyIfRule,
  noLoopFuncRule,
  noLossOfPrecisionRule,
  noMisleadingCharacterClassRule,
  noMisusedPromisesRule,
  noMultiSpacesRule,
  noNestedTernaryRule,
  noNewFuncRule,
  noNewNativeNonconstructorRule,
  noNewWrappersRule,
  noNonNullAssertionRule,
  noNonoctalDecimalEscapeRule,
  noObjCallsRule,
  noObjectConstructorRule,
  noOctalRule,
  noParamReassignRule,
  noPromiseAsBooleanRule,
  noPrototypeBuiltinsRule,
  noRedeclareRule,
  noRegexSpacesRule,
  noReturnAssignRule,
  noReturnAwaitRule,
  noReturnOrAwaitRule,
  noSameSideConditionsRule,
  noSelfAssignRule,
  noSequencesRule,
  noSetterReturnRule,
  noShadowRestrictedNamesRule,
  noShadowRule,
  noSimplifiablePatternRule,
  noSparseArraysRule,
  noStringConcatRule,
  noThenableRule,
  noThisBeforeSuperRule,
  noThrowSyncRule,
  noTypeOnlyReturnRule,
  noUnassignedVarsRule,
  noUndefRule,
  noUnexpectedMultilineRule,
  noUnfinishedTodosRule,
  noUnnecessaryConditionRule,
  noUnnecessaryEscapeInRegexpRule,
  noUnnecessaryQualifierRule,
  noUnnecessarySliceRule,
  noUnnecessaryStringConcatRule,
  noUnnecessaryTemplateExpressionRule,
  noUnnecessaryTypeArgumentsRule,
  noUnneededTernaryRule,
  noUnreachableRule,
  noUnsafeAssignmentRule,
  noUnsafeDeclarationMergingRule,
  noUnsafeFinallyRule,
  noUnsafeNegationRule,
  noUnsafeOptionalChainingRule,
  noUnusedExpressionsRule,
  noUnusedLabelsRule,
  noUnusedPrivateMembersRule,
  noUnusedVarsRule,
  noUselessAssignmentRule,
  noUselessBackreferenceRule,
  noUselessComparisonRule,
  noUselessConcatRule,
  noUselessConstructorRule,
  noUselessEscapeRule,
  noUselessFallbackInSpreadRule,
  noVarRequiresRule,
  noVarRule,
  noVoidRule,
  noWithRule,
  objectShorthandRule,
  preferArrayFlatRule,
  preferAsyncAwaitRule,
  preferAtContextRule,
  preferAtMethodRule,
  preferConstRule,
  preferDateNowRule,
  preferEnumInitializersRule,
  preferExponentiationOperatorRule,
  preferFunctionTypeRule,
  preferIncludesRule,
  preferLiteralEnumMemberRule,
  preferNullishCoalescingRule,
  preferNumberPropertiesRule,
  preferNumericLiteralsRule,
  preferObjectHasOwnRule,
  preferPromiseRejectErrorsRule,
  preferPrototypeMethodsRule,
  preferReadonlyParameterRule,
  preferReadonlyRule,
  preferRegexLiteralsRule,
  preferRegexpExecRule,
  preferRestParamsRule,
  preferSpreadRule,
  preferStringReplaceAllRule,
  preferStringSliceOverSubstringRule,
  preferStringSliceRule,
  preferStringStartsEndsWithRule,
  preferTemplateRule,
  preferTernaryOperatorRule,
  preserveCaughtErrorRule,
  requireAwaitRule,
  requireReturnTypeRule,
  requireYieldRule,
  restrictTemplateExpressionsRule,
  sortKeysRule,
  useIsnanRule,
  validTypeofRule,
} from './patterns/index.js'
// Performance rules (core interface)
import {
  noAwaitInLoopRule,
  noSyncInAsyncRule,
  preferMathTruncRule,
  preferObjectSpreadRule,
  preferOptionalChainRule,
} from './performance/index.js'
// Security rules
import {
  noDeprecatedApiRule,
  noDynamicDeleteRule,
  noEvalRule,
  noUnsafeCallRule,
  noUnsafeMemberAccessRule,
  noUnsafeRegexRule,
  noUnsafeReturnRule,
  noUnsafeTypeAssertionRule,
} from './security/index.js'
// Testing rules
import { noFocusedTestsRule, noSkippedTestsRule } from './testing/index.js'

const adaptedPreferObjectSpread = adaptPluginRule(preferObjectSpreadRule, 'prefer-object-spread')
const adaptedPreferOptionalChain = adaptPluginRule(preferOptionalChainRule, 'prefer-optional-chain')
const adaptedPreferMathTrunc = adaptPluginRule(preferMathTruncRule, 'prefer-math-trunc')
const adaptedNoCircularDeps = adaptPluginRule(noCircularDepsRule, 'no-circular-deps')
const adaptedNoUnusedExports = adaptPluginRule(noUnusedExportsRule, 'no-unused-exports')
const adaptedConsistentImports = adaptPluginRule(consistentImportsRule, 'consistent-imports')
const adaptedNoBarrelImports = adaptPluginRule(noBarrelImportsRule, 'no-barrel-imports')
const adaptedNoDeprecatedApi = adaptPluginRule(noDeprecatedApiRule, 'no-deprecated-api')
const adaptedNoEval = adaptPluginRule(noEvalRule, 'no-eval')
const adaptedNoUnsafeTypeAssertion = adaptPluginRule(
  noUnsafeTypeAssertionRule,
  'no-unsafe-type-assertion',
)
const adaptedNoUnsafeReturn = adaptPluginRule(noUnsafeReturnRule, 'no-unsafe-return')
const adaptedNoDynamicDelete = adaptPluginRule(noDynamicDeleteRule, 'no-dynamic-delete')
const adaptedNoThrowLiteral = adaptPluginRule(noThrowLiteralRule, 'no-throw-literal')
const adaptedNoConstantBinaryExpression = adaptPluginRule(
  noConstantBinaryExpressionRule,
  'no-constant-binary-expression',
)
const adaptedMaxFileSize = adaptPluginRule(maxFileSizeRule, 'max-file-size')
const adaptedMaxUnionSize = adaptPluginRule(maxUnionSizeRule, 'max-union-size')
const adaptedNoDuplicateCode = adaptPluginRule(noDuplicateCodeRule, 'no-duplicate-code')
const adaptedNoDuplicateElseIf = adaptPluginRule(noDuplicateElseIfRule, 'no-duplicate-else-if')
const adaptedPreferConst = adaptPluginRule(preferConstRule, 'prefer-const')
const adaptedPreferNullishCoalescing = adaptPluginRule(
  preferNullishCoalescingRule,
  'prefer-nullish-coalescing',
)
const adaptedNoConsoleLog = adaptPluginRule(noConsoleLogRule, 'no-console-log')
const adaptedNoThrowSync = adaptPluginRule(noThrowSyncRule, 'no-throw-sync')
const adaptedPreferReadonly = adaptPluginRule(preferReadonlyRule, 'prefer-readonly')
const adaptedPreferReadonlyParameter = adaptPluginRule(
  preferReadonlyParameterRule,
  'prefer-readonly-parameter',
)
const adaptedRequireReturnType = adaptPluginRule(requireReturnTypeRule, 'require-return-type')
const adaptedNoExplicitAny = adaptPluginRule(noExplicitAnyRule, 'no-explicit-any')
const adaptedNoFloatingPromises = adaptPluginRule(noFloatingPromisesRule, 'no-floating-promises')
const adaptedNoReturnAwait = adaptPluginRule(noReturnAwaitRule, 'no-return-await')
const adaptedNoVarRequires = adaptPluginRule(noVarRequiresRule, 'no-var-requires')
const adaptedPreferAsyncAwait = adaptPluginRule(preferAsyncAwaitRule, 'prefer-async-await')
const adaptedPreferIncludes = adaptPluginRule(preferIncludesRule, 'prefer-includes')
const adaptedPreferLiteralEnumMember = adaptPluginRule(
  preferLiteralEnumMemberRule,
  'prefer-literal-enum-member',
)
const adaptedNoInferrableTypes = adaptPluginRule(noInferrableTypesRule, 'no-inferrable-types')
const adaptedConsistentTypeExports = adaptPluginRule(
  consistentTypeExportsRule,
  'consistent-type-exports',
)
const adaptedNoUnnecessaryCondition = adaptPluginRule(
  noUnnecessaryConditionRule,
  'no-unnecessary-condition',
)
const adaptedNoUnnecessaryEscapeInRegexp = adaptPluginRule(
  noUnnecessaryEscapeInRegexpRule,
  'no-unnecessary-escape-in-regexp',
)
const adaptedNoUnnecessaryQualifier = adaptPluginRule(
  noUnnecessaryQualifierRule,
  'no-unnecessary-qualifier',
)
const adaptedPreferRegexLiterals = adaptPluginRule(preferRegexLiteralsRule, 'prefer-regex-literals')
const adaptedPreferRegexpExec = adaptPluginRule(preferRegexpExecRule, 'prefer-regexp-exec')
const adaptedPreferRestParams = adaptPluginRule(preferRestParamsRule, 'prefer-rest-params')
const adaptedPreferSpread = adaptPluginRule(preferSpreadRule, 'prefer-spread')
const adaptedPreferStringReplaceAll = adaptPluginRule(
  preferStringReplaceAllRule,
  'prefer-string-replace-all',
)
const adaptedPreferStringSliceOverSubstring = adaptPluginRule(
  preferStringSliceOverSubstringRule,
  'prefer-string-slice-over-substring',
)
const adaptedPreferStringSlice = adaptPluginRule(preferStringSliceRule, 'prefer-string-slice')
const adaptedPreferTemplate = adaptPluginRule(preferTemplateRule, 'prefer-template')
const adaptedRequireAwait = adaptPluginRule(requireAwaitRule, 'require-await')
const adaptedRestrictTemplateExpressions = adaptPluginRule(
  restrictTemplateExpressionsRule,
  'restrict-template-expressions',
)
const adaptedNoImplicitCoercion = adaptPluginRule(noImplicitCoercionRule, 'no-implicit-coercion')
const adaptedNoImpliedEval = adaptPluginRule(noImpliedEvalRule, 'no-implied-eval')
const adaptedNoMisusedPromises = adaptPluginRule(noMisusedPromisesRule, 'no-misused-promises')
const adaptedNoLonelyIf = adaptPluginRule(noLonelyIfRule, 'no-lonely-if')
const adaptedNoLossOfPrecision = adaptPluginRule(noLossOfPrecisionRule, 'no-loss-of-precision')
const adaptedNoMultiSpaces = adaptPluginRule(noMultiSpacesRule, 'no-multi-spaces')
const adaptedCurly = adaptPluginRule(curlyRule, 'curly')
const adaptedEqEqEq = adaptPluginRule(eqEqEqRule, 'eq-eq-eq')
const adaptedExplicitModuleBoundaryTypes = adaptPluginRule(
  explicitModuleBoundaryTypesRule,
  'explicit-module-boundary-types',
)
const adaptedNoArrayConstructor = adaptPluginRule(noArrayConstructorRule, 'no-array-constructor')
const adaptedNoAsyncPromiseExecutor = adaptPluginRule(
  noAsyncPromiseExecutorRule,
  'no-async-promise-executor',
)
const adaptedNoCompareNegZero = adaptPluginRule(noCompareNegZeroRule, 'no-compare-neg-zero')
const adaptedNoConfusingVoidExpression = adaptPluginRule(
  noConfusingVoidExpressionRule,
  'no-confusing-void-expression',
)
const adaptedNoConstantCondition = adaptPluginRule(noConstantConditionRule, 'no-constant-condition')
const adaptedNoConstAssign = adaptPluginRule(noConstAssignRule, 'no-const-assign')
const adaptedNoDuplicateImports = adaptPluginRule(noDuplicateImportsRule, 'no-duplicate-imports')
const adaptedNoElseReturn = adaptPluginRule(noElseReturnRule, 'no-else-return')
const adaptedNoEmpty = adaptPluginRule(noEmptyRule, 'no-empty')
const adaptedNoNestedTernary = adaptPluginRule(noNestedTernaryRule, 'no-nested-ternary')
const adaptedNoNonNullAssertion = adaptPluginRule(noNonNullAssertionRule, 'no-non-null-assertion')
const adaptedNoObjectConstructor = adaptPluginRule(noObjectConstructorRule, 'no-object-constructor')
const adaptedNoParamReassign = adaptPluginRule(noParamReassignRule, 'no-param-reassign')
const adaptedNoPromiseAsBoolean = adaptPluginRule(noPromiseAsBooleanRule, 'no-promise-as-boolean')
const adaptedNoShadow = adaptPluginRule(noShadowRule, 'no-shadow')
const adaptedNoStringConcat = adaptPluginRule(noStringConcatRule, 'no-string-concat')
const adaptedNoUnnecessaryTemplateExpression = adaptPluginRule(
  noUnnecessaryTemplateExpressionRule,
  'no-unnecessary-template-expression',
)
const adaptedNoUnusedVars = adaptPluginRule(noUnusedVarsRule, 'no-unused-vars')
const adaptedNoUnusedPrivateMembers = adaptPluginRule(
  noUnusedPrivateMembersRule,
  'no-unused-private-members',
)
const adaptedNoVoid = adaptPluginRule(noVoidRule, 'no-void')
const adaptedPreferExponentiationOperator = adaptPluginRule(
  preferExponentiationOperatorRule,
  'prefer-exponentiation-operator',
)
const adaptedPreferNumberProperties = adaptPluginRule(
  preferNumberPropertiesRule,
  'prefer-number-properties',
)
const adaptedPreferNumericLiterals = adaptPluginRule(
  preferNumericLiteralsRule,
  'prefer-numeric-literals',
)
const adaptedPreferObjectHasOwn = adaptPluginRule(preferObjectHasOwnRule, 'prefer-object-has-own')

const adaptedNoUnsafeDeclarationMerging = adaptPluginRule(
  noUnsafeDeclarationMergingRule,
  'no-unsafe-declaration-merging',
)

const adaptedNoTypeOnlyReturn = adaptPluginRule(noTypeOnlyReturnRule, 'no-type-only-return')

const adaptedPreferDateNow = adaptPluginRule(preferDateNowRule, 'prefer-date-now')

// Orphan rules - previously defined but not registered
const adaptedNoArrayDestructuring = adaptPluginRule(
  noArrayDestructuringRule,
  'no-array-destructuring',
)
const adaptedNoAsyncWithoutAwait = adaptPluginRule(
  noAsyncWithoutAwaitRule,
  'no-async-without-await',
)
const adaptedNoSameSideConditions = adaptPluginRule(
  noSameSideConditionsRule,
  'no-same-side-conditions',
)
const adaptedNoSimplifiablePattern = adaptPluginRule(
  noSimplifiablePatternRule,
  'no-simplifiable-pattern',
)
const adaptedNoUnnecessarySlice = adaptPluginRule(noUnnecessarySliceRule, 'no-unnecessary-slice')
const adaptedNoUnnecessaryStringConcat = adaptPluginRule(
  noUnnecessaryStringConcatRule,
  'no-unnecessary-string-concat',
)
const adaptedNoUnnecessaryTypeArguments = adaptPluginRule(
  noUnnecessaryTypeArgumentsRule,
  'no-unnecessary-type-arguments',
)
const adaptedNoUnsafeAssignment = adaptPluginRule(noUnsafeAssignmentRule, 'no-unsafe-assignment')
const adaptedNoUselessFallbackInSpread = adaptPluginRule(
  noUselessFallbackInSpreadRule,
  'no-useless-fallback-in-spread',
)
const adaptedPreferArrayFlat = adaptPluginRule(preferArrayFlatRule, 'prefer-array-flat')
const adaptedPreferAtContext = adaptPluginRule(preferAtContextRule, 'prefer-at-context')
const adaptedPreferAtMethod = adaptPluginRule(preferAtMethodRule, 'prefer-at-method')
const adaptedPreferEnumInitializers = adaptPluginRule(
  preferEnumInitializersRule,
  'prefer-enum-initializers',
)
const adaptedPreferFunctionType = adaptPluginRule(preferFunctionTypeRule, 'prefer-function-type')
const adaptedPreferPrototypeMethods = adaptPluginRule(
  preferPrototypeMethodsRule,
  'prefer-prototype-methods',
)
const adaptedPreferStringStartsEndsWith = adaptPluginRule(
  preferStringStartsEndsWithRule,
  'prefer-string-starts-ends-with',
)
const adaptedPreferTernaryOperator = adaptPluginRule(
  preferTernaryOperatorRule,
  'prefer-ternary-operator',
)

const adaptedNoConsole = adaptPluginRule(noConsoleRule, 'no-console')
const adaptedNoUnsafeRegex = adaptPluginRule(noUnsafeRegexRule, 'no-unsafe-regex')
const adaptedNoSkippedTests = adaptPluginRule(noSkippedTestsRule, 'no-skipped-tests')
const adaptedNoFocusedTests = adaptPluginRule(noFocusedTestsRule, 'no-focused-tests')
const adaptedNoEmptyCatch = adaptPluginRule(noEmptyCatchRule, 'no-empty-catch')
const adaptedNoUselessCatch = adaptPluginRule(noUselessCatchRule, 'no-useless-catch')
const adaptedNoEmptyFunction = adaptPluginRule(noEmptyFunctionRule, 'no-empty-function')
const adaptedNoDebugger = adaptPluginRule(noDebuggerRule, 'no-debugger')
const adaptedNoDeleteVar = adaptPluginRule(noDeleteVarRule, 'no-delete-var')
const adaptedPreferPromiseRejectErrors = adaptPluginRule(
  preferPromiseRejectErrorsRule,
  'prefer-promise-reject-errors',
)

const adaptedNoAlert = adaptPluginRule(noAlertRule, 'no-alert')
const adaptedNoUselessConstructor = adaptPluginRule(
  noUselessConstructorRule,
  'no-useless-constructor',
)
const adaptedNoUnsafeCall = adaptPluginRule(noUnsafeCallRule, 'no-unsafe-call')
const adaptedNoUnsafeMemberAccess = adaptPluginRule(
  noUnsafeMemberAccessRule,
  'no-unsafe-member-access',
)
const adaptedNoUnfinishedTodos = adaptPluginRule(noUnfinishedTodosRule, 'no-unfinished-todos')

// Orphan rule adapters (plugin-type: patterns + correctness)
const adaptedConstructorSuper = adaptPluginRule(constructorSuperRule, 'constructor-super')
const adaptedDefaultCase = adaptPluginRule(defaultCaseRule, 'default-case')
const adaptedForDirection = adaptPluginRule(forDirectionRule, 'for-direction')
const adaptedGetterReturn = adaptPluginRule(getterReturnRule, 'getter-return')
const adaptedNoBitwise = adaptPluginRule(noBitwiseRule, 'no-bitwise')
const adaptedNoCaller = adaptPluginRule(noCallerRule, 'no-caller')
const adaptedNoCaseDeclarations = adaptPluginRule(noCaseDeclarationsRule, 'no-case-declarations')
const adaptedNoClassAssign = adaptPluginRule(noClassAssignRule, 'no-class-assign')
const adaptedNoCondAssign = adaptPluginRule(noCondAssignRule, 'no-cond-assign')
const adaptedNoConstructorReturn = adaptPluginRule(noConstructorReturnRule, 'no-constructor-return')
const adaptedNoControlRegex = adaptPluginRule(noControlRegexRule, 'no-control-regex')
const adaptedNoDivRegex = adaptPluginRule(noDivRegexRule, 'no-div-regex')
const adaptedNoDupeArgs = adaptPluginRule(noDupeArgsRule, 'no-dupe-args')
const adaptedNoDupeClassMembers = adaptPluginRule(noDupeClassMembersRule, 'no-dupe-class-members')
const adaptedNoDupeKeys = adaptPluginRule(noDupeKeysRule, 'no-dupe-keys')
const adaptedNoDuplicateCase = adaptPluginRule(noDuplicateCaseRule, 'no-duplicate-case')
const adaptedNoEmptyPattern = adaptPluginRule(noEmptyPatternRule, 'no-empty-pattern')
const adaptedNoEmptyStaticBlock = adaptPluginRule(noEmptyStaticBlockRule, 'no-empty-static-block')
const adaptedNoExAssign = adaptPluginRule(noExAssignRule, 'no-ex-assign')
const adaptedNoExtendNative = adaptPluginRule(noExtendNativeRule, 'no-extend-native')
const adaptedNoExtraBooleanCast = adaptPluginRule(noExtraBooleanCastRule, 'no-extra-boolean-cast')
const adaptedNoFallthrough = adaptPluginRule(noFallthroughRule, 'no-fallthrough')
const adaptedNoFuncAssign = adaptPluginRule(noFuncAssignRule, 'no-func-assign')
const adaptedNoGlobalAssign = adaptPluginRule(noGlobalAssignRule, 'no-global-assign')
const adaptedNoImportAssign = adaptPluginRule(noImportAssignRule, 'no-import-assign')
const adaptedNoInvalidRegexp = adaptPluginRule(noInvalidRegexpRule, 'no-invalid-regexp')
const adaptedNoIrregularWhitespace = adaptPluginRule(
  noIrregularWhitespaceRule,
  'no-irregular-whitespace',
)
const adaptedNoIterator = adaptPluginRule(noIteratorRule, 'no-iterator')
const adaptedNoLoopFunc = adaptPluginRule(noLoopFuncRule, 'no-loop-func')
const adaptedNoMisleadingCharacterClass = adaptPluginRule(
  noMisleadingCharacterClassRule,
  'no-misleading-character-class',
)
const adaptedNoNewFunc = adaptPluginRule(noNewFuncRule, 'no-new-func')
const adaptedNoNewNativeNonconstructor = adaptPluginRule(
  noNewNativeNonconstructorRule,
  'no-new-native-nonconstructor',
)
const adaptedNoNewWrappers = adaptPluginRule(noNewWrappersRule, 'no-new-wrappers')
const adaptedNoNonoctalDecimalEscape = adaptPluginRule(
  noNonoctalDecimalEscapeRule,
  'no-nonoctal-decimal-escape',
)
const adaptedNoObjCalls = adaptPluginRule(noObjCallsRule, 'no-obj-calls')
const adaptedNoOctal = adaptPluginRule(noOctalRule, 'no-octal')
const adaptedNoPrototypeBuiltins = adaptPluginRule(noPrototypeBuiltinsRule, 'no-prototype-builtins')
const adaptedNoRedeclare = adaptPluginRule(noRedeclareRule, 'no-redeclare')
const adaptedNoRegexSpaces = adaptPluginRule(noRegexSpacesRule, 'no-regex-spaces')
const adaptedNoReturnAssign = adaptPluginRule(noReturnAssignRule, 'no-return-assign')
const adaptedNoReturnOrAwait = adaptPluginRule(noReturnOrAwaitRule, 'no-return-or-await')
const adaptedNoSelfAssign = adaptPluginRule(noSelfAssignRule, 'no-self-assign')
const adaptedNoSequences = adaptPluginRule(noSequencesRule, 'no-sequences')
const adaptedNoSetterReturn = adaptPluginRule(noSetterReturnRule, 'no-setter-return')
const adaptedNoShadowRestrictedNames = adaptPluginRule(
  noShadowRestrictedNamesRule,
  'no-shadow-restricted-names',
)
const adaptedNoSparseArrays = adaptPluginRule(noSparseArraysRule, 'no-sparse-arrays')
const adaptedNoThenable = adaptPluginRule(noThenableRule, 'no-thenable')
const adaptedNoThisBeforeSuper = adaptPluginRule(noThisBeforeSuperRule, 'no-this-before-super')
const adaptedNoUnassignedVars = adaptPluginRule(noUnassignedVarsRule, 'no-unassigned-vars')
const adaptedNoUndef = adaptPluginRule(noUndefRule, 'no-undef')
const adaptedNoUnexpectedMultiline = adaptPluginRule(
  noUnexpectedMultilineRule,
  'no-unexpected-multiline',
)
const adaptedNoUnneededTernary = adaptPluginRule(noUnneededTernaryRule, 'no-unneeded-ternary')
const adaptedNoUnreachable = adaptPluginRule(noUnreachableRule, 'no-unreachable')
const adaptedNoUnsafeFinally = adaptPluginRule(noUnsafeFinallyRule, 'no-unsafe-finally')
const adaptedNoUnsafeNegation = adaptPluginRule(noUnsafeNegationRule, 'no-unsafe-negation')
const adaptedNoUnsafeOptionalChaining = adaptPluginRule(
  noUnsafeOptionalChainingRule,
  'no-unsafe-optional-chaining',
)
const adaptedNoUnusedExpressions = adaptPluginRule(noUnusedExpressionsRule, 'no-unused-expressions')
const adaptedNoUnusedLabels = adaptPluginRule(noUnusedLabelsRule, 'no-unused-labels')
const adaptedNoUselessAssignment = adaptPluginRule(noUselessAssignmentRule, 'no-useless-assignment')
const adaptedNoUselessBackreference = adaptPluginRule(
  noUselessBackreferenceRule,
  'no-useless-backreference',
)
const adaptedNoUselessConcat = adaptPluginRule(noUselessConcatRule, 'no-useless-concat')
const adaptedNoUselessEscape = adaptPluginRule(noUselessEscapeRule, 'no-useless-escape')
const adaptedNoVar = adaptPluginRule(noVarRule, 'no-var')
const adaptedNoWith = adaptPluginRule(noWithRule, 'no-with')
const adaptedObjectShorthand = adaptPluginRule(objectShorthandRule, 'object-shorthand')
const adaptedPreserveCaughtError = adaptPluginRule(preserveCaughtErrorRule, 'preserve-caught-error')
const adaptedRequireYield = adaptPluginRule(requireYieldRule, 'require-yield')
const adaptedSortKeys = adaptPluginRule(sortKeysRule, 'sort-keys')
const adaptedUseIsnan = adaptPluginRule(useIsnanRule, 'use-isnan')
const adaptedValidTypeof = adaptPluginRule(validTypeofRule, 'valid-typeof')
const adaptedNoEmptyCharacterClass = adaptPluginRule(
  noEmptyCharacterClassRule,
  'no-empty-character-class',
)

export const allRules: Record<string, RuleDefinition> = {
  'consistent-imports': adaptedConsistentImports,
  // Patterns
  'consistent-type-exports': adaptedConsistentTypeExports,
  // Orphan pattern rules
  'constructor-super': adaptedConstructorSuper,
  curly: adaptedCurly,
  'default-case': adaptedDefaultCase,
  // Patterns
  'eq-eq-eq': adaptedEqEqEq,
  'explicit-module-boundary-types': adaptedExplicitModuleBoundaryTypes,
  // Orphan rules - best practices (native)
  'explicit-return-type': explicitReturnTypeRule,
  'for-direction': adaptedForDirection,
  'getter-return': adaptedGetterReturn,
  // Complexity
  'max-complexity': maxComplexityRule,
  'max-depth': maxDepthRule,
  'max-file-size': adaptedMaxFileSize,
  'max-lines': maxLinesRule,
  'max-lines-per-function': maxLinesPerFunctionRule,
  'max-params': maxParamsRule,
  'max-union-size': adaptedMaxUnionSize,
  'no-alert': adaptedNoAlert,
  'no-array-constructor': adaptedNoArrayConstructor,
  // Orphan rules - previously defined but not registered
  'no-array-destructuring': adaptedNoArrayDestructuring,
  'no-async-promise-executor': adaptedNoAsyncPromiseExecutor,
  'no-async-without-await': adaptedNoAsyncWithoutAwait,
  // Performance
  'no-await-in-loop': noAwaitInLoopRule,
  'no-barrel-imports': adaptedNoBarrelImports,
  'no-bitwise': adaptedNoBitwise,
  'no-caller': adaptedNoCaller,
  'no-case-declarations': adaptedNoCaseDeclarations,
  // Dependencies
  'no-circular-deps': adaptedNoCircularDeps,
  'no-class-assign': adaptedNoClassAssign,
  'no-compare-neg-zero': adaptedNoCompareNegZero,
  'no-cond-assign': adaptedNoCondAssign,
  'no-confusing-void-expression': adaptedNoConfusingVoidExpression,
  'no-console': adaptedNoConsole,
  'no-console-log': adaptedNoConsoleLog,
  'no-const-assign': adaptedNoConstAssign,
  'no-constant-binary-expression': adaptedNoConstantBinaryExpression,
  'no-constant-condition': adaptedNoConstantCondition,
  'no-constructor-return': adaptedNoConstructorReturn,
  'no-control-regex': adaptedNoControlRegex,
  'no-debugger': adaptedNoDebugger,
  'no-delete-var': adaptedNoDeleteVar,
  // Security
  'no-deprecated-api': adaptedNoDeprecatedApi,
  'no-div-regex': adaptedNoDivRegex,
  'no-dupe-args': adaptedNoDupeArgs,
  'no-dupe-class-members': adaptedNoDupeClassMembers,
  'no-dupe-keys': adaptedNoDupeKeys,
  'no-duplicate-case': adaptedNoDuplicateCase,
  'no-duplicate-code': adaptedNoDuplicateCode,
  'no-duplicate-else-if': adaptedNoDuplicateElseIf,
  'no-duplicate-imports': adaptedNoDuplicateImports,
  'no-dynamic-delete': adaptedNoDynamicDelete,
  'no-else-return': adaptedNoElseReturn,
  'no-empty': adaptedNoEmpty,
  'no-empty-catch': adaptedNoEmptyCatch,
  'no-empty-character-class': adaptedNoEmptyCharacterClass,
  'no-empty-function': adaptedNoEmptyFunction,
  'no-empty-pattern': adaptedNoEmptyPattern,
  'no-empty-static-block': adaptedNoEmptyStaticBlock,
  'no-eval': adaptedNoEval,
  'no-ex-assign': adaptedNoExAssign,
  'no-explicit-any': adaptedNoExplicitAny,
  'no-extend-native': adaptedNoExtendNative,
  'no-extra-boolean-cast': adaptedNoExtraBooleanCast,
  'no-fallthrough': adaptedNoFallthrough,
  'no-floating-promises': adaptedNoFloatingPromises,
  'no-focused-tests': adaptedNoFocusedTests,
  'no-func-assign': adaptedNoFuncAssign,
  'no-global-assign': adaptedNoGlobalAssign,
  'no-implicit-coercion': adaptedNoImplicitCoercion,
  'no-implied-eval': adaptedNoImpliedEval,
  'no-import-assign': adaptedNoImportAssign,
  'no-inferrable-types': adaptedNoInferrableTypes,
  'no-invalid-regexp': adaptedNoInvalidRegexp,
  'no-irregular-whitespace': adaptedNoIrregularWhitespace,
  'no-iterator': adaptedNoIterator,
  'no-lonely-if': adaptedNoLonelyIf,
  'no-loop-func': adaptedNoLoopFunc,
  'no-loss-of-precision': adaptedNoLossOfPrecision,
  // Best practices
  'no-magic-numbers': noMagicNumbersRule,
  'no-misleading-character-class': adaptedNoMisleadingCharacterClass,
  'no-misused-promises': adaptedNoMisusedPromises,
  'no-multi-spaces': adaptedNoMultiSpaces,
  'no-nested-ternary': adaptedNoNestedTernary,
  'no-new-func': adaptedNoNewFunc,
  'no-new-native-nonconstructor': adaptedNoNewNativeNonconstructor,
  'no-new-wrappers': adaptedNoNewWrappers,
  'no-non-null-assertion': adaptedNoNonNullAssertion,
  'no-nonoctal-decimal-escape': adaptedNoNonoctalDecimalEscape,
  'no-obj-calls': adaptedNoObjCalls,
  'no-object-constructor': adaptedNoObjectConstructor,
  'no-octal': adaptedNoOctal,
  'no-param-reassign': adaptedNoParamReassign,
  'no-promise-as-boolean': adaptedNoPromiseAsBoolean,
  'no-prototype-builtins': adaptedNoPrototypeBuiltins,
  'no-redeclare': adaptedNoRedeclare,
  'no-regex-spaces': adaptedNoRegexSpaces,
  'no-return-assign': adaptedNoReturnAssign,
  'no-return-await': adaptedNoReturnAwait,
  'no-return-or-await': adaptedNoReturnOrAwait,
  'no-same-side-conditions': adaptedNoSameSideConditions,
  'no-self-assign': adaptedNoSelfAssign,
  'no-sequences': adaptedNoSequences,
  'no-setter-return': adaptedNoSetterReturn,
  'no-shadow': adaptedNoShadow,
  'no-shadow-restricted-names': adaptedNoShadowRestrictedNames,
  'no-simplifiable-pattern': adaptedNoSimplifiablePattern,
  'no-skipped-tests': adaptedNoSkippedTests,
  'no-sparse-arrays': adaptedNoSparseArrays,
  'no-string-concat': adaptedNoStringConcat,
  'no-sync-in-async': noSyncInAsyncRule,
  'no-thenable': adaptedNoThenable,
  'no-this-before-super': adaptedNoThisBeforeSuper,
  'no-throw-literal': adaptedNoThrowLiteral,
  'no-throw-sync': adaptedNoThrowSync,
  'no-type-only-return': adaptedNoTypeOnlyReturn,
  'no-unassigned-vars': adaptedNoUnassignedVars,
  'no-undef': adaptedNoUndef,
  'no-unexpected-multiline': adaptedNoUnexpectedMultiline,
  'no-unfinished-todos': adaptedNoUnfinishedTodos,
  'no-unnecessary-condition': adaptedNoUnnecessaryCondition,
  'no-unnecessary-escape-in-regexp': adaptedNoUnnecessaryEscapeInRegexp,
  'no-unnecessary-qualifier': adaptedNoUnnecessaryQualifier,
  'no-unnecessary-slice': adaptedNoUnnecessarySlice,
  'no-unnecessary-string-concat': adaptedNoUnnecessaryStringConcat,
  'no-unnecessary-template-expression': adaptedNoUnnecessaryTemplateExpression,
  'no-unnecessary-type-arguments': adaptedNoUnnecessaryTypeArguments,
  'no-unnecessary-type-assertion': noUnnecessaryTypeAssertionRule,
  'no-unneeded-ternary': adaptedNoUnneededTernary,
  'no-unreachable': adaptedNoUnreachable,
  'no-unsafe-assignment': adaptedNoUnsafeAssignment,
  'no-unsafe-call': adaptedNoUnsafeCall,
  'no-unsafe-declaration-merging': adaptedNoUnsafeDeclarationMerging,
  'no-unsafe-finally': adaptedNoUnsafeFinally,
  'no-unsafe-member-access': adaptedNoUnsafeMemberAccess,
  'no-unsafe-negation': adaptedNoUnsafeNegation,
  'no-unsafe-optional-chaining': adaptedNoUnsafeOptionalChaining,
  'no-unsafe-regex': adaptedNoUnsafeRegex,
  'no-unsafe-return': adaptedNoUnsafeReturn,
  'no-unsafe-type-assertion': adaptedNoUnsafeTypeAssertion,
  'no-unused-exports': adaptedNoUnusedExports,
  'no-unused-expressions': adaptedNoUnusedExpressions,
  'no-unused-labels': adaptedNoUnusedLabels,
  'no-unused-private-members': adaptedNoUnusedPrivateMembers,
  'no-unused-vars': adaptedNoUnusedVars,
  'no-useless-assignment': adaptedNoUselessAssignment,
  'no-useless-backreference': adaptedNoUselessBackreference,
  'no-useless-catch': adaptedNoUselessCatch,
  'no-useless-comparison': noUselessComparisonRule,
  'no-useless-concat': adaptedNoUselessConcat,
  'no-useless-constructor': adaptedNoUselessConstructor,
  'no-useless-escape': adaptedNoUselessEscape,
  'no-useless-fallback-in-spread': adaptedNoUselessFallbackInSpread,
  'no-var': adaptedNoVar,
  'no-var-requires': adaptedNoVarRequires,
  'no-void': adaptedNoVoid,
  'no-with': adaptedNoWith,
  'object-shorthand': adaptedObjectShorthand,
  'prefer-array-find': preferArrayFindRule,
  'prefer-array-flat': adaptedPreferArrayFlat,
  'prefer-array-some': preferArraySomeRule,
  'prefer-arrow-callback': preferArrowCallbackRule,
  'prefer-async-await': adaptedPreferAsyncAwait,
  'prefer-at-context': adaptedPreferAtContext,
  'prefer-at-method': adaptedPreferAtMethod,
  'prefer-const': adaptedPreferConst,
  'prefer-const-assertions': preferConstAssertionsRule,
  'prefer-date-now': adaptedPreferDateNow,
  'prefer-default-export': preferDefaultExportRule,
  'prefer-enum-initializers': adaptedPreferEnumInitializers,
  'prefer-exponent-operator': preferExponentOperatorRule,
  'prefer-exponentiation-operator': adaptedPreferExponentiationOperator,
  'prefer-flat-map': preferFlatMapRule,
  'prefer-for-of': preferForOfRule,
  'prefer-function-type': adaptedPreferFunctionType,
  'prefer-includes': adaptedPreferIncludes,
  'prefer-literal-enum-member': adaptedPreferLiteralEnumMember,
  'prefer-math-trunc': adaptedPreferMathTrunc,
  'prefer-nullish-coalescing': adaptedPreferNullishCoalescing,
  'prefer-number-properties': adaptedPreferNumberProperties,
  'prefer-numeric-literals': adaptedPreferNumericLiterals,
  'prefer-object-has-own': adaptedPreferObjectHasOwn,
  'prefer-object-spread': adaptedPreferObjectSpread,
  'prefer-optional-chain': adaptedPreferOptionalChain,
  'prefer-promise-reject-errors': adaptedPreferPromiseRejectErrors,
  'prefer-prototype-methods': adaptedPreferPrototypeMethods,
  'prefer-readonly': adaptedPreferReadonly,
  'prefer-readonly-parameter': adaptedPreferReadonlyParameter,
  'prefer-regex-literal': preferRegexLiteralRule,
  'prefer-regex-literals': adaptedPreferRegexLiterals,
  'prefer-regexp-exec': adaptedPreferRegexpExec,
  'prefer-rest-params': adaptedPreferRestParams,
  'prefer-spread': adaptedPreferSpread,
  'prefer-string-replace-all': adaptedPreferStringReplaceAll,
  'prefer-string-slice': adaptedPreferStringSlice,
  'prefer-string-slice-over-substring': adaptedPreferStringSliceOverSubstring,
  'prefer-string-start-end': preferStringStartEndRule,
  'prefer-string-starts-ends-with': adaptedPreferStringStartsEndsWith,
  'prefer-string-template': preferStringTemplateRule,
  'prefer-template': adaptedPreferTemplate,
  'prefer-ternary-operator': adaptedPreferTernaryOperator,
  'preserve-caught-error': adaptedPreserveCaughtError,
  'require-await': adaptedRequireAwait,
  'require-return-type': adaptedRequireReturnType,
  'require-yield': adaptedRequireYield,
  'restrict-template-expressions': adaptedRestrictTemplateExpressions,
  'sort-keys': adaptedSortKeys,
  'strict-boolean-expressions': strictBooleanExpressionsRule,
  'use-isnan': adaptedUseIsnan,
  'valid-typeof': adaptedValidTypeof,
}

export type RuleCategory =
  | 'complexity'
  | 'correctness'
  | 'dependencies'
  | 'patterns'
  | 'performance'
  | 'security'
  | 'testing'
export function getRule(ruleId: string): RuleDefinition | undefined {
  return allRules[ruleId]
}

export function getRuleIds(): string[] {
  return Object.keys(allRules)
}

// Rule ID to category mapping
const RULE_CATEGORIES: Record<string, RuleCategory> = {
  'consistent-imports': 'dependencies',
  // Patterns
  'consistent-type-exports': 'patterns',
  'constructor-super': 'patterns',
  curly: 'patterns',
  'default-case': 'patterns',
  'eq-eq-eq': 'patterns',
  'explicit-module-boundary-types': 'patterns',
  // Orphan rules
  'explicit-return-type': 'patterns',
  'for-direction': 'patterns',
  'getter-return': 'patterns',
  // Complexity
  'max-complexity': 'complexity',
  'max-depth': 'complexity',
  'max-file-size': 'patterns',
  'max-lines': 'complexity',
  'max-lines-per-function': 'complexity',
  'max-params': 'complexity',
  'max-union-size': 'patterns',
  'no-alert': 'patterns',
  'no-array-constructor': 'patterns',
  'no-async-promise-executor': 'patterns',
  // Performance
  'no-await-in-loop': 'performance',
  'no-barrel-imports': 'dependencies',
  'no-bitwise': 'patterns',
  'no-caller': 'patterns',
  'no-case-declarations': 'patterns',
  // Dependencies
  'no-circular-deps': 'dependencies',
  'no-class-assign': 'patterns',
  'no-compare-neg-zero': 'patterns',
  'no-cond-assign': 'patterns',
  'no-confusing-void-expression': 'patterns',
  'no-console': 'patterns',
  'no-console-log': 'patterns',
  'no-const-assign': 'patterns',
  'no-constant-binary-expression': 'correctness',
  'no-constant-condition': 'patterns',
  'no-constructor-return': 'patterns',
  'no-control-regex': 'patterns',
  'no-debugger': 'patterns',
  'no-delete-var': 'patterns',
  // Security
  'no-deprecated-api': 'security',
  'no-div-regex': 'patterns',
  'no-dupe-args': 'patterns',
  'no-dupe-class-members': 'patterns',
  'no-dupe-keys': 'patterns',
  'no-duplicate-case': 'patterns',
  'no-duplicate-code': 'patterns',
  'no-duplicate-else-if': 'patterns',
  'no-duplicate-imports': 'patterns',
  'no-dynamic-delete': 'security',
  'no-else-return': 'patterns',
  'no-empty': 'patterns',
  'no-empty-catch': 'correctness',
  'no-empty-character-class': 'correctness',
  'no-empty-function': 'correctness',
  'no-empty-pattern': 'patterns',
  'no-empty-static-block': 'patterns',
  'no-eval': 'security',
  'no-ex-assign': 'patterns',
  'no-explicit-any': 'patterns',
  'no-extend-native': 'patterns',
  'no-extra-boolean-cast': 'patterns',
  'no-fallthrough': 'patterns',
  'no-floating-promises': 'patterns',
  'no-focused-tests': 'testing',
  'no-func-assign': 'patterns',
  'no-global-assign': 'patterns',
  'no-implicit-coercion': 'patterns',
  'no-implied-eval': 'patterns',
  'no-import-assign': 'patterns',
  'no-inferrable-types': 'patterns',
  'no-invalid-regexp': 'patterns',
  'no-irregular-whitespace': 'patterns',
  'no-iterator': 'patterns',
  'no-lonely-if': 'patterns',
  'no-loop-func': 'patterns',
  'no-loss-of-precision': 'patterns',
  'no-misleading-character-class': 'patterns',
  'no-misused-promises': 'patterns',
  'no-multi-spaces': 'patterns',
  'no-nested-ternary': 'patterns',
  'no-new-func': 'patterns',
  'no-new-native-nonconstructor': 'patterns',
  'no-new-wrappers': 'patterns',
  'no-non-null-assertion': 'patterns',
  'no-nonoctal-decimal-escape': 'patterns',
  'no-obj-calls': 'patterns',
  'no-object-constructor': 'patterns',
  'no-octal': 'patterns',
  'no-param-reassign': 'patterns',
  'no-promise-as-boolean': 'patterns',
  'no-prototype-builtins': 'patterns',
  'no-redeclare': 'patterns',
  'no-regex-spaces': 'patterns',
  'no-return-assign': 'patterns',
  'no-return-await': 'patterns',
  'no-return-or-await': 'patterns',
  'no-self-assign': 'patterns',
  'no-sequences': 'patterns',
  'no-setter-return': 'patterns',
  'no-shadow': 'patterns',
  'no-shadow-restricted-names': 'patterns',
  'no-skipped-tests': 'testing',
  'no-sparse-arrays': 'patterns',
  'no-string-concat': 'patterns',
  'no-sync-in-async': 'performance',
  'no-thenable': 'patterns',
  'no-this-before-super': 'patterns',
  'no-throw-literal': 'correctness',
  'no-throw-sync': 'patterns',
  'no-type-only-return': 'patterns',
  'no-unassigned-vars': 'patterns',
  'no-undef': 'patterns',
  'no-unexpected-multiline': 'patterns',
  'no-unfinished-todos': 'patterns',
  'no-unnecessary-condition': 'patterns',
  'no-unnecessary-escape-in-regexp': 'patterns',
  'no-unnecessary-qualifier': 'patterns',
  'no-unnecessary-template-expression': 'patterns',
  'no-unnecessary-type-assertion': 'patterns',
  'no-unneeded-ternary': 'patterns',
  'no-unreachable': 'patterns',
  'no-unsafe-call': 'security',
  'no-unsafe-declaration-merging': 'patterns',
  'no-unsafe-finally': 'patterns',
  'no-unsafe-member-access': 'security',
  'no-unsafe-negation': 'patterns',
  'no-unsafe-optional-chaining': 'patterns',
  'no-unsafe-regex': 'security',
  'no-unsafe-return': 'security',
  'no-unsafe-type-assertion': 'security',
  'no-unused-exports': 'dependencies',
  'no-unused-expressions': 'patterns',
  'no-unused-labels': 'patterns',
  'no-unused-private-members': 'patterns',
  'no-unused-vars': 'patterns',
  'no-useless-assignment': 'patterns',
  'no-useless-backreference': 'patterns',
  'no-useless-comparison': 'patterns',
  'no-useless-concat': 'patterns',
  'no-useless-constructor': 'patterns',
  'no-useless-escape': 'patterns',
  'no-var': 'patterns',
  'no-var-requires': 'patterns',
  'no-void': 'patterns',
  'no-with': 'patterns',
  'object-shorthand': 'patterns',
  'prefer-array-find': 'patterns',
  'prefer-array-some': 'patterns',
  'prefer-arrow-callback': 'patterns',
  'prefer-async-await': 'patterns',
  'prefer-const': 'patterns',
  // Best practices
  'prefer-const-assertions': 'patterns',
  'prefer-date-now': 'patterns',
  'prefer-default-export': 'patterns',
  'prefer-exponent-operator': 'patterns',
  'prefer-exponentiation-operator': 'patterns',
  'prefer-flat-map': 'patterns',
  'prefer-for-of': 'patterns',
  'prefer-includes': 'patterns',
  'prefer-literal-enum-member': 'patterns',
  'prefer-math-trunc': 'performance',
  'prefer-nullish-coalescing': 'patterns',
  'prefer-number-properties': 'patterns',
  'prefer-numeric-literals': 'patterns',
  'prefer-object-has-own': 'patterns',
  'prefer-object-spread': 'performance',
  'prefer-optional-chain': 'performance',
  'prefer-promise-reject-errors': 'patterns',
  'prefer-readonly': 'patterns',
  'prefer-readonly-parameter': 'patterns',
  'prefer-regex-literal': 'patterns',
  'prefer-regex-literals': 'patterns',
  'prefer-regexp-exec': 'patterns',
  'prefer-rest-params': 'patterns',
  'prefer-spread': 'patterns',
  'prefer-string-replace-all': 'patterns',
  'prefer-string-slice': 'patterns',
  'prefer-string-slice-over-substring': 'patterns',
  'prefer-string-start-end': 'patterns',
  'prefer-string-template': 'patterns',
  'prefer-template': 'patterns',
  'preserve-caught-error': 'patterns',
  'require-await': 'patterns',
  'require-return-type': 'patterns',
  'require-yield': 'patterns',
  'restrict-template-expressions': 'patterns',
  'sort-keys': 'patterns',
  'strict-boolean-expressions': 'patterns',
  'use-isnan': 'patterns',
  'valid-typeof': 'patterns',
}
export function getRuleCategory(ruleId: string): RuleCategory {
  return RULE_CATEGORIES[ruleId] ?? 'complexity'
}

// Re-exports
export {
  maxComplexityRule,
  maxDepthRule,
  maxLinesPerFunctionRule,
  maxLinesRule,
  maxParamsRule,
} from './complexity/index.js'
export {
  consistentImportsRule,
  noBarrelImportsRule,
  noCircularDepsRule,
  noUnusedExportsRule,
} from './dependencies/index.js'
export {
  consistentTypeExportsRule,
  curlyRule,
  eqEqEqRule,
  explicitModuleBoundaryTypesRule,
  maxFileSizeRule,
  maxUnionSizeRule,
  noArrayConstructorRule,
  noAsyncPromiseExecutorRule,
  noCompareNegZeroRule,
  noConfusingVoidExpressionRule,
  noConsoleLogRule,
  noConstantConditionRule,
  noConstAssignRule,
  noDuplicateCodeRule,
  noDuplicateElseIfRule,
  noDuplicateImportsRule,
  noElseReturnRule,
  noEmptyRule,
  noExplicitAnyRule,
  noFloatingPromisesRule,
  noImplicitCoercionRule,
  noImpliedEvalRule,
  noInferrableTypesRule,
  noLonelyIfRule,
  noLossOfPrecisionRule,
  noMisusedPromisesRule,
  noMultiSpacesRule,
  noNestedTernaryRule,
  noNonNullAssertionRule,
  noObjectConstructorRule,
  noParamReassignRule,
  noPromiseAsBooleanRule,
  noReturnAwaitRule,
  noShadowRule,
  noStringConcatRule,
  noThrowSyncRule,
  noUnnecessaryConditionRule,
  noUnnecessaryEscapeInRegexpRule,
  noUnnecessaryQualifierRule,
  noUnnecessaryTemplateExpressionRule,
  noUnsafeDeclarationMergingRule,
  noUnusedPrivateMembersRule,
  noUnusedVarsRule,
  noVarRequiresRule,
  noVoidRule,
  preferAsyncAwaitRule,
  preferConstRule,
  preferExponentiationOperatorRule,
  preferIncludesRule,
  preferLiteralEnumMemberRule,
  preferNullishCoalescingRule,
  preferNumberPropertiesRule,
  preferNumericLiteralsRule,
  preferObjectHasOwnRule,
  preferReadonlyRule,
  preferRegexLiteralsRule,
  preferRegexpExecRule,
  preferRestParamsRule,
  preferSpreadRule,
  preferStringReplaceAllRule,
  preferStringSliceOverSubstringRule,
  preferStringSliceRule,
  preferTemplateRule,
  requireAwaitRule,
  requireReturnTypeRule,
  restrictTemplateExpressionsRule,
} from './patterns/index.js'
export { noAwaitInLoopRule, noSyncInAsyncRule } from './performance/index.js'
export { preferObjectSpreadRule, preferOptionalChainRule } from './performance/index.js'
export {
  noDeprecatedApiRule,
  noDynamicDeleteRule,
  noEvalRule,
  noUnsafeReturnRule,
  noUnsafeTypeAssertionRule,
} from './security/index.js'
