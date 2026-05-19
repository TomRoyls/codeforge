// ─── Interfaces ──────────────────────────────────────────

export interface ParamInfo {
  name: string
  type: string
  optional: boolean
  default_value: string | null
  description: string
}

export interface ApiFunction {
  name: string
  file: string
  line: number
  exportType: 'named' | 'default'
  signature: string
  parameters: ParamInfo[]
  returnType: string
  description: string
  examples: string[]
  since: string
  deprecated: boolean
  see: string[]
}

export interface PropertyInfo {
  name: string
  type: string
  access: 'public' | 'private' | 'protected'
  readonly: boolean
  description: string
}

export interface ApiClass {
  name: string
  file: string
  line: number
  exportType: 'named' | 'default'
  description: string
  examples: string[]
  since: string
  deprecated: boolean
  methods: ApiFunction[]
  properties: PropertyInfo[]
  extends: string
  implements: string[]
}

export interface ApiInterface {
  name: string
  file: string
  line: number
  description: string
  properties: PropertyInfo[]
  extends: string[]
}

export interface ApiType {
  name: string
  file: string
  line: number
  description: string
  definition: string
}

export interface ApiConst {
  name: string
  file: string
  line: number
  type: string
  value: string
  description: string
  exported: boolean
}

export interface ApiModule {
  file: string
  path: string
  functions: ApiFunction[]
  classes: ApiClass[]
  interfaces: ApiInterface[]
  types: ApiType[]
  constants: ApiConst[]
  description: string
}

export interface ApiDocsStats {
  totalModules: number
  totalFunctions: number
  totalClasses: number
  totalInterfaces: number
  totalTypes: number
  totalConstants: number
  documentedItems: number
  undocumentedItems: number
  documentationCoverage: number
}

export interface ApiDocsResult {
  modules: ApiModule[]
  stats: ApiDocsStats
}

export interface ApiDocsOptions {
  extensions: string[] | null
  ignorePatterns: string[]
}

export type ContentReader = (filePath: string) => Promise<string>

// ─── JSDoc parsing ──────────────────────────────────────

export interface JSDocResult {
  description: string
  params: Array<{ name: string; type: string; description: string }>
  returns: string
  examples: string[]
  since: string
  deprecated: boolean
  see: string[]
}

/**
 * Parse a JSDoc comment block into structured data.
 *
 * @example
 * ```ts
 * const jsdoc = parseJSDoc('/** Adds two numbers. @param a first *\\/')
 * jsdoc.description // 'Adds two numbers.'
 * ```
 */
export function parseJSDoc(comment: string): JSDocResult {
  const result: JSDocResult = {
    deprecated: false,
    description: '',
    examples: [],
    params: [],
    returns: '',
    see: [],
    since: '',
  }

  if (!comment) return result

  const cleaned = comment
    .replace(/^\/\*\*?/, '')
    .replace(/\*\/$/, '')
    .split('\n')
    .map((line) => line.replace(/^\s*\*\s?/, ''))
    .join('\n')

  const lines = cleaned.split('\n')
  const descLines: string[] = []
  let currentExample = ''
  let inExample = false

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed.startsWith('@param')) {
      const paramMatch = trimmed.match(/^@param\s+(?:\{([^}]*)\}\s+)?(\w+)(?:\s+-?\s*(.*))?$/)
      if (paramMatch) {
        result.params.push({
          description: paramMatch[3] ?? '',
          name: paramMatch[2] ?? '',
          type: paramMatch[1] ?? '',
        })
      }
      continue
    }

    if (trimmed.startsWith('@returns') || trimmed.startsWith('@return')) {
      result.returns = trimmed.replace(/^@returns?\s*(?:\{[^}]*\}\s*)?/, '').trim()
      continue
    }

    if (trimmed.startsWith('@example')) {
      inExample = true
      currentExample = ''
      continue
    }

    if (trimmed.startsWith('@since')) {
      result.since = trimmed.replace('@since', '').trim()
      continue
    }

    if (trimmed.startsWith('@deprecated')) {
      result.deprecated = true
      continue
    }

    if (trimmed.startsWith('@see')) {
      result.see.push(trimmed.replace('@see', '').trim())
      continue
    }

    if (trimmed.startsWith('@')) {
      inExample = false
      if (currentExample) {
        result.examples.push(currentExample.trim())
        currentExample = ''
      }
      continue
    }

    if (inExample) {
      currentExample += (currentExample ? '\n' : '') + trimmed
    } else {
      descLines.push(trimmed)
    }
  }

  if (currentExample) {
    result.examples.push(currentExample.trim())
  }

  result.description = descLines.join('\n').trim()
  return result
}

// ─── Parameter parsing ──────────────────────────────────

/**
 * Extract parameter names, types, optional flags from a function signature string.
 *
 * @example
 * ```ts
 * const params = parseParameters('(a: number, b?: string = "hi")')
 * params[1]?.optional // true
 * ```
 */
export function parseParameters(signature: string): ParamInfo[] {
  const params: ParamInfo[] = []
  const match = signature.match(/\(([^)]*)\)/)
  if (!match) return params

  const paramStr = match[1] ?? ''
  if (!paramStr.trim()) return params

  const parts = splitParams(paramStr)
  for (const part of parts) {
    const trimmed = part.trim()
    if (!trimmed || trimmed === '...') continue

    const optional = trimmed.includes('?') || trimmed.includes('=')
    const cleanName = trimmed
      .replace(/\?\s*:/, ':')
      .replace(/\?\s*,/, ',')
      .replace(/\?\s*$/, '')
    const nameMatch = cleanName.match(/^(\w+)/)
    const name = nameMatch?.[1] ?? trimmed.split(':')[0]?.trim() ?? ''

    const typeMatch = cleanName.match(/:\s*([^=]+)/)
    const type = typeMatch?.[1]?.trim() ?? 'unknown'

    const defaultMatch = trimmed.match(/=\s*(.+)$/)
    const default_value = defaultMatch?.[1]?.trim() ?? null

    params.push({ default_value, description: '', name, optional, type })
  }

  return params
}

function splitParams(str: string): string[] {
  const parts: string[] = []
  let depth = 0
  let current = ''
  for (const ch of str) {
    if (ch === '(' || ch === '<' || ch === '{' || ch === '[') depth++
    else if (ch === ')' || ch === '>' || ch === '}' || ch === ']') depth--
    if (ch === ',' && depth === 0) {
      parts.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  if (current.trim()) parts.push(current)
  return parts
}

// ─── Function extraction ────────────────────────────────

const FUNC_REGEX = /(?:\/\/[^\n]*\n|\/\*\*[\s\S]*?\*\/\n)?(export\s+(?:async\s+)?function\s+(\w+)\s*([^{]*))/g

/**
 * Extract exported functions with signatures and JSDoc from source content.
 *
 * @example
 * ```ts
 * const fns = extractFunctions('export function add(a: number): number { return a }', 'math.ts')
 * fns[0]?.name // 'add'
 * ```
 */
export function extractFunctions(content: string, filePath: string): ApiFunction[] {
  const functions: ApiFunction[] = []
  const lines = content.split('\n')

  let match: RegExpExecArray | null
  const regex = new RegExp(FUNC_REGEX.source, 'g')
  while ((match = regex.exec(content)) !== null) {
    const fullMatch = match[0] ?? ''
    const name = match[2] ?? ''
    const sigPart = match[3] ?? ''
    const pos = match.index
    const exportPos = fullMatch.indexOf('export')
    const effectivePos = exportPos >= 0 ? pos + exportPos : pos
    const exportType: 'named' | 'default' = fullMatch.includes('export default') ? 'default' : 'named'
    const signature = `function ${name}${sigPart.trim()}`
    const line = content.slice(0, pos).split('\n').length
    const parameters = sigPart.includes('(')
      ? parseParameters(sigPart)
      : []

    const returnTypeMatch = sigPart.match(/\)\s*:\s*([^{]+)/)
    const returnType = returnTypeMatch?.[1]?.trim() ?? 'void'

    const jsdoc = extractPrecedingJSDoc(content, effectivePos)
    const parsed = parseJSDoc(jsdoc)

    functions.push({
      deprecated: parsed.deprecated,
      description: parsed.description,
      examples: parsed.examples,
      exportType,
      file: filePath,
      line,
      name,
      parameters,
      returnType,
      see: parsed.see,
      since: parsed.since,
      signature,
    })
  }

  return functions
}

// ─── Class extraction ───────────────────────────────────

/**
 * Extract exported classes with methods and properties.
 *
 * @example
 * ```ts
 * const classes = extractClasses('export class Foo { bar() {} }', 'foo.ts')
 * classes[0]?.name // 'Foo'
 * ```
 */
export function extractClasses(content: string, filePath: string): ApiClass[] {
  const classes: ApiClass[] = []

  const classRegex = /(\/\*\*[\s\S]*?\*\/\n)?export\s+(?:default\s+)?class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+([\w,\s]+))?\s*\{/g

  let match: RegExpExecArray | null
  while ((match = classRegex.exec(content)) !== null) {
    const jsdocComment = match[1] ?? ''
    const name = match[2] ?? ''
    const extendsClass = match[3] ?? ''
    const implementsStr = match[4] ?? ''
    const pos = match.index
    const line = content.slice(0, pos).split('\n').length
    const exportType: 'named' | 'default' = (match[0] ?? '').includes('export default') ? 'default' : 'named'

    const parsed = parseJSDoc(jsdocComment)

    const body = extractClassBody(content, pos + (match[0]?.length ?? 0) - 1)
    const methods = extractClassMethods(body, filePath)
    const properties = extractClassProperties(body)

    classes.push({
      deprecated: parsed.deprecated,
      description: parsed.description,
      examples: parsed.examples,
      exportType,
      extends: extendsClass,
      file: filePath,
      implements: implementsStr.split(',').map((s) => s.trim()).filter(Boolean),
      line,
      methods,
      name,
      properties,
      see: parsed.see,
      since: parsed.since,
    })
  }

  return classes
}

function extractClassBody(content: string, openBracePos: number): string {
  let depth = 0
  let start = -1
  for (let i = openBracePos; i < content.length; i++) {
    if (content[i] === '{') {
      if (depth === 0) start = i + 1
      depth++
    } else if (content[i] === '}') {
      depth--
      if (depth === 0) {
        return content.slice(start, i)
      }
    }
  }
  return content.slice(start ?? openBracePos)
}

function extractClassMethods(body: string, filePath: string): ApiFunction[] {
  const methods: ApiFunction[] = []
  const methodRegex = /(?:(?:public|private|protected|static|override|async)\s+)*(\w+)\s*\(([^)]*)\)(?:\s*:\s*([^{]+))?\s*(?:\{|=>)/g

  let match: RegExpExecArray | null
  while ((match = methodRegex.exec(body)) !== null) {
    const name = match[1] ?? ''
    if (name === 'constructor') continue
    if (name.startsWith('//')) continue

    const paramStr = match[2] ?? ''
    const returnType = match[3]?.trim() ?? 'void'

    methods.push({
      deprecated: false,
      description: '',
      examples: [],
      exportType: 'named',
      file: filePath,
      line: 0,
      name,
      parameters: parseParameters(`(${paramStr})`),
      returnType,
      see: [],
      since: '',
      signature: `${name}(${paramStr}): ${returnType}`,
    })
  }
  return methods
}

function extractClassProperties(body: string): PropertyInfo[] {
  const props: PropertyInfo[] = []
  const propRegex = /(?:(public|private|protected)\s+)?(?:(readonly)\s+)?(\w+)(?:\?\s*)?(?::\s*([^=;\n]+))?/g

  let match: RegExpExecArray | null
  while ((match = propRegex.exec(body)) !== null) {
    const access = (match[1] ?? 'public') as 'public' | 'private' | 'protected'
    const readonly = match[2] === 'readonly'
    const name = match[3] ?? ''
    const type = match[4]?.trim() ?? 'unknown'

    if (name === 'constructor' || name.startsWith('//') || /^[A-Z]/.test(name) && !readonly) continue
    if (/^(public|private|protected|readonly|static|override|async|return|if|else|for|while|class|function|const|let|var|new|this|super)$/.test(name)) continue

    props.push({ access, description: '', name, readonly, type })
  }
  return props
}

// ─── Interface extraction ───────────────────────────────

/**
 * Extract exported interfaces with properties.
 *
 * @example
 * ```ts
 * const ifaces = extractInterfaces('export interface User { name: string }', 'types.ts')
 * ifaces[0]?.name // 'User'
 * ```
 */
export function extractInterfaces(content: string, filePath: string): ApiInterface[] {
  const interfaces: ApiInterface[] = []
  const ifaceRegex = /(?:\/\/[^\n]*\n|\/\*\*[\s\S]*?\*\/\n)?export\s+interface\s+(\w+)(?:\s+extends\s+([\w,\s]+))?\s*\{/g

  let match: RegExpExecArray | null
  while ((match = ifaceRegex.exec(content)) !== null) {
    const name = match[1] ?? ''
    const extendsStr = match[2] ?? ''
    const pos = match.index
    const fullMatch = match[0] ?? ''
    const exportOffset = fullMatch.indexOf('export')
    const effectivePos = exportOffset >= 0 ? pos + exportOffset : pos
    const line = content.slice(0, pos).split('\n').length

    const jsdoc = extractPrecedingJSDoc(content, effectivePos)
    const parsed = parseJSDoc(jsdoc)

    const body = extractClassBody(content, content.indexOf('{', pos))
    const properties = extractInterfaceProperties(body)

    interfaces.push({
      description: parsed.description,
      extends: extendsStr.split(',').map((s) => s.trim()).filter(Boolean),
      file: filePath,
      line,
      name,
      properties,
    })
  }

  return interfaces
}

function extractInterfaceProperties(body: string): PropertyInfo[] {
  const props: PropertyInfo[] = []
  for (const line of body.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*')) continue
    const propMatch = trimmed.match(/^(readonly\s+)?(\w+)(\?)?(?:\s*:\s*(.+?))?[,;]?\s*$/)
    if (propMatch) {
      props.push({
        access: 'public',
        description: '',
        name: propMatch[2] ?? '',
        readonly: propMatch[1] === 'readonly ',
        type: propMatch[4]?.trim() ?? 'unknown',
      })
    }
  }
  return props
}

// ─── Type extraction ────────────────────────────────────

/**
 * Extract exported type aliases.
 *
 * @example
 * ```ts
 * const types = extractTypes("export type Result = 'ok' | 'err'", 'types.ts')
 * types[0]?.name // 'Result'
 * ```
 */
export function extractTypes(content: string, filePath: string): ApiType[] {
  const types: ApiType[] = []
  const typeRegex = /(?:\/\/[^\n]*\n|\/\*\*[\s\S]*?\*\/\n)?export\s+type\s+(\w+)\s*=\s*([^;]+);?/g

  let match: RegExpExecArray | null
  while ((match = typeRegex.exec(content)) !== null) {
    const name = match[1] ?? ''
    const definition = match[2]?.trim() ?? ''
    const pos = match.index
    const fullMatch = match[0] ?? ''
    const exportOffset = fullMatch.indexOf('export')
    const effectivePos = exportOffset >= 0 ? pos + exportOffset : pos
    const line = content.slice(0, pos).split('\n').length

    const jsdoc = extractPrecedingJSDoc(content, effectivePos)
    const parsed = parseJSDoc(jsdoc)

    types.push({ definition, description: parsed.description, file: filePath, line, name })
  }

  return types
}

// ─── Constant extraction ────────────────────────────────

/**
 * Extract exported const declarations.
 *
 * @example
 * ```ts
 * const consts = extractConstants("export const MAX = 100", 'config.ts')
 * consts[0]?.name // 'MAX'
 * ```
 */
export function extractConstants(content: string, filePath: string): ApiConst[] {
  const constants: ApiConst[] = []
  const constRegex = /(?:\/\/[^\n]*\n|\/\*\*[\s\S]*?\*\/\n)?export\s+const\s+(\w+)(?::\s*([^=]+))?\s*=\s*([^\n;]+)/g

  let match: RegExpExecArray | null
  while ((match = constRegex.exec(content)) !== null) {
    const name = match[1] ?? ''
    const type = match[2]?.trim() ?? 'unknown'
    const value = match[3]?.trim() ?? ''
    const pos = match.index
    const fullMatch = match[0] ?? ''
    const exportOffset = fullMatch.indexOf('export')
    const effectivePos = exportOffset >= 0 ? pos + exportOffset : pos
    const line = content.slice(0, pos).split('\n').length

    const jsdoc = extractPrecedingJSDoc(content, effectivePos)
    const parsed = parseJSDoc(jsdoc)

    constants.push({
      description: parsed.description,
      exported: true,
      file: filePath,
      line,
      name,
      type,
      value,
    })
  }

  return constants
}

// ─── JSDoc helper ───────────────────────────────────────

function extractPrecedingJSDoc(content: string, pos: number): string {
  const before = content.slice(0, pos)
  const lastJsdocEnd = before.lastIndexOf('*/')
  if (lastJsdocEnd === -1) return ''
  const jsdocStart = before.lastIndexOf('/**', lastJsdocEnd)
  if (jsdocStart === -1) return ''

  const between = before.slice(lastJsdocEnd + 2, pos)
  const nonCommentLines = between.split('\n').filter((l) => l.trim() && !l.trim().startsWith('//'))
  if (nonCommentLines.length > 2) return ''

  return before.slice(jsdocStart, lastJsdocEnd + 2)
}

// ─── Stats ──────────────────────────────────────────────

/**
 * Compute documentation stats across all modules.
 *
 * @example
 * ```ts
 * const stats = computeApiDocsStats(modules)
 * stats.documentationCoverage // 0.75
 * ```
 */
export function computeApiDocsStats(modules: ApiModule[]): ApiDocsStats {
  let totalFunctions = 0
  let totalClasses = 0
  let totalInterfaces = 0
  let totalTypes = 0
  let totalConstants = 0
  let documentedItems = 0
  let undocumentedItems = 0

  for (const mod of modules) {
    totalFunctions += mod.functions.length
    totalClasses += mod.classes.length
    totalInterfaces += mod.interfaces.length
    totalTypes += mod.types.length
    totalConstants += mod.constants.length

    for (const fn of mod.functions) {
      if (fn.description) documentedItems++
      else undocumentedItems++
    }
    for (const cls of mod.classes) {
      if (cls.description) documentedItems++
      else undocumentedItems++
      for (const m of cls.methods) {
        if (m.description) documentedItems++
        else undocumentedItems++
      }
    }
    for (const iface of mod.interfaces) {
      if (iface.description) documentedItems++
      else undocumentedItems++
    }
    for (const tp of mod.types) {
      if (tp.description) documentedItems++
      else undocumentedItems++
    }
    for (const c of mod.constants) {
      if (c.description) documentedItems++
      else undocumentedItems++
    }
  }

  const total = documentedItems + undocumentedItems
  const documentationCoverage = total > 0 ? Math.round((documentedItems / total) * 100) : 100

  return {
    documentedItems,
    documentationCoverage,
    totalClasses,
    totalConstants,
    totalFunctions,
    totalInterfaces,
    totalModules: modules.length,
    totalTypes,
    undocumentedItems,
  }
}

// ─── Build result ───────────────────────────────────────

/**
 * Orchestrate full API documentation extraction.
 *
 * @example
 * ```ts
 * const result = await buildApiDocsResult(['src/app.ts'], reader, { extensions: null, ignorePatterns: [] })
 * result.stats.totalFunctions // number
 * ```
 */
export async function buildApiDocsResult(
  filePaths: string[],
  contentReader: ContentReader,
  options: ApiDocsOptions,
): Promise<ApiDocsResult> {
  const modules: ApiModule[] = []

  for (const filePath of filePaths) {
    if (options.extensions) {
      const ext = filePath.slice(filePath.lastIndexOf('.')).toLowerCase()
      if (!options.extensions.includes(ext)) continue
    }

    try {
      const content = await contentReader(filePath)

      const mod: ApiModule = {
        classes: extractClasses(content, filePath),
        constants: extractConstants(content, filePath),
        description: extractModuleDescription(content),
        file: filePath,
        functions: extractFunctions(content, filePath),
        interfaces: extractInterfaces(content, filePath),
        path: filePath,
        types: extractTypes(content, filePath),
      }

      modules.push(mod)
    } catch {
      // skip unreadable files
    }
  }

  const stats = computeApiDocsStats(modules)
  return { modules, stats }
}

function extractModuleDescription(content: string): string {
  const firstJsdoc = content.match(/^\/\*\*([\s\S]*?)\*\//)
  if (firstJsdoc) {
    const parsed = parseJSDoc(firstJsdoc[0])
    return parsed.description
  }
  return ''
}
