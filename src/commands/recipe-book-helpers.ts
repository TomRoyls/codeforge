// ─── Interfaces ───────────────────────────────────────────

export type RecipeCategory =
  | 'boilerplate'
  | 'idiom'
  | 'pattern'
  | 'algorithm'
  | 'utility'
  | 'error-handling'
  | 'validation'
  | 'io'
  | 'configuration'
  | 'testing'

export type Difficulty = 'trivial' | 'easy' | 'moderate' | 'complex' | 'expert'

export type OverallComplexity = 'simple' | 'moderate' | 'complex' | 'gourmet'

export type IngredientType =
  | 'keyword'
  | 'function'
  | 'class'
  | 'import'
  | 'type'
  | 'operator'
  | 'literal'
  | 'comment-style'
  | 'decorator'
  | 'control-flow'

export interface Ingredient {
  type: IngredientType
  value: string
  frequency: number
  isCore: boolean
}

export interface Recipe {
  id: string
  name: string
  category: RecipeCategory
  ingredients: Ingredient[]
  servings: number
  difficulty: Difficulty
  prepTime: string
  instructions: string[]
  files: string[]
  isSignature: boolean
  isFusion: boolean
  reusability: number
}

export interface RecipeMatch {
  file: string
  recipeId: string
  confidence: number
  variations: string[]
  lineStart: number
  lineEnd: number
}

export interface AbstractionOpportunity {
  pattern: string
  files: string[]
  estimatedSaving: number
  difficulty: 'trivial' | 'easy' | 'moderate'
  suggestedApproach: string
}

export interface RecipeBookStats {
  totalRecipes: number
  totalMatches: number
  categoryDistribution: Record<string, number>
  difficultyDistribution: Record<string, number>
  avgReusability: number
  signatureCount: number
  fusionCount: number
  mostUsedRecipe: string
  leastUsedRecipe: string
  boilerplateCoverage: number
  idiomCoverage: number
  abstractionOpportunities: number
  cookbookCompleteness: number
  overallComplexity: OverallComplexity
}

export interface RecipeBookResult {
  recipes: Recipe[]
  matches: RecipeMatch[]
  stats: RecipeBookStats
  opportunities: AbstractionOpportunity[]
  recommendations: string[]
}

export interface RecipeBookOptions {
  verbose?: boolean
  format?: string
  output?: string
  ignore?: string[]
  ext?: string
}

// ─── Ingredient Extraction ───────────────────────────────

/**
 * Extract code ingredients from content.
 *
 * @example
 * extractIngredients('import { x } from "y"') // => [Ingredient]
 */
export function extractIngredients(content: string): Ingredient[] {
  const ingredients: Ingredient[] = []
  const map = new Map<string, Ingredient>()

  const addIngredient = (type: IngredientType, value: string, isCore: boolean) => {
    const key = `${type}:${value}`
    const existing = map.get(key)
    if (existing) {
      existing.frequency++
    } else {
      const ing: Ingredient = { type, value, frequency: 1, isCore }
      map.set(key, ing)
      ingredients.push(ing)
    }
  }

  const lines = content.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.length === 0) continue

    const importMatch = trimmed.match(/^import\s+.*?from\s+['"](.+?)['"]/);
    if (importMatch) {
      addIngredient('import', importMatch[1], true)
    }

    if (/\bclass\s+(\w+)/.test(trimmed)) {
      const cls = trimmed.match(/\bclass\s+(\w+)/)!
      addIngredient('class', cls[1], true)
    }

    if (/\bfunction\s+(\w+)/.test(trimmed)) {
      const fn = trimmed.match(/\bfunction\s+(\w+)/)!
      addIngredient('function', fn[1], true)
    }

    if (/\b(const|let|var)\s+(\w+)/.test(trimmed)) {
      const v = trimmed.match(/\b(const|let|var)\s+(\w+)/)!
      addIngredient('keyword', v[1], false)
    }

    if (/\bif\b/.test(trimmed)) addIngredient('control-flow', 'if', false)
    if (/\bfor\b/.test(trimmed)) addIngredient('control-flow', 'for', false)
    if (/\bwhile\b/.test(trimmed)) addIngredient('control-flow', 'while', false)
    if (/\bswitch\b/.test(trimmed)) addIngredient('control-flow', 'switch', false)
    if (/\btry\b/.test(trimmed)) addIngredient('control-flow', 'try', false)
    if (/\bcatch\b/.test(trimmed)) addIngredient('control-flow', 'catch', false)

    if (/^\s*\/\//.test(trimmed)) addIngredient('comment-style', '//', false)
    if (/^\s*\/\*/.test(trimmed)) addIngredient('comment-style', '/*', false)

    if (/===/.test(trimmed)) addIngredient('operator', '===', false)
    if (/!==/.test(trimmed)) addIngredient('operator', '!==', false)
    if (/&&/.test(trimmed)) addIngredient('operator', '&&', false)
    if (/\|\|/.test(trimmed)) addIngredient('operator', '||', false)

    const typeAnnotations = trimmed.match(/:\s*([A-Za-z]\w+)/g)
    if (typeAnnotations) {
      for (const ta of typeAnnotations) {
        const typeName = ta.replace(/^:\s*/, '')
        if (!['if', 'for', 'while', 'switch', 'try', 'catch', 'else', 'return', 'throw', 'new', 'const', 'let', 'var', 'function', 'class'].includes(typeName)) {
          addIngredient('type', typeName, false)
        }
      }
    }

    const stringLiterals = trimmed.match(/['"][^'"]{3,}['"]/g)
    if (stringLiterals) {
      for (const sl of stringLiterals) {
        addIngredient('literal', sl, false)
      }
    }

    if (trimmed.startsWith('@')) {
      const decorator = trimmed.match(/^@(\w+)/)
      if (decorator) addIngredient('decorator', decorator[1], false)
    }
  }

  return ingredients
}

// ─── Recipe Detection ────────────────────────────────────

/**
 * Detect recipes from ingredients and content.
 *
 * @example
 * detectRecipes(ingredients, content, 'app.ts') // => [Recipe]
 */
export function detectRecipes(ingredients: Ingredient[], content: string, filePath: string): Recipe[] {
  const recipes: Recipe[] = []
  const lines = content.split('\n')
  let recipeCounter = 0

  const makeId = () => `recipe-${++recipeCounter}`

  const hasIngredient = (type: IngredientType, value?: string) =>
    ingredients.some(i => i.type === type && (value === undefined || i.value === value))

  const countIngredient = (type: IngredientType) =>
    ingredients.filter(i => i.type === type).reduce((s, i) => s + i.frequency, 0)

  if (hasIngredient('import') && hasIngredient('control-flow', 'try') && hasIngredient('control-flow', 'catch')) {
    recipes.push(buildRecipe(makeId(), 'Error Boundary Pattern', 'error-handling', ingredients, filePath, 'moderate', '1 hour'))
  }

  if (hasIngredient('import') && hasIngredient('class')) {
    recipes.push(buildRecipe(makeId(), 'Module Class Pattern', 'boilerplate', ingredients, filePath, 'trivial', '10 minutes'))
  }

  if (hasIngredient('function') && hasIngredient('control-flow', 'if') && countIngredient('control-flow') >= 3) {
    recipes.push(buildRecipe(makeId(), 'Guard Clause Pattern', 'validation', ingredients, filePath, 'easy', '15 minutes'))
  }

  if (hasIngredient('import') && hasIngredient('function') && !hasIngredient('class')) {
    recipes.push(buildRecipe(makeId(), 'Utility Function Pattern', 'utility', ingredients, filePath, 'easy', '20 minutes'))
  }

  const forLoops = countIngredient('control-flow') > 0 && hasIngredient('control-flow', 'for')
  const arrayOps = (content.match(/\.(map|filter|reduce|forEach|find|some|every)\(/g) ?? []).length
  if (arrayOps >= 2) {
    recipes.push(buildRecipe(makeId(), 'Array Transform Pipeline', 'idiom', ingredients, filePath, 'easy', '15 minutes'))
  }

  if (forLoops && !arrayOps) {
    recipes.push(buildRecipe(makeId(), 'Iteration Pattern', 'algorithm', ingredients, filePath, 'easy', '10 minutes'))
  }

  if (hasIngredient('class') && content.includes('static')) {
    recipes.push(buildRecipe(makeId(), 'Singleton Pattern', 'pattern', ingredients, filePath, 'moderate', '30 minutes'))
  }

  if (content.includes('async') && content.includes('await')) {
    recipes.push(buildRecipe(makeId(), 'Async/Await Pattern', 'pattern', ingredients, filePath, 'easy', '20 minutes'))
  }

  if (content.includes('describe(') || content.includes('test(') || content.includes('it(')) {
    recipes.push(buildRecipe(makeId(), 'Test Structure Pattern', 'testing', ingredients, filePath, 'easy', '15 minutes'))
  }

  if (content.includes('process.env') || content.includes('getConfig') || content.includes('readFileSync')) {
    recipes.push(buildRecipe(makeId(), 'Configuration Loading', 'configuration', ingredients, filePath, 'easy', '10 minutes'))
  }

  if (content.includes('readFile') || content.includes('writeFile') || content.includes('fetch(')) {
    recipes.push(buildRecipe(makeId(), 'I/O Operations', 'io', ingredients, filePath, 'moderate', '30 minutes'))
  }

  if (content.includes('typeof') || content.includes('instanceof') || content.includes('assert')) {
    recipes.push(buildRecipe(makeId(), 'Type Guard Pattern', 'validation', ingredients, filePath, 'easy', '15 minutes'))
  }

  if (content.includes('export') && content.includes('import')) {
    recipes.push(buildRecipe(makeId(), 'Module Export Pattern', 'boilerplate', ingredients, filePath, 'trivial', '5 minutes'))
  }

  if (recipes.length === 0 && ingredients.length > 0) {
    recipes.push(buildRecipe(makeId(), 'General Code Pattern', 'pattern', ingredients, filePath, 'moderate', '20 minutes'))
  }

  return recipes
}

/**
 * Build a recipe object.
 *
 * @example
 * buildRecipe('r1', 'Test', 'utility', ings, 'a.ts', 'easy', '5 min') // => Recipe
 */
export function buildRecipe(
  id: string, name: string, category: RecipeCategory,
  ingredients: Ingredient[], filePath: string, difficulty: Difficulty, prepTime: string,
): Recipe {
  return {
    id,
    name,
    category,
    ingredients: ingredients.slice(0, 10),
    servings: 1,
    difficulty,
    prepTime,
    instructions: [`Identify ${name} pattern`, 'Extract shared logic', 'Create reusable module'],
    files: [filePath],
    isSignature: false,
    isFusion: false,
    reusability: 0,
  }
}

// ─── Reusability ─────────────────────────────────────────

/**
 * Compute reusability score 0-100.
 *
 * @example
 * computeReusability(recipe, 5) // => 80
 */
export function computeReusability(recipe: Recipe, matchCount: number): number {
  let score = 0

  score += Math.min(matchCount * 10, 40)

  const categoryBonus: Record<RecipeCategory, number> = {
    utility: 30, idiom: 25, boilerplate: 20, pattern: 20,
    algorithm: 15, validation: 15, 'error-handling': 15,
    configuration: 10, testing: 10, io: 10,
  }
  score += categoryBonus[recipe.category]

  const coreIngredients = recipe.ingredients.filter(i => i.isCore).length
  if (coreIngredients <= 3) score += 15
  else if (coreIngredients <= 5) score += 10

  if (recipe.difficulty === 'easy' || recipe.difficulty === 'trivial') score += 15
  else if (recipe.difficulty === 'moderate') score += 10

  return Math.min(100, Math.max(0, score))
}

// ─── Match Finding ───────────────────────────────────────

/**
 * Find recipe matches across files.
 *
 * @example
 * findMatches(recipes, ['a.ts'], ['code']) // => [RecipeMatch]
 */
export function findMatches(recipes: Recipe[], files: string[], contents: string[]): RecipeMatch[] {
  const matches: RecipeMatch[] = []

  for (let fi = 0; fi < files.length; fi++) {
    const file = files[fi]
    const content = contents[fi] ?? ''
    const lines = content.split('\n')

    for (const recipe of recipes) {
      if (!recipe.files.includes(file) && !recipe.files.some(rf => file.endsWith(rf))) {
        continue
      }

      let bestStart = 1
      let bestEnd = lines.length
      let bestConf = 80

      for (let li = 0; li < lines.length; li++) {
        const line = lines[li]
        if (recipe.category === 'testing' && (line.includes('test(') || line.includes('it(') || line.includes('describe('))) {
          bestStart = li + 1
          break
        }
        if (recipe.category === 'error-handling' && line.includes('try')) {
          bestStart = li + 1
          break
        }
        if (recipe.category === 'io' && (line.includes('readFile') || line.includes('writeFile') || line.includes('fetch'))) {
          bestStart = li + 1
          break
        }
      }

      const matchedIngredients = recipe.ingredients.filter(ing =>
        content.includes(ing.value),
      ).length
      const totalIngredients = recipe.ingredients.length
      if (totalIngredients > 0) {
        bestConf = Math.round((matchedIngredients / totalIngredients) * 100)
      }

      matches.push({
        file,
        recipeId: recipe.id,
        confidence: bestConf,
        variations: [],
        lineStart: bestStart,
        lineEnd: bestEnd,
      })
    }
  }

  return matches
}

// ─── Signature & Fusion ──────────────────────────────────

/**
 * Identify signature recipes (well-established, consistent).
 *
 * @example
 * identifySignatureRecipes(recipes, matches) // => modified recipes
 */
export function identifySignatureRecipes(recipes: Recipe[], matches: RecipeMatch[]): Recipe[] {
  return recipes.map(recipe => {
    const recipeMatches = matches.filter(m => m.recipeId === recipe.id)
    const avgConfidence = recipeMatches.length > 0
      ? recipeMatches.reduce((s, m) => s + m.confidence, 0) / recipeMatches.length
      : 0
    const isSignature = recipe.servings >= 3 && avgConfidence >= 70
    return { ...recipe, isSignature }
  })
}

/**
 * Identify fusion recipes (experimental, mixed).
 *
 * @example
 * identifyFusionRecipes(recipes) // => modified recipes
 */
export function identifyFusionRecipes(recipes: Recipe[]): Recipe[] {
  const categoryMap = new Map<string, number>()
  for (const r of recipes) {
    categoryMap.set(r.category, (categoryMap.get(r.category) ?? 0) + 1)
  }

  return recipes.map(recipe => {
    const categoriesInFile = new Set(recipes.filter(r => r.files.some(f => recipe.files.includes(f))).map(r => r.category))
    const isFusion = categoriesInFile.size >= 3 && recipe.difficulty !== 'trivial'
    return { ...recipe, isFusion }
  })
}

// ─── Abstraction Opportunities ───────────────────────────

/**
 * Find abstraction opportunities from repeated patterns.
 *
 * @example
 * findAbstractionOpportunities(recipes, matches) // => [AbstractionOpportunity]
 */
export function findAbstractionOpportunities(recipes: Recipe[], _matches: RecipeMatch[]): AbstractionOpportunity[] {
  const opportunities: AbstractionOpportunity[] = []

  const categoryRecipes = new Map<RecipeCategory, Recipe[]>()
  for (const recipe of recipes) {
    const list = categoryRecipes.get(recipe.category) ?? []
    list.push(recipe)
    categoryRecipes.set(recipe.category, list)
  }

  for (const [category, catRecipes] of categoryRecipes) {
    const files = catRecipes.flatMap(r => r.files)
    const uniqueFiles = [...new Set(files)]

    if (uniqueFiles.length >= 2) {
      const avgDifficulty = catRecipes.every(r => r.difficulty === 'trivial' || r.difficulty === 'easy')
        ? 'trivial' as const
        : catRecipes.every(r => r.difficulty !== 'complex' && r.difficulty !== 'expert')
          ? 'easy' as const
          : 'moderate' as const

      opportunities.push({
        pattern: `${category} abstraction`,
        files: uniqueFiles,
        estimatedSaving: uniqueFiles.length * 10,
        difficulty: avgDifficulty,
        suggestedApproach: `Extract shared ${category} logic into a utility module`,
      })
    }
  }

  return opportunities
}

// ─── Coverage ────────────────────────────────────────────

/**
 * Compute boilerplate and idiom coverage percentages.
 *
 * @example
 * computeCoverage(recipes, 100) // => { boilerplateCoverage, idiomCoverage }
 */
export function computeCoverage(recipes: Recipe[], totalLines: number): { boilerplateCoverage: number; idiomCoverage: number } {
  if (totalLines === 0 || recipes.length === 0) return { boilerplateCoverage: 0, idiomCoverage: 0 }

  const boilerplateRecipes = recipes.filter(r => r.category === 'boilerplate')
  const idiomRecipes = recipes.filter(r => r.category === 'idiom')

  const boilerplateLines = boilerplateRecipes.reduce((s, r) => s + r.ingredients.length * 3, 0)
  const idiomLines = idiomRecipes.reduce((s, r) => s + r.ingredients.length * 2, 0)

  return {
    boilerplateCoverage: Math.min(100, Math.round((boilerplateLines / totalLines) * 100)),
    idiomCoverage: Math.min(100, Math.round((idiomLines / totalLines) * 100)),
  }
}

// ─── Overall Complexity ──────────────────────────────────

/**
 * Classify overall complexity from recipes.
 *
 * @example
 * classifyOverallComplexity(recipes) // => 'moderate'
 */
export function classifyOverallComplexity(recipes: Recipe[]): OverallComplexity {
  if (recipes.length === 0) return 'simple'

  const difficultyScores: Record<Difficulty, number> = {
    trivial: 1, easy: 2, moderate: 3, complex: 4, expert: 5,
  }

  const avg = recipes.reduce((s, r) => s + difficultyScores[r.difficulty], 0) / recipes.length

  if (avg <= 1.5) return 'simple'
  if (avg <= 2.5) return 'moderate'
  if (avg <= 3.5) return 'complex'
  return 'gourmet'
}

// ─── Cookbook Completeness ───────────────────────────────

/**
 * Compute cookbook completeness score 0-100.
 *
 * @example
 * computeCookbookCompleteness(recipes, matches) // => 75
 */
export function computeCookbookCompleteness(recipes: Recipe[], matches: RecipeMatch[]): number {
  if (recipes.length === 0) return 0

  let score = 0

  const categories = new Set(recipes.map(r => r.category))
  score += Math.min(categories.size * 10, 40)

  const signatureCount = recipes.filter(r => r.isSignature).length
  score += Math.min(signatureCount * 10, 30)

  const avgConfidence = matches.length > 0
    ? matches.reduce((s, m) => s + m.confidence, 0) / matches.length
    : 50
  score += Math.round(avgConfidence * 0.3)

  return Math.min(100, score)
}

// ─── Recommendations ─────────────────────────────────────

/**
 * Generate recipe book recommendations.
 *
 * @example
 * generateRecipeBookRecommendations(recipes, opportunities, stats) // => ['Document patterns']
 */
export function generateRecipeBookRecommendations(
  recipes: Recipe[],
  opportunities: AbstractionOpportunity[],
  stats: RecipeBookStats,
): string[] {
  const recs: string[] = []

  const signatures = recipes.filter(r => r.isSignature)
  if (signatures.length > 0) {
    recs.push(`Document ${signatures.length} signature recipe${signatures.length > 1 ? 's' : ''} as team standards`)
  }

  if (opportunities.length > 0) {
    recs.push(`Extract ${opportunities.length} shared pattern${opportunities.length > 1 ? 's' : ''} into reusable utilities`)
  }

  const fusion = recipes.filter(r => r.isFusion)
  if (fusion.length > 0) {
    recs.push(`Evaluate ${fusion.length} fusion recipe${fusion.length > 1 ? 's' : ''} for standardization`)
  }

  if (stats.boilerplateCoverage > 30) {
    recs.push('High boilerplate coverage — consider code generation or scaffolding tools')
  }

  if (stats.cookbookCompleteness < 50) {
    recs.append ? recs.push('Improve cookbook completeness by documenting common patterns') : recs.push('Improve cookbook completeness by documenting common patterns')
  }

  return recs
}

// ─── Build Result ────────────────────────────────────────

/**
 * Build the complete recipe book result.
 *
 * @example
 * buildRecipeBookResult(['a.ts'], ['code'], {}) // => RecipeBookResult
 */
export function buildRecipeBookResult(files: string[], contents: string[], options: RecipeBookOptions): RecipeBookResult {
  const allRecipes: Recipe[] = []
  const allMatches: RecipeMatch[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const content = contents[i] ?? ''
    const ingredients = extractIngredients(content)
    const fileRecipes = detectRecipes(ingredients, content, file)
    allRecipes.push(...fileRecipes)
  }

  const recipeMap = new Map<string, Recipe>()
  for (const recipe of allRecipes) {
    const existing = recipeMap.get(recipe.name)
    if (existing) {
      const newFiles = [...new Set([...existing.files, ...recipe.files])]
      const mergedIngredients = [...existing.ingredients]
      for (const ing of recipe.ingredients) {
        if (!mergedIngredients.some(mi => mi.type === ing.type && mi.value === ing.value)) {
          mergedIngredients.push(ing)
        }
      }
      recipeMap.set(recipe.name, {
        ...existing,
        files: newFiles,
        servings: newFiles.length,
        ingredients: mergedIngredients,
      })
    } else {
      recipeMap.set(recipe.name, { ...recipe })
    }
  }

  const mergedRecipes = [...recipeMap.values()]

  const matches = findMatches(mergedRecipes, files, contents)
  allMatches.push(...matches)

  const recipesWithSignature = identifySignatureRecipes(mergedRecipes, allMatches)
  const recipesWithFusion = identifyFusionRecipes(recipesWithSignature)

  const finalRecipes = recipesWithFusion.map(r => ({
    ...r,
    reusability: computeReusability(r, allMatches.filter(m => m.recipeId === r.id).length),
  }))

  const opportunities = findAbstractionOpportunities(finalRecipes, allMatches)

  const totalLines = contents.reduce((s, c) => s + c.split('\n').length, 0)
  const coverage = computeCoverage(finalRecipes, totalLines)

  const categoryDistribution: Record<string, number> = {}
  const difficultyDistribution: Record<string, number> = {}
  for (const r of finalRecipes) {
    categoryDistribution[r.category] = (categoryDistribution[r.category] ?? 0) + 1
    difficultyDistribution[r.difficulty] = (difficultyDistribution[r.difficulty] ?? 0) + 1
  }

  const avgReusability = finalRecipes.length > 0
    ? Math.round(finalRecipes.reduce((s, r) => s + r.reusability, 0) / finalRecipes.length)
    : 0

  const signatureCount = finalRecipes.filter(r => r.isSignature).length
  const fusionCount = finalRecipes.filter(r => r.isFusion).length

  const sortedByServings = [...finalRecipes].sort((a, b) => b.servings - a.servings)
  const mostUsedRecipe = sortedByServings[0]?.name ?? ''
  const leastUsedRecipe = sortedByServings[sortedByServings.length - 1]?.name ?? ''

  const cookbookCompleteness = computeCookbookCompleteness(finalRecipes, allMatches)

  const stats: RecipeBookStats = {
    totalRecipes: finalRecipes.length,
    totalMatches: allMatches.length,
    categoryDistribution,
    difficultyDistribution,
    avgReusability,
    signatureCount,
    fusionCount,
    mostUsedRecipe,
    leastUsedRecipe,
    boilerplateCoverage: coverage.boilerplateCoverage,
    idiomCoverage: coverage.idiomCoverage,
    abstractionOpportunities: opportunities.length,
    cookbookCompleteness,
    overallComplexity: classifyOverallComplexity(finalRecipes),
  }

  const recommendations = generateRecipeBookRecommendations(finalRecipes, opportunities, stats)

  return {
    recipes: finalRecipes,
    matches: allMatches,
    stats,
    opportunities,
    recommendations,
  }
}
