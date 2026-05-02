import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryTypeofNumberRule: RuleDefinition = {
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
          rightNode.type === 'StringLiteral' &&
          (rightNode as Record<string, unknown>).value === 'number'
        ) {
          const argument = (leftNode as Record<string, unknown>).argument
          if (argument && typeof argument === 'object') {
            const argNode = toASTNode(argument) as Record<string, unknown>
            if (argNode && isNumericLiteral(argNode)) {
              context.report({
                loc: extractLocation(n),
                message:
                  'Unnecessary typeof check on a numeric literal. typeof of a number literal is always "number".',
                node: n,
              })
              return
            }
          }
        }

        if (
          rightNode.type === 'UnaryExpression' &&
          (rightNode as Record<string, unknown>).operator === 'typeof' &&
          leftNode.type === 'StringLiteral' &&
          (leftNode as Record<string, unknown>).value === 'number'
        ) {
          const argument = (rightNode as Record<string, unknown>).argument
          if (argument && typeof argument === 'object') {
            const argNode = toASTNode(argument) as Record<string, unknown>
            if (argNode && isNumericLiteral(argNode)) {
              context.report({
                loc: extractLocation(n),
                message:
                  'Unnecessary typeof check on a numeric literal. typeof of a number literal is always "number".',
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
        'Disallow typeof === "number" checks on numeric literal values, which are always true.',
      recommended: false,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-typeof-number.md',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

function isNumericLiteral(node: Record<string, unknown>): boolean {
  return node.type === 'NumericLiteral' || node.type === 'BigIntLiteral'
}

export default noUnnecessaryTypeofNumberRule
