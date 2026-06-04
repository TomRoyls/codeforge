import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function isArgumentsCalleeOrCaller(node: unknown): boolean {
  const n = toASTNode(node)
  if (n?.type !== 'MemberExpression') return false

  const obj = toASTNode(n.object)
  if (!obj || obj.type !== 'Identifier' || obj.name !== 'arguments') return false

  const prop = toASTNode(n.property)
  if (!prop) return false

  if (n.computed === true) {
    if (prop.type === 'Literal' && (prop.value === 'callee' || prop.value === 'caller')) return true
    return false
  }

  return prop.type === 'Identifier' && (prop.name === 'callee' || prop.name === 'caller')
}

export const noCallerRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      MemberExpression(node: unknown): void {
        if (isArgumentsCalleeOrCaller(node)) {
          const location = extractLocation(node)

          context.report({
            loc: location,
            message: 'Avoid arguments.caller and arguments.callee.',
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'security',
      description:
        'Disallow the use of arguments.caller and arguments.callee. These are non-standard, deprecated, and pose security risks by exposing call stacks.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-caller',
    },
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}

export default noCallerRule
