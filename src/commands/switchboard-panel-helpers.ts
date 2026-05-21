// ─── Interfaces ──────────────────────────────────────────

export interface SwitchboardMeasure {
  type: 'crossbar' | 'step-by-step' | 'panel' | 'cordless' | 'digital' | 'broken'
  capacity: number
  hasBusytone: boolean
  hasDialtone: boolean
  hasRingback: boolean
  hasDeadAir: boolean
  hasCrossTalk: boolean
  deadAirCount: number
  crossTalkCount: number
}

export interface ConnectionsMeasure {
  total: number
  active: number
  dead: number
  hasCleanRouting: boolean
  hasTangledWires: boolean
  hasCrossedLines: boolean
  hasDeadEnds: boolean
  deadEndCount: number
  crossedCount: number
  tangledCount: number
}

export interface WiresMeasure {
  organization: number
  hasColorCoding: boolean
  hasLabeling: boolean
  hasTrunk: boolean
  hasBranch: boolean
  hasPatch: boolean
  hasSplice: boolean
  trunkCount: number
  branchCount: number
  patchCount: number
}

export interface OperatorMeasure {
  efficiency: number
  hasSkilledOperators: boolean
  hasTrainees: boolean
  hasOverworked: boolean
  hasAbsent: boolean
  hasClumsy: boolean
  hasSpeedDial: boolean
  overworkedCount: number
  absentCount: number
}

export interface LinesMeasure {
  utilization: number
  hasPartyLines: boolean
  hasPrivateLines: boolean
  hasTollFree: boolean
  hasLongDistance: boolean
  hasLocal: boolean
  hasEmergency: boolean
  totalLines: number
  usedLines: number
  unusedLines: number
}

export interface PanelMeasure {
  layout: number
  isOrganized: boolean
  hasJackFields: boolean
  hasCordCircuits: boolean
  hasSupervisor: boolean
  hasDistributionFrame: boolean
  isOverloaded: boolean
  jackCount: number
}

export interface SwitchLine {
  file: string
  connectionQuality: number
  switchCapacity: number
  wireOrganization: number
  operatorEfficiency: number
  lineUtilization: number
  panelLayout: number
  switchboard: SwitchboardMeasure
  connections: ConnectionsMeasure
  wires: WiresMeasure
  operator: OperatorMeasure
  lines: LinesMeasure
  panel: PanelMeasure
  condition: 'digital-exchange' | 'modern-switchboard' | 'reliable-panel' | 'manual-exchange' | 'faulty-wiring' | 'dead-network'
  qualityScore: number
}

export interface ExchangeOffice {
  directory: string
  lines: SwitchLine[]
  avgConnectionQuality: number
  avgSwitchCapacity: number
  avgWireOrganization: number
  digitalCount: number
  deadCount: number
  cleanRoutingCount: number
  tangledCount: number
  officeType: 'central-office' | 'branch-exchange' | 'private-branch' | 'relay-station' | 'junction' | 'dead-end'
  condition: 'premium-service' | 'reliable-service' | 'standard-service' | 'basic-service' | 'intermittent' | 'disconnected'
}

export interface NetworkMeasure {
  avgConnectionQuality: number
  avgSwitchCapacity: number
  avgWireOrganization: number
  isWellConnected: boolean
  overallConnectivity: number
}

export interface SwitchboardPanelStats {
  totalFiles: number
  totalOffices: number
  avgConnectionQuality: number
  avgSwitchCapacity: number
  avgWireOrganization: number
  avgOperatorEfficiency: number
  avgLineUtilization: number
  avgPanelLayout: number
  digitalExchangeCount: number
  modernSwitchboardCount: number
  reliablePanelCount: number
  manualExchangeCount: number
  faultyWiringCount: number
  deadNetworkCount: number
  crossbarCount: number
  digitalCount: number
  brokenCount: number
  hasDeadAirCount: number
  hasCrossTalkCount: number
  hasCleanRoutingCount: number
  hasTangledWiresCount: number
  hasDeadEndsCount: number
  hasSpeedDialCount: number
  overworkedCount: number
  absentCount: number
  isOrganizedCount: number
  isOverloadedCount: number
  overallConnectivity: number
  operatorGrade: 'chief-operator' | 'senior-operator' | 'operator' | 'apprentice' | 'trainee' | 'caller'
  bestConnected: string
  cleanestWiring: string
  mostEfficient: string
  mostUtilized: string
  bestOrganized: string
}

export interface SwitchboardPanelResult {
  lines: SwitchLine[]
  offices: ExchangeOffice[]
  network: NetworkMeasure
  stats: SwitchboardPanelStats
  recommendations: string[]
}

// ─── Utility helpers ────────────────────────────────────

export function countLoc(content: string): number {
  return content.split('\n').filter(l => l.trim().length > 0).length
}

export function countFunctions(content: string): number {
  const m = content.match(/\bfunction\s+\w+|\b\w+\s*=\s*(?:async\s+)?(?:\([^)]*\)\s*=>|(?:async\s+)?\([^)]*\)\s*:\s*\w+)/g)
  return m ? m.length : 0
}

export function countClasses(content: string): number {
  const m = content.match(/\bclass\s+\w+/g)
  return m ? m.length : 0
}

export function countInterfaces(content: string): number {
  const m = content.match(/\binterface\s+\w+/g)
  return m ? m.length : 0
}

export function countExports(content: string): number {
  const m = content.match(/^export\s/gm)
  return m ? m.length : 0
}

export function countImports(content: string): number {
  const m = content.match(/^import\s/gm)
  return m ? m.length : 0
}

export function countJSDoc(content: string): number {
  const m = content.match(/\/\*\*[\s\S]*?\*\//g)
  return m ? m.length : 0
}

export function countComments(content: string): number {
  const line = (content.match(/\/\/.*/g) || []).length
  const block = (content.match(/\/\*[\s\S]*?\*\//g) || []).length
  return line + block
}

export function countErrorHandling(content: string): number {
  const m = content.match(/\b(catch|finally|throw)\b/g)
  return m ? m.length : 0
}

export function countTypeAnnotations(content: string): number {
  const m = content.match(/:\s*(?:number|string|boolean|void|any|unknown|never|object)\b/g)
  return m ? m.length : 0
}

export function countTodos(content: string): number {
  const m = content.match(/\bTODO\b/gi)
  return m ? m.length : 0
}

export function countConsole(content: string): number {
  const m = content.match(/\bconsole\.\w+/g)
  return m ? m.length : 0
}

export function countBranches(content: string): number {
  const ifs = (content.match(/\bif\b/g) || []).length
  const switches = (content.match(/\bswitch\b/g) || []).length
  const ternaries = (content.match(/\?[^:]*:/g) || []).length
  return ifs + switches + ternaries
}

export function countDescriptiveNames(content: string): number {
  const m = content.match(/\b(?:get|set|is|has|can|should|will|compute|calculate|validate|parse|format|transform|process|handle|build|create|generate|extract|resolve|initialize|configure|update|remove|delete|find|search|check|verify|ensure|assert)\w+/gi)
  return m ? m.length : 0
}

export function countAsync(content: string): number {
  const m = content.match(/\basync\b/g)
  return m ? m.length : 0
}

export function countAny(content: string): number {
  const m = content.match(/:\s*any\b/g)
  return m ? m.length : 0
}

export function countReturnTypes(content: string): number {
  const m = content.match(/\)\s*:\s*\w+/g)
  return m ? m.length : 0
}

export function countNestingDepth(content: string): number {
  let maxDepth = 0
  let currentDepth = 0
  for (const ch of content) {
    if (ch === '{' || ch === '(' || ch === '[') {
      currentDepth++
      if (currentDepth > maxDepth) maxDepth = currentDepth
    } else if (ch === '}' || ch === ')' || ch === ']') {
      currentDepth = Math.max(0, currentDepth - 1)
    }
  }
  return maxDepth
}

export function countDefaultCases(content: string): number {
  const m = content.match(/\bdefault\s*:/g)
  return m ? m.length : 0
}

export function countReturns(content: string): number {
  const m = content.match(/\breturn\b/g)
  return m ? m.length : 0
}

// ─── Switchboard Measurement ────────────────────────────

/**
 * Measure routing capability like a telephone switchboard
 * @example
 * measureSwitchboard(codeString) // { type, capacity, hasBusytone, ... }
 */
export function measureSwitchboard(content: string): SwitchboardMeasure {
  const loc = countLoc(content)
  const functions = countFunctions(content)
  const classes = countClasses(content)
  const branches = countBranches(content)
  const errors = countErrorHandling(content)
  const imports = countImports(content)
  const exports = countExports(content)

  const capacity = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (functions > 0 ? 15 : 0) +
    (classes > 0 ? 15 : 0) +
    (branches > 0 ? 10 : 0) +
    (errors > 0 ? 15 : 0) +
    (imports > 0 ? 10 : 0) +
    (exports > 0 ? 10 : 0) +
    (countJSDoc(content) > 0 ? 10 : 0) +
    (countTypeAnnotations(content) > 0 ? 15 : 0),
  )))

  const hasBusytone = errors > 0
  const hasDialtone = functions > 0 || classes > 0
  const hasRingback = countReturnTypes(content) > 0
  const deadAirCount = countTodos(content) + countConsole(content)
  const hasDeadAir = deadAirCount > 0

  const anys = countAny(content)
  const crossTalkCount = anys + (countNestingDepth(content) > 5 ? 1 : 0)
  const hasCrossTalk = crossTalkCount > 0

  let type: SwitchboardMeasure['type'] = 'broken'
  if (capacity >= 70 && errors > 0 && branches > 3) type = 'digital'
  else if (capacity >= 55 && exports > 0) type = 'crossbar'
  else if (capacity >= 40 && functions > 0) type = 'step-by-step'
  else if (capacity >= 25) type = 'panel'
  else if (capacity >= 10) type = 'cordless'
  else type = 'broken'

  return {
    type,
    capacity,
    hasBusytone,
    hasDialtone,
    hasRingback,
    hasDeadAir,
    hasCrossTalk,
    deadAirCount,
    crossTalkCount,
  }
}

// ─── Connections Measurement ─────────────────────────────

/**
 * Measure code path connectivity
 * @example
 * measureConnections(codeString) // { total, active, dead, ... }
 */
export function measureConnections(content: string): ConnectionsMeasure {
  const loc = countLoc(content)
  const functions = countFunctions(content)
  const classes = countClasses(content)
  const exports = countExports(content)
  const branches = countBranches(content)
  const errors = countErrorHandling(content)
  const returns = countReturns(content)

  const total = functions + classes + branches
  const active = exports + returns
  const dead = Math.max(0, total - active)

  const deadEndCount = countTodos(content) + Math.max(0, branches - errors)
  const crossedCount = countAny(content) + countConsole(content)
  const tangledCount = Math.max(0, countNestingDepth(content) - 3)

  const hasCleanRouting = loc === 0 ? false : errors > 0 && exports > 0 && countJSDoc(content) > 0
  const hasTangledWires = tangledCount > 0
  const hasCrossedLines = crossedCount > 0
  const hasDeadEnds = deadEndCount > 0

  return {
    total,
    active,
    dead,
    hasCleanRouting,
    hasTangledWires,
    hasCrossedLines,
    hasDeadEnds,
    deadEndCount,
    crossedCount,
    tangledCount,
  }
}

// ─── Wires Measurement ──────────────────────────────────

/**
 * Measure code path clarity like wire organization
 * @example
 * measureWires(codeString) // { organization, hasColorCoding, ... }
 */
export function measureWires(content: string): WiresMeasure {
  const loc = countLoc(content)
  const types = countTypeAnnotations(content)
  const jsdoc = countJSDoc(content)
  const comments = countComments(content)
  const exports = countExports(content)
  const descriptive = countDescriptiveNames(content)

  const organization = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (types > 0 ? 20 : 0) +
    (jsdoc > 0 ? 20 : 0) +
    (exports > 0 ? 15 : 0) +
    (descriptive > 0 ? 15 : 0) +
    (comments > 0 ? 10 : 0) +
    (countInterfaces(content) > 0 ? 10 : 0) +
    (countReturnTypes(content) > 0 ? 10 : 0),
  )))

  const hasColorCoding = types > 0
  const hasLabeling = jsdoc > 0 || comments > 0
  const trunkCount = exports
  const branchCount = countBranches(content)
  const patchCount = countTodos(content) + countConsole(content)

  const hasTrunk = trunkCount > 0
  const hasBranch = branchCount > 0
  const hasPatch = patchCount > 0
  const hasSplice = countAsync(content) > 0 && countImports(content) > 0

  return {
    organization,
    hasColorCoding,
    hasLabeling,
    hasTrunk,
    hasBranch,
    hasPatch,
    hasSplice,
    trunkCount,
    branchCount,
    patchCount,
  }
}

// ─── Operator Measurement ───────────────────────────────

/**
 * Measure handler performance like operator efficiency
 * @example
 * measureOperator(codeString) // { efficiency, hasSkilledOperators, ... }
 */
export function measureOperator(content: string): OperatorMeasure {
  const loc = countLoc(content)
  const functions = countFunctions(content)
  const classes = countClasses(content)
  const errors = countErrorHandling(content)
  const jsdoc = countJSDoc(content)
  const types = countTypeAnnotations(content)
  const asyncs = countAsync(content)
  const branches = countBranches(content)

  const efficiency = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (errors > 0 ? 20 : 0) +
    (jsdoc > 0 ? 15 : 0) +
    (types > 0 ? 15 : 0) +
    (functions > 0 ? 10 : 0) +
    (classes > 0 ? 10 : 0) +
    (countReturnTypes(content) > 0 ? 10 : 0) +
    (countDescriptiveNames(content) > 0 ? 10 : 0) +
    (countTodos(content) === 0 ? 10 : 0),
  )))

  const overworkedCount = Math.max(0, Math.floor(branches / 5))
  const absentCount = countDefaultCases(content) === 0 && countAny(content) > 0 ? 1 : 0

  const hasSkilledOperators = efficiency >= 60 && errors > 0
  const hasTrainees = functions > 0 && jsdoc === 0 && loc > 5
  const hasOverworked = overworkedCount > 0
  const hasAbsent = functions === 0 && classes === 0 && loc > 0
  const hasClumsy = countAny(content) > 0 || countNestingDepth(content) > 5
  const hasSpeedDial = asyncs > 0 && types > 0

  return {
    efficiency,
    hasSkilledOperators,
    hasTrainees,
    hasOverworked,
    hasAbsent,
    hasClumsy,
    hasSpeedDial,
    overworkedCount,
    absentCount,
  }
}

// ─── Lines Measurement ──────────────────────────────────

/**
 * Measure code path usage like line utilization
 * @example
 * measureLines(codeString) // { utilization, hasPartyLines, ... }
 */
export function measureLines(content: string): LinesMeasure {
  const loc = countLoc(content)
  const functions = countFunctions(content)
  const classes = countClasses(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const interfaces = countInterfaces(content)

  const totalLines = functions + classes + interfaces + countBranches(content)
  const usedLines = exports + imports
  const unusedLines = Math.max(0, totalLines - usedLines)

  const utilization = totalLines === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (usedLines / totalLines) * 60 +
    (exports > 0 ? 20 : 0) +
    (imports > 0 ? 20 : 0),
  )))

  const hasPartyLines = imports > 1 && exports > 1
  const hasPrivateLines = functions > 0 && exports === 0
  const hasTollFree = exports > 0 && countJSDoc(content) > 0
  const hasLongDistance = imports > 0 && countAsync(content) > 0
  const hasLocal = functions > 0 && imports === 0
  const hasEmergency = countErrorHandling(content) > 0

  return {
    utilization,
    hasPartyLines,
    hasPrivateLines,
    hasTollFree,
    hasLongDistance,
    hasLocal,
    hasEmergency,
    totalLines,
    usedLines,
    unusedLines,
  }
}

// ─── Panel Measurement ──────────────────────────────────

/**
 * Measure routing organization like panel layout
 * @example
 * measurePanel(codeString) // { layout, isOrganized, ... }
 */
export function measurePanel(content: string): PanelMeasure {
  const loc = countLoc(content)
  const exports = countExports(content)
  const interfaces = countInterfaces(content)
  const types = countTypeAnnotations(content)
  const jsdoc = countJSDoc(content)
  const errors = countErrorHandling(content)

  const layout = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (exports > 0 ? 15 : 0) +
    (interfaces > 0 ? 15 : 0) +
    (types > 0 ? 15 : 0) +
    (jsdoc > 0 ? 15 : 0) +
    (errors > 0 ? 10 : 0) +
    (countDescriptiveNames(content) > 0 ? 10 : 0) +
    (countImports(content) > 0 ? 10 : 0) +
    (countNestingDepth(content) <= 4 ? 10 : 0),
  )))

  const jackCount = interfaces + countClasses(content) + countFunctions(content)

  const isOrganized = layout >= 60
  const hasJackFields = interfaces > 0 || countClasses(content) > 0
  const hasCordCircuits = countFunctions(content) > 0 || countAsync(content) > 0
  const hasSupervisor = errors > 0
  const hasDistributionFrame = exports > 0 && countImports(content) > 0
  const isOverloaded = countNestingDepth(content) > 5 || countBranches(content) > 10

  return {
    layout,
    isOrganized,
    hasJackFields,
    hasCordCircuits,
    hasSupervisor,
    hasDistributionFrame,
    isOverloaded,
    jackCount,
  }
}

// ─── SwitchLine Analysis ────────────────────────────────

/**
 * Analyze a single file as a switch line
 * @example
 * analyzeSwitchLine(content, filePath) // SwitchLine
 */
export function analyzeSwitchLine(content: string, filePath: string): SwitchLine {
  const switchboard = measureSwitchboard(content)
  const connections = measureConnections(content)
  const wires = measureWires(content)
  const operator = measureOperator(content)
  const lines = measureLines(content)
  const panel = measurePanel(content)

  const connectionQuality = wires.organization
  const switchCapacity = switchboard.capacity
  const wireOrganization = wires.organization
  const operatorEfficiency = operator.efficiency
  const lineUtilization = lines.utilization
  const panelLayout = panel.layout

  const qualityScore = Math.min(100, Math.max(0, Math.round(
    (connectionQuality * 0.2) +
    (switchCapacity * 0.2) +
    (wireOrganization * 0.15) +
    (operatorEfficiency * 0.2) +
    (lineUtilization * 0.1) +
    (panelLayout * 0.15),
  )))

  const condition = classifyLineCondition(qualityScore, switchboard, connections)

  return {
    file: filePath,
    connectionQuality,
    switchCapacity,
    wireOrganization,
    operatorEfficiency,
    lineUtilization,
    panelLayout,
    switchboard,
    connections,
    wires,
    operator,
    lines,
    panel,
    condition,
    qualityScore,
  }
}

/**
 * Classify line condition based on quality
 * @example
 * classifyLineCondition(90, switchboard, connections) // 'digital-exchange'
 */
export function classifyLineCondition(
  score: number,
  switchboard: SwitchboardMeasure,
  connections: ConnectionsMeasure,
): SwitchLine['condition'] {
  if (score >= 80 && switchboard.type === 'digital') return 'digital-exchange'
  if (score >= 65 && connections.hasCleanRouting) return 'modern-switchboard'
  if (score >= 50) return 'reliable-panel'
  if (score >= 30 && !connections.hasTangledWires) return 'manual-exchange'
  if (score >= 15) return 'faulty-wiring'
  return 'dead-network'
}

// ─── ExchangeOffice Analysis ────────────────────────────

/**
 * Analyze a directory as exchange office
 * @example
 * analyzeExchangeOffice(lines, dirPath) // ExchangeOffice
 */
export function analyzeExchangeOffice(switchLines: SwitchLine[], dirPath: string): ExchangeOffice {
  const count = switchLines.length
  if (count === 0) {
    return {
      directory: dirPath,
      lines: [],
      avgConnectionQuality: 0,
      avgSwitchCapacity: 0,
      avgWireOrganization: 0,
      digitalCount: 0,
      deadCount: 0,
      cleanRoutingCount: 0,
      tangledCount: 0,
      officeType: 'dead-end',
      condition: 'disconnected',
    }
  }

  const avg = (fn: (l: SwitchLine) => number) =>
    Math.round(switchLines.reduce((s, l) => s + fn(l), 0) / count)

  const avgConnectionQuality = avg(l => l.connectionQuality)
  const avgSwitchCapacity = avg(l => l.switchCapacity)
  const avgWireOrganization = avg(l => l.wireOrganization)

  const digitalCount = switchLines.filter(l => l.condition === 'digital-exchange').length
  const deadCount = switchLines.filter(l => l.condition === 'dead-network').length
  const cleanRoutingCount = switchLines.filter(l => l.connections.hasCleanRouting).length
  const tangledCount = switchLines.filter(l => l.connections.hasTangledWires).length

  const officeType = classifyOfficeType(switchLines)
  const condition = classifyOfficeCondition(avgConnectionQuality)

  return {
    directory: dirPath,
    lines: switchLines,
    avgConnectionQuality,
    avgSwitchCapacity,
    avgWireOrganization,
    digitalCount,
    deadCount,
    cleanRoutingCount,
    tangledCount,
    officeType,
    condition,
  }
}

/**
 * Classify exchange office type
 * @example
 * classifyOfficeType(lines) // 'central-office'
 */
export function classifyOfficeType(switchLines: SwitchLine[]): ExchangeOffice['officeType'] {
  if (switchLines.length === 0) return 'dead-end'
  const digitalRatio = switchLines.filter(l => l.condition === 'digital-exchange').length / switchLines.length
  const avgCapacity = switchLines.reduce((s, l) => s + l.switchCapacity, 0) / switchLines.length

  if (digitalRatio >= 0.5 && avgCapacity >= 60) return 'central-office'
  if (avgCapacity >= 50) return 'branch-exchange'
  if (avgCapacity >= 35) return 'private-branch'
  if (avgCapacity >= 20) return 'relay-station'
  if (avgCapacity >= 10) return 'junction'
  return 'dead-end'
}

/**
 * Classify office condition based on connection quality
 * @example
 * classifyOfficeCondition(80) // 'premium-service'
 */
export function classifyOfficeCondition(avgQuality: number): ExchangeOffice['condition'] {
  if (avgQuality >= 75) return 'premium-service'
  if (avgQuality >= 60) return 'reliable-service'
  if (avgQuality >= 45) return 'standard-service'
  if (avgQuality >= 30) return 'basic-service'
  if (avgQuality >= 15) return 'intermittent'
  return 'disconnected'
}

// ─── Operator Grade ─────────────────────────────────────

/**
 * Classify operator grade based on connectivity
 * @example
 * classifyOperatorGrade(85) // 'chief-operator'
 */
export function classifyOperatorGrade(avgConnectivity: number): SwitchboardPanelStats['operatorGrade'] {
  if (avgConnectivity >= 80) return 'chief-operator'
  if (avgConnectivity >= 65) return 'senior-operator'
  if (avgConnectivity >= 50) return 'operator'
  if (avgConnectivity >= 35) return 'apprentice'
  if (avgConnectivity >= 20) return 'trainee'
  return 'caller'
}

// ─── Recommendations ────────────────────────────────────

/**
 * Generate recommendations for the switchboard
 * @example
 * generateRecommendations(lines, offices, network, stats) // ['Add error handling...']
 */
export function generateRecommendations(
  _lines: SwitchLine[],
  _offices: ExchangeOffice[],
  _network: NetworkMeasure,
  stats: SwitchboardPanelStats,
): string[] {
  const recs: string[] = []

  if (stats.deadNetworkCount > 0) {
    recs.push('Restore dead network lines: add exports, types, and documentation')
  }
  if (stats.avgWireOrganization < 40) {
    recs.push('Organize wiring: add type annotations and JSDoc to clarify routing')
  }
  if (stats.hasTangledWiresCount > stats.totalFiles * 0.3) {
    recs.push('Untangle wires: reduce nesting depth to simplify code paths')
  }
  if (stats.overworkedCount > stats.totalFiles * 0.3) {
    recs.push('Reduce operator load: break down functions with too many branches')
  }
  if (stats.absentCount > 0) {
    recs.push('Staff the switchboard: ensure all modules have handlers')
  }
  if (stats.hasDeadEndsCount > stats.totalFiles * 0.3) {
    recs.push('Eliminate dead ends: add error handling for unhandled paths')
  }
  if (stats.isOverloadedCount > 0) {
    recs.push('Reduce panel overload: refactor deeply nested routing logic')
  }

  if (recs.length === 0) {
    recs.push('Maintain current switchboard standards for reliable service')
  }

  return recs
}

// ─── Orchestrator ───────────────────────────────────────

/**
 * Build the full switchboard panel result
 * @example
 * buildSwitchboardPanelResult(files, contents, {}) // SwitchboardPanelResult
 */
export function buildSwitchboardPanelResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown> = {},
): SwitchboardPanelResult {
  const lines: SwitchLine[] = files.map((file, i) =>
    analyzeSwitchLine(contents[i] ?? '', file),
  )

  const officeMap = new Map<string, SwitchLine[]>()
  for (const line of lines) {
    const dir = line.file.includes('/') ? line.file.substring(0, line.file.lastIndexOf('/')) : '.'
    const existing = officeMap.get(dir)
    if (existing) {
      existing.push(line)
    } else {
      officeMap.set(dir, [line])
    }
  }

  const offices: ExchangeOffice[] = Array.from(officeMap.entries()).map(([dir, dirLines]) =>
    analyzeExchangeOffice(dirLines, dir),
  )

  const totalFiles = lines.length
  const avg = (fn: (l: SwitchLine) => number) =>
    totalFiles === 0 ? 0 : Math.round(lines.reduce((s, l) => s + fn(l), 0) / totalFiles)

  const overallConnectivity = avg(l => l.qualityScore)

  const network: NetworkMeasure = {
    avgConnectionQuality: avg(l => l.connectionQuality),
    avgSwitchCapacity: avg(l => l.switchCapacity),
    avgWireOrganization: avg(l => l.wireOrganization),
    isWellConnected: avg(l => l.connectionQuality) >= 60,
    overallConnectivity,
  }

  const bestConnected = totalFiles > 0
    ? lines.reduce((best, l) => l.connectionQuality > best.connectionQuality ? l : best, lines[0]).file
    : ''
  const cleanestWiring = totalFiles > 0
    ? lines.reduce((best, l) => l.wireOrganization > best.wireOrganization ? l : best, lines[0]).file
    : ''
  const mostEfficient = totalFiles > 0
    ? lines.reduce((best, l) => l.operatorEfficiency > best.operatorEfficiency ? l : best, lines[0]).file
    : ''
  const mostUtilized = totalFiles > 0
    ? lines.reduce((best, l) => l.lineUtilization > best.lineUtilization ? l : best, lines[0]).file
    : ''
  const bestOrganized = totalFiles > 0
    ? lines.reduce((best, l) => l.panelLayout > best.panelLayout ? l : best, lines[0]).file
    : ''

  const stats: SwitchboardPanelStats = {
    totalFiles,
    totalOffices: offices.length,
    avgConnectionQuality: network.avgConnectionQuality,
    avgSwitchCapacity: network.avgSwitchCapacity,
    avgWireOrganization: network.avgWireOrganization,
    avgOperatorEfficiency: avg(l => l.operatorEfficiency),
    avgLineUtilization: avg(l => l.lineUtilization),
    avgPanelLayout: avg(l => l.panelLayout),
    digitalExchangeCount: lines.filter(l => l.condition === 'digital-exchange').length,
    modernSwitchboardCount: lines.filter(l => l.condition === 'modern-switchboard').length,
    reliablePanelCount: lines.filter(l => l.condition === 'reliable-panel').length,
    manualExchangeCount: lines.filter(l => l.condition === 'manual-exchange').length,
    faultyWiringCount: lines.filter(l => l.condition === 'faulty-wiring').length,
    deadNetworkCount: lines.filter(l => l.condition === 'dead-network').length,
    crossbarCount: lines.filter(l => l.switchboard.type === 'crossbar').length,
    digitalCount: lines.filter(l => l.switchboard.type === 'digital').length,
    brokenCount: lines.filter(l => l.switchboard.type === 'broken').length,
    hasDeadAirCount: lines.filter(l => l.switchboard.hasDeadAir).length,
    hasCrossTalkCount: lines.filter(l => l.switchboard.hasCrossTalk).length,
    hasCleanRoutingCount: lines.filter(l => l.connections.hasCleanRouting).length,
    hasTangledWiresCount: lines.filter(l => l.connections.hasTangledWires).length,
    hasDeadEndsCount: lines.filter(l => l.connections.hasDeadEnds).length,
    hasSpeedDialCount: lines.filter(l => l.operator.hasSpeedDial).length,
    overworkedCount: lines.reduce((s, l) => s + l.operator.overworkedCount, 0),
    absentCount: lines.reduce((s, l) => s + l.operator.absentCount, 0),
    isOrganizedCount: lines.filter(l => l.panel.isOrganized).length,
    isOverloadedCount: lines.filter(l => l.panel.isOverloaded).length,
    overallConnectivity,
    operatorGrade: classifyOperatorGrade(overallConnectivity),
    bestConnected,
    cleanestWiring,
    mostEfficient,
    mostUtilized,
    bestOrganized,
  }

  const recommendations = generateRecommendations(lines, offices, network, stats)

  return { lines, offices, network, stats, recommendations }
}
