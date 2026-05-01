import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryPromiseResolveRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      ExpressionStatement(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'ExpressionStatement') return

        const nn = n as Record<string, unknown>
        const expression = nn.expression
        if (!expression || typeof expression !== 'object') return

        const exprNode = toASTNode(expression)
        if (!exprNode || exprNode.type !== 'CallExpression') return

        const call = exprNode as Record<string, unknown>
        const callee = call.callee
        if (!callee || typeof callee !== 'object') return

        const calleeNode = toASTNode(callee)
        if (!calleeNode) return

        const c = calleeNode as Record<string, unknown>
        if (c.type !== 'MemberExpression') return

        const obj = c.object
        const prop = c.property
        if (!obj || !prop || typeof obj !== 'object' || typeof prop !== 'object') return

        const objNode = toASTNode(obj)
        const propNode = toASTNode(prop) as Record<string, unknown>
        if (!objNode) return

        const o = objNode as Record<string, unknown>
        if (o.type === 'Identifier' && o.name === 'Promise' &&
            propNode.type === 'Identifier' && propNode.name === 'resolve') {
          context.report({
            loc: extractLocation(exprNode),
            message:
              'Unnecessary Promise.resolve() as a statement. The resolved value is discarded. Remove or chain the result.',
            node: exprNode,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow Promise.resolve() used as a statement without chaining.',
      recommended: false,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-promise-resolve.md',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryPromiseResolveRule
