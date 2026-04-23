import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'

function isClassMethod(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'MethodDefinition'
}

function isSuperCall(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return (
    n.type === 'CallExpression' &&
    n.callee !== null &&
    typeof n.callee === 'object' &&
    (n.callee as Record<string, unknown>).type === 'Super'
  )
}

function hasSuperCall(body: unknown[]): boolean {
  if (!Array.isArray(body)) return false
  for (const stmt of body) {
    if (!stmt || typeof stmt !== 'object') continue
    const s = stmt as Record<string, unknown>
    if (s.type === 'ExpressionStatement' && isSuperCall(s.expression)) return true
    if (s.type === 'BlockStatement' && hasSuperCall(s.body as unknown[])) return true
  }

  return false
}

export const constructorSuperRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      MethodDefinition(node: unknown): void {
        if (!isClassMethod(node)) return
        const n = node as Record<string, unknown>
        if (n.kind !== 'constructor') return
        if (n.value && typeof n.value === 'object') {
          const value = n.value as Record<string, unknown>
          if (value.body && typeof value.body === 'object') {
            const body = value.body as Record<string, unknown>
            if (body.type === 'BlockStatement' && Array.isArray(body.body) && !hasSuperCall(body.body)) {
                context.report({
                  loc: extractLocation(node),
                  message: 'Constructors of derived classes must call super().',
                })
              }
          }
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Require super() calls in constructors of derived classes.',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default constructorSuperRule
