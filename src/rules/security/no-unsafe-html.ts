/**
 * @file Detect potentially unsafe HTML string construction (XSS vulnerabilities)
 * @module rules/security/no-unsafe-html
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

interface NoUnsafeHtmlOptions {
  readonly safeMethods?: string[]
}

const DEFAULT_SAFE_METHODS = ['sanitize', 'escape', 'encode']

const HTML_TAG_PATTERN = /<[a-zA-Z][^>]*>/
const UNSAFE_PROPERTIES = new Set(['innerHTML', 'outerHTML'])
const SAFE_PROPERTIES = new Set(['innerText', 'textContent'])
const UNSAFE_METHODS = new Set(['html'])

function isStringLiteral(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) return false
  return n.type === 'Literal' && typeof n.value === 'string'
}

function isNumberOrBooleanLiteral(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) return false
  if (n.type === 'Literal') {
    return typeof n.value === 'number' || typeof n.value === 'boolean'
  }

  return false
}

function containsHtmlTags(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) return false

  if (n.type === 'Literal' && typeof n.value === 'string') {
    return HTML_TAG_PATTERN.test(n.value as string)
  }

  if (n.type === 'TemplateLiteral') {
    const {quasis} = n
    if (Array.isArray(quasis)) {
      for (const quasi of quasis) {
        const q = toASTNode(quasi)
        if (q && q.type === 'TemplateElement' && typeof q.value === 'object' && q.value !== null) {
          const {raw} = (q.value as Record<string, unknown>)
          if (typeof raw === 'string' && HTML_TAG_PATTERN.test(raw)) {
            return true
          }

          const {cooked} = (q.value as Record<string, unknown>)
          if (typeof cooked === 'string' && HTML_TAG_PATTERN.test(cooked)) {
            return true
          }
        }
      }
    }
  }

  return false
}

function isWrappedBySafeMethod(node: unknown, safeMethods: readonly string[]): boolean {
  const n = toASTNode(node)
  if (!n) return false

  if (n.type === 'CallExpression') {
    const callee = toASTNode(n.callee)
    if (!callee) return false

    if (callee.type === 'MemberExpression') {
      const property = toASTNode(callee.property)
      if (property && property.type === 'Identifier' && typeof property.name === 'string' && safeMethods.includes(property.name)) {
          return true
        }
    }

    if (callee.type === 'Identifier' && typeof callee.name === 'string' && safeMethods.includes(callee.name)) {
        return true
      }
  }

  return false
}

function isDOMPurifySanitize(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) return false

  if (n.type !== 'CallExpression') return false

  const callee = toASTNode(n.callee)
  if (!callee) return false

  if (callee.type === 'MemberExpression') {
    const object = toASTNode(callee.object)
    const property = toASTNode(callee.property)

    if (
      object && object.type === 'Identifier' && object.name === 'DOMPurify' &&
      property && property.type === 'Identifier' && property.name === 'sanitize'
    ) {
      return true
    }
  }

  return false
}

function isSafeValue(node: unknown, safeMethods: readonly string[]): boolean {
  return isNumberOrBooleanLiteral(node) ||
    isWrappedBySafeMethod(node, safeMethods) ||
    isDOMPurifySanitize(node)
}

function getMemberPropertyName(node: unknown): null | string {
  const n = toASTNode(node)
  if (!n) return null

  if (n.type === 'MemberExpression') {
    const property = toASTNode(n.property)
    if (property && property.type === 'Identifier' && typeof property.name === 'string') {
      return property.name
    }
  }

  return null
}

function getCalleeMethodName(node: unknown): null | string {
  const n = toASTNode(node)
  if (!n) return null

  if (n.type !== 'CallExpression') return null

  const callee = toASTNode(n.callee)
  if (!callee) return null

  if (callee.type === 'MemberExpression') {
    return getMemberPropertyName(callee)
  }

  return null
}

function isDocumentWrite(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) return false

  if (n.type !== 'CallExpression') return false

  const callee = toASTNode(n.callee)
  if (!callee) return false

  if (callee.type === 'MemberExpression') {
    const object = toASTNode(callee.object)
    const property = toASTNode(callee.property)

    if (
      object && object.type === 'Identifier' && object.name === 'document' &&
      property && property.type === 'Identifier' && property.name === 'write'
    ) {
      return true
    }
  }

  return false
}

function isInsertAdjacentHTML(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) return false

  if (n.type !== 'CallExpression') return false

  const methodName = getCalleeMethodName(node)
  return methodName === 'insertAdjacentHTML'
}

function isJQueryHtml(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) return false

  if (n.type !== 'CallExpression') return false

  const methodName = getCalleeMethodName(node)
  return methodName !== null && UNSAFE_METHODS.has(methodName)
}

function getAssignmentLeft(node: unknown): unknown {
  const n = toASTNode(node)
  if (!n) return null
  return n.left ?? null
}

function getAssignmentRight(node: unknown): unknown {
  const n = toASTNode(node)
  if (!n) return null
  return n.right ?? null
}

export const noUnsafeHtmlRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const rawOptions = context.config.options?.[0] as NoUnsafeHtmlOptions | undefined
    const userSafeMethods = rawOptions?.safeMethods ?? []
    const safeMethods = [...DEFAULT_SAFE_METHODS, ...userSafeMethods]

    return {
      AssignmentExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n) return

        if (n.operator !== '=') return

        const leftNode = getAssignmentLeft(node)
        const rightNode = getAssignmentRight(node)

        if (!leftNode || !rightNode) return

        const propertyName = getMemberPropertyName(leftNode)

        if (!propertyName) return

        if (SAFE_PROPERTIES.has(propertyName)) return

        if (UNSAFE_PROPERTIES.has(propertyName)) {
          if (isSafeValue(rightNode, safeMethods)) return

          if (isStringLiteral(rightNode) || containsHtmlTags(rightNode)) {
            const location = extractLocation(node)
            context.report({
              loc: location,
              message: `Unsafe assignment to '${propertyName}' with a string value. This can lead to XSS vulnerabilities. Use textContent or sanitize the HTML with a library like DOMPurify.`,
              node,
            })
            return
          }

          const rightAst = toASTNode(rightNode)
          if (rightAst && !isSafeValue(rightNode, safeMethods)) {
            const location = extractLocation(node)
            context.report({
              loc: location,
              message: `Unsafe assignment to '${propertyName}' with a dynamic value. This can lead to XSS vulnerabilities. Use textContent or sanitize the HTML with a library like DOMPurify.`,
              node,
            })
          }
        }
      },

      CallExpression(node: unknown): void {
        if (isDocumentWrite(node)) {
          const n = toASTNode(node)
          if (!n) return

          const args = n.arguments
          if (!args || args.length === 0) return

          const firstArg = args[0]
          if (isSafeValue(firstArg, safeMethods)) return

          const location = extractLocation(node)
          context.report({
            loc: location,
            message: 'Unsafe use of document.write() with a string argument. This can lead to XSS vulnerabilities. Use DOM manipulation methods like textContent or createElement instead.',
            node,
          })
          return
        }

        if (isInsertAdjacentHTML(node)) {
          const n = toASTNode(node)
          if (!n) return

          const args = n.arguments
          if (!args || args.length < 2) return

          const htmlArg = args[1]
          if (isSafeValue(htmlArg, safeMethods)) return

          const location = extractLocation(node)
          context.report({
            loc: location,
            message: 'Unsafe use of insertAdjacentHTML() with a string argument. This can lead to XSS vulnerabilities. Use DOM manipulation methods like textContent or createElement instead.',
            node,
          })
          return
        }

        if (isJQueryHtml(node)) {
          const n = toASTNode(node)
          if (!n) return

          const args = n.arguments
          if (!args || args.length === 0) return

          const firstArg = args[0]
          if (isSafeValue(firstArg, safeMethods)) return

          const location = extractLocation(node)
          context.report({
            loc: location,
            message: 'Unsafe use of .html() with a string argument. This can lead to XSS vulnerabilities. Use .text() instead, or sanitize the HTML with a library like DOMPurify.',
            node,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'security',
      description:
        'Detect potentially unsafe HTML string construction that can lead to XSS vulnerabilities, including innerHTML/outerHTML assignments, document.write(), insertAdjacentHTML(), and jQuery-style .html() calls.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-unsafe-html',
    },
    fixable: undefined,
    schema: [
      {
        additionalProperties: false,
        properties: {
          safeMethods: {
            default: ['sanitize', 'escape', 'encode'],
            items: { type: 'string' },
            type: 'array',
          },
        },
        type: 'object',
      },
    ],
    severity: 'warn',
    type: 'problem',
  },
}

export default noUnsafeHtmlRule
