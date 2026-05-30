// ─── Interfaces ──────────────────────────────────────────

export interface TypeAnnotation {
  name: string
  typeString: string
  kind: 'generic' | 'parameter' | 'property' | 'return' | 'variable'
  complexity: number
  filePath: string
  line: number
  hasGenerics: boolean
  hasUnion: boolean
  hasIntersection: boolean
  hasOptional: boolean
}

export interface TypeInfo {
  name: string
  kind: 'enum' | 'interface' | 'type'
  properties: number
  generics: number
  complexity: number
  filePath: string
  line: number
}

export interface TypesResult {
  annotations: TypeAnnotation[]
  typeDefinitions: TypeInfo[]
  totalAnnotations: number
  totalTypeDefs: number
  avgComplexity: number
  withGenerics: number
  withUnions: number
  withIntersections: number
  withOptional: number
  byKind: { kind: string; count: number }[]
  topComplex: TypeAnnotation[]
  largestInterfaces: TypeInfo[]
  typeCoverage: number
}

// ─── Type Annotation Extraction ─────────────────────────

/**
 * Extract type annotations from TypeScript source content.
 *
 * @example
 * extractTypeAnnotations('const x: number = 1;', 'file.ts')
 * // => [{ name: 'x', typeString: 'number', kind: 'variable', ... }]
 */
export function extractTypeAnnotations(content: string, filePath: string): TypeAnnotation[] {
  const annotations: TypeAnnotation[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const lineNum = i + 1

    // Skip import/export-only lines and comments
    const trimmed = line.trim()
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) {
      continue
    }
    if (trimmed.startsWith('import ') || trimmed.startsWith('export default')) {
      continue
    }

    extractVariableAnnotations(line, filePath, lineNum, annotations)
    extractParameterAnnotations(line, filePath, lineNum, annotations)
    extractReturnAnnotations(line, filePath, lineNum, annotations)
    extractPropertyAnnotations(line, filePath, lineNum, annotations)
  }

  return annotations
}

// ─── Variable Type Annotations ──────────────────────────

const VARIABLE_TYPE_RE = /(?:const|let|var)\s+(\w+)\s*:\s*([^=;\n]+)/g

function extractVariableAnnotations(
  line: string,
  filePath: string,
  lineNum: number,
  annotations: TypeAnnotation[],
): void {
  let match: RegExpExecArray | null
  VARIABLE_TYPE_RE.lastIndex = 0
  while ((match = VARIABLE_TYPE_RE.exec(line)) !== null) {
    const name = match[1] ?? ''
    const typeString = cleanTypeString(match[2]!)
    annotations.push({
      complexity: computeTypeComplexity(typeString),
      filePath,
      hasGenerics: hasGenerics(typeString),
      hasIntersection: hasIntersection(typeString),
      hasOptional: false,
      hasUnion: hasUnion(typeString),
      kind: 'variable',
      line: lineNum,
      name,
      typeString,
    })
  }
}

// ─── Parameter Type Annotations ──────────────────────────

const PARAM_TYPE_RE = /[\(,]\s*(\w+\??)\s*:\s*([^,\)\n]+)/g

function extractParameterAnnotations(
  line: string,
  filePath: string,
  lineNum: number,
  annotations: TypeAnnotation[],
): void {
  let match: RegExpExecArray | null
  PARAM_TYPE_RE.lastIndex = 0
  while ((match = PARAM_TYPE_RE.exec(line)) !== null) {
    const rawName = match[1] ?? ''
    const name = rawName.replace(/\?$/, '')
    const isOptional = rawName.endsWith('?')
    const typeString = cleanTypeString(match[2]!)

    // Avoid duplicating variable annotations already captured
    if (line.includes(`const ${name}`) || line.includes(`let ${name}`) || line.includes(`var ${name}`)) {
      continue
    }

    annotations.push({
      complexity: computeTypeComplexity(typeString),
      filePath,
      hasGenerics: hasGenerics(typeString),
      hasIntersection: hasIntersection(typeString),
      hasOptional: isOptional,
      hasUnion: hasUnion(typeString),
      kind: 'parameter',
      line: lineNum,
      name,
      typeString,
    })
  }
}

// ─── Return Type Annotations ────────────────────────────

const RETURN_TYPE_RE = /\)\s*:\s*([^={\n]+)(?:\s*(?:=>|\{))/g

function extractReturnAnnotations(
  line: string,
  filePath: string,
  lineNum: number,
  annotations: TypeAnnotation[],
): void {
  let match: RegExpExecArray | null
  RETURN_TYPE_RE.lastIndex = 0
  while ((match = RETURN_TYPE_RE.exec(line)) !== null) {
    const typeString = cleanTypeString(match[1] ?? '')
    // Derive a name from context: look for function/method name before the parens
    const name = extractFunctionName(line) || '<anonymous>'
    annotations.push({
      complexity: computeTypeComplexity(typeString),
      filePath,
      hasGenerics: hasGenerics(typeString),
      hasIntersection: hasIntersection(typeString),
      hasOptional: false,
      hasUnion: hasUnion(typeString),
      kind: 'return',
      line: lineNum,
      name,
      typeString,
    })
  }
}

function extractFunctionName(line: string): string {
  // Match: function name, const name =, const name: Type =
  const funcNameMatch = line.match(/(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*(?::\s*[^=]+)?\s*=\s*(?:async\s+)?)/)
  if (funcNameMatch) {
    return funcNameMatch[1] || funcNameMatch[2] || '<anonymous>'
  }
  // Match: methodName(
  const methodMatch = line.match(/^\s*(?:async\s+)?(\w+)\s*[\(<]/)
  if (methodMatch && !['if', 'for', 'while', 'switch', 'catch'].includes(methodMatch[1] ?? '')) {
    return methodMatch[1] ?? ''
  }
  return '<anonymous>'
}

// ─── Property Type Annotations ──────────────────────────

const PROPERTY_TYPE_RE = /(?:readonly\s+)?(\w+\??)\s*:\s*([^,;\n}]+)/g

function extractPropertyAnnotations(
  line: string,
  filePath: string,
  lineNum: number,
  annotations: TypeAnnotation[],
): void {
  // Only extract property types inside interface/type/class bodies
  const trimmed = line.trim()
  if (
    !trimmed.includes(':') ||
    trimmed.startsWith('//') ||
    trimmed.startsWith('*') ||
    trimmed.startsWith('/*') ||
    trimmed.startsWith('import ') ||
    trimmed.startsWith('export ')
  ) {
    return
  }

  // Skip if it looks like a variable declaration (already handled)
  if (/^\s*(?:const|let|var)\s/.test(line)) {
    return
  }

  // Skip if it looks like a function parameter (already handled)
  if (/^\s*(?:public|private|protected)?\s*(?:async\s+)?(?:function|class)\s/.test(line)) {
    return
  }

  // Only match lines that look like property declarations (indented or inside a block)
  // Must be indented (inside an interface/type/class block)
  if (line === trimmed && !trimmed.startsWith('readonly')) {
    return
  }

  let match: RegExpExecArray | null
  PROPERTY_TYPE_RE.lastIndex = 0
  while ((match = PROPERTY_TYPE_RE.exec(line)) !== null) {
    const rawName = match[1] ?? ''
    const name = rawName.replace(/\?$/, '')
    const isOptional = rawName.endsWith('?')
    const typeString = cleanTypeString(match[2]!)

    // Skip if this is actually a function parameter (inside parens)
    const beforeMatch = line.slice(0, match.index)
    const openParens = (beforeMatch.match(/\(/g) || []).length
    const closeParens = (beforeMatch.match(/\)/g) || []).length
    if (openParens > closeParens) {
      continue
    }

    // Skip return type patterns
    if (typeString.includes('=>') || typeString.includes('{')) {
      continue
    }

    annotations.push({
      complexity: computeTypeComplexity(typeString),
      filePath,
      hasGenerics: hasGenerics(typeString),
      hasIntersection: hasIntersection(typeString),
      hasOptional: isOptional,
      hasUnion: hasUnion(typeString),
      kind: 'property',
      line: lineNum,
      name,
      typeString,
    })
  }
}

// ─── Type Definition Extraction ─────────────────────────

/**
 * Extract type definitions (interfaces, type aliases, enums) from TypeScript source.
 *
 * @example
 * extractTypeDefs('interface User { name: string; age: number; }', 'file.ts')
 * // => [{ name: 'User', kind: 'interface', properties: 2, ... }]
 */
export function extractTypeDefs(content: string, filePath: string): TypeInfo[] {
  const defs: TypeInfo[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const lineNum = i + 1
    const trimmed = line.trim()

    // Interface extraction
    const ifaceMatch = trimmed.match(/^interface\s+(\w+)(?:\s*<([^>]*)>)?\s*\{?/)
    if (ifaceMatch) {
      const name = ifaceMatch[1] ?? ''
      const generics = countGenerics(ifaceMatch[2])
      const body = extractBlockBody(lines, i)
      const properties = countProperties(body)
      defs.push({
        complexity: computeTypeComplexity(name),
        filePath,
        generics,
        kind: 'interface',
        line: lineNum,
        name,
        properties,
      })
      continue
    }

    // Type alias extraction
    const typeMatch = trimmed.match(/^type\s+(\w+)(?:\s*<([^>]*)>)?\s*=\s*(.+)$/)
    if (typeMatch) {
      const name = typeMatch[1] ?? ''
      const generics = countGenerics(typeMatch[2])
      const typeDef = typeMatch[3] || ''
      // For type aliases, "properties" is the complexity of the definition
      const properties = countPropertiesInTypeDef(typeDef, lines, i)
      defs.push({
        complexity: computeTypeComplexity(typeDef),
        filePath,
        generics,
        kind: 'type',
        line: lineNum,
        name,
        properties,
      })
      continue
    }

    // Enum extraction
    const enumMatch = trimmed.match(/^enum\s+(\w+)\s*\{?/)
    if (enumMatch) {
      const name = enumMatch[1] ?? ''
      const body = extractBlockBody(lines, i)
      const properties = countEnumMembers(body)
      defs.push({
        complexity: 1,
        filePath,
        generics: 0,
        kind: 'enum',
        line: lineNum,
        name,
        properties,
      })
      continue
    }
  }

  return defs
}

// ─── Block Body Extraction ──────────────────────────────

function extractBlockBody(lines: string[], startLine: number): string {
  const bodyLines: string[] = []
  let depth = 0
  let started = false

  for (let i = startLine; i < lines.length; i++) {
    const line = lines[i]!
    for (const ch of line) {
      if (ch === '{') {
        depth++
        started = true
      } else if (ch === '}') {
        depth--
      }
    }
    if (started) {
      bodyLines.push(line)
    }
    if (started && depth === 0) {
      break
    }
  }

  return bodyLines.join('\n')
}

// ─── Property/Member Counting ───────────────────────────

function countProperties(body: string): number {
  let count = 0
  // Count lines with `:` that look like property declarations
  for (const line of body.split('\n')) {
    const trimmed = line.trim()
    if (
      trimmed.length > 0 &&
      trimmed !== '{' &&
      trimmed !== '}' &&
      !trimmed.startsWith('//') &&
      !trimmed.startsWith('*') &&
      !trimmed.startsWith('/*') &&
      trimmed.includes(':')
    ) {
      count++
    }
  }
  return count
}

function countPropertiesInTypeDef(typeDef: string, lines: string[], startLine: number): number {
  // If the type alias is an object literal type, count its properties
  if (typeDef.includes('{')) {
    const body = extractBlockBody(lines, startLine)
    return countProperties(body)
  }
  // For union types, count the union members
  if (typeDef.includes('|')) {
    return typeDef.split('|').filter((s) => s.trim().length > 0).length
  }
  return 1
}

function countEnumMembers(body: string): number {
  let count = 0
  for (const line of body.split('\n')) {
    const trimmed = line.trim()
    if (
      trimmed.length > 0 &&
      trimmed !== '{' &&
      trimmed !== '}' &&
      !trimmed.startsWith('//') &&
      !trimmed.startsWith('*') &&
      !trimmed.startsWith('/*')
    ) {
      count++
    }
  }
  return Math.max(0, count)
}

function countGenerics(genericsStr: string | undefined): number {
  if (!genericsStr || genericsStr.trim().length === 0) return 0
  return genericsStr.split(',').filter((s) => s.trim().length > 0).length
}

// ─── Type Complexity ────────────────────────────────────

/**
 * Compute a complexity score (1-10) for a type string.
 *
 * @example
 * computeTypeComplexity('string') // => 1
 * computeTypeComplexity('Array<string>') // => 2
 * computeTypeComplexity('Record<string, Array<number>>') // => 5
 */
export function computeTypeComplexity(typeString: string): number {
  let score = 1

  // +1 for each nested generic level
  let genericDepth = 0
  let maxGenericDepth = 0
  for (const ch of typeString) {
    if (ch === '<') {
      genericDepth++
      maxGenericDepth = Math.max(maxGenericDepth, genericDepth)
    } else if (ch === '>') {
      genericDepth--
    }
  }
  score += maxGenericDepth

  // +1 for each union |
  const unionCount = (typeString.match(/\|/g) || []).length
  score += unionCount

  // +1 for each intersection &
  const intersectionCount = (typeString.match(/&/g) || []).length
  score += intersectionCount

  // +1 for array brackets []
  if (typeString.includes('[]')) {
    score += 1
  }

  // +1 for tuple syntax [...]
  if (/\[[^\]]+\]/.test(typeString) && !typeString.endsWith('[]')) {
    score += 1
  }

  // +1 for utility types
  if (/Record\s*</.test(typeString) || /Map\s*</.test(typeString) || /Set\s*</.test(typeString)) {
    score += 1
  }

  return Math.min(10, score)
}

// ─── Type Coverage ──────────────────────────────────────

/**
 * Estimate type annotation coverage for variable declarations.
 *
 * @example
 * computeTypeCoverage('const x: number = 1; let y = 2;') // => 50
 */
export function computeTypeCoverage(content: string): number {
  const lines = content.split('\n')

  let totalDeclarations = 0
  let typedDeclarations = 0

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) {
      continue
    }

    // Find variable declarations
    const varMatches = trimmed.matchAll(/\b(?:const|let|var)\s+(\w+)/g)
    for (const match of varMatches) {
      totalDeclarations++
      // Check if this variable has a type annotation
      const afterName = trimmed.slice(match.index! + match[0]!.length)
      if (/^\s*:/.test(afterName)) {
        typedDeclarations++
      }
    }
  }

  if (totalDeclarations === 0) return 100
  return Math.round((typedDeclarations / totalDeclarations) * 100)
}

// ─── Utility Functions ──────────────────────────────────

function hasGenerics(typeString: string): boolean {
  return typeString.includes('<') && typeString.includes('>')
}

function hasUnion(typeString: string): boolean {
  return typeString.includes('|')
}

function hasIntersection(typeString: string): boolean {
  return typeString.includes('&')
}

function cleanTypeString(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ')
}

// ─── Build Result ───────────────────────────────────────

export interface BuildTypesResultOptions {
  top?: number
}

/**
 * Aggregate annotations and type definitions into a TypesResult.
 *
 * @example
 * buildTypesResult(annotations, typeDefs, { top: 20 })
 * // => TypesResult with computed totals and top-complex list
 */
export function buildTypesResult(
  annotations: TypeAnnotation[],
  typeDefs: TypeInfo[],
  options: BuildTypesResultOptions = {},
): TypesResult {
  const top = options.top ?? 20

  const totalAnnotations = annotations.length
  const totalTypeDefs = typeDefs.length

  // Average complexity
  const allComplexities = annotations.map((a) => a.complexity)
  const avgComplexity =
    allComplexities.length > 0
      ? Math.round((allComplexities.reduce((sum, c) => sum + c, 0) / allComplexities.length) * 10) / 10
      : 0

  // Counts by feature
  const withGenerics = annotations.filter((a) => a.hasGenerics).length
  const withUnions = annotations.filter((a) => a.hasUnion).length
  const withIntersections = annotations.filter((a) => a.hasIntersection).length
  const withOptional = annotations.filter((a) => a.hasOptional).length

  // byKind breakdown
  const kindMap = new Map<string, number>()
  for (const ann of annotations) {
    kindMap.set(ann.kind, (kindMap.get(ann.kind) ?? 0) + 1)
  }
  const byKind = Array.from(kindMap.entries())
    .map(([kind, count]) => ({ count, kind }))
    .sort((a, b) => b.count - a.count)

  // Top complex annotations
  const topComplex = [...annotations].sort((a, b) => b.complexity - a.complexity).slice(0, top)

  // Largest interfaces/type defs
  const largestInterfaces = [...typeDefs]
    .filter((td) => td.kind === 'interface' || td.kind === 'type')
    .sort((a, b) => b.properties - a.properties)

  // Type coverage
  const typeCoverage = 100 // Will be overridden by command using per-file coverage

  return {
    annotations,
    avgComplexity,
    byKind,
    largestInterfaces,
    totalAnnotations,
    totalTypeDefs,
    typeCoverage,
    typeDefinitions: typeDefs,
    topComplex,
    withGenerics,
    withIntersections,
    withOptional,
    withUnions,
  }
}
