import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function isNumericLiteral(node: Record<string, unknown>, value: number): boolean {
  if (node.type === 'Literal' && node.value === value) return true
  return false
}

export const noUnnecessaryArrayFlatRule: RuleDefinition = {
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
        const prop = c.property
        if (!prop || typeof prop !== 'object') return

        const propNode = toASTNode(prop) as Record<string, unknown>
        if (propNode.type !== 'Identifier' || propNode.name !== 'flat') return

        const args = nn.arguments
        if (!Array.isArray(args)) return

        if (args.length === 0) return

        const firstArg = args[0]
        if (!firstArg || typeof firstArg !== 'object') return

        const argNode = toASTNode(firstArg)
        if (!argNode) return

        const a = argNode as Record<string, unknown>
        if (isNumericLiteral(a, 0)) {
          context.report({
            loc: extractLocation(n),
            message:
              'Unnecessary flat(0). A depth of 0 is a no-op. Remove the call or use a positive depth.',
            node: n,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow unnecessary Array.flat() with depth 0.',
      recommended: false,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-array-flat.md',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryArrayFlatRule
