import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

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
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description:
        'Disallow ambiguous regex notation (= /foo/). The = operator can be confused with division. Use RegExp() or explicit comparison.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-div-regex',
    },
    schema: [],
  },

  create(context: RuleContext): RuleVisitor {
    return {
      BinaryExpression(node: unknown): void {
        if (!isAmbiguousRegex(node)) {
          return
        }

        const location = extractLocation(node)

        context.report({
          message: 'Ambiguous regex notation. Use RegExp() or wrap in parentheses.',
          loc: location,
        })
      },
    }
  },
}

export default noDivRegexRule
