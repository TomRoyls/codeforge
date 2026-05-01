import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

import { isExpectCall } from '../../utils/ast-helpers.js'

export const noAssertTruthinessRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        if (!isExpectCall(n)) return

        const args = (n as { arguments?: unknown[] }).arguments
        if (!args || args.length === 0) return

        const firstArg = toASTNode(args[0])
        if (!firstArg) return

        if (firstArg.type === 'UnaryExpression') {
          const op = (firstArg as { operator?: string }).operator
          if (op === '!') {
            const inner = toASTNode(firstArg.argument)
            if (inner && inner.type === 'UnaryExpression') {
              const innerOp = (inner as { operator?: string }).operator
              if (innerOp === '!') {
                context.report({
                  loc: extractLocation(node),
                  message:
                    'Avoid expect(!!x). Use expect(x).toBeTruthy() or expect(Boolean(x)).toBeFalsy() instead for clarity.',
                  node,
                })
                return
              }
            }
          }
        }

        if (firstArg.type === 'CallExpression') {
          const callee = toASTNode(firstArg.callee)
          if (callee && callee.type === 'Identifier' && callee.name === 'Boolean') {
            context.report({
              loc: extractLocation(node),
              message:
                'Avoid expect(Boolean(x)). Use expect(x).toBeTruthy() or the appropriate matcher instead.',
              node,
            })
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description:
        'Discourage redundant Boolean coercion in expect() assertions',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-assert-truthiness',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noAssertTruthinessRule
