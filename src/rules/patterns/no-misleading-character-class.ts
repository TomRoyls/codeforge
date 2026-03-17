import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

function isLiteral(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'Literal'
}

function hasMisleadingChars(pattern: unknown): boolean {
  if (typeof pattern !== 'string') return false
  const misleadingRanges: [number, number][] = [
    [0x1F1E6, 0x1F1FF],
    [0x200D, 0x200D],
    [0xFE0F, 0xFE0F],
  ]
  
  for (let i = 0; i < pattern.length; i++) {
    const code = pattern.codePointAt(i)
    if (code === undefined) continue
    for (const range of misleadingRanges) {
      const start = range[0]
      const end = range[1]
      if (code >= start && code <= end) return true
    }
    if (code > 0xFFFF) i++
  }
  return false
}

export const noMisleadingCharacterClassRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description: 'Disallow characters made with multiple code points in character class syntax.',
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
        if (regex && regex.pattern && hasMisleadingChars(regex.pattern)) {
          context.report({
            message: 'Character class may contain multiple code points.',
            loc: extractLocation(node),
          })
        }
      },
    }
  },
}
export default noMisleadingCharacterClassRule
