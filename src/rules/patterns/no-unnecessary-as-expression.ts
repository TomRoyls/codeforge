import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryAsExpressionRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      TSAsExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'TSAsExpression') return

        const nn = n as Record<string, unknown>
        const expression = nn.expression
        if (!expression || typeof expression !== 'object') return

        const typeAnnotation = nn.typeAnnotation
        if (!typeAnnotation || typeof typeAnnotation !== 'object') return

        const ta = typeAnnotation as Record<string, unknown>
        const expr = expression as Record<string, unknown>

        if (
          expr.type === 'Literal' &&
          typeof expr.value === 'number' &&
          ta.type === 'TSLiteralType'
        ) {
          const literal = ta.literal
          if (
            literal &&
            typeof literal === 'object' &&
            (literal as Record<string, unknown>).type === 'Literal' &&
            typeof (literal as Record<string, unknown>).value === 'number'
          ) {
            if (expr.value === (literal as Record<string, unknown>).value) {
              context.report({
                loc: extractLocation(n),
                message: 'Unnecessary type assertion: value is already the target type.',
                node: n,
              })
            }
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow unnecessary type assertions where value already matches target type',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-as-expression',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryAsExpressionRule
