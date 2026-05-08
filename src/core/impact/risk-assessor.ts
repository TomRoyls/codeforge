import type { Change, ChangeSet, EffortEstimate, RiskAssessment, RiskFactor, TestStrategy } from './types.js';
import { ImpactType } from './types.js';
import type { ImpactGraph } from './types.js';
import type { RiskLevel } from './types.js';

const CORE_MODULE_PATTERNS = [
  'src/core/',
  '/src/core/',
  'src/lib/',
  '/src/lib/',
  'src/engine/',
  '/src/engine/',
  'src/base/',
  '/src/base/',
];

const CROSS_CUTTING_PATTERNS = [
  'src/utils/',
  '/src/utils/',
  'src/helpers/',
  '/src/helpers/',
  'src/shared/',
  '/src/shared/',
  'src/common/',
  '/src/common/',
  'src/middleware/',
  '/src/middleware/',
  'src/plugins/',
  '/src/plugins/',
];

const CONFIG_PATTERNS = [
  '.config.',
  'tsconfig',
  '.json',
  '.yaml',
  '.yml',
  '.env',
  'webpack.config',
  'vite.config',
  'rollup.config',
];

export class RiskAssessor {
  private areaMap: Map<string, string>;

  constructor(areaMap: Map<string, string> = new Map()) {
    this.areaMap = areaMap;
  }

  assess(graph: ImpactGraph, changeSet: ChangeSet): RiskAssessment {
    const score = this.calculateRiskScore(graph, changeSet);
    const factors = this.identifyRiskFactors(graph, changeSet);
    const affectedAreas = this.getAffectedAreas(graph, this.areaMap);
    const recommendedTests = this.getRecommendedTests(graph, changeSet);
    const estimatedEffort = this.estimateEffort({
      overallRisk: this.scoreToLevel(score),
      score,
      factors,
      affectedAreas,
      recommendedTests,
      estimatedEffort: { minHours: 0, maxHours: 0, confidence: 0, breakdown: {} },
    });

    return {
      overallRisk: this.scoreToLevel(score),
      score,
      factors,
      affectedAreas,
      recommendedTests,
      estimatedEffort,
    };
  }

  calculateRiskScore(graph: ImpactGraph, changeSet: ChangeSet): number {
    let score = 0;
    const blastRadius = this.computeBlastRadius(graph);

    score += Math.min(blastRadius * 3, 30);

    for (const change of changeSet.changes) {
      const totalLines = change.additions + change.deletions;
      if (totalLines > 200) {
        score += 15;
      } else if (totalLines > 50) {
        score += 8;
      } else if (totalLines > 10) {
        score += 3;
      }

      if (this.isCoreModule(change.filePath)) {
        score += 15;
      }

      if (this.hasExportChanges(change)) {
        score += 10;
      }

      if (this.isCrossCutting(change.filePath)) {
        score += 12;
      }

      if (this.isConfiguration(change.filePath)) {
        score += 8;
      }

      if (change.type === 'deleted') {
        score += 10;
      }

      const hasTests = this.hasTestCoverage(change.filePath, graph);
      if (!hasTests) {
        score += 8;
      }
    }

    score += Math.min(changeSet.changes.length * 2, 10);

    return Math.min(score, 100);
  }

  identifyRiskFactors(graph: ImpactGraph, changeSet: ChangeSet): RiskFactor[] {
    const factors: RiskFactor[] = [];

    for (const change of changeSet.changes) {
      if (this.isCoreModule(change.filePath)) {
        factors.push({
          name: 'Core module change',
          description: `Modification to core module: ${change.filePath}`,
          severity: 'high',
          weight: 0.9,
          mitigation: 'Ensure all dependent modules are tested after changes',
        });
      }

      if (this.hasExportChanges(change)) {
        factors.push({
          name: 'Interface/type change',
          description: `Public interface changed in: ${change.filePath}`,
          severity: 'high',
          weight: 0.85,
          mitigation: 'Verify all consumers of exported symbols still compile and function correctly',
        });
      }

      const totalLines = change.additions + change.deletions;
      if (totalLines > 200) {
        factors.push({
          name: 'Large change',
          description: `Large change (${totalLines} lines) in: ${change.filePath}`,
          severity: 'medium',
          weight: 0.6,
          mitigation: 'Break into smaller, reviewable changes if possible',
        });
      }

      const hasTests = this.hasTestCoverage(change.filePath, graph);
      if (!hasTests) {
        factors.push({
          name: 'No test coverage',
          description: `No test coverage for: ${change.filePath}`,
          severity: 'medium',
          weight: 0.55,
          mitigation: 'Add test coverage before or immediately after the change',
        });
      }

      if (this.isCrossCutting(change.filePath)) {
        factors.push({
          name: 'Cross-cutting concern',
          description: `Cross-cutting concern modified: ${change.filePath}`,
          severity: 'high',
          weight: 0.8,
          mitigation: 'Verify behavior across all modules that depend on this utility',
        });
      }

      if (this.isConfiguration(change.filePath)) {
        factors.push({
          name: 'Configuration change',
          description: `Configuration file modified: ${change.filePath}`,
          severity: 'medium',
          weight: 0.5,
          mitigation: 'Verify configuration changes in all environments',
        });
      }

      if (change.type === 'deleted') {
        factors.push({
          name: 'File deletion',
          description: `File deleted: ${change.filePath}`,
          severity: 'high',
          weight: 0.85,
          mitigation: 'Verify no remaining references to deleted file',
        });
      }
    }

    return this.deduplicateFactors(factors);
  }

  suggestTestStrategy(assessment: RiskAssessment): TestStrategy[] {
    const strategies: TestStrategy[] = [];

    for (const factor of assessment.factors) {
      if (factor.severity === 'high' || factor.severity === 'critical') {
        strategies.push({
          priority: 'must',
          type: 'unit',
          target: factor.description.split(': ').pop() ?? factor.description,
          reason: `High risk factor: ${factor.name}`,
        });
      }
    }

    if (assessment.score >= 70) {
      strategies.push({
        priority: 'must',
        type: 'integration',
        target: 'All affected modules',
        reason: 'High overall risk score requires integration testing',
      });
      strategies.push({
        priority: 'should',
        type: 'e2e',
        target: 'Critical user flows',
        reason: 'E2E tests recommended for high-risk changes',
      });
    } else if (assessment.score >= 40) {
      strategies.push({
        priority: 'should',
        type: 'integration',
        target: 'Affected module boundaries',
        reason: 'Medium risk score warrants integration testing',
      });
    }

    for (const test of assessment.recommendedTests) {
      strategies.push({
        priority: 'should',
        type: 'unit',
        target: test,
        reason: 'Test file for changed code should be updated',
      });
    }

    if (assessment.affectedAreas.length > 3) {
      strategies.push({
        priority: 'should',
        type: 'manual',
        target: 'Cross-area regression',
        reason: 'Changes affect multiple areas requiring manual verification',
      });
    }

    if (assessment.score < 20) {
      strategies.push({
        priority: 'could',
        type: 'unit',
        target: 'Directly changed files',
        reason: 'Low risk change, minimal testing needed',
      });
    }

    return this.deduplicateStrategies(strategies);
  }

  estimateEffort(assessment: RiskAssessment): EffortEstimate {
    const baseHours = assessment.score / 10;
    const minHours = Math.max(0.5, baseHours * 0.7);
    const maxHours = Math.max(1, baseHours * 1.5);
    const breakdown: Record<string, number> = {};

    const unitTestHours = assessment.factors.filter((f) => f.severity === 'high').length * 1;
    const integrationHours = assessment.affectedAreas.length * 0.5;
    const e2eHours = assessment.score >= 70 ? 2 : 0;
    const reviewHours = assessment.factors.length * 0.3;

    breakdown['unit-testing'] = Math.max(0.5, unitTestHours);
    breakdown['integration-testing'] = Math.max(0, integrationHours);
    breakdown['e2e-testing'] = e2eHours;
    breakdown['code-review'] = Math.max(0.5, reviewHours);

    return {
      minHours: Math.round(minHours * 10) / 10,
      maxHours: Math.round(maxHours * 10) / 10,
      confidence: Math.max(0.3, 1 - assessment.score / 150),
      breakdown,
    };
  }

  classifyChange(change: Change): RiskLevel {
    let riskScore = 0;

    if (this.isCoreModule(change.filePath)) riskScore += 30;
    if (this.hasExportChanges(change)) riskScore += 25;
    if (change.type === 'deleted') riskScore += 25;
    if (this.isCrossCutting(change.filePath)) riskScore += 20;

    const totalLines = change.additions + change.deletions;
    if (totalLines > 200) riskScore += 20;
    else if (totalLines > 50) riskScore += 10;

    if (this.isConfiguration(change.filePath)) riskScore += 10;

    if (riskScore >= 60) return 'critical';
    if (riskScore >= 40) return 'high';
    if (riskScore >= 25) return 'medium';
    if (riskScore >= 10) return 'low';
    return 'minimal';
  }

  getAffectedAreas(graph: ImpactGraph, areaMap: Map<string, string>): string[] {
    const areas = new Set<string>();

    for (const rootChange of graph.rootChanges) {
      const area = areaMap.get(rootChange);
      if (area) areas.add(area);
    }

    for (const nodes of graph.nodes.values()) {
      for (const node of nodes) {
        const area = areaMap.get(node.filePath);
        if (area) areas.add(area);
      }
    }

    return [...areas];
  }

  private scoreToLevel(score: number): RiskLevel {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    if (score >= 20) return 'low';
    return 'minimal';
  }

  private computeBlastRadius(graph: ImpactGraph): number {
    const allImpacted = new Set<string>();
    for (const nodes of graph.nodes.values()) {
      for (const node of nodes) {
        allImpacted.add(node.filePath);
      }
    }
    return allImpacted.size;
  }

  private isCoreModule(filePath: string): boolean {
    return CORE_MODULE_PATTERNS.some((p) => filePath.includes(p));
  }

  private isCrossCutting(filePath: string): boolean {
    return CROSS_CUTTING_PATTERNS.some((p) => filePath.includes(p));
  }

  private isConfiguration(filePath: string): boolean {
    return CONFIG_PATTERNS.some((p) => filePath.includes(p));
  }

  private hasExportChanges(change: Change): boolean {
    return change.exports.length > 0;
  }

  private hasTestCoverage(filePath: string, graph: ImpactGraph): boolean {
    const nodes = graph.nodes.get(filePath);
    if (!nodes) return false;
    return nodes.some((n) => n.impactType === ImpactType.TEST_COVERAGE);
  }

  private deduplicateFactors(factors: RiskFactor[]): RiskFactor[] {
    const seen = new Set<string>();
    return factors.filter((f) => {
      const key = `${f.name}:${f.description}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private deduplicateStrategies(strategies: TestStrategy[]): TestStrategy[] {
    const seen = new Set<string>();
    return strategies.filter((s) => {
      const key = `${s.priority}:${s.type}:${s.target}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private getRecommendedTests(graph: ImpactGraph, changeSet: ChangeSet): string[] {
    const tests: string[] = [];
    for (const change of changeSet.changes) {
      const nodes = graph.nodes.get(change.filePath);
      if (nodes) {
        for (const node of nodes) {
          if (node.impactType === ImpactType.TEST_COVERAGE) {
            tests.push(node.filePath);
          }
        }
      }
    }
    return [...new Set(tests)];
  }
}
