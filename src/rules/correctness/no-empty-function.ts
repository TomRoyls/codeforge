import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
  SourceLocation,
} from '../../plugins/types.js'

import { extractRuleOptions } from '../../utils/options-helpers.js'

interface NoEmptyFunctionOptions {
  readonly allowArrowFunctions?: boolean
  readonly allowAsyncFunctions?: boolean
  readonly allowConstructors?: boolean
  readonly allowOverrideMethods?: boolean
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

function isEmptyBlock(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>

  if (n.type !== 'BlockStatement') {
    return false
  }

  const body = n.body as undefined | unknown[]

  return !body || !Array.isArray(body) || body.length === 0
}

function isConstructorWithSuper(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>

  if (n.type !== 'MethodDefinition' || n.kind !== 'constructor') {
    return false
  }

  const body = n.value as Record<string, unknown> | undefined
  if (!body || typeof body !== 'object') {
    return false
  }

  const bodyNode = body as Record<string, unknown>
  const blockStatement = bodyNode.body as Record<string, unknown> | undefined

  if (!blockStatement || blockStatement.type !== 'BlockStatement') {
    return false
  }

  const statements = blockStatement.body as undefined | unknown[]
  if (!statements || !Array.isArray(statements)) {
    return false
  }

  return statements.some((stmt) => {
    if (!stmt || typeof stmt !== 'object') {
      return false
    }

    const s = stmt as Record<string, unknown>
    const expression = s.expression as Record<string, unknown> | undefined
    const callee = expression?.callee as Record<string, unknown> | undefined
    return (
      s.type === 'ExpressionStatement' &&
      expression?.type === 'CallExpression' &&
      callee?.type === 'Super'
    )
  })
}

function hasOverrideDecorator(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  const decorators = n.decorators as undefined | unknown[]

  if (!decorators || !Array.isArray(decorators)) {
    return false
  }

  return decorators.some((dec) => {
    if (!dec || typeof dec !== 'object') {
      return false
    }

    const d = dec as Record<string, unknown>
    const expression = d.expression as Record<string, unknown> | undefined

    if (!expression) {
      return false
    }

    return expression.type === 'Identifier' && expression.name === 'override'
  })
}

function getFunctionName(node: unknown): string | undefined {
  if (!node || typeof node !== 'object') {
    return undefined
  }

  const n = node as Record<string, unknown>

  if (n.id && typeof n.id === 'object') {
    const id = n.id as Record<string, unknown>
    return id.name as string | undefined
  }

  if (n.key && typeof n.key === 'object') {
    const key = n.key as Record<string, unknown>
    return key.name as string | undefined
  }

  if (n.type === 'Property' && n.key && typeof n.key === 'object') {
    const key = n.key as Record<string, unknown>
    return key.name as string | undefined
  }

  return undefined
}

function getFunctionType(node: unknown): string {
  if (!node || typeof node !== 'object') {
    return 'function'
  }

  const n = node as Record<string, unknown>
  const type = n.type as string

  switch (type) {
    case 'ArrowFunctionExpression': {
      return 'arrow function'
    }

    case 'FunctionDeclaration': {
      return 'function'
    }

    case 'FunctionExpression': {
      return 'function expression'
    }

    case 'MethodDefinition': {
      return n.kind === 'constructor' ? 'constructor' : 'method'
    }

    default: {
      return 'function'
    }
  }
}

export const noEmptyFunctionRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const options = extractRuleOptions<NoEmptyFunctionOptions>(context.config.options, {
      allowArrowFunctions: false,
      allowAsyncFunctions: false,
      allowConstructors: false,
      allowOverrideMethods: false,
    })

    function checkFunction(node: unknown): void {
      if (!node || typeof node !== 'object') {
        return
      }

      const n = node as Record<string, unknown>

      if (options.allowOverrideMethods && hasOverrideDecorator(node)) {
        return
      }

      if (options.allowAsyncFunctions && n.async === true) {
        return
      }

      if (options.allowArrowFunctions && n.type === 'ArrowFunctionExpression') {
        return
      }

      if (n.type === 'MethodDefinition') {
        if (options.allowConstructors && n.kind === 'constructor') {
          return
        }

        if (isConstructorWithSuper(node)) {
          return
        }

        const value = n.value as Record<string, unknown> | undefined
        const methodBody =
          value && typeof value === 'object' ? (value as Record<string, unknown>).body : n.body
        if (isEmptyBlock(methodBody)) {
          const methodName = getFunctionName(node)
          context.report({
            loc: extractLocation(node),
            message: `Unexpected empty ${getFunctionType(node)}${methodName ? ` "${methodName}"` : ''}. This may indicate missing implementation.`,
            node,
          })
        }

        return
      }

      const {body} = n

      if (n.type === 'ArrowFunctionExpression' && body && typeof body === 'object') {
          const bodyNode = body as Record<string, unknown>
          if (bodyNode.type !== 'BlockStatement') {
            return
          }
        }

      if (isEmptyBlock(body)) {
        const functionName = getFunctionName(node)
        context.report({
          loc: extractLocation(node),
          message: `Unexpected empty ${getFunctionType(node)}${functionName ? ` "${functionName}"` : ''}. This may indicate missing implementation.`,
          node,
        })
      }
    }

    return {
      ArrowFunctionExpression: checkFunction,
      FunctionDeclaration: checkFunction,
      FunctionExpression: checkFunction,
      MethodDefinition: checkFunction,
    }
  },

  meta: {
    docs: {
      category: 'correctness',
      description:
        'Disallow empty functions. Empty functions may indicate missing implementation or unintended behavior. Consider adding a comment if the empty body is deliberate.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-empty-function',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowArrowFunctions: {
            default: false,
            type: 'boolean',
          },
          allowAsyncFunctions: {
            default: false,
            type: 'boolean',
          },
          allowConstructors: {
            default: false,
            type: 'boolean',
          },
          allowOverrideMethods: {
            default: false,
            type: 'boolean',
          },
        },
        type: 'object',
      },
    ],
    severity: 'warn',
    type: 'problem',
  },
}

export default noEmptyFunctionRule
