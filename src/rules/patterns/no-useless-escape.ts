import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'
import { REGEX_SPECIAL_CHARS } from '../../utils/constants.js'

const STRING_ESCAPABLE = new Set([
  '\n',
  '\r',
  '0',
  '"',
  '$',
  "'",
  '\\',
  '`',
  'b',
  'f',
  'n',
  'r',
  't',
  'v',
])

function hasUselessEscape(raw: unknown, isRegex: boolean): boolean {
  if (typeof raw !== 'string') return false
  const escapeRegex = /\\(.)/g
  let match
  while ((match = escapeRegex.exec(raw)) !== null) {
    const char = match[1]
    if (!char) continue
    if (isRegex) {
      if (!REGEX_SPECIAL_CHARS.has(char) && !/[0-9a-zA-Z]/.test(char)) {
        continue
      }

      if (/[a-zA-Z0-9]/.test(char) && !['b', 'B', 'd', 'D', 's', 'S', 'w', 'W'].includes(char)) {
        return true
      }
    } else if (!STRING_ESCAPABLE.has(char)) {
        return true
      }
  }

  return false
}

export const noUselessEscapeRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      Literal(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'Literal') return
        if (typeof n.raw === 'string') {
          const isRegex = Boolean(n.regex)
          if (hasUselessEscape(n.raw, isRegex)) {
            context.report({
              loc: extractLocation(node),
              message: 'Unnecessary escape character.',
            })
          }
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow unnecessary escape characters.',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noUselessEscapeRule
