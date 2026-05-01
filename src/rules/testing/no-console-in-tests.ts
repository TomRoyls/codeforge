import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

const CONSOLE_METHODS = new Set(['log', 'warn', 'error', 'info', 'debug'])

function isConsoleCall(node: unknown): { isConsole: boolean; method: string | null } {
  const n = toASTNode(node)
  if (!n || n.type !== 'CallExpression') return { isConsole: false, method: null }

  const callee = toASTNode(n.callee)
  if (!callee || callee.type !== 'MemberExpression') return { isConsole: false, method: null }

  const object = toASTNode(callee.object)
  if (!object || object.type !== 'Identifier' || object.name !== 'console') return { isConsole: false, method: null }

  const property = toASTNode(callee.property)
  if (!property || property.type !== 'Identifier' || typeof property.name !== 'string') return { isConsole: false, method: null }

  if (!CONSOLE_METHODS.has(property.name)) return { isConsole: false, method: null }

  return { isConsole: true, method: property.name }
}

export const noConsoleInTestsRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const { isConsole, method } = isConsoleCall(node)
        if (!isConsole || !method) return

        context.report({
          loc: extractLocation(node),
          message: `Unexpected console.${method} call in test`,
          node,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description:
        'Detect console calls (log, warn, error, info, debug) inside test bodies',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-console-in-tests',
    },
    schema: [],
    severity: 'warn',
    type: 'problem',
  },
}

export default noConsoleInTestsRule
