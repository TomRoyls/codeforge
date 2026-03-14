import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation, getRange, isIdentifier } from '../../utils/ast-helpers.js'

function isVariableDeclaratorWithIdentifier(node: unknown, name: string): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  if (n.type !== 'VariableDeclarator') {
    return false
  }

  const id = n.id as Record<string, unknown> | undefined
  return id?.type === 'Identifier' && id.name === name
}

export const preferRestParamsRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Prefer rest parameters (...args) instead of the arguments object. Rest parameters provide better readability and work with arrow functions.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/prefer-rest-params',
    },
    schema: [],
    fixable: 'code',
  },

  create(context: RuleContext): RuleVisitor {
    let functionDepth = 0
    let argumentsDeclared = false

    return {
      ':matches(FunctionDeclaration, FunctionExpression, ArrowFunctionExpression)'(
        _node: unknown,
      ): void {
        functionDepth++
      },

      ':matches(FunctionDeclaration, FunctionExpression, ArrowFunctionExpression):exit'(
        _node: unknown,
      ): void {
        functionDepth--
        argumentsDeclared = false
      },

      VariableDeclarator(node: unknown): void {
        if (functionDepth > 0 && isVariableDeclaratorWithIdentifier(node, 'arguments')) {
          argumentsDeclared = true
        }
      },

      Identifier(node: unknown): void {
        if (functionDepth === 0) {
          return
        }

        if (argumentsDeclared) {
          return
        }

        if (!isIdentifier(node, 'arguments')) {
          return
        }

        const location = extractLocation(node)
        const range = getRange(node)
        context.report({
          message: "Use rest parameters (...args) instead of 'arguments'.",
          loc: location,
          fix: range ? { range, text: 'args' } : undefined,
        })
      },
    }
  },
}

export default preferRestParamsRule
