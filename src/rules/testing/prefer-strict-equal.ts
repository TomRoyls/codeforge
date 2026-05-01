import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import {
  getPropertyName,
  isExpectCallee,
  toASTNode,
} from '../../utils/ast-helpers.js'

export const preferStrictEqualRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const callee = toASTNode(n.callee)
        if (!callee || callee.type !== 'MemberExpression') return

        const propertyName = getPropertyName(callee.property)
        if (propertyName !== 'toEqual') return

        const object = toASTNode(callee.object)
        if (!object || object.type !== 'CallExpression') return

        if (!isExpectCallee(object.callee)) return

        context.report({
          loc: extractLocation(node),
          message: 'Use `toStrictEqual()` instead of `toEqual()` for stricter deep equality',
          node,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description:
        'Enforce using toStrictEqual() over toEqual() for stricter deep equality',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/prefer-strict-equal',
    },
    severity: 'warn',
    type: 'suggestion',
  },
}

export default preferStrictEqualRule
