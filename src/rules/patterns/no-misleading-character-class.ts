import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'

function isLiteral(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'Literal'
}

function hasMisleadingChars(pattern: unknown): boolean {
  if (typeof pattern !== 'string') return false
  const misleadingRanges: [number, number][] = [
    [0x1_f1_e6, 0x1_f1_ff],
    [0x20_0d, 0x20_0d],
    [0xfe_0f, 0xfe_0f],
  ]

  for (let i = 0; i < pattern.length; i++) {
    const code = pattern.codePointAt(i)
    if (code === undefined) continue
    for (const range of misleadingRanges) {
      const start = range[0]
      const end = range[1]
      if (code >= start && code <= end) return true
    }

    if (code > 0xff_ff) i++
  }

  return false
}

export const noMisleadingCharacterClassRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      Literal(node: unknown): void {
        if (!isLiteral(node)) return
        const n = node as Record<string, unknown>
        const regex = n.regex as undefined | { pattern?: string }
        if (regex && regex.pattern && hasMisleadingChars(regex.pattern)) {
          context.report({
            loc: extractLocation(node),
            message: 'Character class may contain multiple code points.',
          })
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow characters made with multiple code points in character class syntax.',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noMisleadingCharacterClassRule
