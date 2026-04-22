import { describe, it, expect } from 'vitest'
import { RULE_SUGGESTIONS } from '../../../src/utils/suggestions.js'

const EXPECTED_KEYS = [
  'noArrayConstructor',
  'noArrayDestructuring',
  'noAsyncPromiseExecutor',
  'noAsyncWithoutAwait',
  'noCaseDeclarations',
  'useLoggingLibrary',
  'noConsoleLog',
  'useStrictEquality',
  'preferObjectSpread',
  'preferOptionalChain',
  'noEval',
  'preferConst',
  'noDebugger',
  'noVar',
  'noAlert',
  'noBitwise',
  'curly',
  'noDupeArgs',
  'noDupeKeys',
  'noDuplicateCase',
  'noEmpty',
  'noEmptyCharacterClass',
  'noExtraBooleanCast',
  'noFallthrough',
  'noFuncAssign',
  'noGlobalAssign',
  'noImplicitCoercion',
  'noInvalidRegexp',
  'noIrregularWhitespace',
  'noIterator',
  'noLabelVar',
  'noLonelyIf',
  'noLoopFunc',
  'noLossOfPrecision',
  'noMisleadingCharacterClass',
  'noMultiSpaces',
  'noNestedTernary',
  'noNewFunc',
  'noNewWrappers',
  'noNonNullAssertion',
  'noOctal',
  'noParamReassign',
  'noPrototypeBuiltins',
  'noRedeclare',
  'noRegexSpaces',
  'noReturnAssign',
  'noSelfAssign',
  'noSequences',
  'noSetterReturn',
  'noShadow',
  'noSparseArrays',
  'noThrowLiteral',
  'noUnreachable',
  'noUnsafeFinally',
  'noUnsafeNegation',
  'noUnusedExpressions',
  'noUnusedLabels',
  'noUnusedVars',
  'noUselessCatch',
  'noUselessConcat',
  'noUselessConstructor',
  'noUselessEscape',
  'noWith',
  'preferArrowCallback',
  'preferExponentiationOperator',
  'preferIncludes',
  'preferNullishCoalescing',
  'preferObjectHasOwn',
  'preferRestParams',
  'preferSpread',
  'preferTemplate',
  'preferRegexLiterals',
  'requireAwait',
  'requireYield',
  'useIsnan',
  'validTypeof',
  'eqEqEq',
  'noConstantCondition',
  'noControlRegex',
  'noDeleteVar',
  'noDivRegex',
  'noElseReturn',
  'noExAssign',
  'noExplicitAny',
  'noExtendNative',
  'noFloatingPromises',
  'noImportAssign',
  'noInferrableTypes',
  'noNewNativeNonconstructor',
  'noObjCalls',
  'noObjectConstructor',
  'noPromiseAsBoolean',
  'noReturnAwait',
  'noStringConcat',
  'noThisBeforeSuper',
  'noUnassignedVars',
  'noUndef',
  'noUnexpectedMultiline',
  'noUnnecessaryCondition',
  'noUnneededTernary',
  'noUnsafeAssignment',
  'noUnsafeDeclarationMerging',
  'noUnsafeOptionalChaining',
  'noUnusedPrivateMembers',
  'noUselessAssignment',
  'noUselessBackreference',
  'noUselessComparison',
  'noUselessUndefined',
  'noVoid',
  'objectShorthand',
  'preferArrayFlat',
  'preferAsyncAwait',
  'preferDateNow',
  'preferEnumInitializers',
  'preferFunctionType',
  'preferLiteralEnumMember',
  'preferNumericLiterals',
  'preferPromiseRejectErrors',
  'preferReadonly',
  'preferRegexpExec',
  'preferStringReplaceAll',
  'preferStringSlice',
  'preferStringStartsEndsWith',
  'preferTernaryOperator',
  'preserveCaughtError',
  'requireReturnType',
  'restrictTemplateExpressions',
  'sortKeys',
  'consistentTypeExports',
  'explicitModuleBoundaryTypes',
  'maxFileSize',
  'maxUnionSize',
  'noConfusingVoidExpression',
  'noConstantBinaryExpression',
  'noConstAssign',
  'noConstructorReturn',
  'noDuplicateCode',
  'noDuplicateElseIf',
  'noDuplicateImports',
  'noEmptyPattern',
  'noEmptyStaticBlock',
  'noMisusedPromises',
  'noNonoctalDecimalEscape',
  'noShadowRestrictedNames',
  'noSimplifiablePattern',
  'noThenable',
  'noThrowSync',
  'noTypeOnlyReturn',
  'noUnfinishedTodos',
  'noUnnecessaryEscapeInRegexp',
  'noUnnecessaryQualifier',
  'noUnnecessarySlice',
  'noUnnecessaryStringConcat',
  'noUnnecessaryTemplateExpression',
  'noUnnecessaryTypeArguments',
  'noUnsafeCall',
  'noUnsafeMemberAccess',
  'noUnsafeRegex',
  'noUnsafeReturn',
  'noUnsafeTypeAssertion',
  'noUselessFallbackInSpread',
  'noVarRequires',
  'preferAtContext',
  'preferAtMethod',
  'preferPrototypeMethods',
  'preferReadonlyParameter',
] as const

describe('suggestions', () => {
  describe('RULE_SUGGESTIONS constant', () => {
    it('should be defined', () => {
      expect(RULE_SUGGESTIONS).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof RULE_SUGGESTIONS).toBe('object')
    })

    it('should have exactly 167 keys', () => {
      const keys = Object.keys(RULE_SUGGESTIONS)
      expect(keys).toHaveLength(166)
    })

    it('should have all expected keys', () => {
      EXPECTED_KEYS.forEach((key) => {
        expect(RULE_SUGGESTIONS).toHaveProperty(key)
      })
    })

    it('should have no unexpected keys', () => {
      const actualKeys = Object.keys(RULE_SUGGESTIONS).sort()
      const expectedSorted = [...EXPECTED_KEYS].sort()
      expect(actualKeys).toEqual(expectedSorted)
    })

    it('should have all values as non-empty strings', () => {
      Object.values(RULE_SUGGESTIONS).forEach((value) => {
        expect(typeof value).toBe('string')
        expect(value.length).toBeGreaterThan(0)
      })
    })
  })
})
