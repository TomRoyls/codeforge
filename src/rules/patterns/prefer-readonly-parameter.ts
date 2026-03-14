import type {
  RuleDefinition,
  RuleContext,
  RuleVisitor,
  SourceLocation,
} from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

const MUTATING_ARRAY_METHODS = new Set([
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse',
  'fill',
  'copyWithin',
])

interface ParameterInfo {
  name: string
  isMutable: boolean
  isArrayOrObjectType: boolean
  loc: SourceLocation
  typeAnnotation: string | null
}

function isArrayOrObjectType(typeAnnotation: unknown): boolean {
  if (!typeAnnotation || typeof typeAnnotation !== 'object') {
    return false
  }

  const t = typeAnnotation as Record<string, unknown>

  // ArrayTypeAnnotation: string[]
  if (t.type === 'TSArrayType') {
    return true
  }

  // TypeReference: Array<T>, Object, Map, Set, Record<K, V>
  if (t.type === 'TSTypeReference') {
    const typeName = t.typeName as Record<string, unknown> | undefined
    if (typeName?.type === 'Identifier') {
      const name = typeName.name as string
      return (
        name === 'Array' ||
        name === 'Object' ||
        name === 'Map' ||
        name === 'Set' ||
        name === 'Record' ||
        name === 'ReadonlyArray' ||
        name === 'ReadonlyMap' ||
        name === 'ReadonlySet' ||
        name === 'Readonly'
      )
    }
  }

  // TypeLiteral: { [key: string]: any }, { foo: string }
  if (t.type === 'TSTypeLiteral') {
    return true
  }

  // Object keyword type
  if (t.type === 'TSObjectKeyword') {
    return true
  }

  return false
}

function isReadonlyType(typeAnnotation: unknown): boolean {
  if (!typeAnnotation || typeof typeAnnotation !== 'object') {
    return false
  }

  const t = typeAnnotation as Record<string, unknown>

  if (t.type === 'TSTypeReference') {
    const typeName = t.typeName as Record<string, unknown> | undefined
    if (typeName?.type === 'Identifier') {
      const name = typeName.name as string
      if (
        name === 'ReadonlyArray' ||
        name === 'ReadonlyMap' ||
        name === 'ReadonlySet' ||
        name === 'Readonly'
      ) {
        return true
      }
    }
  }

  return false
}

function getIdentifierName(node: unknown): string | null {
  if (!node || typeof node !== 'object') {
    return null
  }
  const n = node as Record<string, unknown>
  if (n.type === 'Identifier') {
    return n.name as string
  }
  return null
}

function getMemberExpressionObject(node: unknown): unknown {
  if (!node || typeof node !== 'object') {
    return null
  }
  const n = node as Record<string, unknown>
  if (n.type !== 'MemberExpression') {
    return null
  }
  return n.object
}

function isMutatingMethod(methodName: string): boolean {
  return MUTATING_ARRAY_METHODS.has(methodName)
}

function checkMemberMutation(objectNode: unknown, params: Map<string, ParameterInfo>): void {
  const name = getIdentifierName(objectNode)
  if (name) {
    const info = params.get(name)
    if (info) {
      info.isMutable = true
    }
  } else {
    const memberObj = getMemberExpressionObject(objectNode)
    if (memberObj) {
      checkMemberMutation(memberObj, params)
    }
  }
}

export const preferReadonlyParameterRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Suggest using readonly for array/object parameters that are not modified within the function.',
      category: 'patterns',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/prefer-readonly-parameter',
    },
    schema: [],
    fixable: 'code',
  },

  create(context: RuleContext): RuleVisitor {
    const params = new Map<string, ParameterInfo>()

    function collectParameters(node: unknown): void {
      if (!node || typeof node !== 'object') {
        return
      }

      const n = node as Record<string, unknown>
      const type = n.type as string | undefined

      // Handle regular function parameters
      if (type === 'Identifier' && n.typeAnnotation) {
        const typeAnnotation = (n.typeAnnotation as Record<string, unknown>)?.typeAnnotation
        if (isArrayOrObjectType(typeAnnotation) && !isReadonlyType(typeAnnotation)) {
          const name = n.name as string
          if (name) {
            params.set(name, {
              name,
              isMutable: false,
              isArrayOrObjectType: true,
              loc: extractLocation(node),
              typeAnnotation: null,
            })
          }
        }
      }

      // Handle rest parameters: ...args: string[]
      if (type === 'RestElement') {
        const argument = n.argument as Record<string, unknown> | undefined
        if (argument?.type === 'Identifier' && n.typeAnnotation) {
          const typeAnnotation = (n.typeAnnotation as Record<string, unknown>)?.typeAnnotation
          if (isArrayOrObjectType(typeAnnotation) && !isReadonlyType(typeAnnotation)) {
            const name = argument.name as string
            if (name) {
              params.set(name, {
                name,
                isMutable: false,
                isArrayOrObjectType: true,
                loc: extractLocation(node),
                typeAnnotation: null,
              })
            }
          }
        }
      }

      // Handle object/array destructuring with type: { a, b }: { a: string; b: number }
      if (type === 'ObjectPattern' || type === 'ArrayPattern') {
        if (n.typeAnnotation) {
          const typeAnnotation = (n.typeAnnotation as Record<string, unknown>)?.typeAnnotation
          if (isArrayOrObjectType(typeAnnotation) && !isReadonlyType(typeAnnotation)) {
            // For destructured params, we need to track the individual bindings
            const properties = (n.properties as unknown[]) ?? (n.elements as unknown[]) ?? []
            for (const prop of properties) {
              if (prop && typeof prop === 'object') {
                const p = prop as Record<string, unknown>
                let value = p
                if (p.type === 'Property') {
                  value = p.value as Record<string, unknown>
                }
                if (value?.type === 'Identifier') {
                  const name = value.name as string
                  if (name) {
                    params.set(name, {
                      name,
                      isMutable: false,
                      isArrayOrObjectType: true,
                      loc: extractLocation(prop),
                      typeAnnotation: null,
                    })
                  }
                }
              }
            }
          }
        }
      }
    }

    return {
      FunctionDeclaration(node: unknown): void {
        if (!node || typeof node !== 'object') {
          return
        }
        const n = node as Record<string, unknown>
        const parameters = n.params as unknown[] | undefined
        if (parameters) {
          for (const param of parameters) {
            collectParameters(param)
          }
        }
      },

      'FunctionDeclaration:exit'(): void {
        reportAndClear()
      },

      FunctionExpression(node: unknown): void {
        if (!node || typeof node !== 'object') {
          return
        }
        const n = node as Record<string, unknown>
        const parameters = n.params as unknown[] | undefined
        if (parameters) {
          for (const param of parameters) {
            collectParameters(param)
          }
        }
      },

      'FunctionExpression:exit'(): void {
        reportAndClear()
      },

      ArrowFunctionExpression(node: unknown): void {
        if (!node || typeof node !== 'object') {
          return
        }
        const n = node as Record<string, unknown>
        const parameters = n.params as unknown[] | undefined
        if (parameters) {
          for (const param of parameters) {
            collectParameters(param)
          }
        }
      },

      'ArrowFunctionExpression:exit'(): void {
        reportAndClear()
      },

      AssignmentExpression(node: unknown): void {
        if (!node || typeof node !== 'object') {
          return
        }
        const n = node as Record<string, unknown>
        const left = n.left
        if (!left) {
          return
        }
        const leftNode = left as Record<string, unknown>
        if (leftNode.type === 'Identifier') {
          const info = params.get(leftNode.name as string)
          if (info) {
            info.isMutable = true
          }
        } else if (leftNode.type === 'MemberExpression') {
          checkMemberMutation(left, params)
        }
      },

      UpdateExpression(node: unknown): void {
        if (!node || typeof node !== 'object') {
          return
        }
        const n = node as Record<string, unknown>
        const argument = n.argument
        if (!argument) {
          return
        }
        const argNode = argument as Record<string, unknown>
        if (argNode.type === 'MemberExpression') {
          checkMemberMutation(argument, params)
        }
      },

      CallExpression(node: unknown): void {
        if (!node || typeof node !== 'object') {
          return
        }
        const n = node as Record<string, unknown>
        const callee = n.callee as Record<string, unknown> | undefined
        if (!callee || callee.type !== 'MemberExpression') {
          return
        }
        const property = callee.property as Record<string, unknown> | undefined
        if (!property || property.type !== 'Identifier') {
          return
        }
        const methodName = property.name as string
        if (isMutatingMethod(methodName)) {
          checkMemberMutation(callee.object, params)
        }
      },

      UnaryExpression(node: unknown): void {
        if (!node || typeof node !== 'object') {
          return
        }
        const n = node as Record<string, unknown>
        const operator = n.operator as string | undefined
        const argument = n.argument
        if (operator === 'delete' && argument) {
          const argNode = argument as Record<string, unknown>
          if (argNode.type === 'MemberExpression') {
            checkMemberMutation(argument, params)
          }
        }
      },
    }

    function reportAndClear(): void {
      for (const [, info] of params) {
        if (info.isMutable) {
          continue
        }
        if (!info.isArrayOrObjectType) {
          continue
        }
        context.report({
          message: `Parameter '${info.name}' is an array or object type that is never modified. Consider using 'readonly' for better immutability guarantees.`,
          loc: info.loc,
        })
      }
      params.clear()
    }
  },
}

export default preferReadonlyParameterRule
