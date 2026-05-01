import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryAsyncFunctionRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      FunctionDeclaration(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'FunctionDeclaration') return

        const nn = n as Record<string, unknown>
        if (nn.async !== true) return

        const body = nn.body
        if (!body || typeof body !== 'object') return

        const b = body as Record<string, unknown>
        if (b.type !== 'BlockStatement') return

        const stmts = b.body
        if (!Array.isArray(stmts)) return

        for (const stmt of stmts) {
          if (!stmt || typeof stmt !== 'object') continue
          const s = stmt as Record<string, unknown>
          if (s.type === 'ReturnStatement') {
            const arg = s.argument
            if (arg && typeof arg === 'object') {
              const a = arg as Record<string, unknown>
              if (a.type === 'AwaitExpression') return
            }
          }
          if (s.type === 'ExpressionStatement') {
            const expr = s.expression
            if (expr && typeof expr === 'object') {
              const e = expr as Record<string, unknown>
              if (e.type === 'AwaitExpression') return
            }
          }
          if (s.type === 'VariableDeclaration') {
            const decls = s.declarations
            if (Array.isArray(decls)) {
              for (const decl of decls) {
                if (!decl || typeof decl !== 'object') continue
                const d = decl as Record<string, unknown>
                const init = d.init
                if (init && typeof init === 'object') {
                  const i = init as Record<string, unknown>
                  if (i.type === 'AwaitExpression') return
                }
              }
            }
          }
        }

        context.report({
          loc: extractLocation(n),
          message: 'Unnecessary async function with no await expressions.',
          node: n,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow async functions that contain no await expressions',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-async-function',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryAsyncFunctionRule
