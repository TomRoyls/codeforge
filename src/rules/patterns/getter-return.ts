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
  if (!b) return false

  if (b.type === 'ReturnStatement') return true
  if (b.type === 'BlockStatement' && Array.isArray(b.body)) {
    return b.body.some((stmt) => hasReturnStatement(stmt))
  }
  if (b.type === 'IfStatement') {
    if (hasReturnStatement(b.consequent)) return true
    if (b.alternate && hasReturnStatement(b.alternate)) return true
    return false
  }
  if (b.type === 'SwitchStatement' && Array.isArray(b.cases)) {
    return b.cases.some((c) => hasReturnStatement(c))
  }
  if (b.type === 'CaseClause' || b.type === 'DefaultClause') {
    if (Array.isArray(b.consequent)) {
      return b.consequent.some((stmt) => hasReturnStatement(stmt))
    }
  }
  if (b.type === 'TryStatement') {
    if (b.block && hasReturnStatement(b.block)) return true
    if (b.handler && hasReturnStatement(b.handler)) return true
    return false
  }
  if (b.type === 'CatchClause') {
    if (b.body && hasReturnStatement(b.body)) return true
    return false
  }
  if (b.type === 'ForStatement' || b.type === 'ForInStatement' || b.type === 'ForOfStatement' ||
      b.type === 'WhileStatement' || b.type === 'DoStatement') {
    if (b.body && hasReturnStatement(b.body)) return true
    return false
  }
  if (b.type === 'LabeledStatement') {
    if (b.body && hasReturnStatement(b.body)) return true
    return false
  }

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
