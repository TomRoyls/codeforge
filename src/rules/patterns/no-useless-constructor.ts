import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../ast/location-utils.js'

function isUselessConstructor(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>

  // Must be MethodDefinition with kind === 'constructor'
  if (n.type !== 'MethodDefinition' || n.kind !== 'constructor') return false

  // Protected or private constructors are useful (access control)
  if (n.accessibility === 'protected' || n.accessibility === 'private') return false

  // Get the function value
  const value = n.value as Record<string, unknown> | undefined
  if (!value) return false

  // Check params for decorators or parameter properties (TSParameterProperty)
  const params = (value.params as unknown[]) ?? []
  for (const param of params) {
    if (!param || typeof param !== 'object') continue
    const p = param as Record<string, unknown>
    // TSParameterProperty has accessibility, readonly, or isPrivate
    if (p.type === 'TSParameterProperty') return false
    // Has decorators
    if (Array.isArray(p.decorators) && p.decorators.length > 0) return false
    if (p.accessibility) return false
  }

  // Get body statements
  const body = value.body as Record<string, unknown> | undefined
  if (!body) return false
  const statements = (body.body as unknown[]) ?? []

  // Case 1: Empty constructor body
  if (statements.length === 0) return true

  // Case 2: Single super() call that forwards params
  if (statements.length === 1) {
    const stmt = statements[0] as Record<string, unknown>
    if (stmt.type !== 'ExpressionStatement') return false

    const expr = stmt.expression as Record<string, unknown>
    if (!expr || expr.type !== 'CallExpression') return false

    const callee = expr.callee as Record<string, unknown>
    if (!callee || callee.type !== 'Super') return false

    const superArgs = (expr.arguments as unknown[]) ?? []

    // No params, no args: useless super()
    if (params.length === 0 && superArgs.length === 0) return true

    // Rest param: constructor(...args) { super(...args) }
    if (params.length === 1) {
      const param = params[0] as Record<string, unknown>
      if (param.type === 'RestElement') {
        const paramArg = param.argument as Record<string, unknown>
        if (superArgs.length === 1) {
          const superArg = superArgs[0] as Record<string, unknown>
          if (superArg.type === 'SpreadElement') {
            const spreadArg = superArg.argument as Record<string, unknown>
            if (
              paramArg?.type === 'Identifier' &&
              spreadArg?.type === 'Identifier' &&
              paramArg.name === spreadArg.name
            ) {
              return true
            }
          }
        }
      }
    }

    // Check if super args match params exactly by name and position
    if (params.length === superArgs.length && params.length > 0) {
      const allMatch = params.every((param, i) => {
        const p = param as Record<string, unknown>
        const a = superArgs[i] as Record<string, unknown>
        return p.type === 'Identifier' && a.type === 'Identifier' && p.name === a.name
      })
      if (allMatch) return true
    }
  }

  return false
}

export const noUselessConstructorRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description: 'Disallow useless constructors that are empty or only pass through to super().',
      category: 'patterns',
      recommended: true,
    },
    schema: [],
    fixable: undefined,
  },
  create(context: RuleContext): RuleVisitor {
    return {
      MethodDefinition(node: unknown): void {
        if (isUselessConstructor(node)) {
          context.report({
            message:
              'Useless constructor. This constructor is empty or only forwards arguments to super(). Remove it or add meaningful logic.',
            loc: extractLocation(node),
          })
        }
      },
    }
  },
}
export default noUselessConstructorRule
