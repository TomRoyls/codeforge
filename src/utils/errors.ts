export class CLIError extends Error {
  public readonly code: string
  public readonly context: Record<string, unknown>
  public readonly suggestions: string[]

  constructor(
    message: string,
    options: {
      code?: string
      context?: Record<string, unknown>
      suggestions?: string[]
    } = {},
  ) {
    super(message)
    this.name = 'CLIError'
    this.code = options.code ?? 'E000'
    this.suggestions = options.suggestions ?? []
    this.context = options.context ?? {}
    Object.setPrototypeOf(this, CLIError.prototype)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CLIError)
    }
  }

  public static configError(message: string, suggestions: string[] = []): CLIError {
    return new CLIError(message, { code: 'E003', suggestions })
  }

  public static fileNotFound(filePath: string): CLIError {
    return new CLIError(`File not found: ${filePath}`, {
      code: 'E002',
      suggestions: [
        'Check that the file path is correct',
        'Verify the file exists',
        'Use absolute path if relative path fails',
      ],
    })
  }

  public static invalidInput(message: string, suggestions: string[] = []): CLIError {
    return new CLIError(message, { code: 'E001', suggestions })
  }

  public toJSON(): {
    code: string
    context: Record<string, unknown>
    message: string
    name: string
    stack?: string
    suggestions: string[]
  } {
    return {
      code: this.code,
      context: this.context,
      message: this.message,
      name: this.name,
      stack: this.stack,
      suggestions: this.suggestions,
    }
  }
}

export class SystemError extends Error {
  public readonly cause?: Error
  public readonly code: string
  public readonly context: Record<string, unknown>

  constructor(
    message: string,
    options: {
      cause?: Error
      code?: string
      context?: Record<string, unknown>
    } = {},
  ) {
    super(message)
    this.name = 'SystemError'
    this.code = options.code ?? 'E500'
    this.cause = options.cause
    this.context = options.context ?? {}
    Object.setPrototypeOf(this, SystemError.prototype)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SystemError)
    }
  }

  public static ioError(operation: string, cause: Error): SystemError {
    return new SystemError(`I/O error: ${operation}`, {
      cause,
      code: 'E502',
      context: { causeMessage: cause.message, operation },
    })
  }

  public static parseError(filePath: string, cause: Error): SystemError {
    return new SystemError(`Failed to parse file: ${filePath}`, {
      cause,
      code: 'E501',
      context: { causeMessage: cause.message, filePath },
    })
  }

  public toJSON(): {
    cause?: { message: string; name: string; stack?: string }
    code: string
    context: Record<string, unknown>
    message: string
    name: string
    stack?: string
  } {
    return {
      cause: this.cause
        ? { message: this.cause.message, name: this.cause.name, stack: this.cause.stack }
        : undefined,
      code: this.code,
      context: this.context,
      message: this.message,
      name: this.name,
      stack: this.stack,
    }
  }
}
