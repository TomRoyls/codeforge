import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import {
  analyzePreferForOf,
  preferForOfRule,
} from '../../../../src/rules/best-practices/prefer-for-of.js'

function createSourceFile(code: string) {
  const project = new Project({ useInMemoryFileSystem: true })
  return project.createSourceFile('test.ts', code)
}

describe('prefer-for-of rule', () => {
  describe('rule metadata', () => {
    it('should have correct name', () => {
      expect(preferForOfRule.meta.name).toBe('prefer-for-of')
    })
    it('should have correct category', () => {
      expect(preferForOfRule.meta.category).toBe('style')
    })
    it('should be fixable', () => {
      expect(preferForOfRule.meta.fixable).toBe('code')
    })
    it('should have a description', () => {
      expect(preferForOfRule.meta.description).toBeDefined()
      expect(preferForOfRule.meta.description.length).toBeGreaterThan(0)
    })
    it('should have default options', () => {
      expect(preferForOfRule.defaultOptions).toBeDefined()
    })
    it('should have a create function', () => {
      expect(preferForOfRule.create).toBeTypeOf('function')
    })
    it('should have meta property', () => {
      expect(preferForOfRule).toHaveProperty('meta')
    })
    it('should not be recommended by default', () => {
      expect(preferForOfRule.meta.recommended).toBe(false)
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

    it('should detect simple array access pattern', () => {
      const sourceFile = createSourceFile(`
        for (let i = 0; i < list.length; i++) {
          doSomething(list[i]);
        }
      `)
      const violations = analyzePreferForOf(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should detect with different array names', () => {
      const sourceFile = createSourceFile(`
        for (let j = 0; j < records.length; j++) {
          handle(records[j]);
        }
      `)
      const violations = analyzePreferForOf(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should detect with nested property access array', () => {
      const sourceFile = createSourceFile(`
        for (let i = 0; i < data.items.length; i++) {
          console.log(data.items[i]);
        }
      `)
      const violations = analyzePreferForOf(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should detect with function call on element', () => {
      const sourceFile = createSourceFile(`
        for (let i = 0; i < arr.length; i++) {
          const result = process(arr[i]);
        }
      `)
      const violations = analyzePreferForOf(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should detect with variable assignment from element', () => {
      const sourceFile = createSourceFile(`
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          use(item);
        }
      `)
      const violations = analyzePreferForOf(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should detect with element used in expression', () => {
      const sourceFile = createSourceFile(`
        for (let i = 0; i < nums.length; i++) {
          const doubled = nums[i] * 2;
        }
      `)
      const violations = analyzePreferForOf(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should detect with element passed to method', () => {
      const sourceFile = createSourceFile(`
        for (let i = 0; i < arr.length; i++) {
          console.log(arr[i].name);
        }
      `)
      const violations = analyzePreferForOf(sourceFile)
      expect(violations).toHaveLength(1)
    })
  })

  describe('violation properties', () => {
    it('should have correct ruleId', () => {
      const sourceFile = createSourceFile(`
        for (let i = 0; i < arr.length; i++) {
          console.log(arr[i]);
        }
      `)
      const violations = analyzePreferForOf(sourceFile)
      expect(violations[0].ruleId).toBe('prefer-for-of')
    })

    it('should have info severity', () => {
      const sourceFile = createSourceFile(`
        for (let i = 0; i < arr.length; i++) {
          console.log(arr[i]);
        }
      `)
      const violations = analyzePreferForOf(sourceFile)
      expect(violations[0].severity).toBe('info')
    })

    it('should have a message', () => {
      const sourceFile = createSourceFile(`
        for (let i = 0; i < arr.length; i++) {
          console.log(arr[i]);
        }
      `)
      const violations = analyzePreferForOf(sourceFile)
      expect(violations[0].message).toBeDefined()
      expect(violations[0].message.length).toBeGreaterThan(0)
    })

    it('should have a suggestion', () => {
      const sourceFile = createSourceFile(`
        for (let i = 0; i < arr.length; i++) {
          console.log(arr[i]);
        }
      `)
      const violations = analyzePreferForOf(sourceFile)
      expect(violations[0].suggestion).toBeDefined()
      expect(violations[0].suggestion).toContain('for (const item of arr)')
    })

    it('should include array name in suggestion', () => {
      const sourceFile = createSourceFile(`
        for (let i = 0; i < myArray.length; i++) {
          use(myArray[i]);
        }
      `)
      const violations = analyzePreferForOf(sourceFile)
      expect(violations[0].suggestion).toContain('myArray')
    })

    it('should have a range', () => {
      const sourceFile = createSourceFile(`
        for (let i = 0; i < arr.length; i++) {
          console.log(arr[i]);
        }
      `)
      const violations = analyzePreferForOf(sourceFile)
      expect(violations[0].range).toBeDefined()
    })

    it('should have a filePath', () => {
      const sourceFile = createSourceFile(`
        for (let i = 0; i < arr.length; i++) {
          console.log(arr[i]);
        }
      `)
      const violations = analyzePreferForOf(sourceFile)
      expect(violations[0].filePath).toBeDefined()
    })
  })

  describe('valid code - no violations', () => {
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

    it('should not flag forEach calls', () => {
      const sourceFile = createSourceFile('arr.forEach(item => console.log(item));')
      const violations = analyzePreferForOf(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag map calls', () => {
      const sourceFile = createSourceFile('arr.map(item => item * 2);')
      const violations = analyzePreferForOf(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag for loops with > operator', () => {
      const sourceFile = createSourceFile(`
        for (let i = 0; i > arr.length; i++) {
          console.log(arr[i]);
        }
      `)
      const violations = analyzePreferForOf(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag for loops with <= operator', () => {
      const sourceFile = createSourceFile(`
        for (let i = 0; i <= arr.length; i++) {
          console.log(arr[i]);
        }
      `)
      const violations = analyzePreferForOf(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag for loops with >= operator', () => {
      const sourceFile = createSourceFile(`
        for (let i = 0; i >= arr.length; i++) {
          console.log(arr[i]);
        }
      `)
      const violations = analyzePreferForOf(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag for loops without .length', () => {
      const sourceFile = createSourceFile(`
        for (let i = 0; i < 10; i++) {
          console.log(arr[i]);
        }
      `)
      const violations = analyzePreferForOf(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag for loops with i-- decrement', () => {
      const sourceFile = createSourceFile(`
        for (let i = arr.length - 1; i >= 0; i--) {
          console.log(arr[i]);
        }
      `)
      const violations = analyzePreferForOf(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag for loops with i += 2', () => {
      const sourceFile = createSourceFile(`
        for (let i = 0; i < arr.length; i += 2) {
          console.log(arr[i]);
        }
      `)
      const violations = analyzePreferForOf(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag for loops with no initializer', () => {
      const sourceFile = createSourceFile(`
        let i = 0;
        for (; i < arr.length; i++) {
          console.log(arr[i]);
        }
      `)
      const violations = analyzePreferForOf(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag for loops without block body', () => {
      const sourceFile = createSourceFile(`
        for (let i = 0; i < arr.length; i++)
          console.log(arr[i]);
      `)
      const violations = analyzePreferForOf(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag for loops with multiple declarations', () => {
      const sourceFile = createSourceFile(`
        for (let i = 0, j = 0; i < arr.length; i++) {
          console.log(arr[i]);
        }
      `)
      const violations = analyzePreferForOf(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag for loops using index for math', () => {
      const sourceFile = createSourceFile(`
        for (let i = 0; i < arr.length; i++) {
          const offset = i * 2;
          console.log(arr[i], offset);
        }
      `)
      const violations = analyzePreferForOf(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag for loops using index in template literal', () => {
      const sourceFile = createSourceFile(`
        for (let i = 0; i < arr.length; i++) {
          console.log(\`\${i}: \${arr[i]}\`);
        }
      `)
      const violations = analyzePreferForOf(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag regular function declarations', () => {
      const sourceFile = createSourceFile('function foo() { return 1; }')
      const violations = analyzePreferForOf(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag arrow functions', () => {
      const sourceFile = createSourceFile('const fn = () => 42;')
      const violations = analyzePreferForOf(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag class declarations', () => {
      const sourceFile = createSourceFile('class Foo { bar() {} }')
      const violations = analyzePreferForOf(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag interface declarations', () => {
      const sourceFile = createSourceFile('interface Foo { bar: string; }')
      const violations = analyzePreferForOf(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag type declarations', () => {
      const sourceFile = createSourceFile('type Foo = { bar: string };')
      const violations = analyzePreferForOf(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag enum declarations', () => {
      const sourceFile = createSourceFile('enum Color { Red, Green, Blue }')
      const violations = analyzePreferForOf(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag variable declarations', () => {
      const sourceFile = createSourceFile('const x = 5;')
      const violations = analyzePreferForOf(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag if statements', () => {
      const sourceFile = createSourceFile('if (x > 0) { console.log(x); }')
      const violations = analyzePreferForOf(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag switch statements', () => {
      const sourceFile = createSourceFile('switch(x) { case 1: break; default: break; }')
      const violations = analyzePreferForOf(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag try-catch statements', () => {
      const sourceFile = createSourceFile('try { fn(); } catch(e) { console.log(e); }')
      const violations = analyzePreferForOf(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag empty file', () => {
      const sourceFile = createSourceFile('')
      const violations = analyzePreferForOf(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag for loop with different condition variable', () => {
      const sourceFile = createSourceFile(`
        for (let i = 0; j < arr.length; i++) {
          console.log(arr[i]);
        }
      `)
      const violations = analyzePreferForOf(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag for loop with non-numeric initializer', () => {
      const sourceFile = createSourceFile(`
        for (let i = "0"; i < arr.length; i++) {
          console.log(arr[i]);
        }
      `)
      const violations = analyzePreferForOf(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag do-while loops', () => {
      const sourceFile = createSourceFile(`
        let i = 0;
        do {
          console.log(arr[i]);
          i++;
        } while (i < arr.length);
      `)
      const violations = analyzePreferForOf(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag for loop where index is used as argument', () => {
      const sourceFile = createSourceFile(`
        for (let i = 0; i < arr.length; i++) {
          save(arr[i], i);
        }
      `)
      const violations = analyzePreferForOf(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag for loop where index is used in condition', () => {
      const sourceFile = createSourceFile(`
        for (let i = 0; i < arr.length; i++) {
          if (i > 5) break;
          console.log(arr[i]);
        }
      `)
      const violations = analyzePreferForOf(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag for loop where index is returned', () => {
      const sourceFile = createSourceFile(`
        function find() {
          for (let i = 0; i < arr.length; i++) {
            if (arr[i] > 0) return i;
          }
          return -1;
        }
      `)
      const violations = analyzePreferForOf(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag for loop where index is assigned to variable', () => {
      const sourceFile = createSourceFile(`
        for (let i = 0; i < arr.length; i++) {
          const idx = i;
          console.log(arr[i], idx);
        }
      `)
      const violations = analyzePreferForOf(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag for loop pushing index to array', () => {
      const sourceFile = createSourceFile(`
        const indices = [];
        for (let i = 0; i < arr.length; i++) {
          indices.push(i);
          console.log(arr[i]);
        }
      `)
      const violations = analyzePreferForOf(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag for loop using index in splice', () => {
      const sourceFile = createSourceFile(`
        for (let i = 0; i < arr.length; i++) {
          arr.splice(i, 1);
        }
      `)
      const violations = analyzePreferForOf(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag for loop where index is used with different array', () => {
      const sourceFile = createSourceFile(`
        for (let i = 0; i < arr.length; i++) {
          console.log(other[i]);
        }
      `)
      const violations = analyzePreferForOf(sourceFile)
      expect(violations).toHaveLength(0)
    })
  })

  describe('edge cases', () => {
    it('should detect multiple indexed for loops', () => {
      const sourceFile = createSourceFile(`
        for (let i = 0; i < arr.length; i++) {
          console.log(arr[i]);
        }
        for (let j = 0; j < list.length; j++) {
          console.log(list[j]);
        }
      `)
      const violations = analyzePreferForOf(sourceFile)
      expect(violations).toHaveLength(2)
    })

    it('should detect nested indexed for loops', () => {
      const sourceFile = createSourceFile(`
        for (let i = 0; i < matrix.length; i++) {
          for (let j = 0; j < matrix[i].length; j++) {
            console.log(matrix[i][j]);
          }
        }
      `)
      const violations = analyzePreferForOf(sourceFile)
      expect(violations).toHaveLength(2)
    })

    it('should detect for loop in function', () => {
      const sourceFile = createSourceFile(`
        function process(arr: number[]) {
          for (let i = 0; i < arr.length; i++) {
            console.log(arr[i]);
          }
        }
      `)
      const violations = analyzePreferForOf(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should detect for loop in method', () => {
      const sourceFile = createSourceFile(`
        class Handler {
          process(arr: string[]) {
            for (let i = 0; i < arr.length; i++) {
              this.handle(arr[i]);
            }
          }
        }
      `)
      const violations = analyzePreferForOf(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should detect for loop in arrow function', () => {
      const sourceFile = createSourceFile(`
        const process = (arr: number[]) => {
          for (let i = 0; i < arr.length; i++) {
            console.log(arr[i]);
          }
        };
      `)
      const violations = analyzePreferForOf(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should handle for loop with type annotation', () => {
      const sourceFile = createSourceFile(`
        for (let i: number = 0; i < arr.length; i++) {
          console.log(arr[i]);
        }
      `)
      const violations = analyzePreferForOf(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should detect for loop with this.array access', () => {
      const sourceFile = createSourceFile(`
        for (let i = 0; i < this.items.length; i++) {
          console.log(this.items[i]);
        }
      `)
      const violations = analyzePreferForOf(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should detect for loop with namespace.array access', () => {
      const sourceFile = createSourceFile(`
        for (let i = 0; i < NS.data.length; i++) {
          console.log(NS.data[i]);
        }
      `)
      const violations = analyzePreferForOf(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should detect for loop with bracket notation array', () => {
      const sourceFile = createSourceFile(`
        for (let i = 0; i < obj['items'].length; i++) {
          console.log(obj['items'][i]);
        }
      `)
      const violations = analyzePreferForOf(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should not flag for loop reading different array element', () => {
      const sourceFile = createSourceFile(`
        for (let i = 0; i < arr.length; i++) {
          console.log(other[i]);
        }
      `)
      const violations = analyzePreferForOf(sourceFile)
      expect(violations).toHaveLength(0)
    })
  })

  describe('suggestion format', () => {
    it('should suggest for-of with correct array name', () => {
      const sourceFile = createSourceFile(`
        for (let i = 0; i < users.length; i++) {
          console.log(users[i]);
        }
      `)
      const violations = analyzePreferForOf(sourceFile)
      expect(violations[0].suggestion).toContain('for (const item of users)')
    })

    it('should suggest for-of with property access array', () => {
      const sourceFile = createSourceFile(`
        for (let i = 0; i < data.items.length; i++) {
          console.log(data.items[i]);
        }
      `)
      const violations = analyzePreferForOf(sourceFile)
      expect(violations[0].suggestion).toContain('for (const item of data.items)')
    })

    it('should suggest for-of with this.array', () => {
      const sourceFile = createSourceFile(`
        for (let i = 0; i < this.items.length; i++) {
          console.log(this.items[i]);
        }
      `)
      const violations = analyzePreferForOf(sourceFile)
      expect(violations[0].suggestion).toContain('for (const item of this.items)')
    })
  })

  describe('message content', () => {
    it('should mention for-of', () => {
      const sourceFile = createSourceFile(`
        for (let i = 0; i < arr.length; i++) {
          console.log(arr[i]);
        }
      `)
      const violations = analyzePreferForOf(sourceFile)
      expect(violations[0].message).toContain('for-of')
    })

    it('should mention indexed for loop', () => {
      const sourceFile = createSourceFile(`
        for (let i = 0; i < arr.length; i++) {
          console.log(arr[i]);
        }
      `)
      const violations = analyzePreferForOf(sourceFile)
      expect(violations[0].message).toContain('indexed')
    })

    it('should mention iterating values', () => {
      const sourceFile = createSourceFile(`
        for (let i = 0; i < arr.length; i++) {
          console.log(arr[i]);
        }
      `)
      const violations = analyzePreferForOf(sourceFile)
      expect(violations[0].message).toContain('iterating')
    })
  })

  describe('analyzePreferForOf function', () => {
    it('should return empty array for empty file', () => {
      const sourceFile = createSourceFile('')
      const violations = analyzePreferForOf(sourceFile)
      expect(violations).toEqual([])
    })

    it('should return violations as array', () => {
      const sourceFile = createSourceFile(`
        for (let i = 0; i < arr.length; i++) {
          console.log(arr[i]);
        }
      `)
      const violations = analyzePreferForOf(sourceFile)
      expect(Array.isArray(violations)).toBe(true)
    })

    it('should accept options parameter', () => {
      const sourceFile = createSourceFile(`
        for (let i = 0; i < arr.length; i++) {
          console.log(arr[i]);
        }
      `)
      const violations = analyzePreferForOf(sourceFile, {})
      expect(violations).toHaveLength(1)
    })

    it('should work with default options', () => {
      const sourceFile = createSourceFile(`
        for (let i = 0; i < arr.length; i++) {
          console.log(arr[i]);
        }
      `)
      const violations = analyzePreferForOf(sourceFile)
      expect(violations).toHaveLength(1)
    })
  })

  describe('multiple violations', () => {
    it('should detect three separate indexed for loops', () => {
      const sourceFile = createSourceFile(`
        for (let i = 0; i < a.length; i++) { console.log(a[i]); }
        for (let j = 0; j < b.length; j++) { console.log(b[j]); }
        for (let k = 0; k < c.length; k++) { console.log(c[k]); }
      `)
      const violations = analyzePreferForOf(sourceFile)
      expect(violations).toHaveLength(3)
    })

    it('should detect indexed for loops mixed with for-of', () => {
      const sourceFile = createSourceFile(`
        for (const item of good) { console.log(item); }
        for (let i = 0; i < bad.length; i++) { console.log(bad[i]); }
      `)
      const violations = analyzePreferForOf(sourceFile)
      expect(violations).toHaveLength(1)
      expect(violations[0].suggestion).toContain('bad')
    })

    it('should detect indexed for loop inside for-of body', () => {
      const sourceFile = createSourceFile(`
        for (const group of groups) {
          for (let i = 0; i < group.items.length; i++) {
            console.log(group.items[i]);
          }
        }
      `)
      const violations = analyzePreferForOf(sourceFile)
      expect(violations).toHaveLength(1)
    })
  })

  describe('rule create function', () => {
    it('should return visitor object', () => {
      const result = preferForOfRule.create({})
      expect(result).toHaveProperty('visitor')
    })

    it('should return onComplete function', () => {
      const result = preferForOfRule.create({})
      expect(result).toHaveProperty('onComplete')
      expect(result.onComplete).toBeTypeOf('function')
    })

    it('should collect violations through visitor', () => {
      const result = preferForOfRule.create({})
      expect(result.visitor).toHaveProperty('visitNode')
    })
  })

  describe('valid code - extended patterns', () => {
    it('should not flag Array.from', () => {
      const sourceFile = createSourceFile('const arr = Array.from({ length: 5 }, (_, i) => i);')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag Array.of', () => {
      const sourceFile = createSourceFile('const arr = Array.of(1, 2, 3);')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag spread operator', () => {
      const sourceFile = createSourceFile('const arr = [...other];')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag destructuring', () => {
      const sourceFile = createSourceFile('const [a, b, ...rest] = arr;')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag object spread', () => {
      const sourceFile = createSourceFile('const obj = { ...defaults, custom: true };')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag template literals', () => {
      const sourceFile = createSourceFile('const msg = `Hello ${name}`;')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag optional chaining', () => {
      const sourceFile = createSourceFile('const val = obj?.prop?.method?.();')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag nullish coalescing', () => {
      const sourceFile = createSourceFile('const val = input ?? "default";')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag Promise.all', () => {
      const sourceFile = createSourceFile('const results = await Promise.all(promises);')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag async function', () => {
      const sourceFile = createSourceFile('async function fetchData() { return await fetch(url); }')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag generator function', () => {
      const sourceFile = createSourceFile('function* gen() { yield 1; yield 2; }')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag Symbol', () => {
      const sourceFile = createSourceFile('const sym = Symbol("key");')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag Map usage', () => {
      const sourceFile = createSourceFile('const m = new Map(); m.set("key", "value");')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag Set usage', () => {
      const sourceFile = createSourceFile('const s = new Set(); s.add(1);')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag WeakMap', () => {
      const sourceFile = createSourceFile('const wm = new WeakMap();')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag WeakSet', () => {
      const sourceFile = createSourceFile('const ws = new WeakSet();')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag Proxy', () => {
      const sourceFile = createSourceFile('const p = new Proxy(target, handler);')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag Reflect', () => {
      const sourceFile = createSourceFile('Reflect.set(obj, "key", "value");')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag import statement', () => {
      const sourceFile = createSourceFile('import { foo } from "bar";')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag export statement', () => {
      const sourceFile = createSourceFile('export const foo = 42;')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag default export', () => {
      const sourceFile = createSourceFile('export default function() { return 1; }')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag namespace import', () => {
      const sourceFile = createSourceFile('import * as fs from "fs";')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag type import', () => {
      const sourceFile = createSourceFile('import type { Foo } from "bar";')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag typeof check', () => {
      const sourceFile = createSourceFile('if (typeof x === "string") { console.log(x); }')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag instanceof check', () => {
      const sourceFile = createSourceFile('if (x instanceof Error) { throw x; }')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag ternary operator', () => {
      const sourceFile = createSourceFile('const val = cond ? a : b;')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag logical AND', () => {
      const sourceFile = createSourceFile('const val = x && y;')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag logical OR', () => {
      const sourceFile = createSourceFile('const val = x || y;')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag void expression', () => {
      const sourceFile = createSourceFile('void fn();')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag delete operator', () => {
      const sourceFile = createSourceFile('delete obj.prop;')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag typeof operator', () => {
      const sourceFile = createSourceFile('const t = typeof x;')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag comma operator in expression', () => {
      const sourceFile = createSourceFile('let x = (1, 2, 3);')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag tagged template', () => {
      const sourceFile = createSourceFile('const str = tag`hello ${world}`;')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag BigInt literal', () => {
      const sourceFile = createSourceFile('const big = 9007199254740991n;')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag regex literal', () => {
      const sourceFile = createSourceFile('const re = /pattern/g;')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag array literal', () => {
      const sourceFile = createSourceFile('const arr = [1, 2, 3];')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag object literal', () => {
      const sourceFile = createSourceFile('const obj = { a: 1, b: 2 };')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag keyof operator', () => {
      const sourceFile = createSourceFile('type Keys = keyof Obj;')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag conditional type', () => {
      const sourceFile = createSourceFile('type IsString<T> = T extends string ? true : false;')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag mapped type', () => {
      const sourceFile = createSourceFile('type Readonly<T> = { readonly [K in keyof T]: T[K] };')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag utility types', () => {
      const sourceFile = createSourceFile('type Partial<T> = { [K in keyof T]?: T[K] };')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag generic function', () => {
      const sourceFile = createSourceFile('function identity<T>(x: T): T { return x; }')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag as const assertion', () => {
      const sourceFile = createSourceFile('const arr = [1, 2, 3] as const;')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag type assertion', () => {
      const sourceFile = createSourceFile('const val = x as string;')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag satisfies operator', () => {
      const sourceFile = createSourceFile('const obj = { a: 1 } satisfies Record<string, number>;')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag decorator', () => {
      const sourceFile = createSourceFile('@log function fn() {}')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag abstract class', () => {
      const sourceFile = createSourceFile('abstract class Base { abstract method(): void; }')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag for loop with !== in condition', () => {
      const sourceFile = createSourceFile(`
        for (let i = 0; i !== arr.length; i++) {
          console.log(arr[i]);
        }
      `)
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag for loop with === in condition', () => {
      const sourceFile = createSourceFile(`
        for (let i = 0; i === arr.length; i++) {
          console.log(arr[i]);
        }
      `)
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag for loop with i -= 1 increment', () => {
      const sourceFile = createSourceFile(`
        for (let i = 0; i < arr.length; i -= 1) {
          console.log(arr[i]);
        }
      `)
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag for loop with *= operator', () => {
      const sourceFile = createSourceFile(`
        for (let i = 1; i < arr.length; i *= 2) {
          console.log(arr[i]);
        }
      `)
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag for loop with bitwise NOT increment', () => {
      const sourceFile = createSourceFile(`
        for (let i = 0; i < arr.length; i = ~i) {
          console.log(arr[i]);
        }
      `)
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag throw statement', () => {
      const sourceFile = createSourceFile('throw new Error("fail");')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag new expression', () => {
      const sourceFile = createSourceFile('const d = new Date();')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag typeof in type position', () => {
      const sourceFile = createSourceFile('type T = typeof document;')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag infer keyword', () => {
      const sourceFile = createSourceFile('type R = T extends infer U ? U : never;')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag declare module', () => {
      const sourceFile = createSourceFile('declare module "foo" { export const bar: string; }')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag declare global', () => {
      const sourceFile = createSourceFile('declare global { interface Window { myVar: number; } }')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag triple-slash directive', () => {
      const sourceFile = createSourceFile('/// <reference types="node" />')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag unique symbol', () => {
      const sourceFile = createSourceFile('const sym: unique symbol = Symbol();')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag readonly array', () => {
      const sourceFile = createSourceFile('const arr: readonly number[] = [1, 2, 3];')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag tuple type', () => {
      const sourceFile = createSourceFile('const tuple: [string, number] = ["a", 1];')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag enum member access', () => {
      const sourceFile = createSourceFile('const val = Color.Red;')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag namespace', () => {
      const sourceFile = createSourceFile('namespace NS { export const val = 42; }')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag module declaration', () => {
      const sourceFile = createSourceFile('module M { export function fn() {} }')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag global augmentation', () => {
      const sourceFile = createSourceFile('global { const myGlobal: string; }')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag index signature', () => {
      const sourceFile = createSourceFile('interface Dict { [key: string]: number; }')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag constructor', () => {
      const sourceFile = createSourceFile('class Foo { constructor(public x: number) {} }')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag get accessor', () => {
      const sourceFile = createSourceFile('class Foo { get bar() { return 1; } }')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag set accessor', () => {
      const sourceFile = createSourceFile('class Foo { set bar(v: number) { this._bar = v; } }')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag static method', () => {
      const sourceFile = createSourceFile('class Foo { static create() { return new Foo(); } }')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag private method', () => {
      const sourceFile = createSourceFile('class Foo { private method() { return 1; } }')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag protected method', () => {
      const sourceFile = createSourceFile('class Foo { protected method() { return 1; } }')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag abstract method', () => {
      const sourceFile = createSourceFile('abstract class Foo { abstract method(): void; }')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag overload signature', () => {
      const sourceFile = createSourceFile(
        'function fn(x: string): string; function fn(x: number): number; function fn(x: any) { return x; }',
      )
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag const enum', () => {
      const sourceFile = createSourceFile('const enum Color { Red, Green, Blue }')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag intersection type', () => {
      const sourceFile = createSourceFile('type Combined = A & B;')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag union type', () => {
      const sourceFile = createSourceFile('type Value = string | number;')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag tuple destructuring', () => {
      const sourceFile = createSourceFile('const [a, b] = getTuple();')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag object destructuring', () => {
      const sourceFile = createSourceFile('const { a, b } = getObj();')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag rest parameter', () => {
      const sourceFile = createSourceFile('function fn(...args: number[]) { return args; }')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag call signature', () => {
      const sourceFile = createSourceFile('interface Fn { (x: number): string; }')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag construct signature', () => {
      const sourceFile = createSourceFile('interface Ctor { new (x: number): Foo; }')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag template literal type', () => {
      const sourceFile = createSourceFile('type Route = `/api/${string}`;')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag for-await-of loop', () => {
      const sourceFile = createSourceFile(
        'for await (const item of asyncIterable) { console.log(item); }',
      )
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag labeled statement', () => {
      const sourceFile = createSourceFile('outer: for (let i = 0; i < 10; i++) { break outer; }')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag with statement', () => {
      const sourceFile = createSourceFile('with (obj) { console.log(prop); }')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag debugger statement', () => {
      const sourceFile = createSourceFile('debugger;')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag empty statement', () => {
      const sourceFile = createSourceFile(';')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag multiple statements', () => {
      const sourceFile = createSourceFile('const a = 1; const b = 2; const c = a + b;')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag computed property in object', () => {
      const sourceFile = createSourceFile('const obj = { [key]: value };')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag dynamic import', () => {
      const sourceFile = createSourceFile('const mod = import("module");')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag type query', () => {
      const sourceFile = createSourceFile('const x: typeof Math = Math;')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag parenthesized type', () => {
      const sourceFile = createSourceFile('type T = (string | number);')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag never type', () => {
      const sourceFile = createSourceFile('function fail(): never { throw new Error(); }')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag unknown type', () => {
      const sourceFile = createSourceFile('const x: unknown = getValue();')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag any type', () => {
      const sourceFile = createSourceFile('const x: any = getValue();')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag void type', () => {
      const sourceFile = createSourceFile('function noop(): void {}')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag assert function', () => {
      const sourceFile = createSourceFile(
        'function assert(condition: boolean): asserts condition { if (!condition) throw new Error(); }',
      )
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag import assertion', () => {
      const sourceFile = createSourceFile('import data from "./data.json" with { type: "json" };')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag satisfies in variable', () => {
      const sourceFile = createSourceFile('const config = { port: 3000 } satisfies Config;')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag implements clause', () => {
      const sourceFile = createSourceFile('class Foo implements Bar { method() {} }')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag extends clause', () => {
      const sourceFile = createSourceFile(
        'class Child extends Parent { constructor() { super(); } }',
      )
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag type alias with generic', () => {
      const sourceFile = createSourceFile(
        'type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };',
      )
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag string enum', () => {
      const sourceFile = createSourceFile('enum Direction { Up = "UP", Down = "DOWN" }')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag heterogeneous enum', () => {
      const sourceFile = createSourceFile('enum Mixed { A = 1, B = "hello" }')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag literal types', () => {
      const sourceFile = createSourceFile('type Bool = true | false;')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
    it('should not flag for loop accessing arr[i].prop', () => {
      const sourceFile = createSourceFile(`
        for (let i = 0; i < arr.length; i++) {
          console.log(arr[i].name);
        }
      `)
      const violations = analyzePreferForOf(sourceFile)
      expect(violations).toHaveLength(1)
    })
    it('should not flag parseInt', () => {
      const sourceFile = createSourceFile('const n = parseInt("42", 10);')
      expect(analyzePreferForOf(sourceFile)).toHaveLength(0)
    })
  })
})
