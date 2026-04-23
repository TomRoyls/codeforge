import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { getIdentifierName, isCallExpression, isNewExpression } from '../../utils/ast-helpers.js'

const INFERRABLE_CONSTRUCTORS = new Set([
  'Array',
  'Exclude',
  'Extract',
  'InstanceType',
  'Map',
  'NonNullable',
  'Omit',
  'Parameters',
  'Partial',
  'Pick',
  'Promise',
  'ReadonlyArray',
  'ReadonlyMap',
  'ReadonlySet',
  'Record',
  'Required',
  'ReturnType',
  'Set',
  'WeakMap',
  'WeakSet',
])

const INFERRABLE_FUNCTIONS = new Set([
  'Array.from',
  'Array.of',
  'Object.assign',
  'Object.entries',
  'Object.keys',
  'Object.values',
  'Promise.all',
  'Promise.allSettled',
  'Promise.any',
  'Promise.race',
  'Promise.reject',
  'Promise.resolve',
])

function hasTypeArguments(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  const typeArgs = (n.typeParameters ?? n.typeArguments) as Record<string, unknown> | undefined
  const params = typeArgs?.params as undefined | unknown[]
  return Array.isArray(params) && params.length > 0
}

function getArguments(node: unknown): unknown[] {
  if (!node || typeof node !== 'object') {
    return []
  }

  const n = node as Record<string, unknown>
  return (n.arguments as unknown[]) ?? []
}

function getCalleeFullName(node: unknown): null | string {
  if (!node || typeof node !== 'object') {
    return null
  }

  const n = node as Record<string, unknown>
  const callee = n.callee as unknown

  if (!callee || typeof callee !== 'object') {
    return null
  }

  const c = callee as Record<string, unknown>

  if (c.type === 'MemberExpression') {
    const obj = c.object as unknown
    const prop = c.property as unknown

    if (obj && typeof obj === 'object' && prop && typeof prop === 'object') {
      const objName = (obj as Record<string, unknown>).name as string
      const propName = (prop as Record<string, unknown>).name as string
      if (objName && propName) {
        return `${objName}.${propName}`
      }
    }
  }

  return null
}

function isInferrableConstructor(name: string): boolean {
  return INFERRABLE_CONSTRUCTORS.has(name)
}

function isInferrableFunction(fullName: string): boolean {
  return INFERRABLE_FUNCTIONS.has(fullName)
}

function shouldReport(node: unknown): { reason: string; shouldReport: boolean; } {
  if (!isNewExpression(node) && !isCallExpression(node)) {
    return { reason: '', shouldReport: false }
  }

  const n = node as Record<string, unknown>
  const callee = n.callee as unknown

  if (!hasTypeArguments(node)) {
    return { reason: '', shouldReport: false }
  }

  const calleeName = getIdentifierName(callee)
  const calleeFullName = getCalleeFullName(node)
  const args = getArguments(node)

  if (isNewExpression(node) && calleeName && isInferrableConstructor(calleeName)) {
    if (calleeName === 'Array') {
      if (args.length === 0) {
        return {
          reason: `Unnecessary type argument: Array type can be inferred or use 'any[]' directly`,
          shouldReport: true,
        }
      }

      return {
        reason: `Unnecessary type argument: Array type can be inferred from constructor arguments`,
        shouldReport: true,
      }
    }

    if (['Map', 'Set', 'WeakMap', 'WeakSet'].includes(calleeName)) {
      if (args.length === 0) {
        return {
          reason: `Unnecessary type argument: ${calleeName} type can be inferred from usage or use '${calleeName}<any, any>' if needed`,
          shouldReport: true,
        }
      }

      return {
        reason: `Unnecessary type argument: ${calleeName} type can be inferred from constructor arguments`,
        shouldReport: true,
      }
    }

    if (calleeName === 'Promise') {
      return {
        reason: `Unnecessary type argument: Promise type can be inferred from executor function`,
        shouldReport: true,
      }
    }

    return {
      reason: `Unnecessary type argument: ${calleeName} type can potentially be inferred`,
      shouldReport: true,
    }
  }

  if (isCallExpression(node)) {
    if (calleeFullName && isInferrableFunction(calleeFullName)) {
      return {
        reason: `Unnecessary type argument: ${calleeFullName} type can be inferred from arguments`,
        shouldReport: true,
      }
    }

    if (calleeName && isInferrableConstructor(calleeName)) {
      return {
        reason: `Unnecessary type argument: ${calleeName} type can be inferred`,
        shouldReport: true,
      }
    }
  }

  return { reason: '', shouldReport: false }
}

export const noUnnecessaryTypeArgumentsRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const result = shouldReport(node)
        if (result.shouldReport) {
          const location = extractLocation(node)
          context.report({
            loc: location,
            message: result.reason,
          })
        }
      },

      NewExpression(node: unknown): void {
        const result = shouldReport(node)
        if (result.shouldReport) {
          const location = extractLocation(node)
          context.report({
            loc: location,
            message: result.reason,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow explicit type arguments that can be inferred by TypeScript. Explicit type arguments are unnecessary when TypeScript can infer them from the context.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-type-arguments',
    },
    fixable: undefined,
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryTypeArgumentsRule
