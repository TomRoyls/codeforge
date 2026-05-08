import type { AnalyzedFunction, AnalyzedClass, AnalyzedParam, TestCase, TestSuite, TestConfig } from './types.js'

export class TestScaffolder {
  scaffoldFunctionTest(fn: AnalyzedFunction, config: TestConfig): TestSuite {
    const tests: TestCase[] = []
    const mocks: string[] = []

    const happyPaths = this.generateHappyPathTests(fn)
    tests.push(...happyPaths)

    if (config.includeEdgeCases) {
      const edgeCases = this.generateEdgeCaseTests(fn)
      tests.push(...edgeCases)
    }

    if (config.includeErrorCases) {
      const errorCases = this.generateErrorCaseTests(fn)
      tests.push(...errorCases)
    }

    if (config.includeBoundaryCases) {
      const boundaryCases = this.generateBoundaryTests(fn)
      tests.push(...boundaryCases)
    }

    const limitedTests = tests.slice(0, config.maxTestsPerFunction)

    if (fn.callsExternal) {
      mocks.push(this.generateMockCode(fn.params))
    }

    return {
      targetName: fn.name,
      targetType: 'function',
      tests: limitedTests,
      imports: [fn.name],
      fixtures: [],
      mocks,
    }
  }

  scaffoldClassTest(cls: AnalyzedClass, config: TestConfig): TestSuite {
    const tests: TestCase[] = []
    const mocks: string[] = []
    const imports: string[] = [cls.name]

    if (cls.constructor) {
      tests.push({
        name: `${cls.name} constructor creates instance`,
        description: `should create a valid ${cls.name} instance`,
        inputs: cls.constructor.params.map((p) => this.getDefaultValue(p)),
        expectedOutput: `instanceof ${cls.name}`,
        type: 'happy-path',
      })
    }

    if (cls.constructor && config.includeEdgeCases) {
      for (const param of cls.constructor.params) {
        if (!param.optional) {
          tests.push({
            name: `${cls.name} constructor without ${param.name}`,
            description: `should handle missing ${param.name}`,
            inputs: cls.constructor.params.map((p) =>
              p.name === param.name ? undefined : this.getDefaultValue(p),
            ),
            expectedOutput: 'error',
            type: 'edge-case',
          })
        }
      }
    }

    for (const method of cls.methods) {
      const methodTests = this.generateHappyPathTests(method)
      for (const test of methodTests) {
        tests.push({
          ...test,
          name: `${cls.name}.${test.name}`,
        })
      }

      if (config.includeEdgeCases) {
        const edgeTests = this.generateEdgeCaseTests(method)
        for (const test of edgeTests) {
          tests.push({
            ...test,
            name: `${cls.name}.${test.name}`,
          })
        }
      }

      if (config.includeErrorCases) {
        const errorTests = this.generateErrorCaseTests(method)
        for (const test of errorTests) {
          tests.push({
            ...test,
            name: `${cls.name}.${test.name}`,
          })
        }
      }
    }

    const limitedTests = tests.slice(0, config.maxTestsPerFunction * (cls.methods.length + 1))

    if (cls.properties.length > 0 || cls.methods.some((m) => m.callsExternal)) {
      mocks.push(this.generateMockCode(cls.properties))
    }

    return {
      targetName: cls.name,
      targetType: 'class',
      tests: limitedTests,
      imports,
      fixtures: [],
      mocks,
    }
  }

  generateHappyPathTests(fn: AnalyzedFunction): TestCase[] {
    const tests: TestCase[] = []

    const defaultInputs = fn.params.map((p) => this.getDefaultValue(p))
    tests.push({
      name: `${fn.name} with valid inputs`,
      description: `should return expected result for valid inputs`,
      inputs: defaultInputs,
      expectedOutput: this.inferExpectedOutput(fn),
      type: 'happy-path',
    })

    if (fn.params.length > 0) {
      const variantInputs = fn.params.map((p) => this.getVariantValue(p))
      if (variantInputs.some((v, i) => JSON.stringify(v) !== JSON.stringify(defaultInputs[i]))) {
        tests.push({
          name: `${fn.name} with alternate inputs`,
          description: `should handle alternate valid inputs`,
          inputs: variantInputs,
          expectedOutput: this.inferExpectedOutput(fn),
          type: 'happy-path',
        })
      }
    }

    return tests
  }

  generateEdgeCaseTests(fn: AnalyzedFunction): TestCase[] {
    const tests: TestCase[] = []

    for (const param of fn.params) {
      if (this.isNumericType(param.type)) {
        tests.push({
          name: `${fn.name} with zero ${param.name}`,
          description: `should handle zero for ${param.name}`,
          inputs: fn.params.map((p) =>
            p.name === param.name ? 0 : this.getDefaultValue(p),
          ),
          expectedOutput: 'any',
          type: 'edge-case',
        })
        tests.push({
          name: `${fn.name} with negative ${param.name}`,
          description: `should handle negative ${param.name}`,
          inputs: fn.params.map((p) =>
            p.name === param.name ? -1 : this.getDefaultValue(p),
          ),
          expectedOutput: 'any',
          type: 'edge-case',
        })
      }

      if (this.isStringType(param.type)) {
        tests.push({
          name: `${fn.name} with empty ${param.name}`,
          description: `should handle empty string for ${param.name}`,
          inputs: fn.params.map((p) =>
            p.name === param.name ? '' : this.getDefaultValue(p),
          ),
          expectedOutput: 'any',
          type: 'edge-case',
        })
      }

      if (param.optional) {
        tests.push({
          name: `${fn.name} without ${param.name}`,
          description: `should work without optional ${param.name}`,
          inputs: fn.params.map((p) =>
            p.name === param.name ? undefined : this.getDefaultValue(p),
          ),
          expectedOutput: 'any',
          type: 'edge-case',
        })
      }

      if (this.isArrayType(param.type)) {
        tests.push({
          name: `${fn.name} with empty array ${param.name}`,
          description: `should handle empty array for ${param.name}`,
          inputs: fn.params.map((p) =>
            p.name === param.name ? [] : this.getDefaultValue(p),
          ),
          expectedOutput: 'any',
          type: 'edge-case',
        })
      }
    }

    return tests
  }

  generateErrorCaseTests(fn: AnalyzedFunction): TestCase[] {
    const tests: TestCase[] = []

    for (const param of fn.params) {
      if (!param.optional && param.type !== 'unknown') {
        tests.push({
          name: `${fn.name} throws with null ${param.name}`,
          description: `should throw or handle null ${param.name}`,
          inputs: fn.params.map((p) =>
            p.name === param.name ? null : this.getDefaultValue(p),
          ),
          expectedOutput: 'error',
          type: 'error-case',
        })
      }
    }

    if (fn.params.length > 0) {
      tests.push({
        name: `${fn.name} with no arguments`,
        description: `should handle missing arguments`,
        inputs: [],
        expectedOutput: 'error',
        type: 'error-case',
      })
    }

    return tests
  }

  generateBoundaryTests(fn: AnalyzedFunction): TestCase[] {
    const tests: TestCase[] = []

    for (const param of fn.params) {
      if (this.isNumericType(param.type)) {
        tests.push({
          name: `${fn.name} with MAX_SAFE_INTEGER ${param.name}`,
          description: `should handle MAX_SAFE_INTEGER for ${param.name}`,
          inputs: fn.params.map((p) =>
            p.name === param.name ? Number.MAX_SAFE_INTEGER : this.getDefaultValue(p),
          ),
          expectedOutput: 'any',
          type: 'boundary',
        })
        tests.push({
          name: `${fn.name} with MIN_SAFE_INTEGER ${param.name}`,
          description: `should handle MIN_SAFE_INTEGER for ${param.name}`,
          inputs: fn.params.map((p) =>
            p.name === param.name ? Number.MIN_SAFE_INTEGER : this.getDefaultValue(p),
          ),
          expectedOutput: 'any',
          type: 'boundary',
        })
      }

      if (this.isStringType(param.type)) {
        tests.push({
          name: `${fn.name} with very long ${param.name}`,
          description: `should handle very long string for ${param.name}`,
          inputs: fn.params.map((p) =>
            p.name === param.name ? 'a'.repeat(10000) : this.getDefaultValue(p),
          ),
          expectedOutput: 'any',
          type: 'boundary',
        })
      }

      if (this.isArrayType(param.type)) {
        tests.push({
          name: `${fn.name} with large array ${param.name}`,
          description: `should handle large array for ${param.name}`,
          inputs: fn.params.map((p) =>
            p.name === param.name ? Array(1000).fill(0) : this.getDefaultValue(p),
          ),
          expectedOutput: 'any',
          type: 'boundary',
        })
      }
    }

    return tests
  }

  generateMockCode(params: AnalyzedParam[]): string {
    const lines: string[] = []

    for (const param of params) {
      if (this.isObjectType(param.type)) {
        const mockName = `mock${param.name.charAt(0).toUpperCase()}${param.name.slice(1)}`
        const mockProps = this.generateMockObjectProps(param.type)
        lines.push(`const ${mockName} = { ${mockProps} }`)
      }
    }

    if (lines.length === 0) {
      lines.push('// No mocks needed for primitive parameters')
    }

    return lines.join('\n')
  }

  private getDefaultValue(param: AnalyzedParam): unknown {
    if (param.defaultValue !== undefined) {
      return this.parseDefaultValue(param.defaultValue)
    }

    return this.getDefaultForType(param.type)
  }

  private getDefaultForType(type: string): unknown {
    const trimmed = type.trim().toLowerCase()
    if (trimmed === 'string') return 'test'
    if (trimmed === 'number') return 42
    if (trimmed === 'boolean') return true
    if (trimmed === 'void') return undefined
    if (trimmed === 'null') return null
    if (trimmed === 'undefined') return undefined
    if (trimmed.includes('[]') || trimmed.includes('array')) return [1, 2, 3]
    if (trimmed.includes('record') || trimmed.includes('map')) return { key: 'value' }
    if (trimmed.includes('promise')) return Promise.resolve()
    if (trimmed === 'date') return new Date()
    if (trimmed === 'regexp' || trimmed === 'regex') return /test/
    if (trimmed === 'error') return new Error('test')
    if (this.isObjectType(type)) return {}
    return 'test'
  }

  private getVariantValue(param: AnalyzedParam): unknown {
    const trimmed = param.type.trim().toLowerCase()
    if (trimmed === 'string') return 'variant'
    if (trimmed === 'number') return 99
    if (trimmed === 'boolean') return false
    if (trimmed.includes('[]') || trimmed.includes('array')) return [4, 5, 6]
    return this.getDefaultValue(param)
  }

  private inferExpectedOutput(fn: AnalyzedFunction): unknown {
    const rt = fn.returnType.toLowerCase()
    if (rt === 'void') return undefined
    if (rt === 'string') return 'expected'
    if (rt === 'number') return 1
    if (rt === 'boolean') return true
    if (rt.includes('[]')) return []
    if (rt.includes('promise')) return 'resolved'
    return 'expected'
  }

  private parseDefaultValue(value: string): unknown {
    const trimmed = value.trim()
    if (trimmed === 'true') return true
    if (trimmed === 'false') return false
    if (trimmed === 'null') return null
    if (trimmed === 'undefined') return undefined
    if (/^-?\d+$/.test(trimmed)) return parseInt(trimmed, 10)
    if (/^-?\d+\.\d+$/.test(trimmed)) return parseFloat(trimmed)
    if (trimmed.startsWith("'") || trimmed.startsWith('"') || trimmed.startsWith('`')) {
      return trimmed.slice(1, -1)
    }
    if (trimmed.startsWith('[')) return []
    if (trimmed.startsWith('{')) return {}
    return trimmed
  }

  private isNumericType(type: string): boolean {
    const t = type.trim().toLowerCase()
    return t === 'number' || t === 'bigint' || t === 'float' || t === 'integer' || t === 'int'
  }

  private isStringType(type: string): boolean {
    const t = type.trim().toLowerCase()
    return t === 'string'
  }

  private isArrayType(type: string): boolean {
    const t = type.trim().toLowerCase()
    return t.includes('[]') || t.includes('array')
  }

  private isObjectType(type: string): boolean {
    const t = type.trim().toLowerCase()
    return (
      !this.isNumericType(type) &&
      !this.isStringType(type) &&
      !this.isArrayType(type) &&
      t !== 'boolean' &&
      t !== 'void' &&
      t !== 'null' &&
      t !== 'undefined' &&
      t !== 'unknown' &&
      t !== 'any' &&
      !t.includes('promise')
    )
  }

  private generateMockObjectProps(type: string): string {
    const match = type.match(/\{([^}]*)\}/)
    if (match && match[1]) {
      const props = match[1]
        .split(',')
        .map((p) => {
          const parts = p.split(':')
          if (parts.length >= 2) {
            const name = parts[0]!.trim().replace(/\?/g, '')
            return `${name}: jest.fn()`
          }
          return ''
        })
        .filter(Boolean)
      return props.join(', ')
    }
    return 'valueOf: jest.fn(), toString: jest.fn()'
  }
}
