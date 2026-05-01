import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const preferStringCharAtRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const callee = toASTNode((n as { callee?: unknown }).callee)
        if (!callee || callee.type !== 'MemberExpression') return

        const computed = (callee as { computed?: boolean }).computed
        if (computed) return

        const prop = toASTNode((callee as { property?: unknown }).property)
        if (!prop || prop.type !== 'Identifier') return

        const propName = (prop as { name?: string }).name
        if (propName !== 'charAt') return

        const args = (n as { arguments?: unknown[] }).arguments
        if (!args || args.length !== 1) return

        const object = toASTNode((callee as { object?: unknown }).object)
        if (!object) return

        const objType = object.type
        if (objType !== 'Identifier' && objType !== 'MemberExpression') return

        const indexArg = toASTNode(args[0])
        if (!indexArg) return

        const indexValue = (indexArg as { value?: unknown }).value
        const indexType = indexArg.type

        let suggestion: string
        if (indexType === 'Literal' && typeof indexValue === 'number') {
          suggestion = `Use \`str[${indexValue}]\` instead of \`str.charAt(${indexValue})\`.`
        } else if (indexType === 'Identifier') {
          const indexName = (indexArg as { name?: string }).name
          suggestion = `Use \`str[${indexName}]\` instead of \`str.charAt(${indexName})\`.`
        } else {
          suggestion =
            'Use bracket notation `str[i]` instead of `str.charAt(i)`. Bracket notation is more concise and consistent.'
        }

        context.report({
          loc: extractLocation(n),
          message: `Unexpected use of \`charAt()\`. ${suggestion}`,
          node: n,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Enforce using bracket notation `str[i]` over `str.charAt(i)`',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/prefer-string-char-at',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default preferStringCharAtRule
