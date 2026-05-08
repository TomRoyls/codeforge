export enum ImpactType {
  DIRECT_DEPENDENCY = 'DIRECT_DEPENDENCY',
  TRANSITIVE_DEPENDENCY = 'TRANSITIVE_DEPENDENCY',
  TEST_COVERAGE = 'TEST_COVERAGE',
  RE_EXPORT = 'RE_EXPORT',
  INTERFACE_CONSUMER = 'INTERFACE_CONSUMER',
  SHARED_TYPE = 'SHARED_TYPE',
  CONFIGURATION = 'CONFIGURATION',
}

export type RiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'minimal';

export interface Change {
  filePath: string;
  type: 'added' | 'modified' | 'deleted';
  additions: number;
  deletions: number;
  imports: string[];
  exports: string[];
}

export interface ChangeSet {
  changes: Change[];
  timestamp: number;
  branch?: string;
  author?: string;
  description?: string;
}

export interface ImpactNode {
  filePath: string;
  impactType: ImpactType;
  depth: number;
  reason: string;
  confidence: number;
}

export interface ImpactEdge {
  from: string;
  to: string;
  type: ImpactType;
  weight: number;
}

export interface ImpactGraph {
  nodes: Map<string, ImpactNode[]>;
  edges: ImpactEdge[];
  rootChanges: string[];
}

export interface RiskFactor {
  name: string;
  description: string;
  severity: RiskLevel;
  weight: number;
  mitigation: string;
}

export interface EffortEstimate {
  minHours: number;
  maxHours: number;
  confidence: number;
  breakdown: Record<string, number>;
}

export interface RiskAssessment {
  overallRisk: RiskLevel;
  score: number;
  factors: RiskFactor[];
  affectedAreas: string[];
  recommendedTests: string[];
  estimatedEffort: EffortEstimate;
}

export interface TestStrategy {
  priority: 'must' | 'should' | 'could' | 'wont';
  type: 'unit' | 'integration' | 'e2e' | 'manual';
  target: string;
  reason: string;
}
