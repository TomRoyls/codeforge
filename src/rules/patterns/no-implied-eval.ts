import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function isImpliedEvalCall(node: unknown): { functionName: null | string; isImpliedEval: boolean; } {
  const n = toASTNode(node)
  if (!n || n.type !== 'CallExpression') return { functionName: null, isImpliedEval: false }

  const callee = toASTNode(n.callee)
  if (!callee || callee.type !== 'Identifier') return { functionName: null, isImpliedEval: false }

  const functionName = callee.name as string

  if (
    functionName !== 'setTimeout' &&
    functionName !== 'setInterval' &&
    functionName !== 'execScript'
  ) {
    return { functionName: null, isImpliedEval: false }
  }

  const args = n.arguments as undefined | unknown[]
  if (!args || args.length === 0) return { functionName: null, isImpliedEval: false }

  const firstArg = toASTNode(args[0])
  if (!firstArg) return { functionName: null, isImpliedEval: false }

  if (firstArg.type === 'Literal' && typeof firstArg.value === 'string') {
    return { functionName, isImpliedEval: true }
  }

  if (firstArg.type === 'TemplateLiteral') {
    return { functionName, isImpliedEval: true }
  }

  return { functionName: null, isImpliedEval: false }
}

export const noImpliedEvalRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const { functionName, isImpliedEval } = isImpliedEvalCall(node)

        if (!isImpliedEval || !functionName) {
          return
        }

        const location = extractLocation(node)

        context.report({
          loc: location,
          message:
            'Implied eval. Do not use strings as the first argument to setTimeout/setInterval/execScript.',
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'security',
      description:
        'Disallow implied eval via setTimeout/setInterval/execScript with string arguments. Using strings as the first argument to setTimeout/setInterval/execScript is equivalent to using eval, which poses security risks.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-implied-eval',
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}

export default noImpliedEvalRule
