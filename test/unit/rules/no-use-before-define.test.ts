import { describe, test, expect } from 'vitest'
import { Project } from 'ts-morph'
import { noUseBeforeDefineRule } from '../../../src/rules/patterns/no-use-before-define.js'
import { adaptPluginRule } from '../../../src/rules/adapter.js'
import { traverseAST } from '../../../src/ast/visitor.js'

function runRule(code: string): Array<{ ruleId: string; message: string }> {
  const project = new Project({ useInMemoryFileSystem: true })
  const sf = project.createSourceFile('test.ts', code)

  const adapted = adaptPluginRule(noUseBeforeDefineRule, 'no-use-before-define')
  const result = adapted.create({})

  const violations: Array<{ ruleId: string; message: string }> = []
  traverseAST(sf, result.visitor, [])
  const ruleViolations = result.onComplete?.() ?? []
  for (const v of ruleViolations) {
    violations.push({ ruleId: v.ruleId, message: v.message })
  }
  return violations
}

describe('no-use-before-define', () => {
  test('does not flag built-in globals (console, Math, parseInt)', () => {
    const violations = runRule(`const x = console.log("hello"); const y = Math.floor(3.14); const z = parseInt("42");`)
    expect(violations).toHaveLength(0)
  })

  test('does not flag property access names (log, floor)', () => {
    const violations = runRule(`const x = console.log("hello"); const y = Math.floor(3.14);`)
    expect(violations).toHaveLength(0)
  })

  test('does not flag imported names', () => {
    const violations = runRule(`
      import { foo } from 'mod';
      const x = foo();
    `)
    expect(violations).toHaveLength(0)
  })

  test('does not flag type-only imports', () => {
    const violations = runRule(`
      import type { MyType } from 'mod';
      const x: MyType = {} as MyType;
    `)
    const typeViolations = violations.filter((v) => v.message.includes('MyType'))
    expect(typeViolations).toHaveLength(0)
  })

  test('does not flag function parameters (when no type annotation)', () => {
    const violations = runRule(`
      function greet(name) {
        return name;
      }
    `)
    expect(violations.filter((v) => v.message.includes("'name'"))).toHaveLength(0)
  })

  test('does not flag arrow function parameters (when no type annotation)', () => {
    const violations = runRule(`
      const add = (a, b) => a + b;
    `)
    expect(violations.filter((v) => v.message.includes("'a'") || v.message.includes("'b'"))).toHaveLength(0)
  })

  test('does not flag TypeScript typed function parameters', () => {
    const violations = runRule(`
      function greet(name: string): string {
        return name;
      }
    `)
    expect(violations.filter((v) => v.message.includes("'name'"))).toHaveLength(0)
  })

  test('does not flag TypeScript typed arrow function parameters', () => {
    const violations = runRule(`
      const add = (a: number, b: number) => a + b;
    `)
    expect(violations.filter((v) => v.message.includes("'a'") || v.message.includes("'b'"))).toHaveLength(0)
  })

  test('does not flag destructured parameters', () => {
    const violations = runRule(`
      const fn = ({ x, y }) => x + y;
    `)
    expect(violations.filter((v) => v.message.includes("'x'") || v.message.includes("'y'"))).toHaveLength(0)
  })

  test('does not flag rest parameters', () => {
    const violations = runRule(`
      const fn = (...args) => args.length;
    `)
    expect(violations.filter((v) => v.message.includes("'args'"))).toHaveLength(0)
  })

  test('does not flag default parameters', () => {
    const violations = runRule(`
      const fn = (x = 1) => x + 1;
    `)
    expect(violations.filter((v) => v.message.includes("'x'"))).toHaveLength(0)
  })

  test('does not flag object property keys', () => {
    const violations = runRule(`
      const obj = { name: 'test', age: 42 };
    `)
    const propViolations = violations.filter(
      (v) => v.message.includes("'name'") || v.message.includes("'age'"),
    )
    expect(propViolations).toHaveLength(0)
  })

  test('does not flag TypeScript utility types (Record, Partial, Pick)', () => {
    const violations = runRule(`
      const x: Record<string, unknown> = {};
      const y: Partial<{a: string}> = {};
      type T = Pick<{a: string; b: number}, 'a'>;
    `)
    expect(violations.filter((v) => v.message.includes('Record'))).toHaveLength(0)
    expect(violations.filter((v) => v.message.includes('Partial'))).toHaveLength(0)
    expect(violations.filter((v) => v.message.includes('Pick'))).toHaveLength(0)
  })

  test('flags genuinely undefined variables', () => {
    const violations = runRule(`
      const x = undefinedVar + 1;
    `)
    expect(violations.length).toBeGreaterThanOrEqual(1)
    expect(violations.some((v) => v.message.includes("'undefinedVar'"))).toBe(true)
  })

  test('does not flag const declarations used after', () => {
    const violations = runRule(`
      const x = 1;
      console.log(x);
    `)
    expect(violations.filter((v) => v.message.includes("'x'"))).toHaveLength(0)
  })

  test('does not flag namespace imports', () => {
    const violations = runRule(`
      import * as utils from 'utils';
      utils.doSomething();
    `)
    expect(violations.filter((v) => v.message.includes("'utils'"))).toHaveLength(0)
  })

  test('does not flag default imports', () => {
    const violations = runRule(`
      import React from 'react';
      React.createElement('div');
    `)
    expect(violations.filter((v) => v.message.includes("'React'"))).toHaveLength(0)
  })
})
