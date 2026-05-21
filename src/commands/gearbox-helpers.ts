// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface Gear {
  name: string
  teeth: number
  diameter: number
  meshQuality: number
  isDriveGear: boolean
  isIdlerGear: boolean
  isReverseGear: boolean
  isOverdrive: boolean
}

export interface Wear {
  level: 'none' | 'minimal' | 'moderate' | 'significant' | 'severe'
  bearingWear: number
  toothWear: number
  sealWear: number
  totalWearPercent: number
}

export interface Diagnostics {
  isGrinding: boolean
  isSlipping: boolean
  isOverheating: boolean
  isNoisy: boolean
  isVibrating: boolean
  hasMetalShavings: boolean
  fluidLevel: number
}

export interface PowerBand {
  lowEnd: number
  midRange: number
  highEnd: number
  optimalRange: 'low' | 'mid' | 'high' | 'broad' | 'narrow'
}

export interface GearUnit {
  file: string
  gearRatio: number
  torque: number
  rpm: number
  efficiency: number
  lubrication: number
  gearCount: number
  gearType: 'spur' | 'helical' | 'bevel' | 'worm' | 'planetary' | 'rack-pinion'
  transmissionType: 'manual' | 'automatic' | 'cvt' | 'dual-clutch' | 'direct-drive'
  gears: Gear[]
  clutchEngagement: number
  friction: number
  heatGeneration: number
  noise: number
  vibration: number
  wear: Wear
  diagnostics: Diagnostics
  powerBand: PowerBand
  condition: 'race-ready' | 'excellent' | 'good' | 'fair' | 'needs-service' | 'failing' | 'broken'
  qualityScore: number
  issues: string[]
}

export interface TransmissionUnit {
  directory: string
  gears: GearUnit[]
  totalGears: number
  avgEfficiency: number
  avgLubrication: number
  avgClutchEngagement: number
  dominantGearType: string
  dominantTransmissionType: string
  grindingCount: number
  slippingCount: number
  overheatingCount: number
  totalFriction: number
  totalWear: number
  avgFluidLevel: number
  isSynchronized: boolean
  synchronization: number
  transmissionGrade: 'racing' | 'performance' | 'standard' | 'economy' | 'worn' | 'broken'
  overallEfficiency: number
}

export interface GearboxStats {
  totalFiles: number
  totalTransmissions: number
  totalGears: number
  avgGearRatio: number
  avgTorque: number
  avgRPM: number
  avgEfficiency: number
  avgLubrication: number
  avgClutchEngagement: number
  avgFriction: number
  avgHeatGeneration: number
  avgNoise: number
  avgVibration: number
  avgFluidLevel: number
  grindingUnits: number
  slippingUnits: number
  overheatingUnits: number
  raceReadyCount: number
  brokenCount: number
  totalWear: number
  isSynchronized: boolean
  overallEfficiency: number
  mechanicGrade: 'f1-engineer' | 'master-mechanic' | 'mechanic' | 'apprentice' | 'shade-tree' | 'clueless'
  bestUnit: string
  worstUnit: string
  mostPowerful: string
  smoothest: string
}

export interface GearboxResult {
  units: GearUnit[]
  transmissions: TransmissionUnit[]
  stats: GearboxStats
  recommendations: string[]
}

// ─── Classification Functions ────────────────────────────────────────────────

/**
 * Classify gear type from code patterns
 * @example
 * classifyGearType(3, 5, 2) // 'planetary'
 */
export function classifyGearType(
  functions: number,
  exports: number,
  classes: number,
): GearUnit['gearType'] {
  if (functions >= 5 && classes >= 2) return 'planetary'
  if (classes >= 2) return 'worm'
  if (functions >= 5 && exports >= 3) return 'helical'
  if (exports >= 4) return 'bevel'
  if (functions >= 3) return 'spur'
  if (exports >= 2) return 'rack-pinion'
  return 'spur'
}

/**
 * Classify transmission type from code structure
 * @example
 * classifyTransmissionType(3, 2, 1) // 'automatic'
 */
export function classifyTransmissionType(
  exports: number,
  imports: number,
  generics: number,
): GearUnit['transmissionType'] {
  if (exports >= 6 && generics >= 2) return 'dual-clutch'
  if (exports >= 4 && imports >= 3) return 'automatic'
  if (generics >= 2) return 'cvt'
  if (exports >= 2) return 'manual'
  if (exports === 0 && imports === 0) return 'direct-drive'
  return 'manual'
}

/**
 * Classify mechanic grade from average efficiency
 * @example
 * classifyMechanicGrade(90) // 'f1-engineer'
 */
export function classifyMechanicGrade(efficiency: number): GearboxStats['mechanicGrade'] {
  if (efficiency >= 85) return 'f1-engineer'
  if (efficiency >= 70) return 'master-mechanic'
  if (efficiency >= 55) return 'mechanic'
  if (efficiency >= 40) return 'apprentice'
  if (efficiency >= 20) return 'shade-tree'
  return 'clueless'
}

/**
 * Classify transmission grade from average efficiency
 * @example
 * classifyTransmissionGrade(90) // 'racing'
 */
export function classifyTransmissionGrade(efficiency: number): TransmissionUnit['transmissionGrade'] {
  if (efficiency >= 80) return 'racing'
  if (efficiency >= 65) return 'performance'
  if (efficiency >= 45) return 'standard'
  if (efficiency >= 25) return 'economy'
  if (efficiency >= 10) return 'worn'
  return 'broken'
}

// ─── Gear Extraction ────────────────────────────────────────────────────────

/**
 * Extract functions as gears from code content
 * @example
 * extractGears('function hello() {}') // [{ name: 'hello', ... }]
 */
export function extractGears(content: string): Gear[] {
  const gears: Gear[] = []
  const namedFuncs = content.match(/(?:export\s+)?function\s+(\w+)\s*\([^)]*\)\s*:\s*[^{]+\{|(?:export\s+)?function\s+(\w+)\s*\([^)]*\)\s*\{|(?:export\s+)?(?:const|let)\s+(\w+)\s*=\s*\([^)]*\)\s*=>/g)
  if (namedFuncs) {
    for (const match of namedFuncs) {
      const nameMatch = match.match(/(?:function\s+|(?:const|let)\s+)(\w+)/)
      const name = nameMatch?.[1] ?? 'anonymous'
      const bodyMatch = content.indexOf(match)
      const bodyStart = content.indexOf('{', bodyMatch)
      let depth = 0
      let bodyEnd = bodyStart
      if (bodyStart !== -1) {
        for (let i = bodyStart; i < content.length; i++) {
          if (content[i] === '{') depth++
          if (content[i] === '}') depth--
          if (depth === 0) { bodyEnd = i; break }
        }
      }
      const body = content.slice(bodyStart, bodyEnd + 1)
      const teeth = Math.max(1, Math.min(20, Math.round(body.length / 30)))
      const diameter = Math.max(1, Math.min(20, Math.round(body.split('\n').length / 2)))
      const hasReturn = /return\s+/.test(body)
      const isExport = match.startsWith('export')
      const isSimple = body.length < 50
      gears.push({
        name,
        teeth,
        diameter,
        meshQuality: Math.min(100, Math.max(0, 70 + (hasReturn ? 10 : 0) + (isExport ? 10 : 0) + (isSimple ? 10 : 0) - teeth)),
        isDriveGear: isExport,
        isIdlerGear: isSimple && !hasReturn,
        isReverseGear: hasReturn && /!|!==|===/.test(body),
        isOverdrive: body.includes('Map') || body.includes('reduce') || body.includes('filter'),
      })
    }
  }
  return gears
}

// ─── Diagnostics ─────────────────────────────────────────────────────────────

/**
 * Run diagnostics on a gear unit
 * @example
 * runDiagnostics({ friction: 50, heatGeneration: 60, noise: 40, vibration: 30 })
 */
export function runDiagnostics(metrics: {
  friction: number
  heatGeneration: number
  noise: number
  vibration: number
  hasAny: boolean
  hasConsole: boolean
  hasEval: boolean
  testCount: number
  totalLines: number
}): Diagnostics {
  return {
    isGrinding: metrics.friction > 60,
    isSlipping: metrics.friction > 50 && metrics.heatGeneration < 30,
    isOverheating: metrics.heatGeneration > 60,
    isNoisy: metrics.noise > 50,
    isVibrating: metrics.vibration > 50,
    hasMetalShavings: metrics.hasAny || metrics.hasEval,
    fluidLevel: Math.min(100, Math.round((metrics.testCount / Math.max(1, metrics.totalLines)) * 200)),
  }
}

// ─── Power Band ──────────────────────────────────────────────────────────────

/**
 * Compute power band from code characteristics
 * @example
 * computePowerBand(50, 60, 70) // { optimalRange: 'broad' }
 */
export function computePowerBand(
  simplicity: number,
  structure: number,
  complexity: number,
): PowerBand {
  const lowEnd = Math.min(100, Math.round(simplicity * 0.8 + 20))
  const midRange = Math.min(100, Math.round(structure * 0.8 + 20))
  const highEnd = Math.min(100, Math.round(complexity * 0.8 + 20))
  const spread = Math.max(lowEnd, midRange, highEnd) - Math.min(lowEnd, midRange, highEnd)
  let optimalRange: PowerBand['optimalRange']
  if (spread < 15) optimalRange = 'narrow'
  else if (spread > 40) optimalRange = 'broad'
  else if (lowEnd >= midRange && lowEnd >= highEnd) optimalRange = 'low'
  else if (highEnd >= midRange && highEnd >= lowEnd) optimalRange = 'high'
  else optimalRange = 'mid'
  return { lowEnd, midRange, highEnd, optimalRange }
}

// ─── Core Analysis ───────────────────────────────────────────────────────────

/**
 * Analyze a single file as a gear unit
 * @example
 * analyzeGearUnit('export function f() {}', 'f.ts') // GearUnit
 */
export function analyzeGearUnit(content: string, filePath: string): GearUnit {
  const lines = content.split('\n')
  const totalLines = lines.length
  const codeLines = lines.filter(l => l.trim().length > 0 && !l.trim().startsWith('//') && !l.trim().startsWith('*')).length

  const exportCount = (content.match(/\bexport\s+/g) ?? []).length
  const functionCount = (content.match(/(?:function\s+\w+|=>\s*[{(])/g) ?? []).length
  const classCount = (content.match(/\bclass\s+\w+/g) ?? []).length
  const interfaceCount = (content.match(/\binterface\s+\w+/g) ?? []).length
  const typeCount = (content.match(/\btype\s+\w+/g) ?? []).length
  const importCount = (content.match(/\bimport\s+/g) ?? []).length
  const genericCount = (content.match(/<\w+>/g) ?? []).length
  const jsdocCount = (content.match(/\/\*\*[\s\S]*?\*\//g) ?? []).length
  const tryCatchCount = (content.match(/\btry\s*\{/g) ?? []).length
  const testCount = (content.match(/describe\s*\(|it\s*\(|test\s*\(/g) ?? []).length

  const hasJSDoc = jsdocCount > 0
  const hasTypes = interfaceCount + typeCount > 0
  const hasExports = exportCount > 0
  const hasTests = testCount > 0
  const hasAny = /\bany\b/.test(content)
  const hasConsole = /console\.\w+\s*\(/.test(content)
  const hasEval = /\beval\s*\(/.test(content)

  const gearRatio = codeLines > 0 ? Math.round((totalLines / codeLines) * 100) / 100 : 0

  const torque = Math.min(100, Math.max(0, Math.round(
    (hasExports ? 20 : 0) + (hasTypes ? 15 : 0) + (hasJSDoc ? 15 : 0) +
    (hasTests ? 15 : 0) + Math.min(20, functionCount * 4) + Math.min(15, exportCount * 3),
  )))

  const rpm = Math.min(100, Math.max(0, Math.round(
    80 - (hasConsole ? 10 : 0) - (hasAny ? 10 : 0) - (hasEval ? 15 : 0) -
    (totalLines > 200 ? 10 : 0) + (hasExports ? 10 : 0) + (hasTypes ? 10 : 0),
  )))

  const lubrication = Math.min(100, Math.max(0, Math.round(
    (hasJSDoc ? 20 : 0) + (hasTypes ? 20 : 0) + (hasExports ? 15 : 0) +
    (hasTests ? 15 : 0) + (importCount > 0 ? 10 : 0) + (tryCatchCount > 0 ? 10 : 0) +
    Math.min(10, jsdocCount * 3),
  )))

  const clutchEngagement = Math.min(100, Math.max(0, Math.round(
    (hasExports ? 20 : 0) + (hasTypes ? 15 : 0) + (importCount > 0 ? 15 : 0) +
    (hasJSDoc ? 15 : 0) + (hasTests ? 15 : 0) + Math.min(20, exportCount * 4),
  )))

  const friction = Math.min(100, Math.max(0, Math.round(
    (hasAny ? 20 : 0) + (hasConsole ? 10 : 0) + (hasEval ? 15 : 0) +
    (totalLines > 150 ? 10 : 0) + Math.max(0, importCount - 5) * 3,
  )))

  const heatGeneration = Math.min(100, Math.max(0, Math.round(
    (functionCount > 10 ? 15 : 0) + (totalLines > 200 ? 15 : 0) +
    (classCount > 3 ? 10 : 0) + (hasAny ? 10 : 0) + (tryCatchCount > 3 ? 10 : 0),
  )))

  const noise = Math.min(100, Math.max(0, Math.round(
    (hasConsole ? 15 : 0) + (hasAny ? 10 : 0) + (hasEval ? 15 : 0) +
    (totalLines > 300 ? 10 : 0) + Math.max(0, codeLines - 50) * 0.2,
  )))

  const vibration = Math.min(100, Math.max(0, Math.round(
    (hasAny ? 15 : 0) + (hasEval ? 10 : 0) + (tryCatchCount > 2 ? 10 : 0) +
    (importCount > 8 ? 10 : 0) + (functionCount > 8 ? 10 : 0),
  )))

  const efficiency = Math.min(100, Math.max(0, Math.round(
    (torque * 0.25) + (rpm * 0.2) + (lubrication * 0.2) +
    (clutchEngagement * 0.15) + ((100 - friction) * 0.1) + ((100 - heatGeneration) * 0.1),
  )))

  const gears = extractGears(content)
  const gearType = classifyGearType(functionCount, exportCount, classCount)
  const transmissionType = classifyTransmissionType(exportCount, importCount, genericCount)

  const diagnostics = runDiagnostics({
    friction, heatGeneration, noise, vibration,
    hasAny, hasConsole, hasEval,
    testCount, totalLines,
  })

  const bearingWear = Math.min(100, Math.max(0, importCount > 5 ? importCount * 8 : 0))
  const toothWear = Math.min(100, Math.max(0, functionCount > 6 ? (functionCount - 4) * 10 : 0))
  const sealWear = Math.min(100, Math.max(0, hasAny ? 30 : 0 + (hasConsole ? 15 : 0)))
  const totalWearPercent = Math.round((bearingWear + toothWear + sealWear) / 3)
  let wearLevel: Wear['level']
  if (totalWearPercent < 5) wearLevel = 'none'
  else if (totalWearPercent < 20) wearLevel = 'minimal'
  else if (totalWearPercent < 40) wearLevel = 'moderate'
  else if (totalWearPercent < 60) wearLevel = 'significant'
  else wearLevel = 'severe'

  const powerBand = computePowerBand(
    Math.round((100 - noise + efficiency) / 2),
    Math.round((lubrication + clutchEngagement) / 2),
    Math.round((torque + rpm) / 2),
  )

  const qualityScore = Math.min(100, Math.max(0, Math.round(
    (efficiency * 0.35) + (torque * 0.2) + (lubrication * 0.15) +
    (clutchEngagement * 0.15) + ((100 - friction) * 0.15),
  )))

  let condition: GearUnit['condition']
  if (qualityScore >= 85) condition = 'race-ready'
  else if (qualityScore >= 75) condition = 'excellent'
  else if (qualityScore >= 60) condition = 'good'
  else if (qualityScore >= 45) condition = 'fair'
  else if (qualityScore >= 25) condition = 'needs-service'
  else if (qualityScore >= 10) condition = 'failing'
  else condition = 'broken'

  const issues: string[] = []
  if (diagnostics.isGrinding) issues.push('Gears grinding: high friction detected')
  if (diagnostics.isSlipping) issues.push('Clutch slipping: losing efficiency')
  if (diagnostics.isOverheating) issues.push('Overheating: excessive complexity')
  if (diagnostics.isNoisy) issues.push('Noisy operation: unnecessary code')
  if (diagnostics.isVibrating) issues.push('Vibration: unstable patterns')
  if (diagnostics.hasMetalShavings) issues.push('Metal shavings: type safety issues')
  if (diagnostics.fluidLevel < 30) issues.push('Low fluid: insufficient test coverage')

  return {
    file: filePath, gearRatio, torque, rpm, efficiency, lubrication,
    gearCount: gears.length, gearType, transmissionType, gears,
    clutchEngagement, friction, heatGeneration, noise, vibration,
    wear: { level: wearLevel, bearingWear, toothWear, sealWear, totalWearPercent },
    diagnostics, powerBand, condition, qualityScore, issues,
  }
}

// ─── Transmission Analysis ──────────────────────────────────────────────────

/**
 * Analyze a directory as a transmission unit
 * @example
 * analyzeTransmissionUnit(units, 'src') // TransmissionUnit
 */
export function analyzeTransmissionUnit(units: GearUnit[], dirPath: string): TransmissionUnit {
  if (units.length === 0) {
    return {
      directory: dirPath, gears: [], totalGears: 0,
      avgEfficiency: 0, avgLubrication: 0, avgClutchEngagement: 0,
      dominantGearType: 'spur', dominantTransmissionType: 'manual',
      grindingCount: 0, slippingCount: 0, overheatingCount: 0,
      totalFriction: 0, totalWear: 0, avgFluidLevel: 0,
      isSynchronized: false, synchronization: 0,
      transmissionGrade: 'broken', overallEfficiency: 0,
    }
  }

  const totalGears = units.reduce((s, u) => s + u.gearCount, 0)
  const avgEfficiency = Math.round(units.reduce((s, u) => s + u.efficiency, 0) / units.length)
  const avgLubrication = Math.round(units.reduce((s, u) => s + u.lubrication, 0) / units.length)
  const avgClutchEngagement = Math.round(units.reduce((s, u) => s + u.clutchEngagement, 0) / units.length)

  const gearTypeCounts = new Map<string, number>()
  const transTypeCounts = new Map<string, number>()
  for (const u of units) {
    gearTypeCounts.set(u.gearType, (gearTypeCounts.get(u.gearType) ?? 0) + 1)
    transTypeCounts.set(u.transmissionType, (transTypeCounts.get(u.transmissionType) ?? 0) + 1)
  }
  const dominantGearType = Array.from(gearTypeCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'spur'
  const dominantTransmissionType = Array.from(transTypeCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'manual'

  const grindingCount = units.filter(u => u.diagnostics.isGrinding).length
  const slippingCount = units.filter(u => u.diagnostics.isSlipping).length
  const overheatingCount = units.filter(u => u.diagnostics.isOverheating).length
  const totalFriction = units.reduce((s, u) => s + u.friction, 0)
  const totalWear = units.reduce((s, u) => s + u.wear.totalWearPercent, 0)
  const avgFluidLevel = Math.round(units.reduce((s, u) => s + u.diagnostics.fluidLevel, 0) / units.length)

  const effStd = Math.sqrt(units.reduce((s, u) => s + Math.pow(u.efficiency - avgEfficiency, 2), 0) / units.length)
  const synchronization = Math.min(100, Math.round(100 - effStd * 2))
  const isSynchronized = synchronization >= 70

  const overallEfficiency = avgEfficiency
  const transmissionGrade = classifyTransmissionGrade(overallEfficiency)

  return {
    directory: dirPath, gears: units, totalGears,
    avgEfficiency, avgLubrication, avgClutchEngagement,
    dominantGearType, dominantTransmissionType,
    grindingCount, slippingCount, overheatingCount,
    totalFriction, totalWear, avgFluidLevel,
    isSynchronized, synchronization,
    transmissionGrade, overallEfficiency,
  }
}

// ─── Recommendations ────────────────────────────────────────────────────────

/**
 * Generate gearbox recommendations
 * @example
 * generateRecommendations(units, transmissions, stats) // string[]
 */
export function generateRecommendations(
  units: GearUnit[],
  transmissions: TransmissionUnit[],
  stats: GearboxStats,
): string[] {
  const recs: string[] = []

  if (stats.overallEfficiency >= 75) {
    recs.push('Transmission running smoothly: maintain current performance')
  }

  if (stats.grindingUnits > 0) {
    recs.push(`Grinding gears: ${stats.grindingUnits} files with high friction need lubrication`)
  }

  if (stats.slippingUnits > 0) {
    recs.push(`Clutch slipping: ${stats.slippingUnits} files losing efficiency`)
  }

  if (stats.overheatingUnits > 0) {
    recs.push(`Overheating: ${stats.overheatingUnits} files with excessive complexity`)
  }

  if (stats.avgFriction > 40) {
    recs.push('High friction: improve data flow and reduce unnecessary operations')
  }

  if (stats.avgLubrication < 40) {
    recs.push('Low lubrication: add documentation and type annotations')
  }

  if (stats.avgFluidLevel < 30) {
    recs.push('Low fluid level: increase test coverage')
  }

  if (stats.totalWear > 100) {
    recs.push('Significant wear: schedule refactoring maintenance')
  }

  if (stats.brokenCount > 0) {
    recs.push(`Broken units: ${stats.brokenCount} files need complete overhaul`)
  }

  if (stats.raceReadyCount > 0) {
    recs.push(`Race-ready: ${stats.raceReadyCount} files performing at peak efficiency`)
  }

  if (stats.avgClutchEngagement < 40) {
    recs.push('Poor coupling: improve module interfaces and exports')
  }

  if (stats.overallEfficiency < 40) {
    recs.push('Overall efficiency is low: major mechanical overhaul recommended')
  } else if (stats.overallEfficiency < 60) {
    recs.push('Moderate efficiency: targeted tuning will improve performance')
  }

  const lowRPM = units.filter(u => u.rpm < 30)
  if (lowRPM.length > 0) {
    recs.push(`Low RPM: ${lowRPM.length} files have unnecessary overhead`)
  }

  const badTrans = transmissions.filter(t => t.transmissionGrade === 'broken')
  if (badTrans.length > 0) {
    recs.push(`Broken transmissions: ${badTrans.length} directories need major work`)
  }

  return Array.from(new Set(recs))
}

// ─── Orchestrator ────────────────────────────────────────────────────────────

/**
 * Build complete gearbox result from files and contents
 * @example
 * buildGearboxResult(['a.ts'], ['export function a() {}'], {}) // GearboxResult
 */
export function buildGearboxResult(
  files: string[],
  contents: string[],
  options: Record<string, unknown>,
): GearboxResult {
  const units: GearUnit[] = files.map((file, i) => {
    const content = contents[i] ?? ''
    try {
      return analyzeGearUnit(content, file)
    } catch {
      return analyzeGearUnit('', file)
    }
  })

  const dirMap = new Map<string, GearUnit[]>()
  for (const unit of units) {
    const dir = unit.file.includes('/') ? unit.file.slice(0, unit.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(unit)
    } else {
      dirMap.set(dir, [unit])
    }
  }

  const transmissions: TransmissionUnit[] = Array.from(dirMap.entries()).map(([dir, us]) =>
    analyzeTransmissionUnit(us, dir),
  )

  const n = units.length || 1
  const avgGearRatio = Math.round(units.reduce((s, u) => s + u.gearRatio, 0) / n * 100) / 100
  const avgTorque = Math.round(units.reduce((s, u) => s + u.torque, 0) / n)
  const avgRPM = Math.round(units.reduce((s, u) => s + u.rpm, 0) / n)
  const avgEfficiency = Math.round(units.reduce((s, u) => s + u.efficiency, 0) / n)
  const avgLubrication = Math.round(units.reduce((s, u) => s + u.lubrication, 0) / n)
  const avgClutchEngagement = Math.round(units.reduce((s, u) => s + u.clutchEngagement, 0) / n)
  const avgFriction = Math.round(units.reduce((s, u) => s + u.friction, 0) / n)
  const avgHeatGeneration = Math.round(units.reduce((s, u) => s + u.heatGeneration, 0) / n)
  const avgNoise = Math.round(units.reduce((s, u) => s + u.noise, 0) / n)
  const avgVibration = Math.round(units.reduce((s, u) => s + u.vibration, 0) / n)
  const avgFluidLevel = Math.round(units.reduce((s, u) => s + u.diagnostics.fluidLevel, 0) / n)

  const totalGears = units.reduce((s, u) => s + u.gearCount, 0)
  const grindingUnits = units.filter(u => u.diagnostics.isGrinding).length
  const slippingUnits = units.filter(u => u.diagnostics.isSlipping).length
  const overheatingUnits = units.filter(u => u.diagnostics.isOverheating).length
  const raceReadyCount = units.filter(u => u.condition === 'race-ready').length
  const brokenCount = units.filter(u => u.condition === 'broken').length
  const totalWear = units.reduce((s, u) => s + u.wear.totalWearPercent, 0)
  const overallEfficiency = avgEfficiency

  const isSynchronized = transmissions.every(t => t.isSynchronized) && transmissions.length > 0

  const bestUnit = units.length > 0
    ? units.reduce((b, u) => u.efficiency > b.efficiency ? u : b, units[0]).file : 'none'
  const worstUnit = units.length > 0
    ? units.reduce((w, u) => u.efficiency < w.efficiency ? u : w, units[0]).file : 'none'
  const mostPowerful = units.length > 0
    ? units.reduce((m, u) => u.torque > m.torque ? u : m, units[0]).file : 'none'
  const smoothest = units.length > 0
    ? units.reduce((m, u) => u.lubrication > m.lubrication ? u : m, units[0]).file : 'none'

  const stats: GearboxStats = {
    totalFiles: files.length,
    totalTransmissions: transmissions.length,
    totalGears,
    avgGearRatio, avgTorque, avgRPM, avgEfficiency,
    avgLubrication, avgClutchEngagement, avgFriction,
    avgHeatGeneration, avgNoise, avgVibration, avgFluidLevel,
    grindingUnits, slippingUnits, overheatingUnits,
    raceReadyCount, brokenCount, totalWear,
    isSynchronized, overallEfficiency,
    mechanicGrade: classifyMechanicGrade(overallEfficiency),
    bestUnit, worstUnit, mostPowerful, smoothest,
  }

  const recommendations = generateRecommendations(units, transmissions, stats)

  void options

  return { units, transmissions, stats, recommendations }
}
