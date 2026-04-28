import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { isIdentifier, isMemberExpression, toASTNode } from '../../utils/ast-helpers.js'

const PROTOTYPE_METHODS = new Set(['hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable'])

export const noPrototypeBuiltinsRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (n?.type !== 'CallExpression') return
        const { callee } = n
        if (isMemberExpression(callee)) {
          const member = toASTNode(callee)
          if (isIdentifier(member?.property)) {
            const name = toASTNode(member?.property)?.name
            if (name && PROTOTYPE_METHODS.has(name)) {
              context.report({
                loc: extractLocation(node),
                message: `Do not call '${name}' directly on an object. Use Object.prototype.${name}.call() instead.`,
              })
            }
          }
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow calling some Object.prototype methods directly on objects.',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noPrototypeBuiltinsRule
