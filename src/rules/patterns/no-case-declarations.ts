import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { RULE_SUGGESTIONS } from '../../utils/suggestions.js'

function isSwitchCase(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'SwitchCase'
}

function isLexicalDeclaration(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'VariableDeclaration' && (n.kind === 'let' || n.kind === 'const')
}

function isFunctionDeclaration(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'FunctionDeclaration'
}

export const noCaseDeclarationsRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      SwitchCase(node: unknown): void {
        if (!isSwitchCase(node)) return
        const n = node as Record<string, unknown>
        const consequent = n.consequent as undefined | unknown[]
        if (!consequent) return
        for (const stmt of consequent) {
          if (isLexicalDeclaration(stmt) || isFunctionDeclaration(stmt)) {
            context.report({
              loc: extractLocation(stmt),
              message:
                'Unexpected lexical declaration in case clause. Wrap in a block.' +
                RULE_SUGGESTIONS.noCaseDeclarations,
            })
          }
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow lexical declarations in switch case clauses without blocks.',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noCaseDeclarationsRule
