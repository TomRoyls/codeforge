/**
 * @file Require const declarations for variables that are never reassigned
 * @module rules/patterns/prefer-const
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
  SourceLocation,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { getRange } from '../../utils/ast-helpers.js'
import { extractRuleOptions } from '../../utils/options-helpers.js'
import { RULE_SUGGESTIONS } from '../../utils/suggestions.js'

interface VariableInfo {
  readonly declarationNode: unknown
  readonly declaredWith: 'const' | 'let' | 'var'
  readonly location: SourceLocation
  readonly name: string
  readonly reassigned: boolean
  readonly scope: string
}

interface PreferConstOptions {
  readonly destructuring?: 'all' | 'any'
  readonly ignoreDestructuring?: boolean
  readonly ignoreReadBeforeAssign?: boolean
}

function getVariableKind(node: unknown): 'const' | 'let' | 'var' | null {
  if (!node || typeof node !== 'object') {
    return null
  }

  const n = node as Record<string, unknown>

  if (n.type !== 'VariableDeclaration') {
    return null
  }

  const {kind} = n
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
  create(context: RuleContext): RuleVisitor {
    const options = extractRuleOptions<PreferConstOptions>(context.config.options, {
      destructuring: 'any',
      ignoreDestructuring: false,
      ignoreReadBeforeAssign: false,
    })

    const variableMap = new Map<string, VariableInfo>()
    const reassignments = new Set<string>()

    return {
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
              range === null
                ? undefined
                : {
                    range: [range[0], range[0] + info.declaredWith.length] as [number, number],
                    text: 'const',
                  }

            context.report({
              fix,
              loc: info.location,
              message: `'${name}' is never reassigned. Use 'const' instead. ${RULE_SUGGESTIONS.preferConst}`,
            })
          }
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

      VariableDeclaration(node: unknown): void {
        const kind = getVariableKind(node)
        if (!kind || kind === 'const') {
          return
        }

        const names = getDeclarationNames(node)
        const location = extractLocation(node)

        for (const name of names) {
          variableMap.set(name, {
            declarationNode: node,
            declaredWith: kind,
            location,
            name,
            reassigned: false,
            scope: 'block',
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Require const declarations for variables that are never reassigned. Using const makes code more predictable and signals intent more clearly.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/prefer-const',
    },
    fixable: 'code',
    schema: [
      {
        additionalProperties: false,
        properties: {
          destructuring: {
            default: 'any',
            enum: ['all', 'any'],
            type: 'string',
          },
          ignoreDestructuring: {
            default: false,
            type: 'boolean',
          },
          ignoreReadBeforeAssign: {
            default: false,
            type: 'boolean',
          },
        },
        type: 'object',
      },
    ],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default preferConstRule
