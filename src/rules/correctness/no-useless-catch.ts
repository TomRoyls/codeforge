import type {
  RuleDefinition,
  RuleContext,
  RuleVisitor,
  SourceLocation,
} from '../../plugins/types.js'
import { extractRuleOptions } from '../../utils/options-helpers.js'

interface NoUselessCatchOptions {}

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

function isUselessCatchBlock(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  if (n.type !== 'CatchClause') {
    return false
  }

  // Get the catch parameter (e.g., 'e' in catch (e))
  const param = n.param as Record<string, unknown> | undefined | null
  if (!param) {
    // Catch without parameter - if it throws, it's not useless
    return false
  }

  if (param.type !== 'Identifier' || typeof param.name !== 'string') {
    return false
  }
  const caughtParamName = param.name

  // Get the body
  const body = n.body as Record<string, unknown> | undefined
  if (!body || body.type !== 'BlockStatement') {
    return false
  }

  const bodyStatements = body.body as unknown[] | undefined
  if (!Array.isArray(bodyStatements) || bodyStatements.length !== 1) {
    // Not exactly one statement - not useless (could have logging, etc.)
    return false
  }

  const singleStatement = bodyStatements[0] as Record<string, unknown>
  if (singleStatement.type !== 'ThrowStatement') {
    // Not a throw statement - not useless
    return false
  }

  const throwArgument = singleStatement.argument as Record<string, unknown> | undefined | null
  if (!throwArgument) {
    // throw without argument - not the pattern we're looking for
    return false
  }

  // Case 1: Direct rethrow of the caught parameter: catch (e) { throw e }
  if (throwArgument.type === 'Identifier' && throwArgument.name === caughtParamName) {
    return true
  }

  // Case 2: Rethrow with just the message: catch (e) { throw new Error(e.message) }
  if (throwArgument.type === 'NewExpression') {
    const callee = throwArgument.callee as Record<string, unknown> | undefined
    if (callee && callee.type === 'Identifier' && callee.name === 'Error') {
      const args = throwArgument.arguments as unknown[] | undefined
      if (args && args.length === 1) {
        const firstArg = args[0] as Record<string, unknown>
        // Check if it's e.message
        if (firstArg.type === 'MemberExpression' && !firstArg.computed && !firstArg.optional) {
          const obj = firstArg.object as Record<string, unknown> | undefined
          const prop = firstArg.property as Record<string, unknown> | undefined
          if (
            obj &&
            obj.type === 'Identifier' &&
            obj.name === caughtParamName &&
            prop &&
            prop.type === 'Identifier' &&
            prop.name === 'message'
          ) {
            return true
          }
        }
      }
    }
  }

  return false
}

export const noUselessCatchRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description: 'Disallow useless catch clauses that only rethrow the caught error unchanged',
      category: 'correctness',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-useless-catch',
    },
    schema: [],
  },

  create(context: RuleContext): RuleVisitor {
    extractRuleOptions<NoUselessCatchOptions>(context.config.options, {})

    return {
      CatchClause(node: unknown): void {
        if (isUselessCatchBlock(node)) {
          context.report({
            node,
            message:
              'Useless catch clause. The catch block only rethrows the caught error without any additional handling. Remove the try-catch or add proper error handling.',
            loc: extractLocation(node),
          })
        }
      },
    }
  },
}

export default noUselessCatchRule
