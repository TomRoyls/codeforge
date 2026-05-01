/**
 * @module rules/patterns/no-buffer-constructor
 * Disallows use of the Buffer() constructor.
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noBufferConstructorRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const callee = (n as { callee?: unknown }).callee
        const calleeNode = toASTNode(callee)
        if (!calleeNode) return

        if (calleeNode.type === 'Identifier') {
          const name = (calleeNode as { name?: unknown }).name
          if (name === 'Buffer') {
            context.report({
              loc: extractLocation(n),
              message: '`Buffer()` constructor is deprecated. Use `Buffer.alloc()` or `Buffer.from()` instead.',
              node: n,
            })
          }
        }
      },
      NewExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'NewExpression') return

        const callee = (n as { callee?: unknown }).callee
        const calleeNode = toASTNode(callee)
        if (!calleeNode) return

        if (calleeNode.type === 'Identifier') {
          const name = (calleeNode as { name?: unknown }).name
          if (name === 'Buffer') {
            context.report({
              loc: extractLocation(n),
              message: '`new Buffer()` constructor is deprecated. Use `Buffer.alloc()` or `Buffer.from()` instead.',
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
      description: 'Disallow use of the Buffer() constructor',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-buffer-constructor',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noBufferConstructorRule
