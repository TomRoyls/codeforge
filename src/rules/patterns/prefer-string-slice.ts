import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { isCallExpression, isIdentifier, isMemberExpression, toASTNode } from '../../utils/ast-helpers.js'

function getMemberPropertyName(node: unknown): null | string {
  if (!isMemberExpression(node)) return null
  const property = toASTNode(toASTNode(node)?.property)
  if (!property || !isIdentifier(property)) return null
  return property.name ?? null
}

function isSubstringMethod(node: unknown): null | { methodName: string } {
  if (!isCallExpression(node)) return null

  const callee = toASTNode(toASTNode(node)?.callee)
  if (!isMemberExpression(callee)) return null

  const methodName = getMemberPropertyName(callee)
  if (methodName === 'substring' || methodName === 'substr') {
    return { methodName }
  }

  return null
}

export const preferStringSliceRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const substringInfo = isSubstringMethod(node)

        if (!substringInfo) return

        const location = extractLocation(node)

        context.report({
          loc: location,
          message: `Use .slice() instead of .${substringInfo.methodName}(). slice() is more consistent and supports negative indices for counting from the end of the string.`,
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
      url: 'https://codeforge.dev/docs/rules/prefer-string-slice',
    },
    fixable: undefined,
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default preferStringSliceRule
