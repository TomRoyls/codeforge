import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

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
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description: 'Disallow returning values from setters.',
      category: 'patterns',
      recommended: true,
    },
    schema: [],
    fixable: undefined,
  },
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
            message: 'Setter should not return a value.',
            loc: extractLocation(node),
          })
        }
      },
    }
  },
}
export default noSetterReturnRule
