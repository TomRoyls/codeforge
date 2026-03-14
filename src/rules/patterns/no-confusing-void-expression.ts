import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

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
  return ['+', '-', '*', '/', '%', '**'].includes(operator)
}

export const noConfusingVoidExpressionRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description:
        'Disallow void expressions used in confusing ways. Void expressions always evaluate to undefined, which can be confusing when used in return statements, template literals, or arithmetic operations.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-confusing-void-expression',
    },
    schema: [],
    fixable: undefined,
  },

  create(context: RuleContext): RuleVisitor {
    return {
      ReturnStatement(node: unknown): void {
        if (!isReturnStatement(node)) {
          return
        }

        const n = node as Record<string, unknown>
        const argument = n.argument

        if (!argument) {
          return
        }

        if (isVoidExpression(argument)) {
          const location = extractLocation(argument)
          context.report({
            message:
              'Void expression returned from function. Void always evaluates to undefined. Either return undefined explicitly or remove the void operator.',
            loc: location,
          })
        }
      },

      TemplateLiteral(node: unknown): void {
        if (!isTemplateLiteral(node)) {
          return
        }

        const n = node as Record<string, unknown>
        const expressions = n.expressions as unknown[] | undefined

        if (!expressions || expressions.length === 0) {
          return
        }

        for (const expression of expressions) {
          if (isVoidExpression(expression)) {
            const location = extractLocation(expression)
            context.report({
              message:
                'Void expression in template literal. Void always evaluates to undefined, which coerces to the string "undefined". Use the value directly or handle the case explicitly.',
              loc: location,
            })
          }
        }
      },

      BinaryExpression(node: unknown): void {
        if (!isBinaryExpression(node)) {
          return
        }

        const n = node as Record<string, unknown>
        const operator = n.operator as string

        if (!isArithmeticOperator(operator)) {
          return
        }

        const left = n.left
        const right = n.right

        if (isVoidExpression(left)) {
          const location = extractLocation(left)
          context.report({
            message: `Void expression used in arithmetic operation with '${operator}'. Void always evaluates to undefined, which results in NaN. Use the value directly.`,
            loc: location,
          })
        }

        if (isVoidExpression(right)) {
          const location = extractLocation(right)
          context.report({
            message: `Void expression used in arithmetic operation with '${operator}'. Void always evaluates to undefined, which results in NaN. Use the value directly.`,
            loc: location,
          })
        }
      },
    }
  },
}

export default noConfusingVoidExpressionRule
