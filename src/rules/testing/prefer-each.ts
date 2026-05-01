import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

const TEST_NAMES = new Set(['test', 'it'])
const MESSAGE = 'Prefer test.each() or it.each() over loop-based tests for better test reporting'

function isTestCall(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n || n.type !== 'CallExpression') return false

  const callee = toASTNode(n.callee)
  if (!callee) return false

  if (callee.type === 'Identifier' && typeof callee.name === 'string') {
    return TEST_NAMES.has(callee.name)
  }

  if (callee.type === 'MemberExpression') {
    const object = toASTNode(callee.object)
    if (object?.type === 'Identifier' && typeof object.name === 'string') {
      return TEST_NAMES.has(object.name)
    }
  }

  return false
}

function getBodyStatements(body: unknown): unknown[] {
  if (!body) return []
  const node = toASTNode(body)
  if (!node) return []

  if (Array.isArray(node)) return node

  if (node.type === 'BlockStatement' && Array.isArray(node.body)) {
    return node.body
  }

  return [body]
}

function bodyContainsOnlyTestCalls(body: unknown): boolean {
  const stmts = getBodyStatements(body)
  if (stmts.length === 0) return false

  return stmts.every((stmt) => {
    const s = toASTNode(stmt)
    if (!s) return false

    if (s.type === 'ExpressionStatement' && s.expression) {
      return isTestCall(s.expression)
    }

    return isTestCall(stmt)
  })
}

export const preferEachRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const callee = toASTNode(n.callee)
        if (!callee) return

        if (callee.type !== 'Identifier' || typeof callee.name !== 'string') return
        if (callee.name !== 'forEach') return

        const args = n.arguments
        if (!Array.isArray(args) || args.length === 0) return

        const callback = toASTNode(args[0])
        if (!callback) return

        let callbackBody: unknown = null
        if (callback.type === 'ArrowFunctionExpression' || callback.type === 'FunctionExpression') {
          callbackBody = callback.body
        }

        if (callbackBody && bodyContainsOnlyTestCalls(callbackBody)) {
          context.report({
            loc: extractLocation(node),
            message: MESSAGE,
            node,
          })
        }
      },

      ForStatement(node: unknown): void {
        const n = toASTNode(node)
        if (!n || !n.body) return

        if (bodyContainsOnlyTestCalls(n.body)) {
          context.report({
            loc: extractLocation(node),
            message: MESSAGE,
            node,
          })
        }
      },

      ForInStatement(node: unknown): void {
        const n = toASTNode(node)
        if (!n || !n.body) return

        if (bodyContainsOnlyTestCalls(n.body)) {
          context.report({
            loc: extractLocation(node),
            message: MESSAGE,
            node,
          })
        }
      },

      ForOfStatement(node: unknown): void {
        const n = toASTNode(node)
        if (!n || !n.body) return

        if (bodyContainsOnlyTestCalls(n.body)) {
          context.report({
            loc: extractLocation(node),
            message: MESSAGE,
            node,
          })
        }
      },

      WhileStatement(node: unknown): void {
        const n = toASTNode(node)
        if (!n || !n.body) return

        if (bodyContainsOnlyTestCalls(n.body)) {
          context.report({
            loc: extractLocation(node),
            message: MESSAGE,
            node,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description:
        'Suggest using test.each() or it.each() instead of for/forEach loops containing only test calls',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/prefer-each',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default preferEachRule
