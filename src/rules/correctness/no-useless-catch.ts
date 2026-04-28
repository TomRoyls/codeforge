import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'
import { extractRuleOptions } from '../../utils/options-helpers.js'

interface NoUselessCatchOptions {}

function isUselessCatchBlock(node: unknown): boolean {
  const n = toASTNode(node)
  if (n?.type !== 'CatchClause') {
    return false
  }

  const param = toASTNode(n.param)
  if (!param) {
    return false
  }

  if (param.type !== 'Identifier' || typeof param.name !== 'string') {
    return false
  }

  const caughtParamName = param.name

  const body = toASTNode(n.body)
  if (body?.type !== 'BlockStatement') {
    return false
  }

  const bodyStatements = body.body as undefined | unknown[]
  if (!Array.isArray(bodyStatements) || bodyStatements.length !== 1) {
    return false
  }

  const singleStatement = toASTNode(bodyStatements[0])
  if (singleStatement?.type !== 'ThrowStatement') {
    return false
  }

  const throwArgument = toASTNode(singleStatement.argument)
  if (!throwArgument) {
    return false
  }

  if (throwArgument.type === 'Identifier' && throwArgument.name === caughtParamName) {
    return true
  }

  if (throwArgument.type === 'NewExpression') {
    const callee = toASTNode(throwArgument.callee)
    if (callee?.type === 'Identifier' && callee.name === 'Error') {
      const args = throwArgument.arguments
      if (args && args.length === 1) {
        const firstArg = toASTNode(args[0])
        if (firstArg?.type === 'MemberExpression' && !firstArg.computed && !firstArg.optional) {
          const obj = toASTNode(firstArg.object)
          const prop = toASTNode(firstArg.property)
          if (
            obj?.type === 'Identifier' &&
            obj.name === caughtParamName &&
            prop?.type === 'Identifier' &&
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
  create(context: RuleContext): RuleVisitor {
    extractRuleOptions<NoUselessCatchOptions>(context.config.options, {})

    return {
      CatchClause(node: unknown): void {
        if (isUselessCatchBlock(node)) {
          context.report({
            loc: extractLocation(node),
            message:
              'Useless catch clause. The catch block only rethrows the caught error without any additional handling. Remove the try-catch or add proper error handling.',
            node,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'correctness',
      description: 'Disallow useless catch clauses that only rethrow the caught error unchanged',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-useless-catch',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUselessCatchRule
