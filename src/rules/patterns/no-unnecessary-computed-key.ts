import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryComputedKeyRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      Property(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'Property') return

        const nn = n as Record<string, unknown>
        if (nn.computed !== true) return

        const key = nn.key
        if (!key || typeof key !== 'object') return

        const k = key as Record<string, unknown>
        if (k.type === 'Literal' && typeof k.value === 'string') {
          const val = k.value as string
          if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(val)) {
            context.report({
              loc: extractLocation(n),
              message: `Unnecessary computed key ['${val}']. Use '${val}' directly.`,
              node: n,
            })
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow unnecessary computed property keys',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-computed-key',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryComputedKeyRule
