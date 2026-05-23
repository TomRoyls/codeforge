// ─── Types ─────────────────────────────────────────────────────────────────

export interface ResonantMeasure {
  impact: number
  ring: 'thunderous-peal' | 'clear-chime' | 'pleasant-ring' | 'dull-thud' | 'muffled-clank' | 'silent'
  hasHighImpact: boolean
  hasFarReaching: boolean
  hasInfluential: boolean
  hasNoIsolation: boolean
  hasAmplifying: boolean
  hasNoDeadening: boolean
  hasEchoing: boolean
  hasNoAbsorbing: boolean
  hasCarrying: boolean
  hasNoMuffling: boolean
  isolationCount: number
  deadeningCount: number
}

export interface ClearMeasure {
  readability: number
  tone: 'crystal-clear' | 'bright-tone' | 'clear-note' | 'slightly-cloudy' | 'muddy' | 'opaque'
  hasHighReadability: boolean
  hasReadable: boolean
  hasObvious: boolean
  hasNoObfuscation: boolean
  hasTransparent: boolean
  hasNoHiding: boolean
  hasSelfExplanatory: boolean
  hasNoConfusion: boolean
  hasLuminous: boolean
  hasNoMystery: boolean
  obfuscationCount: number
  confusionCount: number
}

export interface RingingMeasure {
  quality: number
  strike: 'perfect-strike' | 'clean-ring' | 'proper-tone' | 'off-key' | 'dissonant' | 'cacophony'
  hasHighQuality: boolean
  hasEfficient: boolean
  hasPrecise: boolean
  hasNoWaste: boolean
  hasOptimal: boolean
  hasNoRedundancy: boolean
  hasClean: boolean
  hasNoSloppiness: boolean
  hasPolished: boolean
  hasNoRoughness: boolean
  wasteCount: number
  sloppinessCount: number
}

export interface PureMeasure {
  correctness: number
  tone: 'pure-tone' | 'harmonic' | 'clean-note' | 'slightly-off' | 'dissonant' | 'atonal'
  hasHighCorrectness: boolean
  hasTypeSafe: boolean
  hasNoHacks: boolean
  hasProper: boolean
  hasNoWorkarounds: boolean
  hasCorrect: boolean
  hasNoBugs: boolean
  hasSound: boolean
  hasNoShortcuts: boolean
  hasValid: boolean
  hackCount: number
  workaroundCount: number
}

export interface SustainingMeasure {
  lastingValue: number
  duration: 'eternal-ring' | 'long-sustain' | 'proper-decay' | 'short-ring' | 'quick-fade' | 'immediate-silence'
  hasHighLastingValue: boolean
  hasTimeless: boolean
  hasReusable: boolean
  hasNoDisposable: boolean
  hasDurable: boolean
  hasNoFragile: boolean
  hasEnduring: boolean
  hasNoTemporary: boolean
  hasStable: boolean
  hasNoVolatile: boolean
  disposableCount: number
  fragileCount: number
}

export interface BalancedMeasure {
  proportion: number
  harmony: 'perfect-harmony' | 'well-balanced' | 'proper-mix' | 'uneven' | 'unbalanced' | 'chaotic'
  hasHighProportion: boolean
  hasProportioned: boolean
  hasBalanced: boolean
  hasNoOverweight: boolean
  hasEven: boolean
  hasNoBloat: boolean
  hasRightSized: boolean
  hasNoGiant: boolean
  hasMeasured: boolean
  hasNoExcess: boolean
  overweightCount: number
  bloatCount: number
}

export type BellCondition = 'silver-chime' | 'clear-bell' | 'pleasant-tone' | 'dull-ring' | 'rattle' | 'cracked-bell'

export interface BellTone {
  file: string
  resonance: number
  clarity: number
  ringQuality: number
  tonePurity: number
  sustain: number
  volumeBalance: number
  resonant: ResonantMeasure
  clear: ClearMeasure
  ringing: RingingMeasure
  pure: PureMeasure
  sustaining: SustainingMeasure
  balanced: BalancedMeasure
  condition: BellCondition
  qualityScore: number
}

export type ChoirType = 'cathedral-bells' | 'bell-tower' | 'carillon' | 'handbell-choir' | 'tin-cans' | 'silence'
export type ChoirCondition = 'magnificent-peal' | 'harmonious-ringing' | 'pleasant-chiming' | 'discordant-ringing' | 'clanking' | 'silent'

export interface BellChoir {
  directory: string
  tones: BellTone[]
  avgResonance: number
  avgClarity: number
  avgQuality: number
  silverChimeCount: number
  crackedBellCount: number
  clearBellCount: number
  pleasantToneCount: number
  choirType: ChoirType
  condition: ChoirCondition
}

export interface Cathedral {
  avgResonance: number
  avgClarity: number
  avgQuality: number
  isResonant: boolean
  overallResonance: number
}

export type BellmasterGrade = 'master-bellmaker' | 'expert-ringer' | 'skilled-campanologist' | 'bell-ringer' | 'novice-chimer' | 'tone-deaf'

export interface SilverBellStats {
  totalFiles: number
  totalChoirs: number
  avgResonance: number
  avgClarity: number
  avgRingQuality: number
  avgTonePurity: number
  avgSustain: number
  avgVolumeBalance: number
  silverChimeCount: number
  clearBellCount: number
  pleasantToneCount: number
  dullRingCount: number
  rattleCount: number
  crackedBellCount: number
  hasHighImpactCount: number
  hasHighReadabilityCount: number
  hasHighQualityCount: number
  hasHighCorrectnessCount: number
  hasHighLastingValueCount: number
  hasHighProportionCount: number
  overallResonance: number
  bellmasterGrade: BellmasterGrade
  bestTone: string
  mostResonant: string
  clearest: string
  bestQuality: string
  purest: string
  mostLasting: string
}

export interface SilverBellResult {
  tones: BellTone[]
  choirs: BellChoir[]
  cathedral: Cathedral
  stats: SilverBellStats
  recommendations: string[]
}

// ─── Measure Functions ─────────────────────────────────────────────────────

/** @example measureResonant(content) evaluates code impact */
export function measureResonant(content: string): ResonantMeasure {
  const hasExport = /export\s/.test(content)
  const hasAsync = /async\s/.test(content)
  const hasPromise = /Promise/.test(content)
  const hasClass = /\bclass\s+\w+/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasImport = /import\s+/.test(content)
  const hasGeneric = /<\w+>/.test(content)
  const hasDefaultExport = /export\s+default\s/.test(content)

  const isolationMatches = content.match(/\bconsole\.\w+\s*\(/g)
  const isolationCount = isolationMatches ? isolationMatches.length : 0
  const deadeningMatches = content.match(/\bprocess\.exit\b/g)
  const deadeningCount = deadeningMatches ? deadeningMatches.length : 0

  const hasFarReaching = hasExport && hasImport
  const hasInfluential = hasClass || hasInterface
  const hasAmplifying = hasAsync && hasPromise
  const hasEchoing = hasGeneric && hasExport
  const hasCarrying = hasDefaultExport || (hasExport && hasAsync)

  let impact = 0
  if (hasExport) impact += 15
  if (hasAsync) impact += 10
  if (hasPromise) impact += 8
  if (hasClass) impact += 10
  if (hasInterface) impact += 8
  if (hasImport) impact += 10
  if (hasGeneric) impact += 8
  if (hasDefaultExport) impact += 5
  if (hasFarReaching) impact += 5
  if (hasInfluential) impact += 5
  if (hasAmplifying) impact += 5
  if (hasEchoing) impact += 5
  if (hasCarrying) impact += 5

  impact = Math.min(100, Math.round(impact))

  let ring: ResonantMeasure['ring'] = 'silent'
  if (impact >= 85) ring = 'thunderous-peal'
  else if (impact >= 70) ring = 'clear-chime'
  else if (impact >= 55) ring = 'pleasant-ring'
  else if (impact >= 40) ring = 'dull-thud'
  else if (impact >= 25) ring = 'muffled-clank'

  return {
    impact,
    ring,
    hasHighImpact: impact >= 70,
    hasFarReaching,
    hasInfluential,
    hasNoIsolation: isolationCount === 0,
    hasAmplifying,
    hasNoDeadening: deadeningCount === 0,
    hasEchoing,
    hasNoAbsorbing: deadeningCount === 0,
    hasCarrying,
    hasNoMuffling: isolationCount === 0,
    isolationCount,
    deadeningCount,
  }
}

/** @example measureClear(content) evaluates code readability */
export function measureClear(content: string): ClearMeasure {
  const hasTypeAnnotation = /:\s*(?:string|number|boolean|void)\b/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasDescriptiveNames = /\b(?:get|set|is|has|can|should|will|create|update|delete|find)\w+/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasAsyncAwait = /async\s+/.test(content) && /await\s+/.test(content)
  const hasDocComments = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasNamedParams = /\(\s*\w+\s*:\s*\w+/.test(content)

  const obfuscationMatches = content.match(/\bany\b/g)
  const obfuscationCount = obfuscationMatches ? obfuscationMatches.length : 0
  const confusionMatches = content.match(/\bTODO\b|\bFIXME\b|\bHACK\b/g)
  const confusionCount = confusionMatches ? confusionMatches.length : 0

  const hasReadable = hasConst && hasTypeAnnotation
  const hasObvious = hasDescriptiveNames
  const hasTransparent = hasReturnType && hasTypeAnnotation
  const hasSelfExplanatory = hasDescriptiveNames && hasConst
  const hasLuminous = hasDocComments && hasTypeAnnotation

  let readability = 0
  if (hasTypeAnnotation) readability += 12
  if (hasReturnType) readability += 10
  if (hasInterface) readability += 8
  if (hasDescriptiveNames) readability += 10
  if (hasConst) readability += 8
  if (hasAsyncAwait) readability += 7
  if (hasDocComments) readability += 10
  if (hasNamedParams) readability += 8
  if (hasReadable) readability += 5
  if (hasObvious) readability += 5
  if (hasTransparent) readability += 5
  if (hasLuminous) readability += 7

  readability = Math.min(100, Math.round(readability))

  let tone: ClearMeasure['tone'] = 'opaque'
  if (readability >= 85) tone = 'crystal-clear'
  else if (readability >= 70) tone = 'bright-tone'
  else if (readability >= 55) tone = 'clear-note'
  else if (readability >= 40) tone = 'slightly-cloudy'
  else if (readability >= 25) tone = 'muddy'

  return {
    readability,
    tone,
    hasHighReadability: readability >= 70,
    hasReadable,
    hasObvious,
    hasNoObfuscation: obfuscationCount === 0,
    hasTransparent,
    hasNoHiding: obfuscationCount === 0,
    hasSelfExplanatory,
    hasNoConfusion: confusionCount === 0,
    hasLuminous,
    hasNoMystery: obfuscationCount === 0 && confusionCount === 0,
    obfuscationCount,
    confusionCount,
  }
}

/** @example measureRinging(content) evaluates code execution quality */
export function measureRinging(content: string): RingingMeasure {
  const hasConst = /\bconst\s+/.test(content)
  const hasArrowFunctions = /=>/.test(content)
  const hasOptionalChaining = /\?\.\w/.test(content)
  const hasNullishCoalescing = /\?\?/.test(content)
  const hasDestructuring = /(?:const|let)\s*\{/.test(content) || /(?:const|let)\s*\[/.test(content)
  const hasTemplateLiterals = /`[^`]*\$\{/.test(content)
  const hasAsyncAwait = /async\s+/.test(content) && /await\s+/.test(content)
  const hasTryCatch = /try\s*\{/.test(content) && /catch\s*\(/.test(content)
  const hasEarlyReturn = /\breturn\s+\w+/.test(content)

  const wasteMatches = content.match(/\bconsole\.\w+\s*\(/g)
  const wasteCount = wasteMatches ? wasteMatches.length : 0
  const sloppinessMatches = content.match(/\bvar\s+/g)
  const sloppinessCount = sloppinessMatches ? sloppinessMatches.length : 0

  const hasEfficient = hasConst && hasArrowFunctions
  const hasPrecise = hasOptionalChaining || hasNullishCoalescing
  const hasOptimal = hasDestructuring && hasTemplateLiterals
  const hasClean = hasAsyncAwait && hasTryCatch
  const hasPolished = hasEarlyReturn && hasConst

  let quality = 0
  if (hasConst) quality += 10
  if (hasArrowFunctions) quality += 10
  if (hasOptionalChaining) quality += 8
  if (hasNullishCoalescing) quality += 7
  if (hasDestructuring) quality += 8
  if (hasTemplateLiterals) quality += 7
  if (hasAsyncAwait) quality += 8
  if (hasTryCatch) quality += 8
  if (hasEarlyReturn) quality += 7
  if (hasEfficient) quality += 5
  if (hasPrecise) quality += 5
  if (hasOptimal) quality += 5
  if (hasClean) quality += 5
  if (hasPolished) quality += 5

  quality = Math.min(100, Math.round(quality))

  let strike: RingingMeasure['strike'] = 'cacophony'
  if (quality >= 85) strike = 'perfect-strike'
  else if (quality >= 70) strike = 'clean-ring'
  else if (quality >= 55) strike = 'proper-tone'
  else if (quality >= 40) strike = 'off-key'
  else if (quality >= 25) strike = 'dissonant'

  return {
    quality,
    strike,
    hasHighQuality: quality >= 70,
    hasEfficient,
    hasPrecise,
    hasNoWaste: wasteCount === 0,
    hasOptimal,
    hasNoRedundancy: wasteCount === 0,
    hasClean,
    hasNoSloppiness: sloppinessCount === 0,
    hasPolished,
    hasNoRoughness: sloppinessCount === 0,
    wasteCount,
    sloppinessCount,
  }
}

/** @example measurePure(content) evaluates code correctness */
export function measurePure(content: string): PureMeasure {
  const hasTypeAnnotation = /:\s*(?:string|number|boolean|void)\b/.test(content)
  const hasStrictTypes = /:\s*(?:string|number|boolean|void|never)\b/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasTypeAlias = /\btype\s+\w+/.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasNullCheck = /\?\.\w/.test(content) || /\?\?/.test(content)
  const hasErrorHandling = /try\s*\{/.test(content) || /throw\s+/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)

  const hackMatches = content.match(/\bany\b/g)
  const hackCount = hackMatches ? hackMatches.length : 0
  const workaroundMatches = content.match(/@ts-ignore|@ts-expect-error|eslint-disable/g)
  const workaroundCount = workaroundMatches ? workaroundMatches.length : 0

  const hasTypeSafe = hasTypeAnnotation && hasStrictTypes
  const hasProper = hasInterface && hasTypeAnnotation
  const hasCorrect = hasNullCheck && hasErrorHandling
  const hasSound = hasGenerics && hasReadonly
  const hasValid = hasTypeAnnotation && hasInterface

  let correctness = 0
  if (hasTypeAnnotation) correctness += 12
  if (hasStrictTypes) correctness += 8
  if (hasInterface) correctness += 10
  if (hasTypeAlias) correctness += 8
  if (hasGenerics) correctness += 8
  if (hasNullCheck) correctness += 10
  if (hasErrorHandling) correctness += 10
  if (hasReadonly) correctness += 7
  if (hasTypeSafe) correctness += 5
  if (hasProper) correctness += 5
  if (hasCorrect) correctness += 5
  if (hasSound) correctness += 5

  correctness = Math.min(100, Math.round(correctness))

  let tone: PureMeasure['tone'] = 'atonal'
  if (correctness >= 85) tone = 'pure-tone'
  else if (correctness >= 70) tone = 'harmonic'
  else if (correctness >= 55) tone = 'clean-note'
  else if (correctness >= 40) tone = 'slightly-off'
  else if (correctness >= 25) tone = 'dissonant'

  return {
    correctness,
    tone,
    hasHighCorrectness: correctness >= 70,
    hasTypeSafe,
    hasNoHacks: hackCount === 0,
    hasProper,
    hasNoWorkarounds: workaroundCount === 0,
    hasCorrect,
    hasNoBugs: hackCount === 0 && workaroundCount === 0,
    hasSound,
    hasNoShortcuts: hackCount === 0,
    hasValid,
    hackCount,
    workaroundCount,
  }
}

/** @example measureSustaining(content) evaluates code lasting value */
export function measureSustaining(content: string): SustainingMeasure {
  const hasExport = /export\s/.test(content)
  const hasClass = /\bclass\s+\w+/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasTypeAlias = /\btype\s+\w+/.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasDocComments = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasTestPatterns = /describe\s*\(|it\s*\(|test\s*\(/.test(content)

  const disposableMatches = content.match(/\bTODO\b|\bFIXME\b/g)
  const disposableCount = disposableMatches ? disposableMatches.length : 0
  const fragileMatches = content.match(/\bany\b/g)
  const fragileCount = fragileMatches ? fragileMatches.length : 0

  const hasTimeless = hasExport && hasDocComments
  const hasReusable = hasExport && (hasInterface || hasTypeAlias)
  const hasDurable = hasReadonly && hasClass
  const hasEnduring = hasGenerics && hasExport
  const hasStable = hasClass && hasInterface

  let lastingValue = 0
  if (hasExport) lastingValue += 12
  if (hasClass) lastingValue += 10
  if (hasInterface) lastingValue += 10
  if (hasTypeAlias) lastingValue += 8
  if (hasGenerics) lastingValue += 8
  if (hasDocComments) lastingValue += 10
  if (hasReadonly) lastingValue += 7
  if (hasTestPatterns) lastingValue += 5
  if (hasTimeless) lastingValue += 5
  if (hasReusable) lastingValue += 5
  if (hasDurable) lastingValue += 5
  if (hasEnduring) lastingValue += 5
  if (hasStable) lastingValue += 5

  lastingValue = Math.min(100, Math.round(lastingValue))

  let duration: SustainingMeasure['duration'] = 'immediate-silence'
  if (lastingValue >= 85) duration = 'eternal-ring'
  else if (lastingValue >= 70) duration = 'long-sustain'
  else if (lastingValue >= 55) duration = 'proper-decay'
  else if (lastingValue >= 40) duration = 'short-ring'
  else if (lastingValue >= 25) duration = 'quick-fade'

  return {
    lastingValue,
    duration,
    hasHighLastingValue: lastingValue >= 70,
    hasTimeless,
    hasReusable,
    hasNoDisposable: disposableCount === 0,
    hasDurable,
    hasNoFragile: fragileCount === 0,
    hasEnduring,
    hasNoTemporary: disposableCount === 0,
    hasStable,
    hasNoVolatile: fragileCount === 0,
    disposableCount,
    fragileCount,
  }
}

/** @example measureBalanced(content) evaluates code proportion */
export function measureBalanced(content: string): BalancedMeasure {
  const lines = content.split('\n')
  const nonEmptyLines = lines.filter((l) => l.trim().length > 0)
  const totalLines = nonEmptyLines.length

  const hasImports = /import\s+/.test(content)
  const hasExports = /export\s/.test(content)
  const hasFunctions = /\bfunction\s+\w+/.test(content) || /=>\s*{/.test(content)
  const hasClasses = /\bclass\s+\w+/.test(content)
  const hasTypes = /\b(?:interface|type)\s+\w+/.test(content)
  const hasComments = /\/\//.test(content) || /\/\*/.test(content)

  const overweightMatches = content.match(/\bfunction\s+\w+\([^)]{80,}\)/g)
  const overweightCount = overweightMatches ? overweightMatches.length : 0
  const bloatMatches = totalLines > 300 ? [1] : []
  const bloatCount = bloatMatches.length

  const hasProportioned = hasImports && hasExports
  const hasBalanced = hasFunctions && hasTypes
  const hasEven = totalLines > 0 && totalLines <= 200
  const hasRightSized = totalLines > 0 && totalLines <= 300
  const hasMeasured = hasComments && hasFunctions

  let proportion = 0
  if (hasImports) proportion += 10
  if (hasExports) proportion += 10
  if (hasFunctions) proportion += 10
  if (hasClasses) proportion += 8
  if (hasTypes) proportion += 10
  if (hasComments) proportion += 7
  if (hasProportioned) proportion += 8
  if (hasBalanced) proportion += 8
  if (hasEven) proportion += 8
  if (hasRightSized) proportion += 5
  if (hasMeasured) proportion += 5

  proportion = Math.min(100, Math.round(proportion))

  let harmony: BalancedMeasure['harmony'] = 'chaotic'
  if (proportion >= 85) harmony = 'perfect-harmony'
  else if (proportion >= 70) harmony = 'well-balanced'
  else if (proportion >= 55) harmony = 'proper-mix'
  else if (proportion >= 40) harmony = 'uneven'
  else if (proportion >= 25) harmony = 'unbalanced'

  return {
    proportion,
    harmony,
    hasHighProportion: proportion >= 70,
    hasProportioned,
    hasBalanced,
    hasNoOverweight: overweightCount === 0,
    hasEven,
    hasNoBloat: bloatCount === 0,
    hasRightSized,
    hasNoGiant: bloatCount === 0,
    hasMeasured,
    hasNoExcess: overweightCount === 0,
    overweightCount,
    bloatCount,
  }
}

// ─── Classification Functions ──────────────────────────────────────────────

/** @example classifyCondition(85) returns 'silver-chime' */
export function classifyCondition(score: number): BellCondition {
  if (score >= 85) return 'silver-chime'
  if (score >= 70) return 'clear-bell'
  if (score >= 55) return 'pleasant-tone'
  if (score >= 40) return 'dull-ring'
  if (score >= 25) return 'rattle'
  return 'cracked-bell'
}

/** @example classifyChoirType(tones) returns choir classification */
export function classifyChoirType(tones: BellTone[]): ChoirType {
  if (tones.length === 0) return 'silence'
  const avgQs = tones.reduce((s, t) => s + t.qualityScore, 0) / tones.length
  const silverCount = tones.filter((t) => t.condition === 'silver-chime').length
  const ratio = silverCount / tones.length
  if (avgQs >= 75 && ratio >= 0.5) return 'cathedral-bells'
  if (avgQs >= 60) return 'bell-tower'
  if (avgQs >= 45) return 'carillon'
  if (avgQs >= 30) return 'handbell-choir'
  if (avgQs >= 15) return 'tin-cans'
  return 'silence'
}

/** @example classifyChoirCondition(avgQs) returns choir condition */
export function classifyChoirCondition(avgQs: number): ChoirCondition {
  if (avgQs >= 75) return 'magnificent-peal'
  if (avgQs >= 60) return 'harmonious-ringing'
  if (avgQs >= 45) return 'pleasant-chiming'
  if (avgQs >= 30) return 'discordant-ringing'
  if (avgQs >= 15) return 'clanking'
  return 'silent'
}

/** @example classifyBellmasterGrade(80) returns 'master-bellmaker' */
export function classifyBellmasterGrade(avgResonance: number): BellmasterGrade {
  if (avgResonance >= 80) return 'master-bellmaker'
  if (avgResonance >= 65) return 'expert-ringer'
  if (avgResonance >= 50) return 'skilled-campanologist'
  if (avgResonance >= 35) return 'bell-ringer'
  if (avgResonance >= 20) return 'novice-chimer'
  return 'tone-deaf'
}

// ─── Orchestrator Functions ────────────────────────────────────────────────

/** @example analyzeBellTone(content, filePath) evaluates single file */
export function analyzeBellTone(content: string, filePath: string): BellTone {
  const resonant = measureResonant(content)
  const clear = measureClear(content)
  const ringing = measureRinging(content)
  const pure = measurePure(content)
  const sustaining = measureSustaining(content)
  const balanced = measureBalanced(content)

  const qualityScore = Math.round(
    resonant.impact * 0.2 +
    clear.readability * 0.2 +
    ringing.quality * 0.15 +
    pure.correctness * 0.15 +
    sustaining.lastingValue * 0.15 +
    balanced.proportion * 0.15,
  )

  return {
    file: filePath,
    resonance: resonant.impact,
    clarity: clear.readability,
    ringQuality: ringing.quality,
    tonePurity: pure.correctness,
    sustain: sustaining.lastingValue,
    volumeBalance: balanced.proportion,
    resonant,
    clear,
    ringing,
    pure,
    sustaining,
    balanced,
    condition: classifyCondition(qualityScore),
    qualityScore,
  }
}

/** @example analyzeBellChoir(tones, dirPath) evaluates directory */
export function analyzeBellChoir(tones: BellTone[], dirPath: string): BellChoir {
  if (tones.length === 0) {
    return {
      directory: dirPath,
      tones: [],
      avgResonance: 0,
      avgClarity: 0,
      avgQuality: 0,
      silverChimeCount: 0,
      crackedBellCount: 0,
      clearBellCount: 0,
      pleasantToneCount: 0,
      choirType: 'silence',
      condition: 'silent',
    }
  }

  const avgResonance = Math.round(tones.reduce((s, t) => s + t.resonance, 0) / tones.length)
  const avgClarity = Math.round(tones.reduce((s, t) => s + t.clarity, 0) / tones.length)
  const avgQuality = Math.round(tones.reduce((s, t) => s + t.qualityScore, 0) / tones.length)

  const silverChimeCount = tones.filter((t) => t.condition === 'silver-chime').length
  const crackedBellCount = tones.filter((t) => t.condition === 'cracked-bell').length
  const clearBellCount = tones.filter((t) => t.condition === 'clear-bell').length
  const pleasantToneCount = tones.filter((t) => t.condition === 'pleasant-tone').length

  const avgQs = tones.reduce((s, t) => s + t.qualityScore, 0) / tones.length

  return {
    directory: dirPath,
    tones,
    avgResonance,
    avgClarity,
    avgQuality,
    silverChimeCount,
    crackedBellCount,
    clearBellCount,
    pleasantToneCount,
    choirType: classifyChoirType(tones),
    condition: classifyChoirCondition(avgQs),
  }
}

/** @example generateRecommendations(tones, choirs, cathedral, stats) generates advice */
export function generateRecommendations(
  tones: BellTone[],
  choirs: BellChoir[],
  cathedral: Cathedral,
  stats: SilverBellStats,
): string[] {
  const recs: string[] = []

  if (stats.avgResonance < 50) {
    recs.push('Add more exports, async patterns, and imports to increase code resonance and impact')
  }
  if (stats.avgClarity < 50) {
    recs.push('Improve readability with type annotations, descriptive names, and documentation')
  }
  if (stats.avgRingQuality < 50) {
    recs.push('Modernize code with const, arrow functions, optional chaining, and destructuring for better ring quality')
  }
  if (stats.avgTonePurity < 50) {
    recs.push('Strengthen type safety with interfaces, generics, and proper error handling for purer tone')
  }
  if (stats.avgSustain < 50) {
    recs.push('Add documentation, exports, and stable abstractions to improve code sustain')
  }
  if (stats.avgVolumeBalance < 50) {
    recs.push('Balance imports, exports, functions, and types for better volume balance')
  }
  if (stats.crackedBellCount > 0) {
    recs.push(`${String(stats.crackedBellCount)} file(s) are cracked bells — consider refactoring or documenting them`)
  }
  if (cathedral.overallResonance < 40) {
    recs.push('Overall resonance is low — focus on improving code impact and clarity')
  }
  if (choirs.length > 0 && choirs.every((c) => c.choirType === 'silence' || c.choirType === 'tin-cans')) {
    recs.push('All choirs are silent or tin-cans — consider a comprehensive code quality effort')
  }

  const cracked = tones.filter((t) => t.condition === 'cracked-bell')
  if (cracked.length > 0 && cracked.length <= 3) {
    const names = cracked.map((t) => t.file).join(', ')
    recs.push(`Focus on repairing these cracked bells: ${names}`)
  }

  if (recs.length === 0) {
    recs.push('Your silver bells ring beautifully! Keep maintaining your code quality')
  }

  return Array.from(new Set(recs))
}

/** @example buildSilverBellResult(files, contents, options) orchestrates analysis */
export function buildSilverBellResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): SilverBellResult {
  const tones = files.map((file, i) => analyzeBellTone(contents[i] ?? '', file))

  const choirMap = new Map<string, BellTone[]>()
  for (const tone of tones) {
    const dir = tone.file.includes('/') ? tone.file.split('/').slice(0, -1).join('/') : '.'
    const existing = choirMap.get(dir)
    if (existing) {
      existing.push(tone)
    } else {
      choirMap.set(dir, [tone])
    }
  }

  const choirs = Array.from(choirMap.entries()).map(([dir, dirTones]) =>
    analyzeBellChoir(dirTones, dir),
  )

  const totalFiles = tones.length
  const avgResonance = totalFiles > 0 ? Math.round(tones.reduce((s, t) => s + t.resonance, 0) / totalFiles) : 0
  const avgClarity = totalFiles > 0 ? Math.round(tones.reduce((s, t) => s + t.clarity, 0) / totalFiles) : 0
  const avgRingQuality = totalFiles > 0 ? Math.round(tones.reduce((s, t) => s + t.ringQuality, 0) / totalFiles) : 0
  const avgTonePurity = totalFiles > 0 ? Math.round(tones.reduce((s, t) => s + t.tonePurity, 0) / totalFiles) : 0
  const avgSustain = totalFiles > 0 ? Math.round(tones.reduce((s, t) => s + t.sustain, 0) / totalFiles) : 0
  const avgVolumeBalance = totalFiles > 0 ? Math.round(tones.reduce((s, t) => s + t.volumeBalance, 0) / totalFiles) : 0

  const overallResonance = totalFiles > 0
    ? Math.round((avgResonance + avgClarity + avgRingQuality + avgTonePurity + avgSustain + avgVolumeBalance) / 6)
    : 0

  const avgQuality = totalFiles > 0
    ? Math.round(tones.reduce((s, t) => s + t.qualityScore, 0) / totalFiles)
    : 0

  const cathedral: Cathedral = {
    avgResonance,
    avgClarity,
    avgQuality,
    isResonant: avgResonance >= 60,
    overallResonance,
  }

  const silverChimeCount = tones.filter((t) => t.condition === 'silver-chime').length
  const clearBellCount = tones.filter((t) => t.condition === 'clear-bell').length
  const pleasantToneCount = tones.filter((t) => t.condition === 'pleasant-tone').length
  const dullRingCount = tones.filter((t) => t.condition === 'dull-ring').length
  const rattleCount = tones.filter((t) => t.condition === 'rattle').length
  const crackedBellCount = tones.filter((t) => t.condition === 'cracked-bell').length

  const bestTone = totalFiles > 0
    ? tones.reduce((best, t) => (t.qualityScore > best.qualityScore ? t : best), tones[0]).file
    : ''
  const mostResonant = totalFiles > 0
    ? tones.reduce((best, t) => (t.resonance > best.resonance ? t : best), tones[0]).file
    : ''
  const clearest = totalFiles > 0
    ? tones.reduce((best, t) => (t.clarity > best.clarity ? t : best), tones[0]).file
    : ''
  const bestQuality = totalFiles > 0
    ? tones.reduce((best, t) => (t.ringQuality > best.ringQuality ? t : best), tones[0]).file
    : ''
  const purest = totalFiles > 0
    ? tones.reduce((best, t) => (t.tonePurity > best.tonePurity ? t : best), tones[0]).file
    : ''
  const mostLasting = totalFiles > 0
    ? tones.reduce((best, t) => (t.sustain > best.sustain ? t : best), tones[0]).file
    : ''

  const stats: SilverBellStats = {
    totalFiles,
    totalChoirs: choirs.length,
    avgResonance,
    avgClarity,
    avgRingQuality,
    avgTonePurity,
    avgSustain,
    avgVolumeBalance,
    silverChimeCount,
    clearBellCount,
    pleasantToneCount,
    dullRingCount,
    rattleCount,
    crackedBellCount,
    hasHighImpactCount: tones.filter((t) => t.resonant.hasHighImpact).length,
    hasHighReadabilityCount: tones.filter((t) => t.clear.hasHighReadability).length,
    hasHighQualityCount: tones.filter((t) => t.ringing.hasHighQuality).length,
    hasHighCorrectnessCount: tones.filter((t) => t.pure.hasHighCorrectness).length,
    hasHighLastingValueCount: tones.filter((t) => t.sustaining.hasHighLastingValue).length,
    hasHighProportionCount: tones.filter((t) => t.balanced.hasHighProportion).length,
    overallResonance,
    bellmasterGrade: classifyBellmasterGrade(overallResonance),
    bestTone,
    mostResonant,
    clearest,
    bestQuality,
    purest,
    mostLasting,
  }

  const recommendations = generateRecommendations(tones, choirs, cathedral, stats)

  return { tones, choirs, cathedral, stats, recommendations }
}
