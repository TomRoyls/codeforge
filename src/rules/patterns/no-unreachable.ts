import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function terminatesFlow(node: unknown): boolean {
  const type = toASTNode(node)?.type
  return type === 'ReturnStatement' || type === 'ThrowStatement' || type === 'BreakStatement' || type === 'ContinueStatement'
}

export const noUnreachableRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      BlockStatement(node: unknown): void {
        const n = toASTNode(node)
        if (n?.type !== 'BlockStatement') return
        const { body } = n
        if (!Array.isArray(body)) return

        let foundTerminator = false
        for (const stmt of body) {
          if (foundTerminator) {
            context.report({
              loc: extractLocation(stmt),
              message: 'Unreachable code detected.',
            })
            break
          }

          if (terminatesFlow(stmt)) {
            foundTerminator = true
          }
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow unreachable code.',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noUnreachableRule
