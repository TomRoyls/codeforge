export interface SourceLocation {
  line: number
  column: number
  file: string
}

export interface GeneratedLocation {
  line: number
  column: number
}

export interface SourceMapping {
  generated: GeneratedLocation
  original: SourceLocation
  name?: string
}

export interface SourceMapData {
  version: number
  sourceFile: string
  generatedFile: string
  mappings: SourceMapping[]
  sources: string[]
  names: string[]
}

export interface SourceMapSegment {
  generatedLine: number
  generatedColumn: number
  sourceIndex: number
  sourceLine: number
  sourceColumn: number
  nameIndex?: number
}
