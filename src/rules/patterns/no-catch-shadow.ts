/**
 * @module rules/patterns/no-catch-shadow
 * Disallows variable declarations that shadow catch clause parameters.
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noCatchShadowRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CatchClause(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CatchClause') return

        const param = (n as { param?: unknown }).param
        if (!param) return

        const paramNode = toASTNode(param)
        if (!paramNode) return

        const paramName = (paramNode as { name?: unknown }).name
        if (typeof paramName !== 'string') return

        const body = (n as { body?: unknown }).body
        const bodyNode = toASTNode(body)
        if (!bodyNode) return

        const bodyStatements = (bodyNode as { body?: unknown[] }).body
        if (!Array.isArray(bodyStatements)) return

        for (const stmt of bodyStatements) {
          const stmtNode = toASTNode(stmt)
          if (!stmtNode) continue

          if (stmtNode.type === 'VariableDeclaration') {
            const declarations = (stmtNode as { declarations?: unknown[] }).declarations
            if (!Array.isArray(declarations)) continue

            for (const decl of declarations) {
              const declNode = toASTNode(decl)
              if (!declNode) continue

              const id = (declNode as { id?: unknown }).id
              const idNode = toASTNode(id)
              if (!idNode) continue

              const declName = (idNode as { name?: unknown }).name
              if (declName === paramName) {
                context.report({
                  loc: extractLocation(idNode),
                  message: `Variable '${paramName}' shadows catch clause parameter.`,
                  node: idNode,
                })
              }
            }
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow variable declarations that shadow catch clause parameters',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-catch-shadow',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noCatchShadowRule
