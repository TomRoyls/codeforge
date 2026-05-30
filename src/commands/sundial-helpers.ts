// ─── Types ────────────────────────────────────────────────────────────────────

export interface DialReading {
  file: string
  efficiency: number
  operationCount: number
  unnecessaryOps: number
  optimalPaths: number
  shadowPaths: number
  obstructionLevel: number
  timeComplexity: 'O(1)' | 'O(log n)' | 'O(n)' | 'O(n log n)' | 'O(n²)' | 'O(n³)' | 'O(2^n)'
  spaceComplexity: string
  grade: 'optimal' | 'efficient' | 'adequate' | 'wasteful' | 'extravagant'
}

export interface ShadowPath {
  type: 'redundant-computation' | 'unnecessary-copy' | 'double-iteration' | 'premature-computation' | 'unused-result' | 'excessive-allocation' | 'repeated-lookup' | 'nested-loop'
  file: string
  line: number
  description: string
  wasteLevel: 'minor' | 'moderate' | 'major' | 'severe'
  estimatedSavings: string
  fix: string
}

export interface DialSegment {
  type: 'golden-hour' | 'midday' | 'afternoon' | 'twilight' | 'midnight'
  files: string[]
  avgEfficiency: number
  description: string
}

export interface SundialStats {
  totalReadings: number
  avgEfficiency: number
  optimalFiles: number
  extravagantFiles: number
  totalShadowPaths: number
  severeShadowPaths: number
  goldenHourFiles: number
  midnightFiles: number
  commonTimeComplexity: string
  avgObstructionLevel: number
  efficiencyIndex: number
  wasteIndex: number
  sundialAccuracy: number
  overallGrade: 'atomic-clock' | 'precision' | 'standard' | 'sundial' | 'hourglass'
}

export interface SundialResult {
  readings: DialReading[]
  shadowPaths: ShadowPath[]
  segments: DialSegment[]
  stats: SundialStats
  recommendations: string[]
}

// ─── Complexity Estimation ────────────────────────────────────────────────────

/**
 * Estimate time complexity from code content
 * @example
 * estimateTimeComplexity('for (const a of arr) { for (const b of arr) {} }') // 'O(n²)'
 */
export function estimateTimeComplexity(content: string): DialReading['timeComplexity'] {
  const lines = content.split('\n')
  let maxNesting = 0
  let currentNesting = 0

  for (const line of lines) {
    const trimmed = line.trim()
    if (/^\s*(\/\/|\/\*|\*)/.test(trimmed)) continue
    const loopMatches = trimmed.match(/\bfor\s*\(|\bwhile\s*\(/g)
    if (loopMatches) {
      currentNesting += loopMatches.length
      if (currentNesting > maxNesting) maxNesting = currentNesting
    }
    const closeBraces = (trimmed.match(/\}/g) || []).length
    currentNesting = Math.max(0, currentNesting - closeBraces)
  }

  if (/\.filter\(.*\.filter\(|\.map\(.*\.map\(|\.reduce\(.*\.reduce\(/.test(content)) {
    maxNesting = Math.max(maxNesting, 1)
  }

  const hasRecursion = (() => {
    const fnDeclRegex = /function\s+(\w+)|(?:const|let)\s+(\w+)\s*=\s*(?:\([^)]*\)\s*=>|(?:async\s+)?function)/g
    const fnNames: string[] = []
    let fnMatch: RegExpExecArray | null
    while ((fnMatch = fnDeclRegex.exec(content)) !== null) {
      const name = fnMatch[1] || fnMatch[2]
      if (name) fnNames.push(name)
    }
    return fnNames.some(name => {
      const callPattern = new RegExp(`\\b${name}\\s*\\(`, 'g')
      const calls = content.match(callPattern)
      return calls !== null && calls.length >= 2
    })
  })()

  if (hasRecursion) return 'O(2^n)'
  if (maxNesting >= 3) return 'O(n³)'
  if (maxNesting >= 2) return 'O(n²)'
  if (maxNesting >= 1) {
    if (/\.sort\(/.test(content)) return 'O(n log n)'
    return 'O(n)'
  }
  if (/Math\.log|binarySearch|binary[_-]?search/i.test(content)) return 'O(log n)'
  return 'O(1)'
}

/**
 * Estimate space complexity from code content
 * @example
 * estimateSpaceComplexity('const arr = new Array(n)') // 'O(n)'
 */
export function estimateSpaceComplexity(content: string): string {
  let score = 0
  if (/new\s+(Array|Map|Set|Object)\s*\(/.test(content)) score++
  if (/\.push\(|\.concat\(|\.splice\(/.test(content)) score++
  if (/JSON\.parse|JSON\.stringify/.test(content)) score++
  if (/new\s+Array\s*\(\s*\w+\s*\)/.test(content)) score += 2
  if (/\.reduce\(\s*\(/.test(content) && /spread/.test(content)) score++
  if (/new\s+Map|new\s+Set/.test(content)) score++

  if (score >= 4) return 'O(n)'
  if (score >= 2) return 'O(n)'
  if (score >= 1) return 'O(n)'
  return 'O(1)'
}

// ─── Shadow Path Detection ────────────────────────────────────────────────────

/**
 * Find shadow paths (unnecessary work) in code
 * @example
 * findShadowPaths('const a = f(x); const b = f(x);', 'test.ts') // ShadowPath[]
 */
export function findShadowPaths(content: string, filePath: string): ShadowPath[] {
  const paths: ShadowPath[] = []
  const lines = content.split('\n')

  const callCounts = new Map<string, number[]>()
  const callRegex = /\b(\w+(?:\.\w+)*)\s*\(/g
  for (let i = 0; i < lines.length; i++) {
    const currentLine = lines[i]
    if (currentLine === undefined) continue
    let match: RegExpExecArray | null
    callRegex.lastIndex = 0
    while ((match = callRegex.exec(currentLine)) !== null) {
      if (match[1] === undefined) continue
      const fn = match[1]
      if (/^(if|for|while|switch|return|const|let|var|function|class|new|typeof|instanceof)/.test(fn)) continue
      const lineNums = callCounts.get(fn) || []
      lineNums.push(i + 1)
      callCounts.set(fn, lineNums)
    }
  }

  const propRegex = /\b(\w+\.\w+)(?!\s*\()/g
  for (let i = 0; i < lines.length; i++) {
    const currentLine = lines[i]
    if (currentLine === undefined) continue
    let match: RegExpExecArray | null
    propRegex.lastIndex = 0
    while ((match = propRegex.exec(currentLine)) !== null) {
      if (match[1] === undefined) continue
      const prop = match[1]
      if (/^(Math|console|JSON|Object|Array|String|Number|Promise|Date|Error|Map|Set|RegExp)/.test(prop)) continue
      const lineNums = callCounts.get(prop) || []
      lineNums.push(i + 1)
      callCounts.set(prop, lineNums)
    }
  }

  for (const [fn, lineNums] of callCounts) {
    if (lineNums.length >= 2) {
      const secondLine = lineNums[1]
      if (secondLine === undefined) continue
      const wasteLevel: ShadowPath['wasteLevel'] = lineNums.length >= 4 ? 'severe' : lineNums.length >= 3 ? 'major' : 'moderate'
      paths.push({
        type: 'repeated-lookup',
        file: filePath,
        line: secondLine,
        description: `${fn} called ${lineNums.length} times — result could be cached`,
        wasteLevel,
        estimatedSavings: `${lineNums.length - 1} call(s)`,
        fix: `Cache result of ${fn} in a variable`,
      })
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line === undefined) continue
    const trimmed = line.trim()
    const lineNum = i + 1
    const nextLine = lines[i + 1]
    const futureLine = lines[Math.min(i + 2, lines.length - 1)]

    if (/\.slice\(\)\s*\.sort\(|\.slice\(\)\.concat\(|Array\.from\(.*\)\.map\(/.test(trimmed)) {
      paths.push({
        type: 'unnecessary-copy',
        file: filePath,
        line: lineNum,
        description: 'Unnecessary copy before operation',
        wasteLevel: 'minor',
        estimatedSavings: 'O(n) copy',
        fix: 'Operate on the original if mutation is acceptable',
      })
    }

    if ((/\.forEach\(/.test(trimmed) && nextLine !== undefined && /\.forEach\(/.test(nextLine)) ||
        (/\.map\(/.test(trimmed) && futureLine !== undefined && /\.filter\(/.test(futureLine))) {
      paths.push({
        type: 'double-iteration',
        file: filePath,
        line: lineNum,
        description: 'Multiple iterations over same data — consider combining',
        wasteLevel: 'moderate',
        estimatedSavings: '1 iteration pass',
        fix: 'Combine operations into a single pass',
      })
    }

    if (/Object\.assign\(\{\s*\},\s*\w+\s*\)/.test(trimmed) || /\{\s*\.\.\.\w+\s*\}/.test(trimmed)) {
      const copyCount = (content.match(/\{\s*\.\.\.\w+\s*\}/g) || []).length
      if (copyCount > 2) {
        paths.push({
          type: 'excessive-allocation',
          file: filePath,
          line: lineNum,
          description: `Frequent object spreading (${copyCount} times) creates many allocations`,
          wasteLevel: copyCount > 5 ? 'major' : 'moderate',
          estimatedSavings: `${copyCount - 1} allocations`,
          fix: 'Reuse objects or use mutation in performance-critical paths',
        })
      }
    }

    const lhs = trimmed.split('=')[0]
    if (/^\s*(const|let)\s+\w+\s*=\s*.*[\+\-\*\/%]/.test(trimmed) &&
        lhs !== undefined && nextLine !== undefined && !nextLine.includes(lhs.trim().split(' ')[1] || '')) {
      const varName = lhs.trim().split(' ')[1] || ''
      if (varName && !content.substring(content.indexOf(trimmed) + trimmed.length).includes(varName)) {
        paths.push({
          type: 'unused-result',
          file: filePath,
          line: lineNum,
          description: `Computed value '${varName}' may not be used`,
          wasteLevel: 'minor',
          estimatedSavings: '1 computation',
          fix: `Remove unused computation or use the result`,
        })
      }
    }
  }

  let loopDepth = 0
  for (let i = 0; i < lines.length; i++) {
    const loopLine = lines[i]
    if (loopLine === undefined) continue
    const trimmed = loopLine.trim()
    if (/^\s*(\/\/|\/\*|\*)/.test(trimmed)) continue
    const loopMatches = trimmed.match(/\bfor\s*\(|\bwhile\s*\(/g)
    if (loopMatches) {
      loopDepth += loopMatches.length
      if (loopDepth >= 2) {
        paths.push({
          type: 'nested-loop',
          file: filePath,
          line: i + 1,
          description: `Nested loop at depth ${loopDepth} — potential O(n^${loopDepth})`,
          wasteLevel: loopDepth >= 3 ? 'severe' : 'major',
          estimatedSavings: `O(n^${loopDepth}) → O(n) with ${loopDepth >= 3 ? 'algorithm redesign' : 'Map/Set lookup'}`,
          fix: loopDepth >= 3 ? 'Redesign algorithm to reduce nesting' : 'Use Map or Set for O(1) lookups instead of inner loop',
        })
      }
    }
    const closeBraces = (trimmed.match(/\}/g) || []).length
    loopDepth = Math.max(0, loopDepth - closeBraces)
  }

  const assignMatch = content.match(/(const|let)\s+(\w+)\s*=\s*[^;]+;/g) || []
  for (const assign of assignMatch) {
    const varName = assign.split(/\s+/)[1]
    if (varName) {
      const usagePattern = new RegExp(`\\b${varName}\\b`, 'g')
      const usages = (content.match(usagePattern) || []).length
      if (usages <= 1 && assign.includes('{') && !assign.includes('function')) {
        const lineIdx = lines.findIndex(l => l.includes(varName))
        if (lineIdx >= 0) {
          paths.push({
            type: 'premature-computation',
            file: filePath,
            line: lineIdx + 1,
            description: `'${varName}' computed but rarely used — consider lazy evaluation`,
            wasteLevel: 'minor',
            estimatedSavings: '1 computation when unused',
            fix: 'Compute on demand rather than eagerly',
          })
        }
      }
    }
  }

  return paths
}

// ─── Reading ──────────────────────────────────────────────────────────────────

/**
 * Take a dial reading for a single file
 * @example
 * takeReading('const x = 1 + 1', 'a.ts') // DialReading
 */
export function takeReading(content: string, filePath: string): DialReading {
  const lines = content.split('\n')
  const nonEmptyLines = lines.filter(l => l.trim().length > 0 && !/^\s*(\/\/|\/\*|\*)/.test(l.trim()))

  let operationCount = 0
  let unnecessaryOps = 0

  const opPatterns = [
    /\b(for|while)\s*\(/g,
    /\.map\s*\(/g,
    /\.filter\s*\(/g,
    /\.reduce\s*\(/g,
    /\.forEach\s*\(/g,
    /\.find\s*\(/g,
    /\.some\s*\(/g,
    /\.every\s*\(/g,
    /\.sort\s*\(/g,
  ]
  for (const pattern of opPatterns) {
    const matches = content.match(pattern)
    if (matches) operationCount += matches.length
  }

  const shadows = findShadowPaths(content, filePath)

  for (const sp of shadows) {
    if (sp.type === 'double-iteration') unnecessaryOps += 2
    else if (sp.type === 'nested-loop') unnecessaryOps += 5
    else if (sp.type === 'repeated-lookup') unnecessaryOps += 1
    else unnecessaryOps += 1
  }

  const timeComplexity = estimateTimeComplexity(content)
  const spaceComplexity = estimateSpaceComplexity(content)

  const shadowCount = shadows.length
  const optimalPaths = Math.max(0, operationCount - unnecessaryOps)

  const complexityPenalty: Record<string, number> = {
    'O(1)': 0, 'O(log n)': 5, 'O(n)': 10, 'O(n log n)': 20, 'O(n²)': 35, 'O(n³)': 50, 'O(2^n)': 65,
  }
  const penalty = complexityPenalty[timeComplexity] || 10

  let efficiency = Math.max(0, Math.min(100, 100 - penalty - (shadowCount * 3) - Math.min(20, Math.floor(nonEmptyLines.length / 30))))
  if (operationCount === 0 && shadowCount === 0) efficiency = 100

  let obstructionLevel = Math.min(100, shadowCount * 10 + unnecessaryOps * 5)
  if (shadows.some(s => s.wasteLevel === 'severe')) obstructionLevel = Math.min(100, obstructionLevel + 20)
  if (shadows.some(s => s.wasteLevel === 'major')) obstructionLevel = Math.min(100, obstructionLevel + 10)

  let grade: DialReading['grade'] = 'adequate'
  if (efficiency >= 85) grade = 'optimal'
  else if (efficiency >= 70) grade = 'efficient'
  else if (efficiency >= 50) grade = 'adequate'
  else if (efficiency >= 30) grade = 'wasteful'
  else grade = 'extravagant'

  return {
    file: filePath,
    efficiency,
    operationCount,
    unnecessaryOps,
    optimalPaths,
    shadowPaths: shadowCount,
    obstructionLevel,
    timeComplexity,
    spaceComplexity,
    grade,
  }
}

// ─── Segment Classification ───────────────────────────────────────────────────

/**
 * Classify a file into a dial segment based on efficiency
 * @example
 * classifySegment(92) // 'golden-hour'
 */
export function classifySegment(efficiency: number): DialSegment['type'] {
  if (efficiency >= 80) return 'golden-hour'
  if (efficiency >= 60) return 'midday'
  if (efficiency >= 40) return 'afternoon'
  if (efficiency >= 20) return 'twilight'
  return 'midnight'
}

// ─── Index Computations ───────────────────────────────────────────────────────

/**
 * Compute efficiency index (0-100)
 * @example
 * computeEfficiencyIndex([{ efficiency: 80 }, { efficiency: 60 }]) // 70
 */
export function computeEfficiencyIndex(readings: DialReading[]): number {
  if (readings.length === 0) return 100
  const total = readings.reduce((s, r) => s + r.efficiency, 0)
  return Math.round(total / readings.length)
}

/**
 * Compute waste index (0-100, lower is better)
 * @example
 * computeWasteIndex([{ wasteLevel: 'major' }, { wasteLevel: 'minor' }]) // 55
 */
export function computeWasteIndex(shadowPaths: ShadowPath[]): number {
  if (shadowPaths.length === 0) return 0
  let score = 0
  for (const sp of shadowPaths) {
    if (sp.wasteLevel === 'severe') score += 25
    else if (sp.wasteLevel === 'major') score += 15
    else if (sp.wasteLevel === 'moderate') score += 8
    else score += 3
  }
  return Math.min(100, score)
}

/**
 * Compute sundial accuracy (0-100)
 * @example
 * computeSundialAccuracy(80, 20) // 80
 */
export function computeSundialAccuracy(efficiency: number, waste: number): number {
  return Math.max(0, Math.min(100, Math.round(efficiency * 0.7 + (100 - waste) * 0.3)))
}

/**
 * Classify overall grade based on accuracy and efficiency
 * @example
 * classifyOverallGrade(90, 85) // 'atomic-clock'
 */
export function classifyOverallGrade(accuracy: number, efficiency: number): SundialStats['overallGrade'] {
  const combined = accuracy * 0.6 + efficiency * 0.4
  if (combined >= 85) return 'atomic-clock'
  if (combined >= 70) return 'precision'
  if (combined >= 50) return 'standard'
  if (combined >= 30) return 'sundial'
  return 'hourglass'
}

// ─── Segment Building ─────────────────────────────────────────────────────────

/**
 * Build dial segments from readings
 * @example
 * buildSegments(readings) // DialSegment[]
 */
export function buildSegments(readings: DialReading[]): DialSegment[] {
  const groups = new Map<DialSegment['type'], DialReading[]>()

  for (const r of readings) {
    const seg = classifySegment(r.efficiency)
    if (!groups.has(seg)) groups.set(seg, [])
    groups.get(seg)!.push(r)
  }

  const descriptions: Record<DialSegment['type'], string> = {
    'golden-hour': 'Highly optimized files with excellent efficiency',
    'midday': 'Well-performing files with room for minor improvements',
    'afternoon': 'Moderately efficient files with noticeable waste',
    'twilight': 'Below-average efficiency — optimization recommended',
    'midnight': 'Highly inefficient files — prioritize for refactoring',
  }

  const segments: DialSegment[] = []
  const order: DialSegment['type'][] = ['golden-hour', 'midday', 'afternoon', 'twilight', 'midnight']

  for (const type of order) {
    const group = groups.get(type)
    if (group && group.length > 0) {
      const avgEff = Math.round(group.reduce((s, r) => s + r.efficiency, 0) / group.length)
      segments.push({
        type,
        files: group.map(r => r.file),
        avgEfficiency: avgEff,
        description: descriptions[type],
      })
    }
  }

  return segments
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Generate sundial recommendations
 * @example
 * generateSundialRecommendations(readings, shadowPaths, stats) // string[]
 */
export function generateSundialRecommendations(
  readings: DialReading[],
  shadowPaths: ShadowPath[],
  stats: SundialStats,
): string[] {
  const recs: string[] = []

  const severe = shadowPaths.filter(s => s.wasteLevel === 'severe')
  if (severe.length > 0) {
    const types = Array.from(new Set(severe.map(s => s.type)))
    recs.push(`Address ${severe.length} severe shadow path(s): ${types.join(', ')}`)
  }

  const extravagant = readings.filter(r => r.grade === 'extravagant')
  if (extravagant.length > 0) {
    recs.push(`Redesign ${extravagant.length} extravagant file(s) for better efficiency: ${extravagant.map(e => e.file).join(', ')}`)
  }

  const midnightFiles = readings.filter(r => classifySegment(r.efficiency) === 'midnight')
  if (midnightFiles.length > 0) {
    recs.push(`Prioritize optimization of ${midnightFiles.length} midnight file(s): ${midnightFiles.map(m => m.file).join(', ')}`)
  }

  const wasteTypes = new Map<string, number>()
  for (const sp of shadowPaths) {
    wasteTypes.set(sp.type, (wasteTypes.get(sp.type) || 0) + 1)
  }
  const topWaste = Array.from(wasteTypes.entries()).sort((a, b) => b[1] - a[1])[0]
  if (topWaste && topWaste[1] >= 3) {
    recs.push(`Common waste pattern: '${topWaste[0]}' appears ${topWaste[1]} times — establish patterns to avoid it`)
  }

  if (stats.wasteIndex > 50) {
    recs.push(`High waste index (${stats.wasteIndex}) — significant performance gains possible from targeted optimizations`)
  }

  if (stats.sundialAccuracy < 40) {
    recs.push(`Low sundial accuracy (${stats.sundialAccuracy}) — codebase deviates significantly from optimal paths`)
  }

  const quadraticFiles = readings.filter(r => r.timeComplexity === 'O(n²)' || r.timeComplexity === 'O(n³)' || r.timeComplexity === 'O(2^n)')
  if (quadraticFiles.length >= 2) {
    recs.push(`${quadraticFiles.length} file(s) with high time complexity — consider algorithmic optimization`)
  }

  return Array.from(new Set(recs))
}

// ─── Build Result ──────────────────────────────────────────────────────────────

/**
 * Build the complete sundial result
 * @example
 * buildSundialResult(['a.ts'], ['const x = 1'], {}) // SundialResult
 */
export function buildSundialResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): SundialResult {
  const readings: DialReading[] = []
  const allShadowPaths: ShadowPath[] = []

  for (let i = 0; i < files.length; i++) {
    const content = contents[i]
    const file = files[i]
    if (content === undefined || file === undefined) continue
    const reading = takeReading(content, file)
    readings.push(reading)

    const shadows = findShadowPaths(content, file)
    allShadowPaths.push(...shadows)
  }

  const segments = buildSegments(readings)
  const efficiencyIndex = computeEfficiencyIndex(readings)
  const wasteIndex = computeWasteIndex(allShadowPaths)
  const sundialAccuracy = computeSundialAccuracy(efficiencyIndex, wasteIndex)
  const overallGrade = classifyOverallGrade(sundialAccuracy, efficiencyIndex)

  const complexityCounts = new Map<string, number>()
  for (const r of readings) {
    complexityCounts.set(r.timeComplexity, (complexityCounts.get(r.timeComplexity) || 0) + 1)
  }
  let commonTimeComplexity = 'O(1)'
  let maxCount = 0
  for (const [comp, count] of complexityCounts) {
    if (count > maxCount) {
      maxCount = count
      commonTimeComplexity = comp
    }
  }

  const avgObstruction = readings.length > 0
    ? Math.round(readings.reduce((s, r) => s + r.obstructionLevel, 0) / readings.length)
    : 0

  const stats: SundialStats = {
    totalReadings: readings.length,
    avgEfficiency: efficiencyIndex,
    optimalFiles: readings.filter(r => r.grade === 'optimal').length,
    extravagantFiles: readings.filter(r => r.grade === 'extravagant').length,
    totalShadowPaths: allShadowPaths.length,
    severeShadowPaths: allShadowPaths.filter(s => s.wasteLevel === 'severe').length,
    goldenHourFiles: segments.find(s => s.type === 'golden-hour')?.files.length || 0,
    midnightFiles: segments.find(s => s.type === 'midnight')?.files.length || 0,
    commonTimeComplexity,
    avgObstructionLevel: avgObstruction,
    efficiencyIndex,
    wasteIndex,
    sundialAccuracy,
    overallGrade,
  }

  const recommendations = generateSundialRecommendations(readings, allShadowPaths, stats)

  return { readings, shadowPaths: allShadowPaths, segments, stats, recommendations }
}
