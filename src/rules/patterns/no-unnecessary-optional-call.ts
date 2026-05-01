import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

const KNOWN_GLOBALS = new Set(['console', 'Math', 'JSON', 'Array', 'Object', 'String', 'Number', 'Boolean', 'Date', 'RegExp', 'Error', 'Map', 'Set', 'Promise', 'Symbol', 'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'undefined', 'NaN', 'Infinity'])

export const noUnnecessaryOptionalCallRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const optional = (n as Record<string, unknown>).optional
        if (!optional) return

        const callee = (n as Record<string, unknown>).callee
        if (!callee || typeof callee !== 'object') return

        const calleeNode = toASTNode(callee)
        if (!calleeNode) return

        const c = calleeNode as Record<string, unknown>

        if (c.type === 'MemberExpression') {
          const obj = c.object
          if (!obj || typeof obj !== 'object') return

          const objNode = toASTNode(obj) as Record<string, unknown>
          if (objNode && objNode.type === 'Identifier' && KNOWN_GLOBALS.has(objNode.name as string)) {
            context.report({
              loc: extractLocation(n),
              message:
                `Unnecessary optional call on '${String(objNode.name)}'. This global is always defined.`,
              node: n,
            })
          }
        } else if (c.type === 'Identifier') {
          if (KNOWN_GLOBALS.has(c.name as string)) {
            context.report({
              loc: extractLocation(n),
              message:
                `Unnecessary optional call on '${String(c.name)}'. This global is always defined.`,
              node: n,
            })
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow unnecessary optional chaining calls on known global objects.',
      recommended: false,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-optional-call.md',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryOptionalCallRule
