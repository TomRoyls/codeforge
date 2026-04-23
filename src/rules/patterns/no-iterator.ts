import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'

const ITERATOR_PATTERNS = new Set(['__defineIterator__', '__defineSetter__', '__iterator__'])

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

function getPropertyName(node: unknown): null | string {
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
  create(context: RuleContext): RuleVisitor {
    return {
      AssignmentExpression(node: unknown): void {
        if (!node || typeof node !== 'object') {
          return
        }

        const n = node as Record<string, unknown>

        if (n.type !== 'AssignmentExpression') {
          return
        }

        const {left} = n
        if (!left || typeof left !== 'object') {
          return
        }

        const leftNode = left as Record<string, unknown>

        // Check if left side is a MemberExpression
        if (leftNode.type === 'MemberExpression') {
          const {property} = leftNode
          const propertyName = getPropertyName(property)

          if (propertyName && isIteratorProperty(propertyName)) {
            const location = extractLocation(node)
            context.report({
              loc: location,
              message: `Unexpected assignment to '${propertyName}'. Non-standard iterator properties should be avoided.`,
            })
          }
        }
      },

      MemberExpression(node: unknown): void {
        if (!node || typeof node !== 'object') {
          return
        }

        const n = node as Record<string, unknown>

        if (n.type !== 'MemberExpression') {
          return
        }

        const {property} = n
        const propertyName = getPropertyName(property)

        if (propertyName && isIteratorProperty(propertyName)) {
          const location = extractLocation(node)
          context.report({
            loc: location,
            message: `Unexpected use of '${propertyName}'. Non-standard iterator properties should be avoided.`,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow use of __iterator__, __defineIterator__, __defineSetter__, and custom iterator symbol patterns. These are non-standard or deprecated features.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-iterator',
    },
    fixable: undefined,
    schema: [],
    severity: 'warn',
    type: 'problem',
  },
}

export default noIteratorRule
