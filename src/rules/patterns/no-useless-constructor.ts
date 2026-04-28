import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function isUselessConstructor(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) return false

  // Must be MethodDefinition with kind === 'constructor'
  if (n.type !== 'MethodDefinition' || n.kind !== 'constructor') return false

  // Protected or private constructors are useful (access control)
  if (n.accessibility === 'protected' || n.accessibility === 'private') return false

  // Get the function value
  const value = toASTNode(n.value)
  if (!value) return false

  // Check params for decorators or parameter properties (TSParameterProperty)
  const params = value.params ?? []
  for (const param of params) {
    const p = toASTNode(param)
    if (!p) continue
    // TSParameterProperty has accessibility, readonly, or isPrivate
    if (p.type === 'TSParameterProperty') return false
    // Has decorators
    if (Array.isArray(p.decorators) && p.decorators.length > 0) return false
    if (p.accessibility) return false
  }

  // Get body statements
  const body = toASTNode(value.body)
  if (!body) return false
  const statements = body.body as unknown[] ?? []

  // Case 1: Empty constructor body
  if (statements.length === 0) return true

  // Case 2: Single super() call that forwards params
  if (statements.length === 1) {
    const stmt = toASTNode(statements[0])
    if (stmt?.type !== 'ExpressionStatement') return false

    const expr = toASTNode(stmt.expression)
    if (expr?.type !== 'CallExpression') return false

    const callee = toASTNode(expr.callee)
    if (callee?.type !== 'Super') return false

    const superArgs = expr.arguments ?? []

    // No params, no args: useless super()
    if (params.length === 0 && superArgs.length === 0) return true

    // Rest param: constructor(...args) { super(...args) }
    if (params.length === 1) {
      const param = toASTNode(params[0])
      if (param?.type === 'RestElement') {
        const paramArg = toASTNode(param.argument)
        if (superArgs.length === 1) {
          const superArg = toASTNode(superArgs[0])
          if (superArg?.type === 'SpreadElement') {
            const spreadArg = toASTNode(superArg.argument)
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
        const p = toASTNode(param)
        const a = toASTNode(superArgs[i])
        return p?.type === 'Identifier' && a?.type === 'Identifier' && p.name === a.name
      })
      if (allMatch) return true
    }
  }

  return false
}

export const noUselessConstructorRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      MethodDefinition(node: unknown): void {
        if (isUselessConstructor(node)) {
          context.report({
            loc: extractLocation(node),
            message:
              'Useless constructor. This constructor is empty or only forwards arguments to super(). Remove it or add meaningful logic.',
          })
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow useless constructors that are empty or only pass through to super().',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}
export default noUselessConstructorRule
