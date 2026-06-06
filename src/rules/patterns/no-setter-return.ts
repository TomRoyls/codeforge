import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function hasReturnValue(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) return false
  if (n.type === 'ReturnStatement' && n.value !== null && n.value !== undefined) return true
  if (n.type === 'BlockStatement' && Array.isArray(n.body)) {
    for (const stmt of n.body) {
      if (hasReturnValue(stmt)) return true
    }
  }

  return false
}

export const noSetterReturnRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      MethodDefinition(node: unknown): void {
        const n = toASTNode(node)
        if (n?.type !== 'MethodDefinition' || n.kind !== 'set') return
        const value = toASTNode(n.value)
        if (value?.type !== 'FunctionExpression') return
        if (value.body && hasReturnValue(value.body)) {
          context.report({
            loc: extractLocation(node),
            message: 'Setter should not return a value.',
          })
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow returning values from setters.',
      recommended: true,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/src/rules/patterns/no-setter-return.ts',
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noSetterReturnRule
