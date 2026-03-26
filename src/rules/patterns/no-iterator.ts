import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

const ITERATOR_PATTERNS = new Set(['__iterator__', '__defineIterator__', '__defineSetter__'])

function isIteratorProperty(propertyName: string): boolean {
  if (ITERATOR_PATTERNS.has(propertyName)) {
    return true
  }
  // Check for custom iterator symbol patterns (starts with __ and contains iterator)
  if (propertyName.startsWith('__') && propertyName.toLowerCase().includes('iterator')) {
    return true
  }
  return false
}

function getPropertyName(node: unknown): string | null {
  if (!node || typeof node !== 'object') {
    return null
  }

  const n = node as Record<string, unknown>

  // Handle Identifier
  if (n.type === 'Identifier' && typeof n.name === 'string') {
    return n.name
  }

  // Handle string literal
  if (n.type === 'Literal' && typeof n.value === 'string') {
    return n.value
  }

  return null
}

export const noIteratorRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'warn',
    docs: {
      description:
        'Disallow use of __iterator__, __defineIterator__, __defineSetter__, and custom iterator symbol patterns. These are non-standard or deprecated features.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-iterator',
    },
    schema: [],
    fixable: undefined,
  },

  create(context: RuleContext): RuleVisitor {
    return {
      MemberExpression(node: unknown): void {
        if (!node || typeof node !== 'object') {
          return
        }

        const n = node as Record<string, unknown>

        if (n.type !== 'MemberExpression') {
          return
        }

        const property = n.property
        const propertyName = getPropertyName(property)

        if (propertyName && isIteratorProperty(propertyName)) {
          const location = extractLocation(node)
          context.report({
            message: `Unexpected use of '${propertyName}'. Non-standard iterator properties should be avoided.`,
            loc: location,
          })
        }
      },

      AssignmentExpression(node: unknown): void {
        if (!node || typeof node !== 'object') {
          return
        }

        const n = node as Record<string, unknown>

        if (n.type !== 'AssignmentExpression') {
          return
        }

        const left = n.left
        if (!left || typeof left !== 'object') {
          return
        }

        const leftNode = left as Record<string, unknown>

        // Check if left side is a MemberExpression
        if (leftNode.type === 'MemberExpression') {
          const property = leftNode.property
          const propertyName = getPropertyName(property)

          if (propertyName && isIteratorProperty(propertyName)) {
            const location = extractLocation(node)
            context.report({
              message: `Unexpected assignment to '${propertyName}'. Non-standard iterator properties should be avoided.`,
              loc: location,
            })
          }
        }
      },
    }
  },
}

export default noIteratorRule
