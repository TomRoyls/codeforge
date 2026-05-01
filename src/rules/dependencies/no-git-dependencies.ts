import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noGitDependenciesRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      Literal(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'Literal') return

        const value = (n as { value?: unknown }).value
        if (typeof value !== 'string') return

        if (
          value.startsWith('git+') ||
          value.startsWith('git://') ||
          value.startsWith('github:') ||
          value.startsWith('bitbucket:') ||
          value.startsWith('gitlab:')
        ) {
          context.report({
            loc: extractLocation(n),
            message: `Unexpected git dependency \`${value}\`. Git dependencies are not versioned and can introduce instability. Use a published package from npm instead.`,
            node: n,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'dependencies',
      description: 'Disallow git protocol dependencies in package.json',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-git-dependencies',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noGitDependenciesRule
