import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { getPropertyName, toASTNode } from '../../utils/ast-helpers.js'

const SNAPSHOT_MATCHERS = new Set(['toMatchSnapshot', 'toMatchInlineSnapshot'])

function getMatcherName(node: unknown): null | string {
  const n = toASTNode(node)
  if (!n || n.type !== 'MemberExpression') return null

  return getPropertyName(n.property)
}

function isExpectCall(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n || n.type !== 'CallExpression') return false

  const callee = toASTNode(n.callee)
  if (!callee) return false

  if (callee.type === 'Identifier' && callee.name === 'expect') return true

  if (callee.type === 'MemberExpression') {
    const obj = toASTNode(callee.object)
    if (obj?.type === 'CallExpression') {
      const innerCallee = toASTNode(obj.callee)
      if (innerCallee?.type === 'Identifier' && innerCallee.name === 'expect') {
        return true
      }
    }
  }

  return false
}

export const preferNamedSnapshotRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const callee = toASTNode(n.callee)
        if (!callee || callee.type !== 'MemberExpression') return

        const matcherName = getMatcherName(callee)
        if (matcherName === null || !SNAPSHOT_MATCHERS.has(matcherName)) return

        const object = toASTNode(callee.object)
        if (!object || object.type !== 'CallExpression') return

        if (!isExpectCall(object)) return

        const args = n.arguments
        if (!Array.isArray(args) || args.length === 0) return

        const firstArg = toASTNode(args[0])

        if (matcherName === 'toMatchSnapshot') {
          if (firstArg?.type !== 'Literal' || typeof firstArg.value !== 'string') {
            context.report({
              loc: extractLocation(node),
              message:
                'Use toMatchSnapshot(\'snapshot name\') with a descriptive name instead of an unnamed snapshot',
              node,
            })
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description:
        'Enforce using named snapshots with toMatchSnapshot() for better readability and maintainability',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/prefer-named-snapshot',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default preferNamedSnapshotRule
