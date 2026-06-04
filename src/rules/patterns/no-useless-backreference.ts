import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function hasUselessBackreference(pattern: unknown): boolean {
  if (typeof pattern !== 'string') return false
  const groups = new Set<string>()
  const backrefs: { num: string }[] = []

  const groupRegex = /\(\?<([a-zA-Z][a-zA-Z0-9]*)>/g
  let match
  while ((match = groupRegex.exec(pattern)) !== null) {
    if (match[1]) groups.add(match[1])
  }

  const backrefRegex = /\\([1-9][0-9]*|[k]<([^>]+)>)/g
  while ((match = backrefRegex.exec(pattern)) !== null) {
    const ref = match[2] || match[1]
    if (ref) {
      backrefs.push({ num: ref })
    }
  }

  return backrefs.some(({ num }) => !groups.has(num) && Number.isNaN(Number.parseInt(num, 10)))
}

export const noUselessBackreferenceRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      // ESTree convention: regex as Literal with nested regex:{pattern,flags}
      Literal(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'Literal') return
        const regex = n.regex as undefined | { pattern?: string }
        if (regex && regex.pattern && hasUselessBackreference(regex.pattern)) {
          context.report({
            loc: extractLocation(node),
            message: 'Useless backreference in regular expression.',
          })
        }
      },

      // Babel convention: RegExpLiteral with nested regex:{pattern,flags}
      RegExpLiteral(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'RegExpLiteral') return
        const regex = n.regex as undefined | { pattern?: string }
        if (regex && regex.pattern && hasUselessBackreference(regex.pattern)) {
          context.report({
            loc: extractLocation(node),
            message: 'Useless backreference in regular expression.',
          })
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow useless backreferences in regular expressions.',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noUselessBackreferenceRule
