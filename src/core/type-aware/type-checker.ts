import type { SourceFile, Type } from 'ts-morph'
import { Node, SyntaxKind } from 'ts-morph'

import type {
  TypeAwareAnalysisResult,
  TypeCheckResult,
  TypeComplexityMetrics,
  TypeInferenceResult,
  TypeRelation,
  UnsafeTypeUsage,
} from './types.js'

function createEmptyTypeCheckResult(): TypeCheckResult {
  return {
    isAny: false,
    isArray: false,
    isBoolean: false,
    isEnum: false,
    isFunction: false,
    isGeneric: false,
    isIntersection: false,
    isLiteral: false,
    isNull: false,
    isNullable: false,
    isNumber: false,
    isObject: false,
    isPromise: false,
    isString: false,
    isUndefined: false,
    isUnion: false,
    typeName: 'unknown',
    typeString: 'unknown',
  }
}

export class TypeChecker {
  private getTypeInfo(type: Type, typeNodeText?: string): TypeCheckResult {
    const typeString = type.getText()
    const effectiveText = typeString === '{}' && typeNodeText ? typeNodeText : typeString
    const isArrayResult = type.isArray() || effectiveText.endsWith('[]') || effectiveText.startsWith('Array<')
    const isPromiseResult = effectiveText.startsWith('Promise<')
    const isFunctionResult = type.getCallSignatures().length > 0
    const result: TypeCheckResult = {
      isAny: type.isAny(),
      isArray: isArrayResult,
      isBoolean: type.isBoolean(),
      isEnum: type.isEnum(),
      isFunction: isFunctionResult,
      isGeneric: type.isTypeParameter(),
      isIntersection: type.isIntersection(),
      isLiteral: type.isLiteral(),
      isNull: type.isNull(),
      isNullable: type.isNullable(),
      isNumber: type.isNumber(),
      isObject: type.isObject(),
      isPromise: isPromiseResult,
      isString: type.isString(),
      isUndefined: type.isUndefined(),
      isUnion: type.isUnion(),
      typeName: this.getTypeName(type),
      typeString,
    }
    return result
  }

  private getTypeName(type: Type): string {
    const symbol = type.getSymbol()
    if (symbol) {
      return symbol.getName()
    }
    const apparent = type.getApparentType()
    const apparentSymbol = apparent.getSymbol()
    if (apparentSymbol) {
      return apparentSymbol.getName()
    }
    const text = type.getText()
    const match = text.match(/^([A-Za-z_]\w*)/)
    return match?.[1] ?? text
  }

  checkType(sourceFile: SourceFile, line: number, column: number): TypeCheckResult {
    try {
      const compilerFile = sourceFile.compilerNode
      const lineCount = compilerFile.getLineStarts().length
      if (line - 1 >= lineCount || line < 1) {
        return createEmptyTypeCheckResult()
      }
      const pos = compilerFile.getPositionOfLineAndCharacter(line - 1, Math.max(0, column - 1))
      const descendant = sourceFile.getDescendantAtPos(pos)
      if (!descendant) {
        return createEmptyTypeCheckResult()
      }

      let type = descendant.getType()
      let typeNodeText: string | undefined
      if (!type) {
        let current: typeof descendant | undefined = descendant
        while (current && !type) {
          current = current.getParent()
          if (current) {
            type = current.getType()
          }
        }
      }

      if (!type) {
        return createEmptyTypeCheckResult()
      }

      const varDecl = descendant.getParent()
      if (varDecl && Node.isVariableDeclaration(varDecl)) {
        const tn = varDecl.getTypeNode()
        typeNodeText = tn?.getText()
      }

      return this.getTypeInfo(type, typeNodeText)
    } catch {
      return createEmptyTypeCheckResult()
    }
  }

  getVariableType(sourceFile: SourceFile, variableName: string): TypeCheckResult | null {
    const variables = sourceFile.getVariableDeclarations()
    const variable = variables.find((v) => v.getName() === variableName)
    if (!variable) {
      return null
    }
    const type = variable.getType()
    const typeNode = variable.getTypeNode()
    return this.getTypeInfo(type, typeNode?.getText())
  }

  compareTypes(source: TypeCheckResult, target: TypeCheckResult): TypeRelation {
    const isIdentical =
      source.typeString === target.typeString && source.typeName === target.typeName

    const primitiveTypes = ['string', 'number', 'boolean']
    const sourceIsPrimitive = primitiveTypes.includes(source.typeName)
    const targetIsPrimitive = primitiveTypes.includes(target.typeName)

    let isAssignable = isIdentical
    if (!isAssignable) {
      if (target.isAny) {
        isAssignable = true
      } else if (source.isNull && target.isNullable) {
        isAssignable = true
      } else if (source.isUndefined && target.isNullable) {
        isAssignable = true
      } else if (sourceIsPrimitive && targetIsPrimitive && source.typeName === target.typeName) {
        isAssignable = true
      } else if (source.isLiteral && target.typeName === source.typeName) {
        isAssignable = true
      } else if (source.typeString === target.typeString) {
        isAssignable = true
      }
    }

    const isSubtype = isAssignable && !isIdentical

    return {
      isAssignable,
      isIdentical,
      isSubtype,
      source,
      target,
    }
  }

  isTypeSafe(type: TypeCheckResult): boolean {
    return !type.isAny && type.typeString !== 'unknown' && !type.isAny
  }

  inferTypes(sourceFile: SourceFile): TypeInferenceResult[] {
    const results: TypeInferenceResult[] = []
    const filePath = sourceFile.getFilePath()
    const variables = sourceFile.getVariableDeclarations()

    for (const variable of variables) {
      const name = variable.getName()
      const typeNode = variable.getTypeNode()
      const hasExplicitAnnotation = typeNode !== undefined
      const inferredType = this.getTypeInfo(variable.getType(), typeNode?.getText())

      let declaredType: TypeCheckResult | null = null
      if (typeNode) {
        declaredType = this.getTypeInfo(typeNode.getType())
      }

      const start = variable.getStart()
      const pos = sourceFile.getLineAndColumnAtPos(start)

      results.push({
        column: pos.column,
        declaredType,
        filePath,
        hasExplicitAnnotation,
        inferredType,
        isInferred: !hasExplicitAnnotation,
        line: pos.line,
        variableName: name,
      })
    }

    return results
  }

  findUnsafeUsages(sourceFile: SourceFile): UnsafeTypeUsage[] {
    const usages: UnsafeTypeUsage[] = []
    const filePath = sourceFile.getFilePath()

    const asExpressions = sourceFile.getDescendantsOfKind(SyntaxKind.AsExpression)
    for (const expr of asExpressions) {
      const typeNode = expr.getTypeNode()
      const typeText = typeNode?.getText() ?? 'unknown'
      if (typeText === 'const') continue

      const start = expr.getStart()
      const pos = sourceFile.getLineAndColumnAtPos(start)

      usages.push({
        column: pos.column,
        filePath,
        line: pos.line,
        message: `Type assertion to ${typeText}`,
        typeString: typeText,
        usage: 'type-assertion',
        variableName: expr.getExpression().getText(),
      })
    }

    const typeAssertions = sourceFile.getDescendantsOfKind(SyntaxKind.TypeAssertionExpression)
    for (const expr of typeAssertions) {
      const typeNode = expr.getTypeNode()
      const typeText = typeNode?.getText() ?? 'unknown'
      const start = expr.getStart()
      const pos = sourceFile.getLineAndColumnAtPos(start)

      usages.push({
        column: pos.column,
        filePath,
        line: pos.line,
        message: `Type assertion (angle-bracket) to ${typeText}`,
        typeString: typeText,
        usage: 'type-assertion',
        variableName: expr.getExpression().getText(),
      })
    }

    const nonNullExprs = sourceFile.getDescendantsOfKind(SyntaxKind.NonNullExpression)
    for (const expr of nonNullExprs) {
      const start = expr.getStart()
      const pos = sourceFile.getLineAndColumnAtPos(start)

      usages.push({
        column: pos.column,
        filePath,
        line: pos.line,
        message: 'Non-null assertion used',
        typeString: expr.getType().getText(),
        usage: 'non-null-assertion',
        variableName: expr.getExpression().getText(),
      })
    }

    const variables = sourceFile.getVariableDeclarations()
    for (const variable of variables) {
      const type = variable.getType()
      if (type.isAny()) {
        const typeNode = variable.getTypeNode()
        const start = variable.getStart()
        const pos = sourceFile.getLineAndColumnAtPos(start)
        const usage = typeNode ? 'any-cast' : 'implicit-any'

        usages.push({
          column: pos.column,
          filePath,
          line: pos.line,
          message: typeNode
            ? `Explicit any type on ${variable.getName()}`
            : `Implicit any type on ${variable.getName()}`,
          typeString: 'any',
          usage,
          variableName: variable.getName(),
        })
      }
    }

    const parameters: import('ts-morph').ParameterDeclaration[] = []
    const functions = sourceFile.getFunctions()
    for (const fn of functions) {
      parameters.push(...fn.getParameters())
    }
    const methods = sourceFile.getClasses().flatMap((c) => c.getMethods())
    for (const method of methods) {
      parameters.push(...method.getParameters())
    }
    for (const param of parameters) {
      const type = param.getType()
      if (type.isAny()) {
        const typeNode = param.getTypeNode()
        const start = param.getStart()
        const pos = sourceFile.getLineAndColumnAtPos(start)

        usages.push({
          column: pos.column,
          filePath,
          line: pos.line,
          message: typeNode
            ? `Explicit any parameter ${param.getName()}`
            : `Implicit any parameter ${param.getName()}`,
          typeString: 'any',
          usage: typeNode ? 'any-cast' : 'implicit-any',
          variableName: param.getName(),
        })
      }
    }

    return usages
  }

  calculateComplexity(sourceFile: SourceFile): TypeComplexityMetrics {
    const filePath = sourceFile.getFilePath()
    let totalTypes = 0
    let anyCount = 0
    let unknownCount = 0
    let genericCount = 0
    let unionCount = 0
    let intersectionCount = 0
    let complexTypes = 0
    let explicitlyTyped = 0

    const processType = (type: Type, hasExplicitAnnotation: boolean): void => {
      totalTypes++
      if (hasExplicitAnnotation) {
        explicitlyTyped++
      }

      const typeString = type.getText()
      if (type.isAny()) anyCount++
      if (typeString === 'unknown') unknownCount++
      if (type.isTypeParameter()) genericCount++
      if (type.isUnion()) unionCount++
      if (type.isIntersection()) intersectionCount++

      const typeArgs = type.getTypeArguments()
      if (typeArgs.length > 2) complexTypes++

      if (type.isObject() && !type.isArray()) {
        const properties = type.getProperties()
        if (properties.length > 3) complexTypes++
      }
    }

    const variables = sourceFile.getVariableDeclarations()
    for (const variable of variables) {
      const type = variable.getType()
      const hasAnnotation = variable.getTypeNode() !== undefined
      processType(type, hasAnnotation)
    }

    const functions = sourceFile.getFunctions()
    for (const fn of functions) {
      for (const param of fn.getParameters()) {
        const type = param.getType()
        const hasAnnotation = param.getTypeNode() !== undefined
        processType(type, hasAnnotation)
      }
      const returnType = fn.getReturnType()
      const hasReturnAnnotation = fn.getReturnTypeNode() !== undefined
      processType(returnType, hasReturnAnnotation)
    }

    const classes = sourceFile.getClasses()
    for (const cls of classes) {
      for (const property of cls.getProperties()) {
        const type = property.getType()
        const hasAnnotation = property.getTypeNode() !== undefined
        processType(type, hasAnnotation)
      }
      for (const method of cls.getMethods()) {
        for (const param of method.getParameters()) {
          const type = param.getType()
          const hasAnnotation = param.getTypeNode() !== undefined
          processType(type, hasAnnotation)
        }
        const returnType = method.getReturnType()
        const hasReturnAnnotation = method.getReturnTypeNode() !== undefined
        processType(returnType, hasReturnAnnotation)
      }
    }

    const typeCoverage = totalTypes > 0 ? explicitlyTyped / totalTypes : 1

    return {
      anyCount,
      complexTypes,
      filePath,
      genericCount,
      intersectionCount,
      totalTypes,
      typeCoverage,
      unionCount,
      unknownCount,
    }
  }

  analyzeFile(sourceFile: SourceFile): TypeAwareAnalysisResult {
    const inferenceResults = this.inferTypes(sourceFile)
    const unsafeUsages = this.findUnsafeUsages(sourceFile)
    const complexityMetrics = this.calculateComplexity(sourceFile)

    const typeMismatches = inferenceResults
      .filter((r) => r.declaredType !== null && r.declaredType.typeString !== r.inferredType.typeString)
      .map((r) => ({
        actualType: r.inferredType.typeString,
        column: r.column,
        expectedType: r.declaredType!.typeString,
        filePath: r.filePath,
        line: r.line,
        message: `Type mismatch: expected ${r.declaredType!.typeString}, got ${r.inferredType.typeString}`,
        variableName: r.variableName,
      }))

    const totalVariables = inferenceResults.length
    const explicitlyTyped = inferenceResults.filter((r) => r.hasExplicitAnnotation).length
    const implicitlyTyped = totalVariables - explicitlyTyped
    const anyUsageCount = unsafeUsages.filter((u) => u.typeString === 'any').length

    return {
      complexityMetrics: [complexityMetrics],
      inferenceResults,
      summary: {
        anyUsageCount,
        explicitlyTyped,
        implicitlyTyped,
        mismatchCount: typeMismatches.length,
        totalVariables,
        typeCoverage: totalVariables > 0 ? explicitlyTyped / totalVariables : 1,
        unsafeCount: unsafeUsages.length,
      },
      typeMismatches,
      unsafeUsages,
    }
  }
}
