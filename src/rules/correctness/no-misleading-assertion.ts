import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noMisleadingAssertionRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const callee = (n as { callee?: unknown }).callee
        if (!callee) return

        const calleeType = (callee as { type?: string }).type
        if (calleeType !== 'Identifier') return

        const calleeName = (callee as { name?: string }).name
        if (!calleeName) return

        const assertionNames = new Set(['assertTrue', 'assert', 'expect', 'assertThat'])
        if (!assertionNames.has(calleeName)) return

        const args = (n as { arguments?: unknown[] }).arguments
        if (!args || args.length === 0) return

        const firstArg = args[0]
        if (!firstArg) return

        const argNode = toASTNode(firstArg)
        if (!argNode) return

        if (argNode.type === 'BooleanLiteral') {
          const val = (argNode as { value?: boolean }).value
          if (val === true) {
            context.report({
              loc: extractLocation(n),
              message: 'Assertion with literal `true` is always true. This is likely a mistake.',
              node: n,
            })
          } else if (val === false) {
            context.report({
              loc: extractLocation(n),
              message: 'Assertion with literal `false` is always false. This test will never pass.',
              node: n,
            })
          }
        }

        if (argNode.type === 'StringLiteral' || (argNode.type === 'Literal' && typeof (argNode as { value?: unknown }).value === 'string')) {
          const val = (argNode as { value?: string }).value
          if (val !== undefined && val.length === 0) {
            context.report({
              loc: extractLocation(n),
              message: 'Assertion with empty string is always falsy. This is likely a mistake.',
              node: n,
            })
          }
        }

        if (argNode.type === 'NumericLiteral' || (argNode.type === 'Literal' && typeof (argNode as { value?: unknown }).value === 'number')) {
          const val = (argNode as { value?: number }).value
          if (val === 0) {
            context.report({
              loc: extractLocation(n),
              message: 'Assertion with literal `0` is always falsy. This is likely a mistake.',
              node: n,
            })
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'correctness',
      description: 'Detect misleading assertions with constant values',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-misleading-assertion',
    },
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}

export default noMisleadingAssertionRule
