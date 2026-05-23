// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface SonicMeasure {
  presence: number
  volume: 'thunderous' | 'powerful' | 'resonant' | 'audible' | 'faint' | 'silent'
  hasHighPresence: boolean
  hasResonant: boolean
  hasClearTone: boolean
  hasNoMuffling: boolean
  hasPenetrating: boolean
  hasNoDistortion: boolean
  hasRich: boolean
  hasNoStatic: boolean
  hasHarmonic: boolean
  hasPure: boolean
  mufflingCount: number
  distortionCount: number
}

export interface ImpactMeasure {
  force: number
  strike: 'hammer-strike' | 'heavy-beat' | 'solid-hit' | 'moderate-tap' | 'light-touch' | 'miss'
  hasHighForce: boolean
  hasPowerful: boolean
  hasDirect: boolean
  hasNoGlancing: boolean
  hasDecisive: boolean
  hasNoHesitation: boolean
  hasForceful: boolean
  hasNoWeakness: boolean
  hasAuthoritative: boolean
  hasNoStutter: boolean
  glancingCount: number
  hesitationCount: number
}

export interface ReverberatingMeasure {
  influence: number
  echo: 'cathedral-echo' | 'canyon-reverb' | 'hall-reverb' | 'room-echo' | 'closet-muffle' | 'dead-room'
  hasHighInfluence: boolean
  hasWideReach: boolean
  hasLongSustain: boolean
  hasNoDamping: boolean
  hasFarReaching: boolean
  hasNoDeadEnds: boolean
  hasAmplifying: boolean
  hasNoAbsorption: boolean
  hasEchoing: boolean
  hasNoCancellation: boolean
  dampingCount: number
  absorptionCount: number
}

export interface RhythmMeasure {
  power: number
  beat: 'perfect-timing' | 'syncopated-master' | 'steady-beat' | 'off-beat' | 'irregular' | 'arrhythmic'
  hasHighPower: boolean
  hasSteady: boolean
  hasProperTempo: boolean
  hasNoRushing: boolean
  hasSyncopated: boolean
  hasNoDragging: boolean
  hasGroove: boolean
  hasNoStumble: boolean
  hasInTime: boolean
  hasNoTripping: boolean
  rushingCount: number
  draggingCount: number
}

export interface ResonanceMeasure {
  depth: number
  tone: 'deep-bass' | 'rich-baritone' | 'warm-tenor' | 'clear-alto' | 'thin-soprano' | 'tinny'
  hasHighDepth: boolean
  hasProfound: boolean
  hasMultiLayered: boolean
  hasNoShallowness: boolean
  hasDeep: boolean
  hasNoHollowness: boolean
  hasSubstantial: boolean
  hasNoTininess: boolean
  hasResonantBody: boolean
  hasNoFlatness: boolean
  shallownessCount: number
  hollownessCount: number
}

export interface DrummingMeasure {
  quality: number
  skill: 'master-drummer' | 'virtuoso' | 'skilled-percussionist' | 'competent-player' | 'beginner' | 'tone-deaf'
  hasHighQuality: boolean
  hasSkilled: boolean
  hasNoMissed: boolean
  hasDynamic: boolean
  hasExpressive: boolean
  hasNoMechanical: boolean
  hasControlled: boolean
  hasNoSloppy: boolean
  hasPolished: boolean
  hasNoAmateur: boolean
  missedCount: number
  sloppyCount: number
}

export interface DrumBeat {
  file: string
  sonicPresence: number
  impactForce: number
  reverberation: number
  rhythmPower: number
  resonanceDepth: number
  drumQuality: number
  sonic: SonicMeasure
  impact: ImpactMeasure
  reverberating: ReverberatingMeasure
  rhythm: RhythmMeasure
  resonance: ResonanceMeasure
  drumming: DrummingMeasure
  condition: 'thunder-roll' | 'powerful-beat' | 'steady-drum' | 'fading-rhythm' | 'muffled-beat' | 'silence'
  qualityScore: number
}

export interface DrumCircle {
  directory: string
  beats: DrumBeat[]
  avgSonic: number
  avgRhythm: number
  avgQuality: number
  thunderRollCount: number
  silenceCount: number
  powerfulCount: number
  steadyCount: number
  circleType: 'grand-ceremony' | 'tribal-gathering' | 'drum-circle' | 'rehearsal' | 'practice-session' | 'empty-hall'
  condition: 'earth-shaking' | 'powerful-thunder' | 'rhythmic-ensemble' | 'scattered-beats' | 'fading-echoes' | 'silence'
}

export interface ThunderDrumsResult {
  beats: DrumBeat[]
  circles: DrumCircle[]
  orchestra: {
    avgSonic: number
    avgRhythm: number
    avgQuality: number
    isPowerful: boolean
    overallThunder: number
  }
  stats: {
    totalFiles: number
    totalCircles: number
    avgSonicPresence: number
    avgImpactForce: number
    avgReverberation: number
    avgRhythmPower: number
    avgResonanceDepth: number
    avgDrumQuality: number
    thunderRollCount: number
    powerfulBeatCount: number
    steadyDrumCount: number
    fadingRhythmCount: number
    muffledBeatCount: number
    silenceCount: number
    hasHighPresenceCount: number
    hasHighForceCount: number
    hasHighInfluenceCount: number
    hasHighPowerCount: number
    hasHighDepthCount: number
    hasHighQualityCount: number
    overallThunder: number
    drummerGrade: 'thunder-god' | 'master-percussionist' | 'skilled-drummer' | 'competent-player' | 'beginner' | 'tone-deaf'
    bestBeat: string
    mostPresent: string
    mostPowerful: string
    mostInfluential: string
    bestTimed: string
    deepest: string
  }
  recommendations: string[]
}

// ─── measureSonic ───────────────────────────────────────────────────────────

/** @example measureSonic(content) returns SonicMeasure */
export function measureSonic(content: string): SonicMeasure {
  const lines = content.split('\n')
  const nonEmpty = lines.filter((l) => l.trim().length > 0)
  const hasContent = nonEmpty.length > 0

  const hasTypes = /\btype\s+\w+\s*=/.test(content)
  const hasInterfaces = /\binterface\s+\w+/.test(content)
  const hasClasses = /\bclass\s+\w+/.test(content)
  const hasFunctions = /\bfunction\s+\w+/.test(content) || /=>\s*[{(]/.test(content)
  const hasAsync = /\basync\b/.test(content)
  const hasAwait = /\bawait\b/.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasPrivate = /\bprivate\b/.test(content) || /\bprotected\b/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasStatic = /\bstatic\b/.test(content)

  const mufflingCount = hasContent ? (/\bany\b/.test(content) ? 1 : 0) + (/\beval\s*\(/.test(content) ? 1 : 0) : 0
  const distortionCount = hasContent ? (/\bconsole\.log\s*\(/.test(content) ? 1 : 0) + (/\bdebugger\b/.test(content) ? 1 : 0) : 0

  let score = 0
  if (hasContent) score += 30
  if (hasTypes) score += 8
  if (hasInterfaces) score += 8
  if (hasClasses) score += 7
  if (hasFunctions) score += 5
  if (hasAsync && hasAwait) score += 6
  if (hasGenerics) score += 6
  if (hasPrivate) score += 5
  if (hasReadonly) score += 5
  if (hasStatic) score += 3
  score -= mufflingCount * 3
  score -= distortionCount * 2

  const presence = Math.max(0, Math.min(100, Math.round(score)))
  const hasHighPresence = presence >= 80
  const hasResonant = hasInterfaces || hasTypes
  const hasClearTone = hasFunctions || hasClasses
  const hasNoMuffling = mufflingCount === 0
  const hasPenetrating = hasGenerics && hasAsync
  const hasNoDistortion = distortionCount === 0
  const hasRich = hasPrivate || hasReadonly
  const hasNoStatic = mufflingCount === 0 && distortionCount === 0
  const hasHarmonic = hasInterfaces && hasTypes && hasClasses
  const hasPure = !/\bany\b/.test(content)

  let volume: SonicMeasure['volume'] = 'silent'
  if (presence >= 90) volume = 'thunderous'
  else if (presence >= 75) volume = 'powerful'
  else if (presence >= 60) volume = 'resonant'
  else if (presence >= 45) volume = 'audible'
  else if (presence >= 30) volume = 'faint'

  return { presence, volume, hasHighPresence, hasResonant, hasClearTone, hasNoMuffling, hasPenetrating, hasNoDistortion, hasRich, hasNoStatic, hasHarmonic, hasPure, mufflingCount, distortionCount }
}

// ─── measureImpact ──────────────────────────────────────────────────────────

/** @example measureImpact(content) returns ImpactMeasure */
export function measureImpact(content: string): ImpactMeasure {
  const lines = content.split('\n')
  const nonEmpty = lines.filter((l) => l.trim().length > 0)
  const hasContent = nonEmpty.length > 0

  const hasTryCatch = /\btry\s*\{/.test(content) && /\bcatch\b/.test(content)
  const hasFinally = /\bfinally\s*\{/.test(content)
  const hasErrorTypes = /\bError\b/.test(content) || /\bthrow\b/.test(content)
  const hasNullishCoalescing = /\?\?/.test(content)
  const hasOptionalChaining = /\?\.\w/.test(content) || /\?\.\[/.test(content)
  const hasDefaultParams = /\(\s*\w+\s*=\s*/.test(content)
  const hasFallbackValues = /\|\|/.test(content) || /\?\?/.test(content)
  const hasAsync = /\basync\b/.test(content)
  const hasAwait = /\bawait\b/.test(content)
  const hasPromiseAll = /\bPromise\.all\b/.test(content) || /\bPromise\.allSettled\b/.test(content)
  const hasCleanup = hasFinally || /\bdispose\b/.test(content) || /\bclose\b/.test(content)
  const hasRetry = /\bretry\b/i.test(content) || /\btimeout\b/i.test(content)

  const glancingCount = hasContent ? (hasTryCatch ? 0 : 1) + (hasAsync && !hasTryCatch ? 1 : 0) : 0
  const hesitationCount = hasContent ? (/\bany\b/.test(content) ? 1 : 0) + (!hasErrorTypes && hasContent ? 1 : 0) : 0

  let score = 0
  if (hasContent) score += 25
  if (hasTryCatch) score += 12
  if (hasFinally) score += 5
  if (hasErrorTypes) score += 8
  if (hasNullishCoalescing) score += 5
  if (hasOptionalChaining) score += 5
  if (hasDefaultParams) score += 5
  if (hasFallbackValues) score += 5
  if (hasAsync && hasAwait) score += 5
  if (hasPromiseAll) score += 5
  if (hasCleanup) score += 5
  if (hasRetry) score += 5
  score -= glancingCount * 3
  score -= hesitationCount * 3

  const force = Math.max(0, Math.min(100, Math.round(score)))
  const hasHighForce = force >= 80
  const hasPowerful = hasTryCatch
  const hasDirect = hasErrorTypes
  const hasNoGlancing = glancingCount === 0
  const hasDecisive = hasFinally || hasCleanup
  const hasNoHesitation = hesitationCount === 0
  const hasForceful = hasNullishCoalescing || hasFallbackValues
  const hasNoWeakness = hesitationCount === 0 && glancingCount === 0
  const hasAuthoritative = hasPromiseAll || hasDefaultParams
  const hasNoStutter = !/\bany\b/.test(content)

  let strike: ImpactMeasure['strike'] = 'miss'
  if (force >= 90) strike = 'hammer-strike'
  else if (force >= 75) strike = 'heavy-beat'
  else if (force >= 60) strike = 'solid-hit'
  else if (force >= 45) strike = 'moderate-tap'
  else if (force >= 30) strike = 'light-touch'

  return { force, strike, hasHighForce, hasPowerful, hasDirect, hasNoGlancing, hasDecisive, hasNoHesitation, hasForceful, hasNoWeakness, hasAuthoritative, hasNoStutter, glancingCount, hesitationCount }
}

// ─── measureReverberating ──────────────────────────────────────────────────

/** @example measureReverberating(content) returns ReverberatingMeasure */
export function measureReverberating(content: string): ReverberatingMeasure {
  const lines = content.split('\n')
  const nonEmpty = lines.filter((l) => l.trim().length > 0)
  const hasContent = nonEmpty.length > 0

  const hasImports = /\bimport\b/.test(content)
  const hasNamedImports = /import\s*\{/.test(content)
  const hasTypeImports = /import\s+type\s+/.test(content) || /import\s*\{[^}]*(?:type\s+\w)/.test(content)
  const hasReExports = /export\s*\{/.test(content) || /export\s+\*\s+from/.test(content)
  const hasInterfaces = /\binterface\s+\w+/.test(content)
  const hasClasses = /\bclass\s+\w+/.test(content)
  const hasErrorHandling = /\btry\s*\{/.test(content) && /\bcatch\b/.test(content)
  const hasConfigPatterns = /\bconfig\b|\benv\b|\bConfig\b/.test(content)
  const hasDiPatterns = /\binject\b|\bInjectable\b|\binjectable\b/.test(content)
  const hasPrivateMembers = /\bprivate\b/.test(content) || /\bprotected\b/.test(content)

  const dampingCount = hasContent ? (hasErrorHandling ? 0 : 1) + (hasPrivateMembers || hasInterfaces ? 0 : 1) : 0
  const absorptionCount = hasContent ? (hasImports ? 0 : 1) + (hasConfigPatterns || hasDiPatterns ? 0 : 1) : 0

  let score = 0
  if (hasContent) score += 25
  if (hasImports) score += 8
  if (hasNamedImports) score += 6
  if (hasTypeImports) score += 5
  if (hasReExports) score += 5
  if (hasInterfaces) score += 8
  if (hasClasses) score += 5
  if (hasErrorHandling) score += 8
  if (hasConfigPatterns) score += 5
  if (hasDiPatterns) score += 5
  if (hasPrivateMembers) score += 5
  score -= dampingCount * 3
  score -= absorptionCount * 3

  const influence = Math.max(0, Math.min(100, Math.round(score)))
  const hasHighInfluence = influence >= 80
  const hasWideReach = hasImports && hasInterfaces
  const hasLongSustain = hasErrorHandling
  const hasNoDamping = dampingCount === 0
  const hasFarReaching = hasReExports || hasDiPatterns
  const hasNoDeadEnds = absorptionCount === 0
  const hasAmplifying = hasNamedImports || hasTypeImports
  const hasNoAbsorption = !/\bany\b/.test(content)
  const hasEchoing = hasInterfaces && hasImports
  const hasNoCancellation = dampingCount === 0 && absorptionCount === 0

  let echo: ReverberatingMeasure['echo'] = 'dead-room'
  if (influence >= 90) echo = 'cathedral-echo'
  else if (influence >= 75) echo = 'canyon-reverb'
  else if (influence >= 60) echo = 'hall-reverb'
  else if (influence >= 45) echo = 'room-echo'
  else if (influence >= 30) echo = 'closet-muffle'

  return { influence, echo, hasHighInfluence, hasWideReach, hasLongSustain, hasNoDamping, hasFarReaching, hasNoDeadEnds, hasAmplifying, hasNoAbsorption, hasEchoing, hasNoCancellation, dampingCount, absorptionCount }
}

// ─── measureRhythm ──────────────────────────────────────────────────────────

/** @example measureRhythm(content) returns RhythmMeasure */
export function measureRhythm(content: string): RhythmMeasure {
  const lines = content.split('\n')
  const nonEmpty = lines.filter((l) => l.trim().length > 0)
  const hasContent = nonEmpty.length > 0

  const hasConsistentQuotes = hasContent ? (() => {
    const single = (content.match(/'/g) || []).length
    const double = (content.match(/"/g) || []).length
    return single === 0 || double === 0 || single / double > 3 || double / single > 3
  })() : true
  const hasConsistentSemicolons = hasContent ? (() => {
    const withSemi = nonEmpty.filter((l) => l.trim().endsWith(';')).length
    const withoutSemi = nonEmpty.length - withSemi
    return withSemi === 0 || withoutSemi === 0 || withSemi / withoutSemi > 3 || withoutSemi / withSemi > 3
  })() : true
  const hasExports = /\bexport\b/.test(content)
  const hasNamedExports = /export\s+(const|let|function|class|interface|type|enum)\s+\w+/.test(content)
  const hasImports = /\bimport\b/.test(content)
  const hasConsistentIndentation = hasContent ? (() => {
    const spaceIndent = nonEmpty.filter((l) => /^ {2,}/.test(l)).length
    const tabIndent = nonEmpty.filter((l) => /^\t/.test(l)).length
    return spaceIndent === 0 || tabIndent === 0
  })() : true
  const hasModules = hasImports || hasExports

  const rushingCount = hasContent ? (hasConsistentQuotes ? 0 : 1) + (hasConsistentSemicolons ? 0 : 1) : 0
  const draggingCount = hasContent ? (hasConsistentIndentation ? 0 : 1) + (hasModules ? 0 : 1) : 0

  let score = 0
  if (hasContent) score += 25
  if (hasConsistentQuotes) score += 8
  if (hasConsistentSemicolons) score += 8
  if (hasExports) score += 8
  if (hasNamedExports) score += 8
  if (hasImports) score += 6
  if (hasConsistentIndentation) score += 8
  if (hasModules) score += 5
  score -= rushingCount * 4
  score -= draggingCount * 4

  const power = Math.max(0, Math.min(100, Math.round(score)))
  const hasHighPower = power >= 80
  const hasSteady = hasConsistentQuotes && hasConsistentSemicolons
  const hasProperTempo = hasConsistentIndentation
  const hasNoRushing = rushingCount === 0
  const hasSyncopated = hasNamedExports && hasImports
  const hasNoDragging = draggingCount === 0
  const hasGroove = hasConsistentQuotes && hasConsistentSemicolons && hasConsistentIndentation
  const hasNoStumble = draggingCount === 0
  const hasInTime = rushingCount === 0 && draggingCount === 0
  const hasNoTripping = rushingCount === 0

  let beat: RhythmMeasure['beat'] = 'arrhythmic'
  if (power >= 90) beat = 'perfect-timing'
  else if (power >= 75) beat = 'syncopated-master'
  else if (power >= 60) beat = 'steady-beat'
  else if (power >= 45) beat = 'off-beat'
  else if (power >= 30) beat = 'irregular'

  return { power, beat, hasHighPower, hasSteady, hasProperTempo, hasNoRushing, hasSyncopated, hasNoDragging, hasGroove, hasNoStumble, hasInTime, hasNoTripping, rushingCount, draggingCount }
}

// ─── measureResonance ───────────────────────────────────────────────────────

/** @example measureResonance(content) returns ResonanceMeasure */
export function measureResonance(content: string): ResonanceMeasure {
  const lines = content.split('\n')
  const nonEmpty = lines.filter((l) => l.trim().length > 0)
  const hasContent = nonEmpty.length > 0

  const hasJsDoc = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasInlineComments = /\/\/.*$/.test(content)
  const hasTypeAnnotations = /:\s*(string|number|boolean|void|never|unknown)\b/.test(content)
  const hasInterfaces = /\binterface\s+\w+/.test(content)
  const hasTypes = /\btype\s+\w+\s*=/.test(content)
  const hasDescriptiveNames = /\b(get|set|is|has|can|should|will|handle|process|validate|transform|create|build|parse|format)\w*\s*\(/.test(content)
  const hasReturnTypes = /\)\s*:\s*\w/.test(content)
  const hasExports = /\bexport\b/.test(content)
  const hasImports = /\bimport\b/.test(content)
  const hasProperFunctions = /\bfunction\s+\w+/.test(content) || /const\s+\w+\s*=\s*(\([^)]*\)|[^=])\s*=>/.test(content)
  const hasNoAny = !/\bany\b/.test(content)

  const shallownessCount = hasContent ? (hasJsDoc ? 0 : 1) + (hasInlineComments ? 0 : 1) : 0
  const hollownessCount = hasContent ? (/\bany\b/.test(content) ? 1 : 0) + (/\beval\s*\(/.test(content) ? 1 : 0) : 0

  let score = 0
  if (hasContent) score += 25
  if (hasJsDoc) score += 12
  if (hasInlineComments) score += 5
  if (hasTypeAnnotations) score += 8
  if (hasInterfaces) score += 8
  if (hasTypes) score += 5
  if (hasDescriptiveNames) score += 8
  if (hasReturnTypes) score += 8
  if (hasExports) score += 5
  if (hasImports) score += 4
  if (hasProperFunctions) score += 5
  if (hasNoAny) score += 3
  score -= shallownessCount * 3
  score -= hollownessCount * 2

  const depth = Math.max(0, Math.min(100, Math.round(score)))
  const hasHighDepth = depth >= 80
  const hasProfound = hasJsDoc && hasTypeAnnotations
  const hasMultiLayered = hasInterfaces && hasTypes
  const hasNoShallowness = shallownessCount === 0
  const hasDeep = hasExports && hasImports
  const hasNoHollowness = hollownessCount === 0
  const hasSubstantial = hasDescriptiveNames
  const hasNoTininess = !/\beval\s*\(/.test(content)
  const hasResonantBody = hasJsDoc || hasInlineComments
  const hasNoFlatness = shallownessCount === 0 && hollownessCount === 0

  let tone: ResonanceMeasure['tone'] = 'tinny'
  if (depth >= 90) tone = 'deep-bass'
  else if (depth >= 75) tone = 'rich-baritone'
  else if (depth >= 60) tone = 'warm-tenor'
  else if (depth >= 45) tone = 'clear-alto'
  else if (depth >= 30) tone = 'thin-soprano'

  return { depth, tone, hasHighDepth, hasProfound, hasMultiLayered, hasNoShallowness, hasDeep, hasNoHollowness, hasSubstantial, hasNoTininess, hasResonantBody, hasNoFlatness, shallownessCount, hollownessCount }
}

// ─── measureDrumming ────────────────────────────────────────────────────────

/** @example measureDrumming(content) returns DrummingMeasure */
export function measureDrumming(content: string): DrummingMeasure {
  const lines = content.split('\n')
  const nonEmpty = lines.filter((l) => l.trim().length > 0)
  const hasContent = nonEmpty.length > 0

  const hasExports = /\bexport\b/.test(content)
  const hasInterfaces = /\binterface\s+\w+/.test(content)
  const hasTypes = /\btype\s+\w+\s*=/.test(content)
  const hasClasses = /\bclass\s+\w+/.test(content)
  const hasAsync = /\basync\b/.test(content)
  const hasDocs = /\/\*\*/.test(content)
  const hasTryCatch = /\btry\s*\{/.test(content) && /\bcatch\b/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasConst = /\bconst\b/.test(content)
  const hasNoLet = !/\blet\b/.test(content)
  const hasNoVar = !/\bvar\b/.test(content)

  const missedCount = hasContent ? (hasDocs ? 0 : 1) + (hasReadonly || hasConst ? 0 : 1) : 0
  const sloppyCount = hasContent ? (hasTryCatch ? 0 : 1) + (/\bany\b/.test(content) ? 1 : 0) : 0

  let score = 0
  if (hasContent) score += 25
  if (hasExports) score += 8
  if (hasInterfaces) score += 8
  if (hasTypes) score += 5
  if (hasClasses) score += 5
  if (hasAsync) score += 8
  if (hasDocs) score += 8
  if (hasTryCatch) score += 8
  if (hasReadonly) score += 5
  if (hasConst) score += 3
  if (hasNoLet && hasNoVar) score += 5
  score -= missedCount * 3
  score -= sloppyCount * 4

  const quality = Math.max(0, Math.min(100, Math.round(score)))
  const hasHighQuality = quality >= 80
  const hasSkilled = hasExports && (hasInterfaces || hasTypes)
  const hasNoMissed = missedCount === 0
  const hasDynamic = hasAsync || hasClasses
  const hasExpressive = hasDocs || hasTryCatch
  const hasNoMechanical = missedCount === 0 && sloppyCount === 0
  const hasControlled = hasReadonly || (hasConst && hasNoLet)
  const hasNoSloppy = sloppyCount === 0
  const hasPolished = hasExports && hasDocs
  const hasNoAmateur = sloppyCount === 0 && missedCount === 0

  let skill: DrummingMeasure['skill'] = 'tone-deaf'
  if (quality >= 90) skill = 'master-drummer'
  else if (quality >= 75) skill = 'virtuoso'
  else if (quality >= 60) skill = 'skilled-percussionist'
  else if (quality >= 45) skill = 'competent-player'
  else if (quality >= 30) skill = 'beginner'

  return { quality, skill, hasHighQuality, hasSkilled, hasNoMissed, hasDynamic, hasExpressive, hasNoMechanical, hasControlled, hasNoSloppy, hasPolished, hasNoAmateur, missedCount, sloppyCount }
}

// ─── analyzeDrumBeat ────────────────────────────────────────────────────────

/** @example analyzeDrumBeat(content, filePath) returns DrumBeat */
export function analyzeDrumBeat(content: string, filePath: string): DrumBeat {
  const sonic = measureSonic(content)
  const impact = measureImpact(content)
  const reverberating = measureReverberating(content)
  const rhythm = measureRhythm(content)
  const resonance = measureResonance(content)
  const drumming = measureDrumming(content)

  const sonicPresence = sonic.presence
  const impactForce = impact.force
  const reverberation = reverberating.influence
  const rhythmPower = rhythm.power
  const resonanceDepth = resonance.depth
  const drumQuality = drumming.quality

  const qualityScore = Math.round(
    sonicPresence * 0.2 +
    impactForce * 0.15 +
    reverberation * 0.15 +
    rhythmPower * 0.15 +
    resonanceDepth * 0.15 +
    drumQuality * 0.2,
  )

  const condition = classifyBeatCondition(qualityScore)

  return {
    file: filePath, sonicPresence, impactForce, reverberation, rhythmPower, resonanceDepth, drumQuality,
    sonic, impact, reverberating, rhythm, resonance, drumming, condition, qualityScore,
  }
}

// ─── classifyBeatCondition ──────────────────────────────────────────────────

/** @example classifyBeatCondition(score) returns condition string */
export function classifyBeatCondition(score: number): DrumBeat['condition'] {
  if (score >= 90) return 'thunder-roll'
  if (score >= 75) return 'powerful-beat'
  if (score >= 60) return 'steady-drum'
  if (score >= 45) return 'fading-rhythm'
  if (score >= 30) return 'muffled-beat'
  return 'silence'
}

// ─── classifyCircleType ─────────────────────────────────────────────────────

/** @example classifyCircleType(beats) returns circle type string */
export function classifyCircleType(beats: DrumBeat[]): DrumCircle['circleType'] {
  if (beats.length === 0) return 'empty-hall'
  const avg = beats.reduce((s, b) => s + b.qualityScore, 0) / beats.length
  const thunderRolls = beats.filter((b) => b.condition === 'thunder-roll').length
  const ratio = thunderRolls / beats.length

  if (avg >= 80 && ratio >= 0.5) return 'grand-ceremony'
  if (avg >= 70) return 'tribal-gathering'
  if (avg >= 55) return 'drum-circle'
  if (avg >= 40) return 'rehearsal'
  if (avg >= 25) return 'practice-session'
  return 'empty-hall'
}

// ─── analyzeDrumCircle ──────────────────────────────────────────────────────

/** @example analyzeDrumCircle(beats, dirPath) returns DrumCircle */
export function analyzeDrumCircle(beats: DrumBeat[], dirPath: string): DrumCircle {
  if (beats.length === 0) {
    return { directory: dirPath, beats, avgSonic: 0, avgRhythm: 0, avgQuality: 0, thunderRollCount: 0, silenceCount: 0, powerfulCount: 0, steadyCount: 0, circleType: 'empty-hall', condition: 'silence' }
  }

  const avgSonic = Math.round(beats.reduce((s, b) => s + b.sonicPresence, 0) / beats.length)
  const avgRhythm = Math.round(beats.reduce((s, b) => s + b.rhythmPower, 0) / beats.length)
  const avgQuality = Math.round(beats.reduce((s, b) => s + b.drumQuality, 0) / beats.length)
  const thunderRollCount = beats.filter((b) => b.condition === 'thunder-roll').length
  const silenceCount = beats.filter((b) => b.condition === 'silence').length
  const powerfulCount = beats.filter((b) => b.condition === 'powerful-beat').length
  const steadyCount = beats.filter((b) => b.condition === 'steady-drum').length

  const circleType = classifyCircleType(beats)
  const overallAvg = Math.round(beats.reduce((s, b) => s + b.qualityScore, 0) / beats.length)

  let condition: DrumCircle['condition'] = 'silence'
  if (overallAvg >= 80) condition = 'earth-shaking'
  else if (overallAvg >= 65) condition = 'powerful-thunder'
  else if (overallAvg >= 50) condition = 'rhythmic-ensemble'
  else if (overallAvg >= 35) condition = 'scattered-beats'
  else if (overallAvg >= 20) condition = 'fading-echoes'

  return { directory: dirPath, beats, avgSonic, avgRhythm, avgQuality, thunderRollCount, silenceCount, powerfulCount, steadyCount, circleType, condition }
}

// ─── classifyDrummerGrade ───────────────────────────────────────────────────

/** @example classifyDrummerGrade(85) returns 'thunder-god' */
export function classifyDrummerGrade(avgThunder: number): ThunderDrumsResult['stats']['drummerGrade'] {
  if (avgThunder >= 80) return 'thunder-god'
  if (avgThunder >= 65) return 'master-percussionist'
  if (avgThunder >= 50) return 'skilled-drummer'
  if (avgThunder >= 35) return 'competent-player'
  if (avgThunder >= 20) return 'beginner'
  return 'tone-deaf'
}

// ─── generateRecommendations ────────────────────────────────────────────────

/** @example generateRecommendations(beats, circles, orchestra, stats) returns string[] */
export function generateRecommendations(
  beats: DrumBeat[],
  circles: DrumCircle[],
  orchestra: ThunderDrumsResult['orchestra'],
  stats: ThunderDrumsResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgSonicPresence < 50) recs.push('Increase sonic presence — improve code visibility with types, interfaces, and modern patterns')
  if (stats.avgImpactForce < 50) recs.push('Strengthen impact force — add error handling and recovery mechanisms')
  if (stats.avgReverberation < 50) recs.push('Boost reverberation — enhance code influence with imports, exports, and dependency management')
  if (stats.avgRhythmPower < 50) recs.push('Improve rhythm power — enhance code style consistency')
  if (stats.avgResonanceDepth < 50) recs.push('Deepen resonance — enhance documentation and code clarity')
  if (stats.avgDrumQuality < 50) recs.push('Improve drum quality — enhance code craftsmanship with exports, docs, and error handling')
  if (stats.silenceCount > stats.totalFiles * 0.3) recs.push('Critical: over 30% of files are silent — consider major code revitalization')
  if (stats.muffledBeatCount > 0) recs.push('Warning: muffled beats detected — these need immediate attention')
  if (orchestra.overallThunder < 40) recs.push('Overall thunder is critically low — establish a code power improvement regimen')
  if (circles.length > 0 && circles.every((c) => c.condition === 'silence')) recs.push('All circles are silent — your codebase needs fundamental resuscitation')

  if (beats.length > 0) {
    const highMuffling = beats.filter((b) => b.sonic.mufflingCount > 2)
    if (highMuffling.length > beats.length * 0.5) recs.push('Over 50% of beats have high muffling — reduce `any` and `eval` usage')
  }

  return recs
}

// ─── buildThunderDrumsResult ────────────────────────────────────────────────

/** @example buildThunderDrumsResult(files, contents, options) returns full result */
export function buildThunderDrumsResult(files: string[], contents: string[], _options?: Record<string, unknown>): ThunderDrumsResult {
  const beats = files.map((file, i) => analyzeDrumBeat(contents[i] ?? '', file))

  const circleMap = new Map<string, DrumBeat[]>()
  beats.forEach((b) => {
    const parts = b.file.split('/')
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
    const existing = circleMap.get(dir)
    if (existing) existing.push(b)
    else circleMap.set(dir, [b])
  })

  const circles = Array.from(circleMap.entries()).map(([dir, bs]) => analyzeDrumCircle(bs, dir))

  const avgSonicPresence = beats.length > 0 ? Math.round(beats.reduce((s, b) => s + b.sonicPresence, 0) / beats.length) : 0
  const avgImpactForce = beats.length > 0 ? Math.round(beats.reduce((s, b) => s + b.impactForce, 0) / beats.length) : 0
  const avgReverberation = beats.length > 0 ? Math.round(beats.reduce((s, b) => s + b.reverberation, 0) / beats.length) : 0
  const avgRhythmPower = beats.length > 0 ? Math.round(beats.reduce((s, b) => s + b.rhythmPower, 0) / beats.length) : 0
  const avgResonanceDepth = beats.length > 0 ? Math.round(beats.reduce((s, b) => s + b.resonanceDepth, 0) / beats.length) : 0
  const avgDrumQuality = beats.length > 0 ? Math.round(beats.reduce((s, b) => s + b.drumQuality, 0) / beats.length) : 0

  const overallThunder = Math.round(
    avgSonicPresence * 0.2 +
    avgImpactForce * 0.15 +
    avgReverberation * 0.15 +
    avgRhythmPower * 0.15 +
    avgResonanceDepth * 0.15 +
    avgDrumQuality * 0.2,
  )

  const orchestra = {
    avgSonic: avgSonicPresence,
    avgRhythm: avgRhythmPower,
    avgQuality: avgDrumQuality,
    isPowerful: overallThunder >= 70,
    overallThunder,
  }

  const stats = {
    totalFiles: files.length,
    totalCircles: circles.length,
    avgSonicPresence, avgImpactForce, avgReverberation, avgRhythmPower, avgResonanceDepth, avgDrumQuality,
    thunderRollCount: beats.filter((b) => b.condition === 'thunder-roll').length,
    powerfulBeatCount: beats.filter((b) => b.condition === 'powerful-beat').length,
    steadyDrumCount: beats.filter((b) => b.condition === 'steady-drum').length,
    fadingRhythmCount: beats.filter((b) => b.condition === 'fading-rhythm').length,
    muffledBeatCount: beats.filter((b) => b.condition === 'muffled-beat').length,
    silenceCount: beats.filter((b) => b.condition === 'silence').length,
    hasHighPresenceCount: beats.filter((b) => b.sonic.hasHighPresence).length,
    hasHighForceCount: beats.filter((b) => b.impact.hasHighForce).length,
    hasHighInfluenceCount: beats.filter((b) => b.reverberating.hasHighInfluence).length,
    hasHighPowerCount: beats.filter((b) => b.rhythm.hasHighPower).length,
    hasHighDepthCount: beats.filter((b) => b.resonance.hasHighDepth).length,
    hasHighQualityCount: beats.filter((b) => b.drumming.hasHighQuality).length,
    overallThunder,
    drummerGrade: classifyDrummerGrade(overallThunder),
    bestBeat: beats.length > 0 ? beats.reduce((b, a) => a.qualityScore > b.qualityScore ? a : b).file : '',
    mostPresent: beats.length > 0 ? beats.reduce((b, a) => a.sonicPresence > b.sonicPresence ? a : b).file : '',
    mostPowerful: beats.length > 0 ? beats.reduce((b, a) => a.impactForce > b.impactForce ? a : b).file : '',
    mostInfluential: beats.length > 0 ? beats.reduce((b, a) => a.reverberation > b.reverberation ? a : b).file : '',
    bestTimed: beats.length > 0 ? beats.reduce((b, a) => a.rhythmPower > b.rhythmPower ? a : b).file : '',
    deepest: beats.length > 0 ? beats.reduce((b, a) => a.resonanceDepth > b.resonanceDepth ? a : b).file : '',
  }

  const recommendations = generateRecommendations(beats, circles, orchestra, stats)

  return { beats, circles, orchestra, stats, recommendations }
}
