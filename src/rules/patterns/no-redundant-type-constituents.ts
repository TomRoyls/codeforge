import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noRedundantTypeConstituentsRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      TSUnionType(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'TSUnionType') return

        const nn = n as Record<string, unknown>
        const types = nn.types
        if (!Array.isArray(types) || types.length < 2) return

        const typeStrings = new Set<string>()
        for (const t of types) {
          if (!t || typeof t !== 'object') continue
          const tt = t as Record<string, unknown>
          if (tt.type === 'TSLiteralType' && tt.literal && typeof tt.literal === 'object') {
            const lit = tt.literal as Record<string, unknown>
            const key = `${tt.type}:${lit.type}:${lit.value}`
            if (typeStrings.has(key)) {
              context.report({
                loc: extractLocation(n),
                message: 'Redundant type constituent in union.',
                node: n,
              })
              return
            }
            typeStrings.add(key)
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow redundant type constituents in unions',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-redundant-type-constituents',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noRedundantTypeConstituentsRule
