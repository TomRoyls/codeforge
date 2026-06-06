import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

const UNESCAPEABLE = new Set([
  '\\', "'", '"', 'n', 'r', 't', 'b', 'f', 'v', '0',
  'x', 'u', '$', '\n', '\r', '/', '\t',
])

export const noUnnecessaryEscapeRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      Literal(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'Literal') return

        const value = (n as { value?: string }).value
        if (!value || typeof value !== 'string') return

        const raw = (n as { raw?: string }).raw
        if (!raw || typeof raw !== 'string') return

        const escaped = raw.matchAll(/\\(.)/g)
        for (const match of escaped) {
          const char = match[1]
          if (char && !UNESCAPEABLE.has(char)) {
            context.report({
              loc: extractLocation(n),
              message: `Unnecessary escape character: \\${char}. This character does not need to be escaped.`,
              node: n,
            })
            return
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow unnecessary escape characters in strings',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-escape',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryEscapeRule
