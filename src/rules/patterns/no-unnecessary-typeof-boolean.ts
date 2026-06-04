import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryTypeofBooleanRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      BinaryExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'BinaryExpression') return

        const nn = n as Record<string, unknown>
        const op = nn.operator
        if (op !== '===' && op !== '!==') return

        const left = nn.left
        const right = nn.right
        if (!left || !right || typeof left !== 'object' || typeof right !== 'object') return

        const leftNode = toASTNode(left) as Record<string, unknown>
        const rightNode = toASTNode(right) as Record<string, unknown>
        if (!leftNode || !rightNode) return

        if (
          leftNode.type === 'UnaryExpression' &&
          (leftNode as Record<string, unknown>).operator === 'typeof' &&
          (rightNode.type === 'StringLiteral' ||
            (rightNode.type === 'Literal' && typeof (rightNode as Record<string, unknown>).value === 'string')) &&
          (rightNode as Record<string, unknown>).value === 'boolean'
        ) {
          const argument = (leftNode as Record<string, unknown>).argument
          if (argument && typeof argument === 'object') {
            const argNode = toASTNode(argument) as Record<string, unknown>
            if (argNode && (argNode.type === 'BooleanLiteral' || argNode.type === 'UnaryExpression')) {
              context.report({
                loc: extractLocation(n),
                message:
                  'Unnecessary typeof check on a boolean value. typeof of a boolean is always "boolean".',
                node: n,
              })
              return
            }
          }
        }

        if (
          rightNode.type === 'UnaryExpression' &&
          (rightNode as Record<string, unknown>).operator === 'typeof' &&
          (leftNode.type === 'StringLiteral' ||
            (leftNode.type === 'Literal' && typeof (leftNode as Record<string, unknown>).value === 'string')) &&
          (leftNode as Record<string, unknown>).value === 'boolean'
        ) {
          const argument = (rightNode as Record<string, unknown>).argument
          if (argument && typeof argument === 'object') {
            const argNode = toASTNode(argument) as Record<string, unknown>
            if (argNode && (argNode.type === 'BooleanLiteral' || argNode.type === 'UnaryExpression')) {
              context.report({
                loc: extractLocation(n),
                message:
                  'Unnecessary typeof check on a boolean value. typeof of a boolean is always "boolean".',
                node: n,
              })
              return
            }
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow typeof === "boolean" checks on boolean values, which are always true.',
      recommended: false,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-typeof-boolean.md',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryTypeofBooleanRule
