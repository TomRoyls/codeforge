import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

const SUSPICIOUS_PATTERNS = /\b(TODO|FIXME|HACK|XXX|BUG|WORKAROUND)\b/i

export const noSuspiciousCommentRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      Comment(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'Comment') return

        const value = (n as { value?: string }).value
        if (!value || typeof value !== 'string') return

        const match = value.match(SUSPICIOUS_PATTERNS)
        if (!match) return

        context.report({
          loc: extractLocation(n),
          message: `Suspicious comment found: "${match[1]}". Consider resolving or tracking this item.`,
          node: n,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Flag suspicious comments like TODO, FIXME, HACK, XXX',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-suspicious-comment',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noSuspiciousCommentRule
