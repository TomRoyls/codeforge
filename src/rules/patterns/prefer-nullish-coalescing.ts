/**
 * @fileoverview Suggest using `??` instead of `||` for null/undefined checks
 * @module rules/patterns/prefer-nullish-coalescing
 */

import type {
  RuleDefinition,
  RuleContext,
  RuleVisitor,
  SourceLocation,
} from '../../plugins/types.js'

interface PreferNullishCoalescingOptions {
  readonly ignoreConditionalTests?: boolean
}

function extractLocation(node: unknown): SourceLocation {
  const defaultLoc: SourceLocation = {
    start: { line: 1, column: 0 },
    end: { line: 1, column: 1 },
  }

  if (!node || typeof node !== 'object') {
    return defaultLoc
  }

  const n = node as Record<string, unknown>
  const loc = n.loc as Record<string, unknown> | undefined

  if (!loc) {
    return defaultLoc
  }

  const start = loc.start as Record<string, unknown> | undefined
  const end = loc.end as Record<string, unknown> | undefined

  return {
    start: {
      line: typeof start?.line === 'number' ? start.line : 1,
      column: typeof start?.column === 'number' ? start.column : 0,
    },
    end: {
      line: typeof end?.line === 'number' ? end.line : 1,
      column: typeof end?.column === 'number' ? end.column : 0,
    },
  }
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
    const rawOptions = context.config.options
    const options: PreferNullishCoalescingOptions = (
      Array.isArray(rawOptions) && rawOptions.length > 0 ? rawOptions[0] : {}
    ) as PreferNullishCoalescingOptions

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
