import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'
import {
  DESCRIBE_FUNCTIONS,
  TEST_FUNCTIONS,
  X_PREFIX_SKIP_FUNCTIONS,
} from '../../utils/constants.js'

const SKIP_METHOD = 'skip'

const ALL_TEST_LIKE_FUNCTIONS: ReadonlySet<string> = new Set([
  ...DESCRIBE_FUNCTIONS,
  ...TEST_FUNCTIONS,
])

const X_PREFIX_TODO_MAP: ReadonlyMap<string, string> = new Map(
  [...X_PREFIX_SKIP_FUNCTIONS].map((name) => {
    const base = name.slice(1)
    return [name, `${base}.todo`]
  }),
)

interface TodoResult {
  readonly original: string
  readonly suggestion: string
}

function findSkipOrTodoSuggestion(node: unknown): null | TodoResult {
  const n = toASTNode(node)
  if (!n || n.type !== 'CallExpression') {
    return null
  }

  const callee = toASTNode(n.callee)
  if (!callee) {
    return null
  }

  if (callee.type === 'Identifier' && typeof callee.name === 'string') {
    const suggestion = X_PREFIX_TODO_MAP.get(callee.name)
    if (suggestion) {
      return { original: callee.name, suggestion }
    }
  }

  if (callee.type === 'MemberExpression') {
    const object = toASTNode(callee.object)
    const property = toASTNode(callee.property)

    if (
      object?.type === 'Identifier' &&
      typeof object.name === 'string' &&
      ALL_TEST_LIKE_FUNCTIONS.has(object.name) &&
      property?.type === 'Identifier' &&
      typeof property.name === 'string' &&
      property.name === SKIP_METHOD
    ) {
      return {
        original: `${object.name}.${property.name}`,
        suggestion: `${object.name}.todo`,
      }
    }
  }

  return null
}

export const preferTodoRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const result = findSkipOrTodoSuggestion(node)

        if (result) {
          context.report({
            data: {
              original: result.original,
              suggestion: result.suggestion,
            },
            loc: extractLocation(node),
            message: `Use ${result.suggestion} instead of ${result.original}`,
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
        'Suggest using test.todo() or it.todo() instead of xit(), xdescribe(), test.skip(), it.skip(), describe.skip() etc.',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/prefer-todo',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default preferTodoRule
