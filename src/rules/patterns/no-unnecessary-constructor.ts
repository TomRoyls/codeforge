import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryConstructorRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      MethodDefinition(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'MethodDefinition') return

        const kind = (n as { kind?: string }).kind
        if (kind !== 'constructor') return

        const value = (n as { value?: unknown }).value
        if (!value) return

        const valueNode = toASTNode(value)
        if (!valueNode || valueNode.type !== 'FunctionExpression') return

        const body = (valueNode as { body?: unknown }).body
        if (!body) return

        const bodyNode = toASTNode(body)
        if (!bodyNode || bodyNode.type !== 'BlockStatement') return

        const stmts = (bodyNode as { body?: unknown[] }).body
        if (stmts && Array.isArray(stmts) && stmts.length === 0) {
          context.report({
            loc: extractLocation(n),
            message: 'Unnecessary constructor. Empty constructors can be safely removed.',
            node: n,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow unnecessary empty constructors',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-constructor',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryConstructorRule
