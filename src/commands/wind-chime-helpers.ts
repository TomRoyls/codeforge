// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface HarmonicContent {
  fundamental: number
  secondHarmonic: number
  thirdHarmonic: number
  overtones: number
}

export interface ChimeConnections {
  resonatesWith: string[]
  dissonantWith: string[]
  dampensBy: string[]
  amplifiesBy: string[]
}

export interface ChimeTube {
  file: string
  pitch: number
  resonance: number
  sustain: number
  tone: 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B'
  octave: number
  amplitude: number
  frequency: number
  toneQuality: 'pure' | 'warm' | 'bright' | 'dull' | 'harsh' | 'dissonant'
  material: 'aluminum' | 'bamboo' | 'glass' | 'ceramic' | 'shell' | 'wood' | 'metal'
  tubeLength: number
  diameter: number
  wallThickness: number
  strikeResponse: number
  harmonicContent: HarmonicContent
  connections: ChimeConnections
  dissonance: number
  harmony: number
  isTuned: boolean
  isBroken: boolean
  isSilent: boolean
  note: string
  classification: 'soloist' | 'section-leader' | 'ensemble' | 'accompaniment' | 'rest'
}

export interface ChimeCluster {
  directory: string
  tubes: ChimeTube[]
  clusterType: 'pentatonic' | 'diatonic' | 'chromatic' | 'whole-tone' | 'atonal' | 'noise'
  avgResonance: number
  avgHarmony: number
  avgDissonance: number
  totalAmplitude: number
  dominantTone: string
  dominantMaterial: string
  tunedTubes: number
  brokenTubes: number
  silentTubes: number
  chordQuality: 'major' | 'minor' | 'diminished' | 'augmented' | 'suspended' | 'dissonant'
  overallHarmony: number
  resonanceProfile: number
  isMusical: boolean
  hasDissonance: boolean
  dissonancePoints: string[]
  windResponse: 'sensitive' | 'responsive' | 'moderate' | 'sluggish' | 'unresponsive'
  health: 'symphonic' | 'harmonious' | 'pleasant' | 'tolerable' | 'noisy' | 'cacophonous'
}

export interface Symphony {
  totalAmplitude: number
  avgResonance: number
  avgHarmony: number
  avgDissonance: number
  dominantKey: string
  tempo: string
  dynamics: string
}

export interface WindChimeStats {
  totalFiles: number
  totalClusters: number
  avgPitch: number
  avgResonance: number
  avgSustain: number
  avgHarmony: number
  avgDissonance: number
  pureTones: number
  dissonantTones: number
  soloists: number
  ensemble: number
  silentTubes: number
  brokenTubes: number
  tunedTubes: number
  isMusical: boolean
  symphonicClusters: number
  cacophonousClusters: number
  dominantTone: string
  dominantMaterial: string
  overallHarmony: number
  overallResonance: number
  harmonyGrade: 'symphony' | 'orchestra' | 'band' | 'jam-session' | 'noise' | 'silence'
  bestTube: string
  worstTube: string
  mostResonant: string
  mostDissonant: string
}

export interface WindChimeResult {
  tubes: ChimeTube[]
  clusters: ChimeCluster[]
  symphony: Symphony
  stats: WindChimeStats
  recommendations: string[]
}

// ─── Regex Patterns ──────────────────────────────────────────────────────────

const EXPORT_RE = /export\s+(?:default\s+)?(?:function|class|const|let|interface|type)/g
const IMPORT_RE = /import\s+.*?from\s+['"]([^'"]+)['"]/g
const FUNCTION_RE = /(?:export\s+)?(?:async\s+)?function\s+\w+/g
const CLASS_RE = /(?:export\s+)?(?:abstract\s+)?class\s+\w+/g
const INTERFACE_RE = /(?:export\s+)?interface\s+\w+/g
const TYPE_RE = /(?:export\s+)?type\s+\w+/g
const JSDOC_RE = /\/\*\*[\s\S]*?\*\//g
const TODO_RE = /\/\/\s*(TODO|FIXME|HACK|XXX)/gi
const ANY_RE = /:\s*any\b/g
const CONSOLE_RE = /console\.\w+\(/g
const GENERIC_RE = /<\w+(\s+extends\s+\w+)?>/g

// ─── Classification Functions ────────────────────────────────────────────────

/**
 * Classify tone based on code content characteristics
 * @example
 * classifyTone('export function a() {}') // 'C'
 */
export function classifyTone(content: string): ChimeTube['tone'] {
  const classes = (content.match(CLASS_RE) ?? []).length
  const interfaces = (content.match(INTERFACE_RE) ?? []).length
  const functions = (content.match(FUNCTION_RE) ?? []).length
  const exports = (content.match(EXPORT_RE) ?? []).length

  if (classes >= 3) return 'C'
  if (interfaces >= 2) return 'D'
  if (functions >= 5 && exports >= 3) return 'E'
  if (functions >= 3) return 'F'
  if (exports >= 2) return 'G'
  if (functions >= 1) return 'A'
  if (exports >= 1) return 'B'
  return 'C'
}

/**
 * Classify material based on code style
 * @example
 * classifyMaterial('const x = 1') // 'wood'
 */
export function classifyMaterial(content: string): ChimeTube['material'] {
  const jsdoc = (content.match(JSDOC_RE) ?? []).length
  const anys = (content.match(ANY_RE) ?? []).length
  const generics = (content.match(GENERIC_RE) ?? []).length
  const interfaces = (content.match(INTERFACE_RE) ?? []).length
  const lines = content.split('\n').filter(l => l.trim().length > 0).length

  if (interfaces >= 3 && generics >= 2) return 'glass'
  if (jsdoc >= 3 && anys === 0) return 'aluminum'
  if (generics >= 3) return 'ceramic'
  if (anys === 0 && jsdoc >= 1) return 'metal'
  if (lines > 50 && interfaces >= 1) return 'bamboo'
  if (anys === 0 && lines < 30) return 'shell'
  return 'wood'
}

/**
 * Classify tone quality from resonance and harmony
 * @example
 * classifyToneQuality(80, 10) // 'pure'
 */
export function classifyToneQuality(resonance: number, dissonance: number): ChimeTube['toneQuality'] {
  if (resonance >= 70 && dissonance <= 10) return 'pure'
  if (resonance >= 60 && dissonance <= 20) return 'warm'
  if (resonance >= 50 && dissonance <= 30) return 'bright'
  if (dissonance >= 50) return 'harsh'
  if (dissonance >= 30) return 'dull'
  return 'dull'
}

/**
 * Classify tube from exports, imports, and code metrics
 * @example
 * classifyTube(5, 10, 3) // 'soloist'
 */
export function classifyTube(exports: number, dependents: number, functions: number): ChimeTube['classification'] {
  if (exports >= 5 && dependents >= 5) return 'soloist'
  if (exports >= 3 && dependents >= 3) return 'section-leader'
  if (functions >= 3 || exports >= 2) return 'ensemble'
  if (exports >= 1) return 'accompaniment'
  return 'rest'
}

/**
 * Classify cluster type from unique tones
 * @example
 * classifyClusterType(5) // 'pentatonic'
 */
export function classifyClusterType(uniqueTones: number): ChimeCluster['clusterType'] {
  if (uniqueTones <= 5) return 'pentatonic'
  if (uniqueTones === 7) return 'diatonic'
  if (uniqueTones <= 6) return 'whole-tone'
  if (uniqueTones >= 12) return 'noise'
  if (uniqueTones >= 8) return 'chromatic'
  return 'atonal'
}

/**
 * Classify chord quality from harmony and dissonance
 * @example
 * classifyChordQuality(80, 10) // 'major'
 */
export function classifyChordQuality(harmony: number, dissonance: number): ChimeCluster['chordQuality'] {
  if (harmony >= 70 && dissonance <= 15) return 'major'
  if (harmony >= 60 && dissonance <= 25) return 'minor'
  if (dissonance >= 50) return 'dissonant'
  if (harmony >= 40 && dissonance <= 30) return 'suspended'
  if (dissonance >= 35) return 'diminished'
  return 'augmented'
}

/**
 * Classify wind response from average resonance
 * @example
 * classifyWindResponse(85) // 'sensitive'
 */
export function classifyWindResponse(avgResonance: number): ChimeCluster['windResponse'] {
  if (avgResonance >= 80) return 'sensitive'
  if (avgResonance >= 60) return 'responsive'
  if (avgResonance >= 40) return 'moderate'
  if (avgResonance >= 20) return 'sluggish'
  return 'unresponsive'
}

/**
 * Classify cluster health from harmony and dissonance
 * @example
 * classifyClusterHealth(90, 5) // 'symphonic'
 */
export function classifyClusterHealth(harmony: number, dissonance: number): ChimeCluster['health'] {
  if (harmony >= 80 && dissonance <= 10) return 'symphonic'
  if (harmony >= 65 && dissonance <= 20) return 'harmonious'
  if (harmony >= 50 && dissonance <= 30) return 'pleasant'
  if (harmony >= 35) return 'tolerable'
  if (dissonance >= 50) return 'cacophonous'
  return 'noisy'
}

/**
 * Classify harmony grade from overall harmony score
 * @example
 * classifyHarmonyGrade(85) // 'symphony'
 */
export function classifyHarmonyGrade(avgHarmony: number): WindChimeStats['harmonyGrade'] {
  if (avgHarmony >= 80) return 'symphony'
  if (avgHarmony >= 60) return 'orchestra'
  if (avgHarmony >= 40) return 'band'
  if (avgHarmony >= 20) return 'jam-session'
  if (avgHarmony >= 5) return 'noise'
  return 'silence'
}

// ─── Core Analysis ───────────────────────────────────────────────────────────

/**
 * Analyze a single file as a chime tube
 * @example
 * analyzeChimeTube('export function a() {}', 'a.ts', [], []) // ChimeTube
 */
export function analyzeChimeTube(content: string, filePath: string, imports: string[], dependents: string[]): ChimeTube {
  const lines = content.split('\n')
  const codeLines = lines.filter(l => l.trim().length > 0)

  const exports = (content.match(EXPORT_RE) ?? []).length
  const functions = (content.match(FUNCTION_RE) ?? []).length
  const classes = (content.match(CLASS_RE) ?? []).length
  const interfaces = (content.match(INTERFACE_RE) ?? []).length
  const types = (content.match(TYPE_RE) ?? []).length
  const jsdoc = (content.match(JSDOC_RE) ?? []).length
  const todos = (content.match(TODO_RE) ?? []).length
  const anys = (content.match(ANY_RE) ?? []).length
  const consoles = (content.match(CONSOLE_RE) ?? []).length
  const generics = (content.match(GENERIC_RE) ?? []).length

  const pitch = computePitch(classes, interfaces, functions, codeLines.length)
  const resonance = computeResonance(exports, jsdoc, anys, todos, codeLines.length)
  const sustain = computeSustain(jsdoc, interfaces + types, anys, todos, codeLines.length)
  const tone = classifyTone(content)
  const octave = computeOctave(codeLines.length, classes, functions, generics)
  const amplitude = computeAmplitude(exports, dependents.length, resonance)
  const frequency = computeFrequency(todos, consoles, anys, codeLines.length)
  const material = classifyMaterial(content)
  const tubeLength = codeLines.length
  const diameter = computeDiameter(exports, imports.length, functions, classes)
  const wallThickness = computeWallThickness(interfaces, types, generics, jsdoc)
  const strikeResponse = computeStrikeResponse(exports, jsdoc, anys, codeLines.length)
  const harmonicContent = computeHarmonicContent(functions, classes, interfaces, types, exports)
  const connections = computeConnections(imports, dependents, filePath)

  const dissonance = computeDissonance(anys, todos, consoles, codeLines.length)
  const harmony = computeHarmonyScore(jsdoc, exports, interfaces + types, anys, codeLines.length)

  const isTuned = harmony >= 50 && dissonance <= 30
  const isBroken = dissonance >= 50 || (codeLines.length > 0 && exports === 0 && classes === 0 && functions === 0)
  const isSilent = codeLines.length === 0

  const note = `${tone}${octave}`
  const classification = classifyTube(exports, dependents.length, functions)
  const toneQuality = classifyToneQuality(resonance, dissonance)

  return {
    file: filePath,
    pitch,
    resonance,
    sustain,
    tone,
    octave,
    amplitude,
    frequency,
    toneQuality,
    material,
    tubeLength,
    diameter,
    wallThickness,
    strikeResponse,
    harmonicContent,
    connections,
    dissonance,
    harmony,
    isTuned,
    isBroken,
    isSilent,
    note,
    classification,
  }
}

// ─── Metric Computations ─────────────────────────────────────────────────────

function computePitch(classes: number, interfaces: number, functions: number, lines: number): number {
  if (lines === 0) return 0
  const structural = (classes + interfaces) * 15
  const functional = functions * 8
  const sizeBonus = Math.min(20, Math.floor(lines / 10))
  return Math.min(100, Math.max(0, structural + functional + sizeBonus))
}

function computeResonance(exports: number, jsdoc: number, anys: number, todos: number, lines: number): number {
  if (lines === 0) return 0
  let score = 25
  score += Math.min(25, exports * 4)
  score += Math.min(20, jsdoc * 3)
  score -= anys * 8
  score -= todos * 4
  return Math.min(100, Math.max(0, Math.round(score)))
}

function computeSustain(jsdoc: number, structural: number, anys: number, todos: number, lines: number): number {
  if (lines === 0) return 0
  let score = 20
  score += Math.min(25, jsdoc * 4)
  score += Math.min(20, structural * 5)
  score -= anys * 6
  score -= todos * 3
  return Math.min(100, Math.max(0, Math.round(score)))
}

function computeOctave(lines: number, classes: number, functions: number, generics: number): number {
  let oct = 1
  if (lines >= 20) oct = 2
  if (lines >= 50) oct = 3
  if (classes >= 1) oct = Math.max(oct, 3)
  if (classes >= 2) oct = Math.max(oct, 4)
  if (functions >= 5) oct = Math.max(oct, 4)
  if (generics >= 2) oct = Math.max(oct, 5)
  if (lines >= 100) oct = Math.max(oct, 5)
  if (classes >= 3 && generics >= 3) oct = Math.max(oct, 6)
  if (lines >= 200) oct = Math.max(oct, 6)
  return Math.min(8, oct)
}

function computeAmplitude(exports: number, dependents: number, resonance: number): number {
  const impact = exports * 3 + dependents * 5
  return Math.min(100, Math.max(0, Math.round(resonance * 0.4 + Math.min(60, impact))))
}

function computeFrequency(todos: number, consoles: number, anys: number, lines: number): number {
  if (lines === 0) return 0
  const signals = todos * 3 + consoles * 2 + anys * 4
  return Math.min(100, Math.max(0, Math.round(signals * 5 + 10)))
}

function computeDiameter(exports: number, imports: number, functions: number, classes: number): number {
  return Math.min(100, Math.max(0, (exports + imports + functions + classes) * 5))
}

function computeWallThickness(interfaces: number, types: number, generics: number, jsdoc: number): number {
  return Math.min(100, Math.max(0, (interfaces + types) * 10 + generics * 8 + jsdoc * 3))
}

function computeStrikeResponse(exports: number, jsdoc: number, anys: number, lines: number): number {
  if (lines === 0) return 0
  let score = 30
  score += Math.min(25, exports * 4)
  score += Math.min(15, jsdoc * 3)
  score -= anys * 10
  return Math.min(100, Math.max(0, Math.round(score)))
}

function computeHarmonicContent(functions: number, classes: number, interfaces: number, types: number, exports: number): HarmonicContent {
  const fundamental = Math.min(100, functions * 10 + classes * 15)
  const secondHarmonic = Math.min(100, interfaces * 15 + types * 10)
  const thirdHarmonic = Math.min(100, exports * 8)
  const overtones = [functions > 0, classes > 0, interfaces > 0, types > 0, exports > 0].filter(Boolean).length
  return { fundamental, secondHarmonic, thirdHarmonic, overtones }
}

function computeConnections(imports: string[], dependents: string[], filePath: string): ChimeConnections {
  const resonatesWith: string[] = []
  const dissonantWith: string[] = []
  const dampensBy: string[] = []
  const amplifiesBy: string[] = []

  for (const imp of imports) {
    if (imp.startsWith('.')) {
      resonatesWith.push(imp)
    }
  }

  for (const dep of dependents) {
    amplifiesBy.push(dep)
    if (dependents.length > 5) {
      dampensBy.push(dep)
    }
  }

  const dir = filePath.includes('/') ? filePath.substring(0, filePath.lastIndexOf('/')) : ''
  if (imports.length > 8) {
    dissonantWith.push(`${dir}/index`)
  }

  return { resonatesWith, dissonantWith, dampensBy, amplifiesBy }
}

function computeDissonance(anys: number, todos: number, consoles: number, lines: number): number {
  if (lines === 0) return 0
  let score = anys * 12 + todos * 6 + consoles * 3
  return Math.min(100, Math.max(0, Math.round(score)))
}

function computeHarmonyScore(jsdoc: number, exports: number, structural: number, anys: number, lines: number): number {
  if (lines === 0) return 0
  let score = 20
  score += Math.min(20, jsdoc * 4)
  score += Math.min(20, exports * 3)
  score += Math.min(15, structural * 4)
  score -= anys * 8
  return Math.min(100, Math.max(0, Math.round(score)))
}

// ─── Cluster Analysis ────────────────────────────────────────────────────────

/**
 * Analyze a directory as a chime cluster
 * @example
 * analyzeChimeCluster(tubes, 'src') // ChimeCluster
 */
export function analyzeChimeCluster(tubes: ChimeTube[], dirPath: string): ChimeCluster {
  if (tubes.length === 0) {
    return {
      directory: dirPath,
      tubes: [],
      clusterType: 'noise',
      avgResonance: 0,
      avgHarmony: 0,
      avgDissonance: 0,
      totalAmplitude: 0,
      dominantTone: 'C',
      dominantMaterial: 'wood',
      tunedTubes: 0,
      brokenTubes: 0,
      silentTubes: 0,
      chordQuality: 'dissonant',
      overallHarmony: 0,
      resonanceProfile: 0,
      isMusical: false,
      hasDissonance: false,
      dissonancePoints: [],
      windResponse: 'unresponsive',
      health: 'cacophonous',
    }
  }

  const n = tubes.length
  const avgResonance = Math.round(tubes.reduce((s, t) => s + t.resonance, 0) / n)
  const avgHarmony = Math.round(tubes.reduce((s, t) => s + t.harmony, 0) / n)
  const avgDissonance = Math.round(tubes.reduce((s, t) => s + t.dissonance, 0) / n)
  const totalAmplitude = tubes.reduce((s, t) => s + t.amplitude, 0)

  const uniqueTones = Array.from(new Set(tubes.map(t => t.tone))).length
  const clusterType = classifyClusterType(uniqueTones)

  const dominantTone = findDominant(tubes.map(t => t.tone))
  const dominantMaterial = findDominant(tubes.map(t => t.material))

  const tunedTubes = tubes.filter(t => t.isTuned).length
  const brokenTubes = tubes.filter(t => t.isBroken).length
  const silentTubes = tubes.filter(t => t.isSilent).length

  const chordQuality = classifyChordQuality(avgHarmony, avgDissonance)
  const overallHarmony = Math.min(100, Math.max(0, Math.round(avgHarmony * 0.7 + avgResonance * 0.3)))
  const resonanceProfile = computeResonanceProfile(tubes)

  const isMusical = avgHarmony >= 50 && avgDissonance <= 30
  const hasDissonance = avgDissonance >= 20

  const dissonancePoints = tubes
    .filter(t => t.dissonance >= 40)
    .map(t => t.file)

  const windResponse = classifyWindResponse(avgResonance)
  const health = classifyClusterHealth(avgHarmony, avgDissonance)

  return {
    directory: dirPath,
    tubes,
    clusterType,
    avgResonance,
    avgHarmony,
    avgDissonance,
    totalAmplitude,
    dominantTone,
    dominantMaterial,
    tunedTubes,
    brokenTubes,
    silentTubes,
    chordQuality,
    overallHarmony,
    resonanceProfile,
    isMusical,
    hasDissonance,
    dissonancePoints,
    windResponse,
    health,
  }
}

function findDominant(items: string[]): string {
  const counts = new Map<string, number>()
  for (const item of items) {
    counts.set(item, (counts.get(item) ?? 0) + 1)
  }
  let dominant = items[0] ?? 'C'
  let max = 0
  for (const [item, count] of counts) {
    if (count > max) { max = count; dominant = item }
  }
  return dominant
}

/**
 * Compute resonance profile for a set of tubes
 * @example
 * computeResonanceProfile(tubes) // 75
 */
export function computeResonanceProfile(tubes: ChimeTube[]): number {
  if (tubes.length === 0) return 0
  const avg = tubes.reduce((s, t) => s + t.resonance, 0) / tubes.length
  const variance = tubes.reduce((s, t) => s + Math.pow(t.resonance - avg, 2), 0) / tubes.length
  const consistency = Math.max(0, 100 - Math.round(Math.sqrt(variance)))
  return Math.min(100, Math.max(0, Math.round(avg * 0.6 + consistency * 0.4)))
}

/**
 * Identify dissonance between tubes
 * @example
 * identifyDissonance(tubes) // string[]
 */
export function identifyDissonance(tubes: ChimeTube[]): string[] {
  const points: string[] = []
  for (const tube of tubes) {
    if (tube.dissonance >= 40) {
      points.push(`${tube.file}: dissonance ${tube.dissonance}`)
    }
    if (tube.isBroken) {
      points.push(`${tube.file}: broken tube`)
    }
  }
  return points
}

// ─── Symphony Computation ────────────────────────────────────────────────────

/**
 * Compute the overall symphony from tubes and clusters
 * @example
 * computeSymphony(tubes, clusters) // Symphony
 */
export function computeSymphony(tubes: ChimeTube[], _clusters: ChimeCluster[]): Symphony {
  const totalAmplitude = tubes.reduce((s, t) => s + t.amplitude, 0)
  const avgResonance = tubes.length > 0 ? Math.round(tubes.reduce((s, t) => s + t.resonance, 0) / tubes.length) : 0
  const avgHarmony = tubes.length > 0 ? Math.round(tubes.reduce((s, t) => s + t.harmony, 0) / tubes.length) : 0
  const avgDissonance = tubes.length > 0 ? Math.round(tubes.reduce((s, t) => s + t.dissonance, 0) / tubes.length) : 0

  const toneCounts = new Map<string, number>()
  for (const t of tubes) {
    toneCounts.set(t.tone, (toneCounts.get(t.tone) ?? 0) + 1)
  }
  let dominantKey = 'C'
  let maxK = 0
  for (const [k, c] of toneCounts) { if (c > maxK) { maxK = c; dominantKey = k } }

  const avgFreq = tubes.length > 0 ? tubes.reduce((s, t) => s + t.frequency, 0) / tubes.length : 0
  const tempo = avgFreq >= 60 ? 'allegro' : avgFreq >= 40 ? 'moderato' : avgFreq >= 20 ? 'andante' : 'adagio'

  const maxAmp = tubes.length > 0 ? Math.max(...tubes.map(t => t.amplitude)) : 0
  const minAmp = tubes.length > 0 ? Math.min(...tubes.map(t => t.amplitude)) : 0
  const range = maxAmp - minAmp
  const dynamics = range >= 60 ? 'fortissimo' : range >= 40 ? 'forte' : range >= 20 ? 'mezzo-forte' : 'piano'

  return { totalAmplitude, avgResonance, avgHarmony, avgDissonance, dominantKey, tempo, dynamics }
}

// ─── Recommendations ─────────────────────────────────────────────────────────

/**
 * Generate recommendations for improving wind chime harmony
 * @example
 * generateRecommendations(tubes, clusters, stats) // string[]
 */
export function generateRecommendations(
  tubes: ChimeTube[],
  clusters: ChimeCluster[],
  stats: WindChimeStats,
): string[] {
  const recs: string[] = []

  const dissonantTubes = tubes.filter(t => t.dissonance >= 40)
  if (dissonantTubes.length > 0) recs.push(`${dissonantTubes.length} dissonant tube(s) - harmonize conflicting patterns`)

  const silentTubes = tubes.filter(t => t.isSilent)
  if (silentTubes.length > 0) recs.push(`${silentTubes.length} silent tube(s) - activate or remove dead code`)

  const brokenTubes = tubes.filter(t => t.isBroken)
  if (brokenTubes.length > 0) recs.push(`${brokenTubes.length} broken tube(s) - fix fundamental issues`)

  const untunedTubes = tubes.filter(t => !t.isTuned && !t.isSilent)
  if (untunedTubes.length > 0) recs.push(`${untunedTubes.length} untuned tube(s) - standardize patterns`)

  const cacophonous = clusters.filter(c => c.health === 'cacophonous' || c.health === 'noisy')
  if (cacophonous.length > 0) recs.push(`${cacophonous.length} cacophonous cluster(s) - refactor for coherence`)

  if (stats.avgDissonance >= 40) recs.push(`High dissonance (${stats.avgDissonance}) - reduce any types and TODOs`)
  if (stats.silentTubes > stats.totalFiles * 0.3) recs.push('Too many silent tubes - clean up empty files')

  if (stats.harmonyGrade === 'symphony' || stats.harmonyGrade === 'orchestra') {
    recs.push('Beautiful harmony - the code resonates like a well-tuned instrument')
  }

  if (recs.length === 0) recs.push('Wind chime is in tune - all tubes produce pleasant harmonics')
  return recs
}

// ─── Build Result ────────────────────────────────────────────────────────────

/**
 * Build the complete wind chime analysis result
 * @example
 * buildWindChimeResult(files, contents, {}) // WindChimeResult
 */
export function buildWindChimeResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): WindChimeResult {
  const importMap = new Map<string, string[]>()
  const dependentMap = new Map<string, string[]>()

  for (let i = 0; i < files.length; i++) {
    const matches = (contents[i] ?? '').matchAll(IMPORT_RE)
    const importedPaths: string[] = []
    for (const m of matches) {
if (m[1] !== undefined) importedPaths.push(m[1])
    }
    importMap.set(files[i] ?? '', importedPaths)
    dependentMap.set(files[i] ?? '', [])
  }

  for (const [file, impList] of importMap) {
    for (const imp of impList) {
      for (const otherFile of files) {
        if (otherFile !== file && (otherFile.endsWith(imp) || otherFile.includes(imp.replace(/^\.\//, '')))) {
          const deps = dependentMap.get(otherFile)
          if (deps) deps.push(file)
        }
      }
    }
  }

  const tubes: ChimeTube[] = []
  for (let i = 0; i < files.length; i++) {
    const fileImports = importMap.get(files[i] ?? '') ?? []
    const fileDependents = dependentMap.get(files[i] ?? '') ?? []
    tubes.push(analyzeChimeTube(contents[i] ?? '',files[i] ?? '', fileImports, fileDependents))
  }

  const dirMap = new Map<string, ChimeTube[]>()
  for (const tube of tubes) {
    const normalized = tube.file.replace(/\\/g, '/')
    const dir = normalized.includes('/') ? normalized.substring(0, normalized.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) existing.push(tube)
    else dirMap.set(dir, [tube])
  }

  const clusters: ChimeCluster[] = []
  for (const [dir, dirTubes] of dirMap) {
    clusters.push(analyzeChimeCluster(dirTubes, dir))
  }

  const symphony = computeSymphony(tubes, clusters)
  const stats = computeStats(tubes, clusters)
  const recommendations = generateRecommendations(tubes, clusters, stats)

  return { tubes, clusters, symphony, stats, recommendations }
}

function computeStats(tubes: ChimeTube[], clusters: ChimeCluster[]): WindChimeStats {
  const totalFiles = tubes.length
  const totalClusters = clusters.length

  const avgPitch = totalFiles > 0 ? Math.round(tubes.reduce((s, t) => s + t.pitch, 0) / totalFiles) : 0
  const avgResonance = totalFiles > 0 ? Math.round(tubes.reduce((s, t) => s + t.resonance, 0) / totalFiles) : 0
  const avgSustain = totalFiles > 0 ? Math.round(tubes.reduce((s, t) => s + t.sustain, 0) / totalFiles) : 0
  const avgHarmony = totalFiles > 0 ? Math.round(tubes.reduce((s, t) => s + t.harmony, 0) / totalFiles) : 0
  const avgDissonance = totalFiles > 0 ? Math.round(tubes.reduce((s, t) => s + t.dissonance, 0) / totalFiles) : 0

  const pureTones = tubes.filter(t => t.toneQuality === 'pure').length
  const dissonantTones = tubes.filter(t => t.toneQuality === 'harsh' || t.toneQuality === 'dissonant').length

  const soloists = tubes.filter(t => t.classification === 'soloist').length
  const ensemble = tubes.filter(t => t.classification === 'ensemble' || t.classification === 'section-leader').length
  const silentTubes = tubes.filter(t => t.isSilent).length
  const brokenTubes = tubes.filter(t => t.isBroken).length
  const tunedTubes = tubes.filter(t => t.isTuned).length

  const isMusical = avgHarmony >= 50 && avgDissonance <= 30

  const symphonicClusters = clusters.filter(c => c.health === 'symphonic' || c.health === 'harmonious').length
  const cacophonousClusters = clusters.filter(c => c.health === 'cacophonous' || c.health === 'noisy').length

  const toneCounts = new Map<string, number>()
  for (const t of tubes) {
    toneCounts.set(t.tone, (toneCounts.get(t.tone) ?? 0) + 1)
  }
  let dominantTone = 'C'
  let maxT = 0
  for (const [t, c] of toneCounts) { if (c > maxT) { maxT = c; dominantTone = t } }

  const materialCounts = new Map<string, number>()
  for (const t of tubes) {
    materialCounts.set(t.material, (materialCounts.get(t.material) ?? 0) + 1)
  }
  let dominantMaterial = 'wood'
  let maxM = 0
  for (const [m, c] of materialCounts) { if (c > maxM) { maxM = c; dominantMaterial = m } }

  const overallHarmony = avgHarmony
  const overallResonance = avgResonance
  const harmonyGrade = classifyHarmonyGrade(avgHarmony)

  const sortedByHarmony = [...tubes].sort((a, b) => b.harmony - a.harmony)
  const bestTube = sortedByHarmony.length > 0 ? sortedByHarmony[0]?.file : 'none'
  const worstTube = sortedByHarmony.length > 0 ? sortedByHarmony[sortedByHarmony.length - 1]?.file : 'none'

  const sortedByResonance = [...tubes].sort((a, b) => b.resonance - a.resonance)
  const mostResonant = sortedByResonance.length > 0 ? sortedByResonance[0]?.file : 'none'

  const sortedByDissonance = [...tubes].sort((a, b) => b.dissonance - a.dissonance)
  const mostDissonant = sortedByDissonance.length > 0 ? sortedByDissonance[0]?.file : 'none'

  return {
    totalFiles,
    totalClusters,
    avgPitch,
    avgResonance,
    avgSustain,
    avgHarmony,
    avgDissonance,
    pureTones,
    dissonantTones,
    soloists,
    ensemble,
    silentTubes,
    brokenTubes,
    tunedTubes,
    isMusical,
    symphonicClusters,
    cacophonousClusters,
    dominantTone,
    dominantMaterial,
    overallHarmony,
    overallResonance,
    harmonyGrade,
    bestTube: bestTube ?? '',
    worstTube: worstTube ?? '',
    mostResonant: mostResonant ?? '',
    mostDissonant: mostDissonant ?? '',
  }
}
