import type { SourceMapData, SourceMapping, SourceLocation, GeneratedLocation } from './types.js'
import { append } from '../../utils/map-helpers.js'

export class SourceMapper {
  private mapData: SourceMapData | null = null
  private generatedToSource: Map<string, SourceMapping> = new Map()
  private sourceToGenerated: Map<string, SourceMapping[]> = new Map()

  load(data: SourceMapData): void {
    this.reset()
    this.mapData = data
    for (const mapping of data.mappings) {
      this.addMapping(mapping)
    }
  }

  originalPositionFor(line: number, column: number): SourceLocation | undefined {
    const key = `${line}:${column}`
    const mapping = this.generatedToSource.get(key)
    if (mapping !== undefined) {
      return { ...mapping.original }
    }
    let bestMatch: SourceMapping | undefined
    for (const [, m] of this.generatedToSource) {
      if (m.generated.line === line && m.generated.column <= column) {
        if (bestMatch === undefined || m.generated.column > bestMatch.generated.column) {
          bestMatch = m
        }
      }
    }
    if (bestMatch !== undefined) {
      return { ...bestMatch.original }
    }
    return undefined
  }

  generatedPositionFor(file: string, line: number, column: number): GeneratedLocation | undefined {
    const key = `${file}:${line}:${column}`
    const mappings = this.sourceToGenerated.get(key)
    if (mappings !== undefined && mappings.length > 0) {
      return { ...mappings[0]!.generated }
    }
    return undefined
  }

  getAllMappings(): SourceMapping[] {
    return [...this.generatedToSource.values()]
  }

  getSources(): string[] {
    if (this.mapData !== null) {
      return [...this.mapData.sources]
    }
    return []
  }

  getNames(): string[] {
    if (this.mapData !== null) {
      return [...this.mapData.names]
    }
    return []
  }

  hasMapping(line: number, column: number): boolean {
    return this.generatedToSource.has(`${line}:${column}`)
  }

  getSourceContent(_sourceFile: string): string | null {
    return null
  }

  getMappingDensity(): { totalMappings: number; linesWithMappings: number; avgMappingsPerLine: number } {
    const totalMappings = this.generatedToSource.size
    const lineSet = new Set<number>()
    for (const [, m] of this.generatedToSource) {
      lineSet.add(m.generated.line)
    }
    const linesWithMappings = lineSet.size
    const avgMappingsPerLine = linesWithMappings > 0 ? Math.round((totalMappings / linesWithMappings) * 100) / 100 : 0
    return { totalMappings, linesWithMappings, avgMappingsPerLine }
  }

  getStatistics(): { totalMappings: number; sources: number; names: number; generatedLines: number } {
    const totalMappings = this.generatedToSource.size
    const sources = this.mapData?.sources.length ?? 0
    const names = this.mapData?.names.length ?? 0
    const lineSet = new Set<number>()
    for (const [, m] of this.generatedToSource) {
      lineSet.add(m.generated.line)
    }
    return { totalMappings, sources, names, generatedLines: lineSet.size }
  }

  reset(): void {
    this.mapData = null
    this.generatedToSource.clear()
    this.sourceToGenerated.clear()
  }

  isLoaded(): boolean {
    return this.mapData !== null
  }

  addMapping(mapping: SourceMapping): void {
    const genKey = `${mapping.generated.line}:${mapping.generated.column}`
    this.generatedToSource.set(genKey, mapping)
    const srcKey = `${mapping.original.file}:${mapping.original.line}:${mapping.original.column}`
    append(this.sourceToGenerated, srcKey, mapping)
  }

  removeMapping(generatedLine: number, generatedColumn: number): boolean {
    const genKey = `${generatedLine}:${generatedColumn}`
    const mapping = this.generatedToSource.get(genKey)
    if (mapping === undefined) {
      return false
    }
    this.generatedToSource.delete(genKey)
    const srcKey = `${mapping.original.file}:${mapping.original.line}:${mapping.original.column}`
    const arr = this.sourceToGenerated.get(srcKey)
    if (arr !== undefined) {
      const idx = arr.findIndex(
        (m) => m.generated.line === generatedLine && m.generated.column === generatedColumn,
      )
      if (idx !== -1) {
        arr.splice(idx, 1)
      }
      if (arr.length === 0) {
        this.sourceToGenerated.delete(srcKey)
      }
    }
    return true
  }

  getMappingsForLine(line: number): SourceMapping[] {
    const results: SourceMapping[] = []
    for (const [, m] of this.generatedToSource) {
      if (m.generated.line === line) {
        results.push(m)
      }
    }
    return results
  }

  getMappingsForFile(file: string): SourceMapping[] {
    const results: SourceMapping[] = []
    for (const [, m] of this.generatedToSource) {
      if (m.original.file === file) {
        results.push(m)
      }
    }
    return results
  }

  validate(): string[] {
    const warnings: string[] = []
    if (this.mapData === null) {
      warnings.push('No source map data loaded')
      return warnings
    }
    const sourceSet = new Set(this.mapData.sources)
    const nameSet = new Set(this.mapData.names)
    for (const mapping of this.mapData.mappings) {
      if (!sourceSet.has(mapping.original.file)) {
        warnings.push(`Mapping references source file not in sources list: ${mapping.original.file}`)
      }
      if (mapping.name !== undefined && !nameSet.has(mapping.name)) {
        warnings.push(`Mapping references name not in names list: ${mapping.name}`)
      }
      if (mapping.original.line < 0) {
        warnings.push(`Mapping has negative source line: ${mapping.original.line}`)
      }
      if (mapping.original.column < 0) {
        warnings.push(`Mapping has negative source column: ${mapping.original.column}`)
      }
      if (mapping.generated.line < 0) {
        warnings.push(`Mapping has negative generated line: ${mapping.generated.line}`)
      }
      if (mapping.generated.column < 0) {
        warnings.push(`Mapping has negative generated column: ${mapping.generated.column}`)
      }
    }
    return warnings
  }
}
