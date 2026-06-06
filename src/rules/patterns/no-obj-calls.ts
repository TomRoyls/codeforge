import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { isCallExpression, toASTNode } from '../../utils/ast-helpers.js'

const NON_CALLABLE_GLOBALS = new Set(['Atomics', 'Intl', 'JSON', 'Math', 'Reflect'])

export const noObjCallsRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        if (!isCallExpression(node)) return
        const callee = toASTNode(toASTNode(node)?.callee)
        if (callee?.type === 'Identifier' && typeof callee.name === 'string' && NON_CALLABLE_GLOBALS.has(callee.name)) {
            context.report({
              loc: extractLocation(node),
              message: `'${callee.name}' is not a function.`,
            })
          }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow calling global object properties as functions.',
      recommended: true,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/src/rules/patterns/no-obj-calls.ts',
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noObjCallsRule
