import { describe, expect, it } from 'vitest'
import {
  analyzePulsarCluster,
  analyzePulsarNode,
  buildMagnetarPulseResult,
  classifyAstrophysicistGrade,
  classifyClusterCondition,
  classifyClusterType,
  classifyNodeCondition,
  generateRecommendations,
  measureBurst,
  measureEmission,
  measureEnergy,
  measureMagnetic,
  measureNebula,
  measurePulse,
  measureRadiation,
  type PulsarNode,
} from '../src/commands/magnetar-pulse-helpers.js'
import {
  formatMagnetarPulseCsv,
  formatMagnetarPulseJson,
  formatMagnetarPulseTable,
} from '../src/commands/magnetar-pulse-format-helpers.js'

describe('measurePulse', () => {
  it('returns zero intensity for empty content', () => {
    const pulse = measurePulse('')
    expect(pulse.intensity).toBe(0)
    expect(pulse.pulseType).toBe('black-dwarf')
  })

  it('detects high intensity for active code', () => {
    const code = [
      'export function a() {}',
      'export function b() {}',
      'export function c() {}',
      'if (x) { y() }',
      'for (let i = 0; i < 5; i++) {}',
    ].join('\n')
    const pulse = measurePulse(code)
    expect(pulse.intensity).toBeGreaterThan(20)
  })

  it('detects magnetar type for very high intensity', () => {
    const code = Array.from({ length: 8 }, (_, i) => `export function fn${i}() {}`).join('\n')
    const pulse = measurePulse(code)
    expect(pulse.pulseType).toBe('magnetar')
  })

  it('detects millisecond pulsar for stable high output', () => {
    const code = [
      'export function a() {}',
      'export function b() {}',
      'export function c() {}',
      'export function d() {}',
      'export function e() {}',
    ].join('\n')
    const pulse = measurePulse(code)
    expect(['millisecond-pulsar', 'magnetar']).toContain(pulse.pulseType)
  })

  it('detects black dwarf for empty code', () => {
    const pulse = measurePulse('')
    expect(pulse.pulseType).toBe('black-dwarf')
  })

  it('detects glitches from TODO markers', () => {
    const code = 'export function a() {}\n// TODO: fix this'
    const pulse = measurePulse(code)
    expect(pulse.hasGlitch).toBe(true)
    expect(pulse.glitchCount).toBe(1)
  })

  it('detects nulling for code with no functions', () => {
    const code = ['const a = 1', 'const b = 2', 'const c = 3', 'const d = 4', 'const e = 5', 'const f = 6'].join('\n')
    const pulse = measurePulse(code)
    expect(pulse.hasNulling).toBe(true)
  })

  it('detects giant pulse for many functions', () => {
    const code = Array.from({ length: 11 }, (_, i) => `function fn${i}() {}`).join('\n')
    const pulse = measurePulse(code)
    expect(pulse.hasGiantPulse).toBe(true)
  })

  it('detects stable pulse for consistent code', () => {
    const code = 'export function a() {}\nexport function b() {}'
    const pulse = measurePulse(code)
    expect(pulse.isStable).toBe(true)
  })

  it('detects variable pulse for glitchy code', () => {
    const code = 'export function a() {}\n// TODO: fix'
    const pulse = measurePulse(code)
    expect(pulse.isVariable).toBe(true)
  })
})

describe('measureMagnetic', () => {
  it('returns zero for no imports or exports', () => {
    const mag = measureMagnetic('const x = 1')
    expect(mag.fieldStrength).toBe(0)
    expect(mag.hasWeakField).toBe(true)
  })

  it('detects strong field from many connections', () => {
    const code = Array.from({ length: 5 }, (_, i) => `import { m${i} } from "./m${i}"`).join('\n')
      + '\n' + Array.from({ length: 4 }, (_, i) => `export function fn${i}() {}`).join('\n')
    const mag = measureMagnetic(code)
    expect(mag.hasStrongField).toBe(true)
  })

  it('detects reversal from unbalanced imports and exports', () => {
    const code = Array.from({ length: 6 }, (_, i) => `import { m${i} } from "./m${i}"`).join('\n')
      + '\nexport function a() {}'
    const mag = measureMagnetic(code)
    expect(mag.hasReversal).toBe(true)
  })

  it('detects multipole from many imports and exports', () => {
    const code = Array.from({ length: 5 }, (_, i) => `import { m${i} } from "./m${i}"`).join('\n')
      + '\n' + Array.from({ length: 5 }, (_, i) => `export function fn${i}() {}`).join('\n')
    const mag = measureMagnetic(code)
    expect(mag.hasMultipole).toBe(true)
  })

  it('detects aligned from balanced imports and exports', () => {
    const code = 'import { a } from "./x"\nimport { b } from "./y"\nexport function c() {}\nexport function d() {}'
    const mag = measureMagnetic(code)
    expect(mag.isAligned).toBe(true)
  })

  it('counts poles correctly', () => {
    const code = 'import { a } from "./x"\nexport function b() {}'
    const mag = measureMagnetic(code)
    expect(mag.poleCount).toBe(2)
  })
})

describe('measureEmission', () => {
  it('returns none dominant for empty code', () => {
    const em = measureEmission('')
    expect(em.dominantEmission).toBe('none')
    expect(em.emissionTypes).toHaveLength(0)
  })

  it('detects radio emission from return statements', () => {
    const code = 'function process() { return 42 }'
    const em = measureEmission(code)
    expect(em.hasRadioEmission).toBe(true)
    expect(em.emissionTypes).toContain('radio')
  })

  it('detects radio emission from console calls', () => {
    const code = 'console.log("hello")'
    const em = measureEmission(code)
    expect(em.hasRadioEmission).toBe(true)
  })

  it('detects x-ray emission from side effects', () => {
    const code = 'fs.readFile("path")'
    const em = measureEmission(code)
    expect(em.hasXRayEmission).toBe(true)
    expect(em.emissionTypes).toContain('x-ray')
  })

  it('detects gamma ray from critical operations', () => {
    const code = 'delete obj.key\nwriteFile("path", data)'
    const em = measureEmission(code)
    expect(em.hasGammaRay).toBe(true)
    expect(em.emissionTypes).toContain('gamma-ray')
  })

  it('detects optical emission from UI code', () => {
    const code = 'render(component)\ndocument.getElementById("app")'
    const em = measureEmission(code)
    expect(em.hasOpticalEmission).toBe(true)
  })

  it('detects infrared from async operations', () => {
    const code = 'async function load() { await fetch("/api") }'
    const em = measureEmission(code)
    expect(em.hasInfraredEmission).toBe(true)
  })

  it('calculates spectrum from emission types', () => {
    const code = 'return data\nconsole.log("hi")\nfetch("/api")\ndelete obj.key'
    const em = measureEmission(code)
    expect(em.spectrum).toBeGreaterThan(0)
  })
})

describe('measureBurst', () => {
  it('returns zero frequency for empty code', () => {
    const burst = measureBurst('')
    expect(burst.frequency).toBe(0)
    expect(burst.isQuiescent).toBe(true)
  })

  it('detects regular bursts for moderate activity', () => {
    const code = [
      'function a() {}',
      'function b() {}',
      'function c() {}',
      'if (x) {}',
    ].join('\n')
    const burst = measureBurst(code)
    expect(burst.frequency).toBeGreaterThan(0)
  })

  it('detects hyperactive for very frequent changes', () => {
    const code = Array.from({ length: 12 }, (_, i) => `function fn${i}() { if (x${i}) {} }`).join('\n')
    const burst = measureBurst(code)
    expect(burst.isHyperactive).toBe(true)
  })

  it('detects soft gamma repeater from many TODOs', () => {
    const code = 'function a() {}\n// TODO: fix1\n// TODO: fix2\n// FIXME: fix3'
    const burst = measureBurst(code)
    expect(burst.hasSoftGammaRepeater).toBe(true)
  })

  it('detects anomalous x-ray from deprecation', () => {
    const code = '/** @deprecated */\nfunction old() {}'
    const burst = measureBurst(code)
    expect(burst.hasAnomalousXRay).toBe(true)
  })

  it('detects active for moderate frequency', () => {
    const code = [
      'function a() {}',
      'function b() {}',
      'function c() {}',
      'function d() {}',
      'if (x) {}',
    ].join('\n')
    const burst = measureBurst(code)
    expect(burst.isActive).toBe(true)
  })
})

describe('measureEnergy', () => {
  it('returns zero for empty code', () => {
    const energy = measureEnergy('')
    expect(energy.output).toBe(0)
    expect(energy.luminosityClass).toBe('brown-dwarf')
  })

  it('detects supergiant for highly productive code', () => {
    const code = Array.from({ length: 6 }, (_, i) => `export function fn${i}() { return ${i} }`).join('\n')
      + '\nexport class Service {}'
    const energy = measureEnergy(code)
    expect(energy.output).toBeGreaterThan(50)
    expect(energy.hasHighLuminosity).toBe(true)
  })

  it('detects low luminosity for minimal code', () => {
    const energy = measureEnergy('const x = 1')
    expect(energy.hasLowLuminosity).toBe(true)
  })

  it('detects accretion from deep nesting', () => {
    const code = 'function a() {\n  function b() {\n    function c() {\n      return 1\n    }\n  }\n}'
    const energy = measureEnergy(code)
    expect(energy.hasAccretion).toBe(true)
  })

  it('detects outflow from exports and returns', () => {
    const code = 'export function core() { return 42 }'
    const energy = measureEnergy(code)
    expect(energy.hasOutflow).toBe(true)
  })

  it('calculates efficiency', () => {
    const code = 'export function a() { return 1 }'
    const energy = measureEnergy(code)
    expect(energy.efficiency).toBeGreaterThan(0)
  })
})

describe('measureRadiation', () => {
  it('returns zero level for empty code', () => {
    const rad = measureRadiation('')
    expect(rad.level).toBe(0)
    expect(rad.isSafe).toBe(true)
  })

  it('detects shielding from try-catch', () => {
    const code = 'try { work() } catch(e) { handle(e) }'
    const rad = measureRadiation(code)
    expect(rad.hasShielding).toBe(true)
    expect(rad.shieldingCount).toBeGreaterThan(0)
  })

  it('detects ionizing radiation for unprotected code', () => {
    const code = Array.from({ length: 30 }, (_, i) => `const x${i} = ${i}`).join('\n')
    const rad = measureRadiation(code)
    expect(rad.hasIonizingRadiation).toBe(true)
  })

  it('detects non-ionizing for well-protected code', () => {
    const code = [
      'function process(x: number): number { return x }',
      'try { process(1) } catch(e) {}',
      "it('works', () => {})",
    ].join('\n')
    const rad = measureRadiation(code)
    expect(rad.hasNonIonizing).toBe(true)
  })

  it('detects radiation belts from tests and shielding', () => {
    const code = "try { work() } catch(e) {}\nit('test', () => {})"
    const rad = measureRadiation(code)
    expect(rad.hasRadiationBelts).toBe(true)
  })

  it('detects dangerous from high risk', () => {
    const code = Array.from({ length: 30 }, (_, i) => `const x${i} = ${i}`).join('\n')
    const rad = measureRadiation(code)
    expect(rad.isDangerous).toBe(true)
  })

  it('counts shielding correctly', () => {
    const code = 'try { a() } catch(e) {}\ntry { b() } catch(e) {}\npromise.catch(e => {})'
    const rad = measureRadiation(code)
    expect(rad.shieldingCount).toBe(3)
  })
})

describe('measureNebula', () => {
  it('returns clear for clean code', () => {
    const nebula = measureNebula('function clean() { return 1 }')
    expect(nebula.isClear).toBe(true)
    expect(nebula.hasRemnant).toBe(false)
    expect(nebula.hasDebris).toBe(false)
  })

  it('detects remnant from deprecated code', () => {
    const nebula = measureNebula('/** @deprecated */\nfunction old() {}')
    expect(nebula.hasRemnant).toBe(true)
  })

  it('detects debris from TODOs', () => {
    const nebula = measureNebula('function a() {}\n// TODO: fix')
    expect(nebula.hasDebris).toBe(true)
    expect(nebula.debrisCount).toBe(1)
  })

  it('detects protoplanetary from heavy documentation', () => {
    const code = Array.from({ length: 7 }, (_, i) => `// Comment ${i}`).join('\n')
      + '\n/** Doc 1 */\n/** Doc 2 */\n/** Doc 3 */'
    const nebula = measureNebula(code)
    expect(nebula.hasProtoplanetary).toBe(true)
  })
})

describe('classifyNodeCondition', () => {
  it('classifies magnetar-burst for high scores', () => {
    expect(classifyNodeCondition(80, 80, 80)).toBe('magnetar-burst')
  })

  it('classifies pulsar-beam for good energy output', () => {
    expect(classifyNodeCondition(65, 55, 55)).toBe('pulsar-beam')
  })

  it('classifies steady-star for moderate scores', () => {
    expect(classifyNodeCondition(50, 40, 40)).toBe('steady-star')
  })

  it('classifies red-dwarf for low scores', () => {
    expect(classifyNodeCondition(30, 25, 25)).toBe('red-dwarf')
  })

  it('classifies brown-dwarf for very low scores', () => {
    expect(classifyNodeCondition(15, 15, 15)).toBe('brown-dwarf')
  })

  it('classifies dead-star for critically low scores', () => {
    expect(classifyNodeCondition(5, 5, 5)).toBe('dead-star')
  })
})

describe('classifyClusterType', () => {
  it('returns void for empty nodes', () => {
    expect(classifyClusterType([])).toBe('void')
  })

  it('classifies globular-cluster for high energy', () => {
    const nodes = Array.from({ length: 10 }, () => ({
      pulseIntensity: 75, condition: 'magnetar-burst',
    } as unknown as PulsarNode))
    expect(classifyClusterType(nodes)).toBe('globular-cluster')
  })

  it('classifies dark-nebula for many dead stars', () => {
    const nodes = Array.from({ length: 6 }, () => ({
      pulseIntensity: 5, condition: 'dead-star',
    } as unknown as PulsarNode))
    expect(classifyClusterType(nodes)).toBe('dark-nebula')
  })
})

describe('classifyClusterCondition', () => {
  it('returns brilliant-cluster for top scores', () => {
    expect(classifyClusterCondition(85, 85)).toBe('brilliant-cluster')
  })

  it('returns active-cluster for good scores', () => {
    expect(classifyClusterCondition(65, 60)).toBe('active-cluster')
  })

  it('returns quiet-cluster for moderate scores', () => {
    expect(classifyClusterCondition(45, 45)).toBe('quiet-cluster')
  })

  it('returns dim-cluster for low scores', () => {
    expect(classifyClusterCondition(30, 30)).toBe('dim-cluster')
  })

  it('returns dark-cluster for very low scores', () => {
    expect(classifyClusterCondition(15, 15)).toBe('dark-cluster')
  })

  it('returns empty-space for critically low scores', () => {
    expect(classifyClusterCondition(3, 3)).toBe('empty-space')
  })
})

describe('classifyAstrophysicistGrade', () => {
  it('returns pulsar-astronomer for top energy', () => {
    expect(classifyAstrophysicistGrade(90)).toBe('pulsar-astronomer')
  })

  it('returns radio-astronomer for high energy', () => {
    expect(classifyAstrophysicistGrade(70)).toBe('radio-astronomer')
  })

  it('returns xray-astronomer for moderate energy', () => {
    expect(classifyAstrophysicistGrade(55)).toBe('xray-astronomer')
  })

  it('returns amateur for low energy', () => {
    expect(classifyAstrophysicistGrade(40)).toBe('amateur')
  })

  it('returns stargazer for very low energy', () => {
    expect(classifyAstrophysicistGrade(25)).toBe('stargazer')
  })

  it('returns blind for critically low energy', () => {
    expect(classifyAstrophysicistGrade(10)).toBe('blind')
  })
})

describe('analyzePulsarNode', () => {
  it('handles empty content', () => {
    const node = analyzePulsarNode('', 'empty.ts')
    expect(node.pulseIntensity).toBe(0)
    expect(node.qualityScore).toBeLessThanOrEqual(100)
    expect(node.condition).toBeDefined()
  })

  it('produces well-structured node for rich code', () => {
    const code = [
      'export function process(data: string): string {',
      '  try {',
      '    return data.toUpperCase()',
      '  } catch(e) {',
      '    throw e',
      '  }',
      '}',
      "it('test', () => {})",
    ].join('\n')
    const node = analyzePulsarNode(code, 'core.ts')
    expect(node.pulseIntensity).toBeGreaterThan(0)
    expect(node.energy.hasOutflow).toBe(true)
    expect(node.radiation.hasShielding).toBe(true)
    expect(node.qualityScore).toBeGreaterThan(0)
  })

  it('calculates quality score from all measures', () => {
    const code = 'export function f(x: number): number { return x }'
    const node = analyzePulsarNode(code, 'f.ts')
    expect(node.qualityScore).toBeGreaterThan(0)
    expect(node.qualityScore).toBeLessThanOrEqual(100)
  })
})

describe('analyzePulsarCluster', () => {
  it('returns empty-space for empty nodes', () => {
    const cluster = analyzePulsarCluster([], 'empty')
    expect(cluster.clusterType).toBe('void')
    expect(cluster.condition).toBe('empty-space')
    expect(cluster.nodes).toHaveLength(0)
  })

  it('aggregates node data into cluster averages', () => {
    const code = 'export function a() {}'
    const node = analyzePulsarNode(code, 'src/a.ts')
    const cluster = analyzePulsarCluster([node], 'src')
    expect(cluster.avgPulseIntensity).toBe(node.pulseIntensity)
    expect(cluster.directory).toBe('src')
    expect(cluster.nodes).toHaveLength(1)
  })
})

describe('generateRecommendations', () => {
  it('returns positive recommendation for healthy galaxy', () => {
    const recs = generateRecommendations([], [], {
      avgPulseIntensity: 80, avgMagneticField: 80, avgEnergyOutput: 80,
      isEnergetic: true, overallEnergy: 80,
    }, {
      isDangerousCount: 0, hasGlitchCount: 0, hasGammaRayCount: 0,
      deadStarCount: 0, lowLuminosityCount: 2, hasStrongFieldCount: 1,
      hasReversalCount: 0, totalFiles: 10,
    } as any)
    expect(recs.length).toBeGreaterThan(0)
    expect(recs[0]).toContain('healthy')
  })

  it('recommends fixing dangerous nodes', () => {
    const recs = generateRecommendations([], [], {
      avgPulseIntensity: 60, avgMagneticField: 60, avgEnergyOutput: 60,
      isEnergetic: true, overallEnergy: 60,
    }, {
      isDangerousCount: 3, hasGlitchCount: 0, hasGammaRayCount: 0,
      deadStarCount: 0, lowLuminosityCount: 2, hasStrongFieldCount: 1,
      hasReversalCount: 0, totalFiles: 10,
    } as any)
    expect(recs.some((r) => r.includes('dangerous'))).toBe(true)
  })

  it('warns about critically low energy', () => {
    const recs = generateRecommendations([], [], {
      avgPulseIntensity: 20, avgMagneticField: 20, avgEnergyOutput: 20,
      isEnergetic: false, overallEnergy: 20,
    }, {
      isDangerousCount: 0, hasGlitchCount: 0, hasGammaRayCount: 0,
      deadStarCount: 0, lowLuminosityCount: 5, hasStrongFieldCount: 1,
      hasReversalCount: 0, totalFiles: 10,
    } as any)
    expect(recs.some((r) => r.includes('critically low'))).toBe(true)
  })
})

describe('buildMagnetarPulseResult', () => {
  it('returns valid result for empty input', () => {
    const result = buildMagnetarPulseResult([], [], {})
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalClusters).toBe(0)
    expect(result.nodes).toHaveLength(0)
    expect(result.clusters).toHaveLength(0)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('analyzes a single file', () => {
    const code = 'export function main(x: number): number { try { return x } catch(e) { throw e } }'
    const result = buildMagnetarPulseResult(['core.ts'], [code], {})
    expect(result.stats.totalFiles).toBe(1)
    expect(result.nodes).toHaveLength(1)
    expect(result.nodes[0].file).toBe('core.ts')
    expect(result.nodes[0].pulseIntensity).toBeGreaterThan(0)
  })

  it('groups files by directory', () => {
    const code = 'export function a() {}'
    const result = buildMagnetarPulseResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [code, code, code],
      {},
    )
    expect(result.clusters.length).toBe(2)
  })

  it('computes galaxy averages', () => {
    const code = 'export function core(): void {}'
    const result = buildMagnetarPulseResult(['a.ts', 'b.ts'], [code, code], {})
    expect(result.galaxy.avgPulseIntensity).toBeGreaterThan(0)
    expect(result.galaxy.overallEnergy).toBeGreaterThan(0)
  })

  it('computes stats correctly', () => {
    const code = 'export function a() {}'
    const result = buildMagnetarPulseResult(['a.ts'], [code], {})
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.astrophysicistGrade).toBeDefined()
    expect(result.stats.mostIntense).toBe('a.ts')
  })

  it('classifies astrophysicist grade based on energy', () => {
    const richCode = Array.from({ length: 6 }, (_, i) => `export function fn${i}() { return ${i} }`).join('\n')
      + '\nexport class Service {}\nexport interface ICore {}'
    const result = buildMagnetarPulseResult(['core.ts'], [richCode], {})
    expect(result.galaxy.overallEnergy).toBeGreaterThan(0)
    expect(result.stats.astrophysicistGrade).toBeDefined()
  })
})

describe('formatMagnetarPulseTable', () => {
  it('produces non-empty table output', () => {
    const result = buildMagnetarPulseResult(['a.ts'], ['export function a() {}'], {})
    const output = formatMagnetarPulseTable(result, false)
    expect(output.length).toBeGreaterThan(0)
    expect(output).toContain('Magnetar Pulse Report')
  })

  it('includes verbose details when enabled', () => {
    const result = buildMagnetarPulseResult(['a.ts'], ['export function a() {}'], {})
    const output = formatMagnetarPulseTable(result, true)
    expect(output).toContain('Pulsar Nodes')
  })
})

describe('formatMagnetarPulseJson', () => {
  it('produces valid JSON', () => {
    const result = buildMagnetarPulseResult(['a.ts'], ['function a() {}'], {})
    const json = formatMagnetarPulseJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalFiles).toBe(1)
  })
})

describe('formatMagnetarPulseCsv', () => {
  it('produces CSV with headers', () => {
    const result = buildMagnetarPulseResult(['a.ts'], ['export function a() {}'], {})
    const csv = formatMagnetarPulseCsv(result)
    const lines = csv.split('\n')
    expect(lines[0]).toContain('file')
    expect(lines.length).toBeGreaterThan(1)
  })
})

describe('integration: full pipeline', () => {
  it('analyzes a realistic multi-file codebase', () => {
    const files = ['src/core.ts', 'src/utils.ts', 'src/api.ts']
    const contents = [
      [
        'export function process(data: string): string {',
        '  try {',
        '    return data.toUpperCase()',
        '  } catch(e) {',
        '    throw e',
        '  }',
        '}',
        'export function validate(input: unknown): boolean {',
        '  return typeof input === "string"',
        '}',
      ].join('\n'),
      'function helper() { return 1 }\nfunction helper2() { return 2 }',
      [
        'import { process } from "./core"',
        'export async function fetchData(url: string): Promise<string> {',
        '  const res = await fetch(url)',
        '  return res.text()',
        '}',
      ].join('\n'),
    ]
    const result = buildMagnetarPulseResult(files, contents, {})
    expect(result.nodes).toHaveLength(3)
    expect(result.clusters.length).toBeGreaterThan(0)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.galaxy.overallEnergy).toBeGreaterThan(0)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})
