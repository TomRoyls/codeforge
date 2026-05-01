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

const MODIFIERS = new Set(['not', 'resolves', 'rejects'])

export const preferInlineSnapshotRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const callee = toASTNode(n.callee)
        if (!callee || callee.type !== 'MemberExpression') return

        const propertyName = getPropertyName(callee.property)
        if (propertyName !== 'toMatchSnapshot') return

        const object = toASTNode(callee.object)
        if (!object || object.type !== 'CallExpression') return

        // Walk through modifiers (.resolves, .rejects, .not)
        let expectCalleeNode = object.callee
        const objectCallee = toASTNode(object.callee)
        if (objectCallee?.type === 'MemberExpression') {
          const innerProp = getPropertyName(objectCallee.property)
          if (innerProp !== null && MODIFIERS.has(innerProp)) {
            const innerObject = toASTNode(objectCallee.object)
            if (innerObject?.type === 'CallExpression') {
              expectCalleeNode = innerObject.callee

              // Handle double modifiers: .resolves.not, .rejects.not
              const innerInnerCallee = toASTNode(innerObject.callee)
              if (innerInnerCallee?.type === 'MemberExpression') {
                const innerInnerProp = getPropertyName(innerInnerCallee.property)
                if (innerInnerProp !== null && MODIFIERS.has(innerInnerProp)) {
                  const innerInnerObject = toASTNode(innerInnerCallee.object)
                  if (innerInnerObject?.type === 'CallExpression') {
                    expectCalleeNode = innerInnerObject.callee
                  }
                }
              }
            }
          }
        }

        if (!isExpectCallee(expectCalleeNode)) return

        context.report({
          loc: extractLocation(node),
          message:
            "Use 'toMatchInlineSnapshot()' instead of 'toMatchSnapshot()' for better readability and easier code review.",
          node,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description: 'Prefer inline snapshots over external snapshots',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/prefer-inline-snapshot',
    },
    severity: 'warn',
    type: 'suggestion',
  },
}

export default preferInlineSnapshotRule
