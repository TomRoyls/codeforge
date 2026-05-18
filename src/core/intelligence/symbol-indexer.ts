import type {
  SymbolInfo,
  SymbolKind,
  SymbolReference,
  ReferenceType,
  DefinitionLocation,
  NavigationResult,
  SymbolTable,
  RenameResult,
  CallGraph,
  CallGraphNode,
  CallGraphEdge,
} from './types.js'
import { escapeRegex } from '../../utils/string-helpers.js'

interface RawSymbol {
  name: string
  kind: SymbolKind
  line: number
  column: number
  endLine: number
  endColumn: number
  isExported: boolean
  isDefault: boolean
  modifiers: string[]
  documentation?: string
  typeAnnotation?: string
}

interface RawReference {
  symbolName: string
  filePath: string
  line: number
  column: number
  referenceType: ReferenceType
  context: string
}

const SYMBOL_PATTERNS: Array<{
  regex: RegExp
  kind: SymbolKind
  exportGroup: number
  defaultGroup: number
  nameGroup: number
  modifierGroups: Array<{ group: number; modifier: string }>
}> = [
  {
    regex: /^(export\s+)?(default\s+)?(declare\s+)?(abstract\s+)?(async\s+)?class\s+(\w+)/m,
    kind: 'class',
    exportGroup: 1,
    defaultGroup: 2,
    nameGroup: 6,
    modifierGroups: [
      { group: 4, modifier: 'abstract' },
      { group: 5, modifier: 'async' },
    ],
  },
  {
    regex: /^(export\s+)?(default\s+)?interface\s+(\w+)/m,
    kind: 'interface',
    exportGroup: 1,
    defaultGroup: 2,
    nameGroup: 3,
    modifierGroups: [],
  },
  {
    regex: /^(export\s+)?(default\s+)?type\s+(\w+)\s*[=<{]/m,
    kind: 'type',
    exportGroup: 1,
    defaultGroup: 2,
    nameGroup: 3,
    modifierGroups: [],
  },
  {
    regex: /^(export\s+)?(declare\s+)?(async\s+)?function\s+(\w+)/m,
    kind: 'function',
    exportGroup: 1,
    defaultGroup: 0,
    nameGroup: 4,
    modifierGroups: [{ group: 3, modifier: 'async' }],
  },
  {
    regex: /^(export\s+)?(default\s+)?function\s+(\w+)/m,
    kind: 'function',
    exportGroup: 1,
    defaultGroup: 2,
    nameGroup: 3,
    modifierGroups: [],
  },
  {
    regex: /^(export\s+)?(declare\s+)?(abstract\s+)?enum\s+(\w+)/m,
    kind: 'enum',
    exportGroup: 1,
    defaultGroup: 0,
    nameGroup: 4,
    modifierGroups: [{ group: 3, modifier: 'abstract' }],
  },
  {
    regex: /^(export\s+)?(default\s+)?namespace\s+(\w+)/m,
    kind: 'namespace',
    exportGroup: 1,
    defaultGroup: 2,
    nameGroup: 3,
    modifierGroups: [],
  },
  {
    regex: /^(export\s+)?(default\s+)?module\s+(\w+)/m,
    kind: 'module',
    exportGroup: 1,
    defaultGroup: 2,
    nameGroup: 3,
    modifierGroups: [],
  },
]

const CONST_VAR_PATTERN =
  /^(export\s+)?(default\s+)?(declare\s+)?(const|let|var)\s+(\w+)(\s*:\s*([^=;\n]+))?/gm

const METHOD_PROPERTY_PATTERNS: Array<{
  regex: RegExp
  kind: SymbolKind
  nameGroup: number
  modifierGroups: Array<{ group: number; modifier: string }>
  typeGroup: number
}> = [
  {
    regex:
      /^\s*(private|protected|public)?\s*(static\s+)?(async\s+)?(get\s+|set\s+)?(\w+)\s*\(/gm,
    kind: 'method',
    nameGroup: 5,
    modifierGroups: [
      { group: 1, modifier: 'private' },
      { group: 2, modifier: 'static' },
      { group: 3, modifier: 'async' },
    ],
    typeGroup: 0,
  },
  {
    regex:
      /^\s*(private|protected|public)?\s*(static\s+)?(readonly\s+)?(\w+)\s*[?!]?\s*:/gm,
    kind: 'property',
    nameGroup: 4,
    modifierGroups: [
      { group: 1, modifier: 'private' },
      { group: 2, modifier: 'static' },
      { group: 3, modifier: 'readonly' },
    ],
    typeGroup: 0,
  },
  {
    regex: /^\s*#(\w+)\s*\(/gm,
    kind: 'method',
    nameGroup: 1,
    modifierGroups: [{ group: 0, modifier: 'private' }],
    typeGroup: 0,
  },
]

const IMPORT_PATTERN = /import\s+(?:type\s+)?(?:\{([^}]+)\}|(\w+))\s*(?:,\s*\{([^}]+)\})?\s*from/gm

const USAGE_PATTERN = /\b(\w+)\s*\(/gm

const MEMBER_ACCESS_PATTERN = /(\w+)\.\w+/gm
void MEMBER_ACCESS_PATTERN

const TYPE_REF_PATTERNS: Array<RegExp> = [
  /:\s*(\w+)/gm,
  /\bas\s+(\w+)/gm,
  /<(\w+)>/gm,
  /:\s*Array<(\w+)>/gm,
]

const EXTENDS_PATTERN = /(?:extends|implements)\s+(\w+)/gm

const OVERRIDE_PATTERN = /\b(\w+)\s*\(.*override/gm

// Pre-computed global-flagged regex copies for iteration (avoids new RegExp() per call)
const SYMBOL_PATTERNS_GLOBAL = SYMBOL_PATTERNS.map((p) => {
  const flags = p.regex.flags.includes('g') ? p.regex.flags : p.regex.flags + 'g'
  return new RegExp(p.regex.source, flags)
})

const CONST_VAR_REGEX_GLOBAL = new RegExp(CONST_VAR_PATTERN.source, CONST_VAR_PATTERN.flags)

const METHOD_PROPERTY_REGEXES_GLOBAL = METHOD_PROPERTY_PATTERNS.map((mp) => {
  const flags = mp.regex.flags.includes('g') ? mp.regex.flags : mp.regex.flags + 'g'
  return new RegExp(mp.regex.source, flags)
})

const IMPORT_REGEX_GLOBAL = new RegExp(IMPORT_PATTERN.source, IMPORT_PATTERN.flags)
const USAGE_REGEX_GLOBAL = new RegExp(USAGE_PATTERN.source, USAGE_PATTERN.flags)
const TYPE_REF_REGEXES_GLOBAL = TYPE_REF_PATTERNS.map((trp) => new RegExp(trp.source, trp.flags))
const EXTENDS_REGEX_GLOBAL = new RegExp(EXTENDS_PATTERN.source, EXTENDS_PATTERN.flags)
const OVERRIDE_REGEX_GLOBAL = new RegExp(OVERRIDE_PATTERN.source, OVERRIDE_PATTERN.flags)

/** Creates a fresh copy of a cached regex (resets lastIndex for .exec() iteration) */
function freshCopy(cached: RegExp): RegExp {
  return new RegExp(cached.source, cached.flags)
}

function extractLineAndColumn(source: string, offset: number): { line: number; column: number } {
  let line = 1
  let column = 1
  for (let i = 0; i < offset && i < source.length; i++) {
    if (source[i] === '\n') {
      line++
      column = 1
    } else {
      column++
    }
  }
  return { line, column }
}

function findEndPosition(
  source: string,
  startLine: number,
  startColumn: number,
  kind: SymbolKind,
): { endLine: number; endColumn: number } {
  const lines = source.split('\n')
  const startIdx = startLine - 1

  if (startIdx >= lines.length) {
    return { endLine: startLine, endColumn: startColumn }
  }

  const bracketKinds: Set<SymbolKind> = new Set([
    'class',
    'interface',
    'enum',
    'namespace',
    'module',
    'function',
    'method',
  ])

  if (!bracketKinds.has(kind)) {
    const line = lines[startIdx]
    if (line !== undefined) {
      return { endLine: startLine, endColumn: line.length + 1 }
    }
    return { endLine: startLine, endColumn: startColumn }
  }

  let braceDepth = 0
  let foundOpen = false

  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i]
    if (line === undefined) break
    for (let c = 0; c < line.length; c++) {
      const ch = line[c]
      if (ch === '{') {
        braceDepth++
        foundOpen = true
      } else if (ch === '}') {
        braceDepth--
        if (foundOpen && braceDepth === 0) {
          return { endLine: i + 1, endColumn: c + 2 }
        }
      }
    }
  }

  return { endLine: startLine, endColumn: startColumn }
}

function getLineAt(source: string, lineNum: number): string {
  const lines = source.split('\n')
  const line = lines[lineNum - 1]
  return line ?? ''
}

function extractDocumentation(source: string, lineNum: number): string | undefined {
  const lines = source.split('\n')
  if (lineNum < 2) return undefined

  const docLines: string[] = []
  let i = lineNum - 2

  if (i >= 0) {
    const line = lines[i]
    if (line !== undefined && (line.trim().startsWith('*') || line.trim().startsWith('/**'))) {
      let j = i
      while (j >= 0) {
        const currentLine = lines[j]
        if (currentLine === undefined) break
        const trimmed = currentLine.trim()
        if (trimmed.startsWith('/**') || trimmed.startsWith('*') || trimmed.startsWith('*/')) {
          docLines.unshift(currentLine.trim())
          if (trimmed.startsWith('/**')) break
        } else {
          break
        }
        j--
      }
    }
  }

  if (docLines.length === 0) return undefined

  return docLines
    .map((l) =>
      l
        .replace(/^\/\*\*?\s*/, '')
        .replace(/\s*\*\/$/, '')
        .replace(/^\*\s*/, ''),
    )
    .filter(Boolean)
    .join(' ')
}

export class SymbolIndexer {
  private table: SymbolTable

  constructor() {
    this.table = {
      symbols: new Map(),
      references: [],
      fileIndex: new Map(),
      nameIndex: new Map(),
    }
  }

  indexFile(filePath: string, source: string): SymbolInfo[] {
    this.removeFile(filePath)

    const rawSymbols = this.extractSymbols(source, filePath)
    const symbols: SymbolInfo[] = []

    for (const raw of rawSymbols) {
      const id = `${filePath}:${raw.line}:${raw.name}`
      const symbol: SymbolInfo = {
        id,
        name: raw.name,
        kind: raw.kind,
        filePath,
        line: raw.line,
        column: raw.column,
        endLine: raw.endLine,
        endColumn: raw.endColumn,
        isExported: raw.isExported,
        isDefault: raw.isDefault,
        modifiers: raw.modifiers,
        documentation: raw.documentation,
        typeAnnotation: raw.typeAnnotation,
      }

      this.table.symbols.set(id, symbol)

      let fileSet = this.table.fileIndex.get(filePath)
      if (!fileSet) {
        fileSet = new Set()
        this.table.fileIndex.set(filePath, fileSet)
      }
      fileSet.add(id)

      let nameSet = this.table.nameIndex.get(raw.name)
      if (!nameSet) {
        nameSet = new Set()
        this.table.nameIndex.set(raw.name, nameSet)
      }
      nameSet.add(id)

      symbols.push(symbol)
    }

    const rawRefs = this.extractReferences(source, filePath, symbols)
    for (const ref of rawRefs) {
      const matchingSymbols = this.table.nameIndex.get(ref.symbolName)
      if (matchingSymbols && matchingSymbols.size > 0) {
        const symbolId = matchingSymbols.values().next().value
        if (symbolId !== undefined) {
          const symbolRef: SymbolReference = {
            symbolId,
            symbolName: ref.symbolName,
            filePath: ref.filePath,
            line: ref.line,
            column: ref.column,
            referenceType: ref.referenceType,
            context: ref.context,
          }
          this.table.references.push(symbolRef)
        }
      }
    }

    return symbols
  }

  indexFiles(files: Map<string, string>): number {
    let count = 0
    for (const [filePath, source] of files) {
      const symbols = this.indexFile(filePath, source)
      count += symbols.length
    }
    return count
  }

  findSymbol(name: string): SymbolInfo[] {
    const nameSet = this.table.nameIndex.get(name)
    if (!nameSet) return []

    const results: SymbolInfo[] = []
    for (const id of nameSet) {
      const symbol = this.table.symbols.get(id)
      if (symbol) results.push(symbol)
    }
    return results
  }

  getSymbol(id: string): SymbolInfo | null {
    return this.table.symbols.get(id) ?? null
  }

  findDefinition(name: string): DefinitionLocation | null {
    const symbols = this.findSymbol(name)
    if (symbols.length === 0) return null

    const symbol = symbols[0]!
    const refs = this.table.references.filter(
      (r) => r.symbolName === name && r.symbolId === symbol.id,
    )
    return { symbol, references: refs }
  }

  findReferences(name: string): SymbolReference[] {
    return this.table.references.filter((r) => r.symbolName === name)
  }

  navigate(name: string): NavigationResult {
    const definitions = this.findSymbol(name)
    const references = this.findReferences(name)

    const implementations: SymbolInfo[] = []

    const implRefs = references.filter(
      (r) => r.referenceType === 'implementation' || r.referenceType === 'override',
    )

    for (const ref of implRefs) {
      const contextLine = ref.context
      const match = contextLine.match(/class\s+(\w+)/)
      if (match && match[1]) {
        const implSymbols = this.findSymbol(match[1])
        implementations.push(...implSymbols)
      }
    }

    return { definitions, references, implementations }
  }

  getFileSymbols(filePath: string): SymbolInfo[] {
    const fileSet = this.table.fileIndex.get(filePath)
    if (!fileSet) return []

    const results: SymbolInfo[] = []
    for (const id of fileSet) {
      const symbol = this.table.symbols.get(id)
      if (symbol) results.push(symbol)
    }
    return results
  }

  getExportedSymbols(): SymbolInfo[] {
    const results: SymbolInfo[] = []
    for (const symbol of this.table.symbols.values()) {
      if (symbol.isExported) results.push(symbol)
    }
    return results
  }

  search(query: string): SymbolInfo[] {
    const lowerQuery = query.toLowerCase()
    const results: SymbolInfo[] = []

    for (const symbol of this.table.symbols.values()) {
      if (symbol.name.toLowerCase().includes(lowerQuery)) {
        results.push(symbol)
      }
    }

    results.sort((a, b) => {
      const aStartsWith = a.name.toLowerCase().startsWith(lowerQuery) ? 0 : 1
      const bStartsWith = b.name.toLowerCase().startsWith(lowerQuery) ? 0 : 1
      return aStartsWith - bStartsWith
    })

    return results
  }

  buildCallGraph(): CallGraph {
    const nodes: CallGraphNode[] = []
    const edges: CallGraphEdge[] = []

    const functionSymbols = new Map<string, SymbolInfo>()

    for (const symbol of this.table.symbols.values()) {
      if (symbol.kind === 'function' || symbol.kind === 'method') {
        nodes.push({
          id: symbol.id,
          name: symbol.name,
          filePath: symbol.filePath,
          line: symbol.line,
        })
        functionSymbols.set(symbol.name, symbol)
      }
    }

    for (const ref of this.table.references) {
      if (ref.referenceType === 'call') {
        const targetSymbol = functionSymbols.get(ref.symbolName)
        if (targetSymbol) {
          const callerSymbols = this.table.symbols.get(ref.symbolId)
          if (callerSymbols) {
            const callerFuncs = this.findEnclosingFunction(
              ref.filePath,
              ref.line,
            )
            if (callerFuncs) {
              edges.push({
                from: callerFuncs.id,
                to: targetSymbol.id,
                line: ref.line,
                filePath: ref.filePath,
              })
            }
          }
        }
      }
    }

    return { nodes, edges }
  }

  checkRename(symbolName: string, newName: string): RenameResult {
    const occurrences: Array<{
      filePath: string
      line: number
      column: number
      oldText: string
    }> = []
    const conflicts: string[] = []

    const symbols = this.findSymbol(symbolName)
    for (const symbol of symbols) {
      occurrences.push({
        filePath: symbol.filePath,
        line: symbol.line,
        column: symbol.column,
        oldText: symbol.name,
      })
    }

    const refs = this.findReferences(symbolName)
    for (const ref of refs) {
      occurrences.push({
        filePath: ref.filePath,
        line: ref.line,
        column: ref.column,
        oldText: ref.symbolName,
      })
    }

    const existingWithNewName = this.findSymbol(newName)
    if (existingWithNewName.length > 0) {
      conflicts.push(
        `Symbol "${newName}" already exists in ${existingWithNewName[0]!.filePath}:${existingWithNewName[0]!.line}`,
      )
    }

    const validIdentifier = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/
    if (!validIdentifier.test(newName)) {
      conflicts.push(`"${newName}" is not a valid identifier`)
    }

    return {
      success: conflicts.length === 0,
      occurrences,
      conflicts,
    }
  }

  removeFile(filePath: string): number {
    const fileSet = this.table.fileIndex.get(filePath)
    if (!fileSet) return 0

    let count = 0
    for (const id of fileSet) {
      const symbol = this.table.symbols.get(id)
      if (symbol) {
        const nameSet = this.table.nameIndex.get(symbol.name)
        if (nameSet) {
          nameSet.delete(id)
          if (nameSet.size === 0) {
            this.table.nameIndex.delete(symbol.name)
          }
        }
        this.table.symbols.delete(id)
        count++
      }
    }

    this.table.fileIndex.delete(filePath)

    this.table.references = this.table.references.filter((r) => r.filePath !== filePath)

    return count
  }

  getTable(): SymbolTable {
    return this.table
  }

  reset(): void {
    this.table = {
      symbols: new Map(),
      references: [],
      fileIndex: new Map(),
      nameIndex: new Map(),
    }
  }

  private extractSymbols(source: string, _filePath: string): RawSymbol[] {
    const symbols: RawSymbol[] = []
    const seenPositions = new Set<string>()

    for (let pi = 0; pi < SYMBOL_PATTERNS.length; pi++) {
      const pattern = SYMBOL_PATTERNS[pi]!
      const regex = freshCopy(SYMBOL_PATTERNS_GLOBAL[pi]!)
      let match: RegExpExecArray | null

      while ((match = regex.exec(source)) !== null) {
        const name = match[pattern.nameGroup]
        if (!name) continue

        const pos = extractLineAndColumn(source, match.index)
        const posKey = `${pos.line}:${pos.column}:${name}`

        if (seenPositions.has(posKey)) continue
        seenPositions.add(posKey)

        const isExported = match[pattern.exportGroup] !== undefined
        const isDefault = match[pattern.defaultGroup] !== undefined

        const modifiers: string[] = []
        for (const mg of pattern.modifierGroups) {
          if (mg.group > 0 && match[mg.group] !== undefined) {
            modifiers.push(mg.modifier)
          }
        }

        const endPos = findEndPosition(source, pos.line, pos.column, pattern.kind)
        const doc = extractDocumentation(source, pos.line)

        symbols.push({
          name,
          kind: pattern.kind,
          line: pos.line,
          column: pos.column,
          endLine: endPos.endLine,
          endColumn: endPos.endColumn,
          isExported,
          isDefault,
          modifiers,
          documentation: doc,
        })
      }
    }

    const constVarRegex = freshCopy(CONST_VAR_REGEX_GLOBAL)
    let cvMatch: RegExpExecArray | null
    while ((cvMatch = constVarRegex.exec(source)) !== null) {
      const name = cvMatch[5]
      if (!name) continue

      const pos = extractLineAndColumn(source, cvMatch.index)
      const posKey = `${pos.line}:${pos.column}:${name}`

      if (seenPositions.has(posKey)) continue
      seenPositions.add(posKey)

      const isExported = cvMatch[1] !== undefined
      const isDefault = cvMatch[2] !== undefined
      const kind: SymbolKind = cvMatch[4] === 'const' ? 'const' : 'variable'

      const modifiers: string[] = []
      if (cvMatch[3] !== undefined) modifiers.push('declare')

      const typeAnnotation = cvMatch[7] !== undefined ? cvMatch[7].trim() : undefined
      const endPos = findEndPosition(source, pos.line, pos.column, kind)
      const doc = extractDocumentation(source, pos.line)

      symbols.push({
        name,
        kind,
        line: pos.line,
        column: pos.column,
        endLine: endPos.endLine,
        endColumn: endPos.endColumn,
        isExported,
        isDefault,
        modifiers,
        documentation: doc,
        typeAnnotation,
      })
    }

    for (let mi = 0; mi < METHOD_PROPERTY_PATTERNS.length; mi++) {
      const mp = METHOD_PROPERTY_PATTERNS[mi]!
      const regex = freshCopy(METHOD_PROPERTY_REGEXES_GLOBAL[mi]!)
      let mpMatch: RegExpExecArray | null

      while ((mpMatch = regex.exec(source)) !== null) {
        const name = mpMatch[mp.nameGroup]
        if (!name) continue
        if (/^(if|for|while|switch|catch|return|throw|new|class|function|const|let|var|import|export|type|interface|enum)$/.test(name)) {
          continue
        }

        const pos = extractLineAndColumn(source, mpMatch.index)
        const posKey = `${pos.line}:${pos.column}:${name}`

        if (seenPositions.has(posKey)) continue
        seenPositions.add(posKey)

        const modifiers: string[] = []
        for (const mg of mp.modifierGroups) {
          if (mg.group > 0 && mpMatch[mg.group] !== undefined) {
            const val: string = mpMatch[mg.group] ?? ''
            if (val === 'private' || val === 'protected') {
              modifiers.push('private')
            } else if (val) {
              modifiers.push(mg.modifier)
            }
          }
        }

        const endPos = findEndPosition(source, pos.line, pos.column, mp.kind)

        symbols.push({
          name,
          kind: mp.kind,
          line: pos.line,
          column: pos.column,
          endLine: endPos.endLine,
          endColumn: endPos.endColumn,
          isExported: false,
          isDefault: false,
          modifiers,
        })
      }
    }

    return symbols
  }

  private extractReferences(
    source: string,
    filePath: string,
    _definedSymbols: SymbolInfo[],
  ): RawReference[] {
    const refs: RawReference[] = []
    const definedNames = new Set(_definedSymbols.map((s) => s.name))

    const importRegex = freshCopy(IMPORT_REGEX_GLOBAL)
    let importMatch: RegExpExecArray | null
    while ((importMatch = importRegex.exec(source)) !== null) {
      const pos = extractLineAndColumn(source, importMatch.index)
      const line = getLineAt(source, pos.line)
      const context = line.trim()

      if (importMatch[1]) {
        const names = importMatch[1].split(',').map((n) => n.trim().split(/\s+as\s+/).pop()?.trim()).filter(Boolean)
        for (const name of names) {
          if (name) {
            refs.push({
              symbolName: name,
              filePath,
              line: pos.line,
              column: pos.column,
              referenceType: 'import',
              context,
            })
          }
        }
      }

      if (importMatch[2]) {
        refs.push({
          symbolName: importMatch[2],
          filePath,
          line: pos.line,
          column: pos.column,
          referenceType: 'import',
          context,
        })
      }

      if (importMatch[3]) {
        const names = importMatch[3].split(',').map((n) => n.trim().split(/\s+as\s+/).pop()?.trim()).filter(Boolean)
        for (const name of names) {
          if (name) {
            refs.push({
              symbolName: name,
              filePath,
              line: pos.line,
              column: pos.column,
              referenceType: 'import',
              context,
            })
          }
        }
      }
    }

    const usageRegex = freshCopy(USAGE_REGEX_GLOBAL)
    const usageSeen = new Set<string>()
    let usageMatch: RegExpExecArray | null
    while ((usageMatch = usageRegex.exec(source)) !== null) {
      const name = usageMatch[1]
      if (!name) continue
      if (!definedNames.has(name)) continue
      if (/^(if|for|while|switch|catch|return|throw|new|class|function|const|let|var|import|export|type|interface|enum|console|Math|Promise|Array|Object|String|Number|Boolean|Map|Set|Error|JSON)$/.test(name)) continue

      const pos = extractLineAndColumn(source, usageMatch.index)
      const key = `${pos.line}:${pos.column}:${name}`
      if (usageSeen.has(key)) continue
      usageSeen.add(key)

      const line = getLineAt(source, pos.line)
      const context = line.trim()

      const symbolDef = this.findSymbol(name)
      const refType: ReferenceType =
        symbolDef.length > 0 && (symbolDef[0]!.kind === 'function' || symbolDef[0]!.kind === 'method')
          ? 'call'
          : 'usage'

      refs.push({
        symbolName: name,
        filePath,
        line: pos.line,
        column: pos.column,
        referenceType: refType,
        context,
      })
    }

    for (let ti = 0; ti < TYPE_REF_PATTERNS.length; ti++) {
      const regex = freshCopy(TYPE_REF_REGEXES_GLOBAL[ti]!)
      let typeMatch: RegExpExecArray | null
      while ((typeMatch = regex.exec(source)) !== null) {
        const name = typeMatch[1]
        if (!name) continue
        if (!definedNames.has(name) && !this.table.nameIndex.has(name)) continue
        if (/^(string|number|boolean|void|any|never|unknown|null|undefined|object|bigint|symbol)$/.test(name)) continue

        const pos = extractLineAndColumn(source, typeMatch.index)
        const line = getLineAt(source, pos.line)
        const context = line.trim()

        const alreadyHasRef = refs.some(
          (r) => r.symbolName === name && r.line === pos.line,
        )
        if (!alreadyHasRef) {
          refs.push({
            symbolName: name,
            filePath,
            line: pos.line,
            column: pos.column,
            referenceType: 'type-reference',
            context,
          })
        }
      }
    }

    const extendsRegex = freshCopy(EXTENDS_REGEX_GLOBAL)
    let extendsMatch: RegExpExecArray | null
    while ((extendsMatch = extendsRegex.exec(source)) !== null) {
      const name = extendsMatch[1]
      if (!name) continue

      const pos = extractLineAndColumn(source, extendsMatch.index)
      const line = getLineAt(source, pos.line)
      const context = line.trim()

      const symbolDef = this.findSymbol(name)
      const refType: ReferenceType =
        symbolDef.length > 0 && symbolDef[0]!.kind === 'class' ? 'implementation' : 'type-reference'

      refs.push({
        symbolName: name,
        filePath,
        line: pos.line,
        column: pos.column,
        referenceType: refType,
        context,
      })
    }

    const overrideRegex = freshCopy(OVERRIDE_REGEX_GLOBAL)
    let overrideMatch: RegExpExecArray | null
    while ((overrideMatch = overrideRegex.exec(source)) !== null) {
      const name = overrideMatch[1]
      if (!name) continue

      const pos = extractLineAndColumn(source, overrideMatch.index)
      const line = getLineAt(source, pos.line)
      const context = line.trim()

      refs.push({
        symbolName: name,
        filePath,
        line: pos.line,
        column: pos.column,
        referenceType: 'override',
        context,
      })
    }

    return refs
  }

  private findEnclosingFunction(
    filePath: string,
    line: number,
  ): SymbolInfo | null {
    const fileSymbols = this.getFileSymbols(filePath)

    let bestMatch: SymbolInfo | null = null
    for (const symbol of fileSymbols) {
      if (symbol.kind === 'function' || symbol.kind === 'method') {
        if (symbol.line <= line && symbol.endLine >= line) {
          if (!bestMatch || symbol.line > bestMatch.line) {
            bestMatch = symbol
          }
        }
      }
    }

    return bestMatch
  }
}
