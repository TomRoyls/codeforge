/**
 * @file Disallow member access on values that are explicitly cast as any
 * @module rules/security/no-unsafe-member-access
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'
import { extractRuleOptions } from '../../utils/options-helpers.js'

interface NoUnsafeMemberAccessOptions {
  readonly allowOptionalChaining?: boolean
}

function isAnyAsExpression(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) return false
  if (n.type !== 'TSAsExpression') return false
  const typeAnnotation = toASTNode(n.typeAnnotation)
  return typeAnnotation?.type === 'TSAnyKeyword'
}

function hasAnyBase(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) return false

  if (isAnyAsExpression(node)) return true

  if (n.type === 'MemberExpression') {
    return hasAnyBase(n.object)
  }

  return false
}

export const noUnsafeMemberAccessRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const options = extractRuleOptions<NoUnsafeMemberAccessOptions>(context.config.options, {})
    const allowOptionalChaining = options.allowOptionalChaining ?? false

    return {
      MemberExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n) return

        if (allowOptionalChaining && n.optional === true) return

        const obj = n.object
        if (isAnyAsExpression(obj) || hasAnyBase(obj)) {
          context.report({
            loc: extractLocation(node),
            message:
              'Unsafe member access on an any-typed value. Add proper type annotations instead of casting to any.',
          })
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'security',
      description: 'Disallow unsafe member access on values that are explicitly cast as any.',
      recommended: true,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/src/rules/security/no-unsafe-member-access.ts',
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noUnsafeMemberAccessRule
