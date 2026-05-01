import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const preferNumberIsfiniteRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const callee = toASTNode(n.callee)
        if (!callee) return

        if (
          callee.type === 'MemberExpression' &&
          !callee.computed
        ) {
          const obj = toASTNode(callee.object)
          const prop = toASTNode(callee.property)

          if (
            obj &&
            obj.type === 'Identifier' &&
            obj.name === 'Number' &&
            prop &&
            prop.type === 'Identifier' &&
            prop.name === 'isFinite'
          ) {
            return
          }

          if (
            obj &&
            obj.type === 'Identifier' &&
            obj.name === 'globalThis' &&
            prop &&
            prop.type === 'Identifier' &&
            prop.name === 'isFinite'
          ) {
            context.report({
              loc: extractLocation(node),
              message:
                'Use Number.isFinite() instead of globalThis.isFinite(). Number.isFinite() returns false for non-numeric values, while globalThis.isFinite() coerces to number first.',
              node,
            })
            return
          }
        }

        if (
          callee.type === 'Identifier' &&
          callee.name === 'isFinite'
        ) {
          context.report({
            loc: extractLocation(node),
            message:
              'Use Number.isFinite() instead of global isFinite(). Number.isFinite() returns false for non-numeric values, while global isFinite() coerces to number first.',
            node,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Enforce using Number.isFinite() instead of global isFinite() or globalThis.isFinite()',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/prefer-number-isfinite',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default preferNumberIsfiniteRule
