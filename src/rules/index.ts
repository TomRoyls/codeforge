import type { RuleDefinition } from './types.js'

// Best practices rules
import {
  noConsoleRule,
  noMagicNumbersRule,
  preferConstAssertionsRule,
  noUnnecessaryTypeAssertionRule,
  strictBooleanExpressionsRule,
  explicitReturnTypeRule,
  preferArrayFindRule,
  preferArraySomeRule,
  preferArrowCallbackRule,
  preferDefaultExportRule,
  preferExponentOperatorRule,
  preferFlatMapRule,
  preferForOfRule,
  preferRegexLiteralRule,
  preferStringStartEndRule,
  preferStringTemplateRule,
} from './best-practices/index.js'

// Complexity rules
import {
  maxComplexityRule,
  maxDepthRule,
  maxLinesRule,
  maxLinesPerFunctionRule,
  maxParamsRule,
} from './complexity/index.js'

// Performance rules (core interface)
import { noAwaitInLoopRule, noSyncInAsyncRule, preferMathTruncRule } from './performance/index.js'

// Plugin-style rules (need adapter)
import { preferObjectSpreadRule, preferOptionalChainRule } from './performance/index.js'

// Dependencies rules
import {
  noCircularDepsRule,
  noUnusedExportsRule,
  consistentImportsRule,
  noBarrelImportsRule,
} from './dependencies/index.js'

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
import { noSkippedTestsRule, noFocusedTestsRule } from './testing/index.js'

import {
  noThrowLiteralRule,
  noConstantBinaryExpressionRule,
  noEmptyCatchRule,
  noUselessCatchRule,
  noEmptyFunctionRule,
  noEmptyCharacterClassRule,
} from './correctness/index.js'

// Pattern rules
import {
  consistentTypeExportsRule,
  curlyRule,
  eqEqEqRule,
  explicitModuleBoundaryTypesRule,
  maxFileSizeRule,
  maxUnionSizeRule,
  noAlertRule,
  noArrayConstructorRule,
  noArrayDestructuringRule,
  noAsyncPromiseExecutorRule,
  noAsyncWithoutAwaitRule,
  noCompareNegZeroRule,
  noConfusingVoidExpressionRule,
  noConstantConditionRule,
  noConsoleLogRule,
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
  noMisusedPromisesRule,
  noLonelyIfRule,
  noLossOfPrecisionRule,
  noMultiSpacesRule,
  noNestedTernaryRule,
  noNonNullAssertionRule,
  noObjectConstructorRule,
  noParamReassignRule,
  noPromiseAsBooleanRule,
  noReturnAwaitRule,
  noSameSideConditionsRule,
  noShadowRule,
  noSimplifiablePatternRule,
  noStringConcatRule,
  noThrowSyncRule,
  noUnnecessaryConditionRule,
  noUnnecessaryEscapeInRegexpRule,
  noUnnecessaryQualifierRule,
  noUnnecessarySliceRule,
  noUnnecessaryStringConcatRule,
  noUnnecessaryTemplateExpressionRule,
  noUnnecessaryTypeArgumentsRule,
  noUnsafeAssignmentRule,
  noUnsafeDeclarationMergingRule,
  noUnusedVarsRule,
  noUnusedPrivateMembersRule,
  noUselessFallbackInSpreadRule,
  noVarRequiresRule,
  noVoidRule,
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
  preferPrototypeMethodsRule,
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
  requireAwaitRule,
  requireReturnTypeRule,
  restrictTemplateExpressionsRule,
  preferReadonlyParameterRule,
  noTypeOnlyReturnRule,
  noDebuggerRule,
  noDeleteVarRule,
  noUselessComparisonRule,
  noUselessConstructorRule,
  preferPromiseRejectErrorsRule,
  // Orphan pattern rules
  constructorSuperRule,
  defaultCaseRule,
  forDirectionRule,
  getterReturnRule,
  noBitwiseRule,
  noCallerRule,
  noCaseDeclarationsRule,
  noClassAssignRule,
  noCondAssignRule,
  noConstructorReturnRule,
  noControlRegexRule,
  noDivRegexRule,
  noDupeArgsRule,
  noDupeClassMembersRule,
  noDupeKeysRule,
  noDuplicateCaseRule,
  noEmptyPatternRule,
  noEmptyStaticBlockRule,
  noExAssignRule,
  noExtendNativeRule,
  noExtraBooleanCastRule,
  noFallthroughRule,
  noFuncAssignRule,
  noGlobalAssignRule,
  noImportAssignRule,
  noInvalidRegexpRule,
  noIrregularWhitespaceRule,
  noIteratorRule,
  noLoopFuncRule,
  noMisleadingCharacterClassRule,
  noNewFuncRule,
  noNewNativeNonconstructorRule,
  noNewWrappersRule,
  noNonoctalDecimalEscapeRule,
  noObjCallsRule,
  noOctalRule,
  noPrototypeBuiltinsRule,
  noRedeclareRule,
  noRegexSpacesRule,
  noReturnAssignRule,
  noReturnOrAwaitRule,
  noSelfAssignRule,
  noSequencesRule,
  noSetterReturnRule,
  noShadowRestrictedNamesRule,
  noSparseArraysRule,
  noThenableRule,
  noThisBeforeSuperRule,
  noUnassignedVarsRule,
  noUndefRule,
  noUnexpectedMultilineRule,
  noUnneededTernaryRule,
  noUnreachableRule,
  noUnsafeFinallyRule,
  noUnsafeNegationRule,
  noUnsafeOptionalChainingRule,
  noUnusedExpressionsRule,
  noUnusedLabelsRule,
  noUselessAssignmentRule,
  noUselessBackreferenceRule,
  noUselessConcatRule,
  noUselessEscapeRule,
  noVarRule,
  noWithRule,
  objectShorthandRule,
  preserveCaughtErrorRule,
  requireYieldRule,
  sortKeysRule,
  useIsnanRule,
  validTypeofRule,
} from './patterns/index.js'

import { adaptPluginRule } from './adapter.js'

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
const adaptedPreferPromiseRejectErrors = adaptPluginRule(preferPromiseRejectErrorsRule, 'prefer-promise-reject-errors')

const adaptedNoAlert = adaptPluginRule(noAlertRule, 'no-alert')
const adaptedNoUselessConstructor = adaptPluginRule(noUselessConstructorRule, 'no-useless-constructor')
const adaptedNoUnsafeCall = adaptPluginRule(noUnsafeCallRule, 'no-unsafe-call')
const adaptedNoUnsafeMemberAccess = adaptPluginRule(noUnsafeMemberAccessRule, 'no-unsafe-member-access')

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
const adaptedNoIrregularWhitespace = adaptPluginRule(noIrregularWhitespaceRule, 'no-irregular-whitespace')
const adaptedNoIterator = adaptPluginRule(noIteratorRule, 'no-iterator')
const adaptedNoLoopFunc = adaptPluginRule(noLoopFuncRule, 'no-loop-func')
const adaptedNoMisleadingCharacterClass = adaptPluginRule(noMisleadingCharacterClassRule, 'no-misleading-character-class')
const adaptedNoNewFunc = adaptPluginRule(noNewFuncRule, 'no-new-func')
const adaptedNoNewNativeNonconstructor = adaptPluginRule(noNewNativeNonconstructorRule, 'no-new-native-nonconstructor')
const adaptedNoNewWrappers = adaptPluginRule(noNewWrappersRule, 'no-new-wrappers')
const adaptedNoNonoctalDecimalEscape = adaptPluginRule(noNonoctalDecimalEscapeRule, 'no-nonoctal-decimal-escape')
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
const adaptedNoShadowRestrictedNames = adaptPluginRule(noShadowRestrictedNamesRule, 'no-shadow-restricted-names')
const adaptedNoSparseArrays = adaptPluginRule(noSparseArraysRule, 'no-sparse-arrays')
const adaptedNoThenable = adaptPluginRule(noThenableRule, 'no-thenable')
const adaptedNoThisBeforeSuper = adaptPluginRule(noThisBeforeSuperRule, 'no-this-before-super')
const adaptedNoUnassignedVars = adaptPluginRule(noUnassignedVarsRule, 'no-unassigned-vars')
const adaptedNoUndef = adaptPluginRule(noUndefRule, 'no-undef')
const adaptedNoUnexpectedMultiline = adaptPluginRule(noUnexpectedMultilineRule, 'no-unexpected-multiline')
const adaptedNoUnneededTernary = adaptPluginRule(noUnneededTernaryRule, 'no-unneeded-ternary')
const adaptedNoUnreachable = adaptPluginRule(noUnreachableRule, 'no-unreachable')
const adaptedNoUnsafeFinally = adaptPluginRule(noUnsafeFinallyRule, 'no-unsafe-finally')
const adaptedNoUnsafeNegation = adaptPluginRule(noUnsafeNegationRule, 'no-unsafe-negation')
const adaptedNoUnsafeOptionalChaining = adaptPluginRule(noUnsafeOptionalChainingRule, 'no-unsafe-optional-chaining')
const adaptedNoUnusedExpressions = adaptPluginRule(noUnusedExpressionsRule, 'no-unused-expressions')
const adaptedNoUnusedLabels = adaptPluginRule(noUnusedLabelsRule, 'no-unused-labels')
const adaptedNoUselessAssignment = adaptPluginRule(noUselessAssignmentRule, 'no-useless-assignment')
const adaptedNoUselessBackreference = adaptPluginRule(noUselessBackreferenceRule, 'no-useless-backreference')
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
const adaptedNoEmptyCharacterClass = adaptPluginRule(noEmptyCharacterClassRule, 'no-empty-character-class')

export const allRules: Record<string, RuleDefinition> = {
  // Best practices
  'no-magic-numbers': noMagicNumbersRule,
  'prefer-const-assertions': preferConstAssertionsRule,
  'no-unnecessary-type-assertion': noUnnecessaryTypeAssertionRule,
  'strict-boolean-expressions': strictBooleanExpressionsRule,
  // Complexity
  'max-complexity': maxComplexityRule,
  'max-depth': maxDepthRule,
  'max-lines': maxLinesRule,
  'max-lines-per-function': maxLinesPerFunctionRule,
  'max-params': maxParamsRule,
  // Performance
  'no-await-in-loop': noAwaitInLoopRule,
  'no-sync-in-async': noSyncInAsyncRule,
  'prefer-object-spread': adaptedPreferObjectSpread,
  'prefer-optional-chain': adaptedPreferOptionalChain,
  'prefer-math-trunc': adaptedPreferMathTrunc,
  // Dependencies
  'no-circular-deps': adaptedNoCircularDeps,
  'no-unused-exports': adaptedNoUnusedExports,
  'consistent-imports': adaptedConsistentImports,
  'no-barrel-imports': adaptedNoBarrelImports,
  // Security
  'no-deprecated-api': adaptedNoDeprecatedApi,
  'no-dynamic-delete': adaptedNoDynamicDelete,
  'no-eval': adaptedNoEval,
  'no-unsafe-return': adaptedNoUnsafeReturn,
  'no-unsafe-type-assertion': adaptedNoUnsafeTypeAssertion,
  // Patterns
  'consistent-type-exports': adaptedConsistentTypeExports,
  'max-file-size': adaptedMaxFileSize,
  'max-union-size': adaptedMaxUnionSize,
  'no-console-log': adaptedNoConsoleLog,
  'no-duplicate-code': adaptedNoDuplicateCode,
  'no-duplicate-else-if': adaptedNoDuplicateElseIf,
  'no-explicit-any': adaptedNoExplicitAny,
  'no-floating-promises': adaptedNoFloatingPromises,
  'no-implicit-coercion': adaptedNoImplicitCoercion,
  'no-implied-eval': adaptedNoImpliedEval,
  'no-inferrable-types': adaptedNoInferrableTypes,
  'no-misused-promises': adaptedNoMisusedPromises,
  'no-lonely-if': adaptedNoLonelyIf,
  'no-loss-of-precision': adaptedNoLossOfPrecision,
  'no-multi-spaces': adaptedNoMultiSpaces,
  'no-return-await': adaptedNoReturnAwait,
  'no-throw-sync': adaptedNoThrowSync,
  'no-throw-literal': adaptedNoThrowLiteral,
  'no-constant-binary-expression': adaptedNoConstantBinaryExpression,
  'no-empty-catch': adaptedNoEmptyCatch,
  'no-useless-catch': adaptedNoUselessCatch,
  'no-empty-function': adaptedNoEmptyFunction,
  // Patterns
  'eq-eq-eq': adaptedEqEqEq,
  'explicit-module-boundary-types': adaptedExplicitModuleBoundaryTypes,
  'no-array-constructor': adaptedNoArrayConstructor,
  'no-async-promise-executor': adaptedNoAsyncPromiseExecutor,
  'no-compare-neg-zero': adaptedNoCompareNegZero,
  'no-confusing-void-expression': adaptedNoConfusingVoidExpression,
  'no-constant-condition': adaptedNoConstantCondition,
  'no-const-assign': adaptedNoConstAssign,
  'no-duplicate-imports': adaptedNoDuplicateImports,
  'no-else-return': adaptedNoElseReturn,
  'no-empty': adaptedNoEmpty,
  'no-nested-ternary': adaptedNoNestedTernary,
  'no-non-null-assertion': adaptedNoNonNullAssertion,
  'no-object-constructor': adaptedNoObjectConstructor,
  'no-param-reassign': adaptedNoParamReassign,
  'no-promise-as-boolean': adaptedNoPromiseAsBoolean,
  'no-shadow': adaptedNoShadow,
  'no-string-concat': adaptedNoStringConcat,
  'no-unnecessary-template-expression': adaptedNoUnnecessaryTemplateExpression,
  'no-unused-vars': adaptedNoUnusedVars,
  'no-unused-private-members': adaptedNoUnusedPrivateMembers,
  'no-void': adaptedNoVoid,
  'prefer-exponentiation-operator': adaptedPreferExponentiationOperator,
  'prefer-number-properties': adaptedPreferNumberProperties,
  'prefer-numeric-literals': adaptedPreferNumericLiterals,
  'prefer-object-has-own': adaptedPreferObjectHasOwn,
  'no-unsafe-declaration-merging': adaptedNoUnsafeDeclarationMerging,
  'no-type-only-return': adaptedNoTypeOnlyReturn,
  'prefer-date-now': adaptedPreferDateNow,
  'prefer-readonly-parameter': adaptedPreferReadonlyParameter,
  'prefer-const': adaptedPreferConst,
  'prefer-nullish-coalescing': adaptedPreferNullishCoalescing,
  'prefer-readonly': adaptedPreferReadonly,
  'require-return-type': adaptedRequireReturnType,
  'no-var-requires': adaptedNoVarRequires,
  'prefer-async-await': adaptedPreferAsyncAwait,
  'prefer-includes': adaptedPreferIncludes,
  'prefer-literal-enum-member': adaptedPreferLiteralEnumMember,
  'no-unnecessary-condition': adaptedNoUnnecessaryCondition,
  'no-unnecessary-escape-in-regexp': adaptedNoUnnecessaryEscapeInRegexp,
  'no-unnecessary-qualifier': adaptedNoUnnecessaryQualifier,
  'prefer-regex-literals': adaptedPreferRegexLiterals,
  'prefer-regexp-exec': adaptedPreferRegexpExec,
  'prefer-rest-params': adaptedPreferRestParams,
  'prefer-spread': adaptedPreferSpread,
  'prefer-string-replace-all': adaptedPreferStringReplaceAll,
  'prefer-string-slice-over-substring': adaptedPreferStringSliceOverSubstring,
  'prefer-string-slice': adaptedPreferStringSlice,
  'prefer-template': adaptedPreferTemplate,
  'require-await': adaptedRequireAwait,
  'restrict-template-expressions': adaptedRestrictTemplateExpressions,
  curly: adaptedCurly,
  // Orphan rules - previously defined but not registered
  'no-array-destructuring': adaptedNoArrayDestructuring,
  'no-async-without-await': adaptedNoAsyncWithoutAwait,
  'no-same-side-conditions': adaptedNoSameSideConditions,
  'no-simplifiable-pattern': adaptedNoSimplifiablePattern,
  'no-unnecessary-slice': adaptedNoUnnecessarySlice,
  'no-unnecessary-string-concat': adaptedNoUnnecessaryStringConcat,
  'no-unnecessary-type-arguments': adaptedNoUnnecessaryTypeArguments,
  'no-unsafe-assignment': adaptedNoUnsafeAssignment,
  'no-useless-fallback-in-spread': adaptedNoUselessFallbackInSpread,
  'prefer-array-flat': adaptedPreferArrayFlat,
  'prefer-at-context': adaptedPreferAtContext,
  'prefer-at-method': adaptedPreferAtMethod,
  'prefer-enum-initializers': adaptedPreferEnumInitializers,
  'prefer-function-type': adaptedPreferFunctionType,
  'prefer-prototype-methods': adaptedPreferPrototypeMethods,
  'prefer-string-starts-ends-with': adaptedPreferStringStartsEndsWith,
  'prefer-ternary-operator': adaptedPreferTernaryOperator,
  'no-debugger': adaptedNoDebugger,
  'no-delete-var': adaptedNoDeleteVar,
  'no-useless-comparison': noUselessComparisonRule,
  'prefer-promise-reject-errors': adaptedPreferPromiseRejectErrors,
  'no-console': adaptedNoConsole,
  'no-unsafe-regex': adaptedNoUnsafeRegex,
  'no-skipped-tests': adaptedNoSkippedTests,
  'no-focused-tests': adaptedNoFocusedTests,
  'no-alert': adaptedNoAlert,
  'no-useless-constructor': adaptedNoUselessConstructor,
  'no-unsafe-call': adaptedNoUnsafeCall,
  'no-unsafe-member-access': adaptedNoUnsafeMemberAccess,
  // Orphan rules - best practices (native)
  'explicit-return-type': explicitReturnTypeRule,
  'prefer-array-find': preferArrayFindRule,
  'prefer-array-some': preferArraySomeRule,
  'prefer-arrow-callback': preferArrowCallbackRule,
  'prefer-default-export': preferDefaultExportRule,
  'prefer-exponent-operator': preferExponentOperatorRule,
  'prefer-flat-map': preferFlatMapRule,
  'prefer-for-of': preferForOfRule,
  'prefer-regex-literal': preferRegexLiteralRule,
  'prefer-string-start-end': preferStringStartEndRule,
  'prefer-string-template': preferStringTemplateRule,
  // Orphan pattern rules
  'constructor-super': adaptedConstructorSuper,
  'default-case': adaptedDefaultCase,
  'for-direction': adaptedForDirection,
  'getter-return': adaptedGetterReturn,
  'no-bitwise': adaptedNoBitwise,
  'no-caller': adaptedNoCaller,
  'no-case-declarations': adaptedNoCaseDeclarations,
  'no-class-assign': adaptedNoClassAssign,
  'no-cond-assign': adaptedNoCondAssign,
  'no-constructor-return': adaptedNoConstructorReturn,
  'no-control-regex': adaptedNoControlRegex,
  'no-div-regex': adaptedNoDivRegex,
  'no-dupe-args': adaptedNoDupeArgs,
  'no-dupe-class-members': adaptedNoDupeClassMembers,
  'no-dupe-keys': adaptedNoDupeKeys,
  'no-duplicate-case': adaptedNoDuplicateCase,
  'no-empty-pattern': adaptedNoEmptyPattern,
  'no-empty-static-block': adaptedNoEmptyStaticBlock,
  'no-ex-assign': adaptedNoExAssign,
  'no-extend-native': adaptedNoExtendNative,
  'no-extra-boolean-cast': adaptedNoExtraBooleanCast,
  'no-fallthrough': adaptedNoFallthrough,
  'no-func-assign': adaptedNoFuncAssign,
  'no-global-assign': adaptedNoGlobalAssign,
  'no-import-assign': adaptedNoImportAssign,
  'no-invalid-regexp': adaptedNoInvalidRegexp,
  'no-irregular-whitespace': adaptedNoIrregularWhitespace,
  'no-iterator': adaptedNoIterator,
  'no-loop-func': adaptedNoLoopFunc,
  'no-misleading-character-class': adaptedNoMisleadingCharacterClass,
  'no-new-func': adaptedNoNewFunc,
  'no-new-native-nonconstructor': adaptedNoNewNativeNonconstructor,
  'no-new-wrappers': adaptedNoNewWrappers,
  'no-nonoctal-decimal-escape': adaptedNoNonoctalDecimalEscape,
  'no-obj-calls': adaptedNoObjCalls,
  'no-octal': adaptedNoOctal,
  'no-prototype-builtins': adaptedNoPrototypeBuiltins,
  'no-redeclare': adaptedNoRedeclare,
  'no-regex-spaces': adaptedNoRegexSpaces,
  'no-return-assign': adaptedNoReturnAssign,
  'no-return-or-await': adaptedNoReturnOrAwait,
  'no-self-assign': adaptedNoSelfAssign,
  'no-sequences': adaptedNoSequences,
  'no-setter-return': adaptedNoSetterReturn,
  'no-shadow-restricted-names': adaptedNoShadowRestrictedNames,
  'no-sparse-arrays': adaptedNoSparseArrays,
  'no-thenable': adaptedNoThenable,
  'no-this-before-super': adaptedNoThisBeforeSuper,
  'no-unassigned-vars': adaptedNoUnassignedVars,
  'no-undef': adaptedNoUndef,
  'no-unexpected-multiline': adaptedNoUnexpectedMultiline,
  'no-unneeded-ternary': adaptedNoUnneededTernary,
  'no-unreachable': adaptedNoUnreachable,
  'no-unsafe-finally': adaptedNoUnsafeFinally,
  'no-unsafe-negation': adaptedNoUnsafeNegation,
  'no-unsafe-optional-chaining': adaptedNoUnsafeOptionalChaining,
  'no-unused-expressions': adaptedNoUnusedExpressions,
  'no-unused-labels': adaptedNoUnusedLabels,
  'no-useless-assignment': adaptedNoUselessAssignment,
  'no-useless-backreference': adaptedNoUselessBackreference,
  'no-useless-concat': adaptedNoUselessConcat,
  'no-useless-escape': adaptedNoUselessEscape,
  'no-var': adaptedNoVar,
  'no-with': adaptedNoWith,
  'object-shorthand': adaptedObjectShorthand,
  'preserve-caught-error': adaptedPreserveCaughtError,
  'require-yield': adaptedRequireYield,
  'sort-keys': adaptedSortKeys,
  'use-isnan': adaptedUseIsnan,
  'valid-typeof': adaptedValidTypeof,
  'no-empty-character-class': adaptedNoEmptyCharacterClass,
}

export type RuleCategory =
  | 'complexity'
  | 'dependencies'
  | 'performance'
  | 'security'
  | 'patterns'
  | 'correctness'
  | 'testing'
export function getRule(ruleId: string): RuleDefinition | undefined {
  return allRules[ruleId]
}
export function getRuleIds(): string[] {
  return Object.keys(allRules)
}

// Rule ID to category mapping
const RULE_CATEGORIES: Record<string, RuleCategory> = {
  // Complexity
  'max-complexity': 'complexity',
  'max-depth': 'complexity',
  'max-lines': 'complexity',
  'max-lines-per-function': 'complexity',
  'max-params': 'complexity',
  // Performance
  'no-await-in-loop': 'performance',
  'no-sync-in-async': 'performance',
  'prefer-object-spread': 'performance',
  'prefer-optional-chain': 'performance',
  'prefer-math-trunc': 'performance',
  // Dependencies
  'no-circular-deps': 'dependencies',
  'no-unused-exports': 'dependencies',
  'consistent-imports': 'dependencies',
  'no-barrel-imports': 'dependencies',
  // Security
  'no-deprecated-api': 'security',
  'no-dynamic-delete': 'security',
  'no-eval': 'security',
  'no-unsafe-return': 'security',
  'no-unsafe-type-assertion': 'security',
  // Patterns
  'consistent-type-exports': 'patterns',
  'max-file-size': 'patterns',
  'max-union-size': 'patterns',
  'no-console-log': 'patterns',
  'no-duplicate-code': 'patterns',
  'no-duplicate-else-if': 'patterns',
  'no-explicit-any': 'patterns',
  'no-floating-promises': 'patterns',
  'no-implicit-coercion': 'patterns',
  'no-implied-eval': 'patterns',
  'no-inferrable-types': 'patterns',
  'no-misused-promises': 'patterns',
  'no-lonely-if': 'patterns',
  'no-loss-of-precision': 'patterns',
  'no-multi-spaces': 'patterns',
  'no-return-await': 'patterns',
  'no-throw-sync': 'patterns',
  'no-unnecessary-condition': 'patterns',
  'no-unnecessary-escape-in-regexp': 'patterns',
  'no-unnecessary-qualifier': 'patterns',
  'no-var-requires': 'patterns',
  'prefer-async-await': 'patterns',
  'prefer-const': 'patterns',
  'prefer-includes': 'patterns',
  'prefer-literal-enum-member': 'patterns',
  'prefer-nullish-coalescing': 'patterns',
  'prefer-readonly': 'patterns',
  'require-return-type': 'patterns',
  'prefer-regex-literals': 'patterns',
  'prefer-regexp-exec': 'patterns',
  'prefer-rest-params': 'patterns',
  'prefer-spread': 'patterns',
  'prefer-string-replace-all': 'patterns',
  'prefer-string-slice-over-substring': 'patterns',
  'prefer-string-slice': 'patterns',
  'prefer-template': 'patterns',
  'require-await': 'patterns',
  'restrict-template-expressions': 'patterns',
  curly: 'patterns',
  'eq-eq-eq': 'patterns',
  'explicit-module-boundary-types': 'patterns',
  'no-array-constructor': 'patterns',
  'no-async-promise-executor': 'patterns',
  'no-compare-neg-zero': 'patterns',
  'no-confusing-void-expression': 'patterns',
  'no-constant-condition': 'patterns',
  'no-const-assign': 'patterns',
  'no-duplicate-imports': 'patterns',
  'no-else-return': 'patterns',
  'no-empty': 'patterns',
  'no-nested-ternary': 'patterns',
  'no-non-null-assertion': 'patterns',
  'no-object-constructor': 'patterns',
  'no-param-reassign': 'patterns',
  'no-promise-as-boolean': 'patterns',
  'no-shadow': 'patterns',
  'no-string-concat': 'patterns',
  'no-unnecessary-template-expression': 'patterns',
  'no-unused-vars': 'patterns',
  'no-unused-private-members': 'patterns',
  'no-unsafe-declaration-merging': 'patterns',
  'no-void': 'patterns',
  'prefer-exponentiation-operator': 'patterns',
  'prefer-number-properties': 'patterns',
  'prefer-numeric-literals': 'patterns',
  'prefer-object-has-own': 'patterns',
  'no-type-only-return': 'patterns',
  'prefer-date-now': 'patterns',
  'prefer-readonly-parameter': 'patterns',
  // Best practices
  'prefer-const-assertions': 'patterns',
  'no-unnecessary-type-assertion': 'patterns',
  'strict-boolean-expressions': 'patterns',
  'no-throw-literal': 'correctness',
  'no-constant-binary-expression': 'correctness',
  'no-empty-catch': 'correctness',
  'no-console': 'patterns',
  'no-unsafe-regex': 'security',
  'no-skipped-tests': 'testing',
  'no-focused-tests': 'testing',
  'no-empty-function': 'correctness',
  'no-debugger': 'patterns',
  'no-delete-var': 'patterns',
  'no-useless-comparison': 'patterns',
  'prefer-promise-reject-errors': 'patterns',
  'no-alert': 'patterns',
  'no-useless-constructor': 'patterns',
  'no-unsafe-call': 'security',
  'no-unsafe-member-access': 'security',
  // Orphan rules
  'explicit-return-type': 'patterns',
  'prefer-array-find': 'patterns',
  'prefer-array-some': 'patterns',
  'prefer-arrow-callback': 'patterns',
  'prefer-default-export': 'patterns',
  'prefer-exponent-operator': 'patterns',
  'prefer-flat-map': 'patterns',
  'prefer-for-of': 'patterns',
  'prefer-regex-literal': 'patterns',
  'prefer-string-start-end': 'patterns',
  'prefer-string-template': 'patterns',
  'constructor-super': 'patterns',
  'default-case': 'patterns',
  'for-direction': 'patterns',
  'getter-return': 'patterns',
  'no-bitwise': 'patterns',
  'no-caller': 'patterns',
  'no-case-declarations': 'patterns',
  'no-class-assign': 'patterns',
  'no-cond-assign': 'patterns',
  'no-constructor-return': 'patterns',
  'no-control-regex': 'patterns',
  'no-div-regex': 'patterns',
  'no-dupe-args': 'patterns',
  'no-dupe-class-members': 'patterns',
  'no-dupe-keys': 'patterns',
  'no-duplicate-case': 'patterns',
  'no-empty-pattern': 'patterns',
  'no-empty-static-block': 'patterns',
  'no-ex-assign': 'patterns',
  'no-extend-native': 'patterns',
  'no-extra-boolean-cast': 'patterns',
  'no-fallthrough': 'patterns',
  'no-func-assign': 'patterns',
  'no-global-assign': 'patterns',
  'no-import-assign': 'patterns',
  'no-invalid-regexp': 'patterns',
  'no-irregular-whitespace': 'patterns',
  'no-iterator': 'patterns',
  'no-loop-func': 'patterns',
  'no-misleading-character-class': 'patterns',
  'no-new-func': 'patterns',
  'no-new-native-nonconstructor': 'patterns',
  'no-new-wrappers': 'patterns',
  'no-nonoctal-decimal-escape': 'patterns',
  'no-obj-calls': 'patterns',
  'no-octal': 'patterns',
  'no-prototype-builtins': 'patterns',
  'no-redeclare': 'patterns',
  'no-regex-spaces': 'patterns',
  'no-return-assign': 'patterns',
  'no-return-or-await': 'patterns',
  'no-self-assign': 'patterns',
  'no-sequences': 'patterns',
  'no-setter-return': 'patterns',
  'no-shadow-restricted-names': 'patterns',
  'no-sparse-arrays': 'patterns',
  'no-thenable': 'patterns',
  'no-this-before-super': 'patterns',
  'no-unassigned-vars': 'patterns',
  'no-undef': 'patterns',
  'no-unexpected-multiline': 'patterns',
  'no-unneeded-ternary': 'patterns',
  'no-unreachable': 'patterns',
  'no-unsafe-finally': 'patterns',
  'no-unsafe-negation': 'patterns',
  'no-unsafe-optional-chaining': 'patterns',
  'no-unused-expressions': 'patterns',
  'no-unused-labels': 'patterns',
  'no-useless-assignment': 'patterns',
  'no-useless-backreference': 'patterns',
  'no-useless-concat': 'patterns',
  'no-useless-escape': 'patterns',
  'no-var': 'patterns',
  'no-with': 'patterns',
  'object-shorthand': 'patterns',
  'preserve-caught-error': 'patterns',
  'require-yield': 'patterns',
  'sort-keys': 'patterns',
  'use-isnan': 'patterns',
  'valid-typeof': 'patterns',
  'no-empty-character-class': 'correctness',
}
export function getRuleCategory(ruleId: string): RuleCategory {
  return RULE_CATEGORIES[ruleId] ?? 'complexity'
}
// Re-exports
export {
  maxComplexityRule,
  maxDepthRule,
  maxLinesRule,
  maxLinesPerFunctionRule,
  maxParamsRule,
} from './complexity/index.js'
export { noAwaitInLoopRule, noSyncInAsyncRule } from './performance/index.js'
export { preferObjectSpreadRule, preferOptionalChainRule } from './performance/index.js'
export {
  noCircularDepsRule,
  noUnusedExportsRule,
  consistentImportsRule,
  noBarrelImportsRule,
} from './dependencies/index.js'
export {
  noDeprecatedApiRule,
  noDynamicDeleteRule,
  noEvalRule,
  noUnsafeReturnRule,
  noUnsafeTypeAssertionRule,
} from './security/index.js'
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
  noConstantConditionRule,
  noConsoleLogRule,
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
  noMisusedPromisesRule,
  noLonelyIfRule,
  noLossOfPrecisionRule,
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
  noUnusedVarsRule,
  noUnusedPrivateMembersRule,
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
  preferRegexpExecRule,
  preferRegexLiteralsRule,
  preferRestParamsRule,
  preferSpreadRule,
  preferStringReplaceAllRule,
  preferStringSliceOverSubstringRule,
  preferStringSliceRule,
  preferTemplateRule,
  requireAwaitRule,
  requireReturnTypeRule,
  restrictTemplateExpressionsRule,
  noUnsafeDeclarationMergingRule,
} from './patterns/index.js'
