import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { type ASTNode, isIdentifier, toASTNode } from '../../utils/ast-helpers.js'

function isCatchClause(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) return false
  return n.type === 'CatchClause'
}

function isIdentifierUsed(body: unknown, name: string): boolean {
  const b = toASTNode(body)
  if (!b) return false

  if (isIdentifier(body)) {
    return (body as ASTNode).name === name
  }

  if (Array.isArray(b.body)) {
    for (const stmt of b.body) {
      if (isIdentifierUsed(stmt, name)) return true
    }
  }

  if (b.expression && isIdentifierUsed(b.expression, name)) return true
  if (b.argument && isIdentifierUsed(b.argument, name)) return true
  if (b.left && isIdentifierUsed(b.left, name)) return true
  if (b.right && isIdentifierUsed(b.right, name)) return true
  if (b.callee && isIdentifierUsed(b.callee, name)) return true
  if (b.arguments && Array.isArray(b.arguments)) {
    for (const arg of b.arguments) {
      if (isIdentifierUsed(arg, name)) return true
    }
  }

  return false
}

export const preserveCaughtErrorRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CatchClause(node: unknown): void {
        if (!isCatchClause(node)) return
        const n = toASTNode(node)
        if (!n?.param) return
        if (!isIdentifier(n.param)) return

        const param = toASTNode(n.param)
        const name = param?.name as string

        if (!n.body || typeof n.body !== 'object') return
        if (!isIdentifierUsed(n.body, name)) {
          context.report({
            loc: extractLocation(node),
            message: `Caught error '${name}' is not used. Use 'catch { }' syntax or use the error.`,
          })
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Require using caught error variables.',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default preserveCaughtErrorRule
