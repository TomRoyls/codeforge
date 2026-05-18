import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import type { RuleViolation } from '../../src/ast/visitor.js'

import { createFixContext } from '../../src/fix/context.js'

// ─── Helpers ───

function createTestSourceFile(code: string, fileName = 'test.ts') {
  const project = new Project({ useInMemoryFileSystem: true })
  return project.createSourceFile(fileName, code)
}

function createViolation(overrides: Partial<RuleViolation> = {}): RuleViolation {
  return {
    ruleId: 'test-rule',
    message: 'test violation',
    severity: 'error',
    filePath: 'test.ts',
    range: {
      start: { line: 1, column: 1 },
      end: { line: 1, column: 5 },
    },
    ...overrides,
  }
}

// ─── createFixContext — Return Value Shape ───

describe('createFixContext', () => {
  it('returns an object with sourceFile property', () => {
    const sf = createTestSourceFile('const x = 1;')
    const violation = createViolation()
    const ctx = createFixContext(sf, violation)
    expect(ctx.sourceFile).toBe(sf)
  })

  it('returns an object with violation property', () => {
    const sf = createTestSourceFile('const x = 1;')
    const violation = createViolation()
    const ctx = createFixContext(sf, violation)
    expect(ctx.violation).toBe(violation)
  })

  it('returns an object with getNodeByPosition function', () => {
    const sf = createTestSourceFile('const x = 1;')
    const ctx = createFixContext(sf, createViolation())
    expect(typeof ctx.getNodeByPosition).toBe('function')
  })

  it('returns an object with getNodeByRange function', () => {
    const sf = createTestSourceFile('const x = 1;')
    const ctx = createFixContext(sf, createViolation())
    expect(typeof ctx.getNodeByRange).toBe('function')
  })

  it('preserves the exact violation passed in', () => {
    const sf = createTestSourceFile('const x = 1;')
    const violation = createViolation({ ruleId: 'custom-rule', message: 'specific message' })
    const ctx = createFixContext(sf, violation)
    expect(ctx.violation.ruleId).toBe('custom-rule')
    expect(ctx.violation.message).toBe('specific message')
  })
})

// ─── getNodeByPosition ───

describe('getNodeByPosition', () => {
  it('finds a node at the start of a variable declaration', () => {
    const sf = createTestSourceFile('const x = 1;')
    // "const" starts at position 0
    const ctx = createFixContext(sf, createViolation())
    const node = ctx.getNodeByPosition(0)
    expect(node).toBeDefined()
    expect(node!.getText()).toContain('const x = 1')
  })

  it('finds a node inside an identifier', () => {
    const sf = createTestSourceFile('const x = 1;')
    // "x" is at position 6 (after "const ")
    const ctx = createFixContext(sf, createViolation())
    const node = ctx.getNodeByPosition(6)
    expect(node).toBeDefined()
    expect(node!.getText()).toBe('x')
  })

  it('finds the deepest node at the given position', () => {
    const sf = createTestSourceFile('const x = 1;')
    const ctx = createFixContext(sf, createViolation())
    // Position 8 is inside "= 1"
    const node = ctx.getNodeByPosition(8)
    expect(node).toBeDefined()
  })

  it('finds a node in a multi-line file on the second line', () => {
    const sf = createTestSourceFile('const x = 1;\nconst y = 2;')
    const ctx = createFixContext(sf, createViolation())
    // "const y" starts at position 13 (after \n)
    const node = ctx.getNodeByPosition(13)
    expect(node).toBeDefined()
    expect(node!.getText()).toContain('const y = 2')
  })

  it('returns undefined for position beyond file length', () => {
    const sf = createTestSourceFile('const x = 1;')
    const ctx = createFixContext(sf, createViolation())
    const node = ctx.getNodeByPosition(9999)
    expect(node).toBeUndefined()
  })

  it('finds nodes in function declarations', () => {
    const sf = createTestSourceFile('function hello() { return 1; }')
    const ctx = createFixContext(sf, createViolation())
    const node = ctx.getNodeByPosition(0)
    expect(node).toBeDefined()
  })

  it('finds a numeric literal node', () => {
    const sf = createTestSourceFile('const x = 42;')
    const ctx = createFixContext(sf, createViolation())
    // "42" starts at position 10
    const node = ctx.getNodeByPosition(10)
    expect(node).toBeDefined()
  })

  it('finds nodes inside a string literal', () => {
    const sf = createTestSourceFile('const x = "hello";')
    const ctx = createFixContext(sf, createViolation())
    // Inside "hello" — position 11
    const node = ctx.getNodeByPosition(11)
    expect(node).toBeDefined()
  })

  it('finds nodes in an object literal', () => {
    const sf = createTestSourceFile('const obj = { a: 1 };')
    const ctx = createFixContext(sf, createViolation())
    const node = ctx.getNodeByPosition(13)
    expect(node).toBeDefined()
  })

  it('finds nodes in an array literal', () => {
    const sf = createTestSourceFile('const arr = [1, 2, 3];')
    const ctx = createFixContext(sf, createViolation())
    const node = ctx.getNodeByPosition(12)
    expect(node).toBeDefined()
  })

  it('finds nodes in a class declaration', () => {
    const sf = createTestSourceFile('class Foo { bar() { return 1; } }')
    const ctx = createFixContext(sf, createViolation())
    const node = ctx.getNodeByPosition(0)
    expect(node).toBeDefined()
  })

  it('finds nodes in nested expressions', () => {
    const sf = createTestSourceFile('const x = (1 + 2) * 3;')
    const ctx = createFixContext(sf, createViolation())
    // Position inside "(1 + 2)"
    const node = ctx.getNodeByPosition(11)
    expect(node).toBeDefined()
  })
})

// ─── getNodeByRange ───

describe('getNodeByRange', () => {
  it('finds a node matching an exact range', () => {
    const sf = createTestSourceFile('const x = 1;')
    const ctx = createFixContext(sf, createViolation())
    // "x" identifier: line 1, col 7 to col 8
    const node = ctx.getNodeByRange({
      start: { line: 1, column: 7 },
      end: { line: 1, column: 8 },
    })
    expect(node).toBeDefined()
  })

  it('finds the full variable declaration by range', () => {
    const sf = createTestSourceFile('const x = 1;')
    const ctx = createFixContext(sf, createViolation())
    const node = ctx.getNodeByRange({
      start: { line: 1, column: 1 },
      end: { line: 1, column: 13 },
    })
    expect(node).toBeDefined()
  })

  it('finds a node on the second line by range', () => {
    const sf = createTestSourceFile('const x = 1;\nconst y = 2;')
    const ctx = createFixContext(sf, createViolation())
    const node = ctx.getNodeByRange({
      start: { line: 2, column: 7 },
      end: { line: 2, column: 8 },
    })
    expect(node).toBeDefined()
    expect(node!.getText()).toBe('y')
  })

  it('returns undefined when range does not match any node', () => {
    const sf = createTestSourceFile('const x = 1;')
    const ctx = createFixContext(sf, createViolation())
    const node = ctx.getNodeByRange({
      start: { line: 1, column: 1 },
      end: { line: 1, column: 2 },
    })
    expect(node).toBeUndefined()
  })

  it('finds a function declaration by range', () => {
    const sf = createTestSourceFile('function foo() {}')
    const ctx = createFixContext(sf, createViolation())
    const node = ctx.getNodeByRange({
      start: { line: 1, column: 1 },
      end: { line: 1, column: 18 },
    })
    expect(node).toBeDefined()
  })

  it('handles range spanning multiple lines', () => {
    const sf = createTestSourceFile('const x =\n  1;')
    const ctx = createFixContext(sf, createViolation())
    const node = ctx.getNodeByRange({
      start: { line: 1, column: 1 },
      end: { line: 2, column: 4 },
    })
    expect(node).toBeDefined()
  })

  it('finds a string literal by its exact range', () => {
    const sf = createTestSourceFile('const x = "hello";')
    const ctx = createFixContext(sf, createViolation())
    const node = ctx.getNodeByRange({
      start: { line: 1, column: 11 },
      end: { line: 1, column: 18 },
    })
    expect(node).toBeDefined()
  })

  it('finds nodes in template literals', () => {
    const sf = createTestSourceFile('const x = `hello world`;')
    const ctx = createFixContext(sf, createViolation())
    const node = ctx.getNodeByRange({
      start: { line: 1, column: 11 },
      end: { line: 1, column: 24 },
    })
    expect(node).toBeDefined()
  })

  it('finds the numeric literal 42 by range', () => {
    const sf = createTestSourceFile('const x = 42;')
    const ctx = createFixContext(sf, createViolation())
    const node = ctx.getNodeByRange({
      start: { line: 1, column: 11 },
      end: { line: 1, column: 13 },
    })
    expect(node).toBeDefined()
  })

  it('finds an empty block by range', () => {
    const sf = createTestSourceFile('function f() {}')
    const ctx = createFixContext(sf, createViolation())
    const node = ctx.getNodeByRange({
      start: { line: 1, column: 14 },
      end: { line: 1, column: 16 },
    })
    expect(node).toBeDefined()
  })
})
