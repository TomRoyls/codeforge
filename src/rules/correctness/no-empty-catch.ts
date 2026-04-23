import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
  SourceLocation,
} from '../../plugins/types.js'

import { extractRuleOptions } from '../../utils/options-helpers.js'

interface NoEmptyCatchOptions {
  readonly allowComments?: boolean
}

function extractLocation(node: unknown): SourceLocation {
  const defaultLoc: SourceLocation = {
    end: { column: 1, line: 1 },
    start: { column: 0, line: 1 },
  }

  if (!node || typeof node !== 'object') {
    return defaultLoc
  }

  const n = node as Record<string, unknown>
  const loc = n.loc as Record<string, unknown> | undefined

  if (!loc) {
    return defaultLoc
  }

  const start = loc.start as Record<string, unknown> | undefined
  const end = loc.end as Record<string, unknown> | undefined

  return {
    end: {
      column: typeof end?.column === 'number' ? end.column : 0,
      line: typeof end?.line === 'number' ? end.line : 1,
    },
    start: {
      column: typeof start?.column === 'number' ? start.column : 0,
      line: typeof start?.line === 'number' ? start.line : 1,
    },
  }
}

/**
 * Check if a catch block body is effectively empty.
 *
 * The adapter's nodeToGeneric() strips child properties (body, etc.) from nodes,
 * so we need a two-pronged approach:
 * 1. If `body` is available (e.g. unit tests with full AST nodes), inspect it directly.
 * 2. If `body` is undefined (runtime through adapter), parse the `text` property.
 */
function isEmptyCatchBlock(node: unknown, allowComments: boolean): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  if (n.type !== 'CatchClause') {
    return false
  }

  const body = n.body as Record<string, unknown> | undefined

  if (body && typeof body === 'object') {
    if (body.type !== 'BlockStatement') {
      return false
    }

    const statements = body.body as undefined | unknown[]
    if (!Array.isArray(statements) || statements.length === 0) {
      return true
    }

    const hasRealStatements = statements.some((stmt) => {
      const s = stmt as Record<string, unknown>
      return s.type !== 'EmptyStatement' && s.type !== 'BlockStatement'
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
