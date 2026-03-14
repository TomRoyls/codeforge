import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

interface ExplicitModuleBoundaryTypesOptions {
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

function isExported(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>

  // Check if parent is an export declaration
  const parent = n.parent as Record<string, unknown> | undefined
  if (!parent) {
    return false
  }

  const parentType = parent.type as string | undefined

  // Direct export: export function foo() {}
  if (parentType === 'ExportNamedDeclaration' || parentType === 'ExportDefaultDeclaration') {
    return true
  }

  // Variable declaration in export: export const foo = () => {}
  if (parentType === 'VariableDeclarator') {
    const varParent = parent.parent as Record<string, unknown> | undefined
    if (varParent?.type === 'VariableDeclaration') {
      const varDeclParent = varParent.parent as Record<string, unknown> | undefined
      return varDeclParent?.type === 'ExportNamedDeclaration'
    }
  }

  return false
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

  // Arrow function returning function directly
  if (bodyNode.type === 'FunctionExpression' || bodyNode.type === 'ArrowFunctionExpression') {
    return true
  }

  // Block statement with return of function
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

  // Direct function name
  const id = n.id
  if (id && typeof id === 'object') {
    const idNode = id as Record<string, unknown>
    if (typeof idNode.name === 'string') {
      return idNode.name
    }
  }

  // Variable name for function expressions
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
  }

  return null
}

function shouldReport(
  node: unknown,
  nodeType: string,
  options: ExplicitModuleBoundaryTypesOptions,
): { shouldReport: boolean; reason: string | null } {
  // Check if exported
  if (!isExported(node)) {
    return { shouldReport: false, reason: null }
  }

  // Already has return type
  if (hasReturnType(node)) {
    return { shouldReport: false, reason: null }
  }

  // Allow arrow functions option
  if (nodeType === 'ArrowFunctionExpression' && options.allowArrowFunctions) {
    return { shouldReport: false, reason: null }
  }

  // Allow typed function expressions option
  if (
    (nodeType === 'FunctionExpression' || nodeType === 'ArrowFunctionExpression') &&
    options.allowTypedFunctionExpressions &&
    isVariableTypedWithFunction(node)
  ) {
    return { shouldReport: false, reason: null }
  }

  // Allow higher order functions option
  if (options.allowHigherOrderFunctions && isHigherOrderFunction(node)) {
    return { shouldReport: false, reason: null }
  }

  return { shouldReport: true, reason: 'Missing return type on exported function' }
}

export const explicitModuleBoundaryTypesRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Require explicit return types on exported functions. Explicit return types on module boundaries improve API documentation and help catch type errors at compile time.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/explicit-module-boundary-types',
    },
    schema: [
      {
        type: 'object',
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
        additionalProperties: false,
      },
    ],
    fixable: undefined,
  },

  create(context: RuleContext): RuleVisitor {
    const rawOptions = context.config.options
    const options: ExplicitModuleBoundaryTypesOptions = (
      Array.isArray(rawOptions) && rawOptions.length > 0 ? rawOptions[0] : {}
    ) as ExplicitModuleBoundaryTypesOptions

    function checkFunction(node: unknown, nodeType: string): void {
      const { shouldReport: report, reason } = shouldReport(node, nodeType, options)

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

export default explicitModuleBoundaryTypesRule
