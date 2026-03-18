import type {
  RuleDefinition,
  RuleContext,
  RuleVisitor,
  SourceLocation,
} from '../../plugins/types.js'
import { extractRuleOptions } from '../../utils/options-helpers.js'

interface NoThrowLiteralOptions {
  readonly allowThrowingAny?: boolean
  readonly allowThrowingObjects?: boolean
}

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

function checkIfLiteral(node: unknown): { isLiteral: boolean; literalType: string } {
  if (!node || typeof node !== 'object') {
    return { isLiteral: false, literalType: '' }
  }

  const n = node as Record<string, unknown>
  const argument = n.argument as Record<string, unknown> | undefined

  if (!argument) {
    return { isLiteral: false, literalType: '' }
  }

  const type = argument.type as string | undefined

  if (type === 'Literal') {
    const value = argument.value
    if (typeof value === 'string') {
      return { isLiteral: true, literalType: 'string' }
    }
    if (typeof value === 'number') {
      return { isLiteral: true, literalType: 'number' }
    }
    if (value === null) {
      return { isLiteral: true, literalType: 'null' }
    }
    if (typeof value === 'boolean') {
      return { isLiteral: true, literalType: 'boolean' }
    }
    if (typeof value === 'bigint') {
      return { isLiteral: true, literalType: 'bigint' }
    }
    if (value instanceof RegExp) {
      return { isLiteral: true, literalType: 'regexp' }
    }
  }

  if (type === 'Identifier') {
    const name = argument.name as string | undefined
    if (name === 'undefined') {
      return { isLiteral: true, literalType: 'undefined' }
    }
  }

  if (type === 'ObjectExpression') {
    return { isLiteral: true, literalType: 'object' }
  }

  if (type === 'ArrayExpression') {
    return { isLiteral: true, literalType: 'array' }
  }

  return { isLiteral: false, literalType: '' }
}

function getLiteralMessage(literalType: string): string {
  switch (literalType) {
    case 'string':
      return 'Throwing string literals is not allowed. Throw an Error object instead.'
    case 'number':
      return 'Throwing number literals is not allowed. Throw an Error object instead.'
    case 'null':
      return 'Throwing null is not allowed. Throw an Error object instead.'
    case 'undefined':
      return 'Throwing undefined is not allowed. Throw an Error object instead.'
    case 'boolean':
      return 'Throwing boolean literals is not allowed. Throw an Error object instead.'
    case 'bigint':
      return 'Throwing bigint literals is not allowed. Throw an Error object instead.'
    case 'regexp':
      return 'Throwing RegExp literals is not allowed. Throw an Error object instead.'
    case 'object':
      return 'Throwing plain objects is not recommended. Throw an Error object instead.'
    case 'array':
      return 'Throwing array literals is not allowed. Throw an Error object instead.'
    default:
      return 'Throwing non-Error values is not allowed. Throw an Error object instead.'
  }
}

export const noThrowLiteralRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description:
        'Disallow throwing literals as exceptions. Only Error objects should be thrown for proper error handling and stack traces.',
      category: 'correctness',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-throw-literal',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowThrowingAny: {
            type: 'boolean',
            default: false,
          },
          allowThrowingObjects: {
            type: 'boolean',
            default: false,
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context: RuleContext): RuleVisitor {
    const options = extractRuleOptions<NoThrowLiteralOptions>(context.config.options, {
      allowThrowingAny: false,
      allowThrowingObjects: false,
    })

    return {
      ThrowStatement(node: unknown): void {
        if (!node || typeof node !== 'object') {
          return
        }

        const result = checkIfLiteral(node)
        if (!result.isLiteral) {
          return
        }

        if (result.literalType === 'object' && options.allowThrowingObjects) {
          return
        }

        const n = node as Record<string, unknown>
        const argument = n.argument as Record<string, unknown> | undefined

        if (options.allowThrowingAny && argument?.type === 'TSAsExpression') {
          return
        }

        const location = extractLocation(node)
        const message = getLiteralMessage(result.literalType)

        context.report({
          message,
          loc: location,
        })
      },
    }
  },
}

export default noThrowLiteralRule
