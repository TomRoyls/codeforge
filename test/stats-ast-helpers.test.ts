import { describe, it, expect } from 'vitest'
import { Project, type SourceFile, type BinaryExpression, SyntaxKind } from 'ts-morph'
import { isLogicalOperator, calculateFileComplexity, countCodeStructures } from '../src/commands/stats-ast-helpers.js'

// ─── isLogicalOperator ──────────────────────────────────
describe('isLogicalOperator', () => {
  function makeBinaryExpr(code: string): BinaryExpression {
    const project = new Project({ useInMemoryFileSystem: true })
    const sourceFile = project.createSourceFile('test.ts', `const x = ${code};`)
    return sourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.BinaryExpression) as BinaryExpression
  }

  it('returns true for && operator', () => {
    const expr = makeBinaryExpr('a && b')
    expect(isLogicalOperator(expr)).toBe(true)
  })

  it('returns true for || operator', () => {
    const expr = makeBinaryExpr('a || b')
    expect(isLogicalOperator(expr)).toBe(true)
  })

  it('returns false for + operator', () => {
    const expr = makeBinaryExpr('a + b')
    expect(isLogicalOperator(expr)).toBe(false)
  })

  it('returns false for === operator', () => {
    const expr = makeBinaryExpr('a === b')
    expect(isLogicalOperator(expr)).toBe(false)
  })

  it('returns false for < operator', () => {
    const expr = makeBinaryExpr('a < b')
    expect(isLogicalOperator(expr)).toBe(false)
  })
})

// ─── calculateFileComplexity ────────────────────────────
describe('calculateFileComplexity', () => {
  function makeSourceFile(code: string): SourceFile {
    const project = new Project({ useInMemoryFileSystem: true })
    return project.createSourceFile('test.ts', code)
  }

  it('returns 1 for empty file', () => {
    const sf = makeSourceFile('')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  it('counts if statements', () => {
    const sf = makeSourceFile('if (x) {} if (y) {}')
    expect(calculateFileComplexity(sf)).toBe(2)
  })

  it('counts for loops', () => {
    const sf = makeSourceFile('for (let i = 0; i < 10; i++) {}')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  it('counts while loops', () => {
    const sf = makeSourceFile('while (true) {}')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  it('counts do-while loops', () => {
    const sf = makeSourceFile('do {} while (true);')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  it('counts catch clauses', () => {
    const sf = makeSourceFile('try {} catch (e) {}')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  it('counts conditional expressions (ternary)', () => {
    const sf = makeSourceFile('const x = a ? 1 : 2;')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  it('counts case clauses in switch', () => {
    const sf = makeSourceFile('switch(x) { case 1: break; case 2: break; }')
    expect(calculateFileComplexity(sf)).toBe(2)
  })

  it('counts logical operators in conditions', () => {
    const sf = makeSourceFile('if (a && b || c) {}')
    expect(calculateFileComplexity(sf)).toBe(3)
  })

  it('counts for-of loops', () => {
    const sf = makeSourceFile('for (const x of arr) {}')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  it('counts for-in loops', () => {
    const sf = makeSourceFile('for (const k in obj) {}')
    expect(calculateFileComplexity(sf)).toBe(1)
  })
})

// ─── countCodeStructures ────────────────────────────────
describe('countCodeStructures', () => {
  function makeSourceFile(code: string): SourceFile {
    const project = new Project({ useInMemoryFileSystem: true })
    return project.createSourceFile('test.ts', code)
  }

  it('returns zeros for empty file', () => {
    const sf = makeSourceFile('')
    const result = countCodeStructures(sf)
    expect(result).toEqual({
      classes: 0,
      enums: 0,
      functions: 0,
      interfaces: 0,
      methods: 0,
      typeAliases: 0,
    })
  })

  it('counts function declarations', () => {
    const sf = makeSourceFile('function foo() {} function bar() {}')
    expect(countCodeStructures(sf).functions).toBe(2)
  })

  it('counts class declarations', () => {
    const sf = makeSourceFile('class A {} class B {}')
    expect(countCodeStructures(sf).classes).toBe(2)
  })

  it('counts interface declarations', () => {
    const sf = makeSourceFile('interface Foo {} interface Bar {}')
    expect(countCodeStructures(sf).interfaces).toBe(2)
  })

  it('counts type alias declarations', () => {
    const sf = makeSourceFile('type A = string; type B = number;')
    expect(countCodeStructures(sf).typeAliases).toBe(2)
  })

  it('counts enum declarations', () => {
    const sf = makeSourceFile('enum Color { Red, Green } enum Size { S, M }')
    expect(countCodeStructures(sf).enums).toBe(2)
  })

  it('counts methods and constructors in classes', () => {
    const sf = makeSourceFile('class Foo { constructor() {} method1() {} method2() {} }')
    const result = countCodeStructures(sf)
    expect(result.classes).toBe(1)
    expect(result.methods).toBe(3)
  })
})
