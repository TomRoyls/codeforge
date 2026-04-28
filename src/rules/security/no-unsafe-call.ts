/**
 * @file Disallow calling values that are explicitly cast as any
 * @module rules/security/no-unsafe-call
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function isAnyAsExpression(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) return false
  if (n.type !== 'TSAsExpression') return false
  const typeAnnotation = toASTNode(n.typeAnnotation)
  return typeAnnotation?.type === 'TSAnyKeyword'
}

function isUnsafeCallee(callee: unknown): boolean {
  const c = toASTNode(callee)
  if (!c) return false

  if (isAnyAsExpression(callee)) return true

  if (c.type === 'MemberExpression') {
    return isAnyAsExpression(c.object)
  }

  return false
}

export const noUnsafeCallRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n) return

        if (isUnsafeCallee(n.callee)) {
          context.report({
            loc: extractLocation(node),
            message:
              'Unsafe call on an any-typed value. Add proper type annotations instead of casting to any.',
          })
        }
      },
      NewExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n) return

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
