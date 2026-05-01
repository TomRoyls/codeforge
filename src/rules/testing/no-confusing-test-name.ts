import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

const TEST_GLOBALS = new Set(['it', 'test', 'describe', 'expect', 'beforeEach', 'afterEach', 'beforeAll', 'afterAll', 'xdescribe', 'fdescribe', 'xtest', 'xit', 'fit', 'fdescribe', 'jest', 'vi'])

const MESSAGE =
  'Unexpected variable name "{name}" which shadows a testing global. Rename this variable to avoid confusion.'

export const noConfusingTestNameRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      VariableDeclarator(node: unknown): void {
        const n = toASTNode(node)
        if (!n) return

        const id = toASTNode(n.id)
        if (!id || id.type !== 'Identifier') return

        const name = id.name
        if (typeof name !== 'string' || !TEST_GLOBALS.has(name)) return

        context.report({
          loc: extractLocation(node),
          message: MESSAGE.replace('{name}', name),
          node,
        })
      },

      FunctionDeclaration(node: unknown): void {
        const n = toASTNode(node)
        if (!n) return

        const id = toASTNode(n.id)
        if (!id || id.type !== 'Identifier') return

        const name = id.name
        if (typeof name !== 'string' || !TEST_GLOBALS.has(name)) return

        context.report({
          loc: extractLocation(node),
          message: MESSAGE.replace('{name}', name),
          node,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description:
        'Disallow variable or function declarations that shadow testing globals like it, test, describe, expect',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-confusing-test-name',
    },
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noConfusingTestNameRule
