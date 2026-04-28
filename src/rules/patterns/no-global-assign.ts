import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

const GLOBAL_OBJECTS = new Set([
  'AggregateError', 'Array', 'Atomics', 'BigInt', 'Boolean', 'console', 'Date', 'document',
  'Error', 'EvalError', 'Function', 'globalThis', 'Infinity', 'Intl', 'JSON', 'Map', 'Math',
  'NaN', 'navigator', 'Number', 'Object', 'Promise', 'Proxy', 'RangeError', 'ReferenceError',
  'Reflect', 'RegExp', 'Set', 'SharedArrayBuffer', 'String', 'Symbol', 'SyntaxError', 'TypeError',
  'undefined', 'URIError', 'WeakMap', 'WeakSet', 'WebAssembly', 'window',
])

export const noGlobalAssignRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      AssignmentExpression(node: unknown): void {
        const n = toASTNode(node)
        if (n?.type !== 'AssignmentExpression') return

        const left = toASTNode(n.left)
        if (left && typeof left.name === 'string' && GLOBAL_OBJECTS.has(left.name)) {
          context.report({
            loc: extractLocation(node),
            message: `Read-only global '${left.name}' should not be modified.`,
          })
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
