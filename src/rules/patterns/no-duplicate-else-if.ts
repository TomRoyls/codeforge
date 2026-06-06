import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function serializeCondition(node: unknown, visited: Set<unknown> = new Set()): string {
  if (!node || typeof node !== 'object') {
    return String(node)
  }

  if (visited.has(node)) {
    return '[circular]'
  }

  visited.add(node)

  const n = toASTNode(node)
  if (!n) return 'null'

  const { type } = n

  if (type === 'Identifier') {
    return `Identifier(${n.name})`
  }

  if (
    type === 'Literal' ||
    type === 'BooleanLiteral'
  ) {
    return `Literal(${String(n.value)})`
  }

  if (type === 'BinaryExpression' || type === 'LogicalExpression') {
    const left = serializeCondition(n.left, visited)
    const right = serializeCondition(n.right, visited)
    return `${type}(${n.operator},${left},${right})`
  }

  if (type === 'UnaryExpression') {
    const argument = serializeCondition(n.argument, visited)
    return `UnaryExpression(${n.operator},${argument})`
  }

  if (type === 'MemberExpression') {
    const object = serializeCondition(n.object, visited)
    const property = serializeCondition(n.property, visited)
    const computed = n.computed ? 'true' : 'false'
    return `MemberExpression(${object},${property},${computed})`
  }

  if (type === 'CallExpression') {
    const callee = serializeCondition(n.callee, visited)
    const args = Array.isArray(n.arguments)
      ? n.arguments.map((arg: unknown) => serializeCondition(arg, visited)).join(',')
      : ''
    return `CallExpression(${callee},[${args}])`
  }

  if (type === 'ConditionalExpression') {
    const test = serializeCondition(n.test, visited)
    const consequent = serializeCondition(n.consequent, visited)
    const alternate = serializeCondition(n.alternate, visited)
    return `ConditionalExpression(${test},${consequent},${alternate})`
  }

  const parts: string[] = []
  for (const key of Object.keys(node as Record<string, unknown>)) {
    if (key !== 'loc' && key !== 'range' && key !== 'start' && key !== 'end' && key !== 'parent') {
      parts.push(`${key}:${serializeCondition((node as Record<string, unknown>)[key], visited)}`)
    }
  }

  return `{${parts.join(',')}}`
}

function collectConditions(node: unknown): Array<{ condition: string; node: unknown }> {
  const conditions: Array<{ condition: string; node: unknown }> = []

  function traverse(currentNode: unknown): void {
    const n = toASTNode(currentNode)
    if (!n || n.type !== 'IfStatement') return

    const { test } = n
    if (test) {
      conditions.push({
        condition: serializeCondition(test),
        node: currentNode,
      })
    }

    const alt = toASTNode(n.alternate)
    if (alt?.type === 'IfStatement') {
      traverse(n.alternate)
    }
  }

  traverse(node)
  return conditions
}

function isChainRoot(node: unknown, allIfStatements: Set<unknown>): boolean {
  for (const otherNode of allIfStatements) {
    if (otherNode === node) continue
    const n = toASTNode(otherNode)
    if (!n) continue

    if (n.type === 'IfStatement' && n.alternate === node) {
      return false
    }
  }

  return true
}

export const noDuplicateElseIfRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const seenIfStatements = new Set<unknown>()
    const processedChains = new Set<unknown>()

    return {
      IfStatement(node: unknown): void {
        const n = toASTNode(node)
        if (n?.type !== 'IfStatement') return
        seenIfStatements.add(node)
      },

      'Program:exit'(): void {
        processedChains.clear()

        for (const ifNode of seenIfStatements) {
          if (!isChainRoot(ifNode, seenIfStatements)) continue
          if (processedChains.has(ifNode)) continue

          const conditions = collectConditions(ifNode)
          const seenConditions = new Map<string, unknown>()

          for (const { condition, node: conditionNode } of conditions) {
            if (seenConditions.has(condition)) {
              const firstNode = seenConditions.get(condition)
              const location = extractLocation(conditionNode)
              const firstLocation = extractLocation(firstNode)

              context.report({
                loc: location,
                message: `Duplicate condition in if-else chain. This condition was already checked at line ${firstLocation.start.line}.`,
              })
            } else {
              seenConditions.set(condition, conditionNode)
            }
          }

          processedChains.add(ifNode)
        }

        seenIfStatements.clear()
      },
    }
  },

  meta: {
    docs: {
      category: 'logic',
      description:
        'Disallow duplicate conditions in if-else chains. Duplicate conditions in if-else chains are usually a bug as only the first matching branch will be executed.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-duplicate-else-if',
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}

export default noDuplicateElseIfRule
