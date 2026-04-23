import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'

const NON_CONSTRUCTORS = new Set(['BigInt', 'Symbol'])

function isNewExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'NewExpression'
}

function isIdentifier(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'Identifier'
}

export const noNewNativeNonconstructorRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      NewExpression(node: unknown): void {
        if (!isNewExpression(node)) return
        const n = node as Record<string, unknown>
        if (isIdentifier(n.callee)) {
          const callee = n.callee as Record<string, unknown>
          const name = callee.name as string
          if (NON_CONSTRUCTORS.has(name)) {
            context.report({
              loc: extractLocation(node),
              message: `'${name}' cannot be called as a constructor.`,
            })
          }
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow new operators with global non-constructor functions.',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noNewNativeNonconstructorRule
