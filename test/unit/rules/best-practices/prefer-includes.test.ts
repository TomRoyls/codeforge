/**
 * @fileoverview Tests for prefer-includes rule
 */

import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import {
  analyzePreferIncludes,
  preferIncludesRule,
} from '../../../../src/rules/best-practices/prefer-includes.js'

const createSourceFile = (code) => {
  const project = new Project({ useInMemoryFileSystem: true })
  return project.createSourceFile('test.ts', code)
}

describe('rule metadata', () => {
  it('should have correct meta properties', () => {
    expect(preferIncludesRule.meta.name).toBe('prefer-includes')
    expect(preferIncludesRule.meta.category).toBe('style')
    expect(preferIncludesRule.meta.fixable).toBe('code')
  })
})

describe('detecting .indexOf() !== -1', () => {
    it('should detect .indexOf() !== -1', () => {
        const sourceFile = createSourceFile('const x = arr.indexOf(1) !== -1;')
        const violations = analyzePreferIncludes(sourceFile)
        expect(violations).toHaveLength(1)
        expect(violations[0].message).toContain('.includes()')
    })
})

describe('valid code', () => {
    it('should not flag .includes()', () => {
        const sourceFile = createSourceFile('const x = arr.includes(1);')
        const violations = analyzePreferIncludes(sourceFile)
        expect(violations).toHaveLength(0)
    })

    it('should not flag .indexOf() === 0', () => {
        const sourceFile = createSourceFile('const x = arr.indexOf(y) === 0;')
        const violations = analyzePreferIncludes(sourceFile)
        expect(violations).toHaveLength(0)
    })
})
