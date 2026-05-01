/**
 * @module rules/patterns/no-use-before-define
 * Disallows use of variables before they are defined.
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUseBeforeDefineRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const definedVars = new Set<string>()
    const usageReports: Array<{ name: string; node: unknown }> = []

    return {
      VariableDeclarator(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'VariableDeclarator') return

        const id = (n as { id?: unknown }).id
        if (!id || typeof id !== 'object') return

        const idNode = id as Record<string, unknown>
        if (idNode.type === 'Identifier' && typeof idNode.name === 'string') {
          definedVars.add(idNode.name as string)
        }
      },

      Identifier(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'Identifier') return

        const name = (n as { name?: unknown }).name
        if (typeof name !== 'string') return

        if (!definedVars.has(name)) {
          usageReports.push({ name, node: n })
        }
      },

      'Program:exit'(): void {
        for (const usage of usageReports) {
          if (!definedVars.has(usage.name)) {
            context.report({
              loc: extractLocation(toASTNode(usage.node)),
              message: `'${usage.name}' was used before it was defined.`,
              node: toASTNode(usage.node),
            })
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow use of variables before they are defined',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-use-before-define',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUseBeforeDefineRule
