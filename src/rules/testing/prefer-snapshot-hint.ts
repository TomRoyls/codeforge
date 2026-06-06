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

const SNAPSHOT_MATCHERS = new Set(['toMatchSnapshot', 'toMatchInlineSnapshot'])
const MODIFIERS = new Set(['not', 'resolves', 'rejects'])

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

function isStringLiteral(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n || n.type !== 'Literal') return false
  return typeof (n as { value: unknown }).value === 'string'
}

export const preferSnapshotHintRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const callee = toASTNode(n.callee)
        if (!callee || callee.type !== 'MemberExpression') return

        const propertyName = getPropertyName(callee.property)
        if (propertyName === null || !SNAPSHOT_MATCHERS.has(propertyName)) return

        // Allow: expect(fn).not.toMatchSnapshot() — negation doesn't need hint
        if (hasNotModifier(callee)) return

        const object = toASTNode(callee.object)
        if (!object || object.type !== 'CallExpression') return

        // Walk through .resolves and .rejects chains
        let expectCalleeNode = object.callee
        const objectCallee = toASTNode(object.callee)
        if (objectCallee?.type === 'MemberExpression') {
          const innerProp = getPropertyName(objectCallee.property)
          if (innerProp !== null && MODIFIERS.has(innerProp)) {
            const innerObject = toASTNode(objectCallee.object)
            if (innerObject?.type === 'CallExpression') {
              expectCalleeNode = innerObject.callee
            }
          }
        }

        if (!isExpectCallee(expectCalleeNode)) return

        // Check if first argument is a string literal hint
        const args = n.arguments
        if (Array.isArray(args) && args.length > 0) {
          const firstArg = args[0]
          if (isStringLiteral(firstArg)) return
        }

        context.report({
          loc: extractLocation(node),
          message: `Add a hint string to ${String(propertyName)}()`,
          node,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description:
        'Enforce providing a hint string to snapshot matchers',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/prefer-snapshot-hint',
    },
    severity: 'warn',
    type: 'suggestion',
    schema: [],
  },
}

export default preferSnapshotHintRule
