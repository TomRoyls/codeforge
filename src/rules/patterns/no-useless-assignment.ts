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

function isLiteral(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'Literal'
}

function getIdentifierName(node: unknown): null | string {
  if (isIdentifier(node)) {
    return (node as Record<string, unknown>).name as string
  }

  return null
}

export const noUselessAssignmentRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const lastValues = new Map<string, unknown>()

    return {
      AssignmentExpression(node: unknown): void {
        if (!isAssignmentExpression(node)) return
        const n = node as Record<string, unknown>
        const leftName = getIdentifierName(n.left)
        if (!leftName) return

        const rightValue = isLiteral(n.right) ? (n.right as Record<string, unknown>).value : null

        if (lastValues.has(leftName)) {
          const lastValue = lastValues.get(leftName)
          if (rightValue !== null && lastValue === rightValue) {
            context.report({
              loc: extractLocation(node),
              message: `Redundant assignment to '${leftName}' with same value.`,
            })
          }
        }

        lastValues.set(leftName, rightValue)
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow redundant assignments.',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noUselessAssignmentRule
