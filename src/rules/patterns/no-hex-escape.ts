import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noHexEscapeRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      Literal(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'Literal') return

        const raw = (n as { raw?: unknown }).raw
        if (typeof raw !== 'string') return

        const value = (n as { value?: unknown }).value
        if (typeof value !== 'string') return

        const hexEscapePattern = /\\x[0-9a-fA-F]{2}/g
        const matches = raw.match(hexEscapePattern)
        if (!matches) return

        for (const match of matches) {
          const codePoint = parseInt(match.slice(2), 16)
          if (codePoint >= 0x20 && codePoint <= 0x7e) {
            const printableChar = String.fromCharCode(codePoint)
            if (printableChar === '"' || printableChar === '\\' || printableChar === "'") continue
            context.report({
              loc: extractLocation(node),
              message: `Unnecessary hex escape "\\x${codePoint.toString(16).padStart(2, '0')}". Use the printable character "${printableChar}" instead for better readability.`,
              node,
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
      description:
        'Disallow unnecessary hex escape sequences for printable ASCII characters',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-hex-escape',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noHexEscapeRule
