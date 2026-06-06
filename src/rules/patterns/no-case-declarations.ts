import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'
import { RULE_SUGGESTIONS } from '../../utils/suggestions.js'

function isLexicalDeclaration(node: unknown): boolean {
  const n = toASTNode(node)
  return n?.type === 'VariableDeclaration' && (n.kind === 'let' || n.kind === 'const')
}

function isFunctionDeclaration(node: unknown): boolean {
  return toASTNode(node)?.type === 'FunctionDeclaration'
}

export const noCaseDeclarationsRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      SwitchCase(node: unknown): void {
        const n = toASTNode(node)
        if (n?.type !== 'SwitchCase') return

        const consequent = n.consequent as undefined | unknown[]
        if (!consequent) return

        for (const stmt of consequent) {
          if (isLexicalDeclaration(stmt) || isFunctionDeclaration(stmt)) {
            context.report({
              loc: extractLocation(stmt),
              message: 'Unexpected lexical declaration in case clause. Wrap in a block.' + RULE_SUGGESTIONS.noCaseDeclarations,
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
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/src/rules/patterns/no-case-declarations.ts',
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noCaseDeclarationsRule
