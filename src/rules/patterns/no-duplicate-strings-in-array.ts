import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function getStringValue(element: unknown): null | string {
  const el = toASTNode(element)
  if (!el) return null

  if (el.type === 'Literal' && typeof el.value === 'string') {
    return el.value
  }

  if (el.type === 'TemplateLiteral') {
    const expressions = el.expressions as undefined | unknown[]
    if (expressions && expressions.length > 0) return null
    const quasis = el.quasis as undefined | unknown[]
    if (!quasis || quasis.length === 0) return null
    const firstQuasi = toASTNode(quasis[0])
    if (firstQuasi?.type === 'TemplateElement' && typeof firstQuasi.value === 'object' && firstQuasi.value !== null) {
      const {cooked} = (firstQuasi.value as Record<string, unknown>)
      if (typeof cooked === 'string') return cooked
    }
  }

  return null
}

export const noDuplicateStringsInArrayRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      ArrayExpression(node: unknown): void {
        const n = toASTNode(node)
        if (n?.type !== 'ArrayExpression') return

        const elements = n.elements as undefined | unknown[]
        if (!elements) return

        const seenStrings = new Map<string, unknown>()
        for (const element of elements) {
          const str = getStringValue(element)
          if (str === null) continue
          if (seenStrings.has(str)) {
            context.report({
              loc: extractLocation(element),
              message: `Duplicate string '${str}' in array. Remove the duplicate string or refactor the array.`,
            })
          } else {
            seenStrings.set(str, element)
          }
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow duplicate string literals in array expressions.',
      recommended: true,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/src/rules/patterns/no-duplicate-strings-in-array.ts',
    },
    fixable: undefined,
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}
export default noDuplicateStringsInArrayRule
