/**
 * @fileoverview Require const declarations for variables that are never reassigned
 * @module rules/patterns/prefer-const
 */

import type {
  RuleDefinition,
  RuleContext,
  RuleVisitor,
  SourceLocation,
} from '../../plugins/types.js'
import { extractLocation, getRange } from '../../utils/ast-helpers.js'

interface VariableInfo {
  readonly name: string
  readonly declaredWith: 'let' | 'var' | 'const'
  readonly location: SourceLocation
  readonly reassigned: boolean
  readonly scope: string
  readonly declarationNode: unknown
}

interface PreferConstOptions {
  readonly destructuring?: 'all' | 'any'
  readonly ignoreReadBeforeAssign?: boolean
  readonly ignoreDestructuring?: boolean
}

function getVariableKind(node: unknown): 'let' | 'var' | 'const' | null {
  if (!node || typeof node !== 'object') {
    return null
  }

  const n = node as Record<string, unknown>

  if (n.type !== 'VariableDeclaration') {
    return null
  }

  const kind = n.kind
  if (kind === 'let' || kind === 'var' || kind === 'const') {
    return kind
  }

  return null
}

function getDeclarationNames(node: unknown): string[] {
  if (!node || typeof node !== 'object') {
    return []
  }

  const n = node as Record<string, unknown>
  const names: string[] = []

  if (n.type === 'VariableDeclaration' && Array.isArray(n.declarations)) {
    for (const decl of n.declarations) {
      const declNode = decl as Record<string, unknown>
      if (declNode.id) {
        const idNode = declNode.id as Record<string, unknown>
        if (idNode.type === 'Identifier' && typeof idNode.name === 'string') {
          names.push(idNode.name)
        } else if (idNode.type === 'ObjectPattern' || idNode.type === 'ArrayPattern') {
          // Destructuring - extract all names
          extractDestructuredNames(idNode, names)
        }
      }
    }
  }

  return names
}

function extractDestructuredNames(node: unknown, names: string[]): void {
  if (!node || typeof node !== 'object') {
    return
  }

  const n = node as Record<string, unknown>

  if (n.type === 'Identifier' && typeof n.name === 'string') {
    names.push(n.name)
    return
  }

  if (n.type === 'ObjectPattern' && Array.isArray(n.properties)) {
    for (const prop of n.properties) {
      const propNode = prop as Record<string, unknown>
      if (propNode.type === 'Property' && propNode.value) {
        extractDestructuredNames(propNode.value, names)
      } else if (propNode.type === 'RestElement' && propNode.argument) {
        extractDestructuredNames(propNode.argument, names)
      }
    }
  }

  if (n.type === 'ArrayPattern' && Array.isArray(n.elements)) {
    for (const elem of n.elements) {
      if (elem) {
        extractDestructuredNames(elem, names)
      }
    }
  }

  if (n.type === 'AssignmentPattern' && n.left) {
    extractDestructuredNames(n.left, names)
  }

  if (n.type === 'RestElement' && n.argument) {
    extractDestructuredNames(n.argument, names)
  }
}

export const preferConstRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Require const declarations for variables that are never reassigned. Using const makes code more predictable and signals intent more clearly.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/prefer-const',
    },
    schema: [
      {
        type: 'object',
        properties: {
          destructuring: {
            type: 'string',
            enum: ['all', 'any'],
            default: 'any',
          },
          ignoreReadBeforeAssign: {
            type: 'boolean',
            default: false,
          },
          ignoreDestructuring: {
            type: 'boolean',
            default: false,
          },
        },
        additionalProperties: false,
      },
    ],
    fixable: 'code',
  },

  create(context: RuleContext): RuleVisitor {
    const rawOptions = context.config.options
    const options: PreferConstOptions = (
      Array.isArray(rawOptions) && rawOptions.length > 0 ? rawOptions[0] : {}
    ) as PreferConstOptions

    const variableMap = new Map<string, VariableInfo>()
    const reassignments = new Set<string>()

    return {
      VariableDeclaration(node: unknown): void {
        const kind = getVariableKind(node)
        if (!kind || kind === 'const') {
          return
        }

        const names = getDeclarationNames(node)
        const location = extractLocation(node)

        for (const name of names) {
          variableMap.set(name, {
            name,
            declaredWith: kind,
            location,
            reassigned: false,
            scope: 'block',
            declarationNode: node,
          })
        }
      },

      AssignmentExpression(node: unknown): void {
        if (!node || typeof node !== 'object') {
          return
        }

        const n = node as Record<string, unknown>
        const left = n.left as Record<string, unknown> | undefined

        if (left?.type === 'Identifier' && typeof left.name === 'string') {
          reassignments.add(left.name)
        }
      },

      UpdateExpression(node: unknown): void {
        if (!node || typeof node !== 'object') {
          return
        }

        const n = node as Record<string, unknown>
        const arg = n.argument as Record<string, unknown> | undefined

        if (arg?.type === 'Identifier' && typeof arg.name === 'string') {
          reassignments.add(arg.name)
        }
      },

      'Program:exit'(): void {
        for (const [name, info] of variableMap) {
          if (!reassignments.has(name)) {
            const source = context.getSource()
            if (
              options.ignoreDestructuring &&
              (source.includes(`{ ${name} }`) || source.includes(`[${name}]`))
            ) {
              continue
            }

            const range = getRange(info.declarationNode)
            const fix =
              range !== null
                ? {
                    range: [range[0], range[0] + info.declaredWith.length] as [number, number],
                    text: 'const',
                  }
                : undefined

            context.report({
              message: `'${name}' is never reassigned. Use 'const' instead.`,
              loc: info.location,
              fix,
            })
          }
        }
      },
    }
  },
}

export default preferConstRule
