/**
 * @fileoverview Tests for prefer-optional-chain rule
 */

import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import {
  analyzePreferOptionalChain,
  preferOptionalChainRule,
} from '../../../../src/rules/best-practices/prefer-optional-chain.js'

const createSourceFile = (code) => {
  const project = new Project({ useInMemoryFileSystem: true })
  return project.createSourceFile('test.ts', code)
}

describe('rule metadata', () => {
  it('should have correct meta properties', () => {
    expect(preferOptionalChainRule.meta.name).toBe('prefer-optional-chain')
    expect(preferOptionalChainRule.meta.category).toBe('style')
    expect(preferOptionalChainRule.meta.fixable).toBe('code')
  })
})

describe('detecting explicit null checks', () => {
    it('should detect obj && obj.foo && obj.foo.bar patterns', () => {
        const sourceFile = createSourceFile(`
const x = obj && obj.foo && obj.foo.bar;
`)
        const violations = analyzePreferOptionalChain(sourceFile)
        expect(violations).toHaveLength(1)
        expect(violations[0].message).toContain('optional chaining')
    })
})

describe('valid code', () => {
    it('should not flag optional chaining', () => {
        const sourceFile = createSourceFile(`
const x = obj?.foo?.bar?.baz;
`)
        const violations = analyzePreferOptionalChain(sourceFile)
        expect(violations).toHaveLength(0)
    })
})
