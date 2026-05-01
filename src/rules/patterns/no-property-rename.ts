import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noPropertyRenameRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      ObjectPattern(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'ObjectPattern') return

        const props = (n as { properties?: unknown[] }).properties
        if (!props || !Array.isArray(props)) return

        for (const prop of props) {
          const propNode = toASTNode(prop)
          if (!propNode) continue

          if (propNode.type !== 'Property') continue

          const key = (propNode as { key?: unknown }).key
          const value = (propNode as { value?: unknown }).value

          if (!key || !value) continue

          const keyNode = toASTNode(key)
          const valueNode = toASTNode(value)

          if (!keyNode || !valueNode) continue
          if (keyNode.type !== 'Identifier' || valueNode.type !== 'Identifier') continue

          const keyName = (keyNode as { name?: string }).name
          const valueName = (valueNode as { name?: string }).name

          if (keyName && valueName && keyName !== valueName) {
            context.report({
              loc: extractLocation(propNode),
              message: `Property rename detected: '${keyName}' renamed to '${valueName}'. Consider using consistent naming.`,
              node: propNode,
            })
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Discourage property renaming in object destructuring',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-property-rename',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noPropertyRenameRule
