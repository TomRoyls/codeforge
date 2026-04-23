import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import {
  getArguments,
  getNodeSource,
  getRange,
  isIdentifier,
  isNewExpression,
} from '../../utils/ast-helpers.js'
import { RULE_SUGGESTIONS } from '../../utils/suggestions.js'

export const noArrayConstructorRule: RuleDefinition = {
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
            fix: range ? { range, text: '[]' } : undefined,
            loc: location,
            message:
              'Use array literal [] instead of new Array().' + RULE_SUGGESTIONS.noArrayConstructor,
          })
        } else if (argCount === 1) {
          context.report({
            loc: location,
            message:
              'Avoid new Array() with single argument - it creates an array of that length, not an array containing that value. Use array literal [] instead.' +
              RULE_SUGGESTIONS.noArrayConstructor,
          })
        } else {
          const argsSource = args.map((arg) => getNodeSource(context, arg)).join(', ')
          context.report({
            fix: range ? { range, text: `[${argsSource}]` } : undefined,
            loc: location,
            message:
              'Use array literal [...] instead of new Array(...).' +
              RULE_SUGGESTIONS.noArrayConstructor,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow Array constructor. Use array literals [] instead of new Array() for consistency and to avoid confusing behavior with single numeric arguments.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-array-constructor',
    },
    fixable: 'code',
    schema: [],
    severity: 'warn',
    type: 'problem',
  },
}

export default noArrayConstructorRule
