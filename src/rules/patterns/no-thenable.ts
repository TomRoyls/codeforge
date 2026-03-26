import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

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
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Disallow use of .then() method. Prefer async/await syntax for better readability and error handling.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-thenable',
    },
    schema: [],
  },

  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        if (isThenable(node)) {
          const location = extractLocation(node)
          context.report({
            message: 'Prefer async/await over .then() method.',
            loc: location,
          })
        }
      },
    }
  },
}

export default noThenableRule
