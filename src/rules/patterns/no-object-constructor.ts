import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { getArguments, getRange, isIdentifier, isNewExpression, toASTNode } from '../../utils/ast-helpers.js'

function getCalleeName(node: unknown): null | string {
  if (!isNewExpression(node)) {
    return null
  }

  const n = toASTNode(node)
  if (!n) return null
  const {callee} = n
  if (isIdentifier(callee)) {
    return toASTNode(callee)?.name as string
  }

  return null
}

function isObjectConstructor(node: unknown): boolean {
  return getCalleeName(node) === 'Object'
}

export const noObjectConstructorRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      NewExpression(node: unknown): void {
        if (!isObjectConstructor(node)) {
          return
        }

        const location = extractLocation(node)
        const argCount = getArguments(node).length
        const range = getRange(node)

        const fix = argCount === 0 && range ? { range, text: '{}' } : undefined

        context.report({
          fix,
          loc: location,
          message: 'Use object literal {} instead of new Object().',
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow Object constructors. Using new Object() is redundant; use object literals {} instead for better readability and conciseness.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-object-constructor',
    },
    fixable: 'code',
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noObjectConstructorRule
