import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import {
  extractLocation,
  isNewExpression,
  isCallExpression,
  getIdentifierName,
} from '../../utils/ast-helpers.js'

const INFERRABLE_CONSTRUCTORS = new Set([
  'Array',
  'Map',
  'Set',
  'WeakMap',
  'WeakSet',
  'Promise',
  'ReadonlyArray',
  'ReadonlyMap',
  'ReadonlySet',
  'Record',
  'Partial',
  'Required',
  'Pick',
  'Omit',
  'Exclude',
  'Extract',
  'NonNullable',
  'ReturnType',
  'Parameters',
  'InstanceType',
])

const INFERRABLE_FUNCTIONS = new Set([
  'Promise.resolve',
  'Promise.reject',
  'Promise.all',
  'Promise.allSettled',
  'Promise.race',
  'Promise.any',
  'Array.from',
  'Array.of',
  'Object.keys',
  'Object.values',
  'Object.entries',
  'Object.assign',
])

function hasTypeArguments(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }
  const n = node as Record<string, unknown>
  const typeArgs = n.typeArguments as Record<string, unknown> | undefined
  const params = typeArgs?.params as unknown[] | undefined
  return Array.isArray(params) && params.length > 0
}

function getArguments(node: unknown): unknown[] {
  if (!node || typeof node !== 'object') {
    return []
  }
  const n = node as Record<string, unknown>
  return (n.arguments as unknown[]) ?? []
}

function getCalleeFullName(node: unknown): string | null {
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

function shouldReport(node: unknown): { shouldReport: boolean; reason: string } {
  if (!isNewExpression(node) && !isCallExpression(node)) {
    return { shouldReport: false, reason: '' }
  }

  const n = node as Record<string, unknown>
  const callee = n.callee as unknown

  if (!hasTypeArguments(node)) {
    return { shouldReport: false, reason: '' }
  }

  const calleeName = getIdentifierName(callee)
  const calleeFullName = getCalleeFullName(node)
  const args = getArguments(node)

  if (isNewExpression(node) && calleeName && isInferrableConstructor(calleeName)) {
    if (calleeName === 'Array') {
      if (args.length === 0) {
        return {
          shouldReport: true,
          reason: `Unnecessary type argument: Array type can be inferred or use 'any[]' directly`,
        }
      }
      return {
        shouldReport: true,
        reason: `Unnecessary type argument: Array type can be inferred from constructor arguments`,
      }
    }

    if (['Map', 'Set', 'WeakMap', 'WeakSet'].includes(calleeName)) {
      if (args.length === 0) {
        return {
          shouldReport: true,
          reason: `Unnecessary type argument: ${calleeName} type can be inferred from usage or use '${calleeName}<any, any>' if needed`,
        }
      }
      return {
        shouldReport: true,
        reason: `Unnecessary type argument: ${calleeName} type can be inferred from constructor arguments`,
      }
    }

    if (calleeName === 'Promise') {
      return {
        shouldReport: true,
        reason: `Unnecessary type argument: Promise type can be inferred from executor function`,
      }
    }

    return {
      shouldReport: true,
      reason: `Unnecessary type argument: ${calleeName} type can potentially be inferred`,
    }
  }

  if (isCallExpression(node)) {
    if (calleeFullName && isInferrableFunction(calleeFullName)) {
      return {
        shouldReport: true,
        reason: `Unnecessary type argument: ${calleeFullName} type can be inferred from arguments`,
      }
    }

    if (calleeName && isInferrableConstructor(calleeName)) {
      return {
        shouldReport: true,
        reason: `Unnecessary type argument: ${calleeName} type can be inferred`,
      }
    }
  }

  return { shouldReport: false, reason: '' }
}

export const noUnnecessaryTypeArgumentsRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Disallow explicit type arguments that can be inferred by TypeScript. Explicit type arguments are unnecessary when TypeScript can infer them from the context.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-type-arguments',
    },
    schema: [],
    fixable: undefined,
  },

  create(context: RuleContext): RuleVisitor {
    return {
      NewExpression(node: unknown): void {
        const result = shouldReport(node)
        if (result.shouldReport) {
          const location = extractLocation(node)
          context.report({
            message: result.reason,
            loc: location,
          })
        }
      },

      CallExpression(node: unknown): void {
        const result = shouldReport(node)
        if (result.shouldReport) {
          const location = extractLocation(node)
          context.report({
            message: result.reason,
            loc: location,
          })
        }
      },
    }
  },
}

export default noUnnecessaryTypeArgumentsRule
