export class CLIError extends Error {
  public readonly code: string;
  public readonly suggestions: string[];
  public readonly context: Record<string, unknown>;

  constructor(
    message: string,
    options: {
      code?: string;
      suggestions?: string[];
      context?: Record<string, unknown>;
    } = {}
  ) {
    super(message);
    this.name = 'CLIError';
    this.code = options.code ?? 'E000';
    this.suggestions = options.suggestions ?? [];
    this.context = options.context ?? {};
    Object.setPrototypeOf(this, CLIError.prototype);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CLIError);
    }
  }

  public static invalidInput(
    message: string,
    suggestions: string[] = []
  ): CLIError {
    return new CLIError(message, { code: 'E001', suggestions });
  }

  public static fileNotFound(filePath: string): CLIError {
    return new CLIError(`File not found: ${filePath}`, {
      code: 'E002',
      suggestions: [
        'Check that the file path is correct',
        'Verify the file exists',
        'Use absolute path if relative path fails',
      ],
    });
  }

  public static configError(
    message: string,
    suggestions: string[] = []
  ): CLIError {
    return new CLIError(message, { code: 'E003', suggestions });
  }

  public toJSON(): {
    name: string;
    code: string;
    message: string;
    suggestions: string[];
    context: Record<string, unknown>;
    stack?: string;
  } {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      suggestions: this.suggestions,
      context: this.context,
      stack: this.stack,
    };
  }
}

export class SystemError extends Error {
  public readonly code: string;
  public readonly cause?: Error;
  public readonly context: Record<string, unknown>;

  constructor(
    message: string,
    options: {
      code?: string;
      cause?: Error;
      context?: Record<string, unknown>;
    } = {}
  ) {
    super(message);
    this.name = 'SystemError';
    this.code = options.code ?? 'E500';
    this.cause = options.cause;
    this.context = options.context ?? {};
    Object.setPrototypeOf(this, SystemError.prototype);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SystemError);
    }
  }

  public static parseError(filePath: string, cause: Error): SystemError {
    return new SystemError(`Failed to parse file: ${filePath}`, {
      code: 'E501',
      cause,
      context: { filePath, causeMessage: cause.message },
    });
  }

  public static ioError(operation: string, cause: Error): SystemError {
    return new SystemError(`I/O error: ${operation}`, {
      code: 'E502',
      cause,
      context: { operation, causeMessage: cause.message },
    });
  }

  public toJSON(): {
    name: string;
    code: string;
    message: string;
    cause?: { name: string; message: string; stack?: string };
    context: Record<string, unknown>;
    stack?: string;
  } {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      cause: this.cause
        ? { name: this.cause.name, message: this.cause.message, stack: this.cause.stack }
        : undefined,
      context: this.context,
      stack: this.stack,
    };
  }
}
