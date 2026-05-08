import { Node } from 'ts-morph'

import type { RuleViolation, VisitorContext } from '../../../ast/visitor.js'
import type { RuleDefinition, RuleOptions } from '../../types.js'

import { getNodeRange } from '../../../ast/visitor.js'

interface NoReactiveAssignmentsOptions extends RuleOptions {}

export const noReactiveAssignmentsRule: RuleDefinition<NoReactiveAssignmentsOptions> = {
  create(_options: NoReactiveAssignmentsOptions) {
    const violations: RuleViolation[] = []

    return {
      onComplete() {
        return violations
      },
      visitor: {
        visitNode(node: Node, _context: VisitorContext) {
          if (Node.isLabeledStatement(node)) {
            const label = node.getLabel()
            if (label.getText() !== '$') return

            const statement = node.getStatement()
            if (!Node.isExpressionStatement(statement)) return

            const expr = statement.getExpression()
            if (!Node.isBinaryExpression(expr)) return

            const operator = expr.getOperatorToken().getText()
            if (operator !== '=' && operator !== '+=' && operator !== '-=') return

            const left = expr.getLeft()
            const right = expr.getRight()

            if (!Node.isIdentifier(left)) return

            const leftName = left.getText()
            const rightText = right.getText()

            const rightIdentifiers = new Set<string>()
            if (Node.isIdentifier(right)) {
              rightIdentifiers.add(right.getText())
            }
            const collectIdentifiers = (n: Node) => {
              if (Node.isIdentifier(n)) {
                rightIdentifiers.add(n.getText())
              }
              n.forEachChild(collectIdentifiers)
            }
            right.forEachChild(collectIdentifiers)

            if (rightIdentifiers.has(leftName) || rightText.includes(`$${leftName}`)) {
              const range = getNodeRange(node)
              violations.push({
                filePath: node.getSourceFile().getFilePath(),
                message: `Reactive assignment '${leftName}' depends on itself, which may cause an infinite loop.`,
                range,
                ruleId: 'svelte/no-reactive-assignments',
                severity: 'error',
                suggestion: `Avoid self-referencing reactive assignments. Use a different variable name or restructure the logic.`,
              })
            }
          }
        },
      },
    }
  },
  defaultOptions: {},
  meta: {
    category: 'correctness',
    description: 'Detects reactive reassignments that may cause infinite loops',
    name: 'svelte/no-reactive-assignments',
    recommended: true,
    severity: 'error',
  },
}

export default noReactiveAssignmentsRule
