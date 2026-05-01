import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryBooleanRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      BinaryExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'BinaryExpression') return

        const operator = (n as { operator?: string }).operator
        if (operator !== '===' && operator !== '!==' && operator !== '==' && operator !== '!=') return

        const left = toASTNode((n as { left?: unknown }).left)
        const right = toASTNode((n as { right?: unknown }).right)
        if (!left || !right) return

        const isBooleanLiteral = (node: unknown): boolean => {
          const astNode = toASTNode(node)
          if (!astNode || astNode.type !== 'Literal') return false
          return typeof (astNode as { value?: unknown }).value === 'boolean'
        }

        if (isBooleanLiteral(right)) {
          context.report({
            loc: extractLocation(n),
            message: `Unnecessary comparison to boolean literal. Remove the \`${operator} ${String((right as { value?: unknown }).value)}\` comparison.`,
            node: n,
          })
        } else if (isBooleanLiteral(left)) {
          context.report({
            loc: extractLocation(n),
            message: `Unnecessary comparison to boolean literal. Remove the \`${String((left as { value?: unknown }).value)} ${operator}\` comparison.`,
            node: n,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow unnecessary comparisons to boolean literals',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-boolean',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryBooleanRule
