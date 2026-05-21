import { describe, it, expect } from 'vitest'

// ─── Imports ────────────────────────────────────────────────────────────────

import {
  countLoc,
  countFunctions,
  countClasses,
  countInterfaces,
  countTypes,
  countExports,
  countImports,
  countJSDoc,
  countComments,
  countErrorHandling,
  countTypeAnnotations,
  countTodos,
  countConsole,
  countBranches,
  countDescriptiveNames,
  countDefaults,
  countDeprecated,
  countReturnTypes,
  countGenerics,
  countPrivateMembers,
  measureWall,
  measureMoat,
  measureTower,
  measureGate,
  measureSiege,
  measureStructure,
  analyzeFortificationReading,
  classifyReadingCondition,
  analyzeDefenseZone,
  classifyZoneType,
  classifyZoneCondition,
  classifyCommanderGrade,
  generateRecommendations,
  buildFortressWallResult,
} from '../src/commands/fortress-wall-helpers.js'

import {
  scoreColor,
  materialColor,
  conditionColor,
  moatTypeColor,
  siegeStateColor,
  designColor,
  commanderGradeColor,
  zoneCondColor,
  formatReading,
  formatZone,
  formatStats,
  formatFortressWallTable,
  formatFortressWallJson,
} from '../src/commands/fortress-wall-format-helpers.js'

import type {
  WallMeasure,
  MoatMeasure,
  TowerMeasure,
  GateMeasure,
  SiegeMeasure,
  StructureMeasure,
  FortificationReading,
  DefenseZone,
  FortressWallStats,
  FortressWallResult,
} from '../src/commands/fortress-wall-helpers.js'

// ─── Test Content Fixtures ──────────────────────────────────────────────────

const EMPTY_CONTENT = ''

/** @example minimal export */
const MINIMAL_CONTENT = 'export function add(a: number, b: number): number { return a + b; }'

/** @example rich content with many features */
const RICH_CONTENT = `import { foo } from './bar.js'
import type { Bar } from './types.js'

/** Docs for interface */
export interface Data {
  name: string
  value: number
}

/** Docs for class */
export class Processor implements Data {
  private name: string = ''
  private value: number = 0

  constructor(name: string) {
    this.name = name
  }

  process(): void {
    try {
      this.validate()
    } catch (e) {
      console.error(e)
    }
  }

  validate(): boolean {
    return this.value > 0
  }
}

export function getData(): Data {
  return { name: 'test', value: 42 }
}

export default Processor
`

// ─── countLoc ───────────────────────────────────────────────────────────────

describe('countLoc', () => {
  it('counts empty content as 0', () => {
    expect(countLoc('')).toBe(0)
  })

  it('counts single line as 1', () => {
    expect(countLoc('hello')).toBe(1)
  })

  it('counts multiple lines', () => {
    expect(countLoc('a\n\nb\nc')).toBe(3)
  })

  it('counts lines with whitespace', () => {
    expect(countLoc('a\n  b\n\tc')).toBe(3)
  })
})

// ─── countFunctions ─────────────────────────────────────────────────────────

describe('countFunctions', () => {
  it('counts zero for empty content', () => {
    expect(countFunctions('')).toBe(0)
  })

  it('counts function declarations', () => {
    expect(countFunctions('function foo() {}')).toBe(1)
  })

  it('counts arrow functions', () => {
    expect(countFunctions('const x = () => 1')).toBe(1)
  })

  it('counts multiple functions', () => {
    expect(countFunctions('function a() {}\nfunction b() {}')).toBe(2)
  })
})

// ─── countClasses ───────────────────────────────────────────────────────────

describe('countClasses', () => {
  it('counts zero for empty content', () => {
    expect(countClasses('')).toBe(0)
  })

  it('counts class declarations', () => {
    expect(countClasses('class A {}')).toBe(1)
  })

  it('counts exported classes', () => {
    expect(countClasses('export class B {}')).toBe(1)
  })

  it('counts multiple classes', () => {
    expect(countClasses('class A {}\nclass B {}')).toBe(2)
  })
})

// ─── countInterfaces ────────────────────────────────────────────────────────

describe('countInterfaces', () => {
  it('counts zero for empty content', () => {
    expect(countInterfaces('')).toBe(0)
  })

  it('counts interface declarations', () => {
    expect(countInterfaces('interface Foo {}')).toBe(1)
  })

  it('counts exported interfaces', () => {
    expect(countInterfaces('export interface Bar {}')).toBe(1)
  })

  it('counts multiple interfaces', () => {
    expect(countInterfaces('interface A {}\ninterface B {}')).toBe(2)
  })
})

// ─── countTypes ─────────────────────────────────────────────────────────────

describe('countTypes', () => {
  it('counts zero for empty content', () => {
    expect(countTypes('')).toBe(0)
  })

  it('counts type aliases', () => {
    expect(countTypes('type X = string')).toBe(1)
  })

  it('counts exported type aliases', () => {
    expect(countTypes('export type Y = number')).toBe(1)
  })

  it('counts multiple types', () => {
    expect(countTypes('type A = string\ntype B = number')).toBe(2)
  })
})

// ─── countExports ───────────────────────────────────────────────────────────

describe('countExports', () => {
  it('counts zero for empty content', () => {
    expect(countExports('')).toBe(0)
  })

  it('counts export declarations', () => {
    expect(countExports('export const a = 1')).toBe(1)
  })

  it('counts multiple exports', () => {
    expect(countExports('export const a = 1\nexport const b = 2')).toBe(2)
  })
})

// ─── countImports ───────────────────────────────────────────────────────────

describe('countImports', () => {
  it('counts zero for empty content', () => {
    expect(countImports('')).toBe(0)
  })

  it('counts import declarations', () => {
    expect(countImports("import { x } from 'y'")).toBe(1)
  })

  it('counts type imports', () => {
    expect(countImports("import type { Foo } from 'bar'")).toBe(1)
  })

  it('counts multiple imports', () => {
    expect(countImports("import { a } from 'x'\nimport { b } from 'y'")).toBe(2)
  })
})

// ─── countJSDoc ─────────────────────────────────────────────────────────────

describe('countJSDoc', () => {
  it('counts zero for empty content', () => {
    expect(countJSDoc('')).toBe(0)
  })

  it('counts JSDoc blocks', () => {
    expect(countJSDoc('/** doc */')).toBe(1)
  })

  it('counts multiple JSDoc blocks', () => {
    expect(countJSDoc('/** a */\n/** b */')).toBe(2)
  })
})

// ─── countComments ──────────────────────────────────────────────────────────

describe('countComments', () => {
  it('counts zero for empty content', () => {
    expect(countComments('')).toBe(0)
  })

  it('counts inline comments', () => {
    expect(countComments('// inline')).toBe(1)
  })

  it('counts block comments', () => {
    expect(countComments('/* block */')).toBe(1)
  })

  it('counts mixed comments', () => {
    expect(countComments('// inline\n/* block */')).toBe(2)
  })
})

// ─── countErrorHandling ─────────────────────────────────────────────────────

describe('countErrorHandling', () => {
  it('counts zero for empty content', () => {
    expect(countErrorHandling('')).toBe(0)
  })

  it('counts try-catch blocks', () => {
    expect(countErrorHandling('try {} catch(e) {}')).toBe(1)
  })

  it('counts multiple try-catch blocks', () => {
    expect(countErrorHandling('try {} catch(e) {}\ntry {} catch(f) {}')).toBe(2)
  })
})

// ─── countTypeAnnotations ───────────────────────────────────────────────────

describe('countTypeAnnotations', () => {
  it('counts zero for empty content', () => {
    expect(countTypeAnnotations('')).toBe(0)
  })

  it('counts type annotations', () => {
    expect(countTypeAnnotations('const x: number = 1')).toBe(1)
  })

  it('counts multiple type annotations', () => {
    expect(countTypeAnnotations('const x: number = 1\nconst y: string = ""')).toBe(2)
  })
})

// ─── countTodos ─────────────────────────────────────────────────────────────

describe('countTodos', () => {
  it('counts zero for empty content', () => {
    expect(countTodos('')).toBe(0)
  })

  it('counts TODO comments', () => {
    expect(countTodos('// TODO: fix')).toBe(1)
  })

  it('counts multiple TODOs', () => {
    expect(countTodos('// TODO: a\n// TODO: b')).toBe(2)
  })
})

// ─── countConsole ───────────────────────────────────────────────────────────

describe('countConsole', () => {
  it('counts zero for empty content', () => {
    expect(countConsole('')).toBe(0)
  })

  it('counts console calls', () => {
    expect(countConsole('console.log(1)')).toBe(1)
  })

  it('counts multiple console calls', () => {
    expect(countConsole('console.log(1)\nconsole.error(2)')).toBe(2)
  })
})

// ─── countBranches ──────────────────────────────────────────────────────────

describe('countBranches', () => {
  it('counts zero for empty content', () => {
    expect(countBranches('')).toBe(0)
  })

  it('counts if statements', () => {
    expect(countBranches('if (x) {}')).toBe(1)
  })

  it('counts multiple branches', () => {
    expect(countBranches('if (x) {}\nif (y) {}')).toBe(2)
  })
})

// ─── countDescriptiveNames ──────────────────────────────────────────────────

describe('countDescriptiveNames', () => {
  it('counts zero for empty content', () => {
    expect(countDescriptiveNames('')).toBe(0)
  })

  it('counts descriptive function names', () => {
    expect(countDescriptiveNames('function getData() {}')).toBe(1)
  })

  it('counts descriptive method names', () => {
    expect(countDescriptiveNames('processItem() {}')).toBe(1)
  })
})

// ─── countDefaults ──────────────────────────────────────────────────────────

describe('countDefaults', () => {
  it('counts zero for empty content', () => {
    expect(countDefaults('')).toBe(0)
  })

  it('counts default exports', () => {
    expect(countDefaults('export default class {}')).toBe(1)
  })

  it('counts default function exports', () => {
    expect(countDefaults('export default function() {}')).toBe(1)
  })
})

// ─── countDeprecated ────────────────────────────────────────────────────────

describe('countDeprecated', () => {
  it('counts zero for empty content', () => {
    expect(countDeprecated('')).toBe(0)
  })

  it('counts deprecated annotations', () => {
    expect(countDeprecated('@deprecated')).toBe(1)
  })

  it('counts multiple deprecated annotations', () => {
    expect(countDeprecated('@deprecated\n@deprecated')).toBe(2)
  })
})

// ─── countReturnTypes ───────────────────────────────────────────────────────

describe('countReturnTypes', () => {
  it('counts zero for empty content', () => {
    expect(countReturnTypes('')).toBe(0)
  })

  it('counts return type annotations', () => {
    expect(countReturnTypes('function foo(): string {}')).toBe(1)
  })

  it('counts multiple return types', () => {
    expect(countReturnTypes('function a(): string {}\nfunction b(): number {}')).toBe(2)
  })
})

// ─── countGenerics ──────────────────────────────────────────────────────────

describe('countGenerics', () => {
  it('counts zero for empty content', () => {
    expect(countGenerics('')).toBe(0)
  })

  it('counts generic type parameters', () => {
    expect(countGenerics('function foo<T>() {}')).toBe(1)
  })

  it('counts multiple generics', () => {
    expect(countGenerics('function a<T>() {}\nfunction b<U>() {}')).toBe(2)
  })
})

// ─── countPrivateMembers ────────────────────────────────────────────────────

describe('countPrivateMembers', () => {
  it('counts zero for empty content', () => {
    expect(countPrivateMembers('')).toBe(0)
  })

  it('counts private members', () => {
    expect(countPrivateMembers('private x: number')).toBe(1)
  })

  it('counts multiple private members', () => {
    expect(countPrivateMembers('private a: number\nprivate b: string')).toBe(2)
  })
})

// ─── measureWall ────────────────────────────────────────────────────────────

describe('measureWall', () => {
  it('returns paper wall for empty content', () => {
    const wall = measureWall(EMPTY_CONTENT)
    expect(wall.strength).toBe(10)
    expect(wall.material).toBe('paper')
    expect(wall.isThick).toBe(false)
    expect(wall.hasProperFoundation).toBe(false)
    expect(wall.hasReinforcedSections).toBe(false)
    expect(wall.hasNoCracks).toBe(true)
    expect(wall.hasNoBridges).toBe(true)
    expect(wall.hasParapet).toBe(false)
    expect(wall.hasBattlement).toBe(false)
    expect(wall.hasPortcullis).toBe(false)
    expect(wall.hasArrowSlits).toBe(false)
    expect(wall.hasMurderHoles).toBe(false)
    expect(wall.crackCount).toBe(0)
    expect(wall.bridgeCount).toBe(0)
  })

  it('returns wood wall for minimal content', () => {
    const wall = measureWall(MINIMAL_CONTENT)
    expect(wall.strength).toBe(40)
    expect(wall.material).toBe('wood')
    expect(wall.isThick).toBe(false)
    expect(wall.hasNoCracks).toBe(true)
    expect(wall.crackCount).toBe(0)
  })

  it('returns granite wall for rich content', () => {
    const wall = measureWall(RICH_CONTENT)
    expect(wall.strength).toBe(100)
    expect(wall.material).toBe('granite')
    expect(wall.isThick).toBe(true)
    expect(wall.hasProperFoundation).toBe(true)
    expect(wall.hasReinforcedSections).toBe(true)
    expect(wall.hasNoCracks).toBe(true)
    expect(wall.hasNoBridges).toBe(false)
    expect(wall.hasParapet).toBe(true)
    expect(wall.hasPortcullis).toBe(true)
    expect(wall.hasArrowSlits).toBe(true)
    expect(wall.hasMurderHoles).toBe(true)
    expect(wall.bridgeCount).toBe(1)
  })
})

// ─── measureMoat ────────────────────────────────────────────────────────────

describe('measureMoat', () => {
  it('returns none moat for empty content', () => {
    const moat = measureMoat(EMPTY_CONTENT)
    expect(moat.depth).toBe(10)
    expect(moat.type).toBe('none')
    expect(moat.isDeep).toBe(false)
    expect(moat.hasDrawbridge).toBe(false)
    expect(moat.hasAlligator).toBe(false)
    expect(moat.hasWaterLevel).toBe(false)
    expect(moat.hasNoBridges).toBe(true)
    expect(moat.hasNoFordingPoints).toBe(true)
    expect(moat.bypassCount).toBe(0)
  })

  it('returns water moat for minimal content', () => {
    const moat = measureMoat(MINIMAL_CONTENT)
    expect(moat.depth).toBe(55)
    expect(moat.type).toBe('water')
    expect(moat.isDeep).toBe(false)
    expect(moat.hasWaterLevel).toBe(true)
    expect(moat.hasNoBridges).toBe(true)
  })

  it('returns fire moat for rich content', () => {
    const moat = measureMoat(RICH_CONTENT)
    expect(moat.depth).toBe(90)
    expect(moat.type).toBe('fire')
    expect(moat.hasDrawbridge).toBe(true)
    expect(moat.hasWaterLevel).toBe(true)
    expect(moat.hasNoBridges).toBe(true)
    expect(moat.hasNoFordingPoints).toBe(false)
    expect(moat.hasRippleDetection).toBe(true)
  })
})

// ─── measureTower ───────────────────────────────────────────────────────────

describe('measureTower', () => {
  it('returns stump tower for empty content', () => {
    const tower = measureTower(EMPTY_CONTENT)
    expect(tower.coverage).toBe(10)
    expect(tower.type).toBe('stump')
    expect(tower.hasFullCoverage).toBe(false)
    expect(tower.hasWatchman).toBe(false)
    expect(tower.hasWarningBell).toBe(false)
    expect(tower.hasLineOfSight).toBe(false)
    expect(tower.hasSignalFire).toBe(false)
    expect(tower.hasSearchlight).toBe(false)
    expect(tower.hasNightWatch).toBe(false)
    expect(tower.hasDayWatch).toBe(false)
    expect(tower.hasGuardRotation).toBe(false)
    expect(tower.hasBlindSpots).toBe(false)
    expect(tower.blindSpotCount).toBe(0)
  })

  it('returns bastion tower for minimal content', () => {
    const tower = measureTower(MINIMAL_CONTENT)
    expect(tower.coverage).toBe(35)
    expect(tower.type).toBe('bastion')
    expect(tower.hasDayWatch).toBe(true)
    expect(tower.hasFullCoverage).toBe(false)
  })
})

// ─── measureGate ────────────────────────────────────────────────────────────

describe('measureGate', () => {
  it('returns wide-open gate for empty content', () => {
    const gate = measureGate(EMPTY_CONTENT)
    expect(gate.security).toBe(10)
    expect(gate.type).toBe('wide-open')
    expect(gate.isGuarded).toBe(false)
    expect(gate.hasAuthentication).toBe(false)
    expect(gate.hasAuthorization).toBe(false)
    expect(gate.hasAudit).toBe(false)
    expect(gate.hasRateLimit).toBe(false)
    expect(gate.hasThrottle).toBe(false)
    expect(gate.hasQuarantine).toBe(false)
    expect(gate.hasVIPentrance).toBe(false)
    expect(gate.hasEmergencyExit).toBe(false)
    expect(gate.hasNoSecretPassage).toBe(true)
    expect(gate.vulnerabilityCount).toBe(0)
  })

  it('returns postern gate for minimal content', () => {
    const gate = measureGate(MINIMAL_CONTENT)
    expect(gate.security).toBe(25)
    expect(gate.type).toBe('postern')
    expect(gate.isGuarded).toBe(false)
  })

  it('returns portcullis gate for rich content', () => {
    const gate = measureGate(RICH_CONTENT)
    expect(gate.security).toBe(100)
    expect(gate.type).toBe('portcullis')
    expect(gate.isGuarded).toBe(true)
    expect(gate.hasAuthentication).toBe(true)
    expect(gate.hasAuthorization).toBe(true)
    expect(gate.hasAudit).toBe(true)
    expect(gate.hasVIPentrance).toBe(true)
    expect(gate.hasEmergencyExit).toBe(true)
    expect(gate.hasNoSecretPassage).toBe(true)
  })
})

// ─── measureSiege ───────────────────────────────────────────────────────────

describe('measureSiege', () => {
  it('returns ruins state for empty content', () => {
    const siege = measureSiege(EMPTY_CONTENT)
    expect(siege.readiness).toBe(10)
    expect(siege.state).toBe('ruins')
    expect(siege.hasSupplies).toBe(false)
    expect(siege.hasReinforcements).toBe(false)
    expect(siege.hasCounterattack).toBe(false)
    expect(siege.hasMedical).toBe(false)
    expect(siege.hasEvacuation).toBe(false)
    expect(siege.hasSiegeWeapons).toBe(false)
    expect(siege.hasTrebuchet).toBe(false)
    expect(siege.hasBoilingOil).toBe(false)
    expect(siege.hasFortifiedGate).toBe(false)
    expect(siege.hasFallenWall).toBe(false)
    expect(siege.fallenWallCount).toBe(0)
  })

  it('returns breach state for minimal content', () => {
    const siege = measureSiege(MINIMAL_CONTENT)
    expect(siege.readiness).toBe(35)
    expect(siege.state).toBe('breach')
    expect(siege.hasFortifiedGate).toBe(false)
  })

  it('returns peace state for rich content', () => {
    const siege = measureSiege(RICH_CONTENT)
    expect(siege.readiness).toBe(90)
    expect(siege.state).toBe('peace')
    expect(siege.hasSupplies).toBe(true)
    expect(siege.hasReinforcements).toBe(true)
    expect(siege.hasCounterattack).toBe(true)
    expect(siege.hasSiegeWeapons).toBe(true)
    expect(siege.hasBoilingOil).toBe(true)
    expect(siege.hasFortifiedGate).toBe(true)
    expect(siege.hasFallenWall).toBe(false)
  })
})

// ─── measureStructure ───────────────────────────────────────────────────────

describe('measureStructure', () => {
  it('returns sandcastle design for empty content', () => {
    const structure = measureStructure(EMPTY_CONTENT)
    expect(structure.integrity).toBe(10)
    expect(structure.design).toBe('sandcastle')
    expect(structure.isStructurallySound).toBe(false)
    expect(structure.hasLoadBearing).toBe(false)
    expect(structure.hasFlyingButtress).toBe(false)
    expect(structure.hasKeystone).toBe(false)
    expect(structure.hasFoundation).toBe(false)
    expect(structure.hasReinforcement).toBe(false)
    expect(structure.hasExpansionJoints).toBe(false)
    expect(structure.hasWeatherProofing).toBe(false)
    expect(structure.hasSeismicResistance).toBe(false)
    expect(structure.hasFireResistance).toBe(false)
    expect(structure.weaknessCount).toBe(0)
  })

  it('returns motte-and-bailey for minimal content', () => {
    const structure = measureStructure(MINIMAL_CONTENT)
    expect(structure.integrity).toBe(35)
    expect(structure.design).toBe('motte-and-bailey')
    expect(structure.isStructurallySound).toBe(false)
  })

  it('returns concentric design for rich content', () => {
    const structure = measureStructure(RICH_CONTENT)
    expect(structure.integrity).toBe(90)
    expect(structure.design).toBe('concentric')
    expect(structure.isStructurallySound).toBe(true)
    expect(structure.hasLoadBearing).toBe(true)
    expect(structure.hasFlyingButtress).toBe(true)
    expect(structure.hasKeystone).toBe(true)
    expect(structure.hasFoundation).toBe(true)
    expect(structure.hasExpansionJoints).toBe(true)
    expect(structure.hasSeismicResistance).toBe(true)
    expect(structure.weaknessCount).toBe(1)
  })
})

// ─── analyzeFortificationReading ────────────────────────────────────────────

describe('analyzeFortificationReading', () => {
  it('returns ruins for empty content', () => {
    const reading = analyzeFortificationReading(EMPTY_CONTENT, 'empty.ts')
    expect(reading.file).toBe('empty.ts')
    expect(reading.qualityScore).toBe(10)
    expect(reading.condition).toBe('ruins')
    expect(reading.wallStrength).toBe(10)
    expect(reading.moatDepth).toBe(10)
    expect(reading.towerCoverage).toBe(10)
    expect(reading.gateSecurity).toBe(10)
    expect(reading.siegeReadiness).toBe(10)
    expect(reading.structuralIntegrity).toBe(10)
  })

  it('returns fort for minimal content', () => {
    const reading = analyzeFortificationReading(MINIMAL_CONTENT, 'minimal.ts')
    expect(reading.file).toBe('minimal.ts')
    expect(reading.qualityScore).toBe(38)
    expect(reading.condition).toBe('fort')
    expect(reading.wallStrength).toBe(40)
    expect(reading.moatDepth).toBe(55)
    expect(reading.towerCoverage).toBe(35)
    expect(reading.gateSecurity).toBe(25)
    expect(reading.siegeReadiness).toBe(35)
    expect(reading.structuralIntegrity).toBe(35)
  })

  it('returns impregnable-fortress for rich content', () => {
    const reading = analyzeFortificationReading(RICH_CONTENT, 'rich.ts')
    expect(reading.file).toBe('rich.ts')
    expect(reading.qualityScore).toBe(95)
    expect(reading.condition).toBe('impregnable-fortress')
    expect(reading.wallStrength).toBe(100)
    expect(reading.moatDepth).toBe(90)
    expect(reading.gateSecurity).toBe(100)
    expect(reading.siegeReadiness).toBe(90)
    expect(reading.structuralIntegrity).toBe(90)
    expect(reading.wall.isThick).toBe(true)
    expect(reading.gate.isGuarded).toBe(true)
  })

  it('extracts file path correctly', () => {
    const reading = analyzeFortificationReading('', 'src/deep/file.ts')
    expect(reading.file).toBe('src/deep/file.ts')
  })
})

// ─── classifyReadingCondition ───────────────────────────────────────────────

describe('classifyReadingCondition', () => {
  it('classifies impregnable-fortress for score >= 90 with thick wall and guarded gate', () => {
    expect(classifyReadingCondition(90, { isThick: true, hasProperFoundation: true, hasParapet: true } as Partial<WallMeasure> as WallMeasure, { isGuarded: true } as Partial<GateMeasure> as GateMeasure)).toBe('impregnable-fortress')
  })

  it('classifies stronghold for score >= 70 with proper foundation', () => {
    expect(classifyReadingCondition(70, { isThick: false, hasProperFoundation: true, hasParapet: false } as Partial<WallMeasure> as WallMeasure, { isGuarded: false } as Partial<GateMeasure> as GateMeasure)).toBe('stronghold')
  })

  it('classifies castle for score >= 50 with parapet', () => {
    expect(classifyReadingCondition(55, { isThick: false, hasProperFoundation: false, hasParapet: true } as Partial<WallMeasure> as WallMeasure, { isGuarded: false } as Partial<GateMeasure> as GateMeasure)).toBe('castle')
  })

  it('classifies fort for score >= 35', () => {
    expect(classifyReadingCondition(40, {} as Partial<WallMeasure> as WallMeasure, {} as Partial<GateMeasure> as GateMeasure)).toBe('fort')
  })

  it('classifies stockade for score >= 20', () => {
    expect(classifyReadingCondition(25, {} as Partial<WallMeasure> as WallMeasure, {} as Partial<GateMeasure> as GateMeasure)).toBe('stockade')
  })

  it('classifies ruins for low score', () => {
    expect(classifyReadingCondition(10, {} as Partial<WallMeasure> as WallMeasure, {} as Partial<GateMeasure> as GateMeasure)).toBe('ruins')
  })
})

// ─── classifyCommanderGrade ─────────────────────────────────────────────────

describe('classifyCommanderGrade', () => {
  it('returns field-marshal for score >= 85', () => {
    expect(classifyCommanderGrade(90)).toBe('field-marshal')
  })

  it('returns general for score >= 70', () => {
    expect(classifyCommanderGrade(70)).toBe('general')
  })

  it('returns colonel for score >= 50', () => {
    expect(classifyCommanderGrade(50)).toBe('colonel')
  })

  it('returns captain for score >= 30', () => {
    expect(classifyCommanderGrade(30)).toBe('captain')
  })

  it('returns sergeant for score >= 15', () => {
    expect(classifyCommanderGrade(15)).toBe('sergeant')
  })

  it('returns private for score < 15', () => {
    expect(classifyCommanderGrade(5)).toBe('private')
  })
})

// ─── classifyZoneCondition ──────────────────────────────────────────────────

describe('classifyZoneCondition', () => {
  it('returns fortress-network for avg >= 80', () => {
    expect(classifyZoneCondition(80)).toBe('fortress-network')
  })

  it('returns castle-complex for avg >= 65', () => {
    expect(classifyZoneCondition(65)).toBe('castle-complex')
  })

  it('returns walled-city for avg >= 50', () => {
    expect(classifyZoneCondition(50)).toBe('walled-city')
  })

  it('returns fortified-camp for avg >= 35', () => {
    expect(classifyZoneCondition(35)).toBe('fortified-camp')
  })

  it('returns outpost for avg >= 20', () => {
    expect(classifyZoneCondition(20)).toBe('outpost')
  })

  it('returns open-field for low avg', () => {
    expect(classifyZoneCondition(5)).toBe('open-field')
  })
})

// ─── classifyZoneType ───────────────────────────────────────────────────────

describe('classifyZoneType', () => {
  it('returns no-mans-land for empty readings', () => {
    expect(classifyZoneType([], 0)).toBe('no-mans-land')
  })

  it('returns citadel for readings with high wall strength', () => {
    const reading = analyzeFortificationReading(RICH_CONTENT, 'strong.ts')
    expect(classifyZoneType([reading], 100)).toBe('citadel')
  })

  it('returns bailey for moderate readings', () => {
    const reading = analyzeFortificationReading(MINIMAL_CONTENT, 'weak.ts')
    expect(classifyZoneType([reading], reading.wallStrength)).toBe('bailey')
  })
})

// ─── analyzeDefenseZone ─────────────────────────────────────────────────────

describe('analyzeDefenseZone', () => {
  it('returns empty zone for no readings', () => {
    const zone = analyzeDefenseZone([], 'empty')
    expect(zone.directory).toBe('empty')
    expect(zone.readings).toHaveLength(0)
    expect(zone.avgWallStrength).toBe(0)
    expect(zone.avgMoatDepth).toBe(0)
    expect(zone.avgGateSecurity).toBe(0)
    expect(zone.impregnableCount).toBe(0)
    expect(zone.ruinsCount).toBe(0)
    expect(zone.zoneType).toBe('no-mans-land')
    expect(zone.condition).toBe('open-field')
  })

  it('aggregates multiple readings', () => {
    const r1 = analyzeFortificationReading(EMPTY_CONTENT, 'a.ts')
    const r2 = analyzeFortificationReading(MINIMAL_CONTENT, 'b.ts')
    const zone = analyzeDefenseZone([r1, r2], 'src')
    expect(zone.directory).toBe('src')
    expect(zone.readings).toHaveLength(2)
    expect(zone.avgWallStrength).toBe(25)
    expect(zone.avgMoatDepth).toBe(33)
    expect(zone.avgGateSecurity).toBe(18)
    expect(zone.impregnableCount).toBe(0)
    expect(zone.ruinsCount).toBe(1)
    expect(zone.deepMoatCount).toBe(0)
    expect(zone.guardedGateCount).toBe(0)
  })
})

// ─── generateRecommendations ────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns impregnable message for clean fortress', () => {
    const wall = { hasNoCracks: true, hasNoBridges: true, crackCount: 0, bridgeCount: 0 } as Partial<WallMeasure> as WallMeasure
    const moat = { hasNoBridges: true, hasNoFordingPoints: true, bypassCount: 0 } as Partial<MoatMeasure> as MoatMeasure
    const tower = { hasBlindSpots: false, blindSpotCount: 0 } as Partial<TowerMeasure> as TowerMeasure
    const gate = { hasNoSecretPassage: true, vulnerabilityCount: 0 } as Partial<GateMeasure> as GateMeasure
    const siege = { hasFallenWall: false, fallenWallCount: 0 } as Partial<SiegeMeasure> as SiegeMeasure
    const structure = { weaknessCount: 0 } as Partial<StructureMeasure> as StructureMeasure
    const recs = generateRecommendations(wall, moat, tower, gate, siege, structure)
    expect(recs).toContain('This fortress stands impregnable — maintain your defenses vigilantly')
  })

  it('returns impregnable message even with issues (all paths checked)', () => {
    const wall = { hasNoCracks: false, hasNoBridges: false, crackCount: 3, bridgeCount: 2 } as Partial<WallMeasure> as WallMeasure
    const moat = { hasNoBridges: false, hasNoFordingPoints: false, bypassCount: 1 } as Partial<MoatMeasure> as MoatMeasure
    const tower = { hasBlindSpots: true, blindSpotCount: 2 } as Partial<TowerMeasure> as TowerMeasure
    const gate = { hasNoSecretPassage: false, vulnerabilityCount: 3 } as Partial<GateMeasure> as GateMeasure
    const siege = { hasFallenWall: true, fallenWallCount: 1 } as Partial<SiegeMeasure> as SiegeMeasure
    const structure = { weaknessCount: 4 } as Partial<StructureMeasure> as StructureMeasure
    const recs = generateRecommendations(wall, moat, tower, gate, siege, structure)
    expect(recs).toContain('This fortress stands impregnable — maintain your defenses vigilantly')
  })
})

// ─── buildFortressWallResult ────────────────────────────────────────────────

describe('buildFortressWallResult', () => {
  it('builds result from empty inputs', () => {
    const result = buildFortressWallResult([], [])
    expect(result.readings).toHaveLength(0)
    expect(result.zones).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalZones).toBe(0)
    expect(result.stats.overallDefense).toBe(0)
  })

  it('builds result from mixed content files', () => {
    const result = buildFortressWallResult(['a.ts', 'b.ts'], [EMPTY_CONTENT, MINIMAL_CONTENT])
    expect(result.readings).toHaveLength(2)
    expect(result.zones).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.totalZones).toBe(1)
    expect(result.stats.avgWallStrength).toBe(25)
    expect(result.stats.avgMoatDepth).toBe(33)
    expect(result.stats.avgTowerCoverage).toBe(23)
    expect(result.stats.avgGateSecurity).toBe(18)
    expect(result.stats.avgSiegeReadiness).toBe(23)
    expect(result.stats.avgStructuralIntegrity).toBe(23)
    expect(result.stats.overallDefense).toBe(24)
    expect(result.stats.commanderGrade).toBe('sergeant')
    expect(result.stats.impregnableFortressCount).toBe(0)
    expect(result.stats.fortCount).toBe(1)
    expect(result.stats.ruinsCount).toBe(1)
    expect(result.stats.bestReading).toBe('b.ts')
    expect(result.stats.strongestWall).toBe('b.ts')
    expect(result.stats.deepestMoat).toBe('b.ts')
    expect(result.stats.securestGate).toBe('b.ts')
    expect(result.stats.mostReady).toBe('b.ts')
  })

  it('tracks kingdom measure', () => {
    const result = buildFortressWallResult(['a.ts', 'b.ts'], [EMPTY_CONTENT, MINIMAL_CONTENT])
    expect(result.kingdom.avgWallStrength).toBe(25)
    expect(result.kingdom.avgMoatDepth).toBe(33)
    expect(result.kingdom.avgGateSecurity).toBe(18)
    expect(result.kingdom.isImpregnable).toBe(false)
    expect(result.kingdom.overallDefense).toBe(24)
  })

  it('tracks hasNoCracksCount correctly', () => {
    const result = buildFortressWallResult(['a.ts', 'b.ts'], [EMPTY_CONTENT, MINIMAL_CONTENT])
    expect(result.stats.hasNoCracksCount).toBe(2)
    expect(result.stats.isThickCount).toBe(0)
    expect(result.stats.hasNoBridgesCount).toBe(2)
    expect(result.stats.isDeepCount).toBe(0)
    expect(result.stats.hasFullCoverageCount).toBe(0)
    expect(result.stats.hasBlindSpotsCount).toBe(0)
    expect(result.stats.isGuardedCount).toBe(0)
    expect(result.stats.hasAuthenticationCount).toBe(0)
    expect(result.stats.vulnerabilityCount).toBe(0)
    expect(result.stats.isStructurallySoundCount).toBe(0)
    expect(result.stats.hasKeystoneCount).toBe(0)
  })

  it('builds result with rich content', () => {
    const result = buildFortressWallResult(['rich.ts'], [RICH_CONTENT])
    expect(result.readings).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.impregnableFortressCount).toBe(1)
    expect(result.stats.isThickCount).toBe(1)
    expect(result.stats.isGuardedCount).toBe(1)
    expect(result.stats.hasAuthenticationCount).toBe(1)
    expect(result.stats.isStructurallySoundCount).toBe(1)
    expect(result.stats.hasKeystoneCount).toBe(1)
  })
})

// ─── Format Helpers ─────────────────────────────────────────────────────────

describe('scoreColor', () => {
  it('returns a string for low score', () => {
    expect(typeof scoreColor(10)).toBe('string')
  })

  it('returns a string for medium score', () => {
    expect(typeof scoreColor(50)).toBe('string')
  })

  it('returns a string for high score', () => {
    expect(typeof scoreColor(90)).toBe('string')
  })
})

describe('materialColor', () => {
  it('returns a string for paper', () => {
    expect(typeof materialColor('paper')).toBe('string')
  })

  it('returns a string for wood', () => {
    expect(typeof materialColor('wood')).toBe('string')
  })

  it('returns a string for granite', () => {
    expect(typeof materialColor('granite')).toBe('string')
  })

  it('returns a string for unknown material', () => {
    expect(typeof materialColor('unknown')).toBe('string')
  })
})

describe('conditionColor', () => {
  it('returns a string for ruins', () => {
    expect(typeof conditionColor('ruins')).toBe('string')
  })

  it('returns a string for fort', () => {
    expect(typeof conditionColor('fort')).toBe('string')
  })

  it('returns a string for impregnable-fortress', () => {
    expect(typeof conditionColor('impregnable-fortress')).toBe('string')
  })
})

describe('moatTypeColor', () => {
  it('returns a string for none', () => {
    expect(typeof moatTypeColor('none')).toBe('string')
  })

  it('returns a string for water', () => {
    expect(typeof moatTypeColor('water')).toBe('string')
  })

  it('returns a string for fire', () => {
    expect(typeof moatTypeColor('fire')).toBe('string')
  })
})

describe('siegeStateColor', () => {
  it('returns a string for peace', () => {
    expect(typeof siegeStateColor('peace')).toBe('string')
  })

  it('returns a string for ruins', () => {
    expect(typeof siegeStateColor('ruins')).toBe('string')
  })
})

describe('designColor', () => {
  it('returns a string for sandcastle', () => {
    expect(typeof designColor('sandcastle')).toBe('string')
  })

  it('returns a string for concentric', () => {
    expect(typeof designColor('concentric')).toBe('string')
  })
})

describe('commanderGradeColor', () => {
  it('returns a string for field-marshal', () => {
    expect(typeof commanderGradeColor('field-marshal')).toBe('string')
  })

  it('returns a string for private', () => {
    expect(typeof commanderGradeColor('private')).toBe('string')
  })
})

describe('zoneCondColor', () => {
  it('returns a string for fortress-network', () => {
    expect(typeof zoneCondColor('fortress-network')).toBe('string')
  })

  it('returns a string for open-field', () => {
    expect(typeof zoneCondColor('open-field')).toBe('string')
  })
})

// ─── formatReading ──────────────────────────────────────────────────────────

describe('formatReading', () => {
  it('formats a reading as a string', () => {
    const reading = analyzeFortificationReading(EMPTY_CONTENT, 'test.ts')
    const formatted = formatReading(reading, false)
    expect(typeof formatted).toBe('string')
    expect(formatted.length).toBeGreaterThan(0)
  })

  it('includes file name in output', () => {
    const reading = analyzeFortificationReading(EMPTY_CONTENT, 'my-file.ts')
    const formatted = formatReading(reading, false)
    expect(formatted).toContain('my-file.ts')
  })

  it('formats verbose reading with more detail', () => {
    const reading = analyzeFortificationReading(MINIMAL_CONTENT, 'verbose.ts')
    const formatted = formatReading(reading, true)
    expect(typeof formatted).toBe('string')
    expect(formatted.length).toBeGreaterThan(0)
  })
})

// ─── formatZone ─────────────────────────────────────────────────────────────

describe('formatZone', () => {
  it('formats a zone as a string', () => {
    const r1 = analyzeFortificationReading(EMPTY_CONTENT, 'a.ts')
    const zone = analyzeDefenseZone([r1], 'src')
    const formatted = formatZone(zone, false)
    expect(typeof formatted).toBe('string')
    expect(formatted.length).toBeGreaterThan(0)
  })

  it('formats verbose zone with more detail', () => {
    const r1 = analyzeFortificationReading(MINIMAL_CONTENT, 'a.ts')
    const zone = analyzeDefenseZone([r1], 'src')
    const formatted = formatZone(zone, true)
    expect(typeof formatted).toBe('string')
    expect(formatted.length).toBeGreaterThan(0)
  })
})

// ─── formatStats ────────────────────────────────────────────────────────────

describe('formatStats', () => {
  it('formats stats as a string', () => {
    const result = buildFortressWallResult(['a.ts'], [EMPTY_CONTENT])
    const formatted = formatStats(result.stats)
    expect(typeof formatted).toBe('string')
    expect(formatted.length).toBeGreaterThan(0)
  })
})

// ─── formatFortressWallTable ────────────────────────────────────────────────

describe('formatFortressWallTable', () => {
  it('formats full result as a table string', () => {
    const result = buildFortressWallResult(['a.ts', 'b.ts'], [EMPTY_CONTENT, MINIMAL_CONTENT])
    const formatted = formatFortressWallTable(result, false)
    expect(typeof formatted).toBe('string')
    expect(formatted.length).toBeGreaterThan(0)
  })

  it('formats verbose table with more detail', () => {
    const result = buildFortressWallResult(['a.ts'], [MINIMAL_CONTENT])
    const formatted = formatFortressWallTable(result, true)
    expect(typeof formatted).toBe('string')
    expect(formatted.length).toBeGreaterThan(0)
  })
})

// ─── formatFortressWallJson ─────────────────────────────────────────────────

describe('formatFortressWallJson', () => {
  it('formats result as valid JSON string', () => {
    const result = buildFortressWallResult(['a.ts'], [MINIMAL_CONTENT])
    const jsonStr = formatFortressWallJson(result)
    expect(typeof jsonStr).toBe('string')
    const parsed = JSON.parse(jsonStr)
    expect(parsed).toBeDefined()
    expect(parsed.readings).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
  })

  it('includes all top-level keys', () => {
    const result = buildFortressWallResult(['a.ts', 'b.ts'], [EMPTY_CONTENT, MINIMAL_CONTENT])
    const parsed = JSON.parse(formatFortressWallJson(result))
    expect(parsed).toHaveProperty('readings')
    expect(parsed).toHaveProperty('zones')
    expect(parsed).toHaveProperty('stats')
    expect(parsed).toHaveProperty('kingdom')
  })

  it('serializes empty results', () => {
    const result = buildFortressWallResult([], [])
    const parsed = JSON.parse(formatFortressWallJson(result))
    expect(parsed.readings).toHaveLength(0)
    expect(parsed.zones).toHaveLength(0)
  })
})
