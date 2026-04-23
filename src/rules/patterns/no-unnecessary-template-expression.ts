import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'

function isTemplateLiteral(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  return n.type === 'TemplateLiteral' && !n.tag
}

function hasSingleQuasi(node: unknown): boolean {
  if (!isTemplateLiteral(node)) {
    return false
  }

  const n = node as Record<string, unknown>
  const quasis = n.quasis as undefined | unknown[]
  return quasis?.length === 1
}

function hasNoExpressions(node: unknown): boolean {
  if (!isTemplateLiteral(node)) {
    return false
  }

  const n = node as Record<string, unknown>
  const expressions = n.expressions as undefined | unknown[]
  return !expressions || expressions.length === 0
}

function isSimpleTemplateLiteral(node: unknown): boolean {
  return hasSingleQuasi(node) && hasNoExpressions(node)
}

function getQuasiValue(node: unknown): null | string {
  if (!isTemplateLiteral(node)) {
    return null
  }

  const n = node as Record<string, unknown>
  const quasis = n.quasis as undefined | unknown[]

  if (!quasis || quasis.length !== 1) {
    return null
  }

  const quasi = quasis[0] as Record<string, unknown> | undefined
  if (!quasi || typeof quasi !== 'object') {
    return null
  }

  const value = quasi.value as Record<string, unknown> | undefined
  if (!value) {
    return null
  }

  const raw = value.raw as string | undefined
  return typeof raw === 'string' ? raw : null
}

function needsTemplateLiteral(value: string): boolean {
  return value.includes('\n') || value.includes('\r') || value.includes("'") || value.includes('"')
}

function isBacktickString(node: unknown): boolean {
  if (!isTemplateLiteral(node)) {
    return false
  }

  if (!isSimpleTemplateLiteral(node)) {
    return false
  }

  const value = getQuasiValue(node)
  if (value === null) {
    return false
  }

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
    fixable: 'code',
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryTemplateExpressionRule
