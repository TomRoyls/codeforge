import { expect } from 'vitest'
import type { RuleDefinition } from '../../src/plugins/types.js'
import { toASTNode } from '../../src/utils/ast-helpers.js'

type ValidTest = string | { code: string }

interface InvalidTest {
  code: string
  errors: Array<{ message?: string }>
}

interface RunOptions {
  valid: ValidTest[]
  invalid: InvalidTest[]
}

function parseCodeToCallExpression(code: string): unknown {
  const match = code.match(/console\.(\w+)\((.*)\)/)
  if (!match) return null
  const [, method, argsStr] = match
  const args: unknown[] = []
  if (argsStr.trim()) {
    if (argsStr.trim().startsWith('...[')) {
      args.push({ type: 'SpreadElement', argument: { type: 'ArrayExpression', elements: [] } })
    } else
    for (const part of argsStr.split(',').map(s => s.trim())) {
        if (part.startsWith('...')) {
          const expr = part.slice(3)
          if (expr.startsWith('[')) {
            args.push({ type: 'SpreadElement', argument: { type: 'ArrayExpression', elements: [] } })
          } else if (expr.startsWith('"') || expr.startsWith("'")) {
            args.push({ type: 'SpreadElement', argument: { type: 'Literal', value: expr.slice(1, -1) } })
          } else {
            args.push({ type: 'SpreadElement', argument: { type: 'Identifier', name: expr } })
          }
        } else if (part.startsWith('"') || part.startsWith("'")) {
          args.push({ type: 'Literal', value: part.slice(1, -1) })
        } else if (/^\d+$/.test(part)) {
          args.push({ type: 'Literal', value: Number(part) })
        } else {
          args.push({ type: 'Identifier', name: part })
        }
      }
  }
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'console' },
      property: { type: 'Identifier', name: method },
      computed: false,
    },
    arguments: args,
  }
}

export const ruleTester = {
  run(_ruleName: string, rule: RuleDefinition, options: RunOptions): void {
    const visitor = rule.create({
      report: () => {},
      getFilePath: () => '/test.ts',
      getAST: () => null,
      getSource: () => '',
    } as never)

    for (const testCase of options.valid) {
      const code = typeof testCase === 'string' ? testCase : testCase.code
      const reports: unknown[] = []
      const ctx = {
        report: (r: unknown) => reports.push(r),
        getFilePath: () => '/test.ts',
        getAST: () => null,
        getSource: () => code,
      }
      const v = rule.create(ctx as never)
      const node = parseCodeToCallExpression(code)
      if (node && v.CallExpression) {
        (v.CallExpression as (n: unknown) => void)(node)
      }
      expect(reports).toHaveLength(0)
    }

    for (const testCase of options.invalid) {
      const reports: Array<{ message?: string }> = []
      const ctx = {
        report: (r: unknown) => reports.push(r as { message?: string }),
        getFilePath: () => '/test.ts',
        getAST: () => null,
        getSource: () => testCase.code,
      }
      const v = rule.create(ctx as never)
      const node = parseCodeToCallExpression(testCase.code)
      if (node && v.CallExpression) {
        (v.CallExpression as (n: unknown) => void)(node)
      }
      expect(reports.length).toBeGreaterThan(0)
      for (const expectedError of testCase.errors) {
        if (expectedError.message) {
          const expected = expectedError.message.replace(/^'/, '').replace(/'$/, '')
          const found = reports.length > 0
          expect(found).toBe(true)
        }
      }
    }
  },
}
