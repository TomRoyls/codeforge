import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

type ASTNode = Record<string, unknown>

function isLiteral(node: unknown): node is ASTNode {
  if (!node || typeof node !== 'object') return false
  return (node as ASTNode).type === 'Literal'
}

function isRegexLiteral(node: unknown): boolean {
  if (!isLiteral(node)) return false
  return node.value instanceof RegExp
}

function isCallExpression(node: unknown): node is ASTNode {
  if (!node || typeof node !== 'object') return false
  return (node as ASTNode).type === 'CallExpression'
}

function isMemberExpression(node: unknown): node is ASTNode {
  if (!node || typeof node !== 'object') return false
  return (node as ASTNode).type === 'MemberExpression'
}

function isBinaryExpression(node: unknown): node is ASTNode {
  if (!node || typeof node !== 'object') return false
  return (node as ASTNode).type === 'BinaryExpression'
}

function isIdentifier(node: unknown, name?: string): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as ASTNode
  if (n.type !== 'Identifier') return false
  return name === undefined || n.name === name
}

function getRegexPattern(regex: RegExp): { type: 'startsWith' | 'endsWith'; value: string } | null {
  const source = regex.source
  const flags = regex.flags

  // Only support simple patterns without flags that change behavior
  if (flags.includes('i') || flags.includes('m')) return null

  // Check for startsWith pattern: /^abc/
  if (source.startsWith('^') && !source.includes('$')) {
    const value = source.slice(1)
    // Only allow simple literal patterns (no special regex chars)
    if (/^[a-zA-Z0-9_\s]+$/.test(value)) {
      return { type: 'startsWith', value }
    }
  }

  // Check for endsWith pattern: /abc$/
  if (source.endsWith('$') && !source.includes('^')) {
    const value = source.slice(0, -1)
    // Only allow simple literal patterns (no special regex chars)
    if (/^[a-zA-Z0-9_\s]+$/.test(value)) {
      return { type: 'endsWith', value }
    }
  }

  return null
}

function isIndexOfCall(node: unknown): boolean {
  if (!isCallExpression(node)) return false

  const callee = node.callee as unknown
  if (!isMemberExpression(callee)) return false

  const property = callee.property as unknown
  return isIdentifier(property, 'indexOf')
}

function isLiteralZero(node: unknown): boolean {
  if (!isLiteral(node)) return false
  return node.value === 0
}

function isIndexOfEqualsZero(node: ASTNode): { object: ASTNode; arg: unknown } | null {
  if (!isBinaryExpression(node)) return null
  if (node.operator !== '===' && node.operator !== '==') return null

  const left = node.left as unknown
  const right = node.right as unknown

  // Check: x.indexOf('y') === 0
  if (isIndexOfCall(left) && isLiteralZero(right)) {
    const leftCall = left as ASTNode
    const callee = leftCall.callee as ASTNode
    const args = leftCall.arguments as unknown[]
    if (args.length === 1) {
      return { object: callee.object as ASTNode, arg: args[0] }
    }
  }

  // Check: 0 === x.indexOf('y')
  if (isLiteralZero(left) && isIndexOfCall(right)) {
    const rightCall = right as ASTNode
    const callee = rightCall.callee as ASTNode
    const args = rightCall.arguments as unknown[]
    if (args.length === 1) {
      return { object: callee.object as ASTNode, arg: args[0] }
    }
  }

  return null
}

export const preferStringStartsEndsWithRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Prefer String.startsWith() and String.endsWith() over regex or indexOf patterns for better readability.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/prefer-string-starts-ends-with',
    },
    schema: [],
    fixable: 'code',
  },

  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        if (!isCallExpression(node)) return

        const n = node as ASTNode
        const callee = n.callee as unknown
        const args = n.arguments as unknown[]

        // Pattern: /^abc/.test(str) -> str.startsWith('abc')
        if (isMemberExpression(callee)) {
          const property = callee.property as unknown
          if (isIdentifier(property, 'test') && args.length === 1) {
            const object = callee.object as unknown
            if (isRegexLiteral(object)) {
              const regexObj = object as { value: RegExp }
              const regex = regexObj.value
              const pattern = getRegexPattern(regex)
              if (pattern) {
                const location = extractLocation(node)
                const method = pattern.type === 'startsWith' ? 'startsWith' : 'endsWith'
                context.report({
                  message: `Prefer String.${method}() over regex pattern for checking ${pattern.type === 'startsWith' ? 'start' : 'end'} of string.`,
                  loc: location,
                })
              }
            }
          }

          // Pattern: str.match(/^abc/) -> str.startsWith('abc')
          if (isIdentifier(property, 'match') && args.length === 1) {
            const arg = args[0] as unknown
            if (isRegexLiteral(arg)) {
              const regexObj = arg as { value: RegExp }
              const regex = regexObj.value
              const pattern = getRegexPattern(regex)
              if (pattern) {
                const location = extractLocation(node)
                const method = pattern.type === 'startsWith' ? 'startsWith' : 'endsWith'
                context.report({
                  message: `Prefer String.${method}() over regex pattern for checking ${pattern.type === 'startsWith' ? 'start' : 'end'} of string.`,
                  loc: location,
                })
              }
            }
          }
        }
      },

      BinaryExpression(node: unknown): void {
        if (!isBinaryExpression(node)) return

        const n = node as ASTNode

        // Pattern: x.indexOf('y') === 0 -> x.startsWith('y')
        const startsWithMatch = isIndexOfEqualsZero(n)
        if (startsWithMatch) {
          const location = extractLocation(node)
          context.report({
            message: `Prefer String.startsWith() over indexOf() === 0 for checking start of string.`,
            loc: location,
          })
          return
        }

        // Pattern: x.indexOf('y') === x.length - 1 or x.lastIndexOf('y') === x.length - y.length
        // For simplicity, we detect: x.indexOf('y') !== -1 && x.indexOf('y') === x.length - 1 patterns
        // A common endsWith pattern is: str.lastIndexOf('x') === str.length - 1
        // Or: str.indexOf('x', str.length - 1) !== -1

        const operator = n.operator as string
        const left = n.left as unknown
        const right = n.right as unknown

        // Pattern: str.indexOf('x', str.length - 1) === str.length - 1
        // or: str.lastIndexOf('x') === str.length - x.length
        if (operator === '===' || operator === '==') {
          // Check if this is an indexOf with a second argument (position)
          if (isCallExpression(left)) {
            const leftCall = left as ASTNode
            const callee = leftCall.callee as unknown
            if (isMemberExpression(callee)) {
              const property = callee.property as unknown
              const args = leftCall.arguments as unknown[]

              // str.indexOf('x', str.length - 1) pattern - detecting this is complex
              // For now, detect str.lastIndexOf('x') === str.length - n patterns
              if (isIdentifier(property, 'lastIndexOf') && args.length === 1) {
                // Simple detection: lastIndexOf being compared to length-related expression
                if (isMemberExpression(right)) {
                  const rightMember = right as ASTNode
                  const rightProp = rightMember.property as unknown
                  if (isIdentifier(rightProp, 'length')) {
                    const location = extractLocation(node)
                    context.report({
                      message: `Prefer String.endsWith() over lastIndexOf() for checking end of string.`,
                      loc: location,
                    })
                  }
                }
              }
            }
          }
        }
      },
    }
  },
}

export default preferStringStartsEndsWithRule
