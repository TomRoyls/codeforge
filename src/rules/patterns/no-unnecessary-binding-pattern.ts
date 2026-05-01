import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryBindingPatternRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      ObjectPattern(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'ObjectPattern') return

        const nn = n as Record<string, unknown>
        const properties = nn.properties
        if (!Array.isArray(properties) || properties.length !== 1) return

        const first = properties[0]
        if (!first || typeof first !== 'object') return

        const f = first as Record<string, unknown>
        if (f.type !== 'ObjectProperty') return

        const value = f.value
        if (!value || typeof value !== 'object') return

        const v = value as Record<string, unknown>
        if (v.type === 'AssignmentPattern') {
          const left = v.left
          const right = v.right
          if (
            left && typeof left === 'object' &&
            right && typeof right === 'object'
          ) {
            const l = left as Record<string, unknown>
            const r = right as Record<string, unknown>
            if (
              l.type === 'Identifier' && r.type === 'Identifier' &&
              l.name === r.name
            ) {
              context.report({
                loc: extractLocation(n),
                message: `Unnecessary default value for '${l.name}'. The binding already has the same name.`,
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
      description: 'Disallow unnecessary default values in object binding patterns',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-binding-pattern',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryBindingPatternRule
