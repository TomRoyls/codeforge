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
  preferReturnThisTypeRule,
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
    noInvalidUseBeforeDefRule,
     noImplicitGlobalsRule,
     noNonNullAssertedOptionalChainRule,
      noMisleadingSpreadRule,
      noAsyncConstructorRule,
      noApproximateConstantsRule,
       noImplicitUndefinedRule,
       noMisleadingAssertionRule,
       noRequireImportsRule,
      noCompareNegationRule,
       } from './correctness/index.js'
// Dependencies rules
 import {
   consistentImportsRule,
   noBarrelImportsRule,
   noCircularDepsRule,
    noUnusedExportsRule,
    noCjsImportsRule,
    noDynamicImportRule,
    noImplicitDependenciesRule,
    noGitDependenciesRule,
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
   noAsyncForeachRule,
   noAsyncWithoutAwaitRule,
   noBitwiseRule,
   noBufferConstructorRule,
   noCallerRule,
   noCatchShadowRule,
   noCaseDeclarationsRule,
  noClassAssignRule,
   noCollectionSizeMischeckRule,
   noCompareNegZeroRule,
    noCommutativeOpEqualRule,
    noComputedKeysRule,
     noCondAssignRule,
   noConfusingVoidExpressionRule,
   noConfusingArrowRule,
   noConsoleLogRule,
  noConstantConditionRule,
  noConstAssignRule,
  noConstEnumRule,
   noConstructorReturnRule,
   noConstructorSuperRule,
   noContinueRule,
   noControlRegexRule,
  noDebuggerRule,
  noDeleteVarRule,
   noDeprecatedImportsRule,
   noDivRegexRule,
   noDoubleNegationRule,
   noDupeArgsRule,
  noDupeClassMembersRule,
  noDupeKeysRule,
   noDuplicateCaseRule,
     noDuplicateCodeRule,
     noDuplicateConditionRule,
     noExcessiveComplexityRule,
      noEmptyAlternativeRule,
     noDuplicateElseIfRule,
  noDuplicateImportsRule,
  noDuplicateStringsInArrayRule,
  noElseReturnRule,
  noEmptyPatternRule,
  noEmptyRule,
   noEmptyStaticBlockRule,
  noEqNullRule,
   noExAssignRule,
   noExportDefaultRule,
   noExplicitAnyRule,
  noExtendNativeRule,
  noExtraBooleanCastRule,
  noExtraParensRule,
  noExtraSemiRule,
  noFallthroughRule,
   noFloatingPromisesRule,
   noFloatingPromisesReturnedRule,
   noFloatingDecimalRule,
    noFuncAssignRule,
    noHexEscapeRule,
    noOctalEscapeRule,
    noGlobalAssignRule,
   noImplicitCoercionRule,
  noImplicitSideEffectsRule,
   noImpliedEvalRule,
    noImplicitMapRule,
   noImportAssignRule,
   noInferrableTypesRule,
   noInlineCommentsRule,
   noInnerDeclarationsRule,
   noInvalidRegexpRule,
  noIrregularWhitespaceRule,
  noIteratorRule,
  noLabelVarRule,
  noLoneBlocksRule,
  noLonelyIfRule,
   noLoopFuncRule,
   noLabelsRule,
    noLossOfPrecisionRule,
     noMeaninglessVoidRule,
     noMisleadingArrayMethodRule,
    noMisleadingCharacterClassRule,
     noMisleadingInstantiationRule,
     noMisleadingTernaryRule,
      noMixedEnumsRule,
      noMixedOperatorsRule,
       noMisusedNewRule,
   noMultiAssignRule,
   noMultipleEmptyLinesRule,
    noMultiSpacesRule,
  noMultiStrRule,
    noNamespaceRule,
    noNegatedConditionRule,
    noNegatedEqNullRule,
    noNestedTernaryRule,
  noNewFuncRule,
   noNewNativeNonconstructorRule,
   noNewSymbolRule,
   noNewWrappersRule,
  noNonNullAssertionRule,
  noNonoctalDecimalEscapeRule,
  noObjCallsRule,
   noObjectConstructorRule,
   noOctalRule,
   noParamReassignRule,
  noPlusplusRule,
   noPromiseAsBooleanRule,
   noPrototypeBuiltinsRule,
    noPropertyRenameRule,
    noPropertySignatureStyleRule,
   noRedeclareRule,
  noRedundantBooleanRule,
  noRedundantOptionalChainRule,
 noRedundantUseStrictRule,
 noRedundantTypeConstituentsRule,
   noRegexSpacesRule,
   noRestrictedExportsRule,
   noRestrictedSyntaxRule,
   noReturnAssignRule,
  noReturnAwaitRule,
  noReturnOrAwaitRule,
  noSameSideConditionsRule,
   noSelfAssignRule,
   noSelfCompareRule,
   noSequencesRule,
  noSetterReturnRule,
  noShadowRestrictedNamesRule,
  noShadowRule,
   noScriptUrlRule,
  noSimplifiablePatternRule,
    noSparseArraysRule,
   noStaticOnlyClassRule,
   noStringConcatRule,
    noStringCaseConvertRule,
   noSuspiciousCommentRule,
   noTabsRule,
   noTemplateCurlyInStringRule,
  noTernaryRule,
  noThenableRule,
  noThisBeforeSuperRule,
   noThisAliasRule,
    noThrowSyncRule,
   noTrailingSpacesRule,
   noTypeOnlyReturnRule,
   noTypeAliasSingleUnionRule,
   noUnicodeBomRule,
   noUnassignedVarsRule,
   noUndefRule,
   noUnexpectedMultilineRule,
   noUnboundPromiseRule,
     noUnfinishedTodosRule,
     noUnnecessaryConditionRule,
     noUnnecessaryEntriesRule,
      noUnnecessaryDoubleNegationRule,
     noUnnecessaryDoubleEqualsRule,
noUnnecessaryAssertRule,
   noUnnecessaryBignumberRule,
   noUnnecessaryBitwiseNotRule,
  noUnnecessaryBlockRule,
   noUnnecessaryAsExpressionRule,
   noUnnecessaryAtRule,
   noUnnecessaryAtobRule,
  noUnnecessaryBtoaRule,
     noUnnecessaryArrayFromRule,
    noUnnecessaryArrayFromSpreadRule,
      noUnnecessaryArrayFlatRule,
    noUnnecessaryArrayFlatSingleLevelRule,
    noUnnecessaryArrayEveryBooleanRule,
    noUnnecessaryArrayFilterIdentityRule,
     noUnnecessaryArrayFillLiteralRule,
    noUnnecessaryArrayIsarrayLiteralRule,
     noUnnecessaryArrayOfSingleRule,
     noUnnecessaryArrayIncludesSingleRule,
    noUnnecessaryArrayJoinEmptyRule,
    noUnnecessaryArrayConstructorRule,
   noUnnecessaryArrayConcatSingleRule,
   noUnnecessaryAsyncFunctionRule,
   noUnnecessaryAsyncArrowRule,
  noUnnecessaryAwaitRule,
noUnnecessaryAwaitForeachRule,
noUnnecessaryAwaitExpressionRule,
   noUnnecessaryAssignRule,
  noUnnecessaryBindingPatternRule,
  noUnnecessaryBooleanRule,
     noUnnecessaryBooleanComparisonRule,
 noUnnecessaryBooleanLiteralCompareRule,
   noUnnecessaryBooleanConstructorRule,
   noUnnecessaryBooleanWrapperRule,
    noUnnecessaryCallbackWrapperRule,
    noUnnecessaryCatchBindingRule,
  noUnnecessaryClassRule,
  noUnnecessaryDestructuringRule,
    noUnnecessaryConcatRule,
    noUnnecessaryConsoleStringConcatRule,
   noUnnecessaryComputedKeyRule,
   noUnnecessaryContinueRule,
        noUnnecessaryEscapeInRegexpRule,
  noUnnecessaryExpressionStatementRule,
 noUnnecessaryForLoopRule,
  noUnnecessaryFindIndexRule,
  noUnnecessaryFindLastIndexRule,
  noUnnecessaryFindLastRule,
   noUnnecessaryFindRule,
   noUnnecessaryFillRule,
   noUnnecessaryFilterRule,
   noUnnecessaryFlatMapRule,
   noUnnecessaryFlatRule,
    noUnnecessaryForEachRule,
     noUnnecessaryFragmentRule,
   noUnnecessaryInitializationRule,
  noUnnecessaryIndexOfRule,
  noUnnecessaryArrayIndexofZeroRule,
 noUnnecessaryInstanceofArrayRule,
   noUnnecessaryJsonParseRule,
   noUnnecessaryJsonStringifyLiteralRule,
   noUnnecessaryNewArrayRule,
   noUnnecessaryNewBooleanRule,
   noUnnecessaryNewMapRule,
   noUnnecessaryNewObjectRule,
   noUnnecessaryNewSetRule,
  noUnnecessaryNewStringRule,
  noUnnecessaryNewNumberRule,
  noUnnecessaryParenthesesRule,
  noUnnecessaryLabelRule,
  noUnnecessaryLastIndexOfRule,
     noUnnecessaryLiteralKeyRule,
     noUnnecessaryLiteralTostringRule,
    noUnnecessaryLogicalAndTrueRule,
    noUnnecessaryLogicalOrFalseRule,
    noUnnecessaryMapRule,
   noUnnecessaryArrayMapIdentityRule,
     noUnnecessaryMathMaxSingleRule,
   noUnnecessaryMathCeilIntegerRule,
   noUnnecessaryMathRoundIntegerRule,
    noUnnecessaryMathFloorIntegerRule,
    noUnnecessaryMathAbsPositiveRule,
noUnnecessaryNullWithStrictRule,
noUnnecessaryObjectAssignRule,
noUnnecessaryObjectAssignSameRule,
 noUnnecessaryObjectFreezeLiteralRule,
 noUnnecessaryObjectKeysLengthRule,
 noUnnecessaryObjectSealLiteralRule,
   noUnnecessaryNumericLiteralRule,
  noUnnecessaryNumericSeparatorRule,
   noUnnecessaryPopRule,
    noUnnecessaryPolyfillsRule,
   noUnnecessaryPlusNewRule,
  noUnnecessaryQualifierRule,
  noUnnecessaryReadonlyRule,
   noUnnecessaryRegexConstructorRule,
   noUnnecessaryRegexRule,
noUnnecessaryReturnAwaitRule,
   noUnnecessaryReduceRule,
    noUnnecessaryReturnValueRule,
    noUnnecessaryReduceRightRule,
   noUnnecessaryRegexpConstructorRule,
     noUnnecessaryReverseRule,
     noUnnecessaryArrayReverseNoUseRule,
     noUnnecessaryNumberToFixedRule,
     noUnnecessaryNumberTofixedZeroRule,
    noUnnecessaryNumberWrapperRule,
     noUnnecessaryNumberConstructorRule,
     noUnnecessaryNumberIsnanLiteralRule,
  noUnnecessaryJoinRule,
   noUnnecessarySortRule,
    noUnnecessaryArraySortNoUseRule,
    noUnnecessaryArraySomeFalseRule,
    noUnnecessaryIncludesRule,
      noUnnecessaryShiftRule,
      noUnnecessarySliceRule,
      noUnnecessaryArraySliceZeroRule,
    noUnnecessarySomeRule,
    noUnnecessarySpliceRule,
    noUnnecessarySpreadRule,
    noUnnecessarySpreadArrayRule,
noUnnecessaryStringConcatRule,
noUnnecessaryStringConstructorRule,
 noUnnecessaryStringCharAtZeroRule,
 noUnnecessaryStringAtZeroRule,
noUnnecessaryStringCodepointatZeroRule,
noUnnecessaryStringLengthCompareRule,
    noUnnecessaryStringSplitRule,
    noUnnecessaryStringSplitEmptySeparatorRule,
    noUnnecessaryStringStartsEmptyRule,
   noUnnecessaryStringTrimEmptyRule,
   noUnnecessaryStringReplaceAllRule,
  noUnnecessaryStringRepeatZeroRule,
   noUnnecessaryStringifyRule,
    noUnnecessaryStringToNumberRule,
   noUnnecessaryParseFloatRule,
    noUnnecessaryParseIntRule,
    noUnnecessaryParseIntRadixTenRule,
   noUnnecessaryIsFiniteRule,
    noUnnecessaryIsNanRule,
   noUnnecessaryDecodeUriRule,
   noUnnecessaryDeleteRule,
   noUnnecessaryEncodeUriRule,
     noUnnecessaryTemplateExpressionRule,
   noUnnecessaryTemplateLiteralRule,
   noUnnecessaryTemplateLiteralSingleRule,
      noUnnecessaryThenRule,
      noUnnecessaryThrowNewRule,
     noUnnecessaryToReversedRule,
     noUnnecessaryToSortedRule,
     noUnnecessaryToSplicedRule,
     noUnnecessaryToStringRule,
    noUnnecessaryToLocaleStringRule,
     noUnnecessaryTypeofRule,
      noUnnecessaryTypeofStringRule,
      noUnnecessaryTypeofNumberRule,
      noUnnecessaryTypeofBooleanRule,
     noUnnecessaryUndefinedReturnRule,
    noUnnecessaryNullCheckRule,
    noUnnecessaryNullCoalesceFallbackRule,
   noUnnecessaryOptionalChainRule,
   noUnnecessaryOptionalCallRule,
noUnnecessaryParameterPropertyRule,
   noUnnecessaryPromiseWrapRule,
    noUnnecessaryPromiseResolveRule,
    noUnnecessaryPromiseAllRule,
    noUnnecessaryPromiseRejectRule,
    noUnnecessaryEscapeRule,
    noUnnecessaryElseRule,
    noUnnecessaryEveryRule,
    noUnnecessaryConstructorRule,
      noUnnecessaryTernaryRule,
     noUnnecessaryTernaryBooleanRule,
    noUnnecessaryTernaryAssignRule,
    noUnnecessaryTypeArgumentsRule,
noUnnecessaryTypeConstraintRule,
   noUnnecessaryTypeParametersRule,
   noUnnecessaryUnshiftRule,
    noUnnecessaryWithRule,
    noUnnecessaryValuesRule,
       noUnnecessaryVoidRule,
      noUnnecessaryVoidOperatorRule,
     noUnnecessaryYieldRule,
  noUnnecessaryWaitRule,
   noUnneededTernaryRule,
  noUnreachableRule,
  noUndefinedRule,
  noUnderscoreDangleRule,
  noUnsafeAssignmentRule,
  noUnsafeDeclarationMergingRule,
  noUnsafeEnumComparisonRule,
  noUnsafeFinallyRule,
  noUnsafeNegationRule,
  noUnsafeOptionalChainingRule,
  noUnusedExpressionsRule,
  noUnusedLabelsRule,
  noUnusedPrivateMembersRule,
  noUnusedVarsRule,
   noUseBeforeDefineRule,
   noUseExtendNativeRule,
   noUselessAssignmentRule,
   noUselessBackreferenceRule,
   noUselessComparisonRule,
    noUselessPromiseRule,
     noUselessRenameRule,
    noUselessCallRule,
  noUselessComputedKeyRule,
     noUselessConcatRule,
   noUselessConstructorRule,
   noUselessEscapeRule,
   noUselessExpressionStatementRule,
   noUselessFallbackInSpreadRule,
   noUselessUndefinedRule,
   noUselessReturnRule,
   noUselessSwitchRule,
   noUselessTypeConversionRule,
   noUtilityTruthinessRule,
  noVarRequiresRule,
  noVarRule,
   noVoidRule,
   noWarningCommentsRule,
    noWithRule,
   noWhitespaceBeforePropertyRule,
   objectShorthandRule,
  preferArrayFlatRule,
  preferAsyncAwaitRule,
  preferAtContextRule,
  preferAtMethodRule,
  preferConstRule,
  preferDateNowRule,
   preferEnumInitializersRule,
   preferDestructuringRule,
    preferExponentiationOperatorRule,
   preferFunctionTypeRule,
   preferIncludesRule,
   preferLiteralEnumMemberRule,
   preferNullishCoalescingRule,
     preferNumberPropertiesRule,
    preferNumberIsnanRule,
     preferNumberIsfiniteRule,
     preferNumericLiteralsRule,
    preferObjectHasOwnRule,
    preferOptionalChainRule,
      preferPromiseRejectErrorsRule,
      preferPrototypeMethodsRule,
      preferReadonlyRule,
      preferReadonlyParameterRule,
      preferRegexpExecRule,
      preferRegexLiteralsRule,
      preferRestParamsRule,
      preferSingleBooleanReturnRule,
      preferStringCharAtRule,
      preferStringSliceRule,
      preferStringSliceOverSubstringRule,
      preferStringStartsEndsWithRule,
      preferSpreadRule,
      preferStringReplaceAllRule,
      preferTemplateRule,
      preferTernaryOperatorRule,
      preserveCaughtErrorRule,
      requireAwaitRule,
      requireReturnTypeRule,
      requireYieldRule,
      restrictTemplateExpressionsRule,
       sortKeysRule,
       sortImportsRule,
        spacedCommentRule,
        strictBoolExpressionsRule,
       useIsnanRule,
      validTypeofRule,
      yodaRule,
     } from './patterns/index.js'
 import {
   noAwaitInLoopRule,
   noInefficientArrayMethodsRule,
   noMisusedPromisesRule,
   noPrimitiveWrapperMapsRule,
    noArrayReduceRule,
     noInefficientStringConcatRule,
     noConstantResponseRule,
     noSyncInAsyncRule,
   preferMathTruncRule,
    preferObjectSpreadRule,
    noUnnecessaryAsyncRule,
    noMisusedPromiseReturnRule,
  } from './performance/index.js'
// Security rules
import {
  noDeprecatedApiRule,
  noDynamicDeleteRule,
  noEvalRule,
  noHardcodedCredentialsRule,
  noSqlInjectionRule,
  noUnsafeCallRule,
  noUnsafeHtmlRule,
  noUnsafeMemberAccessRule,
  noUnsafeRegexRule,
  noUnsafeReturnRule,
  noUnsafeTypeAssertionRule,
    noWeakCryptoRule,
     noInnerHTMLRule,
     noBannedPropertiesRule,
      noDocumentWriteRule,
       noRegexConcatRule,
       noRegexConstructorRule,
       noUnsafeArgumentRule,
        noRestrictedGlobalsRule,
         noRestrictedImportsRule,
         noRestrictedPropertiesRule,
      } from './security/index.js'
  // Testing rules
import {
  consistentTestItRule,
  expectExpectRule,
  maxExpectsRule,
  maxNestedDescribeRule,
  noAliasMethodsRule,
   noAssertionInSetupRule,
   noAssertionInLoopRule,
   noAssertTruthinessRule,
   noAsyncSuiteRule,
  noCommentedOutTestsRule,
  noConditionalExpectRule,
    noConfusingDoubleEqualRule,
    noAssigningExpectResultRule,
    noAssigningHooksReturnRule,
    noDynamicDescribeRule,
    noEmptyHookRule,
    noConfusingTestNameRule,
    noEvalInTestRule,
    noMisusedMatchersRule,
   noConfusingConditionalAccessRule,
  noConditionalInTestRule,
  noConsoleInTestsRule,
  noDeprecatedFunctionsRule,
  noDoneCallbackRule,
  noDuplicateHooksRule,
  noEmptyDescribeRule,
  noFocusedTestsRule,
  noIdenticalTitleRule,
  noInterpolationInSnapshotsRule,
  noJestGlobalsRule,
   noLargeJestSnapshotsRule,
   noRedundantActionRule,
   noRestrictedMatchersRule,
  noRestrictedJestMethodsRule,
  noSkippedTestsRule,
  noStandaloneExpectRule,
  noTestPrefixRule,
    noTestReturnStatementRule,
noUselessAsyncTestRule,
  noUnsafeMatchersRule,
  noMisplacedHookRule,
  requireHookDescriptionRule,
    noAsyncSnapshotRule,
   noAsyncSetupRule,
     preferCalledWithRule,
    preferEqualityMatcherRule,
    preferEachRule,
    preferExpectResolvesRule,
    preferExpectAssertionsRule,
     noMisusedAsyncRule,
     noNestedDescribeRule,
    noImplicitReturnInTestRule,
     preferHooksOnTopRule,
      preferInlineSnapshotRule,
     preferLiteralMatchersRule,
     preferMockPromiseShorthandRule,
      preferMockReturnValueRule,
     preferResolvesRejectsRule,
      noRedundantExpectRule,
     preferNamedSnapshotRule,
    preferSnapshotHintRule,
    preferSpyOnRule,
   preferStrictEqualRule,
   preferToBeRule,
   preferToBeNullRule,
   preferToBeUndefinedRule,
   preferToContainRule,
   preferToHaveLengthRule,
   preferTodoRule,
   requireHookRule,
   requireToThrowMessageRule,
  requireTopLevelDescribeRule,
  validExpectRule,
  validTitleRule,
} from './testing/index.js'

const adaptedPreferObjectSpread = adaptPluginRule(preferObjectSpreadRule, 'prefer-object-spread')
const adaptedNoPrimitiveWrapperMaps = adaptPluginRule(noPrimitiveWrapperMapsRule, 'no-primitive-wrapper-maps')
const adaptedNoArrayReduce = adaptPluginRule(noArrayReduceRule, 'no-array-reduce')
const adaptedNoInefficientStringConcat = adaptPluginRule(noInefficientStringConcatRule, 'no-inefficient-string-concat')
const adaptedNoConstantResponse = adaptPluginRule(noConstantResponseRule, 'no-constant-response')
const adaptedNoUnnecessaryAsync = adaptPluginRule(noUnnecessaryAsyncRule, 'no-unnecessary-async')
const adaptedNoMisusedPromiseReturn = adaptPluginRule(noMisusedPromiseReturnRule, 'no-misused-promise-return')
const adaptedPreferOptionalChain = adaptPluginRule(preferOptionalChainRule, 'prefer-optional-chain')
const adaptedPreferStringCharAt = adaptPluginRule(preferStringCharAtRule, 'prefer-string-char-at')
const adaptedPreferMathTrunc = adaptPluginRule(preferMathTruncRule, 'prefer-math-trunc')
const adaptedNoCircularDeps = adaptPluginRule(noCircularDepsRule, 'no-circular-deps')
const adaptedNoUnusedExports = adaptPluginRule(noUnusedExportsRule, 'no-unused-exports')
const adaptedNoCjsImports = adaptPluginRule(noCjsImportsRule, 'no-cjs-imports')
const adaptedNoDynamicImport = adaptPluginRule(noDynamicImportRule, 'no-dynamic-import')
const adaptedNoImplicitDependencies = adaptPluginRule(noImplicitDependenciesRule, 'no-implicit-dependencies')
const adaptedNoGitDependencies = adaptPluginRule(noGitDependenciesRule, 'no-git-dependencies')
const adaptedConsistentImports = adaptPluginRule(consistentImportsRule, 'consistent-imports')
const adaptedNoBarrelImports = adaptPluginRule(noBarrelImportsRule, 'no-barrel-imports')
const adaptedNoDeprecatedApi = adaptPluginRule(noDeprecatedApiRule, 'no-deprecated-api')
const adaptedNoEval = adaptPluginRule(noEvalRule, 'no-eval')
const adaptedNoUnsafeTypeAssertion = adaptPluginRule(
  noUnsafeTypeAssertionRule,
  'no-unsafe-type-assertion',
)
const adaptedNoHardcodedCredentials = adaptPluginRule(
  noHardcodedCredentialsRule,
  'no-hardcoded-credentials',
)
const adaptedNoSqlInjection = adaptPluginRule(
  noSqlInjectionRule,
  'no-sql-injection',
)
const adaptedNoUnsafeHtml = adaptPluginRule(noUnsafeHtmlRule, 'no-unsafe-html')
const adaptedNoWeakCrypto = adaptPluginRule(noWeakCryptoRule, 'no-weak-crypto')
const adaptedNoInnerHTML = adaptPluginRule(noInnerHTMLRule, 'no-innerhtml')
const adaptedNoBannedProperties = adaptPluginRule(noBannedPropertiesRule, 'no-banned-properties')
const adaptedNoDocumentWrite = adaptPluginRule(noDocumentWriteRule, 'no-document-write')
const adaptedNoRegexConcat = adaptPluginRule(noRegexConcatRule, 'no-regex-concat')
const adaptedNoRegexConstructor = adaptPluginRule(noRegexConstructorRule, 'no-regex-constructor')
const adaptedNoUnsafeArgument = adaptPluginRule(noUnsafeArgumentRule, 'no-unsafe-argument')
const adaptedNoRestrictedGlobals = adaptPluginRule(noRestrictedGlobalsRule, 'no-restricted-globals')
const adaptedNoRestrictedImports = adaptPluginRule(noRestrictedImportsRule, 'no-restricted-imports')
const adaptedNoRestrictedProperties = adaptPluginRule(noRestrictedPropertiesRule, 'no-restricted-properties')
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
const adaptedNoExcessiveComplexity = adaptPluginRule(noExcessiveComplexityRule, 'no-excessive-complexity')
const adaptedNoDuplicateCondition = adaptPluginRule(noDuplicateConditionRule, 'no-duplicate-condition')
const adaptedNoEmptyAlternative = adaptPluginRule(noEmptyAlternativeRule, 'no-empty-alternative')
const adaptedNoDuplicateElseIf = adaptPluginRule(noDuplicateElseIfRule, 'no-duplicate-else-if')
const adaptedPreferConst = adaptPluginRule(preferConstRule, 'prefer-const')
const adaptedPreferNullishCoalescing = adaptPluginRule(
  preferNullishCoalescingRule,
  'prefer-nullish-coalescing',
)
const adaptedNoConsoleLog = adaptPluginRule(noConsoleLogRule, 'no-console-log')
const adaptedNoThrowSync = adaptPluginRule(noThrowSyncRule, 'no-throw-sync')
const adaptedNoTrailingSpaces = adaptPluginRule(noTrailingSpacesRule, 'no-trailing-spaces')
const adaptedPreferReadonly = adaptPluginRule(preferReadonlyRule, 'prefer-readonly')
const adaptedPreferReadonlyParameter = adaptPluginRule(
  preferReadonlyParameterRule,
  'prefer-readonly-parameter',
)
const adaptedRequireReturnType = adaptPluginRule(requireReturnTypeRule, 'require-return-type')
const adaptedNoExplicitAny = adaptPluginRule(noExplicitAnyRule, 'no-explicit-any')
const adaptedNoFloatingPromises = adaptPluginRule(noFloatingPromisesRule, 'no-floating-promises')
const adaptedNoFloatingPromisesReturned = adaptPluginRule(noFloatingPromisesReturnedRule, 'no-floating-promises-returned')
const adaptedNoFloatingDecimal = adaptPluginRule(noFloatingDecimalRule, 'no-floating-decimal')
const adaptedNoReturnAwait = adaptPluginRule(noReturnAwaitRule, 'no-return-await')
const adaptedNoVarRequires = adaptPluginRule(noVarRequiresRule, 'no-var-requires')
const adaptedPreferAsyncAwait = adaptPluginRule(preferAsyncAwaitRule, 'prefer-async-await')
const adaptedPreferIncludes = adaptPluginRule(preferIncludesRule, 'prefer-includes')
const adaptedPreferLiteralEnumMember = adaptPluginRule(
  preferLiteralEnumMemberRule,
  'prefer-literal-enum-member',
)
const adaptedNoInferrableTypes = adaptPluginRule(noInferrableTypesRule, 'no-inferrable-types')
const adaptedNoInlineComments = adaptPluginRule(noInlineCommentsRule, 'no-inline-comments')
const adaptedNoInnerDeclarations = adaptPluginRule(noInnerDeclarationsRule, 'no-inner-declarations')
const adaptedConsistentTypeExports = adaptPluginRule(
  consistentTypeExportsRule,
  'consistent-type-exports',
)
const adaptedNoUnnecessaryCondition = adaptPluginRule(
  noUnnecessaryConditionRule,
  'no-unnecessary-condition',
)
const adaptedNoUnnecessaryAwait = adaptPluginRule(noUnnecessaryAwaitRule, 'no-unnecessary-await')
const adaptedNoUnnecessaryAwaitForeach = adaptPluginRule(noUnnecessaryAwaitForeachRule, 'no-unnecessary-await-foreach')
const adaptedNoUnnecessaryAwaitExpression = adaptPluginRule(noUnnecessaryAwaitExpressionRule, 'no-unnecessary-await-expression')
const adaptedNoUnnecessaryAssign = adaptPluginRule(noUnnecessaryAssignRule, 'no-unnecessary-assign')
const adaptedNoUnnecessaryBindingPattern = adaptPluginRule(noUnnecessaryBindingPatternRule, 'no-unnecessary-binding-pattern')
const adaptedNoUnnecessaryAssert = adaptPluginRule(noUnnecessaryAssertRule, 'no-unnecessary-assert')
const adaptedNoUnnecessaryBignumber = adaptPluginRule(noUnnecessaryBignumberRule, 'no-unnecessary-bignumber')
const adaptedNoUnnecessaryBitwiseNot = adaptPluginRule(noUnnecessaryBitwiseNotRule, 'no-unnecessary-bitwise-not')
const adaptedNoUnnecessaryBlock = adaptPluginRule(noUnnecessaryBlockRule, 'no-unnecessary-block')
const adaptedNoUnnecessaryAsExpression = adaptPluginRule(noUnnecessaryAsExpressionRule, 'no-unnecessary-as-expression')
const adaptedNoUnnecessaryAt = adaptPluginRule(noUnnecessaryAtRule, 'no-unnecessary-at')
const adaptedNoUnnecessaryAtob = adaptPluginRule(noUnnecessaryAtobRule, 'no-unnecessary-atob')
const adaptedNoUnnecessaryBtoa = adaptPluginRule(noUnnecessaryBtoaRule, 'no-unnecessary-btoa')
const adaptedNoUnnecessaryArrayFrom = adaptPluginRule(noUnnecessaryArrayFromRule, 'no-unnecessary-array-from')
const adaptedNoUnnecessaryArrayFromSpread = adaptPluginRule(noUnnecessaryArrayFromSpreadRule, 'no-unnecessary-array-from-spread')
const adaptedNoUnnecessaryArrayFlat = adaptPluginRule(noUnnecessaryArrayFlatRule, 'no-unnecessary-array-flat')
const adaptedNoUnnecessaryArrayFlatSingleLevel = adaptPluginRule(noUnnecessaryArrayFlatSingleLevelRule, 'no-unnecessary-array-flat-single-level')
const adaptedNoUnnecessaryArrayEveryBoolean = adaptPluginRule(noUnnecessaryArrayEveryBooleanRule, 'no-unnecessary-array-every-boolean')
const adaptedNoUnnecessaryArrayFilterIdentity = adaptPluginRule(noUnnecessaryArrayFilterIdentityRule, 'no-unnecessary-array-filter-identity')
const adaptedNoUnnecessaryArrayFillLiteral = adaptPluginRule(noUnnecessaryArrayFillLiteralRule, 'no-unnecessary-array-fill-literal')
const adaptedNoUnnecessaryArrayIsarrayLiteral = adaptPluginRule(noUnnecessaryArrayIsarrayLiteralRule, 'no-unnecessary-array-isarray-literal')
const adaptedNoUnnecessaryArrayOfSingle = adaptPluginRule(noUnnecessaryArrayOfSingleRule, 'no-unnecessary-array-of-single')
const adaptedNoUnnecessaryArrayIncludesSingle = adaptPluginRule(noUnnecessaryArrayIncludesSingleRule, 'no-unnecessary-array-includes-single')
const adaptedNoUnnecessaryArrayJoinEmpty = adaptPluginRule(noUnnecessaryArrayJoinEmptyRule, 'no-unnecessary-array-join-empty')
const adaptedNoUnnecessaryArrayConstructor = adaptPluginRule(noUnnecessaryArrayConstructorRule, 'no-unnecessary-array-constructor')
const adaptedNoUnnecessaryArrayConcatSingle = adaptPluginRule(noUnnecessaryArrayConcatSingleRule, 'no-unnecessary-array-concat-single')
const adaptedNoUnnecessaryAsyncFunction = adaptPluginRule(noUnnecessaryAsyncFunctionRule, 'no-unnecessary-async-function')
const adaptedNoUnnecessaryAsyncArrow = adaptPluginRule(noUnnecessaryAsyncArrowRule, 'no-unnecessary-async-arrow')
const adaptedNoUnnecessaryBoolean = adaptPluginRule(noUnnecessaryBooleanRule, 'no-unnecessary-boolean')
const adaptedNoUnnecessaryBooleanComparison = adaptPluginRule(noUnnecessaryBooleanComparisonRule, 'no-unnecessary-boolean-comparison')
const adaptedNoUnnecessaryBooleanLiteralCompare = adaptPluginRule(noUnnecessaryBooleanLiteralCompareRule, 'no-unnecessary-boolean-literal-compare')
const adaptedNoUnnecessaryBooleanConstructor = adaptPluginRule(noUnnecessaryBooleanConstructorRule, 'no-unnecessary-boolean-constructor')
const adaptedNoUnnecessaryBooleanWrapper = adaptPluginRule(noUnnecessaryBooleanWrapperRule, 'no-unnecessary-boolean-wrapper')
const adaptedNoUnnecessaryCallbackWrapper = adaptPluginRule(noUnnecessaryCallbackWrapperRule, 'no-unnecessary-callback-wrapper')
const adaptedNoUnnecessaryCatchBinding = adaptPluginRule(noUnnecessaryCatchBindingRule, 'no-unnecessary-catch-binding')
const adaptedNoUnnecessaryClass = adaptPluginRule(noUnnecessaryClassRule, 'no-unnecessary-class')
const adaptedNoUnnecessaryDestructuring = adaptPluginRule(noUnnecessaryDestructuringRule, 'no-unnecessary-destructuring')
const adaptedNoUnnecessaryConcat = adaptPluginRule(noUnnecessaryConcatRule, 'no-unnecessary-concat')
const adaptedNoUnnecessaryConsoleStringConcat = adaptPluginRule(noUnnecessaryConsoleStringConcatRule, 'no-unnecessary-console-string-concat')
const adaptedNoUnnecessaryComputedKey = adaptPluginRule(noUnnecessaryComputedKeyRule, 'no-unnecessary-computed-key')
const adaptedNoUnnecessaryContinue = adaptPluginRule(noUnnecessaryContinueRule, 'no-unnecessary-continue')
const adaptedNoUnnecessaryEntries = adaptPluginRule(noUnnecessaryEntriesRule, 'no-unnecessary-entries')
const adaptedNoUnnecessaryDoubleNegation = adaptPluginRule(noUnnecessaryDoubleNegationRule, 'no-unnecessary-double-negation')
const adaptedNoUnnecessaryDoubleEquals = adaptPluginRule(noUnnecessaryDoubleEqualsRule, 'no-unnecessary-double-equals')
const adaptedNoUnnecessaryEscapeInRegexp = adaptPluginRule(
  noUnnecessaryEscapeInRegexpRule,
  'no-unnecessary-escape-in-regexp',
)
const adaptedNoUnnecessaryExpressionStatement = adaptPluginRule(noUnnecessaryExpressionStatementRule, 'no-unnecessary-expression-statement')
const adaptedNoUnnecessaryInitialization = adaptPluginRule(noUnnecessaryInitializationRule, 'no-unnecessary-initialization')
const adaptedNoUnnecessaryJsonParse = adaptPluginRule(noUnnecessaryJsonParseRule, 'no-unnecessary-json-parse')
const adaptedNoUnnecessaryJsonStringifyLiteral = adaptPluginRule(noUnnecessaryJsonStringifyLiteralRule, 'no-unnecessary-json-stringify-literal')
const adaptedNoUnnecessaryNewArray = adaptPluginRule(noUnnecessaryNewArrayRule, 'no-unnecessary-new-array')
const adaptedNoUnnecessaryNewBoolean = adaptPluginRule(noUnnecessaryNewBooleanRule, 'no-unnecessary-new-boolean')
const adaptedNoUnnecessaryNewMap = adaptPluginRule(noUnnecessaryNewMapRule, 'no-unnecessary-new-map')
const adaptedNoUnnecessaryNewObject = adaptPluginRule(noUnnecessaryNewObjectRule, 'no-unnecessary-new-object')
const adaptedNoUnnecessaryNewSet = adaptPluginRule(noUnnecessaryNewSetRule, 'no-unnecessary-new-set')
const adaptedNoUnnecessaryNewString = adaptPluginRule(noUnnecessaryNewStringRule, 'no-unnecessary-new-string')
const adaptedNoUnnecessaryNewNumber = adaptPluginRule(noUnnecessaryNewNumberRule, 'no-unnecessary-new-number')
const adaptedNoUnnecessaryParentheses = adaptPluginRule(noUnnecessaryParenthesesRule, 'no-unnecessary-parentheses')
const adaptedNoUnnecessaryLabel = adaptPluginRule(noUnnecessaryLabelRule, 'no-unnecessary-label')
const adaptedNoUnnecessaryLastIndexOf = adaptPluginRule(noUnnecessaryLastIndexOfRule, 'no-unnecessary-last-index-of')
const adaptedNoUnnecessaryFragment = adaptPluginRule(noUnnecessaryFragmentRule, 'no-unnecessary-fragment')
const adaptedNoUnnecessaryLiteralKey = adaptPluginRule(noUnnecessaryLiteralKeyRule, 'no-unnecessary-literal-key')
const adaptedNoUnnecessaryLiteralTostring = adaptPluginRule(noUnnecessaryLiteralTostringRule, 'no-unnecessary-literal-tostring')
const adaptedNoUnnecessaryLogicalAndTrue = adaptPluginRule(noUnnecessaryLogicalAndTrueRule, 'no-unnecessary-logical-and-true')
const adaptedNoUnnecessaryLogicalOrFalse = adaptPluginRule(noUnnecessaryLogicalOrFalseRule, 'no-unnecessary-logical-or-false')
const adaptedNoUnnecessaryMap = adaptPluginRule(noUnnecessaryMapRule, 'no-unnecessary-map')
const adaptedNoUnnecessaryArrayMapIdentity = adaptPluginRule(noUnnecessaryArrayMapIdentityRule, 'no-unnecessary-array-map-identity')
const adaptedNoUnnecessaryMathMaxSingle = adaptPluginRule(noUnnecessaryMathMaxSingleRule, 'no-unnecessary-math-max-single')
const adaptedNoUnnecessaryMathCeilInteger = adaptPluginRule(noUnnecessaryMathCeilIntegerRule, 'no-unnecessary-math-ceil-integer')
const adaptedNoUnnecessaryMathRoundInteger = adaptPluginRule(noUnnecessaryMathRoundIntegerRule, 'no-unnecessary-math-round-integer')
const adaptedNoUnnecessaryMathFloorInteger = adaptPluginRule(noUnnecessaryMathFloorIntegerRule, 'no-unnecessary-math-floor-integer')
const adaptedNoUnnecessaryMathAbsPositive = adaptPluginRule(noUnnecessaryMathAbsPositiveRule, 'no-unnecessary-math-abs-positive')
const adaptedNoUnnecessaryForLoop = adaptPluginRule(noUnnecessaryForLoopRule, 'no-unnecessary-for-loop')
const adaptedNoUnnecessaryFindLastIndex = adaptPluginRule(noUnnecessaryFindLastIndexRule, 'no-unnecessary-find-last-index')
const adaptedNoUnnecessaryFindLast = adaptPluginRule(noUnnecessaryFindLastRule, 'no-unnecessary-find-last')
const adaptedNoUnnecessaryFindIndex = adaptPluginRule(noUnnecessaryFindIndexRule, 'no-unnecessary-find-index')
const adaptedNoUnnecessaryFind = adaptPluginRule(noUnnecessaryFindRule, 'no-unnecessary-find')
const adaptedNoUnnecessaryFill = adaptPluginRule(noUnnecessaryFillRule, 'no-unnecessary-fill')
const adaptedNoUnnecessaryFilter = adaptPluginRule(noUnnecessaryFilterRule, 'no-unnecessary-filter')
const adaptedNoUnnecessaryFlat = adaptPluginRule(noUnnecessaryFlatRule, 'no-unnecessary-flat')
const adaptedNoUnnecessaryFlatMap = adaptPluginRule(noUnnecessaryFlatMapRule, 'no-unnecessary-flat-map')
const adaptedNoUnnecessaryForEach = adaptPluginRule(noUnnecessaryForEachRule, 'no-unnecessary-for-each')
const adaptedNoUnnecessaryInitialization = adaptPluginRule(noUnnecessaryInitializationRule, 'no-unnecessary-initialization')
const adaptedNoUnnecessaryIndexOf = adaptPluginRule(noUnnecessaryIndexOfRule, 'no-unnecessary-index-of')
const adaptedNoUnnecessaryArrayIndexofZero = adaptPluginRule(noUnnecessaryArrayIndexofZeroRule, 'no-unnecessary-array-indexof-zero')
const adaptedNoUnnecessaryInstanceofArray = adaptPluginRule(noUnnecessaryInstanceofArrayRule, 'no-unnecessary-instanceof-array')
const adaptedNoUnnecessaryNullWithStrict = adaptPluginRule(noUnnecessaryNullWithStrictRule, 'no-unnecessary-null-with-strict')
const adaptedNoUnnecessaryObjectAssign = adaptPluginRule(noUnnecessaryObjectAssignRule, 'no-unnecessary-object-assign')
const adaptedNoUnnecessaryObjectAssignSame = adaptPluginRule(noUnnecessaryObjectAssignSameRule, 'no-unnecessary-object-assign-same')
const adaptedNoUnnecessaryObjectFreezeLiteral = adaptPluginRule(noUnnecessaryObjectFreezeLiteralRule, 'no-unnecessary-object-freeze-literal')
const adaptedNoUnnecessaryObjectKeysLength = adaptPluginRule(noUnnecessaryObjectKeysLengthRule, 'no-unnecessary-object-keys-length')
const adaptedNoUnnecessaryObjectSealLiteral = adaptPluginRule(noUnnecessaryObjectSealLiteralRule, 'no-unnecessary-object-seal-literal')
const adaptedNoUnnecessaryNumericLiteral = adaptPluginRule(noUnnecessaryNumericLiteralRule, 'no-unnecessary-numeric-literal')
const adaptedNoUnnecessaryNumericSeparator = adaptPluginRule(noUnnecessaryNumericSeparatorRule, 'no-unnecessary-numeric-separator')
const adaptedNoUnnecessaryQualifier = adaptPluginRule(
  noUnnecessaryQualifierRule,
  'no-unnecessary-qualifier',
)
const adaptedNoUnnecessaryReadonly = adaptPluginRule(noUnnecessaryReadonlyRule, 'no-unnecessary-readonly')
const adaptedNoUnnecessaryRegexConstructor = adaptPluginRule(noUnnecessaryRegexConstructorRule, 'no-unnecessary-regex-constructor')
const adaptedNoUnnecessaryRegex = adaptPluginRule(noUnnecessaryRegexRule, 'no-unnecessary-regex')
const adaptedNoUnnecessaryReturnAwait = adaptPluginRule(noUnnecessaryReturnAwaitRule, 'no-unnecessary-return-await')
const adaptedNoUnnecessaryReturnValue = adaptPluginRule(noUnnecessaryReturnValueRule, 'no-unnecessary-return-value')
const adaptedNoUnnecessaryReduce = adaptPluginRule(noUnnecessaryReduceRule, 'no-unnecessary-reduce')
const adaptedNoUnnecessaryReduceRight = adaptPluginRule(noUnnecessaryReduceRightRule, 'no-unnecessary-reduce-right')
const adaptedNoUnnecessaryRegexpConstructor = adaptPluginRule(noUnnecessaryRegexpConstructorRule, 'no-unnecessary-regexp-constructor')
const adaptedNoUnnecessaryReverse = adaptPluginRule(noUnnecessaryReverseRule, 'no-unnecessary-reverse')
const adaptedNoUnnecessaryArrayReverseNoUse = adaptPluginRule(noUnnecessaryArrayReverseNoUseRule, 'no-unnecessary-array-reverse-no-use')
const adaptedNoUnnecessaryNumberToFixed = adaptPluginRule(noUnnecessaryNumberToFixedRule, 'no-unnecessary-number-to-fixed')
const adaptedNoUnnecessaryNumberTofixedZero = adaptPluginRule(noUnnecessaryNumberTofixedZeroRule, 'no-unnecessary-number-tofixed-zero')
const adaptedNoUnnecessaryNumberWrapper = adaptPluginRule(noUnnecessaryNumberWrapperRule, 'no-unnecessary-number-wrapper')
const adaptedNoUnnecessaryNumberConstructor = adaptPluginRule(noUnnecessaryNumberConstructorRule, 'no-unnecessary-number-constructor')
const adaptedNoUnnecessaryNumberIsnanLiteral = adaptPluginRule(noUnnecessaryNumberIsnanLiteralRule, 'no-unnecessary-number-isnan-literal')
const adaptedNoUnnecessaryJoin = adaptPluginRule(noUnnecessaryJoinRule, 'no-unnecessary-join')
const adaptedNoUnnecessarySort = adaptPluginRule(noUnnecessarySortRule, 'no-unnecessary-sort')
const adaptedNoUnnecessaryArraySortNoUse = adaptPluginRule(noUnnecessaryArraySortNoUseRule, 'no-unnecessary-array-sort-no-use')
const adaptedNoUnnecessaryArraySomeFalse = adaptPluginRule(noUnnecessaryArraySomeFalseRule, 'no-unnecessary-array-some-false')
const adaptedNoUnnecessaryIncludes = adaptPluginRule(noUnnecessaryIncludesRule, 'no-unnecessary-includes')
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
const adaptedNoImplicitMap = adaptPluginRule(noImplicitMapRule, 'no-implicit-map')
const adaptedNoMisusedPromises = noMisusedPromisesRule
const adaptedNoLoneBlocks = adaptPluginRule(noLoneBlocksRule, 'no-lone-blocks')
const adaptedNoLonelyIf = adaptPluginRule(noLonelyIfRule, 'no-lonely-if')
const adaptedNoLabelVar = adaptPluginRule(noLabelVarRule, 'no-label-var')
const adaptedNoLossOfPrecision = adaptPluginRule(noLossOfPrecisionRule, 'no-loss-of-precision')
const adaptedNoMultiAssign = adaptPluginRule(noMultiAssignRule, 'no-multi-assign')
const adaptedNoMultipleEmptyLines = adaptPluginRule(noMultipleEmptyLinesRule, 'no-multiple-empty-lines')
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
const adaptedNoAsyncForeach = adaptPluginRule(noAsyncForeachRule, 'no-async-foreach')
const adaptedNoCompareNegZero = adaptPluginRule(noCompareNegZeroRule, 'no-compare-neg-zero')
const adaptedNoCommutativeOpEqual = adaptPluginRule(noCommutativeOpEqualRule, 'no-commutative-op-equal')
const adaptedNoComputedKeys = adaptPluginRule(noComputedKeysRule, 'no-computed-keys')
const adaptedNoConfusingVoidExpression = adaptPluginRule(
  noConfusingVoidExpressionRule,
  'no-confusing-void-expression',
)
const adaptedNoConfusingArrow = adaptPluginRule(noConfusingArrowRule, 'no-confusing-arrow')
const adaptedNoConstantCondition = adaptPluginRule(noConstantConditionRule, 'no-constant-condition')
const adaptedNoConstAssign = adaptPluginRule(noConstAssignRule, 'no-const-assign')
const adaptedNoDuplicateImports = adaptPluginRule(noDuplicateImportsRule, 'no-duplicate-imports')
const adaptedNoElseReturn = adaptPluginRule(noElseReturnRule, 'no-else-return')
const adaptedNoEmpty = adaptPluginRule(noEmptyRule, 'no-empty')
const adaptedNoNestedTernary = adaptPluginRule(noNestedTernaryRule, 'no-nested-ternary')
const adaptedNoNonNullAssertion = adaptPluginRule(noNonNullAssertionRule, 'no-non-null-assertion')
const adaptedNoObjectConstructor = adaptPluginRule(noObjectConstructorRule, 'no-object-constructor')
const adaptedNoParamReassign = adaptPluginRule(noParamReassignRule, 'no-param-reassign')
const adaptedNoPlusplus = adaptPluginRule(noPlusplusRule, 'no-plusplus')
const adaptedNoPromiseAsBoolean = adaptPluginRule(noPromiseAsBooleanRule, 'no-promise-as-boolean')
const adaptedNoShadow = adaptPluginRule(noShadowRule, 'no-shadow')
const adaptedNoScriptUrl = adaptPluginRule(noScriptUrlRule, 'no-script-url')
const adaptedNoStringConcat = adaptPluginRule(noStringConcatRule, 'no-string-concat')
const adaptedNoStringCaseConvert = adaptPluginRule(noStringCaseConvertRule, 'no-string-case-convert')
const adaptedNoSuspiciousComment = adaptPluginRule(noSuspiciousCommentRule, 'no-suspicious-comment')
const adaptedNoTabs = adaptPluginRule(noTabsRule, 'no-tabs')
const adaptedNoUnnecessaryTemplateExpression = adaptPluginRule(
  noUnnecessaryTemplateExpressionRule,
  'no-unnecessary-template-expression',
)
const adaptedNoUnnecessaryTemplateLiteral = adaptPluginRule(noUnnecessaryTemplateLiteralRule, 'no-unnecessary-template-literal')
const adaptedNoUnnecessaryTemplateLiteralSingle = adaptPluginRule(noUnnecessaryTemplateLiteralSingleRule, 'no-unnecessary-template-literal-single')
const adaptedNoUnnecessaryToReversed = adaptPluginRule(noUnnecessaryToReversedRule, 'no-unnecessary-to-reversed')
const adaptedNoUnnecessaryToSpliced = adaptPluginRule(noUnnecessaryToSplicedRule, 'no-unnecessary-to-spliced')
const adaptedNoUnnecessaryToSorted = adaptPluginRule(noUnnecessaryToSortedRule, 'no-unnecessary-to-sorted')
const adaptedNoUnnecessaryThen = adaptPluginRule(noUnnecessaryThenRule, 'no-unnecessary-then')
const adaptedNoUnnecessaryThrowNew = adaptPluginRule(noUnnecessaryThrowNewRule, 'no-unnecessary-throw-new')
const adaptedNoUnnecessaryToString = adaptPluginRule(noUnnecessaryToStringRule, 'no-unnecessary-to-string')
const adaptedNoUnnecessaryToLocaleString = adaptPluginRule(noUnnecessaryToLocaleStringRule, 'no-unnecessary-to-locale-string')
const adaptedNoUnnecessaryTypeof = adaptPluginRule(noUnnecessaryTypeofRule, 'no-unnecessary-typeof')
const adaptedNoUnnecessaryTypeofString = adaptPluginRule(noUnnecessaryTypeofStringRule, 'no-unnecessary-typeof-string')
const adaptedNoUnnecessaryTypeofNumber = adaptPluginRule(noUnnecessaryTypeofNumberRule, 'no-unnecessary-typeof-number')
const adaptedNoUnnecessaryTypeofBoolean = adaptPluginRule(noUnnecessaryTypeofBooleanRule, 'no-unnecessary-typeof-boolean')
const adaptedNoUnnecessaryUndefinedReturn = adaptPluginRule(noUnnecessaryUndefinedReturnRule, 'no-unnecessary-undefined-return')
const adaptedNoUnnecessaryNullCheck = adaptPluginRule(noUnnecessaryNullCheckRule, 'no-unnecessary-null-check')
const adaptedNoUnnecessaryNullCoalesceFallback = adaptPluginRule(noUnnecessaryNullCoalesceFallbackRule, 'no-unnecessary-null-coalesce-fallback')
const adaptedNoUnnecessaryOptionalChain = adaptPluginRule(noUnnecessaryOptionalChainRule, 'no-unnecessary-optional-chain')
const adaptedNoUnnecessaryOptionalCall = adaptPluginRule(noUnnecessaryOptionalCallRule, 'no-unnecessary-optional-call')
const adaptedNoUnnecessaryParameterProperty = adaptPluginRule(noUnnecessaryParameterPropertyRule, 'no-unnecessary-parameter-property')
const adaptedNoUnnecessaryPromiseWrap = adaptPluginRule(noUnnecessaryPromiseWrapRule, 'no-unnecessary-promise-wrap')
const adaptedNoUnnecessaryPromiseResolve = adaptPluginRule(noUnnecessaryPromiseResolveRule, 'no-unnecessary-promise-resolve')
const adaptedNoUnnecessaryPromiseAll = adaptPluginRule(noUnnecessaryPromiseAllRule, 'no-unnecessary-promise-all')
const adaptedNoUnnecessaryPromiseReject = adaptPluginRule(noUnnecessaryPromiseRejectRule, 'no-unnecessary-promise-reject')
const adaptedNoUnnecessaryEscape = adaptPluginRule(noUnnecessaryEscapeRule, 'no-unnecessary-escape')
const adaptedNoUnnecessaryElse = adaptPluginRule(noUnnecessaryElseRule, 'no-unnecessary-else')
const adaptedNoUnnecessaryEvery = adaptPluginRule(noUnnecessaryEveryRule, 'no-unnecessary-every')
const adaptedNoUnnecessaryConstructor = adaptPluginRule(noUnnecessaryConstructorRule, 'no-unnecessary-constructor')
const adaptedNoUnnecessaryTernary = adaptPluginRule(noUnnecessaryTernaryRule, 'no-unnecessary-ternary')
const adaptedNoUnnecessaryTernaryBoolean = adaptPluginRule(noUnnecessaryTernaryBooleanRule, 'no-unnecessary-ternary-boolean')
const adaptedNoUnnecessaryTernaryAssign = adaptPluginRule(noUnnecessaryTernaryAssignRule, 'no-unnecessary-ternary-assign')
const adaptedNoUnusedVars = adaptPluginRule(noUnusedVarsRule, 'no-unused-vars')
const adaptedNoUnusedPrivateMembers = adaptPluginRule(
  noUnusedPrivateMembersRule,
  'no-unused-private-members',
)
const adaptedNoVoid = adaptPluginRule(noVoidRule, 'no-void')
const adaptedNoWarningComments = adaptPluginRule(noWarningCommentsRule, 'no-warning-comments')
const adaptedPreferExponentiationOperator = adaptPluginRule(
  preferExponentiationOperatorRule,
  'prefer-exponentiation-operator',
)
const adaptedPreferNumberProperties = adaptPluginRule(
  preferNumberPropertiesRule,
  'prefer-number-properties',
)
const adaptedPreferNumberIsnan = adaptPluginRule(preferNumberIsnanRule, 'prefer-number-isnan')
const adaptedPreferNumberIsFinite = adaptPluginRule(preferNumberIsfiniteRule, 'prefer-number-isfinite')
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
const adaptedNoTypeAliasSingleUnion = adaptPluginRule(noTypeAliasSingleUnionRule, 'no-type-alias-single-union')
const adaptedNoUnicodeBom = adaptPluginRule(noUnicodeBomRule, 'no-unicode-bom')

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
const adaptedNoUnnecessaryShift = adaptPluginRule(noUnnecessaryShiftRule, 'no-unnecessary-shift')
const adaptedNoUnnecessarySlice = adaptPluginRule(noUnnecessarySliceRule, 'no-unnecessary-slice')
const adaptedNoUnnecessaryArraySliceZero = adaptPluginRule(noUnnecessaryArraySliceZeroRule, 'no-unnecessary-array-slice-zero')
const adaptedNoUnnecessarySome = adaptPluginRule(noUnnecessarySomeRule, 'no-unnecessary-some')
const adaptedNoUnnecessarySplice = adaptPluginRule(noUnnecessarySpliceRule, 'no-unnecessary-splice')
const adaptedNoUnnecessarySpread = adaptPluginRule(noUnnecessarySpreadRule, 'no-unnecessary-spread')
const adaptedNoUnnecessarySpreadArray = adaptPluginRule(noUnnecessarySpreadArrayRule, 'no-unnecessary-spread-array')
const adaptedNoUnnecessaryStringConcat = adaptPluginRule(
noUnnecessaryStringConcatRule,
  'no-unnecessary-string-concat',
)
const adaptedNoUnnecessaryStringConstructor = adaptPluginRule(noUnnecessaryStringConstructorRule, 'no-unnecessary-string-constructor')
const adaptedNoUnnecessaryStringCharAtZero = adaptPluginRule(noUnnecessaryStringCharAtZeroRule, 'no-unnecessary-string-char-at-zero')
const adaptedNoUnnecessaryStringAtZero = adaptPluginRule(noUnnecessaryStringAtZeroRule, 'no-unnecessary-string-at-zero')
const adaptedNoUnnecessaryStringCodepointatZero = adaptPluginRule(noUnnecessaryStringCodepointatZeroRule, 'no-unnecessary-string-codepointat-zero')
const adaptedNoUnnecessaryStringLengthCompare = adaptPluginRule(noUnnecessaryStringLengthCompareRule, 'no-unnecessary-string-length-compare')
const adaptedNoUnnecessaryStringWrapper = adaptPluginRule(noUnnecessaryStringWrapperRule, 'no-unnecessary-string-wrapper')
const adaptedNoUnnecessaryStringify = adaptPluginRule(noUnnecessaryStringifyRule, 'no-unnecessary-stringify')
const adaptedNoUnnecessaryStringToNumber = adaptPluginRule(noUnnecessaryStringToNumberRule, 'no-unnecessary-string-to-number')
const adaptedNoUnnecessaryParseFloat = adaptPluginRule(noUnnecessaryParseFloatRule, 'no-unnecessary-parse-float')
const adaptedNoUnnecessaryParseInt = adaptPluginRule(noUnnecessaryParseIntRule, 'no-unnecessary-parse-int')
const adaptedNoUnnecessaryParseIntRadixTen = adaptPluginRule(noUnnecessaryParseIntRadixTenRule, 'no-unnecessary-parse-int-radix-ten')
const adaptedNoUnnecessaryIsFinite = adaptPluginRule(noUnnecessaryIsFiniteRule, 'no-unnecessary-is-finite')
const adaptedNoUnnecessaryIsNan = adaptPluginRule(noUnnecessaryIsNanRule, 'no-unnecessary-is-nan')
const adaptedNoUnnecessaryDecodeUri = adaptPluginRule(noUnnecessaryDecodeUriRule, 'no-unnecessary-decode-uri')
const adaptedNoUnnecessaryDelete = adaptPluginRule(noUnnecessaryDeleteRule, 'no-unnecessary-delete')
const adaptedNoUnnecessaryEncodeUri = adaptPluginRule(noUnnecessaryEncodeUriRule, 'no-unnecessary-encode-uri')
const adaptedNoUnnecessaryStringSplit = adaptPluginRule(noUnnecessaryStringSplitRule, 'no-unnecessary-string-split')
const adaptedNoUnnecessaryStringSplitEmptySeparator = adaptPluginRule(noUnnecessaryStringSplitEmptySeparatorRule, 'no-unnecessary-string-split-empty-separator')
const adaptedNoUnnecessaryStringStartsEmpty = adaptPluginRule(noUnnecessaryStringStartsEmptyRule, 'no-unnecessary-string-starts-empty')
const adaptedNoUnnecessaryStringTrimEmpty = adaptPluginRule(noUnnecessaryStringTrimEmptyRule, 'no-unnecessary-string-trim-empty')
const adaptedNoUnnecessaryStringReplaceAll = adaptPluginRule(noUnnecessaryStringReplaceAllRule, 'no-unnecessary-string-replace-all')
const adaptedNoUnnecessaryStringRepeatZero = adaptPluginRule(noUnnecessaryStringRepeatZeroRule, 'no-unnecessary-string-repeat-zero')
const adaptedNoUnnecessaryTypeArguments = adaptPluginRule(
  noUnnecessaryTypeArgumentsRule,
  'no-unnecessary-type-arguments',
)
const adaptedNoUnsafeAssignment = adaptPluginRule(noUnsafeAssignmentRule, 'no-unsafe-assignment')
const adaptedNoUselessFallbackInSpread = adaptPluginRule(
  noUselessFallbackInSpreadRule,
  'no-useless-fallback-in-spread',
)
const adaptedNoUselessUndefined = adaptPluginRule(noUselessUndefinedRule, 'no-useless-undefined')
const adaptedNoUselessReturn = adaptPluginRule(noUselessReturnRule, 'no-useless-return')
 const adaptedNoUselessSwitch = adaptPluginRule(noUselessSwitchRule, 'no-useless-switch')
 const adaptedNoUselessTypeConversion = adaptPluginRule(noUselessTypeConversionRule, 'no-useless-type-conversion')
 const adaptedPreferArrayFlat = adaptPluginRule(preferArrayFlatRule, 'prefer-array-flat')
const adaptedPreferAtContext = adaptPluginRule(preferAtContextRule, 'prefer-at-context')
const adaptedPreferAtMethod = adaptPluginRule(preferAtMethodRule, 'prefer-at-method')
const adaptedPreferEnumInitializers = adaptPluginRule(
  preferEnumInitializersRule,
  'prefer-enum-initializers',
)
const adaptedPreferDestructuring = adaptPluginRule(preferDestructuringRule, 'prefer-destructuring')
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
const adaptedNoIdenticalTitle = adaptPluginRule(noIdenticalTitleRule, 'no-identical-title')
const adaptedNoInterpolationInSnapshots = adaptPluginRule(noInterpolationInSnapshotsRule, 'no-interpolation-in-snapshots')
const adaptedNoJestGlobals = adaptPluginRule(noJestGlobalsRule, 'no-jest-globals')
const adaptedNoLargeJestSnapshots = adaptPluginRule(noLargeJestSnapshotsRule, 'no-large-jest-snapshots')
const adaptedNoRedundantAction = adaptPluginRule(noRedundantActionRule, 'no-redundant-action')
const adaptedNoEmptyCatch = adaptPluginRule(noEmptyCatchRule, 'no-empty-catch')
const adaptedNoUselessCatch = adaptPluginRule(noUselessCatchRule, 'no-useless-catch')
const adaptedNoInvalidUseBeforeDef = adaptPluginRule(noInvalidUseBeforeDefRule, 'no-invalid-use-before-def')
const adaptedNoImplicitGlobals = adaptPluginRule(noImplicitGlobalsRule, 'no-implicit-globals')
const adaptedNoNonNullAssertedOptionalChain = adaptPluginRule(noNonNullAssertedOptionalChainRule, 'no-non-null-asserted-optional-chain')
const adaptedNoMisleadingSpread = adaptPluginRule(noMisleadingSpreadRule, 'no-misleading-spread')
const adaptedNoAsyncConstructor = adaptPluginRule(noAsyncConstructorRule, 'no-async-constructor')
const adaptedNoApproximateConstants = adaptPluginRule(noApproximateConstantsRule, 'no-approximate-constants')
const adaptedNoImplicitUndefined = adaptPluginRule(noImplicitUndefinedRule, 'no-implicit-undefined')
const adaptedNoMisleadingAssertion = adaptPluginRule(noMisleadingAssertionRule, 'no-misleading-assertion')
const adaptedNoPropertyRename = adaptPluginRule(noPropertyRenameRule, 'no-property-rename')
const adaptedNoPropertySignatureStyle = adaptPluginRule(noPropertySignatureStyleRule, 'no-property-signature-style')
const adaptedNoRedeclare = adaptPluginRule(noRedeclareRule, 'no-redeclare')
const adaptedNoUselessPromise = adaptPluginRule(noUselessPromiseRule, 'no-useless-promise')
const adaptedNoUselessRename = adaptPluginRule(noUselessRenameRule, 'no-useless-rename')
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
const adaptedNoBufferConstructor = adaptPluginRule(noBufferConstructorRule, 'no-buffer-constructor')
const adaptedNoCaller = adaptPluginRule(noCallerRule, 'no-caller')
const adaptedNoCatchShadow = adaptPluginRule(noCatchShadowRule, 'no-catch-shadow')
const adaptedNoCaseDeclarations = adaptPluginRule(noCaseDeclarationsRule, 'no-case-declarations')
const adaptedNoClassAssign = adaptPluginRule(noClassAssignRule, 'no-class-assign')
const adaptedNoCondAssign = adaptPluginRule(noCondAssignRule, 'no-cond-assign')
const adaptedNoConstructorReturn = adaptPluginRule(noConstructorReturnRule, 'no-constructor-return')
const adaptedNoConstructorSuper = adaptPluginRule(noConstructorSuperRule, 'no-constructor-super')
const adaptedNoContinue = adaptPluginRule(noContinueRule, 'no-continue')
const adaptedNoControlRegex = adaptPluginRule(noControlRegexRule, 'no-control-regex')
const adaptedNoDivRegex = adaptPluginRule(noDivRegexRule, 'no-div-regex')
const adaptedNoDoubleNegation = adaptPluginRule(noDoubleNegationRule, 'no-double-negation')
const adaptedNoDupeArgs = adaptPluginRule(noDupeArgsRule, 'no-dupe-args')
const adaptedNoDupeClassMembers = adaptPluginRule(noDupeClassMembersRule, 'no-dupe-class-members')
const adaptedNoDupeKeys = adaptPluginRule(noDupeKeysRule, 'no-dupe-keys')
const adaptedNoDuplicateCase = adaptPluginRule(noDuplicateCaseRule, 'no-duplicate-case')
const adaptedNoEmptyPattern = adaptPluginRule(noEmptyPatternRule, 'no-empty-pattern')
const adaptedNoEmptyStaticBlock = adaptPluginRule(noEmptyStaticBlockRule, 'no-empty-static-block')
const adaptedNoEqNull = adaptPluginRule(noEqNullRule, 'no-eq-null')
const adaptedNoExAssign = adaptPluginRule(noExAssignRule, 'no-ex-assign')
const adaptedNoExportDefault = adaptPluginRule(noExportDefaultRule, 'no-export-default')
const adaptedNoExtendNative = adaptPluginRule(noExtendNativeRule, 'no-extend-native')
const adaptedNoExtraBooleanCast = adaptPluginRule(noExtraBooleanCastRule, 'no-extra-boolean-cast')
const adaptedNoExtraParens = adaptPluginRule(noExtraParensRule, 'no-extra-parens')
const adaptedNoExtraSemi = adaptPluginRule(noExtraSemiRule, 'no-extra-semi')
const adaptedNoFallthrough = adaptPluginRule(noFallthroughRule, 'no-fallthrough')
const adaptedNoFuncAssign = adaptPluginRule(noFuncAssignRule, 'no-func-assign')
const adaptedNoGlobalAssign = adaptPluginRule(noGlobalAssignRule, 'no-global-assign')
const adaptedNoHexEscape = adaptPluginRule(noHexEscapeRule, 'no-hex-escape')
const adaptedNoOctalEscape = adaptPluginRule(noOctalEscapeRule, 'no-octal-escape')
const adaptedNoImportAssign = adaptPluginRule(noImportAssignRule, 'no-import-assign')
const adaptedNoInvalidRegexp = adaptPluginRule(noInvalidRegexpRule, 'no-invalid-regexp')
const adaptedNoIrregularWhitespace = adaptPluginRule(
  noIrregularWhitespaceRule,
  'no-irregular-whitespace',
)
const adaptedNoIterator = adaptPluginRule(noIteratorRule, 'no-iterator')
const adaptedNoLoopFunc = adaptPluginRule(noLoopFuncRule, 'no-loop-func')
const adaptedNoLabels = adaptPluginRule(noLabelsRule, 'no-labels')
const adaptedNoMeaninglessVoid = adaptPluginRule(noMeaninglessVoidRule, 'no-meaningless-void')
const adaptedNoMisleadingArrayMethod = adaptPluginRule(noMisleadingArrayMethodRule, 'no-misleading-array-method')
const adaptedNoMisleadingCharacterClass = adaptPluginRule(
  noMisleadingCharacterClassRule,
  'no-misleading-character-class',
)
const adaptedNoMisleadingInstantiation = adaptPluginRule(noMisleadingInstantiationRule, 'no-misleading-instantiation')
const adaptedNoMisleadingTernary = adaptPluginRule(noMisleadingTernaryRule, 'no-misleading-ternary')
const adaptedNoMixedEnums = adaptPluginRule(noMixedEnumsRule, 'no-mixed-enums')
const adaptedNoMixedOperators = adaptPluginRule(noMixedOperatorsRule, 'no-mixed-operators')
const adaptedNoMisusedNew = adaptPluginRule(noMisusedNewRule, 'no-misused-new')
const adaptedNoMultiStr = adaptPluginRule(noMultiStrRule, 'no-multi-str')
const adaptedNoNewFunc = adaptPluginRule(noNewFuncRule, 'no-new-func')
const adaptedNoNewNativeNonconstructor = adaptPluginRule(
  noNewNativeNonconstructorRule,
  'no-new-native-nonconstructor',
)
const adaptedNoNewWrappers = adaptPluginRule(noNewWrappersRule, 'no-new-wrappers')
const adaptedNoNewSymbol = adaptPluginRule(noNewSymbolRule, 'no-new-symbol')
const adaptedNoNonoctalDecimalEscape = adaptPluginRule(
  noNonoctalDecimalEscapeRule,
  'no-nonoctal-decimal-escape',
)
const adaptedNoObjCalls = adaptPluginRule(noObjCallsRule, 'no-obj-calls')
const adaptedNoOctal = adaptPluginRule(noOctalRule, 'no-octal')
const adaptedNoPrototypeBuiltins = adaptPluginRule(noPrototypeBuiltinsRule, 'no-prototype-builtins')
const adaptedNoRestrictedExports = adaptPluginRule(noRestrictedExportsRule, 'no-restricted-exports')
const adaptedNoRestrictedSyntax = adaptPluginRule(noRestrictedSyntaxRule, 'no-restricted-syntax')
 const adaptedNoReturnAssign = adaptPluginRule(noReturnAssignRule, 'no-return-assign')
const adaptedNoReturnOrAwait = adaptPluginRule(noReturnOrAwaitRule, 'no-return-or-await')
const adaptedNoSelfAssign = adaptPluginRule(noSelfAssignRule, 'no-self-assign')
const adaptedNoSelfCompare = adaptPluginRule(noSelfCompareRule, 'no-self-compare')
const adaptedNoSequences = adaptPluginRule(noSequencesRule, 'no-sequences')
const adaptedNoSetterReturn = adaptPluginRule(noSetterReturnRule, 'no-setter-return')
const adaptedNoShadowRestrictedNames = adaptPluginRule(
  noShadowRestrictedNamesRule,
  'no-shadow-restricted-names',
)
const adaptedNoSparseArrays = adaptPluginRule(noSparseArraysRule, 'no-sparse-arrays')
const adaptedNoStaticOnlyClass = adaptPluginRule(noStaticOnlyClassRule, 'no-static-only-class')
const adaptedNoThenable = adaptPluginRule(noThenableRule, 'no-thenable')
const adaptedNoThisBeforeSuper = adaptPluginRule(noThisBeforeSuperRule, 'no-this-before-super')
const adaptedNoThisAlias = adaptPluginRule(noThisAliasRule, 'no-this-alias')
const adaptedNoUnassignedVars = adaptPluginRule(noUnassignedVarsRule, 'no-unassigned-vars')
const adaptedNoUndef = adaptPluginRule(noUndefRule, 'no-undef')
const adaptedNoUnexpectedMultiline = adaptPluginRule(
  noUnexpectedMultilineRule,
  'no-unexpected-multiline',
)
const adaptedNoUnboundPromise = adaptPluginRule(noUnboundPromiseRule, 'no-unbound-promise')
const adaptedNoUnneededTernary = adaptPluginRule(noUnneededTernaryRule, 'no-unneeded-ternary')
const adaptedNoUnreachable = adaptPluginRule(noUnreachableRule, 'no-unreachable')
const adaptedNoUndefined = adaptPluginRule(noUndefinedRule, 'no-undefined')
const adaptedNoUnderscoreDangle = adaptPluginRule(noUnderscoreDangleRule, 'no-underscore-dangle')
const adaptedNoUnsafeEnumComparison = adaptPluginRule(noUnsafeEnumComparisonRule, 'no-unsafe-enum-comparison')
const adaptedNoUnsafeFinally = adaptPluginRule(noUnsafeFinallyRule, 'no-unsafe-finally')
const adaptedNoUnsafeNegation = adaptPluginRule(noUnsafeNegationRule, 'no-unsafe-negation')
const adaptedNoRequireImports = adaptPluginRule(noRequireImportsRule, 'no-require-imports')
const adaptedNoCompareNegation = adaptPluginRule(noCompareNegationRule, 'no-compare-negation')
const adaptedNoUnsafeOptionalChaining = adaptPluginRule(
  noUnsafeOptionalChainingRule,
  'no-unsafe-optional-chaining',
)
const adaptedNoUnusedExpressions = adaptPluginRule(noUnusedExpressionsRule, 'no-unused-expressions')
const adaptedNoUnusedLabels = adaptPluginRule(noUnusedLabelsRule, 'no-unused-labels')
const adaptedNoUseBeforeDefine = adaptPluginRule(noUseBeforeDefineRule, 'no-use-before-define')
const adaptedNoUseExtendNative = adaptPluginRule(noUseExtendNativeRule, 'no-use-extend-native')
const adaptedNoUselessAssignment = adaptPluginRule(noUselessAssignmentRule, 'no-useless-assignment')
const adaptedNoUselessBackreference = adaptPluginRule(
  noUselessBackreferenceRule,
  'no-useless-backreference',
)
const adaptedNoUselessCall = adaptPluginRule(noUselessCallRule, 'no-useless-call')
const adaptedNoUselessComputedKey = adaptPluginRule(noUselessComputedKeyRule, 'no-useless-computed-key')
const adaptedNoUselessConcat = adaptPluginRule(noUselessConcatRule, 'no-useless-concat')
const adaptedNoUselessEscape = adaptPluginRule(noUselessEscapeRule, 'no-useless-escape')
const adaptedNoUselessExpressionStatement = adaptPluginRule(noUselessExpressionStatementRule, 'no-useless-expression-statement')
const adaptedNoVar = adaptPluginRule(noVarRule, 'no-var')
const adaptedNoWith = adaptPluginRule(noWithRule, 'no-with')
const adaptedNoWhitespaceBeforeProperty = adaptPluginRule(noWhitespaceBeforePropertyRule, 'no-whitespace-before-property')
const adaptedObjectShorthand = adaptPluginRule(objectShorthandRule, 'object-shorthand')
const adaptedPreserveCaughtError = adaptPluginRule(preserveCaughtErrorRule, 'preserve-caught-error')
const adaptedRequireYield = adaptPluginRule(requireYieldRule, 'require-yield')
const adaptedSortKeys = adaptPluginRule(sortKeysRule, 'sort-keys')
const adaptedSortImports = adaptPluginRule(sortImportsRule, 'sort-imports')
const adaptedSpacedComment = adaptPluginRule(spacedCommentRule, 'spaced-comment')
const adaptedStrictBoolExpressions = adaptPluginRule(strictBoolExpressionsRule, 'strict-bool-expressions')
const adaptedUseIsnan = adaptPluginRule(useIsnanRule, 'use-isnan')
const adaptedValidTypeof = adaptPluginRule(validTypeofRule, 'valid-typeof')
const adaptedYoda = adaptPluginRule(yodaRule, 'yoda')
const adaptedNoEmptyCharacterClass = adaptPluginRule(
  noEmptyCharacterClassRule,
  'no-empty-character-class',
)

const adaptedNoCollectionSizeMischeck = adaptPluginRule(noCollectionSizeMischeckRule, 'no-collection-size-mischeck')
const adaptedNoConstEnum = adaptPluginRule(noConstEnumRule, 'no-const-enum')
const adaptedNoDeprecatedImports = adaptPluginRule(noDeprecatedImportsRule, 'no-deprecated-imports')
const adaptedNoDuplicateStringsInArray = adaptPluginRule(noDuplicateStringsInArrayRule, 'no-duplicate-strings-in-array')
const adaptedNoNamespace = adaptPluginRule(noNamespaceRule, 'no-namespace')
const adaptedNoNegatedCondition = adaptPluginRule(noNegatedConditionRule, 'no-negated-condition')
const adaptedNoNegatedEqNull = adaptPluginRule(noNegatedEqNullRule, 'no-negated-eq-null')
const adaptedNoRedundantBoolean = adaptPluginRule(noRedundantBooleanRule, 'no-redundant-boolean')
const adaptedNoRedundantOptionalChain = adaptPluginRule(noRedundantOptionalChainRule, 'no-redundant-optional-chain')
const adaptedNoRedundantUseStrict = adaptPluginRule(noRedundantUseStrictRule, 'no-redundant-use-strict')
const adaptedNoRedundantTypeConstituents = adaptPluginRule(noRedundantTypeConstituentsRule, 'no-redundant-type-constituents')
const adaptedNoRegexSpaces = adaptPluginRule(noRegexSpacesRule, 'no-regex-spaces')
const adaptedNoTemplateCurlyInString = adaptPluginRule(noTemplateCurlyInStringRule, 'no-template-curly-in-string')
const adaptedNoTernary = adaptPluginRule(noTernaryRule, 'no-ternary')
const adaptedNoUnnecessaryPop = adaptPluginRule(noUnnecessaryPopRule, 'no-unnecessary-pop')
const adaptedNoUnnecessaryPolyfills = adaptPluginRule(noUnnecessaryPolyfillsRule, 'no-unnecessary-polyfills')
const adaptedNoUnnecessaryPlusNew = adaptPluginRule(noUnnecessaryPlusNewRule, 'no-unnecessary-plus-new')
const adaptedNoUnnecessaryTypeConstraint = adaptPluginRule(noUnnecessaryTypeConstraintRule, 'no-unnecessary-type-constraint')
const adaptedNoUnnecessaryTypeParameters = adaptPluginRule(noUnnecessaryTypeParametersRule, 'no-unnecessary-type-parameters')
const adaptedNoUnnecessaryUnshift = adaptPluginRule(noUnnecessaryUnshiftRule, 'no-unnecessary-unshift')
const adaptedNoUnnecessaryWith = adaptPluginRule(noUnnecessaryWithRule, 'no-unnecessary-with')
const adaptedNoUnnecessaryValues = adaptPluginRule(noUnnecessaryValuesRule, 'no-unnecessary-values')
const adaptedNoUnnecessaryVoid = adaptPluginRule(noUnnecessaryVoidRule, 'no-unnecessary-void')
const adaptedNoUnnecessaryVoidOperator = adaptPluginRule(noUnnecessaryVoidOperatorRule, 'no-unnecessary-void-operator')
const adaptedNoUnnecessaryYield = adaptPluginRule(noUnnecessaryYieldRule, 'no-unnecessary-yield')
const adaptedNoUnnecessaryWait = adaptPluginRule(noUnnecessaryWaitRule, 'no-unnecessary-wait')
const adaptedNoUtilityTruthiness = adaptPluginRule(noUtilityTruthinessRule, 'no-utility-truthiness')
const adaptedPreferSingleBooleanReturn = adaptPluginRule(preferSingleBooleanReturnRule, 'prefer-single-boolean-return')
const adaptedExpectExpect = adaptPluginRule(expectExpectRule, 'expect-expect')
const adaptedNoConditionalExpect = adaptPluginRule(noConditionalExpectRule, 'no-conditional-expect')
const adaptedNoConfusingDoubleEqual = adaptPluginRule(noConfusingDoubleEqualRule, 'no-confusing-double-equal')
const adaptedNoAssigningExpectResult = adaptPluginRule(noAssigningExpectResultRule, 'no-assigning-expect-result')
const adaptedNoAssigningHooksReturn = adaptPluginRule(noAssigningHooksReturnRule, 'no-assigning-hooks-return')
const adaptedNoDynamicDescribe = adaptPluginRule(noDynamicDescribeRule, 'no-dynamic-describe')
const adaptedNoEmptyHook = adaptPluginRule(noEmptyHookRule, 'no-empty-hook')
const adaptedNoConfusingTestName = adaptPluginRule(noConfusingTestNameRule, 'no-confusing-test-name')
const adaptedNoEvalInTest = adaptPluginRule(noEvalInTestRule, 'no-eval-in-test')
const adaptedNoMisusedMatchers = adaptPluginRule(noMisusedMatchersRule, 'no-misused-matchers')
const adaptedNoConfusingConditionalAccess = adaptPluginRule(noConfusingConditionalAccessRule, 'no-confusing-conditional-access')
const adaptedNoConditionalInTest = adaptPluginRule(noConditionalInTestRule, 'no-conditional-in-test')
const adaptedNoConsoleInTests = adaptPluginRule(noConsoleInTestsRule, 'no-console-in-tests')
const adaptedNoDeprecatedFunctions = adaptPluginRule(noDeprecatedFunctionsRule, 'no-deprecated-functions')
const adaptedNoDoneCallback = adaptPluginRule(noDoneCallbackRule, 'no-done-callback')
const adaptedNoAsyncSuite = adaptPluginRule(noAsyncSuiteRule, 'no-async-suite')
const adaptedNoAssertionInSetup = adaptPluginRule(noAssertionInSetupRule, 'no-assertion-in-setup')
const adaptedNoAssertionInLoop = adaptPluginRule(noAssertionInLoopRule, 'no-assertion-in-loop')
const adaptedNoAssertTruthiness = adaptPluginRule(noAssertTruthinessRule, 'no-assert-truthiness')
const adaptedNoCommentedOutTests = adaptPluginRule(noCommentedOutTestsRule, 'no-commented-out-tests')
const adaptedNoTestReturnStatement = adaptPluginRule(noTestReturnStatementRule, 'no-test-return-statement')
const adaptedNoUselessAsyncTest = adaptPluginRule(noUselessAsyncTestRule, 'no-useless-async-test')
const adaptedNoUnsafeMatchers = adaptPluginRule(noUnsafeMatchersRule, 'no-unsafe-matchers')
const adaptedNoMisplacedHook = adaptPluginRule(noMisplacedHookRule, 'no-misplaced-hook')
const adaptedRequireHookDescription = adaptPluginRule(requireHookDescriptionRule, 'require-hook-description')
const adaptedNoAsyncSnapshot = adaptPluginRule(noAsyncSnapshotRule, 'no-async-snapshot')
const adaptedNoAsyncSetup = adaptPluginRule(noAsyncSetupRule, 'no-async-setup')
const adaptedRequireTopLevelDescribe = adaptPluginRule(requireTopLevelDescribeRule, 'require-top-level-describe')
const adaptedValidTitle = adaptPluginRule(validTitleRule, 'valid-title')
const adaptedValidExpect = adaptPluginRule(validExpectRule, 'valid-expect')
const adaptedMaxNestedDescribe = adaptPluginRule(maxNestedDescribeRule, 'max-nested-describe')
const adaptedMaxExpects = adaptPluginRule(maxExpectsRule, 'max-expects')
const adaptedNoAliasMethods = adaptPluginRule(noAliasMethodsRule, 'no-alias-methods')
const adaptedNoRestrictedMatchers = adaptPluginRule(noRestrictedMatchersRule, 'no-restricted-matchers')
const adaptedNoRestrictedJestMethods = adaptPluginRule(noRestrictedJestMethodsRule, 'no-restricted-jest-methods')
const adaptedConsistentTestIt = adaptPluginRule(consistentTestItRule, 'consistent-test-it')
const adaptedNoDuplicateHooks = adaptPluginRule(noDuplicateHooksRule, 'no-duplicate-hooks')
const adaptedNoEmptyDescribe = adaptPluginRule(noEmptyDescribeRule, 'no-empty-describe')
const adaptedNoStandaloneExpect = adaptPluginRule(noStandaloneExpectRule, 'no-standalone-expect')
const adaptedNoTestPrefix = adaptPluginRule(noTestPrefixRule, 'no-test-prefix')
const adaptedPreferHooksOnTop = adaptPluginRule(preferHooksOnTopRule, 'prefer-hooks-on-top')
const adaptedPreferInlineSnapshot = adaptPluginRule(preferInlineSnapshotRule, 'prefer-inline-snapshot')
const adaptedPreferLiteralMatchers = adaptPluginRule(preferLiteralMatchersRule, 'prefer-literal-matchers')
const adaptedPreferMockPromiseShorthand = adaptPluginRule(preferMockPromiseShorthandRule, 'prefer-mock-promise-shorthand')
const adaptedPreferMockReturnValue = adaptPluginRule(preferMockReturnValueRule, 'prefer-mock-return-value')
const adaptedPreferResolvesRejects = adaptPluginRule(preferResolvesRejectsRule, 'prefer-resolves-rejects')
const adaptedNoRedundantExpect = adaptPluginRule(noRedundantExpectRule, 'no-redundant-expect')
const adaptedPreferNamedSnapshot = adaptPluginRule(preferNamedSnapshotRule, 'prefer-named-snapshot')
const adaptedPreferSnapshotHint = adaptPluginRule(preferSnapshotHintRule, 'prefer-snapshot-hint')
const adaptedPreferCalledWith = adaptPluginRule(preferCalledWithRule, 'prefer-called-with')
const adaptedPreferEqualityMatcher = adaptPluginRule(preferEqualityMatcherRule, 'prefer-equality-matcher')
const adaptedPreferEach = adaptPluginRule(preferEachRule, 'prefer-each')
const adaptedPreferExpectResolves = adaptPluginRule(preferExpectResolvesRule, 'prefer-expect-resolves')
const adaptedPreferExpectAssertions = adaptPluginRule(preferExpectAssertionsRule, 'prefer-expect-assertions')
const adaptedNoMisusedAsync = adaptPluginRule(noMisusedAsyncRule, 'no-misused-async')
const adaptedNoNestedDescribe = adaptPluginRule(noNestedDescribeRule, 'no-nested-describe')
const adaptedNoInefficientArrayMethods = adaptPluginRule(noInefficientArrayMethodsRule, 'no-inefficient-array-methods')
const adaptedNoImplicitReturnInTest = adaptPluginRule(noImplicitReturnInTestRule, 'no-implicit-return-in-test')
const adaptedPreferSpyOn = adaptPluginRule(preferSpyOnRule, 'prefer-spy-on')
const adaptedPreferStrictEqual = adaptPluginRule(preferStrictEqualRule, 'prefer-strict-equal')
const adaptedPreferToBe = adaptPluginRule(preferToBeRule, 'prefer-to-be')
const adaptedPreferToBeNull = adaptPluginRule(preferToBeNullRule, 'prefer-to-be-null')
const adaptedPreferToBeUndefined = adaptPluginRule(preferToBeUndefinedRule, 'prefer-to-be-undefined')
const adaptedPreferToContain = adaptPluginRule(preferToContainRule, 'prefer-to-contain')
const adaptedPreferToHaveLength = adaptPluginRule(preferToHaveLengthRule, 'prefer-to-have-length')
const adaptedPreferTodo = adaptPluginRule(preferTodoRule, 'prefer-todo')
const adaptedRequireHook = adaptPluginRule(requireHookRule, 'require-hook')
const adaptedRequireToThrowMessage = adaptPluginRule(requireToThrowMessageRule, 'require-to-throw-message')

export const allRules: Record<string, RuleDefinition> = {
  'consistent-imports': adaptedConsistentImports,
  'consistent-test-it': adaptedConsistentTestIt,
  // Patterns
  'consistent-type-exports': adaptedConsistentTypeExports,
  // Orphan pattern rules
  'constructor-super': adaptedConstructorSuper,
  curly: adaptedCurly,
  'default-case': adaptedDefaultCase,
  // Patterns
  'eq-eq-eq': adaptedEqEqEq,
  'expect-expect': adaptedExpectExpect,
  'explicit-module-boundary-types': adaptedExplicitModuleBoundaryTypes,
  // Orphan rules - best practices (native)
  'explicit-return-type': explicitReturnTypeRule,
  'for-direction': adaptedForDirection,
  'getter-return': adaptedGetterReturn,
  // Complexity
  'max-complexity': maxComplexityRule,
  'max-depth': maxDepthRule,
  'max-expects': adaptedMaxExpects,
  'max-file-size': adaptedMaxFileSize,
  'max-lines': maxLinesRule,
  'max-lines-per-function': maxLinesPerFunctionRule,
  'max-nested-describe': adaptedMaxNestedDescribe,
  'max-params': maxParamsRule,
  'max-union-size': adaptedMaxUnionSize,
  'no-alert': adaptedNoAlert,
  'no-alias-methods': adaptedNoAliasMethods,
   'no-array-constructor': adaptedNoArrayConstructor,
   'no-array-reduce': adaptedNoArrayReduce,
    'no-inefficient-string-concat': adaptedNoInefficientStringConcat,
    'no-constant-response': adaptedNoConstantResponse,
    'no-unnecessary-async': adaptedNoUnnecessaryAsync,
    'no-misused-promise-return': adaptedNoMisusedPromiseReturn,
    // Orphan rules - previously defined but not registered
   'no-array-destructuring': adaptedNoArrayDestructuring,
  'no-assertion-in-setup': adaptedNoAssertionInSetup,
  'no-assertion-in-loop': adaptedNoAssertionInLoop,
  'no-assert-truthiness': adaptedNoAssertTruthiness,
  'no-async-promise-executor': adaptedNoAsyncPromiseExecutor,
  'no-async-foreach': adaptedNoAsyncForeach,
  'no-async-suite': adaptedNoAsyncSuite,
  'no-async-without-await': adaptedNoAsyncWithoutAwait,
  // Performance
  'no-await-in-loop': noAwaitInLoopRule,
  'no-inefficient-array-methods': adaptedNoInefficientArrayMethods,
  'no-barrel-imports': adaptedNoBarrelImports,
  'no-bitwise': adaptedNoBitwise,
  'no-buffer-constructor': adaptedNoBufferConstructor,
  'no-caller': adaptedNoCaller,
  'no-catch-shadow': adaptedNoCatchShadow,
  'no-case-declarations': adaptedNoCaseDeclarations,
  // Dependencies
  'no-circular-deps': adaptedNoCircularDeps,
  'no-class-assign': adaptedNoClassAssign,
  'no-collection-size-mischeck': adaptedNoCollectionSizeMischeck,
  'no-commented-out-tests': adaptedNoCommentedOutTests,
  'no-compare-neg-zero': adaptedNoCompareNegZero,
  'no-commutative-op-equal': adaptedNoCommutativeOpEqual,
  'no-computed-keys': adaptedNoComputedKeys,
  'no-cond-assign': adaptedNoCondAssign,
  'no-conditional-expect': adaptedNoConditionalExpect,
  'no-conditional-in-test': adaptedNoConditionalInTest,
  'no-confusing-double-equal': adaptedNoConfusingDoubleEqual,
  'no-assigning-expect-result': adaptedNoAssigningExpectResult,
  'no-assigning-hooks-return': adaptedNoAssigningHooksReturn,
  'no-dynamic-describe': adaptedNoDynamicDescribe,
  'no-empty-hook': adaptedNoEmptyHook,
  'no-confusing-test-name': adaptedNoConfusingTestName,
  'no-eval-in-test': adaptedNoEvalInTest,
  'no-misused-matchers': adaptedNoMisusedMatchers,
  'no-confusing-conditional-access': adaptedNoConfusingConditionalAccess,
  'no-console-in-tests': adaptedNoConsoleInTests,
  'no-deprecated-functions': adaptedNoDeprecatedFunctions,
  'no-confusing-void-expression': adaptedNoConfusingVoidExpression,
  'no-confusing-arrow': adaptedNoConfusingArrow,
  'no-console': adaptedNoConsole,
  'no-console-log': adaptedNoConsoleLog,
  'no-const-assign': adaptedNoConstAssign,
  'no-const-enum': adaptedNoConstEnum,
  'no-constant-binary-expression': adaptedNoConstantBinaryExpression,
  'no-constant-condition': adaptedNoConstantCondition,
   'no-constructor-return': adaptedNoConstructorReturn,
   'no-constructor-super': adaptedNoConstructorSuper,
   'no-continue': adaptedNoContinue,
   'no-control-regex': adaptedNoControlRegex,
  'no-debugger': adaptedNoDebugger,
  'no-delete-var': adaptedNoDeleteVar,
  // Security
  'no-deprecated-api': adaptedNoDeprecatedApi,
  'no-deprecated-imports': adaptedNoDeprecatedImports,
   'no-div-regex': adaptedNoDivRegex,
   'no-double-negation': adaptedNoDoubleNegation,
   'no-done-callback': adaptedNoDoneCallback,
  'no-dupe-args': adaptedNoDupeArgs,
  'no-dupe-class-members': adaptedNoDupeClassMembers,
  'no-dupe-keys': adaptedNoDupeKeys,
  'no-duplicate-case': adaptedNoDuplicateCase,
  'no-duplicate-code': adaptedNoDuplicateCode,
  'no-excessive-complexity': adaptedNoExcessiveComplexity,
  'no-duplicate-condition': adaptedNoDuplicateCondition,
  'no-duplicate-else-if': adaptedNoDuplicateElseIf,
  'no-empty-alternative': adaptedNoEmptyAlternative,
  'no-duplicate-hooks': adaptedNoDuplicateHooks,
  'no-empty-describe': adaptedNoEmptyDescribe,
  'no-duplicate-imports': adaptedNoDuplicateImports,
  'no-duplicate-strings-in-array': adaptedNoDuplicateStringsInArray,
  'no-dynamic-delete': adaptedNoDynamicDelete,
  'no-else-return': adaptedNoElseReturn,
  'no-empty': adaptedNoEmpty,
  'no-empty-catch': adaptedNoEmptyCatch,
  'no-empty-character-class': adaptedNoEmptyCharacterClass,
  'no-empty-function': adaptedNoEmptyFunction,
  'no-empty-pattern': adaptedNoEmptyPattern,
  'no-empty-static-block': adaptedNoEmptyStaticBlock,
  'no-eval': adaptedNoEval,
  'no-eq-null': adaptedNoEqNull,
  'no-ex-assign': adaptedNoExAssign,
  'no-export-default': adaptedNoExportDefault,
  'no-explicit-any': adaptedNoExplicitAny,
  'no-extend-native': adaptedNoExtendNative,
  'no-extra-boolean-cast': adaptedNoExtraBooleanCast,
  'no-extra-parens': adaptedNoExtraParens,
  'no-extra-semi': adaptedNoExtraSemi,
  'no-fallthrough': adaptedNoFallthrough,
   'no-floating-promises': adaptedNoFloatingPromises,
   'no-floating-promises-returned': adaptedNoFloatingPromisesReturned,
   'no-floating-decimal': adaptedNoFloatingDecimal,
   'no-focused-tests': adaptedNoFocusedTests,
  'no-func-assign': adaptedNoFuncAssign,
  'no-global-assign': adaptedNoGlobalAssign,
  'no-hex-escape': adaptedNoHexEscape,
  'no-octal-escape': adaptedNoOctalEscape,
  'no-hardcoded-credentials': adaptedNoHardcodedCredentials,
  'no-identical-title': adaptedNoIdenticalTitle,
  'no-interpolation-in-snapshots': adaptedNoInterpolationInSnapshots,
  'no-jest-globals': adaptedNoJestGlobals,
  'no-large-jest-snapshots': adaptedNoLargeJestSnapshots,
  'no-redundant-action': adaptedNoRedundantAction,
  'no-implicit-coercion': adaptedNoImplicitCoercion,
  'no-implicit-side-effects': noImplicitSideEffectsRule,
  'no-implied-eval': adaptedNoImpliedEval,
  'no-implicit-map': adaptedNoImplicitMap,
  'no-import-assign': adaptedNoImportAssign,
  'no-inferrable-types': adaptedNoInferrableTypes,
  'no-inline-comments': adaptedNoInlineComments,
  'no-inner-declarations': adaptedNoInnerDeclarations,
  'no-invalid-regexp': adaptedNoInvalidRegexp,
  'no-irregular-whitespace': adaptedNoIrregularWhitespace,
  'no-iterator': adaptedNoIterator,
  'no-label-var': adaptedNoLabelVar,
  'no-lone-blocks': adaptedNoLoneBlocks,
  'no-lonely-if': adaptedNoLonelyIf,
   'no-loop-func': adaptedNoLoopFunc,
   'no-labels': adaptedNoLabels,
   'no-loss-of-precision': adaptedNoLossOfPrecision,
  'no-meaningless-void': adaptedNoMeaninglessVoid,
  // Best practices
  'no-magic-numbers': noMagicNumbersRule,
  'no-misleading-array-method': adaptedNoMisleadingArrayMethod,
  'no-misleading-character-class': adaptedNoMisleadingCharacterClass,
   'no-misleading-instantiation': adaptedNoMisleadingInstantiation,
   'no-misleading-ternary': adaptedNoMisleadingTernary,
  'no-mixed-enums': adaptedNoMixedEnums,
  'no-mixed-operators': adaptedNoMixedOperators,
  'no-misused-new': adaptedNoMisusedNew,
  'no-misused-promises': adaptedNoMisusedPromises,
  'no-multi-assign': adaptedNoMultiAssign,
  'no-multiple-empty-lines': adaptedNoMultipleEmptyLines,
  'no-multi-spaces': adaptedNoMultiSpaces,
  'no-multi-str': adaptedNoMultiStr,
  'no-namespace': adaptedNoNamespace,
  'no-negated-condition': adaptedNoNegatedCondition,
  'no-negated-eq-null': adaptedNoNegatedEqNull,
  'no-nested-ternary': adaptedNoNestedTernary,
  'no-new-func': adaptedNoNewFunc,
  'no-new-native-nonconstructor': adaptedNoNewNativeNonconstructor,
   'no-new-wrappers': adaptedNoNewWrappers,
   'no-new-symbol': adaptedNoNewSymbol,
   'no-non-null-assertion': adaptedNoNonNullAssertion,
  'no-nonoctal-decimal-escape': adaptedNoNonoctalDecimalEscape,
  'no-obj-calls': adaptedNoObjCalls,
  'no-object-constructor': adaptedNoObjectConstructor,
  'no-octal': adaptedNoOctal,
  'no-param-reassign': adaptedNoParamReassign,
  'no-plusplus': adaptedNoPlusplus,
  'no-promise-as-boolean': adaptedNoPromiseAsBoolean,
  'no-prototype-builtins': adaptedNoPrototypeBuiltins,
  'no-property-rename': adaptedNoPropertyRename,
  'no-property-signature-style': adaptedNoPropertySignatureStyle,
  'no-redeclare': adaptedNoRedeclare,
  'no-redundant-boolean': adaptedNoRedundantBoolean,
  'no-redundant-optional-chain': adaptedNoRedundantOptionalChain,
  'no-redundant-use-strict': adaptedNoRedundantUseStrict,
  'no-redundant-type-constituents': adaptedNoRedundantTypeConstituents,
  'no-regex-spaces': adaptedNoRegexSpaces,
  'no-restricted-exports': adaptedNoRestrictedExports,
  'no-restricted-syntax': adaptedNoRestrictedSyntax,
  'no-restricted-matchers': adaptedNoRestrictedMatchers,
  'no-restricted-jest-methods': adaptedNoRestrictedJestMethods,
  'no-return-assign': adaptedNoReturnAssign,
  'no-return-await': adaptedNoReturnAwait,
  'no-return-or-await': adaptedNoReturnOrAwait,
  'no-same-side-conditions': adaptedNoSameSideConditions,
   'no-self-assign': adaptedNoSelfAssign,
   'no-self-compare': adaptedNoSelfCompare,
   'no-sequences': adaptedNoSequences,
  'no-setter-return': adaptedNoSetterReturn,
  'no-shadow': adaptedNoShadow,
  'no-shadow-restricted-names': adaptedNoShadowRestrictedNames,
  'no-script-url': adaptedNoScriptUrl,
  'no-simplifiable-pattern': adaptedNoSimplifiablePattern,
  'no-skipped-tests': adaptedNoSkippedTests,
  'no-sparse-arrays': adaptedNoSparseArrays,
  'no-static-only-class': adaptedNoStaticOnlyClass,
  'no-sql-injection': adaptedNoSqlInjection,
  'no-standalone-expect': adaptedNoStandaloneExpect,
  'no-string-concat': adaptedNoStringConcat,
  'no-string-case-convert': adaptedNoStringCaseConvert,
   'no-suspicious-comment': adaptedNoSuspiciousComment,
   'no-tabs': adaptedNoTabs,
   'no-test-prefix': adaptedNoTestPrefix,
  'no-sync-in-async': noSyncInAsyncRule,
  'no-primitive-wrapper-maps': adaptedNoPrimitiveWrapperMaps,
  'no-template-curly-in-string': adaptedNoTemplateCurlyInString,
  'no-ternary': adaptedNoTernary,
  'no-test-return-statement': adaptedNoTestReturnStatement,
  'no-useless-async-test': adaptedNoUselessAsyncTest,
  'no-unsafe-matchers': adaptedNoUnsafeMatchers,
  'no-misplaced-hook': adaptedNoMisplacedHook,
  'require-hook-description': adaptedRequireHookDescription,
  'no-async-snapshot': adaptedNoAsyncSnapshot,
  'no-async-setup': adaptedNoAsyncSetup,
  'no-thenable': adaptedNoThenable,
  'no-this-before-super': adaptedNoThisBeforeSuper,
  'no-this-alias': adaptedNoThisAlias,
  'no-throw-literal': adaptedNoThrowLiteral,
  'no-throw-sync': adaptedNoThrowSync,
  'no-trailing-spaces': adaptedNoTrailingSpaces,
  'no-type-only-return': adaptedNoTypeOnlyReturn,
  'no-type-alias-single-union': adaptedNoTypeAliasSingleUnion,
  'no-unicode-bom': adaptedNoUnicodeBom,
  'no-unassigned-vars': adaptedNoUnassignedVars,
  'no-undef': adaptedNoUndef,
  'no-unexpected-multiline': adaptedNoUnexpectedMultiline,
  'no-unbound-promise': adaptedNoUnboundPromise,
  'no-unfinished-todos': adaptedNoUnfinishedTodos,
  'no-unnecessary-condition': adaptedNoUnnecessaryCondition,
  'no-unnecessary-await': adaptedNoUnnecessaryAwait,
   'no-unnecessary-await-foreach': adaptedNoUnnecessaryAwaitForeach,
   'no-unnecessary-await-expression': adaptedNoUnnecessaryAwaitExpression,
  'no-unnecessary-assign': adaptedNoUnnecessaryAssign,
  'no-unnecessary-binding-pattern': adaptedNoUnnecessaryBindingPattern,
  'no-unnecessary-assert': adaptedNoUnnecessaryAssert,
   'no-unnecessary-bignumber': adaptedNoUnnecessaryBignumber,
  'no-unnecessary-bitwise-not': adaptedNoUnnecessaryBitwiseNot,
  'no-unnecessary-block': adaptedNoUnnecessaryBlock,
  'no-unnecessary-as-expression': adaptedNoUnnecessaryAsExpression,
   'no-unnecessary-at': adaptedNoUnnecessaryAt,
   'no-unnecessary-atob': adaptedNoUnnecessaryAtob,
  'no-unnecessary-btoa': adaptedNoUnnecessaryBtoa,
    'no-unnecessary-array-from': adaptedNoUnnecessaryArrayFrom,
    'no-unnecessary-array-from-spread': adaptedNoUnnecessaryArrayFromSpread,
      'no-unnecessary-array-flat': adaptedNoUnnecessaryArrayFlat,
     'no-unnecessary-array-flat-single-level': adaptedNoUnnecessaryArrayFlatSingleLevel,
     'no-unnecessary-array-every-boolean': adaptedNoUnnecessaryArrayEveryBoolean,
     'no-unnecessary-array-filter-identity': adaptedNoUnnecessaryArrayFilterIdentity,
     'no-unnecessary-array-fill-literal': adaptedNoUnnecessaryArrayFillLiteral,
    'no-unnecessary-array-isarray-literal': adaptedNoUnnecessaryArrayIsarrayLiteral,
    'no-unnecessary-array-of-single': adaptedNoUnnecessaryArrayOfSingle,
    'no-unnecessary-array-includes-single': adaptedNoUnnecessaryArrayIncludesSingle,
    'no-unnecessary-array-join-empty': adaptedNoUnnecessaryArrayJoinEmpty,
    'no-unnecessary-array-constructor': adaptedNoUnnecessaryArrayConstructor,
    'no-unnecessary-array-concat-single': adaptedNoUnnecessaryArrayConcatSingle,
   'no-unnecessary-async-function': adaptedNoUnnecessaryAsyncFunction,
  'no-unnecessary-async-arrow': adaptedNoUnnecessaryAsyncArrow,
   'no-unnecessary-boolean': adaptedNoUnnecessaryBoolean,
   'no-unnecessary-boolean-comparison': adaptedNoUnnecessaryBooleanComparison,
   'no-unnecessary-boolean-literal-compare': adaptedNoUnnecessaryBooleanLiteralCompare,
    'no-unnecessary-boolean-constructor': adaptedNoUnnecessaryBooleanConstructor,
   'no-unnecessary-boolean-wrapper': adaptedNoUnnecessaryBooleanWrapper,
  'no-unnecessary-callback-wrapper': adaptedNoUnnecessaryCallbackWrapper,
  'no-unnecessary-catch-binding': adaptedNoUnnecessaryCatchBinding,
  'no-unnecessary-class': adaptedNoUnnecessaryClass,
  'no-unnecessary-destructuring': adaptedNoUnnecessaryDestructuring,
   'no-unnecessary-concat': adaptedNoUnnecessaryConcat,
   'no-unnecessary-console-string-concat': adaptedNoUnnecessaryConsoleStringConcat,
   'no-unnecessary-computed-key': adaptedNoUnnecessaryComputedKey,
   'no-unnecessary-continue': adaptedNoUnnecessaryContinue,
   'no-unnecessary-entries': adaptedNoUnnecessaryEntries,
   'no-unnecessary-double-negation': adaptedNoUnnecessaryDoubleNegation,
   'no-unnecessary-double-equals': adaptedNoUnnecessaryDoubleEquals,
   'no-unnecessary-escape-in-regexp': adaptedNoUnnecessaryEscapeInRegexp,
   'no-unnecessary-expression-statement': adaptedNoUnnecessaryExpressionStatement,
   'no-unnecessary-for-loop': adaptedNoUnnecessaryForLoop,
   'no-unnecessary-for-each': adaptedNoUnnecessaryForEach,
   'no-unnecessary-find-index': adaptedNoUnnecessaryFindIndex,
   'no-unnecessary-find-last-index': adaptedNoUnnecessaryFindLastIndex,
   'no-unnecessary-find-last': adaptedNoUnnecessaryFindLast,
   'no-unnecessary-find': adaptedNoUnnecessaryFind,
   'no-unnecessary-filter': adaptedNoUnnecessaryFilter,
    'no-unnecessary-fill': adaptedNoUnnecessaryFill,
   'no-unnecessary-flat': adaptedNoUnnecessaryFlat,
   'no-unnecessary-flat-map': adaptedNoUnnecessaryFlatMap,
   'no-unnecessary-fragment': adaptedNoUnnecessaryFragment,
  'no-unnecessary-index-of': adaptedNoUnnecessaryIndexOf,
  'no-unnecessary-array-indexof-zero': adaptedNoUnnecessaryArrayIndexofZero,
  'no-unnecessary-initialization': adaptedNoUnnecessaryInitialization,
  'no-unnecessary-instanceof-array': adaptedNoUnnecessaryInstanceofArray,
  'no-unnecessary-json-parse': adaptedNoUnnecessaryJsonParse,
  'no-unnecessary-json-stringify-literal': adaptedNoUnnecessaryJsonStringifyLiteral,
   'no-unnecessary-new-array': adaptedNoUnnecessaryNewArray,
  'no-unnecessary-new-boolean': adaptedNoUnnecessaryNewBoolean,
  'no-unnecessary-new-map': adaptedNoUnnecessaryNewMap,
   'no-unnecessary-new-object': adaptedNoUnnecessaryNewObject,
   'no-unnecessary-new-set': adaptedNoUnnecessaryNewSet,
  'no-unnecessary-new-string': adaptedNoUnnecessaryNewString,
  'no-unnecessary-new-number': adaptedNoUnnecessaryNewNumber,
  'no-unnecessary-parentheses': adaptedNoUnnecessaryParentheses,
  'no-unnecessary-label': adaptedNoUnnecessaryLabel,
  'no-unnecessary-last-index-of': adaptedNoUnnecessaryLastIndexOf,
    'no-unnecessary-literal-key': adaptedNoUnnecessaryLiteralKey,
    'no-unnecessary-literal-tostring': adaptedNoUnnecessaryLiteralTostring,
     'no-unnecessary-logical-and-true': adaptedNoUnnecessaryLogicalAndTrue,
     'no-unnecessary-logical-or-false': adaptedNoUnnecessaryLogicalOrFalse,
    'no-unnecessary-map': adaptedNoUnnecessaryMap,
    'no-unnecessary-array-map-identity': adaptedNoUnnecessaryArrayMapIdentity,
    'no-unnecessary-math-max-single': adaptedNoUnnecessaryMathMaxSingle,
   'no-unnecessary-math-ceil-integer': adaptedNoUnnecessaryMathCeilInteger,
   'no-unnecessary-math-round-integer': adaptedNoUnnecessaryMathRoundInteger,
   'no-unnecessary-math-floor-integer': adaptedNoUnnecessaryMathFloorInteger,
   'no-unnecessary-math-abs-positive': adaptedNoUnnecessaryMathAbsPositive,
   'no-unnecessary-null-with-strict': adaptedNoUnnecessaryNullWithStrict,
   'no-unnecessary-object-assign': adaptedNoUnnecessaryObjectAssign,
   'no-unnecessary-object-assign-same': adaptedNoUnnecessaryObjectAssignSame,
    'no-unnecessary-object-freeze-literal': adaptedNoUnnecessaryObjectFreezeLiteral,
    'no-unnecessary-object-keys-length': adaptedNoUnnecessaryObjectKeysLength,
    'no-unnecessary-object-seal-literal': adaptedNoUnnecessaryObjectSealLiteral,
  'no-unnecessary-numeric-literal': adaptedNoUnnecessaryNumericLiteral,
  'no-unnecessary-numeric-separator': adaptedNoUnnecessaryNumericSeparator,
   'no-unnecessary-pop': adaptedNoUnnecessaryPop,
   'no-unnecessary-polyfills': adaptedNoUnnecessaryPolyfills,
  'no-unnecessary-plus-new': adaptedNoUnnecessaryPlusNew,
  'no-unnecessary-qualifier': adaptedNoUnnecessaryQualifier,
  'no-unnecessary-readonly': adaptedNoUnnecessaryReadonly,
  'no-unnecessary-regex-constructor': adaptedNoUnnecessaryRegexConstructor,
  'no-unnecessary-regex': adaptedNoUnnecessaryRegex,
  'no-unnecessary-return-await': adaptedNoUnnecessaryReturnAwait,
   'no-unnecessary-reduce': adaptedNoUnnecessaryReduce,
   'no-unnecessary-return-value': adaptedNoUnnecessaryReturnValue,
    'no-unnecessary-reduce-right': adaptedNoUnnecessaryReduceRight,
   'no-unnecessary-regexp-constructor': adaptedNoUnnecessaryRegexpConstructor,
    'no-unnecessary-reverse': adaptedNoUnnecessaryReverse,
    'no-unnecessary-array-reverse-no-use': adaptedNoUnnecessaryArrayReverseNoUse,
   'no-unnecessary-number-to-fixed': adaptedNoUnnecessaryNumberToFixed,
   'no-unnecessary-number-tofixed-zero': adaptedNoUnnecessaryNumberTofixedZero,
  'no-unnecessary-number-wrapper': adaptedNoUnnecessaryNumberWrapper,
  'no-unnecessary-number-constructor': adaptedNoUnnecessaryNumberConstructor,
  'no-unnecessary-number-isnan-literal': adaptedNoUnnecessaryNumberIsnanLiteral,
  'no-unnecessary-join': adaptedNoUnnecessaryJoin,
  'no-unnecessary-sort': adaptedNoUnnecessarySort,
  'no-unnecessary-array-sort-no-use': adaptedNoUnnecessaryArraySortNoUse,
  'no-unnecessary-array-some-false': adaptedNoUnnecessaryArraySomeFalse,
  'no-unnecessary-includes': adaptedNoUnnecessaryIncludes,
   'no-unnecessary-shift': adaptedNoUnnecessaryShift,
   'no-unnecessary-slice': adaptedNoUnnecessarySlice,
   'no-unnecessary-array-slice-zero': adaptedNoUnnecessaryArraySliceZero,
  'no-unnecessary-some': adaptedNoUnnecessarySome,
   'no-unnecessary-splice': adaptedNoUnnecessarySplice,
   'no-unnecessary-spread': adaptedNoUnnecessarySpread,
   'no-unnecessary-spread-array': adaptedNoUnnecessarySpreadArray,
   'no-unnecessary-string-concat': adaptedNoUnnecessaryStringConcat,
   'no-unnecessary-string-constructor': adaptedNoUnnecessaryStringConstructor,
    'no-unnecessary-string-char-at-zero': adaptedNoUnnecessaryStringCharAtZero,
    'no-unnecessary-string-at-zero': adaptedNoUnnecessaryStringAtZero,
    'no-unnecessary-string-codepointat-zero': adaptedNoUnnecessaryStringCodepointatZero,
   'no-unnecessary-string-length-compare': adaptedNoUnnecessaryStringLengthCompare,
  'no-unnecessary-string-wrapper': adaptedNoUnnecessaryStringWrapper,
   'no-unnecessary-string-split': adaptedNoUnnecessaryStringSplit,
   'no-unnecessary-string-split-empty-separator': adaptedNoUnnecessaryStringSplitEmptySeparator,
    'no-unnecessary-string-starts-empty': adaptedNoUnnecessaryStringStartsEmpty,
    'no-unnecessary-string-trim-empty': adaptedNoUnnecessaryStringTrimEmpty,
    'no-unnecessary-string-replace-all': adaptedNoUnnecessaryStringReplaceAll,
   'no-unnecessary-string-repeat-zero': adaptedNoUnnecessaryStringRepeatZero,
  'no-unnecessary-stringify': adaptedNoUnnecessaryStringify,
  'no-unnecessary-string-to-number': adaptedNoUnnecessaryStringToNumber,
  'no-unnecessary-parse-float': adaptedNoUnnecessaryParseFloat,
  'no-unnecessary-parse-int': adaptedNoUnnecessaryParseInt,
  'no-unnecessary-parse-int-radix-ten': adaptedNoUnnecessaryParseIntRadixTen,
  'no-unnecessary-is-finite': adaptedNoUnnecessaryIsFinite,
  'no-unnecessary-is-nan': adaptedNoUnnecessaryIsNan,
  'no-unnecessary-decode-uri': adaptedNoUnnecessaryDecodeUri,
  'no-unnecessary-delete': adaptedNoUnnecessaryDelete,
  'no-unnecessary-encode-uri': adaptedNoUnnecessaryEncodeUri,
  'no-unnecessary-template-expression': adaptedNoUnnecessaryTemplateExpression,
  'no-unnecessary-template-literal': adaptedNoUnnecessaryTemplateLiteral,
  'no-unnecessary-template-literal-single': adaptedNoUnnecessaryTemplateLiteralSingle,
   'no-unnecessary-then': adaptedNoUnnecessaryThen,
   'no-unnecessary-throw-new': adaptedNoUnnecessaryThrowNew,
   'no-unnecessary-to-reversed': adaptedNoUnnecessaryToReversed,
    'no-unnecessary-to-sorted': adaptedNoUnnecessaryToSorted,
    'no-unnecessary-to-spliced': adaptedNoUnnecessaryToSpliced,
    'no-unnecessary-to-string': adaptedNoUnnecessaryToString,
    'no-unnecessary-to-locale-string': adaptedNoUnnecessaryToLocaleString,
   'no-unnecessary-typeof': adaptedNoUnnecessaryTypeof,
   'no-unnecessary-typeof-string': adaptedNoUnnecessaryTypeofString,
   'no-unnecessary-typeof-number': adaptedNoUnnecessaryTypeofNumber,
   'no-unnecessary-typeof-boolean': adaptedNoUnnecessaryTypeofBoolean,
  'no-unnecessary-undefined-return': adaptedNoUnnecessaryUndefinedReturn,
   'no-unnecessary-null-check': adaptedNoUnnecessaryNullCheck,
   'no-unnecessary-null-coalesce-fallback': adaptedNoUnnecessaryNullCoalesceFallback,
   'no-unnecessary-optional-chain': adaptedNoUnnecessaryOptionalChain,
   'no-unnecessary-optional-call': adaptedNoUnnecessaryOptionalCall,
  'no-unnecessary-parameter-property': adaptedNoUnnecessaryParameterProperty,
   'no-unnecessary-promise-wrap': adaptedNoUnnecessaryPromiseWrap,
    'no-unnecessary-promise-resolve': adaptedNoUnnecessaryPromiseResolve,
     'no-unnecessary-promise-all': adaptedNoUnnecessaryPromiseAll,
     'no-unnecessary-promise-reject': adaptedNoUnnecessaryPromiseReject,
  'no-unnecessary-escape': adaptedNoUnnecessaryEscape,
  'no-unnecessary-else': adaptedNoUnnecessaryElse,
  'no-unnecessary-every': adaptedNoUnnecessaryEvery,
  'no-unnecessary-constructor': adaptedNoUnnecessaryConstructor,
  'no-unnecessary-ternary': adaptedNoUnnecessaryTernary,
   'no-unnecessary-ternary-assign': adaptedNoUnnecessaryTernaryAssign,
   'no-unnecessary-ternary-boolean': adaptedNoUnnecessaryTernaryBoolean,
  'no-unnecessary-type-arguments': adaptedNoUnnecessaryTypeArguments,
  'no-unnecessary-type-assertion': noUnnecessaryTypeAssertionRule,
  'no-unnecessary-type-constraint': adaptedNoUnnecessaryTypeConstraint,
  'no-unnecessary-type-parameters': adaptedNoUnnecessaryTypeParameters,
   'no-unnecessary-unshift': adaptedNoUnnecessaryUnshift,
    'no-unnecessary-void': adaptedNoUnnecessaryVoid,
    'no-unnecessary-void-operator': adaptedNoUnnecessaryVoidOperator,
   'no-unnecessary-yield': adaptedNoUnnecessaryYield,
   'no-unnecessary-values': adaptedNoUnnecessaryValues,
    'no-unnecessary-with': adaptedNoUnnecessaryWith,
   'no-unnecessary-wait': adaptedNoUnnecessaryWait,
  'no-unneeded-ternary': adaptedNoUnneededTernary,
  'no-unreachable': adaptedNoUnreachable,
  'no-undefined': adaptedNoUndefined,
  'no-underscore-dangle': adaptedNoUnderscoreDangle,
  'no-unsafe-assignment': adaptedNoUnsafeAssignment,
  'no-unsafe-call': adaptedNoUnsafeCall,
  'no-unsafe-declaration-merging': adaptedNoUnsafeDeclarationMerging,
  'no-unsafe-enum-comparison': adaptedNoUnsafeEnumComparison,
  'no-unsafe-finally': adaptedNoUnsafeFinally,
  'no-unsafe-html': adaptedNoUnsafeHtml,
  'no-unsafe-member-access': adaptedNoUnsafeMemberAccess,
  'no-unsafe-negation': adaptedNoUnsafeNegation,
  'no-unsafe-optional-chaining': adaptedNoUnsafeOptionalChaining,
  'no-unsafe-regex': adaptedNoUnsafeRegex,
  'no-unsafe-return': adaptedNoUnsafeReturn,
  'no-unsafe-type-assertion': adaptedNoUnsafeTypeAssertion,
   'no-unused-exports': adaptedNoUnusedExports,
    'no-cjs-imports': adaptedNoCjsImports,
    'no-dynamic-import': adaptedNoDynamicImport,
     'no-implicit-dependencies': adaptedNoImplicitDependencies,
     'no-git-dependencies': adaptedNoGitDependencies,
     'no-unused-expressions': adaptedNoUnusedExpressions,
  'no-unused-labels': adaptedNoUnusedLabels,
  'no-unused-private-members': adaptedNoUnusedPrivateMembers,
  'no-unused-vars': adaptedNoUnusedVars,
  'no-use-before-define': adaptedNoUseBeforeDefine,
  'no-use-extend-native': adaptedNoUseExtendNative,
  'no-useless-assignment': adaptedNoUselessAssignment,
  'no-useless-backreference': adaptedNoUselessBackreference,
   'no-useless-catch': adaptedNoUselessCatch,
    'no-invalid-use-before-def': adaptedNoInvalidUseBeforeDef,
     'no-implicit-globals': adaptedNoImplicitGlobals,
     'no-non-null-asserted-optional-chain': adaptedNoNonNullAssertedOptionalChain,
      'no-misleading-spread': adaptedNoMisleadingSpread,
       'no-async-constructor': adaptedNoAsyncConstructor,
       'no-approximate-constants': adaptedNoApproximateConstants,
       'no-implicit-undefined': adaptedNoImplicitUndefined,
       'no-misleading-assertion': adaptedNoMisleadingAssertion,
       'no-require-imports': adaptedNoRequireImports,
       'no-compare-negation': adaptedNoCompareNegation,
       'no-useless-promise': adaptedNoUselessPromise,
     'no-useless-rename': adaptedNoUselessRename,
  'no-useless-comparison': noUselessComparisonRule,
  'no-useless-call': adaptedNoUselessCall,
  'no-useless-computed-key': adaptedNoUselessComputedKey,
  'no-useless-concat': adaptedNoUselessConcat,
  'no-useless-constructor': adaptedNoUselessConstructor,
  'no-useless-escape': adaptedNoUselessEscape,
  'no-useless-expression-statement': adaptedNoUselessExpressionStatement,
  'no-useless-fallback-in-spread': adaptedNoUselessFallbackInSpread,
   'no-useless-undefined': adaptedNoUselessUndefined,
   'no-useless-return': adaptedNoUselessReturn,
   'no-useless-switch': adaptedNoUselessSwitch,
   'no-useless-type-conversion': adaptedNoUselessTypeConversion,
  'no-utility-truthiness': adaptedNoUtilityTruthiness,
  'no-var': adaptedNoVar,
  'no-var-requires': adaptedNoVarRequires,
  'no-void': adaptedNoVoid,
   'no-weak-crypto': adaptedNoWeakCrypto,
   'no-innerhtml': adaptedNoInnerHTML,
   'no-banned-properties': adaptedNoBannedProperties,
   'no-document-write': adaptedNoDocumentWrite,
   'no-regex-concat': adaptedNoRegexConcat,
   'no-regex-constructor': adaptedNoRegexConstructor,
    'no-unsafe-argument': adaptedNoUnsafeArgument,
    'no-restricted-globals': adaptedNoRestrictedGlobals,
     'no-restricted-imports': adaptedNoRestrictedImports,
     'no-restricted-properties': adaptedNoRestrictedProperties,
     'no-with': adaptedNoWith,
   'no-warning-comments': adaptedNoWarningComments,
    'no-whitespace-before-property': adaptedNoWhitespaceBeforeProperty,
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
   'prefer-destructuring': adaptedPreferDestructuring,
   'prefer-expect-resolves': adaptedPreferExpectResolves,
  'prefer-expect-assertions': adaptedPreferExpectAssertions,
  'no-misused-async': adaptedNoMisusedAsync,
  'no-nested-describe': adaptedNoNestedDescribe,
  'no-implicit-return-in-test': adaptedNoImplicitReturnInTest,
  'prefer-exponent-operator': preferExponentOperatorRule,
  'prefer-exponentiation-operator': adaptedPreferExponentiationOperator,
  'prefer-flat-map': preferFlatMapRule,
  'prefer-for-of': preferForOfRule,
  'prefer-function-type': adaptedPreferFunctionType,
  'prefer-hooks-on-top': adaptedPreferHooksOnTop,
  'prefer-inline-snapshot': adaptedPreferInlineSnapshot,
  'prefer-literal-matchers': adaptedPreferLiteralMatchers,
  'prefer-includes': adaptedPreferIncludes,
  'prefer-literal-enum-member': adaptedPreferLiteralEnumMember,
  'prefer-math-trunc': adaptedPreferMathTrunc,
  'prefer-nullish-coalescing': adaptedPreferNullishCoalescing,
  'prefer-called-with': adaptedPreferCalledWith,
  'prefer-equality-matcher': adaptedPreferEqualityMatcher,
  'prefer-each': adaptedPreferEach,
  'prefer-mock-promise-shorthand': adaptedPreferMockPromiseShorthand,
  'prefer-mock-return-value': adaptedPreferMockReturnValue,
  'prefer-resolves-rejects': adaptedPreferResolvesRejects,
  'no-redundant-expect': adaptedNoRedundantExpect,
  'prefer-named-snapshot': adaptedPreferNamedSnapshot,
  'prefer-snapshot-hint': adaptedPreferSnapshotHint,
  'prefer-spy-on': adaptedPreferSpyOn,
  'prefer-number-properties': adaptedPreferNumberProperties,
  'prefer-number-isnan': adaptedPreferNumberIsnan,
  'prefer-number-isfinite': adaptedPreferNumberIsFinite,
  'prefer-numeric-literals': adaptedPreferNumericLiterals,
  'prefer-object-has-own': adaptedPreferObjectHasOwn,
  'prefer-object-spread': adaptedPreferObjectSpread,
   'prefer-optional-chain': adaptedPreferOptionalChain,
   'prefer-string-char-at': adaptedPreferStringCharAt,
   'prefer-promise-reject-errors': adaptedPreferPromiseRejectErrors,
  'prefer-prototype-methods': adaptedPreferPrototypeMethods,
  'prefer-readonly': adaptedPreferReadonly,
  'prefer-readonly-parameter': adaptedPreferReadonlyParameter,
  'prefer-regex-literal': preferRegexLiteralRule,
  'prefer-regex-literals': adaptedPreferRegexLiterals,
  'prefer-regexp-exec': adaptedPreferRegexpExec,
  'prefer-rest-params': adaptedPreferRestParams,
  'prefer-return-this-type': preferReturnThisTypeRule,
  'prefer-single-boolean-return': adaptedPreferSingleBooleanReturn,
  'prefer-spread': adaptedPreferSpread,
  'prefer-string-replace-all': adaptedPreferStringReplaceAll,
  'prefer-string-slice': adaptedPreferStringSlice,
  'prefer-string-slice-over-substring': adaptedPreferStringSliceOverSubstring,
  'prefer-string-start-end': preferStringStartEndRule,
  'prefer-string-starts-ends-with': adaptedPreferStringStartsEndsWith,
  'prefer-string-template': preferStringTemplateRule,
  'prefer-strict-equal': adaptedPreferStrictEqual,
  'prefer-template': adaptedPreferTemplate,
  'prefer-ternary-operator': adaptedPreferTernaryOperator,
  'prefer-to-be': adaptedPreferToBe,
  'prefer-to-be-null': adaptedPreferToBeNull,
  'prefer-to-be-undefined': adaptedPreferToBeUndefined,
  'prefer-to-contain': adaptedPreferToContain,
  'prefer-to-have-length': adaptedPreferToHaveLength,
  'prefer-todo': adaptedPreferTodo,
  'preserve-caught-error': adaptedPreserveCaughtError,
  'require-await': adaptedRequireAwait,
  'require-hook': adaptedRequireHook,
  'require-to-throw-message': adaptedRequireToThrowMessage,
  'require-return-type': adaptedRequireReturnType,
  'require-top-level-describe': adaptedRequireTopLevelDescribe,
  'require-yield': adaptedRequireYield,
  'restrict-template-expressions': adaptedRestrictTemplateExpressions,
  'sort-keys': adaptedSortKeys,
  'sort-imports': adaptedSortImports,
  'spaced-comment': adaptedSpacedComment,
  'strict-bool-expressions': adaptedStrictBoolExpressions,
  'strict-boolean-expressions': strictBooleanExpressionsRule,
  'use-isnan': adaptedUseIsnan,
  'valid-expect': adaptedValidExpect,
  'valid-title': adaptedValidTitle,
   'valid-typeof': adaptedValidTypeof,
   'yoda': adaptedYoda,
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
  'consistent-test-it': 'testing',
  // Patterns
  'consistent-type-exports': 'patterns',
  'constructor-super': 'patterns',
  curly: 'patterns',
  'default-case': 'patterns',
  'eq-eq-eq': 'patterns',
  'expect-expect': 'testing',
  'explicit-module-boundary-types': 'patterns',
  // Orphan rules
  'explicit-return-type': 'patterns',
  'for-direction': 'patterns',
  'getter-return': 'patterns',
  // Complexity
  'max-complexity': 'complexity',
  'max-depth': 'complexity',
  'max-expects': 'testing',
  'max-file-size': 'patterns',
  'max-lines': 'complexity',
  'max-lines-per-function': 'complexity',
  'max-nested-describe': 'testing',
  'max-params': 'complexity',
  'max-union-size': 'patterns',
  'no-alert': 'patterns',
  'no-alias-methods': 'testing',
  'no-array-constructor': 'patterns',
  'no-assertion-in-setup': 'testing',
  'no-assertion-in-loop': 'testing',
  'no-async-promise-executor': 'patterns',
  'no-async-foreach': 'patterns',
  'no-async-suite': 'testing',
   // Performance
    'no-await-in-loop': 'performance',
   'no-array-reduce': 'performance',
    'no-inefficient-string-concat': 'performance',
    'no-constant-response': 'performance',
    'no-unnecessary-async': 'performance',
    'no-misused-promise-return': 'performance',
    'no-inefficient-array-methods': 'performance',
  'no-barrel-imports': 'dependencies',
   'no-bitwise': 'patterns',
   'no-buffer-constructor': 'patterns',
   'no-caller': 'patterns',
   'no-catch-shadow': 'patterns',
   'no-case-declarations': 'patterns',
  // Dependencies
  'no-circular-deps': 'dependencies',
  'no-class-assign': 'patterns',
  'no-collection-size-mischeck': 'patterns',
  'no-commented-out-tests': 'testing',
  'no-compare-neg-zero': 'patterns',
  'no-commutative-op-equal': 'patterns',
  'no-computed-keys': 'patterns',
  'no-cond-assign': 'patterns',
    'no-conditional-expect': 'testing',
     'no-conditional-in-test': 'testing',
     'no-console-in-tests': 'testing',
     'no-deprecated-functions': 'testing',
    'no-confusing-double-equal': 'testing',
    'no-assigning-expect-result': 'testing',
    'no-assigning-hooks-return': 'testing',
    'no-dynamic-describe': 'testing',
    'no-empty-hook': 'testing',
    'no-confusing-test-name': 'testing',
    'no-eval-in-test': 'testing',
    'no-misused-matchers': 'testing',
   'no-confusing-conditional-access': 'testing',
  'no-confusing-void-expression': 'patterns',
  'no-console': 'patterns',
  'no-console-log': 'patterns',
  'no-const-assign': 'patterns',
  'no-const-enum': 'patterns',
  'no-constant-binary-expression': 'correctness',
  'no-constant-condition': 'patterns',
  'no-constructor-return': 'patterns',
  'no-constructor-super': 'patterns',
  'no-continue': 'patterns',
  'no-control-regex': 'patterns',
  'no-debugger': 'patterns',
  'no-delete-var': 'patterns',
  // Security
  'no-deprecated-api': 'security',
  'no-deprecated-imports': 'patterns',
   'no-div-regex': 'patterns',
   'no-double-negation': 'patterns',
   'no-done-callback': 'testing',
  'no-dupe-args': 'patterns',
  'no-dupe-class-members': 'patterns',
  'no-dupe-keys': 'patterns',
  'no-duplicate-case': 'patterns',
  'no-duplicate-code': 'patterns',
 'no-excessive-complexity': 'patterns',
   'no-duplicate-condition': 'patterns',
 'no-empty-alternative': 'patterns',
   'no-duplicate-else-if': 'patterns',
  'no-duplicate-hooks': 'testing',
  'no-empty-describe': 'testing',
  'no-duplicate-imports': 'patterns',
  'no-duplicate-strings-in-array': 'patterns',
  'no-dynamic-delete': 'security',
  'no-else-return': 'patterns',
  'no-empty': 'patterns',
  'no-empty-catch': 'correctness',
  'no-empty-character-class': 'correctness',
  'no-empty-function': 'correctness',
  'no-empty-pattern': 'patterns',
  'no-empty-static-block': 'patterns',
  'no-eval': 'security',
  'no-eq-null': 'patterns',
  'no-ex-assign': 'patterns',
  'no-export-default': 'patterns',
  'no-explicit-any': 'patterns',
  'no-extend-native': 'patterns',
  'no-extra-boolean-cast': 'patterns',
  'no-extra-parens': 'patterns',
  'no-extra-semi': 'patterns',
  'no-fallthrough': 'patterns',
   'no-floating-promises': 'patterns',
   'no-floating-promises-returned': 'patterns',
   'no-floating-decimal': 'patterns',
  'no-focused-tests': 'testing',
  'no-func-assign': 'patterns',
  'no-global-assign': 'patterns',
  'no-hardcoded-credentials': 'security',
  'no-identical-title': 'testing',
  'no-interpolation-in-snapshots': 'testing',
  'no-jest-globals': 'testing',
  'no-large-jest-snapshots': 'testing',
  'no-redundant-action': 'testing',
   'no-implicit-coercion': 'patterns',
   'no-invalid-use-before-def': 'correctness',
    'no-implicit-globals': 'correctness',
    'no-non-null-asserted-optional-chain': 'correctness',
     'no-misleading-spread': 'correctness',
      'no-async-constructor': 'correctness',
      'no-approximate-constants': 'correctness',
      'no-implicit-undefined': 'correctness',
'no-misleading-assertion': 'correctness',
   'no-require-imports': 'correctness',
   'no-compare-negation': 'patterns',
  'no-implicit-side-effects': 'patterns',
  'no-implied-eval': 'patterns',
 'no-implicit-map': 'patterns',
  'no-import-assign': 'patterns',
   'no-inferrable-types': 'patterns',
   'no-inline-comments': 'patterns',
   'no-inner-declarations': 'patterns',
   'no-invalid-regexp': 'patterns',
  'no-irregular-whitespace': 'patterns',
  'no-iterator': 'patterns',
  'no-label-var': 'patterns',
  'no-lone-blocks': 'patterns',
  'no-lonely-if': 'patterns',
   'no-loop-func': 'patterns',
   'no-labels': 'patterns',
    'no-loss-of-precision': 'patterns',
 'no-meaningless-void': 'patterns',
    'no-misleading-array-method': 'patterns',
    'no-misleading-character-class': 'patterns',
   'no-misleading-instantiation': 'patterns',
   'no-misleading-ternary': 'patterns',
    'no-mixed-enums': 'patterns',
    'no-mixed-operators': 'patterns',
    'no-misused-new': 'patterns',
   'no-misused-promises': 'patterns',
   'no-multi-assign': 'patterns',
   'no-multiple-empty-lines': 'patterns',
    'no-multi-spaces': 'patterns',
  'no-multi-str': 'patterns',
    'no-namespace': 'patterns',
    'no-negated-condition': 'patterns',
    'no-negated-eq-null': 'patterns',
    'no-nested-ternary': 'patterns',
  'no-new-func': 'patterns',
  'no-new-native-nonconstructor': 'patterns',
  'no-new-wrappers': 'patterns',
  'no-new-symbol': 'patterns',
  'no-non-null-assertion': 'patterns',
  'no-nonoctal-decimal-escape': 'patterns',
  'no-obj-calls': 'patterns',
  'no-object-constructor': 'patterns',
   'no-octal': 'patterns',
   'no-octal-escape': 'patterns',
  'no-param-reassign': 'patterns',
  'no-plusplus': 'patterns',
  'no-promise-as-boolean': 'patterns',
  'no-prototype-builtins': 'patterns',
 'no-property-rename': 'patterns',
 'no-property-signature-style': 'patterns',
 'no-redeclare': 'patterns',
  'no-redundant-boolean': 'patterns',
  'no-redundant-optional-chain': 'patterns',
  'no-redundant-use-strict': 'patterns',
  'no-redundant-type-constituents': 'patterns',
   'no-regex-spaces': 'patterns',
   'no-restricted-exports': 'patterns',
   'no-restricted-syntax': 'patterns',
   'no-restricted-matchers': 'testing',
  'no-restricted-jest-methods': 'testing',
  'no-return-assign': 'patterns',
  'no-return-await': 'patterns',
  'no-return-or-await': 'patterns',
   'no-self-assign': 'patterns',
   'no-self-compare': 'patterns',
   'no-sequences': 'patterns',
  'no-setter-return': 'patterns',
  'no-shadow': 'patterns',
   'no-shadow-restricted-names': 'patterns',
   'no-script-url': 'patterns',
   'no-skipped-tests': 'testing',
  'no-sparse-arrays': 'patterns',
  'no-static-only-class': 'patterns',
  'no-sql-injection': 'security',
  'no-standalone-expect': 'testing',
  'no-test-prefix': 'testing',
  'no-string-concat': 'patterns',
 'no-string-case-convert': 'patterns',
  'no-suspicious-comment': 'patterns',
   'no-tabs': 'patterns',
   'no-sync-in-async': 'performance',
  'no-template-curly-in-string': 'patterns',
  'no-ternary': 'patterns',
   'no-test-return-statement': 'testing',
   'no-useless-async-test': 'testing',
   'no-unsafe-matchers': 'testing',
   'no-misplaced-hook': 'testing',
   'require-hook-description': 'testing',
     'no-async-snapshot': 'testing',
     'no-async-setup': 'testing',
    'no-thenable': 'patterns',
  'no-this-before-super': 'patterns',
  'no-this-alias': 'patterns',
  'no-throw-literal': 'correctness',
   'no-throw-sync': 'patterns',
   'no-trailing-spaces': 'patterns',
   'no-type-only-return': 'patterns',
   'no-type-alias-single-union': 'patterns',
   'no-unicode-bom': 'patterns',
   'no-unassigned-vars': 'patterns',
  'no-undef': 'patterns',
  'no-unexpected-multiline': 'patterns',
  'no-unfinished-todos': 'patterns',
  'no-unnecessary-await': 'patterns',
  'no-unnecessary-await-foreach': 'patterns',
  'no-unnecessary-await-expression': 'patterns',
  'no-unnecessary-assign': 'patterns',
  'no-unnecessary-binding-pattern': 'patterns',
  'no-unnecessary-assert': 'patterns',
   'no-unnecessary-bignumber': 'patterns',
  'no-unnecessary-bitwise-not': 'patterns',
  'no-unnecessary-block': 'patterns',
  'no-unnecessary-as-expression': 'patterns',
  'no-unnecessary-at': 'patterns',
   'no-unnecessary-atob': 'patterns',
  'no-unnecessary-btoa': 'patterns',
   'no-unnecessary-array-from': 'patterns',
   'no-unnecessary-array-from-spread': 'patterns',
   'no-unnecessary-array-flat': 'patterns',
   'no-unnecessary-array-flat-single-level': 'patterns',
   'no-unnecessary-array-every-boolean': 'patterns',
   'no-unnecessary-array-filter-identity': 'patterns',
   'no-unnecessary-array-fill-literal': 'patterns',
  'no-unnecessary-array-isarray-literal': 'patterns',
  'no-unnecessary-array-of-single': 'patterns',
   'no-unnecessary-array-includes-single': 'patterns',
   'no-unnecessary-array-join-empty': 'patterns',
   'no-unnecessary-array-constructor': 'patterns',
  'no-unnecessary-array-concat-single': 'patterns',
  'no-unnecessary-async-function': 'patterns',
  'no-unnecessary-async-arrow': 'patterns',
   'no-unnecessary-boolean': 'patterns',
   'no-unnecessary-boolean-comparison': 'patterns',
    'no-unnecessary-boolean-literal-compare': 'patterns',
     'no-unnecessary-boolean-constructor': 'patterns',
    'no-unnecessary-boolean-wrapper': 'patterns',
     'no-unnecessary-callback-wrapper': 'patterns',
     'no-unnecessary-catch-binding': 'patterns',
     'no-unnecessary-class': 'patterns',
  'no-unnecessary-destructuring': 'patterns',
     'no-unnecessary-concat': 'patterns',
     'no-unnecessary-console-string-concat': 'patterns',
     'no-unnecessary-computed-key': 'patterns',
     'no-unnecessary-continue': 'patterns',
    'no-unnecessary-entries': 'patterns',
      'no-unnecessary-double-negation': 'patterns',
     'no-unnecessary-double-equals': 'patterns',
  'no-unnecessary-condition': 'patterns',
  'no-unnecessary-escape-in-regexp': 'patterns',
  'no-unnecessary-expression-statement': 'patterns',
  'no-unnecessary-for-loop': 'patterns',
  'no-unnecessary-for-each': 'patterns',
  'no-unnecessary-find-index': 'patterns',
  'no-unnecessary-find-last-index': 'patterns',
  'no-unnecessary-find-last': 'patterns',
  'no-unnecessary-find': 'patterns',
  'no-unnecessary-filter': 'patterns',
  'no-unnecessary-fill': 'patterns',
  'no-unnecessary-flat': 'patterns',
  'no-unnecessary-flat-map': 'patterns',
  'no-unnecessary-fragment': 'patterns',
  'no-unnecessary-index-of': 'patterns',
  'no-unnecessary-array-indexof-zero': 'patterns',
  'no-unnecessary-initialization': 'patterns',
  'no-unnecessary-instanceof-array': 'patterns',
  'no-unnecessary-initialization': 'patterns',
  'no-unnecessary-json-parse': 'patterns',
  'no-unnecessary-json-stringify-literal': 'patterns',
   'no-unnecessary-new-array': 'patterns',
  'no-unnecessary-new-boolean': 'patterns',
  'no-unnecessary-new-map': 'patterns',
  'no-unnecessary-new-object': 'patterns',
  'no-unnecessary-new-set': 'patterns',
  'no-unnecessary-new-string': 'patterns',
  'no-unnecessary-new-number': 'patterns',
  'no-unnecessary-parentheses': 'patterns',
  'no-unnecessary-label': 'patterns',
  'no-unnecessary-last-index-of': 'patterns',
  'no-unnecessary-literal-key': 'patterns',
  'no-unnecessary-literal-tostring': 'patterns',
  'no-unnecessary-logical-and-true': 'patterns',
  'no-unnecessary-logical-or-false': 'patterns',
   'no-unnecessary-map': 'patterns',
   'no-unnecessary-array-map-identity': 'patterns',
    'no-unnecessary-math-max-single': 'patterns',
    'no-unnecessary-math-ceil-integer': 'patterns',
    'no-unnecessary-math-round-integer': 'patterns',
    'no-unnecessary-math-floor-integer': 'patterns',
  'no-unnecessary-math-abs-positive': 'patterns',
   'no-unnecessary-null-with-strict': 'patterns',
   'no-unnecessary-object-assign': 'patterns',
   'no-unnecessary-object-assign-same': 'patterns',
    'no-unnecessary-object-freeze-literal': 'patterns',
    'no-unnecessary-object-keys-length': 'patterns',
    'no-unnecessary-object-seal-literal': 'patterns',
   'no-unnecessary-numeric-literal': 'patterns',
  'no-unnecessary-numeric-separator': 'patterns',
   'no-unnecessary-pop': 'patterns',
    'no-unnecessary-polyfills': 'patterns',
   'no-unnecessary-plus-new': 'patterns',
   'no-unnecessary-qualifier': 'patterns',
  'no-unnecessary-shift': 'patterns',
   'no-unnecessary-slice': 'patterns',
   'no-unnecessary-array-slice-zero': 'patterns',
  'no-unnecessary-some': 'patterns',
   'no-unnecessary-readonly': 'patterns',
  'no-unnecessary-splice': 'patterns',
   'no-unnecessary-spread': 'patterns',
   'no-unnecessary-spread-array': 'patterns',
  'no-unnecessary-string-concat': 'patterns',
  'no-unnecessary-string-constructor': 'patterns',
   'no-unnecessary-string-char-at-zero': 'patterns',
   'no-unnecessary-string-at-zero': 'patterns',
   'no-unnecessary-string-codepointat-zero': 'patterns',
  'no-unnecessary-string-length-compare': 'patterns',
  'no-unnecessary-string-wrapper': 'patterns',
  'no-unnecessary-string-split': 'patterns',
  'no-unnecessary-string-split-empty-separator': 'patterns',
   'no-unnecessary-string-starts-empty': 'patterns',
   'no-unnecessary-string-trim-empty': 'patterns',
   'no-unnecessary-string-replace-all': 'patterns',
  'no-unnecessary-string-repeat-zero': 'patterns',
  'no-unnecessary-stringify': 'patterns',
  'no-unnecessary-string-to-number': 'patterns',
  'no-unnecessary-parse-float': 'patterns',
  'no-unnecessary-parse-int': 'patterns',
  'no-unnecessary-parse-int-radix-ten': 'patterns',
  'no-unnecessary-is-finite': 'patterns',
  'no-unnecessary-is-nan': 'patterns',
  'no-unnecessary-decode-uri': 'patterns',
  'no-unnecessary-delete': 'patterns',
  'no-unnecessary-encode-uri': 'patterns',
  'no-unnecessary-regex-constructor': 'patterns',
  'no-unnecessary-regex': 'patterns',
  'no-unnecessary-return-await': 'patterns',
  'no-unnecessary-reduce': 'patterns',
   'no-unnecessary-reduce-right': 'patterns',
  'no-unnecessary-regexp-constructor': 'patterns',
    'no-unnecessary-return-value': 'patterns',
   'no-unnecessary-reverse': 'patterns',
   'no-unnecessary-array-reverse-no-use': 'patterns',
  'no-unnecessary-number-to-fixed': 'patterns',
  'no-unnecessary-number-tofixed-zero': 'patterns',
  'no-unnecessary-number-wrapper': 'patterns',
  'no-unnecessary-number-constructor': 'patterns',
  'no-unnecessary-number-isnan-literal': 'patterns',
  'no-unnecessary-join': 'patterns',
  'no-unnecessary-sort': 'patterns',
   'no-unnecessary-array-sort-no-use': 'patterns',
   'no-unnecessary-array-some-false': 'patterns',
   'no-unnecessary-includes': 'patterns',
  'no-unnecessary-template-expression': 'patterns',
  'no-unnecessary-template-literal': 'patterns',
  'no-unnecessary-template-literal-single': 'patterns',
  'no-unnecessary-to-reversed': 'patterns',
  'no-unnecessary-to-sorted': 'patterns',
  'no-unnecessary-to-spliced': 'patterns',
   'no-unnecessary-then': 'patterns',
   'no-unnecessary-throw-new': 'patterns',
   'no-unnecessary-to-string': 'patterns',
   'no-unnecessary-to-locale-string': 'patterns',
   'no-unnecessary-typeof': 'patterns',
   'no-unnecessary-typeof-string': 'patterns',
   'no-unnecessary-typeof-number': 'patterns',
   'no-unnecessary-typeof-boolean': 'patterns',
  'no-unnecessary-undefined-return': 'patterns',
  'no-unnecessary-null-check': 'patterns',
  'no-unnecessary-null-coalesce-fallback': 'patterns',
  'no-unnecessary-optional-chain': 'patterns',
  'no-unnecessary-optional-call': 'patterns',
  'no-unnecessary-parameter-property': 'patterns',
  'no-unnecessary-promise-wrap': 'patterns',
  'no-unnecessary-promise-resolve': 'patterns',
  'no-unnecessary-promise-all': 'patterns',
  'no-unnecessary-promise-reject': 'patterns',
  'no-unnecessary-escape': 'patterns',
  'no-unnecessary-else': 'patterns',
  'no-unnecessary-every': 'patterns',
 'no-unnecessary-constructor': 'patterns',
  'no-unnecessary-ternary': 'patterns',
  'no-unnecessary-ternary-assign': 'patterns',
  'no-unnecessary-ternary-boolean': 'patterns',
  'no-unnecessary-type-assertion': 'patterns',
  'no-unnecessary-type-constraint': 'patterns',
  'no-unnecessary-type-parameters': 'patterns',
  'no-unnecessary-unshift': 'patterns',
   'no-unnecessary-void': 'patterns',
   'no-unnecessary-void-operator': 'patterns',
   'no-unnecessary-yield': 'patterns',
   'no-unnecessary-values': 'patterns',
   'no-unnecessary-with': 'patterns',
   'no-unnecessary-wait': 'patterns',
  'no-unneeded-ternary': 'patterns',
   'no-unreachable': 'patterns',
  'no-undefined': 'patterns',
  'no-underscore-dangle': 'patterns',
   'no-unsafe-call': 'security',
  'no-unsafe-declaration-merging': 'patterns',
  'no-unsafe-enum-comparison': 'patterns',
  'no-unsafe-finally': 'patterns',
  'no-unsafe-html': 'security',
  'no-unsafe-member-access': 'security',
  'no-unsafe-negation': 'correctness',
  'no-unsafe-optional-chaining': 'patterns',
  'no-unsafe-regex': 'security',
  'no-unsafe-return': 'security',
  'no-unsafe-type-assertion': 'security',
   'no-unused-exports': 'dependencies',
   'no-cjs-imports': 'dependencies',
   'no-dynamic-import': 'dependencies',
    'no-implicit-dependencies': 'dependencies',
    'no-git-dependencies': 'dependencies',
    'no-unused-expressions': 'patterns',
  'no-unused-labels': 'patterns',
  'no-unused-private-members': 'patterns',
  'no-unused-vars': 'patterns',
   'no-use-before-define': 'patterns',
   'no-use-extend-native': 'patterns',
   'no-useless-assignment': 'patterns',
  'no-useless-backreference': 'patterns',
  'no-useless-comparison': 'patterns',
  'no-useless-call': 'patterns',
  'no-useless-computed-key': 'patterns',
  'no-useless-concat': 'patterns',
  'no-useless-constructor': 'patterns',
  'no-useless-escape': 'patterns',
  'no-useless-undefined': 'patterns',
  'no-useless-return': 'patterns',
  'no-useless-switch': 'patterns',
  'no-useless-type-conversion': 'patterns',
  'no-utility-truthiness': 'patterns',
  'no-var': 'patterns',
  'no-var-requires': 'patterns',
  'no-void': 'patterns',
   'no-weak-crypto': 'security',
   'no-innerhtml': 'security',
   'no-banned-properties': 'security',
   'no-document-write': 'security',
   'no-regex-concat': 'security',
   'no-regex-constructor': 'security',
    'no-unsafe-argument': 'security',
    'no-restricted-globals': 'security',
     'no-restricted-imports': 'security',
     'no-restricted-properties': 'security',
      'no-with': 'patterns',
   'no-warning-comments': 'patterns',
    'no-whitespace-before-property': 'patterns',
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
   'prefer-destructuring': 'patterns',
   'prefer-expect-resolves': 'testing',
  'prefer-expect-assertions': 'testing',
  'no-misused-async': 'testing',
  'no-nested-describe': 'testing',
  'no-implicit-return-in-test': 'testing',
  'prefer-hooks-on-top': 'testing',
  'prefer-inline-snapshot': 'testing',
  'prefer-literal-matchers': 'testing',
  'prefer-called-with': 'testing',
  'prefer-equality-matcher': 'testing',
  'prefer-each': 'testing',
  'prefer-mock-promise-shorthand': 'testing',
  'prefer-mock-return-value': 'testing',
  'prefer-resolves-rejects': 'testing',
  'no-redundant-expect': 'testing',
  'prefer-named-snapshot': 'testing',
  'prefer-snapshot-hint': 'testing',
  'prefer-spy-on': 'testing',
   'prefer-strict-equal': 'testing',
   'prefer-string-char-at': 'patterns',
   'prefer-template': 'patterns',
  'prefer-to-be': 'testing',
  'prefer-to-be-null': 'testing',
  'prefer-to-be-undefined': 'testing',
  'prefer-to-contain': 'testing',
  'prefer-to-have-length': 'testing',
  'prefer-todo': 'testing',
  'preserve-caught-error': 'patterns',
  'require-await': 'patterns',
  'require-hook': 'testing',
  'require-to-throw-message': 'testing',
  'require-return-type': 'patterns',
  'require-top-level-describe': 'testing',
  'require-yield': 'patterns',
  'restrict-template-expressions': 'patterns',
   'sort-keys': 'patterns',
   'sort-imports': 'patterns',
   'spaced-comment': 'patterns',
   'strict-bool-expressions': 'patterns',
   'strict-boolean-expressions': 'patterns',
  'use-isnan': 'patterns',
  'valid-expect': 'testing',
  'valid-title': 'testing',
   'valid-typeof': 'patterns',
   'yoda': 'patterns',
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
  noCjsImportsRule,
  noDynamicImportRule,
  noImplicitDependenciesRule,
  noGitDependenciesRule,
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
   noDuplicateConditionRule,
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
  noLoneBlocksRule,
   noLossOfPrecisionRule,
  noMisusedPromisesRule,
  noMultiSpacesRule,
  noNestedTernaryRule,
  noNonNullAssertionRule,
  noObjectConstructorRule,
   noParamReassignRule,
  noPlusplusRule,
   noPromiseAsBooleanRule,
  noReturnAwaitRule,
  noShadowRule,
  noStringConcatRule,
   noThrowSyncRule,
   noUnnecessaryConditionRule,
   noUnnecessaryAwaitRule,
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
    preferNumberIsnanRule,
    preferNumberIsfiniteRule,
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
export { noAwaitInLoopRule, noInefficientArrayMethodsRule, noSyncInAsyncRule } from './performance/index.js'
export { preferObjectSpreadRule, preferOptionalChainRule, noConstantResponseRule, noUnnecessaryAsyncRule, noMisusedPromiseReturnRule } from './performance/index.js'
export {
  noDeprecatedApiRule,
  noDynamicDeleteRule,
  noEvalRule,
  noSqlInjectionRule,
  noUnsafeReturnRule,
   noUnsafeTypeAssertionRule,
    noBannedPropertiesRule,
      noDocumentWriteRule,
       noRegexConcatRule,
       noRegexConstructorRule,
       noUnsafeArgumentRule,
      noRestrictedGlobalsRule,
       noRestrictedImportsRule,
        noRestrictedPropertiesRule,
      } from './security/index.js'
export {
  noConstantBinaryExpressionRule,
  noEmptyCatchRule,
  noEmptyCharacterClassRule,
  noEmptyFunctionRule,
  noThrowLiteralRule,
  noUselessCatchRule,
   noInvalidUseBeforeDefRule,
    noImplicitGlobalsRule,
     noNonNullAssertedOptionalChainRule,
       noMisleadingSpreadRule,
         noAsyncConstructorRule,
        noApproximateConstantsRule,
       noImplicitUndefinedRule,
        noMisleadingAssertionRule,
     } from './correctness/index.js'
