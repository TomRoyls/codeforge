import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function hasTerminatingStatement(statements: undefined | unknown[]): boolean {
  if (!statements || statements.length === 0) return false
  const last = statements.at(-1)
  const s = toASTNode(last)
  if (!s) return false
  return ['BreakStatement', 'ContinueStatement', 'ReturnStatement', 'ThrowStatement'].includes(s.type ?? '')
}

export const noFallthroughRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      SwitchStatement(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'SwitchStatement') return
        const cases = n.cases as unknown[] | undefined
        if (!cases || cases.length === 0) return

        // Check all cases EXCEPT the last one (last case has nothing to fall through to)
        for (let i = 0; i < cases.length - 1; i++) {
          const c = toASTNode(cases[i])
          if (!c || c.type !== 'SwitchCase') continue
          const consequent = c.consequent as undefined | unknown[]
          if (!consequent || consequent.length === 0) continue // empty case = intentional fallthrough
          if (!hasTerminatingStatement(consequent)) {
            context.report({
              loc: extractLocation(cases[i]),
              message: 'Expected a break statement before fallthrough.',
            })
          }
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow fallthrough in switch statements.',
      recommended: true,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/src/rules/patterns/no-fallthrough.ts',
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noFallthroughRule
