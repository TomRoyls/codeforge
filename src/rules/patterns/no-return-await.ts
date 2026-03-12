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

function isReturnStatement(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  return n.type === 'ReturnStatement'
}

function isAwaitExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  return n.type === 'AwaitExpression'
}

export const noReturnAwaitRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Disallow unnecessary return await. In async functions, return await is redundant and slightly slower than returning the Promise directly.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-return-await',
    },
    schema: [],
    fixable: undefined,
  },

  create(context: RuleContext): RuleVisitor {
    return {
      ReturnStatement(node: unknown): void {
        if (!isReturnStatement(node)) {
          return
        }

        const n = node as Record<string, unknown>
        const argument = n.argument

        if (!argument) {
          return
        }

        if (isAwaitExpression(argument)) {
          const location = extractLocation(argument)
          context.report({
            message:
              'Unnecessary return await. Return the Promise directly for better performance, or keep await only if you need to catch errors at this level.',
            loc: location,
          })
        }
      },
    }
  },
}

export default noReturnAwaitRule
