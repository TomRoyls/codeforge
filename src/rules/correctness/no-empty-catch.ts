import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'
import { extractRuleOptions } from '../../utils/options-helpers.js'

interface NoEmptyCatchOptions {
  readonly allowComments?: boolean
}

function isEmptyCatchBlock(node: unknown, allowComments: boolean): boolean {
  const n = toASTNode(node)
  if (n?.type !== 'CatchClause') {
    return false
  }

  const body = toASTNode(n.body)

  if (body && typeof body === 'object') {
    if (body.type !== 'BlockStatement') {
      return false
    }

    const statements = body.body as undefined | unknown[]
    if (!Array.isArray(statements) || statements.length === 0) {
      return true
    }

    const hasRealStatements = statements.some((stmt) => {
      const s = toASTNode(stmt)
      return s?.type !== 'EmptyStatement' && s?.type !== 'BlockStatement'
    })

    if (hasRealStatements) {
      return false
    }

    return !allowComments
  }

  const text = typeof n.text === 'string' ? n.text : ''
  const openBrace = text.indexOf('{')
  const closeBrace = text.lastIndexOf('}')
  if (openBrace === -1 || closeBrace === -1 || closeBrace <= openBrace) {
    return true
  }

  const inner = text.slice(openBrace + 1, closeBrace)

  const withoutComments = inner
    .replaceAll(/\/\*[\s\S]*?\*\//g, '')
    .replaceAll(/\/\/.*$/gm, '')
    .trim()

  if (allowComments && withoutComments.length === 0 && inner.trim().length > 0) {
      return false
    }

  return withoutComments.length === 0
}

export const noEmptyCatchRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const options = extractRuleOptions<NoEmptyCatchOptions>(context.config.options, {
      allowComments: false,
    })

    return {
      CatchClause(node: unknown): void {
        if (isEmptyCatchBlock(node, options.allowComments ?? false)) {
          context.report({
            loc: extractLocation(node),
            message: 'Empty catch clause. Either add error handling or remove the catch block.',
            node,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'correctness',
      description: 'Disallow empty catch clauses that may hide errors silently',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-empty-catch',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowComments: {
            default: false,
            type: 'boolean',
          },
        },
        type: 'object',
      },
    ],
    severity: 'warn',
    type: 'problem',
  },
}

export default noEmptyCatchRule
