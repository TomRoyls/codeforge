import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryStringReplaceAllRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const nn = n as Record<string, unknown>
        const callee = nn.callee
        if (!callee || typeof callee !== 'object') return

        const calleeNode = toASTNode(callee)
        if (!calleeNode || calleeNode.type !== 'MemberExpression') return

        const c = calleeNode as Record<string, unknown>
        const prop = c.property
        if (!prop || typeof prop !== 'object') return

        const propNode = toASTNode(prop) as Record<string, unknown>
        if (propNode.type !== 'Identifier' || propNode.name !== 'replaceAll') return

        const args = nn.arguments
        if (!Array.isArray(args) || args.length < 1) return

        const firstArg = args[0]
        if (!firstArg || typeof firstArg !== 'object') return

        const argNode = toASTNode(firstArg)
        if (!argNode) return

        const a = argNode as Record<string, unknown>
        if (a.type === 'StringLiteral' || (a.type === 'Literal' && typeof a.value === 'string')) {
          context.report({
            loc: extractLocation(n),
            message:
              'Unnecessary replaceAll with a string pattern. String patterns match once per occurrence. Use replace() instead or confirm multiple occurrences are expected.',
            node: n,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Suggest using replace() instead of replaceAll() with string patterns.',
      recommended: false,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-string-replace-all.md',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryStringReplaceAllRule
