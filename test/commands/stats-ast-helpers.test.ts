import { describe, expect, it } from 'vitest'

import {
  isLogicalOperator,
  calculateFileComplexity,
  countCodeStructures,
} from '../../src/commands/stats-ast-helpers.js'

import { Project, SyntaxKind } from 'ts-morph'

// ─── isLogicalOperator ───

describe('isLogicalOperator', () => {
  const project = new Project({ useInMemoryFileSystem: true })

  it('returns true for && operator', () => {
    const sf = project.createSourceFile('amp.ts', 'const x = a && b;')
    const binExpr = sf.getFirstDescendantByKindOrThrow(SyntaxKind.BinaryExpression)
    expect(isLogicalOperator(binExpr)).toBe(true)
    project.removeSourceFile(sf)
  })

  it('returns true for || operator', () => {
    const sf = project.createSourceFile('pipe.ts', 'const x = a || b;')
    const binExpr = sf.getFirstDescendantByKindOrThrow(SyntaxKind.BinaryExpression)
    expect(isLogicalOperator(binExpr)).toBe(true)
    project.removeSourceFile(sf)
  })

  it('returns false for + operator', () => {
    const sf = project.createSourceFile('plus.ts', 'const x = a + b;')
    const binExpr = sf.getFirstDescendantByKindOrThrow(SyntaxKind.BinaryExpression)
    expect(isLogicalOperator(binExpr)).toBe(false)
    project.removeSourceFile(sf)
  })

  it('returns false for === operator', () => {
    const sf = project.createSourceFile('eq.ts', 'const x = a === b;')
    const binExpr = sf.getFirstDescendantByKindOrThrow(SyntaxKind.BinaryExpression)
    expect(isLogicalOperator(binExpr)).toBe(false)
    project.removeSourceFile(sf)
  })

  it('returns false for < operator', () => {
    const sf = project.createSourceFile('lt.ts', 'const x = a < b;')
    const binExpr = sf.getFirstDescendantByKindOrThrow(SyntaxKind.BinaryExpression)
    expect(isLogicalOperator(binExpr)).toBe(false)
    project.removeSourceFile(sf)
  })
})

// ─── calculateFileComplexity ───

describe('calculateFileComplexity', () => {
  const project = new Project({ useInMemoryFileSystem: true })

  it('returns 1 for an empty file (minimum)', () => {
    const sf = project.createSourceFile('empty.ts', '')
    expect(calculateFileComplexity(sf)).toBe(1)
    project.removeSourceFile(sf)
  })

  it('returns 1 for a single if statement', () => {
    const sf = project.createSourceFile('if.ts', 'if (x) { y; }')
    expect(calculateFileComplexity(sf)).toBe(1)
    project.removeSourceFile(sf)
  })

  it('counts nested if statements independently', () => {
    const sf = project.createSourceFile('nested.ts', 'if (a) { if (b) { c; } }')
    expect(calculateFileComplexity(sf)).toBe(2)
    project.removeSourceFile(sf)
  })

  it('adds 1 for a for loop', () => {
    const sf = project.createSourceFile('for.ts', 'for (let i = 0; i < 10; i++) { }')
    expect(calculateFileComplexity(sf)).toBe(1)
    project.removeSourceFile(sf)
  })

  it('adds 1 for a while loop', () => {
    const sf = project.createSourceFile('while.ts', 'while (x) { break; }')
    expect(calculateFileComplexity(sf)).toBe(1)
    project.removeSourceFile(sf)
  })

  it('adds 1 for a do-while loop', () => {
    const sf = project.createSourceFile('dowhile.ts', 'do { x; } while (y);')
    expect(calculateFileComplexity(sf)).toBe(1)
    project.removeSourceFile(sf)
  })

  it('adds 1 for a catch clause', () => {
    const sf = project.createSourceFile('catch.ts', 'try { } catch (e) { }')
    expect(calculateFileComplexity(sf)).toBe(1)
    project.removeSourceFile(sf)
  })

  it('adds 1 for a conditional expression (ternary)', () => {
    const sf = project.createSourceFile('ternary.ts', 'const x = a ? b : c;')
    expect(calculateFileComplexity(sf)).toBe(1)
    project.removeSourceFile(sf)
  })

  it('adds 1 per case clause in a switch', () => {
    const sf = project.createSourceFile(
      'switch.ts',
      'switch (x) { case 1: break; case 2: break; default: break; }',
    )
    expect(calculateFileComplexity(sf)).toBe(2)
    project.removeSourceFile(sf)
  })

  it('adds 1 for binary expression with &&', () => {
    const sf = project.createSourceFile('and.ts', 'const x = a && b;')
    expect(calculateFileComplexity(sf)).toBe(1)
    project.removeSourceFile(sf)
  })

  it('adds 1 for binary expression with ||', () => {
    const sf = project.createSourceFile('or.ts', 'const x = a || b;')
    expect(calculateFileComplexity(sf)).toBe(1)
    project.removeSourceFile(sf)
  })

  it('counts complex code with multiple constructs', () => {
    const sf = project.createSourceFile(
      'complex.ts',
      'if (a && b) { for (let i = 0; i < 10; i++) { if (c || d) { } } }',
    )
    expect(calculateFileComplexity(sf)).toBe(5)
    project.removeSourceFile(sf)
  })
})

// ─── countCodeStructures ───

describe('countCodeStructures', () => {
  const project = new Project({ useInMemoryFileSystem: true })

  it('returns all zeros for an empty file', () => {
    const sf = project.createSourceFile('empty.ts', '')
    const result = countCodeStructures(sf)
    expect(result).toEqual({
      classes: 0,
      enums: 0,
      functions: 0,
      interfaces: 0,
      methods: 0,
      typeAliases: 0,
    })
    project.removeSourceFile(sf)
  })

  it('counts function declarations', () => {
    const sf = project.createSourceFile('fn.ts', 'function foo() {} function bar() {}')
    const result = countCodeStructures(sf)
    expect(result.functions).toBe(2)
    project.removeSourceFile(sf)
  })

  it('counts class declarations', () => {
    const sf = project.createSourceFile('cls.ts', 'class Foo {} class Bar {}')
    const result = countCodeStructures(sf)
    expect(result.classes).toBe(2)
    project.removeSourceFile(sf)
  })

  it('counts interface declarations', () => {
    const sf = project.createSourceFile('iface.ts', 'interface IFoo {} interface IBar {}')
    const result = countCodeStructures(sf)
    expect(result.interfaces).toBe(2)
    project.removeSourceFile(sf)
  })

  it('counts type alias declarations', () => {
    const sf = project.createSourceFile('type.ts', 'type TFoo = string; type TBar = number;')
    const result = countCodeStructures(sf)
    expect(result.typeAliases).toBe(2)
    project.removeSourceFile(sf)
  })

  it('counts enum declarations', () => {
    const sf = project.createSourceFile('enum.ts', 'enum Foo { A, B } enum Bar { C, D }')
    const result = countCodeStructures(sf)
    expect(result.enums).toBe(2)
    project.removeSourceFile(sf)
  })

  it('counts methods including constructors', () => {
    const sf = project.createSourceFile(
      'methods.ts',
      'class Foo { method1() {} method2() {} constructor() {} }',
    )
    const result = countCodeStructures(sf)
    expect(result.methods).toBe(3)
    project.removeSourceFile(sf)
  })

  it('counts mixed declarations in a single file', () => {
    const sf = project.createSourceFile(
      'mixed.ts',
      'interface IFoo {} type TFoo = string; enum EFoo { A, B } function foo() {} class Bar { baz() {} constructor() {} }',
    )
    const result = countCodeStructures(sf)
    expect(result.interfaces).toBe(1)
    expect(result.typeAliases).toBe(1)
    expect(result.enums).toBe(1)
    expect(result.functions).toBe(1)
    expect(result.classes).toBe(1)
    expect(result.methods).toBe(2)
    project.removeSourceFile(sf)
  })
})
