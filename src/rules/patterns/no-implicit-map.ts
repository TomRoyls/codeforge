import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

const IMPLICIT_TYPES = new Set(['Map', 'WeakMap', 'Set', 'WeakSet'])

export const noImplicitMapRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      NewExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'NewExpression') return

        const callee = (n as { callee?: unknown }).callee
        if (!callee) return

        const calleeNode = toASTNode(callee)
        if (!calleeNode || calleeNode.type !== 'Identifier') return

        const name = (calleeNode as { name?: string }).name
        if (!name || !IMPLICIT_TYPES.has(name)) return

        context.report({
          loc: extractLocation(n),
          message: `Avoid using ${name} without explicit type parameters. Consider new ${name}<K, V>() for better type safety.`,
          node: n,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow Map/Set/WeakMap/WeakSet without explicit type parameters',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-implicit-map',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noImplicitMapRule
