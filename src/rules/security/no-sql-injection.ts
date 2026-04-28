/**
 * @file Detect potential SQL injection vulnerabilities in SQL queries
 * @module rules/security/no-sql-injection
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

interface NoSqlInjectionOptions {
  readonly checkTemplateLiterals?: boolean
  readonly ignoreMethods?: string[]
}

const SQL_KEYWORDS =
  /\b(?:ALTER|CREATE|DELETE|DROP|EXEC|FROM|INSERT|JOIN|SELECT|SET|TABLE|UNION|UPDATE|VALUES|WHERE)\b/i

const SQL_METHOD_NAMES = new Set([
  'all',
  'execute',
  'get',
  'query',
  'raw',
  'run',
  'sql',
])

const SQL_OBJECT_NAMES = new Set([
  'conn',
  'connection',
  'database',
  'db',
  'knex',
  'mysql',
  'pg',
  'pool',
  'prisma',
  'sequelize',
  'sqlite',
])

const TEST_FILE_PATTERN = /\.test\.|\.spec\.|__tests__/

function containsSqlKeywords(value: string): boolean {
  return SQL_KEYWORDS.test(value)
}

function getCalleeMethodName(callee: unknown): null | string {
  const n = toASTNode(callee)
  if (!n) return null
  if (n.type === 'Identifier' && typeof n.name === 'string') return n.name
  if (n.type === 'MemberExpression') {
    const prop = toASTNode(n.property)
    if (prop?.type === 'Identifier' && typeof prop.name === 'string') return prop.name
  }

  return null
}

function getStaticString(node: unknown): null | string {
  const n = toASTNode(node)
  if (!n) return null
  if (n.type === 'Literal' && typeof n.value === 'string') return n.value
  return null
}

function hasSqlKeywordInNode(node: unknown, depth: number): boolean {
  if (depth > 3) return false
  const n = toASTNode(node)
  if (!n) return false

  if (n.type === 'Literal' && typeof n.value === 'string') {
    return containsSqlKeywords(n.value)
  }

  if (n.type === 'BinaryExpression' && n.operator === '+') {
    return (
      hasSqlKeywordInNode(n.left, depth + 1)
      || hasSqlKeywordInNode(n.right, depth + 1)
    )
  }

  if (n.type === 'TemplateLiteral' && n.quasis) {
    for (const quasi of n.quasis) {
      const q = toASTNode(quasi)
      if (
        q?.value
        && typeof (q.value as Record<string, unknown>).cooked === 'string'
       && 
          containsSqlKeywords(
            (q.value as Record<string, unknown>).cooked as string,
          )
        ) {
          return true
        }
    }
  }

  return false
}

function isArrayJoinWithSql(arg: unknown): boolean {
  const n = toASTNode(arg)
  if (!n || n.type !== 'CallExpression') return false
  const callee = toASTNode(n.callee)
  if (!callee || callee.type !== 'MemberExpression') return false
  const prop = toASTNode(callee.property)
  if (prop?.type !== 'Identifier' || prop.name !== 'join') return false
  const obj = toASTNode(callee.object)
  if (obj?.type !== 'ArrayExpression' || !obj.elements) return false
  for (const el of obj.elements) {
    const val = getStaticString(el)
    if (val && containsSqlKeywords(val)) return true
  }

  return false
}

function isIgnoredMethod(callee: unknown, ignored: ReadonlySet<string>): boolean {
  if (ignored.size === 0) return false
  const name = getCalleeMethodName(callee)
  return name !== null && ignored.has(name)
}

function isOnSqlObject(callee: unknown): boolean {
  const n = toASTNode(callee)
  if (n?.type !== 'MemberExpression') return false
  const obj = toASTNode(n.object)
  if (obj?.type === 'Identifier' && typeof obj.name === 'string') {
    return SQL_OBJECT_NAMES.has(obj.name)
  }

  return false
}

function isSqlMethod(callee: unknown): boolean {
  const name = getCalleeMethodName(callee)
  return name !== null && SQL_METHOD_NAMES.has(name)
}

function isTestFile(filePath: string): boolean {
  return TEST_FILE_PATTERN.test(filePath)
}

function reportFinding(
  context: RuleContext,
  node: unknown,
  reason: string,
): void {
  const location = extractLocation(node)
  context.report({
    loc: location,
    message: `Potential SQL injection: ${reason}. Use parameterized queries instead.`,
    node,
  })
}

export const noSqlInjectionRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const options = context.config.options?.[0] as
      | NoSqlInjectionOptions
      | undefined
    const checkTemplateLiterals = options?.checkTemplateLiterals ?? true
    const ignoreMethods = new Set(options?.ignoreMethods ?? [])
    const filePath = context.getFilePath()

    if (isTestFile(filePath)) {
      return {
        CallExpression(_node: unknown): void {},
      }
    }

    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n) return
        const callee = toASTNode(n.callee)
        if (!callee) return

        if (callee.type === 'Identifier' && callee.name === 'eval') {
          const evalArgs = n.arguments
          if (
            evalArgs
            && evalArgs.length > 0
            && hasSqlKeywordInNode(evalArgs[0], 0)
          ) {
            reportFinding(
              context,
              node,
              'eval() called with SQL-related string',
            )
          }

          return
        }

        if (!isSqlMethod(callee) && !isOnSqlObject(callee)) return
        if (isIgnoredMethod(callee, ignoreMethods)) return

        const args = n.arguments
        if (!args || args.length === 0) return
        const firstArg = args[0]
        const firstArgNode = toASTNode(firstArg)

        if (
          firstArgNode?.type === 'BinaryExpression'
          && firstArgNode.operator === '+'
         && hasSqlKeywordInNode(firstArg, 0)) {
            reportFinding(
              context,
              node,
              'string concatenation detected in SQL query',
            )
            return
          }

        if (
          checkTemplateLiterals
          && firstArgNode?.type === 'TemplateLiteral'
         && 
            Array.isArray(firstArgNode.expressions)
            && firstArgNode.expressions.length > 0
           && hasSqlKeywordInNode(firstArg, 0)) {
              reportFinding(
                context,
                node,
                'template literal interpolation detected in SQL query',
              )
              return
            }

        if (isArrayJoinWithSql(firstArg)) {
          reportFinding(
            context,
            node,
            'Array.join() used to build SQL query',
          )
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'security',
      description:
        'Detect potential SQL injection vulnerabilities from string concatenation, template literals, and other unsafe patterns in SQL queries.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-sql-injection',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          checkTemplateLiterals: {
            default: true,
            type: 'boolean',
          },
          ignoreMethods: {
            default: [],
            items: { type: 'string' },
            type: 'array',
          },
        },
        type: 'object',
      },
    ],
    severity: 'error',
    type: 'problem',
  },
}

export default noSqlInjectionRule
