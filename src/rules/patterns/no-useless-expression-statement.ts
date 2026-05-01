import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noExpressionStatementAssignRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      ExpressionStatement(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'ExpressionStatement') return

        const expr = toASTNode((n as { expression?: unknown }).expression)
        if (!expr) return

        if (expr.type === 'AssignmentExpression') return

        if (expr.type === 'CallExpression') {
          const callee = toASTNode(expr.callee)
          if (
            callee &&
            callee.type === 'MemberExpression' &&
            !callee.computed
          ) {
            const prop = toASTNode(callee.property)
            if (
              prop &&
              prop.type === 'Identifier' &&
              (prop.name === 'push' || prop.name === 'pop' || prop.name === 'shift' || prop.name === 'unshift' || prop.name === 'splice' || prop.name === 'sort' || prop.name === 'reverse')
            ) {
              return
            }
          }
          return
        }

        if (
          expr.type === 'UpdateExpression' ||
          expr.type === 'AwaitExpression' ||
          expr.type === 'NewExpression' ||
          expr.type === 'ThrowStatement' ||
          expr.type === 'YieldExpression'
        ) {
          return
        }

        if (expr.type === 'Literal') return

        if (expr.type === 'Identifier') {
          context.report({
            loc: extractLocation(node),
            message: `Unused expression statement: identifier "${(expr as { name?: string }).name}" has no side effects. Did you mean to assign or call it?`,
            node,
          })
          return
        }

        if (
          expr.type === 'BinaryExpression' ||
          expr.type === 'LogicalExpression' ||
          expr.type === 'TemplateLiteral'
        ) {
          context.report({
            loc: extractLocation(node),
            message:
              'Unused expression statement. This expression evaluates to a value but the result is discarded.',
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
        'Detect expression statements that have no side effects',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-expression-statement-assign',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noExpressionStatementAssignRule
