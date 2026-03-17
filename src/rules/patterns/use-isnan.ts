import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

function isBinaryExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'BinaryExpression'
}

function isIdentifier(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'Identifier'
}

function isNaNIdentifier(node: unknown): boolean {
  if (!isIdentifier(node)) return false
  return (node as Record<string, unknown>).name === 'NaN'
}

export const useIsnanRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description: 'Require calls to isNaN() when checking for NaN.',
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
        const operator = n.operator as string
        
        if (['===', '!==', '==', '!='].includes(operator)) {
          if (isNaNIdentifier(n.left) || isNaNIdentifier(n.right)) {
            context.report({
              message: "Use the isNaN function to compare with NaN.",
              loc: extractLocation(node),
            })
          }
        }
      },
    }
  },
}
export default useIsnanRule
