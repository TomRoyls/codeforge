import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import * as fs from 'fs'
import * as fsPromises from 'fs/promises'
import * as path from 'path'
import * as os from 'os'
import { writeToFile } from '../../../src/utils/file-writer'

describe('file-writer', () => {
  let tempDir: string

  beforeEach(async () => {
    tempDir = await fsPromises.mkdtemp(path.join(os.tmpdir(), 'test-file-writer-'))
  })

  afterEach(async () => {
    await fsPromises.rm(tempDir, { recursive: true, force: true })
  })

  describe('writeToFile', () => {
    test('writes content to a file at the specified path', () => {
      const testFile = path.join(tempDir, 'test.txt')
      const content = 'Hello, World!'

      writeToFile(testFile, content)

      expect(fs.existsSync(testFile)).toBe(true)
      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('creates parent directories if they do not exist', () => {
      const nestedPath = path.join(tempDir, 'level1', 'level2', 'test.txt')
      const content = 'nested content'

      writeToFile(nestedPath, content)

      expect(fs.existsSync(nestedPath)).toBe(true)
      expect(fs.readFileSync(nestedPath, 'utf8')).toBe(content)
    })

    test('overwrites existing file', () => {
      const testFile = path.join(tempDir, 'test.txt')
      const originalContent = 'original'
      const updatedContent = 'updated'

      writeToFile(testFile, originalContent)
      expect(fs.readFileSync(testFile, 'utf8')).toBe(originalContent)

      writeToFile(testFile, updatedContent)
      expect(fs.readFileSync(testFile, 'utf8')).toBe(updatedContent)
    })

    test('handles deeply nested directory creation', () => {
      const deeplyNestedPath = path.join(
        tempDir,
        'level1',
        'level2',
        'level3',
        'level4',
        'level5',
        'test.txt',
      )
      const content = 'deeply nested'

      writeToFile(deeplyNestedPath, content)

      expect(fs.existsSync(deeplyNestedPath)).toBe(true)
      expect(fs.readFileSync(deeplyNestedPath, 'utf8')).toBe(content)
    })

    test('uses utf8 encoding for file content', () => {
      const testFile = path.join(tempDir, 'utf8.txt')
      const unicodeContent = 'Hello 世界 🌍 Ñoño'

      writeToFile(testFile, unicodeContent)

      const readContent = fs.readFileSync(testFile, 'utf8')
      expect(readContent).toBe(unicodeContent)
    })

    test('writes empty string to file', () => {
      const testFile = path.join(tempDir, 'empty.txt')

      writeToFile(testFile, '')

      expect(fs.existsSync(testFile)).toBe(true)
      expect(fs.readFileSync(testFile, 'utf8')).toBe('')
    })

    test('writes multi-line content correctly', () => {
      const testFile = path.join(tempDir, 'multiline.txt')
      const multiLineContent = 'line 1\nline 2\nline 3'

      writeToFile(testFile, multiLineContent)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(multiLineContent)
    })

    test('writes content with special characters', () => {
      const testFile = path.join(tempDir, 'special.txt')
      const specialContent = 'Tab\there!\nNewline\nEscape: \\n Quote: "'

      writeToFile(testFile, specialContent)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(specialContent)
    })

    test('writes large content to file', () => {
      const testFile = path.join(tempDir, 'large.txt')
      const largeContent = 'x'.repeat(10000)

      writeToFile(testFile, largeContent)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(largeContent)
    })

    test('handles directory path ending with separator correctly', () => {
      const testFile = path.join(tempDir, 'with-slash') + path.sep + 'test.txt'
      const content = 'content'

      writeToFile(testFile, content)

      expect(fs.existsSync(testFile)).toBe(true)
      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })
  })
})
