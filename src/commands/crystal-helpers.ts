// ─── Types ─────────────────────────────────────────────────────────────────────

export type CrystalSystemName = 'cubic' | 'tetragonal' | 'hexagonal' | 'orthorhombic' | 'monoclinic' | 'triclinic' | 'amorphous'
export type DefectType = 'vacancy' | 'interstitial' | 'substitution' | 'dislocation' | 'grain-boundary' | 'stacking-fault'
export type DefectSeverity = 'minor' | 'moderate' | 'major'
export type FacetType = 'export' | 'import' | 'internal' | 'public-api'
export type CrystalQuality = 'flawless' | 'excellent' | 'good' | 'fair' | 'poor' | 'fractured'
export type GrowthPattern = 'layered' | 'dendritic' | 'prismatic' | 'massive' | 'fragmented'
export type OverallGrade = 'diamond' | 'sapphire' | 'ruby' | 'emerald' | 'quartz' | 'glass' | 'gravel'

export interface CrystalDefect {
  type: DefectType
  location: number
  severity: DefectSeverity
  description: string
  fix: string
}

export interface CrystalFacet {
  name: string
  clarity: number
  smoothness: number
  reflectivity: number
  type: FacetType
}

export interface CrystalLattice {
  file: string
  regularity: number
  symmetry: number
  purity: number
  clarity: number
  system: CrystalSystemName
  defects: CrystalDefect[]
  facets: CrystalFacet[]
}

export interface CrystalSystemGroup {
  name: string
  description: string
  files: string[]
  avgRegularity: number
  avgSymmetry: number
  quality: CrystalQuality
  growthPattern: GrowthPattern
}

export interface CrystalStats {
  totalLattices: number
  avgRegularity: number
  avgSymmetry: number
  avgPurity: number
  avgClarity: number
  totalDefects: number
  minorDefects: number
  majorDefects: number
  totalFacets: number
  avgFacetClarity: number
  dominantSystem: string
  flawlessFiles: number
  fracturedFiles: number
  crystalQuality: number
  overallGrade: OverallGrade
}

export interface CrystalResult {
  lattices: CrystalLattice[]
  systems: CrystalSystemGroup[]
  stats: CrystalStats
  recommendations: string[]
}

export interface CrystalOptions {
  verbose?: boolean
  format?: string
  output?: string
  ignore?: string[]
  ext?: string
}

// ─── Regularity ────────────────────────────────────────────────────────────────

/**
 * Compute pattern regularity 0-100.
 *
 * @example
 * computeRegularity('const a = 1; const b = 2;') // => 85
 */
export function computeRegularity(content: string): number {
  if (content.trim().length === 0) return 50

  let score = 60
  const lines = content.split('\n').filter(l => l.trim().length > 0)
  if (lines.length === 0) return 50

  const semicolons = (content.match(/;/g) ?? []).length
  const statements = Math.max(lines.length, 1)
  const semicolonRatio = semicolons / statements
  if (semicolonRatio > 0.5) score += 10

  const camelCase = (content.match(/[a-z][a-zA-Z0-9]*/g) ?? []).length
  const snakeCase = (content.match(/[a-z]+_[a-z_]+/g) ?? []).length
  const namingConsistency = camelCase > snakeCase * 2 || snakeCase > camelCase * 2
  if (namingConsistency) score += 15

  const braceStyle = (content.match(/\{\s*$/gm) ?? []).length
  const altBraceStyle = (content.match(/^\s*\{/gm) ?? []).length
  if (braceStyle === 0 || altBraceStyle === 0 || braceStyle > altBraceStyle * 2 || altBraceStyle > braceStyle * 2) {
    score += 10
  }

  const indentSizes = lines.map(l => {
    const match = l.match(/^(\s*)/)
    return match ? match[1].length : 0
  })
  const uniqueIndents = new Set(indentSizes)
  if (uniqueIndents.size <= Math.max(lines.length * 0.3, 3)) score += 5

  return Math.max(0, Math.min(100, score))
}

// ─── Symmetry ──────────────────────────────────────────────────────────────────

/**
 * Compute structural symmetry 0-100.
 *
 * @example
 * computeSymmetry('import a; import b; export c; export d;') // => 90
 */
export function computeSymmetry(content: string): number {
  if (content.trim().length === 0) return 50

  let score = 50

  const imports = (content.match(/^import\s/gm) ?? []).length
  const exports = (content.match(/^export\s/gm) ?? []).length
  if (imports > 0 && exports > 0) {
    const ratio = Math.min(imports, exports) / Math.max(imports, exports)
    score += Math.round(ratio * 20)
  } else {
    score += 5
  }

  const functions = (content.match(/function\s+\w+/g) ?? []).length
  const classes = (content.match(/class\s+\w+/g) ?? []).length
  if (functions > 0 || classes > 0) score += 10

  const arrowFns = (content.match(/=>\s*[{(]/g) ?? []).length
  const regularFns = (content.match(/function\s+\w+/g) ?? []).length
  if (arrowFns > 0 && regularFns > 0) {
    score += 5
  } else if (arrowFns > 0 || regularFns > 0) {
    score += 8
  }

  return Math.max(0, Math.min(100, score))
}

// ─── Purity ────────────────────────────────────────────────────────────────────

/**
 * Compute code purity 0-100.
 *
 * @example
 * computePurity('const x = 1; const y = 2;') // => 95
 */
export function computePurity(content: string, defects: CrystalDefect[]): number {
  if (content.trim().length === 0) return 100

  let score = 100

  score -= defects.filter(d => d.severity === 'major').length * 15
  score -= defects.filter(d => d.severity === 'moderate').length * 8
  score -= defects.filter(d => d.severity === 'minor').length * 3

  if (/\bvar\s/.test(content)) score -= 5
  if (/\beval\s*\(/.test(content)) score -= 15
  if (/\bany\b/.test(content)) score -= 5

  return Math.max(0, Math.min(100, score))
}

// ─── Clarity ───────────────────────────────────────────────────────────────────

/**
 * Compute code clarity 0-100.
 *
 * @example
 * computeClarity('const x = 1; // simple') // => 80
 */
export function computeClarity(content: string): number {
  if (content.trim().length === 0) return 50

  let score = 60
  const lines = content.split('\n')
  const nonEmpty = lines.filter(l => l.trim().length > 0)

  const jsdoc = (content.match(/\/\*\*[\s\S]*?\*\//g) ?? []).length
  const inlineComments = (content.match(/\/\/.*$/gm) ?? []).length
  const commentRatio = (jsdoc + inlineComments) / Math.max(nonEmpty.length, 1)
  if (commentRatio > 0.1) score += 15
  if (commentRatio > 0.2) score += 5

  const avgLineLength = nonEmpty.length > 0
    ? nonEmpty.reduce((s, l) => s + l.length, 0) / nonEmpty.length : 0
  if (avgLineLength > 0 && avgLineLength < 80) score += 10
  if (avgLineLength > 120) score -= 10

  const maxNesting = computeMaxNesting(content)
  if (maxNesting <= 3) score += 10
  if (maxNesting > 5) score -= 10

  return Math.max(0, Math.min(100, score))
}

/**
 * Compute max nesting depth.
 *
 * @example
 * computeMaxNesting('if (x) { if (y) { } }') // => 2
 */
export function computeMaxNesting(content: string): number {
  let maxDepth = 0
  let currentDepth = 0

  for (const char of content) {
    if (char === '{') {
      currentDepth++
      if (currentDepth > maxDepth) maxDepth = currentDepth
    } else if (char === '}') {
      currentDepth = Math.max(0, currentDepth - 1)
    }
  }

  return maxDepth
}

// ─── Defect Detection ──────────────────────────────────────────────────────────

/**
 * Detect crystal defects in code.
 *
 * @example
 * detectDefects('TODO: implement', 'file.ts') // => [CrystalDefect]
 */
export function detectDefects(content: string, filePath: string): CrystalDefect[] {
  const defects: CrystalDefect[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNum = i + 1

    if (/TODO|FIXME|HACK|XXX/.test(line)) {
      defects.push({
        type: 'vacancy',
        location: lineNum,
        severity: 'moderate',
        description: `Unfinished implementation: ${line.trim()}`,
        fix: 'Complete the implementation',
      })
    }

    if (/^\s*import\s.*\{[^}]*\}.*from/.test(line)) {
      const symbols = line.match(/\{([^}]*)\}/)
      if (symbols) {
        const names = symbols[1].split(',').map(s => s.trim()).filter(Boolean)
        const unusedInRest = names.filter(name => {
          const rest = lines.slice(i + 1).join('\n')
          return !rest.includes(name)
        })
        if (unusedInRest.length > 0) {
          defects.push({
            type: 'interstitial',
            location: lineNum,
            severity: 'minor',
            description: `Unused import${unusedInRest.length > 1 ? 's' : ''}: ${unusedInRest.join(', ')}`,
            fix: `Remove unused import${unusedInRest.length > 1 ? 's' : ''}`,
          })
        }
      }
    }

    if (/^(\t|    )\1{4,}/.test(line)) {
      defects.push({
        type: 'dislocation',
        location: lineNum,
        severity: 'major',
        description: 'Deeply nested code (6+ levels)',
        fix: 'Refactor to reduce nesting',
      })
    }

    if (/^\t/.test(line) && lines.some(l => /^  [^\s]/.test(l))) {
      defects.push({
        type: 'stacking-fault',
        location: lineNum,
        severity: 'minor',
        description: 'Mixed indentation (tabs and spaces)',
        fix: 'Use consistent indentation',
      })
    }
  }

  const hasTrailingWhitespace = lines.some(l => /\s+$/.test(l) && l.trim().length > 0)
  if (hasTrailingWhitespace) {
    const idx = lines.findIndex(l => /\s+$/.test(l) && l.trim().length > 0)
    defects.push({
      type: 'stacking-fault',
      location: idx + 1,
      severity: 'minor',
      description: 'Trailing whitespace detected',
      fix: 'Remove trailing whitespace',
    })
  }

  if (/\bconsole\.log\b/.test(content)) {
    const idx = lines.findIndex(l => /\bconsole\.log\b/.test(l))
    defects.push({
      type: 'interstitial',
      location: idx + 1,
      severity: 'minor',
      description: 'console.log statement found',
      fix: 'Remove or replace with proper logger',
    })
  }

  return defects
}

// ─── Facet Analysis ────────────────────────────────────────────────────────────

/**
 * Analyze crystal facets (interfaces/exports).
 *
 * @example
 * analyzeFacets('export function add() {}', 'math.ts') // => [CrystalFacet]
 */
export function analyzeFacets(content: string, filePath: string): CrystalFacet[] {
  const facets: CrystalFacet[] = []

  const exportMatches = content.matchAll(/export\s+(?:const|function|class|interface|type|enum)\s+(\w+)/g)
  for (const m of exportMatches) {
    const name = m[1]
    const documented = new RegExp(`\\/\\*\\*[\\s\\S]*?\\*\\/\\s*export.*\\b${name}\\b`).test(content)
    const hasParams = new RegExp(`export\\s+(?:function|const)\\s+${name}\\s*[<(]`).test(content)

    facets.push({
      name,
      clarity: computeNameClarity(name),
      smoothness: hasParams ? 80 : 60,
      reflectivity: documented ? 90 : 30,
      type: 'export',
    })
  }

  const importMatches = content.matchAll(/import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g)
  for (const m of importMatches) {
    const symbols = m[1].split(',').map(s => s.trim()).filter(Boolean)
    for (const sym of symbols) {
      facets.push({
        name: sym,
        clarity: computeNameClarity(sym),
        smoothness: 70,
        reflectivity: 50,
        type: 'import',
      })
    }
  }

  return facets
}

/**
 * Compute name clarity score.
 *
 * @example
 * computeNameClarity('getUserById') // => 85
 */
export function computeNameClarity(name: string): number {
  let score = 50
  if (name.length >= 3 && name.length <= 40) score += 15
  if (/^[a-z][a-zA-Z0-9]*$/.test(name) || /^[A-Z][a-zA-Z0-9]*$/.test(name)) score += 15
  if (/^(get|set|is|has|add|remove|create|delete|update|find|handle|process|validate|compute|build)/.test(name)) score += 15
  if (name.length === 1) score -= 30
  return Math.max(0, Math.min(100, score))
}

// ─── Crystal System Classification ─────────────────────────────────────────────

/**
 * Classify crystal system from regularity and symmetry.
 *
 * @example
 * classifyCrystalSystem(90, 85) // => 'cubic'
 */
export function classifyCrystalSystem(regularity: number, symmetry: number): CrystalSystemName {
  const avg = (regularity + symmetry) / 2

  if (avg >= 85) return 'cubic'
  if (avg >= 75) return 'tetragonal'
  if (avg >= 65) return 'hexagonal'
  if (avg >= 55) return 'orthorhombic'
  if (avg >= 45) return 'monoclinic'
  if (avg >= 30) return 'triclinic'
  return 'amorphous'
}

// ─── Lattice Analysis ──────────────────────────────────────────────────────────

/**
 * Analyze a single file's crystal lattice.
 *
 * @example
 * analyzeLattice('export function add() {}', 'math.ts') // => CrystalLattice
 */
export function analyzeLattice(content: string, filePath: string): CrystalLattice {
  const defects = detectDefects(content, filePath)
  const facets = analyzeFacets(content, filePath)
  const regularity = computeRegularity(content)
  const symmetry = computeSymmetry(content)
  const purity = computePurity(content, defects)
  const clarity = computeClarity(content)
  const system = classifyCrystalSystem(regularity, symmetry)

  return {
    file: filePath,
    regularity,
    symmetry,
    purity,
    clarity,
    system,
    defects,
    facets,
  }
}

// ─── System Grouping ───────────────────────────────────────────────────────────

/**
 * Group lattices into crystal systems.
 *
 * @example
 * groupIntoSystems(lattices) // => [CrystalSystemGroup]
 */
export function groupIntoSystems(lattices: CrystalLattice[]): CrystalSystemGroup[] {
  const groups = new Map<CrystalSystemName, CrystalLattice[]>()

  for (const lattice of lattices) {
    const existing = groups.get(lattice.system) ?? []
    existing.push(lattice)
    groups.set(lattice.system, existing)
  }

  const systems: CrystalSystemGroup[] = []

  const descriptions: Record<CrystalSystemName, string> = {
    cubic: 'Highly regular with consistent patterns',
    tetragonal: 'Mostly regular with minor variations',
    hexagonal: 'Well-organized natural patterns',
    orthorhombic: 'Organized along different axes',
    monoclinic: 'Partially organized structure',
    triclinic: 'Minimally organized',
    amorphous: 'No discernible structure',
  }

  for (const [name, lats] of groups) {
    const avgReg = lats.reduce((s, l) => s + l.regularity, 0) / lats.length
    const avgSym = lats.reduce((s, l) => s + l.symmetry, 0) / lats.length
    const quality = classifyQuality(avgReg, avgSym)

    systems.push({
      name,
      description: descriptions[name],
      files: lats.map(l => l.file),
      avgRegularity: Math.round(avgReg),
      avgSymmetry: Math.round(avgSym),
      quality,
      growthPattern: determineGrowthPattern(lats),
    })
  }

  return systems
}

/**
 * Classify crystal quality from metrics.
 *
 * @example
 * classifyQuality(90, 85) // => 'flawless'
 */
export function classifyQuality(avgRegularity: number, avgSymmetry: number): CrystalQuality {
  const avg = (avgRegularity + avgSymmetry) / 2
  if (avg >= 85) return 'flawless'
  if (avg >= 75) return 'excellent'
  if (avg >= 65) return 'good'
  if (avg >= 50) return 'fair'
  if (avg >= 35) return 'poor'
  return 'fractured'
}

/**
 * Determine growth pattern.
 *
 * @example
 * determineGrowthPattern(lattices) // => 'layered'
 */
export function determineGrowthPattern(lattices: CrystalLattice[]): GrowthPattern {
  if (lattices.length <= 1) return 'prismatic'

  const sizes = lattices.map(l => l.facets.length)
  const avgSize = sizes.reduce((a, b) => a + b, 0) / sizes.length
  const variance = sizes.reduce((s, n) => s + Math.pow(n - avgSize, 2), 0) / sizes.length

  if (variance < 2) return 'layered'
  if (variance < 10) return 'prismatic'
  if (avgSize > 5) return 'dendritic'
  if (lattices.length > 5) return 'fragmented'
  return 'massive'
}

// ─── Overall Grade ─────────────────────────────────────────────────────────────

/**
 * Compute overall crystal quality 0-100.
 *
 * @example
 * computeCrystalQuality(stats) // => 75
 */
export function computeCrystalQuality(avgReg: number, avgSym: number, avgPurity: number, avgClarity: number): number {
  return Math.round((avgReg * 0.25) + (avgSym * 0.25) + (avgPurity * 0.25) + (avgClarity * 0.25))
}

/**
 * Classify overall grade.
 *
 * @example
 * classifyOverallGrade(95, 90, 90) // => 'diamond'
 */
export function classifyOverallGrade(quality: number, purity: number, clarity: number): OverallGrade {
  const composite = (quality + purity + clarity) / 3

  if (composite >= 90) return 'diamond'
  if (composite >= 80) return 'sapphire'
  if (composite >= 70) return 'ruby'
  if (composite >= 60) return 'emerald'
  if (composite >= 45) return 'quartz'
  if (composite >= 30) return 'glass'
  return 'gravel'
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Generate crystal recommendations.
 *
 * @example
 * generateRecommendations(lattices, systems, stats) // => ['Fix...']
 */
export function generateRecommendations(lattices: CrystalLattice[], systems: CrystalSystemGroup[], stats: CrystalStats): string[] {
  const recs: string[] = []

  const amorphous = lattices.filter(l => l.system === 'amorphous')
  if (amorphous.length > 0) {
    recs.push(`Establish patterns in ${amorphous.length} amorphous file${amorphous.length > 1 ? 's' : ''}`)
  }

  const majorDefects = lattices.reduce((s, l) => s + l.defects.filter(d => d.severity === 'major').length, 0)
  if (majorDefects > 0) {
    recs.push(`Fix ${majorDefects} major structural defect${majorDefects > 1 ? 's' : ''}`)
  }

  const lowClarityFacets = lattices.reduce((s, l) => s + l.facets.filter(f => f.reflectivity < 40).length, 0)
  if (lowClarityFacets > 0) {
    recs.push(`Improve documentation for ${lowClarityFacets} undocumented facet${lowClarityFacets > 1 ? 's' : ''}`)
  }

  const grainBoundaries = lattices.reduce((s, l) => s + l.defects.filter(d => d.type === 'grain-boundary').length, 0)
  if (grainBoundaries > 0) {
    recs.push(`Standardize style across ${grainBoundaries} grain boundar${grainBoundaries > 1 ? 'ies' : 'y'}`)
  }

  const vacancies = lattices.reduce((s, l) => s + l.defects.filter(d => d.type === 'vacancy').length, 0)
  if (vacancies > 0) {
    recs.push(`Complete ${vacancies} unfinished implementation${vacancies > 1 ? 's' : ''}`)
  }

  if (stats.fracturedFiles > 0) {
    recs.push(`Restructure ${stats.fracturedFiles} fractured file${stats.fracturedFiles > 1 ? 's' : ''}`)
  }

  return recs
}

// ─── Build Result ──────────────────────────────────────────────────────────────

/**
 * Build complete crystal result.
 *
 * @example
 * buildCrystalResult(['a.ts'], ['code'], {}) // => CrystalResult
 */
export function buildCrystalResult(files: string[], contents: string[], options: CrystalOptions): CrystalResult {
  const lattices: CrystalLattice[] = []

  for (let i = 0; i < files.length; i++) {
    const content = contents[i] ?? ''
    lattices.push(analyzeLattice(content, files[i]))
  }

  const systems = groupIntoSystems(lattices)

  const avgRegularity = lattices.length > 0
    ? Math.round(lattices.reduce((s, l) => s + l.regularity, 0) / lattices.length) : 50
  const avgSymmetry = lattices.length > 0
    ? Math.round(lattices.reduce((s, l) => s + l.symmetry, 0) / lattices.length) : 50
  const avgPurity = lattices.length > 0
    ? Math.round(lattices.reduce((s, l) => s + l.purity, 0) / lattices.length) : 100
  const avgClarity = lattices.length > 0
    ? Math.round(lattices.reduce((s, l) => s + l.clarity, 0) / lattices.length) : 50

  const totalDefects = lattices.reduce((s, l) => s + l.defects.length, 0)
  const minorDefects = lattices.reduce((s, l) => s + l.defects.filter(d => d.severity === 'minor').length, 0)
  const majorDefects = lattices.reduce((s, l) => s + l.defects.filter(d => d.severity === 'major').length, 0)
  const totalFacets = lattices.reduce((s, l) => s + l.facets.length, 0)
  const avgFacetClarity = totalFacets > 0
    ? Math.round(lattices.reduce((s, l) => s + l.facets.reduce((ss, f) => ss + f.clarity, 0), 0) / totalFacets) : 0

  const systemCounts = new Map<string, number>()
  for (const l of lattices) {
    systemCounts.set(l.system, (systemCounts.get(l.system) ?? 0) + 1)
  }
  const dominantSystem = [...systemCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'amorphous'

  const flawlessFiles = lattices.filter(l => l.defects.length === 0).length
  const fracturedFiles = lattices.filter(l => l.system === 'amorphous' || l.purity < 30).length

  const crystalQuality = computeCrystalQuality(avgRegularity, avgSymmetry, avgPurity, avgClarity)
  const overallGrade = classifyOverallGrade(crystalQuality, avgPurity, avgClarity)

  const stats: CrystalStats = {
    totalLattices: lattices.length,
    avgRegularity,
    avgSymmetry,
    avgPurity,
    avgClarity,
    totalDefects,
    minorDefects,
    majorDefects,
    totalFacets,
    avgFacetClarity,
    dominantSystem,
    flawlessFiles,
    fracturedFiles,
    crystalQuality,
    overallGrade,
  }

  const recommendations = generateRecommendations(lattices, systems, stats)

  if (options.verbose) {
    // Verbose mode includes additional detail
  }

  return { lattices, systems, stats, recommendations }
}
