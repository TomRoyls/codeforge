import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function isSuperCall(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n || n.type !== 'CallExpression') return false
  const callee = toASTNode(n.callee)
  return callee?.type === 'Super'
}

function hasSuperCall(body: unknown[]): boolean {
  if (!Array.isArray(body)) return false
  for (const stmt of body) {
    const s = toASTNode(stmt)
    if (!s) continue
    if (s.type === 'ExpressionStatement' && isSuperCall(s.expression)) return true
    if (s.type === 'BlockStatement' && Array.isArray(s.body) && hasSuperCall(s.body as unknown[])) return true
  }

  return false
}

export const constructorSuperRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      MethodDefinition(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'MethodDefinition' || n.kind !== 'constructor') return

        const value = toASTNode(n.value)
        if (!value) return

        const body = toASTNode(value.body)
        if (!body) return

        if (body.type === 'BlockStatement' && Array.isArray(body.body) && !hasSuperCall(body.body)) {
          context.report({
            loc: extractLocation(node),
            message: 'Constructors of derived classes must call super().',
          })
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Require super() calls in constructors of derived classes.',
      recommended: true,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/src/rules/patterns/constructor-super.ts',
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default constructorSuperRule
