import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { getIdentifierName, isCallExpression, isNewExpression, toASTNode } from '../../utils/ast-helpers.js'

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
  const n = toASTNode(node)
  if (!n) return false
  const typeArgs = toASTNode(n.typeParameters ?? n.typeArguments)
  return Array.isArray(typeArgs?.params) && (typeArgs?.params?.length ?? 0) > 0
}

function getArguments(node: unknown): unknown[] {
  const n = toASTNode(node)
  if (!Array.isArray(n?.arguments)) return []
  return n.arguments
}

function getCalleeFullName(node: unknown): null | string {
  const n = toASTNode(node)
  if (!n) return null
  const c = toASTNode(n.callee)
  if (!c) return null

  if (c.type === 'MemberExpression') {
    const obj = toASTNode(c.object)
    const prop = toASTNode(c.property)
    const objName = obj?.name
    const propName = prop?.name
    if (objName && propName) return `${objName}.${propName}`
  }

  return null
}

function isInferrableConstructor(name: string): boolean {
  return INFERRABLE_CONSTRUCTORS.has(name)
}

function isInferrableFunction(fullName: string): boolean {
  return INFERRABLE_FUNCTIONS.has(fullName)
}

function shouldReport(node: unknown): { reason: string; shouldReport: boolean } {
  if (!isNewExpression(node) && !isCallExpression(node)) {
    return { reason: '', shouldReport: false }
  }

  const n = toASTNode(node)
  if (!n) return { reason: '', shouldReport: false }
  const {callee} = n

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
