import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation, getRange, isLiteral, isIdentifier } from '../../utils/ast-helpers.js'

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

function isLiteralZero(argument: unknown): boolean {
  if (!isLiteral(argument)) {
    return false
  }
  return (argument as Record<string, unknown>).value === 0
}

function isUndefinedIdentifier(argument: unknown): boolean {
  return isIdentifier(argument, 'undefined')
}

function canAutoFix(argument: unknown): boolean {
  return isLiteralZero(argument) || isUndefinedIdentifier(argument)
}

export const noVoidRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Disallow the void operator. The void operator evaluates an expression and returns undefined. It is often confusing and rarely necessary.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-void',
    },
    schema: [],
    fixable: 'code',
  },

  create(context: RuleContext): RuleVisitor {
    return {
      UnaryExpression(node: unknown): void {
        if (!isVoidExpression(node)) {
          return
        }

        const n = node as Record<string, unknown>
        const argument = n.argument
        const location = extractLocation(node)
        const range = getRange(node)

        const fix = range && canAutoFix(argument) ? { range, text: 'undefined' } : undefined

        context.report({
          message: 'Unexpected void operator.',
          loc: location,
          fix,
        })
      },
    }
  },
}

export default noVoidRule
