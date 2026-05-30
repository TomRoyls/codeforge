// ─── Types ─────────────────────────────────────────────────────────────────────

export type Polarity = 'positive' | 'negative' | 'neutral'
export type ConnectionType = 'attract' | 'repel' | 'indifferent'
export type FileClassification = 'superconductor' | 'conductor' | 'resistor' | 'insulator' | 'antimatter'
export type PoleType = 'north' | 'south'
export type AnomalyType = 'unexpected-coupling' | 'reverse-dependency' | 'long-range-attraction' | 'shielded-file' | 'magnetic-monopole'
export type AnomalySeverity = 'curious' | 'notable' | 'concerning' | 'alarming'
export type FieldLineType = 'dependency' | 'data-flow' | 'control-flow' | 'type-reference'
export type OverallField = 'harmonious' | 'ordered' | 'disturbed' | 'chaotic' | 'singularity'
export type PoleRisk = 'none' | 'low' | 'medium' | 'high'

export interface MagneticConnection {
  from: string
  to: string
  type: ConnectionType
  strength: number
  distance: number
  isExpected: boolean
  isAnomalous: boolean
}

export interface MagneticFile {
  file: string
  polarity: Polarity
  fieldStrength: number
  charge: number
  connections: MagneticConnection[]
  isPole: boolean
  isAnomaly: boolean
  classification: FileClassification
}

export interface FieldLine {
  path: string[]
  strength: number
  type: FieldLineType
  isCoherent: boolean
  bends: number
}

export interface MagneticPole {
  file: string
  type: PoleType
  strength: number
  description: string
  risk: PoleRisk
  affectedBy: string[]
}

export interface MagneticAnomaly {
  type: AnomalyType
  files: string[]
  severity: AnomalySeverity
  description: string
  investigation: string
}

export interface MagneticStats {
  totalFiles: number
  positivePolarity: number
  negativePolarity: number
  neutralPolarity: number
  avgFieldStrength: number
  maxFieldStrength: number
  superconductors: number
  insulators: number
  antimatter: number
  totalPoles: number
  northPoles: number
  southPoles: number
  totalAnomalies: number
  alarmingAnomalies: number
  avgConnectionStrength: number
  fieldCoherence: number
  couplingEntropy: number
  overallField: OverallField
}

export interface MagneticResult {
  files: MagneticFile[]
  connections: MagneticConnection[]
  fieldLines: FieldLine[]
  poles: MagneticPole[]
  anomalies: MagneticAnomaly[]
  stats: MagneticStats
  recommendations: string[]
}

// ─── Helper Functions ───────────────────────────────────────────────────────────

/**
 * Extract local imports from file content
 * @example
 * extractLocalImports("import { x } from './y'", 'src/a.ts') // ['./src/y.ts']
 */
function extractLocalImports(content: string, filePath: string): string[] {
  const matches = content.match(/from\s+['"]\.\/([^'"]+)['"]/g) || []
  const dir = filePath.split('/').slice(0, -1).join('/')
  return Array.from(new Set(matches.map(m => {
    const depName = m.replace(/from\s+['"]\.\/([^'"]+)['"]/, '$1')
    return dir ? `${dir}/${depName}` : depName
  })))
}

/**
 * Count exports in file content
 * @example
 * countExports('export const x = 1; export function f() {}') // 2
 */
function countExports(content: string): number {
  return (content.match(/export\s+/g) || []).length
}

/**
 * Count imports in file content
 * @example
 * countImports("import { x } from 'y'; import z from 'w'") // 2
 */
function countImports(content: string): number {
  return (content.match(/import\s+/g) || []).length
}

/**
 * Compute directory distance between two file paths
 * @example
 * directoryDistance('src/a.ts', 'src/b.ts') // 0
 */
function directoryDistance(a: string, b: string): number {
  const dirA = a.split('/').slice(0, -1)
  const dirB = b.split('/').slice(0, -1)
  let shared = 0
  for (let i = 0; i < Math.min(dirA.length, dirB.length); i++) {
    if (dirA[i] === dirB[i]) shared++
    else break
  }
  return (dirA.length - shared) + (dirB.length - shared)
}

// ─── Connection Mapping ─────────────────────────────────────────────────────────

/**
 * Map all magnetic connections between files
 * @example
 * mapConnections(['a.ts', 'b.ts'], ["import { x } from './b'", "export const x = 1"]) // MagneticConnection[]
 */
export function mapConnections(files: string[], contents: string[]): MagneticConnection[] {
  const connections: MagneticConnection[] = []
  const fileSet = new Set(files)

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const content = contents[i]
    if (file === undefined || content === undefined) continue
    const imports = extractLocalImports(content, file)
    for (const dep of imports) {
      const matchingFile = files.find(f => f.startsWith(dep) || dep.startsWith(f.replace(/\.\w+$/, '')))
      if (matchingFile && fileSet.has(matchingFile)) {
        const dist = directoryDistance(file, matchingFile)
        const matchingContent = contents[files.indexOf(matchingFile)]
        const sharedSymbols = (content.match(/\w+/g) || []).filter(w =>
          (matchingContent ?? '').includes(w)
        ).length
        const strength = Math.min(100, Math.max(10, Math.round(sharedSymbols / 5)))

        const isExpected = dist <= 2
        const isAnomalous = dist > 3 || !isExpected

        connections.push({
          from: file,
          to: matchingFile,
          type: 'attract',
          strength,
          distance: dist,
          isExpected,
          isAnomalous,
        })
      }
    }
  }

  for (let i = 0; i < files.length; i++) {
    const fileA = files[i]
    if (fileA === undefined) continue
    for (let j = i + 1; j < files.length; j++) {
      const fileB = files[j]
      if (fileB === undefined) continue
      const alreadyConnected = connections.some(
        c => (c.from === fileA && c.to === fileB) || (c.from === fileB && c.to === fileA)
      )
      if (!alreadyConnected) {
        const dist = directoryDistance(fileA, fileB)
        if (dist <= 1) {
          connections.push({
            from: fileA,
            to: fileB,
            type: 'repel',
            strength: 10,
            distance: dist,
            isExpected: true,
            isAnomalous: false,
          })
        }
      }
    }
  }

  return connections
}

// ─── File Measurement ───────────────────────────────────────────────────────────

/**
 * Measure the magnetic field for a single file
 * @example
 * measureMagneticField('export const x = 1', 'a.ts', files, connections) // MagneticFile
 */
export function measureMagneticField(
  content: string,
  filePath: string,
  allFiles: string[],
  connections: MagneticConnection[],
): MagneticFile {
  const exports = countExports(content)
  const imports = countImports(content)

  const attractedBy = connections.filter(c => c.to === filePath)
  const attractedTo = connections.filter(c => c.from === filePath)
  const fileConnections = [...attractedBy, ...attractedTo]

  const fieldStrength = Math.min(100, Math.round(
    (attractedBy.length * 15) + (exports * 5)
  ))

  const charge = Math.max(-100, Math.min(100, exports * 5 - imports * 5))

  let polarity: Polarity = 'neutral'
  if (charge >= 10) polarity = 'positive'
  else if (charge <= -10) polarity = 'negative'

  const isPole = fieldStrength >= 60 || (exports === 0 && imports === 0 && allFiles.length > 1)
  const isAnomaly = fileConnections.some(c => c.isAnomalous)

  const classification = classifyFile(fieldStrength, charge, fileConnections)

  return {
    file: filePath,
    polarity,
    fieldStrength,
    charge,
    connections: fileConnections,
    isPole,
    isAnomaly,
    classification,
  }
}

// ─── Classification ─────────────────────────────────────────────────────────────

/**
 * Classify a file based on its magnetic properties
 * @example
 * classifyFile(80, 50, connections) // 'superconductor'
 */
export function classifyFile(
  fieldStrength: number,
  charge: number,
  connections: MagneticConnection[],
): FileClassification {
  const attractCount = connections.filter(c => c.type === 'attract').length

  if (fieldStrength >= 70 && attractCount >= 3) return 'superconductor'
  if (fieldStrength >= 50 && attractCount >= 1) return 'conductor'
  if (connections.length > 0 && attractCount < connections.length * 0.3) return 'insulator'
  if (Math.abs(charge) >= 80 && connections.length <= 1) return 'antimatter'
  return 'resistor'
}

// ─── Field Lines ────────────────────────────────────────────────────────────────

/**
 * Trace field lines through the dependency graph
 * @example
 * traceFieldLines(connections) // FieldLine[]
 */
export function traceFieldLines(connections: MagneticConnection[]): FieldLine[] {
  const attractConns = connections.filter(c => c.type === 'attract')
  const lines: FieldLine[] = []

  const fromMap = new Map<string, MagneticConnection[]>()
  for (const c of attractConns) {
    if (!fromMap.has(c.from)) fromMap.set(c.from, [])
    fromMap.get(c.from)!.push(c)
  }

  const visited = new Set<string>()
  for (const start of fromMap.keys()) {
    if (visited.has(start)) continue

    const path: string[] = [start]
    let current = start
    let bends = 0
    let totalStrength = 0
    let steps = 0

    while (fromMap.has(current) && steps < 10) {
      const next = fromMap.get(current)!.find(c => !path.includes(c.to))
      if (!next) break
      path.push(next.to)
      totalStrength += next.strength
      if (next.distance > 2) bends++
      visited.add(current)
      current = next.to
      steps++
    }

    if (path.length >= 2) {
      const avgStrength = Math.round(totalStrength / (path.length - 1))
      const isCoherent = bends <= 1
      lines.push({
        path,
        strength: avgStrength,
        type: 'dependency',
        isCoherent,
        bends,
      })
    }
  }

  return lines
}

// ─── Pole Identification ────────────────────────────────────────────────────────

/**
 * Identify magnetic poles in the codebase
 * @example
 * identifyPoles(magneticFiles) // MagneticPole[]
 */
export function identifyPoles(files: MagneticFile[]): MagneticPole[] {
  const poles: MagneticPole[] = []

  const sorted = [...files].sort((a, b) => b.fieldStrength - a.fieldStrength)
  const topCount = Math.max(1, Math.ceil(files.length * 0.2))

  for (let i = 0; i < Math.min(topCount, sorted.length); i++) {
    const f = sorted[i]
    if (!f) continue
    if (f.fieldStrength < 20) continue

    const affectedBy = f.connections
      .filter(c => c.type === 'attract')
      .map(c => c.from === f.file ? c.to : c.from)

    const risk: PoleRisk = f.fieldStrength >= 70 ? 'high'
      : f.fieldStrength >= 50 ? 'medium'
      : f.fieldStrength >= 30 ? 'low'
      : 'none'

    poles.push({
      file: f.file,
      type: 'north',
      strength: f.fieldStrength,
      description: `Strong attractor — ${f.connections.filter(c => c.type === 'attract').length} dependent file(s)`,
      risk,
      affectedBy: Array.from(new Set(affectedBy)),
    })
  }

  const southCandidates = files.filter(f => f.polarity === 'negative' && f.connections.filter(c => c.type === 'attract').length >= 2)
  for (const f of southCandidates.slice(0, 5)) {
    poles.push({
      file: f.file,
      type: 'south',
      strength: Math.abs(f.charge),
      description: `Heavy importer — depends on ${f.connections.filter(c => c.type === 'attract').length} file(s)`,
      risk: 'low',
      affectedBy: [],
    })
  }

  return poles
}

// ─── Anomaly Detection ──────────────────────────────────────────────────────────

/**
 * Detect magnetic anomalies in the codebase
 * @example
 * detectAnomalies(connections, magneticFiles) // MagneticAnomaly[]
 */
export function detectAnomalies(
  connections: MagneticConnection[],
  files: MagneticFile[],
): MagneticAnomaly[] {
  const anomalies: MagneticAnomaly[] = []

  const longRange = connections.filter(c => c.type === 'attract' && c.distance > 3)
  for (const c of longRange) {
    anomalies.push({
      type: 'long-range-attraction',
      files: [c.from, c.to],
      severity: c.distance > 5 ? 'alarming' : c.distance > 4 ? 'concerning' : 'notable',
      description: `${c.from} and ${c.to} are ${c.distance} directories apart but strongly coupled`,
      investigation: 'Consider if this coupling is necessary or if abstractions can reduce it',
    })
  }

  const anomalousConns = connections.filter(c => c.isAnomalous && c.type === 'attract')
  if (anomalousConns.length > 0) {
    anomalies.push({
      type: 'unexpected-coupling',
      files: Array.from(new Set(anomalousConns.flatMap(c => [c.from, c.to]))),
      severity: anomalousConns.length > 3 ? 'concerning' : 'curious',
      description: `${anomalousConns.length} unexpected coupling connection(s) detected`,
      investigation: 'Review whether these dependencies follow the intended architecture',
    })
  }

  for (const f of files) {
    const imports = f.connections.filter(c => c.from === f.file && c.type === 'attract').length
    const exports = f.connections.filter(c => c.to === f.file && c.type === 'attract').length
    if (imports === 0 && exports === 0 && f.connections.length > 0) {
      anomalies.push({
        type: 'shielded-file',
        files: [f.file],
        severity: 'curious',
        description: `${f.file} has no direct attraction connections despite being in the codebase`,
        investigation: 'Verify this file serves its intended purpose and is correctly integrated',
      })
    }
  }

  const monopoles = files.filter(f => {
    const hasExports = f.connections.some(c => c.to === f.file && c.type === 'attract')
    const hasImports = f.connections.some(c => c.from === f.file && c.type === 'attract')
    return (hasExports && !hasImports) || (!hasExports && hasImports)
  })
  if (monopoles.length > 0 && files.length > 2) {
    anomalies.push({
      type: 'magnetic-monopole',
      files: monopoles.map(m => m.file).slice(0, 5),
      severity: 'curious',
      description: `${monopoles.length} file(s) only import or only export — magnetic monopoles`,
      investigation: 'Consider whether these files need bidirectional integration',
    })
  }

  return anomalies
}

// ─── Field Metrics ──────────────────────────────────────────────────────────────

/**
 * Compute field coherence (0-100)
 * @example
 * computeFieldCoherence(connections, fieldLines) // 75
 */
export function computeFieldCoherence(connections: MagneticConnection[], fieldLines: FieldLine[]): number {
  if (connections.length === 0) return 100

  const coherentLines = fieldLines.filter(fl => fl.isCoherent).length
  const lineRatio = fieldLines.length > 0 ? coherentLines / fieldLines.length : 1

  const expectedConns = connections.filter(c => c.isExpected).length
  const connRatio = expectedConns / connections.length

  return Math.round(lineRatio * 50 + connRatio * 50)
}

/**
 * Compute coupling entropy (0-100, higher = more disorder)
 * @example
 * computeCouplingEntropy(files, connections) // 30
 */
export function computeCouplingEntropy(files: MagneticFile[], connections: MagneticConnection[]): number {
  if (files.length <= 1) return 0

  const degrees = files.map(f => f.connections.filter(c => c.type === 'attract').length)
  const maxDegree = Math.max(...degrees)
  const minDegree = Math.min(...degrees)
  const spread = maxDegree - minDegree

  const anomalous = connections.filter(c => c.isAnomalous).length
  const anomalousRatio = connections.length > 0 ? anomalous / connections.length : 0

  const disconnected = files.filter(f => f.connections.length === 0).length
  const disconnectedRatio = disconnected / files.length

  return Math.max(0, Math.min(100, Math.round(
    (spread / Math.max(1, files.length)) * 60 +
    anomalousRatio * 25 +
    disconnectedRatio * 15
  )))
}

/**
 * Classify the overall field state
 * @example
 * classifyOverallField(80, 20) // 'harmonious'
 */
export function classifyOverallField(coherence: number, entropy: number): OverallField {
  if (coherence >= 80 && entropy <= 20) return 'harmonious'
  if (coherence >= 60 && entropy <= 40) return 'ordered'
  if (coherence >= 40 && entropy <= 60) return 'disturbed'
  if (entropy >= 70) return 'chaotic'
  return 'singularity'
}

// ─── Recommendations ────────────────────────────────────────────────────────────

/**
 * Generate magnetic analysis recommendations
 * @example
 * generateMagneticRecommendations(files, poles, anomalies, stats) // string[]
 */
export function generateMagneticRecommendations(
  files: MagneticFile[],
  poles: MagneticPole[],
  anomalies: MagneticAnomaly[],
  stats: MagneticStats,
): string[] {
  const recs: string[] = []

  const highRiskPoles = poles.filter(p => p.risk === 'high')
  if (highRiskPoles.length > 0) {
    recs.push(`Stabilize ${highRiskPoles.length} high-risk north pole(s) — many files depend on them`)
  }

  const alarming = anomalies.filter(a => a.severity === 'alarming')
  if (alarming.length > 0) {
    recs.push(`Investigate ${alarming.length} alarming anomaly(ies) — potential architectural issues`)
  }

  if (stats.couplingEntropy > 60) {
    recs.push('High coupling entropy — reduce unnecessary dependencies to simplify the field')
  }

  const antimatterFiles = files.filter(f => f.classification === 'antimatter')
  if (antimatterFiles.length > 0) {
    recs.push(`Verify ${antimatterFiles.length} antimatter file(s) serve a purpose — they are nearly disconnected`)
  }

  const superconductors = files.filter(f => f.classification === 'superconductor')
  if (superconductors.length > 0) {
    recs.push(`${superconductors.length} superconductor file(s) carry heavy load — ensure they are well-tested`)
  }

  return Array.from(new Set(recs))
}

// ─── Build Result ───────────────────────────────────────────────────────────────

/**
 * Build the complete magnetic result
 * @example
 * buildMagneticResult(['a.ts'], ['export const x = 1'], {}) // MagneticResult
 */
export function buildMagneticResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): MagneticResult {
  const connections = mapConnections(files, contents)

  const magneticFiles: MagneticFile[] = files.map((file, i) => {
    const content = contents[i]
    if (content === undefined) return measureMagneticField('', file, files, connections)
    return measureMagneticField(content, file, files, connections)
  })

  const fieldLines = traceFieldLines(connections)
  const poles = identifyPoles(magneticFiles)
  const anomalies = detectAnomalies(connections, magneticFiles)

  const avg = (arr: number[]) => arr.length > 0
    ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length)
    : 0

  const avgFieldStrength = avg(magneticFiles.map(f => f.fieldStrength))
  const maxFieldStrength = magneticFiles.length > 0
    ? Math.max(...magneticFiles.map(f => f.fieldStrength))
    : 0

  const avgConnStrength = connections.length > 0
    ? avg(connections.map(c => c.strength))
    : 0

  const fieldCoherence = computeFieldCoherence(connections, fieldLines)
  const couplingEntropy = computeCouplingEntropy(magneticFiles, connections)
  const overallField = classifyOverallField(fieldCoherence, couplingEntropy)

  const stats: MagneticStats = {
    totalFiles: files.length,
    positivePolarity: magneticFiles.filter(f => f.polarity === 'positive').length,
    negativePolarity: magneticFiles.filter(f => f.polarity === 'negative').length,
    neutralPolarity: magneticFiles.filter(f => f.polarity === 'neutral').length,
    avgFieldStrength,
    maxFieldStrength,
    superconductors: magneticFiles.filter(f => f.classification === 'superconductor').length,
    insulators: magneticFiles.filter(f => f.classification === 'insulator').length,
    antimatter: magneticFiles.filter(f => f.classification === 'antimatter').length,
    totalPoles: poles.length,
    northPoles: poles.filter(p => p.type === 'north').length,
    southPoles: poles.filter(p => p.type === 'south').length,
    totalAnomalies: anomalies.length,
    alarmingAnomalies: anomalies.filter(a => a.severity === 'alarming').length,
    avgConnectionStrength: avgConnStrength,
    fieldCoherence,
    couplingEntropy,
    overallField,
  }

  const recommendations = generateMagneticRecommendations(magneticFiles, poles, anomalies, stats)

  return { files: magneticFiles, connections, fieldLines, poles, anomalies, stats, recommendations }
}
