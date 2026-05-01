import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noFloatingDecimalRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      Literal(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'Literal') return

        const value = (n as { value?: unknown }).value
        if (typeof value !== 'number') return

        const raw = (n as { raw?: string }).raw
        if (typeof raw !== 'string') return

        if (raw.startsWith('.')) {
          context.report({
            loc: extractLocation(n),
            message: `Unexpected floating decimal \`${raw}\`. Use \`0${raw}\` for clarity.`,
            node: n,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow floating decimals like `.5` instead of `0.5`',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-floating-decimal',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noFloatingDecimalRule
