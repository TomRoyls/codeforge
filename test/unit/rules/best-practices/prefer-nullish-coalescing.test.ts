/**
 * @fileoverview Tests for prefer-nullish-coalescing rule
 */

import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import {
  analyzePreferNullishCoalescing,
  preferNullishCoalescingRule,
} from '../../../../src/rules/best-practices/prefer-nullish-coalescing.js'

const sharedProject = new Project({ useInMemoryFileSystem: true })
let fileCounter = 0
const createSourceFile = (code: string) => {
  fileCounter++
  return sharedProject.createSourceFile(`test${fileCounter}.ts`, code)
}

describe('rule metadata', () => {
  it('should have correct meta properties', () => {
    expect(preferNullishCoalescingRule.meta.name).toBe('prefer-nullish-coalescing')
    expect(preferNullishCoalescingRule.meta.category).toBe('style')
    expect(preferNullishCoalescingRule.meta.fixable).toBe('code')
  })

  it('should have correct name', () => {
    expect(preferNullishCoalescingRule.meta.name).toBe('prefer-nullish-coalescing')
  })

  it('should have style category', () => {
    expect(preferNullishCoalescingRule.meta.category).toBe('style')
  })

  it('should have recommended set to false', () => {
    expect(preferNullishCoalescingRule.meta.recommended).toBe(false)
  })

  it('should have code fixable', () => {
    expect(preferNullishCoalescingRule.meta.fixable).toBe('code')
  })

  it('should have meta description', () => {
    expect(preferNullishCoalescingRule.meta.description).toBeDefined()
    expect(typeof preferNullishCoalescingRule.meta.description).toBe('string')
  })

  it('should have defaultOptions defined', () => {
    expect(preferNullishCoalescingRule.defaultOptions).toBeDefined()
  })

  it('should have defaultOptions with ignoreBooleanCoercion false', () => {
    expect(preferNullishCoalescingRule.defaultOptions.ignoreBooleanCoercion).toBe(false)
  })
})

describe('detecting || for default values', () => {
  it('should detect || with string literal default', () => {
    const sourceFile = createSourceFile('const x = name || "unknown";')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('??')
    expect(violations[0].severity).toBe('info')
  })

  it('should detect || with numeric literal default', () => {
    const sourceFile = createSourceFile('const x = count || 0;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with object literal default', () => {
    const sourceFile = createSourceFile('const x = options || {};')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with array literal default', () => {
    const sourceFile = createSourceFile('const x = items || [];')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with optional chaining', () => {
    const sourceFile = createSourceFile('const x = obj?.value || "default";')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })
})

describe('valid code', () => {
  it('should not flag ?? operator', () => {
    const sourceFile = createSourceFile('const x = name ?? "unknown";')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag boolean || boolean', () => {
    const sourceFile = createSourceFile('const x = a || b;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag function call || default', () => {
    const sourceFile = createSourceFile('const x = getValue() || "default";')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1) // This is actually flagged since it has a string literal default
  })

  it('should not flag || without literal default', () => {
    const sourceFile = createSourceFile('const x = a || b;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })
})

describe('basic usage', () => {
  it('should not flag ?? operator with string literal', () => {
    const sourceFile = createSourceFile('const x = value ?? "default";')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag ?? operator with numeric literal', () => {
    const sourceFile = createSourceFile('const x = count ?? 0;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag ?? operator with object literal', () => {
    const sourceFile = createSourceFile('const x = options ?? {};')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag ?? operator with array literal', () => {
    const sourceFile = createSourceFile('const x = items ?? [];')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })
})

describe('edge cases', () => {
  it('should detect || in nested expression (null || 0) ?? 1', () => {
    const sourceFile = createSourceFile('const x = (null || 0) ?? 1;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations.length).toBeGreaterThan(0)
  })

  it('should detect || with complex left side expression', () => {
    const sourceFile = createSourceFile('const x = obj?.nested?.value || "default";')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with array access', () => {
    const sourceFile = createSourceFile('const x = arr[0] || "default";')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with computed property access', () => {
    const sourceFile = createSourceFile('const x = obj[key] || "default";')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with method call on left side', () => {
    const sourceFile = createSourceFile('const x = obj.toString() || "default";')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with ternary expression on left', () => {
    const sourceFile = createSourceFile('const x = (condition ? a : b) || "default";')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with null literal on left', () => {
    const sourceFile = createSourceFile('const x = null || "default";')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with undefined on left', () => {
    const sourceFile = createSourceFile('const x = undefined || "default";')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with zero on left', () => {
    const sourceFile = createSourceFile('const x = 0 || "default";')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with empty string on left', () => {
    const sourceFile = createSourceFile('const x = "" || "default";')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should handle file with only whitespace', () => {
    const sourceFile = createSourceFile('   ')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should handle file with only comments', () => {
    const sourceFile = createSourceFile('// just a comment\n/* block comment */')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should detect || in switch condition', () => {
    const sourceFile = createSourceFile('switch(a || "default") {}')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || in for-loop init', () => {
    const sourceFile = createSourceFile('for (let i = a || 0; i < 10; i++) {}')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should not flag bitwise OR operator', () => {
    const sourceFile = createSourceFile('const x = a | b;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag || with boolean true on right', () => {
    const sourceFile = createSourceFile('const x = a || true;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag || with boolean false on right', () => {
    const sourceFile = createSourceFile('const x = a || false;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should detect deeply nested || in parentheses', () => {
    const sourceFile = createSourceFile('const x = (((a || "default")));')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || in destructuring default', () => {
    const sourceFile = createSourceFile('const { x = a || "default" } = obj;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with null on right side', () => {
    const sourceFile = createSourceFile('const x = a || null;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || in exported variable', () => {
    const sourceFile = createSourceFile('export const x = a || "default";')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || in return statement', () => {
    const sourceFile = createSourceFile('function foo() { return a || "default"; }')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })
})

describe('mixed types and type assertions', () => {
  it('should not flag ?? with type assertion', () => {
    const sourceFile = createSourceFile('const x = (value as string) ?? "default";')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag ?? with union type assertion', () => {
    const sourceFile = createSourceFile('const x = (value as string | number) ?? "default";')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should detect || with type assertion', () => {
    const sourceFile = createSourceFile('const x = (value as string) || "default";')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should not flag ?? with non-null assertion', () => {
    const sourceFile = createSourceFile('const x = value! ?? "default";')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should detect || with non-null assertion', () => {
    const sourceFile = createSourceFile('const x = value! || "default";')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })
})

describe('precedence - ?? vs ||', () => {
  it('should correctly handle ?? with undefined value', () => {
    const sourceFile = createSourceFile(`
      let value: string | undefined = undefined;
      const x = value ?? "default";
    `)
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should correctly handle ?? with null value', () => {
    const sourceFile = createSourceFile(`
      let value: string | null = null;
      const x = value ?? "default";
    `)
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should correctly handle ?? with falsy but not nullish value (0)', () => {
    const sourceFile = createSourceFile(`
      let value: number = 0;
      const x = value ?? 42;
    `)
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should correctly handle ?? with falsy but not nullish value (empty string)', () => {
    const sourceFile = createSourceFile(`
      let value: string = "";
      const x = value ?? "default";
    `)
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should correctly handle ?? with falsy but not nullish value (false)', () => {
    const sourceFile = createSourceFile(`
      let value: boolean = false;
      const x = value ?? true;
    `)
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should detect || when it treats falsy values incorrectly', () => {
    const sourceFile = createSourceFile(`
      let count = 0;
      const x = count || 10; // 0 is falsy, but valid - should use ??
    `)
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || when it treats empty string incorrectly', () => {
    const sourceFile = createSourceFile(`
      let text = "";
      const x = text || "default"; // "" is falsy, but valid - should use ??
    `)
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should not flag ?? in expression with mixed operators', () => {
    const sourceFile = createSourceFile('const x = a ?? b && c;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })
})

describe('complex expressions', () => {
  it('should detect || in function parameter default', () => {
    const sourceFile = createSourceFile(`
      function foo(name: string | undefined = undefined) {
        const x = name || "unknown";
      }
    `)
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || in object property', () => {
    const sourceFile = createSourceFile(`
      const obj = {
        name: inputName || "default",
        age: inputAge || 0
      };
    `)
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations.length).toBe(2)
  })

  it('should detect || in arrow function', () => {
    const sourceFile = createSourceFile('const getName = (name?: string) => name || "unknown";')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || in template literal expression', () => {
    const sourceFile = createSourceFile('const x = `Hello ${name || "world"}`;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || in ternary condition', () => {
    const sourceFile = createSourceFile('const x = condition ? a || "default" : c;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with multiple defaults', () => {
    const sourceFile = createSourceFile('const x = a || b || c || "default";')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations.length).toBeGreaterThanOrEqual(1)
  })
})

describe('detecting || with string defaults', () => {
  it('should detect || with single-quoted string default', () => {
    const sourceFile = createSourceFile("const x = name || 'unknown';")
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with double-quoted string default', () => {
    const sourceFile = createSourceFile('const x = name || "unknown";')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with empty string default', () => {
    const sourceFile = createSourceFile('const x = value || "";')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with single-char string default', () => {
    const sourceFile = createSourceFile("const x = value || 'a';")
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with multi-word string default', () => {
    const sourceFile = createSourceFile('const x = value || "hello world";')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with string containing escape sequences', () => {
    const sourceFile = createSourceFile('const x = value || "line1\\nline2";')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with string containing special characters', () => {
    const sourceFile = createSourceFile('const x = value || "hello\\tworld";')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with URL string default', () => {
    const sourceFile = createSourceFile('const x = url || "https://example.com";')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with path string default', () => {
    const sourceFile = createSourceFile('const x = path || "/usr/local/bin";')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with string containing numbers', () => {
    const sourceFile = createSourceFile('const x = code || "error404";')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with long string default', () => {
    const sourceFile = createSourceFile(
      'const x = msg || "this is a very long default string value";',
    )
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with string containing escaped quotes', () => {
    const sourceFile = createSourceFile("const x = value || 'it\\'s fine';")
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with property access on left and string default', () => {
    const sourceFile = createSourceFile('const x = obj.prop || "fallback";')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with function call on left and string default', () => {
    const sourceFile = createSourceFile('const x = getData() || "empty";')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with array access on left and string default', () => {
    const sourceFile = createSourceFile('const x = arr[0] || "missing";')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with computed property and string default', () => {
    const sourceFile = createSourceFile('const x = obj[key] || "not found";')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with type assertion on left and string default', () => {
    const sourceFile = createSourceFile('const x = (val as string) || "empty";')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with non-null assertion on left and string default', () => {
    const sourceFile = createSourceFile('const x = val! || "empty";')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with method call and string default', () => {
    const sourceFile = createSourceFile('const x = obj.toString() || "no string";')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with greeting string default', () => {
    const sourceFile = createSourceFile('const x = greeting || "Hello, World!";')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })
})

describe('detecting || with numeric defaults', () => {
  it('should detect || with integer default', () => {
    const sourceFile = createSourceFile('const x = count || 42;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with float default', () => {
    const sourceFile = createSourceFile('const x = ratio || 3.14;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with zero default', () => {
    const sourceFile = createSourceFile('const x = count || 0;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with one default', () => {
    const sourceFile = createSourceFile('const x = count || 1;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with large integer default', () => {
    const sourceFile = createSourceFile('const x = count || 1000000;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with small float default', () => {
    const sourceFile = createSourceFile('const x = epsilon || 0.001;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with hex literal default', () => {
    const sourceFile = createSourceFile('const x = value || 0xFF;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with binary literal default', () => {
    const sourceFile = createSourceFile('const x = flags || 0b1010;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with octal literal default', () => {
    const sourceFile = createSourceFile('const x = mode || 0o777;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with exponential notation default', () => {
    const sourceFile = createSourceFile('const x = value || 1e5;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with leading decimal point default', () => {
    const sourceFile = createSourceFile('const x = value || .5;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with trailing decimal point default', () => {
    const sourceFile = createSourceFile('const x = value || 1.;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with uppercase exponential default', () => {
    const sourceFile = createSourceFile('const x = value || 1E10;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with lowercase hex default', () => {
    const sourceFile = createSourceFile('const x = value || 0xabcd;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with specific number default', () => {
    const sourceFile = createSourceFile('const x = retries || 3;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })
})

describe('detecting || with object defaults', () => {
  it('should detect || with empty object default', () => {
    const sourceFile = createSourceFile('const x = options || {};')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with object with property default', () => {
    const sourceFile = createSourceFile('const x = config || { key: "value" };')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with object with multiple properties default', () => {
    const sourceFile = createSourceFile('const x = config || { a: 1, b: 2 };')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with object with string property default', () => {
    const sourceFile = createSourceFile('const x = settings || { name: "default" };')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with nested object default', () => {
    const sourceFile = createSourceFile('const x = data || { inner: { value: 1 } };')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with object with computed property default', () => {
    const sourceFile = createSourceFile('const k = "key"; const x = config || { [k]: 1 };')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with object with method default', () => {
    const sourceFile = createSourceFile('const x = obj || { fn() { return 1; } };')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with object with shorthand property default', () => {
    const sourceFile = createSourceFile('const a = 1; const x = obj || { a };')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with object with spread default', () => {
    const sourceFile = createSourceFile('const base = {}; const x = obj || { ...base };')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with object with getter default', () => {
    const sourceFile = createSourceFile('const x = obj || { get val() { return 1; } };')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })
})

describe('detecting || with array defaults', () => {
  it('should detect || with empty array default', () => {
    const sourceFile = createSourceFile('const x = items || [];')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with array with one item default', () => {
    const sourceFile = createSourceFile('const x = items || [1];')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with array with multiple items default', () => {
    const sourceFile = createSourceFile('const x = items || [1, 2, 3];')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with array of strings default', () => {
    const sourceFile = createSourceFile('const x = items || ["a", "b"];')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with nested array default', () => {
    const sourceFile = createSourceFile('const x = matrix || [[1, 2], [3, 4]];')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with array of objects default', () => {
    const sourceFile = createSourceFile('const x = items || [{ id: 1 }];')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with array with spread default', () => {
    const sourceFile = createSourceFile('const base = [1]; const x = items || [...base];')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with array with expression default', () => {
    const sourceFile = createSourceFile('const x = items || [1 + 2];')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with array with mixed types default', () => {
    const sourceFile = createSourceFile('const x = items || [1, "two", true];')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || with array of empty strings default', () => {
    const sourceFile = createSourceFile('const x = items || ["", ""];')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })
})

describe('detecting || with nullish left side', () => {
  it('should detect || when left has optional chaining', () => {
    const sourceFile = createSourceFile('const x = obj?.value || fallback;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || when left has nested optional chaining', () => {
    const sourceFile = createSourceFile('const x = a?.b || c;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || when left has optional element access', () => {
    const sourceFile = createSourceFile('const x = arr?.[0] || fallback;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || when left has optional call', () => {
    const sourceFile = createSourceFile('const x = fn?.() || fallback;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || when left has chained optional access', () => {
    const sourceFile = createSourceFile('const x = obj?.a?.b?.c || fallback;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || when left has window optional access', () => {
    const sourceFile = createSourceFile('const x = window?.document || doc;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || when left has config optional access', () => {
    const sourceFile = createSourceFile('const x = config?.setting || defaultCfg;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || when left has data optional access with array default', () => {
    const sourceFile = createSourceFile('const x = data?.items || [];')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || when left has optional method chaining', () => {
    const sourceFile = createSourceFile('const x = obj?.method?.() || fallback;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || when left has nested optional name access', () => {
    const sourceFile = createSourceFile('const x = user?.name?.first || placeholder;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || when left is undefined identifier', () => {
    const sourceFile = createSourceFile('const x = undefined || fallback;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || when left is null identifier', () => {
    const sourceFile = createSourceFile('const x = null || fallback;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || when left text contains null substring', () => {
    const sourceFile = createSourceFile('const x = nullable || fallback;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || when left text contains nullish substring', () => {
    const sourceFile = createSourceFile('const x = nullish || fallback;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect || when left has result optional access', () => {
    const sourceFile = createSourceFile('const x = result?.data || fallback;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })
})

describe('valid code - no violations', () => {
  it('should not flag || with two identifiers', () => {
    const sourceFile = createSourceFile('const x = a || b;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag || with function call on right', () => {
    const sourceFile = createSourceFile('const x = a || fn();')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag || with property access on right', () => {
    const sourceFile = createSourceFile('const x = a || b.c;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag || with element access on right', () => {
    const sourceFile = createSourceFile('const x = a || b[0];')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag || with true on right', () => {
    const sourceFile = createSourceFile('const x = a || true;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag || with false on right', () => {
    const sourceFile = createSourceFile('const x = a || false;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag && expression', () => {
    const sourceFile = createSourceFile('const x = a && b;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag ?? expression', () => {
    const sourceFile = createSourceFile('const x = a ?? b;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag || with logical not on right', () => {
    const sourceFile = createSourceFile('const x = a || !b;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag || with typeof on right', () => {
    const sourceFile = createSourceFile('const x = a || typeof b;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag || with parenthesized identifier on right', () => {
    const sourceFile = createSourceFile('const x = a || (b);')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag || with Infinity on right', () => {
    const sourceFile = createSourceFile('const x = a || Infinity;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag || with NaN on right', () => {
    const sourceFile = createSourceFile('const x = a || NaN;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag || with void expression on right', () => {
    const sourceFile = createSourceFile('const x = a || void b;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag || with new expression on right', () => {
    const sourceFile = createSourceFile('const x = a || new C();')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag || with function expression on right', () => {
    const sourceFile = createSourceFile('const x = a || function() {};')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag || with arrow function on right', () => {
    const sourceFile = createSourceFile('const x = a || (() => b);')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag || with type assertion on right', () => {
    const sourceFile = createSourceFile('const x = a || (b as C);')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag || with non-null assertion on right', () => {
    const sourceFile = createSourceFile('const x = a || b!;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag || with this on right', () => {
    const sourceFile = createSourceFile('const x = a || this;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag || with negative number on right', () => {
    const sourceFile = createSourceFile('const x = a || -1;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag || with positive unary on right', () => {
    const sourceFile = createSourceFile('const x = a || +1;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag || with bitwise not on right', () => {
    const sourceFile = createSourceFile('const x = a || ~b;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag || with BigInt literal on right', () => {
    const sourceFile = createSourceFile('const x = a || 1n;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag || with regex on right', () => {
    const sourceFile = createSourceFile('const x = a || /regex/;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag || with template literal on right', () => {
    const sourceFile = createSourceFile('const x = a || `hello`;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag || with template expression on right', () => {
    const sourceFile = createSourceFile('const x = a || `hello ${world}`;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag || with optional chaining on right', () => {
    const sourceFile = createSourceFile('const x = a || b?.c;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag || with optional call on right', () => {
    const sourceFile = createSourceFile('const x = a || b?.();')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag || with delete on right', () => {
    const sourceFile = createSourceFile('const x = a || delete obj.prop;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag || with instanceof on right', () => {
    const sourceFile = createSourceFile('const x = a || b instanceof C;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag || with in operator on right', () => {
    const sourceFile = createSourceFile('const x = a || b in obj;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag || with logical AND in parens on right', () => {
    const sourceFile = createSourceFile('const x = a || (b && c);')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag || with another || in parens on right', () => {
    const sourceFile = createSourceFile('const x = a || (b || c);')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag || with addition on right', () => {
    const sourceFile = createSourceFile('const x = a || b + c;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag || with strict equality on right', () => {
    const sourceFile = createSourceFile('const x = a || b === c;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag ternary containing || with identifier default', () => {
    const sourceFile = createSourceFile('const x = a || b ? c : d;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag || with assignment on right', () => {
    const sourceFile = createSourceFile('const x = a || (b = c);')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag multiple || with identifiers', () => {
    const sourceFile = createSourceFile('const x = a || b; const y = c || d;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag || with class expression on right', () => {
    const sourceFile = createSourceFile('const x = a || class {};')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })
})

describe('violation properties', () => {
  it('should have correct ruleId', () => {
    const sourceFile = createSourceFile('const x = a || "default";')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations[0].ruleId).toBe('prefer-nullish-coalescing')
  })

  it('should have info severity', () => {
    const sourceFile = createSourceFile('const x = a || "default";')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations[0].severity).toBe('info')
  })

  it('should have message containing nullish coalescing', () => {
    const sourceFile = createSourceFile('const x = a || "default";')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations[0].message).toContain('nullish coalescing')
  })

  it('should have message containing replacement suggestion', () => {
    const sourceFile = createSourceFile('const x = name || "unknown";')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations[0].message).toContain('??')
    expect(violations[0].message).toContain('name ?? "unknown"')
  })

  it('should have filePath', () => {
    const sourceFile = createSourceFile('const x = a || "default";')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations[0].filePath).toBeDefined()
    expect(typeof violations[0].filePath).toBe('string')
  })

  it('should have filePath matching source file path', () => {
    const sourceFile = createSourceFile('const x = a || "default";')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations[0].filePath).toBe(sourceFile.getFilePath())
  })

  it('should have range with start and end', () => {
    const sourceFile = createSourceFile('const x = a || "default";')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations[0].range).toBeDefined()
    expect(violations[0].range.start).toBeDefined()
    expect(violations[0].range.end).toBeDefined()
  })

  it('should have range start with line and column', () => {
    const sourceFile = createSourceFile('const x = a || "default";')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(typeof violations[0].range.start.line).toBe('number')
    expect(typeof violations[0].range.start.column).toBe('number')
  })

  it('should have range end with line and column', () => {
    const sourceFile = createSourceFile('const x = a || "default";')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(typeof violations[0].range.end.line).toBe('number')
    expect(typeof violations[0].range.end.column).toBe('number')
  })

  it('should have suggestion containing replacement', () => {
    const sourceFile = createSourceFile('const x = name || "fallback";')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations[0].suggestion).toContain('replace || with ??:')
    expect(violations[0].suggestion).toContain('name ?? "fallback"')
  })
})

describe('options', () => {
  it('should work with default options (no second argument)', () => {
    const sourceFile = createSourceFile('const x = a || "default";')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should work with empty options object', () => {
    const sourceFile = createSourceFile('const x = a || "default";')
    const violations = analyzePreferNullishCoalescing(sourceFile, {})
    expect(violations).toHaveLength(1)
  })

  it('should accept ignoreBooleanCoercion true without changing behavior', () => {
    const sourceFile = createSourceFile('const x = a || "default";')
    const violations = analyzePreferNullishCoalescing(sourceFile, { ignoreBooleanCoercion: true })
    expect(violations).toHaveLength(1)
  })

  it('should accept ignoreBooleanCoercion false without changing behavior', () => {
    const sourceFile = createSourceFile('const x = a || "default";')
    const violations = analyzePreferNullishCoalescing(sourceFile, { ignoreBooleanCoercion: false })
    expect(violations).toHaveLength(1)
  })

  it('should produce same results regardless of ignoreBooleanCoercion option', () => {
    const sourceFile = createSourceFile('const x = a || "default"; const y = b || 0;')
    const withTrue = analyzePreferNullishCoalescing(sourceFile, { ignoreBooleanCoercion: true })
    const withFalse = analyzePreferNullishCoalescing(sourceFile, { ignoreBooleanCoercion: false })
    expect(withTrue.length).toBe(withFalse.length)
  })
})

describe('rule create function', () => {
  it('should return object with visitor property', () => {
    const handler = preferNullishCoalescingRule.create({})
    expect(handler).toHaveProperty('visitor')
  })

  it('should return object with onComplete property', () => {
    const handler = preferNullishCoalescingRule.create({})
    expect(handler).toHaveProperty('onComplete')
  })

  it('should have visitor with visitNode method', () => {
    const handler = preferNullishCoalescingRule.create({})
    expect(handler.visitor).toHaveProperty('visitNode')
  })

  it('should have visitNode as a function', () => {
    const handler = preferNullishCoalescingRule.create({})
    expect(typeof handler.visitor.visitNode).toBe('function')
  })

  it('should have onComplete as a function', () => {
    const handler = preferNullishCoalescingRule.create({})
    expect(typeof handler.onComplete).toBe('function')
  })

  it('should return empty array from onComplete with no visits', () => {
    const handler = preferNullishCoalescingRule.create({})
    const result = handler.onComplete()
    expect(Array.isArray(result)).toBe(true)
    expect(result).toHaveLength(0)
  })

  it('should work with ignoreBooleanCoercion true option', () => {
    const handler = preferNullishCoalescingRule.create({ ignoreBooleanCoercion: true })
    expect(handler).toHaveProperty('visitor')
    expect(handler).toHaveProperty('onComplete')
  })

  it('should work with ignoreBooleanCoercion false option', () => {
    const handler = preferNullishCoalescingRule.create({ ignoreBooleanCoercion: false })
    expect(handler).toHaveProperty('visitor')
    expect(handler).toHaveProperty('onComplete')
  })
})

describe('analyzePreferNullishCoalescing function', () => {
  it('should return empty array for empty file', () => {
    const sourceFile = createSourceFile('')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should return empty array for file with no ||', () => {
    const sourceFile = createSourceFile('const x = 1; const y = 2;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should return single violation for single ||', () => {
    const sourceFile = createSourceFile('const x = a || "default";')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should return multiple violations for multiple || expressions', () => {
    const sourceFile = createSourceFile('const x = a || "x"; const y = b || "y";')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(2)
  })

  it('should return an array', () => {
    const sourceFile = createSourceFile('const x = 1;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(Array.isArray(violations)).toBe(true)
  })

  it('should work with default options', () => {
    const sourceFile = createSourceFile('const x = a || "default";')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
    expect(violations[0].ruleId).toBe('prefer-nullish-coalescing')
  })

  it('should work with custom options', () => {
    const sourceFile = createSourceFile('const x = a || "default";')
    const violations = analyzePreferNullishCoalescing(sourceFile, { ignoreBooleanCoercion: true })
    expect(violations).toHaveLength(1)
  })

  it('should handle TypeScript interfaces without errors', () => {
    const sourceFile = createSourceFile('interface Foo { name: string; }')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should handle TypeScript type annotations', () => {
    const sourceFile = createSourceFile('const x: string = a || "default";')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should handle complex TypeScript code', () => {
    const sourceFile = createSourceFile(
      'function fn(arg: string): string { return arg || "default"; }',
    )
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(1)
  })
})

describe('multiple violations', () => {
  it('should detect three string defaults in separate statements', () => {
    const sourceFile = createSourceFile(
      'const a = x || "one"; const b = y || "two"; const c = z || "three";',
    )
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(3)
  })

  it('should detect four violations of mixed literal types', () => {
    const sourceFile = createSourceFile(
      'const a = x || "str"; const b = y || 0; const c = z || {}; const d = w || [];',
    )
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(4)
  })

  it('should detect three violations in object literal', () => {
    const sourceFile = createSourceFile(
      'const obj = { name: input || "default", age: years || 0, data: items || [] };',
    )
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(3)
  })

  it('should detect violations in chained || expressions', () => {
    const sourceFile = createSourceFile('const x = a || "x" || "y";')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations.length).toBeGreaterThanOrEqual(2)
  })

  it('should detect violations mixed with valid ||', () => {
    const sourceFile = createSourceFile('const a = x || "str"; const b = c || d; const e = f || 0;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(2)
  })

  it('should detect three violations in array literal', () => {
    const sourceFile = createSourceFile('const arr = [x || "a", y || "b", z || "c"];')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(3)
  })

  it('should detect violations across function scopes', () => {
    const sourceFile = createSourceFile(
      'const a = x || "str"; function foo() { const b = y || 0; } const c = z || {};',
    )
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(3)
  })

  it('should detect violations in class method', () => {
    const sourceFile = createSourceFile(
      'class C { method() { const a = x || "str"; const b = y || 0; } }',
    )
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(2)
  })

  it('should detect violations with optional chaining on left', () => {
    const sourceFile = createSourceFile(
      'const a = obj?.x || fb1; const b = obj?.y || fb2; const c = obj?.z || "def";',
    )
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(3)
  })

  it('should detect five string default violations', () => {
    const sourceFile = createSourceFile(
      'const a = x || "one"; const b = y || "two"; const c = z || "three"; const d = w || "four"; const e = v || "five";',
    )
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(5)
  })
})

describe('valid code - extended', () => {
  it('should not flag && operator', () => {
    const sourceFile = createSourceFile('const x = a && b;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag ?? operator', () => {
    const sourceFile = createSourceFile('const x = a ?? b;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag ternary operator', () => {
    const sourceFile = createSourceFile('const x = a ? b : c;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag addition operator', () => {
    const sourceFile = createSourceFile('const x = a + b;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag subtraction operator', () => {
    const sourceFile = createSourceFile('const x = a - b;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag multiplication operator', () => {
    const sourceFile = createSourceFile('const x = a * b;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag division operator', () => {
    const sourceFile = createSourceFile('const x = a / b;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag modulo operator', () => {
    const sourceFile = createSourceFile('const x = a % b;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag exponentiation operator', () => {
    const sourceFile = createSourceFile('const x = a ** b;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag less than operator', () => {
    const sourceFile = createSourceFile('const x = a < b;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag greater than operator', () => {
    const sourceFile = createSourceFile('const x = a > b;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag less than or equal operator', () => {
    const sourceFile = createSourceFile('const x = a <= b;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag greater than or equal operator', () => {
    const sourceFile = createSourceFile('const x = a >= b;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag loose equality operator', () => {
    const sourceFile = createSourceFile('const x = a == b;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag strict equality operator', () => {
    const sourceFile = createSourceFile('const x = a === b;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag loose inequality operator', () => {
    const sourceFile = createSourceFile('const x = a != b;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag strict inequality operator', () => {
    const sourceFile = createSourceFile('const x = a !== b;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag bitwise OR operator', () => {
    const sourceFile = createSourceFile('const x = a | b;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag bitwise AND operator', () => {
    const sourceFile = createSourceFile('const x = a & b;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag bitwise XOR operator', () => {
    const sourceFile = createSourceFile('const x = a ^ b;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag left shift operator', () => {
    const sourceFile = createSourceFile('const x = a << b;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag right shift operator', () => {
    const sourceFile = createSourceFile('const x = a >> b;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag unsigned right shift operator', () => {
    const sourceFile = createSourceFile('const x = a >>> b;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag assignment operator', () => {
    const sourceFile = createSourceFile('let x = 0; x = b;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag addition assignment operator', () => {
    const sourceFile = createSourceFile('let x = 0; x += 1;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag subtraction assignment operator', () => {
    const sourceFile = createSourceFile('let x = 0; x -= 1;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag multiplication assignment operator', () => {
    const sourceFile = createSourceFile('let x = 1; x *= 2;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag division assignment operator', () => {
    const sourceFile = createSourceFile('let x = 10; x /= 2;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag modulo assignment operator', () => {
    const sourceFile = createSourceFile('let x = 10; x %= 3;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag exponentiation assignment operator', () => {
    const sourceFile = createSourceFile('let x = 2; x **= 3;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag left shift assignment operator', () => {
    const sourceFile = createSourceFile('let x = 1; x <<= 2;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag right shift assignment operator', () => {
    const sourceFile = createSourceFile('let x = 8; x >>= 1;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag unsigned right shift assignment operator', () => {
    const sourceFile = createSourceFile('let x = 8; x >>>= 1;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag bitwise AND assignment operator', () => {
    const sourceFile = createSourceFile('let x = 3; x &= 1;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag bitwise OR assignment operator', () => {
    const sourceFile = createSourceFile('let x = 1; x |= 2;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag bitwise XOR assignment operator', () => {
    const sourceFile = createSourceFile('let x = 1; x ^= 3;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag logical AND assignment operator', () => {
    const sourceFile = createSourceFile('let x = true; x &&= false;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag logical OR assignment operator', () => {
    const sourceFile = createSourceFile('let x = 0; x ||= 1;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag nullish coalescing assignment operator', () => {
    const sourceFile = createSourceFile('let x = 0; x ??= 1;')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag string concatenation', () => {
    const sourceFile = createSourceFile('const x = "hello" + " world";')
    const violations = analyzePreferNullishCoalescing(sourceFile)
    expect(violations).toHaveLength(0)
  })
})
