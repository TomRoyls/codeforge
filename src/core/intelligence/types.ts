export type SymbolKind =
  | 'class'
  | 'interface'
  | 'type'
  | 'function'
  | 'const'
  | 'enum'
  | 'namespace'
  | 'module'
  | 'variable'
  | 'method'
  | 'property'

export type ReferenceType =
  | 'import'
  | 'usage'
  | 'override'
  | 'implementation'
  | 'call'
  | 'type-reference'

export interface SymbolInfo {
  id: string
  name: string
  kind: SymbolKind
  filePath: string
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

export interface SymbolReference {
  symbolId: string
  symbolName: string
  filePath: string
  line: number
  column: number
  referenceType: ReferenceType
  context: string
}

export interface DefinitionLocation {
  symbol: SymbolInfo
  references: SymbolReference[]
}

export interface NavigationResult {
  definitions: SymbolInfo[]
  references: SymbolReference[]
  implementations: SymbolInfo[]
}

export interface SymbolTable {
  symbols: Map<string, SymbolInfo>
  references: SymbolReference[]
  fileIndex: Map<string, Set<string>>
  nameIndex: Map<string, Set<string>>
}

export interface RenameResult {
  success: boolean
  occurrences: Array<{ filePath: string; line: number; column: number; oldText: string }>
  conflicts: string[]
}

export interface CallGraph {
  nodes: CallGraphNode[]
  edges: CallGraphEdge[]
}

export interface CallGraphNode {
  id: string
  name: string
  filePath: string
  line: number
}

export interface CallGraphEdge {
  from: string
  to: string
  line: number
  filePath: string
}
