import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function isInsideTemplateExpression(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) {
    return false
  }

  const parent = toASTNode(n.parent)
  if (!parent) {
    return false
  }

  if (parent.type === 'TemplateExpression') {
    return true
  }

  return false
}

export const noNestedTemplateLiteralsRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      TemplateLiteral(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'TemplateLiteral') {
          return
        }

        if (isInsideTemplateExpression(node)) {
          context.report({
            loc: extractLocation(node),
            message:
              'Unexpected nested template literal. Extract the inner template to a separate variable for readability.',
            node,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'best-practices',
      description:
        'Disallow nested template literals to improve code readability',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-nested-template-literals',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noNestedTemplateLiteralsRule
