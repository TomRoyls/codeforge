import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noMisleadingInstantiationRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      NewExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'NewExpression') return

        const callee = toASTNode(n.callee)
        if (!callee || callee.type !== 'Identifier') return

        const args = (n as { arguments?: unknown[] }).arguments
        const argCount = args ? args.length : 0

        if (callee.name === 'String' && argCount === 0) {
          context.report({
            loc: extractLocation(node),
            message:
              'Useless String constructor. Use string literal (e.g., "") or String() as a function call instead.',
            node,
          })
          return
        }

        if (callee.name === 'Number' && argCount === 0) {
          context.report({
            loc: extractLocation(node),
            message:
              'Useless Number constructor. Use number literal (e.g., 0) or Number() as a function call instead.',
            node,
          })
          return
        }

        if (callee.name === 'Boolean' && argCount === 0) {
          context.report({
            loc: extractLocation(node),
            message:
              'Useless Boolean constructor. Use boolean literal (e.g., false) or Boolean() as a function call instead.',
            node,
          })
          return
        }

        if (callee.name === 'Array' && argCount === 0) {
          context.report({
            loc: extractLocation(node),
            message:
              'Useless Array constructor. Use array literal (e.g., []) instead.',
            node,
          })
          return
        }

        if (callee.name === 'Object' && argCount === 0) {
          context.report({
            loc: extractLocation(node),
            message:
              'Useless Object constructor. Use object literal (e.g., {}) instead.',
            node,
          })
          return
        }

        if (callee.name === 'RegExp' && argCount === 0) {
          context.report({
            loc: extractLocation(node),
            message:
              'Useless RegExp constructor. Use regex literal (e.g., /(?:)/) or RegExp() as a function call instead.',
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
        'Disallow misleading use of constructors for primitive types and empty collections',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-misleading-instantiation',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noMisleadingInstantiationRule
