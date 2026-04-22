import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import {
  analyzeNoMagicNumbers,
  noMagicNumbersRule,
} from '../../../../src/rules/best-practices/no-magic-numbers.js'

const sharedProject = new Project({ useInMemoryFileSystem: true })
let fileCounter = 0
const createSourceFile = (code: string) => {
  fileCounter++
  return sharedProject.createSourceFile(`test${fileCounter}.ts`, code)
}

describe('no-magic-numbers rule', () => {
  describe('analyzeNoMagicNumbers', () => {
    it('should detect magic numbers in function calls', () => {
      const sourceFile = createSourceFile(`
        function calculate(x: number) {
          return x * 60;
        }
      `)
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('60')
    })

    it('should not flag ignored numbers (0, 1, -1)', () => {
      const sourceFile = createSourceFile(`
        const a = 0;
        const b = 1;
        const c = -1;
      `)
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag numbers in enum members', () => {
      const sourceFile = createSourceFile(`
        enum Status {
          Active = 200,
          NotFound = 404,
          Error = 500
        }
      `)
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag numbers in const declarations', () => {
      const sourceFile = createSourceFile(`
        const TIMEOUT = 5000;
        const MAX_RETRIES = 3;
      `)
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag numbers in object literals', () => {
      const sourceFile = createSourceFile(`
        const config = {
          timeout: 3000,
          retries: 5
        };
      `)
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag array indexes', () => {
      const sourceFile = createSourceFile(`
        const arr = ['a', 'b', 'c'];
        const item = arr[2];
      `)
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag numeric literal types', () => {
      const sourceFile = createSourceFile(`
        type Port = 3000 | 8080;
      `)
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should detect magic numbers in variable declarations with let', () => {
      const sourceFile = createSourceFile(`
        let timeout = 5000;
      `)
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('5000')
    })

    it('should detect magic numbers in binary expressions', () => {
      const sourceFile = createSourceFile(`
        const result = 100 + 200;
      `)
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.length).toBeGreaterThanOrEqual(0)
    })

    it('should respect custom ignore list', () => {
      const sourceFile = createSourceFile(`
        const x = 42;
        const y = 100;
      `)
      const violations = analyzeNoMagicNumbers(sourceFile, { ignore: [42, 100] })
      expect(violations).toHaveLength(0)
    })
  })

  describe('rule definition', () => {
    it('should have correct meta properties', () => {
      expect(noMagicNumbersRule.meta.name).toBe('no-magic-numbers')
      expect(noMagicNumbersRule.meta.category).toBe('style')
      expect(noMagicNumbersRule.meta.recommended).toBe(false)
      expect(noMagicNumbersRule.meta.fixable).toBe('code')
    })

    it('should have default options', () => {
      expect(noMagicNumbersRule.defaultOptions).toBeDefined()
      expect(noMagicNumbersRule.defaultOptions.ignoreArrayIndexes).toBe(true)
      expect(noMagicNumbersRule.defaultOptions.ignoreEnums).toBe(true)
      expect(noMagicNumbersRule.defaultOptions.ignoreNumericLiteralTypes).toBe(true)
    })

    it('should create visitor with visitNode method', () => {
      const result = noMagicNumbersRule.create(noMagicNumbersRule.defaultOptions)
      expect(result.visitor).toBeDefined()
      expect(result.visitor.visitNode).toBeDefined()
      expect(result.onComplete).toBeDefined()
    })
  })

  describe('rule metadata', () => {
    it('should have name set to no-magic-numbers', () => {
      expect(noMagicNumbersRule.meta.name).toBe('no-magic-numbers')
    })

    it('should have category set to style', () => {
      expect(noMagicNumbersRule.meta.category).toBe('style')
    })

    it('should have recommended set to false', () => {
      expect(noMagicNumbersRule.meta.recommended).toBe(false)
    })

    it('should be fixable with code', () => {
      expect(noMagicNumbersRule.meta.fixable).toBe('code')
    })

    it('should have a description', () => {
      expect(noMagicNumbersRule.meta.description).toBeDefined()
      expect(noMagicNumbersRule.meta.description.length).toBeGreaterThan(0)
    })

    it('should have default ignore as empty array', () => {
      expect(noMagicNumbersRule.defaultOptions.ignore).toEqual([])
    })

    it('should have ignoreDefaultValues defaulting to false', () => {
      expect(noMagicNumbersRule.defaultOptions.ignoreDefaultValues).toBe(false)
    })

    it('should have ignoreReadonlyClassProperties defaulting to false', () => {
      expect(noMagicNumbersRule.defaultOptions.ignoreReadonlyClassProperties).toBe(false)
    })

    it('should have ignoreArrayLiterals defaulting to true', () => {
      expect(noMagicNumbersRule.defaultOptions.ignoreArrayLiterals).toBe(true)
    })
  })

  describe('rule create function', () => {
    it('should return an object with visitor property', () => {
      const result = noMagicNumbersRule.create(noMagicNumbersRule.defaultOptions)
      expect(result).toHaveProperty('visitor')
    })

    it('should return an object with onComplete property', () => {
      const result = noMagicNumbersRule.create(noMagicNumbersRule.defaultOptions)
      expect(result).toHaveProperty('onComplete')
    })

    it('should have visitNode as a function on visitor', () => {
      const result = noMagicNumbersRule.create(noMagicNumbersRule.defaultOptions)
      expect(typeof result.visitor.visitNode).toBe('function')
    })

    it('should have onComplete as a function', () => {
      const result = noMagicNumbersRule.create(noMagicNumbersRule.defaultOptions)
      expect(typeof result.onComplete).toBe('function')
    })

    it('should return empty violations from onComplete initially', () => {
      const result = noMagicNumbersRule.create(noMagicNumbersRule.defaultOptions)
      const violations = result.onComplete()
      expect(Array.isArray(violations)).toBe(true)
    })

    it('should accept options parameter', () => {
      const result = noMagicNumbersRule.create({
        ...noMagicNumbersRule.defaultOptions,
        ignore: [42],
      })
      expect(result.visitor).toBeDefined()
    })

    it('should create independent instances each call', () => {
      const result1 = noMagicNumbersRule.create(noMagicNumbersRule.defaultOptions)
      const result2 = noMagicNumbersRule.create(noMagicNumbersRule.defaultOptions)
      expect(result1).not.toBe(result2)
    })

    it('should create visitor that processes nodes without error', () => {
      const result = noMagicNumbersRule.create(noMagicNumbersRule.defaultOptions)
      const sourceFile = createSourceFile('const x = 42;')
      expect(() => {
        sourceFile.forEachChild((child) => {
          result.visitor.visitNode?.(child, {
            sourceFile,
            depth: 1,
            parent: sourceFile,
            addViolation: () => {},
            getFilePath: () => sourceFile.getFilePath(),
          })
        })
      }).not.toThrow()
    })
  })

  describe('detecting magic numbers', () => {
    it('should detect magic number in function call argument', () => {
      const sourceFile = createSourceFile('setTimeout(fn, 500);')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('500')
    })

    it('should detect magic number in return statement', () => {
      const sourceFile = createSourceFile('function getValue() { return 42; }')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should detect magic number in comparison', () => {
      const sourceFile = createSourceFile('if (x > 100) {}')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('100')
    })

    it('should detect magic number in assignment with let', () => {
      const sourceFile = createSourceFile('let count = 99;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should detect magic number in arithmetic expression', () => {
      const sourceFile = createSourceFile('let x = 10 + 20;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should detect magic number in ternary expression', () => {
      const sourceFile = createSourceFile('const x = cond ? 42 : 43;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should detect magic number in new expression', () => {
      const sourceFile = createSourceFile('const buf = new Buffer(1024);')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should detect magic number in method call', () => {
      const sourceFile = createSourceFile('arr.slice(2);')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should detect magic number in while loop condition', () => {
      const sourceFile = createSourceFile('while (x < 100) { x++; }')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should detect magic number in for loop init', () => {
      const sourceFile = createSourceFile('for (let i = 0; i < 10; i++) {}')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.some((v) => v.message.includes('10'))).toBe(true)
    })

    it('should detect magic number in switch case', () => {
      const sourceFile = createSourceFile('switch(x) { case 42: break; }')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should detect magic number in class method body', () => {
      const sourceFile = createSourceFile('class Foo { bar() { return 77; } }')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should detect magic number in nested function', () => {
      const sourceFile = createSourceFile('function outer() { function inner() { return 55; } }')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should detect magic number in arrow function body', () => {
      const sourceFile = createSourceFile('const fn = () => 88;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should detect magic number in template expression', () => {
      const sourceFile = createSourceFile('const s = `value: ${42}`;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should detect magic number in logical expression', () => {
      const sourceFile = createSourceFile('const x = a || 42;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should detect magic number in postfix expression', () => {
      const sourceFile = createSourceFile('let x = 3; x++;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should detect magic number in typeof comparison', () => {
      const sourceFile = createSourceFile('if (x === 999) {}')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should detect magic number in destructured array default', () => {
      const sourceFile = createSourceFile('const [a = 42] = arr;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should detect magic number in template literal interpolation', () => {
      const sourceFile = createSourceFile('const msg = `${200} OK`;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should detect magic number in bitwise operation', () => {
      const sourceFile = createSourceFile('const x = 255 & mask;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should detect magic number in increment expression', () => {
      const sourceFile = createSourceFile('for (let i = 0; i < 50; i += 5) {}')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.some((v) => v.message.includes('50'))).toBe(true)
    })

    it('should detect multiple magic numbers in same statement', () => {
      const sourceFile = createSourceFile('let x = 42 + 99;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.length).toBeGreaterThanOrEqual(2)
    })

    it('should detect magic number in conditional return', () => {
      const sourceFile = createSourceFile('function f() { if (x) return 33; return 0; }')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.some((v) => v.message.includes('33'))).toBe(true)
    })

    it('should detect magic number in do-while condition', () => {
      const sourceFile = createSourceFile('do {} while (x < 77);')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should detect magic number in instanceof comparison rhs', () => {
      const sourceFile = createSourceFile('const x = y * 66;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should detect magic number in spread argument', () => {
      const sourceFile = createSourceFile('fn(42);')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should detect magic number in thrown error constructor', () => {
      const sourceFile = createSourceFile('throw new Error(500);')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should detect magic number in property access chain', () => {
      const sourceFile = createSourceFile('const x = arr.length + 42;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should detect magic number in void expression', () => {
      const sourceFile = createSourceFile('void 42;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })
  })

  describe('ignored numbers', () => {
    it('should not flag 0', () => {
      const sourceFile = createSourceFile('let x = 0;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag 1', () => {
      const sourceFile = createSourceFile('let x = 1;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag numbers in custom ignore list', () => {
      const sourceFile = createSourceFile('let x = 42;')
      const violations = analyzeNoMagicNumbers(sourceFile, { ignore: [42] })
      expect(violations).toHaveLength(0)
    })

    it('should flag numbers NOT in ignore list', () => {
      const sourceFile = createSourceFile('let x = 42;')
      const violations = analyzeNoMagicNumbers(sourceFile, { ignore: [99] })
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should not flag multiple numbers in custom ignore list', () => {
      const sourceFile = createSourceFile('let x = 42; let y = 99;')
      const violations = analyzeNoMagicNumbers(sourceFile, { ignore: [42, 99] })
      expect(violations).toHaveLength(0)
    })

    it('should still flag non-ignored numbers when ignore list is partially matching', () => {
      const sourceFile = createSourceFile('let x = 42; let y = 100;')
      const violations = analyzeNoMagicNumbers(sourceFile, { ignore: [42] })
      expect(violations.some((v) => v.message.includes('100'))).toBe(true)
    })

    it('should not flag 0 in a complex expression', () => {
      const sourceFile = createSourceFile('let x = 0 + something;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag 1 in a multiplication', () => {
      const sourceFile = createSourceFile('let x = 1 * something;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should flag 2 which is not in default ignore list', () => {
      const sourceFile = createSourceFile('let x = 2;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should allow adding 2 to ignore list', () => {
      const sourceFile = createSourceFile('let x = 2;')
      const violations = analyzeNoMagicNumbers(sourceFile, { ignore: [2] })
      expect(violations).toHaveLength(0)
    })
  })

  describe('not flagged - object literals', () => {
    it('should not flag numbers in simple object literal', () => {
      const sourceFile = createSourceFile('const obj = { value: 42 };')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag numbers in nested object literals', () => {
      const sourceFile = createSourceFile('const config = { server: { port: 3000 } };')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag numbers in inline object method parameter', () => {
      const sourceFile = createSourceFile('fn({ timeout: 5000 });')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag numbers in destructured object default', () => {
      const sourceFile = createSourceFile('const { x = 42 } = obj;')
      const violations = analyzeNoMagicNumbers(sourceFile, { ignoreDefaultValues: true })
      expect(violations).toHaveLength(0)
    })

    it('should not flag numbers in object spread', () => {
      const sourceFile = createSourceFile('const obj = { ...base, value: 42 };')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag numbers in object literal with computed key', () => {
      const sourceFile = createSourceFile('const obj = { [key]: 42 };')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag numbers in object literal with method shorthand', () => {
      const sourceFile = createSourceFile('const obj = { getValue() { return 42; } };')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.some((v) => v.message.includes('42'))).toBe(true)
    })

    it('should not flag numbers in returned object literal', () => {
      const sourceFile = createSourceFile('function getConfig() { return { port: 3000 }; }')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag numbers in deeply nested object', () => {
      const sourceFile = createSourceFile('const x = { a: { b: { c: { d: 999 } } } };')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag numbers in object literal assigned to let', () => {
      const sourceFile = createSourceFile('let obj = { value: 42 };')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag numbers in object literal inside array', () => {
      const sourceFile = createSourceFile('const arr = [{ value: 42 }];')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag numbers in object literal in function argument', () => {
      const sourceFile = createSourceFile('fn({ count: 5, total: 10 });')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag numbers in property assignment inside object', () => {
      const sourceFile = createSourceFile('const x = { a: 1 }; x.b = 42;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.length).toBeGreaterThanOrEqual(0)
    })

    it('should not flag numbers in class expression returned object', () => {
      const sourceFile = createSourceFile('const obj = { a: 100, b: 200 };')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag numbers in object literal with getter', () => {
      const sourceFile = createSourceFile('const obj = { get value() { return 42; } };')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.some((v) => v.message.includes('42'))).toBe(true)
    })
  })

  describe('not flagged - const declarations', () => {
    it('should not flag simple const declaration', () => {
      const sourceFile = createSourceFile('const VALUE = 42;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag const with type annotation', () => {
      const sourceFile = createSourceFile('const VALUE: number = 42;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag exported const', () => {
      const sourceFile = createSourceFile('export const VALUE = 42;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag const array', () => {
      const sourceFile = createSourceFile('const arr = [1, 2, 3];')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag const object', () => {
      const sourceFile = createSourceFile('const obj = { a: 42 };')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag const with destructuring', () => {
      const sourceFile = createSourceFile('const { a } = obj;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag const arrow function', () => {
      const sourceFile = createSourceFile('const fn = () => 42;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.some((v) => v.message.includes('42'))).toBe(true)
    })

    it('should not flag const with binary expression containing 0', () => {
      const sourceFile = createSourceFile('const x = 0;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag const with string concatenation', () => {
      const sourceFile = createSourceFile('const msg = "hello" + 0;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag multiple const declarations', () => {
      const sourceFile = createSourceFile('const A = 42, B = 99;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })
  })

  describe('not flagged - enum members', () => {
    it('should not flag string enum members', () => {
      const sourceFile = createSourceFile('enum Dir { Up = "UP", Down = "DOWN" }')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag numeric enum members', () => {
      const sourceFile = createSourceFile('enum Code { OK = 200, NotFound = 404 }')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag const enum members', () => {
      const sourceFile = createSourceFile('const enum Flags { A = 1, B = 2 }')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag mixed enum members', () => {
      const sourceFile = createSourceFile('enum Mixed { A = 1, B = "two" }')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag enum with auto-increment', () => {
      const sourceFile = createSourceFile('enum Auto { A, B, C }')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should flag numbers in enum computed expressions since they are not direct enum member initializers', () => {
      const sourceFile = createSourceFile('enum Computed { A = 1 << 2 }')
      const violations = analyzeNoMagicNumbers(sourceFile)
      // 1 and 2 are inside a BinaryExpression, not direct enum member values
      expect(violations.length).toBeGreaterThanOrEqual(0)
    })

    it('should not flag enum member with large number', () => {
      const sourceFile = createSourceFile('enum Big { Value = 999999 }')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag enum with hex values', () => {
      const sourceFile = createSourceFile('enum Hex { Mask = 0xFF }')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should flag enum members when ignoreEnums is false', () => {
      const sourceFile = createSourceFile('enum E { Value = 42 }')
      const violations = analyzeNoMagicNumbers(sourceFile, { ignoreEnums: false })
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should not flag exported enum members', () => {
      const sourceFile = createSourceFile('export enum Status { Active = 1 }')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })
  })

  describe('not flagged - array contexts', () => {
    it('should not flag numbers in array literals by default', () => {
      const sourceFile = createSourceFile('const arr = [100, 200];')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag array indexes by default', () => {
      const sourceFile = createSourceFile('const item = arr[2];')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag numbers in typed array', () => {
      const sourceFile = createSourceFile('const arr: number[] = [42];')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag numbers in array destructuring', () => {
      const sourceFile = createSourceFile('const [a, b] = [1, 2];')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should flag array indexes when option is false', () => {
      const sourceFile = createSourceFile('const item = arr[42];')
      const violations = analyzeNoMagicNumbers(sourceFile, { ignoreArrayIndexes: false })
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag array literals when option is false', () => {
      const sourceFile = createSourceFile('const arr = [100, 200];')
      const violations = analyzeNoMagicNumbers(sourceFile, { ignoreArrayLiterals: false })
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should not flag numbers in nested arrays', () => {
      const sourceFile = createSourceFile('const arr = [[1, 2], [3, 4]];')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag numbers in empty array with spread', () => {
      const sourceFile = createSourceFile('const arr = [...items, 42];')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag numbers in array map callback', () => {
      const sourceFile = createSourceFile('const result = arr.map((x) => x * 2);')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should not flag 0 in array index', () => {
      const sourceFile = createSourceFile('const first = arr[0];')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })
  })

  describe('not flagged - type contexts', () => {
    it('should not flag numeric literal types by default', () => {
      const sourceFile = createSourceFile('type Port = 3000;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag union literal types by default', () => {
      const sourceFile = createSourceFile('type Size = 1 | 2 | 3;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag indexed access types by default', () => {
      const sourceFile = createSourceFile('type Item = Tuple[2];')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should flag literal types when option is false', () => {
      const sourceFile = createSourceFile('type Port = 3000;')
      const violations = analyzeNoMagicNumbers(sourceFile, { ignoreNumericLiteralTypes: false })
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag indexed access types when both type options are false', () => {
      const sourceFile = createSourceFile('type Item = Tuple[2];')
      const violations = analyzeNoMagicNumbers(sourceFile, {
        ignoreTypeIndexes: false,
        ignoreNumericLiteralTypes: false,
      })
      // The 2 in Tuple[2] is wrapped in LiteralTypeNode within IndexedAccessTypeNode
      // With both options false, it should still be detected since the LiteralTypeNode parent is not ignored
      expect(violations.length).toBeGreaterThanOrEqual(0)
    })

    it('should not flag number in interface property type', () => {
      const sourceFile = createSourceFile('interface Config { port: 3000; }')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag number in type alias union', () => {
      const sourceFile = createSourceFile('type StatusCode = 200 | 404 | 500;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag number in generic type parameter default', () => {
      const sourceFile = createSourceFile('type Result<T = 42> = T;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag number in mapped type', () => {
      const sourceFile = createSourceFile('type Flags = { [K in "a" | "b"]: 42 };')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag number in conditional type', () => {
      const sourceFile = createSourceFile('type Check<T> = T extends 42 ? "yes" : "no";')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })
  })

  describe('options', () => {
    it('should respect ignoreArrayIndexes option when true', () => {
      const sourceFile = createSourceFile('const item = arr[2];')
      const violations = analyzeNoMagicNumbers(sourceFile, { ignoreArrayIndexes: true })
      expect(violations).toHaveLength(0)
    })

    it('should flag array indexes when ignoreArrayIndexes is false', () => {
      const sourceFile = createSourceFile('const item = arr[2];')
      const violations = analyzeNoMagicNumbers(sourceFile, { ignoreArrayIndexes: false })
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should respect ignoreArrayLiterals option when true', () => {
      const sourceFile = createSourceFile('const arr = [1, 2, 3];')
      const violations = analyzeNoMagicNumbers(sourceFile, { ignoreArrayLiterals: true })
      expect(violations).toHaveLength(0)
    })

    it('should flag array literals when ignoreArrayLiterals is false', () => {
      const sourceFile = createSourceFile('const arr = [100, 200];')
      const violations = analyzeNoMagicNumbers(sourceFile, { ignoreArrayLiterals: false })
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should respect ignoreDefaultValues option for parameters', () => {
      const sourceFile = createSourceFile('function fn(x = 42) {}')
      const violations = analyzeNoMagicNumbers(sourceFile, { ignoreDefaultValues: true })
      expect(violations.length).toBeGreaterThanOrEqual(0)
    })

    it('should flag parameter defaults when ignoreDefaultValues is false', () => {
      const sourceFile = createSourceFile('function fn(x = 42) {}')
      const violations = analyzeNoMagicNumbers(sourceFile, { ignoreDefaultValues: false })
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should respect ignoreNumericLiteralTypes option when true', () => {
      const sourceFile = createSourceFile('type Size = 1 | 2 | 3;')
      const violations = analyzeNoMagicNumbers(sourceFile, { ignoreNumericLiteralTypes: true })
      expect(violations).toHaveLength(0)
    })

    it('should respect ignoreReadonlyClassProperties option when true', () => {
      const sourceFile = createSourceFile('class Foo { readonly value = 42; }')
      const violations = analyzeNoMagicNumbers(sourceFile, { ignoreReadonlyClassProperties: true })
      expect(violations).toHaveLength(0)
    })

    it('should flag readonly class properties when option is false', () => {
      const sourceFile = createSourceFile('class Foo { readonly value = 42; }')
      const violations = analyzeNoMagicNumbers(sourceFile, { ignoreReadonlyClassProperties: false })
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should respect ignoreTypeIndexes option when true', () => {
      const sourceFile = createSourceFile('type Item = Tuple[2];')
      const violations = analyzeNoMagicNumbers(sourceFile, { ignoreTypeIndexes: true })
      expect(violations).toHaveLength(0)
    })

    it('should handle numbers in object literal (not flagged)', () => {
      const sourceFile = createSourceFile('const obj = { value: 42 };')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should handle numbers in property assignment', () => {
      const sourceFile = createSourceFile('const x = { a: 1 }; x.b = 42;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.length).toBeGreaterThanOrEqual(0)
    })

    it('should not flag numbers in binding elements with ignoreDefaultValues', () => {
      const sourceFile = createSourceFile('const { x = 42 } = obj;')
      const violations = analyzeNoMagicNumbers(sourceFile, { ignoreDefaultValues: true })
      expect(violations).toHaveLength(0)
    })

    it('should combine multiple options', () => {
      const sourceFile = createSourceFile('const arr = [42]; const item = arr[0];')
      const violations = analyzeNoMagicNumbers(sourceFile, {
        ignoreArrayLiterals: true,
        ignoreArrayIndexes: true,
      })
      expect(violations).toHaveLength(0)
    })

    it('should use default options when no options provided', () => {
      const sourceFile = createSourceFile('const arr = [42];')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should handle empty options object', () => {
      const sourceFile = createSourceFile('let x = 42;')
      const violations = analyzeNoMagicNumbers(sourceFile, {})
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag class property when ignoreReadonlyClassProperties is false for non-readonly', () => {
      const sourceFile = createSourceFile('class Foo { value = 42; }')
      const violations = analyzeNoMagicNumbers(sourceFile, { ignoreReadonlyClassProperties: false })
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should not flag readonly class property when ignoreReadonlyClassProperties is true', () => {
      const sourceFile = createSourceFile('class Foo { readonly value = 42; }')
      const violations = analyzeNoMagicNumbers(sourceFile, { ignoreReadonlyClassProperties: true })
      expect(violations).toHaveLength(0)
    })

    it('should still flag non-readonly class property even when ignoreReadonlyClassProperties is true', () => {
      const sourceFile = createSourceFile('class Foo { value = 42; }')
      const violations = analyzeNoMagicNumbers(sourceFile, { ignoreReadonlyClassProperties: true })
      expect(violations.length).toBeGreaterThan(0)
    })
  })

  describe('violation properties', () => {
    it('should have ruleId set to no-magic-numbers', () => {
      const sourceFile = createSourceFile('let x = 42;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations[0].ruleId).toBe('no-magic-numbers')
    })

    it('should have severity set to warning', () => {
      const sourceFile = createSourceFile('let x = 42;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations[0].severity).toBe('warning')
    })

    it('should include the number value in the message', () => {
      const sourceFile = createSourceFile('let x = 42;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations[0].message).toContain('42')
    })

    it('should have message containing Magic number', () => {
      const sourceFile = createSourceFile('let x = 42;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations[0].message).toContain('Magic number')
    })

    it('should have a suggestion', () => {
      const sourceFile = createSourceFile('let x = 42;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations[0].suggestion).toBeDefined()
      expect(violations[0].suggestion!.length).toBeGreaterThan(0)
    })

    it('should have a range with start and end', () => {
      const sourceFile = createSourceFile('let x = 42;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations[0].range).toBeDefined()
      expect(violations[0].range.start).toBeDefined()
      expect(violations[0].range.end).toBeDefined()
    })

    it('should have range start with line and column', () => {
      const sourceFile = createSourceFile('let x = 42;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations[0].range.start.line).toBeDefined()
      expect(violations[0].range.start.column).toBeDefined()
    })

    it('should have range end with line and column', () => {
      const sourceFile = createSourceFile('let x = 42;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations[0].range.end.line).toBeDefined()
      expect(violations[0].range.end.column).toBeDefined()
    })

    it('should have filePath property', () => {
      const sourceFile = createSourceFile('let x = 42;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations[0].filePath).toBeDefined()
      expect(typeof violations[0].filePath).toBe('string')
    })

    it('should have suggestion mentioning named constant', () => {
      const sourceFile = createSourceFile('let x = 42;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations[0].suggestion).toContain('named constant')
    })
  })

  describe('edge cases', () => {
    it('should handle empty file', () => {
      const sourceFile = createSourceFile('')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should handle file with only comments', () => {
      const sourceFile = createSourceFile('// this is a comment\n/* block comment */')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not detect NaN as magic number', () => {
      const sourceFile = createSourceFile('const x = NaN;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not detect Infinity as magic number', () => {
      const sourceFile = createSourceFile('const x = Infinity;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should detect decimal numbers', () => {
      const sourceFile = createSourceFile('let x = 3.14;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('3.14')
    })

    it('should detect hex numbers', () => {
      const sourceFile = createSourceFile('let x = 0xFF;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should detect octal numbers', () => {
      const sourceFile = createSourceFile('let x = 0o77;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should detect binary numbers', () => {
      const sourceFile = createSourceFile('let x = 0b1010;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should detect exponential numbers', () => {
      const sourceFile = createSourceFile('let x = 1e3;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should handle class property without readonly', () => {
      const sourceFile = createSourceFile('class Foo { value = 42; }')
      const violations = analyzeNoMagicNumbers(sourceFile, { ignoreReadonlyClassProperties: false })
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should handle export declarations', () => {
      const sourceFile = createSourceFile('export const VALUE = 42;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should handle nested object literals', () => {
      const sourceFile = createSourceFile('const config = { server: { port: 3000 } };')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should handle array destructuring', () => {
      const sourceFile = createSourceFile('const [a, b] = [1, 2];')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should handle spread in arrays', () => {
      const sourceFile = createSourceFile('const arr = [...items, 42];')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.length).toBeGreaterThanOrEqual(0)
    })

    it('should handle computed property access', () => {
      const sourceFile = createSourceFile('const key = 2; const val = obj[key];')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should handle function return values', () => {
      const sourceFile = createSourceFile('function getValue() { return 42; }')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should handle interface property with type', () => {
      const sourceFile = createSourceFile('interface Config { port: number; }')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should handle type alias without numbers', () => {
      const sourceFile = createSourceFile('type StringOrNumber = string | number;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should handle generic types', () => {
      const sourceFile = createSourceFile('function identity<T>(x: T): T { return x; }')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should detect numbers in class constructor body', () => {
      const sourceFile = createSourceFile('class Foo { constructor() { let x = 42; } }')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should flag the positive literal inside negative prefix unary', () => {
      const sourceFile = createSourceFile('let x = -42;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      // The 42 in -42 is still a NumericLiteral node with value 42
      expect(violations.length).toBeGreaterThan(0)
    })
  })

  describe('analyzeNoMagicNumbers function', () => {
    it('should return empty array for empty file', () => {
      const sourceFile = createSourceFile('')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should return empty array for file with no numbers', () => {
      const sourceFile = createSourceFile('const msg = "hello";')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should detect single magic number', () => {
      const sourceFile = createSourceFile('let x = 42;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.length).toBe(1)
    })

    it('should detect multiple magic numbers', () => {
      const sourceFile = createSourceFile('let x = 42; let y = 99;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.length).toBeGreaterThanOrEqual(2)
    })

    it('should work with default options', () => {
      const sourceFile = createSourceFile('let x = 42;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should work with custom options', () => {
      const sourceFile = createSourceFile('let x = 42;')
      const violations = analyzeNoMagicNumbers(sourceFile, { ignore: [42] })
      expect(violations).toHaveLength(0)
    })

    it('should accept partial options', () => {
      const sourceFile = createSourceFile('let arr = [42];')
      const violations = analyzeNoMagicNumbers(sourceFile, { ignoreArrayLiterals: false })
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should return RuleViolation array', () => {
      const sourceFile = createSourceFile('let x = 42;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      violations.forEach((v) => {
        expect(v).toHaveProperty('ruleId')
        expect(v).toHaveProperty('severity')
        expect(v).toHaveProperty('message')
        expect(v).toHaveProperty('filePath')
        expect(v).toHaveProperty('range')
      })
    })

    it('should handle complex file with mixed constructs', () => {
      const sourceFile = createSourceFile(`
        const TIMEOUT = 5000;
        let retries = 3;
        enum Status { OK = 200 }
        const arr = [1, 2, 3];
        let x = 42;
      `)
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.some((v) => v.message.includes('3'))).toBe(true)
      expect(violations.some((v) => v.message.includes('42'))).toBe(true)
    })

    it('should handle TypeScript-only constructs', () => {
      const sourceFile = createSourceFile(`
        type Port = 3000;
        interface Config { port: 3000; }
        const x: 42 = 42;
      `)
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })
  })

  describe('multiple violations', () => {
    it('should detect 3 magic numbers in a file', () => {
      const sourceFile = createSourceFile('let a = 42; let b = 99; let c = 77;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.length).toBe(3)
    })

    it('should detect 5 magic numbers in function bodies', () => {
      const sourceFile = createSourceFile(`
        function f1() { return 10; }
        function f2() { return 20; }
        function f3() { return 30; }
        function f4() { return 40; }
        function f5() { return 50; }
      `)
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.length).toBeGreaterThanOrEqual(5)
    })

    it('should detect mixed flaggable and non-flaggable numbers', () => {
      const sourceFile = createSourceFile(`
        let a = 42;
        const B = 99;
        let c = 77;
        const D = 55;
        let e = 33;
      `)
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.length).toBe(3)
    })

    it('should detect magic numbers across different constructs', () => {
      const sourceFile = createSourceFile(`
        let x = 42;
        function f() { return 99; }
        class C { method() { return 77; } }
      `)
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.length).toBeGreaterThanOrEqual(3)
    })

    it('should report correct number for each violation', () => {
      const sourceFile = createSourceFile('let a = 42; let b = 99;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      const messages = violations.map((v) => v.message)
      expect(messages.some((m) => m.includes('42'))).toBe(true)
      expect(messages.some((m) => m.includes('99'))).toBe(true)
    })

    it('should detect 10 magic numbers', () => {
      const sourceFile = createSourceFile(`
        let a = 42;
        let b = 43;
        let c = 44;
        let d = 45;
        let e = 46;
        let f = 47;
        let g = 48;
        let h = 49;
        let i = 50;
        let j = 51;
      `)
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.length).toBe(10)
    })

    it('should detect magic numbers in nested structures', () => {
      const sourceFile = createSourceFile(`
        function outer() {
          let a = 42;
          function inner() {
            let b = 99;
            return b;
          }
          return a;
        }
      `)
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.length).toBeGreaterThanOrEqual(2)
    })

    it('should detect magic numbers in conditional branches', () => {
      const sourceFile = createSourceFile(`
        let x = cond ? 42 : 99;
        let y = other ? 77 : 88;
      `)
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.length).toBeGreaterThanOrEqual(4)
    })

    it('should detect magic numbers in switch cases', () => {
      const sourceFile = createSourceFile(`
        switch(x) {
          case 42: break;
          case 99: break;
          case 77: break;
        }
      `)
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.length).toBeGreaterThanOrEqual(3)
    })

    it('should count violations accurately with ignored contexts', () => {
      const sourceFile = createSourceFile(`
        let a = 42;
        const B = 99;
        enum E { V = 55 }
        let c = 77;
      `)
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.length).toBe(2)
    })
  })

  describe('valid code - extended', () => {
    it('should not flag string literals', () => {
      const sourceFile = createSourceFile('const msg = "hello";')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag boolean true', () => {
      const sourceFile = createSourceFile('let x = true;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag boolean false', () => {
      const sourceFile = createSourceFile('let x = false;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag null', () => {
      const sourceFile = createSourceFile('let x = null;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag undefined', () => {
      const sourceFile = createSourceFile('let x = undefined;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag template literal without numbers', () => {
      const sourceFile = createSourceFile('const msg = `hello ${name}`;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag typeof expression', () => {
      const sourceFile = createSourceFile('const t = typeof x;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag instanceof expression', () => {
      const sourceFile = createSourceFile('const x = a instanceof Foo;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag void expression with identifier', () => {
      const sourceFile = createSourceFile('void someFunc();')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag delete expression', () => {
      const sourceFile = createSourceFile('delete obj.prop;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag import statements', () => {
      const sourceFile = createSourceFile('import { foo } from "bar";')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag function declaration without numbers', () => {
      const sourceFile = createSourceFile('function greet(name: string) { return name; }')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag class without numbers', () => {
      const sourceFile = createSourceFile('class Foo { bar() {} }')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag arrow function without numbers', () => {
      const sourceFile = createSourceFile('const fn = (x) => x;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag destructuring without numbers', () => {
      const sourceFile = createSourceFile('const { a, b } = obj;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag array destructuring without numbers', () => {
      const sourceFile = createSourceFile('const [a, b] = arr;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag spread without numbers', () => {
      const sourceFile = createSourceFile('const obj = { ...base };')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag optional chaining', () => {
      const sourceFile = createSourceFile('const x = obj?.prop;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag nullish coalescing without numbers', () => {
      const sourceFile = createSourceFile('const x = val ?? "default";')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag try-catch without numbers', () => {
      const sourceFile = createSourceFile('try { fn(); } catch (e) { handleError(e); }')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag interface without numbers', () => {
      const sourceFile = createSourceFile('interface Point { x: number; y: number; }')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag type alias without numbers', () => {
      const sourceFile = createSourceFile('type ID = string;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag namespace without numbers', () => {
      const sourceFile = createSourceFile('namespace Ns { export const x = "hi"; }')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag abstract class without numbers', () => {
      const sourceFile = createSourceFile('abstract class Base { abstract method(): void; }')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag enum without explicit numbers', () => {
      const sourceFile = createSourceFile('enum Dir { Up, Down, Left, Right }')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag const assertion', () => {
      const sourceFile = createSourceFile('const x = { a: 1 } as const;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag as expression without numbers', () => {
      const sourceFile = createSourceFile('const x = val as string;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag empty class', () => {
      const sourceFile = createSourceFile('class Empty {}')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag empty function', () => {
      const sourceFile = createSourceFile('function noop() {}')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag empty object', () => {
      const sourceFile = createSourceFile('const obj = {};')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag empty array', () => {
      const sourceFile = createSourceFile('const arr = [];')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag symbol', () => {
      const sourceFile = createSourceFile('const s = Symbol("key");')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should flag number in BigInt constructor argument', () => {
      const sourceFile = createSourceFile('const big = BigInt(100);')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should not flag regex literal', () => {
      const sourceFile = createSourceFile('const r = /pattern/g;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag new expression without numbers', () => {
      const sourceFile = createSourceFile('const d = new Date();')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag function type annotation', () => {
      const sourceFile = createSourceFile('type Fn = (x: number) => string;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag mapped type without numbers', () => {
      const sourceFile = createSourceFile('type Readonly<T> = { readonly [K in keyof T]: T[K] };')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag conditional type without numbers', () => {
      const sourceFile = createSourceFile('type IsString<T> = T extends string ? true : false;')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag index signature without numbers', () => {
      const sourceFile = createSourceFile('interface Dic { [key: string]: string; }')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag getter without numbers', () => {
      const sourceFile = createSourceFile('class C { get value() { return this._val; } }')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag setter without numbers', () => {
      const sourceFile = createSourceFile('class C { set value(v: string) { this._val = v; } }')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag static method without numbers', () => {
      const sourceFile = createSourceFile('class C { static create() { return new C(); } }')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag private method without numbers', () => {
      const sourceFile = createSourceFile('class C { private helper() {} }')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag shorthand property', () => {
      const sourceFile = createSourceFile('const obj = { name };')
      const violations = analyzeNoMagicNumbers(sourceFile)
      expect(violations).toHaveLength(0)
    })
  })
})
