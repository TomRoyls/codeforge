import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import {
  isExpectCall,
  toASTNode,
} from '../../utils/ast-helpers.js'

const MESSAGE = 'Do not assign the result of expect() to a variable. expect() assertions return void and are not meant to be captured.'

export const noAssigningExpectResultRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      VariableDeclarator(node: unknown): void {
        const n = toASTNode(node)
        if (!n) return

        const init = toASTNode(n.init)
        if (!init || init.type !== 'CallExpression') return

        if (isExpectCall(init)) {
          context.report({
            loc: extractLocation(node),
            message: MESSAGE,
            node,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description:
        'Disallow assigning the result of expect() to a variable',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-assigning-expect-result',
    },
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noAssigningExpectResultRule
