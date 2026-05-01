import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { getPropertyName, isExpectCallee, toASTNode } from '../../utils/ast-helpers.js'

const UNSAFE_MATCHERS = new Set([
  'toBeTruthy',
  'toBeFalsy',
  'toBeTrue',
  'toBeFalse',
])

export const noUnsafeMatchersRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const callee = toASTNode(n.callee)
        if (!callee || callee.type !== 'MemberExpression') return

        const matcherName = getPropertyName(callee.property)
        if (matcherName === null || !UNSAFE_MATCHERS.has(matcherName)) return

        const object = toASTNode(callee.object)
        if (!object || object.type !== 'CallExpression') return

        if (!isExpectCallee(object.callee)) return

        context.report({
          loc: extractLocation(node),
          message: `Avoid using '${matcherName}()' which can produce false positives. Use a more specific matcher like 'toBe(true)', 'toBe(false)', 'toBeNull()', 'toBeDefined()', 'toBeUndefined()' or 'toEqual(expected)' instead.`,
          node,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description:
        'Disallow usage of unsafe matchers like toBeTruthy() and toBeFalsy() that can produce false positives',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unsafe-matchers',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnsafeMatchersRule
