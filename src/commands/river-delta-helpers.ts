// ─── Interfaces ──────────────────────────────────────────

export type ChannelType = 'main-channel' | 'distributary' | 'tributary' | 'backwater' | 'oxbow' | 'dry-bed'
export type FlowDirection = 'downstream' | 'upstream' | 'lateral' | 'tidal' | 'stagnant'
export type ChannelCondition = 'deep-river' | 'clear-stream' | 'meandering-river' | 'swamp' | 'mudflat' | 'desert-wash'
export type RegionType = 'fertile-delta' | 'estuary' | 'floodplain' | 'wetland' | 'marsh' | 'saltpan'
export type RegionCondition = 'well-irrigated' | 'productive' | 'functional' | 'swampy' | 'flooded' | 'arid'
export type HydrologistGrade = 'chief-hydrologist' | 'hydrologist' | 'engineer' | 'surveyor' | 'fisherman' | 'drifter'

export interface ChannelMeasure {
  type: ChannelType
  depth: number
  width: number
  isNavigable: boolean
  hasUndercurrent: boolean
  hasWhirlpool: boolean
  hasEddy: boolean
  flowDirection: FlowDirection
}

export interface FlowMeasure {
  rate: number
  isSteady: boolean
  isTurbulent: boolean
  isLaminar: boolean
  hasWaterfall: boolean
  hasRapids: boolean
  hasPlungePool: boolean
  waterfallCount: number
  rapidCount: number
}

export interface SedimentMeasure {
  load: number
  isSuspended: boolean
  isSettled: boolean
  hasBedLoad: boolean
  hasSilt: boolean
  hasGravel: boolean
  siltLevel: number
}

export interface DistributaryMeasure {
  count: number
  isBalanced: boolean
  hasDominantChannel: boolean
  hasDeadChannels: boolean
  hasBraidedChannels: boolean
  deadChannelCount: number
  balanceScore: number
}

export interface FloodMeasure {
  control: number
  hasLevees: boolean
  hasFloodGates: boolean
  hasSpillways: boolean
  hasFloodplain: boolean
  isInundated: boolean
  leveeCount: number
  spillwayCount: number
}

export interface BankMeasure {
  isStable: boolean
  isEroding: boolean
  hasVegetation: boolean
  isReinforced: boolean
  erosionPoints: number
  vegetationDensity: number
}

export interface WaterChannel {
  file: string
  channelDepth: number
  flowRate: number
  sedimentLoad: number
  distributaryCount: number
  siltation: number
  floodControl: number
  channel: ChannelMeasure
  flow: FlowMeasure
  sediment: SedimentMeasure
  distributary: DistributaryMeasure
  flood: FloodMeasure
  bank: BankMeasure
  condition: ChannelCondition
  qualityScore: number
}

export interface DeltaRegion {
  directory: string
  channels: WaterChannel[]
  avgChannelDepth: number
  avgFlowRate: number
  avgSedimentLoad: number
  avgFloodControl: number
  navigableCount: number
  stagnantCount: number
  totalDistributaries: number
  regionType: RegionType
  condition: RegionCondition
}

export interface Basin {
  avgChannelDepth: number
  avgFlowRate: number
  avgSedimentLoad: number
  avgFloodControl: number
  totalDistributaries: number
  isNavigable: boolean
  overallFlow: number
}

export interface RiverDeltaStats {
  totalFiles: number
  totalRegions: number
  avgChannelDepth: number
  avgFlowRate: number
  avgSedimentLoad: number
  avgDistributaryCount: number
  avgSiltation: number
  avgFloodControl: number
  deepRiverCount: number
  clearStreamCount: number
  meanderingCount: number
  swampCount: number
  mudflatCount: number
  desertWashCount: number
  mainChannelCount: number
  distributaryCount: number
  tributaryCount: number
  backwaterCount: number
  navigableCount: number
  turbulentCount: number
  hasWaterfallCount: number
  hasDeadChannelsCount: number
  hasLeveesCount: number
  hasSpillwaysCount: number
  isInundatedCount: number
  isStableCount: number
  hasVegetationCount: number
  overallFlow: number
  hydrologistGrade: HydrologistGrade
  deepestChannel: string
  clearestFlow: string
  mostSilted: string
  bestFloodControl: string
  mostBranched: string
}

export interface RiverDeltaResult {
  channels: WaterChannel[]
  regions: DeltaRegion[]
  basin: Basin
  stats: RiverDeltaStats
  recommendations: string[]
}

// ─── Primitive Counters ──────────────────────────────────

export function countLoc(content: string): number {
  if (content.length === 0) return 0
  return content.split('\n').filter(l => l.trim().length > 0).length
}

export function countImports(content: string): number {
  const matches = content.match(/^import\s/gm)
  return matches ? matches.length : 0
}

export function countExports(content: string): number {
  const matches = content.match(/^export\s/gm)
  return matches ? matches.length : 0
}

export function countFunctions(content: string): number {
  const matches = content.match(/\bfunction\s+\w+|\b\w+\s*=\s*(?:async\s+)?(?:\([^)]*\)\s*=>|(?:async\s+)?\([^)]*\)\s*:\s*\w+)/g)
  return matches ? matches.length : 0
}

export function countClasses(content: string): number {
  const matches = content.match(/\bclass\s+\w+/g)
  return matches ? matches.length : 0
}

export function countErrorHandling(content: string): number {
  let count = 0
  const tryMatch = content.match(/\btry\s*\{/g)
  if (tryMatch) count += tryMatch.length
  const catchMatch = content.match(/\bcatch\s/g)
  if (catchMatch) count += catchMatch.length
  const throwMatch = content.match(/\bthrow\s/g)
  if (throwMatch) count += throwMatch.length
  return count
}

export function countTypeAnnotations(content: string): number {
  const matches = content.match(/:\s*(?:string|number|boolean|void|null|undefined|never|any|unknown|object|bigint|symbol)(?:\[\])?\b/g)
  return matches ? matches.length : 0
}

export function countBranches(content: string): number {
  let count = 0
  const ifMatch = content.match(/\bif\s*\(/g)
  if (ifMatch) count += ifMatch.length
  const elseMatch = content.match(/\belse\s/g)
  if (elseMatch) count += elseMatch.length
  const switchMatch = content.match(/\bswitch\s*\(/g)
  if (switchMatch) count += switchMatch.length
  return count
}

export function maxNesting(content: string): number {
  let maxDepth = 0
  let depth = 0
  for (const ch of content) {
    if (ch === '{') { depth++; if (depth > maxDepth) maxDepth = depth }
    if (ch === '}') { depth = Math.max(0, depth - 1) }
  }
  return maxDepth
}

export function countConsole(content: string): number {
  const matches = content.match(/\bconsole\.\w+/g)
  return matches ? matches.length : 0
}

export function countComments(content: string): number {
  let count = 0
  const singleMatch = content.match(/\/\/.*$/gm)
  if (singleMatch) count += singleMatch.length
  const blockMatch = content.match(/\/\*[\s\S]*?\*\//g)
  if (blockMatch) count += blockMatch.length
  return count
}

export function countTodos(content: string): number {
  const matches = content.match(/\bTODO\b|\bFIXME\b|\bHACK\b/gi)
  return matches ? matches.length : 0
}

export function countJSDoc(content: string): number {
  const matches = content.match(/\/\*\*[\s\S]*?\*\//g)
  return matches ? matches.length : 0
}

export function countDescriptiveNames(content: string): number {
  const matches = content.match(/\b(?:get|set|is|has|can|should|will|compute|calculate|validate|parse|format|transform|process|handle|build|create|generate|extract|resolve|initialize|configure|update|remove|delete|find|search|check|verify|ensure|assert)\w+/gi)
  return matches ? matches.length : 0
}

export function countValidations(content: string): number {
  const matches = content.match(/\b(typeof|instanceof|\.length\s*[><=!]|\bin\b|\!\s*\w|===|!==)/g)
  return matches ? matches.length : 0
}

// ─── Channel Measurement ─────────────────────────────────

/**
 * Measure channel properties
 * @example
 * measureChannel('export function calc() {}') // { type, depth, ... }
 */
export function measureChannel(content: string): ChannelMeasure {
  const loc = countLoc(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const functions = countFunctions(content)
  const types = countTypeAnnotations(content)
  const nesting = maxNesting(content)

  const depth = nesting
  const width = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (functions * 15) +
    (countClasses(content) * 10) +
    (exports * 5) +
    (imports * 5) +
    Math.min(loc / 5, 20),
  )))

  let type: ChannelType = 'dry-bed'
  if (exports > 0 && imports > 0 && types > 0) type = 'main-channel'
  else if (exports > 0 && imports > 0) type = 'distributary'
  else if (imports > 0 && exports === 0) type = 'tributary'
  else if (exports > 0 && imports === 0) type = 'backwater'
  else if (loc > 0) type = 'oxbow'

  const isNavigable = exports > 0 && (types > 0 || countJSDoc(content) > 0)
  const hasUndercurrent = countConsole(content) > 0 || /\.\w+\s*=\s*/.test(content)
  const hasWhirlpool = /\bwhile\s*\(true\)|for\s*\(;;\)/.test(content)
  const hasEddy = /\bfunction\s+\w+[^}]*\b\w+\s*\(/.test(content) && functions > 1

  let flowDirection: FlowDirection = 'stagnant'
  if (exports > 0 && imports > 0) flowDirection = 'downstream'
  else if (imports > 0 && exports === 0) flowDirection = 'upstream'
  else if (exports > 0) flowDirection = 'lateral'
  else if (loc > 0) flowDirection = 'tidal'

  return { type, depth, width, isNavigable, hasUndercurrent, hasWhirlpool, hasEddy, flowDirection }
}

// ─── Flow Measurement ────────────────────────────────────

/**
 * Measure flow rate properties
 * @example
 * measureFlow('if (x) { for (let i = 0; i < n; i++) {} }') // { rate, ... }
 */
export function measureFlow(content: string): FlowMeasure {
  const loc = countLoc(content)
  const branches = countBranches(content)
  const nesting = maxNesting(content)
  const functions = countFunctions(content)

  const rate = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (branches * 8) +
    (nesting * 10) +
    (countErrorHandling(content) * 5) +
    (functions * 5) +
    Math.min(loc / 10, 20),
  )))

  const isLaminar = rate < 30 && loc > 0
  const isTurbulent = rate > 60
  const isSteady = rate >= 30 && rate <= 60

  const waterfallPattern = /\belse\s+if\b/g
  const waterfallMatches = content.match(waterfallPattern)
  const waterfallCount = waterfallMatches ? waterfallMatches.length : 0
  const hasWaterfall = waterfallCount > 2

  const rapidCount = branches > 10 ? Math.floor(branches / 5) : 0
  const hasRapids = rapidCount > 0
  const hasPlungePool = nesting >= 4 && countErrorHandling(content) === 0

  return { rate, isSteady, isTurbulent, isLaminar, hasWaterfall, hasRapids, hasPlungePool, waterfallCount, rapidCount }
}

// ─── Sediment Measurement ────────────────────────────────

/**
 * Measure sediment/complexity properties
 * @example
 * measureSediment('function a(x) { if (x) { return b(c(d(e(f(x))))) } }') // { load, ... }
 */
export function measureSediment(content: string): SedimentMeasure {
  const loc = countLoc(content)
  const branches = countBranches(content)
  const nesting = maxNesting(content)
  const todos = countTodos(content)
  const consoleCount = countConsole(content)
  const types = countTypeAnnotations(content)
  const errors = countErrorHandling(content)

  const load = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (branches * 5) +
    (nesting * 8) +
    (functions_count(content) * 3) +
    Math.min(loc / 8, 20),
  )))

  const isSuspended = branches > 0 && errors === 0
  const isSettled = branches > 0 && types > 0 && errors > 0
  const hasBedLoad = nesting > 3
  const hasSilt = todos > 0 || consoleCount > 0
  const hasGravel = branches > 0 && types > 0
  const siltLevel = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (todos * 15) +
    (consoleCount * 10) +
    (nesting > 3 ? 15 : 0) +
    (errors === 0 && branches > 0 ? 10 : 0),
  )))

  return { load, isSuspended, isSettled, hasBedLoad, hasSilt, hasGravel, siltLevel }
}

function functions_count(content: string): number {
  return countFunctions(content)
}

// ─── Distributary Measurement ────────────────────────────

/**
 * Measure branch distribution properties
 * @example
 * measureDistributary('if (a) {} else if (b) {} else {}') // { count, ... }
 */
export function measureDistributary(content: string): DistributaryMeasure {
  const loc = countLoc(content)
  const branches = countBranches(content)
  const functions = countFunctions(content)

  const count = branches
  const hasDominantChannel = functions > 0 && functions > branches
  const hasBraidedChannels = branches > 5 && functions >= 3

  const deadChannelPattern = /\bif\s*\(\s*false\s*\)/g
  const deadMatches = content.match(deadChannelPattern)
  const deadChannelCount = deadMatches ? deadMatches.length : 0
  const hasDeadChannels = deadChannelCount > 0

  const isBalanced = loc === 0 ? true : branches > 0 && branches <= functions * 3
  const balanceScore = loc === 0 ? 100 : Math.min(100, Math.max(0, Math.round(
    (isBalanced ? 40 : 0) +
    (!hasDominantChannel ? 30 : 15) +
    (!hasDeadChannels ? 30 : 10),
  )))

  return { count, isBalanced, hasDominantChannel, hasDeadChannels, hasBraidedChannels, deadChannelCount, balanceScore }
}

// ─── Flood Measurement ───────────────────────────────────

/**
 * Measure flood control properties
 * @example
 * measureFlood('try { x } catch (e) { handle(e) }') // { control, ... }
 */
export function measureFlood(content: string): FloodMeasure {
  const loc = countLoc(content)
  const errors = countErrorHandling(content)
  const types = countTypeAnnotations(content)
  const validations = countValidations(content)
  const branches = countBranches(content)

  const control = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (errors > 0 ? 25 : 0) +
    (types > 0 ? 20 : 0) +
    (validations > 0 ? 20 : 0) +
    (errors >= 2 ? 15 : 0) +
    (branches > 0 && errors > 0 ? 10 : 0) +
    (countDescriptiveNames(content) > 0 ? 10 : 0),
  )))

  const hasLevees = /\btry\s*\{/.test(content)
  const hasFloodGates = /\binstanceof\s+\w+Error\b/.test(content) || (errors > 0 && types > 0)
  const hasSpillways = /\bcatch\s/.test(content)
  const hasFloodplain = errors >= 3
  const isInundated = branches > 5 && errors === 0

  const leveeMatches = content.match(/\btry\s*\{/g)
  const leveeCount = leveeMatches ? leveeMatches.length : 0

  const catchMatches = content.match(/\bcatch\s/g)
  const spillwayCount = catchMatches ? catchMatches.length : 0

  return { control, hasLevees, hasFloodGates, hasSpillways, hasFloodplain, isInundated, leveeCount, spillwayCount }
}

// ─── Bank Measurement ────────────────────────────────────

/**
 * Measure bank stability properties
 * @example
 * measureBank('export function calc(): number { return 1 }') // { isStable, ... }
 */
export function measureBank(content: string): BankMeasure {
  const loc = countLoc(content)
  const exports = countExports(content)
  const types = countTypeAnnotations(content)
  const errors = countErrorHandling(content)
  const jsdoc = countJSDoc(content)
  const comments = countComments(content)

  const isStable = exports > 0 && types > 0 && errors > 0
  const isEroding = todos_count(content) > 0 || (countConsole(content) > 0 && exports > 0)
  const hasVegetation = jsdoc > 0 || comments > 2
  const isReinforced = errors > 0 && exports > 0
  const erosionPoints = countTodos(content) + countConsole(content)
  const vegetationDensity = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (jsdoc * 15) +
    (comments > 0 ? 10 : 0) +
    (countDescriptiveNames(content) * 5) +
    Math.min(comments * 3, 20),
  )))

  return { isStable, isEroding, hasVegetation, isReinforced, erosionPoints, vegetationDensity }
}

function todos_count(content: string): number {
  return countTodos(content)
}

// ─── Classification ──────────────────────────────────────

export function classifyCondition(qualityScore: number): ChannelCondition {
  if (qualityScore >= 85) return 'deep-river'
  if (qualityScore >= 68) return 'clear-stream'
  if (qualityScore >= 50) return 'meandering-river'
  if (qualityScore >= 32) return 'swamp'
  if (qualityScore >= 15) return 'mudflat'
  return 'desert-wash'
}

export function classifyRegionType(channels: WaterChannel[]): RegionType {
  if (channels.length === 0) return 'saltpan'
  const avg = channels.reduce((s, c) => s + c.qualityScore, 0) / channels.length
  if (avg >= 80) return 'fertile-delta'
  if (avg >= 62) return 'estuary'
  if (avg >= 45) return 'floodplain'
  if (avg >= 28) return 'wetland'
  if (avg >= 12) return 'marsh'
  return 'saltpan'
}

export function classifyRegionCondition(channels: WaterChannel[]): RegionCondition {
  if (channels.length === 0) return 'arid'
  const avg = channels.reduce((s, c) => s + c.qualityScore, 0) / channels.length
  if (avg >= 80) return 'well-irrigated'
  if (avg >= 62) return 'productive'
  if (avg >= 45) return 'functional'
  if (avg >= 28) return 'swampy'
  if (avg >= 12) return 'flooded'
  return 'arid'
}

export function classifyHydrologistGrade(avgFlow: number): HydrologistGrade {
  if (avgFlow >= 80) return 'chief-hydrologist'
  if (avgFlow >= 65) return 'hydrologist'
  if (avgFlow >= 48) return 'engineer'
  if (avgFlow >= 32) return 'surveyor'
  if (avgFlow >= 16) return 'fisherman'
  return 'drifter'
}

// ─── Core Analysis ───────────────────────────────────────

/**
 * Analyze a single file as a water channel
 * @example
 * analyzeWaterChannel('export function calc() {}', 'calc.ts') // WaterChannel
 */
export function analyzeWaterChannel(content: string, filePath: string): WaterChannel {
  const channel = measureChannel(content)
  const flow = measureFlow(content)
  const sediment = measureSediment(content)
  const distributary = measureDistributary(content)
  const flood = measureFlood(content)
  const bank = measureBank(content)

  const loc = countLoc(content)
  const channelDepth = channel.depth
  const flowRate = flow.rate
  const sedimentLoad = sediment.load
  const distributaryCount = distributary.count
  const siltation = sediment.siltLevel
  const floodControl = flood.control

  const qualityScore = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (floodControl * 0.20) +
    (channel.isNavigable ? 15 : 0) +
    (Math.min(100, 100 - siltation) * 0.15) +
    (distributary.balanceScore * 0.15) +
    (bank.hasVegetation ? 10 : 0) +
    (bank.isStable ? 10 : 0) +
    (flow.isSteady || flow.isLaminar ? 10 : 0) +
    (sediment.isSettled ? 5 : 0),
  )))

  const condition = classifyCondition(qualityScore)

  return {
    file: filePath,
    channelDepth, flowRate, sedimentLoad, distributaryCount, siltation, floodControl,
    channel, flow, sediment, distributary, flood, bank,
    condition, qualityScore,
  }
}

// ─── Delta Region ────────────────────────────────────────

/**
 * Analyze a directory as a delta region
 * @example
 * analyzeDeltaRegion(channels, 'src') // DeltaRegion
 */
export function analyzeDeltaRegion(channels: WaterChannel[], dirPath: string): DeltaRegion {
  const avgChannelDepth = channels.length === 0 ? 0 : Math.round(channels.reduce((s, c) => s + c.channelDepth, 0) / channels.length)
  const avgFlowRate = channels.length === 0 ? 0 : Math.round(channels.reduce((s, c) => s + c.flowRate, 0) / channels.length)
  const avgSedimentLoad = channels.length === 0 ? 0 : Math.round(channels.reduce((s, c) => s + c.sedimentLoad, 0) / channels.length)
  const avgFloodControl = channels.length === 0 ? 0 : Math.round(channels.reduce((s, c) => s + c.floodControl, 0) / channels.length)
  const navigableCount = channels.filter(c => c.channel.isNavigable).length
  const stagnantCount = channels.filter(c => c.channel.flowDirection === 'stagnant').length
  const totalDistributaries = channels.reduce((s, c) => s + c.distributaryCount, 0)

  return {
    directory: dirPath, channels,
    avgChannelDepth, avgFlowRate, avgSedimentLoad, avgFloodControl,
    navigableCount, stagnantCount, totalDistributaries,
    regionType: classifyRegionType(channels),
    condition: classifyRegionCondition(channels),
  }
}

// ─── Recommendations ─────────────────────────────────────

/**
 * Generate actionable recommendations
 * @example
 * generateRecommendations(channels, regions, basin, stats) // string[]
 */
export function generateRecommendations(
  channels: WaterChannel[],
  regions: DeltaRegion[],
  basin: Basin,
  stats: RiverDeltaStats,
): string[] {
  const recs: string[] = []

  if (stats.desertWashCount + stats.mudflatCount > 0) {
    recs.push(`Dry channels: ${stats.desertWashCount + stats.mudflatCount} file(s) need water flow with exports and error handling`)
  }
  if (stats.isInundatedCount > 0) {
    recs.push(`Flooded code: ${stats.isInundatedCount} file(s) have branches without error handling`)
  }
  if (stats.hasLeveesCount === 0 && stats.totalFiles > 0) {
    recs.push('No levees detected - add try/catch to contain error floods')
  }
  if (stats.turbulentCount > stats.totalFiles * 0.5) {
    recs.push('High turbulence - reduce branching complexity to calm the flow')
  }
  if (stats.hasDeadChannelsCount > 0) {
    recs.push(`Dead channels: ${stats.hasDeadChannelsCount} file(s) contain unreachable code`)
  }
  if (basin.overallFlow >= 70) {
    recs.push('Healthy river system - good flow distribution and flood control')
  }
  if (stats.hasVegetationCount > stats.totalFiles * 0.5) {
    recs.push('Well-documented banks - vegetation provides good code coverage')
  }
  if (regions.length > 1) {
    const aridRegions = regions.filter(r => r.regionType === 'marsh' || r.regionType === 'saltpan')
    if (aridRegions.length > 0) {
      recs.push(`Arid regions: ${aridRegions.map(r => r.directory).join(', ')} need irrigation`)
    }
  }

  return Array.from(new Set(recs))
}

// ─── Build Result ────────────────────────────────────────

/**
 * Build the complete river-delta result
 * @example
 * buildRiverDeltaResult(['a.ts'], ['export function a() {}'], {}) // RiverDeltaResult
 */
export function buildRiverDeltaResult(files: string[], contents: string[], _options: Record<string, unknown>): RiverDeltaResult {
  const channels: WaterChannel[] = files.map((file, i) => {
    const content = i < contents.length ? contents[i] : ''
    return analyzeWaterChannel(content, file)
  })

  const dirMap = new Map<string, WaterChannel[]>()
  for (const ch of channels) {
    const parts = ch.file.split('/')
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
    const existing = dirMap.get(dir)
    if (existing) { existing.push(ch) } else { dirMap.set(dir, [ch]) }
  }

  const regions = Array.from(dirMap.entries()).map(([dir, dirChannels]) =>
    analyzeDeltaRegion(dirChannels, dir),
  )

  const totalFiles = channels.length
  const avgChannelDepth = totalFiles === 0 ? 0 : Math.round(channels.reduce((s, c) => s + c.channelDepth, 0) / totalFiles)
  const avgFlowRate = totalFiles === 0 ? 0 : Math.round(channels.reduce((s, c) => s + c.flowRate, 0) / totalFiles)
  const avgSedimentLoad = totalFiles === 0 ? 0 : Math.round(channels.reduce((s, c) => s + c.sedimentLoad, 0) / totalFiles)
  const avgDistributaryCount = totalFiles === 0 ? 0 : Math.round(channels.reduce((s, c) => s + c.distributaryCount, 0) / totalFiles)
  const avgSiltation = totalFiles === 0 ? 0 : Math.round(channels.reduce((s, c) => s + c.siltation, 0) / totalFiles)
  const avgFloodControl = totalFiles === 0 ? 0 : Math.round(channels.reduce((s, c) => s + c.floodControl, 0) / totalFiles)
  const overallFlow = totalFiles === 0 ? 0 : Math.round(channels.reduce((s, c) => s + c.qualityScore, 0) / totalFiles)
  const totalDistributaries = channels.reduce((s, c) => s + c.distributaryCount, 0)

  const basin: Basin = {
    avgChannelDepth,
    avgFlowRate,
    avgSedimentLoad,
    avgFloodControl,
    totalDistributaries,
    isNavigable: overallFlow >= 60,
    overallFlow,
  }

  const conditionCounts = { deepRiver: 0, clearStream: 0, meandering: 0, swamp: 0, mudflat: 0, desertWash: 0 }
  const channelTypeCounts = { mainChannel: 0, distributary: 0, tributary: 0, backwater: 0, oxbow: 0, dryBed: 0 }

  for (const ch of channels) {
    switch (ch.condition) {
      case 'deep-river': conditionCounts.deepRiver++; break
      case 'clear-stream': conditionCounts.clearStream++; break
      case 'meandering-river': conditionCounts.meandering++; break
      case 'swamp': conditionCounts.swamp++; break
      case 'mudflat': conditionCounts.mudflat++; break
      case 'desert-wash': conditionCounts.desertWash++; break
    }
    switch (ch.channel.type) {
      case 'main-channel': channelTypeCounts.mainChannel++; break
      case 'distributary': channelTypeCounts.distributary++; break
      case 'tributary': channelTypeCounts.tributary++; break
      case 'backwater': channelTypeCounts.backwater++; break
      case 'oxbow': channelTypeCounts.oxbow++; break
      case 'dry-bed': channelTypeCounts.dryBed++; break
    }
  }

  const deepestChannel = totalFiles === 0 ? 'none' : channels.reduce((best, c) => c.channelDepth > best.channelDepth ? c : best).file
  const clearestFlow = totalFiles === 0 ? 'none' : channels.reduce((best, c) => c.flowRate < best.flowRate || (c.flowRate === best.flowRate && c.qualityScore > best.qualityScore) ? c : best).file
  const mostSilted = totalFiles === 0 ? 'none' : channels.reduce((worst, c) => c.siltation > worst.siltation ? c : worst).file
  const bestFloodControl = totalFiles === 0 ? 'none' : channels.reduce((best, c) => c.floodControl > best.floodControl ? c : best).file
  const mostBranched = totalFiles === 0 ? 'none' : channels.reduce((best, c) => c.distributaryCount > best.distributaryCount ? c : best).file

  const stats: RiverDeltaStats = {
    totalFiles,
    totalRegions: regions.length,
    avgChannelDepth,
    avgFlowRate,
    avgSedimentLoad,
    avgDistributaryCount,
    avgSiltation,
    avgFloodControl,
    deepRiverCount: conditionCounts.deepRiver,
    clearStreamCount: conditionCounts.clearStream,
    meanderingCount: conditionCounts.meandering,
    swampCount: conditionCounts.swamp,
    mudflatCount: conditionCounts.mudflat,
    desertWashCount: conditionCounts.desertWash,
    mainChannelCount: channelTypeCounts.mainChannel,
    distributaryCount: channelTypeCounts.distributary,
    tributaryCount: channelTypeCounts.tributary,
    backwaterCount: channelTypeCounts.backwater,
    navigableCount: channels.filter(c => c.channel.isNavigable).length,
    turbulentCount: channels.filter(c => c.flow.isTurbulent).length,
    hasWaterfallCount: channels.filter(c => c.flow.hasWaterfall).length,
    hasDeadChannelsCount: channels.filter(c => c.distributary.hasDeadChannels).length,
    hasLeveesCount: channels.filter(c => c.flood.hasLevees).length,
    hasSpillwaysCount: channels.filter(c => c.flood.hasSpillways).length,
    isInundatedCount: channels.filter(c => c.flood.isInundated).length,
    isStableCount: channels.filter(c => c.bank.isStable).length,
    hasVegetationCount: channels.filter(c => c.bank.hasVegetation).length,
    overallFlow,
    hydrologistGrade: classifyHydrologistGrade(overallFlow),
    deepestChannel,
    clearestFlow,
    mostSilted,
    bestFloodControl,
    mostBranched,
  }

  const recommendations = generateRecommendations(channels, regions, basin, stats)

  return { channels, regions, basin, stats, recommendations }
}
