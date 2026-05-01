import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

const TEST_FUNCTION_NAMES: ReadonlySet<string> = new Set([
  'it',
  'test',
  'describe',
  'beforeEach',
  'afterEach',
  'beforeAll',
  'afterAll',
  'xcontext',
  'xdescribe',
  'xspecify',
  'xtest',
  'fcontext',
  'fdescribe',
  'fspecify',
  'ftest',
])

function getRootIdentifierName(node: unknown): string | null {
  const n = toASTNode(node)
  if (!n) return null

  if (n.type === 'Identifier' && typeof n.name === 'string') {
    return n.name
  }

  if (n.type === 'MemberExpression' || n.type === 'OptionalMemberExpression') {
    return getRootIdentifierName(n.object)
  }

  return null
}

export const noConfusingConditionalAccessRule: RuleDefinition = {
  meta: {
    docs: {
      category: 'testing',
      description: 'Disallow optional chaining on test and hook functions',
      url: 'https://codeforge.dev/docs/rules/no-confusing-conditional-access',
      recommended: false,
    },
    severity: 'warn',
    type: 'suggestion',
  },

  create(context: RuleContext): RuleVisitor {
    return {
      OptionalCallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n) return

        const callee = toASTNode(n.callee)
        if (!callee) return

        const name = getRootIdentifierName(callee)
        if (name !== null && TEST_FUNCTION_NAMES.has(name)) {
          context.report({
            message: `Avoid optional chaining on test function '${name}'`,
            loc: extractLocation(node),
          })
        }
      },

      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n) return

        const callee = toASTNode(n.callee)
        if (!callee) return

        if (callee.type !== 'OptionalMemberExpression') return

        const name = getRootIdentifierName(callee.object)
        if (name !== null && TEST_FUNCTION_NAMES.has(name)) {
          context.report({
            message: `Avoid optional chaining on test function '${name}'`,
            loc: extractLocation(node),
          })
        }
      },
    }
  },
}

export default noConfusingConditionalAccessRule
