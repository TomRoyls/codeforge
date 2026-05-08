import { Node } from 'ts-morph'

import type { RuleViolation, VisitorContext } from '../../../ast/visitor.js'
import type { RuleDefinition, RuleOptions } from '../../types.js'

import { getNodeRange } from '../../../ast/visitor.js'

interface NoUnusedStateOptions extends RuleOptions {}

export const noUnusedStateRule: RuleDefinition<NoUnusedStateOptions> = {
  create(_options: NoUnusedStateOptions) {
    const violations: RuleViolation[] = []
    const stateVariables = new Map<string, { node: Node; kind: 'class' | 'hook' }>()
    const usedVariables = new Set<string>()

    return {
      onComplete() {
        for (const [name, { node }] of stateVariables) {
          if (usedVariables.has(name)) continue
          const range = getNodeRange(node)
          violations.push({
            filePath: node.getSourceFile().getFilePath(),
            message: `State variable '${name}' is declared but never read.`,
            range,
            ruleId: 'react/no-unused-state',
            severity: 'warning',
            suggestion: `Remove unused state variable '${name}' or use it in the component.`,
          })
        }
        return violations
      },
      visitor: {
        visitNode(node: Node, _context: VisitorContext) {
          if (Node.isCallExpression(node)) {
            const expression = node.getExpression()
            if (Node.isIdentifier(expression) && expression.getText() === 'useState') {
              const args = node.getArguments()
              if (args.length === 0) return
              const parent = node.getParent()
              if (Node.isVariableDeclaration(parent)) {
                const nameNode = parent.getNameNode()
                if (Node.isArrayBindingPattern(nameNode)) {
                  const elements = nameNode.getElements()
                  if (elements.length > 0) {
                    const first = elements[0]!
                    if (Node.isBindingElement(first)) {
                      const child = first.getNameNode()
                      if (Node.isIdentifier(child)) {
                        const stateName = child.getText()
                        stateVariables.set(stateName, { node: child, kind: 'hook' })
                      }
                    }
                  }
                }
              }
            }
          }

          if (Node.isPropertyAccessExpression(node)) {
            const obj = node.getExpression()
            const propName = node.getName()
            if (Node.isThisExpression(obj)) {
              const fullText = node.getText()
              if (fullText.startsWith('this.state.')) {
                usedVariables.add(propName)
              }
            }
          }

          if (Node.isIdentifier(node)) {
            const name = node.getText()
            if (stateVariables.has(name)) {
              const parent = node.getParent()
              if (!Node.isArrayBindingPattern(parent) && !Node.isBindingElement(parent)) {
                usedVariables.add(name)
              }
            }
          }
        },
      },
    }
  },
  defaultOptions: {},
  meta: {
    category: 'correctness',
    description: 'Detects unused React component state variables',
    name: 'react/no-unused-state',
    recommended: true,
    severity: 'warning',
  },
}

export default noUnusedStateRule
