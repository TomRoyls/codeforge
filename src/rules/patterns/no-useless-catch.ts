import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function onlyRethrows(body: unknown): boolean {
  const b = toASTNode(body)
  if (b?.type !== 'BlockStatement' || !Array.isArray(b.body) || b.body.length !== 1) return false
  return toASTNode(b.body[0])?.type === 'ThrowStatement'
}

export const noUselessCatchRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      TryStatement(node: unknown): void {
        const n = toASTNode(node)
        if (n?.type !== 'TryStatement') return
        const handler = toASTNode(n.handler)
        if (handler?.body && onlyRethrows(handler.body)) {
          context.report({
            loc: extractLocation(n.handler),
            message: 'Useless catch clause that only rethrows.',
          })
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow useless catch clauses.',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noUselessCatchRule
