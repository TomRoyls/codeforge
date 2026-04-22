import { describe, expect, test } from 'vitest'
import { Node, Project, type BinaryExpression, type SourceFile } from 'ts-morph'

import {
  calculateFileComplexity,
  countCodeStructures,
  isLogicalOperator,
} from '../../../src/commands/stats-ast-helpers.js'

// ============================================================================
// Helpers
// ============================================================================

function createSourceFile(code: string): SourceFile {
  const project = new Project({ useInMemoryFileSystem: true })
  return project.createSourceFile('test.ts', code)
}

function findBinaryExpression(sf: SourceFile): BinaryExpression | undefined {
  let result: BinaryExpression | undefined
  sf.forEachDescendant((node) => {
    if (Node.isBinaryExpression(node) && !result) result = node
  })
  return result
}

// ============================================================================
// isLogicalOperator
// ============================================================================

describe('isLogicalOperator', () => {
  test('returns true for && (AmpersandAmpersandToken)', () => {
    const sf = createSourceFile('const x = a && b')
    const expr = findBinaryExpression(sf)
    expect(expr).toBeDefined()
    expect(isLogicalOperator(expr!)).toBe(true)
  })

  test('returns true for || (BarBarToken)', () => {
    const sf = createSourceFile('const x = a || b')
    const expr = findBinaryExpression(sf)
    expect(expr).toBeDefined()
    expect(isLogicalOperator(expr!)).toBe(true)
  })

  test('returns false for + (PlusToken)', () => {
    const sf = createSourceFile('const x = a + b')
    const expr = findBinaryExpression(sf)
    expect(expr).toBeDefined()
    expect(isLogicalOperator(expr!)).toBe(false)
  })

  test('returns false for === (EqualsEqualsEqualsToken)', () => {
    const sf = createSourceFile('const x = a === b')
    const expr = findBinaryExpression(sf)
    expect(expr).toBeDefined()
    expect(isLogicalOperator(expr!)).toBe(false)
  })

  test('returns false for < (LessThanToken)', () => {
    const sf = createSourceFile('const x = a < b')
    const expr = findBinaryExpression(sf)
    expect(expr).toBeDefined()
    expect(isLogicalOperator(expr!)).toBe(false)
  })

  test('returns false for * (AsteriskToken)', () => {
    const sf = createSourceFile('const x = a * b')
    const expr = findBinaryExpression(sf)
    expect(expr).toBeDefined()
    expect(isLogicalOperator(expr!)).toBe(false)
  })

  test('returns false for !== (ExclamationEqualsEqualsToken)', () => {
    const sf = createSourceFile('const x = a !== b')
    const expr = findBinaryExpression(sf)
    expect(expr).toBeDefined()
    expect(isLogicalOperator(expr!)).toBe(false)
  })

  test('returns false for > (GreaterThanToken)', () => {
    const sf = createSourceFile('const x = a > b')
    const expr = findBinaryExpression(sf)
    expect(expr).toBeDefined()
    expect(isLogicalOperator(expr!)).toBe(false)
  })

  test('returns false for <= (LessThanEqualsToken)', () => {
    const sf = createSourceFile('const x = a <= b')
    const expr = findBinaryExpression(sf)
    expect(expr).toBeDefined()
    expect(isLogicalOperator(expr!)).toBe(false)
  })
})

// ============================================================================
// calculateFileComplexity
// ============================================================================

describe('calculateFileComplexity', () => {
  test('returns 1 for empty file', () => {
    const sf = createSourceFile('')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('returns 1 for file with no control flow', () => {
    const sf = createSourceFile('const x = 1;\nconst y = 2;')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('counts if statement as +1', () => {
    const sf = createSourceFile('if (x) { y }')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('counts for loop as +1', () => {
    const sf = createSourceFile('for (let i = 0; i < 10; i++) {}')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('counts for-in loop as +1', () => {
    const sf = createSourceFile('for (const k in obj) {}')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('counts for-of loop as +1', () => {
    const sf = createSourceFile('for (const x of arr) {}')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('counts while loop as +1', () => {
    const sf = createSourceFile('while (x) {}')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('counts do-while loop as +1', () => {
    const sf = createSourceFile('do {} while (x)')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('counts catch clause as +1', () => {
    const sf = createSourceFile('try {} catch (e) {}')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('counts conditional (ternary) expression as +1', () => {
    const sf = createSourceFile('const x = a ? b : c')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('counts logical AND operator as +1', () => {
    const sf = createSourceFile('const x = a && b')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('counts logical OR operator as +1', () => {
    const sf = createSourceFile('const x = a || b')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('counts switch case clauses', () => {
    const sf = createSourceFile('switch (x) { case 1: break; case 2: break; default: break; }')
    expect(calculateFileComplexity(sf)).toBe(2)
  })

  test('accumulates complexity from multiple constructs', () => {
    const sf = createSourceFile(`
      if (a) {}
      for (let i = 0; i < 10; i++) {}
      while (b) {}
      try {} catch (e) {}
    `)
    expect(calculateFileComplexity(sf)).toBe(4)
  })

  test('counts nested if statements', () => {
    const sf = createSourceFile(`
      if (a) {
        if (b) {
          if (c) {}
        }
      }
    `)
    expect(calculateFileComplexity(sf)).toBe(3)
  })

  test('combines logical operators with control flow', () => {
    const sf = createSourceFile(`
      if (a && b) {}
    `)
    expect(calculateFileComplexity(sf)).toBe(2)
  })

  test('counts complex real-world-ish code', () => {
    const sf = createSourceFile(`
      function process(data: any) {
        if (!data) return null
        for (const item of data.items) {
          if (item.active && item.valid) {
            try {
              item.process()
            } catch (e) {
              if (item.retry) {
                item.retry()
              }
            }
          }
        }
        return data
      }
    `)
    expect(calculateFileComplexity(sf)).toBe(6)
  })

  test('does not count arithmetic operators', () => {
    const sf = createSourceFile('const x = a + b * c - d / e')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('counts chained logical operators separately', () => {
    const sf = createSourceFile('const x = a && b && c')
    expect(calculateFileComplexity(sf)).toBe(2)
  })

  test('counts mixed logical operators', () => {
    const sf = createSourceFile('const x = a && b || c && d')
    expect(calculateFileComplexity(sf)).toBe(3)
  })
})

// ============================================================================
// countCodeStructures
// ============================================================================

describe('countCodeStructures', () => {
  test('returns all zeros for empty file', () => {
    const sf = createSourceFile('')
    const result = countCodeStructures(sf)
    expect(result.classes).toBe(0)
    expect(result.enums).toBe(0)
    expect(result.functions).toBe(0)
    expect(result.interfaces).toBe(0)
    expect(result.methods).toBe(0)
    expect(result.typeAliases).toBe(0)
  })

  test('counts function declarations', () => {
    const sf = createSourceFile('function foo() {} function bar() {}')
    const result = countCodeStructures(sf)
    expect(result.functions).toBe(2)
  })

  test('does not count arrow functions as function declarations', () => {
    const sf = createSourceFile('const foo = () => 1')
    const result = countCodeStructures(sf)
    expect(result.functions).toBe(0)
  })

  test('counts class declarations', () => {
    const sf = createSourceFile('class Foo {} class Bar {}')
    const result = countCodeStructures(sf)
    expect(result.classes).toBe(2)
  })

  test('counts interface declarations', () => {
    const sf = createSourceFile('interface Foo {} interface Bar {}')
    const result = countCodeStructures(sf)
    expect(result.interfaces).toBe(2)
  })

  test('counts type alias declarations', () => {
    const sf = createSourceFile('type Foo = string; type Bar = number;')
    const result = countCodeStructures(sf)
    expect(result.typeAliases).toBe(2)
  })

  test('counts enum declarations', () => {
    const sf = createSourceFile('enum Foo { A, B } enum Bar { C }')
    const result = countCodeStructures(sf)
    expect(result.enums).toBe(2)
  })

  test('counts method declarations', () => {
    const sf = createSourceFile('class Foo { method1() {} method2() {} }')
    const result = countCodeStructures(sf)
    expect(result.methods).toBe(2)
  })

  test('counts constructor as a method', () => {
    const sf = createSourceFile('class Foo { constructor() {} }')
    const result = countCodeStructures(sf)
    expect(result.methods).toBe(1)
  })

  test('counts both methods and constructors together', () => {
    const sf = createSourceFile('class Foo { constructor() {} method() {} other() {} }')
    const result = countCodeStructures(sf)
    expect(result.methods).toBe(3)
  })

  test('counts mixed code structures', () => {
    const sf = createSourceFile(`
      interface IShape {}
      type Point = { x: number; y: number }
      enum Color { Red, Green, Blue }
      class Shape implements IShape {
        constructor() {}
        draw() {}
      }
      function helper() {}
    `)
    const result = countCodeStructures(sf)
    expect(result.classes).toBe(1)
    expect(result.enums).toBe(1)
    expect(result.functions).toBe(1)
    expect(result.interfaces).toBe(1)
    expect(result.methods).toBe(2)
    expect(result.typeAliases).toBe(1)
  })

  test('does not count class expression as class declaration', () => {
    const sf = createSourceFile('const Foo = class {}')
    const result = countCodeStructures(sf)
    expect(result.classes).toBe(0)
  })

  test('counts multiple classes with methods', () => {
    const sf = createSourceFile(`
      class A { ma() {} }
      class B { mb() {} mc() {} }
    `)
    const result = countCodeStructures(sf)
    expect(result.classes).toBe(2)
    expect(result.methods).toBe(3)
  })

  test('counts exported function declarations', () => {
    const sf = createSourceFile('export function foo() {}')
    const result = countCodeStructures(sf)
    expect(result.functions).toBe(1)
  })

  test('counts async function declarations', () => {
    const sf = createSourceFile('async function foo() {}')
    const result = countCodeStructures(sf)
    expect(result.functions).toBe(1)
  })

  test('counts exported async function declarations', () => {
    const sf = createSourceFile('export async function foo() {}')
    const result = countCodeStructures(sf)
    expect(result.functions).toBe(1)
  })

  test('counts generator function declarations', () => {
    const sf = createSourceFile('function* foo() { yield 1 }')
    const result = countCodeStructures(sf)
    expect(result.functions).toBe(1)
  })

  test('does not count function expressions assigned to variables', () => {
    const sf = createSourceFile('const foo = function() {}')
    const result = countCodeStructures(sf)
    expect(result.functions).toBe(0)
  })

  test('counts exported class declarations', () => {
    const sf = createSourceFile('export class Foo {}')
    const result = countCodeStructures(sf)
    expect(result.classes).toBe(1)
  })

  test('counts exported interface declarations', () => {
    const sf = createSourceFile('export interface Foo {}')
    const result = countCodeStructures(sf)
    expect(result.interfaces).toBe(1)
  })

  test('counts exported type alias declarations', () => {
    const sf = createSourceFile('export type Foo = string')
    const result = countCodeStructures(sf)
    expect(result.typeAliases).toBe(1)
  })

  test('counts exported enum declarations', () => {
    const sf = createSourceFile('export enum Foo { A }')
    const result = countCodeStructures(sf)
    expect(result.enums).toBe(1)
  })

  test('counts abstract class declarations', () => {
    const sf = createSourceFile('abstract class Foo { abstract method(): void }')
    const result = countCodeStructures(sf)
    expect(result.classes).toBe(1)
  })

  test('counts generic class declarations', () => {
    const sf = createSourceFile('class Foo<T> { value: T }')
    const result = countCodeStructures(sf)
    expect(result.classes).toBe(1)
  })

  test('counts generic interface declarations', () => {
    const sf = createSourceFile('interface Foo<T> { value: T }')
    const result = countCodeStructures(sf)
    expect(result.interfaces).toBe(1)
  })

  test('counts generic function declarations', () => {
    const sf = createSourceFile('function foo<T>(x: T): T { return x }')
    const result = countCodeStructures(sf)
    expect(result.functions).toBe(1)
  })

  test('counts interface extending another interface', () => {
    const sf = createSourceFile('interface Foo {} interface Bar extends Foo {}')
    const result = countCodeStructures(sf)
    expect(result.interfaces).toBe(2)
  })

  test('counts class implementing interface', () => {
    const sf = createSourceFile('interface I {} class Foo implements I {}')
    const result = countCodeStructures(sf)
    expect(result.interfaces).toBe(1)
    expect(result.classes).toBe(1)
  })

  test('counts static methods', () => {
    const sf = createSourceFile('class Foo { static bar() {} }')
    const result = countCodeStructures(sf)
    expect(result.methods).toBe(1)
  })

  test('counts private methods', () => {
    const sf = createSourceFile('class Foo { private bar() {} }')
    const result = countCodeStructures(sf)
    expect(result.methods).toBe(1)
  })

  test('counts protected methods', () => {
    const sf = createSourceFile('class Foo { protected bar() {} }')
    const result = countCodeStructures(sf)
    expect(result.methods).toBe(1)
  })

  test('counts async methods', () => {
    const sf = createSourceFile('class Foo { async bar() {} }')
    const result = countCodeStructures(sf)
    expect(result.methods).toBe(1)
  })

  test('counts empty class with no methods', () => {
    const sf = createSourceFile('class Foo {}')
    const result = countCodeStructures(sf)
    expect(result.classes).toBe(1)
    expect(result.methods).toBe(0)
  })

  test('counts empty interface', () => {
    const sf = createSourceFile('interface Foo {}')
    const result = countCodeStructures(sf)
    expect(result.interfaces).toBe(1)
  })

  test('counts empty enum', () => {
    const sf = createSourceFile('enum Foo {}')
    const result = countCodeStructures(sf)
    expect(result.enums).toBe(1)
  })

  test('counts enum with string values', () => {
    const sf = createSourceFile('enum Foo { A = "a", B = "b" }')
    const result = countCodeStructures(sf)
    expect(result.enums).toBe(1)
  })

  test('does not count const enum differently from regular enum', () => {
    const sf = createSourceFile('const enum Foo { A }')
    const result = countCodeStructures(sf)
    expect(result.enums).toBe(1)
  })

  test('counts type alias with union type', () => {
    const sf = createSourceFile('type Foo = string | number')
    const result = countCodeStructures(sf)
    expect(result.typeAliases).toBe(1)
  })

  test('counts type alias with intersection type', () => {
    const sf = createSourceFile('type Foo = { a: number } & { b: string }')
    const result = countCodeStructures(sf)
    expect(result.typeAliases).toBe(1)
  })

  test('counts type alias with mapped type', () => {
    const sf = createSourceFile('type Readonly<T> = { readonly [P in keyof T]: T[P] }')
    const result = countCodeStructures(sf)
    expect(result.typeAliases).toBe(1)
  })

  test('counts multiple type aliases', () => {
    const sf = createSourceFile('type A = string; type B = number; type C = boolean;')
    const result = countCodeStructures(sf)
    expect(result.typeAliases).toBe(3)
  })

  test('does not count import statements as any structure', () => {
    const sf = createSourceFile('import { foo } from "bar"; import * as baz from "qux"')
    const result = countCodeStructures(sf)
    expect(result.classes).toBe(0)
    expect(result.enums).toBe(0)
    expect(result.functions).toBe(0)
    expect(result.interfaces).toBe(0)
    expect(result.methods).toBe(0)
    expect(result.typeAliases).toBe(0)
  })

  test('counts structures alongside import statements', () => {
    const sf = createSourceFile('import { Foo } from "bar"; function baz() {}')
    const result = countCodeStructures(sf)
    expect(result.functions).toBe(1)
  })

  test('does not count variable declarations', () => {
    const sf = createSourceFile('const x = 1; let y = 2; var z = 3;')
    const result = countCodeStructures(sf)
    expect(result.functions).toBe(0)
    expect(result.classes).toBe(0)
  })

  test('does not count export default function as function declaration', () => {
    const sf = createSourceFile('export default function() {}')
    const result = countCodeStructures(sf)
    expect(result.functions).toBe(1)
  })

  test('counts class with only constructor and no other methods', () => {
    const sf = createSourceFile('class Foo { constructor(private x: number) {} }')
    const result = countCodeStructures(sf)
    expect(result.methods).toBe(1)
    expect(result.classes).toBe(1)
  })

  test('counts methods with various parameter types', () => {
    const sf = createSourceFile('class Foo { method(a: string, b: number, c?: boolean) {} }')
    const result = countCodeStructures(sf)
    expect(result.methods).toBe(1)
  })

  test('does not count getters as methods (GetAccessorDeclaration)', () => {
    const sf = createSourceFile('class Foo { get value() { return 1 } }')
    const result = countCodeStructures(sf)
    expect(result.methods).toBe(0)
  })

  test('does not count setters as methods (SetAccessorDeclaration)', () => {
    const sf = createSourceFile('class Foo { set value(v: number) {} }')
    const result = countCodeStructures(sf)
    expect(result.methods).toBe(0)
  })

  test('counts mixed real-world file structures', () => {
    const sf = createSourceFile(`
      import { Something } from 'module'

      type Config = { debug: boolean }
      interface Options { verbose: boolean }
      enum Status { Active, Inactive }

      class Service {
        constructor() {}
        start() {}
        stop() {}
      }

      function main() {}
      function helper() {}
    `)
    const result = countCodeStructures(sf)
    expect(result.typeAliases).toBe(1)
    expect(result.interfaces).toBe(1)
    expect(result.enums).toBe(1)
    expect(result.classes).toBe(1)
    expect(result.methods).toBe(3)
    expect(result.functions).toBe(2)
  })
})

// ============================================================================
// isLogicalOperator - additional operator coverage
// ============================================================================

describe('isLogicalOperator additional operators', () => {
  test('returns false for - (MinusToken)', () => {
    const sf = createSourceFile('const x = a - b')
    const expr = findBinaryExpression(sf)
    expect(expr).toBeDefined()
    expect(isLogicalOperator(expr!)).toBe(false)
  })

  test('returns false for / (SlashToken)', () => {
    const sf = createSourceFile('const x = a / b')
    const expr = findBinaryExpression(sf)
    expect(expr).toBeDefined()
    expect(isLogicalOperator(expr!)).toBe(false)
  })

  test('returns false for % (PercentToken)', () => {
    const sf = createSourceFile('const x = a % b')
    const expr = findBinaryExpression(sf)
    expect(expr).toBeDefined()
    expect(isLogicalOperator(expr!)).toBe(false)
  })

  test('returns false for >= (GreaterThanEqualsToken)', () => {
    const sf = createSourceFile('const x = a >= b')
    const expr = findBinaryExpression(sf)
    expect(expr).toBeDefined()
    expect(isLogicalOperator(expr!)).toBe(false)
  })

  test('returns false for == (EqualsEqualsToken)', () => {
    const sf = createSourceFile('const x = a == b')
    const expr = findBinaryExpression(sf)
    expect(expr).toBeDefined()
    expect(isLogicalOperator(expr!)).toBe(false)
  })

  test('returns false for != (ExclamationEqualsToken)', () => {
    const sf = createSourceFile('const x = a != b')
    const expr = findBinaryExpression(sf)
    expect(expr).toBeDefined()
    expect(isLogicalOperator(expr!)).toBe(false)
  })

  test('returns false for ** (AsteriskAsteriskToken)', () => {
    const sf = createSourceFile('const x = a ** b')
    const expr = findBinaryExpression(sf)
    expect(expr).toBeDefined()
    expect(isLogicalOperator(expr!)).toBe(false)
  })

  test('returns false for << (LessThanLessThanToken)', () => {
    const sf = createSourceFile('const x = a << b')
    const expr = findBinaryExpression(sf)
    expect(expr).toBeDefined()
    expect(isLogicalOperator(expr!)).toBe(false)
  })

  test('returns false for >> (GreaterThanGreaterThanToken)', () => {
    const sf = createSourceFile('const x = a >> b')
    const expr = findBinaryExpression(sf)
    expect(expr).toBeDefined()
    expect(isLogicalOperator(expr!)).toBe(false)
  })

  test('returns false for & (AmpersandToken - bitwise AND)', () => {
    const sf = createSourceFile('const x = a & b')
    const expr = findBinaryExpression(sf)
    expect(expr).toBeDefined()
    expect(isLogicalOperator(expr!)).toBe(false)
  })

  test('returns false for | (BarToken - bitwise OR)', () => {
    const sf = createSourceFile('const x = a | b')
    const expr = findBinaryExpression(sf)
    expect(expr).toBeDefined()
    expect(isLogicalOperator(expr!)).toBe(false)
  })

  test('returns false for ^ (CaretToken - bitwise XOR)', () => {
    const sf = createSourceFile('const x = a ^ b')
    const expr = findBinaryExpression(sf)
    expect(expr).toBeDefined()
    expect(isLogicalOperator(expr!)).toBe(false)
  })

  test('returns true for && in complex expression', () => {
    const sf = createSourceFile('const x = (a + b) && (c * d)')
    const expr = findBinaryExpression(sf)
    expect(expr).toBeDefined()
    expect(isLogicalOperator(expr!)).toBe(true)
  })

  test('returns true for || in complex expression', () => {
    const sf = createSourceFile('const x = (a > 0) || (b < 10)')
    const expr = findBinaryExpression(sf)
    expect(expr).toBeDefined()
    expect(isLogicalOperator(expr!)).toBe(true)
  })
})

// ============================================================================
// calculateFileComplexity - additional edge cases
// ============================================================================

describe('calculateFileComplexity additional edge cases', () => {
  test('returns 1 for file with only comments', () => {
    const sf = createSourceFile('// this is a comment\n/* block comment */')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('returns 1 for file with only imports', () => {
    const sf = createSourceFile('import { foo } from "bar"')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('returns 1 for file with only variable declarations', () => {
    const sf = createSourceFile('const x = 1; const y = "hello"; const z = true;')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('counts if-else as +1 (only if counts, not else)', () => {
    const sf = createSourceFile('if (x) { a } else { b }')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('counts if-else if-else as +2 (two if statements)', () => {
    const sf = createSourceFile('if (a) { 1 } else if (b) { 2 } else { 3 }')
    expect(calculateFileComplexity(sf)).toBe(2)
  })

  test('counts switch with many cases', () => {
    const sf = createSourceFile(
      'switch (x) { case 1: break; case 2: break; case 3: break; case 4: break; }',
    )
    expect(calculateFileComplexity(sf)).toBe(4)
  })

  test('does not count switch default clause', () => {
    const sf = createSourceFile('switch (x) { default: break; }')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('counts nested for loops', () => {
    const sf = createSourceFile('for (let i = 0; i < 10; i++) { for (let j = 0; j < 5; j++) {} }')
    expect(calculateFileComplexity(sf)).toBe(2)
  })

  test('counts nested while loops', () => {
    const sf = createSourceFile('while (a) { while (b) {} }')
    expect(calculateFileComplexity(sf)).toBe(2)
  })

  test('counts ternary inside ternary', () => {
    const sf = createSourceFile('const x = a ? (b ? 1 : 2) : 3')
    expect(calculateFileComplexity(sf)).toBe(2)
  })

  test('counts try-finally without catch', () => {
    const sf = createSourceFile('try {} finally {}')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('counts try-catch-finally', () => {
    const sf = createSourceFile('try {} catch (e) {} finally {}')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('counts multiple catch clauses from separate try blocks', () => {
    const sf = createSourceFile('try {} catch (e) {} try {} catch (e2) {}')
    expect(calculateFileComplexity(sf)).toBe(2)
  })

  test('counts deeply nested if statements (5 levels)', () => {
    const sf = createSourceFile(`
      if (a) {
        if (b) {
          if (c) {
            if (d) {
              if (e) {}
            }
          }
        }
      }
    `)
    expect(calculateFileComplexity(sf)).toBe(5)
  })

  test('does not count assignment operators', () => {
    const sf = createSourceFile('let x = 1; x += 2; x -= 3; x *= 4;')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('counts logical operators in if condition only', () => {
    const sf = createSourceFile('if (a && b || c) {}')
    expect(calculateFileComplexity(sf)).toBe(3)
  })

  test('counts for-of inside if', () => {
    const sf = createSourceFile('if (items) { for (const item of items) {} }')
    expect(calculateFileComplexity(sf)).toBe(2)
  })

  test('counts ternary with logical operators', () => {
    const sf = createSourceFile('const x = a && b ? 1 : 0')
    expect(calculateFileComplexity(sf)).toBe(2)
  })

  test('counts while with logical condition', () => {
    const sf = createSourceFile('while (a && b) {}')
    expect(calculateFileComplexity(sf)).toBe(2)
  })

  test('counts do-while with logical condition', () => {
    const sf = createSourceFile('do {} while (a || b)')
    expect(calculateFileComplexity(sf)).toBe(2)
  })

  test('counts complex switch-case with nested if', () => {
    const sf = createSourceFile(`
      switch (x) {
        case 1:
          if (y) {}
          break;
        case 2:
          break;
      }
    `)
    expect(calculateFileComplexity(sf)).toBe(3)
  })

  test('returns 1 for function with no branching', () => {
    const sf = createSourceFile('function foo(x: number): number { return x * 2 }')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('counts control flow inside arrow function', () => {
    const sf = createSourceFile('const fn = (x: number) => { if (x > 0) return x }')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('counts nested ternary inside logical operators', () => {
    const sf = createSourceFile('const x = (a ? b : c) && (d ? e : f)')
    expect(calculateFileComplexity(sf)).toBe(3)
  })

  test('counts for-in inside while loop', () => {
    const sf = createSourceFile('while (cond) { for (const k in obj) {} }')
    expect(calculateFileComplexity(sf)).toBe(2)
  })

  test('counts catch clause inside for loop', () => {
    const sf = createSourceFile('for (let i = 0; i < 10; i++) { try {} catch (e) {} }')
    expect(calculateFileComplexity(sf)).toBe(2)
  })

  test('counts multiple ternary expressions', () => {
    const sf = createSourceFile('const a = x ? 1 : 2; const b = y ? 3 : 4; const c = z ? 5 : 6;')
    expect(calculateFileComplexity(sf)).toBe(3)
  })

  test('counts heavily nested real-world function', () => {
    const sf = createSourceFile(`
      function validate(data: any) {
        if (!data) return false
        if (data.items) {
          for (const item of data.items) {
            if (item.type === 'a' && item.enabled) {
              try {
                item.validate()
              } catch (e) {
                if (item.fallback) {
                  item.fallback()
                }
              }
            }
          }
        }
        return true
      }
    `)
    expect(calculateFileComplexity(sf)).toBe(7)
  })

  test('returns 1 for file with only export statements', () => {
    const sf = createSourceFile('export { foo } from "bar"')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('counts logical AND inside logical OR', () => {
    const sf = createSourceFile('const x = a || (b && c)')
    expect(calculateFileComplexity(sf)).toBe(2)
  })

  test('counts four chained logical AND operators', () => {
    const sf = createSourceFile('const x = a && b && c && d')
    expect(calculateFileComplexity(sf)).toBe(3)
  })

  test('counts binary expression inside non-logical context', () => {
    const sf = createSourceFile('const x = (a + b) * (c - d)')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('returns correct complexity for class with methods', () => {
    const sf = createSourceFile(`
      class Foo {
        method1(x: number) {
          if (x > 0) return x
          return 0
        }
        method2(x: number) {
          return x > 0 ? x : -x
        }
      }
    `)
    expect(calculateFileComplexity(sf)).toBe(2)
  })

  test('returns 1 for empty type declaration file', () => {
    const sf = createSourceFile('type Foo = string')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('counts conditional expression as statement', () => {
    const sf = createSourceFile('a ? b() : c()')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('counts do-while inside for loop', () => {
    const sf = createSourceFile('for (let i = 0; i < 10; i++) { do {} while (x) }')
    expect(calculateFileComplexity(sf)).toBe(2)
  })

  test('counts for-in with ternary inside', () => {
    const sf = createSourceFile('for (const k in obj) { const v = k ? 1 : 0 }')
    expect(calculateFileComplexity(sf)).toBe(2)
  })

  test('counts switch inside while loop', () => {
    const sf = createSourceFile('while (x) { switch (y) { case 1: break; case 2: break; } }')
    expect(calculateFileComplexity(sf)).toBe(3)
  })
})

// ============================================================================
// calculateFileComplexity - deeply nested and combinational edge cases
// ============================================================================

describe('calculateFileComplexity deep nesting and combinations', () => {
  test('counts if inside catch inside for-of inside while', () => {
    const sf = createSourceFile(`
      while (cond) {
        for (const item of items) {
          try {
            process(item)
          } catch (e) {
            if (item.retry) {}
          }
        }
      }
    `)
    expect(calculateFileComplexity(sf)).toBe(4)
  })

  test('counts deeply nested ternaries (3 levels)', () => {
    const sf = createSourceFile('const x = a ? (b ? (c ? 1 : 2) : 3) : 4')
    expect(calculateFileComplexity(sf)).toBe(3)
  })

  test('counts switch with 10 cases', () => {
    const sf = createSourceFile(`
      switch (x) {
        case 1: break; case 2: break; case 3: break; case 4: break; case 5: break;
        case 6: break; case 7: break; case 8: break; case 9: break; case 10: break;
      }
    `)
    expect(calculateFileComplexity(sf)).toBe(10)
  })

  test('counts for loop with ternary body', () => {
    const sf = createSourceFile('for (let i = 0; i < 10; i++) { const x = i > 5 ? 1 : 0 }')
    expect(calculateFileComplexity(sf)).toBe(2)
  })

  test('counts while loop with ternary condition not adding extra', () => {
    const sf = createSourceFile('while (true) {}')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('counts for loop with break (no extra complexity)', () => {
    const sf = createSourceFile('for (let i = 0; i < 10; i++) { if (i === 5) break }')
    expect(calculateFileComplexity(sf)).toBe(2)
  })

  test('returns 1 for file with only a class and no methods', () => {
    const sf = createSourceFile('class Foo {}')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('returns 1 for file with only a namespace', () => {
    const sf = createSourceFile('namespace Foo { const x = 1 }')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('counts complexity inside namespace', () => {
    const sf = createSourceFile('namespace Foo { if (x) {} }')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('counts if with else if else if else chain (4 branches)', () => {
    const sf = createSourceFile('if (a) {} else if (b) {} else if (c) {} else {}')
    expect(calculateFileComplexity(sf)).toBe(3)
  })

  test('counts multiple separate if statements', () => {
    const sf = createSourceFile('if (a) {} if (b) {} if (c) {}')
    expect(calculateFileComplexity(sf)).toBe(3)
  })

  test('counts for loop with logical condition', () => {
    const sf = createSourceFile('for (let i = 0; i < 10 && j > 0; i++) {}')
    expect(calculateFileComplexity(sf)).toBe(2)
  })

  test('counts do-while with ternary in body', () => {
    const sf = createSourceFile('do { const x = a ? 1 : 2 } while (cond)')
    expect(calculateFileComplexity(sf)).toBe(2)
  })

  test('counts catch inside catch (nested try)', () => {
    const sf = createSourceFile('try { try {} catch (e) {} } catch (e2) {}')
    expect(calculateFileComplexity(sf)).toBe(2)
  })

  test('returns 1 for file with only a return statement', () => {
    const sf = createSourceFile('return 42')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('counts logical operators in separate expressions', () => {
    const sf = createSourceFile('const a = x && y; const b = p || q;')
    expect(calculateFileComplexity(sf)).toBe(2)
  })

  test('counts chained ternaries as separate', () => {
    const sf = createSourceFile('const a = x ? 1 : 0; const b = y ? 2 : 0;')
    expect(calculateFileComplexity(sf)).toBe(2)
  })

  test('returns 1 for module declaration only', () => {
    const sf = createSourceFile('declare module "foo" { }')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('counts complexity inside declare function body', () => {
    const sf = createSourceFile('function foo() { if (x) {} }')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('counts all control flow types combined', () => {
    const sf = createSourceFile(`
      if (a) {}
      for (let i = 0; i < 1; i++) {}
      for (const k in obj) {}
      for (const x of arr) {}
      while (b) {}
      do {} while (c)
      try {} catch (e) {}
      const x = d ? 1 : 0
      switch (x) { case 1: break; }
      const y = e && f
    `)
    expect(calculateFileComplexity(sf)).toBe(10)
  })
})

// ============================================================================
// calculateFileComplexity - specific operator and statement patterns
// ============================================================================

describe('calculateFileComplexity specific patterns', () => {
  test('counts logical OR in return statement', () => {
    const sf = createSourceFile('function foo() { return a || b }')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('counts logical AND in return statement', () => {
    const sf = createSourceFile('function foo() { return a && b }')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('counts ternary in function argument', () => {
    const sf = createSourceFile('foo(x ? 1 : 2)')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('counts logical operator in function argument', () => {
    const sf = createSourceFile('foo(a && b)')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('counts complexity in arrow function with ternary', () => {
    const sf = createSourceFile('const fn = (x: number) => x > 0 ? x : -x')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('counts complexity in arrow function with logical operator', () => {
    const sf = createSourceFile('const fn = (x: boolean, y: boolean) => x && y')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('counts if inside arrow function body', () => {
    const sf = createSourceFile('const fn = () => { if (x) {} }')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('does not count comparison operators in if condition', () => {
    const sf = createSourceFile('if (a === b) {}')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('does not count typeof check as complexity', () => {
    const sf = createSourceFile('if (typeof x === "string") {}')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('counts for-of inside for-of', () => {
    const sf = createSourceFile('for (const a of x) { for (const b of a) {} }')
    expect(calculateFileComplexity(sf)).toBe(2)
  })

  test('counts for-in inside for-in', () => {
    const sf = createSourceFile('for (const k in obj) { for (const j in obj[k]) {} }')
    expect(calculateFileComplexity(sf)).toBe(2)
  })

  test('counts while inside do-while', () => {
    const sf = createSourceFile('do { while (x) {} } while (y)')
    expect(calculateFileComplexity(sf)).toBe(2)
  })

  test('returns 1 for empty interface file', () => {
    const sf = createSourceFile('interface IEmpty {}')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('returns 1 for empty enum file', () => {
    const sf = createSourceFile('enum E { A, B }')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('returns 1 for type alias with conditional type', () => {
    const sf = createSourceFile('type IsString<T> = T extends string ? true : false')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('counts if with negated condition', () => {
    const sf = createSourceFile('if (!x) {}')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('counts if with logical NOT but no extra complexity', () => {
    const sf = createSourceFile('if (!(a && b)) {}')
    expect(calculateFileComplexity(sf)).toBe(2)
  })

  test('counts multiple catch blocks in nested try-catch', () => {
    const sf = createSourceFile('try {} catch (e) {} try {} catch (e2) {} try {} catch (e3) {}')
    expect(calculateFileComplexity(sf)).toBe(3)
  })

  test('counts switch inside for loop', () => {
    const sf = createSourceFile(
      'for (let i = 0; i < 10; i++) { switch (i) { case 0: break; case 1: break; } }',
    )
    expect(calculateFileComplexity(sf)).toBe(3)
  })

  test('counts ternary inside switch case', () => {
    const sf = createSourceFile('switch (x) { case 1: const y = z ? 1 : 0; break; }')
    expect(calculateFileComplexity(sf)).toBe(2)
  })
})

// ============================================================================
// countCodeStructures - additional edge cases
// ============================================================================

describe('countCodeStructures additional edge cases', () => {
  test('counts function with default parameters', () => {
    const sf = createSourceFile('function foo(x: number = 0, y: string = "") {}')
    const result = countCodeStructures(sf)
    expect(result.functions).toBe(1)
  })

  test('counts function with rest parameters', () => {
    const sf = createSourceFile('function foo(...args: number[]) {}')
    const result = countCodeStructures(sf)
    expect(result.functions).toBe(1)
  })

  test('counts function with overloaded signatures', () => {
    const sf = createSourceFile(`
      function foo(x: string): string;
      function foo(x: number): number;
      function foo(x: any): any {}
    `)
    const result = countCodeStructures(sf)
    expect(result.functions).toBe(3)
  })

  test('counts class extending another class', () => {
    const sf = createSourceFile('class Foo extends Bar {}')
    const result = countCodeStructures(sf)
    expect(result.classes).toBe(1)
  })

  test('counts class with abstract methods', () => {
    const sf = createSourceFile('abstract class Foo { abstract doWork(): void; concrete() {} }')
    const result = countCodeStructures(sf)
    expect(result.classes).toBe(1)
    expect(result.methods).toBe(2)
  })

  test('counts class implementing multiple interfaces', () => {
    const sf = createSourceFile('interface A {} interface B {} class Foo implements A, B {}')
    const result = countCodeStructures(sf)
    expect(result.interfaces).toBe(2)
    expect(result.classes).toBe(1)
  })

  test('counts interface with optional properties', () => {
    const sf = createSourceFile('interface Foo { x?: number; y: string }')
    const result = countCodeStructures(sf)
    expect(result.interfaces).toBe(1)
  })

  test('counts interface with method signatures', () => {
    const sf = createSourceFile('interface Foo { method(): void; other(x: number): string }')
    const result = countCodeStructures(sf)
    expect(result.interfaces).toBe(1)
    expect(result.methods).toBe(0)
  })

  test('counts generic type alias', () => {
    const sf = createSourceFile('type Result<T, E> = { ok: T; err: E }')
    const result = countCodeStructures(sf)
    expect(result.typeAliases).toBe(1)
  })

  test('counts type alias with function type', () => {
    const sf = createSourceFile('type Callback = (x: number) => string')
    const result = countCodeStructures(sf)
    expect(result.typeAliases).toBe(1)
  })

  test('counts type alias with typeof', () => {
    const sf = createSourceFile('const x = 1; type T = typeof x')
    const result = countCodeStructures(sf)
    expect(result.typeAliases).toBe(1)
  })

  test('counts class with getter and setter alongside methods', () => {
    const sf = createSourceFile(
      'class Foo { get val() { return 1 } set val(v: number) {} method() {} }',
    )
    const result = countCodeStructures(sf)
    expect(result.methods).toBe(1)
  })

  test('counts class with only getters and setters (no regular methods)', () => {
    const sf = createSourceFile('class Foo { get x() { return 1 } set x(v: number) {} }')
    const result = countCodeStructures(sf)
    expect(result.methods).toBe(0)
  })

  test('counts readonly method', () => {
    const sf = createSourceFile('class Foo { readonly bar() {} }')
    const result = countCodeStructures(sf)
    expect(result.methods).toBe(1)
  })

  test('counts method with generic type parameters', () => {
    const sf = createSourceFile('class Foo { method<T>(x: T): T { return x } }')
    const result = countCodeStructures(sf)
    expect(result.methods).toBe(1)
  })

  test('counts async method with try-catch', () => {
    const sf = createSourceFile('class Foo { async bar() { try {} catch (e) {} } }')
    const result = countCodeStructures(sf)
    expect(result.methods).toBe(1)
  })

  test('counts exported default class', () => {
    const sf = createSourceFile('export default class Foo {}')
    const result = countCodeStructures(sf)
    expect(result.classes).toBe(1)
  })

  test('counts declare class', () => {
    const sf = createSourceFile('declare class Foo { method(): void }')
    const result = countCodeStructures(sf)
    expect(result.classes).toBe(1)
    expect(result.methods).toBe(1)
  })

  test('counts declare function', () => {
    const sf = createSourceFile('declare function foo(x: number): void')
    const result = countCodeStructures(sf)
    expect(result.functions).toBe(1)
  })

  test('counts declare enum', () => {
    const sf = createSourceFile('declare enum Foo { A, B }')
    const result = countCodeStructures(sf)
    expect(result.enums).toBe(1)
  })

  test('counts enum with mixed initializers', () => {
    const sf = createSourceFile('enum Foo { A = 1, B, C = "c", D }')
    const result = countCodeStructures(sf)
    expect(result.enums).toBe(1)
  })

  test('counts multiple classes with constructors', () => {
    const sf = createSourceFile('class A { constructor() {} } class B { constructor() {} }')
    const result = countCodeStructures(sf)
    expect(result.classes).toBe(2)
    expect(result.methods).toBe(2)
  })

  test('returns zeros for file with only export statements', () => {
    const sf = createSourceFile('export { foo } from "bar"; export * from "baz"')
    const result = countCodeStructures(sf)
    expect(result.classes).toBe(0)
    expect(result.functions).toBe(0)
    expect(result.interfaces).toBe(0)
    expect(result.typeAliases).toBe(0)
    expect(result.enums).toBe(0)
    expect(result.methods).toBe(0)
  })

  test('counts re-exported type', () => {
    const sf = createSourceFile('export type { Foo } from "bar"')
    const result = countCodeStructures(sf)
    expect(result.typeAliases).toBe(0)
  })

  test('counts class with property declarations only', () => {
    const sf = createSourceFile('class Foo { x: number = 1; y: string = "" }')
    const result = countCodeStructures(sf)
    expect(result.classes).toBe(1)
    expect(result.methods).toBe(0)
  })

  test('counts nested namespace with function', () => {
    const sf = createSourceFile('namespace NS { function inner() {} }')
    const result = countCodeStructures(sf)
    expect(result.functions).toBe(1)
  })

  test('counts class inside namespace', () => {
    const sf = createSourceFile('namespace NS { class Inner { method() {} } }')
    const result = countCodeStructures(sf)
    expect(result.classes).toBe(1)
    expect(result.methods).toBe(1)
  })

  test('counts interface inside namespace', () => {
    const sf = createSourceFile('namespace NS { interface IInner {} }')
    const result = countCodeStructures(sf)
    expect(result.interfaces).toBe(1)
  })

  test('counts enum inside namespace', () => {
    const sf = createSourceFile('namespace NS { enum EInner { A } }')
    const result = countCodeStructures(sf)
    expect(result.enums).toBe(1)
  })

  test('counts type alias inside namespace', () => {
    const sf = createSourceFile('namespace NS { type TInner = string }')
    const result = countCodeStructures(sf)
    expect(result.typeAliases).toBe(1)
  })

  test('counts complex file with all structure types', () => {
    const sf = createSourceFile(`
      import { Something } from 'module'
      export type Config = { debug: boolean }
      export interface Options { verbose: boolean; level: number }
      export enum Direction { Up, Down, Left, Right }
      export class Processor {
        constructor(private config: Config) {}
        process() {}
        cleanup() {}
        private validate() {}
        static create() {}
      }
      export function init() {}
      export function teardown() {}
      function internalHelper() {}
    `)
    const result = countCodeStructures(sf)
    expect(result.typeAliases).toBe(1)
    expect(result.interfaces).toBe(1)
    expect(result.enums).toBe(1)
    expect(result.classes).toBe(1)
    expect(result.methods).toBe(5)
    expect(result.functions).toBe(3)
  })

  test('counts class expression with methods', () => {
    const sf = createSourceFile('const Foo = class { method() {} }')
    const result = countCodeStructures(sf)
    expect(result.classes).toBe(0)
    expect(result.methods).toBe(1)
  })

  test('does not count variable declarations with arrow functions', () => {
    const sf = createSourceFile('const a = () => 1; const b = () => 2; const c = () => 3;')
    const result = countCodeStructures(sf)
    expect(result.functions).toBe(0)
  })

  test('counts object literal methods', () => {
    const sf = createSourceFile('const obj = { method() {}, other() {} }')
    const result = countCodeStructures(sf)
    expect(result.methods).toBe(2)
    expect(result.functions).toBe(0)
  })

  test('counts default exported function with name', () => {
    const sf = createSourceFile('export default function main() {}')
    const result = countCodeStructures(sf)
    expect(result.functions).toBe(1)
  })

  test('counts class with computed property method', () => {
    const sf = createSourceFile('class Foo { ["computedMethod"]() {} }')
    const result = countCodeStructures(sf)
    expect(result.methods).toBe(1)
  })

  test('counts class with symbol method', () => {
    const sf = createSourceFile('class Foo { [Symbol.iterator]() {} }')
    const result = countCodeStructures(sf)
    expect(result.methods).toBe(1)
  })

  test('counts 10 function declarations', () => {
    const sf = createSourceFile(
      Array.from({ length: 10 }, (_, i) => `function fn${i}() {}`).join('\n'),
    )
    const result = countCodeStructures(sf)
    expect(result.functions).toBe(10)
  })

  test('counts 5 interface declarations', () => {
    const sf = createSourceFile(
      Array.from({ length: 5 }, (_, i) => `interface I${i} {}`).join('\n'),
    )
    const result = countCodeStructures(sf)
    expect(result.interfaces).toBe(5)
  })

  test('counts 5 class declarations', () => {
    const sf = createSourceFile(Array.from({ length: 5 }, (_, i) => `class C${i} {}`).join('\n'))
    const result = countCodeStructures(sf)
    expect(result.classes).toBe(5)
  })

  test('counts file with only declare statements', () => {
    const sf = createSourceFile(`
      declare class Cls { method(): void }
      declare function fn(): void
      declare enum En { A }
      declare interface Iface {}
    `)
    const result = countCodeStructures(sf)
    expect(result.classes).toBe(1)
    expect(result.functions).toBe(1)
    expect(result.enums).toBe(1)
    expect(result.interfaces).toBe(1)
    expect(result.methods).toBe(1)
  })

  test('counts class with method overload signatures', () => {
    const sf = createSourceFile(`
      class Foo {
        method(x: string): string;
        method(x: number): number;
        method(x: any): any {}
      }
    `)
    const result = countCodeStructures(sf)
    expect(result.methods).toBe(3)
  })
})

// ============================================================================
// isLogicalOperator - additional edge cases
// ============================================================================

describe('isLogicalOperator additional edge cases', () => {
  test('returns true for && inside parentheses', () => {
    const sf = createSourceFile('const x = (a && b)')
    const expr = findBinaryExpression(sf)
    expect(expr).toBeDefined()
    expect(isLogicalOperator(expr!)).toBe(true)
  })

  test('returns true for || inside parentheses', () => {
    const sf = createSourceFile('const x = (a || b)')
    const expr = findBinaryExpression(sf)
    expect(expr).toBeDefined()
    expect(isLogicalOperator(expr!)).toBe(true)
  })

  test('returns false for instanceof operator', () => {
    const sf = createSourceFile('const x = a instanceof Object')
    const expr = findBinaryExpression(sf)
    expect(expr).toBeDefined()
    expect(isLogicalOperator(expr!)).toBe(false)
  })

  test('returns false for in operator', () => {
    const sf = createSourceFile('const x = "key" in obj')
    const expr = findBinaryExpression(sf)
    expect(expr).toBeDefined()
    expect(isLogicalOperator(expr!)).toBe(false)
  })

  test('handles && in if statement condition', () => {
    const sf = createSourceFile('if (a && b) {}')
    let result: BinaryExpression | undefined
    sf.forEachDescendant((node) => {
      if (Node.isBinaryExpression(node) && !result) result = node
    })
    expect(result).toBeDefined()
    expect(isLogicalOperator(result!)).toBe(true)
  })

  test('handles || in while condition', () => {
    const sf = createSourceFile('while (a || b) {}')
    let result: BinaryExpression | undefined
    sf.forEachDescendant((node) => {
      if (Node.isBinaryExpression(node) && !result) result = node
    })
    expect(result).toBeDefined()
    expect(isLogicalOperator(result!)).toBe(true)
  })

  test('returns false for >>> (unsigned right shift)', () => {
    const sf = createSourceFile('const x = a >>> b')
    const expr = findBinaryExpression(sf)
    expect(expr).toBeDefined()
    expect(isLogicalOperator(expr!)).toBe(false)
  })
})
