import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

function isLiteral(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'Literal'
}

function hasControlChars(value: unknown): boolean {
  if (typeof value !== 'string') return false
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i)
    if (code < 0x20 && code !== 0x09 && code !== 0x0a && code !== 0x0d) {
      return true
    }
  }
  return false
}

export const noControlRegexRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description: 'Disallow control characters in regular expressions.',
      category: 'patterns',
      recommended: true,
    },
    schema: [],
    fixable: undefined,
  },
  create(context: RuleContext): RuleVisitor {
    return {
      Literal(node: unknown): void {
        if (!isLiteral(node)) return
        const n = node as Record<string, unknown>
        const regex = n.regex as { pattern?: string } | undefined
        if (regex && regex.pattern && hasControlChars(regex.pattern)) {
          context.report({
            message: 'Unexpected control character in regular expression.',
            loc: extractLocation(node),
          })
        }
      },
    }
  },
}
export default noControlRegexRule
