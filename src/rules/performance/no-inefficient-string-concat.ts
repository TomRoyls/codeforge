import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noInefficientStringConcatRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      ForStatement(node: unknown): void {
        checkLoopBody(node)
      },
      ForInStatement(node: unknown): void {
        checkLoopBody(node)
      },
      ForOfStatement(node: unknown): void {
        checkLoopBody(node)
      },
      WhileStatement(node: unknown): void {
        checkLoopBody(node)
      },
      DoWhileStatement(node: unknown): void {
        checkLoopBody(node)
      },
    }

    function checkLoopBody(loopNode: unknown): void {
      const n = toASTNode(loopNode)
      if (!n) return

      const body = (n as { body?: unknown }).body
      if (!body) return

      if (isAssignmentExpressionWithPlus(body)) {
        context.report({
          loc: extractLocation(body),
          message: 'String concatenation in loop body is inefficient. Consider collecting parts in an array and using .join() after the loop.',
          node: body,
        })
        return
      }

      const block = toASTNode(body)
      if (!block || block.type !== 'BlockStatement') return

      const stmts = (block as { body?: unknown[] }).body
      if (!stmts || !Array.isArray(stmts)) return

      for (const stmt of stmts) {
        const s = toASTNode(stmt)
        if (!s) continue

        if (s.type === 'ExpressionStatement' && isAssignmentExpressionWithPlus((s as { expression?: unknown }).expression)) {
          context.report({
            loc: extractLocation(s),
            message: 'String concatenation in loop body is inefficient. Consider collecting parts in an array and using .join() after the loop.',
            node: s,
          })
          return
        }
      }
    }

    function isAssignmentExpressionWithPlus(node: unknown): boolean {
      const n = toASTNode(node)
      if (!n) return false
      if (n.type !== 'AssignmentExpression') return false

      const op = (n as { operator?: string }).operator
      if (op !== '+=' && op !== '=') return false

      const right = toASTNode((n as { right?: unknown }).right)
      if (!right) return false

      if (right.type === 'Literal') {
        const val = (right as { value?: unknown }).value
        return typeof val === 'string'
      }

      if (right.type === 'BinaryExpression') {
        const rOp = (right as { operator?: string }).operator
        return rOp === '+'
      }

      return false
    }
  },

  meta: {
    docs: {
      category: 'performance',
      description: 'Disallow inefficient string concatenation inside loops',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-inefficient-string-concat',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noInefficientStringConcatRule
