import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryNumericLiteralRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      TSPropertySignature(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'TSPropertySignature') return

        const nn = n as Record<string, unknown>
        const key = nn.key
        if (!key || typeof key !== 'object') return

        const k = key as Record<string, unknown>
        if (k.type !== 'Literal' || typeof k.value !== 'number') return

        const name = k.value as number
        context.report({
          loc: extractLocation(n),
          message: `Prefer a numeric property name computed syntax [${name}] over literal key.`,
          node: n,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Prefer computed property syntax for numeric literal keys in types',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-numeric-literal',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryNumericLiteralRule
