import {
  measureElevation, measureLayering, measureErosion, measureCliff, measureCaprock, measureHealth,
  analyzeMesaLayer, classifyCondition, classifyRegionType, classifyRegionCondition, classifyGeologistGrade,
  buildMesaPlateauResult
} from './src/commands/mesa-plateau-helpers.js'

const RICH = `/**
 * Complex module with full TypeScript features.
 * @example advanced usage
 */
export interface Animal {
  name: string
  age: number
}

export type Species = 'mammal' | 'bird' | 'reptile'

export enum Habitat {
  Forest = 'forest',
  Ocean = 'ocean',
  Desert = 'desert',
}

export class Creature {
  private readonly id: string
  protected name: string
  public species: Species

  static readonly MAX_AGE = 200

  constructor(id: string, name: string, species: Species) {
    this.id = id
    this.name = name
    this.species = species
  }

  async describe(): Promise<string> {
    try {
      return \`\${this.name} is a \${this.species}\`
    } catch {
      return 'unknown'
    }
  }
}

export function greet(name: string): string {
  return \`Hello \${name}\`
}

const arrow = (x: number) => x * 2

export { Creature }
export type { Animal } from './types.js'

`

const EMPTY = `// minimal file with nothing much
var x = 1
`

const MEDIUM = `export interface Config {
  name: string
}

export type Mode = 'dev' | 'prod'

export class AppConfig {
  private mode: Mode
  
  constructor(mode: Mode) {
    this.mode = mode
  }
}

export function init() {
  return new AppConfig('dev')
}

const setup = () => init()
`

console.log("=== RICH ===")
console.log("elev:", JSON.stringify(measureElevation(RICH)))
console.log("layer:", JSON.stringify(measureLayering(RICH)))
console.log("erosion:", JSON.stringify(measureErosion(RICH)))
console.log("cliff:", JSON.stringify(measureCliff(RICH)))
console.log("caprock:", JSON.stringify(measureCaprock(RICH)))
console.log("health:", JSON.stringify(measureHealth(RICH)))
const rc = analyzeMesaLayer(RICH, 'src/rich.ts')
console.log("qualityScore:", rc.qualityScore, "condition:", rc.condition)
console.log("elevation:", rc.elevation, "layering:", rc.layering, "erosion:", rc.erosionResistance, "cliff:", rc.cliffFace, "caprock:", rc.caprockStrength, "health:", rc.plateauHealth)

console.log("\n=== EMPTY ===")
const ec = analyzeMesaLayer(EMPTY, 'src/empty.ts')
console.log("qualityScore:", ec.qualityScore, "condition:", ec.condition)
console.log("elevation:", ec.elevation, "layering:", ec.layering, "erosion:", ec.erosionResistance, "cliff:", ec.cliffFace, "caprock:", ec.caprockStrength, "health:", ec.plateauHealth)

console.log("\n=== MEDIUM ===")
const mc = analyzeMesaLayer(MEDIUM, 'src/medium.ts')
console.log("qualityScore:", mc.qualityScore, "condition:", mc.condition)
console.log("elevation:", mc.elevation, "layering:", mc.layering, "erosion:", mc.erosionResistance, "cliff:", mc.cliffFace, "caprock:", mc.caprockStrength, "health:", mc.plateauHealth)

console.log("\n=== 3-FILE RESULT ===")
const result = buildMesaPlateauResult(
  ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
  [RICH, EMPTY, MEDIUM]
)
console.log("range:", JSON.stringify(result.range))
console.log("stats.overallStability:", result.stats.overallStability)
console.log("stats.geologistGrade:", result.stats.geologistGrade)
console.log("stats.bestLayer:", result.stats.bestLayer)
console.log("stats.highest:", result.stats.highest)
console.log("stats.bestLayered:", result.stats.bestLayered)
console.log("stats.mostResistant:", result.stats.mostResistant)
console.log("stats.bestCliff:", result.stats.bestCliff)
console.log("stats.strongestCaprock:", result.stats.strongestCaprock)
console.log("stats.monumentValleyCount:", result.stats.monumentValleyCount)
console.log("stats.tableMountainCount:", result.stats.tableMountainCount)
console.log("stats.mesaVerdeCount:", result.stats.mesaVerdeCount)
console.log("stats.butteCount:", result.stats.butteCount)
console.log("stats.hoodooCount:", result.stats.hoodooCount)
console.log("stats.dustCount:", result.stats.dustCount)
console.log("stats.isHighCount:", result.stats.isHighCount)
console.log("stats.isWellLayeredCount:", result.stats.isWellLayeredCount)
console.log("stats.isErosionResistantCount:", result.stats.isErosionResistantCount)
console.log("stats.hasCleanInterfaceCount:", result.stats.hasCleanInterfaceCount)
console.log("stats.isStrongCount:", result.stats.isStrongCount)
console.log("stats.isStableCount:", result.stats.isStableCount)
console.log("recommendations:", JSON.stringify(result.recommendations))

console.log("\n=== EMPTY RESULT ===")
const er = buildMesaPlateauResult([], [])
console.log("range:", JSON.stringify(er.range))
console.log("geologistGrade:", er.stats.geologistGrade)

console.log("\n=== CLASSIFIERS ===")
console.log("condition(85):", classifyCondition(85))
console.log("condition(70):", classifyCondition(70))
console.log("condition(55):", classifyCondition(55))
console.log("condition(40):", classifyCondition(40))
console.log("condition(25):", classifyCondition(25))
console.log("condition(10):", classifyCondition(10))
console.log("regionCond(85):", classifyRegionCondition(85))
console.log("regionCond(70):", classifyRegionCondition(70))
console.log("regionCond(55):", classifyRegionCondition(55))
console.log("regionCond(40):", classifyRegionCondition(40))
console.log("regionCond(25):", classifyRegionCondition(25))
console.log("regionCond(10):", classifyRegionCondition(10))
console.log("grade(85):", classifyGeologistGrade(85))
console.log("grade(70):", classifyGeologistGrade(70))
console.log("grade(55):", classifyGeologistGrade(55))
console.log("grade(40):", classifyGeologistGrade(40))
console.log("grade(25):", classifyGeologistGrade(25))
console.log("grade(10):", classifyGeologistGrade(10))
