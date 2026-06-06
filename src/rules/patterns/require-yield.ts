import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function hasYield(body: unknown): boolean {
  const b = toASTNode(body)
  if (!b) return false

  if (b.type === 'YieldExpression') return true

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
      const n = toASTNode(node)
      if (!n || !n.generator || !n.body) return
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
      url: 'https://codeforge.dev/docs/rules/require-yield',
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default requireYieldRule
