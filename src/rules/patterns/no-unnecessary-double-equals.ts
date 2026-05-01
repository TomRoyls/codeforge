import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryDoubleEqualsRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      BinaryExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'BinaryExpression') return

        const nn = n as Record<string, unknown>
        const operator = nn.operator

        if (operator === '==' || operator === '!=') {
          context.report({
            loc: extractLocation(n),
            message: `Unnecessary ${operator === '==' ? '==' : '!='} operator. Use ${operator === '==' ? '===' : '!=='} for strict equality comparison.`,
            node: n,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow loose equality comparisons (== and !=) in favor of strict equality (=== and !==).',
      recommended: true,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-double-equals.md',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryDoubleEqualsRule
