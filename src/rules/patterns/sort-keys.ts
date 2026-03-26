import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'
import { extractRuleOptions } from '../../utils/options-helpers.js'
function naturalStringCompare(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true })
}

interface SortKeysOptions {
  natural?: boolean
  minKeys?: number
}

const DEFAULT_OPTIONS: SortKeysOptions = {
  natural: true,
  minKeys: 2,
}

function getPropertyKey(property: unknown): string | null {
  if (!property || typeof property !== 'object') {
    return null
  }

  const p = property as Record<string, unknown>
  if (p.type !== 'Property') {
    return null
  }

  const key = p.key as Record<string, unknown> | undefined
  if (!key) {
    return null
  }

  if (key.type === 'Identifier') {
    return key.name as string
  }
  if (key.type === 'Literal' && typeof key.value === 'string') {
    return key.value
  }
  return null
}

function isSorted(keys: string[], natural: boolean): boolean {
  for (let i = 1; i < keys.length; i++) {
    const prev = keys[i - 1]
    const curr = keys[i]
    if (!prev || !curr) continue

    const comparison = natural ? naturalStringCompare(prev, curr) : prev.localeCompare(curr)

    if (comparison > 0) {
      return false
    }
  }
  return true
}

export const sortKeysRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Enforce alphabetical sorting of object literal keys for better readability and consistency.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/sort-keys',
    },
    schema: [
      {
        type: 'object',
        properties: {
          natural: {
            type: 'boolean',
          },
          minKeys: {
            type: 'number',
            minimum: 2,
          },
        },
        additionalProperties: false,
      },
    ],
    fixable: undefined,
  },

  create(context: RuleContext): RuleVisitor {
    const options = extractRuleOptions<SortKeysOptions>(context.config.options, DEFAULT_OPTIONS)

    return {
      ObjectExpression(node: unknown): void {
        if (!node || typeof node !== 'object') {
          return
        }

        const n = node as Record<string, unknown>
        if (n.type !== 'ObjectExpression') {
          return
        }

        const properties = n.properties as unknown[]
        if (!Array.isArray(properties) || properties.length < (options.minKeys ?? 2)) {
          return
        }

        const keys: string[] = []
        const keyPropertyMap = new Map<string, unknown>()

        for (const prop of properties) {
          const key = getPropertyKey(prop)
          if (key) {
            keys.push(key)
            keyPropertyMap.set(key, prop)
          }
        }

        if (keys.length < (options.minKeys ?? 1)) {
          return
        }

        if (!isSorted(keys, options.natural ?? true)) {
          const firstKey = keys[0]
          if (firstKey) {
            const firstUnsortedProperty = keyPropertyMap.get(firstKey)
            if (firstUnsortedProperty) {
              const location = extractLocation(firstUnsortedProperty)
              const expectedOrder = [...keys]
                .sort(
                  options.natural
                    ? (a, b) => naturalStringCompare(a, b)
                    : (a, b) => a.localeCompare(b),
                )
                .join(', ')

              context.report({
                message: `Object keys should be sorted in ${options.natural ? 'natural ' : ''}alphabetical order. Expected order: ${expectedOrder}`,
                loc: location,
              })
            }
          }
        }
      },
    }
  },
}

export default sortKeysRule
