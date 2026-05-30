// ─── Interfaces ──────────────────────────────────────────

export interface Signal {
  from: string
  to: string
  type: 'export' | 'import' | 'call' | 'event' | 'callback' | 'shared-state' | 'type-reference'
  strength: number
  clarity: number
  channel: string
  payload: string[]
  isNoisy: boolean
  isLossy: boolean
  isBroken: boolean
  description: string
}

export interface Channel {
  path: string
  type: 'direct' | 'indirect' | 'broadcast' | 'event-bus' | 'shared-state' | 'callback-chain'
  quality: 'clear' | 'acceptable' | 'noisy' | 'degraded' | 'broken'
  bandwidth: number
  latency: number
  reliability: number
  signals: string[]
}

export interface SignalTower {
  file: string
  outgoingSignals: number
  incomingSignals: number
  clarity: number
  isRelay: boolean
  isBroadcaster: boolean
  isReceiver: boolean
  noiseLevel: number
}

export interface DeadChannel {
  from: string
  to: string
  type: string
  reason: 'unused-export' | 'unused-import' | 'dead-code-path' | 'deprecated-api' | 'orphaned-callback'
  description: string
}

export interface SemaphoreStats {
  totalSignals: number
  clearSignals: number
  noisySignals: number
  lossySignals: number
  brokenSignals: number
  totalChannels: number
  clearChannels: number
  degradedChannels: number
  brokenChannels: number
  totalTowers: number
  broadcasters: number
  receivers: number
  relays: number
  totalDeadChannels: number
  avgClarity: number
  avgStrength: number
  avgNoiseLevel: number
  signalToNoiseRatio: number
  channelReliability: number
  communicationEfficiency: number
  overallClarity: 'crystal-clear' | 'clear' | 'static' | 'noisy' | 'broken'
}

export interface SemaphoreResult {
  signals: Signal[]
  channels: Channel[]
  towers: SignalTower[]
  deadChannels: DeadChannel[]
  stats: SemaphoreStats
  recommendations: string[]
}

// ─── Regex Helpers ───────────────────────────────────────

const EXPORT_RE = /export\s+(?:default\s+)?(?:function|const|let|var|class|interface|type|enum|async\s+function)\s+(\w+)/g
const NAMED_IMPORT_RE = /import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"]/g
const DEFAULT_IMPORT_RE = /import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g
const CALL_RE = /(\w+)\s*\(/g
const EVENT_EMIT_RE = /(?:\.emit|\.dispatch|\.fire|\.publish|\.trigger)\s*\(\s*['"](\w+)['"]/g
const EVENT_ON_RE = /(?:\.on|\.addEventListener|\.subscribe|\.listen)\s*\(\s*['"](\w+)['"]/g
const CALLBACK_RE = /(?:callback|cb|next|done|resolve|reject|handler)\s*(?::\s*\w+)?\s*[\)=]/g
const SHARED_STATE_RE = /(?:globalThis|global|window|process\.env)\.\w+/g
const TYPE_REF_RE = /(?::\s*(\w+)(?:\[\])?\s*[=;,{)]|<(\w+)>|extends\s+(\w+)|implements\s+(\w+))/g
const DEPRECATED_RE = /@deprecated\b/
const TODO_RE = /@todo\b/i

// ─── Extract Exports ─────────────────────────────────────

/**
 * Extract exported symbols from content
 * @example
 * extractExports('export function hello() {}') // ['hello']
 */
export function extractExports(content: string): string[] {
  const names: string[] = []
  let m: RegExpExecArray | null
  EXPORT_RE.lastIndex = 0
  while ((m = EXPORT_RE.exec(content)) !== null) {
    const name = m[1]
    if (name) names.push(name)
  }
  // Also match re-exports: export { foo, bar }
  const reExportRe = /export\s+\{([^}]+)\}/g
  reExportRe.lastIndex = 0
  while ((m = reExportRe.exec(content)) !== null) {
    const rawGroup = m[1] ?? ''
    const items = rawGroup.split(',').map((s) => {
      const parts = s.trim().split(/\s+as\s+/)
      const last = parts.pop()
      return (last ?? s).trim()
    })
    for (const item of items) {
      if (item.length > 0) names.push(item)
    }
  }
  return Array.from(new Set(names))
}

// ─── Extract Imports ─────────────────────────────────────

/**
 * Extract imported symbols and their source modules
 * @example
 * extractImports("import { foo } from './bar'") // [{ symbols: ['foo'], source: './bar' }]
 */
export function extractImports(content: string): Array<{ symbols: string[]; source: string }> {
  const results: Array<{ symbols: string[]; source: string }> = []
  let m: RegExpExecArray | null

  NAMED_IMPORT_RE.lastIndex = 0
  while ((m = NAMED_IMPORT_RE.exec(content)) !== null) {
    const group1 = m[1] ?? ''
    const source = m[2] ?? ''
    const symbols = group1.split(',').map((s) => s.trim()).filter((s) => s.length > 0)
    results.push({ source, symbols })
  }

  DEFAULT_IMPORT_RE.lastIndex = 0
  while ((m = DEFAULT_IMPORT_RE.exec(content)) !== null) {
    const ident = m[1]
    if (!ident || ident === 'type') continue
    // Skip if already captured as named import
    const source = m[2] ?? ''
    const existing = results.find((r) => r.source === source)
    if (existing) {
      if (!existing.symbols.includes(ident)) {
        existing.symbols.push(ident)
      }
    } else {
      results.push({ source, symbols: [ident] })
    }
  }

  return results
}

// ─── Extract Calls ───────────────────────────────────────

/**
 * Extract function call names from content
 * @example
 * extractCalls('foo()') // ['foo']
 */
export function extractCalls(content: string): string[] {
  const calls: string[] = []
  CALL_RE.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = CALL_RE.exec(content)) !== null) {
    const name = m[1]
    if (!name) continue
    // Skip keywords and common non-function identifiers
    if (!/^(if|for|while|switch|catch|return|throw|new|typeof|instanceof|delete|void|class|function|const|let|var|import|export|async|await|yield|true|false|null|undefined|this|super|console)$/.test(name)) {
      calls.push(name)
    }
  }
  return Array.from(new Set(calls))
}

// ─── Extract Events ──────────────────────────────────────

/**
 * Extract event names emitted and listened to
 * @example
 * extractEvents("emitter.emit('change')") // { emitted: ['change'], listened: [] }
 */
export function extractEvents(content: string): { emitted: string[]; listened: string[] } {
  const emitted: string[] = []
  const listened: string[] = []
  let m: RegExpExecArray | null

  EVENT_EMIT_RE.lastIndex = 0
  while ((m = EVENT_EMIT_RE.exec(content)) !== null) {
    const evt = m[1]
    if (evt) emitted.push(evt)
  }

  EVENT_ON_RE.lastIndex = 0
  while ((m = EVENT_ON_RE.exec(content)) !== null) {
    const evt = m[1]
    if (evt) listened.push(evt)
  }

  return { emitted: Array.from(new Set(emitted)), listened: Array.from(new Set(listened)) }
}

// ─── Extract Type References ─────────────────────────────

/**
 * Extract type references from content
 * @example
 * extractTypeReferences('const x: MyType = value') // ['MyType']
 */
export function extractTypeReferences(content: string): string[] {
  const types: string[] = []
  let m: RegExpExecArray | null
  TYPE_REF_RE.lastIndex = 0
  while ((m = TYPE_REF_RE.exec(content)) !== null) {
    const name = m[1] ?? m[2] ?? m[3] ?? m[4]
    if (name && !/^(string|number|boolean|any|void|null|undefined|never|unknown|object|bigint|symbol|Array|Promise|Record|Map|Set|Date|RegExp|Error)$/.test(name)) {
      types.push(name)
    }
  }
  return Array.from(new Set(types))
}

// ─── Map Signals ─────────────────────────────────────────

/**
 * Map all communication signals from a file
 * @example
 * mapSignals(content, 'foo.ts', ['bar.ts']) // Signal[]
 */
export function mapSignals(content: string, filePath: string, _allFiles: string[]): Signal[] {
  const signals: Signal[] = []

  // Export signals
  const exports = extractExports(content)
  for (const exp of exports) {
    signals.push({
      channel: `${filePath}->*`,
      clarity: 50,
      description: `Exported symbol: ${exp}`,
      from: filePath,
      isBroken: false,
      isLossy: false,
      isNoisy: false,
      payload: [exp],
      strength: 50,
      to: '*',
      type: 'export',
    })
  }

  // Import signals
  const imports = extractImports(content)
  for (const imp of imports) {
    signals.push({
      channel: `${imp.source}->${filePath}`,
      clarity: 50,
      description: `Import from ${imp.source}: ${imp.symbols.join(', ')}`,
      from: imp.source,
      isBroken: false,
      isLossy: false,
      isNoisy: false,
      payload: imp.symbols,
      strength: 50,
      to: filePath,
      type: 'import',
    })
  }

  // Call signals
  const calls = extractCalls(content)
  for (const call of calls) {
    signals.push({
      channel: `${filePath}->${call}`,
      clarity: 30,
      description: `Function call: ${call}`,
      from: filePath,
      isBroken: false,
      isLossy: false,
      isNoisy: false,
      payload: [call],
      strength: 30,
      to: call,
      type: 'call',
    })
  }

  // Event signals
  const events = extractEvents(content)
  for (const evt of events.emitted) {
    signals.push({
      channel: `${filePath}->event:${evt}`,
      clarity: 40,
      description: `Emits event: ${evt}`,
      from: filePath,
      isBroken: false,
      isLossy: false,
      isNoisy: false,
      payload: [evt],
      strength: 40,
      to: 'event-bus',
      type: 'event',
    })
  }
  for (const evt of events.listened) {
    signals.push({
      channel: `event:${evt}->${filePath}`,
      clarity: 40,
      description: `Listens to event: ${evt}`,
      from: 'event-bus',
      isBroken: false,
      isLossy: false,
      isNoisy: false,
      payload: [evt],
      strength: 40,
      to: filePath,
      type: 'event',
    })
  }

  // Callback signals
  CALLBACK_RE.lastIndex = 0
  if (CALLBACK_RE.test(content)) {
    signals.push({
      channel: `${filePath}->callback`,
      clarity: 35,
      description: 'Uses callback pattern',
      from: filePath,
      isBroken: false,
      isLossy: false,
      isNoisy: false,
      payload: ['callback'],
      strength: 35,
      to: 'callback',
      type: 'callback',
    })
  }

  // Shared state signals
  SHARED_STATE_RE.lastIndex = 0
  const sharedMatches = content.match(SHARED_STATE_RE)
  if (sharedMatches) {
    const vars = Array.from(new Set(sharedMatches))
    for (const v of vars) {
      signals.push({
        channel: `shared-state:${v}`,
        clarity: 20,
        description: `Shared state access: ${v}`,
        from: 'global',
        isBroken: false,
        isLossy: false,
        isNoisy: true,
        payload: [v],
        strength: 20,
        to: filePath,
        type: 'shared-state',
      })
    }
  }

  // Type-reference signals
  const typeRefs = extractTypeReferences(content)
  for (const t of typeRefs) {
    signals.push({
      channel: `type:${t}->${filePath}`,
      clarity: 60,
      description: `Type reference: ${t}`,
      from: 'type-system',
      isBroken: false,
      isLossy: false,
      isNoisy: false,
      payload: [t],
      strength: 60,
      to: filePath,
      type: 'type-reference',
    })
  }

  return signals
}

// ─── Measure Signal Clarity ──────────────────────────────

/**
 * Measure clarity of a signal based on naming and documentation
 * @example
 * measureSignalClarity(signal, 'export function getUserName() {}') // 80
 */
export function measureSignalClarity(signal: Signal, content: string): number {
  let clarity = 50

  // Good naming: descriptive names (longer than 3 chars, camelCase or snake_case)
  const goodNameRe = /[a-z][a-zA-Z]{3,}/
  const allGood = signal.payload.every((p) => goodNameRe.test(p))
  if (allGood) clarity += 15
  else clarity -= 10

  // JSDoc or documentation present
  const hasJsdoc = /\/\*\*[\s\S]*?\*\//.test(content)
  if (hasJsdoc) clarity += 15

  // Type annotations present
  const hasTypes = /:\s*(string|number|boolean|void|Promise|Record|Map|Set|Array|Date|RegExp|Error|[A-Z]\w+)/.test(content)
  if (hasTypes) clarity += 10

  // Exported interface/type means clear contract
  if (signal.type === 'type-reference' || signal.type === 'export') {
    const hasInterface = /(?:interface|type)\s+\w+/.test(content)
    if (hasInterface) clarity += 10
  }

  // Implicit patterns reduce clarity
  if (signal.type === 'shared-state') clarity -= 15
  if (signal.type === 'callback') clarity -= 5

  // Noisy signals are less clear
  if (signal.isNoisy) clarity -= 10

  return Math.max(0, Math.min(100, clarity))
}

// ─── Measure Signal Strength ─────────────────────────────

/**
 * Measure strength of a signal based on interface definition
 * @example
 * measureSignalStrength(signal, 'export function foo(x: number): string {}') // 85
 */
export function measureSignalStrength(signal: Signal, content: string): number {
  let strength = 40

  // Well-defined interface
  const hasInterface = /(?:interface|type)\s+\w+\s*(?:<[^>]+>)?\s*\{/.test(content)
  if (hasInterface) strength += 20

  // Type-safe: typed parameters
  const hasTypedParams = /\(\s*\w+\s*:\s*\w+/.test(content)
  if (hasTypedParams) strength += 15

  // Return type annotation
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  if (hasReturnType) strength += 10

  // Export visibility (explicit export = stronger signal)
  if (signal.type === 'export') strength += 10

  // Untyped/implicit weaken
  if (signal.type === 'shared-state') strength -= 15
  if (signal.type === 'callback') strength -= 10

  // Lossy signals are weaker
  if (signal.isLossy) strength -= 10

  return Math.max(0, Math.min(100, strength))
}

// ─── Analyze Channels ────────────────────────────────────

/**
 * Analyze communication channels from signals
 * @example
 * analyzeChannels(signals, ['foo.ts', 'bar.ts']) // Channel[]
 */
export function analyzeChannels(signals: Signal[], _files: string[]): Channel[] {
  const channelMap = new Map<string, { signals: Signal[]; type: Channel['type'] }>()

  for (const signal of signals) {
    const key = signal.channel
    const existing = channelMap.get(key)
    if (existing) {
      existing.signals.push(signal)
    } else {
      let channelType: Channel['type'] = 'direct'
      if (signal.type === 'event') channelType = 'event-bus'
      else if (signal.type === 'shared-state') channelType = 'shared-state'
      else if (signal.type === 'callback') channelType = 'callback-chain'
      else if (signal.from === '*' || signal.to === '*') channelType = 'broadcast'
      else if (key.includes('->') && key.split('->').length > 2) channelType = 'indirect'

      channelMap.set(key, { signals: [signal], type: channelType })
    }
  }

  const channels: Channel[] = []
  for (const [path, data] of channelMap) {
    const bandwidth = Array.from(new Set(data.signals.flatMap((s) => s.payload))).length
    const hops = path.split('->').length - 1
    const latency = Math.max(0, hops - 1)

    const brokenCount = data.signals.filter((s) => s.isBroken).length
    const noisyCount = data.signals.filter((s) => s.isNoisy).length
    const ratio = brokenCount + noisyCount * 0.5
    const reliability = Math.max(0, Math.min(100, 100 - ratio * 20))

    let quality: Channel['quality'] = 'clear'
    if (reliability < 30) quality = 'broken'
    else if (reliability < 50) quality = 'degraded'
    else if (reliability < 70) quality = 'noisy'
    else if (reliability < 85) quality = 'acceptable'

    const signalIds = data.signals.map((_, i) => `${path}#${i}`)

    channels.push({
      bandwidth,
      latency,
      path,
      quality,
      reliability,
      signals: signalIds,
      type: data.type,
    })
  }

  return channels
}

// ─── Identify Dead Channels ──────────────────────────────

/**
 * Identify unused or dead communication channels
 * @example
 * identifyDeadChannels(signals, ['foo.ts'], ['export function unused() {}']) // DeadChannel[]
 */
export function identifyDeadChannels(
  _signals: Signal[],
  files: string[],
  contents: string[],
): DeadChannel[] {
  const dead: DeadChannel[] = []

  // Check for deprecated API usage
  for (let i = 0; i < files.length; i++) {
    const file = files[i] ?? ''
    const content = contents[i] ?? ''
    if (DEPRECATED_RE.test(content)) {
      const exports = extractExports(content)
      for (const exp of exports) {
        dead.push({
          description: `Deprecated API still exported: ${exp} in ${file}`,
          from: file,
          reason: 'deprecated-api',
          to: '*',
          type: 'export',
        })
      }
    }
  }

  // Check for unused exports
  const allExported = new Map<string, { file: string; symbol: string }>()
  const allImported = new Set<string>()
  for (let i = 0; i < files.length; i++) {
    const file = files[i] ?? ''
    const content = contents[i] ?? ''
    const exports = extractExports(content)
    for (const exp of exports) {
      allExported.set(`${file}:${exp}`, { file, symbol: exp })
    }
    const imports = extractImports(content)
    for (const imp of imports) {
      for (const sym of imp.symbols) {
        allImported.add(sym)
      }
    }
  }

  for (const [, data] of allExported) {
    if (!allImported.has(data.symbol)) {
      dead.push({
        description: `Unused export: ${data.symbol} in ${data.file}`,
        from: data.file,
        reason: 'unused-export',
        to: '(none)',
        type: 'export',
      })
    }
  }

  // Check for TODO markers indicating dead code paths
  for (let i = 0; i < files.length; i++) {
    const file = files[i] ?? ''
    const content = contents[i] ?? ''
    if (TODO_RE.test(content)) {
      dead.push({
        description: `Potential dead code path (TODO marker) in ${file}`,
        from: file,
        reason: 'dead-code-path',
        to: file,
        type: 'internal',
      })
    }
  }

  return dead
}

// ─── Analyze Tower ───────────────────────────────────────

/**
 * Analyze a file as a signal tower
 * @example
 * analyzeTower(content, 'foo.ts', signals) // SignalTower
 */
export function analyzeTower(content: string, filePath: string, signals: Signal[]): SignalTower {
  const outgoing = signals.filter((s) => s.from === filePath)
  const incoming = signals.filter((s) => s.to === filePath)

  const outgoingCount = outgoing.length
  const incomingCount = incoming.length

  // Clarity: average clarity of all signals for this file
  const allSignals = [...outgoing, ...incoming]
  const clarity = allSignals.length > 0
    ? Math.round(allSignals.reduce((sum, s) => sum + s.clarity, 0) / allSignals.length)
    : 50

  // Is relay: mostly passes signals through (exports that re-export)
  const isRelay = /export\s+\*\s+from/.test(content) || /export\s*\{[^}]*\}\s*from/.test(content)

  // Is broadcaster: sends to many targets
  const isBroadcaster = outgoingCount >= 5

  // Is receiver: receives from many sources
  const isReceiver = incomingCount >= 5

  // Noise level: ratio of noisy signals
  const noisyCount = allSignals.filter((s) => s.isNoisy).length
  const noiseLevel = allSignals.length > 0
    ? Math.round((noisyCount / allSignals.length) * 100)
    : 0

  return {
    clarity,
    file: filePath,
    incomingSignals: incomingCount,
    isBroadcaster,
    isReceiver,
    isRelay,
    noiseLevel,
    outgoingSignals: outgoingCount,
  }
}

// ─── Compute Signal-to-Noise Ratio ──────────────────────

/**
 * Compute signal-to-noise ratio (0-100)
 * @example
 * computeSignalToNoiseRatio(signals) // 75
 */
export function computeSignalToNoiseRatio(signals: Signal[]): number {
  if (signals.length === 0) return 100
  const noisy = signals.filter((s) => s.isNoisy).length
  return Math.round(((signals.length - noisy) / signals.length) * 100)
}

// ─── Compute Channel Reliability ─────────────────────────

/**
 * Compute average channel reliability (0-100)
 * @example
 * computeChannelReliability(channels) // 80
 */
export function computeChannelReliability(channels: Channel[]): number {
  if (channels.length === 0) return 100
  return Math.round(channels.reduce((sum, c) => sum + c.reliability, 0) / channels.length)
}

// ─── Compute Communication Efficiency ────────────────────

/**
 * Compute communication efficiency (0-100)
 * @example
 * computeCommunicationEfficiency(signals, channels) // 70
 */
export function computeCommunicationEfficiency(signals: Signal[], channels: Channel[]): number {
  if (signals.length === 0) return 100

  const avgClarity = signals.reduce((sum, s) => sum + s.clarity, 0) / signals.length
  const avgStrength = signals.reduce((sum, s) => sum + s.strength, 0) / signals.length
  const avgReliability = channels.length > 0
    ? channels.reduce((sum, c) => sum + c.reliability, 0) / channels.length
    : 80

  return Math.round((avgClarity * 0.3 + avgStrength * 0.3 + avgReliability * 0.4))
}

// ─── Classify Overall Clarity ────────────────────────────

/**
 * Classify overall communication clarity
 * @example
 * classifyOverallClarity(90, 85, 80) // 'crystal-clear'
 */
export function classifyOverallClarity(
  snr: number,
  reliability: number,
  efficiency: number,
): SemaphoreStats['overallClarity'] {
  const score = snr * 0.3 + reliability * 0.3 + efficiency * 0.4

  if (score >= 80) return 'crystal-clear'
  if (score >= 60) return 'clear'
  if (score >= 40) return 'static'
  if (score >= 20) return 'noisy'
  return 'broken'
}

// ─── Compute Stats ───────────────────────────────────────

/**
 * Compute aggregate statistics
 * @example
 * computeStats(signals, channels, towers, dead) // SemaphoreStats
 */
export function computeStats(
  signals: Signal[],
  channels: Channel[],
  towers: SignalTower[],
  dead: DeadChannel[],
): SemaphoreStats {
  const clearSignals = signals.filter((s) => s.clarity >= 70 && !s.isNoisy && !s.isBroken).length
  const noisySignals = signals.filter((s) => s.isNoisy).length
  const lossySignals = signals.filter((s) => s.isLossy).length
  const brokenSignals = signals.filter((s) => s.isBroken).length

  const clearChannels = channels.filter((c) => c.quality === 'clear' || c.quality === 'acceptable').length
  const degradedChannels = channels.filter((c) => c.quality === 'degraded' || c.quality === 'noisy').length
  const brokenChannels = channels.filter((c) => c.quality === 'broken').length

  const broadcasters = towers.filter((t) => t.isBroadcaster).length
  const receivers = towers.filter((t) => t.isReceiver).length
  const relays = towers.filter((t) => t.isRelay).length

  const avgClarity = signals.length > 0
    ? Math.round(signals.reduce((sum, s) => sum + s.clarity, 0) / signals.length)
    : 100
  const avgStrength = signals.length > 0
    ? Math.round(signals.reduce((sum, s) => sum + s.strength, 0) / signals.length)
    : 100
  const avgNoiseLevel = towers.length > 0
    ? Math.round(towers.reduce((sum, t) => sum + t.noiseLevel, 0) / towers.length)
    : 0

  const signalToNoiseRatio = computeSignalToNoiseRatio(signals)
  const channelReliability = computeChannelReliability(channels)
  const communicationEfficiency = computeCommunicationEfficiency(signals, channels)
  const overallClarity = classifyOverallClarity(signalToNoiseRatio, channelReliability, communicationEfficiency)

  return {
    avgClarity,
    avgNoiseLevel,
    avgStrength,
    brokenChannels,
    brokenSignals,
    broadcasters,
    clearChannels,
    clearSignals,
    communicationEfficiency,
    degradedChannels,
    lossySignals,
    noisySignals,
    overallClarity,
    receivers,
    relays,
    signalToNoiseRatio,
    totalChannels: channels.length,
    totalDeadChannels: dead.length,
    totalSignals: signals.length,
    totalTowers: towers.length,
    channelReliability,
  }
}

// ─── Generate Recommendations ────────────────────────────

/**
 * Generate recommendations based on analysis
 * @example
 * generateRecommendations(signals, channels, towers, dead, stats) // ['Fix broken signals...']
 */
export function generateRecommendations(
  _signals: Signal[],
  _channels: Channel[],
  towers: SignalTower[],
  dead: DeadChannel[],
  stats: SemaphoreStats,
): string[] {
  const recs: string[] = []

  if (stats.brokenSignals > 0) {
    recs.push(`Fix ${stats.brokenSignals} broken signal(s) with mismatched interfaces`)
  }

  if (stats.noisySignals > 0) {
    recs.push(`Reduce coupling in ${stats.noisySignals} noisy signal(s)`)
  }

  if (stats.totalDeadChannels > 0) {
    const unusedExports = dead.filter((d) => d.reason === 'unused-export').length
    if (unusedExports > 0) {
      recs.push(`Remove ${unusedExports} unused export(s) to clean dead channels`)
    }
    const deprecated = dead.filter((d) => d.reason === 'deprecated-api').length
    if (deprecated > 0) {
      recs.push(`Migrate away from ${deprecated} deprecated API(s)`)
    }
  }

  if (stats.degradedChannels > 0) {
    recs.push(`Improve type safety in ${stats.degradedChannels} degraded channel(s)`)
  }

  const highNoiseTowers = towers.filter((t) => t.noiseLevel > 50)
  if (highNoiseTowers.length > 0) {
    recs.push(`Clean up API in ${highNoiseTowers.length} high-noise tower(s): ${highNoiseTowers.map((t) => t.file).join(', ')}`)
  }

  if (stats.overallClarity === 'broken') {
    recs.push('Critical: Communication patterns are severely degraded. Consider a major refactoring pass.')
  } else if (stats.overallClarity === 'noisy') {
    recs.push('Communication patterns need attention. Focus on reducing shared state and improving type coverage.')
  }

  return recs
}

// ─── Build Semaphore Result ──────────────────────────────

/**
 * Build the full semaphore analysis result
 * @example
 * buildSemaphoreResult(['foo.ts'], ['export function hello() {}'], {}) // SemaphoreResult
 */
export function buildSemaphoreResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): SemaphoreResult {
  const allSignals: Signal[] = []

  // Map signals for each file
  for (let i = 0; i < files.length; i++) {
    const file = files[i] ?? ''
    const content = contents[i] ?? ''
    const fileSignals = mapSignals(content, file, files)

    // Measure clarity and strength for each signal
    for (const signal of fileSignals) {
      signal.clarity = measureSignalClarity(signal, content)
      signal.strength = measureSignalStrength(signal, content)
    }

    allSignals.push(...fileSignals)
  }

  // Analyze channels
  const channels = analyzeChannels(allSignals, files)

  // Analyze towers
  const towers: SignalTower[] = []
  for (let i = 0; i < files.length; i++) {
    const file = files[i] ?? ''
    const content = contents[i] ?? ''
    const tower = analyzeTower(content, file, allSignals)
    towers.push(tower)
  }

  // Identify dead channels
  const deadChannels = identifyDeadChannels(allSignals, files, contents)

  // Compute stats
  const stats = computeStats(allSignals, channels, towers, deadChannels)

  // Generate recommendations
  const recommendations = generateRecommendations(allSignals, channels, towers, deadChannels, stats)

  return {
    channels,
    deadChannels,
    recommendations,
    signals: allSignals,
    stats,
    towers,
  }
}
