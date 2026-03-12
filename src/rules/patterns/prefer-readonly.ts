import type {
  RuleDefinition,
  RuleContext,
  RuleVisitor,
  SourceLocation,
} from '../../plugins/types.js'

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

function extractLocation(node: unknown): SourceLocation {
  const defaultLoc: SourceLocation = {
    start: { line: 1, column: 0 },
    end: { line: 1, column: 1 },
  }

  if (!node || typeof node !== 'object') {
    return defaultLoc
  }

  const n = node as Record<string, unknown>
  const loc = n.loc as Record<string, unknown> | undefined

  if (!loc) {
    return defaultLoc
  }

  const start = loc.start as Record<string, unknown> | undefined
  const end = loc.end as Record<string, unknown> | undefined

  return {
    start: {
      line: typeof start?.line === 'number' ? start.line : 1,
      column: typeof start?.column === 'number' ? start.column : 0,
    },
    end: {
      line: typeof end?.line === 'number' ? end.line : 1,
      column: typeof end?.column === 'number' ? end.column : 0,
    },
  }
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
    fixable: undefined,
  },

  create(context: RuleContext): RuleVisitor {
    const rawOptions = context.config.options
    const options: PreferReadonlyOptions = (
      Array.isArray(rawOptions) && rawOptions.length > 0 ? rawOptions[0] : {}
    ) as PreferReadonlyOptions

    const ignoreLocalVariables = options.ignoreLocalVariables ?? false
    const ignorePrivateMembers = options.ignorePrivateMembers ?? false

    const variables = new Map<string, VariableInfo>()

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
      },
    }
  },
}

export default preferReadonlyRule
