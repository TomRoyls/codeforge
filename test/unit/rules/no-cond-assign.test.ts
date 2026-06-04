import { describe, it, expect } from 'vitest'
import { noCondAssignRule } from '../../../src/rules/patterns/no-cond-assign.js'
import type { RuleContext, RuleVisitor } from '../../../src/plugins/types.js'

function createMockContext(): RuleContext {
  const violations: Array<{ message: string; line: number; column: number }> = []
  return {
    config: { options: [] },
    report(descriptor: { loc?: { start: { line: number; column: number } }; message: string }) {
      violations.push({
        column: descriptor.loc?.start.column ?? 0,
        line: descriptor.loc?.start.line ?? 0,
        message: descriptor.message,
      })
    },
    getSource: () => '',
    violations,
  } as unknown as RuleContext
}

function runVisitor(
  visitor: RuleVisitor,
  handlerName: string,
  node: Record<string, unknown>,
): void {
  const handler = visitor[handlerName] as ((node: unknown) => void) | undefined
  if (handler) handler(node)
}

describe('no-cond-assign', () => {
  it('should report assignment in if condition', () => {
    const context = createMockContext()
    const result = noCondAssignRule.create(context)
    runVisitor(result, 'IfStatement', {
      test: { type: 'AssignmentExpression', operator: '=' },
      type: 'IfStatement',
    })
    expect(context.violations).toHaveLength(1)
    expect(context.violations[0]!.message).toContain('assignment')
  })

  it('should report assignment in while condition', () => {
    const context = createMockContext()
    const result = noCondAssignRule.create(context)
    runVisitor(result, 'WhileStatement', {
      test: { type: 'AssignmentExpression', operator: '=' },
      type: 'WhileStatement',
    })
    expect(context.violations).toHaveLength(1)
  })

  it('should report assignment in do-while condition', () => {
    const context = createMockContext()
    const result = noCondAssignRule.create(context)
    runVisitor(result, 'DoWhileStatement', {
      test: { type: 'AssignmentExpression', operator: '=' },
      type: 'DoWhileStatement',
    })
    expect(context.violations).toHaveLength(1)
  })

  it('should report assignment in for condition', () => {
    const context = createMockContext()
    const result = noCondAssignRule.create(context)
    runVisitor(result, 'ForStatement', {
      test: { type: 'AssignmentExpression', operator: '=' },
      type: 'ForStatement',
    })
    expect(context.violations).toHaveLength(1)
  })

  it('should report assignment in ternary condition', () => {
    const context = createMockContext()
    const result = noCondAssignRule.create(context)
    runVisitor(result, 'ConditionalExpression', {
      test: { type: 'AssignmentExpression', operator: '=' },
      type: 'ConditionalExpression',
    })
    expect(context.violations).toHaveLength(1)
  })

  it('should not report non-assignment if condition', () => {
    const context = createMockContext()
    const result = noCondAssignRule.create(context)
    runVisitor(result, 'IfStatement', {
      test: { type: 'BinaryExpression', operator: '===' },
      type: 'IfStatement',
    })
    expect(context.violations).toHaveLength(0)
  })

  it('should not report non-assignment while condition', () => {
    const context = createMockContext()
    const result = noCondAssignRule.create(context)
    runVisitor(result, 'WhileStatement', {
      test: { type: 'BinaryExpression', operator: '<' },
      type: 'WhileStatement',
    })
    expect(context.violations).toHaveLength(0)
  })
})
