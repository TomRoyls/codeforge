// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface ArterialMeasure {
  strength: number
  condition: 'artery-of-steel' | 'strong-artery' | 'healthy-vessel' | 'narrowing' | 'blocked' | 'ruptured'
  hasHighStrength: boolean
  hasProperFlow: boolean
  hasNoBlockage: boolean
  hasElastic: boolean
  hasNoCalcification: boolean
  hasResilient: boolean
  hasNoAneurysm: boolean
  hasStrongWalls: boolean
  hasNoLeakage: boolean
  hasProperPressure: boolean
  blockageCount: number
  leakageCount: number
}

export interface PulseMeasure {
  quality: number
  rhythm: 'athletes-pulse' | 'strong-steady' | 'healthy-rhythm' | 'irregular' | 'weak-pulse' | 'flatline'
  hasHighQuality: boolean
  hasSteadyRhythm: boolean
  hasProperTempo: boolean
  hasNoArrhythmia: boolean
  hasConsistent: boolean
  hasNoSkipping: boolean
  hasProperBeat: boolean
  hasNoFlutter: boolean
  hasReliable: boolean
  hasNoStalling: boolean
  arrhythmiaCount: number
  flutterCount: number
}

export interface CirculationMeasure {
  efficiency: number
  flow: 'optimal-circulation' | 'efficient-flow' | 'good-circulation' | 'sluggish' | 'stagnant' | 'clotted'
  hasHighEfficiency: boolean
  hasSmoothFlow: boolean
  hasNoBottleneck: boolean
  hasProperDistribution: boolean
  hasNoPooling: boolean
  hasEfficient: boolean
  hasNoDeadEnds: boolean
  hasProperReturn: boolean
  hasNoLeakage: boolean
  hasComplete: boolean
  bottleneckCount: number
  deadEndCount: number
}

export interface OxygenMeasure {
  delivery: number
  saturation: 'fully-saturated' | 'high-oxygen' | 'adequate' | 'low-saturation' | 'hypoxic' | 'asphyxiated'
  hasHighDelivery: boolean
  hasClearDocs: boolean
  hasProperNourishment: boolean
  hasNoStarvation: boolean
  hasInformative: boolean
  hasNoDeprivation: boolean
  hasRichContent: boolean
  hasNoDeficiency: boolean
  hasExamples: boolean
  hasNoBlindSpots: boolean
  starvationCount: number
  deficiencyCount: number
}

export interface ImmuneMeasure {
  response: number
  strength: 'robust-immunity' | 'strong-defense' | 'proper-response' | 'weak-immunity' | 'compromised' | 'no-defense'
  hasHighResponse: boolean
  hasProperDefenses: boolean
  hasErrorDetection: boolean
  hasNoInfection: boolean
  hasQuickResponse: boolean
  hasNoAutoimmune: boolean
  hasRecoveryMechanism: boolean
  hasNoSilentFailure: boolean
  hasValidation: boolean
  hasNoVulnerability: boolean
  infectionCount: number
  silentFailureCount: number
}

export interface LifeMeasure {
  force: number
  vitality: 'radiant-health' | 'vibrant' | 'healthy' | 'ailing' | 'critical' | 'lifeless'
  hasHighForce: boolean
  hasThriving: boolean
  hasNoDegeneration: boolean
  hasEnergetic: boolean
  hasNoFatigue: boolean
  hasRenewable: boolean
  hasNoExhaustion: boolean
  hasSustainable: boolean
  hasNoCollapse: boolean
  hasVital: boolean
  degenerationCount: number
  fatigueCount: number
}

export interface BloodVessel {
  file: string
  arterialStrength: number
  pulseQuality: number
  circulationEfficiency: number
  oxygenDelivery: number
  immuneResponse: number
  lifeForce: number
  arterial: ArterialMeasure
  pulse: PulseMeasure
  circulation: CirculationMeasure
  oxygen: OxygenMeasure
  immune: ImmuneMeasure
  life: LifeMeasure
  condition: 'life-blood' | 'vital-thread' | 'healthy-flow' | 'fading-pulse' | 'critical-condition' | 'lifeless'
  qualityScore: number
}

export interface CirculatorySystem {
  directory: string
  vessels: BloodVessel[]
  avgArterial: number
  avgCirculation: number
  avgLifeForce: number
  lifeBloodCount: number
  lifelessCount: number
  strongCount: number
  efficientCount: number
  systemType: 'cardiovascular-masterpiece' | 'healthy-system' | 'functioning-system' | 'struggling-system' | 'failing-system' | 'flatline'
  condition: 'peak-vitality' | 'healthy-organism' | 'stable-organism' | 'weakened' | 'critical' | 'deceased'
}

export interface CrimsonThreadResult {
  vessels: BloodVessel[]
  systems: CirculatorySystem[]
  organism: {
    avgArterial: number
    avgCirculation: number
    avgLifeForce: number
    isVital: boolean
    overallVitality: number
  }
  stats: {
    totalFiles: number
    totalSystems: number
    avgArterialStrength: number
    avgPulseQuality: number
    avgCirculationEfficiency: number
    avgOxygenDelivery: number
    avgImmuneResponse: number
    avgLifeForce: number
    lifeBloodCount: number
    vitalThreadCount: number
    healthyFlowCount: number
    fadingPulseCount: number
    criticalConditionCount: number
    lifelessCount: number
    hasHighStrengthCount: number
    hasHighQualityCount: number
    hasHighEfficiencyCount: number
    hasHighDeliveryCount: number
    hasHighResponseCount: number
    hasHighForceCount: number
    overallVitality: number
    physicianGrade: 'surgeon-general' | 'cardiologist' | 'physician' | 'medic' | 'intern' | 'quack'
    bestVessel: string
    strongest: string
    bestRhythm: string
    mostEfficient: string
    bestDocumented: string
    bestDefended: string
  }
  recommendations: string[]
}

// ─── measureArterial ────────────────────────────────────────────────────────

/** @example measureArterial(content) returns ArterialMeasure */
export function measureArterial(content: string): ArterialMeasure {
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

  const blockageCount = hasContent ? (/\bany\b/.test(content) ? 1 : 0) + (/\beval\s*\(/.test(content) ? 1 : 0) : 0
  const leakageCount = hasContent ? (/\bconsole\.log\s*\(/.test(content) ? 1 : 0) + (/\bdebugger\b/.test(content) ? 1 : 0) : 0

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
  score -= blockageCount * 3
  score -= leakageCount * 2

  const strength = Math.max(0, Math.min(100, Math.round(score)))
  const hasHighStrength = strength >= 80
  const hasProperFlow = hasFunctions || hasClasses
  const hasNoBlockage = blockageCount === 0
  const hasElastic = hasGenerics || hasAsync
  const hasNoCalcification = !/\bany\b/.test(content)
  const hasResilient = hasPrivate || hasReadonly
  const hasNoAneurysm = !/\beval\s*\(/.test(content)
  const hasStrongWalls = hasInterfaces || hasTypes
  const hasNoLeakage = leakageCount === 0
  const hasProperPressure = hasContent

  let condition: ArterialMeasure['condition'] = 'ruptured'
  if (strength >= 90) condition = 'artery-of-steel'
  else if (strength >= 75) condition = 'strong-artery'
  else if (strength >= 60) condition = 'healthy-vessel'
  else if (strength >= 45) condition = 'narrowing'
  else if (strength >= 30) condition = 'blocked'

  return { strength, condition, hasHighStrength, hasProperFlow, hasNoBlockage, hasElastic, hasNoCalcification, hasResilient, hasNoAneurysm, hasStrongWalls, hasNoLeakage, hasProperPressure, blockageCount, leakageCount }
}

// ─── measurePulse ────────────────────────────────────────────────────────────

/** @example measurePulse(content) returns PulseMeasure */
export function measurePulse(content: string): PulseMeasure {
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

  const arrhythmiaCount = hasContent ? (hasConsistentQuotes ? 0 : 1) + (hasConsistentSemicolons ? 0 : 1) : 0
  const flutterCount = hasContent ? (hasConsistentIndentation ? 0 : 1) + (hasModules ? 0 : 1) : 0

  let score = 0
  if (hasContent) score += 25
  if (hasConsistentQuotes) score += 8
  if (hasConsistentSemicolons) score += 8
  if (hasExports) score += 8
  if (hasNamedExports) score += 8
  if (hasImports) score += 6
  if (hasConsistentIndentation) score += 8
  if (hasModules) score += 5
  score -= arrhythmiaCount * 4
  score -= flutterCount * 4

  const quality = Math.max(0, Math.min(100, Math.round(score)))
  const hasHighQuality = quality >= 80
  const hasSteadyRhythm = hasConsistentQuotes && hasConsistentSemicolons
  const hasProperTempo = hasConsistentIndentation
  const hasNoArrhythmia = arrhythmiaCount === 0
  const hasConsistent = hasConsistentQuotes && hasConsistentSemicolons && hasConsistentIndentation
  const hasNoSkipping = hasModules
  const hasProperBeat = hasNamedExports && hasImports
  const hasNoFlutter = flutterCount === 0
  const hasReliable = hasConsistentQuotes && hasConsistentIndentation
  const hasNoStalling = arrhythmiaCount === 0 && flutterCount === 0

  let rhythm: PulseMeasure['rhythm'] = 'flatline'
  if (quality >= 90) rhythm = 'athletes-pulse'
  else if (quality >= 75) rhythm = 'strong-steady'
  else if (quality >= 60) rhythm = 'healthy-rhythm'
  else if (quality >= 45) rhythm = 'irregular'
  else if (quality >= 30) rhythm = 'weak-pulse'

  return { quality, rhythm, hasHighQuality, hasSteadyRhythm, hasProperTempo, hasNoArrhythmia, hasConsistent, hasNoSkipping, hasProperBeat, hasNoFlutter, hasReliable, hasNoStalling, arrhythmiaCount, flutterCount }
}

// ─── measureCirculation ──────────────────────────────────────────────────────

/** @example measureCirculation(content) returns CirculationMeasure */
export function measureCirculation(content: string): CirculationMeasure {
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

  const bottleneckCount = hasContent ? (hasErrorHandling ? 0 : 1) + (hasPrivateMembers || hasInterfaces ? 0 : 1) : 0
  const deadEndCount = hasContent ? (hasImports ? 0 : 1) + (hasConfigPatterns || hasDiPatterns ? 0 : 1) : 0

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
  score -= bottleneckCount * 3
  score -= deadEndCount * 3

  const efficiency = Math.max(0, Math.min(100, Math.round(score)))
  const hasHighEfficiency = efficiency >= 80
  const hasSmoothFlow = hasImports && hasInterfaces
  const hasNoBottleneck = bottleneckCount === 0
  const hasProperDistribution = hasNamedImports || hasTypeImports
  const hasNoPooling = hasErrorHandling
  const hasEfficient = hasReExports || hasDiPatterns
  const hasNoDeadEnds = deadEndCount === 0
  const hasProperReturn = hasErrorHandling
  const hasNoLeakage = !/\bany\b/.test(content)
  const hasComplete = hasImports && hasErrorHandling

  let flow: CirculationMeasure['flow'] = 'clotted'
  if (efficiency >= 90) flow = 'optimal-circulation'
  else if (efficiency >= 75) flow = 'efficient-flow'
  else if (efficiency >= 60) flow = 'good-circulation'
  else if (efficiency >= 45) flow = 'sluggish'
  else if (efficiency >= 30) flow = 'stagnant'

  return { efficiency, flow, hasHighEfficiency, hasSmoothFlow, hasNoBottleneck, hasProperDistribution, hasNoPooling, hasEfficient, hasNoDeadEnds, hasProperReturn, hasNoLeakage, hasComplete, bottleneckCount, deadEndCount }
}

// ─── measureOxygen ───────────────────────────────────────────────────────────

/** @example measureOxygen(content) returns OxygenMeasure */
export function measureOxygen(content: string): OxygenMeasure {
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

  const starvationCount = hasContent ? (hasJsDoc ? 0 : 1) + (hasInlineComments ? 0 : 1) : 0
  const deficiencyCount = hasContent ? (hasTypeAnnotations ? 0 : 1) + (hasInterfaces || hasTypes ? 0 : 1) : 0

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
  score -= starvationCount * 3
  score -= deficiencyCount * 2

  const delivery = Math.max(0, Math.min(100, Math.round(score)))
  const hasHighDelivery = delivery >= 80
  const hasClearDocs = hasJsDoc || hasInlineComments
  const hasProperNourishment = hasJsDoc
  const hasNoStarvation = starvationCount === 0
  const hasInformative = hasDescriptiveNames
  const hasNoDeprivation = deficiencyCount === 0
  const hasRichContent = hasJsDoc && hasTypeAnnotations
  const hasNoDeficiency = deficiencyCount === 0
  const hasExamples = hasJsDoc && /@example/.test(content)
  const hasNoBlindSpots = starvationCount === 0 && deficiencyCount === 0

  let saturation: OxygenMeasure['saturation'] = 'asphyxiated'
  if (delivery >= 90) saturation = 'fully-saturated'
  else if (delivery >= 75) saturation = 'high-oxygen'
  else if (delivery >= 60) saturation = 'adequate'
  else if (delivery >= 45) saturation = 'low-saturation'
  else if (delivery >= 30) saturation = 'hypoxic'

  return { delivery, saturation, hasHighDelivery, hasClearDocs, hasProperNourishment, hasNoStarvation, hasInformative, hasNoDeprivation, hasRichContent, hasNoDeficiency, hasExamples, hasNoBlindSpots, starvationCount, deficiencyCount }
}

// ─── measureImmune ───────────────────────────────────────────────────────────

/** @example measureImmune(content) returns ImmuneMeasure */
export function measureImmune(content: string): ImmuneMeasure {
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

  const infectionCount = hasContent ? (hasTryCatch ? 0 : 1) + (hasAsync && !hasTryCatch ? 1 : 0) : 0
  const silentFailureCount = hasContent ? (/\bany\b/.test(content) ? 1 : 0) + (!hasErrorTypes && hasContent ? 1 : 0) : 0

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
  score -= infectionCount * 3
  score -= silentFailureCount * 3

  const response = Math.max(0, Math.min(100, Math.round(score)))
  const hasHighResponse = response >= 80
  const hasProperDefenses = hasTryCatch
  const hasErrorDetection = hasErrorTypes
  const hasNoInfection = infectionCount === 0
  const hasQuickResponse = hasFinally || hasCleanup
  const hasNoAutoimmune = !/\bany\b/.test(content)
  const hasRecoveryMechanism = hasNullishCoalescing || hasFallbackValues
  const hasNoSilentFailure = silentFailureCount === 0
  const hasValidation = hasOptionalChaining || hasDefaultParams
  const hasNoVulnerability = infectionCount === 0 && silentFailureCount === 0

  let immuneStrength: ImmuneMeasure['strength'] = 'no-defense'
  if (response >= 90) immuneStrength = 'robust-immunity'
  else if (response >= 75) immuneStrength = 'strong-defense'
  else if (response >= 60) immuneStrength = 'proper-response'
  else if (response >= 45) immuneStrength = 'weak-immunity'
  else if (response >= 30) immuneStrength = 'compromised'

  return { response, strength: immuneStrength, hasHighResponse, hasProperDefenses, hasErrorDetection, hasNoInfection, hasQuickResponse, hasNoAutoimmune, hasRecoveryMechanism, hasNoSilentFailure, hasValidation, hasNoVulnerability, infectionCount, silentFailureCount }
}

// ─── measureLife ─────────────────────────────────────────────────────────────

/** @example measureLife(content) returns LifeMeasure */
export function measureLife(content: string): LifeMeasure {
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

  const degenerationCount = hasContent ? (hasDocs ? 0 : 1) + (hasReadonly || hasConst ? 0 : 1) : 0
  const fatigueCount = hasContent ? (hasTryCatch ? 0 : 1) + (/\bany\b/.test(content) ? 1 : 0) : 0

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
  score -= degenerationCount * 3
  score -= fatigueCount * 4

  const force = Math.max(0, Math.min(100, Math.round(score)))
  const hasHighForce = force >= 80
  const hasThriving = hasExports && (hasInterfaces || hasTypes)
  const hasNoDegeneration = degenerationCount === 0
  const hasEnergetic = hasAsync || hasClasses
  const hasNoFatigue = fatigueCount === 0
  const hasRenewable = hasTryCatch || hasDocs
  const hasNoExhaustion = fatigueCount === 0 && degenerationCount === 0
  const hasSustainable = hasReadonly || (hasConst && hasNoLet)
  const hasNoCollapse = fatigueCount === 0
  const hasVital = hasExports && hasDocs

  let vitality: LifeMeasure['vitality'] = 'lifeless'
  if (force >= 90) vitality = 'radiant-health'
  else if (force >= 75) vitality = 'vibrant'
  else if (force >= 60) vitality = 'healthy'
  else if (force >= 45) vitality = 'ailing'
  else if (force >= 30) vitality = 'critical'

  return { force, vitality, hasHighForce, hasThriving, hasNoDegeneration, hasEnergetic, hasNoFatigue, hasRenewable, hasNoExhaustion, hasSustainable, hasNoCollapse, hasVital, degenerationCount, fatigueCount }
}

// ─── analyzeBloodVessel ──────────────────────────────────────────────────────

/** @example analyzeBloodVessel(content, filePath) returns BloodVessel */
export function analyzeBloodVessel(content: string, filePath: string): BloodVessel {
  const arterial = measureArterial(content)
  const pulse = measurePulse(content)
  const circulation = measureCirculation(content)
  const oxygen = measureOxygen(content)
  const immune = measureImmune(content)
  const life = measureLife(content)

  const arterialStrength = arterial.strength
  const pulseQuality = pulse.quality
  const circulationEfficiency = circulation.efficiency
  const oxygenDelivery = oxygen.delivery
  const immuneResponse = immune.response
  const lifeForce = life.force

  const qualityScore = Math.round(
    arterialStrength * 0.2 +
    pulseQuality * 0.15 +
    circulationEfficiency * 0.15 +
    oxygenDelivery * 0.15 +
    immuneResponse * 0.15 +
    lifeForce * 0.2,
  )

  const condition = classifyVesselCondition(qualityScore)

  return {
    file: filePath, arterialStrength, pulseQuality, circulationEfficiency, oxygenDelivery, immuneResponse, lifeForce,
    arterial, pulse, circulation, oxygen, immune, life, condition, qualityScore,
  }
}

// ─── classifyVesselCondition ─────────────────────────────────────────────────

/** @example classifyVesselCondition(vessel) returns condition string */
export function classifyVesselCondition(vessel: BloodVessel): BloodVessel['condition']
export function classifyVesselCondition(score: number): BloodVessel['condition']
export function classifyVesselCondition(arg: BloodVessel | number): BloodVessel['condition'] {
  const qs = typeof arg === 'number' ? arg : arg.qualityScore
  if (qs >= 90) return 'life-blood'
  if (qs >= 75) return 'vital-thread'
  if (qs >= 60) return 'healthy-flow'
  if (qs >= 45) return 'fading-pulse'
  if (qs >= 30) return 'critical-condition'
  return 'lifeless'
}

// ─── classifySystemType ──────────────────────────────────────────────────────

/** @example classifySystemType(vessels) returns system type string */
export function classifySystemType(vessels: BloodVessel[]): CirculatorySystem['systemType'] {
  if (vessels.length === 0) return 'flatline'
  const avg = vessels.reduce((s, v) => s + v.qualityScore, 0) / vessels.length
  const lifeBloods = vessels.filter((v) => v.condition === 'life-blood').length
  const ratio = lifeBloods / vessels.length

  if (avg >= 80 && ratio >= 0.5) return 'cardiovascular-masterpiece'
  if (avg >= 70) return 'healthy-system'
  if (avg >= 55) return 'functioning-system'
  if (avg >= 40) return 'struggling-system'
  if (avg >= 25) return 'failing-system'
  return 'flatline'
}

// ─── analyzeCirculatorySystem ────────────────────────────────────────────────

/** @example analyzeCirculatorySystem(vessels, dirPath) returns CirculatorySystem */
export function analyzeCirculatorySystem(vessels: BloodVessel[], dirPath: string): CirculatorySystem {
  if (vessels.length === 0) {
    return { directory: dirPath, vessels, avgArterial: 0, avgCirculation: 0, avgLifeForce: 0, lifeBloodCount: 0, lifelessCount: 0, strongCount: 0, efficientCount: 0, systemType: 'flatline', condition: 'deceased' }
  }

  const avgArterial = Math.round(vessels.reduce((s, v) => s + v.arterialStrength, 0) / vessels.length)
  const avgCirculation = Math.round(vessels.reduce((s, v) => s + v.circulationEfficiency, 0) / vessels.length)
  const avgLifeForce = Math.round(vessels.reduce((s, v) => s + v.lifeForce, 0) / vessels.length)
  const lifeBloodCount = vessels.filter((v) => v.condition === 'life-blood').length
  const lifelessCount = vessels.filter((v) => v.condition === 'lifeless').length
  const strongCount = vessels.filter((v) => v.arterial.condition === 'artery-of-steel' || v.arterial.condition === 'strong-artery').length
  const efficientCount = vessels.filter((v) => v.circulation.flow === 'optimal-circulation' || v.circulation.flow === 'efficient-flow').length

  const systemType = classifySystemType(vessels)
  const overallAvg = Math.round(vessels.reduce((s, v) => s + v.qualityScore, 0) / vessels.length)

  let condition: CirculatorySystem['condition'] = 'deceased'
  if (overallAvg >= 80) condition = 'peak-vitality'
  else if (overallAvg >= 65) condition = 'healthy-organism'
  else if (overallAvg >= 50) condition = 'stable-organism'
  else if (overallAvg >= 35) condition = 'weakened'
  else if (overallAvg >= 20) condition = 'critical'

  return { directory: dirPath, vessels, avgArterial, avgCirculation, avgLifeForce, lifeBloodCount, lifelessCount, strongCount, efficientCount, systemType, condition }
}

// ─── classifyPhysicianGrade ──────────────────────────────────────────────────

/** @example classifyPhysicianGrade(85) returns 'surgeon-general' */
export function classifyPhysicianGrade(avgVitality: number): CrimsonThreadResult['stats']['physicianGrade'] {
  if (avgVitality >= 80) return 'surgeon-general'
  if (avgVitality >= 65) return 'cardiologist'
  if (avgVitality >= 50) return 'physician'
  if (avgVitality >= 35) return 'medic'
  if (avgVitality >= 20) return 'intern'
  return 'quack'
}

// ─── generateRecommendations ─────────────────────────────────────────────────

/** @example generateRecommendations(vessels, systems, organism, stats) returns string[] */
export function generateRecommendations(
  vessels: BloodVessel[],
  systems: CirculatorySystem[],
  organism: CrimsonThreadResult['organism'],
  stats: CrimsonThreadResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgArterialStrength < 50) recs.push('Strengthen arterial walls — improve code robustness with types and interfaces')
  if (stats.avgPulseQuality < 50) recs.push('Stabilize pulse rhythm — improve code style consistency')
  if (stats.avgCirculationEfficiency < 50) recs.push('Improve circulation efficiency — enhance code data flow and dependency management')
  if (stats.avgOxygenDelivery < 50) recs.push('Increase oxygen delivery — enhance documentation and code clarity')
  if (stats.avgImmuneResponse < 50) recs.push('Bolster immune response — add error handling and recovery mechanisms')
  if (stats.avgLifeForce < 50) recs.push('Restore life force — improve overall code vitality with exports, types, and async patterns')
  if (stats.lifelessCount > stats.totalFiles * 0.3) recs.push('Critical: over 30% of files are lifeless — consider major codebase revitalization')
  if (stats.criticalConditionCount > 0) recs.push('Warning: critical condition files detected — these need immediate attention')
  if (organism.overallVitality < 40) recs.push('Overall vitality is critically low — establish a code health improvement regimen')
  if (systems.length > 0 && systems.every((s) => s.condition === 'deceased')) recs.push('All systems are deceased — your codebase needs fundamental resuscitation')

  if (vessels.length > 0) {
    const highBlockage = vessels.filter((v) => v.arterial.blockageCount > 2)
    if (highBlockage.length > vessels.length * 0.5) recs.push('Over 50% of vessels have arterial blockage — reduce `any` and `eval` usage')
  }

  return recs
}

// ─── buildCrimsonThreadResult ────────────────────────────────────────────────

/** @example buildCrimsonThreadResult(files, contents, options) returns full result */
export function buildCrimsonThreadResult(files: string[], contents: string[], _options?: Record<string, unknown>): CrimsonThreadResult {
  const vessels = files.map((file, i) => analyzeBloodVessel(contents[i] ?? '', file))

  const systemMap = new Map<string, BloodVessel[]>()
  vessels.forEach((v) => {
    const parts = v.file.split('/')
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
    const existing = systemMap.get(dir)
    if (existing) existing.push(v)
    else systemMap.set(dir, [v])
  })

  const systems = Array.from(systemMap.entries()).map(([dir, vs]) => analyzeCirculatorySystem(vs, dir))

  const avgArterialStrength = vessels.length > 0 ? Math.round(vessels.reduce((s, v) => s + v.arterialStrength, 0) / vessels.length) : 0
  const avgPulseQuality = vessels.length > 0 ? Math.round(vessels.reduce((s, v) => s + v.pulseQuality, 0) / vessels.length) : 0
  const avgCirculationEfficiency = vessels.length > 0 ? Math.round(vessels.reduce((s, v) => s + v.circulationEfficiency, 0) / vessels.length) : 0
  const avgOxygenDelivery = vessels.length > 0 ? Math.round(vessels.reduce((s, v) => s + v.oxygenDelivery, 0) / vessels.length) : 0
  const avgImmuneResponse = vessels.length > 0 ? Math.round(vessels.reduce((s, v) => s + v.immuneResponse, 0) / vessels.length) : 0
  const avgLifeForce = vessels.length > 0 ? Math.round(vessels.reduce((s, v) => s + v.lifeForce, 0) / vessels.length) : 0

  const overallVitality = Math.round(
    avgArterialStrength * 0.2 +
    avgPulseQuality * 0.15 +
    avgCirculationEfficiency * 0.15 +
    avgOxygenDelivery * 0.15 +
    avgImmuneResponse * 0.15 +
    avgLifeForce * 0.2,
  )

  const organism = {
    avgArterial: avgArterialStrength,
    avgCirculation: avgCirculationEfficiency,
    avgLifeForce: avgLifeForce,
    isVital: overallVitality >= 70,
    overallVitality,
  }

  const stats = {
    totalFiles: files.length,
    totalSystems: systems.length,
    avgArterialStrength, avgPulseQuality, avgCirculationEfficiency, avgOxygenDelivery, avgImmuneResponse, avgLifeForce,
    lifeBloodCount: vessels.filter((v) => v.condition === 'life-blood').length,
    vitalThreadCount: vessels.filter((v) => v.condition === 'vital-thread').length,
    healthyFlowCount: vessels.filter((v) => v.condition === 'healthy-flow').length,
    fadingPulseCount: vessels.filter((v) => v.condition === 'fading-pulse').length,
    criticalConditionCount: vessels.filter((v) => v.condition === 'critical-condition').length,
    lifelessCount: vessels.filter((v) => v.condition === 'lifeless').length,
    hasHighStrengthCount: vessels.filter((v) => v.arterial.hasHighStrength).length,
    hasHighQualityCount: vessels.filter((v) => v.pulse.hasHighQuality).length,
    hasHighEfficiencyCount: vessels.filter((v) => v.circulation.hasHighEfficiency).length,
    hasHighDeliveryCount: vessels.filter((v) => v.oxygen.hasHighDelivery).length,
    hasHighResponseCount: vessels.filter((v) => v.immune.hasHighResponse).length,
    hasHighForceCount: vessels.filter((v) => v.life.hasHighForce).length,
    overallVitality,
    physicianGrade: classifyPhysicianGrade(overallVitality),
    bestVessel: vessels.length > 0 ? vessels.reduce((b, v) => v.qualityScore > b.qualityScore ? v : b).file : '',
    strongest: vessels.length > 0 ? vessels.reduce((b, v) => v.arterialStrength > b.arterialStrength ? v : b).file : '',
    bestRhythm: vessels.length > 0 ? vessels.reduce((b, v) => v.pulseQuality > b.pulseQuality ? v : b).file : '',
    mostEfficient: vessels.length > 0 ? vessels.reduce((b, v) => v.circulationEfficiency > b.circulationEfficiency ? v : b).file : '',
    bestDocumented: vessels.length > 0 ? vessels.reduce((b, v) => v.oxygenDelivery > b.oxygenDelivery ? v : b).file : '',
    bestDefended: vessels.length > 0 ? vessels.reduce((b, v) => v.immuneResponse > b.immuneResponse ? v : b).file : '',
  }

  const recommendations = generateRecommendations(vessels, systems, organism, stats)

  return { vessels, systems, organism, stats, recommendations }
}
