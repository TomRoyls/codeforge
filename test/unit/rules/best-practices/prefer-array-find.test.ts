/**
 * @fileoverview Tests for prefer-array-find rule
 */

import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import {
  analyzePreferArrayFind,
  preferArrayFindRule,
} from '../../../../src/rules/best-practices/prefer-array-find.js'

const createSourceFile = (code) => {
  const project = new Project({ useInMemoryFileSystem: true })
  return project.createSourceFile('test.ts', code)
}

describe('rule metadata', () => {
  it('should have correct meta properties', () => {
    expect(preferArrayFindRule.meta.name).toBe('prefer-array-find')
    expect(preferArrayFindRule.meta.category).toBe('performance')
  })
})

describe('detecting .filter()[0]', () => {
  it('should detect .filter()[0]', () => {
    const sourceFile = createSourceFile('const x = arr.filter(n => n > 0)[0];')
    const violations = analyzePreferArrayFind(sourceFile)
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('.find()')
  })

  it('should detect .filter().shift()', () => {
    const sourceFile = createSourceFile('const x = arr.filter(n => n > 0).shift();')
    const violations = analyzePreferArrayFind(sourceFile)
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('.find()')
  })

  it('should provide correct suggestion for .filter()[0]', () => {
    const sourceFile = createSourceFile('const item = items.filter(x => x.active)[0];')
    const violations = analyzePreferArrayFind(sourceFile)
    expect(violations).toHaveLength(1)
    expect(violations[0].suggestion).toContain('.find(x => x.active)')
  })

  it('should handle complex filter callback', () => {
    const sourceFile = createSourceFile('const result = users.filter(u => u.age > 18 && u.active)[0];')
    const violations = analyzePreferArrayFind(sourceFile)
    expect(violations).toHaveLength(1)
    expect(violations[0].suggestion).toContain('.find(')
  })

  it('should handle filter with Boolean', () => {
    const sourceFile = createSourceFile('const item = arr.filter(Boolean)[0];')
    const violations = analyzePreferArrayFind(sourceFile)
    expect(violations).toHaveLength(1)
    expect(violations[0].suggestion).toContain('.find(Boolean)')
  })
})

describe('valid code', () => {
  it('should not flag .find()', () => {
    const sourceFile = createSourceFile('const x = arr.find(n => n > 0);')
    const violations = analyzePreferArrayFind(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag .filter() without index', () => {
    const sourceFile = createSourceFile('const x = arr.filter(n => n > 0);')
    const violations = analyzePreferArrayFind(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag .filter()[1]', () => {
    const sourceFile = createSourceFile('const x = arr.filter(n => n > 0)[1];')
    const violations = analyzePreferArrayFind(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag .filter() with variable index', () => {
    const sourceFile = createSourceFile('const idx = 0; const x = arr.filter(n => n > 0)[idx];')
    const violations = analyzePreferArrayFind(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag .filter() with expression index', () => {
    const sourceFile = createSourceFile('const x = arr.filter(n => n > 0)[idx + 1];')
    const violations = analyzePreferArrayFind(sourceFile)
    expect(violations).toHaveLength(0)
  })
})
