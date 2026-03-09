import type { SourceFile } from "ts-morph";
import { traverseAST, type RuleViolation } from "../ast/visitor.js";
import type { RuleDefinition, RuleOptions } from "../rules/types.js";

export type RuleCategory = "complexity" | "dependencies" | "performance" | "security" | "patterns";

export interface LoadedRule {
  category: RuleCategory;
  definition: RuleDefinition;
  enabled: boolean;
  options: RuleOptions;
}

/**
 * Registry for managing and running code analysis rules
 */
export class RuleRegistry {
  private rules = new Map<string, LoadedRule>();

  /**
   * Registers a new rule in the registry
   * @param ruleId - Unique identifier for the rule
   * @param definition - Rule definition containing visitor and completion logic
   * @param category - Category the rule belongs to (complexity, dependencies, performance, security, patterns)
   * @param options - Configuration options for the rule
   * @example
   * registry.register('no-console', myRuleDefinition, 'performance');
   */
  register(ruleId: string, definition: RuleDefinition, category: RuleCategory, options: RuleOptions = {}): void {
    this.rules.set(ruleId, {
      category,
      definition,
      enabled: true,
      options,
    });
  }

  /**
   * Enables a specific rule in the registry
   * @param ruleId - Unique identifier of the rule to enable
   * @example
   * registry.enable('no-console');
   */
  enable(ruleId: string): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.enabled = true;
    }
  }

  /**
   * Disables a specific rule in the registry
   * @param ruleId - Unique identifier of the rule to disable
   * @example
   * registry.disable('no-console');
   */
  disable(ruleId: string): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.enabled = false;
    }
  }

  /**
   * Gets all currently enabled rules from the registry
   * @returns Array of enabled LoadedRule objects
   * @example
   * const enabledRules = registry.getEnabledRules();
   * console.log(`Active rules: ${enabledRules.length}`);
   */
  getEnabledRules(): LoadedRule[] {
    return Array.from(this.rules.values()).filter((r) => r.enabled);
  }

  /**
   * Gets a specific rule by its ID
   * @param ruleId - Unique identifier of the rule to retrieve
   * @returns The LoadedRule object if found, undefined otherwise
   * @example
   * const rule = registry.getRule('no-console');
   * if (rule) {
   *   console.log('Rule is enabled:', rule.enabled);
   * }
   */
  getRule(ruleId: string): LoadedRule | undefined {
    return this.rules.get(ruleId);
  }

  /**
   * Runs all enabled rules against a source file
   * @param sourceFile - The TypeScript source file to analyze
   * @returns Array of rule violations found in the source file
   * @example
   * const violations = registry.runRules(sourceFile);
   * violations.forEach(v => console.error(`${v.message} at ${v.location}`));
   */
  runRules(sourceFile: SourceFile): RuleViolation[] {
    const allViolations: RuleViolation[] = [];
    const enabledRules = this.getEnabledRules();

    for (const loadedRule of enabledRules) {
      const { definition, options } = loadedRule;
      const { visitor, onComplete } = definition.create(options);

      const violations: RuleViolation[] = [];

      traverseAST(sourceFile, visitor, violations);

      if (onComplete) {
        const completedViolations = onComplete();
        allViolations.push(...completedViolations);
      }

      allViolations.push(...violations);
    }

    return allViolations;
  }
}

/**
 * Creates a new RuleRegistry instance with default configuration
 * @returns A new empty RuleRegistry
 * @example
 * const registry = createDefaultRegistry();
 * registry.register('my-rule', myRuleDefinition, 'complexity');
 */
export function createDefaultRegistry(): RuleRegistry {
  const registry = new RuleRegistry();
  return registry;
}
