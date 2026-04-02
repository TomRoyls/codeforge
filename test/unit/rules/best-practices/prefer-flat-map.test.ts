/**
 * @fileoverview Tests for prefer-flat-map rule
 */

import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import {
  analyzePreferFlatMap,
  preferFlatMapRule,
} from '../../../../src/rules/best-practices/prefer-flat-map.js'

const createSourceFile = (code) => {
  const project = new Project({ useInMemoryFileSystem: true })
  return project.createSourceFile('test.ts', code)
}

describe('rule metadata', () => {
  it('should have correct meta properties', () => {
    expect(preferFlatMapRule.meta.name).toBe('prefer-flat-map')
    expect(preferFlatMapRule.meta.category).toBe('style')
    expect(preferFlatMapRule.meta.fixable).toBe('code')
  })
})

describe('detecting reduce with concat', () => {
    it('should detect reduce with concat pattern', () => {
        const code = `const arr = [[1, 2, 3].reduce((acc, val) => {
    return acc.concat(val)
  }, [])`
        const sourceFile = createSourceFile(code)
        const violations = analyzePreferFlatMap(sourceFile)
        expect(violations).toHaveLength(1)
        expect(violations[0].message).toContain('.flat()')
    })
})

describe('valid code', () => {
    it('should not flag simple flat', () => {
        const code = `const arr = [[1, 2, 3].flat()`
        const sourceFile = createSourceFile(code)
        const violations = analyzePreferFlatMap(sourceFile)
        expect(violations).toHaveLength(0)
    })

    it('should not flag map operations', () => {
        const code = `const arr = [[1, 2, 3].map(x => x * 2)`
        const sourceFile = createSourceFile(code)
        const violations = analyzePreferFlatMap(sourceFile)
        expect(violations).toHaveLength(0)
    })
})
