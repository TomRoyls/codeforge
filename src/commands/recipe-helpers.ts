// ─── Types ─────────────────────────────────────────────────────────────────────

export type IngredientType = 'staple' | 'spice' | 'exotic' | 'fresh' | 'preserved' | 'expired'

export type ComplexityLevel = 'simple' | 'moderate' | 'complex' | 'masterful'

export type DishType = 'appetizer' | 'main-course' | 'side-dish' | 'dessert' | 'condiment'

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'

export interface Ingredient {
  name: string
  type: IngredientType
  source: string
  usage: number
  quality: number
}

export interface CookingStep {
  name: string
  complexity: ComplexityLevel
  technique: string
  duration: number
  seasoning: number
}

export interface Dish {
  name: string
  type: DishType
  presentation: number
  nutritionalValue: number
}

export interface Recipe {
  file: string
  name: string
  ingredients: Ingredient[]
  steps: CookingStep[]
  dishes: Dish[]
  servingSize: number
  preparationTime: number
  difficulty: DifficultyLevel
  balance: number
  overallRating: number
}

export interface RecipeBook {
  name: string
  recipes: Recipe[]
  cuisine: string
  avgRating: number
  specialty: string
}

export interface RecipeStats {
  totalRecipes: number
  avgRating: number
  beginnerCount: number
  expertCount: number
  mostPopular: string
  bestRated: string
  worstRated: string
  avgIngredients: number
  avgSteps: number
  expiredIngredients: number
  avgBalance: number
  cuisineCount: number
}

export interface RecipeResult {
  recipes: Recipe[]
  books: RecipeBook[]
  stats: RecipeStats
  recommendations: string[]
}

// ─── Import Extraction ─────────────────────────────────────────────────────────

/**
 * Extract raw import paths from content.
 *
 * @example
 * extractImportPaths('import { x } from "./foo"')
 */
export function extractImportPaths(content: string): string[] {
  const paths: string[] = []
  const patterns = [
    /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g,
    /import\s+['"]([^'"]+)['"]/g,
    /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  ]
  for (const pat of patterns) {
    let m: RegExpExecArray | null
    while ((m = pat.exec(content)) !== null) {
      paths.push(m[1])
    }
  }
  return [...new Set(paths)]
}

// ─── Ingredient Classification ─────────────────────────────────────────────────

/**
 * Classify an import path as an ingredient type.
 *
 * @example
 * classifyIngredient('fs', 'import fs from "fs"')
 */
export function classifyIngredient(importPath: string, content: string): IngredientType {
  const isRelative = importPath.startsWith('.')
  const isNodeBuiltin = ['fs', 'path', 'http', 'https', 'os', 'util', 'stream', 'events', 'crypto', 'child_process', 'node:fs', 'node:path', 'node:http', 'node:os', 'node:util', 'node:stream', 'node:events', 'node:crypto'].some(
    (b) => importPath === b || importPath.startsWith(b + '/'),
  )

  if (isNodeBuiltin) return 'staple'
  if (isRelative) return 'fresh'

  const usage = (content.match(new RegExp(escapeRegex(importPath), 'g')) || []).length
  if (usage > 3) return 'preserved'

  const exoticPackages = ['chalk', 'ora', 'oclif', 'typescript', 'vitest', 'eslint', 'prettier']
  if (exoticPackages.some((p) => importPath.startsWith(p))) return 'exotic'

  if (usage <= 1) return 'spice'
  return 'preserved'
}

/**
 * Compute ingredient quality (type safety of import).
 *
 * @example
 * computeIngredientQuality('import type { Foo } from "./bar"')
 */
export function computeIngredientQuality(importPath: string, content: string): number {
  const typeImportRegex = new RegExp(`import\\s+type\\s+.*?\\s+from\\s+['"]${escapeRegex(importPath)}['"]`)
  const defaultImportRegex = new RegExp(`import\\s+\\w+\\s+from\\s+['"]${escapeRegex(importPath)}['"]`)
  const namedImportRegex = new RegExp(`import\\s+\\{[^}]+\\}\\s+from\\s+['"]${escapeRegex(importPath)}['"]`)

  if (typeImportRegex.test(content)) return 95
  if (namedImportRegex.test(content)) return 80
  if (defaultImportRegex.test(content)) return 70
  return 50
}

// ─── Cooking Steps ─────────────────────────────────────────────────────────────

/**
 * Extract cooking steps (functions/methods) from content.
 *
 * @example
 * extractCookingSteps('function foo(x: number) { return x + 1 }')
 */
export function extractCookingSteps(content: string): CookingStep[] {
  const steps: CookingStep[] = []
  const funcPattern = /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\([^)]*\)\s*(?::\s*[^{]+)?\s*\{/g
  const methodPattern = /(?:public|private|protected)?\s*(?:async\s+)?(\w+)\s*\([^)]*\)\s*(?::\s*[^{]+)?\s*\{/g
  const arrowPattern = /(?:export\s+)?(?:const|let)\s+(\w+)\s*=\s*(?:\([^)]*\)|[^=])\s*(?::\s*[^=]+)?\s*=>\s*{/g

  const allPatterns = [funcPattern, methodPattern, arrowPattern]
  for (const pat of allPatterns) {
    let m: RegExpExecArray | null
    while ((m = pat.exec(content)) !== null) {
      const name = m[1]
      if (['if', 'for', 'while', 'switch', 'catch', 'constructor'].includes(name)) continue
      const funcBody = extractFunctionBody(content, m.index)
      const complexity = classifyComplexity(funcBody)
      const seasoning = computeSeasoning(funcBody)
      const technique = identifyTechnique(funcBody)
      steps.push({
        name,
        complexity,
        technique,
        duration: funcBody.split('\n').length,
        seasoning,
      })
    }
  }
  return steps
}

function extractFunctionBody(content: string, startIndex: number): string {
  let depth = 0
  let bodyStart = -1
  for (let i = startIndex; i < content.length; i++) {
    if (content[i] === '{') {
      if (depth === 0) bodyStart = i + 1
      depth++
    } else if (content[i] === '}') {
      depth--
      if (depth === 0 && bodyStart >= 0) {
        return content.substring(bodyStart, i)
      }
    }
  }
  return ''
}

/**
 * Classify complexity of a function body.
 *
 * @example
 * classifyComplexity('return x + 1')
 */
export function classifyComplexity(funcBody: string): ComplexityLevel {
  if (funcBody.length === 0) return 'simple'
  const lines = funcBody.split('\n').length
  const hasLoops = /for\s*\(|while\s*\(|\.forEach|\.map|\.filter|\.reduce/.test(funcBody)
  const hasConditionals = (funcBody.match(/if\s*\(/g) || []).length
  const hasNested = (funcBody.match(/{/g) || []).length > 2
  const hasAsync = /await\s+|Promise|\.then\(/.test(funcBody)

  let score = 0
  if (lines > 20) score += 3
  else if (lines > 10) score += 2
  else score += 1
  if (hasLoops) score += 1
  score += Math.min(3, hasConditionals)
  if (hasNested) score += 1
  if (hasAsync) score += 1

  if (score >= 7) return 'masterful'
  if (score >= 5) return 'complex'
  if (score >= 3) return 'moderate'
  return 'simple'
}

/**
 * Compute seasoning (documentation density).
 *
 * @example
 * computeSeasoning('return x + 1 // simple')
 */
export function computeSeasoning(funcBody: string): number {
  if (funcBody.length === 0) return 0
  const lines = funcBody.split('\n')
  const commentLines = lines.filter((l) => l.trim().startsWith('//') || l.trim().startsWith('*') || l.trim().startsWith('/**')).length
  return Math.min(100, Math.round((commentLines / lines.length) * 100))
}

function identifyTechnique(funcBody: string): string {
  if (/\.map\(|\.filter\(|\.reduce\(/.test(funcBody)) return 'Functional composition'
  if (/async\s|await\s/.test(funcBody)) return 'Async orchestration'
  if (/try\s*\{/.test(funcBody)) return 'Error handling'
  if (/switch\s*\(/.test(funcBody)) return 'Pattern matching'
  if (/for\s*\(/.test(funcBody)) return 'Iterative processing'
  if (/return\s/.test(funcBody)) return 'Direct computation'
  return 'Sequential execution'
}

// ─── Dish Extraction ────────────────────────────────────────────────────────────

/**
 * Extract export names from content.
 *
 * @example
 * extractExportNames('export function foo() {}')
 */
export function extractExportNames(content: string): string[] {
  const exports: string[] = []
  const patterns = [
    /export\s+(?:default\s+)?(?:function|class|const|let|var|interface|type|enum)\s+(\w+)/g,
    /export\s+\{([^}]+)\}/g,
  ]
  for (const pat of patterns) {
    let m: RegExpExecArray | null
    while ((m = pat.exec(content)) !== null) {
      if (pat.source.startsWith('export\\s+\\{')) {
        const names = m[1].split(',').map((n) => n.trim().split(/\s+as\s+/).pop()!.trim()).filter(Boolean)
        exports.push(...names)
      } else {
        exports.push(m[1])
      }
    }
  }
  return [...new Set(exports)]
}

/**
 * Classify a dish (export) type.
 *
 * @example
 * classifyDish('Foo', 'interface Foo {}', false)
 */
export function classifyDish(exportName: string, content: string, isTestFile: boolean): DishType {
  if (isTestFile) return 'dessert'
  const isType = new RegExp(`(?:interface|type)\\s+${escapeRegex(exportName)}`).test(content)
  const isConst = new RegExp(`export\\s+const\\s+${escapeRegex(exportName)}`).test(content)
  const isClass = new RegExp(`export\\s+class\\s+${escapeRegex(exportName)}`).test(content)
  const isFunction = new RegExp(`export\\s+function\\s+${escapeRegex(exportName)}`).test(content)
  const isConfig = /^(CONFIG|OPTIONS|DEFAULTS|SETTINGS|CONSTANTS|VERSION)/i.test(exportName)

  if (isType) return 'appetizer'
  if (isConfig || (isConst && !isFunction)) return 'condiment'
  if (isClass) return 'main-course'
  if (isFunction) return 'main-course'
  if (isConst) return 'side-dish'
  return 'side-dish'
}

/**
 * Compute presentation (JSDoc quality) for an export.
 *
 * @example
 * computePresentation('foo', '/** Docs *\\/ export function foo() {}')
 */
export function computePresentation(exportName: string, content: string): number {
  const escapedName = escapeRegex(exportName)
  const jsDocBeforeExport = new RegExp(`/\\*\\*[\\s\\S]*?\\*/\\s*export\\s+(?:function|class|const|interface|type)\\s+${escapedName}`)
  const hasJSDoc = jsDocBeforeExport.test(content)
  const hasInlineDoc = new RegExp(`//.*@param|//.*@returns|/\\*\\*[\\s\\S]*?@`).test(content)
  const hasDescription = new RegExp(`/\\*\\*[\\s\\S]*?\\*\\s+\\w+[\\s\\S]*?\\*/\\s*export[^;]*${escapedName}`).test(content)

  let score = 20
  if (hasJSDoc) score += 50
  if (hasDescription) score += 20
  if (hasInlineDoc) score += 10
  return Math.min(100, score)
}

/**
 * Compute nutritional value (type annotation quality) for an export.
 *
 * @example
 * computeNutritionalValue('foo', 'function foo(x: number): string {}')
 */
export function computeNutritionalValue(exportName: string, content: string): number {
  const escapedName = escapeRegex(exportName)
  const hasReturnType = new RegExp(`function\\s+${escapedName}\\s*\\([^)]*\\)\\s*:\\s*\\w`).test(content)
  const hasTypedParams = new RegExp(`function\\s+${escapedName}\\s*\\([^)]*:\\s*\\w`).test(content)
  const hasInterface = new RegExp(`interface\\s+${escapedName}`).test(content)
  const hasTypeAlias = new RegExp(`type\\s+${escapedName}\\s*=`).test(content)

  let score = 30
  if (hasReturnType) score += 25
  if (hasTypedParams) score += 25
  if (hasInterface || hasTypeAlias) score += 20
  return Math.min(100, score)
}

// ─── Recipe Metrics ────────────────────────────────────────────────────────────

/**
 * Compute recipe balance (good proportions).
 *
 * @example
 * computeBalance(recipe)
 */
export function computeBalance(recipe: { ingredients: Ingredient[]; steps: CookingStep[]; dishes: Dish[] }): number {
  const ingCount = recipe.ingredients.length
  const stepCount = recipe.steps.length
  const dishCount = recipe.dishes.length

  if (ingCount === 0 && stepCount === 0) return 0

  let score = 60
  if (ingCount >= 1 && ingCount <= 10) score += 15
  else if (ingCount > 10) score -= 5
  if (stepCount >= 1 && stepCount <= 15) score += 15
  else if (stepCount > 15) score -= 5
  if (dishCount >= 1 && dishCount <= 8) score += 10
  else if (dishCount > 8) score -= 5

  if (ingCount > 0 && stepCount > 0 && dishCount > 0) score += 5

  return Math.max(0, Math.min(100, score))
}

/**
 * Compute overall recipe rating.
 *
 * @example
 * computeOverallRating(recipe)
 */
export function computeOverallRating(recipe: { balance: number; ingredients: Ingredient[]; steps: CookingStep[]; dishes: Dish[] }): number {
  const avgIngredientQuality = recipe.ingredients.length > 0
    ? recipe.ingredients.reduce((s, i) => s + i.quality, 0) / recipe.ingredients.length
    : 50
  const avgSeasoning = recipe.steps.length > 0
    ? recipe.ingredients.reduce((s, _i) => s, 0) + recipe.steps.reduce((s, st) => s + st.seasoning, 0) / Math.max(1, recipe.steps.length)
    : 0
  const avgPresentation = recipe.dishes.length > 0
    ? recipe.dishes.reduce((s, d) => s + d.presentation, 0) / recipe.dishes.length
    : 50

  return Math.round(
    recipe.balance * 0.3 +
    avgIngredientQuality * 0.25 +
    Math.min(100, avgSeasoning) * 0.15 +
    avgPresentation * 0.15 +
    10,
  )
}

/**
 * Classify recipe difficulty.
 *
 * @example
 * classifyDifficulty(recipe)
 */
export function classifyDifficulty(recipe: { steps: CookingStep[]; ingredients: Ingredient[] }): DifficultyLevel {
  const complexSteps = recipe.steps.filter((s) => s.complexity === 'complex' || s.complexity === 'masterful').length
  const exoticIngredients = recipe.ingredients.filter((i) => i.type === 'exotic').length
  const totalComplexity = complexSteps * 2 + exoticIngredients

  if (totalComplexity >= 10) return 'expert'
  if (totalComplexity >= 5) return 'advanced'
  if (totalComplexity >= 2) return 'intermediate'
  return 'beginner'
}

// ─── Recipe Book ───────────────────────────────────────────────────────────────

/**
 * Get directory from file path.
 *
 * @example
 * getDirectory('src/commands/foo.ts')
 */
export function getDirectory(filePath: string): string {
  const lastSlash = filePath.lastIndexOf('/')
  return lastSlash >= 0 ? filePath.substring(0, lastSlash) : '.'
}

/**
 * Group recipes into books by directory.
 *
 * @example
 * groupIntoBooks(recipes, files)
 */
export function groupIntoBooks(recipes: Recipe[]): Map<string, Recipe[]> {
  const books = new Map<string, Recipe[]>()
  for (const recipe of recipes) {
    const dir = getDirectory(recipe.file)
    if (!books.has(dir)) books.set(dir, [])
    books.get(dir)!.push(recipe)
  }
  return books
}

/**
 * Identify dominant cuisine (coding style) of a book.
 *
 * @example
 * identifyCuisine(recipes)
 */
export function identifyCuisine(recipes: Recipe[]): string {
  if (recipes.length === 0) return 'Unknown'
  const techniques = recipes.flatMap((r) => r.steps.map((s) => s.technique))
  const counts = new Map<string, number>()
  for (const t of techniques) {
    counts.set(t, (counts.get(t) || 0) + 1)
  }
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1])
  return sorted[0]?.[0] ?? 'Sequential execution'
}

/**
 * Build a RecipeBook from recipes.
 *
 * @example
 * buildRecipeBook('src', recipes)
 */
export function buildRecipeBook(name: string, recipes: Recipe[]): RecipeBook {
  const avgRating = recipes.length > 0
    ? Math.round(recipes.reduce((s, r) => s + r.overallRating, 0) / recipes.length)
    : 0
  const best = recipes.reduce((a, b) => a.overallRating >= b.overallRating ? a : b, recipes[0])
  return {
    name,
    recipes,
    cuisine: identifyCuisine(recipes),
    avgRating,
    specialty: best?.file ?? 'none',
  }
}

// ─── Build Recipe ──────────────────────────────────────────────────────────────

/**
 * Build a single recipe from file data.
 *
 * @example
 * buildRecipe('mod.ts', content, importedBy, allFiles)
 */
export function buildRecipe(
  file: string,
  content: string,
  importedBy: string[],
  allFiles: string[],
): Recipe {
  const isTest = /\.(test|spec)\.[jt]sx?$/.test(file)
  const importPaths = extractImportPaths(content)
  const ingredients: Ingredient[] = importPaths.map((imp) => {
    const normalized = imp.startsWith('./') ? imp.slice(2) : imp
    const source = resolveImportToFileName(imp, allFiles)
    return {
      name: imp,
      type: classifyIngredient(imp, content),
      source,
      usage: (content.match(new RegExp(escapeRegex(normalized), 'g')) || []).length,
      quality: computeIngredientQuality(imp, content),
    }
  })

  const steps = extractCookingSteps(content)
  const exportNames = extractExportNames(content)
  const dishes: Dish[] = exportNames.map((exp) => ({
    name: exp,
    type: classifyDish(exp, content, isTest),
    presentation: computePresentation(exp, content),
    nutritionalValue: computeNutritionalValue(exp, content),
  }))

  const name = file.replace(/\.[jt]sx?$/, '')
  const lineCount = content.split('\n').length
  const servingSize = importedBy.length
  const preparationTime = Math.max(1, Math.round(lineCount / 50))

  const partialRecipe = { ingredients, steps, dishes }
  const balance = computeBalance(partialRecipe)
  const recipeWithBalance = { ...partialRecipe, balance }
  const overallRating = computeOverallRating(recipeWithBalance)
  const difficulty = classifyDifficulty(partialRecipe)

  return {
    file,
    name,
    ingredients,
    steps,
    dishes,
    servingSize,
    preparationTime,
    difficulty,
    balance,
    overallRating: Math.max(0, Math.min(100, overallRating)),
  }
}

function resolveImportToFileName(imp: string, allFiles: string[]): string {
  const normalized = imp.startsWith('./') ? imp.slice(2) : imp
  for (const candidate of [normalized, normalized + '.ts', normalized + '.js', normalized + '.tsx', normalized + '.jsx']) {
    if (allFiles.includes(candidate)) return candidate
  }
  return imp
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Generate recipe recommendations.
 *
 * @example
 * generateRecommendations(recipes, books, stats)
 */
export function generateRecommendations(
  recipes: Recipe[],
  books: RecipeBook[],
  stats: RecipeStats,
): string[] {
  const recs: string[] = []

  if (stats.expiredIngredients > 0) {
    recs.push(`${stats.expiredIngredients} expired ingredients found — update deprecated imports`)
  }

  const unbalanced = recipes.filter((r) => r.balance < 40)
  if (unbalanced.length > 0) {
    recs.push(`${unbalanced.length} unbalanced recipes — adjust ingredient-to-step proportions: ${unbalanced.slice(0, 3).map((r) => r.file).join(', ')}`)
  }

  const poorPresentation = recipes.filter((r) => r.dishes.some((d) => d.presentation < 30))
  if (poorPresentation.length > 0) {
    recs.push(`${poorPresentation.length} recipes with poor presentation — add JSDoc documentation`)
  }

  const expertRecipes = recipes.filter((r) => r.difficulty === 'expert')
  if (expertRecipes.length > 0) {
    recs.push(`${expertRecipes.length} expert-level recipes — consider simplifying: ${expertRecipes.slice(0, 2).map((r) => r.file).join(', ')}`)
  }

  const lowNutrition = recipes.filter((r) => r.dishes.some((d) => d.nutritionalValue < 30))
  if (lowNutrition.length > 0) {
    recs.push(`${lowNutrition.length} recipes with low nutritional value — add type annotations`)
  }

  if (stats.avgRating > 70) {
    recs.push(`Average rating is ${stats.avgRating}% — well-crafted codebase recipes`)
  }

  if (recs.length === 0) {
    recs.push('All recipes are well-balanced with quality ingredients and good presentation')
  }

  return recs
}

// ─── Build Result ──────────────────────────────────────────────────────────────

/**
 * Build complete recipe result.
 *
 * @example
 * buildRecipeResult(['a.ts'], ['code'], {})
 */
export function buildRecipeResult(
  files: string[],
  contents: string[],
  options: Record<string, unknown>,
): RecipeResult {
  if (files.length === 0) {
    const emptyStats: RecipeStats = {
      totalRecipes: 0, avgRating: 0, beginnerCount: 0, expertCount: 0,
      mostPopular: 'none', bestRated: 'none', worstRated: 'none',
      avgIngredients: 0, avgSteps: 0, expiredIngredients: 0,
      avgBalance: 0, cuisineCount: 0,
    }
    return { recipes: [], books: [], stats: emptyStats, recommendations: ['No files to analyze'] }
  }

  const importedBy = new Map<string, string[]>()
  for (const file of files) importedBy.set(file, [])

  for (const file of files) {
    const idx = files.indexOf(file)
    const content = contents[idx] ?? ''
    const imports = extractImportPaths(content)
    for (const imp of imports) {
      const normalized = imp.startsWith('./') ? imp.slice(2) : imp
      for (const candidate of [imp, normalized, imp + '.ts', imp + '.js', normalized + '.ts', normalized + '.js']) {
        if (files.includes(candidate)) {
          const list = importedBy.get(candidate)
          if (list && !list.includes(file)) list.push(file)
          break
        }
      }
    }
  }

  const recipes = files.map((file, i) => {
    const content = contents[i] ?? ''
    const deps = importedBy.get(file) ?? []
    return buildRecipe(file, content, deps, files)
  })

  const bookMap = groupIntoBooks(recipes)
  const books = Array.from(bookMap.entries()).map(([name, recs]) => buildRecipeBook(name, recs))

  const totalRecipes = recipes.length
  const avgRating = totalRecipes > 0 ? Math.round(recipes.reduce((s, r) => s + r.overallRating, 0) / totalRecipes) : 0
  const beginnerCount = recipes.filter((r) => r.difficulty === 'beginner').length
  const expertCount = recipes.filter((r) => r.difficulty === 'expert' || r.difficulty === 'advanced').length
  const mostPopular = recipes.reduce((a, b) => a.servingSize >= b.servingSize ? a : b, recipes[0])
  const bestRated = recipes.reduce((a, b) => a.overallRating >= b.overallRating ? a : b, recipes[0])
  const worstRated = recipes.reduce((a, b) => a.overallRating <= b.overallRating ? a : b, recipes[0])
  const avgIngredients = totalRecipes > 0 ? Math.round(recipes.reduce((s, r) => s + r.ingredients.length, 0) / totalRecipes * 10) / 10 : 0
  const avgSteps = totalRecipes > 0 ? Math.round(recipes.reduce((s, r) => s + r.steps.length, 0) / totalRecipes * 10) / 10 : 0
  const expiredIngredients = recipes.reduce((s, r) => s + r.ingredients.filter((i) => i.type === 'expired').length, 0)
  const avgBalance = totalRecipes > 0 ? Math.round(recipes.reduce((s, r) => s + r.balance, 0) / totalRecipes) : 0
  const cuisineCount = new Set(books.map((b) => b.cuisine)).size

  const stats: RecipeStats = {
    totalRecipes,
    avgRating,
    beginnerCount,
    expertCount,
    mostPopular: mostPopular?.file ?? 'none',
    bestRated: bestRated?.file ?? 'none',
    worstRated: worstRated?.file ?? 'none',
    avgIngredients,
    avgSteps,
    expiredIngredients,
    avgBalance,
    cuisineCount,
  }

  const recommendations = generateRecommendations(recipes, books, stats)

  return { recipes, books, stats, recommendations }
}

// ─── Utilities ─────────────────────────────────────────────────────────────────

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
