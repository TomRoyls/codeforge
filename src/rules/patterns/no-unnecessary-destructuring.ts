import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryDestructuringRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      VariableDeclarator(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'VariableDeclarator') return

        const nn = n as Record<string, unknown>
        const id = nn.id
        if (!id || typeof id !== 'object') return

        const i = id as Record<string, unknown>
        if (i.type !== 'ObjectPattern') return

        const properties = i.properties
        if (!Array.isArray(properties) || properties.length !== 1) return

        const prop = properties[0]
        if (!prop || typeof prop !== 'object') return

        const p = prop as Record<string, unknown>
        if (p.type !== 'ObjectProperty') return

        const key = p.key
        const value = p.value
        if (!key || !value || typeof key !== 'object' || typeof value !== 'object') return

        const k = key as Record<string, unknown>
        const v = value as Record<string, unknown>

        if (
          k.type === 'Identifier' && v.type === 'Identifier' &&
          k.name === v.name
        ) {
          context.report({
            loc: extractLocation(n),
            message: `Unnecessary destructuring for property '${k.name}'.`,
            node: n,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow unnecessary destructuring of single matching property',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-destructuring',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryDestructuringRule
