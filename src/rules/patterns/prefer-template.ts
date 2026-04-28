import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { getRange, isBinaryExpression, isTemplateLiteral, toASTNode } from '../../utils/ast-helpers.js'

function isStringLiteral(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) return false

  return n.type === 'Literal' && typeof n.value === 'string'
}

function hasStringConcatenation(node: unknown): boolean {
  if (!isBinaryExpression(node)) {
    return false
  }

  const n = toASTNode(node)
  if (!n) return false

  if (n.operator !== '+') {
    return false
  }

  const leftIsString = isStringLiteral(n.left) || isTemplateLiteral(n.left)
  const rightIsString = isStringLiteral(n.right) || isTemplateLiteral(n.right)

  if (leftIsString || rightIsString) {
    return true
  }

  const leftHasConcat = hasStringConcatenation(n.left)
  const rightHasConcat = hasStringConcatenation(n.right)

  return leftHasConcat || rightHasConcat
}

export const preferTemplateRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    function getNodeSource(node: unknown): string {
      const n = toASTNode(node)
      if (!n?.range) {
        return ''
      }

      const source = context.getSource()
      return source.slice(n.range[0], n.range[1])
    }

    function convertToTemplateLiteral(node: unknown): string {
      if (isStringLiteral(node)) {
        const n = toASTNode(node)
        const value = n?.value as string
        const escaped = value.replaceAll('`', '\\`').replaceAll('$', String.raw`\$`)
        return escaped
      }

      if (isTemplateLiteral(node)) {
        const source = getNodeSource(node)
        return source.slice(1, -1)
      }

      if (isBinaryExpression(node)) {
        const n = toASTNode(node)
        if (n?.operator !== '+') {
          return getNodeSource(node)
        }

        const left = convertToTemplateLiteral(n.left)
        const right = convertToTemplateLiteral(n.right)
        return left + right
      }

      const source = getNodeSource(node)
      return source ? `\${${source}}` : ''
    }

    return {
      BinaryExpression(node: unknown): void {
        if (!isBinaryExpression(node)) {
          return
        }

        if (hasStringConcatenation(node)) {
          const location = extractLocation(node)
          const range = getRange(node)

          // Build fix only if range is available
          let fix: undefined | { range: [number, number]; text: string }
          if (range) {
            const templateContent = convertToTemplateLiteral(node)
            const fixed = `\`${templateContent}\``
            fix = { range, text: fixed }
          }

          context.report({
            fix,
            loc: location,
            message:
              'Prefer template literals over string concatenation. Use backticks (`value: ${x}`) instead of + operator ("value: " + x).',
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Prefer template literals over string concatenation. Use backticks (`Hello ${name}`) instead of + operator ("Hello " + name) for better readability.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/prefer-template',
    },
    fixable: 'code',
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default preferTemplateRule
