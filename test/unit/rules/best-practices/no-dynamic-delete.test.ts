/**
 * @fileoverview Tests for no-dynamic-delete rule
 */

import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import {
  analyzeNoDynamicDelete,
  noDynamicDeleteRule,
} from '../../../../src/rules/best-practices/no-dynamic-delete.js'

const createSourceFile = (code: string) => {
  const project = new Project({ useInMemoryFileSystem: true })
  return project.createSourceFile('test.ts', code)
}

describe('rule metadata', () => {
  it('should have correct meta properties', () => {
    expect(noDynamicDeleteRule.meta.name).toBe('no-dynamic-delete')
    expect(noDynamicDeleteRule.meta.category).toBe('correctness')
    expect(noDynamicDeleteRule.meta.fixable).toBe('code')
  })
})

describe('detecting dynamic delete', () => {
  it('should detect delete on variable', () => {
    const sourceFile = createSourceFile('let x = 1; delete x;')
    const violations = analyzeNoDynamicDelete(sourceFile)
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('variables')
  })

  it('should detect delete on computed property access', () => {
    const sourceFile = createSourceFile('const key = "foo"; delete obj[key];')
    const violations = analyzeNoDynamicDelete(sourceFile)
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('computed properties')
  })

  it('should detect delete with expression as key', () => {
    const sourceFile = createSourceFile('delete obj[getKey()];')
    const violations = analyzeNoDynamicDelete(sourceFile)
    expect(violations).toHaveLength(1)
    expect(violations[0].ruleId).toBe('no-dynamic-delete')
  })

  it('should provide suggestion for variable delete', () => {
    const sourceFile = createSourceFile('let x = 1; delete x;')
    const violations = analyzeNoDynamicDelete(sourceFile)
    expect(violations[0].suggestion).toBeDefined()
    expect(violations[0].suggestion).toContain('undefined')
  })

  it('should provide suggestion for computed property delete', () => {
    const sourceFile = createSourceFile('delete obj[dynamicKey];')
    const violations = analyzeNoDynamicDelete(sourceFile)
    expect(violations[0].suggestion).toBeDefined()
    expect(violations[0].suggestion).toContain('Map')
  })
})

describe('valid cases', () => {
  it('should allow delete on static property access', () => {
    const sourceFile = createSourceFile('delete obj.property;')
    const violations = analyzeNoDynamicDelete(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should allow delete on string literal key', () => {
    const sourceFile = createSourceFile('delete obj["key"];')
    const violations = analyzeNoDynamicDelete(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should allow delete on numeric literal key', () => {
    const sourceFile = createSourceFile('delete arr[0];')
    const violations = analyzeNoDynamicDelete(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should allow delete on nested property', () => {
    const sourceFile = createSourceFile('delete obj.nested.property;')
    const violations = analyzeNoDynamicDelete(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should allow delete with parentheses around static property', () => {
    const sourceFile = createSourceFile('delete (obj.property);')
    const violations = analyzeNoDynamicDelete(sourceFile)
    expect(violations).toHaveLength(0)
  })
})
