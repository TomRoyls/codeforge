import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
function isSwitchCase(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'SwitchCase'
}

function hasTerminatingStatement(statements: undefined | unknown[]): boolean {
  if (!statements || statements.length === 0) return false
  const last = statements.at(-1)
  if (!last || typeof last !== 'object') return false
  const s = last as Record<string, unknown>
  return ['BreakStatement', 'ContinueStatement', 'ReturnStatement', 'ThrowStatement'].includes(
    s.type as string,
  )
}

export const noFallthroughRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      SwitchCase(node: unknown): void {
        if (!isSwitchCase(node)) return
        const n = node as Record<string, unknown>
        const consequent = n.consequent as undefined | unknown[]
        if (!consequent || consequent.length === 0) return
        if (!hasTerminatingStatement(consequent)) {
          context.report({
            loc: extractLocation(consequent.at(-1)),
            message: 'Expected a break statement before fallthrough.',
          })
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow fallthrough in switch statements.',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noFallthroughRule
