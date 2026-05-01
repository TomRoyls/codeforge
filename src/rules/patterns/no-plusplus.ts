/**
 * @module rules/patterns/no-plusplus
 * Disallows unary operators ++ and --.
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noPlusplusRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      UpdateExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'UpdateExpression') return

        const operator = (n as { operator?: unknown }).operator
        if (operator !== '++' && operator !== '--') return

        const prefix = (n as { prefix?: unknown }).prefix
        context.report({
          loc: extractLocation(n),
          message: `Unexpected ${prefix ? 'prefix' : 'postfix'} '${operator}' operator. Use '${operator === '++' ? '+= 1' : '-= 1'}' instead.`,
          node: n,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow unary operators ++ and --',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-plusplus',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noPlusplusRule
