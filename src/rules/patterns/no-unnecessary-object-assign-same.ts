import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryObjectAssignSameRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const nn = n as Record<string, unknown>
        const callee = nn.callee
        if (!callee || typeof callee !== 'object') return

        const calleeNode = toASTNode(callee)
        if (!calleeNode || calleeNode.type !== 'MemberExpression') return

        const c = calleeNode as Record<string, unknown>
        const obj = c.object
        const prop = c.property
        if (!obj || !prop || typeof obj !== 'object' || typeof prop !== 'object') return

        const objNode = toASTNode(obj) as Record<string, unknown>
        const propNode = toASTNode(prop) as Record<string, unknown>
        if (!objNode || !propNode) return

        if (objNode.type !== 'Identifier' || objNode.name !== 'Object') return
        if (propNode.type !== 'Identifier' || propNode.name !== 'assign') return

        const args = nn.arguments
        if (!Array.isArray(args) || args.length !== 1) return

        context.report({
          loc: extractLocation(n),
          message:
            'Unnecessary Object.assign() with a single argument. Object.assign(x) returns x unchanged. Use the object directly.',
          node: n,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow Object.assign() with a single argument, which returns the argument unchanged.',
      recommended: false,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-object-assign-same.md',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryObjectAssignSameRule
