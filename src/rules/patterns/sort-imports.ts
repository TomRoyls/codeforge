import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function getImportSource(node: Record<string, unknown>): string {
  const source = node.source
  if (source && typeof source === 'object') {
    const src = (source as Record<string, unknown>).value
    if (typeof src === 'string') return src
  }
  return ''
}

export const sortImportsRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const imports: Array<{ loc: unknown; node: unknown; source: string }> = []

    return {
      ImportDeclaration(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'ImportDeclaration') return

        const source = getImportSource(n as Record<string, unknown>)
        imports.push({ loc: extractLocation(n), node: n, source })
      },

      'Program:exit'(): void {
        for (let i = 1; i < imports.length; i++) {
          const prev = imports[i - 1]!
          const curr = imports[i]!

          if (prev.source.localeCompare(curr.source) > 0) {
            context.report({
              loc: curr.loc as { end: { column: number; line: number }; start: { column: number; line: number } },
              message: `Imports should be sorted. '${curr.source}' should come before '${prev.source}'.`,
              node: curr.node as Record<string, unknown>,
            })
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Require import statements to be sorted alphabetically',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/sort-imports',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default sortImportsRule
