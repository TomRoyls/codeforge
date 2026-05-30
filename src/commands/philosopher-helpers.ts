// ─── Types ─────────────────────────────────────────────────────────────────────

export interface Violation {
  file: string
  line: number
  principle: string
  severity: 'minor' | 'moderate' | 'major' | 'heresy'
  description: string
  lesson: string
  fix: string
}

export interface Principle {
  name: string
  category: 'simplicity' | 'coupling' | 'cohesion' | 'abstraction' | 'surprise' | 'composition'
  description: string
  philosopher: string
  adherence: number
  violations: Violation[]
  wisdoms: string[]
}

export interface PhilosophicalProfile {
  file: string
  principleScores: Record<string, number>
  wisdom: number
  dominantVirtue: string
  cardinalSin: string
  isEnlightened: boolean
  classification: 'sage' | 'scholar' | 'seeker' | 'skeptic' | 'heretic'
}

export interface PhilosopherStats {
  totalPrinciples: number
  avgAdherence: number
  bestPrinciple: string
  worstPrinciple: string
  totalViolations: number
  heresyViolations: number
  sageFiles: number
  hereticFiles: number
  avgWisdom: number
  enlightenmentRate: number
  dominantVirtue: string
  cardinalSin: string
  overallWisdom: number
  era: 'enlightenment' | 'renaissance' | 'classical' | 'medieval' | 'barbaric'
}

export interface PhilosopherResult {
  principles: Principle[]
  profiles: PhilosophicalProfile[]
  stats: PhilosopherStats
  recommendations: string[]
}

// ─── Principle Definitions ─────────────────────────────────────────────────────

interface PrincipleDef {
  name: string
  category: 'simplicity' | 'coupling' | 'cohesion' | 'abstraction' | 'surprise' | 'composition'
  description: string
  philosopher: string
}

const PRINCIPLE_DEFS: PrincipleDef[] = [
  { name: "Occam's Razor", category: 'simplicity', description: 'The simplest solution is usually the best', philosopher: 'William of Ockham' },
  { name: 'Single Responsibility', category: 'cohesion', description: 'Each module should do one thing well', philosopher: 'Robert C. Martin' },
  { name: 'Open/Closed', category: 'abstraction', description: 'Open for extension, closed for modification', philosopher: 'Bertrand Meyer' },
  { name: 'DRY', category: 'coupling', description: "Don't Repeat Yourself", philosopher: 'Andy Hunt & Dave Thomas' },
  { name: 'YAGNI', category: 'simplicity', description: "You Aren't Gonna Need It", philosopher: 'Ron Jeffries' },
  { name: 'Least Surprise', category: 'surprise', description: 'Code should behave as expected', philosopher: 'Larry Wall' },
  { name: 'Composition over Inheritance', category: 'composition', description: 'Prefer composing behavior over inheriting it', philosopher: 'Gang of Four' },
  { name: 'Law of Demeter', category: 'coupling', description: "Don't talk to strangers", philosopher: 'Ian Holland' },
  { name: 'Encapsulation', category: 'abstraction', description: 'Hide implementation details behind interfaces', philosopher: 'David Parnas' },
  { name: 'Fail Fast', category: 'surprise', description: 'Errors should surface immediately', philosopher: 'Jim Shore' },
]

// ─── Principle Evaluation ──────────────────────────────────────────────────────

/**
 * Count function declarations in content
 * @example
 * countFunctions('function foo() {} const bar = () => {}') // 2
 */
function countFunctions(content: string): number {
  const named = (content.match(/function\s+\w+/g) || []).length
  const arrow = (content.match(/=\s*\([^)]*\)\s*=>|=\s*\w+\s*=>/g) || []).length
  const method = (content.match(/\w+\s*\([^)]*\)\s*:\s*\w+/g) || []).length
  return named + arrow + method
}

/**
 * Count class declarations
 * @example
 * countClasses('class Foo {} class Bar {}') // 2
 */
function countClasses(content: string): number {
  return (content.match(/class\s+\w+/g) || []).length
}

/**
 * Count export declarations
 * @example
 * countExports('export const x = 1; export function f() {}') // 2
 */
function countExports(content: string): number {
  return (content.match(/export\s+/g) || []).length
}


/**
 * Get maximum nesting depth
 * @example
 * getMaxNesting('if (x) { if (y) { if (z) { } } }') // 3
 */
function getMaxNesting(content: string): number {
  let maxDepth = 0
  let currentDepth = 0
  for (const ch of content) {
    if (ch === '{') {
      currentDepth++
      if (currentDepth > maxDepth) maxDepth = currentDepth
    } else if (ch === '}') {
      currentDepth = Math.max(0, currentDepth - 1)
    }
  }
  return maxDepth
}

/**
 * Count method chains (a.b.c.d)
 * @example
 * countChains('obj.a.b.c.d.call()') // count of chains with 3+ links
 */
function countChains(content: string): number {
  const matches = content.match(/\.\w+\.\w+\.\w+/g) || []
  return matches.length
}

/**
 * Count duplicate lines
 * @example
 * countDuplicateLines('a\nb\na\nc\nb') // 2 (lines 'a' and 'b' appear more than once)
 */
function countDuplicateLines(content: string): number {
  const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith('//') && !l.startsWith('*'))
  const counts = new Map<string, number>()
  for (const line of lines) {
    counts.set(line, (counts.get(line) || 0) + 1)
  }
  let dupes = 0
  for (const count of counts.values()) {
    if (count > 1) dupes += count
  }
  return dupes
}

/**
 * Count magic numbers (bare numeric literals excluding 0, 1, -1)
 * @example
 * countMagicNumbers('const x = 42; const y = 3.14') // 2
 */
function countMagicNumbers(content: string): number {
  const matches = content.match(/(?<![.\w])\d+\.?\d*(?![.\w])/g) || []
  return matches.filter(m => m !== '0' && m !== '1').length
}

/**
 * Count TODO/FIXME/unused patterns for YAGNI detection
 * @example
 * countPrematurePatterns('// TODO: future feature\n// unused: placeholder') // 2
 */
function countPrematurePatterns(content: string): number {
  const todoCount = (content.match(/\/\/\s*TODO|\/\/\s*todo/gi) || []).length
  const futureCount = (content.match(/future|placeholder|unused|unimplemented|stub/gi) || []).length
  return todoCount + futureCount
}

/**
 * Count inheritance patterns (extends)
 * @example
 * countInheritance('class A extends B {}') // 1
 */
function countInheritance(content: string): number {
  return (content.match(/extends\s+\w+/g) || []).length
}

/**
 * Count composition patterns (has-a, delegation, contains)
 * @example
 * countComposition('const x = { foo: new Bar() }') // patterns
 */
function countComposition(content: string): number {
  const hasPattern = (content.match(/\.bind\(|\.apply\(|\.call\(/g) || []).length
  const objComposition = (content.match(/\w+\s*:\s*new\s+/g) || []).length
  const spreading = (content.match(/\.\.\./g) || []).length
  const objectAssign = (content.match(/Object\.assign|Object\.create/g) || []).length
  return hasPattern + objComposition + spreading + objectAssign
}

/**
 * Count try/catch, throw, assert patterns
 * @example
 * countErrorHandling('try { } catch(e) { throw new Error() }') // 3
 */
function countErrorHandling(content: string): number {
  const tryCatch = (content.match(/try\s*\{|catch\s*\(/g) || []).length
  const throws = (content.match(/throw\s+/g) || []).length
  const asserts = (content.match(/assert|Assert|invariant|Invariant/g) || []).length
  return tryCatch + throws + asserts
}

/**
 * Count private/hidden members
 * @example
 * countEncapsulation('private x; #y; _z') // 3
 */
function countEncapsulation(content: string): number {
  const privateKw = (content.match(/private\s+/g) || []).length
  const hashPrivate = (content.match(/#\w+/g) || []).length
  const underscore = (content.match(/_\w+\s*[=(]/g) || []).length
  return privateKw + hashPrivate + underscore
}

/**
 * Count interface/type exports
 * @example
 * countInterfaceExports('interface Foo {} export type Bar = {}') // 2
 */
function countInterfaceExports(content: string): number {
  const ifaces = (content.match(/interface\s+\w+/g) || []).length
  const types = (content.match(/type\s+\w+\s*=/g) || []).length
  return ifaces + types
}

/**
 * Count switch/if-else branches
 * @example
 * countBranches('if (a) {} else if (b) {} else {}') // 3
 */
function countBranches(content: string): number {
  const ifElse = (content.match(/if\s*\(/g) || []).length
  const cases = (content.match(/case\s+/g) || []).length
  return ifElse + cases
}

/**
 * Evaluate a single principle against file content
 * @example
 * evaluatePrinciple('const x = 1', 'a.ts', "Occam's Razor") // 85
 */
export function evaluatePrinciple(content: string, _filePath: string, principleName: string): number {
  const lines = content.split('\n').length
  const funcs = countFunctions(content)
  const classes = countClasses(content)
  const exports = countExports(content)
  const nesting = getMaxNesting(content)
  const chains = countChains(content)
  const dupes = countDuplicateLines(content)
  const magicNums = countMagicNumbers(content)
  const premature = countPrematurePatterns(content)
  const inheritance = countInheritance(content)
  const composition = countComposition(content)
  const errHandling = countErrorHandling(content)
  const encapsulation = countEncapsulation(content)
  const ifaces = countInterfaceExports(content)
  const branches = countBranches(content)

  switch (principleName) {
    case "Occam's Razor": {
      let score = 90
      if (nesting > 4) score -= (nesting - 4) * 8
      if (lines > 300) score -= Math.min(30, (lines - 300) / 10)
      if (funcs > 15) score -= (funcs - 15) * 3
      if (classes > 5) score -= (classes - 5) * 5
      const abstractLayers = (content.match(/abstract\s+/g) || []).length
      if (abstractLayers > 3) score -= (abstractLayers - 3) * 5
      return Math.max(0, Math.min(100, score))
    }
    case 'Single Responsibility': {
      let score = 85
      if (funcs > 10) score -= (funcs - 10) * 4
      if (exports > 8) score -= (exports - 8) * 5
      if (classes > 3) score -= (classes - 3) * 5
      if (branches > 10) score -= (branches - 10) * 2
      const responsibilities = Math.max(funcs, exports, classes)
      if (responsibilities <= 3) score = Math.max(score, 90)
      return Math.max(0, Math.min(100, score))
    }
    case 'Open/Closed': {
      let score = 50
      if (ifaces > 0) score += 15
      if (ifaces >= 2) score += 10
      if (exports > 0) score += 5
      if (/implements\s+\w+/.test(content)) score += 10
      if (/extends\s+\w+/.test(content)) score += 5
      if (/abstract\s+/.test(content)) score += 5
      return Math.max(0, Math.min(100, score))
    }
    case 'DRY': {
      let score = 85
      const dupeRatio = lines > 0 ? dupes / lines : 0
      score -= Math.round(dupeRatio * 200)
      const copyPaste = (content.match(/\/\/\s*copied|\/\/\s*duplicate|\/\/\s*same\s+as/gi) || []).length
      score -= copyPaste * 10
      return Math.max(0, Math.min(100, score))
    }
    case 'YAGNI': {
      let score = 80
      score -= premature * 5
      const deadCode = (content.match(/\/\/\s*eslint-disable|\/\/\s*@ts-ignore|\/\/\s*NOSONAR/gi) || []).length
      score -= deadCode * 5
      const overGeneric = (content.match(/<\w+,\s*\w+,\s*\w+>/g) || []).length
      score -= overGeneric * 8
      const futureProof = (content.match(/future|someday|eventually|later/gi) || []).length
      score -= futureProof * 3
      return Math.max(0, Math.min(100, score))
    }
    case 'Least Surprise': {
      let score = 85
      score -= magicNums * 3
      const implicitConv = (content.match(/\+\s*['"]|['"]\s*\+|==(?!=)/g) || []).length
      score -= implicitConv * 5
      const globalVars = (content.match(/^var\s+/m) || []).length
      score -= globalVars * 8
      const evalUse = (content.match(/\beval\s*\(/g) || []).length
      score -= evalUse * 15
      return Math.max(0, Math.min(100, score))
    }
    case 'Composition over Inheritance': {
      if (inheritance === 0 && classes === 0) return 70
      if (inheritance === 0) return 85
      const ratio = composition / Math.max(1, inheritance + composition)
      return Math.max(0, Math.min(100, Math.round(40 + ratio * 50)))
    }
    case 'Law of Demeter': {
      let score = 80
      score -= chains * 8
      const deepAccess = (content.match(/\.\w+\.\w+\.\w+\.\w+/g) || []).length
      score -= deepAccess * 10
      return Math.max(0, Math.min(100, score))
    }
    case 'Encapsulation': {
      let score = 50
      if (encapsulation > 0) score += Math.min(25, encapsulation * 5)
      if (ifaces > 0) score += 10
      if (/export\s+\{/.test(content)) score += 5
      if (exports > 0) score += 5
      if (/public\s+/.test(content)) score += 5
      return Math.max(0, Math.min(100, score))
    }
    case 'Fail Fast': {
      let score = 50
      if (errHandling > 0) score += Math.min(30, errHandling * 8)
      const earlyReturn = (content.match(/return\s+/g) || []).length
      if (earlyReturn > 0) score += Math.min(10, earlyReturn * 2)
      const guardClause = (content.match(/if\s*\([^)]*\)\s*\{\s*return|if\s*\([^)]*\)\s*return/g) || []).length
      score += Math.min(10, guardClause * 3)
      return Math.max(0, Math.min(100, score))
    }
    default:
      return 50
  }
}

// ─── Violation Detection ───────────────────────────────────────────────────────

/**
 * Find violations of a specific principle
 * @example
 * findViolations('if (a) { if (b) { if (c) { if (d) { if (e) {} } } } }', 'a.ts', "Occam's Razor") // Violation[]
 */
export function findViolations(content: string, filePath: string, principleName: string): Violation[] {
  const violations: Violation[] = []
  const lines = content.split('\n')

  switch (principleName) {
    case "Occam's Razor": {
      let depth = 0
      for (let i = 0; i < lines.length; i++) {
        for (const ch of (lines[i] ?? '')) {
          if (ch === '{') depth++
          else if (ch === '}') depth = Math.max(0, depth - 1)
        }
        if (depth > 4) {
          violations.push({
            file: filePath,
            line: i + 1,
            principle: principleName,
            severity: depth > 6 ? 'heresy' : depth > 5 ? 'major' : 'moderate',
            description: `Deep nesting (level ${depth})`,
            lesson: 'Simplicity is the ultimate sophistication',
            fix: 'Extract nested logic into separate functions',
          })
        }
      }
      break
    }
    case 'Single Responsibility': {
      const funcCount = countFunctions(content)
      const exportCount = countExports(content)
      if (funcCount > 10) {
        violations.push({
          file: filePath,
          line: 1,
          principle: principleName,
          severity: funcCount > 20 ? 'major' : 'moderate',
          description: `${funcCount} functions in a single file`,
          lesson: 'A module should have only one reason to change',
          fix: 'Split into multiple modules with focused responsibilities',
        })
      }
      if (exportCount > 8) {
        violations.push({
          file: filePath,
          line: 1,
          principle: principleName,
          severity: 'moderate',
          description: `${exportCount} exports suggest multiple responsibilities`,
          lesson: 'Each module should serve one purpose',
          fix: 'Group related exports into separate modules',
        })
      }
      break
    }
    case 'Open/Closed': {
      if (!/interface|abstract|implements/.test(content) && content.length > 50) {
        violations.push({
          file: filePath,
          line: 1,
          principle: principleName,
          severity: 'minor',
          description: 'No abstraction layers for extension',
          lesson: 'Design for extension, not modification',
          fix: 'Introduce interfaces or abstract classes for extension points',
        })
      }
      break
    }
    case 'DRY': {
      const lineArr = lines.map(l => l.trim()).filter(l => l.length > 3 && !l.startsWith('//'))
      const seen = new Map<string, number>()
      for (let i = 0; i < lineArr.length; i++) {
        const existing = seen.get(lineArr[i] ?? '')
        if (existing !== undefined) {
          violations.push({
            file: filePath,
            line: i + 1,
            principle: principleName,
            severity: 'moderate',
            description: `Duplicate of line ${existing + 1}: "${(lineArr[i] ?? '').slice(0, 40)}"`,
            lesson: 'Every piece of knowledge should have a single representation',
            fix: 'Extract duplicated logic into a shared function',
          })
        } else {
          seen.set(lineArr[i] ?? '', i)
        }
      }
      break
    }
    case 'YAGNI': {
      const futureMatch = content.match(/future|someday|eventually|later/gi)
      if (futureMatch && futureMatch.length > 0) {
        violations.push({
          file: filePath,
          line: 1,
          principle: principleName,
          severity: 'minor',
          description: `${futureMatch.length} speculative code reference(s)`,
          lesson: 'Build only what you need now',
          fix: 'Remove speculative code and add it when actually needed',
        })
      }
      const stubMatch = content.match(/TODO|FIXME|placeholder|stub/gi)
      if (stubMatch && stubMatch.length > 3) {
        violations.push({
          file: filePath,
          line: 1,
          principle: principleName,
          severity: 'moderate',
          description: `${stubMatch.length} incomplete or stub implementations`,
          lesson: 'Incomplete code is debt that must be paid',
          fix: 'Complete or remove stub implementations',
        })
      }
      break
    }
    case 'Least Surprise': {
      const magicMatch = content.match(/(?<![.\w])\d+\.?\d*(?![.\w])/g)
      const magicLines: number[] = []
      if (magicMatch) {
        for (let i = 0; i < lines.length; i++) {
          const lineMagic = (lines[i] ?? '').match(/(?<![.\w])\d+\.?\d*(?![.\w])/g)
          if (lineMagic) {
            const nonTrivial = lineMagic.filter(m => m !== '0' && m !== '1')
            if (nonTrivial.length > 0) magicLines.push(i + 1)
          }
        }
      }
      if (magicLines.length > 3) {
        violations.push({
          file: filePath,
          line: magicLines[0] ?? 0,
          principle: principleName,
          severity: 'moderate',
          description: `${magicLines.length} lines with magic numbers`,
          lesson: 'Named constants are more readable than raw numbers',
          fix: 'Extract magic numbers into named constants',
        })
      }
      if (/\beval\s*\(/.test(content)) {
        const evalLine = lines.findIndex(l => /\beval\s*\(/.test(l))
        violations.push({
          file: filePath,
          line: evalLine + 1,
          principle: principleName,
          severity: 'heresy',
          description: 'Use of eval() is dangerous and unexpected',
          lesson: 'Never use eval() — it opens the door to injection attacks',
          fix: 'Replace eval() with a safer alternative',
        })
      }
      break
    }
    case 'Composition over Inheritance': {
      const extendsMatch = content.match(/extends\s+\w+/g)
      if (extendsMatch && extendsMatch.length > 2) {
        violations.push({
          file: filePath,
          line: 1,
          principle: principleName,
          severity: extendsMatch.length > 4 ? 'major' : 'moderate',
          description: `${extendsMatch.length} inheritance hierarchies`,
          lesson: 'Favor composition for flexible behavior reuse',
          fix: 'Replace deep inheritance with composed behavior',
        })
      }
      break
    }
    case 'Law of Demeter': {
      for (let i = 0; i < lines.length; i++) {
        const chainMatch = (lines[i] ?? '').match(/\.(\w+)\.(\w+)\.(\w+)\.(\w+)/)
        if (chainMatch) {
          violations.push({
            file: filePath,
            line: i + 1,
            principle: principleName,
            severity: 'major',
            description: `Chain: ...${chainMatch[1]}.${chainMatch[2]}.${chainMatch[3]}.${chainMatch[4]}`,
            lesson: 'Only talk to your immediate friends',
            fix: 'Introduce intermediate accessor methods',
          })
        }
      }
      break
    }
    case 'Encapsulation': {
      if (/public\s+\w+\s*[=;]/.test(content) && !/private\s+/.test(content)) {
        violations.push({
          file: filePath,
          line: 1,
          principle: principleName,
          severity: 'minor',
          description: 'Public members without corresponding private members',
          lesson: 'Hide what varies behind stable interfaces',
          fix: 'Make implementation details private',
        })
      }
      break
    }
    case 'Fail Fast': {
      const hasAsync = /async\s+|Promise|\.then\(/.test(content)
      const hasCatch = /catch\s*\(|\.catch\s*\(/.test(content)
      if (hasAsync && !hasCatch) {
        violations.push({
          file: filePath,
          line: 1,
          principle: principleName,
          severity: 'moderate',
          description: 'Async code without error handling',
          lesson: 'Silent failures are the hardest to debug',
          fix: 'Add try/catch or .catch() handlers for async operations',
        })
      }
      break
    }
  }

  return violations
}

// ─── Profile Building ──────────────────────────────────────────────────────────

/**
 * Build a philosophical profile for a file
 * @example
 * buildProfile('const x = 1', 'a.ts') // PhilosophicalProfile
 */
export function buildProfile(content: string, filePath: string): PhilosophicalProfile {
  const principleScores: Record<string, number> = {}
  const allViolations: Violation[] = []

  for (const def of PRINCIPLE_DEFS) {
    const score = evaluatePrinciple(content, filePath, def.name)
    principleScores[def.name] = score
    const violations = findViolations(content, filePath, def.name)
    allViolations.push(...violations)
  }

  const scores = Object.values(principleScores)
  const wisdom = computeWisdom(scores)

  const entries = Object.entries(principleScores)
  entries.sort((a, b) => b[1] - a[1])
  const dominantVirtue = entries[0]?.[0] || 'Unknown'
  const cardinalSin = entries[entries.length - 1]?.[0] || 'Unknown'

  const isEnlightened = scores.every(s => s >= 70)

  const classification = classifyProfile(wisdom, isEnlightened, allViolations)

  return {
    file: filePath,
    principleScores,
    wisdom,
    dominantVirtue,
    cardinalSin,
    isEnlightened,
    classification,
  }
}

/**
 * Compute overall wisdom score from principle scores
 * @example
 * computeWisdom([80, 70, 90, 60, 75]) // 75
 */
export function computeWisdom(scores: number[]): number {
  if (scores.length === 0) return 50
  return Math.round(scores.reduce((s, v) => s + v, 0) / scores.length)
}

/**
 * Classify a profile based on wisdom and violations
 * @example
 * classifyProfile(85, true, []) // 'sage'
 */
export function classifyProfile(
  wisdom: number,
  isEnlightened: boolean,
  violations: Violation[],
): PhilosophicalProfile['classification'] {
  const heresyCount = violations.filter(v => v.severity === 'heresy').length
  if (isEnlightened && wisdom >= 80) return 'sage'
  if (heresyCount >= 2) return 'heretic'
  if (wisdom >= 70) return 'scholar'
  if (wisdom >= 50) return 'seeker'
  if (heresyCount >= 1) return 'heretic'
  return 'skeptic'
}

// ─── Era Classification ────────────────────────────────────────────────────────

/**
 * Classify the era based on overall wisdom
 * @example
 * classifyEra(90, 85) // 'enlightenment'
 */
export function classifyEra(wisdom: number, avgAdherence: number): PhilosopherStats['era'] {
  const combined = wisdom * 0.6 + avgAdherence * 0.4
  if (combined >= 80) return 'enlightenment'
  if (combined >= 65) return 'renaissance'
  if (combined >= 50) return 'classical'
  if (combined >= 35) return 'medieval'
  return 'barbaric'
}

// ─── Recommendation Generation ─────────────────────────────────────────────────

/**
 * Generate philosophical recommendations
 * @example
 * generateRecommendations(principles, profiles, []) // string[]
 */
export function generateRecommendations(
  principles: Principle[],
  profiles: PhilosophicalProfile[],
  _violations: Violation[],
): string[] {
  const recs: string[] = []

  const worstPrinciple = principles.reduce((w, p) => p.adherence < w.adherence ? p : w, principles[0] as typeof principles[number])
  if (worstPrinciple && worstPrinciple.adherence < 70) {
    recs.push(`Focus on ${worstPrinciple.name} — your weakest principle at ${worstPrinciple.adherence}/100`)
  }

  const hereticFiles = profiles.filter(p => p.classification === 'heretic')
  if (hereticFiles.length > 0) {
    recs.push(`Philosophical education needed for ${hereticFiles.length} heretic file(s)`)
  }

  const bestPrinciple = principles.reduce((b, p) => p.adherence > b.adherence ? p : b, principles[0] as typeof principles[number])
  if (bestPrinciple) {
    recs.push(`Maintain your strength in ${bestPrinciple.name} (${bestPrinciple.adherence}/100)`)
  }

  const unenlightened = profiles.filter(p => !p.isEnlightened)
  if (unenlightened.length > 0 && profiles.length > 0) {
    const rate = Math.round((1 - unenlightened.length / profiles.length) * 100)
    recs.push(`Enlightenment rate is ${rate}% — strive for higher philosophical awareness`)
  }

  const lowWisdom = profiles.filter(p => p.wisdom < 50)
  if (lowWisdom.length > 0) {
    recs.push(`${lowWisdom.length} file(s) have wisdom below 50 — apply core principles`)
  }

  return Array.from(new Set(recs))
}

// ─── Build Result ──────────────────────────────────────────────────────────────

/**
 * Build the complete philosopher result
 * @example
 * buildPhilosopherResult(['a.ts'], ['const x = 1'], {}) // PhilosopherResult
 */
export function buildPhilosopherResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): PhilosopherResult {
  const principleScoreMap = new Map<string, number[]>()
  const principleViolationsMap = new Map<string, Violation[]>()

  for (const def of PRINCIPLE_DEFS) {
    principleScoreMap.set(def.name, [])
    principleViolationsMap.set(def.name, [])
  }

  const profiles: PhilosophicalProfile[] = []
  const allViolations: Violation[] = []

  for (let i = 0; i < files.length; i++) {
    const content = contents[i]
    const filePath = files[i]

    for (const def of PRINCIPLE_DEFS) {
      const score = evaluatePrinciple(content ?? '',filePath ?? '', def.name)
      principleScoreMap.get(def.name)!.push(score)

      const violations = findViolations(content ?? '',filePath ?? '', def.name)
      principleViolationsMap.get(def.name)!.push(...violations)
      allViolations.push(...violations)
    }

    profiles.push(buildProfile(content ?? '',filePath ?? ''))
  }

  const principles: Principle[] = PRINCIPLE_DEFS.map(def => {
    const scores = principleScoreMap.get(def.name) || []
    const avgAdherence = scores.length > 0
      ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length)
      : 50
    const violations = principleViolationsMap.get(def.name) || []

    const wisdoms: string[] = []
    if (avgAdherence >= 70) wisdoms.push(`${def.name} is well-practiced across the codebase`)
    if (violations.length === 0) wisdoms.push(`No violations of ${def.name} detected`)
    if (avgAdherence >= 90) wisdoms.push(`Mastery of ${def.name} achieved`)
    if (avgAdherence < 50) wisdoms.push(`${def.name} requires deeper contemplation`)

    return {
      name: def.name,
      category: def.category,
      description: def.description,
      philosopher: def.philosopher,
      adherence: avgAdherence,
      violations: violations.slice(0, 20),
      wisdoms,
    }
  })

  const avg = (arr: number[]) => arr.length > 0
    ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length)
    : 50

  const avgAdherence = avg(principles.map(p => p.adherence))
  const avgWisdom = avg(profiles.map(p => p.wisdom))

  const sortedPrinciples = [...principles].sort((a, b) => b.adherence - a.adherence)
  const bestPrinciple = sortedPrinciples[0]?.name || 'Unknown'
  const worstPrinciple = sortedPrinciples[sortedPrinciples.length - 1]?.name || 'Unknown'

  const virtueCounts = new Map<string, number>()
  for (const p of profiles) {
    virtueCounts.set(p.dominantVirtue, (virtueCounts.get(p.dominantVirtue) || 0) + 1)
  }
  let dominantVirtue = 'Unknown'
  let maxVirtue = 0
  for (const [v, c] of virtueCounts) {
    if (c > maxVirtue) { maxVirtue = c; dominantVirtue = v }
  }

  const sinCounts = new Map<string, number>()
  for (const p of profiles) {
    sinCounts.set(p.cardinalSin, (sinCounts.get(p.cardinalSin) || 0) + 1)
  }
  let cardinalSin = 'Unknown'
  let maxSin = 0
  for (const [s, c] of sinCounts) {
    if (c > maxSin) { maxSin = c; cardinalSin = s }
  }

  const heresyViolations = allViolations.filter(v => v.severity === 'heresy').length
  const sageFiles = profiles.filter(p => p.classification === 'sage').length
  const hereticFiles = profiles.filter(p => p.classification === 'heretic').length
  const enlightenedFiles = profiles.filter(p => p.isEnlightened).length
  const enlightenmentRate = profiles.length > 0
    ? Math.round((enlightenedFiles / profiles.length) * 100)
    : 0

  const overallWisdom = avgWisdom
  const era = classifyEra(overallWisdom, avgAdherence)

  const stats: PhilosopherStats = {
    totalPrinciples: principles.length,
    avgAdherence,
    bestPrinciple,
    worstPrinciple,
    totalViolations: allViolations.length,
    heresyViolations,
    sageFiles,
    hereticFiles,
    avgWisdom,
    enlightenmentRate,
    dominantVirtue,
    cardinalSin,
    overallWisdom,
    era,
  }

  const recommendations = generateRecommendations(principles, profiles, allViolations)

  return { principles, profiles, stats, recommendations }
}
