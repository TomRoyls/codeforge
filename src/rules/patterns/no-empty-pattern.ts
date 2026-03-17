import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

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
    const properties = n.properties
    return Array.isArray(properties) && properties.length === 0
  }
  if (isArrayPattern(node)) {
    const elements = n.elements
    return Array.isArray(elements) && elements.length === 0
  }
  return false
}

export const noEmptyPatternRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description: 'Disallow empty destructuring patterns.',
      category: 'patterns',
      recommended: true,
    },
    schema: [],
    fixable: undefined,
  },
  create(context: RuleContext): RuleVisitor {
    return {
      ObjectPattern(node: unknown): void {
        if (isEmpty(node)) {
          context.report({
            message: 'Unexpected empty object pattern.',
            loc: extractLocation(node),
          })
        }
      },
      ArrayPattern(node: unknown): void {
        if (isEmpty(node)) {
          context.report({
            message: 'Unexpected empty array pattern.',
            loc: extractLocation(node),
          })
        }
      },
    }
  },
}
export default noEmptyPatternRule
