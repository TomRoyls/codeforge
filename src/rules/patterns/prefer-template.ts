import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { getRange, isBinaryExpression } from '../../utils/ast-helpers.js'

function isStringLiteral(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  return n.type === 'Literal' && typeof n.value === 'string'
}

function isTemplateLiteral(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  return n.type === 'TemplateLiteral'
}

function hasStringConcatenation(node: unknown): boolean {
  if (!isBinaryExpression(node)) {
    return false
  }

  const n = node as Record<string, unknown>
  const operator = n.operator as string

  if (operator !== '+') {
    return false
  }

  const {left} = n
  const {right} = n

  const leftIsString = isStringLiteral(left) || isTemplateLiteral(left)
  const rightIsString = isStringLiteral(right) || isTemplateLiteral(right)

  if (leftIsString || rightIsString) {
    return true
  }

  const leftHasConcat = hasStringConcatenation(left)
  const rightHasConcat = hasStringConcatenation(right)

  return leftHasConcat || rightHasConcat
}

export const preferTemplateRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    function getNodeSource(node: unknown): string {
      if (!node || typeof node !== 'object') {
        return ''
      }

      const n = node as Record<string, unknown>
      const range = n.range as [number, number] | undefined
      if (!range) {
        return ''
      }

      const source = context.getSource()
      return source.slice(range[0], range[1])
    }

    function convertToTemplateLiteral(node: unknown): string {
      if (isStringLiteral(node)) {
        const n = node as Record<string, unknown>
        const value = n.value as string
        const escaped = value.replaceAll('`', '\\`').replaceAll('$', String.raw`\$`)
        return escaped
      }

      if (isTemplateLiteral(node)) {
        const source = getNodeSource(node)
        return source.slice(1, -1)
      }

      if (isBinaryExpression(node)) {
        const n = node as Record<string, unknown>
        const operator = n.operator as string
        if (operator !== '+') {
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
