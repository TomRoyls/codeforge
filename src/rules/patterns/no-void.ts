import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { getRange, isIdentifier, isLiteral, toASTNode } from '../../utils/ast-helpers.js'

function isVoidExpression(node: unknown): boolean {
  const n = toASTNode(node)
  return n?.type === 'UnaryExpression' && n.operator === 'void'
}

function isLiteralZero(argument: unknown): boolean {
  return isLiteral(argument) && toASTNode(argument)?.value === 0
}

function isUndefinedIdentifier(argument: unknown): boolean {
  return isIdentifier(argument, 'undefined')
}

function canAutoFix(argument: unknown): boolean {
  return isLiteralZero(argument) || isUndefinedIdentifier(argument)
}

export const noVoidRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      UnaryExpression(node: unknown): void {
        if (!isVoidExpression(node)) return

        const n = toASTNode(node)
        const argument = n?.argument
        const location = extractLocation(node)
        const range = getRange(node)

        const fix = range && canAutoFix(argument) ? { range, text: 'undefined' } : undefined

        context.report({
          fix,
          loc: location,
          message: 'Unexpected void operator.',
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow the void operator. The void operator evaluates an expression and returns undefined. It is often confusing and rarely necessary.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-void',
    },
    fixable: 'code',
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noVoidRule
