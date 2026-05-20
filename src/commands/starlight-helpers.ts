// ─── Types ──────────────────────────────────────────────────────────────────

export type SpectralType = 'O' | 'B' | 'A' | 'F' | 'G' | 'K' | 'M'
export type StellarClassification = 'supergiant' | 'giant' | 'main-sequence' | 'dwarf' | 'white-dwarf' | 'black-dwarf' | 'neutron-star'
export type NebulaType = 'emission' | 'reflection' | 'dark' | 'planetary'
export type OverallClarity = 'blinding' | 'bright' | 'clear' | 'dim' | 'dark'

export interface StellarFile {
  file: string
  luminosity: number
  temperature: number
  distance: number
  spectralType: SpectralType
  magnitude: number
  brightness: number
  surfaceDetail: number
  classification: StellarClassification
  isVariable: boolean
  isBinary: boolean
}

export interface LuminosityFactor {
  factor: string
  contribution: number
  description: string
}

export interface Nebula {
  name: string
  files: string[]
  density: number
  type: NebulaType
  description: string
  obscures: string[]
}

export interface StarlightStats {
  totalFiles: number
  avgLuminosity: number
  avgBrightness: number
  avgTemperature: number
  supergiants: number
  mainSequence: number
  dwarfs: number
  blackDwarfs: number
  variableStars: number
  binarySystems: number
  totalNebulae: number
  darkNebulae: number
  skyBrightness: number
  luminosityDistribution: Record<string, number>
  brightestFile: string
  dimmestFile: string
  spectralDistribution: Record<string, number>
  overallClarity: OverallClarity
  hertzsprungRussell: { x: number; y: number; file: string }[]
}

export interface StarlightResult {
  files: StellarFile[]
  factors: LuminosityFactor[]
  nebulae: Nebula[]
  stats: StarlightStats
  recommendations: string[]
}

// ─── measureBrightness ──────────────────────────────────────────────────────

/**
 * Measure code brightness (readability, naming clarity) 0-100
 * @example
 * measureBrightness('export function processItems(): void {}') // 65
 */
export function measureBrightness(content: string): number {
  let score = 30

  const hasDescriptiveNames = /\b(get|set|process|handle|compute|calculate|validate|transform|parse|build|create|resolve|fetch|load|save|update|delete|remove|find|search|filter|sort|merge|split|check|is|has|can|should)\w+/i.test(content)
  if (hasDescriptiveNames) score += 15

  const avgLineLen = content.split('\n').reduce((s, l) => s + l.length, 0) / Math.max(1, content.split('\n').length)
  if (avgLineLen < 80) score += 15
  else if (avgLineLen < 100) score += 8

  const hasConst = /\bconst\b/.test(content)
  if (hasConst) score += 5

  const lines = content.split('\n')
  const blankLines = lines.filter(l => l.trim().length === 0).length
  const blankRatio = blankLines / Math.max(1, lines.length)
  if (blankRatio >= 0.05 && blankRatio <= 0.3) score += 10

  const hasAny = /:\s*any\b/.test(content)
  if (hasAny) score -= 15

  const singleLetterVars = (content.match(/\b(?:let|const|var)\s+[a-z]\b/g) || []).length
  if (singleLetterVars > 3) score -= 10

  return Math.max(0, Math.min(100, score))
}

// ─── measureSurfaceDetail ───────────────────────────────────────────────────

/**
 * Measure documentation coverage 0-100
 * @example
 * measureSurfaceDetail('docs export function f() {}') // 15
 */
export function measureSurfaceDetail(content: string): number {
  let score = 10

  const jsDocBlocks = (content.match(/\/\*\*[\s\S]*?\*\//g) || []).length
  const exports = (content.match(/export\s+(?:function|class|const|interface|type)/g) || []).length
  if (exports > 0) {
    const docRatio = jsDocBlocks / exports
    score += Math.round(Math.min(50, docRatio * 50))
  } else if (jsDocBlocks > 0) {
    score += 20
  }

  const inlineComments = (content.match(/\/\/.+/g) || []).length
  const codeLines = content.split('\n').filter(l => l.trim().length > 0).length
  const commentRatio = inlineComments / Math.max(1, codeLines)
  score += Math.round(Math.min(25, commentRatio * 100))

  const hasTypeAnnotations = /:\s*(string|number|boolean|void|Promise|Record|Map|Set|Array)/.test(content)
  if (hasTypeAnnotations) score += 15

  return Math.max(0, Math.min(100, score))
}

// ─── measureTemperature ─────────────────────────────────────────────────────

/**
 * Measure code complexity (temperature) 0-100, high = complex
 * @example
 * measureTemperature('if (x) { for (let i = 0; i < n; i++) { while(y) {} } }') // high
 */
export function measureTemperature(content: string): number {
  let score = 10

  const nestingLevels = content.split('\n').map(l => {
    const opens = (l.match(/\{/g) || []).length + (l.match(/\(/g) || []).length
    const closes = (l.match(/\}/g) || []).length + (l.match(/\)/g) || []).length
    return opens - closes
  })
  let depth = 0
  let maxDepth = 0
  for (const delta of nestingLevels) {
    depth += delta
    if (depth > maxDepth) maxDepth = depth
  }
  score += Math.min(30, maxDepth * 5)

  const branches = (content.match(/\bif\b|\belse\b|\bswitch\b|\bcase\b|\b\?\s/g) || []).length
  score += Math.min(20, branches * 3)

  const loops = (content.match(/\bfor\b|\bwhile\b|\bdo\b/g) || []).length
  score += Math.min(15, loops * 5)

  const ternaries = (content.match(/\?[^:]*:/g) || []).length
  score += Math.min(10, ternaries * 2)

  const lines = content.split('\n').filter(l => l.trim().length > 0).length
  if (lines > 200) score += 10
  else if (lines > 100) score += 5

  return Math.max(0, Math.min(100, score))
}

// ─── measureDistance ─────────────────────────────────────────────────────────

/**
 * Measure how deep/hard to reach a file is 0-100
 * @example
 * measureDistance('src/commands/helpers/utils/deep.ts') // high distance
 */
export function measureDistance(_content: string, filePath: string): number {
  let score = 10

  const depth = filePath.split('/').length - 1
  score += Math.min(30, depth * 6)

  if (/utils?\/utils?/.test(filePath)) score += 15
  if (/internal|private|core/.test(filePath)) score += 10

  const segments = filePath.split('/')
  const hasIndex = segments[segments.length - 1] === 'index.ts' || segments[segments.length - 1] === 'index.js'
  if (hasIndex) score -= 10

  if (/^(src|lib)\//.test(filePath)) score -= 5

  return Math.max(0, Math.min(100, score))
}

// ─── measureMagnitude ───────────────────────────────────────────────────────

/**
 * Measure file importance (absolute magnitude)
 * @example
 * measureMagnitude('export function main() {}', 'index.ts') // high
 */
export function measureMagnitude(content: string, filePath: string): number {
  let score = 20

  const exports = (content.match(/export\s/g) || []).length
  score += Math.min(30, exports * 5)

  const imports = (content.match(/import\s/g) || []).length
  score += Math.min(15, imports * 3)

  if (/index\.(ts|js)/.test(filePath)) score += 15
  if (/^(main|app|server|cli)\.(ts|js)/.test(filePath)) score += 10
  if (/mod\.(ts|js)/.test(filePath)) score += 10

  return Math.max(0, Math.min(100, score))
}

// ─── measureLuminosity ──────────────────────────────────────────────────────

/**
 * Measure overall luminosity 0-100 (brightness + documentation + clarity)
 * @example
 * measureLuminosity('export function processItem(): string {}', 'a.ts') // 45
 */
export function measureLuminosity(content: string, filePath: string): number {
  const brightness = measureBrightness(content)
  const surfaceDetail = measureSurfaceDetail(content)
  const temperature = measureTemperature(content)
  const distance = measureDistance(content, filePath)

  const base = brightness * 0.35 + surfaceDetail * 0.25 + (100 - temperature) * 0.2 + (100 - distance) * 0.2
  return Math.round(Math.max(0, Math.min(100, base)))
}

// ─── analyzeLuminosityFactors ───────────────────────────────────────────────

/**
 * Analyze what affects code brightness
 * @example
 * analyzeLuminosityFactors('export function f() {}', 'a.ts') // LuminosityFactor[]
 */
export function analyzeLuminosityFactors(content: string, _filePath: string): LuminosityFactor[] {
  const factors: LuminosityFactor[] = []

  const jsDocCount = (content.match(/\/\*\*[\s\S]*?\*\//g) || []).length
  if (jsDocCount > 0) {
    factors.push({ factor: 'documentation', contribution: Math.min(40, jsDocCount * 10), description: `${jsDocCount} JSDoc block(s) brighten understanding` })
  } else {
    factors.push({ factor: 'documentation', contribution: -20, description: 'No documentation dims clarity' })
  }

  const hasDescriptiveNames = /\b(get|set|process|handle|compute|calculate|validate|transform|parse|build|create|resolve|fetch|load|save|update|delete|remove|find|search|filter|sort)\w+/i.test(content)
  if (hasDescriptiveNames) {
    factors.push({ factor: 'naming', contribution: 25, description: 'Descriptive function names improve readability' })
  } else {
    factors.push({ factor: 'naming', contribution: -15, description: 'Generic names reduce clarity' })
  }

  const hasTypes = /:\s*(string|number|boolean|void|Promise|Record|Map|Set)/.test(content)
  if (hasTypes) {
    factors.push({ factor: 'types', contribution: 20, description: 'Type annotations add clarity' })
  } else {
    factors.push({ factor: 'types', contribution: -10, description: 'Missing type annotations' })
  }

  const exports = (content.match(/export\s/g) || []).length
  const imports = (content.match(/import\s/g) || []).length
  if (exports > 0 && imports > 0) {
    factors.push({ factor: 'structure', contribution: 15, description: 'Clear module boundaries' })
  } else if (exports === 0 && imports === 0) {
    factors.push({ factor: 'structure', contribution: -15, description: 'No clear module interface' })
  }

  const hasAny = /:\s*any\b/.test(content)
  if (hasAny) {
    factors.push({ factor: 'complexity', contribution: -25, description: '`any` type obscures intent' })
  }

  const maxLineLen = Math.max(...content.split('\n').map(l => l.length))
  if (maxLineLen > 150) {
    factors.push({ factor: 'complexity', contribution: -10, description: `Line length ${maxLineLen} chars obscures meaning` })
  }

  return factors
}

// ─── classifySpectralType ───────────────────────────────────────────────────

/**
 * Classify spectral type from luminosity and temperature
 * @example
 * classifySpectralType(90, 85) // 'O'
 */
export function classifySpectralType(luminosity: number, temperature: number): SpectralType {
  if (luminosity >= 80 && temperature >= 60) return 'O'
  if (luminosity >= 70 && temperature >= 45) return 'B'
  if (luminosity >= 60) return 'A'
  if (luminosity >= 50) return 'F'
  if (luminosity >= 40) return 'G'
  if (luminosity >= 25) return 'K'
  return 'M'
}

// ─── classifyStellarFile ────────────────────────────────────────────────────

/**
 * Classify stellar file based on luminosity, temperature, and magnitude
 * @example
 * classifyStellarFile(90, 80, 85) // 'supergiant'
 */
export function classifyStellarFile(luminosity: number, temperature: number, magnitude: number): StellarClassification {
  if (luminosity >= 80 && temperature >= 70 && magnitude >= 60) return 'supergiant'
  if (luminosity >= 70 && temperature >= 60) return 'giant'
  if (luminosity <= 15 && temperature <= 20) return 'black-dwarf'
  if (luminosity <= 30 && temperature <= 25) return 'white-dwarf'
  if (temperature >= 80 && luminosity >= 60) return 'neutron-star'
  if (luminosity < 40) return 'dwarf'
  return 'main-sequence'
}

// ─── detectVariableStars ────────────────────────────────────────────────────

/**
 * Detect if file has inconsistent quality (variable brightness)
 * @example
 * detectVariableStars('export function f() { var x = 1; const y: any = 2; }', 'a.ts') // true
 */
export function detectVariableStars(content: string, _filePath: string): boolean {
  const lines = content.split('\n').filter(l => l.trim().length > 0)
  if (lines.length < 4) return false

  const hasVar = /\bvar\b/.test(content)
  const hasLet = /\blet\b/.test(content)
  const hasConst = /\bconst\b/.test(content)

  const declarationStyles = [hasVar, hasLet, hasConst].filter(Boolean).length
  if (declarationStyles >= 3) return true

  const hasAny = /:\s*any\b/.test(content)
  const hasStrictTypes = /:\s*(string|number|boolean|void)/.test(content)
  if (hasAny && hasStrictTypes) return true

  const hasDocs = /\/\*\*/.test(content)
  const hasUndocumentedExports = /export\s+(function|class|const)/.test(content) && !/\/\*\*[\s\S]*?\*\/\s*export/.test(content)
  if (hasDocs && hasUndocumentedExports) return true

  return false
}

// ─── detectBinarySystems ────────────────────────────────────────────────────

/**
 * Detect tightly coupled file pairs (binary systems)
 * @example
 * detectBinarySystems(['a.ts', 'b.ts'], ['import { x } from "./b"', 'import { y } from "./a"']) // [Set]
 */
export function detectBinarySystems(files: string[], contents: string[]): Set<string>[] {
  const pairs: Set<string>[] = []
  const importMap = new Map<string, Set<string>>()

  for (let i = 0; i < files.length; i++) {
    const imports = new Set<string>()
    const matches = contents[i].matchAll(/import\s+.*?from\s+['"]\.\/?([^'"]+)['"]/g) || []
    for (const m of matches) {
      const imported = m[1].replace(/\.(ts|js)$/, '')
      for (let j = 0; j < files.length; j++) {
        const baseName = files[j].replace(/\.(ts|tsx|js|jsx)$/, '').split('/').pop() || ''
        if (imported === baseName || files[j].includes(imported)) {
          imports.add(files[j])
        }
      }
    }
    importMap.set(files[i], imports)
  }

  for (let i = 0; i < files.length; i++) {
    const importsI = importMap.get(files[i])
    if (!importsI) continue
    for (let j = i + 1; j < files.length; j++) {
      const importsJ = importMap.get(files[j])
      if (!importsJ) continue
      if (importsI.has(files[j]) && importsJ.has(files[i])) {
        pairs.push(new Set([files[i], files[j]]))
      }
    }
  }

  return pairs
}

// ─── identifyNebulae ────────────────────────────────────────────────────────

/**
 * Identify clouded unclear areas (nebulae)
 * @example
 * identifyNebulae(['src/utils/a.ts'], ['var x = 1']) // Nebula[]
 */
export function identifyNebulae(files: string[], contents: string[]): Nebula[] {
  const nebulae: Nebula[] = []
  const dirMap = new Map<string, { files: string[]; contents: string[] }>()

  for (let i = 0; i < files.length; i++) {
    const dir = files[i].split('/').slice(0, -1).join('/') || '.'
    const group = dirMap.get(dir) || { files: [], contents: [] }
    group.files.push(files[i])
    group.contents.push(contents[i])
    dirMap.set(dir, group)
  }

  for (const [dir, group] of dirMap) {
    if (group.files.length < 2) continue

    const allContent = group.contents.join('\n')
    const avgBrightness = group.contents.reduce((s, c) => s + measureBrightness(c), 0) / group.contents.length
    const hasDocs = /\/\*\*/.test(allContent)
    const hasAny = /:\s*any\b/.test(allContent)
    const hasVar = /\bvar\b/.test(allContent)
    const hasOldPatterns = /\bvar\b|\barguments\b|\.prototype\./.test(allContent)

    let density = Math.round(100 - avgBrightness)
    let type: NebulaType = 'emission'
    let description = ''
    const obscures: string[] = []

    if (hasAny && hasVar) {
      type = 'dark'
      description = 'Obscured by any types and var declarations'
      obscures.push(...group.files.filter((_, idx) => /:\s*any\b/.test(group.contents[idx])))
    } else if (hasOldPatterns) {
      type = 'planetary'
      description = 'Legacy patterns cloud modern understanding'
      obscures.push(...group.files.filter((_, idx) => /\bvar\b|\barguments\b|\.prototype\./.test(group.contents[idx])))
    } else if (!hasDocs && avgBrightness < 50) {
      type = 'reflection'
      description = 'Clarity depends on surrounding code context'
      obscures.push(...group.files.filter((_, idx) => !/\/\*\*/.test(group.contents[idx])))
    } else {
      description = 'Internally active but external clarity varies'
    }

    if (density > 30) {
      nebulae.push({
        name: dir,
        files: group.files,
        density,
        type,
        description,
        obscures: Array.from(new Set(obscures)),
      })
    }
  }

  return nebulae
}

// ─── computeSkyBrightness ───────────────────────────────────────────────────

/**
 * Compute overall codebase clarity 0-100
 * @example
 * computeSkyBrightness(stellarFiles) // 65
 */
export function computeSkyBrightness(files: StellarFile[]): number {
  if (files.length === 0) return 50

  const avgLum = files.reduce((s, f) => s + f.luminosity, 0) / files.length
  const avgBright = files.reduce((s, f) => s + f.brightness, 0) / files.length
  const blackDwarfs = files.filter(f => f.classification === 'black-dwarf').length
  const blackDwarfPenalty = Math.min(20, blackDwarfs * 5)
  const variablePenalty = files.filter(f => f.isVariable).length * 2

  return Math.round(Math.max(0, Math.min(100, avgLum * 0.4 + avgBright * 0.4 - blackDwarfPenalty - variablePenalty)))
}

// ─── classifyOverallClarity ─────────────────────────────────────────────────

/**
 * Classify overall codebase clarity
 * @example
 * classifyOverallClarity(90, 85) // 'blinding'
 */
export function classifyOverallClarity(skyBrightness: number, avgLuminosity: number): OverallClarity {
  const combined = skyBrightness * 0.6 + avgLuminosity * 0.4
  if (combined >= 80) return 'blinding'
  if (combined >= 65) return 'bright'
  if (combined >= 45) return 'clear'
  if (combined >= 25) return 'dim'
  return 'dark'
}

// ─── generateHertzsprungRussell ─────────────────────────────────────────────

/**
 * Generate luminosity vs complexity scatter (H-R diagram data)
 * @example
 * generateHertzsprungRussell(stellarFiles) // { x, y, file }[]
 */
export function generateHertzsprungRussell(files: StellarFile[]): { x: number; y: number; file: string }[] {
  return files.map(f => ({
    x: f.temperature,
    y: f.luminosity,
    file: f.file,
  }))
}

// ─── generateRecommendations ────────────────────────────────────────────────

/**
 * Generate starlight recommendations
 * @example
 * generateRecommendations(files, factors, nebulae, stats) // string[]
 */
export function generateRecommendations(
  files: StellarFile[],
  _factors: LuminosityFactor[],
  nebulae: Nebula[],
  stats: StarlightStats,
): string[] {
  const recs: string[] = []

  const blackDwarfs = files.filter(f => f.classification === 'black-dwarf')
  if (blackDwarfs.length > 0) {
    recs.push(`Rewrite or remove ${blackDwarfs.length} black-dwarf file(s): ${blackDwarfs.slice(0, 3).map(f => f.file).join(', ')}`)
  }

  const darkNebulae = nebulae.filter(n => n.type === 'dark')
  if (darkNebulae.length > 0) {
    recs.push(`Add documentation to ${darkNebulae.length} dark nebula(e) to improve clarity`)
  }

  const dimFiles = files.filter(f => f.luminosity < 30)
  if (dimFiles.length > 0) {
    recs.push(`Improve naming and clarity in ${dimFiles.length} dim file(s)`)
  }

  if (stats.variableStars > 0) {
    recs.push(`Stabilize quality in ${stats.variableStars} variable-star file(s)`)
  }

  if (stats.binarySystems > 0) {
    recs.push(`Decouple ${stats.binarySystems} binary system(s) for better modularity`)
  }

  if (stats.skyBrightness < 40) {
    recs.push('Low sky brightness - prioritize documentation and naming improvements')
  }

  if (stats.dwarfs > stats.totalFiles * 0.4 && stats.totalFiles > 0) {
    recs.push('High dwarf ratio - many files need clarity improvements')
  }

  return Array.from(new Set(recs))
}

// ─── buildStarlightResult ───────────────────────────────────────────────────

/**
 * Build complete starlight analysis result
 * @example
 * buildStarlightResult(['a.ts'], ['export function f() {}'], {}) // StarlightResult
 */
export function buildStarlightResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): StarlightResult {
  const stellarFiles: StellarFile[] = []

  for (let i = 0; i < files.length; i++) {
    const content = contents[i] || ''
    const filePath = files[i]

    const brightness = measureBrightness(content)
    const surfaceDetail = measureSurfaceDetail(content)
    const temperature = measureTemperature(content)
    const distance = measureDistance(content, filePath)
    const magnitude = measureMagnitude(content, filePath)
    const luminosity = measureLuminosity(content, filePath)
    const spectralType = classifySpectralType(luminosity, temperature)
    const classification = classifyStellarFile(luminosity, temperature, magnitude)
    const isVariable = detectVariableStars(content, filePath)

    stellarFiles.push({
      file: filePath,
      luminosity,
      temperature,
      distance,
      spectralType,
      magnitude,
      brightness,
      surfaceDetail,
      classification,
      isVariable,
      isBinary: false,
    })
  }

  const binarySystems = detectBinarySystems(files, contents)
  const binaryFileSet = new Set<string>()
  for (const pair of binarySystems) {
    for (const f of pair) binaryFileSet.add(f)
  }
  for (const sf of stellarFiles) {
    sf.isBinary = binaryFileSet.has(sf.file)
  }

  const allFactors: LuminosityFactor[] = []
  for (let i = 0; i < files.length; i++) {
    allFactors.push(...analyzeLuminosityFactors(contents[i] || '', files[i]))
  }

  const nebulae = identifyNebulae(files, contents)

  const avg = (arr: number[]) => arr.length > 0
    ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length)
    : 50

  const supergiants = stellarFiles.filter(f => f.classification === 'supergiant' || f.classification === 'giant').length
  const mainSeq = stellarFiles.filter(f => f.classification === 'main-sequence').length
  const dwarfs = stellarFiles.filter(f => f.classification === 'dwarf' || f.classification === 'white-dwarf').length
  const blackDwarfs = stellarFiles.filter(f => f.classification === 'black-dwarf').length
  const variableStars = stellarFiles.filter(f => f.isVariable).length

  const skyBrightness = computeSkyBrightness(stellarFiles)
  const avgLuminosity = avg(stellarFiles.map(f => f.luminosity))
  const overallClarity = classifyOverallClarity(skyBrightness, avgLuminosity)

  const luminosityBuckets: Record<string, number> = { '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '81-100': 0 }
  for (const f of stellarFiles) {
    if (f.luminosity <= 20) luminosityBuckets['0-20']++
    else if (f.luminosity <= 40) luminosityBuckets['21-40']++
    else if (f.luminosity <= 60) luminosityBuckets['41-60']++
    else if (f.luminosity <= 80) luminosityBuckets['61-80']++
    else luminosityBuckets['81-100']++
  }

  const spectralDist: Record<string, number> = { O: 0, B: 0, A: 0, F: 0, G: 0, K: 0, M: 0 }
  for (const f of stellarFiles) {
    spectralDist[f.spectralType]++
  }

  const sorted = [...stellarFiles].sort((a, b) => b.luminosity - a.luminosity)
  const brightestFile = sorted.length > 0 ? sorted[0].file : ''
  const dimmestFile = sorted.length > 0 ? sorted[sorted.length - 1].file : ''

  const stats: StarlightStats = {
    totalFiles: stellarFiles.length,
    avgLuminosity,
    avgBrightness: avg(stellarFiles.map(f => f.brightness)),
    avgTemperature: avg(stellarFiles.map(f => f.temperature)),
    supergiants,
    mainSequence: mainSeq,
    dwarfs,
    blackDwarfs,
    variableStars,
    binarySystems: binarySystems.length,
    totalNebulae: nebulae.length,
    darkNebulae: nebulae.filter(n => n.type === 'dark').length,
    skyBrightness,
    luminosityDistribution: luminosityBuckets,
    brightestFile,
    dimmestFile,
    spectralDistribution: spectralDist,
    overallClarity,
    hertzsprungRussell: generateHertzsprungRussell(stellarFiles),
  }

  const recommendations = generateRecommendations(stellarFiles, allFactors, nebulae, stats)

  return { files: stellarFiles, factors: allFactors, nebulae, stats, recommendations }
}
