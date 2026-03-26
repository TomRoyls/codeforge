import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

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

  return backrefs.some(({ num }) => !groups.has(num) && isNaN(parseInt(num, 10)))
}

export const noUselessBackreferenceRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description: 'Disallow useless backreferences in regular expressions.',
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
        if (regex && regex.pattern && hasUselessBackreference(regex.pattern)) {
          context.report({
            message: 'Useless backreference in regular expression.',
            loc: extractLocation(node),
          })
        }
      },
    }
  },
}
export default noUselessBackreferenceRule
