import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import {
  analyzePreferObjectSpread,
  preferObjectSpreadRule,
} from '../../../../src/rules/patterns/prefer-object-spread.js'

describe('prefer-object-spread rule', () => {
  const createSourceFile = (code: string) => {
    const project = new Project({ useInMemoryFileSystem: true })
    return project.createSourceFile('test.ts', code)
  }

  describe('analyzePreferObjectSpread', () => {
    it('should detect Object.assign() calls', () => {
      const sourceFile = createSourceFile(`
        const merged = Object.assign({}, defaults, options);
      `)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should detect Object.assign() with single argument', () => {
      const sourceFile = createSourceFile(`
        const copy = Object.assign(source);
      `)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should not flag other Object methods', () => {
      const sourceFile = createSourceFile(`
        const keys = Object.keys(obj);
        const values = Object.values(obj);
      `)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag Object.assign() with no arguments', () => {
      const sourceFile = createSourceFile(`
        const empty = Object.assign();
      `)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should detect Object.assign with two arguments', () => {
      const sourceFile = createSourceFile(`const result = Object.assign({}, obj);`)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should detect Object.assign with three arguments', () => {
      const sourceFile = createSourceFile(`const result = Object.assign({}, a, b);`)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should detect Object.assign with many arguments', () => {
      const sourceFile = createSourceFile(`const result = Object.assign({}, a, b, c, d, e);`)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should detect multiple Object.assign calls', () => {
      const sourceFile = createSourceFile(`
        const a = Object.assign({}, x);
        const b = Object.assign({}, y);
        const c = Object.assign({}, z);
      `)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(3)
    })

    it('should detect Object.assign in expression context', () => {
      const sourceFile = createSourceFile(`const x = Object.assign({ a: 1 }, b);`)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should detect Object.assign in return statement', () => {
      const sourceFile = createSourceFile(`
        function merge(a: object, b: object) {
          return Object.assign({}, a, b);
        }
      `)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should detect Object.assign in arrow function', () => {
      const sourceFile = createSourceFile(`const merge = (a: object) => Object.assign({}, a);`)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should detect Object.assign in nested call', () => {
      const sourceFile = createSourceFile(`console.log(Object.assign({}, defaults));`)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should detect Object.assign as argument to function', () => {
      const sourceFile = createSourceFile(`process(Object.assign({}, config));`)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should detect Object.assign with variable target', () => {
      const sourceFile = createSourceFile(`const x = Object.assign(target, source);`)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should detect Object.assign with spread target', () => {
      const sourceFile = createSourceFile(`const x = Object.assign({ ...defaults }, override);`)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should detect Object.assign in array literal', () => {
      const sourceFile = createSourceFile(`const arr = [Object.assign({}, obj)];`)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should detect Object.assign in property assignment', () => {
      const sourceFile = createSourceFile(`const x = { merged: Object.assign({}, a) };`)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should detect Object.assign in conditional', () => {
      const sourceFile = createSourceFile(`const x = cond ? Object.assign({}, a) : b;`)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should detect Object.assign in template', () => {
      const sourceFile = createSourceFile(`const x = \`\${Object.assign({}, a)}\`;`)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should detect Object.assign with typed arguments', () => {
      const sourceFile = createSourceFile(
        `const x: Record<string, unknown> = Object.assign({}, defaults);`,
      )
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should detect Object.assign inside class method', () => {
      const sourceFile = createSourceFile(`
        class Foo {
          merge(other: object) {
            return Object.assign({}, this, other);
          }
        }
      `)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should detect Object.assign inside if block', () => {
      const sourceFile = createSourceFile(`
        if (true) {
          const x = Object.assign({}, defaults);
        }
      `)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should detect Object.assign inside loop', () => {
      const sourceFile = createSourceFile(`
        for (const item of items) {
          const x = Object.assign({}, item);
        }
      `)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should detect Object.assign with null target', () => {
      const sourceFile = createSourceFile(`const x = Object.assign(null, source);`)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(1)
    })
  })

  describe('not reporting - non-assign patterns', () => {
    it('should not flag Object.keys', () => {
      const sourceFile = createSourceFile(`const x = Object.keys(obj);`)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag Object.values', () => {
      const sourceFile = createSourceFile(`const x = Object.values(obj);`)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag Object.entries', () => {
      const sourceFile = createSourceFile(`const x = Object.entries(obj);`)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag Object.create', () => {
      const sourceFile = createSourceFile(`const x = Object.create(proto);`)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag Object.freeze', () => {
      const sourceFile = createSourceFile(`const x = Object.freeze(obj);`)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag Object.defineProperty', () => {
      const sourceFile = createSourceFile(`Object.defineProperty(obj, 'key', { value: 1 });`)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag Object.getOwnPropertyDescriptor', () => {
      const sourceFile = createSourceFile(`const d = Object.getOwnPropertyDescriptor(obj, 'key');`)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag Object.getPrototypeOf', () => {
      const sourceFile = createSourceFile(`const p = Object.getPrototypeOf(obj);`)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag Object.hasOwnProperty', () => {
      const sourceFile = createSourceFile(
        `const x = Object.prototype.hasOwnProperty.call(obj, 'key');`,
      )
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag Object.is', () => {
      const sourceFile = createSourceFile(`const x = Object.is(a, b);`)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag Object.isExtensible', () => {
      const sourceFile = createSourceFile(`const x = Object.isExtensible(obj);`)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag Object.isFrozen', () => {
      const sourceFile = createSourceFile(`const x = Object.isFrozen(obj);`)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag Object.isSealed', () => {
      const sourceFile = createSourceFile(`const x = Object.isSealed(obj);`)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag Object.preventExtensions', () => {
      const sourceFile = createSourceFile(`Object.preventExtensions(obj);`)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag Object.seal', () => {
      const sourceFile = createSourceFile(`Object.seal(obj);`)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag Object.setPrototypeOf', () => {
      const sourceFile = createSourceFile(`Object.setPrototypeOf(obj, proto);`)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag non-Object.assign calls', () => {
      const sourceFile = createSourceFile(`const x = someObj.assign({}, data);`)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag custom assign function', () => {
      const sourceFile = createSourceFile(`const x = assign({}, data);`)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag Object.assign with no arguments', () => {
      const sourceFile = createSourceFile(`Object.assign();`)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag spread syntax', () => {
      const sourceFile = createSourceFile(`const x = { ...defaults, ...options };`)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag regular function calls', () => {
      const sourceFile = createSourceFile(`const x = merge(a, b);`)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag method calls on other objects', () => {
      const sourceFile = createSourceFile(`const x = arr.concat([1, 2]);`)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag member access without call', () => {
      const sourceFile = createSourceFile(`const fn = Object.assign;`)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag empty file', () => {
      const sourceFile = createSourceFile('')
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag comments only', () => {
      const sourceFile = createSourceFile('// Object.assign({}, a);')
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(0)
    })
  })

  describe('violation properties', () => {
    it('should include correct ruleId', () => {
      const sourceFile = createSourceFile(`const x = Object.assign({}, a);`)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations[0].ruleId).toBe('prefer-object-spread')
    })

    it('should include info severity', () => {
      const sourceFile = createSourceFile(`const x = Object.assign({}, a);`)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations[0].severity).toBe('info')
    })

    it('should include message mentioning spread', () => {
      const sourceFile = createSourceFile(`const x = Object.assign({}, a);`)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations[0].message).toContain('spread')
    })

    it('should include message mentioning Object.assign', () => {
      const sourceFile = createSourceFile(`const x = Object.assign({}, a);`)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations[0].message).toContain('Object.assign')
    })

    it('should include suggestion', () => {
      const sourceFile = createSourceFile(`const x = Object.assign({}, a);`)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations[0].suggestion).toBeDefined()
    })

    it('should include suggestion mentioning spread syntax', () => {
      const sourceFile = createSourceFile(`const x = Object.assign({}, a);`)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations[0].suggestion).toContain('...')
    })

    it('should include filePath', () => {
      const sourceFile = createSourceFile(`const x = Object.assign({}, a);`)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations[0].filePath).toBeDefined()
    })

    it('should include range', () => {
      const sourceFile = createSourceFile(`const x = Object.assign({}, a);`)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations[0].range).toBeDefined()
    })

    it('should have range with start and end', () => {
      const sourceFile = createSourceFile(`const x = Object.assign({}, a);`)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations[0].range.start).toBeDefined()
      expect(violations[0].range.end).toBeDefined()
    })

    it('should have consistent message across detections', () => {
      const sourceFile = createSourceFile(`
        const a = Object.assign({}, x);
        const b = Object.assign({}, y);
      `)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations[0].message).toBe(violations[1].message)
    })
  })

  describe('rule definition', () => {
    it('should have correct meta properties', () => {
      expect(preferObjectSpreadRule.meta.name).toBe('prefer-object-spread')
      expect(preferObjectSpreadRule.meta.category).toBe('style')
      expect(preferObjectSpreadRule.meta.recommended).toBe(false)
    })

    it('should create visitor with visitNode method', () => {
      const result = preferObjectSpreadRule.create(preferObjectSpreadRule.defaultOptions)
      expect(result.visitor).toBeDefined()
      expect(result.visitor.visitNode).toBeDefined()
      expect(result.onComplete).toBeDefined()
    })

    it('should have meta description', () => {
      expect(preferObjectSpreadRule.meta.description).toBeDefined()
      expect(typeof preferObjectSpreadRule.meta.description).toBe('string')
    })

    it('should have description mentioning spread', () => {
      expect(preferObjectSpreadRule.meta.description.toLowerCase()).toContain('spread')
    })

    it('should have description mentioning Object.assign', () => {
      expect(preferObjectSpreadRule.meta.description).toContain('Object.assign')
    })

    it('should have fixable meta', () => {
      expect(preferObjectSpreadRule.meta.fixable).toBe('code')
    })

    it('should have default options as empty object', () => {
      expect(preferObjectSpreadRule.defaultOptions).toEqual({})
    })

    it('should return violations from onComplete', () => {
      const result = preferObjectSpreadRule.create(preferObjectSpreadRule.defaultOptions)
      const violations = result.onComplete()
      expect(Array.isArray(violations)).toBe(true)
    })

    it('should accumulate violations across multiple calls', () => {
      const sourceFile = createSourceFile(`
        const a = Object.assign({}, x);
        const b = Object.assign({}, y);
      `)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('edge cases', () => {
    it('should handle Object.assign with computed property', () => {
      const sourceFile = createSourceFile(`const x = Object.assign({}, { [key]: value });`)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should handle Object.assign with getter', () => {
      const sourceFile = createSourceFile(
        `const x = Object.assign({}, { get foo() { return 1; } });`,
      )
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should handle Object.assign with setter', () => {
      const sourceFile = createSourceFile(`const x = Object.assign({}, { set foo(v) {} });`)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should handle Object.assign chained', () => {
      const sourceFile = createSourceFile(`const x = Object.assign(Object.assign({}, a), b);`)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations.length).toBeGreaterThanOrEqual(1)
    })

    it('should handle Object.assign as statement', () => {
      const sourceFile = createSourceFile(`Object.assign(target, source);`)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should handle Object.assign with array target', () => {
      const sourceFile = createSourceFile(`const x = Object.assign([], items);`)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should handle Object.assign with function target', () => {
      const sourceFile = createSourceFile(`const x = Object.assign(function(){}, props);`)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should handle Object.assign with undefined argument', () => {
      const sourceFile = createSourceFile(`const x = Object.assign({}, undefined);`)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should handle Object.assign inside try-catch', () => {
      const sourceFile = createSourceFile(`
        try {
          const x = Object.assign({}, defaults);
        } catch (e) {}
      `)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should handle Object.assign inside switch', () => {
      const sourceFile = createSourceFile(`
        switch (x) {
          case 1:
            const a = Object.assign({}, opts);
            break;
        }
      `)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should handle Object.assign with type assertion', () => {
      const sourceFile = createSourceFile(
        `const x = Object.assign({} as Record<string, unknown>, data);`,
      )
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should handle Object.assign with as const', () => {
      const sourceFile = createSourceFile(`const x = Object.assign({ a: 1 } as const);`)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should handle Object.assign inside namespace', () => {
      const sourceFile = createSourceFile(`
        namespace NS {
          export const x = Object.assign({}, defaults);
        }
      `)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should handle Object.assign with enum', () => {
      const sourceFile = createSourceFile(`
        enum Color { Red, Blue }
        const x = Object.assign({}, Color);
      `)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should handle Object.assign in destructuring default', () => {
      const sourceFile = createSourceFile(`const { x = Object.assign({}, defaults) } = opts;`)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should handle Object.assign with generic types', () => {
      const sourceFile = createSourceFile(
        `const x = Object.assign<Record<string, unknown>, Record<string, unknown>>({}, data);`,
      )
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should handle multiple files independently', () => {
      const sourceFile1 = createSourceFile(`const x = Object.assign({}, a);`)
      const sourceFile2 = createSourceFile(`const y = Object.assign({}, b);`)
      const violations1 = analyzePreferObjectSpread(sourceFile1)
      const violations2 = analyzePreferObjectSpread(sourceFile2)
      expect(violations1).toHaveLength(1)
      expect(violations2).toHaveLength(1)
    })

    it('should handle deeply nested Object.assign', () => {
      const sourceFile = createSourceFile(`const x = { a: { b: Object.assign({}, c) } };`)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should handle Object.assign in default export', () => {
      const sourceFile = createSourceFile(`export default Object.assign({}, config);`)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(1)
    })
  })

  describe('mixed patterns', () => {
    it('should detect assign among other Object methods', () => {
      const sourceFile = createSourceFile(`
        const keys = Object.keys(obj);
        const merged = Object.assign({}, a, b);
        const vals = Object.values(obj);
      `)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should detect multiple assigns interspersed', () => {
      const sourceFile = createSourceFile(`
        const a = Object.assign({}, x);
        const b = Object.keys(y);
        const c = Object.assign({}, z);
      `)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(2)
    })

    it('should handle assign alongside spread usage', () => {
      const sourceFile = createSourceFile(`
        const a = { ...defaults };
        const b = Object.assign({}, overrides);
      `)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should handle file with only non-assign code', () => {
      const sourceFile = createSourceFile(`
        const a = 1;
        const b = { x: 1, y: 2 };
        function foo() { return 'bar'; }
      `)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should handle assign in complex expression', () => {
      const sourceFile = createSourceFile(`
        const config = base ? Object.assign({}, base) : { default: true };
      `)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(1)
    })
  })

  describe('real-world patterns', () => {
    it('should detect React default props pattern', () => {
      const sourceFile = createSourceFile(`
        const props = Object.assign({ color: 'blue', size: 'medium' }, userProps);
      `)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should detect config merge pattern', () => {
      const sourceFile = createSourceFile(`
        const config = Object.assign({}, defaultConfig, envConfig, userConfig);
      `)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should detect options pattern', () => {
      const sourceFile = createSourceFile(`
        function init(opts: Options) {
          return Object.assign({ debug: false, verbose: false }, opts);
        }
      `)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should detect state merge pattern', () => {
      const sourceFile = createSourceFile(`
        const newState = Object.assign({}, state, { loading: true });
      `)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should detect prototype mixin pattern', () => {
      const sourceFile = createSourceFile(`
        Object.assign(MyClass.prototype, mixinMethods);
      `)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should detect test fixture pattern', () => {
      const sourceFile = createSourceFile(`
        const fixture = Object.assign({}, baseFixture, { name: 'test' });
      `)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should detect headers merge pattern', () => {
      const sourceFile = createSourceFile(`
        const headers = Object.assign({}, defaultHeaders, customHeaders);
      `)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(1)
    })

    it('should detect theme override pattern', () => {
      const sourceFile = createSourceFile(`
        const theme = Object.assign({}, baseTheme, { colors: { primary: '#000' } });
      `)
      const violations = analyzePreferObjectSpread(sourceFile)
      expect(violations).toHaveLength(1)
    })
  })
})
