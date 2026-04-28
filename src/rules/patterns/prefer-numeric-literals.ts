import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { getArguments, isCallExpression, toASTNode } from '../../utils/ast-helpers.js'

function isParseIntCall(node: unknown): boolean {
  if (!isCallExpression(node)) return false
  const callee = toASTNode(toASTNode(node)?.callee)
  if (callee?.type !== 'Identifier') return false
  return callee.name === 'parseInt'
}

function getLiteralNumberValue(node: unknown): number | undefined {
  const n = toASTNode(node)
  if (n?.type === 'Literal' && typeof n.value === 'number') return n.value
  return undefined
}

function getStringLiteralValue(node: unknown): string | undefined {
  const n = toASTNode(node)
  if (n?.type === 'Literal' && typeof n.value === 'string') return n.value
  return undefined
}

function getPrefixForRadix(radix: number): string | undefined {
  switch (radix) {
    case 2: {
      return '0b'
    }

    case 8: {
      return '0o'
    }

    case 16: {
      return '0x'
    }

    default: {
      return undefined
    }
  }
}

export const preferNumericLiteralsRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        if (!isParseIntCall(node)) return

        const args = getArguments(node)
        if (args.length !== 2) return

        const strValue = getStringLiteralValue(args[0])
        if (strValue === undefined) return

        const radix = getLiteralNumberValue(args[1])
        if (radix === undefined || !Number.isInteger(radix)) return

        const prefix = getPrefixForRadix(radix)
        if (!prefix) return

        const location = extractLocation(node)
        const range = toASTNode(node)?.range
        const fixed = `${prefix}${strValue}`

        context.report({
          fix: range ? { range, text: fixed } : undefined,
          loc: location,
          message: `Use ${prefix}... literal instead of parseInt with radix ${radix}.`,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Prefer numeric literals over parseInt with specific radix values. Use 0b... for binary (radix 2), 0o... for octal (radix 8), or 0x... for hexadecimal (radix 16).',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/prefer-numeric-literals',
    },
    fixable: 'code',
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default preferNumericLiteralsRule
