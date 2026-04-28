import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function getParamName(param: unknown): null | string {
  const p = toASTNode(param)
  if (!p) return null
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
      const n = toASTNode(node)
      if (!n) return
      if (n.type !== 'FunctionDeclaration' && n.type !== 'FunctionExpression' && n.type !== 'ArrowFunctionExpression') return
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
