import * as path from 'path';
import fg from 'fast-glob';

export interface FileDiscoveryOptions {
  patterns: string[];
  ignore: string[];
  cwd: string;
}

export interface DiscoveredFile {
  path: string;
  absolutePath: string;
}

const DEFAULT_PATTERNS = ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'];
const DEFAULT_IGNORE = [
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/.git/**',
  '**/coverage/**',
  '**/*.d.ts',
];

export async function discoverFiles(options: FileDiscoveryOptions): Promise<DiscoveredFile[]> {
  const patterns = options.patterns.length > 0 ? options.patterns : DEFAULT_PATTERNS;
  const ignorePatterns = options.ignore.length > 0 ? options.ignore : DEFAULT_IGNORE;
  const cwd = path.resolve(options.cwd);

  const stream = fg.globStream(patterns, {
    cwd,
    ignore: ignorePatterns,
    absolute: true,
    onlyFiles: true,
    followSymbolicLinks: false,
    suppressErrors: true,
  });

  const files: DiscoveredFile[] = [];

  for await (const entry of stream) {
    const absolutePath = entry as string;
    const relativePath = path.relative(cwd, absolutePath);
    files.push({
      path: relativePath,
      absolutePath,
    });
  }

  return files;
}

export { DEFAULT_PATTERNS, DEFAULT_IGNORE };
