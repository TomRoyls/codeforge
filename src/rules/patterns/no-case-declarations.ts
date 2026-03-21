import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'
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
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description: 'Disallow lexical declarations in switch case clauses without blocks.',
      category: 'patterns',
      recommended: true,
    },
    schema: [],
    fixable: undefined,
  },
  create(context: RuleContext): RuleVisitor {
    return {
      SwitchCase(node: unknown): void {
        if (!isSwitchCase(node)) return
        const n = node as Record<string, unknown>
        const consequent = n.consequent as unknown[] | undefined
        if (!consequent) return
        for (const stmt of consequent) {
          if (isLexicalDeclaration(stmt) || isFunctionDeclaration(stmt)) {
            context.report({
              message: 'Unexpected lexical declaration in case clause. Wrap in a block.' + RULE_SUGGESTIONS.noCaseDeclarations,
              loc: extractLocation(stmt),
            })
          }
        }
      },
    }
  },
}
export default noCaseDeclarationsRule
