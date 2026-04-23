import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'

function isCallExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'CallExpression'
}

function isRegExpConstructor(node: unknown): boolean {
  if (!isCallExpression(node)) return false
  const n = node as Record<string, unknown>
  const { callee } = n
  if (!callee || typeof callee !== 'object') return false
  const c = callee as Record<string, unknown>
  if (c.type === 'Identifier' && c.name === 'RegExp') return true
  return false
}

function isLiteral(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'Literal'
}

function isValidRegex(pattern: string, flags?: string): { error?: string; valid: boolean } {
  try {
    // eslint-disable-next-line no-new
    new RegExp(pattern, flags || '')
    return { valid: true }
  } catch (error) {
    return { error: String(error), valid: false }
  }
}

export const noInvalidRegexpRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        if (!isRegExpConstructor(node)) return
        const n = node as Record<string, unknown>
        const args = n.arguments
        if (!Array.isArray(args) || args.length === 0) return

        const patternArg = args[0]
        const flagsArg = args[1]

        if (isLiteral(patternArg)) {
          const p = patternArg as Record<string, unknown>
          const pattern = p.value as string
          let flags: string | undefined

          if (flagsArg && isLiteral(flagsArg)) {
            const f = flagsArg as Record<string, unknown>
            flags = f.value as string
          }

          if (typeof pattern === 'string') {
            const result = isValidRegex(pattern, flags)
            if (!result.valid) {
              context.report({
                loc: extractLocation(node),
                message: `Invalid regular expression: ${result.error}`,
              })
            }
          }
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow invalid regular expression strings in RegExp constructors.',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noInvalidRegexpRule
