export interface WasmParserConfig {
  wasmModulePath: string
  fallbackToNative: boolean
  memoryLimit: number
  threads: number
}

export const DEFAULT_WASM_CONFIG: WasmParserConfig = {
  wasmModulePath: './parser.wasm',
  fallbackToNative: true,
  memoryLimit: 256 * 1024 * 1024,
  threads: 1,
}

export interface WasmParseResult {
  success: boolean
  ast: unknown
  duration: number
  memoryUsed: number
  fromWasm: boolean
  errors: string[]
}

export interface WasmModuleExports {
  parse(inputPtr: number, inputLen: number, outputPtr: number): number
  allocate(size: number): number
  deallocate(ptr: number, size: number): void
  getMemory(): WebAssembly.Memory
  getVersion(): number
}
