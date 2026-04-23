import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'

function isIdentifier(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  return n.type === 'Identifier'
}

function getIdentifierName(node: unknown): null | string {
  if (!isIdentifier(node)) {
    return null
  }

  const n = node as Record<string, unknown>
  const name = n.name as string | undefined
  return name ?? null
}

function isAssignmentExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  return n.type === 'AssignmentExpression'
}

function isMemberExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  return n.type === 'MemberExpression'
}

function isFunctionDeclaration(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  return n.type === 'FunctionDeclaration'
}

function isFunctionExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  return n.type === 'FunctionExpression'
}

function isArrowFunctionExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  return n.type === 'ArrowFunctionExpression'
}

function getParams(node: unknown): unknown[] {
  if (!node || typeof node !== 'object') {
    return []
  }

  const n = node as Record<string, unknown>
  const params = n.params as undefined | unknown[]

  if (!params) {
    return []
  }

  return params
}

export const noParamReassignRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const functionParameters = new Set<string>()

    return {
      ArrowFunctionExpression(node: unknown): void {
        if (!isArrowFunctionExpression(node)) {
          return
        }

        const params = getParams(node)
        for (const param of params) {
          const name = getIdentifierName(param)
          if (name) {
            functionParameters.add(name)
          }
        }
      },

      AssignmentExpression(node: unknown): void {
        if (!isAssignmentExpression(node)) {
          return
        }

        const n = node as Record<string, unknown>
        const left = n.left as unknown
        const operator = n.operator as string | undefined

        if (operator && operator !== '=') {
          return
        }

        if (isIdentifier(left)) {
          const name = getIdentifierName(left)
          if (name && functionParameters.has(name)) {
            const location = extractLocation(node)
            context.report({
              loc: location,
              message: `Reassignment of function parameter '${name}'.`,
            })
            return
          }
        }

        if (isMemberExpression(left)) {
          const member = left as Record<string, unknown>
          const object = member.object as unknown

          if (isIdentifier(object)) {
            const name = getIdentifierName(object)
            if (name && functionParameters.has(name)) {
              const location = extractLocation(node)
              context.report({
                loc: location,
                message: `Reassignment of function parameter '${name}'.`,
              })
            }
          }
        }
      },

      FunctionDeclaration(node: unknown): void {
        if (!isFunctionDeclaration(node)) {
          return
        }

        const params = getParams(node)
        for (const param of params) {
          const name = getIdentifierName(param)
          if (name) {
            functionParameters.add(name)
          }
        }
      },

      FunctionExpression(node: unknown): void {
        if (!isFunctionExpression(node)) {
          return
        }

        const params = getParams(node)
        for (const param of params) {
          const name = getIdentifierName(param)
          if (name) {
            functionParameters.add(name)
          }
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
