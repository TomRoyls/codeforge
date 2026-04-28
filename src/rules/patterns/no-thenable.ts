import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function isThenable(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n || n.type !== 'CallExpression') return false

  const callee = toASTNode(n.callee)
  if (!callee) return false

  if (callee.type === 'MemberExpression') {
    const prop = toASTNode(callee.property)
    if (prop && prop.type === 'Identifier') {
      return prop.name === 'then'
    }
  }

  return false
}

export const noThenableRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        if (isThenable(node)) {
          const location = extractLocation(node)
          context.report({
            loc: location,
            message: 'Prefer async/await over .then() method.',
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow use of .then() method. Prefer async/await syntax for better readability and error handling.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-thenable',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noThenableRule
