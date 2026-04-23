import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { isIdentifier } from '../../utils/ast-helpers.js'

const WRAPPER_TYPES = new Set(['BigInt', 'Boolean', 'Number', 'String', 'Symbol'])

function isWrapperNewExpression(node: unknown): boolean {
  if (typeof node !== 'object' || node === null) {
    return false
  }

  const n = node as Record<string, unknown>
  const {type} = n

  if (type !== 'NewExpression') {
    return false
  }

  const callee = n.callee as unknown
  if (!isIdentifier(callee)) {
    return false
  }

  const name = (callee as Record<string, unknown>).name as string
  return WRAPPER_TYPES.has(name)
}

export const noNewWrappersRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      NewExpression(node: unknown): void {
        if (!isWrapperNewExpression(node)) {
          return
        }

        const n = node as Record<string, unknown>
        const callee = n.callee as Record<string, unknown>
        const wrapperName = callee.name as string

        const location = extractLocation(node)

        context.report({
          loc: location,
          message: `Do not use new ${wrapperName}(). Use ${wrapperName.toLowerCase()}() or a literal instead.`,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow new String(), new Number(), new Boolean(), new Symbol(), and new BigInt(). These create object wrappers instead of primitives, which can lead to unexpected behavior.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-new-wrappers',
    },
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}

export default noNewWrappersRule
