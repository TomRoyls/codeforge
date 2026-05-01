import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noAsyncConstructorRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      MethodDefinition(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'MethodDefinition') return

        const kind = (n as { kind?: string }).kind
        if (kind !== 'constructor') return

        const value = (n as { value?: unknown }).value
        if (!value || (value as { type?: string }).type !== 'FunctionExpression') return

        const isAsync = (value as { async?: boolean }).async
        if (isAsync) {
          context.report({
            loc: extractLocation(n),
            message: 'Constructor should not be async. Async constructors are not valid in JavaScript.',
            node: n,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'correctness',
      description: 'Disallow async constructors',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-async-constructor',
    },
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}

export default noAsyncConstructorRule
