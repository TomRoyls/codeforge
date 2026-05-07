export interface BenchmarkConfig {
  filePath: string
  iterations: number
  rules: string[]
  sampleCode: string
  warmupIterations: number
}

export interface RuleBenchmarkResult {
  averageMs: number
  iterations: number
  maxMs: number
  medianMs: number
  memoryUsageKB: number
  minMs: number
  p95Ms: number
  p99Ms: number
  ruleId: string
  totalMs: number
  violationsPerRun: number
}

export interface BenchmarkSuite {
  config: BenchmarkConfig
  nodeVersion: string
  platform: string
  results: RuleBenchmarkResult[]
  timestamp: string
  totalDurationMs: number
}

export const DEFAULT_BENCHMARK_CONFIG: BenchmarkConfig = {
  filePath: 'benchmark-sample.ts',
  iterations: 10,
  rules: [],
  sampleCode: `import { EventEmitter } from 'events';

export class UserService extends EventEmitter {
  private users: Map<string, { name: string; age: number; email: string }> = new Map();

  constructor(private readonly apiKey: string) {
    super();
  }

  addUser(id: string, name: string, age: number, email: string): void {
    if (age < 0) throw new Error('Invalid age');
    if (!email.includes('@')) throw new Error('Invalid email');
    this.users.set(id, { name, age, email });
    this.emit('userAdded', id);
  }

  getUser(id: string) {
    return this.users.get(id);
  }

  processUsers(): string[] {
    const results: string[] = [];
    for (const [id, user] of this.users) {
      if (user.age >= 18) {
        results.push(\`\${user.name} (\${user.email})\`);
      }
    }
    return results;
  }
}
`,
  warmupIterations: 3,
}
