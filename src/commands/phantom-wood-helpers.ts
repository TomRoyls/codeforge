// ─── Interfaces ──────────────────────────────────────────

export interface DriftingMeasure {
  quality: number
  ethereal: 'spectral-perfection' | 'ghostly-grace' | 'proper-spirit' | 'dense-matter' | 'lead-weight' | 'no-quality'
  hasHighQuality: boolean
  hasLightweight: boolean
  hasNoHeavy: boolean
  hasGraceful: boolean
  hasNoClunky: boolean
  hasEfficient: boolean
  hasNoWasteful: boolean
  hasElegant: boolean
  hasClean: boolean
  hasFlowing: boolean
  hasSmooth: boolean
  hasFluid: boolean
  hasMinimal: boolean
  hasPrecise: boolean
  hasRefined: boolean
  hasWeightless: boolean
  heavyCount: number
  wastefulCount: number
}

export interface HauntingMeasure {
  handling: number
  ghost: 'phantom-master' | 'spirit-handler' | 'proper-medium' | 'ghost-fearer' | 'denier' | 'no-handling'
  hasHighHandling: boolean
  hasErrorHandled: boolean
  hasNoUnhandled: boolean
  hasEdgeHandled: boolean
  hasNoIgnored: boolean
  hasNullSafe: boolean
  hasTypeSafe: boolean
  hasDefensive: boolean
  hasForgiving: boolean
  hasResilient: boolean
  hasGraceful: boolean
  hasRecoverable: boolean
  hasRobust: boolean
  hasSafe: boolean
  hasProtected: boolean
  hasShielded: boolean
  unhandledCount: number
  ignoredCount: number
}

export interface ClearingMeasure {
  clarity: number
  mist: 'crystal-clearing' | 'sunlit-gap' | 'proper-clearing' | 'dense-fog' | 'pea-soup' | 'no-clarity'
  hasHighClarity: boolean
  hasReadable: boolean
  hasNoCryptic: boolean
  hasSelfDocumenting: boolean
  hasNoMystery: boolean
  hasClear: boolean
  hasNoObfuscated: boolean
  hasTransparent: boolean
  hasUnderstandable: boolean
  hasVisible: boolean
  hasDirect: boolean
  hasRevealed: boolean
  hasOpen: boolean
  hasIlluminated: boolean
  hasUnobscured: boolean
  hasLucid: boolean
  crypticCount: number
  obfuscatedCount: number
}

export interface RootingMeasure {
  depth: number
  root: 'ancient-root-system' | 'deep-taproot' | 'proper-roots' | 'shallow-roots' | 'surface-only' | 'no-depth'
  hasHighDepth: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasModular: boolean
  hasConnected: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasDocumented: boolean
  hasTyped: boolean
  hasInterfaced: boolean
  hasAbstracted: boolean
  hasGrounded: boolean
  hasFoundational: boolean
  hasNetworked: boolean
  hasStable: boolean
  hasSolid: boolean
  chaoticCount: number
  untestedCount: number
}

export interface LurkingMeasure {
  wisdom: number
  shadow: 'shadow-sage' | 'twilight-knower' | 'proper-lurker' | 'surface-dweller' | 'blind-walker' | 'no-wisdom'
  hasHighWisdom: boolean
  hasWellArchitected: boolean
  hasNoHacked: boolean
  hasPrincipled: boolean
  hasDeep: boolean
  hasProven: boolean
  hasMature: boolean
  hasStrategic: boolean
  hasInsightful: boolean
  hasExperienced: boolean
  hasAdaptive: boolean
  hasEvolved: boolean
  hasResilient: boolean
  hasAware: boolean
  hasKnowledgable: boolean
  hasAccumulated: boolean
  hackedCount: number
  naiveCount: number
}

export type TreeCondition =
  | 'phantom-masterpiece'
  | 'spectral-grove'
  | 'proper-spirit'
  | 'dense-matter'
  | 'lead-weight'
  | 'void'

export interface PhantomTree {
  file: string
  etherealQuality: number
  ghostHandling: number
  mistClarity: number
  rootDepth: number
  shadowWisdom: number
  drifting: DriftingMeasure
  haunting: HauntingMeasure
  clearing: ClearingMeasure
  rooting: RootingMeasure
  lurking: LurkingMeasure
  condition: TreeCondition
  qualityScore: number
}

export type GroveCondition =
  | 'primeval-woodland'
  | 'enchanted-forest'
  | 'proper-grove'
  | 'thin-copse'
  | 'empty-clearing'
  | 'void'

export interface PhantomGrove {
  directory: string
  trees: PhantomTree[]
  avgEthereal: number
  avgRootDepth: number
  avgWisdom: number
  phantomMasterpieceCount: number
  voidCount: number
  groveType: 'ancient-forest' | 'old-growth' | 'proper-grove' | 'young-wood' | 'barren-clearing' | 'no-grove'
  condition: GroveCondition
}

export interface PhantomWoodResult {
  trees: PhantomTree[]
  groves: PhantomGrove[]
  woodland: {
    avgEthereal: number
    avgRootDepth: number
    avgWisdom: number
    isPhantom: boolean
    overallLuminosity: number
  }
  stats: {
    totalFiles: number
    totalGroves: number
    avgEtherealQuality: number
    avgGhostHandling: number
    avgMistClarity: number
    avgRootDepth: number
    avgShadowWisdom: number
    phantomMasterpieceCount: number
    spectralGroveCount: number
    properSpiritCount: number
    denseMatterCount: number
    leadWeightCount: number
    voidCount: number
    hasHighQualityCount: number
    hasHighHandlingCount: number
    hasHighClarityCount: number
    hasHighDepthCount: number
    hasHighWisdomCount: number
    overallLuminosity: number
    rangerGrade: 'forest-ancient' | 'shadow-ranger' | 'woodland-guide' | 'apprentice' | 'novice' | 'lost-wanderer'
    bestTree: string
    mostEthereal: string
    bestHandled: string
    clearest: string
    deepest: string
    wisest: string
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
export function classifyCondition(score: number): TreeCondition {
  if (score >= 90) return 'phantom-masterpiece'
  if (score >= 75) return 'spectral-grove'
  if (score >= 60) return 'proper-spirit'
  if (score >= 40) return 'dense-matter'
  if (score >= 20) return 'lead-weight'
  return 'void'
}

/** @example classifyGroveType(trees) */
export function classifyGroveType(
  trees: PhantomTree[],
): PhantomGrove['groveType'] {
  if (trees.length === 0) return 'no-grove'
  const avg =
    trees.reduce((s, t) => s + t.qualityScore, 0) / trees.length
  if (avg >= 85) return 'ancient-forest'
  if (avg >= 70) return 'old-growth'
  if (avg >= 55) return 'proper-grove'
  if (avg >= 35) return 'young-wood'
  return 'barren-clearing'
}

/** @example classifyGroveCondition(80) */
export function classifyGroveCondition(score: number): GroveCondition {
  if (score >= 85) return 'primeval-woodland'
  if (score >= 70) return 'enchanted-forest'
  if (score >= 55) return 'proper-grove'
  if (score >= 35) return 'thin-copse'
  if (score >= 15) return 'empty-clearing'
  return 'void'
}

/** @example classifyRangerGrade(80) */
export function classifyRangerGrade(
  avgLuminosity: number,
): PhantomWoodResult['stats']['rangerGrade'] {
  if (avgLuminosity >= 80) return 'forest-ancient'
  if (avgLuminosity >= 65) return 'shadow-ranger'
  if (avgLuminosity >= 50) return 'woodland-guide'
  if (avgLuminosity >= 35) return 'apprentice'
  if (avgLuminosity >= 20) return 'novice'
  return 'lost-wanderer'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureDrifting('const x: string = ""') */
export function measureDrifting(content: string): DriftingMeasure {
  const hasLightweight = !/\bany\b/.test(content)
  const heavyCount = (content.match(/\bvar\b/g) ?? []).length
  const hasNoHeavy = heavyCount === 0
  const hasGraceful = /\b(function|=>|return)\b/.test(content)
  const hasNoClunky = (content.match(/\beval\s*\(/g) ?? []).length === 0
  const hasEfficient = /\b(readonly|private|protected)\b/.test(content)
  const wastefulCount = (content.match(/\b(hack|workaround|bypass)\b/gi) ?? []).length
  const hasNoWasteful = wastefulCount === 0
  const hasElegant = /\b(class|interface|type)\b/.test(content)
  const hasClean = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasFlowing = /\b(async|await|Promise)\b/.test(content)
  const hasSmooth = /:\s*(string|number|boolean|void)\b/.test(content)
  const hasFluid = /\b(import|export)\b/.test(content)
  const hasMinimal = !/\b(dirty|hacky|gross)\b/i.test(content)
  const hasPrecise = /\b(readonly|as const)\b/.test(content)
  const hasRefined = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasWeightless = /\b(const|readonly)\b/.test(content)

  const positiveBooleans = [
    hasLightweight,
    hasNoHeavy,
    hasGraceful,
    hasNoClunky,
    hasEfficient,
    hasNoWasteful,
    hasElegant,
    hasClean,
    hasFlowing,
    hasSmooth,
    hasFluid,
    hasMinimal,
    hasPrecise,
    hasRefined,
    hasWeightless,
  ]

  const quality = computeScore(positiveBooleans)
  const hasHighQuality = quality >= 60

  let ethereal: DriftingMeasure['ethereal'] = 'no-quality'
  if (quality >= 90) ethereal = 'spectral-perfection'
  else if (quality >= 75) ethereal = 'ghostly-grace'
  else if (quality >= 60) ethereal = 'proper-spirit'
  else if (quality >= 40) ethereal = 'dense-matter'
  else if (quality >= 20) ethereal = 'lead-weight'

  return {
    quality,
    ethereal,
    hasHighQuality,
    hasLightweight,
    hasNoHeavy,
    hasGraceful,
    hasNoClunky,
    hasEfficient,
    hasNoWasteful,
    hasElegant,
    hasClean,
    hasFlowing,
    hasSmooth,
    hasFluid,
    hasMinimal,
    hasPrecise,
    hasRefined,
    hasWeightless,
    heavyCount,
    wastefulCount,
  }
}

/** @example measureHaunting('try { x() } catch { y() }') */
export function measureHaunting(content: string): HauntingMeasure {
  const hasErrorHandled = /\b(try|catch|finally)\b/.test(content)
  const unhandledCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoUnhandled = unhandledCount === 0
  const hasEdgeHandled = /\b(if|throw|catch)\b/.test(content)
  const ignoredCount = (content.match(/\beval\s*\(/g) ?? []).length
  const hasNoIgnored = ignoredCount === 0
  const hasNullSafe = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasTypeSafe = !/\bany\b/.test(content)
  const hasDefensive = /\b(readonly|private|protected)\b/.test(content)
  const hasForgiving = /\b(try|catch)\b/.test(content)
  const hasResilient = /\b(return|throw|if)\b/.test(content)
  const hasGraceful = /\b(function|=>|return)\b/.test(content)
  const hasRecoverable = /\b(try|catch|if|return)\b/.test(content)
  const hasRobust = /\b(import|export)\b/.test(content)
  const hasSafe = /\b(const|readonly)\b/.test(content)
  const hasProtected = !/\b(vulnerable|exploit|inject)\b/i.test(content)
  const hasShielded = /\b(class|interface|type)\b/.test(content)

  const positiveBooleans = [
    hasErrorHandled,
    hasNoUnhandled,
    hasEdgeHandled,
    hasNoIgnored,
    hasNullSafe,
    hasTypeSafe,
    hasDefensive,
    hasForgiving,
    hasResilient,
    hasGraceful,
    hasRecoverable,
    hasRobust,
    hasSafe,
    hasProtected,
    hasShielded,
  ]

  const handling = computeScore(positiveBooleans)
  const hasHighHandling = handling >= 60

  let ghost: HauntingMeasure['ghost'] = 'no-handling'
  if (handling >= 90) ghost = 'phantom-master'
  else if (handling >= 75) ghost = 'spirit-handler'
  else if (handling >= 60) ghost = 'proper-medium'
  else if (handling >= 40) ghost = 'ghost-fearer'
  else if (handling >= 20) ghost = 'denier'

  return {
    handling,
    ghost,
    hasHighHandling,
    hasErrorHandled,
    hasNoUnhandled,
    hasEdgeHandled,
    hasNoIgnored,
    hasNullSafe,
    hasTypeSafe,
    hasDefensive,
    hasForgiving,
    hasResilient,
    hasGraceful,
    hasRecoverable,
    hasRobust,
    hasSafe,
    hasProtected,
    hasShielded,
    unhandledCount,
    ignoredCount,
  }
}

/** @example measureClearing('export function greet(): string { }') */
export function measureClearing(content: string): ClearingMeasure {
  const hasReadable = /\b(const|let|function|class)\b/.test(content)
  const crypticCount = (content.match(/\b[a-z]\b(?=\s*[=+\-*/])/g) ?? []).length
  const hasNoCryptic = crypticCount === 0
  const hasSelfDocumenting = /\b(function|class|interface|type)\b/.test(content)
  const hasNoMystery = !/\b(magic|mystery|secret)\b/i.test(content)
  const hasClear = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasNoObfuscated = (content.match(/\beval\s*\(/g) ?? []).length === 0
  const hasTransparent = /\b(export|public)\b/.test(content)
  const hasUnderstandable = /\b(if|return|throw|catch)\b/.test(content)
  const hasVisible = /\b(import|export)\b/.test(content)
  const hasDirect = /\b(readonly|private|protected)\b/.test(content)
  const hasRevealed = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasOpen = !/\b(obfuscated|minified|encoded)\b/i.test(content)
  const hasIlluminated = /\b(readonly|as const)\b/.test(content)
  const hasUnobscured = !/\b(blur|fuzzy|unclear|muddy)\b/i.test(content)
  const hasLucid = /\b(class|interface|type)\b/.test(content)

  const positiveBooleans = [
    hasReadable,
    hasNoCryptic,
    hasSelfDocumenting,
    hasNoMystery,
    hasClear,
    hasNoObfuscated,
    hasTransparent,
    hasUnderstandable,
    hasVisible,
    hasDirect,
    hasRevealed,
    hasOpen,
    hasIlluminated,
    hasUnobscured,
    hasLucid,
  ]

  const clarity = computeScore(positiveBooleans)
  const hasHighClarity = clarity >= 60

  let mist: ClearingMeasure['mist'] = 'no-clarity'
  if (clarity >= 90) mist = 'crystal-clearing'
  else if (clarity >= 75) mist = 'sunlit-gap'
  else if (clarity >= 60) mist = 'proper-clearing'
  else if (clarity >= 40) mist = 'dense-fog'
  else if (clarity >= 20) mist = 'pea-soup'

  return {
    clarity,
    mist,
    hasHighClarity,
    hasReadable,
    hasNoCryptic,
    hasSelfDocumenting,
    hasNoMystery,
    hasClear,
    hasNoObfuscated,
    hasTransparent,
    hasUnderstandable,
    hasVisible,
    hasDirect,
    hasRevealed,
    hasOpen,
    hasIlluminated,
    hasUnobscured,
    hasLucid,
    crypticCount,
    obfuscatedCount: crypticCount,
  }
}

/** @example measureRooting('class X { private y: string }') */
export function measureRooting(content: string): RootingMeasure {
  const hasWellStructured = /\b(class|interface|type)\b/.test(content)
  const chaoticCount = (content.match(/\b(var|eval)\b/g) ?? []).length
  const hasNoChaotic = chaoticCount === 0
  const hasModular = /\b(import|export)\b/.test(content)
  const hasConnected = /\b(import|export)\b/.test(content)
  const hasTested = /\b(try|catch|throw|if)\b/.test(content)
  const untestedCount = (content.match(/\beval\s*\(/g) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasDocumented = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasTyped = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasInterfaced = /\b(interface|type)\b/.test(content)
  const hasAbstracted = /\b(class|interface|type)\b/.test(content)
  const hasGrounded = /\b(readonly|private|protected)\b/.test(content)
  const hasFoundational = /\b(function|=>|return)\b/.test(content)
  const hasNetworked = /\b(async|await|Promise)\b/.test(content)
  const hasStable = /\b(const|readonly)\b/.test(content)
  const hasSolid = !/\bany\b/.test(content)

  const positiveBooleans = [
    hasWellStructured,
    hasNoChaotic,
    hasModular,
    hasConnected,
    hasTested,
    hasNoUntested,
    hasDocumented,
    hasTyped,
    hasInterfaced,
    hasAbstracted,
    hasGrounded,
    hasFoundational,
    hasNetworked,
    hasStable,
    hasSolid,
  ]

  const depth = computeScore(positiveBooleans)
  const hasHighDepth = depth >= 60

  let root: RootingMeasure['root'] = 'no-depth'
  if (depth >= 90) root = 'ancient-root-system'
  else if (depth >= 75) root = 'deep-taproot'
  else if (depth >= 60) root = 'proper-roots'
  else if (depth >= 40) root = 'shallow-roots'
  else if (depth >= 20) root = 'surface-only'

  return {
    depth,
    root,
    hasHighDepth,
    hasWellStructured,
    hasNoChaotic,
    hasModular,
    hasConnected,
    hasTested,
    hasNoUntested,
    hasDocumented,
    hasTyped,
    hasInterfaced,
    hasAbstracted,
    hasGrounded,
    hasFoundational,
    hasNetworked,
    hasStable,
    hasSolid,
    chaoticCount,
    untestedCount,
  }
}

/** @example measureLurking('class X implements Y { readonly z: string }') */
export function measureLurking(content: string): LurkingMeasure {
  const hasWellArchitected = /\b(class|interface|type)\b/.test(content)
  const hackedCount = (content.match(/\b(hack|workaround|monkey)\b/gi) ?? []).length
  const hasNoHacked = hackedCount === 0
  const hasPrincipled = /\b(readonly|private|protected)\b/.test(content)
  const hasDeep = /\b(interface|type)\b/.test(content)
  const hasProven = /\b(export|public)\b/.test(content)
  const hasMature = /\b(readonly|as const)\b/.test(content)
  const hasStrategic = /\b(import|export)\b/.test(content)
  const hasInsightful = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasExperienced = /\b(async|await|Promise)\b/.test(content)
  const hasAdaptive = /\b(function|class|interface)\b/.test(content)
  const hasEvolved = /:\s*(string|number|boolean|void)\b/.test(content)
  const hasResilient = /\b(try|catch|if)\b/.test(content)
  const hasAware = !/\b(quick|dirty|temporary)\b/i.test(content)
  const hasKnowledgable = /\b(return|throw)\b/.test(content)
  const hasAccumulated = !/\bany\b/.test(content)

  const naiveCount = (content.match(/\b(naive|simple.minded|unsophisticated)\b/gi) ?? []).length

  const positiveBooleans = [
    hasWellArchitected,
    hasNoHacked,
    hasPrincipled,
    hasDeep,
    hasProven,
    hasMature,
    hasStrategic,
    hasInsightful,
    hasExperienced,
    hasAdaptive,
    hasEvolved,
    hasResilient,
    hasAware,
    hasKnowledgable,
    hasAccumulated,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60

  let shadow: LurkingMeasure['shadow'] = 'no-wisdom'
  if (wisdom >= 90) shadow = 'shadow-sage'
  else if (wisdom >= 75) shadow = 'twilight-knower'
  else if (wisdom >= 60) shadow = 'proper-lurker'
  else if (wisdom >= 40) shadow = 'surface-dweller'
  else if (wisdom >= 20) shadow = 'blind-walker'

  return {
    wisdom,
    shadow,
    hasHighWisdom,
    hasWellArchitected,
    hasNoHacked,
    hasPrincipled,
    hasDeep,
    hasProven,
    hasMature,
    hasStrategic,
    hasInsightful,
    hasExperienced,
    hasAdaptive,
    hasEvolved,
    hasResilient,
    hasAware,
    hasKnowledgable,
    hasAccumulated,
    hackedCount,
    naiveCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzePhantomTree(content, 'app.ts') */
export function analyzePhantomTree(content: string, filePath: string): PhantomTree {
  const drifting = measureDrifting(content)
  const haunting = measureHaunting(content)
  const clearing = measureClearing(content)
  const rooting = measureRooting(content)
  const lurking = measureLurking(content)

  const etherealQuality = drifting.quality
  const ghostHandling = haunting.handling
  const mistClarity = clearing.clarity
  const rootDepth = rooting.depth
  const shadowWisdom = lurking.wisdom

  const qualityScore = Math.round(
    etherealQuality * 0.2 +
    ghostHandling * 0.2 +
    mistClarity * 0.2 +
    rootDepth * 0.2 +
    shadowWisdom * 0.2,
  )

  const condition = classifyCondition(qualityScore)

  return {
    file: filePath,
    etherealQuality,
    ghostHandling,
    mistClarity,
    rootDepth,
    shadowWisdom,
    drifting,
    haunting,
    clearing,
    rooting,
    lurking,
    condition,
    qualityScore,
  }
}

/** @example analyzePhantomGrove(trees, 'src') */
export function analyzePhantomGrove(trees: PhantomTree[], dirPath: string): PhantomGrove {
  if (trees.length === 0) {
    return {
      directory: dirPath,
      trees: [],
      avgEthereal: 0,
      avgRootDepth: 0,
      avgWisdom: 0,
      phantomMasterpieceCount: 0,
      voidCount: 0,
      groveType: 'no-grove',
      condition: 'void',
    }
  }

  const avgEthereal = Math.round(
    trees.reduce((s, t) => s + t.etherealQuality, 0) / trees.length,
  )
  const avgRootDepth = Math.round(
    trees.reduce((s, t) => s + t.rootDepth, 0) / trees.length,
  )
  const avgWisdom = Math.round(
    trees.reduce((s, t) => s + t.shadowWisdom, 0) / trees.length,
  )

  const phantomMasterpieceCount = trees.filter(
    (t) => t.condition === 'phantom-masterpiece',
  ).length
  const voidCount = trees.filter((t) => t.condition === 'void').length

  const groveType = classifyGroveType(trees)
  const avgQuality = Math.round(
    trees.reduce((s, t) => s + t.qualityScore, 0) / trees.length,
  )
  const condition = classifyGroveCondition(avgQuality)

  return {
    directory: dirPath,
    trees,
    avgEthereal,
    avgRootDepth,
    avgWisdom,
    phantomMasterpieceCount,
    voidCount,
    groveType,
    condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildPhantomWoodResult(['a.ts'], [content]) */
export async function buildPhantomWoodResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<PhantomWoodResult> {
  const trees: PhantomTree[] = files.map((file, i) =>
    analyzePhantomTree(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, PhantomTree[]>()
  for (const tree of trees) {
    const dir = tree.file.includes('/')
      ? tree.file.substring(0, tree.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(tree)
    } else {
      dirMap.set(dir, [tree])
    }
  }

  const groves: PhantomGrove[] = Array.from(dirMap.entries()).map(([dir, dirTrees]) =>
    analyzePhantomGrove(dirTrees, dir),
  )

  const avgEthereal =
    trees.length > 0
      ? Math.round(trees.reduce((s, t) => s + t.etherealQuality, 0) / trees.length)
      : 0
  const avgRootDepth =
    trees.length > 0
      ? Math.round(trees.reduce((s, t) => s + t.rootDepth, 0) / trees.length)
      : 0
  const avgWisdom =
    trees.length > 0
      ? Math.round(trees.reduce((s, t) => s + t.shadowWisdom, 0) / trees.length)
      : 0

  const overallLuminosity =
    trees.length > 0
      ? Math.round(trees.reduce((s, t) => s + t.qualityScore, 0) / trees.length)
      : 0
  const isPhantom = overallLuminosity >= 60

  const woodland = { avgEthereal, avgRootDepth, avgWisdom, isPhantom, overallLuminosity }

  const avgEtherealQuality = avgEthereal
  const avgGhostHandling =
    trees.length > 0
      ? Math.round(trees.reduce((s, t) => s + t.ghostHandling, 0) / trees.length)
      : 0
  const avgMistClarity =
    trees.length > 0
      ? Math.round(trees.reduce((s, t) => s + t.mistClarity, 0) / trees.length)
      : 0
  const avgShadowWisdom = avgWisdom

  const phantomMasterpieceCount = trees.filter(
    (t) => t.condition === 'phantom-masterpiece',
  ).length
  const spectralGroveCount = trees.filter(
    (t) => t.condition === 'spectral-grove',
  ).length
  const properSpiritCount = trees.filter(
    (t) => t.condition === 'proper-spirit',
  ).length
  const denseMatterCount = trees.filter(
    (t) => t.condition === 'dense-matter',
  ).length
  const leadWeightCount = trees.filter(
    (t) => t.condition === 'lead-weight',
  ).length
  const voidCount = trees.filter((t) => t.condition === 'void').length

  const hasHighQualityCount = trees.filter(
    (t) => t.drifting.hasHighQuality,
  ).length
  const hasHighHandlingCount = trees.filter(
    (t) => t.haunting.hasHighHandling,
  ).length
  const hasHighClarityCount = trees.filter(
    (t) => t.clearing.hasHighClarity,
  ).length
  const hasHighDepthCount = trees.filter(
    (t) => t.rooting.hasHighDepth,
  ).length
  const hasHighWisdomCount = trees.filter(
    (t) => t.lurking.hasHighWisdom,
  ).length

  const rangerGrade = classifyRangerGrade(overallLuminosity)

  const bestTree = trees.length > 0
    ? trees.reduce((best, t) => (t.qualityScore > best.qualityScore ? t : best)).file
    : ''
  const mostEthereal = trees.length > 0
    ? trees.reduce((best, t) => (t.etherealQuality > best.etherealQuality ? t : best)).file
    : ''
  const bestHandled = trees.length > 0
    ? trees.reduce((best, t) => (t.ghostHandling > best.ghostHandling ? t : best)).file
    : ''
  const clearest = trees.length > 0
    ? trees.reduce((best, t) => (t.mistClarity > best.mistClarity ? t : best)).file
    : ''
  const deepest = trees.length > 0
    ? trees.reduce((best, t) => (t.rootDepth > best.rootDepth ? t : best)).file
    : ''
  const wisest = trees.length > 0
    ? trees.reduce((best, t) => (t.shadowWisdom > best.shadowWisdom ? t : best)).file
    : ''

  const stats: PhantomWoodResult['stats'] = {
    totalFiles: files.length,
    totalGroves: groves.length,
    avgEtherealQuality,
    avgGhostHandling,
    avgMistClarity,
    avgRootDepth,
    avgShadowWisdom,
    phantomMasterpieceCount,
    spectralGroveCount,
    properSpiritCount,
    denseMatterCount,
    leadWeightCount,
    voidCount,
    hasHighQualityCount,
    hasHighHandlingCount,
    hasHighClarityCount,
    hasHighDepthCount,
    hasHighWisdomCount,
    overallLuminosity,
    rangerGrade,
    bestTree,
    mostEthereal,
    bestHandled,
    clearest,
    deepest,
    wisest,
  }

  const recommendations = generateRecommendations(trees, groves, woodland, stats)

  return { trees, groves, woodland, stats, recommendations }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(trees, groves, woodland, stats) */
export function generateRecommendations(
  trees: PhantomTree[],
  groves: PhantomGrove[],
  _woodland: PhantomWoodResult['woodland'],
  stats: PhantomWoodResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgEtherealQuality >= 90 &&
    stats.avgGhostHandling >= 90 &&
    stats.avgMistClarity >= 90 &&
    stats.avgRootDepth >= 90 &&
    stats.avgShadowWisdom >= 90
  ) {
    recs.push(
      'Your phantom forest is a masterpiece of spectral perfection! Each tree glows with ethereal wisdom through the mist!',
    )
    return recs
  }

  if (stats.avgEtherealQuality < 60) {
    recs.push(
      'Lighten the code — phantoms are weightless yet present, graceful in their ethereal passage through the forest',
    )
  }

  if (stats.avgGhostHandling < 60) {
    recs.push(
      'Handle ghosts gracefully — errors and edge cases should pass through code like spirits through ancient trees',
    )
  }

  if (stats.avgMistClarity < 60) {
    recs.push(
      'Clear the mist — even in a phantom forest, the paths between trees should be visible and self-documenting',
    )
  }

  if (stats.avgRootDepth < 60) {
    recs.push(
      'Deepen the roots — like ancient trees connected by mycelial networks, code should build deep foundational connections',
    )
  }

  if (stats.avgShadowWisdom < 60) {
    recs.push(
      'Learn from the shadows — the dark corners of code hold wisdom for those who look beyond the surface',
    )
  }

  if (stats.overallLuminosity < 40) {
    recs.push(
      'The forest has gone dark — reforge the woodland before the last phantom light fades into nothingness',
    )
  }

  const voidTrees = trees.filter((t) => t.condition === 'void')
  if (voidTrees.length > 0 && voidTrees.length <= 5) {
    recs.push(
      `Re-examine these lead-weight trees: ${voidTrees.map((t) => t.file).join(', ')}`,
    )
  } else if (voidTrees.length > 5) {
    recs.push(
      `Re-examine these ${voidTrees.length} lead-weight trees before the phantom forest collapses into shadow`,
    )
  }

  const poorGroves = groves.filter(
    (g) => g.condition === 'void' || g.condition === 'empty-clearing',
  )
  if (poorGroves.length === groves.length && groves.length > 0) {
    recs.push(
      'All groves have withered — the phantom forest needs renewal from the ancient roots upward',
    )
  }

  if (recs.length === 0) {
    recs.push('Your phantom wood glows with spectral grace — each tree channels ancient wisdom through ethereal mist')
  }

  return recs
}
