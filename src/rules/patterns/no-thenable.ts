import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'

function isThenable(node: unknown): boolean {
  if (typeof node !== 'object' || node === null) {
    return false
  }

  const n = node as Record<string, unknown>

  if (n.type !== 'CallExpression') {
    return false
  }

  const callee = n.callee as Record<string, unknown>
  if (!callee) {
    return false
  }

  if (callee.type === 'MemberExpression') {
    const prop = callee.property as Record<string, unknown>
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
