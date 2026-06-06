import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { isIdentifier, toASTNode } from '../../utils/ast-helpers.js'

const NON_CONSTRUCTORS = new Set(['BigInt', 'Symbol'])

export const noNewNativeNonconstructorRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      NewExpression(node: unknown): void {
        const n = toASTNode(node)
        if (n?.type !== 'NewExpression') return

        const callee = toASTNode(n.callee)
        if (!callee || !isIdentifier(callee)) return

        const {name} = callee
        if (name && NON_CONSTRUCTORS.has(name)) {
          context.report({
            loc: extractLocation(node),
            message: `'${name}' cannot be called as a constructor.`,
          })
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow new operators with global non-constructor functions.',
      recommended: true,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/src/rules/patterns/no-new-native-nonconstructor.ts',
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noNewNativeNonconstructorRule
