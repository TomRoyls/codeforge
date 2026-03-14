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

function isTruncationPattern(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>

  if (n.type !== 'BinaryExpression') {
    return false
  }

  const operator = n.operator as string
  const left = n.left
  const right = n.right

  if (!left || !right || typeof left !== 'object' || typeof right !== 'object') {
    return false
  }

  const rightNode = right as Record<string, unknown>

  if (operator === '|') {
    return rightNode.type === 'Literal' && rightNode.value === 0
  }

  if (operator === '>>') {
    return rightNode.type === 'Literal' && rightNode.value === 0
  }

  return false
}

export const preferMathTruncRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Prefer Math.trunc() over bitwise operations (| 0, >> 0) for truncating numbers. Math.trunc() is more readable, handles large numbers correctly, and is explicit about intent.',
      category: 'performance',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/prefer-math-trunc',
    },
    schema: [],
  },

  create(context: RuleContext): RuleVisitor {
    return {
      BinaryExpression(node: unknown): void {
        if (!isTruncationPattern(node)) {
          return
        }

        const n = node as Record<string, unknown>
        const operator = n.operator as string

        context.report({
          node,
          message: `Prefer Math.trunc() over ${operator === '|' ? '| 0' : '>> 0'} for truncating numbers. Math.trunc() is more readable and handles large numbers correctly.`,
          loc: extractLocation(node),
        })
      },
    }
  },
}

export default preferMathTruncRule
