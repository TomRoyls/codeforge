import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import {
  getArguments,
  getRange,
  isCallExpression,
  isIdentifier,
  isLiteral,
  isMemberExpression,
  toASTNode,
} from '../../utils/ast-helpers.js'

function isSliceCall(node: unknown): boolean {
  if (!isCallExpression(node)) return false
  const callee = toASTNode(toASTNode(node)?.callee)
  if (!isMemberExpression(callee)) return false
  return isIdentifier(toASTNode(callee)?.property, 'slice')
}

function isNumericLiteral(node: unknown, value: number): boolean {
  if (!isLiteral(node)) return false
  return toASTNode(node)?.value === value
}

// ESTree: `undefined` is an Identifier node, not a Literal
function isUndefinedIdentifier(node: unknown): boolean {
  const n = toASTNode(node)
  return n?.type === 'Identifier' && n.name === 'undefined'
}

function hasUnnecessarySliceArgs(args: unknown[]): { isUnnecessary: boolean; reason: string } {
  if (args.length === 0) {
    return { isUnnecessary: true, reason: 'no arguments' }
  }

  if (args.length === 1) {
    const arg = args[0]

    // .slice(0) is unnecessary
    if (isNumericLiteral(arg, 0)) {
      return { isUnnecessary: true, reason: 'zero argument' }
    }

    // .slice(undefined) is unnecessary
    if (isUndefinedIdentifier(arg)) {
      return { isUnnecessary: true, reason: 'undefined argument' }
    }
  }

  return { isUnnecessary: false, reason: '' }
}

function getObjectSource(context: RuleContext, node: unknown): string {
  const callee = toASTNode(toASTNode(node)?.callee)
  if (!callee) return ''

  const range = getRange(callee.object)
  if (!range) return ''

  return context.getSource().slice(range[0], range[1])
}

export const noUnnecessarySliceRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        if (!isSliceCall(node)) {
          return
        }

        const args = getArguments(node)
        const { isUnnecessary, reason } = hasUnnecessarySliceArgs(args)

        if (!isUnnecessary) {
          return
        }

        const location = extractLocation(node)
        const range = getRange(node)
        const objectSource = getObjectSource(context, node)

        let message: string
        let fix: undefined | { range: [number, number]; text: string }

        if (reason === 'no arguments') {
          message = `Unnecessary .slice() call. It creates a shallow copy with no benefit. Remove the call or use spread syntax if you need a copy.`
          if (range && objectSource) {
            fix = { range, text: objectSource }
          }
        } else if (reason === 'zero argument') {
          message = `Unnecessary .slice(0) call. It returns the entire array. Remove the call.`
          if (range && objectSource) {
            fix = { range, text: objectSource }
          }
        } else {
          message = `Unnecessary .slice(undefined) call. It returns the entire array. Remove the call.`
          if (range && objectSource) {
            fix = { range, text: objectSource }
          }
        }

        context.report({
          fix,
          loc: location,
          message,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow unnecessary array.slice() calls. Calling .slice(0), .slice(undefined), or .slice() without arguments creates unnecessary overhead. Remove the slice call or use spread syntax if a shallow copy is needed.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-slice',
    },
    fixable: 'code',
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessarySliceRule
