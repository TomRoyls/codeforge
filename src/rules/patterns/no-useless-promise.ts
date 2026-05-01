import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUselessPromiseRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      NewExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'NewExpression') return

        const callee = toASTNode(n.callee)
        if (!callee || callee.type !== 'Identifier' || callee.name !== 'Promise') return

        const args = (n as { arguments?: unknown[] }).arguments
        if (!args || args.length === 0) return

        const executor = toASTNode(args[0])
        if (!executor) return

        if (
          executor.type === 'ArrowFunctionExpression' ||
          executor.type === 'FunctionExpression'
        ) {
          const body = (executor as { body?: unknown }).body
          const bodyNode = toASTNode(body)
          if (!bodyNode) return

          if (bodyNode.type === 'BlockStatement') {
            const stmts = (bodyNode as { body?: unknown[] }).body
            if (stmts && stmts.length === 1) {
              const stmt = toASTNode(stmts[0])
              if (stmt && stmt.type === 'ExpressionStatement') {
                const expr = toASTNode((stmt as { expression?: unknown }).expression)
                if (expr && expr.type === 'CallExpression') {
                  const callCallee = toASTNode(expr.callee)
                  if (callCallee && callCallee.type === 'Identifier') {
                    const fnName = callCallee.name
                    if (fnName === 'resolve' || fnName === 'reject') {
                      context.report({
                        loc: extractLocation(node),
                        message: `Useless new Promise wrapper. Use Promise.${fnName}() instead.`,
                        node,
                      })
                    }
                  }
                }
              }
            }
          }

          if (bodyNode.type === 'CallExpression') {
            const callCallee = toASTNode(bodyNode.callee)
            if (callCallee && callCallee.type === 'Identifier') {
              const fnName = callCallee.name
              if (fnName === 'resolve' || fnName === 'reject') {
                context.report({
                  loc: extractLocation(node),
                  message: `Useless new Promise wrapper. Use Promise.${fnName}() instead.`,
                  node,
                })
              }
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
        'Disallow unnecessary new Promise wrappers that only call resolve or reject immediately',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-useless-promise',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUselessPromiseRule
