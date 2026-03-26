import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

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
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description:
        'Disallow returning values from constructors. Constructors should only initialize the object, not return values.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-constructor-return',
    },
    schema: [],
  },

  create(context: RuleContext): RuleVisitor {
    return {
      MethodDefinition(node: unknown): void {
        if (isConstructorWithReturn(node)) {
          const location = extractLocation(node)
          context.report({
            message: 'Unexpected return in constructor.',
            loc: location,
          })
        }
      },
    }
  },
}

export default noConstructorReturnRule
