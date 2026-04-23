import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'

function isLiteral(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'Literal'
}

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
      Literal(node: unknown): void {
        if (!isLiteral(node)) return
        const n = node as Record<string, unknown>
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
