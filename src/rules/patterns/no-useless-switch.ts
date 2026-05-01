import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUselessSwitchRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      SwitchStatement(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'SwitchStatement') return

        const cases = (n as { cases?: unknown[] }).cases
        if (!Array.isArray(cases)) return

        const nonDefaultCases = cases.filter((c) => {
          const caseNode = toASTNode(c)
          if (!caseNode) return false
          return caseNode.type !== 'SwitchCase' || (caseNode as { test?: unknown }).test !== null
        })

        if (nonDefaultCases.length === 0 && cases.length > 0) {
          context.report({
            loc: extractLocation(n),
            message: 'Switch statement has only a default case. Use an if statement or remove the switch entirely.',
            node: n,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow switch statements that only have a default clause',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-useless-switch',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUselessSwitchRule
