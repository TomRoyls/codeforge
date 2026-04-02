/**
 * @fileoverview Tests for prefer-for-of rule
 */

import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import {
  analyzePreferForOf,
  preferForOfRule,
} from '../../../../src/rules/best-practices/prefer-for-of.js'

const createSourceFile = (code: string) => {
  const project = new Project({ useInMemoryFileSystem: true })
  return project.createSourceFile('test.ts', code)
}

describe('rule metadata', () => {
  it('should have correct meta properties', () => {
    expect(preferForOfRule.meta.name).toBe('prefer-for-of')
    expect(preferForOfRule.meta.category).toBe('style')
    expect(preferForOfRule.meta.fixable).toBe('code')
  })
})

describe('detecting indexed for loops', () => {
  it('should detect for (let i = 0; i < arr.length; i++)', () => {
    const sourceFile = createSourceFile(`
      for (let i = 0; i < arr.length; i++) {
        console.log(arr[i]);
      }
    `)
    const violations = analyzePreferForOf(sourceFile)
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('for-of')
  })

  it('should detect with ++i increment', () => {
    const sourceFile = createSourceFile(`
      for (let i = 0; i < items.length; ++i) {
        process(items[i]);
      }
    `)
    const violations = analyzePreferForOf(sourceFile)
    expect(violations).toHaveLength(1)
    expect(violations[0].ruleId).toBe('prefer-for-of')
  })

  it('should detect with i += 1 increment', () => {
    const sourceFile = createSourceFile(`
      for (let i = 0; i < data.length; i += 1) {
        use(data[i]);
      }
    `)
    const violations = analyzePreferForOf(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should provide suggestion', () => {
    const sourceFile = createSourceFile(`
      for (let i = 0; i < arr.length; i++) {
        console.log(arr[i]);
      }
    `)
    const violations = analyzePreferForOf(sourceFile)
    expect(violations[0].suggestion).toBeDefined()
    expect(violations[0].suggestion).toContain('for (const item of arr)')
  })
})

describe('valid cases', () => {
  it('should not flag for-of loops', () => {
    const sourceFile = createSourceFile(`
      for (const item of arr) {
        console.log(item);
      }
    `)
    const violations = analyzePreferForOf(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag for-in loops', () => {
    const sourceFile = createSourceFile(`
      for (const key in obj) {
        console.log(key);
      }
    `)
    const violations = analyzePreferForOf(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag for loops starting from non-zero', () => {
    const sourceFile = createSourceFile(`
      for (let i = 1; i < arr.length; i++) {
        console.log(arr[i]);
      }
    `)
    const violations = analyzePreferForOf(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag for loops using index for other purposes', () => {
    const sourceFile = createSourceFile(`
      for (let i = 0; i < arr.length; i++) {
        console.log(i, arr[i]);
      }
    `)
    const violations = analyzePreferForOf(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag for loops writing to array', () => {
    const sourceFile = createSourceFile(`
      for (let i = 0; i < arr.length; i++) {
        arr[i] = compute(i);
      }
    `)
    const violations = analyzePreferForOf(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag while loops', () => {
    const sourceFile = createSourceFile(`
      let i = 0;
      while (i < arr.length) {
        console.log(arr[i]);
        i++;
      }
    `)
    const violations = analyzePreferForOf(sourceFile)
    expect(violations).toHaveLength(0)
  })
})
