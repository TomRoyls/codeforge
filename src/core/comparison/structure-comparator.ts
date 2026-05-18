import type {
  CodeStructure,
  ComparisonConfig,
  ComparisonResult,
  ComparisonStats,
  FunctionInfo,
  ClassInfo,
  StructureDiff,
  StructureModification,
  ImportInfo,
  ExportInfo,
} from './types.js'
import { isBlank, countLines } from '../../utils/string-helpers.js'

const DEFAULT_CONFIG: ComparisonConfig = {
  ignoreExports: false,
  ignoreImports: false,
  ignorePrivate: false,
  similarityThreshold: 0.7,
}

export class StructureComparator {
  private config: ComparisonConfig

  constructor(config: Partial<ComparisonConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  extractStructure(source: string, filePath: string): CodeStructure {
    const functions = this.extractFunctions(source)
    const classes = this.extractClasses(source)
    const imports = this.extractImports(source)
    const exports = this.extractExports(source)
    const lines = source.split('\n')
    const loc = lines.reduce((c, l) => l.trim().length > 0 ? c + 1 : c, 0)
    const complexity = functions.reduce((s, f) => s + f.complexity, 0) + 1

    return {
      filePath,
      functions,
      classes,
      imports,
      exports,
      complexity,
      loc,
    }
  }

  compare(a: CodeStructure, b: CodeStructure): StructureDiff {
    const added: CodeStructure[] = []
    const removed: CodeStructure[] = []
    const modified: StructureModification[] = []

    if (a.filePath !== b.filePath) {
      added.push(b)
      removed.push(a)
      return { added, removed, modified, similarity: 0 }
    }

    const funcDiff = this.getFunctionDiff(a, b)
    const classDiff = this.getClassDiff(a, b)

    for (const fn of funcDiff.added) {
      modified.push({
        filePath: a.filePath,
        type: 'function-added',
        name: fn.name,
        details: `Function "${fn.name}" added with ${fn.params} params`,
      })
    }
    for (const fn of funcDiff.removed) {
      modified.push({
        filePath: a.filePath,
        type: 'function-removed',
        name: fn.name,
        details: `Function "${fn.name}" removed`,
      })
    }
    for (const fn of funcDiff.changed) {
      modified.push({
        filePath: a.filePath,
        type: 'function-changed',
        name: fn.name,
        details: `Function "${fn.name}" changed`,
      })
    }

    for (const cls of classDiff.added) {
      modified.push({
        filePath: a.filePath,
        type: 'class-added',
        name: cls.name,
        details: `Class "${cls.name}" added with ${cls.methods} methods`,
      })
    }
    for (const cls of classDiff.removed) {
      modified.push({
        filePath: a.filePath,
        type: 'class-removed',
        name: cls.name,
        details: `Class "${cls.name}" removed`,
      })
    }
    for (const cls of classDiff.changed) {
      modified.push({
        filePath: a.filePath,
        type: 'class-changed',
        name: cls.name,
        details: `Class "${cls.name}" changed`,
      })
    }

    if (!this.config.ignoreImports) {
      if (JSON.stringify(a.imports) !== JSON.stringify(b.imports)) {
        modified.push({
          filePath: a.filePath,
          type: 'import-changed',
          name: '*',
          details: 'Imports changed',
        })
      }
    }

    if (!this.config.ignoreExports) {
      if (JSON.stringify(a.exports) !== JSON.stringify(b.exports)) {
        modified.push({
          filePath: a.filePath,
          type: 'export-changed',
          name: '*',
          details: 'Exports changed',
        })
      }
    }

    const similarity = this.calculateSimilarity(a, b)

    return { added, removed, modified, similarity }
  }

  compareMany(left: CodeStructure[], right: CodeStructure[]): ComparisonResult {
    const allModified: StructureModification[] = []
    const matchedRight = new Set<number>()

    for (const leftStruct of left) {
      const rightIdx = right.findIndex(
        (r) => r.filePath === leftStruct.filePath && !matchedRight.has(right.indexOf(r))
      )
      if (rightIdx >= 0) {
        matchedRight.add(rightIdx)
        const diff = this.compare(leftStruct, right[rightIdx]!)
        allModified.push(...diff.modified)
      } else {
        allModified.push({
          filePath: leftStruct.filePath,
          type: 'function-removed' as const,
          name: '*',
          details: `File "${leftStruct.filePath}" removed`,
        })
      }
    }

    for (let i = 0; i < right.length; i++) {
      if (!matchedRight.has(i)) {
        allModified.push({
          filePath: right[i]!.filePath,
          type: 'function-added' as const,
          name: '*',
          details: `File "${right[i]!.filePath}" added`,
        })
      }
    }

    const leftPaths = new Set(left.map((s) => s.filePath))
    const rightPaths = new Set(right.map((s) => s.filePath))
    let commonCount = 0
    let addedCount = 0
    let removedCount = 0
    for (const p of leftPaths) {
      if (rightPaths.has(p)) commonCount++
      else removedCount++
    }
    for (const p of rightPaths) {
      if (!leftPaths.has(p)) addedCount++
    }
    const modifiedCount = allModified.length
    const total = left.length + right.length
    const similarityIndex = total > 0 ? (commonCount * 2) / total : 1

    const statistics: ComparisonStats = {
      totalLeft: left.length,
      totalRight: right.length,
      commonCount,
      addedCount,
      removedCount,
      modifiedCount,
      similarityIndex,
    }

    const added = right.filter((r) => !leftPaths.has(r.filePath))
    const removed = left.filter((l) => !rightPaths.has(l.filePath))

    const diff: StructureDiff = {
      added,
      removed,
      modified: allModified,
      similarity: similarityIndex,
    }

    return { left, right, diff, statistics }
  }

  findSimilar(
    a: CodeStructure,
    candidates: CodeStructure[]
  ): CodeStructure | null {
    let bestMatch: CodeStructure | null = null
    let bestScore = this.config.similarityThreshold

    for (const candidate of candidates) {
      const score = this.calculateSimilarity(a, candidate)
      if (score >= bestScore) {
        bestScore = score
        bestMatch = candidate
      }
    }

    return bestMatch
  }

  calculateSimilarity(a: CodeStructure, b: CodeStructure): number {
    const aFuncNames = new Set(
      this.filterPrivate(a.functions).map((f) => f.name)
    )
    const bFuncNames = new Set(
      this.filterPrivate(b.functions).map((f) => f.name)
    )
    const aClassNames = new Set(
      this.filterPrivateClasses(a.classes).map((c) => c.name)
    )
    const bClassNames = new Set(
      this.filterPrivateClasses(b.classes).map((c) => c.name)
    )

    const allFuncNames = new Set([...aFuncNames, ...bFuncNames])
    const allClassNames = new Set([...aClassNames, ...bClassNames])

    if (allFuncNames.size === 0 && allClassNames.size === 0) {
      return 1.0
    }

    let intersection = 0
    for (const name of allFuncNames) {
      if (aFuncNames.has(name) && bFuncNames.has(name)) {
        intersection++
      }
    }
    for (const name of allClassNames) {
      if (aClassNames.has(name) && bClassNames.has(name)) {
        intersection++
      }
    }

    const union = allFuncNames.size + allClassNames.size
    return union > 0 ? intersection / union : 1.0
  }

  hasFunction(structure: CodeStructure, name: string): boolean {
    return structure.functions.some((f) => f.name === name)
  }

  hasClass(structure: CodeStructure, name: string): boolean {
    return structure.classes.some((c) => c.name === name)
  }

  getFunctionDiff(
    a: CodeStructure,
    b: CodeStructure
  ): { added: FunctionInfo[]; removed: FunctionInfo[]; changed: FunctionInfo[] } {
    const aFuncs = this.filterPrivate(a.functions)
    const bFuncs = this.filterPrivate(b.functions)
    const aMap = new Map(aFuncs.map((f) => [f.name, f]))
    const bMap = new Map(bFuncs.map((f) => [f.name, f]))

    const added: FunctionInfo[] = []
    const removed: FunctionInfo[] = []
    const changed: FunctionInfo[] = []

    for (const [name, fn] of bMap) {
      if (!aMap.has(name)) {
        added.push(fn)
      } else {
        const aFn = aMap.get(name)!
        if (
          aFn.params !== fn.params ||
          aFn.returnType !== fn.returnType ||
          aFn.isAsync !== fn.isAsync ||
          aFn.complexity !== fn.complexity
        ) {
          changed.push(fn)
        }
      }
    }

    for (const [name, fn] of aMap) {
      if (!bMap.has(name)) {
        removed.push(fn)
      }
    }

    return { added, removed, changed }
  }

  getClassDiff(
    a: CodeStructure,
    b: CodeStructure
  ): { added: ClassInfo[]; removed: ClassInfo[]; changed: ClassInfo[] } {
    const aClasses = this.filterPrivateClasses(a.classes)
    const bClasses = this.filterPrivateClasses(b.classes)
    const aMap = new Map(aClasses.map((c) => [c.name, c]))
    const bMap = new Map(bClasses.map((c) => [c.name, c]))

    const added: ClassInfo[] = []
    const removed: ClassInfo[] = []
    const changed: ClassInfo[] = []

    for (const [name, cls] of bMap) {
      if (!aMap.has(name)) {
        added.push(cls)
      } else {
        const aCls = aMap.get(name)!
        if (
          aCls.methods !== cls.methods ||
          aCls.properties !== cls.properties ||
          aCls.isAbstract !== cls.isAbstract ||
          JSON.stringify(aCls.interfaces) !== JSON.stringify(cls.interfaces)
        ) {
          changed.push(cls)
        }
      }
    }

    for (const [name, cls] of aMap) {
      if (!bMap.has(name)) {
        removed.push(cls)
      }
    }

    return { added, removed, changed }
  }

  private filterPrivate(functions: FunctionInfo[]): FunctionInfo[] {
    if (this.config.ignorePrivate) {
      return functions.filter(
        (f) =>
          !f.name.startsWith('_') &&
          !f.name.startsWith('private')
      )
    }
    return functions
  }

  private filterPrivateClasses(classes: ClassInfo[]): ClassInfo[] {
    if (this.config.ignorePrivate) {
      return classes.filter(
        (c) =>
          !c.name.startsWith('_') &&
          !c.name.startsWith('Private')
      )
    }
    return classes
  }

  private extractFunctions(source: string): FunctionInfo[] {
    const functions: FunctionInfo[] = []
    const funcRegex =
      /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)\s*(?::\s*([^{]+))?\s*\{/g
    let match: RegExpExecArray | null

    while ((match = funcRegex.exec(source)) !== null) {
      const name = match[1]!
      const paramsStr = match[2] ?? ''
      const returnType = (match[3] ?? 'void').trim()
      const isAsync = match[0].includes('async')
      const isExported = match[0].includes('export')
      const params = isBlank(paramsStr) ? 0 : paramsStr.split(',').length

      const funcBody = this.extractBlockBody(source, match.index + match[0].length - 1)
      const loc = countLines(funcBody) - 1
      const complexity = this.countComplexity(funcBody)

      functions.push({
        name,
        params,
        returnType: returnType || 'void',
        complexity,
        loc: Math.max(1, loc),
        isAsync,
        isExported,
      })
    }

    const arrowRegex =
      /(?:export\s+)?(?:async\s+)?(?:const|let|var)\s+(\w+)\s*=\s*\(([^)]*)\)\s*(?::\s*([^{=]+))?\s*(?:=>)\s*(?:\{|=>)/g
    while ((match = arrowRegex.exec(source)) !== null) {
      const name = match[1]!
      if (functions.some((f) => f.name === name)) continue
      const paramsStr = match[2] ?? ''
      const returnType = (match[3] ?? 'void').trim()
      const isAsync = match[0].includes('async')
      const isExported = match[0].includes('export')
      const params = isBlank(paramsStr) ? 0 : paramsStr.split(',').length

      functions.push({
        name,
        params,
        returnType: returnType || 'void',
        complexity: 1,
        loc: 1,
        isAsync,
        isExported,
      })
    }

    return functions
  }

  private extractClasses(source: string): ClassInfo[] {
    const classes: ClassInfo[] = []
    const classRegex =
      /(?:export\s+)?(?:abstract\s+)?class\s+(\w+)(?:\s+extends\s+\w+)?(?:\s+implements\s+([^{]+))?\s*\{/g
    let match: RegExpExecArray | null

    while ((match = classRegex.exec(source)) !== null) {
      const name = match[1]!
      const isAbstract = match[0].includes('abstract')
      const isExported = match[0].includes('export')
      const interfacesStr = match[2] ?? ''
      const interfaces = interfacesStr
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)

      const body = this.extractBlockBody(source, match.index + match[0].length - 1)
      const methodRegex = /(?:(?:public|private|protected|static|async|abstract)\s+)*(\w+)\s*\(/g
      let methodCount = 0
      let propCount = 0
      let methodMatch: RegExpExecArray | null

      while ((methodMatch = methodRegex.exec(body)) !== null) {
        const mName = methodMatch[1]!
        if (mName === 'constructor') {
          methodCount++
        } else if (/^[a-z]/.test(mName)) {
          methodCount++
        }
      }

      const propRegex =
        /(?:(?:public|private|protected|static|readonly)\s+)+(\w+)\s*[=:]|(?:(?:public|private|protected|static|readonly)\s+)+(\w+)\s*;/g
      let propMatch: RegExpExecArray | null
      while ((propMatch = propRegex.exec(body)) !== null) {
        const pName = propMatch[1] ?? propMatch[2]
        if (pName && pName !== 'constructor') {
          propCount++
        }
      }

      classes.push({
        name,
        methods: methodCount,
        properties: propCount,
        interfaces,
        isAbstract,
        isExported,
      })
    }

    return classes
  }

  private extractImports(source: string): ImportInfo[] {
    const imports: ImportInfo[] = []
    const importRegex =
      /import\s+(?:type\s+)?(?:(\{[^}]+\})|(\*)\s+as\s+(\w+)|(\w+))\s+from\s+['"]([^'"]+)['"]/g
    let match: RegExpExecArray | null

    while ((match = importRegex.exec(source)) !== null) {
      const namedImports = match[1]
      const namespaceImport = match[3]
      const defaultImport = match[4]
      const module = match[5]!
      const isTypeOnly = source.substring(
        match.index,
        match.index + 10
      ).includes('type ')

      let names: string[] = []
      if (namedImports) {
        names = namedImports
          .replace(/[{}]/g, '')
          .split(',')
          .map((s) => s.trim().split(/\s+as\s+/).pop()!)
          .filter((s) => s.length > 0)
      } else if (namespaceImport) {
        names = [namespaceImport]
      } else if (defaultImport) {
        names = [defaultImport]
      }

      imports.push({ module, names, isTypeOnly })
    }

    return imports
  }

  private extractExports(source: string): ExportInfo[] {
    const exports: ExportInfo[] = []
    const exportRegex =
      /export\s+(?:default\s+)?(function|class|const|let|var|type|interface)\s+(\w+)/g
    let match: RegExpExecArray | null

    while ((match = exportRegex.exec(source)) !== null) {
      const rawType = match[1]!
      const name = match[2]!
      const isDefault = source.substring(
        match.index,
        match.index + 20
      ).includes('default')

      let type: ExportInfo['type'] = 'const'
      if (rawType === 'function') type = 'function'
      else if (rawType === 'class') type = 'class'
      else if (rawType === 'type') type = 'type'
      else if (rawType === 'interface') type = 'interface'
      else type = 'const'

      exports.push({ name, type, isDefault })
    }

    const reexportRegex =
      /export\s+\{\s*(\w+)\s*(?:as\s+(\w+))?\s*\}\s+from\s+['"]([^'"]+)['"]/g
    while ((match = reexportRegex.exec(source)) !== null) {
      exports.push({
        name: match[2] ?? match[1]!,
        type: 'const',
        isDefault: false,
      })
    }

    return exports
  }

  private extractBlockBody(source: string, startBrace: number): string {
    let depth = 0
    let i = startBrace
    const chars = [...source]

    while (i < chars.length) {
      if (chars[i] === '{') depth++
      else if (chars[i] === '}') {
        depth--
        if (depth === 0) {
          return source.substring(startBrace, i + 1)
        }
      }
      i++
    }

    return source.substring(startBrace)
  }

  private countComplexity(body: string): number {
    let complexity = 1
    const patterns = [
      /\bif\b/g,
      /\belse\s+if\b/g,
      /\bfor\b/g,
      /\bwhile\b/g,
      /\bcase\b/g,
      /\bcatch\b/g,
      /\?\?/g,
      /\?\./g,
      /&&/g,
      /\|\|/g,
    ]

    for (const pattern of patterns) {
      const matches = body.match(pattern)
      if (matches) {
        complexity += matches.length
      }
    }

    return complexity
  }
}
