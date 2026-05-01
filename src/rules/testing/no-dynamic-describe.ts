import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import {
  getCallRootName,
  toASTNode,
} from '../../utils/ast-helpers.js'

const MESSAGE =
  'Avoid using dynamic expressions in describe() titles. Use static string literals for better test organization and readability.'

function hasDynamicTitle(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n || n.type !== 'CallExpression') return false

  const args = n.arguments
  if (!Array.isArray(args) || args.length === 0) return false

  const firstArg = toASTNode(args[0])
  if (!firstArg) return false

  if (firstArg.type === 'TemplateLiteral') {
    const expressions = firstArg.expressions
    return Array.isArray(expressions) && expressions.length > 0
  }

  return false
}

export const noDynamicDescribeRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const functionName = getCallRootName(node)
        if (functionName === null) return

        if (functionName !== 'describe' && functionName !== 'fdescribe' && functionName !== 'xdescribe') return

        if (hasDynamicTitle(node)) {
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
        'Disallow dynamic expressions in describe() titles',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-dynamic-describe',
    },
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noDynamicDescribeRule
