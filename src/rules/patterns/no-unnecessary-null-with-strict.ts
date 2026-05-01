import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryNullWithStrictRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      TSUnionType(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'TSUnionType') return

        const nn = n as Record<string, unknown>
        const types = nn.types
        if (!Array.isArray(types) || types.length < 2) return

        const hasNull = types.some(
          (t: unknown) => t && typeof t === 'object' && (t as Record<string, unknown>).type === 'TSNullKeyword',
        )
        const hasUndefined = types.some(
          (t: unknown) => t && typeof t === 'object' && (t as Record<string, unknown>).type === 'TSUndefinedKeyword',
        )

        if (hasNull && hasUndefined) {
          context.report({
            loc: extractLocation(n),
            message: 'Use "undefined" instead of "null | undefined" in strict mode.',
            node: n,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Prefer undefined over null | undefined in strict TypeScript',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-null-with-strict',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryNullWithStrictRule
