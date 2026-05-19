// ─── Interfaces ──────────────────────────────────────────

export type NamingConvention = 'camelCase' | 'PascalCase' | 'SCREAMING_SNAKE' | 'kebab-case' | 'snake_case' | 'unknown'

export interface NamingIssue {
  type: 'abbreviation' | 'inconsistency' | 'numeric-suffix' | 'single-letter' | 'too-long' | 'too-short'
  message: string
  severity: 'error' | 'info' | 'warn'
}

export interface NamedItem {
  convention: NamingConvention
  filePath: string
  issues: NamingIssue[]
  line: number
  name: string
  type: 'class' | 'constant' | 'file' | 'function' | 'interface' | 'method' | 'parameter' | 'property' | 'type' | 'variable'
}

export interface NamingStats {
  byType: { count: number; type: string }[]
  convention: NamingConvention
  count: number
  percentage: number
}

export interface FileNaming {
  convention: NamingConvention
  file: string
}

export interface NamingResult {
  consistency: number
  dominantConvention: NamingConvention
  fileNaming: FileNaming[]
  issues: NamedItem[]
  items: NamedItem[]
  stats: NamingStats[]
  totalItems: number
}

// ─── Convention detection ────────────────────────────────

const ALLOWED_SINGLE_LETTERS = new Set(['e', 'i', 'j', 'k', 'x', 'y', 'z'])

const COMMON_ABBREVIATIONS = new Set([
  'arr',
  'buf',
  'err',
  'fn',
  'num',
  'obj',
  'ref',
  'ret',
  'str',
  'tmp',
  'val',
])

/**
 * Detect the naming convention of a given identifier.
 *
 * @example
 * detectNamingConvention('myVariable') // 'camelCase'
 * detectNamingConvention('MyComponent') // 'PascalCase'
 * detectNamingConvention('my_variable') // 'snake_case'
 * detectNamingConvention('MAX_SIZE') // 'SCREAMING_SNAKE'
 * detectNamingConvention('my-component') // 'kebab-case'
 */
export function detectNamingConvention(name: string): NamingConvention {
  if (name.length === 0) return 'unknown'

  if (/^[a-z][a-z0-9-]*$/.test(name) && name.includes('-')) return 'kebab-case'
  if (/^[A-Z][A-Z0-9_]*$/.test(name) && name.length > 1) return 'SCREAMING_SNAKE'
  if (/^[a-z][a-z0-9_]*$/.test(name) && name.includes('_')) return 'snake_case'
  if (/^[A-Z][a-zA-Z0-9]*$/.test(name)) return 'PascalCase'
  if (/^[a-z][a-zA-Z0-9]*$/.test(name)) return 'camelCase'

  return 'unknown'
}

// ─── Name extraction ────────────────────────────────────

/**
 * Extract named items from source code content.
 *
 * @example
 * extractNames('const myVar = 1;', 'test.ts')
 * // [{ name: 'myVar', type: 'variable', ... }]
 */
export function extractNames(content: string, filePath: string): NamedItem[] {
  const items: NamedItem[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const lineNum = i + 1
    const trimmed = line.trim()

    // ─── Functions (check before variables to catch arrow/func-expr) ──
    const funcMatch = trimmed.match(/^(?:export\s+)?(?:async\s+)?function\s+(\w+)/)
    if (funcMatch) {
      const name = funcMatch[1]!
      items.push({
        convention: detectNamingConvention(name),
        filePath,
        issues: [],
        line: lineNum,
        name,
        type: 'function',
      })
      continue
    }

    const funcExprMatch = trimmed.match(/^(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?function/)
    if (funcExprMatch) {
      const name = funcExprMatch[1]!
      items.push({
        convention: detectNamingConvention(name),
        filePath,
        issues: [],
        line: lineNum,
        name,
        type: 'function',
      })
      continue
    }

    const arrowFuncMatch = trimmed.match(/^(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s*)?\(/)
    if (arrowFuncMatch) {
      const name = arrowFuncMatch[1]!
      items.push({
        convention: detectNamingConvention(name),
        filePath,
        issues: [],
        line: lineNum,
        name,
        type: 'function',
      })
      continue
    }

    // ─── Variables ────────────────────────────────────
    const varMatch = trimmed.match(/^(?:export\s+)?(?:const|let|var)\s+(\w+)/)
    if (varMatch) {
      const name = varMatch[1]!
      const isConst = trimmed.startsWith('const')
      items.push({
        convention: detectNamingConvention(name),
        filePath,
        issues: [],
        line: lineNum,
        name,
        type: isConst && /^[A-Z][A-Z0-9_]*$/.test(name) ? 'constant' : 'variable',
      })
      continue
    }

    // ─── Classes ──────────────────────────────────────
    const classMatch = trimmed.match(/^(?:export\s+)?(?:abstract\s+)?class\s+(\w+)/)
    if (classMatch) {
      const name = classMatch[1]!
      items.push({
        convention: detectNamingConvention(name),
        filePath,
        issues: [],
        line: lineNum,
        name,
        type: 'class',
      })
      continue
    }

    // ─── Interfaces ───────────────────────────────────
    const ifaceMatch = trimmed.match(/^(?:export\s+)?interface\s+(\w+)/)
    if (ifaceMatch) {
      const name = ifaceMatch[1]!
      items.push({
        convention: detectNamingConvention(name),
        filePath,
        issues: [],
        line: lineNum,
        name,
        type: 'interface',
      })
      continue
    }

    // ─── Type aliases ─────────────────────────────────
    const typeMatch = trimmed.match(/^(?:export\s+)?type\s+(\w+)/)
    if (typeMatch) {
      const name = typeMatch[1]!
      items.push({
        convention: detectNamingConvention(name),
        filePath,
        issues: [],
        line: lineNum,
        name,
        type: 'type',
      })
      continue
    }

    // ─── Methods ──────────────────────────────────────
    const methodMatch = trimmed.match(/^(?:public\s+|private\s+|protected\s+|static\s+|abstract\s+|readonly\s+)*(?:async\s+)?(\w+)\s*\(/)
    if (methodMatch && !trimmed.startsWith('//') && !trimmed.startsWith('*') && !trimmed.startsWith('/*')) {
      const name = methodMatch[1]!
      // Skip control flow keywords and common non-method patterns
      const skipNames = new Set([
        'if', 'for', 'while', 'switch', 'catch', 'return', 'throw', 'new',
        'typeof', 'instanceof', 'delete', 'void', 'in', 'of', 'else',
        'try', 'finally', 'do', 'case', 'break', 'continue', 'class',
        'function', 'interface', 'type', 'const', 'let', 'var', 'export',
        'import', 'from', 'require',
      ])
      if (!skipNames.has(name)) {
        items.push({
          convention: detectNamingConvention(name),
          filePath,
          issues: [],
          line: lineNum,
          name,
          type: 'method',
        })
      }
    }

    // ─── Properties (name: type pattern) ──────────────
    const propMatch = trimmed.match(/^\s*(?:readonly\s+)?(\w+)\s*:/)
    if (propMatch) {
      const name = propMatch[1]!
      const skipNames = new Set(['constructor', 'new', 'return', 'if', 'for'])
      if (!skipNames.has(name)) {
        items.push({
          convention: detectNamingConvention(name),
          filePath,
          issues: [],
          line: lineNum,
          name,
          type: 'property',
        })
      }
    }

    // ─── Parameters ───────────────────────────────────
    const paramMatch = trimmed.match(/\(\s*(?:\w+\s*:\s*\w+\s*,\s*)*(\w+)\s*(?::\s*\w+)?\s*\)?/)
    if (paramMatch && (trimmed.includes('function') || trimmed.includes('=>') || trimmed.match(/\(.*\)\s*(?::|\{|=>)/))) {
      // Extract all parameter-like names from function signatures
      const fullParamMatch = trimmed.match(/\(([^)]*)\)/)
      if (fullParamMatch) {
        const paramStr = fullParamMatch[1]!
        const params = paramStr.split(',').map((p) => p.trim().split(/[:=]/)[0]!.trim()).filter(Boolean)
        for (const param of params) {
          const cleanParam = param.replace(/^\.{3}/, '').replace(/\?\s*$/, '').trim()
          if (cleanParam && /^\w+$/.test(cleanParam)) {
            items.push({
              convention: detectNamingConvention(cleanParam),
              filePath,
              issues: [],
              line: lineNum,
              name: cleanParam,
              type: 'parameter',
            })
          }
        }
      }
    }
  }

  return items
}

// ─── Naming issues ──────────────────────────────────────

/**
 * Check a named item for naming issues.
 *
 * @example
 * checkNamingIssues({ name: 'x', ... }) // may return single-letter issue
 * checkNamingIssues({ name: 'goodName', ... }) // no issues
 */
export function checkNamingIssues(item: NamedItem): NamingIssue[] {
  const issues: NamingIssue[] = []
  const { name } = item

  // Too short (but allow common single letters and short names)
  const allowedShort = new Set(['id', 'fn', ...Array.from(ALLOWED_SINGLE_LETTERS)])
  if (name.length <= 2 && !allowedShort.has(name)) {
    if (name.length === 1) {
      issues.push({
        message: `Single-letter name '${name}' is not descriptive`,
        severity: 'warn',
        type: 'single-letter',
      })
    } else {
      issues.push({
        message: `Name '${name}' is too short (<= 2 characters)`,
        severity: 'info',
        type: 'too-short',
      })
    }
  }

  // Too long
  if (name.length > 40) {
    issues.push({
      message: `Name '${name}' is too long (> 40 characters)`,
      severity: 'warn',
      type: 'too-long',
    })
  }

  // Abbreviation
  if (COMMON_ABBREVIATIONS.has(name)) {
    issues.push({
      message: `Name '${name}' is a common abbreviation — consider a more descriptive name`,
      severity: 'info',
      type: 'abbreviation',
    })
  }

  // Numeric suffix
  if (/[a-zA-Z]\d+$/.test(name)) {
    issues.push({
      message: `Name '${name}' ends with a numeric suffix`,
      severity: 'warn',
      type: 'numeric-suffix',
    })
  }

  return issues
}

// ─── Stats ──────────────────────────────────────────────

/**
 * Build naming convention statistics from extracted items.
 *
 * @example
 * buildNamingStats(items) // [{ convention: 'camelCase', count: 10, percentage: 80, byType: [...] }]
 */
export function buildNamingStats(items: NamedItem[]): NamingStats[] {
  const conventionMap = new Map<NamingConvention, { count: number; types: Map<string, number> }>()

  for (const item of items) {
    const existing = conventionMap.get(item.convention)
    if (existing) {
      existing.count++
      const typeCount = existing.types.get(item.type) ?? 0
      existing.types.set(item.type, typeCount + 1)
    } else {
      const types = new Map<string, number>()
      types.set(item.type, 1)
      conventionMap.set(item.convention, { count: 1, types })
    }
  }

  const total = items.length
  const stats: NamingStats[] = []

  for (const [convention, data] of conventionMap) {
    stats.push({
      byType: Array.from(data.types.entries())
        .map(([type, count]) => ({ count, type }))
        .sort((a, b) => b.count - a.count),
      convention,
      count: data.count,
      percentage: total > 0 ? Math.round((data.count / total) * 1000) / 10 : 0,
    })
  }

  stats.sort((a, b) => b.count - a.count)
  return stats
}

// ─── File naming ────────────────────────────────────────

/**
 * Detect naming conventions used for file names.
 *
 * @example
 * detectFileNamingConvention(['src/my-component.ts', 'src/helper_utils.ts'])
 * // [{ file: 'my-component.ts', convention: 'kebab-case' }, ...]
 */
export function detectFileNamingConvention(files: string[]): FileNaming[] {
  return files.map((file) => {
    const slashIdx = file.lastIndexOf('/')
    const basename = slashIdx >= 0 ? file.slice(slashIdx + 1) : file
    const dotIdx = basename.lastIndexOf('.')
    const nameWithoutExt = dotIdx >= 0 ? basename.slice(0, dotIdx) : basename
    return {
      convention: detectNamingConvention(nameWithoutExt),
      file,
    }
  })
}

// ─── Result builder ─────────────────────────────────────

/**
 * Build the full naming analysis result.
 *
 * @example
 * buildNamingResult(items, fileNaming) // { dominantConvention: 'camelCase', consistency: 85, ... }
 */
export function buildNamingResult(items: NamedItem[], fileNaming: FileNaming[]): NamingResult {
  const stats = buildNamingStats(items)
  const totalItems = items.length

  // Find dominant convention
  let dominantConvention: NamingConvention = 'unknown'
  let maxCount = 0
  for (const stat of stats) {
    if (stat.count > maxCount) {
      maxCount = stat.count
      dominantConvention = stat.convention
    }
  }

  // Compute consistency
  const consistency = totalItems > 0 ? Math.round((maxCount / totalItems) * 100) : 100

  // Check issues for each item
  const itemsWithIssues: NamedItem[] = []
  for (const item of items) {
    item.issues = checkNamingIssues(item)
    if (item.issues.length > 0) {
      itemsWithIssues.push(item)
    }
  }

  return {
    consistency,
    dominantConvention,
    fileNaming,
    issues: itemsWithIssues,
    items,
    stats,
    totalItems,
  }
}
