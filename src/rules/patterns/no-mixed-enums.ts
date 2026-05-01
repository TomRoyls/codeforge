import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noMixedEnumsRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      TsEnumDeclaration(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'TsEnumDeclaration') return

        const members = (n as { members?: unknown[] }).members
        if (!members || !Array.isArray(members) || members.length < 2) return

        const hasImplicit = members.some((m) => {
          if (!m || typeof m !== 'object') return false
          const member = m as Record<string, unknown>
          const initializer = member.initializer
          return initializer === null || initializer === undefined
        })

        const hasExplicit = members.some((m) => {
          if (!m || typeof m !== 'object') return false
          const member = m as Record<string, unknown>
          const initializer = member.initializer
          return initializer !== null && initializer !== undefined
        })

        if (hasImplicit && hasExplicit) {
          context.report({
            loc: extractLocation(n),
            message: 'Enum has mixed implicit and explicit member values. Use either all explicit or all implicit values for consistency.',
            node: n,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow enums with mixed implicit and explicit values',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-mixed-enums',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noMixedEnumsRule
