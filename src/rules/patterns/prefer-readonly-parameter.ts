import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
  SourceLocation,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { type ASTNode, toASTNode } from '../../utils/ast-helpers.js'
import { MUTATING_ARRAY_METHODS } from '../../utils/constants.js'

interface ParameterInfo {
  isArrayOrObjectType: boolean
  isMutable: boolean
  loc: SourceLocation
  name: string
  typeAnnotation: null | string
}

function isArrayOrObjectType(typeAnnotation: unknown): boolean {
  const t = toASTNode(typeAnnotation)
  if (!t) return false

  if (t.type === 'TSArrayType' || t.type === 'TSTypeLiteral' || t.type === 'TSObjectKeyword') return true

  if (t.type === 'TSTypeReference') {
    const typeName = toASTNode(t.typeName)
    if (typeName?.type === 'Identifier') {
      const {name} = typeName
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

  return false
}

function isReadonlyType(typeAnnotation: unknown): boolean {
  const t = toASTNode(typeAnnotation)
  if (!t) return false

  if (t.type === 'TSTypeReference') {
    const typeName = toASTNode(t.typeName)
    if (typeName?.type === 'Identifier') {
      const {name} = typeName
      return name === 'ReadonlyArray' || name === 'ReadonlyMap' || name === 'ReadonlySet' || name === 'Readonly'
    }
  }

  return false
}

function getIdentifierName(node: unknown): null | string {
  const n = toASTNode(node)
  if (n?.type !== 'Identifier') return null
  return n.name ?? null
}

function getMemberExpressionObject(node: unknown): unknown {
  const n = toASTNode(node)
  if (n?.type !== 'MemberExpression') return null
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
  create(context: RuleContext): RuleVisitor {
    const params = new Map<string, ParameterInfo>()

    function collectParameters(node: unknown): void {
      const n = toASTNode(node)
      if (!n) return

      const {type} = n

      // Handle regular function parameters
      if (type === 'Identifier' && n.typeAnnotation) {
        const ta = toASTNode(n.typeAnnotation)
        const typeAnnotation = ta?.typeAnnotation
        if (isArrayOrObjectType(typeAnnotation) && !isReadonlyType(typeAnnotation)) {
          const {name} = n
          if (name) {
            params.set(name, {
              isArrayOrObjectType: true,
              isMutable: false,
              loc: extractLocation(node),
              name,
              typeAnnotation: null,
            })
          }
        }
      }

      // Handle rest parameters: ...args: string[]
      if (type === 'RestElement') {
        const argument = toASTNode(n.argument)
        if (argument?.type === 'Identifier' && n.typeAnnotation) {
          const ta = toASTNode(n.typeAnnotation)
          const typeAnnotation = ta?.typeAnnotation
          if (isArrayOrObjectType(typeAnnotation) && !isReadonlyType(typeAnnotation)) {
            const {name} = argument
            if (name) {
              params.set(name, {
                isArrayOrObjectType: true,
                isMutable: false,
                loc: extractLocation(node),
                name,
                typeAnnotation: null,
              })
            }
          }
        }
      }

      // Handle object/array destructuring with type: { a, b }: { a: string; b: number }
      if ((type === 'ObjectPattern' || type === 'ArrayPattern') && n.typeAnnotation) {
        const ta = toASTNode(n.typeAnnotation)
        const typeAnnotation = ta?.typeAnnotation
        if (isArrayOrObjectType(typeAnnotation) && !isReadonlyType(typeAnnotation)) {
          const items = n.properties ?? n.elements ?? []
          for (const prop of items) {
            const p = toASTNode(prop)
            if (!p) continue
            let value = p
            if (p.type === 'Property') {
              value = toASTNode(p.value) ?? p
            }

            if (value?.type === 'Identifier' && value.name) {
              params.set(value.name, {
                isArrayOrObjectType: true,
                isMutable: false,
                loc: extractLocation(prop),
                name: value.name,
                typeAnnotation: null,
              })
            }
          }
        }
      }
    }

    return {
      ArrowFunctionExpression(node: unknown): void {
        const n = toASTNode(node)
        if (n?.params) {
          for (const param of n.params) {
            collectParameters(param)
          }
        }
      },

      'ArrowFunctionExpression:exit'(): void {
        reportAndClear()
      },

      AssignmentExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n?.left) return

        const left = n.left as ASTNode
        if (left.type === 'Identifier') {
          const info = params.get(left.name ?? '')
          if (info) info.isMutable = true
        } else if (left.type === 'MemberExpression') {
          checkMemberMutation(n.left, params)
        }
      },

      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        const callee = toASTNode(n?.callee)
        if (callee?.type !== 'MemberExpression') return

        const property = toASTNode(callee.property)
        if (property?.type !== 'Identifier') return

        if (isMutatingMethod(property.name ?? '')) {
          checkMemberMutation(callee.object, params)
        }
      },

      FunctionDeclaration(node: unknown): void {
        const n = toASTNode(node)
        if (n?.params) {
          for (const param of n.params) {
            collectParameters(param)
          }
        }
      },

      'FunctionDeclaration:exit'(): void {
        reportAndClear()
      },

      FunctionExpression(node: unknown): void {
        const n = toASTNode(node)
        if (n?.params) {
          for (const param of n.params) {
            collectParameters(param)
          }
        }
      },

      'FunctionExpression:exit'(): void {
        reportAndClear()
      },

      UnaryExpression(node: unknown): void {
        const n = toASTNode(node)
        if (n?.operator === 'delete' && n.argument) {
          const argNode = toASTNode(n.argument)
          if (argNode?.type === 'MemberExpression') {
            checkMemberMutation(n.argument, params)
          }
        }
      },

      UpdateExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n?.argument) return

        const argNode = toASTNode(n.argument)
        if (argNode?.type === 'MemberExpression') {
          checkMemberMutation(n.argument, params)
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
          loc: info.loc,
          message: `Parameter '${info.name}' is an array or object type that is never modified. Consider using 'readonly' for better immutability guarantees.`,
        })
      }

      params.clear()
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Suggest using readonly for array/object parameters that are not modified within the function.',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/prefer-readonly-parameter',
    },
    fixable: 'code',
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default preferReadonlyParameterRule
