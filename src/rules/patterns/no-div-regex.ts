import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'

function isAmbiguousRegex(node: unknown): boolean {
  if (typeof node !== 'object' || node === null) {
    return false
  }

  const n = node as Record<string, unknown>

  if (n.type !== 'BinaryExpression') {
    return false
  }

  const operator = n.operator as string | undefined
  if (operator !== '/') {
    return false
  }

  const right = n.right as Record<string, unknown> | undefined
  if (!right || right.type !== 'Literal' || typeof right.value !== 'string') {
    return false
  }

  return true
}

export const noDivRegexRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      BinaryExpression(node: unknown): void {
        if (!isAmbiguousRegex(node)) {
          return
        }

        const location = extractLocation(node)

        context.report({
          loc: location,
          message: 'Ambiguous regex notation. Use RegExp() or wrap in parentheses.',
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow ambiguous regex notation (= /foo/). The = operator can be confused with division. Use RegExp() or explicit comparison.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-div-regex',
    },
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}

export default noDivRegexRule
