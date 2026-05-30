import { basename } from 'node:path'

// ─── Types ──────────────────────────────────────────────

export type ContentReader = (filePath: string) => Promise<string>
export type SortBy = 'complexity' | 'name' | 'params'

export interface ParamDetail {
  name: string
  type: string
  optional: boolean
  hasDefault: boolean
  isRest: boolean
  isDestructured: boolean
  destructuredKeys: string[]
}

export interface SignatureInfo {
  name: string
  file: string
  line: number
  parameters: ParamDetail[]
  returnType: string
  isAsync: boolean
  isExported: boolean
  isGeneric: boolean
  genericParams: string[]
  hasOptionalParams: boolean
  hasRestParams: boolean
  hasDefaultValues: boolean
  hasDestructuring: boolean
  signature: string
  complexity: number
  suggestions: string[]
}

export interface SignatureStats {
  totalFunctions: number
  exportedFunctions: number
  asyncFunctions: number
  genericFunctions: number
  avgParamCount: number
  maxParamCount: number
  functionsWithRestParams: number
  functionsWithDestructuring: number
  functionsWithOptionalParams: number
  complexSignatures: number
  paramDistribution: Record<string, number>
}

export interface SignaturesResult {
  signatures: SignatureInfo[]
  stats: SignatureStats
}

export interface SignaturesOptions {
  sort?: SortBy
  verbose?: boolean
}

// ─── parseParameter ─────────────────────────────────────

/**
 * @example
 * const param = parseParameter('name: string')
 * console.log(param.name)
 */
export function parseParameter(paramText: string): ParamDetail {
  const trimmed = paramText.trim()

  const isRest = trimmed.startsWith('...')
  const isDestructured = trimmed.startsWith('{') || trimmed.startsWith('{')

  let name = ''
  let type = ''
  let optional = false
  let hasDefault = false
  const destructuredKeys: string[] = []

  if (isDestructured) {
    const braceMatch = trimmed.match(/\{([^}]*)\}/)
    if (braceMatch) {
      const inner = braceMatch[1]
      if (inner) {
        const keys = inner.split(',').map((k) => {
          const part = k.trim().split(':')[0] ?? ''
          return (part.split('=')[0] ?? '').trim()
        }).filter(Boolean)
        destructuredKeys.push(...keys)
      }
    }
    const afterBrace = trimmed.replace(/\{[^}]*\}/, '').trim()
    const colonIdx = afterBrace.indexOf(':')
    if (colonIdx > 0) {
      name = trimmed.substring(0, trimmed.indexOf(':') > 0 ? trimmed.indexOf('{') : trimmed.length)
      type = afterBrace.substring(colonIdx + 1).replace(/\?.*$/, '').replace(/\s*=\s*.*$/, '').trim()
    } else {
      name = trimmed.replace(/\{[^}]*\}/, 'destructured').replace(/[?:].*$/, '').trim()
    }
    optional = trimmed.includes('?') || trimmed.includes('=')
    hasDefault = trimmed.includes('=')
  } else {
    const restStripped = isRest ? trimmed.substring(3) : trimmed

    const eqIdx = restStripped.indexOf('=')
    hasDefault = eqIdx > 0

    const beforeDefault = hasDefault ? restStripped.substring(0, eqIdx).trim() : restStripped.trim()

    const colonIdx = beforeDefault.indexOf(':')
    if (colonIdx > 0) {
      name = beforeDefault.substring(0, colonIdx).trim()
      type = beforeDefault.substring(colonIdx + 1).trim()
    } else {
      const questionIdx = beforeDefault.indexOf('?')
      if (questionIdx > 0) {
        name = beforeDefault.substring(0, questionIdx).trim()
      } else {
        name = beforeDefault.trim()
      }
    }

    optional = beforeDefault.includes('?')
  }

  name = name.replace(/\?/g, '').trim()
  type = type.replace(/\?/g, '').trim()

  return {
    destructuredKeys,
    hasDefault,
    isDestructured,
    isRest,
    name: name || 'unknown',
    optional,
    type: type || 'unknown',
  }
}

// ─── extractSignatures ──────────────────────────────────

/**
 * @example
 * const sigs = extractSignatures('function hello(name: string): void', 'test.ts')
 * console.log(sigs[0].name)
 */
export function extractSignatures(content: string, filePath: string): SignatureInfo[] {
  const signatures: SignatureInfo[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line) continue
    const lineNum = i + 1

    const exported = line.includes('export')

    const asyncFunc = line.match(/(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s+(\w+)\s*<([^>]*)>\s*\(([^)]*)\)\s*(?::\s*([^{]+?))?\s*\{/)
    if (asyncFunc) {
      const sig = buildSignature(asyncFunc[1] ?? '', asyncFunc[3] ?? '', asyncFunc[4] ?? '', line.trim(), filePath, lineNum, {
        isAsync: line.includes('async'),
        isExported: exported,
        isGeneric: true,
        genericParamsRaw: asyncFunc[2],
      })
      signatures.push(sig)
      continue
    }

    const regularFunc = line.match(/(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)\s*(?::\s*([^{]+?))?\s*\{/)
    if (regularFunc) {
      const sig = buildSignature(regularFunc[1] ?? '', regularFunc[2] ?? '', regularFunc[3] ?? '', line.trim(), filePath, lineNum, {
        isAsync: line.includes('async'),
        isExported: exported,
        isGeneric: false,
      })
      signatures.push(sig)
      continue
    }

    const arrowGeneric = line.match(/(?:export\s+)?(?:const|let|var)\s+(\w+)\s*(?::\s*([^=]+?))?\s*=\s*(?:async\s+)?\s*<([^>]*)>\s*\(([^)]*)\)\s*(?::\s*([^=]+?))?\s*=>/)
    if (arrowGeneric) {
      const sig = buildSignature(arrowGeneric[1] ?? '', arrowGeneric[4] ?? '', arrowGeneric[5] ?? arrowGeneric[2] ?? '', line.trim(), filePath, lineNum, {
        isAsync: line.includes('async'),
        isExported: exported,
        isGeneric: true,
        genericParamsRaw: arrowGeneric[3],
      })
      signatures.push(sig)
      continue
    }

    const arrow = line.match(/(?:export\s+)?(?:const|let|var)\s+(\w+)\s*(?::\s*([^=]+?))?\s*=\s*(?:async\s+)?\(([^)]*)\)\s*(?::\s*([^=]+?))?\s*=>/)
    if (arrow) {
      const sig = buildSignature(arrow[1] ?? '', arrow[3] ?? '', arrow[4] ?? arrow[2] ?? '', line.trim(), filePath, lineNum, {
        isAsync: line.includes('async'),
        isExported: exported,
        isGeneric: false,
      })
      signatures.push(sig)
      continue
    }

    const methodMatch = line.match(/(?:(?:public|private|protected|static|readonly|abstract|override)\s+)*(?:async\s+)?(\w+)\s*<([^>]*)>\s*\(([^)]*)\)\s*(?::\s*([^{;]+?))?\s*[\{;]/)
    if (methodMatch && !line.includes('function') && !line.includes('=>') && !line.includes('class ')) {
      const sig = buildSignature(methodMatch[1] ?? '', methodMatch[3] ?? '', methodMatch[4] ?? '', line.trim(), filePath, lineNum, {
        isAsync: line.includes('async'),
        isExported: false,
        isGeneric: true,
        genericParamsRaw: methodMatch[2],
      })
      signatures.push(sig)
      continue
    }

    const method = line.match(/(?:(?:public|private|protected|static|readonly|abstract|override)\s+)*(?:async\s+)?(\w+)\s*\(([^)]*)\)\s*(?::\s*([^{;]+?))?\s*[\{;]/)
    if (method && !line.includes('function') && !line.includes('=>') && !line.includes('class ') && !line.includes('interface ') && !line.includes('if (') && !line.includes('for (') && !line.includes('while (') && !line.includes('switch (') && !line.includes('catch (')) {
      const sig = buildSignature(method[1] ?? '', method[2] ?? '', method[3] ?? '', line.trim(), filePath, lineNum, {
        isAsync: line.includes('async'),
        isExported: exported,
        isGeneric: false,
      })
      signatures.push(sig)
      continue
    }
  }

  return signatures
}

interface SigBuildOpts {
  isAsync: boolean
  isExported: boolean
  isGeneric: boolean
  genericParamsRaw?: string
}

function buildSignature(
  name: string,
  paramsText: string,
  returnTypeRaw: string,
  signatureLine: string,
  file: string,
  line: number,
  opts: SigBuildOpts,
): SignatureInfo {
  const parameters = splitParams(paramsText).map(parseParameter)
  const returnType = returnTypeRaw.trim().replace(/\s+/g, ' ') || 'void'
  const genericParams = opts.genericParamsRaw
    ? opts.genericParamsRaw.split(',').map((s: string) => (s.trim().split(/\s+extends\s+/)[0] ?? '').trim()).filter(Boolean)
    : []

  const hasOptionalParams = parameters.some((p) => p.optional)
  const hasRestParams = parameters.some((p) => p.isRest)
  const hasDefaultValues = parameters.some((p) => p.hasDefault)
  const hasDestructuring = parameters.some((p) => p.isDestructured)

  const complexity = computeSignatureComplexity({
    isAsync: opts.isAsync,
    isGeneric: opts.isGeneric,
    parameters,
  } as SignatureInfo)

  const suggestions = generateSignatureSuggestions({
    genericParams,
    hasDestructuring,
    isAsync: opts.isAsync,
    isGeneric: opts.isGeneric,
    name,
    parameters,
  } as SignatureInfo)

  return {
    complexity,
    file,
    genericParams,
    hasDefaultValues,
    hasDestructuring,
    hasOptionalParams,
    hasRestParams,
    isAsync: opts.isAsync,
    isExported: opts.isExported,
    isGeneric: opts.isGeneric,
    line,
    name,
    parameters,
    returnType,
    signature: signatureLine,
    suggestions,
  }
}

function splitParams(text: string): string[] {
  if (!text.trim()) return []

  const params: string[] = []
  let depth = 0
  let current = ''

  for (const ch of text) {
    if (ch === '(' || ch === '{' || ch === '[' || ch === '<') depth++
    else if (ch === ')' || ch === '}' || ch === ']' || ch === '>') depth--

    if (ch === ',' && depth === 0) {
      params.push(current)
      current = ''
    } else {
      current += ch
    }
  }

  if (current.trim()) params.push(current)

  return params
}

// ─── computeSignatureComplexity ──────────────────────────

/**
 * @example
 * const score = computeSignatureComplexity(sig)
 * console.log(score)
 */
export function computeSignatureComplexity(sig: SignatureInfo): number {
  let score = sig.parameters.length
  score += sig.parameters.filter((p) => p.isDestructured).length * 2
  if (sig.isGeneric) score += 1
  if (sig.hasRestParams) score += 1
  if (sig.isAsync) score += 1
  return score
}

// ─── generateSignatureSuggestions ────────────────────────

/**
 * @example
 * const tips = generateSignatureSuggestions(sig)
 * console.log(tips[0])
 */
export function generateSignatureSuggestions(sig: SignatureInfo): string[] {
  const suggestions: string[] = []

  if (sig.parameters.length > 5) {
    suggestions.push('Consider using an options object')
  }

  const destructureKeys = sig.parameters.filter((p) => p.isDestructured).flatMap((p) => p.destructuredKeys)
  if (destructureKeys.length > 3) {
    suggestions.push('Extract destructured params to interface')
  }

  if (sig.genericParams && sig.genericParams.length > 3) {
    suggestions.push('Simplify type parameters')
  }

  const booleans = sig.parameters.filter((p) => p.type === 'boolean')
  if (booleans.length >= 2) {
    suggestions.push('Use options object instead of multiple booleans')
  }

  return suggestions
}

// ─── computeSignatureStats ──────────────────────────────

/**
 * @example
 * const stats = computeSignatureStats(sigs)
 * console.log(stats.totalFunctions)
 */
export function computeSignatureStats(signatures: SignatureInfo[]): SignatureStats {
  const totalFunctions = signatures.length
  const exportedFunctions = signatures.filter((s) => s.isExported).length
  const asyncFunctions = signatures.filter((s) => s.isAsync).length
  const genericFunctions = signatures.filter((s) => s.isGeneric).length
  const paramCounts = signatures.map((s) => s.parameters.length)
  const maxParamCount = paramCounts.length > 0 ? Math.max(...paramCounts) : 0
  const avgParamCount = paramCounts.length > 0
    ? Math.round((paramCounts.reduce((a, b) => a + b, 0) / paramCounts.length) * 10) / 10
    : 0

  const paramDistribution: Record<string, number> = {}
  for (const c of paramCounts) {
    const key = String(c)
    paramDistribution[key] = (paramDistribution[key] ?? 0) + 1
  }

  return {
    asyncFunctions,
    avgParamCount,
    complexSignatures: signatures.filter((s) => s.complexity > 5).length,
    exportedFunctions,
    functionsWithDestructuring: signatures.filter((s) => s.hasDestructuring).length,
    functionsWithOptionalParams: signatures.filter((s) => s.hasOptionalParams).length,
    functionsWithRestParams: signatures.filter((s) => s.hasRestParams).length,
    genericFunctions,
    maxParamCount,
    paramDistribution,
    totalFunctions,
  }
}

// ─── buildSignaturesResult ──────────────────────────────

/**
 * @example
 * const result = await buildSignaturesResult(files, reader, { sort: 'complexity' })
 * console.log(result.stats.totalFunctions)
 */
export async function buildSignaturesResult(
  files: string[],
  contentReader: ContentReader,
  options?: SignaturesOptions,
): Promise<SignaturesResult> {
  const allSignatures: SignatureInfo[] = []

  for (const file of files) {
    try {
      const content = await contentReader(file)
      const sigs = extractSignatures(content, file)
      allSignatures.push(...sigs)
    } catch {
      continue
    }
  }

  const sort = options?.sort ?? 'name'
  if (sort === 'complexity') {
    allSignatures.sort((a, b) => b.complexity - a.complexity)
  } else if (sort === 'params') {
    allSignatures.sort((a, b) => b.parameters.length - a.parameters.length)
  } else {
    allSignatures.sort((a, b) => a.name.localeCompare(b.name))
  }

  const stats = computeSignatureStats(allSignatures)

  return { signatures: allSignatures, stats }
}

// ─── sourceBaseName ─────────────────────────────────────

/**
 * @example
 * const base = sourceBaseName('src/signatures-helpers.ts')
 * console.log(base)
 */
export function sourceBaseName(filePath: string): string {
  return basename(filePath).replace(/\.ts$/, '')
}
