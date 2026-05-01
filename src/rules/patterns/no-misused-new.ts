import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noMisusedNewRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      NewExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'NewExpression') return

        const callee = toASTNode((n as { callee?: unknown }).callee)
        if (!callee || callee.type !== 'Identifier') return

        const name = (callee as { name?: string }).name
        if (!name) return

        const wrapperTypes = new Set(['Symbol', 'BigInt'])

        if (wrapperTypes.has(name)) {
          context.report({
            loc: extractLocation(n),
            message: `Don't use \`new ${name}()\`. \`${name}\` is not a constructor — call it directly: \`${name}()\`.`,
            node: n,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow new expressions on non-constructor types like Symbol and BigInt',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-misused-new',
    },
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}

export default noMisusedNewRule
