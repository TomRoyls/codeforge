import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'

const GLOBAL_OBJECTS = new Set([
  'AggregateError',
  'Array',
  'Atomics',
  'BigInt',
  'Boolean',
  'console',
  'Date',
  'document',
  'Error',
  'EvalError',
  'Function',
  'globalThis',
  'Infinity',
  'Intl',
  'JSON',
  'Map',
  'Math',
  'NaN',
  'navigator',
  'Number',
  'Object',
  'Promise',
  'Proxy',
  'RangeError',
  'ReferenceError',
  'Reflect',
  'RegExp',
  'Set',
  'SharedArrayBuffer',
  'String',
  'Symbol',
  'SyntaxError',
  'TypeError',
  'undefined',
  'URIError',
  'WeakMap',
  'WeakSet',
  'WebAssembly',
  'window',
])

function isAssignmentExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'AssignmentExpression'
}

export function isIdentifier(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'Identifier' || typeof n.name === 'string'
}

export const noGlobalAssignRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      AssignmentExpression(node: unknown): void {
        if (!isAssignmentExpression(node)) return
        const n = node as Record<string, unknown>
        if (isIdentifier(n.left)) {
          const left = n.left as Record<string, unknown>
          const name = left.name as string
          if (GLOBAL_OBJECTS.has(name)) {
            context.report({
              loc: extractLocation(node),
              message: `Read-only global '${name}' should not be modified.`,
            })
          }
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow assignment to native objects or read-only global variables.',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noGlobalAssignRule
