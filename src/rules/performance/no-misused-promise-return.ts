import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noMisusedPromiseReturnRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      ReturnStatement(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'ReturnStatement') return

        const argument = (n as { argument?: unknown }).argument
        if (!argument) return

        const argNode = toASTNode(argument)
        if (!argNode) return

        if (argNode.type !== 'NewExpression') return

        const callee = (argNode as { callee?: unknown }).callee
        if (!callee || (callee as { type?: string }).type !== 'Identifier') return

        const calleeName = (callee as { name?: string }).name
        if (calleeName !== 'Promise') return

        const parent = (n as { parent?: unknown }).parent
        if (!parent) return

        const parentType = (parent as { type?: string }).type
        if (parentType === 'ArrowFunctionExpression' || parentType === 'FunctionDeclaration' || parentType === 'FunctionExpression') {
          const isAsync = (parent as { async?: boolean }).async
          if (isAsync) {
            context.report({
              loc: extractLocation(argNode),
              message: 'Avoid returning a new Promise from an async function. The function already returns a Promise.',
              node: argNode,
            })
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'performance',
      description: 'Disallow unnecessary Promise construction in async functions',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-misused-promise-return',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noMisusedPromiseReturnRule
