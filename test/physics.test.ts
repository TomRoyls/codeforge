import { describe, expect, it } from 'vitest'

import {
  buildPhysicsResult,
  classifyTrajectory,
  computeAcceleration,
  computeAttraction,
  computeCenterOfMass,
  computeDensity,
  computeEnergy,
  computeEntropy,
  computeFriction,
  computeGravity,
  computeHeatCapacity,
  computeKineticEnergy,
  computeMass,
  computeMomentum,
  computePressure,
  computeRepulsion,
  computeSystemStability,
  computeTemperature,
  computeTension,
  computeVelocity,
  computeVolume,
  determineEquilibrium,
  findCenterOfGravity,
  generateRecommendations,
  type CodeMass,
  type Forces,
  type Kinematics,
  type Thermodynamics,
  type PhysicsStats,
} from '../src/commands/physics-helpers.js'

import {
  formatPhysicsJSON,
  formatPhysicsTable,
  formatForceDiagram,
  formatMassDistribution,
  formatVelocityChart,
  formatEntropyMeter,
  formatPhysicsStats,
  formatPhysicsRecommendations,
} from '../src/commands/physics-format-helpers.js'

// ─── computeMass ────────────────────────────────────────────────────────────────

describe('computeMass', () => {
  it('returns 0 for empty content', () => {
    expect(computeMass('')).toBe(0)
  })

  it('counts non-blank lines', () => {
    expect(computeMass('a\nb\nc')).toBe(3)
  })

  it('ignores blank lines', () => {
    expect(computeMass('a\n\n\nc')).toBe(2)
  })
})

// ─── computeDensity ─────────────────────────────────────────────────────────────

describe('computeDensity', () => {
  it('returns 0 for empty content', () => {
    expect(computeDensity('')).toBe(0)
  })

  it('returns 100 for all code lines', () => {
    expect(computeDensity('const x = 1\nconst y = 2')).toBe(100)
  })

  it('excludes comment lines', () => {
    const content = 'const x = 1\n// comment'
    expect(computeDensity(content)).toBe(50)
  })

  it('excludes blank lines', () => {
    const content = 'const x = 1\n\nconst y = 2'
    expect(computeDensity(content)).toBe(67)
  })
})

// ─── computeVolume ──────────────────────────────────────────────────────────────

describe('computeVolume', () => {
  it('returns character count', () => {
    expect(computeVolume('hello')).toBe(5)
  })

  it('returns 0 for empty', () => {
    expect(computeVolume('')).toBe(0)
  })
})

// ─── computeCenterOfMass ────────────────────────────────────────────────────────

describe('computeCenterOfMass', () => {
  it('returns 0 for empty content', () => {
    expect(computeCenterOfMass('')).toBe(0)
  })

  it('returns median line for odd count', () => {
    expect(computeCenterOfMass('a\nb\nc')).toBe(2)
  })

  it('returns average of middle two for even count', () => {
    expect(computeCenterOfMass('a\n\nb')).toBe(2)
  })

  it('ignores blank lines', () => {
    const content = 'a\n\n\nb'
    const com = computeCenterOfMass(content)
    expect(com).toBeGreaterThanOrEqual(1)
    expect(com).toBeLessThanOrEqual(4)
  })
})

// ─── computeAttraction ──────────────────────────────────────────────────────────

describe('computeAttraction', () => {
  it('returns 0 for no imports', () => {
    expect(computeAttraction(['a.ts'], ['const x = 1'])).toBe(0)
  })

  it('increases with imports', () => {
    const content = "import { x } from './b'\nimport { y } from './c'"
    expect(computeAttraction(['a.ts', 'b.ts', 'c.ts'], [content, '', ''])).toBeGreaterThan(0)
  })
})

// ─── computeRepulsion ───────────────────────────────────────────────────────────

describe('computeRepulsion', () => {
  it('returns 0 for consistent patterns', () => {
    expect(computeRepulsion(['a.ts'], ['const myVar = 1'])).toBe(0)
  })

  it('increases with mixed naming', () => {
    expect(computeRepulsion(['a.ts', 'b.ts'], ['const myVar = 1', 'const my_var = 2'])).toBeGreaterThan(0)
  })

  it('increases with mixed async styles', () => {
    const a = 'async function run() { await work() }'
    const b = 'function run(cb) { work().then(cb) }'
    expect(computeRepulsion(['a.ts', 'b.ts'], [a, b])).toBeGreaterThan(0)
  })
})

// ─── computeFriction ────────────────────────────────────────────────────────────

describe('computeFriction', () => {
  it('returns low for simple code', () => {
    expect(computeFriction(['a.ts'], ['const x = 1'])).toBeLessThan(50)
  })

  it('increases with complexity and coupling', () => {
    const complex = "import { a } from './x'\nif (x) { for (let i = 0; i < 10; i++) { while (y) { switch(z) {} } } }"
    const simple = 'const x = 1'
    expect(computeFriction(['a.ts'], [complex])).toBeGreaterThan(computeFriction(['a.ts'], [simple]))
  })
})

// ─── computeTension ─────────────────────────────────────────────────────────────

describe('computeTension', () => {
  it('returns 0 for simple files', () => {
    expect(computeTension(['a.ts'], ['const x = 1'])).toBe(0)
  })

  it('increases with many imports', () => {
    const content = Array(10).fill("import { x } from './mod'").join('\n')
    expect(computeTension(['a.ts'], [content])).toBeGreaterThan(0)
  })
})

// ─── computeGravity ─────────────────────────────────────────────────────────────

describe('computeGravity', () => {
  it('computes gravity from forces and masses', () => {
    const forces: Forces = { attraction: 50, repulsion: 10, friction: 20, tension: 10, gravity: 0 }
    const masses: CodeMass[] = [{ file: 'a.ts', mass: 100, density: 80, volume: 500, centerOfMass: 50 }]
    const g = computeGravity(forces, masses)
    expect(g).toBeGreaterThan(0)
    expect(g).toBeLessThanOrEqual(100)
  })
})

// ─── computeVelocity ────────────────────────────────────────────────────────────

describe('computeVelocity', () => {
  it('returns 0 for clean code', () => {
    expect(computeVelocity('const x = 1')).toBe(0)
  })

  it('increases with TODOs', () => {
    expect(computeVelocity('TODO: fix this')).toBeGreaterThan(0)
  })

  it('increases with any usage', () => {
    expect(computeVelocity('const x: any = 1')).toBeGreaterThan(0)
  })
})

// ─── computeAcceleration ────────────────────────────────────────────────────────

describe('computeAcceleration', () => {
  it('computes difference', () => {
    expect(computeAcceleration(10, 5)).toBe(5)
  })

  it('can be negative', () => {
    expect(computeAcceleration(3, 8)).toBe(-5)
  })
})

// ─── computeMomentum ────────────────────────────────────────────────────────────

describe('computeMomentum', () => {
  it('computes mass × velocity', () => {
    expect(computeMomentum(10, 5)).toBe(50)
  })
})

// ─── computeKineticEnergy ───────────────────────────────────────────────────────

describe('computeKineticEnergy', () => {
  it('computes 0.5 × mass × velocity²', () => {
    expect(computeKineticEnergy(10, 5)).toBe(125)
  })

  it('returns 0 for zero velocity', () => {
    expect(computeKineticEnergy(100, 0)).toBe(0)
  })
})

// ─── classifyTrajectory ─────────────────────────────────────────────────────────

describe('classifyTrajectory', () => {
  it('classifies high velocity as volatile', () => {
    expect(classifyTrajectory(70, 0)).toBe('volatile')
  })

  it('classifies positive acceleration as growing', () => {
    expect(classifyTrajectory(10, 15)).toBe('growing')
  })

  it('classifies negative acceleration as shrinking', () => {
    expect(classifyTrajectory(10, -15)).toBe('shrinking')
  })

  it('classifies moderate as stable', () => {
    expect(classifyTrajectory(10, 2)).toBe('stable')
  })
})

// ─── computeEntropy ─────────────────────────────────────────────────────────────

describe('computeEntropy', () => {
  it('returns 50 for empty contents', () => {
    expect(computeEntropy([], [])).toBe(50)
  })

  it('increases with mixed naming', () => {
    const low = computeEntropy(['a.ts'], ['const myVar = 1'])
    const high = computeEntropy(['a.ts', 'b.ts'], ['const myVar = 1', 'const my_var = 2'])
    expect(high).toBeGreaterThan(low)
  })

  it('increases with any usage', () => {
    const clean = computeEntropy(['a.ts'], ['const x: number = 1'])
    const dirty = computeEntropy(['a.ts'], ['const x: any = 1\nconst y: any = 2'])
    expect(dirty).toBeGreaterThan(clean)
  })
})

// ─── computeTemperature ─────────────────────────────────────────────────────────

describe('computeTemperature', () => {
  it('returns 0 for clean code', () => {
    expect(computeTemperature(['const x = 1'])).toBe(0)
  })

  it('increases with TODOs and FIXMEs', () => {
    expect(computeTemperature(['TODO: fix', 'FIXME: broken'])).toBeGreaterThan(0)
  })

  it('increases with ts-ignore', () => {
    expect(computeTemperature(['// @ts-ignore'])).toBeGreaterThan(0)
  })
})

// ─── computePressure ────────────────────────────────────────────────────────────

describe('computePressure', () => {
  it('returns 0 for empty', () => {
    expect(computePressure([])).toBe(0)
  })

  it('increases with volume', () => {
    const small: CodeMass[] = [{ file: 'a.ts', mass: 10, density: 80, volume: 100, centerOfMass: 5 }]
    const big: CodeMass[] = [{ file: 'b.ts', mass: 100, density: 80, volume: 50000, centerOfMass: 50 }]
    expect(computePressure(big)).toBeGreaterThan(computePressure(small))
  })
})

// ─── computeEnergy ──────────────────────────────────────────────────────────────

describe('computeEnergy', () => {
  it('computes average energy', () => {
    const masses: CodeMass[] = [{ file: 'a.ts', mass: 10, density: 80, volume: 100, centerOfMass: 5 }]
    const kinematics: Kinematics[] = [{ file: 'a.ts', velocity: 5, acceleration: 0, momentum: 50, kineticEnergy: 125, trajectory: 'stable' }]
    const energy = computeEnergy(masses, kinematics)
    expect(energy).toBeGreaterThan(0)
  })
})

// ─── computeHeatCapacity ────────────────────────────────────────────────────────

describe('computeHeatCapacity', () => {
  it('returns 50 for empty masses', () => {
    expect(computeHeatCapacity([], 50)).toBe(50)
  })

  it('increases with low entropy', () => {
    const masses: CodeMass[] = [{ file: 'a.ts', mass: 100, density: 80, volume: 500, centerOfMass: 50 }]
    const high = computeHeatCapacity(masses, 20)
    const low = computeHeatCapacity(masses, 80)
    expect(high).toBeGreaterThan(low)
  })
})

// ─── findCenterOfGravity ────────────────────────────────────────────────────────

describe('findCenterOfGravity', () => {
  it('returns none for empty masses', () => {
    const forces: Forces = { attraction: 0, repulsion: 0, friction: 0, tension: 0, gravity: 0 }
    expect(findCenterOfGravity([], forces)).toBe('none')
  })

  it('returns highest-scored file', () => {
    const forces: Forces = { attraction: 50, repulsion: 0, friction: 0, tension: 0, gravity: 0 }
    const masses: CodeMass[] = [
      { file: 'small.ts', mass: 10, density: 50, volume: 50, centerOfMass: 5 },
      { file: 'big.ts', mass: 200, density: 90, volume: 1000, centerOfMass: 100 },
    ]
    expect(findCenterOfGravity(masses, forces)).toBe('big.ts')
  })
})

// ─── computeSystemStability ─────────────────────────────────────────────────────

describe('computeSystemStability', () => {
  it('returns higher for low entropy and friction', () => {
    const good: Thermodynamics = { entropy: 20, temperature: 10, pressure: 10, energy: 20, heatCapacity: 80 }
    const bad: Thermodynamics = { entropy: 80, temperature: 70, pressure: 50, energy: 60, heatCapacity: 20 }
    const goodForces: Forces = { attraction: 30, repulsion: 5, friction: 10, tension: 5, gravity: 30 }
    const badForces: Forces = { attraction: 30, repulsion: 50, friction: 60, tension: 40, gravity: 30 }
    expect(computeSystemStability(good, goodForces)).toBeGreaterThan(computeSystemStability(bad, badForces))
  })
})

// ─── determineEquilibrium ───────────────────────────────────────────────────────

describe('determineEquilibrium', () => {
  it('returns stable for high stability', () => {
    expect(determineEquilibrium(80)).toBe('stable')
  })

  it('returns metastable for medium', () => {
    expect(determineEquilibrium(55)).toBe('metastable')
  })

  it('returns unstable for low', () => {
    expect(determineEquilibrium(20)).toBe('unstable')
  })
})

// ─── generateRecommendations ────────────────────────────────────────────────────

describe('generateRecommendations', () => {
  const baseForces: Forces = { attraction: 30, repulsion: 10, friction: 20, tension: 10, gravity: 30 }
  const baseThermo: Thermodynamics = { entropy: 40, temperature: 20, pressure: 20, energy: 40, heatCapacity: 60 }
  const baseStats: PhysicsStats = {
    totalMass: 500, avgDensity: 70, totalEnergy: 40, avgEntropy: 40,
    centerOfGravity: 'a.ts', heaviestFile: 'a.ts', fastestFile: 'b.ts',
    mostEnergeticFile: 'a.ts', highestEntropy: 'a.ts',
    systemStability: 60, totalMomentum: 1000, equilibriumState: 'metastable',
  }

  it('recommends for high entropy', () => {
    const thermo = { ...baseThermo, entropy: 80 }
    const recs = generateRecommendations(baseForces, [], [], thermo, baseStats)
    expect(recs.some((r) => r.includes('Entropy'))).toBe(true)
  })

  it('recommends for unstable equilibrium', () => {
    const stats = { ...baseStats, equilibriumState: 'unstable' as const }
    const recs = generateRecommendations(baseForces, [], [], baseThermo, stats)
    expect(recs.some((r) => r.includes('unstable'))).toBe(true)
  })

  it('recommends for high friction', () => {
    const forces = { ...baseForces, friction: 70 }
    const recs = generateRecommendations(forces, [], [], baseThermo, baseStats)
    expect(recs.some((r) => r.includes('Friction') || r.includes('friction'))).toBe(true)
  })

  it('recommends for heavy files', () => {
    const masses: CodeMass[] = [{ file: 'big.ts', mass: 400, density: 80, volume: 2000, centerOfMass: 200 }]
    const recs = generateRecommendations(baseForces, masses, [], baseThermo, baseStats)
    expect(recs.some((r) => r.includes('300'))).toBe(true)
  })

  it('recommends for high energy', () => {
    const thermo = { ...baseThermo, energy: 80 }
    const recs = generateRecommendations(baseForces, [], [], thermo, baseStats)
    expect(recs.some((r) => r.includes('Energy') || r.includes('energy'))).toBe(true)
  })

  it('praises high stability', () => {
    const stats = { ...baseStats, systemStability: 80 }
    const recs = generateRecommendations(baseForces, [], [], baseThermo, stats)
    expect(recs.some((r) => r.includes('stability'))).toBe(true)
  })

  it('returns default when all good', () => {
    const recs = generateRecommendations(baseForces, [], [], baseThermo, baseStats)
    expect(recs.length).toBeGreaterThan(0)
  })
})

// ─── buildPhysicsResult ─────────────────────────────────────────────────────────

describe('buildPhysicsResult', () => {
  it('handles empty files', () => {
    const result = buildPhysicsResult([], [], {})
    expect(result.masses).toHaveLength(0)
    expect(result.stats.totalMass).toBe(0)
  })

  it('creates masses from files', () => {
    const result = buildPhysicsResult(['a.ts', 'b.ts'], ['code', 'more code'], {})
    expect(result.masses).toHaveLength(2)
  })

  it('computes forces', () => {
    const result = buildPhysicsResult(['a.ts'], ['const x = 1'], {})
    expect(result.forces.attraction).toBeGreaterThanOrEqual(0)
    expect(result.forces.repulsion).toBeGreaterThanOrEqual(0)
  })

  it('computes kinematics for each file', () => {
    const result = buildPhysicsResult(['a.ts'], ['const x = 1'], {})
    expect(result.kinematics).toHaveLength(1)
    expect(result.kinematics[0].trajectory).toBeTruthy()
  })

  it('computes thermodynamics', () => {
    const result = buildPhysicsResult(['a.ts'], ['const x = 1'], {})
    expect(result.thermodynamics.entropy).toBeGreaterThanOrEqual(0)
    expect(result.thermodynamics.heatCapacity).toBeGreaterThanOrEqual(0)
  })

  it('identifies heaviest file', () => {
    const result = buildPhysicsResult(['small.ts', 'big.ts'], ['x', Array(100).fill('line').join('\n')], {})
    expect(result.stats.heaviestFile).toBe('big.ts')
  })

  it('computes equilibrium state', () => {
    const result = buildPhysicsResult(['a.ts'], ['const x = 1'], {})
    expect(['stable', 'metastable', 'unstable']).toContain(result.stats.equilibriumState)
  })

  it('generates recommendations', () => {
    const result = buildPhysicsResult(['a.ts'], ['const x = 1'], {})
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('computes total momentum', () => {
    const result = buildPhysicsResult(['a.ts'], ['const x = 1'], {})
    expect(result.stats.totalMomentum).toBeGreaterThanOrEqual(0)
  })
})

// ─── Format Helpers ─────────────────────────────────────────────────────────────

describe('formatForceDiagram', () => {
  it('formats all forces', () => {
    const forces: Forces = { attraction: 50, repulsion: 20, friction: 30, tension: 10, gravity: 40 }
    const output = formatForceDiagram(forces)
    expect(output).toContain('Attraction')
    expect(output).toContain('Gravity')
  })
})

describe('formatMassDistribution', () => {
  it('formats empty masses', () => {
    expect(formatMassDistribution([])).toContain('No mass data')
  })

  it('formats mass details', () => {
    const masses: CodeMass[] = [{ file: 'big.ts', mass: 200, density: 85, volume: 1000, centerOfMass: 100 }]
    const output = formatMassDistribution(masses)
    expect(output).toContain('big.ts')
    expect(output).toContain('200')
  })
})

describe('formatVelocityChart', () => {
  it('formats empty kinematics', () => {
    expect(formatVelocityChart([])).toContain('No velocity')
  })

  it('formats velocity details', () => {
    const kinematics: Kinematics[] = [{ file: 'a.ts', velocity: 30, acceleration: 5, momentum: 300, kineticEnergy: 450, trajectory: 'growing' }]
    const output = formatVelocityChart(kinematics)
    expect(output).toContain('a.ts')
    expect(output).toContain('growing')
  })
})

describe('formatEntropyMeter', () => {
  it('formats thermodynamic state', () => {
    const thermo: Thermodynamics = { entropy: 45, temperature: 30, pressure: 20, energy: 35, heatCapacity: 60 }
    const output = formatEntropyMeter(thermo)
    expect(output).toContain('Entropy')
    expect(output).toContain('Temperature')
  })
})

describe('formatPhysicsStats', () => {
  it('formats stats with equilibrium', () => {
    const stats: PhysicsStats = {
      totalMass: 500, avgDensity: 70, totalEnergy: 40, avgEntropy: 35,
      centerOfGravity: 'core.ts', heaviestFile: 'big.ts', fastestFile: 'volatile.ts',
      mostEnergeticFile: 'big.ts', highestEntropy: 'core.ts',
      systemStability: 65, totalMomentum: 2000, equilibriumState: 'metastable',
    }
    const output = formatPhysicsStats(stats)
    expect(output).toContain('500')
    expect(output).toContain('metastable')
  })
})

describe('formatPhysicsRecommendations', () => {
  it('formats empty recommendations', () => {
    expect(formatPhysicsRecommendations([])).toContain('No recommendations')
  })

  it('formats numbered recommendations', () => {
    const output = formatPhysicsRecommendations(['Reduce friction', 'Lower entropy'])
    expect(output).toContain('1.')
    expect(output).toContain('2.')
  })
})

describe('formatPhysicsTable', () => {
  it('formats full result', () => {
    const result = buildPhysicsResult(['a.ts', 'b.ts'], ['const x = 1', 'const y = 2'], {})
    const output = formatPhysicsTable(result)
    expect(output).toContain('Physics Analysis')
    expect(output).toContain('Force Diagram')
  })
})

describe('formatPhysicsJSON', () => {
  it('formats as valid JSON', () => {
    const result = buildPhysicsResult(['a.ts'], ['const x = 1'], {})
    const output = formatPhysicsJSON(result)
    const parsed = JSON.parse(output)
    expect(parsed.stats.totalMass).toBeGreaterThanOrEqual(0)
  })
})
