import { extname, basename } from 'node:path'

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Represents a detected side effect within a code section.
 *
 * @example
 * // Side effects detected: ['file-io', 'logging']
 */
export type SideEffectType =
  | 'file-io'
  | 'logging'
  | 'env-access'
  | 'network'
  | 'non-deterministic'
  | 'state-mutation'
  | 'timer'
  | 'event-listener'

/**
 * Control flow classification for a code section.
 *
 * @example
 * // 'branching' — contains if/switch statements
 * // 'async' — contains async/await/Promise
 */
export type ControlFlowType = 'linear' | 'branching' | 'looping' | 'recursive' | 'async'

/**
 * Complexity level for a code section.
 *
 * @example
 * // 'simple' — cyclomatic complexity < 5
 * // 'complex' — cyclomatic complexity > 10
 */
export type ComplexityLevel = 'simple' | 'moderate' | 'complex'

/**
 * Section type classification.
 */
export type SectionType = 'function' | 'class' | 'interface' | 'type' | 'constant' | 'block'

/**
 * Explanation for a function parameter.
 *
 * @example
 * const param: ParamExplanation = {
 *   name: 'filePath',
 *   type: 'string',
 *   purpose: 'Path to the file to analyze',
 * }
 */
export interface ParamExplanation {
  name: string
  type: string
  purpose: string
}

/**
 * Explanation for an exported symbol.
 *
 * @example
 * const exp: ExportExplanation = {
 *   name: 'buildCodeExplanation',
 *   type: 'function',
 *   purpose: 'Orchestrates full code explanation generation',
 * }
 */
export interface ExportExplanation {
  name: string
  type: string
  purpose: string
}

/**
 * A code section within a file (function, class, interface, etc.).
 *
 * @example
 * const section: CodeSection = {
 *   type: 'function',
 *   name: 'formatOutput',
 *   lineStart: 10,
 *   lineEnd: 25,
 *   description: 'Formats analysis output for display',
 *   complexity: 'simple',
 *   calls: ['chalk', 'JSON.stringify'],
 *   calledBy: ['run'],
 *   parameters: [{ name: 'data', type: 'unknown', purpose: 'Data to format' }],
 *   returns: 'string',
 *   sideEffects: [],
 *   controlFlow: 'linear',
 * }
 */
export interface CodeSection {
  type: SectionType
  name: string
  lineStart: number
  lineEnd: number
  description: string
  complexity: ComplexityLevel
  calls: string[]
  calledBy: string[]
  parameters: ParamExplanation[]
  returns: string
  sideEffects: SideEffectType[]
  controlFlow: ControlFlowType
}

/**
 * Aggregate metrics for a file.
 *
 * @example
 * const metrics: FileMetrics = {
 *   lines: 120,
 *   functions: 5,
 *   classes: 1,
 *   imports: 8,
 *   exports: 3,
 *   complexity: 12,
 * }
 */
export interface FileMetrics {
  lines: number
  functions: number
  classes: number
  imports: number
  exports: number
  complexity: number
}

/**
 * Complete explanation of a source file.
 *
 * @example
 * const explanation: CodeExplanation = {
 *   file: 'src/commands/count.ts',
 *   language: 'TypeScript',
 *   purpose: 'CLI command that implements the count feature',
 *   overview: 'Oclif command for counting lines of code...',
 *   sections: [...],
 *   dependencies: ['@oclif/core', 'node:fs'],
 *   exports: [...],
 *   patterns: ['error handling', 'async/await'],
 *   metrics: { lines: 198, functions: 1, classes: 1, imports: 7, exports: 3, complexity: 5 },
 * }
 */
export interface CodeExplanation {
  file: string
  language: string
  purpose: string
  overview: string
  sections: CodeSection[]
  dependencies: string[]
  exports: ExportExplanation[]
  patterns: string[]
  metrics: FileMetrics
}

/**
 * Options for building a code explanation.
 *
 * @example
 * const options: ExplainOptions = {
 *   line: 42,
 *   functionName: 'parseConfig',
 *   verbose: true,
 * }
 */
export interface ExplainOptions {
  line?: number
  functionName?: string
  verbose?: boolean
}

// ─── Language Detection ───────────────────────────────────────────────────────

/**
 * Detect the programming language from file extension.
 *
 * @example
 * detectLanguage('foo.ts') // 'TypeScript'
 * detectLanguage('foo.py') // 'Python'
 * detectLanguage('foo.unknown') // 'Unknown'
 */
export function detectLanguage(filePath: string): string {
  const ext = extname(filePath).toLowerCase()
  const map: Record<string, string> = {
    '.ts': 'TypeScript',
    '.tsx': 'TypeScript (JSX)',
    '.js': 'JavaScript',
    '.jsx': 'JavaScript (JSX)',
    '.mjs': 'JavaScript (ESM)',
    '.cjs': 'JavaScript (CJS)',
    '.py': 'Python',
    '.rb': 'Ruby',
    '.go': 'Go',
    '.rs': 'Rust',
    '.java': 'Java',
    '.kt': 'Kotlin',
    '.swift': 'Swift',
    '.c': 'C',
    '.cpp': 'C++',
    '.h': 'C/C++ Header',
    '.hpp': 'C++ Header',
    '.cs': 'C#',
    '.php': 'PHP',
    '.sh': 'Shell',
    '.bash': 'Bash',
    '.zsh': 'Zsh',
    '.sql': 'SQL',
    '.html': 'HTML',
    '.css': 'CSS',
    '.scss': 'SCSS',
    '.less': 'Less',
    '.json': 'JSON',
    '.yaml': 'YAML',
    '.yml': 'YAML',
    '.xml': 'XML',
    '.md': 'Markdown',
    '.lua': 'Lua',
    '.r': 'R',
    '.dart': 'Dart',
    '.zig': 'Zig',
    '.vue': 'Vue',
    '.svelte': 'Svelte',
  }
  return map[ext] ?? 'Unknown'
}

// ─── Import / Export Extraction ───────────────────────────────────────────────

/**
 * Extract imported module paths from source content.
 *
 * @example
 * extractImports('import { foo } from "./bar"') // ['./bar']
 * extractImports('import fs from "node:fs"') // ['node:fs']
 */
export function extractImports(content: string): string[] {
  const imports: string[] = []
  const importRegex = /import\s+(?:type\s+)?(?:[\w{}*,\s]+?)\s*(?:from\s+)?['"]([^'"]+)['"]/g
  let match: RegExpExecArray | null
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1]
    if (importPath !== undefined) imports.push(importPath)
  }
  // Also match dynamic imports
  const dynamicRegex = /import\(\s*['"]([^'"]+)['"]\s*\)/g
  while ((match = dynamicRegex.exec(content)) !== null) {
    const importPath = match[1]
    if (importPath !== undefined) imports.push(importPath)
  }
  return [...new Set(imports)]
}

/**
 * Extract exported symbols from source content.
 *
 * @example
 * extractExports('export function foo() {}') // [{ name: 'foo', type: 'function', purpose: 'Exported function' }]
 * extractExports('export default class Bar {}') // [{ name: 'Bar', type: 'class', purpose: 'Default exported class' }]
 */
export function extractExports(content: string): ExportExplanation[] {
  const exports: ExportExplanation[] = []
  const lines = content.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed.startsWith('export')) continue

    // export default class X
    const defaultClassMatch = trimmed.match(
      /^export\s+default\s+class\s+(\w+)/,
    )
    if (defaultClassMatch) {
      const name = defaultClassMatch[1] ?? ''
      if (name) {
        exports.push({
          name,
          purpose: `Default exported class`,
          type: 'class',
        })
      }
      continue
    }

    // export class X
    const classMatch = trimmed.match(/^export\s+(?:default\s+)?class\s+(\w+)/)
    if (classMatch) {
      const name = classMatch[1] ?? ''
      if (name) {
        exports.push({
          name,
          purpose: `Exported class`,
          type: 'class',
        })
      }
      continue
    }

    // export function X
    const funcMatch = trimmed.match(
      /^export\s+(?:async\s+)?function\s+(\w+)/,
    )
    if (funcMatch) {
      const name = funcMatch[1] ?? ''
      if (name) {
        exports.push({
          name,
          purpose: `Exported function`,
          type: 'function',
        })
      }
      continue
    }

    // export interface X
    const ifaceMatch = trimmed.match(/^export\s+interface\s+(\w+)/)
    if (ifaceMatch) {
      const name = ifaceMatch[1] ?? ''
      if (name) {
        exports.push({
          name,
          purpose: `Exported interface`,
          type: 'interface',
        })
      }
      continue
    }

    // export type X
    const typeMatch = trimmed.match(/^export\s+type\s+(\w+)/)
    if (typeMatch) {
      const name = typeMatch[1] ?? ''
      if (name) {
        exports.push({
          name,
          purpose: `Exported type`,
          type: 'type',
        })
      }
      continue
    }

    // export const/let/var X
    const constMatch = trimmed.match(
      /^export\s+(?:const|let|var)\s+(\w+)/,
    )
    if (constMatch) {
      const name = constMatch[1] ?? ''
      if (name) {
        exports.push({
          name,
          purpose: `Exported constant`,
          type: 'constant',
        })
      }
      continue
    }

    // export { X, Y }
    const namedMatch = trimmed.match(/^export\s+\{([^}]+)\}/)
    if (namedMatch) {
      const matchStr = namedMatch[1] ?? ''
      const names = matchStr.split(',').map((n) => (n.trim().split(/\s+as\s+/).pop() ?? '').trim() || n.trim())
      for (const name of names) {
        if (name) {
          exports.push({
            name,
            purpose: `Re-exported symbol`,
            type: 'unknown',
          })
        }
      }
      continue
    }

    // export default X
    const defaultMatch = trimmed.match(/^export\s+default\s+(\w+)/)
    if (defaultMatch) {
      const name = defaultMatch[1] ?? ''
      if (name) {
        exports.push({
          name,
          purpose: `Default export`,
          type: 'unknown',
        })
      }
      continue
    }
  }

  return exports
}

// ─── Section Extraction ───────────────────────────────────────────────────────

/**
 * Extract code sections (functions, classes, interfaces, types, constants) from source.
 *
 * @example
 * extractSections('function foo(a: number): string { return String(a) }')
 * // [{ type: 'function', name: 'foo', lineStart: 1, lineEnd: 1, ... }]
 */
export function extractSections(content: string): CodeSection[] {
  const sections: CodeSection[] = []
  const lines = content.split('\n')
  const sectionStack: { type: SectionType; name: string; startLine: number; braceCount: number }[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''
    const lineNum = i + 1
    const trimmed = line.trim()

    // Track brace depth for existing sections
    for (let j = sectionStack.length - 1; j >= 0; j--) {
      const entry = sectionStack[j]
      if (entry === undefined) continue
      const opens = (line.match(/\{/g) ?? []).length
      const closes = (line.match(/\}/g) ?? []).length
      entry.braceCount += opens - closes
      if (entry.braceCount <= 0) {
        const params = extractSectionParams(lines, entry.startLine, entry.type, entry.name)
        const sectionContent = lines.slice(entry.startLine - 1, lineNum).join('\n')
        sections.push({
          type: entry.type,
          name: entry.name,
          lineStart: entry.startLine,
          lineEnd: lineNum,
          description: inferSectionDescription(entry.name, entry.type, params, sectionContent),
          complexity: computeComplexityLevel(calculateCyclomaticComplexity(sectionContent)),
          calls: extractCallsFromSection(sectionContent, entry.name),
          calledBy: [],
          parameters: params,
          returns: inferReturnType(sectionContent, entry.type),
          sideEffects: detectSideEffects(sectionContent),
          controlFlow: detectControlFlow(sectionContent),
        })
        sectionStack.splice(j, 1)
      }
    }

    // Detect function declarations (skip methods inside classes — handled by brace tracking)
    if (sectionStack.length === 0) {
      const funcMatch = trimmed.match(
        /^(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*[<(]/,
      )
      if (funcMatch) {
        const funcName = funcMatch[1] ?? ''
        if (!funcName) continue
        const opens = (trimmed.match(/\{/g) ?? []).length
        const closes = (trimmed.match(/\}/g) ?? []).length
        const braceCount = opens - closes
        if (braceCount > 0 || !trimmed.includes('{')) {
          sectionStack.push({
            type: 'function',
            name: funcName,
            startLine: lineNum,
            braceCount: braceCount > 0 ? braceCount : 0,
          })
        }
        continue
      }

      // Detect class declarations
      const classMatch = trimmed.match(
        /^(?:export\s+)?(?:default\s+)?(?:abstract\s+)?class\s+(\w+)/,
      )
      if (classMatch) {
        const className = classMatch[1] ?? ''
        if (!className) continue
        const opens = (trimmed.match(/\{/g) ?? []).length
        const closes = (trimmed.match(/\}/g) ?? []).length
        const braceCount = opens - closes
        sectionStack.push({
          type: 'class',
          name: className,
          startLine: lineNum,
          braceCount: braceCount > 0 ? braceCount : 0,
        })
        continue
      }
    }

    // Detect interface declarations (no braces needed)
    const ifaceMatch = trimmed.match(
      /^(?:export\s+)?interface\s+(\w+)\s*(?:\{|extends)/,
    )
    if (ifaceMatch) {
      const name = ifaceMatch[1] ?? ''
      if (name && !sections.some((s) => s.name === name && s.type === 'interface')) {
        let endLine = lineNum
        let depth = (trimmed.match(/\{/g) ?? []).length - (trimmed.match(/\}/g) ?? []).length
        for (let k = i + 1; k < lines.length; k++) {
          depth += (lines[k]?.match(/\{/g) ?? []).length - (lines[k]?.match(/\}/g) ?? []).length
          endLine = k + 1
          if (depth <= 0) break
        }
        sections.push({
          type: 'interface',
          name,
          lineStart: lineNum,
          lineEnd: endLine,
          description: `Type contract defining the ${name} shape`,
          complexity: 'simple',
          calls: [],
          calledBy: [],
          parameters: [],
          returns: 'object',
          sideEffects: [],
          controlFlow: 'linear',
        })
      }
      continue
    }

    // Detect type declarations
    const typeMatch = trimmed.match(
      /^(?:export\s+)?type\s+(\w+)\s*(?:<|=)/,
    )
    if (typeMatch) {
      const name = typeMatch[1] ?? ''
      if (name && !sections.some((s) => s.name === name && s.type === 'type')) {
        let endLine = lineNum
        if (!trimmed.endsWith(';') && trimmed.includes('{')) {
          let depth = (trimmed.match(/\{/g) ?? []).length - (trimmed.match(/\}/g) ?? []).length
          for (let k = i + 1; k < lines.length; k++) {
            depth += (lines[k]?.match(/\{/g) ?? []).length - (lines[k]?.match(/\}/g) ?? []).length
            endLine = k + 1
            if (depth <= 0) break
          }
        }
        sections.push({
          type: 'type',
          name,
          lineStart: lineNum,
          lineEnd: endLine,
          description: `Type alias for ${name}`,
          complexity: 'simple',
          calls: [],
          calledBy: [],
          parameters: [],
          returns: 'type',
          sideEffects: [],
          controlFlow: 'linear',
        })
      }
      continue
    }

    // Detect exported constants
    const constMatch = trimmed.match(
      /^(?:export\s+)?(?:const|let|var)\s+(\w+)\s*[:=]/,
    )
    if (constMatch && sectionStack.length === 0) {
      const name = constMatch[1] ?? ''
      if (name && !sections.some((s) => s.name === name && s.type === 'constant')) {
        let endLine = lineNum
        if (trimmed.includes('{') || trimmed.includes('(')) {
          let depth = 0
          for (const ch of trimmed) {
            if (ch === '{' || ch === '(' || ch === '[') depth++
            if (ch === '}' || ch === ')' || ch === ']') depth--
          }
          if (depth > 0) {
            for (let k = i + 1; k < lines.length; k++) {
              for (const ch of lines[k] ?? '') {
                if (ch === '{' || ch === '(' || ch === '[') depth++
                if (ch === '}' || ch === ')' || ch === ']') depth--
              }
              endLine = k + 1
              if (depth <= 0) break
            }
          }
        }
        const sectionContent = lines.slice(i, endLine).join('\n')
        const isArrow = trimmed.includes('=>')
        sections.push({
          type: 'constant',
          name,
          lineStart: lineNum,
          lineEnd: endLine,
          description: isArrow
            ? `Arrow function assigned to ${name}`
            : `Constant value ${name}`,
          complexity: isArrow
            ? computeComplexityLevel(calculateCyclomaticComplexity(sectionContent))
            : 'simple',
          calls: isArrow ? extractCallsFromSection(sectionContent, name) : [],
          calledBy: [],
          parameters: isArrow ? extractArrowParams(trimmed) : [],
          returns: isArrow ? inferReturnType(sectionContent, 'constant') : 'value',
          sideEffects: isArrow ? detectSideEffects(sectionContent) : [],
          controlFlow: isArrow ? detectControlFlow(sectionContent) : 'linear',
        })
      }
    }
  }

  // Close any unclosed sections
  for (const entry of sectionStack) {
    const params = extractSectionParams(lines, entry.startLine, entry.type, entry.name)
    const sectionContent = lines.slice(entry.startLine - 1).join('\n')
    sections.push({
      type: entry.type,
      name: entry.name,
      lineStart: entry.startLine,
      lineEnd: lines.length,
      description: inferSectionDescription(entry.name, entry.type, params, sectionContent),
      complexity: computeComplexityLevel(calculateCyclomaticComplexity(sectionContent)),
      calls: extractCallsFromSection(sectionContent, entry.name),
      calledBy: [],
      parameters: params,
      returns: inferReturnType(sectionContent, entry.type),
      sideEffects: detectSideEffects(sectionContent),
      controlFlow: detectControlFlow(sectionContent),
    })
  }

  // Resolve calledBy
  resolveCalledBy(sections)

  return sections
}

// ─── Parameter Extraction ─────────────────────────────────────────────────────

/**
 * Extract parameters from a function or class constructor.
 *
 * @example
 * extractSectionParams(lines, 1, 'function', 'foo')
 * // For 'function foo(a: string, b: number)' → [{ name: 'a', type: 'string', purpose: 'Parameter a' }, ...]
 */
export function extractSectionParams(
  lines: string[],
  startLine: number,
  type: SectionType,
  name: string,
): ParamExplanation[] {
  // Gather the declaration lines until we see the opening brace or arrow
  let decl = ''
  for (let i = startLine - 1; i < Math.min(lines.length, startLine + 5); i++) {
    decl += (lines[i] ?? '') + '\n'
    if (decl.includes('{') || decl.includes('=>')) break
  }

  if (type === 'class') {
    // Find constructor
    const constructorMatch = decl.match(/constructor\s*\(([^)]*)\)/)
    if (constructorMatch) {
      const paramStr = constructorMatch[1] ?? ''
      return parseParamList(paramStr)
    }
    return []
  }

  // Function or arrow
  const parenMatch = decl.match(
    new RegExp(`${escapeRegex(name)}\\s*(?:<[^>]*>)?\\s*\\(([^)]*)\\)`),
  )
  if (parenMatch) {
    const paramStr = parenMatch[1] ?? ''
    return parseParamList(paramStr)
  }

  return []
}

/**
 * Extract parameters from an arrow function constant.
 *
 * @example
 * extractArrowParams('const add = (a: number, b: number) => a + b')
 * // [{ name: 'a', type: 'number', purpose: 'Parameter a' }, ...]
 */
export function extractArrowParams(line: string): ParamExplanation[] {
  const arrowMatch = line.match(/=\s*\(([^)]*)\)/)
  if (arrowMatch) {
    const paramStr = arrowMatch[1] ?? ''
    return parseParamList(paramStr)
  }
  // Single param without parens: const x = param => ...
  const singleMatch = line.match(/=\s*(\w+)\s*=>/)
  if (singleMatch) {
    const paramName = singleMatch[1] ?? ''
    if (paramName) {
      return [{ name: paramName, type: 'unknown', purpose: `Parameter ${paramName}` }]
    }
  }
  return []
}

/**
 * Parse a comma-separated parameter list string.
 *
 * @example
 * parseParamList('a: string, b?: number')
 * // [{ name: 'a', type: 'string', purpose: 'Parameter a' }, { name: 'b', type: 'number', purpose: 'Optional parameter b' }]
 */
export function parseParamList(paramStr: string): ParamExplanation[] {
  if (!paramStr.trim()) return []

  const params: ParamExplanation[] = []
  let depth = 0
  let current = ''

  for (const ch of paramStr) {
    if (ch === '(' || ch === '[' || ch === '{' || ch === '<') depth++
    if (ch === ')' || ch === ']' || ch === '}' || ch === '>') depth--
    if (ch === ',' && depth === 0) {
      if (current.trim()) params.push(parseSingleParam(current.trim()))
      current = ''
    } else {
      current += ch
    }
  }
  if (current.trim()) params.push(parseSingleParam(current.trim()))

  return params
}

/**
 * Parse a single parameter declaration.
 *
 * @example
 * parseSingleParam('filePath: string') // { name: 'filePath', type: 'string', purpose: 'Parameter filePath' }
 * parseSingleParam('opts?: Options') // { name: 'opts', type: 'Options', purpose: 'Optional parameter opts' }
 */
export function parseSingleParam(raw: string): ParamExplanation {
  // Remove decorators, rest, etc.
  let cleaned = raw.replace(/^\.\.\./, '').replace(/=.+$/, '').trim()
  const isOptional = cleaned.includes('?')
  cleaned = cleaned.replace('?', '')

  // Split on first ':'
  const colonIdx = cleaned.indexOf(':')
  const name = (colonIdx >= 0 ? cleaned.slice(0, colonIdx) : cleaned).trim()
  const type = colonIdx >= 0 ? cleaned.slice(colonIdx + 1).trim() : 'unknown'

  return {
    name,
    type,
    purpose: isOptional ? `Optional parameter ${name}` : `Parameter ${name}`,
  }
}

// ─── Complexity Calculation ───────────────────────────────────────────────────

/**
 * Calculate cyclomatic complexity of code.
 * Counts decision points: if, else if, for, while, case, catch, &&, ||, ??
 *
 * @example
 * calculateCyclomaticComplexity('if (x) { foo() }') // 2
 * calculateCyclomaticComplexity('const x = 1') // 1
 */
export function calculateCyclomaticComplexity(content: string): number {
  let complexity = 1
  const patterns = [
    /\bif\b/g,
    /\belse\s+if\b/g,
    /\bfor\b/g,
    /\bwhile\b/g,
    /\bcase\b/g,
    /\bcatch\b/g,
    /&&/g,
    /\|\|/g,
    /\?\?/g,
    /\?\.(?!\d)/g,
  ]
  for (const pattern of patterns) {
    const matches = content.match(pattern)
    complexity += matches ? matches.length : 0
  }
  return complexity
}

/**
 * Convert a numeric complexity score to a level.
 *
 * @example
 * computeComplexityLevel(3) // 'simple'
 * computeComplexityLevel(7) // 'moderate'
 * computeComplexityLevel(15) // 'complex'
 */
export function computeComplexityLevel(complexity: number): ComplexityLevel {
  if (complexity < 5) return 'simple'
  if (complexity <= 10) return 'moderate'
  return 'complex'
}

// ─── Control Flow Detection ───────────────────────────────────────────────────

/**
 * Detect the control flow pattern of a code section.
 *
 * @example
 * detectControlFlow('if (x) { foo() }') // 'branching'
 * detectControlFlow('for (let i = 0; i < 10; i++) {}') // 'looping'
 * detectControlFlow('async function foo() { await bar() }') // 'async'
 * detectControlFlow('function fib(n) { return fib(n - 1) }') // 'recursive'
 * detectControlFlow('const x = 1') // 'linear'
 */
export function detectControlFlow(content: string): ControlFlowType {
  if (/async\s+|await\s+|Promise[\.(]/.test(content)) return 'async'
  if (/\b(for|while|do\s*\{)\b/.test(content)) return 'looping'

  // Check for recursion: function calls its own name
  const funcNameMatch = content.match(/function\s+(\w+)/)
  if (funcNameMatch) {
    const funcName = funcNameMatch[1] ?? ''
    if (funcName) {
      const bodyMatch = content.slice(content.indexOf('{'))
      if (bodyMatch && new RegExp(`\\b${escapeRegex(funcName)}\\s*\\(`).test(bodyMatch)) {
        return 'recursive'
      }
    }
  }

  // Check arrow constant recursion
  const arrowMatch = content.match(/(?:const|let)\s+(\w+)\s*=[^=]*=>/)
  if (arrowMatch) {
    const varName = arrowMatch[1] ?? ''
    if (varName && new RegExp(`\\b${escapeRegex(varName)}\\s*\\(`).test(content)) {
      return 'recursive'
    }
  }

  if (/\bif\b|\bswitch\b/.test(content)) return 'branching'
  return 'linear'
}

// ─── Side Effect Detection ────────────────────────────────────────────────────

/**
 * Detect side effects in a code section.
 *
 * @example
 * detectSideEffects('fs.readFile("x")') // ['file-io']
 * detectSideEffects('console.log("hi")') // ['logging']
 * detectSideEffects('process.env.KEY') // ['env-access']
 */
export function detectSideEffects(content: string): SideEffectType[] {
  const effects: SideEffectType[] = []

  if (/\bfs\.\w+|readFile|writeFile|readFileSync|writeFileSync|readDir|mkdir/.test(content)) {
    effects.push('file-io')
  }
  if (/\bconsole\.\w+/.test(content)) {
    effects.push('logging')
  }
  if (/\bprocess\.env\b/.test(content)) {
    effects.push('env-access')
  }
  if (/\bfetch\(|axios|https?\.\w+|\.request\(|XMLHttpRequest/.test(content)) {
    effects.push('network')
  }
  if (/\bDate\.now\(\)|Math\.random\(\)|new Date\(\)/.test(content)) {
    effects.push('non-deterministic')
  }
  if (/\bpush\(|\.splice\(|\.sort\(|\.reverse\(|\.shift\(|\.pop\(|\.unshift\(|delete\s+/.test(content)) {
    effects.push('state-mutation')
  }
  if (/\bsetTimeout|setInterval|requestAnimationFrame/.test(content)) {
    effects.push('timer')
  }
  if (/\baddEventListener|\.on\(|\.once\(/.test(content)) {
    effects.push('event-listener')
  }

  return effects
}

// ─── Pattern Detection ────────────────────────────────────────────────────────

/**
 * Detect design patterns and common coding patterns in source code.
 *
 * @example
 * detectPatterns('try { foo() } catch(e) {}') // ['error-handling']
 * detectPatterns('Promise.all([a, b])') // ['parallel-execution']
 * detectPatterns('class Singleton { static instance }') // ['singleton']
 */
export function detectPatterns(content: string): string[] {
  const patterns: string[] = []

  if (/try\s*\{[\s\S]*?\}\s*catch/.test(content)) {
    patterns.push('error-handling')
  }
  if (/Promise\.all/.test(content)) {
    patterns.push('parallel-execution')
  }
  if (/Promise\.race/.test(content)) {
    patterns.push('race-condition-pattern')
  }
  if (/new\s+Map\s*\(|\.set\(|\.get\(/.test(content)) {
    patterns.push('map-pattern')
  }
  if (/new\s+Set\s*\(/.test(content)) {
    patterns.push('set-pattern')
  }
  if (/\.subscribe\(|\.on\(|\.emit\(|EventEmitter|addEventListener/.test(content)) {
    patterns.push('observer')
  }
  if (/\.use\(|\.next\(\)|middleware/.test(content)) {
    patterns.push('middleware')
  }
  if (/static\s+(?:readonly\s+)?(?:instance|_instance)\b/.test(content)) {
    patterns.push('singleton')
  }
  if (/function\s+create\w+|function\s+make\w+|function\s+build\w+|\(\)\s*=>\s*\{/.test(content)) {
    patterns.push('factory')
  }
  if (/\.then\(|\.catch\(|\.finally\(/.test(content)) {
    patterns.push('promise-chain')
  }
  if (/async\s+function|async\s+\(|await\s+/.test(content)) {
    patterns.push('async-await')
  }
  if (/export\s+default\s+class/.test(content)) {
    patterns.push('default-export-class')
  }
  if (/Object\.freeze|Object\.seal|Object\.assign/.test(content)) {
    patterns.push('immutable-pattern')
  }
  if (/\.reduce\(/.test(content)) {
    patterns.push('reduce-pattern')
  }
  if (/\.map\([\s\S]*\.filter\(|\.filter\([\s\S]*\.map\(/.test(content)) {
    patterns.push('functional-composition')
  }
  if (/interface\s+\w+\s*</.test(content)) {
    patterns.push('generic-interface')
  }

  return patterns
}

// ─── Purpose Inference ────────────────────────────────────────────────────────

/**
 * Infer the purpose of a file from its path, content, imports, and exports.
 *
 * @example
 * inferFilePurpose('import { Command } from "@oclif/core"', 'src/commands/count.ts')
 * // 'CLI command module'
 */
export function inferFilePurpose(content: string, filePath: string): string {
  const fileName = basename(filePath).toLowerCase()
  const dirPath = filePath.toLowerCase()
  const language = detectLanguage(filePath)

  // Directory-based inference
  if (dirPath.includes('commands/')) return 'CLI command module'
  if (dirPath.includes('test/') || dirPath.includes('tests/') || dirPath.includes('__tests__/')) return 'Test suite'
  if (dirPath.includes('core/')) return 'Core library module'
  if (dirPath.includes('utils/') || dirPath.includes('helpers/')) return 'Utility module with helper functions'
  if (dirPath.includes('config/')) return 'Configuration module'
  if (dirPath.includes('middleware/')) return 'Middleware module'
  if (dirPath.includes('models/')) return 'Data model module'
  if (dirPath.includes('routes/')) return 'Route handler module'
  if (dirPath.includes('services/')) return 'Service layer module'
  if (dirPath.includes('controllers/')) return 'Controller module'

  // Filename-based (check before content for index files)
  if (fileName === 'index.ts' || fileName === 'index.js') return 'Module barrel / entry point'
  if (fileName.endsWith('.test.ts') || fileName.endsWith('.spec.ts')) return 'Test suite'
  if (fileName.endsWith('.d.ts')) return 'Type declaration file'

  // Content-based inference
  if (content.includes('@oclif/core')) return 'CLI command module'
  if (content.includes('describe(') || content.includes('it(') || content.includes('test(')) return 'Test suite'
  if (content.includes('export default class')) return `Main ${language} class definition`
  if (content.includes('export interface')) return `TypeScript type definitions`
  if (/^export\s/m.test(content) && !content.includes('function')) return 'Module with exported constants or types'

  return `${language} source file`
}

/**
 * Infer a description for a code section based on its name, type, and parameters.
 *
 * @example
 * inferSectionDescription('formatOutput', 'function', [{ name: 'data', type: 'string', purpose: 'Data to format' }], '...')
 * // 'Function that processes data parameter and returns a result'
 */
export function inferSectionDescription(
  name: string,
  type: SectionType,
  params: ParamExplanation[],
  _content: string,
): string {
  if (type === 'class') return `Class definition for ${name}`
  if (type === 'interface') return `Type contract defining the ${name} shape`
  if (type === 'type') return `Type alias for ${name}`
  if (type === 'constant') {
    if (params.length > 0) return `Arrow function ${name} that processes ${params.map((p) => p.name).join(', ')}`
    return `Constant ${name}`
  }

  // Function — infer from name
  const lowerName = name.toLowerCase()
  if (lowerName.startsWith('get') || lowerName.startsWith('fetch')) {
    return `Function that retrieves ${name.slice(3) || 'data'}`
  }
  if (lowerName.startsWith('set')) {
    return `Function that sets ${name.slice(3) || 'value'}`
  }
  if (lowerName.startsWith('is') || lowerName.startsWith('has') || lowerName.startsWith('can')) {
    return `Predicate function that checks ${name}`
  }
  if (lowerName.startsWith('validate') || lowerName.startsWith('check')) {
    return `Validation function for ${name}`
  }
  if (lowerName.startsWith('format') || lowerName.startsWith('stringify')) {
    return `Formatting function for ${name}`
  }
  if (lowerName.startsWith('parse') || lowerName.startsWith('extract')) {
    return `Parsing function for ${name}`
  }
  if (lowerName.startsWith('compute') || lowerName.startsWith('calculate')) {
    return `Computation function for ${name}`
  }
  if (lowerName.startsWith('build') || lowerName.startsWith('create') || lowerName.startsWith('make')) {
    return `Factory function that creates ${name}`
  }
  if (lowerName.startsWith('handle') || lowerName.startsWith('on')) {
    return `Event handler for ${name}`
  }
  if (lowerName.startsWith('detect') || lowerName.startsWith('find') || lowerName.startsWith('search')) {
    return `Detection function for ${name}`
  }
  if (lowerName.startsWith('resolve')) {
    return `Resolution function for ${name}`
  }

  if (params.length === 0) return `Function ${name} with no parameters`
  return `Function ${name} that processes ${params.map((p) => p.name).join(', ')}`
}

// ─── Call Extraction ──────────────────────────────────────────────────────────

/**
 * Extract function calls from a section of code, excluding the section's own name.
 *
 * @example
 * extractCallsFromSection('function foo() { bar(); baz() }', 'foo') // ['bar', 'baz']
 */
export function extractCallsFromSection(content: string, selfName: string): string[] {
  const calls: string[] = []
  // Match identifier( calls
  const callRegex = /\b(\w+)\s*\(/g
  let match: RegExpExecArray | null
  const keywords = new Set([
    'if', 'else', 'for', 'while', 'switch', 'case', 'return',
    'new', 'throw', 'try', 'catch', 'finally', 'typeof', 'instanceof',
    'function', 'class', 'import', 'export', 'const', 'let', 'var',
    'async', 'await', 'yield', 'delete', 'void', 'constructor',
    'extends', 'implements', 'interface', 'type', 'enum',
  ])

  while ((match = callRegex.exec(content)) !== null) {
    const name = match[1]
    if (name === undefined) continue
    if (name === selfName) continue
    if (keywords.has(name)) continue
    if (!calls.includes(name)) calls.push(name)
  }

  return calls
}

// ─── Return Type Inference ────────────────────────────────────────────────────

/**
 * Infer the return type of a section from its content.
 *
 * @example
 * inferReturnType('function foo(): string { return "hi" }', 'function') // 'string'
 * inferReturnType('function foo() { console.log("hi") }', 'function') // 'void'
 */
export function inferReturnType(content: string, type: SectionType): string {
  if (type === 'class') return 'instance'
  if (type === 'interface' || type === 'type') return 'object'

  // Check explicit return type
  const returnTypeMatch = content.match(/\)\s*:\s*([^{=]+?)(?:\s*[{=]|$)/m)
  if (returnTypeMatch) {
    const retType = returnTypeMatch[1] ?? ''
    if (retType) return retType.trim()
  }

  // Infer from content
  if (/return\s+['"`]/.test(content)) return 'string'
  if (/return\s+\d+/.test(content)) return 'number'
  if (/return\s+(true|false)/.test(content)) return 'boolean'
  if (/return\s+\[/.test(content)) return 'array'
  if (/return\s+\{/.test(content)) return 'object'
  if (/return\s+null/.test(content)) return 'null'
  if (/return\s+undefined/.test(content)) return 'undefined'
  if (/\breturn\b/.test(content)) return 'unknown'
  return 'void'
}

// ─── Metrics ──────────────────────────────────────────────────────────────────

/**
 * Compute file-level metrics.
 *
 * @example
 * computeMetrics(content, sections)
 * // { lines: 100, functions: 3, classes: 1, imports: 5, exports: 2, complexity: 8 }
 */
export function computeMetrics(content: string, sections: CodeSection[]): FileMetrics {
  const lines = content.split('\n').length
  const functions = sections.filter((s) => s.type === 'function' || (s.type === 'constant' && s.parameters.length > 0)).length
  const classes = sections.filter((s) => s.type === 'class').length
  const imports = extractImports(content).length
  const exports = extractExports(content).length
  const complexity = calculateCyclomaticComplexity(content)

  return { lines, functions, classes, imports, exports, complexity }
}

// ─── Overview Generation ──────────────────────────────────────────────────────

/**
 * Generate a high-level overview of the file.
 *
 * @example
 * generateOverview('count.ts', 'TypeScript', sections, dependencies)
 * // 'TypeScript file with 3 functions and 2 imports...'
 */
export function generateOverview(
  _filePath: string,
  language: string,
  sections: CodeSection[],
  dependencies: string[],
  metrics: FileMetrics,
): string {
  const parts: string[] = []
  parts.push(`${language} file with ${metrics.lines} lines.`)

  const functionCount = sections.filter((s) => s.type === 'function').length
  const classCount = sections.filter((s) => s.type === 'class').length
  const ifaceCount = sections.filter((s) => s.type === 'interface').length
  const typeCount = sections.filter((s) => s.type === 'type').length
  const constCount = sections.filter((s) => s.type === 'constant').length

  const structureParts: string[] = []
  if (functionCount > 0) structureParts.push(`${functionCount} function${functionCount > 1 ? 's' : ''}`)
  if (classCount > 0) structureParts.push(`${classCount} class${classCount > 1 ? 'es' : ''}`)
  if (ifaceCount > 0) structureParts.push(`${ifaceCount} interface${ifaceCount > 1 ? 's' : ''}`)
  if (typeCount > 0) structureParts.push(`${typeCount} type${typeCount > 1 ? 's' : ''}`)
  if (constCount > 0) structureParts.push(`${constCount} constant${constCount > 1 ? 's' : ''}`)

  if (structureParts.length > 0) {
    parts.push(`Contains ${structureParts.join(', ')}.`)
  }

  if (dependencies.length > 0) {
    const internal = dependencies.filter((d) => d.startsWith('.')).length
    const external = dependencies.length - internal
    parts.push(
      `Depends on ${external} external and ${internal} internal module${internal !== 1 ? 's' : ''}.`,
    )
  }

  return parts.join(' ')
}

// ─── CalledBy Resolution ──────────────────────────────────────────────────────

/**
 * Resolve the calledBy relationship between sections.
 *
 * @example
 * // After calling resolveCalledBy(sections), each section's calledBy
 * // is populated with names of sections that call it.
 */
export function resolveCalledBy(sections: CodeSection[]): void {
  for (const caller of sections) {
    for (const callee of sections) {
      if (caller.name === callee.name) continue
      if (caller.calls.includes(callee.name)) {
        if (!callee.calledBy.includes(caller.name)) {
          callee.calledBy.push(caller.name)
        }
      }
    }
  }
}

// ─── Main Orchestrator ────────────────────────────────────────────────────────

/**
 * Build a complete code explanation for a file.
 *
 * @example
 * const explanation = buildCodeExplanation('src/commands/count.ts', content, {})
 * // Returns full CodeExplanation with sections, patterns, metrics, etc.
 */
export function buildCodeExplanation(
  filePath: string,
  content: string,
  options: ExplainOptions,
): CodeExplanation {
  const language = detectLanguage(filePath)
  const dependencies = extractImports(content)
  const allSections = extractSections(content)
  const patterns = detectPatterns(content)
  const exports = extractExports(content)

  let sections = allSections
  // Filter by line number if specified
  if (options.line !== undefined) {
    sections = allSections.filter(
      (s) => options.line! >= s.lineStart && options.line! <= s.lineEnd,
    )
  }
  // Filter by function name if specified
  if (options.functionName) {
    const byName = allSections.filter(
      (s) => s.name.toLowerCase() === options.functionName!.toLowerCase(),
    )
    if (byName.length > 0) sections = byName
  }

  const metrics = computeMetrics(content, allSections)
  const purpose = inferFilePurpose(content, filePath)
  const overview = generateOverview(filePath, language, sections, dependencies, metrics)

  return {
    file: filePath,
    language,
    purpose,
    overview,
    sections,
    dependencies,
    exports,
    patterns,
    metrics,
  }
}

// ─── Utilities ────────────────────────────────────────────────────────────────

/**
 * Escape special regex characters in a string.
 *
 * @example
 * escapeRegex('foo.bar') // 'foo\\.bar'
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
