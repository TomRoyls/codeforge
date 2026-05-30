// ─── Interfaces ──────────────────────────────────────────

export interface ConnectingMeasure {
  connectivity: number
  gem:
    | 'flawless-setting'
    | 'well-set-gem'
    | 'proper-mount'
    | 'loose-stone'
    | 'unmounted'
    | 'no-connectivity'
  hasHighConnectivity: boolean
  hasWellImported: boolean
  hasNoOrphaned: boolean
  hasExported: boolean
  hasNoHidden: boolean
  hasLinked: boolean
  hasNoIsolated: boolean
  hasIntegrated: boolean
  hasNoDisconnected: boolean
  hasReferenced: boolean
  hasDocumented: boolean
  hasTyped: boolean
  hasNoUntyped: boolean
  hasPublicAPI: boolean
  hasClearInterface: boolean
  orphanedCount: number
  isolatedCount: number
}

export interface RadiatingMeasure {
  radiance: number
  nexus:
    | 'brilliant-nexus'
    | 'bright-core'
    | 'proper-glow'
    | 'dim-center'
    | 'dark-point'
    | 'no-radiance'
  hasHighRadiance: boolean
  hasCoordinated: boolean
  hasNoConflicting: boolean
  hasHarmonious: boolean
  hasNoClashing: boolean
  hasCentral: boolean
  hasOrganized: boolean
  hasNoScattered: boolean
  hasEfficient: boolean
  hasNoWasteful: boolean
  hasLuminous: boolean
  hasVisible: boolean
  hasClear: boolean
  hasStructured: boolean
  hasFocused: boolean
  hasAligned: boolean
  conflictingCount: number
  scatteredCount: number
}

export interface HarmonizingMeasure {
  harmony: number
  matrix:
    | 'perfect-harmony'
    | 'melodic-pattern'
    | 'proper-rhythm'
    | 'discordant'
    | 'cacophony'
    | 'no-harmony'
  hasHighHarmony: boolean
  hasConsistent: boolean
  hasNoContradictory: boolean
  hasBalanced: boolean
  hasNoExtreme: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasUniform: boolean
  hasDependable: boolean
  hasPredictable: boolean
  hasSymmetrical: boolean
  hasRhythmic: boolean
  hasProportional: boolean
  hasElegant: boolean
  contradictoryCount: number
  untestedCount: number
}

export interface NetworkingMeasure {
  quality: number
  lattice:
    | 'perfect-lattice'
    | 'strong-network'
    | 'proper-mesh'
    | 'weak-links'
    | 'broken-chain'
    | 'no-network'
  hasHighQuality: boolean
  hasCommunicating: boolean
  hasNoSilent: boolean
  hasTransparent: boolean
  hasNoOpaque: boolean
  hasFlowing: boolean
  hasNoBlocked: boolean
  hasConnected: boolean
  hasNoBroken: boolean
  hasResponsive: boolean
  hasReliable: boolean
  hasFast: boolean
  hasAccurate: boolean
  hasDirect: boolean
  hasClean: boolean
  hasFaithful: boolean
  silentCount: number
  blockedCount: number
}

export interface AccumulatingMeasure {
  wisdom: number
  emerald:
    | 'ancient-gem'
    | 'wise-crystal'
    | 'proper-stone'
    | 'raw-mineral'
    | 'pebble'
    | 'no-wisdom'
  hasHighWisdom: boolean
  hasWellArchitected: boolean
  hasNoHacked: boolean
  hasPrincipled: boolean
  hasNoAdHoc: boolean
  hasProven: boolean
  hasDeep: boolean
  hasMature: boolean
  hasPatterned: boolean
  hasInsightful: boolean
  hasStrategic: boolean
  hasVisionary: boolean
  hasConnected: boolean
  hasNoShallow: boolean
  hasEvolved: boolean
  hasRefined: boolean
  hackedCount: number
  adHocCount: number
}

export type NodeCondition =
  | 'emerald-masterpiece'
  | 'nexus-prime'
  | 'proper-crystal'
  | 'cloudy-gem'
  | 'rough-stone'
  | 'void'

export interface EmeraldNode {
  file: string
  gemConnectivity: number
  nexusRadiance: number
  matrixHarmony: number
  crystalNetwork: number
  emeraldWisdom: number
  connecting: ConnectingMeasure
  radiating: RadiatingMeasure
  harmonizing: HarmonizingMeasure
  networking: NetworkingMeasure
  accumulating: AccumulatingMeasure
  condition: NodeCondition
  qualityScore: number
  celebration?: string
}

export type ClusterCondition =
  | 'emerald-cathedral'
  | 'crystal-palace'
  | 'proper-grotto'
  | 'dull-cave'
  | 'empty-void'
  | 'void'

export interface EmeraldCluster {
  directory: string
  nodes: EmeraldNode[]
  avgConnectivity: number
  avgRadiance: number
  avgWisdom: number
  emeraldMasterpieceCount: number
  voidCount: number
  clusterType: 'grand-nexus' | 'crystal-hub' | 'proper-node' | 'minor-link' | 'disconnected' | 'no-cluster'
  condition: ClusterCondition
}

export interface EmeraldNexusResult {
  nodes: EmeraldNode[]
  clusters: EmeraldCluster[]
  network: {
    avgConnectivity: number
    avgRadiance: number
    avgWisdom: number
    isEmerald: boolean
    overallRadiance: number
  }
  stats: {
    totalFiles: number
    totalClusters: number
    avgGemConnectivity: number
    avgNexusRadiance: number
    avgMatrixHarmony: number
    avgCrystalNetwork: number
    avgEmeraldWisdom: number
    emeraldMasterpieceCount: number
    nexusPrimeCount: number
    properCrystalCount: number
    cloudyGemCount: number
    roughStoneCount: number
    voidCount: number
    hasHighConnectivityCount: number
    hasHighRadianceCount: number
    hasHighHarmonyCount: number
    hasHighQualityCount: number
    hasHighWisdomCount: number
    overallRadiance: number
    architectGrade: 'nexus-architect' | 'crystal-engineer' | 'gem-setter' | 'apprentice' | 'novice' | 'rock-collector'
    bestNode: string
    mostConnected: string
    mostRadiant: string
    mostHarmonious: string
    bestNetworked: string
    wisest: string
    celebration?: string
  }
  recommendations: string[]
}

// ─── Score computation ──────────────────────────────────

function computeScore(positiveBooleans: boolean[]): number {
  const total = positiveBooleans.length
  const perFeature = total > 0 ? Math.floor(100 / total) : 0
  const remainder = total > 0 ? 100 - perFeature * total : 0
  let score = 0
  for (let i = 0; i < total; i++) {
    if (positiveBooleans[i]) {
      score += perFeature + (i < remainder ? 1 : 0)
    }
  }
  return score
}

// ─── Classifiers ────────────────────────────────────────

/** @example classifyCondition(90) */
export function classifyCondition(score: number): NodeCondition {
  if (score >= 90) return 'emerald-masterpiece'
  if (score >= 75) return 'nexus-prime'
  if (score >= 60) return 'proper-crystal'
  if (score >= 40) return 'cloudy-gem'
  if (score >= 20) return 'rough-stone'
  return 'void'
}

/** @example classifyClusterType(nodes) */
export function classifyClusterType(
  nodes: EmeraldNode[],
): EmeraldCluster['clusterType'] {
  if (nodes.length === 0) return 'no-cluster'
  const avg =
    nodes.reduce((s, n) => s + n.qualityScore, 0) / nodes.length
  if (avg >= 85) return 'grand-nexus'
  if (avg >= 70) return 'crystal-hub'
  if (avg >= 55) return 'proper-node'
  if (avg >= 35) return 'minor-link'
  return 'disconnected'
}

/** @example classifyClusterCondition(80) */
export function classifyClusterCondition(score: number): ClusterCondition {
  if (score >= 85) return 'emerald-cathedral'
  if (score >= 70) return 'crystal-palace'
  if (score >= 55) return 'proper-grotto'
  if (score >= 35) return 'dull-cave'
  if (score >= 15) return 'empty-void'
  return 'void'
}

/** @example classifyArchitectGrade(80) */
export function classifyArchitectGrade(
  avgRadiance: number,
): EmeraldNexusResult['stats']['architectGrade'] {
  if (avgRadiance >= 80) return 'nexus-architect'
  if (avgRadiance >= 65) return 'crystal-engineer'
  if (avgRadiance >= 50) return 'gem-setter'
  if (avgRadiance >= 35) return 'apprentice'
  if (avgRadiance >= 20) return 'novice'
  return 'rock-collector'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureConnecting('import { x } from "y"; export { x }') */
export function measureConnecting(content: string): ConnectingMeasure {
  const hasWellImported = /\bimport\b/.test(content)
  const orphanedCount = (content.match(/\/\/\s*(todo|fixme|hack)/gi) ?? []).length
  const hasNoOrphaned = orphanedCount === 0
  const hasExported = /\bexport\b/.test(content)
  const hasNoHidden = !/\b(secret|hidden|obscure)\b/i.test(content)
  const hasLinked = /\b(import|export)\b/.test(content)
  const isolatedCount = (content.match(/\bglobal\b/g) ?? []).length
  const hasNoIsolated = isolatedCount === 0
  const hasIntegrated = /\b(class|interface|type)\b/.test(content)
  const hasNoDisconnected = (content.match(/\beval\s*\(/g) ?? []).length === 0
  const hasReferenced = /\b(const|let|function|class)\b/.test(content)
  const hasDocumented = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasTyped = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasNoUntyped = !/\bany\b/.test(content)
  const hasPublicAPI = /\b(export|public)\b/.test(content)
  const hasClearInterface = /\b(interface|type)\b/.test(content)

  const positiveBooleans = [
    hasWellImported,
    hasNoOrphaned,
    hasExported,
    hasNoHidden,
    hasLinked,
    hasNoIsolated,
    hasIntegrated,
    hasNoDisconnected,
    hasReferenced,
    hasDocumented,
    hasTyped,
    hasNoUntyped,
    hasPublicAPI,
    hasClearInterface,
  ]

  const connectivity = computeScore(positiveBooleans)
  const hasHighConnectivity = connectivity >= 60

  let gem: ConnectingMeasure['gem'] = 'no-connectivity'
  if (connectivity >= 90) gem = 'flawless-setting'
  else if (connectivity >= 75) gem = 'well-set-gem'
  else if (connectivity >= 60) gem = 'proper-mount'
  else if (connectivity >= 40) gem = 'loose-stone'
  else if (connectivity >= 20) gem = 'unmounted'

  return {
    connectivity,
    gem,
    hasHighConnectivity,
    hasWellImported,
    hasNoOrphaned,
    hasExported,
    hasNoHidden,
    hasLinked,
    hasNoIsolated,
    hasIntegrated,
    hasNoDisconnected,
    hasReferenced,
    hasDocumented,
    hasTyped,
    hasNoUntyped,
    hasPublicAPI,
    hasClearInterface,
    orphanedCount,
    isolatedCount,
  }
}

/** @example measureRadiating('export class X { async run(): Promise<void> {} }') */
export function measureRadiating(content: string): RadiatingMeasure {
  const hasCoordinated = /\b(class|interface|type)\b/.test(content)
  const conflictingCount = (content.match(/\b(conflict|clash|contradict)\b/gi) ?? []).length
  const hasNoConflicting = conflictingCount === 0
  const hasHarmonious = /\b(readonly|as const)\b/.test(content)
  const hasNoClashing = !/\b(clash|discord|incompatible)\b/i.test(content)
  const hasCentral = /\b(export|public)\b/.test(content)
  const hasOrganized = /\b(import|export)\b/.test(content)
  const scatteredCount = (content.match(/\b(var|eval)\b/g) ?? []).length
  const hasNoScattered = scatteredCount === 0
  const hasEfficient = /\b(const|readonly)\b/.test(content)
  const hasNoWasteful = !/\b(waste|redundant|duplicate)\b/i.test(content)
  const hasLuminous = /\b(async|await|Promise)\b/.test(content)
  const hasVisible = /\b(try|catch|if)\b/.test(content)
  const hasClear = /:\s*(string|number|boolean|void)\b/.test(content)
  const hasStructured = /\b(private|protected|public)\b/.test(content)
  const hasFocused = /\b(return|throw)\b/.test(content)
  const hasAligned = /\b(function|=>|return)\b/.test(content)

  const positiveBooleans = [
    hasCoordinated,
    hasNoConflicting,
    hasHarmonious,
    hasNoClashing,
    hasCentral,
    hasOrganized,
    hasNoScattered,
    hasEfficient,
    hasNoWasteful,
    hasLuminous,
    hasVisible,
    hasClear,
    hasStructured,
    hasFocused,
    hasAligned,
  ]

  const radiance = computeScore(positiveBooleans)
  const hasHighRadiance = radiance >= 60

  let nexus: RadiatingMeasure['nexus'] = 'no-radiance'
  if (radiance >= 90) nexus = 'brilliant-nexus'
  else if (radiance >= 75) nexus = 'bright-core'
  else if (radiance >= 60) nexus = 'proper-glow'
  else if (radiance >= 40) nexus = 'dim-center'
  else if (radiance >= 20) nexus = 'dark-point'

  return {
    radiance,
    nexus,
    hasHighRadiance,
    hasCoordinated,
    hasNoConflicting,
    hasHarmonious,
    hasNoClashing,
    hasCentral,
    hasOrganized,
    hasNoScattered,
    hasEfficient,
    hasNoWasteful,
    hasLuminous,
    hasVisible,
    hasClear,
    hasStructured,
    hasFocused,
    hasAligned,
    conflictingCount,
    scatteredCount,
  }
}

/** @example measureHarmonizing('const x: readonly string = ""') */
export function measureHarmonizing(content: string): HarmonizingMeasure {
  const hasConsistent = /\b(const|readonly)\b/.test(content)
  const contradictoryCount = (content.match(/\b(contradict|inconsistent|conflict)\b/gi) ?? []).length
  const hasNoContradictory = contradictoryCount === 0
  const hasBalanced = /\b(readonly|as const)\b/.test(content)
  const hasNoExtreme = !/\bany\b/.test(content)
  const hasTested = /\b(try|catch|throw|if)\b/.test(content)
  const untestedCount = (content.match(/\bvar\b/g) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasTypeSafe = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasNoUnsafe = (content.match(/\beval\s*\(/g) ?? []).length === 0
  const hasUniform = /\b(import|export)\b/.test(content)
  const hasDependable = /\b(private|protected|public)\b/.test(content)
  const hasPredictable = /\b(function|class|interface)\b/.test(content)
  const hasSymmetrical = /\b(async|await|Promise)\b/.test(content)
  const hasRhythmic = /\b(export|public)\b/.test(content)
  const hasProportional = /\b(string|number|boolean)\b/.test(content)
  const hasElegant = /\b(return|throw)\b/.test(content)

  const positiveBooleans = [
    hasConsistent,
    hasNoContradictory,
    hasBalanced,
    hasNoExtreme,
    hasTested,
    hasNoUntested,
    hasTypeSafe,
    hasNoUnsafe,
    hasUniform,
    hasDependable,
    hasPredictable,
    hasSymmetrical,
    hasRhythmic,
    hasProportional,
    hasElegant,
  ]

  const harmony = computeScore(positiveBooleans)
  const hasHighHarmony = harmony >= 60

  let matrix: HarmonizingMeasure['matrix'] = 'no-harmony'
  if (harmony >= 90) matrix = 'perfect-harmony'
  else if (harmony >= 75) matrix = 'melodic-pattern'
  else if (harmony >= 60) matrix = 'proper-rhythm'
  else if (harmony >= 40) matrix = 'discordant'
  else if (harmony >= 20) matrix = 'cacophony'

  return {
    harmony,
    matrix,
    hasHighHarmony,
    hasConsistent,
    hasNoContradictory,
    hasBalanced,
    hasNoExtreme,
    hasTested,
    hasNoUntested,
    hasTypeSafe,
    hasNoUnsafe,
    hasUniform,
    hasDependable,
    hasPredictable,
    hasSymmetrical,
    hasRhythmic,
    hasProportional,
    hasElegant,
    contradictoryCount,
    untestedCount,
  }
}

/** @example measureNetworking('import { x } from "y"; export class X { }') */
export function measureNetworking(content: string): NetworkingMeasure {
  const hasCommunicating = /\b(import|export)\b/.test(content)
  const silentCount = (content.match(/\b(var|eval)\b/g) ?? []).length
  const hasNoSilent = silentCount === 0
  const hasTransparent = /\b(export|public)\b/.test(content)
  const hasNoOpaque = !/\b(secret|hidden|obscure)\b/i.test(content)
  const hasFlowing = /\b(async|await|Promise)\b/.test(content)
  const blockedCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoBlocked = blockedCount === 0
  const hasConnected = /\b(class|interface|type)\b/.test(content)
  const hasNoBroken = (content.match(/\beval\s*\(/g) ?? []).length === 0
  const hasResponsive = /\b(try|catch|if)\b/.test(content)
  const hasReliable = /\b(readonly|private|protected)\b/.test(content)
  const hasFast = /\b(const|readonly)\b/.test(content)
  const hasAccurate = /:\s*(string|number|boolean|void)\b/.test(content)
  const hasDirect = /\b(return|throw)\b/.test(content)
  const hasClean = !/\b(dirty|hacky|gross)\b/i.test(content)
  const hasFaithful = /\b(function|=>|return)\b/.test(content)

  const positiveBooleans = [
    hasCommunicating,
    hasNoSilent,
    hasTransparent,
    hasNoOpaque,
    hasFlowing,
    hasNoBlocked,
    hasConnected,
    hasNoBroken,
    hasResponsive,
    hasReliable,
    hasFast,
    hasAccurate,
    hasDirect,
    hasClean,
    hasFaithful,
  ]

  const quality = computeScore(positiveBooleans)
  const hasHighQuality = quality >= 60

  let lattice: NetworkingMeasure['lattice'] = 'no-network'
  if (quality >= 90) lattice = 'perfect-lattice'
  else if (quality >= 75) lattice = 'strong-network'
  else if (quality >= 60) lattice = 'proper-mesh'
  else if (quality >= 40) lattice = 'weak-links'
  else if (quality >= 20) lattice = 'broken-chain'

  return {
    quality,
    lattice,
    hasHighQuality,
    hasCommunicating,
    hasNoSilent,
    hasTransparent,
    hasNoOpaque,
    hasFlowing,
    hasNoBlocked,
    hasConnected,
    hasNoBroken,
    hasResponsive,
    hasReliable,
    hasFast,
    hasAccurate,
    hasDirect,
    hasClean,
    hasFaithful,
    silentCount,
    blockedCount,
  }
}

/** @example measureAccumulating('class X implements Y { readonly z: string }') */
export function measureAccumulating(content: string): AccumulatingMeasure {
  const hasWellArchitected = /\b(class|interface|type)\b/.test(content)
  const hackedCount = (content.match(/\b(hack|workaround|monkey)\b/gi) ?? []).length
  const hasNoHacked = hackedCount === 0
  const hasPrincipled = /\b(readonly|private|protected)\b/.test(content)
  const adHocCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoAdHoc = adHocCount === 0
  const hasProven = /\b(export|public)\b/.test(content)
  const hasDeep = /\b(interface|type)\b/.test(content)
  const hasMature = /\b(readonly|as const)\b/.test(content)
  const hasPatterned = /\b(function|class|interface)\b/.test(content)
  const hasInsightful = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasStrategic = /\b(import|export)\b/.test(content)
  const hasVisionary = /\b(async|await|Promise)\b/.test(content)
  const hasConnected = /\b(try|catch|if)\b/.test(content)
  const hasNoShallow = !/\b(quick|dirty|temporary)\b/i.test(content)
  const hasEvolved = /:\s*(string|number|boolean|void)\b/.test(content)
  const hasRefined = /\b(return|throw)\b/.test(content)

  const positiveBooleans = [
    hasWellArchitected,
    hasNoHacked,
    hasPrincipled,
    hasNoAdHoc,
    hasProven,
    hasDeep,
    hasMature,
    hasPatterned,
    hasInsightful,
    hasStrategic,
    hasVisionary,
    hasConnected,
    hasNoShallow,
    hasEvolved,
    hasRefined,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60

  let emerald: AccumulatingMeasure['emerald'] = 'no-wisdom'
  if (wisdom >= 90) emerald = 'ancient-gem'
  else if (wisdom >= 75) emerald = 'wise-crystal'
  else if (wisdom >= 60) emerald = 'proper-stone'
  else if (wisdom >= 40) emerald = 'raw-mineral'
  else if (wisdom >= 20) emerald = 'pebble'

  return {
    wisdom,
    emerald,
    hasHighWisdom,
    hasWellArchitected,
    hasNoHacked,
    hasPrincipled,
    hasNoAdHoc,
    hasProven,
    hasDeep,
    hasMature,
    hasPatterned,
    hasInsightful,
    hasStrategic,
    hasVisionary,
    hasConnected,
    hasNoShallow,
    hasEvolved,
    hasRefined,
    hackedCount,
    adHocCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeEmeraldNode(content, 'app.ts') */
export function analyzeEmeraldNode(content: string, filePath: string): EmeraldNode {
  const connecting = measureConnecting(content)
  const radiating = measureRadiating(content)
  const harmonizing = measureHarmonizing(content)
  const networking = measureNetworking(content)
  const accumulating = measureAccumulating(content)

  const gemConnectivity = connecting.connectivity
  const nexusRadiance = radiating.radiance
  const matrixHarmony = harmonizing.harmony
  const crystalNetwork = networking.quality
  const emeraldWisdom = accumulating.wisdom

  const qualityScore = Math.round(
    gemConnectivity * 0.2 +
    nexusRadiance * 0.2 +
    matrixHarmony * 0.2 +
    crystalNetwork * 0.2 +
    emeraldWisdom * 0.2,
  )

  const condition = classifyCondition(qualityScore)

  const celebration =
    content.includes('emerald-nexus') || content.includes('emerald-matrix')
      ? '★ Milestone #580 — Emerald Nexus ★'
      : undefined

  return {
    file: filePath,
    gemConnectivity,
    nexusRadiance,
    matrixHarmony,
    crystalNetwork,
    emeraldWisdom,
    connecting,
    radiating,
    harmonizing,
    networking,
    accumulating,
    condition,
    qualityScore,
    celebration,
  }
}

/** @example analyzeEmeraldCluster(nodes, 'src') */
export function analyzeEmeraldCluster(nodes: EmeraldNode[], dirPath: string): EmeraldCluster {
  if (nodes.length === 0) {
    return {
      directory: dirPath,
      nodes: [],
      avgConnectivity: 0,
      avgRadiance: 0,
      avgWisdom: 0,
      emeraldMasterpieceCount: 0,
      voidCount: 0,
      clusterType: 'no-cluster',
      condition: 'void',
    }
  }

  const avgConnectivity = Math.round(
    nodes.reduce((s, n) => s + n.gemConnectivity, 0) / nodes.length,
  )
  const avgRadiance = Math.round(
    nodes.reduce((s, n) => s + n.nexusRadiance, 0) / nodes.length,
  )
  const avgWisdom = Math.round(
    nodes.reduce((s, n) => s + n.emeraldWisdom, 0) / nodes.length,
  )

  const emeraldMasterpieceCount = nodes.filter(
    (n) => n.condition === 'emerald-masterpiece',
  ).length
  const voidCount = nodes.filter((n) => n.condition === 'void').length

  const clusterType = classifyClusterType(nodes)
  const avgQuality = Math.round(
    nodes.reduce((s, n) => s + n.qualityScore, 0) / nodes.length,
  )
  const condition = classifyClusterCondition(avgQuality)

  return {
    directory: dirPath,
    nodes,
    avgConnectivity,
    avgRadiance,
    avgWisdom,
    emeraldMasterpieceCount,
    voidCount,
    clusterType,
    condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildEmeraldNexusResult(['a.ts'], [content]) */
export async function buildEmeraldNexusResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<EmeraldNexusResult> {
  const nodes: EmeraldNode[] = files.map((file, i) =>
    analyzeEmeraldNode(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, EmeraldNode[]>()
  for (const node of nodes) {
    const dir = node.file.includes('/')
      ? node.file.substring(0, node.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(node)
    } else {
      dirMap.set(dir, [node])
    }
  }

  const clusters: EmeraldCluster[] = Array.from(dirMap.entries()).map(([dir, dirNodes]) =>
    analyzeEmeraldCluster(dirNodes, dir),
  )

  const avgConnectivity =
    nodes.length > 0
      ? Math.round(nodes.reduce((s, n) => s + n.gemConnectivity, 0) / nodes.length)
      : 0
  const avgRadiance =
    nodes.length > 0
      ? Math.round(nodes.reduce((s, n) => s + n.nexusRadiance, 0) / nodes.length)
      : 0
  const avgWisdom =
    nodes.length > 0
      ? Math.round(nodes.reduce((s, n) => s + n.emeraldWisdom, 0) / nodes.length)
      : 0

  const overallRadiance =
    nodes.length > 0
      ? Math.round(nodes.reduce((s, n) => s + n.qualityScore, 0) / nodes.length)
      : 0
  const isEmerald = overallRadiance >= 60

  const network = { avgConnectivity, avgRadiance, avgWisdom, isEmerald, overallRadiance }

  const avgGemConnectivity = avgConnectivity
  const avgNexusRadiance = avgRadiance
  const avgMatrixHarmony =
    nodes.length > 0
      ? Math.round(nodes.reduce((s, n) => s + n.matrixHarmony, 0) / nodes.length)
      : 0
  const avgCrystalNetwork =
    nodes.length > 0
      ? Math.round(nodes.reduce((s, n) => s + n.crystalNetwork, 0) / nodes.length)
      : 0
  const avgEmeraldWisdom = avgWisdom

  const emeraldMasterpieceCount = nodes.filter(
    (n) => n.condition === 'emerald-masterpiece',
  ).length
  const nexusPrimeCount = nodes.filter(
    (n) => n.condition === 'nexus-prime',
  ).length
  const properCrystalCount = nodes.filter(
    (n) => n.condition === 'proper-crystal',
  ).length
  const cloudyGemCount = nodes.filter(
    (n) => n.condition === 'cloudy-gem',
  ).length
  const roughStoneCount = nodes.filter(
    (n) => n.condition === 'rough-stone',
  ).length
  const voidCount = nodes.filter((n) => n.condition === 'void').length

  const hasHighConnectivityCount = nodes.filter(
    (n) => n.connecting.hasHighConnectivity,
  ).length
  const hasHighRadianceCount = nodes.filter(
    (n) => n.radiating.hasHighRadiance,
  ).length
  const hasHighHarmonyCount = nodes.filter(
    (n) => n.harmonizing.hasHighHarmony,
  ).length
  const hasHighQualityCount = nodes.filter(
    (n) => n.networking.hasHighQuality,
  ).length
  const hasHighWisdomCount = nodes.filter(
    (n) => n.accumulating.hasHighWisdom,
  ).length

  const architectGrade = classifyArchitectGrade(overallRadiance)

  const bestNode = nodes.length > 0
    ? nodes.reduce((best, n) => (n.qualityScore > best.qualityScore ? n : best)).file
    : ''
  const mostConnected = nodes.length > 0
    ? nodes.reduce((best, n) => (n.gemConnectivity > best.gemConnectivity ? n : best)).file
    : ''
  const mostRadiant = nodes.length > 0
    ? nodes.reduce((best, n) => (n.nexusRadiance > best.nexusRadiance ? n : best)).file
    : ''
  const mostHarmonious = nodes.length > 0
    ? nodes.reduce((best, n) => (n.matrixHarmony > best.matrixHarmony ? n : best)).file
    : ''
  const bestNetworked = nodes.length > 0
    ? nodes.reduce((best, n) => (n.crystalNetwork > best.crystalNetwork ? n : best)).file
    : ''
  const wisest = nodes.length > 0
    ? nodes.reduce((best, n) => (n.emeraldWisdom > best.emeraldWisdom ? n : best)).file
    : ''

  const hasCelebration = nodes.some((n) => n.celebration)
  const celebration = hasCelebration
    ? '★ Milestone #580 — 580 commands forged in the emerald fire ★'
    : undefined

  const stats: EmeraldNexusResult['stats'] = {
    totalFiles: files.length,
    totalClusters: clusters.length,
    avgGemConnectivity,
    avgNexusRadiance,
    avgMatrixHarmony,
    avgCrystalNetwork,
    avgEmeraldWisdom,
    emeraldMasterpieceCount,
    nexusPrimeCount,
    properCrystalCount,
    cloudyGemCount,
    roughStoneCount,
    voidCount,
    hasHighConnectivityCount,
    hasHighRadianceCount,
    hasHighHarmonyCount,
    hasHighQualityCount,
    hasHighWisdomCount,
    overallRadiance,
    architectGrade,
    bestNode,
    mostConnected,
    mostRadiant,
    mostHarmonious,
    bestNetworked,
    wisest,
    celebration,
  }

  const recommendations = generateRecommendations(nodes, clusters, network, stats)

  return { nodes, clusters, network, stats, recommendations }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(nodes, clusters, network, stats) */
export function generateRecommendations(
  nodes: EmeraldNode[],
  clusters: EmeraldCluster[],
  _network: EmeraldNexusResult['network'],
  stats: EmeraldNexusResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgGemConnectivity >= 90 &&
    stats.avgNexusRadiance >= 90 &&
    stats.avgMatrixHarmony >= 90 &&
    stats.avgCrystalNetwork >= 90 &&
    stats.avgEmeraldWisdom >= 90
  ) {
    recs.push(
      'Your emerald nexus is a masterpiece of crystalline connection! Every gem amplifies the light of all others!',
    )
    return recs
  }

  if (stats.avgGemConnectivity < 60) {
    recs.push(
      'Set the gems more carefully — code should connect like emeralds in a shared setting, each reflecting light to its neighbors',
    )
  }

  if (stats.avgNexusRadiance < 60) {
    recs.push(
      'Ignite the nexus — code should radiate from a brilliant core that illuminates the entire network',
    )
  }

  if (stats.avgMatrixHarmony < 60) {
    recs.push(
      'Tune the matrix — code should harmonize like a lattice of emeralds creating patterns no single gem could achieve alone',
    )
  }

  if (stats.avgCrystalNetwork < 60) {
    recs.push(
      'Strengthen the crystal network — code should transmit information with the flawless efficiency of a perfect crystal lattice',
    )
  }

  if (stats.avgEmeraldWisdom < 60) {
    recs.push(
      'Deepen the emerald wisdom — code should carry the accumulated knowledge of millennia, each connection richer than the last',
    )
  }

  if (stats.overallRadiance < 40) {
    recs.push(
      'The nexus has gone dark — recrystallize the entire network before the emerald light fades entirely',
    )
  }

  const voidNodes = nodes.filter((n) => n.condition === 'void')
  if (voidNodes.length > 0 && voidNodes.length <= 5) {
    recs.push(
      `Re-examine these uncut stones: ${voidNodes.map((n) => n.file).join(', ')}`,
    )
  } else if (voidNodes.length > 5) {
    recs.push(
      `Re-examine these ${voidNodes.length} uncut stones before the entire nexus fractures`,
    )
  }

  const poorClusters = clusters.filter(
    (c) => c.condition === 'void' || c.condition === 'dull-cave',
  )
  if (poorClusters.length === clusters.length && clusters.length > 0) {
    recs.push(
      'All clusters have lost their crystalline structure — the emerald nexus needs complete geological reconstruction',
    )
  }

  if (recs.length === 0) {
    recs.push('Your emerald nexus pulses with verdant intelligence — every gem amplifies the wisdom of the whole')
  }

  return recs
}
