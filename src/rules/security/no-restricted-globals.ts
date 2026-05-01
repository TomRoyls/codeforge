import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

const RESTRICTED_GLOBALS = new Set([
  'event',
  'close',
  'open',
  'status',
  'name',
  'length',
  'location',
  'parent',
  'top',
  'scroll',
  'stop',
  'focus',
  'blur',
])

export const noRestrictedGlobalsRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      Identifier(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'Identifier') return

        const name = (n as { name?: string }).name
        if (!name || !RESTRICTED_GLOBALS.has(name)) return

        const parent = toASTNode((n as { parent?: unknown }).parent ?? undefined)
        if (parent) {
          if (parent.type === 'MemberExpression') {
            const obj = (parent as { object?: unknown }).object
            if (obj === node) {
              return
            }
          }

          if (parent.type === 'Property' || parent.type === 'MethodDefinition') {
            const key = (parent as { key?: unknown }).key
            if (key === node) {
              return
            }
          }

          if (parent.type === 'VariableDeclarator') {
            const id = (parent as { id?: unknown }).id
            if (id === node) {
              return
            }
          }

          if (parent.type === 'FunctionDeclaration' || parent.type === 'FunctionExpression') {
            const id = (parent as { id?: unknown }).id
            if (id === node) {
              return
            }
          }

          if (parent.type === 'ImportSpecifier' || parent.type === 'ImportDefaultSpecifier') {
            return
          }
        }

        context.report({
          loc: extractLocation(n),
          message: `Unexpected use of restricted global \`${name}\`. This may shadow a browser global and cause subtle bugs.`,
          node: n,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'security',
      description: 'Disallow usage of restricted global variable names that may shadow browser globals',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-restricted-globals',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noRestrictedGlobalsRule
