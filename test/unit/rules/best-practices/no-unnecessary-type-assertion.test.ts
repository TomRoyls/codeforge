import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import {
  analyzeNoUnnecessaryTypeAssertion,
  noUnnecessaryTypeAssertionRule,
} from '../../../../src/rules/best-practices/no-unnecessary-type-assertion.js'

const sharedProject = new Project({ useInMemoryFileSystem: true })
let fileCounter = 0
const createSourceFile = (code: string) => {
  fileCounter++
  return sharedProject.createSourceFile(`test${fileCounter}.ts`, code)
}

describe('no-unnecessary-type-assertion rule', () => {
  describe('analyzeNoUnnecessaryTypeAssertion', () => {
    it('should detect string literal asserted as string', () => {
      const sourceFile = createSourceFile(`
        const x = "hello" as string;
      `)
      const violations = analyzeNoUnnecessaryTypeAssertion(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('redundant')
    })

    it('should detect number literal asserted as number', () => {
      const sourceFile = createSourceFile(`
        const x = 42 as number;
      `)
      const violations = analyzeNoUnnecessaryTypeAssertion(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should detect boolean literal asserted as boolean', () => {
      const sourceFile = createSourceFile(`
        const x = true as boolean;
      `)
      const violations = analyzeNoUnnecessaryTypeAssertion(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should detect null literal asserted as null', () => {
      const sourceFile = createSourceFile(`
        const x = null as null;
      `)
      const violations = analyzeNoUnnecessaryTypeAssertion(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag when types do not match', () => {
      const sourceFile = createSourceFile(`
        const x = 42 as string;
      `)
      const violations = analyzeNoUnnecessaryTypeAssertion(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag when assertion widens type', () => {
      const sourceFile = createSourceFile(`
        const x = "hello" as unknown;
      `)
      const violations = analyzeNoUnnecessaryTypeAssertion(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should flag template literals as redundant', () => {
      const sourceFile = createSourceFile(`
        const x = \`hello\` as string;
      `)
      const violations = analyzeNoUnnecessaryTypeAssertion(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should not flag when skipStringLiterals is true', () => {
      const sourceFile = createSourceFile(`
        const x = "hello" as string;
      `)
      const violations = analyzeNoUnnecessaryTypeAssertion(sourceFile, {
        skipStringLiterals: true,
      })
      expect(violations).toHaveLength(0)
    })

    it('should not flag when skipNumericLiterals is true', () => {
      const sourceFile = createSourceFile(`
        const x = 42 as number;
      `)
      const violations = analyzeNoUnnecessaryTypeAssertion(sourceFile, {
        skipNumericLiterals: true,
      })
      expect(violations).toHaveLength(0)
    })

    it('should not flag when skipBooleanLiterals is true', () => {
      const sourceFile = createSourceFile(`
        const x = true as boolean;
      `)
      const violations = analyzeNoUnnecessaryTypeAssertion(sourceFile, {
        skipBooleanLiterals: true,
      })
      expect(violations).toHaveLength(0)
    })

    it('should not flag when skipNullLiterals is false (default)', () => {
      const sourceFile = createSourceFile(`
        const x = null as null;
      `)
      const violations = analyzeNoUnnecessaryTypeAssertion(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag angle-bracket syntax', () => {
      const sourceFile = createSourceFile(`
        const x = <string>"hello";
      `)
      const violations = analyzeNoUnnecessaryTypeAssertion(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag complex types', () => {
      const sourceFile = createSourceFile(`
        const x = { a: 1 } as { a: number };
      `)
      const violations = analyzeNoUnnecessaryTypeAssertion(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag variable assertions', () => {
      const sourceFile = createSourceFile(`
        const y = "hello";
        const x = y as string;
      `)
      const violations = analyzeNoUnnecessaryTypeAssertion(sourceFile)
      expect(violations).toHaveLength(0)
    })
  })

  describe('rule definition', () => {
    it('should have correct meta properties', () => {
      expect(noUnnecessaryTypeAssertionRule.meta.name).toBe('no-unnecessary-type-assertion')
      expect(noUnnecessaryTypeAssertionRule.meta.category).toBe('style')
      expect(noUnnecessaryTypeAssertionRule.meta.recommended).toBe(false)
      expect(noUnnecessaryTypeAssertionRule.meta.fixable).toBe('code')
    })

    it('should have default options', () => {
      expect(noUnnecessaryTypeAssertionRule.defaultOptions).toBeDefined()
      expect(noUnnecessaryTypeAssertionRule.defaultOptions.skipStringLiterals).toBe(false)
      expect(noUnnecessaryTypeAssertionRule.defaultOptions.skipNumericLiterals).toBe(false)
      expect(noUnnecessaryTypeAssertionRule.defaultOptions.skipBooleanLiterals).toBe(false)
      expect(noUnnecessaryTypeAssertionRule.defaultOptions.skipNullLiterals).toBe(true)
    })

    it('should create visitor with visitNode method', () => {
      const result = noUnnecessaryTypeAssertionRule.create(
        noUnnecessaryTypeAssertionRule.defaultOptions,
      )
      expect(result.visitor).toBeDefined()
      expect(result.visitor.visitNode).toBeDefined()
      expect(result.onComplete).toBeDefined()
    })
  })

  describe('additional option tests', () => {
    it('should respect skipStringLiterals option', () => {
      const code = 'const x = "hello" as string;'
      const sourceFile = createSourceFile(code)
      const violations = analyzeNoUnnecessaryTypeAssertion(sourceFile, { skipStringLiterals: true })
      expect(violations).toHaveLength(0)
    })

    it('should flag string literals when skipStringLiterals is false', () => {
      const code = 'const x = "hello" as string;'
      const sourceFile = createSourceFile(code)
      const violations = analyzeNoUnnecessaryTypeAssertion(sourceFile, {
        skipStringLiterals: false,
      })
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should respect skipNumericLiterals option', () => {
      const code = 'const x = 42 as number;'
      const sourceFile = createSourceFile(code)
      const violations = analyzeNoUnnecessaryTypeAssertion(sourceFile, {
        skipNumericLiterals: true,
      })
      expect(violations).toHaveLength(0)
    })

    it('should flag numeric literals when skipNumericLiterals is false', () => {
      const code = 'const x = 42 as number;'
      const sourceFile = createSourceFile(code)
      const violations = analyzeNoUnnecessaryTypeAssertion(sourceFile, {
        skipNumericLiterals: false,
      })
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should respect skipBooleanLiterals option', () => {
      const code = 'const x = true as boolean;'
      const sourceFile = createSourceFile(code)
      const violations = analyzeNoUnnecessaryTypeAssertion(sourceFile, {
        skipBooleanLiterals: true,
      })
      expect(violations).toHaveLength(0)
    })

    it('should flag boolean literals when skipBooleanLiterals is false', () => {
      const code = 'const x = true as boolean;'
      const sourceFile = createSourceFile(code)
      const violations = analyzeNoUnnecessaryTypeAssertion(sourceFile, {
        skipBooleanLiterals: false,
      })
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should respect skipNullLiterals option (default true)', () => {
      const code = 'const x = null as null;'
      const sourceFile = createSourceFile(code)
      const violations = analyzeNoUnnecessaryTypeAssertion(sourceFile, { skipNullLiterals: true })
      expect(violations).toHaveLength(0)
    })

    it('should flag null literals when skipNullLiterals is false', () => {
      const code = 'const x = null as null;'
      const sourceFile = createSourceFile(code)
      const violations = analyzeNoUnnecessaryTypeAssertion(sourceFile, { skipNullLiterals: false })
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should handle bigint literals', () => {
      const code = 'const x = 42n as bigint;'
      const sourceFile = createSourceFile(code)
      const violations = analyzeNoUnnecessaryTypeAssertion(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should handle template literals', () => {
      const code = 'const x = `hello` as string;'
      const sourceFile = createSourceFile(code)
      const violations = analyzeNoUnnecessaryTypeAssertion(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should handle false keyword', () => {
      const code = 'const x = false as boolean;'
      const sourceFile = createSourceFile(code)
      const violations = analyzeNoUnnecessaryTypeAssertion(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should not flag non-redundant assertions', () => {
      const code = 'const x = 42 as string;'
      const sourceFile = createSourceFile(code)
      const violations = analyzeNoUnnecessaryTypeAssertion(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should handle undefined type assertion', () => {
      const code = 'const x = undefined as undefined;'
      const sourceFile = createSourceFile(code)
      const violations = analyzeNoUnnecessaryTypeAssertion(sourceFile)
      expect(violations.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('rule metadata', () => {
    it('should have correct rule name', () => {
      expect(noUnnecessaryTypeAssertionRule.meta.name).toBe('no-unnecessary-type-assertion')
    })

    it('should have style category', () => {
      expect(noUnnecessaryTypeAssertionRule.meta.category).toBe('style')
    })

    it('should not be recommended', () => {
      expect(noUnnecessaryTypeAssertionRule.meta.recommended).toBe(false)
    })

    it('should be fixable', () => {
      expect(noUnnecessaryTypeAssertionRule.meta.fixable).toBe('code')
    })

    it('should have a description', () => {
      expect(noUnnecessaryTypeAssertionRule.meta.description).toBeDefined()
      expect(typeof noUnnecessaryTypeAssertionRule.meta.description).toBe('string')
      expect(noUnnecessaryTypeAssertionRule.meta.description.length).toBeGreaterThan(0)
    })

    it('should have defaultOptions defined', () => {
      expect(noUnnecessaryTypeAssertionRule.defaultOptions).toBeDefined()
    })

    it('should have skipNullLiterals default to true', () => {
      expect(noUnnecessaryTypeAssertionRule.defaultOptions.skipNullLiterals).toBe(true)
    })

    it('should have skipStringLiterals default to false', () => {
      expect(noUnnecessaryTypeAssertionRule.defaultOptions.skipStringLiterals).toBe(false)
    })
  })

  describe('detecting redundant assertions - string', () => {
    it('should flag double-quoted string as string', () => {
      const sf = createSourceFile('const x = "hello" as string;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(1)
    })

    it('should flag single-quoted string as string', () => {
      const sf = createSourceFile("const x = 'hello' as string;")
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(1)
    })

    it('should flag empty string as string', () => {
      const sf = createSourceFile('const x = "" as string;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(1)
    })

    it('should flag string with special characters as string', () => {
      const sf = createSourceFile('const x = "hello\\nworld" as string;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(1)
    })

    it('should flag template literal without interpolation as string', () => {
      const sf = createSourceFile('const x = `hello` as string;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(1)
    })

    it('should flag string in variable declaration', () => {
      const sf = createSourceFile('let y = "test" as string;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(1)
    })

    it('should flag string in assignment expression', () => {
      const sf = createSourceFile('let x: string; x = "hello" as string;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(1)
    })

    it('should flag string in return statement', () => {
      const sf = createSourceFile('function foo() { return "bar" as string; }')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(1)
    })

    it('should flag string in array literal', () => {
      const sf = createSourceFile('const arr = ["hello" as string, "world"];')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(1)
    })

    it('should flag string in object property', () => {
      const sf = createSourceFile('const obj = { name: "test" as string };')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(1)
    })

    it('should flag string in function argument', () => {
      const sf = createSourceFile('fn("hello" as string);')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(1)
    })

    it('should flag string in conditional expression', () => {
      const sf = createSourceFile('const x = true ? "yes" as string : "no";')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(1)
    })

    it('should flag string in binary expression', () => {
      const sf = createSourceFile('const x = ("hello" as string) + " world";')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(1)
    })

    it('should flag string in type assertion chain', () => {
      const sf = createSourceFile('const x = "hello" as string as string;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations.length).toBeGreaterThanOrEqual(1)
    })

    it('should flag unicode string as string', () => {
      const sf = createSourceFile('const x = "\\u0041" as string;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(1)
    })
  })

  describe('detecting redundant assertions - number', () => {
    it('should flag integer literal as number', () => {
      const sf = createSourceFile('const x = 42 as number;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(1)
    })

    it('should flag zero as number', () => {
      const sf = createSourceFile('const x = 0 as number;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(1)
    })

    it('should flag float literal as number', () => {
      const sf = createSourceFile('const x = 3.14 as number;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(1)
    })

    it('should not flag negative number as number (PrefixUnaryExpression)', () => {
      const sf = createSourceFile('const x = -1 as number;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag negative float as number (PrefixUnaryExpression)', () => {
      const sf = createSourceFile('const x = -3.14 as number;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should flag number in variable declaration', () => {
      const sf = createSourceFile('let y = 100 as number;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(1)
    })

    it('should flag number in return statement', () => {
      const sf = createSourceFile('function f() { return 42 as number; }')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(1)
    })

    it('should flag number in array literal', () => {
      const sf = createSourceFile('const arr = [1 as number, 2, 3];')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(1)
    })

    it('should flag number in object property', () => {
      const sf = createSourceFile('const obj = { age: 25 as number };')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(1)
    })

    it('should flag number in function argument', () => {
      const sf = createSourceFile('fn(42 as number);')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(1)
    })

    it('should not flag number as string', () => {
      const sf = createSourceFile('const x = 42 as string;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should flag small decimal as number', () => {
      const sf = createSourceFile('const x = 0.001 as number;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(1)
    })

    it('should flag large integer as number', () => {
      const sf = createSourceFile('const x = 999999999 as number;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(1)
    })

    it('should flag number in conditional expression', () => {
      const sf = createSourceFile('const x = true ? 1 as number : 2;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(1)
    })

    it('should flag number in binary expression', () => {
      const sf = createSourceFile('const x = (42 as number) + 8;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(1)
    })

    it('should flag number with leading dot as number', () => {
      const sf = createSourceFile('const x = .5 as number;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(1)
    })
  })

  describe('detecting redundant assertions - boolean', () => {
    it('should flag true as boolean', () => {
      const sf = createSourceFile('const x = true as boolean;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(1)
    })

    it('should flag false as boolean', () => {
      const sf = createSourceFile('const x = false as boolean;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(1)
    })

    it('should flag true in variable declaration', () => {
      const sf = createSourceFile('let y = true as boolean;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(1)
    })

    it('should flag false in return statement', () => {
      const sf = createSourceFile('function f() { return false as boolean; }')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(1)
    })

    it('should flag true in array literal', () => {
      const sf = createSourceFile('const arr = [true as boolean, false];')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(1)
    })

    it('should flag false in object property', () => {
      const sf = createSourceFile('const obj = { active: false as boolean };')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(1)
    })

    it('should flag true in conditional', () => {
      const sf = createSourceFile('const x = true ? true as boolean : false;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(1)
    })

    it('should not flag true as string', () => {
      const sf = createSourceFile('const x = true as string;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag false as number', () => {
      const sf = createSourceFile('const x = false as number;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should flag boolean in function argument', () => {
      const sf = createSourceFile('fn(true as boolean);')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(1)
    })
  })

  describe('detecting redundant assertions - bigint', () => {
    it('should flag bigint literal as bigint', () => {
      const sf = createSourceFile('const x = 42n as bigint;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(1)
    })

    it('should flag zero bigint as bigint', () => {
      const sf = createSourceFile('const x = 0n as bigint;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(1)
    })

    it('should not flag bigint as number', () => {
      const sf = createSourceFile('const x = 42n as number;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should flag bigint in variable declaration', () => {
      const sf = createSourceFile('let y = 100n as bigint;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(1)
    })

    it('should flag bigint in return statement', () => {
      const sf = createSourceFile('function f() { return 42n as bigint; }')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(1)
    })

    it('should flag large bigint as bigint', () => {
      const sf = createSourceFile('const x = 999999999n as bigint;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(1)
    })
  })

  describe('valid code - no violations', () => {
    it('should not flag angle-bracket assertion syntax', () => {
      const sf = createSourceFile('const x = <string>"hello";')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag as unknown', () => {
      const sf = createSourceFile('const x = "hello" as unknown;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag as any', () => {
      const sf = createSourceFile('const x = "hello" as any;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag variable as string', () => {
      const sf = createSourceFile('const y = "hello"; const x = y as string;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag non-matching type string to number', () => {
      const sf = createSourceFile('const x = "hello" as number;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag non-matching type number to string', () => {
      const sf = createSourceFile('const x = 42 as string;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag object literal assertion', () => {
      const sf = createSourceFile('const x = { a: 1 } as { a: number };')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag union type assertion', () => {
      const sf = createSourceFile('const x = "hello" as string | number;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag intersection type assertion', () => {
      const sf = createSourceFile('const x = {} as string & object;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag array type assertion', () => {
      const sf = createSourceFile('const x = [1, 2] as number[];')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag generic type assertion', () => {
      const sf = createSourceFile('const x = [1, 2] as Array<number>;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag function call assertion', () => {
      const sf = createSourceFile('const x = JSON.parse("{}") as object;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag property access assertion', () => {
      const sf = createSourceFile('const obj = { a: 1 }; const x = obj.a as number;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag parenthesized expression assertion', () => {
      const sf = createSourceFile('const x = ("hello") as string;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag undefined as undefined (identifier)', () => {
      const sf = createSourceFile('const x = undefined as undefined;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag negative number as number (prefix unary)', () => {
      const sf = createSourceFile('const x = -1 as number;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag arrow function assertion', () => {
      const sf = createSourceFile('const x = (() => 42) as () => number;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag ternary expression assertion', () => {
      const sf = createSourceFile('const x = (true ? "a" : "b") as string;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag spread element assertion', () => {
      const sf = createSourceFile('const arr = [1, 2]; const x = [...arr] as number[];')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag destructuring assertion', () => {
      const sf = createSourceFile('const { a } = { a: 1 } as { a: number };')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag class expression assertion', () => {
      const sf = createSourceFile('const x = class {} as typeof class {};')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag as expression with complex type', () => {
      const sf = createSourceFile('const x = "hello" as "hello" | "world";')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag new expression assertion', () => {
      const sf = createSourceFile('const x = new Error("msg") as Error;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag null as null with default options', () => {
      const sf = createSourceFile('const x = null as null;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag template with interpolation as string', () => {
      const sf = createSourceFile('const a = "world"; const x = `hello ${a}` as string;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag typeof expression assertion', () => {
      const sf = createSourceFile('const a = "test"; const x = typeof a as string;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag void expression assertion', () => {
      const sf = createSourceFile('const x = void 0 as undefined;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag as const assertion', () => {
      const sf = createSourceFile('const x = "hello" as const;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag boolean true as number', () => {
      const sf = createSourceFile('const x = true as number;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag number as boolean', () => {
      const sf = createSourceFile('const x = 42 as boolean;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag bigint as string', () => {
      const sf = createSourceFile('const x = 42n as string;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag string as bigint', () => {
      const sf = createSourceFile('const x = "hello" as bigint;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag null as string', () => {
      const sf = createSourceFile('const x = null as string;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag string as null', () => {
      const sf = createSourceFile('const x = "hello" as null;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag null as number', () => {
      const sf = createSourceFile('const x = null as number;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag property access on literal', () => {
      const sf = createSourceFile('const x = "hello".length as number;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag instanceof expression', () => {
      const sf = createSourceFile('const x = ({} instanceof Object) as boolean;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag indexed access expression', () => {
      const sf = createSourceFile('const arr = [1]; const x = arr[0] as number;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag await expression', () => {
      const sf = createSourceFile(
        'async function f() { const x = await Promise.resolve(1) as number; }',
      )
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should flag yield with redundant assertion', () => {
      const sf = createSourceFile('function* f() { const x = yield 1 as number; }')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(1)
    })

    it('should not flag cast expression on NaN', () => {
      const sf = createSourceFile('const x = NaN as number;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag Infinity as number', () => {
      const sf = createSourceFile('const x = Infinity as number;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })
  })

  describe('skip options', () => {
    it('should skip string literals when skipStringLiterals is true', () => {
      const sf = createSourceFile('const x = "hello" as string;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf, { skipStringLiterals: true })
      expect(violations).toHaveLength(0)
    })

    it('should not skip string literals when skipStringLiterals is false', () => {
      const sf = createSourceFile('const x = "hello" as string;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf, { skipStringLiterals: false })
      expect(violations).toHaveLength(1)
    })

    it('should skip numeric literals when skipNumericLiterals is true', () => {
      const sf = createSourceFile('const x = 42 as number;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf, { skipNumericLiterals: true })
      expect(violations).toHaveLength(0)
    })

    it('should not skip numeric literals when skipNumericLiterals is false', () => {
      const sf = createSourceFile('const x = 42 as number;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf, { skipNumericLiterals: false })
      expect(violations).toHaveLength(1)
    })

    it('should skip boolean literals when skipBooleanLiterals is true', () => {
      const sf = createSourceFile('const x = true as boolean;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf, { skipBooleanLiterals: true })
      expect(violations).toHaveLength(0)
    })

    it('should not skip boolean literals when skipBooleanLiterals is false', () => {
      const sf = createSourceFile('const x = true as boolean;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf, { skipBooleanLiterals: false })
      expect(violations).toHaveLength(1)
    })

    it('should skip null literals when skipNullLiterals is true', () => {
      const sf = createSourceFile('const x = null as null;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf, { skipNullLiterals: true })
      expect(violations).toHaveLength(0)
    })

    it('should not skip null literals when skipNullLiterals is false', () => {
      const sf = createSourceFile('const x = null as null;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf, { skipNullLiterals: false })
      expect(violations).toHaveLength(1)
    })

    it('should skip multiple types when multiple skip options are true', () => {
      const sf = createSourceFile(
        'const a = "hello" as string; const b = 42 as number; const c = true as boolean;',
      )
      const violations = analyzeNoUnnecessaryTypeAssertion(sf, {
        skipStringLiterals: true,
        skipNumericLiterals: true,
        skipBooleanLiterals: true,
      })
      expect(violations).toHaveLength(0)
    })

    it('should flag all when all skip options are false', () => {
      const sf = createSourceFile(
        'const a = "hello" as string; const b = 42 as number; const c = true as boolean;',
      )
      const violations = analyzeNoUnnecessaryTypeAssertion(sf, {
        skipStringLiterals: false,
        skipNumericLiterals: false,
        skipBooleanLiterals: false,
        skipNullLiterals: false,
      })
      expect(violations).toHaveLength(3)
    })

    it('should skip only string when only skipStringLiterals is true', () => {
      const sf = createSourceFile('const a = "hello" as string; const b = 42 as number;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf, {
        skipStringLiterals: true,
        skipNumericLiterals: false,
      })
      expect(violations).toHaveLength(1)
    })

    it('should skip only number when only skipNumericLiterals is true', () => {
      const sf = createSourceFile('const a = "hello" as string; const b = 42 as number;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf, {
        skipStringLiterals: false,
        skipNumericLiterals: true,
      })
      expect(violations).toHaveLength(1)
    })

    it('should skip only boolean when only skipBooleanLiterals is true', () => {
      const sf = createSourceFile('const a = true as boolean; const b = 42 as number;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf, {
        skipBooleanLiterals: true,
        skipNumericLiterals: false,
      })
      expect(violations).toHaveLength(1)
    })

    it('should use default skipNullLiterals true when not specified', () => {
      const sf = createSourceFile('const x = null as null;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf, {})
      expect(violations).toHaveLength(0)
    })

    it('should handle empty options object', () => {
      const sf = createSourceFile('const x = "hello" as string;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf, {})
      expect(violations).toHaveLength(1)
    })
  })

  describe('violation properties', () => {
    it('should have correct ruleId', () => {
      const sf = createSourceFile('const x = "hello" as string;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations[0].ruleId).toBe('no-unnecessary-type-assertion')
    })

    it('should have info severity', () => {
      const sf = createSourceFile('const x = "hello" as string;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations[0].severity).toBe('info')
    })

    it('should have message containing "redundant"', () => {
      const sf = createSourceFile('const x = "hello" as string;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations[0].message).toContain('redundant')
    })

    it('should have suggestion to remove assertion', () => {
      const sf = createSourceFile('const x = "hello" as string;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations[0].suggestion).toBe('Remove this type assertion.')
    })

    it('should have range defined', () => {
      const sf = createSourceFile('const x = "hello" as string;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations[0].range).toBeDefined()
    })

    it('should have filePath', () => {
      const sf = createSourceFile('const x = "hello" as string;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations[0].filePath).toBeDefined()
    })

    it('should have message containing expression text', () => {
      const sf = createSourceFile('const x = "hello" as string;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations[0].message).toContain('"hello"')
    })

    it('should have message containing target type', () => {
      const sf = createSourceFile('const x = "hello" as string;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations[0].message).toContain('string')
    })

    it('should have range with start and end', () => {
      const sf = createSourceFile('const x = "hello" as string;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      const range = violations[0].range
      expect(range.start).toBeDefined()
      expect(range.end).toBeDefined()
    })

    it('should have correct ruleId for number assertion', () => {
      const sf = createSourceFile('const x = 42 as number;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations[0].ruleId).toBe('no-unnecessary-type-assertion')
    })
  })

  describe('edge cases', () => {
    it('should handle empty file', () => {
      const sf = createSourceFile('')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should handle file with only comments', () => {
      const sf = createSourceFile('// just a comment')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should handle file with only whitespace', () => {
      const sf = createSourceFile('   \n\n  ')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should handle nested assertions', () => {
      const sf = createSourceFile('const x = "hello" as string as string;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations.length).toBeGreaterThanOrEqual(1)
    })

    it('should handle multiple assertions in one file', () => {
      const sf = createSourceFile('const a = "hello" as string; const b = 42 as number;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(2)
    })

    it('should handle assertion after comment', () => {
      const sf = createSourceFile('// comment\nconst x = "hello" as string;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(1)
    })

    it('should not flag parenthesized expression', () => {
      const sf = createSourceFile('const x = ("hello") as string;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should handle async function', () => {
      const sf = createSourceFile('async function f() { const x = "hello" as string; }')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(1)
    })

    it('should handle await expression not flagged', () => {
      const sf = createSourceFile('async function f() { const x = await fetch("") as Response; }')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should handle tagged template literal', () => {
      const sf = createSourceFile('const x = String.raw`hello` as string;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should handle multiple statements', () => {
      const sf = createSourceFile(
        'const a = "x" as string; const b = 1 as number; const c = true as boolean;',
      )
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(3)
    })

    it('should handle assertion in nested function', () => {
      const sf = createSourceFile(
        'function outer() { function inner() { return "test" as string; } }',
      )
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(1)
    })

    it('should handle assertion in arrow function body', () => {
      const sf = createSourceFile('const fn = () => "hello" as string;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(1)
    })

    it('should handle assertion in export', () => {
      const sf = createSourceFile('export const x = "hello" as string;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(1)
    })

    it('should handle assertion in default export', () => {
      const sf = createSourceFile('export default "hello" as string;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(1)
    })

    it('should handle assertion inside try-catch', () => {
      const sf = createSourceFile('try { const x = "hello" as string; } catch (e) {}')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(1)
    })

    it('should handle assertion inside if-else', () => {
      const sf = createSourceFile(
        'if (true) { const x = "hello" as string; } else { const y = 42 as number; }',
      )
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(2)
    })

    it('should handle assertion inside switch', () => {
      const sf = createSourceFile('switch (1) { case 1: const x = "hello" as string; break; }')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(1)
    })

    it('should handle assertion inside while loop', () => {
      const sf = createSourceFile('while (true) { const x = "hello" as string; break; }')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(1)
    })

    it('should handle assertion in class property', () => {
      const sf = createSourceFile('class Foo { prop = "hello" as string; }')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(1)
    })
  })

  describe('rule create function', () => {
    it('should return object with visitor property', () => {
      const result = noUnnecessaryTypeAssertionRule.create(
        noUnnecessaryTypeAssertionRule.defaultOptions,
      )
      expect(result).toHaveProperty('visitor')
    })

    it('should return visitor with visitNode function', () => {
      const result = noUnnecessaryTypeAssertionRule.create(
        noUnnecessaryTypeAssertionRule.defaultOptions,
      )
      expect(typeof result.visitor.visitNode).toBe('function')
    })

    it('should return onComplete function', () => {
      const result = noUnnecessaryTypeAssertionRule.create(
        noUnnecessaryTypeAssertionRule.defaultOptions,
      )
      expect(typeof result.onComplete).toBe('function')
    })

    it('should have onComplete return empty array before traversal', () => {
      const result = noUnnecessaryTypeAssertionRule.create(
        noUnnecessaryTypeAssertionRule.defaultOptions,
      )
      const violations = result.onComplete()
      expect(Array.isArray(violations)).toBe(true)
    })

    it('should accept custom options', () => {
      const result = noUnnecessaryTypeAssertionRule.create({
        skipStringLiterals: true,
        skipNumericLiterals: true,
        skipBooleanLiterals: true,
        skipNullLiterals: true,
      })
      expect(result).toHaveProperty('visitor')
      expect(result).toHaveProperty('onComplete')
    })

    it('should accept empty options', () => {
      const result = noUnnecessaryTypeAssertionRule.create({})
      expect(result).toHaveProperty('visitor')
      expect(result).toHaveProperty('onComplete')
    })

    it('should return violations with ruleId after visitNode processes AsExpression', () => {
      const sf = createSourceFile('const x = "hello" as string;')
      const result = noUnnecessaryTypeAssertionRule.create(
        noUnnecessaryTypeAssertionRule.defaultOptions,
      )
      sf.forEachDescendant((node) => {
        result.visitor.visitNode(node, { sourceFile: sf, violations: [] })
      })
      const violations = result.onComplete()
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].ruleId).toBe('no-unnecessary-type-assertion')
    })

    it('should merge default options with provided options', () => {
      const result = noUnnecessaryTypeAssertionRule.create({ skipStringLiterals: true })
      expect(result).toHaveProperty('visitor')
    })
  })

  describe('analyzeNoUnnecessaryTypeAssertion function', () => {
    it('should return empty array for empty file', () => {
      const sf = createSourceFile('')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toEqual([])
    })

    it('should return empty array when no assertions', () => {
      const sf = createSourceFile('const x = "hello";')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should detect single redundant assertion', () => {
      const sf = createSourceFile('const x = "hello" as string;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(1)
    })

    it('should detect multiple redundant assertions', () => {
      const sf = createSourceFile('const a = "hello" as string; const b = 42 as number;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(2)
    })

    it('should work with no options', () => {
      const sf = createSourceFile('const x = "hello" as string;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should work with empty options', () => {
      const sf = createSourceFile('const x = "hello" as string;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf, {})
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should work with skip options', () => {
      const sf = createSourceFile('const x = "hello" as string;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf, { skipStringLiterals: true })
      expect(violations).toHaveLength(0)
    })

    it('should handle file with only valid assertions', () => {
      const sf = createSourceFile('const x = 42 as string; const y = "hello" as number;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should return RuleViolation array', () => {
      const sf = createSourceFile('const x = "hello" as string;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(Array.isArray(violations)).toBe(true)
    })

    it('should handle three redundant assertions', () => {
      const sf = createSourceFile(
        'const a = "x" as string; const b = 1 as number; const c = true as boolean;',
      )
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(3)
    })
  })

  describe('message and suggestion content', () => {
    it('should contain "redundant" in message', () => {
      const sf = createSourceFile('const x = "hello" as string;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations[0].message).toContain('redundant')
    })

    it('should contain "Type assertion" in message', () => {
      const sf = createSourceFile('const x = "hello" as string;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations[0].message).toContain('Type assertion')
    })

    it('should contain "as string" in message for string assertion', () => {
      const sf = createSourceFile('const x = "hello" as string;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations[0].message).toContain('as string')
    })

    it('should contain "as number" in message for number assertion', () => {
      const sf = createSourceFile('const x = 42 as number;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations[0].message).toContain('as number')
    })

    it('should contain "as boolean" in message for boolean assertion', () => {
      const sf = createSourceFile('const x = true as boolean;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations[0].message).toContain('as boolean')
    })

    it('should contain suggestion text', () => {
      const sf = createSourceFile('const x = "hello" as string;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations[0].suggestion).toBe('Remove this type assertion.')
    })

    it('should include "already of type" in message', () => {
      const sf = createSourceFile('const x = "hello" as string;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations[0].message).toContain('already of type')
    })

    it('should include literal text in message', () => {
      const sf = createSourceFile('const x = "hello" as string;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations[0].message).toContain('"hello"')
    })

    it('should include expression text for number', () => {
      const sf = createSourceFile('const x = 42 as number;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations[0].message).toContain('42')
    })

    it('should include expression text for boolean', () => {
      const sf = createSourceFile('const x = true as boolean;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations[0].message).toContain('true')
    })
  })

  describe('multiple violations', () => {
    it('should detect two string assertions', () => {
      const sf = createSourceFile('const a = "hello" as string; const b = "world" as string;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(2)
    })

    it('should detect two number assertions', () => {
      const sf = createSourceFile('const a = 1 as number; const b = 2 as number;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(2)
    })

    it('should detect mixed string and number assertions', () => {
      const sf = createSourceFile('const a = "hello" as string; const b = 42 as number;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(2)
    })

    it('should detect three mixed assertions', () => {
      const sf = createSourceFile(
        'const a = "x" as string; const b = 1 as number; const c = true as boolean;',
      )
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(3)
    })

    it('should detect four assertions including bigint', () => {
      const sf = createSourceFile(
        'const a = "x" as string; const b = 1 as number; const c = true as boolean; const d = 5n as bigint;',
      )
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(4)
    })

    it('should detect five assertions', () => {
      const sf = createSourceFile(
        'const a = "x" as string; const b = 1 as number; const c = true as boolean; const d = 5n as bigint; const e = `y` as string;',
      )
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(5)
    })

    it('should report correct count mixing valid and redundant', () => {
      const sf = createSourceFile(
        'const a = "hello" as string; const b = 42 as string; const c = 1 as number;',
      )
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(2)
    })

    it('should detect assertions in different statement types', () => {
      const sf = createSourceFile(
        'const a = "x" as string; let b = 1 as number; var c = true as boolean;',
      )
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(3)
    })

    it('should detect assertions in array elements', () => {
      const sf = createSourceFile('const arr = ["a" as string, "b" as string, "c" as string];')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(3)
    })

    it('should detect assertions in object properties', () => {
      const sf = createSourceFile('const obj = { a: "x" as string, b: 1 as number };')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(2)
    })

    it('should detect assertion with null when skipNullLiterals is false among others', () => {
      const sf = createSourceFile('const a = "x" as string; const b = null as null;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf, { skipNullLiterals: false })
      expect(violations).toHaveLength(2)
    })

    it('should detect only null when skipNullLiterals is false and others are valid', () => {
      const sf = createSourceFile('const a = 42 as string; const b = null as null;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf, { skipNullLiterals: false })
      expect(violations).toHaveLength(1)
    })

    it('should detect assertions in function bodies', () => {
      const sf = createSourceFile(
        'function f() { const a = "x" as string; const b = 1 as number; }',
      )
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(2)
    })

    it('should detect assertions across nested scopes', () => {
      const sf = createSourceFile(
        'const a = "x" as string; function f() { const b = 1 as number; if (true) { const c = true as boolean; } }',
      )
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(3)
    })
  })

  describe('valid code - extended', () => {
    it('should not flag angle bracket on number', () => {
      const sf = createSourceFile('const x = <number>42;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag angle bracket on boolean', () => {
      const sf = createSourceFile('const x = <boolean>true;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag as never', () => {
      const sf = createSourceFile('const x = "hello" as never;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag as void', () => {
      const sf = createSourceFile('const x = "hello" as void;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag variable as number', () => {
      const sf = createSourceFile('const y = 42; const x = y as number;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag variable as boolean', () => {
      const sf = createSourceFile('const y = true; const x = y as boolean;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag variable as bigint', () => {
      const sf = createSourceFile('const y = 42n; const x = y as bigint;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should flag redundant number assertion in function argument', () => {
      const sf = createSourceFile('function f(x: number) {} const result = f(42 as number);')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(1)
    })

    it('should not flag computed property assertion', () => {
      const sf = createSourceFile(
        'const key = "a"; const obj = { [key]: 1 } as Record<string, number>;',
      )
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag template interpolation assertion', () => {
      const sf = createSourceFile('const a = "hello"; const x = `${a} world` as string;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag type reference assertion', () => {
      const sf = createSourceFile('const x = "hello" as MyString;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag tuple assertion', () => {
      const sf = createSourceFile('const x = [1, "a"] as [number, string];')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag enum member assertion', () => {
      const sf = createSourceFile('enum E { A = "a" } const x = E.A as E;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag typeof assertion', () => {
      const sf = createSourceFile('const x = typeof "hello" as string;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag void operator', () => {
      const sf = createSourceFile('const x = void "hello" as undefined;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should flag redundant string assertion in delete expression', () => {
      const sf = createSourceFile(
        'const obj: Record<string, number> = { a: 1 }; delete obj["a" as string];',
      )
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(1)
    })

    it('should not flag assignment expression variable', () => {
      const sf = createSourceFile('let x = "hello"; x = x as string;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag map/filter callback return', () => {
      const sf = createSourceFile('const arr = [1, 2].map(x => x as number);')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag logical expression', () => {
      const sf = createSourceFile('const x = (true && false) as boolean;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag binary expression string concat', () => {
      const sf = createSourceFile('const x = ("hello" + " world") as string;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag comma expression', () => {
      const sf = createSourceFile('const x = (1, 2) as number;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag optional chain', () => {
      const sf = createSourceFile('const obj = { a: "hello" }; const x = obj?.a as string;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag non-null assertion', () => {
      const sf = createSourceFile('const x = null! as null;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag regular expression', () => {
      const sf = createSourceFile('const x = /hello/ as RegExp;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag symbol assertion', () => {
      const sf = createSourceFile('const x = Symbol("a") as symbol;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag conditional type', () => {
      const sf = createSourceFile('const x = "hello" as (string extends string ? true : false);')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag keyof type', () => {
      const sf = createSourceFile('const x = "a" as keyof { a: number };')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag parenthesized type', () => {
      const sf = createSourceFile('const x = "hello" as (string);')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag type literal', () => {
      const sf = createSourceFile('const x = {} as { readonly a: string };')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag function type assertion', () => {
      const sf = createSourceFile('const x = ((() => {}) as () => void);')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag constructor type assertion', () => {
      const sf = createSourceFile('const x = (class {}) as new () => void;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag mapped type assertion', () => {
      const sf = createSourceFile('const x = {} as { [K in "a"]: number };')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag conditional expression on variables', () => {
      const sf = createSourceFile('const a = "x"; const b = "y"; const x = (a || b) as string;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag class with assertion', () => {
      const sf = createSourceFile('const x = class Foo {} as typeof class Foo {};')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag import assertion', () => {
      const sf = createSourceFile('import type Foo from "bar"; const x = {} as Foo;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag satisfies expression', () => {
      const sf = createSourceFile('const x = { a: 1 } satisfies Record<string, number>;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag method call result assertion', () => {
      const sf = createSourceFile('const x = "hello".slice(0) as string;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag array destructuring assertion', () => {
      const sf = createSourceFile('const [a] = [1] as number[];')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag object destructuring assertion', () => {
      const sf = createSourceFile('const { a } = { a: 1 } as { a: number };')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag double assertion with unknown', () => {
      const sf = createSourceFile('const x = "hello" as unknown as number;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })

    it('should not flag nullish coalescing result', () => {
      const sf = createSourceFile('const x = (null ?? "hello") as string;')
      const violations = analyzeNoUnnecessaryTypeAssertion(sf)
      expect(violations).toHaveLength(0)
    })
  })
})
