import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function conditionKey(node: unknown): string | null {
  if (!node || typeof node !== 'object') return null
  const n = node as Record<string, unknown>
  if (n.type === 'Identifier') return `id:${String(n.name)}`
  if (n.type === 'Literal') return `lit:${JSON.stringify(n.value)}`
  if (n.type === 'MemberExpression') {
    const obj = conditionKey(n.object)
    const prop = conditionKey(n.property)
    if (obj && prop) return `mem:${obj}.${prop}`
    return null
  }
  if (n.type === 'BinaryExpression') {
    const left = conditionKey(n.left)
    const right = conditionKey(n.right)
    const op = String(n.operator)
    if (left && right) return `bin:${left}${op}${right}`
    return null
  }
  if (n.type === 'CallExpression') {
    const callee = conditionKey(n.callee)
    if (callee) return `call:${callee}`
    return null
  }
  return null
}

export const noDuplicateConditionRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      IfStatement(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'IfStatement') return

        const test = (n as { test?: unknown }).test
        if (!test) return

        const conditions = new Map<string, { key: string; node: unknown }>()
        const firstKey = conditionKey(test)
        if (firstKey) {
          conditions.set(firstKey, { key: firstKey, node: test })
        }

        let current: unknown = (n as { alternate?: unknown }).alternate
        while (current) {
          const curr = current as Record<string, unknown>
          if (curr.type === 'IfStatement') {
            const altTest = curr.test
            if (altTest) {
              const altKey = conditionKey(altTest)
              if (altKey) {
                if (conditions.has(altKey)) {
                  context.report({
                    loc: extractLocation(altTest as Record<string, unknown>),
                    message: `Duplicate condition found in if-else chain. This branch will never be reached.`,
                    node: altTest as Record<string, unknown>,
                  })
                } else {
                  conditions.set(altKey, { key: altKey, node: altTest })
                }
              }
            }
            current = curr.alternate
          } else {
            break
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow duplicate conditions in if-else-if chains',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-duplicate-condition',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noDuplicateConditionRule
