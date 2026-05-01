/**
 * @module rules/patterns/no-inline-comments
 * Disallows inline comments.
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { toASTNode } from '../../utils/ast-helpers.js'

export const noInlineCommentsRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      Program(node: unknown): void {
        const n = toASTNode(node)
        if (!n) return

        const source = context.getSource()
        const lines = source.split('\n')

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i]!
          const commentIndex = line.indexOf('//')
          if (commentIndex === -1) continue

          const beforeComment = line.substring(0, commentIndex).trim()
          if (beforeComment.length > 0) {
            context.report({
              loc: {
                end: { column: commentIndex + 2, line: i + 1 },
                start: { column: commentIndex, line: i + 1 },
              },
              message: 'Unexpected inline comment.',
              node: n,
            })
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow inline comments',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-inline-comments',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noInlineCommentsRule
