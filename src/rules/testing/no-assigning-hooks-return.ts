import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

const HOOK_NAMES = new Set(['beforeEach', 'afterEach', 'beforeAll', 'afterAll'])

const MESSAGE =
  'Do not assign the return value of {hookName}() to a variable. Hook functions do not return useful values.'

function isHookCall(init: unknown): string | null {
  const n = toASTNode(init)
  if (!n || n.type !== 'CallExpression') return null

  const callee = toASTNode(n.callee)
  if (!callee) return null

  if (callee.type === 'Identifier' && typeof callee.name === 'string') {
    return HOOK_NAMES.has(callee.name) ? callee.name : null
  }

  return null
}

export const noAssigningHooksReturnRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      VariableDeclarator(node: unknown): void {
        const n = toASTNode(node)
        if (!n) return

        const init = toASTNode(n.init)
        if (!init) return

        const hookName = isHookCall(init)
        if (hookName === null) return

        context.report({
          loc: extractLocation(node),
          message: MESSAGE.replace('{hookName}', hookName),
          node,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description:
        'Disallow assigning the return value of setup/teardown hooks to variables',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-assigning-hooks-return',
    },
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noAssigningHooksReturnRule
