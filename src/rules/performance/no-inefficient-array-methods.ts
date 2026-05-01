import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noInefficientArrayMethodsRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const callee = toASTNode(n.callee)
        if (!callee || callee.type !== 'MemberExpression') return

        const methodNode = toASTNode(callee.property)
        if (!methodNode || methodNode.type !== 'Identifier') return

        const methodName = methodNode.name

        if (methodName === 'forEach') {
          const args = (n as { arguments?: unknown[] }).arguments
          if (!args || args.length === 0) return

          const callback = toASTNode(args[0])
          if (!callback) return

          if (
            callback.type === 'ArrowFunctionExpression' ||
            callback.type === 'FunctionExpression'
          ) {
            const body = (callback as { body?: unknown }).body
            const bodyNode = toASTNode(body)
            if (!bodyNode) return

            if (bodyNode.type === 'BlockStatement') {
              const stmts = (bodyNode as { body?: unknown[] }).body
              if (stmts && stmts.length === 1) {
                const stmt = toASTNode(stmts[0])
                if (stmt && stmt.type === 'ExpressionStatement') {
                  const expr = toASTNode((stmt as { expression?: unknown }).expression)
                  if (expr && expr.type === 'CallExpression') {
                    const innerCallee = toASTNode(expr.callee)
                    if (
                      innerCallee &&
                      innerCallee.type === 'MemberExpression'
                    ) {
                      const pushMethod = toASTNode(innerCallee.property)
                      if (
                        pushMethod &&
                        pushMethod.type === 'Identifier' &&
                        pushMethod.name === 'push'
                      ) {
                        context.report({
                          loc: extractLocation(node),
                          message:
                            'Using forEach to push to an array is inefficient. Use Array.map() instead.',
                          node,
                        })
                      }
                    }
                  }
                }
              }
            }
          }
        }

        if (methodName === 'filter' || methodName === 'map') {
          const args = (n as { arguments?: unknown[] }).arguments
          if (!args || args.length === 0) return

          const callback = toASTNode(args[0])
          if (!callback) return

          if (
            callback.type === 'ArrowFunctionExpression' ||
            callback.type === 'FunctionExpression'
          ) {
            const cbBody = (callback as { body?: unknown }).body
            const bodyNode = toASTNode(cbBody)
            if (!bodyNode) return

            if (methodName === 'filter') {
              if (
                bodyNode.type === 'UnaryExpression' &&
                (bodyNode as { operator?: string }).operator === '!'
              ) {
                context.report({
                  loc: extractLocation(node),
                  message:
                    'Using filter with negated callback. Consider using a positive condition or flatMap instead.',
                  node,
                })
              }
            }
          }
        }

        if (methodName === 'splice') {
          const args = (n as { arguments?: unknown[] }).arguments
          if (args && args.length === 2) {
            const secondArg = toASTNode(args[1])
            if (
              secondArg &&
              secondArg.type === 'Literal' &&
              secondArg.value === 1
            ) {
              const firstArg = toASTNode(args[0])
              if (
                firstArg &&
                firstArg.type === 'MemberExpression'
              ) {
                const prop = toASTNode(firstArg.property)
                if (
                  prop &&
                  prop.type === 'Identifier' &&
                  prop.name === 'indexOf'
                ) {
                  context.report({
                    loc: extractLocation(node),
                    message:
                      'Using splice(arr.indexOf(x), 1) to remove an element. Consider using Array.filter() or Array.with() for immutable patterns.',
                    node,
                  })
                }
              }
            }
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'performance',
      description:
        'Detect inefficient array method patterns that could be replaced with more performant alternatives',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-inefficient-array-methods',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noInefficientArrayMethodsRule
