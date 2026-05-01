import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noPrimitiveWrapperMapsRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      NewExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'NewExpression') return

        const callee = toASTNode(n.callee)
        if (!callee || callee.type !== 'Identifier' || callee.name !== 'Map') return

        const args = (n as { arguments?: unknown[] }).arguments
        if (!args || args.length !== 1) return

        const arg = toASTNode(args[0])
        if (!arg) return

        if (arg.type === 'CallExpression') {
          const callCallee = toASTNode(arg.callee)
          if (
            callCallee &&
            callCallee.type === 'MemberExpression' &&
            !callCallee.computed
          ) {
            const obj = toASTNode(callCallee.object)
            const prop = toASTNode(callCallee.property)

            if (
              obj &&
              obj.type === 'Identifier' &&
              obj.name === 'Object' &&
              prop &&
              prop.type === 'Identifier' &&
              prop.name === 'entries'
            ) {
              context.report({
                loc: extractLocation(node),
                message:
                  'Use Object directly instead of new Map(Object.entries(obj)). Object methods are faster for string keys.',
                node,
              })
            }
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'performance',
      description:
        'Discourage new Map(Object.entries(obj)) in favor of using the object directly',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-primitive-wrapper-maps',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noPrimitiveWrapperMapsRule
