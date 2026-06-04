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

  const category = rule.meta?.docs?.category ?? 'test'

  // Detect rule architecture: adapter-style rules use context.report() and
  // return ESTree visitor keys (FunctionDeclaration, CallExpression, etc.)
  // ts-morph-native rules use options and return visitFunction/visitNode/etc.
  const probeContext = { config: { options: [] }, report: () => {}, getFilePath: () => '', getSource: () => '' }
  const probeResult = (rule as unknown as { create: (ctx: unknown) => { visitor: Record<string, unknown> } }).create(probeContext)
  const visitorKeys = Object.keys(probeResult.visitor ?? {})
  const isAdapterRule =
    category === 'patterns' ||
    category === 'security' ||
    (visitorKeys.some((k) =>
      ['CallExpression', 'MemberExpression', 'AssignmentExpression', 'UnaryExpression', 'BinaryExpression', 'Identifier', 'Literal'].includes(k),
    )
    && !visitorKeys.some((k) => k.startsWith('visit')))

  if (isAdapterRule) {
    const adapted = adaptPluginRule(rule, category)
    const result = adapted.create({})
    traverseAST(sf, result.visitor, [])
    const violations = result.onComplete?.() ?? []
    return violations.map((v) => ({
      ruleId: v.ruleId,
      message: v.message,
      loc: v.loc,
    }))
  } else {
    const options = rule.defaultOptions ?? {}
    const result = (rule as unknown as { create: (opts: unknown) => { visitor: unknown; onComplete?: () => unknown } }).create(options)
    if (result.visitor) {
      traverseAST(sf, result.visitor as Parameters<typeof traverseAST>[1], [])
    }
    const violations = (result.onComplete?.() ?? []) as Array<{ ruleId: string; message: string; loc?: unknown; filePath?: string }>
    return violations.map((v) => ({
      ruleId: v.ruleId,
      message: v.message,
      loc: v.loc,
    }))
  }
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
