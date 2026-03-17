import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

const NON_CALLABLE_GLOBALS = new Set([
  'Math', 'JSON', 'Reflect', 'Atomics', 'Intl'
])

function isCallExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'CallExpression'
}

function isIdentifier(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'Identifier'
}

export const noObjCallsRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description: 'Disallow calling global object properties as functions.',
      category: 'patterns',
      recommended: true,
    },
    schema: [],
    fixable: undefined,
  },
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        if (!isCallExpression(node)) return
        const n = node as Record<string, unknown>
        const callee = n.callee
        if (isIdentifier(callee)) {
          const c = callee as Record<string, unknown>
          const name = c.name as string
          if (NON_CALLABLE_GLOBALS.has(name)) {
            context.report({
              message: `'${name}' is not a function.`,
              loc: extractLocation(node),
            })
          }
        }
      },
    }
  },
}
export default noObjCallsRule
