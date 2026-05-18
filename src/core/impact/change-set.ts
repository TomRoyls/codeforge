import type { Change, ChangeSet } from './types.js'
import { globToRegex } from '../../utils/glob.js';
import { unique } from '../../utils/array-helpers.js';

export function extractImports(content: string): string[] {
  const results: string[] = [];
  const patterns = [
    /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g,
    /import\s+['"]([^'"]+)['"]/g,
    /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  ];
  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(content)) !== null) {
      results.push(match[1]!);
    }
  }
  return unique(results);
}

export function extractExports(content: string): string[] {
  const results: string[] = [];
  const namedPatterns = [
    /export\s+(?:default\s+)?function\s+(\w+)/g,
    /export\s+(?:default\s+)?class\s+(\w+)/g,
    /export\s+(?:default\s+)?interface\s+(\w+)/g,
    /export\s+(?:default\s+)?type\s+(\w+)/g,
    /export\s+(?:default\s+)?enum\s+(\w+)/g,
    /export\s+(?:default\s+)?const\s+(\w+)/g,
    /export\s+(?:default\s+)?let\s+(\w+)/g,
  ];
  for (const pattern of namedPatterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(content)) !== null) {
      results.push(match[1]!);
    }
  }
  const listPattern = /export\s*\{([^}]+)\}/g;
  let listMatch: RegExpExecArray | null;
  while ((listMatch = listPattern.exec(content)) !== null) {
    const items = listMatch[1]!.split(',');
    for (const item of items) {
      const parts = item.trim().split(/\s+as\s+/);
      results.push(parts[0]!.trim());
    }
  }
  return unique(results);
}

export function getChangedSymbols(content: string): string[] {
  const results: string[] = [];
  const patterns = [
    /(?:export\s+)?(?:default\s+)?function\s+(\w+)/g,
    /(?:export\s+)?(?:default\s+)?class\s+(\w+)/g,
    /(?:export\s+)?(?:default\s+)?interface\s+(\w+)/g,
    /(?:export\s+)?(?:default\s+)?type\s+(\w+)\s*[=<{]/g,
    /(?:export\s+)?(?:default\s+)?enum\s+(\w+)/g,
    /(?:export\s+)?(?:default\s+)?const\s+(\w+)\s*[:=]/g,
    /(?:export\s+)?(?:default\s+)?let\s+(\w+)\s*[:=]/g,
  ];
  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(content)) !== null) {
      results.push(match[1]!);
    }
  }
  return unique(results);
}

export function fromDiff(diff: string): ChangeSet {
  const changes: Change[] = [];
  const lines = diff.split('\n');
  let currentFile = '';
  let pendingType: Change['type'] | null = null;
  let changeType: Change['type'] = 'modified';
  let additions = 0;
  let deletions = 0;
  const imports: string[] = [];
  const exports: string[] = [];

  const flushCurrent = () => {
    if (currentFile && (additions > 0 || deletions > 0 || changeType === 'deleted')) {
      changes.push({
        filePath: currentFile,
        type: changeType,
        additions,
        deletions,
        imports: unique(imports),
        exports: unique(exports),
      });
    }
  };

  for (const line of lines) {
    if (line.startsWith('new file mode')) {
      pendingType = 'added';
      continue;
    }
    if (line.startsWith('deleted file mode')) {
      pendingType = 'deleted';
      continue;
    }

    const matchB = line.match(/^\+\+\+ b\/(.+)$/);
    const matchDevNull = line.match(/^\+\+\+ \/dev\/null$/);
    if (matchB) {
      flushCurrent();
      currentFile = matchB[1]!;
      additions = 0;
      deletions = 0;
      imports.length = 0;
      exports.length = 0;
      changeType = pendingType ?? 'modified';
      pendingType = null;
      continue;
    }
    if (matchDevNull) {
      flushCurrent();
      changeType = 'deleted';
      pendingType = null;
      continue;
    }
    const matchA = line.match(/^--- a\/(.+)$/);
    if (matchA) {
      if (!currentFile || changeType === 'deleted') {
        currentFile = matchA[1]!;
      }
      continue;
    }
    if (line.startsWith('diff --git')) {
      continue;
    }
    if (line.startsWith('@@')) {
      continue;
    }
    if (line.startsWith('index ')) {
      continue;
    }

    if (line.startsWith('+')) {
      additions++;
      const content = line.slice(1);
      const newImports = extractImports(content);
      const newExports = extractExports(content);
      imports.push(...newImports);
      exports.push(...newExports);
    } else if (line.startsWith('-')) {
      deletions++;
    }
  }

  flushCurrent();

  return {
    changes,
    timestamp: Date.now(),
  };
}

export function fromFileList(files: string[], type: Change['type']): ChangeSet {
  return {
    changes: files.map((filePath) => ({
      filePath,
      type,
      additions: type === 'deleted' ? 0 : 1,
      deletions: type === 'added' ? 0 : 1,
      imports: [],
      exports: [],
    })),
    timestamp: Date.now(),
  };
}

export function mergeChangeSets(sets: ChangeSet[]): ChangeSet {
  const allChanges: Change[] = [];
  const seen = new Map<string, Change>();
  for (const set of sets) {
    for (const change of set.changes) {
      const existing = seen.get(change.filePath);
      if (existing) {
        existing.additions += change.additions;
        existing.deletions += change.deletions;
        existing.imports = unique([...existing.imports, ...change.imports]);
        existing.exports = unique([...existing.exports, ...change.exports]);
        if (change.type === 'deleted') {
          existing.type = 'deleted';
        } else if (change.type === 'added' && existing.type !== 'deleted') {
          existing.type = 'added';
        }
      } else {
        const cloned: Change = {
          filePath: change.filePath,
          type: change.type,
          additions: change.additions,
          deletions: change.deletions,
          imports: [...change.imports],
          exports: [...change.exports],
        };
        seen.set(change.filePath, cloned);
        allChanges.push(cloned);
      }
    }
  }
  let maxTs = Date.now()
  for (let i = 0; i < sets.length; i++) {
    if (sets[i]!.timestamp > maxTs) maxTs = sets[i]!.timestamp
  }
  return {
    changes: allChanges,
    timestamp: maxTs,
  };
}

export function filterByPattern(set: ChangeSet, pattern: string): ChangeSet {
  const regex = globToRegex(pattern);
  return {
    changes: set.changes.filter((c) => regex.test(c.filePath)),
    timestamp: set.timestamp,
    branch: set.branch,
    author: set.author,
    description: set.description,
  };
}

export class ChangeSetBuilder {
  private changes: Change[] = [];
  private branchValue?: string;
  private authorValue?: string;
  private descriptionValue?: string;

  static fromDiff(diff: string): ChangeSet {
    return fromDiff(diff);
  }

  static fromFileList(files: string[], type: Change['type']): ChangeSet {
    return fromFileList(files, type);
  }

  static mergeChangeSets(sets: ChangeSet[]): ChangeSet {
    return mergeChangeSets(sets);
  }

  static filterByPattern(set: ChangeSet, pattern: string): ChangeSet {
    return filterByPattern(set, pattern);
  }

  addChange(change: Change): ChangeSetBuilder {
    this.changes.push(change);
    return this;
  }

  branch(branch: string): ChangeSetBuilder {
    this.branchValue = branch;
    return this;
  }

  author(author: string): ChangeSetBuilder {
    this.authorValue = author;
    return this;
  }

  description(desc: string): ChangeSetBuilder {
    this.descriptionValue = desc;
    return this;
  }

  build(): ChangeSet {
    return {
      changes: [...this.changes],
      timestamp: Date.now(),
      branch: this.branchValue,
      author: this.authorValue,
      description: this.descriptionValue,
    };
  }
}
