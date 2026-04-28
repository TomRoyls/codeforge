import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function isEmpty(body: unknown): boolean {
  const b = toASTNode(body)
  if (!b || b.type !== 'BlockStatement') return false
  const stmts = b.body
  return Array.isArray(stmts) && stmts.length === 0
}

export const noEmptyStaticBlockRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      StaticBlock(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'StaticBlock') return
        if (isEmpty(n.body)) {
          context.report({
            loc: extractLocation(node),
            message: 'Unexpected empty static block.',
          })
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow empty static blocks.',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noEmptyStaticBlockRule
