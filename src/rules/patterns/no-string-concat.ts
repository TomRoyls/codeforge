import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation, isBinaryExpression, isLiteral } from '../../utils/ast-helpers.js'

function isPlusOperator(node: unknown): boolean {
  if (!isBinaryExpression(node)) {
    return false
  }
  const n = node as Record<string, unknown>
  return n.operator === '+'
}

function isStringLiteral(node: unknown): boolean {
  if (!isLiteral(node)) {
    return false
  }
  const n = node as Record<string, unknown>
  return typeof n.value === 'string'
}

function isTemplateLiteral(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }
  const n = node as Record<string, unknown>
  return n.type === 'TemplateLiteral'
}

function isConcatWithStrings(node: unknown): boolean {
  if (!isPlusOperator(node)) {
    return false
  }

  const n = node as Record<string, unknown>
  const left = n.left as unknown
  const right = n.right as unknown

  return (
    isStringLiteral(left) ||
    isStringLiteral(right) ||
    isTemplateLiteral(left) ||
    isTemplateLiteral(right)
  )
}

export const noStringConcatRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Disallow string concatenation with the + operator. Use template literals or array join() for better readability, especially with multiple strings.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-string-concat',
    },
    schema: [],
    fixable: undefined,
  },

  create(context: RuleContext): RuleVisitor {
    return {
      BinaryExpression(node: unknown): void {
        if (!isConcatWithStrings(node)) {
          return
        }

        const location = extractLocation(node)

        context.report({
          message:
            'Unexpected string concatenation. Use template literals or array.join() instead.',
          loc: location,
        })
      },
    }
  },
}

export default noStringConcatRule
