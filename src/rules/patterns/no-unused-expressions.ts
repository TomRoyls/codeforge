import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

function hasSideEffects(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>

  switch (n.type) {
    case 'AssignmentExpression':
    case 'UpdateExpression':
    case 'UnaryExpression':
      return true

    case 'CallExpression':
    case 'NewExpression':
      return true

    case 'BinaryExpression':
      return hasSideEffects(n.left) || hasSideEffects(n.right)

    case 'LogicalExpression':
      return hasSideEffects(n.left) || hasSideEffects(n.right)

    case 'ConditionalExpression':
      return hasSideEffects(n.test) || hasSideEffects(n.consequent) || hasSideEffects(n.alternate)

    case 'SequenceExpression':
      return (n.expressions as unknown[]).some((exp) => hasSideEffects(exp)) as boolean

    case 'MemberExpression':
      return hasSideEffects(n.object) || ((n.computed as boolean) && hasSideEffects(n.property))

    case 'ChainExpression':
      return hasSideEffects(n.expression)

    case 'TaggedTemplateExpression':
      return true

    case 'AwaitExpression':
    case 'YieldExpression':
      return true

    default:
      return false
  }
}

export const noUnusedExpressionsRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'warn',
    docs: {
      description: 'Disallow unused expressions that have no effect',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-unused-expressions',
    },
    schema: [],
    fixable: undefined,
  },

  create(context: RuleContext): RuleVisitor {
    return {
      ExpressionStatement(node: unknown): void {
        if (!node || typeof node !== 'object') {
          return
        }

        const n = node as Record<string, unknown>

        if (n.type === 'ExpressionStatement' && n.expression) {
          if (!hasSideEffects(n.expression)) {
            const location = extractLocation(node)
            context.report({
              message: 'Unused expression - this code has no effect',
              loc: location,
            })
          }
        }
      },
    }
  },
}

export default noUnusedExpressionsRule
