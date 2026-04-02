/**
 * @fileoverview Tests for prefer-object-spread rule
 */

import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import {
  analyzePreferObjectSpread,
  preferObjectSpreadRule,
} from '../../../../src/rules/best-practices/prefer-object-spread.js'

const createSourceFile = (code: string) => {
  const project = new Project({ useInMemoryFileSystem: true })
  return project.createSourceFile('test.ts', code)
}

describe('rule metadata', () => {
  it('should have correct meta properties', () => {
    expect(preferObjectSpreadRule.meta.name).toBe('prefer-object-spread')
    expect(preferObjectSpreadRule.meta.category).toBe('style')
    expect(preferObjectSpreadRule.meta.fixable).toBe('code')
  })
})

describe('detecting Object.assign({}, ...)', () => {
  it('should detect Object.assign({}, a, b)', () => {
    const sourceFile = createSourceFile('const result = Object.assign({}, a, b)')
    const violations = analyzePreferObjectSpread(sourceFile)
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('object spread')
  })

  it('should detect Object.assign({}, obj)', () => {
    const sourceFile = createSourceFile('const copy = Object.assign({}, obj)')
    const violations = analyzePreferObjectSpread(sourceFile)
    expect(violations).toHaveLength(1)
    expect(violations[0].ruleId).toBe('prefer-object-spread')
  })

  it('should detect Object.assign({}, a, b, c) with multiple sources', () => {
    const sourceFile = createSourceFile('const merged = Object.assign({}, defaults, options, overrides)')
    const violations = analyzePreferObjectSpread(sourceFile)
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('defaults, options, overrides')
  })

  it('should provide fix suggestion', () => {
    const sourceFile = createSourceFile('const result = Object.assign({}, a, b)')
    const violations = analyzePreferObjectSpread(sourceFile)
    expect(violations[0].suggestion).toBeDefined()
    expect(violations[0].suggestion).toContain('...a, ...b')
  })
})

describe('valid cases', () => {
  it('should not flag object spread syntax', () => {
    const sourceFile = createSourceFile('const result = { ...a, ...b }')
    const violations = analyzePreferObjectSpread(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag Object.assign with non-empty target', () => {
    const sourceFile = createSourceFile('Object.assign({ foo: 1 }, obj)')
    const violations = analyzePreferObjectSpread(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag Object.assign that mutates first argument', () => {
    const sourceFile = createSourceFile('Object.assign(target, source)')
    const violations = analyzePreferObjectSpread(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag Object.assign with single argument', () => {
    const sourceFile = createSourceFile('Object.assign(obj)')
    const violations = analyzePreferObjectSpread(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag Object.assign with identifier target', () => {
    const sourceFile = createSourceFile('const result = Object.assign(target, source)')
    const violations = analyzePreferObjectSpread(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag other Object methods', () => {
    const sourceFile = createSourceFile('Object.keys(obj); Object.values(obj); Object.entries(obj)')
    const violations = analyzePreferObjectSpread(sourceFile)
    expect(violations).toHaveLength(0)
  })
})
