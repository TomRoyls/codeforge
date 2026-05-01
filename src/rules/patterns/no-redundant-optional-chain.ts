import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noRedundantOptionalChainRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      MemberExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'MemberExpression') return

        const optional = (n as { optional?: boolean }).optional
        if (!optional) return

        const object = (n as { object?: unknown }).object
        if (!object || typeof object !== 'object') return

        const objNode = object as Record<string, unknown>
        if (objNode.type !== 'MemberExpression') return

        const innerOptional = objNode.optional
        if (innerOptional) return

        context.report({
          loc: extractLocation(n),
          message: 'Optional chaining is redundant here because the base is already non-optional. Remove the unnecessary \'?.\'.',
          node: n,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Detect redundant optional chaining on non-optional base',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-redundant-optional-chain',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noRedundantOptionalChainRule
