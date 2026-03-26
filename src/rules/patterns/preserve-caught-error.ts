import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

function isCatchClause(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'CatchClause'
}

function isIdentifier(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'Identifier'
}

function isIdentifierUsed(body: unknown, name: string): boolean {
  if (!body || typeof body !== 'object') return false
  const b = body as Record<string, unknown>

  if (isIdentifier(body)) {
    return (body as Record<string, unknown>).name === name
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
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description: 'Require using caught error variables.',
      category: 'patterns',
      recommended: true,
    },
    schema: [],
    fixable: undefined,
  },
  create(context: RuleContext): RuleVisitor {
    return {
      CatchClause(node: unknown): void {
        if (!isCatchClause(node)) return
        const n = node as Record<string, unknown>
        if (!n.param) return
        if (!isIdentifier(n.param)) return

        const param = n.param as Record<string, unknown>
        const name = param.name as string

        if (!n.body || typeof n.body !== 'object') return
        if (!isIdentifierUsed(n.body, name)) {
          context.report({
            message: `Caught error '${name}' is not used. Use 'catch { }' syntax or use the error.`,
            loc: extractLocation(node),
          })
        }
      },
    }
  },
}
export default preserveCaughtErrorRule
