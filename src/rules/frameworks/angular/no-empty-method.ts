import { Node } from 'ts-morph'

import type { RuleViolation, VisitorContext } from '../../../ast/visitor.js'
import type { RuleDefinition, RuleOptions } from '../../types.js'

import { getNodeRange } from '../../../ast/visitor.js'

interface NoEmptyMethodOptions extends RuleOptions {}

const LIFECYCLE_METHODS = new Set([
  'ngOnInit',
  'ngOnChanges',
  'ngDoCheck',
  'ngAfterContentInit',
  'ngAfterContentChecked',
  'ngAfterViewInit',
  'ngAfterViewChecked',
  'ngOnDestroy',
])

export const noEmptyMethodRule: RuleDefinition<NoEmptyMethodOptions> = {
  create(_options: NoEmptyMethodOptions) {
    const violations: RuleViolation[] = []

    return {
      onComplete() {
        return violations
      },
      visitor: {
        visitNode(node: Node, _context: VisitorContext) {
          if (Node.isMethodDeclaration(node)) {
            const nameNode = node.getNameNode()
            if (!nameNode) return
            const name = nameNode.getText()
            if (!LIFECYCLE_METHODS.has(name)) return

            const body = node.getBody()
            if (!body) return

            if (Node.isBlock(body)) {
              const statements = body.getStatements()
              if (statements.length === 0) {
                const range = getNodeRange(node)
                violations.push({
                  filePath: node.getSourceFile().getFilePath(),
                  message: `Empty lifecycle method '${name}' detected.`,
                  range,
                  ruleId: 'angular/no-empty-method',
                  severity: 'warning',
                  suggestion: `Remove empty lifecycle method '${name}' or add implementation.`,
                })
              }
            }
          }
        },
      },
    }
  },
  defaultOptions: {},
  meta: {
    category: 'patterns',
    description: 'Detects empty Angular lifecycle methods',
    name: 'angular/no-empty-method',
    recommended: true,
    severity: 'warning',
  },
}

export default noEmptyMethodRule
