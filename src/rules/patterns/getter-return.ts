import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function isFunctionExpression(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) return false
  return n.type === 'FunctionExpression'
}

function hasReturnStatement(body: unknown): boolean {
  const b = toASTNode(body)
  if (!b || b.type !== 'BlockStatement' || !Array.isArray(b.body)) return false

  for (const stmt of b.body) {
    const s = toASTNode(stmt)
    if (!s) continue
    if (s.type === 'ReturnStatement') return true
    if (s.type === 'IfStatement') {
      if (s.consequent && hasReturnInBody(s.consequent)) return true
      if (s.alternate && hasReturnInBody(s.alternate)) return true
    }
  }

  return false
}

function hasReturnInBody(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) return false
  if (n.type === 'ReturnStatement') return true
  if (n.type === 'BlockStatement') return hasReturnStatement(n)
  return false
}

export const getterReturnRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      MethodDefinition(node: unknown): void {
        const n = toASTNode(node)
        if (!n) return
        if (n.kind !== 'get') return
        if (!n.value || !isFunctionExpression(n.value)) return

        const value = toASTNode(n.value)
        if (!value?.body || !hasReturnStatement(value.body)) {
          context.report({
            loc: extractLocation(node),
            message: 'Getter should return a value.',
          })
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Enforce return statements in getters.',
      recommended: true,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/src/rules/patterns/getter-return.ts',
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default getterReturnRule
