import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

function isTryStatement(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'TryStatement'
}

function isThrowStatement(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'ThrowStatement'
}

function onlyRethrows(body: unknown): boolean {
  if (!body || typeof body !== 'object') return false
  const b = body as Record<string, unknown>
  if (b.type !== 'BlockStatement' || !Array.isArray(b.body)) return false
  if (b.body.length !== 1) return false
  const stmt = b.body[0]
  return isThrowStatement(stmt)
}

export const noUselessCatchRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description: 'Disallow useless catch clauses.',
      category: 'patterns',
      recommended: true,
    },
    schema: [],
    fixable: undefined,
  },
  create(context: RuleContext): RuleVisitor {
    return {
      TryStatement(node: unknown): void {
        if (!isTryStatement(node)) return
        const n = node as Record<string, unknown>

        if (n.handler && typeof n.handler === 'object') {
          const handler = n.handler as Record<string, unknown>
          if (handler.body && onlyRethrows(handler.body)) {
            context.report({
              message: 'Useless catch clause that only rethrows.',
              loc: extractLocation(n.handler),
            })
          }
        }
      },
    }
  },
}
export default noUselessCatchRule
