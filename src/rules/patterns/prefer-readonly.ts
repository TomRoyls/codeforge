import type {
  RuleDefinition,
  RuleContext,
  RuleVisitor,
  SourceLocation,
} from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'
import { extractRuleOptions } from '../../utils/options-helpers.js'

interface PreferReadonlyOptions {
  readonly ignoreLocalVariables?: boolean
  readonly ignorePrivateMembers?: boolean
}

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

interface VariableInfo {
  name: string
  isMutable: boolean
  isArrayOrObject: boolean
  isPrivate: boolean
  isLocal: boolean
  loc: SourceLocation
}

interface ClassPropertyInfo {
  name: string
  className: string | null
  isReadonly: boolean
  isPrivate: boolean
  hasInitialValue: boolean
  loc: SourceLocation
}

function isArrayOrObjectInitializer(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>

  if (n.type === 'ArrayExpression') {
    return true
  }

  if (n.type === 'ObjectExpression') {
    return true
  }

  if (n.type === 'NewExpression') {
    const callee = (n as Record<string, unknown>).callee as Record<string, unknown> | undefined
    if (callee?.type === 'Identifier') {
      const name = callee.name as string
      return name === 'Array' || name === 'Object' || name === 'Map' || name === 'Set'
    }
  }

  if (n.type === 'TSAsExpression' || n.type === 'TSTypeAssertion') {
    const expression = (n as Record<string, unknown>).expression
    return isArrayOrObjectInitializer(expression)
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

  return (n as Record<string, unknown>).object
}

function isMutatingMethod(methodName: string): boolean {
  return MUTATING_ARRAY_METHODS.has(methodName)
}

function isPrivateMember(name: string): boolean {
  return name.startsWith('_') || name.startsWith('#')
}

export const preferReadonlyRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Suggest using readonly for arrays and objects that are never modified for better immutability guarantees.',
      category: 'patterns',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/prefer-readonly',
    },
    schema: [
      {
        type: 'object',
        properties: {
          ignoreLocalVariables: {
            type: 'boolean',
          },
          ignorePrivateMembers: {
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context: RuleContext): RuleVisitor {
    const options = extractRuleOptions<PreferReadonlyOptions>(context.config.options, {
      ignoreLocalVariables: false,
      ignorePrivateMembers: false,
    })

    const ignoreLocalVariables = options.ignoreLocalVariables
    const ignorePrivateMembers = options.ignorePrivateMembers

    const variables = new Map<string, VariableInfo>()
    const classProperties = new Map<string, ClassPropertyInfo>()
    let currentClassName: string | null = null
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
      VariableDeclarator(node: unknown): void {
        if (!node || typeof node !== 'object') {
          return
        }

        const n = node as Record<string, unknown>
        const id = n.id as Record<string, unknown> | undefined
        const init = n.init

        if (!id || id.type !== 'Identifier') {
          return
        }

        const name = id.name as string
        if (!name) {
          return
        }

        if (!isArrayOrObjectInitializer(init)) {
          return
        }

        const parent = n.parent as Record<string, unknown> | undefined
        const kind = (parent?.kind as string) ?? 'let'
        const isConst = kind === 'const'

        if (isConst) {
          return
        }

        const isPrivate = isPrivateMember(name)
        const loc = extractLocation(node)

        variables.set(name, {
          name,
          isMutable: false,
          isArrayOrObject: true,
          isPrivate,
          isLocal: true,
          loc,
        })
      },

      Property(node: unknown): void {
        if (!node || typeof node !== 'object') {
          return
        }

        const n = node as Record<string, unknown>
        const key = n.key as Record<string, unknown> | undefined
        const value = n.value

        if (!key || key.type !== 'Identifier') {
          return
        }

        const name = key.name as string
        if (!name) {
          return
        }

        if (!isArrayOrObjectInitializer(value)) {
          return
        }

        const isPrivate = isPrivateMember(name)
        const loc = extractLocation(node)

        variables.set(name, {
          name,
          isMutable: false,
          isArrayOrObject: true,
          isPrivate,
          isLocal: false,
          loc,
        })
      },

      ClassDeclaration(node: unknown): void {
        if (!node || typeof node !== 'object') {
          return
        }
        const n = node as Record<string, unknown>
        const id = n.id as Record<string, unknown> | undefined
        currentClassName = id && typeof id.name === 'string' ? id.name : null
      },

      'ClassDeclaration:exit'(): void {
        currentClassName = null
      },

      ClassExpression(node: unknown): void {
        if (!node || typeof node !== 'object') {
          return
        }
        const n = node as Record<string, unknown>
        const id = n.id as Record<string, unknown> | undefined
        currentClassName = id && typeof id.name === 'string' ? id.name : null
      },

      'ClassExpression:exit'(): void {
        currentClassName = null
      },

      MethodDefinition(node: unknown): void {
        if (!node || typeof node !== 'object') {
          return
        }
        const n = node as Record<string, unknown>
        const kind = n.kind as string | undefined
        inConstructor = kind === 'constructor'
      },

      'MethodDefinition:exit'(): void {
        inConstructor = false
      },

      PropertyDefinition(node: unknown): void {
        if (!node || typeof node !== 'object') {
          return
        }

        const n = node as Record<string, unknown>
        const key = n.key as Record<string, unknown> | undefined
        const value = n.value
        const readonly = n.readonly as boolean | undefined

        if (readonly === true) {
          return
        }

        let name: string | null = null
        let isPrivate = false

        if (key?.type === 'Identifier') {
          name = key.name as string
          isPrivate = isPrivateMember(name)
        } else if (key?.type === 'PrivateIdentifier') {
          name = key.name as string
          isPrivate = true
        }

        if (!name) {
          return
        }

        const loc = extractLocation(node)
        const propertyKey = `${currentClassName ?? 'unknown'}.${name}`

        classProperties.set(propertyKey, {
          name,
          className: currentClassName,
          isReadonly: false,
          isPrivate,
          hasInitialValue: value !== null && value !== undefined,
          loc,
        })
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
          markAsMutable(leftNode.name as string)
        } else if (leftNode.type === 'MemberExpression') {
          checkMemberMutation(left)
          const obj = leftNode.object as Record<string, unknown> | undefined
          if (obj?.type === 'ThisExpression' && !inConstructor) {
            const prop = leftNode.property as Record<string, unknown> | undefined
            if (prop?.type === 'Identifier' && typeof prop.name === 'string') {
              const propertyKey = `${currentClassName ?? 'unknown'}.${prop.name}`
              const classProp = classProperties.get(propertyKey)
              if (classProp) {
                classProp.isReadonly = true
              }
            }
          }
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
          checkMemberMutation(argument)
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
        if (!isMutatingMethod(methodName)) {
          return
        }

        checkMemberMutation(callee.object)
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
            checkMemberMutation(argument)
          }
        }
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
            message: `Variable '${info.name}' is an array or object that is never modified. Consider using 'const' with 'as const' or a 'readonly' type for better immutability.`,
            loc: info.loc,
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
            message: `Class property '${info.name}' is never reassigned outside the constructor. Consider using the 'readonly' modifier for better immutability.`,
            loc: info.loc,
          })
        }
      },
    }
  },
}

export default preferReadonlyRule
