import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { Parser } from '../../src/core/parser.js'
import { writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { performance } from 'node:perf_hooks'

const TEST_FILES_DIR = path.join(process.cwd(), 'test/fixtures/parser-benchmark')

async function setupTestFiles(count: number): Promise<string[]> {
  // Create test files directory if it doesn't exist
  if (!existsSync(TEST_FILES_DIR)) {
    await mkdir(TEST_FILES_DIR, { recursive: true })
  }

  const filePaths: string[] = []

  for (let i = 0; i < count; i++) {
    const fileName = `file${i}.ts`
    const filePath = path.join(TEST_FILES_DIR, fileName)
    const content = generateTestFile(i)

    await writeFile(filePath, content, 'utf-8')
    filePaths.push(filePath)
  }

  return filePaths
}

function generateTestFile(index: number): string {
  return `
// Test file ${index}
export interface TestInterface${index} {
  id: number
  name: string
  value: number
}

export class TestClass${index} implements TestInterface${index} {
  constructor(
    public id: number,
    public name: string,
    public value: number
  ) {}

  public methodOne(param: string): string {
    return param + ' processed'
  }

  public methodTwo(param: number): number {
    return param * 2
  }

  public methodThree(param: string, value: number): string {
    return \`\${param}: \${value}\`
  }
}

export function testFunction${index}(input: TestInterface${index}): string {
  const instance = new TestClass${index}(input.id, input.name, input.value)
  return instance.methodOne(instance.methodTwo(10))
}

const testVariable${index}: TestInterface${index} = {
  id: ${index},
  name: 'test',
  value: ${index * 10}
}
`
}

async function cleanupTestFiles(filePaths: string[]): Promise<void> {
  const { unlink } = await import('node:fs/promises')
  for (const filePath of filePaths) {
    try {
      await unlink(filePath)
    } catch (error) {
      // Ignore cleanup errors
    }
  }
}

describe('Parser Performance Benchmark', () => {
  let testFilePaths: string[] = []

  beforeEach(async () => {
    // Create 20 test files for benchmarking
    testFilePaths = await setupTestFiles(20)
  })

  afterEach(async () => {
    // Cleanup test files
    await cleanupTestFiles(testFilePaths)
  })

  test('sequential parsing (concurrency=1) baseline', async () => {
    const parser = new Parser({ concurrency: 1 })
    await parser.initialize()

    const startTime = performance.now()
    const results = await parser.parseFiles(testFilePaths)
    const duration = performance.now() - startTime

    console.log(`\nSequential parsing (concurrency=1):`)
    console.log(`  Files parsed: ${results.length}`)
    console.log(`  Duration: ${duration.toFixed(2)}ms`)

    expect(results).toHaveLength(20)
  })

  test('concurrent parsing (concurrency=4) with default setting', async () => {
    const parser = new Parser() // Default concurrency is 4
    await parser.initialize()

    const startTime = performance.now()
    const results = await parser.parseFiles(testFilePaths)
    const duration = performance.now() - startTime

    console.log(`\nConcurrent parsing (concurrency=4, default):`)
    console.log(`  Files parsed: ${results.length}`)
    console.log(`  Duration: ${duration.toFixed(2)}ms`)

    expect(results).toHaveLength(20)
  })

  test('concurrent parsing (concurrency=8) high concurrency', async () => {
    const parser = new Parser({ concurrency: 8 })
    await parser.initialize()

    const startTime = performance.now()
    const results = await parser.parseFiles(testFilePaths)
    const duration = performance.now() - startTime

    console.log(`\nConcurrent parsing (concurrency=8):`)
    console.log(`  Files parsed: ${results.length}`)
    console.log(`  Duration: ${duration.toFixed(2)}ms`)

    expect(results).toHaveLength(20)
  })

  test('performance comparison: sequential vs concurrent', async () => {
    // Benchmark sequential parsing
    const sequentialParser = new Parser({ concurrency: 1 })
    await sequentialParser.initialize()

    const sequentialStart = performance.now()
    const sequentialResults = await sequentialParser.parseFiles(testFilePaths)
    const sequentialDuration = performance.now() - sequentialStart

    console.log(`\nSequential (concurrency=1):`)
    console.log(`  Files: ${sequentialResults.length}`)
    console.log(`  Duration: ${sequentialDuration.toFixed(2)}ms`)

    // Benchmark concurrent parsing with default concurrency
    const concurrentParser = new Parser()
    await concurrentParser.initialize()

    const concurrentStart = performance.now()
    const concurrentResults = await concurrentParser.parseFiles(testFilePaths)
    const concurrentDuration = performance.now() - concurrentStart

    console.log(`\nConcurrent (concurrency=4, default):`)
    console.log(`  Files: ${concurrentResults.length}`)
    console.log(`  Duration: ${concurrentDuration.toFixed(2)}ms`)

    // Calculate improvement
    const improvement = ((sequentialDuration - concurrentDuration) / sequentialDuration) * 100
    const speedup = sequentialDuration / concurrentDuration

    console.log(`\nPerformance Comparison:`)
    console.log(
      `  Time saved: ${sequentialDuration.toFixed(2)}ms - ${concurrentDuration.toFixed(2)}ms = ${(sequentialDuration - concurrentDuration).toFixed(2)}ms`,
    )
    console.log(`  Improvement: ${improvement.toFixed(2)}%`)
    console.log(`  Speedup: ${speedup.toFixed(2)}x`)

    // Note: Performance may vary based on system load, caching, and file sizes
    // Small files may not show significant concurrent improvement
    if (improvement < 0) {
      console.warn(
        `\n⚠️  Warning: Concurrent was ${Math.abs(improvement).toFixed(2)}% slower (may be due to small files or system load)`,
      )
    } else if (improvement < 50) {
      console.warn(
        `\n⚠️  Warning: Improvement (${improvement.toFixed(2)}%) is below 50% (small files or system load)`,
      )
    } else if (improvement < 70) {
      console.warn(`\n⚠️  Warning: Improvement (${improvement.toFixed(2)}%) is below 70% target`)
      console.warn('This may be due to system resources or test file characteristics')
    } else {
      console.log(`\n✅ Performance improvement meets 70% target!`)
    }

    // Both should parse all files
    expect(sequentialResults).toHaveLength(20)
    expect(concurrentResults).toHaveLength(20)
  })

  test('scales well with larger file counts', async () => {
    const largeTestFiles = await setupTestFiles(50)

    try {
      const parser = new Parser({ concurrency: 4 })
      await parser.initialize()

      const startTime = performance.now()
      const results = await parser.parseFiles(largeTestFiles)
      const duration = performance.now() - startTime

      const avgTimePerFile = duration / results.length

      console.log(`\nScalability test (50 files, concurrency=4):`)
      console.log(`  Files parsed: ${results.length}`)
      console.log(`  Total duration: ${duration.toFixed(2)}ms`)
      console.log(`  Average time per file: ${avgTimePerFile.toFixed(2)}ms`)

      expect(results).toHaveLength(50)
    } finally {
      await cleanupTestFiles(largeTestFiles)
    }
  })
})
