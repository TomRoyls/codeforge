import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { extractRuleOptions } from '../../utils/options-helpers.js'

interface NoUnfinishedTodosOptions {
  readonly allowPatterns?: readonly string[]
  readonly terms?: readonly string[]
}

const DEFAULT_TERMS = ['TODO', 'FIXME', 'HACK', 'XXX'] as const

const termRegexCache = new Map<string, RegExp>()

function getTermRegex(term: string): RegExp {
  const cached = termRegexCache.get(term)
  if (cached) return cached

  const regex = new RegExp(`\\b${term}\\b`, 'i')
  termRegexCache.set(term, regex)
  return regex
}

export const noUnfinishedTodosRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const options = extractRuleOptions<NoUnfinishedTodosOptions>(context.config.options, {
      allowPatterns: [],
      terms: DEFAULT_TERMS,
    })

    const terms = options.terms ?? DEFAULT_TERMS
    const allowPatterns = options.allowPatterns?.map((p) => new RegExp(p)) ?? []

    function checkComment(commentText: string): null | string {
      for (const term of terms) {
        if (getTermRegex(term).test(commentText)) {
          for (const pattern of allowPatterns) {
            if (pattern.test(commentText)) {
              return null
            }
          }

          return term.toUpperCase()
        }
      }

      return null
    }

    return {
      visitNode(node: unknown): void {
        if (!node || typeof node !== 'object') return

        const n = node as Record<string, unknown>
        if (n.type !== 'Comment') return

        const text = (n.text as string) ?? ''
        const foundTerm = checkComment(text)
        if (!foundTerm) return

        const location = extractLocation(node)
        context.report({
          loc: location,
          message: `Found ${foundTerm} comment. Consider addressing or removing it to reduce technical debt.`,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Detect unfinished TODO/FIXME/HACK comments that should be addressed',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unfinished-todos',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowPatterns: {
            items: { type: 'string' },
            type: 'array',
          },
          terms: {
            items: { type: 'string' },
            type: 'array',
          },
        },
        type: 'object',
      },
    ],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnfinishedTodosRule
