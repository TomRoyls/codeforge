import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

function isFunctionExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'FunctionExpression'
}

function hasReturnStatement(body: unknown): boolean {
  if (!body || typeof body !== 'object') return false
  const b = body as Record<string, unknown>
  if (b.type !== 'BlockStatement' || !Array.isArray(b.body)) return false

  for (const stmt of b.body) {
    if (!stmt || typeof stmt !== 'object') continue
    const s = stmt as Record<string, unknown>
    if (s.type === 'ReturnStatement') return true
    if (s.type === 'IfStatement') {
      if (s.consequent && hasReturnInBody(s.consequent)) return true
      if (s.alternate && hasReturnInBody(s.alternate)) return true
    }
  }
  return false
}

function hasReturnInBody(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  if (n.type === 'ReturnStatement') return true
  if (n.type === 'BlockStatement') return hasReturnStatement(n)
  return false
}

export const getterReturnRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description: 'Enforce return statements in getters.',
      category: 'patterns',
      recommended: true,
    },
    schema: [],
    fixable: undefined,
  },
  create(context: RuleContext): RuleVisitor {
    return {
      MethodDefinition(node: unknown): void {
        if (!node || typeof node !== 'object') return
        const n = node as Record<string, unknown>
        if (n.kind !== 'get') return
        if (!n.value || !isFunctionExpression(n.value)) return

        const value = n.value as Record<string, unknown>
        if (!value.body || !hasReturnStatement(value.body)) {
          context.report({
            message: 'Getter should return a value.',
            loc: extractLocation(node),
          })
        }
      },
    }
  },
}
export default getterReturnRule
