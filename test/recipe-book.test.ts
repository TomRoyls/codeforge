import { describe, expect, it } from 'vitest'

import {
  buildRecipeBookResult,
  buildRecipe,
  classifyOverallComplexity,
  computeCookbookCompleteness,
  computeCoverage,
  computeReusability,
  detectRecipes,
  extractIngredients,
  findAbstractionOpportunities,
  findMatches,
  generateRecipeBookRecommendations,
  identifyFusionRecipes,
  identifySignatureRecipes,
  type Ingredient,
  type Recipe,
  type RecipeBookStats,
  type RecipeMatch,
} from '../src/commands/recipe-book-helpers.js'

import {
  formatCategoryBadge,
  formatComplexityLabel,
  formatDifficultyLabel,
  formatMatchTable,
  formatOpportunities,
  formatRecipeBookJson,
  formatRecipeBookRecommendations,
  formatRecipeBookStats,
  formatRecipeBookTable,
  formatRecipeCard,
  formatRecipeTable,
  formatReusabilityBar,
} from '../src/commands/recipe-book-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const EMPTY_CONTENT = ''

const SIMPLE_CONTENT = `const x = 1
const y = 2
console.log(x + y)
`

const IMPORT_CLASS_CONTENT = `import { Engine } from './engine'
import { Config } from './config'

class App {
  private engine: Engine

  constructor(config: Config) {
    this.engine = new Engine(config)
  }

  start(): void {
    this.engine.run()
  }
}
`

const ERROR_HANDLING_CONTENT = `import { process } from './processor'

function safeProcess(data: any): void {
  try {
    const result = process(data)
    if (result) {
      console.log(result)
    }
  } catch (error) {
    console.error(error)
  }
}
`

const ARRAY_IDIOM_CONTENT = `const items = [1, 2, 3, 4, 5]
const doubled = items.map(x => x * 2)
const evens = items.filter(x => x % 2 === 0)
const sum = items.reduce((acc, x) => acc + x, 0)
`

const TEST_CONTENT = `import { describe, expect, it } from 'vitest'

describe('my tests', () => {
  it('works', () => {
    expect(1 + 1).toBe(2)
  })
})
`

const CONFIG_CONTENT = `import { readFileSync } from 'node:fs'

const config = JSON.parse(readFileSync('./config.json', 'utf8'))
const port = process.env.PORT || 3000
`

const ASYNC_CONTENT = `import { fetch } from './http'

async function loadData(): Promise<void> {
  const response = await fetch('/api/data')
  const data = await response.json()
  return data
}
`

const IO_CONTENT = `import { readFile, writeFile } from 'node:fs/promises'

async function processFile(path: string): Promise<void> {
  const content = await readFile(path, 'utf8')
  const result = content.toUpperCase()
  await writeFile(path + '.out', result)
}
`

const VALIDATION_CONTENT = `function assertString(value: unknown): asserts value is string {
  if (typeof value !== 'string') {
    throw new TypeError('Expected string')
  }
  if (!(value instanceof String)) {
    console.log('primitive')
  }
}
`

const MULTI_FILES = ['app.ts', 'utils.ts', 'test/app.test.ts']
const MULTI_CONTENTS = [IMPORT_CLASS_CONTENT, ARRAY_IDIOM_CONTENT, TEST_CONTENT]

// ─── extractIngredients ────────────────────────────────────────────────────────

describe('extractIngredients', () => {
  it('returns empty for empty content', () => {
    expect(extractIngredients('')).toEqual([])
  })

  it('detects imports', () => {
    const ings = extractIngredients('import { x } from "./y"')
    expect(ings.some(i => i.type === 'import' && i.value === './y')).toBe(true)
  })

  it('detects classes', () => {
    const ings = extractIngredients('class App {}')
    expect(ings.some(i => i.type === 'class' && i.value === 'App')).toBe(true)
  })

  it('detects functions', () => {
    const ings = extractIngredients('function process() {}')
    expect(ings.some(i => i.type === 'function' && i.value === 'process')).toBe(true)
  })

  it('detects control flow', () => {
    const ings = extractIngredients('if (x) {} for (const i of arr) {}')
    expect(ings.some(i => i.type === 'control-flow' && i.value === 'if')).toBe(true)
    expect(ings.some(i => i.type === 'control-flow' && i.value === 'for')).toBe(true)
  })

  it('detects operators', () => {
    const ings = extractIngredients('if (x === 1 && y !== 2 || z) {}')
    expect(ings.some(i => i.type === 'operator' && i.value === '===')).toBe(true)
    expect(ings.some(i => i.type === 'operator' && i.value === '&&')).toBe(true)
  })

  it('detects comments', () => {
    const ings = extractIngredients('// line comment\n/* block */')
    expect(ings.some(i => i.type === 'comment-style' && i.value === '//')).toBe(true)
    expect(ings.some(i => i.type === 'comment-style' && i.value === '/*')).toBe(true)
  })

  it('detects type annotations', () => {
    const ings = extractIngredients('const x: string = "hi"')
    expect(ings.some(i => i.type === 'type' && i.value === 'string')).toBe(true)
  })

  it('counts frequency', () => {
    const ings = extractIngredients('if (a) {}\nif (b) {}')
    const ifIng = ings.find(i => i.type === 'control-flow' && i.value === 'if')
    expect(ifIng?.frequency).toBe(2)
  })
})

// ─── detectRecipes ─────────────────────────────────────────────────────────────

describe('detectRecipes', () => {
  it('returns empty for empty content', () => {
    const ings = extractIngredients('')
    expect(detectRecipes(ings, '', 'empty.ts')).toEqual([])
  })

  it('detects error-handling recipe', () => {
    const ings = extractIngredients(ERROR_HANDLING_CONTENT)
    const recipes = detectRecipes(ings, ERROR_HANDLING_CONTENT, 'err.ts')
    expect(recipes.some(r => r.category === 'error-handling')).toBe(true)
  })

  it('detects module class recipe', () => {
    const ings = extractIngredients(IMPORT_CLASS_CONTENT)
    const recipes = detectRecipes(ings, IMPORT_CLASS_CONTENT, 'app.ts')
    expect(recipes.some(r => r.name === 'Module Class Pattern')).toBe(true)
  })

  it('detects array idiom recipe', () => {
    const ings = extractIngredients(ARRAY_IDIOM_CONTENT)
    const recipes = detectRecipes(ings, ARRAY_IDIOM_CONTENT, 'arr.ts')
    expect(recipes.some(r => r.category === 'idiom')).toBe(true)
  })

  it('detects testing recipe', () => {
    const ings = extractIngredients(TEST_CONTENT)
    const recipes = detectRecipes(ings, TEST_CONTENT, 'test.ts')
    expect(recipes.some(r => r.category === 'testing')).toBe(true)
  })

  it('detects configuration recipe', () => {
    const ings = extractIngredients(CONFIG_CONTENT)
    const recipes = detectRecipes(ings, CONFIG_CONTENT, 'config.ts')
    expect(recipes.some(r => r.category === 'configuration')).toBe(true)
  })

  it('detects async pattern', () => {
    const ings = extractIngredients(ASYNC_CONTENT)
    const recipes = detectRecipes(ings, ASYNC_CONTENT, 'async.ts')
    expect(recipes.some(r => r.name === 'Async/Await Pattern')).toBe(true)
  })

  it('detects IO recipe', () => {
    const ings = extractIngredients(IO_CONTENT)
    const recipes = detectRecipes(ings, IO_CONTENT, 'io.ts')
    expect(recipes.some(r => r.category === 'io')).toBe(true)
  })

  it('detects validation recipe', () => {
    const ings = extractIngredients(VALIDATION_CONTENT)
    const recipes = detectRecipes(ings, VALIDATION_CONTENT, 'val.ts')
    expect(recipes.some(r => r.category === 'validation')).toBe(true)
  })

  it('detects export pattern', () => {
    const content = 'import { x } from "y"\nexport const z = x\n'
    const ings = extractIngredients(content)
    const recipes = detectRecipes(ings, content, 'mod.ts')
    expect(recipes.some(r => r.name === 'Module Export Pattern')).toBe(true)
  })

  it('assigns file to recipe', () => {
    const ings = extractIngredients(SIMPLE_CONTENT)
    const recipes = detectRecipes(ings, SIMPLE_CONTENT, 'simple.ts')
    for (const r of recipes) {
      expect(r.files).toContain('simple.ts')
    }
  })
})

// ─── buildRecipe ───────────────────────────────────────────────────────────────

describe('buildRecipe', () => {
  it('builds a recipe object', () => {
    const recipe = buildRecipe('r1', 'Test Recipe', 'utility', [], 'a.ts', 'easy', '5 min')
    expect(recipe.id).toBe('r1')
    expect(recipe.name).toBe('Test Recipe')
    expect(recipe.category).toBe('utility')
    expect(recipe.difficulty).toBe('easy')
    expect(recipe.prepTime).toBe('5 min')
    expect(recipe.servings).toBe(1)
  })
})

// ─── computeReusability ────────────────────────────────────────────────────────

describe('computeReusability', () => {
  const baseRecipe: Recipe = {
    id: 'r1', name: 'Test', category: 'utility', ingredients: [],
    servings: 1, difficulty: 'easy', prepTime: '5 min', instructions: [],
    files: ['a.ts'], isSignature: false, isFusion: false, reusability: 0,
  }

  it('increases with match count', () => {
    const low = computeReusability(baseRecipe, 1)
    const high = computeReusability(baseRecipe, 5)
    expect(high).toBeGreaterThan(low)
  })

  it('rewards utility category', () => {
    const utilRecipe = { ...baseRecipe, category: 'utility' }
    const ioRecipe = { ...baseRecipe, category: 'io' }
    expect(computeReusability(utilRecipe, 1)).toBeGreaterThan(computeReusability(ioRecipe, 1))
  })

  it('rewards easy difficulty', () => {
    const easyRecipe = { ...baseRecipe, difficulty: 'easy' }
    const complexRecipe = { ...baseRecipe, difficulty: 'complex' }
    expect(computeReusability(easyRecipe, 1)).toBeGreaterThan(computeReusability(complexRecipe, 1))
  })

  it('caps at 100', () => {
    expect(computeReusability(baseRecipe, 100)).toBeLessThanOrEqual(100)
  })
})

// ─── findMatches ───────────────────────────────────────────────────────────────

describe('findMatches', () => {
  it('returns empty for no recipes', () => {
    expect(findMatches([], ['a.ts'], ['code'])).toEqual([])
  })

  it('finds matches for recipes in files', () => {
    const ings = extractIngredients(SIMPLE_CONTENT)
    const recipes = detectRecipes(ings, SIMPLE_CONTENT, 'simple.ts')
    const matches = findMatches(recipes, ['simple.ts'], [SIMPLE_CONTENT])
    expect(matches.length).toBeGreaterThan(0)
    expect(matches[0].file).toBe('simple.ts')
  })

  it('computes confidence based on ingredients', () => {
    const ings = extractIngredients(IMPORT_CLASS_CONTENT)
    const recipes = detectRecipes(ings, IMPORT_CLASS_CONTENT, 'app.ts')
    const matches = findMatches(recipes, ['app.ts'], [IMPORT_CLASS_CONTENT])
    for (const m of matches) {
      expect(m.confidence).toBeGreaterThanOrEqual(0)
      expect(m.confidence).toBeLessThanOrEqual(100)
    }
  })
})

// ─── identifySignatureRecipes ──────────────────────────────────────────────────

describe('identifySignatureRecipes', () => {
  it('marks high-serving high-confidence as signature', () => {
    const recipes: Recipe[] = [{
      id: 'r1', name: 'Test', category: 'utility', ingredients: [],
      servings: 5, difficulty: 'easy', prepTime: '5 min', instructions: [],
      files: ['a.ts', 'b.ts', 'c.ts', 'd.ts', 'e.ts'], isSignature: false, isFusion: false, reusability: 80,
    }]
    const matches: RecipeMatch[] = [
      { file: 'a.ts', recipeId: 'r1', confidence: 90, variations: [], lineStart: 1, lineEnd: 10 },
      { file: 'b.ts', recipeId: 'r1', confidence: 85, variations: [], lineStart: 1, lineEnd: 10 },
    ]
    const result = identifySignatureRecipes(recipes, matches)
    expect(result[0].isSignature).toBe(true)
  })

  it('does not mark low-serving as signature', () => {
    const recipes: Recipe[] = [{
      id: 'r1', name: 'Test', category: 'utility', ingredients: [],
      servings: 1, difficulty: 'easy', prepTime: '5 min', instructions: [],
      files: ['a.ts'], isSignature: false, isFusion: false, reusability: 50,
    }]
    const result = identifySignatureRecipes(recipes, [])
    expect(result[0].isSignature).toBe(false)
  })
})

// ─── identifyFusionRecipes ─────────────────────────────────────────────────────

describe('identifyFusionRecipes', () => {
  it('marks multi-category files as fusion', () => {
    const recipes: Recipe[] = [
      { id: 'r1', name: 'A', category: 'utility', ingredients: [], servings: 1, difficulty: 'moderate', prepTime: '5m', instructions: [], files: ['a.ts'], isSignature: false, isFusion: false, reusability: 50 },
      { id: 'r2', name: 'B', category: 'testing', ingredients: [], servings: 1, difficulty: 'moderate', prepTime: '5m', instructions: [], files: ['a.ts'], isSignature: false, isFusion: false, reusability: 50 },
      { id: 'r3', name: 'C', category: 'io', ingredients: [], servings: 1, difficulty: 'moderate', prepTime: '5m', instructions: [], files: ['a.ts'], isSignature: false, isFusion: false, reusability: 50 },
    ]
    const result = identifyFusionRecipes(recipes)
    expect(result.every(r => r.isFusion)).toBe(true)
  })

  it('does not mark single-category as fusion', () => {
    const recipes: Recipe[] = [
      { id: 'r1', name: 'A', category: 'utility', ingredients: [], servings: 1, difficulty: 'easy', prepTime: '5m', instructions: [], files: ['a.ts'], isSignature: false, isFusion: false, reusability: 50 },
    ]
    const result = identifyFusionRecipes(recipes)
    expect(result[0].isFusion).toBe(false)
  })
})

// ─── findAbstractionOpportunities ──────────────────────────────────────────────

describe('findAbstractionOpportunities', () => {
  it('finds opportunities for repeated categories', () => {
    const recipes: Recipe[] = [
      { id: 'r1', name: 'A', category: 'utility', ingredients: [], servings: 1, difficulty: 'easy', prepTime: '5m', instructions: [], files: ['a.ts'], isSignature: false, isFusion: false, reusability: 50 },
      { id: 'r2', name: 'B', category: 'utility', ingredients: [], servings: 1, difficulty: 'easy', prepTime: '5m', instructions: [], files: ['b.ts'], isSignature: false, isFusion: false, reusability: 50 },
    ]
    const opps = findAbstractionOpportunities(recipes, [])
    expect(opps.some(o => o.pattern.includes('utility'))).toBe(true)
  })

  it('returns empty for single-file categories', () => {
    const recipes: Recipe[] = [
      { id: 'r1', name: 'A', category: 'utility', ingredients: [], servings: 1, difficulty: 'easy', prepTime: '5m', instructions: [], files: ['a.ts'], isSignature: false, isFusion: false, reusability: 50 },
    ]
    const opps = findAbstractionOpportunities(recipes, [])
    expect(opps).toEqual([])
  })
})

// ─── computeCoverage ───────────────────────────────────────────────────────────

describe('computeCoverage', () => {
  it('returns 0 for empty', () => {
    expect(computeCoverage([], 0)).toEqual({ boilerplateCoverage: 0, idiomCoverage: 0 })
  })

  it('computes boilerplate coverage', () => {
    const recipes: Recipe[] = [
      { id: 'r1', name: 'BP', category: 'boilerplate', ingredients: Array.from({ length: 5 }, () => ({ type: 'keyword' as const, value: 'const', frequency: 1, isCore: true })), servings: 1, difficulty: 'easy', prepTime: '5m', instructions: [], files: ['a.ts'], isSignature: false, isFusion: false, reusability: 50 },
    ]
    const cov = computeCoverage(recipes, 100)
    expect(cov.boilerplateCoverage).toBeGreaterThan(0)
  })

  it('computes idiom coverage', () => {
    const recipes: Recipe[] = [
      { id: 'r1', name: 'ID', category: 'idiom', ingredients: Array.from({ length: 3 }, () => ({ type: 'keyword' as const, value: 'map', frequency: 1, isCore: true })), servings: 1, difficulty: 'easy', prepTime: '5m', instructions: [], files: ['a.ts'], isSignature: false, isFusion: false, reusability: 50 },
    ]
    const cov = computeCoverage(recipes, 100)
    expect(cov.idiomCoverage).toBeGreaterThan(0)
  })
})

// ─── classifyOverallComplexity ─────────────────────────────────────────────────

describe('classifyOverallComplexity', () => {
  it('returns simple for empty', () => {
    expect(classifyOverallComplexity([])).toBe('simple')
  })

  it('returns simple for trivial recipes', () => {
    const recipes: Recipe[] = [
      { id: 'r1', name: 'A', category: 'utility', ingredients: [], servings: 1, difficulty: 'trivial', prepTime: '5m', instructions: [], files: ['a.ts'], isSignature: false, isFusion: false, reusability: 50 },
    ]
    expect(classifyOverallComplexity(recipes)).toBe('simple')
  })

  it('returns gourmet for expert recipes', () => {
    const recipes: Recipe[] = [
      { id: 'r1', name: 'A', category: 'pattern', ingredients: [], servings: 1, difficulty: 'expert', prepTime: '5m', instructions: [], files: ['a.ts'], isSignature: false, isFusion: false, reusability: 50 },
      { id: 'r2', name: 'B', category: 'algorithm', ingredients: [], servings: 1, difficulty: 'expert', prepTime: '5m', instructions: [], files: ['a.ts'], isSignature: false, isFusion: false, reusability: 50 },
    ]
    expect(classifyOverallComplexity(recipes)).toBe('gourmet')
  })
})

// ─── computeCookbookCompleteness ───────────────────────────────────────────────

describe('computeCookbookCompleteness', () => {
  it('returns 0 for empty', () => {
    expect(computeCookbookCompleteness([], [])).toBe(0)
  })

  it('increases with categories', () => {
    const recipes: Recipe[] = [
      { id: 'r1', name: 'A', category: 'utility', ingredients: [], servings: 1, difficulty: 'easy', prepTime: '5m', instructions: [], files: ['a.ts'], isSignature: true, isFusion: false, reusability: 80 },
      { id: 'r2', name: 'B', category: 'testing', ingredients: [], servings: 1, difficulty: 'easy', prepTime: '5m', instructions: [], files: ['a.ts'], isSignature: true, isFusion: false, reusability: 80 },
    ]
    const matches: RecipeMatch[] = [
      { file: 'a.ts', recipeId: 'r1', confidence: 90, variations: [], lineStart: 1, lineEnd: 10 },
    ]
    expect(computeCookbookCompleteness(recipes, matches)).toBeGreaterThan(0)
  })
})

// ─── generateRecipeBookRecommendations ─────────────────────────────────────────

describe('generateRecipeBookRecommendations', () => {
  const baseStats: RecipeBookStats = {
    totalRecipes: 5, totalMatches: 10,
    categoryDistribution: {}, difficultyDistribution: {},
    avgReusability: 60, signatureCount: 0, fusionCount: 0,
    mostUsedRecipe: 'A', leastUsedRecipe: 'B',
    boilerplateCoverage: 10, idiomCoverage: 15,
    abstractionOpportunities: 0, cookbookCompleteness: 70,
    overallComplexity: 'moderate',
  }

  it('recommends documenting signatures', () => {
    const recipes: Recipe[] = [
      { id: 'r1', name: 'A', category: 'utility', ingredients: [], servings: 5, difficulty: 'easy', prepTime: '5m', instructions: [], files: [], isSignature: true, isFusion: false, reusability: 80 },
    ]
    const recs = generateRecipeBookRecommendations(recipes, [], baseStats)
    expect(recs.some(r => r.includes('signature'))).toBe(true)
  })

  it('recommends extracting shared patterns', () => {
    const opps = [{ pattern: 'test', files: ['a.ts'], estimatedSaving: 20, difficulty: 'easy' as const, suggestedApproach: 'Extract' }]
    const recs = generateRecipeBookRecommendations([], opps, baseStats)
    expect(recs.some(r => r.includes('shared pattern'))).toBe(true)
  })

  it('recommends for high boilerplate', () => {
    const stats = { ...baseStats, boilerplateCoverage: 50 }
    const recs = generateRecipeBookRecommendations([], [], stats)
    expect(recs.some(r => r.includes('boilerplate'))).toBe(true)
  })

  it('returns empty for clean codebase', () => {
    const recs = generateRecipeBookRecommendations([], [], baseStats)
    expect(recs).toEqual([])
  })
})

// ─── buildRecipeBookResult ─────────────────────────────────────────────────────

describe('buildRecipeBookResult', () => {
  it('handles empty file list', () => {
    const result = buildRecipeBookResult([], [], {})
    expect(result.recipes).toEqual([])
    expect(result.stats.totalRecipes).toBe(0)
  })

  it('analyzes single file', () => {
    const result = buildRecipeBookResult(['app.ts'], [IMPORT_CLASS_CONTENT], {})
    expect(result.stats.totalRecipes).toBeGreaterThan(0)
  })

  it('merges recipes across files', () => {
    const result = buildRecipeBookResult(MULTI_FILES, MULTI_CONTENTS, {})
    expect(result.stats.totalRecipes).toBeGreaterThan(0)
  })

  it('computes stats correctly', () => {
    const result = buildRecipeBookResult(['app.ts'], [IMPORT_CLASS_CONTENT], {})
    expect(result.stats.categoryDistribution).toBeDefined()
    expect(result.stats.difficultyDistribution).toBeDefined()
  })

  it('computes reusability for recipes', () => {
    const result = buildRecipeBookResult(MULTI_FILES, MULTI_CONTENTS, {})
    for (const recipe of result.recipes) {
      expect(recipe.reusability).toBeGreaterThanOrEqual(0)
      expect(recipe.reusability).toBeLessThanOrEqual(100)
    }
  })

  it('finds matches', () => {
    const result = buildRecipeBookResult(MULTI_FILES, MULTI_CONTENTS, {})
    expect(result.matches.length).toBeGreaterThan(0)
  })

  it('computes coverage', () => {
    const result = buildRecipeBookResult(MULTI_FILES, MULTI_CONTENTS, {})
    expect(result.stats.boilerplateCoverage).toBeGreaterThanOrEqual(0)
    expect(result.stats.idiomCoverage).toBeGreaterThanOrEqual(0)
  })

  it('computes overall complexity', () => {
    const result = buildRecipeBookResult(MULTI_FILES, MULTI_CONTENTS, {})
    expect(['simple', 'moderate', 'complex', 'gourmet']).toContain(result.stats.overallComplexity)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────────

describe('format helpers', () => {
  it('formatCategoryBadge returns badge', () => {
    expect(formatCategoryBadge('utility')).toContain('utility')
    expect(formatCategoryBadge('testing')).toContain('testing')
  })

  it('formatDifficultyLabel returns label', () => {
    expect(formatDifficultyLabel('easy')).toContain('easy')
    expect(formatDifficultyLabel('complex')).toContain('complex')
  })

  it('formatComplexityLabel returns label', () => {
    expect(formatComplexityLabel('gourmet')).toContain('gourmet')
  })

  it('formatReusabilityBar returns bar', () => {
    const bar = formatReusabilityBar(75)
    expect(bar).toContain('75')
  })

  it('formatRecipeCard renders card', () => {
    const recipe: Recipe = {
      id: 'r1', name: 'Test Recipe', category: 'utility', ingredients: [],
      servings: 3, difficulty: 'easy', prepTime: '5 min', instructions: [],
      files: ['a.ts'], isSignature: true, isFusion: false, reusability: 80,
    }
    const card = formatRecipeCard(recipe)
    expect(card).toContain('Test Recipe')
    expect(card).toContain('utility')
  })

  it('formatRecipeTable handles empty', () => {
    expect(formatRecipeTable([])).toContain('No recipes')
  })

  it('formatRecipeTable renders table', () => {
    const recipes: Recipe[] = [{
      id: 'r1', name: 'Test', category: 'utility', ingredients: [],
      servings: 2, difficulty: 'easy', prepTime: '5m', instructions: [],
      files: ['a.ts'], isSignature: false, isFusion: false, reusability: 70,
    }]
    const table = formatRecipeTable(recipes)
    expect(table).toContain('Test')
  })

  it('formatMatchTable handles empty', () => {
    expect(formatMatchTable([])).toContain('No recipe matches')
  })

  it('formatOpportunities handles empty', () => {
    expect(formatOpportunities([])).toContain('No abstraction')
  })

  it('formatOpportunities renders opportunities', () => {
    const opps = [{
      pattern: 'utility abstraction', files: ['a.ts', 'b.ts'],
      estimatedSaving: 20, difficulty: 'easy' as const,
      suggestedApproach: 'Extract shared module',
    }]
    const formatted = formatOpportunities(opps)
    expect(formatted).toContain('utility')
  })

  it('formatRecipeBookStats renders stats', () => {
    const stats: RecipeBookStats = {
      totalRecipes: 10, totalMatches: 25,
      categoryDistribution: { utility: 5, testing: 5 },
      difficultyDistribution: { easy: 8, moderate: 2 },
      avgReusability: 72, signatureCount: 3, fusionCount: 1,
      mostUsedRecipe: 'Utility Pattern', leastUsedRecipe: 'IO Pattern',
      boilerplateCoverage: 15, idiomCoverage: 20,
      abstractionOpportunities: 2, cookbookCompleteness: 80,
      overallComplexity: 'moderate',
    }
    const formatted = formatRecipeBookStats(stats)
    expect(formatted).toContain('10')
    expect(formatted).toContain('72')
  })

  it('formatRecipeBookRecommendations returns success for empty', () => {
    expect(formatRecipeBookRecommendations([])).toContain('well-organized')
  })

  it('formatRecipeBookRecommendations renders bullets', () => {
    const recs = formatRecipeBookRecommendations(['Document patterns', 'Extract utilities'])
    expect(recs).toContain('Document patterns')
  })

  it('formatRecipeBookJson returns valid JSON', () => {
    const result = buildRecipeBookResult([], [], {})
    const json = formatRecipeBookJson(result)
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('formatRecipeBookTable returns output', () => {
    const result = buildRecipeBookResult(['app.ts'], [IMPORT_CLASS_CONTENT], {})
    const output = formatRecipeBookTable(result, false)
    expect(output.length).toBeGreaterThan(0)
  })

  it('formatRecipeBookTable verbose shows cards', () => {
    const result = buildRecipeBookResult(['app.ts'], [IMPORT_CLASS_CONTENT], {})
    const output = formatRecipeBookTable(result, true)
    expect(output).toContain('📖')
  })
})
