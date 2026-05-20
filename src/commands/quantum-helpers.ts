// ─── Types ──────────────────────────────────────────────────────────────────────

export type CollapseRisk = 'none' | 'low' | 'medium' | 'high'
export type EntanglementType = 'state' | 'behavior' | 'data' | 'config'
export type EntanglementRisk = 'benign' | 'caution' | 'dangerous' | 'critical'
export type TunnelRisk = 'safe' | 'unexpected' | 'dangerous' | 'critical'
export type QuantumHealth = 'deterministic' | 'coherent' | 'uncertain' | 'chaotic' | 'schrodinger'

export interface SuperPosition {
  element: string
  possibleStates: string[]
  probability: number[]
  isCollapsed: boolean
  collapseRisk: CollapseRisk
  location: number
}

export interface Entanglement {
  pair: [string, string]
  strength: number
  type: EntanglementType
  isQuantum: boolean
  risk: EntanglementRisk
  description: string
}

export interface TunnelingPath {
  from: string
  to: string
  path: string[]
  probability: number
  risk: TunnelRisk
}

export interface QuantumState {
  file: string
  uncertainty: number
  superpositions: SuperPosition[]
  entanglements: Entanglement[]
  observationEffect: number
  coherence: number
  isCollapsed: boolean
  tunnelingRisk: number
}

export interface QuantumStats {
  totalStates: number
  avgUncertainty: number
  totalSuperpositions: number
  collapsedStates: number
  uncollapsedStates: number
  totalEntanglements: number
  criticalEntanglements: number
  totalTunnelingPaths: number
  dangerousTunnels: number
  avgCoherence: number
  avgObservationEffect: number
  maxUncertainty: number
  mostUncertainFile: string
  mostEntangledFile: string
  quantumHealth: QuantumHealth
  determinismIndex: number
  entanglementEntropy: number
}

export interface QuantumResult {
  states: QuantumState[]
  entanglements: Entanglement[]
  tunnelingPaths: TunnelingPath[]
  stats: QuantumStats
  recommendations: string[]
}

export interface QuantumOptions {
  verbose?: boolean
  format?: string
  output?: string
  ignore?: string[]
  ext?: string
}

// ─── Superposition Detection ───────────────────────────────────────────────────

/**
 * Detect superpositions — elements in multiple possible states.
 *
 * @example
 * detectSuperpositions('let x: string | number = 1') // => SuperPosition[]
 */
export function detectSuperpositions(content: string): SuperPosition[] {
  if (content.trim().length === 0) return []

  const superpositions: SuperPosition[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNum = i + 1

    const unionTypes = Array.from(line.matchAll(/(\w+)\s*:\s*([\w\s|]+?)(?:\s*[=;,\)\n]|$)/g))
    for (const m of unionTypes) {
      if (!m[2].includes('|')) continue
      const typeParts = m[2].split('|').map(s => s.trim()).filter(Boolean)
      if (typeParts.length >= 2) {
        const prob = Math.round(100 / typeParts.length)
        superpositions.push({
          element: m[1],
          possibleStates: typeParts,
          probability: typeParts.map(() => prob),
          isCollapsed: false,
          collapseRisk: typeParts.length > 3 ? 'high' : typeParts.length > 2 ? 'medium' : 'low',
          location: lineNum,
        })
      }
    }

    const optionalChains = Array.from(line.matchAll(/(\w+)\?\./g))
    for (const m of optionalChains) {
      superpositions.push({
        element: m[1],
        possibleStates: ['defined', 'undefined'],
        probability: [70, 30],
        isCollapsed: false,
        collapseRisk: 'medium',
        location: lineNum,
      })
    }

    const ternaryMatches = Array.from(line.matchAll(/(\w+)\s*=\s*[^?]+\?/g))
    for (const m of ternaryMatches) {
      superpositions.push({
        element: m[1],
        possibleStates: ['truthy-branch', 'falsy-branch'],
        probability: [50, 50],
        isCollapsed: false,
        collapseRisk: 'low',
        location: lineNum,
      })
    }

    const overloadedReturns = Array.from(line.matchAll(/(\w+)\s*\([^)]*\)\s*:\s*\(/g))
    for (const m of overloadedReturns) {
      superpositions.push({
        element: m[1],
        possibleStates: ['overload-a', 'overload-b'],
        probability: [50, 50],
        isCollapsed: false,
        collapseRisk: 'medium',
        location: lineNum,
      })
    }
  }

  return superpositions
}

// ─── State Analysis ────────────────────────────────────────────────────────────

/**
 * Analyze quantum state of a single file.
 *
 * @example
 * analyzeState('let x: string | number = 1', 'a.ts') // => QuantumState
 */
export function analyzeState(content: string, filePath: string): QuantumState {
  if (content.trim().length === 0) {
    return {
      file: filePath, uncertainty: 0, superpositions: [], entanglements: [],
      observationEffect: 0, coherence: 100, isCollapsed: true, tunnelingRisk: 0,
    }
  }

  const superpositions = detectSuperpositions(content)
  const tunnels = detectTunnelingPaths(content)

  const conditionals = Array.from(content.matchAll(/\bif\s*\(/g)).length
  const typeAssertions = Array.from(content.matchAll(/\bas\s+\w+/g)).length
  const anyUsage = Array.from(content.matchAll(/:\s*any\b/g)).length
  const uncertainty = Math.min(100, (conditionals * 3) + (typeAssertions * 5) + (anyUsage * 8) + (superpositions.filter(s => !s.isCollapsed).length * 4))

  const consoleLogs = Array.from(content.matchAll(/console\.(log|debug|info|warn|error)/g)).length
  const tryCatch = Array.from(content.matchAll(/try\s*\{/g)).length
  const observationEffect = Math.min(100, (consoleLogs * 2) + (tryCatch * 5))

  const mutableAssignments = Array.from(content.matchAll(/\blet\s+\w+/g)).length
  const constAssignments = Array.from(content.matchAll(/\bconst\s+\w+/g)).length
  const totalAssignments = mutableAssignments + constAssignments
  const coherence = totalAssignments > 0
    ? Math.max(0, Math.min(100, Math.round((constAssignments / totalAssignments) * 100)))
    : 100

  const isCollapsed = superpositions.every(s => s.isCollapsed) && uncertainty < 20
  const tunnelingRisk = Math.min(100, tunnels.filter(t => t.risk === 'dangerous' || t.risk === 'critical').length * 20 + tunnels.filter(t => t.risk === 'unexpected').length * 5)

  return {
    file: filePath,
    uncertainty,
    superpositions,
    entanglements: [],
    observationEffect,
    coherence,
    isCollapsed,
    tunnelingRisk,
  }
}

// ─── Entanglement Detection ────────────────────────────────────────────────────

/**
 * Detect entangled code pairs across files.
 *
 * @example
 * detectEntanglements(['a.ts', 'b.ts'], ['let shared = 1', 'shared = 2']) // => Entanglement[]
 */
export function detectEntanglements(files: string[], contents: string[]): Entanglement[] {
  if (files.length < 2) return []

  const entanglements: Entanglement[] = []
  const exports = new Map<string, string[]>()
  const imports = new Map<string, string[]>()
  const globals = new Map<string, string[]>()

  for (let i = 0; i < files.length; i++) {
    const content = contents[i] ?? ''

    const exportMatches = Array.from(content.matchAll(/export\s+(?:const|let|var|function|class|type|interface)\s+(\w+)/g))
    for (const m of exportMatches) {
      const existing = exports.get(m[1]) ?? []
      existing.push(files[i])
      exports.set(m[1], existing)
    }

    const importMatches = Array.from(content.matchAll(/import\s+.*?\{([^}]+)\}/g))
    for (const m of importMatches) {
      const names = m[1].split(',').map(s => s.trim()).filter(Boolean)
      const existing = imports.get(files[i]) ?? []
      existing.push(...names)
      imports.set(files[i], existing)
    }

    const globalMatches = Array.from(content.matchAll(/(?:globalThis|window|global)\.(\w+)/g))
    for (const m of globalMatches) {
      const existing = globals.get(m[1]) ?? []
      if (!existing.includes(files[i])) existing.push(files[i])
      globals.set(m[1], existing)
    }
  }

  for (const [name, filesSharing] of globals) {
    if (filesSharing.length >= 2) {
      for (let a = 0; a < filesSharing.length; a++) {
        for (let b = a + 1; b < filesSharing.length; b++) {
          entanglements.push({
            pair: [filesSharing[a], filesSharing[b]],
            strength: 90,
            type: 'state',
            isQuantum: true,
            risk: 'dangerous',
            description: `Shared global '${name}' creates quantum entanglement`,
          })
        }
      }
    }
  }

  for (const [name, exporterFiles] of exports) {
    if (exporterFiles.length > 1) {
      for (let a = 0; a < exporterFiles.length; a++) {
        for (let b = a + 1; b < exporterFiles.length; b++) {
          entanglements.push({
            pair: [exporterFiles[a], exporterFiles[b]],
            strength: 40,
            type: 'data',
            isQuantum: false,
            risk: 'caution',
            description: `Both export '${name}' — name collision`,
          })
        }
      }
    }

    for (let i = 0; i < files.length; i++) {
      const importedNames = imports.get(files[i]) ?? []
      if (importedNames.includes(name) && !exporterFiles.includes(files[i])) {
        for (const exporter of exporterFiles) {
          const existing = entanglements.find(e =>
            e.pair[0] === exporter && e.pair[1] === files[i] && e.description.includes(name),
          )
          if (!existing) {
            entanglements.push({
              pair: [exporter, files[i]],
              strength: 60,
              type: 'behavior',
              isQuantum: false,
              risk: 'benign',
              description: `Import '${name}' creates coupling`,
            })
          }
        }
      }
    }
  }

  const deduped = new Map<string, Entanglement>()
  for (const e of entanglements) {
    const key = Array.from(new Set([e.pair[0], e.pair[1]])).sort().join('::') + ':' + e.description
    if (!deduped.has(key)) deduped.set(key, e)
  }

  return Array.from(deduped.values())
}

// ─── Tunneling Path Detection ──────────────────────────────────────────────────

/**
 * Detect unexpected control flow tunneling paths.
 *
 * @example
 * detectTunnelingPaths('try { foo(); } catch(e) { continue; }') // => TunnelingPath[]
 */
export function detectTunnelingPaths(content: string): TunnelingPath[] {
  if (content.trim().length === 0) return []

  const tunnels: TunnelingPath[] = []
  const lines = content.split('\n')

  const catchContinue = Array.from(content.matchAll(/catch\s*\([^)]*\)\s*\{[^}]*\bcontinue\b/g))
  for (const m of catchContinue) {
    tunnels.push({
      from: 'try-catch',
      to: 'loop-continue',
      path: ['try', 'catch', 'continue'],
      probability: 30,
      risk: 'unexpected',
    })
  }

  const catchBreak = Array.from(content.matchAll(/catch\s*\([^)]*\)\s*\{[^}]*\bbreak\b/g))
  for (const m of catchBreak) {
    tunnels.push({
      from: 'try-catch',
      to: 'loop-break',
      path: ['try', 'catch', 'break'],
      probability: 25,
      risk: 'unexpected',
    })
  }

  const catchReturn = Array.from(content.matchAll(/catch\s*\([^)]*\)\s*\{[^}]*\breturn\b/g))
  for (const m of catchReturn) {
    tunnels.push({
      from: 'try-catch',
      to: 'early-return',
      path: ['try', 'catch', 'return'],
      probability: 40,
      risk: 'dangerous',
    })
  }

  const labeledBreaks = Array.from(content.matchAll(/\b(\w+)\s*:\s*(?:for|while|do)\b/g))
  for (const m of labeledBreaks) {
    tunnels.push({
      from: m[1] + '-loop',
      to: 'outer-scope',
      path: [m[1] + '-loop', 'break ' + m[1]],
      probability: 15,
      risk: 'unexpected',
    })
  }

  const nestedReturns = Array.from(content.matchAll(/\b(?:finally)\s*\{[^}]*\breturn\b/g))
  for (const m of nestedReturns) {
    tunnels.push({
      from: 'finally',
      to: 'return-override',
      path: ['try', 'finally', 'return'],
      probability: 50,
      risk: 'critical',
    })
  }

  const emptyCatch = Array.from(content.matchAll(/catch\s*\([^)]*\)\s*\{\s*\}/g))
  for (const m of emptyCatch) {
    tunnels.push({
      from: 'try',
      to: 'swallowed-error',
      path: ['try', 'catch-empty'],
      probability: 70,
      risk: 'dangerous',
    })
  }

  const throwInCatch = Array.from(content.matchAll(/catch\s*\([^)]*\)\s*\{[^}]*\bthrow\b/g))
  for (const m of throwInCatch) {
    tunnels.push({
      from: 'catch',
      to: 'rethrown-error',
      path: ['catch', 'throw'],
      probability: 35,
      risk: 'safe',
    })
  }

  return tunnels
}

// ─── Computed Metrics ──────────────────────────────────────────────────────────

/**
 * Compute determinism index from quantum states.
 *
 * @example
 * computeDeterminismIndex(states) // => 85
 */
export function computeDeterminismIndex(states: QuantumState[]): number {
  if (states.length === 0) return 100

  const collapsedCount = states.filter(s => s.isCollapsed).length
  const avgUncertainty = states.reduce((s, st) => s + st.uncertainty, 0) / states.length
  const avgCoherence = states.reduce((s, st) => s + st.coherence, 0) / states.length

  const collapseRatio = (collapsedCount / states.length) * 40
  const uncertaintyBonus = ((100 - avgUncertainty) / 100) * 30
  const coherenceBonus = (avgCoherence / 100) * 30

  return Math.round(Math.max(0, Math.min(100, collapseRatio + uncertaintyBonus + coherenceBonus)))
}

/**
 * Compute entanglement entropy.
 *
 * @example
 * computeEntanglementEntropy(entanglements) // => 45
 */
export function computeEntanglementEntropy(entanglements: Entanglement[]): number {
  if (entanglements.length === 0) return 0

  const avgStrength = entanglements.reduce((s, e) => s + e.strength, 0) / entanglements.length
  const quantumCount = entanglements.filter(e => e.isQuantum).length
  const quantumRatio = quantumCount / entanglements.length

  return Math.round(Math.min(100, (avgStrength * 0.5) + (quantumRatio * 50)))
}

/**
 * Classify overall quantum health.
 *
 * @example
 * classifyQuantumHealth(90, 10, 95) // => 'deterministic'
 */
export function classifyQuantumHealth(determinism: number, avgUncertainty: number, avgCoherence: number): QuantumHealth {
  if (determinism >= 80 && avgUncertainty <= 20 && avgCoherence >= 80) return 'deterministic'
  if (determinism >= 60 && avgUncertainty <= 40) return 'coherent'
  if (determinism >= 40 && avgUncertainty <= 60) return 'uncertain'
  if (avgUncertainty >= 80 && avgCoherence <= 20) return 'chaotic'
  if (avgUncertainty > 60 && avgCoherence < 40 && determinism < 30) return 'schrodinger'
  if (determinism < 40) return 'chaotic'
  return 'uncertain'
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Generate quantum analysis recommendations.
 *
 * @example
 * generateQuantumRecommendations(states, entanglements, tunnels, stats) // => string[]
 */
export function generateQuantumRecommendations(
  _states: QuantumState[],
  entanglements: Entanglement[],
  tunnels: TunnelingPath[],
  stats: QuantumStats,
): string[] {
  const recs: string[] = []

  if (stats.uncollapsedStates > stats.collapsedStates) {
    recs.push(`${stats.uncollapsedStates} uncollapsed superpositions detected — narrow types with type guards and discriminated unions`)
  }

  const critical = entanglements.filter(e => e.risk === 'critical' || e.risk === 'dangerous')
  if (critical.length > 0) {
    recs.push(`${critical.length} critical entanglement${critical.length > 1 ? 's' : ''} — decouple with events, messages, or dependency injection`)
  }

  const dangerousTunnels = tunnels.filter(t => t.risk === 'dangerous' || t.risk === 'critical')
  if (dangerousTunnels.length > 0) {
    recs.push(`${dangerousTunnels.length} dangerous tunneling path${dangerousTunnels.length > 1 ? 's' : ''} — add explicit error handling and avoid control flow in catch/finally`)
  }

  if (stats.avgUncertainty > 60) {
    recs.push('High average uncertainty — simplify conditionals, reduce type assertions, and eliminate `any` usage')
  }

  if (stats.quantumHealth === 'schrodinger') {
    recs.push('Schrödinger state detected — code behavior is highly unpredictable; add comprehensive tests and type coverage')
  }

  if (stats.entanglementEntropy > 70) {
    recs.push('High entanglement entropy — reduce coupling between modules to improve predictability')
  }

  return Array.from(new Set(recs))
}

// ─── Build Result ──────────────────────────────────────────────────────────────

/**
 * Build complete quantum analysis result.
 *
 * @example
 * buildQuantumResult(['a.ts'], ['code'], {}) // => QuantumResult
 */
export function buildQuantumResult(files: string[], contents: string[], _options: QuantumOptions): QuantumResult {
  if (files.length === 0) {
    const emptyStats: QuantumStats = {
      totalStates: 0, avgUncertainty: 0, totalSuperpositions: 0,
      collapsedStates: 0, uncollapsedStates: 0,
      totalEntanglements: 0, criticalEntanglements: 0,
      totalTunnelingPaths: 0, dangerousTunnels: 0,
      avgCoherence: 0, avgObservationEffect: 0,
      maxUncertainty: 0, mostUncertainFile: '',
      mostEntangledFile: '', quantumHealth: 'deterministic',
      determinismIndex: 100, entanglementEntropy: 0,
    }
    return { states: [], entanglements: [], tunnelingPaths: [], stats: emptyStats, recommendations: [] }
  }

  const states: QuantumState[] = []
  const allTunnels: TunnelingPath[] = []

  for (let i = 0; i < files.length; i++) {
    const content = contents[i] ?? ''
    const state = analyzeState(content, files[i])
    const tunnels = detectTunnelingPaths(content)
    allTunnels.push(...tunnels)
    states.push(state)
  }

  const entanglements = detectEntanglements(files, contents)

  const totalSuperpositions = states.reduce((s, st) => s + st.superpositions.length, 0)
  const collapsedStates = states.filter(s => s.isCollapsed).length
  const uncollapsedStates = states.length - collapsedStates
  const avgUncertainty = Math.round(states.reduce((s, st) => s + st.uncertainty, 0) / states.length)
  const avgCoherence = Math.round(states.reduce((s, st) => s + st.coherence, 0) / states.length)
  const avgObservationEffect = Math.round(states.reduce((s, st) => s + st.observationEffect, 0) / states.length)
  const maxUncertainty = Math.max(...states.map(s => s.uncertainty))
  const mostUncertainFile = states.reduce((a, b) => a.uncertainty >= b.uncertainty ? a : b).file

  const entanglementCounts = new Map<string, number>()
  for (const e of entanglements) {
    entanglementCounts.set(e.pair[0], (entanglementCounts.get(e.pair[0]) ?? 0) + 1)
    entanglementCounts.set(e.pair[1], (entanglementCounts.get(e.pair[1]) ?? 0) + 1)
  }
  let mostEntangledFile = ''
  let maxEntCount = 0
  for (const [f, c] of entanglementCounts) {
    if (c > maxEntCount) { maxEntCount = c; mostEntangledFile = f }
  }

  const criticalEntanglements = entanglements.filter(e => e.risk === 'critical' || e.risk === 'dangerous').length
  const dangerousTunnels = allTunnels.filter(t => t.risk === 'dangerous' || t.risk === 'critical').length
  const determinismIndex = computeDeterminismIndex(states)
  const entanglementEntropy = computeEntanglementEntropy(entanglements)
  const quantumHealth = classifyQuantumHealth(determinismIndex, avgUncertainty, avgCoherence)

  const stats: QuantumStats = {
    totalStates: states.length,
    avgUncertainty,
    totalSuperpositions,
    collapsedStates,
    uncollapsedStates,
    totalEntanglements: entanglements.length,
    criticalEntanglements,
    totalTunnelingPaths: allTunnels.length,
    dangerousTunnels,
    avgCoherence,
    avgObservationEffect,
    maxUncertainty,
    mostUncertainFile,
    mostEntangledFile,
    quantumHealth,
    determinismIndex,
    entanglementEntropy,
  }

  const recommendations = generateQuantumRecommendations(states, entanglements, allTunnels, stats)

  return { states, entanglements, tunnelingPaths: allTunnels, stats, recommendations }
}
