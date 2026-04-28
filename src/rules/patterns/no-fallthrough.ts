import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function hasTerminatingStatement(statements: undefined | unknown[]): boolean {
  if (!statements || statements.length === 0) return false
  const last = statements.at(-1)
  const s = toASTNode(last)
  if (!s) return false
  return ['BreakStatement', 'ContinueStatement', 'ReturnStatement', 'ThrowStatement'].includes(s.type ?? '')
}

export const noFallthroughRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      SwitchCase(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'SwitchCase') return
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
