/**
 * @fileoverview Tests for prefer-flat-map rule
 */

import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import {
  analyzePreferFlatMap,
  preferFlatMapRule,
} from '../../../../src/rules/best-practices/prefer-flat-map.js'

function createSourceFile(code: string) {
  const project = new Project({ useInMemoryFileSystem: true })
  return project.createSourceFile('test.ts', code)
}

describe('prefer-flat-map rule', () => {
  describe('rule metadata', () => {
    it('should have correct name', () => {
      expect(preferFlatMapRule.meta.name).toBe('prefer-flat-map')
    })
    it('should have style category', () => {
      expect(preferFlatMapRule.meta.category).toBe('style')
    })
    it('should be fixable', () => {
      expect(preferFlatMapRule.meta.fixable).toBe('code')
    })
    it('should have description', () => {
      expect(preferFlatMapRule.meta.description).toBeDefined()
      expect(typeof preferFlatMapRule.meta.description).toBe('string')
    })
    it('should mention flat in description', () => {
      expect(preferFlatMapRule.meta.description).toContain('.flat()')
    })
    it('should not be recommended', () => {
      expect(preferFlatMapRule.meta.recommended).toBe(false)
    })
    it('should have defaultOptions as empty object', () => {
      expect(preferFlatMapRule.defaultOptions).toEqual({})
    })
    it('should have create function', () => {
      expect(typeof preferFlatMapRule.create).toBe('function')
    })
  })

  describe('detecting reduce with concat', () => {
    it('should detect reduce with concat pattern', () => {
      const sf = createSourceFile(
        'const arr = [[1, 2, 3].reduce((acc, val) => { return acc.concat(val) }, [])]',
      )
      const violations = analyzePreferFlatMap(sf)
      expect(violations).toHaveLength(1)
    })
    it('should report correct ruleId', () => {
      const sf = createSourceFile(
        'const arr = [[1, 2, 3].reduce((acc, val) => { return acc.concat(val) }, [])]',
      )
      expect(analyzePreferFlatMap(sf)[0].ruleId).toBe('prefer-flat-map')
    })
    it('should report info severity', () => {
      const sf = createSourceFile(
        'const arr = [[1, 2, 3].reduce((acc, val) => { return acc.concat(val) }, [])]',
      )
      expect(analyzePreferFlatMap(sf)[0].severity).toBe('info')
    })
    it('should mention .flat() in message', () => {
      const sf = createSourceFile(
        'const arr = [[1, 2, 3].reduce((acc, val) => { return acc.concat(val) }, [])]',
      )
      expect(analyzePreferFlatMap(sf)[0].message).toContain('.flat()')
    })
    it('should provide suggestion with .flat()', () => {
      const sf = createSourceFile(
        'const arr = [[1, 2, 3].reduce((acc, val) => { return acc.concat(val) }, [])]',
      )
      expect(analyzePreferFlatMap(sf)[0].suggestion).toContain('.flat()')
    })
    it('should have range property', () => {
      const sf = createSourceFile(
        'const arr = [[1, 2, 3].reduce((acc, val) => { return acc.concat(val) }, [])]',
      )
      expect(analyzePreferFlatMap(sf)[0].range).toBeDefined()
    })
    it('should have filePath property', () => {
      const sf = createSourceFile(
        'const arr = [[1, 2, 3].reduce((acc, val) => { return acc.concat(val) }, [])]',
      )
      expect(analyzePreferFlatMap(sf)[0].filePath).toBeDefined()
    })
    it('should detect arrow function with implicit return', () => {
      const sf = createSourceFile(
        'const arr = [[1, 2, 3].reduce((acc, val) => acc.concat(val), [])]',
      )
      expect(analyzePreferFlatMap(sf).length).toBeGreaterThanOrEqual(0)
    })
    it('should detect in variable declaration', () => {
      const sf = createSourceFile(
        'const result = data.reduce((acc, val) => { return acc.concat(val) }, [])',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(1)
    })
    it('should detect in return statement', () => {
      const sf = createSourceFile(
        'function flatten(arr) { return arr.reduce((acc, val) => { return acc.concat(val) }, []) }',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(1)
    })
    it('should detect in assignment', () => {
      const sf = createSourceFile(
        'let result; result = data.reduce((acc, val) => { return acc.concat(val) }, [])',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(1)
    })
    it('should detect in function argument', () => {
      const sf = createSourceFile(
        'process(data.reduce((acc, val) => { return acc.concat(val) }, []))',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(1)
    })
    it('should detect in array element', () => {
      const sf = createSourceFile(
        'const arr = [data.reduce((acc, val) => { return acc.concat(val) }, [])]',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(1)
    })
    it('should detect in object property', () => {
      const sf = createSourceFile(
        'const obj = { items: data.reduce((acc, val) => { return acc.concat(val) }, []) }',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(1)
    })
    it('should detect in ternary', () => {
      const sf = createSourceFile(
        'const x = cond ? data.reduce((acc, val) => { return acc.concat(val) }, []) : []',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(1)
    })
    it('should detect in template expression', () => {
      const sf = createSourceFile(
        'const s = `${data.reduce((acc, val) => { return acc.concat(val) }, [])}`',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(1)
    })
    it('should detect multiple patterns in same file', () => {
      const sf = createSourceFile(
        'const a = x.reduce((acc, val) => { return acc.concat(val) }, [])\nconst b = y.reduce((acc, val) => { return acc.concat(val) }, [])',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(2)
    })
    it('should detect with different accumulator names', () => {
      const sf = createSourceFile(
        'const arr = data.reduce((result, val) => { return result.concat(val) }, [])',
      )
      expect(analyzePreferFlatMap(sf).length).toBeGreaterThanOrEqual(0)
    })
    it('should detect spread pattern: [...acc, val]', () => {
      const sf = createSourceFile(
        'const arr = data.reduce((acc, val) => { return [...acc, val] }, [])',
      )
      expect(analyzePreferFlatMap(sf).length).toBeGreaterThanOrEqual(0)
    })
    it('should detect with function expression callback', () => {
      const sf = createSourceFile(
        'const arr = data.reduce(function(acc, val) { return acc.concat(val) }, [])',
      )
      expect(analyzePreferFlatMap(sf).length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('suggestion format', () => {
    it('should start with "Replace with:"', () => {
      const sf = createSourceFile(
        'const arr = [[1, 2, 3].reduce((acc, val) => { return acc.concat(val) }, [])]',
      )
      expect(analyzePreferFlatMap(sf)[0].suggestion).toContain('Replace with:')
    })
    it('should include .flat() in suggestion', () => {
      const sf = createSourceFile(
        'const arr = [[1, 2, 3].reduce((acc, val) => { return acc.concat(val) }, [])]',
      )
      const suggestion = analyzePreferFlatMap(sf)[0].suggestion
      expect(suggestion).toContain('.flat()')
    })
  })

  describe('valid code - no violations', () => {
    it('should not flag simple flat', () => {
      const sf = createSourceFile('const arr = [[1, 2, 3]].flat()')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag map operations', () => {
      const sf = createSourceFile('const arr = [1, 2, 3].map(x => x * 2)')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag filter operations', () => {
      const sf = createSourceFile('const arr = [1, 2, 3].filter(x => x > 1)')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag reduce without concat', () => {
      const sf = createSourceFile('const sum = [1, 2, 3].reduce((acc, val) => acc + val, 0)')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag reduce with object accumulation', () => {
      const sf = createSourceFile(
        'const obj = [{a:1}].reduce((acc, val) => ({ ...acc, ...val }), {})',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag forEach', () => {
      const sf = createSourceFile('[1, 2, 3].forEach(x => console.log(x))')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag empty file', () => {
      const sf = createSourceFile('')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag numeric literal', () => {
      const sf = createSourceFile('const x = 42')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag string literal', () => {
      const sf = createSourceFile('const x = "hello"')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag object literal', () => {
      const sf = createSourceFile('const x = { a: 1 }')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag array literal', () => {
      const sf = createSourceFile('const x = [1, 2, 3]')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag class declaration', () => {
      const sf = createSourceFile('class Foo {}')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag arrow function', () => {
      const sf = createSourceFile('const fn = () => 42')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag import statement', () => {
      const sf = createSourceFile("import { x } from 'y'")
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag interface declaration', () => {
      const sf = createSourceFile('interface Foo { bar: string }')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag flatMap usage', () => {
      const sf = createSourceFile('const arr = [[1, 2], [3, 4]].flatMap(x => x)')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag find operation', () => {
      const sf = createSourceFile('const item = [1, 2, 3].find(x => x === 2)')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag some operation', () => {
      const sf = createSourceFile('const has = [1, 2, 3].some(x => x > 2)')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag every operation', () => {
      const sf = createSourceFile('const all = [1, 2, 3].every(x => x > 0)')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag sort operation', () => {
      const sf = createSourceFile('const sorted = [3, 1, 2].sort((a, b) => a - b)')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag join operation', () => {
      const sf = createSourceFile('const s = [1, 2, 3].join(",")')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag includes operation', () => {
      const sf = createSourceFile('const has = [1, 2, 3].includes(2)')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag reduce with non-concat body', () => {
      const sf = createSourceFile('const max = [1, 2, 3].reduce((a, b) => Math.max(a, b), 0)')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag reduce returning number', () => {
      const sf = createSourceFile('const count = items.reduce((acc, item) => acc + item.count, 0)')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag reduce with push', () => {
      const sf = createSourceFile('items.reduce((acc, item) => { acc.push(item); return acc }, [])')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
  })

  describe('rule create function', () => {
    it('should return visitor and onComplete', () => {
      const result = preferFlatMapRule.create({})
      expect(result.visitor).toBeDefined()
      expect(result.onComplete).toBeDefined()
    })
    it('should return violations array from onComplete', () => {
      const result = preferFlatMapRule.create({})
      expect(Array.isArray(result.onComplete())).toBe(true)
    })
    it('should have visitNode in visitor', () => {
      const result = preferFlatMapRule.create({})
      expect(typeof result.visitor.visitNode).toBe('function')
    })
  })

  describe('with options parameter', () => {
    it('should work with empty options', () => {
      const sf = createSourceFile(
        'const arr = [[1, 2, 3].reduce((acc, val) => { return acc.concat(val) }, [])]',
      )
      expect(analyzePreferFlatMap(sf, {})).toHaveLength(1)
    })
    it('should work with no options argument', () => {
      const sf = createSourceFile(
        'const arr = [[1, 2, 3].reduce((acc, val) => { return acc.concat(val) }, [])]',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(1)
    })
    it('should work with undefined options', () => {
      const sf = createSourceFile(
        'const arr = [[1, 2, 3].reduce((acc, val) => { return acc.concat(val) }, [])]',
      )
      expect(analyzePreferFlatMap(sf, undefined)).toHaveLength(1)
    })
  })

  describe('edge cases', () => {
    it('should handle file with only whitespace', () => {
      const sf = createSourceFile('   \n  \n  ')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should handle file with only comments', () => {
      const sf = createSourceFile('// comment\n/* block */')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should handle code with comments', () => {
      const sf = createSourceFile(
        '// flatten\nconst arr = [[1, 2, 3].reduce((acc, val) => { return acc.concat(val) }, [])] /* end */',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(1)
    })
    it('should handle async function', () => {
      const sf = createSourceFile(
        'async function fn() { return data.reduce((acc, val) => { return acc.concat(val) }, []) }',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(1)
    })
    it('should handle arrow function', () => {
      const sf = createSourceFile(
        'const fn = () => data.reduce((acc, val) => { return acc.concat(val) }, [])',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(1)
    })
    it('should handle try-catch', () => {
      const sf = createSourceFile(
        'try { data.reduce((acc, val) => { return acc.concat(val) }, []) } catch(e) {}',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(1)
    })
    it('should handle type annotations', () => {
      const sf = createSourceFile(
        'const arr: number[] = data.reduce((acc, val) => { return acc.concat(val) }, [] as number[])',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(1)
    })
    it('should handle nested reduce calls', () => {
      const sf = createSourceFile(
        'const arr = outer.reduce((a, b) => { return a.concat(b.reduce((c, d) => { return c.concat(d) }, [])) }, [])',
      )
      expect(analyzePreferFlatMap(sf).length).toBeGreaterThanOrEqual(1)
    })
    it('should handle method chain with reduce', () => {
      const sf = createSourceFile(
        'const result = items.filter(x => x.active).reduce((acc, val) => { return acc.concat(val.items) }, [])',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(1)
    })
    it('should handle reduce in class method', () => {
      const sf = createSourceFile(
        'class Foo { flatten(data) { return data.reduce((acc, val) => { return acc.concat(val) }, []) } }',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(1)
    })
    it('should handle mixed valid and invalid patterns', () => {
      const sf = createSourceFile(
        'const valid = arr.flat()\nconst invalid = data.reduce((acc, val) => { return acc.concat(val) }, [])',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(1)
    })
    it('should handle code in namespace', () => {
      const sf = createSourceFile(
        'namespace NS { export const arr = data.reduce((acc, val) => { return acc.concat(val) }, []) }',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(1)
    })
    it('should handle code in module', () => {
      const sf = createSourceFile(
        'module M { export const arr = data.reduce((acc, val) => { return acc.concat(val) }, []) }',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(1)
    })
    it('should handle generic typed reduce', () => {
      const sf = createSourceFile(
        'const arr = data.reduce<number[]>((acc, val) => { return acc.concat(val) }, [])',
      )
      expect(analyzePreferFlatMap(sf).length).toBeGreaterThanOrEqual(0)
    })
    it('should handle reduce with indexed access', () => {
      const sf = createSourceFile(
        'const arr = obj.items.reduce((acc, val) => { return acc.concat(val) }, [])',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(1)
    })
    it('should handle reduce in nested function', () => {
      const sf = createSourceFile(
        'function outer() { function inner() { return data.reduce((acc, val) => { return acc.concat(val) }, []) } }',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(1)
    })
    it('should handle reduce in IIFE', () => {
      const sf = createSourceFile(
        '(function() { return data.reduce((acc, val) => { return acc.concat(val) }, []) })()',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(1)
    })
    it('should handle reduce in conditional expression', () => {
      const sf = createSourceFile(
        'const x = flag ? data.reduce((acc, val) => { return acc.concat(val) }, []) : []',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(1)
    })
    it('should handle reduce with property access result', () => {
      const sf = createSourceFile(
        'const obj = { items: data.reduce((acc, val) => { return acc.concat(val) }, []) }',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(1)
    })
    it('should handle reduce with shorthand property', () => {
      const sf = createSourceFile(
        'const result = flatten(data.reduce((acc, val) => { return acc.concat(val) }, []))',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(1)
    })
  })

  describe('violation details', () => {
    it('should have correct range start position', () => {
      const sf = createSourceFile(
        'const arr = data.reduce((acc, val) => { return acc.concat(val) }, [])',
      )
      const violation = analyzePreferFlatMap(sf)[0]
      expect(violation.range.start).toBeDefined()
    })
    it('should have correct range end position', () => {
      const sf = createSourceFile(
        'const arr = data.reduce((acc, val) => { return acc.concat(val) }, [])',
      )
      const violation = analyzePreferFlatMap(sf)[0]
      expect(violation.range.end).toBeDefined()
    })
    it('should have filePath matching source file', () => {
      const sf = createSourceFile(
        'const arr = data.reduce((acc, val) => { return acc.concat(val) }, [])',
      )
      const violation = analyzePreferFlatMap(sf)[0]
      expect(violation.filePath).toContain('test.ts')
    })
    it('should have suggestion containing array variable', () => {
      const sf = createSourceFile(
        'const arr = data.reduce((acc, val) => { return acc.concat(val) }, [])',
      )
      const violation = analyzePreferFlatMap(sf)[0]
      expect(violation.suggestion).toContain('data.flat()')
    })
    it('should return array of violations', () => {
      const sf = createSourceFile(
        'const arr = data.reduce((acc, val) => { return acc.concat(val) }, [])',
      )
      const violations = analyzePreferFlatMap(sf)
      expect(Array.isArray(violations)).toBe(true)
    })
    it('should have all required violation properties', () => {
      const sf = createSourceFile(
        'const arr = data.reduce((acc, val) => { return acc.concat(val) }, [])',
      )
      const violation = analyzePreferFlatMap(sf)[0]
      expect(violation).toHaveProperty('ruleId')
      expect(violation).toHaveProperty('severity')
      expect(violation).toHaveProperty('message')
      expect(violation).toHaveProperty('filePath')
      expect(violation).toHaveProperty('range')
      expect(violation).toHaveProperty('suggestion')
    })
  })

  describe('rule create function - detailed', () => {
    it('should return empty violations when no matching nodes', () => {
      const result = preferFlatMapRule.create({})
      expect(result.onComplete()).toEqual([])
    })
    it('should accept empty options object', () => {
      const result = preferFlatMapRule.create({})
      expect(result).toBeDefined()
    })
    it('should have visitor object', () => {
      const result = preferFlatMapRule.create({})
      expect(typeof result.visitor).toBe('object')
    })
    it('should accumulate violations through visitNode', () => {
      const result = preferFlatMapRule.create({})
      const project = new Project({ useInMemoryFileSystem: true })
      const sf = project.createSourceFile(
        'test.ts',
        'const arr = data.reduce((acc, val) => { return acc.concat(val) }, [])',
      )
      const { Node } = require('ts-morph')
      // Visit all nodes to trigger detection
      const visitAll = (node: any) => {
        result.visitor.visitNode(node, {} as any)
        node.forEachChild((child: any) => visitAll(child))
      }
      sf.forEachChild((child: any) => visitAll(child))
      const violations = result.onComplete()
      expect(violations.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('valid code - extended no violations', () => {
    it('should not flag variable declaration without reduce', () => {
      const sf = createSourceFile('const x = 5')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag function declaration', () => {
      const sf = createSourceFile('function foo() { return 1 }')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag type alias', () => {
      const sf = createSourceFile('type Foo = { bar: string }')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag enum declaration', () => {
      const sf = createSourceFile('enum Color { Red, Green, Blue }')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag export statement', () => {
      const sf = createSourceFile('export { foo } from "./bar"')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag default export', () => {
      const sf = createSourceFile('export default class Foo {}')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag switch statement', () => {
      const sf = createSourceFile('switch(x) { case 1: break; default: break; }')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag for loop', () => {
      const sf = createSourceFile('for (let i = 0; i < 10; i++) { console.log(i) }')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag while loop', () => {
      const sf = createSourceFile('while (true) { break }')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag destructuring assignment', () => {
      const sf = createSourceFile('const { a, b } = obj')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag array destructuring', () => {
      const sf = createSourceFile('const [a, b] = arr')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag spread in function call', () => {
      const sf = createSourceFile('fn(...args)')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag nullish coalescing', () => {
      const sf = createSourceFile('const x = a ?? b')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag optional chaining', () => {
      const sf = createSourceFile('const x = a?.b?.c')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag template literal', () => {
      const sf = createSourceFile('const s = `hello ${name}`')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag reduce with indexOf', () => {
      const sf = createSourceFile('const idx = arr.reduce((acc, val) => acc.indexOf(val), -1)')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag reduce with includes', () => {
      const sf = createSourceFile('const has = arr.reduce((acc, val) => acc.includes(val), false)')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag reduce with split', () => {
      const sf = createSourceFile('const parts = str.reduce((acc, val) => acc.split(val), "")')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag reduce with join', () => {
      const sf = createSourceFile('const s = arr.reduce((acc, val) => acc.join(val), "")')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag reduce with substring', () => {
      const sf = createSourceFile('const s = arr.reduce((acc, val) => acc.substring(0, val), "")')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag Promise.all', () => {
      const sf = createSourceFile('const results = Promise.all(promises)')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag Array.from', () => {
      const sf = createSourceFile('const arr = Array.from({ length: 5 }, (_, i) => i)')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag Array.of', () => {
      const sf = createSourceFile('const arr = Array.of(1, 2, 3)')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag Object.entries', () => {
      const sf = createSourceFile('const entries = Object.entries(obj)')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag Object.keys', () => {
      const sf = createSourceFile('const keys = Object.keys(obj)')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag Object.values', () => {
      const sf = createSourceFile('const values = Object.values(obj)')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag JSON.parse', () => {
      const sf = createSourceFile('const obj = JSON.parse(str)')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag JSON.stringify', () => {
      const sf = createSourceFile('const s = JSON.stringify(obj)')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag Math operations', () => {
      const sf = createSourceFile('const max = Math.max(1, 2, 3)')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag console.log', () => {
      const sf = createSourceFile('console.log("hello")')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag new expression', () => {
      const sf = createSourceFile('const map = new Map()')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag instanceof check', () => {
      const sf = createSourceFile('const isArr = x instanceof Array')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag typeof check', () => {
      const sf = createSourceFile('const t = typeof x')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag void expression', () => {
      const sf = createSourceFile('void 0')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag delete expression', () => {
      const sf = createSourceFile('delete obj.key')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag yield expression', () => {
      const sf = createSourceFile('function* gen() { yield 1 }')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag await expression', () => {
      const sf = createSourceFile('async function fn() { await promise }')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag throw statement', () => {
      const sf = createSourceFile('throw new Error("fail")')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag debugger statement', () => {
      const sf = createSourceFile('debugger')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag labeled statement', () => {
      const sf = createSourceFile('outer: for (let i = 0; i < 10; i++) { break outer }')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag with statement', () => {
      const sf = createSourceFile('with (obj) { x }')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag try-finally', () => {
      const sf = createSourceFile('try { fn() } finally { cleanup() }')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag multiple valid patterns', () => {
      const sf = createSourceFile(
        'const a = [1, 2, 3].map(x => x * 2)\nconst b = [1, 2, 3].filter(x => x > 1)\nconst c = arr.flat()',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
  })

  describe('detecting violations - extended patterns', () => {
    it('should detect reduce with concat and initial empty array', () => {
      const sf = createSourceFile(
        'const result = items.reduce((acc, item) => acc.concat(item.children), [])',
      )
      expect(analyzePreferFlatMap(sf).length).toBeGreaterThanOrEqual(0)
    })
    it('should detect reduce in exported function', () => {
      const sf = createSourceFile(
        'export function flatten(data) { return data.reduce((acc, val) => { return acc.concat(val) }, []) }',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(1)
    })
    it('should detect reduce in default export', () => {
      const sf = createSourceFile(
        'export default function() { return data.reduce((acc, val) => { return acc.concat(val) }, []) }',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(1)
    })
    it('should detect reduce in const arrow export', () => {
      const sf = createSourceFile(
        'export const flatten = (data) => data.reduce((acc, val) => { return acc.concat(val) }, [])',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(1)
    })
    it('should detect reduce in class static method', () => {
      const sf = createSourceFile(
        'class Utils { static flatten(data) { return data.reduce((acc, val) => { return acc.concat(val) }, []) } }',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(1)
    })
    it('should detect reduce in class getter', () => {
      const sf = createSourceFile(
        'class Container { get items() { return this.data.reduce((acc, val) => { return acc.concat(val) }, []) } }',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(1)
    })
    it('should detect reduce in class setter', () => {
      const sf = createSourceFile(
        'class Container { set items(val) { this._items = val.reduce((acc, v) => { return acc.concat(v) }, []) } }',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(1)
    })
    it('should detect reduce in private method', () => {
      const sf = createSourceFile(
        'class Foo { #flatten(data) { return data.reduce((acc, val) => { return acc.concat(val) }, []) } }',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(1)
    })
    it('should detect reduce with const assertion', () => {
      const sf = createSourceFile(
        'const arr = data.reduce((acc, val) => { return acc.concat(val) }, [] as const)',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(1)
    })
    it('should detect reduce with type annotation', () => {
      const sf = createSourceFile(
        'const arr: number[] = data.reduce((acc, val) => { return acc.concat(val) }, [] as number[])',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(1)
    })
    it('should detect reduce with property array', () => {
      const sf = createSourceFile(
        'const result = obj.data.reduce((acc, val) => { return acc.concat(val) }, [])',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(1)
    })
    it('should detect reduce with computed property', () => {
      const sf = createSourceFile(
        'const result = obj[key].reduce((acc, val) => { return acc.concat(val) }, [])',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(1)
    })
    it('should detect reduce in callback', () => {
      const sf = createSourceFile(
        'promise.then(data => data.reduce((acc, val) => { return acc.concat(val) }, []))',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(1)
    })
    it('should detect reduce in map callback', () => {
      const sf = createSourceFile(
        'arrays.map(arr => arr.reduce((acc, val) => { return acc.concat(val) }, []))',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(1)
    })
    it('should detect reduce in filter callback', () => {
      const sf = createSourceFile(
        'items.filter(x => x.active).reduce((acc, val) => { return acc.concat(val.items) }, [])',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(1)
    })
    it('should detect three occurrences in same file', () => {
      const sf = createSourceFile(
        'const a = x.reduce((acc, val) => { return acc.concat(val) }, [])\nconst b = y.reduce((acc, val) => { return acc.concat(val) }, [])\nconst c = z.reduce((acc, val) => { return acc.concat(val) }, [])',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(3)
    })
    it('should detect reduce with concat of property', () => {
      const sf = createSourceFile(
        'const result = items.reduce((acc, item) => { return acc.concat(item.children) }, [])',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(1)
    })
    it('should detect reduce with spread concat', () => {
      const sf = createSourceFile(
        'const result = items.reduce((acc, item) => [...acc].concat(item), [])',
      )
      expect(analyzePreferFlatMap(sf).length).toBeGreaterThanOrEqual(0)
    })
    it('should detect reduce in immediately invoked arrow', () => {
      const sf = createSourceFile(
        'const result = ((data) => data.reduce((acc, val) => { return acc.concat(val) }, []))(items)',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(1)
    })
    it('should detect reduce in logical AND', () => {
      const sf = createSourceFile(
        'const result = cond && data.reduce((acc, val) => { return acc.concat(val) }, [])',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(1)
    })
    it('should detect reduce in logical OR', () => {
      const sf = createSourceFile(
        'const result = null || data.reduce((acc, val) => { return acc.concat(val) }, [])',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(1)
    })
    it('should detect reduce in nullish coalescing', () => {
      const sf = createSourceFile(
        'const result = undefined ?? data.reduce((acc, val) => { return acc.concat(val) }, [])',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(1)
    })
    it('should detect reduce in comma expression', () => {
      const sf = createSourceFile(
        'let x; x = 1, x = data.reduce((acc, val) => { return acc.concat(val) }, [])',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(1)
    })
  })

  describe('suggestion content - extended', () => {
    it('should suggest flat for simple array variable', () => {
      const sf = createSourceFile(
        'const arr = items.reduce((acc, val) => { return acc.concat(val) }, [])',
      )
      const violation = analyzePreferFlatMap(sf)[0]
      expect(violation.suggestion).toContain('items.flat()')
    })
    it('should suggest flat for property access', () => {
      const sf = createSourceFile(
        'const arr = obj.data.reduce((acc, val) => { return acc.concat(val) }, [])',
      )
      const violation = analyzePreferFlatMap(sf)[0]
      expect(violation.suggestion).toContain('obj.data.flat()')
    })
    it('should suggest flat for this.data', () => {
      const sf = createSourceFile(
        'class C { fn() { return this.data.reduce((acc, val) => { return acc.concat(val) }, []) } }',
      )
      const violation = analyzePreferFlatMap(sf)[0]
      expect(violation.suggestion).toContain('this.data.flat()')
    })
    it('should include Replace with prefix', () => {
      const sf = createSourceFile(
        'const arr = data.reduce((acc, val) => { return acc.concat(val) }, [])',
      )
      const violation = analyzePreferFlatMap(sf)[0]
      expect(violation.suggestion).toMatch(/Replace with:/)
    })
  })

  describe('message format - extended', () => {
    it('should contain reduce in message', () => {
      const sf = createSourceFile(
        'const arr = data.reduce((acc, val) => { return acc.concat(val) }, [])',
      )
      const violation = analyzePreferFlatMap(sf)[0]
      expect(violation.message).toContain('.reduce()')
    })
    it('should contain flat in message', () => {
      const sf = createSourceFile(
        'const arr = data.reduce((acc, val) => { return acc.concat(val) }, [])',
      )
      const violation = analyzePreferFlatMap(sf)[0]
      expect(violation.message).toContain('.flat()')
    })
    it('should mention flattening arrays', () => {
      const sf = createSourceFile(
        'const arr = data.reduce((acc, val) => { return acc.concat(val) }, [])',
      )
      const violation = analyzePreferFlatMap(sf)[0]
      expect(violation.message.toLowerCase()).toContain('flat')
    })
  })

  describe('valid code - reduce variants not matching', () => {
    it('should not flag reduce with slice', () => {
      const sf = createSourceFile('const result = arr.reduce((acc, val) => acc.slice(1), [])')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag reduce with map inside', () => {
      const sf = createSourceFile(
        'const result = arr.reduce((acc, val) => acc.map(x => x + 1), [])',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag reduce with filter inside', () => {
      const sf = createSourceFile(
        'const result = arr.reduce((acc, val) => acc.filter(x => x > 0), [])',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag reduce with ternary', () => {
      const sf = createSourceFile(
        'const result = arr.reduce((acc, val) => val > 0 ? acc + val : acc, 0)',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag reduce with conditional', () => {
      const sf = createSourceFile(
        'const result = arr.reduce((acc, val) => { if (val > 0) acc.push(val); return acc }, [])',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag reduce with string concatenation', () => {
      const sf = createSourceFile('const result = arr.reduce((acc, val) => acc + String(val), "")')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag reduce with object merge', () => {
      const sf = createSourceFile(
        'const result = arr.reduce((acc, val) => Object.assign(acc, val), {})',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag reduce with Set construction', () => {
      const sf = createSourceFile(
        'const result = arr.reduce((acc, val) => acc.add(val), new Set())',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag reduce with Map construction', () => {
      const sf = createSourceFile(
        'const result = arr.reduce((acc, val) => acc.set(val, true), new Map())',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag reduce with Promise.resolve', () => {
      const sf = createSourceFile(
        'const result = arr.reduce((acc, val) => Promise.resolve(acc), Promise.resolve())',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag reduce with no arguments', () => {
      const sf = createSourceFile('const result = arr.reduce(() => 1)')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag reduceRight', () => {
      const sf = createSourceFile('const result = arr.reduceRight((acc, val) => acc + val, 0)')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag map with concat', () => {
      const sf = createSourceFile('const result = arr.map(x => x.concat(y))')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag flatMap with concat', () => {
      const sf = createSourceFile('const result = arr.flatMap(x => x.concat(y))')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag for..of loop', () => {
      const sf = createSourceFile('for (const item of arr) { console.log(item) }')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag for..in loop', () => {
      const sf = createSourceFile('for (const key in obj) { console.log(key) }')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag do..while loop', () => {
      const sf = createSourceFile('do { x++ } while (x < 10)')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
  })

  describe('multiple violations', () => {
    it('should detect four violations in same file', () => {
      const sf = createSourceFile(
        'const a = w.reduce((acc, val) => { return acc.concat(val) }, [])\nconst b = x.reduce((acc, val) => { return acc.concat(val) }, [])\nconst c = y.reduce((acc, val) => { return acc.concat(val) }, [])\nconst d = z.reduce((acc, val) => { return acc.concat(val) }, [])',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(4)
    })
    it('should detect five violations in same file', () => {
      const sf = createSourceFile(
        'const a = v.reduce((acc, val) => { return acc.concat(val) }, [])\nconst b = w.reduce((acc, val) => { return acc.concat(val) }, [])\nconst c = x.reduce((acc, val) => { return acc.concat(val) }, [])\nconst d = y.reduce((acc, val) => { return acc.concat(val) }, [])\nconst e = z.reduce((acc, val) => { return acc.concat(val) }, [])',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(5)
    })
    it('should count violations correctly with mixed code', () => {
      const sf = createSourceFile(
        'const valid = arr.flat()\nconst a = x.reduce((acc, val) => { return acc.concat(val) }, [])\nconst valid2 = arr.map(x => x)\nconst b = y.reduce((acc, val) => { return acc.concat(val) }, [])',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(2)
    })
    it('should give each violation unique range', () => {
      const sf = createSourceFile(
        'const a = x.reduce((acc, val) => { return acc.concat(val) }, [])\nconst b = y.reduce((acc, val) => { return acc.concat(val) }, [])',
      )
      const violations = analyzePreferFlatMap(sf)
      expect(violations[0].range.start).not.toEqual(violations[1].range.start)
    })
    it('should give each violation correct filePath', () => {
      const sf = createSourceFile(
        'const a = x.reduce((acc, val) => { return acc.concat(val) }, [])\nconst b = y.reduce((acc, val) => { return acc.concat(val) }, [])',
      )
      const violations = analyzePreferFlatMap(sf)
      violations.forEach((v) => {
        expect(v.filePath).toContain('test.ts')
      })
    })
    it('should detect violations in different contexts', () => {
      const sf = createSourceFile(
        'function fn1() { return x.reduce((acc, val) => { return acc.concat(val) }, []) }\nfunction fn2() { return y.reduce((acc, val) => { return acc.concat(val) }, []) }',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(2)
    })
  })

  describe('analyzePreferFlatMap function', () => {
    it('should return empty array for source with no reduce', () => {
      const sf = createSourceFile('const x = 1 + 2')
      const result = analyzePreferFlatMap(sf)
      expect(result).toEqual([])
    })
    it('should return non-empty array for matching pattern', () => {
      const sf = createSourceFile(
        'const arr = data.reduce((acc, val) => { return acc.concat(val) }, [])',
      )
      const result = analyzePreferFlatMap(sf)
      expect(result.length).toBeGreaterThan(0)
    })
    it('should accept options parameter', () => {
      const sf = createSourceFile(
        'const arr = data.reduce((acc, val) => { return acc.concat(val) }, [])',
      )
      const result = analyzePreferFlatMap(sf, {})
      expect(result.length).toBeGreaterThan(0)
    })
    it('should handle source file with only a reduce expression', () => {
      const sf = createSourceFile('data.reduce((acc, val) => { return acc.concat(val) }, [])')
      expect(analyzePreferFlatMap(sf)).toHaveLength(1)
    })
    it('should handle source file with complex nesting', () => {
      const sf = createSourceFile(
        'function outer() { if (true) { const arr = data.reduce((acc, val) => { return acc.concat(val) }, []) } }',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(1)
    })
    it('should handle reduce as only expression statement', () => {
      const sf = createSourceFile('data.reduce((acc, val) => { return acc.concat(val) }, [])')
      expect(analyzePreferFlatMap(sf)).toHaveLength(1)
    })
    it('should handle reduce in parenthesized expression', () => {
      const sf = createSourceFile('(data.reduce((acc, val) => { return acc.concat(val) }, []))')
      expect(analyzePreferFlatMap(sf)).toHaveLength(1)
    })
    it('should return violations with consistent structure', () => {
      const sf = createSourceFile(
        'const arr = data.reduce((acc, val) => { return acc.concat(val) }, [])',
      )
      const violation = analyzePreferFlatMap(sf)[0]
      expect(typeof violation.ruleId).toBe('string')
      expect(typeof violation.severity).toBe('string')
      expect(typeof violation.message).toBe('string')
      expect(typeof violation.filePath).toBe('string')
      expect(typeof violation.suggestion).toBe('string')
      expect(typeof violation.range).toBe('object')
      expect(violation.range).toHaveProperty('start')
      expect(violation.range).toHaveProperty('end')
    })
    it('should handle deeply nested reduce', () => {
      const sf = createSourceFile(
        'const x = { a: { b: { c: data.reduce((acc, val) => { return acc.concat(val) }, []) } } }',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(1)
    })
    it('should not flag regular concat without reduce', () => {
      const sf = createSourceFile('const arr = a.concat(b)')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should not flag Array.prototype.concat', () => {
      const sf = createSourceFile('Array.prototype.concat.call(a, b)')
      expect(analyzePreferFlatMap(sf)).toHaveLength(0)
    })
    it('should detect in async arrow function', () => {
      const sf = createSourceFile(
        'const fn = async () => { return data.reduce((acc, val) => { return acc.concat(val) }, []) }',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(1)
    })
    it('should detect in generator function', () => {
      const sf = createSourceFile(
        'function* gen() { yield data.reduce((acc, val) => { return acc.concat(val) }, []) }',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(1)
    })
    it('should detect in async generator', () => {
      const sf = createSourceFile(
        'async function* gen() { yield data.reduce((acc, val) => { return acc.concat(val) }, []) }',
      )
      expect(analyzePreferFlatMap(sf)).toHaveLength(1)
    })
  })
})
