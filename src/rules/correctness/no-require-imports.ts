/**
 * @module rules/correctness/no-require-imports
 * Disallows `require()` calls in favor of ES module imports.
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noRequireImportsRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const callee = (n as { callee?: unknown }).callee
        if (!callee) return

        const calleeNode = toASTNode(callee)
        if (!calleeNode || calleeNode.type !== 'Identifier') return

        if ((calleeNode as { name?: string }).name !== 'require') return

        const args = (n as { arguments?: unknown[] }).arguments
        if (!args || args.length === 0) return

        context.report({
          loc: extractLocation(n),
          message: 'Unexpected require() call. Use ES module imports instead.',
          node: n,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'correctness',
      description: 'Disallow require() calls in favor of ES module imports',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-require-imports',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noRequireImportsRule
