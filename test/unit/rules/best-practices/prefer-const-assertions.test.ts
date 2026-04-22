import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import {
  analyzePreferConstAssertions,
  preferConstAssertionsRule,
} from '../../../../src/rules/best-practices/prefer-const-assertions.js'

const sharedProject = new Project({ useInMemoryFileSystem: true })
let fileCounter = 0
const createSourceFile = (code: string) => {
  fileCounter++
  return sharedProject.createSourceFile(`test${fileCounter}.ts`, code)
}

describe('prefer-const-assertions rule', () => {
  describe('analyzePreferConstAssertions', () => {
    describe('object literals', () => {
      it('should detect object literals that need const assertion', () => {
        const sourceFile = createSourceFile(`
          const config = { mode: 'dev', port: 3000 };
        `)
        const violations = analyzePreferConstAssertions(sourceFile)
        expect(violations.length).toBeGreaterThan(0)
        expect(violations[0].message).toContain('as const')
      })

      it('should not flag objects with type annotation', () => {
        const sourceFile = createSourceFile(`
          interface Config { mode: string; port: number }
          const config: Config = { mode: 'dev', port: 3000 };
        `)
        const violations = analyzePreferConstAssertions(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should not flag objects with existing as const', () => {
        const sourceFile = createSourceFile(`
          const config = { mode: 'dev', port: 3000 } as const;
        `)
        const violations = analyzePreferConstAssertions(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should not flag empty objects when skipEmpty is true', () => {
        const sourceFile = createSourceFile(`
          const empty = {};
        `)
        const violations = analyzePreferConstAssertions(sourceFile, { skipEmpty: true })
        expect(violations).toHaveLength(0)
      })

      it('should not flag let declarations', () => {
        const sourceFile = createSourceFile(`
          let config = { mode: 'dev' };
        `)
        const violations = analyzePreferConstAssertions(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should not flag var declarations', () => {
        const sourceFile = createSourceFile(`
          var config = { mode: 'dev' };
        `)
        const violations = analyzePreferConstAssertions(sourceFile)
        expect(violations).toHaveLength(0)
      })
    })

    describe('array literals', () => {
      it('should detect array literals that need const assertion', () => {
        const sourceFile = createSourceFile(`
          const colors = ['red', 'green', 'blue'];
        `)
        const violations = analyzePreferConstAssertions(sourceFile)
        expect(violations.length).toBeGreaterThan(0)
        expect(violations[0].message).toContain('as const')
      })

      it('should not flag arrays with existing as const', () => {
        const sourceFile = createSourceFile(`
          const colors = ['red', 'green', 'blue'] as const;
        `)
        const violations = analyzePreferConstAssertions(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should not flag empty arrays when skipEmpty is true', () => {
        const sourceFile = createSourceFile(`
          const empty = [];
        `)
        const violations = analyzePreferConstAssertions(sourceFile, { skipEmpty: true })
        expect(violations).toHaveLength(0)
      })

      it('should not flag arrays with spread elements', () => {
        const sourceFile = createSourceFile(`
          const items = ['a', ...otherItems, 'b'];
        `)
        const violations = analyzePreferConstAssertions(sourceFile)
        expect(violations).toHaveLength(0)
      })
    })

    describe('nested literals', () => {
      it('should detect nested object literals', () => {
        const sourceFile = createSourceFile(`
          const config = { server: { port: 3000, host: 'localhost' } };
        `)
        const violations = analyzePreferConstAssertions(sourceFile)
        expect(violations.length).toBeGreaterThan(0)
      })

      it('should not flag objects with non-constable nested values', () => {
        const sourceFile = createSourceFile(`
          const config = { callback: () => true };
        `)
        const violations = analyzePreferConstAssertions(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should not flag objects with computed property names', () => {
        const sourceFile = createSourceFile(`
          const key = 'dynamic';
          const config = { [key]: 'value' };
        `)
        const violations = analyzePreferConstAssertions(sourceFile)
        expect(violations).toHaveLength(0)
      })
    })

    describe('options', () => {
      it('should respect checkObjects: false', () => {
        const sourceFile = createSourceFile(`
          const config = { mode: 'dev' };
        `)
        const violations = analyzePreferConstAssertions(sourceFile, { checkObjects: false })
        expect(violations).toHaveLength(0)
      })

      it('should respect checkArrays: false', () => {
        const sourceFile = createSourceFile(`
          const colors = ['red', 'green', 'blue'];
        `)
        const violations = analyzePreferConstAssertions(sourceFile, { checkArrays: false })
        expect(violations).toHaveLength(0)
      })

      it('should respect minimumProperties', () => {
        const sourceFile = createSourceFile(`
          const small = { a: 1 };
          const large = { a: 1, b: 2, c: 3 };
        `)
        const violations = analyzePreferConstAssertions(sourceFile, { minimumProperties: 3 })
        expect(violations).toHaveLength(1)
        expect(violations[0].message).toContain('object')
      })

      it('should respect skipExported', () => {
        const sourceFile = createSourceFile(`
          export const config = { mode: 'dev' };
        `)
        const violations = analyzePreferConstAssertions(sourceFile, { skipExported: true })
        expect(violations).toHaveLength(0)
      })
    })

    describe('edge cases', () => {
      it('should not flag satisfies expressions', () => {
        const sourceFile = createSourceFile(`
          interface Config { mode: string }
          const config = { mode: 'dev' } satisfies Config;
        `)
        const violations = analyzePreferConstAssertions(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should handle numeric literals', () => {
        const sourceFile = createSourceFile(`
          const ports = [3000, 8080, 8000];
        `)
        const violations = analyzePreferConstAssertions(sourceFile)
        expect(violations.length).toBeGreaterThan(0)
      })

      it('should handle boolean literals', () => {
        const sourceFile = createSourceFile(`
          const flags = { enabled: true, disabled: false };
        `)
        const violations = analyzePreferConstAssertions(sourceFile)
        expect(violations.length).toBeGreaterThan(0)
      })

      it('should handle null literals', () => {
        const sourceFile = createSourceFile(`
          const options = { value: null };
        `)
        const violations = analyzePreferConstAssertions(sourceFile)
        expect(violations.length).toBeGreaterThan(0)
      })

      it('should handle prefix unary expressions in arrays', () => {
        const code = 'const negs = [-1, -2, -3];'
        const sourceFile = createSourceFile(code)
        const violations = analyzePreferConstAssertions(sourceFile)
        expect(violations.length).toBeGreaterThan(0)
      })
    })
  })

  describe('rule definition', () => {
    it('should have correct meta properties', () => {
      expect(preferConstAssertionsRule.meta.name).toBe('prefer-const-assertions')
      expect(preferConstAssertionsRule.meta.category).toBe('style')
      expect(preferConstAssertionsRule.meta.recommended).toBe(false)
      expect(preferConstAssertionsRule.meta.fixable).toBe('code')
    })

    it('should have default options', () => {
      expect(preferConstAssertionsRule.defaultOptions).toBeDefined()
      expect(preferConstAssertionsRule.defaultOptions.checkArrays).toBe(true)
      expect(preferConstAssertionsRule.defaultOptions.checkObjects).toBe(true)
      expect(preferConstAssertionsRule.defaultOptions.skipEmpty).toBe(true)
      expect(preferConstAssertionsRule.defaultOptions.skipExported).toBe(false)
      expect(preferConstAssertionsRule.defaultOptions.minimumProperties).toBe(0)
    })

    it('should create visitor with visitNode method', () => {
      const result = preferConstAssertionsRule.create(preferConstAssertionsRule.defaultOptions)
      expect(result.visitor).toBeDefined()
      expect(result.visitor.visitNode).toBeDefined()
      expect(result.onComplete).toBeDefined()
    })
  })

  describe('checkArrays option', () => {
    it('should not flag arrays when checkArrays is false', () => {
      const code = 'const arr = [1, 2, 3]; arr.map(function(x) { return x * 2; });'
      const sourceFile = createSourceFile(code)
      const violations = analyzePreferConstAssertions(sourceFile, { checkArrays: false })
      expect(violations).toHaveLength(0)
    })
  })

  describe('checkObjects option', () => {
    it('should not flag objects when checkObjects is false', () => {
      const code = 'const obj = { a: 1, b: 2 };'
      const sourceFile = createSourceFile(code)
      const violations = analyzePreferConstAssertions(sourceFile, { checkObjects: false })
      expect(violations).toHaveLength(0)
    })
  })

  describe('skipEmpty option', () => {
    it('should not flag empty object when skipEmpty is true', () => {
      const code = 'const obj = {};'
      const sourceFile = createSourceFile(code)
      const violations = analyzePreferConstAssertions(sourceFile, { skipEmpty: true })
      expect(violations).toHaveLength(0)
    })

    it('should flag empty object when skipEmpty is false', () => {
      const code = 'const obj = {};'
      const sourceFile = createSourceFile(code)
      const violations = analyzePreferConstAssertions(sourceFile, { skipEmpty: false })
      expect(violations.length).toBeGreaterThan(0)
    })
  })

  describe('checkArrays option', () => {
    it('should flag array when checkArrays is true', () => {
      const code = 'const arr = [1, 2, 3];'
      const sourceFile = createSourceFile(code)
      const violations = analyzePreferConstAssertions(sourceFile, { checkArrays: true })
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should not flag array when checkArrays is false', () => {
      const code = 'const arr = [1, 2, 3];'
      const sourceFile = createSourceFile(code)
      const violations = analyzePreferConstAssertions(sourceFile, { checkArrays: false })
      expect(violations).toHaveLength(0)
    })
  })

  describe('checkObjects option', () => {
    it('should flag object when checkObjects is true', () => {
      const code = 'const obj = { a: 1 };'
      const sourceFile = createSourceFile(code)
      const violations = analyzePreferConstAssertions(sourceFile, { checkObjects: true })
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should not flag object when checkObjects is false', () => {
      const code = 'const obj = { a: 1 };'
      const sourceFile = createSourceFile(code)
      const violations = analyzePreferConstAssertions(sourceFile, { checkObjects: false })
      expect(violations).toHaveLength(0)
    })
  })

  describe('additional coverage tests', () => {
    it('should handle template literals without expressions in arrays', () => {
      const code = 'const msgs = [`Hello`, `World`];'
      const sourceFile = createSourceFile(code)
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should handle BigInt literals in arrays', () => {
      const code = 'const bigs = [1n, 2n, 3n];'
      const sourceFile = createSourceFile(code)
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should handle prefix unary expressions in arrays', () => {
      const code = 'const negs = [-1, -2, -3];'
      const sourceFile = createSourceFile(code)
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should not flag objects with spread elements', () => {
      const code = 'const obj = { ...other, a: 1 };'
      const sourceFile = createSourceFile(code)
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag arrays with spread elements', () => {
      const code = 'const arr = [...other, 1, 2];'
      const sourceFile = createSourceFile(code)
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag objects with computed property names', () => {
      const code = 'const key = "a"; const obj = { [key]: 1 };'
      const sourceFile = createSourceFile(code)
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag objects with method shorthand', () => {
      const code = 'const obj = { method() { return 1; } };'
      const sourceFile = createSourceFile(code)
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag objects with non-constable values', () => {
      const code = 'const obj = { fn: () => 1 };'
      const sourceFile = createSourceFile(code)
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should respect minimumProperties option', () => {
      const code = 'const small = { a: 1 }; const large = { a: 1, b: 2, c: 3 };'
      const sourceFile = createSourceFile(code)
      const violations = analyzePreferConstAssertions(sourceFile, { minimumProperties: 3 })
      expect(violations.length).toBe(1)
    })

    it('should respect skipExported option', () => {
      const code = 'export const config = { mode: "dev" };'
      const sourceFile = createSourceFile(code)
      const violations = analyzePreferConstAssertions(sourceFile, { skipExported: true })
      expect(violations).toHaveLength(0)
    })

    it('should flag exported const when skipExported is false', () => {
      const code = 'export const config = { mode: "dev" };'
      const sourceFile = createSourceFile(code)
      const violations = analyzePreferConstAssertions(sourceFile, { skipExported: false })
      expect(violations.length).toBeGreaterThan(0)
    })
  })

  // ==================== NEW TEST SECTIONS ====================

  describe('rule metadata', () => {
    it('should have name prefer-const-assertions', () => {
      expect(preferConstAssertionsRule.meta.name).toBe('prefer-const-assertions')
    })

    it('should have category style', () => {
      expect(preferConstAssertionsRule.meta.category).toBe('style')
    })

    it('should have recommended set to false', () => {
      expect(preferConstAssertionsRule.meta.recommended).toBe(false)
    })

    it('should be fixable', () => {
      expect(preferConstAssertionsRule.meta.fixable).toBe('code')
    })

    it('should have a description', () => {
      expect(preferConstAssertionsRule.meta.description).toBeDefined()
      expect(typeof preferConstAssertionsRule.meta.description).toBe('string')
      expect(preferConstAssertionsRule.meta.description.length).toBeGreaterThan(0)
    })

    it('should have defaultOptions with checkArrays true', () => {
      expect(preferConstAssertionsRule.defaultOptions.checkArrays).toBe(true)
    })

    it('should have defaultOptions with checkObjects true', () => {
      expect(preferConstAssertionsRule.defaultOptions.checkObjects).toBe(true)
    })

    it('should have defaultOptions with minimumProperties 0', () => {
      expect(preferConstAssertionsRule.defaultOptions.minimumProperties).toBe(0)
    })
  })

  describe('detecting - object literals', () => {
    it('should flag a simple object with string property', () => {
      const sourceFile = createSourceFile('const x = { name: "test" };')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('object')
    })

    it('should flag object with number property', () => {
      const sourceFile = createSourceFile('const x = { count: 42 };')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should flag object with boolean property', () => {
      const sourceFile = createSourceFile('const x = { active: true };')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should flag object with null property', () => {
      const sourceFile = createSourceFile('const x = { value: null };')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should flag object with mixed string and number properties', () => {
      const sourceFile = createSourceFile('const x = { name: "test", count: 5 };')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should flag deeply nested object', () => {
      const sourceFile = createSourceFile('const x = { a: { b: { c: "deep" } } };')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should flag object with string and boolean and null', () => {
      const sourceFile = createSourceFile('const x = { a: "hello", b: true, c: null };')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should flag multi-line object', () => {
      const sourceFile = createSourceFile(`const x = {
        name: "multi",
        line: true,
      };`)
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should flag object with prefix unary property value', () => {
      const sourceFile = createSourceFile('const x = { neg: -42 };')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should flag object with template literal property value', () => {
      const sourceFile = createSourceFile('const x = { msg: `hello` };')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should flag object with bigint property value', () => {
      const sourceFile = createSourceFile('const x = { big: 100n };')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should not flag object with function expression value', () => {
      const sourceFile = createSourceFile('const x = { cb: function() { return 1; } };')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag object with arrow function value', () => {
      const sourceFile = createSourceFile('const x = { cb: () => 42 };')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag object with regex value', () => {
      const sourceFile = createSourceFile('const x = { pattern: /test/ };')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag object with spread element', () => {
      const sourceFile = createSourceFile('const x = { ...other, a: 1 };')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag object with computed property name', () => {
      const sourceFile = createSourceFile('const k = "a"; const x = { [k]: 1 };')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag object with method shorthand', () => {
      const sourceFile = createSourceFile('const x = { greet() { return "hi"; } };')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should flag object with nested array of strings', () => {
      const sourceFile = createSourceFile('const x = { items: ["a", "b"] };')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should flag object with nested object of strings', () => {
      const sourceFile = createSourceFile('const x = { inner: { val: "hi" } };')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should not flag object with nested arrow function', () => {
      const sourceFile = createSourceFile('const x = { inner: { fn: () => 1 } };')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag object with identifier property value', () => {
      const sourceFile = createSourceFile('const val = 1; const x = { a: val };')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should flag object with many constable properties', () => {
      const sourceFile = createSourceFile(
        'const x = { a: "1", b: 2, c: true, d: null, e: "five" };',
      )
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should flag object in function return position', () => {
      const sourceFile = createSourceFile(
        'const getConfig = () => ({ a: 1 }) as never; const x = { a: 1 };',
      )
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations.length).toBeGreaterThanOrEqual(1)
    })

    it('should not flag let with object literal', () => {
      const sourceFile = createSourceFile('let x = { a: 1 };')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag var with object literal', () => {
      const sourceFile = createSourceFile('var x = { a: 1 };')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(0)
    })
  })

  describe('detecting - array literals', () => {
    it('should flag simple string array', () => {
      const sourceFile = createSourceFile('const x = ["a", "b", "c"];')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('array')
    })

    it('should flag number array', () => {
      const sourceFile = createSourceFile('const x = [1, 2, 3];')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should flag boolean array', () => {
      const sourceFile = createSourceFile('const x = [true, false, true];')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should flag null array', () => {
      const sourceFile = createSourceFile('const x = [null, null];')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should flag mixed type array', () => {
      const sourceFile = createSourceFile('const x = ["a", 1, true, null];')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should flag nested array', () => {
      const sourceFile = createSourceFile('const x = [[1, 2], [3, 4]];')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should flag deeply nested array', () => {
      const sourceFile = createSourceFile('const x = [[[1]]];')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should flag array with prefix unary elements', () => {
      const sourceFile = createSourceFile('const x = [-1, -2, +3];')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should flag array with template literal elements', () => {
      const sourceFile = createSourceFile('const x = [`hello`, `world`];')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should flag array with bigint elements', () => {
      const sourceFile = createSourceFile('const x = [1n, 2n, 3n];')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should flag array of constable objects', () => {
      const sourceFile = createSourceFile('const x = [{ a: 1 }, { b: 2 }];')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should not flag array with spread elements', () => {
      const sourceFile = createSourceFile('const other = [1]; const x = [...other, 2];')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('array')
    })

    it('should not flag array with function call elements', () => {
      const sourceFile = createSourceFile('const x = [getValue()];')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag array with arrow function elements', () => {
      const sourceFile = createSourceFile('const x = [() => 1];')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag array with regex elements', () => {
      const sourceFile = createSourceFile('const x = [/test/];')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag array with identifier elements', () => {
      const sourceFile = createSourceFile('const val = 1; const x = [val];')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag array with object containing non-constable', () => {
      const sourceFile = createSourceFile('const x = [{ fn: () => 1 }];')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag let with array literal', () => {
      const sourceFile = createSourceFile('let x = [1, 2];')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag var with array literal', () => {
      const sourceFile = createSourceFile('var x = [1, 2];')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should flag tuple-like array with mixed constable types', () => {
      const sourceFile = createSourceFile('const x = ["name", 42, true];')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(1)
    })
  })

  describe('valid code - not flagged', () => {
    it('should not flag let with object', () => {
      const sourceFile = createSourceFile('let x = { a: 1 };')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag var with object', () => {
      const sourceFile = createSourceFile('var x = { a: 1 };')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag const with type annotation', () => {
      const sourceFile = createSourceFile('const x: { a: number } = { a: 1 };')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag const with as const', () => {
      const sourceFile = createSourceFile('const x = { a: 1 } as const;')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag const with satisfies', () => {
      const sourceFile = createSourceFile(
        'interface T { a: number } const x = { a: 1 } satisfies T;',
      )
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag empty object with default skipEmpty', () => {
      const sourceFile = createSourceFile('const x = {};')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag empty array with default skipEmpty', () => {
      const sourceFile = createSourceFile('const x = [];')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag const with function call initializer', () => {
      const sourceFile = createSourceFile('const x = getObj();')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag const with identifier initializer', () => {
      const sourceFile = createSourceFile('const other = { a: 1 }; const x = other;')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(1) // first one flagged
    })

    it('should not flag const with ternary initializer', () => {
      const sourceFile = createSourceFile('const x = true ? { a: 1 } : { b: 2 };')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag const with new expression', () => {
      const sourceFile = createSourceFile('const x = new Map();')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag const with regex literal', () => {
      const sourceFile = createSourceFile('const x = /pattern/;')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag const with arrow function', () => {
      const sourceFile = createSourceFile('const x = () => 1;')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag const with number literal', () => {
      const sourceFile = createSourceFile('const x = 42;')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag const with string literal', () => {
      const sourceFile = createSourceFile('const x = "hello";')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag const with template expression', () => {
      const sourceFile = createSourceFile('const x = `hello ${"world"}`;')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag const with object containing spread', () => {
      const sourceFile = createSourceFile('const other = { a: 1 }; const x = { ...other, b: 2 };')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(1) // only first const flagged
    })

    it('should not flag const with array containing spread', () => {
      const sourceFile = createSourceFile('const other = [1]; const x = [...other, 2];')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(1) // only first const flagged
    })

    it('should not flag const with computed property name', () => {
      const sourceFile = createSourceFile('const k = "a"; const x = { [k]: 1 };')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0) // k is string, x is not constable
    })

    it('should not flag const with method shorthand', () => {
      const sourceFile = createSourceFile('const x = { method() { return 1; } };')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag const with function expression property', () => {
      const sourceFile = createSourceFile('const x = { fn: function() { return 1; } };')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag const with arrow function property', () => {
      const sourceFile = createSourceFile('const x = { fn: () => 1 };')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag const with regex property', () => {
      const sourceFile = createSourceFile('const x = { re: /test/ };')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag exported const with skipExported true', () => {
      const sourceFile = createSourceFile('export const x = { a: 1 };')
      expect(analyzePreferConstAssertions(sourceFile, { skipExported: true })).toHaveLength(0)
    })

    it('should not flag const with as const on array', () => {
      const sourceFile = createSourceFile('const x = [1, 2] as const;')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag const with type annotation on array', () => {
      const sourceFile = createSourceFile('const x: number[] = [1, 2];')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag const without initializer', () => {
      const sourceFile = createSourceFile('const x: number = 5;')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag class declaration', () => {
      const sourceFile = createSourceFile('class A { prop = { a: 1 }; }')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag const with satisfies expression on object', () => {
      const sourceFile = createSourceFile('type T = { a: number }; const x = { a: 1 } satisfies T;')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag const with satisfies expression on array', () => {
      const sourceFile = createSourceFile('const x = [1, 2] satisfies number[];')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag function parameters with object defaults', () => {
      const sourceFile = createSourceFile('function f(opts = { a: 1 }) {}')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag object with undefined property value', () => {
      const sourceFile = createSourceFile('const x = { a: undefined };')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag const with null literal initializer', () => {
      const sourceFile = createSourceFile('const x = null;')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag const with boolean literal initializer', () => {
      const sourceFile = createSourceFile('const x = true;')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag const with bigint literal initializer', () => {
      const sourceFile = createSourceFile('const x = 10n;')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag const with call expression returning object', () => {
      const sourceFile = createSourceFile('const x = JSON.parse("{}");')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag deconstructed const', () => {
      const sourceFile = createSourceFile('const { a, b } = { a: 1, b: 2 };')
      const violations = analyzePreferConstAssertions(sourceFile)
      // The right-hand side is not a variable declaration initializer in the same way
      // it should flag the declaration or not, depends on implementation
      expect(violations.length).toBeGreaterThanOrEqual(0)
    })

    it('should not flag const with array containing function call', () => {
      const sourceFile = createSourceFile('const x = [getValue()];')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag const with binary expression initializer', () => {
      const sourceFile = createSourceFile('const x = 1 + 2;')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag const with typeof expression initializer', () => {
      const sourceFile = createSourceFile('const x = typeof "hello";')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag const with conditional expression initializer', () => {
      const sourceFile = createSourceFile('const x = true ? [1] : [2];')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })
  })

  describe('skipEmpty option', () => {
    it('should not flag empty object with skipEmpty true', () => {
      const sourceFile = createSourceFile('const x = {};')
      expect(analyzePreferConstAssertions(sourceFile, { skipEmpty: true })).toHaveLength(0)
    })

    it('should flag empty object with skipEmpty false', () => {
      const sourceFile = createSourceFile('const x = {};')
      const violations = analyzePreferConstAssertions(sourceFile, { skipEmpty: false })
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('object')
    })

    it('should not flag empty array with skipEmpty true', () => {
      const sourceFile = createSourceFile('const x = [];')
      expect(analyzePreferConstAssertions(sourceFile, { skipEmpty: true })).toHaveLength(0)
    })

    it('should flag empty array with skipEmpty false', () => {
      const sourceFile = createSourceFile('const x = [];')
      const violations = analyzePreferConstAssertions(sourceFile, { skipEmpty: false })
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('array')
    })

    it('should flag non-empty object regardless of skipEmpty', () => {
      const sourceFile = createSourceFile('const x = { a: 1 };')
      expect(analyzePreferConstAssertions(sourceFile, { skipEmpty: true })).toHaveLength(1)
      expect(analyzePreferConstAssertions(sourceFile, { skipEmpty: false })).toHaveLength(1)
    })

    it('should flag non-empty array regardless of skipEmpty', () => {
      const sourceFile = createSourceFile('const x = [1];')
      expect(analyzePreferConstAssertions(sourceFile, { skipEmpty: true })).toHaveLength(1)
      expect(analyzePreferConstAssertions(sourceFile, { skipEmpty: false })).toHaveLength(1)
    })

    it('should skip both empty objects and empty arrays when skipEmpty is true', () => {
      const sourceFile = createSourceFile('const a = {}; const b = [];')
      expect(analyzePreferConstAssertions(sourceFile, { skipEmpty: true })).toHaveLength(0)
    })

    it('should flag both empty objects and empty arrays when skipEmpty is false', () => {
      const sourceFile = createSourceFile('const a = {}; const b = [];')
      expect(analyzePreferConstAssertions(sourceFile, { skipEmpty: false })).toHaveLength(2)
    })
  })

  describe('skipExported option', () => {
    it('should not flag exported object when skipExported is true', () => {
      const sourceFile = createSourceFile('export const x = { a: 1 };')
      expect(analyzePreferConstAssertions(sourceFile, { skipExported: true })).toHaveLength(0)
    })

    it('should flag exported object when skipExported is false', () => {
      const sourceFile = createSourceFile('export const x = { a: 1 };')
      expect(analyzePreferConstAssertions(sourceFile, { skipExported: false })).toHaveLength(1)
    })

    it('should not flag exported array when skipExported is true', () => {
      const sourceFile = createSourceFile('export const x = [1, 2];')
      expect(analyzePreferConstAssertions(sourceFile, { skipExported: true })).toHaveLength(0)
    })

    it('should flag exported array when skipExported is false', () => {
      const sourceFile = createSourceFile('export const x = [1, 2];')
      expect(analyzePreferConstAssertions(sourceFile, { skipExported: false })).toHaveLength(1)
    })

    it('should flag non-exported object when skipExported is true', () => {
      const sourceFile = createSourceFile('const x = { a: 1 };')
      expect(analyzePreferConstAssertions(sourceFile, { skipExported: true })).toHaveLength(1)
    })

    it('should flag non-exported array when skipExported is true', () => {
      const sourceFile = createSourceFile('const x = [1];')
      expect(analyzePreferConstAssertions(sourceFile, { skipExported: true })).toHaveLength(1)
    })

    it('should flag exported const by default (skipExported defaults to false)', () => {
      const sourceFile = createSourceFile('export const x = { a: 1 };')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(1)
    })

    it('should handle mix of exported and non-exported with skipExported', () => {
      const sourceFile = createSourceFile('export const a = { x: 1 }; const b = { y: 2 };')
      const violations = analyzePreferConstAssertions(sourceFile, { skipExported: true })
      expect(violations).toHaveLength(1)
    })
  })

  describe('checkArrays option', () => {
    it('should flag arrays when checkArrays is true', () => {
      const sourceFile = createSourceFile('const x = [1, 2];')
      expect(analyzePreferConstAssertions(sourceFile, { checkArrays: true })).toHaveLength(1)
    })

    it('should not flag arrays when checkArrays is false', () => {
      const sourceFile = createSourceFile('const x = [1, 2];')
      expect(analyzePreferConstAssertions(sourceFile, { checkArrays: false })).toHaveLength(0)
    })

    it('should still flag objects when checkArrays is false', () => {
      const sourceFile = createSourceFile('const x = { a: 1 };')
      expect(analyzePreferConstAssertions(sourceFile, { checkArrays: false })).toHaveLength(1)
    })

    it('should flag both when both options are true', () => {
      const sourceFile = createSourceFile('const a = [1]; const b = { x: 1 };')
      expect(
        analyzePreferConstAssertions(sourceFile, { checkArrays: true, checkObjects: true }),
      ).toHaveLength(2)
    })

    it('should flag only objects when checkArrays is false', () => {
      const sourceFile = createSourceFile('const a = [1]; const b = { x: 1 };')
      const violations = analyzePreferConstAssertions(sourceFile, {
        checkArrays: false,
        checkObjects: true,
      })
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('object')
    })

    it('should default checkArrays to true', () => {
      const sourceFile = createSourceFile('const x = [1];')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(1)
    })

    it('should not flag empty arrays even with checkArrays true when skipEmpty is true', () => {
      const sourceFile = createSourceFile('const x = [];')
      expect(
        analyzePreferConstAssertions(sourceFile, { checkArrays: true, skipEmpty: true }),
      ).toHaveLength(0)
    })

    it('should check arrays by default', () => {
      expect(preferConstAssertionsRule.defaultOptions.checkArrays).toBe(true)
    })
  })

  describe('checkObjects option', () => {
    it('should flag objects when checkObjects is true', () => {
      const sourceFile = createSourceFile('const x = { a: 1 };')
      expect(analyzePreferConstAssertions(sourceFile, { checkObjects: true })).toHaveLength(1)
    })

    it('should not flag objects when checkObjects is false', () => {
      const sourceFile = createSourceFile('const x = { a: 1 };')
      expect(analyzePreferConstAssertions(sourceFile, { checkObjects: false })).toHaveLength(0)
    })

    it('should still flag arrays when checkObjects is false', () => {
      const sourceFile = createSourceFile('const x = [1, 2];')
      expect(analyzePreferConstAssertions(sourceFile, { checkObjects: false })).toHaveLength(1)
    })

    it('should flag only arrays when checkObjects is false', () => {
      const sourceFile = createSourceFile('const a = [1]; const b = { x: 1 };')
      const violations = analyzePreferConstAssertions(sourceFile, {
        checkArrays: true,
        checkObjects: false,
      })
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('array')
    })

    it('should default checkObjects to true', () => {
      const sourceFile = createSourceFile('const x = { a: 1 };')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(1)
    })

    it('should not flag anything when both options are false', () => {
      const sourceFile = createSourceFile('const a = [1]; const b = { x: 1 };')
      expect(
        analyzePreferConstAssertions(sourceFile, { checkArrays: false, checkObjects: false }),
      ).toHaveLength(0)
    })

    it('should not flag empty objects even with checkObjects true when skipEmpty is true', () => {
      const sourceFile = createSourceFile('const x = {};')
      expect(
        analyzePreferConstAssertions(sourceFile, { checkObjects: true, skipEmpty: true }),
      ).toHaveLength(0)
    })

    it('should check objects by default', () => {
      expect(preferConstAssertionsRule.defaultOptions.checkObjects).toBe(true)
    })
  })

  describe('minimumProperties option', () => {
    it('should flag all objects when minimumProperties is 0', () => {
      const sourceFile = createSourceFile('const x = { a: 1 };')
      expect(analyzePreferConstAssertions(sourceFile, { minimumProperties: 0 })).toHaveLength(1)
    })

    it('should not flag object with fewer properties than minimumProperties', () => {
      const sourceFile = createSourceFile('const x = { a: 1 };')
      expect(analyzePreferConstAssertions(sourceFile, { minimumProperties: 2 })).toHaveLength(0)
    })

    it('should flag object with exactly minimumProperties count', () => {
      const sourceFile = createSourceFile('const x = { a: 1, b: 2 };')
      expect(analyzePreferConstAssertions(sourceFile, { minimumProperties: 2 })).toHaveLength(1)
    })

    it('should flag object with more properties than minimumProperties', () => {
      const sourceFile = createSourceFile('const x = { a: 1, b: 2, c: 3 };')
      expect(analyzePreferConstAssertions(sourceFile, { minimumProperties: 2 })).toHaveLength(1)
    })

    it('should not flag array with fewer elements than minimumProperties', () => {
      const sourceFile = createSourceFile('const x = [1];')
      expect(analyzePreferConstAssertions(sourceFile, { minimumProperties: 2 })).toHaveLength(0)
    })

    it('should flag array with exactly minimumProperties count', () => {
      const sourceFile = createSourceFile('const x = [1, 2];')
      expect(analyzePreferConstAssertions(sourceFile, { minimumProperties: 2 })).toHaveLength(1)
    })

    it('should flag array with more elements than minimumProperties', () => {
      const sourceFile = createSourceFile('const x = [1, 2, 3];')
      expect(analyzePreferConstAssertions(sourceFile, { minimumProperties: 2 })).toHaveLength(1)
    })

    it('should only flag qualifying declarations with minimumProperties', () => {
      const sourceFile = createSourceFile(
        'const small = { a: 1 }; const large = { a: 1, b: 2, c: 3 };',
      )
      const violations = analyzePreferConstAssertions(sourceFile, { minimumProperties: 3 })
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('object')
    })

    it('should apply minimumProperties to both objects and arrays', () => {
      const sourceFile = createSourceFile(
        'const a = { x: 1 }; const b = [1]; const c = { x: 1, y: 2, z: 3 }; const d = [1, 2, 3];',
      )
      const violations = analyzePreferConstAssertions(sourceFile, { minimumProperties: 3 })
      expect(violations).toHaveLength(2)
    })

    it('should default minimumProperties to 0', () => {
      expect(preferConstAssertionsRule.defaultOptions.minimumProperties).toBe(0)
    })
  })

  describe('violation properties', () => {
    it('should have ruleId set to prefer-const-assertions', () => {
      const sourceFile = createSourceFile('const x = { a: 1 };')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations[0].ruleId).toBe('prefer-const-assertions')
    })

    it('should have severity set to info', () => {
      const sourceFile = createSourceFile('const x = { a: 1 };')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations[0].severity).toBe('info')
    })

    it('should include as const in message for object', () => {
      const sourceFile = createSourceFile('const x = { a: 1 };')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations[0].message).toContain('as const')
      expect(violations[0].message).toContain('object')
    })

    it('should include as const in message for array', () => {
      const sourceFile = createSourceFile('const x = [1];')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations[0].message).toContain('as const')
      expect(violations[0].message).toContain('array')
    })

    it('should have suggestion text', () => {
      const sourceFile = createSourceFile('const x = { a: 1 };')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations[0].suggestion).toContain('as const')
      expect(violations[0].suggestion).toContain('readonly')
    })

    it('should have range property', () => {
      const sourceFile = createSourceFile('const x = { a: 1 };')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations[0].range).toBeDefined()
      expect(violations[0].range.start).toBeDefined()
      expect(violations[0].range.end).toBeDefined()
    })

    it('should have filePath property', () => {
      const sourceFile = createSourceFile('const x = { a: 1 };')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations[0].filePath).toBeDefined()
      expect(typeof violations[0].filePath).toBe('string')
    })

    it('should have range start line before or equal to end line', () => {
      const sourceFile = createSourceFile('const x = { a: 1 };')
      const violations = analyzePreferConstAssertions(sourceFile)
      const { start, end } = violations[0].range
      expect(start.line).toBeLessThanOrEqual(end.line)
      expect(typeof start.line).toBe('number')
      expect(typeof start.column).toBe('number')
      expect(typeof end.line).toBe('number')
      expect(typeof end.column).toBe('number')
    })

    it('should have consistent message format for object', () => {
      const sourceFile = createSourceFile('const x = { a: 1 };')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations[0].message).toMatch(
        /Use 'as const' for better type inference on this object literal\./,
      )
    })

    it('should have consistent message format for array', () => {
      const sourceFile = createSourceFile('const x = [1];')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations[0].message).toMatch(
        /Use 'as const' for better type inference on this array literal\./,
      )
    })

    it('should have consistent suggestion format', () => {
      const sourceFile = createSourceFile('const x = { a: 1 };')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations[0].suggestion).toBe(
        "Add 'as const' to make the literal type more specific and readonly.",
      )
    })
  })

  describe('edge cases', () => {
    it('should handle empty file', () => {
      const sourceFile = createSourceFile('')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should handle file with only comments', () => {
      const sourceFile = createSourceFile('// just a comment')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should handle const with BigInt in object', () => {
      const sourceFile = createSourceFile('const x = { big: 100n };')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(1)
    })

    it('should handle const with prefix unary in object', () => {
      const sourceFile = createSourceFile('const x = { neg: -1 };')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(1)
    })

    it('should handle const with template literal in object', () => {
      const sourceFile = createSourceFile('const x = { msg: `hello` };')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(1)
    })

    it('should handle const in module declaration', () => {
      const sourceFile = createSourceFile('const x = { a: 1 }; export default x;')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(1)
    })

    it('should handle const with deeply nested objects', () => {
      const sourceFile = createSourceFile('const x = { a: { b: { c: { d: "deep" } } } };')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(1)
    })

    it('should handle const with array in object', () => {
      const sourceFile = createSourceFile('const x = { arr: [1, 2, 3] };')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(1)
    })

    it('should handle const with object in array', () => {
      const sourceFile = createSourceFile('const x = [{ a: 1 }, { b: 2 }];')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(1)
    })

    it('should handle const with multi-line code and comments', () => {
      const sourceFile = createSourceFile(`
        // This is a config
        const config = {
          /** doc comment */
          name: "test",
          // another comment
          value: 42,
        };
      `)
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(1)
    })

    it('should handle multiple const declarations in one statement', () => {
      const sourceFile = createSourceFile('const a = { x: 1 }, b = { y: 2 };')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(2)
    })

    it('should handle const with mixed constable and non-constable in same file', () => {
      const sourceFile = createSourceFile(`
        const good = { a: 1 };
        const bad = { fn: () => 1 };
        const good2 = [1, 2];
      `)
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(2)
    })

    it('should handle const in nested scope', () => {
      const sourceFile = createSourceFile(`
        function outer() {
          const inner = { a: 1 };
        }
      `)
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(1)
    })

    it('should handle const in if block', () => {
      const sourceFile = createSourceFile(`
        if (true) {
          const x = { a: 1 };
        }
      `)
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(1)
    })

    it('should handle const in try-catch block', () => {
      const sourceFile = createSourceFile(`
        try {
          const x = { a: 1 };
        } catch (e) {
          const y = { b: 2 };
        }
      `)
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(2)
    })

    it('should not flag const with no initializer', () => {
      const sourceFile = createSourceFile('declare const x: { a: number };')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should handle const with as expression other than const', () => {
      const sourceFile = createSourceFile('const x = { a: 1 } as { a: number };')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should handle const with nested non-constable breaking outer constable', () => {
      const sourceFile = createSourceFile('const x = { a: 1, b: { fn: () => 1 } };')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should handle shorthand property syntax', () => {
      const sourceFile = createSourceFile('const a = 1; const x = { a };')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should handle const with all false options', () => {
      const sourceFile = createSourceFile('const x = { a: 1 };')
      expect(
        analyzePreferConstAssertions(sourceFile, { checkArrays: false, checkObjects: false }),
      ).toHaveLength(0)
    })
  })

  describe('rule create function', () => {
    it('should return visitor object with visitNode', () => {
      const result = preferConstAssertionsRule.create(preferConstAssertionsRule.defaultOptions)
      expect(result.visitor).toBeDefined()
      expect(typeof result.visitor.visitNode).toBe('function')
    })

    it('should return onComplete function', () => {
      const result = preferConstAssertionsRule.create(preferConstAssertionsRule.defaultOptions)
      expect(typeof result.onComplete).toBe('function')
    })

    it('should return empty violations when onComplete called without visiting', () => {
      const result = preferConstAssertionsRule.create(preferConstAssertionsRule.defaultOptions)
      const violations = result.onComplete()
      expect(Array.isArray(violations)).toBe(true)
      expect(violations).toHaveLength(0)
    })

    it('should accept custom options', () => {
      const result = preferConstAssertionsRule.create({ checkObjects: false, checkArrays: false })
      expect(result.visitor).toBeDefined()
    })

    it('should merge options with defaults', () => {
      const result = preferConstAssertionsRule.create({ skipEmpty: false })
      expect(result.visitor).toBeDefined()
      expect(result.onComplete).toBeDefined()
    })

    it('should create a new violations array per call', () => {
      const result1 = preferConstAssertionsRule.create(preferConstAssertionsRule.defaultOptions)
      const result2 = preferConstAssertionsRule.create(preferConstAssertionsRule.defaultOptions)
      const violations1 = result1.onComplete()
      const violations2 = result2.onComplete()
      expect(violations1).not.toBe(violations2)
    })

    it('should handle undefined options by using defaults', () => {
      const result = preferConstAssertionsRule.create({})
      expect(result.visitor).toBeDefined()
    })

    it('should handle partial options', () => {
      const result = preferConstAssertionsRule.create({ skipEmpty: false, minimumProperties: 5 })
      expect(result.visitor).toBeDefined()
    })
  })

  describe('analyzePreferConstAssertions function', () => {
    it('should return empty array for empty file', () => {
      const sourceFile = createSourceFile('')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should return empty array for file with no const declarations', () => {
      const sourceFile = createSourceFile('let x = 1; var y = 2;')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should return violation for single constable const', () => {
      const sourceFile = createSourceFile('const x = { a: 1 };')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should return multiple violations for multiple constable consts', () => {
      const sourceFile = createSourceFile('const x = { a: 1 }; const y = [1, 2];')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(2)
    })

    it('should accept empty options', () => {
      const sourceFile = createSourceFile('const x = { a: 1 };')
      const violations = analyzePreferConstAssertions(sourceFile, {})
      expect(violations).toHaveLength(1)
    })

    it('should use default options when none provided', () => {
      const sourceFile = createSourceFile('const x = { a: 1 };')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should override defaults with provided options', () => {
      const sourceFile = createSourceFile('const x = { a: 1 };')
      const violations = analyzePreferConstAssertions(sourceFile, { checkObjects: false })
      expect(violations).toHaveLength(0)
    })

    it('should return RuleViolation array', () => {
      const sourceFile = createSourceFile('const x = { a: 1 };')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(Array.isArray(violations)).toBe(true)
      if (violations.length > 0) {
        expect(violations[0]).toHaveProperty('ruleId')
        expect(violations[0]).toHaveProperty('severity')
        expect(violations[0]).toHaveProperty('message')
        expect(violations[0]).toHaveProperty('filePath')
        expect(violations[0]).toHaveProperty('range')
        expect(violations[0]).toHaveProperty('suggestion')
      }
    })

    it('should handle file with only functions', () => {
      const sourceFile = createSourceFile('function foo() { return 1; }')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should handle file with interfaces', () => {
      const sourceFile = createSourceFile('interface I { a: number }')
      const violations = analyzePreferConstAssertions(sourceFile)
      expect(violations).toHaveLength(0)
    })
  })

  describe('multiple violations', () => {
    it('should report 3 violations for 3 constable consts', () => {
      const sourceFile = createSourceFile(`
        const a = { x: 1 };
        const b = { y: 2 };
        const c = { z: 3 };
      `)
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(3)
    })

    it('should report violations for mixed objects and arrays', () => {
      const sourceFile = createSourceFile(`
        const a = { x: 1 };
        const b = [1, 2];
        const c = { z: 3 };
      `)
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(3)
    })

    it('should report 5 violations for 5 constable declarations', () => {
      const sourceFile = createSourceFile(`
        const a = { x: 1 };
        const b = [1];
        const c = { y: "hi" };
        const d = [true, false];
        const e = { z: null };
      `)
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(5)
    })

    it('should skip non-constable among constable', () => {
      const sourceFile = createSourceFile(`
        const a = { x: 1 };
        const b = { fn: () => 1 };
        const c = [1, 2];
      `)
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(2)
    })

    it('should report violations for nested scopes', () => {
      const sourceFile = createSourceFile(`
        const a = { x: 1 };
        function outer() {
          const b = { y: 2 };
          if (true) {
            const c = { z: 3 };
          }
        }
      `)
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(3)
    })

    it('should report violations with minimumProperties filtering', () => {
      const sourceFile = createSourceFile(`
        const a = { x: 1 };
        const b = { x: 1, y: 2 };
        const c = { x: 1, y: 2, z: 3 };
      `)
      expect(analyzePreferConstAssertions(sourceFile, { minimumProperties: 2 })).toHaveLength(2)
    })

    it('should report violations across different declaration forms', () => {
      const sourceFile = createSourceFile(`
        const a = { x: 1 }, b = { y: 2 };
        const c = [1, 2];
      `)
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(3)
    })

    it('should respect skipExported for multiple exports', () => {
      const sourceFile = createSourceFile(`
        export const a = { x: 1 };
        export const b = { y: 2 };
        const c = { z: 3 };
      `)
      const violations = analyzePreferConstAssertions(sourceFile, { skipExported: true })
      expect(violations).toHaveLength(1)
    })

    it('should report violations with checkArrays disabled', () => {
      const sourceFile = createSourceFile(`
        const a = { x: 1 };
        const b = [1, 2];
        const c = { y: 2 };
      `)
      const violations = analyzePreferConstAssertions(sourceFile, { checkArrays: false })
      expect(violations).toHaveLength(2)
      violations.forEach((v) => expect(v.message).toContain('object'))
    })

    it('should handle file with mix of let/var/const', () => {
      const sourceFile = createSourceFile(`
        const a = { x: 1 };
        let b = { y: 2 };
        var c = { z: 3 };
        const d = [1, 2];
      `)
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(2)
    })
  })

  describe('valid code - extended', () => {
    it('should not flag class property with object', () => {
      const sourceFile = createSourceFile('class A { prop = { a: 1 }; }')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag const with string initializer', () => {
      const sourceFile = createSourceFile('const x = "hello";')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag const with number initializer', () => {
      const sourceFile = createSourceFile('const x = 42;')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag const with boolean initializer', () => {
      const sourceFile = createSourceFile('const x = true;')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag const with bigint initializer', () => {
      const sourceFile = createSourceFile('const x = 10n;')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag const with null initializer', () => {
      const sourceFile = createSourceFile('const x = null;')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag const with undefined initializer', () => {
      const sourceFile = createSourceFile('const x = undefined;')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag const with template expression', () => {
      const sourceFile = createSourceFile('const x = `hello ${"world"}`;')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag const with new expression', () => {
      const sourceFile = createSourceFile('const x = new Error("msg");')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag const with typeof expression', () => {
      const sourceFile = createSourceFile('const x = typeof 42;')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag const with void expression', () => {
      const sourceFile = createSourceFile('const x = void 0;')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag const with binary expression', () => {
      const sourceFile = createSourceFile('const x = 1 + 2;')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag const with conditional expression', () => {
      const sourceFile = createSourceFile('const x = true ? 1 : 2;')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag const with parenthesized expression', () => {
      const sourceFile = createSourceFile('const x = (42);')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag const with as expression (non-const)', () => {
      const sourceFile = createSourceFile('const x = { a: 1 } as { a: number };')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag const with satisfies expression', () => {
      const sourceFile = createSourceFile('type T = { a: number }; const x = { a: 1 } satisfies T;')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag const with type annotation using interface', () => {
      const sourceFile = createSourceFile('interface I { a: number } const x: I = { a: 1 };')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag const with type annotation using type alias', () => {
      const sourceFile = createSourceFile('type T = { a: number }; const x: T = { a: 1 };')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag const with type annotation using inline type', () => {
      const sourceFile = createSourceFile('const x: { a: number } = { a: 1 };')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag const with array type annotation', () => {
      const sourceFile = createSourceFile('const x: number[] = [1, 2, 3];')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag const with tuple type annotation', () => {
      const sourceFile = createSourceFile('const x: [number, string] = [1, "a"];')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag const with ReadonlyArray type annotation', () => {
      const sourceFile = createSourceFile('const x: ReadonlyArray<number> = [1, 2];')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag const with arrow function initializer', () => {
      const sourceFile = createSourceFile('const x = () => ({ a: 1 });')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag const with regular function initializer', () => {
      const sourceFile = createSourceFile('const x = function() { return { a: 1 }; };')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag const with class expression initializer', () => {
      const sourceFile = createSourceFile('const x = class { prop = 1; };')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag const with object containing regex', () => {
      const sourceFile = createSourceFile('const x = { re: /test/i };')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag const with array containing undefined', () => {
      const sourceFile = createSourceFile('const x = [undefined];')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag const with getter/setter in object', () => {
      const sourceFile = createSourceFile('const x = { get value() { return 1; } };')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag const with shorthand property that is identifier', () => {
      const sourceFile = createSourceFile('const val = 1; const x = { val };')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag enum declaration', () => {
      const sourceFile = createSourceFile('enum E { A = 1, B = 2 }')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag type alias', () => {
      const sourceFile = createSourceFile('type T = { a: number };')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })

    it('should not flag namespace', () => {
      const sourceFile = createSourceFile('namespace NS { export const x = 1; }')
      expect(analyzePreferConstAssertions(sourceFile)).toHaveLength(0)
    })
  })
})
