import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function isEmptyCharacterClass(value: unknown): boolean {
  if (value instanceof RegExp) {
    return value.source.includes('[]')
  }

  if (typeof value === 'string') {
    const regexLiteralMatch = value.match(/^\/(.+)\/[gimsuvy]*$/)
    if (regexLiteralMatch && regexLiteralMatch[1]) {
      return regexLiteralMatch[1].includes('[]')
    }
  }

  return false
}

export const noEmptyCharacterClassRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      Literal(node: unknown): void {
        const n = toASTNode(node)
        if (!n) return

        if (isEmptyCharacterClass(n.value)) {
          context.report({
            loc: extractLocation(node),
            message: 'Empty character class in regular expression',
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'correctness',
      description: 'Disallow empty character classes in regular expressions',
      recommended: true,
    },
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}

export default noEmptyCharacterClassRule
