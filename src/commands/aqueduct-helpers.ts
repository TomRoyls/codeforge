// ─── Types ─────────────────────────────────────────────────────────────────────

export type WaterSourceType = 'parameter' | 'config' | 'constant' | 'import' | 'computed' | 'user-input'
export type ChannelType = 'parameter' | 'return-value' | 'assignment' | 'mutation' | 'event' | 'callback'
export type FlowQuality = 'clean' | 'filtered' | 'murky' | 'polluted'
export type ReservoirType = 'variable' | 'state' | 'cache' | 'store'
export type LeakType = 'unused-variable' | 'unreachable-data' | 'overwritten-value' | 'side-effect-leak' | 'type-leak'
export type LeakSeverity = 'drip' | 'trickle' | 'stream' | 'flood'
export type FileClassification = 'spring' | 'well' | 'reservoir-hub' | 'distribution' | 'drain' | 'dry'
export type OverallGrade = 'roman-engineering' | 'modern-plumbing' | 'standard' | 'leaky-pipes' | 'drought'

export interface WaterSource {
  name: string
  file: string
  type: WaterSourceType
  flowRate: number
  reliability: number
}

export interface Channel {
  from: string
  to: string
  type: ChannelType
  width: number
  flowQuality: FlowQuality
  length: number
  hasLeaks: boolean
  hasBlockages: boolean
  description: string
}

export interface Reservoir {
  name: string
  file: string
  type: ReservoirType
  capacity: number
  inflow: number
  outflow: number
  isStagnant: boolean
  isOverflowing: boolean
  quality: number
}

export interface Leak {
  type: LeakType
  file: string
  line: number
  severity: LeakSeverity
  description: string
  fix: string
}

export interface AqueductFile {
  file: string
  sources: number
  channels: number
  reservoirs: number
  leaks: number
  flowEfficiency: number
  waterQuality: number
  classification: FileClassification
}

export interface AqueductStats {
  totalSources: number
  totalChannels: number
  totalReservoirs: number
  totalLeaks: number
  floodLeaks: number
  stagnantReservoirs: number
  overflowingReservoirs: number
  avgFlowEfficiency: number
  avgWaterQuality: number
  springFiles: number
  drainFiles: number
  dryFiles: number
  channelLength: number
  networkEfficiency: number
  waterLoss: number
  systemCapacity: number
  overallGrade: OverallGrade
}

export interface AqueductResult {
  files: AqueductFile[]
  channels: Channel[]
  reservoirs: Reservoir[]
  leaks: Leak[]
  stats: AqueductStats
  recommendations: string[]
}

// ─── Internal Helpers ──────────────────────────────────────────────────────────

/**
 * Count function params
 * @example
 * countParams('function f(x, y, z) {}') // 3
 */
function countParams(content: string): number {
  const matches = content.match(/function\s*\w*\s*\(([^)]*)\)/g) || []
  let total = 0
  for (const m of matches) {
    const inner = m.match(/\(([^)]*)\)/)
    if (inner && inner[1].trim().length > 0) {
      total += inner[1].split(',').length
    }
  }
  return total
}

/**
 * Count const/let/var declarations
 * @example
 * countDeclarations('const x = 1; let y = 2') // 2
 */
function countDeclarations(content: string): number {
  return (content.match(/\b(const|let|var)\s+\w+/g) || []).length
}

/**
 * Count assignments
 * @example
 * countAssignments('x = 1; y = 2') // 2
 */
function countAssignments(content: string): number {
  return (content.match(/\w+\s*=[^=]/g) || []).length
}

/**
 * Count return statements
 * @example
 * countReturns('return 1; return 2;') // 2
 */
function countReturns(content: string): number {
  return (content.match(/\breturn\b/g) || []).length
}

/**
 * Count function calls
 * @example
 * countCalls('foo(); bar(1)') // 2
 */
function countCalls(content: string): number {
  return (content.match(/\w+\s*\(/g) || []).length
}

/**
 * Count type annotations
 * @example
 * countTypes(': number') // 1
 */
function countTypes(content: string): number {
  return (content.match(/:\s*\w+/g) || []).length
}

/**
 * Check for implicit any
 * @example
 * hasAny(': any') // true
 */
function hasAny(content: string): boolean {
  return /:\s*any\b|as\s+any\b/.test(content)
}

// ─── Identify Sources ──────────────────────────────────────────────────────────

/**
 * Identify water sources (data origins)
 * @example
 * identifySources('function f(x: number) { const y = 1 }', 'a.ts') // WaterSource[]
 */
export function identifySources(content: string, filePath: string): WaterSource[] {
  const sources: WaterSource[] = []
  const lines = content.split('\n')

  const funcParams = content.match(/function\s+(\w+)\s*\(([^)]*)\)/g) || []
  for (const fp of funcParams) {
    const nameMatch = fp.match(/function\s+(\w+)/)
    const paramsMatch = fp.match(/\(([^)]*)\)/)
    if (nameMatch && paramsMatch && paramsMatch[1].trim().length > 0) {
      const params = paramsMatch[1].split(',').map(p => p.trim().split(':')[0].trim()).filter(p => p.length > 0)
      for (const p of params) {
        sources.push({
          name: p,
          file: filePath,
          type: 'parameter',
          flowRate: 1,
          reliability: 80,
        })
      }
    }
  }

  const consts = content.match(/const\s+(\w+)/g) || []
  for (const c of consts) {
    const name = c.replace('const ', '')
    sources.push({
      name,
      file: filePath,
      type: 'constant',
      flowRate: 1,
      reliability: 90,
    })
  }

  const imports = content.match(/import\s+.*?from/g) || []
  for (const imp of imports) {
    const namedMatch = imp.match(/import\s+(?:\{([^}]+)\}|\w+)/)
    const names = namedMatch
      ? (namedMatch[1] || namedMatch[0]).split(',').map(n => n.trim()).filter(n => n.length > 0)
      : ['import']
    for (const n of names) {
      sources.push({
        name: n,
        file: filePath,
        type: 'import',
        flowRate: 1,
        reliability: 95,
      })
    }
  }

  const computed = content.match(/(?:const|let)\s+(\w+)\s*=\s*(?!\d+|"[^"]*"|'[^']*')[\w.]+/g) || []
  for (const c of computed) {
    const name = c.match(/(?:const|let)\s+(\w+)/)?.[1]
    if (name) {
      sources.push({
        name,
        file: filePath,
        type: 'computed',
        flowRate: 1,
        reliability: 70,
      })
    }
  }

  return sources
}

// ─── Map Channels ──────────────────────────────────────────────────────────────

/**
 * Map data flow channels
 * @example
 * mapChannels('export function f(x) { return x + 1 }', 'a.ts') // Channel[]
 */
export function mapChannels(content: string, filePath: string): Channel[] {
  const channels: Channel[] = []
  const hasExports = /export\s+/.test(content)
  const hasReturns = countReturns(content) > 0
  const hasMutations = /\w+\s*\+\=|\w+\s*-\=|\w+\s*\*\\=|\w+\[\w+\]\s*=/.test(content)
  const hasCallbacks = /\.then\(|\.catch\(|callback|=>\s*[{(]/.test(content)
  const hasTypes = countTypes(content) > 0
  const hasAny_ = hasAny(content)

  if (hasExports) {
    const exports = countExports(content)
    channels.push({
      from: filePath,
      to: 'external',
      type: 'return-value',
      width: exports,
      flowQuality: hasTypes ? 'clean' : 'filtered',
      length: 1,
      hasLeaks: false,
      hasBlockages: false,
      description: `${exports} export(s) flowing to external consumers`,
    })
  }

  const params = countParams(content)
  if (params > 0) {
    channels.push({
      from: 'external',
      to: filePath,
      type: 'parameter',
      width: params,
      flowQuality: hasTypes ? 'clean' : 'murky',
      length: 0,
      hasLeaks: false,
      hasBlockages: false,
      description: `${params} parameter(s) flowing into module`,
    })
  }

  const assignments = countAssignments(content)
  if (assignments > 0) {
    channels.push({
      from: 'input',
      to: 'storage',
      type: 'assignment',
      width: assignments,
      flowQuality: hasAny_ ? 'polluted' : hasTypes ? 'clean' : 'filtered',
      length: 0,
      hasLeaks: hasAny_,
      hasBlockages: false,
      description: `${assignments} assignment(s) storing data`,
    })
  }

  if (hasMutations) {
    channels.push({
      from: 'storage',
      to: 'storage',
      type: 'mutation',
      width: 1,
      flowQuality: 'murky',
      length: 0,
      hasLeaks: false,
      hasBlockages: false,
      description: 'Data mutation detected — in-place modification',
    })
  }

  if (hasReturns) {
    const returns = countReturns(content)
    channels.push({
      from: 'internal',
      to: 'caller',
      type: 'return-value',
      width: returns,
      flowQuality: hasTypes ? 'clean' : 'filtered',
      length: 0,
      hasLeaks: false,
      hasBlockages: false,
      description: `${returns} return(s) sending data to callers`,
    })
  }

  if (hasCallbacks) {
    channels.push({
      from: 'event',
      to: 'handler',
      type: 'callback',
      width: 1,
      flowQuality: 'filtered',
      length: 1,
      hasLeaks: false,
      hasBlockages: false,
      description: 'Callback/event channel for async data flow',
    })
  }

  return channels
}

/**
 * Count exports
 * @example
 * countExports('export const x = 1') // 1
 */
function countExports(content: string): number {
  return (content.match(/export\s+/g) || []).length
}

// ─── Find Reservoirs ───────────────────────────────────────────────────────────

/**
 * Find data storage points (reservoirs)
 * @example
 * findReservoirs('const x = 1; let y = 2;', 'a.ts') // Reservoir[]
 */
export function findReservoirs(content: string, filePath: string): Reservoir[] {
  const reservoirs: Reservoir[] = []
  const lines = content.split('\n')

  const constDecls = content.match(/const\s+(\w+)(?::\s*\w+)?\s*=/g) || []
  for (const decl of constDecls) {
    const name = decl.match(/const\s+(\w+)/)?.[1]
    if (name) {
      const usageCount = (content.match(new RegExp(`\\b${name}\\b`, 'g')) || []).length - 1
      const isUsed = usageCount > 0
      const typeAnnotation = decl.includes(':')
      const capacity = typeAnnotation ? 2 : 1
      reservoirs.push({
        name,
        file: filePath,
        type: 'variable',
        capacity,
        inflow: 1,
        outflow: isUsed ? usageCount : 0,
        isStagnant: !isUsed,
        isOverflowing: false,
        quality: isUsed ? 80 : 20,
      })
    }
  }

  const letDecls = content.match(/let\s+(\w+)(?::\s*\w+)?\s*=/g) || []
  for (const decl of letDecls) {
    const name = decl.match(/let\s+(\w+)/)?.[1]
    if (name) {
      const usageCount = (content.match(new RegExp(`\\b${name}\\b`, 'g')) || []).length - 1
      const isUsed = usageCount > 0
      const reassignments = (content.match(new RegExp(`${name}\\s*=[^=]`, 'g')) || []).length
      const capacity = reassignments + 1
      reservoirs.push({
        name,
        file: filePath,
        type: 'variable',
        capacity,
        inflow: reassignments + 1,
        outflow: isUsed ? usageCount : 0,
        isStagnant: !isUsed,
        isOverflowing: capacity > 10,
        quality: isUsed ? (reassignments <= 2 ? 75 : 50) : 20,
      })
    }
  }

  const objectVars = content.match(/(?:const|let)\s+(\w+)\s*=\s*\{/g) || []
  for (const decl of objectVars) {
    const name = decl.match(/(?:const|let)\s+(\w+)/)?.[1]
    if (name) {
      const existing = reservoirs.find(r => r.name === name)
      if (existing) {
        const propMatch = content.match(new RegExp(`${name}\\.\\w+`, 'g'))
        existing.capacity = propMatch ? propMatch.length + 1 : 2
        existing.type = 'store'
      }
    }
  }

  return reservoirs
}

// ─── Detect Leaks ──────────────────────────────────────────────────────────────

/**
 * Detect data leaks
 * @example
 * detectLeaks('const x = 1;', 'a.ts') // Leak[]
 */
export function detectLeaks(content: string, filePath: string): Leak[] {
  const leaks: Leak[] = []
  const lines = content.split('\n')

  const constDecls = content.match(/const\s+(\w+)\s*=/g) || []
  for (const decl of constDecls) {
    const name = decl.match(/const\s+(\w+)/)?.[1]
    if (name) {
      const allRefs = (content.match(new RegExp(`\\b${name}\\b`, 'g')) || []).length
      if (allRefs <= 1) {
        const lineIdx = lines.findIndex(l => l.includes(`const ${name}`)) + 1
        leaks.push({
          type: 'unused-variable',
          file: filePath,
          line: Math.max(1, lineIdx),
          severity: 'drip',
          description: `Variable '${name}' is declared but never used`,
          fix: `Remove unused variable '${name}' or prefix with '_'`,
        })
      }
    }
  }

  const letDecls = content.match(/let\s+(\w+)\s*=/g) || []
  for (const decl of letDecls) {
    const name = decl.match(/let\s+(\w+)/)?.[1]
    if (name) {
      const allRefs = (content.match(new RegExp(`\\b${name}\\b`, 'g')) || []).length
      if (allRefs <= 1) {
        const lineIdx = lines.findIndex(l => l.includes(`let ${name}`)) + 1
        leaks.push({
          type: 'unused-variable',
          file: filePath,
          line: Math.max(1, lineIdx),
          severity: 'trickle',
          description: `Mutable variable '${name}' is declared but never used`,
          fix: `Remove unused variable '${name}'`,
        })
      }
    }
  }

  if (hasAny(content)) {
    const lineIdx = lines.findIndex(l => /:\s*any|as\s+any/.test(l)) + 1
    leaks.push({
      type: 'type-leak',
      file: filePath,
      line: Math.max(1, lineIdx),
      severity: 'stream',
      description: 'Implicit any type — type safety is leaking',
      fix: 'Replace any with proper type annotation',
    })
  }

  const funcCalls = content.match(/\w+\([^)]*\)\s*;?\s*$/gm) || []
  const returnMatches = content.match(/\breturn\b/g) || []
  const voidCalls = funcCalls.length - returnMatches.length
  if (voidCalls > 5) {
    leaks.push({
      type: 'side-effect-leak',
      file: filePath,
      line: 1,
      severity: 'trickle',
      description: `${voidCalls} function call(s) with ignored return values`,
      fix: 'Check if return values should be used',
    })
  }

  const unreachable = content.match(/return\s+.*\n.*\S/g)
  if (unreachable) {
    leaks.push({
      type: 'unreachable-data',
      file: filePath,
      line: 1,
      severity: 'drip',
      description: 'Potential unreachable code after return statement',
      fix: 'Remove or restructure unreachable code',
    })
  }

  return leaks
}

// ─── Flow Efficiency ───────────────────────────────────────────────────────────

/**
 * Compute flow efficiency 0-100
 * @example
 * computeFlowEfficiency(5, 3, 1) // 85
 */
export function computeFlowEfficiency(sources: number, channels: number, leaks: number): number {
  if (sources === 0 && channels === 0) return 50
  const total = sources + channels
  const leakPenalty = Math.min(40, leaks * 5)
  const channelBonus = Math.min(20, channels * 5)
  const score = 60 + channelBonus - leakPenalty
  return Math.max(0, Math.min(100, Math.round(score)))
}

// ─── Water Quality ─────────────────────────────────────────────────────────────

/**
 * Compute water quality 0-100
 * @example
 * computeWaterQuality(channels, reservoirs) // 75
 */
export function computeWaterQuality(channels: Channel[], reservoirs: Reservoir[]): number {
  if (channels.length === 0 && reservoirs.length === 0) return 50
  let score = 60

  const cleanChannels = channels.filter(c => c.flowQuality === 'clean').length
  const pollutedChannels = channels.filter(c => c.flowQuality === 'polluted').length
  score += cleanChannels * 5
  score -= pollutedChannels * 10

  const avgReservoirQuality = reservoirs.length > 0
    ? reservoirs.reduce((s, r) => s + r.quality, 0) / reservoirs.length
    : 50
  score = score * 0.6 + avgReservoirQuality * 0.4

  return Math.max(0, Math.min(100, Math.round(score)))
}

// ─── Classify File ─────────────────────────────────────────────────────────────

/**
 * Classify file type in the aqueduct system
 * @example
 * classifyFile(5, 3, 2, 80) // 'spring'
 */
export function classifyFile(
  sources: number,
  channels: number,
  reservoirs: number,
  efficiency: number,
): FileClassification {
  if (sources >= 5 && efficiency >= 70) return 'spring'
  if (reservoirs >= 5) return 'reservoir-hub'
  if (channels >= 4 && sources >= 2) return 'distribution'
  if (channels >= 2 && efficiency >= 50) return 'well'
  if (sources === 0 && channels === 0) return 'dry'
  if (efficiency < 40) return 'drain'
  return 'well'
}

// ─── Network Efficiency ────────────────────────────────────────────────────────

/**
 * Compute network efficiency 0-100
 * @example
 * computeNetworkEfficiency(files, channels) // 72
 */
export function computeNetworkEfficiency(files: AqueductFile[], channels: Channel[]): number {
  if (files.length === 0) return 50
  const avgEfficiency = files.reduce((s, f) => s + f.flowEfficiency, 0) / files.length
  const cleanChannels = channels.filter(c => c.flowQuality === 'clean' || c.flowQuality === 'filtered').length
  const channelRatio = channels.length > 0 ? cleanChannels / channels.length : 0.5
  return Math.max(0, Math.min(100, Math.round(avgEfficiency * 0.7 + channelRatio * 100 * 0.3)))
}

// ─── Water Loss ────────────────────────────────────────────────────────────────

/**
 * Compute water loss percentage
 * @example
 * computeWaterLoss(leaks, channels) // 15
 */
export function computeWaterLoss(leaks: Leak[], channels: Channel[]): number {
  if (channels.length === 0) return leaks.length > 0 ? 100 : 0
  const loss = Math.min(100, Math.round((leaks.length / (channels.length + leaks.length)) * 100))
  return loss
}

// ─── Overall Grade ─────────────────────────────────────────────────────────────

/**
 * Classify overall aqueduct grade
 * @example
 * classifyOverallGrade(85, 80, 1) // 'roman-engineering'
 */
export function classifyOverallGrade(efficiency: number, quality: number, leakCount: number): OverallGrade {
  const combined = (efficiency + quality) / 2
  if (combined >= 80 && leakCount <= 2) return 'roman-engineering'
  if (combined >= 65 && leakCount <= 5) return 'modern-plumbing'
  if (combined >= 45) return 'standard'
  if (leakCount > 10) return 'drought'
  return 'leaky-pipes'
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Generate aqueduct recommendations
 * @example
 * generateRecommendations(files, channels, leaks, reservoirs, stats) // string[]
 */
export function generateRecommendations(
  files: AqueductFile[],
  channels: Channel[],
  leaks: Leak[],
  reservoirs: Reservoir[],
  stats: AqueductStats,
): string[] {
  const recs: string[] = []

  const floods = leaks.filter(l => l.severity === 'flood')
  if (floods.length > 0) {
    recs.push(`Fix ${floods.length} flood-level leak(s) — significant data loss`)
  }

  const stagnant = reservoirs.filter(r => r.isStagnant)
  if (stagnant.length > 0) {
    recs.push(`Remove ${stagnant.length} stagnant reservoir(s) — unused variables`)
  }

  const murky = channels.filter(c => c.flowQuality === 'murky' || c.flowQuality === 'polluted')
  if (murky.length > 0) {
    recs.push(`Improve ${murky.length} murky/polluted channel(s) — add type annotations`)
  }

  const dry = files.filter(f => f.classification === 'dry')
  if (dry.length > 0) {
    recs.push(`Verify purpose of ${dry.length} dry file(s) — no data flow detected`)
  }

  if (stats.waterLoss > 30) {
    recs.push(`High water loss (${stats.waterLoss}%) — significant data going unused`)
  }

  if (stats.overflowingReservoirs > 0) {
    recs.push(`Split ${stats.overflowingReservoirs} overflowing reservoir(s) into smaller units`)
  }

  if (stats.avgFlowEfficiency < 50) {
    recs.push('Low flow efficiency — consider restructuring data paths')
  }

  return Array.from(new Set(recs))
}

// ─── Build Result ──────────────────────────────────────────────────────────────

/**
 * Build the complete aqueduct result
 * @example
 * buildAqueductResult(['a.ts'], ['const x = 1'], {}) // AqueductResult
 */
export function buildAqueductResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): AqueductResult {
  const allChannels: Channel[] = []
  const allReservoirs: Reservoir[] = []
  const allLeaks: Leak[] = []
  const aqueductFiles: AqueductFile[] = []

  for (let i = 0; i < files.length; i++) {
    const content = contents[i]
    const filePath = files[i]

    const sources = identifySources(content, filePath)
    const channels = mapChannels(content, filePath)
    const reservoirs = findReservoirs(content, filePath)
    const leaks = detectLeaks(content, filePath)

    allChannels.push(...channels)
    allReservoirs.push(...reservoirs)
    allLeaks.push(...leaks)

    const flowEfficiency = computeFlowEfficiency(sources.length, channels.length, leaks.length)
    const waterQuality = computeWaterQuality(channels, reservoirs)
    const classification = classifyFile(sources.length, channels.length, reservoirs.length, flowEfficiency)

    aqueductFiles.push({
      file: filePath,
      sources: sources.length,
      channels: channels.length,
      reservoirs: reservoirs.length,
      leaks: leaks.length,
      flowEfficiency,
      waterQuality,
      classification,
    })
  }

  const avg = (arr: number[]) => arr.length > 0
    ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length)
    : 50

  const avgFlowEfficiency = avg(aqueductFiles.map(f => f.flowEfficiency))
  const avgWaterQuality = avg(aqueductFiles.map(f => f.waterQuality))
  const channelLength = allChannels.length > 0
    ? Math.round(allChannels.reduce((s, c) => s + c.length, 0) / allChannels.length)
    : 0
  const networkEfficiency = computeNetworkEfficiency(aqueductFiles, allChannels)
  const waterLoss = computeWaterLoss(allLeaks, allChannels)

  const totalSources = aqueductFiles.reduce((s, f) => s + f.sources, 0)
  const systemCapacity = Math.max(0, Math.min(100,
    Math.round(avgFlowEfficiency * 0.4 + avgWaterQuality * 0.3 + (100 - waterLoss) * 0.3),
  ))

  const overallGrade = classifyOverallGrade(avgFlowEfficiency, avgWaterQuality, allLeaks.length)

  const stats: AqueductStats = {
    totalSources,
    totalChannels: allChannels.length,
    totalReservoirs: allReservoirs.length,
    totalLeaks: allLeaks.length,
    floodLeaks: allLeaks.filter(l => l.severity === 'flood').length,
    stagnantReservoirs: allReservoirs.filter(r => r.isStagnant).length,
    overflowingReservoirs: allReservoirs.filter(r => r.isOverflowing).length,
    avgFlowEfficiency,
    avgWaterQuality,
    springFiles: aqueductFiles.filter(f => f.classification === 'spring').length,
    drainFiles: aqueductFiles.filter(f => f.classification === 'drain').length,
    dryFiles: aqueductFiles.filter(f => f.classification === 'dry').length,
    channelLength,
    networkEfficiency,
    waterLoss,
    systemCapacity,
    overallGrade,
  }

  const recommendations = generateRecommendations(aqueductFiles, allChannels, allLeaks, allReservoirs, stats)

  return {
    files: aqueductFiles,
    channels: allChannels,
    reservoirs: allReservoirs,
    leaks: allLeaks,
    stats,
    recommendations,
  }
}
