import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function isThisExpression(node: unknown): boolean {
  return toASTNode(node)?.type === 'ThisExpression'
}

function isSuperCall(node: unknown): boolean {
  const n = toASTNode(node)
  if (n?.type !== 'CallExpression') return false
  return toASTNode(n.callee)?.type === 'Super'
}

function checkBodyForThisBeforeSuper(body: unknown[], hasSuper: { value: boolean }): boolean {
  for (const stmt of body) {
    const s = toASTNode(stmt)
    if (!s) continue
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
  create(context: RuleContext): RuleVisitor {
    return {
      MethodDefinition(node: unknown): void {
        const n = toASTNode(node)
        if (n?.type !== 'MethodDefinition' || n.kind !== 'constructor') return
        const value = toASTNode(n.value)
        if (!value) return
        const body = toASTNode(value.body)
        if (body?.type !== 'BlockStatement' || !Array.isArray(body.body)) return

        const hasSuper = { value: false }
        if (checkBodyForThisBeforeSuper(body.body, hasSuper)) {
          context.report({
            loc: extractLocation(node),
            message: "'this' is not allowed before super().",
          })
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow this/super before super() calling.',
      recommended: true,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/src/rules/patterns/no-this-before-super.ts',
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noThisBeforeSuperRule
