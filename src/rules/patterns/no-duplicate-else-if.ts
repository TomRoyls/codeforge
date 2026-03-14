import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

function serializeCondition(node: unknown): string {
  if (!node || typeof node !== 'object') {
    return String(node)
  }

  const n = node as Record<string, unknown>

  if (n === null) {
    return 'null'
  }

  const type = n.type

  if (type === 'Identifier') {
    return `Identifier(${n.name})`
  }

  if (
    type === 'Literal' ||
    type === 'BooleanLiteral' ||
    type === 'NumericLiteral' ||
    type === 'StringLiteral'
  ) {
    return `Literal(${String(n.value)})`
  }

  if (type === 'BinaryExpression' || type === 'LogicalExpression') {
    const left = serializeCondition(n.left)
    const right = serializeCondition(n.right)
    return `${type}(${n.operator},${left},${right})`
  }

  if (type === 'UnaryExpression') {
    const argument = serializeCondition(n.argument)
    return `UnaryExpression(${n.operator},${argument})`
  }

  if (type === 'MemberExpression') {
    const object = serializeCondition(n.object)
    const property = serializeCondition(n.property)
    const computed = n.computed ? 'true' : 'false'
    return `MemberExpression(${object},${property},${computed})`
  }

  if (type === 'CallExpression') {
    const callee = serializeCondition(n.callee)
    const args = Array.isArray(n.arguments)
      ? n.arguments.map((arg: unknown) => serializeCondition(arg)).join(',')
      : ''
    return `CallExpression(${callee},[${args}])`
  }

  if (type === 'ConditionalExpression') {
    const test = serializeCondition(n.test)
    const consequent = serializeCondition(n.consequent)
    const alternate = serializeCondition(n.alternate)
    return `ConditionalExpression(${test},${consequent},${alternate})`
  }

  const parts: string[] = []
  for (const key of Object.keys(n)) {
    if (key !== 'loc' && key !== 'range' && key !== 'start' && key !== 'end') {
      parts.push(`${key}:${serializeCondition(n[key])}`)
    }
  }
  return `{${parts.join(',')}}`
}

function collectConditions(node: unknown): Array<{ condition: string; node: unknown }> {
  const conditions: Array<{ condition: string; node: unknown }> = []

  function traverse(currentNode: unknown): void {
    if (!currentNode || typeof currentNode !== 'object') {
      return
    }

    const n = currentNode as Record<string, unknown>

    if (n.type !== 'IfStatement') {
      return
    }

    const test = n.test
    if (test) {
      conditions.push({
        condition: serializeCondition(test),
        node: currentNode,
      })
    }

    const alternate = n.alternate
    if (alternate && typeof alternate === 'object') {
      const alt = alternate as Record<string, unknown>
      if (alt.type === 'IfStatement') {
        traverse(alternate)
      }
    }
  }

  traverse(node)
  return conditions
}

function isChainRoot(node: unknown, allIfStatements: Set<unknown>): boolean {
  for (const otherNode of allIfStatements) {
    if (otherNode === node) continue
    if (!otherNode || typeof otherNode !== 'object') continue

    const n = otherNode as Record<string, unknown>
    if (n.type === 'IfStatement' && n.alternate === node) {
      return false
    }
  }
  return true
}

export const noDuplicateElseIfRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description:
        'Disallow duplicate conditions in if-else chains. Duplicate conditions in if-else chains are usually a bug as only the first matching branch will be executed.',
      category: 'logic',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-duplicate-else-if',
    },
    schema: [],
    fixable: undefined,
  },

  create(context: RuleContext): RuleVisitor {
    const seenIfStatements = new Set<unknown>()
    const processedChains = new Set<unknown>()

    return {
      IfStatement(node: unknown): void {
        if (!node || typeof node !== 'object') {
          return
        }

        const n = node as Record<string, unknown>
        if (n.type !== 'IfStatement') {
          return
        }

        seenIfStatements.add(node)
      },

      'Program:exit'(): void {
        processedChains.clear()

        for (const ifNode of seenIfStatements) {
          if (!ifNode || typeof ifNode !== 'object') continue

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
                message: `Duplicate condition in if-else chain. This condition was already checked at line ${firstLocation.start.line}.`,
                loc: location,
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
}

export default noDuplicateElseIfRule
