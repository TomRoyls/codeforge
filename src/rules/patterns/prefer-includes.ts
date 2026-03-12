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

function isBinaryExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }
  const n = node as Record<string, unknown>
  return n.type === 'BinaryExpression'
}

function isIndexOfCall(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>

  if (n.type !== 'CallExpression') {
    return false
  }

  const callee = n.callee as Record<string, unknown> | undefined
  if (!callee || callee.type !== 'MemberExpression') {
    return false
  }

  const property = callee.property as Record<string, unknown> | undefined
  if (!property || property.type !== 'Identifier') {
    return false
  }

  return property.name === 'indexOf'
}

function isLiteralZero(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }
  const n = node as Record<string, unknown>
  return n.type === 'Literal' && n.value === 0
}

function isLiteralMinusOne(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }
  const n = node as Record<string, unknown>
  return n.type === 'Literal' && n.value === -1
}

export const preferIncludesRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Prefer .includes() over .indexOf() comparisons for better readability. Use array.includes(x) instead of array.indexOf(x) >= 0.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/prefer-includes',
    },
    schema: [],
    fixable: undefined,
  },

  create(context: RuleContext): RuleVisitor {
    return {
      BinaryExpression(node: unknown): void {
        if (!isBinaryExpression(node)) {
          return
        }

        const n = node as Record<string, unknown>
        const operator = n.operator as string
        const left = n.left
        const right = n.right

        const isLeftIndexOf = isIndexOfCall(left)
        const isRightIndexOf = isIndexOfCall(right)

        if (!isLeftIndexOf && !isRightIndexOf) {
          return
        }

        if (operator === '>=' || operator === '!==' || operator === '==') {
          const checkNode = isLeftIndexOf ? right : left
          if (isLiteralZero(checkNode) || isLiteralMinusOne(checkNode)) {
            const location = extractLocation(node)
            context.report({
              message: `Prefer .includes() over .indexOf() ${operator} for more readable code.`,
              loc: location,
            })
          }
        }

        if (operator === '>' || operator === '!=') {
          const checkNode = isLeftIndexOf ? right : left
          if (isLiteralMinusOne(checkNode)) {
            const location = extractLocation(node)
            context.report({
              message: `Prefer .includes() over .indexOf() ${operator} for more readable code.`,
              loc: location,
            })
          }
        }
      },
    }
  },
}

export default preferIncludesRule
