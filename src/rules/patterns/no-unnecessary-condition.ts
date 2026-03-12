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

function isIfStatement(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }
  const n = node as Record<string, unknown>
  return n.type === 'IfStatement'
}

function isConditionalExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }
  const n = node as Record<string, unknown>
  return n.type === 'ConditionalExpression'
}

function isBooleanLiteral(node: unknown, value: boolean): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }
  const n = node as Record<string, unknown>
  return n.type === 'BooleanLiteral' && n.value === value
}

function isLiteral(node: unknown, value: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }
  const n = node as Record<string, unknown>
  return n.type === 'Literal' && n.value === value
}

function getTestNode(node: unknown): unknown {
  if (!node || typeof node !== 'object') {
    return null
  }
  const n = node as Record<string, unknown>
  return n.test
}

function isUnaryExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }
  const n = node as Record<string, unknown>
  return n.type === 'UnaryExpression'
}

function isLogicalExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }
  const n = node as Record<string, unknown>
  return n.type === 'LogicalExpression'
}

function checkUnnecessaryCondition(testNode: unknown): { isUnnecessary: boolean; reason: string } {
  if (!testNode || typeof testNode !== 'object') {
    return { isUnnecessary: false, reason: '' }
  }

  const t = testNode as Record<string, unknown>

  if (isBooleanLiteral(testNode, true) || isLiteral(testNode, true)) {
    return { isUnnecessary: true, reason: 'Unnecessary condition: always truthy' }
  }

  if (isBooleanLiteral(testNode, false) || isLiteral(testNode, false)) {
    return { isUnnecessary: true, reason: 'Unnecessary condition: always falsy' }
  }

  if (isLiteral(testNode, null)) {
    return { isUnnecessary: true, reason: 'Unnecessary condition: always falsy (null)' }
  }

  if (isUnaryExpression(testNode)) {
    const operator = t.operator as string
    const argument = t.argument

    if (operator === '!') {
      if (isBooleanLiteral(argument, true) || isLiteral(argument, true)) {
        return { isUnnecessary: true, reason: 'Unnecessary condition: !true is always false' }
      }
      if (isBooleanLiteral(argument, false) || isLiteral(argument, false)) {
        return { isUnnecessary: true, reason: 'Unnecessary condition: !false is always true' }
      }
      if (isLiteral(argument, null)) {
        return { isUnnecessary: true, reason: 'Unnecessary condition: !null is always true' }
      }
    }
  }

  if (isLogicalExpression(testNode)) {
    const left = t.left
    const right = t.right
    const operator = t.operator as string

    const leftResult = checkUnnecessaryCondition(left)
    const rightResult = checkUnnecessaryCondition(right)

    if (leftResult.isUnnecessary || rightResult.isUnnecessary) {
      if (operator === '&&') {
        if (isBooleanLiteral(left, false) || isLiteral(left, false)) {
          return {
            isUnnecessary: true,
            reason: 'Unnecessary condition: false && x is always false',
          }
        }
        if (isBooleanLiteral(left, true) || isLiteral(left, true)) {
          return { isUnnecessary: true, reason: 'Unnecessary condition: true && x is always x' }
        }
      }
      if (operator === '||') {
        if (isBooleanLiteral(left, true) || isLiteral(left, true)) {
          return { isUnnecessary: true, reason: 'Unnecessary condition: true || x is always true' }
        }
        if (isBooleanLiteral(left, false) || isLiteral(left, false)) {
          return { isUnnecessary: true, reason: 'Unnecessary condition: false || x is always x' }
        }
      }
    }
  }

  return { isUnnecessary: false, reason: '' }
}

export const noUnnecessaryConditionRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Disallow conditions that are always truthy or always falsy. These conditions are unnecessary and likely indicate a mistake.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-condition',
    },
    schema: [],
    fixable: undefined,
  },

  create(context: RuleContext): RuleVisitor {
    return {
      IfStatement(node: unknown): void {
        if (!isIfStatement(node)) {
          return
        }

        const testNode = getTestNode(node)
        const result = checkUnnecessaryCondition(testNode)

        if (result.isUnnecessary) {
          const location = extractLocation(node)
          context.report({
            message: result.reason,
            loc: location,
          })
        }
      },

      ConditionalExpression(node: unknown): void {
        if (!isConditionalExpression(node)) {
          return
        }

        const testNode = getTestNode(node)
        const result = checkUnnecessaryCondition(testNode)

        if (result.isUnnecessary) {
          const location = extractLocation(node)
          context.report({
            message: result.reason,
            loc: location,
          })
        }
      },
    }
  },
}

export default noUnnecessaryConditionRule
