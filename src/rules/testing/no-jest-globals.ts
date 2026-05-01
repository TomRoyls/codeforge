import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

const JEST_GLOBALS = new Set([
  'afterAll',
  'afterEach',
  'beforeAll',
  'beforeEach',
  'describe',
  'expect',
  'fdescribe',
  'fit',
  'ftest',
  'it',
  'test',
  'xdescribe',
  'xit',
  'xtest',
])

export const noJestGlobalsRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const callee = toASTNode(n.callee)
        if (!callee) return

        if (
          callee.type === 'Identifier' &&
          typeof callee.name === 'string' &&
          JEST_GLOBALS.has(callee.name)
        ) {
          context.report({
            loc: extractLocation(node),
            message: `Unexpected global '${callee.name}' usage. Import it explicitly from '@jest/globals' or 'vitest' instead.`,
            node,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description:
        'Detect usage of global Jest functions without explicit imports, which can cause issues in certain configurations',
      recommended: false,
    },
    schema: [],
    severity: 'warn',
    type: 'problem',
  },
}

export default noJestGlobalsRule
