/**
 * @module rules/patterns/no-use-before-define
 * Disallows use of variables before they are defined.
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

const BUILTIN_GLOBALS = new Set([
  'Array', 'BigInt', 'Boolean', 'Date', 'Error', 'EvalError', 'Function',
  'Infinity', 'JSON', 'Map', 'Math', 'NaN', 'Number', 'Object', 'Promise',
  'Proxy', 'RangeError', 'ReferenceError', 'Reflect', 'RegExp', 'Set',
  'String', 'Symbol', 'SyntaxError', 'TypeError', 'URIError', 'Uint8Array',
  'WeakMap', 'WeakSet', 'console', 'decodeURI', 'decodeURIComponent',
  'encodeURI', 'encodeURIComponent', 'escape', 'eval', 'globalThis',
  'isFinite', 'isNaN', 'parseFloat', 'parseInt', 'process', 'undefined',
  'unescape',
  // Node.js globals
  'Buffer', 'global', 'module', 'require', 'exports', '__dirname', '__filename',
  'setTimeout', 'setInterval', 'setImmediate', 'clearTimeout', 'clearInterval',
  'clearImmediate', 'queueMicrotask', 'performance', 'AbortController',
  'AbortSignal', 'URL', 'URLSearchParams', 'TextEncoder', 'TextDecoder',
  'fetch', 'crypto', 'navigator', 'Event', 'EventTarget', 'CustomEvent',
  'ReadableStream', 'WritableStream', 'TransformStream',
  // TypeScript-specific
  'Promise', 'ArrayBuffer', 'DataView', 'Float32Array', 'Float64Array',
  'Int8Array', 'Int16Array', 'Int32Array', 'Uint8ClampedArray',
  'Uint16Array', 'Uint32Array', 'BigInt64Array', 'BigUint64Array',
])

export const noUseBeforeDefineRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const definedVars = new Set<string>()
    const usageReports: Array<{ name: string; node: unknown }> = []
    const propertyNames = new Set<string>()

    function collectPropertyNames(node: unknown): void {
      const n = toASTNode(node)
      if (!n) return
      const prop = (n as { property?: { name?: string } }).property
      if (prop && typeof prop.name === 'string' && !(n as { computed?: boolean }).computed) {
        propertyNames.add(prop.name)
      }
    }

    return {
      ImportDeclaration(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'ImportDeclaration') return
        const specifiers = (n as { specifiers?: unknown[] }).specifiers
        if (!Array.isArray(specifiers)) return
        for (const spec of specifiers) {
          const specNode = toASTNode(spec)
          if (!specNode) continue
          const local = (specNode as { local?: { name?: string } }).local
          if (local && typeof local.name === 'string') {
            definedVars.add(local.name)
          }
        }
      },

      FunctionDeclaration(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'FunctionDeclaration') return
        const id = (n as { id?: { name?: string } }).id
        if (id && typeof id.name === 'string') {
          definedVars.add(id.name)
        }
      },

      ClassDeclaration(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'ClassDeclaration') return
        const id = (n as { id?: { name?: string } }).id
        if (id && typeof id.name === 'string') {
          definedVars.add(id.name)
        }
      },

      VariableDeclarator(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'VariableDeclarator') return

        const id = (n as { id?: unknown }).id
        if (!id || typeof id !== 'object') return

        const idNode = id as Record<string, unknown>
        if (idNode.type === 'Identifier' && typeof idNode.name === 'string') {
          definedVars.add(idNode.name as string)
        }
      },

      MemberExpression(node: unknown): void {
        collectPropertyNames(node)
      },

      OptionalMemberExpression(node: unknown): void {
        collectPropertyNames(node)
      },

      Property(node: unknown): void {
        collectPropertyNames(node)
      },

      Identifier(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'Identifier') return

        const name = (n as { name?: unknown }).name
        if (typeof name !== 'string') return

        if (BUILTIN_GLOBALS.has(name)) return
        if (!definedVars.has(name)) {
          usageReports.push({ name, node: n })
        }
      },

      'Program:exit'(): void {
        for (const usage of usageReports) {
          if (definedVars.has(usage.name)) continue
          if (BUILTIN_GLOBALS.has(usage.name)) continue
          if (propertyNames.has(usage.name)) continue

          context.report({
            loc: extractLocation(toASTNode(usage.node)),
            message: `'${usage.name}' was used before it was defined.`,
            node: toASTNode(usage.node),
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow use of variables before they are defined',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-use-before-define',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUseBeforeDefineRule
