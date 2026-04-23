import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'

function isObjectPattern(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'ObjectPattern'
}

function isArrayPattern(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'ArrayPattern'
}

function isEmpty(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  if (isObjectPattern(node)) {
    const {properties} = n
    return Array.isArray(properties) && properties.length === 0
  }

  if (isArrayPattern(node)) {
    const {elements} = n
    return Array.isArray(elements) && elements.length === 0
  }

  return false
}

export const noEmptyPatternRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      ArrayPattern(node: unknown): void {
        if (isEmpty(node)) {
          context.report({
            loc: extractLocation(node),
            message: 'Unexpected empty array pattern.',
          })
        }
      },
      ObjectPattern(node: unknown): void {
        if (isEmpty(node)) {
          context.report({
            loc: extractLocation(node),
            message: 'Unexpected empty object pattern.',
          })
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow empty destructuring patterns.',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noEmptyPatternRule
