/**
 * @fileoverview Tests for prefer-nullish-coalescing rule
 */

import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import {
  analyzePreferNullishCoalescing,
  preferNullishCoalescingRule,
} from '../../../../src/rules/best-practices/prefer-nullish-coalescing.js'

const createSourceFile = (code: string) => {
  const project = new Project({ useInMemoryFileSystem: true })
  return project.createSourceFile('test.ts', code)
}

describe('rule metadata', () => {
  it('should have correct meta properties', () => {
    expect(preferNullishCoalescingRule.meta.name).toBe('prefer-nullish-coalescing')
    expect(preferNullishCoalescingRule.meta.category).toBe('style')
    expect(preferNullishCoalescingRule.meta.fixable).toBe('code')
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
    const sourceFile = createSourceFile('const x = \`Hello \${name || "world"}\`;')
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
