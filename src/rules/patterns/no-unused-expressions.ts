import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function hasSideEffects(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) return false

  switch (n.type) {
    case 'AssignmentExpression':
    case 'UnaryExpression':
    case 'UpdateExpression': {
      return true
    }

    case 'AwaitExpression':
    case 'YieldExpression': {
      return true
    }

    case 'BinaryExpression': {
      return hasSideEffects(n.left) || hasSideEffects(n.right)
    }

    case 'CallExpression':
    // falls through
    case 'NewExpression': {
      return true
    }

    case 'ChainExpression': {
      return hasSideEffects(n.expression)
    }

    case 'ConditionalExpression': {
      return hasSideEffects(n.test) || hasSideEffects(n.consequent) || hasSideEffects(n.alternate)
    }

    case 'LogicalExpression': {
      return hasSideEffects(n.left) || hasSideEffects(n.right)
    }

    case 'MemberExpression': {
      return hasSideEffects(n.object) || ((n.computed as boolean) && hasSideEffects(n.property))
    }

    case 'SequenceExpression': {
      return (n.expressions as unknown[]).some((exp) => hasSideEffects(exp)) as boolean
    }

    case 'TaggedTemplateExpression': {
      return true
    }

    default: {
      return false
    }
  }
}

export const noUnusedExpressionsRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      ExpressionStatement(node: unknown): void {
        const n = toASTNode(node)
        if (!n) return

        if (n.type === 'ExpressionStatement' && n.expression && !hasSideEffects(n.expression)) {
          const location = extractLocation(node)
          context.report({
            loc: location,
            message: 'Unused expression - this code has no effect',
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow unused expressions that have no effect',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-unused-expressions',
    },
    fixable: undefined,
    schema: [],
    severity: 'warn',
    type: 'problem',
  },
}

export default noUnusedExpressionsRule
