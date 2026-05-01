import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

const BOM = '\uFEFF'

export const noUnicodeBomRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      Literal(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'Literal') return

        const value = (n as { value?: unknown }).value
        if (typeof value !== 'string') return

        if (value.startsWith(BOM)) {
          context.report({
            loc: extractLocation(n),
            message: 'Unexpected Unicode BOM (U+FEFF) in string literal. BOM characters are usually unintentional and can cause subtle comparison bugs.',
            node: n,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow Unicode BOM (U+FEFF) characters in string literals',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unicode-bom',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnicodeBomRule
