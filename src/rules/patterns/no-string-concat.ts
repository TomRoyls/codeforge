import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { isBinaryExpression, isLiteral, isTemplateLiteral, toASTNode } from '../../utils/ast-helpers.js'

function isStringLiteral(node: unknown): boolean {
  if (!isLiteral(node)) return false
  return typeof toASTNode(node)?.value === 'string'
}

function isConcatWithStrings(node: unknown): boolean {
  if (!isBinaryExpression(node)) return false
  const n = toASTNode(node)
  if (n?.operator !== '+') return false

  return isStringLiteral(n.left) || isStringLiteral(n.right) || isTemplateLiteral(n.left) || isTemplateLiteral(n.right)
}

export const noStringConcatRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      BinaryExpression(node: unknown): void {
        if (!isConcatWithStrings(node)) return

        const location = extractLocation(node)
        context.report({
          loc: location,
          message: 'Unexpected string concatenation. Use template literals or array.join() instead.',
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow string concatenation with the + operator. Use template literals or array join() for better readability, especially with multiple strings.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-string-concat',
    },
    fixable: undefined,
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noStringConcatRule
