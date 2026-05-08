export interface TypeCheckResult {
  isAny: boolean
  isNull: boolean
  isUndefined: boolean
  isNullable: boolean
  isString: boolean
  isNumber: boolean
  isBoolean: boolean
  isArray: boolean
  isObject: boolean
  isFunction: boolean
  isPromise: boolean
  isEnum: boolean
  isUnion: boolean
  isIntersection: boolean
  isLiteral: boolean
  isGeneric: boolean
  typeName: string
  typeString: string
}

export interface TypeRelation {
  source: TypeCheckResult
  target: TypeCheckResult
  isAssignable: boolean
  isSubtype: boolean
  isIdentical: boolean
}

export interface TypeInferenceResult {
  variableName: string
  inferredType: TypeCheckResult
  declaredType: TypeCheckResult | null
  isInferred: boolean
  hasExplicitAnnotation: boolean
  filePath: string
  line: number
  column: number
}

export interface TypeMismatch {
  variableName: string
  expectedType: string
  actualType: string
  filePath: string
  line: number
  column: number
  message: string
}

export interface UnsafeTypeUsage {
  filePath: string
  line: number
  column: number
  variableName: string
  usage:
    | 'implicit-any'
    | 'any-cast'
    | 'any-access'
    | 'unsafe-assignment'
    | 'non-null-assertion'
    | 'type-assertion'
  typeString: string
  message: string
}

export interface TypeComplexityMetrics {
  filePath: string
  totalTypes: number
  anyCount: number
  unknownCount: number
  genericCount: number
  unionCount: number
  intersectionCount: number
  complexTypes: number
  typeCoverage: number
}

export interface TypeAwareAnalysisResult {
  typeMismatches: TypeMismatch[]
  unsafeUsages: UnsafeTypeUsage[]
  inferenceResults: TypeInferenceResult[]
  complexityMetrics: TypeComplexityMetrics[]
  summary: {
    totalVariables: number
    explicitlyTyped: number
    implicitlyTyped: number
    anyUsageCount: number
    typeCoverage: number
    mismatchCount: number
    unsafeCount: number
  }
}
