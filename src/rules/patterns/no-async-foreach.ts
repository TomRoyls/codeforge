import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

const MUTABLE_ARRAY_METHODS = new Set(['forEach'])

export const noAsyncForeachRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const callee = toASTNode(n.callee)
        if (!callee || callee.type !== 'MemberExpression') return

        const prop = toASTNode(callee.property)
        if (!prop || prop.type !== 'Identifier' || !prop.name) return

        if (!MUTABLE_ARRAY_METHODS.has(prop.name)) return

        const args = (n as { arguments?: unknown[] }).arguments
        if (!args || args.length === 0) return

        const callback = toASTNode(args[0])
        if (!callback) return

        const isAsync =
          callback.type === 'ArrowFunctionExpression' &&
          (callback as { async?: boolean }).async === true

        const isAsyncFunction =
          callback.type === 'FunctionExpression' &&
          (callback as { async?: boolean }).async === true

        if (isAsync || isAsyncFunction) {
          context.report({
            loc: extractLocation(node),
            message: `Async callback passed to ${prop.name}(). Use a for...of loop or Promise.all() with map() instead.`,
            node,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow passing async functions to array iteration methods that do not await the callback',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-async-foreach',
    },
    schema: [],
    severity: 'warn',
    type: 'problem',
  },
}

export default noAsyncForeachRule
