import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import {
  extractLocation,
  isNewExpression,
  isIdentifier,
  getArguments,
  getRange,
} from '../../utils/ast-helpers.js'

function getCalleeName(node: unknown): string | null {
  if (!isNewExpression(node)) {
    return null
  }
  const n = node as Record<string, unknown>
  const callee = n.callee as unknown
  if (isIdentifier(callee)) {
    return (callee as Record<string, unknown>).name as string
  }
  return null
}

function isObjectConstructor(node: unknown): boolean {
  return getCalleeName(node) === 'Object'
}

export const noObjectConstructorRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Disallow Object constructors. Using new Object() is redundant; use object literals {} instead for better readability and conciseness.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-object-constructor',
    },
    schema: [],
    fixable: 'code',
  },

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
          message: 'Use object literal {} instead of new Object().',
          loc: location,
          fix,
        })
      },
    }
  },
}

export default noObjectConstructorRule
