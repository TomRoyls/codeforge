import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

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

function getIdentifierName(node: unknown): string | null {
  if (isIdentifier(node)) {
    return (node as Record<string, unknown>).name as string
  }
  return null
}

export const noUselessAssignmentRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description: 'Disallow redundant assignments.',
      category: 'patterns',
      recommended: true,
    },
    schema: [],
    fixable: undefined,
  },
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
              message: `Redundant assignment to '${leftName}' with same value.`,
              loc: extractLocation(node),
            })
          }
        }

        lastValues.set(leftName, rightValue)
      },
    }
  },
}
export default noUselessAssignmentRule
