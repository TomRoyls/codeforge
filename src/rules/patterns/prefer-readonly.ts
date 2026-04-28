import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
  SourceLocation,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { type ASTNode, toASTNode } from '../../utils/ast-helpers.js'
import { MUTATING_ARRAY_METHODS } from '../../utils/constants.js'
import { extractRuleOptions } from '../../utils/options-helpers.js'

interface PreferReadonlyOptions {
  readonly ignoreLocalVariables?: boolean
  readonly ignorePrivateMembers?: boolean
}

interface VariableInfo {
  isArrayOrObject: boolean
  isLocal: boolean
  isMutable: boolean
  isPrivate: boolean
  loc: SourceLocation
  name: string
}

interface ClassPropertyInfo {
  className: null | string
  hasInitialValue: boolean
  isPrivate: boolean
  isReadonly: boolean
  loc: SourceLocation
  name: string
}

function isArrayOrObjectInitializer(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) return false

  if (n.type === 'ArrayExpression' || n.type === 'ObjectExpression') return true

  if (n.type === 'NewExpression') {
    const callee = toASTNode(n.callee)
    if (callee?.type === 'Identifier') {
      const {name} = callee
      return name === 'Array' || name === 'Object' || name === 'Map' || name === 'Set'
    }
  }

  if (n.type === 'TSAsExpression' || n.type === 'TSTypeAssertion') {
    return isArrayOrObjectInitializer(n.expression)
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

function isPrivateMember(name: string): boolean {
  return name.startsWith('_') || name.startsWith('#')
}

export const preferReadonlyRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const options = extractRuleOptions<PreferReadonlyOptions>(context.config.options, {
      ignoreLocalVariables: false,
      ignorePrivateMembers: false,
    })

    const {ignoreLocalVariables} = options
    const {ignorePrivateMembers} = options

    const variables = new Map<string, VariableInfo>()
    const classProperties = new Map<string, ClassPropertyInfo>()
    let currentClassName: null | string = null
    let inConstructor = false

    function markAsMutable(varName: string): void {
      const info = variables.get(varName)
      if (info) {
        info.isMutable = true
      }
    }

    function checkMemberMutation(objectNode: unknown): void {
      const name = getIdentifierName(objectNode)
      if (name) {
        markAsMutable(name)
      } else {
        const memberObj = getMemberExpressionObject(objectNode)
        if (memberObj) {
          checkMemberMutation(memberObj)
        }
      }
    }

    return {
      AssignmentExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n?.left) return

        const left = n.left as ASTNode

        if (left.type === 'Identifier') {
          markAsMutable(left.name ?? '')
        } else if (left.type === 'MemberExpression') {
          checkMemberMutation(n.left)
          const obj = toASTNode(left.object)
          if (obj?.type === 'ThisExpression' && !inConstructor) {
            const prop = toASTNode(left.property)
            if (prop?.type === 'Identifier' && prop.name) {
              const propertyKey = `${currentClassName ?? 'unknown'}.${prop.name}`
              const classProp = classProperties.get(propertyKey)
              if (classProp) {
                classProp.isReadonly = true
              }
            }
          }
        }
      },

      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n) return

        const callee = toASTNode(n.callee)
        if (callee?.type !== 'MemberExpression') return

        const property = toASTNode(callee.property)
        if (property?.type !== 'Identifier') return

        const methodName = property.name
        if (!methodName || !isMutatingMethod(methodName)) return

        checkMemberMutation(callee.object)
      },

      ClassDeclaration(node: unknown): void {
        const n = toASTNode(node)
        const id = toASTNode(n?.id)
        currentClassName = id?.name ?? null
      },

      'ClassDeclaration:exit'(): void {
        currentClassName = null
      },

      ClassExpression(node: unknown): void {
        const n = toASTNode(node)
        const id = toASTNode(n?.id)
        currentClassName = id?.name ?? null
      },

      'ClassExpression:exit'(): void {
        currentClassName = null
      },

      MethodDefinition(node: unknown): void {
        const n = toASTNode(node)
        inConstructor = n?.kind === 'constructor'
      },

      'MethodDefinition:exit'(): void {
        inConstructor = false
      },

      'Program:exit'(): void {
        for (const [, info] of variables) {
          if (info.isMutable) {
            continue
          }

          if (!info.isArrayOrObject) {
            continue
          }

          if (ignoreLocalVariables && info.isLocal) {
            continue
          }

          if (ignorePrivateMembers && info.isPrivate) {
            continue
          }

          context.report({
            loc: info.loc,
            message: `Variable '${info.name}' is an array or object that is never modified. Consider using 'const' with 'as const' or a 'readonly' type for better immutability.`,
          })
        }

        for (const [, info] of classProperties) {
          if (info.isReadonly) {
            continue
          }

          if (ignorePrivateMembers && info.isPrivate) {
            continue
          }

          context.report({
            loc: info.loc,
            message: `Class property '${info.name}' is never reassigned outside the constructor. Consider using the 'readonly' modifier for better immutability.`,
          })
        }
      },

      Property(node: unknown): void {
        const n = toASTNode(node)
        if (!n) return

        const key = toASTNode(n.key)
        if (key?.type !== 'Identifier' || !key.name) return

        if (!isArrayOrObjectInitializer(n.value)) return

        const {name} = key
        const isPrivate = isPrivateMember(name)
        const loc = extractLocation(node)

        variables.set(name, {
          isArrayOrObject: true,
          isLocal: false,
          isMutable: false,
          isPrivate,
          loc,
          name,
        })
      },

      PropertyDefinition(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.readonly === true) return

        const key = toASTNode(n.key)
        let name: null | string = null
        let isPrivate = false

        if (key?.type === 'Identifier') {
          name = key.name ?? null
          isPrivate = isPrivateMember(name ?? '')
        } else if (key?.type === 'PrivateIdentifier') {
          name = key.name ?? null
          isPrivate = true
        }

        if (!name) return

        const loc = extractLocation(node)
        const propertyKey = `${currentClassName ?? 'unknown'}.${name}`

        classProperties.set(propertyKey, {
          className: currentClassName,
          hasInitialValue: n.value !== null && n.value !== undefined,
          isPrivate,
          isReadonly: false,
          loc,
          name,
        })
      },

      UnaryExpression(node: unknown): void {
        const n = toASTNode(node)
        if (n?.operator === 'delete' && n.argument) {
          const argNode = toASTNode(n.argument)
          if (argNode?.type === 'MemberExpression') {
            checkMemberMutation(n.argument)
          }
        }
      },

      UpdateExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n?.argument) return

        const argNode = toASTNode(n.argument)
        if (argNode?.type === 'MemberExpression') {
          checkMemberMutation(n.argument)
        }
      },

      VariableDeclarator(node: unknown): void {
        const n = toASTNode(node)
        if (!n) return

        const id = toASTNode(n.id)
        if (id?.type !== 'Identifier' || !id.name) return

        const {name} = id

        if (!isArrayOrObjectInitializer(n.init)) return

        const parent = toASTNode(n.parent)
        const kind = (parent?.kind as string) ?? 'let'
        if (kind === 'const') return

        const isPrivate = isPrivateMember(name)
        const loc = extractLocation(node)

        variables.set(name, {
          isArrayOrObject: true,
          isLocal: true,
          isMutable: false,
          isPrivate,
          loc,
          name,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Suggest using readonly for arrays and objects that are never modified for better immutability guarantees.',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/prefer-readonly',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          ignoreLocalVariables: {
            type: 'boolean',
          },
          ignorePrivateMembers: {
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

export default preferReadonlyRule
