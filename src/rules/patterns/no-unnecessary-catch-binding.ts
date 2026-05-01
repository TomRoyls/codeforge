import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryCatchBindingRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CatchClause(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CatchClause') return

        const nn = n as Record<string, unknown>
        const param = nn.param

        if (param === null || param === undefined) return

        const body = nn.body
        if (!body || typeof body !== 'object') return

        const b = toASTNode(body)
        if (!b || b.type !== 'BlockStatement') return

        const bb = b as Record<string, unknown>
        const statements = bb.body as unknown[]
        if (!Array.isArray(statements)) return

        const paramName = getBindingName(param)
        if (paramName === null) return

        const isUsed = statements.some((stmt) => {
          return containsIdentifier(stmt, paramName)
        })

        if (!isUsed) {
          context.report({
            loc: extractLocation(toASTNode(param)!),
            message:
              'Unnecessary catch binding. Remove the parameter or use it.',
            node: toASTNode(param)!,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow unused catch clause bindings.',
      recommended: false,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-catch-binding.md',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

function getBindingName(param: unknown): string | null {
  const n = toASTNode(param)
  if (!n) return null
  const nn = n as Record<string, unknown>
  if (nn.type === 'Identifier') return nn.name as string
  return null
}

function containsIdentifier(node: unknown, name: string): boolean {
  const n = toASTNode(node)
  if (!n || typeof n !== 'object') return false

  const nn = n as Record<string, unknown>

  if (nn.type === 'Identifier' && nn.name === name) return true

  for (const value of Object.values(nn)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (containsIdentifier(item, name)) return true
      }
    } else if (value && typeof value === 'object') {
      if (containsIdentifier(value, name)) return true
    }
  }

  return false
}

export default noUnnecessaryCatchBindingRule
