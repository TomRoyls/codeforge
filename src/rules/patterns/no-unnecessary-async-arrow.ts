import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryAsyncArrowRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      ArrowFunctionExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'ArrowFunctionExpression') return

        const nn = n as Record<string, unknown>
        if (!nn.async) return

        const body = nn.body
        if (!body || typeof body !== 'object') return

        const bodyNode = toASTNode(body)
        if (!bodyNode) return

        const b = bodyNode as Record<string, unknown>

        if (b.type === 'BlockStatement') {
          const stmts = b.body
          if (!Array.isArray(stmts) || stmts.length !== 1) return

          const stmt = stmts[0]
          if (!stmt || typeof stmt !== 'object') return

          const stmtNode = toASTNode(stmt)
          if (!stmtNode || stmtNode.type !== 'ReturnStatement') return

          const r = stmtNode as Record<string, unknown>
          const argument = r.argument
          if (!argument || typeof argument !== 'object') return

          const argNode = toASTNode(argument)
          if (!argNode) return

          const a = argNode as Record<string, unknown>
          if (a.type === 'Literal') {
            context.report({
              loc: extractLocation(n),
              message:
                'Unnecessary async on arrow function returning a literal value. Remove async keyword.',
              node: n,
            })
          }
        } else {
          if (b.type === 'Literal') {
            context.report({
              loc: extractLocation(n),
              message:
                'Unnecessary async on arrow function returning a literal value. Remove async keyword.',
              node: n,
            })
          } else if (b.type === 'Identifier') {
            context.report({
              loc: extractLocation(n),
              message:
                'Unnecessary async on arrow function with simple expression body. Remove async if the return value is not a Promise.',
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
      description:
        'Disallow unnecessary async keyword on arrow functions that return non-Promise values.',
      recommended: false,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-async-arrow.md',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryAsyncArrowRule
