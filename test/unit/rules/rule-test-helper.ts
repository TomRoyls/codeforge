import { Project } from 'ts-morph'
import { adaptPluginRule } from '../../../src/rules/adapter.js'
import { traverseAST } from '../../../src/ast/visitor.js'
import type { RuleDefinition } from '../../../src/plugins/types.js'

export interface Violation {
  ruleId: string
  message: string
  loc?: unknown
}

export function runRule(
  rule: RuleDefinition,
  code: string,
  filename = 'test.ts',
): Violation[] {
  const project = new Project({ useInMemoryFileSystem: true })
  const sf = project.createSourceFile(filename, code)

  const adapted = adaptPluginRule(rule, rule.meta?.docs?.category ?? 'test')
  const result = adapted.create({})

  traverseAST(sf, result.visitor, [])
  const violations = result.onComplete?.() ?? []
  return violations.map((v) => ({
    ruleId: v.ruleId,
    message: v.message,
    loc: v.loc,
  }))
}

export function expectViolations(
  violations: Violation[],
  messages: string[],
): void {
  for (const msg of messages) {
    expect(
      violations.some((v) => v.message.includes(msg)),
      `Expected violation containing "${msg}", got: ${violations.map((v) => v.message).join(', ')}`,
    ).toBe(true)
  }
}

export function expectNoViolations(violations: Violation[]): void {
  expect(violations).toHaveLength(0)
}

export function expectViolationCount(violations: Violation[], count: number): void {
  expect(violations).toHaveLength(count)
}
