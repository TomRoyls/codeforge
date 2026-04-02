/**
 * @fileoverview Tests for prefer-regex-literal rule
 */

import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import {
  analyzePreferRegexLiteral,
  preferRegexLiteralRule,
} from '../../../../src/rules/best-practices/prefer-regex-literal.js'

const createSourceFile = (code) => {
  const project = new Project({ useInMemoryFileSystem: true })
  return project.createSourceFile('test.ts', code, { overwrite: true })
}

describe('rule metadata', () => {
  it('should have correct meta properties', () => {
    expect(preferRegexLiteralRule.meta.name).toBe('prefer-regex-literal')
    expect(preferRegexLiteralRule.meta.category).toBe('style')
  })
})

describe('detecting new RegExp()', () => {
  it('should detect new RegExp() with static pattern', () => {
        const sourceFile = createSourceFile('const x = new RegExp(/test/)')
        const violations = analyzePreferRegexLiteral(sourceFile)
        expect(violations).toHaveLength(1)
        expect(violations[0].message).toContain('regex literal')
    })

    it('should detect new RegExp() with flags', () => {
        const sourceFile = createSourceFile('const x = new RegExp("test", "i")')
        const violations = analyzePreferRegexLiteral(sourceFile)
        expect(violations).toHaveLength(1)
        expect(violations[0].suggestion).toContain('/test/i')
    })

    it('should not flag new RegExp() with dynamic pattern', () => {
        const sourceFile = createSourceFile('const x = new RegExp(test, flags)')
        const violations = analyzePreferRegexLiteral(sourceFile)
        expect(violations).toHaveLength(0)
    })

        it('should not flag new RegExp() with complex pattern', () => {
        const sourceFile = createSourceFile('const x = new RegExp("[a-z]+",i")
        const violations = analyzePreferRegexLiteral(sourceFile)
        expect(violations).toHaveLength(0)
    })

    it('should not flag regex literal', () => {
        const sourceFile = createSourceFile('const x = /test/i/)
        const violations = analyzePreferRegexLiteral(sourceFile)
        expect(violations).toHaveLength(0)
    })
})
