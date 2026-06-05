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
  'Buffer', 'global', 'module', 'require', 'exports', '__dirname', '__filename',
  'setTimeout', 'setInterval', 'setImmediate', 'clearTimeout', 'clearInterval',
  'clearImmediate', 'queueMicrotask', 'performance', 'AbortController',
  'AbortSignal', 'URL', 'URLSearchParams', 'TextEncoder', 'TextDecoder',
  'fetch', 'crypto', 'navigator', 'Event', 'EventTarget', 'CustomEvent',
  'ReadableStream', 'WritableStream', 'TransformStream',
  'Promise', 'ArrayBuffer', 'DataView', 'Float32Array', 'Float64Array',
  'Int8Array', 'Int16Array', 'Int32Array', 'Uint8ClampedArray',
  'Uint16Array', 'Uint32Array', 'BigInt64Array', 'BigUint64Array',
  'Record', 'Partial', 'Required', 'Readonly', 'Pick', 'Omit',
  'Exclude', 'Extract', 'NonNullable', 'Parameters', 'ReturnType',
  'InstanceType', 'ConstructorParameters', 'Promise', 'Awaited',
  'ReadonlyArray', 'ReadonlyMap', 'ReadonlySet', 'Lowercase', 'Uppercase',
  'Capitalize', 'Uncapitalize', 'ThisType', 'PropertyKey', 'Awaited',
])

export const noUseBeforeDefineRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const definedVars = new Set<string>()
    const usageReports: Array<{ name: string; node: unknown }> = []
    const propertyNames = new Set<string>()

    function collectPropertyNames(node: unknown): void {
      const n = toASTNode(node)
      if (!n) return
      const computed = (n as { computed?: boolean }).computed
      if (computed) return
      const prop = (n as { property?: { name?: string } }).property
      if (prop && typeof prop.name === 'string') {
        propertyNames.add(prop.name)
      }
      const key = (n as { key?: { name?: string } }).key
      if (key && typeof key.name === 'string') {
        propertyNames.add(key.name)
      }
    }

    function extractParamName(p: unknown): string | undefined {
      const pn = toASTNode(p)
      if (!pn) return undefined
      // ESTree Identifier: { type: 'Identifier', name: 'x' }
      if (typeof pn.name === 'string') return pn.name
      // Parameter wrapping an Identifier: { type: 'Parameter', name: { type: 'Identifier', name: 'x' } }
      const inner = (pn as { name?: { name?: string } }).name
      if (inner && typeof inner.name === 'string') return inner.name
      // AssignmentPattern: { type: 'AssignmentPattern', left: { name: 'x' } }
      const left = (pn as { left?: { name?: string } }).left
      if (left && typeof left.name === 'string') return left.name
      // RestElement: { type: 'RestElement', argument: { name: 'x' } }
      const arg = (pn as { argument?: { name?: string } }).argument
      if (arg && typeof arg.name === 'string') return arg.name
      return undefined
    }

    function extractParamNamesDeep(p: unknown): string[] {
      const pn = toASTNode(p)
      if (!pn) return []
      const names: string[] = []
      const direct = extractParamName(p)
      if (direct) {
        names.push(direct)
        return names
      }
      // Parameter node: { name: ObjectBindingPattern | ArrayBindingPattern | Identifier }
      const pnName = (pn as { name?: unknown }).name
      if (pnName && typeof pnName === 'object') {
        const inner = extractParamName(pnName)
        if (inner) { names.push(inner); return names }
        const sub = extractParamNamesDeep(pnName)
        if (sub.length > 0) return sub
      }
      // ObjectPattern (ESTree): { properties: [{ key: { name }, value: { name } }] }
      // Adapter output: properties are BindingElement-shaped: [{ name: { name: 'x' } }]
      const props = (pn as { properties?: unknown[] }).properties
      if (Array.isArray(props)) {
        for (const prop of props) {
          const propNode = toASTNode(prop)
          if (!propNode) continue
          const val = (propNode as { value?: { name?: string } }).value
          if (val && typeof val.name === 'string') names.push(val.name)
          const key = (propNode as { key?: { name?: string } }).key
          if (key && typeof key.name === 'string' && !names.includes(key.name)) names.push(key.name)
          const restArg = (propNode as { argument?: { name?: string } }).argument
          if (restArg && typeof restArg.name === 'string') names.push(restArg.name)
          // Adapter BindingElement: { name: { type: 'Identifier', name: 'x' } }
          const propName = (propNode as { name?: { name?: string } | string }).name
          if (typeof propName === 'string' && !names.includes(propName)) names.push(propName)
          else if (propName && typeof propName === 'object' && typeof propName.name === 'string' && !names.includes(propName.name)) names.push(propName.name)
        }
      }
      // ObjectBindingPattern (ts-morph): { elements: [{ name: { name: 'x' } }] }
      const elements = (pn as { elements?: unknown[] }).elements
      if (Array.isArray(elements)) {
        for (const el of elements) {
          if (!el) continue
          const elNode = toASTNode(el)
          if (!elNode) continue
          // BindingElement: { name: { type: 'Identifier', name: 'x' } }
          const elName = (elNode as { name?: { name?: string } | string }).name
          if (elName && typeof elName === 'string') { names.push(elName); continue }
          if (elName && typeof elName === 'object' && typeof elName.name === 'string') { names.push(elName.name); continue }
          const sub = extractParamNamesDeep(el)
          names.push(...sub)
        }
      }
      return names
    }

    function collectParamNames(params: unknown[]): void {
      for (const p of params) {
        const names = extractParamNamesDeep(p)
        for (const name of names) definedVars.add(name)
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
        const params = (n as { params?: unknown[] }).params
        if (Array.isArray(params)) collectParamNames(params)
      },

      FunctionExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n) return
        const params = (n as { params?: unknown[] }).params
        if (Array.isArray(params)) collectParamNames(params)
      },

      ArrowFunctionExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n) return
        const params = (n as { params?: unknown[] }).params
        if (Array.isArray(params)) collectParamNames(params)
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

      MethodDefinition(node: unknown): void {
        collectPropertyNames(node)
      },

      PropertyDefinition(node: unknown): void {
        collectPropertyNames(node)
      },

      TSPropertySignature(node: unknown): void {
        collectPropertyNames(node)
      },

      TSMethodSignature(node: unknown): void {
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
