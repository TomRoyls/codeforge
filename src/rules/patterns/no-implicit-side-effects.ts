import { Node, SyntaxKind } from 'ts-morph'

import type { RuleDefinition, RuleOptions } from '../types.js'

import {
  type FunctionLikeNode,
  getNodeRange,
  type RuleViolation,
  type VisitorContext,
} from '../../ast/visitor.js'

export interface NoImplicitSideEffectsOptions extends RuleOptions {
  allowIn?: string[]
  checkPureNaming?: boolean
}

const PURE_QUERY_PREFIXES = ['get', 'is', 'has', 'should', 'can']

const IO_CALL_PATTERNS: Array<{
  check: (expr: Node) => boolean
  description: string
}> = [
  {
    check(expr: Node) {
      const text = expr.getText()
      return text.startsWith('process.exit')
    },
    description: 'process.exit()',
  },
  {
    check(expr: Node) {
      const text = expr.getText()
      return text.startsWith('process.stdout.write') || text.startsWith('process.stderr.write')
    },
    description: 'process.stdout/stderr.write()',
  },
]

function hasJSDocAnnotation(node: FunctionLikeNode, annotation: string): boolean {
  try {
    const parent = node.getParent()
    if (parent && Node.isVariableDeclaration(parent)) {
      const grandParent = parent.getParent()
      if (grandParent && Node.isVariableDeclarationList(grandParent)) {
        const greatGrandParent = grandParent.getParent()
        if (greatGrandParent && Node.isVariableStatement(greatGrandParent)) {
          const jsDocs = greatGrandParent.getJsDocs()
          for (const doc of jsDocs) {
            if (doc.getText().includes(`@${annotation}`)) {
              return true
            }
          }
        }
      }
    }

    if (Node.isFunctionDeclaration(node)) {
      const jsDocs = node.getJsDocs()
      for (const doc of jsDocs) {
        if (doc.getText().includes(`@${annotation}`)) {
          return true
        }
      }
    }

    if (Node.isMethodDeclaration(node)) {
      const jsDocs = node.getJsDocs()
      for (const doc of jsDocs) {
        if (doc.getText().includes(`@${annotation}`)) {
          return true
        }
      }
    }
  } catch {
    // JSDoc access can fail on some node types, ignore safely
  }

  return false
}

function getFunctionName(node: FunctionLikeNode): string {
  try {
    if (Node.isFunctionDeclaration(node) || Node.isFunctionExpression(node)) {
      return node.getName() ?? ''
    }

    if (Node.isMethodDeclaration(node)) {
      return node.getName()
    }

    if (Node.isGetAccessorDeclaration(node)) {
      return node.getName()
    }

    if (Node.isSetAccessorDeclaration(node)) {
      return node.getName()
    }

    if (Node.isConstructorDeclaration(node)) {
      return 'constructor'
    }

    if (Node.isArrowFunction(node)) {
      const parent = node.getParent()
      if (Node.isVariableDeclaration(parent)) {
        return parent.getName() ?? ''
      }
    }
  } catch {
    // ts-morph type guards may not work with non-standard nodes
  }

  const directGetName = (node as unknown as Record<string, unknown>).getName
  if (typeof directGetName === 'function') {
    const result = directGetName.call(node)
    if (typeof result === 'string' && result.length > 0) return result
  }

  return ''
}

function isAsyncFunction(node: FunctionLikeNode): boolean {
  try {
    if (node.getKind() === SyntaxKind.ArrowFunction) {
      return node.getText().startsWith('async')
    }

    const hasModifierFn = (node as unknown as Record<string, unknown>).hasModifier
    if (typeof hasModifierFn === 'function') {
      return hasModifierFn.call(node, SyntaxKind.AsyncKeyword) === true
    }

    return false
  } catch {
    return false
  }
}

function isGeneratorFunction(node: FunctionLikeNode): boolean {
  try {
    if (Node.isFunctionDeclaration(node) || Node.isFunctionExpression(node)) {
      const asteriskToken = node.getAsteriskToken()
      return asteriskToken !== undefined
    }
  } catch {
    // Ignore
  }

  return false
}

function hasReturnStatement(node: FunctionLikeNode): boolean {
  const returnStatements = node.getDescendantsOfKind(SyntaxKind.ReturnStatement)
  return returnStatements.length > 0
}

function isUppercaseStart(name: string): boolean {
  if (name.length === 0) return false
  const first = name[0]!
  return first === first.toUpperCase() && first !== first.toLowerCase()
}

function isPureQueryName(name: string): boolean {
  const lowerName = name.toLowerCase()
  return PURE_QUERY_PREFIXES.some((prefix) => lowerName.startsWith(prefix))
}

function getParameterNames(node: FunctionLikeNode): Set<string> {
  const paramNames = new Set<string>()
  try {
    const params = node.getParameters()
    for (const param of params) {
      const nameNode = param.getNameNode()
      if (Node.isIdentifier(nameNode)) {
        paramNames.add(nameNode.getText())
      } else if (Node.isObjectBindingPattern(nameNode) || Node.isArrayBindingPattern(nameNode)) {
        // Destructured params - extract binding names
        const elements = nameNode.getElements()
        for (const element of elements) {
          if (Node.isBindingElement(element)) {
            const elName = element.getNameNode()
            if (Node.isIdentifier(elName)) {
              paramNames.add(elName.getText())
            }
          }
        }
      }
    }
  } catch {
    // Parameter access can fail on some node types
  }

  return paramNames
}

function collectLocalDeclarations(node: FunctionLikeNode): Set<string> {
  const localNames = new Set<string>()
  const varStatements = node.getDescendantsOfKind(SyntaxKind.VariableDeclaration)
  for (const varDecl of varStatements) {
    const nameNode = varDecl.getNameNode()
    if (Node.isIdentifier(nameNode)) {
      localNames.add(nameNode.getText())
    }
  }

  const funcDecls = node.getDescendantsOfKind(SyntaxKind.FunctionDeclaration)
  for (const funcDecl of funcDecls) {
    const name = funcDecl.getName()
    if (name) {
      localNames.add(name)
    }
  }

  return localNames
}

function detectClosureMutations(
  node: FunctionLikeNode,
  context: VisitorContext,
  paramNames: Set<string>,
  localNames: Set<string>,
): RuleViolation[] {
  const violations: RuleViolation[] = []
  const filePath = context.getFilePath()

  const assignments = node.getDescendantsOfKind(SyntaxKind.BinaryExpression)
  for (const binary of assignments) {
    const operatorToken = binary.getOperatorToken()
    const operatorKind = operatorToken.getKind()
    if (operatorKind !== SyntaxKind.EqualsToken && operatorKind !== SyntaxKind.QuestionQuestionEqualsToken && operatorKind !== SyntaxKind.AmpersandAmpersandEqualsToken && operatorKind !== SyntaxKind.BarBarEqualsToken) {
      continue
    }

    const left = binary.getLeft()
    if (Node.isIdentifier(left)) {
      const name = left.getText()
      if (!paramNames.has(name) && !localNames.has(name)) {
        violations.push({
          filePath,
          message: `Function implicitly modifies outer variable '${name}'.`,
          range: getNodeRange(binary),
          ruleId: 'no-implicit-side-effects',
          severity: 'warning',
          suggestion: `Consider returning the new value instead of mutating '${name}', or annotate with @impure.`,
        })
      }
    } else if (Node.isPropertyAccessExpression(left)) {
      const rootExpr = getRootExpression(left)
      if (Node.isIdentifier(rootExpr)) {
        const name = rootExpr.getText()
        if (!paramNames.has(name) && !localNames.has(name)) {
          violations.push({
            filePath,
            message: `Function implicitly modifies outer variable '${name}' via property access.`,
            range: getNodeRange(binary),
            ruleId: 'no-implicit-side-effects',
            severity: 'warning',
            suggestion: `Consider returning the new value instead of mutating '${name}', or annotate with @impure.`,
          })
        }
      }
    }
  }

  // Check prefix/postfix unary operations on outer variables (++, --)
  const unaryExpressions = [
    ...node.getDescendantsOfKind(SyntaxKind.PrefixUnaryExpression),
    ...node.getDescendantsOfKind(SyntaxKind.PostfixUnaryExpression),
  ]

  for (const unary of unaryExpressions) {
    const operator = unary.getOperatorToken()
    if (operator !== SyntaxKind.PlusPlusToken && operator !== SyntaxKind.MinusMinusToken) {
      continue
    }

    const operand = unary.getOperand()
    if (Node.isIdentifier(operand)) {
      const name = operand.getText()
      if (!paramNames.has(name) && !localNames.has(name)) {
        violations.push({
          filePath,
          message: `Function implicitly modifies outer variable '${name}' via ${operator === SyntaxKind.PlusPlusToken ? 'increment' : 'decrement'} operator.`,
          range: getNodeRange(unary),
          ruleId: 'no-implicit-side-effects',
          severity: 'warning',
          suggestion: `Consider returning the new value instead of mutating '${name}'.`,
        })
      }
    }
  }

  return violations
}

function detectObjectArgumentMutations(
  node: FunctionLikeNode,
  context: VisitorContext,
  paramNames: Set<string>,
): RuleViolation[] {
  const violations: RuleViolation[] = []
  const filePath = context.getFilePath()

  if (paramNames.size === 0) return violations

  const assignments = node.getDescendantsOfKind(SyntaxKind.BinaryExpression)
  for (const binary of assignments) {
    const operatorToken = binary.getOperatorToken()
    const operatorKind = operatorToken.getKind()
    if (operatorKind !== SyntaxKind.EqualsToken) {
      continue
    }

    const left = binary.getLeft()
    if (Node.isPropertyAccessExpression(left)) {
      const rootExpr = getRootExpression(left)
      if (Node.isIdentifier(rootExpr)) {
        const name = rootExpr.getText()
        if (paramNames.has(name)) {
          violations.push({
            filePath,
            message: `Function mutates parameter '${name}' which is passed by reference.`,
            range: getNodeRange(binary),
            ruleId: 'no-implicit-side-effects',
            severity: 'warning',
            suggestion: `Consider creating a copy of '${name}' before modifying, or returning the modified value.`,
          })
        }
      }
    } else if (Node.isElementAccessExpression(left)) {
      const rootExpr = getRootExpression(left)
      if (Node.isIdentifier(rootExpr)) {
        const name = rootExpr.getText()
        if (paramNames.has(name)) {
          violations.push({
            filePath,
            message: `Function mutates parameter '${name}' via index access.`,
            range: getNodeRange(binary),
            ruleId: 'no-implicit-side-effects',
            severity: 'warning',
            suggestion: `Consider creating a copy of '${name}' before modifying.`,
          })
        }
      }
    }
  }

  // Detect .push(), .pop(), .shift(), .unshift(), .splice(), .sort(), .reverse() on parameter arrays
  const callExpressions = node.getDescendantsOfKind(SyntaxKind.CallExpression)
  const mutatingMethods = new Set(['copyWithin', 'fill', 'pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'])

  for (const callExpr of callExpressions) {
    const expr = callExpr.getExpression()
    if (Node.isPropertyAccessExpression(expr)) {
      const methodName = expr.getName()
      if (mutatingMethods.has(methodName)) {
        const obj = expr.getExpression()
        if (Node.isIdentifier(obj)) {
          const name = obj.getText()
          if (paramNames.has(name)) {
            violations.push({
              filePath,
              message: `Function mutates parameter '${name}' via '${methodName}()' call.`,
              range: getNodeRange(callExpr),
              ruleId: 'no-implicit-side-effects',
              severity: 'warning',
              suggestion: `Consider using a non-mutating alternative or creating a copy of '${name}'.`,
            })
          }
        }
      }
    }
  }

  return violations
}

function detectIOOperations(
  node: FunctionLikeNode,
  context: VisitorContext,
): RuleViolation[] {
  const violations: RuleViolation[] = []
  const filePath = context.getFilePath()

  const callExpressions = node.getDescendantsOfKind(SyntaxKind.CallExpression)
  for (const callExpr of callExpressions) {
    for (const pattern of IO_CALL_PATTERNS) {
      if (pattern.check(callExpr)) {
        violations.push({
          filePath,
          message: `Function performs I/O operation (${pattern.description}) without being explicitly impure.`,
          range: getNodeRange(callExpr),
          ruleId: 'no-implicit-side-effects',
          severity: 'warning',
          suggestion: 'Consider annotating this function with @impure or moving I/O to a dedicated module.',
        })
      }
    }

    // Detect fs operations
    const expr = callExpr.getExpression()
    if (Node.isPropertyAccessExpression(expr)) {
      const obj = expr.getExpression()
      if (Node.isIdentifier(obj)) {
        const objName = obj.getText()
        const methodName = expr.getName()
        if (objName === 'fs' || (objName.endsWith('Fs') && objName.length > 2)) {
          const fsWriteOps = new Set(['appendFile', 'copyFile', 'ftruncate', 'mkdir', 'rename', 'rmdir', 'truncate', 'unlink', 'write', 'writeFile'])
          if (fsWriteOps.has(methodName)) {
            violations.push({
              filePath,
              message: `Function performs filesystem write operation (fs.${methodName}()).`,
              range: getNodeRange(callExpr),
              ruleId: 'no-implicit-side-effects',
              severity: 'warning',
              suggestion: 'Consider annotating this function with @impure or moving I/O to a dedicated module.',
            })
          }
        }
      }
    }
  }

  return violations
}

function detectPureNamingViolations(
  node: FunctionLikeNode,
  context: VisitorContext,
): RuleViolation[] {
  const violations: RuleViolation[] = []
  const filePath = context.getFilePath()

  const throwStatements = node.getDescendantsOfKind(SyntaxKind.ThrowStatement)
  if (throwStatements.length === 0) return violations

  const throwNode = throwStatements[0]!
  violations.push({
    filePath,
    message: `Query function should be pure but throws errors.`,
    range: getNodeRange(throwNode),
    ruleId: 'no-implicit-side-effects',
    severity: 'warning',
    suggestion: 'Consider returning an error result instead of throwing, or rename the function to indicate it may throw.',
  })

  return violations
}

function getRootExpression(node: Node): Node {
  let current: Node = node
  while (true) {
    if (Node.isPropertyAccessExpression(current)) {
      current = current.getExpression()
    } else if (Node.isElementAccessExpression(current)) {
      current = current.getExpression()
    } else if (Node.isCallExpression(current)) {
      current = current.getExpression()
    } else {
      break
    }
  }

  return current
}

export const noImplicitSideEffectsRule: RuleDefinition<NoImplicitSideEffectsOptions> = {
  create(options: NoImplicitSideEffectsOptions) {
    const violations: RuleViolation[] = []
    const allowIn = new Set(options.allowIn ?? [])
    const checkPureNaming = options.checkPureNaming ?? true

    return {
      onComplete: () => violations,
      visitor: {
        visitFunction(node: FunctionLikeNode, context: VisitorContext) {
          // Skip constructors
          try {
            if (Node.isConstructorDeclaration(node)) return
          } catch {
            // ts-morph type guards may not work with mock nodes
          }

          if (node.getKind() === SyntaxKind.Constructor) return

          // Skip async functions
          if (isAsyncFunction(node)) return

          // Skip generator functions
          if (isGeneratorFunction(node)) return

          const funcName = getFunctionName(node)

          // Skip functions starting with uppercase (React components / class-like)
          if (funcName && isUppercaseStart(funcName)) return

          // Skip functions with @impure or @side-effect JSDoc annotations
          if (hasJSDocAnnotation(node, 'impure') || hasJSDocAnnotation(node, 'side-effect')) return

          // Skip if function name is in allowIn list
          if (funcName && allowIn.has(funcName)) return

          // Skip functions that explicitly return values
          if (hasReturnStatement(node)) return

          const paramNames = getParameterNames(node)
          const localNames = collectLocalDeclarations(node)

          const detected: RuleViolation[] = [
            ...detectClosureMutations(node, context, paramNames, localNames),
            ...detectObjectArgumentMutations(node, context, paramNames),
            ...detectIOOperations(node, context),
          ]

          if (checkPureNaming && funcName && isPureQueryName(funcName)) {
            detected.push(...detectPureNamingViolations(node, context))
          }

          violations.push(...detected)
        },
      },
    }
  },
  defaultOptions: {
    checkPureNaming: true,
  },
  meta: {
    category: 'patterns',
    description: 'Detect functions that cause implicit side effects by modifying external state without returning values or being clearly marked as impure',
    docs: {
      category: 'patterns',
      description: 'Detect functions that cause implicit side effects by modifying external state without returning values or being clearly marked as impure',
      recommended: false,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/src/rules/patterns/no-implicit-side-effects.ts',
      severity: 'warning',
    },
    name: 'no-implicit-side-effects',
    recommended: false,
    severity: 'warning',
  },
}

export function analyzeImplicitSideEffects(
  node: FunctionLikeNode,
  context: VisitorContext,
  options: NoImplicitSideEffectsOptions = {},
): RuleViolation[] {
  const rule = noImplicitSideEffectsRule.create(options)
  rule.visitor.visitFunction!(node, context)
  return rule.onComplete!()
}
