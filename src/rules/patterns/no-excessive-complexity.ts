import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

const BRANCHING_TYPES = new Set([
  'IfStatement',
  'ForStatement',
  'ForInStatement',
  'ForOfStatement',
  'WhileStatement',
  'DoWhileStatement',
  'SwitchCase',
  'CatchClause',
  'ConditionalExpression',
  'LogicalExpression',
])

export const noExcessiveComplexityRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      FunctionDeclaration(node: unknown): void {
        checkComplexity(node, context)
      },
      FunctionExpression(node: unknown): void {
        checkComplexity(node, context)
      },
      ArrowFunctionExpression(node: unknown): void {
        checkComplexity(node, context)
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow functions with excessive cyclomatic complexity',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-excessive-complexity',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

function checkComplexity(node: unknown, context: RuleContext): void {
  const n = toASTNode(node)
  if (!n) return

  const complexity = countBranches(n, 0)
  if (complexity > 10) {
    context.report({
      loc: extractLocation(n),
      message: `Function has a complexity of ${complexity}. Maximum allowed is 10.`,
      node: n,
    })
  }
}

function countBranches(node: unknown, depth: number): number {
  if (depth > 50) return 0
  if (!node || typeof node !== 'object') return 0

  const n = node as Record<string, unknown>
  let count = 0

  if (n.type && typeof n.type === 'string' && BRANCHING_TYPES.has(n.type as string)) {
    count = 1
  }

  for (const value of Object.values(n)) {
    if (value && typeof value === 'object') {
      if (Array.isArray(value)) {
        for (const item of value) {
          count += countBranches(item, depth + 1)
        }
      } else {
        count += countBranches(value, depth + 1)
      }
    }
  }

  return count
}

export default noExcessiveComplexityRule
