import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryObjectAssignRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const nn = n as Record<string, unknown>
        const callee = nn.callee
        if (!callee || typeof callee !== 'object') return

        const calleeNode = toASTNode(callee)
        if (!calleeNode) return

        const c = calleeNode as Record<string, unknown>
        if (c.type !== 'MemberExpression') return

        const obj = c.object
        const prop = c.property
        if (!obj || !prop || typeof obj !== 'object' || typeof prop !== 'object') return

        const objNode = toASTNode(obj) as Record<string, unknown>
        const propNode = toASTNode(prop) as Record<string, unknown>
        if (!objNode) return

        if (objNode.type !== 'Identifier' || objNode.name !== 'Object') return
        if (propNode.type !== 'Identifier' || propNode.name !== 'assign') return

        const args = nn.arguments
        if (!Array.isArray(args) || args.length < 2) return

        const firstArg = args[0]
        if (!firstArg || typeof firstArg !== 'object') return

        const firstArgNode = toASTNode(firstArg)
        if (!firstArgNode) return

        const fa = firstArgNode as Record<string, unknown>
        if (fa.type === 'ObjectExpression') {
          const props = fa.properties
          if (Array.isArray(props) && props.length === 0) {
            context.report({
              loc: extractLocation(n),
              message:
                'Unnecessary Object.assign with empty target. Use spread syntax {...source} instead of Object.assign({}, source).',
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
        'Suggest using spread syntax instead of Object.assign() with empty target.',
      recommended: false,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-object-assign.md',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryObjectAssignRule
