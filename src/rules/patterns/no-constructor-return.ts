import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function isConstructorWithReturn(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) return false
  if (n.type !== 'MethodDefinition' && n.type !== 'PropertyDefinition') return false

  const kind = n.kind as string | undefined
  if (kind !== 'constructor') return false

  const body = toASTNode(n.body)
  if (!body || body.type !== 'BlockStatement') return false

  const statements = body.body as unknown[]
  if (!Array.isArray(statements)) return false

  return statements.some((stmt) => toASTNode(stmt)?.type === 'ReturnStatement')
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
