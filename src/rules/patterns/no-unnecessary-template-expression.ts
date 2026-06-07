import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function isTemplateLiteral(node: unknown): boolean {
  const n = toASTNode(node)
  return n?.type === 'TemplateLiteral' && !n.tag
}

function hasSingleQuasi(node: unknown): boolean {
  if (!isTemplateLiteral(node)) return false
  const n = toASTNode(node)
  const quasis = n?.quasis
  return Array.isArray(quasis) && quasis.length === 1
}

function hasNoExpressions(node: unknown): boolean {
  if (!isTemplateLiteral(node)) return false
  const n = toASTNode(node)
  const expressions = n?.expressions
  return !expressions || expressions.length === 0
}

function isSimpleTemplateLiteral(node: unknown): boolean {
  return hasSingleQuasi(node) && hasNoExpressions(node)
}

function getQuasiValue(node: unknown): null | string {
  if (!isTemplateLiteral(node)) return null
  const n = toASTNode(node)
  const quasis = n?.quasis

  if (!Array.isArray(quasis) || quasis.length !== 1) return null

  const quasi = toASTNode(quasis[0])
  if (!quasi) return null

  const value = toASTNode(quasi.value)
  if (!value) return null

  return typeof value.raw === 'string' ? value.raw : null
}

function needsTemplateLiteral(value: string): boolean {
  return value.includes('\n') || value.includes('\r') || value.includes("'") || value.includes('"')
}

function isBacktickString(node: unknown): boolean {
  if (!isTemplateLiteral(node) || !isSimpleTemplateLiteral(node)) return false

  const value = getQuasiValue(node)
  if (value === null) return false

  return !needsTemplateLiteral(value)
}

export const noUnnecessaryTemplateExpressionRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      TemplateLiteral(node: unknown): void {
        if (!isBacktickString(node)) {
          return
        }

        const value = getQuasiValue(node)
        const location = extractLocation(node)

        const suggestion =
          value === null ? ' Use a regular string instead.' : ` Use "${value}" instead.`

        context.report({
          loc: location,
          message: `Unnecessary template literal.${suggestion}`,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow unnecessary template literals. Template literals without expressions or multi-line content should be regular strings for better readability. Use template literals when you need interpolation or multi-line strings.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-template-expression',
    },
    fixable: false,
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryTemplateExpressionRule
