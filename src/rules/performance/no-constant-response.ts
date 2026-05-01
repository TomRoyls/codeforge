import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noConstantResponseRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      FunctionDeclaration(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'FunctionDeclaration') return

        const body = (n as { body?: unknown }).body
        if (!body || typeof body !== 'object') return

        const bodyNode = body as { type?: string; body?: unknown[] }
        if (bodyNode.type !== 'BlockStatement') return

        const statements = bodyNode.body
        if (!Array.isArray(statements) || statements.length !== 1) return

        const stmt = statements[0] as { type?: string; argument?: unknown }
        if (stmt.type !== 'ReturnStatement') return

        const arg = toASTNode(stmt.argument)
        if (!arg) return

        if (arg.type === 'Literal') {
          context.report({
            loc: extractLocation(n),
            message: 'Function always returns the same constant value. Consider using a simple variable assignment instead of a function wrapper.',
            node: n,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'performance',
      description: 'Detect functions that always return the same constant value',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-constant-response',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noConstantResponseRule
