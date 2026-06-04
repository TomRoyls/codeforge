/**
 * @module rules/patterns/no-lone-blocks
 * Disallows unnecessary nested blocks.
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noLoneBlocksRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      BlockStatement(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'BlockStatement') return

        const parent = (n as { parent?: unknown }).parent
        if (!parent || typeof parent !== 'object') return

        const parentNode = parent as Record<string, unknown>
        if (
          parentNode.type === 'FunctionDeclaration' ||
          parentNode.type === 'FunctionExpression' ||
          parentNode.type === 'ArrowFunctionExpression' ||
          parentNode.type === 'MethodDefinition' ||
          parentNode.type === 'CatchClause' ||
          parentNode.type === 'TryStatement' ||
          parentNode.type === 'IfStatement' ||
          parentNode.type === 'WhileStatement' ||
          parentNode.type === 'ForStatement' ||
          parentNode.type === 'ForInStatement' ||
          parentNode.type === 'ForOfStatement' ||
          parentNode.type === 'SwitchStatement' ||
          parentNode.type === 'ClassBody'
        ) return

        const body = (n as { body?: unknown }).body
        if (Array.isArray(body) && body.length > 0) return

        context.report({
          loc: extractLocation(n),
          message: 'Empty block statement. Remove or add content.',
          node: n,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow empty nested blocks',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-lone-blocks',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noLoneBlocksRule
