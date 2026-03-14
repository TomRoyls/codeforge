import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import {
  extractLocation,
  isCallExpression,
  isMemberExpression,
  isIdentifier,
} from '../../utils/ast-helpers.js'

function getMemberProperty(node: unknown): string | null {
  if (!isMemberExpression(node)) {
    return null
  }

  const n = node as Record<string, unknown>
  const property = n.property as Record<string, unknown> | undefined

  if (!property || !isIdentifier(property)) {
    return null
  }

  return (property as Record<string, unknown>).name as string
}

function isSubstringMethod(node: unknown): { callee: unknown; methodName: string } | null {
  if (!isCallExpression(node)) {
    return null
  }

  const n = node as Record<string, unknown>
  const callee = n.callee as unknown

  if (!isMemberExpression(callee)) {
    return null
  }

  const methodName = getMemberProperty(callee)

  if (methodName === 'substring' || methodName === 'substr') {
    return { callee, methodName }
  }

  return null
}

export const preferStringSliceRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Prefer String.slice() over substring() and substr(). slice() is more consistent and supports negative indices for counting from the end of the string.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/prefer-string-slice',
    },
    schema: [],
    fixable: undefined,
  },

  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const substringInfo = isSubstringMethod(node)

        if (!substringInfo) {
          return
        }

        const location = extractLocation(node)

        context.report({
          message: `Use .slice() instead of .${substringInfo.methodName}(). slice() is more consistent and supports negative indices for counting from the end of the string.`,
          loc: location,
        })
      },
    }
  },
}

export default preferStringSliceRule
