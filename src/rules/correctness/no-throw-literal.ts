import type {
  RuleContext,
  RuleDefinition,
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
    end: { column: 1, line: 1 },
    start: { column: 0, line: 1 },
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
    end: {
      column: typeof end?.column === 'number' ? end.column : 0,
      line: typeof end?.line === 'number' ? end.line : 1,
    },
    start: {
      column: typeof start?.column === 'number' ? start.column : 0,
      line: typeof start?.line === 'number' ? start.line : 1,
    },
  }
}

type LiteralCheckResult = { isLiteral: boolean; literalType: string }

function checkIfLiteralFromAst(node: Record<string, unknown>): LiteralCheckResult {
  const argument = node.argument as Record<string, unknown> | undefined
  if (!argument) {
    return { isLiteral: false, literalType: '' }
  }

  const type = argument.type as string | undefined

  if (type === 'StringLiteral' || type === 'Literal') {
    const {value} = argument
    if (typeof value === 'string') return { isLiteral: true, literalType: 'string' }
    if (typeof value === 'number') return { isLiteral: true, literalType: 'number' }
    if (value === null) return { isLiteral: true, literalType: 'null' }
    if (typeof value === 'boolean') return { isLiteral: true, literalType: 'boolean' }
    if (typeof value === 'bigint') return { isLiteral: true, literalType: 'bigint' }
    if (value instanceof RegExp) return { isLiteral: true, literalType: 'regexp' }
  }

  if (type === 'Identifier') {
    const name = argument.name as string | undefined
    if (name === 'undefined') return { isLiteral: true, literalType: 'undefined' }
  }

  if (type === 'ObjectLiteralExpression' || type === 'ObjectExpression') {
    return { isLiteral: true, literalType: 'object' }
  }

  if (type === 'ArrayLiteralExpression' || type === 'ArrayExpression') {
    return { isLiteral: true, literalType: 'array' }
  }

  return { isLiteral: false, literalType: '' }
}

/**
 * Parse the thrown expression type from the node's text property.
 * Used when the adapter strips child properties (argument, etc.) from the node.
 */
function checkIfLiteralFromText(text: string): LiteralCheckResult {
  let thrown = text.replace(/^throw\s+/, '').trim()
  if (thrown.endsWith(';')) thrown = thrown.slice(0, -1).trim()
  if (!thrown) return { isLiteral: false, literalType: '' }

  if (thrown.startsWith("'") || thrown.startsWith('"') || thrown.startsWith('`')) {
    return { isLiteral: true, literalType: 'string' }
  }

  if (/^-?\d+(\.\d+)?$/.test(thrown)) {
    return { isLiteral: true, literalType: 'number' }
  }

  if (thrown === 'null') {
    return { isLiteral: true, literalType: 'null' }
  }

  if (thrown === 'undefined') {
    return { isLiteral: true, literalType: 'undefined' }
  }

  if (thrown === 'true' || thrown === 'false') {
    return { isLiteral: true, literalType: 'boolean' }
  }

  if (/^\/[^/]*\/[gimsuy]*$/.test(thrown)) {
    return { isLiteral: true, literalType: 'regexp' }
  }

  if (thrown.startsWith('{') && thrown.endsWith('}')) {
    return { isLiteral: true, literalType: 'object' }
  }

  if (thrown.startsWith('[') && thrown.endsWith(']')) {
    return { isLiteral: true, literalType: 'array' }
  }

  return { isLiteral: false, literalType: '' }
}

function checkIfLiteral(node: unknown): LiteralCheckResult {
  if (!node || typeof node !== 'object') {
    return { isLiteral: false, literalType: '' }
  }

  const n = node as Record<string, unknown>

  if (n.argument !== undefined) {
    return checkIfLiteralFromAst(n)
  }

  const text = typeof n.text === 'string' ? n.text : ''
  return checkIfLiteralFromText(text)
}

function getLiteralMessage(literalType: string): string {
  switch (literalType) {
    case 'array': {
      return 'Throwing array literals is not allowed. Throw an Error object instead.'
    }

    case 'bigint': {
      return 'Throwing bigint literals is not allowed. Throw an Error object instead.'
    }

    case 'boolean': {
      return 'Throwing boolean literals is not allowed. Throw an Error object instead.'
    }

    case 'null': {
      return 'Throwing null is not allowed. Throw an Error object instead.'
    }

    case 'number': {
      return 'Throwing number literals is not allowed. Throw an Error object instead.'
    }

    case 'object': {
      return 'Throwing plain objects is not recommended. Throw an Error object instead.'
    }

    case 'regexp': {
      return 'Throwing RegExp literals is not allowed. Throw an Error object instead.'
    }

    case 'string': {
      return 'Throwing string literals is not allowed. Throw an Error object instead.'
    }

    case 'undefined': {
      return 'Throwing undefined is not allowed. Throw an Error object instead.'
    }

    default: {
      return 'Throwing non-Error values is not allowed. Throw an Error object instead.'
    }
  }
}

export const noThrowLiteralRule: RuleDefinition = {
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

        const location = extractLocation(node)
        const message = getLiteralMessage(result.literalType)

        context.report({
          loc: location,
          message,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'correctness',
      description:
        'Disallow throwing literals as exceptions. Only Error objects should be thrown for proper error handling and stack traces.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-throw-literal',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowThrowingAny: {
            default: false,
            type: 'boolean',
          },
          allowThrowingObjects: {
            default: false,
            type: 'boolean',
          },
        },
        type: 'object',
      },
    ],
    severity: 'error',
    type: 'problem',
  },
}

export default noThrowLiteralRule
