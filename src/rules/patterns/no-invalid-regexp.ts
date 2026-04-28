import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { isCallExpression, isLiteral, toASTNode } from '../../utils/ast-helpers.js'

function isRegExpConstructor(node: unknown): boolean {
  if (!isCallExpression(node)) return false
  const n = toASTNode(node)
  if (!n) return false
  const callee = toASTNode(n.callee)
  return callee?.type === 'Identifier' && callee.name === 'RegExp'
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
        const n = toASTNode(node)
        if (!n) return

        const args = n.arguments
        if (!Array.isArray(args) || args.length === 0) return

        const patternArg = args[0]
        const flagsArg = args[1]

        if (isLiteral(patternArg)) {
          const p = toASTNode(patternArg)
          if (!p) return
          const pattern = p.value
          let flags: string | undefined

          if (flagsArg && isLiteral(flagsArg)) {
            const f = toASTNode(flagsArg)
            if (f) {
              flags = f.value as string
            }
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
