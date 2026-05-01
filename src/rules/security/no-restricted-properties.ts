import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

const RESTRICTED_PROPERTIES = new Set([
  '__proto__',
  '__defineGetter__',
  '__defineSetter__',
  '__lookupGetter__',
  '__lookupSetter__',
])

export const noRestrictedPropertiesRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      MemberExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'MemberExpression') return

        const prop = toASTNode((n as { property?: unknown }).property)
        if (!prop) return

        const computed = (n as { computed?: boolean }).computed
        if (computed) return

        const name = (prop as { name?: string }).name
        if (!name || !RESTRICTED_PROPERTIES.has(name)) return

        context.report({
          loc: extractLocation(n),
          message: `Unexpected access to restricted property \`${name}\`. This property is deprecated and may cause unexpected behavior.`,
          node: n,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'security',
      description: 'Disallow access to restricted object properties like __proto__',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-restricted-properties',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noRestrictedPropertiesRule
