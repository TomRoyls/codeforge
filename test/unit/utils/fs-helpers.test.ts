import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import * as fs from 'fs/promises'
import * as path from 'path'
import * as os from 'os'
import {
  readFileSafe,
  readFileStrict,
  writeFileSafe,
  fileExists,
  directoryExists,
  ensureDirectory,
  deleteFile,
  listFiles,
  getFileInfo,
  readJsonFile,
} from '../../../src/utils/fs-helpers'

describe('fs-helpers', () => {
  let tempDir: string

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'test-'))
  })

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true })
  })

  describe('readFileSafe', () => {
    test('reads existing file', async () => {
      const testFile = path.join(tempDir, 'test.txt')
      await fs.writeFile(testFile, 'content', 'utf-8')
      const content = await readFileSafe(testFile)
      expect(content).toBe('content')
    })

    test('returns null for non-existing file', async () => {
      const content = await readFileSafe(path.join(tempDir, 'nonexistent.txt'))
      expect(content).toBeNull()
    })

    test('reads empty file', async () => {
      const testFile = path.join(tempDir, 'empty.txt')
      await fs.writeFile(testFile, '', 'utf-8')
      const content = await readFileSafe(testFile)
      expect(content).toBe('')
    })

    test('reads large file', async () => {
      const testFile = path.join(tempDir, `large.txt`)
      const largeContent = 'x'.repeat(10000)
      await fs.writeFile(testFile, largeContent, 'utf-8')
      const content = await readFileSafe(testFile)
      expect(content).toBe(largeContent)
    })

    test('reads file with unicode content', async () => {
      const testFile = path.join(tempDir, 'unicode.txt')
      const unicodeContent = 'Hello 世界 🌍 café naïve résumé'
      await fs.writeFile(testFile, unicodeContent, 'utf-8')
      const content = await readFileSafe(testFile)
      expect(content).toBe(unicodeContent)
    })

    test('reads file with newlines', async () => {
      const testFile = path.join(tempDir, 'newlines.txt')
      const content = 'line1\nline2\nline3'
      await fs.writeFile(testFile, content, 'utf-8')
      const result = await readFileSafe(testFile)
      expect(result).toBe(content)
    })

    test('reads file with CRLF line endings', async () => {
      const testFile = path.join(tempDir, 'crlf.txt')
      const content = 'line1\r\nline2\r\nline3'
      await fs.writeFile(testFile, content, 'utf-8')
      const result = await readFileSafe(testFile)
      expect(result).toBe(content)
    })

    test('reads file with tabs', async () => {
      const testFile = path.join(tempDir, 'tabs.txt')
      const content = 'col1\tcol2\tcol3'
      await fs.writeFile(testFile, content, 'utf-8')
      const result = await readFileSafe(testFile)
      expect(result).toBe(content)
    })

    test('reads file with only whitespace', async () => {
      const testFile = path.join(tempDir, 'whitespace.txt')
      const content = '   \n\t  \n  '
      await fs.writeFile(testFile, content, 'utf-8')
      const result = await readFileSafe(testFile)
      expect(result).toBe(content)
    })

    test('reads file with single character', async () => {
      const testFile = path.join(tempDir, 'single.txt')
      await fs.writeFile(testFile, 'a', 'utf-8')
      const result = await readFileSafe(testFile)
      expect(result).toBe('a')
    })

    test('reads file with special characters', async () => {
      const testFile = path.join(tempDir, 'special.txt')
      const content = '!@#$%^&*()_+-=[]{}|;:,.<>?'
      await fs.writeFile(testFile, content, 'utf-8')
      const result = await readFileSafe(testFile)
      expect(result).toBe(content)
    })

    test('reads file with multi-line content', async () => {
      const testFile = path.join(tempDir, 'multi.txt')
      const lines = Array.from({ length: 100 }, (_, i) => `Line ${i + 1}`)
      const content = lines.join('\n')
      await fs.writeFile(testFile, content, 'utf-8')
      const result = await readFileSafe(testFile)
      expect(result).toBe(content)
    })

    test('reads file with numbers as strings', async () => {
      const testFile = path.join(tempDir, 'numbers.txt')
      const content = '1234567890'
      await fs.writeFile(testFile, content, 'utf-8')
      const result = await readFileSafe(testFile)
      expect(result).toBe(content)
    })

    test('returns null for deeply nested non-existing path', async () => {
      const result = await readFileSafe(path.join(tempDir, 'a', 'b', 'c', 'd', 'nonexistent.txt'))
      expect(result).toBeNull()
    })

    test('returns null for non-existing file in non-existing directory', async () => {
      const result = await readFileSafe(path.join(tempDir, 'no-dir', 'file.txt'))
      expect(result).toBeNull()
    })

    test('reads file in nested directory', async () => {
      const nestedDir = path.join(tempDir, 'nested', 'dir')
      await fs.mkdir(nestedDir, { recursive: true })
      const testFile = path.join(nestedDir, 'test.txt')
      await fs.writeFile(testFile, 'nested content', 'utf-8')
      const result = await readFileSafe(testFile)
      expect(result).toBe('nested content')
    })

    test('reads hidden file (dotfile)', async () => {
      const testFile = path.join(tempDir, '.hidden')
      await fs.writeFile(testFile, 'hidden content', 'utf-8')
      const result = await readFileSafe(testFile)
      expect(result).toBe('hidden content')
    })

    test('reads file with spaces in name', async () => {
      const testFile = path.join(tempDir, 'file with spaces.txt')
      await fs.writeFile(testFile, 'spaced', 'utf-8')
      const result = await readFileSafe(testFile)
      expect(result).toBe('spaced')
    })

    test('reads file with JSON content as string', async () => {
      const testFile = path.join(tempDir, 'data.txt')
      const content = JSON.stringify({ key: 'value' })
      await fs.writeFile(testFile, content, 'utf-8')
      const result = await readFileSafe(testFile)
      expect(result).toBe(content)
    })

    test('reads file with emoji content', async () => {
      const testFile = path.join(tempDir, 'emoji.txt')
      const content = '🎉🎊🎈🎁🎂'
      await fs.writeFile(testFile, content, 'utf-8')
      const result = await readFileSafe(testFile)
      expect(result).toBe(content)
    })

    test('reads file with escaped characters', async () => {
      const testFile = path.join(tempDir, 'escaped.txt')
      const content = 'line1\\nline2\\ttab'
      await fs.writeFile(testFile, content, 'utf-8')
      const result = await readFileSafe(testFile)
      expect(result).toBe(content)
    })

    test('reads file with mixed content types', async () => {
      const testFile = path.join(tempDir, 'mixed.txt')
      const content = 'hello 123 !@# world\t\n café 🌍'
      await fs.writeFile(testFile, content, 'utf-8')
      const result = await readFileSafe(testFile)
      expect(result).toBe(content)
    })

    test('reads very large file', async () => {
      const testFile = path.join(tempDir, 'verylarge.txt')
      const largeContent = 'A'.repeat(100000)
      await fs.writeFile(testFile, largeContent, 'utf-8')
      const result = await readFileSafe(testFile)
      expect(result).toBe(largeContent)
    })

    test('reads file with path containing spaces in directory', async () => {
      const spacedDir = path.join(tempDir, 'my dir')
      await fs.mkdir(spacedDir)
      const testFile = path.join(spacedDir, 'file.txt')
      await fs.writeFile(testFile, 'content', 'utf-8')
      const result = await readFileSafe(testFile)
      expect(result).toBe('content')
    })

    test('returns null for non-existing file with dot prefix', async () => {
      const result = await readFileSafe(path.join(tempDir, '.nonexistent'))
      expect(result).toBeNull()
    })

    test('reads file with only a newline', async () => {
      const testFile = path.join(tempDir, 'newline.txt')
      await fs.writeFile(testFile, '\n', 'utf-8')
      const result = await readFileSafe(testFile)
      expect(result).toBe('\n')
    })

    test('reads file with trailing newline', async () => {
      const testFile = path.join(tempDir, 'trailing.txt')
      const content = 'content\n'
      await fs.writeFile(testFile, content, 'utf-8')
      const result = await readFileSafe(testFile)
      expect(result).toBe(content)
    })
  })

  describe('readFileStrict', () => {
    test('writes and reads file', async () => {
      const testFile = path.join(tempDir, 'test.txt')
      await fs.writeFile(testFile, 'content', 'utf-8')
      const content = await readFileStrict(testFile)
      expect(content).toBe('content')
    })

    test('throws for non-existing file', async () => {
      await expect(readFileStrict(path.join(tempDir, 'nonexistent.txt'))).rejects.toThrow(
        'File not found',
      )
    })

    test('reads empty file', async () => {
      const testFile = path.join(tempDir, 'empty.txt')
      await fs.writeFile(testFile, '', 'utf-8')
      const result = await readFileStrict(testFile)
      expect(result).toBe('')
    })

    test('reads file with unicode', async () => {
      const testFile = path.join(tempDir, 'unicode.txt')
      await fs.writeFile(testFile, 'Hello 世界', 'utf-8')
      const result = await readFileStrict(testFile)
      expect(result).toBe('Hello 世界')
    })

    test('reads file with newlines', async () => {
      const testFile = path.join(tempDir, 'newlines.txt')
      const content = 'a\nb\nc'
      await fs.writeFile(testFile, content, 'utf-8')
      const result = await readFileStrict(testFile)
      expect(result).toBe(content)
    })

    test('reads large file', async () => {
      const testFile = path.join(tempDir, 'large.txt')
      const largeContent = 'y'.repeat(50000)
      await fs.writeFile(testFile, largeContent, 'utf-8')
      const result = await readFileStrict(testFile)
      expect(result).toBe(largeContent)
    })

    test('error message contains resolved path for non-existing file', async () => {
      const filePath = path.join(tempDir, 'missing.txt')
      try {
        await readFileStrict(filePath)
        expect.fail('Should have thrown')
      } catch (error) {
        expect((error as Error).message).toContain(path.resolve(filePath))
      }
    })

    test('reads file with special characters', async () => {
      const testFile = path.join(tempDir, 'special.txt')
      const content = '!@#$%^&*()'
      await fs.writeFile(testFile, content, 'utf-8')
      const result = await readFileStrict(testFile)
      expect(result).toBe(content)
    })

    test('reads file with tabs and spaces', async () => {
      const testFile = path.join(tempDir, 'whitespace.txt')
      const content = '\t  hello  \t'
      await fs.writeFile(testFile, content, 'utf-8')
      const result = await readFileStrict(testFile)
      expect(result).toBe(content)
    })

    test('reads file with JSON content', async () => {
      const testFile = path.join(tempDir, 'data.json')
      const jsonContent = '{"key":"value"}'
      await fs.writeFile(testFile, jsonContent, 'utf-8')
      const result = await readFileStrict(testFile)
      expect(result).toBe(jsonContent)
    })

    test('reads file with CRLF line endings', async () => {
      const testFile = path.join(tempDir, 'crlf.txt')
      const content = 'a\r\nb\r\nc'
      await fs.writeFile(testFile, content, 'utf-8')
      const result = await readFileStrict(testFile)
      expect(result).toBe(content)
    })

    test('reads file with emoji', async () => {
      const testFile = path.join(tempDir, 'emoji.txt')
      const content = '🎉 test 🎊'
      await fs.writeFile(testFile, content, 'utf-8')
      const result = await readFileStrict(testFile)
      expect(result).toBe(content)
    })

    test('reads hidden file', async () => {
      const testFile = path.join(tempDir, '.hidden')
      await fs.writeFile(testFile, 'hidden', 'utf-8')
      const result = await readFileStrict(testFile)
      expect(result).toBe('hidden')
    })

    test('reads file in nested directory', async () => {
      const nestedDir = path.join(tempDir, 'a', 'b')
      await fs.mkdir(nestedDir, { recursive: true })
      const testFile = path.join(nestedDir, 'file.txt')
      await fs.writeFile(testFile, 'nested', 'utf-8')
      const result = await readFileStrict(testFile)
      expect(result).toBe('nested')
    })

    test('throws for deeply nested non-existing path', async () => {
      await expect(
        readFileStrict(path.join(tempDir, 'x', 'y', 'z', 'missing.txt')),
      ).rejects.toThrow('File not found')
    })

    test('reads file with numbers', async () => {
      const testFile = path.join(tempDir, 'nums.txt')
      await fs.writeFile(testFile, '42', 'utf-8')
      const result = await readFileStrict(testFile)
      expect(result).toBe('42')
    })

    test('reads file with single newline', async () => {
      const testFile = path.join(tempDir, 'nl.txt')
      await fs.writeFile(testFile, '\n', 'utf-8')
      const result = await readFileStrict(testFile)
      expect(result).toBe('\n')
    })

    test('reads file after content update', async () => {
      const testFile = path.join(tempDir, 'update.txt')
      await fs.writeFile(testFile, 'original', 'utf-8')
      await fs.writeFile(testFile, 'updated', 'utf-8')
      const result = await readFileStrict(testFile)
      expect(result).toBe('updated')
    })

    test('throws error with "File not found" for empty path', async () => {
      await expect(readFileStrict('')).rejects.toThrow()
    })

    test('error message includes "read file" for non-ENOENT errors', async () => {
      const dirPath = path.join(tempDir, 'a-dir')
      await fs.mkdir(dirPath)
      try {
        await readFileStrict(dirPath)
        expect.fail('Should have thrown')
      } catch (error) {
        expect((error as Error).message).toContain('read file')
      }
    })

    test('reads file with very long single line', async () => {
      const testFile = path.join(tempDir, 'longline.txt')
      const longLine = 'x'.repeat(50000)
      await fs.writeFile(testFile, longLine, 'utf-8')
      const result = await readFileStrict(testFile)
      expect(result).toBe(longLine)
    })

    test('reads file with null bytes in content', async () => {
      const testFile = path.join(tempDir, 'nullbytes.txt')
      const content = 'before\0after'
      await fs.writeFile(testFile, content, 'utf-8')
      const result = await readFileStrict(testFile)
      expect(result).toBe(content)
    })

    test('reads file with mixed CRLF and LF', async () => {
      const testFile = path.join(tempDir, 'mixedendl.txt')
      const content = 'a\nb\r\nc\nd'
      await fs.writeFile(testFile, content, 'utf-8')
      const result = await readFileStrict(testFile)
      expect(result).toBe(content)
    })
  })

  describe('writeFileSafe', () => {
    test('writes file', async () => {
      const testFile = path.join(tempDir, 'test.txt')
      await writeFileSafe(testFile, 'content')
      const content = await fs.readFile(testFile, 'utf-8')
      expect(content).toBe('content')
    })

    test('creates parent directories', async () => {
      const nestedPath = path.join(tempDir, 'level1', 'level2', 'test.txt')
      await writeFileSafe(nestedPath, 'nested')
      const content = await fs.readFile(nestedPath, 'utf-8')
      expect(content).toBe('nested')
    })

    test('overwrites existing file', async () => {
      const testFile = path.join(tempDir, 'test.txt')
      await fs.writeFile(testFile, 'original', 'utf-8')
      await writeFileSafe(testFile, 'updated')
      const content = await fs.readFile(testFile, 'utf-8')
      expect(content).toBe('updated')
    })

    test('writes empty string', async () => {
      const testFile = path.join(tempDir, 'empty.txt')
      await writeFileSafe(testFile, '')
      const content = await fs.readFile(testFile, 'utf-8')
      expect(content).toBe('')
    })

    test('writes content with newlines', async () => {
      const testFile = path.join(tempDir, 'newlines.txt')
      const content = 'line1\nline2\nline3'
      await writeFileSafe(testFile, content)
      const result = await fs.readFile(testFile, 'utf-8')
      expect(result).toBe(content)
    })

    test('writes content with unicode', async () => {
      const testFile = path.join(tempDir, 'unicode.txt')
      const content = 'Hello 世界 🌍'
      await writeFileSafe(testFile, content)
      const result = await fs.readFile(testFile, 'utf-8')
      expect(result).toBe(content)
    })

    test('writes large content', async () => {
      const testFile = path.join(tempDir, 'large.txt')
      const largeContent = 'z'.repeat(100000)
      await writeFileSafe(testFile, largeContent)
      const result = await fs.readFile(testFile, 'utf-8')
      expect(result).toBe(largeContent)
    })

    test('creates single parent directory', async () => {
      const nestedPath = path.join(tempDir, 'subdir', 'test.txt')
      await writeFileSafe(nestedPath, 'content')
      const content = await fs.readFile(nestedPath, 'utf-8')
      expect(content).toBe('content')
    })

    test('creates deeply nested directories (5 levels)', async () => {
      const nestedPath = path.join(tempDir, 'a', 'b', 'c', 'd', 'e', 'test.txt')
      await writeFileSafe(nestedPath, 'deep')
      const content = await fs.readFile(nestedPath, 'utf-8')
      expect(content).toBe('deep')
    })

    test('writes JSON string', async () => {
      const testFile = path.join(tempDir, 'data.json')
      const jsonContent = JSON.stringify({ key: 'value' })
      await writeFileSafe(testFile, jsonContent)
      const result = await fs.readFile(testFile, 'utf-8')
      expect(result).toBe(jsonContent)
    })

    test('writes file with spaces in path', async () => {
      const spacedDir = path.join(tempDir, 'my dir')
      const testFile = path.join(spacedDir, 'my file.txt')
      await writeFileSafe(testFile, 'spaced')
      const result = await fs.readFile(testFile, 'utf-8')
      expect(result).toBe('spaced')
    })

    test('writes content with special characters', async () => {
      const testFile = path.join(tempDir, 'special.txt')
      const content = '!@#$%^&*()_+-=[]{}|;:,.<>?'
      await writeFileSafe(testFile, content)
      const result = await fs.readFile(testFile, 'utf-8')
      expect(result).toBe(content)
    })

    test('writes content with tabs', async () => {
      const testFile = path.join(tempDir, 'tabs.txt')
      const content = 'col1\tcol2\tcol3'
      await writeFileSafe(testFile, content)
      const result = await fs.readFile(testFile, 'utf-8')
      expect(result).toBe(content)
    })

    test('writes to existing directory without creating parent dirs', async () => {
      const testFile = path.join(tempDir, 'test.txt')
      await writeFileSafe(testFile, 'direct')
      const result = await fs.readFile(testFile, 'utf-8')
      expect(result).toBe('direct')
    })

    test('writes multiple files in sequence', async () => {
      const file1 = path.join(tempDir, 'file1.txt')
      const file2 = path.join(tempDir, 'file2.txt')
      const file3 = path.join(tempDir, 'file3.txt')
      await writeFileSafe(file1, 'one')
      await writeFileSafe(file2, 'two')
      await writeFileSafe(file3, 'three')
      expect(await fs.readFile(file1, 'utf-8')).toBe('one')
      expect(await fs.readFile(file2, 'utf-8')).toBe('two')
      expect(await fs.readFile(file3, 'utf-8')).toBe('three')
    })

    test('writes file with same name in different directories', async () => {
      const dir1 = path.join(tempDir, 'dir1')
      const dir2 = path.join(tempDir, 'dir2')
      const file1 = path.join(dir1, 'same.txt')
      const file2 = path.join(dir2, 'same.txt')
      await writeFileSafe(file1, 'content1')
      await writeFileSafe(file2, 'content2')
      expect(await fs.readFile(file1, 'utf-8')).toBe('content1')
      expect(await fs.readFile(file2, 'utf-8')).toBe('content2')
    })

    test('writes hidden file', async () => {
      const testFile = path.join(tempDir, '.hidden')
      await writeFileSafe(testFile, 'hidden content')
      const result = await fs.readFile(testFile, 'utf-8')
      expect(result).toBe('hidden content')
    })

    test('writes file with CRLF content', async () => {
      const testFile = path.join(tempDir, 'crlf.txt')
      const content = 'a\r\nb\r\nc'
      await writeFileSafe(testFile, content)
      const result = await fs.readFile(testFile, 'utf-8')
      expect(result).toBe(content)
    })

    test('writes file with emoji content', async () => {
      const testFile = path.join(tempDir, 'emoji.txt')
      const content = '🎉🎊🎈'
      await writeFileSafe(testFile, content)
      const result = await fs.readFile(testFile, 'utf-8')
      expect(result).toBe(content)
    })

    test('overwrites file twice', async () => {
      const testFile = path.join(tempDir, 'multi.txt')
      await writeFileSafe(testFile, 'first')
      await writeFileSafe(testFile, 'second')
      await writeFileSafe(testFile, 'third')
      const result = await fs.readFile(testFile, 'utf-8')
      expect(result).toBe('third')
    })

    test('error message contains resolved path for write failure', async () => {
      const readOnlyDir = path.join(tempDir, 'readonly')
      await fs.mkdir(readOnlyDir)
      await fs.chmod(readOnlyDir, 0o555)
      try {
        await writeFileSafe(path.join(readOnlyDir, 'sub', 'file.txt'), 'content')
        expect.fail('Should have thrown')
      } catch (error) {
        expect((error as Error).message).toContain('write file')
      } finally {
        await fs.chmod(readOnlyDir, 0o755)
      }
    })

    test('writes file with only whitespace', async () => {
      const testFile = path.join(tempDir, 'whitespace.txt')
      const content = '   \t\n  '
      await writeFileSafe(testFile, content)
      const result = await fs.readFile(testFile, 'utf-8')
      expect(result).toBe(content)
    })

    test('writes file with single character', async () => {
      const testFile = path.join(tempDir, 'single.txt')
      await writeFileSafe(testFile, 'x')
      const result = await fs.readFile(testFile, 'utf-8')
      expect(result).toBe('x')
    })
  })

  describe('fileExists', () => {
    test('returns true for existing file', async () => {
      const testFile = path.join(tempDir, 'test.txt')
      await fs.writeFile(testFile, 'content', 'utf-8')
      const exists = await fileExists(testFile)
      expect(exists).toBe(true)
    })

    test('returns false for non-existing file', async () => {
      const exists = await fileExists(path.join(tempDir, 'nonexistent.txt'))
      expect(exists).toBe(false)
    })

    test('returns false for directory', async () => {
      const dirPath = path.join(tempDir, 'testdir')
      await fs.mkdir(dirPath)
      const exists = await fileExists(dirPath)
      expect(exists).toBe(false)
    })

    test('throws for permission denied', async () => {
      const readOnlyDir = path.join(tempDir, 'readonly')
      await fs.mkdir(readOnlyDir)
      const restrictedFile = path.join(readOnlyDir, 'secret.txt')
      await fs.writeFile(restrictedFile, 'secret', 'utf-8')
      await fs.chmod(readOnlyDir, 0o555)
      try {
        await fileExists(restrictedFile)
      } catch (error) {
        expect((error as NodeJS.ErrnoException).code).toBe('EACCES')
      } finally {
        await fs.chmod(readOnlyDir, 0o755)
      }
    })

    test('returns true for file in nested directory', async () => {
      const nestedDir = path.join(tempDir, 'a', 'b')
      await fs.mkdir(nestedDir, { recursive: true })
      const testFile = path.join(nestedDir, 'file.txt')
      await fs.writeFile(testFile, 'content', 'utf-8')
      const exists = await fileExists(testFile)
      expect(exists).toBe(true)
    })

    test('returns false for file in non-existing directory', async () => {
      const exists = await fileExists(path.join(tempDir, 'no-dir', 'file.txt'))
      expect(exists).toBe(false)
    })

    test('returns true for hidden file', async () => {
      const testFile = path.join(tempDir, '.hidden')
      await fs.writeFile(testFile, 'hidden', 'utf-8')
      const exists = await fileExists(testFile)
      expect(exists).toBe(true)
    })

    test('returns true for file with extension', async () => {
      const testFile = path.join(tempDir, 'file.ts')
      await fs.writeFile(testFile, 'code', 'utf-8')
      const exists = await fileExists(testFile)
      expect(exists).toBe(true)
    })

    test('returns true for file without extension', async () => {
      const testFile = path.join(tempDir, 'noext')
      await fs.writeFile(testFile, 'data', 'utf-8')
      const exists = await fileExists(testFile)
      expect(exists).toBe(true)
    })

    test('returns false for deleted file', async () => {
      const testFile = path.join(tempDir, 'temp.txt')
      await fs.writeFile(testFile, 'temp', 'utf-8')
      await fs.unlink(testFile)
      const exists = await fileExists(testFile)
      expect(exists).toBe(false)
    })

    test('returns false for empty string path', async () => {
      const exists = await fileExists('')
      expect(exists).toBe(false)
    })

    test('returns true for file with spaces in name', async () => {
      const testFile = path.join(tempDir, 'file with spaces.txt')
      await fs.writeFile(testFile, 'spaced', 'utf-8')
      const exists = await fileExists(testFile)
      expect(exists).toBe(true)
    })

    test('returns true for file with unicode name', async () => {
      const testFile = path.join(tempDir, '文件.txt')
      await fs.writeFile(testFile, 'content', 'utf-8')
      const exists = await fileExists(testFile)
      expect(exists).toBe(true)
    })

    test('returns true for multiple existing files independently', async () => {
      const file1 = path.join(tempDir, 'a.txt')
      const file2 = path.join(tempDir, 'b.txt')
      await fs.writeFile(file1, 'a', 'utf-8')
      await fs.writeFile(file2, 'b', 'utf-8')
      expect(await fileExists(file1)).toBe(true)
      expect(await fileExists(file2)).toBe(true)
    })

    test('returns false for path that is a symlink to directory', async () => {
      const dirPath = path.join(tempDir, 'realdir')
      const linkPath = path.join(tempDir, 'linkdir')
      await fs.mkdir(dirPath)
      await fs.symlink(dirPath, linkPath)
      const exists = await fileExists(linkPath)
      expect(exists).toBe(false)
    })

    test('returns true for symlink to file', async () => {
      const realFile = path.join(tempDir, 'real.txt')
      const linkPath = path.join(tempDir, 'link.txt')
      await fs.writeFile(realFile, 'content', 'utf-8')
      await fs.symlink(realFile, linkPath)
      const exists = await fileExists(linkPath)
      expect(exists).toBe(true)
    })

    test('returns false for deeply nested non-existing path', async () => {
      const exists = await fileExists(path.join(tempDir, 'a', 'b', 'c', 'd', 'e.txt'))
      expect(exists).toBe(false)
    })

    test('returns true for file in directory with spaces', async () => {
      const spacedDir = path.join(tempDir, 'my dir')
      await fs.mkdir(spacedDir)
      const testFile = path.join(spacedDir, 'file.txt')
      await fs.writeFile(testFile, 'content', 'utf-8')
      const exists = await fileExists(testFile)
      expect(exists).toBe(true)
    })

    test('returns false for just directory name with trailing slash', async () => {
      const dirPath = path.join(tempDir, 'somedir')
      await fs.mkdir(dirPath)
      const exists = await fileExists(dirPath + path.sep)
      expect(exists).toBe(false)
    })
  })

  describe('directoryExists', () => {
    test('returns true for existing directory', async () => {
      const dirPath = path.join(tempDir, 'testdir')
      await fs.mkdir(dirPath)
      const exists = await directoryExists(dirPath)
      expect(exists).toBe(true)
    })

    test('returns false for non-existing directory', async () => {
      const exists = await directoryExists(path.join(tempDir, 'nonexistent'))
      expect(exists).toBe(false)
    })

    test('returns false for file', async () => {
      const filePath = path.join(tempDir, 'test.txt')
      await fs.writeFile(filePath, 'content', 'utf-8')
      const exists = await directoryExists(filePath)
      expect(exists).toBe(false)
    })

    test('throws for permission denied', async () => {
      const readOnlyParent = path.join(tempDir, 'readonlyparent')
      await fs.mkdir(readOnlyParent)
      await fs.chmod(readOnlyParent, 0o555)
      try {
        await directoryExists(path.join(readOnlyParent, 'subdir'))
      } catch (error) {
        expect((error as NodeJS.ErrnoException).code).toBe('EACCES')
      } finally {
        await fs.chmod(readOnlyParent, 0o755)
      }
    })

    test('returns true for nested directory', async () => {
      const dirPath = path.join(tempDir, 'parent', 'child')
      await fs.mkdir(dirPath, { recursive: true })
      const exists = await directoryExists(dirPath)
      expect(exists).toBe(true)
    })

    test('returns true for deeply nested directory', async () => {
      const dirPath = path.join(tempDir, 'a', 'b', 'c', 'd')
      await fs.mkdir(dirPath, { recursive: true })
      const exists = await directoryExists(dirPath)
      expect(exists).toBe(true)
    })

    test('returns false for file in subdirectory', async () => {
      const dirPath = path.join(tempDir, 'subdir')
      await fs.mkdir(dirPath)
      const filePath = path.join(dirPath, 'file.txt')
      await fs.writeFile(filePath, 'content', 'utf-8')
      expect(await directoryExists(dirPath)).toBe(true)
      expect(await directoryExists(filePath)).toBe(false)
    })

    test('returns true for hidden directory', async () => {
      const dirPath = path.join(tempDir, '.hidden')
      await fs.mkdir(dirPath)
      const exists = await directoryExists(dirPath)
      expect(exists).toBe(true)
    })

    test('returns false after directory is deleted', async () => {
      const dirPath = path.join(tempDir, 'tempdir')
      await fs.mkdir(dirPath)
      expect(await directoryExists(dirPath)).toBe(true)
      await fs.rmdir(dirPath)
      expect(await directoryExists(dirPath)).toBe(false)
    })

    test('returns true for directory with spaces in name', async () => {
      const dirPath = path.join(tempDir, 'my directory')
      await fs.mkdir(dirPath)
      const exists = await directoryExists(dirPath)
      expect(exists).toBe(true)
    })

    test('returns false for path with only slashes', async () => {
      const exists = await directoryExists('/')
      expect(exists).toBe(true) // root directory exists
    })

    test('returns true for directory created with ensureDirectory', async () => {
      const dirPath = path.join(tempDir, 'ensured')
      await ensureDirectory(dirPath)
      const exists = await directoryExists(dirPath)
      expect(exists).toBe(true)
    })

    test('returns false for nested non-existing directory', async () => {
      const exists = await directoryExists(path.join(tempDir, 'no', 'such', 'dir'))
      expect(exists).toBe(false)
    })

    test('returns true for parent directory of existing file', async () => {
      const subDir = path.join(tempDir, 'parent')
      await fs.mkdir(subDir)
      const testFile = path.join(subDir, 'file.txt')
      await fs.writeFile(testFile, 'content', 'utf-8')
      const exists = await directoryExists(subDir)
      expect(exists).toBe(true)
    })

    test('returns true for symlink to directory', async () => {
      const realDir = path.join(tempDir, 'real')
      const linkPath = path.join(tempDir, 'link')
      await fs.mkdir(realDir)
      await fs.symlink(realDir, linkPath)
      const exists = await directoryExists(linkPath)
      expect(exists).toBe(true)
    })

    test('returns false for symlink to file', async () => {
      const realFile = path.join(tempDir, 'file.txt')
      const linkPath = path.join(tempDir, 'link')
      await fs.writeFile(realFile, 'content', 'utf-8')
      await fs.symlink(realFile, linkPath)
      const exists = await directoryExists(linkPath)
      expect(exists).toBe(false)
    })

    test('returns true for directory with unicode name', async () => {
      const dirPath = path.join(tempDir, '文件夹')
      await fs.mkdir(dirPath)
      const exists = await directoryExists(dirPath)
      expect(exists).toBe(true)
    })
  })

  describe('ensureDirectory', () => {
    test('creates directory', async () => {
      const dirPath = path.join(tempDir, 'newdir')
      await ensureDirectory(dirPath)
      const exists = await directoryExists(dirPath)
      expect(exists).toBe(true)
    })

    test('works if directory exists', async () => {
      const dirPath = path.join(tempDir, 'existing')
      await fs.mkdir(dirPath)
      await expect(ensureDirectory(dirPath)).resolves.not.toThrow()
    })

    test('creates nested directories', async () => {
      const nestedPath = path.join(tempDir, 'l1', 'l2', 'l3')
      await ensureDirectory(nestedPath)
      const exists = await directoryExists(nestedPath)
      expect(exists).toBe(true)
    })

    test('throws for permission denied', async () => {
      const readOnlyDir = path.join(tempDir, 'readonly')
      await fs.mkdir(readOnlyDir)
      await fs.chmod(readOnlyDir, 0o555)
      try {
        await ensureDirectory(path.join(readOnlyDir, 'nested', 'dir'))
      } catch (error) {
        expect((error as Error).message).toContain('ensure directory')
      } finally {
        await fs.chmod(readOnlyDir, 0o755)
      }
    })

    test('creates directory with spaces in name', async () => {
      const dirPath = path.join(tempDir, 'my directory')
      await ensureDirectory(dirPath)
      const exists = await directoryExists(dirPath)
      expect(exists).toBe(true)
    })

    test('creates deeply nested directories (5 levels)', async () => {
      const dirPath = path.join(tempDir, 'a', 'b', 'c', 'd', 'e')
      await ensureDirectory(dirPath)
      const exists = await directoryExists(dirPath)
      expect(exists).toBe(true)
    })

    test('error message contains resolved path', async () => {
      const readOnlyDir = path.join(tempDir, 'readonly')
      await fs.mkdir(readOnlyDir)
      await fs.chmod(readOnlyDir, 0o555)
      try {
        await ensureDirectory(path.join(readOnlyDir, 'nested'))
        expect.fail('Should have thrown')
      } catch (error) {
        expect((error as Error).message).toContain(path.resolve(readOnlyDir))
      } finally {
        await fs.chmod(readOnlyDir, 0o755)
      }
    })

    test('creates multiple sibling directories', async () => {
      const dir1 = path.join(tempDir, 'sibling1')
      const dir2 = path.join(tempDir, 'sibling2')
      await ensureDirectory(dir1)
      await ensureDirectory(dir2)
      expect(await directoryExists(dir1)).toBe(true)
      expect(await directoryExists(dir2)).toBe(true)
    })

    test('idempotent - calling multiple times does not throw', async () => {
      const dirPath = path.join(tempDir, 'idem')
      await ensureDirectory(dirPath)
      await ensureDirectory(dirPath)
      await ensureDirectory(dirPath)
      const exists = await directoryExists(dirPath)
      expect(exists).toBe(true)
    })

    test('creates directory at root of temp', async () => {
      const dirPath = path.join(tempDir, 'root')
      await ensureDirectory(dirPath)
      const exists = await directoryExists(dirPath)
      expect(exists).toBe(true)
    })

    test('creates hidden directory', async () => {
      const dirPath = path.join(tempDir, '.hidden')
      await ensureDirectory(dirPath)
      const exists = await directoryExists(dirPath)
      expect(exists).toBe(true)
    })

    test('creates directory with unicode name', async () => {
      const dirPath = path.join(tempDir, '文件夹')
      await ensureDirectory(dirPath)
      const exists = await directoryExists(dirPath)
      expect(exists).toBe(true)
    })

    test('works after parent was already created', async () => {
      const parentPath = path.join(tempDir, 'parent')
      await ensureDirectory(parentPath)
      const childPath = path.join(parentPath, 'child')
      await ensureDirectory(childPath)
      expect(await directoryExists(childPath)).toBe(true)
    })

    test('creates very deeply nested directory (10 levels)', async () => {
      const parts = Array.from({ length: 10 }, (_, i) => `level${i}`)
      const dirPath = path.join(tempDir, ...parts)
      await ensureDirectory(dirPath)
      const exists = await directoryExists(dirPath)
      expect(exists).toBe(true)
    })
  })

  describe('deleteFile', () => {
    test('deletes existing file', async () => {
      const testFile = path.join(tempDir, 'test.txt')
      await fs.writeFile(testFile, 'content', 'utf-8')
      const deleted = await deleteFile(testFile)
      expect(deleted).toBe(true)
      const exists = await fileExists(testFile)
      expect(exists).toBe(false)
    })

    test('returns false for non-existing file', async () => {
      const deleted = await deleteFile(path.join(tempDir, 'nonexistent.txt'))
      expect(deleted).toBe(false)
    })

    test('throws for permission denied', async () => {
      const readOnlyDir = path.join(tempDir, 'readonly')
      await fs.mkdir(readOnlyDir)
      const restrictedFile = path.join(readOnlyDir, 'secret.txt')
      await fs.writeFile(restrictedFile, 'secret', 'utf-8')
      await fs.chmod(readOnlyDir, 0o555)
      try {
        await deleteFile(restrictedFile)
      } catch (error) {
        expect((error as Error).message).toContain('delete file')
      } finally {
        await fs.chmod(readOnlyDir, 0o755)
      }
    })

    test('deletes file in nested directory', async () => {
      const nestedDir = path.join(tempDir, 'nested')
      await fs.mkdir(nestedDir)
      const testFile = path.join(nestedDir, 'file.txt')
      await fs.writeFile(testFile, 'content', 'utf-8')
      const deleted = await deleteFile(testFile)
      expect(deleted).toBe(true)
      expect(await fileExists(testFile)).toBe(false)
    })

    test('deletes hidden file', async () => {
      const testFile = path.join(tempDir, '.hidden')
      await fs.writeFile(testFile, 'hidden', 'utf-8')
      const deleted = await deleteFile(testFile)
      expect(deleted).toBe(true)
      expect(await fileExists(testFile)).toBe(false)
    })

    test('deletes file with special characters in name', async () => {
      const testFile = path.join(tempDir, 'file with spaces.txt')
      await fs.writeFile(testFile, 'content', 'utf-8')
      const deleted = await deleteFile(testFile)
      expect(deleted).toBe(true)
    })

    test('error message contains resolved path for failure', async () => {
      const readOnlyDir = path.join(tempDir, 'readonly')
      await fs.mkdir(readOnlyDir)
      const restrictedFile = path.join(readOnlyDir, 'secret.txt')
      await fs.writeFile(restrictedFile, 'secret', 'utf-8')
      await fs.chmod(readOnlyDir, 0o555)
      try {
        await deleteFile(restrictedFile)
        expect.fail('Should have thrown')
      } catch (error) {
        expect((error as Error).message).toContain(path.resolve(restrictedFile))
      } finally {
        await fs.chmod(readOnlyDir, 0o755)
      }
    })

    test('deletes empty file', async () => {
      const testFile = path.join(tempDir, 'empty.txt')
      await fs.writeFile(testFile, '', 'utf-8')
      const deleted = await deleteFile(testFile)
      expect(deleted).toBe(true)
      expect(await fileExists(testFile)).toBe(false)
    })

    test('deletes only one file when multiple exist', async () => {
      const file1 = path.join(tempDir, 'file1.txt')
      const file2 = path.join(tempDir, 'file2.txt')
      await fs.writeFile(file1, 'a', 'utf-8')
      await fs.writeFile(file2, 'b', 'utf-8')
      await deleteFile(file1)
      expect(await fileExists(file1)).toBe(false)
      expect(await fileExists(file2)).toBe(true)
    })

    test('deletes file after reading it', async () => {
      const testFile = path.join(tempDir, 'read.txt')
      await fs.writeFile(testFile, 'content', 'utf-8')
      await fs.readFile(testFile, 'utf-8')
      const deleted = await deleteFile(testFile)
      expect(deleted).toBe(true)
    })

    test('returns false when deleting same file twice', async () => {
      const testFile = path.join(tempDir, 'double.txt')
      await fs.writeFile(testFile, 'content', 'utf-8')
      expect(await deleteFile(testFile)).toBe(true)
      expect(await deleteFile(testFile)).toBe(false)
    })

    test('deletes file with unicode name', async () => {
      const testFile = path.join(tempDir, '文件.txt')
      await fs.writeFile(testFile, 'content', 'utf-8')
      const deleted = await deleteFile(testFile)
      expect(deleted).toBe(true)
    })

    test('deletes large file', async () => {
      const testFile = path.join(tempDir, 'large.txt')
      await fs.writeFile(testFile, 'x'.repeat(100000), 'utf-8')
      const deleted = await deleteFile(testFile)
      expect(deleted).toBe(true)
      expect(await fileExists(testFile)).toBe(false)
    })

    test('deletes file with unicode content', async () => {
      const testFile = path.join(tempDir, 'unicode.txt')
      await fs.writeFile(testFile, 'Hello 世界 🌍', 'utf-8')
      const deleted = await deleteFile(testFile)
      expect(deleted).toBe(true)
    })

    test('returns false for deeply nested non-existing file', async () => {
      const result = await deleteFile(path.join(tempDir, 'a', 'b', 'c', 'missing.txt'))
      expect(result).toBe(false)
    })

    test('directory still exists after deleting file inside it', async () => {
      const dirPath = path.join(tempDir, 'dir')
      await fs.mkdir(dirPath)
      const testFile = path.join(dirPath, 'file.txt')
      await fs.writeFile(testFile, 'content', 'utf-8')
      await deleteFile(testFile)
      expect(await directoryExists(dirPath)).toBe(true)
    })
  })

  describe('listFiles', () => {
    test('lists all files', async () => {
      await fs.writeFile(path.join(tempDir, 'file1.txt'), 'c1', 'utf-8')
      await fs.writeFile(path.join(tempDir, 'file2.txt'), 'c2', 'utf-8')
      const files = await listFiles(tempDir)
      expect(files).toHaveLength(2)
    })

    test('filters by pattern', async () => {
      await fs.writeFile(path.join(tempDir, 'test.txt'), 'txt', 'utf-8')
      await fs.writeFile(path.join(tempDir, 'test.js'), 'js', 'utf-8')
      const txtFiles = await listFiles(tempDir, '*.txt')
      expect(txtFiles).toHaveLength(1)
    })

    test('returns empty array for empty directory', async () => {
      const files = await listFiles(tempDir)
      expect(files).toEqual([])
    })

    test('does not include directories', async () => {
      await fs.mkdir(path.join(tempDir, 'subdir'))
      await fs.writeFile(path.join(tempDir, 'file.txt'), 'c', 'utf-8')
      const files = await listFiles(tempDir)
      expect(files).toHaveLength(1)
    })

    test('throws for permission denied', async () => {
      const readOnlyDir = path.join(tempDir, 'readonly')
      await fs.mkdir(readOnlyDir)
      await fs.chmod(readOnlyDir, 0o000)
      try {
        await listFiles(readOnlyDir)
      } catch (error) {
        expect((error as Error).message).toContain('list files')
      } finally {
        await fs.chmod(readOnlyDir, 0o755)
      }
    })

    test('lists files with multiple different extensions', async () => {
      await fs.writeFile(path.join(tempDir, 'a.txt'), '', 'utf-8')
      await fs.writeFile(path.join(tempDir, 'b.js'), '', 'utf-8')
      await fs.writeFile(path.join(tempDir, 'c.ts'), '', 'utf-8')
      const files = await listFiles(tempDir)
      expect(files).toHaveLength(3)
    })

    test('lists hidden files', async () => {
      await fs.writeFile(path.join(tempDir, '.hidden'), 'h', 'utf-8')
      const files = await listFiles(tempDir)
      expect(files).toHaveLength(1)
    })

    test('pattern matches multiple files', async () => {
      await fs.writeFile(path.join(tempDir, 'a.txt'), '', 'utf-8')
      await fs.writeFile(path.join(tempDir, 'b.txt'), '', 'utf-8')
      await fs.writeFile(path.join(tempDir, 'c.js'), '', 'utf-8')
      const files = await listFiles(tempDir, '*.txt')
      expect(files).toHaveLength(2)
    })

    test('pattern matches no files', async () => {
      await fs.writeFile(path.join(tempDir, 'a.txt'), '', 'utf-8')
      const files = await listFiles(tempDir, '*.md')
      expect(files).toHaveLength(0)
    })

    test('pattern *.js matches .js extension', async () => {
      await fs.writeFile(path.join(tempDir, 'code.js'), '', 'utf-8')
      await fs.writeFile(path.join(tempDir, 'code.ts'), '', 'utf-8')
      const files = await listFiles(tempDir, '*.js')
      expect(files).toHaveLength(1)
      expect(files[0]).toContain('code.js')
    })

    test('pattern *.js does not match .ts files', async () => {
      await fs.writeFile(path.join(tempDir, 'app.ts'), '', 'utf-8')
      const files = await listFiles(tempDir, '*.js')
      expect(files).toHaveLength(0)
    })

    test('pattern test.* matches multiple extensions', async () => {
      await fs.writeFile(path.join(tempDir, 'test.txt'), '', 'utf-8')
      await fs.writeFile(path.join(tempDir, 'test.js'), '', 'utf-8')
      await fs.writeFile(path.join(tempDir, 'test.md'), '', 'utf-8')
      const files = await listFiles(tempDir, 'test.*')
      expect(files).toHaveLength(3)
    })

    test('returns absolute paths', async () => {
      await fs.writeFile(path.join(tempDir, 'file.txt'), '', 'utf-8')
      const files = await listFiles(tempDir)
      expect(files[0]).toBe(path.resolve(path.join(tempDir, 'file.txt')))
    })

    test('lists files with spaces in names', async () => {
      await fs.writeFile(path.join(tempDir, 'my file.txt'), '', 'utf-8')
      const files = await listFiles(tempDir)
      expect(files).toHaveLength(1)
    })

    test('handles many files', async () => {
      for (let i = 0; i < 50; i++) {
        await fs.writeFile(path.join(tempDir, `file${i}.txt`), '', 'utf-8')
      }
      const files = await listFiles(tempDir)
      expect(files).toHaveLength(50)
    })

    test('pattern * matches all files', async () => {
      await fs.writeFile(path.join(tempDir, 'a.txt'), '', 'utf-8')
      await fs.writeFile(path.join(tempDir, 'b.js'), '', 'utf-8')
      const files = await listFiles(tempDir, '*')
      expect(files).toHaveLength(2)
    })

    test('pattern *.json matches JSON files only', async () => {
      await fs.writeFile(path.join(tempDir, 'data.json'), '{}', 'utf-8')
      await fs.writeFile(path.join(tempDir, 'data.txt'), '{}', 'utf-8')
      const files = await listFiles(tempDir, '*.json')
      expect(files).toHaveLength(1)
      expect(files[0]).toContain('data.json')
    })

    test('does not list files in subdirectories', async () => {
      const subDir = path.join(tempDir, 'sub')
      await fs.mkdir(subDir)
      await fs.writeFile(path.join(subDir, 'nested.txt'), '', 'utf-8')
      await fs.writeFile(path.join(tempDir, 'top.txt'), '', 'utf-8')
      const files = await listFiles(tempDir)
      expect(files).toHaveLength(1)
    })

    test('throws with resolved path in error message for non-existing dir', async () => {
      const badDir = path.join(tempDir, 'no-dir')
      try {
        await listFiles(badDir)
        expect.fail('Should have thrown')
      } catch (error) {
        expect((error as Error).message).toContain(path.resolve(badDir))
      }
    })

    test('pattern matches exact filename without wildcard', async () => {
      await fs.writeFile(path.join(tempDir, 'exact.txt'), '', 'utf-8')
      await fs.writeFile(path.join(tempDir, 'other.txt'), '', 'utf-8')
      const files = await listFiles(tempDir, 'exact.txt')
      expect(files).toHaveLength(1)
      expect(files[0]).toContain('exact.txt')
    })

    test('pattern does not match partial filename', async () => {
      await fs.writeFile(path.join(tempDir, 'testfile.txt'), '', 'utf-8')
      const files = await listFiles(tempDir, 'test')
      expect(files).toHaveLength(0)
    })

    test('lists files created in sequence', async () => {
      const files = []
      for (let i = 0; i < 5; i++) {
        const name = `seq${i}.txt`
        await fs.writeFile(path.join(tempDir, name), String(i), 'utf-8')
        files.push(name)
      }
      const result = await listFiles(tempDir)
      expect(result).toHaveLength(5)
    })

    test('error message includes directory path', async () => {
      const readOnlyDir = path.join(tempDir, 'noread')
      await fs.mkdir(readOnlyDir)
      await fs.chmod(readOnlyDir, 0o000)
      try {
        await listFiles(readOnlyDir)
        expect.fail('Should have thrown')
      } catch (error) {
        expect((error as Error).message).toContain('list files')
      } finally {
        await fs.chmod(readOnlyDir, 0o755)
      }
    })

    test('returns empty array for directory with only subdirectories', async () => {
      await fs.mkdir(path.join(tempDir, 'dir1'))
      await fs.mkdir(path.join(tempDir, 'dir2'))
      const files = await listFiles(tempDir)
      expect(files).toEqual([])
    })

    test('pattern *.ts matches TypeScript files', async () => {
      await fs.writeFile(path.join(tempDir, 'app.ts'), '', 'utf-8')
      await fs.writeFile(path.join(tempDir, 'app.tsx'), '', 'utf-8')
      const files = await listFiles(tempDir, '*.ts')
      expect(files).toHaveLength(1)
      expect(files[0]).toContain('app.ts')
    })
  })

  describe('getFileInfo', () => {
    test('returns file info', async () => {
      const testFile = path.join(tempDir, 'test.txt')
      await fs.writeFile(testFile, 'Hello, World!', 'utf-8')
      const info = await getFileInfo(testFile)
      expect(info.path).toBe(path.resolve(testFile))
      expect(info.size).toBe(13)
      expect(info.isDirectory).toBe(false)
      expect(info.created).toBeInstanceOf(Date)
      expect(info.modified).toBeInstanceOf(Date)
    })

    test('returns directory info', async () => {
      const dirPath = path.join(tempDir, 'testdir')
      await fs.mkdir(dirPath)
      const info = await getFileInfo(dirPath)
      expect(info.path).toBe(path.resolve(dirPath))
      expect(info.isDirectory).toBe(true)
    })

    test('throws for non-existing file', async () => {
      await expect(getFileInfo(path.join(tempDir, 'nonexistent'))).rejects.toThrow('File not found')
    })

    test('works with empty file', async () => {
      const testFile = path.join(tempDir, 'empty.txt')
      await fs.writeFile(testFile, '', 'utf-8')
      const info = await getFileInfo(testFile)
      expect(info.size).toBe(0)
    })

    test('returns correct size for file with unicode', async () => {
      const testFile = path.join(tempDir, 'unicode.txt')
      const content = 'Hello 世界'
      await fs.writeFile(testFile, content, 'utf-8')
      const info = await getFileInfo(testFile)
      expect(info.size).toBe(Buffer.byteLength(content, 'utf-8'))
    })

    test('returns correct size for file with newlines', async () => {
      const testFile = path.join(tempDir, 'newlines.txt')
      const content = 'a\nb\nc'
      await fs.writeFile(testFile, content, 'utf-8')
      const info = await getFileInfo(testFile)
      expect(info.size).toBe(5)
    })

    test('returns absolute resolved path', async () => {
      const testFile = path.join(tempDir, 'test.txt')
      await fs.writeFile(testFile, 'content', 'utf-8')
      const info = await getFileInfo(testFile)
      expect(path.isAbsolute(info.path)).toBe(true)
    })

    test('returns valid Date objects for created and modified', async () => {
      const testFile = path.join(tempDir, 'dates.txt')
      await fs.writeFile(testFile, 'content', 'utf-8')
      const info = await getFileInfo(testFile)
      expect(info.created.getTime()).not.toBeNaN()
      expect(info.modified.getTime()).not.toBeNaN()
    })

    test('created date is a valid Date', async () => {
      const testFile = path.join(tempDir, 'time.txt')
      await fs.writeFile(testFile, 'content', 'utf-8')
      const info = await getFileInfo(testFile)
      expect(info.created).toBeInstanceOf(Date)
      expect(info.created.getTime()).toBeGreaterThan(0)
    })

    test('returns info for file in nested directory', async () => {
      const nestedDir = path.join(tempDir, 'a', 'b')
      await fs.mkdir(nestedDir, { recursive: true })
      const testFile = path.join(nestedDir, 'file.txt')
      await fs.writeFile(testFile, 'nested', 'utf-8')
      const info = await getFileInfo(testFile)
      expect(info.size).toBe(6)
      expect(info.isDirectory).toBe(false)
    })

    test('returns info for hidden file', async () => {
      const testFile = path.join(tempDir, '.hidden')
      await fs.writeFile(testFile, 'hidden', 'utf-8')
      const info = await getFileInfo(testFile)
      expect(info.path).toBe(path.resolve(testFile))
      expect(info.isDirectory).toBe(false)
    })

    test('throws with resolved path in error message', async () => {
      const missingFile = path.join(tempDir, 'missing.txt')
      try {
        await getFileInfo(missingFile)
        expect.fail('Should have thrown')
      } catch (error) {
        expect((error as Error).message).toContain(path.resolve(missingFile))
      }
    })

    test('returns info for file with spaces in name', async () => {
      const testFile = path.join(tempDir, 'my file.txt')
      await fs.writeFile(testFile, 'content', 'utf-8')
      const info = await getFileInfo(testFile)
      expect(info.isDirectory).toBe(false)
    })

    test('returns info for large file', async () => {
      const testFile = path.join(tempDir, 'large.txt')
      const content = 'x'.repeat(10000)
      await fs.writeFile(testFile, content, 'utf-8')
      const info = await getFileInfo(testFile)
      expect(info.size).toBe(10000)
    })

    test('directory info isDirectory is true', async () => {
      const dirPath = path.join(tempDir, 'mydir')
      await fs.mkdir(dirPath)
      const info = await getFileInfo(dirPath)
      expect(info.isDirectory).toBe(true)
      expect(info.path).toBe(path.resolve(dirPath))
    })

    test('returns info for file with emoji content', async () => {
      const testFile = path.join(tempDir, 'emoji.txt')
      const content = '🎉🎊🎈'
      await fs.writeFile(testFile, content, 'utf-8')
      const info = await getFileInfo(testFile)
      expect(info.size).toBe(Buffer.byteLength(content, 'utf-8'))
    })

    test('returns info for file with special characters in name', async () => {
      const testFile = path.join(tempDir, 'file-with_special.chars.txt')
      await fs.writeFile(testFile, 'data', 'utf-8')
      const info = await getFileInfo(testFile)
      expect(info.size).toBe(4)
    })

    test('returns isDirectory false for regular file', async () => {
      const testFile = path.join(tempDir, 'regular.txt')
      await fs.writeFile(testFile, 'regular', 'utf-8')
      const info = await getFileInfo(testFile)
      expect(info.isDirectory).toBe(false)
    })

    test('returns correct size after file content changes', async () => {
      const testFile = path.join(tempDir, 'change.txt')
      await fs.writeFile(testFile, 'short', 'utf-8')
      await fs.writeFile(testFile, 'much longer content here', 'utf-8')
      const info = await getFileInfo(testFile)
      expect(info.size).toBe(24)
    })

    test('returns info for symlink to file', async () => {
      const realFile = path.join(tempDir, 'real.txt')
      const linkPath = path.join(tempDir, 'link.txt')
      await fs.writeFile(realFile, 'content', 'utf-8')
      await fs.symlink(realFile, linkPath)
      const info = await getFileInfo(linkPath)
      expect(info.size).toBe(7)
    })

    test('returns info for symlink to directory', async () => {
      const realDir = path.join(tempDir, 'realdir')
      const linkPath = path.join(tempDir, 'linkdir')
      await fs.mkdir(realDir)
      await fs.symlink(realDir, linkPath)
      const info = await getFileInfo(linkPath)
      expect(info.isDirectory).toBe(true)
    })
  })

  describe('readJsonFile', () => {
    test('reads valid JSON file', async () => {
      const testFile = path.join(tempDir, 'test.json')
      await fs.writeFile(testFile, JSON.stringify({ name: 'test', value: 42 }), 'utf-8')
      const result = await readJsonFile<{ name: string; value: number }>(testFile)
      expect(result).toEqual({ name: 'test', value: 42 })
    })

    test('returns null for non-existing file', async () => {
      const result = await readJsonFile(path.join(tempDir, 'nonexistent.json'))
      expect(result).toBeNull()
    })

    test('reads array JSON', async () => {
      const testFile = path.join(tempDir, 'array.json')
      await fs.writeFile(testFile, JSON.stringify([1, 2, 3]), 'utf-8')
      const result = await readJsonFile<number[]>(testFile)
      expect(result).toEqual([1, 2, 3])
    })

    test('reads nested JSON', async () => {
      const testFile = path.join(tempDir, 'nested.json')
      const nested = { level1: { level2: { level3: 'deep' } } }
      await fs.writeFile(testFile, JSON.stringify(nested), 'utf-8')
      const result = await readJsonFile(testFile)
      expect(result).toEqual(nested)
    })

    test('throws for invalid JSON', async () => {
      const testFile = path.join(tempDir, 'invalid.json')
      await fs.writeFile(testFile, 'not valid json', 'utf-8')
      await expect(readJsonFile(testFile)).rejects.toThrow()
    })

    test('reads empty object JSON', async () => {
      const testFile = path.join(tempDir, 'empty.json')
      await fs.writeFile(testFile, '{}', 'utf-8')
      const result = await readJsonFile(testFile)
      expect(result).toEqual({})
    })

    test('reads JSON string value', async () => {
      const testFile = path.join(tempDir, 'string.json')
      await fs.writeFile(testFile, JSON.stringify('hello world'), 'utf-8')
      const result = await readJsonFile<string>(testFile)
      expect(result).toBe('hello world')
    })

    test('reads JSON number value', async () => {
      const testFile = path.join(tempDir, 'number.json')
      await fs.writeFile(testFile, JSON.stringify(42), 'utf-8')
      const result = await readJsonFile<number>(testFile)
      expect(result).toBe(42)
    })

    test('reads JSON boolean true value', async () => {
      const testFile = path.join(tempDir, 'true.json')
      await fs.writeFile(testFile, JSON.stringify(true), 'utf-8')
      const result = await readJsonFile<boolean>(testFile)
      expect(result).toBe(true)
    })

    test('reads JSON boolean false value', async () => {
      const testFile = path.join(tempDir, 'false.json')
      await fs.writeFile(testFile, JSON.stringify(false), 'utf-8')
      const result = await readJsonFile<boolean>(testFile)
      expect(result).toBe(false)
    })

    test('reads JSON null value', async () => {
      const testFile = path.join(tempDir, 'null.json')
      await fs.writeFile(testFile, JSON.stringify(null), 'utf-8')
      const result = await readJsonFile(testFile)
      expect(result).toBeNull()
    })

    test('reads JSON with nested arrays', async () => {
      const testFile = path.join(tempDir, 'nested-array.json')
      const data = {
        items: [
          [1, 2],
          [3, 4],
          [5, 6],
        ],
      }
      await fs.writeFile(testFile, JSON.stringify(data), 'utf-8')
      const result = await readJsonFile(testFile)
      expect(result).toEqual(data)
    })

    test('reads JSON with mixed types', async () => {
      const testFile = path.join(tempDir, 'mixed.json')
      const data = { str: 'hello', num: 42, bool: true, nil: null, arr: [1, 2, 3] }
      await fs.writeFile(testFile, JSON.stringify(data), 'utf-8')
      const result = await readJsonFile(testFile)
      expect(result).toEqual(data)
    })

    test('reads JSON array of objects', async () => {
      const testFile = path.join(tempDir, 'obj-array.json')
      const data = [
        { id: 1, name: 'a' },
        { id: 2, name: 'b' },
      ]
      await fs.writeFile(testFile, JSON.stringify(data), 'utf-8')
      const result = await readJsonFile(testFile)
      expect(result).toEqual(data)
    })

    test('reads JSON with special characters in strings', async () => {
      const testFile = path.join(tempDir, 'special.json')
      const data = { text: 'hello\nworld\ttab' }
      await fs.writeFile(testFile, JSON.stringify(data), 'utf-8')
      const result = await readJsonFile(testFile)
      expect(result).toEqual(data)
    })

    test('reads JSON with escaped characters', async () => {
      const testFile = path.join(tempDir, 'escaped.json')
      const data = { path: 'C:\\Users\\test', quote: 'say "hello"' }
      await fs.writeFile(testFile, JSON.stringify(data), 'utf-8')
      const result = await readJsonFile(testFile)
      expect(result).toEqual(data)
    })

    test('reads JSON with unicode strings', async () => {
      const testFile = path.join(tempDir, 'unicode.json')
      const data = { greeting: '你好世界', emoji: '🎉' }
      await fs.writeFile(testFile, JSON.stringify(data), 'utf-8')
      const result = await readJsonFile(testFile)
      expect(result).toEqual(data)
    })

    test('throws for truncated JSON', async () => {
      const testFile = path.join(tempDir, 'truncated.json')
      await fs.writeFile(testFile, '{"key":', 'utf-8')
      await expect(readJsonFile(testFile)).rejects.toThrow()
    })

    test('throws for JSON with trailing comma', async () => {
      const testFile = path.join(tempDir, 'trailing.json')
      await fs.writeFile(testFile, '{"key": "value",}', 'utf-8')
      await expect(readJsonFile(testFile)).rejects.toThrow()
    })

    test('reads empty array JSON', async () => {
      const testFile = path.join(tempDir, 'empty-arr.json')
      await fs.writeFile(testFile, '[]', 'utf-8')
      const result = await readJsonFile(testFile)
      expect(result).toEqual([])
    })

    test('reads JSON with whitespace formatting', async () => {
      const testFile = path.join(tempDir, 'pretty.json')
      const data = { key: 'value' }
      await fs.writeFile(testFile, JSON.stringify(data, null, 2), 'utf-8')
      const result = await readJsonFile(testFile)
      expect(result).toEqual(data)
    })

    test('reads JSON with multiple keys', async () => {
      const testFile = path.join(tempDir, 'multi.json')
      const data: Record<string, number> = {}
      for (let i = 0; i < 100; i++) {
        data[`key${i}`] = i
      }
      await fs.writeFile(testFile, JSON.stringify(data), 'utf-8')
      const result = await readJsonFile(testFile)
      expect(result).toEqual(data)
    })

    test('returns null for non-existing file in nested path', async () => {
      const result = await readJsonFile(path.join(tempDir, 'a', 'b', 'c.json'))
      expect(result).toBeNull()
    })

    test('reads large JSON file', async () => {
      const testFile = path.join(tempDir, 'large.json')
      const data = Array.from({ length: 1000 }, (_, i) => ({ id: i, value: `item${i}` }))
      await fs.writeFile(testFile, JSON.stringify(data), 'utf-8')
      const result = await readJsonFile(testFile)
      expect(result).toEqual(data)
    })

    test('reads JSON with deep nesting', async () => {
      const testFile = path.join(tempDir, 'deep.json')
      let data: Record<string, unknown> = { value: 'deep' }
      for (let i = 0; i < 20; i++) {
        data = { level: i, child: data }
      }
      await fs.writeFile(testFile, JSON.stringify(data), 'utf-8')
      const result = await readJsonFile(testFile)
      expect(result).toEqual(data)
    })

    test('reads JSON with numeric string keys in object', async () => {
      const testFile = path.join(tempDir, 'numkeys.json')
      const data = { '1': 'one', '2': 'two', '3': 'three' }
      await fs.writeFile(testFile, JSON.stringify(data), 'utf-8')
      const result = await readJsonFile(testFile)
      expect(result).toEqual(data)
    })

    test('reads JSON with empty string value', async () => {
      const testFile = path.join(tempDir, 'emptystr.json')
      const data = { key: '' }
      await fs.writeFile(testFile, JSON.stringify(data), 'utf-8')
      const result = await readJsonFile(testFile)
      expect(result).toEqual(data)
    })

    test('reads JSON with zero value', async () => {
      const testFile = path.join(tempDir, 'zero.json')
      const data = { value: 0 }
      await fs.writeFile(testFile, JSON.stringify(data), 'utf-8')
      const result = await readJsonFile(testFile)
      expect(result).toEqual(data)
    })

    test('reads JSON with negative numbers', async () => {
      const testFile = path.join(tempDir, 'negative.json')
      const data = { value: -42, float: -3.14 }
      await fs.writeFile(testFile, JSON.stringify(data), 'utf-8')
      const result = await readJsonFile(testFile)
      expect(result).toEqual(data)
    })

    test('reads JSON with floating point numbers', async () => {
      const testFile = path.join(tempDir, 'float.json')
      const data = { pi: 3.14159, e: 2.71828 }
      await fs.writeFile(testFile, JSON.stringify(data), 'utf-8')
      const result = await readJsonFile(testFile)
      expect(result).toEqual(data)
    })

    test('throws for single word invalid JSON', async () => {
      const testFile = path.join(tempDir, 'word.json')
      await fs.writeFile(testFile, 'undefined', 'utf-8')
      await expect(readJsonFile(testFile)).rejects.toThrow()
    })

    test('reads JSON file in nested directory', async () => {
      const nestedDir = path.join(tempDir, 'config')
      await fs.mkdir(nestedDir)
      const testFile = path.join(nestedDir, 'settings.json')
      const data = { theme: 'dark' }
      await fs.writeFile(testFile, JSON.stringify(data), 'utf-8')
      const result = await readJsonFile(testFile)
      expect(result).toEqual(data)
    })

    test('throws for JSON with unquoted keys', async () => {
      const testFile = path.join(tempDir, 'unquoted.json')
      await fs.writeFile(testFile, '{key: "value"}', 'utf-8')
      await expect(readJsonFile(testFile)).rejects.toThrow()
    })

    test('throws for JSON with comments', async () => {
      const testFile = path.join(tempDir, 'comments.json')
      await fs.writeFile(testFile, '{/* comment */ "key": "value"}', 'utf-8')
      await expect(readJsonFile(testFile)).rejects.toThrow()
    })

    test('reads JSON with very long string value', async () => {
      const testFile = path.join(tempDir, 'longstr.json')
      const longStr = 'a'.repeat(10000)
      const data = { value: longStr }
      await fs.writeFile(testFile, JSON.stringify(data), 'utf-8')
      const result = await readJsonFile(testFile)
      expect(result).toEqual(data)
    })
  })
})
