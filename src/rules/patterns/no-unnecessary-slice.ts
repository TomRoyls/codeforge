import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import {
  extractLocation,
  isCallExpression,
  isMemberExpression,
  isIdentifier,
  isLiteral,
  getArguments,
  getRange,
} from '../../utils/ast-helpers.js'

function isSliceCall(node: unknown): boolean {
  if (!isCallExpression(node)) {
    return false
  }

  const n = node as Record<string, unknown>
  const callee = n.callee as unknown

  if (!isMemberExpression(callee)) {
    return false
  }

  const c = callee as Record<string, unknown>
  const property = c.property as unknown

  return isIdentifier(property, 'slice')
}

function isNumericLiteral(node: unknown, value: number): boolean {
  if (!isLiteral(node)) {
    return false
  }
  const n = node as Record<string, unknown>
  return n.value === value
}

function isUndefinedLiteral(node: unknown): boolean {
  if (!isLiteral(node)) {
    return false
  }
  const n = node as Record<string, unknown>
  return n.value === undefined && n.raw === 'undefined'
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
    if (isUndefinedLiteral(arg)) {
      return { isUnnecessary: true, reason: 'undefined argument' }
    }
  }

  return { isUnnecessary: false, reason: '' }
}

function getObjectSource(context: RuleContext, node: unknown): string {
  const n = node as Record<string, unknown>
  const callee = n.callee as Record<string, unknown>
  const object = callee.object as unknown

  if (!object || typeof object !== 'object') {
    return ''
  }

  const range = getRange(object)
  if (!range) {
    return ''
  }

  return context.getSource().slice(range[0], range[1])
}

export const noUnnecessarySliceRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Disallow unnecessary array.slice() calls. Calling .slice(0), .slice(undefined), or .slice() without arguments creates unnecessary overhead. Remove the slice call or use spread syntax if a shallow copy is needed.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-slice',
    },
    schema: [],
    fixable: 'code',
  },

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
        let fix: { range: [number, number]; text: string } | undefined

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
          message,
          loc: location,
          fix,
        })
      },
    }
  },
}

export default noUnnecessarySliceRule
