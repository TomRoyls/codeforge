import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'
import { extractRuleOptions } from '../../utils/options-helpers.js'

interface NoUnfinishedTodosOptions {
  readonly terms?: readonly string[]
  readonly allowPatterns?: readonly string[]
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
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description: 'Detect unfinished TODO/FIXME/HACK comments that should be addressed',
      category: 'patterns',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unfinished-todos',
    },
    schema: [
      {
        type: 'object',
        properties: {
          terms: {
            type: 'array',
            items: { type: 'string' },
          },
          allowPatterns: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context: RuleContext): RuleVisitor {
    const options = extractRuleOptions<NoUnfinishedTodosOptions>(context.config.options, {
      terms: DEFAULT_TERMS,
      allowPatterns: [],
    })

    const terms = options.terms ?? DEFAULT_TERMS
    const allowPatterns = options.allowPatterns?.map((p) => new RegExp(p)) ?? []

    function checkComment(commentText: string): string | null {
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
          message: `Found ${foundTerm} comment. Consider addressing or removing it to reduce technical debt.`,
          loc: location,
        })
      },
    }
  },
}

export default noUnfinishedTodosRule
