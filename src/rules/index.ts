import type { RuleDefinition } from './types.js'

import { adaptPluginRule } from './adapter.js'
export { type RuleCategory, getRuleCategory } from './categories.js'
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
    noUnnecessaryArrayFromSpread,
    noUnnecessaryArrayFromSetSpreadRule,
    noUnnecessaryArrayFromLengthRule,
      noUnnecessaryArrayFlatRule,
    noUnnecessaryArrayFlatSingleLevel,
    noUnnecessaryArrayFlatMapIdentityRule,
    noUnnecessaryArrayFlatMapSpreadRule,
   noUnnecessaryArrayFlatSpreadRule,
    noUnnecessaryArrayFlatInfinityRule,
    noUnnecessaryArrayKeysSpreadRule,
    noUnnecessaryArrayValuesSpreadRule,
   noUnnecessaryArrayUnshiftSpreadRule,
    noUnnecessaryArrayEveryBoolean,
    noUnnecessaryArrayEveryTrueRule,
    noUnnecessaryArrayEverySpreadRule,
   noUnnecessaryArrayFillSpreadRule,
     noUnnecessaryArrayEntriesSpreadRule,
   noUnnecessaryArrayAtSpreadRule,
      noUnnecessaryArrayFilterIdentity,
     noUnnecessaryArrayFilterSpreadRule,
     noUnnecessaryArrayForEachReturn,
     noUnnecessaryArrayForEachSpreadRule,
     noUnnecessaryArrayPushSpreadRule,
    noUnnecessaryArrayPopSpreadRule,
     noUnnecessaryArrayFindBoolean,
     noUnnecessaryArrayFindLastBooleanRule,
     noUnnecessaryArrayFindLastSpreadRule,
     noUnnecessaryArrayFindLastIndexLiteralRule,
     noUnnecessaryArrayFindLastIndexSpreadRule,
   noUnnecessaryArrayFindSpreadRule,
    noUnnecessaryArrayFindIndexLiteral,
     noUnnecessaryArrayFindIndexSpreadRule,
     noUnnecessaryArrayIndexOfSpreadRule,
     noUnnecessaryArrayLastIndexOfSpreadRule,
        noUnnecessaryArrayFillLiteralRule,
       noUnnecessaryArrayFillSameRule,
     noUnnecessaryArrayIsarrayLiteralRule,
     noUnnecessaryArrayOfSingleRule,
     noUnnecessaryArrayOfSpreadRule,
     noUnnecessaryArrayIncludesSingleRule,
    noUnnecessaryArrayIncludesNaN,
    noUnnecessaryArrayIncludesSpreadRule,
    noUnnecessaryArrayIndexOfLiteralRule,
    noUnnecessaryArrayJoinEmpty,
    noUnnecessaryArrayJoinSpreadRule,
    noUnnecessaryArrayConstructorRule,
   noUnnecessaryArrayConcatSingleRule,
    noUnnecessaryArrayConcatSpreadRule,
   noUnnecessaryArrayCopyWithinSpreadRule,
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
   noUnnecessaryArrayMapIdentity,
   noUnnecessaryArrayMapSpreadRule,
     noUnnecessaryMathMaxSingleRule,
   noUnnecessaryMathCeilInteger,
   noUnnecessaryMathRoundInteger,
   noUnnecessaryMathSignZeroRule,
    noUnnecessaryMathFloorIntegerRule,
    noUnnecessaryMathAbsPositiveRule,
noUnnecessaryNullWithStrictRule,
noUnnecessaryObjectAssignRule,
noUnnecessaryObjectAssignSameRule,
 noUnnecessaryObjectFreezeLiteralRule,
 noUnnecessaryObjectKeysLength,
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
     noUnnecessaryArrayReverseSpreadRule,
     noUnnecessaryArrayReduceSpreadRule,
     noUnnecessaryArrayReduceRightSpreadRule,
     noUnnecessaryNumberToFixedRule,
     noUnnecessaryNumberToExponentialDefaultRule,
     noUnnecessaryNumberToPrecisionDefaultRule,
     noUnnecessaryNumberTofixedZeroRule,
    noUnnecessaryNumberWrapperRule,
     noUnnecessaryNumberConstructorRule,
     noUnnecessaryNumberIsnanLiteralRule,
  noUnnecessaryJoinRule,
   noUnnecessarySortRule,
    noUnnecessaryArraySortNoUseRule,
    noUnnecessaryArraySortSpreadRule,
   noUnnecessaryArraySpliceSpreadRule,
    noUnnecessaryArraySomeFalse,
    noUnnecessaryArraySomeSpreadRule,
   noUnnecessaryArrayShiftSpreadRule,
    noUnnecessaryIncludesRule,
      noUnnecessaryShiftRule,
      noUnnecessarySliceRule,
      noUnnecessaryArraySliceZeroRule,
      noUnnecessaryArraySliceSpreadRule,
    noUnnecessarySomeRule,
     noUnnecessarySpliceRule,
    noUnnecessaryArraySpliceNoUse,
    noUnnecessaryArraySpliceZeroRule,
    noUnnecessaryArrayToReversedNoUse,
    noUnnecessaryArrayToReversedSpreadRule,
    noUnnecessaryArrayToStringArray,
   noUnnecessaryArrayToStringSpreadRule,
  noUnnecessaryArrayToLocaleStringSpreadRule,
  noUnnecessaryArrayToJSONSpreadRule,
     noUnnecessarySpreadRule,
    noUnnecessarySpreadArrayRule,
 noUnnecessaryStringConcatRule,
 noUnnecessaryStringConcatEmptyRule,
 noUnnecessaryStringConcatSpreadRule,
  noUnnecessaryStringConstructorRule,
  noUnnecessaryStringConstructorNonEmptyRule,
  noUnnecessaryStringIncludesEmpty,
  noUnnecessaryStringIncludesSpreadRule,
  noUnnecessaryStringIndexOfEmptyRule,
  noUnnecessaryStringIndexOfSpreadRule,
 noUnnecessaryStringIteratorEmptyRule,
 noUnnecessaryStringLastIndexOfZeroRule,
 noUnnecessaryStringLastIndexOfEmptyRule,
  noUnnecessaryStringLastIndexOfSpreadRule,
   noUnnecessaryStringCharAtZeroRule,
   noUnnecessaryStringCharAtEmptyRule,
   noUnnecessaryStringCharAtSpreadRule,
   noUnnecessaryStringCharCodeAtSpreadRule,

  noUnnecessaryStringAtEmptyRule,
   noUnnecessaryStringAtSpreadRule,
noUnnecessaryStringCodepointatZeroRule,
 noUnnecessaryStringCodePointAtEmptyRule,
 noUnnecessaryStringCodePointAtSpreadRule,
  noUnnecessaryStringLengthCompareRule,
 noUnnecessaryStringLocaleCompareSameRule,
 noUnnecessaryStringLocaleCompareSpreadRule,
  noUnnecessaryStringMatchAllEmptyRule,
  noUnnecessaryStringMatchAllSpreadRule,
  noUnnecessaryStringMatchEmptyRule,
noUnnecessaryStringMatchSpreadRule,
 noUnnecessaryStringNormalizeEmptyRule,
 noUnnecessaryStringNormalizeSpreadRule,
 noUnnecessaryStringEndsWithEmpty,
 noUnnecessaryStringEndsWithSpreadRule,
 noUnnecessaryStringPadStartZero,
 noUnnecessaryStringPadStartEmptyRule,
 noUnnecessaryStringPadStartSpreadRule,
 noUnnecessaryStringPadEndZero,
 noUnnecessaryStringPadEndEmptyRule,
 noUnnecessaryStringPadEndSpreadRule,
     noUnnecessaryStringSplitRule,
     noUnnecessaryStringSplitEmptySeparatorRule,
    noUnnecessaryStringSplitSpreadRule,
     noUnnecessaryStringSplitLengthRule,
    noUnnecessaryStringSliceZeroLen,
    noUnnecessaryStringSliceZeroRule,
    noUnnecessaryStringSliceSpreadRule,
     noUnnecessaryStringStartsEmptyRule,
    noUnnecessaryStringStartsWithNonEmpty,
    noUnnecessaryStringStartsWithEmptyRule,
    noUnnecessaryStringStartsWithSpreadRule,
   noUnnecessaryStringTrimEmptyRule,
   noUnnecessaryStringTrimSpreadRule,
   noUnnecessaryStringTrimStartEmptyRule,
   noUnnecessaryStringTrimStartSpreadRule,

   noUnnecessaryStringTrimEndEmptyRule,
  noUnnecessaryStringTrimEndSpreadRule,
    noUnnecessaryStringReplaceAllRule,
    noUnnecessaryStringReplaceAllEmptyRule,
    noUnnecessaryStringReplaceAllSpreadRule,
    noUnnecessaryStringReplaceEmpty,
    noUnnecessaryStringReplaceSpreadRule,
    noUnnecessaryStringSearchEmptyRule,
    noUnnecessaryStringSearchSpreadRule,
  noUnnecessaryStringRepeatZeroRule,
   noUnnecessaryStringRepeatOneRule,
   noUnnecessaryStringRepeatEmptyRule,
  noUnnecessaryStringRepeatSpreadRule,
  noUnnecessaryStringSubstringZeroRule,
  noUnnecessaryStringSubstringSpreadRule,
   noUnnecessaryStringifyRule,
   noUnnecessaryStringToStringSpreadRule,
   noUnnecessaryStringValueOfSpreadRule,
   noUnnecessaryStringAnchorSpreadRule,
    noUnnecessaryStringFixedSpreadRule,
    noUnnecessaryStringBigSpreadRule,
    noUnnecessaryStringLinkSpreadRule,
    noUnnecessaryStringFontcolorSpreadRule,
    noUnnecessaryStringFontsizeSpreadRule,
    noUnnecessaryStringBlinkSpreadRule,
    noUnnecessaryStringBoldSpreadRule,
    noUnnecessaryStringItalicsSpreadRule,
    noUnnecessaryStringSmallSpreadRule,
    noUnnecessaryStringStrikeSpreadRule,
    noUnnecessaryStringSubSpreadRule,
    noUnnecessaryStringSupSpreadRule,
    noUnnecessaryStringToWellFormedSpreadRule,
    noUnnecessaryNumberToExponentialSpreadRule,
    noUnnecessaryNumberToPrecisionSpreadRule,
    noUnnecessaryNumberToLocaleStringSpreadRule,
    noUnnecessaryNumberValueOfSpreadRule,
    noUnnecessaryNumberToStringSpreadRule,
    noUnnecessaryNumberToFixedSpreadRule,
    noUnnecessaryArrayIsArraySpreadRule,
    noUnnecessaryIsFiniteSpreadRule,
    noUnnecessaryParseFloatSpreadRule,
    noUnnecessaryParseIntSpreadRule,
    noUnnecessaryNumberIsIntegerSpreadRule,
    noUnnecessaryNumberIsNanSpreadRule,
    noUnnecessaryNumberIsFiniteSpreadRule,
    noUnnecessaryNumberIsSafeIntegerSpreadRule,
    noUnnecessaryNumberParseFloatSpreadRule,
    noUnnecessaryNumberParseIntSpreadRule,
    noUnnecessaryObjectKeysSpreadRule,
    noUnnecessaryObjectValuesSpreadRule,
    noUnnecessaryObjectEntriesSpreadRule,
    noUnnecessaryObjectGetPrototypeOfSpreadRule,
    noUnnecessaryObjectFreezeSpreadRule,
    noUnnecessaryObjectSealSpreadRule,
    noUnnecessaryObjectIsSpreadRule,
    noUnnecessaryObjectAssignSpreadRule,
    noUnnecessaryObjectGetOwnPropertyNamesSpreadRule,
    noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule,
    noUnnecessaryObjectGetOwnPropertyDescriptorSpreadRule,
    noUnnecessaryObjectIsFrozenSpreadRule,
    noUnnecessaryObjectIsSealedSpreadRule,
    noUnnecessaryObjectIsExtensibleSpreadRule,
    noUnnecessaryObjectPreventExtensionsSpreadRule,
    noUnnecessaryObjectCreateSpreadRule,
    noUnnecessaryObjectDefinePropertySpreadRule,
    noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule,
    noUnnecessaryObjectSetPrototypeOfSpreadRule,
    noUnnecessaryObjectDefinePropertiesSpreadRule,
    noUnnecessaryPromiseRejectSpreadRule,
    noUnnecessaryPromiseAllSpreadRule,
    noUnnecessaryPromiseRaceSpreadRule,
    noUnnecessaryPromiseAllSettledSpreadRule,
    noUnnecessaryPromiseAnySpreadRule,
    noUnnecessaryMathAbsSpreadRule,
    noUnnecessaryMathCeilSpreadRule,
    noUnnecessaryMathFloorSpreadRule,
    noUnnecessaryMathRoundSpreadRule,
    noUnnecessaryMathSqrtSpreadRule,
    noUnnecessaryMathMaxSpreadRule,
    noUnnecessaryMathMinSpreadRule,
    noUnnecessaryMathSignSpreadRule,
    noUnnecessaryMathTruncSpreadRule,
    noUnnecessaryMathPowSpreadRule,
    noUnnecessaryMathLogSpreadRule,
    noUnnecessaryMathSinSpreadRule,
    noUnnecessaryMathCosSpreadRule,
    noUnnecessaryMathTanSpreadRule,
    noUnnecessaryMathAtanSpreadRule,
    noUnnecessaryMathRandomSpreadRule,
    noUnnecessaryMathExpSpreadRule,
    noUnnecessaryMathAtan2SpreadRule,
    noUnnecessaryMathHypotSpreadRule,
    noUnnecessaryMathLog2SpreadRule,
    noUnnecessaryMathLog10SpreadRule,
    noUnnecessaryMathCbrtSpreadRule,
    noUnnecessaryMathAcosSpreadRule,
    noUnnecessaryMathAsinSpreadRule,
    noUnnecessaryMathAsinhSpreadRule,
    noUnnecessaryMathAcoshSpreadRule,
    noUnnecessaryMathAtanhSpreadRule,
    noUnnecessaryMathClz32SpreadRule,
    noUnnecessaryMathImulSpreadRule,
    noUnnecessaryMathFroundSpreadRule,
    noUnnecessaryReflectApplySpreadRule,
    noUnnecessaryReflectConstructSpreadRule,
    noUnnecessaryReflectGetSpreadRule,
    noUnnecessaryReflectSetSpreadRule,
    noUnnecessaryReflectDeletePropertySpreadRule,
    noUnnecessaryReflectHasSpreadRule,
    noUnnecessaryReflectOwnKeysSpreadRule,
    noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule,
    noUnnecessaryReflectDefinePropertySpreadRule,
    noUnnecessaryReflectGetPrototypeOfSpreadRule,
    noUnnecessaryReflectSetPrototypeOfSpreadRule,
    noUnnecessaryReflectIsExtensibleSpreadRule,
    noUnnecessaryReflectPreventExtensionsSpreadRule,
    noUnnecessaryJsonParseSpreadRule,
    noUnnecessaryJsonStringifySpreadRule,
    noUnnecessaryObjectHasOwnSpreadRule,
    noUnnecessaryConsoleLogSpreadRule,
    noUnnecessaryConsoleWarnSpreadRule,
    noUnnecessaryConsoleErrorSpreadRule,
    noUnnecessaryConsoleInfoSpreadRule,
    noUnnecessaryConsoleDebugSpreadRule,
    noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule,
    noUnnecessaryReflectDefinePropertiesSpreadRule,
    noUnnecessaryReflectIsFrozenSpreadRule,
    noUnnecessaryReflectIsSealedSpreadRule,
    noUnnecessaryEncodeUriSpreadRule,
    noUnnecessaryDecodeUriSpreadRule,
    noUnnecessaryEncodeUriComponentSpreadRule,
    noUnnecessaryDecodeUriComponentSpreadRule,
    noUnnecessaryConsoleTableSpreadRule,
    noUnnecessaryConsoleTraceSpreadRule,
    noUnnecessaryConsoleDirSpreadRule,
    noUnnecessaryConsoleAssertSpreadRule,
    noUnnecessaryConsoleCountSpreadRule,
    noUnnecessaryConsoleClearSpreadRule,
    noUnnecessaryConsoleGroupSpreadRule,
    noUnnecessaryConsoleGroupEndSpreadRule,
    noUnnecessaryConsoleTimeSpreadRule,
    noUnnecessaryConsoleTimeEndSpreadRule,
    noUnnecessaryConsoleTimeLogSpreadRule,
    noUnnecessaryConsoleGroupCollapsedSpreadRule,
    noUnnecessaryConsoleCountResetSpreadRule,
    noUnnecessaryConsoleProfileSpreadRule,
    noUnnecessaryConsoleProfileEndSpreadRule,
    noUnnecessaryConsoleDirxmlSpreadRule,
    noUnnecessaryStringToLowerCaseSameRule,
   noUnnecessaryStringToLowerCaseSpreadRule,
   noUnnecessaryStringToLowerCaseEmptyRule,
   noUnnecessaryStringToLocaleLowerCaseSpreadRule,
    noUnnecessaryStringToUpperCaseSameRule,
    noUnnecessaryStringToUpperCaseEmptyRule,
    noUnnecessaryStringToLocaleUpperCaseSpreadRule,
    noUnnecessaryStringToUpperCaseSpreadRule,
    noUnnecessaryStringWrapperRule,
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
     noUnnecessaryArrayToSortedSpreadRule,
     noUnnecessaryToSplicedRule,
     noUnnecessaryArrayToSplicedSpreadRule,
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
     noUnnecessaryArrayWithSpreadRule,
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
  noUnnecessaryFunctionCallSpreadRule,
  noUnnecessaryFunctionApplySpreadRule,
  noUnnecessaryFunctionBindSpreadRule,
  noUnnecessaryFunctionToStringSpreadRule,
  noUnnecessaryDateToGmtStringSpreadRule,
  noUnnecessaryObjectGroupBySpreadRule,
  noUnnecessaryArrayBufferSliceSpreadRule,
  noUnnecessaryPromiseTrySpreadRule,
  noUnnecessaryObjectFromEntriesSpreadRule,
  noUnnecessaryErrorToStringSpreadRule,
  noUnnecessaryRegexExecSpreadRule,
  noUnnecessaryRegexTestSpreadRule,
  noUnnecessaryArrayBufferIsViewSpreadRule,
  noUnnecessaryStringFromCharCodeSpreadRule,
  noUnnecessaryStringFromCodePointSpreadRule,
  noUnnecessaryStringRawSpreadRule,
  noUnnecessaryDateSetFullYearSpreadRule,
  noUnnecessaryDateSetMonthSpreadRule,
  noUnnecessaryDateSetDateSpreadRule,
  noUnnecessaryDateSetHoursSpreadRule,
  noUnnecessaryDateSetMinutesSpreadRule,
  noUnnecessaryDateSetSecondsSpreadRule,
  noUnnecessaryDateSetMillisecondsSpreadRule,
  noUnnecessaryDateSetUtcFullYearSpreadRule,
  noUnnecessaryDateSetUtcMonthSpreadRule,
  noUnnecessaryDateSetUtcDateSpreadRule,
  noUnnecessaryDateSetUtcHoursSpreadRule,
  noUnnecessaryDateSetUtcMinutesSpreadRule,
  noUnnecessaryDateSetUtcSecondsSpreadRule,
  noUnnecessaryDateSetUtcMillisecondsSpreadRule,
  noUnnecessarySetClearSpreadRule,
  noUnnecessarySetKeysSpreadRule,
  noUnnecessarySetValuesSpreadRule,
  noUnnecessarySetEntriesSpreadRule,
  noUnnecessaryMapKeysSpreadRule,
  noUnnecessaryMapValuesSpreadRule,
  noUnnecessaryMapEntriesSpreadRule,
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
const adaptedNoUnnecessaryArrayFromSpread = adaptPluginRule(noUnnecessaryArrayFromSpread, 'no-unnecessary-array-from-spread')
const adaptedNoUnnecessaryArrayFromSetSpread = adaptPluginRule(noUnnecessaryArrayFromSetSpreadRule, 'no-unnecessary-array-from-set-spread')
const adaptedNoUnnecessaryArrayFromLength = adaptPluginRule(noUnnecessaryArrayFromLengthRule, 'no-unnecessary-array-from-length')
const adaptedNoUnnecessaryArrayFlat = adaptPluginRule(noUnnecessaryArrayFlatRule, 'no-unnecessary-array-flat')
const adaptedNoUnnecessaryArrayFlatSingleLevel = adaptPluginRule(noUnnecessaryArrayFlatSingleLevel, 'no-unnecessary-array-flat-single-level')
const adaptedNoUnnecessaryArrayFlatMapIdentity = adaptPluginRule(noUnnecessaryArrayFlatMapIdentityRule, 'no-unnecessary-array-flat-map-identity')
const adaptedNoUnnecessaryArrayFlatMapSpread = adaptPluginRule(noUnnecessaryArrayFlatMapSpreadRule, 'no-unnecessary-array-flat-map-spread')
const adaptedNoUnnecessaryArrayFlatSpread = adaptPluginRule(noUnnecessaryArrayFlatSpreadRule, 'no-unnecessary-array-flat-spread')
const adaptedNoUnnecessaryArrayFlatInfinity = adaptPluginRule(noUnnecessaryArrayFlatInfinityRule, 'no-unnecessary-array-flat-infinity')
const adaptedNoUnnecessaryArrayKeysSpread = adaptPluginRule(noUnnecessaryArrayKeysSpreadRule, 'no-unnecessary-array-keys-spread')
const adaptedNoUnnecessaryArrayValuesSpread = adaptPluginRule(noUnnecessaryArrayValuesSpreadRule, 'no-unnecessary-array-values-spread')
const adaptedNoUnnecessaryArrayUnshiftSpread = adaptPluginRule(noUnnecessaryArrayUnshiftSpreadRule, 'no-unnecessary-array-unshift-spread')
const adaptedNoUnnecessaryArrayEveryBoolean = adaptPluginRule(noUnnecessaryArrayEveryBoolean, 'no-unnecessary-array-every-boolean')
const adaptedNoUnnecessaryArrayEveryTrue = adaptPluginRule(noUnnecessaryArrayEveryTrueRule, 'no-unnecessary-array-every-true')
const adaptedNoUnnecessaryArrayEverySpread = adaptPluginRule(noUnnecessaryArrayEverySpreadRule, 'no-unnecessary-array-every-spread')
const adaptedNoUnnecessaryArrayFillSpread = adaptPluginRule(noUnnecessaryArrayFillSpreadRule, 'no-unnecessary-array-fill-spread')
const adaptedNoUnnecessaryArrayEntriesSpread = adaptPluginRule(noUnnecessaryArrayEntriesSpreadRule, 'no-unnecessary-array-entries-spread')
const adaptedNoUnnecessaryArrayAtSpread = adaptPluginRule(noUnnecessaryArrayAtSpreadRule, 'no-unnecessary-array-at-spread')
const adaptedNoUnnecessaryArrayFilterIdentity = adaptPluginRule(noUnnecessaryArrayFilterIdentity, 'no-unnecessary-array-filter-identity')
const adaptedNoUnnecessaryArrayFilterSpread = adaptPluginRule(noUnnecessaryArrayFilterSpreadRule, 'no-unnecessary-array-filter-spread')
const adaptedNoUnnecessaryArrayForEachReturn = adaptPluginRule(noUnnecessaryArrayForEachReturn, 'no-unnecessary-array-for-each-return')
const adaptedNoUnnecessaryArrayForEachSpread = adaptPluginRule(noUnnecessaryArrayForEachSpreadRule, 'no-unnecessary-array-for-each-spread')
const adaptedNoUnnecessaryArrayPushSpread = adaptPluginRule(noUnnecessaryArrayPushSpreadRule, 'no-unnecessary-array-push-spread')
const adaptedNoUnnecessaryArrayPopSpread = adaptPluginRule(noUnnecessaryArrayPopSpreadRule, 'no-unnecessary-array-pop-spread')
const adaptedNoUnnecessaryArrayFindBoolean = adaptPluginRule(noUnnecessaryArrayFindBoolean, 'no-unnecessary-array-find-boolean')
 const adaptedNoUnnecessaryArrayFindLastBoolean = adaptPluginRule(noUnnecessaryArrayFindLastBooleanRule, 'no-unnecessary-array-find-last-boolean')
 const adaptedNoUnnecessaryArrayFindLastSpread = adaptPluginRule(noUnnecessaryArrayFindLastSpreadRule, 'no-unnecessary-array-find-last-spread')
 const adaptedNoUnnecessaryArrayFindLastIndexLiteral = adaptPluginRule(noUnnecessaryArrayFindLastIndexLiteralRule, 'no-unnecessary-array-find-last-index-literal')
 const adaptedNoUnnecessaryArrayFindLastIndexSpread = adaptPluginRule(noUnnecessaryArrayFindLastIndexSpreadRule, 'no-unnecessary-array-find-last-index-spread')
const adaptedNoUnnecessaryArrayFindSpread = adaptPluginRule(noUnnecessaryArrayFindSpreadRule, 'no-unnecessary-array-find-spread')
const adaptedNoUnnecessaryArrayFindIndexLiteral = adaptPluginRule(noUnnecessaryArrayFindIndexLiteral, 'no-unnecessary-array-find-index-literal')
 const adaptedNoUnnecessaryArrayFindIndexSpread = adaptPluginRule(noUnnecessaryArrayFindIndexSpreadRule, 'no-unnecessary-array-find-index-spread')
 const adaptedNoUnnecessaryArrayIndexOfSpread = adaptPluginRule(noUnnecessaryArrayIndexOfSpreadRule, 'no-unnecessary-array-index-of-spread')
 const adaptedNoUnnecessaryArrayLastIndexOfSpread = adaptPluginRule(noUnnecessaryArrayLastIndexOfSpreadRule, 'no-unnecessary-array-last-index-of-spread')
 const adaptedNoUnnecessaryArrayFillLiteral = adaptPluginRule(noUnnecessaryArrayFillLiteralRule, 'no-unnecessary-array-fill-literal')
const adaptedNoUnnecessaryArrayFillSame = adaptPluginRule(noUnnecessaryArrayFillSameRule, 'no-unnecessary-array-fill-same')
const adaptedNoUnnecessaryArrayIsarrayLiteral = adaptPluginRule(noUnnecessaryArrayIsarrayLiteralRule, 'no-unnecessary-array-isarray-literal')
const adaptedNoUnnecessaryArrayOfSingle = adaptPluginRule(noUnnecessaryArrayOfSingleRule, 'no-unnecessary-array-of-single')
const adaptedNoUnnecessaryArrayOfSpread = adaptPluginRule(noUnnecessaryArrayOfSpreadRule, 'no-unnecessary-array-of-spread')
const adaptedNoUnnecessaryArrayIncludesSingle = adaptPluginRule(noUnnecessaryArrayIncludesSingleRule, 'no-unnecessary-array-includes-single')
const adaptedNoUnnecessaryArrayIncludesNAN = adaptPluginRule(noUnnecessaryArrayIncludesNaN, 'no-unnecessary-array-includes-nan')
const adaptedNoUnnecessaryArrayIncludesSpread = adaptPluginRule(noUnnecessaryArrayIncludesSpreadRule, 'no-unnecessary-array-includes-spread')
const adaptedNoUnnecessaryArrayIndexOfLiteral = adaptPluginRule(noUnnecessaryArrayIndexOfLiteralRule, 'no-unnecessary-array-index-of-literal')
const adaptedNoUnnecessaryArrayJoinEmpty = adaptPluginRule(noUnnecessaryArrayJoinEmpty, 'no-unnecessary-array-join-empty')
const adaptedNoUnnecessaryArrayJoinSpread = adaptPluginRule(noUnnecessaryArrayJoinSpreadRule, 'no-unnecessary-array-join-spread')
const adaptedNoUnnecessaryArrayConstructor = adaptPluginRule(noUnnecessaryArrayConstructorRule, 'no-unnecessary-array-constructor')
const adaptedNoUnnecessaryArrayConcatSingle = adaptPluginRule(noUnnecessaryArrayConcatSingleRule, 'no-unnecessary-array-concat-single')
const adaptedNoUnnecessaryArrayConcatSpread = adaptPluginRule(noUnnecessaryArrayConcatSpreadRule, 'no-unnecessary-array-concat-spread')
const adaptedNoUnnecessaryArrayCopyWithinSpread = adaptPluginRule(noUnnecessaryArrayCopyWithinSpreadRule, 'no-unnecessary-array-copy-within-spread')
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
const adaptedNoUnnecessaryArrayMapIdentity = adaptPluginRule(noUnnecessaryArrayMapIdentity, 'no-unnecessary-array-map-identity')
const adaptedNoUnnecessaryArrayMapSpread = adaptPluginRule(noUnnecessaryArrayMapSpreadRule, 'no-unnecessary-array-map-spread')
const adaptedNoUnnecessaryMathMaxSingle = adaptPluginRule(noUnnecessaryMathMaxSingleRule, 'no-unnecessary-math-max-single')
const adaptedNoUnnecessaryMathCeilInteger = adaptPluginRule(noUnnecessaryMathCeilInteger, 'no-unnecessary-math-ceil-integer')
const adaptedNoUnnecessaryMathRoundInteger = adaptPluginRule(noUnnecessaryMathRoundInteger, 'no-unnecessary-math-round-integer')
const adaptedNoUnnecessaryMathSignZero = adaptPluginRule(noUnnecessaryMathSignZeroRule, 'no-unnecessary-math-sign-zero')
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
 const adaptedNoUnnecessaryIndexOf = adaptPluginRule(noUnnecessaryIndexOfRule, 'no-unnecessary-index-of')
const adaptedNoUnnecessaryArrayIndexofZero = adaptPluginRule(noUnnecessaryArrayIndexofZeroRule, 'no-unnecessary-array-indexof-zero')
const adaptedNoUnnecessaryInstanceofArray = adaptPluginRule(noUnnecessaryInstanceofArrayRule, 'no-unnecessary-instanceof-array')
const adaptedNoUnnecessaryNullWithStrict = adaptPluginRule(noUnnecessaryNullWithStrictRule, 'no-unnecessary-null-with-strict')
const adaptedNoUnnecessaryObjectAssign = adaptPluginRule(noUnnecessaryObjectAssignRule, 'no-unnecessary-object-assign')
const adaptedNoUnnecessaryObjectAssignSame = adaptPluginRule(noUnnecessaryObjectAssignSameRule, 'no-unnecessary-object-assign-same')
const adaptedNoUnnecessaryObjectFreezeLiteral = adaptPluginRule(noUnnecessaryObjectFreezeLiteralRule, 'no-unnecessary-object-freeze-literal')
const adaptedNoUnnecessaryObjectKeysLength = adaptPluginRule(noUnnecessaryObjectKeysLength, 'no-unnecessary-object-keys-length')
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
const adaptedNoUnnecessaryArrayReverseSpread = adaptPluginRule(noUnnecessaryArrayReverseSpreadRule, 'no-unnecessary-array-reverse-spread')
const adaptedNoUnnecessaryArrayReduceSpread = adaptPluginRule(noUnnecessaryArrayReduceSpreadRule, 'no-unnecessary-array-reduce-spread')
const adaptedNoUnnecessaryArrayReduceRightSpread = adaptPluginRule(noUnnecessaryArrayReduceRightSpreadRule, 'no-unnecessary-array-reduce-right-spread')
const adaptedNoUnnecessaryNumberToFixed = adaptPluginRule(noUnnecessaryNumberToFixedRule, 'no-unnecessary-number-to-fixed')
const adaptedNoUnnecessaryNumberToExponentialDefault = adaptPluginRule(noUnnecessaryNumberToExponentialDefaultRule, 'no-unnecessary-number-to-exponential-default')
const adaptedNoUnnecessaryNumberToPrecisionDefault = adaptPluginRule(noUnnecessaryNumberToPrecisionDefaultRule, 'no-unnecessary-number-to-precision-default')
const adaptedNoUnnecessaryNumberTofixedZero = adaptPluginRule(noUnnecessaryNumberTofixedZeroRule, 'no-unnecessary-number-tofixed-zero')
const adaptedNoUnnecessaryNumberWrapper = adaptPluginRule(noUnnecessaryNumberWrapperRule, 'no-unnecessary-number-wrapper')
const adaptedNoUnnecessaryNumberConstructor = adaptPluginRule(noUnnecessaryNumberConstructorRule, 'no-unnecessary-number-constructor')
const adaptedNoUnnecessaryNumberIsnanLiteral = adaptPluginRule(noUnnecessaryNumberIsnanLiteralRule, 'no-unnecessary-number-isnan-literal')
const adaptedNoUnnecessaryJoin = adaptPluginRule(noUnnecessaryJoinRule, 'no-unnecessary-join')
const adaptedNoUnnecessarySort = adaptPluginRule(noUnnecessarySortRule, 'no-unnecessary-sort')
const adaptedNoUnnecessaryArraySortNoUse = adaptPluginRule(noUnnecessaryArraySortNoUseRule, 'no-unnecessary-array-sort-no-use')
const adaptedNoUnnecessaryArraySortSpread = adaptPluginRule(noUnnecessaryArraySortSpreadRule, 'no-unnecessary-array-sort-spread')
const adaptedNoUnnecessaryArraySpliceSpread = adaptPluginRule(noUnnecessaryArraySpliceSpreadRule, 'no-unnecessary-array-splice-spread')
 const adaptedNoUnnecessaryArraySomeFalse = adaptPluginRule(noUnnecessaryArraySomeFalse, 'no-unnecessary-array-some-false')
 const adaptedNoUnnecessaryArraySomeSpread = adaptPluginRule(noUnnecessaryArraySomeSpreadRule, 'no-unnecessary-array-some-spread')
const adaptedNoUnnecessaryArrayShiftSpread = adaptPluginRule(noUnnecessaryArrayShiftSpreadRule, 'no-unnecessary-array-shift-spread')
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
const adaptedNoUnnecessaryArrayToSplicedSpread = adaptPluginRule(noUnnecessaryArrayToSplicedSpreadRule, 'no-unnecessary-array-to-spliced-spread')
const adaptedNoUnnecessaryToSorted = adaptPluginRule(noUnnecessaryToSortedRule, 'no-unnecessary-to-sorted')
const adaptedNoUnnecessaryArrayToSortedSpread = adaptPluginRule(noUnnecessaryArrayToSortedSpreadRule, 'no-unnecessary-array-to-sorted-spread')
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
const adaptedNoUnnecessaryArraySliceSpread = adaptPluginRule(noUnnecessaryArraySliceSpreadRule, 'no-unnecessary-array-slice-spread')
const adaptedNoUnnecessarySome = adaptPluginRule(noUnnecessarySomeRule, 'no-unnecessary-some')
const adaptedNoUnnecessarySplice = adaptPluginRule(noUnnecessarySpliceRule, 'no-unnecessary-splice')
const adaptedNoUnnecessaryArraySpliceNoUse = adaptPluginRule(noUnnecessaryArraySpliceNoUse, 'no-unnecessary-array-splice-no-use')
const adaptedNoUnnecessaryArraySpliceZero = adaptPluginRule(noUnnecessaryArraySpliceZeroRule, 'no-unnecessary-array-splice-zero')
const adaptedNoUnnecessaryArrayToReversedNoUse = adaptPluginRule(noUnnecessaryArrayToReversedNoUse, 'no-unnecessary-array-to-reversed-no-use')
const adaptedNoUnnecessaryArrayToReversedSpread = adaptPluginRule(noUnnecessaryArrayToReversedSpreadRule, 'no-unnecessary-array-to-reversed-spread')
const adaptedNoUnnecessaryArrayToStringArray = adaptPluginRule(noUnnecessaryArrayToStringArray, 'no-unnecessary-array-to-string-array')
const adaptedNoUnnecessaryArrayToStringSpread = adaptPluginRule(noUnnecessaryArrayToStringSpreadRule, 'no-unnecessary-array-to-string-spread')
const adaptedNoUnnecessaryArrayToLocaleStringSpread = adaptPluginRule(noUnnecessaryArrayToLocaleStringSpreadRule, 'no-unnecessary-array-to-locale-string-spread')
const adaptedNoUnnecessaryArrayToJSONSpread = adaptPluginRule(noUnnecessaryArrayToJSONSpreadRule, 'no-unnecessary-array-to-json-spread')
const adaptedNoUnnecessarySpread = adaptPluginRule(noUnnecessarySpreadRule, 'no-unnecessary-spread')
const adaptedNoUnnecessarySpreadArray = adaptPluginRule(noUnnecessarySpreadArrayRule, 'no-unnecessary-spread-array')
 const adaptedNoUnnecessaryStringConcat = adaptPluginRule(
 noUnnecessaryStringConcatRule,
   'no-unnecessary-string-concat',
 )
const adaptedNoUnnecessaryStringConcatEmpty = adaptPluginRule(noUnnecessaryStringConcatEmptyRule, 'no-unnecessary-string-concat-empty')
const adaptedNoUnnecessaryStringConcatSpread = adaptPluginRule(noUnnecessaryStringConcatSpreadRule, 'no-unnecessary-string-concat-spread')
const adaptedNoUnnecessaryStringConstructor = adaptPluginRule(noUnnecessaryStringConstructorRule, 'no-unnecessary-string-constructor')
const adaptedNoUnnecessaryStringConstructorNonEmpty = adaptPluginRule(noUnnecessaryStringConstructorNonEmptyRule, 'no-unnecessary-string-constructor-non-empty')
const adaptedNoUnnecessaryStringIncludesEmpty = adaptPluginRule(noUnnecessaryStringIncludesEmpty, 'no-unnecessary-string-includes-empty')
const adaptedNoUnnecessaryStringIncludesSpread = adaptPluginRule(noUnnecessaryStringIncludesSpreadRule, 'no-unnecessary-string-includes-spread')
const adaptedNoUnnecessaryStringIndexOfEmpty = adaptPluginRule(noUnnecessaryStringIndexOfEmptyRule, 'no-unnecessary-string-index-of-empty')
const adaptedNoUnnecessaryStringIndexOfSpread = adaptPluginRule(noUnnecessaryStringIndexOfSpreadRule, 'no-unnecessary-string-index-of-spread')
const adaptedNoUnnecessaryStringIteratorEmpty = adaptPluginRule(noUnnecessaryStringIteratorEmptyRule, 'no-unnecessary-string-iterator-empty')
const adaptedNoUnnecessaryStringLastIndexOfZero = adaptPluginRule(noUnnecessaryStringLastIndexOfZeroRule, 'no-unnecessary-string-last-index-of-zero')
const adaptedNoUnnecessaryStringLastIndexOfEmpty = adaptPluginRule(noUnnecessaryStringLastIndexOfEmptyRule, 'no-unnecessary-string-last-index-of-empty')
const adaptedNoUnnecessaryStringLastIndexOfSpread = adaptPluginRule(noUnnecessaryStringLastIndexOfSpreadRule, 'no-unnecessary-string-last-index-of-spread')
const adaptedNoUnnecessaryStringCharAtZero = adaptPluginRule(noUnnecessaryStringCharAtZeroRule, 'no-unnecessary-string-char-at-zero')
const adaptedNoUnnecessaryStringCharAtEmpty = adaptPluginRule(noUnnecessaryStringCharAtEmptyRule, 'no-unnecessary-string-char-at-empty')
const adaptedNoUnnecessaryStringCharAtSpread = adaptPluginRule(noUnnecessaryStringCharAtSpreadRule, 'no-unnecessary-string-char-at-spread')
const adaptedNoUnnecessaryStringCharCodeAtSpread = adaptPluginRule(noUnnecessaryStringCharCodeAtSpreadRule, 'no-unnecessary-string-char-code-at-spread')
const adaptedNoUnnecessaryStringCharCodeAtZero = adaptPluginRule(noUnnecessaryStringCharAtZeroRule, 'no-unnecessary-string-char-code-at-zero')
const adaptedNoUnnecessaryStringAtEmpty = adaptPluginRule(noUnnecessaryStringAtEmptyRule, 'no-unnecessary-string-at-empty')
const adaptedNoUnnecessaryStringAtSpread = adaptPluginRule(noUnnecessaryStringAtSpreadRule, 'no-unnecessary-string-at-spread')
const adaptedNoUnnecessaryStringAtZero = adaptPluginRule(noUnnecessaryStringCharAtZeroRule, 'no-unnecessary-string-at-zero')
const adaptedNoUnnecessaryStringCodepointatZero = adaptPluginRule(noUnnecessaryStringCodepointatZeroRule, 'no-unnecessary-string-codepointat-zero')
const adaptedNoUnnecessaryStringCodePointAtEmpty = adaptPluginRule(noUnnecessaryStringCodePointAtEmptyRule, 'no-unnecessary-string-code-point-at-empty')
const adaptedNoUnnecessaryStringCodePointAtSpread = adaptPluginRule(noUnnecessaryStringCodePointAtSpreadRule, 'no-unnecessary-string-code-point-at-spread')
const adaptedNoUnnecessaryStringLengthCompare = adaptPluginRule(noUnnecessaryStringLengthCompareRule, 'no-unnecessary-string-length-compare')
const adaptedNoUnnecessaryStringLocaleCompareSame = adaptPluginRule(noUnnecessaryStringLocaleCompareSameRule, 'no-unnecessary-string-locale-compare-same')
const adaptedNoUnnecessaryStringLocaleCompareSpread = adaptPluginRule(noUnnecessaryStringLocaleCompareSpreadRule, 'no-unnecessary-string-locale-compare-spread')
const adaptedNoUnnecessaryStringMatchAllEmpty = adaptPluginRule(noUnnecessaryStringMatchAllEmptyRule, 'no-unnecessary-string-match-all-empty')
const adaptedNoUnnecessaryStringMatchAllSpread = adaptPluginRule(noUnnecessaryStringMatchAllSpreadRule, 'no-unnecessary-string-match-all-spread')
const adaptedNoUnnecessaryStringMatchEmpty = adaptPluginRule(noUnnecessaryStringMatchEmptyRule, 'no-unnecessary-string-match-empty')
const adaptedNoUnnecessaryStringMatchSpread = adaptPluginRule(noUnnecessaryStringMatchSpreadRule, 'no-unnecessary-string-match-spread')
const adaptedNoUnnecessaryStringNormalizeEmpty = adaptPluginRule(noUnnecessaryStringNormalizeEmptyRule, 'no-unnecessary-string-normalize-empty')
const adaptedNoUnnecessaryStringNormalizeSpread = adaptPluginRule(noUnnecessaryStringNormalizeSpreadRule, 'no-unnecessary-string-normalize-spread')
const adaptedNoUnnecessaryStringEndsWithEmpty = adaptPluginRule(noUnnecessaryStringEndsWithEmpty, 'no-unnecessary-string-ends-with-empty')
const adaptedNoUnnecessaryStringEndsWithSpread = adaptPluginRule(noUnnecessaryStringEndsWithSpreadRule, 'no-unnecessary-string-ends-with-spread')
const adaptedNoUnnecessaryStringPadStartZero = adaptPluginRule(noUnnecessaryStringPadStartZero, 'no-unnecessary-string-pad-start-zero')
const adaptedNoUnnecessaryStringPadStartEmpty = adaptPluginRule(noUnnecessaryStringPadStartEmptyRule, 'no-unnecessary-string-pad-start-empty')
const adaptedNoUnnecessaryStringPadStartSpread = adaptPluginRule(noUnnecessaryStringPadStartSpreadRule, 'no-unnecessary-string-pad-start-spread')
const adaptedNoUnnecessaryStringPadEndZero = adaptPluginRule(noUnnecessaryStringPadEndZero, 'no-unnecessary-string-pad-end-zero')
const adaptedNoUnnecessaryStringPadEndEmpty = adaptPluginRule(noUnnecessaryStringPadEndEmptyRule, 'no-unnecessary-string-pad-end-empty')
const adaptedNoUnnecessaryStringPadEndSpread = adaptPluginRule(noUnnecessaryStringPadEndSpreadRule, 'no-unnecessary-string-pad-end-spread')
const adaptedNoUnnecessaryStringWrapper = adaptPluginRule(noUnnecessaryStringWrapperRule, 'no-unnecessary-string-wrapper')
const adaptedNoUnnecessaryStringify = adaptPluginRule(noUnnecessaryStringifyRule, 'no-unnecessary-stringify')
const adaptedNoUnnecessaryStringToStringSpread = adaptPluginRule(noUnnecessaryStringToStringSpreadRule, 'no-unnecessary-string-to-string-spread')
const adaptedNoUnnecessaryStringValueOfSpread = adaptPluginRule(noUnnecessaryStringValueOfSpreadRule, 'no-unnecessary-string-value-of-spread')
const adaptedNoUnnecessaryStringAnchorSpread = adaptPluginRule(noUnnecessaryStringAnchorSpreadRule, 'no-unnecessary-string-anchor-spread')
const adaptedNoUnnecessaryStringFixedSpread = adaptPluginRule(noUnnecessaryStringFixedSpreadRule, 'no-unnecessary-string-fixed-spread')
const adaptedNoUnnecessaryStringBigSpread = adaptPluginRule(noUnnecessaryStringBigSpreadRule, 'no-unnecessary-string-big-spread')
const adaptedNoUnnecessaryStringLinkSpread = adaptPluginRule(noUnnecessaryStringLinkSpreadRule, 'no-unnecessary-string-link-spread')
const adaptedNoUnnecessaryStringFontcolorSpread = adaptPluginRule(noUnnecessaryStringFontcolorSpreadRule, 'no-unnecessary-string-fontcolor-spread')
const adaptedNoUnnecessaryStringFontsizeSpread = adaptPluginRule(noUnnecessaryStringFontsizeSpreadRule, 'no-unnecessary-string-fontsize-spread')
const adaptedNoUnnecessaryStringBlinkSpread = adaptPluginRule(noUnnecessaryStringBlinkSpreadRule, 'no-unnecessary-string-blink-spread')
const adaptedNoUnnecessaryStringBoldSpread = adaptPluginRule(noUnnecessaryStringBoldSpreadRule, 'no-unnecessary-string-bold-spread')
const adaptedNoUnnecessaryStringItalicsSpread = adaptPluginRule(noUnnecessaryStringItalicsSpreadRule, 'no-unnecessary-string-italics-spread')
const adaptedNoUnnecessaryStringSmallSpread = adaptPluginRule(noUnnecessaryStringSmallSpreadRule, 'no-unnecessary-string-small-spread')
const adaptedNoUnnecessaryStringStrikeSpread = adaptPluginRule(noUnnecessaryStringStrikeSpreadRule, 'no-unnecessary-string-strike-spread')
const adaptedNoUnnecessaryStringSubSpread = adaptPluginRule(noUnnecessaryStringSubSpreadRule, 'no-unnecessary-string-sub-spread')
const adaptedNoUnnecessaryStringSupSpread = adaptPluginRule(noUnnecessaryStringSupSpreadRule, 'no-unnecessary-string-sup-spread')
const adaptedNoUnnecessaryStringToWellFormedSpread = adaptPluginRule(noUnnecessaryStringToWellFormedSpreadRule, 'no-unnecessary-string-to-well-formed-spread')
const adaptedNoUnnecessaryNumberToExponentialSpread = adaptPluginRule(noUnnecessaryNumberToExponentialSpreadRule, 'no-unnecessary-number-to-exponential-spread')
const adaptedNoUnnecessaryNumberToPrecisionSpread = adaptPluginRule(noUnnecessaryNumberToPrecisionSpreadRule, 'no-unnecessary-number-to-precision-spread')
const adaptedNoUnnecessaryNumberToLocaleStringSpread = adaptPluginRule(noUnnecessaryNumberToLocaleStringSpreadRule, 'no-unnecessary-number-to-locale-string-spread')
const adaptedNoUnnecessaryNumberValueOfSpread = adaptPluginRule(noUnnecessaryNumberValueOfSpreadRule, 'no-unnecessary-number-value-of-spread')
const adaptedNoUnnecessaryNumberToStringSpread = adaptPluginRule(noUnnecessaryNumberToStringSpreadRule, 'no-unnecessary-number-to-string-spread')
const adaptedNoUnnecessaryNumberToFixedSpread = adaptPluginRule(noUnnecessaryNumberToFixedSpreadRule, 'no-unnecessary-number-to-fixed-spread')
const adaptedNoUnnecessaryArrayIsArraySpread = adaptPluginRule(noUnnecessaryArrayIsArraySpreadRule, 'no-unnecessary-array-is-array-spread')
const adaptedNoUnnecessaryIsNanSpread = adaptPluginRule(noUnnecessaryArrayIsArraySpreadRule, 'no-unnecessary-is-nan-spread')
const adaptedNoUnnecessaryIsFiniteSpread = adaptPluginRule(noUnnecessaryIsFiniteSpreadRule, 'no-unnecessary-is-finite-spread')
const adaptedNoUnnecessaryParseFloatSpread = adaptPluginRule(noUnnecessaryParseFloatSpreadRule, 'no-unnecessary-parse-float-spread')
const adaptedNoUnnecessaryParseIntSpread = adaptPluginRule(noUnnecessaryParseIntSpreadRule, 'no-unnecessary-parse-int-spread')
const adaptedNoUnnecessaryNumberIsIntegerSpread = adaptPluginRule(noUnnecessaryNumberIsIntegerSpreadRule, 'no-unnecessary-number-is-integer-spread')
const adaptedNoUnnecessaryNumberIsNanSpread = adaptPluginRule(noUnnecessaryNumberIsNanSpreadRule, 'no-unnecessary-number-is-nan-spread')
const adaptedNoUnnecessaryNumberIsFiniteSpread = adaptPluginRule(noUnnecessaryNumberIsFiniteSpreadRule, 'no-unnecessary-number-is-finite-spread')
const adaptedNoUnnecessaryNumberIsSafeIntegerSpread = adaptPluginRule(noUnnecessaryNumberIsSafeIntegerSpreadRule, 'no-unnecessary-number-is-safe-integer-spread')
const adaptedNoUnnecessaryNumberParseFloatSpread = adaptPluginRule(noUnnecessaryNumberParseFloatSpreadRule, 'no-unnecessary-number-parse-float-spread')
const adaptedNoUnnecessaryNumberParseIntSpread = adaptPluginRule(noUnnecessaryNumberParseIntSpreadRule, 'no-unnecessary-number-parse-int-spread')
const adaptedNoUnnecessaryObjectKeysSpread = adaptPluginRule(noUnnecessaryObjectKeysSpreadRule, 'no-unnecessary-object-keys-spread')
const adaptedNoUnnecessaryObjectValuesSpread = adaptPluginRule(noUnnecessaryObjectValuesSpreadRule, 'no-unnecessary-object-values-spread')
const adaptedNoUnnecessaryObjectEntriesSpread = adaptPluginRule(noUnnecessaryObjectEntriesSpreadRule, 'no-unnecessary-object-entries-spread')
const adaptedNoUnnecessaryObjectGetPrototypeOfSpread = adaptPluginRule(noUnnecessaryObjectGetPrototypeOfSpreadRule, 'no-unnecessary-object-get-prototype-of-spread')
const adaptedNoUnnecessaryObjectFreezeSpread = adaptPluginRule(noUnnecessaryObjectFreezeSpreadRule, 'no-unnecessary-object-freeze-spread')
const adaptedNoUnnecessaryObjectSealSpread = adaptPluginRule(noUnnecessaryObjectSealSpreadRule, 'no-unnecessary-object-seal-spread')
const adaptedNoUnnecessaryObjectIsSpread = adaptPluginRule(noUnnecessaryObjectIsSpreadRule, 'no-unnecessary-object-is-spread')
const adaptedNoUnnecessaryObjectAssignSpread = adaptPluginRule(noUnnecessaryObjectAssignSpreadRule, 'no-unnecessary-object-assign-spread')
const adaptedNoUnnecessaryObjectGetOwnPropertyNamesSpread = adaptPluginRule(noUnnecessaryObjectGetOwnPropertyNamesSpreadRule, 'no-unnecessary-object-get-own-property-names-spread')
const adaptedNoUnnecessaryObjectGetOwnPropertySymbolsSpread = adaptPluginRule(noUnnecessaryObjectGetOwnPropertySymbolsSpreadRule, 'no-unnecessary-object-get-own-property-symbols-spread')
const adaptedNoUnnecessaryObjectGetOwnPropertyDescriptorSpread = adaptPluginRule(noUnnecessaryObjectGetOwnPropertyDescriptorSpreadRule, 'no-unnecessary-object-get-own-property-descriptor-spread')
const adaptedNoUnnecessaryObjectIsFrozenSpread = adaptPluginRule(noUnnecessaryObjectIsFrozenSpreadRule, 'no-unnecessary-object-is-frozen-spread')
const adaptedNoUnnecessaryObjectIsSealedSpread = adaptPluginRule(noUnnecessaryObjectIsSealedSpreadRule, 'no-unnecessary-object-is-sealed-spread')
const adaptedNoUnnecessaryObjectIsExtensibleSpread = adaptPluginRule(noUnnecessaryObjectIsExtensibleSpreadRule, 'no-unnecessary-object-is-extensible-spread')
const adaptedNoUnnecessaryObjectPreventExtensionsSpread = adaptPluginRule(noUnnecessaryObjectPreventExtensionsSpreadRule, 'no-unnecessary-object-prevent-extensions-spread')
const adaptedNoUnnecessaryObjectCreateSpread = adaptPluginRule(noUnnecessaryObjectCreateSpreadRule, 'no-unnecessary-object-create-spread')
const adaptedNoUnnecessaryObjectDefinePropertySpread = adaptPluginRule(noUnnecessaryObjectDefinePropertySpreadRule, 'no-unnecessary-object-define-property-spread')
const adaptedNoUnnecessaryObjectGetOwnPropertyDescriptorsSpread = adaptPluginRule(noUnnecessaryObjectGetOwnPropertyDescriptorsSpreadRule, 'no-unnecessary-object-get-own-property-descriptors-spread')
const adaptedNoUnnecessaryObjectSetPrototypeOfSpread = adaptPluginRule(noUnnecessaryObjectSetPrototypeOfSpreadRule, 'no-unnecessary-object-set-prototype-of-spread')
const adaptedNoUnnecessaryObjectDefinePropertiesSpread = adaptPluginRule(noUnnecessaryObjectDefinePropertiesSpreadRule, 'no-unnecessary-object-define-properties-spread')
const adaptedNoUnnecessaryPromiseRejectSpread = adaptPluginRule(noUnnecessaryPromiseRejectSpreadRule, 'no-unnecessary-promise-reject-spread')
const adaptedNoUnnecessaryPromiseAllSpread = adaptPluginRule(noUnnecessaryPromiseAllSpreadRule, 'no-unnecessary-promise-all-spread')
const adaptedNoUnnecessaryPromiseRaceSpread = adaptPluginRule(noUnnecessaryPromiseRaceSpreadRule, 'no-unnecessary-promise-race-spread')
const adaptedNoUnnecessaryPromiseAllSettledSpread = adaptPluginRule(noUnnecessaryPromiseAllSettledSpreadRule, 'no-unnecessary-promise-all-settled-spread')
const adaptedNoUnnecessaryPromiseAnySpread = adaptPluginRule(noUnnecessaryPromiseAnySpreadRule, 'no-unnecessary-promise-any-spread')
const adaptedNoUnnecessaryMathAbsSpread = adaptPluginRule(noUnnecessaryMathAbsSpreadRule, 'no-unnecessary-math-abs-spread')
const adaptedNoUnnecessaryMathCeilSpread = adaptPluginRule(noUnnecessaryMathCeilSpreadRule, 'no-unnecessary-math-ceil-spread')
const adaptedNoUnnecessaryMathFloorSpread = adaptPluginRule(noUnnecessaryMathFloorSpreadRule, 'no-unnecessary-math-floor-spread')
const adaptedNoUnnecessaryMathRoundSpread = adaptPluginRule(noUnnecessaryMathRoundSpreadRule, 'no-unnecessary-math-round-spread')
const adaptedNoUnnecessaryMathSqrtSpread = adaptPluginRule(noUnnecessaryMathSqrtSpreadRule, 'no-unnecessary-math-sqrt-spread')
const adaptedNoUnnecessaryMathMaxSpread = adaptPluginRule(noUnnecessaryMathMaxSpreadRule, 'no-unnecessary-math-max-spread')
const adaptedNoUnnecessaryMathMinSpread = adaptPluginRule(noUnnecessaryMathMinSpreadRule, 'no-unnecessary-math-min-spread')
const adaptedNoUnnecessaryMathSignSpread = adaptPluginRule(noUnnecessaryMathSignSpreadRule, 'no-unnecessary-math-sign-spread')
const adaptedNoUnnecessaryMathTruncSpread = adaptPluginRule(noUnnecessaryMathTruncSpreadRule, 'no-unnecessary-math-trunc-spread')
const adaptedNoUnnecessaryMathPowSpread = adaptPluginRule(noUnnecessaryMathPowSpreadRule, 'no-unnecessary-math-pow-spread')
const adaptedNoUnnecessaryMathLogSpread = adaptPluginRule(noUnnecessaryMathLogSpreadRule, 'no-unnecessary-math-log-spread')
const adaptedNoUnnecessaryMathSinSpread = adaptPluginRule(noUnnecessaryMathSinSpreadRule, 'no-unnecessary-math-sin-spread')
const adaptedNoUnnecessaryMathCosSpread = adaptPluginRule(noUnnecessaryMathCosSpreadRule, 'no-unnecessary-math-cos-spread')
const adaptedNoUnnecessaryMathTanSpread = adaptPluginRule(noUnnecessaryMathTanSpreadRule, 'no-unnecessary-math-tan-spread')
const adaptedNoUnnecessaryMathAtanSpread = adaptPluginRule(noUnnecessaryMathAtanSpreadRule, 'no-unnecessary-math-atan-spread')
const adaptedNoUnnecessaryMathRandomSpread = adaptPluginRule(noUnnecessaryMathRandomSpreadRule, 'no-unnecessary-math-random-spread')
const adaptedNoUnnecessaryMathExpSpread = adaptPluginRule(noUnnecessaryMathExpSpreadRule, 'no-unnecessary-math-exp-spread')
const adaptedNoUnnecessaryMathAtan2Spread = adaptPluginRule(noUnnecessaryMathAtan2SpreadRule, 'no-unnecessary-math-atan2-spread')
const adaptedNoUnnecessaryMathHypotSpread = adaptPluginRule(noUnnecessaryMathHypotSpreadRule, 'no-unnecessary-math-hypot-spread')
const adaptedNoUnnecessaryMathLog2Spread = adaptPluginRule(noUnnecessaryMathLog2SpreadRule, 'no-unnecessary-math-log2-spread')
const adaptedNoUnnecessaryMathLog10Spread = adaptPluginRule(noUnnecessaryMathLog10SpreadRule, 'no-unnecessary-math-log10-spread')
const adaptedNoUnnecessaryMathCbrtSpread = adaptPluginRule(noUnnecessaryMathCbrtSpreadRule, 'no-unnecessary-math-cbrt-spread')
const adaptedNoUnnecessaryMathAcosSpread = adaptPluginRule(noUnnecessaryMathAcosSpreadRule, 'no-unnecessary-math-acos-spread')
const adaptedNoUnnecessaryMathAsinSpread = adaptPluginRule(noUnnecessaryMathAsinSpreadRule, 'no-unnecessary-math-asin-spread')
const adaptedNoUnnecessaryMathAsinhSpread = adaptPluginRule(noUnnecessaryMathAsinhSpreadRule, 'no-unnecessary-math-asinh-spread')
const adaptedNoUnnecessaryMathAcoshSpread = adaptPluginRule(noUnnecessaryMathAcoshSpreadRule, 'no-unnecessary-math-acosh-spread')
const adaptedNoUnnecessaryMathAtanhSpread = adaptPluginRule(noUnnecessaryMathAtanhSpreadRule, 'no-unnecessary-math-atanh-spread')
const adaptedNoUnnecessaryMathClz32Spread = adaptPluginRule(noUnnecessaryMathClz32SpreadRule, 'no-unnecessary-math-clz32-spread')
const adaptedNoUnnecessaryMathImulSpread = adaptPluginRule(noUnnecessaryMathImulSpreadRule, 'no-unnecessary-math-imul-spread')
const adaptedNoUnnecessaryMathFroundSpread = adaptPluginRule(noUnnecessaryMathFroundSpreadRule, 'no-unnecessary-math-fround-spread')
const adaptedNoUnnecessaryReflectApplySpread = adaptPluginRule(noUnnecessaryReflectApplySpreadRule, 'no-unnecessary-reflect-apply-spread')
const adaptedNoUnnecessaryReflectConstructSpread = adaptPluginRule(noUnnecessaryReflectConstructSpreadRule, 'no-unnecessary-reflect-construct-spread')
const adaptedNoUnnecessaryReflectGetSpread = adaptPluginRule(noUnnecessaryReflectGetSpreadRule, 'no-unnecessary-reflect-get-spread')
const adaptedNoUnnecessaryReflectSetSpread = adaptPluginRule(noUnnecessaryReflectSetSpreadRule, 'no-unnecessary-reflect-set-spread')
const adaptedNoUnnecessaryReflectDeletePropertySpread = adaptPluginRule(noUnnecessaryReflectDeletePropertySpreadRule, 'no-unnecessary-reflect-delete-property-spread')
const adaptedNoUnnecessaryReflectHasSpread = adaptPluginRule(noUnnecessaryReflectHasSpreadRule, 'no-unnecessary-reflect-has-spread')
const adaptedNoUnnecessaryReflectOwnKeysSpread = adaptPluginRule(noUnnecessaryReflectOwnKeysSpreadRule, 'no-unnecessary-reflect-own-keys-spread')
const adaptedNoUnnecessaryReflectGetOwnPropertyDescriptorSpread = adaptPluginRule(noUnnecessaryReflectGetOwnPropertyDescriptorSpreadRule, 'no-unnecessary-reflect-get-own-property-descriptor-spread')
const adaptedNoUnnecessaryReflectDefinePropertySpread = adaptPluginRule(noUnnecessaryReflectDefinePropertySpreadRule, 'no-unnecessary-reflect-define-property-spread')
const adaptedNoUnnecessaryReflectGetPrototypeOfSpread = adaptPluginRule(noUnnecessaryReflectGetPrototypeOfSpreadRule, 'no-unnecessary-reflect-get-prototype-of-spread')
const adaptedNoUnnecessaryReflectSetPrototypeOfSpread = adaptPluginRule(noUnnecessaryReflectSetPrototypeOfSpreadRule, 'no-unnecessary-reflect-set-prototype-of-spread')
const adaptedNoUnnecessaryReflectIsExtensibleSpread = adaptPluginRule(noUnnecessaryReflectIsExtensibleSpreadRule, 'no-unnecessary-reflect-is-extensible-spread')
const adaptedNoUnnecessaryReflectPreventExtensionsSpread = adaptPluginRule(noUnnecessaryReflectPreventExtensionsSpreadRule, 'no-unnecessary-reflect-prevent-extensions-spread')
const adaptedNoUnnecessaryJsonParseSpread = adaptPluginRule(noUnnecessaryJsonParseSpreadRule, 'no-unnecessary-json-parse-spread')
const adaptedNoUnnecessaryJsonStringifySpread = adaptPluginRule(noUnnecessaryJsonStringifySpreadRule, 'no-unnecessary-json-stringify-spread')
const adaptedNoUnnecessaryObjectHasOwnSpread = adaptPluginRule(noUnnecessaryObjectHasOwnSpreadRule, 'no-unnecessary-object-has-own-spread')
const adaptedNoUnnecessaryConsoleLogSpread = adaptPluginRule(noUnnecessaryConsoleLogSpreadRule, 'no-unnecessary-console-log-spread')
const adaptedNoUnnecessaryConsoleWarnSpread = adaptPluginRule(noUnnecessaryConsoleWarnSpreadRule, 'no-unnecessary-console-warn-spread')
const adaptedNoUnnecessaryConsoleErrorSpread = adaptPluginRule(noUnnecessaryConsoleErrorSpreadRule, 'no-unnecessary-console-error-spread')
const adaptedNoUnnecessaryConsoleInfoSpread = adaptPluginRule(noUnnecessaryConsoleInfoSpreadRule, 'no-unnecessary-console-info-spread')
const adaptedNoUnnecessaryConsoleDebugSpread = adaptPluginRule(noUnnecessaryConsoleDebugSpreadRule, 'no-unnecessary-console-debug-spread')
const adaptedNoUnnecessaryReflectGetOwnPropertySymbolsSpread = adaptPluginRule(noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule, 'no-unnecessary-reflect-get-own-property-symbols-spread')
const adaptedNoUnnecessaryReflectDefinePropertiesSpread = adaptPluginRule(noUnnecessaryReflectDefinePropertiesSpreadRule, 'no-unnecessary-reflect-define-properties-spread')
const adaptedNoUnnecessaryReflectIsFrozenSpread = adaptPluginRule(noUnnecessaryReflectIsFrozenSpreadRule, 'no-unnecessary-reflect-is-frozen-spread')
const adaptedNoUnnecessaryReflectIsSealedSpread = adaptPluginRule(noUnnecessaryReflectIsSealedSpreadRule, 'no-unnecessary-reflect-is-sealed-spread')
const adaptedNoUnnecessaryEncodeUriSpread = adaptPluginRule(noUnnecessaryEncodeUriSpreadRule, 'no-unnecessary-encode-uri-spread')
const adaptedNoUnnecessaryDecodeUriSpread = adaptPluginRule(noUnnecessaryDecodeUriSpreadRule, 'no-unnecessary-decode-uri-spread')
const adaptedNoUnnecessaryEncodeUriComponentSpread = adaptPluginRule(noUnnecessaryEncodeUriComponentSpreadRule, 'no-unnecessary-encode-uri-component-spread')
const adaptedNoUnnecessaryDecodeUriComponentSpread = adaptPluginRule(noUnnecessaryDecodeUriComponentSpreadRule, 'no-unnecessary-decode-uri-component-spread')
const adaptedNoUnnecessaryConsoleTableSpread = adaptPluginRule(noUnnecessaryConsoleTableSpreadRule, 'no-unnecessary-console-table-spread')
const adaptedNoUnnecessaryConsoleTraceSpread = adaptPluginRule(noUnnecessaryConsoleTraceSpreadRule, 'no-unnecessary-console-trace-spread')
const adaptedNoUnnecessaryConsoleDirSpread = adaptPluginRule(noUnnecessaryConsoleDirSpreadRule, 'no-unnecessary-console-dir-spread')
const adaptedNoUnnecessaryConsoleAssertSpread = adaptPluginRule(noUnnecessaryConsoleAssertSpreadRule, 'no-unnecessary-console-assert-spread')
const adaptedNoUnnecessaryConsoleCountSpread = adaptPluginRule(noUnnecessaryConsoleCountSpreadRule, 'no-unnecessary-console-count-spread')
const adaptedNoUnnecessaryConsoleClearSpread = adaptPluginRule(noUnnecessaryConsoleClearSpreadRule, 'no-unnecessary-console-clear-spread')
const adaptedNoUnnecessaryConsoleGroupSpread = adaptPluginRule(noUnnecessaryConsoleGroupSpreadRule, 'no-unnecessary-console-group-spread')
const adaptedNoUnnecessaryConsoleGroupEndSpread = adaptPluginRule(noUnnecessaryConsoleGroupEndSpreadRule, 'no-unnecessary-console-group-end-spread')
const adaptedNoUnnecessaryConsoleTimeSpread = adaptPluginRule(noUnnecessaryConsoleTimeSpreadRule, 'no-unnecessary-console-time-spread')
const adaptedNoUnnecessaryConsoleTimeEndSpread = adaptPluginRule(noUnnecessaryConsoleTimeEndSpreadRule, 'no-unnecessary-console-time-end-spread')
const adaptedNoUnnecessaryConsoleTimeLogSpread = adaptPluginRule(noUnnecessaryConsoleTimeLogSpreadRule, 'no-unnecessary-console-time-log-spread')
const adaptedNoUnnecessaryConsoleGroupCollapsedSpread = adaptPluginRule(noUnnecessaryConsoleGroupCollapsedSpreadRule, 'no-unnecessary-console-group-collapsed-spread')
const adaptedNoUnnecessaryConsoleCountResetSpread = adaptPluginRule(noUnnecessaryConsoleCountResetSpreadRule, 'no-unnecessary-console-count-reset-spread')
const adaptedNoUnnecessaryConsoleProfileSpread = adaptPluginRule(noUnnecessaryConsoleProfileSpreadRule, 'no-unnecessary-console-profile-spread')
const adaptedNoUnnecessaryConsoleProfileEndSpread = adaptPluginRule(noUnnecessaryConsoleProfileEndSpreadRule, 'no-unnecessary-console-profile-end-spread')
const adaptedNoUnnecessaryConsoleDirxmlSpread = adaptPluginRule(noUnnecessaryConsoleDirxmlSpreadRule, 'no-unnecessary-console-dirxml-spread')
const adaptedNoUnnecessaryMapSetSpread = adaptPluginRule(noUnnecessaryMapSetSpreadRule, 'no-unnecessary-map-set-spread')
const adaptedNoUnnecessaryMapForEachSpread = adaptPluginRule(noUnnecessaryMapForEachSpreadRule, 'no-unnecessary-map-for-each-spread')
const adaptedNoUnnecessarySetAddSpread = adaptPluginRule(noUnnecessarySetAddSpreadRule, 'no-unnecessary-set-add-spread')
const adaptedNoUnnecessarySetForEachSpread = adaptPluginRule(noUnnecessarySetForEachSpreadRule, 'no-unnecessary-set-for-each-spread')
const adaptedNoUnnecessaryWeakMapSetSpread = adaptPluginRule(noUnnecessaryWeakMapSetSpreadRule, 'no-unnecessary-weakmap-set-spread')
const adaptedNoUnnecessaryWeakSetAddSpread = adaptPluginRule(noUnnecessaryWeakSetAddSpreadRule, 'no-unnecessary-weakset-add-spread')
const adaptedNoUnnecessaryDateNowSpread = adaptPluginRule(noUnnecessaryDateNowSpreadRule, 'no-unnecessary-date-now-spread')
const adaptedNoUnnecessaryRegExpTestSpread = adaptPluginRule(noUnnecessaryRegExpTestSpreadRule, 'no-unnecessary-reg-exp-test-spread')
const adaptedNoUnnecessaryDateParseSpread = adaptPluginRule(noUnnecessaryDateParseSpreadRule, 'no-unnecessary-date-parse-spread')
const adaptedNoUnnecessaryDateGetFullYearSpread = adaptPluginRule(noUnnecessaryDateGetFullYearSpreadRule, 'no-unnecessary-date-get-full-year-spread')
const adaptedNoUnnecessaryRegExpExecSpread = adaptPluginRule(noUnnecessaryRegExpExecSpreadRule, 'no-unnecessary-reg-exp-exec-spread')
const adaptedNoUnnecessarySymbolForSpread = adaptPluginRule(noUnnecessarySymbolForSpreadRule, 'no-unnecessary-symbol-for-spread')
const adaptedNoUnnecessaryDateGetMonthSpread = adaptPluginRule(noUnnecessaryDateGetMonthSpreadRule, 'no-unnecessary-date-get-month-spread')
const adaptedNoUnnecessaryDateGetDateSpread = adaptPluginRule(noUnnecessaryDateGetDateSpreadRule, 'no-unnecessary-date-get-date-spread')
const adaptedNoUnnecessarySymbolKeyForSpread = adaptPluginRule(noUnnecessarySymbolKeyForSpreadRule, 'no-unnecessary-symbol-key-for-spread')
const adaptedNoUnnecessaryDateToISOStringSpread = adaptPluginRule(noUnnecessaryDateToISOStringSpreadRule, 'no-unnecessary-date-to-iso-string-spread')
const adaptedNoUnnecessaryDateGetDaySpread = adaptPluginRule(noUnnecessaryDateGetDaySpreadRule, 'no-unnecessary-date-get-day-spread')
const adaptedNoUnnecessaryDateGetHoursSpread = adaptPluginRule(noUnnecessaryDateGetHoursSpreadRule, 'no-unnecessary-date-get-hours-spread')
const adaptedNoUnnecessaryDateGetMinutesSpread = adaptPluginRule(noUnnecessaryDateGetMinutesSpreadRule, 'no-unnecessary-date-get-minutes-spread')
const adaptedNoUnnecessaryDateGetSecondsSpread = adaptPluginRule(noUnnecessaryDateGetSecondsSpreadRule, 'no-unnecessary-date-get-seconds-spread')
const adaptedNoUnnecessaryDateGetTimeSpread = adaptPluginRule(noUnnecessaryDateGetTimeSpreadRule, 'no-unnecessary-date-get-time-spread')
const adaptedNoUnnecessaryDateGetTimezoneOffsetSpread = adaptPluginRule(noUnnecessaryDateGetTimezoneOffsetSpreadRule, 'no-unnecessary-date-get-timezone-offset-spread')
const adaptedNoUnnecessaryDateGetMillisecondsSpread = adaptPluginRule(noUnnecessaryDateGetMillisecondsSpreadRule, 'no-unnecessary-date-get-milliseconds-spread')
const adaptedNoUnnecessaryDateToStringSpread = adaptPluginRule(noUnnecessaryDateToStringSpreadRule, 'no-unnecessary-date-to-string-spread')
const adaptedNoUnnecessaryDateToDateStringSpread = adaptPluginRule(noUnnecessaryDateToDateStringSpreadRule, 'no-unnecessary-date-to-date-string-spread')
const adaptedNoUnnecessaryDateToTimeStringSpread = adaptPluginRule(noUnnecessaryDateToTimeStringSpreadRule, 'no-unnecessary-date-to-time-string-spread')
const adaptedNoUnnecessaryMapGetSpread = adaptPluginRule(noUnnecessaryMapGetSpreadRule, 'no-unnecessary-map-get-spread')
const adaptedNoUnnecessaryMapHasSpread = adaptPluginRule(noUnnecessaryMapHasSpreadRule, 'no-unnecessary-map-has-spread')
const adaptedNoUnnecessaryMapDeleteSpread = adaptPluginRule(noUnnecessaryMapDeleteSpreadRule, 'no-unnecessary-map-delete-spread')
const adaptedNoUnnecessarySetHasSpread = adaptPluginRule(noUnnecessarySetHasSpreadRule, 'no-unnecessary-set-has-spread')
const adaptedNoUnnecessarySetDeleteSpread = adaptPluginRule(noUnnecessarySetDeleteSpreadRule, 'no-unnecessary-set-delete-spread')
const adaptedNoUnnecessaryDateValueOfSpread = adaptPluginRule(noUnnecessaryDateValueOfSpreadRule, 'no-unnecessary-date-value-of-spread')
const adaptedNoUnnecessaryDateToUTCStringSpread = adaptPluginRule(noUnnecessaryDateToUTCStringSpreadRule, 'no-unnecessary-date-to-utc-string-spread')
const adaptedNoUnnecessaryDateToJSONSpread = adaptPluginRule(noUnnecessaryDateToJSONSpreadRule, 'no-unnecessary-date-to-json-spread')
const adaptedNoUnnecessaryDateGetUTCFullyearSpread = adaptPluginRule(noUnnecessaryDateGetUTCFullyearSpreadRule, 'no-unnecessary-date-get-utc-fullyear-spread')
const adaptedNoUnnecessaryDateGetUTCMonthSpread = adaptPluginRule(noUnnecessaryDateGetUTCMonthSpreadRule, 'no-unnecessary-date-get-utc-month-spread')
const adaptedNoUnnecessaryDateGetUTCDateSpread = adaptPluginRule(noUnnecessaryDateGetUTCDateSpreadRule, 'no-unnecessary-date-get-utc-date-spread')
const adaptedNoUnnecessaryDateGetUTCDaySpread = adaptPluginRule(noUnnecessaryDateGetUTCDaySpreadRule, 'no-unnecessary-date-get-utc-day-spread')
const adaptedNoUnnecessaryDateGetUTCHoursSpread = adaptPluginRule(noUnnecessaryDateGetUTCHoursSpreadRule, 'no-unnecessary-date-get-utc-hours-spread')
const adaptedNoUnnecessaryDateGetUTCMinutesSpread = adaptPluginRule(noUnnecessaryDateGetUTCMinutesSpreadRule, 'no-unnecessary-date-get-utc-minutes-spread')
const adaptedNoUnnecessaryDateGetUTCSecondsSpread = adaptPluginRule(noUnnecessaryDateGetUTCSecondsSpreadRule, 'no-unnecessary-date-get-utc-seconds-spread')
const adaptedNoUnnecessaryDateGetUTCMillisecondsSpread = adaptPluginRule(noUnnecessaryDateGetUTCMillisecondsSpreadRule, 'no-unnecessary-date-get-utc-milliseconds-spread')
const adaptedNoUnnecessaryDateToLocaleStringSpread = adaptPluginRule(noUnnecessaryDateToLocaleStringSpreadRule, 'no-unnecessary-date-to-locale-string-spread')
const adaptedNoUnnecessaryDateToLocaleDateStringSpread = adaptPluginRule(noUnnecessaryDateToLocaleDateStringSpreadRule, 'no-unnecessary-date-to-locale-date-string-spread')
const adaptedNoUnnecessaryDateToLocaleTimeStringSpread = adaptPluginRule(noUnnecessaryDateToLocaleTimeStringSpreadRule, 'no-unnecessary-date-to-locale-time-string-spread')
const adaptedNoUnnecessaryDateUTCSpread = adaptPluginRule(noUnnecessaryDateUTCSpreadRule, 'no-unnecessary-date-utc-spread')
const adaptedNoUnnecessaryWeakMapGetSpread = adaptPluginRule(noUnnecessaryWeakMapGetSpreadRule, 'no-unnecessary-weakmap-get-spread')
const adaptedNoUnnecessaryWeakMapHasSpread = adaptPluginRule(noUnnecessaryWeakMapHasSpreadRule, 'no-unnecessary-weakmap-has-spread')
const adaptedNoUnnecessaryWeakMapDeleteSpread = adaptPluginRule(noUnnecessaryWeakMapDeleteSpreadRule, 'no-unnecessary-weakmap-delete-spread')
const adaptedNoUnnecessaryWeakSetHasSpread = adaptPluginRule(noUnnecessaryWeakSetHasSpreadRule, 'no-unnecessary-weakset-has-spread')
const adaptedNoUnnecessaryWeakSetDeleteSpread = adaptPluginRule(noUnnecessaryWeakSetDeleteSpreadRule, 'no-unnecessary-weakset-delete-spread')
const adaptedNoUnnecessaryMapClearSpread = adaptPluginRule(noUnnecessaryMapClearSpreadRule, 'no-unnecessary-map-clear-spread')
const adaptedNoUnnecessaryStringToLowerCaseSame = adaptPluginRule(noUnnecessaryStringToLowerCaseSameRule, 'no-unnecessary-string-to-lower-case-same')
const adaptedNoUnnecessaryStringToLowerCaseSpread = adaptPluginRule(noUnnecessaryStringToLowerCaseSpreadRule, 'no-unnecessary-string-to-lower-case-spread')
const adaptedNoUnnecessaryStringToLowerCaseEmpty = adaptPluginRule(noUnnecessaryStringToLowerCaseEmptyRule, 'no-unnecessary-string-to-lower-case-empty')
const adaptedNoUnnecessaryStringToLocaleLowerCaseSpread = adaptPluginRule(noUnnecessaryStringToLocaleLowerCaseSpreadRule, 'no-unnecessary-string-to-locale-lower-case-spread')
const adaptedNoUnnecessaryStringToUpperCaseSame = adaptPluginRule(noUnnecessaryStringToUpperCaseSameRule, 'no-unnecessary-string-to-upper-case-same')
const adaptedNoUnnecessaryStringToUpperCaseEmpty = adaptPluginRule(noUnnecessaryStringToUpperCaseEmptyRule, 'no-unnecessary-string-to-upper-case-empty')
const adaptedNoUnnecessaryStringToLocaleUpperCaseSpread = adaptPluginRule(noUnnecessaryStringToLocaleUpperCaseSpreadRule, 'no-unnecessary-string-to-locale-upper-case-spread')
const adaptedNoUnnecessaryStringToUpperCaseSpread = adaptPluginRule(noUnnecessaryStringToUpperCaseSpreadRule, 'no-unnecessary-string-to-upper-case-spread')
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
const adaptedNoUnnecessaryStringSplitSpread = adaptPluginRule(noUnnecessaryStringSplitSpreadRule, 'no-unnecessary-string-split-spread')
const adaptedNoUnnecessaryStringSplitLength = adaptPluginRule(noUnnecessaryStringSplitLengthRule, 'no-unnecessary-string-split-length')
const adaptedNoUnnecessaryStringSliceZeroLen = adaptPluginRule(noUnnecessaryStringSliceZeroLen, 'no-unnecessary-string-slice-zero-len')
const adaptedNoUnnecessaryStringSliceZero = adaptPluginRule(noUnnecessaryStringSliceZeroRule, 'no-unnecessary-string-slice-zero')
const adaptedNoUnnecessaryStringSliceSpread = adaptPluginRule(noUnnecessaryStringSliceSpreadRule, 'no-unnecessary-string-slice-spread')
const adaptedNoUnnecessaryStringStartsEmpty = adaptPluginRule(noUnnecessaryStringStartsEmptyRule, 'no-unnecessary-string-starts-empty')
const adaptedNoUnnecessaryStringStartsWithNonEmpty = adaptPluginRule(noUnnecessaryStringStartsWithNonEmpty, 'no-unnecessary-string-starts-with-non-empty')
const adaptedNoUnnecessaryStringStartsWithEmpty = adaptPluginRule(noUnnecessaryStringStartsWithEmptyRule, 'no-unnecessary-string-starts-with-empty')
const adaptedNoUnnecessaryStringStartsWithSpread = adaptPluginRule(noUnnecessaryStringStartsWithSpreadRule, 'no-unnecessary-string-starts-with-spread')
const adaptedNoUnnecessaryStringTrimEmpty = adaptPluginRule(noUnnecessaryStringTrimEmptyRule, 'no-unnecessary-string-trim-empty')
const adaptedNoUnnecessaryStringTrimSpread = adaptPluginRule(noUnnecessaryStringTrimSpreadRule, 'no-unnecessary-string-trim-spread')
const adaptedNoUnnecessaryStringTrimStartEmpty = adaptPluginRule(noUnnecessaryStringTrimStartEmptyRule, 'no-unnecessary-string-trim-start-empty')
const adaptedNoUnnecessaryStringTrimStartSpread = adaptPluginRule(noUnnecessaryStringTrimStartSpreadRule, 'no-unnecessary-string-trim-start-spread')
const adaptedNoUnnecessaryStringTrimEndEmpty = adaptPluginRule(noUnnecessaryStringTrimEndEmptyRule, 'no-unnecessary-string-trim-end-empty')
const adaptedNoUnnecessaryStringTrimEndSpread = adaptPluginRule(noUnnecessaryStringTrimEndSpreadRule, 'no-unnecessary-string-trim-end-spread')
const adaptedNoUnnecessaryStringReplaceAll = adaptPluginRule(noUnnecessaryStringReplaceAllRule, 'no-unnecessary-string-replace-all')
const adaptedNoUnnecessaryStringReplaceAllEmpty = adaptPluginRule(noUnnecessaryStringReplaceAllEmptyRule, 'no-unnecessary-string-replace-all-empty')
const adaptedNoUnnecessaryStringReplaceAllSpread = adaptPluginRule(noUnnecessaryStringReplaceAllSpreadRule, 'no-unnecessary-string-replace-all-spread')
const adaptedNoUnnecessaryStringReplaceEmpty = adaptPluginRule(noUnnecessaryStringReplaceEmpty, 'no-unnecessary-string-replace-empty')
const adaptedNoUnnecessaryStringReplaceSpread = adaptPluginRule(noUnnecessaryStringReplaceSpreadRule, 'no-unnecessary-string-replace-spread')
const adaptedNoUnnecessaryStringSearchEmpty = adaptPluginRule(noUnnecessaryStringSearchEmptyRule, 'no-unnecessary-string-search-empty')
const adaptedNoUnnecessaryStringSearchSpread = adaptPluginRule(noUnnecessaryStringSearchSpreadRule, 'no-unnecessary-string-search-spread')
const adaptedNoUnnecessaryStringRepeatZero = adaptPluginRule(noUnnecessaryStringRepeatZeroRule, 'no-unnecessary-string-repeat-zero')
const adaptedNoUnnecessaryStringRepeatOne = adaptPluginRule(noUnnecessaryStringRepeatOneRule, 'no-unnecessary-string-repeat-one')
const adaptedNoUnnecessaryStringRepeatEmpty = adaptPluginRule(noUnnecessaryStringRepeatEmptyRule, 'no-unnecessary-string-repeat-empty')
const adaptedNoUnnecessaryStringRepeatSpread = adaptPluginRule(noUnnecessaryStringRepeatSpreadRule, 'no-unnecessary-string-repeat-spread')
const adaptedNoUnnecessaryStringSubstringZero = adaptPluginRule(noUnnecessaryStringSubstringZeroRule, 'no-unnecessary-string-substring-zero')
const adaptedNoUnnecessaryStringSubstringSpread = adaptPluginRule(noUnnecessaryStringSubstringSpreadRule, 'no-unnecessary-string-substring-spread')
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
const adaptedNoUnnecessaryArrayWithSpread = adaptPluginRule(noUnnecessaryArrayWithSpreadRule, 'no-unnecessary-array-with-spread')
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


const adaptedNoUnnecessaryTypedArrayAtSpread = adaptPluginRule(noUnnecessaryTypedArrayAtSpreadRule, 'no-unnecessary-typed-array-at-spread')
const adaptedNoUnnecessaryTypedArrayCopyWithinSpread = adaptPluginRule(noUnnecessaryTypedArrayCopyWithinSpreadRule, 'no-unnecessary-typed-array-copy-within-spread')
const adaptedNoUnnecessaryTypedArrayEntriesSpread = adaptPluginRule(noUnnecessaryTypedArrayEntriesSpreadRule, 'no-unnecessary-typed-array-entries-spread')
const adaptedNoUnnecessaryTypedArrayEverySpread = adaptPluginRule(noUnnecessaryTypedArrayEverySpreadRule, 'no-unnecessary-typed-array-every-spread')
const adaptedNoUnnecessaryTypedArrayFillSpread = adaptPluginRule(noUnnecessaryTypedArrayFillSpreadRule, 'no-unnecessary-typed-array-fill-spread')
const adaptedNoUnnecessaryTypedArrayFilterSpread = adaptPluginRule(noUnnecessaryTypedArrayFilterSpreadRule, 'no-unnecessary-typed-array-filter-spread')
const adaptedNoUnnecessaryTypedArrayFindSpread = adaptPluginRule(noUnnecessaryTypedArrayFindSpreadRule, 'no-unnecessary-typed-array-find-spread')
const adaptedNoUnnecessaryTypedArrayFindIndexSpread = adaptPluginRule(noUnnecessaryTypedArrayFindIndexSpreadRule, 'no-unnecessary-typed-array-find-index-spread')
const adaptedNoUnnecessaryTypedArrayFindLastSpread = adaptPluginRule(noUnnecessaryTypedArrayFindLastSpreadRule, 'no-unnecessary-typed-array-find-last-spread')
const adaptedNoUnnecessaryTypedArrayFindLastIndexSpread = adaptPluginRule(noUnnecessaryTypedArrayFindLastIndexSpreadRule, 'no-unnecessary-typed-array-find-last-index-spread')
const adaptedNoUnnecessaryTypedArrayForEachSpread = adaptPluginRule(noUnnecessaryTypedArrayForEachSpreadRule, 'no-unnecessary-typed-array-for-each-spread')
const adaptedNoUnnecessaryTypedArrayIncludesSpread = adaptPluginRule(noUnnecessaryTypedArrayIncludesSpreadRule, 'no-unnecessary-typed-array-includes-spread')
const adaptedNoUnnecessaryTypedArrayIndexOfSpread = adaptPluginRule(noUnnecessaryTypedArrayIndexOfSpreadRule, 'no-unnecessary-typed-array-index-of-spread')
const adaptedNoUnnecessaryTypedArrayJoinSpread = adaptPluginRule(noUnnecessaryTypedArrayJoinSpreadRule, 'no-unnecessary-typed-array-join-spread')
const adaptedNoUnnecessaryTypedArrayKeysSpread = adaptPluginRule(noUnnecessaryTypedArrayKeysSpreadRule, 'no-unnecessary-typed-array-keys-spread')
const adaptedNoUnnecessaryTypedArrayLastIndexOfSpread = adaptPluginRule(noUnnecessaryTypedArrayLastIndexOfSpreadRule, 'no-unnecessary-typed-array-last-index-of-spread')
const adaptedNoUnnecessaryTypedArrayMapSpread = adaptPluginRule(noUnnecessaryTypedArrayMapSpreadRule, 'no-unnecessary-typed-array-map-spread')
const adaptedNoUnnecessaryTypedArrayReduceSpread = adaptPluginRule(noUnnecessaryTypedArrayReduceSpreadRule, 'no-unnecessary-typed-array-reduce-spread')
const adaptedNoUnnecessaryTypedArrayReduceRightSpread = adaptPluginRule(noUnnecessaryTypedArrayReduceRightSpreadRule, 'no-unnecessary-typed-array-reduce-right-spread')
const adaptedNoUnnecessaryTypedArrayReverseSpread = adaptPluginRule(noUnnecessaryTypedArrayReverseSpreadRule, 'no-unnecessary-typed-array-reverse-spread')
const adaptedNoUnnecessaryTypedArraySetSpread = adaptPluginRule(noUnnecessaryTypedArraySetSpreadRule, 'no-unnecessary-typed-array-set-spread')
const adaptedNoUnnecessaryTypedArraySliceSpread = adaptPluginRule(noUnnecessaryTypedArraySliceSpreadRule, 'no-unnecessary-typed-array-slice-spread')
const adaptedNoUnnecessaryTypedArraySomeSpread = adaptPluginRule(noUnnecessaryTypedArraySomeSpreadRule, 'no-unnecessary-typed-array-some-spread')
const adaptedNoUnnecessaryTypedArraySortSpread = adaptPluginRule(noUnnecessaryTypedArraySortSpreadRule, 'no-unnecessary-typed-array-sort-spread')
const adaptedNoUnnecessaryTypedArraySubArraySpread = adaptPluginRule(noUnnecessaryTypedArraySubArraySpreadRule, 'no-unnecessary-typed-array-sub-array-spread')
const adaptedNoUnnecessaryTypedArrayToLocaleStringSpread = adaptPluginRule(noUnnecessaryTypedArrayToLocaleStringSpreadRule, 'no-unnecessary-typed-array-to-locale-string-spread')
const adaptedNoUnnecessaryTypedArrayToStringSpread = adaptPluginRule(noUnnecessaryTypedArrayToStringSpreadRule, 'no-unnecessary-typed-array-to-string-spread')
const adaptedNoUnnecessaryTypedArrayValuesSpread = adaptPluginRule(noUnnecessaryTypedArrayValuesSpreadRule, 'no-unnecessary-typed-array-values-spread')
const adaptedNoUnnecessaryTypedArrayWithSpread = adaptPluginRule(noUnnecessaryTypedArrayWithSpreadRule, 'no-unnecessary-typed-array-with-spread')
const adaptedNoUnnecessaryDataviewGetBigInt64Spread = adaptPluginRule(noUnnecessaryDataviewGetBigInt64SpreadRule, 'no-unnecessary-dataview-get-big-int64-spread')
const adaptedNoUnnecessaryDataviewGetBigUint64Spread = adaptPluginRule(noUnnecessaryDataviewGetBigUint64SpreadRule, 'no-unnecessary-dataview-get-big-uint64-spread')
const adaptedNoUnnecessaryDataviewGetFloat32Spread = adaptPluginRule(noUnnecessaryDataviewGetFloat32SpreadRule, 'no-unnecessary-dataview-get-float32-spread')
const adaptedNoUnnecessaryDataviewGetFloat64Spread = adaptPluginRule(noUnnecessaryDataviewGetFloat64SpreadRule, 'no-unnecessary-dataview-get-float64-spread')
const adaptedNoUnnecessaryDataviewGetInt16Spread = adaptPluginRule(noUnnecessaryDataviewGetInt16SpreadRule, 'no-unnecessary-dataview-get-int16-spread')
const adaptedNoUnnecessaryDataviewGetInt32Spread = adaptPluginRule(noUnnecessaryDataviewGetInt32SpreadRule, 'no-unnecessary-dataview-get-int32-spread')
const adaptedNoUnnecessaryDataviewGetInt8Spread = adaptPluginRule(noUnnecessaryDataviewGetInt8SpreadRule, 'no-unnecessary-dataview-get-int8-spread')
const adaptedNoUnnecessaryDataviewGetUint16Spread = adaptPluginRule(noUnnecessaryDataviewGetUint16SpreadRule, 'no-unnecessary-dataview-get-uint16-spread')
const adaptedNoUnnecessaryDataviewGetUint32Spread = adaptPluginRule(noUnnecessaryDataviewGetUint32SpreadRule, 'no-unnecessary-dataview-get-uint32-spread')
const adaptedNoUnnecessaryDataviewGetUint8Spread = adaptPluginRule(noUnnecessaryDataviewGetUint8SpreadRule, 'no-unnecessary-dataview-get-uint8-spread')
const adaptedNoUnnecessaryDataviewSetBigInt64Spread = adaptPluginRule(noUnnecessaryDataviewSetBigInt64SpreadRule, 'no-unnecessary-dataview-set-big-int64-spread')
const adaptedNoUnnecessaryDataviewSetBigUint64Spread = adaptPluginRule(noUnnecessaryDataviewSetBigUint64SpreadRule, 'no-unnecessary-dataview-set-big-uint64-spread')
const adaptedNoUnnecessaryEvalSpread = adaptPluginRule(noUnnecessaryEvalSpreadRule, 'no-unnecessary-eval-spread')
const adaptedNoUnnecessarySharedArrayBufferSliceSpread = adaptPluginRule(noUnnecessarySharedArrayBufferSliceSpreadRule, 'no-unnecessary-shared-array-buffer-slice-spread')
const adaptedNoUnnecessaryInt8ArraySetSpread = adaptPluginRule(noUnnecessaryInt8ArraySetSpreadRule, 'no-unnecessary-int-8-array-set-spread')
const adaptedNoUnnecessaryInt8ArraySubarraySpread = adaptPluginRule(noUnnecessaryInt8ArraySubarraySpreadRule, 'no-unnecessary-int-8-array-subarray-spread')
const adaptedNoUnnecessaryInt8ArraySliceSpread = adaptPluginRule(noUnnecessaryInt8ArraySliceSpreadRule, 'no-unnecessary-int-8-array-slice-spread')
const adaptedNoUnnecessaryUint8ArraySetSpread = adaptPluginRule(noUnnecessaryUint8ArraySetSpreadRule, 'no-unnecessary-uint-8-array-set-spread')
const adaptedNoUnnecessaryUint8ArraySubarraySpread = adaptPluginRule(noUnnecessaryUint8ArraySubarraySpreadRule, 'no-unnecessary-uint-8-array-subarray-spread')
const adaptedNoUnnecessaryUint8ArraySliceSpread = adaptPluginRule(noUnnecessaryUint8ArraySliceSpreadRule, 'no-unnecessary-uint-8-array-slice-spread')
const adaptedNoUnnecessaryUint8ClampedArraySetSpread = adaptPluginRule(noUnnecessaryUint8ClampedArraySetSpreadRule, 'no-unnecessary-uint-8-clamped-array-set-spread')
const adaptedNoUnnecessaryUint8ClampedArraySubarraySpread = adaptPluginRule(noUnnecessaryUint8ClampedArraySubarraySpreadRule, 'no-unnecessary-uint-8-clamped-array-subarray-spread')
const adaptedNoUnnecessaryUint8ClampedArraySliceSpread = adaptPluginRule(noUnnecessaryUint8ClampedArraySliceSpreadRule, 'no-unnecessary-uint-8-clamped-array-slice-spread')
const adaptedNoUnnecessaryInt16ArraySetSpread = adaptPluginRule(noUnnecessaryInt16ArraySetSpreadRule, 'no-unnecessary-int-16-array-set-spread')
const adaptedNoUnnecessaryInt16ArraySubarraySpread = adaptPluginRule(noUnnecessaryInt16ArraySubarraySpreadRule, 'no-unnecessary-int-16-array-subarray-spread')
const adaptedNoUnnecessaryInt16ArraySliceSpread = adaptPluginRule(noUnnecessaryInt16ArraySliceSpreadRule, 'no-unnecessary-int-16-array-slice-spread')
const adaptedNoUnnecessaryUint16ArraySetSpread = adaptPluginRule(noUnnecessaryUint16ArraySetSpreadRule, 'no-unnecessary-uint-16-array-set-spread')
const adaptedNoUnnecessaryUint16ArraySubarraySpread = adaptPluginRule(noUnnecessaryUint16ArraySubarraySpreadRule, 'no-unnecessary-uint-16-array-subarray-spread')
const adaptedNoUnnecessaryUint16ArraySliceSpread = adaptPluginRule(noUnnecessaryUint16ArraySliceSpreadRule, 'no-unnecessary-uint-16-array-slice-spread')
const adaptedNoUnnecessaryInt32ArraySetSpread = adaptPluginRule(noUnnecessaryInt32ArraySetSpreadRule, 'no-unnecessary-int-32-array-set-spread')
const adaptedNoUnnecessaryInt32ArraySubarraySpread = adaptPluginRule(noUnnecessaryInt32ArraySubarraySpreadRule, 'no-unnecessary-int-32-array-subarray-spread')
const adaptedNoUnnecessaryInt32ArraySliceSpread = adaptPluginRule(noUnnecessaryInt32ArraySliceSpreadRule, 'no-unnecessary-int-32-array-slice-spread')
const adaptedNoUnnecessaryUint32ArraySetSpread = adaptPluginRule(noUnnecessaryUint32ArraySetSpreadRule, 'no-unnecessary-uint-32-array-set-spread')
const adaptedNoUnnecessaryUint32ArraySubarraySpread = adaptPluginRule(noUnnecessaryUint32ArraySubarraySpreadRule, 'no-unnecessary-uint-32-array-subarray-spread')
const adaptedNoUnnecessaryUint32ArraySliceSpread = adaptPluginRule(noUnnecessaryUint32ArraySliceSpreadRule, 'no-unnecessary-uint-32-array-slice-spread')
const adaptedNoUnnecessaryFloat32ArraySetSpread = adaptPluginRule(noUnnecessaryFloat32ArraySetSpreadRule, 'no-unnecessary-float-32-array-set-spread')
const adaptedNoUnnecessaryFloat32ArraySubarraySpread = adaptPluginRule(noUnnecessaryFloat32ArraySubarraySpreadRule, 'no-unnecessary-float-32-array-subarray-spread')
const adaptedNoUnnecessaryFloat32ArraySliceSpread = adaptPluginRule(noUnnecessaryFloat32ArraySliceSpreadRule, 'no-unnecessary-float-32-array-slice-spread')
const adaptedNoUnnecessaryFloat64ArraySetSpread = adaptPluginRule(noUnnecessaryFloat64ArraySetSpreadRule, 'no-unnecessary-float-64-array-set-spread')
const adaptedNoUnnecessaryFloat64ArraySubarraySpread = adaptPluginRule(noUnnecessaryFloat64ArraySubarraySpreadRule, 'no-unnecessary-float-64-array-subarray-spread')
const adaptedNoUnnecessaryFloat64ArraySliceSpread = adaptPluginRule(noUnnecessaryFloat64ArraySliceSpreadRule, 'no-unnecessary-float-64-array-slice-spread')
const adaptedNoUnnecessaryBigInt64ArraySetSpread = adaptPluginRule(noUnnecessaryBigInt64ArraySetSpreadRule, 'no-unnecessary-big-int-64-array-set-spread')
const adaptedNoUnnecessaryBigInt64ArraySubarraySpread = adaptPluginRule(noUnnecessaryBigInt64ArraySubarraySpreadRule, 'no-unnecessary-big-int-64-array-subarray-spread')
const adaptedNoUnnecessaryBigInt64ArraySliceSpread = adaptPluginRule(noUnnecessaryBigInt64ArraySliceSpreadRule, 'no-unnecessary-big-int-64-array-slice-spread')
const adaptedNoUnnecessaryBigUint64ArraySetSpread = adaptPluginRule(noUnnecessaryBigUint64ArraySetSpreadRule, 'no-unnecessary-big-uint-64-array-set-spread')
const adaptedNoUnnecessaryBigUint64ArraySubarraySpread = adaptPluginRule(noUnnecessaryBigUint64ArraySubarraySpreadRule, 'no-unnecessary-big-uint-64-array-subarray-spread')
const adaptedNoUnnecessaryBigUint64ArraySliceSpread = adaptPluginRule(noUnnecessaryBigUint64ArraySliceSpreadRule, 'no-unnecessary-big-uint-64-array-slice-spread')
const adaptedNoUnnecessaryInt8ArrayFillSpread = adaptPluginRule(noUnnecessaryInt8ArrayFillSpreadRule, 'no-unnecessary-int-8-array-fill-spread')
const adaptedNoUnnecessaryInt8ArraySortSpread = adaptPluginRule(noUnnecessaryInt8ArraySortSpreadRule, 'no-unnecessary-int-8-array-sort-spread')
const adaptedNoUnnecessaryInt8ArrayReverseSpread = adaptPluginRule(noUnnecessaryInt8ArrayReverseSpreadRule, 'no-unnecessary-int-8-array-reverse-spread')
const adaptedNoUnnecessaryInt8ArrayCopyWithinSpread = adaptPluginRule(noUnnecessaryInt8ArrayCopyWithinSpreadRule, 'no-unnecessary-int-8-array-copy-within-spread')
const adaptedNoUnnecessaryUint8ArrayFillSpread = adaptPluginRule(noUnnecessaryUint8ArrayFillSpreadRule, 'no-unnecessary-uint-8-array-fill-spread')
const adaptedNoUnnecessaryUint8ArraySortSpread = adaptPluginRule(noUnnecessaryUint8ArraySortSpreadRule, 'no-unnecessary-uint-8-array-sort-spread')
const adaptedNoUnnecessaryUint8ArrayReverseSpread = adaptPluginRule(noUnnecessaryUint8ArrayReverseSpreadRule, 'no-unnecessary-uint-8-array-reverse-spread')
const adaptedNoUnnecessaryUint8ArrayCopyWithinSpread = adaptPluginRule(noUnnecessaryUint8ArrayCopyWithinSpreadRule, 'no-unnecessary-uint-8-array-copy-within-spread')
const adaptedNoUnnecessaryUint8ClampedArrayFillSpread = adaptPluginRule(noUnnecessaryUint8ClampedArrayFillSpreadRule, 'no-unnecessary-uint-8-clamped-array-fill-spread')
const adaptedNoUnnecessaryUint8ClampedArraySortSpread = adaptPluginRule(noUnnecessaryUint8ClampedArraySortSpreadRule, 'no-unnecessary-uint-8-clamped-array-sort-spread')
const adaptedNoUnnecessaryUint8ClampedArrayReverseSpread = adaptPluginRule(noUnnecessaryUint8ClampedArrayReverseSpreadRule, 'no-unnecessary-uint-8-clamped-array-reverse-spread')
const adaptedNoUnnecessaryUint8ClampedArrayCopyWithinSpread = adaptPluginRule(noUnnecessaryUint8ClampedArrayCopyWithinSpreadRule, 'no-unnecessary-uint-8-clamped-array-copy-within-spread')
const adaptedNoUnnecessaryInt16ArrayFillSpread = adaptPluginRule(noUnnecessaryInt16ArrayFillSpreadRule, 'no-unnecessary-int-16-array-fill-spread')
const adaptedNoUnnecessaryInt16ArraySortSpread = adaptPluginRule(noUnnecessaryInt16ArraySortSpreadRule, 'no-unnecessary-int-16-array-sort-spread')
const adaptedNoUnnecessaryInt16ArrayReverseSpread = adaptPluginRule(noUnnecessaryInt16ArrayReverseSpreadRule, 'no-unnecessary-int-16-array-reverse-spread')
const adaptedNoUnnecessaryInt16ArrayCopyWithinSpread = adaptPluginRule(noUnnecessaryInt16ArrayCopyWithinSpreadRule, 'no-unnecessary-int-16-array-copy-within-spread')
const adaptedNoUnnecessaryUint16ArrayFillSpread = adaptPluginRule(noUnnecessaryUint16ArrayFillSpreadRule, 'no-unnecessary-uint-16-array-fill-spread')
const adaptedNoUnnecessaryUint16ArraySortSpread = adaptPluginRule(noUnnecessaryUint16ArraySortSpreadRule, 'no-unnecessary-uint-16-array-sort-spread')
const adaptedNoUnnecessaryUint16ArrayReverseSpread = adaptPluginRule(noUnnecessaryUint16ArrayReverseSpreadRule, 'no-unnecessary-uint-16-array-reverse-spread')
const adaptedNoUnnecessaryUint16ArrayCopyWithinSpread = adaptPluginRule(noUnnecessaryUint16ArrayCopyWithinSpreadRule, 'no-unnecessary-uint-16-array-copy-within-spread')
const adaptedNoUnnecessaryInt32ArrayFillSpread = adaptPluginRule(noUnnecessaryInt32ArrayFillSpreadRule, 'no-unnecessary-int-32-array-fill-spread')
const adaptedNoUnnecessaryInt32ArraySortSpread = adaptPluginRule(noUnnecessaryInt32ArraySortSpreadRule, 'no-unnecessary-int-32-array-sort-spread')
const adaptedNoUnnecessaryInt32ArrayReverseSpread = adaptPluginRule(noUnnecessaryInt32ArrayReverseSpreadRule, 'no-unnecessary-int-32-array-reverse-spread')
const adaptedNoUnnecessaryInt32ArrayCopyWithinSpread = adaptPluginRule(noUnnecessaryInt32ArrayCopyWithinSpreadRule, 'no-unnecessary-int-32-array-copy-within-spread')
const adaptedNoUnnecessaryUint32ArrayFillSpread = adaptPluginRule(noUnnecessaryUint32ArrayFillSpreadRule, 'no-unnecessary-uint-32-array-fill-spread')
const adaptedNoUnnecessaryUint32ArraySortSpread = adaptPluginRule(noUnnecessaryUint32ArraySortSpreadRule, 'no-unnecessary-uint-32-array-sort-spread')
const adaptedNoUnnecessaryUint32ArrayReverseSpread = adaptPluginRule(noUnnecessaryUint32ArrayReverseSpreadRule, 'no-unnecessary-uint-32-array-reverse-spread')
const adaptedNoUnnecessaryUint32ArrayCopyWithinSpread = adaptPluginRule(noUnnecessaryUint32ArrayCopyWithinSpreadRule, 'no-unnecessary-uint-32-array-copy-within-spread')
const adaptedNoUnnecessaryFloat32ArrayFillSpread = adaptPluginRule(noUnnecessaryFloat32ArrayFillSpreadRule, 'no-unnecessary-float-32-array-fill-spread')
const adaptedNoUnnecessaryFloat32ArraySortSpread = adaptPluginRule(noUnnecessaryFloat32ArraySortSpreadRule, 'no-unnecessary-float-32-array-sort-spread')
const adaptedNoUnnecessaryFloat32ArrayReverseSpread = adaptPluginRule(noUnnecessaryFloat32ArrayReverseSpreadRule, 'no-unnecessary-float-32-array-reverse-spread')
const adaptedNoUnnecessaryFloat32ArrayCopyWithinSpread = adaptPluginRule(noUnnecessaryFloat32ArrayCopyWithinSpreadRule, 'no-unnecessary-float-32-array-copy-within-spread')
const adaptedNoUnnecessaryFloat64ArrayFillSpread = adaptPluginRule(noUnnecessaryFloat64ArrayFillSpreadRule, 'no-unnecessary-float-64-array-fill-spread')
const adaptedNoUnnecessaryFloat64ArraySortSpread = adaptPluginRule(noUnnecessaryFloat64ArraySortSpreadRule, 'no-unnecessary-float-64-array-sort-spread')
const adaptedNoUnnecessaryFloat64ArrayReverseSpread = adaptPluginRule(noUnnecessaryFloat64ArrayReverseSpreadRule, 'no-unnecessary-float-64-array-reverse-spread')
const adaptedNoUnnecessaryFloat64ArrayCopyWithinSpread = adaptPluginRule(noUnnecessaryFloat64ArrayCopyWithinSpreadRule, 'no-unnecessary-float-64-array-copy-within-spread')
const adaptedNoUnnecessaryBigInt64ArrayFillSpread = adaptPluginRule(noUnnecessaryBigInt64ArrayFillSpreadRule, 'no-unnecessary-big-int-64-array-fill-spread')
const adaptedNoUnnecessaryBigInt64ArraySortSpread = adaptPluginRule(noUnnecessaryBigInt64ArraySortSpreadRule, 'no-unnecessary-big-int-64-array-sort-spread')
const adaptedNoUnnecessaryBigInt64ArrayReverseSpread = adaptPluginRule(noUnnecessaryBigInt64ArrayReverseSpreadRule, 'no-unnecessary-big-int-64-array-reverse-spread')
const adaptedNoUnnecessaryBigInt64ArrayCopyWithinSpread = adaptPluginRule(noUnnecessaryBigInt64ArrayCopyWithinSpreadRule, 'no-unnecessary-big-int-64-array-copy-within-spread')
const adaptedNoUnnecessaryBigUint64ArrayFillSpread = adaptPluginRule(noUnnecessaryBigUint64ArrayFillSpreadRule, 'no-unnecessary-big-uint-64-array-fill-spread')
const adaptedNoUnnecessaryBigUint64ArraySortSpread = adaptPluginRule(noUnnecessaryBigUint64ArraySortSpreadRule, 'no-unnecessary-big-uint-64-array-sort-spread')
const adaptedNoUnnecessaryBigUint64ArrayReverseSpread = adaptPluginRule(noUnnecessaryBigUint64ArrayReverseSpreadRule, 'no-unnecessary-big-uint-64-array-reverse-spread')
const adaptedNoUnnecessaryBigUint64ArrayCopyWithinSpread = adaptPluginRule(noUnnecessaryBigUint64ArrayCopyWithinSpreadRule, 'no-unnecessary-big-uint-64-array-copy-within-spread')
const adaptedNoUnnecessaryInt8ArrayMapSpread = adaptPluginRule(noUnnecessaryInt8ArrayMapSpreadRule, 'no-unnecessary-int-8-array-map-spread')
const adaptedNoUnnecessaryInt8ArrayFilterSpread = adaptPluginRule(noUnnecessaryInt8ArrayFilterSpreadRule, 'no-unnecessary-int-8-array-filter-spread')
const adaptedNoUnnecessaryInt8ArrayFindSpread = adaptPluginRule(noUnnecessaryInt8ArrayFindSpreadRule, 'no-unnecessary-int-8-array-find-spread')
const adaptedNoUnnecessaryInt8ArrayEverySpread = adaptPluginRule(noUnnecessaryInt8ArrayEverySpreadRule, 'no-unnecessary-int-8-array-every-spread')
const adaptedNoUnnecessaryInt8ArraySomeSpread = adaptPluginRule(noUnnecessaryInt8ArraySomeSpreadRule, 'no-unnecessary-int-8-array-some-spread')
const adaptedNoUnnecessaryInt8ArrayForEachSpread = adaptPluginRule(noUnnecessaryInt8ArrayForEachSpreadRule, 'no-unnecessary-int-8-array-for-each-spread')
const adaptedNoUnnecessaryUint8ArrayMapSpread = adaptPluginRule(noUnnecessaryUint8ArrayMapSpreadRule, 'no-unnecessary-uint-8-array-map-spread')
const adaptedNoUnnecessaryUint8ArrayFilterSpread = adaptPluginRule(noUnnecessaryUint8ArrayFilterSpreadRule, 'no-unnecessary-uint-8-array-filter-spread')
const adaptedNoUnnecessaryUint8ArrayFindSpread = adaptPluginRule(noUnnecessaryUint8ArrayFindSpreadRule, 'no-unnecessary-uint-8-array-find-spread')
const adaptedNoUnnecessaryUint8ArrayEverySpread = adaptPluginRule(noUnnecessaryUint8ArrayEverySpreadRule, 'no-unnecessary-uint-8-array-every-spread')
const adaptedNoUnnecessaryUint8ArraySomeSpread = adaptPluginRule(noUnnecessaryUint8ArraySomeSpreadRule, 'no-unnecessary-uint-8-array-some-spread')
const adaptedNoUnnecessaryUint8ArrayForEachSpread = adaptPluginRule(noUnnecessaryUint8ArrayForEachSpreadRule, 'no-unnecessary-uint-8-array-for-each-spread')
const adaptedNoUnnecessaryUint8ClampedArrayMapSpread = adaptPluginRule(noUnnecessaryUint8ClampedArrayMapSpreadRule, 'no-unnecessary-uint-8-clamped-array-map-spread')
const adaptedNoUnnecessaryUint8ClampedArrayFilterSpread = adaptPluginRule(noUnnecessaryUint8ClampedArrayFilterSpreadRule, 'no-unnecessary-uint-8-clamped-array-filter-spread')
const adaptedNoUnnecessaryUint8ClampedArrayFindSpread = adaptPluginRule(noUnnecessaryUint8ClampedArrayFindSpreadRule, 'no-unnecessary-uint-8-clamped-array-find-spread')
const adaptedNoUnnecessaryUint8ClampedArrayEverySpread = adaptPluginRule(noUnnecessaryUint8ClampedArrayEverySpreadRule, 'no-unnecessary-uint-8-clamped-array-every-spread')
const adaptedNoUnnecessaryUint8ClampedArraySomeSpread = adaptPluginRule(noUnnecessaryUint8ClampedArraySomeSpreadRule, 'no-unnecessary-uint-8-clamped-array-some-spread')
const adaptedNoUnnecessaryUint8ClampedArrayForEachSpread = adaptPluginRule(noUnnecessaryUint8ClampedArrayForEachSpreadRule, 'no-unnecessary-uint-8-clamped-array-for-each-spread')
const adaptedNoUnnecessaryInt16ArrayMapSpread = adaptPluginRule(noUnnecessaryInt16ArrayMapSpreadRule, 'no-unnecessary-int-16-array-map-spread')
const adaptedNoUnnecessaryInt16ArrayFilterSpread = adaptPluginRule(noUnnecessaryInt16ArrayFilterSpreadRule, 'no-unnecessary-int-16-array-filter-spread')
const adaptedNoUnnecessaryInt16ArrayFindSpread = adaptPluginRule(noUnnecessaryInt16ArrayFindSpreadRule, 'no-unnecessary-int-16-array-find-spread')
const adaptedNoUnnecessaryInt16ArrayEverySpread = adaptPluginRule(noUnnecessaryInt16ArrayEverySpreadRule, 'no-unnecessary-int-16-array-every-spread')
const adaptedNoUnnecessaryInt16ArraySomeSpread = adaptPluginRule(noUnnecessaryInt16ArraySomeSpreadRule, 'no-unnecessary-int-16-array-some-spread')
const adaptedNoUnnecessaryInt16ArrayForEachSpread = adaptPluginRule(noUnnecessaryInt16ArrayForEachSpreadRule, 'no-unnecessary-int-16-array-for-each-spread')
const adaptedNoUnnecessaryUint16ArrayMapSpread = adaptPluginRule(noUnnecessaryUint16ArrayMapSpreadRule, 'no-unnecessary-uint-16-array-map-spread')
const adaptedNoUnnecessaryUint16ArrayFilterSpread = adaptPluginRule(noUnnecessaryUint16ArrayFilterSpreadRule, 'no-unnecessary-uint-16-array-filter-spread')
const adaptedNoUnnecessaryUint16ArrayFindSpread = adaptPluginRule(noUnnecessaryUint16ArrayFindSpreadRule, 'no-unnecessary-uint-16-array-find-spread')
const adaptedNoUnnecessaryUint16ArrayEverySpread = adaptPluginRule(noUnnecessaryUint16ArrayEverySpreadRule, 'no-unnecessary-uint-16-array-every-spread')
const adaptedNoUnnecessaryUint16ArraySomeSpread = adaptPluginRule(noUnnecessaryUint16ArraySomeSpreadRule, 'no-unnecessary-uint-16-array-some-spread')
const adaptedNoUnnecessaryUint16ArrayForEachSpread = adaptPluginRule(noUnnecessaryUint16ArrayForEachSpreadRule, 'no-unnecessary-uint-16-array-for-each-spread')
const adaptedNoUnnecessaryInt32ArrayMapSpread = adaptPluginRule(noUnnecessaryInt32ArrayMapSpreadRule, 'no-unnecessary-int-32-array-map-spread')
const adaptedNoUnnecessaryInt32ArrayFilterSpread = adaptPluginRule(noUnnecessaryInt32ArrayFilterSpreadRule, 'no-unnecessary-int-32-array-filter-spread')
const adaptedNoUnnecessaryInt32ArrayFindSpread = adaptPluginRule(noUnnecessaryInt32ArrayFindSpreadRule, 'no-unnecessary-int-32-array-find-spread')
const adaptedNoUnnecessaryInt32ArrayEverySpread = adaptPluginRule(noUnnecessaryInt32ArrayEverySpreadRule, 'no-unnecessary-int-32-array-every-spread')
const adaptedNoUnnecessaryInt32ArraySomeSpread = adaptPluginRule(noUnnecessaryInt32ArraySomeSpreadRule, 'no-unnecessary-int-32-array-some-spread')
const adaptedNoUnnecessaryInt32ArrayForEachSpread = adaptPluginRule(noUnnecessaryInt32ArrayForEachSpreadRule, 'no-unnecessary-int-32-array-for-each-spread')
const adaptedNoUnnecessaryUint32ArrayMapSpread = adaptPluginRule(noUnnecessaryUint32ArrayMapSpreadRule, 'no-unnecessary-uint-32-array-map-spread')
const adaptedNoUnnecessaryUint32ArrayFilterSpread = adaptPluginRule(noUnnecessaryUint32ArrayFilterSpreadRule, 'no-unnecessary-uint-32-array-filter-spread')
const adaptedNoUnnecessaryUint32ArrayFindSpread = adaptPluginRule(noUnnecessaryUint32ArrayFindSpreadRule, 'no-unnecessary-uint-32-array-find-spread')
const adaptedNoUnnecessaryUint32ArrayEverySpread = adaptPluginRule(noUnnecessaryUint32ArrayEverySpreadRule, 'no-unnecessary-uint-32-array-every-spread')
const adaptedNoUnnecessaryUint32ArraySomeSpread = adaptPluginRule(noUnnecessaryUint32ArraySomeSpreadRule, 'no-unnecessary-uint-32-array-some-spread')
const adaptedNoUnnecessaryUint32ArrayForEachSpread = adaptPluginRule(noUnnecessaryUint32ArrayForEachSpreadRule, 'no-unnecessary-uint-32-array-for-each-spread')
const adaptedNoUnnecessaryFloat32ArrayMapSpread = adaptPluginRule(noUnnecessaryFloat32ArrayMapSpreadRule, 'no-unnecessary-float-32-array-map-spread')
const adaptedNoUnnecessaryFloat32ArrayFilterSpread = adaptPluginRule(noUnnecessaryFloat32ArrayFilterSpreadRule, 'no-unnecessary-float-32-array-filter-spread')
const adaptedNoUnnecessaryFloat32ArrayFindSpread = adaptPluginRule(noUnnecessaryFloat32ArrayFindSpreadRule, 'no-unnecessary-float-32-array-find-spread')
const adaptedNoUnnecessaryFloat32ArrayEverySpread = adaptPluginRule(noUnnecessaryFloat32ArrayEverySpreadRule, 'no-unnecessary-float-32-array-every-spread')
const adaptedNoUnnecessaryFloat32ArraySomeSpread = adaptPluginRule(noUnnecessaryFloat32ArraySomeSpreadRule, 'no-unnecessary-float-32-array-some-spread')
const adaptedNoUnnecessaryFloat32ArrayForEachSpread = adaptPluginRule(noUnnecessaryFloat32ArrayForEachSpreadRule, 'no-unnecessary-float-32-array-for-each-spread')
const adaptedNoUnnecessaryFloat64ArrayMapSpread = adaptPluginRule(noUnnecessaryFloat64ArrayMapSpreadRule, 'no-unnecessary-float-64-array-map-spread')
const adaptedNoUnnecessaryFloat64ArrayFilterSpread = adaptPluginRule(noUnnecessaryFloat64ArrayFilterSpreadRule, 'no-unnecessary-float-64-array-filter-spread')
const adaptedNoUnnecessaryFloat64ArrayFindSpread = adaptPluginRule(noUnnecessaryFloat64ArrayFindSpreadRule, 'no-unnecessary-float-64-array-find-spread')
const adaptedNoUnnecessaryFloat64ArrayEverySpread = adaptPluginRule(noUnnecessaryFloat64ArrayEverySpreadRule, 'no-unnecessary-float-64-array-every-spread')
const adaptedNoUnnecessaryFloat64ArraySomeSpread = adaptPluginRule(noUnnecessaryFloat64ArraySomeSpreadRule, 'no-unnecessary-float-64-array-some-spread')
const adaptedNoUnnecessaryFloat64ArrayForEachSpread = adaptPluginRule(noUnnecessaryFloat64ArrayForEachSpreadRule, 'no-unnecessary-float-64-array-for-each-spread')
const adaptedNoUnnecessaryBigInt64ArrayMapSpread = adaptPluginRule(noUnnecessaryBigInt64ArrayMapSpreadRule, 'no-unnecessary-big-int-64-array-map-spread')
const adaptedNoUnnecessaryBigInt64ArrayFilterSpread = adaptPluginRule(noUnnecessaryBigInt64ArrayFilterSpreadRule, 'no-unnecessary-big-int-64-array-filter-spread')
const adaptedNoUnnecessaryBigInt64ArrayFindSpread = adaptPluginRule(noUnnecessaryBigInt64ArrayFindSpreadRule, 'no-unnecessary-big-int-64-array-find-spread')
const adaptedNoUnnecessaryBigInt64ArrayEverySpread = adaptPluginRule(noUnnecessaryBigInt64ArrayEverySpreadRule, 'no-unnecessary-big-int-64-array-every-spread')
const adaptedNoUnnecessaryBigInt64ArraySomeSpread = adaptPluginRule(noUnnecessaryBigInt64ArraySomeSpreadRule, 'no-unnecessary-big-int-64-array-some-spread')
const adaptedNoUnnecessaryBigInt64ArrayForEachSpread = adaptPluginRule(noUnnecessaryBigInt64ArrayForEachSpreadRule, 'no-unnecessary-big-int-64-array-for-each-spread')
const adaptedNoUnnecessaryBigUint64ArrayMapSpread = adaptPluginRule(noUnnecessaryBigUint64ArrayMapSpreadRule, 'no-unnecessary-big-uint-64-array-map-spread')
const adaptedNoUnnecessaryBigUint64ArrayFilterSpread = adaptPluginRule(noUnnecessaryBigUint64ArrayFilterSpreadRule, 'no-unnecessary-big-uint-64-array-filter-spread')
const adaptedNoUnnecessaryBigUint64ArrayFindSpread = adaptPluginRule(noUnnecessaryBigUint64ArrayFindSpreadRule, 'no-unnecessary-big-uint-64-array-find-spread')
const adaptedNoUnnecessaryBigUint64ArrayEverySpread = adaptPluginRule(noUnnecessaryBigUint64ArrayEverySpreadRule, 'no-unnecessary-big-uint-64-array-every-spread')
const adaptedNoUnnecessaryBigUint64ArraySomeSpread = adaptPluginRule(noUnnecessaryBigUint64ArraySomeSpreadRule, 'no-unnecessary-big-uint-64-array-some-spread')
const adaptedNoUnnecessaryBigUint64ArrayForEachSpread = adaptPluginRule(noUnnecessaryBigUint64ArrayForEachSpreadRule, 'no-unnecessary-big-uint-64-array-for-each-spread')
const adaptedNoUnnecessaryInt8ArrayReduceSpread = adaptPluginRule(noUnnecessaryInt8ArrayReduceSpreadRule, 'no-unnecessary-int-8-array-reduce-spread')
const adaptedNoUnnecessaryInt8ArrayReduceRightSpread = adaptPluginRule(noUnnecessaryInt8ArrayReduceRightSpreadRule, 'no-unnecessary-int-8-array-reduce-right-spread')
const adaptedNoUnnecessaryInt8ArrayFindIndexSpread = adaptPluginRule(noUnnecessaryInt8ArrayFindIndexSpreadRule, 'no-unnecessary-int-8-array-find-index-spread')
const adaptedNoUnnecessaryInt8ArrayFindLastSpread = adaptPluginRule(noUnnecessaryInt8ArrayFindLastSpreadRule, 'no-unnecessary-int-8-array-find-last-spread')
const adaptedNoUnnecessaryInt8ArrayFindLastIndexSpread = adaptPluginRule(noUnnecessaryInt8ArrayFindLastIndexSpreadRule, 'no-unnecessary-int-8-array-find-last-index-spread')
const adaptedNoUnnecessaryInt8ArrayIncludesSpread = adaptPluginRule(noUnnecessaryInt8ArrayIncludesSpreadRule, 'no-unnecessary-int-8-array-includes-spread')
const adaptedNoUnnecessaryInt8ArrayIndexOfSpread = adaptPluginRule(noUnnecessaryInt8ArrayIndexOfSpreadRule, 'no-unnecessary-int-8-array-index-of-spread')
const adaptedNoUnnecessaryInt8ArrayLastIndexOfSpread = adaptPluginRule(noUnnecessaryInt8ArrayLastIndexOfSpreadRule, 'no-unnecessary-int-8-array-last-index-of-spread')
const adaptedNoUnnecessaryInt8ArrayJoinSpread = adaptPluginRule(noUnnecessaryInt8ArrayJoinSpreadRule, 'no-unnecessary-int-8-array-join-spread')
const adaptedNoUnnecessaryInt8ArrayToLocaleStringSpread = adaptPluginRule(noUnnecessaryInt8ArrayToLocaleStringSpreadRule, 'no-unnecessary-int-8-array-to-locale-string-spread')
const adaptedNoUnnecessaryInt8ArrayToStringSpread = adaptPluginRule(noUnnecessaryInt8ArrayToStringSpreadRule, 'no-unnecessary-int-8-array-to-string-spread')
const adaptedNoUnnecessaryUint8ArrayReduceSpread = adaptPluginRule(noUnnecessaryUint8ArrayReduceSpreadRule, 'no-unnecessary-uint-8-array-reduce-spread')
const adaptedNoUnnecessaryUint8ArrayReduceRightSpread = adaptPluginRule(noUnnecessaryUint8ArrayReduceRightSpreadRule, 'no-unnecessary-uint-8-array-reduce-right-spread')
const adaptedNoUnnecessaryUint8ArrayFindIndexSpread = adaptPluginRule(noUnnecessaryUint8ArrayFindIndexSpreadRule, 'no-unnecessary-uint-8-array-find-index-spread')
const adaptedNoUnnecessaryUint8ArrayFindLastSpread = adaptPluginRule(noUnnecessaryUint8ArrayFindLastSpreadRule, 'no-unnecessary-uint-8-array-find-last-spread')
const adaptedNoUnnecessaryUint8ArrayFindLastIndexSpread = adaptPluginRule(noUnnecessaryUint8ArrayFindLastIndexSpreadRule, 'no-unnecessary-uint-8-array-find-last-index-spread')
const adaptedNoUnnecessaryUint8ArrayIncludesSpread = adaptPluginRule(noUnnecessaryUint8ArrayIncludesSpreadRule, 'no-unnecessary-uint-8-array-includes-spread')
const adaptedNoUnnecessaryUint8ArrayIndexOfSpread = adaptPluginRule(noUnnecessaryUint8ArrayIndexOfSpreadRule, 'no-unnecessary-uint-8-array-index-of-spread')
const adaptedNoUnnecessaryUint8ArrayLastIndexOfSpread = adaptPluginRule(noUnnecessaryUint8ArrayLastIndexOfSpreadRule, 'no-unnecessary-uint-8-array-last-index-of-spread')
const adaptedNoUnnecessaryUint8ArrayJoinSpread = adaptPluginRule(noUnnecessaryUint8ArrayJoinSpreadRule, 'no-unnecessary-uint-8-array-join-spread')
const adaptedNoUnnecessaryUint8ArrayToLocaleStringSpread = adaptPluginRule(noUnnecessaryUint8ArrayToLocaleStringSpreadRule, 'no-unnecessary-uint-8-array-to-locale-string-spread')
const adaptedNoUnnecessaryUint8ArrayToStringSpread = adaptPluginRule(noUnnecessaryUint8ArrayToStringSpreadRule, 'no-unnecessary-uint-8-array-to-string-spread')
const adaptedNoUnnecessaryUint8ClampedArrayReduceSpread = adaptPluginRule(noUnnecessaryUint8ClampedArrayReduceSpreadRule, 'no-unnecessary-uint-8-clamped-array-reduce-spread')
const adaptedNoUnnecessaryUint8ClampedArrayReduceRightSpread = adaptPluginRule(noUnnecessaryUint8ClampedArrayReduceRightSpreadRule, 'no-unnecessary-uint-8-clamped-array-reduce-right-spread')
const adaptedNoUnnecessaryUint8ClampedArrayFindIndexSpread = adaptPluginRule(noUnnecessaryUint8ClampedArrayFindIndexSpreadRule, 'no-unnecessary-uint-8-clamped-array-find-index-spread')
const adaptedNoUnnecessaryUint8ClampedArrayFindLastSpread = adaptPluginRule(noUnnecessaryUint8ClampedArrayFindLastSpreadRule, 'no-unnecessary-uint-8-clamped-array-find-last-spread')
const adaptedNoUnnecessaryUint8ClampedArrayFindLastIndexSpread = adaptPluginRule(noUnnecessaryUint8ClampedArrayFindLastIndexSpreadRule, 'no-unnecessary-uint-8-clamped-array-find-last-index-spread')
const adaptedNoUnnecessaryUint8ClampedArrayIncludesSpread = adaptPluginRule(noUnnecessaryUint8ClampedArrayIncludesSpreadRule, 'no-unnecessary-uint-8-clamped-array-includes-spread')
const adaptedNoUnnecessaryUint8ClampedArrayIndexOfSpread = adaptPluginRule(noUnnecessaryUint8ClampedArrayIndexOfSpreadRule, 'no-unnecessary-uint-8-clamped-array-index-of-spread')
const adaptedNoUnnecessaryUint8ClampedArrayLastIndexOfSpread = adaptPluginRule(noUnnecessaryUint8ClampedArrayLastIndexOfSpreadRule, 'no-unnecessary-uint-8-clamped-array-last-index-of-spread')
const adaptedNoUnnecessaryUint8ClampedArrayJoinSpread = adaptPluginRule(noUnnecessaryUint8ClampedArrayJoinSpreadRule, 'no-unnecessary-uint-8-clamped-array-join-spread')
const adaptedNoUnnecessaryUint8ClampedArrayToLocaleStringSpread = adaptPluginRule(noUnnecessaryUint8ClampedArrayToLocaleStringSpreadRule, 'no-unnecessary-uint-8-clamped-array-to-locale-string-spread')
const adaptedNoUnnecessaryUint8ClampedArrayToStringSpread = adaptPluginRule(noUnnecessaryUint8ClampedArrayToStringSpreadRule, 'no-unnecessary-uint-8-clamped-array-to-string-spread')
const adaptedNoUnnecessaryInt16ArrayReduceSpread = adaptPluginRule(noUnnecessaryInt16ArrayReduceSpreadRule, 'no-unnecessary-int-16-array-reduce-spread')
const adaptedNoUnnecessaryInt16ArrayReduceRightSpread = adaptPluginRule(noUnnecessaryInt16ArrayReduceRightSpreadRule, 'no-unnecessary-int-16-array-reduce-right-spread')
const adaptedNoUnnecessaryInt16ArrayFindIndexSpread = adaptPluginRule(noUnnecessaryInt16ArrayFindIndexSpreadRule, 'no-unnecessary-int-16-array-find-index-spread')
const adaptedNoUnnecessaryInt16ArrayFindLastSpread = adaptPluginRule(noUnnecessaryInt16ArrayFindLastSpreadRule, 'no-unnecessary-int-16-array-find-last-spread')
const adaptedNoUnnecessaryInt16ArrayFindLastIndexSpread = adaptPluginRule(noUnnecessaryInt16ArrayFindLastIndexSpreadRule, 'no-unnecessary-int-16-array-find-last-index-spread')
const adaptedNoUnnecessaryInt16ArrayIncludesSpread = adaptPluginRule(noUnnecessaryInt16ArrayIncludesSpreadRule, 'no-unnecessary-int-16-array-includes-spread')
const adaptedNoUnnecessaryInt16ArrayIndexOfSpread = adaptPluginRule(noUnnecessaryInt16ArrayIndexOfSpreadRule, 'no-unnecessary-int-16-array-index-of-spread')
const adaptedNoUnnecessaryInt16ArrayLastIndexOfSpread = adaptPluginRule(noUnnecessaryInt16ArrayLastIndexOfSpreadRule, 'no-unnecessary-int-16-array-last-index-of-spread')
const adaptedNoUnnecessaryInt16ArrayJoinSpread = adaptPluginRule(noUnnecessaryInt16ArrayJoinSpreadRule, 'no-unnecessary-int-16-array-join-spread')
const adaptedNoUnnecessaryInt16ArrayToLocaleStringSpread = adaptPluginRule(noUnnecessaryInt16ArrayToLocaleStringSpreadRule, 'no-unnecessary-int-16-array-to-locale-string-spread')
const adaptedNoUnnecessaryInt16ArrayToStringSpread = adaptPluginRule(noUnnecessaryInt16ArrayToStringSpreadRule, 'no-unnecessary-int-16-array-to-string-spread')
const adaptedNoUnnecessaryUint16ArrayReduceSpread = adaptPluginRule(noUnnecessaryUint16ArrayReduceSpreadRule, 'no-unnecessary-uint-16-array-reduce-spread')
const adaptedNoUnnecessaryUint16ArrayReduceRightSpread = adaptPluginRule(noUnnecessaryUint16ArrayReduceRightSpreadRule, 'no-unnecessary-uint-16-array-reduce-right-spread')
const adaptedNoUnnecessaryUint16ArrayFindIndexSpread = adaptPluginRule(noUnnecessaryUint16ArrayFindIndexSpreadRule, 'no-unnecessary-uint-16-array-find-index-spread')
const adaptedNoUnnecessaryUint16ArrayFindLastSpread = adaptPluginRule(noUnnecessaryUint16ArrayFindLastSpreadRule, 'no-unnecessary-uint-16-array-find-last-spread')
const adaptedNoUnnecessaryUint16ArrayFindLastIndexSpread = adaptPluginRule(noUnnecessaryUint16ArrayFindLastIndexSpreadRule, 'no-unnecessary-uint-16-array-find-last-index-spread')
const adaptedNoUnnecessaryUint16ArrayIncludesSpread = adaptPluginRule(noUnnecessaryUint16ArrayIncludesSpreadRule, 'no-unnecessary-uint-16-array-includes-spread')
const adaptedNoUnnecessaryUint16ArrayIndexOfSpread = adaptPluginRule(noUnnecessaryUint16ArrayIndexOfSpreadRule, 'no-unnecessary-uint-16-array-index-of-spread')
const adaptedNoUnnecessaryUint16ArrayLastIndexOfSpread = adaptPluginRule(noUnnecessaryUint16ArrayLastIndexOfSpreadRule, 'no-unnecessary-uint-16-array-last-index-of-spread')
const adaptedNoUnnecessaryUint16ArrayJoinSpread = adaptPluginRule(noUnnecessaryUint16ArrayJoinSpreadRule, 'no-unnecessary-uint-16-array-join-spread')
const adaptedNoUnnecessaryUint16ArrayToLocaleStringSpread = adaptPluginRule(noUnnecessaryUint16ArrayToLocaleStringSpreadRule, 'no-unnecessary-uint-16-array-to-locale-string-spread')
const adaptedNoUnnecessaryUint16ArrayToStringSpread = adaptPluginRule(noUnnecessaryUint16ArrayToStringSpreadRule, 'no-unnecessary-uint-16-array-to-string-spread')
const adaptedNoUnnecessaryInt32ArrayReduceSpread = adaptPluginRule(noUnnecessaryInt32ArrayReduceSpreadRule, 'no-unnecessary-int-32-array-reduce-spread')
const adaptedNoUnnecessaryInt32ArrayReduceRightSpread = adaptPluginRule(noUnnecessaryInt32ArrayReduceRightSpreadRule, 'no-unnecessary-int-32-array-reduce-right-spread')
const adaptedNoUnnecessaryInt32ArrayFindIndexSpread = adaptPluginRule(noUnnecessaryInt32ArrayFindIndexSpreadRule, 'no-unnecessary-int-32-array-find-index-spread')
const adaptedNoUnnecessaryInt32ArrayFindLastSpread = adaptPluginRule(noUnnecessaryInt32ArrayFindLastSpreadRule, 'no-unnecessary-int-32-array-find-last-spread')
const adaptedNoUnnecessaryInt32ArrayFindLastIndexSpread = adaptPluginRule(noUnnecessaryInt32ArrayFindLastIndexSpreadRule, 'no-unnecessary-int-32-array-find-last-index-spread')
const adaptedNoUnnecessaryInt32ArrayIncludesSpread = adaptPluginRule(noUnnecessaryInt32ArrayIncludesSpreadRule, 'no-unnecessary-int-32-array-includes-spread')
const adaptedNoUnnecessaryInt32ArrayIndexOfSpread = adaptPluginRule(noUnnecessaryInt32ArrayIndexOfSpreadRule, 'no-unnecessary-int-32-array-index-of-spread')
const adaptedNoUnnecessaryInt32ArrayLastIndexOfSpread = adaptPluginRule(noUnnecessaryInt32ArrayLastIndexOfSpreadRule, 'no-unnecessary-int-32-array-last-index-of-spread')
const adaptedNoUnnecessaryInt32ArrayJoinSpread = adaptPluginRule(noUnnecessaryInt32ArrayJoinSpreadRule, 'no-unnecessary-int-32-array-join-spread')
const adaptedNoUnnecessaryInt32ArrayToLocaleStringSpread = adaptPluginRule(noUnnecessaryInt32ArrayToLocaleStringSpreadRule, 'no-unnecessary-int-32-array-to-locale-string-spread')
const adaptedNoUnnecessaryInt32ArrayToStringSpread = adaptPluginRule(noUnnecessaryInt32ArrayToStringSpreadRule, 'no-unnecessary-int-32-array-to-string-spread')
const adaptedNoUnnecessaryUint32ArrayReduceSpread = adaptPluginRule(noUnnecessaryUint32ArrayReduceSpreadRule, 'no-unnecessary-uint-32-array-reduce-spread')
const adaptedNoUnnecessaryUint32ArrayReduceRightSpread = adaptPluginRule(noUnnecessaryUint32ArrayReduceRightSpreadRule, 'no-unnecessary-uint-32-array-reduce-right-spread')
const adaptedNoUnnecessaryUint32ArrayFindIndexSpread = adaptPluginRule(noUnnecessaryUint32ArrayFindIndexSpreadRule, 'no-unnecessary-uint-32-array-find-index-spread')
const adaptedNoUnnecessaryUint32ArrayFindLastSpread = adaptPluginRule(noUnnecessaryUint32ArrayFindLastSpreadRule, 'no-unnecessary-uint-32-array-find-last-spread')
const adaptedNoUnnecessaryUint32ArrayFindLastIndexSpread = adaptPluginRule(noUnnecessaryUint32ArrayFindLastIndexSpreadRule, 'no-unnecessary-uint-32-array-find-last-index-spread')
const adaptedNoUnnecessaryUint32ArrayIncludesSpread = adaptPluginRule(noUnnecessaryUint32ArrayIncludesSpreadRule, 'no-unnecessary-uint-32-array-includes-spread')
const adaptedNoUnnecessaryUint32ArrayIndexOfSpread = adaptPluginRule(noUnnecessaryUint32ArrayIndexOfSpreadRule, 'no-unnecessary-uint-32-array-index-of-spread')
const adaptedNoUnnecessaryUint32ArrayLastIndexOfSpread = adaptPluginRule(noUnnecessaryUint32ArrayLastIndexOfSpreadRule, 'no-unnecessary-uint-32-array-last-index-of-spread')
const adaptedNoUnnecessaryUint32ArrayJoinSpread = adaptPluginRule(noUnnecessaryUint32ArrayJoinSpreadRule, 'no-unnecessary-uint-32-array-join-spread')
const adaptedNoUnnecessaryUint32ArrayToLocaleStringSpread = adaptPluginRule(noUnnecessaryUint32ArrayToLocaleStringSpreadRule, 'no-unnecessary-uint-32-array-to-locale-string-spread')
const adaptedNoUnnecessaryUint32ArrayToStringSpread = adaptPluginRule(noUnnecessaryUint32ArrayToStringSpreadRule, 'no-unnecessary-uint-32-array-to-string-spread')
const adaptedNoUnnecessaryFloat32ArrayReduceSpread = adaptPluginRule(noUnnecessaryFloat32ArrayReduceSpreadRule, 'no-unnecessary-float-32-array-reduce-spread')
const adaptedNoUnnecessaryFloat32ArrayReduceRightSpread = adaptPluginRule(noUnnecessaryFloat32ArrayReduceRightSpreadRule, 'no-unnecessary-float-32-array-reduce-right-spread')
const adaptedNoUnnecessaryFloat32ArrayFindIndexSpread = adaptPluginRule(noUnnecessaryFloat32ArrayFindIndexSpreadRule, 'no-unnecessary-float-32-array-find-index-spread')
const adaptedNoUnnecessaryFloat32ArrayFindLastSpread = adaptPluginRule(noUnnecessaryFloat32ArrayFindLastSpreadRule, 'no-unnecessary-float-32-array-find-last-spread')
const adaptedNoUnnecessaryFloat32ArrayFindLastIndexSpread = adaptPluginRule(noUnnecessaryFloat32ArrayFindLastIndexSpreadRule, 'no-unnecessary-float-32-array-find-last-index-spread')
const adaptedNoUnnecessaryFloat32ArrayIncludesSpread = adaptPluginRule(noUnnecessaryFloat32ArrayIncludesSpreadRule, 'no-unnecessary-float-32-array-includes-spread')
const adaptedNoUnnecessaryFloat32ArrayIndexOfSpread = adaptPluginRule(noUnnecessaryFloat32ArrayIndexOfSpreadRule, 'no-unnecessary-float-32-array-index-of-spread')
const adaptedNoUnnecessaryFloat32ArrayLastIndexOfSpread = adaptPluginRule(noUnnecessaryFloat32ArrayLastIndexOfSpreadRule, 'no-unnecessary-float-32-array-last-index-of-spread')
const adaptedNoUnnecessaryFloat32ArrayJoinSpread = adaptPluginRule(noUnnecessaryFloat32ArrayJoinSpreadRule, 'no-unnecessary-float-32-array-join-spread')
const adaptedNoUnnecessaryFloat32ArrayToLocaleStringSpread = adaptPluginRule(noUnnecessaryFloat32ArrayToLocaleStringSpreadRule, 'no-unnecessary-float-32-array-to-locale-string-spread')
const adaptedNoUnnecessaryFloat32ArrayToStringSpread = adaptPluginRule(noUnnecessaryFloat32ArrayToStringSpreadRule, 'no-unnecessary-float-32-array-to-string-spread')
const adaptedNoUnnecessaryFloat64ArrayReduceSpread = adaptPluginRule(noUnnecessaryFloat64ArrayReduceSpreadRule, 'no-unnecessary-float-64-array-reduce-spread')
const adaptedNoUnnecessaryFloat64ArrayReduceRightSpread = adaptPluginRule(noUnnecessaryFloat64ArrayReduceRightSpreadRule, 'no-unnecessary-float-64-array-reduce-right-spread')
const adaptedNoUnnecessaryFloat64ArrayFindIndexSpread = adaptPluginRule(noUnnecessaryFloat64ArrayFindIndexSpreadRule, 'no-unnecessary-float-64-array-find-index-spread')
const adaptedNoUnnecessaryFloat64ArrayFindLastSpread = adaptPluginRule(noUnnecessaryFloat64ArrayFindLastSpreadRule, 'no-unnecessary-float-64-array-find-last-spread')
const adaptedNoUnnecessaryFloat64ArrayFindLastIndexSpread = adaptPluginRule(noUnnecessaryFloat64ArrayFindLastIndexSpreadRule, 'no-unnecessary-float-64-array-find-last-index-spread')
const adaptedNoUnnecessaryFloat64ArrayIncludesSpread = adaptPluginRule(noUnnecessaryFloat64ArrayIncludesSpreadRule, 'no-unnecessary-float-64-array-includes-spread')
const adaptedNoUnnecessaryFloat64ArrayIndexOfSpread = adaptPluginRule(noUnnecessaryFloat64ArrayIndexOfSpreadRule, 'no-unnecessary-float-64-array-index-of-spread')
const adaptedNoUnnecessaryFloat64ArrayLastIndexOfSpread = adaptPluginRule(noUnnecessaryFloat64ArrayLastIndexOfSpreadRule, 'no-unnecessary-float-64-array-last-index-of-spread')
const adaptedNoUnnecessaryFloat64ArrayJoinSpread = adaptPluginRule(noUnnecessaryFloat64ArrayJoinSpreadRule, 'no-unnecessary-float-64-array-join-spread')
const adaptedNoUnnecessaryFloat64ArrayToLocaleStringSpread = adaptPluginRule(noUnnecessaryFloat64ArrayToLocaleStringSpreadRule, 'no-unnecessary-float-64-array-to-locale-string-spread')
const adaptedNoUnnecessaryFloat64ArrayToStringSpread = adaptPluginRule(noUnnecessaryFloat64ArrayToStringSpreadRule, 'no-unnecessary-float-64-array-to-string-spread')
const adaptedNoUnnecessaryBigInt64ArrayReduceSpread = adaptPluginRule(noUnnecessaryBigInt64ArrayReduceSpreadRule, 'no-unnecessary-big-int-64-array-reduce-spread')
const adaptedNoUnnecessaryBigInt64ArrayReduceRightSpread = adaptPluginRule(noUnnecessaryBigInt64ArrayReduceRightSpreadRule, 'no-unnecessary-big-int-64-array-reduce-right-spread')
const adaptedNoUnnecessaryBigInt64ArrayFindIndexSpread = adaptPluginRule(noUnnecessaryBigInt64ArrayFindIndexSpreadRule, 'no-unnecessary-big-int-64-array-find-index-spread')
const adaptedNoUnnecessaryBigInt64ArrayFindLastSpread = adaptPluginRule(noUnnecessaryBigInt64ArrayFindLastSpreadRule, 'no-unnecessary-big-int-64-array-find-last-spread')
const adaptedNoUnnecessaryBigInt64ArrayFindLastIndexSpread = adaptPluginRule(noUnnecessaryBigInt64ArrayFindLastIndexSpreadRule, 'no-unnecessary-big-int-64-array-find-last-index-spread')
const adaptedNoUnnecessaryBigInt64ArrayIncludesSpread = adaptPluginRule(noUnnecessaryBigInt64ArrayIncludesSpreadRule, 'no-unnecessary-big-int-64-array-includes-spread')
const adaptedNoUnnecessaryBigInt64ArrayIndexOfSpread = adaptPluginRule(noUnnecessaryBigInt64ArrayIndexOfSpreadRule, 'no-unnecessary-big-int-64-array-index-of-spread')
const adaptedNoUnnecessaryBigInt64ArrayLastIndexOfSpread = adaptPluginRule(noUnnecessaryBigInt64ArrayLastIndexOfSpreadRule, 'no-unnecessary-big-int-64-array-last-index-of-spread')
const adaptedNoUnnecessaryBigInt64ArrayJoinSpread = adaptPluginRule(noUnnecessaryBigInt64ArrayJoinSpreadRule, 'no-unnecessary-big-int-64-array-join-spread')
const adaptedNoUnnecessaryBigInt64ArrayToLocaleStringSpread = adaptPluginRule(noUnnecessaryBigInt64ArrayToLocaleStringSpreadRule, 'no-unnecessary-big-int-64-array-to-locale-string-spread')
const adaptedNoUnnecessaryBigInt64ArrayToStringSpread = adaptPluginRule(noUnnecessaryBigInt64ArrayToStringSpreadRule, 'no-unnecessary-big-int-64-array-to-string-spread')
const adaptedNoUnnecessaryBigUint64ArrayReduceSpread = adaptPluginRule(noUnnecessaryBigUint64ArrayReduceSpreadRule, 'no-unnecessary-big-uint-64-array-reduce-spread')
const adaptedNoUnnecessaryBigUint64ArrayReduceRightSpread = adaptPluginRule(noUnnecessaryBigUint64ArrayReduceRightSpreadRule, 'no-unnecessary-big-uint-64-array-reduce-right-spread')
const adaptedNoUnnecessaryBigUint64ArrayFindIndexSpread = adaptPluginRule(noUnnecessaryBigUint64ArrayFindIndexSpreadRule, 'no-unnecessary-big-uint-64-array-find-index-spread')
const adaptedNoUnnecessaryBigUint64ArrayFindLastSpread = adaptPluginRule(noUnnecessaryBigUint64ArrayFindLastSpreadRule, 'no-unnecessary-big-uint-64-array-find-last-spread')
const adaptedNoUnnecessaryBigUint64ArrayFindLastIndexSpread = adaptPluginRule(noUnnecessaryBigUint64ArrayFindLastIndexSpreadRule, 'no-unnecessary-big-uint-64-array-find-last-index-spread')
const adaptedNoUnnecessaryBigUint64ArrayIncludesSpread = adaptPluginRule(noUnnecessaryBigUint64ArrayIncludesSpreadRule, 'no-unnecessary-big-uint-64-array-includes-spread')
const adaptedNoUnnecessaryBigUint64ArrayIndexOfSpread = adaptPluginRule(noUnnecessaryBigUint64ArrayIndexOfSpreadRule, 'no-unnecessary-big-uint-64-array-index-of-spread')
const adaptedNoUnnecessaryBigUint64ArrayLastIndexOfSpread = adaptPluginRule(noUnnecessaryBigUint64ArrayLastIndexOfSpreadRule, 'no-unnecessary-big-uint-64-array-last-index-of-spread')
const adaptedNoUnnecessaryBigUint64ArrayJoinSpread = adaptPluginRule(noUnnecessaryBigUint64ArrayJoinSpreadRule, 'no-unnecessary-big-uint-64-array-join-spread')
const adaptedNoUnnecessaryBigUint64ArrayToLocaleStringSpread = adaptPluginRule(noUnnecessaryBigUint64ArrayToLocaleStringSpreadRule, 'no-unnecessary-big-uint-64-array-to-locale-string-spread')
const adaptedNoUnnecessaryBigUint64ArrayToStringSpread = adaptPluginRule(noUnnecessaryBigUint64ArrayToStringSpreadRule, 'no-unnecessary-big-uint-64-array-to-string-spread')
const adaptedNoUnnecessaryInt8ArrayAtSpread = adaptPluginRule(noUnnecessaryInt8ArrayAtSpreadRule, 'no-unnecessary-int-8-array-at-spread')
const adaptedNoUnnecessaryInt8ArrayEntriesSpread = adaptPluginRule(noUnnecessaryInt8ArrayEntriesSpreadRule, 'no-unnecessary-int-8-array-entries-spread')
const adaptedNoUnnecessaryInt8ArrayKeysSpread = adaptPluginRule(noUnnecessaryInt8ArrayKeysSpreadRule, 'no-unnecessary-int-8-array-keys-spread')
const adaptedNoUnnecessaryInt8ArrayValuesSpread = adaptPluginRule(noUnnecessaryInt8ArrayValuesSpreadRule, 'no-unnecessary-int-8-array-values-spread')
const adaptedNoUnnecessaryInt8ArrayWithSpread = adaptPluginRule(noUnnecessaryInt8ArrayWithSpreadRule, 'no-unnecessary-int-8-array-with-spread')
const adaptedNoUnnecessaryInt8ArrayToReversedSpread = adaptPluginRule(noUnnecessaryInt8ArrayToReversedSpreadRule, 'no-unnecessary-int-8-array-to-reversed-spread')
const adaptedNoUnnecessaryInt8ArrayToSortedSpread = adaptPluginRule(noUnnecessaryInt8ArrayToSortedSpreadRule, 'no-unnecessary-int-8-array-to-sorted-spread')
const adaptedNoUnnecessaryUint8ArrayAtSpread = adaptPluginRule(noUnnecessaryUint8ArrayAtSpreadRule, 'no-unnecessary-uint-8-array-at-spread')
const adaptedNoUnnecessaryUint8ArrayEntriesSpread = adaptPluginRule(noUnnecessaryUint8ArrayEntriesSpreadRule, 'no-unnecessary-uint-8-array-entries-spread')
const adaptedNoUnnecessaryUint8ArrayKeysSpread = adaptPluginRule(noUnnecessaryUint8ArrayKeysSpreadRule, 'no-unnecessary-uint-8-array-keys-spread')
const adaptedNoUnnecessaryUint8ArrayValuesSpread = adaptPluginRule(noUnnecessaryUint8ArrayValuesSpreadRule, 'no-unnecessary-uint-8-array-values-spread')
const adaptedNoUnnecessaryUint8ArrayWithSpread = adaptPluginRule(noUnnecessaryUint8ArrayWithSpreadRule, 'no-unnecessary-uint-8-array-with-spread')
const adaptedNoUnnecessaryUint8ArrayToReversedSpread = adaptPluginRule(noUnnecessaryUint8ArrayToReversedSpreadRule, 'no-unnecessary-uint-8-array-to-reversed-spread')
const adaptedNoUnnecessaryUint8ArrayToSortedSpread = adaptPluginRule(noUnnecessaryUint8ArrayToSortedSpreadRule, 'no-unnecessary-uint-8-array-to-sorted-spread')
const adaptedNoUnnecessaryUint8ClampedArrayAtSpread = adaptPluginRule(noUnnecessaryUint8ClampedArrayAtSpreadRule, 'no-unnecessary-uint-8-clamped-array-at-spread')
const adaptedNoUnnecessaryUint8ClampedArrayEntriesSpread = adaptPluginRule(noUnnecessaryUint8ClampedArrayEntriesSpreadRule, 'no-unnecessary-uint-8-clamped-array-entries-spread')
const adaptedNoUnnecessaryUint8ClampedArrayKeysSpread = adaptPluginRule(noUnnecessaryUint8ClampedArrayKeysSpreadRule, 'no-unnecessary-uint-8-clamped-array-keys-spread')
const adaptedNoUnnecessaryUint8ClampedArrayValuesSpread = adaptPluginRule(noUnnecessaryUint8ClampedArrayValuesSpreadRule, 'no-unnecessary-uint-8-clamped-array-values-spread')
const adaptedNoUnnecessaryUint8ClampedArrayWithSpread = adaptPluginRule(noUnnecessaryUint8ClampedArrayWithSpreadRule, 'no-unnecessary-uint-8-clamped-array-with-spread')
const adaptedNoUnnecessaryUint8ClampedArrayToReversedSpread = adaptPluginRule(noUnnecessaryUint8ClampedArrayToReversedSpreadRule, 'no-unnecessary-uint-8-clamped-array-to-reversed-spread')
const adaptedNoUnnecessaryUint8ClampedArrayToSortedSpread = adaptPluginRule(noUnnecessaryUint8ClampedArrayToSortedSpreadRule, 'no-unnecessary-uint-8-clamped-array-to-sorted-spread')
const adaptedNoUnnecessaryInt16ArrayAtSpread = adaptPluginRule(noUnnecessaryInt16ArrayAtSpreadRule, 'no-unnecessary-int-16-array-at-spread')
const adaptedNoUnnecessaryInt16ArrayEntriesSpread = adaptPluginRule(noUnnecessaryInt16ArrayEntriesSpreadRule, 'no-unnecessary-int-16-array-entries-spread')
const adaptedNoUnnecessaryInt16ArrayKeysSpread = adaptPluginRule(noUnnecessaryInt16ArrayKeysSpreadRule, 'no-unnecessary-int-16-array-keys-spread')
const adaptedNoUnnecessaryInt16ArrayValuesSpread = adaptPluginRule(noUnnecessaryInt16ArrayValuesSpreadRule, 'no-unnecessary-int-16-array-values-spread')
const adaptedNoUnnecessaryInt16ArrayWithSpread = adaptPluginRule(noUnnecessaryInt16ArrayWithSpreadRule, 'no-unnecessary-int-16-array-with-spread')
const adaptedNoUnnecessaryInt16ArrayToReversedSpread = adaptPluginRule(noUnnecessaryInt16ArrayToReversedSpreadRule, 'no-unnecessary-int-16-array-to-reversed-spread')
const adaptedNoUnnecessaryInt16ArrayToSortedSpread = adaptPluginRule(noUnnecessaryInt16ArrayToSortedSpreadRule, 'no-unnecessary-int-16-array-to-sorted-spread')
const adaptedNoUnnecessaryUint16ArrayAtSpread = adaptPluginRule(noUnnecessaryUint16ArrayAtSpreadRule, 'no-unnecessary-uint-16-array-at-spread')
const adaptedNoUnnecessaryUint16ArrayEntriesSpread = adaptPluginRule(noUnnecessaryUint16ArrayEntriesSpreadRule, 'no-unnecessary-uint-16-array-entries-spread')
const adaptedNoUnnecessaryUint16ArrayKeysSpread = adaptPluginRule(noUnnecessaryUint16ArrayKeysSpreadRule, 'no-unnecessary-uint-16-array-keys-spread')
const adaptedNoUnnecessaryUint16ArrayValuesSpread = adaptPluginRule(noUnnecessaryUint16ArrayValuesSpreadRule, 'no-unnecessary-uint-16-array-values-spread')
const adaptedNoUnnecessaryUint16ArrayWithSpread = adaptPluginRule(noUnnecessaryUint16ArrayWithSpreadRule, 'no-unnecessary-uint-16-array-with-spread')
const adaptedNoUnnecessaryUint16ArrayToReversedSpread = adaptPluginRule(noUnnecessaryUint16ArrayToReversedSpreadRule, 'no-unnecessary-uint-16-array-to-reversed-spread')
const adaptedNoUnnecessaryUint16ArrayToSortedSpread = adaptPluginRule(noUnnecessaryUint16ArrayToSortedSpreadRule, 'no-unnecessary-uint-16-array-to-sorted-spread')
const adaptedNoUnnecessaryInt32ArrayAtSpread = adaptPluginRule(noUnnecessaryInt32ArrayAtSpreadRule, 'no-unnecessary-int-32-array-at-spread')
const adaptedNoUnnecessaryInt32ArrayEntriesSpread = adaptPluginRule(noUnnecessaryInt32ArrayEntriesSpreadRule, 'no-unnecessary-int-32-array-entries-spread')
const adaptedNoUnnecessaryInt32ArrayKeysSpread = adaptPluginRule(noUnnecessaryInt32ArrayKeysSpreadRule, 'no-unnecessary-int-32-array-keys-spread')
const adaptedNoUnnecessaryInt32ArrayValuesSpread = adaptPluginRule(noUnnecessaryInt32ArrayValuesSpreadRule, 'no-unnecessary-int-32-array-values-spread')
const adaptedNoUnnecessaryInt32ArrayWithSpread = adaptPluginRule(noUnnecessaryInt32ArrayWithSpreadRule, 'no-unnecessary-int-32-array-with-spread')
const adaptedNoUnnecessaryInt32ArrayToReversedSpread = adaptPluginRule(noUnnecessaryInt32ArrayToReversedSpreadRule, 'no-unnecessary-int-32-array-to-reversed-spread')
const adaptedNoUnnecessaryInt32ArrayToSortedSpread = adaptPluginRule(noUnnecessaryInt32ArrayToSortedSpreadRule, 'no-unnecessary-int-32-array-to-sorted-spread')
const adaptedNoUnnecessaryUint32ArrayAtSpread = adaptPluginRule(noUnnecessaryUint32ArrayAtSpreadRule, 'no-unnecessary-uint-32-array-at-spread')
const adaptedNoUnnecessaryUint32ArrayEntriesSpread = adaptPluginRule(noUnnecessaryUint32ArrayEntriesSpreadRule, 'no-unnecessary-uint-32-array-entries-spread')
const adaptedNoUnnecessaryUint32ArrayKeysSpread = adaptPluginRule(noUnnecessaryUint32ArrayKeysSpreadRule, 'no-unnecessary-uint-32-array-keys-spread')
const adaptedNoUnnecessaryUint32ArrayValuesSpread = adaptPluginRule(noUnnecessaryUint32ArrayValuesSpreadRule, 'no-unnecessary-uint-32-array-values-spread')
const adaptedNoUnnecessaryUint32ArrayWithSpread = adaptPluginRule(noUnnecessaryUint32ArrayWithSpreadRule, 'no-unnecessary-uint-32-array-with-spread')
const adaptedNoUnnecessaryUint32ArrayToReversedSpread = adaptPluginRule(noUnnecessaryUint32ArrayToReversedSpreadRule, 'no-unnecessary-uint-32-array-to-reversed-spread')
const adaptedNoUnnecessaryUint32ArrayToSortedSpread = adaptPluginRule(noUnnecessaryUint32ArrayToSortedSpreadRule, 'no-unnecessary-uint-32-array-to-sorted-spread')
const adaptedNoUnnecessaryFloat32ArrayAtSpread = adaptPluginRule(noUnnecessaryFloat32ArrayAtSpreadRule, 'no-unnecessary-float-32-array-at-spread')
const adaptedNoUnnecessaryFloat32ArrayEntriesSpread = adaptPluginRule(noUnnecessaryFloat32ArrayEntriesSpreadRule, 'no-unnecessary-float-32-array-entries-spread')
const adaptedNoUnnecessaryFloat32ArrayKeysSpread = adaptPluginRule(noUnnecessaryFloat32ArrayKeysSpreadRule, 'no-unnecessary-float-32-array-keys-spread')
const adaptedNoUnnecessaryFloat32ArrayValuesSpread = adaptPluginRule(noUnnecessaryFloat32ArrayValuesSpreadRule, 'no-unnecessary-float-32-array-values-spread')
const adaptedNoUnnecessaryFloat32ArrayWithSpread = adaptPluginRule(noUnnecessaryFloat32ArrayWithSpreadRule, 'no-unnecessary-float-32-array-with-spread')
const adaptedNoUnnecessaryFloat32ArrayToReversedSpread = adaptPluginRule(noUnnecessaryFloat32ArrayToReversedSpreadRule, 'no-unnecessary-float-32-array-to-reversed-spread')
const adaptedNoUnnecessaryFloat32ArrayToSortedSpread = adaptPluginRule(noUnnecessaryFloat32ArrayToSortedSpreadRule, 'no-unnecessary-float-32-array-to-sorted-spread')
const adaptedNoUnnecessaryFloat64ArrayAtSpread = adaptPluginRule(noUnnecessaryFloat64ArrayAtSpreadRule, 'no-unnecessary-float-64-array-at-spread')
const adaptedNoUnnecessaryFloat64ArrayEntriesSpread = adaptPluginRule(noUnnecessaryFloat64ArrayEntriesSpreadRule, 'no-unnecessary-float-64-array-entries-spread')
const adaptedNoUnnecessaryFloat64ArrayKeysSpread = adaptPluginRule(noUnnecessaryFloat64ArrayKeysSpreadRule, 'no-unnecessary-float-64-array-keys-spread')
const adaptedNoUnnecessaryFloat64ArrayValuesSpread = adaptPluginRule(noUnnecessaryFloat64ArrayValuesSpreadRule, 'no-unnecessary-float-64-array-values-spread')
const adaptedNoUnnecessaryFloat64ArrayWithSpread = adaptPluginRule(noUnnecessaryFloat64ArrayWithSpreadRule, 'no-unnecessary-float-64-array-with-spread')
const adaptedNoUnnecessaryFloat64ArrayToReversedSpread = adaptPluginRule(noUnnecessaryFloat64ArrayToReversedSpreadRule, 'no-unnecessary-float-64-array-to-reversed-spread')
const adaptedNoUnnecessaryFloat64ArrayToSortedSpread = adaptPluginRule(noUnnecessaryFloat64ArrayToSortedSpreadRule, 'no-unnecessary-float-64-array-to-sorted-spread')
const adaptedNoUnnecessaryBigInt64ArrayAtSpread = adaptPluginRule(noUnnecessaryBigInt64ArrayAtSpreadRule, 'no-unnecessary-big-int-64-array-at-spread')
const adaptedNoUnnecessaryBigInt64ArrayEntriesSpread = adaptPluginRule(noUnnecessaryBigInt64ArrayEntriesSpreadRule, 'no-unnecessary-big-int-64-array-entries-spread')
const adaptedNoUnnecessaryBigInt64ArrayKeysSpread = adaptPluginRule(noUnnecessaryBigInt64ArrayKeysSpreadRule, 'no-unnecessary-big-int-64-array-keys-spread')
const adaptedNoUnnecessaryBigInt64ArrayValuesSpread = adaptPluginRule(noUnnecessaryBigInt64ArrayValuesSpreadRule, 'no-unnecessary-big-int-64-array-values-spread')
const adaptedNoUnnecessaryBigInt64ArrayWithSpread = adaptPluginRule(noUnnecessaryBigInt64ArrayWithSpreadRule, 'no-unnecessary-big-int-64-array-with-spread')
const adaptedNoUnnecessaryBigInt64ArrayToReversedSpread = adaptPluginRule(noUnnecessaryBigInt64ArrayToReversedSpreadRule, 'no-unnecessary-big-int-64-array-to-reversed-spread')
const adaptedNoUnnecessaryBigInt64ArrayToSortedSpread = adaptPluginRule(noUnnecessaryBigInt64ArrayToSortedSpreadRule, 'no-unnecessary-big-int-64-array-to-sorted-spread')
const adaptedNoUnnecessaryBigUint64ArrayAtSpread = adaptPluginRule(noUnnecessaryBigUint64ArrayAtSpreadRule, 'no-unnecessary-big-uint-64-array-at-spread')
const adaptedNoUnnecessaryBigUint64ArrayEntriesSpread = adaptPluginRule(noUnnecessaryBigUint64ArrayEntriesSpreadRule, 'no-unnecessary-big-uint-64-array-entries-spread')
const adaptedNoUnnecessaryBigUint64ArrayKeysSpread = adaptPluginRule(noUnnecessaryBigUint64ArrayKeysSpreadRule, 'no-unnecessary-big-uint-64-array-keys-spread')
const adaptedNoUnnecessaryBigUint64ArrayValuesSpread = adaptPluginRule(noUnnecessaryBigUint64ArrayValuesSpreadRule, 'no-unnecessary-big-uint-64-array-values-spread')
const adaptedNoUnnecessaryBigUint64ArrayWithSpread = adaptPluginRule(noUnnecessaryBigUint64ArrayWithSpreadRule, 'no-unnecessary-big-uint-64-array-with-spread')
const adaptedNoUnnecessaryBigUint64ArrayToReversedSpread = adaptPluginRule(noUnnecessaryBigUint64ArrayToReversedSpreadRule, 'no-unnecessary-big-uint-64-array-to-reversed-spread')
const adaptedNoUnnecessaryBigUint64ArrayToSortedSpread = adaptPluginRule(noUnnecessaryBigUint64ArrayToSortedSpreadRule, 'no-unnecessary-big-uint-64-array-to-sorted-spread')
const adaptedNoUnnecessaryInt8ArrayFromSpread = adaptPluginRule(noUnnecessaryInt8ArrayFromSpreadRule, 'no-unnecessary-int-8-array-from-spread')
const adaptedNoUnnecessaryInt8ArrayFromSpreadAlias = adaptPluginRule(noUnnecessaryInt8ArrayFromSpreadRule, 'no-unnecessary-int8-array-from-spread')
const adaptedNoUnnecessaryInt8ArrayOfSpread = adaptPluginRule(noUnnecessaryInt8ArrayOfSpreadRule, 'no-unnecessary-int-8-array-of-spread')
const adaptedNoUnnecessaryInt8ArrayOfSpreadAlias = adaptPluginRule(noUnnecessaryInt8ArrayOfSpreadRule, 'no-unnecessary-int8-array-of-spread')
const adaptedNoUnnecessaryUint8ArrayFromSpread = adaptPluginRule(noUnnecessaryUint8ArrayFromSpreadRule, 'no-unnecessary-uint-8-array-from-spread')
const adaptedNoUnnecessaryUint8ArrayFromSpreadAlias = adaptPluginRule(noUnnecessaryUint8ArrayFromSpreadRule, 'no-unnecessary-uint8-array-from-spread')
const adaptedNoUnnecessaryUint8ArrayOfSpread = adaptPluginRule(noUnnecessaryUint8ArrayOfSpreadRule, 'no-unnecessary-uint-8-array-of-spread')
const adaptedNoUnnecessaryUint8ArrayOfSpreadAlias = adaptPluginRule(noUnnecessaryUint8ArrayOfSpreadRule, 'no-unnecessary-uint8-array-of-spread')
const adaptedNoUnnecessaryUint8ClampedArrayFromSpread = adaptPluginRule(noUnnecessaryUint8ClampedArrayFromSpreadRule, 'no-unnecessary-uint-8-clamped-array-from-spread')
const adaptedNoUnnecessaryUint8ClampedArrayFromSpreadAlias = adaptPluginRule(noUnnecessaryUint8ClampedArrayFromSpreadRule, 'no-unnecessary-uint8-clamped-array-from-spread')
const adaptedNoUnnecessaryUint8ClampedArrayOfSpread = adaptPluginRule(noUnnecessaryUint8ClampedArrayOfSpreadRule, 'no-unnecessary-uint-8-clamped-array-of-spread')
const adaptedNoUnnecessaryUint8ClampedArrayOfSpreadAlias = adaptPluginRule(noUnnecessaryUint8ClampedArrayOfSpreadRule, 'no-unnecessary-uint8-clamped-array-of-spread')
const adaptedNoUnnecessaryInt16ArrayFromSpread = adaptPluginRule(noUnnecessaryInt16ArrayFromSpreadRule, 'no-unnecessary-int-16-array-from-spread')
const adaptedNoUnnecessaryInt16ArrayFromSpreadAlias = adaptPluginRule(noUnnecessaryInt16ArrayFromSpreadRule, 'no-unnecessary-int16-array-from-spread')
const adaptedNoUnnecessaryInt16ArrayOfSpread = adaptPluginRule(noUnnecessaryInt16ArrayOfSpreadRule, 'no-unnecessary-int-16-array-of-spread')
const adaptedNoUnnecessaryUint16ArrayFromSpread = adaptPluginRule(noUnnecessaryUint16ArrayFromSpreadRule, 'no-unnecessary-uint-16-array-from-spread')
const adaptedNoUnnecessaryUint16ArrayOfSpread = adaptPluginRule(noUnnecessaryUint16ArrayOfSpreadRule, 'no-unnecessary-uint-16-array-of-spread')
const adaptedNoUnnecessaryInt32ArrayFromSpread = adaptPluginRule(noUnnecessaryInt32ArrayFromSpreadRule, 'no-unnecessary-int-32-array-from-spread')
const adaptedNoUnnecessaryInt32ArrayOfSpread = adaptPluginRule(noUnnecessaryInt32ArrayOfSpreadRule, 'no-unnecessary-int-32-array-of-spread')
const adaptedNoUnnecessaryUint32ArrayFromSpread = adaptPluginRule(noUnnecessaryUint32ArrayFromSpreadRule, 'no-unnecessary-uint-32-array-from-spread')
const adaptedNoUnnecessaryUint32ArrayOfSpread = adaptPluginRule(noUnnecessaryUint32ArrayOfSpreadRule, 'no-unnecessary-uint-32-array-of-spread')
const adaptedNoUnnecessaryFloat32ArrayFromSpread = adaptPluginRule(noUnnecessaryFloat32ArrayFromSpreadRule, 'no-unnecessary-float-32-array-from-spread')
const adaptedNoUnnecessaryFloat32ArrayOfSpread = adaptPluginRule(noUnnecessaryFloat32ArrayOfSpreadRule, 'no-unnecessary-float-32-array-of-spread')
const adaptedNoUnnecessaryFloat64ArrayFromSpread = adaptPluginRule(noUnnecessaryFloat64ArrayFromSpreadRule, 'no-unnecessary-float-64-array-from-spread')
const adaptedNoUnnecessaryFloat64ArrayOfSpread = adaptPluginRule(noUnnecessaryFloat64ArrayOfSpreadRule, 'no-unnecessary-float-64-array-of-spread')
const adaptedNoUnnecessaryBigInt64ArrayFromSpread = adaptPluginRule(noUnnecessaryBigInt64ArrayFromSpreadRule, 'no-unnecessary-big-int-64-array-from-spread')
const adaptedNoUnnecessaryBigInt64ArrayOfSpread = adaptPluginRule(noUnnecessaryBigInt64ArrayOfSpreadRule, 'no-unnecessary-big-int-64-array-of-spread')
const adaptedNoUnnecessaryBigUint64ArrayFromSpread = adaptPluginRule(noUnnecessaryBigUint64ArrayFromSpreadRule, 'no-unnecessary-big-uint-64-array-from-spread')
const adaptedNoUnnecessaryBigUint64ArrayOfSpread = adaptPluginRule(noUnnecessaryBigUint64ArrayOfSpreadRule, 'no-unnecessary-big-uint-64-array-of-spread')
const adaptedNoUnnecessarySetTimeoutSpread = adaptPluginRule(noUnnecessarySetTimeoutSpreadRule, 'no-unnecessary-set-timeout-spread')
const adaptedNoUnnecessarySetIntervalSpread = adaptPluginRule(noUnnecessarySetIntervalSpreadRule, 'no-unnecessary-set-interval-spread')
const adaptedNoUnnecessaryClearTimeoutSpread = adaptPluginRule(noUnnecessaryClearTimeoutSpreadRule, 'no-unnecessary-clear-timeout-spread')
const adaptedNoUnnecessaryClearIntervalSpread = adaptPluginRule(noUnnecessaryClearIntervalSpreadRule, 'no-unnecessary-clear-interval-spread')
const adaptedNoUnnecessaryRequestAnimationFrameSpread = adaptPluginRule(noUnnecessaryRequestAnimationFrameSpreadRule, 'no-unnecessary-request-animation-frame-spread')
const adaptedNoUnnecessaryCancelAnimationFrameSpread = adaptPluginRule(noUnnecessaryCancelAnimationFrameSpreadRule, 'no-unnecessary-cancel-animation-frame-spread')
const adaptedNoUnnecessaryRequestIdleCallbackSpread = adaptPluginRule(noUnnecessaryRequestIdleCallbackSpreadRule, 'no-unnecessary-request-idle-callback-spread')
const adaptedNoUnnecessaryCancelIdleCallbackSpread = adaptPluginRule(noUnnecessaryCancelIdleCallbackSpreadRule, 'no-unnecessary-cancel-idle-callback-spread')
const adaptedNoUnnecessaryQueueMicrotaskSpread = adaptPluginRule(noUnnecessaryQueueMicrotaskSpreadRule, 'no-unnecessary-queue-microtask-spread')
const adaptedNoUnnecessaryStructuredCloneSpread = adaptPluginRule(noUnnecessaryStructuredCloneSpreadRule, 'no-unnecessary-structured-clone-spread')
const adaptedNoUnnecessaryAtobSpread = adaptPluginRule(noUnnecessaryAtobSpreadRule, 'no-unnecessary-atob-spread')
const adaptedNoUnnecessaryBtoaSpread = adaptPluginRule(noUnnecessaryBtoaSpreadRule, 'no-unnecessary-btoa-spread')
const adaptedNoUnnecessaryFetchSpread = adaptPluginRule(noUnnecessaryFetchSpreadRule, 'no-unnecessary-fetch-spread')
const adaptedNoUnnecessaryAlertSpread = adaptPluginRule(noUnnecessaryAlertSpreadRule, 'no-unnecessary-alert-spread')
const adaptedNoUnnecessaryConfirmSpread = adaptPluginRule(noUnnecessaryConfirmSpreadRule, 'no-unnecessary-confirm-spread')
const adaptedNoUnnecessaryPromptSpread = adaptPluginRule(noUnnecessaryPromptSpreadRule, 'no-unnecessary-prompt-spread')
const adaptedNoUnnecessaryPrintSpread = adaptPluginRule(noUnnecessaryPrintSpreadRule, 'no-unnecessary-print-spread')
const adaptedNoUnnecessaryReportErrorSpread = adaptPluginRule(noUnnecessaryReportErrorSpreadRule, 'no-unnecessary-report-error-spread')
const adaptedNoUnnecessaryErrorSpread = adaptPluginRule(noUnnecessaryErrorSpreadRule, 'no-unnecessary-error-spread')
const adaptedNoUnnecessaryEvalErrorSpread = adaptPluginRule(noUnnecessaryEvalErrorSpreadRule, 'no-unnecessary-eval-error-spread')
const adaptedNoUnnecessaryRangeErrorSpread = adaptPluginRule(noUnnecessaryRangeErrorSpreadRule, 'no-unnecessary-range-error-spread')
const adaptedNoUnnecessaryReferenceErrorSpread = adaptPluginRule(noUnnecessaryReferenceErrorSpreadRule, 'no-unnecessary-reference-error-spread')
const adaptedNoUnnecessarySyntaxErrorSpread = adaptPluginRule(noUnnecessarySyntaxErrorSpreadRule, 'no-unnecessary-syntax-error-spread')
const adaptedNoUnnecessaryTypeErrorSpread = adaptPluginRule(noUnnecessaryTypeErrorSpreadRule, 'no-unnecessary-type-error-spread')
const adaptedNoUnnecessaryUriErrorSpread = adaptPluginRule(noUnnecessaryUriErrorSpreadRule, 'no-unnecessary-uri-error-spread')
const adaptedNoUnnecessaryAggregateErrorSpread = adaptPluginRule(noUnnecessaryAggregateErrorSpreadRule, 'no-unnecessary-aggregate-error-spread')
const adaptedNoUnnecessaryMapSpread = adaptPluginRule(noUnnecessaryMapSpreadRule, 'no-unnecessary-map-spread')
const adaptedNoUnnecessarySetSpread = adaptPluginRule(noUnnecessarySetSpreadRule, 'no-unnecessary-set-spread')
const adaptedNoUnnecessaryWeakMapSpread = adaptPluginRule(noUnnecessaryWeakMapSpreadRule, 'no-unnecessary-weak-map-spread')
const adaptedNoUnnecessaryWeakSetSpread = adaptPluginRule(noUnnecessaryWeakSetSpreadRule, 'no-unnecessary-weak-set-spread')
const adaptedNoUnnecessaryWeakRefSpread = adaptPluginRule(noUnnecessaryWeakRefSpreadRule, 'no-unnecessary-weak-ref-spread')
const adaptedNoUnnecessaryFinalizationRegistrySpread = adaptPluginRule(noUnnecessaryFinalizationRegistrySpreadRule, 'no-unnecessary-finalization-registry-spread')
const adaptedNoUnnecessaryPromiseSpread = adaptPluginRule(noUnnecessaryPromiseSpreadRule, 'no-unnecessary-promise-spread')
const adaptedNoUnnecessaryArrayBufferSpread = adaptPluginRule(noUnnecessaryArrayBufferSpreadRule, 'no-unnecessary-array-buffer-spread')
const adaptedNoUnnecessarySharedArrayBufferSpread = adaptPluginRule(noUnnecessarySharedArrayBufferSpreadRule, 'no-unnecessary-shared-array-buffer-spread')
const adaptedNoUnnecessaryDataViewSpread = adaptPluginRule(noUnnecessaryDataViewSpreadRule, 'no-unnecessary-data-view-spread')
const adaptedNoUnnecessaryDateSpread = adaptPluginRule(noUnnecessaryDateSpreadRule, 'no-unnecessary-date-spread')
const adaptedNoUnnecessaryRegexpSpread = adaptPluginRule(noUnnecessaryRegexpSpreadRule, 'no-unnecessary-regexp-spread')
const adaptedNoUnnecessaryImageSpread = adaptPluginRule(noUnnecessaryImageSpreadRule, 'no-unnecessary-image-spread')
const adaptedNoUnnecessaryOptionSpread = adaptPluginRule(noUnnecessaryOptionSpreadRule, 'no-unnecessary-option-spread')
const adaptedNoUnnecessaryAudioSpread = adaptPluginRule(noUnnecessaryAudioSpreadRule, 'no-unnecessary-audio-spread')
const adaptedNoUnnecessaryHeadersSpread = adaptPluginRule(noUnnecessaryHeadersSpreadRule, 'no-unnecessary-headers-spread')
const adaptedNoUnnecessaryRequestSpread = adaptPluginRule(noUnnecessaryRequestSpreadRule, 'no-unnecessary-request-spread')
const adaptedNoUnnecessaryResponseSpread = adaptPluginRule(noUnnecessaryResponseSpreadRule, 'no-unnecessary-response-spread')
const adaptedNoUnnecessaryFormDataSpread = adaptPluginRule(noUnnecessaryFormDataSpreadRule, 'no-unnecessary-form-data-spread')
const adaptedNoUnnecessaryUrlSpread = adaptPluginRule(noUnnecessaryUrlSpreadRule, 'no-unnecessary-url-spread')
const adaptedNoUnnecessaryUrlSearchParamsSpread = adaptPluginRule(noUnnecessaryUrlSearchParamsSpreadRule, 'no-unnecessary-url-search-params-spread')
const adaptedNoUnnecessaryTextDecoderSpread = adaptPluginRule(noUnnecessaryTextDecoderSpreadRule, 'no-unnecessary-text-decoder-spread')
const adaptedNoUnnecessaryTextEncoderSpread = adaptPluginRule(noUnnecessaryTextEncoderSpreadRule, 'no-unnecessary-text-encoder-spread')
const adaptedNoUnnecessaryBlobSpread = adaptPluginRule(noUnnecessaryBlobSpreadRule, 'no-unnecessary-blob-spread')
const adaptedNoUnnecessaryFileSpread = adaptPluginRule(noUnnecessaryFileSpreadRule, 'no-unnecessary-file-spread')
const adaptedNoUnnecessaryFileReaderSpread = adaptPluginRule(noUnnecessaryFileReaderSpreadRule, 'no-unnecessary-file-reader-spread')
const adaptedNoUnnecessaryImageDataSpread = adaptPluginRule(noUnnecessaryImageDataSpreadRule, 'no-unnecessary-image-data-spread')
const adaptedNoUnnecessaryDomRectSpread = adaptPluginRule(noUnnecessaryDomRectSpreadRule, 'no-unnecessary-dom-rect-spread')
const adaptedNoUnnecessaryCssStyleDeclarationSpread = adaptPluginRule(noUnnecessaryCssStyleDeclarationSpreadRule, 'no-unnecessary-css-style-declaration-spread')
const adaptedNoUnnecessaryMutationObserverSpread = adaptPluginRule(noUnnecessaryMutationObserverSpreadRule, 'no-unnecessary-mutation-observer-spread')
const adaptedNoUnnecessaryResizeObserverSpread = adaptPluginRule(noUnnecessaryResizeObserverSpreadRule, 'no-unnecessary-resize-observer-spread')
const adaptedNoUnnecessaryIntersectionObserverSpread = adaptPluginRule(noUnnecessaryIntersectionObserverSpreadRule, 'no-unnecessary-intersection-observer-spread')
const adaptedNoUnnecessaryPerformanceObserverSpread = adaptPluginRule(noUnnecessaryPerformanceObserverSpreadRule, 'no-unnecessary-performance-observer-spread')
const adaptedNoUnnecessaryAbortControllerSpread = adaptPluginRule(noUnnecessaryAbortControllerSpreadRule, 'no-unnecessary-abort-controller-spread')
const adaptedNoUnnecessaryAbortSignalSpread = adaptPluginRule(noUnnecessaryAbortSignalSpreadRule, 'no-unnecessary-abort-signal-spread')
const adaptedNoUnnecessaryBroadcastChannelSpread = adaptPluginRule(noUnnecessaryBroadcastChannelSpreadRule, 'no-unnecessary-broadcast-channel-spread')
const adaptedNoUnnecessaryMessageChannelSpread = adaptPluginRule(noUnnecessaryMessageChannelSpreadRule, 'no-unnecessary-message-channel-spread')
const adaptedNoUnnecessaryWorkerSpread = adaptPluginRule(noUnnecessaryWorkerSpreadRule, 'no-unnecessary-worker-spread')
const adaptedNoUnnecessaryEventSpread = adaptPluginRule(noUnnecessaryEventSpreadRule, 'no-unnecessary-event-spread')
const adaptedNoUnnecessaryCustomEventSpread = adaptPluginRule(noUnnecessaryCustomEventSpreadRule, 'no-unnecessary-custom-event-spread')
const adaptedNoUnnecessaryDomParserSpread = adaptPluginRule(noUnnecessaryDomParserSpreadRule, 'no-unnecessary-dom-parser-spread')
const adaptedNoUnnecessaryXmlHttpRequestSpread = adaptPluginRule(noUnnecessaryXmlHttpRequestSpreadRule, 'no-unnecessary-xml-http-request-spread')
const adaptedNoUnnecessaryDocumentCreateElementSpread = adaptPluginRule(noUnnecessaryDocumentCreateElementSpreadRule, 'no-unnecessary-document-create-element-spread')
const adaptedNoUnnecessaryDocumentCreateTextNodeSpread = adaptPluginRule(noUnnecessaryDocumentCreateTextNodeSpreadRule, 'no-unnecessary-document-create-text-node-spread')
const adaptedNoUnnecessaryDocumentCreateCommentSpread = adaptPluginRule(noUnnecessaryDocumentCreateCommentSpreadRule, 'no-unnecessary-document-create-comment-spread')
const adaptedNoUnnecessaryDocumentCreateDocumentFragmentSpread = adaptPluginRule(noUnnecessaryDocumentCreateDocumentFragmentSpreadRule, 'no-unnecessary-document-create-document-fragment-spread')
const adaptedNoUnnecessaryDocumentCreateAttributeSpread = adaptPluginRule(noUnnecessaryDocumentCreateAttributeSpreadRule, 'no-unnecessary-document-create-attribute-spread')
const adaptedNoUnnecessaryDocumentCreateEventSpread = adaptPluginRule(noUnnecessaryDocumentCreateEventSpreadRule, 'no-unnecessary-document-create-event-spread')
const adaptedNoUnnecessaryDocumentCreateTreeWalkerSpread = adaptPluginRule(noUnnecessaryDocumentCreateTreeWalkerSpreadRule, 'no-unnecessary-document-create-tree-walker-spread')
const adaptedNoUnnecessaryDocumentCreateNodeIteratorSpread = adaptPluginRule(noUnnecessaryDocumentCreateNodeIteratorSpreadRule, 'no-unnecessary-document-create-node-iterator-spread')
const adaptedNoUnnecessaryDocumentCreateRangeSpread = adaptPluginRule(noUnnecessaryDocumentCreateRangeSpreadRule, 'no-unnecessary-document-create-range-spread')
const adaptedNoUnnecessaryDocumentGetElementByIdSpread = adaptPluginRule(noUnnecessaryDocumentGetElementByIdSpreadRule, 'no-unnecessary-document-get-element-by-id-spread')
const adaptedNoUnnecessaryDocumentQuerySelectorSpread = adaptPluginRule(noUnnecessaryDocumentQuerySelectorSpreadRule, 'no-unnecessary-document-query-selector-spread')
const adaptedNoUnnecessaryDocumentQuerySelectorAllSpread = adaptPluginRule(noUnnecessaryDocumentQuerySelectorAllSpreadRule, 'no-unnecessary-document-query-selector-all-spread')
const adaptedNoUnnecessaryDocumentGetElementsByClassNameSpread = adaptPluginRule(noUnnecessaryDocumentGetElementsByClassNameSpreadRule, 'no-unnecessary-document-get-elements-by-class-name-spread')
const adaptedNoUnnecessaryDocumentGetElementsByTagNameSpread = adaptPluginRule(noUnnecessaryDocumentGetElementsByTagNameSpreadRule, 'no-unnecessary-document-get-elements-by-tag-name-spread')
const adaptedNoUnnecessaryDocumentGetElementsByNameSpread = adaptPluginRule(noUnnecessaryDocumentGetElementsByNameSpreadRule, 'no-unnecessary-document-get-elements-by-name-spread')
const adaptedNoUnnecessaryDocumentAdoptNodeSpread = adaptPluginRule(noUnnecessaryDocumentAdoptNodeSpreadRule, 'no-unnecessary-document-adopt-node-spread')
const adaptedNoUnnecessaryDocumentImportNodeSpread = adaptPluginRule(noUnnecessaryDocumentImportNodeSpreadRule, 'no-unnecessary-document-import-node-spread')
const adaptedNoUnnecessaryDocumentWriteSpread = adaptPluginRule(noUnnecessaryDocumentWriteSpreadRule, 'no-unnecessary-document-write-spread')
const adaptedNoUnnecessaryDocumentWriteLnSpread = adaptPluginRule(noUnnecessaryDocumentWriteLnSpreadRule, 'no-unnecessary-document-write-ln-spread')
const adaptedNoUnnecessaryDocumentOpenSpread = adaptPluginRule(noUnnecessaryDocumentOpenSpreadRule, 'no-unnecessary-document-open-spread')
const adaptedNoUnnecessaryDocumentCloseSpread = adaptPluginRule(noUnnecessaryDocumentCloseSpreadRule, 'no-unnecessary-document-close-spread')
const adaptedNoUnnecessaryDocumentExitFullscreenSpread = adaptPluginRule(noUnnecessaryDocumentExitFullscreenSpreadRule, 'no-unnecessary-document-exit-fullscreen-spread')
const adaptedNoUnnecessaryDocumentExitPictureInPictureSpread = adaptPluginRule(noUnnecessaryDocumentExitPictureInPictureSpreadRule, 'no-unnecessary-document-exit-picture-in-picture-spread')
const adaptedNoUnnecessaryDocumentExitPointerLockSpread = adaptPluginRule(noUnnecessaryDocumentExitPointerLockSpreadRule, 'no-unnecessary-document-exit-pointer-lock-spread')
const adaptedNoUnnecessaryDocumentHasFocusSpread = adaptPluginRule(noUnnecessaryDocumentHasFocusSpreadRule, 'no-unnecessary-document-has-focus-spread')
const adaptedNoUnnecessaryDocumentGetSelectionSpread = adaptPluginRule(noUnnecessaryDocumentGetSelectionSpreadRule, 'no-unnecessary-document-get-selection-spread')
const adaptedNoUnnecessaryDocumentElementFromPointSpread = adaptPluginRule(noUnnecessaryDocumentElementFromPointSpreadRule, 'no-unnecessary-document-element-from-point-spread')
const adaptedNoUnnecessaryDocumentElementsFromPointSpread = adaptPluginRule(noUnnecessaryDocumentElementsFromPointSpreadRule, 'no-unnecessary-document-elements-from-point-spread')
const adaptedNoUnnecessaryElementQuerySelectorSpread = adaptPluginRule(noUnnecessaryElementQuerySelectorSpreadRule, 'no-unnecessary-element-query-selector-spread')
const adaptedNoUnnecessaryElementQuerySelectorAllSpread = adaptPluginRule(noUnnecessaryElementQuerySelectorAllSpreadRule, 'no-unnecessary-element-query-selector-all-spread')
const adaptedNoUnnecessaryElementGetAttributeSpread = adaptPluginRule(noUnnecessaryElementGetAttributeSpreadRule, 'no-unnecessary-element-get-attribute-spread')
const adaptedNoUnnecessaryElementSetAttributeSpread = adaptPluginRule(noUnnecessaryElementSetAttributeSpreadRule, 'no-unnecessary-element-set-attribute-spread')
const adaptedNoUnnecessaryElementRemoveAttributeSpread = adaptPluginRule(noUnnecessaryElementRemoveAttributeSpreadRule, 'no-unnecessary-element-remove-attribute-spread')
const adaptedNoUnnecessaryElementHasAttributeSpread = adaptPluginRule(noUnnecessaryElementHasAttributeSpreadRule, 'no-unnecessary-element-has-attribute-spread')
const adaptedNoUnnecessaryElementGetAttributeNamesSpread = adaptPluginRule(noUnnecessaryElementGetAttributeNamesSpreadRule, 'no-unnecessary-element-get-attribute-names-spread')
const adaptedNoUnnecessaryElementToggleAttributeSpread = adaptPluginRule(noUnnecessaryElementToggleAttributeSpreadRule, 'no-unnecessary-element-toggle-attribute-spread')
const adaptedNoUnnecessaryElementGetElementsByClassNameSpread = adaptPluginRule(noUnnecessaryElementGetElementsByClassNameSpreadRule, 'no-unnecessary-element-get-elements-by-class-name-spread')
const adaptedNoUnnecessaryElementGetElementsByTagNameSpread = adaptPluginRule(noUnnecessaryElementGetElementsByTagNameSpreadRule, 'no-unnecessary-element-get-elements-by-tag-name-spread')
const adaptedNoUnnecessaryElementClosestSpread = adaptPluginRule(noUnnecessaryElementClosestSpreadRule, 'no-unnecessary-element-closest-spread')
const adaptedNoUnnecessaryElementMatchesSpread = adaptPluginRule(noUnnecessaryElementMatchesSpreadRule, 'no-unnecessary-element-matches-spread')
const adaptedNoUnnecessaryElementContainsSpread = adaptPluginRule(noUnnecessaryElementContainsSpreadRule, 'no-unnecessary-element-contains-spread')
const adaptedNoUnnecessaryElementAppendChildSpread = adaptPluginRule(noUnnecessaryElementAppendChildSpreadRule, 'no-unnecessary-element-append-child-spread')
const adaptedNoUnnecessaryElementRemoveChildSpread = adaptPluginRule(noUnnecessaryElementRemoveChildSpreadRule, 'no-unnecessary-element-remove-child-spread')
const adaptedNoUnnecessaryElementInsertBeforeSpread = adaptPluginRule(noUnnecessaryElementInsertBeforeSpreadRule, 'no-unnecessary-element-insert-before-spread')
const adaptedNoUnnecessaryElementReplaceChildSpread = adaptPluginRule(noUnnecessaryElementReplaceChildSpreadRule, 'no-unnecessary-element-replace-child-spread')
const adaptedNoUnnecessaryElementCloneNodeSpread = adaptPluginRule(noUnnecessaryElementCloneNodeSpreadRule, 'no-unnecessary-element-clone-node-spread')
const adaptedNoUnnecessaryElementRemoveSpread = adaptPluginRule(noUnnecessaryElementRemoveSpreadRule, 'no-unnecessary-element-remove-spread')
const adaptedNoUnnecessaryElementPrependSpread = adaptPluginRule(noUnnecessaryElementPrependSpreadRule, 'no-unnecessary-element-prepend-spread')
const adaptedNoUnnecessaryElementAppendSpread = adaptPluginRule(noUnnecessaryElementAppendSpreadRule, 'no-unnecessary-element-append-spread')
const adaptedNoUnnecessaryElementBeforeSpread = adaptPluginRule(noUnnecessaryElementBeforeSpreadRule, 'no-unnecessary-element-before-spread')
const adaptedNoUnnecessaryElementAfterSpread = adaptPluginRule(noUnnecessaryElementAfterSpreadRule, 'no-unnecessary-element-after-spread')
const adaptedNoUnnecessaryElementReplaceWithSpread = adaptPluginRule(noUnnecessaryElementReplaceWithSpreadRule, 'no-unnecessary-element-replace-with-spread')
const adaptedNoUnnecessaryElementInsertAdjacentHtmlSpread = adaptPluginRule(noUnnecessaryElementInsertAdjacentHtmlSpreadRule, 'no-unnecessary-element-insert-adjacent-html-spread')
const adaptedNoUnnecessaryElementInsertAdjacentElementSpread = adaptPluginRule(noUnnecessaryElementInsertAdjacentElementSpreadRule, 'no-unnecessary-element-insert-adjacent-element-spread')
const adaptedNoUnnecessaryElementInsertAdjacentTextSpread = adaptPluginRule(noUnnecessaryElementInsertAdjacentTextSpreadRule, 'no-unnecessary-element-insert-adjacent-text-spread')
const adaptedNoUnnecessaryElementGetBoundingClientRectSpread = adaptPluginRule(noUnnecessaryElementGetBoundingClientRectSpreadRule, 'no-unnecessary-element-get-bounding-client-rect-spread')
const adaptedNoUnnecessaryElementGetClientRectsSpread = adaptPluginRule(noUnnecessaryElementGetClientRectsSpreadRule, 'no-unnecessary-element-get-client-rects-spread')
const adaptedNoUnnecessaryElementScrollIntoViewSpread = adaptPluginRule(noUnnecessaryElementScrollIntoViewSpreadRule, 'no-unnecessary-element-scroll-into-view-spread')
const adaptedNoUnnecessaryElementScrollIntoViewIfNeededSpread = adaptPluginRule(noUnnecessaryElementScrollIntoViewIfNeededSpreadRule, 'no-unnecessary-element-scroll-into-view-if-needed-spread')
const adaptedNoUnnecessaryElementScrollToSpread = adaptPluginRule(noUnnecessaryElementScrollToSpreadRule, 'no-unnecessary-element-scroll-to-spread')
const adaptedNoUnnecessaryElementScrollBySpread = adaptPluginRule(noUnnecessaryElementScrollBySpreadRule, 'no-unnecessary-element-scroll-by-spread')
const adaptedNoUnnecessaryElementScrollSpread = adaptPluginRule(noUnnecessaryElementScrollSpreadRule, 'no-unnecessary-element-scroll-spread')
const adaptedNoUnnecessaryElementFocusSpread = adaptPluginRule(noUnnecessaryElementFocusSpreadRule, 'no-unnecessary-element-focus-spread')
const adaptedNoUnnecessaryElementBlurSpread = adaptPluginRule(noUnnecessaryElementBlurSpreadRule, 'no-unnecessary-element-blur-spread')
const adaptedNoUnnecessaryElementClickSpread = adaptPluginRule(noUnnecessaryElementClickSpreadRule, 'no-unnecessary-element-click-spread')
const adaptedNoUnnecessaryElementAnimateSpread = adaptPluginRule(noUnnecessaryElementAnimateSpreadRule, 'no-unnecessary-element-animate-spread')
const adaptedNoUnnecessaryElementGetComputedStyleSpread = adaptPluginRule(noUnnecessaryElementGetComputedStyleSpreadRule, 'no-unnecessary-element-get-computed-style-spread')
const adaptedNoUnnecessaryElementRequestFullscreenSpread = adaptPluginRule(noUnnecessaryElementRequestFullscreenSpreadRule, 'no-unnecessary-element-request-fullscreen-spread')
const adaptedNoUnnecessaryElementRequestPointerLockSpread = adaptPluginRule(noUnnecessaryElementRequestPointerLockSpreadRule, 'no-unnecessary-element-request-pointer-lock-spread')
const adaptedNoUnnecessaryElementAttachShadowSpread = adaptPluginRule(noUnnecessaryElementAttachShadowSpreadRule, 'no-unnecessary-element-attach-shadow-spread')
const adaptedNoUnnecessaryLocalStorageGetItemSpread = adaptPluginRule(noUnnecessaryLocalStorageGetItemSpreadRule, 'no-unnecessary-local-storage-get-item-spread')
const adaptedNoUnnecessaryLocalStorageSetItemSpread = adaptPluginRule(noUnnecessaryLocalStorageSetItemSpreadRule, 'no-unnecessary-local-storage-set-item-spread')
const adaptedNoUnnecessaryLocalStorageRemoveItemSpread = adaptPluginRule(noUnnecessaryLocalStorageRemoveItemSpreadRule, 'no-unnecessary-local-storage-remove-item-spread')
const adaptedNoUnnecessaryLocalStorageClearSpread = adaptPluginRule(noUnnecessaryLocalStorageClearSpreadRule, 'no-unnecessary-local-storage-clear-spread')
const adaptedNoUnnecessaryLocalStorageKeySpread = adaptPluginRule(noUnnecessaryLocalStorageKeySpreadRule, 'no-unnecessary-local-storage-key-spread')
const adaptedNoUnnecessarySessionStorageGetItemSpread = adaptPluginRule(noUnnecessarySessionStorageGetItemSpreadRule, 'no-unnecessary-session-storage-get-item-spread')
const adaptedNoUnnecessarySessionStorageSetItemSpread = adaptPluginRule(noUnnecessarySessionStorageSetItemSpreadRule, 'no-unnecessary-session-storage-set-item-spread')
const adaptedNoUnnecessarySessionStorageRemoveItemSpread = adaptPluginRule(noUnnecessarySessionStorageRemoveItemSpreadRule, 'no-unnecessary-session-storage-remove-item-spread')
const adaptedNoUnnecessarySessionStorageClearSpread = adaptPluginRule(noUnnecessarySessionStorageClearSpreadRule, 'no-unnecessary-session-storage-clear-spread')
const adaptedNoUnnecessarySessionStorageKeySpread = adaptPluginRule(noUnnecessarySessionStorageKeySpreadRule, 'no-unnecessary-session-storage-key-spread')
const adaptedNoUnnecessaryNavigatorSendBeaconSpread = adaptPluginRule(noUnnecessaryNavigatorSendBeaconSpreadRule, 'no-unnecessary-navigator-send-beacon-spread')
const adaptedNoUnnecessaryNavigatorVibrateSpread = adaptPluginRule(noUnnecessaryNavigatorVibrateSpreadRule, 'no-unnecessary-navigator-vibrate-spread')
const adaptedNoUnnecessaryNavigatorGetBatterySpread = adaptPluginRule(noUnnecessaryNavigatorGetBatterySpreadRule, 'no-unnecessary-navigator-get-battery-spread')
const adaptedNoUnnecessaryNavigatorGeolocationGetCurrentPositionSpread = adaptPluginRule(noUnnecessaryNavigatorGeolocationGetCurrentPositionSpreadRule, 'no-unnecessary-navigator-geolocation-get-current-position-spread')
const adaptedNoUnnecessaryNavigatorGeolocationWatchPositionSpread = adaptPluginRule(noUnnecessaryNavigatorGeolocationWatchPositionSpreadRule, 'no-unnecessary-navigator-geolocation-watch-position-spread')
const adaptedNoUnnecessaryNavigatorGeolocationClearWatchSpread = adaptPluginRule(noUnnecessaryNavigatorGeolocationClearWatchSpreadRule, 'no-unnecessary-navigator-geolocation-clear-watch-spread')
const adaptedNoUnnecessaryNavigatorClipboardReadTextSpread = adaptPluginRule(noUnnecessaryNavigatorClipboardReadTextSpreadRule, 'no-unnecessary-navigator-clipboard-read-text-spread')
const adaptedNoUnnecessaryNavigatorClipboardWriteTextSpread = adaptPluginRule(noUnnecessaryNavigatorClipboardWriteTextSpreadRule, 'no-unnecessary-navigator-clipboard-write-text-spread')
const adaptedNoUnnecessaryNavigatorMediaDevicesGetUserMediaSpread = adaptPluginRule(noUnnecessaryNavigatorMediaDevicesGetUserMediaSpreadRule, 'no-unnecessary-navigator-media-devices-get-user-media-spread')
const adaptedNoUnnecessaryNavigatorRegisterProtocolHandlerSpread = adaptPluginRule(noUnnecessaryNavigatorRegisterProtocolHandlerSpreadRule, 'no-unnecessary-navigator-register-protocol-handler-spread')
const adaptedNoUnnecessaryNavigatorRequestMediaKeySystemAccessSpread = adaptPluginRule(noUnnecessaryNavigatorRequestMediaKeySystemAccessSpreadRule, 'no-unnecessary-navigator-request-media-key-system-access-spread')
const adaptedNoUnnecessaryNavigatorCanShareSpread = adaptPluginRule(noUnnecessaryNavigatorCanShareSpreadRule, 'no-unnecessary-navigator-can-share-spread')
const adaptedNoUnnecessaryNavigatorShareSpread = adaptPluginRule(noUnnecessaryNavigatorShareSpreadRule, 'no-unnecessary-navigator-share-spread')
const adaptedNoUnnecessaryNavigatorGetGamepadsSpread = adaptPluginRule(noUnnecessaryNavigatorGetGamepadsSpreadRule, 'no-unnecessary-navigator-get-gamepads-spread')
const adaptedNoUnnecessaryNavigatorRequestIdleCallbackSpread = adaptPluginRule(noUnnecessaryNavigatorRequestIdleCallbackSpreadRule, 'no-unnecessary-navigator-request-idle-callback-spread')
const adaptedNoUnnecessaryNavigatorCancelIdleCallbackSpread = adaptPluginRule(noUnnecessaryNavigatorCancelIdleCallbackSpreadRule, 'no-unnecessary-navigator-cancel-idle-callback-spread')
const adaptedNoUnnecessaryNavigatorJavaEnabledSpread = adaptPluginRule(noUnnecessaryNavigatorJavaEnabledSpreadRule, 'no-unnecessary-navigator-java-enabled-spread')
const adaptedNoUnnecessaryNavigatorCookieEnabledSpread = adaptPluginRule(noUnnecessaryNavigatorCookieEnabledSpreadRule, 'no-unnecessary-navigator-cookie-enabled-spread')
const adaptedNoUnnecessaryHistoryPushStateSpread = adaptPluginRule(noUnnecessaryHistoryPushStateSpreadRule, 'no-unnecessary-history-push-state-spread')
const adaptedNoUnnecessaryHistoryReplaceStateSpread = adaptPluginRule(noUnnecessaryHistoryReplaceStateSpreadRule, 'no-unnecessary-history-replace-state-spread')
const adaptedNoUnnecessaryHistoryGoSpread = adaptPluginRule(noUnnecessaryHistoryGoSpreadRule, 'no-unnecessary-history-go-spread')
const adaptedNoUnnecessaryHistoryBackSpread = adaptPluginRule(noUnnecessaryHistoryBackSpreadRule, 'no-unnecessary-history-back-spread')
const adaptedNoUnnecessaryHistoryForwardSpread = adaptPluginRule(noUnnecessaryHistoryForwardSpreadRule, 'no-unnecessary-history-forward-spread')
const adaptedNoUnnecessaryLocationAssignSpread = adaptPluginRule(noUnnecessaryLocationAssignSpreadRule, 'no-unnecessary-location-assign-spread')
const adaptedNoUnnecessaryLocationReloadSpread = adaptPluginRule(noUnnecessaryLocationReloadSpreadRule, 'no-unnecessary-location-reload-spread')
const adaptedNoUnnecessaryLocationReplaceSpread = adaptPluginRule(noUnnecessaryLocationReplaceSpreadRule, 'no-unnecessary-location-replace-spread')
const adaptedNoUnnecessaryLocationToStringSpread = adaptPluginRule(noUnnecessaryLocationToStringSpreadRule, 'no-unnecessary-location-to-string-spread')
const adaptedNoUnnecessaryPerformanceNowSpread = adaptPluginRule(noUnnecessaryPerformanceNowSpreadRule, 'no-unnecessary-performance-now-spread')
const adaptedNoUnnecessaryPerformanceMarkSpread = adaptPluginRule(noUnnecessaryPerformanceMarkSpreadRule, 'no-unnecessary-performance-mark-spread')
const adaptedNoUnnecessaryPerformanceMeasureSpread = adaptPluginRule(noUnnecessaryPerformanceMeasureSpreadRule, 'no-unnecessary-performance-measure-spread')
const adaptedNoUnnecessaryPerformanceClearMarksSpread = adaptPluginRule(noUnnecessaryPerformanceClearMarksSpreadRule, 'no-unnecessary-performance-clear-marks-spread')
const adaptedNoUnnecessaryPerformanceClearMeasuresSpread = adaptPluginRule(noUnnecessaryPerformanceClearMeasuresSpreadRule, 'no-unnecessary-performance-clear-measures-spread')
const adaptedNoUnnecessaryPerformanceGetEntriesSpread = adaptPluginRule(noUnnecessaryPerformanceGetEntriesSpreadRule, 'no-unnecessary-performance-get-entries-spread')
const adaptedNoUnnecessaryPerformanceGetEntriesByNameSpread = adaptPluginRule(noUnnecessaryPerformanceGetEntriesByNameSpreadRule, 'no-unnecessary-performance-get-entries-by-name-spread')
const adaptedNoUnnecessaryPerformanceGetEntriesByTypeSpread = adaptPluginRule(noUnnecessaryPerformanceGetEntriesByTypeSpreadRule, 'no-unnecessary-performance-get-entries-by-type-spread')
const adaptedNoUnnecessaryPerformanceClearResourceTimingsSpread = adaptPluginRule(noUnnecessaryPerformanceClearResourceTimingsSpreadRule, 'no-unnecessary-performance-clear-resource-timings-spread')
const adaptedNoUnnecessaryPerformanceSetResourceTimingBufferSizeSpread = adaptPluginRule(noUnnecessaryPerformanceSetResourceTimingBufferSizeSpreadRule, 'no-unnecessary-performance-set-resource-timing-buffer-size-spread')
const adaptedNoUnnecessaryScreenOrientationLockSpread = adaptPluginRule(noUnnecessaryScreenOrientationLockSpreadRule, 'no-unnecessary-screen-orientation-lock-spread')
const adaptedNoUnnecessaryScreenOrientationUnlockSpread = adaptPluginRule(noUnnecessaryScreenOrientationUnlockSpreadRule, 'no-unnecessary-screen-orientation-unlock-spread')
const adaptedNoUnnecessaryCryptoGetRandomValuesSpread = adaptPluginRule(noUnnecessaryCryptoGetRandomValuesSpreadRule, 'no-unnecessary-crypto-get-random-values-spread')
const adaptedNoUnnecessaryCryptoRandomUuidSpread = adaptPluginRule(noUnnecessaryCryptoRandomUuidSpreadRule, 'no-unnecessary-crypto-random-uuid-spread')
const adaptedNoUnnecessaryIndexedDbOpenSpread = adaptPluginRule(noUnnecessaryIndexedDbOpenSpreadRule, 'no-unnecessary-indexed-db-open-spread')
const adaptedNoUnnecessaryIndexedDbDeleteDatabaseSpread = adaptPluginRule(noUnnecessaryIndexedDbDeleteDatabaseSpreadRule, 'no-unnecessary-indexed-db-delete-database-spread')
const adaptedNoUnnecessaryIndexedDbCmpSpread = adaptPluginRule(noUnnecessaryIndexedDbCmpSpreadRule, 'no-unnecessary-indexed-db-cmp-spread')
const adaptedNoUnnecessaryCachesOpenSpread = adaptPluginRule(noUnnecessaryCachesOpenSpreadRule, 'no-unnecessary-caches-open-spread')
const adaptedNoUnnecessaryCachesMatchSpread = adaptPluginRule(noUnnecessaryCachesMatchSpreadRule, 'no-unnecessary-caches-match-spread')
const adaptedNoUnnecessaryCachesHasSpread = adaptPluginRule(noUnnecessaryCachesHasSpreadRule, 'no-unnecessary-caches-has-spread')
const adaptedNoUnnecessaryCachesDeleteSpread = adaptPluginRule(noUnnecessaryCachesDeleteSpreadRule, 'no-unnecessary-caches-delete-spread')
const adaptedNoUnnecessaryCachesKeysSpread = adaptPluginRule(noUnnecessaryCachesKeysSpreadRule, 'no-unnecessary-caches-keys-spread')
const adaptedNoUnnecessaryWindowOpenSpread = adaptPluginRule(noUnnecessaryWindowOpenSpreadRule, 'no-unnecessary-window-open-spread')
const adaptedNoUnnecessaryWindowCloseSpread = adaptPluginRule(noUnnecessaryWindowCloseSpreadRule, 'no-unnecessary-window-close-spread')
const adaptedNoUnnecessaryWindowStopSpread = adaptPluginRule(noUnnecessaryWindowStopSpreadRule, 'no-unnecessary-window-stop-spread')
const adaptedNoUnnecessaryWindowFocusSpread = adaptPluginRule(noUnnecessaryWindowFocusSpreadRule, 'no-unnecessary-window-focus-spread')
const adaptedNoUnnecessaryWindowBlurSpread = adaptPluginRule(noUnnecessaryWindowBlurSpreadRule, 'no-unnecessary-window-blur-spread')
const adaptedNoUnnecessaryWindowScrollToSpread = adaptPluginRule(noUnnecessaryWindowScrollToSpreadRule, 'no-unnecessary-window-scroll-to-spread')
const adaptedNoUnnecessaryWindowScrollBySpread = adaptPluginRule(noUnnecessaryWindowScrollBySpreadRule, 'no-unnecessary-window-scroll-by-spread')
const adaptedNoUnnecessaryWindowScrollSpread = adaptPluginRule(noUnnecessaryWindowScrollSpreadRule, 'no-unnecessary-window-scroll-spread')
const adaptedNoUnnecessaryWindowPrintSpread = adaptPluginRule(noUnnecessaryWindowPrintSpreadRule, 'no-unnecessary-window-print-spread')
const adaptedNoUnnecessaryWindowAlertSpread = adaptPluginRule(noUnnecessaryWindowAlertSpreadRule, 'no-unnecessary-window-alert-spread')
const adaptedNoUnnecessaryWindowConfirmSpread = adaptPluginRule(noUnnecessaryWindowConfirmSpreadRule, 'no-unnecessary-window-confirm-spread')
const adaptedNoUnnecessaryWindowPromptSpread = adaptPluginRule(noUnnecessaryWindowPromptSpreadRule, 'no-unnecessary-window-prompt-spread')
const adaptedNoUnnecessaryWindowGetComputedStyleSpread = adaptPluginRule(noUnnecessaryWindowGetComputedStyleSpreadRule, 'no-unnecessary-window-get-computed-style-spread')
const adaptedNoUnnecessaryWindowGetSelectionSpread = adaptPluginRule(noUnnecessaryWindowGetSelectionSpreadRule, 'no-unnecessary-window-get-selection-spread')
const adaptedNoUnnecessaryWindowMatchMediaSpread = adaptPluginRule(noUnnecessaryWindowMatchMediaSpreadRule, 'no-unnecessary-window-match-media-spread')
const adaptedNoUnnecessaryWindowMoveToSpread = adaptPluginRule(noUnnecessaryWindowMoveToSpreadRule, 'no-unnecessary-window-move-to-spread')
const adaptedNoUnnecessaryWindowMoveBySpread = adaptPluginRule(noUnnecessaryWindowMoveBySpreadRule, 'no-unnecessary-window-move-by-spread')
const adaptedNoUnnecessaryWindowResizeToSpread = adaptPluginRule(noUnnecessaryWindowResizeToSpreadRule, 'no-unnecessary-window-resize-to-spread')
const adaptedNoUnnecessaryWindowResizeBySpread = adaptPluginRule(noUnnecessaryWindowResizeBySpreadRule, 'no-unnecessary-window-resize-by-spread')
const adaptedNoUnnecessaryWindowPostMessageSpread = adaptPluginRule(noUnnecessaryWindowPostMessageSpreadRule, 'no-unnecessary-window-post-message-spread')
const adaptedNoUnnecessaryWindowAtobSpread = adaptPluginRule(noUnnecessaryWindowAtobSpreadRule, 'no-unnecessary-window-atob-spread')
const adaptedNoUnnecessaryWindowBtoaSpread = adaptPluginRule(noUnnecessaryWindowBtoaSpreadRule, 'no-unnecessary-window-btoa-spread')
const adaptedNoUnnecessaryWindowFetchSpread = adaptPluginRule(noUnnecessaryWindowFetchSpreadRule, 'no-unnecessary-window-fetch-spread')
const adaptedNoUnnecessaryWindowCreateImageBitmapSpread = adaptPluginRule(noUnnecessaryWindowCreateImageBitmapSpreadRule, 'no-unnecessary-window-create-image-bitmap-spread')
const adaptedNoUnnecessaryWindowQueueMicrotaskSpread = adaptPluginRule(noUnnecessaryWindowQueueMicrotaskSpreadRule, 'no-unnecessary-window-queue-microtask-spread')
const adaptedNoUnnecessaryWindowReportErrorSpread = adaptPluginRule(noUnnecessaryWindowReportErrorSpreadRule, 'no-unnecessary-window-report-error-spread')
const adaptedNoUnnecessaryWindowStructuredCloneSpread = adaptPluginRule(noUnnecessaryWindowStructuredCloneSpreadRule, 'no-unnecessary-window-structured-clone-spread')
const adaptedNoUnnecessaryWindowRequestAnimationFrameSpread = adaptPluginRule(noUnnecessaryWindowRequestAnimationFrameSpreadRule, 'no-unnecessary-window-request-animation-frame-spread')
const adaptedNoUnnecessaryWindowCancelAnimationFrameSpread = adaptPluginRule(noUnnecessaryWindowCancelAnimationFrameSpreadRule, 'no-unnecessary-window-cancel-animation-frame-spread')
const adaptedNoUnnecessaryWindowRequestIdleCallbackSpread = adaptPluginRule(noUnnecessaryWindowRequestIdleCallbackSpreadRule, 'no-unnecessary-window-request-idle-callback-spread')
const adaptedNoUnnecessaryWindowCancelIdleCallbackSpread = adaptPluginRule(noUnnecessaryWindowCancelIdleCallbackSpreadRule, 'no-unnecessary-window-cancel-idle-callback-spread')
const adaptedNoUnnecessaryWindowSetTimeoutSpread = adaptPluginRule(noUnnecessaryWindowSetTimeoutSpreadRule, 'no-unnecessary-window-set-timeout-spread')
const adaptedNoUnnecessaryWindowClearTimeoutSpread = adaptPluginRule(noUnnecessaryWindowClearTimeoutSpreadRule, 'no-unnecessary-window-clear-timeout-spread')
const adaptedNoUnnecessaryWindowSetIntervalSpread = adaptPluginRule(noUnnecessaryWindowSetIntervalSpreadRule, 'no-unnecessary-window-set-interval-spread')
const adaptedNoUnnecessaryWindowClearIntervalSpread = adaptPluginRule(noUnnecessaryWindowClearIntervalSpreadRule, 'no-unnecessary-window-clear-interval-spread')
const adaptedNoUnnecessaryProcessExitSpread = adaptPluginRule(noUnnecessaryProcessExitSpreadRule, 'no-unnecessary-process-exit-spread')
const adaptedNoUnnecessaryProcessNextTickSpread = adaptPluginRule(noUnnecessaryProcessNextTickSpreadRule, 'no-unnecessary-process-next-tick-spread')
const adaptedNoUnnecessaryProcessCwdSpread = adaptPluginRule(noUnnecessaryProcessCwdSpreadRule, 'no-unnecessary-process-cwd-spread')
const adaptedNoUnnecessaryProcessChdirSpread = adaptPluginRule(noUnnecessaryProcessChdirSpreadRule, 'no-unnecessary-process-chdir-spread')
const adaptedNoUnnecessaryProcessEnvSpread = adaptPluginRule(noUnnecessaryProcessEnvSpreadRule, 'no-unnecessary-process-env-spread')
const adaptedNoUnnecessaryProcessUptimeSpread = adaptPluginRule(noUnnecessaryProcessUptimeSpreadRule, 'no-unnecessary-process-uptime-spread')
const adaptedNoUnnecessaryProcessMemoryUsageSpread = adaptPluginRule(noUnnecessaryProcessMemoryUsageSpreadRule, 'no-unnecessary-process-memory-usage-spread')
const adaptedNoUnnecessaryProcessCpuUsageSpread = adaptPluginRule(noUnnecessaryProcessCpuUsageSpreadRule, 'no-unnecessary-process-cpu-usage-spread')
const adaptedNoUnnecessaryProcessKillSpread = adaptPluginRule(noUnnecessaryProcessKillSpreadRule, 'no-unnecessary-process-kill-spread')
const adaptedNoUnnecessaryProcessAbortSpread = adaptPluginRule(noUnnecessaryProcessAbortSpreadRule, 'no-unnecessary-process-abort-spread')
const adaptedNoUnnecessaryProcessUmaskSpread = adaptPluginRule(noUnnecessaryProcessUmaskSpreadRule, 'no-unnecessary-process-umask-spread')
const adaptedNoUnnecessaryProcessGetuidSpread = adaptPluginRule(noUnnecessaryProcessGetuidSpreadRule, 'no-unnecessary-process-getuid-spread')
const adaptedNoUnnecessaryProcessSetuidSpread = adaptPluginRule(noUnnecessaryProcessSetuidSpreadRule, 'no-unnecessary-process-setuid-spread')
const adaptedNoUnnecessaryProcessGetgidSpread = adaptPluginRule(noUnnecessaryProcessGetgidSpreadRule, 'no-unnecessary-process-getgid-spread')
const adaptedNoUnnecessaryProcessSetgidSpread = adaptPluginRule(noUnnecessaryProcessSetgidSpreadRule, 'no-unnecessary-process-setgid-spread')
const adaptedNoUnnecessaryProcessHrtimeSpread = adaptPluginRule(noUnnecessaryProcessHrtimeSpreadRule, 'no-unnecessary-process-hrtime-spread')
const adaptedNoUnnecessaryProcessArgvSpread = adaptPluginRule(noUnnecessaryProcessArgvSpreadRule, 'no-unnecessary-process-argv-spread')
const adaptedNoUnnecessaryBufferAllocSpread = adaptPluginRule(noUnnecessaryBufferAllocSpreadRule, 'no-unnecessary-buffer-alloc-spread')
const adaptedNoUnnecessaryBufferAllocUnsafeSpread = adaptPluginRule(noUnnecessaryBufferAllocUnsafeSpreadRule, 'no-unnecessary-buffer-alloc-unsafe-spread')
const adaptedNoUnnecessaryBufferAllocUnsafeSlowSpread = adaptPluginRule(noUnnecessaryBufferAllocUnsafeSlowSpreadRule, 'no-unnecessary-buffer-alloc-unsafe-slow-spread')
const adaptedNoUnnecessaryBufferFromSpread = adaptPluginRule(noUnnecessaryBufferFromSpreadRule, 'no-unnecessary-buffer-from-spread')
const adaptedNoUnnecessaryBufferOfSpread = adaptPluginRule(noUnnecessaryBufferOfSpreadRule, 'no-unnecessary-buffer-of-spread')
const adaptedNoUnnecessaryBufferIsBufferSpread = adaptPluginRule(noUnnecessaryBufferIsBufferSpreadRule, 'no-unnecessary-buffer-is-buffer-spread')
const adaptedNoUnnecessaryBufferIsEncodingSpread = adaptPluginRule(noUnnecessaryBufferIsEncodingSpreadRule, 'no-unnecessary-buffer-is-encoding-spread')
const adaptedNoUnnecessaryBufferByteLengthSpread = adaptPluginRule(noUnnecessaryBufferByteLengthSpreadRule, 'no-unnecessary-buffer-byte-length-spread')
const adaptedNoUnnecessaryBufferCompareSpread = adaptPluginRule(noUnnecessaryBufferCompareSpreadRule, 'no-unnecessary-buffer-compare-spread')
const adaptedNoUnnecessaryBufferConcatSpread = adaptPluginRule(noUnnecessaryBufferConcatSpreadRule, 'no-unnecessary-buffer-concat-spread')
const adaptedNoUnnecessaryPathJoinSpread = adaptPluginRule(noUnnecessaryPathJoinSpreadRule, 'no-unnecessary-path-join-spread')
const adaptedNoUnnecessaryPathResolveSpread = adaptPluginRule(noUnnecessaryPathResolveSpreadRule, 'no-unnecessary-path-resolve-spread')
const adaptedNoUnnecessaryPathNormalizeSpread = adaptPluginRule(noUnnecessaryPathNormalizeSpreadRule, 'no-unnecessary-path-normalize-spread')
const adaptedNoUnnecessaryPathRelativeSpread = adaptPluginRule(noUnnecessaryPathRelativeSpreadRule, 'no-unnecessary-path-relative-spread')
const adaptedNoUnnecessaryPathDirnameSpread = adaptPluginRule(noUnnecessaryPathDirnameSpreadRule, 'no-unnecessary-path-dirname-spread')
const adaptedNoUnnecessaryPathBasenameSpread = adaptPluginRule(noUnnecessaryPathBasenameSpreadRule, 'no-unnecessary-path-basename-spread')
const adaptedNoUnnecessaryPathExtnameSpread = adaptPluginRule(noUnnecessaryPathExtnameSpreadRule, 'no-unnecessary-path-extname-spread')
const adaptedNoUnnecessaryPathParseSpread = adaptPluginRule(noUnnecessaryPathParseSpreadRule, 'no-unnecessary-path-parse-spread')
const adaptedNoUnnecessaryPathFormatSpread = adaptPluginRule(noUnnecessaryPathFormatSpreadRule, 'no-unnecessary-path-format-spread')
const adaptedNoUnnecessaryPathIsAbsoluteSpread = adaptPluginRule(noUnnecessaryPathIsAbsoluteSpreadRule, 'no-unnecessary-path-is-absolute-spread')
const adaptedNoUnnecessaryPathToNamespacedPathSpread = adaptPluginRule(noUnnecessaryPathToNamespacedPathSpreadRule, 'no-unnecessary-path-to-namespaced-path-spread')
const adaptedNoUnnecessaryFsReadFileSpread = adaptPluginRule(noUnnecessaryFsReadFileSpreadRule, 'no-unnecessary-fs-read-file-spread')
const adaptedNoUnnecessaryFsWriteFileSpread = adaptPluginRule(noUnnecessaryFsWriteFileSpreadRule, 'no-unnecessary-fs-write-file-spread')
const adaptedNoUnnecessaryFsAppendFileSpread = adaptPluginRule(noUnnecessaryFsAppendFileSpreadRule, 'no-unnecessary-fs-append-file-spread')
const adaptedNoUnnecessaryFsCopyFileSpread = adaptPluginRule(noUnnecessaryFsCopyFileSpreadRule, 'no-unnecessary-fs-copy-file-spread')
const adaptedNoUnnecessaryFsRenameSpread = adaptPluginRule(noUnnecessaryFsRenameSpreadRule, 'no-unnecessary-fs-rename-spread')
const adaptedNoUnnecessaryFsUnlinkSpread = adaptPluginRule(noUnnecessaryFsUnlinkSpreadRule, 'no-unnecessary-fs-unlink-spread')
const adaptedNoUnnecessaryFsMkdirSpread = adaptPluginRule(noUnnecessaryFsMkdirSpreadRule, 'no-unnecessary-fs-mkdir-spread')
const adaptedNoUnnecessaryFsRmdirSpread = adaptPluginRule(noUnnecessaryFsRmdirSpreadRule, 'no-unnecessary-fs-rmdir-spread')
const adaptedNoUnnecessaryFsReaddirSpread = adaptPluginRule(noUnnecessaryFsReaddirSpreadRule, 'no-unnecessary-fs-readdir-spread')
const adaptedNoUnnecessaryFsStatSpread = adaptPluginRule(noUnnecessaryFsStatSpreadRule, 'no-unnecessary-fs-stat-spread')
const adaptedNoUnnecessaryFsLstatSpread = adaptPluginRule(noUnnecessaryFsLstatSpreadRule, 'no-unnecessary-fs-lstat-spread')
const adaptedNoUnnecessaryFsFstatSpread = adaptPluginRule(noUnnecessaryFsFstatSpreadRule, 'no-unnecessary-fs-fstat-spread')
const adaptedNoUnnecessaryFsExistsSpread = adaptPluginRule(noUnnecessaryFsExistsSpreadRule, 'no-unnecessary-fs-exists-spread')
const adaptedNoUnnecessaryFsExistsSyncSpread = adaptPluginRule(noUnnecessaryFsExistsSyncSpreadRule, 'no-unnecessary-fs-exists-sync-spread')
const adaptedNoUnnecessaryFsAccessSpread = adaptPluginRule(noUnnecessaryFsAccessSpreadRule, 'no-unnecessary-fs-access-spread')
const adaptedNoUnnecessaryFsChmodSpread = adaptPluginRule(noUnnecessaryFsChmodSpreadRule, 'no-unnecessary-fs-chmod-spread')
const adaptedNoUnnecessaryFsChownSpread = adaptPluginRule(noUnnecessaryFsChownSpreadRule, 'no-unnecessary-fs-chown-spread')
const adaptedNoUnnecessaryFsReadDirSyncSpread = adaptPluginRule(noUnnecessaryFsReadDirSyncSpreadRule, 'no-unnecessary-fs-read-dir-sync-spread')
const adaptedNoUnnecessaryFsReadFileSyncSpread = adaptPluginRule(noUnnecessaryFsReadFileSyncSpreadRule, 'no-unnecessary-fs-read-file-sync-spread')
const adaptedNoUnnecessaryFsWriteFileSyncSpread = adaptPluginRule(noUnnecessaryFsWriteFileSyncSpreadRule, 'no-unnecessary-fs-write-file-sync-spread')
const adaptedNoUnnecessaryFsMkdirSyncSpread = adaptPluginRule(noUnnecessaryFsMkdirSyncSpreadRule, 'no-unnecessary-fs-mkdir-sync-spread')
const adaptedNoUnnecessaryFsRmSyncSpread = adaptPluginRule(noUnnecessaryFsRmSyncSpreadRule, 'no-unnecessary-fs-rm-sync-spread')
const adaptedNoUnnecessaryFsRmSpread = adaptPluginRule(noUnnecessaryFsRmSpreadRule, 'no-unnecessary-fs-rm-spread')
const adaptedNoUnnecessaryFsWatchSpread = adaptPluginRule(noUnnecessaryFsWatchSpreadRule, 'no-unnecessary-fs-watch-spread')
const adaptedNoUnnecessaryFsWatchFileSpread = adaptPluginRule(noUnnecessaryFsWatchFileSpreadRule, 'no-unnecessary-fs-watch-file-spread')
const adaptedNoUnnecessaryFsUnwatchFileSpread = adaptPluginRule(noUnnecessaryFsUnwatchFileSpreadRule, 'no-unnecessary-fs-unwatch-file-spread')
const adaptedNoUnnecessaryFsCreateReadStreamSpread = adaptPluginRule(noUnnecessaryFsCreateReadStreamSpreadRule, 'no-unnecessary-fs-create-read-stream-spread')
const adaptedNoUnnecessaryFsCreateWriteStreamSpread = adaptPluginRule(noUnnecessaryFsCreateWriteStreamSpreadRule, 'no-unnecessary-fs-create-write-stream-spread')
const adaptedNoUnnecessaryUtilPromisifySpread = adaptPluginRule(noUnnecessaryUtilPromisifySpreadRule, 'no-unnecessary-util-promisify-spread')
const adaptedNoUnnecessaryUtilCallbackifySpread = adaptPluginRule(noUnnecessaryUtilCallbackifySpreadRule, 'no-unnecessary-util-callbackify-spread')
const adaptedNoUnnecessaryUtilInspectSpread = adaptPluginRule(noUnnecessaryUtilInspectSpreadRule, 'no-unnecessary-util-inspect-spread')
const adaptedNoUnnecessaryUtilFormatSpread = adaptPluginRule(noUnnecessaryUtilFormatSpreadRule, 'no-unnecessary-util-format-spread')
const adaptedNoUnnecessaryUtilDeprecateSpread = adaptPluginRule(noUnnecessaryUtilDeprecateSpreadRule, 'no-unnecessary-util-deprecate-spread')
const adaptedNoUnnecessaryUtilIsDeepStrictEqualSpread = adaptPluginRule(noUnnecessaryUtilIsDeepStrictEqualSpreadRule, 'no-unnecessary-util-is-deep-strict-equal-spread')
const adaptedNoUnnecessaryUtilTypesIsDateSpread = adaptPluginRule(noUnnecessaryUtilTypesIsDateSpreadRule, 'no-unnecessary-util-types-is-date-spread')
const adaptedNoUnnecessaryUtilTextDecoderDecodeSpread = adaptPluginRule(noUnnecessaryUtilTextDecoderDecodeSpreadRule, 'no-unnecessary-util-text-decoder-decode-spread')
const adaptedNoUnnecessaryOsHomedirSpread = adaptPluginRule(noUnnecessaryOsHomedirSpreadRule, 'no-unnecessary-os-homedir-spread')
const adaptedNoUnnecessaryOsTmpdirSpread = adaptPluginRule(noUnnecessaryOsTmpdirSpreadRule, 'no-unnecessary-os-tmpdir-spread')
const adaptedNoUnnecessaryOsHostnameSpread = adaptPluginRule(noUnnecessaryOsHostnameSpreadRule, 'no-unnecessary-os-hostname-spread')
const adaptedNoUnnecessaryOsTypeSpread = adaptPluginRule(noUnnecessaryOsTypeSpreadRule, 'no-unnecessary-os-type-spread')
const adaptedNoUnnecessaryOsPlatformSpread = adaptPluginRule(noUnnecessaryOsPlatformSpreadRule, 'no-unnecessary-os-platform-spread')
const adaptedNoUnnecessaryOsArchSpread = adaptPluginRule(noUnnecessaryOsArchSpreadRule, 'no-unnecessary-os-arch-spread')
const adaptedNoUnnecessaryOsReleaseSpread = adaptPluginRule(noUnnecessaryOsReleaseSpreadRule, 'no-unnecessary-os-release-spread')
const adaptedNoUnnecessaryOsCpusSpread = adaptPluginRule(noUnnecessaryOsCpusSpreadRule, 'no-unnecessary-os-cpus-spread')
const adaptedNoUnnecessaryOsTotalmemSpread = adaptPluginRule(noUnnecessaryOsTotalmemSpreadRule, 'no-unnecessary-os-totalmem-spread')
const adaptedNoUnnecessaryOsFreememSpread = adaptPluginRule(noUnnecessaryOsFreememSpreadRule, 'no-unnecessary-os-freemem-spread')
const adaptedNoUnnecessaryOsUptimeSpread = adaptPluginRule(noUnnecessaryOsUptimeSpreadRule, 'no-unnecessary-os-uptime-spread')
const adaptedNoUnnecessaryOsLoadavgSpread = adaptPluginRule(noUnnecessaryOsLoadavgSpreadRule, 'no-unnecessary-os-loadavg-spread')
const adaptedNoUnnecessaryOsNetworkInterfacesSpread = adaptPluginRule(noUnnecessaryOsNetworkInterfacesSpreadRule, 'no-unnecessary-os-network-interfaces-spread')
const adaptedNoUnnecessaryOsConstantsSpread = adaptPluginRule(noUnnecessaryOsConstantsSpreadRule, 'no-unnecessary-os-constants-spread')
const adaptedNoUnnecessaryOsUserInfoSpread = adaptPluginRule(noUnnecessaryOsUserInfoSpreadRule, 'no-unnecessary-os-user-info-spread')
const adaptedNoUnnecessaryOsEolSpread = adaptPluginRule(noUnnecessaryOsEolSpreadRule, 'no-unnecessary-os-eol-spread')
const adaptedNoUnnecessaryOsDevNullSpread = adaptPluginRule(noUnnecessaryOsDevNullSpreadRule, 'no-unnecessary-os-dev-null-spread')
const adaptedNoUnnecessaryOsGetPrioritySpread = adaptPluginRule(noUnnecessaryOsGetPrioritySpreadRule, 'no-unnecessary-os-get-priority-spread')
const adaptedNoUnnecessaryOsSetPrioritySpread = adaptPluginRule(noUnnecessaryOsSetPrioritySpreadRule, 'no-unnecessary-os-set-priority-spread')
const adaptedNoUnnecessaryCryptoCreateHashSpread = adaptPluginRule(noUnnecessaryCryptoCreateHashSpreadRule, 'no-unnecessary-crypto-create-hash-spread')
const adaptedNoUnnecessaryCryptoCreateHmacSpread = adaptPluginRule(noUnnecessaryCryptoCreateHmacSpreadRule, 'no-unnecessary-crypto-create-hmac-spread')
const adaptedNoUnnecessaryCryptoCreateCipherSpread = adaptPluginRule(noUnnecessaryCryptoCreateCipherSpreadRule, 'no-unnecessary-crypto-create-cipher-spread')
const adaptedNoUnnecessaryCryptoCreateCipherIvSpread = adaptPluginRule(noUnnecessaryCryptoCreateCipherIvSpreadRule, 'no-unnecessary-crypto-create-cipher-iv-spread')
const adaptedNoUnnecessaryCryptoCreateDecipherSpread = adaptPluginRule(noUnnecessaryCryptoCreateDecipherSpreadRule, 'no-unnecessary-crypto-create-decipher-spread')
const adaptedNoUnnecessaryCryptoCreateDecipherIvSpread = adaptPluginRule(noUnnecessaryCryptoCreateDecipherIvSpreadRule, 'no-unnecessary-crypto-create-decipher-iv-spread')
const adaptedNoUnnecessaryCryptoCreateSignSpread = adaptPluginRule(noUnnecessaryCryptoCreateSignSpreadRule, 'no-unnecessary-crypto-create-sign-spread')
const adaptedNoUnnecessaryCryptoCreateVerifySpread = adaptPluginRule(noUnnecessaryCryptoCreateVerifySpreadRule, 'no-unnecessary-crypto-create-verify-spread')
const adaptedNoUnnecessaryCryptoRandomBytesSpread = adaptPluginRule(noUnnecessaryCryptoRandomBytesSpreadRule, 'no-unnecessary-crypto-random-bytes-spread')
const adaptedNoUnnecessaryCryptoPbkdf2Spread = adaptPluginRule(noUnnecessaryCryptoPbkdf2SpreadRule, 'no-unnecessary-crypto-pbkdf2-spread')
const adaptedNoUnnecessaryCryptoScryptSpread = adaptPluginRule(noUnnecessaryCryptoScryptSpreadRule, 'no-unnecessary-crypto-scrypt-spread')
const adaptedNoUnnecessaryCryptoCreateSecretKeySpread = adaptPluginRule(noUnnecessaryCryptoCreateSecretKeySpreadRule, 'no-unnecessary-crypto-create-secret-key-spread')
const adaptedNoUnnecessaryCryptoCreatePublicKeySpread = adaptPluginRule(noUnnecessaryCryptoCreatePublicKeySpreadRule, 'no-unnecessary-crypto-create-public-key-spread')
const adaptedNoUnnecessaryCryptoCreatePrivateKeySpread = adaptPluginRule(noUnnecessaryCryptoCreatePrivateKeySpreadRule, 'no-unnecessary-crypto-create-private-key-spread')
const adaptedNoUnnecessaryCryptoGetCiphersSpread = adaptPluginRule(noUnnecessaryCryptoGetCiphersSpreadRule, 'no-unnecessary-crypto-get-ciphers-spread')
const adaptedNoUnnecessaryCryptoGetHashesSpread = adaptPluginRule(noUnnecessaryCryptoGetHashesSpreadRule, 'no-unnecessary-crypto-get-hashes-spread')
const adaptedNoUnnecessaryCryptoTimingSafeEqualSpread = adaptPluginRule(noUnnecessaryCryptoTimingSafeEqualSpreadRule, 'no-unnecessary-crypto-timing-safe-equal-spread')
const adaptedNoUnnecessaryEventEmitterOnSpread = adaptPluginRule(noUnnecessaryEventEmitterOnSpreadRule, 'no-unnecessary-event-emitter-on-spread')
const adaptedNoUnnecessaryEventEmitterOffSpread = adaptPluginRule(noUnnecessaryEventEmitterOffSpreadRule, 'no-unnecessary-event-emitter-off-spread')
const adaptedNoUnnecessaryEventEmitterOnceSpread = adaptPluginRule(noUnnecessaryEventEmitterOnceSpreadRule, 'no-unnecessary-event-emitter-once-spread')
const adaptedNoUnnecessaryEventEmitterEmitSpread = adaptPluginRule(noUnnecessaryEventEmitterEmitSpreadRule, 'no-unnecessary-event-emitter-emit-spread')
const adaptedNoUnnecessaryEventEmitterRemoveListenerSpread = adaptPluginRule(noUnnecessaryEventEmitterRemoveListenerSpreadRule, 'no-unnecessary-event-emitter-remove-listener-spread')
const adaptedNoUnnecessaryEventEmitterRemoveAllListenersSpread = adaptPluginRule(noUnnecessaryEventEmitterRemoveAllListenersSpreadRule, 'no-unnecessary-event-emitter-remove-all-listeners-spread')
const adaptedNoUnnecessaryEventEmitterListenersSpread = adaptPluginRule(noUnnecessaryEventEmitterListenersSpreadRule, 'no-unnecessary-event-emitter-listeners-spread')
const adaptedNoUnnecessaryEventEmitterListenerCountSpread = adaptPluginRule(noUnnecessaryEventEmitterListenerCountSpreadRule, 'no-unnecessary-event-emitter-listener-count-spread')
const adaptedNoUnnecessaryEventEmitterPrependListenerSpread = adaptPluginRule(noUnnecessaryEventEmitterPrependListenerSpreadRule, 'no-unnecessary-event-emitter-prepend-listener-spread')
const adaptedNoUnnecessaryEventEmitterPrependOnceListenerSpread = adaptPluginRule(noUnnecessaryEventEmitterPrependOnceListenerSpreadRule, 'no-unnecessary-event-emitter-prepend-once-listener-spread')
const adaptedNoUnnecessaryEventEmitterSetMaxListenersSpread = adaptPluginRule(noUnnecessaryEventEmitterSetMaxListenersSpreadRule, 'no-unnecessary-event-emitter-set-max-listeners-spread')
const adaptedNoUnnecessaryEventEmitterGetMaxListenersSpread = adaptPluginRule(noUnnecessaryEventEmitterGetMaxListenersSpreadRule, 'no-unnecessary-event-emitter-get-max-listeners-spread')
const adaptedNoUnnecessaryEventEmitterEventNamesSpread = adaptPluginRule(noUnnecessaryEventEmitterEventNamesSpreadRule, 'no-unnecessary-event-emitter-event-names-spread')
const adaptedNoUnnecessaryEventEmitterRawListenersSpread = adaptPluginRule(noUnnecessaryEventEmitterRawListenersSpreadRule, 'no-unnecessary-event-emitter-raw-listeners-spread')
const adaptedNoUnnecessaryStreamPipelineSpread = adaptPluginRule(noUnnecessaryStreamPipelineSpreadRule, 'no-unnecessary-stream-pipeline-spread')
const adaptedNoUnnecessaryStreamComposeSpread = adaptPluginRule(noUnnecessaryStreamComposeSpreadRule, 'no-unnecessary-stream-compose-spread')
const adaptedNoUnnecessaryStreamReadableFromSpread = adaptPluginRule(noUnnecessaryStreamReadableFromSpreadRule, 'no-unnecessary-stream-readable-from-spread')
const adaptedNoUnnecessaryChildProcessExecSpread = adaptPluginRule(noUnnecessaryChildProcessExecSpreadRule, 'no-unnecessary-child-process-exec-spread')
const adaptedNoUnnecessaryChildProcessExecFileSpread = adaptPluginRule(noUnnecessaryChildProcessExecFileSpreadRule, 'no-unnecessary-child-process-exec-file-spread')
const adaptedNoUnnecessaryChildProcessSpawnSpread = adaptPluginRule(noUnnecessaryChildProcessSpawnSpreadRule, 'no-unnecessary-child-process-spawn-spread')
const adaptedNoUnnecessaryChildProcessForkSpread = adaptPluginRule(noUnnecessaryChildProcessForkSpreadRule, 'no-unnecessary-child-process-fork-spread')
const adaptedNoUnnecessaryHttpRequestSpread = adaptPluginRule(noUnnecessaryHttpRequestSpreadRule, 'no-unnecessary-http-request-spread')
const adaptedNoUnnecessaryHttpGetSpread = adaptPluginRule(noUnnecessaryHttpGetSpreadRule, 'no-unnecessary-http-get-spread')
const adaptedNoUnnecessaryHttpsRequestSpread = adaptPluginRule(noUnnecessaryHttpsRequestSpreadRule, 'no-unnecessary-https-request-spread')
const adaptedNoUnnecessaryHttpsGetSpread = adaptPluginRule(noUnnecessaryHttpsGetSpreadRule, 'no-unnecessary-https-get-spread')
const adaptedNoUnnecessaryUrlParseNodeSpread = adaptPluginRule(noUnnecessaryUrlParseNodeSpreadRule, 'no-unnecessary-url-parse-node-spread')
const adaptedNoUnnecessaryUrlFormatSpread = adaptPluginRule(noUnnecessaryUrlFormatSpreadRule, 'no-unnecessary-url-format-spread')
const adaptedNoUnnecessaryUrlResolveSpread = adaptPluginRule(noUnnecessaryUrlResolveSpreadRule, 'no-unnecessary-url-resolve-spread')
const adaptedNoUnnecessaryUrlDomainToUnicodeSpread = adaptPluginRule(noUnnecessaryUrlDomainToUnicodeSpreadRule, 'no-unnecessary-url-domain-to-unicode-spread')
const adaptedNoUnnecessaryUrlDomainToAsciiSpread = adaptPluginRule(noUnnecessaryUrlDomainToAsciiSpreadRule, 'no-unnecessary-url-domain-to-ascii-spread')
const adaptedNoUnnecessaryQuerystringParseSpread = adaptPluginRule(noUnnecessaryQuerystringParseSpreadRule, 'no-unnecessary-querystring-parse-spread')
const adaptedNoUnnecessaryQuerystringStringifySpread = adaptPluginRule(noUnnecessaryQuerystringStringifySpreadRule, 'no-unnecessary-querystring-stringify-spread')
const adaptedNoUnnecessaryQuerystringEscapeSpread = adaptPluginRule(noUnnecessaryQuerystringEscapeSpreadRule, 'no-unnecessary-querystring-escape-spread')
const adaptedNoUnnecessaryQuerystringUnescapeSpread = adaptPluginRule(noUnnecessaryQuerystringUnescapeSpreadRule, 'no-unnecessary-querystring-unescape-spread')
const adaptedNoUnnecessaryAssertOkSpread = adaptPluginRule(noUnnecessaryAssertOkSpreadRule, 'no-unnecessary-assert-ok-spread')
const adaptedNoUnnecessaryAssertEqualSpread = adaptPluginRule(noUnnecessaryAssertEqualSpreadRule, 'no-unnecessary-assert-equal-spread')
const adaptedNoUnnecessaryAssertNotEqualSpread = adaptPluginRule(noUnnecessaryAssertNotEqualSpreadRule, 'no-unnecessary-assert-not-equal-spread')
const adaptedNoUnnecessaryAssertDeepEqualSpread = adaptPluginRule(noUnnecessaryAssertDeepEqualSpreadRule, 'no-unnecessary-assert-deep-equal-spread')
const adaptedNoUnnecessaryAssertNotDeepEqualSpread = adaptPluginRule(noUnnecessaryAssertNotDeepEqualSpreadRule, 'no-unnecessary-assert-not-deep-equal-spread')
const adaptedNoUnnecessaryAssertDeepStrictEqualSpread = adaptPluginRule(noUnnecessaryAssertDeepStrictEqualSpreadRule, 'no-unnecessary-assert-deep-strict-equal-spread')
const adaptedNoUnnecessaryAssertNotDeepStrictEqualSpread = adaptPluginRule(noUnnecessaryAssertNotDeepStrictEqualSpreadRule, 'no-unnecessary-assert-not-deep-strict-equal-spread')
const adaptedNoUnnecessaryAssertStrictEqualSpread = adaptPluginRule(noUnnecessaryAssertStrictEqualSpreadRule, 'no-unnecessary-assert-strict-equal-spread')
const adaptedNoUnnecessaryAssertNotStrictEqualSpread = adaptPluginRule(noUnnecessaryAssertNotStrictEqualSpreadRule, 'no-unnecessary-assert-not-strict-equal-spread')
const adaptedNoUnnecessaryAssertThrowsSpread = adaptPluginRule(noUnnecessaryAssertThrowsSpreadRule, 'no-unnecessary-assert-throws-spread')
const adaptedNoUnnecessaryAssertRejectsSpread = adaptPluginRule(noUnnecessaryAssertRejectsSpreadRule, 'no-unnecessary-assert-rejects-spread')
const adaptedNoUnnecessaryAssertDoesNotThrowSpread = adaptPluginRule(noUnnecessaryAssertDoesNotThrowSpreadRule, 'no-unnecessary-assert-does-not-throw-spread')
const adaptedNoUnnecessaryAssertDoesNotRejectSpread = adaptPluginRule(noUnnecessaryAssertDoesNotRejectSpreadRule, 'no-unnecessary-assert-does-not-reject-spread')
const adaptedNoUnnecessaryAssertIfErrorSpread = adaptPluginRule(noUnnecessaryAssertIfErrorSpreadRule, 'no-unnecessary-assert-if-error-spread')
const adaptedNoUnnecessaryAssertFailSpread = adaptPluginRule(noUnnecessaryAssertFailSpreadRule, 'no-unnecessary-assert-fail-spread')
const adaptedNoUnnecessaryAssertMatchSpread = adaptPluginRule(noUnnecessaryAssertMatchSpreadRule, 'no-unnecessary-assert-match-spread')
const adaptedNoUnnecessaryAssertDoesNotMatchSpread = adaptPluginRule(noUnnecessaryAssertDoesNotMatchSpreadRule, 'no-unnecessary-assert-does-not-match-spread')
const adaptedNoUnnecessaryAssertCallTrackerCallsSpread = adaptPluginRule(noUnnecessaryAssertCallTrackerCallsSpreadRule, 'no-unnecessary-assert-call-tracker-calls-spread')
const adaptedNoUnnecessaryPromiseInstanceThenSpread = adaptPluginRule(noUnnecessaryPromiseInstanceThenSpreadRule, 'no-unnecessary-promise-instance-then-spread')
const adaptedNoUnnecessaryPromiseInstanceCatchSpread = adaptPluginRule(noUnnecessaryPromiseInstanceCatchSpreadRule, 'no-unnecessary-promise-instance-catch-spread')
const adaptedNoUnnecessaryPromiseInstanceFinallySpread = adaptPluginRule(noUnnecessaryPromiseInstanceFinallySpreadRule, 'no-unnecessary-promise-instance-finally-spread')
const adaptedNoUnnecessaryIntlCollatorCompareSpread = adaptPluginRule(noUnnecessaryIntlCollatorCompareSpreadRule, 'no-unnecessary-intl-collator-compare-spread')
const adaptedNoUnnecessaryIntlNumberFormatFormatSpread = adaptPluginRule(noUnnecessaryIntlNumberFormatFormatSpreadRule, 'no-unnecessary-intl-number-format-format-spread')
const adaptedNoUnnecessaryIntlDateTimeFormatFormatSpread = adaptPluginRule(noUnnecessaryIntlDateTimeFormatFormatSpreadRule, 'no-unnecessary-intl-date-time-format-format-spread')
const adaptedNoUnnecessaryIntlListFormatFormatSpread = adaptPluginRule(noUnnecessaryIntlListFormatFormatSpreadRule, 'no-unnecessary-intl-list-format-format-spread')
const adaptedNoUnnecessaryIntlRelativeTimeFormatSpread = adaptPluginRule(noUnnecessaryIntlRelativeTimeFormatSpreadRule, 'no-unnecessary-intl-relative-time-format-spread')
const adaptedNoUnnecessaryIntlPluralRulesSpread = adaptPluginRule(noUnnecessaryIntlPluralRulesSpreadRule, 'no-unnecessary-intl-plural-rules-spread')
const adaptedNoUnnecessaryIntlSegmenterSpread = adaptPluginRule(noUnnecessaryIntlSegmenterSpreadRule, 'no-unnecessary-intl-segmenter-spread')
const adaptedNoUnnecessaryIntlDisplayNamesSpread = adaptPluginRule(noUnnecessaryIntlDisplayNamesSpreadRule, 'no-unnecessary-intl-display-names-spread')
const adaptedNoUnnecessaryIteratorNextSpread = adaptPluginRule(noUnnecessaryIteratorNextSpreadRule, 'no-unnecessary-iterator-next-spread')
const adaptedNoUnnecessaryIteratorReturnSpread = adaptPluginRule(noUnnecessaryIteratorReturnSpreadRule, 'no-unnecessary-iterator-return-spread')
const adaptedNoUnnecessaryIteratorThrowSpread = adaptPluginRule(noUnnecessaryIteratorThrowSpreadRule, 'no-unnecessary-iterator-throw-spread')
const adaptedNoUnnecessaryIteratorForEachSpread = adaptPluginRule(noUnnecessaryIteratorForEachSpreadRule, 'no-unnecessary-iterator-for-each-spread')
const adaptedNoUnnecessaryIteratorMapSpread = adaptPluginRule(noUnnecessaryIteratorMapSpreadRule, 'no-unnecessary-iterator-map-spread')
const adaptedNoUnnecessaryIteratorFilterSpread = adaptPluginRule(noUnnecessaryIteratorFilterSpreadRule, 'no-unnecessary-iterator-filter-spread')
const adaptedNoUnnecessaryIteratorTakeSpread = adaptPluginRule(noUnnecessaryIteratorTakeSpreadRule, 'no-unnecessary-iterator-take-spread')
const adaptedNoUnnecessaryIteratorDropSpread = adaptPluginRule(noUnnecessaryIteratorDropSpreadRule, 'no-unnecessary-iterator-drop-spread')
const adaptedNoUnnecessaryIteratorFlatMapSpread = adaptPluginRule(noUnnecessaryIteratorFlatMapSpreadRule, 'no-unnecessary-iterator-flat-map-spread')
const adaptedNoUnnecessaryIteratorReduceSpread = adaptPluginRule(noUnnecessaryIteratorReduceSpreadRule, 'no-unnecessary-iterator-reduce-spread')
const adaptedNoUnnecessaryIteratorToArraySpread = adaptPluginRule(noUnnecessaryIteratorToArraySpreadRule, 'no-unnecessary-iterator-to-array-spread')
const adaptedNoUnnecessaryIteratorSomeSpread = adaptPluginRule(noUnnecessaryIteratorSomeSpreadRule, 'no-unnecessary-iterator-some-spread')
const adaptedNoUnnecessaryIteratorEverySpread = adaptPluginRule(noUnnecessaryIteratorEverySpreadRule, 'no-unnecessary-iterator-every-spread')
const adaptedNoUnnecessaryIteratorFindSpread = adaptPluginRule(noUnnecessaryIteratorFindSpreadRule, 'no-unnecessary-iterator-find-spread')
const adaptedNoUnnecessaryArrayIteratorNextSpread = adaptPluginRule(noUnnecessaryArrayIteratorNextSpreadRule, 'no-unnecessary-array-iterator-next-spread')
const adaptedNoUnnecessaryMapIteratorNextSpread = adaptPluginRule(noUnnecessaryMapIteratorNextSpreadRule, 'no-unnecessary-map-iterator-next-spread')
const adaptedNoUnnecessarySetIteratorNextSpread = adaptPluginRule(noUnnecessarySetIteratorNextSpreadRule, 'no-unnecessary-set-iterator-next-spread')
const adaptedNoUnnecessaryStringIteratorNextSpread = adaptPluginRule(noUnnecessaryStringIteratorNextSpreadRule, 'no-unnecessary-string-iterator-next-spread')
const adaptedNoUnnecessaryGeneratorNextSpread = adaptPluginRule(noUnnecessaryGeneratorNextSpreadRule, 'no-unnecessary-generator-next-spread')
const adaptedNoUnnecessaryGeneratorReturnSpread = adaptPluginRule(noUnnecessaryGeneratorReturnSpreadRule, 'no-unnecessary-generator-return-spread')
const adaptedNoUnnecessaryGeneratorThrowSpread = adaptPluginRule(noUnnecessaryGeneratorThrowSpreadRule, 'no-unnecessary-generator-throw-spread')
const adaptedNoUnnecessaryAsyncGeneratorNextSpread = adaptPluginRule(noUnnecessaryAsyncGeneratorNextSpreadRule, 'no-unnecessary-async-generator-next-spread')
const adaptedNoUnnecessaryAsyncGeneratorReturnSpread = adaptPluginRule(noUnnecessaryAsyncGeneratorReturnSpreadRule, 'no-unnecessary-async-generator-return-spread')
const adaptedNoUnnecessaryAsyncGeneratorThrowSpread = adaptPluginRule(noUnnecessaryAsyncGeneratorThrowSpreadRule, 'no-unnecessary-async-generator-throw-spread')
const adaptedNoUnnecessaryAsyncIteratorNextSpread = adaptPluginRule(noUnnecessaryAsyncIteratorNextSpreadRule, 'no-unnecessary-async-iterator-next-spread')
const adaptedNoUnnecessaryAsyncIteratorReturnSpread = adaptPluginRule(noUnnecessaryAsyncIteratorReturnSpreadRule, 'no-unnecessary-async-iterator-return-spread')
const adaptedNoUnnecessaryAsyncIteratorThrowSpread = adaptPluginRule(noUnnecessaryAsyncIteratorThrowSpreadRule, 'no-unnecessary-async-iterator-throw-spread')
const adaptedNoUnnecessaryResponseInstanceCloneSpread = adaptPluginRule(noUnnecessaryResponseInstanceCloneSpreadRule, 'no-unnecessary-response-instance-clone-spread')
const adaptedNoUnnecessaryResponseInstanceJsonSpread = adaptPluginRule(noUnnecessaryResponseInstanceJsonSpreadRule, 'no-unnecessary-response-instance-json-spread')
const adaptedNoUnnecessaryResponseInstanceTextSpread = adaptPluginRule(noUnnecessaryResponseInstanceTextSpreadRule, 'no-unnecessary-response-instance-text-spread')
const adaptedNoUnnecessaryResponseInstanceBlobSpread = adaptPluginRule(noUnnecessaryResponseInstanceBlobSpreadRule, 'no-unnecessary-response-instance-blob-spread')
const adaptedNoUnnecessaryResponseInstanceArrayBufferSpread = adaptPluginRule(noUnnecessaryResponseInstanceArrayBufferSpreadRule, 'no-unnecessary-response-instance-array-buffer-spread')
const adaptedNoUnnecessaryResponseInstanceFormDataSpread = adaptPluginRule(noUnnecessaryResponseInstanceFormDataSpreadRule, 'no-unnecessary-response-instance-form-data-spread')
const adaptedNoUnnecessaryRequestInstanceCloneSpread = adaptPluginRule(noUnnecessaryRequestInstanceCloneSpreadRule, 'no-unnecessary-request-instance-clone-spread')
const adaptedNoUnnecessaryRequestInstanceJsonSpread = adaptPluginRule(noUnnecessaryRequestInstanceJsonSpreadRule, 'no-unnecessary-request-instance-json-spread')
const adaptedNoUnnecessaryRequestInstanceTextSpread = adaptPluginRule(noUnnecessaryRequestInstanceTextSpreadRule, 'no-unnecessary-request-instance-text-spread')
const adaptedNoUnnecessaryRequestInstanceBlobSpread = adaptPluginRule(noUnnecessaryRequestInstanceBlobSpreadRule, 'no-unnecessary-request-instance-blob-spread')
const adaptedNoUnnecessaryRequestInstanceArrayBufferSpread = adaptPluginRule(noUnnecessaryRequestInstanceArrayBufferSpreadRule, 'no-unnecessary-request-instance-array-buffer-spread')
const adaptedNoUnnecessaryRequestInstanceFormDataSpread = adaptPluginRule(noUnnecessaryRequestInstanceFormDataSpreadRule, 'no-unnecessary-request-instance-form-data-spread')
const adaptedNoUnnecessaryHeadersInstanceGetSpread = adaptPluginRule(noUnnecessaryHeadersInstanceGetSpreadRule, 'no-unnecessary-headers-instance-get-spread')
const adaptedNoUnnecessaryHeadersInstanceSetSpread = adaptPluginRule(noUnnecessaryHeadersInstanceSetSpreadRule, 'no-unnecessary-headers-instance-set-spread')
const adaptedNoUnnecessaryHeadersInstanceHasSpread = adaptPluginRule(noUnnecessaryHeadersInstanceHasSpreadRule, 'no-unnecessary-headers-instance-has-spread')
const adaptedNoUnnecessaryHeadersInstanceDeleteSpread = adaptPluginRule(noUnnecessaryHeadersInstanceDeleteSpreadRule, 'no-unnecessary-headers-instance-delete-spread')
const adaptedNoUnnecessaryHeadersInstanceAppendSpread = adaptPluginRule(noUnnecessaryHeadersInstanceAppendSpreadRule, 'no-unnecessary-headers-instance-append-spread')
const adaptedNoUnnecessaryHeadersInstanceEntriesSpread = adaptPluginRule(noUnnecessaryHeadersInstanceEntriesSpreadRule, 'no-unnecessary-headers-instance-entries-spread')
const adaptedNoUnnecessaryHeadersInstanceKeysSpread = adaptPluginRule(noUnnecessaryHeadersInstanceKeysSpreadRule, 'no-unnecessary-headers-instance-keys-spread')
const adaptedNoUnnecessaryHeadersInstanceValuesSpread = adaptPluginRule(noUnnecessaryHeadersInstanceValuesSpreadRule, 'no-unnecessary-headers-instance-values-spread')
const adaptedNoUnnecessaryHeadersInstanceForEachSpread = adaptPluginRule(noUnnecessaryHeadersInstanceForEachSpreadRule, 'no-unnecessary-headers-instance-for-each-spread')
const adaptedNoUnnecessaryFormDataInstanceGetSpread = adaptPluginRule(noUnnecessaryFormDataInstanceGetSpreadRule, 'no-unnecessary-form-data-instance-get-spread')
const adaptedNoUnnecessaryFormDataInstanceGetAllSpread = adaptPluginRule(noUnnecessaryFormDataInstanceGetAllSpreadRule, 'no-unnecessary-form-data-instance-get-all-spread')
const adaptedNoUnnecessaryFormDataInstanceSetSpread = adaptPluginRule(noUnnecessaryFormDataInstanceSetSpreadRule, 'no-unnecessary-form-data-instance-set-spread')
const adaptedNoUnnecessaryFormDataInstanceAppendSpread = adaptPluginRule(noUnnecessaryFormDataInstanceAppendSpreadRule, 'no-unnecessary-form-data-instance-append-spread')
const adaptedNoUnnecessaryFormDataInstanceDeleteSpread = adaptPluginRule(noUnnecessaryFormDataInstanceDeleteSpreadRule, 'no-unnecessary-form-data-instance-delete-spread')
const adaptedNoUnnecessaryFormDataInstanceHasSpread = adaptPluginRule(noUnnecessaryFormDataInstanceHasSpreadRule, 'no-unnecessary-form-data-instance-has-spread')
const adaptedNoUnnecessaryFormDataInstanceEntriesSpread = adaptPluginRule(noUnnecessaryFormDataInstanceEntriesSpreadRule, 'no-unnecessary-form-data-instance-entries-spread')
const adaptedNoUnnecessaryFormDataInstanceKeysSpread = adaptPluginRule(noUnnecessaryFormDataInstanceKeysSpreadRule, 'no-unnecessary-form-data-instance-keys-spread')
const adaptedNoUnnecessaryFormDataInstanceValuesSpread = adaptPluginRule(noUnnecessaryFormDataInstanceValuesSpreadRule, 'no-unnecessary-form-data-instance-values-spread')
const adaptedNoUnnecessaryFormDataInstanceForEachSpread = adaptPluginRule(noUnnecessaryFormDataInstanceForEachSpreadRule, 'no-unnecessary-form-data-instance-for-each-spread')
const adaptedNoUnnecessaryUrlInstanceToStringSpread = adaptPluginRule(noUnnecessaryUrlInstanceToStringSpreadRule, 'no-unnecessary-url-instance-to-string-spread')
const adaptedNoUnnecessaryUrlInstanceToJsonSpread = adaptPluginRule(noUnnecessaryUrlInstanceToJsonSpreadRule, 'no-unnecessary-url-instance-to-json-spread')
const adaptedNoUnnecessaryUrlSearchParamsInstanceGetSpread = adaptPluginRule(noUnnecessaryUrlSearchParamsInstanceGetSpreadRule, 'no-unnecessary-url-search-params-instance-get-spread')
const adaptedNoUnnecessaryUrlSearchParamsInstanceGetAllSpread = adaptPluginRule(noUnnecessaryUrlSearchParamsInstanceGetAllSpreadRule, 'no-unnecessary-url-search-params-instance-get-all-spread')
const adaptedNoUnnecessaryUrlSearchParamsInstanceSetSpread = adaptPluginRule(noUnnecessaryUrlSearchParamsInstanceSetSpreadRule, 'no-unnecessary-url-search-params-instance-set-spread')
const adaptedNoUnnecessaryUrlSearchParamsInstanceAppendSpread = adaptPluginRule(noUnnecessaryUrlSearchParamsInstanceAppendSpreadRule, 'no-unnecessary-url-search-params-instance-append-spread')
const adaptedNoUnnecessaryUrlSearchParamsInstanceDeleteSpread = adaptPluginRule(noUnnecessaryUrlSearchParamsInstanceDeleteSpreadRule, 'no-unnecessary-url-search-params-instance-delete-spread')
const adaptedNoUnnecessaryUrlSearchParamsInstanceHasSpread = adaptPluginRule(noUnnecessaryUrlSearchParamsInstanceHasSpreadRule, 'no-unnecessary-url-search-params-instance-has-spread')
const adaptedNoUnnecessaryUrlSearchParamsInstanceToStringSpread = adaptPluginRule(noUnnecessaryUrlSearchParamsInstanceToStringSpreadRule, 'no-unnecessary-url-search-params-instance-to-string-spread')
const adaptedNoUnnecessaryUrlSearchParamsInstanceEntriesSpread = adaptPluginRule(noUnnecessaryUrlSearchParamsInstanceEntriesSpreadRule, 'no-unnecessary-url-search-params-instance-entries-spread')
const adaptedNoUnnecessaryUrlSearchParamsInstanceKeysSpread = adaptPluginRule(noUnnecessaryUrlSearchParamsInstanceKeysSpreadRule, 'no-unnecessary-url-search-params-instance-keys-spread')
const adaptedNoUnnecessaryUrlSearchParamsInstanceValuesSpread = adaptPluginRule(noUnnecessaryUrlSearchParamsInstanceValuesSpreadRule, 'no-unnecessary-url-search-params-instance-values-spread')
const adaptedNoUnnecessaryUrlSearchParamsInstanceForEachSpread = adaptPluginRule(noUnnecessaryUrlSearchParamsInstanceForEachSpreadRule, 'no-unnecessary-url-search-params-instance-for-each-spread')
const adaptedNoUnnecessaryUrlSearchParamsInstanceSortSpread = adaptPluginRule(noUnnecessaryUrlSearchParamsInstanceSortSpreadRule, 'no-unnecessary-url-search-params-instance-sort-spread')
const adaptedNoUnnecessaryBlobInstanceArrayBufferSpread = adaptPluginRule(noUnnecessaryBlobInstanceArrayBufferSpreadRule, 'no-unnecessary-blob-instance-array-buffer-spread')
const adaptedNoUnnecessaryBlobInstanceTextSpread = adaptPluginRule(noUnnecessaryBlobInstanceTextSpreadRule, 'no-unnecessary-blob-instance-text-spread')
const adaptedNoUnnecessaryBlobInstanceSliceSpread = adaptPluginRule(noUnnecessaryBlobInstanceSliceSpreadRule, 'no-unnecessary-blob-instance-slice-spread')
const adaptedNoUnnecessaryBlobInstanceStreamSpread = adaptPluginRule(noUnnecessaryBlobInstanceStreamSpreadRule, 'no-unnecessary-blob-instance-stream-spread')
const adaptedNoUnnecessaryFileInstanceArrayBufferSpread = adaptPluginRule(noUnnecessaryFileInstanceArrayBufferSpreadRule, 'no-unnecessary-file-instance-array-buffer-spread')
const adaptedNoUnnecessaryFileInstanceTextSpread = adaptPluginRule(noUnnecessaryFileInstanceTextSpreadRule, 'no-unnecessary-file-instance-text-spread')
const adaptedNoUnnecessaryFileInstanceSliceSpread = adaptPluginRule(noUnnecessaryFileInstanceSliceSpreadRule, 'no-unnecessary-file-instance-slice-spread')
const adaptedNoUnnecessaryFileInstanceStreamSpread = adaptPluginRule(noUnnecessaryFileInstanceStreamSpreadRule, 'no-unnecessary-file-instance-stream-spread')
const adaptedNoUnnecessaryAbortSignalThrowIfAbortedSpread = adaptPluginRule(noUnnecessaryAbortSignalThrowIfAbortedSpreadRule, 'no-unnecessary-abort-signal-throw-if-aborted-spread')
const adaptedNoUnnecessaryBroadcastChannelInstancePostMessageSpread = adaptPluginRule(noUnnecessaryBroadcastChannelInstancePostMessageSpreadRule, 'no-unnecessary-broadcast-channel-instance-post-message-spread')
const adaptedNoUnnecessaryBroadcastChannelInstanceCloseSpread = adaptPluginRule(noUnnecessaryBroadcastChannelInstanceCloseSpreadRule, 'no-unnecessary-broadcast-channel-instance-close-spread')
const adaptedNoUnnecessaryMessagePortPostMessageSpread = adaptPluginRule(noUnnecessaryMessagePortPostMessageSpreadRule, 'no-unnecessary-message-port-post-message-spread')
const adaptedNoUnnecessaryMessagePortCloseSpread = adaptPluginRule(noUnnecessaryMessagePortCloseSpreadRule, 'no-unnecessary-message-port-close-spread')
const adaptedNoUnnecessaryMessagePortStartSpread = adaptPluginRule(noUnnecessaryMessagePortStartSpreadRule, 'no-unnecessary-message-port-start-spread')
const adaptedNoUnnecessaryWorkerInstancePostMessageSpread = adaptPluginRule(noUnnecessaryWorkerInstancePostMessageSpreadRule, 'no-unnecessary-worker-instance-post-message-spread')
const adaptedNoUnnecessaryWorkerInstanceTerminateSpread = adaptPluginRule(noUnnecessaryWorkerInstanceTerminateSpreadRule, 'no-unnecessary-worker-instance-terminate-spread')
const adaptedNoUnnecessaryFileReaderInstanceReadAsArrayBufferSpread = adaptPluginRule(noUnnecessaryFileReaderInstanceReadAsArrayBufferSpreadRule, 'no-unnecessary-file-reader-instance-read-as-array-buffer-spread')
const adaptedNoUnnecessaryFileReaderInstanceReadAsBinaryStringSpread = adaptPluginRule(noUnnecessaryFileReaderInstanceReadAsBinaryStringSpreadRule, 'no-unnecessary-file-reader-instance-read-as-binary-string-spread')
const adaptedNoUnnecessaryFileReaderInstanceReadAsDataUrlSpread = adaptPluginRule(noUnnecessaryFileReaderInstanceReadAsDataUrlSpreadRule, 'no-unnecessary-file-reader-instance-read-as-data-url-spread')
const adaptedNoUnnecessaryFileReaderInstanceReadAsTextSpread = adaptPluginRule(noUnnecessaryFileReaderInstanceReadAsTextSpreadRule, 'no-unnecessary-file-reader-instance-read-as-text-spread')
const adaptedNoUnnecessaryFileReaderInstanceAbortSpread = adaptPluginRule(noUnnecessaryFileReaderInstanceAbortSpreadRule, 'no-unnecessary-file-reader-instance-abort-spread')
const adaptedNoUnnecessaryReadableStreamReadSpread = adaptPluginRule(noUnnecessaryReadableStreamReadSpreadRule, 'no-unnecessary-readable-stream-read-spread')
const adaptedNoUnnecessaryReadableStreamPipeSpread = adaptPluginRule(noUnnecessaryReadableStreamPipeSpreadRule, 'no-unnecessary-readable-stream-pipe-spread')
const adaptedNoUnnecessaryReadableStreamUnpipeSpread = adaptPluginRule(noUnnecessaryReadableStreamUnpipeSpreadRule, 'no-unnecessary-readable-stream-unpipe-spread')
const adaptedNoUnnecessaryReadableStreamPauseSpread = adaptPluginRule(noUnnecessaryReadableStreamPauseSpreadRule, 'no-unnecessary-readable-stream-pause-spread')
const adaptedNoUnnecessaryReadableStreamResumeSpread = adaptPluginRule(noUnnecessaryReadableStreamResumeSpreadRule, 'no-unnecessary-readable-stream-resume-spread')
const adaptedNoUnnecessaryReadableStreamDestroySpread = adaptPluginRule(noUnnecessaryReadableStreamDestroySpreadRule, 'no-unnecessary-readable-stream-destroy-spread')
const adaptedNoUnnecessaryReadableStreamPushSpread = adaptPluginRule(noUnnecessaryReadableStreamPushSpreadRule, 'no-unnecessary-readable-stream-push-spread')
const adaptedNoUnnecessaryWritableStreamWriteSpread = adaptPluginRule(noUnnecessaryWritableStreamWriteSpreadRule, 'no-unnecessary-writable-stream-write-spread')
const adaptedNoUnnecessaryWritableStreamEndSpread = adaptPluginRule(noUnnecessaryWritableStreamEndSpreadRule, 'no-unnecessary-writable-stream-end-spread')
const adaptedNoUnnecessaryWritableStreamDestroySpread = adaptPluginRule(noUnnecessaryWritableStreamDestroySpreadRule, 'no-unnecessary-writable-stream-destroy-spread')
const adaptedNoUnnecessaryTransformStreamTransformSpread = adaptPluginRule(noUnnecessaryTransformStreamTransformSpreadRule, 'no-unnecessary-transform-stream-transform-spread')
const adaptedNoUnnecessaryTransformStreamFlushSpread = adaptPluginRule(noUnnecessaryTransformStreamFlushSpreadRule, 'no-unnecessary-transform-stream-flush-spread')
const adaptedNoUnnecessaryEventEmitterAddListenerSpread = adaptPluginRule(noUnnecessaryEventEmitterAddListenerSpreadRule, 'no-unnecessary-event-emitter-add-listener-spread')
const adaptedNoUnnecessaryChildProcessInstanceKillSpread = adaptPluginRule(noUnnecessaryChildProcessInstanceKillSpreadRule, 'no-unnecessary-child-process-instance-kill-spread')
const adaptedNoUnnecessaryChildProcessInstanceSendSpread = adaptPluginRule(noUnnecessaryChildProcessInstanceSendSpreadRule, 'no-unnecessary-child-process-instance-send-spread')
const adaptedNoUnnecessaryChildProcessInstanceDisconnectSpread = adaptPluginRule(noUnnecessaryChildProcessInstanceDisconnectSpreadRule, 'no-unnecessary-child-process-instance-disconnect-spread')
const adaptedNoUnnecessaryChildProcessInstanceRefSpread = adaptPluginRule(noUnnecessaryChildProcessInstanceRefSpreadRule, 'no-unnecessary-child-process-instance-ref-spread')
const adaptedNoUnnecessaryChildProcessInstanceUnrefSpread = adaptPluginRule(noUnnecessaryChildProcessInstanceUnrefSpreadRule, 'no-unnecessary-child-process-instance-unref-spread')
const adaptedNoUnnecessaryObserverInstanceObserveSpread = adaptPluginRule(noUnnecessaryObserverInstanceObserveSpreadRule, 'no-unnecessary-observer-instance-observe-spread')
const adaptedNoUnnecessaryObserverInstanceUnobserveSpread = adaptPluginRule(noUnnecessaryObserverInstanceUnobserveSpreadRule, 'no-unnecessary-observer-instance-unobserve-spread')
const adaptedNoUnnecessaryObserverInstanceDisconnectSpread = adaptPluginRule(noUnnecessaryObserverInstanceDisconnectSpreadRule, 'no-unnecessary-observer-instance-disconnect-spread')
const adaptedNoUnnecessaryObserverInstanceTakeRecordsSpread = adaptPluginRule(noUnnecessaryObserverInstanceTakeRecordsSpreadRule, 'no-unnecessary-observer-instance-take-records-spread')
const adaptedNoUnnecessaryTextDecoderInstanceDecodeSpread = adaptPluginRule(noUnnecessaryTextDecoderInstanceDecodeSpreadRule, 'no-unnecessary-text-decoder-instance-decode-spread')
const adaptedNoUnnecessaryTextEncoderInstanceEncodeSpread = adaptPluginRule(noUnnecessaryTextEncoderInstanceEncodeSpreadRule, 'no-unnecessary-text-encoder-instance-encode-spread')
const adaptedNoUnnecessaryTextEncoderInstanceEncodeIntoSpread = adaptPluginRule(noUnnecessaryTextEncoderInstanceEncodeIntoSpreadRule, 'no-unnecessary-text-encoder-instance-encode-into-spread')
const adaptedNoUnnecessaryServerListenSpread = adaptPluginRule(noUnnecessaryServerListenSpreadRule, 'no-unnecessary-server-listen-spread')
const adaptedNoUnnecessaryServerCloseSpread = adaptPluginRule(noUnnecessaryServerCloseSpreadRule, 'no-unnecessary-server-close-spread')
const adaptedNoUnnecessaryServerAddressSpread = adaptPluginRule(noUnnecessaryServerAddressSpreadRule, 'no-unnecessary-server-address-spread')
const adaptedNoUnnecessaryServerGetConnectionsSpread = adaptPluginRule(noUnnecessaryServerGetConnectionsSpreadRule, 'no-unnecessary-server-get-connections-spread')
const adaptedNoUnnecessaryServerRefSpread = adaptPluginRule(noUnnecessaryServerRefSpreadRule, 'no-unnecessary-server-ref-spread')
const adaptedNoUnnecessaryServerUnrefSpread = adaptPluginRule(noUnnecessaryServerUnrefSpreadRule, 'no-unnecessary-server-unref-spread')
const adaptedNoUnnecessarySocketWriteSpread = adaptPluginRule(noUnnecessarySocketWriteSpreadRule, 'no-unnecessary-socket-write-spread')
const adaptedNoUnnecessarySocketConnectSpread = adaptPluginRule(noUnnecessarySocketConnectSpreadRule, 'no-unnecessary-socket-connect-spread')
const adaptedNoUnnecessarySocketEndSpread = adaptPluginRule(noUnnecessarySocketEndSpreadRule, 'no-unnecessary-socket-end-spread')
const adaptedNoUnnecessarySocketDestroySpread = adaptPluginRule(noUnnecessarySocketDestroySpreadRule, 'no-unnecessary-socket-destroy-spread')
const adaptedNoUnnecessarySocketPauseSpread = adaptPluginRule(noUnnecessarySocketPauseSpreadRule, 'no-unnecessary-socket-pause-spread')
const adaptedNoUnnecessarySocketResumeSpread = adaptPluginRule(noUnnecessarySocketResumeSpreadRule, 'no-unnecessary-socket-resume-spread')
const adaptedNoUnnecessarySocketSetTimeoutSpread = adaptPluginRule(noUnnecessarySocketSetTimeoutSpreadRule, 'no-unnecessary-socket-set-timeout-spread')
const adaptedNoUnnecessarySocketSetEncodingSpread = adaptPluginRule(noUnnecessarySocketSetEncodingSpreadRule, 'no-unnecessary-socket-set-encoding-spread')
const adaptedNoUnnecessarySocketSetKeepAliveSpread = adaptPluginRule(noUnnecessarySocketSetKeepAliveSpreadRule, 'no-unnecessary-socket-set-keep-alive-spread')
const adaptedNoUnnecessarySocketSetNoDelaySpread = adaptPluginRule(noUnnecessarySocketSetNoDelaySpreadRule, 'no-unnecessary-socket-set-no-delay-spread')
const adaptedNoUnnecessarySocketRefSpread = adaptPluginRule(noUnnecessarySocketRefSpreadRule, 'no-unnecessary-socket-ref-spread')
const adaptedNoUnnecessarySocketUnrefSpread = adaptPluginRule(noUnnecessarySocketUnrefSpreadRule, 'no-unnecessary-socket-unref-spread')
const adaptedNoUnnecessaryDataviewSetFloat32Spread = adaptPluginRule(noUnnecessaryDataviewSetFloat32SpreadRule, 'no-unnecessary-dataview-set-float32-spread')
const adaptedNoUnnecessaryDataviewSetFloat64Spread = adaptPluginRule(noUnnecessaryDataviewSetFloat64SpreadRule, 'no-unnecessary-dataview-set-float64-spread')
const adaptedNoUnnecessaryDataviewSetInt16Spread = adaptPluginRule(noUnnecessaryDataviewSetInt16SpreadRule, 'no-unnecessary-dataview-set-int16-spread')
const adaptedNoUnnecessaryDataviewSetInt32Spread = adaptPluginRule(noUnnecessaryDataviewSetInt32SpreadRule, 'no-unnecessary-dataview-set-int32-spread')
const adaptedNoUnnecessaryDataviewSetInt8Spread = adaptPluginRule(noUnnecessaryDataviewSetInt8SpreadRule, 'no-unnecessary-dataview-set-int8-spread')
const adaptedNoUnnecessaryDataviewSetUint16Spread = adaptPluginRule(noUnnecessaryDataviewSetUint16SpreadRule, 'no-unnecessary-dataview-set-uint16-spread')
const adaptedNoUnnecessaryDataviewSetUint32Spread = adaptPluginRule(noUnnecessaryDataviewSetUint32SpreadRule, 'no-unnecessary-dataview-set-uint32-spread')
const adaptedNoUnnecessaryDataviewSetUint8Spread = adaptPluginRule(noUnnecessaryDataviewSetUint8SpreadRule, 'no-unnecessary-dataview-set-uint8-spread')
const adaptedNoUnnecessaryArrayBufferInstanceResizeSpread = adaptPluginRule(noUnnecessaryArrayBufferInstanceResizeSpreadRule, 'no-unnecessary-array-buffer-instance-resize-spread')
const adaptedNoUnnecessaryArrayBufferInstanceSliceSpread = adaptPluginRule(noUnnecessaryArrayBufferInstanceSliceSpreadRule, 'no-unnecessary-array-buffer-instance-slice-spread')
const adaptedNoUnnecessaryArrayBufferInstanceTransferSpread = adaptPluginRule(noUnnecessaryArrayBufferInstanceTransferSpreadRule, 'no-unnecessary-array-buffer-instance-transfer-spread')
const adaptedNoUnnecessaryArrayFromAsyncSpread = adaptPluginRule(noUnnecessaryArrayFromAsyncSpreadRule, 'no-unnecessary-array-from-async-spread')
const adaptedNoUnnecessaryBigIntInstanceToLocaleStringSpread = adaptPluginRule(noUnnecessaryBigIntInstanceToLocaleStringSpreadRule, 'no-unnecessary-big-int-instance-to-locale-string-spread')
const adaptedNoUnnecessaryBigIntInstanceToStringSpread = adaptPluginRule(noUnnecessaryBigIntInstanceToStringSpreadRule, 'no-unnecessary-big-int-instance-to-string-spread')
const adaptedNoUnnecessaryBigIntInstanceValueOfSpread = adaptPluginRule(noUnnecessaryBigIntInstanceValueOfSpreadRule, 'no-unnecessary-big-int-instance-value-of-spread')
const adaptedNoUnnecessaryBooleanInstanceToStringSpread = adaptPluginRule(noUnnecessaryBooleanInstanceToStringSpreadRule, 'no-unnecessary-boolean-instance-to-string-spread')
const adaptedNoUnnecessaryBooleanInstanceValueOfSpread = adaptPluginRule(noUnnecessaryBooleanInstanceValueOfSpreadRule, 'no-unnecessary-boolean-instance-value-of-spread')
const adaptedNoUnnecessaryCanvasGetContextSpread = adaptPluginRule(noUnnecessaryCanvasGetContextSpreadRule, 'no-unnecessary-canvas-get-context-spread')
const adaptedNoUnnecessaryCryptoCipherInstanceFinalSpread = adaptPluginRule(noUnnecessaryCryptoCipherInstanceFinalSpreadRule, 'no-unnecessary-crypto-cipher-instance-final-spread')
const adaptedNoUnnecessaryCryptoCipherInstanceUpdateSpread = adaptPluginRule(noUnnecessaryCryptoCipherInstanceUpdateSpreadRule, 'no-unnecessary-crypto-cipher-instance-update-spread')
const adaptedNoUnnecessaryCryptoCreateHashInstanceDigestSpread = adaptPluginRule(noUnnecessaryCryptoCreateHashInstanceDigestSpreadRule, 'no-unnecessary-crypto-create-hash-instance-digest-spread')
const adaptedNoUnnecessaryCryptoCreateHashInstanceUpdateSpread = adaptPluginRule(noUnnecessaryCryptoCreateHashInstanceUpdateSpreadRule, 'no-unnecessary-crypto-create-hash-instance-update-spread')
const adaptedNoUnnecessaryCryptoDecipherInstanceFinalSpread = adaptPluginRule(noUnnecessaryCryptoDecipherInstanceFinalSpreadRule, 'no-unnecessary-crypto-decipher-instance-final-spread')
const adaptedNoUnnecessaryCryptoDecipherInstanceUpdateSpread = adaptPluginRule(noUnnecessaryCryptoDecipherInstanceUpdateSpreadRule, 'no-unnecessary-crypto-decipher-instance-update-spread')
const adaptedNoUnnecessaryCryptoHmacInstanceDigestSpread = adaptPluginRule(noUnnecessaryCryptoHmacInstanceDigestSpreadRule, 'no-unnecessary-crypto-hmac-instance-digest-spread')
const adaptedNoUnnecessaryCryptoHmacInstanceUpdateSpread = adaptPluginRule(noUnnecessaryCryptoHmacInstanceUpdateSpreadRule, 'no-unnecessary-crypto-hmac-instance-update-spread')
const adaptedNoUnnecessaryCryptoSignInstanceSignSpread = adaptPluginRule(noUnnecessaryCryptoSignInstanceSignSpreadRule, 'no-unnecessary-crypto-sign-instance-sign-spread')
const adaptedNoUnnecessaryCryptoSignInstanceUpdateSpread = adaptPluginRule(noUnnecessaryCryptoSignInstanceUpdateSpreadRule, 'no-unnecessary-crypto-sign-instance-update-spread')
const adaptedNoUnnecessaryCryptoVerifyInstanceUpdateSpread = adaptPluginRule(noUnnecessaryCryptoVerifyInstanceUpdateSpreadRule, 'no-unnecessary-crypto-verify-instance-update-spread')
const adaptedNoUnnecessaryCryptoVerifyInstanceVerifySpread = adaptPluginRule(noUnnecessaryCryptoVerifyInstanceVerifySpreadRule, 'no-unnecessary-crypto-verify-instance-verify-spread')
const adaptedNoUnnecessaryCtxArcSpread = adaptPluginRule(noUnnecessaryCtxArcSpreadRule, 'no-unnecessary-ctx-arc-spread')
const adaptedNoUnnecessaryCtxArcToSpread = adaptPluginRule(noUnnecessaryCtxArcToSpreadRule, 'no-unnecessary-ctx-arc-to-spread')
const adaptedNoUnnecessaryCtxBeginPathSpread = adaptPluginRule(noUnnecessaryCtxBeginPathSpreadRule, 'no-unnecessary-ctx-begin-path-spread')
const adaptedNoUnnecessaryCtxBezierCurveToSpread = adaptPluginRule(noUnnecessaryCtxBezierCurveToSpreadRule, 'no-unnecessary-ctx-bezier-curve-to-spread')
const adaptedNoUnnecessaryCtxClearRectSpread = adaptPluginRule(noUnnecessaryCtxClearRectSpreadRule, 'no-unnecessary-ctx-clear-rect-spread')
const adaptedNoUnnecessaryCtxClipSpread = adaptPluginRule(noUnnecessaryCtxClipSpreadRule, 'no-unnecessary-ctx-clip-spread')
const adaptedNoUnnecessaryCtxClosePathSpread = adaptPluginRule(noUnnecessaryCtxClosePathSpreadRule, 'no-unnecessary-ctx-close-path-spread')
const adaptedNoUnnecessaryCtxCreateLinearGradientSpread = adaptPluginRule(noUnnecessaryCtxCreateLinearGradientSpreadRule, 'no-unnecessary-ctx-create-linear-gradient-spread')
const adaptedNoUnnecessaryCtxCreatePatternSpread = adaptPluginRule(noUnnecessaryCtxCreatePatternSpreadRule, 'no-unnecessary-ctx-create-pattern-spread')
const adaptedNoUnnecessaryCtxCreateRadialGradientSpread = adaptPluginRule(noUnnecessaryCtxCreateRadialGradientSpreadRule, 'no-unnecessary-ctx-create-radial-gradient-spread')
const adaptedNoUnnecessaryCtxDrawImageSpread = adaptPluginRule(noUnnecessaryCtxDrawImageSpreadRule, 'no-unnecessary-ctx-draw-image-spread')
const adaptedNoUnnecessaryCtxFillRectSpread = adaptPluginRule(noUnnecessaryCtxFillRectSpreadRule, 'no-unnecessary-ctx-fill-rect-spread')
const adaptedNoUnnecessaryCtxFillSpread = adaptPluginRule(noUnnecessaryCtxFillSpreadRule, 'no-unnecessary-ctx-fill-spread')
const adaptedNoUnnecessaryCtxFillTextSpread = adaptPluginRule(noUnnecessaryCtxFillTextSpreadRule, 'no-unnecessary-ctx-fill-text-spread')
const adaptedNoUnnecessaryCtxGetImageDataSpread = adaptPluginRule(noUnnecessaryCtxGetImageDataSpreadRule, 'no-unnecessary-ctx-get-image-data-spread')
const adaptedNoUnnecessaryCtxGetLineDashSpread = adaptPluginRule(noUnnecessaryCtxGetLineDashSpreadRule, 'no-unnecessary-ctx-get-line-dash-spread')
const adaptedNoUnnecessaryCtxLineToSpread = adaptPluginRule(noUnnecessaryCtxLineToSpreadRule, 'no-unnecessary-ctx-line-to-spread')
const adaptedNoUnnecessaryCtxMeasureTextSpread = adaptPluginRule(noUnnecessaryCtxMeasureTextSpreadRule, 'no-unnecessary-ctx-measure-text-spread')
const adaptedNoUnnecessaryCtxMoveToSpread = adaptPluginRule(noUnnecessaryCtxMoveToSpreadRule, 'no-unnecessary-ctx-move-to-spread')
const adaptedNoUnnecessaryCtxPutImageDataSpread = adaptPluginRule(noUnnecessaryCtxPutImageDataSpreadRule, 'no-unnecessary-ctx-put-image-data-spread')
const adaptedNoUnnecessaryCtxQuadraticCurveToSpread = adaptPluginRule(noUnnecessaryCtxQuadraticCurveToSpreadRule, 'no-unnecessary-ctx-quadratic-curve-to-spread')
const adaptedNoUnnecessaryCtxResetTransformSpread = adaptPluginRule(noUnnecessaryCtxResetTransformSpreadRule, 'no-unnecessary-ctx-reset-transform-spread')
const adaptedNoUnnecessaryCtxRestoreSpread = adaptPluginRule(noUnnecessaryCtxRestoreSpreadRule, 'no-unnecessary-ctx-restore-spread')
const adaptedNoUnnecessaryCtxRotateSpread = adaptPluginRule(noUnnecessaryCtxRotateSpreadRule, 'no-unnecessary-ctx-rotate-spread')
const adaptedNoUnnecessaryCtxSaveSpread = adaptPluginRule(noUnnecessaryCtxSaveSpreadRule, 'no-unnecessary-ctx-save-spread')
const adaptedNoUnnecessaryCtxScaleSpread = adaptPluginRule(noUnnecessaryCtxScaleSpreadRule, 'no-unnecessary-ctx-scale-spread')
const adaptedNoUnnecessaryCtxSetLineDashSpread = adaptPluginRule(noUnnecessaryCtxSetLineDashSpreadRule, 'no-unnecessary-ctx-set-line-dash-spread')
const adaptedNoUnnecessaryCtxSetTransformSpread = adaptPluginRule(noUnnecessaryCtxSetTransformSpreadRule, 'no-unnecessary-ctx-set-transform-spread')
const adaptedNoUnnecessaryCtxStrokeRectSpread = adaptPluginRule(noUnnecessaryCtxStrokeRectSpreadRule, 'no-unnecessary-ctx-stroke-rect-spread')
const adaptedNoUnnecessaryCtxStrokeSpread = adaptPluginRule(noUnnecessaryCtxStrokeSpreadRule, 'no-unnecessary-ctx-stroke-spread')
const adaptedNoUnnecessaryCtxStrokeTextSpread = adaptPluginRule(noUnnecessaryCtxStrokeTextSpreadRule, 'no-unnecessary-ctx-stroke-text-spread')
const adaptedNoUnnecessaryCtxTransformSpread = adaptPluginRule(noUnnecessaryCtxTransformSpreadRule, 'no-unnecessary-ctx-transform-spread')
const adaptedNoUnnecessaryCtxTranslateSpread = adaptPluginRule(noUnnecessaryCtxTranslateSpreadRule, 'no-unnecessary-ctx-translate-spread')
const adaptedNoUnnecessaryDataviewInstanceGetBigInt64Spread = adaptPluginRule(noUnnecessaryDataviewInstanceGetBigInt64SpreadRule, 'no-unnecessary-dataview-instance-get-big-int64-spread')
const adaptedNoUnnecessaryDataviewInstanceGetBigUint64Spread = adaptPluginRule(noUnnecessaryDataviewInstanceGetBigUint64SpreadRule, 'no-unnecessary-dataview-instance-get-big-uint64-spread')
const adaptedNoUnnecessaryDataviewInstanceGetFloat32Spread = adaptPluginRule(noUnnecessaryDataviewInstanceGetFloat32SpreadRule, 'no-unnecessary-dataview-instance-get-float32-spread')
const adaptedNoUnnecessaryDataviewInstanceGetFloat64Spread = adaptPluginRule(noUnnecessaryDataviewInstanceGetFloat64SpreadRule, 'no-unnecessary-dataview-instance-get-float64-spread')
const adaptedNoUnnecessaryDataviewInstanceGetInt16Spread = adaptPluginRule(noUnnecessaryDataviewInstanceGetInt16SpreadRule, 'no-unnecessary-dataview-instance-get-int16-spread')
const adaptedNoUnnecessaryDataviewInstanceGetInt32Spread = adaptPluginRule(noUnnecessaryDataviewInstanceGetInt32SpreadRule, 'no-unnecessary-dataview-instance-get-int32-spread')
const adaptedNoUnnecessaryDataviewInstanceGetInt8Spread = adaptPluginRule(noUnnecessaryDataviewInstanceGetInt8SpreadRule, 'no-unnecessary-dataview-instance-get-int8-spread')
const adaptedNoUnnecessaryDataviewInstanceGetUint16Spread = adaptPluginRule(noUnnecessaryDataviewInstanceGetUint16SpreadRule, 'no-unnecessary-dataview-instance-get-uint16-spread')
const adaptedNoUnnecessaryDataviewInstanceGetUint32Spread = adaptPluginRule(noUnnecessaryDataviewInstanceGetUint32SpreadRule, 'no-unnecessary-dataview-instance-get-uint32-spread')
const adaptedNoUnnecessaryDataviewInstanceGetUint8Spread = adaptPluginRule(noUnnecessaryDataviewInstanceGetUint8SpreadRule, 'no-unnecessary-dataview-instance-get-uint8-spread')
const adaptedNoUnnecessaryDataviewInstanceSetBigInt64Spread = adaptPluginRule(noUnnecessaryDataviewInstanceSetBigInt64SpreadRule, 'no-unnecessary-dataview-instance-set-big-int64-spread')
const adaptedNoUnnecessaryDataviewInstanceSetBigUint64Spread = adaptPluginRule(noUnnecessaryDataviewInstanceSetBigUint64SpreadRule, 'no-unnecessary-dataview-instance-set-big-uint64-spread')
const adaptedNoUnnecessaryDataviewInstanceSetFloat32Spread = adaptPluginRule(noUnnecessaryDataviewInstanceSetFloat32SpreadRule, 'no-unnecessary-dataview-instance-set-float32-spread')
const adaptedNoUnnecessaryDataviewInstanceSetFloat64Spread = adaptPluginRule(noUnnecessaryDataviewInstanceSetFloat64SpreadRule, 'no-unnecessary-dataview-instance-set-float64-spread')
const adaptedNoUnnecessaryDataviewInstanceSetInt16Spread = adaptPluginRule(noUnnecessaryDataviewInstanceSetInt16SpreadRule, 'no-unnecessary-dataview-instance-set-int16-spread')
const adaptedNoUnnecessaryDataviewInstanceSetInt32Spread = adaptPluginRule(noUnnecessaryDataviewInstanceSetInt32SpreadRule, 'no-unnecessary-dataview-instance-set-int32-spread')
const adaptedNoUnnecessaryDataviewInstanceSetInt8Spread = adaptPluginRule(noUnnecessaryDataviewInstanceSetInt8SpreadRule, 'no-unnecessary-dataview-instance-set-int8-spread')
const adaptedNoUnnecessaryDataviewInstanceSetUint16Spread = adaptPluginRule(noUnnecessaryDataviewInstanceSetUint16SpreadRule, 'no-unnecessary-dataview-instance-set-uint16-spread')
const adaptedNoUnnecessaryDataviewInstanceSetUint32Spread = adaptPluginRule(noUnnecessaryDataviewInstanceSetUint32SpreadRule, 'no-unnecessary-dataview-instance-set-uint32-spread')
const adaptedNoUnnecessaryDataviewInstanceSetUint8Spread = adaptPluginRule(noUnnecessaryDataviewInstanceSetUint8SpreadRule, 'no-unnecessary-dataview-instance-set-uint8-spread')
const adaptedNoUnnecessaryDateInstanceGetTimeSpread = adaptPluginRule(noUnnecessaryDateInstanceGetTimeSpreadRule, 'no-unnecessary-date-instance-get-time-spread')
const adaptedNoUnnecessaryDateInstanceSetTimeSpread = adaptPluginRule(noUnnecessaryDateInstanceSetTimeSpreadRule, 'no-unnecessary-date-instance-set-time-spread')
const adaptedNoUnnecessaryDateInstanceToJsonSpread = adaptPluginRule(noUnnecessaryDateInstanceToJsonSpreadRule, 'no-unnecessary-date-instance-to-json-spread')
const adaptedNoUnnecessaryDateInstanceValueOfSpread = adaptPluginRule(noUnnecessaryDateInstanceValueOfSpreadRule, 'no-unnecessary-date-instance-value-of-spread')
const adaptedNoUnnecessaryDnsGetServersSpread = adaptPluginRule(noUnnecessaryDnsGetServersSpreadRule, 'no-unnecessary-dns-get-servers-spread')
const adaptedNoUnnecessaryDnsLookupSpread = adaptPluginRule(noUnnecessaryDnsLookupSpreadRule, 'no-unnecessary-dns-lookup-spread')
const adaptedNoUnnecessaryDnsResolve4Spread = adaptPluginRule(noUnnecessaryDnsResolve4SpreadRule, 'no-unnecessary-dns-resolve-4-spread')
const adaptedNoUnnecessaryDnsResolve6Spread = adaptPluginRule(noUnnecessaryDnsResolve6SpreadRule, 'no-unnecessary-dns-resolve-6-spread')
const adaptedNoUnnecessaryDnsResolveAnySpread = adaptPluginRule(noUnnecessaryDnsResolveAnySpreadRule, 'no-unnecessary-dns-resolve-any-spread')
const adaptedNoUnnecessaryDnsResolveCnameSpread = adaptPluginRule(noUnnecessaryDnsResolveCnameSpreadRule, 'no-unnecessary-dns-resolve-cname-spread')
const adaptedNoUnnecessaryDnsResolveMxSpread = adaptPluginRule(noUnnecessaryDnsResolveMxSpreadRule, 'no-unnecessary-dns-resolve-mx-spread')
const adaptedNoUnnecessaryDnsResolveNsSpread = adaptPluginRule(noUnnecessaryDnsResolveNsSpreadRule, 'no-unnecessary-dns-resolve-ns-spread')
const adaptedNoUnnecessaryDnsResolvePtrSpread = adaptPluginRule(noUnnecessaryDnsResolvePtrSpreadRule, 'no-unnecessary-dns-resolve-ptr-spread')
const adaptedNoUnnecessaryDnsResolveSpread = adaptPluginRule(noUnnecessaryDnsResolveSpreadRule, 'no-unnecessary-dns-resolve-spread')
const adaptedNoUnnecessaryDnsResolveSrvSpread = adaptPluginRule(noUnnecessaryDnsResolveSrvSpreadRule, 'no-unnecessary-dns-resolve-srv-spread')
const adaptedNoUnnecessaryDnsResolveTxtSpread = adaptPluginRule(noUnnecessaryDnsResolveTxtSpreadRule, 'no-unnecessary-dns-resolve-txt-spread')
const adaptedNoUnnecessaryDnsReverseSpread = adaptPluginRule(noUnnecessaryDnsReverseSpreadRule, 'no-unnecessary-dns-reverse-spread')
const adaptedNoUnnecessaryDnsSetServersSpread = adaptPluginRule(noUnnecessaryDnsSetServersSpreadRule, 'no-unnecessary-dns-set-servers-spread')
const adaptedNoUnnecessaryErrorInstanceToStringSpread = adaptPluginRule(noUnnecessaryErrorInstanceToStringSpreadRule, 'no-unnecessary-error-instance-to-string-spread')
const adaptedNoUnnecessaryFinalizationRegistryInstanceRegisterSpread = adaptPluginRule(noUnnecessaryFinalizationRegistryInstanceRegisterSpreadRule, 'no-unnecessary-finalization-registry-instance-register-spread')
const adaptedNoUnnecessaryFinalizationRegistryInstanceUnregisterSpread = adaptPluginRule(noUnnecessaryFinalizationRegistryInstanceUnregisterSpreadRule, 'no-unnecessary-finalization-registry-instance-unregister-spread')
const adaptedNoUnnecessaryGlAttachShaderSpread = adaptPluginRule(noUnnecessaryGlAttachShaderSpreadRule, 'no-unnecessary-gl-attach-shader-spread')
const adaptedNoUnnecessaryGlBindBufferSpread = adaptPluginRule(noUnnecessaryGlBindBufferSpreadRule, 'no-unnecessary-gl-bind-buffer-spread')
const adaptedNoUnnecessaryGlBlendFuncSpread = adaptPluginRule(noUnnecessaryGlBlendFuncSpreadRule, 'no-unnecessary-gl-blend-func-spread')
const adaptedNoUnnecessaryGlBufferDataSpread = adaptPluginRule(noUnnecessaryGlBufferDataSpreadRule, 'no-unnecessary-gl-buffer-data-spread')
const adaptedNoUnnecessaryGlClearColorSpread = adaptPluginRule(noUnnecessaryGlClearColorSpreadRule, 'no-unnecessary-gl-clear-color-spread')
const adaptedNoUnnecessaryGlClearSpread = adaptPluginRule(noUnnecessaryGlClearSpreadRule, 'no-unnecessary-gl-clear-spread')
const adaptedNoUnnecessaryGlCompileShaderSpread = adaptPluginRule(noUnnecessaryGlCompileShaderSpreadRule, 'no-unnecessary-gl-compile-shader-spread')
const adaptedNoUnnecessaryGlCreateBufferSpread = adaptPluginRule(noUnnecessaryGlCreateBufferSpreadRule, 'no-unnecessary-gl-create-buffer-spread')
const adaptedNoUnnecessaryGlCreateProgramSpread = adaptPluginRule(noUnnecessaryGlCreateProgramSpreadRule, 'no-unnecessary-gl-create-program-spread')
const adaptedNoUnnecessaryGlCreateShaderSpread = adaptPluginRule(noUnnecessaryGlCreateShaderSpreadRule, 'no-unnecessary-gl-create-shader-spread')
const adaptedNoUnnecessaryGlDepthFuncSpread = adaptPluginRule(noUnnecessaryGlDepthFuncSpreadRule, 'no-unnecessary-gl-depth-func-spread')
const adaptedNoUnnecessaryGlDisableSpread = adaptPluginRule(noUnnecessaryGlDisableSpreadRule, 'no-unnecessary-gl-disable-spread')
const adaptedNoUnnecessaryGlDrawArraysSpread = adaptPluginRule(noUnnecessaryGlDrawArraysSpreadRule, 'no-unnecessary-gl-draw-arrays-spread')
const adaptedNoUnnecessaryGlDrawElementsSpread = adaptPluginRule(noUnnecessaryGlDrawElementsSpreadRule, 'no-unnecessary-gl-draw-elements-spread')
const adaptedNoUnnecessaryGlEnableSpread = adaptPluginRule(noUnnecessaryGlEnableSpreadRule, 'no-unnecessary-gl-enable-spread')
const adaptedNoUnnecessaryGlEnableVertexAttribArraySpread = adaptPluginRule(noUnnecessaryGlEnableVertexAttribArraySpreadRule, 'no-unnecessary-gl-enable-vertex-attrib-array-spread')
const adaptedNoUnnecessaryGlGetAttribLocationSpread = adaptPluginRule(noUnnecessaryGlGetAttribLocationSpreadRule, 'no-unnecessary-gl-get-attrib-location-spread')
const adaptedNoUnnecessaryGlGetUniformLocationSpread = adaptPluginRule(noUnnecessaryGlGetUniformLocationSpreadRule, 'no-unnecessary-gl-get-uniform-location-spread')
const adaptedNoUnnecessaryGlLinkProgramSpread = adaptPluginRule(noUnnecessaryGlLinkProgramSpreadRule, 'no-unnecessary-gl-link-program-spread')
const adaptedNoUnnecessaryGlShaderSourceSpread = adaptPluginRule(noUnnecessaryGlShaderSourceSpreadRule, 'no-unnecessary-gl-shader-source-spread')
const adaptedNoUnnecessaryGlUseProgramSpread = adaptPluginRule(noUnnecessaryGlUseProgramSpreadRule, 'no-unnecessary-gl-use-program-spread')
const adaptedNoUnnecessaryGlVertexAttribPointerSpread = adaptPluginRule(noUnnecessaryGlVertexAttribPointerSpreadRule, 'no-unnecessary-gl-vertex-attrib-pointer-spread')
const adaptedNoUnnecessaryGlViewportSpread = adaptPluginRule(noUnnecessaryGlViewportSpreadRule, 'no-unnecessary-gl-viewport-spread')
const adaptedNoUnnecessaryMathClampSpread = adaptPluginRule(noUnnecessaryMathClampSpreadRule, 'no-unnecessary-math-clamp-spread')
const adaptedNoUnnecessaryMathScaleSpread = adaptPluginRule(noUnnecessaryMathScaleSpreadRule, 'no-unnecessary-math-scale-spread')
const adaptedNoUnnecessaryNetConnectSpread = adaptPluginRule(noUnnecessaryNetConnectSpreadRule, 'no-unnecessary-net-connect-spread')
const adaptedNoUnnecessaryNetCreateConnectionSpread = adaptPluginRule(noUnnecessaryNetCreateConnectionSpreadRule, 'no-unnecessary-net-create-connection-spread')
const adaptedNoUnnecessaryNetCreateServerSpread = adaptPluginRule(noUnnecessaryNetCreateServerSpreadRule, 'no-unnecessary-net-create-server-spread')
const adaptedNoUnnecessaryNumberInstanceToExponentialSpread = adaptPluginRule(noUnnecessaryNumberInstanceToExponentialSpreadRule, 'no-unnecessary-number-instance-to-exponential-spread')
const adaptedNoUnnecessaryNumberInstanceToFixedSpread = adaptPluginRule(noUnnecessaryNumberInstanceToFixedSpreadRule, 'no-unnecessary-number-instance-to-fixed-spread')
const adaptedNoUnnecessaryNumberInstanceToLocaleStringSpread = adaptPluginRule(noUnnecessaryNumberInstanceToLocaleStringSpreadRule, 'no-unnecessary-number-instance-to-locale-string-spread')
const adaptedNoUnnecessaryNumberInstanceToPrecisionSpread = adaptPluginRule(noUnnecessaryNumberInstanceToPrecisionSpreadRule, 'no-unnecessary-number-instance-to-precision-spread')
const adaptedNoUnnecessaryNumberInstanceToStringSpread = adaptPluginRule(noUnnecessaryNumberInstanceToStringSpreadRule, 'no-unnecessary-number-instance-to-string-spread')
const adaptedNoUnnecessaryNumberInstanceValueOfSpread = adaptPluginRule(noUnnecessaryNumberInstanceValueOfSpreadRule, 'no-unnecessary-number-instance-value-of-spread')
const adaptedNoUnnecessaryObjectHasOwnPropertySpread = adaptPluginRule(noUnnecessaryObjectHasOwnPropertySpreadRule, 'no-unnecessary-object-has-own-property-spread')
const adaptedNoUnnecessaryObjectIsPrototypeOfSpread = adaptPluginRule(noUnnecessaryObjectIsPrototypeOfSpreadRule, 'no-unnecessary-object-is-prototype-of-spread')
const adaptedNoUnnecessaryObjectPropertyIsEnumerableSpread = adaptPluginRule(noUnnecessaryObjectPropertyIsEnumerableSpreadRule, 'no-unnecessary-object-property-is-enumerable-spread')
const adaptedNoUnnecessaryObjectToLocaleStringSpread = adaptPluginRule(noUnnecessaryObjectToLocaleStringSpreadRule, 'no-unnecessary-object-to-locale-string-spread')
const adaptedNoUnnecessaryObjectToStringSpread = adaptPluginRule(noUnnecessaryObjectToStringSpreadRule, 'no-unnecessary-object-to-string-spread')
const adaptedNoUnnecessaryObjectValueOfSpread = adaptPluginRule(noUnnecessaryObjectValueOfSpreadRule, 'no-unnecessary-object-value-of-spread')
const adaptedNoUnnecessaryPromiseResolveSpread = adaptPluginRule(noUnnecessaryPromiseResolveSpreadRule, 'no-unnecessary-promise-resolve-spread')
const adaptedNoUnnecessaryPromiseWithResolversSpread = adaptPluginRule(noUnnecessaryPromiseWithResolversSpreadRule, 'no-unnecessary-promise-with-resolvers-spread')
const adaptedNoUnnecessaryReadlineCloseSpread = adaptPluginRule(noUnnecessaryReadlineCloseSpreadRule, 'no-unnecessary-readline-close-spread')
const adaptedNoUnnecessaryReadlineCreateInterfaceSpread = adaptPluginRule(noUnnecessaryReadlineCreateInterfaceSpreadRule, 'no-unnecessary-readline-create-interface-spread')
const adaptedNoUnnecessaryReadlinePromptSpread = adaptPluginRule(noUnnecessaryReadlinePromptSpreadRule, 'no-unnecessary-readline-prompt-spread')
const adaptedNoUnnecessaryReadlineQuestionSpread = adaptPluginRule(noUnnecessaryReadlineQuestionSpreadRule, 'no-unnecessary-readline-question-spread')
const adaptedNoUnnecessaryReadlineWriteSpread = adaptPluginRule(noUnnecessaryReadlineWriteSpreadRule, 'no-unnecessary-readline-write-spread')
const adaptedNoUnnecessaryRegexpInstanceExecSpread = adaptPluginRule(noUnnecessaryRegexpInstanceExecSpreadRule, 'no-unnecessary-regexp-instance-exec-spread')
const adaptedNoUnnecessaryRegexpInstanceTestSpread = adaptPluginRule(noUnnecessaryRegexpInstanceTestSpreadRule, 'no-unnecessary-regexp-instance-test-spread')
const adaptedNoUnnecessaryRegexpInstanceToStringSpread = adaptPluginRule(noUnnecessaryRegexpInstanceToStringSpreadRule, 'no-unnecessary-regexp-instance-to-string-spread')
const adaptedNoUnnecessarySharedArrayBufferInstanceGrowSpread = adaptPluginRule(noUnnecessarySharedArrayBufferInstanceGrowSpreadRule, 'no-unnecessary-shared-array-buffer-instance-grow-spread')
const adaptedNoUnnecessarySharedArrayBufferInstanceSliceSpread = adaptPluginRule(noUnnecessarySharedArrayBufferInstanceSliceSpreadRule, 'no-unnecessary-shared-array-buffer-instance-slice-spread')
const adaptedNoUnnecessaryStderrEndSpread = adaptPluginRule(noUnnecessaryStderrEndSpreadRule, 'no-unnecessary-stderr-end-spread')
const adaptedNoUnnecessaryStderrWriteSpread = adaptPluginRule(noUnnecessaryStderrWriteSpreadRule, 'no-unnecessary-stderr-write-spread')
const adaptedNoUnnecessaryStdinPipeSpread = adaptPluginRule(noUnnecessaryStdinPipeSpreadRule, 'no-unnecessary-stdin-pipe-spread')
const adaptedNoUnnecessaryStdinPushSpread = adaptPluginRule(noUnnecessaryStdinPushSpreadRule, 'no-unnecessary-stdin-push-spread')
const adaptedNoUnnecessaryStdinReadSpread = adaptPluginRule(noUnnecessaryStdinReadSpreadRule, 'no-unnecessary-stdin-read-spread')
const adaptedNoUnnecessaryStdoutEndSpread = adaptPluginRule(noUnnecessaryStdoutEndSpreadRule, 'no-unnecessary-stdout-end-spread')
const adaptedNoUnnecessaryStdoutWriteSpread = adaptPluginRule(noUnnecessaryStdoutWriteSpreadRule, 'no-unnecessary-stdout-write-spread')
const adaptedNoUnnecessarySymbolInstanceDescriptionSpread = adaptPluginRule(noUnnecessarySymbolInstanceDescriptionSpreadRule, 'no-unnecessary-symbol-instance-description-spread')
const adaptedNoUnnecessarySymbolInstanceToStringSpread = adaptPluginRule(noUnnecessarySymbolInstanceToStringSpreadRule, 'no-unnecessary-symbol-instance-to-string-spread')
const adaptedNoUnnecessarySymbolInstanceValueOfSpread = adaptPluginRule(noUnnecessarySymbolInstanceValueOfSpreadRule, 'no-unnecessary-symbol-instance-value-of-spread')
const adaptedNoUnnecessaryWeakRefInstanceDerefSpread = adaptPluginRule(noUnnecessaryWeakRefInstanceDerefSpreadRule, 'no-unnecessary-weak-ref-instance-deref-spread')
const adaptedNoUnnecessaryZlibBrotliCompressSpread = adaptPluginRule(noUnnecessaryZlibBrotliCompressSpreadRule, 'no-unnecessary-zlib-brotli-compress-spread')
const adaptedNoUnnecessaryZlibBrotliCompressSyncSpread = adaptPluginRule(noUnnecessaryZlibBrotliCompressSyncSpreadRule, 'no-unnecessary-zlib-brotli-compress-sync-spread')
const adaptedNoUnnecessaryZlibBrotliDecompressSpread = adaptPluginRule(noUnnecessaryZlibBrotliDecompressSpreadRule, 'no-unnecessary-zlib-brotli-decompress-spread')
const adaptedNoUnnecessaryZlibBrotliDecompressSyncSpread = adaptPluginRule(noUnnecessaryZlibBrotliDecompressSyncSpreadRule, 'no-unnecessary-zlib-brotli-decompress-sync-spread')
const adaptedNoUnnecessaryZlibDeflateSpread = adaptPluginRule(noUnnecessaryZlibDeflateSpreadRule, 'no-unnecessary-zlib-deflate-spread')
const adaptedNoUnnecessaryZlibDeflateSyncSpread = adaptPluginRule(noUnnecessaryZlibDeflateSyncSpreadRule, 'no-unnecessary-zlib-deflate-sync-spread')
const adaptedNoUnnecessaryZlibGunzipSpread = adaptPluginRule(noUnnecessaryZlibGunzipSpreadRule, 'no-unnecessary-zlib-gunzip-spread')
const adaptedNoUnnecessaryZlibGunzipSyncSpread = adaptPluginRule(noUnnecessaryZlibGunzipSyncSpreadRule, 'no-unnecessary-zlib-gunzip-sync-spread')
const adaptedNoUnnecessaryZlibGzipSpread = adaptPluginRule(noUnnecessaryZlibGzipSpreadRule, 'no-unnecessary-zlib-gzip-spread')
const adaptedNoUnnecessaryZlibGzipSyncSpread = adaptPluginRule(noUnnecessaryZlibGzipSyncSpreadRule, 'no-unnecessary-zlib-gzip-sync-spread')
const adaptedNoUnnecessaryZlibInflateSpread = adaptPluginRule(noUnnecessaryZlibInflateSpreadRule, 'no-unnecessary-zlib-inflate-spread')
const adaptedNoUnnecessaryZlibInflateSyncSpread = adaptPluginRule(noUnnecessaryZlibInflateSyncSpreadRule, 'no-unnecessary-zlib-inflate-sync-spread')
const adaptedNoUnnecessaryMathExpm1Spread = adaptPluginRule(noUnnecessaryMathExpm1SpreadRule, 'no-unnecessary-math-expm1-spread')
const adaptedNoUnnecessaryMathLog1pSpread = adaptPluginRule(noUnnecessaryMathLog1pSpreadRule, 'no-unnecessary-math-log1p-spread')
const adaptedNoUnnecessaryMathSinhSpread = adaptPluginRule(noUnnecessaryMathSinhSpreadRule, 'no-unnecessary-math-sinh-spread')
const adaptedNoUnnecessaryMathCoshSpread = adaptPluginRule(noUnnecessaryMathCoshSpreadRule, 'no-unnecessary-math-cosh-spread')
const adaptedNoUnnecessaryMathTanhSpread = adaptPluginRule(noUnnecessaryMathTanhSpreadRule, 'no-unnecessary-math-tanh-spread')
const adaptedNoUnnecessaryFunctionCallSpread = adaptPluginRule(noUnnecessaryFunctionCallSpreadRule, 'no-unnecessary-function-call-spread')
const adaptedNoUnnecessaryFunctionApplySpread = adaptPluginRule(noUnnecessaryFunctionApplySpreadRule, 'no-unnecessary-function-apply-spread')
const adaptedNoUnnecessaryFunctionBindSpread = adaptPluginRule(noUnnecessaryFunctionBindSpreadRule, 'no-unnecessary-function-bind-spread')
const adaptedNoUnnecessaryFunctionToStringSpread = adaptPluginRule(noUnnecessaryFunctionToStringSpreadRule, 'no-unnecessary-function-to-string-spread')
const adaptedNoUnnecessaryDateToGmtStringSpread = adaptPluginRule(noUnnecessaryDateToGmtStringSpreadRule, 'no-unnecessary-date-to-gmt-string-spread')
const adaptedNoUnnecessaryObjectGroupBySpread = adaptPluginRule(noUnnecessaryObjectGroupBySpreadRule, 'no-unnecessary-object-group-by-spread')
const adaptedNoUnnecessaryArrayBufferSliceSpread = adaptPluginRule(noUnnecessaryArrayBufferSliceSpreadRule, 'no-unnecessary-array-buffer-slice-spread')
const adaptedNoUnnecessaryPromiseTrySpread = adaptPluginRule(noUnnecessaryPromiseTrySpreadRule, 'no-unnecessary-promise-try-spread')
const adaptedNoUnnecessaryObjectFromEntriesSpread = adaptPluginRule(noUnnecessaryObjectFromEntriesSpreadRule, 'no-unnecessary-object-from-entries-spread')
const adaptedNoUnnecessaryErrorToStringSpread = adaptPluginRule(noUnnecessaryErrorToStringSpreadRule, 'no-unnecessary-error-to-string-spread')
const adaptedNoUnnecessaryRegexExecSpread = adaptPluginRule(noUnnecessaryRegexExecSpreadRule, 'no-unnecessary-regex-exec-spread')
const adaptedNoUnnecessaryRegexTestSpread = adaptPluginRule(noUnnecessaryRegexTestSpreadRule, 'no-unnecessary-regex-test-spread')
const adaptedNoUnnecessaryArrayBufferIsViewSpread = adaptPluginRule(noUnnecessaryArrayBufferIsViewSpreadRule, 'no-unnecessary-array-buffer-is-view-spread')
const adaptedNoUnnecessaryStringFromCharCodeSpread = adaptPluginRule(noUnnecessaryStringFromCharCodeSpreadRule, 'no-unnecessary-string-from-char-code-spread')
const adaptedNoUnnecessaryStringFromCodePointSpread = adaptPluginRule(noUnnecessaryStringFromCodePointSpreadRule, 'no-unnecessary-string-from-code-point-spread')
const adaptedNoUnnecessaryStringRawSpread = adaptPluginRule(noUnnecessaryStringRawSpreadRule, 'no-unnecessary-string-raw-spread')
const adaptedNoUnnecessaryDateSetFullYearSpread = adaptPluginRule(noUnnecessaryDateSetFullYearSpreadRule, 'no-unnecessary-date-set-full-year-spread')
const adaptedNoUnnecessaryDateSetMonthSpread = adaptPluginRule(noUnnecessaryDateSetMonthSpreadRule, 'no-unnecessary-date-set-month-spread')
const adaptedNoUnnecessaryDateSetDateSpread = adaptPluginRule(noUnnecessaryDateSetDateSpreadRule, 'no-unnecessary-date-set-date-spread')
const adaptedNoUnnecessaryDateSetHoursSpread = adaptPluginRule(noUnnecessaryDateSetHoursSpreadRule, 'no-unnecessary-date-set-hours-spread')
const adaptedNoUnnecessaryDateSetMinutesSpread = adaptPluginRule(noUnnecessaryDateSetMinutesSpreadRule, 'no-unnecessary-date-set-minutes-spread')
const adaptedNoUnnecessaryDateSetSecondsSpread = adaptPluginRule(noUnnecessaryDateSetSecondsSpreadRule, 'no-unnecessary-date-set-seconds-spread')
const adaptedNoUnnecessaryDateSetMillisecondsSpread = adaptPluginRule(noUnnecessaryDateSetMillisecondsSpreadRule, 'no-unnecessary-date-set-milliseconds-spread')
const adaptedNoUnnecessaryDateSetUtcFullYearSpread = adaptPluginRule(noUnnecessaryDateSetUtcFullYearSpreadRule, 'no-unnecessary-date-set-utc-full-year-spread')
const adaptedNoUnnecessaryDateSetUtcMonthSpread = adaptPluginRule(noUnnecessaryDateSetUtcMonthSpreadRule, 'no-unnecessary-date-set-utc-month-spread')
const adaptedNoUnnecessaryDateSetUtcDateSpread = adaptPluginRule(noUnnecessaryDateSetUtcDateSpreadRule, 'no-unnecessary-date-set-utc-date-spread')
const adaptedNoUnnecessaryDateSetUtcHoursSpread = adaptPluginRule(noUnnecessaryDateSetUtcHoursSpreadRule, 'no-unnecessary-date-set-utc-hours-spread')
const adaptedNoUnnecessaryDateSetUtcMinutesSpread = adaptPluginRule(noUnnecessaryDateSetUtcMinutesSpreadRule, 'no-unnecessary-date-set-utc-minutes-spread')
const adaptedNoUnnecessaryDateSetUtcSecondsSpread = adaptPluginRule(noUnnecessaryDateSetUtcSecondsSpreadRule, 'no-unnecessary-date-set-utc-seconds-spread')
const adaptedNoUnnecessaryDateSetUtcMillisecondsSpread = adaptPluginRule(noUnnecessaryDateSetUtcMillisecondsSpreadRule, 'no-unnecessary-date-set-utc-milliseconds-spread')
const adaptedNoUnnecessarySetClearSpread = adaptPluginRule(noUnnecessarySetClearSpreadRule, 'no-unnecessary-set-clear-spread')
const adaptedNoUnnecessarySetKeysSpread = adaptPluginRule(noUnnecessarySetKeysSpreadRule, 'no-unnecessary-set-keys-spread')
const adaptedNoUnnecessarySetValuesSpread = adaptPluginRule(noUnnecessarySetValuesSpreadRule, 'no-unnecessary-set-values-spread')
const adaptedNoUnnecessarySetEntriesSpread = adaptPluginRule(noUnnecessarySetEntriesSpreadRule, 'no-unnecessary-set-entries-spread')
const adaptedNoUnnecessaryMapKeysSpread = adaptPluginRule(noUnnecessaryMapKeysSpreadRule, 'no-unnecessary-map-keys-spread')
const adaptedNoUnnecessaryMapValuesSpread = adaptPluginRule(noUnnecessaryMapValuesSpreadRule, 'no-unnecessary-map-values-spread')
const adaptedNoUnnecessaryMapEntriesSpread = adaptPluginRule(noUnnecessaryMapEntriesSpreadRule, 'no-unnecessary-map-entries-spread')
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
    'no-unnecessary-array-from-set-spread': adaptedNoUnnecessaryArrayFromSetSpread,
    'no-unnecessary-array-from-length': adaptedNoUnnecessaryArrayFromLength,
      'no-unnecessary-array-flat': adaptedNoUnnecessaryArrayFlat,
     'no-unnecessary-array-flat-single-level': adaptedNoUnnecessaryArrayFlatSingleLevel,
    'no-unnecessary-array-flat-map-identity': adaptedNoUnnecessaryArrayFlatMapIdentity,
     'no-unnecessary-array-flat-map-spread': adaptedNoUnnecessaryArrayFlatMapSpread,
     'no-unnecessary-array-flat-spread': adaptedNoUnnecessaryArrayFlatSpread,
     'no-unnecessary-array-flat-infinity': adaptedNoUnnecessaryArrayFlatInfinity,
    'no-unnecessary-array-keys-spread': adaptedNoUnnecessaryArrayKeysSpread,
      'no-unnecessary-array-values-spread': adaptedNoUnnecessaryArrayValuesSpread,
      'no-unnecessary-array-unshift-spread': adaptedNoUnnecessaryArrayUnshiftSpread,
     'no-unnecessary-array-every-boolean': adaptedNoUnnecessaryArrayEveryBoolean,
    'no-unnecessary-array-every-true': adaptedNoUnnecessaryArrayEveryTrue,
     'no-unnecessary-array-every-spread': adaptedNoUnnecessaryArrayEverySpread,
     'no-unnecessary-array-fill-spread': adaptedNoUnnecessaryArrayFillSpread,
      'no-unnecessary-array-entries-spread': adaptedNoUnnecessaryArrayEntriesSpread,
     'no-unnecessary-array-at-spread': adaptedNoUnnecessaryArrayAtSpread,
      'no-unnecessary-array-filter-identity': adaptedNoUnnecessaryArrayFilterIdentity,
     'no-unnecessary-array-filter-spread': adaptedNoUnnecessaryArrayFilterSpread,
    'no-unnecessary-array-for-each-return': adaptedNoUnnecessaryArrayForEachReturn,
    'no-unnecessary-array-for-each-spread': adaptedNoUnnecessaryArrayForEachSpread,
     'no-unnecessary-array-push-spread': adaptedNoUnnecessaryArrayPushSpread,
     'no-unnecessary-array-pop-spread': adaptedNoUnnecessaryArrayPopSpread,
     'no-unnecessary-array-find-boolean': adaptedNoUnnecessaryArrayFindBoolean,
      'no-unnecessary-array-find-last-boolean': adaptedNoUnnecessaryArrayFindLastBoolean,
     'no-unnecessary-array-find-last-spread': adaptedNoUnnecessaryArrayFindLastSpread,
      'no-unnecessary-array-find-last-index-literal': adaptedNoUnnecessaryArrayFindLastIndexLiteral,
       'no-unnecessary-array-find-last-index-spread': adaptedNoUnnecessaryArrayFindLastIndexSpread,
       'no-unnecessary-array-find-spread': adaptedNoUnnecessaryArrayFindSpread,
     'no-unnecessary-array-find-index-literal': adaptedNoUnnecessaryArrayFindIndexLiteral,
    'no-unnecessary-array-find-index-spread': adaptedNoUnnecessaryArrayFindIndexSpread,
    'no-unnecessary-array-index-of-spread': adaptedNoUnnecessaryArrayIndexOfSpread,
    'no-unnecessary-array-last-index-of-spread': adaptedNoUnnecessaryArrayLastIndexOfSpread,
    'no-unnecessary-array-fill-literal': adaptedNoUnnecessaryArrayFillLiteral,
     'no-unnecessary-array-fill-same': adaptedNoUnnecessaryArrayFillSame,
    'no-unnecessary-array-isarray-literal': adaptedNoUnnecessaryArrayIsarrayLiteral,
    'no-unnecessary-array-of-single': adaptedNoUnnecessaryArrayOfSingle,
    'no-unnecessary-array-of-spread': adaptedNoUnnecessaryArrayOfSpread,
    'no-unnecessary-array-includes-single': adaptedNoUnnecessaryArrayIncludesSingle,
    'no-unnecessary-array-includes-nan': adaptedNoUnnecessaryArrayIncludesNAN,
    'no-unnecessary-array-includes-spread': adaptedNoUnnecessaryArrayIncludesSpread,
    'no-unnecessary-array-index-of-literal': adaptedNoUnnecessaryArrayIndexOfLiteral,
    'no-unnecessary-array-join-empty': adaptedNoUnnecessaryArrayJoinEmpty,
    'no-unnecessary-array-join-spread': adaptedNoUnnecessaryArrayJoinSpread,
    'no-unnecessary-array-constructor': adaptedNoUnnecessaryArrayConstructor,
    'no-unnecessary-array-concat-single': adaptedNoUnnecessaryArrayConcatSingle,
     'no-unnecessary-array-concat-spread': adaptedNoUnnecessaryArrayConcatSpread,
     'no-unnecessary-array-copy-within-spread': adaptedNoUnnecessaryArrayCopyWithinSpread,
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
    'no-unnecessary-array-map-spread': adaptedNoUnnecessaryArrayMapSpread,
    'no-unnecessary-math-max-single': adaptedNoUnnecessaryMathMaxSingle,
   'no-unnecessary-math-ceil-integer': adaptedNoUnnecessaryMathCeilInteger,
   'no-unnecessary-math-round-integer': adaptedNoUnnecessaryMathRoundInteger,
   'no-unnecessary-math-sign-zero': adaptedNoUnnecessaryMathSignZero,
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
    'no-unnecessary-array-reverse-spread': adaptedNoUnnecessaryArrayReverseSpread,
    'no-unnecessary-array-reduce-spread': adaptedNoUnnecessaryArrayReduceSpread,
    'no-unnecessary-array-reduce-right-spread': adaptedNoUnnecessaryArrayReduceRightSpread,
   'no-unnecessary-number-to-fixed': adaptedNoUnnecessaryNumberToFixed,
   'no-unnecessary-number-to-exponential-default': adaptedNoUnnecessaryNumberToExponentialDefault,
   'no-unnecessary-number-to-precision-default': adaptedNoUnnecessaryNumberToPrecisionDefault,
   'no-unnecessary-number-tofixed-zero': adaptedNoUnnecessaryNumberTofixedZero,
  'no-unnecessary-number-wrapper': adaptedNoUnnecessaryNumberWrapper,
  'no-unnecessary-number-constructor': adaptedNoUnnecessaryNumberConstructor,
  'no-unnecessary-number-isnan-literal': adaptedNoUnnecessaryNumberIsnanLiteral,
  'no-unnecessary-join': adaptedNoUnnecessaryJoin,
  'no-unnecessary-sort': adaptedNoUnnecessarySort,
  'no-unnecessary-array-sort-no-use': adaptedNoUnnecessaryArraySortNoUse,
   'no-unnecessary-array-sort-spread': adaptedNoUnnecessaryArraySortSpread,
   'no-unnecessary-array-splice-spread': adaptedNoUnnecessaryArraySpliceSpread,
   'no-unnecessary-array-some-false': adaptedNoUnnecessaryArraySomeFalse,
   'no-unnecessary-array-some-spread': adaptedNoUnnecessaryArraySomeSpread,
   'no-unnecessary-array-shift-spread': adaptedNoUnnecessaryArrayShiftSpread,
   'no-unnecessary-includes': adaptedNoUnnecessaryIncludes,
   'no-unnecessary-shift': adaptedNoUnnecessaryShift,
   'no-unnecessary-slice': adaptedNoUnnecessarySlice,
   'no-unnecessary-array-slice-zero': adaptedNoUnnecessaryArraySliceZero,
   'no-unnecessary-array-slice-spread': adaptedNoUnnecessaryArraySliceSpread,
  'no-unnecessary-some': adaptedNoUnnecessarySome,
   'no-unnecessary-splice': adaptedNoUnnecessarySplice,
   'no-unnecessary-array-splice-no-use': adaptedNoUnnecessaryArraySpliceNoUse,
   'no-unnecessary-array-splice-zero': adaptedNoUnnecessaryArraySpliceZero,
    'no-unnecessary-array-to-reversed-no-use': adaptedNoUnnecessaryArrayToReversedNoUse,
    'no-unnecessary-array-to-reversed-spread': adaptedNoUnnecessaryArrayToReversedSpread,
     'no-unnecessary-array-to-string-array': adaptedNoUnnecessaryArrayToStringArray,
      'no-unnecessary-array-to-string-spread': adaptedNoUnnecessaryArrayToStringSpread,
      'no-unnecessary-array-to-locale-string-spread': adaptedNoUnnecessaryArrayToLocaleStringSpread,
      'no-unnecessary-array-to-json-spread': adaptedNoUnnecessaryArrayToJSONSpread,
      'no-unnecessary-spread': adaptedNoUnnecessarySpread,
   'no-unnecessary-spread-array': adaptedNoUnnecessarySpreadArray,
   'no-unnecessary-string-concat': adaptedNoUnnecessaryStringConcat,
   'no-unnecessary-string-concat-empty': adaptedNoUnnecessaryStringConcatEmpty,
   'no-unnecessary-string-concat-spread': adaptedNoUnnecessaryStringConcatSpread,
   'no-unnecessary-string-constructor': adaptedNoUnnecessaryStringConstructor,
   'no-unnecessary-string-constructor-non-empty': adaptedNoUnnecessaryStringConstructorNonEmpty,
    'no-unnecessary-string-includes-empty': adaptedNoUnnecessaryStringIncludesEmpty,
    'no-unnecessary-string-includes-spread': adaptedNoUnnecessaryStringIncludesSpread,
    'no-unnecessary-string-index-of-empty': adaptedNoUnnecessaryStringIndexOfEmpty,
    'no-unnecessary-string-index-of-spread': adaptedNoUnnecessaryStringIndexOfSpread,
    'no-unnecessary-string-iterator-empty': adaptedNoUnnecessaryStringIteratorEmpty,
    'no-unnecessary-string-last-index-of-zero': adaptedNoUnnecessaryStringLastIndexOfZero,
    'no-unnecessary-string-last-index-of-empty': adaptedNoUnnecessaryStringLastIndexOfEmpty,
    'no-unnecessary-string-last-index-of-spread': adaptedNoUnnecessaryStringLastIndexOfSpread,
   'no-unnecessary-string-char-at-zero': adaptedNoUnnecessaryStringCharAtZero,
    'no-unnecessary-string-char-at-empty': adaptedNoUnnecessaryStringCharAtEmpty,
    'no-unnecessary-string-char-at-spread': adaptedNoUnnecessaryStringCharAtSpread,
    'no-unnecessary-string-char-code-at-spread': adaptedNoUnnecessaryStringCharCodeAtSpread,
    'no-unnecessary-string-char-code-at-zero': adaptedNoUnnecessaryStringCharCodeAtZero,
    'no-unnecessary-string-at-empty': adaptedNoUnnecessaryStringAtEmpty,
    'no-unnecessary-string-at-spread': adaptedNoUnnecessaryStringAtSpread,
    'no-unnecessary-string-at-zero': adaptedNoUnnecessaryStringAtZero,
    'no-unnecessary-string-codepointat-zero': adaptedNoUnnecessaryStringCodepointatZero,
    'no-unnecessary-string-code-point-at-empty': adaptedNoUnnecessaryStringCodePointAtEmpty,
    'no-unnecessary-string-code-point-at-spread': adaptedNoUnnecessaryStringCodePointAtSpread,
    'no-unnecessary-string-length-compare': adaptedNoUnnecessaryStringLengthCompare,
    'no-unnecessary-string-locale-compare-same': adaptedNoUnnecessaryStringLocaleCompareSame,
    'no-unnecessary-string-locale-compare-spread': adaptedNoUnnecessaryStringLocaleCompareSpread,
    'no-unnecessary-string-match-all-empty': adaptedNoUnnecessaryStringMatchAllEmpty,
    'no-unnecessary-string-match-all-spread': adaptedNoUnnecessaryStringMatchAllSpread,
     'no-unnecessary-string-match-empty': adaptedNoUnnecessaryStringMatchEmpty,
     'no-unnecessary-string-match-spread': adaptedNoUnnecessaryStringMatchSpread,
     'no-unnecessary-string-normalize-empty': adaptedNoUnnecessaryStringNormalizeEmpty,
     'no-unnecessary-string-normalize-spread': adaptedNoUnnecessaryStringNormalizeSpread,
    'no-unnecessary-string-ends-with-empty': adaptedNoUnnecessaryStringEndsWithEmpty,
    'no-unnecessary-string-ends-with-spread': adaptedNoUnnecessaryStringEndsWithSpread,
   'no-unnecessary-string-pad-start-zero': adaptedNoUnnecessaryStringPadStartZero,
   'no-unnecessary-string-pad-start-empty': adaptedNoUnnecessaryStringPadStartEmpty,
   'no-unnecessary-string-pad-start-spread': adaptedNoUnnecessaryStringPadStartSpread,
   'no-unnecessary-string-pad-end-zero': adaptedNoUnnecessaryStringPadEndZero,
   'no-unnecessary-string-pad-end-empty': adaptedNoUnnecessaryStringPadEndEmpty,
   'no-unnecessary-string-pad-end-spread': adaptedNoUnnecessaryStringPadEndSpread,
  'no-unnecessary-string-wrapper': adaptedNoUnnecessaryStringWrapper,
   'no-unnecessary-string-split': adaptedNoUnnecessaryStringSplit,
    'no-unnecessary-string-split-empty-separator': adaptedNoUnnecessaryStringSplitEmptySeparator,
    'no-unnecessary-string-split-spread': adaptedNoUnnecessaryStringSplitSpread,
    'no-unnecessary-string-split-length': adaptedNoUnnecessaryStringSplitLength,
   'no-unnecessary-string-slice-zero-len': adaptedNoUnnecessaryStringSliceZeroLen,
   'no-unnecessary-string-slice-zero': adaptedNoUnnecessaryStringSliceZero,
   'no-unnecessary-string-slice-spread': adaptedNoUnnecessaryStringSliceSpread,
    'no-unnecessary-string-starts-empty': adaptedNoUnnecessaryStringStartsEmpty,
    'no-unnecessary-string-starts-with-non-empty': adaptedNoUnnecessaryStringStartsWithNonEmpty,
    'no-unnecessary-string-starts-with-empty': adaptedNoUnnecessaryStringStartsWithEmpty,
    'no-unnecessary-string-starts-with-spread': adaptedNoUnnecessaryStringStartsWithSpread,
     'no-unnecessary-string-trim-empty': adaptedNoUnnecessaryStringTrimEmpty,
     'no-unnecessary-string-trim-spread': adaptedNoUnnecessaryStringTrimSpread,
     'no-unnecessary-string-trim-start-empty': adaptedNoUnnecessaryStringTrimStartEmpty,
     'no-unnecessary-string-trim-start-spread': adaptedNoUnnecessaryStringTrimStartSpread,
    'no-unnecessary-string-trim-end-empty': adaptedNoUnnecessaryStringTrimEndEmpty,
    'no-unnecessary-string-trim-end-spread': adaptedNoUnnecessaryStringTrimEndSpread,
     'no-unnecessary-string-replace-all': adaptedNoUnnecessaryStringReplaceAll,
     'no-unnecessary-string-replace-all-empty': adaptedNoUnnecessaryStringReplaceAllEmpty,
     'no-unnecessary-string-replace-all-spread': adaptedNoUnnecessaryStringReplaceAllSpread,
     'no-unnecessary-string-replace-empty': adaptedNoUnnecessaryStringReplaceEmpty,
     'no-unnecessary-string-replace-spread': adaptedNoUnnecessaryStringReplaceSpread,
     'no-unnecessary-string-search-empty': adaptedNoUnnecessaryStringSearchEmpty,
     'no-unnecessary-string-search-spread': adaptedNoUnnecessaryStringSearchSpread,
    'no-unnecessary-string-repeat-zero': adaptedNoUnnecessaryStringRepeatZero,
    'no-unnecessary-string-repeat-one': adaptedNoUnnecessaryStringRepeatOne,
    'no-unnecessary-string-repeat-empty': adaptedNoUnnecessaryStringRepeatEmpty,
    'no-unnecessary-string-repeat-spread': adaptedNoUnnecessaryStringRepeatSpread,
    'no-unnecessary-string-substring-zero': adaptedNoUnnecessaryStringSubstringZero,
    'no-unnecessary-string-substring-spread': adaptedNoUnnecessaryStringSubstringSpread,
  'no-unnecessary-stringify': adaptedNoUnnecessaryStringify,
  'no-unnecessary-string-to-string-spread': adaptedNoUnnecessaryStringToStringSpread,
  'no-unnecessary-string-value-of-spread': adaptedNoUnnecessaryStringValueOfSpread,
  'no-unnecessary-string-anchor-spread': adaptedNoUnnecessaryStringAnchorSpread,
  'no-unnecessary-string-fixed-spread': adaptedNoUnnecessaryStringFixedSpread,
  'no-unnecessary-string-big-spread': adaptedNoUnnecessaryStringBigSpread,
  'no-unnecessary-string-link-spread': adaptedNoUnnecessaryStringLinkSpread,
  'no-unnecessary-string-fontcolor-spread': adaptedNoUnnecessaryStringFontcolorSpread,
  'no-unnecessary-string-fontsize-spread': adaptedNoUnnecessaryStringFontsizeSpread,
  'no-unnecessary-string-blink-spread': adaptedNoUnnecessaryStringBlinkSpread,
  'no-unnecessary-string-bold-spread': adaptedNoUnnecessaryStringBoldSpread,
  'no-unnecessary-string-italics-spread': adaptedNoUnnecessaryStringItalicsSpread,
  'no-unnecessary-string-small-spread': adaptedNoUnnecessaryStringSmallSpread,
  'no-unnecessary-string-strike-spread': adaptedNoUnnecessaryStringStrikeSpread,
  'no-unnecessary-string-sub-spread': adaptedNoUnnecessaryStringSubSpread,
  'no-unnecessary-string-sup-spread': adaptedNoUnnecessaryStringSupSpread,
  'no-unnecessary-string-to-well-formed-spread': adaptedNoUnnecessaryStringToWellFormedSpread,
  'no-unnecessary-number-to-exponential-spread': adaptedNoUnnecessaryNumberToExponentialSpread,
  'no-unnecessary-number-to-precision-spread': adaptedNoUnnecessaryNumberToPrecisionSpread,
  'no-unnecessary-number-to-locale-string-spread': adaptedNoUnnecessaryNumberToLocaleStringSpread,
  'no-unnecessary-number-value-of-spread': adaptedNoUnnecessaryNumberValueOfSpread,
  'no-unnecessary-number-to-string-spread': adaptedNoUnnecessaryNumberToStringSpread,
  'no-unnecessary-number-to-fixed-spread': adaptedNoUnnecessaryNumberToFixedSpread,
   'no-unnecessary-is-nan-spread': adaptedNoUnnecessaryIsNanSpread,
  'no-unnecessary-is-finite-spread': adaptedNoUnnecessaryIsFiniteSpread,
  'no-unnecessary-parse-float-spread': adaptedNoUnnecessaryParseFloatSpread,
  'no-unnecessary-parse-int-spread': adaptedNoUnnecessaryParseIntSpread,
  'no-unnecessary-number-is-integer-spread': adaptedNoUnnecessaryNumberIsIntegerSpread,
  'no-unnecessary-number-is-nan-spread': adaptedNoUnnecessaryNumberIsNanSpread,
  'no-unnecessary-number-is-finite-spread': adaptedNoUnnecessaryNumberIsFiniteSpread,
  'no-unnecessary-number-is-safe-integer-spread': adaptedNoUnnecessaryNumberIsSafeIntegerSpread,
  'no-unnecessary-number-parse-float-spread': adaptedNoUnnecessaryNumberParseFloatSpread,
  'no-unnecessary-number-parse-int-spread': adaptedNoUnnecessaryNumberParseIntSpread,
  'no-unnecessary-object-keys-spread': adaptedNoUnnecessaryObjectKeysSpread,
  'no-unnecessary-object-values-spread': adaptedNoUnnecessaryObjectValuesSpread,
  'no-unnecessary-object-entries-spread': adaptedNoUnnecessaryObjectEntriesSpread,
  'no-unnecessary-object-get-prototype-of-spread': adaptedNoUnnecessaryObjectGetPrototypeOfSpread,
  'no-unnecessary-object-freeze-spread': adaptedNoUnnecessaryObjectFreezeSpread,
  'no-unnecessary-object-seal-spread': adaptedNoUnnecessaryObjectSealSpread,
  'no-unnecessary-object-is-spread': adaptedNoUnnecessaryObjectIsSpread,
  'no-unnecessary-object-assign-spread': adaptedNoUnnecessaryObjectAssignSpread,
  'no-unnecessary-object-get-own-property-names-spread': adaptedNoUnnecessaryObjectGetOwnPropertyNamesSpread,
  'no-unnecessary-object-get-own-property-symbols-spread': adaptedNoUnnecessaryObjectGetOwnPropertySymbolsSpread,
  'no-unnecessary-object-get-own-property-descriptor-spread': adaptedNoUnnecessaryObjectGetOwnPropertyDescriptorSpread,
  'no-unnecessary-object-is-frozen-spread': adaptedNoUnnecessaryObjectIsFrozenSpread,
  'no-unnecessary-object-is-sealed-spread': adaptedNoUnnecessaryObjectIsSealedSpread,
  'no-unnecessary-object-is-extensible-spread': adaptedNoUnnecessaryObjectIsExtensibleSpread,
  'no-unnecessary-object-prevent-extensions-spread': adaptedNoUnnecessaryObjectPreventExtensionsSpread,
  'no-unnecessary-object-create-spread': adaptedNoUnnecessaryObjectCreateSpread,
  'no-unnecessary-object-define-property-spread': adaptedNoUnnecessaryObjectDefinePropertySpread,
  'no-unnecessary-object-get-own-property-descriptors-spread': adaptedNoUnnecessaryObjectGetOwnPropertyDescriptorsSpread,
  'no-unnecessary-object-set-prototype-of-spread': adaptedNoUnnecessaryObjectSetPrototypeOfSpread,
  'no-unnecessary-object-define-properties-spread': adaptedNoUnnecessaryObjectDefinePropertiesSpread,
  'no-unnecessary-promise-reject-spread': adaptedNoUnnecessaryPromiseRejectSpread,
  'no-unnecessary-promise-all-spread': adaptedNoUnnecessaryPromiseAllSpread,
  'no-unnecessary-promise-race-spread': adaptedNoUnnecessaryPromiseRaceSpread,
  'no-unnecessary-promise-all-settled-spread': adaptedNoUnnecessaryPromiseAllSettledSpread,
  'no-unnecessary-promise-any-spread': adaptedNoUnnecessaryPromiseAnySpread,
  'no-unnecessary-math-abs-spread': adaptedNoUnnecessaryMathAbsSpread,
  'no-unnecessary-math-ceil-spread': adaptedNoUnnecessaryMathCeilSpread,
  'no-unnecessary-math-floor-spread': adaptedNoUnnecessaryMathFloorSpread,
  'no-unnecessary-math-round-spread': adaptedNoUnnecessaryMathRoundSpread,
  'no-unnecessary-math-sqrt-spread': adaptedNoUnnecessaryMathSqrtSpread,
  'no-unnecessary-math-max-spread': adaptedNoUnnecessaryMathMaxSpread,
  'no-unnecessary-math-min-spread': adaptedNoUnnecessaryMathMinSpread,
  'no-unnecessary-math-sign-spread': adaptedNoUnnecessaryMathSignSpread,
  'no-unnecessary-math-trunc-spread': adaptedNoUnnecessaryMathTruncSpread,
  'no-unnecessary-math-pow-spread': adaptedNoUnnecessaryMathPowSpread,
  'no-unnecessary-math-log-spread': adaptedNoUnnecessaryMathLogSpread,
  'no-unnecessary-math-sin-spread': adaptedNoUnnecessaryMathSinSpread,
  'no-unnecessary-math-cos-spread': adaptedNoUnnecessaryMathCosSpread,
  'no-unnecessary-math-tan-spread': adaptedNoUnnecessaryMathTanSpread,
  'no-unnecessary-math-atan-spread': adaptedNoUnnecessaryMathAtanSpread,
  'no-unnecessary-math-random-spread': adaptedNoUnnecessaryMathRandomSpread,
  'no-unnecessary-math-exp-spread': adaptedNoUnnecessaryMathExpSpread,
  'no-unnecessary-math-atan2-spread': adaptedNoUnnecessaryMathAtan2Spread,
  'no-unnecessary-math-hypot-spread': adaptedNoUnnecessaryMathHypotSpread,
  'no-unnecessary-math-log2-spread': adaptedNoUnnecessaryMathLog2Spread,
  'no-unnecessary-math-log10-spread': adaptedNoUnnecessaryMathLog10Spread,
  'no-unnecessary-math-cbrt-spread': adaptedNoUnnecessaryMathCbrtSpread,
  'no-unnecessary-math-acos-spread': adaptedNoUnnecessaryMathAcosSpread,
  'no-unnecessary-math-asin-spread': adaptedNoUnnecessaryMathAsinSpread,
  'no-unnecessary-math-asinh-spread': adaptedNoUnnecessaryMathAsinhSpread,
  'no-unnecessary-math-acosh-spread': adaptedNoUnnecessaryMathAcoshSpread,
  'no-unnecessary-math-atanh-spread': adaptedNoUnnecessaryMathAtanhSpread,
  'no-unnecessary-math-clz32-spread': adaptedNoUnnecessaryMathClz32Spread,
  'no-unnecessary-math-imul-spread': adaptedNoUnnecessaryMathImulSpread,
  'no-unnecessary-math-fround-spread': adaptedNoUnnecessaryMathFroundSpread,
  'no-unnecessary-reflect-apply-spread': adaptedNoUnnecessaryReflectApplySpread,
  'no-unnecessary-reflect-construct-spread': adaptedNoUnnecessaryReflectConstructSpread,
  'no-unnecessary-reflect-get-spread': adaptedNoUnnecessaryReflectGetSpread,
  'no-unnecessary-reflect-set-spread': adaptedNoUnnecessaryReflectSetSpread,
  'no-unnecessary-reflect-delete-property-spread': adaptedNoUnnecessaryReflectDeletePropertySpread,
  'no-unnecessary-reflect-has-spread': adaptedNoUnnecessaryReflectHasSpread,
  'no-unnecessary-reflect-own-keys-spread': adaptedNoUnnecessaryReflectOwnKeysSpread,
  'no-unnecessary-reflect-get-own-property-descriptor-spread': adaptedNoUnnecessaryReflectGetOwnPropertyDescriptorSpread,
  'no-unnecessary-reflect-define-property-spread': adaptedNoUnnecessaryReflectDefinePropertySpread,
  'no-unnecessary-reflect-get-prototype-of-spread': adaptedNoUnnecessaryReflectGetPrototypeOfSpread,
  'no-unnecessary-reflect-set-prototype-of-spread': adaptedNoUnnecessaryReflectSetPrototypeOfSpread,
  'no-unnecessary-reflect-is-extensible-spread': adaptedNoUnnecessaryReflectIsExtensibleSpread,
  'no-unnecessary-reflect-prevent-extensions-spread': adaptedNoUnnecessaryReflectPreventExtensionsSpread,
  'no-unnecessary-json-parse-spread': adaptedNoUnnecessaryJsonParseSpread,
  'no-unnecessary-json-stringify-spread': adaptedNoUnnecessaryJsonStringifySpread,
  'no-unnecessary-object-has-own-spread': adaptedNoUnnecessaryObjectHasOwnSpread,
  'no-unnecessary-console-log-spread': adaptedNoUnnecessaryConsoleLogSpread,
  'no-unnecessary-console-warn-spread': adaptedNoUnnecessaryConsoleWarnSpread,
  'no-unnecessary-console-error-spread': adaptedNoUnnecessaryConsoleErrorSpread,
  'no-unnecessary-console-info-spread': adaptedNoUnnecessaryConsoleInfoSpread,
  'no-unnecessary-console-debug-spread': adaptedNoUnnecessaryConsoleDebugSpread,
  'no-unnecessary-reflect-get-own-property-symbols-spread': adaptedNoUnnecessaryReflectGetOwnPropertySymbolsSpread,
  'no-unnecessary-reflect-define-properties-spread': adaptedNoUnnecessaryReflectDefinePropertiesSpread,
  'no-unnecessary-reflect-is-frozen-spread': adaptedNoUnnecessaryReflectIsFrozenSpread,
  'no-unnecessary-reflect-is-sealed-spread': adaptedNoUnnecessaryReflectIsSealedSpread,
  'no-unnecessary-encode-uri-spread': adaptedNoUnnecessaryEncodeUriSpread,
  'no-unnecessary-decode-uri-spread': adaptedNoUnnecessaryDecodeUriSpread,
  'no-unnecessary-encode-uri-component-spread': adaptedNoUnnecessaryEncodeUriComponentSpread,
  'no-unnecessary-decode-uri-component-spread': adaptedNoUnnecessaryDecodeUriComponentSpread,
  'no-unnecessary-console-table-spread': adaptedNoUnnecessaryConsoleTableSpread,
  'no-unnecessary-console-trace-spread': adaptedNoUnnecessaryConsoleTraceSpread,
  'no-unnecessary-console-dir-spread': adaptedNoUnnecessaryConsoleDirSpread,
  'no-unnecessary-console-assert-spread': adaptedNoUnnecessaryConsoleAssertSpread,
  'no-unnecessary-console-count-spread': adaptedNoUnnecessaryConsoleCountSpread,
  'no-unnecessary-console-clear-spread': adaptedNoUnnecessaryConsoleClearSpread,
  'no-unnecessary-console-group-spread': adaptedNoUnnecessaryConsoleGroupSpread,
  'no-unnecessary-console-group-end-spread': adaptedNoUnnecessaryConsoleGroupEndSpread,
  'no-unnecessary-console-time-spread': adaptedNoUnnecessaryConsoleTimeSpread,
  'no-unnecessary-console-time-end-spread': adaptedNoUnnecessaryConsoleTimeEndSpread,
  'no-unnecessary-console-time-log-spread': adaptedNoUnnecessaryConsoleTimeLogSpread,
  'no-unnecessary-console-group-collapsed-spread': adaptedNoUnnecessaryConsoleGroupCollapsedSpread,
  'no-unnecessary-console-count-reset-spread': adaptedNoUnnecessaryConsoleCountResetSpread,
  'no-unnecessary-console-profile-spread': adaptedNoUnnecessaryConsoleProfileSpread,
  'no-unnecessary-console-profile-end-spread': adaptedNoUnnecessaryConsoleProfileEndSpread,
  'no-unnecessary-console-dirxml-spread': adaptedNoUnnecessaryConsoleDirxmlSpread,
  'no-unnecessary-map-set-spread': adaptedNoUnnecessaryMapSetSpread,
  'no-unnecessary-map-for-each-spread': adaptedNoUnnecessaryMapForEachSpread,
  'no-unnecessary-set-add-spread': adaptedNoUnnecessarySetAddSpread,
  'no-unnecessary-set-for-each-spread': adaptedNoUnnecessarySetForEachSpread,
  'no-unnecessary-weakmap-set-spread': adaptedNoUnnecessaryWeakMapSetSpread,
  'no-unnecessary-weakset-add-spread': adaptedNoUnnecessaryWeakSetAddSpread,
  'no-unnecessary-date-now-spread': adaptedNoUnnecessaryDateNowSpread,
  'no-unnecessary-reg-exp-test-spread': adaptedNoUnnecessaryRegExpTestSpread,
  'no-unnecessary-date-parse-spread': adaptedNoUnnecessaryDateParseSpread,
  'no-unnecessary-date-get-full-year-spread': adaptedNoUnnecessaryDateGetFullYearSpread,
  'no-unnecessary-reg-exp-exec-spread': adaptedNoUnnecessaryRegExpExecSpread,
  'no-unnecessary-symbol-for-spread': adaptedNoUnnecessarySymbolForSpread,
  'no-unnecessary-date-get-month-spread': adaptedNoUnnecessaryDateGetMonthSpread,
  'no-unnecessary-date-get-date-spread': adaptedNoUnnecessaryDateGetDateSpread,
  'no-unnecessary-symbol-key-for-spread': adaptedNoUnnecessarySymbolKeyForSpread,
  'no-unnecessary-date-to-iso-string-spread': adaptedNoUnnecessaryDateToISOStringSpread,
  'no-unnecessary-date-get-day-spread': adaptedNoUnnecessaryDateGetDaySpread,
  'no-unnecessary-date-get-hours-spread': adaptedNoUnnecessaryDateGetHoursSpread,
  'no-unnecessary-date-get-minutes-spread': adaptedNoUnnecessaryDateGetMinutesSpread,
  'no-unnecessary-date-get-seconds-spread': adaptedNoUnnecessaryDateGetSecondsSpread,
  'no-unnecessary-date-get-time-spread': adaptedNoUnnecessaryDateGetTimeSpread,
  'no-unnecessary-date-get-timezone-offset-spread': adaptedNoUnnecessaryDateGetTimezoneOffsetSpread,
  'no-unnecessary-date-get-milliseconds-spread': adaptedNoUnnecessaryDateGetMillisecondsSpread,
  'no-unnecessary-date-to-string-spread': adaptedNoUnnecessaryDateToStringSpread,
  'no-unnecessary-date-to-date-string-spread': adaptedNoUnnecessaryDateToDateStringSpread,
  'no-unnecessary-date-to-time-string-spread': adaptedNoUnnecessaryDateToTimeStringSpread,
  'no-unnecessary-map-get-spread': adaptedNoUnnecessaryMapGetSpread,
  'no-unnecessary-map-has-spread': adaptedNoUnnecessaryMapHasSpread,
  'no-unnecessary-map-delete-spread': adaptedNoUnnecessaryMapDeleteSpread,
  'no-unnecessary-set-has-spread': adaptedNoUnnecessarySetHasSpread,
  'no-unnecessary-set-delete-spread': adaptedNoUnnecessarySetDeleteSpread,
  'no-unnecessary-date-value-of-spread': adaptedNoUnnecessaryDateValueOfSpread,
  'no-unnecessary-date-to-utc-string-spread': adaptedNoUnnecessaryDateToUTCStringSpread,
  'no-unnecessary-date-to-json-spread': adaptedNoUnnecessaryDateToJSONSpread,
  'no-unnecessary-date-get-utc-fullyear-spread': adaptedNoUnnecessaryDateGetUTCFullyearSpread,
  'no-unnecessary-date-get-utc-month-spread': adaptedNoUnnecessaryDateGetUTCMonthSpread,
  'no-unnecessary-date-get-utc-date-spread': adaptedNoUnnecessaryDateGetUTCDateSpread,
  'no-unnecessary-date-get-utc-day-spread': adaptedNoUnnecessaryDateGetUTCDaySpread,
  'no-unnecessary-date-get-utc-hours-spread': adaptedNoUnnecessaryDateGetUTCHoursSpread,
  'no-unnecessary-date-get-utc-minutes-spread': adaptedNoUnnecessaryDateGetUTCMinutesSpread,
  'no-unnecessary-date-get-utc-seconds-spread': adaptedNoUnnecessaryDateGetUTCSecondsSpread,
  'no-unnecessary-date-get-utc-milliseconds-spread': adaptedNoUnnecessaryDateGetUTCMillisecondsSpread,
  'no-unnecessary-date-to-locale-string-spread': adaptedNoUnnecessaryDateToLocaleStringSpread,
  'no-unnecessary-date-to-locale-date-string-spread': adaptedNoUnnecessaryDateToLocaleDateStringSpread,
  'no-unnecessary-date-to-locale-time-string-spread': adaptedNoUnnecessaryDateToLocaleTimeStringSpread,
  'no-unnecessary-date-utc-spread': adaptedNoUnnecessaryDateUTCSpread,
  'no-unnecessary-weakmap-get-spread': adaptedNoUnnecessaryWeakMapGetSpread,
  'no-unnecessary-weakmap-has-spread': adaptedNoUnnecessaryWeakMapHasSpread,
  'no-unnecessary-weakmap-delete-spread': adaptedNoUnnecessaryWeakMapDeleteSpread,
  'no-unnecessary-weakset-has-spread': adaptedNoUnnecessaryWeakSetHasSpread,
  'no-unnecessary-weakset-delete-spread': adaptedNoUnnecessaryWeakSetDeleteSpread,
  'no-unnecessary-map-clear-spread': adaptedNoUnnecessaryMapClearSpread,
  'no-unnecessary-typed-array-at-spread': adaptedNoUnnecessaryTypedArrayAtSpread,
  'no-unnecessary-typed-array-copy-within-spread': adaptedNoUnnecessaryTypedArrayCopyWithinSpread,
  'no-unnecessary-typed-array-entries-spread': adaptedNoUnnecessaryTypedArrayEntriesSpread,
  'no-unnecessary-typed-array-every-spread': adaptedNoUnnecessaryTypedArrayEverySpread,
  'no-unnecessary-typed-array-fill-spread': adaptedNoUnnecessaryTypedArrayFillSpread,
  'no-unnecessary-typed-array-filter-spread': adaptedNoUnnecessaryTypedArrayFilterSpread,
  'no-unnecessary-typed-array-find-spread': adaptedNoUnnecessaryTypedArrayFindSpread,
  'no-unnecessary-typed-array-find-index-spread': adaptedNoUnnecessaryTypedArrayFindIndexSpread,
  'no-unnecessary-typed-array-find-last-spread': adaptedNoUnnecessaryTypedArrayFindLastSpread,
  'no-unnecessary-typed-array-find-last-index-spread': adaptedNoUnnecessaryTypedArrayFindLastIndexSpread,
  'no-unnecessary-typed-array-for-each-spread': adaptedNoUnnecessaryTypedArrayForEachSpread,
  'no-unnecessary-typed-array-includes-spread': adaptedNoUnnecessaryTypedArrayIncludesSpread,
  'no-unnecessary-typed-array-index-of-spread': adaptedNoUnnecessaryTypedArrayIndexOfSpread,
  'no-unnecessary-typed-array-join-spread': adaptedNoUnnecessaryTypedArrayJoinSpread,
  'no-unnecessary-typed-array-keys-spread': adaptedNoUnnecessaryTypedArrayKeysSpread,
  'no-unnecessary-typed-array-last-index-of-spread': adaptedNoUnnecessaryTypedArrayLastIndexOfSpread,
  'no-unnecessary-typed-array-map-spread': adaptedNoUnnecessaryTypedArrayMapSpread,
  'no-unnecessary-typed-array-reduce-spread': adaptedNoUnnecessaryTypedArrayReduceSpread,
  'no-unnecessary-typed-array-reduce-right-spread': adaptedNoUnnecessaryTypedArrayReduceRightSpread,
  'no-unnecessary-typed-array-reverse-spread': adaptedNoUnnecessaryTypedArrayReverseSpread,
  'no-unnecessary-typed-array-set-spread': adaptedNoUnnecessaryTypedArraySetSpread,
  'no-unnecessary-typed-array-slice-spread': adaptedNoUnnecessaryTypedArraySliceSpread,
  'no-unnecessary-typed-array-some-spread': adaptedNoUnnecessaryTypedArraySomeSpread,
  'no-unnecessary-typed-array-sort-spread': adaptedNoUnnecessaryTypedArraySortSpread,
  'no-unnecessary-typed-array-sub-array-spread': adaptedNoUnnecessaryTypedArraySubArraySpread,
  'no-unnecessary-typed-array-to-locale-string-spread': adaptedNoUnnecessaryTypedArrayToLocaleStringSpread,
  'no-unnecessary-typed-array-to-string-spread': adaptedNoUnnecessaryTypedArrayToStringSpread,
  'no-unnecessary-typed-array-values-spread': adaptedNoUnnecessaryTypedArrayValuesSpread,
  'no-unnecessary-typed-array-with-spread': adaptedNoUnnecessaryTypedArrayWithSpread,
  'no-unnecessary-dataview-get-big-int64-spread': adaptedNoUnnecessaryDataviewGetBigInt64Spread,
  'no-unnecessary-dataview-get-big-uint64-spread': adaptedNoUnnecessaryDataviewGetBigUint64Spread,
  'no-unnecessary-dataview-get-float32-spread': adaptedNoUnnecessaryDataviewGetFloat32Spread,
  'no-unnecessary-dataview-get-float64-spread': adaptedNoUnnecessaryDataviewGetFloat64Spread,
  'no-unnecessary-dataview-get-int16-spread': adaptedNoUnnecessaryDataviewGetInt16Spread,
  'no-unnecessary-dataview-get-int32-spread': adaptedNoUnnecessaryDataviewGetInt32Spread,
  'no-unnecessary-dataview-get-int8-spread': adaptedNoUnnecessaryDataviewGetInt8Spread,
  'no-unnecessary-dataview-get-uint16-spread': adaptedNoUnnecessaryDataviewGetUint16Spread,
  'no-unnecessary-dataview-get-uint32-spread': adaptedNoUnnecessaryDataviewGetUint32Spread,
  'no-unnecessary-dataview-get-uint8-spread': adaptedNoUnnecessaryDataviewGetUint8Spread,
  'no-unnecessary-dataview-set-big-int64-spread': adaptedNoUnnecessaryDataviewSetBigInt64Spread,
  'no-unnecessary-dataview-set-big-uint64-spread': adaptedNoUnnecessaryDataviewSetBigUint64Spread,
  'no-unnecessary-eval-spread': adaptedNoUnnecessaryEvalSpread,
  'no-unnecessary-shared-array-buffer-slice-spread': adaptedNoUnnecessarySharedArrayBufferSliceSpread,
  'no-unnecessary-int-8-array-set-spread': adaptedNoUnnecessaryInt8ArraySetSpread,
  'no-unnecessary-int-8-array-subarray-spread': adaptedNoUnnecessaryInt8ArraySubarraySpread,
  'no-unnecessary-int-8-array-slice-spread': adaptedNoUnnecessaryInt8ArraySliceSpread,
  'no-unnecessary-uint-8-array-set-spread': adaptedNoUnnecessaryUint8ArraySetSpread,
  'no-unnecessary-uint-8-array-subarray-spread': adaptedNoUnnecessaryUint8ArraySubarraySpread,
  'no-unnecessary-uint-8-array-slice-spread': adaptedNoUnnecessaryUint8ArraySliceSpread,
  'no-unnecessary-uint-8-clamped-array-set-spread': adaptedNoUnnecessaryUint8ClampedArraySetSpread,
  'no-unnecessary-uint-8-clamped-array-subarray-spread': adaptedNoUnnecessaryUint8ClampedArraySubarraySpread,
  'no-unnecessary-uint-8-clamped-array-slice-spread': adaptedNoUnnecessaryUint8ClampedArraySliceSpread,
  'no-unnecessary-int-16-array-set-spread': adaptedNoUnnecessaryInt16ArraySetSpread,
  'no-unnecessary-int-16-array-subarray-spread': adaptedNoUnnecessaryInt16ArraySubarraySpread,
  'no-unnecessary-int-16-array-slice-spread': adaptedNoUnnecessaryInt16ArraySliceSpread,
  'no-unnecessary-uint-16-array-set-spread': adaptedNoUnnecessaryUint16ArraySetSpread,
  'no-unnecessary-uint-16-array-subarray-spread': adaptedNoUnnecessaryUint16ArraySubarraySpread,
  'no-unnecessary-uint-16-array-slice-spread': adaptedNoUnnecessaryUint16ArraySliceSpread,
  'no-unnecessary-int-32-array-set-spread': adaptedNoUnnecessaryInt32ArraySetSpread,
  'no-unnecessary-int-32-array-subarray-spread': adaptedNoUnnecessaryInt32ArraySubarraySpread,
  'no-unnecessary-int-32-array-slice-spread': adaptedNoUnnecessaryInt32ArraySliceSpread,
  'no-unnecessary-uint-32-array-set-spread': adaptedNoUnnecessaryUint32ArraySetSpread,
  'no-unnecessary-uint-32-array-subarray-spread': adaptedNoUnnecessaryUint32ArraySubarraySpread,
  'no-unnecessary-uint-32-array-slice-spread': adaptedNoUnnecessaryUint32ArraySliceSpread,
  'no-unnecessary-float-32-array-set-spread': adaptedNoUnnecessaryFloat32ArraySetSpread,
  'no-unnecessary-float-32-array-subarray-spread': adaptedNoUnnecessaryFloat32ArraySubarraySpread,
  'no-unnecessary-float-32-array-slice-spread': adaptedNoUnnecessaryFloat32ArraySliceSpread,
  'no-unnecessary-float-64-array-set-spread': adaptedNoUnnecessaryFloat64ArraySetSpread,
  'no-unnecessary-float-64-array-subarray-spread': adaptedNoUnnecessaryFloat64ArraySubarraySpread,
  'no-unnecessary-float-64-array-slice-spread': adaptedNoUnnecessaryFloat64ArraySliceSpread,
  'no-unnecessary-big-int-64-array-set-spread': adaptedNoUnnecessaryBigInt64ArraySetSpread,
  'no-unnecessary-big-int-64-array-subarray-spread': adaptedNoUnnecessaryBigInt64ArraySubarraySpread,
  'no-unnecessary-big-int-64-array-slice-spread': adaptedNoUnnecessaryBigInt64ArraySliceSpread,
  'no-unnecessary-big-uint-64-array-set-spread': adaptedNoUnnecessaryBigUint64ArraySetSpread,
  'no-unnecessary-big-uint-64-array-subarray-spread': adaptedNoUnnecessaryBigUint64ArraySubarraySpread,
  'no-unnecessary-big-uint-64-array-slice-spread': adaptedNoUnnecessaryBigUint64ArraySliceSpread,
  'no-unnecessary-int-8-array-fill-spread': adaptedNoUnnecessaryInt8ArrayFillSpread,
  'no-unnecessary-int-8-array-sort-spread': adaptedNoUnnecessaryInt8ArraySortSpread,
  'no-unnecessary-int-8-array-reverse-spread': adaptedNoUnnecessaryInt8ArrayReverseSpread,
  'no-unnecessary-int-8-array-copy-within-spread': adaptedNoUnnecessaryInt8ArrayCopyWithinSpread,
  'no-unnecessary-uint-8-array-fill-spread': adaptedNoUnnecessaryUint8ArrayFillSpread,
  'no-unnecessary-uint-8-array-sort-spread': adaptedNoUnnecessaryUint8ArraySortSpread,
  'no-unnecessary-uint-8-array-reverse-spread': adaptedNoUnnecessaryUint8ArrayReverseSpread,
  'no-unnecessary-uint-8-array-copy-within-spread': adaptedNoUnnecessaryUint8ArrayCopyWithinSpread,
  'no-unnecessary-uint-8-clamped-array-fill-spread': adaptedNoUnnecessaryUint8ClampedArrayFillSpread,
  'no-unnecessary-uint-8-clamped-array-sort-spread': adaptedNoUnnecessaryUint8ClampedArraySortSpread,
  'no-unnecessary-uint-8-clamped-array-reverse-spread': adaptedNoUnnecessaryUint8ClampedArrayReverseSpread,
  'no-unnecessary-uint-8-clamped-array-copy-within-spread': adaptedNoUnnecessaryUint8ClampedArrayCopyWithinSpread,
  'no-unnecessary-int-16-array-fill-spread': adaptedNoUnnecessaryInt16ArrayFillSpread,
  'no-unnecessary-int-16-array-sort-spread': adaptedNoUnnecessaryInt16ArraySortSpread,
  'no-unnecessary-int-16-array-reverse-spread': adaptedNoUnnecessaryInt16ArrayReverseSpread,
  'no-unnecessary-int-16-array-copy-within-spread': adaptedNoUnnecessaryInt16ArrayCopyWithinSpread,
  'no-unnecessary-uint-16-array-fill-spread': adaptedNoUnnecessaryUint16ArrayFillSpread,
  'no-unnecessary-uint-16-array-sort-spread': adaptedNoUnnecessaryUint16ArraySortSpread,
  'no-unnecessary-uint-16-array-reverse-spread': adaptedNoUnnecessaryUint16ArrayReverseSpread,
  'no-unnecessary-uint-16-array-copy-within-spread': adaptedNoUnnecessaryUint16ArrayCopyWithinSpread,
  'no-unnecessary-int-32-array-fill-spread': adaptedNoUnnecessaryInt32ArrayFillSpread,
  'no-unnecessary-int-32-array-sort-spread': adaptedNoUnnecessaryInt32ArraySortSpread,
  'no-unnecessary-int-32-array-reverse-spread': adaptedNoUnnecessaryInt32ArrayReverseSpread,
  'no-unnecessary-int-32-array-copy-within-spread': adaptedNoUnnecessaryInt32ArrayCopyWithinSpread,
  'no-unnecessary-uint-32-array-fill-spread': adaptedNoUnnecessaryUint32ArrayFillSpread,
  'no-unnecessary-uint-32-array-sort-spread': adaptedNoUnnecessaryUint32ArraySortSpread,
  'no-unnecessary-uint-32-array-reverse-spread': adaptedNoUnnecessaryUint32ArrayReverseSpread,
  'no-unnecessary-uint-32-array-copy-within-spread': adaptedNoUnnecessaryUint32ArrayCopyWithinSpread,
  'no-unnecessary-float-32-array-fill-spread': adaptedNoUnnecessaryFloat32ArrayFillSpread,
  'no-unnecessary-float-32-array-sort-spread': adaptedNoUnnecessaryFloat32ArraySortSpread,
  'no-unnecessary-float-32-array-reverse-spread': adaptedNoUnnecessaryFloat32ArrayReverseSpread,
  'no-unnecessary-float-32-array-copy-within-spread': adaptedNoUnnecessaryFloat32ArrayCopyWithinSpread,
  'no-unnecessary-float-64-array-fill-spread': adaptedNoUnnecessaryFloat64ArrayFillSpread,
  'no-unnecessary-float-64-array-sort-spread': adaptedNoUnnecessaryFloat64ArraySortSpread,
  'no-unnecessary-float-64-array-reverse-spread': adaptedNoUnnecessaryFloat64ArrayReverseSpread,
  'no-unnecessary-float-64-array-copy-within-spread': adaptedNoUnnecessaryFloat64ArrayCopyWithinSpread,
  'no-unnecessary-big-int-64-array-fill-spread': adaptedNoUnnecessaryBigInt64ArrayFillSpread,
  'no-unnecessary-big-int-64-array-sort-spread': adaptedNoUnnecessaryBigInt64ArraySortSpread,
  'no-unnecessary-big-int-64-array-reverse-spread': adaptedNoUnnecessaryBigInt64ArrayReverseSpread,
  'no-unnecessary-big-int-64-array-copy-within-spread': adaptedNoUnnecessaryBigInt64ArrayCopyWithinSpread,
  'no-unnecessary-big-uint-64-array-fill-spread': adaptedNoUnnecessaryBigUint64ArrayFillSpread,
  'no-unnecessary-big-uint-64-array-sort-spread': adaptedNoUnnecessaryBigUint64ArraySortSpread,
  'no-unnecessary-big-uint-64-array-reverse-spread': adaptedNoUnnecessaryBigUint64ArrayReverseSpread,
  'no-unnecessary-big-uint-64-array-copy-within-spread': adaptedNoUnnecessaryBigUint64ArrayCopyWithinSpread,
  'no-unnecessary-int-8-array-map-spread': adaptedNoUnnecessaryInt8ArrayMapSpread,
  'no-unnecessary-int-8-array-filter-spread': adaptedNoUnnecessaryInt8ArrayFilterSpread,
  'no-unnecessary-int-8-array-find-spread': adaptedNoUnnecessaryInt8ArrayFindSpread,
  'no-unnecessary-int-8-array-every-spread': adaptedNoUnnecessaryInt8ArrayEverySpread,
  'no-unnecessary-int-8-array-some-spread': adaptedNoUnnecessaryInt8ArraySomeSpread,
  'no-unnecessary-int-8-array-for-each-spread': adaptedNoUnnecessaryInt8ArrayForEachSpread,
  'no-unnecessary-uint-8-array-map-spread': adaptedNoUnnecessaryUint8ArrayMapSpread,
  'no-unnecessary-uint-8-array-filter-spread': adaptedNoUnnecessaryUint8ArrayFilterSpread,
  'no-unnecessary-uint-8-array-find-spread': adaptedNoUnnecessaryUint8ArrayFindSpread,
  'no-unnecessary-uint-8-array-every-spread': adaptedNoUnnecessaryUint8ArrayEverySpread,
  'no-unnecessary-uint-8-array-some-spread': adaptedNoUnnecessaryUint8ArraySomeSpread,
  'no-unnecessary-uint-8-array-for-each-spread': adaptedNoUnnecessaryUint8ArrayForEachSpread,
  'no-unnecessary-uint-8-clamped-array-map-spread': adaptedNoUnnecessaryUint8ClampedArrayMapSpread,
  'no-unnecessary-uint-8-clamped-array-filter-spread': adaptedNoUnnecessaryUint8ClampedArrayFilterSpread,
  'no-unnecessary-uint-8-clamped-array-find-spread': adaptedNoUnnecessaryUint8ClampedArrayFindSpread,
  'no-unnecessary-uint-8-clamped-array-every-spread': adaptedNoUnnecessaryUint8ClampedArrayEverySpread,
  'no-unnecessary-uint-8-clamped-array-some-spread': adaptedNoUnnecessaryUint8ClampedArraySomeSpread,
  'no-unnecessary-uint-8-clamped-array-for-each-spread': adaptedNoUnnecessaryUint8ClampedArrayForEachSpread,
  'no-unnecessary-int-16-array-map-spread': adaptedNoUnnecessaryInt16ArrayMapSpread,
  'no-unnecessary-int-16-array-filter-spread': adaptedNoUnnecessaryInt16ArrayFilterSpread,
  'no-unnecessary-int-16-array-find-spread': adaptedNoUnnecessaryInt16ArrayFindSpread,
  'no-unnecessary-int-16-array-every-spread': adaptedNoUnnecessaryInt16ArrayEverySpread,
  'no-unnecessary-int-16-array-some-spread': adaptedNoUnnecessaryInt16ArraySomeSpread,
  'no-unnecessary-int-16-array-for-each-spread': adaptedNoUnnecessaryInt16ArrayForEachSpread,
  'no-unnecessary-uint-16-array-map-spread': adaptedNoUnnecessaryUint16ArrayMapSpread,
  'no-unnecessary-uint-16-array-filter-spread': adaptedNoUnnecessaryUint16ArrayFilterSpread,
  'no-unnecessary-uint-16-array-find-spread': adaptedNoUnnecessaryUint16ArrayFindSpread,
  'no-unnecessary-uint-16-array-every-spread': adaptedNoUnnecessaryUint16ArrayEverySpread,
  'no-unnecessary-uint-16-array-some-spread': adaptedNoUnnecessaryUint16ArraySomeSpread,
  'no-unnecessary-uint-16-array-for-each-spread': adaptedNoUnnecessaryUint16ArrayForEachSpread,
  'no-unnecessary-int-32-array-map-spread': adaptedNoUnnecessaryInt32ArrayMapSpread,
  'no-unnecessary-int-32-array-filter-spread': adaptedNoUnnecessaryInt32ArrayFilterSpread,
  'no-unnecessary-int-32-array-find-spread': adaptedNoUnnecessaryInt32ArrayFindSpread,
  'no-unnecessary-int-32-array-every-spread': adaptedNoUnnecessaryInt32ArrayEverySpread,
  'no-unnecessary-int-32-array-some-spread': adaptedNoUnnecessaryInt32ArraySomeSpread,
  'no-unnecessary-int-32-array-for-each-spread': adaptedNoUnnecessaryInt32ArrayForEachSpread,
  'no-unnecessary-uint-32-array-map-spread': adaptedNoUnnecessaryUint32ArrayMapSpread,
  'no-unnecessary-uint-32-array-filter-spread': adaptedNoUnnecessaryUint32ArrayFilterSpread,
  'no-unnecessary-uint-32-array-find-spread': adaptedNoUnnecessaryUint32ArrayFindSpread,
  'no-unnecessary-uint-32-array-every-spread': adaptedNoUnnecessaryUint32ArrayEverySpread,
  'no-unnecessary-uint-32-array-some-spread': adaptedNoUnnecessaryUint32ArraySomeSpread,
  'no-unnecessary-uint-32-array-for-each-spread': adaptedNoUnnecessaryUint32ArrayForEachSpread,
  'no-unnecessary-float-32-array-map-spread': adaptedNoUnnecessaryFloat32ArrayMapSpread,
  'no-unnecessary-float-32-array-filter-spread': adaptedNoUnnecessaryFloat32ArrayFilterSpread,
  'no-unnecessary-float-32-array-find-spread': adaptedNoUnnecessaryFloat32ArrayFindSpread,
  'no-unnecessary-float-32-array-every-spread': adaptedNoUnnecessaryFloat32ArrayEverySpread,
  'no-unnecessary-float-32-array-some-spread': adaptedNoUnnecessaryFloat32ArraySomeSpread,
  'no-unnecessary-float-32-array-for-each-spread': adaptedNoUnnecessaryFloat32ArrayForEachSpread,
  'no-unnecessary-float-64-array-map-spread': adaptedNoUnnecessaryFloat64ArrayMapSpread,
  'no-unnecessary-float-64-array-filter-spread': adaptedNoUnnecessaryFloat64ArrayFilterSpread,
  'no-unnecessary-float-64-array-find-spread': adaptedNoUnnecessaryFloat64ArrayFindSpread,
  'no-unnecessary-float-64-array-every-spread': adaptedNoUnnecessaryFloat64ArrayEverySpread,
  'no-unnecessary-float-64-array-some-spread': adaptedNoUnnecessaryFloat64ArraySomeSpread,
  'no-unnecessary-float-64-array-for-each-spread': adaptedNoUnnecessaryFloat64ArrayForEachSpread,
  'no-unnecessary-big-int-64-array-map-spread': adaptedNoUnnecessaryBigInt64ArrayMapSpread,
  'no-unnecessary-big-int-64-array-filter-spread': adaptedNoUnnecessaryBigInt64ArrayFilterSpread,
  'no-unnecessary-big-int-64-array-find-spread': adaptedNoUnnecessaryBigInt64ArrayFindSpread,
  'no-unnecessary-big-int-64-array-every-spread': adaptedNoUnnecessaryBigInt64ArrayEverySpread,
  'no-unnecessary-big-int-64-array-some-spread': adaptedNoUnnecessaryBigInt64ArraySomeSpread,
  'no-unnecessary-big-int-64-array-for-each-spread': adaptedNoUnnecessaryBigInt64ArrayForEachSpread,
  'no-unnecessary-big-uint-64-array-map-spread': adaptedNoUnnecessaryBigUint64ArrayMapSpread,
  'no-unnecessary-big-uint-64-array-filter-spread': adaptedNoUnnecessaryBigUint64ArrayFilterSpread,
  'no-unnecessary-big-uint-64-array-find-spread': adaptedNoUnnecessaryBigUint64ArrayFindSpread,
  'no-unnecessary-big-uint-64-array-every-spread': adaptedNoUnnecessaryBigUint64ArrayEverySpread,
  'no-unnecessary-big-uint-64-array-some-spread': adaptedNoUnnecessaryBigUint64ArraySomeSpread,
  'no-unnecessary-big-uint-64-array-for-each-spread': adaptedNoUnnecessaryBigUint64ArrayForEachSpread,
  'no-unnecessary-int-8-array-reduce-spread': adaptedNoUnnecessaryInt8ArrayReduceSpread,
  'no-unnecessary-int-8-array-reduce-right-spread': adaptedNoUnnecessaryInt8ArrayReduceRightSpread,
  'no-unnecessary-int-8-array-find-index-spread': adaptedNoUnnecessaryInt8ArrayFindIndexSpread,
  'no-unnecessary-int-8-array-find-last-spread': adaptedNoUnnecessaryInt8ArrayFindLastSpread,
  'no-unnecessary-int-8-array-find-last-index-spread': adaptedNoUnnecessaryInt8ArrayFindLastIndexSpread,
  'no-unnecessary-int-8-array-includes-spread': adaptedNoUnnecessaryInt8ArrayIncludesSpread,
  'no-unnecessary-int-8-array-index-of-spread': adaptedNoUnnecessaryInt8ArrayIndexOfSpread,
  'no-unnecessary-int-8-array-last-index-of-spread': adaptedNoUnnecessaryInt8ArrayLastIndexOfSpread,
  'no-unnecessary-int-8-array-join-spread': adaptedNoUnnecessaryInt8ArrayJoinSpread,
  'no-unnecessary-int-8-array-to-locale-string-spread': adaptedNoUnnecessaryInt8ArrayToLocaleStringSpread,
  'no-unnecessary-int-8-array-to-string-spread': adaptedNoUnnecessaryInt8ArrayToStringSpread,
  'no-unnecessary-uint-8-array-reduce-spread': adaptedNoUnnecessaryUint8ArrayReduceSpread,
  'no-unnecessary-uint-8-array-reduce-right-spread': adaptedNoUnnecessaryUint8ArrayReduceRightSpread,
  'no-unnecessary-uint-8-array-find-index-spread': adaptedNoUnnecessaryUint8ArrayFindIndexSpread,
  'no-unnecessary-uint-8-array-find-last-spread': adaptedNoUnnecessaryUint8ArrayFindLastSpread,
  'no-unnecessary-uint-8-array-find-last-index-spread': adaptedNoUnnecessaryUint8ArrayFindLastIndexSpread,
  'no-unnecessary-uint-8-array-includes-spread': adaptedNoUnnecessaryUint8ArrayIncludesSpread,
  'no-unnecessary-uint-8-array-index-of-spread': adaptedNoUnnecessaryUint8ArrayIndexOfSpread,
  'no-unnecessary-uint-8-array-last-index-of-spread': adaptedNoUnnecessaryUint8ArrayLastIndexOfSpread,
  'no-unnecessary-uint-8-array-join-spread': adaptedNoUnnecessaryUint8ArrayJoinSpread,
  'no-unnecessary-uint-8-array-to-locale-string-spread': adaptedNoUnnecessaryUint8ArrayToLocaleStringSpread,
  'no-unnecessary-uint-8-array-to-string-spread': adaptedNoUnnecessaryUint8ArrayToStringSpread,
  'no-unnecessary-uint-8-clamped-array-reduce-spread': adaptedNoUnnecessaryUint8ClampedArrayReduceSpread,
  'no-unnecessary-uint-8-clamped-array-reduce-right-spread': adaptedNoUnnecessaryUint8ClampedArrayReduceRightSpread,
  'no-unnecessary-uint-8-clamped-array-find-index-spread': adaptedNoUnnecessaryUint8ClampedArrayFindIndexSpread,
  'no-unnecessary-uint-8-clamped-array-find-last-spread': adaptedNoUnnecessaryUint8ClampedArrayFindLastSpread,
  'no-unnecessary-uint-8-clamped-array-find-last-index-spread': adaptedNoUnnecessaryUint8ClampedArrayFindLastIndexSpread,
  'no-unnecessary-uint-8-clamped-array-includes-spread': adaptedNoUnnecessaryUint8ClampedArrayIncludesSpread,
  'no-unnecessary-uint-8-clamped-array-index-of-spread': adaptedNoUnnecessaryUint8ClampedArrayIndexOfSpread,
  'no-unnecessary-uint-8-clamped-array-last-index-of-spread': adaptedNoUnnecessaryUint8ClampedArrayLastIndexOfSpread,
  'no-unnecessary-uint-8-clamped-array-join-spread': adaptedNoUnnecessaryUint8ClampedArrayJoinSpread,
  'no-unnecessary-uint-8-clamped-array-to-locale-string-spread': adaptedNoUnnecessaryUint8ClampedArrayToLocaleStringSpread,
  'no-unnecessary-uint-8-clamped-array-to-string-spread': adaptedNoUnnecessaryUint8ClampedArrayToStringSpread,
  'no-unnecessary-int-16-array-reduce-spread': adaptedNoUnnecessaryInt16ArrayReduceSpread,
  'no-unnecessary-int-16-array-reduce-right-spread': adaptedNoUnnecessaryInt16ArrayReduceRightSpread,
  'no-unnecessary-int-16-array-find-index-spread': adaptedNoUnnecessaryInt16ArrayFindIndexSpread,
  'no-unnecessary-int-16-array-find-last-spread': adaptedNoUnnecessaryInt16ArrayFindLastSpread,
  'no-unnecessary-int-16-array-find-last-index-spread': adaptedNoUnnecessaryInt16ArrayFindLastIndexSpread,
  'no-unnecessary-int-16-array-includes-spread': adaptedNoUnnecessaryInt16ArrayIncludesSpread,
  'no-unnecessary-int-16-array-index-of-spread': adaptedNoUnnecessaryInt16ArrayIndexOfSpread,
  'no-unnecessary-int-16-array-last-index-of-spread': adaptedNoUnnecessaryInt16ArrayLastIndexOfSpread,
  'no-unnecessary-int-16-array-join-spread': adaptedNoUnnecessaryInt16ArrayJoinSpread,
  'no-unnecessary-int-16-array-to-locale-string-spread': adaptedNoUnnecessaryInt16ArrayToLocaleStringSpread,
  'no-unnecessary-int-16-array-to-string-spread': adaptedNoUnnecessaryInt16ArrayToStringSpread,
  'no-unnecessary-uint-16-array-reduce-spread': adaptedNoUnnecessaryUint16ArrayReduceSpread,
  'no-unnecessary-uint-16-array-reduce-right-spread': adaptedNoUnnecessaryUint16ArrayReduceRightSpread,
  'no-unnecessary-uint-16-array-find-index-spread': adaptedNoUnnecessaryUint16ArrayFindIndexSpread,
  'no-unnecessary-uint-16-array-find-last-spread': adaptedNoUnnecessaryUint16ArrayFindLastSpread,
  'no-unnecessary-uint-16-array-find-last-index-spread': adaptedNoUnnecessaryUint16ArrayFindLastIndexSpread,
  'no-unnecessary-uint-16-array-includes-spread': adaptedNoUnnecessaryUint16ArrayIncludesSpread,
  'no-unnecessary-uint-16-array-index-of-spread': adaptedNoUnnecessaryUint16ArrayIndexOfSpread,
  'no-unnecessary-uint-16-array-last-index-of-spread': adaptedNoUnnecessaryUint16ArrayLastIndexOfSpread,
  'no-unnecessary-uint-16-array-join-spread': adaptedNoUnnecessaryUint16ArrayJoinSpread,
  'no-unnecessary-uint-16-array-to-locale-string-spread': adaptedNoUnnecessaryUint16ArrayToLocaleStringSpread,
  'no-unnecessary-uint-16-array-to-string-spread': adaptedNoUnnecessaryUint16ArrayToStringSpread,
  'no-unnecessary-int-32-array-reduce-spread': adaptedNoUnnecessaryInt32ArrayReduceSpread,
  'no-unnecessary-int-32-array-reduce-right-spread': adaptedNoUnnecessaryInt32ArrayReduceRightSpread,
  'no-unnecessary-int-32-array-find-index-spread': adaptedNoUnnecessaryInt32ArrayFindIndexSpread,
  'no-unnecessary-int-32-array-find-last-spread': adaptedNoUnnecessaryInt32ArrayFindLastSpread,
  'no-unnecessary-int-32-array-find-last-index-spread': adaptedNoUnnecessaryInt32ArrayFindLastIndexSpread,
  'no-unnecessary-int-32-array-includes-spread': adaptedNoUnnecessaryInt32ArrayIncludesSpread,
  'no-unnecessary-int-32-array-index-of-spread': adaptedNoUnnecessaryInt32ArrayIndexOfSpread,
  'no-unnecessary-int-32-array-last-index-of-spread': adaptedNoUnnecessaryInt32ArrayLastIndexOfSpread,
  'no-unnecessary-int-32-array-join-spread': adaptedNoUnnecessaryInt32ArrayJoinSpread,
  'no-unnecessary-int-32-array-to-locale-string-spread': adaptedNoUnnecessaryInt32ArrayToLocaleStringSpread,
  'no-unnecessary-int-32-array-to-string-spread': adaptedNoUnnecessaryInt32ArrayToStringSpread,
  'no-unnecessary-uint-32-array-reduce-spread': adaptedNoUnnecessaryUint32ArrayReduceSpread,
  'no-unnecessary-uint-32-array-reduce-right-spread': adaptedNoUnnecessaryUint32ArrayReduceRightSpread,
  'no-unnecessary-uint-32-array-find-index-spread': adaptedNoUnnecessaryUint32ArrayFindIndexSpread,
  'no-unnecessary-uint-32-array-find-last-spread': adaptedNoUnnecessaryUint32ArrayFindLastSpread,
  'no-unnecessary-uint-32-array-find-last-index-spread': adaptedNoUnnecessaryUint32ArrayFindLastIndexSpread,
  'no-unnecessary-uint-32-array-includes-spread': adaptedNoUnnecessaryUint32ArrayIncludesSpread,
  'no-unnecessary-uint-32-array-index-of-spread': adaptedNoUnnecessaryUint32ArrayIndexOfSpread,
  'no-unnecessary-uint-32-array-last-index-of-spread': adaptedNoUnnecessaryUint32ArrayLastIndexOfSpread,
  'no-unnecessary-uint-32-array-join-spread': adaptedNoUnnecessaryUint32ArrayJoinSpread,
  'no-unnecessary-uint-32-array-to-locale-string-spread': adaptedNoUnnecessaryUint32ArrayToLocaleStringSpread,
  'no-unnecessary-uint-32-array-to-string-spread': adaptedNoUnnecessaryUint32ArrayToStringSpread,
  'no-unnecessary-float-32-array-reduce-spread': adaptedNoUnnecessaryFloat32ArrayReduceSpread,
  'no-unnecessary-float-32-array-reduce-right-spread': adaptedNoUnnecessaryFloat32ArrayReduceRightSpread,
  'no-unnecessary-float-32-array-find-index-spread': adaptedNoUnnecessaryFloat32ArrayFindIndexSpread,
  'no-unnecessary-float-32-array-find-last-spread': adaptedNoUnnecessaryFloat32ArrayFindLastSpread,
  'no-unnecessary-float-32-array-find-last-index-spread': adaptedNoUnnecessaryFloat32ArrayFindLastIndexSpread,
  'no-unnecessary-float-32-array-includes-spread': adaptedNoUnnecessaryFloat32ArrayIncludesSpread,
  'no-unnecessary-float-32-array-index-of-spread': adaptedNoUnnecessaryFloat32ArrayIndexOfSpread,
  'no-unnecessary-float-32-array-last-index-of-spread': adaptedNoUnnecessaryFloat32ArrayLastIndexOfSpread,
  'no-unnecessary-float-32-array-join-spread': adaptedNoUnnecessaryFloat32ArrayJoinSpread,
  'no-unnecessary-float-32-array-to-locale-string-spread': adaptedNoUnnecessaryFloat32ArrayToLocaleStringSpread,
  'no-unnecessary-float-32-array-to-string-spread': adaptedNoUnnecessaryFloat32ArrayToStringSpread,
  'no-unnecessary-float-64-array-reduce-spread': adaptedNoUnnecessaryFloat64ArrayReduceSpread,
  'no-unnecessary-float-64-array-reduce-right-spread': adaptedNoUnnecessaryFloat64ArrayReduceRightSpread,
  'no-unnecessary-float-64-array-find-index-spread': adaptedNoUnnecessaryFloat64ArrayFindIndexSpread,
  'no-unnecessary-float-64-array-find-last-spread': adaptedNoUnnecessaryFloat64ArrayFindLastSpread,
  'no-unnecessary-float-64-array-find-last-index-spread': adaptedNoUnnecessaryFloat64ArrayFindLastIndexSpread,
  'no-unnecessary-float-64-array-includes-spread': adaptedNoUnnecessaryFloat64ArrayIncludesSpread,
  'no-unnecessary-float-64-array-index-of-spread': adaptedNoUnnecessaryFloat64ArrayIndexOfSpread,
  'no-unnecessary-float-64-array-last-index-of-spread': adaptedNoUnnecessaryFloat64ArrayLastIndexOfSpread,
  'no-unnecessary-float-64-array-join-spread': adaptedNoUnnecessaryFloat64ArrayJoinSpread,
  'no-unnecessary-float-64-array-to-locale-string-spread': adaptedNoUnnecessaryFloat64ArrayToLocaleStringSpread,
  'no-unnecessary-float-64-array-to-string-spread': adaptedNoUnnecessaryFloat64ArrayToStringSpread,
  'no-unnecessary-big-int-64-array-reduce-spread': adaptedNoUnnecessaryBigInt64ArrayReduceSpread,
  'no-unnecessary-big-int-64-array-reduce-right-spread': adaptedNoUnnecessaryBigInt64ArrayReduceRightSpread,
  'no-unnecessary-big-int-64-array-find-index-spread': adaptedNoUnnecessaryBigInt64ArrayFindIndexSpread,
  'no-unnecessary-big-int-64-array-find-last-spread': adaptedNoUnnecessaryBigInt64ArrayFindLastSpread,
  'no-unnecessary-big-int-64-array-find-last-index-spread': adaptedNoUnnecessaryBigInt64ArrayFindLastIndexSpread,
  'no-unnecessary-big-int-64-array-includes-spread': adaptedNoUnnecessaryBigInt64ArrayIncludesSpread,
  'no-unnecessary-big-int-64-array-index-of-spread': adaptedNoUnnecessaryBigInt64ArrayIndexOfSpread,
  'no-unnecessary-big-int-64-array-last-index-of-spread': adaptedNoUnnecessaryBigInt64ArrayLastIndexOfSpread,
  'no-unnecessary-big-int-64-array-join-spread': adaptedNoUnnecessaryBigInt64ArrayJoinSpread,
  'no-unnecessary-big-int-64-array-to-locale-string-spread': adaptedNoUnnecessaryBigInt64ArrayToLocaleStringSpread,
  'no-unnecessary-big-int-64-array-to-string-spread': adaptedNoUnnecessaryBigInt64ArrayToStringSpread,
  'no-unnecessary-big-uint-64-array-reduce-spread': adaptedNoUnnecessaryBigUint64ArrayReduceSpread,
  'no-unnecessary-big-uint-64-array-reduce-right-spread': adaptedNoUnnecessaryBigUint64ArrayReduceRightSpread,
  'no-unnecessary-big-uint-64-array-find-index-spread': adaptedNoUnnecessaryBigUint64ArrayFindIndexSpread,
  'no-unnecessary-big-uint-64-array-find-last-spread': adaptedNoUnnecessaryBigUint64ArrayFindLastSpread,
  'no-unnecessary-big-uint-64-array-find-last-index-spread': adaptedNoUnnecessaryBigUint64ArrayFindLastIndexSpread,
  'no-unnecessary-big-uint-64-array-includes-spread': adaptedNoUnnecessaryBigUint64ArrayIncludesSpread,
  'no-unnecessary-big-uint-64-array-index-of-spread': adaptedNoUnnecessaryBigUint64ArrayIndexOfSpread,
  'no-unnecessary-big-uint-64-array-last-index-of-spread': adaptedNoUnnecessaryBigUint64ArrayLastIndexOfSpread,
  'no-unnecessary-big-uint-64-array-join-spread': adaptedNoUnnecessaryBigUint64ArrayJoinSpread,
  'no-unnecessary-big-uint-64-array-to-locale-string-spread': adaptedNoUnnecessaryBigUint64ArrayToLocaleStringSpread,
  'no-unnecessary-big-uint-64-array-to-string-spread': adaptedNoUnnecessaryBigUint64ArrayToStringSpread,
  'no-unnecessary-int-8-array-at-spread': adaptedNoUnnecessaryInt8ArrayAtSpread,
  'no-unnecessary-int-8-array-entries-spread': adaptedNoUnnecessaryInt8ArrayEntriesSpread,
  'no-unnecessary-int-8-array-keys-spread': adaptedNoUnnecessaryInt8ArrayKeysSpread,
  'no-unnecessary-int-8-array-values-spread': adaptedNoUnnecessaryInt8ArrayValuesSpread,
  'no-unnecessary-int-8-array-with-spread': adaptedNoUnnecessaryInt8ArrayWithSpread,
  'no-unnecessary-int-8-array-to-reversed-spread': adaptedNoUnnecessaryInt8ArrayToReversedSpread,
  'no-unnecessary-int-8-array-to-sorted-spread': adaptedNoUnnecessaryInt8ArrayToSortedSpread,
  'no-unnecessary-uint-8-array-at-spread': adaptedNoUnnecessaryUint8ArrayAtSpread,
  'no-unnecessary-uint-8-array-entries-spread': adaptedNoUnnecessaryUint8ArrayEntriesSpread,
  'no-unnecessary-uint-8-array-keys-spread': adaptedNoUnnecessaryUint8ArrayKeysSpread,
  'no-unnecessary-uint-8-array-values-spread': adaptedNoUnnecessaryUint8ArrayValuesSpread,
  'no-unnecessary-uint-8-array-with-spread': adaptedNoUnnecessaryUint8ArrayWithSpread,
  'no-unnecessary-uint-8-array-to-reversed-spread': adaptedNoUnnecessaryUint8ArrayToReversedSpread,
  'no-unnecessary-uint-8-array-to-sorted-spread': adaptedNoUnnecessaryUint8ArrayToSortedSpread,
  'no-unnecessary-uint-8-clamped-array-at-spread': adaptedNoUnnecessaryUint8ClampedArrayAtSpread,
  'no-unnecessary-uint-8-clamped-array-entries-spread': adaptedNoUnnecessaryUint8ClampedArrayEntriesSpread,
  'no-unnecessary-uint-8-clamped-array-keys-spread': adaptedNoUnnecessaryUint8ClampedArrayKeysSpread,
  'no-unnecessary-uint-8-clamped-array-values-spread': adaptedNoUnnecessaryUint8ClampedArrayValuesSpread,
  'no-unnecessary-uint-8-clamped-array-with-spread': adaptedNoUnnecessaryUint8ClampedArrayWithSpread,
  'no-unnecessary-uint-8-clamped-array-to-reversed-spread': adaptedNoUnnecessaryUint8ClampedArrayToReversedSpread,
  'no-unnecessary-uint-8-clamped-array-to-sorted-spread': adaptedNoUnnecessaryUint8ClampedArrayToSortedSpread,
  'no-unnecessary-int-16-array-at-spread': adaptedNoUnnecessaryInt16ArrayAtSpread,
  'no-unnecessary-int-16-array-entries-spread': adaptedNoUnnecessaryInt16ArrayEntriesSpread,
  'no-unnecessary-int-16-array-keys-spread': adaptedNoUnnecessaryInt16ArrayKeysSpread,
  'no-unnecessary-int-16-array-values-spread': adaptedNoUnnecessaryInt16ArrayValuesSpread,
  'no-unnecessary-int-16-array-with-spread': adaptedNoUnnecessaryInt16ArrayWithSpread,
  'no-unnecessary-int-16-array-to-reversed-spread': adaptedNoUnnecessaryInt16ArrayToReversedSpread,
  'no-unnecessary-int-16-array-to-sorted-spread': adaptedNoUnnecessaryInt16ArrayToSortedSpread,
  'no-unnecessary-uint-16-array-at-spread': adaptedNoUnnecessaryUint16ArrayAtSpread,
  'no-unnecessary-uint-16-array-entries-spread': adaptedNoUnnecessaryUint16ArrayEntriesSpread,
  'no-unnecessary-uint-16-array-keys-spread': adaptedNoUnnecessaryUint16ArrayKeysSpread,
  'no-unnecessary-uint-16-array-values-spread': adaptedNoUnnecessaryUint16ArrayValuesSpread,
  'no-unnecessary-uint-16-array-with-spread': adaptedNoUnnecessaryUint16ArrayWithSpread,
  'no-unnecessary-uint-16-array-to-reversed-spread': adaptedNoUnnecessaryUint16ArrayToReversedSpread,
  'no-unnecessary-uint-16-array-to-sorted-spread': adaptedNoUnnecessaryUint16ArrayToSortedSpread,
  'no-unnecessary-int-32-array-at-spread': adaptedNoUnnecessaryInt32ArrayAtSpread,
  'no-unnecessary-int-32-array-entries-spread': adaptedNoUnnecessaryInt32ArrayEntriesSpread,
  'no-unnecessary-int-32-array-keys-spread': adaptedNoUnnecessaryInt32ArrayKeysSpread,
  'no-unnecessary-int-32-array-values-spread': adaptedNoUnnecessaryInt32ArrayValuesSpread,
  'no-unnecessary-int-32-array-with-spread': adaptedNoUnnecessaryInt32ArrayWithSpread,
  'no-unnecessary-int-32-array-to-reversed-spread': adaptedNoUnnecessaryInt32ArrayToReversedSpread,
  'no-unnecessary-int-32-array-to-sorted-spread': adaptedNoUnnecessaryInt32ArrayToSortedSpread,
  'no-unnecessary-uint-32-array-at-spread': adaptedNoUnnecessaryUint32ArrayAtSpread,
  'no-unnecessary-uint-32-array-entries-spread': adaptedNoUnnecessaryUint32ArrayEntriesSpread,
  'no-unnecessary-uint-32-array-keys-spread': adaptedNoUnnecessaryUint32ArrayKeysSpread,
  'no-unnecessary-uint-32-array-values-spread': adaptedNoUnnecessaryUint32ArrayValuesSpread,
  'no-unnecessary-uint-32-array-with-spread': adaptedNoUnnecessaryUint32ArrayWithSpread,
  'no-unnecessary-uint-32-array-to-reversed-spread': adaptedNoUnnecessaryUint32ArrayToReversedSpread,
  'no-unnecessary-uint-32-array-to-sorted-spread': adaptedNoUnnecessaryUint32ArrayToSortedSpread,
  'no-unnecessary-float-32-array-at-spread': adaptedNoUnnecessaryFloat32ArrayAtSpread,
  'no-unnecessary-float-32-array-entries-spread': adaptedNoUnnecessaryFloat32ArrayEntriesSpread,
  'no-unnecessary-float-32-array-keys-spread': adaptedNoUnnecessaryFloat32ArrayKeysSpread,
  'no-unnecessary-float-32-array-values-spread': adaptedNoUnnecessaryFloat32ArrayValuesSpread,
  'no-unnecessary-float-32-array-with-spread': adaptedNoUnnecessaryFloat32ArrayWithSpread,
  'no-unnecessary-float-32-array-to-reversed-spread': adaptedNoUnnecessaryFloat32ArrayToReversedSpread,
  'no-unnecessary-float-32-array-to-sorted-spread': adaptedNoUnnecessaryFloat32ArrayToSortedSpread,
  'no-unnecessary-float-64-array-at-spread': adaptedNoUnnecessaryFloat64ArrayAtSpread,
  'no-unnecessary-float-64-array-entries-spread': adaptedNoUnnecessaryFloat64ArrayEntriesSpread,
  'no-unnecessary-float-64-array-keys-spread': adaptedNoUnnecessaryFloat64ArrayKeysSpread,
  'no-unnecessary-float-64-array-values-spread': adaptedNoUnnecessaryFloat64ArrayValuesSpread,
  'no-unnecessary-float-64-array-with-spread': adaptedNoUnnecessaryFloat64ArrayWithSpread,
  'no-unnecessary-float-64-array-to-reversed-spread': adaptedNoUnnecessaryFloat64ArrayToReversedSpread,
  'no-unnecessary-float-64-array-to-sorted-spread': adaptedNoUnnecessaryFloat64ArrayToSortedSpread,
  'no-unnecessary-big-int-64-array-at-spread': adaptedNoUnnecessaryBigInt64ArrayAtSpread,
  'no-unnecessary-big-int-64-array-entries-spread': adaptedNoUnnecessaryBigInt64ArrayEntriesSpread,
  'no-unnecessary-big-int-64-array-keys-spread': adaptedNoUnnecessaryBigInt64ArrayKeysSpread,
  'no-unnecessary-big-int-64-array-values-spread': adaptedNoUnnecessaryBigInt64ArrayValuesSpread,
  'no-unnecessary-big-int-64-array-with-spread': adaptedNoUnnecessaryBigInt64ArrayWithSpread,
  'no-unnecessary-big-int-64-array-to-reversed-spread': adaptedNoUnnecessaryBigInt64ArrayToReversedSpread,
  'no-unnecessary-big-int-64-array-to-sorted-spread': adaptedNoUnnecessaryBigInt64ArrayToSortedSpread,
  'no-unnecessary-big-uint-64-array-at-spread': adaptedNoUnnecessaryBigUint64ArrayAtSpread,
  'no-unnecessary-big-uint-64-array-entries-spread': adaptedNoUnnecessaryBigUint64ArrayEntriesSpread,
  'no-unnecessary-big-uint-64-array-keys-spread': adaptedNoUnnecessaryBigUint64ArrayKeysSpread,
  'no-unnecessary-big-uint-64-array-values-spread': adaptedNoUnnecessaryBigUint64ArrayValuesSpread,
  'no-unnecessary-big-uint-64-array-with-spread': adaptedNoUnnecessaryBigUint64ArrayWithSpread,
  'no-unnecessary-big-uint-64-array-to-reversed-spread': adaptedNoUnnecessaryBigUint64ArrayToReversedSpread,
  'no-unnecessary-big-uint-64-array-to-sorted-spread': adaptedNoUnnecessaryBigUint64ArrayToSortedSpread,
  'no-unnecessary-int-8-array-from-spread': adaptedNoUnnecessaryInt8ArrayFromSpread,
  'no-unnecessary-int-8-array-of-spread': adaptedNoUnnecessaryInt8ArrayOfSpread,
  'no-unnecessary-uint-8-array-from-spread': adaptedNoUnnecessaryUint8ArrayFromSpread,
  'no-unnecessary-uint-8-array-of-spread': adaptedNoUnnecessaryUint8ArrayOfSpread,
  'no-unnecessary-uint-8-clamped-array-from-spread': adaptedNoUnnecessaryUint8ClampedArrayFromSpread,
  'no-unnecessary-uint-8-clamped-array-of-spread': adaptedNoUnnecessaryUint8ClampedArrayOfSpread,
  'no-unnecessary-int-16-array-from-spread': adaptedNoUnnecessaryInt16ArrayFromSpread,
  'no-unnecessary-int-16-array-of-spread': adaptedNoUnnecessaryInt16ArrayOfSpread,
  'no-unnecessary-uint-16-array-from-spread': adaptedNoUnnecessaryUint16ArrayFromSpread,
  'no-unnecessary-uint-16-array-of-spread': adaptedNoUnnecessaryUint16ArrayOfSpread,
  'no-unnecessary-int-32-array-from-spread': adaptedNoUnnecessaryInt32ArrayFromSpread,
  'no-unnecessary-int-32-array-of-spread': adaptedNoUnnecessaryInt32ArrayOfSpread,
  'no-unnecessary-uint-32-array-from-spread': adaptedNoUnnecessaryUint32ArrayFromSpread,
  'no-unnecessary-uint-32-array-of-spread': adaptedNoUnnecessaryUint32ArrayOfSpread,
  'no-unnecessary-float-32-array-from-spread': adaptedNoUnnecessaryFloat32ArrayFromSpread,
  'no-unnecessary-float-32-array-of-spread': adaptedNoUnnecessaryFloat32ArrayOfSpread,
  'no-unnecessary-float-64-array-from-spread': adaptedNoUnnecessaryFloat64ArrayFromSpread,
  'no-unnecessary-float-64-array-of-spread': adaptedNoUnnecessaryFloat64ArrayOfSpread,
  'no-unnecessary-big-int-64-array-from-spread': adaptedNoUnnecessaryBigInt64ArrayFromSpread,
  'no-unnecessary-big-int-64-array-of-spread': adaptedNoUnnecessaryBigInt64ArrayOfSpread,
  'no-unnecessary-big-uint-64-array-from-spread': adaptedNoUnnecessaryBigUint64ArrayFromSpread,
  'no-unnecessary-big-uint-64-array-of-spread': adaptedNoUnnecessaryBigUint64ArrayOfSpread,
  'no-unnecessary-set-timeout-spread': adaptedNoUnnecessarySetTimeoutSpread,
  'no-unnecessary-set-interval-spread': adaptedNoUnnecessarySetIntervalSpread,
  'no-unnecessary-clear-timeout-spread': adaptedNoUnnecessaryClearTimeoutSpread,
  'no-unnecessary-clear-interval-spread': adaptedNoUnnecessaryClearIntervalSpread,
  'no-unnecessary-request-animation-frame-spread': adaptedNoUnnecessaryRequestAnimationFrameSpread,
  'no-unnecessary-cancel-animation-frame-spread': adaptedNoUnnecessaryCancelAnimationFrameSpread,
  'no-unnecessary-request-idle-callback-spread': adaptedNoUnnecessaryRequestIdleCallbackSpread,
  'no-unnecessary-cancel-idle-callback-spread': adaptedNoUnnecessaryCancelIdleCallbackSpread,
  'no-unnecessary-queue-microtask-spread': adaptedNoUnnecessaryQueueMicrotaskSpread,
  'no-unnecessary-structured-clone-spread': adaptedNoUnnecessaryStructuredCloneSpread,
  'no-unnecessary-atob-spread': adaptedNoUnnecessaryAtobSpread,
  'no-unnecessary-btoa-spread': adaptedNoUnnecessaryBtoaSpread,
  'no-unnecessary-fetch-spread': adaptedNoUnnecessaryFetchSpread,
  'no-unnecessary-alert-spread': adaptedNoUnnecessaryAlertSpread,
  'no-unnecessary-confirm-spread': adaptedNoUnnecessaryConfirmSpread,
  'no-unnecessary-prompt-spread': adaptedNoUnnecessaryPromptSpread,
  'no-unnecessary-print-spread': adaptedNoUnnecessaryPrintSpread,
  'no-unnecessary-report-error-spread': adaptedNoUnnecessaryReportErrorSpread,
  'no-unnecessary-error-spread': adaptedNoUnnecessaryErrorSpread,
  'no-unnecessary-eval-error-spread': adaptedNoUnnecessaryEvalErrorSpread,
  'no-unnecessary-range-error-spread': adaptedNoUnnecessaryRangeErrorSpread,
  'no-unnecessary-reference-error-spread': adaptedNoUnnecessaryReferenceErrorSpread,
  'no-unnecessary-syntax-error-spread': adaptedNoUnnecessarySyntaxErrorSpread,
  'no-unnecessary-type-error-spread': adaptedNoUnnecessaryTypeErrorSpread,
  'no-unnecessary-uri-error-spread': adaptedNoUnnecessaryUriErrorSpread,
  'no-unnecessary-aggregate-error-spread': adaptedNoUnnecessaryAggregateErrorSpread,
  'no-unnecessary-map-spread': adaptedNoUnnecessaryMapSpread,
  'no-unnecessary-set-spread': adaptedNoUnnecessarySetSpread,
  'no-unnecessary-weak-map-spread': adaptedNoUnnecessaryWeakMapSpread,
  'no-unnecessary-weak-set-spread': adaptedNoUnnecessaryWeakSetSpread,
  'no-unnecessary-weak-ref-spread': adaptedNoUnnecessaryWeakRefSpread,
  'no-unnecessary-finalization-registry-spread': adaptedNoUnnecessaryFinalizationRegistrySpread,
  'no-unnecessary-promise-spread': adaptedNoUnnecessaryPromiseSpread,
  'no-unnecessary-array-buffer-spread': adaptedNoUnnecessaryArrayBufferSpread,
  'no-unnecessary-shared-array-buffer-spread': adaptedNoUnnecessarySharedArrayBufferSpread,
  'no-unnecessary-data-view-spread': adaptedNoUnnecessaryDataViewSpread,
  'no-unnecessary-date-spread': adaptedNoUnnecessaryDateSpread,
  'no-unnecessary-regexp-spread': adaptedNoUnnecessaryRegexpSpread,
  'no-unnecessary-image-spread': adaptedNoUnnecessaryImageSpread,
  'no-unnecessary-option-spread': adaptedNoUnnecessaryOptionSpread,
  'no-unnecessary-audio-spread': adaptedNoUnnecessaryAudioSpread,
  'no-unnecessary-headers-spread': adaptedNoUnnecessaryHeadersSpread,
  'no-unnecessary-request-spread': adaptedNoUnnecessaryRequestSpread,
  'no-unnecessary-response-spread': adaptedNoUnnecessaryResponseSpread,
  'no-unnecessary-form-data-spread': adaptedNoUnnecessaryFormDataSpread,
  'no-unnecessary-url-spread': adaptedNoUnnecessaryUrlSpread,
  'no-unnecessary-url-search-params-spread': adaptedNoUnnecessaryUrlSearchParamsSpread,
  'no-unnecessary-text-decoder-spread': adaptedNoUnnecessaryTextDecoderSpread,
  'no-unnecessary-text-encoder-spread': adaptedNoUnnecessaryTextEncoderSpread,
  'no-unnecessary-blob-spread': adaptedNoUnnecessaryBlobSpread,
  'no-unnecessary-file-spread': adaptedNoUnnecessaryFileSpread,
  'no-unnecessary-file-reader-spread': adaptedNoUnnecessaryFileReaderSpread,
  'no-unnecessary-image-data-spread': adaptedNoUnnecessaryImageDataSpread,
  'no-unnecessary-dom-rect-spread': adaptedNoUnnecessaryDomRectSpread,
  'no-unnecessary-css-style-declaration-spread': adaptedNoUnnecessaryCssStyleDeclarationSpread,
  'no-unnecessary-mutation-observer-spread': adaptedNoUnnecessaryMutationObserverSpread,
  'no-unnecessary-resize-observer-spread': adaptedNoUnnecessaryResizeObserverSpread,
  'no-unnecessary-intersection-observer-spread': adaptedNoUnnecessaryIntersectionObserverSpread,
  'no-unnecessary-performance-observer-spread': adaptedNoUnnecessaryPerformanceObserverSpread,
  'no-unnecessary-abort-controller-spread': adaptedNoUnnecessaryAbortControllerSpread,
  'no-unnecessary-abort-signal-spread': adaptedNoUnnecessaryAbortSignalSpread,
  'no-unnecessary-broadcast-channel-spread': adaptedNoUnnecessaryBroadcastChannelSpread,
  'no-unnecessary-message-channel-spread': adaptedNoUnnecessaryMessageChannelSpread,
  'no-unnecessary-worker-spread': adaptedNoUnnecessaryWorkerSpread,
  'no-unnecessary-event-spread': adaptedNoUnnecessaryEventSpread,
  'no-unnecessary-custom-event-spread': adaptedNoUnnecessaryCustomEventSpread,
  'no-unnecessary-dom-parser-spread': adaptedNoUnnecessaryDomParserSpread,
  'no-unnecessary-xml-http-request-spread': adaptedNoUnnecessaryXmlHttpRequestSpread,
  'no-unnecessary-document-create-element-spread': adaptedNoUnnecessaryDocumentCreateElementSpread,
  'no-unnecessary-document-create-text-node-spread': adaptedNoUnnecessaryDocumentCreateTextNodeSpread,
  'no-unnecessary-document-create-comment-spread': adaptedNoUnnecessaryDocumentCreateCommentSpread,
  'no-unnecessary-document-create-document-fragment-spread': adaptedNoUnnecessaryDocumentCreateDocumentFragmentSpread,
  'no-unnecessary-document-create-attribute-spread': adaptedNoUnnecessaryDocumentCreateAttributeSpread,
  'no-unnecessary-document-create-event-spread': adaptedNoUnnecessaryDocumentCreateEventSpread,
  'no-unnecessary-document-create-tree-walker-spread': adaptedNoUnnecessaryDocumentCreateTreeWalkerSpread,
  'no-unnecessary-document-create-node-iterator-spread': adaptedNoUnnecessaryDocumentCreateNodeIteratorSpread,
  'no-unnecessary-document-create-range-spread': adaptedNoUnnecessaryDocumentCreateRangeSpread,
  'no-unnecessary-document-get-element-by-id-spread': adaptedNoUnnecessaryDocumentGetElementByIdSpread,
  'no-unnecessary-document-query-selector-spread': adaptedNoUnnecessaryDocumentQuerySelectorSpread,
  'no-unnecessary-document-query-selector-all-spread': adaptedNoUnnecessaryDocumentQuerySelectorAllSpread,
  'no-unnecessary-document-get-elements-by-class-name-spread': adaptedNoUnnecessaryDocumentGetElementsByClassNameSpread,
  'no-unnecessary-document-get-elements-by-tag-name-spread': adaptedNoUnnecessaryDocumentGetElementsByTagNameSpread,
  'no-unnecessary-document-get-elements-by-name-spread': adaptedNoUnnecessaryDocumentGetElementsByNameSpread,
  'no-unnecessary-document-adopt-node-spread': adaptedNoUnnecessaryDocumentAdoptNodeSpread,
  'no-unnecessary-document-import-node-spread': adaptedNoUnnecessaryDocumentImportNodeSpread,
  'no-unnecessary-document-write-spread': adaptedNoUnnecessaryDocumentWriteSpread,
  'no-unnecessary-document-write-ln-spread': adaptedNoUnnecessaryDocumentWriteLnSpread,
  'no-unnecessary-document-open-spread': adaptedNoUnnecessaryDocumentOpenSpread,
  'no-unnecessary-document-close-spread': adaptedNoUnnecessaryDocumentCloseSpread,
  'no-unnecessary-document-exit-fullscreen-spread': adaptedNoUnnecessaryDocumentExitFullscreenSpread,
  'no-unnecessary-document-exit-picture-in-picture-spread': adaptedNoUnnecessaryDocumentExitPictureInPictureSpread,
  'no-unnecessary-document-exit-pointer-lock-spread': adaptedNoUnnecessaryDocumentExitPointerLockSpread,
  'no-unnecessary-document-has-focus-spread': adaptedNoUnnecessaryDocumentHasFocusSpread,
  'no-unnecessary-document-get-selection-spread': adaptedNoUnnecessaryDocumentGetSelectionSpread,
  'no-unnecessary-document-element-from-point-spread': adaptedNoUnnecessaryDocumentElementFromPointSpread,
  'no-unnecessary-document-elements-from-point-spread': adaptedNoUnnecessaryDocumentElementsFromPointSpread,
  'no-unnecessary-element-query-selector-spread': adaptedNoUnnecessaryElementQuerySelectorSpread,
  'no-unnecessary-element-query-selector-all-spread': adaptedNoUnnecessaryElementQuerySelectorAllSpread,
  'no-unnecessary-element-get-attribute-spread': adaptedNoUnnecessaryElementGetAttributeSpread,
  'no-unnecessary-element-set-attribute-spread': adaptedNoUnnecessaryElementSetAttributeSpread,
  'no-unnecessary-element-remove-attribute-spread': adaptedNoUnnecessaryElementRemoveAttributeSpread,
  'no-unnecessary-element-has-attribute-spread': adaptedNoUnnecessaryElementHasAttributeSpread,
  'no-unnecessary-element-get-attribute-names-spread': adaptedNoUnnecessaryElementGetAttributeNamesSpread,
  'no-unnecessary-element-toggle-attribute-spread': adaptedNoUnnecessaryElementToggleAttributeSpread,
  'no-unnecessary-element-get-elements-by-class-name-spread': adaptedNoUnnecessaryElementGetElementsByClassNameSpread,
  'no-unnecessary-element-get-elements-by-tag-name-spread': adaptedNoUnnecessaryElementGetElementsByTagNameSpread,
  'no-unnecessary-element-closest-spread': adaptedNoUnnecessaryElementClosestSpread,
  'no-unnecessary-element-matches-spread': adaptedNoUnnecessaryElementMatchesSpread,
  'no-unnecessary-element-contains-spread': adaptedNoUnnecessaryElementContainsSpread,
  'no-unnecessary-element-append-child-spread': adaptedNoUnnecessaryElementAppendChildSpread,
  'no-unnecessary-element-remove-child-spread': adaptedNoUnnecessaryElementRemoveChildSpread,
  'no-unnecessary-element-insert-before-spread': adaptedNoUnnecessaryElementInsertBeforeSpread,
  'no-unnecessary-element-replace-child-spread': adaptedNoUnnecessaryElementReplaceChildSpread,
  'no-unnecessary-element-clone-node-spread': adaptedNoUnnecessaryElementCloneNodeSpread,
  'no-unnecessary-element-remove-spread': adaptedNoUnnecessaryElementRemoveSpread,
  'no-unnecessary-element-prepend-spread': adaptedNoUnnecessaryElementPrependSpread,
  'no-unnecessary-element-append-spread': adaptedNoUnnecessaryElementAppendSpread,
  'no-unnecessary-element-before-spread': adaptedNoUnnecessaryElementBeforeSpread,
  'no-unnecessary-element-after-spread': adaptedNoUnnecessaryElementAfterSpread,
  'no-unnecessary-element-replace-with-spread': adaptedNoUnnecessaryElementReplaceWithSpread,
  'no-unnecessary-element-insert-adjacent-html-spread': adaptedNoUnnecessaryElementInsertAdjacentHtmlSpread,
  'no-unnecessary-element-insert-adjacent-element-spread': adaptedNoUnnecessaryElementInsertAdjacentElementSpread,
  'no-unnecessary-element-insert-adjacent-text-spread': adaptedNoUnnecessaryElementInsertAdjacentTextSpread,
  'no-unnecessary-element-get-bounding-client-rect-spread': adaptedNoUnnecessaryElementGetBoundingClientRectSpread,
  'no-unnecessary-element-get-client-rects-spread': adaptedNoUnnecessaryElementGetClientRectsSpread,
  'no-unnecessary-element-scroll-into-view-spread': adaptedNoUnnecessaryElementScrollIntoViewSpread,
  'no-unnecessary-element-scroll-into-view-if-needed-spread': adaptedNoUnnecessaryElementScrollIntoViewIfNeededSpread,
  'no-unnecessary-element-scroll-to-spread': adaptedNoUnnecessaryElementScrollToSpread,
  'no-unnecessary-element-scroll-by-spread': adaptedNoUnnecessaryElementScrollBySpread,
  'no-unnecessary-element-scroll-spread': adaptedNoUnnecessaryElementScrollSpread,
  'no-unnecessary-element-focus-spread': adaptedNoUnnecessaryElementFocusSpread,
  'no-unnecessary-element-blur-spread': adaptedNoUnnecessaryElementBlurSpread,
  'no-unnecessary-element-click-spread': adaptedNoUnnecessaryElementClickSpread,
  'no-unnecessary-element-animate-spread': adaptedNoUnnecessaryElementAnimateSpread,
  'no-unnecessary-element-get-computed-style-spread': adaptedNoUnnecessaryElementGetComputedStyleSpread,
  'no-unnecessary-element-request-fullscreen-spread': adaptedNoUnnecessaryElementRequestFullscreenSpread,
  'no-unnecessary-element-request-pointer-lock-spread': adaptedNoUnnecessaryElementRequestPointerLockSpread,
  'no-unnecessary-element-attach-shadow-spread': adaptedNoUnnecessaryElementAttachShadowSpread,
  'no-unnecessary-local-storage-get-item-spread': adaptedNoUnnecessaryLocalStorageGetItemSpread,
  'no-unnecessary-local-storage-set-item-spread': adaptedNoUnnecessaryLocalStorageSetItemSpread,
  'no-unnecessary-local-storage-remove-item-spread': adaptedNoUnnecessaryLocalStorageRemoveItemSpread,
  'no-unnecessary-local-storage-clear-spread': adaptedNoUnnecessaryLocalStorageClearSpread,
  'no-unnecessary-local-storage-key-spread': adaptedNoUnnecessaryLocalStorageKeySpread,
  'no-unnecessary-session-storage-get-item-spread': adaptedNoUnnecessarySessionStorageGetItemSpread,
  'no-unnecessary-session-storage-set-item-spread': adaptedNoUnnecessarySessionStorageSetItemSpread,
  'no-unnecessary-session-storage-remove-item-spread': adaptedNoUnnecessarySessionStorageRemoveItemSpread,
  'no-unnecessary-session-storage-clear-spread': adaptedNoUnnecessarySessionStorageClearSpread,
  'no-unnecessary-session-storage-key-spread': adaptedNoUnnecessarySessionStorageKeySpread,
  'no-unnecessary-navigator-send-beacon-spread': adaptedNoUnnecessaryNavigatorSendBeaconSpread,
  'no-unnecessary-navigator-vibrate-spread': adaptedNoUnnecessaryNavigatorVibrateSpread,
  'no-unnecessary-navigator-get-battery-spread': adaptedNoUnnecessaryNavigatorGetBatterySpread,
  'no-unnecessary-navigator-geolocation-get-current-position-spread': adaptedNoUnnecessaryNavigatorGeolocationGetCurrentPositionSpread,
  'no-unnecessary-navigator-geolocation-watch-position-spread': adaptedNoUnnecessaryNavigatorGeolocationWatchPositionSpread,
  'no-unnecessary-navigator-geolocation-clear-watch-spread': adaptedNoUnnecessaryNavigatorGeolocationClearWatchSpread,
  'no-unnecessary-navigator-clipboard-read-text-spread': adaptedNoUnnecessaryNavigatorClipboardReadTextSpread,
  'no-unnecessary-navigator-clipboard-write-text-spread': adaptedNoUnnecessaryNavigatorClipboardWriteTextSpread,
  'no-unnecessary-navigator-media-devices-get-user-media-spread': adaptedNoUnnecessaryNavigatorMediaDevicesGetUserMediaSpread,
  'no-unnecessary-navigator-register-protocol-handler-spread': adaptedNoUnnecessaryNavigatorRegisterProtocolHandlerSpread,
  'no-unnecessary-navigator-request-media-key-system-access-spread': adaptedNoUnnecessaryNavigatorRequestMediaKeySystemAccessSpread,
  'no-unnecessary-navigator-can-share-spread': adaptedNoUnnecessaryNavigatorCanShareSpread,
  'no-unnecessary-navigator-share-spread': adaptedNoUnnecessaryNavigatorShareSpread,
  'no-unnecessary-navigator-get-gamepads-spread': adaptedNoUnnecessaryNavigatorGetGamepadsSpread,
  'no-unnecessary-navigator-request-idle-callback-spread': adaptedNoUnnecessaryNavigatorRequestIdleCallbackSpread,
  'no-unnecessary-navigator-cancel-idle-callback-spread': adaptedNoUnnecessaryNavigatorCancelIdleCallbackSpread,
  'no-unnecessary-navigator-java-enabled-spread': adaptedNoUnnecessaryNavigatorJavaEnabledSpread,
  'no-unnecessary-navigator-cookie-enabled-spread': adaptedNoUnnecessaryNavigatorCookieEnabledSpread,
  'no-unnecessary-history-push-state-spread': adaptedNoUnnecessaryHistoryPushStateSpread,
  'no-unnecessary-history-replace-state-spread': adaptedNoUnnecessaryHistoryReplaceStateSpread,
  'no-unnecessary-history-go-spread': adaptedNoUnnecessaryHistoryGoSpread,
  'no-unnecessary-history-back-spread': adaptedNoUnnecessaryHistoryBackSpread,
  'no-unnecessary-history-forward-spread': adaptedNoUnnecessaryHistoryForwardSpread,
  'no-unnecessary-location-assign-spread': adaptedNoUnnecessaryLocationAssignSpread,
  'no-unnecessary-location-reload-spread': adaptedNoUnnecessaryLocationReloadSpread,
  'no-unnecessary-location-replace-spread': adaptedNoUnnecessaryLocationReplaceSpread,
  'no-unnecessary-location-to-string-spread': adaptedNoUnnecessaryLocationToStringSpread,
  'no-unnecessary-performance-now-spread': adaptedNoUnnecessaryPerformanceNowSpread,
  'no-unnecessary-performance-mark-spread': adaptedNoUnnecessaryPerformanceMarkSpread,
  'no-unnecessary-performance-measure-spread': adaptedNoUnnecessaryPerformanceMeasureSpread,
  'no-unnecessary-performance-clear-marks-spread': adaptedNoUnnecessaryPerformanceClearMarksSpread,
  'no-unnecessary-performance-clear-measures-spread': adaptedNoUnnecessaryPerformanceClearMeasuresSpread,
  'no-unnecessary-performance-get-entries-spread': adaptedNoUnnecessaryPerformanceGetEntriesSpread,
  'no-unnecessary-performance-get-entries-by-name-spread': adaptedNoUnnecessaryPerformanceGetEntriesByNameSpread,
  'no-unnecessary-performance-get-entries-by-type-spread': adaptedNoUnnecessaryPerformanceGetEntriesByTypeSpread,
  'no-unnecessary-performance-clear-resource-timings-spread': adaptedNoUnnecessaryPerformanceClearResourceTimingsSpread,
  'no-unnecessary-performance-set-resource-timing-buffer-size-spread': adaptedNoUnnecessaryPerformanceSetResourceTimingBufferSizeSpread,
  'no-unnecessary-screen-orientation-lock-spread': adaptedNoUnnecessaryScreenOrientationLockSpread,
  'no-unnecessary-screen-orientation-unlock-spread': adaptedNoUnnecessaryScreenOrientationUnlockSpread,
  'no-unnecessary-crypto-get-random-values-spread': adaptedNoUnnecessaryCryptoGetRandomValuesSpread,
  'no-unnecessary-crypto-random-uuid-spread': adaptedNoUnnecessaryCryptoRandomUuidSpread,
  'no-unnecessary-indexed-db-open-spread': adaptedNoUnnecessaryIndexedDbOpenSpread,
  'no-unnecessary-indexed-db-delete-database-spread': adaptedNoUnnecessaryIndexedDbDeleteDatabaseSpread,
  'no-unnecessary-indexed-db-cmp-spread': adaptedNoUnnecessaryIndexedDbCmpSpread,
  'no-unnecessary-caches-open-spread': adaptedNoUnnecessaryCachesOpenSpread,
  'no-unnecessary-caches-match-spread': adaptedNoUnnecessaryCachesMatchSpread,
  'no-unnecessary-caches-has-spread': adaptedNoUnnecessaryCachesHasSpread,
  'no-unnecessary-caches-delete-spread': adaptedNoUnnecessaryCachesDeleteSpread,
  'no-unnecessary-caches-keys-spread': adaptedNoUnnecessaryCachesKeysSpread,
  'no-unnecessary-window-open-spread': adaptedNoUnnecessaryWindowOpenSpread,
  'no-unnecessary-window-close-spread': adaptedNoUnnecessaryWindowCloseSpread,
  'no-unnecessary-window-stop-spread': adaptedNoUnnecessaryWindowStopSpread,
  'no-unnecessary-window-focus-spread': adaptedNoUnnecessaryWindowFocusSpread,
  'no-unnecessary-window-blur-spread': adaptedNoUnnecessaryWindowBlurSpread,
  'no-unnecessary-window-scroll-to-spread': adaptedNoUnnecessaryWindowScrollToSpread,
  'no-unnecessary-window-scroll-by-spread': adaptedNoUnnecessaryWindowScrollBySpread,
  'no-unnecessary-window-scroll-spread': adaptedNoUnnecessaryWindowScrollSpread,
  'no-unnecessary-window-print-spread': adaptedNoUnnecessaryWindowPrintSpread,
  'no-unnecessary-window-alert-spread': adaptedNoUnnecessaryWindowAlertSpread,
  'no-unnecessary-window-confirm-spread': adaptedNoUnnecessaryWindowConfirmSpread,
  'no-unnecessary-window-prompt-spread': adaptedNoUnnecessaryWindowPromptSpread,
  'no-unnecessary-window-get-computed-style-spread': adaptedNoUnnecessaryWindowGetComputedStyleSpread,
  'no-unnecessary-window-get-selection-spread': adaptedNoUnnecessaryWindowGetSelectionSpread,
  'no-unnecessary-window-match-media-spread': adaptedNoUnnecessaryWindowMatchMediaSpread,
  'no-unnecessary-window-move-to-spread': adaptedNoUnnecessaryWindowMoveToSpread,
  'no-unnecessary-window-move-by-spread': adaptedNoUnnecessaryWindowMoveBySpread,
  'no-unnecessary-window-resize-to-spread': adaptedNoUnnecessaryWindowResizeToSpread,
  'no-unnecessary-window-resize-by-spread': adaptedNoUnnecessaryWindowResizeBySpread,
  'no-unnecessary-window-post-message-spread': adaptedNoUnnecessaryWindowPostMessageSpread,
  'no-unnecessary-window-atob-spread': adaptedNoUnnecessaryWindowAtobSpread,
  'no-unnecessary-window-btoa-spread': adaptedNoUnnecessaryWindowBtoaSpread,
  'no-unnecessary-window-fetch-spread': adaptedNoUnnecessaryWindowFetchSpread,
  'no-unnecessary-window-create-image-bitmap-spread': adaptedNoUnnecessaryWindowCreateImageBitmapSpread,
  'no-unnecessary-window-queue-microtask-spread': adaptedNoUnnecessaryWindowQueueMicrotaskSpread,
  'no-unnecessary-window-report-error-spread': adaptedNoUnnecessaryWindowReportErrorSpread,
  'no-unnecessary-window-structured-clone-spread': adaptedNoUnnecessaryWindowStructuredCloneSpread,
  'no-unnecessary-window-request-animation-frame-spread': adaptedNoUnnecessaryWindowRequestAnimationFrameSpread,
  'no-unnecessary-window-cancel-animation-frame-spread': adaptedNoUnnecessaryWindowCancelAnimationFrameSpread,
  'no-unnecessary-window-request-idle-callback-spread': adaptedNoUnnecessaryWindowRequestIdleCallbackSpread,
  'no-unnecessary-window-cancel-idle-callback-spread': adaptedNoUnnecessaryWindowCancelIdleCallbackSpread,
  'no-unnecessary-window-set-timeout-spread': adaptedNoUnnecessaryWindowSetTimeoutSpread,
  'no-unnecessary-window-clear-timeout-spread': adaptedNoUnnecessaryWindowClearTimeoutSpread,
  'no-unnecessary-window-set-interval-spread': adaptedNoUnnecessaryWindowSetIntervalSpread,
  'no-unnecessary-window-clear-interval-spread': adaptedNoUnnecessaryWindowClearIntervalSpread,
  'no-unnecessary-process-exit-spread': adaptedNoUnnecessaryProcessExitSpread,
  'no-unnecessary-process-next-tick-spread': adaptedNoUnnecessaryProcessNextTickSpread,
  'no-unnecessary-process-cwd-spread': adaptedNoUnnecessaryProcessCwdSpread,
  'no-unnecessary-process-chdir-spread': adaptedNoUnnecessaryProcessChdirSpread,
  'no-unnecessary-process-env-spread': adaptedNoUnnecessaryProcessEnvSpread,
  'no-unnecessary-process-uptime-spread': adaptedNoUnnecessaryProcessUptimeSpread,
  'no-unnecessary-process-memory-usage-spread': adaptedNoUnnecessaryProcessMemoryUsageSpread,
  'no-unnecessary-process-cpu-usage-spread': adaptedNoUnnecessaryProcessCpuUsageSpread,
  'no-unnecessary-process-kill-spread': adaptedNoUnnecessaryProcessKillSpread,
  'no-unnecessary-process-abort-spread': adaptedNoUnnecessaryProcessAbortSpread,
  'no-unnecessary-process-umask-spread': adaptedNoUnnecessaryProcessUmaskSpread,
  'no-unnecessary-process-getuid-spread': adaptedNoUnnecessaryProcessGetuidSpread,
  'no-unnecessary-process-setuid-spread': adaptedNoUnnecessaryProcessSetuidSpread,
  'no-unnecessary-process-getgid-spread': adaptedNoUnnecessaryProcessGetgidSpread,
  'no-unnecessary-process-setgid-spread': adaptedNoUnnecessaryProcessSetgidSpread,
  'no-unnecessary-process-hrtime-spread': adaptedNoUnnecessaryProcessHrtimeSpread,
  'no-unnecessary-process-argv-spread': adaptedNoUnnecessaryProcessArgvSpread,
  'no-unnecessary-buffer-alloc-spread': adaptedNoUnnecessaryBufferAllocSpread,
  'no-unnecessary-buffer-alloc-unsafe-spread': adaptedNoUnnecessaryBufferAllocUnsafeSpread,
  'no-unnecessary-buffer-alloc-unsafe-slow-spread': adaptedNoUnnecessaryBufferAllocUnsafeSlowSpread,
  'no-unnecessary-buffer-from-spread': adaptedNoUnnecessaryBufferFromSpread,
  'no-unnecessary-buffer-of-spread': adaptedNoUnnecessaryBufferOfSpread,
  'no-unnecessary-buffer-is-buffer-spread': adaptedNoUnnecessaryBufferIsBufferSpread,
  'no-unnecessary-buffer-is-encoding-spread': adaptedNoUnnecessaryBufferIsEncodingSpread,
  'no-unnecessary-buffer-byte-length-spread': adaptedNoUnnecessaryBufferByteLengthSpread,
  'no-unnecessary-buffer-compare-spread': adaptedNoUnnecessaryBufferCompareSpread,
  'no-unnecessary-buffer-concat-spread': adaptedNoUnnecessaryBufferConcatSpread,
  'no-unnecessary-path-join-spread': adaptedNoUnnecessaryPathJoinSpread,
  'no-unnecessary-path-resolve-spread': adaptedNoUnnecessaryPathResolveSpread,
  'no-unnecessary-path-normalize-spread': adaptedNoUnnecessaryPathNormalizeSpread,
  'no-unnecessary-path-relative-spread': adaptedNoUnnecessaryPathRelativeSpread,
  'no-unnecessary-path-dirname-spread': adaptedNoUnnecessaryPathDirnameSpread,
  'no-unnecessary-path-basename-spread': adaptedNoUnnecessaryPathBasenameSpread,
  'no-unnecessary-path-extname-spread': adaptedNoUnnecessaryPathExtnameSpread,
  'no-unnecessary-path-parse-spread': adaptedNoUnnecessaryPathParseSpread,
  'no-unnecessary-path-format-spread': adaptedNoUnnecessaryPathFormatSpread,
  'no-unnecessary-path-is-absolute-spread': adaptedNoUnnecessaryPathIsAbsoluteSpread,
  'no-unnecessary-path-to-namespaced-path-spread': adaptedNoUnnecessaryPathToNamespacedPathSpread,
  'no-unnecessary-fs-read-file-spread': adaptedNoUnnecessaryFsReadFileSpread,
  'no-unnecessary-fs-write-file-spread': adaptedNoUnnecessaryFsWriteFileSpread,
  'no-unnecessary-fs-append-file-spread': adaptedNoUnnecessaryFsAppendFileSpread,
  'no-unnecessary-fs-copy-file-spread': adaptedNoUnnecessaryFsCopyFileSpread,
  'no-unnecessary-fs-rename-spread': adaptedNoUnnecessaryFsRenameSpread,
  'no-unnecessary-fs-unlink-spread': adaptedNoUnnecessaryFsUnlinkSpread,
  'no-unnecessary-fs-mkdir-spread': adaptedNoUnnecessaryFsMkdirSpread,
  'no-unnecessary-fs-rmdir-spread': adaptedNoUnnecessaryFsRmdirSpread,
  'no-unnecessary-fs-readdir-spread': adaptedNoUnnecessaryFsReaddirSpread,
  'no-unnecessary-fs-stat-spread': adaptedNoUnnecessaryFsStatSpread,
  'no-unnecessary-fs-lstat-spread': adaptedNoUnnecessaryFsLstatSpread,
  'no-unnecessary-fs-fstat-spread': adaptedNoUnnecessaryFsFstatSpread,
  'no-unnecessary-fs-exists-spread': adaptedNoUnnecessaryFsExistsSpread,
  'no-unnecessary-fs-exists-sync-spread': adaptedNoUnnecessaryFsExistsSyncSpread,
  'no-unnecessary-fs-access-spread': adaptedNoUnnecessaryFsAccessSpread,
  'no-unnecessary-fs-chmod-spread': adaptedNoUnnecessaryFsChmodSpread,
  'no-unnecessary-fs-chown-spread': adaptedNoUnnecessaryFsChownSpread,
  'no-unnecessary-fs-read-dir-sync-spread': adaptedNoUnnecessaryFsReadDirSyncSpread,
  'no-unnecessary-fs-read-file-sync-spread': adaptedNoUnnecessaryFsReadFileSyncSpread,
  'no-unnecessary-fs-write-file-sync-spread': adaptedNoUnnecessaryFsWriteFileSyncSpread,
  'no-unnecessary-fs-mkdir-sync-spread': adaptedNoUnnecessaryFsMkdirSyncSpread,
  'no-unnecessary-fs-rm-sync-spread': adaptedNoUnnecessaryFsRmSyncSpread,
  'no-unnecessary-fs-rm-spread': adaptedNoUnnecessaryFsRmSpread,
  'no-unnecessary-fs-watch-spread': adaptedNoUnnecessaryFsWatchSpread,
  'no-unnecessary-fs-watch-file-spread': adaptedNoUnnecessaryFsWatchFileSpread,
  'no-unnecessary-fs-unwatch-file-spread': adaptedNoUnnecessaryFsUnwatchFileSpread,
  'no-unnecessary-fs-create-read-stream-spread': adaptedNoUnnecessaryFsCreateReadStreamSpread,
  'no-unnecessary-fs-create-write-stream-spread': adaptedNoUnnecessaryFsCreateWriteStreamSpread,
  'no-unnecessary-util-promisify-spread': adaptedNoUnnecessaryUtilPromisifySpread,
  'no-unnecessary-util-callbackify-spread': adaptedNoUnnecessaryUtilCallbackifySpread,
  'no-unnecessary-util-inspect-spread': adaptedNoUnnecessaryUtilInspectSpread,
  'no-unnecessary-util-format-spread': adaptedNoUnnecessaryUtilFormatSpread,
  'no-unnecessary-util-deprecate-spread': adaptedNoUnnecessaryUtilDeprecateSpread,
  'no-unnecessary-util-is-deep-strict-equal-spread': adaptedNoUnnecessaryUtilIsDeepStrictEqualSpread,
  'no-unnecessary-util-types-is-date-spread': adaptedNoUnnecessaryUtilTypesIsDateSpread,
  'no-unnecessary-util-text-decoder-decode-spread': adaptedNoUnnecessaryUtilTextDecoderDecodeSpread,
  'no-unnecessary-os-homedir-spread': adaptedNoUnnecessaryOsHomedirSpread,
  'no-unnecessary-os-tmpdir-spread': adaptedNoUnnecessaryOsTmpdirSpread,
  'no-unnecessary-os-hostname-spread': adaptedNoUnnecessaryOsHostnameSpread,
  'no-unnecessary-os-type-spread': adaptedNoUnnecessaryOsTypeSpread,
  'no-unnecessary-os-platform-spread': adaptedNoUnnecessaryOsPlatformSpread,
  'no-unnecessary-os-arch-spread': adaptedNoUnnecessaryOsArchSpread,
  'no-unnecessary-os-release-spread': adaptedNoUnnecessaryOsReleaseSpread,
  'no-unnecessary-os-cpus-spread': adaptedNoUnnecessaryOsCpusSpread,
  'no-unnecessary-os-totalmem-spread': adaptedNoUnnecessaryOsTotalmemSpread,
  'no-unnecessary-os-freemem-spread': adaptedNoUnnecessaryOsFreememSpread,
  'no-unnecessary-os-uptime-spread': adaptedNoUnnecessaryOsUptimeSpread,
  'no-unnecessary-os-loadavg-spread': adaptedNoUnnecessaryOsLoadavgSpread,
  'no-unnecessary-os-network-interfaces-spread': adaptedNoUnnecessaryOsNetworkInterfacesSpread,
  'no-unnecessary-os-constants-spread': adaptedNoUnnecessaryOsConstantsSpread,
  'no-unnecessary-os-user-info-spread': adaptedNoUnnecessaryOsUserInfoSpread,
  'no-unnecessary-os-eol-spread': adaptedNoUnnecessaryOsEolSpread,
  'no-unnecessary-os-dev-null-spread': adaptedNoUnnecessaryOsDevNullSpread,
  'no-unnecessary-os-get-priority-spread': adaptedNoUnnecessaryOsGetPrioritySpread,
  'no-unnecessary-os-set-priority-spread': adaptedNoUnnecessaryOsSetPrioritySpread,
  'no-unnecessary-crypto-create-hash-spread': adaptedNoUnnecessaryCryptoCreateHashSpread,
  'no-unnecessary-crypto-create-hmac-spread': adaptedNoUnnecessaryCryptoCreateHmacSpread,
  'no-unnecessary-crypto-create-cipher-spread': adaptedNoUnnecessaryCryptoCreateCipherSpread,
  'no-unnecessary-crypto-create-cipher-iv-spread': adaptedNoUnnecessaryCryptoCreateCipherIvSpread,
  'no-unnecessary-crypto-create-decipher-spread': adaptedNoUnnecessaryCryptoCreateDecipherSpread,
  'no-unnecessary-crypto-create-decipher-iv-spread': adaptedNoUnnecessaryCryptoCreateDecipherIvSpread,
  'no-unnecessary-crypto-create-sign-spread': adaptedNoUnnecessaryCryptoCreateSignSpread,
  'no-unnecessary-crypto-create-verify-spread': adaptedNoUnnecessaryCryptoCreateVerifySpread,
  'no-unnecessary-crypto-random-bytes-spread': adaptedNoUnnecessaryCryptoRandomBytesSpread,
  'no-unnecessary-crypto-pbkdf2-spread': adaptedNoUnnecessaryCryptoPbkdf2Spread,
  'no-unnecessary-crypto-scrypt-spread': adaptedNoUnnecessaryCryptoScryptSpread,
  'no-unnecessary-crypto-create-secret-key-spread': adaptedNoUnnecessaryCryptoCreateSecretKeySpread,
  'no-unnecessary-crypto-create-public-key-spread': adaptedNoUnnecessaryCryptoCreatePublicKeySpread,
  'no-unnecessary-crypto-create-private-key-spread': adaptedNoUnnecessaryCryptoCreatePrivateKeySpread,
  'no-unnecessary-crypto-get-ciphers-spread': adaptedNoUnnecessaryCryptoGetCiphersSpread,
  'no-unnecessary-crypto-get-hashes-spread': adaptedNoUnnecessaryCryptoGetHashesSpread,
  'no-unnecessary-crypto-timing-safe-equal-spread': adaptedNoUnnecessaryCryptoTimingSafeEqualSpread,
  'no-unnecessary-event-emitter-on-spread': adaptedNoUnnecessaryEventEmitterOnSpread,
  'no-unnecessary-event-emitter-off-spread': adaptedNoUnnecessaryEventEmitterOffSpread,
  'no-unnecessary-event-emitter-once-spread': adaptedNoUnnecessaryEventEmitterOnceSpread,
  'no-unnecessary-event-emitter-emit-spread': adaptedNoUnnecessaryEventEmitterEmitSpread,
  'no-unnecessary-event-emitter-remove-listener-spread': adaptedNoUnnecessaryEventEmitterRemoveListenerSpread,
  'no-unnecessary-event-emitter-remove-all-listeners-spread': adaptedNoUnnecessaryEventEmitterRemoveAllListenersSpread,
  'no-unnecessary-event-emitter-listeners-spread': adaptedNoUnnecessaryEventEmitterListenersSpread,
  'no-unnecessary-event-emitter-listener-count-spread': adaptedNoUnnecessaryEventEmitterListenerCountSpread,
  'no-unnecessary-event-emitter-prepend-listener-spread': adaptedNoUnnecessaryEventEmitterPrependListenerSpread,
  'no-unnecessary-event-emitter-prepend-once-listener-spread': adaptedNoUnnecessaryEventEmitterPrependOnceListenerSpread,
  'no-unnecessary-event-emitter-set-max-listeners-spread': adaptedNoUnnecessaryEventEmitterSetMaxListenersSpread,
  'no-unnecessary-event-emitter-get-max-listeners-spread': adaptedNoUnnecessaryEventEmitterGetMaxListenersSpread,
  'no-unnecessary-event-emitter-event-names-spread': adaptedNoUnnecessaryEventEmitterEventNamesSpread,
  'no-unnecessary-event-emitter-raw-listeners-spread': adaptedNoUnnecessaryEventEmitterRawListenersSpread,
  'no-unnecessary-stream-pipeline-spread': adaptedNoUnnecessaryStreamPipelineSpread,
  'no-unnecessary-stream-compose-spread': adaptedNoUnnecessaryStreamComposeSpread,
  'no-unnecessary-stream-readable-from-spread': adaptedNoUnnecessaryStreamReadableFromSpread,
  'no-unnecessary-child-process-exec-spread': adaptedNoUnnecessaryChildProcessExecSpread,
  'no-unnecessary-child-process-exec-file-spread': adaptedNoUnnecessaryChildProcessExecFileSpread,
  'no-unnecessary-child-process-spawn-spread': adaptedNoUnnecessaryChildProcessSpawnSpread,
  'no-unnecessary-child-process-fork-spread': adaptedNoUnnecessaryChildProcessForkSpread,
  'no-unnecessary-http-request-spread': adaptedNoUnnecessaryHttpRequestSpread,
  'no-unnecessary-http-get-spread': adaptedNoUnnecessaryHttpGetSpread,
  'no-unnecessary-https-request-spread': adaptedNoUnnecessaryHttpsRequestSpread,
  'no-unnecessary-https-get-spread': adaptedNoUnnecessaryHttpsGetSpread,
  'no-unnecessary-url-parse-node-spread': adaptedNoUnnecessaryUrlParseNodeSpread,
  'no-unnecessary-url-format-spread': adaptedNoUnnecessaryUrlFormatSpread,
  'no-unnecessary-url-resolve-spread': adaptedNoUnnecessaryUrlResolveSpread,
  'no-unnecessary-url-domain-to-unicode-spread': adaptedNoUnnecessaryUrlDomainToUnicodeSpread,
  'no-unnecessary-url-domain-to-ascii-spread': adaptedNoUnnecessaryUrlDomainToAsciiSpread,
  'no-unnecessary-querystring-parse-spread': adaptedNoUnnecessaryQuerystringParseSpread,
  'no-unnecessary-querystring-stringify-spread': adaptedNoUnnecessaryQuerystringStringifySpread,
  'no-unnecessary-querystring-escape-spread': adaptedNoUnnecessaryQuerystringEscapeSpread,
  'no-unnecessary-querystring-unescape-spread': adaptedNoUnnecessaryQuerystringUnescapeSpread,
  'no-unnecessary-assert-ok-spread': adaptedNoUnnecessaryAssertOkSpread,
  'no-unnecessary-assert-equal-spread': adaptedNoUnnecessaryAssertEqualSpread,
  'no-unnecessary-assert-not-equal-spread': adaptedNoUnnecessaryAssertNotEqualSpread,
  'no-unnecessary-assert-deep-equal-spread': adaptedNoUnnecessaryAssertDeepEqualSpread,
  'no-unnecessary-assert-not-deep-equal-spread': adaptedNoUnnecessaryAssertNotDeepEqualSpread,
  'no-unnecessary-assert-deep-strict-equal-spread': adaptedNoUnnecessaryAssertDeepStrictEqualSpread,
  'no-unnecessary-assert-not-deep-strict-equal-spread': adaptedNoUnnecessaryAssertNotDeepStrictEqualSpread,
  'no-unnecessary-assert-strict-equal-spread': adaptedNoUnnecessaryAssertStrictEqualSpread,
  'no-unnecessary-assert-not-strict-equal-spread': adaptedNoUnnecessaryAssertNotStrictEqualSpread,
  'no-unnecessary-assert-throws-spread': adaptedNoUnnecessaryAssertThrowsSpread,
  'no-unnecessary-assert-rejects-spread': adaptedNoUnnecessaryAssertRejectsSpread,
  'no-unnecessary-assert-does-not-throw-spread': adaptedNoUnnecessaryAssertDoesNotThrowSpread,
  'no-unnecessary-assert-does-not-reject-spread': adaptedNoUnnecessaryAssertDoesNotRejectSpread,
  'no-unnecessary-assert-if-error-spread': adaptedNoUnnecessaryAssertIfErrorSpread,
  'no-unnecessary-assert-fail-spread': adaptedNoUnnecessaryAssertFailSpread,
  'no-unnecessary-assert-match-spread': adaptedNoUnnecessaryAssertMatchSpread,
  'no-unnecessary-assert-does-not-match-spread': adaptedNoUnnecessaryAssertDoesNotMatchSpread,
  'no-unnecessary-assert-call-tracker-calls-spread': adaptedNoUnnecessaryAssertCallTrackerCallsSpread,
  'no-unnecessary-promise-instance-then-spread': adaptedNoUnnecessaryPromiseInstanceThenSpread,
  'no-unnecessary-promise-instance-catch-spread': adaptedNoUnnecessaryPromiseInstanceCatchSpread,
  'no-unnecessary-promise-instance-finally-spread': adaptedNoUnnecessaryPromiseInstanceFinallySpread,
  'no-unnecessary-intl-collator-compare-spread': adaptedNoUnnecessaryIntlCollatorCompareSpread,
  'no-unnecessary-intl-number-format-format-spread': adaptedNoUnnecessaryIntlNumberFormatFormatSpread,
  'no-unnecessary-intl-date-time-format-format-spread': adaptedNoUnnecessaryIntlDateTimeFormatFormatSpread,
  'no-unnecessary-intl-list-format-format-spread': adaptedNoUnnecessaryIntlListFormatFormatSpread,
  'no-unnecessary-intl-relative-time-format-spread': adaptedNoUnnecessaryIntlRelativeTimeFormatSpread,
  'no-unnecessary-intl-plural-rules-spread': adaptedNoUnnecessaryIntlPluralRulesSpread,
  'no-unnecessary-intl-segmenter-spread': adaptedNoUnnecessaryIntlSegmenterSpread,
  'no-unnecessary-intl-display-names-spread': adaptedNoUnnecessaryIntlDisplayNamesSpread,
  'no-unnecessary-iterator-next-spread': adaptedNoUnnecessaryIteratorNextSpread,
  'no-unnecessary-iterator-return-spread': adaptedNoUnnecessaryIteratorReturnSpread,
  'no-unnecessary-iterator-throw-spread': adaptedNoUnnecessaryIteratorThrowSpread,
  'no-unnecessary-iterator-for-each-spread': adaptedNoUnnecessaryIteratorForEachSpread,
  'no-unnecessary-iterator-map-spread': adaptedNoUnnecessaryIteratorMapSpread,
  'no-unnecessary-iterator-filter-spread': adaptedNoUnnecessaryIteratorFilterSpread,
  'no-unnecessary-iterator-take-spread': adaptedNoUnnecessaryIteratorTakeSpread,
  'no-unnecessary-iterator-drop-spread': adaptedNoUnnecessaryIteratorDropSpread,
  'no-unnecessary-iterator-flat-map-spread': adaptedNoUnnecessaryIteratorFlatMapSpread,
  'no-unnecessary-iterator-reduce-spread': adaptedNoUnnecessaryIteratorReduceSpread,
  'no-unnecessary-iterator-to-array-spread': adaptedNoUnnecessaryIteratorToArraySpread,
  'no-unnecessary-iterator-some-spread': adaptedNoUnnecessaryIteratorSomeSpread,
  'no-unnecessary-iterator-every-spread': adaptedNoUnnecessaryIteratorEverySpread,
  'no-unnecessary-iterator-find-spread': adaptedNoUnnecessaryIteratorFindSpread,
  'no-unnecessary-array-iterator-next-spread': adaptedNoUnnecessaryArrayIteratorNextSpread,
  'no-unnecessary-map-iterator-next-spread': adaptedNoUnnecessaryMapIteratorNextSpread,
  'no-unnecessary-set-iterator-next-spread': adaptedNoUnnecessarySetIteratorNextSpread,
  'no-unnecessary-string-iterator-next-spread': adaptedNoUnnecessaryStringIteratorNextSpread,
  'no-unnecessary-generator-next-spread': adaptedNoUnnecessaryGeneratorNextSpread,
  'no-unnecessary-generator-return-spread': adaptedNoUnnecessaryGeneratorReturnSpread,
  'no-unnecessary-generator-throw-spread': adaptedNoUnnecessaryGeneratorThrowSpread,
  'no-unnecessary-async-generator-next-spread': adaptedNoUnnecessaryAsyncGeneratorNextSpread,
  'no-unnecessary-async-generator-return-spread': adaptedNoUnnecessaryAsyncGeneratorReturnSpread,
  'no-unnecessary-async-generator-throw-spread': adaptedNoUnnecessaryAsyncGeneratorThrowSpread,
  'no-unnecessary-async-iterator-next-spread': adaptedNoUnnecessaryAsyncIteratorNextSpread,
  'no-unnecessary-async-iterator-return-spread': adaptedNoUnnecessaryAsyncIteratorReturnSpread,
  'no-unnecessary-async-iterator-throw-spread': adaptedNoUnnecessaryAsyncIteratorThrowSpread,
  'no-unnecessary-response-instance-clone-spread': adaptedNoUnnecessaryResponseInstanceCloneSpread,
  'no-unnecessary-response-instance-json-spread': adaptedNoUnnecessaryResponseInstanceJsonSpread,
  'no-unnecessary-response-instance-text-spread': adaptedNoUnnecessaryResponseInstanceTextSpread,
  'no-unnecessary-response-instance-blob-spread': adaptedNoUnnecessaryResponseInstanceBlobSpread,
  'no-unnecessary-response-instance-array-buffer-spread': adaptedNoUnnecessaryResponseInstanceArrayBufferSpread,
  'no-unnecessary-response-instance-form-data-spread': adaptedNoUnnecessaryResponseInstanceFormDataSpread,
  'no-unnecessary-request-instance-clone-spread': adaptedNoUnnecessaryRequestInstanceCloneSpread,
  'no-unnecessary-request-instance-json-spread': adaptedNoUnnecessaryRequestInstanceJsonSpread,
  'no-unnecessary-request-instance-text-spread': adaptedNoUnnecessaryRequestInstanceTextSpread,
  'no-unnecessary-request-instance-blob-spread': adaptedNoUnnecessaryRequestInstanceBlobSpread,
  'no-unnecessary-request-instance-array-buffer-spread': adaptedNoUnnecessaryRequestInstanceArrayBufferSpread,
  'no-unnecessary-request-instance-form-data-spread': adaptedNoUnnecessaryRequestInstanceFormDataSpread,
  'no-unnecessary-headers-instance-get-spread': adaptedNoUnnecessaryHeadersInstanceGetSpread,
  'no-unnecessary-headers-instance-set-spread': adaptedNoUnnecessaryHeadersInstanceSetSpread,
  'no-unnecessary-headers-instance-has-spread': adaptedNoUnnecessaryHeadersInstanceHasSpread,
  'no-unnecessary-headers-instance-delete-spread': adaptedNoUnnecessaryHeadersInstanceDeleteSpread,
  'no-unnecessary-headers-instance-append-spread': adaptedNoUnnecessaryHeadersInstanceAppendSpread,
  'no-unnecessary-headers-instance-entries-spread': adaptedNoUnnecessaryHeadersInstanceEntriesSpread,
  'no-unnecessary-headers-instance-keys-spread': adaptedNoUnnecessaryHeadersInstanceKeysSpread,
  'no-unnecessary-headers-instance-values-spread': adaptedNoUnnecessaryHeadersInstanceValuesSpread,
  'no-unnecessary-headers-instance-for-each-spread': adaptedNoUnnecessaryHeadersInstanceForEachSpread,
  'no-unnecessary-form-data-instance-get-spread': adaptedNoUnnecessaryFormDataInstanceGetSpread,
  'no-unnecessary-form-data-instance-get-all-spread': adaptedNoUnnecessaryFormDataInstanceGetAllSpread,
  'no-unnecessary-form-data-instance-set-spread': adaptedNoUnnecessaryFormDataInstanceSetSpread,
  'no-unnecessary-form-data-instance-append-spread': adaptedNoUnnecessaryFormDataInstanceAppendSpread,
  'no-unnecessary-form-data-instance-delete-spread': adaptedNoUnnecessaryFormDataInstanceDeleteSpread,
  'no-unnecessary-form-data-instance-has-spread': adaptedNoUnnecessaryFormDataInstanceHasSpread,
  'no-unnecessary-form-data-instance-entries-spread': adaptedNoUnnecessaryFormDataInstanceEntriesSpread,
  'no-unnecessary-form-data-instance-keys-spread': adaptedNoUnnecessaryFormDataInstanceKeysSpread,
  'no-unnecessary-form-data-instance-values-spread': adaptedNoUnnecessaryFormDataInstanceValuesSpread,
  'no-unnecessary-form-data-instance-for-each-spread': adaptedNoUnnecessaryFormDataInstanceForEachSpread,
  'no-unnecessary-url-instance-to-string-spread': adaptedNoUnnecessaryUrlInstanceToStringSpread,
  'no-unnecessary-url-instance-to-json-spread': adaptedNoUnnecessaryUrlInstanceToJsonSpread,
  'no-unnecessary-url-search-params-instance-get-spread': adaptedNoUnnecessaryUrlSearchParamsInstanceGetSpread,
  'no-unnecessary-url-search-params-instance-get-all-spread': adaptedNoUnnecessaryUrlSearchParamsInstanceGetAllSpread,
  'no-unnecessary-url-search-params-instance-set-spread': adaptedNoUnnecessaryUrlSearchParamsInstanceSetSpread,
  'no-unnecessary-url-search-params-instance-append-spread': adaptedNoUnnecessaryUrlSearchParamsInstanceAppendSpread,
  'no-unnecessary-url-search-params-instance-delete-spread': adaptedNoUnnecessaryUrlSearchParamsInstanceDeleteSpread,
  'no-unnecessary-url-search-params-instance-has-spread': adaptedNoUnnecessaryUrlSearchParamsInstanceHasSpread,
  'no-unnecessary-url-search-params-instance-to-string-spread': adaptedNoUnnecessaryUrlSearchParamsInstanceToStringSpread,
  'no-unnecessary-url-search-params-instance-entries-spread': adaptedNoUnnecessaryUrlSearchParamsInstanceEntriesSpread,
  'no-unnecessary-url-search-params-instance-keys-spread': adaptedNoUnnecessaryUrlSearchParamsInstanceKeysSpread,
  'no-unnecessary-url-search-params-instance-values-spread': adaptedNoUnnecessaryUrlSearchParamsInstanceValuesSpread,
  'no-unnecessary-url-search-params-instance-for-each-spread': adaptedNoUnnecessaryUrlSearchParamsInstanceForEachSpread,
  'no-unnecessary-url-search-params-instance-sort-spread': adaptedNoUnnecessaryUrlSearchParamsInstanceSortSpread,
  'no-unnecessary-blob-instance-array-buffer-spread': adaptedNoUnnecessaryBlobInstanceArrayBufferSpread,
  'no-unnecessary-blob-instance-text-spread': adaptedNoUnnecessaryBlobInstanceTextSpread,
  'no-unnecessary-blob-instance-slice-spread': adaptedNoUnnecessaryBlobInstanceSliceSpread,
  'no-unnecessary-blob-instance-stream-spread': adaptedNoUnnecessaryBlobInstanceStreamSpread,
  'no-unnecessary-file-instance-array-buffer-spread': adaptedNoUnnecessaryFileInstanceArrayBufferSpread,
  'no-unnecessary-file-instance-text-spread': adaptedNoUnnecessaryFileInstanceTextSpread,
  'no-unnecessary-file-instance-slice-spread': adaptedNoUnnecessaryFileInstanceSliceSpread,
  'no-unnecessary-file-instance-stream-spread': adaptedNoUnnecessaryFileInstanceStreamSpread,
  'no-unnecessary-abort-signal-throw-if-aborted-spread': adaptedNoUnnecessaryAbortSignalThrowIfAbortedSpread,
  'no-unnecessary-broadcast-channel-instance-post-message-spread': adaptedNoUnnecessaryBroadcastChannelInstancePostMessageSpread,
  'no-unnecessary-broadcast-channel-instance-close-spread': adaptedNoUnnecessaryBroadcastChannelInstanceCloseSpread,
  'no-unnecessary-message-port-post-message-spread': adaptedNoUnnecessaryMessagePortPostMessageSpread,
  'no-unnecessary-message-port-close-spread': adaptedNoUnnecessaryMessagePortCloseSpread,
  'no-unnecessary-message-port-start-spread': adaptedNoUnnecessaryMessagePortStartSpread,
  'no-unnecessary-worker-instance-post-message-spread': adaptedNoUnnecessaryWorkerInstancePostMessageSpread,
  'no-unnecessary-worker-instance-terminate-spread': adaptedNoUnnecessaryWorkerInstanceTerminateSpread,
  'no-unnecessary-file-reader-instance-read-as-array-buffer-spread': adaptedNoUnnecessaryFileReaderInstanceReadAsArrayBufferSpread,
  'no-unnecessary-file-reader-instance-read-as-binary-string-spread': adaptedNoUnnecessaryFileReaderInstanceReadAsBinaryStringSpread,
  'no-unnecessary-file-reader-instance-read-as-data-url-spread': adaptedNoUnnecessaryFileReaderInstanceReadAsDataUrlSpread,
  'no-unnecessary-file-reader-instance-read-as-text-spread': adaptedNoUnnecessaryFileReaderInstanceReadAsTextSpread,
  'no-unnecessary-file-reader-instance-abort-spread': adaptedNoUnnecessaryFileReaderInstanceAbortSpread,
  'no-unnecessary-readable-stream-read-spread': adaptedNoUnnecessaryReadableStreamReadSpread,
  'no-unnecessary-readable-stream-pipe-spread': adaptedNoUnnecessaryReadableStreamPipeSpread,
  'no-unnecessary-readable-stream-unpipe-spread': adaptedNoUnnecessaryReadableStreamUnpipeSpread,
  'no-unnecessary-readable-stream-pause-spread': adaptedNoUnnecessaryReadableStreamPauseSpread,
  'no-unnecessary-readable-stream-resume-spread': adaptedNoUnnecessaryReadableStreamResumeSpread,
  'no-unnecessary-readable-stream-destroy-spread': adaptedNoUnnecessaryReadableStreamDestroySpread,
  'no-unnecessary-readable-stream-push-spread': adaptedNoUnnecessaryReadableStreamPushSpread,
  'no-unnecessary-writable-stream-write-spread': adaptedNoUnnecessaryWritableStreamWriteSpread,
  'no-unnecessary-writable-stream-end-spread': adaptedNoUnnecessaryWritableStreamEndSpread,
  'no-unnecessary-writable-stream-destroy-spread': adaptedNoUnnecessaryWritableStreamDestroySpread,
  'no-unnecessary-transform-stream-transform-spread': adaptedNoUnnecessaryTransformStreamTransformSpread,
  'no-unnecessary-transform-stream-flush-spread': adaptedNoUnnecessaryTransformStreamFlushSpread,
  'no-unnecessary-event-emitter-add-listener-spread': adaptedNoUnnecessaryEventEmitterAddListenerSpread,
  'no-unnecessary-child-process-instance-kill-spread': adaptedNoUnnecessaryChildProcessInstanceKillSpread,
  'no-unnecessary-child-process-instance-send-spread': adaptedNoUnnecessaryChildProcessInstanceSendSpread,
  'no-unnecessary-child-process-instance-disconnect-spread': adaptedNoUnnecessaryChildProcessInstanceDisconnectSpread,
  'no-unnecessary-child-process-instance-ref-spread': adaptedNoUnnecessaryChildProcessInstanceRefSpread,
  'no-unnecessary-child-process-instance-unref-spread': adaptedNoUnnecessaryChildProcessInstanceUnrefSpread,
  'no-unnecessary-observer-instance-observe-spread': adaptedNoUnnecessaryObserverInstanceObserveSpread,
  'no-unnecessary-observer-instance-unobserve-spread': adaptedNoUnnecessaryObserverInstanceUnobserveSpread,
  'no-unnecessary-observer-instance-disconnect-spread': adaptedNoUnnecessaryObserverInstanceDisconnectSpread,
  'no-unnecessary-observer-instance-take-records-spread': adaptedNoUnnecessaryObserverInstanceTakeRecordsSpread,
  'no-unnecessary-text-decoder-instance-decode-spread': adaptedNoUnnecessaryTextDecoderInstanceDecodeSpread,
  'no-unnecessary-text-encoder-instance-encode-spread': adaptedNoUnnecessaryTextEncoderInstanceEncodeSpread,
  'no-unnecessary-text-encoder-instance-encode-into-spread': adaptedNoUnnecessaryTextEncoderInstanceEncodeIntoSpread,
  'no-unnecessary-server-listen-spread': adaptedNoUnnecessaryServerListenSpread,
  'no-unnecessary-server-close-spread': adaptedNoUnnecessaryServerCloseSpread,
  'no-unnecessary-server-address-spread': adaptedNoUnnecessaryServerAddressSpread,
  'no-unnecessary-server-get-connections-spread': adaptedNoUnnecessaryServerGetConnectionsSpread,
  'no-unnecessary-server-ref-spread': adaptedNoUnnecessaryServerRefSpread,
  'no-unnecessary-server-unref-spread': adaptedNoUnnecessaryServerUnrefSpread,
  'no-unnecessary-socket-write-spread': adaptedNoUnnecessarySocketWriteSpread,
  'no-unnecessary-socket-connect-spread': adaptedNoUnnecessarySocketConnectSpread,
  'no-unnecessary-socket-end-spread': adaptedNoUnnecessarySocketEndSpread,
  'no-unnecessary-socket-destroy-spread': adaptedNoUnnecessarySocketDestroySpread,
  'no-unnecessary-socket-pause-spread': adaptedNoUnnecessarySocketPauseSpread,
  'no-unnecessary-socket-resume-spread': adaptedNoUnnecessarySocketResumeSpread,
  'no-unnecessary-socket-set-timeout-spread': adaptedNoUnnecessarySocketSetTimeoutSpread,
  'no-unnecessary-socket-set-encoding-spread': adaptedNoUnnecessarySocketSetEncodingSpread,
  'no-unnecessary-socket-set-keep-alive-spread': adaptedNoUnnecessarySocketSetKeepAliveSpread,
  'no-unnecessary-socket-set-no-delay-spread': adaptedNoUnnecessarySocketSetNoDelaySpread,
  'no-unnecessary-socket-ref-spread': adaptedNoUnnecessarySocketRefSpread,
  'no-unnecessary-socket-unref-spread': adaptedNoUnnecessarySocketUnrefSpread,
  'no-unnecessary-dataview-set-float32-spread': adaptedNoUnnecessaryDataviewSetFloat32Spread,
  'no-unnecessary-dataview-set-float64-spread': adaptedNoUnnecessaryDataviewSetFloat64Spread,
  'no-unnecessary-dataview-set-int16-spread': adaptedNoUnnecessaryDataviewSetInt16Spread,
  'no-unnecessary-dataview-set-int32-spread': adaptedNoUnnecessaryDataviewSetInt32Spread,
  'no-unnecessary-dataview-set-int8-spread': adaptedNoUnnecessaryDataviewSetInt8Spread,
  'no-unnecessary-dataview-set-uint16-spread': adaptedNoUnnecessaryDataviewSetUint16Spread,
  'no-unnecessary-dataview-set-uint32-spread': adaptedNoUnnecessaryDataviewSetUint32Spread,
  'no-unnecessary-dataview-set-uint8-spread': adaptedNoUnnecessaryDataviewSetUint8Spread,
  'no-unnecessary-array-buffer-instance-resize-spread': adaptedNoUnnecessaryArrayBufferInstanceResizeSpread,
  'no-unnecessary-array-buffer-instance-slice-spread': adaptedNoUnnecessaryArrayBufferInstanceSliceSpread,
  'no-unnecessary-array-buffer-instance-transfer-spread': adaptedNoUnnecessaryArrayBufferInstanceTransferSpread,
  'no-unnecessary-array-from-async-spread': adaptedNoUnnecessaryArrayFromAsyncSpread,
  'no-unnecessary-array-is-array-spread': adaptedNoUnnecessaryArrayIsArraySpread,
  'no-unnecessary-big-int-instance-to-locale-string-spread': adaptedNoUnnecessaryBigIntInstanceToLocaleStringSpread,
  'no-unnecessary-big-int-instance-to-string-spread': adaptedNoUnnecessaryBigIntInstanceToStringSpread,
  'no-unnecessary-big-int-instance-value-of-spread': adaptedNoUnnecessaryBigIntInstanceValueOfSpread,
  'no-unnecessary-boolean-instance-to-string-spread': adaptedNoUnnecessaryBooleanInstanceToStringSpread,
  'no-unnecessary-boolean-instance-value-of-spread': adaptedNoUnnecessaryBooleanInstanceValueOfSpread,
  'no-unnecessary-canvas-get-context-spread': adaptedNoUnnecessaryCanvasGetContextSpread,
  'no-unnecessary-crypto-cipher-instance-final-spread': adaptedNoUnnecessaryCryptoCipherInstanceFinalSpread,
  'no-unnecessary-crypto-cipher-instance-update-spread': adaptedNoUnnecessaryCryptoCipherInstanceUpdateSpread,
  'no-unnecessary-crypto-create-hash-instance-digest-spread': adaptedNoUnnecessaryCryptoCreateHashInstanceDigestSpread,
  'no-unnecessary-crypto-create-hash-instance-update-spread': adaptedNoUnnecessaryCryptoCreateHashInstanceUpdateSpread,
  'no-unnecessary-crypto-decipher-instance-final-spread': adaptedNoUnnecessaryCryptoDecipherInstanceFinalSpread,
  'no-unnecessary-crypto-decipher-instance-update-spread': adaptedNoUnnecessaryCryptoDecipherInstanceUpdateSpread,
  'no-unnecessary-crypto-hmac-instance-digest-spread': adaptedNoUnnecessaryCryptoHmacInstanceDigestSpread,
  'no-unnecessary-crypto-hmac-instance-update-spread': adaptedNoUnnecessaryCryptoHmacInstanceUpdateSpread,
  'no-unnecessary-crypto-sign-instance-sign-spread': adaptedNoUnnecessaryCryptoSignInstanceSignSpread,
  'no-unnecessary-crypto-sign-instance-update-spread': adaptedNoUnnecessaryCryptoSignInstanceUpdateSpread,
  'no-unnecessary-crypto-verify-instance-update-spread': adaptedNoUnnecessaryCryptoVerifyInstanceUpdateSpread,
  'no-unnecessary-crypto-verify-instance-verify-spread': adaptedNoUnnecessaryCryptoVerifyInstanceVerifySpread,
  'no-unnecessary-ctx-arc-spread': adaptedNoUnnecessaryCtxArcSpread,
  'no-unnecessary-ctx-arc-to-spread': adaptedNoUnnecessaryCtxArcToSpread,
  'no-unnecessary-ctx-begin-path-spread': adaptedNoUnnecessaryCtxBeginPathSpread,
  'no-unnecessary-ctx-bezier-curve-to-spread': adaptedNoUnnecessaryCtxBezierCurveToSpread,
  'no-unnecessary-ctx-clear-rect-spread': adaptedNoUnnecessaryCtxClearRectSpread,
  'no-unnecessary-ctx-clip-spread': adaptedNoUnnecessaryCtxClipSpread,
  'no-unnecessary-ctx-close-path-spread': adaptedNoUnnecessaryCtxClosePathSpread,
  'no-unnecessary-ctx-create-linear-gradient-spread': adaptedNoUnnecessaryCtxCreateLinearGradientSpread,
  'no-unnecessary-ctx-create-pattern-spread': adaptedNoUnnecessaryCtxCreatePatternSpread,
  'no-unnecessary-ctx-create-radial-gradient-spread': adaptedNoUnnecessaryCtxCreateRadialGradientSpread,
  'no-unnecessary-ctx-draw-image-spread': adaptedNoUnnecessaryCtxDrawImageSpread,
  'no-unnecessary-ctx-fill-rect-spread': adaptedNoUnnecessaryCtxFillRectSpread,
  'no-unnecessary-ctx-fill-spread': adaptedNoUnnecessaryCtxFillSpread,
  'no-unnecessary-ctx-fill-text-spread': adaptedNoUnnecessaryCtxFillTextSpread,
  'no-unnecessary-ctx-get-image-data-spread': adaptedNoUnnecessaryCtxGetImageDataSpread,
  'no-unnecessary-ctx-get-line-dash-spread': adaptedNoUnnecessaryCtxGetLineDashSpread,
  'no-unnecessary-ctx-line-to-spread': adaptedNoUnnecessaryCtxLineToSpread,
  'no-unnecessary-ctx-measure-text-spread': adaptedNoUnnecessaryCtxMeasureTextSpread,
  'no-unnecessary-ctx-move-to-spread': adaptedNoUnnecessaryCtxMoveToSpread,
  'no-unnecessary-ctx-put-image-data-spread': adaptedNoUnnecessaryCtxPutImageDataSpread,
  'no-unnecessary-ctx-quadratic-curve-to-spread': adaptedNoUnnecessaryCtxQuadraticCurveToSpread,
  'no-unnecessary-ctx-reset-transform-spread': adaptedNoUnnecessaryCtxResetTransformSpread,
  'no-unnecessary-ctx-restore-spread': adaptedNoUnnecessaryCtxRestoreSpread,
  'no-unnecessary-ctx-rotate-spread': adaptedNoUnnecessaryCtxRotateSpread,
  'no-unnecessary-ctx-save-spread': adaptedNoUnnecessaryCtxSaveSpread,
  'no-unnecessary-ctx-scale-spread': adaptedNoUnnecessaryCtxScaleSpread,
  'no-unnecessary-ctx-set-line-dash-spread': adaptedNoUnnecessaryCtxSetLineDashSpread,
  'no-unnecessary-ctx-set-transform-spread': adaptedNoUnnecessaryCtxSetTransformSpread,
  'no-unnecessary-ctx-stroke-rect-spread': adaptedNoUnnecessaryCtxStrokeRectSpread,
  'no-unnecessary-ctx-stroke-spread': adaptedNoUnnecessaryCtxStrokeSpread,
  'no-unnecessary-ctx-stroke-text-spread': adaptedNoUnnecessaryCtxStrokeTextSpread,
  'no-unnecessary-ctx-transform-spread': adaptedNoUnnecessaryCtxTransformSpread,
  'no-unnecessary-ctx-translate-spread': adaptedNoUnnecessaryCtxTranslateSpread,
  'no-unnecessary-dataview-instance-get-big-int64-spread': adaptedNoUnnecessaryDataviewInstanceGetBigInt64Spread,
  'no-unnecessary-dataview-instance-get-big-uint64-spread': adaptedNoUnnecessaryDataviewInstanceGetBigUint64Spread,
  'no-unnecessary-dataview-instance-get-float32-spread': adaptedNoUnnecessaryDataviewInstanceGetFloat32Spread,
  'no-unnecessary-dataview-instance-get-float64-spread': adaptedNoUnnecessaryDataviewInstanceGetFloat64Spread,
  'no-unnecessary-dataview-instance-get-int16-spread': adaptedNoUnnecessaryDataviewInstanceGetInt16Spread,
  'no-unnecessary-dataview-instance-get-int32-spread': adaptedNoUnnecessaryDataviewInstanceGetInt32Spread,
  'no-unnecessary-dataview-instance-get-int8-spread': adaptedNoUnnecessaryDataviewInstanceGetInt8Spread,
  'no-unnecessary-dataview-instance-get-uint16-spread': adaptedNoUnnecessaryDataviewInstanceGetUint16Spread,
  'no-unnecessary-dataview-instance-get-uint32-spread': adaptedNoUnnecessaryDataviewInstanceGetUint32Spread,
  'no-unnecessary-dataview-instance-get-uint8-spread': adaptedNoUnnecessaryDataviewInstanceGetUint8Spread,
  'no-unnecessary-dataview-instance-set-big-int64-spread': adaptedNoUnnecessaryDataviewInstanceSetBigInt64Spread,
  'no-unnecessary-dataview-instance-set-big-uint64-spread': adaptedNoUnnecessaryDataviewInstanceSetBigUint64Spread,
  'no-unnecessary-dataview-instance-set-float32-spread': adaptedNoUnnecessaryDataviewInstanceSetFloat32Spread,
  'no-unnecessary-dataview-instance-set-float64-spread': adaptedNoUnnecessaryDataviewInstanceSetFloat64Spread,
  'no-unnecessary-dataview-instance-set-int16-spread': adaptedNoUnnecessaryDataviewInstanceSetInt16Spread,
  'no-unnecessary-dataview-instance-set-int32-spread': adaptedNoUnnecessaryDataviewInstanceSetInt32Spread,
  'no-unnecessary-dataview-instance-set-int8-spread': adaptedNoUnnecessaryDataviewInstanceSetInt8Spread,
  'no-unnecessary-dataview-instance-set-uint16-spread': adaptedNoUnnecessaryDataviewInstanceSetUint16Spread,
  'no-unnecessary-dataview-instance-set-uint32-spread': adaptedNoUnnecessaryDataviewInstanceSetUint32Spread,
  'no-unnecessary-dataview-instance-set-uint8-spread': adaptedNoUnnecessaryDataviewInstanceSetUint8Spread,
  'no-unnecessary-date-instance-get-time-spread': adaptedNoUnnecessaryDateInstanceGetTimeSpread,
  'no-unnecessary-date-instance-set-time-spread': adaptedNoUnnecessaryDateInstanceSetTimeSpread,
  'no-unnecessary-date-instance-to-json-spread': adaptedNoUnnecessaryDateInstanceToJsonSpread,
  'no-unnecessary-date-instance-value-of-spread': adaptedNoUnnecessaryDateInstanceValueOfSpread,
  'no-unnecessary-dns-get-servers-spread': adaptedNoUnnecessaryDnsGetServersSpread,
  'no-unnecessary-dns-lookup-spread': adaptedNoUnnecessaryDnsLookupSpread,
  'no-unnecessary-dns-resolve-4-spread': adaptedNoUnnecessaryDnsResolve4Spread,
  'no-unnecessary-dns-resolve-6-spread': adaptedNoUnnecessaryDnsResolve6Spread,
  'no-unnecessary-dns-resolve-any-spread': adaptedNoUnnecessaryDnsResolveAnySpread,
  'no-unnecessary-dns-resolve-cname-spread': adaptedNoUnnecessaryDnsResolveCnameSpread,
  'no-unnecessary-dns-resolve-mx-spread': adaptedNoUnnecessaryDnsResolveMxSpread,
  'no-unnecessary-dns-resolve-ns-spread': adaptedNoUnnecessaryDnsResolveNsSpread,
  'no-unnecessary-dns-resolve-ptr-spread': adaptedNoUnnecessaryDnsResolvePtrSpread,
  'no-unnecessary-dns-resolve-spread': adaptedNoUnnecessaryDnsResolveSpread,
  'no-unnecessary-dns-resolve-srv-spread': adaptedNoUnnecessaryDnsResolveSrvSpread,
  'no-unnecessary-dns-resolve-txt-spread': adaptedNoUnnecessaryDnsResolveTxtSpread,
  'no-unnecessary-dns-reverse-spread': adaptedNoUnnecessaryDnsReverseSpread,
  'no-unnecessary-dns-set-servers-spread': adaptedNoUnnecessaryDnsSetServersSpread,
  'no-unnecessary-error-instance-to-string-spread': adaptedNoUnnecessaryErrorInstanceToStringSpread,
  'no-unnecessary-finalization-registry-instance-register-spread': adaptedNoUnnecessaryFinalizationRegistryInstanceRegisterSpread,
  'no-unnecessary-finalization-registry-instance-unregister-spread': adaptedNoUnnecessaryFinalizationRegistryInstanceUnregisterSpread,
  'no-unnecessary-gl-attach-shader-spread': adaptedNoUnnecessaryGlAttachShaderSpread,
  'no-unnecessary-gl-bind-buffer-spread': adaptedNoUnnecessaryGlBindBufferSpread,
  'no-unnecessary-gl-blend-func-spread': adaptedNoUnnecessaryGlBlendFuncSpread,
  'no-unnecessary-gl-buffer-data-spread': adaptedNoUnnecessaryGlBufferDataSpread,
  'no-unnecessary-gl-clear-color-spread': adaptedNoUnnecessaryGlClearColorSpread,
  'no-unnecessary-gl-clear-spread': adaptedNoUnnecessaryGlClearSpread,
  'no-unnecessary-gl-compile-shader-spread': adaptedNoUnnecessaryGlCompileShaderSpread,
  'no-unnecessary-gl-create-buffer-spread': adaptedNoUnnecessaryGlCreateBufferSpread,
  'no-unnecessary-gl-create-program-spread': adaptedNoUnnecessaryGlCreateProgramSpread,
  'no-unnecessary-gl-create-shader-spread': adaptedNoUnnecessaryGlCreateShaderSpread,
  'no-unnecessary-gl-depth-func-spread': adaptedNoUnnecessaryGlDepthFuncSpread,
  'no-unnecessary-gl-disable-spread': adaptedNoUnnecessaryGlDisableSpread,
  'no-unnecessary-gl-draw-arrays-spread': adaptedNoUnnecessaryGlDrawArraysSpread,
  'no-unnecessary-gl-draw-elements-spread': adaptedNoUnnecessaryGlDrawElementsSpread,
  'no-unnecessary-gl-enable-spread': adaptedNoUnnecessaryGlEnableSpread,
  'no-unnecessary-gl-enable-vertex-attrib-array-spread': adaptedNoUnnecessaryGlEnableVertexAttribArraySpread,
  'no-unnecessary-gl-get-attrib-location-spread': adaptedNoUnnecessaryGlGetAttribLocationSpread,
  'no-unnecessary-gl-get-uniform-location-spread': adaptedNoUnnecessaryGlGetUniformLocationSpread,
  'no-unnecessary-gl-link-program-spread': adaptedNoUnnecessaryGlLinkProgramSpread,
  'no-unnecessary-gl-shader-source-spread': adaptedNoUnnecessaryGlShaderSourceSpread,
  'no-unnecessary-gl-use-program-spread': adaptedNoUnnecessaryGlUseProgramSpread,
  'no-unnecessary-gl-vertex-attrib-pointer-spread': adaptedNoUnnecessaryGlVertexAttribPointerSpread,
  'no-unnecessary-gl-viewport-spread': adaptedNoUnnecessaryGlViewportSpread,
  'no-unnecessary-math-clamp-spread': adaptedNoUnnecessaryMathClampSpread,
  'no-unnecessary-math-scale-spread': adaptedNoUnnecessaryMathScaleSpread,
  'no-unnecessary-math-expm1-spread': adaptedNoUnnecessaryMathExpm1Spread,
  'no-unnecessary-math-log1p-spread': adaptedNoUnnecessaryMathLog1pSpread,
  'no-unnecessary-math-sinh-spread': adaptedNoUnnecessaryMathSinhSpread,
  'no-unnecessary-math-cosh-spread': adaptedNoUnnecessaryMathCoshSpread,
  'no-unnecessary-math-tanh-spread': adaptedNoUnnecessaryMathTanhSpread,
  'no-unnecessary-net-connect-spread': adaptedNoUnnecessaryNetConnectSpread,
  'no-unnecessary-net-create-connection-spread': adaptedNoUnnecessaryNetCreateConnectionSpread,
  'no-unnecessary-net-create-server-spread': adaptedNoUnnecessaryNetCreateServerSpread,
  'no-unnecessary-number-instance-to-exponential-spread': adaptedNoUnnecessaryNumberInstanceToExponentialSpread,
  'no-unnecessary-number-instance-to-fixed-spread': adaptedNoUnnecessaryNumberInstanceToFixedSpread,
  'no-unnecessary-number-instance-to-locale-string-spread': adaptedNoUnnecessaryNumberInstanceToLocaleStringSpread,
  'no-unnecessary-number-instance-to-precision-spread': adaptedNoUnnecessaryNumberInstanceToPrecisionSpread,
  'no-unnecessary-number-instance-to-string-spread': adaptedNoUnnecessaryNumberInstanceToStringSpread,
  'no-unnecessary-number-instance-value-of-spread': adaptedNoUnnecessaryNumberInstanceValueOfSpread,
  'no-unnecessary-object-has-own-property-spread': adaptedNoUnnecessaryObjectHasOwnPropertySpread,
  'no-unnecessary-object-is-prototype-of-spread': adaptedNoUnnecessaryObjectIsPrototypeOfSpread,
  'no-unnecessary-object-property-is-enumerable-spread': adaptedNoUnnecessaryObjectPropertyIsEnumerableSpread,
  'no-unnecessary-object-to-locale-string-spread': adaptedNoUnnecessaryObjectToLocaleStringSpread,
  'no-unnecessary-object-to-string-spread': adaptedNoUnnecessaryObjectToStringSpread,
  'no-unnecessary-object-value-of-spread': adaptedNoUnnecessaryObjectValueOfSpread,
  'no-unnecessary-promise-resolve-spread': adaptedNoUnnecessaryPromiseResolveSpread,
  'no-unnecessary-promise-with-resolvers-spread': adaptedNoUnnecessaryPromiseWithResolversSpread,
  'no-unnecessary-readline-close-spread': adaptedNoUnnecessaryReadlineCloseSpread,
  'no-unnecessary-readline-create-interface-spread': adaptedNoUnnecessaryReadlineCreateInterfaceSpread,
  'no-unnecessary-readline-prompt-spread': adaptedNoUnnecessaryReadlinePromptSpread,
  'no-unnecessary-readline-question-spread': adaptedNoUnnecessaryReadlineQuestionSpread,
  'no-unnecessary-readline-write-spread': adaptedNoUnnecessaryReadlineWriteSpread,
  'no-unnecessary-regexp-instance-exec-spread': adaptedNoUnnecessaryRegexpInstanceExecSpread,
  'no-unnecessary-regexp-instance-test-spread': adaptedNoUnnecessaryRegexpInstanceTestSpread,
  'no-unnecessary-regexp-instance-to-string-spread': adaptedNoUnnecessaryRegexpInstanceToStringSpread,
  'no-unnecessary-shared-array-buffer-instance-grow-spread': adaptedNoUnnecessarySharedArrayBufferInstanceGrowSpread,
  'no-unnecessary-shared-array-buffer-instance-slice-spread': adaptedNoUnnecessarySharedArrayBufferInstanceSliceSpread,
  'no-unnecessary-stderr-end-spread': adaptedNoUnnecessaryStderrEndSpread,
  'no-unnecessary-stderr-write-spread': adaptedNoUnnecessaryStderrWriteSpread,
  'no-unnecessary-stdin-pipe-spread': adaptedNoUnnecessaryStdinPipeSpread,
  'no-unnecessary-stdin-push-spread': adaptedNoUnnecessaryStdinPushSpread,
  'no-unnecessary-stdin-read-spread': adaptedNoUnnecessaryStdinReadSpread,
  'no-unnecessary-stdout-end-spread': adaptedNoUnnecessaryStdoutEndSpread,
  'no-unnecessary-stdout-write-spread': adaptedNoUnnecessaryStdoutWriteSpread,
  'no-unnecessary-symbol-instance-description-spread': adaptedNoUnnecessarySymbolInstanceDescriptionSpread,
  'no-unnecessary-symbol-instance-to-string-spread': adaptedNoUnnecessarySymbolInstanceToStringSpread,
  'no-unnecessary-symbol-instance-value-of-spread': adaptedNoUnnecessarySymbolInstanceValueOfSpread,
  'no-unnecessary-weak-ref-instance-deref-spread': adaptedNoUnnecessaryWeakRefInstanceDerefSpread,
  'no-unnecessary-zlib-brotli-compress-spread': adaptedNoUnnecessaryZlibBrotliCompressSpread,
  'no-unnecessary-zlib-brotli-compress-sync-spread': adaptedNoUnnecessaryZlibBrotliCompressSyncSpread,
  'no-unnecessary-zlib-brotli-decompress-spread': adaptedNoUnnecessaryZlibBrotliDecompressSpread,
  'no-unnecessary-zlib-brotli-decompress-sync-spread': adaptedNoUnnecessaryZlibBrotliDecompressSyncSpread,
  'no-unnecessary-zlib-deflate-spread': adaptedNoUnnecessaryZlibDeflateSpread,
  'no-unnecessary-zlib-deflate-sync-spread': adaptedNoUnnecessaryZlibDeflateSyncSpread,
  'no-unnecessary-zlib-gunzip-spread': adaptedNoUnnecessaryZlibGunzipSpread,
  'no-unnecessary-zlib-gunzip-sync-spread': adaptedNoUnnecessaryZlibGunzipSyncSpread,
  'no-unnecessary-zlib-gzip-spread': adaptedNoUnnecessaryZlibGzipSpread,
  'no-unnecessary-zlib-gzip-sync-spread': adaptedNoUnnecessaryZlibGzipSyncSpread,
  'no-unnecessary-zlib-inflate-spread': adaptedNoUnnecessaryZlibInflateSpread,
  'no-unnecessary-zlib-inflate-sync-spread': adaptedNoUnnecessaryZlibInflateSyncSpread,
  'no-unnecessary-function-call-spread': adaptedNoUnnecessaryFunctionCallSpread,
  'no-unnecessary-function-apply-spread': adaptedNoUnnecessaryFunctionApplySpread,
  'no-unnecessary-function-bind-spread': adaptedNoUnnecessaryFunctionBindSpread,
  'no-unnecessary-function-to-string-spread': adaptedNoUnnecessaryFunctionToStringSpread,
  'no-unnecessary-date-to-gmt-string-spread': adaptedNoUnnecessaryDateToGmtStringSpread,
  'no-unnecessary-object-group-by-spread': adaptedNoUnnecessaryObjectGroupBySpread,
  'no-unnecessary-array-buffer-slice-spread': adaptedNoUnnecessaryArrayBufferSliceSpread,
  'no-unnecessary-promise-try-spread': adaptedNoUnnecessaryPromiseTrySpread,
  'no-unnecessary-object-from-entries-spread': adaptedNoUnnecessaryObjectFromEntriesSpread,
  'no-unnecessary-error-to-string-spread': adaptedNoUnnecessaryErrorToStringSpread,
  'no-unnecessary-regex-exec-spread': adaptedNoUnnecessaryRegexExecSpread,
  'no-unnecessary-regex-test-spread': adaptedNoUnnecessaryRegexTestSpread,
  'no-unnecessary-array-buffer-is-view-spread': adaptedNoUnnecessaryArrayBufferIsViewSpread,
  'no-unnecessary-string-from-char-code-spread': adaptedNoUnnecessaryStringFromCharCodeSpread,
  'no-unnecessary-string-from-code-point-spread': adaptedNoUnnecessaryStringFromCodePointSpread,
  'no-unnecessary-string-raw-spread': adaptedNoUnnecessaryStringRawSpread,
  'no-unnecessary-int8-array-from-spread': adaptedNoUnnecessaryInt8ArrayFromSpreadAlias,
  'no-unnecessary-int8-array-of-spread': adaptedNoUnnecessaryInt8ArrayOfSpreadAlias,
  'no-unnecessary-uint8-array-from-spread': adaptedNoUnnecessaryUint8ArrayFromSpreadAlias,
  'no-unnecessary-uint8-array-of-spread': adaptedNoUnnecessaryUint8ArrayOfSpreadAlias,
  'no-unnecessary-uint8-clamped-array-from-spread': adaptedNoUnnecessaryUint8ClampedArrayFromSpreadAlias,
  'no-unnecessary-uint8-clamped-array-of-spread': adaptedNoUnnecessaryUint8ClampedArrayOfSpreadAlias,
  'no-unnecessary-int16-array-from-spread': adaptedNoUnnecessaryInt16ArrayFromSpreadAlias,
  'no-unnecessary-date-set-full-year-spread': adaptedNoUnnecessaryDateSetFullYearSpread,
  'no-unnecessary-date-set-month-spread': adaptedNoUnnecessaryDateSetMonthSpread,
  'no-unnecessary-date-set-date-spread': adaptedNoUnnecessaryDateSetDateSpread,
  'no-unnecessary-date-set-hours-spread': adaptedNoUnnecessaryDateSetHoursSpread,
  'no-unnecessary-date-set-minutes-spread': adaptedNoUnnecessaryDateSetMinutesSpread,
  'no-unnecessary-date-set-seconds-spread': adaptedNoUnnecessaryDateSetSecondsSpread,
  'no-unnecessary-date-set-milliseconds-spread': adaptedNoUnnecessaryDateSetMillisecondsSpread,
  'no-unnecessary-date-set-utc-full-year-spread': adaptedNoUnnecessaryDateSetUtcFullYearSpread,
  'no-unnecessary-date-set-utc-month-spread': adaptedNoUnnecessaryDateSetUtcMonthSpread,
  'no-unnecessary-date-set-utc-date-spread': adaptedNoUnnecessaryDateSetUtcDateSpread,
  'no-unnecessary-date-set-utc-hours-spread': adaptedNoUnnecessaryDateSetUtcHoursSpread,
  'no-unnecessary-date-set-utc-minutes-spread': adaptedNoUnnecessaryDateSetUtcMinutesSpread,
  'no-unnecessary-date-set-utc-seconds-spread': adaptedNoUnnecessaryDateSetUtcSecondsSpread,
  'no-unnecessary-date-set-utc-milliseconds-spread': adaptedNoUnnecessaryDateSetUtcMillisecondsSpread,
  'no-unnecessary-set-clear-spread': adaptedNoUnnecessarySetClearSpread,
  'no-unnecessary-set-keys-spread': adaptedNoUnnecessarySetKeysSpread,
  'no-unnecessary-set-values-spread': adaptedNoUnnecessarySetValuesSpread,
  'no-unnecessary-set-entries-spread': adaptedNoUnnecessarySetEntriesSpread,
  'no-unnecessary-map-keys-spread': adaptedNoUnnecessaryMapKeysSpread,
  'no-unnecessary-map-values-spread': adaptedNoUnnecessaryMapValuesSpread,
  'no-unnecessary-map-entries-spread': adaptedNoUnnecessaryMapEntriesSpread,
    'no-unnecessary-string-to-lower-case-same': adaptedNoUnnecessaryStringToLowerCaseSame,
   'no-unnecessary-string-to-lower-case-spread': adaptedNoUnnecessaryStringToLowerCaseSpread,
   'no-unnecessary-string-to-lower-case-empty': adaptedNoUnnecessaryStringToLowerCaseEmpty,
   'no-unnecessary-string-to-locale-lower-case-spread': adaptedNoUnnecessaryStringToLocaleLowerCaseSpread,
   'no-unnecessary-string-to-upper-case-same': adaptedNoUnnecessaryStringToUpperCaseSame,
   'no-unnecessary-string-to-upper-case-empty': adaptedNoUnnecessaryStringToUpperCaseEmpty,
   'no-unnecessary-string-to-locale-upper-case-spread': adaptedNoUnnecessaryStringToLocaleUpperCaseSpread,
   'no-unnecessary-string-to-upper-case-spread': adaptedNoUnnecessaryStringToUpperCaseSpread,
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
    'no-unnecessary-array-to-sorted-spread': adaptedNoUnnecessaryArrayToSortedSpread,
     'no-unnecessary-to-spliced': adaptedNoUnnecessaryToSpliced,
     'no-unnecessary-array-to-spliced-spread': adaptedNoUnnecessaryArrayToSplicedSpread,
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
     'no-unnecessary-array-with-spread': adaptedNoUnnecessaryArrayWithSpread,
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

export function getRule(ruleId: string): RuleDefinition | undefined {
  return allRules[ruleId]
}

export function getRuleIds(): string[] {
  return Object.keys(allRules)
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
import {
  noUnnecessaryAbortControllerSpreadRule,
  noUnnecessaryAbortSignalSpreadRule,
  noUnnecessaryAbortSignalThrowIfAbortedSpreadRule,
  noUnnecessaryAggregateErrorSpreadRule,
  noUnnecessaryAlertSpreadRule,
  noUnnecessaryArrayBufferInstanceResizeSpreadRule,
  noUnnecessaryArrayBufferInstanceSliceSpreadRule,
  noUnnecessaryArrayBufferInstanceTransferSpreadRule,
  noUnnecessaryArrayBufferSpreadRule,
  noUnnecessaryArrayFromAsyncSpreadRule,
  noUnnecessaryArrayIteratorNextSpreadRule,
  noUnnecessaryAssertCallTrackerCallsSpreadRule,
  noUnnecessaryAssertDeepEqualSpreadRule,
  noUnnecessaryAssertDeepStrictEqualSpreadRule,
  noUnnecessaryAssertDoesNotMatchSpreadRule,
  noUnnecessaryAssertDoesNotRejectSpreadRule,
  noUnnecessaryAssertDoesNotThrowSpreadRule,
  noUnnecessaryAssertEqualSpreadRule,
  noUnnecessaryAssertFailSpreadRule,
  noUnnecessaryAssertIfErrorSpreadRule,
  noUnnecessaryAssertMatchSpreadRule,
  noUnnecessaryAssertNotDeepEqualSpreadRule,
  noUnnecessaryAssertNotDeepStrictEqualSpreadRule,
  noUnnecessaryAssertNotEqualSpreadRule,
  noUnnecessaryAssertNotStrictEqualSpreadRule,
  noUnnecessaryAssertOkSpreadRule,
  noUnnecessaryAssertRejectsSpreadRule,
  noUnnecessaryAssertStrictEqualSpreadRule,
  noUnnecessaryAssertThrowsSpreadRule,
  noUnnecessaryAsyncGeneratorNextSpreadRule,
  noUnnecessaryAsyncGeneratorReturnSpreadRule,
  noUnnecessaryAsyncGeneratorThrowSpreadRule,
  noUnnecessaryAsyncIteratorNextSpreadRule,
  noUnnecessaryAsyncIteratorReturnSpreadRule,
  noUnnecessaryAsyncIteratorThrowSpreadRule,
  noUnnecessaryAtobSpreadRule,
  noUnnecessaryAudioSpreadRule,
  noUnnecessaryBigInt64ArrayAtSpreadRule,
  noUnnecessaryBigInt64ArrayCopyWithinSpreadRule,
  noUnnecessaryBigInt64ArrayEntriesSpreadRule,
  noUnnecessaryBigInt64ArrayEverySpreadRule,
  noUnnecessaryBigInt64ArrayFillSpreadRule,
  noUnnecessaryBigInt64ArrayFilterSpreadRule,
  noUnnecessaryBigInt64ArrayFindIndexSpreadRule,
  noUnnecessaryBigInt64ArrayFindLastIndexSpreadRule,
  noUnnecessaryBigInt64ArrayFindLastSpreadRule,
  noUnnecessaryBigInt64ArrayFindSpreadRule,
  noUnnecessaryBigInt64ArrayForEachSpreadRule,
  noUnnecessaryBigInt64ArrayFromSpreadRule,
  noUnnecessaryBigInt64ArrayIncludesSpreadRule,
  noUnnecessaryBigInt64ArrayIndexOfSpreadRule,
  noUnnecessaryBigInt64ArrayJoinSpreadRule,
  noUnnecessaryBigInt64ArrayKeysSpreadRule,
  noUnnecessaryBigInt64ArrayLastIndexOfSpreadRule,
  noUnnecessaryBigInt64ArrayMapSpreadRule,
  noUnnecessaryBigInt64ArrayOfSpreadRule,
  noUnnecessaryBigInt64ArrayReduceRightSpreadRule,
  noUnnecessaryBigInt64ArrayReduceSpreadRule,
  noUnnecessaryBigInt64ArrayReverseSpreadRule,
  noUnnecessaryBigInt64ArraySetSpreadRule,
  noUnnecessaryBigInt64ArraySliceSpreadRule,
  noUnnecessaryBigInt64ArraySomeSpreadRule,
  noUnnecessaryBigInt64ArraySortSpreadRule,
  noUnnecessaryBigInt64ArraySubarraySpreadRule,
  noUnnecessaryBigInt64ArrayToLocaleStringSpreadRule,
  noUnnecessaryBigInt64ArrayToReversedSpreadRule,
  noUnnecessaryBigInt64ArrayToSortedSpreadRule,
  noUnnecessaryBigInt64ArrayToStringSpreadRule,
  noUnnecessaryBigInt64ArrayValuesSpreadRule,
  noUnnecessaryBigInt64ArrayWithSpreadRule,
  noUnnecessaryBigIntInstanceToLocaleStringSpreadRule,
  noUnnecessaryBigIntInstanceToStringSpreadRule,
  noUnnecessaryBigIntInstanceValueOfSpreadRule,
  noUnnecessaryBigUint64ArrayAtSpreadRule,
  noUnnecessaryBigUint64ArrayCopyWithinSpreadRule,
  noUnnecessaryBigUint64ArrayEntriesSpreadRule,
  noUnnecessaryBigUint64ArrayEverySpreadRule,
  noUnnecessaryBigUint64ArrayFillSpreadRule,
  noUnnecessaryBigUint64ArrayFilterSpreadRule,
  noUnnecessaryBigUint64ArrayFindIndexSpreadRule,
  noUnnecessaryBigUint64ArrayFindLastIndexSpreadRule,
  noUnnecessaryBigUint64ArrayFindLastSpreadRule,
  noUnnecessaryBigUint64ArrayFindSpreadRule,
  noUnnecessaryBigUint64ArrayForEachSpreadRule,
  noUnnecessaryBigUint64ArrayFromSpreadRule,
  noUnnecessaryBigUint64ArrayIncludesSpreadRule,
  noUnnecessaryBigUint64ArrayIndexOfSpreadRule,
  noUnnecessaryBigUint64ArrayJoinSpreadRule,
  noUnnecessaryBigUint64ArrayKeysSpreadRule,
  noUnnecessaryBigUint64ArrayLastIndexOfSpreadRule,
  noUnnecessaryBigUint64ArrayMapSpreadRule,
  noUnnecessaryBigUint64ArrayOfSpreadRule,
  noUnnecessaryBigUint64ArrayReduceRightSpreadRule,
  noUnnecessaryBigUint64ArrayReduceSpreadRule,
  noUnnecessaryBigUint64ArrayReverseSpreadRule,
  noUnnecessaryBigUint64ArraySetSpreadRule,
  noUnnecessaryBigUint64ArraySliceSpreadRule,
  noUnnecessaryBigUint64ArraySomeSpreadRule,
  noUnnecessaryBigUint64ArraySortSpreadRule,
  noUnnecessaryBigUint64ArraySubarraySpreadRule,
  noUnnecessaryBigUint64ArrayToLocaleStringSpreadRule,
  noUnnecessaryBigUint64ArrayToReversedSpreadRule,
  noUnnecessaryBigUint64ArrayToSortedSpreadRule,
  noUnnecessaryBigUint64ArrayToStringSpreadRule,
  noUnnecessaryBigUint64ArrayValuesSpreadRule,
  noUnnecessaryBigUint64ArrayWithSpreadRule,
  noUnnecessaryBlobInstanceArrayBufferSpreadRule,
  noUnnecessaryBlobInstanceSliceSpreadRule,
  noUnnecessaryBlobInstanceStreamSpreadRule,
  noUnnecessaryBlobInstanceTextSpreadRule,
  noUnnecessaryBlobSpreadRule,
  noUnnecessaryBooleanInstanceToStringSpreadRule,
  noUnnecessaryBooleanInstanceValueOfSpreadRule,
  noUnnecessaryBroadcastChannelInstanceCloseSpreadRule,
  noUnnecessaryBroadcastChannelInstancePostMessageSpreadRule,
  noUnnecessaryBroadcastChannelSpreadRule,
  noUnnecessaryBtoaSpreadRule,
  noUnnecessaryBufferAllocSpreadRule,
  noUnnecessaryBufferAllocUnsafeSlowSpreadRule,
  noUnnecessaryBufferAllocUnsafeSpreadRule,
  noUnnecessaryBufferByteLengthSpreadRule,
  noUnnecessaryBufferCompareSpreadRule,
  noUnnecessaryBufferConcatSpreadRule,
  noUnnecessaryBufferFromSpreadRule,
  noUnnecessaryBufferIsBufferSpreadRule,
  noUnnecessaryBufferIsEncodingSpreadRule,
  noUnnecessaryBufferOfSpreadRule,
  noUnnecessaryCssStyleDeclarationSpreadRule,
  noUnnecessaryCachesDeleteSpreadRule,
  noUnnecessaryCachesHasSpreadRule,
  noUnnecessaryCachesKeysSpreadRule,
  noUnnecessaryCachesMatchSpreadRule,
  noUnnecessaryCachesOpenSpreadRule,
  noUnnecessaryCancelAnimationFrameSpreadRule,
  noUnnecessaryCancelIdleCallbackSpreadRule,
  noUnnecessaryCanvasGetContextSpreadRule,
  noUnnecessaryChildProcessExecFileSpreadRule,
  noUnnecessaryChildProcessExecSpreadRule,
  noUnnecessaryChildProcessForkSpreadRule,
  noUnnecessaryChildProcessInstanceDisconnectSpreadRule,
  noUnnecessaryChildProcessInstanceKillSpreadRule,
  noUnnecessaryChildProcessInstanceRefSpreadRule,
  noUnnecessaryChildProcessInstanceSendSpreadRule,
  noUnnecessaryChildProcessInstanceUnrefSpreadRule,
  noUnnecessaryChildProcessSpawnSpreadRule,
  noUnnecessaryClearIntervalSpreadRule,
  noUnnecessaryClearTimeoutSpreadRule,
  noUnnecessaryConfirmSpreadRule,
  noUnnecessaryCryptoCipherInstanceFinalSpreadRule,
  noUnnecessaryCryptoCipherInstanceUpdateSpreadRule,
  noUnnecessaryCryptoCreateCipherIvSpreadRule,
  noUnnecessaryCryptoCreateCipherSpreadRule,
  noUnnecessaryCryptoCreateDecipherIvSpreadRule,
  noUnnecessaryCryptoCreateDecipherSpreadRule,
  noUnnecessaryCryptoCreateHashInstanceDigestSpreadRule,
  noUnnecessaryCryptoCreateHashInstanceUpdateSpreadRule,
  noUnnecessaryCryptoCreateHashSpreadRule,
  noUnnecessaryCryptoCreateHmacSpreadRule,
  noUnnecessaryCryptoCreatePrivateKeySpreadRule,
  noUnnecessaryCryptoCreatePublicKeySpreadRule,
  noUnnecessaryCryptoCreateSecretKeySpreadRule,
  noUnnecessaryCryptoCreateSignSpreadRule,
  noUnnecessaryCryptoCreateVerifySpreadRule,
  noUnnecessaryCryptoDecipherInstanceFinalSpreadRule,
  noUnnecessaryCryptoDecipherInstanceUpdateSpreadRule,
  noUnnecessaryCryptoGetCiphersSpreadRule,
  noUnnecessaryCryptoGetHashesSpreadRule,
  noUnnecessaryCryptoGetRandomValuesSpreadRule,
  noUnnecessaryCryptoHmacInstanceDigestSpreadRule,
  noUnnecessaryCryptoHmacInstanceUpdateSpreadRule,
  noUnnecessaryCryptoPbkdf2SpreadRule,
  noUnnecessaryCryptoRandomBytesSpreadRule,
  noUnnecessaryCryptoRandomUuidSpreadRule,
  noUnnecessaryCryptoScryptSpreadRule,
  noUnnecessaryCryptoSignInstanceSignSpreadRule,
  noUnnecessaryCryptoSignInstanceUpdateSpreadRule,
  noUnnecessaryCryptoTimingSafeEqualSpreadRule,
  noUnnecessaryCryptoVerifyInstanceUpdateSpreadRule,
  noUnnecessaryCryptoVerifyInstanceVerifySpreadRule,
  noUnnecessaryCtxArcSpreadRule,
  noUnnecessaryCtxArcToSpreadRule,
  noUnnecessaryCtxBeginPathSpreadRule,
  noUnnecessaryCtxBezierCurveToSpreadRule,
  noUnnecessaryCtxClearRectSpreadRule,
  noUnnecessaryCtxClipSpreadRule,
  noUnnecessaryCtxClosePathSpreadRule,
  noUnnecessaryCtxCreateLinearGradientSpreadRule,
  noUnnecessaryCtxCreatePatternSpreadRule,
  noUnnecessaryCtxCreateRadialGradientSpreadRule,
  noUnnecessaryCtxDrawImageSpreadRule,
  noUnnecessaryCtxFillRectSpreadRule,
  noUnnecessaryCtxFillSpreadRule,
  noUnnecessaryCtxFillTextSpreadRule,
  noUnnecessaryCtxGetImageDataSpreadRule,
  noUnnecessaryCtxGetLineDashSpreadRule,
  noUnnecessaryCtxLineToSpreadRule,
  noUnnecessaryCtxMeasureTextSpreadRule,
  noUnnecessaryCtxMoveToSpreadRule,
  noUnnecessaryCtxPutImageDataSpreadRule,
  noUnnecessaryCtxQuadraticCurveToSpreadRule,
  noUnnecessaryCtxResetTransformSpreadRule,
  noUnnecessaryCtxRestoreSpreadRule,
  noUnnecessaryCtxRotateSpreadRule,
  noUnnecessaryCtxSaveSpreadRule,
  noUnnecessaryCtxScaleSpreadRule,
  noUnnecessaryCtxSetLineDashSpreadRule,
  noUnnecessaryCtxSetTransformSpreadRule,
  noUnnecessaryCtxStrokeRectSpreadRule,
  noUnnecessaryCtxStrokeSpreadRule,
  noUnnecessaryCtxStrokeTextSpreadRule,
  noUnnecessaryCtxTransformSpreadRule,
  noUnnecessaryCtxTranslateSpreadRule,
  noUnnecessaryCustomEventSpreadRule,
  noUnnecessaryDomParserSpreadRule,
  noUnnecessaryDomRectSpreadRule,
  noUnnecessaryDataViewSpreadRule,
  noUnnecessaryDataviewGetBigInt64SpreadRule,
  noUnnecessaryDataviewGetBigUint64SpreadRule,
  noUnnecessaryDataviewGetFloat32SpreadRule,
  noUnnecessaryDataviewGetFloat64SpreadRule,
  noUnnecessaryDataviewGetInt16SpreadRule,
  noUnnecessaryDataviewGetInt32SpreadRule,
  noUnnecessaryDataviewGetInt8SpreadRule,
  noUnnecessaryDataviewGetUint16SpreadRule,
  noUnnecessaryDataviewGetUint32SpreadRule,
  noUnnecessaryDataviewGetUint8SpreadRule,
  noUnnecessaryDataviewInstanceGetBigInt64SpreadRule,
  noUnnecessaryDataviewInstanceGetBigUint64SpreadRule,
  noUnnecessaryDataviewInstanceGetFloat32SpreadRule,
  noUnnecessaryDataviewInstanceGetFloat64SpreadRule,
  noUnnecessaryDataviewInstanceGetInt16SpreadRule,
  noUnnecessaryDataviewInstanceGetInt32SpreadRule,
  noUnnecessaryDataviewInstanceGetInt8SpreadRule,
  noUnnecessaryDataviewInstanceGetUint16SpreadRule,
  noUnnecessaryDataviewInstanceGetUint32SpreadRule,
  noUnnecessaryDataviewInstanceGetUint8SpreadRule,
  noUnnecessaryDataviewInstanceSetBigInt64SpreadRule,
  noUnnecessaryDataviewInstanceSetBigUint64SpreadRule,
  noUnnecessaryDataviewInstanceSetFloat32SpreadRule,
  noUnnecessaryDataviewInstanceSetFloat64SpreadRule,
  noUnnecessaryDataviewInstanceSetInt16SpreadRule,
  noUnnecessaryDataviewInstanceSetInt32SpreadRule,
  noUnnecessaryDataviewInstanceSetInt8SpreadRule,
  noUnnecessaryDataviewInstanceSetUint16SpreadRule,
  noUnnecessaryDataviewInstanceSetUint32SpreadRule,
  noUnnecessaryDataviewInstanceSetUint8SpreadRule,
  noUnnecessaryDataviewSetBigInt64SpreadRule,
  noUnnecessaryDataviewSetBigUint64SpreadRule,
  noUnnecessaryDataviewSetFloat32SpreadRule,
  noUnnecessaryDataviewSetFloat64SpreadRule,
  noUnnecessaryDataviewSetInt16SpreadRule,
  noUnnecessaryDataviewSetInt32SpreadRule,
  noUnnecessaryDataviewSetInt8SpreadRule,
  noUnnecessaryDataviewSetUint16SpreadRule,
  noUnnecessaryDataviewSetUint32SpreadRule,
  noUnnecessaryDataviewSetUint8SpreadRule,
  noUnnecessaryDateGetDateSpreadRule,
  noUnnecessaryDateGetDaySpreadRule,
  noUnnecessaryDateGetFullYearSpreadRule,
  noUnnecessaryDateGetHoursSpreadRule,
  noUnnecessaryDateGetMillisecondsSpreadRule,
  noUnnecessaryDateGetMinutesSpreadRule,
  noUnnecessaryDateGetMonthSpreadRule,
  noUnnecessaryDateGetSecondsSpreadRule,
  noUnnecessaryDateGetTimeSpreadRule,
  noUnnecessaryDateGetTimezoneOffsetSpreadRule,
  noUnnecessaryDateGetUTCDateSpreadRule,
  noUnnecessaryDateGetUTCDaySpreadRule,
  noUnnecessaryDateGetUTCFullyearSpreadRule,
  noUnnecessaryDateGetUTCHoursSpreadRule,
  noUnnecessaryDateGetUTCMillisecondsSpreadRule,
  noUnnecessaryDateGetUTCMinutesSpreadRule,
  noUnnecessaryDateGetUTCMonthSpreadRule,
  noUnnecessaryDateGetUTCSecondsSpreadRule,
  noUnnecessaryDateInstanceGetTimeSpreadRule,
  noUnnecessaryDateInstanceSetTimeSpreadRule,
  noUnnecessaryDateInstanceToJsonSpreadRule,
  noUnnecessaryDateInstanceValueOfSpreadRule,
  noUnnecessaryDateNowSpreadRule,
  noUnnecessaryDateParseSpreadRule,
  noUnnecessaryDateSpreadRule,
  noUnnecessaryDateToDateStringSpreadRule,
  noUnnecessaryDateToISOStringSpreadRule,
  noUnnecessaryDateToJSONSpreadRule,
  noUnnecessaryDateToLocaleDateStringSpreadRule,
  noUnnecessaryDateToLocaleStringSpreadRule,
  noUnnecessaryDateToLocaleTimeStringSpreadRule,
  noUnnecessaryDateToStringSpreadRule,
  noUnnecessaryDateToTimeStringSpreadRule,
  noUnnecessaryDateToUTCStringSpreadRule,
  noUnnecessaryDateUTCSpreadRule,
  noUnnecessaryDateValueOfSpreadRule,
  noUnnecessaryDnsGetServersSpreadRule,
  noUnnecessaryDnsLookupSpreadRule,
  noUnnecessaryDnsResolve4SpreadRule,
  noUnnecessaryDnsResolve6SpreadRule,
  noUnnecessaryDnsResolveAnySpreadRule,
  noUnnecessaryDnsResolveCnameSpreadRule,
  noUnnecessaryDnsResolveMxSpreadRule,
  noUnnecessaryDnsResolveNsSpreadRule,
  noUnnecessaryDnsResolvePtrSpreadRule,
  noUnnecessaryDnsResolveSpreadRule,
  noUnnecessaryDnsResolveSrvSpreadRule,
  noUnnecessaryDnsResolveTxtSpreadRule,
  noUnnecessaryDnsReverseSpreadRule,
  noUnnecessaryDnsSetServersSpreadRule,
  noUnnecessaryDocumentAdoptNodeSpreadRule,
  noUnnecessaryDocumentCloseSpreadRule,
  noUnnecessaryDocumentCreateAttributeSpreadRule,
  noUnnecessaryDocumentCreateCommentSpreadRule,
  noUnnecessaryDocumentCreateDocumentFragmentSpreadRule,
  noUnnecessaryDocumentCreateElementSpreadRule,
  noUnnecessaryDocumentCreateEventSpreadRule,
  noUnnecessaryDocumentCreateNodeIteratorSpreadRule,
  noUnnecessaryDocumentCreateRangeSpreadRule,
  noUnnecessaryDocumentCreateTextNodeSpreadRule,
  noUnnecessaryDocumentCreateTreeWalkerSpreadRule,
  noUnnecessaryDocumentElementFromPointSpreadRule,
  noUnnecessaryDocumentElementsFromPointSpreadRule,
  noUnnecessaryDocumentExitFullscreenSpreadRule,
  noUnnecessaryDocumentExitPictureInPictureSpreadRule,
  noUnnecessaryDocumentExitPointerLockSpreadRule,
  noUnnecessaryDocumentGetElementByIdSpreadRule,
  noUnnecessaryDocumentGetElementsByClassNameSpreadRule,
  noUnnecessaryDocumentGetElementsByNameSpreadRule,
  noUnnecessaryDocumentGetElementsByTagNameSpreadRule,
  noUnnecessaryDocumentGetSelectionSpreadRule,
  noUnnecessaryDocumentHasFocusSpreadRule,
  noUnnecessaryDocumentImportNodeSpreadRule,
  noUnnecessaryDocumentOpenSpreadRule,
  noUnnecessaryDocumentQuerySelectorAllSpreadRule,
  noUnnecessaryDocumentQuerySelectorSpreadRule,
  noUnnecessaryDocumentWriteLnSpreadRule,
  noUnnecessaryDocumentWriteSpreadRule,
  noUnnecessaryElementAfterSpreadRule,
  noUnnecessaryElementAnimateSpreadRule,
  noUnnecessaryElementAppendChildSpreadRule,
  noUnnecessaryElementAppendSpreadRule,
  noUnnecessaryElementAttachShadowSpreadRule,
  noUnnecessaryElementBeforeSpreadRule,
  noUnnecessaryElementBlurSpreadRule,
  noUnnecessaryElementClickSpreadRule,
  noUnnecessaryElementCloneNodeSpreadRule,
  noUnnecessaryElementClosestSpreadRule,
  noUnnecessaryElementContainsSpreadRule,
  noUnnecessaryElementFocusSpreadRule,
  noUnnecessaryElementGetAttributeNamesSpreadRule,
  noUnnecessaryElementGetAttributeSpreadRule,
  noUnnecessaryElementGetBoundingClientRectSpreadRule,
  noUnnecessaryElementGetClientRectsSpreadRule,
  noUnnecessaryElementGetComputedStyleSpreadRule,
  noUnnecessaryElementGetElementsByClassNameSpreadRule,
  noUnnecessaryElementGetElementsByTagNameSpreadRule,
  noUnnecessaryElementHasAttributeSpreadRule,
  noUnnecessaryElementInsertAdjacentElementSpreadRule,
  noUnnecessaryElementInsertAdjacentHtmlSpreadRule,
  noUnnecessaryElementInsertAdjacentTextSpreadRule,
  noUnnecessaryElementInsertBeforeSpreadRule,
  noUnnecessaryElementMatchesSpreadRule,
  noUnnecessaryElementPrependSpreadRule,
  noUnnecessaryElementQuerySelectorAllSpreadRule,
  noUnnecessaryElementQuerySelectorSpreadRule,
  noUnnecessaryElementRemoveAttributeSpreadRule,
  noUnnecessaryElementRemoveChildSpreadRule,
  noUnnecessaryElementRemoveSpreadRule,
  noUnnecessaryElementReplaceChildSpreadRule,
  noUnnecessaryElementReplaceWithSpreadRule,
  noUnnecessaryElementRequestFullscreenSpreadRule,
  noUnnecessaryElementRequestPointerLockSpreadRule,
  noUnnecessaryElementScrollBySpreadRule,
  noUnnecessaryElementScrollIntoViewIfNeededSpreadRule,
  noUnnecessaryElementScrollIntoViewSpreadRule,
  noUnnecessaryElementScrollSpreadRule,
  noUnnecessaryElementScrollToSpreadRule,
  noUnnecessaryElementSetAttributeSpreadRule,
  noUnnecessaryElementToggleAttributeSpreadRule,
  noUnnecessaryErrorInstanceToStringSpreadRule,
  noUnnecessaryErrorSpreadRule,
  noUnnecessaryEvalErrorSpreadRule,
  noUnnecessaryEvalSpreadRule,
  noUnnecessaryEventEmitterAddListenerSpreadRule,
  noUnnecessaryEventEmitterEmitSpreadRule,
  noUnnecessaryEventEmitterEventNamesSpreadRule,
  noUnnecessaryEventEmitterGetMaxListenersSpreadRule,
  noUnnecessaryEventEmitterListenerCountSpreadRule,
  noUnnecessaryEventEmitterListenersSpreadRule,
  noUnnecessaryEventEmitterOffSpreadRule,
  noUnnecessaryEventEmitterOnSpreadRule,
  noUnnecessaryEventEmitterOnceSpreadRule,
  noUnnecessaryEventEmitterPrependListenerSpreadRule,
  noUnnecessaryEventEmitterPrependOnceListenerSpreadRule,
  noUnnecessaryEventEmitterRawListenersSpreadRule,
  noUnnecessaryEventEmitterRemoveAllListenersSpreadRule,
  noUnnecessaryEventEmitterRemoveListenerSpreadRule,
  noUnnecessaryEventEmitterSetMaxListenersSpreadRule,
  noUnnecessaryEventSpreadRule,
  noUnnecessaryFetchSpreadRule,
  noUnnecessaryFileInstanceArrayBufferSpreadRule,
  noUnnecessaryFileInstanceSliceSpreadRule,
  noUnnecessaryFileInstanceStreamSpreadRule,
  noUnnecessaryFileInstanceTextSpreadRule,
  noUnnecessaryFileReaderInstanceAbortSpreadRule,
  noUnnecessaryFileReaderInstanceReadAsArrayBufferSpreadRule,
  noUnnecessaryFileReaderInstanceReadAsBinaryStringSpreadRule,
  noUnnecessaryFileReaderInstanceReadAsDataUrlSpreadRule,
  noUnnecessaryFileReaderInstanceReadAsTextSpreadRule,
  noUnnecessaryFileReaderSpreadRule,
  noUnnecessaryFileSpreadRule,
  noUnnecessaryFinalizationRegistryInstanceRegisterSpreadRule,
  noUnnecessaryFinalizationRegistryInstanceUnregisterSpreadRule,
  noUnnecessaryFinalizationRegistrySpreadRule,
  noUnnecessaryFloat32ArrayAtSpreadRule,
  noUnnecessaryFloat32ArrayCopyWithinSpreadRule,
  noUnnecessaryFloat32ArrayEntriesSpreadRule,
  noUnnecessaryFloat32ArrayEverySpreadRule,
  noUnnecessaryFloat32ArrayFillSpreadRule,
  noUnnecessaryFloat32ArrayFilterSpreadRule,
  noUnnecessaryFloat32ArrayFindIndexSpreadRule,
  noUnnecessaryFloat32ArrayFindLastIndexSpreadRule,
  noUnnecessaryFloat32ArrayFindLastSpreadRule,
  noUnnecessaryFloat32ArrayFindSpreadRule,
  noUnnecessaryFloat32ArrayForEachSpreadRule,
  noUnnecessaryFloat32ArrayFromSpreadRule,
  noUnnecessaryFloat32ArrayIncludesSpreadRule,
  noUnnecessaryFloat32ArrayIndexOfSpreadRule,
  noUnnecessaryFloat32ArrayJoinSpreadRule,
  noUnnecessaryFloat32ArrayKeysSpreadRule,
  noUnnecessaryFloat32ArrayLastIndexOfSpreadRule,
  noUnnecessaryFloat32ArrayMapSpreadRule,
  noUnnecessaryFloat32ArrayOfSpreadRule,
  noUnnecessaryFloat32ArrayReduceRightSpreadRule,
  noUnnecessaryFloat32ArrayReduceSpreadRule,
  noUnnecessaryFloat32ArrayReverseSpreadRule,
  noUnnecessaryFloat32ArraySetSpreadRule,
  noUnnecessaryFloat32ArraySliceSpreadRule,
  noUnnecessaryFloat32ArraySomeSpreadRule,
  noUnnecessaryFloat32ArraySortSpreadRule,
  noUnnecessaryFloat32ArraySubarraySpreadRule,
  noUnnecessaryFloat32ArrayToLocaleStringSpreadRule,
  noUnnecessaryFloat32ArrayToReversedSpreadRule,
  noUnnecessaryFloat32ArrayToSortedSpreadRule,
  noUnnecessaryFloat32ArrayToStringSpreadRule,
  noUnnecessaryFloat32ArrayValuesSpreadRule,
  noUnnecessaryFloat32ArrayWithSpreadRule,
  noUnnecessaryFloat64ArrayAtSpreadRule,
  noUnnecessaryFloat64ArrayCopyWithinSpreadRule,
  noUnnecessaryFloat64ArrayEntriesSpreadRule,
  noUnnecessaryFloat64ArrayEverySpreadRule,
  noUnnecessaryFloat64ArrayFillSpreadRule,
  noUnnecessaryFloat64ArrayFilterSpreadRule,
  noUnnecessaryFloat64ArrayFindIndexSpreadRule,
  noUnnecessaryFloat64ArrayFindLastIndexSpreadRule,
  noUnnecessaryFloat64ArrayFindLastSpreadRule,
  noUnnecessaryFloat64ArrayFindSpreadRule,
  noUnnecessaryFloat64ArrayForEachSpreadRule,
  noUnnecessaryFloat64ArrayFromSpreadRule,
  noUnnecessaryFloat64ArrayIncludesSpreadRule,
  noUnnecessaryFloat64ArrayIndexOfSpreadRule,
  noUnnecessaryFloat64ArrayJoinSpreadRule,
  noUnnecessaryFloat64ArrayKeysSpreadRule,
  noUnnecessaryFloat64ArrayLastIndexOfSpreadRule,
  noUnnecessaryFloat64ArrayMapSpreadRule,
  noUnnecessaryFloat64ArrayOfSpreadRule,
  noUnnecessaryFloat64ArrayReduceRightSpreadRule,
  noUnnecessaryFloat64ArrayReduceSpreadRule,
  noUnnecessaryFloat64ArrayReverseSpreadRule,
  noUnnecessaryFloat64ArraySetSpreadRule,
  noUnnecessaryFloat64ArraySliceSpreadRule,
  noUnnecessaryFloat64ArraySomeSpreadRule,
  noUnnecessaryFloat64ArraySortSpreadRule,
  noUnnecessaryFloat64ArraySubarraySpreadRule,
  noUnnecessaryFloat64ArrayToLocaleStringSpreadRule,
  noUnnecessaryFloat64ArrayToReversedSpreadRule,
  noUnnecessaryFloat64ArrayToSortedSpreadRule,
  noUnnecessaryFloat64ArrayToStringSpreadRule,
  noUnnecessaryFloat64ArrayValuesSpreadRule,
  noUnnecessaryFloat64ArrayWithSpreadRule,
  noUnnecessaryFormDataInstanceAppendSpreadRule,
  noUnnecessaryFormDataInstanceDeleteSpreadRule,
  noUnnecessaryFormDataInstanceEntriesSpreadRule,
  noUnnecessaryFormDataInstanceForEachSpreadRule,
  noUnnecessaryFormDataInstanceGetAllSpreadRule,
  noUnnecessaryFormDataInstanceGetSpreadRule,
  noUnnecessaryFormDataInstanceHasSpreadRule,
  noUnnecessaryFormDataInstanceKeysSpreadRule,
  noUnnecessaryFormDataInstanceSetSpreadRule,
  noUnnecessaryFormDataInstanceValuesSpreadRule,
  noUnnecessaryFormDataSpreadRule,
  noUnnecessaryFsAccessSpreadRule,
  noUnnecessaryFsAppendFileSpreadRule,
  noUnnecessaryFsChmodSpreadRule,
  noUnnecessaryFsChownSpreadRule,
  noUnnecessaryFsCopyFileSpreadRule,
  noUnnecessaryFsCreateReadStreamSpreadRule,
  noUnnecessaryFsCreateWriteStreamSpreadRule,
  noUnnecessaryFsExistsSpreadRule,
  noUnnecessaryFsExistsSyncSpreadRule,
  noUnnecessaryFsFstatSpreadRule,
  noUnnecessaryFsLstatSpreadRule,
  noUnnecessaryFsMkdirSpreadRule,
  noUnnecessaryFsMkdirSyncSpreadRule,
  noUnnecessaryFsReadDirSyncSpreadRule,
  noUnnecessaryFsReadFileSpreadRule,
  noUnnecessaryFsReadFileSyncSpreadRule,
  noUnnecessaryFsReaddirSpreadRule,
  noUnnecessaryFsRenameSpreadRule,
  noUnnecessaryFsRmSpreadRule,
  noUnnecessaryFsRmSyncSpreadRule,
  noUnnecessaryFsRmdirSpreadRule,
  noUnnecessaryFsStatSpreadRule,
  noUnnecessaryFsUnlinkSpreadRule,
  noUnnecessaryFsUnwatchFileSpreadRule,
  noUnnecessaryFsWatchFileSpreadRule,
  noUnnecessaryFsWatchSpreadRule,
  noUnnecessaryFsWriteFileSpreadRule,
  noUnnecessaryFsWriteFileSyncSpreadRule,
  noUnnecessaryGeneratorNextSpreadRule,
  noUnnecessaryGeneratorReturnSpreadRule,
  noUnnecessaryGeneratorThrowSpreadRule,
  noUnnecessaryGlAttachShaderSpreadRule,
  noUnnecessaryGlBindBufferSpreadRule,
  noUnnecessaryGlBlendFuncSpreadRule,
  noUnnecessaryGlBufferDataSpreadRule,
  noUnnecessaryGlClearColorSpreadRule,
  noUnnecessaryGlClearSpreadRule,
  noUnnecessaryGlCompileShaderSpreadRule,
  noUnnecessaryGlCreateBufferSpreadRule,
  noUnnecessaryGlCreateProgramSpreadRule,
  noUnnecessaryGlCreateShaderSpreadRule,
  noUnnecessaryGlDepthFuncSpreadRule,
  noUnnecessaryGlDisableSpreadRule,
  noUnnecessaryGlDrawArraysSpreadRule,
  noUnnecessaryGlDrawElementsSpreadRule,
  noUnnecessaryGlEnableSpreadRule,
  noUnnecessaryGlEnableVertexAttribArraySpreadRule,
  noUnnecessaryGlGetAttribLocationSpreadRule,
  noUnnecessaryGlGetUniformLocationSpreadRule,
  noUnnecessaryGlLinkProgramSpreadRule,
  noUnnecessaryGlShaderSourceSpreadRule,
  noUnnecessaryGlUseProgramSpreadRule,
  noUnnecessaryGlVertexAttribPointerSpreadRule,
  noUnnecessaryGlViewportSpreadRule,
  noUnnecessaryHeadersInstanceAppendSpreadRule,
  noUnnecessaryHeadersInstanceDeleteSpreadRule,
  noUnnecessaryHeadersInstanceEntriesSpreadRule,
  noUnnecessaryHeadersInstanceForEachSpreadRule,
  noUnnecessaryHeadersInstanceGetSpreadRule,
  noUnnecessaryHeadersInstanceHasSpreadRule,
  noUnnecessaryHeadersInstanceKeysSpreadRule,
  noUnnecessaryHeadersInstanceSetSpreadRule,
  noUnnecessaryHeadersInstanceValuesSpreadRule,
  noUnnecessaryHeadersSpreadRule,
  noUnnecessaryHistoryBackSpreadRule,
  noUnnecessaryHistoryForwardSpreadRule,
  noUnnecessaryHistoryGoSpreadRule,
  noUnnecessaryHistoryPushStateSpreadRule,
  noUnnecessaryHistoryReplaceStateSpreadRule,
  noUnnecessaryHttpGetSpreadRule,
  noUnnecessaryHttpRequestSpreadRule,
  noUnnecessaryHttpsGetSpreadRule,
  noUnnecessaryHttpsRequestSpreadRule,
  noUnnecessaryImageDataSpreadRule,
  noUnnecessaryImageSpreadRule,
  noUnnecessaryIndexedDbCmpSpreadRule,
  noUnnecessaryIndexedDbDeleteDatabaseSpreadRule,
  noUnnecessaryIndexedDbOpenSpreadRule,
  noUnnecessaryInt16ArrayAtSpreadRule,
  noUnnecessaryInt16ArrayCopyWithinSpreadRule,
  noUnnecessaryInt16ArrayEntriesSpreadRule,
  noUnnecessaryInt16ArrayEverySpreadRule,
  noUnnecessaryInt16ArrayFillSpreadRule,
  noUnnecessaryInt16ArrayFilterSpreadRule,
  noUnnecessaryInt16ArrayFindIndexSpreadRule,
  noUnnecessaryInt16ArrayFindLastIndexSpreadRule,
  noUnnecessaryInt16ArrayFindLastSpreadRule,
  noUnnecessaryInt16ArrayFindSpreadRule,
  noUnnecessaryInt16ArrayForEachSpreadRule,
  noUnnecessaryInt16ArrayFromSpreadRule,
  noUnnecessaryInt16ArrayIncludesSpreadRule,
  noUnnecessaryInt16ArrayIndexOfSpreadRule,
  noUnnecessaryInt16ArrayJoinSpreadRule,
  noUnnecessaryInt16ArrayKeysSpreadRule,
  noUnnecessaryInt16ArrayLastIndexOfSpreadRule,
  noUnnecessaryInt16ArrayMapSpreadRule,
  noUnnecessaryInt16ArrayOfSpreadRule,
  noUnnecessaryInt16ArrayReduceRightSpreadRule,
  noUnnecessaryInt16ArrayReduceSpreadRule,
  noUnnecessaryInt16ArrayReverseSpreadRule,
  noUnnecessaryInt16ArraySetSpreadRule,
  noUnnecessaryInt16ArraySliceSpreadRule,
  noUnnecessaryInt16ArraySomeSpreadRule,
  noUnnecessaryInt16ArraySortSpreadRule,
  noUnnecessaryInt16ArraySubarraySpreadRule,
  noUnnecessaryInt16ArrayToLocaleStringSpreadRule,
  noUnnecessaryInt16ArrayToReversedSpreadRule,
  noUnnecessaryInt16ArrayToSortedSpreadRule,
  noUnnecessaryInt16ArrayToStringSpreadRule,
  noUnnecessaryInt16ArrayValuesSpreadRule,
  noUnnecessaryInt16ArrayWithSpreadRule,
  noUnnecessaryInt32ArrayAtSpreadRule,
  noUnnecessaryInt32ArrayCopyWithinSpreadRule,
  noUnnecessaryInt32ArrayEntriesSpreadRule,
  noUnnecessaryInt32ArrayEverySpreadRule,
  noUnnecessaryInt32ArrayFillSpreadRule,
  noUnnecessaryInt32ArrayFilterSpreadRule,
  noUnnecessaryInt32ArrayFindIndexSpreadRule,
  noUnnecessaryInt32ArrayFindLastIndexSpreadRule,
  noUnnecessaryInt32ArrayFindLastSpreadRule,
  noUnnecessaryInt32ArrayFindSpreadRule,
  noUnnecessaryInt32ArrayForEachSpreadRule,
  noUnnecessaryInt32ArrayFromSpreadRule,
  noUnnecessaryInt32ArrayIncludesSpreadRule,
  noUnnecessaryInt32ArrayIndexOfSpreadRule,
  noUnnecessaryInt32ArrayJoinSpreadRule,
  noUnnecessaryInt32ArrayKeysSpreadRule,
  noUnnecessaryInt32ArrayLastIndexOfSpreadRule,
  noUnnecessaryInt32ArrayMapSpreadRule,
  noUnnecessaryInt32ArrayOfSpreadRule,
  noUnnecessaryInt32ArrayReduceRightSpreadRule,
  noUnnecessaryInt32ArrayReduceSpreadRule,
  noUnnecessaryInt32ArrayReverseSpreadRule,
  noUnnecessaryInt32ArraySetSpreadRule,
  noUnnecessaryInt32ArraySliceSpreadRule,
  noUnnecessaryInt32ArraySomeSpreadRule,
  noUnnecessaryInt32ArraySortSpreadRule,
  noUnnecessaryInt32ArraySubarraySpreadRule,
  noUnnecessaryInt32ArrayToLocaleStringSpreadRule,
  noUnnecessaryInt32ArrayToReversedSpreadRule,
  noUnnecessaryInt32ArrayToSortedSpreadRule,
  noUnnecessaryInt32ArrayToStringSpreadRule,
  noUnnecessaryInt32ArrayValuesSpreadRule,
  noUnnecessaryInt32ArrayWithSpreadRule,
  noUnnecessaryInt8ArrayAtSpreadRule,
  noUnnecessaryInt8ArrayCopyWithinSpreadRule,
  noUnnecessaryInt8ArrayEntriesSpreadRule,
  noUnnecessaryInt8ArrayEverySpreadRule,
  noUnnecessaryInt8ArrayFillSpreadRule,
  noUnnecessaryInt8ArrayFilterSpreadRule,
  noUnnecessaryInt8ArrayFindIndexSpreadRule,
  noUnnecessaryInt8ArrayFindLastIndexSpreadRule,
  noUnnecessaryInt8ArrayFindLastSpreadRule,
  noUnnecessaryInt8ArrayFindSpreadRule,
  noUnnecessaryInt8ArrayForEachSpreadRule,
  noUnnecessaryInt8ArrayFromSpreadRule,
  noUnnecessaryInt8ArrayIncludesSpreadRule,
  noUnnecessaryInt8ArrayIndexOfSpreadRule,
  noUnnecessaryInt8ArrayJoinSpreadRule,
  noUnnecessaryInt8ArrayKeysSpreadRule,
  noUnnecessaryInt8ArrayLastIndexOfSpreadRule,
  noUnnecessaryInt8ArrayMapSpreadRule,
  noUnnecessaryInt8ArrayOfSpreadRule,
  noUnnecessaryInt8ArrayReduceRightSpreadRule,
  noUnnecessaryInt8ArrayReduceSpreadRule,
  noUnnecessaryInt8ArrayReverseSpreadRule,
  noUnnecessaryInt8ArraySetSpreadRule,
  noUnnecessaryInt8ArraySliceSpreadRule,
  noUnnecessaryInt8ArraySomeSpreadRule,
  noUnnecessaryInt8ArraySortSpreadRule,
  noUnnecessaryInt8ArraySubarraySpreadRule,
  noUnnecessaryInt8ArrayToLocaleStringSpreadRule,
  noUnnecessaryInt8ArrayToReversedSpreadRule,
  noUnnecessaryInt8ArrayToSortedSpreadRule,
  noUnnecessaryInt8ArrayToStringSpreadRule,
  noUnnecessaryInt8ArrayValuesSpreadRule,
  noUnnecessaryInt8ArrayWithSpreadRule,
  noUnnecessaryIntersectionObserverSpreadRule,
  noUnnecessaryIntlCollatorCompareSpreadRule,
  noUnnecessaryIntlDateTimeFormatFormatSpreadRule,
  noUnnecessaryIntlDisplayNamesSpreadRule,
  noUnnecessaryIntlListFormatFormatSpreadRule,
  noUnnecessaryIntlNumberFormatFormatSpreadRule,
  noUnnecessaryIntlPluralRulesSpreadRule,
  noUnnecessaryIntlRelativeTimeFormatSpreadRule,
  noUnnecessaryIntlSegmenterSpreadRule,
  noUnnecessaryIteratorDropSpreadRule,
  noUnnecessaryIteratorEverySpreadRule,
  noUnnecessaryIteratorFilterSpreadRule,
  noUnnecessaryIteratorFindSpreadRule,
  noUnnecessaryIteratorFlatMapSpreadRule,
  noUnnecessaryIteratorForEachSpreadRule,
  noUnnecessaryIteratorMapSpreadRule,
  noUnnecessaryIteratorNextSpreadRule,
  noUnnecessaryIteratorReduceSpreadRule,
  noUnnecessaryIteratorReturnSpreadRule,
  noUnnecessaryIteratorSomeSpreadRule,
  noUnnecessaryIteratorTakeSpreadRule,
  noUnnecessaryIteratorThrowSpreadRule,
  noUnnecessaryIteratorToArraySpreadRule,
  noUnnecessaryLocalStorageClearSpreadRule,
  noUnnecessaryLocalStorageGetItemSpreadRule,
  noUnnecessaryLocalStorageKeySpreadRule,
  noUnnecessaryLocalStorageRemoveItemSpreadRule,
  noUnnecessaryLocalStorageSetItemSpreadRule,
  noUnnecessaryLocationAssignSpreadRule,
  noUnnecessaryLocationReloadSpreadRule,
  noUnnecessaryLocationReplaceSpreadRule,
  noUnnecessaryLocationToStringSpreadRule,
  noUnnecessaryMapClearSpreadRule,
  noUnnecessaryMapDeleteSpreadRule,
  noUnnecessaryMapForEachSpreadRule,
  noUnnecessaryMapGetSpreadRule,
  noUnnecessaryMapHasSpreadRule,
  noUnnecessaryMapIteratorNextSpreadRule,
  noUnnecessaryMapSetSpreadRule,
  noUnnecessaryMapSpreadRule,
  noUnnecessaryMathClampSpreadRule,
  noUnnecessaryMathCoshSpreadRule,
  noUnnecessaryMathExpm1SpreadRule,
  noUnnecessaryMathLog1pSpreadRule,
  noUnnecessaryMathScaleSpreadRule,
  noUnnecessaryMathSinhSpreadRule,
  noUnnecessaryMathTanhSpreadRule,
  noUnnecessaryMessageChannelSpreadRule,
  noUnnecessaryMessagePortCloseSpreadRule,
  noUnnecessaryMessagePortPostMessageSpreadRule,
  noUnnecessaryMessagePortStartSpreadRule,
  noUnnecessaryMutationObserverSpreadRule,
  noUnnecessaryNavigatorCanShareSpreadRule,
  noUnnecessaryNavigatorCancelIdleCallbackSpreadRule,
  noUnnecessaryNavigatorClipboardReadTextSpreadRule,
  noUnnecessaryNavigatorClipboardWriteTextSpreadRule,
  noUnnecessaryNavigatorCookieEnabledSpreadRule,
  noUnnecessaryNavigatorGeolocationClearWatchSpreadRule,
  noUnnecessaryNavigatorGeolocationGetCurrentPositionSpreadRule,
  noUnnecessaryNavigatorGeolocationWatchPositionSpreadRule,
  noUnnecessaryNavigatorGetBatterySpreadRule,
  noUnnecessaryNavigatorGetGamepadsSpreadRule,
  noUnnecessaryNavigatorJavaEnabledSpreadRule,
  noUnnecessaryNavigatorMediaDevicesGetUserMediaSpreadRule,
  noUnnecessaryNavigatorRegisterProtocolHandlerSpreadRule,
  noUnnecessaryNavigatorRequestIdleCallbackSpreadRule,
  noUnnecessaryNavigatorRequestMediaKeySystemAccessSpreadRule,
  noUnnecessaryNavigatorSendBeaconSpreadRule,
  noUnnecessaryNavigatorShareSpreadRule,
  noUnnecessaryNavigatorVibrateSpreadRule,
  noUnnecessaryNetConnectSpreadRule,
  noUnnecessaryNetCreateConnectionSpreadRule,
  noUnnecessaryNetCreateServerSpreadRule,
  noUnnecessaryNumberInstanceToExponentialSpreadRule,
  noUnnecessaryNumberInstanceToFixedSpreadRule,
  noUnnecessaryNumberInstanceToLocaleStringSpreadRule,
  noUnnecessaryNumberInstanceToPrecisionSpreadRule,
  noUnnecessaryNumberInstanceToStringSpreadRule,
  noUnnecessaryNumberInstanceValueOfSpreadRule,
  noUnnecessaryObjectHasOwnPropertySpreadRule,
  noUnnecessaryObjectIsPrototypeOfSpreadRule,
  noUnnecessaryObjectPropertyIsEnumerableSpreadRule,
  noUnnecessaryObjectToLocaleStringSpreadRule,
  noUnnecessaryObjectToStringSpreadRule,
  noUnnecessaryObjectValueOfSpreadRule,
  noUnnecessaryObserverInstanceDisconnectSpreadRule,
  noUnnecessaryObserverInstanceObserveSpreadRule,
  noUnnecessaryObserverInstanceTakeRecordsSpreadRule,
  noUnnecessaryObserverInstanceUnobserveSpreadRule,
  noUnnecessaryOptionSpreadRule,
  noUnnecessaryOsArchSpreadRule,
  noUnnecessaryOsConstantsSpreadRule,
  noUnnecessaryOsCpusSpreadRule,
  noUnnecessaryOsDevNullSpreadRule,
  noUnnecessaryOsEolSpreadRule,
  noUnnecessaryOsFreememSpreadRule,
  noUnnecessaryOsGetPrioritySpreadRule,
  noUnnecessaryOsHomedirSpreadRule,
  noUnnecessaryOsHostnameSpreadRule,
  noUnnecessaryOsLoadavgSpreadRule,
  noUnnecessaryOsNetworkInterfacesSpreadRule,
  noUnnecessaryOsPlatformSpreadRule,
  noUnnecessaryOsReleaseSpreadRule,
  noUnnecessaryOsSetPrioritySpreadRule,
  noUnnecessaryOsTmpdirSpreadRule,
  noUnnecessaryOsTotalmemSpreadRule,
  noUnnecessaryOsTypeSpreadRule,
  noUnnecessaryOsUptimeSpreadRule,
  noUnnecessaryOsUserInfoSpreadRule,
  noUnnecessaryPathBasenameSpreadRule,
  noUnnecessaryPathDirnameSpreadRule,
  noUnnecessaryPathExtnameSpreadRule,
  noUnnecessaryPathFormatSpreadRule,
  noUnnecessaryPathIsAbsoluteSpreadRule,
  noUnnecessaryPathJoinSpreadRule,
  noUnnecessaryPathNormalizeSpreadRule,
  noUnnecessaryPathParseSpreadRule,
  noUnnecessaryPathRelativeSpreadRule,
  noUnnecessaryPathResolveSpreadRule,
  noUnnecessaryPathToNamespacedPathSpreadRule,
  noUnnecessaryPerformanceClearMarksSpreadRule,
  noUnnecessaryPerformanceClearMeasuresSpreadRule,
  noUnnecessaryPerformanceClearResourceTimingsSpreadRule,
  noUnnecessaryPerformanceGetEntriesByNameSpreadRule,
  noUnnecessaryPerformanceGetEntriesByTypeSpreadRule,
  noUnnecessaryPerformanceGetEntriesSpreadRule,
  noUnnecessaryPerformanceMarkSpreadRule,
  noUnnecessaryPerformanceMeasureSpreadRule,
  noUnnecessaryPerformanceNowSpreadRule,
  noUnnecessaryPerformanceObserverSpreadRule,
  noUnnecessaryPerformanceSetResourceTimingBufferSizeSpreadRule,
  noUnnecessaryPrintSpreadRule,
  noUnnecessaryProcessAbortSpreadRule,
  noUnnecessaryProcessArgvSpreadRule,
  noUnnecessaryProcessChdirSpreadRule,
  noUnnecessaryProcessCpuUsageSpreadRule,
  noUnnecessaryProcessCwdSpreadRule,
  noUnnecessaryProcessEnvSpreadRule,
  noUnnecessaryProcessExitSpreadRule,
  noUnnecessaryProcessGetgidSpreadRule,
  noUnnecessaryProcessGetuidSpreadRule,
  noUnnecessaryProcessHrtimeSpreadRule,
  noUnnecessaryProcessKillSpreadRule,
  noUnnecessaryProcessMemoryUsageSpreadRule,
  noUnnecessaryProcessNextTickSpreadRule,
  noUnnecessaryProcessSetgidSpreadRule,
  noUnnecessaryProcessSetuidSpreadRule,
  noUnnecessaryProcessUmaskSpreadRule,
  noUnnecessaryProcessUptimeSpreadRule,
  noUnnecessaryPromiseInstanceCatchSpreadRule,
  noUnnecessaryPromiseInstanceFinallySpreadRule,
  noUnnecessaryPromiseInstanceThenSpreadRule,
  noUnnecessaryPromiseResolveSpreadRule,
  noUnnecessaryPromiseSpreadRule,
  noUnnecessaryPromiseWithResolversSpreadRule,
  noUnnecessaryPromptSpreadRule,
  noUnnecessaryQuerystringEscapeSpreadRule,
  noUnnecessaryQuerystringParseSpreadRule,
  noUnnecessaryQuerystringStringifySpreadRule,
  noUnnecessaryQuerystringUnescapeSpreadRule,
  noUnnecessaryQueueMicrotaskSpreadRule,
  noUnnecessaryRangeErrorSpreadRule,
  noUnnecessaryReadableStreamDestroySpreadRule,
  noUnnecessaryReadableStreamPauseSpreadRule,
  noUnnecessaryReadableStreamPipeSpreadRule,
  noUnnecessaryReadableStreamPushSpreadRule,
  noUnnecessaryReadableStreamReadSpreadRule,
  noUnnecessaryReadableStreamResumeSpreadRule,
  noUnnecessaryReadableStreamUnpipeSpreadRule,
  noUnnecessaryReadlineCloseSpreadRule,
  noUnnecessaryReadlineCreateInterfaceSpreadRule,
  noUnnecessaryReadlinePromptSpreadRule,
  noUnnecessaryReadlineQuestionSpreadRule,
  noUnnecessaryReadlineWriteSpreadRule,
  noUnnecessaryReferenceErrorSpreadRule,
  noUnnecessaryRegExpExecSpreadRule,
  noUnnecessaryRegexpSpreadRule,
  noUnnecessaryRegExpTestSpreadRule,
  noUnnecessaryRegexpInstanceExecSpreadRule,
  noUnnecessaryRegexpInstanceTestSpreadRule,
  noUnnecessaryRegexpInstanceToStringSpreadRule,
  noUnnecessaryReportErrorSpreadRule,
  noUnnecessaryRequestAnimationFrameSpreadRule,
  noUnnecessaryRequestIdleCallbackSpreadRule,
  noUnnecessaryRequestInstanceArrayBufferSpreadRule,
  noUnnecessaryRequestInstanceBlobSpreadRule,
  noUnnecessaryRequestInstanceCloneSpreadRule,
  noUnnecessaryRequestInstanceFormDataSpreadRule,
  noUnnecessaryRequestInstanceJsonSpreadRule,
  noUnnecessaryRequestInstanceTextSpreadRule,
  noUnnecessaryRequestSpreadRule,
  noUnnecessaryResizeObserverSpreadRule,
  noUnnecessaryResponseInstanceArrayBufferSpreadRule,
  noUnnecessaryResponseInstanceBlobSpreadRule,
  noUnnecessaryResponseInstanceCloneSpreadRule,
  noUnnecessaryResponseInstanceFormDataSpreadRule,
  noUnnecessaryResponseInstanceJsonSpreadRule,
  noUnnecessaryResponseInstanceTextSpreadRule,
  noUnnecessaryResponseSpreadRule,
  noUnnecessaryScreenOrientationLockSpreadRule,
  noUnnecessaryScreenOrientationUnlockSpreadRule,
  noUnnecessaryServerAddressSpreadRule,
  noUnnecessaryServerCloseSpreadRule,
  noUnnecessaryServerGetConnectionsSpreadRule,
  noUnnecessaryServerListenSpreadRule,
  noUnnecessaryServerRefSpreadRule,
  noUnnecessaryServerUnrefSpreadRule,
  noUnnecessarySessionStorageClearSpreadRule,
  noUnnecessarySessionStorageGetItemSpreadRule,
  noUnnecessarySessionStorageKeySpreadRule,
  noUnnecessarySessionStorageRemoveItemSpreadRule,
  noUnnecessarySessionStorageSetItemSpreadRule,
  noUnnecessarySetAddSpreadRule,
  noUnnecessarySetDeleteSpreadRule,
  noUnnecessarySetForEachSpreadRule,
  noUnnecessarySetHasSpreadRule,
  noUnnecessarySetIntervalSpreadRule,
  noUnnecessarySetIteratorNextSpreadRule,
  noUnnecessarySetSpreadRule,
  noUnnecessarySetTimeoutSpreadRule,
  noUnnecessarySharedArrayBufferInstanceGrowSpreadRule,
  noUnnecessarySharedArrayBufferInstanceSliceSpreadRule,
  noUnnecessarySharedArrayBufferSliceSpreadRule,
  noUnnecessarySharedArrayBufferSpreadRule,
  noUnnecessarySocketConnectSpreadRule,
  noUnnecessarySocketDestroySpreadRule,
  noUnnecessarySocketEndSpreadRule,
  noUnnecessarySocketPauseSpreadRule,
  noUnnecessarySocketRefSpreadRule,
  noUnnecessarySocketResumeSpreadRule,
  noUnnecessarySocketSetEncodingSpreadRule,
  noUnnecessarySocketSetKeepAliveSpreadRule,
  noUnnecessarySocketSetNoDelaySpreadRule,
  noUnnecessarySocketSetTimeoutSpreadRule,
  noUnnecessarySocketUnrefSpreadRule,
  noUnnecessarySocketWriteSpreadRule,
  noUnnecessaryStderrEndSpreadRule,
  noUnnecessaryStderrWriteSpreadRule,
  noUnnecessaryStdinPipeSpreadRule,
  noUnnecessaryStdinPushSpreadRule,
  noUnnecessaryStdinReadSpreadRule,
  noUnnecessaryStdoutEndSpreadRule,
  noUnnecessaryStdoutWriteSpreadRule,
  noUnnecessaryStreamComposeSpreadRule,
  noUnnecessaryStreamPipelineSpreadRule,
  noUnnecessaryStreamReadableFromSpreadRule,
  noUnnecessaryStringIteratorNextSpreadRule,
  noUnnecessaryStructuredCloneSpreadRule,
  noUnnecessarySymbolForSpreadRule,
  noUnnecessarySymbolInstanceDescriptionSpreadRule,
  noUnnecessarySymbolInstanceToStringSpreadRule,
  noUnnecessarySymbolInstanceValueOfSpreadRule,
  noUnnecessarySymbolKeyForSpreadRule,
  noUnnecessarySyntaxErrorSpreadRule,
  noUnnecessaryTextDecoderInstanceDecodeSpreadRule,
  noUnnecessaryTextDecoderSpreadRule,
  noUnnecessaryTextEncoderInstanceEncodeIntoSpreadRule,
  noUnnecessaryTextEncoderInstanceEncodeSpreadRule,
  noUnnecessaryTextEncoderSpreadRule,
  noUnnecessaryTransformStreamFlushSpreadRule,
  noUnnecessaryTransformStreamTransformSpreadRule,
  noUnnecessaryTypeErrorSpreadRule,
  noUnnecessaryTypedArrayAtSpreadRule,
  noUnnecessaryTypedArrayCopyWithinSpreadRule,
  noUnnecessaryTypedArrayEntriesSpreadRule,
  noUnnecessaryTypedArrayEverySpreadRule,
  noUnnecessaryTypedArrayFillSpreadRule,
  noUnnecessaryTypedArrayFilterSpreadRule,
  noUnnecessaryTypedArrayFindIndexSpreadRule,
  noUnnecessaryTypedArrayFindLastIndexSpreadRule,
  noUnnecessaryTypedArrayFindLastSpreadRule,
  noUnnecessaryTypedArrayFindSpreadRule,
  noUnnecessaryTypedArrayForEachSpreadRule,
  noUnnecessaryTypedArrayIncludesSpreadRule,
  noUnnecessaryTypedArrayIndexOfSpreadRule,
  noUnnecessaryTypedArrayJoinSpreadRule,
  noUnnecessaryTypedArrayKeysSpreadRule,
  noUnnecessaryTypedArrayLastIndexOfSpreadRule,
  noUnnecessaryTypedArrayMapSpreadRule,
  noUnnecessaryTypedArrayReduceRightSpreadRule,
  noUnnecessaryTypedArrayReduceSpreadRule,
  noUnnecessaryTypedArrayReverseSpreadRule,
  noUnnecessaryTypedArraySetSpreadRule,
  noUnnecessaryTypedArraySliceSpreadRule,
  noUnnecessaryTypedArraySomeSpreadRule,
  noUnnecessaryTypedArraySortSpreadRule,
  noUnnecessaryTypedArraySubArraySpreadRule,
  noUnnecessaryTypedArrayToLocaleStringSpreadRule,
  noUnnecessaryTypedArrayToStringSpreadRule,
  noUnnecessaryTypedArrayValuesSpreadRule,
  noUnnecessaryTypedArrayWithSpreadRule,
  noUnnecessaryUriErrorSpreadRule,
  noUnnecessaryUrlSearchParamsSpreadRule,
  noUnnecessaryUrlSpreadRule,
  noUnnecessaryUint16ArrayAtSpreadRule,
  noUnnecessaryUint16ArrayCopyWithinSpreadRule,
  noUnnecessaryUint16ArrayEntriesSpreadRule,
  noUnnecessaryUint16ArrayEverySpreadRule,
  noUnnecessaryUint16ArrayFillSpreadRule,
  noUnnecessaryUint16ArrayFilterSpreadRule,
  noUnnecessaryUint16ArrayFindIndexSpreadRule,
  noUnnecessaryUint16ArrayFindLastIndexSpreadRule,
  noUnnecessaryUint16ArrayFindLastSpreadRule,
  noUnnecessaryUint16ArrayFindSpreadRule,
  noUnnecessaryUint16ArrayForEachSpreadRule,
  noUnnecessaryUint16ArrayFromSpreadRule,
  noUnnecessaryUint16ArrayIncludesSpreadRule,
  noUnnecessaryUint16ArrayIndexOfSpreadRule,
  noUnnecessaryUint16ArrayJoinSpreadRule,
  noUnnecessaryUint16ArrayKeysSpreadRule,
  noUnnecessaryUint16ArrayLastIndexOfSpreadRule,
  noUnnecessaryUint16ArrayMapSpreadRule,
  noUnnecessaryUint16ArrayOfSpreadRule,
  noUnnecessaryUint16ArrayReduceRightSpreadRule,
  noUnnecessaryUint16ArrayReduceSpreadRule,
  noUnnecessaryUint16ArrayReverseSpreadRule,
  noUnnecessaryUint16ArraySetSpreadRule,
  noUnnecessaryUint16ArraySliceSpreadRule,
  noUnnecessaryUint16ArraySomeSpreadRule,
  noUnnecessaryUint16ArraySortSpreadRule,
  noUnnecessaryUint16ArraySubarraySpreadRule,
  noUnnecessaryUint16ArrayToLocaleStringSpreadRule,
  noUnnecessaryUint16ArrayToReversedSpreadRule,
  noUnnecessaryUint16ArrayToSortedSpreadRule,
  noUnnecessaryUint16ArrayToStringSpreadRule,
  noUnnecessaryUint16ArrayValuesSpreadRule,
  noUnnecessaryUint16ArrayWithSpreadRule,
  noUnnecessaryUint32ArrayAtSpreadRule,
  noUnnecessaryUint32ArrayCopyWithinSpreadRule,
  noUnnecessaryUint32ArrayEntriesSpreadRule,
  noUnnecessaryUint32ArrayEverySpreadRule,
  noUnnecessaryUint32ArrayFillSpreadRule,
  noUnnecessaryUint32ArrayFilterSpreadRule,
  noUnnecessaryUint32ArrayFindIndexSpreadRule,
  noUnnecessaryUint32ArrayFindLastIndexSpreadRule,
  noUnnecessaryUint32ArrayFindLastSpreadRule,
  noUnnecessaryUint32ArrayFindSpreadRule,
  noUnnecessaryUint32ArrayForEachSpreadRule,
  noUnnecessaryUint32ArrayFromSpreadRule,
  noUnnecessaryUint32ArrayIncludesSpreadRule,
  noUnnecessaryUint32ArrayIndexOfSpreadRule,
  noUnnecessaryUint32ArrayJoinSpreadRule,
  noUnnecessaryUint32ArrayKeysSpreadRule,
  noUnnecessaryUint32ArrayLastIndexOfSpreadRule,
  noUnnecessaryUint32ArrayMapSpreadRule,
  noUnnecessaryUint32ArrayOfSpreadRule,
  noUnnecessaryUint32ArrayReduceRightSpreadRule,
  noUnnecessaryUint32ArrayReduceSpreadRule,
  noUnnecessaryUint32ArrayReverseSpreadRule,
  noUnnecessaryUint32ArraySetSpreadRule,
  noUnnecessaryUint32ArraySliceSpreadRule,
  noUnnecessaryUint32ArraySomeSpreadRule,
  noUnnecessaryUint32ArraySortSpreadRule,
  noUnnecessaryUint32ArraySubarraySpreadRule,
  noUnnecessaryUint32ArrayToLocaleStringSpreadRule,
  noUnnecessaryUint32ArrayToReversedSpreadRule,
  noUnnecessaryUint32ArrayToSortedSpreadRule,
  noUnnecessaryUint32ArrayToStringSpreadRule,
  noUnnecessaryUint32ArrayValuesSpreadRule,
  noUnnecessaryUint32ArrayWithSpreadRule,
  noUnnecessaryUint8ArrayAtSpreadRule,
  noUnnecessaryUint8ArrayCopyWithinSpreadRule,
  noUnnecessaryUint8ArrayEntriesSpreadRule,
  noUnnecessaryUint8ArrayEverySpreadRule,
  noUnnecessaryUint8ArrayFillSpreadRule,
  noUnnecessaryUint8ArrayFilterSpreadRule,
  noUnnecessaryUint8ArrayFindIndexSpreadRule,
  noUnnecessaryUint8ArrayFindLastIndexSpreadRule,
  noUnnecessaryUint8ArrayFindLastSpreadRule,
  noUnnecessaryUint8ArrayFindSpreadRule,
  noUnnecessaryUint8ArrayForEachSpreadRule,
  noUnnecessaryUint8ArrayFromSpreadRule,
  noUnnecessaryUint8ArrayIncludesSpreadRule,
  noUnnecessaryUint8ArrayIndexOfSpreadRule,
  noUnnecessaryUint8ArrayJoinSpreadRule,
  noUnnecessaryUint8ArrayKeysSpreadRule,
  noUnnecessaryUint8ArrayLastIndexOfSpreadRule,
  noUnnecessaryUint8ArrayMapSpreadRule,
  noUnnecessaryUint8ArrayOfSpreadRule,
  noUnnecessaryUint8ArrayReduceRightSpreadRule,
  noUnnecessaryUint8ArrayReduceSpreadRule,
  noUnnecessaryUint8ArrayReverseSpreadRule,
  noUnnecessaryUint8ArraySetSpreadRule,
  noUnnecessaryUint8ArraySliceSpreadRule,
  noUnnecessaryUint8ArraySomeSpreadRule,
  noUnnecessaryUint8ArraySortSpreadRule,
  noUnnecessaryUint8ArraySubarraySpreadRule,
  noUnnecessaryUint8ArrayToLocaleStringSpreadRule,
  noUnnecessaryUint8ArrayToReversedSpreadRule,
  noUnnecessaryUint8ArrayToSortedSpreadRule,
  noUnnecessaryUint8ArrayToStringSpreadRule,
  noUnnecessaryUint8ArrayValuesSpreadRule,
  noUnnecessaryUint8ArrayWithSpreadRule,
  noUnnecessaryUint8ClampedArrayAtSpreadRule,
  noUnnecessaryUint8ClampedArrayCopyWithinSpreadRule,
  noUnnecessaryUint8ClampedArrayEntriesSpreadRule,
  noUnnecessaryUint8ClampedArrayEverySpreadRule,
  noUnnecessaryUint8ClampedArrayFillSpreadRule,
  noUnnecessaryUint8ClampedArrayFilterSpreadRule,
  noUnnecessaryUint8ClampedArrayFindIndexSpreadRule,
  noUnnecessaryUint8ClampedArrayFindLastIndexSpreadRule,
  noUnnecessaryUint8ClampedArrayFindLastSpreadRule,
  noUnnecessaryUint8ClampedArrayFindSpreadRule,
  noUnnecessaryUint8ClampedArrayForEachSpreadRule,
  noUnnecessaryUint8ClampedArrayFromSpreadRule,
  noUnnecessaryUint8ClampedArrayIncludesSpreadRule,
  noUnnecessaryUint8ClampedArrayIndexOfSpreadRule,
  noUnnecessaryUint8ClampedArrayJoinSpreadRule,
  noUnnecessaryUint8ClampedArrayKeysSpreadRule,
  noUnnecessaryUint8ClampedArrayLastIndexOfSpreadRule,
  noUnnecessaryUint8ClampedArrayMapSpreadRule,
  noUnnecessaryUint8ClampedArrayOfSpreadRule,
  noUnnecessaryUint8ClampedArrayReduceRightSpreadRule,
  noUnnecessaryUint8ClampedArrayReduceSpreadRule,
  noUnnecessaryUint8ClampedArrayReverseSpreadRule,
  noUnnecessaryUint8ClampedArraySetSpreadRule,
  noUnnecessaryUint8ClampedArraySliceSpreadRule,
  noUnnecessaryUint8ClampedArraySomeSpreadRule,
  noUnnecessaryUint8ClampedArraySortSpreadRule,
  noUnnecessaryUint8ClampedArraySubarraySpreadRule,
  noUnnecessaryUint8ClampedArrayToLocaleStringSpreadRule,
  noUnnecessaryUint8ClampedArrayToReversedSpreadRule,
  noUnnecessaryUint8ClampedArrayToSortedSpreadRule,
  noUnnecessaryUint8ClampedArrayToStringSpreadRule,
  noUnnecessaryUint8ClampedArrayValuesSpreadRule,
  noUnnecessaryUint8ClampedArrayWithSpreadRule,
  noUnnecessaryUrlDomainToAsciiSpreadRule,
  noUnnecessaryUrlDomainToUnicodeSpreadRule,
  noUnnecessaryUrlFormatSpreadRule,
  noUnnecessaryUrlInstanceToJsonSpreadRule,
  noUnnecessaryUrlInstanceToStringSpreadRule,
  noUnnecessaryUrlParseNodeSpreadRule,
  noUnnecessaryUrlResolveSpreadRule,
  noUnnecessaryUrlSearchParamsInstanceAppendSpreadRule,
  noUnnecessaryUrlSearchParamsInstanceDeleteSpreadRule,
  noUnnecessaryUrlSearchParamsInstanceEntriesSpreadRule,
  noUnnecessaryUrlSearchParamsInstanceForEachSpreadRule,
  noUnnecessaryUrlSearchParamsInstanceGetAllSpreadRule,
  noUnnecessaryUrlSearchParamsInstanceGetSpreadRule,
  noUnnecessaryUrlSearchParamsInstanceHasSpreadRule,
  noUnnecessaryUrlSearchParamsInstanceKeysSpreadRule,
  noUnnecessaryUrlSearchParamsInstanceSetSpreadRule,
  noUnnecessaryUrlSearchParamsInstanceSortSpreadRule,
  noUnnecessaryUrlSearchParamsInstanceToStringSpreadRule,
  noUnnecessaryUrlSearchParamsInstanceValuesSpreadRule,
  noUnnecessaryUtilCallbackifySpreadRule,
  noUnnecessaryUtilDeprecateSpreadRule,
  noUnnecessaryUtilFormatSpreadRule,
  noUnnecessaryUtilInspectSpreadRule,
  noUnnecessaryUtilIsDeepStrictEqualSpreadRule,
  noUnnecessaryUtilPromisifySpreadRule,
  noUnnecessaryUtilTextDecoderDecodeSpreadRule,
  noUnnecessaryUtilTypesIsDateSpreadRule,
  noUnnecessaryWeakMapDeleteSpreadRule,
  noUnnecessaryWeakMapGetSpreadRule,
  noUnnecessaryWeakMapHasSpreadRule,
  noUnnecessaryWeakMapSetSpreadRule,
  noUnnecessaryWeakMapSpreadRule,
  noUnnecessaryWeakRefInstanceDerefSpreadRule,
  noUnnecessaryWeakRefSpreadRule,
  noUnnecessaryWeakSetAddSpreadRule,
  noUnnecessaryWeakSetDeleteSpreadRule,
  noUnnecessaryWeakSetHasSpreadRule,
  noUnnecessaryWeakSetSpreadRule,
  noUnnecessaryWindowAlertSpreadRule,
  noUnnecessaryWindowAtobSpreadRule,
  noUnnecessaryWindowBlurSpreadRule,
  noUnnecessaryWindowBtoaSpreadRule,
  noUnnecessaryWindowCancelAnimationFrameSpreadRule,
  noUnnecessaryWindowCancelIdleCallbackSpreadRule,
  noUnnecessaryWindowClearIntervalSpreadRule,
  noUnnecessaryWindowClearTimeoutSpreadRule,
  noUnnecessaryWindowCloseSpreadRule,
  noUnnecessaryWindowConfirmSpreadRule,
  noUnnecessaryWindowCreateImageBitmapSpreadRule,
  noUnnecessaryWindowFetchSpreadRule,
  noUnnecessaryWindowFocusSpreadRule,
  noUnnecessaryWindowGetComputedStyleSpreadRule,
  noUnnecessaryWindowGetSelectionSpreadRule,
  noUnnecessaryWindowMatchMediaSpreadRule,
  noUnnecessaryWindowMoveBySpreadRule,
  noUnnecessaryWindowMoveToSpreadRule,
  noUnnecessaryWindowOpenSpreadRule,
  noUnnecessaryWindowPostMessageSpreadRule,
  noUnnecessaryWindowPrintSpreadRule,
  noUnnecessaryWindowPromptSpreadRule,
  noUnnecessaryWindowQueueMicrotaskSpreadRule,
  noUnnecessaryWindowReportErrorSpreadRule,
  noUnnecessaryWindowRequestAnimationFrameSpreadRule,
  noUnnecessaryWindowRequestIdleCallbackSpreadRule,
  noUnnecessaryWindowResizeBySpreadRule,
  noUnnecessaryWindowResizeToSpreadRule,
  noUnnecessaryWindowScrollBySpreadRule,
  noUnnecessaryWindowScrollSpreadRule,
  noUnnecessaryWindowScrollToSpreadRule,
  noUnnecessaryWindowSetIntervalSpreadRule,
  noUnnecessaryWindowSetTimeoutSpreadRule,
  noUnnecessaryWindowStopSpreadRule,
  noUnnecessaryWindowStructuredCloneSpreadRule,
  noUnnecessaryWorkerInstancePostMessageSpreadRule,
  noUnnecessaryWorkerInstanceTerminateSpreadRule,
  noUnnecessaryWorkerSpreadRule,
  noUnnecessaryWritableStreamDestroySpreadRule,
  noUnnecessaryWritableStreamEndSpreadRule,
  noUnnecessaryWritableStreamWriteSpreadRule,
  noUnnecessaryXmlHttpRequestSpreadRule,
  noUnnecessaryZlibBrotliCompressSpreadRule,
  noUnnecessaryZlibBrotliCompressSyncSpreadRule,
  noUnnecessaryZlibBrotliDecompressSpreadRule,
  noUnnecessaryZlibBrotliDecompressSyncSpreadRule,
  noUnnecessaryZlibDeflateSpreadRule,
  noUnnecessaryZlibDeflateSyncSpreadRule,
  noUnnecessaryZlibGunzipSpreadRule,
  noUnnecessaryZlibGunzipSyncSpreadRule,
  noUnnecessaryZlibGzipSpreadRule,
  noUnnecessaryZlibGzipSyncSpreadRule,
  noUnnecessaryZlibInflateSpreadRule,
  noUnnecessaryZlibInflateSyncSpreadRule,
} from './patterns/index.js'
