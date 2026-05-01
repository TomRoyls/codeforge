import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import {
  getPropertyName,
  isExpectCall,
  toASTNode,
} from '../../utils/ast-helpers.js'

const ASYNC_MATCHERS = new Set([
  'resolves',
  'rejects',
])

function isExpectWithResolvesOrRejects(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n || n.type !== 'CallExpression') return false

  const callee = toASTNode(n.callee)
  if (!callee) return false

  if (callee.type === 'MemberExpression') {
    const prop = getPropertyName(callee.property)
    if (prop && ASYNC_MATCHERS.has(prop)) {
      const obj = toASTNode(callee.object)
      if (obj && obj.type === 'CallExpression') {
        const objCallee = toASTNode(obj.callee)
        if (objCallee && objCallee.type === 'Identifier' && objCallee.name === 'expect') {
          return true
        }
      }
    }
  }

  return false
}

function getAwaitedExpression(node: unknown): unknown {
  const n = toASTNode(node)
  if (!n) return null

  if (n.type === 'AwaitExpression' && n.argument) {
    return n.argument
  }

  if (n.type === 'VariableDeclarator' && n.init) {
    return getAwaitedExpression(n.init)
  }

  return null
}

function findExpectInScope(node: unknown, results: Array<{ message: string }>): void {
  const n = toASTNode(node)
  if (!n) return

  if (n.type === 'CallExpression' && isExpectCall(node) && !isExpectWithResolvesOrRejects(node)) {
    const arg = (n as { arguments?: unknown[] }).arguments
    if (arg && arg.length > 0) {
      const firstArg = arg[0]
      const awaited = getAwaitedExpression(firstArg)
      if (!awaited) {
        const callee = toASTNode(n.callee)
        if (callee && callee.type === 'MemberExpression') {
          const obj = toASTNode(callee.object)
          if (obj && obj.type === 'CallExpression') {
            const innerCallee = toASTNode(obj.callee)
            if (innerCallee && innerCallee.type === 'Identifier' && innerCallee.name === 'expect') {
              const innerArgs = (obj as { arguments?: unknown[] }).arguments
              if (innerArgs && innerArgs.length > 0) {
                const innerFirst = innerArgs[0]
                const innerN = toASTNode(innerFirst)
                if (innerN && (innerN.type === 'AwaitExpression' || innerN.type === 'MemberExpression')) {
                  results.push({
                    message: 'Use `expect().resolves` or `expect().rejects` instead of manually awaiting promises in assertions.',
                  })
                }
              }
            }
          }
        }
      }
    }
  }

  for (const key of Object.keys(n)) {
    const val = (n as Record<string, unknown>)[key]
    if (val && typeof val === 'object') {
      if (Array.isArray(val)) {
        for (const item of val) {
          findExpectInScope(item, results)
        }
      } else {
        findExpectInScope(val, results)
      }
    }
  }
}

export const preferResolvesRejectsRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const callee = toASTNode(n.callee)
        if (!callee || callee.type !== 'MemberExpression') return

        const prop = getPropertyName(callee.property)
        if (!prop) return

        if (prop !== 'then' && prop !== 'catch') return

        const obj = toASTNode(callee.object)
        if (!obj || obj.type !== 'CallExpression') return

        const objCallee = toASTNode(obj.callee)
        if (!objCallee || objCallee.type !== 'Identifier' || objCallee.name !== 'expect') return

        const args = (n as { arguments?: unknown[] }).arguments
        if (!args || args.length === 0) return

        const callback = args[0]
        if (!callback || typeof callback !== 'object') return

        const results: Array<{ message: string }> = []
        findExpectInScope(callback, results)

        for (const result of results) {
          context.report({
            loc: extractLocation(node),
            message: result.message,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description:
        'Prefer using expect().resolves and expect().rejects over manually unwrapping promises with .then() or .catch()',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/prefer-resolves-rejects',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default preferResolvesRejectsRule
