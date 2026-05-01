/**
 * @module rules/patterns/no-warning-comments
 * Disallows specified terms in comments.
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { toASTNode } from '../../utils/ast-helpers.js'

const WARNING_TERMS = ['FIXME', 'HACK', 'XXX', 'TODO'] as const

export const noWarningCommentsRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      Program(node: unknown): void {
        const n = toASTNode(node)
        if (!n) return

        const source = context.getSource()
        const lines = source.split('\n')

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i]!.toUpperCase()
          const commentIdx = line.indexOf('//')
          if (commentIdx === -1) continue

          const commentText = line.substring(commentIdx)
          for (const term of WARNING_TERMS) {
            if (commentText.includes(term)) {
              context.report({
                loc: {
                  end: { column: lines[i]!.length, line: i + 1 },
                  start: { column: 0, line: i + 1 },
                },
                message: `Unexpected '${term}' comment.`,
                node: n,
              })
              break
            }
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow specified terms in comments',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-warning-comments',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noWarningCommentsRule
