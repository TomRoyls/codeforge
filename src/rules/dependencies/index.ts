/**
 * @fileoverview Dependency analysis rules for CodeForge
 * Exports all dependency-related rules as a unified module
 * @module rules/dependencies
 */

import type { RuleDefinition } from '../../plugins/types.js';
import { noCircularDepsRule } from './no-circular-deps.js';
import { noUnusedExportsRule } from './no-unused-exports.js';
import { consistentImportsRule } from './consistent-imports.js';
import { noBarrelImportsRule } from './no-barrel-imports.js';

export const rules: Record<string, RuleDefinition> = {
  'no-circular-deps': noCircularDepsRule,
  'no-unused-exports': noUnusedExportsRule,
  'consistent-imports': consistentImportsRule,
  'no-barrel-imports': noBarrelImportsRule,
};

export { noCircularDepsRule, noUnusedExportsRule, consistentImportsRule, noBarrelImportsRule };
export default rules;
