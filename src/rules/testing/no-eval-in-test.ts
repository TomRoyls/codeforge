import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import {
  getPropertyName,
  toASTNode,
} from '../../utils/ast-helpers.js'

const MESSAGE = 'Avoid using eval() in test files. It is a security risk and makes code harder to debug.'

export const noEvalInTestRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const callee = toASTNode(n.callee)
        if (!callee) return

        if (callee.type === 'Identifier' && typeof callee.name === 'string' && callee.name === 'eval') {
          context.report({
            loc: extractLocation(node),
            message: MESSAGE,
            node,
          })
          return
        }

        if (callee.type === 'MemberExpression') {
          const prop = getPropertyName(callee.property)
          if (prop === 'eval') {
            context.report({
              loc: extractLocation(node),
              message: MESSAGE,
              node,
            })
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description:
        'Disallow eval() usage in test files',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-eval-in-test',
    },
    severity: 'error',
    type: 'problem',
  },
}

export default noEvalInTestRule
