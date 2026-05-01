import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

const CASE_METHODS = new Set(['toLowerCase', 'toUpperCase', 'toLocaleLowerCase', 'toLocaleUpperCase'])

export const noStringCaseConvertRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const callee = (n as { callee?: unknown }).callee
        if (!callee) return

        const calleeNode = toASTNode(callee)
        if (!calleeNode || calleeNode.type !== 'MemberExpression') return

        const property = (calleeNode as { property?: unknown }).property
        if (!property) return

        const propNode = toASTNode(property)
        if (!propNode || propNode.type !== 'Identifier') return

        const methodName = (propNode as { name?: string }).name
        if (!methodName || !CASE_METHODS.has(methodName)) return

        context.report({
          loc: extractLocation(n),
          message: `Avoid calling .${methodName}() directly on string literals. Use it on variables or store the result.`,
          node: n,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Flag unnecessary string case conversion patterns',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-string-case-convert',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noStringCaseConvertRule
