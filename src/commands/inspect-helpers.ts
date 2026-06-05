export interface ImportInfo {
  source: string
  items: string[]
  line: number
  isTypeOnly: boolean
}

export interface ExportInfo {
  name: string
  type: 'class' | 'const' | 'enum' | 'function' | 'interface' | 'type' | 'default'
  line: number
  isExported: boolean
}

export interface FunctionInfo {
  name: string
  line: number
  params: number
  isAsync: boolean
  isExported: boolean
}

export interface ClassInfo {
  name: string
  line: number
  methods: number
  isExported: boolean
}

export interface FileInspection {
  path: string
  size: number
  lines: {
    total: number
    code: number
    blank: number
    comment: number
  }
  language: string
  imports: ImportInfo[]
  exports: ExportInfo[]
  functions: FunctionInfo[]
  classes: ClassInfo[]
  metrics: {
    complexity: number
    maintainabilityIndex: number
    linesOfCodePerFunction: number
    dependencyCount: number
    exportCount: number
  }
}

export function detectLanguage(filePath: string): string {
  const ext = filePath.slice(filePath.lastIndexOf('.')).toLowerCase()
  const languageMap: Record<string, string> = {
    '.js': 'JavaScript',
    '.jsx': 'JavaScript React',
    '.ts': 'TypeScript',
    '.tsx': 'TypeScript React',
    '.mjs': 'JavaScript (ESM)',
    '.cjs': 'JavaScript (CJS)',
    '.py': 'Python',
    '.rb': 'Ruby',
    '.go': 'Go',
    '.rs': 'Rust',
    '.java': 'Java',
    '.kt': 'Kotlin',
    '.c': 'C',
    '.cpp': 'C++',
    '.h': 'C/C++ Header',
    '.hpp': 'C++ Header',
    '.cs': 'C#',
    '.swift': 'Swift',
    '.zig': 'Zig',
    '.lua': 'Lua',
    '.php': 'PHP',
    '.css': 'CSS',
    '.scss': 'SCSS',
    '.html': 'HTML',
    '.json': 'JSON',
    '.yaml': 'YAML',
    '.yml': 'YAML',
    '.md': 'Markdown',
    '.sh': 'Shell',
    '.sql': 'SQL',
  }
  return languageMap[ext] ?? 'Unknown'
}

export function countLines(content: string): {
  total: number
  code: number
  blank: number
  comment: number
} {
  const lines = content.split('\n')
  const total = lines.length
  let blank = 0
  let comment = 0
  let inBlockComment = false

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed === '') {
      blank++
      continue
    }

    if (inBlockComment) {
      comment++
      if (trimmed.includes('*/')) {
        inBlockComment = false
      }
      continue
    }

    if (trimmed.startsWith('//')) {
      comment++
      continue
    }

    if (trimmed.startsWith('/*')) {
      comment++
      if (!trimmed.includes('*/')) {
        inBlockComment = true
      }
      continue
    }

    // Lines with inline block comments still count as code
  }

  const code = total - blank - comment
  return { blank, code, comment, total }
}

function parseImports(content: string): ImportInfo[] {
  const imports: ImportInfo[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!.trim()

    // Named or default import: import { A, B } from 'mod' or import X from 'mod'
    const namedOrDefaultMatch =
      /^import\s+(type\s+)?(?:(\w+)\s*,\s*)?\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/.exec(line)
    if (namedOrDefaultMatch) {
      const isTypeOnly = namedOrDefaultMatch[1] !== undefined
      const defaultItem = namedOrDefaultMatch[2]?.trim()
      const namedItems = namedOrDefaultMatch[3]!
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      const source = namedOrDefaultMatch[4]!
      const items = defaultItem ? [defaultItem, ...namedItems] : namedItems
      imports.push({ isTypeOnly, items, line: i + 1, source })
      continue
    }

    // Default import only: import X from 'mod'
    const defaultMatch = /^import\s+(type\s+)?(\w+)\s+from\s+['"]([^'"]+)['"]/.exec(line)
    if (defaultMatch) {
      const isTypeOnly = defaultMatch[1] !== undefined
      const name = defaultMatch[2]!
      const source = defaultMatch[3]!
      imports.push({ isTypeOnly, items: [name], line: i + 1, source })
      continue
    }

    // Namespace import: import * as X from 'mod'
    const namespaceMatch = /^import\s+(type\s+)?\*\s+as\s+(\w+)\s+from\s+['"]([^'"]+)['"]/.exec(line)
    if (namespaceMatch) {
      const isTypeOnly = namespaceMatch[1] !== undefined
      const name = namespaceMatch[2]!
      const source = namespaceMatch[3]!
      imports.push({ isTypeOnly, items: [`* as ${name}`], line: i + 1, source })
      continue
    }

    // Side-effect import: import 'mod'
    const sideEffectMatch = /^import\s+['"]([^'"]+)['"]/.exec(line)
    if (sideEffectMatch) {
      const source = sideEffectMatch[1] ?? ''
      imports.push({ isTypeOnly: false, items: [], line: i + 1, source })
      continue
    }
  }

  return imports
}

function parseExports(content: string): ExportInfo[] {
  const exports: ExportInfo[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!.trim()

    // export default class/const/function/etc.
    const exportDefaultMatch =
      /^export\s+default\s+(class|const|enum|function|interface|type)\s+(\w+)/.exec(line)
    if (exportDefaultMatch) {
      exports.push({
        isExported: true,
        line: i + 1,
        name: exportDefaultMatch[2]!,
        type: 'default',
      })
      continue
    }

    // export default expression
    const exportDefaultExpr = /^export\s+default\s+/.exec(line)
    if (exportDefaultExpr && !exportDefaultMatch) {
      exports.push({
        isExported: true,
        line: i + 1,
        name: 'default',
        type: 'default',
      })
      continue
    }

    // export class/const/enum/function/interface/type (with optional async/abstract)
    const exportMatch =
      /^export\s+(?:abstract\s+|async\s+)*(class|const|enum|function|interface|type)\s+(\w+)/.exec(line)
    if (exportMatch) {
      const kind = exportMatch[1] as 'class' | 'const' | 'enum' | 'function' | 'interface' | 'type'
      exports.push({
        isExported: true,
        line: i + 1,
        name: exportMatch[2]!,
        type: kind,
      })
      continue
    }

    // export { A, B }
    const exportBlockMatch = /^export\s+\{([^}]+)\}/.exec(line)
    if (exportBlockMatch) {
      const items = (exportBlockMatch[1] ?? '').split(',').map((s) => {
        const trimmed = s.trim()
        // Handle "X as Y" - take original name
        const parts = trimmed.split(/\s+as\s+/)
        return parts[0]!.trim()
      })
      for (const name of items) {
        if (name) {
          exports.push({
            isExported: true,
            line: i + 1,
            name,
            type: 'const',
          })
        }
      }
      continue
    }

    // export * from 'mod' (re-export)
    const reExportMatch = /^export\s+\*\s+from\s+['"]([^'"]+)['"]/.exec(line)
    if (reExportMatch) {
      exports.push({
        isExported: true,
        line: i + 1,
        name: `* from '${reExportMatch[1] ?? ''}'`,
        type: 'const',
      })
    }
  }

  return exports
}

function parseFunctions(content: string): FunctionInfo[] {
  const functions: FunctionInfo[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!.trim()

    // function declarations: [export] [async] function name(params)
    const funcMatch =
      /^(export\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)/.exec(line)
    if (funcMatch) {
      const isExported = funcMatch[1] !== undefined
      const name = funcMatch[2]!
      const paramsStr = funcMatch[3]!.trim()
      const params = paramsStr === '' ? 0 : paramsStr.split(',').filter((p) => p.trim()).length
      const isAsync = /async\s+function/.test(line)
      functions.push({ isAsync, isExported, line: i + 1, name, params })
      continue
    }

    // Arrow functions and const function expressions: [export] const/let name = [async] (...) => 
    const arrowMatch =
      /^(export\s+)?(?:const|let)\s+(\w+)\s*=\s*(async\s+)?(?:\(([^)]*)\)|([^=]))\s*=>/.exec(line)
    if (arrowMatch) {
      const isExported = arrowMatch[1] !== undefined
      const name = arrowMatch[2]!
      const isAsync = arrowMatch[3] !== undefined
      let params = 0
      if (arrowMatch[4] !== undefined) {
        const paramsStr = arrowMatch[4].trim()
        params = paramsStr === '' ? 0 : paramsStr.split(',').filter((p) => p.trim()).length
      } else if (arrowMatch[5] !== undefined) {
        // Single param without parens: const f = x =>
        params = 1
      }
      functions.push({ isAsync, isExported, line: i + 1, name, params })
    }
  }

  return functions
}

function parseClasses(content: string): ClassInfo[] {
  const classes: ClassInfo[] = []
  const lines = content.split('\n')
  const classStartLines: Array<{ index: number; isExported: boolean; name: string }> = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!.trim()

    const classMatch =
      /^(export\s+)?(?:default\s+)?(?:abstract\s+)?class\s+(\w+)/.exec(line)
    if (classMatch) {
      classStartLines.push({
        index: i,
        isExported: classMatch[1] !== undefined,
        name: classMatch[2]!,
      })
    }
  }

  for (const entry of classStartLines) {
    let methodCount = 0
    let braceDepth = 0
    let inClass = false
    let pastBrace = false

    for (let j = entry.index; j < lines.length; j++) {
      const line = lines[j]!

      for (const ch of line) {
        if (ch === '{') {
          braceDepth++
          pastBrace = true
        } else if (ch === '}') {
          braceDepth--
        }
      }

      if (pastBrace) {
        inClass = true
      }

      if (inClass && j > entry.index) {
        const trimmed = line.trim()
        // Count method declarations
        if (/^(?:public|private|protected|static|async|readonly|\*)?\s*(?:async\s+)?(\w+)\s*\(/.test(trimmed)
          && !trimmed.startsWith('//')
          && !trimmed.startsWith('*')
          && !trimmed.startsWith('/*')
        ) {
          // Exclude constructor-like and property-like lines
          if (!/^\(/.test(trimmed) && !/^get\s|^\set\s/.test(trimmed)) {
            methodCount++
          }
        }
      }

      if (inClass && braceDepth <= 0) {
        break
      }
    }

    classes.push({
      isExported: entry.isExported,
      line: entry.index + 1,
      methods: methodCount,
      name: entry.name,
    })
  }

  return classes
}

function estimateComplexity(content: string): number {
  let complexity = 1
  const patterns = [
    /\bif\b/g,
    /\belse\b/g,
    /\bfor\b/g,
    /\bwhile\b/g,
    /\bcase\b/g,
    /\bcatch\b/g,
    /&&/g,
    /\|\|/g,
    /\?[^?.]/g,
    /\?\?/g,
  ]

  for (const pattern of patterns) {
    const matches = content.match(pattern)
    if (matches) {
      complexity += matches.length
    }
  }

  return complexity
}

function calculateMaintainabilityIndex(
  avgLocPerFunc: number,
  complexity: number,
  totalLoc: number,
): number {
  if (totalLoc === 0) return 100
  const lnAvgLoc = Math.log(Math.max(1, avgLocPerFunc))
  const lnTotalLoc = Math.log(Math.max(1, totalLoc))
  return Math.max(0, Math.min(100, 171 - 5.2 * lnAvgLoc - 0.23 * complexity - 16.2 * lnTotalLoc))
}

export function analyzeFile(content: string, filePath: string): FileInspection {
  const lineInfo = countLines(content)
  const language = detectLanguage(filePath)
  const imports = parseImports(content)
  const exports = parseExports(content)
  const functions = parseFunctions(content)
  const classes = parseClasses(content)
  const complexity = estimateComplexity(content)

  const totalLoc = lineInfo.code
  const avgLocPerFunc = functions.length > 0 ? totalLoc / functions.length : totalLoc
  const maintainabilityIndex = calculateMaintainabilityIndex(avgLocPerFunc, complexity, totalLoc)

  const uniqueSources = new Set(imports.map((imp) => imp.source))

  return {
    classes,
    exports,
    functions,
    imports,
    language,
    lines: lineInfo,
    metrics: {
      complexity,
      dependencyCount: uniqueSources.size,
      exportCount: exports.length,
      linesOfCodePerFunction: Math.round(avgLocPerFunc * 10) / 10,
      maintainabilityIndex: Math.round(maintainabilityIndex * 10) / 10,
    },
    path: filePath,
    size: content.length,
  }
}
