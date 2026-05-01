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


function hasNotModifier(callee: unknown): boolean {
  const n = toASTNode(callee)
  if (!n || n.type !== 'MemberExpression') return false

  const object = toASTNode(n.object)
  if (!object || object.type !== 'CallExpression') return false

  const innerCallee = toASTNode(object.callee)
  if (!innerCallee || innerCallee.type !== 'MemberExpression') return false

  const innerProp = getPropertyName(innerCallee.property)
  return innerProp === 'not'
}

export const requireToThrowMessageRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const callee = toASTNode(n.callee)
        if (!callee || callee.type !== 'MemberExpression') return

        const propertyName = getPropertyName(callee.property)
        if (propertyName !== 'toThrow' && propertyName !== 'toThrowError') return

        // Allow: expect(fn).not.toThrow() — negation doesn't need message
        if (hasNotModifier(callee)) return

        const object = toASTNode(callee.object)
        if (!object || object.type !== 'CallExpression') return

        // Walk through .resolves and .rejects chains
        let expectCalleeNode = object.callee
        const objectCallee = toASTNode(object.callee)
        if (objectCallee?.type === 'MemberExpression') {
          const innerProp = getPropertyName(objectCallee.property)
          if (innerProp === 'resolves' || innerProp === 'rejects') {
            const innerObject = toASTNode(objectCallee.object)
            if (innerObject?.type === 'CallExpression') {
              expectCalleeNode = innerObject.callee
            }
          }
        }

        if (!isExpectCallee(expectCalleeNode)) return

        // Check if arguments are provided (message, regex, or Error constructor)
        const args = n.arguments
        if (args && args.length > 0) return

        context.report({
          loc: extractLocation(node),
          message: `Add an assertion message to ${propertyName === 'toThrow' ? 'toThrow()' : 'toThrowError()'}`,
          node,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description:
        'Require a message or pattern argument in toThrow() and toThrowError() assertions',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/require-to-throw-message',
    },
    severity: 'warn',
    type: 'suggestion',
  },
}

export default requireToThrowMessageRule
