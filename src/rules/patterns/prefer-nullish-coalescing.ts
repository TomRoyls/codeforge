/**
 * @fileoverview Suggest using `??` instead of `||` for null/undefined checks
 * @module rules/patterns/prefer-nullish-coalescing
 */

import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'
import { extractRuleOptions } from '../../utils/options-helpers.js'

interface PreferNullishCoalescingOptions {
  readonly ignoreConditionalTests?: boolean
}

function isLogicalOrExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  return n.type === 'LogicalExpression' && n.operator === '||'
}

function isBooleanLiteral(node: unknown, value: boolean): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  return n.type === 'Literal' && n.value === value
}

function isNullishCoalescingCandidate(node: unknown): boolean {
  if (!isLogicalOrExpression(node)) {
    return false
  }

  const n = node as Record<string, unknown>
  const right = n.right as Record<string, unknown> | undefined

  // Skip if right side is a boolean literal (common pattern for || true / || false)
  if (isBooleanLiteral(right, true) || isBooleanLiteral(right, false)) {
    return false
  }

  return true
}

export const preferNullishCoalescingRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        "Suggest using the nullish coalescing operator (`??`) instead of `||` for null/undefined checks. The `??` operator only falls through on null/undefined, whereas `||` also falls through on falsy values like 0, '', and false.",
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/prefer-nullish-coalescing',
    },
    schema: [
      {
        type: 'object',
        properties: {
          ignoreConditionalTests: {
            type: 'boolean',
            default: false,
          },
        },
        additionalProperties: false,
      },
    ],
    fixable: 'code',
  },

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
          const beforeNode = lineStart.substring(0, nodeStart)
          if (beforeNode.includes('if (') || beforeNode.includes('if(')) {
            return
          }
        }

        context.report({
          message:
            'Use the nullish coalescing operator `??` instead of `||` for null/undefined checks. The `||` operator treats falsy values (0, "", false) as nullish, which may cause unexpected behavior.',
          loc: location,
        })
      },
    }
  },
}

export default preferNullishCoalescingRule
