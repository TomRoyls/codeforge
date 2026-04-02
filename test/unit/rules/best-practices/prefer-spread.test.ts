/**
 * @fileoverview Tests for prefer-spread rule
 */

import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import {
  analyzePreferSpread,
  preferSpreadRule,
} from '../../../../src/rules/best-practices/prefer-spread.js'

const createSourceFile = (code) => {
  const project = new Project({ useInMemoryFileSystem: true })
  return project.createSourceFile('test.ts', code)
}

describe('rule metadata', () => {
  it('should have correct meta properties', () => {
    expect(preferSpreadRule.meta.name).toBe('prefer-spread')
    expect(preferSpreadRule.meta.category).toBe('style')
  })
})

describe('detecting .concat()', () => {
  it('should detect arr.concat(other)', () => {
    const sourceFile = createSourceFile('const result = arr.concat(other);')
    const violations = analyzePreferSpread(sourceFile)
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('spread')
  })

  it('should detect arr.concat(a, b)', () => {
    const sourceFile = createSourceFile('const result = arr.concat(a, b);')
    const violations = analyzePreferSpread(sourceFile)
    expect(violations).toHaveLength(1)
    expect(violations[0].suggestion).toContain('...a')
    expect(violations[0].suggestion).toContain('...b')
  })

  it('should provide correct suggestion', () => {
    const sourceFile = createSourceFile('const result = [1, 2].concat([3, 4]);')
    const violations = analyzePreferSpread(sourceFile)
    expect(violations).toHaveLength(1)
    expect(violations[0].suggestion).toBe('Replace with: [[1, 2], ...[3, 4]]')
  })

  it('should handle chained concat', () => {
    const sourceFile = createSourceFile('const result = arr.concat(a).concat(b);')
    const violations = analyzePreferSpread(sourceFile)
    expect(violations).toHaveLength(2)
  })
})

describe('valid code', () => {
  it('should not flag arr.concat() with no arguments', () => {
    const sourceFile = createSourceFile('const copy = arr.concat();')
    const violations = analyzePreferSpread(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag spread operator usage', () => {
    const sourceFile = createSourceFile('const result = [...arr, ...other];')
    const violations = analyzePreferSpread(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag non-concat methods', () => {
    const sourceFile = createSourceFile('const result = arr.map(x => x * 2);')
    const violations = analyzePreferSpread(sourceFile)
    expect(violations).toHaveLength(0)
  })
})
