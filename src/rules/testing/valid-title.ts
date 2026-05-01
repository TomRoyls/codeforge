import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'
import { DESCRIBE_FUNCTIONS, TEST_FUNCTIONS } from '../../utils/constants.js'

const ALL_TEST_NAMES = new Set([...DESCRIBE_FUNCTIONS, ...TEST_FUNCTIONS])

function isTestOrDescribeCall(node: unknown): null | string {
  const n = toASTNode(node)
  if (!n || n.type !== 'CallExpression') return null

  const callee = toASTNode(n.callee)
  if (!callee) return null

  if (callee.type === 'Identifier' && typeof callee.name === 'string') {
    return ALL_TEST_NAMES.has(callee.name) ? callee.name : null
  }

  if (callee.type === 'MemberExpression') {
    const object = toASTNode(callee.object)
    if (object?.type === 'Identifier' && typeof object.name === 'string') {
      return ALL_TEST_NAMES.has(object.name) ? object.name : null
    }
  }

  return null
}

function extractTitle(node: unknown): null | string {
  const n = toASTNode(node)
  if (!n || n.type !== 'CallExpression') return null

  const args = n.arguments
  if (!args || args.length === 0) return null

  const firstArg = toASTNode(args[0])
  if (!firstArg || firstArg.type !== 'Literal' || typeof firstArg.value !== 'string') return null

  return firstArg.value
}

function hasTitleIssues(title: string): null | string {
  if (title.length === 0) {
    return 'Test title must not be empty'
  }

  if (title.endsWith('.')) {
    return `Test title '${title}' should not end with a period`
  }

  if (/^[a-z]/u.test(title)) {
    return `Test title '${title}' should start with an uppercase letter`
  }

  return null
}

export const validTitleRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const functionName = isTestOrDescribeCall(node)
        if (functionName === null) return

        const title = extractTitle(node)
        if (title === null) return

        const issue = hasTitleIssues(title)
        if (issue !== null) {
          context.report({
            loc: extractLocation(node),
            message: issue,
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
        'Enforce valid test and describe titles that are non-empty, start with uppercase, and do not end with periods',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/valid-title',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default validTitleRule
