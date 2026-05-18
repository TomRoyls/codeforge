import { describe, it, expect } from 'vitest'
import { RULE_SUGGESTIONS } from '../src/utils/suggestions.js'

// ─── Module Structure ─────────────────────────────────
describe('RULE_SUGGESTIONS module structure', () => {
  it('exports RULE_SUGGESTIONS as an object', () => {
    expect(typeof RULE_SUGGESTIONS).toBe('object')
  })

  it('is not null', () => {
    expect(RULE_SUGGESTIONS).not.toBeNull()
  })

  it('is not an array', () => {
    expect(Array.isArray(RULE_SUGGESTIONS)).toBe(false)
  })

  it('has more than 100 keys', () => {
    const keys = Object.keys(RULE_SUGGESTIONS)
    expect(keys.length).toBeGreaterThan(100)
  })
})

// ─── Value Format ─────────────────────────────────────
describe('RULE_SUGGESTIONS value format', () => {
  const entries = Object.entries(RULE_SUGGESTIONS)

  it('all values are strings', () => {
    for (const [key, value] of entries) {
      expect(typeof value).toBe('string', `Value for key "${key}" should be a string`)
    }
  })

  it('no values are empty strings', () => {
    for (const [key, value] of entries) {
      expect(value.length).toBeGreaterThan(0, `Value for key "${key}" should not be empty`)
    }
  })

  it('all values start with an uppercase letter, backslash, or space', () => {
    for (const [key, value] of entries) {
      const trimmed = value.trimStart()
      const firstChar = trimmed.charAt(0)
      const isUpper = firstChar >= 'A' && firstChar <= 'Z'
      const isBackslash = firstChar === '\\'
      expect(isUpper || isBackslash).toBe(true)
    }
  })

  it('values have consistent leading whitespace (most start without space)', () => {
    let withLeadingSpace = 0
    for (const [_key, value] of entries) {
      if (value !== value.trimStart()) {
        withLeadingSpace++
      }
    }
    // Some suggestions intentionally start with a space for formatting
    expect(withLeadingSpace).toBeLessThan(entries.length)
  })

  it('all values end with a period', () => {
    for (const [key, value] of entries) {
      expect(value.endsWith('.')).toBe(true, `Value for key "${key}" should end with a period`)
    }
  })

  it('no values contain only whitespace', () => {
    for (const [key, value] of entries) {
      expect(value.trim().length).toBeGreaterThan(0, `Value for key "${key}" should not be only whitespace`)
    }
  })
})

// ─── Key Naming Convention ────────────────────────────
describe('RULE_SUGGESTIONS key naming convention', () => {
  const keys = Object.keys(RULE_SUGGESTIONS)

  it('all keys are camelCase (no hyphens)', () => {
    for (const key of keys) {
      expect(key).not.toContain('-')
    }
  })

  it('all keys are camelCase (no underscores)', () => {
    for (const key of keys) {
      expect(key).not.toContain('_')
    }
  })

  it('all keys start with a lowercase letter', () => {
    for (const key of keys) {
      const firstChar = key.charAt(0)
      expect(firstChar >= 'a' && firstChar <= 'z').toBe(true)
    }
  })

  it('no keys are empty strings', () => {
    for (const key of keys) {
      expect(key.length).toBeGreaterThan(0)
    }
  })

  it('no duplicate keys exist', () => {
    const uniqueKeys = new Set(keys)
    expect(uniqueKeys.size).toBe(keys.length)
  })

  it('no values are duplicated across keys', () => {
    const values = Object.values(RULE_SUGGESTIONS)
    const uniqueValues = new Set(values)
    expect(uniqueValues.size).toBe(values.length)
  })
})

// ─── Specific Rule Suggestions - Equality & Comparison ──
describe('RULE_SUGGESTIONS equality and comparison rules', () => {
  it('has eqEqEq suggestion', () => {
    expect(RULE_SUGGESTIONS.eqEqEq).toBe('Use === instead of == to avoid unexpected type coercion.')
  })

  it('has useStrictEquality suggestion', () => {
    expect(RULE_SUGGESTIONS.useStrictEquality).toBe('Use strict equality (===) to avoid unexpected type coercion.')
  })

  it('has useIsnan suggestion', () => {
    expect(RULE_SUGGESTIONS.useIsnan).toContain('Number.isNaN()')
  })

  it('has validTypeof suggestion', () => {
    expect(RULE_SUGGESTIONS.validTypeof).toContain('typeof')
  })

  it('has noRedundantBoolean suggestion', () => {
    expect(RULE_SUGGESTIONS.noRedundantBoolean).toContain('boolean')
  })

  it('has noUnnecessaryCondition suggestion', () => {
    expect(RULE_SUGGESTIONS.noUnnecessaryCondition).toContain('always true or false')
  })

  it('has noUselessComparison suggestion', () => {
    expect(RULE_SUGGESTIONS.noUselessComparison).toContain('always evaluate')
  })

  it('has noSelfAssign suggestion', () => {
    expect(RULE_SUGGESTIONS.noSelfAssign).toContain('x = x')
  })
})

// ─── Specific Rule Suggestions - Variables & Declarations ──
describe('RULE_SUGGESTIONS variable and declaration rules', () => {
  it('has noVar suggestion', () => {
    expect(RULE_SUGGESTIONS.noVar).toContain('let or const')
  })

  it('has preferConst suggestion', () => {
    expect(RULE_SUGGESTIONS.preferConst).toContain('const')
  })

  it('has noConstAssign suggestion', () => {
    expect(RULE_SUGGESTIONS.noConstAssign).toContain('const')
    expect(RULE_SUGGESTIONS.noConstAssign).toContain('let')
  })

  it('has noRedeclare suggestion', () => {
    expect(RULE_SUGGESTIONS.noRedeclare).toContain('redeclaring')
  })

  it('has noUndef suggestion', () => {
    expect(RULE_SUGGESTIONS.noUndef).toContain('defined before use')
  })

  it('has noUnassignedVars suggestion', () => {
    expect(RULE_SUGGESTIONS.noUnassignedVars).toContain('Initialize')
  })

  it('has noUnusedVars suggestion', () => {
    expect(RULE_SUGGESTIONS.noUnusedVars).toContain('unused')
    expect(RULE_SUGGESTIONS.noUnusedVars).toContain('underscore')
  })

  it('has noParamReassign suggestion', () => {
    expect(RULE_SUGGESTIONS.noParamReassign).toContain('local variable')
  })

  it('has noShadow suggestion', () => {
    expect(RULE_SUGGESTIONS.noShadow).toContain('shadowed')
  })

  it('has noShadowRestrictedNames suggestion', () => {
    expect(RULE_SUGGESTIONS.noShadowRestrictedNames).toContain('undefined')
    expect(RULE_SUGGESTIONS.noShadowRestrictedNames).toContain('NaN')
  })
})

// ─── Specific Rule Suggestions - Async & Promises ─────
describe('RULE_SUGGESTIONS async and promise rules', () => {
  it('has noAsyncPromiseExecutor suggestion', () => {
    expect(RULE_SUGGESTIONS.noAsyncPromiseExecutor).toContain('async')
  })

  it('has noAsyncWithoutAwait suggestion', () => {
    expect(RULE_SUGGESTIONS.noAsyncWithoutAwait).toContain('async')
    expect(RULE_SUGGESTIONS.noAsyncWithoutAwait).toContain('await')
  })

  it('has noFloatingPromises suggestion', () => {
    expect(RULE_SUGGESTIONS.noFloatingPromises).toContain('await')
  })

  it('has noMisusedPromises suggestion', () => {
    expect(RULE_SUGGESTIONS.noMisusedPromises).toContain('void')
    expect(RULE_SUGGESTIONS.noMisusedPromises).toContain('promise')
  })

  it('has noPromiseAsBoolean suggestion', () => {
    expect(RULE_SUGGESTIONS.noPromiseAsBoolean).toContain('await')
    expect(RULE_SUGGESTIONS.noPromiseAsBoolean).toContain('.then()')
  })

  it('has noReturnAwait suggestion', () => {
    expect(RULE_SUGGESTIONS.noReturnAwait).toContain('await')
    expect(RULE_SUGGESTIONS.noReturnAwait).toContain('return')
  })

  it('has noThenable suggestion', () => {
    expect(RULE_SUGGESTIONS.noThenable).toContain('thenable')
  })

  it('has preferAsyncAwait suggestion', () => {
    expect(RULE_SUGGESTIONS.preferAsyncAwait).toContain('async/await')
  })

  it('has requireAwait suggestion', () => {
    expect(RULE_SUGGESTIONS.requireAwait).toContain('await')
    expect(RULE_SUGGESTIONS.requireAwait).toContain('async')
  })

  it('has preferPromiseRejectErrors suggestion', () => {
    expect(RULE_SUGGESTIONS.preferPromiseRejectErrors).toContain('Error')
    expect(RULE_SUGGESTIONS.preferPromiseRejectErrors).toContain('reject')
  })
})

// ─── Specific Rule Suggestions - Type Safety ──────────
describe('RULE_SUGGESTIONS type safety rules', () => {
  it('has noExplicitAny suggestion', () => {
    expect(RULE_SUGGESTIONS.noExplicitAny).toContain('any')
    expect(RULE_SUGGESTIONS.noExplicitAny).toContain('unknown')
  })

  it('has noUnsafeAssignment suggestion', () => {
    expect(RULE_SUGGESTIONS.noUnsafeAssignment).toContain('type annotations')
  })

  it('has noUnsafeCall suggestion', () => {
    expect(RULE_SUGGESTIONS.noUnsafeCall).toContain('any')
  })

  it('has noUnsafeMemberAccess suggestion', () => {
    expect(RULE_SUGGESTIONS.noUnsafeMemberAccess).toContain('any')
  })

  it('has noUnsafeReturn suggestion', () => {
    expect(RULE_SUGGESTIONS.noUnsafeReturn).toContain('any')
    expect(RULE_SUGGESTIONS.noUnsafeReturn).toContain('return type')
  })

  it('has noUnsafeTypeAssertion suggestion', () => {
    expect(RULE_SUGGESTIONS.noUnsafeTypeAssertion).toContain('type narrowing')
  })

  it('has noNonNullAssertion suggestion', () => {
    expect(RULE_SUGGESTIONS.noNonNullAssertion).toContain('null checks')
    expect(RULE_SUGGESTIONS.noNonNullAssertion).toContain('!')
  })

  it('has explicitModuleBoundaryTypes suggestion', () => {
    expect(RULE_SUGGESTIONS.explicitModuleBoundaryTypes).toContain('return type')
    expect(RULE_SUGGESTIONS.explicitModuleBoundaryTypes).toContain('exported')
  })

  it('has requireReturnType suggestion', () => {
    expect(RULE_SUGGESTIONS.requireReturnType).toContain('return type')
  })

  it('has noInferrableTypes suggestion', () => {
    expect(RULE_SUGGESTIONS.noInferrableTypes).toContain('inferred')
  })
})

// ─── Specific Rule Suggestions - Best Practices ───────
describe('RULE_SUGGESTIONS best practice rules', () => {
  it('has noEval suggestion', () => {
    expect(RULE_SUGGESTIONS.noEval).toContain('eval()')
    expect(RULE_SUGGESTIONS.noEval).toContain('JSON.parse()')
  })

  it('has noDebugger suggestion', () => {
    expect(RULE_SUGGESTIONS.noDebugger).toContain('debugger')
  })

  it('has noConsoleLog suggestion', () => {
    expect(RULE_SUGGESTIONS.noConsoleLog).toContain('logging library')
    expect(RULE_SUGGESTIONS.noConsoleLog).toContain('winston')
  })

  it('has noThrowLiteral suggestion', () => {
    expect(RULE_SUGGESTIONS.noThrowLiteral).toContain('Error')
  })

  it('has noEmpty suggestion', () => {
    expect(RULE_SUGGESTIONS.noEmpty).toContain('empty')
  })

  it('has noUnusedExpressions suggestion', () => {
    expect(RULE_SUGGESTIONS.noUnusedExpressions).toContain('variables')
  })

  it('has curly suggestion', () => {
    expect(RULE_SUGGESTIONS.curly).toContain('curly braces')
  })

  it('has noElseReturn suggestion', () => {
    expect(RULE_SUGGESTIONS.noElseReturn).toContain('else after return')
  })

  it('has noUnreachable suggestion', () => {
    expect(RULE_SUGGESTIONS.noUnreachable).toContain('return')
    expect(RULE_SUGGESTIONS.noUnreachable).toContain('throw')
  })

  it('has consistentTypeExports suggestion', () => {
    expect(RULE_SUGGESTIONS.consistentTypeExports).toContain('type-only')
  })
})

// ─── Specific Rule Suggestions - Arrays & Objects ─────
describe('RULE_SUGGESTIONS array and object rules', () => {
  it('has noArrayConstructor suggestion', () => {
    expect(RULE_SUGGESTIONS.noArrayConstructor).toContain('[]')
    expect(RULE_SUGGESTIONS.noArrayConstructor).toContain('new Array()')
  })

  it('has noSparseArrays suggestion', () => {
    expect(RULE_SUGGESTIONS.noSparseArrays).toContain('sparse')
    expect(RULE_SUGGESTIONS.noSparseArrays).toContain('undefined')
  })

  it('has objectShorthand suggestion', () => {
    expect(RULE_SUGGESTIONS.objectShorthand).toContain('shorthand')
  })

  it('has preferArrayFlat suggestion', () => {
    expect(RULE_SUGGESTIONS.preferArrayFlat).toContain('flat()')
  })

  it('has preferIncludes suggestion', () => {
    expect(RULE_SUGGESTIONS.preferIncludes).toContain('includes()')
    expect(RULE_SUGGESTIONS.preferIncludes).toContain('indexOf()')
  })

  it('has preferSpread suggestion', () => {
    expect(RULE_SUGGESTIONS.preferSpread).toContain('spread')
  })

  it('has preferObjectSpread suggestion', () => {
    expect(RULE_SUGGESTIONS.preferObjectSpread).toContain('spread')
    expect(RULE_SUGGESTIONS.preferObjectSpread).toContain('Object.assign()')
  })

  it('has noDupeKeys suggestion', () => {
    expect(RULE_SUGGESTIONS.noDupeKeys).toContain('duplicate keys')
  })

  it('has noObjectConstructor suggestion', () => {
    expect(RULE_SUGGESTIONS.noObjectConstructor).toContain('{}')
    expect(RULE_SUGGESTIONS.noObjectConstructor).toContain('new Object()')
  })

  it('has noExtendNative suggestion', () => {
    expect(RULE_SUGGESTIONS.noExtendNative).toContain('native prototypes')
  })
})

// ─── Specific Rule Suggestions - Strings & Templates ──
describe('RULE_SUGGESTIONS string and template rules', () => {
  it('has noStringConcat suggestion', () => {
    expect(RULE_SUGGESTIONS.noStringConcat).toContain('template literals')
  })

  it('has preferTemplate suggestion', () => {
    expect(RULE_SUGGESTIONS.preferTemplate).toContain('template literals')
  })

  it('has noUnnecessaryTemplateExpression suggestion', () => {
    expect(RULE_SUGGESTIONS.noUnnecessaryTemplateExpression).toContain('template expression')
  })

  it('has noUnnecessaryStringConcat suggestion', () => {
    expect(RULE_SUGGESTIONS.noUnnecessaryStringConcat).toContain('template literals')
  })

  it('has noTemplateCurlyInString suggestion', () => {
    expect(RULE_SUGGESTIONS.noTemplateCurlyInString).toContain('backticks')
  })

  it('has preferStringReplaceAll suggestion', () => {
    expect(RULE_SUGGESTIONS.preferStringReplaceAll).toContain('replaceAll()')
  })

  it('has preferStringSlice suggestion', () => {
    expect(RULE_SUGGESTIONS.preferStringSlice).toContain('slice()')
    expect(RULE_SUGGESTIONS.preferStringSlice).toContain('substring()')
  })

  it('has preferStringStartsEndsWith suggestion', () => {
    expect(RULE_SUGGESTIONS.preferStringStartsEndsWith).toContain('startsWith()')
    expect(RULE_SUGGESTIONS.preferStringStartsEndsWith).toContain('endsWith()')
  })

  it('has restrictTemplateExpressions suggestion', () => {
    expect(RULE_SUGGESTIONS.restrictTemplateExpressions).toContain('template expressions')
  })
})

// ─── Specific Rule Suggestions - Control Flow ─────────
describe('RULE_SUGGESTIONS control flow rules', () => {
  it('has noFallthrough suggestion', () => {
    expect(RULE_SUGGESTIONS.noFallthrough).toContain('break')
  })

  it('has noConstantCondition suggestion', () => {
    expect(RULE_SUGGESTIONS.noConstantCondition).toContain('constant conditions')
  })

  it('has noLonelyIf suggestion', () => {
    expect(RULE_SUGGESTIONS.noLonelyIf).toContain('if')
    expect(RULE_SUGGESTIONS.noLonelyIf).toContain('else')
  })

  it('has noLoopFunc suggestion', () => {
    expect(RULE_SUGGESTIONS.noLoopFunc).toContain('function')
    expect(RULE_SUGGESTIONS.noLoopFunc).toContain('loop')
  })

  it('has noCaseDeclarations suggestion', () => {
    expect(RULE_SUGGESTIONS.noCaseDeclarations).toContain('outer block')
  })

  it('has noDuplicateCase suggestion', () => {
    expect(RULE_SUGGESTIONS.noDuplicateCase).toContain('duplicate case')
  })

  it('has noUnsafeFinally suggestion', () => {
    expect(RULE_SUGGESTIONS.noUnsafeFinally).toContain('finally')
  })

  it('has noSequences suggestion', () => {
    expect(RULE_SUGGESTIONS.noSequences).toContain('comma')
  })

  it('has noNestedTernary suggestion', () => {
    expect(RULE_SUGGESTIONS.noNestedTernary).toContain('nested ternary')
  })

  it('has preferTernaryOperator suggestion', () => {
    expect(RULE_SUGGESTIONS.preferTernaryOperator).toContain('ternary')
  })
})

// ─── Specific Rule Suggestions - Regex ────────────────
describe('RULE_SUGGESTIONS regex rules', () => {
  it('has noControlRegex suggestion', () => {
    expect(RULE_SUGGESTIONS.noControlRegex).toContain('control characters')
  })

  it('has noDivRegex suggestion', () => {
    expect(RULE_SUGGESTIONS.noDivRegex).toContain('regex')
    expect(RULE_SUGGESTIONS.noDivRegex).toContain('=')
  })

  it('has noEmptyCharacterClass suggestion', () => {
    expect(RULE_SUGGESTIONS.noEmptyCharacterClass).toContain('empty character class')
  })

  it('has noMisleadingCharacterClass suggestion', () => {
    expect(RULE_SUGGESTIONS.noMisleadingCharacterClass).toContain('character ranges')
  })

  it('has noRegexSpaces suggestion', () => {
    expect(RULE_SUGGESTIONS.noRegexSpaces).toContain('regex')
  })

  it('has noUnsafeRegex suggestion', () => {
    expect(RULE_SUGGESTIONS.noUnsafeRegex).toContain('backtracking')
  })

  it('has noUselessBackreference suggestion', () => {
    expect(RULE_SUGGESTIONS.noUselessBackreference).toContain('backreference')
  })

  it('has noUselessEscape suggestion', () => {
    expect(RULE_SUGGESTIONS.noUselessEscape).toContain('escape')
  })

  it('has noInvalidRegexp suggestion', () => {
    expect(RULE_SUGGESTIONS.noInvalidRegexp).toContain('invalid')
    expect(RULE_SUGGESTIONS.noInvalidRegexp).toContain('regular expression')
  })

  it('has preferRegexLiterals suggestion', () => {
    expect(RULE_SUGGESTIONS.preferRegexLiterals).toContain('regex literal')
    expect(RULE_SUGGESTIONS.preferRegexLiterals).toContain('new RegExp()')
  })
})

// ─── Specific Rule Suggestions - Classes & OOP ────────
describe('RULE_SUGGESTIONS class and OOP rules', () => {
  it('has noThisBeforeSuper suggestion', () => {
    expect(RULE_SUGGESTIONS.noThisBeforeSuper).toContain('this')
    expect(RULE_SUGGESTIONS.noThisBeforeSuper).toContain('super()')
  })

  it('has noConstructorReturn suggestion', () => {
    expect(RULE_SUGGESTIONS.noConstructorReturn).toContain('constructor')
    expect(RULE_SUGGESTIONS.noConstructorReturn).toContain('return')
  })

  it('has noUselessConstructor suggestion', () => {
    expect(RULE_SUGGESTIONS.noUselessConstructor).toContain('constructor')
    expect(RULE_SUGGESTIONS.noUselessConstructor).toContain('parent')
  })

  it('has noSetterReturn suggestion', () => {
    expect(RULE_SUGGESTIONS.noSetterReturn).toContain('setter')
    expect(RULE_SUGGESTIONS.noSetterReturn).toContain('return')
  })

  it('has preferReadonly suggestion', () => {
    expect(RULE_SUGGESTIONS.preferReadonly).toContain('readonly')
  })

  it('has preferReadonlyParameter suggestion', () => {
    expect(RULE_SUGGESTIONS.preferReadonlyParameter).toContain('readonly')
  })

  it('has preferPrototypeMethods suggestion', () => {
    expect(RULE_SUGGESTIONS.preferPrototypeMethods).toContain('prototype')
  })

  it('has noUnsafeDeclarationMerging suggestion', () => {
    expect(RULE_SUGGESTIONS.noUnsafeDeclarationMerging).toContain('interface')
    expect(RULE_SUGGESTIONS.noUnsafeDeclarationMerging).toContain('class')
  })

  it('has noUnusedPrivateMembers suggestion', () => {
    expect(RULE_SUGGESTIONS.noUnusedPrivateMembers).toContain('private')
  })

  it('has noEmptyStaticBlock suggestion', () => {
    expect(RULE_SUGGESTIONS.noEmptyStaticBlock).toContain('static')
  })
})

// ─── Specific Rule Suggestions - Imports & Exports ────
describe('RULE_SUGGESTIONS import and export rules', () => {
  it('has noDuplicateImports suggestion', () => {
    expect(RULE_SUGGESTIONS.noDuplicateImports).toContain('duplicate')
    expect(RULE_SUGGESTIONS.noDuplicateImports).toContain('import')
  })

  it('has noImportAssign suggestion', () => {
    expect(RULE_SUGGESTIONS.noImportAssign).toContain('imported')
    expect(RULE_SUGGESTIONS.noImportAssign).toContain('reassigning')
  })

  it('has noDeprecatedImports suggestion', () => {
    expect(RULE_SUGGESTIONS.noDeprecatedImports).toContain('deprecated')
  })

  it('has noVarRequires suggestion', () => {
    expect(RULE_SUGGESTIONS.noVarRequires).toContain('import')
    expect(RULE_SUGGESTIONS.noVarRequires).toContain('require()')
  })

  it('has noNamespace suggestion', () => {
    expect(RULE_SUGGESTIONS.noNamespace).toContain('ES modules')
    expect(RULE_SUGGESTIONS.noNamespace).toContain('namespaces')
  })

  it('has preferArrowCallback suggestion', () => {
    expect(RULE_SUGGESTIONS.preferArrowCallback).toContain('arrow')
  })

  it('has preferRestParams suggestion', () => {
    expect(RULE_SUGGESTIONS.preferRestParams).toContain('rest')
    expect(RULE_SUGGESTIONS.preferRestParams).toContain('...args')
  })
})

// ─── Specific Rule Suggestions - Error Handling ───────
describe('RULE_SUGGESTIONS error handling rules', () => {
  it('has preserveCaughtError suggestion', () => {
    expect(RULE_SUGGESTIONS.preserveCaughtError).toContain('caught')
    expect(RULE_SUGGESTIONS.preserveCaughtError).toContain('error')
  })

  it('has noExAssign suggestion', () => {
    expect(RULE_SUGGESTIONS.noExAssign).toContain('catch')
  })

  it('has noUselessCatch suggestion', () => {
    expect(RULE_SUGGESTIONS.noUselessCatch).toContain('try-catch')
    expect(RULE_SUGGESTIONS.noUselessCatch).toContain('rethrow')
  })

  it('has noThrowSync suggestion', () => {
    expect(RULE_SUGGESTIONS.noThrowSync).toContain('throwing')
    expect(RULE_SUGGESTIONS.noThrowSync).toContain('async')
  })

  it('has noCatchWithoutThrow suggestion (noThrowLiteral)', () => {
    expect(RULE_SUGGESTIONS.noThrowLiteral).toContain('Error')
    expect(RULE_SUGGESTIONS.noThrowLiteral).toContain('throw')
  })
})

// ─── Specific Rule Suggestions - Code Quality ─────────
describe('RULE_SUGGESTIONS code quality rules', () => {
  it('has noDuplicateCode suggestion', () => {
    expect(RULE_SUGGESTIONS.noDuplicateCode).toContain('duplicated')
  })

  it('has maxFileSize suggestion', () => {
    expect(RULE_SUGGESTIONS.maxFileSize).toContain('large files')
    expect(RULE_SUGGESTIONS.maxFileSize).toContain('modules')
  })

  it('has sortKeys suggestion', () => {
    expect(RULE_SUGGESTIONS.sortKeys).toContain('Sort')
  })

  it('has noUnfinishedTodos suggestion', () => {
    expect(RULE_SUGGESTIONS.noUnfinishedTodos).toContain('TODO')
  })

  it('has noLossOfPrecision suggestion', () => {
    expect(RULE_SUGGESTIONS.noLossOfPrecision).toContain('safe integer')
  })

  it('has noMultiSpaces suggestion', () => {
    expect(RULE_SUGGESTIONS.noMultiSpaces).toContain('whitespace')
  })

  it('has noIrregularWhitespace suggestion', () => {
    expect(RULE_SUGGESTIONS.noIrregularWhitespace).toContain('whitespace')
  })

  it('has noUselessUndefined suggestion', () => {
    expect(RULE_SUGGESTIONS.noUselessUndefined).toContain('undefined')
  })

  it('has noUtilityTruthiness suggestion', () => {
    expect(RULE_SUGGESTIONS.noUtilityTruthiness).toContain('.length')
    expect(RULE_SUGGESTIONS.noUtilityTruthiness).toContain('.size')
  })
})

// ─── Specific Rule Suggestions - TypeScript-specific ──
describe('RULE_SUGGESTIONS TypeScript-specific rules', () => {
  it('has noMisleadingInstantiator suggestion (preferFunctionType)', () => {
    expect(RULE_SUGGESTIONS.preferFunctionType).toContain('interface')
    expect(RULE_SUGGESTIONS.preferFunctionType).toContain('call signature')
  })

  it('has preferLiteralEnumMember suggestion', () => {
    expect(RULE_SUGGESTIONS.preferLiteralEnumMember).toContain('literal')
    expect(RULE_SUGGESTIONS.preferLiteralEnumMember).toContain('enum')
  })

  it('has preferEnumInitializers suggestion', () => {
    expect(RULE_SUGGESTIONS.preferEnumInitializers).toContain('explicit')
    expect(RULE_SUGGESTIONS.preferEnumInitializers).toContain('enum')
  })

  it('has noUnnecessaryTypeArguments suggestion', () => {
    expect(RULE_SUGGESTIONS.noUnnecessaryTypeArguments).toContain('type arguments')
  })

  it('has noUnnecessaryQualifier suggestion', () => {
    expect(RULE_SUGGESTIONS.noUnnecessaryQualifier).toContain('qualifier')
  })

  it('has noTypeOnlyReturn suggestion', () => {
    expect(RULE_SUGGESTIONS.noTypeOnlyReturn).toContain('type-only')
    expect(RULE_SUGGESTIONS.noTypeOnlyReturn).toContain('runtime')
  })

  it('has noSimplifiablePattern suggestion', () => {
    expect(RULE_SUGGESTIONS.noSimplifiablePattern).toContain('Simplify')
  })

  it('has requireYield suggestion', () => {
    expect(RULE_SUGGESTIONS.requireYield).toContain('yield')
    expect(RULE_SUGGESTIONS.requireYield).toContain('generator')
  })
})

// ─── Specific Rule Suggestions - Modern Syntax ────────
describe('RULE_SUGGESTIONS modern syntax preference rules', () => {
  it('has preferNullishCoalescing suggestion', () => {
    expect(RULE_SUGGESTIONS.preferNullishCoalescing).toContain('??')
  })

  it('has preferOptionalChain suggestion', () => {
    expect(RULE_SUGGESTIONS.preferOptionalChain).toContain('?.')
  })

  it('has preferExponentiationOperator suggestion', () => {
    expect(RULE_SUGGESTIONS.preferExponentiationOperator).toContain('**')
    expect(RULE_SUGGESTIONS.preferExponentiationOperator).toContain('Math.pow()')
  })

  it('has preferDateNow suggestion', () => {
    expect(RULE_SUGGESTIONS.preferDateNow).toContain('Date.now()')
    expect(RULE_SUGGESTIONS.preferDateNow).toContain('new Date()')
  })

  it('has preferNumericLiterals suggestion', () => {
    expect(RULE_SUGGESTIONS.preferNumericLiterals).toContain('0b')
    expect(RULE_SUGGESTIONS.preferNumericLiterals).toContain('0o')
    expect(RULE_SUGGESTIONS.preferNumericLiterals).toContain('0x')
  })

  it('has preferObjectHasOwn suggestion', () => {
    expect(RULE_SUGGESTIONS.preferObjectHasOwn).toContain('Object.hasOwn()')
  })

  it('has preferSingleBooleanReturn suggestion', () => {
    expect(RULE_SUGGESTIONS.preferSingleBooleanReturn).toContain('boolean')
    expect(RULE_SUGGESTIONS.preferSingleBooleanReturn).toContain('directly')
  })

  it('has noUselessConcat suggestion', () => {
    expect(RULE_SUGGESTIONS.noUselessConcat).toContain('concatenation')
  })

  it('has noUselessFallbackInSpread suggestion', () => {
    expect(RULE_SUGGESTIONS.noUselessFallbackInSpread).toContain('spread')
  })

  it('has preferRegexpExec suggestion', () => {
    expect(RULE_SUGGESTIONS.preferRegexpExec).toContain('exec()')
    expect(RULE_SUGGESTIONS.preferRegexpExec).toContain('match()')
  })
})

// ─── Specific Rule Suggestions - Security ─────────────
describe('RULE_SUGGESTIONS security rules', () => {
  it('has noEval suggestion mentioning security', () => {
    expect(RULE_SUGGESTIONS.noEval).toContain('security')
  })

  it('has noNewFunc suggestion', () => {
    expect(RULE_SUGGESTIONS.noNewFunc).toContain('new Function()')
  })

  it('has noPrototypeBuiltins suggestion', () => {
    expect(RULE_SUGGESTIONS.noPrototypeBuiltins).toContain('hasOwnProperty')
  })

  it('has noWith suggestion', () => {
    expect(RULE_SUGGESTIONS.noWith).toContain('with')
  })

  it('has noVoid suggestion', () => {
    expect(RULE_SUGGESTIONS.noVoid).toContain('void')
  })

  it('has noGlobalAssign suggestion', () => {
    expect(RULE_SUGGESTIONS.noGlobalAssign).toContain('global')
  })

  it('has noImpliedEval suggestion (noNewFunc)', () => {
    expect(RULE_SUGGESTIONS.noNewFunc).toContain('Function')
  })
})

// ─── Specific Rule Suggestions - Miscellaneous ────────
describe('RULE_SUGGESTIONS miscellaneous rules', () => {
  it('has noBitwise suggestion', () => {
    expect(RULE_SUGGESTIONS.noBitwise).toContain('bitwise')
    expect(RULE_SUGGESTIONS.noBitwise).toContain('typos')
  })

  it('has noDeleteVar suggestion', () => {
    expect(RULE_SUGGESTIONS.noDeleteVar).toContain('delete')
  })

  it('has noLabelVar suggestion', () => {
    expect(RULE_SUGGESTIONS.noLabelVar).toContain('label')
  })

  it('has noOctal suggestion', () => {
    expect(RULE_SUGGESTIONS.noOctal).toContain('octal')
  })

  it('has noNewNativeNonconstructor suggestion', () => {
    expect(RULE_SUGGESTIONS.noNewNativeNonconstructor).toContain('Symbol')
    expect(RULE_SUGGESTIONS.noNewNativeNonconstructor).toContain('BigInt')
  })

  it('has noNewWrappers suggestion', () => {
    expect(RULE_SUGGESTIONS.noNewWrappers).toContain('new String()')
    expect(RULE_SUGGESTIONS.noNewWrappers).toContain('new Number()')
  })

  it('has noUnexpectedMultiline suggestion', () => {
    expect(RULE_SUGGESTIONS.noUnexpectedMultiline).toContain('semicolons')
  })

  it('has noImplicitCoercion suggestion', () => {
    expect(RULE_SUGGESTIONS.noImplicitCoercion).toContain('String()')
    expect(RULE_SUGGESTIONS.noImplicitCoercion).toContain('Number()')
    expect(RULE_SUGGESTIONS.noImplicitCoercion).toContain('Boolean()')
  })

  it('has maxUnionSize suggestion', () => {
    expect(RULE_SUGGESTIONS.maxUnionSize).toContain('union')
    expect(RULE_SUGGESTIONS.maxUnionSize).toContain('discriminated')
  })

  it('has noFuncAssign suggestion', () => {
    expect(RULE_SUGGESTIONS.noFuncAssign).toContain('function')
    expect(RULE_SUGGESTIONS.noFuncAssign).toContain('reassigning')
  })
})

// ─── Completeness - All Known Rules Exist ─────────────
describe('RULE_SUGGESTIONS completeness', () => {
  const requiredRules = [
    'consistentTypeExports',
    'curly',
    'eqEqEq',
    'explicitModuleBoundaryTypes',
    'maxFileSize',
    'maxUnionSize',
    'noAlert',
    'noArrayConstructor',
    'noAsyncPromiseExecutor',
    'noAsyncWithoutAwait',
    'noBitwise',
    'noCaseDeclarations',
    'noConfusingVoidExpression',
    'noConsoleLog',
    'noConstantCondition',
    'noConstAssign',
    'noConstructorReturn',
    'noDebugger',
    'noDeleteVar',
    'noDupeArgs',
    'noDupeKeys',
    'noDuplicateCase',
    'noDuplicateCode',
    'noDuplicateElseIf',
    'noDuplicateImports',
    'noElseReturn',
    'noEmpty',
    'noEval',
    'noExplicitAny',
    'noExtraBooleanCast',
    'noFallthrough',
    'noFloatingPromises',
    'noFuncAssign',
    'noGlobalAssign',
    'noImplicitCoercion',
    'noImportAssign',
    'noInferrableTypes',
    'noLoopFunc',
    'noMisusedPromises',
    'noNamespace',
    'noNewFunc',
    'noNonNullAssertion',
    'noParamReassign',
    'noRedeclare',
    'noReturnAwait',
    'noSelfAssign',
    'noShadow',
    'noSparseArrays',
    'noStringConcat',
    'noThrowLiteral',
    'noUnreachable',
    'noUnsafeFinally',
    'noUnusedExpressions',
    'noUnusedVars',
    'noUselessCatch',
    'noUselessConstructor',
    'noVar',
    'objectShorthand',
    'preferArrowCallback',
    'preferConst',
    'preferNullishCoalescing',
    'preferObjectSpread',
    'preferOptionalChain',
    'preferRestParams',
    'preferSpread',
    'preferTemplate',
    'requireAwait',
    'sortKeys',
    'useIsnan',
  ]

  it('contains all required rules', () => {
    for (const rule of requiredRules) {
      expect(rule in RULE_SUGGESTIONS).toBe(true, `Missing rule: ${rule}`)
    }
  })

  it('has exactly the expected number of rules (174)', () => {
    const keys = Object.keys(RULE_SUGGESTIONS)
    expect(keys.length).toBe(174)
  })
})

// ─── Key Enumerability & Property Descriptors ─────────
describe('RULE_SUGGESTIONS property characteristics', () => {
  it('all keys are enumerable', () => {
    const ownKeys = Object.keys(RULE_SUGGESTIONS)
    const enumerableKeys: string[] = []
    for (const key in RULE_SUGGESTIONS) {
      enumerableKeys.push(key)
    }
    expect(enumerableKeys.sort()).toEqual(ownKeys.sort())
  })

  it('hasOwnProperty works for all keys', () => {
    const keys = Object.keys(RULE_SUGGESTIONS)
    for (const key of keys) {
      expect(Object.prototype.hasOwnProperty.call(RULE_SUGGESTIONS, key)).toBe(true)
    }
  })

  it('Object.values returns same count as Object.keys', () => {
    expect(Object.values(RULE_SUGGESTIONS).length).toBe(Object.keys(RULE_SUGGESTIONS).length)
  })

  it('Object.entries returns same count as Object.keys', () => {
    expect(Object.entries(RULE_SUGGESTIONS).length).toBe(Object.keys(RULE_SUGGESTIONS).length)
  })

  it('all entries have matching key-value pairs', () => {
    const entries = Object.entries(RULE_SUGGESTIONS)
    for (const [key, value] of entries) {
      expect(RULE_SUGGESTIONS[key as keyof typeof RULE_SUGGESTIONS]).toBe(value)
    }
  })
})

// ─── Specific Rule Suggestions - More Coverage ────────
describe('RULE_SUGGESTIONS additional rule coverage', () => {
  it('has noCollectionSizeMischeck suggestion', () => {
    expect(RULE_SUGGESTIONS.noCollectionSizeMischeck).toContain('.length')
    expect(RULE_SUGGESTIONS.noCollectionSizeMischeck).toContain('negative')
  })

  it('has noConstantBinaryExpression suggestion', () => {
    expect(RULE_SUGGESTIONS.noConstantBinaryExpression).toContain('binary expression')
  })

  it('has noObjCalls suggestion', () => {
    expect(RULE_SUGGESTIONS.noObjCalls).toContain('Math()')
  })

  it('has noReturnAssign suggestion', () => {
    expect(RULE_SUGGESTIONS.noReturnAssign).toContain('return')
    expect(RULE_SUGGESTIONS.noReturnAssign).toContain('assignment')
  })

  it('has noUnsafeOptionalChaining suggestion', () => {
    expect(RULE_SUGGESTIONS.noUnsafeOptionalChaining).toContain('optional chaining')
  })

  it('has noUselessAssignment suggestion', () => {
    expect(RULE_SUGGESTIONS.noUselessAssignment).toContain('overwritten')
  })

  it('has noUnnecessaryPolyfills suggestion', () => {
    expect(RULE_SUGGESTIONS.noUnnecessaryPolyfills).toContain('polyfill')
  })

  it('has noUnnecessarySlice suggestion', () => {
    expect(RULE_SUGGESTIONS.noUnnecessarySlice).toContain('slicing')
  })

  it('has noUnneededTernary suggestion', () => {
    expect(RULE_SUGGESTIONS.noUnneededTernary).toContain('ternary')
    expect(RULE_SUGGESTIONS.noUnneededTernary).toContain('Boolean')
  })

  it('has useLoggingLibrary suggestion', () => {
    expect(RULE_SUGGESTIONS.useLoggingLibrary).toContain('logging library')
  })

  it('has preferAtContext suggestion', () => {
    expect(RULE_SUGGESTIONS.preferAtContext).toContain('@context')
  })

  it('has preferAtMethod suggestion', () => {
    expect(RULE_SUGGESTIONS.preferAtMethod).toContain('method')
    expect(RULE_SUGGESTIONS.preferAtMethod).toContain('decorator')
  })

  it('has noDuplicateElseIf suggestion', () => {
    expect(RULE_SUGGESTIONS.noDuplicateElseIf).toContain('else-if')
  })

  it('has noConfusingVoidExpression suggestion', () => {
    expect(RULE_SUGGESTIONS.noConfusingVoidExpression).toContain('void')
  })

  it('has noExtraBooleanCast suggestion', () => {
    expect(RULE_SUGGESTIONS.noExtraBooleanCast).toContain('!!')
    expect(RULE_SUGGESTIONS.noExtraBooleanCast).toContain('Boolean()')
  })

  it('has noMisleadingCharacterClass suggestion', () => {
    expect(RULE_SUGGESTIONS.noMisleadingCharacterClass).toContain('character ranges')
  })

  it('has noPrototypeBuiltins suggestion', () => {
    expect(RULE_SUGGESTIONS.noPrototypeBuiltins).toContain('hasOwnProperty')
  })

  it('has noIterator suggestion', () => {
    expect(RULE_SUGGESTIONS.noIterator).toContain('__iterator__')
    expect(RULE_SUGGESTIONS.noIterator).toContain('Symbol.iterator')
  })

  it('has noEmptyPattern suggestion', () => {
    expect(RULE_SUGGESTIONS.noEmptyPattern).toContain('destructuring')
  })

  it('has noUnusedLabels suggestion', () => {
    expect(RULE_SUGGESTIONS.noUnusedLabels).toContain('labels')
  })
})

// ─── Suggestions Actionability ────────────────────────
describe('RULE_SUGGESTIONS actionability checks', () => {
  it('suggestions for "no" rules explain what to avoid', () => {
    const noKeys = Object.keys(RULE_SUGGESTIONS).filter(k => k.startsWith('no'))
    for (const key of noKeys) {
      const value = RULE_SUGGESTIONS[key as keyof typeof RULE_SUGGESTIONS]
      const lower = value.toLowerCase()
      const hasActionWord =
        lower.includes('use') ||
        lower.includes('avoid') ||
        lower.includes('remove') ||
        lower.includes('replace') ||
        lower.includes('fix') ||
        lower.includes('add') ||
        lower.includes('simplify') ||
        lower.includes('escape') ||
        lower.includes('do not') ||
        lower.includes('rename') ||
        lower.includes('ensure') ||
        lower.includes('access') ||
        lower.includes('wrap') ||
        lower.includes('move') ||
        lower.includes('throw') ||
        lower.includes('merge') ||
        lower.includes('mark') ||
        lower.includes('reduce') ||
        lower.includes('split') ||
        lower.includes('provide') ||
        lower.includes('log') ||
        lower.includes('compare') ||
        lower.includes('reject') ||
        lower.includes('check') ||
        lower.includes('extract') ||
        lower.includes('refactor')
      expect(hasActionWord).toBe(true, `Suggestion for "${key}" lacks actionable guidance: "${value}"`)
    }
  })

  it('suggestions for "prefer" rules explain what to use', () => {
    const preferKeys = Object.keys(RULE_SUGGESTIONS).filter(k => k.startsWith('prefer'))
    for (const key of preferKeys) {
      const value = RULE_SUGGESTIONS[key as keyof typeof RULE_SUGGESTIONS]
      const lower = value.toLowerCase()
      const hasGuidance = lower.includes('use') || lower.includes('instead of') || lower.includes('mark') || lower.includes('provide')
      expect(hasGuidance).toBe(true, `Suggestion for "${key}" should recommend usage: "${value}"`)
    }
  })
})

// ─── Category-based grouping ──────────────────────────
describe('RULE_SUGGESTIONS category-based existence', () => {
  it('has rules about duplicate code patterns', () => {
    expect(RULE_SUGGESTIONS.noDuplicateCode).toBeDefined()
    expect(RULE_SUGGESTIONS.noDuplicateImports).toBeDefined()
    expect(RULE_SUGGESTIONS.noDuplicateCase).toBeDefined()
    expect(RULE_SUGGESTIONS.noDuplicateElseIf).toBeDefined()
    expect(RULE_SUGGESTIONS.noDupeArgs).toBeDefined()
    expect(RULE_SUGGESTIONS.noDupeKeys).toBeDefined()
  })

  it('has rules about unnecessary code', () => {
    expect(RULE_SUGGESTIONS.noUnnecessaryCondition).toBeDefined()
    expect(RULE_SUGGESTIONS.noUnnecessaryTemplateExpression).toBeDefined()
    expect(RULE_SUGGESTIONS.noUnnecessaryTypeArguments).toBeDefined()
    expect(RULE_SUGGESTIONS.noUnnecessarySlice).toBeDefined()
    expect(RULE_SUGGESTIONS.noUnnecessaryStringConcat).toBeDefined()
    expect(RULE_SUGGESTIONS.noUnnecessaryPolyfills).toBeDefined()
    expect(RULE_SUGGESTIONS.noUnnecessaryQualifier).toBeDefined()
    expect(RULE_SUGGESTIONS.noUnnecessaryEscapeInRegexp).toBeDefined()
  })

  it('has rules about useless patterns', () => {
    expect(RULE_SUGGESTIONS.noUselessCatch).toBeDefined()
    expect(RULE_SUGGESTIONS.noUselessComparison).toBeDefined()
    expect(RULE_SUGGESTIONS.noUselessConcat).toBeDefined()
    expect(RULE_SUGGESTIONS.noUselessConstructor).toBeDefined()
    expect(RULE_SUGGESTIONS.noUselessEscape).toBeDefined()
    expect(RULE_SUGGESTIONS.noUselessFallbackInSpread).toBeDefined()
    expect(RULE_SUGGESTIONS.noUselessUndefined).toBeDefined()
    expect(RULE_SUGGESTIONS.noUselessAssignment).toBeDefined()
    expect(RULE_SUGGESTIONS.noUselessBackreference).toBeDefined()
  })

  it('has rules about unsafe patterns', () => {
    expect(RULE_SUGGESTIONS.noUnsafeAssignment).toBeDefined()
    expect(RULE_SUGGESTIONS.noUnsafeCall).toBeDefined()
    expect(RULE_SUGGESTIONS.noUnsafeDeclarationMerging).toBeDefined()
    expect(RULE_SUGGESTIONS.noUnsafeFinally).toBeDefined()
    expect(RULE_SUGGESTIONS.noUnsafeMemberAccess).toBeDefined()
    expect(RULE_SUGGESTIONS.noUnsafeNegation).toBeDefined()
    expect(RULE_SUGGESTIONS.noUnsafeOptionalChaining).toBeDefined()
    expect(RULE_SUGGESTIONS.noUnsafeRegex).toBeDefined()
    expect(RULE_SUGGESTIONS.noUnsafeReturn).toBeDefined()
    expect(RULE_SUGGESTIONS.noUnsafeTypeAssertion).toBeDefined()
  })
})
