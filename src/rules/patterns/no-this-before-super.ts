import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

function isMethodDefinition(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'MethodDefinition'
}

function isThisExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'ThisExpression'
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

function checkBodyForThisBeforeSuper(body: unknown[], hasSuper: { value: boolean }): boolean {
  for (const stmt of body) {
    if (!stmt || typeof stmt !== 'object') continue
    const s = stmt as Record<string, unknown>
    if (isSuperCall(s)) {
      hasSuper.value = true
      return false
    }
    if (isThisExpression(s) && !hasSuper.value) return true
    if (s.type === 'ExpressionStatement' && s.expression) {
      if (isThisExpression(s.expression) && !hasSuper.value) return true
      if (isSuperCall(s.expression)) {
        hasSuper.value = true
        return false
      }
    }
  }
  return false
}

export const noThisBeforeSuperRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description: 'Disallow this/super before super() calling.',
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
        if (n.kind !== 'constructor') return
        if (!n.value || typeof n.value !== 'object') return
        const value = n.value as Record<string, unknown>
        if (!value.body || typeof value.body !== 'object') return
        const body = value.body as Record<string, unknown>
        if (body.type !== 'BlockStatement' || !Array.isArray(body.body)) return

        const hasSuper = { value: false }
        if (checkBodyForThisBeforeSuper(body.body, hasSuper)) {
          context.report({
            message: "'this' is not allowed before super().",
            loc: extractLocation(node),
          })
        }
      },
    }
  },
}
export default noThisBeforeSuperRule
