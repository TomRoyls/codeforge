import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

const GLOBAL_OBJECTS = new Set([
  'undefined',
  'NaN',
  'Infinity',
  'Object',
  'Function',
  'Boolean',
  'Symbol',
  'Number',
  'BigInt',
  'Math',
  'Date',
  'String',
  'RegExp',
  'Array',
  'Map',
  'Set',
  'WeakMap',
  'WeakSet',
  'JSON',
  'Promise',
  'Reflect',
  'Proxy',
  'Error',
  'AggregateError',
  'EvalError',
  'RangeError',
  'ReferenceError',
  'SyntaxError',
  'TypeError',
  'URIError',
  'globalThis',
  'console',
  'window',
  'document',
  'navigator',
  'Intl',
  'WebAssembly',
  'Atomics',
  'SharedArrayBuffer',
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
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description: 'Disallow assignment to native objects or read-only global variables.',
      category: 'patterns',
      recommended: true,
    },
    schema: [],
    fixable: undefined,
  },
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
              message: `Read-only global '${name}' should not be modified.`,
              loc: extractLocation(node),
            })
          }
        }
      },
    }
  },
}
export default noGlobalAssignRule
