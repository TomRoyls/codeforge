import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'

function isUnaryExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  return (node as Record<string, unknown>).type === 'UnaryExpression'
}

function isVoidExpression(node: unknown): boolean {
  if (!isUnaryExpression(node)) {
    return false
  }

  return (node as Record<string, unknown>).operator === 'void'
}

function isReturnStatement(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  return (node as Record<string, unknown>).type === 'ReturnStatement'
}

function isTemplateLiteral(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  return (node as Record<string, unknown>).type === 'TemplateLiteral'
}

function isBinaryExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  return (node as Record<string, unknown>).type === 'BinaryExpression'
}

function isArithmeticOperator(operator: string): boolean {
  return ['%', '*', '**', '+', '-', '/'].includes(operator)
}

export const noConfusingVoidExpressionRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      BinaryExpression(node: unknown): void {
        if (!isBinaryExpression(node)) {
          return
        }

        const n = node as Record<string, unknown>
        const operator = n.operator as string

        if (!isArithmeticOperator(operator)) {
          return
        }

        const {left} = n
        const {right} = n

        if (isVoidExpression(left)) {
          const location = extractLocation(left)
          context.report({
            loc: location,
            message: `Void expression used in arithmetic operation with '${operator}'. Void always evaluates to undefined, which results in NaN. Use the value directly.`,
          })
        }

        if (isVoidExpression(right)) {
          const location = extractLocation(right)
          context.report({
            loc: location,
            message: `Void expression used in arithmetic operation with '${operator}'. Void always evaluates to undefined, which results in NaN. Use the value directly.`,
          })
        }
      },

      ReturnStatement(node: unknown): void {
        if (!isReturnStatement(node)) {
          return
        }

        const n = node as Record<string, unknown>
        const {argument} = n

        if (!argument) {
          return
        }

        if (isVoidExpression(argument)) {
          const location = extractLocation(argument)
          context.report({
            loc: location,
            message:
              'Void expression returned from function. Void always evaluates to undefined. Either return undefined explicitly or remove the void operator.',
          })
        }
      },

      TemplateLiteral(node: unknown): void {
        if (!isTemplateLiteral(node)) {
          return
        }

        const n = node as Record<string, unknown>
        const expressions = n.expressions as undefined | unknown[]

        if (!expressions || expressions.length === 0) {
          return
        }

        for (const expression of expressions) {
          if (isVoidExpression(expression)) {
            const location = extractLocation(expression)
            context.report({
              loc: location,
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
