import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'

function isFunctionDeclaration(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return (
    n.type === 'FunctionDeclaration' ||
    n.type === 'FunctionExpression' ||
    n.type === 'ArrowFunctionExpression'
  )
}

function getParamName(param: unknown): null | string {
  if (!param || typeof param !== 'object') return null
  const p = param as Record<string, unknown>
  if (p.type === 'Identifier' && typeof p.name === 'string') return p.name
  if (p.type === 'AssignmentPattern') return getParamName(p.left)
  if (p.type === 'RestElement') return getParamName(p.argument)
  if (p.type === 'ObjectPattern' || p.type === 'ArrayPattern') return null
  return null
}

export const noDupeArgsRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      ArrowFunctionExpression(node: unknown): void {
        checkFunction(node)
      },
      FunctionDeclaration(node: unknown): void {
        checkFunction(node)
      },
      FunctionExpression(node: unknown): void {
        checkFunction(node)
      },
    }
    function checkFunction(node: unknown): void {
      if (!isFunctionDeclaration(node)) return
      const n = node as Record<string, unknown>
      const {params} = n
      if (!Array.isArray(params)) return

      const seen = new Set<string>()
      for (const param of params) {
        const name = getParamName(param)
        if (name) {
          if (seen.has(name)) {
            context.report({
              loc: extractLocation(param),
              message: `Duplicate argument '${name}' in function definition.`,
            })
          }

          seen.add(name)
        }
      }
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow duplicate arguments in function definitions.',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noDupeArgsRule
