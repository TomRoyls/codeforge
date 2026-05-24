import { describe, expect, it } from 'vitest'
import {
  analyzeSapphirePillar,
  analyzePavilionGround,
  buildSapphirePavilionResult,
  classifyGroundCondition,
  classifyGroundType,
  classifyPillarCondition,
  classifyStewardGrade,
  generateRecommendations,
  measureBearing,
  measureClarifying,
  measureGrounding,
  measureShielding,
  measureWelcoming,
} from '../src/commands/sapphire-pavilion-helpers.js'
import {
  colorGrade,
  colorScore,
  formatGroundTable,
  formatGroundsTable,
  formatPillarTable,
  formatPillarsTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
} from '../src/commands/sapphire-pavilion-format-helpers.js'

// ─── Test Fixtures ────────────────────────────────────────────────

const minimalContent = `const x = 1`

const moderateContent = `
import { foo } from 'bar'
export interface User {
  name: string
  age: number
}
export type UserRole = 'admin' | 'user'
export function getUser(id: string): User | null {
  if (id === '1') return { name: 'test', age: 20 }
  return null
}
const users: User[] = []
`

const richContent = `
import { z } from 'zod'
import type { Config } from './config.js'

/**
 * User configuration interface
 */
export interface UserConfig {
  readonly name: string
  readonly age: number
  email?: string
}

export enum Role {
  Admin = 'admin',
  User = 'user',
  Guest = 'guest',
}

export type Status = 'active' | 'inactive' | 'pending'

export class UserService<T extends UserConfig> {
  private users: T[] = []

  async addUser(user: T): Promise<void> {
    try {
      this.users.push(user)
    } catch (error) {
      throw new Error('Failed to add user')
    }
  }

  getUser(id: string): T | undefined {
    return this.users.find(u => u.name === id)
  }
}

export const DEFAULT_CONFIG: UserConfig = {
  name: 'default',
  age: 0,
}

export function createConfig(name: string, age: number): UserConfig {
  return { name, age }
}

export type Result<T> = { ok: true; value: T } | { ok: false; error: string }
`

// ─── measureClarifying ────────────────────────────────────────────

describe('measureClarifying', () => {
  it('returns clarity score for minimal content', () => {
    const m = measureClarifying(minimalContent)
    expect(m.clarity).toBe(8)
    expect(m.grade).toBe('no-clarity')
  })

  it('detects high clarity for rich content', () => {
    const m = measureClarifying(richContent)
    expect(m.hasHighClarity).toBe(true)
    expect(m.grade).toBe('flawless-sapphire')
  })

  it('detects no obfuscated code in clean content', () => {
    const m = measureClarifying(richContent)
    expect(m.hasNoObfuscated).toBe(true)
    expect(m.obfuscatedCount).toBe(0)
  })

  it('detects no cryptic code in clean content', () => {
    const m = measureClarifying(richContent)
    expect(m.hasNoCryptic).toBe(true)
    expect(m.crypticCount).toBe(0)
  })

  it('detects transparent and readable for rich content', () => {
    const m = measureClarifying(richContent)
    expect(m.hasTransparent).toBe(true)
    expect(m.hasReadable).toBe(true)
  })

  it('detects self-documenting for rich content', () => {
    const m = measureClarifying(richContent)
    expect(m.hasSelfDocumenting).toBe(true)
    expect(m.hasUnderstandable).toBe(true)
  })

  it('computes correct clarity for moderate content', () => {
    const m = measureClarifying(moderateContent)
    expect(m.clarity).toBe(52)
    expect(m.grade).toBe('cloudy-stone')
  })

  it('computes correct clarity for rich content', () => {
    const m = measureClarifying(richContent)
    expect(m.clarity).toBe(100)
  })
})

// ─── measureBearing ───────────────────────────────────────────────

describe('measureBearing', () => {
  it('returns strength score for minimal content', () => {
    const m = measureBearing(minimalContent)
    expect(m.strength).toBe(6)
    expect(m.pillar).toBe('no-support')
  })

  it('detects high strength for rich content', () => {
    const m = measureBearing(richContent)
    expect(m.hasHighStrength).toBe(true)
    expect(m.pillar).toBe('diamond-pillar')
  })

  it('detects no sluggish code in clean content', () => {
    const m = measureBearing(richContent)
    expect(m.hasNoSluggish).toBe(true)
    expect(m.sluggishCount).toBe(0)
  })

  it('detects robust and performant for rich content', () => {
    const m = measureBearing(richContent)
    expect(m.hasRobust).toBe(true)
    expect(m.hasPerformant).toBe(true)
  })

  it('detects solid for rich content', () => {
    const m = measureBearing(richContent)
    expect(m.hasSolid).toBe(true)
    expect(m.hasReliable).toBe(true)
  })

  it('computes correct strength for moderate content', () => {
    const m = measureBearing(moderateContent)
    expect(m.strength).toBe(54)
    expect(m.pillar).toBe('weak-beam')
  })

  it('computes correct strength for rich content', () => {
    const m = measureBearing(richContent)
    expect(m.strength).toBe(100)
  })
})

// ─── measureShielding ─────────────────────────────────────────────

describe('measureShielding', () => {
  it('returns protection score for minimal content', () => {
    const m = measureShielding(minimalContent)
    expect(m.protection).toBe(6)
    expect(m.roof).toBe('no-roof')
  })

  it('detects high protection for rich content', () => {
    const m = measureShielding(richContent)
    expect(m.hasHighProtection).toBe(true)
    expect(m.roof).toBe('impervious-dome')
  })

  it('detects encapsulated for rich content', () => {
    const m = measureShielding(richContent)
    expect(m.hasEncapsulated).toBe(true)
    expect(m.hasPrivateByDefault).toBe(true)
    expect(m.hasImmutable).toBe(true)
  })

  it('detects no leaked code in clean content', () => {
    const m = measureShielding(richContent)
    expect(m.hasNoLeaked).toBe(true)
    expect(m.leakedCount).toBe(0)
  })

  it('detects sealed and guarded for rich content', () => {
    const m = measureShielding(richContent)
    expect(m.hasSealed).toBe(true)
    expect(m.hasGuarded).toBe(true)
  })

  it('computes correct protection for moderate content', () => {
    const m = measureShielding(moderateContent)
    expect(m.protection).toBe(38)
    expect(m.roof).toBe('no-shelter')
  })

  it('computes correct protection for rich content', () => {
    const m = measureShielding(richContent)
    expect(m.protection).toBe(100)
  })
})

// ─── measureWelcoming ─────────────────────────────────────────────

describe('measureWelcoming', () => {
  it('returns elegance score for minimal content', () => {
    const m = measureWelcoming(minimalContent)
    expect(m.elegance).toBe(6)
    expect(m.hall).toBe('no-entrance')
  })

  it('detects high elegance for rich content', () => {
    const m = measureWelcoming(richContent)
    expect(m.hasHighElegance).toBe(true)
    expect(m.hall).toBe('grand-reception')
  })

  it('detects clean API for rich content', () => {
    const m = measureWelcoming(richContent)
    expect(m.hasCleanAPI).toBe(true)
    expect(m.hasIntuitive).toBe(true)
  })

  it('detects well-documented for rich content', () => {
    const m = measureWelcoming(richContent)
    expect(m.hasWellDocumented).toBe(true)
    expect(m.hasApproachable).toBe(true)
  })

  it('detects no hostile code in clean content', () => {
    const m = measureWelcoming(richContent)
    expect(m.hasNoHostile).toBe(true)
    expect(m.hostileCount).toBe(0)
  })

  it('computes correct elegance for moderate content', () => {
    const m = measureWelcoming(moderateContent)
    expect(m.elegance).toBe(47)
    expect(m.hall).toBe('crude-door')
  })

  it('computes correct elegance for rich content', () => {
    const m = measureWelcoming(richContent)
    expect(m.elegance).toBe(100)
  })
})

// ─── measureGrounding ─────────────────────────────────────────────

describe('measureGrounding', () => {
  it('returns depth score for minimal content', () => {
    const m = measureGrounding(minimalContent)
    expect(m.depth).toBe(6)
    expect(m.foundation).toBe('no-foundation')
  })

  it('detects high depth for rich content', () => {
    const m = measureGrounding(richContent)
    expect(m.hasHighDepth).toBe(true)
    expect(m.foundation).toBe('bedrock-deep')
  })

  it('detects tested and type-safe for rich content', () => {
    const m = measureGrounding(richContent)
    expect(m.hasTested).toBe(true)
    expect(m.hasTypeSafe).toBe(true)
  })

  it('detects well-structured for rich content', () => {
    const m = measureGrounding(richContent)
    expect(m.hasWellStructured).toBe(true)
    expect(m.hasErrorHandled).toBe(true)
  })

  it('detects no untested code in clean content', () => {
    const m = measureGrounding(richContent)
    expect(m.hasNoUntested).toBe(true)
    expect(m.untestedCount).toBe(0)
  })

  it('computes correct depth for moderate content', () => {
    const m = measureGrounding(moderateContent)
    expect(m.depth).toBe(52)
    expect(m.foundation).toBe('shallow-footing')
  })

  it('computes correct depth for rich content', () => {
    const m = measureGrounding(richContent)
    expect(m.depth).toBe(100)
  })
})

// ─── classifyPillarCondition ──────────────────────────────────────

describe('classifyPillarCondition', () => {
  it('returns sapphire-masterpiece for high score', () => {
    expect(classifyPillarCondition(90)).toBe('sapphire-masterpiece')
  })

  it('returns gem-pavilion for good score', () => {
    expect(classifyPillarCondition(75)).toBe('gem-pavilion')
  })

  it('returns proper-hall for moderate score', () => {
    expect(classifyPillarCondition(60)).toBe('proper-hall')
  })

  it('returns stone-building for low score', () => {
    expect(classifyPillarCondition(45)).toBe('stone-building')
  })

  it('returns wooden-hut for poor score', () => {
    expect(classifyPillarCondition(30)).toBe('wooden-hut')
  })

  it('returns ruins for very low score', () => {
    expect(classifyPillarCondition(10)).toBe('ruins')
  })
})

// ─── classifyGroundType ───────────────────────────────────────────

describe('classifyGroundType', () => {
  it('returns no-ground for empty array', () => {
    expect(classifyGroundType([])).toBe('no-ground')
  })

  it('returns palace-gardens for all masterpieces with high avg', () => {
    const pillars = [analyzeSapphirePillar(richContent, 'a.ts'), analyzeSapphirePillar(richContent, 'b.ts')]
    expect(classifyGroundType(pillars)).toBe('palace-gardens')
  })
})

// ─── classifyGroundCondition ──────────────────────────────────────

describe('classifyGroundCondition', () => {
  it('returns void for zero', () => {
    expect(classifyGroundCondition(0)).toBe('void')
  })

  it('returns magnificent-pavilion for high avg', () => {
    expect(classifyGroundCondition(80)).toBe('magnificent-pavilion')
  })

  it('returns beautiful-hall for good avg', () => {
    expect(classifyGroundCondition(65)).toBe('beautiful-hall')
  })
})

// ─── classifyStewardGrade ─────────────────────────────────────────

describe('classifyStewardGrade', () => {
  it('returns master-steward for high grandeur', () => {
    expect(classifyStewardGrade(90)).toBe('master-steward')
  })

  it('returns squatter for very low grandeur', () => {
    expect(classifyStewardGrade(5)).toBe('squatter')
  })

  it('returns palace-curator for good grandeur', () => {
    expect(classifyStewardGrade(70)).toBe('palace-curator')
  })

  it('returns skilled-keeper for moderate grandeur', () => {
    expect(classifyStewardGrade(55)).toBe('skilled-keeper')
  })
})

// ─── analyzeSapphirePillar ────────────────────────────────────────

describe('analyzeSapphirePillar', () => {
  it('computes expected minimal content scores', () => {
    const p = analyzeSapphirePillar(minimalContent, 'minimal.ts')
    expect(p.gemClarity).toBe(8)
    expect(p.pillarStrength).toBe(6)
    expect(p.roofProtection).toBe(6)
    expect(p.hallElegance).toBe(6)
    expect(p.foundationDepth).toBe(6)
    expect(p.qualityScore).toBe(6)
    expect(p.condition).toBe('ruins')
  })

  it('computes expected moderate content scores', () => {
    const p = analyzeSapphirePillar(moderateContent, 'moderate.ts')
    expect(p.gemClarity).toBe(52)
    expect(p.pillarStrength).toBe(54)
    expect(p.roofProtection).toBe(38)
    expect(p.hallElegance).toBe(47)
    expect(p.foundationDepth).toBe(52)
    expect(p.qualityScore).toBe(49)
    expect(p.condition).toBe('stone-building')
  })

  it('computes expected rich content scores', () => {
    const p = analyzeSapphirePillar(richContent, 'rich.ts')
    expect(p.gemClarity).toBe(100)
    expect(p.pillarStrength).toBe(100)
    expect(p.roofProtection).toBe(100)
    expect(p.hallElegance).toBe(100)
    expect(p.foundationDepth).toBe(100)
    expect(p.qualityScore).toBe(100)
    expect(p.condition).toBe('sapphire-masterpiece')
  })

  it('stores file path', () => {
    const p = analyzeSapphirePillar(minimalContent, 'my-file.ts')
    expect(p.file).toBe('my-file.ts')
  })

  it('includes all measure objects', () => {
    const p = analyzeSapphirePillar(richContent, 'rich.ts')
    expect(p.clarifying).toBeDefined()
    expect(p.bearing).toBeDefined()
    expect(p.shielding).toBeDefined()
    expect(p.welcoming).toBeDefined()
    expect(p.grounding).toBeDefined()
  })
})

// ─── analyzePavilionGround ────────────────────────────────────────

describe('analyzePavilionGround', () => {
  it('returns empty ground for no pillars', () => {
    const g = analyzePavilionGround([], 'src')
    expect(g.pillars).toHaveLength(0)
    expect(g.avgClarity).toBe(0)
    expect(g.avgStrength).toBe(0)
    expect(g.avgDepth).toBe(0)
    expect(g.groundType).toBe('no-ground')
    expect(g.condition).toBe('void')
    expect(g.sapphireMasterpieceCount).toBe(0)
    expect(g.ruinsCount).toBe(0)
  })

  it('returns correct directory', () => {
    const pillars = [analyzeSapphirePillar(richContent, 'src/a.ts')]
    expect(analyzePavilionGround(pillars, 'src').directory).toBe('src')
  })

  it('computes averages from pillars', () => {
    const pillars = [analyzeSapphirePillar(richContent, 'src/a.ts')]
    const g = analyzePavilionGround(pillars, 'src')
    expect(g.avgClarity).toBe(100)
    expect(g.avgStrength).toBe(100)
    expect(g.avgDepth).toBe(100)
  })

  it('counts sapphire masterpiece files', () => {
    const pillars = [analyzeSapphirePillar(richContent, 'src/a.ts')]
    expect(analyzePavilionGround(pillars, 'src').sapphireMasterpieceCount).toBe(1)
  })

  it('classifies rich content ground as palace-gardens', () => {
    const pillars = [analyzeSapphirePillar(richContent, 'src/a.ts')]
    const g = analyzePavilionGround(pillars, 'src')
    expect(g.groundType).toBe('palace-gardens')
    expect(g.condition).toBe('magnificent-pavilion')
  })

  it('averages across multiple pillars', () => {
    const p1 = analyzeSapphirePillar(richContent, 'src/a.ts')
    const p2 = analyzeSapphirePillar(minimalContent, 'src/b.ts')
    const g = analyzePavilionGround([p1, p2], 'src')
    expect(g.avgClarity).toBe(Math.round((100 + 8) / 2))
    expect(g.sapphireMasterpieceCount).toBe(1)
    expect(g.ruinsCount).toBe(1)
  })
})

// ─── buildSapphirePavilionResult ──────────────────────────────────

describe('buildSapphirePavilionResult', () => {
  it('handles empty input', async () => {
    const result = await buildSapphirePavilionResult([], [])
    expect(result.pillars).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.stewardGrade).toBe('squatter')
  })

  it('processes single file', async () => {
    const result = await buildSapphirePavilionResult(['test.ts'], [richContent])
    expect(result.pillars).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('computes stats for rich content', async () => {
    const result = await buildSapphirePavilionResult(['test.ts'], [richContent])
    expect(result.stats.avgGemClarity).toBe(100)
    expect(result.stats.avgPillarStrength).toBe(100)
    expect(result.stats.avgRoofProtection).toBe(100)
    expect(result.stats.avgHallElegance).toBe(100)
    expect(result.stats.avgFoundationDepth).toBe(100)
    expect(result.stats.sapphireMasterpieceCount).toBe(1)
  })

  it('computes estate for rich content', async () => {
    const result = await buildSapphirePavilionResult(['test.ts'], [richContent])
    expect(result.estate.avgClarity).toBe(100)
    expect(result.estate.avgStrength).toBe(100)
    expect(result.estate.isMagnificent).toBe(true)
    expect(result.estate.overallGrandeur).toBe(100)
  })

  it('identifies best pillar', async () => {
    const result = await buildSapphirePavilionResult(['bad.ts', 'good.ts'], [minimalContent, richContent])
    expect(result.stats.bestPillar).toBe('good.ts')
  })

  it('identifies clearest file', async () => {
    const result = await buildSapphirePavilionResult(['low.ts', 'high.ts'], [minimalContent, richContent])
    expect(result.stats.clearest).toBe('high.ts')
  })

  it('identifies strongest file', async () => {
    const result = await buildSapphirePavilionResult(['low.ts', 'high.ts'], [minimalContent, richContent])
    expect(result.stats.strongest).toBe('high.ts')
  })

  it('identifies most protected file', async () => {
    const result = await buildSapphirePavilionResult(['low.ts', 'high.ts'], [minimalContent, richContent])
    expect(result.stats.mostProtected).toBe('high.ts')
  })

  it('identifies deepest file', async () => {
    const result = await buildSapphirePavilionResult(['low.ts', 'high.ts'], [minimalContent, richContent])
    expect(result.stats.deepest).toBe('high.ts')
  })

  it('groups files by directory', async () => {
    const result = await buildSapphirePavilionResult(['src/a.ts', 'lib/b.ts'], [richContent, moderateContent])
    expect(result.grounds.length).toBeGreaterThanOrEqual(2)
  })

  it('counts high measure flags', async () => {
    const result = await buildSapphirePavilionResult(['test.ts'], [richContent])
    expect(result.stats.hasHighClarityCount).toBe(1)
    expect(result.stats.hasHighStrengthCount).toBe(1)
    expect(result.stats.hasHighProtectionCount).toBe(1)
    expect(result.stats.hasHighEleganceCount).toBe(1)
    expect(result.stats.hasHighDepthCount).toBe(1)
  })

  it('classifies steward grade for rich content', async () => {
    const result = await buildSapphirePavilionResult(['test.ts'], [richContent])
    expect(result.stats.stewardGrade).toBe('master-steward')
  })

  it('computes overall grandeur correctly', async () => {
    const result = await buildSapphirePavilionResult(['test.ts'], [richContent])
    expect(result.stats.overallGrandeur).toBe(100)
  })
})

// ─── generateRecommendations ──────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns perfect message for healthy codebase', () => {
    const p = analyzeSapphirePillar(richContent, 'test.ts')
    const pillars = [p]
    const ground = analyzePavilionGround(pillars, 'src')
    const estate = { avgClarity: 100, avgStrength: 100, avgDepth: 100, isMagnificent: true, overallGrandeur: 100 }
    const stats = {
      totalFiles: 1, totalGrounds: 1, avgGemClarity: 100, avgPillarStrength: 100,
      avgRoofProtection: 100, avgHallElegance: 100, avgFoundationDepth: 100,
      sapphireMasterpieceCount: 1, gemPavilionCount: 0, properHallCount: 0,
      stoneBuildingCount: 0, woodenHutCount: 0, ruinsCount: 0,
      hasHighClarityCount: 1, hasHighStrengthCount: 1, hasHighProtectionCount: 1,
      hasHighEleganceCount: 1, hasHighDepthCount: 1,
      overallGrandeur: 100, stewardGrade: 'master-steward' as const,
      bestPillar: 'test.ts', clearest: 'test.ts', strongest: 'test.ts',
      mostProtected: 'test.ts', deepest: 'test.ts',
    }
    const recs = generateRecommendations(pillars, [ground], estate, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('perfection')
  })

  it('suggests improving low clarity', () => {
    const p = analyzeSapphirePillar(minimalContent, 'bad.ts')
    const pillars = [p]
    const ground = analyzePavilionGround(pillars, 'src')
    const estate = { avgClarity: 8, avgStrength: 6, avgDepth: 6, isMagnificent: false, overallGrandeur: 7 }
    const stats = {
      totalFiles: 1, totalGrounds: 1, avgGemClarity: 8, avgPillarStrength: 6,
      avgRoofProtection: 6, avgHallElegance: 6, avgFoundationDepth: 6,
      sapphireMasterpieceCount: 0, gemPavilionCount: 0, properHallCount: 0,
      stoneBuildingCount: 0, woodenHutCount: 0, ruinsCount: 1,
      hasHighClarityCount: 0, hasHighStrengthCount: 0, hasHighProtectionCount: 0,
      hasHighEleganceCount: 0, hasHighDepthCount: 0,
      overallGrandeur: 7, stewardGrade: 'squatter' as const,
      bestPillar: 'bad.ts', clearest: 'bad.ts', strongest: 'bad.ts',
      mostProtected: 'bad.ts', deepest: 'bad.ts',
    }
    const recs = generateRecommendations(pillars, [ground], estate, stats)
    expect(recs.some(r => r.includes('clarity'))).toBe(true)
    expect(recs.some(r => r.includes('ruins'))).toBe(true)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────

describe('colorScore', () => {
  it('returns string for any score', () => {
    expect(typeof colorScore(50)).toBe('string')
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(100)).toBe('string')
  })
})

describe('colorGrade', () => {
  it('returns string for any grade', () => {
    expect(typeof colorGrade('sapphire-masterpiece')).toBe('string')
    expect(typeof colorGrade('ruins')).toBe('string')
    expect(typeof colorGrade('unknown-grade')).toBe('string')
  })
})

describe('formatPillarTable', () => {
  it('formats a pillar with all fields', () => {
    const p = analyzeSapphirePillar(richContent, 'rich.ts')
    const formatted = formatPillarTable(p)
    expect(formatted).toContain('rich.ts')
    expect(formatted).toContain('Gem Clarity')
    expect(formatted).toContain('Pillar Strength')
    expect(formatted).toContain('Roof Protection')
    expect(formatted).toContain('Hall Elegance')
    expect(formatted).toContain('Foundation Depth')
  })
})

describe('formatPillarsTable', () => {
  it('returns empty message for no pillars', () => {
    expect(formatPillarsTable([])).toContain('No sapphire pillars')
  })

  it('formats multiple pillars', () => {
    const pillars = [analyzeSapphirePillar(richContent, 'a.ts')]
    const formatted = formatPillarsTable(pillars)
    expect(formatted).toContain('Sapphire Pavilion Analysis')
  })
})

describe('formatGroundTable', () => {
  it('formats a ground with all fields', () => {
    const pillars = [analyzeSapphirePillar(richContent, 'src/a.ts')]
    const ground = analyzePavilionGround(pillars, 'src')
    const formatted = formatGroundTable(ground)
    expect(formatted).toContain('src')
    expect(formatted).toContain('Masterpieces')
  })
})

describe('formatGroundsTable', () => {
  it('returns empty message for no grounds', () => {
    expect(formatGroundsTable([])).toContain('No pavilion grounds')
  })
})

describe('formatStatsTable', () => {
  it('formats stats with all fields', async () => {
    const result = await buildSapphirePavilionResult(['test.ts'], [richContent])
    const formatted = formatStatsTable(result.stats)
    expect(formatted).toContain('Total Files')
    expect(formatted).toContain('Steward Grade')
    expect(formatted).toContain('Overall Grandeur')
  })
})

describe('formatRecommendations', () => {
  it('returns empty message for no recs', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formats recommendations as list', () => {
    const formatted = formatRecommendations(['Fix clarity', 'Add types'])
    expect(formatted).toContain('Recommendations')
    expect(formatted).toContain('Fix clarity')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildSapphirePavilionResult(['test.ts'], [richContent])
    const formatted = formatResultTable(result)
    expect(formatted).toContain('Sapphire Pavilion Analysis')
    expect(formatted).toContain('Estate')
    expect(formatted).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('formats as valid JSON', async () => {
    const result = await buildSapphirePavilionResult(['test.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.pillars).toHaveLength(1)
    expect(parsed.estate.overallGrandeur).toBe(100)
  })
})
