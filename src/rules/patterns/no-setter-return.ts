import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'

function isMethodDefinition(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'MethodDefinition'
}

function isFunctionExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'FunctionExpression'
}

function hasReturnValue(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  if (n.type === 'ReturnStatement' && n.value !== null && n.value !== undefined) return true
  if (n.type === 'BlockStatement' && Array.isArray(n.body)) {
    for (const stmt of n.body) {
      if (hasReturnValue(stmt)) return true
    }
  }

  return false
}

export const noSetterReturnRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      MethodDefinition(node: unknown): void {
        if (!isMethodDefinition(node)) return
        const n = node as Record<string, unknown>
        if (n.kind !== 'set') return
        if (!n.value || !isFunctionExpression(n.value)) return

        const value = n.value as Record<string, unknown>
        if (value.body && hasReturnValue(value.body)) {
          context.report({
            loc: extractLocation(node),
            message: 'Setter should not return a value.',
          })
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow returning values from setters.',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noSetterReturnRule
