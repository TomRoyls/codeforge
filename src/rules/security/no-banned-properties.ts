import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

const BANNED_PROPERTIES = new Set([
  '__proto__',
  '__defineGetter__',
  '__defineSetter__',
  '__lookupGetter__',
  '__lookupSetter__',
])

export const noBannedPropertiesRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      MemberExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'MemberExpression') return

        const property = toASTNode((n as { property?: unknown }).property)
        if (!property || property.type !== 'Identifier') return

        const name = (property as { name?: string }).name
        if (!name || !BANNED_PROPERTIES.has(name)) return

        context.report({
          loc: extractLocation(n),
          message: `Access to banned property \`${name}\`. Use \`Object.getPrototypeOf()\` or \`Object.setPrototypeOf()\` instead of \`__proto__\`.`,
          node: n,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'security',
      description: 'Disallow access to banned object properties like __proto__',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-banned-properties',
    },
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}

export default noBannedPropertiesRule
