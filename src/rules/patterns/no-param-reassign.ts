import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function getIdentifierName(node: unknown): null | string {
  const n = toASTNode(node)
  if (n?.type !== 'Identifier') return null
  return n.name ?? null
}

function getParams(node: unknown): unknown[] {
  return toASTNode(node)?.params ?? []
}

export const noParamReassignRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const functionParameters = new Set<string>()

    return {
      ArrowFunctionExpression(node: unknown): void {
        const params = getParams(node)
        for (const param of params) {
          const name = getIdentifierName(param)
          if (name) functionParameters.add(name)
        }
      },

      AssignmentExpression(node: unknown): void {
        const n = toASTNode(node)
        if (n?.type !== 'AssignmentExpression') return

        const {left} = n
        if (n.operator && n.operator !== '=') return

        if (getIdentifierName(left)) {
          const name = getIdentifierName(left)
          if (name && functionParameters.has(name)) {
            context.report({
              loc: extractLocation(node),
              message: `Reassignment of function parameter '${name}'.`,
            })
            return
          }
        }

        const member = toASTNode(left)
        if (member?.type === 'MemberExpression') {
          const name = getIdentifierName(member.object)
          if (name && functionParameters.has(name)) {
            context.report({
              loc: extractLocation(node),
              message: `Reassignment of function parameter '${name}'.`,
            })
          }
        }
      },

      FunctionDeclaration(node: unknown): void {
        const params = getParams(node)
        for (const param of params) {
          const name = getIdentifierName(param)
          if (name) functionParameters.add(name)
        }
      },

      FunctionExpression(node: unknown): void {
        const params = getParams(node)
        for (const param of params) {
          const name = getIdentifierName(param)
          if (name) functionParameters.add(name)
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Report when a function parameter is reassigned or modified.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-param-reassign',
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}

export default noParamReassignRule
