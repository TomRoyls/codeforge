import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { getRange, isIdentifier, toASTNode } from '../../utils/ast-helpers.js'

function isVariableDeclaratorWithIdentifier(node: unknown, name: string): boolean {
  const n = toASTNode(node)
  if (!n || n.type !== 'VariableDeclarator') return false

  const id = toASTNode(n.id)
  return id?.type === 'Identifier' && id.name === name
}

export const preferRestParamsRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    let functionDepth = 0
    let argumentsDeclared = false

    function enterFunction(): void {
      functionDepth++
    }

    function exitFunction(): void {
      functionDepth--
      argumentsDeclared = false
    }

    return {
      ArrowFunctionExpression: enterFunction,
      'ArrowFunctionExpression:exit': exitFunction,
      FunctionDeclaration: enterFunction,

      'FunctionDeclaration:exit': exitFunction,
      FunctionExpression: enterFunction,
      'FunctionExpression:exit': exitFunction,

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
          fix: range ? { range, text: 'args' } : undefined,
          loc: location,
          message: "Use rest parameters (...args) instead of 'arguments'.",
        })
      },

      VariableDeclarator(node: unknown): void {
        if (functionDepth > 0 && isVariableDeclaratorWithIdentifier(node, 'arguments')) {
          argumentsDeclared = true
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Prefer rest parameters (...args) instead of the arguments object. Rest parameters provide better readability and work with arrow functions.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/prefer-rest-params',
    },
    fixable: 'code',
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default preferRestParamsRule
