import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { isBinaryExpression, isIdentifier, toASTNode } from '../../utils/ast-helpers.js'

function isNaNIdentifier(node: unknown): boolean {
  return isIdentifier(node, 'NaN')
}

export const useIsnanRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      BinaryExpression(node: unknown): void {
        if (!isBinaryExpression(node)) return
        const n = toASTNode(node)
        if (!n) return

        const {operator} = n

        if (['!=', '!==', '==', '==='].includes(operator as string) && (isNaNIdentifier(n.left) || isNaNIdentifier(n.right))) {
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
