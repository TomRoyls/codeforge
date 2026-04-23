import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'

function isIfStatement(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  return n.type === 'IfStatement'
}

function isLonelyIfStatement(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>

  if (n.type === 'BlockStatement') {
    const body = n.body as unknown[]
    if (Array.isArray(body) && body.length === 1) {
      return isIfStatement(body[0])
    }
  }

  return n.type === 'IfStatement'
}

export const noLonelyIfRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      IfStatement(node: unknown): void {
        if (!node || typeof node !== 'object') {
          return
        }

        const n = node as Record<string, unknown>
        const {alternate} = n

        if (!alternate) {
          return
        }

        if (isLonelyIfStatement(alternate)) {
          const location = extractLocation(alternate)
          context.report({
            loc: location,
            message: "Unexpected if as the only statement in an else block. Use 'else if' instead.",
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'style',
      description:
        "Disallow if statements as the only statement in an else block. Use 'else if' instead for better readability.",
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-lonely-if',
    },
    fixable: 'code',
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noLonelyIfRule
