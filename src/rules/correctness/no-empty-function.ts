import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'
import { extractRuleOptions } from '../../utils/options-helpers.js'

interface NoEmptyFunctionOptions {
  readonly allowArrowFunctions?: boolean
  readonly allowAsyncFunctions?: boolean
  readonly allowConstructors?: boolean
  readonly allowOverrideMethods?: boolean
}

function isEmptyBlock(node: unknown): boolean {
  const n = toASTNode(node)
  if (n?.type !== 'BlockStatement') {
    return false
  }

  const body = n.body as undefined | unknown[]
  return !body || !Array.isArray(body) || body.length === 0
}

function isConstructorWithSuper(node: unknown): boolean {
  const n = toASTNode(node)
  if (n?.type !== 'MethodDefinition' || n.kind !== 'constructor') {
    return false
  }

  const body = toASTNode(n.value)
  const blockStatement = toASTNode(body?.body)

  if (blockStatement?.type !== 'BlockStatement') {
    return false
  }

  const statements = blockStatement.body as undefined | unknown[]
  if (!statements || !Array.isArray(statements)) {
    return false
  }

  return statements.some((stmt) => {
    const s = toASTNode(stmt)
    const expression = toASTNode(s?.expression)
    const callee = toASTNode(expression?.callee)
    return (
      s?.type === 'ExpressionStatement' &&
      expression?.type === 'CallExpression' &&
      callee?.type === 'Super'
    )
  })
}

function hasOverrideDecorator(node: unknown): boolean {
  const n = toASTNode(node)
  const decorators = n?.decorators

  if (!decorators || !Array.isArray(decorators)) {
    return false
  }

  return decorators.some((dec) => {
    const d = toASTNode(dec)
    const expression = toASTNode(d?.expression)
    return expression?.type === 'Identifier' && expression.name === 'override'
  })
}

function getFunctionName(node: unknown): string | undefined {
  const n = toASTNode(node)
  if (!n) return undefined

  if (n.id && typeof n.id === 'object') {
    const id = toASTNode(n.id)
    return id?.name
  }

  if (n.key && typeof n.key === 'object') {
    const key = toASTNode(n.key)
    return key?.name
  }

  if (n.type === 'Property' && n.key && typeof n.key === 'object') {
    const key = toASTNode(n.key)
    return key?.name
  }

  return undefined
}

function getFunctionType(node: unknown): string {
  const n = toASTNode(node)
  if (!n) return 'function'

  switch (n.type) {
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
      const n = toASTNode(node)
      if (!n) return

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

        const value = toASTNode(n.value)
        const methodBody = value?.body ?? n.body
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
          const bodyNode = toASTNode(body)
          if (bodyNode?.type !== 'BlockStatement') {
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
