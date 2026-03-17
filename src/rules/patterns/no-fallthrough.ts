import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'
function isSwitchCase(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'SwitchCase'
}
function hasTerminatingStatement(statements: unknown[] | undefined): boolean {
  if (!statements || statements.length === 0) return false
  const last = statements[statements.length - 1]
  if (!last || typeof last !== 'object') return false
  const s = last as Record<string, unknown>
  return ['BreakStatement', 'ReturnStatement', 'ThrowStatement', 'ContinueStatement'].includes(s.type as string)
}
export const noFallthroughRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description: 'Disallow fallthrough in switch statements.',
      category: 'patterns',
      recommended: true,
    },
    schema: [],
    fixable: undefined,
  },
  create(context: RuleContext): RuleVisitor {
    return {
      SwitchCase(node: unknown): void {
        if (!isSwitchCase(node)) return
        const n = node as Record<string, unknown>
        const consequent = n.consequent as unknown[] | undefined
        if (!consequent || consequent.length === 0) return
        if (!hasTerminatingStatement(consequent)) {
          context.report({
            message: 'Expected a break statement before fallthrough.',
            loc: extractLocation(consequent[consequent.length - 1]),
          })
        }
      },
    }
  },
}
export default noFallthroughRule
