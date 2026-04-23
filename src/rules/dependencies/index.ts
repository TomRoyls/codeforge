/**
 * @file Dependency analysis rules for CodeForge
 * Exports all dependency-related rules as a unified module
 * @module rules/dependencies
 */

import type { RuleDefinition } from '../../plugins/types.js'

import { consistentImportsRule } from './consistent-imports.js'
import { noBarrelImportsRule } from './no-barrel-imports.js'
import { noCircularDepsRule } from './no-circular-deps.js'
import { noUnusedExportsRule } from './no-unused-exports.js'

export const rules: Record<string, RuleDefinition> = {
  'consistent-imports': consistentImportsRule,
  'no-barrel-imports': noBarrelImportsRule,
  'no-circular-deps': noCircularDepsRule,
  'no-unused-exports': noUnusedExportsRule,
}


export default rules

export {consistentImportsRule} from './consistent-imports.js'
export {noBarrelImportsRule} from './no-barrel-imports.js'
export {noCircularDepsRule} from './no-circular-deps.js'
export {noUnusedExportsRule} from './no-unused-exports.js'