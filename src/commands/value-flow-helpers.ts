// ─── Types ────────────────────────────────────────────────────────────────────

export interface ValueSource {
  name: string
  file: string
  line: number
  type: 'parameter' | 'import' | 'env-var' | 'config' | 'literal' | 'user-input'
  dataType: string
  flowsTo: string[]
}

export interface ValueTransform {
  input: string
  output: string
  file: string
  line: number
  type: 'assignment' | 'function-call' | 'method-call' | 'map' | 'filter' | 'reduce' | 'parse' | 'serialize'
  description: string
}

export interface ValueSink {
  name: string
  file: string
  line: number
  type: 'return' | 'export' | 'side-effect' | 'console' | 'file-write' | 'network'
  sources: string[]
}

export interface ValueFlowStep {
  name: string
  file: string
  line: number
  type: string
}

export interface ValueFlow {
  chain: ValueFlowStep[]
  source: ValueSource
  sink: ValueSink | null
  length: number
  isDeadEnd: boolean
  hasValidation: boolean
  hasErrorHandling: boolean
}

export interface ValueFlowStats {
  totalSources: number
  totalTransforms: number
  totalSinks: number
  deadEndCount: number
  untracedCount: number
  averageFlowLength: number
  longestFlow: number
  validationCoverage: number
  errorHandlingCoverage: number
}

export interface ValueFlowResult {
  sources: ValueSource[]
  transforms: ValueTransform[]
  sinks: ValueSink[]
  flows: ValueFlow[]
  deadEnds: ValueFlow[]
  untraced: ValueFlow[]
  stats: ValueFlowStats
  recommendations: string[]
}

export interface ValueFlowOptions {
  verbose?: boolean
}

// ─── extractSources ───────────────────────────────────────────────────────────

/**
 * Find value origins: parameters, imports, env vars, config reads.
 *
 * @example
 * extractSources('import fs from "fs"', 'a.ts') // [ValueSource]
 */
export function extractSources(content: string, filePath: string): ValueSource[] {
  const sources: ValueSource[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!

    const importMatch = line.match(/import\s+(?:(\w+)|\{([^}]+)\}|\*\s+as\s+(\w+))\s+from\s+['"]([^'"]+)['"]/)
    if (importMatch) {
      const name = importMatch[1] ?? importMatch[3] ?? importMatch[2]?.split(',')[0]?.trim()
      if (name) {
        sources.push({
          name, file: filePath, line: i + 1,
          type: 'import', dataType: 'module', flowsTo: [],
        })
      }
      const destructured = importMatch[2]
      if (destructured) {
        for (const part of destructured.split(',')) {
          const trimmed = part.trim()
          if (trimmed && trimmed !== name) {
            sources.push({
              name: trimmed, file: filePath, line: i + 1,
              type: 'import', dataType: 'module', flowsTo: [],
            })
          }
        }
      }
      continue
    }

    const requireMatch = line.match(/(?:const|let|var)\s+(\w+)\s*=\s*require\s*\(\s*['"]([^'"]+)['"]\s*\)/)
    if (requireMatch) {
      sources.push({
        name: requireMatch[1]!, file: filePath, line: i + 1,
        type: 'import', dataType: 'module', flowsTo: [],
      })
      continue
    }

    const envMatch = line.match(/process\.env\.(\w+)/g)
    if (envMatch) {
      for (const em of envMatch) {
        const varName = em.replace('process.env.', '')
        sources.push({
          name: varName, file: filePath, line: i + 1,
          type: 'env-var', dataType: 'string', flowsTo: [],
        })
      }
      continue
    }

    const paramMatch = line.match(/function\s+\w+\s*\(([^)]*)\)/)
    if (paramMatch) {
      const params = paramMatch[1]!.split(',').map((p) => p.trim()).filter((p) => p && !p.startsWith('//'))
      for (const param of params) {
        const cleanName = param.split(':')[0]!.split('=')[0]!.trim().replace(/[{}[\]]/g, '')
        if (cleanName && /^[$a-zA-Z_]/.test(cleanName)) {
          sources.push({
            name: cleanName, file: filePath, line: i + 1,
            type: 'parameter', dataType: 'unknown', flowsTo: [],
          })
        }
      }
    }

    const arrowParamMatch = line.match(/(?:const|let)\s+\w+\s*=\s*(?:async\s*)?\(([^)]*)\)\s*=>/)
    if (arrowParamMatch) {
      const params = arrowParamMatch[1]!.split(',').map((p) => p.trim()).filter((p) => p)
      for (const param of params) {
        const cleanName = param.split(':')[0]!.split('=')[0]!.trim().replace(/[{}[\]]/g, '')
        if (cleanName && /^[$a-zA-Z_]/.test(cleanName)) {
          sources.push({
            name: cleanName, file: filePath, line: i + 1,
            type: 'parameter', dataType: 'unknown', flowsTo: [],
          })
        }
      }
    }

    const configMatch = line.match(/(?:config|settings|options)\.(\w+)/g)
    if (configMatch) {
      for (const cm of configMatch) {
        const propName = cm.split('.')[1]!
        sources.push({
          name: `config.${propName}`, file: filePath, line: i + 1,
          type: 'config', dataType: 'unknown', flowsTo: [],
        })
      }
    }
  }

  return sources
}

// ─── extractTransforms ────────────────────────────────────────────────────────

/**
 * Find value transformations: assignments, function calls, map/filter/reduce.
 *
 * @example
 * extractTransforms('const y = x.map(fn)', 'a.ts') // [ValueTransform]
 */
export function extractTransforms(content: string, filePath: string): ValueTransform[] {
  const transforms: ValueTransform[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const trimmed = line.trim()
    if (trimmed.startsWith('//') || trimmed.startsWith('*')) continue

    const assignMatch = line.match(/(?:const|let|var)\s+(\w+)\s*=\s*(.+)/)
    if (assignMatch) {
      const output = assignMatch[1]!
      const rhs = assignMatch[2]!.trim()

      const mapMatch = rhs.match(/(\w+)\.map\s*\(/)
      if (mapMatch) {
        transforms.push({
          input: mapMatch[1]!, output, file: filePath, line: i + 1,
          type: 'map', description: `${mapMatch[1]}.map() → ${output}`,
        })
        continue
      }

      const filterMatch = rhs.match(/(\w+)\.filter\s*\(/)
      if (filterMatch) {
        transforms.push({
          input: filterMatch[1]!, output, file: filePath, line: i + 1,
          type: 'filter', description: `${filterMatch[1]}.filter() → ${output}`,
        })
        continue
      }

      const reduceMatch = rhs.match(/(\w+)\.reduce\s*\(/)
      if (reduceMatch) {
        transforms.push({
          input: reduceMatch[1]!, output, file: filePath, line: i + 1,
          type: 'reduce', description: `${reduceMatch[1]}.reduce() → ${output}`,
        })
        continue
      }

      const parseMatch = rhs.match(/JSON\.parse|parseInt|parseFloat|Number|Boolean/)
      if (parseMatch) {
        const inputVar = rhs.match(/\((\w+)/)
        transforms.push({
          input: inputVar ? inputVar[1]! : 'input', output, file: filePath, line: i + 1,
          type: 'parse', description: `parse → ${output}`,
        })
        continue
      }

      const fnCallMatch = rhs.match(/^(\w+)\s*\(/)
      if (fnCallMatch) {
        transforms.push({
          input: fnCallMatch[1]!, output, file: filePath, line: i + 1,
          type: 'function-call', description: `${fnCallMatch[1]}() → ${output}`,
        })
        continue
      }

      transforms.push({
        input: rhs.split('.')[0]?.split('(')[0]?.trim() ?? 'value', output, file: filePath, line: i + 1,
        type: 'assignment', description: `assign → ${output}`,
      })
      continue
    }

    const methodCallMatch = line.match(/(\w+)\.(\w+)\s*\(/)
    if (methodCallMatch && !['if', 'for', 'while', 'switch', 'catch', 'return'].includes(methodCallMatch[1]!)) {
      const objName = methodCallMatch[1]!
      const methodName = methodCallMatch[2]!
      if (['map', 'filter', 'reduce', 'forEach', 'find', 'some', 'every', 'sort'].includes(methodName)) {
        transforms.push({
          input: objName, output: `${objName}.${methodName}`, file: filePath, line: i + 1,
          type: 'method-call', description: `${objName}.${methodName}()`,
        })
      }
    }
  }

  return transforms
}

// ─── extractSinks ─────────────────────────────────────────────────────────────

/**
 * Find value destinations: returns, exports, console, file writes.
 *
 * @example
 * extractSinks('return x', 'a.ts') // [ValueSink]
 */
export function extractSinks(content: string, filePath: string): ValueSink[] {
  const sinks: ValueSink[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!

    const returnMatch = line.match(/\breturn\s+(.+)/)
    if (returnMatch) {
      const val = returnMatch[1]!.trim().replace(/[;}\s]+$/, '')
      sinks.push({
        name: `return:${val}`, file: filePath, line: i + 1,
        type: 'return', sources: [val.split('.')[0]!.split('(')[0]!.trim()],
      })
      continue
    }

    const exportMatch = line.match(/export\s+(?:default\s+)?(?:function|const|let|var|class)\s+(\w+)/)
    if (exportMatch) {
      sinks.push({
        name: exportMatch[1]!, file: filePath, line: i + 1,
        type: 'export', sources: [exportMatch[1]!],
      })
      continue
    }

    const consoleMatch = line.match(/console\.(log|warn|error|info|debug)\s*\((.+)/)
    if (consoleMatch) {
      const method = consoleMatch[1]!
      const arg = consoleMatch[2]!.split(',')[0]!.trim().replace(/[)]$/, '')
      sinks.push({
        name: `console.${method}`, file: filePath, line: i + 1,
        type: 'console', sources: [arg],
      })
      continue
    }

    const writeMatch = line.match(/(?:writeFile|writeFileSync|appendFile|appendFileSync)\s*\(\s*['"]/)
    if (writeMatch) {
      sinks.push({
        name: 'file-write', file: filePath, line: i + 1,
        type: 'file-write', sources: [],
      })
      continue
    }

    const fetchMatch = line.match(/fetch\s*\(\s*['"]/)
    if (fetchMatch) {
      sinks.push({
        name: 'network-request', file: filePath, line: i + 1,
        type: 'network', sources: [],
      })
    }
  }

  return sinks
}

// ─── traceFlow ────────────────────────────────────────────────────────────────

/**
 * Follow a value source through transformations to a sink.
 *
 * @example
 * traceFlow(source, transforms, sinks) // ValueFlow
 */
export function traceFlow(source: ValueSource, transforms: ValueTransform[], sinks: ValueSink[]): ValueFlow {
  const chain: ValueFlowStep[] = [
    { name: source.name, file: source.file, line: source.line, type: source.type },
  ]

  let currentName = source.name
  const visited = new Set<string>([source.name])
  let hasValidation = false
  let hasErrorHandling = false

  for (const t of transforms) {
    if (t.input === currentName || t.input === source.name) {
      if (visited.has(t.output)) continue
      visited.add(t.output)
      chain.push({ name: t.output, file: t.file, line: t.line, type: t.type })

      if (t.type === 'filter' || t.type === 'parse') hasValidation = true
      currentName = t.output
    }
  }

  let sink: ValueSink | null = null
  for (const s of sinks) {
    if (s.sources.some((src) => src === currentName || src === source.name)) {
      sink = s
      chain.push({ name: s.name, file: s.file, line: s.line, type: s.type })
      if (s.type === 'return' || s.type === 'export') hasErrorHandling = true
      break
    }
  }

  const isDeadEnd = sink === null

  return {
    chain, source, sink, length: chain.length,
    isDeadEnd, hasValidation, hasErrorHandling,
  }
}

// ─── detectDeadEnds ───────────────────────────────────────────────────────────

/**
 * Find values computed but never used (no sink).
 *
 * @example
 * detectDeadEnds(flows) // dead-end ValueFlow[]
 */
export function detectDeadEnds(flows: ValueFlow[]): ValueFlow[] {
  return flows.filter((f) => f.isDeadEnd)
}

// ─── detectUntraced ───────────────────────────────────────────────────────────

/**
 * Find values reaching sinks without validation or error handling.
 *
 * @example
 * detectUntraced(flows) // untraced ValueFlow[]
 */
export function detectUntraced(flows: ValueFlow[]): ValueFlow[] {
  return flows.filter((f) => !f.isDeadEnd && !f.hasValidation && !f.hasErrorHandling)
}

// ─── computeStats ─────────────────────────────────────────────────────────────

/**
 * Compute aggregate flow statistics.
 *
 * @example
 * computeStats(sources, transforms, sinks, flows) // ValueFlowStats
 */
export function computeStats(
  sources: ValueSource[],
  transforms: ValueTransform[],
  sinks: ValueSink[],
  flows: ValueFlow[],
): ValueFlowStats {
  const totalSources = sources.length
  const totalTransforms = transforms.length
  const totalSinks = sinks.length
  const deadEnds = detectDeadEnds(flows)
  const untraced = detectUntraced(flows)
  const lengths = flows.map((f) => f.length)
  const averageFlowLength = flows.length > 0
    ? Math.round((lengths.reduce((s, l) => s + l, 0) / flows.length) * 10) / 10
    : 0
  const longestFlow = flows.length > 0 ? Math.max(...lengths) : 0
  const withValidation = flows.filter((f) => f.hasValidation).length
  const withErrorHandling = flows.filter((f) => f.hasErrorHandling).length
  const validationCoverage = flows.length > 0 ? Math.round((withValidation / flows.length) * 100) : 0
  const errorHandlingCoverage = flows.length > 0 ? Math.round((withErrorHandling / flows.length) * 100) : 0

  return {
    totalSources, totalTransforms, totalSinks,
    deadEndCount: deadEnds.length, untracedCount: untraced.length,
    averageFlowLength, longestFlow,
    validationCoverage, errorHandlingCoverage,
  }
}

// ─── generateRecommendations ──────────────────────────────────────────────────

/**
 * Generate recommendations from flow analysis.
 *
 * @example
 * generateRecommendations(deadEnds, untraced, stats) // ['Remove dead code']
 */
export function generateRecommendations(
  deadEnds: ValueFlow[],
  untraced: ValueFlow[],
  stats: ValueFlowStats,
): string[] {
  const recs: string[] = []

  if (deadEnds.length > 0) {
    const names = deadEnds.slice(0, 3).map((d) => d.source.name).join(', ')
    recs.push(`${deadEnds.length} dead-end value(s) computed but never used: ${names}`)
  }

  if (untraced.length > 0) {
    const names = untraced.slice(0, 3).map((u) => u.source.name).join(', ')
    recs.push(`${untraced.length} untraced value(s) reaching sinks without validation: ${names}`)
  }

  if (stats.validationCoverage < 50 && stats.totalSources > 0) {
    recs.push(`Validation coverage is only ${stats.validationCoverage}% — add input validation`)
  }

  if (stats.errorHandlingCoverage < 50 && stats.totalSources > 0) {
    recs.push(`Error handling coverage is ${stats.errorHandlingCoverage}% — add try/catch around transformations`)
  }

  if (stats.longestFlow > 8) {
    recs.push(`Longest flow chain is ${stats.longestFlow} steps — consider simplifying`)
  }

  if (recs.length === 0) {
    recs.push('Value flow looks healthy — good validation and error handling coverage.')
  }

  return recs
}

// ─── buildValueFlowResult ─────────────────────────────────────────────────────

/**
 * Orchestrate full value flow analysis.
 *
 * @example
 * buildValueFlowResult(['a.ts'], ['code...']) // ValueFlowResult
 */
export function buildValueFlowResult(
  files: string[],
  contents: string[],
  _options?: ValueFlowOptions,
): ValueFlowResult {
  const allSources: ValueSource[] = []
  const allTransforms: ValueTransform[] = []
  const allSinks: ValueSink[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!
    const content = contents[i] ?? ''
    allSources.push(...extractSources(content, file))
    allTransforms.push(...extractTransforms(content, file))
    allSinks.push(...extractSinks(content, file))
  }

  const flows: ValueFlow[] = []
  for (const source of allSources) {
    const flow = traceFlow(source, allTransforms, allSinks)
    flows.push(flow)
  }

  const deadEnds = detectDeadEnds(flows)
  const untraced = detectUntraced(flows)
  const stats = computeStats(allSources, allTransforms, allSinks, flows)
  const recommendations = generateRecommendations(deadEnds, untraced, stats)

  return {
    sources: allSources, transforms: allTransforms, sinks: allSinks,
    flows, deadEnds, untraced, stats, recommendations,
  }
}
