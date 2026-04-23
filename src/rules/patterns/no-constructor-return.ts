import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'

function isConstructorWithReturn(node: unknown): boolean {
  if (typeof node !== 'object' || node === null) {
    return false
  }

  const n = node as Record<string, unknown>

  if (n.type !== 'MethodDefinition' && n.type !== 'PropertyDefinition') {
    return false
  }

  const kind = n.kind as string | undefined
  if (kind !== 'constructor') {
    return false
  }

  const body = n.body as Record<string, unknown> | undefined
  if (!body || body.type !== 'BlockStatement') {
    return false
  }

  const statements = body.body as unknown[]
  if (!Array.isArray(statements)) {
    return false
  }

  return statements.some((stmt) => {
    if (typeof stmt !== 'object' || stmt === null) {
      return false
    }

    return (stmt as Record<string, unknown>).type === 'ReturnStatement'
  })
}

export const noConstructorReturnRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      MethodDefinition(node: unknown): void {
        if (isConstructorWithReturn(node)) {
          const location = extractLocation(node)
          context.report({
            loc: location,
            message: 'Unexpected return in constructor.',
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow returning values from constructors. Constructors should only initialize the object, not return values.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-constructor-return',
    },
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}

export default noConstructorReturnRule
