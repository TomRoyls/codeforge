import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function getIdentifierName(node: unknown): null | string {
  const n = toASTNode(node)
  if (n?.type !== 'Identifier') return null
  return n.name ?? null
}

export const forDirectionRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      ForStatement(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'ForStatement') return

        const test = toASTNode(n.test)
        const update = toASTNode(n.update)

        if (!test || !update) return
        if (test.type !== 'BinaryExpression') return
        if (update.type !== 'UpdateExpression') return

        const counterName = getIdentifierName(update.argument)
        if (!counterName) return

        const leftName = getIdentifierName(test.left)
        const rightName = getIdentifierName(test.right)

        if (leftName !== counterName && rightName !== counterName) return

        const operator = test.operator as string
        const isIncrement = update.operator === '++'
        const isDecrement = update.operator === '--'

        let isValid = true
        if (rightName === counterName) {
          if (isIncrement && (operator === '<' || operator === '<=')) isValid = false
          if (isDecrement && (operator === '>' || operator === '>=')) isValid = false
        } else {
          if (isIncrement && (operator === '>' || operator === '>=')) isValid = false
          if (isDecrement && (operator === '<' || operator === '<=')) isValid = false
        }

        if (!isValid) {
          context.report({
            loc: extractLocation(node),
            message: 'The update clause in this loop moves the variable in the wrong direction.',
          })
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Enforce for loop update clause to move the counter in the right direction.',
      recommended: true,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/src/rules/patterns/for-direction.ts',
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default forDirectionRule
