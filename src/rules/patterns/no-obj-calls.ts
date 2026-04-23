import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'

const NON_CALLABLE_GLOBALS = new Set(['Atomics', 'Intl', 'JSON', 'Math', 'Reflect'])

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
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        if (!isCallExpression(node)) return
        const n = node as Record<string, unknown>
        const {callee} = n
        if (isIdentifier(callee)) {
          const c = callee as Record<string, unknown>
          const name = c.name as string
          if (NON_CALLABLE_GLOBALS.has(name)) {
            context.report({
              loc: extractLocation(node),
              message: `'${name}' is not a function.`,
            })
          }
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow calling global object properties as functions.',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noObjCallsRule
