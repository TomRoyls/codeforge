import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'

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
  create(context: RuleContext): RuleVisitor {
    return {
      TryStatement(node: unknown): void {
        if (!isTryStatement(node)) return
        const n = node as Record<string, unknown>

        if (n.handler && typeof n.handler === 'object') {
          const handler = n.handler as Record<string, unknown>
          if (handler.body && onlyRethrows(handler.body)) {
            context.report({
              loc: extractLocation(n.handler),
              message: 'Useless catch clause that only rethrows.',
            })
          }
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow useless catch clauses.',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noUselessCatchRule
