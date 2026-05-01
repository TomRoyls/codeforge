/**
 * @module rules/patterns/no-useless-call
 * Disallows unnecessary .call() and .apply() invocations.
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUselessCallRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const callee = (n as { callee?: unknown }).callee
        if (!callee || typeof callee !== 'object') return

        const calleeNode = callee as Record<string, unknown>
        if (calleeNode.type !== 'MemberExpression') return

        const property = calleeNode.property as Record<string, unknown> | undefined
        if (!property || property.type !== 'Identifier') return

        const propName = property.name as string | undefined
        if (propName !== 'call' && propName !== 'apply') return

        const obj = calleeNode.object
        if (!obj || typeof obj !== 'object') return

        const objNode = obj as Record<string, unknown>
        if (objNode.type !== 'FunctionExpression' && objNode.type !== 'ArrowFunctionExpression') return

        context.report({
          loc: extractLocation(n),
          message: `Unnecessary '.${propName}()' invocation. Call the function directly.`,
          node: n,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow unnecessary .call() and .apply()',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-useless-call',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUselessCallRule
