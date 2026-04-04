import type {
  RuleDefinition,
  RuleContext,
  RuleVisitor,
  SourceLocation,
} from '../../plugins/types.js'
import { extractRuleOptions } from '../../utils/options-helpers.js'

interface NoEmptyCatchOptions {
  readonly allowComments?: boolean
}

function extractLocation(node: unknown): SourceLocation {
  const defaultLoc: SourceLocation = {
    start: { line: 1, column: 0 },
    end: { line: 1, column: 1 },
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
    start: {
      line: typeof start?.line === 'number' ? start.line : 1,
      column: typeof start?.column === 'number' ? start.column : 0,
    },
    end: {
      line: typeof end?.line === 'number' ? end.line : 1,
      column: typeof end?.column === 'number' ? end.column : 0,
    },
  }
}

function isEmptyCatchBlock(node: unknown, allowComments: boolean): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  if (n.type !== 'CatchClause') {
    return false
  }

  const body = n.body as Record<string, unknown> | undefined
  if (!body) {
    return true
  }

  if (body.type !== 'BlockStatement') {
    return false
  }

  const bodyBody = body.body as unknown[] | undefined
  if (!Array.isArray(bodyBody)) {
    return true
  }

  if (bodyBody.length === 0) {
    return true
  }

  if (allowComments) {
    const hasRealStatements = bodyBody.some(
      (stmt) => {
        const s = stmt as Record<string, unknown>
        return s.type !== 'EmptyStatement' && s.type !== 'BlockStatement'
      },
    )
    return !hasRealStatements && bodyBody.length === 0
  }

  for (const stmt of bodyBody) {
    const s = stmt as Record<string, unknown>
    if (s.type !== 'EmptyStatement' && s.type !== 'BlockStatement') {
      return false
    }
  }

  return true
}

export const noEmptyCatchRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'warn',
    docs: {
      description: 'Disallow empty catch clauses that may hide errors silently',
      category: 'correctness',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-empty-catch',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowComments: {
            type: 'boolean',
            default: false,
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context: RuleContext): RuleVisitor {
    const options = extractRuleOptions<NoEmptyCatchOptions>(context.config.options, {
      allowComments: false,
    })

    return {
      CatchClause(node: unknown): void {
        if (isEmptyCatchBlock(node, options.allowComments ?? false)) {
          context.report({
            node,
            message: 'Empty catch clause. Either add error handling or remove the catch block.',
            loc: extractLocation(node),
          })
        }
      },
    }
  },
}

export default noEmptyCatchRule
