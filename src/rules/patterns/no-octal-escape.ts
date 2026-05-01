import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noOctalEscapeRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      Literal(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'Literal') return

        const value = (n as { value?: unknown }).value
        if (typeof value !== 'string') return

        const raw = (n as { raw?: string }).raw
        if (typeof raw !== 'string') return

        const octalPattern = /\\[0-7]{1,3}/
        if (!octalPattern.test(raw)) return

        const match = raw.match(octalPattern)
        const sequence = match ? match[0] : 'unknown'

        context.report({
          loc: extractLocation(n),
          message: `Octal escape sequence \`${sequence}\` found in string literal. Use hexadecimal or unicode escape sequences instead.`,
          node: n,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow octal escape sequences in string literals',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-octal-escape',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noOctalEscapeRule
