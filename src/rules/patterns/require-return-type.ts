import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { getParentNode, toASTNode, getFunctionName } from '../../utils/ast-helpers.js'
import { extractRuleOptions } from '../../utils/options-helpers.js'

interface RequireReturnTypeOptions {
  readonly allowArrowFunctions?: boolean
  readonly allowHigherOrderFunctions?: boolean
  readonly allowTypedFunctionExpressions?: boolean
}

function hasReturnType(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) return false

  return n.returnType !== undefined && n.returnType !== null
}

function isHigherOrderFunction(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) return false

  const bodyNode = toASTNode(n.body)
  if (!bodyNode) return false

  if (bodyNode.type === 'FunctionExpression' || bodyNode.type === 'ArrowFunctionExpression') {
    return true
  }

  if (bodyNode.type === 'BlockStatement') {
    const statements = bodyNode.body as unknown[]
    if (!Array.isArray(statements) || statements.length === 0) {
      return false
    }

    for (const stmt of statements) {
      const s = toASTNode(stmt)
      if (!s) continue
      if (s.type === 'ReturnStatement' && s.argument) {
        const arg = toASTNode(s.argument)
        if (arg?.type === 'FunctionExpression' || arg?.type === 'ArrowFunctionExpression') {
          return true
        }
      }
    }
  }

  return false
}

function isVariableTypedWithFunction(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) return false

  const parentNode = getParentNode(n)
  if (!parentNode) return false

  if (parentNode.type === 'VariableDeclarator') {
    const idNode = toASTNode(parentNode.id)
    if (idNode && idNode.typeAnnotation !== undefined && idNode.typeAnnotation !== null) {
      return true
    }
  }

  return false
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
