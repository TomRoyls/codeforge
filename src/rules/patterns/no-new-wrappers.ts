import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { isIdentifier, toASTNode } from '../../utils/ast-helpers.js'

const WRAPPER_TYPES = new Set(['BigInt', 'Boolean', 'Number', 'String', 'Symbol'])

export const noNewWrappersRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      NewExpression(node: unknown): void {
        const n = toASTNode(node)
        if (n?.type !== 'NewExpression') return

        const callee = toASTNode(n.callee)
        if (!callee || !isIdentifier(callee)) return

        const {name} = callee
        if (!name || !WRAPPER_TYPES.has(name)) return

        const location = extractLocation(node)
        context.report({
          loc: location,
          message: `Do not use new ${name}(). Use ${name.toLowerCase()}() or a literal instead.`,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow new String(), new Number(), new Boolean(), new Symbol(), and new BigInt(). These create object wrappers instead of primitives, which can lead to unexpected behavior.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-new-wrappers',
    },
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}

export default noNewWrappersRule
