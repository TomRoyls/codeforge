import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'

function isLiteral(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'Literal'
}

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
      Literal(node: unknown): void {
        if (!isLiteral(node)) return
        const n = node as Record<string, unknown>
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
