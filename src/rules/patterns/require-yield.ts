import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'

function isYieldExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'YieldExpression'
}

function hasYield(body: unknown): boolean {
  if (!body || typeof body !== 'object') return false
  const b = body as Record<string, unknown>

  if (isYieldExpression(body)) return true

  if (Array.isArray(b.body)) {
    for (const stmt of b.body) {
      if (hasYield(stmt)) return true
    }
  }

  if (b.consequent && hasYield(b.consequent)) return true
  if (b.alternate && hasYield(b.alternate)) return true
  if (b.argument && hasYield(b.argument)) return true
  if (b.expression && hasYield(b.expression)) return true
  if (b.declarations && Array.isArray(b.declarations)) {
    for (const decl of b.declarations) {
      if (hasYield(decl)) return true
    }
  }

  if (b.init && hasYield(b.init)) return true

  return false
}

export const requireYieldRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    function checkGenerator(node: unknown): void {
      if (!node || typeof node !== 'object') return
      const n = node as Record<string, unknown>
      if (!n.generator) return
      if (!n.body) return
      if (!hasYield(n.body)) {
        context.report({
          loc: extractLocation(node),
          message: 'This generator function does not have yield.',
        })
      }
    }

    return {
      FunctionDeclaration(node: unknown): void {
        checkGenerator(node)
      },
      FunctionExpression(node: unknown): void {
        checkGenerator(node)
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Require yield in generator functions.',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default requireYieldRule
