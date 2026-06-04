/**
 * @module rules/patterns/no-inner-declarations
 * Disallows variable or function declarations in nested blocks.
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

const BLOCK_PARENTS = new Set([
  'BlockStatement',
  'SwitchCase',
  'IfStatement',
  'ForStatement',
  'ForInStatement',
  'ForOfStatement',
  'WhileStatement',
  'DoWhileStatement',
  'TryStatement',
  'CatchClause',
  'WithStatement',
])

export const noInnerDeclarationsRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      FunctionDeclaration(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'FunctionDeclaration') return

        const parent = (n as { parent?: unknown }).parent
        const parentNode = toASTNode(parent)
        if (!parentNode) return

        if (BLOCK_PARENTS.has(parentNode.type as string)) {
          context.report({
            loc: extractLocation(n),
            message: 'Move function declaration to program root.',
            node: n,
          })
        }
      },
      VariableDeclaration(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'VariableDeclaration') return

        const kind = (n as { kind?: unknown }).kind
        if (kind !== 'var') return

        const parent = (n as { parent?: unknown }).parent
        const parentNode = toASTNode(parent)
        if (!parentNode) return

        if (BLOCK_PARENTS.has(parentNode.type as string)) {
          context.report({
            loc: extractLocation(n),
            message: 'Move variable declaration to program root.',
            node: n,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow variable or function declarations in nested blocks',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-inner-declarations',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noInnerDeclarationsRule
