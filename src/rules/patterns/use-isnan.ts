import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'

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
  create(context: RuleContext): RuleVisitor {
    return {
      BinaryExpression(node: unknown): void {
        if (!isBinaryExpression(node)) return
        const n = node as Record<string, unknown>
        const operator = n.operator as string

        if (['!=', '!==', '==', '==='].includes(operator) && (isNaNIdentifier(n.left) || isNaNIdentifier(n.right))) {
            context.report({
              loc: extractLocation(node),
              message: 'Use the isNaN function to compare with NaN.',
            })
          }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Require calls to isNaN() when checking for NaN.',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default useIsnanRule
