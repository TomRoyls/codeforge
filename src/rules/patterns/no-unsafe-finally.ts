import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function isControlFlowStatement(node: unknown): boolean {
  const type = toASTNode(node)?.type
  return type === 'BreakStatement' || type === 'ContinueStatement' || type === 'ReturnStatement' || type === 'ThrowStatement'
}

export const noUnsafeFinallyRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      TryStatement(node: unknown): void {
        const n = toASTNode(node)
        if (n?.type !== 'TryStatement') return
        const finalizer = toASTNode(n.finalizer)
        if (!finalizer || finalizer.type !== 'BlockStatement') return
        const {body} = finalizer
        if (!Array.isArray(body)) return
        for (const stmt of body) {
          if (isControlFlowStatement(stmt)) {
            context.report({
              loc: extractLocation(stmt),
              message: "Unsafe use of control flow statement inside 'finally' block.",
            })
          }
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow control flow statements in finally blocks.',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noUnsafeFinallyRule
