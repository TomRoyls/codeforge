import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function isEmpty(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) return false
  if (n.type === 'ObjectPattern') {
    const {properties} = n
    return Array.isArray(properties) && properties.length === 0
  }

  if (n.type === 'ArrayPattern') {
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
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/src/rules/patterns/no-empty-pattern.ts',
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noEmptyPatternRule
