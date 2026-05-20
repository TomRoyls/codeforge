// ─── Types ────────────────────────────────────────────────────────────────────

export interface BioPattern {
  name: string
  description: string
  natureAnalogy: string
  codeEquivalent: string
  files: string[]
  adherence: number
  benefits: string[]
  missingBenefits: string[]
}

export interface BioLifestyle {
  file: string
  dominantPattern: string
  secondaryPatterns: string[]
  resilience: number
  adaptability: number
  efficiency: number
  symbiosis: number
  biodiversity: number
  classification: 'pioneer' | 'climax' | 'generalist' | 'specialist' | 'parasitic' | 'symbiotic'
}

export interface BioEcosystem {
  name: string
  species: number
  biodiversity: number
  foodWeb: [string, string][]
  keystone: string
  isMonoculture: boolean
  health: 'thriving' | 'balanced' | 'stressed' | 'degraded' | 'collapsed'
}

export interface BiomimicryStats {
  totalPatterns: number
  highAdherencePatterns: number
  lowAdherencePatterns: number
  dominantPattern: string
  avgResilience: number
  avgAdaptability: number
  avgEfficiency: number
  avgSymbiosis: number
  avgBiodiversity: number
  totalEcosystems: number
  thrivingEcosystems: number
  monocultures: number
  keystoneFiles: number
  pioneerFiles: number
  symbioticFiles: number
  parasiticFiles: number
  overallBioScore: number
  ecosystemHealth: 'rainforest' | 'grassland' | 'tundra' | 'desert' | 'wasteland'
  natureMaturity: 'primordial' | 'evolving' | 'mature' | 'old-growth'
}

export interface BiomimicryResult {
  patterns: BioPattern[]
  lifestyles: BioLifestyle[]
  ecosystems: BioEcosystem[]
  stats: BiomimicryStats
  recommendations: string[]
}

// ─── Pattern Definitions ──────────────────────────────────────────────────────

const PATTERN_DEFS = [
  { name: 'honeycomb', description: 'Efficient space usage and optimal organization', natureAnalogy: 'Bees use hexagonal cells for maximum storage with minimal material', codeEquivalent: 'Well-organized imports, exports, and module structure' },
  { name: 'spider-web', description: 'Resilient network with graceful degradation', natureAnalogy: 'Spider webs maintain structure even when strands break', codeEquivalent: 'Error recovery, fallbacks, and alternative execution paths' },
  { name: 'coral-reef', description: 'Modular incremental growth', natureAnalogy: 'Coral reefs grow incrementally without disrupting existing structure', codeEquivalent: 'Extensible patterns, plugins, and additive architecture' },
  { name: 'mycelium', description: 'Decentralized communication network', natureAnalogy: 'Fungal networks distribute nutrients without central control', codeEquivalent: 'Event-driven patterns, loose coupling, observer patterns' },
  { name: 'evolution', description: 'Iterative improvement over time', natureAnalogy: 'Natural selection favors traits that improve survival', codeEquivalent: 'Versioning, deprecation, migration support, refactoring patterns' },
  { name: 'swarm', description: 'Distributed processing without bottlenecks', natureAnalogy: 'Bird flocks and fish schools act in concert without a leader', codeEquivalent: 'Parallel processing, independent workers, map-reduce patterns' },
  { name: 'camouflage', description: 'Abstraction layers hiding complexity', natureAnalogy: 'Animals blend with their environment to simplify interactions', codeEquivalent: 'Clean interfaces, abstraction layers, encapsulation' },
  { name: 'symbiosis', description: 'Mutually beneficial module relationships', natureAnalogy: 'Organisms cooperate for mutual benefit without tight binding', codeEquivalent: 'Balanced imports/exports, well-defined contracts' },
]

// ─── Pattern Detection ────────────────────────────────────────────────────────

/**
 * Detect nature-inspired patterns in a single file
 * @example
 * detectPatterns('import { x } from "y"; export const z = x', 'a.ts') // Map<string, number>
 */
export function detectPatterns(content: string, filePath: string): Map<string, number> {
  const scores = new Map<string, number>()

  const hasImports = /import\s+/.test(content)
  const hasExports = /export\s+/.test(content)
  const hasDefaultExport = /export\s+default\s+/.test(content)
  const hasNamedExports = /export\s+(const|let|function|class|interface|type)\s+/.test(content)
  const hasInterfaces = /interface\s+\w+|type\s+\w+\s*=/.test(content)
  const hasErrorHandling = /try\s*\{|catch\s*\(|\.catch\s*\(/.test(content)
  const hasFallbacks = /\?\?|\|\|.*return|default\s*:/.test(content)
  const hasOptionalChaining = /\?\.\w/.test(content)
  const hasEvents = /emit|on\(|subscribe|addEventListener|EventEmitter/.test(content)
  const hasCallbacks = /callback|Promise|async|await/.test(content)
  const hasVersioning = /version|deprecated|@deprecated|migrate|migration/i.test(content)
  const hasParallel = /Promise\.all|Promise\.race|Worker|parallel|concurrent/i.test(content)
  const hasAbstraction = /abstract\s+class|interface\s+|implements\s+/.test(content)
  const hasGenerics = /<\w+>|<\w+\s+extends/.test(content)
  const exportCount = (content.match(/export\s+/g) || []).length
  const importCount = (content.match(/import\s+/g) || []).length

  // Honeycomb: organized structure
  let honeycomb = 40
  if (hasImports && hasExports) honeycomb += 20
  if (hasNamedExports) honeycomb += 10
  if (hasInterfaces) honeycomb += 10
  if (hasDefaultExport) honeycomb += 5
  if (exportCount >= 2 && exportCount <= 10) honeycomb += 15
  if (exportCount > 15) honeycomb -= 10
  scores.set('honeycomb', Math.max(0, Math.min(100, honeycomb)))

  // Spider web: resilience
  let spiderWeb = 30
  if (hasErrorHandling) spiderWeb += 25
  if (hasFallbacks) spiderWeb += 20
  if (hasOptionalChaining) spiderWeb += 15
  if (/\?\?/.test(content)) spiderWeb += 10
  scores.set('spider-web', Math.max(0, Math.min(100, spiderWeb)))

  // Coral reef: modular growth
  let coralReef = 35
  if (hasInterfaces) coralReef += 15
  if (hasGenerics) coralReef += 15
  if (/extends\s+\w+|implements\s+\w+/.test(content)) coralReef += 15
  if (/plugin|extension|addon|module/i.test(content)) coralReef += 20
  scores.set('coral-reef', Math.max(0, Math.min(100, coralReef)))

  // Mycelium: decentralized
  let mycelium = 25
  if (hasEvents) mycelium += 25
  if (hasCallbacks) mycelium += 15
  if (/observer|listener|subscriber/i.test(content)) mycelium += 20
  if (/EventEmitter|EventTarget/.test(content)) mycelium += 15
  scores.set('mycelium', Math.max(0, Math.min(100, mycelium)))

  // Evolution: iterative improvement
  let evolution = 20
  if (hasVersioning) evolution += 30
  if (/TODO|FIXME/i.test(content)) evolution += 15
  if (/refactor|improve|optimize/i.test(content)) evolution += 15
  if (/v\d|version.*\d/i.test(content)) evolution += 20
  scores.set('evolution', Math.max(0, Math.min(100, evolution)))

  // Swarm: distributed
  let swarm = 20
  if (hasParallel) swarm += 30
  if (/\.map\s*\(/.test(content) && /\.filter\s*\(/.test(content)) swarm += 15
  if (/Promise\.all|Promise\.allSettled/.test(content)) swarm += 20
  if (/Worker|worker_threads/.test(content)) swarm += 15
  scores.set('swarm', Math.max(0, Math.min(100, swarm)))

  // Camouflage: abstraction
  let camouflage = 30
  if (hasAbstraction) camouflage += 25
  if (hasInterfaces) camouflage += 15
  if (hasGenerics) camouflage += 10
  if (/private\s+|#\w/.test(content)) camouflage += 10
  if (/export\s+\{/.test(content)) camouflage += 10
  scores.set('camouflage', Math.max(0, Math.min(100, camouflage)))

  // Symbiosis: mutual benefit
  let symbiosis = 30
  if (hasExports && hasImports) symbiosis += 20
  if (exportCount >= 2 && exportCount <= 8) symbiosis += 15
  if (importCount >= 1 && importCount <= 5) symbiosis += 10
  if (Math.abs(exportCount - importCount) <= 3) symbiosis += 10
  if (exportCount === 0 && importCount > 3) symbiosis -= 20
  scores.set('symbiosis', Math.max(0, Math.min(100, symbiosis)))

  return scores
}

/**
 * Analyze patterns across all files and return BioPattern array
 * @example
 * analyzePatterns(['a.ts'], ['export const x = 1']) // BioPattern[]
 */
export function analyzePatterns(files: string[], contents: string[]): BioPattern[] {
  const patternFiles = new Map<string, string[]>()
  const patternScores = new Map<string, number[]>()

  for (let i = 0; i < files.length; i++) {
    const scores = detectPatterns(contents[i], files[i])
    for (const [pattern, score] of scores) {
      if (!patternFiles.has(pattern)) patternFiles.set(pattern, [])
      if (!patternScores.has(pattern)) patternScores.set(pattern, [])
      patternFiles.get(pattern)!.push(files[i])
      patternScores.get(pattern)!.push(score)
    }
  }

  return PATTERN_DEFS.map(def => {
    const fileArr = patternFiles.get(def.name) || []
    const scoreArr = patternScores.get(def.name) || []
    const avgAdherence = scoreArr.length > 0
      ? Math.round(scoreArr.reduce((s, v) => s + v, 0) / scoreArr.length)
      : 0

    const benefits: string[] = []
    const missingBenefits: string[] = []

    if (avgAdherence >= 60) benefits.push(`Strong ${def.name} pattern adoption`)
    else missingBenefits.push(`${def.name} pattern could be stronger`)

    if (fileArr.length >= 3) benefits.push(`Widely adopted across ${fileArr.length} files`)
    else if (fileArr.length <= 1) missingBenefits.push('Limited adoption across codebase')

    return {
      name: def.name,
      description: def.description,
      natureAnalogy: def.natureAnalogy,
      codeEquivalent: def.codeEquivalent,
      files: fileArr.slice(0, 10),
      adherence: avgAdherence,
      benefits,
      missingBenefits,
    }
  })
}

// ─── Lifestyle Classification ─────────────────────────────────────────────────

/**
 * Classify a file's bio-lifestyle based on its patterns and content
 * @example
 * classifyLifestyle(scores, 'export function foo() {}', 'a.ts') // BioLifestyle
 */
export function classifyLifestyle(
  patternScores: Map<string, number>,
  content: string,
  filePath: string,
): BioLifestyle {
  const entries = Array.from(patternScores.entries())
  entries.sort((a, b) => b[1] - a[1])

  const dominantPattern = entries[0]?.[0] || 'honeycomb'
  const secondaryPatterns = entries.slice(1, 4).map(e => e[0])

  const avgScore = entries.length > 0
    ? entries.reduce((s, e) => s + e[1], 0) / entries.length
    : 50

  const exportCount = (content.match(/export\s+/g) || []).length
  const importCount = (content.match(/import\s+/g) || []).length

  const hasErrorHandling = /try|catch|\.catch|finally/.test(content)
  const hasAbstraction = /interface|abstract|implements|type\s+\w+\s*=/.test(content)
  const hasAsync = /async|await|Promise/.test(content)

  const resilience = Math.min(100, Math.round(
    (hasErrorHandling ? 30 : 5) +
    (hasAbstraction ? 20 : 5) +
    Math.min(30, avgScore * 0.4) +
    (/null|undefined|\?\?/.test(content) ? 15 : 5)
  ))

  const adaptability = Math.min(100, Math.round(
    (hasAbstraction ? 25 : 5) +
    (hasAsync ? 15 : 5) +
    (exportCount >= 1 ? 20 : 5) +
    Math.min(30, avgScore * 0.3) +
    (/generic|<T>|extends/.test(content) ? 15 : 5)
  ))

  const efficiency = Math.min(100, Math.round(
    Math.min(30, avgScore * 0.4) +
    (content.split('\n').length < 100 ? 30 : 15) +
    (exportCount >= 1 && exportCount <= 5 ? 20 : 5) +
    (patternScores.get('honeycomb') || 30) * 0.2
  ))

  const symbiosis = Math.min(100, Math.round(
    (exportCount >= 1 ? 25 : 0) +
    (importCount >= 1 ? 15 : 5) +
    (Math.abs(exportCount - importCount) <= 2 ? 20 : 5) +
    (exportCount > importCount ? 15 : 5)
  ))

  const biodiversity = Math.min(100, Math.round(
    entries.filter(e => e[1] >= 40).length / Math.max(1, entries.length) * 80 +
    (secondaryPatterns.length >= 3 ? 20 : secondaryPatterns.length * 5)
  ))

  let classification: BioLifestyle['classification'] = 'generalist'
  if (exportCount === 0 && importCount >= 3) {
    classification = 'parasitic'
  } else if (content.split('\n').length < 20 && exportCount === 0) {
    classification = 'pioneer'
  } else if (exportCount >= 2 && importCount >= 1 && Math.abs(exportCount - importCount) <= 2) {
    classification = 'symbiotic'
  } else if (resilience >= 70 && adaptability >= 70) {
    classification = 'climax'
  } else if (content.split('\n').length < 20 && exportCount === 0) {
    classification = 'pioneer'
  } else if (exportCount === 1 && !hasAbstraction) {
    classification = 'specialist'
  }

  return {
    file: filePath,
    dominantPattern,
    secondaryPatterns,
    resilience,
    adaptability,
    efficiency,
    symbiosis,
    biodiversity,
    classification,
  }
}

// ─── Ecosystem Analysis ───────────────────────────────────────────────────────

/**
 * Analyze an ecosystem (directory group)
 * @example
 * analyzeEcosystem(['src/core/a.ts', 'src/core/b.ts'], contents, 'src/core') // BioEcosystem
 */
export function analyzeEcosystem(
  files: string[],
  contents: string[],
  dirPath: string,
): BioEcosystem {
  const extensions = Array.from(new Set(files.map(f => {
    const parts = f.split('.')
    return parts.length > 1 ? parts[parts.length - 1] : 'unknown'
  })))
  const species = extensions.length

  const foodWeb: [string, string][] = []
  const fileSet = new Set(files)
  for (let i = 0; i < files.length; i++) {
    const imports = contents[i].match(/from\s+['"]\.\/([^'"]+)['"]/g) || []
    for (const imp of imports) {
      const depName = imp.replace(/from\s+['"]\.\/([^'"]+)['"]/, '$1')
      const depFile = files.find(f => f.includes(depName))
      if (depFile && fileSet.has(depFile)) {
        foodWeb.push([files[i], depFile])
      }
    }
  }

  const depCount = new Map<string, number>()
  for (const [, dep] of foodWeb) {
    depCount.set(dep, (depCount.get(dep) || 0) + 1)
  }
  let keystone = files[0] || ''
  let maxDeps = 0
  for (const [file, count] of depCount) {
    if (count > maxDeps) { maxDeps = count; keystone = file }
  }

  const biodiversity = Math.min(100, Math.round(
    (species / Math.max(1, files.length)) * 50 +
    Math.min(50, foodWeb.length * 5)
  ))

  const isMonoculture = species <= 1 && files.length > 2

  let health: BioEcosystem['health'] = 'balanced'
  if (biodiversity >= 70 && !isMonoculture) health = 'thriving'
  else if (biodiversity >= 50) health = 'balanced'
  else if (biodiversity >= 30) health = 'stressed'
  else if (biodiversity >= 15) health = 'degraded'
  else health = 'collapsed'

  return {
    name: dirPath,
    species,
    biodiversity,
    foodWeb,
    keystone,
    isMonoculture,
    health,
  }
}

// ─── Score Computations ───────────────────────────────────────────────────────

/**
 * Compute overall bio score (0-100)
 * @example
 * computeBioScore(80, 70, 75, 65, 60) // 70
 */
export function computeBioScore(
  resilience: number,
  adaptability: number,
  efficiency: number,
  symbiosis: number,
  biodiversity: number,
): number {
  return Math.round(
    resilience * 0.2 +
    adaptability * 0.2 +
    efficiency * 0.2 +
    symbiosis * 0.2 +
    biodiversity * 0.2
  )
}

/**
 * Classify ecosystem health
 * @example
 * classifyEcosystemHealth(70, 'thriving') // 'rainforest'
 */
export function classifyEcosystemHealth(
  biodiversity: number,
  health: string,
): BiomimicryStats['ecosystemHealth'] {
  const isGood = health === 'thriving' || health === 'balanced'
  if (biodiversity >= 70 && isGood) return 'rainforest'
  if (biodiversity >= 50 && isGood) return 'grassland'
  if (biodiversity >= 30) return 'tundra'
  if (biodiversity >= 15) return 'desert'
  return 'wasteland'
}

/**
 * Classify nature maturity
 * @example
 * classifyNatureMaturity(80, 70, 65) // 'old-growth'
 */
export function classifyNatureMaturity(
  avgResilience: number,
  avgAdaptability: number,
  biodiversity: number,
): BiomimicryStats['natureMaturity'] {
  const combined = avgResilience * 0.4 + avgAdaptability * 0.3 + biodiversity * 0.3
  if (combined >= 75) return 'old-growth'
  if (combined >= 55) return 'mature'
  if (combined >= 35) return 'evolving'
  return 'primordial'
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Generate biomimicry recommendations
 * @example
 * generateBioRecommendations(patterns, lifestyles, ecosystems, stats) // string[]
 */
export function generateBioRecommendations(
  patterns: BioPattern[],
  lifestyles: BioLifestyle[],
  ecosystems: BioEcosystem[],
  stats: BiomimicryStats,
): string[] {
  const recs: string[] = []

  const monocultures = ecosystems.filter(e => e.isMonoculture)
  if (monocultures.length > 0) {
    recs.push(`Increase pattern diversity in ${monocultures.length} monoculture ecosystem(s)`)
  }

  const parasitic = lifestyles.filter(l => l.classification === 'parasitic')
  if (parasitic.length > 0) {
    recs.push(`Add exports to ${parasitic.length} parasitic file(s) — they take more than they give`)
  }

  const lowResilience = lifestyles.filter(l => l.resilience < 30)
  if (lowResilience.length > 0) {
    recs.push(`Improve resilience in ${lowResilience.length} file(s) — add error handling and fallbacks`)
  }

  const lowPattern = patterns.filter(p => p.adherence < 30)
  if (lowPattern.length > 0) {
    const names = lowPattern.slice(0, 3).map(p => p.name)
    recs.push(`Adopt ${names.join(', ')} pattern(s) — currently underutilized`)
  }

  if (stats.ecosystemHealth === 'wasteland' || stats.ecosystemHealth === 'desert') {
    recs.push('Ecosystem is degraded — invest in biodiversity through pattern diversity and modular growth')
  }

  if (stats.parasiticFiles > stats.symbioticFiles) {
    recs.push('More parasitic than symbiotic files — refactor to establish mutually beneficial module relationships')
  }

  return Array.from(new Set(recs))
}

// ─── Build Result ──────────────────────────────────────────────────────────────

/**
 * Build the complete biomimicry result
 * @example
 * buildBiomimicryResult(['a.ts'], ['export const x = 1'], {}) // BiomimicryResult
 */
export function buildBiomimicryResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): BiomimicryResult {
  const patterns = analyzePatterns(files, contents)

  const lifestyles: BioLifestyle[] = []
  for (let i = 0; i < files.length; i++) {
    const scores = detectPatterns(contents[i], files[i])
    lifestyles.push(classifyLifestyle(scores, contents[i], files[i]))
  }

  const byDir = new Map<string, Array<{ file: string; content: string }>>()
  for (let i = 0; i < files.length; i++) {
    const dir = files[i].split('/').slice(0, -1).join('/') || 'root'
    if (!byDir.has(dir)) byDir.set(dir, [])
    byDir.get(dir)!.push({ file: files[i], content: contents[i] })
  }

  const ecosystems: BioEcosystem[] = []
  for (const [dir, dirFiles] of byDir) {
    ecosystems.push(analyzeEcosystem(
      dirFiles.map(f => f.file),
      dirFiles.map(f => f.content),
      dir,
    ))
  }

  const avg = (arr: number[]) => arr.length > 0 ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length) : 0

  const avgResilience = avg(lifestyles.map(l => l.resilience))
  const avgAdaptability = avg(lifestyles.map(l => l.adaptability))
  const avgEfficiency = avg(lifestyles.map(l => l.efficiency))
  const avgSymbiosis = avg(lifestyles.map(l => l.symbiosis))
  const avgBiodiversity = avg(lifestyles.map(l => l.biodiversity))

  const overallBioScore = computeBioScore(avgResilience, avgAdaptability, avgEfficiency, avgSymbiosis, avgBiodiversity)

  const patternCounts = new Map<string, number>()
  for (const l of lifestyles) {
    patternCounts.set(l.dominantPattern, (patternCounts.get(l.dominantPattern) || 0) + 1)
  }
  let dominantPattern = 'honeycomb'
  let maxCount = 0
  for (const [p, c] of patternCounts) {
    if (c > maxCount) { maxCount = c; dominantPattern = p }
  }

  const avgBiodiversityEco = avg(ecosystems.map(e => e.biodiversity))
  const worstHealth = ecosystems.reduce((w, e) => {
    const order = ['collapsed', 'degraded', 'stressed', 'balanced', 'thriving']
    return order.indexOf(e.health) < order.indexOf(w) ? e.health : w
  }, 'thriving' as string)
  const ecosystemHealth = classifyEcosystemHealth(avgBiodiversityEco, worstHealth)
  const natureMaturity = classifyNatureMaturity(avgResilience, avgAdaptability, avgBiodiversity)

  const stats: BiomimicryStats = {
    totalPatterns: patterns.length,
    highAdherencePatterns: patterns.filter(p => p.adherence >= 60).length,
    lowAdherencePatterns: patterns.filter(p => p.adherence < 30).length,
    dominantPattern,
    avgResilience,
    avgAdaptability,
    avgEfficiency,
    avgSymbiosis,
    avgBiodiversity,
    totalEcosystems: ecosystems.length,
    thrivingEcosystems: ecosystems.filter(e => e.health === 'thriving').length,
    monocultures: ecosystems.filter(e => e.isMonoculture).length,
    keystoneFiles: Array.from(new Set(ecosystems.map(e => e.keystone))).filter(k => k).length,
    pioneerFiles: lifestyles.filter(l => l.classification === 'pioneer').length,
    symbioticFiles: lifestyles.filter(l => l.classification === 'symbiotic').length,
    parasiticFiles: lifestyles.filter(l => l.classification === 'parasitic').length,
    overallBioScore,
    ecosystemHealth,
    natureMaturity,
  }

  const recommendations = generateBioRecommendations(patterns, lifestyles, ecosystems, stats)

  return { patterns, lifestyles, ecosystems, stats, recommendations }
}
