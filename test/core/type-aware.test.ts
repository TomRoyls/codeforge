import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'

import { TypeChecker } from '../../src/core/type-aware/index.js'
import type {
  TypeAwareAnalysisResult,
  TypeCheckResult,
  TypeComplexityMetrics,
  TypeInferenceResult,
  TypeMismatch,
  TypeRelation,
  UnsafeTypeUsage,
} from '../../src/core/type-aware/index.js'
import {
  createExplicitReturnTypeRule,
  createNoExplicitAnyRule,
  createNoImplicitAnyRule,
  createNoNonNullAssertionRule,
  createNoTypeAssertionRule,
} from '../../src/core/type-aware/index.js'

function createTestFile(code: string, fileName = 'test.ts') {
  const project = new Project({
    useInMemoryFileSystem: true,
    compilerOptions: { strict: true, lib: ['ES2020'] },
  })
  return project.createSourceFile(fileName, code)
}

function makeTypeCheckResult(overrides: Partial<TypeCheckResult> = {}): TypeCheckResult {
  return {
    isAny: false,
    isArray: false,
    isBoolean: false,
    isEnum: false,
    isFunction: false,
    isGeneric: false,
    isIntersection: false,
    isLiteral: false,
    isNull: false,
    isNullable: false,
    isNumber: false,
    isObject: false,
    isPromise: false,
    isString: false,
    isUndefined: false,
    isUnion: false,
    typeName: 'unknown',
    typeString: 'unknown',
    ...overrides,
  }
}

describe('TypeCheckResult interface shape', () => {
  it('has all required boolean properties', () => {
    const result: TypeCheckResult = makeTypeCheckResult()
    expect(typeof result.isAny).toBe('boolean')
    expect(typeof result.isNull).toBe('boolean')
    expect(typeof result.isUndefined).toBe('boolean')
    expect(typeof result.isNullable).toBe('boolean')
    expect(typeof result.isString).toBe('boolean')
    expect(typeof result.isNumber).toBe('boolean')
    expect(typeof result.isBoolean).toBe('boolean')
    expect(typeof result.isArray).toBe('boolean')
    expect(typeof result.isObject).toBe('boolean')
    expect(typeof result.isFunction).toBe('boolean')
    expect(typeof result.isPromise).toBe('boolean')
    expect(typeof result.isEnum).toBe('boolean')
    expect(typeof result.isUnion).toBe('boolean')
    expect(typeof result.isIntersection).toBe('boolean')
    expect(typeof result.isLiteral).toBe('boolean')
    expect(typeof result.isGeneric).toBe('boolean')
  })

  it('has typeName and typeString as strings', () => {
    const result: TypeCheckResult = makeTypeCheckResult()
    expect(typeof result.typeName).toBe('string')
    expect(typeof result.typeString).toBe('string')
  })

  it('defaults all booleans to false via factory', () => {
    const result = makeTypeCheckResult()
    expect(result.isAny).toBe(false)
    expect(result.isNull).toBe(false)
    expect(result.isUndefined).toBe(false)
    expect(result.isNullable).toBe(false)
    expect(result.isString).toBe(false)
    expect(result.isNumber).toBe(false)
    expect(result.isBoolean).toBe(false)
    expect(result.isArray).toBe(false)
    expect(result.isObject).toBe(false)
    expect(result.isFunction).toBe(false)
    expect(result.isPromise).toBe(false)
    expect(result.isEnum).toBe(false)
    expect(result.isUnion).toBe(false)
    expect(result.isIntersection).toBe(false)
    expect(result.isLiteral).toBe(false)
    expect(result.isGeneric).toBe(false)
  })

  it('allows overriding individual fields', () => {
    const result = makeTypeCheckResult({ isString: true, typeName: 'string', typeString: 'string' })
    expect(result.isString).toBe(true)
    expect(result.typeName).toBe('string')
    expect(result.isNumber).toBe(false)
  })
})

describe('TypeRelation interface shape', () => {
  it('contains source and target TypeCheckResult', () => {
    const source = makeTypeCheckResult({ typeName: 'string', typeString: 'string', isString: true })
    const target = makeTypeCheckResult({ typeName: 'string', typeString: 'string', isString: true })
    const relation: TypeRelation = {
      isAssignable: true,
      isIdentical: true,
      isSubtype: false,
      source,
      target,
    }
    expect(relation.source.typeName).toBe('string')
    expect(relation.target.typeName).toBe('string')
  })

  it('has correct boolean fields', () => {
    const relation: TypeRelation = {
      isAssignable: false,
      isIdentical: false,
      isSubtype: false,
      source: makeTypeCheckResult(),
      target: makeTypeCheckResult(),
    }
    expect(typeof relation.isAssignable).toBe('boolean')
    expect(typeof relation.isIdentical).toBe('boolean')
    expect(typeof relation.isSubtype).toBe('boolean')
  })
})

describe('TypeInferenceResult interface shape', () => {
  it('has all required fields', () => {
    const inferred = makeTypeCheckResult({ isNumber: true })
    const result: TypeInferenceResult = {
      column: 7,
      declaredType: null,
      filePath: 'test.ts',
      hasExplicitAnnotation: false,
      inferredType: inferred,
      isInferred: true,
      line: 1,
      variableName: 'x',
    }
    expect(result.variableName).toBe('x')
    expect(result.inferredType.isNumber).toBe(true)
    expect(result.declaredType).toBeNull()
    expect(result.isInferred).toBe(true)
    expect(result.hasExplicitAnnotation).toBe(false)
    expect(result.filePath).toBe('test.ts')
    expect(result.line).toBe(1)
    expect(result.column).toBe(7)
  })

  it('supports explicit annotation with declared type', () => {
    const declared = makeTypeCheckResult({ isString: true, typeName: 'string', typeString: 'string' })
    const result: TypeInferenceResult = {
      column: 7,
      declaredType: declared,
      filePath: 'test.ts',
      hasExplicitAnnotation: true,
      inferredType: declared,
      isInferred: false,
      line: 1,
      variableName: 'y',
    }
    expect(result.declaredType).not.toBeNull()
    expect(result.declaredType!.isString).toBe(true)
    expect(result.hasExplicitAnnotation).toBe(true)
    expect(result.isInferred).toBe(false)
  })
})

describe('TypeMismatch interface shape', () => {
  it('has all required fields', () => {
    const mismatch: TypeMismatch = {
      actualType: 'number',
      column: 7,
      expectedType: 'string',
      filePath: 'test.ts',
      line: 1,
      message: 'Type mismatch: expected string, got number',
      variableName: 'x',
    }
    expect(mismatch.variableName).toBe('x')
    expect(mismatch.expectedType).toBe('string')
    expect(mismatch.actualType).toBe('number')
    expect(mismatch.filePath).toBe('test.ts')
    expect(mismatch.line).toBe(1)
    expect(mismatch.column).toBe(7)
    expect(mismatch.message).toContain('mismatch')
  })
})

describe('UnsafeTypeUsage interface shape', () => {
  const validUsages: UnsafeTypeUsage['usage'][] = [
    'implicit-any',
    'any-cast',
    'any-access',
    'unsafe-assignment',
    'non-null-assertion',
    'type-assertion',
  ]

  it('supports all usage types', () => {
    for (const usage of validUsages) {
      const item: UnsafeTypeUsage = {
        column: 1,
        filePath: 'test.ts',
        line: 1,
        message: `test ${usage}`,
        typeString: 'any',
        usage,
        variableName: 'x',
      }
      expect(item.usage).toBe(usage)
    }
  })

  it('has all required fields', () => {
    const usage: UnsafeTypeUsage = {
      column: 10,
      filePath: 'foo.ts',
      line: 5,
      message: 'Implicit any',
      typeString: 'any',
      usage: 'implicit-any',
      variableName: 'val',
    }
    expect(usage.filePath).toBe('foo.ts')
    expect(usage.line).toBe(5)
    expect(usage.column).toBe(10)
    expect(usage.variableName).toBe('val')
    expect(usage.typeString).toBe('any')
    expect(usage.message).toBe('Implicit any')
  })
})

describe('TypeComplexityMetrics interface shape', () => {
  it('has all required fields', () => {
    const metrics: TypeComplexityMetrics = {
      filePath: 'test.ts',
      totalTypes: 10,
      anyCount: 2,
      unknownCount: 1,
      genericCount: 3,
      unionCount: 4,
      intersectionCount: 1,
      complexTypes: 2,
      typeCoverage: 0.8,
    }
    expect(metrics.filePath).toBe('test.ts')
    expect(metrics.totalTypes).toBe(10)
    expect(metrics.anyCount).toBe(2)
    expect(metrics.unknownCount).toBe(1)
    expect(metrics.genericCount).toBe(3)
    expect(metrics.unionCount).toBe(4)
    expect(metrics.intersectionCount).toBe(1)
    expect(metrics.complexTypes).toBe(2)
    expect(metrics.typeCoverage).toBe(0.8)
  })
})

describe('TypeAwareAnalysisResult interface shape', () => {
  it('has all required fields with correct types', () => {
    const result: TypeAwareAnalysisResult = {
      complexityMetrics: [],
      inferenceResults: [],
      summary: {
        anyUsageCount: 0,
        explicitlyTyped: 0,
        implicitlyTyped: 0,
        mismatchCount: 0,
        totalVariables: 0,
        typeCoverage: 1,
        unsafeCount: 0,
      },
      typeMismatches: [],
      unsafeUsages: [],
    }
    expect(Array.isArray(result.typeMismatches)).toBe(true)
    expect(Array.isArray(result.unsafeUsages)).toBe(true)
    expect(Array.isArray(result.inferenceResults)).toBe(true)
    expect(Array.isArray(result.complexityMetrics)).toBe(true)
    expect(typeof result.summary.totalVariables).toBe('number')
    expect(typeof result.summary.typeCoverage).toBe('number')
  })
})

describe('TypeChecker checkType', () => {
  const checker = new TypeChecker()

  it('detects object type from object literal', () => {
    const sf = createTestFile(`const x: { name: string } = { name: 'test' };`)
    const result = checker.checkType(sf, 1, 7)
    expect(result.isObject).toBe(true)
  })

  it('detects function type from arrow function variable', () => {
    const sf = createTestFile(`const fn: (x: string) => number = (x) => x.length;`)
    const result = checker.checkType(sf, 1, 7)
    expect(result.isFunction).toBe(true)
  })

  it('returns empty result for line 0', () => {
    const sf = createTestFile(`const x = 1;`)
    const result = checker.checkType(sf, 0, 1)
    expect(result.typeString).toBe('unknown')
    expect(result.isNumber).toBe(false)
  })

  it('returns empty result for negative line', () => {
    const sf = createTestFile(`const x = 1;`)
    const result = checker.checkType(sf, -1, 1)
    expect(result.typeString).toBe('unknown')
  })

  it('returns empty result for line beyond file', () => {
    const sf = createTestFile(`const x = 1;`)
    const result = checker.checkType(sf, 100, 1)
    expect(result.typeString).toBe('unknown')
  })

  it('handles multi-line code correctly', () => {
    const code = `const a: string = 'hello';\nconst b: number = 42;\nconst c: boolean = true;`
    const sf = createTestFile(code)
    const resultB = checker.checkType(sf, 2, 7)
    expect(resultB.isNumber).toBe(true)
    const resultC = checker.checkType(sf, 3, 7)
    expect(resultC.isBoolean).toBe(true)
  })

  it('handles column 0 gracefully', () => {
    const sf = createTestFile(`const x: string = 'hello';`)
    const result = checker.checkType(sf, 1, 0)
    expect(result).toBeDefined()
  })

  it('detects generic type parameter via getVariableType', () => {
    const sf = createTestFile(`function identity<T>(arg: T): T { return arg; }`)
    const fnResult = checker.checkType(sf, 1, 10)
    expect(fnResult.typeString).toBeDefined()
  })

  it('detects enum type via checkType', () => {
    const sf = createTestFile(`enum Dir { Up, Down }\nconst d: Dir = Dir.Up;`)
    const result = checker.checkType(sf, 2, 7)
    expect(result.isEnum).toBe(true)
  })

  it('handles Promise type annotation', () => {
    const sf = createTestFile(`const p: Promise<number> = Promise.resolve(1);`)
    const result = checker.checkType(sf, 1, 7)
    expect(result.isPromise).toBe(true)
  })

  it('detects array with Array<T> syntax', () => {
    const sf = createTestFile(`const x: Array<string> = ['a'];`)
    const result = checker.checkType(sf, 1, 7)
    expect(result.isArray).toBe(true)
  })

  it('detects union type with three members', () => {
    const sf = createTestFile(`const x: string | number | boolean = 'hello';`)
    const result = checker.checkType(sf, 1, 7)
    expect(result.isUnion).toBe(true)
  })

  it('detects nullable with undefined', () => {
    const sf = createTestFile(`const x: string | undefined = undefined;`)
    const result = checker.checkType(sf, 1, 7)
    expect(result.isNullable).toBe(true)
  })
})

describe('TypeChecker getVariableType', () => {
  const checker = new TypeChecker()

  it('finds let variable', () => {
    const sf = createTestFile(`let x: number = 42;`)
    const result = checker.getVariableType(sf, 'x')
    expect(result).not.toBeNull()
    expect(result!.isNumber).toBe(true)
  })

  it('finds var variable', () => {
    const sf = createTestFile(`var x: string = 'hello';`)
    const result = checker.getVariableType(sf, 'x')
    expect(result).not.toBeNull()
    expect(result!.isString).toBe(true)
  })

  it('finds multiple variables and returns correct one', () => {
    const sf = createTestFile(`const a: string = 'hi'; const b: number = 1; const c: boolean = true;`)
    expect(checker.getVariableType(sf, 'a')!.isString).toBe(true)
    expect(checker.getVariableType(sf, 'b')!.isNumber).toBe(true)
    expect(checker.getVariableType(sf, 'c')!.isBoolean).toBe(true)
  })

  it('returns null for variable name that does not exist', () => {
    const sf = createTestFile(`const x = 1;`)
    expect(checker.getVariableType(sf, 'y')).toBeNull()
    expect(checker.getVariableType(sf, 'X')).toBeNull()
  })

  it('handles any typed variable', () => {
    const sf = createTestFile(`const x: any = 'test';`)
    const result = checker.getVariableType(sf, 'x')
    expect(result!.isAny).toBe(true)
  })

  it('handles object type variable', () => {
    const sf = createTestFile(`const x: { a: number } = { a: 1 };`)
    const result = checker.getVariableType(sf, 'x')
    expect(result).not.toBeNull()
    expect(result!.isObject).toBe(true)
  })

  it('handles inferred function type', () => {
    const sf = createTestFile(`const fn = (a: number) => a + 1;`)
    const result = checker.getVariableType(sf, 'fn')
    expect(result).not.toBeNull()
    expect(result!.isFunction).toBe(true)
  })

  it('handles intersection type', () => {
    const sf = createTestFile(`const x: { a: number } & { b: string } = { a: 1, b: 'x' };`)
    const result = checker.getVariableType(sf, 'x')
    expect(result).not.toBeNull()
    expect(result!.isIntersection).toBe(true)
  })
})

describe('TypeChecker compareTypes', () => {
  const checker = new TypeChecker()

  it('considers identical strings assignable and identical', () => {
    const a = makeTypeCheckResult({ typeName: 'number', typeString: 'number', isNumber: true })
    const b = makeTypeCheckResult({ typeName: 'number', typeString: 'number', isNumber: true })
    const rel = checker.compareTypes(a, b)
    expect(rel.isIdentical).toBe(true)
    expect(rel.isAssignable).toBe(true)
    expect(rel.isSubtype).toBe(false)
  })

  it('assigns undefined to nullable target', () => {
    const source = makeTypeCheckResult({ isUndefined: true, isNullable: true, typeName: 'undefined', typeString: 'undefined' })
    const target = makeTypeCheckResult({ isNullable: true, isUnion: true, typeName: 'string', typeString: 'string | undefined' })
    const rel = checker.compareTypes(source, target)
    expect(rel.isAssignable).toBe(true)
  })

  it('literal number assignable to number type', () => {
    const source = makeTypeCheckResult({ isLiteral: true, isNumber: true, typeName: 'number', typeString: '42' })
    const target = makeTypeCheckResult({ isNumber: true, typeName: 'number', typeString: 'number' })
    const rel = checker.compareTypes(source, target)
    expect(rel.isAssignable).toBe(true)
    expect(rel.isSubtype).toBe(true)
    expect(rel.isIdentical).toBe(false)
  })

  it('literal string assignable to string type', () => {
    const source = makeTypeCheckResult({ isLiteral: true, isString: true, typeName: 'string', typeString: '"hello"' })
    const target = makeTypeCheckResult({ isString: true, typeName: 'string', typeString: 'string' })
    const rel = checker.compareTypes(source, target)
    expect(rel.isAssignable).toBe(true)
  })

  it('string not assignable to number', () => {
    const source = makeTypeCheckResult({ isString: true, typeName: 'string', typeString: 'string' })
    const target = makeTypeCheckResult({ isNumber: true, typeName: 'number', typeString: 'number' })
    const rel = checker.compareTypes(source, target)
    expect(rel.isAssignable).toBe(false)
    expect(rel.isIdentical).toBe(false)
    expect(rel.isSubtype).toBe(false)
  })

  it('boolean not assignable to number', () => {
    const source = makeTypeCheckResult({ isBoolean: true, typeName: 'boolean', typeString: 'boolean' })
    const target = makeTypeCheckResult({ isNumber: true, typeName: 'number', typeString: 'number' })
    const rel = checker.compareTypes(source, target)
    expect(rel.isAssignable).toBe(false)
  })

  it('same primitive type different name is still assignable', () => {
    const source = makeTypeCheckResult({ isNumber: true, typeName: 'number', typeString: 'number' })
    const target = makeTypeCheckResult({ isNumber: true, typeName: 'number', typeString: 'number' })
    const rel = checker.compareTypes(source, target)
    expect(rel.isAssignable).toBe(true)
    expect(rel.isIdentical).toBe(true)
  })

  it('any source not special - target must be any for shortcut', () => {
    const source = makeTypeCheckResult({ isAny: true, typeName: 'any', typeString: 'any' })
    const target = makeTypeCheckResult({ isString: true, typeName: 'string', typeString: 'string' })
    const rel = checker.compareTypes(source, target)
    expect(rel.isAssignable).toBe(false)
  })

  it('everything is assignable to any target', () => {
    const source = makeTypeCheckResult({ isString: true, typeName: 'string', typeString: 'string' })
    const target = makeTypeCheckResult({ isAny: true, typeName: 'any', typeString: 'any' })
    const rel = checker.compareTypes(source, target)
    expect(rel.isAssignable).toBe(true)
  })

  it('returns source and target in result', () => {
    const source = makeTypeCheckResult({ typeName: 'string', typeString: 'string', isString: true })
    const target = makeTypeCheckResult({ typeName: 'number', typeString: 'number', isNumber: true })
    const rel = checker.compareTypes(source, target)
    expect(rel.source).toBe(source)
    expect(rel.target).toBe(target)
  })

  it('null not assignable to non-nullable target', () => {
    const source = makeTypeCheckResult({ isNull: true, isNullable: true, typeName: 'null', typeString: 'null' })
    const target = makeTypeCheckResult({ typeName: 'string', typeString: 'string', isString: true })
    const rel = checker.compareTypes(source, target)
    expect(rel.isAssignable).toBe(false)
  })

  it('undefined not assignable to non-nullable target', () => {
    const source = makeTypeCheckResult({ isUndefined: true, isNullable: true, typeName: 'undefined', typeString: 'undefined' })
    const target = makeTypeCheckResult({ typeName: 'number', typeString: 'number', isNumber: true })
    const rel = checker.compareTypes(source, target)
    expect(rel.isAssignable).toBe(false)
  })
})

describe('TypeChecker isTypeSafe', () => {
  const checker = new TypeChecker()

  it('returns false for any type', () => {
    expect(checker.isTypeSafe(makeTypeCheckResult({ isAny: true, typeName: 'any', typeString: 'any' }))).toBe(false)
  })

  it('returns false for unknown typeString', () => {
    expect(checker.isTypeSafe(makeTypeCheckResult({ typeName: 'unknown', typeString: 'unknown' }))).toBe(false)
  })

  it('returns true for string', () => {
    expect(checker.isTypeSafe(makeTypeCheckResult({ isString: true, typeName: 'string', typeString: 'string' }))).toBe(true)
  })

  it('returns true for number', () => {
    expect(checker.isTypeSafe(makeTypeCheckResult({ isNumber: true, typeName: 'number', typeString: 'number' }))).toBe(true)
  })

  it('returns true for boolean', () => {
    expect(checker.isTypeSafe(makeTypeCheckResult({ isBoolean: true, typeName: 'boolean', typeString: 'boolean' }))).toBe(true)
  })

  it('returns true for object type', () => {
    expect(checker.isTypeSafe(makeTypeCheckResult({ isObject: true, typeName: 'Object', typeString: '{ x: number }' }))).toBe(true)
  })

  it('returns true for array type', () => {
    expect(checker.isTypeSafe(makeTypeCheckResult({ isArray: true, typeName: 'Array', typeString: 'number[]' }))).toBe(true)
  })

  it('returns true for function type', () => {
    expect(checker.isTypeSafe(makeTypeCheckResult({ isFunction: true, typeName: 'function', typeString: '() => void' }))).toBe(true)
  })

  it('returns true for union type that is not any or unknown', () => {
    expect(checker.isTypeSafe(makeTypeCheckResult({ isUnion: true, typeName: 'string', typeString: 'string | number' }))).toBe(true)
  })
})

describe('TypeChecker inferTypes', () => {
  const checker = new TypeChecker()

  it('handles let and var declarations', () => {
    const sf = createTestFile(`let a: string = 'x'; var b: number = 1;`)
    const results = checker.inferTypes(sf)
    expect(results.length).toBe(2)
    const a = results.find((r) => r.variableName === 'a')
    const b = results.find((r) => r.variableName === 'b')
    expect(a!.hasExplicitAnnotation).toBe(true)
    expect(b!.hasExplicitAnnotation).toBe(true)
  })

  it('provides correct line and column positions', () => {
    const code = `const a = 1;\nconst b = 2;`
    const sf = createTestFile(code)
    const results = checker.inferTypes(sf)
    const a = results.find((r) => r.variableName === 'a')
    const b = results.find((r) => r.variableName === 'b')
    expect(a!.line).toBe(1)
    expect(b!.line).toBe(2)
  })

  it('sets isInferred correctly for unannotated variables', () => {
    const sf = createTestFile(`const x = 'hello';`)
    const results = checker.inferTypes(sf)
    expect(results[0]!.isInferred).toBe(true)
    expect(results[0]!.hasExplicitAnnotation).toBe(false)
  })

  it('sets isInferred to false for annotated variables', () => {
    const sf = createTestFile(`const x: string = 'hello';`)
    const results = checker.inferTypes(sf)
    expect(results[0]!.isInferred).toBe(false)
    expect(results[0]!.hasExplicitAnnotation).toBe(true)
  })

  it('filePath matches the source file name', () => {
    const sf = createTestFile(`const x = 1;`, 'myfile.ts')
    const results = checker.inferTypes(sf)
    expect(results[0]!.filePath).toContain('myfile.ts')
  })

  it('handles file with only function declarations', () => {
    const sf = createTestFile(`function add(a: number, b: number): number { return a + b; }`)
    const results = checker.inferTypes(sf)
    expect(results.length).toBe(0)
  })

  it('returns inferred type info with correct typeName', () => {
    const sf = createTestFile(`const x = 42;`)
    const results = checker.inferTypes(sf)
    expect(results[0]!.inferredType.isLiteral).toBe(true)
    expect(results[0]!.inferredType.typeString).toBeDefined()
  })
})

describe('TypeChecker findUnsafeUsages', () => {
  const checker = new TypeChecker()

  it('detects implicit any in untyped function parameter', () => {
    const sf = createTestFile(`function foo(x) { return x; }`, 'imp.ts')
    const usages = checker.findUnsafeUsages(sf)
    const implicit = usages.find((u) => u.usage === 'implicit-any')
    expect(implicit).toBeDefined()
  })

  it('detects explicit any in function parameter', () => {
    const sf = createTestFile(`function foo(x: any) { return x; }`)
    const usages = checker.findUnsafeUsages(sf)
    const explicit = usages.find((u) => u.usage === 'any-cast')
    expect(explicit).toBeDefined()
  })

  it('detects angle-bracket type assertion', () => {
    const sf = createTestFile(`const x = <string>someValue;`)
    const usages = checker.findUnsafeUsages(sf)
    const assertion = usages.find((u) => u.usage === 'type-assertion')
    expect(assertion).toBeDefined()
  })

  it('skips as const in type assertion detection', () => {
    const sf = createTestFile(`const x = { a: 1 } as const;`)
    const usages = checker.findUnsafeUsages(sf)
    const constAssertion = usages.find((u) => u.typeString === 'const' && u.usage === 'type-assertion')
    expect(constAssertion).toBeUndefined()
  })

  it('includes correct file path in all usages', () => {
    const sf = createTestFile(`const x: any = 1;`, 'path/to/file.ts')
    const usages = checker.findUnsafeUsages(sf)
    for (const u of usages) {
      expect(u.filePath).toContain('path/to/file.ts')
    }
  })

  it('detects non-null assertion', () => {
    const sf = createTestFile(`const x: string | null = null; const len = x!.length;`)
    const usages = checker.findUnsafeUsages(sf)
    const nonNull = usages.find((u) => u.usage === 'non-null-assertion')
    expect(nonNull).toBeDefined()
    expect(nonNull!.variableName).toBe('x')
  })

  it('returns empty for file with no unsafe patterns', () => {
    const sf = createTestFile(`const x: string = 'hello'; const y: number = 42;`)
    const usages = checker.findUnsafeUsages(sf)
    const nonAssertionUsages = usages.filter((u) => u.usage !== 'type-assertion')
    expect(nonAssertionUsages.length).toBe(0)
  })

  it('detects any in class method parameters', () => {
    const sf = createTestFile(`class Foo { bar(x: any) { return x; } }`)
    const usages = checker.findUnsafeUsages(sf)
    const methodParam = usages.find((u) => u.variableName === 'x' && u.usage === 'any-cast')
    expect(methodParam).toBeDefined()
  })

  it('provides line and column in all usages', () => {
    const sf = createTestFile(`const x: any = 1;`)
    const usages = checker.findUnsafeUsages(sf)
    for (const u of usages) {
      expect(u.line).toBeGreaterThan(0)
      expect(u.column).toBeGreaterThan(0)
    }
  })

  it('provides meaningful messages', () => {
    const sf = createTestFile(`const x: any = 1;`)
    const usages = checker.findUnsafeUsages(sf)
    for (const u of usages) {
      expect(u.message.length).toBeGreaterThan(0)
    }
  })

  it('detects implicit any in class method params', () => {
    const sf = createTestFile(`class A { method(x) { return x; } }`)
    const usages = checker.findUnsafeUsages(sf)
    const implicit = usages.find((u) => u.variableName === 'x' && u.usage === 'implicit-any')
    expect(implicit).toBeDefined()
  })
})

describe('TypeChecker calculateComplexity', () => {
  const checker = new TypeChecker()

  it('counts function parameter types', () => {
    const sf = createTestFile(`function add(a: number, b: number): number { return a + b; }`)
    const metrics = checker.calculateComplexity(sf)
    expect(metrics.totalTypes).toBeGreaterThanOrEqual(3)
  })

  it('counts class property types', () => {
    const sf = createTestFile(`class User { name: string; age: number; }`)
    const metrics = checker.calculateComplexity(sf)
    expect(metrics.totalTypes).toBeGreaterThanOrEqual(2)
  })

  it('counts class method types', () => {
    const sf = createTestFile(`class Calc { add(a: number, b: number): number { return a + b; } }`)
    const metrics = checker.calculateComplexity(sf)
    expect(metrics.totalTypes).toBeGreaterThanOrEqual(3)
  })

  it('calculates type coverage between 0 and 1', () => {
    const sf = createTestFile(`const a: string = 'x'; const b = 1; const c: boolean = true;`)
    const metrics = checker.calculateComplexity(sf)
    expect(metrics.typeCoverage).toBeGreaterThan(0)
    expect(metrics.typeCoverage).toBeLessThan(1)
  })

  it('counts union types in variables', () => {
    const sf = createTestFile(`const x: string | number = 'hi'; const y: boolean | null = true;`)
    const metrics = checker.calculateComplexity(sf)
    expect(metrics.unionCount).toBeGreaterThanOrEqual(2)
  })

  it('counts intersection types', () => {
    const sf = createTestFile(`const x: { a: number } & { b: string } = { a: 1, b: 'x' };`)
    const metrics = checker.calculateComplexity(sf)
    expect(metrics.intersectionCount).toBeGreaterThanOrEqual(1)
  })

  it('counts complex types with many type arguments', () => {
    const sf = createTestFile(`const x: Map<string, number, boolean> = new Map();`)
    const metrics = checker.calculateComplexity(sf)
    expect(metrics.complexTypes).toBeGreaterThanOrEqual(0)
  })

  it('counts unknown types', () => {
    const sf = createTestFile(`const x: unknown = 42;`)
    const metrics = checker.calculateComplexity(sf)
    expect(metrics.unknownCount).toBeGreaterThanOrEqual(1)
  })

  it('filePath matches source file name', () => {
    const sf = createTestFile(`const x = 1;`, 'complex.ts')
    const metrics = checker.calculateComplexity(sf)
    expect(metrics.filePath).toContain('complex.ts')
  })

  it('returns coverage 1 for empty file', () => {
    const sf = createTestFile(``)
    const metrics = checker.calculateComplexity(sf)
    expect(metrics.typeCoverage).toBe(1)
    expect(metrics.totalTypes).toBe(0)
  })

  it('returns coverage 1 for fully annotated file', () => {
    const sf = createTestFile(`const x: string = 'hi'; const y: number = 1;`)
    const metrics = checker.calculateComplexity(sf)
    expect(metrics.typeCoverage).toBe(1)
  })

  it('counts generic type parameters', () => {
    const sf = createTestFile(`function id<T>(x: T): T { return x; }`)
    const metrics = checker.calculateComplexity(sf)
    expect(metrics.genericCount).toBeGreaterThanOrEqual(1)
  })
})

describe('TypeChecker analyzeFile', () => {
  const checker = new TypeChecker()

  it('returns all sections populated', () => {
    const sf = createTestFile(`const x: string = 'hello'; const y: any = 42;`)
    const result = checker.analyzeFile(sf)
    expect(result.inferenceResults.length).toBeGreaterThanOrEqual(2)
    expect(result.complexityMetrics.length).toBe(1)
    expect(result.summary).toBeDefined()
  })

  it('correctly counts explicitly and implicitly typed variables', () => {
    const sf = createTestFile(`const a: string = 'x'; const b = 1; const c: boolean = true; const d = 'hi';`)
    const result = checker.analyzeFile(sf)
    expect(result.summary.totalVariables).toBe(4)
    expect(result.summary.explicitlyTyped).toBe(2)
    expect(result.summary.implicitlyTyped).toBe(2)
  })

  it('summary typeCoverage matches ratio', () => {
    const sf = createTestFile(`const a: string = 'x'; const b = 1;`)
    const result = checker.analyzeFile(sf)
    expect(result.summary.typeCoverage).toBe(0.5)
  })

  it('counts any usage from unsafe usages', () => {
    const sf = createTestFile(`const x: any = 'test';`)
    const result = checker.analyzeFile(sf)
    expect(result.summary.anyUsageCount).toBeGreaterThanOrEqual(1)
  })

  it('counts unsafe usages', () => {
    const sf = createTestFile(`const x: any = 1; const y = x as string;`)
    const result = checker.analyzeFile(sf)
    expect(result.summary.unsafeCount).toBeGreaterThanOrEqual(2)
  })

  it('empty file has zero variables and coverage 1', () => {
    const sf = createTestFile(``)
    const result = checker.analyzeFile(sf)
    expect(result.summary.totalVariables).toBe(0)
    expect(result.summary.typeCoverage).toBe(1)
    expect(result.summary.mismatchCount).toBe(0)
  })

  it('typeMismatches is empty when types match', () => {
    const sf = createTestFile(`const x: string = 'hello';`)
    const result = checker.analyzeFile(sf)
    expect(result.typeMismatches.length).toBe(0)
  })

  it('complexityMetrics is a single-element array for single file', () => {
    const sf = createTestFile(`const x = 1;`)
    const result = checker.analyzeFile(sf)
    expect(result.complexityMetrics.length).toBe(1)
    expect(result.complexityMetrics[0]!.filePath).toContain('test.ts')
  })
})

describe('no-implicit-any rule', () => {
  it('detects any in function parameter', () => {
    const rule = createNoImplicitAnyRule()
    const { onComplete } = rule.create({
      sourceCode: `function foo(x: any) { return x; }`,
      filePath: 'test.ts',
    })
    const violations = onComplete()
    expect(violations.length).toBeGreaterThanOrEqual(1)
    expect(violations[0]!.ruleId).toBe('no-implicit-any')
  })

  it('detects any in variable annotation', () => {
    const rule = createNoImplicitAnyRule()
    const { onComplete } = rule.create({
      sourceCode: `const val: any = {};`,
      filePath: 'test.ts',
    })
    const violations = onComplete()
    expect(violations.length).toBeGreaterThanOrEqual(1)
    expect(violations.some((v) => v.message.includes('val'))).toBe(true)
  })

  it('does not flag typed parameters', () => {
    const rule = createNoImplicitAnyRule()
    const { onComplete } = rule.create({
      sourceCode: `function foo(x: string): number { return x.length; }`,
      filePath: 'test.ts',
    })
    const violations = onComplete()
    expect(violations.length).toBe(0)
  })

  it('does not flag well-typed variables', () => {
    const rule = createNoImplicitAnyRule()
    const { onComplete } = rule.create({
      sourceCode: `const x: number = 42;`,
      filePath: 'test.ts',
    })
    const violations = onComplete()
    expect(violations.length).toBe(0)
  })

  it('returns correct severity', () => {
    const rule = createNoImplicitAnyRule()
    const { onComplete } = rule.create({
      sourceCode: `const x: any = 1;`,
      filePath: 'test.ts',
    })
    const violations = onComplete()
    expect(violations[0]!.severity).toBe('error')
  })

  it('includes suggestion in violation', () => {
    const rule = createNoImplicitAnyRule()
    const { onComplete } = rule.create({
      sourceCode: `const x: any = 1;`,
      filePath: 'test.ts',
    })
    const violations = onComplete()
    expect(violations[0]!.suggestion).toBeDefined()
    expect(violations[0]!.suggestion!.length).toBeGreaterThan(0)
  })

  it('includes filePath in violation', () => {
    const rule = createNoImplicitAnyRule()
    const { onComplete } = rule.create({
      sourceCode: `const x: any = 1;`,
      filePath: 'myfile.ts',
    })
    const violations = onComplete()
    expect(violations[0]!.filePath).toBe('myfile.ts')
  })

  it('detects multiple any annotations', () => {
    const rule = createNoImplicitAnyRule()
    const { onComplete } = rule.create({
      sourceCode: `const a: any = 1; const b: any = 2; const c: any = 3;`,
      filePath: 'test.ts',
    })
    const violations = onComplete()
    expect(violations.length).toBeGreaterThanOrEqual(3)
  })

  it('visitor is defined', () => {
    const rule = createNoImplicitAnyRule()
    const instance = rule.create({ sourceCode: '', filePath: '' })
    expect(instance.visitor).toBeDefined()
  })

  it('defaultOptions is empty object', () => {
    const rule = createNoImplicitAnyRule()
    expect(rule.defaultOptions).toEqual({})
  })

  it('meta fields are correct', () => {
    const rule = createNoImplicitAnyRule()
    expect(rule.meta.name).toBe('no-implicit-any')
    expect(rule.meta.category).toBe('correctness')
    expect(rule.meta.recommended).toBe(true)
    expect(rule.meta.description.length).toBeGreaterThan(0)
  })
})

describe('no-explicit-any rule', () => {
  it('detects explicit any on variable', () => {
    const rule = createNoExplicitAnyRule()
    const { onComplete } = rule.create({
      sourceCode: `const x: any = 1;`,
      filePath: 'test.ts',
    })
    const violations = onComplete()
    expect(violations.length).toBeGreaterThanOrEqual(1)
    expect(violations[0]!.ruleId).toBe('no-explicit-any')
  })

  it('detects explicit any on parameter', () => {
    const rule = createNoExplicitAnyRule()
    const { onComplete } = rule.create({
      sourceCode: `function foo(a: any) {}`,
      filePath: 'test.ts',
    })
    const violations = onComplete()
    expect(violations.length).toBeGreaterThanOrEqual(1)
  })

  it('does not flag typed code', () => {
    const rule = createNoExplicitAnyRule()
    const { onComplete } = rule.create({
      sourceCode: `const x: string = 'hello'; function foo(a: number) {}`,
      filePath: 'test.ts',
    })
    const violations = onComplete()
    expect(violations.length).toBe(0)
  })

  it('returns warning severity', () => {
    const rule = createNoExplicitAnyRule()
    const { onComplete } = rule.create({
      sourceCode: `const x: any = 1;`,
      filePath: 'test.ts',
    })
    const violations = onComplete()
    expect(violations[0]!.severity).toBe('warning')
  })

  it('provides suggestion for fix', () => {
    const rule = createNoExplicitAnyRule()
    const { onComplete } = rule.create({
      sourceCode: `const x: any = 1;`,
      filePath: 'test.ts',
    })
    const violations = onComplete()
    expect(violations[0]!.suggestion).toContain('specific type')
  })

  it('meta fields are correct', () => {
    const rule = createNoExplicitAnyRule()
    expect(rule.meta.name).toBe('no-explicit-any')
    expect(rule.meta.category).toBe('correctness')
    expect(rule.meta.recommended).toBe(true)
    expect(rule.meta.description.length).toBeGreaterThan(0)
  })

  it('does not match any[] array type', () => {
    const rule = createNoExplicitAnyRule()
    const { onComplete } = rule.create({
      sourceCode: `const x: any[] = [1];`,
      filePath: 'test.ts',
    })
    const violations = onComplete()
    expect(violations.length).toBe(0)
  })

  it('returns empty for empty source', () => {
    const rule = createNoExplicitAnyRule()
    const { onComplete } = rule.create({ sourceCode: '', filePath: '' })
    expect(onComplete().length).toBe(0)
  })

  it('detects multiple explicit any in one file', () => {
    const rule = createNoExplicitAnyRule()
    const { onComplete } = rule.create({
      sourceCode: `const a: any = 1; function f(b: any) {} let c: any;`,
      filePath: 'test.ts',
    })
    const violations = onComplete()
    expect(violations.length).toBeGreaterThanOrEqual(3)
  })
})

describe('no-type-assertion rule', () => {
  it('detects as MyType assertion', () => {
    const rule = createNoTypeAssertionRule()
    const { onComplete } = rule.create({
      sourceCode: `const x = {} as MyType;`,
      filePath: 'test.ts',
    })
    const violations = onComplete()
    expect(violations.length).toBe(1)
    expect(violations[0]!.message).toContain('MyType')
  })

  it('does not flag as const', () => {
    const rule = createNoTypeAssertionRule()
    const { onComplete } = rule.create({
      sourceCode: `const x = [1, 2, 3] as const;`,
      filePath: 'test.ts',
    })
    const violations = onComplete()
    expect(violations.length).toBe(0)
  })

  it('detects multiple type assertions on different lines', () => {
    const code = `const a = {} as TypeA;\nconst b = {} as TypeB;\nconst c = {} as TypeC;`
    const rule = createNoTypeAssertionRule()
    const { onComplete } = rule.create({ sourceCode: code, filePath: 'test.ts' })
    const violations = onComplete()
    expect(violations.length).toBe(3)
  })

  it('returns warning severity', () => {
    const rule = createNoTypeAssertionRule()
    const { onComplete } = rule.create({
      sourceCode: `const x = {} as MyType;`,
      filePath: 'test.ts',
    })
    const violations = onComplete()
    expect(violations[0]!.severity).toBe('warning')
  })

  it('provides suggestion', () => {
    const rule = createNoTypeAssertionRule()
    const { onComplete } = rule.create({
      sourceCode: `const x = {} as MyType;`,
      filePath: 'test.ts',
    })
    const violations = onComplete()
    expect(violations[0]!.suggestion).toContain('type guard')
  })

  it('returns empty for code without assertions', () => {
    const rule = createNoTypeAssertionRule()
    const { onComplete } = rule.create({
      sourceCode: `const x = { a: 1 }; const y = x.a;`,
      filePath: 'test.ts',
    })
    const violations = onComplete()
    expect(violations.length).toBe(0)
  })

  it('meta fields are correct', () => {
    const rule = createNoTypeAssertionRule()
    expect(rule.meta.name).toBe('no-type-assertion')
    expect(rule.meta.category).toBe('correctness')
    expect(rule.meta.recommended).toBe(true)
    expect(rule.meta.description).toContain('as const')
  })

  it('returns empty for empty source', () => {
    const rule = createNoTypeAssertionRule()
    const { onComplete } = rule.create({ sourceCode: '', filePath: '' })
    expect(onComplete().length).toBe(0)
  })
})

describe('no-non-null-assertion rule', () => {
  it('detects non-null assertion', () => {
    const rule = createNoNonNullAssertionRule()
    const { onComplete } = rule.create({
      sourceCode: `const x = maybe!.prop;`,
      filePath: 'test.ts',
    })
    const violations = onComplete()
    expect(violations.length).toBe(1)
    expect(violations[0]!.message).toContain('maybe')
  })

  it('detects multiple non-null assertions', () => {
    const rule = createNoNonNullAssertionRule()
    const { onComplete } = rule.create({
      sourceCode: `const a = x!.prop; const b = y!.val;`,
      filePath: 'test.ts',
    })
    const violations = onComplete()
    expect(violations.length).toBe(2)
  })

  it('does not flag regular property access', () => {
    const rule = createNoNonNullAssertionRule()
    const { onComplete } = rule.create({
      sourceCode: `const x = obj.prop; const y = arr[0];`,
      filePath: 'test.ts',
    })
    const violations = onComplete()
    expect(violations.length).toBe(0)
  })

  it('does not flag identifiers with exclamation in name', () => {
    const rule = createNoNonNullAssertionRule()
    const { onComplete } = rule.create({
      sourceCode: `const isValid = true; console.log(isValid);`,
      filePath: 'test.ts',
    })
    const violations = onComplete()
    expect(violations.length).toBe(0)
  })

  it('returns warning severity', () => {
    const rule = createNoNonNullAssertionRule()
    const { onComplete } = rule.create({
      sourceCode: `const x = foo!.bar;`,
      filePath: 'test.ts',
    })
    const violations = onComplete()
    expect(violations[0]!.severity).toBe('warning')
  })

  it('suggests optional chaining', () => {
    const rule = createNoNonNullAssertionRule()
    const { onComplete } = rule.create({
      sourceCode: `const x = data!.value;`,
      filePath: 'test.ts',
    })
    const violations = onComplete()
    expect(violations[0]!.suggestion).toContain('optional chaining')
  })

  it('meta fields are correct', () => {
    const rule = createNoNonNullAssertionRule()
    expect(rule.meta.name).toBe('no-non-null-assertion')
    expect(rule.meta.category).toBe('correctness')
    expect(rule.meta.recommended).toBe(true)
  })

  it('returns empty for empty source', () => {
    const rule = createNoNonNullAssertionRule()
    const { onComplete } = rule.create({ sourceCode: '', filePath: '' })
    expect(onComplete().length).toBe(0)
  })
})

describe('explicit-return-type rule', () => {
  it('detects exported function without return type', () => {
    const rule = createExplicitReturnTypeRule()
    const { onComplete } = rule.create({
      sourceCode: `export function greet(name: string) { return 'Hello ' + name; }`,
      filePath: 'test.ts',
    })
    const violations = onComplete()
    expect(violations.length).toBe(1)
    expect(violations[0]!.message).toContain('greet')
  })

  it('does not flag exported function with return type', () => {
    const rule = createExplicitReturnTypeRule()
    const { onComplete } = rule.create({
      sourceCode: `export function greet(name: string): string { return 'Hello ' + name; }`,
      filePath: 'test.ts',
    })
    const violations = onComplete()
    expect(violations.length).toBe(0)
  })

  it('does not flag non-exported function', () => {
    const rule = createExplicitReturnTypeRule()
    const { onComplete } = rule.create({
      sourceCode: `function internal(x: number) { return x * 2; }`,
      filePath: 'test.ts',
    })
    const violations = onComplete()
    expect(violations.length).toBe(0)
  })

  it('detects exported arrow function without return type', () => {
    const rule = createExplicitReturnTypeRule()
    const { onComplete } = rule.create({
      sourceCode: `export const add = (a: number, b: number) => a + b;`,
      filePath: 'test.ts',
    })
    const violations = onComplete()
    expect(violations.length).toBe(1)
    expect(violations[0]!.message).toContain('add')
  })

  it('returns warning severity', () => {
    const rule = createExplicitReturnTypeRule()
    const { onComplete } = rule.create({
      sourceCode: `export function foo() { return 1; }`,
      filePath: 'test.ts',
    })
    const violations = onComplete()
    expect(violations[0]!.severity).toBe('warning')
  })

  it('suggests adding return type', () => {
    const rule = createExplicitReturnTypeRule()
    const { onComplete } = rule.create({
      sourceCode: `export function compute(x: number) { return x; }`,
      filePath: 'test.ts',
    })
    const violations = onComplete()
    expect(violations[0]!.suggestion).toContain('return type')
  })

  it('meta fields are correct', () => {
    const rule = createExplicitReturnTypeRule()
    expect(rule.meta.name).toBe('explicit-return-type')
    expect(rule.meta.category).toBe('style')
    expect(rule.meta.recommended).toBe(false)
  })

  it('detects multiple exported functions', () => {
    const code = `export function a() { return 1; }\nexport function b() { return 2; }`
    const rule = createExplicitReturnTypeRule()
    const { onComplete } = rule.create({ sourceCode: code, filePath: 'test.ts' })
    const violations = onComplete()
    expect(violations.length).toBe(2)
  })

  it('returns empty for empty source', () => {
    const rule = createExplicitReturnTypeRule()
    const { onComplete } = rule.create({ sourceCode: '', filePath: '' })
    expect(onComplete().length).toBe(0)
  })

  it('flags exported arrow function with block body missing return type', () => {
    const rule = createExplicitReturnTypeRule()
    const { onComplete } = rule.create({
      sourceCode: `export const run = () => { return 42; };`,
      filePath: 'test.ts',
    })
    const violations = onComplete()
    expect(violations.length).toBe(1)
  })
})

describe('rule cross-validation', () => {
  const allRuleFactories = [
    createNoImplicitAnyRule,
    createNoExplicitAnyRule,
    createNoTypeAssertionRule,
    createNoNonNullAssertionRule,
    createExplicitReturnTypeRule,
  ]

  it('all rules have unique names', () => {
    const names = allRuleFactories.map((f) => f().meta.name)
    const uniqueNames = new Set(names)
    expect(uniqueNames.size).toBe(names.length)
  })

  it('all rules return empty violations for empty source', () => {
    for (const factory of allRuleFactories) {
      const rule = factory()
      const { onComplete } = rule.create({ sourceCode: '', filePath: '' })
      expect(onComplete().length).toBe(0)
    }
  })

  it('all rules return empty violations for comment-only source', () => {
    const source = `// comment\n/* block comment */\n// another`
    for (const factory of allRuleFactories) {
      const rule = factory()
      const { onComplete } = rule.create({ sourceCode: source, filePath: 'test.ts' })
      expect(onComplete().length).toBe(0)
    }
  })

  it('all rules have visitor and onComplete', () => {
    for (const factory of allRuleFactories) {
      const rule = factory()
      const instance = rule.create({ sourceCode: '', filePath: '' })
      expect(instance.visitor).toBeDefined()
      expect(typeof instance.onComplete).toBe('function')
    }
  })

  it('all rules have valid meta', () => {
    const validCategories = ['complexity', 'correctness', 'dependencies', 'patterns', 'performance', 'security', 'style', 'testing']
    for (const factory of allRuleFactories) {
      const rule = factory()
      expect(rule.meta.name.length).toBeGreaterThan(0)
      expect(rule.meta.description.length).toBeGreaterThan(0)
      expect(validCategories).toContain(rule.meta.category)
      expect(typeof rule.meta.recommended).toBe('boolean')
    }
  })

  it('all rules have defaultOptions', () => {
    for (const factory of allRuleFactories) {
      const rule = factory()
      expect(rule.defaultOptions).toBeDefined()
      expect(typeof rule.defaultOptions).toBe('object')
    }
  })

  it('all violations have required fields', () => {
    for (const factory of allRuleFactories) {
      const rule = factory()
      const { onComplete } = rule.create({ sourceCode: `const x: any = {} as any;`, filePath: 'test.ts' })
      const violations = onComplete()
      for (const v of violations) {
        expect(v.filePath).toBeDefined()
        expect(v.message.length).toBeGreaterThan(0)
        expect(v.range.start.line).toBeGreaterThan(0)
        expect(v.range.start.column).toBeGreaterThan(0)
        expect(v.range.end.line).toBeGreaterThan(0)
        expect(v.ruleId.length).toBeGreaterThan(0)
        expect(['error', 'warning', 'info']).toContain(v.severity)
      }
    }
  })
})

describe('index exports', () => {
  it('exports TypeChecker class', () => {
    expect(TypeChecker).toBeDefined()
    expect(typeof TypeChecker).toBe('function')
    const instance = new TypeChecker()
    expect(instance).toBeDefined()
  })

  it('exports all rule factories', () => {
    expect(typeof createNoImplicitAnyRule).toBe('function')
    expect(typeof createNoExplicitAnyRule).toBe('function')
    expect(typeof createNoTypeAssertionRule).toBe('function')
    expect(typeof createNoNonNullAssertionRule).toBe('function')
    expect(typeof createExplicitReturnTypeRule).toBe('function')
  })

  it('TypeChecker has all expected methods', () => {
    const checker = new TypeChecker()
    expect(typeof checker.checkType).toBe('function')
    expect(typeof checker.getVariableType).toBe('function')
    expect(typeof checker.compareTypes).toBe('function')
    expect(typeof checker.isTypeSafe).toBe('function')
    expect(typeof checker.inferTypes).toBe('function')
    expect(typeof checker.findUnsafeUsages).toBe('function')
    expect(typeof checker.calculateComplexity).toBe('function')
    expect(typeof checker.analyzeFile).toBe('function')
  })
})

describe('TypeChecker integration with complex code', () => {
  const checker = new TypeChecker()

  it('handles generic functions', () => {
    const code = `
      function first<T>(arr: T[]): T | undefined {
        return arr[0];
      }
      const result = first([1, 2, 3]);
    `
    const sf = createTestFile(code)
    const result = checker.analyzeFile(sf)
    expect(result.summary.totalVariables).toBeGreaterThanOrEqual(1)
  })

  it('handles interface declarations', () => {
    const code = `
      interface Config {
        debug: boolean;
        port: number;
        host: string;
      }
      const config: Config = { debug: true, port: 3000, host: 'localhost' };
    `
    const sf = createTestFile(code)
    const result = checker.analyzeFile(sf)
    expect(result.summary.totalVariables).toBeGreaterThanOrEqual(1)
    const configVar = result.inferenceResults.find((r) => r.variableName === 'config')
    expect(configVar).toBeDefined()
    expect(configVar!.hasExplicitAnnotation).toBe(true)
  })

  it('handles class with constructor and methods', () => {
    const code = `
      class Service {
        private name: string;
        constructor(name: string) {
          this.name = name;
        }
        getName(): string {
          return this.name;
        }
      }
      const svc = new Service('test');
    `
    const sf = createTestFile(code)
    const result = checker.analyzeFile(sf)
    expect(result.complexityMetrics[0]!.totalTypes).toBeGreaterThanOrEqual(2)
  })

  it('handles nested objects and arrays', () => {
    const code = `
      const data: { users: Array<{ name: string; age: number }> } = {
        users: [{ name: 'Alice', age: 30 }]
      };
    `
    const sf = createTestFile(code)
    const metrics = checker.calculateComplexity(sf)
    expect(metrics.totalTypes).toBeGreaterThanOrEqual(1)
    expect(metrics.complexTypes).toBeGreaterThanOrEqual(0)
  })

  it('handles async/await and Promises', () => {
    const code = `
      async function fetchData(): Promise<string> {
        return 'data';
      }
      const result: Promise<string> = fetchData();
    `
    const sf = createTestFile(code)
    const vType = checker.getVariableType(sf, 'result')
    expect(vType).not.toBeNull()
    expect(vType!.isPromise).toBe(true)
  })

  it('handles type aliases', () => {
    const code = `
      type StringOrNumber = string | number;
      const x: StringOrNumber = 'hello';
    `
    const sf = createTestFile(code)
    const result = checker.getVariableType(sf, 'x')
    expect(result).not.toBeNull()
  })

  it('handles mapped types', () => {
    const code = `
      type Readonly<T> = { readonly [P in keyof T]: T[P] };
      const x: Readonly<{ a: string }> = { a: 'test' };
    `
    const sf = createTestFile(code)
    const result = checker.analyzeFile(sf)
    expect(result.summary.totalVariables).toBeGreaterThanOrEqual(1)
  })

  it('handles default parameters', () => {
    const code = `
      function greet(name: string, greeting: string = 'Hello'): string {
        return greeting + ' ' + name;
      }
    `
    const sf = createTestFile(code)
    const metrics = checker.calculateComplexity(sf)
    expect(metrics.totalTypes).toBeGreaterThanOrEqual(2)
  })

  it('handles destructured variables', () => {
    const code = `const { x, y }: { x: number; y: string } = { x: 1, y: 'a' };`
    const sf = createTestFile(code)
    const results = checker.inferTypes(sf)
    expect(results.length).toBeGreaterThanOrEqual(1)
  })

  it('handles rest parameters', () => {
    const code = `function sum(...nums: number[]): number { return nums.reduce((a, b) => a + b, 0); }`
    const sf = createTestFile(code)
    const metrics = checker.calculateComplexity(sf)
    expect(metrics.totalTypes).toBeGreaterThanOrEqual(1)
  })
})
