// ─── Types ─────────────────────────────────────────────────────────────────────

export type TerrainType = 'peak' | 'valley' | 'ridge' | 'plain' | 'cliff' | 'plateau' | 'crater'
export type DifficultyLevel = 'easy' | 'moderate' | 'challenging' | 'extreme'
export type FeatureType = 'mountain-range' | 'valley' | 'plateau' | 'escarpment' | 'basin' | 'foothills'
export type FeatureDifficulty = 'easy' | 'moderate' | 'challenging' | 'extreme'

export interface TerrainPoint {
  file: string
  elevation: number
  latitude: number
  longitude: number
  terrainType: TerrainType
  contourLevel: number
}

export interface ContourLine {
  level: number
  elevation: number
  files: string[]
  density: number
  isContourInterval: boolean
}

export interface TopographicFeature {
  name: string
  type: FeatureType
  files: string[]
  avgElevation: number
  maxElevation: number
  description: string
  difficulty: FeatureDifficulty
}

export interface ElevationProfile {
  directory: string
  profile: [string, number][]
  avgElevation: number
  gradient: number
  feature: string
}

export interface TerrainMapStats {
  totalPoints: number
  peakCount: number
  valleyCount: number
  avgElevation: number
  maxElevation: number
  minElevation: number
  elevationRange: number
  dominantTerrain: TerrainType
  steepestGradient: string
  flattestArea: string
  contourDensity: number
  overallDifficulty: DifficultyLevel
}

export interface TerrainMapResult {
  points: TerrainPoint[]
  contours: ContourLine[]
  features: TopographicFeature[]
  profiles: ElevationProfile[]
  stats: TerrainMapStats
  recommendations: string[]
}

export interface TerrainMapOptions {
  verbose?: boolean
}

// ─── Content Analysis ──────────────────────────────────────────────────────────

/**
 * Compute cyclomatic complexity.
 *
 * @example
 * computeCyclomaticComplexity('if (a) { if (b) {} }') // => 3
 */
export function computeCyclomaticComplexity(content: string): number {
  const ifCount = (content.match(/\bif\b/g) ?? []).length
  const elseCount = (content.match(/\belse\b/g) ?? []).length
  const switchCount = (content.match(/\bswitch\b/g) ?? []).length
  const caseCount = (content.match(/\bcase\b/g) ?? []).length
  const ternaryCount = (content.match(/\?[^?]/g) ?? []).length
  return 1 + ifCount + elseCount + switchCount + caseCount + ternaryCount
}

/**
 * Compute max nesting depth.
 *
 * @example
 * computeNestingDepth('if (a) { if (b) { if (c) {} } }') // => 3
 */
export function computeNestingDepth(content: string): number {
  let maxDepth = 0
  let depth = 0
  for (const ch of content) {
    if (ch === '{') {
      depth++
      maxDepth = Math.max(maxDepth, depth)
    } else if (ch === '}') {
      depth = Math.max(0, depth - 1)
    }
  }
  return maxDepth
}

/**
 * Count non-blank lines.
 *
 * @example
 * countNonBlankLines('a\n\nb\nc') // => 3
 */
export function countNonBlankLines(content: string): number {
  if (content.length === 0) return 0
  return content.split('\n').filter(l => l.trim().length > 0).length
}

/**
 * Count functions.
 *
 * @example
 * countFunctions('function a() {} const b = () => {}') // => 2
 */
export function countFunctions(content: string): number {
  return (content.match(/\bfunction\s+\w+/g) ?? []).length
    + (content.match(/\w+\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/g) ?? []).length
    + (content.match(/\bconstructor\b/g) ?? []).length
}

// ─── Elevation ─────────────────────────────────────────────────────────────────

/**
 * Compute elevation (complexity score 0-100).
 *
 * @example
 * computeElevation('if (a) { if (b) {} }') // => 30
 */
export function computeElevation(content: string): number {
  if (content.length === 0) return 0

  const complexity = computeCyclomaticComplexity(content)
  const nesting = computeNestingDepth(content)
  const functions = countFunctions(content)
  const lines = countNonBlankLines(content)

  // normalized factors (each 0-25, sum to 0-100)
  const complexityFactor = Math.min(25, (complexity / 20) * 25)
  const nestingFactor = Math.min(25, (nesting / 6) * 25)
  const functionFactor = Math.min(25, (functions / 10) * 25)
  const lineFactor = Math.min(25, (lines / 200) * 25)

  return Math.round(complexityFactor + nestingFactor + functionFactor + lineFactor)
}

/**
 * Compute contour level (0-10, every 10 units).
 *
 * @example
 * computeContourLevel(55) // => 5
 */
export function computeContourLevel(elevation: number): number {
  return Math.min(10, Math.floor(elevation / 10))
}

/**
 * Compute directory depth (latitude).
 *
 * @example
 * computeLatitude('src/commands/app.ts') // => 2
 */
export function computeLatitude(file: string): number {
  return file.split('/').length - 1
}

/**
 * Compute position in directory (longitude).
 *
 * @example
 * computeLongitude('src/commands/app.ts', ['src/commands/app.ts', 'src/commands/b.ts']) // => 0
 */
export function computeLongitude(file: string, allFiles: string[]): number {
  const dir = file.includes('/') ? file.substring(0, file.lastIndexOf('/')) : '.'
  const siblings = allFiles.filter(f => {
    const fDir = f.includes('/') ? f.substring(0, f.lastIndexOf('/')) : '.'
    return fDir === dir
  })
  return siblings.indexOf(file)
}

// ─── Terrain Classification ────────────────────────────────────────────────────

/**
 * Classify terrain type based on elevation and neighbors.
 *
 * @example
 * classifyTerrainType(85, [40, 30]) // => 'peak'
 */
export function classifyTerrainType(elevation: number, neighborElevations: number[]): TerrainType {
  if (neighborElevations.length === 0) {
    if (elevation > 80) return 'peak'
    if (elevation < 20) return 'valley'
    if (elevation >= 40 && elevation <= 60) return 'plateau'
    return 'plain'
  }

  const avgNeighbor = neighborElevations.reduce((a, b) => a + b, 0) / neighborElevations.length
  const maxDiff = Math.max(...neighborElevations.map(n => Math.abs(elevation - n)))

  // peak: high and isolated above surroundings
  if (elevation > 80 && elevation > avgNeighbor + 15) return 'peak'

  // valley: low and surrounded by higher
  if (elevation < 20 && elevation < avgNeighbor - 10) return 'valley'

  // cliff: large elevation jump between adjacent files
  if (maxDiff > 30) return 'cliff'

  // ridge: high, connected chain
  if (elevation >= 60 && elevation <= 80 && avgNeighbor >= 50) return 'ridge'

  // plateau: moderate, uniform
  if (elevation >= 40 && elevation <= 60 && maxDiff <= 15) return 'plateau'

  // plain: low-moderate, uniform
  if (elevation >= 20 && elevation <= 40) return 'plain'

  // crater: low complexity but large (checked separately)
  if (elevation < 20) return 'valley'

  return 'plain'
}

// ─── Contour Lines ─────────────────────────────────────────────────────────────

/**
 * Build contour lines from terrain points.
 *
 * @example
 * buildContourLines(points) // => [{ level: 0, elevation: 0, files: [...], ... }]
 */
export function buildContourLines(points: TerrainPoint[]): ContourLine[] {
  const contours: ContourLine[] = []

  for (let level = 0; level <= 10; level++) {
    const files = points.filter(p => p.contourLevel === level).map(p => p.file)
    if (files.length > 0) {
      contours.push({
        level,
        elevation: level * 10,
        files,
        density: files.length,
        isContourInterval: level % 2 === 0,
      })
    }
  }

  return contours
}

// ─── Feature Identification ────────────────────────────────────────────────────

/**
 * Get directory from file path.
 *
 * @example
 * getDirectory('src/commands/app.ts') // => 'src/commands'
 */
export function getDirectory(file: string): string {
  return file.includes('/') ? file.substring(0, file.lastIndexOf('/')) : '.'
}

/**
 * Identify topographic features.
 *
 * @example
 * identifyFeatures(points, contours) // => [{ name: 'Complex Range', type: 'mountain-range', ... }]
 */
export function identifyFeatures(points: TerrainPoint[], contours: ContourLine[]): TopographicFeature[] {
  const features: TopographicFeature[] = []

  // group points by directory
  const dirGroups = new Map<string, TerrainPoint[]>()
  for (const p of points) {
    const dir = getDirectory(p.file)
    const existing = dirGroups.get(dir) ?? []
    existing.push(p)
    dirGroups.set(dir, existing)
  }

  // mountain-range: 3+ high elevation files in same directory
  for (const [dir, pts] of dirGroups) {
    const highPoints = pts.filter(p => p.elevation >= 60)
    if (highPoints.length >= 3) {
      const avgElev = Math.round(highPoints.reduce((s, p) => s + p.elevation, 0) / highPoints.length)
      const maxElev = Math.max(...highPoints.map(p => p.elevation))
      features.push({
        name: `${dir}/ Range`,
        type: 'mountain-range',
        files: highPoints.map(p => p.file),
        avgElevation: avgElev,
        maxElevation: maxElev,
        description: `${highPoints.length} high-complexity files forming a mountain range`,
        difficulty: classifyFeatureDifficulty(avgElev),
      })
    }
  }

  // valley: cluster of low-elevation files
  for (const [dir, pts] of dirGroups) {
    const lowPoints = pts.filter(p => p.elevation < 20)
    if (lowPoints.length >= 2) {
      const neighbors = points.filter(p => getDirectory(p.file) !== dir && p.elevation > 40)
      if (neighbors.length > 0) {
        features.push({
          name: `${dir} Valley`,
          type: 'valley',
          files: lowPoints.map(p => p.file),
          avgElevation: Math.round(lowPoints.reduce((s, p) => s + p.elevation, 0) / lowPoints.length),
          maxElevation: Math.max(...lowPoints.map(p => p.elevation)),
          description: `${lowPoints.length} low-complexity files in a valley`,
          difficulty: 'easy',
        })
      }
    }
  }

  // plateau: 3+ files at similar elevation (40-60)
  for (const [dir, pts] of dirGroups) {
    const midPoints = pts.filter(p => p.elevation >= 40 && p.elevation <= 60)
    if (midPoints.length >= 3) {
      const elevations = midPoints.map(p => p.elevation)
      const variance = Math.max(...elevations) - Math.min(...elevations)
      if (variance <= 15) {
        features.push({
          name: `${dir} Plateau`,
          type: 'plateau',
          files: midPoints.map(p => p.file),
          avgElevation: Math.round(elevations.reduce((a, b) => a + b, 0) / elevations.length),
          maxElevation: Math.max(...elevations),
          description: `${midPoints.length} files at uniform moderate complexity`,
          difficulty: 'moderate',
        })
      }
    }
  }

  // escarpment: steep gradient from contour density
  const highContours = contours.filter(c => c.elevation >= 70)
  const lowContours = contours.filter(c => c.elevation <= 20)
  if (highContours.length > 0 && lowContours.length > 0) {
    const highFiles = highContours.flatMap(c => c.files)
    const lowFiles = lowContours.flatMap(c => c.files)
    features.push({
      name: 'Complexity Escarpment',
      type: 'escarpment',
      files: [...highFiles.slice(0, 3), ...lowFiles.slice(0, 3)],
      avgElevation: 45,
      maxElevation: Math.max(highFiles.length > 0 ? 100 : 0, lowFiles.length > 0 ? 20 : 0),
      description: 'Steep gradient between simple and complex files',
      difficulty: 'challenging',
    })
  }

  // basin: single directory with low average
  for (const [dir, pts] of dirGroups) {
    if (pts.length >= 3) {
      const avgElev = pts.reduce((s, p) => s + p.elevation, 0) / pts.length
      if (avgElev < 25) {
        features.push({
          name: `${dir} Basin`,
          type: 'basin',
          files: pts.map(p => p.file),
          avgElevation: Math.round(avgElev),
          maxElevation: Math.max(...pts.map(p => p.elevation)),
          description: `${pts.length} files forming a low-complexity basin`,
          difficulty: 'easy',
        })
      }
    }
  }

  // foothills: gradually increasing complexity
  for (const [dir, pts] of dirGroups) {
    if (pts.length >= 4) {
      const sorted = [...pts].sort((a, b) => a.elevation - b.elevation)
      let isGradual = true
      for (let i = 1; i < sorted.length; i++) {
        const diff = sorted[i].elevation - sorted[i - 1].elevation
        if (diff > 20 || diff < 0) {
          isGradual = false
          break
        }
      }
      if (isGradual && sorted[sorted.length - 1].elevation - sorted[0].elevation >= 30) {
        features.push({
          name: `${dir} Foothills`,
          type: 'foothills',
          files: sorted.map(p => p.file),
          avgElevation: Math.round(pts.reduce((s, p) => s + p.elevation, 0) / pts.length),
          maxElevation: sorted[sorted.length - 1].elevation,
          description: `Gradually increasing complexity from ${sorted[0].elevation} to ${sorted[sorted.length - 1].elevation}`,
          difficulty: 'moderate',
        })
      }
    }
  }

  return features
}

/**
 * Classify feature difficulty from average elevation.
 *
 * @example
 * classifyFeatureDifficulty(85) // => 'extreme'
 */
export function classifyFeatureDifficulty(avgElevation: number): FeatureDifficulty {
  if (avgElevation >= 70) return 'extreme'
  if (avgElevation >= 50) return 'challenging'
  if (avgElevation >= 30) return 'moderate'
  return 'easy'
}

// ─── Elevation Profiles ───────────────────────────────────────────────────────

/**
 * Build elevation profiles per directory.
 *
 * @example
 * buildElevationProfiles(points, files) // => [{ directory: 'src', profile: [...], ... }]
 */
export function buildElevationProfiles(points: TerrainPoint[], files: string[]): ElevationProfile[] {
  const dirMap = new Map<string, TerrainPoint[]>()
  for (const p of points) {
    const dir = getDirectory(p.file)
    const existing = dirMap.get(dir) ?? []
    existing.push(p)
    dirMap.set(dir, existing)
  }

  const profiles: ElevationProfile[] = []
  for (const [dir, pts] of dirMap) {
    const sorted = [...pts].sort((a, b) => a.longitude - b.longitude)
    const profile: [string, number][] = sorted.map(p => [p.file, p.elevation])
    const avgElevation = pts.length > 0
      ? Math.round(pts.reduce((s, p) => s + p.elevation, 0) / pts.length)
      : 0
    const gradient = computeGradient(profile)

    let feature = 'mixed terrain'
    if (avgElevation > 70) feature = 'mountainous'
    else if (avgElevation > 50) feature = 'hilly'
    else if (avgElevation > 30) feature = 'rolling'
    else if (avgElevation > 15) feature = 'flatlands'
    else feature = 'plains'

    profiles.push({
      directory: dir,
      profile,
      avgElevation,
      gradient,
      feature,
    })
  }

  return profiles
}

/**
 * Compute gradient (elevation change rate).
 *
 * @example
 * computeGradient([['a.ts', 10], ['b.ts', 30], ['c.ts', 50]]) // => 20
 */
export function computeGradient(profile: [string, number][]): number {
  if (profile.length < 2) return 0
  let totalChange = 0
  for (let i = 1; i < profile.length; i++) {
    totalChange += Math.abs(profile[i][1] - profile[i - 1][1])
  }
  return Math.round(totalChange / (profile.length - 1))
}

// ─── Overall Difficulty ────────────────────────────────────────────────────────

/**
 * Classify overall difficulty.
 *
 * @example
 * classifyOverallDifficulty(35, 80) // => 'moderate'
 */
export function classifyOverallDifficulty(avgElevation: number, maxElevation: number): DifficultyLevel {
  if (avgElevation > 60 || maxElevation > 90) return 'extreme'
  if (avgElevation > 40 || maxElevation > 70) return 'challenging'
  if (avgElevation > 20 || maxElevation > 50) return 'moderate'
  return 'easy'
}

// ─── Find Dominant ─────────────────────────────────────────────────────────────

/**
 * Find the most common value.
 *
 * @example
 * findDominant(['peak', 'valley', 'peak']) // => 'peak'
 */
export function findDominant<T extends string>(values: T[]): T {
  if (values.length === 0) return 'plain' as T
  const counts = new Map<T, number>()
  for (const v of values) {
    counts.set(v, (counts.get(v) ?? 0) + 1)
  }
  let dominant = values[0]
  let maxCount = 0
  for (const [val, count] of counts) {
    if (count > maxCount) {
      maxCount = count
      dominant = val
    }
  }
  return dominant
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Generate terrain map recommendations.
 *
 * @example
 * generateRecommendations(points, features, profiles, stats)
 * // => ['Simplify peak files to reduce complexity...']
 */
export function generateRecommendations(
  points: TerrainPoint[],
  features: TopographicFeature[],
  profiles: ElevationProfile[],
  stats: TerrainMapStats,
): string[] {
  const recs: string[] = []

  const peaks = points.filter(p => p.terrainType === 'peak')
  if (peaks.length > 0) {
    recs.push(`Simplify ${peaks.length} peak file(s) — reduce complexity and add documentation`)
  }

  const cliffs = points.filter(p => p.terrainType === 'cliff')
  if (cliffs.length > 0) {
    recs.push(`Ease ${cliffs.length} cliff transition(s) — create gradual complexity gradients`)
  }

  const ranges = features.filter(f => f.type === 'mountain-range')
  if (ranges.length > 0) {
    recs.push(`Systematically simplify ${ranges.length} mountain range(s) — refactor complex regions`)
  }

  const deepValleys = points.filter(p => p.terrainType === 'valley' && p.elevation < 10)
  if (deepValleys.length > 0) {
    recs.push(`Verify ${deepValleys.length} deep valley file(s) — ensure not under-implemented`)
  }

  if (stats.overallDifficulty === 'extreme') {
    recs.push('Overall terrain is extreme — prioritize complexity reduction across the codebase')
  }

  const steepProfiles = profiles.filter(p => p.gradient > 25)
  if (steepProfiles.length > 0) {
    recs.push(`Smooth steep gradients in ${steepProfiles.length} director(ies) — balance complexity distribution`)
  }

  return recs
}

// ─── Build Result ──────────────────────────────────────────────────────────────

/**
 * Build the full terrain map result.
 *
 * @example
 * buildTerrainMapResult(['app.ts'], ['const x = 1'], {})
 * // => { points: [...], contours: [...], features: [...], ... }
 */
export function buildTerrainMapResult(files: string[], contents: string[], options: TerrainMapOptions): TerrainMapResult {
  // build terrain points
  const elevations: number[] = contents.map(c => computeElevation(c))

  const points: TerrainPoint[] = files.map((file, idx) => {
    const elevation = elevations[idx]
    const contourLevel = computeContourLevel(elevation)
    const latitude = computeLatitude(file)
    const longitude = computeLongitude(file, files)

    // get neighbor elevations (same directory)
    const dir = getDirectory(file)
    const neighborElevations = files
      .filter((f, i) => i !== idx && getDirectory(f) === dir)
      .map((_, i) => elevations[i])

    // crater: low complexity but large file
    const lines = countNonBlankLines(contents[idx])
    let terrainType = classifyTerrainType(elevation, neighborElevations)
    if (terrainType !== 'peak' && terrainType !== 'cliff' && elevation < 20 && lines > 100) {
      terrainType = 'crater'
    }

    return {
      file,
      elevation,
      latitude,
      longitude,
      terrainType,
      contourLevel,
    }
  })

  const contours = buildContourLines(points)
  const features = identifyFeatures(points, contours)
  const profiles = buildElevationProfiles(points, files)

  // stats
  const peakCount = points.filter(p => p.terrainType === 'peak').length
  const valleyCount = points.filter(p => p.terrainType === 'valley').length
  const avgElevation = points.length > 0
    ? Math.round(points.reduce((s, p) => s + p.elevation, 0) / points.length)
    : 0
  const maxElevation = points.length > 0 ? Math.max(...points.map(p => p.elevation)) : 0
  const minElevation = points.length > 0 ? Math.min(...points.map(p => p.elevation)) : 0
  const elevationRange = maxElevation - minElevation

  const dominantTerrain = points.length > 0 ? findDominant(points.map(p => p.terrainType)) : 'plain'

  const sortedProfiles = [...profiles].sort((a, b) => b.gradient - a.gradient)
  const steepestGradient = sortedProfiles.length > 0 ? sortedProfiles[0].directory : ''
  const flattestProfiles = [...profiles].sort((a, b) => a.gradient - b.gradient)
  const flattestArea = flattestProfiles.length > 0 ? flattestProfiles[0].directory : ''

  const contourDensity = contours.length > 0
    ? Math.round(points.length / contours.length)
    : 0

  const overallDifficulty = classifyOverallDifficulty(avgElevation, maxElevation)

  const stats: TerrainMapStats = {
    totalPoints: points.length,
    peakCount,
    valleyCount,
    avgElevation,
    maxElevation,
    minElevation,
    elevationRange,
    dominantTerrain,
    steepestGradient,
    flattestArea,
    contourDensity,
    overallDifficulty,
  }

  const recommendations = generateRecommendations(points, features, profiles, stats)

  return { points, contours, features, profiles, stats, recommendations }
}
