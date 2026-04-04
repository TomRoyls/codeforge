/**
 * @fileoverview Disallow member access on values that are explicitly cast as any
 * @module rules/security/no-unsafe-member-access
 */

import type {
  RuleDefinition,
  RuleContext,
  RuleVisitor,
  SourceLocation,
} from '../../plugins/types.js'
import { extractRuleOptions } from '../../utils/options-helpers.js'

interface NoUnsafeMemberAccessOptions {
  readonly allowOptionalChaining?: boolean
}

function extractLocation(node: unknown): SourceLocation {
  const defaultLoc: SourceLocation = {
    start: { line: 1, column: 0 },
    end: { line: 1, column: 1 },
  }
  if (!node || typeof node !== 'object') return defaultLoc
  const n = node as Record<string, unknown>
  const loc = n.loc as Record<string, unknown> | undefined
  if (!loc) return defaultLoc
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

function isAnyAsExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  if (n.type !== 'TSAsExpression') return false
  const typeAnnotation = n.typeAnnotation as Record<string, unknown> | undefined
  return typeAnnotation?.type === 'TSAnyKeyword'
}

function hasAnyBase(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>

  // Direct TSAsExpression with any
  if (isAnyAsExpression(node)) return true

  // Nested MemberExpression - recurse on object
  if (n.type === 'MemberExpression') {
    return hasAnyBase(n.object)
  }

  return false
}

export const noUnsafeMemberAccessRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description: 'Disallow unsafe member access on values that are explicitly cast as any.',
      category: 'security',
      recommended: true,
    },
    schema: [],
    fixable: undefined,
  },
  create(context: RuleContext): RuleVisitor {
    const options = extractRuleOptions<NoUnsafeMemberAccessOptions>(context.config.options, {})
    const allowOptionalChaining = options.allowOptionalChaining ?? false

    return {
      MemberExpression(node: unknown): void {
        if (!node || typeof node !== 'object') return
        const n = node as Record<string, unknown>

        // Check if optional chaining and allowed
        if (allowOptionalChaining && n.optional === true) return

        // Check if the object (or its chain) is an `as any` cast
        const obj = n.object
        if (isAnyAsExpression(obj) || hasAnyBase(obj)) {
          context.report({
            message:
              'Unsafe member access on an any-typed value. Add proper type annotations instead of casting to any.',
            loc: extractLocation(node),
          })
        }
      },
    }
  },
}
export default noUnsafeMemberAccessRule
