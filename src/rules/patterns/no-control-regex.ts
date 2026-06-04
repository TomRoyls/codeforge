import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function hasControlChars(value: unknown): boolean {
  if (typeof value !== 'string') return false
  for (let i = 0; i < value.length; i++) {
    const code = value.codePointAt(i) ?? 0
    if (code < 0x20 && code !== 0x09 && code !== 0x0a && code !== 0x0d) {
      return true
    }
  }

  return false
}

export const noControlRegexRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      // ESTree convention: regex as Literal with nested regex:{pattern,flags}
      Literal(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'Literal') return
        const regex = n.regex as undefined | { pattern?: string }
        if (regex && regex.pattern && hasControlChars(regex.pattern)) {
          context.report({
            loc: extractLocation(node),
            message: 'Unexpected control character in regular expression.',
          })
        }
      },

      // Babel convention: RegExpLiteral with nested regex:{pattern,flags}
      RegExpLiteral(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'RegExpLiteral') return
        const regex = n.regex as undefined | { pattern?: string }
        if (regex && regex.pattern && hasControlChars(regex.pattern)) {
          context.report({
            loc: extractLocation(node),
            message: 'Unexpected control character in regular expression.',
          })
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow control characters in regular expressions.',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noControlRegexRule
