import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'
import { extractRuleOptions } from '../../utils/options-helpers.js'

interface RequireReturnTypeOptions {
  readonly allowArrowFunctions?: boolean
  readonly allowTypedFunctionExpressions?: boolean
  readonly allowHigherOrderFunctions?: boolean
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
  const body = n.body

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
  const parent = n.parent

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

function getFunctionName(node: unknown): string | null {
  if (!node || typeof node !== 'object') {
    return null
  }

  const n = node as Record<string, unknown>
  const id = n.id

  if (id && typeof id === 'object') {
    const idNode = id as Record<string, unknown>
    if (typeof idNode.name === 'string') {
      return idNode.name
    }
  }

  const parent = n.parent
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
): { shouldReport: boolean; reason: string | null } {
  if (hasReturnType(node)) {
    return { shouldReport: false, reason: null }
  }

  if (nodeType === 'ArrowFunctionExpression' && options.allowArrowFunctions) {
    return { shouldReport: false, reason: null }
  }

  if (
    (nodeType === 'FunctionExpression' || nodeType === 'ArrowFunctionExpression') &&
    options.allowTypedFunctionExpressions &&
    isVariableTypedWithFunction(node)
  ) {
    return { shouldReport: false, reason: null }
  }

  if (options.allowHigherOrderFunctions && isHigherOrderFunction(node)) {
    return { shouldReport: false, reason: null }
  }

  return { shouldReport: true, reason: 'Missing return type annotation' }
}

export const requireReturnTypeRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Require explicit return type annotations on functions. Explicit return types improve code readability and help catch type errors.',
      category: 'patterns',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/require-return-type',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowArrowFunctions: {
            type: 'boolean',
          },
          allowTypedFunctionExpressions: {
            type: 'boolean',
          },
          allowHigherOrderFunctions: {
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
    ],
    fixable: undefined,
  },

  create(context: RuleContext): RuleVisitor {
    const options = extractRuleOptions<RequireReturnTypeOptions>(context.config.options, {
      allowArrowFunctions: false,
      allowTypedFunctionExpressions: false,
      allowHigherOrderFunctions: false,
    })

    function checkFunction(node: unknown, nodeType: string): void {
      const { shouldReport: report, reason } = shouldReport(node, nodeType, options)

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
        message,
        loc: location,
      })
    }

    return {
      FunctionDeclaration(node: unknown): void {
        checkFunction(node, 'FunctionDeclaration')
      },
      FunctionExpression(node: unknown): void {
        checkFunction(node, 'FunctionExpression')
      },
      ArrowFunctionExpression(node: unknown): void {
        checkFunction(node, 'ArrowFunctionExpression')
      },
    }
  },
}

export default requireReturnTypeRule
