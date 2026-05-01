import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

const PROMISE_METHODS = new Set([
  'then',
  'catch',
  'finally',
])

export const noUnboundPromiseRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      ExpressionStatement(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'ExpressionStatement') return

        const expr = toASTNode((n as { expression?: unknown }).expression)
        if (!expr) return

        if (expr.type === 'CallExpression') {
          const callee = toASTNode(expr.callee)
          if (!callee) return

          if (
            callee.type === 'MemberExpression' &&
            !callee.computed
          ) {
            const obj = toASTNode(callee.object)
            const prop = toASTNode(callee.property)

            if (
              obj &&
              obj.type === 'Identifier' &&
              obj.name === 'Promise' &&
              prop &&
              prop.type === 'Identifier' &&
              (prop.name === 'resolve' || prop.name === 'reject' || prop.name === 'all' || prop.name === 'race' || prop.name === 'allSettled' || prop.name === 'any')
            ) {
              context.report({
                loc: extractLocation(node),
                message: `Unbound Promise.${prop.name}() call. The result is discarded and errors may be silently swallowed.`,
                node,
              })
              return
            }
          }

          if (callee.type === 'NewExpression') {
            const newCallee = toASTNode(callee.callee)
            if (
              newCallee &&
              newCallee.type === 'Identifier' &&
              newCallee.name === 'Promise'
            ) {
              context.report({
                loc: extractLocation(node),
                message:
                  'Unbound new Promise() call. The result is discarded and errors may be silently swallowed.',
                node,
              })
              return
            }
          }

          if (
            callee.type === 'MemberExpression' &&
            !callee.computed
          ) {
            const prop = toASTNode(callee.property)
            if (prop && prop.type === 'Identifier' && prop.name !== undefined && PROMISE_METHODS.has(prop.name)) {
              context.report({
                loc: extractLocation(node),
                message: `Unbound promise .${prop.name}() call. The result is discarded and errors may be silently swallowed.`,
                node,
              })
            }
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow unbound promise calls whose results are discarded',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unbound-promise',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnboundPromiseRule
