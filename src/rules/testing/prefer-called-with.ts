import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import {
  getPropertyName,
  hasNotChain,
  isExpectCallee,
  toASTNode,
} from '../../utils/ast-helpers.js'

export const preferCalledWithRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const callee = toASTNode(n.callee)
        if (!callee || callee.type !== 'MemberExpression') return

        const propertyName = getPropertyName(callee.property)
        if (propertyName !== 'toHaveBeenCalled') return

        const object = toASTNode(callee.object)
        if (!object || object.type !== 'CallExpression') return

        if (!isExpectCallee(object.callee)) return

        if (hasNotChain(node)) return

        context.report({
          loc: extractLocation(node),
          message:
            'Use `toHaveBeenCalledWith()`, `toHaveBeenLastCalledWith()`, or `toHaveBeenNthCalledWith()` instead of `toHaveBeenCalled()` for more specific assertions',
          node,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description:
        'Prefer toHaveBeenCalledWith over toHaveBeenCalled for more specific assertions',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/prefer-called-with',
    },
    severity: 'warn',
    type: 'suggestion',
  },
}

export default preferCalledWithRule
