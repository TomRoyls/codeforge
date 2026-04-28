import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function isCallerAccess(node: unknown): boolean {
  const n = toASTNode(node)
  if (n?.type !== 'MemberExpression') return false

  const obj = toASTNode(n.object)
  const prop = toASTNode(n.property)
  if (!obj || !prop) return false

  return obj.type === 'Identifier' && obj.name === 'arguments' && prop.type === 'Identifier' && prop.name === 'caller'
}

function isArgumentsCallee(node: unknown): boolean {
  const n = toASTNode(node)
  if (n?.type !== 'MemberExpression') return false

  const obj = toASTNode(n.object)
  if (!obj || obj.type !== 'Identifier') return false

  return obj.name === 'arguments' && n.computed === true
}

export const noCallerRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      MemberExpression(node: unknown): void {
        if (isCallerAccess(node) || isArgumentsCallee(node)) {
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
