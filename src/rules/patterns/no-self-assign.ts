import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'

function isAssignmentExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'AssignmentExpression'
}

function isIdentifier(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'Identifier'
}

function isMemberExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'MemberExpression'
}

function areNodesEqual(left: unknown, right: unknown): boolean {
  if (!left || !right || typeof left !== 'object' || typeof right !== 'object') return false
  const l = left as Record<string, unknown>
  const r = right as Record<string, unknown>
  if (l.type !== r.type) return false
  if (isIdentifier(left)) {
    return l.name === r.name
  }

  if (isMemberExpression(left)) {
    if (!isMemberExpression(right)) return false
    return areNodesEqual(l.object, r.object) && areNodesEqual(l.property, r.property)
  }

  return false
}

export const noSelfAssignRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      AssignmentExpression(node: unknown): void {
        if (!isAssignmentExpression(node)) return
        const n = node as Record<string, unknown>
        if (areNodesEqual(n.left, n.right)) {
          context.report({
            loc: extractLocation(node),
            message: 'Self assignment has no effect.',
          })
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow assignments where both sides are exactly the same.',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noSelfAssignRule
