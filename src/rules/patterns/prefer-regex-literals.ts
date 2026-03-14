import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import {
  extractLocation,
  isNewExpression,
  isIdentifier,
  isLiteral,
} from '../../utils/ast-helpers.js'

function getLiteralValue(node: unknown): unknown {
  if (!isLiteral(node)) {
    return undefined
  }
  const n = node as Record<string, unknown>
  return n.value
}

function isTemplateLiteral(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }
  const n = node as Record<string, unknown>
  return n.type === 'TemplateLiteral' && !n.tag
}

function hasDynamicArguments(node: unknown): boolean {
  if (!isNewExpression(node)) {
    return false
  }

  const n = node as Record<string, unknown>
  const args = n.arguments as unknown[] | undefined

  if (!args || args.length === 0) {
    return false
  }

  for (const arg of args) {
    if (!isLiteral(arg) && !isTemplateLiteral(arg)) {
      return true
    }
  }

  return false
}

function getPatternInfo(node: unknown): { pattern: string; flags: string } | null {
  if (!isNewExpression(node)) {
    return null
  }

  const n = node as Record<string, unknown>
  const args = n.arguments as unknown[] | undefined

  if (!args || args.length === 0) {
    return { pattern: '', flags: '' }
  }

  const firstArg = args[0]

  if (!isLiteral(firstArg)) {
    return null
  }

  const pattern = getLiteralValue(firstArg)

  if (typeof pattern !== 'string') {
    return null
  }

  let flags = ''

  if (args.length >= 2) {
    const secondArg = args[1]
    if (isLiteral(secondArg)) {
      const flagsValue = getLiteralValue(secondArg)
      if (typeof flagsValue === 'string') {
        flags = flagsValue
      } else {
        return null
      }
    } else {
      return null
    }
  }

  return { pattern, flags }
}

function needsEscape(str: string): boolean {
  return str.includes('/') || str.includes('\\n') || str.includes('\\r')
}

export const preferRegexLiteralsRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Prefer regex literals over RegExp constructor. Regex literals are more readable and performant. Only use new RegExp() when the pattern is dynamic.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/prefer-regex-literals',
    },
    schema: [],
    fixable: undefined,
  },

  create(context: RuleContext): RuleVisitor {
    return {
      NewExpression(node: unknown): void {
        if (!isNewExpression(node)) {
          return
        }

        const n = node as Record<string, unknown>
        const callee = n.callee as Record<string, unknown> | undefined

        if (!callee || !isIdentifier(callee, 'RegExp')) {
          return
        }

        if (hasDynamicArguments(node)) {
          return
        }

        const location = extractLocation(node)
        const patternInfo = getPatternInfo(node)

        if (!patternInfo) {
          return
        }

        const { pattern, flags } = patternInfo

        if (needsEscape(pattern)) {
          context.report({
            message: `Use regex literal /${pattern}/${flags} instead of new RegExp("${pattern}"${flags ? `, "${flags}"` : ''}).`,
            loc: location,
          })
        } else if (pattern === '' && flags === '') {
          context.report({
            message:
              'Use regex literal /(?:)/ instead of new RegExp() for an empty pattern, or use a more specific pattern.',
            loc: location,
          })
        } else {
          context.report({
            message: `Use regex literal /${pattern}/${flags} instead of new RegExp("${pattern}"${flags ? `, "${flags}"` : ''}).`,
            loc: location,
          })
        }
      },
    }
  },
}

export default preferRegexLiteralsRule
