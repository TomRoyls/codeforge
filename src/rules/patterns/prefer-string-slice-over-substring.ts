import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { isCallExpression, isIdentifier, isMemberExpression, toASTNode } from '../../utils/ast-helpers.js'

function getMemberPropertyName(node: unknown): null | string {
  if (!isMemberExpression(node)) return null
  const property = toASTNode(toASTNode(node)?.property)
  if (!property || !isIdentifier(property)) return null
  return property.name ?? null
}

function isSubstringCall(node: unknown): boolean {
  if (!isCallExpression(node)) return false
  const callee = toASTNode(toASTNode(node)?.callee)
  if (!isMemberExpression(callee)) return false
  return getMemberPropertyName(callee) === 'substring'
}

function isSubstrCall(node: unknown): boolean {
  if (!isCallExpression(node)) return false
  const callee = toASTNode(toASTNode(node)?.callee)
  if (!isMemberExpression(callee)) return false
  return getMemberPropertyName(callee) === 'substr'
}

export const preferStringSliceOverSubstringRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        if (!isSubstringCall(node) && !isSubstrCall(node)) {
          return
        }

        const location = extractLocation(node)

        context.report({
          loc: location,
          message:
            'Use .slice() instead of .substring() or .substr(). slice() is more consistent and supports negative indices.',
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Prefer String.slice() over substring() and substr(). slice() is more consistent and supports negative indices for counting from the end of the string.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/prefer-string-slice-over-substring',
    },
    fixable: undefined,
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default preferStringSliceOverSubstringRule
