import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'
import { extractRuleOptions } from '../../utils/options-helpers.js'

interface ExplicitModuleBoundaryTypesOptions {
  readonly allowArrowFunctions?: boolean
  readonly allowHigherOrderFunctions?: boolean
  readonly allowTypedFunctionExpressions?: boolean
}

function hasReturnType(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) return false
  return n.returnType !== undefined && n.returnType !== null
}

function isExported(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) return false

  // Check if parent is an export declaration
  const parent = toASTNode(n.parent)
  if (!parent) {
    return false
  }

  const parentType = parent.type

  // Direct export: export function foo() {}
  if (parentType === 'ExportNamedDeclaration' || parentType === 'ExportDefaultDeclaration') {
    return true
  }

  // Variable declaration in export: export const foo = () => {}
  if (parentType === 'VariableDeclarator') {
    const varParent = toASTNode(parent.parent)
    if (varParent?.type === 'VariableDeclaration') {
      const varDeclParent = toASTNode(varParent.parent)
      return varDeclParent?.type === 'ExportNamedDeclaration'
    }
  }

  return false
}

function isHigherOrderFunction(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) return false

  const bodyNode = toASTNode(n.body)
  if (!bodyNode) return false

  // Arrow function returning function directly
  if (bodyNode.type === 'FunctionExpression' || bodyNode.type === 'ArrowFunctionExpression') {
    return true
  }

  // Block statement with return of function
  if (bodyNode.type === 'BlockStatement') {
    const statements = bodyNode.body
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

  const parentNode = toASTNode(n.parent)
  if (!parentNode) return false

  if (parentNode.type === 'VariableDeclarator') {
    const id = toASTNode(parentNode.id)
    if (id && id.typeAnnotation !== undefined && id.typeAnnotation !== null) {
      return true
    }
  }

  return false
}

function getFunctionName(node: unknown): null | string {
  const n = toASTNode(node)
  if (!n) return null

  // Direct function name
  const idNode = toASTNode(n.id)
  if (idNode && typeof idNode.name === 'string') {
    return idNode.name
  }

  // Variable name for function expressions
  const parentNode = toASTNode(n.parent)
  if (parentNode?.type === 'VariableDeclarator') {
    const parentIdNode = toASTNode(parentNode.id)
    if (parentIdNode && typeof parentIdNode.name === 'string') {
      return parentIdNode.name
    }
  }

  return null
}

function shouldReport(
  node: unknown,
  nodeType: string,
  options: ExplicitModuleBoundaryTypesOptions,
): { reason: null | string; shouldReport: boolean; } {
  // Check if exported
  if (!isExported(node)) {
    return { reason: null, shouldReport: false }
  }

  // Already has return type
  if (hasReturnType(node)) {
    return { reason: null, shouldReport: false }
  }

  // Allow arrow functions option
  if (nodeType === 'ArrowFunctionExpression' && options.allowArrowFunctions) {
    return { reason: null, shouldReport: false }
  }

  // Allow typed function expressions option
  if (
    (nodeType === 'FunctionExpression' || nodeType === 'ArrowFunctionExpression') &&
    options.allowTypedFunctionExpressions &&
    isVariableTypedWithFunction(node)
  ) {
    return { reason: null, shouldReport: false }
  }

  // Allow higher order functions option
  if (options.allowHigherOrderFunctions && isHigherOrderFunction(node)) {
    return { reason: null, shouldReport: false }
  }

  return { reason: 'Missing return type on exported function', shouldReport: true }
}

export const explicitModuleBoundaryTypesRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const options = extractRuleOptions<ExplicitModuleBoundaryTypesOptions>(context.config.options, {
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
          ? 'Exported arrow function'
          : nodeType === 'FunctionExpression'
            ? 'Exported function expression'
            : 'Exported function'

      const namePart = functionName ? ` '${functionName}'` : ''
      const message = `${functionKind}${namePart} is missing a return type annotation. Add an explicit return type for better API documentation and type safety.`

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
        'Require explicit return types on exported functions. Explicit return types on module boundaries improve API documentation and help catch type errors at compile time.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/explicit-module-boundary-types',
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

export default explicitModuleBoundaryTypesRule
