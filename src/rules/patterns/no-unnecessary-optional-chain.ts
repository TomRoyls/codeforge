import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryOptionalChainRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      MemberExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'MemberExpression') return

        const optional = (n as { optional?: boolean }).optional
        if (!optional) return

        const object = (n as { object?: unknown }).object
        if (!object || typeof object !== 'object') return

        const objType = (object as { type?: string }).type

        if (objType === 'ThisExpression') {
          context.report({
            loc: extractLocation(n),
            message: 'Optional chaining on \'this\' is unnecessary. \'this\' is never null or undefined.',
            node: n,
          })
          return
        }

        if (objType === 'NewExpression') {
          context.report({
            loc: extractLocation(n),
            message: 'Optional chaining on a new expression is unnecessary. The result of \'new\' is never null.',
            node: n,
          })
          return
        }

        if (objType === 'ArrayExpression') {
          context.report({
            loc: extractLocation(n),
            message: 'Optional chaining on an array literal is unnecessary. Array literals are never null or undefined.',
            node: n,
          })
          return
        }

        if (objType === 'ObjectExpression') {
          context.report({
            loc: extractLocation(n),
            message: 'Optional chaining on an object literal is unnecessary. Object literals are never null or undefined.',
            node: n,
          })
          return
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Detect unnecessary optional chaining on expressions that cannot be null',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-optional-chain',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryOptionalChainRule
