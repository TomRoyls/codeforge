import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import {
  extractLocation,
  getNodeSource,
  isNewExpression,
  isIdentifier,
  getArguments,
  getRange,
} from '../../utils/ast-helpers.js'

export const noArrayConstructorRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'warn',
    docs: {
      description:
        'Disallow Array constructor. Use array literals [] instead of new Array() for consistency and to avoid confusing behavior with single numeric arguments.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-array-constructor',
    },
    schema: [],
    fixable: 'code',
  },

  create(context: RuleContext): RuleVisitor {
    return {
      NewExpression(node: unknown): void {
        if (!isNewExpression(node)) {
          return
        }

        const n = node as Record<string, unknown>
        const callee = n.callee as unknown

        if (!isIdentifier(callee, 'Array')) {
          return
        }

        const args = getArguments(node)
        const argCount = args.length
        const location = extractLocation(node)
        const range = getRange(node)

        if (argCount === 0) {
          context.report({
            message: 'Use array literal [] instead of new Array().',
            loc: location,
            fix: range ? { range, text: '[]' } : undefined,
          })
        } else if (argCount === 1) {
          context.report({
            message:
              'Avoid new Array() with single argument - it creates an array of that length, not an array containing that value. Use array literal [] instead.',
            loc: location,
          })
        } else {
          const argsSource = args.map((arg) => getNodeSource(context, arg)).join(', ')
          context.report({
            message: 'Use array literal [...] instead of new Array(...).',
            loc: location,
            fix: range ? { range, text: `[${argsSource}]` } : undefined,
          })
        }
      },
    }
  },
}

export default noArrayConstructorRule
