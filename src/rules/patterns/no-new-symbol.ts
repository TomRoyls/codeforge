/**
 * @module rules/patterns/no-new-symbol
 * Disallows use of the new operator with Symbol.
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noNewSymbolRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      NewExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'NewExpression') return

        const callee = (n as { callee?: unknown }).callee
        if (!callee) return

        const calleeNode = toASTNode(callee)
        if (!calleeNode) return

        if (calleeNode.type === 'Identifier') {
          const name = (calleeNode as { value?: string }).value ?? (calleeNode as { name?: unknown }).name as string
          if (name === 'Symbol') {
            context.report({
              loc: extractLocation(n),
              message: 'Symbol cannot be called as a constructor. Use Symbol() without new.',
              node: n,
            })
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow new operators with Symbol',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-new-symbol',
    },
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}

export default noNewSymbolRule
