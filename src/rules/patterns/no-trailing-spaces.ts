import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noTrailingSpacesRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      TemplateElement(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'TemplateElement') return

        const raw = (n as { value?: { raw?: string } }).value?.raw
        if (raw === undefined || raw === null) return

        const lines = raw.split('\n')
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i]!
          if (line.length > 0 && line !== line.trimEnd()) {
            context.report({
              loc: extractLocation(n),
              message: 'Unexpected trailing whitespace in template literal. Trailing spaces are usually unintended and can cause subtle bugs.',
              node: n,
            })
            return
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow trailing whitespace in template literals',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-trailing-spaces',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noTrailingSpacesRule
