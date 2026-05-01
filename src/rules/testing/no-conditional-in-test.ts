import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'
import { extractRuleOptions } from '../../utils/options-helpers.js'

interface NoConditionalInTestOptions {
  readonly checkLoopStatements?: boolean
  readonly checkTryCatch?: boolean
}

function isTestCase(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n || n.type !== 'CallExpression') return false

  const callee = toASTNode(n.callee)
  if (!callee) return false

  if (callee.type === 'Identifier' && typeof callee.name === 'string') {
    return callee.name === 'it' || callee.name === 'test'
  }

  if (callee.type === 'MemberExpression') {
    const object = toASTNode(callee.object)
    if (object?.type === 'Identifier' && typeof object.name === 'string') {
      return object.name === 'it' || object.name === 'test'
    }
  }

  return false
}

function getTestFunctionName(node: unknown): string {
  const n = toASTNode(node)
  if (!n || n.type !== 'CallExpression') return 'test'

  const callee = toASTNode(n.callee)
  if (!callee) return 'test'

  if (callee.type === 'Identifier' && typeof callee.name === 'string') {
    return callee.name
  }

  if (callee.type === 'MemberExpression') {
    const object = toASTNode(callee.object)
    if (object?.type === 'Identifier' && typeof object.name === 'string') {
      return object.name
    }
  }

  return 'test'
}

export const noConditionalInTestRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const options = extractRuleOptions<NoConditionalInTestOptions>(
      context.config.options,
      { checkLoopStatements: true, checkTryCatch: true },
    )

    const checkLoopStatements = options.checkLoopStatements ?? true
    const checkTryCatch = options.checkTryCatch ?? true

    let inTestCase = 0
    let currentTestFn = 'test'

    return {
      CallExpression(node: unknown): void {
        if (isTestCase(node)) {
          inTestCase++
          currentTestFn = getTestFunctionName(node)
        }
      },

      'CallExpression:exit'(node: unknown): void {
        if (isTestCase(node)) {
          inTestCase--
        }
      },

      CatchClause(node: unknown): void {
        if (inTestCase > 0 && checkTryCatch) {
          context.report({
            loc: extractLocation(node),
            message: `Unexpected catch clause inside '${currentTestFn}' test. Tests should not contain try/catch logic.`,
            node,
          })
        }
      },

      ConditionalExpression(node: unknown): void {
        if (inTestCase > 0) {
          context.report({
            loc: extractLocation(node),
            message: `Unexpected ternary expression inside '${currentTestFn}' test. Tests should not contain conditional logic.`,
            node,
          })
        }
      },

      DoWhileStatement(node: unknown): void {
        if (inTestCase > 0 && checkLoopStatements) {
          context.report({
            loc: extractLocation(node),
            message: `Unexpected do-while loop inside '${currentTestFn}' test. Tests should not contain loop statements.`,
            node,
          })
        }
      },

      ForInStatement(node: unknown): void {
        if (inTestCase > 0 && checkLoopStatements) {
          context.report({
            loc: extractLocation(node),
            message: `Unexpected for-in loop inside '${currentTestFn}' test. Tests should not contain loop statements.`,
            node,
          })
        }
      },

      ForOfStatement(node: unknown): void {
        if (inTestCase > 0 && checkLoopStatements) {
          context.report({
            loc: extractLocation(node),
            message: `Unexpected for-of loop inside '${currentTestFn}' test. Tests should not contain loop statements.`,
            node,
          })
        }
      },

      ForStatement(node: unknown): void {
        if (inTestCase > 0 && checkLoopStatements) {
          context.report({
            loc: extractLocation(node),
            message: `Unexpected for loop inside '${currentTestFn}' test. Tests should not contain loop statements.`,
            node,
          })
        }
      },

      IfStatement(node: unknown): void {
        if (inTestCase > 0) {
          context.report({
            loc: extractLocation(node),
            message: `Unexpected if statement inside '${currentTestFn}' test. Tests should not contain conditional logic.`,
            node,
          })
        }
      },

      SwitchStatement(node: unknown): void {
        if (inTestCase > 0) {
          context.report({
            loc: extractLocation(node),
            message: `Unexpected switch statement inside '${currentTestFn}' test. Tests should not contain conditional logic.`,
            node,
          })
        }
      },

      WhileStatement(node: unknown): void {
        if (inTestCase > 0 && checkLoopStatements) {
          context.report({
            loc: extractLocation(node),
            message: `Unexpected while loop inside '${currentTestFn}' test. Tests should not contain loop statements.`,
            node,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description: 'Disallow conditional statements inside test bodies',
      recommended: true,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/testing/no-conditional-in-test',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          checkLoopStatements: {
            type: 'boolean',
          },
          checkTryCatch: {
            type: 'boolean',
          },
        },
        type: 'object',
      },
    ],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noConditionalInTestRule
