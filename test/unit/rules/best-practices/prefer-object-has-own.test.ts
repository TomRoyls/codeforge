/**
 * @fileoverview Tests for prefer-object-has-own rule
 */

import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import {
  analyzePreferObjectHasOwn,
  preferObjectHasOwnRule,
} from '../../../../src/rules/best-practices/prefer-object-has-own.js'

const createSourceFile = (code) => {
  const project = new Project({ useInMemoryFileSystem: true })
  return project.createSourceFile('test.ts', code)
}

describe('rule metadata', () => {
  it('should have correct meta properties', () => {
    expect(preferObjectHasOwnRule.meta.name).toBe('prefer-object-has-own')
    expect(preferObjectHasOwnRule.meta.category).toBe('style')
    expect(preferObjectHasOwnRule.meta.fixable).toBe('code')
  })
})

describe('detecting Object.prototype.hasOwnProperty.call', () => {
  it('should detect Object.prototype.hasOwnProperty.call with string property', () => {
    const sourceFile = createSourceFile('const x = Object.prototype.hasOwnProperty.call(obj, "prop");')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('Object.hasOwn')
  })

  it('should detect Object.prototype.hasOwnProperty.call with variable property', () => {
    const sourceFile = createSourceFile('const x = Object.prototype.hasOwnProperty.call(obj, key);')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(1)
  })
})

describe('valid code', () => {
  it('should not flag Object.hasOwn', () => {
    const sourceFile = createSourceFile('const x = Object.hasOwn(obj, "prop");')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag custom hasOwnProperty', () => {
    const sourceFile = createSourceFile('const x = obj.hasOwnProperty("prop");')
    const violations = analyzePreferObjectHasOwn(sourceFile)
    expect(violations).toHaveLength(0)
  })
})
