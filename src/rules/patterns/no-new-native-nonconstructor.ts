import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

const NON_CONSTRUCTORS = new Set(['Symbol', 'BigInt'])

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
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description: 'Disallow new operators with global non-constructor functions.',
      category: 'patterns',
      recommended: true,
    },
    schema: [],
    fixable: undefined,
  },
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
              message: `'${name}' cannot be called as a constructor.`,
              loc: extractLocation(node),
            })
          }
        }
      },
    }
  },
}
export default noNewNativeNonconstructorRule
