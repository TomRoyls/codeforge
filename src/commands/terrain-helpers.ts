// ─── Types ────────────────────────────────────────────────────────────────────

export type TerrainType = 'mountain' | 'hill' | 'plain' | 'valley'
export type FeatureType = 'mountain' | 'hill' | 'plain' | 'valley' | 'cliff' | 'plateau' | 'canyon' | 'ridge'
export type DangerLevel = 'safe' | 'caution' | 'dangerous' | 'extreme'

export interface TerrainTile {
  file: string
  elevation: number
  area: number
  temperature: number
  vegetation: number
  water: number
  terrain: TerrainType
}

export interface TerrainFeature {
  name: string
  type: FeatureType
  files: string[]
  description: string
  elevation: number
  area: number
  dangerLevel: DangerLevel
}

export interface TerrainStats {
  totalFiles: number
  averageElevation: number
  maxElevation: number
  minElevation: number
  mountains: number
  valleys: number
  plains: number
  dangerZones: number
  averageTemperature: number
  averageVegetation: number
  averageWater: number
}

export interface TerrainResult {
  tiles: TerrainTile[]
  features: TerrainFeature[]
  stats: TerrainStats
  legend: string[]
  recommendations: string[]
}

export interface TerrainOptions {
  verbose?: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(Math.round(value), min), max)
}

/**
 * Compute cyclomatic complexity from content.
 *
 * @example
 * computeCyclomaticComplexity('if (x) { while (y) {} }')
 */
export function computeCyclomaticComplexity(content: string): number {
  const patterns = [
    /\bif\b/g,
    /\belse\s+if\b/g,
    /\bfor\b/g,
    /\bwhile\b/g,
    /\bcase\b/g,
    /\bcatch\b/g,
    /\?\?/g,
    /\?\./g,
    /&&/g,
    /\|\|/g,
    /\bswitch\b/g,
  ]
  let complexity = 1
  for (const pattern of patterns) {
    const matches = content.match(pattern)
    if (matches) complexity += matches.length
  }
  return complexity
}

/**
 * Compute elevation (0-100) from cyclomatic complexity.
 *
 * @example
 * computeElevation(5)
 */
export function computeElevation(complexity: number): number {
  if (complexity <= 1) return 5
  if (complexity <= 3) return 15
  if (complexity <= 5) return 25
  if (complexity <= 10) return 40
  if (complexity <= 15) return 55
  if (complexity <= 20) return 65
  if (complexity <= 30) return 75
  if (complexity <= 50) return 85
  return 95
}

/**
 * Classify terrain by elevation.
 *
 * @example
 * classifyTerrain(65)
 */
export function classifyTerrain(elevation: number): TerrainType {
  if (elevation >= 60) return 'mountain'
  if (elevation >= 40) return 'hill'
  if (elevation >= 20) return 'plain'
  return 'valley'
}

/**
 * Compute temperature (0-100) representing change frequency.
 *
 * @example
 * computeTemperature(5)
 */
export function computeTemperature(changeCount: number): number {
  if (changeCount <= 1) return clamp(changeCount * 10, 0, 100)
  if (changeCount <= 5) return clamp(10 + changeCount * 8, 0, 100)
  if (changeCount <= 15) return clamp(50 + (changeCount - 5) * 3, 0, 100)
  return clamp(80 + (changeCount - 15), 0, 100)
}

/**
 * Compute vegetation (0-100) — comment/doc density.
 *
 * @example
 * computeVegetation('// comment\nconst x = 1')
 */
export function computeVegetation(content: string): number {
  const lines = content.split('\n')
  if (lines.length === 0) return 0
  const commentLines = lines.filter((l) => {
    const trimmed = l.trimStart()
    return trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/**') || trimmed.startsWith('/*')
  }).length
  const totalLines = lines.length
  const ratio = commentLines / totalLines
  return clamp(ratio * 200, 0, 100)
}

/**
 * Compute water (0-100) — test coverage indicator.
 *
 * @example
 * computeWater(true, 10)
 */
export function computeWater(hasTestFile: boolean, testAssertions: number): number {
  if (!hasTestFile) return 0
  if (testAssertions === 0) return 15
  if (testAssertions <= 3) return 30
  if (testAssertions <= 10) return 50
  if (testAssertions <= 25) return 70
  return 90
}

/**
 * Compute danger level from tile.
 *
 * @example
 * computeDangerLevel(tile)
 */
export function computeDangerLevel(tile: TerrainTile): DangerLevel {
  if (tile.elevation >= 70 && tile.water <= 20) return 'extreme'
  if (tile.elevation >= 60 && tile.water <= 30) return 'dangerous'
  if (tile.elevation >= 40 && tile.water <= 40) return 'caution'
  if (tile.elevation >= 50 && tile.vegetation <= 15) return 'caution'
  return 'safe'
}

/**
 * Build a terrain tile for a single file.
 *
 * @example
 * buildTile('index.ts', content, 3, true, 5)
 */
export function buildTile(
  file: string,
  content: string,
  changeCount: number,
  hasTestFile: boolean,
  testAssertions: number,
): TerrainTile {
  const complexity = computeCyclomaticComplexity(content)
  const elevation = computeElevation(complexity)
  const area = content.split('\n').length
  const temperature = computeTemperature(changeCount)
  const vegetation = computeVegetation(content)
  const water = computeWater(hasTestFile, testAssertions)
  const terrain = classifyTerrain(elevation)
  return { file, elevation, area, temperature, vegetation, water, terrain }
}

// ─── Feature Detection ────────────────────────────────────────────────────────

/**
 * Identify geographic features from tiles.
 *
 * @example
 * identifyFeatures(tiles)
 */
export function identifyFeatures(tiles: TerrainTile[]): TerrainFeature[] {
  const features: TerrainFeature[] = []
  if (tiles.length === 0) return features

  const sorted = [...tiles].sort((a, b) => b.elevation - a.elevation)

  const mountainFiles = tiles.filter((t) => t.terrain === 'mountain')
  if (mountainFiles.length >= 2) {
    const topMountains = sorted.filter((t) => t.elevation >= 65).slice(0, 10)
    features.push({
      name: 'Mountain Range',
      type: 'mountain',
      files: topMountains.map((t) => t.file),
      description: `Cluster of ${topMountains.length} high-complexity files forming a mountain range`,
      elevation: Math.round(topMountains.reduce((s, t) => s + t.elevation, 0) / topMountains.length),
      area: topMountains.reduce((s, t) => s + t.area, 0),
      dangerLevel: topMountains.some((t) => computeDangerLevel(t) === 'extreme') ? 'extreme' : 'dangerous',
    })
  }

  const valleyFiles = tiles.filter((t) => t.terrain === 'valley')
  if (valleyFiles.length >= 2) {
    features.push({
      name: 'Valley',
      type: 'valley',
      files: valleyFiles.slice(0, 10).map((t) => t.file),
      description: `${valleyFiles.length} low-complexity files forming a peaceful valley`,
      elevation: Math.round(valleyFiles.reduce((s, t) => s + t.elevation, 0) / valleyFiles.length),
      area: valleyFiles.reduce((s, t) => s + t.area, 0),
      dangerLevel: 'safe',
    })
  }

  const plainFiles = tiles.filter((t) => t.terrain === 'plain')
  if (plainFiles.length >= 3) {
    features.push({
      name: 'Plains',
      type: 'plain',
      files: plainFiles.slice(0, 10).map((t) => t.file),
      description: `${plainFiles.length} files of moderate complexity stretching across the plains`,
      elevation: Math.round(plainFiles.reduce((s, t) => s + t.elevation, 0) / plainFiles.length),
      area: plainFiles.reduce((s, t) => s + t.area, 0),
      dangerLevel: 'safe',
    })
  }

  if (tiles.length >= 2) {
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1]!
      const curr = sorted[i]!
      if (prev.elevation - curr.elevation >= 35) {
        features.push({
          name: `Cliff at ${prev.file}`,
          type: 'cliff',
          files: [prev.file, curr.file],
          description: `Sharp complexity drop from ${prev.file} (${prev.elevation}) to ${curr.file} (${curr.elevation})`,
          elevation: prev.elevation,
          area: prev.area + curr.area,
          dangerLevel: 'caution',
        })
        break
      }
    }
  }

  const plateauGroups = findPlateaus(tiles)
  if (plateauGroups.length > 0) {
    const largest = plateauGroups.reduce((a, b) => a.length >= b.length ? a : b)
    if (largest.length >= 3) {
      features.push({
        name: 'Plateau',
        type: 'plateau',
        files: largest.map((t) => t.file),
        description: `${largest.length} files with uniform complexity (plateau at elevation ${largest[0]!.elevation})`,
        elevation: largest[0]!.elevation,
        area: largest.reduce((s, t) => s + t.area, 0),
        dangerLevel: 'safe',
      })
    }
  }

  const canyonFiles = tiles.filter((t) => t.water <= 10 && t.elevation >= 30)
  if (canyonFiles.length >= 2) {
    features.push({
      name: 'Canyon',
      type: 'canyon',
      files: canyonFiles.slice(0, 10).map((t) => t.file),
      description: `${canyonFiles.length} files with minimal test coverage in a dry canyon`,
      elevation: Math.round(canyonFiles.reduce((s, t) => s + t.elevation, 0) / canyonFiles.length),
      area: canyonFiles.reduce((s, t) => s + t.area, 0),
      dangerLevel: canyonFiles.some((t) => t.elevation >= 60) ? 'extreme' : 'dangerous',
    })
  }

  const hillFiles = tiles.filter((t) => t.terrain === 'hill')
  if (hillFiles.length >= 2) {
    features.push({
      name: 'Ridge',
      type: 'ridge',
      files: hillFiles.slice(0, 10).map((t) => t.file),
      description: `${hillFiles.length} medium-complexity files forming a ridge`,
      elevation: Math.round(hillFiles.reduce((s, t) => s + t.elevation, 0) / hillFiles.length),
      area: hillFiles.reduce((s, t) => s + t.area, 0),
      dangerLevel: 'caution',
    })
  }

  return features
}

function findPlateaus(tiles: TerrainTile[]): TerrainTile[][] {
  const groups: TerrainTile[][] = []
  const byElevation = new Map<number, TerrainTile[]>()

  for (const tile of tiles) {
    const rounded = Math.round(tile.elevation / 5) * 5
    const bucket = byElevation.get(rounded) ?? []
    bucket.push(tile)
    byElevation.set(rounded, bucket)
  }

  for (const group of byElevation.values()) {
    if (group.length >= 3) {
      groups.push(group)
    }
  }

  return groups
}

// ─── Stats ────────────────────────────────────────────────────────────────────

/**
 * Compute terrain stats.
 *
 * @example
 * computeTerrainStats(tiles)
 */
export function computeTerrainStats(tiles: TerrainTile[]): TerrainStats {
  if (tiles.length === 0) {
    return {
      totalFiles: 0, averageElevation: 0, maxElevation: 0, minElevation: 0,
      mountains: 0, valleys: 0, plains: 0, dangerZones: 0,
      averageTemperature: 0, averageVegetation: 0, averageWater: 0,
    }
  }

  const elevations = tiles.map((t) => t.elevation)
  const avg = (arr: number[]) => Math.round(arr.reduce((s, v) => s + v, 0) / arr.length)

  return {
    totalFiles: tiles.length,
    averageElevation: avg(elevations),
    maxElevation: Math.max(...elevations),
    minElevation: Math.min(...elevations),
    mountains: tiles.filter((t) => t.terrain === 'mountain').length,
    valleys: tiles.filter((t) => t.terrain === 'valley').length,
    plains: tiles.filter((t) => t.terrain === 'plain').length,
    dangerZones: tiles.filter((t) => computeDangerLevel(t) !== 'safe').length,
    averageTemperature: avg(tiles.map((t) => t.temperature)),
    averageVegetation: avg(tiles.map((t) => t.vegetation)),
    averageWater: avg(tiles.map((t) => t.water)),
  }
}

// ─── Legend ───────────────────────────────────────────────────────────────────

/**
 * Generate terrain legend.
 *
 * @example
 * generateLegend()
 */
export function generateLegend(): string[] {
  return [
    '⛰  Mountain: High complexity (elevation 60-100)',
    '🏔  Hill: Medium complexity (elevation 40-59)',
    ' Meadow: Low complexity (elevation 20-39)',
    ' Valley: Minimal complexity (elevation 0-19)',
    '🔥 Temperature: Change frequency (0=cold, 100=hot)',
    '🌿 Vegetation: Comment/doc density (0=barren, 100=lush)',
    '💧 Water: Test coverage (0=dry, 100=well-tested)',
    '⚠  Danger: safe < caution < dangerous < extreme',
  ]
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Generate terrain recommendations.
 *
 * @example
 * generateTerrainRecommendations(features, stats)
 */
export function generateTerrainRecommendations(features: TerrainFeature[], stats: TerrainStats): string[] {
  const recs: string[] = []

  const mountains = features.filter((f) => f.type === 'mountain')
  if (mountains.length > 0) {
    recs.push(`Mountain range detected (${mountains[0]!.files.length} peaks) — bring climbing gear: add tests and documentation`)
  }

  const canyons = features.filter((f) => f.type === 'canyon')
  if (canyons.length > 0) {
    recs.push(`Canyon detected (${canyons[0]!.files.length} dry files) — irrigate with tests`)
  }

  const cliffs = features.filter((f) => f.type === 'cliff')
  if (cliffs.length > 0) {
    recs.push(`Cliff detected — install safety rails by refactoring complexity jumps`)
  }

  if (stats.dangerZones > stats.totalFiles * 0.3) {
    recs.push(`${stats.dangerZones} danger zones out of ${stats.totalFiles} files — consider reducing complexity`)
  }

  if (stats.averageVegetation < 20) {
    recs.push('Sparse vegetation — add more comments and documentation')
  }

  if (stats.averageWater < 30) {
    recs.push('Arid codebase — increase test coverage to irrigate your terrain')
  }

  if (stats.mountains > stats.totalFiles * 0.5) {
    recs.push('More mountains than plains — consider simplifying complex code')
  }

  if (recs.length === 0) {
    recs.push('Terrain looks healthy — well-balanced complexity and coverage')
  }

  return recs
}

// ─── buildTerrainResult ───────────────────────────────────────────────────────

/**
 * Build the complete terrain analysis result.
 *
 * @example
 * buildTerrainResult(['a.ts'], ['const x = 1'])
 */
export function buildTerrainResult(
  files: string[],
  contents: string[],
  _options?: TerrainOptions,
): TerrainResult {
  const tiles: TerrainTile[] = files.map((file, i) => {
    const content = contents[i] ?? ''
    const changeCount = Math.floor(Math.random() * 5) + 1
    const hasTestFile = file.includes('.test.') || file.includes('.spec.')
    const testAssertions = hasTestFile ? Math.floor(content.split('\n').length / 3) : 0
    return buildTile(file, content, changeCount, hasTestFile, testAssertions)
  })

  const features = identifyFeatures(tiles)
  const stats = computeTerrainStats(tiles)
  const legend = generateLegend()
  const recommendations = generateTerrainRecommendations(features, stats)

  return { tiles, features, stats, legend, recommendations }
}

/**
 * Build terrain result with deterministic inputs (for testing).
 *
 * @example
 * buildTerrainResultDeterministic(['a.ts'], ['code'], [3], [false], [0])
 */
export function buildTerrainResultDeterministic(
  files: string[],
  contents: string[],
  changeCounts: number[],
  hasTestFiles: boolean[],
  testAssertions: number[],
  _options?: TerrainOptions,
): TerrainResult {
  const tiles: TerrainTile[] = files.map((file, i) =>
    buildTile(
      file,
      contents[i] ?? '',
      changeCounts[i] ?? 1,
      hasTestFiles[i] ?? false,
      testAssertions[i] ?? 0,
    ),
  )

  const features = identifyFeatures(tiles)
  const stats = computeTerrainStats(tiles)
  const legend = generateLegend()
  const recommendations = generateTerrainRecommendations(features, stats)

  return { tiles, features, stats, legend, recommendations }
}
