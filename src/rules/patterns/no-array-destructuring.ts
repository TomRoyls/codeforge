import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { getIdentifierName, toASTNode } from '../../utils/ast-helpers.js'
import { RULE_SUGGESTIONS } from '../../utils/suggestions.js'

export const noArrayDestructuringRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      ArrayExpression(node: unknown): void {
        const n = toASTNode(node)
        if (n?.type !== 'ArrayExpression') return

        const {elements} = n
        if (!elements || elements.length === 0) return

        for (const element of elements) {
          const el = toASTNode(element)
          if (el?.type !== 'SpreadElement') continue

          const {argument} = el
          if (!argument) continue

          const location = extractLocation(element)
          const argName = getIdentifierName(argument) ?? 'array'

          context.report({
            loc: location,
            message:
              `Avoid spreading '${argName}' in array literal. For large arrays, use ${argName}.concat() or ${argName}.slice() instead of [...${argName}] for better performance.` +
              RULE_SUGGESTIONS.noArrayDestructuring,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'performance',
      description:
        'Avoid spread operator on arrays in array literals for better performance with large arrays. Use arr.concat() or arr.slice() instead of [...arr] for copying arrays.',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-array-destructuring',
    },
    fixable: undefined,
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noArrayDestructuringRule
