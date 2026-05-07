#!/usr/bin/env node
/**
 * Fix broken syntax in src/rules/index.ts and rule-category-registry.ts
 * 
 * Issues:
 * 1. Object-literal entries ['key']: adaptPluginRule(Var) that should be const declarations
 * 2. Const declarations INSIDE the allRules object (invalid)
 * 3. Duplicate const declarations
 * 4. Missing allRules entries for spread rules
 * 5. Duplicate properties in rule-category-registry.ts
 */

import { readFileSync, writeFileSync } from 'fs'

// ── Fix index.ts ──
const filePath = 'src/rules/index.ts'
let content = readFileSync(filePath, 'utf-8')
const lines = content.split('\n')

// Find allRules boundaries
let allRulesStart = -1
let allRulesEnd = -1
for (let i = 0; i < lines.length; i++) {
  if (lines[i].startsWith('export const allRules:')) {
    allRulesStart = i
  }
  if (allRulesStart !== -1 && allRulesEnd === -1 && lines[i] === '}' && i > allRulesStart) {
    allRulesEnd = i
    break
  }
}

console.log(`allRules: lines ${allRulesStart + 1} to ${allRulesEnd + 1}`)

// Patterns
const brokenPattern = /^\s*\['([^']+)'\]:\s*adaptPluginRule\((\w+)\)\s*,?\s*$/
const constPattern = /^const (adapted\w+) = adaptPluginRule\((\w+),\s*'([^']+)'\)\s*$/

// Track all adapted const declarations (first occurrence wins)
const constDeclarations = new Map() // adaptedVarName -> { ruleVar, key }
const linesToRemove = new Set()
const brokenEntries = [] // { lineIdx, key, ruleVar, adaptedVar }

function kebabToCamel(key) {
  return key.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
}

function getAdaptedVarName(key) {
  const camel = kebabToCamel(key)
  return 'adapted' + camel.charAt(0).toUpperCase() + camel.slice(1)
}

// Phase 1: Collect existing const declarations BEFORE allRules
for (let i = 0; i < allRulesStart; i++) {
  const match = lines[i].match(constPattern)
  if (match) {
    const [, adaptedVar, ruleVar, key] = match
    if (!constDeclarations.has(adaptedVar)) {
      constDeclarations.set(adaptedVar, { ruleVar, key })
    } else {
      linesToRemove.add(i) // Duplicate
    }
  }
}

// Phase 2: Find broken entries and const declarations inside allRules
for (let i = allRulesStart; i <= allRulesEnd; i++) {
  const line = lines[i]
  
  // Check for const declaration inside allRules
  const constMatch = line.match(constPattern)
  if (constMatch) {
    const [, adaptedVar, ruleVar, key] = constMatch
    if (!constDeclarations.has(adaptedVar)) {
      constDeclarations.set(adaptedVar, { ruleVar, key })
    }
    linesToRemove.add(i)
    continue
  }
  
  // Check for broken object-literal entry inside allRules
  const brokenMatch = line.match(brokenPattern)
  if (brokenMatch) {
    const [, key, ruleVar] = brokenMatch
    const adaptedVar = getAdaptedVarName(key)
    
    if (!constDeclarations.has(adaptedVar)) {
      constDeclarations.set(adaptedVar, { ruleVar, key })
    }
    
    brokenEntries.push({ lineIdx: i, key, ruleVar, adaptedVar })
    linesToRemove.add(i)
    continue
  }
}

// Also find broken entries BEFORE allRules
for (let i = 0; i < allRulesStart; i++) {
  const brokenMatch = lines[i].match(brokenPattern)
  if (brokenMatch) {
    const [, key, ruleVar] = brokenMatch
    const adaptedVar = getAdaptedVarName(key)
    
    if (!constDeclarations.has(adaptedVar)) {
      constDeclarations.set(adaptedVar, { ruleVar, key })
    }
    
    brokenEntries.push({ lineIdx: i, key, ruleVar, adaptedVar })
    linesToRemove.add(i)
  }
}

console.log(`Found ${linesToRemove.size} lines to remove`)
console.log(`Found ${brokenEntries.length} broken entries to fix`)
console.log(`Total adapted vars: ${constDeclarations.size}`)

// Phase 3: Generate new const declarations for entries that don't have one yet
const newConstDeclarations = []
for (const entry of brokenEntries) {
  if (entry.adaptedVar) {
    // Check if there's already a const for this adapted var before allRules
    let alreadyDeclared = false
    for (let i = 0; i < allRulesStart; i++) {
      if (lines[i].includes(`const ${entry.adaptedVar} = `)) {
        alreadyDeclared = true
        break
      }
    }
    if (!alreadyDeclared) {
      newConstDeclarations.push(`const ${entry.adaptedVar} = adaptPluginRule(${entry.ruleVar}, '${entry.key}')`)
    }
  }
}

// Deduplicate
const uniqueNewConsts = [...new Set(newConstDeclarations)]
console.log(`Generated ${uniqueNewConsts.length} new const declarations`)

// Phase 4: Rebuild the file
const newLines = []

// Add lines before allRules, skipping removed ones
for (let i = 0; i < allRulesStart; i++) {
  if (!linesToRemove.has(i)) {
    newLines.push(lines[i])
  }
}

// Insert new const declarations before allRules
if (uniqueNewConsts.length > 0) {
  newLines.push('')
  for (const decl of uniqueNewConsts) {
    newLines.push(decl)
  }
}

// Add allRules object with fixed entries
for (let i = allRulesStart; i <= allRulesEnd; i++) {
  if (linesToRemove.has(i)) {
    // Check if this was a broken entry that needs replacement
    const replacement = brokenEntries.find(e => e.lineIdx === i)
    if (replacement) {
      newLines.push(`  '${replacement.key}': ${replacement.adaptedVar},`)
    }
    // Otherwise skip (was a const declaration inside allRules)
    continue
  }
  newLines.push(lines[i])
}

// Add lines after allRules
for (let i = allRulesEnd + 1; i < lines.length; i++) {
  newLines.push(lines[i])
}

writeFileSync(filePath, newLines.join('\n'))
console.log('index.ts written successfully')

// ── Fix rule-category-registry.ts ──
console.log('\n--- Fixing rule-category-registry.ts ---')
const registryPath = 'src/rules/rule-category-registry.ts'
let registryContent = readFileSync(registryPath, 'utf-8')

// Remove duplicate lines (keep first occurrence)
const seenProps = new Set()
const regLines = registryContent.split('\n')
const newRegLines = []
let removedCount = 0

for (const line of regLines) {
  const propMatch = line.match(/^\s*\['([^']+)'\]:\s*'[^']+'/) || line.match(/^\s*'([^']+)':\s*'[^']+'/)
  if (propMatch) {
    const prop = propMatch[1]
    if (seenProps.has(prop)) {
      removedCount++
      continue
    }
    seenProps.add(prop)
  }
  newRegLines.push(line)
}

registryContent = newRegLines.join('\n')
writeFileSync(registryPath, registryContent)
console.log(`Removed ${removedCount} duplicate lines from registry`)

console.log('\nDone! Run `npx tsc --noEmit` to verify.')
