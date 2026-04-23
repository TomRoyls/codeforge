import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { extractRuleOptions } from '../../utils/options-helpers.js'

interface RequireReturnTypeOptions {
  readonly allowArrowFunctions?: boolean
  readonly allowHigherOrderFunctions?: boolean
  readonly allowTypedFunctionExpressions?: boolean
}

function hasReturnType(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  return n.returnType !== undefined && n.returnType !== null
}

function isHigherOrderFunction(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  const {body} = n

  if (!body || typeof body !== 'object') {
    return false
  }

  const bodyNode = body as Record<string, unknown>

  if (bodyNode.type === 'FunctionExpression' || bodyNode.type === 'ArrowFunctionExpression') {
    return true
  }

  if (bodyNode.type === 'BlockStatement') {
    const statements = bodyNode.body as unknown[]
    if (!Array.isArray(statements) || statements.length === 0) {
      return false
    }

    for (const stmt of statements) {
      if (!stmt || typeof stmt !== 'object') continue
      const s = stmt as Record<string, unknown>
      if (s.type === 'ReturnStatement' && s.argument) {
        const arg = s.argument as Record<string, unknown>
        if (arg.type === 'FunctionExpression' || arg.type === 'ArrowFunctionExpression') {
          return true
        }
      }
    }
  }

  return false
}

function isVariableTypedWithFunction(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  const {parent} = n

  if (!parent || typeof parent !== 'object') {
    return false
  }

  const parentNode = parent as Record<string, unknown>

  if (parentNode.type === 'VariableDeclarator') {
    const id = parentNode.id as Record<string, unknown> | undefined
    if (id && typeof id === 'object') {
      const idNode = id as Record<string, unknown>
      if (idNode.typeAnnotation !== undefined && idNode.typeAnnotation !== null) {
        return true
      }
    }
  }

  return false
}

function getFunctionName(node: unknown): null | string {
  if (!node || typeof node !== 'object') {
    return null
  }

  const n = node as Record<string, unknown>
  const {id} = n

  if (id && typeof id === 'object') {
    const idNode = id as Record<string, unknown>
    if (typeof idNode.name === 'string') {
      return idNode.name
    }
  }

  const {parent} = n
  if (parent && typeof parent === 'object') {
    const parentNode = parent as Record<string, unknown>

    if (parentNode.type === 'VariableDeclarator') {
      const parentId = parentNode.id as Record<string, unknown> | undefined
      if (parentId && typeof parentId === 'object') {
        const parentIdNode = parentId as Record<string, unknown>
        if (typeof parentIdNode.name === 'string') {
          return parentIdNode.name
        }
      }
    }

    if (parentNode.type === 'Property' || parentNode.type === 'MethodDefinition') {
      const key = parentNode.key as Record<string, unknown> | undefined
      if (key && typeof key === 'object') {
        const keyNode = key as Record<string, unknown>
        if (typeof keyNode.name === 'string') {
          return keyNode.name
        }
      }
    }

    if (parentNode.type === 'AssignmentExpression') {
      const left = parentNode.left as Record<string, unknown> | undefined
      if (left && typeof left === 'object') {
        const leftNode = left as Record<string, unknown>
        if (leftNode.type === 'Identifier' && typeof leftNode.name === 'string') {
          return leftNode.name
        }
      }
    }
  }

  return null
}

function shouldReport(
  node: unknown,
  nodeType: string,
  options: RequireReturnTypeOptions,
): { reason: null | string; shouldReport: boolean; } {
  if (hasReturnType(node)) {
    return { reason: null, shouldReport: false }
  }

  if (nodeType === 'ArrowFunctionExpression' && options.allowArrowFunctions) {
    return { reason: null, shouldReport: false }
  }

  if (
    (nodeType === 'FunctionExpression' || nodeType === 'ArrowFunctionExpression') &&
    options.allowTypedFunctionExpressions &&
    isVariableTypedWithFunction(node)
  ) {
    return { reason: null, shouldReport: false }
  }

  if (options.allowHigherOrderFunctions && isHigherOrderFunction(node)) {
    return { reason: null, shouldReport: false }
  }

  return { reason: 'Missing return type annotation', shouldReport: true }
}

export const requireReturnTypeRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const options = extractRuleOptions<RequireReturnTypeOptions>(context.config.options, {
      allowArrowFunctions: false,
      allowHigherOrderFunctions: false,
      allowTypedFunctionExpressions: false,
    })

    function checkFunction(node: unknown, nodeType: string): void {
      const { reason, shouldReport: report } = shouldReport(node, nodeType, options)

      if (!report || !reason) {
        return
      }

      const location = extractLocation(node)
      const functionName = getFunctionName(node)
      const functionKind =
        nodeType === 'ArrowFunctionExpression'
          ? 'Arrow function'
          : nodeType === 'FunctionExpression'
            ? 'Function expression'
            : 'Function'

      const namePart = functionName ? ` '${functionName}'` : ''
      const message = `${functionKind}${namePart} is missing a return type annotation. Add an explicit return type for better type safety and documentation.`

      context.report({
        loc: location,
        message,
      })
    }

    return {
      ArrowFunctionExpression(node: unknown): void {
        checkFunction(node, 'ArrowFunctionExpression')
      },
      FunctionDeclaration(node: unknown): void {
        checkFunction(node, 'FunctionDeclaration')
      },
      FunctionExpression(node: unknown): void {
        checkFunction(node, 'FunctionExpression')
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Require explicit return type annotations on functions. Explicit return types improve code readability and help catch type errors.',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/require-return-type',
    },
    fixable: undefined,
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowArrowFunctions: {
            type: 'boolean',
          },
          allowHigherOrderFunctions: {
            type: 'boolean',
          },
          allowTypedFunctionExpressions: {
            type: 'boolean',
          },
        },
        type: 'object',
      },
    ],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default requireReturnTypeRule
