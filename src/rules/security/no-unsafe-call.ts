/**
 * @file Disallow calling values that are explicitly cast as any
 * @module rules/security/no-unsafe-call
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
  SourceLocation,
} from '../../plugins/types.js'

function extractLocation(node: unknown): SourceLocation {
  const defaultLoc: SourceLocation = {
    end: { column: 1, line: 1 },
    start: { column: 0, line: 1 },
  }
  if (!node || typeof node !== 'object') return defaultLoc
  const n = node as Record<string, unknown>
  const loc = n.loc as Record<string, unknown> | undefined
  if (!loc) return defaultLoc
  const start = loc.start as Record<string, unknown> | undefined
  const end = loc.end as Record<string, unknown> | undefined
  return {
    end: {
      column: typeof end?.column === 'number' ? end.column : 0,
      line: typeof end?.line === 'number' ? end.line : 1,
    },
    start: {
      column: typeof start?.column === 'number' ? start.column : 0,
      line: typeof start?.line === 'number' ? start.line : 1,
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

function isUnsafeCallee(callee: unknown): boolean {
  if (!callee || typeof callee !== 'object') return false
  const c = callee as Record<string, unknown>

  // Direct: (x as any)()
  if (isAnyAsExpression(callee)) return true

  // Method: (x as any).method()
  if (c.type === 'MemberExpression') {
    return isAnyAsExpression(c.object)
  }

  return false
}

export const noUnsafeCallRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        if (!node || typeof node !== 'object') return
        const n = node as Record<string, unknown>

        if (isUnsafeCallee(n.callee)) {
          context.report({
            loc: extractLocation(node),
            message:
              'Unsafe call on an any-typed value. Add proper type annotations instead of casting to any.',
          })
        }
      },
      NewExpression(node: unknown): void {
        if (!node || typeof node !== 'object') return
        const n = node as Record<string, unknown>

        if (isUnsafeCallee(n.callee)) {
          context.report({
            loc: extractLocation(node),
            message:
              'Unsafe call on an any-typed value. Add proper type annotations instead of casting to any.',
          })
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'security',
      description: 'Disallow unsafe calls on values that are explicitly cast as any.',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noUnsafeCallRule
