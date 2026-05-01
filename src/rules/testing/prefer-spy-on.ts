import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function isJestFnCall(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n || n.type !== 'CallExpression') return false

  const callee = toASTNode(n.callee)
  if (!callee || callee.type !== 'MemberExpression') return false

  const object = toASTNode(callee.object)
  if (!object || object.type !== 'Identifier' || object.name !== 'jest') return false

  const property = toASTNode(callee.property)
  if (!property || property.type !== 'Identifier' || property.name !== 'fn') return false

  return true
}

export const preferSpyOnRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      AssignmentExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'AssignmentExpression') return

        if (typeof n.operator === 'string' && n.operator !== '=') return

        const left = toASTNode(n.left)
        if (!left || left.type !== 'MemberExpression') return

        if (!isJestFnCall(n.right)) return

        context.report({
          loc: extractLocation(node),
          message:
            'Use `jest.spyOn()` instead of assigning `jest.fn()` to a member expression',
          node,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description:
        'Enforce using jest.spyOn() over jest.fn() for mock creation on objects',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/prefer-spy-on',
    },
    severity: 'warn',
    type: 'suggestion',
  },
}

export default preferSpyOnRule
