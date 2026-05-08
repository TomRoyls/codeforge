import type { FileIndexData, SymbolEntry } from './types.js'

export class FileIndex {
  private files: Map<string, FileIndexData> = new Map()

  indexFile(filePath: string, source: string): FileIndexData {
    const hash = this.computeHash(source)
    const symbols = this.extractSymbols(filePath, source)
    const imports = this.extractImports(source)
    const exports = this.extractExports(source)
    const language = this.detectLanguage(filePath)

    const data: FileIndexData = {
      filePath,
      hash,
      lastModified: Date.now(),
      symbols,
      imports,
      exports,
      size: source.length,
      language,
    }

    this.files.set(filePath, data)
    return data
  }

  removeFile(filePath: string): boolean {
    return this.files.delete(filePath)
  }

  getFile(filePath: string): FileIndexData | null {
    return this.files.get(filePath) ?? null
  }

  getAllFiles(): FileIndexData[] {
    return Array.from(this.files.values())
  }

  getModifiedSince(timestamp: number): FileIndexData[] {
    const result: FileIndexData[] = []
    for (const file of this.files.values()) {
      if (file.lastModified >= timestamp) {
        result.push(file)
      }
    }
    return result
  }

  computeHash(source: string): string {
    let h = 0x811c9dc5
    for (let i = 0; i < source.length; i++) {
      h ^= source.charCodeAt(i)
      h = Math.imul(h, 0x01000193)
    }
    return (h >>> 0).toString(16).padStart(8, '0')
  }

  private detectLanguage(filePath: string): string {
    const ext = filePath.split('.').pop() ?? ''
    const langMap: Record<string, string> = {
      ts: 'typescript',
      tsx: 'typescript',
      js: 'javascript',
      jsx: 'javascript',
      mjs: 'javascript',
      cjs: 'javascript',
    }
    return langMap[ext] ?? ext
  }

  private extractSymbols(filePath: string, source: string): SymbolEntry[] {
    const symbols: SymbolEntry[] = []
    const lines = source.split('\n')

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!
      const lineNum = i + 1

      const funcMatch = line.match(
        /(?:export\s+)?(?:async\s+)?function\s+(\w+)/,
      )
      if (funcMatch) {
        symbols.push(
          this.createSymbol(funcMatch[1]!, 'function', filePath, lineNum, funcMatch.index ?? 0, line, true),
        )
        continue
      }

      const classMatch = line.match(/(?:export\s+)?(?:abstract\s+)?class\s+(\w+)/)
      if (classMatch) {
        const children = this.extractClassMembers(filePath, lines, i)
        symbols.push(
          this.createSymbol(classMatch[1]!, 'class', filePath, lineNum, classMatch.index ?? 0, line, true, children),
        )
        continue
      }

      const ifaceMatch = line.match(/(?:export\s+)?interface\s+(\w+)/)
      if (ifaceMatch) {
        symbols.push(
          this.createSymbol(ifaceMatch[1]!, 'interface', filePath, lineNum, ifaceMatch.index ?? 0, line, true),
        )
        continue
      }

      const typeMatch = line.match(/(?:export\s+)?type\s+(\w+)\s*[=<{]/)
      if (typeMatch) {
        symbols.push(
          this.createSymbol(typeMatch[1]!, 'type', filePath, lineNum, typeMatch.index ?? 0, line, true),
        )
        continue
      }

      const enumMatch = line.match(/(?:export\s+)?(?:const\s+)?enum\s+(\w+)/)
      if (enumMatch) {
        symbols.push(
          this.createSymbol(enumMatch[1]!, 'enum', filePath, lineNum, enumMatch.index ?? 0, line, true),
        )
        continue
      }

      const constMatch = line.match(/(?:export\s+)?const\s+(\w+)\s*[=:]/)
      if (constMatch) {
        const isArrowFunc = /=>/.test(line)
        symbols.push(
          this.createSymbol(
            constMatch[1]!,
            isArrowFunc ? 'function' : 'const',
            filePath,
            lineNum,
            constMatch.index ?? 0,
            line,
            true,
          ),
        )
        continue
      }

      const letMatch = line.match(/(?:export\s+)?let\s+(\w+)\s*[=:]/)
      if (letMatch) {
        symbols.push(
          this.createSymbol(letMatch[1]!, 'variable', filePath, lineNum, letMatch.index ?? 0, line, true),
        )
        continue
      }

      const varMatch = line.match(/(?:export\s+)?var\s+(\w+)\s*[=:]/)
      if (varMatch) {
        symbols.push(
          this.createSymbol(varMatch[1]!, 'variable', filePath, lineNum, varMatch.index ?? 0, line, true),
        )
      }
    }

    return symbols
  }

  private extractClassMembers(filePath: string, lines: string[], classLineIdx: number): SymbolEntry[] {
    const members: SymbolEntry[] = []
    let depth = 0
    let started = false

    for (let i = classLineIdx; i < lines.length; i++) {
      const line = lines[i]!
      for (const ch of line) {
        if (ch === '{') {
          depth++
          started = true
        } else if (ch === '}') {
          depth--
        }
      }
      if (started && depth === 0) break
      if (!started) continue

      const methodMatch = line.match(/^\s*(?:(?:public|private|protected|static|async|abstract|readonly)\s+)*(\w+)\s*\(/)
      if (methodMatch) {
        const name = methodMatch[1]
        if (name && !['if', 'for', 'while', 'switch', 'catch', 'constructor', 'return', 'throw', 'new', 'delete'].includes(name)) {
          members.push(
            this.createSymbol(name, 'function', filePath, i + 1, methodMatch.index ?? 0, line, false),
          )
        }
      }
    }

    return members
  }

  private createSymbol(
    name: string,
    kind: SymbolEntry['kind'],
    filePath: string,
    line: number,
    column: number,
    sourceLine: string,
    exported: boolean,
    children: SymbolEntry[] = [],
  ): SymbolEntry {
    return {
      name,
      kind,
      filePath,
      line,
      column,
      exported: exported && sourceLine.includes('export'),
      children,
    }
  }

  private extractImports(source: string): string[] {
    const imports: string[] = []
    const importRegex = /import\s+.*?from\s+['"]([^'"]+)['"]/g
    const dynamicImportRegex = /import\(['"]([^'"]+)['"]\)/g

    let match: RegExpExecArray | null
    while ((match = importRegex.exec(source)) !== null) {
      imports.push(match[1]!)
    }
    while ((match = dynamicImportRegex.exec(source)) !== null) {
      imports.push(match[1]!)
    }
    return imports
  }

  private extractExports(source: string): string[] {
    const exports: string[] = []
    const namedExportRegex = /export\s+(?:default\s+)?(?:function|class|const|let|var|type|interface|enum)\s+(\w+)/g
    const reExportRegex = /export\s+\{([^}]+)\}/g
    const starExportRegex = /export\s+\*\s+from\s+['"]([^'"]+)['"]/g

    let match: RegExpExecArray | null
    while ((match = namedExportRegex.exec(source)) !== null) {
      exports.push(match[1]!)
    }
    while ((match = reExportRegex.exec(source)) !== null) {
      const names = match[1]!.split(',').map((s) => s.trim().split(/\s+as\s+/).pop()!)
      for (const name of names) {
        if (name) exports.push(name)
      }
    }
    while ((match = starExportRegex.exec(source)) !== null) {
      exports.push(`*:${match[1]!}`)
    }
    return exports
  }
}
