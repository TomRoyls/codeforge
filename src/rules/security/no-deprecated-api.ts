/**
 * @file Disallow use of deprecated APIs
 * @module rules/security/no-deprecated-api
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
  SourceLocation,
} from '../../plugins/types.js'

import { extractRuleOptions } from '../../utils/options-helpers.js'

interface DeprecatedApiInfo {
  readonly name: string
  readonly reason: string
  readonly replacement?: string
  readonly since?: string
}

interface DeprecatedApiCall {
  readonly api: DeprecatedApiInfo
  readonly location: SourceLocation
}

interface NoDeprecatedApiOptions {
  readonly additionalApis?: readonly DeprecatedApiInfo[]
  readonly ignoreApis?: readonly string[]
}

const DEPRECATED_APIS: Map<string, DeprecatedApiInfo> = new Map([
  [
    '__defineGetter__',
    { name: '__defineGetter__', reason: 'Deprecated', replacement: 'Object.defineProperty' },
  ],
  [
    '__defineSetter__',
    { name: '__defineSetter__', reason: 'Deprecated', replacement: 'Object.defineProperty' },
  ],
  [
    '__lookupGetter__',
    {
      name: '__lookupGetter__',
      reason: 'Deprecated',
      replacement: 'Object.getOwnPropertyDescriptor',
    },
  ],
  [
    '__lookupSetter__',
    {
      name: '__lookupSetter__',
      reason: 'Deprecated',
      replacement: 'Object.getOwnPropertyDescriptor',
    },
  ],
  [
    '__proto__',
    {
      name: '__proto__',
      reason: 'Deprecated',
      replacement: 'Object.getPrototypeOf / Object.setPrototypeOf',
    },
  ],
  [
    'Array.prototype.buffer',
    { name: 'Array.prototype.buffer', reason: 'Non-standard', replacement: 'TypedArrays' },
  ],
  [
    'Buffer',
    {
      name: 'Buffer()',
      reason: 'Deprecated in favor of Buffer.alloc() and Buffer.from()',
      since: 'Node.js 6',
    },
  ],
  ['compile', { name: 'compile', reason: 'Deprecated', since: 'ES2015' }],
  [
    'Date.prototype.getYear',
    {
      name: 'Date.prototype.getYear',
      reason: 'Deprecated',
      replacement: 'Date.prototype.getFullYear',
    },
  ],
  [
    'Date.prototype.setYear',
    {
      name: 'Date.prototype.setYear',
      reason: 'Deprecated',
      replacement: 'Date.prototype.setFullYear',
    },
  ],
  [
    'Date.prototype.toGMTString',
    {
      name: 'Date.prototype.toGMTString',
      reason: 'Deprecated',
      replacement: 'Date.prototype.toUTCString',
    },
  ],
  [
    'escape',
    { name: 'escape', reason: 'Deprecated in ECMAScript v3', replacement: 'encodeURIComponent' },
  ],
  ['getYear', { name: 'getYear', reason: 'Deprecated', replacement: 'getFullYear' }],
  [
    'Object.prototype.__defineGetter__',
    {
      name: 'Object.prototype.__defineGetter__',
      reason: 'Deprecated',
      replacement: 'Object.defineProperty',
    },
  ],
  [
    'Object.prototype.__defineSetter__',
    {
      name: 'Object.prototype.__defineSetter__',
      reason: 'Deprecated',
      replacement: 'Object.defineProperty',
    },
  ],
  [
    'Object.prototype.__lookupGetter__',
    {
      name: 'Object.prototype.__lookupGetter__',
      reason: 'Deprecated',
      replacement: 'Object.getOwnPropertyDescriptor',
    },
  ],
  [
    'Object.prototype.__lookupSetter__',
    {
      name: 'Object.prototype.__lookupSetter__',
      reason: 'Deprecated',
      replacement: 'Object.getOwnPropertyDescriptor',
    },
  ],
  [
    'Object.prototype.__proto__',
    {
      name: 'Object.prototype.__proto__',
      reason: 'Deprecated',
      replacement: 'Object.getPrototypeOf / Object.setPrototypeOf',
    },
  ],
  [
    'RegExp.prototype.compile',
    { name: 'RegExp.prototype.compile', reason: 'Deprecated', since: 'ES2015' },
  ],
  ['setYear', { name: 'setYear', reason: 'Deprecated', replacement: 'setFullYear' }],
  [
    'String.prototype.substr',
    {
      name: 'String.prototype.substr',
      reason: 'Considered legacy',
      replacement: 'String.prototype.substring or String.prototype.slice',
    },
  ],
  ['substr', { name: 'substr', reason: 'Considered legacy', replacement: 'substring or slice' }],
  ['toGMTString', { name: 'toGMTString', reason: 'Deprecated', replacement: 'toUTCString' }],
  [
    'unescape',
    { name: 'unescape', reason: 'Deprecated in ECMAScript v3', replacement: 'decodeURIComponent' },
  ],
])

function extractLocation(node: unknown): SourceLocation {
  const defaultLoc: SourceLocation = {
    end: { column: 1, line: 1 },
    start: { column: 0, line: 1 },
  }

  if (!node || typeof node !== 'object') {
    return defaultLoc
  }

  const n = node as Record<string, unknown>
  const loc = n.loc as Record<string, unknown> | undefined

  if (!loc) {
    return defaultLoc
  }

  const start = loc.start as Record<string, unknown> | undefined
  const end = loc.end as Record<string, unknown> | undefined

  return {
    end: {
      column: typeof end?.column === 'number' ? end.column : 0,
      line: typeof end?.line === 'number' ? end.line : 1,
    },
    start: {
      column: typeof start?.column === 'number' ? start.column : 0,
      line: typeof start?.line === 'number' ? start.line : 1,
    },
  }
}

function isDeprecatedCall(
  node: unknown,
  apis: Map<string, DeprecatedApiInfo>,
  ignoreList: Set<string>,
): DeprecatedApiInfo | null {
  if (!node || typeof node !== 'object') {
    return null
  }

  const n = node as Record<string, unknown>

  // Check CallExpression
  if (n.type === 'CallExpression') {
    const callee = n.callee as Record<string, unknown> | undefined

    // Direct call: escape(), unescape(), Buffer()
    if (callee?.type === 'Identifier' && typeof callee.name === 'string') {
      const {name} = callee
      if (!ignoreList.has(name) && apis.has(name)) {
        return apis.get(name) ?? null
      }
    }

    // Member expression call: date.getYear(), str.substr()
    if (callee?.type === 'MemberExpression') {
      const property = callee.property as Record<string, unknown> | undefined
      if (property?.type === 'Identifier' && typeof property.name === 'string') {
        const methodName = property.name

        // Check for prototype method patterns
        const objectName = getObjectTypeName(callee.object)
        const fullKey = objectName ? `${objectName}.prototype.${methodName}` : null
        const simpleKey = `.${methodName}`

        if (!ignoreList.has(methodName) && !ignoreList.has(fullKey ?? '')) {
          if (fullKey && apis.has(fullKey)) {
            return apis.get(fullKey) ?? null
          }

          if (apis.has(simpleKey)) {
            return apis.get(simpleKey) ?? null
          }

          if (apis.has(methodName)) {
            return apis.get(methodName) ?? null
          }
        }
      }
    }
  }

  // Check NewExpression for Buffer
  if (n.type === 'NewExpression') {
    const callee = n.callee as Record<string, unknown> | undefined
    if (callee?.type === 'Identifier' && typeof callee.name === 'string') {
      const {name} = callee
      if (!ignoreList.has(name) && apis.has(name)) {
        return apis.get(name) ?? null
      }
    }
  }

  // Check property access for __proto__, __defineGetter__, etc.
  if (n.type === 'MemberExpression') {
    const property = n.property as Record<string, unknown> | undefined
    if (property?.type === 'Identifier' && typeof property.name === 'string') {
      const propName = property.name
      const fullKey = `Object.prototype.${propName}`

      if (!ignoreList.has(propName) && !ignoreList.has(fullKey) && apis.has(fullKey)) {
          return apis.get(fullKey) ?? null
        }
    }
  }

  return null
}

function getObjectTypeName(node: unknown): null | string {
  if (!node || typeof node !== 'object') {
    return null
  }

  const n = node as Record<string, unknown>

  if (n.type === 'Identifier' && typeof n.name === 'string') {
    return n.name
  }

  if (n.type === 'MemberExpression') {
    const obj = getObjectTypeName(n.object)
    const prop = (n.property as Record<string, unknown>)?.name
    if (obj && typeof prop === 'string') {
      return `${obj}.${prop}`
    }
  }

  return null
}

/**
 * Rule: no-deprecated-api
 * Disallows use of deprecated JavaScript and Node.js APIs
 */
export const noDeprecatedApiRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const options = extractRuleOptions<NoDeprecatedApiOptions>(context.config.options, {
      additionalApis: undefined,
      ignoreApis: [],
    })

    // Build combined APIs map
    const apis = new Map(DEPRECATED_APIS)
    if (options.additionalApis) {
      for (const api of options.additionalApis) {
        apis.set(api.name, api)
      }
    }

    const ignoreList = new Set(options.ignoreApis ?? [])

    const deprecatedCalls: DeprecatedApiCall[] = []

    return {
      CallExpression(node: unknown): void {
        const api = isDeprecatedCall(node, apis, ignoreList)
        if (api) {
          deprecatedCalls.push({
            api,
            location: extractLocation(node),
          })

          let message = `Deprecated API used: '${api.name}' is deprecated`
          if (api.reason) {
            message += ` - ${api.reason}`
          }

          if (api.replacement) {
            message += `. Use '${api.replacement}' instead.`
          }

          context.report({
            loc: extractLocation(node),
            message,
            node,
          })
        }
      },

      MemberExpression(node: unknown): void {
        const api = isDeprecatedCall(node, apis, ignoreList)
        if (api) {
          deprecatedCalls.push({
            api,
            location: extractLocation(node),
          })

          let message = `Deprecated API used: '${api.name}' is deprecated`
          if (api.reason) {
            message += ` - ${api.reason}`
          }

          if (api.replacement) {
            message += `. Use '${api.replacement}' instead.`
          }

          context.report({
            loc: extractLocation(node),
            message,
            node,
          })
        }
      },

      NewExpression(node: unknown): void {
        const api = isDeprecatedCall(node, apis, ignoreList)
        if (api) {
          deprecatedCalls.push({
            api,
            location: extractLocation(node),
          })

          let message = `Deprecated API used: '${api.name}' is deprecated`
          if (api.reason) {
            message += ` - ${api.reason}`
          }

          if (api.replacement) {
            message += `. Use '${api.replacement}' instead.`
          }

          context.report({
            loc: extractLocation(node),
            message,
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
        'Disallow the use of deprecated APIs. Using deprecated APIs may cause issues when upgrading runtime environments.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-deprecated-api',
    },
    fixable: 'code',
    schema: [
      {
        additionalProperties: false,
        properties: {
          additionalApis: {
            items: {
              properties: {
                name: { type: 'string' },
                reason: { type: 'string' },
                replacement: { type: 'string' },
                since: { type: 'string' },
              },
              required: ['name', 'reason'],
              type: 'object',
            },
            type: 'array',
          },
          ignoreApis: {
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

export default noDeprecatedApiRule
