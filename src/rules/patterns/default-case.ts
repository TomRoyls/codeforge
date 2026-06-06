import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function hasDefaultCase(cases: undefined | unknown[]): boolean {
  if (!cases) return false
  return cases.some((c) => {
    const caseNode = toASTNode(c)
    if (!caseNode) throw new Error('Invalid case node')
    return caseNode.test === null
  })
}

export const defaultCaseRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      SwitchStatement(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'SwitchStatement') return
        const cases = n.cases as undefined | unknown[]
        if (!hasDefaultCase(cases)) {
          context.report({
            loc: extractLocation(node),
            message: 'Expected a default case.',
          })
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Require default case in switch statements.',
      recommended: false,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/src/rules/patterns/default-case.ts',
    },
    fixable: undefined,
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}
export default defaultCaseRule
