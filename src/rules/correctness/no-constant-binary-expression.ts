/**
 * @fileoverview Disallow constant binary expressions in conditionals
 * @module rules/correctness/no-constant-binary-expression
 */

import type {
  RuleDefinition,
  RuleContext,
  RuleVisitor,
  SourceLocation,
} from '../../plugins/types.js'

function extractLocation(node: unknown): SourceLocation {
  const defaultLoc: SourceLocation = {
    start: { line: 1, column: 0 },
    end: { line: 1, column: 1 },
  }

  if (!node || typeof node !== 'object') {
    return defaultLoc
  }

  const n = node as Record<string, unknown>
  const loc = n.loc as Record<string, unknown> | undefined

  if (!loc) {
    return defaultLoc
  }

  const start = loc.start as Record<string, unknown> | undefined
  const end = loc.end as Record<string, unknown> | undefined

  return {
    start: {
      line: typeof start?.line === 'number' ? start.line : 1,
      column: typeof start?.column === 'number' ? start.column : 0,
    },
    end: {
      line: typeof end?.line === 'number' ? end.line : 1,
      column: typeof end?.column === 'number' ? end.column : 0,
    },
  }
}

function isConstant(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>

  if (n.type === 'Literal') {
    return typeof n.value === 'boolean' || typeof n.value === 'number'
  }

  if (n.type === 'UnaryExpression' && n.operator === '!') {
    const argument = n.argument
    if (argument && typeof argument === 'object') {
      const arg = argument as Record<string, unknown>
      return arg.type === 'Literal' && typeof arg.value === 'boolean'
    }
  }

  return false
}

function getConstantValue(node: unknown): unknown {
  if (!node || typeof node !== 'object') {
    return undefined
  }

  const n = node as Record<string, unknown>

  if (n.type === 'Literal') {
    return n.value
  }

  if (n.type === 'UnaryExpression' && n.operator === '!') {
    const argument = n.argument as Record<string, unknown> | undefined
    return argument?.type === 'Literal' ? !argument.value : undefined
  }

  return undefined
}

function isBinaryOperator(operator: unknown): operator is string {
  return operator === '===' || operator === '!=='
}

export const noConstantBinaryExpressionRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'warn',
    docs: {
      description:
        'Disallow comparisons with constant binary values (true/false, 0/1). These are likely mistakes where a variable was intended, the boolean literal. Use the variable directly or fix the comparison.',
      category: 'correctness',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-constant-binary-expression',
    },
    schema: [],
  },

  create(context: RuleContext): RuleVisitor {
    return {
      BinaryExpression(node: unknown): void {
        if (!node || typeof node !== 'object') {
          return
        }

        const n = node as Record<string, unknown>

        if (!isBinaryOperator(n.operator)) {
          return
        }

        const left = n.left
        const right = n.right

        const leftIsConstant = isConstant(left)
        const rightIsConstant = isConstant(right)

        if (!leftIsConstant && !rightIsConstant) {
          return
        }

        const constantSide = leftIsConstant ? 'left' : 'right'
        const constantValue = leftIsConstant ? getConstantValue(left) : getConstantValue(right)

        context.report({
          node,
          message: `Unexpected comparison with constant ${typeof constantValue === 'boolean' ? 'boolean' : 'numeric'} value (${constantValue}) on the ${constantSide} side. This is likely a mistake. Use the variable directly or fix the comparison.`,
          loc: extractLocation(node),
        })
      },
    }
  },
}
