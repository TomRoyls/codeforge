import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noComputedKeysRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      Property(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'Property') return

        const computed = (n as { computed?: boolean }).computed
        if (!computed) return

        const key = toASTNode((n as { key?: unknown }).key)
        if (!key || key.type !== 'Literal') return

        const value = (key as { value?: unknown }).value
        if (typeof value !== 'string') return

        if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(value)) {
          context.report({
            loc: extractLocation(n),
            message: `Unnecessary computed property key \`${String(value)}\`. Use a static property key instead: \`${String(value)}: ...\`.`,
            node: n,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow unnecessary computed property keys in object literals',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-computed-keys',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noComputedKeysRule
