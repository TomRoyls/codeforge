import { describe, expect, it } from 'vitest'

import {
  buildRecipe,
  buildRecipeBook,
  buildRecipeResult,
  classifyComplexity,
  classifyDifficulty,
  classifyDish,
  classifyIngredient,
  computeBalance,
  computeIngredientQuality,
  computeNutritionalValue,
  computeOverallRating,
  computePresentation,
  computeSeasoning,
  extractCookingSteps,
  extractExportNames,
  extractImportPaths,
  generateRecommendations,
  getDirectory,
  groupIntoBooks,
  identifyCuisine,
  type CookingStep,
  type Dish,
  type Ingredient,
  type Recipe,
  type RecipeStats,
} from '../src/commands/recipe-helpers.js'

import {
  formatRecipeCard,
  formatRecipeJSON,
  formatRecipeStats,
  formatRecipeTable,
  formatRecipeBookOverview,
  formatRecommendations,
} from '../src/commands/recipe-format-helpers.js'

// ─── extractImportPaths ─────────────────────────────────────────────────────────

describe('extractImportPaths', () => {
  it('extracts ES module imports', () => {
    expect(extractImportPaths('import { x } from "./foo"')).toContain('./foo')
  })

  it('extracts default imports', () => {
    expect(extractImportPaths('import foo from "bar"')).toContain('bar')
  })

  it('extracts side-effect imports', () => {
    expect(extractImportPaths('import "./setup"')).toContain('./setup')
  })

  it('extracts require calls', () => {
    expect(extractImportPaths('const x = require("./mod")')).toContain('./mod')
  })

  it('deduplicates', () => {
    const paths = extractImportPaths('import { a } from "./x"\nimport { b } from "./x"')
    expect(paths.filter((p) => p === './x')).toHaveLength(1)
  })

  it('returns empty for no imports', () => {
    expect(extractImportPaths('const x = 1')).toEqual([])
  })
})

// ─── classifyIngredient ─────────────────────────────────────────────────────────

describe('classifyIngredient', () => {
  it('classifies node builtins as staple', () => {
    expect(classifyIngredient('fs', 'import fs from "fs"')).toBe('staple')
  })

  it('classifies relative imports as fresh', () => {
    expect(classifyIngredient('./foo', 'import { x } from "./foo"')).toBe('fresh')
  })

  it('classifies common packages as exotic', () => {
    expect(classifyIngredient('chalk', 'import chalk from "chalk"')).toBe('exotic')
  })

  it('classifies rarely used as spice', () => {
    expect(classifyIngredient('some-random-pkg', 'import x from "some-random-pkg"')).toBe('spice')
  })
})

// ─── computeIngredientQuality ───────────────────────────────────────────────────

describe('computeIngredientQuality', () => {
  it('gives high score for type imports', () => {
    const content = 'import type { Foo } from "./bar"'
    expect(computeIngredientQuality('./bar', content)).toBe(95)
  })

  it('gives good score for named imports', () => {
    const content = 'import { Foo } from "./bar"'
    expect(computeIngredientQuality('./bar', content)).toBe(80)
  })

  it('gives moderate score for default imports', () => {
    const content = 'import bar from "./bar"'
    expect(computeIngredientQuality('./bar', content)).toBe(70)
  })

  it('gives base score otherwise', () => {
    expect(computeIngredientQuality('./unknown', 'const x = 1')).toBe(50)
  })
})

// ─── extractCookingSteps ────────────────────────────────────────────────────────

describe('extractCookingSteps', () => {
  it('extracts functions', () => {
    const steps = extractCookingSteps('function foo() { return 1 }')
    expect(steps.some((s) => s.name === 'foo')).toBe(true)
  })

  it('extracts exported functions', () => {
    const steps = extractCookingSteps('export function bar() { return 2 }')
    expect(steps.some((s) => s.name === 'bar')).toBe(true)
  })

  it('extracts async functions', () => {
    const steps = extractCookingSteps('async function run() { await work() }')
    expect(steps.some((s) => s.name === 'run')).toBe(true)
  })

  it('skips control flow keywords', () => {
    const steps = extractCookingSteps('if (x) { foo() }')
    expect(steps.every((s) => s.name !== 'if')).toBe(true)
  })

  it('returns empty for no functions', () => {
    expect(extractCookingSteps('const x = 1')).toHaveLength(0)
  })
})

// ─── classifyComplexity ─────────────────────────────────────────────────────────

describe('classifyComplexity', () => {
  it('classifies simple code', () => {
    expect(classifyComplexity('return 1')).toBe('simple')
  })

  it('classifies empty as simple', () => {
    expect(classifyComplexity('')).toBe('simple')
  })

  it('classifies complex code', () => {
    const complex = Array.from({ length: 30 }, (_, i) => `if (x${i}) { y${i}++ }`).join('\n')
    expect(classifyComplexity(complex)).toMatch(/complex|masterful/)
  })
})

// ─── computeSeasoning ───────────────────────────────────────────────────────────

describe('computeSeasoning', () => {
  it('returns 0 for empty', () => {
    expect(computeSeasoning('')).toBe(0)
  })

  it('counts comment lines', () => {
    const body = '// comment\nconst x = 1\n// another'
    expect(computeSeasoning(body)).toBeGreaterThan(0)
  })

  it('returns 0 with no comments', () => {
    expect(computeSeasoning('const x = 1\nreturn x')).toBe(0)
  })
})

// ─── extractExportNames ─────────────────────────────────────────────────────────

describe('extractExportNames', () => {
  it('extracts function exports', () => {
    expect(extractExportNames('export function foo() {}')).toContain('foo')
  })

  it('extracts const exports', () => {
    expect(extractExportNames('export const x = 1')).toContain('x')
  })

  it('extracts class exports', () => {
    expect(extractExportNames('export class Foo {}')).toContain('Foo')
  })

  it('extracts interface exports', () => {
    expect(extractExportNames('export interface Foo {}')).toContain('Foo')
  })

  it('extracts destructured exports', () => {
    const exports = extractExportNames('export { foo, bar }')
    expect(exports).toContain('foo')
    expect(exports).toContain('bar')
  })

  it('returns empty for no exports', () => {
    expect(extractExportNames('const x = 1')).toEqual([])
  })
})

// ─── classifyDish ───────────────────────────────────────────────────────────────

describe('classifyDish', () => {
  it('classifies interfaces as appetizer', () => {
    expect(classifyDish('Foo', 'interface Foo {}', false)).toBe('appetizer')
  })

  it('classifies functions as main-course', () => {
    expect(classifyDish('run', 'export function run() {}', false)).toBe('main-course')
  })

  it('classifies classes as main-course', () => {
    expect(classifyDish('App', 'export class App {}', false)).toBe('main-course')
  })

  it('classifies config constants as condiment', () => {
    expect(classifyDish('CONFIG', 'export const CONFIG = {}', false)).toBe('condiment')
  })

  it('classifies test file exports as dessert', () => {
    expect(classifyDish('foo', 'export function foo() {}', true)).toBe('dessert')
  })

  it('classifies other consts as condiment', () => {
    expect(classifyDish('VERSION', 'export const VERSION = "1.0"', false)).toBe('condiment')
  })
})

// ─── computePresentation ────────────────────────────────────────────────────────

describe('computePresentation', () => {
  it('gives base score without docs', () => {
    expect(computePresentation('foo', 'export function foo() {}')).toBe(20)
  })

  it('rewards JSDoc', () => {
    const content = '/** Documentation */\nexport function foo() {}'
    expect(computePresentation('foo', content)).toBeGreaterThan(20)
  })

  it('caps at 100', () => {
    const content = '/** Full docs with @param and @returns */\nexport function foo() {}'
    expect(computePresentation('foo', content)).toBeLessThanOrEqual(100)
  })
})

// ─── computeNutritionalValue ────────────────────────────────────────────────────

describe('computeNutritionalValue', () => {
  it('gives base score without types', () => {
    expect(computeNutritionalValue('foo', 'function foo() {}')).toBe(30)
  })

  it('rewards return types', () => {
    expect(computeNutritionalValue('foo', 'function foo(): string {}')).toBeGreaterThan(30)
  })

  it('rewards typed params', () => {
    expect(computeNutritionalValue('foo', 'function foo(x: number) {}')).toBeGreaterThan(30)
  })

  it('rewards interfaces', () => {
    expect(computeNutritionalValue('Foo', 'interface Foo {}')).toBeGreaterThan(30)
  })
})

// ─── computeBalance ─────────────────────────────────────────────────────────────

describe('computeBalance', () => {
  it('returns 0 for empty recipe', () => {
    expect(computeBalance({ ingredients: [], steps: [], dishes: [] })).toBe(0)
  })

  it('rewards moderate counts', () => {
    const recipe = {
      ingredients: Array.from({ length: 3 }, (_, i): Ingredient => ({ name: `./${i}`, type: 'fresh' as const, source: '', usage: 1, quality: 80 })),
      steps: Array.from({ length: 5 }, (_, i): CookingStep => ({ name: `step${i}`, complexity: 'simple' as const, technique: 'Direct computation', duration: 5, seasoning: 20 })),
      dishes: Array.from({ length: 3 }, (_, i): Dish => ({ name: `dish${i}`, type: 'main-course' as const, presentation: 50, nutritionalValue: 60 })),
    }
    expect(computeBalance(recipe)).toBeGreaterThan(50)
  })

  it('penalizes excessive ingredients', () => {
    const recipe = {
      ingredients: Array.from({ length: 20 }, (_, i): Ingredient => ({ name: `./${i}`, type: 'fresh' as const, source: '', usage: 1, quality: 80 })),
      steps: [],
      dishes: [],
    }
    expect(computeBalance(recipe)).toBeLessThan(70)
  })
})

// ─── classifyDifficulty ─────────────────────────────────────────────────────────

describe('classifyDifficulty', () => {
  it('classifies simple recipes as beginner', () => {
    expect(classifyDifficulty({ steps: [], ingredients: [] })).toBe('beginner')
  })

  it('classifies complex recipes as advanced', () => {
    const steps: CookingStep[] = Array.from({ length: 5 }, () => ({
      name: 'step', complexity: 'masterful' as const, technique: 'Async orchestration', duration: 30, seasoning: 10,
    }))
    const ingredients: Ingredient[] = Array.from({ length: 5 }, () => ({
      name: 'pkg', type: 'exotic' as const, source: '', usage: 1, quality: 70,
    }))
    expect(classifyDifficulty({ steps, ingredients })).toMatch(/advanced|expert/)
  })
})

// ─── getDirectory ───────────────────────────────────────────────────────────────

describe('getDirectory', () => {
  it('extracts directory', () => {
    expect(getDirectory('src/commands/foo.ts')).toBe('src/commands')
  })

  it('returns dot for no directory', () => {
    expect(getDirectory('foo.ts')).toBe('.')
  })
})

// ─── groupIntoBooks ─────────────────────────────────────────────────────────────

describe('groupIntoBooks', () => {
  it('groups by directory', () => {
    const recipes: Recipe[] = [
      { file: 'src/a.ts', name: 'a', ingredients: [], steps: [], dishes: [], servingSize: 0, preparationTime: 1, difficulty: 'beginner', balance: 50, overallRating: 60 },
      { file: 'src/b.ts', name: 'b', ingredients: [], steps: [], dishes: [], servingSize: 0, preparationTime: 1, difficulty: 'beginner', balance: 50, overallRating: 70 },
      { file: 'test/c.ts', name: 'c', ingredients: [], steps: [], dishes: [], servingSize: 0, preparationTime: 1, difficulty: 'beginner', balance: 50, overallRating: 80 },
    ]
    const books = groupIntoBooks(recipes)
    expect(books.get('src')?.length).toBe(2)
    expect(books.get('test')?.length).toBe(1)
  })

  it('returns empty map for no recipes', () => {
    expect(groupIntoBooks([]).size).toBe(0)
  })
})

// ─── identifyCuisine ────────────────────────────────────────────────────────────

describe('identifyCuisine', () => {
  it('returns Unknown for empty', () => {
    expect(identifyCuisine([])).toBe('Unknown')
  })

  it('returns dominant technique', () => {
    const recipes: Recipe[] = [
      { file: 'a.ts', name: 'a', ingredients: [], steps: [{ name: 'run', complexity: 'simple', technique: 'Functional composition', duration: 5, seasoning: 0 }], dishes: [], servingSize: 0, preparationTime: 1, difficulty: 'beginner', balance: 50, overallRating: 60 },
      { file: 'b.ts', name: 'b', ingredients: [], steps: [{ name: 'run', complexity: 'simple', technique: 'Functional composition', duration: 5, seasoning: 0 }], dishes: [], servingSize: 0, preparationTime: 1, difficulty: 'beginner', balance: 50, overallRating: 60 },
    ]
    expect(identifyCuisine(recipes)).toBe('Functional composition')
  })
})

// ─── buildRecipeBook ────────────────────────────────────────────────────────────

describe('buildRecipeBook', () => {
  it('builds book from recipes', () => {
    const recipes: Recipe[] = [
      { file: 'src/a.ts', name: 'a', ingredients: [], steps: [], dishes: [], servingSize: 0, preparationTime: 1, difficulty: 'beginner', balance: 50, overallRating: 80 },
      { file: 'src/b.ts', name: 'b', ingredients: [], steps: [], dishes: [], servingSize: 0, preparationTime: 1, difficulty: 'beginner', balance: 50, overallRating: 60 },
    ]
    const book = buildRecipeBook('src', recipes)
    expect(book.name).toBe('src')
    expect(book.avgRating).toBe(70)
    expect(book.specialty).toBe('src/a.ts')
  })
})

// ─── buildRecipe ────────────────────────────────────────────────────────────────

describe('buildRecipe', () => {
  it('builds a recipe from file data', () => {
    const recipe = buildRecipe('mod.ts', 'export function foo() { return 1 }', [], [])
    expect(recipe.file).toBe('mod.ts')
    expect(recipe.dishes.length).toBeGreaterThan(0)
    expect(recipe.steps.length).toBeGreaterThan(0)
  })

  it('computes preparation time from lines', () => {
    const content = Array.from({ length: 100 }, () => 'const x = 1').join('\n')
    const recipe = buildRecipe('big.ts', content, [], [])
    expect(recipe.preparationTime).toBe(2)
  })

  it('sets serving size from importedBy', () => {
    const recipe = buildRecipe('mod.ts', 'export const x = 1', ['a.ts', 'b.ts'], [])
    expect(recipe.servingSize).toBe(2)
  })
})

// ─── generateRecommendations ────────────────────────────────────────────────────

describe('generateRecommendations', () => {
  const baseStats: RecipeStats = {
    totalRecipes: 5, avgRating: 65, beginnerCount: 3, expertCount: 1,
    mostPopular: 'main.ts', bestRated: 'util.ts', worstRated: 'bad.ts',
    avgIngredients: 3, avgSteps: 5, expiredIngredients: 0,
    avgBalance: 60, cuisineCount: 2,
  }

  it('warns about expired ingredients', () => {
    const stats = { ...baseStats, expiredIngredients: 3 }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some((r) => r.includes('expired'))).toBe(true)
  })

  it('warns about unbalanced recipes', () => {
    const recipes: Recipe[] = [
      { file: 'bad.ts', name: 'bad', ingredients: [], steps: [], dishes: [], servingSize: 0, preparationTime: 1, difficulty: 'beginner', balance: 20, overallRating: 30 },
    ]
    const recs = generateRecommendations(recipes, [], baseStats)
    expect(recs.some((r) => r.includes('unbalanced'))).toBe(true)
  })

  it('warns about poor presentation', () => {
    const recipes: Recipe[] = [
      { file: 'ugly.ts', name: 'ugly', ingredients: [], steps: [], dishes: [{ name: 'fn', type: 'main-course', presentation: 10, nutritionalValue: 50 }], servingSize: 0, preparationTime: 1, difficulty: 'beginner', balance: 50, overallRating: 40 },
    ]
    const recs = generateRecommendations(recipes, [], baseStats)
    expect(recs.some((r) => r.includes('presentation') || r.includes('JSDoc'))).toBe(true)
  })

  it('warns about expert recipes', () => {
    const recipes: Recipe[] = [
      { file: 'complex.ts', name: 'complex', ingredients: [], steps: [], dishes: [], servingSize: 0, preparationTime: 1, difficulty: 'expert', balance: 50, overallRating: 50 },
    ]
    const recs = generateRecommendations(recipes, [], baseStats)
    expect(recs.some((r) => r.includes('expert') || r.includes('simplify'))).toBe(true)
  })

  it('warns about low nutrition', () => {
    const recipes: Recipe[] = [
      { file: 'untyped.ts', name: 'untyped', ingredients: [], steps: [], dishes: [{ name: 'fn', type: 'main-course', presentation: 50, nutritionalValue: 20 }], servingSize: 0, preparationTime: 1, difficulty: 'beginner', balance: 50, overallRating: 40 },
    ]
    const recs = generateRecommendations(recipes, [], baseStats)
    expect(recs.some((r) => r.includes('nutritional') || r.includes('type'))).toBe(true)
  })

  it('praises high rating', () => {
    const stats = { ...baseStats, avgRating: 75 }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some((r) => r.includes('rating') || r.includes('crafted'))).toBe(true)
  })

  it('returns default when all is good', () => {
    const recs = generateRecommendations([], [], baseStats)
    expect(recs.length).toBeGreaterThan(0)
  })
})

// ─── buildRecipeResult ──────────────────────────────────────────────────────────

describe('buildRecipeResult', () => {
  it('handles empty files', () => {
    const result = buildRecipeResult([], [], {})
    expect(result.recipes).toHaveLength(0)
    expect(result.stats.totalRecipes).toBe(0)
  })

  it('creates recipes from files', () => {
    const result = buildRecipeResult(
      ['a.ts', 'b.ts'],
      ['export function foo() { return 1 }', 'export const x = 1'],
      {},
    )
    expect(result.recipes).toHaveLength(2)
  })

  it('builds books from directories', () => {
    const result = buildRecipeResult(
      ['src/a.ts', 'test/b.test.ts'],
      ['export const a = 1', 'import { a } from "../src/a"'],
      {},
    )
    expect(result.books.length).toBeGreaterThanOrEqual(2)
  })

  it('computes stats', () => {
    const result = buildRecipeResult(
      ['a.ts'],
      ['export function foo(): number { return 1 }'],
      {},
    )
    expect(result.stats.totalRecipes).toBe(1)
    expect(result.stats.avgRating).toBeGreaterThan(0)
    expect(result.stats.bestRated).toBe('a.ts')
  })

  it('generates recommendations', () => {
    const result = buildRecipeResult(['a.ts'], ['export const x = 1'], {})
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})

// ─── Format Helpers ─────────────────────────────────────────────────────────────

describe('formatRecipeCard', () => {
  it('formats a recipe card', () => {
    const recipe: Recipe = {
      file: 'mod.ts', name: 'mod', ingredients: [], steps: [], dishes: [],
      servingSize: 3, preparationTime: 1, difficulty: 'intermediate', balance: 70, overallRating: 75,
    }
    const output = formatRecipeCard(recipe)
    expect(output).toContain('mod')
    expect(output).toContain('intermediate')
  })
})

describe('formatRecipeBookOverview', () => {
  it('shows no books message', () => {
    expect(formatRecipeBookOverview([])).toContain('No recipe books')
  })

  it('formats book details', () => {
    const books = [{ name: 'src', recipes: [] as Recipe[], cuisine: 'Functional', avgRating: 80, specialty: 'main.ts' }]
    const output = formatRecipeBookOverview(books)
    expect(output).toContain('src')
  })
})

describe('formatRecipeStats', () => {
  it('formats stats', () => {
    const stats: RecipeStats = {
      totalRecipes: 10, avgRating: 70, beginnerCount: 5, expertCount: 2,
      mostPopular: 'main.ts', bestRated: 'util.ts', worstRated: 'bad.ts',
      avgIngredients: 3, avgSteps: 5, expiredIngredients: 1,
      avgBalance: 65, cuisineCount: 3,
    }
    const output = formatRecipeStats(stats)
    expect(output).toContain('10')
    expect(output).toContain('70%')
  })
})

describe('formatRecommendations', () => {
  it('shows no recommendations', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('numbers recommendations', () => {
    const output = formatRecommendations(['Fix this', 'Add that'])
    expect(output).toContain('1.')
    expect(output).toContain('2.')
  })
})

describe('formatRecipeTable', () => {
  it('formats full result', () => {
    const result = buildRecipeResult(['a.ts'], ['export function foo() { return 1 }'], {})
    const output = formatRecipeTable(result)
    expect(output).toContain('Recipe Analysis')
  })
})

describe('formatRecipeJSON', () => {
  it('formats as valid JSON', () => {
    const result = buildRecipeResult(['a.ts'], ['export const x = 1'], {})
    const output = formatRecipeJSON(result)
    const parsed = JSON.parse(output)
    expect(parsed.stats.totalRecipes).toBe(1)
  })
})
