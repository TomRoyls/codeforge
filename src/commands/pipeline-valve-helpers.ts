// ─── Interfaces ──────────────────────────────────────────────────────────────

/** @example { integrity: 100, material: 'steel', isIntact: true } */
export interface PipeMeasure {
  integrity: number
  material: 'steel' | 'copper' | 'pvc' | 'cast-iron' | 'lead' | 'bamboo'
  isIntact: boolean
  hasNoCorrosion: boolean
  hasNoBlockage: boolean
  hasProperJoints: boolean
  hasSeamlessConnections: boolean
  hasInsulation: boolean
  hasPressureRating: boolean
  hasCorrosion: boolean
  hasBlockage: boolean
  hasLeaking: boolean
  corrosionCount: number
  blockageCount: number
  leakCount: number
}

/** @example { control: 100, type: 'gate', isResponsive: true } */
export interface ValveMeasure {
  control: number
  type: 'gate' | 'ball' | 'butterfly' | 'check' | 'pressure-reducing' | 'broken'
  isResponsive: boolean
  hasPreciseControl: boolean
  hasShutOff: boolean
  hasThrottling: boolean
  hasPressureRelief: boolean
  hasBackflowPrevention: boolean
  hasAutomaticControl: boolean
  hasManualOverride: boolean
  hasProperSeating: boolean
  hasStuckValve: boolean
  stuckCount: number
}

/** @example { regulation: 100, level: 'optimal', isRegulated: true } */
export interface PressureMeasure {
  regulation: number
  level: 'optimal' | 'high' | 'low' | 'critical' | 'vacuum' | 'explosive'
  isRegulated: boolean
  hasGauge: boolean
  hasSafetyValve: boolean
  hasSurgeProtection: boolean
  hasPressureEqualization: boolean
  hasDecompression: boolean
  hasCompression: boolean
  hasSuperheated: boolean
  hasFrozen: boolean
  hasBurst: boolean
  burstCount: number
}

/** @example { rate: 100, pattern: 'laminar', isOptimal: true } */
export interface FlowMeasure {
  rate: number
  pattern: 'laminar' | 'turbulent' | 'steady' | 'pulsating' | 'stagnant' | 'geyser'
  isOptimal: boolean
  hasLaminarFlow: boolean
  hasTurbulentFlow: boolean
  hasEvenDistribution: boolean
  hasNoDeadLegs: boolean
  hasProperGradient: boolean
  hasFlowMetering: boolean
  hasBypass: boolean
  hasRecirculation: boolean
  hasStagnation: boolean
  stagnationCount: number
}

/** @example { detection: 100, status: 'sealed', hasNoLeaks: true } */
export interface LeakMeasure {
  detection: number
  status: 'sealed' | 'minor-seep' | 'dripping' | 'leaking' | 'gushing' | 'ruptured'
  hasNoLeaks: boolean
  hasMemoryLeak: boolean
  hasResourceLeak: boolean
  hasDataLeak: boolean
  hasTypeLeak: boolean
  hasAbstractionLeak: boolean
  hasErrorLeak: boolean
  hasSealIntegrity: boolean
  hasGasketCondition: boolean
  hasCondensation: boolean
  leakPointCount: number
}

/** @example { quality: 100, type: 'reverse-osmosis', hasInputValidation: true } */
export interface FiltrationMeasure {
  quality: number
  type: 'reverse-osmosis' | 'carbon' | 'sand' | 'mesh' | 'sieve' | 'none'
  hasInputValidation: boolean
  hasOutputValidation: boolean
  hasTypeChecking: boolean
  hasSanitization: boolean
  hasNormalization: boolean
  hasDeDuplication: boolean
  hasBoundaryChecks: boolean
  hasChemicalTreatment: boolean
  hasUVTreatment: boolean
  hasFilterChangeSchedule: boolean
  bypassCount: number
}

export type PipelineCondition =
  | 'high-pressure-system'
  | 'modern-pipeline'
  | 'standard-piping'
  | 'aging-infrastructure'
  | 'leaky-pipes'
  | 'burst-main'

/** @example { file: 'a.ts', pipeIntegrity: 95, qualityScore: 92 } */
export interface PipelineSegment {
  file: string
  pipeIntegrity: number
  valveControl: number
  pressureRegulation: number
  flowRate: number
  leakDetection: number
  filtrationQuality: number
  pipe: PipeMeasure
  valve: ValveMeasure
  pressure: PressureMeasure
  flow: FlowMeasure
  leak: LeakMeasure
  filtration: FiltrationMeasure
  condition: PipelineCondition
  qualityScore: number
}

export type ZoneType =
  | 'distribution-hub'
  | 'transmission-line'
  | 'service-line'
  | 'branch-line'
  | 'drainage'
  | 'abandoned'

export type ZoneCondition =
  | 'municipal-standard'
  | 'industrial-grade'
  | 'residential'
  | 'temporary'
  | 'makeshift'
  | 'broken'

/** @example { directory: 'src', avgPipeIntegrity: 85 } */
export interface PipelineZone {
  directory: string
  segments: PipelineSegment[]
  avgPipeIntegrity: number
  avgValveControl: number
  avgFlowRate: number
  highPressureCount: number
  burstMainCount: number
  sealedCount: number
  laminarCount: number
  zoneType: ZoneType
  condition: ZoneCondition
}

export type EngineerGrade =
  | 'chief-engineer'
  | 'senior-engineer'
  | 'engineer'
  | 'plumber'
  | 'apprentice'
  | 'wrench-monkey'

/** @example { totalFiles: 5, overallFlow: 78, engineerGrade: 'engineer' } */
export interface PipelineValveStats {
  totalFiles: number
  totalZones: number
  avgPipeIntegrity: number
  avgValveControl: number
  avgPressureRegulation: number
  avgFlowRate: number
  avgLeakDetection: number
  avgFiltrationQuality: number
  highPressureSystemCount: number
  modernPipelineCount: number
  standardPipingCount: number
  agingInfrastructureCount: number
  leakyPipesCount: number
  burstMainCount: number
  isIntactCount: number
  hasCorrosionCount: number
  hasBlockageCount: number
  isResponsiveCount: number
  hasStuckValveCount: number
  isRegulatedCount: number
  hasBurstCount: number
  hasLaminarFlowCount: number
  hasStagnationCount: number
  hasNoLeaksCount: number
  hasInputValidationCount: number
  overallFlow: number
  engineerGrade: EngineerGrade
  bestSegment: string
  strongestPipe: string
  bestValve: string
  bestPressure: string
  fastestFlow: string
}

export interface PipelineValveResult {
  segments: PipelineSegment[]
  zones: PipelineZone[]
  network: {
    avgPipeIntegrity: number
    avgValveControl: number
    avgFlowRate: number
    isFlowing: boolean
    overallFlow: number
  }
  stats: PipelineValveStats
  recommendations: string[]
}

// ─── Counting Helpers ────────────────────────────────────────────────────────

/** @example countLoc('a\nb\nc') returns 3 */
export function countLoc(content: string): number {
  if (content.length === 0) return 0
  return content.split('\n').filter((l) => l.trim().length > 0).length
}

/** @example countFunctions('function foo() {}') returns 1 */
export function countFunctions(content: string): number {
  const matches = content.match(/(?:function\s+\w+|(?:const|let|var)\s+\w+\s*=\s*(?:\([^)]*\)|[^=])\s*=>)/g)
  return matches ? matches.length : 0
}

/** @example countClasses('class A {}') returns 1 */
export function countClasses(content: string): number {
  const matches = content.match(/\bclass\s+\w+/g)
  return matches ? matches.length : 0
}

/** @example countInterfaces('interface Foo {}') returns 1 */
export function countInterfaces(content: string): number {
  const matches = content.match(/\binterface\s+\w+/g)
  return matches ? matches.length : 0
}

/** @example countTypes('type X = string') returns 1 */
export function countTypes(content: string): number {
  const matches = content.match(/\btype\s+\w+\s*=/g)
  return matches ? matches.length : 0
}

/** @example countExports('export const a = 1') returns 1 */
export function countExports(content: string): number {
  const matches = content.match(/\bexport\s+/g)
  return matches ? matches.length : 0
}

/** @example countImports("import { x } from 'y'") returns 1 */
export function countImports(content: string): number {
  const matches = content.match(/\bimport\s+/g)
  return matches ? matches.length : 0
}

/** @example countJSDoc('/** doc *\/') returns 1 */
export function countJSDoc(content: string): number {
  const matches = content.match(/\/\*\*[\s\S]*?\*\//g)
  return matches ? matches.length : 0
}

/** @example countComments('// inline\n/* block *\/') returns 2 */
export function countComments(content: string): number {
  let count = 0
  const inline = content.match(/\/\/.*/g)
  if (inline) count += inline.length
  const block = content.match(/\/\*[\s\S]*?\*\//g)
  if (block) count += block.length
  return count
}

/** @example countErrorHandling('try {} catch(e) {}') returns 1 */
export function countErrorHandling(content: string): number {
  const matches = content.match(/\btry\s*\{/g)
  return matches ? matches.length : 0
}

/** @example countTypeAnnotations('const x: number = 1') returns 1 */
export function countTypeAnnotations(content: string): number {
  const matches = content.match(/:\s*(?:string|number|boolean|void|any|unknown|never|object|null|undefined|readonly)/g)
  return matches ? matches.length : 0
}

/** @example countTodos('// TODO: fix') returns 1 */
export function countTodos(content: string): number {
  const matches = content.match(/TODO/g)
  return matches ? matches.length : 0
}

/** @example countConsole('console.log(1)') returns 1 */
export function countConsole(content: string): number {
  const matches = content.match(/\bconsole\.\w+/g)
  return matches ? matches.length : 0
}

/** @example countBranches('if (x) {}') returns 1 */
export function countBranches(content: string): number {
  const matches = content.match(/\bif\s*\(/g)
  return matches ? matches.length : 0
}

/** @example countDescriptiveNames('function getData() {}') returns 1 */
export function countDescriptiveNames(content: string): number {
  const matches = content.match(/\b(?:get|set|is|has|can|should|will|handle|process|validate|check|parse|format|transform|build|create|read|write|update|delete|remove|add|find|search|filter|sort|compute|calculate|generate|extract|convert|merge|split)\w+/gi)
  return matches ? matches.length : 0
}

/** @example countDefaults('export default class {}') returns 1 */
export function countDefaults(content: string): number {
  const matches = content.match(/\bexport\s+default\b/g)
  return matches ? matches.length : 0
}

/** @example countDeprecated('@deprecated') returns 1 */
export function countDeprecated(content: string): number {
  const matches = content.match(/@deprecated/g)
  return matches ? matches.length : 0
}

/** @example countReturnTypes('function foo(): string {}') returns 1 */
export function countReturnTypes(content: string): number {
  const matches = content.match(/\)\s*:\s*(?:string|number|boolean|void|any|unknown|never|object)/g)
  return matches ? matches.length : 0
}

/** @example countGenerics('function foo<T>() {}') returns 1 */
export function countGenerics(content: string): number {
  const matches = content.match(/<[A-Z]\w*>/g)
  return matches ? matches.length : 0
}

/** @example countPrivateMembers('private x: number') returns 1 */
export function countPrivateMembers(content: string): number {
  const matches = content.match(/\bprivate\s+\w+/g)
  return matches ? matches.length : 0
}

/** @example countAsync("async function foo() {}") returns 1 */
export function countAsync(content: string): number {
  const matches = content.match(/\basync\s+/g)
  return matches ? matches.length : 0
}

/** @example countAwait('await foo()') returns 1 */
export function countAwait(content: string): number {
  const matches = content.match(/\bawait\s+/g)
  return matches ? matches.length : 0
}

/** @example countPromises('new Promise') returns 1 */
export function countPromises(content: string): number {
  const matches = content.match(/\bPromise\b/g)
  return matches ? matches.length : 0
}

/** @example countReturns('return x') returns 1 */
export function countReturns(content: string): number {
  const matches = content.match(/\breturn\b/g)
  return matches ? matches.length : 0
}

/** @example countThrow('throw new Error()') returns 1 */
export function countThrow(content: string): number {
  const matches = content.match(/\bthrow\s+/g)
  return matches ? matches.length : 0
}

/** @example countConditionals('x ? a : b') returns 1 */
export function countConditionals(content: string): number {
  const matches = content.match(/\?\s*[^;:]*\s*:/g)
  return matches ? matches.length : 0
}

/** @example countLoops('for (let i = 0; i < n; i++) {}') returns 1 */
export function countLoops(content: string): number {
  const matches = content.match(/\b(?:for|while|do)\s*[\({]/g)
  return matches ? matches.length : 0
}

/** @example countSwitches('switch(x) {}') returns 1 */
export function countSwitches(content: string): number {
  const matches = content.match(/\bswitch\s*\(/g)
  return matches ? matches.length : 0
}

/** @example countNullChecks('x === null') returns 1 */
export function countNullChecks(content: string): number {
  const matches = content.match(/===\s*(?:null|undefined)|!==\s*(?:null|undefined)|\?\?|\?\.|!\./g)
  return matches ? matches.length : 0
}

/** @example countTypeGuards("typeof x === 'string'") returns 1 */
export function countTypeGuards(content: string): number {
  const matches = content.match(/\btypeof\s+\w+\s*===|instanceof\s+/g)
  return matches ? matches.length : 0
}

// ─── Pipe Measurement ───────────────────────────────────────────────────────

/** @example measurePipe('export function add(a: number, b: number): number { return a + b; }') */
export function measurePipe(content: string): PipeMeasure {
  const base = 10
  const loc = countLoc(content)
  const functions = countFunctions(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const typeAnnotations = countTypeAnnotations(content)
  const jsdoc = countJSDoc(content)
  const errorHandling = countErrorHandling(content)
  const privateMembers = countPrivateMembers(content)
  const returns = countReturns(content)
  const defaults = countDefaults(content)

  let integrity = base
  if (loc > 0) integrity += 8
  if (functions > 0) integrity += 8
  if (classes > 0) integrity += 6
  if (interfaces > 0) integrity += 6
  if (exports > 0) integrity += 6
  if (imports > 0) integrity += 5
  if (typeAnnotations > 0) integrity += 8
  if (jsdoc > 0) integrity += 8
  if (errorHandling > 0) integrity += 8
  if (privateMembers > 0) integrity += 5
  if (returns > 0) integrity += 4
  if (defaults > 0) integrity += 3
  if (loc > 5) integrity += 5
  if (loc > 15) integrity += 5
  if (functions > 1) integrity += 5
  if (classes > 1) integrity += 3

  integrity = Math.min(100, integrity)

  const todos = countTodos(content)
  const deprecated = countDeprecated(content)

  const hasCorrosion = todos > 0 || deprecated > 0
  const corrosionCount = todos + deprecated
  const hasBlockage = loc > 0 && functions === 0 && classes === 0
  const blockageCount = hasBlockage ? 1 : 0
  const hasLeaking = false
  const leakCount = 0

  let material: PipeMeasure['material'] = 'bamboo'
  if (integrity >= 80) material = 'steel'
  else if (integrity >= 65) material = 'copper'
  else if (integrity >= 50) material = 'cast-iron'
  else if (integrity >= 35) material = 'pvc'
  else if (integrity >= 20) material = 'lead'

  return {
    integrity,
    material,
    isIntact: integrity >= 60,
    hasNoCorrosion: !hasCorrosion,
    hasNoBlockage: !hasBlockage,
    hasProperJoints: functions > 0 || classes > 0,
    hasSeamlessConnections: imports > 0 && exports > 0,
    hasInsulation: typeAnnotations > 0,
    hasPressureRating: loc > 10,
    hasCorrosion,
    hasBlockage,
    hasLeaking,
    corrosionCount,
    blockageCount,
    leakCount,
  }
}

// ─── Valve Measurement ──────────────────────────────────────────────────────

/** @example measureValve('export function add(a: number, b: number): number { return a + b; }') */
export function measureValve(content: string): ValveMeasure {
  const base = 10
  const functions = countFunctions(content)
  const returns = countReturns(content)
  const errorHandling = countErrorHandling(content)
  const throwCount = countThrow(content)
  const branches = countBranches(content)
  const conditionals = countConditionals(content)
  const loops = countLoops(content)
  const switches = countSwitches(content)
  const typeAnnotations = countTypeAnnotations(content)
  const generics = countGenerics(content)
  const asyncCount = countAsync(content)
  const awaitCount = countAwait(content)

  let control = base
  if (functions > 0) control += 10
  if (returns > 0) control += 8
  if (errorHandling > 0) control += 10
  if (throwCount > 0) control += 6
  if (branches > 0) control += 6
  if (conditionals > 0) control += 4
  if (loops > 0) control += 4
  if (switches > 0) control += 4
  if (typeAnnotations > 0) control += 8
  if (generics > 0) control += 5
  if (asyncCount > 0) control += 8
  if (awaitCount > 0) control += 6
  if (functions > 1) control += 5
  if (branches > 1) control += 5
  if (errorHandling > 1) control += 5

  control = Math.min(100, control)

  let type: ValveMeasure['type'] = 'broken'
  if (control >= 80) type = 'gate'
  else if (control >= 65) type = 'ball'
  else if (control >= 50) type = 'butterfly'
  else if (control >= 35) type = 'check'
  else if (control >= 20) type = 'pressure-reducing'

  const hasStuckValve = branches > 5
  const stuckCount = hasStuckValve ? branches - 5 : 0

  return {
    control,
    type,
    isResponsive: control >= 50,
    hasPreciseControl: conditionals > 0 && branches > 0,
    hasShutOff: errorHandling > 0,
    hasThrottling: loops > 0,
    hasPressureRelief: throwCount > 0,
    hasBackflowPrevention: typeAnnotations > 0,
    hasAutomaticControl: asyncCount > 0,
    hasManualOverride: switches > 0,
    hasProperSeating: functions > 0,
    hasStuckValve,
    stuckCount,
  }
}

// ─── Pressure Measurement ───────────────────────────────────────────────────

/** @example measurePressure('export function add(a: number, b: number): number { return a + b; }') */
export function measurePressure(content: string): PressureMeasure {
  const base = 10
  const loc = countLoc(content)
  const branches = countBranches(content)
  const loops = countLoops(content)
  const conditionals = countConditionals(content)
  const functions = countFunctions(content)
  const classes = countClasses(content)
  const errorHandling = countErrorHandling(content)
  const comments = countComments(content)
  const jsdoc = countJSDoc(content)
  const typeAnnotations = countTypeAnnotations(content)
  const generics = countGenerics(content)

  let regulation = base
  if (loc > 0) regulation += 5
  if (loc > 10) regulation += 5
  if (loc > 30) regulation += 5
  if (branches > 0) regulation += 5
  if (branches > 0 && branches <= 5) regulation += 5
  if (loops > 0) regulation += 4
  if (functions > 0) regulation += 8
  if (classes > 0) regulation += 6
  if (errorHandling > 0) regulation += 8
  if (comments > 0) regulation += 5
  if (jsdoc > 0) regulation += 5
  if (typeAnnotations > 0) regulation += 8
  if (generics > 0) regulation += 5
  if (conditionals > 0) regulation += 3
  if (errorHandling > 1) regulation += 5

  regulation = Math.min(100, regulation)

  const hasBurst = branches > 10
  const burstCount = hasBurst ? branches - 10 : 0
  const hasSuperheated = branches > 8
  const hasFrozen = branches === 0 && functions === 0
  const hasCompression = generics > 0
  const hasDecompression = comments > 0

  let level: PressureMeasure['level'] = 'vacuum'
  if (regulation >= 80) level = 'optimal'
  else if (regulation >= 65) level = 'low'
  else if (regulation >= 50) level = 'high'
  else if (regulation >= 35) level = 'critical'
  else if (regulation >= 20) level = 'explosive'

  return {
    regulation,
    level,
    isRegulated: regulation >= 60,
    hasGauge: branches > 0,
    hasSafetyValve: errorHandling > 0,
    hasSurgeProtection: errorHandling > 1,
    hasPressureEqualization: conditionals > 0,
    hasDecompression,
    hasCompression,
    hasSuperheated,
    hasFrozen,
    hasBurst,
    burstCount,
  }
}

// ─── Flow Measurement ───────────────────────────────────────────────────────

/** @example measureFlow('export function add(a: number, b: number): number { return a + b; }') */
export function measureFlow(content: string): FlowMeasure {
  const base = 10
  const functions = countFunctions(content)
  const returns = countReturns(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const loc = countLoc(content)
  const asyncCount = countAsync(content)
  const awaitCount = countAwait(content)
  const promises = countPromises(content)
  const branches = countBranches(content)
  const descriptiveNames = countDescriptiveNames(content)
  const loops = countLoops(content)
  const switches = countSwitches(content)

  let rate = base
  if (functions > 0) rate += 10
  if (returns > 0) rate += 6
  if (exports > 0) rate += 6
  if (imports > 0) rate += 5
  if (loc > 5) rate += 5
  if (loc > 15) rate += 5
  if (asyncCount > 0) rate += 8
  if (awaitCount > 0) rate += 6
  if (promises > 0) rate += 4
  if (descriptiveNames > 0) rate += 5
  if (branches > 0) rate += 4
  if (loops > 0) rate += 4
  if (switches > 0) rate += 3
  if (functions > 1) rate += 5
  if (asyncCount > 1) rate += 5
  if (descriptiveNames > 2) rate += 4

  rate = Math.min(100, rate)

  const hasStagnation = loc > 0 && functions === 0
  const stagnationCount = hasStagnation ? 1 : 0
  const hasTurbulentFlow = branches > 5
  const hasLaminarFlow = rate >= 60 && !hasTurbulentFlow

  let pattern: FlowMeasure['pattern'] = 'stagnant'
  if (rate >= 80 && !hasTurbulentFlow) pattern = 'laminar'
  else if (rate >= 70) pattern = 'steady'
  else if (rate >= 50) pattern = 'pulsating'
  else if (rate >= 30) pattern = 'turbulent'
  else if (rate > 10 && hasTurbulentFlow) pattern = 'geyser'

  return {
    rate,
    pattern,
    isOptimal: rate >= 70,
    hasLaminarFlow,
    hasTurbulentFlow,
    hasEvenDistribution: branches > 0 && loops > 0,
    hasNoDeadLegs: !hasStagnation,
    hasProperGradient: imports > 0 && exports > 0,
    hasFlowMetering: descriptiveNames > 0,
    hasBypass: branches > 2,
    hasRecirculation: loops > 0,
    hasStagnation,
    stagnationCount,
  }
}

// ─── Leak Measurement ───────────────────────────────────────────────────────

/** @example measureLeak('export function add(a: number, b: number): number { return a + b; }') */
export function measureLeak(content: string): LeakMeasure {
  const base = 10
  const errorHandling = countErrorHandling(content)
  const typeAnnotations = countTypeAnnotations(content)
  const privateMembers = countPrivateMembers(content)
  const consoleCount = countConsole(content)
  const returns = countReturns(content)
  const functions = countFunctions(content)
  const classes = countClasses(content)
  const nullChecks = countNullChecks(content)
  const typeGuards = countTypeGuards(content)
  const generics = countGenerics(content)
  const comments = countComments(content)
  const jsdoc = countJSDoc(content)
  const loc = countLoc(content)

  let detection = base
  if (errorHandling > 0) detection += 10
  if (typeAnnotations > 0) detection += 8
  if (privateMembers > 0) detection += 6
  if (returns > 0) detection += 5
  if (functions > 0) detection += 5
  if (classes > 0) detection += 5
  if (nullChecks > 0) detection += 6
  if (typeGuards > 0) detection += 5
  if (generics > 0) detection += 4
  if (comments > 0) detection += 4
  if (jsdoc > 0) detection += 5
  if (loc > 5) detection += 4
  if (loc > 15) detection += 4
  if (errorHandling > 1) detection += 5
  if (typeAnnotations > 2) detection += 4

  detection = Math.min(100, detection)

  const hasDataLeak = consoleCount > 0
  const hasTypeLeak = typeAnnotations === 0 && loc > 5
  const hasAbstractionLeak = privateMembers > 0 && consoleCount > 0
  const hasErrorLeak = errorHandling === 0 && functions > 0
  const hasMemoryLeak = false
  const hasResourceLeak = false
  const hasCondensation = hasDataLeak || hasTypeLeak

  let leakPoints = 0
  if (hasDataLeak) leakPoints++
  if (hasTypeLeak) leakPoints++
  if (hasAbstractionLeak) leakPoints++
  if (hasErrorLeak) leakPoints++

  let status: LeakMeasure['status'] = 'sealed'
  if (leakPoints >= 4) status = 'ruptured'
  else if (leakPoints >= 3) status = 'gushing'
  else if (leakPoints >= 2) status = 'leaking'
  else if (leakPoints >= 1) status = 'dripping'
  else if (hasCondensation) status = 'minor-seep'

  const hasNoLeaks = leakPoints === 0 && !hasCondensation

  return {
    detection,
    status,
    hasNoLeaks,
    hasMemoryLeak,
    hasResourceLeak,
    hasDataLeak,
    hasTypeLeak,
    hasAbstractionLeak,
    hasErrorLeak,
    hasSealIntegrity: privateMembers > 0,
    hasGasketCondition: errorHandling > 0,
    hasCondensation,
    leakPointCount: leakPoints,
  }
}

// ─── Filtration Measurement ─────────────────────────────────────────────────

/** @example measureFiltration('export function add(a: number, b: number): number { return a + b; }') */
export function measureFiltration(content: string): FiltrationMeasure {
  const base = 10
  const typeAnnotations = countTypeAnnotations(content)
  const typeGuards = countTypeGuards(content)
  const nullChecks = countNullChecks(content)
  const errorHandling = countErrorHandling(content)
  const interfaces = countInterfaces(content)
  const types = countTypes(content)
  const generics = countGenerics(content)
  const jsdoc = countJSDoc(content)
  const returns = countReturnTypes(content)
  const branches = countBranches(content)
  const functions = countFunctions(content)
  const loc = countLoc(content)

  let quality = base
  if (typeAnnotations > 0) quality += 10
  if (typeGuards > 0) quality += 8
  if (nullChecks > 0) quality += 6
  if (errorHandling > 0) quality += 6
  if (interfaces > 0) quality += 6
  if (types > 0) quality += 5
  if (generics > 0) quality += 5
  if (jsdoc > 0) quality += 5
  if (returns > 0) quality += 5
  if (branches > 0) quality += 4
  if (functions > 0) quality += 4
  if (loc > 5) quality += 4
  if (loc > 15) quality += 3
  if (typeAnnotations > 2) quality += 5
  if (interfaces > 1) quality += 3

  quality = Math.min(100, quality)

  let type: FiltrationMeasure['type'] = 'none'
  if (quality >= 85) type = 'reverse-osmosis'
  else if (quality >= 70) type = 'carbon'
  else if (quality >= 55) type = 'sand'
  else if (quality >= 40) type = 'mesh'
  else if (quality >= 25) type = 'sieve'

  const bypassCount = branches > 10 ? branches - 10 : 0

  return {
    quality,
    type,
    hasInputValidation: typeGuards > 0,
    hasOutputValidation: returns > 0,
    hasTypeChecking: typeAnnotations > 0,
    hasSanitization: errorHandling > 0,
    hasNormalization: interfaces > 0,
    hasDeDuplication: generics > 0,
    hasBoundaryChecks: nullChecks > 0,
    hasChemicalTreatment: types > 0,
    hasUVTreatment: jsdoc > 0,
    hasFilterChangeSchedule: branches > 0 && branches <= 10,
    bypassCount,
  }
}

// ─── Segment Analysis ───────────────────────────────────────────────────────

/** @example classifySegmentCondition(90, pipe, valve) returns 'high-pressure-system' */
export function classifySegmentCondition(
  score: number,
  pipe: PipeMeasure,
  valve: ValveMeasure,
): PipelineCondition {
  if (score >= 85 && pipe.isIntact && valve.isResponsive) return 'high-pressure-system'
  if (score >= 70 && pipe.isIntact) return 'modern-pipeline'
  if (score >= 50 && pipe.hasProperJoints) return 'standard-piping'
  if (score >= 35) return 'aging-infrastructure'
  if (score >= 20) return 'leaky-pipes'
  return 'burst-main'
}

/** @example analyzePipelineSegment('export function add(a: number, b: number): number { return a + b; }', 'file.ts') */
export function analyzePipelineSegment(content: string, filePath: string): PipelineSegment {
  const pipe = measurePipe(content)
  const valve = measureValve(content)
  const pressure = measurePressure(content)
  const flow = measureFlow(content)
  const leak = measureLeak(content)
  const filtration = measureFiltration(content)

  const qualityScore = Math.round(
    (pipe.integrity + valve.control + pressure.regulation + flow.rate + leak.detection + filtration.quality) / 6,
  )

  const condition = classifySegmentCondition(qualityScore, pipe, valve)

  return {
    file: filePath,
    pipeIntegrity: pipe.integrity,
    valveControl: valve.control,
    pressureRegulation: pressure.regulation,
    flowRate: flow.rate,
    leakDetection: leak.detection,
    filtrationQuality: filtration.quality,
    pipe,
    valve,
    pressure,
    flow,
    leak,
    filtration,
    condition,
    qualityScore,
  }
}

// ─── Zone Analysis ──────────────────────────────────────────────────────────

/** @example classifyZoneType(segments, 80) returns 'distribution-hub' */
export function classifyZoneType(
  segments: PipelineSegment[],
  avgPipe: number,
): ZoneType {
  if (segments.length === 0) return 'abandoned'
  const hasHighPressure = segments.some((s) => s.condition === 'high-pressure-system')
  if (hasHighPressure && avgPipe >= 70) return 'distribution-hub'
  if (avgPipe >= 60) return 'transmission-line'
  if (avgPipe >= 40) return 'service-line'
  if (avgPipe >= 25) return 'branch-line'
  if (avgPipe >= 10) return 'drainage'
  return 'abandoned'
}

/** @example classifyZoneCondition(80) returns 'municipal-standard' */
export function classifyZoneCondition(avgPipe: number): ZoneCondition {
  if (avgPipe >= 80) return 'municipal-standard'
  if (avgPipe >= 65) return 'industrial-grade'
  if (avgPipe >= 50) return 'residential'
  if (avgPipe >= 35) return 'temporary'
  if (avgPipe >= 20) return 'makeshift'
  return 'broken'
}

/** @example analyzePipelineZone(segments, 'src') */
export function analyzePipelineZone(segments: PipelineSegment[], dirPath: string): PipelineZone {
  const count = segments.length
  const avgPipeIntegrity = count > 0 ? Math.round(segments.reduce((s, seg) => s + seg.pipeIntegrity, 0) / count) : 0
  const avgValveControl = count > 0 ? Math.round(segments.reduce((s, seg) => s + seg.valveControl, 0) / count) : 0
  const avgFlowRate = count > 0 ? Math.round(segments.reduce((s, seg) => s + seg.flowRate, 0) / count) : 0
  const highPressureCount = segments.filter((s) => s.condition === 'high-pressure-system').length
  const burstMainCount = segments.filter((s) => s.condition === 'burst-main').length
  const sealedCount = segments.filter((s) => s.leak.hasNoLeaks).length
  const laminarCount = segments.filter((s) => s.flow.hasLaminarFlow).length

  const zoneType = classifyZoneType(segments, avgPipeIntegrity)
  const condition = classifyZoneCondition(avgPipeIntegrity)

  return {
    directory: dirPath,
    segments,
    avgPipeIntegrity,
    avgValveControl,
    avgFlowRate,
    highPressureCount,
    burstMainCount,
    sealedCount,
    laminarCount,
    zoneType,
    condition,
  }
}

// ─── Engineer Grade ──────────────────────────────────────────────────────────

/** @example classifyEngineerGrade(90) returns 'chief-engineer' */
export function classifyEngineerGrade(avgFlow: number): EngineerGrade {
  if (avgFlow >= 85) return 'chief-engineer'
  if (avgFlow >= 70) return 'senior-engineer'
  if (avgFlow >= 50) return 'engineer'
  if (avgFlow >= 30) return 'plumber'
  if (avgFlow >= 15) return 'apprentice'
  return 'wrench-monkey'
}

// ─── Recommendations ─────────────────────────────────────────────────────────

/** @example generateRecommendations(pipe, valve, pressure, flow, leak, filtration) */
export function generateRecommendations(
  pipe: PipeMeasure,
  valve: ValveMeasure,
  pressure: PressureMeasure,
  flow: FlowMeasure,
  leak: LeakMeasure,
  filtration: FiltrationMeasure,
): string[] {
  const recommendations: string[] = []

  if (pipe.hasCorrosion) {
    recommendations.push('Remove TODO comments and deprecated markers to prevent pipe corrosion')
  }
  if (pipe.hasBlockage) {
    recommendations.push('Add functions or classes to unblock stagnant code flow')
  }
  if (!valve.hasShutOff) {
    recommendations.push('Add error handling to provide emergency shut-off capability')
  }
  if (valve.hasStuckValve) {
    recommendations.push('Reduce excessive branching to prevent valve sticking')
  }
  if (pressure.hasBurst) {
    recommendations.push('Reduce complexity to prevent pressure bursts')
  }
  if (pressure.hasFrozen) {
    recommendations.push('Add executable code to thaw frozen pipeline sections')
  }
  if (flow.hasStagnation) {
    recommendations.push('Convert dead legs into flowing code with functions or exports')
  }
  if (leak.hasDataLeak) {
    recommendations.push('Remove console statements to seal data leaks')
  }
  if (leak.hasErrorLeak) {
    recommendations.push('Add try-catch blocks to contain error leakage')
  }
  if (!filtration.hasInputValidation) {
    recommendations.push('Add type guards for input validation filtration')
  }
  if (!filtration.hasOutputValidation) {
    recommendations.push('Add return type annotations for output validation')
  }
  if (!pipe.hasInsulation) {
    recommendations.push('Add type annotations to insulate data flow')
  }

  if (recommendations.length === 0) {
    recommendations.push('Pipeline system is flowing optimally — maintain current standards')
  }

  return recommendations
}

// ─── Build Result ────────────────────────────────────────────────────────────

/** @example buildPipelineValveResult(['a.ts'], ['export function foo(): void {}']) */
export function buildPipelineValveResult(
  files: string[],
  contents: string[],
  options?: { ignore?: string[]; ext?: string[] },
): PipelineValveResult {
  const _opts = options ?? {}

  const segments: PipelineSegment[] = files.map((file, i) =>
    analyzePipelineSegment(contents[i] ?? '', file),
  )

  const zoneMap = new Map<string, PipelineSegment[]>()
  for (const segment of segments) {
    const dir = segment.file.includes('/') ? segment.file.substring(0, segment.file.lastIndexOf('/')) : '.'
    const existing = zoneMap.get(dir)
    if (existing) {
      existing.push(segment)
    } else {
      zoneMap.set(dir, [segment])
    }
  }

  const zones: PipelineZone[] = Array.from(zoneMap.entries()).map(([dir, segs]) =>
    analyzePipelineZone(segs, dir),
  )

  const count = segments.length
  const avgPipeIntegrity = count > 0 ? Math.round(segments.reduce((s, seg) => s + seg.pipeIntegrity, 0) / count) : 0
  const avgValveControl = count > 0 ? Math.round(segments.reduce((s, seg) => s + seg.valveControl, 0) / count) : 0
  const avgPressureRegulation = count > 0 ? Math.round(segments.reduce((s, seg) => s + seg.pressureRegulation, 0) / count) : 0
  const avgFlowRate = count > 0 ? Math.round(segments.reduce((s, seg) => s + seg.flowRate, 0) / count) : 0
  const avgLeakDetection = count > 0 ? Math.round(segments.reduce((s, seg) => s + seg.leakDetection, 0) / count) : 0
  const avgFiltrationQuality = count > 0 ? Math.round(segments.reduce((s, seg) => s + seg.filtrationQuality, 0) / count) : 0

  const overallFlow = Math.round(
    (avgPipeIntegrity + avgValveControl + avgPressureRegulation + avgFlowRate + avgLeakDetection + avgFiltrationQuality) / 6,
  )
  const engineerGrade = classifyEngineerGrade(overallFlow)

  const conditionCounts = {
    highPressureSystem: segments.filter((s) => s.condition === 'high-pressure-system').length,
    modernPipeline: segments.filter((s) => s.condition === 'modern-pipeline').length,
    standardPiping: segments.filter((s) => s.condition === 'standard-piping').length,
    agingInfrastructure: segments.filter((s) => s.condition === 'aging-infrastructure').length,
    leakyPipes: segments.filter((s) => s.condition === 'leaky-pipes').length,
    burstMain: segments.filter((s) => s.condition === 'burst-main').length,
  }

  const stats: PipelineValveStats = {
    totalFiles: count,
    totalZones: zones.length,
    avgPipeIntegrity,
    avgValveControl,
    avgPressureRegulation,
    avgFlowRate,
    avgLeakDetection,
    avgFiltrationQuality,
    ...conditionCounts,
    isIntactCount: segments.filter((s) => s.pipe.isIntact).length,
    hasCorrosionCount: segments.filter((s) => s.pipe.hasCorrosion).length,
    hasBlockageCount: segments.filter((s) => s.pipe.hasBlockage).length,
    isResponsiveCount: segments.filter((s) => s.valve.isResponsive).length,
    hasStuckValveCount: segments.filter((s) => s.valve.hasStuckValve).length,
    isRegulatedCount: segments.filter((s) => s.pressure.isRegulated).length,
    hasBurstCount: segments.filter((s) => s.pressure.hasBurst).length,
    hasLaminarFlowCount: segments.filter((s) => s.flow.hasLaminarFlow).length,
    hasStagnationCount: segments.filter((s) => s.flow.hasStagnation).length,
    hasNoLeaksCount: segments.filter((s) => s.leak.hasNoLeaks).length,
    hasInputValidationCount: segments.filter((s) => s.filtration.hasInputValidation).length,
    overallFlow,
    engineerGrade,
    bestSegment: count > 0 ? segments.reduce((best, s) => (s.qualityScore > best.qualityScore ? s : best)).file : '',
    strongestPipe: count > 0 ? segments.reduce((best, s) => (s.pipeIntegrity > best.pipeIntegrity ? s : best)).file : '',
    bestValve: count > 0 ? segments.reduce((best, s) => (s.valveControl > best.valveControl ? s : best)).file : '',
    bestPressure: count > 0 ? segments.reduce((best, s) => (s.pressureRegulation > best.pressureRegulation ? s : best)).file : '',
    fastestFlow: count > 0 ? segments.reduce((best, s) => (s.flowRate > best.flowRate ? s : best)).file : '',
  }

  const network = {
    avgPipeIntegrity,
    avgValveControl,
    avgFlowRate,
    isFlowing: overallFlow >= 50,
    overallFlow,
  }

  const recPipe = count > 0 ? segments[0].pipe : measurePipe('')
  const recValve = count > 0 ? segments[0].valve : measureValve('')
  const recPressure = count > 0 ? segments[0].pressure : measurePressure('')
  const recFlow = count > 0 ? segments[0].flow : measureFlow('')
  const recLeak = count > 0 ? segments[0].leak : measureLeak('')
  const recFiltration = count > 0 ? segments[0].filtration : measureFiltration('')

  const recommendations = generateRecommendations(recPipe, recValve, recPressure, recFlow, recLeak, recFiltration)

  return { segments, zones, network, stats, recommendations }
}
