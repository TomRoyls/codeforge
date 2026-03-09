import { Project, type SourceFile } from 'ts-morph';

export interface ParseResult {
  sourceFile: SourceFile;
  filePath: string;
  parseTime: number;
}

/**
 * Options for configuring the Parser
 * @property tsConfigFilePath - Path to the tsconfig.json file
 * @property skipFileDependencyResolution - Whether to skip resolving file dependencies
 */
export interface ParserOptions {
  tsConfigFilePath?: string;
  skipFileDependencyResolution?: boolean;
}

/**
 * Parser class for parsing TypeScript source files using ts-morph
 */
export class Parser {
  private project: Project | null = null;
  private options: ParserOptions;

  /**
   * Creates a new Parser instance
   * @param options - Configuration options for the parser
   * @example
   * const parser = new Parser({ tsConfigFilePath: './tsconfig.json' });
   */
  constructor(options: ParserOptions = {}) {
    this.options = options;
  }

  /**
   * Initializes the parser by creating a new ts-morph Project
   * @returns Promise that resolves when initialization is complete
   * @example
   * await parser.initialize();
   */
  async initialize(): Promise<void> {
    this.project = new Project({
      tsConfigFilePath: this.options.tsConfigFilePath,
      skipFileDependencyResolution: this.options.skipFileDependencyResolution ?? true,
      skipAddingFilesFromTsConfig: this.options.tsConfigFilePath ? false : true,
      compilerOptions: {
        allowJs: true,
        checkJs: false,
      },
    });
  }

  /**
   * Parses a single TypeScript source file
   * @param filePath - Path to the TypeScript file to parse
   * @returns ParseResult containing the parsed source file, file path, and parse time
   * @example
   * const result = await parser.parseFile('./src/index.ts');
   * console.log(`Parsed in ${result.parseTime}ms`);
   */
  async parseFile(filePath: string): Promise<ParseResult> {
    if (!this.project) {
      await this.initialize();
    }

    const startTime = performance.now();

    const sourceFile = this.project!.addSourceFileAtPath(filePath);

    const parseTime = performance.now() - startTime;

    return {
      sourceFile,
      filePath,
      parseTime,
    };
  }

  /**
   * Parses multiple TypeScript source files
   * @param filePaths - Array of paths to TypeScript files to parse
   * @returns Array of ParseResults for successfully parsed files (errors are logged but don't stop processing)
   * @example
   * const results = await parser.parseFiles(['./src/index.ts', './src/utils.ts']);
   * console.log(`Parsed ${results.length} files`);
   */
  async parseFiles(filePaths: string[]): Promise<ParseResult[]> {
    const results: ParseResult[] = [];

    for (const filePath of filePaths) {
      try {
        const result = await this.parseFile(filePath);
        results.push(result);
      } catch (error) {
        console.error(`Failed to parse ${filePath}: ${(error as Error).message}`);
      }
    }

    return results;
  }

  /**
   * Gets the underlying ts-morph Project instance
   * @returns The Project instance or null if not initialized
   * @example
   * const project = parser.getProject();
   * if (project) {
   *   const sourceFiles = project.getSourceFiles();
   * }
   */
  getProject(): Project | null {
    return this.project;
  }

  /**
   * Cleans up resources by clearing the project reference
   * @example
   * parser.dispose();
   */
  dispose(): void {
    if (this.project) {
      this.project = null;
    }
  }
}
