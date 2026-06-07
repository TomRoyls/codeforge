import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { getNodeSource, getRange, toASTNode } from '../../utils/ast-helpers.js'

function isBooleanCall(node: unknown): boolean {
  const n = toASTNode(node)
  if (n?.type !== 'CallExpression') return false
  const callee = toASTNode(n.callee)
  return callee?.type === 'Identifier' && callee.name === 'Boolean'
}

function isDoubleBang(node: unknown): boolean {
  const n = toASTNode(node)
  if (n?.type !== 'UnaryExpression' || n.operator !== '!') return false
  const arg = toASTNode(n.argument)
  if (arg?.type !== 'UnaryExpression') return false
  return arg.operator === '!'
}

export const noExtraBooleanCastRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        if (!isBooleanCall(node)) return
        const n = toASTNode(node)
        const args = n?.arguments
        if (Array.isArray(args) && args.length === 1) {
          const arg = args[0]
          if (isBooleanCall(arg) || isDoubleBang(arg)) {
            const innerArg = toASTNode(arg)?.argument ?? toASTNode(arg)?.arguments?.[0]
            const innerSource = innerArg ? getNodeSource(context, innerArg) : undefined
            const range = getRange(node)
            context.report({
              fix: range && innerSource
                ? { range, text: `Boolean(${innerSource})` }
                : undefined,
              loc: extractLocation(node),
              message: 'Redundant boolean cast.',
            })
          }
        }
      },
      UnaryExpression(node: unknown): void {
        if (!isDoubleBang(node)) return
        const n = toASTNode(node)
        const inner = toASTNode(n?.argument)
        if (isBooleanCall(inner?.argument)) {
          const innerArg = toASTNode(inner?.argument?.arguments?.[0])
          const innerSource = innerArg ? getNodeSource(context, innerArg) : undefined
          const range = getRange(node)
          context.report({
            fix: range && innerSource
              ? { range, text: `Boolean(${innerSource})` }
              : undefined,
            loc: extractLocation(node),
            message: 'Redundant boolean cast.',
          })
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow unnecessary boolean casts.',
      recommended: true,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/src/rules/patterns/no-extra-boolean-cast.ts',
    },
    fixable: 'code',
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noExtraBooleanCastRule
