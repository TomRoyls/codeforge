import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'
import { extractRuleOptions } from '../../utils/options-helpers.js'

interface NoUnsafeAssignmentOptions {
  readonly allowAnyInGenericArrays?: boolean
}

function isAnyKeyword(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }
  const n = node as Record<string, unknown>
  return n.type === 'TSAnyKeyword'
}

function isArrayOfAny(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }
  const n = node as Record<string, unknown>
  if (n.type !== 'TSArrayType') {
    return false
  }
  return isAnyKeyword(n.elementType)
}

function isUnsafeAssignment(init: unknown, options: NoUnsafeAssignmentOptions): boolean {
  if (!init || typeof init !== 'object') {
    return false
  }
  const initNode = init as Record<string, unknown>

  // Check if the value is explicitly typed as any via type assertion
  if (initNode.type === 'TSAsExpression' || initNode.type === 'TSTypeAssertion') {
    const typeAnnotation = initNode.typeAnnotation as Record<string, unknown> | undefined
    if (isAnyKeyword(typeAnnotation)) {
      return true
    }
  }

  // Check for any in generic arrays if not allowed
  if (!options.allowAnyInGenericArrays && isArrayOfAny(initNode)) {
    return true
  }

  return false
}

function hasSpecificTypeAnnotation(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }
  const n = node as Record<string, unknown>
  const id = n.id as Record<string, unknown> | undefined
  if (!id) {
    return false
  }
  const typeAnnotation = id.typeAnnotation as Record<string, unknown> | undefined
  if (!typeAnnotation) {
    return false
  }
  const innerType = typeAnnotation.typeAnnotation as Record<string, unknown> | undefined
  if (!innerType) {
    return false
  }
  // Has a type annotation that is not 'any'
  return innerType.type !== 'TSAnyKeyword'
}

function getVariableName(node: unknown): string | null {
  if (!node || typeof node !== 'object') {
    return null
  }
  const n = node as Record<string, unknown>
  const id = n.id as Record<string, unknown> | undefined
  if (!id) {
    return null
  }
  if (id.type === 'Identifier' && typeof id.name === 'string') {
    return id.name
  }
  return null
}

export const noUnsafeAssignmentRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description:
        'Disallow assigning values with `any` type to variables with specific types. This prevents unsafe type assignments that bypass type safety.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-unsafe-assignment',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowAnyInGenericArrays: {
            type: 'boolean',
            default: false,
          },
        },
        additionalProperties: false,
      },
    ],
    fixable: undefined,
  },

  create(context: RuleContext): RuleVisitor {
    const options = extractRuleOptions<NoUnsafeAssignmentOptions>(context.config.options, {
      allowAnyInGenericArrays: false,
    })

    return {
      VariableDeclarator(node: unknown): void {
        if (!node || typeof node !== 'object') {
          return
        }
        const n = node as Record<string, unknown>
        const init = n.init

        // Check if the variable has a specific type annotation (not any)
        if (!hasSpecificTypeAnnotation(node)) {
          return
        }

        // Check if the initializer is an unsafe assignment
        if (init && isUnsafeAssignment(init, options)) {
          const varName = getVariableName(node)
          const location = extractLocation(node)
          context.report({
            message: varName
              ? `Unsafe assignment of an 'any' value to '${varName}'. This bypasses type safety.`
              : "Unsafe assignment of an 'any' value. This bypasses type safety.",
            loc: location,
          })
        }
      },

      AssignmentExpression(node: unknown): void {
        if (!node || typeof node !== 'object') {
          return
        }
        const n = node as Record<string, unknown>
        const right = n.right

        // Check if the right side is an unsafe assignment
        if (right && isUnsafeAssignment(right, options)) {
          const left = n.left as Record<string, unknown> | undefined
          let varName: string | null = null
          if (left && left.type === 'Identifier' && typeof left.name === 'string') {
            varName = left.name
          }

          const location = extractLocation(node)
          context.report({
            message: varName
              ? `Unsafe assignment of an 'any' value to '${varName}'. This bypasses type safety.`
              : "Unsafe assignment of an 'any' value. This bypasses type safety.",
            loc: location,
          })
        }
      },

      Property(node: unknown): void {
        if (!node || typeof node !== 'object') {
          return
        }
        const n = node as Record<string, unknown>
        const value = n.value

        // Check if the property value is an unsafe assignment
        if (value && isUnsafeAssignment(value, options)) {
          const key = n.key as Record<string, unknown> | undefined
          let propName: string | null = null
          if (key && key.type === 'Identifier' && typeof key.name === 'string') {
            propName = key.name
          }

          const location = extractLocation(node)
          context.report({
            message: propName
              ? `Unsafe assignment of an 'any' value to property '${propName}'. This bypasses type safety.`
              : "Unsafe assignment of an 'any' value to property. This bypasses type safety.",
            loc: location,
          })
        }
      },
    }
  },
}

export default noUnsafeAssignmentRule
