import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { RULE_SUGGESTIONS } from '../../utils/suggestions.js'

function isArrayExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  return (node as Record<string, unknown>).type === 'ArrayExpression'
}

function isSpreadElement(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  return (node as Record<string, unknown>).type === 'SpreadElement'
}

function isIdentifier(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  return (node as Record<string, unknown>).type === 'Identifier'
}

function getIdentifierName(node: unknown): null | string {
  if (!isIdentifier(node)) {
    return null
  }

  return (node as Record<string, unknown>).name as string
}

export const noArrayDestructuringRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      ArrayExpression(node: unknown): void {
        if (!isArrayExpression(node)) {
          return
        }

        const n = node as Record<string, unknown>
        const elements = n.elements as undefined | unknown[]

        if (!elements || elements.length === 0) {
          return
        }

        for (const element of elements) {
          if (!isSpreadElement(element)) {
            continue
          }

          const spreadEl = element as Record<string, unknown>
          const argument = spreadEl.argument as unknown

          if (!argument) {
            continue
          }

          const location = extractLocation(element)
          const argName = getIdentifierName(argument)
          const displayName = argName ?? 'array'

          context.report({
            loc: location,
            message:
              `Avoid spreading '${displayName}' in array literal. For large arrays, use ${displayName}.concat() or ${displayName}.slice() instead of [...${displayName}] for better performance.` +
              RULE_SUGGESTIONS.noArrayDestructuring,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'performance',
      description:
        'Avoid spread operator on arrays in array literals for better performance with large arrays. Use arr.concat() or arr.slice() instead of [...arr] for copying arrays.',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-array-destructuring',
    },
    fixable: undefined,
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noArrayDestructuringRule
