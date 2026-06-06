import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { getParamName, toASTNode } from '../../utils/ast-helpers.js'

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
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/src/rules/patterns/no-dupe-args.ts',
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noDupeArgsRule
