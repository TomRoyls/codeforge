import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

function isBinaryExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'BinaryExpression'
}

function isTemplateLiteral(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'TemplateLiteral'
}

export const noUnexpectedMultilineRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description: 'Disallow confusing multiline expressions.',
      category: 'patterns',
      recommended: true,
    },
    schema: [],
    fixable: undefined,
  },
  create(context: RuleContext): RuleVisitor {
    return {
      BinaryExpression(node: unknown): void {
        if (!isBinaryExpression(node)) return
        const n = node as Record<string, unknown>
        if (n.operator === '+' || n.operator === '-') {
          if (isTemplateLiteral(n.left) || isTemplateLiteral(n.right)) {
            context.report({
              message: 'Unexpected multiline expression.',
              loc: extractLocation(node),
            })
          }
        }
      },
    }
  },
}
export default noUnexpectedMultilineRule
