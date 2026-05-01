import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryElseRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      IfStatement(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'IfStatement') return

        const nn = n as Record<string, unknown>
        const consequent = nn.consequent
        if (!consequent || typeof consequent !== 'object') return

        const cons = consequent as Record<string, unknown>
        if (cons.type !== 'BlockStatement') return

        const body = cons.body
        if (!Array.isArray(body) || body.length === 0) return

        const last = body[body.length - 1]
        if (!last || typeof last !== 'object') return

        const lastStmt = last as Record<string, unknown>
        if (
          lastStmt.type === 'ReturnStatement' ||
          lastStmt.type === 'ThrowStatement' ||
          lastStmt.type === 'BreakStatement' ||
          lastStmt.type === 'ContinueStatement'
        ) {
          const alternate = nn.alternate
          if (alternate && typeof alternate === 'object') {
            const alt = alternate as Record<string, unknown>
            if (alt.type === 'BlockStatement') {
              context.report({
                loc: extractLocation(n),
                message: 'Unnecessary else block after conditional return/throw.',
                node: n,
              })
            }
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow unnecessary else blocks after return/throw in if',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-else',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryElseRule
