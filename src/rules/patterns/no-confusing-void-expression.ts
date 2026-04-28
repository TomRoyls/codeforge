import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { isBinaryExpression, isTemplateLiteral, toASTNode } from '../../utils/ast-helpers.js'

function isVoidExpression(node: unknown): boolean {
  const n = toASTNode(node)
  return n?.type === 'UnaryExpression' && n.operator === 'void'
}

function isReturnStatement(node: unknown): boolean {
  return toASTNode(node)?.type === 'ReturnStatement'
}

function isArithmeticOperator(operator: string): boolean {
  return ['%', '*', '**', '+', '-', '/'].includes(operator)
}

export const noConfusingVoidExpressionRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      BinaryExpression(node: unknown): void {
        if (!isBinaryExpression(node)) return
        const n = toASTNode(node)
        if (!n) return
        const {operator} = n
        if (!operator || !isArithmeticOperator(operator)) return

        const { left, right } = n

        if (isVoidExpression(left)) {
          context.report({
            loc: extractLocation(left),
            message: `Void expression used in arithmetic operation with '${operator}'. Void always evaluates to undefined, which results in NaN. Use the value directly.`,
          })
        }

        if (isVoidExpression(right)) {
          context.report({
            loc: extractLocation(right),
            message: `Void expression used in arithmetic operation with '${operator}'. Void always evaluates to undefined, which results in NaN. Use the value directly.`,
          })
        }
      },

      ReturnStatement(node: unknown): void {
        if (!isReturnStatement(node)) return
        const n = toASTNode(node)
        if (!n?.argument) return

        if (isVoidExpression(n.argument)) {
          context.report({
            loc: extractLocation(n.argument),
            message:
              'Void expression returned from function. Void always evaluates to undefined. Either return undefined explicitly or remove the void operator.',
          })
        }
      },

      TemplateLiteral(node: unknown): void {
        if (!isTemplateLiteral(node)) return
        const n = toASTNode(node)
        const expressions = n?.expressions
        if (!Array.isArray(expressions) || expressions.length === 0) return

        for (const expression of expressions) {
          if (isVoidExpression(expression)) {
            context.report({
              loc: extractLocation(expression),
              message:
                'Void expression in template literal. Void always evaluates to undefined, which coerces to the string "undefined". Use the value directly or handle the case explicitly.',
            })
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow void expressions used in confusing ways. Void expressions always evaluate to undefined, which can be confusing when used in return statements, template literals, or arithmetic operations.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-confusing-void-expression',
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}

export default noConfusingVoidExpressionRule
