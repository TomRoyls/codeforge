import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

function isParseIntCall(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>

  if (n.type !== 'CallExpression') {
    return false
  }

  const callee = n.callee as Record<string, unknown> | undefined
  if (!callee || callee.type !== 'Identifier') {
    return false
  }

  return callee.name === 'parseInt'
}

function getLiteralNumberValue(node: unknown): number | undefined {
  if (!node || typeof node !== 'object') {
    return undefined
  }

  const n = node as Record<string, unknown>

  if (n.type === 'Literal' && typeof n.value === 'number') {
    return n.value
  }

  return undefined
}

function getStringLiteralValue(node: unknown): string | undefined {
  if (!node || typeof node !== 'object') {
    return undefined
  }

  const n = node as Record<string, unknown>

  if (n.type === 'Literal' && typeof n.value === 'string') {
    return n.value
  }

  return undefined
}

function getPrefixForRadix(radix: number): string | undefined {
  switch (radix) {
    case 2:
      return '0b'
    case 8:
      return '0o'
    case 16:
      return '0x'
    default:
      return undefined
  }
}

export const preferNumericLiteralsRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Prefer numeric literals over parseInt with specific radix values. Use 0b... for binary (radix 2), 0o... for octal (radix 8), or 0x... for hexadecimal (radix 16).',
      category: 'patterns',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/prefer-numeric-literals',
    },
    schema: [],
    fixable: 'code',
  },

  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        if (!isParseIntCall(node)) {
          return
        }

        const n = node as Record<string, unknown>
        const args = n.arguments as unknown[] | undefined

        if (!args || args.length !== 2) {
          return
        }

        const strValue = getStringLiteralValue(args[0])
        if (strValue === undefined) {
          return
        }

        const radix = getLiteralNumberValue(args[1])
        if (radix === undefined || !Number.isInteger(radix)) {
          return
        }

        const prefix = getPrefixForRadix(radix)
        if (!prefix) {
          return
        }

        const location = extractLocation(node)
        const range = n.range as [number, number] | undefined
        const fixed = `${prefix}${strValue}`

        context.report({
          message: `Use ${prefix}... literal instead of parseInt with radix ${radix}.`,
          loc: location,
          fix: range ? { range, text: fixed } : undefined,
        })
      },
    }
  },
}

export default preferNumericLiteralsRule
