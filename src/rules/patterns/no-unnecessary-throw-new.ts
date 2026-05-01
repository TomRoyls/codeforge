import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryThrowNewRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      ThrowStatement(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'ThrowStatement') return

        const nn = n as Record<string, unknown>
        const argument = nn.argument
        if (!argument || typeof argument !== 'object') return

        const arg = toASTNode(argument)
        if (!arg || arg.type !== 'NewExpression') return

        const aa = arg as Record<string, unknown>
        const callee = aa.callee
        if (!callee || typeof callee !== 'object') return

        const c = callee as Record<string, unknown>
        if (c.type === 'Identifier') {
          const name = c.name as string
          if (
            name === 'Error' ||
            name === 'TypeError' ||
            name === 'RangeError' ||
            name === 'SyntaxError' ||
            name === 'ReferenceError' ||
            name === 'URIError' ||
            name === 'EvalError'
          ) {
            context.report({
              loc: extractLocation(arg),
              message:
                `Unnecessary 'new' in throw statement. throw ${name}() is equivalent.`,
              node: arg,
            })
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow unnecessary new keyword in throw statements for native error constructors.',
      recommended: false,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-throw-new.md',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryThrowNewRule
