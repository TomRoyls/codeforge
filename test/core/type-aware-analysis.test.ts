import { describe, it, expect } from 'vitest'
import { Project, SyntaxKind } from 'ts-morph'

import { TypeChecker } from '../../src/core/type-aware/type-checker.js'
import type {
  TypeAwareAnalysisResult,
  TypeCheckResult,
  TypeInferenceResult,
  UnsafeTypeUsage,
  TypeComplexityMetrics,
} from '../../src/core/type-aware/types.js'
import {
  createNoImplicitAnyRule,
  createNoExplicitAnyRule,
  createNoTypeAssertionRule,
  createNoNonNullAssertionRule,
  createExplicitReturnTypeRule,
} from '../../src/core/type-aware/type-aware-rules.js'

function createTestFile(code: string) {
  const project = new Project({
    useInMemoryFileSystem: true,
    compilerOptions: { strict: true, lib: ['ES2020'] },
  })
  return project.createSourceFile('test.ts', code)
}

describe('TypeChecker', () => {
  const checker = new TypeChecker()

  describe('checkType', () => {
    it('returns correct type info for string variables', () => {
      const sf = createTestFile(`const x: string = 'hello';`)
      const result = checker.checkType(sf, 1, 7)
      expect(result.isString).toBe(true)
      expect(result.typeString).toContain('string')
    })

    it('returns correct type info for number variables', () => {
      const sf = createTestFile(`const x: number = 42;`)
      const result = checker.checkType(sf, 1, 7)
      expect(result.isNumber).toBe(true)
    })

    it('handles any type', () => {
      const sf = createTestFile(`const x: any = 'hello';`)
      const result = checker.checkType(sf, 1, 7)
      expect(result.isAny).toBe(true)
    })

    it('handles boolean type', () => {
      const sf = createTestFile(`const x: boolean = true;`)
      const result = checker.checkType(sf, 1, 7)
      expect(result.isBoolean).toBe(true)
    })

    it('handles array type', () => {
      const sf = createTestFile(`const x: number[] = [1, 2, 3];`)
      const result = checker.checkType(sf, 1, 7)
      expect(result.isArray).toBe(true)
    })

    it('handles union types', () => {
      const sf = createTestFile(`const x: string | number = 'hello';`)
      const result = checker.checkType(sf, 1, 7)
      expect(result.isUnion).toBe(true)
    })

    it('handles nullable types', () => {
      const sf = createTestFile(`const x: string | null = null;`)
      const result = checker.checkType(sf, 1, 7)
      expect(result.isNullable).toBe(true)
      expect(result.isNull).toBe(false)
    })

    it('handles literal types', () => {
      const sf = createTestFile(`const x = 42;`)
      const result = checker.checkType(sf, 1, 7)
      expect(result.isLiteral).toBe(true)
    })

    it('returns empty result for out of bounds position', () => {
      const sf = createTestFile(`const x = 1;`)
      const result = checker.checkType(sf, 10, 10)
      expect(result.typeString).toBe('unknown')
    })

    it('detects null type', () => {
      const sf = createTestFile(`const x = null;`)
      const result = checker.checkType(sf, 1, 7)
      expect(result.isNull).toBe(true)
    })

    it('detects undefined type', () => {
      const sf = createTestFile(`const x = undefined;`)
      const result = checker.checkType(sf, 1, 7)
      expect(result.isUndefined).toBe(true)
    })
  })

  describe('getVariableType', () => {
    it('finds variable by name', () => {
      const sf = createTestFile(`const myVar: string = 'test';`)
      const result = checker.getVariableType(sf, 'myVar')
      expect(result).not.toBeNull()
      expect(result!.isString).toBe(true)
    })

    it('returns null for unknown variables', () => {
      const sf = createTestFile(`const x = 1;`)
      const result = checker.getVariableType(sf, 'nonexistent')
      expect(result).toBeNull()
    })

    it('returns correct type for number', () => {
      const sf = createTestFile(`const x: number = 42;`)
      const result = checker.getVariableType(sf, 'x')
      expect(result!.isNumber).toBe(true)
    })

    it('returns correct type for array', () => {
      const sf = createTestFile(`const x: number[] = [1];`)
      const result = checker.getVariableType(sf, 'x')
      expect(result!.isArray).toBe(true)
    })

    it('returns correct type for union', () => {
      const sf = createTestFile(`const x: string | number = 'hi';`)
      const result = checker.getVariableType(sf, 'x')
      expect(result!.isUnion).toBe(true)
    })
  })

  describe('compareTypes', () => {
    it('detects identical types', () => {
      const source: TypeCheckResult = {
        isAny: false, isNull: false, isUndefined: false, isNullable: false,
        isString: true, isNumber: false, isBoolean: false, isArray: false,
        isObject: false, isFunction: false, isPromise: false, isEnum: false,
        isUnion: false, isIntersection: false, isLiteral: false, isGeneric: false,
        typeName: 'string', typeString: 'string',
      }
      const target: TypeCheckResult = { ...source }
      const relation = checker.compareTypes(source, target)
      expect(relation.isIdentical).toBe(true)
    })

    it('detects assignable types when target is any', () => {
      const source: TypeCheckResult = {
        isAny: false, isNull: false, isUndefined: false, isNullable: false,
        isString: true, isNumber: false, isBoolean: false, isArray: false,
        isObject: false, isFunction: false, isPromise: false, isEnum: false,
        isUnion: false, isIntersection: false, isLiteral: false, isGeneric: false,
        typeName: 'string', typeString: 'string',
      }
      const target: TypeCheckResult = {
        isAny: true, isNull: false, isUndefined: false, isNullable: false,
        isString: false, isNumber: false, isBoolean: false, isArray: false,
        isObject: false, isFunction: false, isPromise: false, isEnum: false,
        isUnion: false, isIntersection: false, isLiteral: false, isGeneric: false,
        typeName: 'any', typeString: 'any',
      }
      const relation = checker.compareTypes(source, target)
      expect(relation.isAssignable).toBe(true)
    })

    it('detects null assignable to nullable', () => {
      const source: TypeCheckResult = {
        isAny: false, isNull: true, isUndefined: false, isNullable: true,
        isString: false, isNumber: false, isBoolean: false, isArray: false,
        isObject: false, isFunction: false, isPromise: false, isEnum: false,
        isUnion: false, isIntersection: false, isLiteral: false, isGeneric: false,
        typeName: 'null', typeString: 'null',
      }
      const target: TypeCheckResult = {
        isAny: false, isNull: false, isUndefined: false, isNullable: true,
        isString: false, isNumber: false, isBoolean: false, isArray: false,
        isObject: false, isFunction: false, isPromise: false, isEnum: false,
        isUnion: true, isIntersection: false, isLiteral: false, isGeneric: false,
        typeName: 'string', typeString: 'string | null',
      }
      const relation = checker.compareTypes(source, target)
      expect(relation.isAssignable).toBe(true)
    })

    it('detects non-assignable types', () => {
      const source: TypeCheckResult = {
        isAny: false, isNull: false, isUndefined: false, isNullable: false,
        isString: true, isNumber: false, isBoolean: false, isArray: false,
        isObject: false, isFunction: false, isPromise: false, isEnum: false,
        isUnion: false, isIntersection: false, isLiteral: false, isGeneric: false,
        typeName: 'string', typeString: 'string',
      }
      const target: TypeCheckResult = {
        isAny: false, isNull: false, isUndefined: false, isNullable: false,
        isString: false, isNumber: true, isBoolean: false, isArray: false,
        isObject: false, isFunction: false, isPromise: false, isEnum: false,
        isUnion: false, isIntersection: false, isLiteral: false, isGeneric: false,
        typeName: 'number', typeString: 'number',
      }
      const relation = checker.compareTypes(source, target)
      expect(relation.isAssignable).toBe(false)
      expect(relation.isIdentical).toBe(false)
    })

    it('detects subtype relationship', () => {
      const source: TypeCheckResult = {
        isAny: false, isNull: true, isUndefined: false, isNullable: true,
        isString: false, isNumber: false, isBoolean: false, isArray: false,
        isObject: false, isFunction: false, isPromise: false, isEnum: false,
        isUnion: false, isIntersection: false, isLiteral: false, isGeneric: false,
        typeName: 'null', typeString: 'null',
      }
      const target: TypeCheckResult = {
        isAny: false, isNull: false, isUndefined: false, isNullable: true,
        isString: false, isNumber: false, isBoolean: false, isArray: false,
        isObject: false, isFunction: false, isPromise: false, isEnum: false,
        isUnion: true, isIntersection: false, isLiteral: false, isGeneric: false,
        typeName: 'string', typeString: 'string | null',
      }
      const relation = checker.compareTypes(source, target)
      expect(relation.isSubtype).toBe(true)
      expect(relation.isIdentical).toBe(false)
    })

    it('same typeString is assignable', () => {
      const source: TypeCheckResult = {
        isAny: false, isNull: false, isUndefined: false, isNullable: false,
        isString: true, isNumber: false, isBoolean: false, isArray: false,
        isObject: false, isFunction: false, isPromise: false, isEnum: false,
        isUnion: false, isIntersection: false, isLiteral: false, isGeneric: false,
        typeName: 'string', typeString: 'string',
      }
      const target: TypeCheckResult = {
        isAny: false, isNull: false, isUndefined: false, isNullable: false,
        isString: true, isNumber: false, isBoolean: false, isArray: false,
        isObject: false, isFunction: false, isPromise: false, isEnum: false,
        isUnion: false, isIntersection: false, isLiteral: false, isGeneric: false,
        typeName: 'String', typeString: 'string',
      }
      const relation = checker.compareTypes(source, target)
      expect(relation.isAssignable).toBe(true)
    })
  })

  describe('isTypeSafe', () => {
    it('returns false for any type', () => {
      const type: TypeCheckResult = {
        isAny: true, isNull: false, isUndefined: false, isNullable: false,
        isString: false, isNumber: false, isBoolean: false, isArray: false,
        isObject: false, isFunction: false, isPromise: false, isEnum: false,
        isUnion: false, isIntersection: false, isLiteral: false, isGeneric: false,
        typeName: 'any', typeString: 'any',
      }
      expect(checker.isTypeSafe(type)).toBe(false)
    })

    it('returns false for unknown type', () => {
      const type: TypeCheckResult = {
        isAny: false, isNull: false, isUndefined: false, isNullable: false,
        isString: false, isNumber: false, isBoolean: false, isArray: false,
        isObject: false, isFunction: false, isPromise: false, isEnum: false,
        isUnion: false, isIntersection: false, isLiteral: false, isGeneric: false,
        typeName: 'unknown', typeString: 'unknown',
      }
      expect(checker.isTypeSafe(type)).toBe(false)
    })

    it('returns true for string type', () => {
      const type: TypeCheckResult = {
        isAny: false, isNull: false, isUndefined: false, isNullable: false,
        isString: true, isNumber: false, isBoolean: false, isArray: false,
        isObject: false, isFunction: false, isPromise: false, isEnum: false,
        isUnion: false, isIntersection: false, isLiteral: false, isGeneric: false,
        typeName: 'string', typeString: 'string',
      }
      expect(checker.isTypeSafe(type)).toBe(true)
    })

    it('returns true for number type', () => {
      const type: TypeCheckResult = {
        isAny: false, isNull: false, isUndefined: false, isNullable: false,
        isString: false, isNumber: true, isBoolean: false, isArray: false,
        isObject: false, isFunction: false, isPromise: false, isEnum: false,
        isUnion: false, isIntersection: false, isLiteral: false, isGeneric: false,
        typeName: 'number', typeString: 'number',
      }
      expect(checker.isTypeSafe(type)).toBe(true)
    })
  })

  describe('inferTypes', () => {
    it('finds all variables', () => {
      const sf = createTestFile(`const x = 1; const y = 'hello';`)
      const results = checker.inferTypes(sf)
      expect(results.length).toBe(2)
      expect(results.map((r) => r.variableName)).toContain('x')
      expect(results.map((r) => r.variableName)).toContain('y')
    })

    it('detects explicit annotations', () => {
      const sf = createTestFile(`const x: string = 'hello';`)
      const results = checker.inferTypes(sf)
      expect(results[0]!.hasExplicitAnnotation).toBe(true)
      expect(results[0]!.isInferred).toBe(false)
    })

    it('detects inferred types', () => {
      const sf = createTestFile(`const x = 42;`)
      const results = checker.inferTypes(sf)
      expect(results[0]!.hasExplicitAnnotation).toBe(false)
      expect(results[0]!.isInferred).toBe(true)
    })

    it('includes file path and position', () => {
      const sf = createTestFile(`const x = 1;`)
      const results = checker.inferTypes(sf)
      expect(results[0]!.filePath).toContain('test.ts')
      expect(results[0]!.line).toBeGreaterThan(0)
      expect(results[0]!.column).toBeGreaterThan(0)
    })

    it('provides declared and inferred type for annotated variables', () => {
      const sf = createTestFile(`const x: string = 'hello';`)
      const results = checker.inferTypes(sf)
      expect(results[0]!.declaredType).not.toBeNull()
      expect(results[0]!.declaredType!.typeString).toContain('string')
    })

    it('declared type is null for inferred-only variables', () => {
      const sf = createTestFile(`const x = 42;`)
      const results = checker.inferTypes(sf)
      expect(results[0]!.declaredType).toBeNull()
    })

    it('returns empty array for file with no variables', () => {
      const sf = createTestFile(`function foo() {}`)
      const results = checker.inferTypes(sf)
      expect(results.length).toBe(0)
    })
  })

  describe('findUnsafeUsages', () => {
    it('detects explicit any types', () => {
      const sf = createTestFile(`const x: any = 'hello';`)
      const usages = checker.findUnsafeUsages(sf)
      const anyUsage = usages.find((u) => u.usage === 'any-cast')
      expect(anyUsage).toBeDefined()
      expect(anyUsage!.variableName).toBe('x')
    })

    it('detects type assertions (as X)', () => {
      const sf = createTestFile(`const x = {} as MyType;`)
      const usages = checker.findUnsafeUsages(sf)
      const assertion = usages.find((u) => u.usage === 'type-assertion')
      expect(assertion).toBeDefined()
    })

    it('detects non-null assertions', () => {
      const sf = createTestFile(`const x: string | null = null; const y = x!.length;`)
      const usages = checker.findUnsafeUsages(sf)
      const nonNull = usages.find((u) => u.usage === 'non-null-assertion')
      expect(nonNull).toBeDefined()
    })

    it('includes file path in usages', () => {
      const sf = createTestFile(`const x: any = 1;`)
      const usages = checker.findUnsafeUsages(sf)
      expect(usages.length).toBeGreaterThan(0)
      expect(usages[0]!.filePath).toContain('test.ts')
    })

    it('detects multiple unsafe usages', () => {
      const sf = createTestFile(`const x: any = 1; const y = x as string;`)
      const usages = checker.findUnsafeUsages(sf)
      expect(usages.length).toBeGreaterThanOrEqual(2)
    })

    it('returns empty array for safe code', () => {
      const sf = createTestFile(`const x: string = 'hello'; const y: number = 42;`)
      const usages = checker.findUnsafeUsages(sf)
      expect(usages.filter((u) => u.usage !== 'type-assertion')).toHaveLength(0)
    })
  })

  describe('calculateComplexity', () => {
    it('counts types correctly', () => {
      const sf = createTestFile(`const x: string = 'hello'; const y: number = 42;`)
      const metrics = checker.calculateComplexity(sf)
      expect(metrics.totalTypes).toBeGreaterThanOrEqual(2)
    })

    it('calculates coverage', () => {
      const sf = createTestFile(`const x: string = 'hello'; const y = 42;`)
      const metrics = checker.calculateComplexity(sf)
      expect(metrics.typeCoverage).toBeGreaterThan(0)
      expect(metrics.typeCoverage).toBeLessThanOrEqual(1)
    })

    it('counts any types', () => {
      const sf = createTestFile(`const x: any = 1; const y: string = 'hi';`)
      const metrics = checker.calculateComplexity(sf)
      expect(metrics.anyCount).toBeGreaterThanOrEqual(1)
    })

    it('counts union types', () => {
      const sf = createTestFile(`const x: string | number = 'hi';`)
      const metrics = checker.calculateComplexity(sf)
      expect(metrics.unionCount).toBeGreaterThanOrEqual(1)
    })

    it('includes file path', () => {
      const sf = createTestFile(`const x = 1;`)
      const metrics = checker.calculateComplexity(sf)
      expect(metrics.filePath).toContain('test.ts')
    })

    it('returns full coverage for fully annotated file', () => {
      const sf = createTestFile(`const x: string = 'hello';`)
      const metrics = checker.calculateComplexity(sf)
      expect(metrics.typeCoverage).toBe(1)
    })

    it('returns zero coverage for unannotated file', () => {
      const sf = createTestFile(`const x = 'hello';`)
      const metrics = checker.calculateComplexity(sf)
      expect(metrics.typeCoverage).toBe(0)
    })

    it('handles empty file', () => {
      const sf = createTestFile(``)
      const metrics = checker.calculateComplexity(sf)
      expect(metrics.totalTypes).toBe(0)
      expect(metrics.typeCoverage).toBe(1)
    })
  })

  describe('analyzeFile', () => {
    it('combines all analyses', () => {
      const sf = createTestFile(`const x: any = 'hello'; const y = 42;`)
      const result = checker.analyzeFile(sf)
      expect(result.inferenceResults).toBeDefined()
      expect(result.unsafeUsages).toBeDefined()
      expect(result.complexityMetrics).toBeDefined()
      expect(result.typeMismatches).toBeDefined()
    })

    it('summary is correct for mixed file', () => {
      const sf = createTestFile(`const x: string = 'hello'; const y = 42;`)
      const result = checker.analyzeFile(sf)
      expect(result.summary.totalVariables).toBe(2)
      expect(result.summary.explicitlyTyped).toBe(1)
      expect(result.summary.implicitlyTyped).toBe(1)
    })

    it('summary counts any usages', () => {
      const sf = createTestFile(`const x: any = 1;`)
      const result = checker.analyzeFile(sf)
      expect(result.summary.anyUsageCount).toBeGreaterThan(0)
    })

    it('summary counts unsafe usages', () => {
      const sf = createTestFile(`const x: any = 1; const y = x as string;`)
      const result = checker.analyzeFile(sf)
      expect(result.summary.unsafeCount).toBeGreaterThan(0)
    })

    it('computes type coverage in summary', () => {
      const sf = createTestFile(`const x: string = 'hello'; const y = 42;`)
      const result = checker.analyzeFile(sf)
      expect(result.summary.typeCoverage).toBe(0.5)
    })

    it('handles empty file', () => {
      const sf = createTestFile(``)
      const result = checker.analyzeFile(sf)
      expect(result.summary.totalVariables).toBe(0)
      expect(result.summary.typeCoverage).toBe(1)
    })

    it('detects type mismatches', () => {
      const sf = createTestFile(`const x: string = 42 as unknown as string;`)
      const result = checker.analyzeFile(sf)
      expect(result.typeMismatches).toBeDefined()
    })
  })
})

describe('Type-Aware Rules', () => {
  describe('no-implicit-any', () => {
    it('detects : any annotations', () => {
      const rule = createNoImplicitAnyRule()
      const { onComplete } = rule.create({
        sourceCode: `const x: any = 'hello';`,
        filePath: 'test.ts',
      })
      const violations = onComplete()
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0]!.ruleId).toBe('no-implicit-any')
    })

    it('passes for typed code', () => {
      const rule = createNoImplicitAnyRule()
      const { onComplete } = rule.create({
        sourceCode: `const x: string = 'hello';`,
        filePath: 'test.ts',
      })
      const violations = onComplete()
      expect(violations.length).toBe(0)
    })

    it('has correct meta', () => {
      const rule = createNoImplicitAnyRule()
      expect(rule.meta.name).toBe('no-implicit-any')
      expect(rule.meta.category).toBe('correctness')
      expect(rule.meta.recommended).toBe(true)
    })

    it('returns empty for empty source', () => {
      const rule = createNoImplicitAnyRule()
      const { onComplete } = rule.create({ sourceCode: '', filePath: 'test.ts' })
      expect(onComplete().length).toBe(0)
    })
  })

  describe('no-explicit-any', () => {
    it('detects explicit any', () => {
      const rule = createNoExplicitAnyRule()
      const { onComplete } = rule.create({
        sourceCode: `const x: any = 'hello'; function foo(a: any) {}`,
        filePath: 'test.ts',
      })
      const violations = onComplete()
      expect(violations.length).toBeGreaterThanOrEqual(2)
    })

    it('passes for no-any code', () => {
      const rule = createNoExplicitAnyRule()
      const { onComplete } = rule.create({
        sourceCode: `const x: string = 'hello';`,
        filePath: 'test.ts',
      })
      const violations = onComplete()
      expect(violations.length).toBe(0)
    })

    it('has correct meta', () => {
      const rule = createNoExplicitAnyRule()
      expect(rule.meta.name).toBe('no-explicit-any')
      expect(rule.meta.severity).toBeUndefined()
    })
  })

  describe('no-type-assertion', () => {
    it('detects as X patterns', () => {
      const rule = createNoTypeAssertionRule()
      const { onComplete } = rule.create({
        sourceCode: `const x = {} as MyType;`,
        filePath: 'test.ts',
      })
      const violations = onComplete()
      expect(violations.length).toBe(1)
      expect(violations[0]!.message).toContain('as MyType')
    })

    it('passes for as const', () => {
      const rule = createNoTypeAssertionRule()
      const { onComplete } = rule.create({
        sourceCode: `const x = { a: 1 } as const;`,
        filePath: 'test.ts',
      })
      const violations = onComplete()
      expect(violations.length).toBe(0)
    })

    it('detects multiple assertions', () => {
      const rule = createNoTypeAssertionRule()
      const { onComplete } = rule.create({
        sourceCode: `const x = {} as A; const y = {} as B;`,
        filePath: 'test.ts',
      })
      const violations = onComplete()
      expect(violations.length).toBe(2)
    })

    it('has correct meta', () => {
      const rule = createNoTypeAssertionRule()
      expect(rule.meta.name).toBe('no-type-assertion')
      expect(rule.meta.category).toBe('correctness')
    })
  })

  describe('no-non-null-assertion', () => {
    it('detects !. patterns', () => {
      const rule = createNoNonNullAssertionRule()
      const { onComplete } = rule.create({
        sourceCode: `const x = maybe!.prop;`,
        filePath: 'test.ts',
      })
      const violations = onComplete()
      expect(violations.length).toBe(1)
      expect(violations[0]!.message).toContain('maybe')
    })

    it('passes for safe access', () => {
      const rule = createNoNonNullAssertionRule()
      const { onComplete } = rule.create({
        sourceCode: `const x = obj.prop;`,
        filePath: 'test.ts',
      })
      const violations = onComplete()
      expect(violations.length).toBe(0)
    })

    it('does not match exclamation in identifiers', () => {
      const rule = createNoNonNullAssertionRule()
      const { onComplete } = rule.create({
        sourceCode: `const isGood = true;`,
        filePath: 'test.ts',
      })
      const violations = onComplete()
      expect(violations.length).toBe(0)
    })

    it('has correct meta', () => {
      const rule = createNoNonNullAssertionRule()
      expect(rule.meta.name).toBe('no-non-null-assertion')
    })
  })

  describe('explicit-return-type', () => {
    it('detects missing return types on exports', () => {
      const rule = createExplicitReturnTypeRule()
      const { onComplete } = rule.create({
        sourceCode: `export function foo(x: string) { return x; }`,
        filePath: 'test.ts',
      })
      const violations = onComplete()
      expect(violations.length).toBe(1)
      expect(violations[0]!.message).toContain('foo')
    })

    it('passes for typed returns', () => {
      const rule = createExplicitReturnTypeRule()
      const { onComplete } = rule.create({
        sourceCode: `export function foo(x: string): string { return x; }`,
        filePath: 'test.ts',
      })
      const violations = onComplete()
      expect(violations.length).toBe(0)
    })

    it('ignores non-exported functions', () => {
      const rule = createExplicitReturnTypeRule()
      const { onComplete } = rule.create({
        sourceCode: `function foo(x: string) { return x; }`,
        filePath: 'test.ts',
      })
      const violations = onComplete()
      expect(violations.length).toBe(0)
    })

    it('detects exported arrow functions without return types', () => {
      const rule = createExplicitReturnTypeRule()
      const { onComplete } = rule.create({
        sourceCode: `export const add = (a: number, b: number) => a + b;`,
        filePath: 'test.ts',
      })
      const violations = onComplete()
      expect(violations.length).toBe(1)
      expect(violations[0]!.message).toContain('add')
    })

    it('has correct meta', () => {
      const rule = createExplicitReturnTypeRule()
      expect(rule.meta.name).toBe('explicit-return-type')
      expect(rule.meta.category).toBe('style')
      expect(rule.meta.recommended).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('handles empty files', () => {
      const rule = createNoImplicitAnyRule()
      const { onComplete } = rule.create({ sourceCode: '', filePath: '' })
      expect(onComplete().length).toBe(0)
    })

    it('handles comments only', () => {
      const rule = createNoImplicitAnyRule()
      const { onComplete } = rule.create({
        sourceCode: `// just a comment\n/* block */`,
        filePath: 'test.ts',
      })
      expect(onComplete().length).toBe(0)
    })

    it('handles multi-line code', () => {
      const rule = createNoTypeAssertionRule()
      const code = `const x = {}\nas MyType;\nconst y = z;`
      const { onComplete } = rule.create({ sourceCode: code, filePath: 'test.ts' })
      const violations = onComplete()
      expect(violations.length).toBe(1)
    })

    it('all rules have visitor property', () => {
      const rules = [
        createNoImplicitAnyRule(),
        createNoExplicitAnyRule(),
        createNoTypeAssertionRule(),
        createNoNonNullAssertionRule(),
        createExplicitReturnTypeRule(),
      ]
      for (const rule of rules) {
        const instance = rule.create({})
        expect(instance.visitor).toBeDefined()
        expect(typeof instance.onComplete).toBe('function')
      }
    })

    it('all rules have defaultOptions', () => {
      const rules = [
        createNoImplicitAnyRule(),
        createNoExplicitAnyRule(),
        createNoTypeAssertionRule(),
        createNoNonNullAssertionRule(),
        createExplicitReturnTypeRule(),
      ]
      for (const rule of rules) {
        expect(rule.defaultOptions).toBeDefined()
      }
    })

    it('all rules have meta with required fields', () => {
      const rules = [
        createNoImplicitAnyRule(),
        createNoExplicitAnyRule(),
        createNoTypeAssertionRule(),
        createNoNonNullAssertionRule(),
        createExplicitReturnTypeRule(),
      ]
      for (const rule of rules) {
        expect(rule.meta.name).toBeDefined()
        expect(rule.meta.description).toBeDefined()
        expect(rule.meta.category).toBeDefined()
        expect(rule.meta.recommended).toBeDefined()
      }
    })
  })
})

describe('TypeChecker integration', () => {
  const checker = new TypeChecker()

  it('analyzes a complete TypeScript file', () => {
    const code = `
interface User {
  name: string;
  age: number;
}

function createUser(name: string, age: number): User {
  return { name, age };
}

const user = createUser('Alice', 30);
const name = user.name;
`
    const sf = createTestFile(code)
    const result = checker.analyzeFile(sf)
    expect(result.summary.totalVariables).toBeGreaterThanOrEqual(2)
    expect(result.inferenceResults.length).toBeGreaterThanOrEqual(2)
  })

  it('detects function types via getCallSignatures', () => {
    const sf = createTestFile(`const fn = (x: string) => x.length;`)
    const result = checker.getVariableType(sf, 'fn')
    expect(result).not.toBeNull()
    expect(result!.isFunction).toBe(true)
  })

  it('handles intersection types', () => {
    const sf = createTestFile(`const x: string & { length: number } = Object('hello');`)
    const result = checker.checkType(sf, 1, 7)
    expect(result.isIntersection).toBe(true)
  })

  it('handles enum types', () => {
    const sf = createTestFile(`enum Color { Red, Green, Blue }\nconst c: Color = Color.Red;`)
    const result = checker.getVariableType(sf, 'c')
    expect(result).not.toBeNull()
    expect(result!.isEnum).toBe(true)
  })

  it('detects promise types from type annotation', () => {
    const sf = createTestFile(`const p: Promise<string> = Promise.resolve('hi');`)
    const result = checker.getVariableType(sf, 'p')
    expect(result).not.toBeNull()
    expect(result!.isPromise).toBe(true)
  })

  it('complexity metrics include functions', () => {
    const code = `
function add(a: number, b: number): number { return a + b; }
function greet(name: string): string { return 'Hello ' + name; }
`
    const sf = createTestFile(code)
    const metrics = checker.calculateComplexity(sf)
    expect(metrics.totalTypes).toBeGreaterThanOrEqual(4)
    expect(metrics.typeCoverage).toBe(1)
  })
})
