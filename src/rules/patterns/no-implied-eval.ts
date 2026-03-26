import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

function isImpliedEvalCall(node: unknown): { isImpliedEval: boolean; functionName: string | null } {
  if (!node || typeof node !== 'object') {
    return { isImpliedEval: false, functionName: null }
  }

  const n = node as Record<string, unknown>

  if (n.type !== 'CallExpression') {
    return { isImpliedEval: false, functionName: null }
  }

  const callee = n.callee as Record<string, unknown> | undefined

  if (!callee || callee.type !== 'Identifier') {
    return { isImpliedEval: false, functionName: null }
  }

  const functionName = callee.name as string

  if (
    functionName !== 'setTimeout' &&
    functionName !== 'setInterval' &&
    functionName !== 'execScript'
  ) {
    return { isImpliedEval: false, functionName: null }
  }

  const args = n.arguments as Array<Record<string, unknown>> | undefined

  if (!args || args.length === 0) {
    return { isImpliedEval: false, functionName: null }
  }

  const firstArg = args[0]

  if (!firstArg || typeof firstArg !== 'object') {
    return { isImpliedEval: false, functionName: null }
  }

  if (firstArg.type === 'Literal' && typeof firstArg.value === 'string') {
    return { isImpliedEval: true, functionName }
  }

  if (firstArg.type === 'TemplateLiteral') {
    return { isImpliedEval: true, functionName }
  }

  return { isImpliedEval: false, functionName: null }
}

export const noImpliedEvalRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description:
        'Disallow implied eval via setTimeout/setInterval/execScript with string arguments. Using strings as the first argument to setTimeout/setInterval/execScript is equivalent to using eval, which poses security risks.',
      category: 'security',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-implied-eval',
    },
    schema: [],
    fixable: undefined,
  },

  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const { isImpliedEval, functionName } = isImpliedEvalCall(node)

        if (!isImpliedEval || !functionName) {
          return
        }

        const location = extractLocation(node)

        context.report({
          message:
            'Implied eval. Do not use strings as the first argument to setTimeout/setInterval/execScript.',
          loc: location,
        })
      },
    }
  },
}

export default noImpliedEvalRule
