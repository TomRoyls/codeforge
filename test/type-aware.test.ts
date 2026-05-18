import { describe, expect, it } from 'vitest'

import { TypeChecker } from '../src/core/type-aware/type-checker.js'
import {
  createExplicitReturnTypeRule,
  createNoExplicitAnyRule,
  createNoImplicitAnyRule,
  createNoNonNullAssertionRule,
  createNoTypeAssertionRule,
} from '../src/core/type-aware/type-aware-rules.js'

// ─── TypeChecker compareTypes ───────────────────────────
describe('TypeChecker.compareTypes', () => {
  const checker = new TypeChecker()

  it('returns isIdentical for identical type strings', () => {
    const t = { typeString: 'string', typeName: 'String', isAny: false, isNull: false, isUndefined: false, isNullable: false, isString: true, isNumber: false, isBoolean: false, isArray: false, isObject: false, isFunction: false, isPromise: false, isEnum: false, isUnion: false, isIntersection: false, isLiteral: false, isGeneric: false } as const
    const result = checker.compareTypes(t, t)
    expect(result.isIdentical).toBe(true)
    expect(result.isAssignable).toBe(true)
  })

  it('assigns null to nullable', () => {
    const source = { typeString: 'null', typeName: 'null', isAny: false, isNull: true, isUndefined: false, isNullable: false, isString: false, isNumber: false, isBoolean: false, isArray: false, isObject: false, isFunction: false, isPromise: false, isEnum: false, isUnion: false, isIntersection: false, isLiteral: false, isGeneric: false } as const
    const target = { typeString: 'string | null', typeName: 'string', isAny: false, isNull: false, isUndefined: false, isNullable: true, isString: false, isNumber: false, isBoolean: false, isArray: false, isObject: false, isFunction: false, isPromise: false, isEnum: false, isUnion: true, isIntersection: false, isLiteral: false, isGeneric: false } as const
    const result = checker.compareTypes(source, target)
    expect(result.isAssignable).toBe(true)
  })

  it('assigns anything to any', () => {
    const source = { typeString: 'string', typeName: 'String', isAny: false, isNull: false, isUndefined: false, isNullable: false, isString: true, isNumber: false, isBoolean: false, isArray: false, isObject: false, isFunction: false, isPromise: false, isEnum: false, isUnion: false, isIntersection: false, isLiteral: false, isGeneric: false } as const
    const target = { typeString: 'any', typeName: 'any', isAny: true, isNull: false, isUndefined: false, isNullable: false, isString: false, isNumber: false, isBoolean: false, isArray: false, isObject: false, isFunction: false, isPromise: false, isEnum: false, isUnion: false, isIntersection: false, isLiteral: false, isGeneric: false } as const
    const result = checker.compareTypes(source, target)
    expect(result.isAssignable).toBe(true)
    expect(result.isSubtype).toBe(true)
  })

  it('assigns undefined to nullable', () => {
    const source = { typeString: 'undefined', typeName: 'undefined', isAny: false, isNull: false, isUndefined: true, isNullable: false, isString: false, isNumber: false, isBoolean: false, isArray: false, isObject: false, isFunction: false, isPromise: false, isEnum: false, isUnion: false, isIntersection: false, isLiteral: false, isGeneric: false } as const
    const target = { typeString: 'number | null', typeName: 'number', isAny: false, isNull: false, isUndefined: false, isNullable: true, isString: false, isNumber: false, isBoolean: false, isArray: false, isObject: false, isFunction: false, isPromise: false, isEnum: false, isUnion: true, isIntersection: false, isLiteral: false, isGeneric: false } as const
    const result = checker.compareTypes(source, target)
    expect(result.isAssignable).toBe(true)
  })

  it('same primitive names are assignable', () => {
    const source = { typeString: 'number', typeName: 'number', isAny: false, isNull: false, isUndefined: false, isNullable: false, isString: false, isNumber: true, isBoolean: false, isArray: false, isObject: false, isFunction: false, isPromise: false, isEnum: false, isUnion: false, isIntersection: false, isLiteral: false, isGeneric: false } as const
    const target = { typeString: 'number', typeName: 'number', isAny: false, isNull: false, isUndefined: false, isNullable: false, isString: false, isNumber: true, isBoolean: false, isArray: false, isObject: false, isFunction: false, isPromise: false, isEnum: false, isUnion: false, isIntersection: false, isLiteral: false, isGeneric: false } as const
    const result = checker.compareTypes(source, target)
    expect(result.isAssignable).toBe(true)
    expect(result.isIdentical).toBe(true)
  })

  it('different types are not assignable', () => {
    const source = { typeString: 'string', typeName: 'string', isAny: false, isNull: false, isUndefined: false, isNullable: false, isString: true, isNumber: false, isBoolean: false, isArray: false, isObject: false, isFunction: false, isPromise: false, isEnum: false, isUnion: false, isIntersection: false, isLiteral: false, isGeneric: false } as const
    const target = { typeString: 'number', typeName: 'number', isAny: false, isNull: false, isUndefined: false, isNullable: false, isString: false, isNumber: true, isBoolean: false, isArray: false, isObject: false, isFunction: false, isPromise: false, isEnum: false, isUnion: false, isIntersection: false, isLiteral: false, isGeneric: false } as const
    const result = checker.compareTypes(source, target)
    expect(result.isAssignable).toBe(false)
  })
})

// ─── TypeChecker isTypeSafe ──────────────────────────────
describe('TypeChecker.isTypeSafe', () => {
  const checker = new TypeChecker()

  it('returns false for any type', () => {
    const result = checker.isTypeSafe({ isAny: true, typeString: 'any', typeName: 'any', isNull: false, isUndefined: false, isNullable: false, isString: false, isNumber: false, isBoolean: false, isArray: false, isObject: false, isFunction: false, isPromise: false, isEnum: false, isUnion: false, isIntersection: false, isLiteral: false, isGeneric: false })
    expect(result).toBe(false)
  })

  it('returns false for unknown type string', () => {
    const result = checker.isTypeSafe({ isAny: false, typeString: 'unknown', typeName: 'unknown', isNull: false, isUndefined: false, isNullable: false, isString: false, isNumber: false, isBoolean: false, isArray: false, isObject: false, isFunction: false, isPromise: false, isEnum: false, isUnion: false, isIntersection: false, isLiteral: false, isGeneric: false })
    expect(result).toBe(false)
  })

  it('returns true for known safe type', () => {
    const result = checker.isTypeSafe({ isAny: false, typeString: 'string', typeName: 'string', isNull: false, isUndefined: false, isNullable: false, isString: true, isNumber: false, isBoolean: false, isArray: false, isObject: false, isFunction: false, isPromise: false, isEnum: false, isUnion: false, isIntersection: false, isLiteral: false, isGeneric: false })
    expect(result).toBe(true)
  })
})

// ─── createNoImplicitAnyRule ─────────────────────────────
describe('createNoImplicitAnyRule', () => {
  it('detects :any annotations', () => {
    const rule = createNoImplicitAnyRule()
    const instance = rule.create({ sourceCode: 'const x: any = 5', filePath: 'test.ts' })
    const violations = instance.onComplete?.() ?? []
    expect(violations.length).toBeGreaterThan(0)
    expect(violations[0]!.ruleId).toBe('no-implicit-any')
  })

  it('returns empty for clean code', () => {
    const rule = createNoImplicitAnyRule()
    const instance = rule.create({ sourceCode: 'const x: number = 5', filePath: 'test.ts' })
    const violations = instance.onComplete?.() ?? []
    expect(violations).toHaveLength(0)
  })

  it('returns empty for empty source', () => {
    const rule = createNoImplicitAnyRule()
    const instance = rule.create({ sourceCode: '', filePath: 'test.ts' })
    const violations = instance.onComplete?.() ?? []
    expect(violations).toHaveLength(0)
  })

  it('has correct meta', () => {
    const rule = createNoImplicitAnyRule()
    expect(rule.meta.name).toBe('no-implicit-any')
    expect(rule.meta.category).toBe('correctness')
  })
})

// ─── createNoExplicitAnyRule ─────────────────────────────
describe('createNoExplicitAnyRule', () => {
  it('detects explicit any', () => {
    const rule = createNoExplicitAnyRule()
    const instance = rule.create({ sourceCode: 'const x: any = 5', filePath: 'test.ts' })
    const violations = instance.onComplete?.() ?? []
    expect(violations.length).toBeGreaterThan(0)
    expect(violations[0]!.ruleId).toBe('no-explicit-any')
  })

  it('ignores clean code', () => {
    const rule = createNoExplicitAnyRule()
    const instance = rule.create({ sourceCode: 'const x: number = 5', filePath: 'test.ts' })
    const violations = instance.onComplete?.() ?? []
    expect(violations).toHaveLength(0)
  })
})

// ─── createNoTypeAssertionRule ───────────────────────────
describe('createNoTypeAssertionRule', () => {
  it('detects as assertions', () => {
    const rule = createNoTypeAssertionRule()
    const instance = rule.create({ sourceCode: 'const x = val as string', filePath: 'test.ts' })
    const violations = instance.onComplete?.() ?? []
    expect(violations.length).toBeGreaterThan(0)
    expect(violations[0]!.ruleId).toBe('no-type-assertion')
  })

  it('allows as const', () => {
    const rule = createNoTypeAssertionRule()
    const instance = rule.create({ sourceCode: 'const x = { a: 1 } as const', filePath: 'test.ts' })
    const violations = instance.onComplete?.() ?? []
    expect(violations).toHaveLength(0)
  })
})

// ─── createNoNonNullAssertionRule ────────────────────────
describe('createNoNonNullAssertionRule', () => {
  it('detects non-null assertions', () => {
    const rule = createNoNonNullAssertionRule()
    const instance = rule.create({ sourceCode: 'const x = val!', filePath: 'test.ts' })
    const violations = instance.onComplete?.() ?? []
    expect(violations.length).toBeGreaterThan(0)
    expect(violations[0]!.ruleId).toBe('no-non-null-assertion')
  })

  it('allows normal property access', () => {
    const rule = createNoNonNullAssertionRule()
    const instance = rule.create({ sourceCode: 'const x = obj.prop', filePath: 'test.ts' })
    const violations = instance.onComplete?.() ?? []
    expect(violations).toHaveLength(0)
  })
})

// ─── createExplicitReturnTypeRule ────────────────────────
describe('createExplicitReturnTypeRule', () => {
  it('detects exported functions without return type', () => {
    const rule = createExplicitReturnTypeRule()
    const instance = rule.create({ sourceCode: 'export function foo(x: number) { return x; }', filePath: 'test.ts' })
    const violations = instance.onComplete?.() ?? []
    expect(violations.length).toBeGreaterThan(0)
    expect(violations[0]!.ruleId).toBe('explicit-return-type')
  })

  it('allows non-exported functions', () => {
    const rule = createExplicitReturnTypeRule()
    const instance = rule.create({ sourceCode: 'function foo(x: number) { return x; }', filePath: 'test.ts' })
    const violations = instance.onComplete?.() ?? []
    expect(violations).toHaveLength(0)
  })
})
