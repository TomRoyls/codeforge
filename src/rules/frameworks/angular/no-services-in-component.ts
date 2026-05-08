import { Node } from 'ts-morph'

import type { RuleViolation, VisitorContext } from '../../../ast/visitor.js'
import type { RuleDefinition, RuleOptions } from '../../types.js'

import { getNodeRange } from '../../../ast/visitor.js'

interface NoServicesInComponentOptions extends RuleOptions {
  max?: number
}

export const noServicesInComponentRule: RuleDefinition<NoServicesInComponentOptions> = {
  create(options: NoServicesInComponentOptions) {
    const violations: RuleViolation[] = []
    const maxServices = options.max ?? 5

    return {
      onComplete() {
        return violations
      },
      visitor: {
        visitNode(node: Node, _context: VisitorContext) {
          if (Node.isConstructorDeclaration(node)) {
            const parameters = node.getParameters()
            if (parameters.length > maxServices) {
              const range = getNodeRange(node)
              violations.push({
                filePath: node.getSourceFile().getFilePath(),
                message: `Component constructor has ${parameters.length} service injections, exceeding the maximum of ${maxServices}.`,
                range,
                ruleId: 'angular/no-services-in-component',
                severity: 'warning',
                suggestion: `Consider refactoring to reduce the number of injected services. Extract services into a facade or use composition.`,
              })
            }
          }
        },
      },
    }
  },
  defaultOptions: { max: 5 },
  meta: {
    category: 'complexity',
    description: 'Detects components with too many service injections in the constructor',
    name: 'angular/no-services-in-component',
    recommended: true,
    severity: 'warning',
  },
}

export default noServicesInComponentRule
