export class HttpStatus2 {
  static readonly OK = 200
  static readonly CREATED = 201
  static readonly NO_CONTENT = 204
  static readonly MOVED_PERMANENTLY = 301
  static readonly FOUND = 302
  static readonly NOT_MODIFIED = 304
  static readonly BAD_REQUEST = 400
  static readonly UNAUTHORIZED = 401
  static readonly FORBIDDEN = 403
  static readonly NOT_FOUND = 404
  static readonly METHOD_NOT_ALLOWED = 405
  static readonly CONFLICT = 409
  static readonly INTERNAL_SERVER_ERROR = 500
  static readonly NOT_IMPLEMENTED = 501
  static readonly BAD_GATEWAY = 502
  static readonly SERVICE_UNAVAILABLE = 503

  private static messages: Map<number, string> = new Map([
    [200, 'OK'], [201, 'Created'], [202, 'Accepted'], [204, 'No Content'],
    [301, 'Moved Permanently'], [302, 'Found'], [304, 'Not Modified'],
    [400, 'Bad Request'], [401, 'Unauthorized'], [403, 'Forbidden'],
    [404, 'Not Found'], [405, 'Method Not Allowed'], [409, 'Conflict'],
    [410, 'Gone'], [418, "I'm a Teapot"], [422, 'Unprocessable Entity'],
    [429, 'Too Many Requests'],
    [500, 'Internal Server Error'], [501, 'Not Implemented'],
    [502, 'Bad Gateway'], [503, 'Service Unavailable'],
    [504, 'Gateway Timeout'],
  ])

  static message(code: number): string | undefined {
    return HttpStatus2.messages.get(code)
  }

  static isInformational(code: number): boolean { return code >= 100 && code < 200 }
  static isSuccessful(code: number): boolean { return code >= 200 && code < 300 }
  static isRedirect(code: number): boolean { return code >= 300 && code < 400 }
  static isClientError(code: number): boolean { return code >= 400 && code < 500 }
  static isServerError(code: number): boolean { return code >= 500 && code < 600 }
  static isError(code: number): boolean { return code >= 400 }

  static register(code: number, message: string): void {
    HttpStatus2.messages.set(code, message)
  }

  static allCodes(): number[] {
    return Array.from(HttpStatus2.messages.keys())
  }

  static allMessages(): { code: number; message: string }[] {
    return Array.from(HttpStatus2.messages.entries()).map(([code, message]) => ({ code, message }))
  }

  toArray(): number[] { return HttpStatus2.allCodes() }
  toString(): string { return JSON.stringify(Object.fromEntries(HttpStatus2.messages)) }
  toJSON(): Record<string, string> {
    const result: Record<string, string> = {}
    HttpStatus2.messages.forEach((msg, code) => { result[code] = msg })
    return result
  }
  clone(): HttpStatus2 { return new HttpStatus2() }
  equals(other: unknown): boolean { return other instanceof HttpStatus2 }
}
