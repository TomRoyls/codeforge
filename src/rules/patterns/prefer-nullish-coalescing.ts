import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'
import { extractRuleOptions } from '../../utils/options-helpers.js'

interface PreferNullishCoalescingOptions {
  readonly ignoreConditionalTests?: boolean
}

function isBooleanLiteral(node: unknown, value: boolean): boolean {
  const n = toASTNode(node)
  return n?.type === 'Literal' && n.value === value
}

function isNullishCoalescingCandidate(node: unknown): boolean {
  const n = toASTNode(node)
  if (n?.type !== 'LogicalExpression' || n.operator !== '||') return false

  if (isBooleanLiteral(n.right, true) || isBooleanLiteral(n.right, false)) return false

  return true
}

export const preferNullishCoalescingRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const options = extractRuleOptions<PreferNullishCoalescingOptions>(context.config.options, {
      ignoreConditionalTests: false,
    })

    return {
      LogicalExpression(node: unknown): void {
        if (!isNullishCoalescingCandidate(node)) {
          return
        }

        const location = extractLocation(node)
        const source = context.getSource()

        // Check if this is in a conditional test context and should be ignored
        if (options.ignoreConditionalTests) {
          const nodeStart = location.start.column
          // Simple heuristic: if the line contains 'if' before this expression, skip
          const lineStart = source.split('\n')[location.start.line - 1] || ''
          const beforeNode = new Set(lineStart.slice(0, Math.max(0, nodeStart)))
          if (beforeNode.has('if (') || beforeNode.has('if(')) {
            return
          }
        }

        context.report({
          loc: location,
          message:
            'Use the nullish coalescing operator `??` instead of `||` for null/undefined checks. The `||` operator treats falsy values (0, "", false) as nullish, which may cause unexpected behavior.',
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        "Suggest using the nullish coalescing operator (`??`) instead of `||` for null/undefined checks. The `??` operator only falls through on null/undefined, whereas `||` also falls through on falsy values like 0, '', and false.",
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/prefer-nullish-coalescing',
    },
    fixable: false,
    schema: [
      {
        additionalProperties: false,
        properties: {
          ignoreConditionalTests: {
            default: false,
            type: 'boolean',
          },
        },
        type: 'object',
      },
    ],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default preferNullishCoalescingRule
