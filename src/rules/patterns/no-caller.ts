import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'

function isCallerAccess(node: unknown): boolean {
  if (typeof node !== 'object' || node === null) {
    return false
  }

  const n = node as Record<string, unknown>

  if (n.type !== 'MemberExpression') {
    return false
  }

  const obj = n.object as Record<string, unknown> | undefined
  const prop = n.property as Record<string, unknown> | undefined

  if (!obj || !prop) {
    return false
  }

  if (obj.type !== 'Identifier' || prop.type !== 'Identifier') {
    return false
  }

  return obj.name === 'arguments' && prop.name === 'caller'
}

function isArgumentsCallee(node: unknown): boolean {
  if (typeof node !== 'object' || node === null) {
    return false
  }

  const n = node as Record<string, unknown>

  if (n.type !== 'MemberExpression') {
    return false
  }

  const obj = n.object as Record<string, unknown> | undefined

  if (!obj || obj.type !== 'Identifier') {
    return false
  }

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
