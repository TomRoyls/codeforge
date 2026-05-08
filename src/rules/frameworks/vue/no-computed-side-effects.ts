import { Node, SyntaxKind } from 'ts-morph'

import type { RuleViolation, VisitorContext } from '../../../ast/visitor.js'
import type { RuleDefinition, RuleOptions } from '../../types.js'

import { getNodeRange } from '../../../ast/visitor.js'

interface NoComputedSideEffectsOptions extends RuleOptions {}

export const noComputedSideEffectsRule: RuleDefinition<NoComputedSideEffectsOptions> = {
  create(_options: NoComputedSideEffectsOptions) {
    const violations: RuleViolation[] = []

    return {
      onComplete() {
        return violations
      },
      visitor: {
        visitNode(node: Node, _context: VisitorContext) {
          if (!Node.isPropertyAssignment(node)) return
          if (node.getName() !== 'computed') return

          const initializer = node.getInitializer()
          if (!initializer) return

          if (Node.isObjectLiteralExpression(initializer)) {
            for (const prop of initializer.getProperties()) {
              if (Node.isPropertyAssignment(prop)) {
                const getter = prop.getInitializer()
                if (getter && (Node.isArrowFunction(getter) || Node.isFunctionExpression(getter))) {
                  checkForSideEffects(getter.getBody(), node)
                }
              }
              if (Node.isMethodDeclaration(prop)) {
                checkForSideEffects(prop.getBody()!, node)
              }
            }
          }
        },
      },
    }

    function checkForSideEffects(body: Node, _originalNode: Node): void {
      body.forEachDescendant((descendant) => {
        if (Node.isBinaryExpression(descendant)) {
          const op = descendant.getOperatorToken().getKind()
          if (
            op === SyntaxKind.EqualsToken ||
            op === SyntaxKind.PlusEqualsToken ||
            op === SyntaxKind.MinusEqualsToken ||
            op === SyntaxKind.AsteriskEqualsToken ||
            op === SyntaxKind.SlashEqualsToken
          ) {
            const range = getNodeRange(descendant)
            violations.push({
              filePath: descendant.getSourceFile().getFilePath(),
              message: 'Side effect detected in computed property. Computed properties should be pure.',
              range,
              ruleId: 'vue/no-computed-side-effects',
              severity: 'warning',
              suggestion: 'Move side effects to methods or watchers instead of computed properties.',
            })
          }
        }
      })
    }
  },
  defaultOptions: {},
  meta: {
    category: 'correctness',
    description: 'Detects side effects in Vue computed properties',
    name: 'vue/no-computed-side-effects',
    recommended: true,
    severity: 'warning',
  },
}

export default noComputedSideEffectsRule
