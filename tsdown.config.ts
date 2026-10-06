import type { UserConfig } from 'tsdown'

const neverBundle = [
  /^node:/,
  /^@deepseek-ai\//,
  'react',
  'react/jsx-runtime',
  'react-dom',
]

const config: UserConfig = [
  {
    entry: { index: 'src/index.ts' },
    format: ['esm'],
    platform: 'node',
    outDir: 'lib',
    clean: false,
    dts: false,
    sourcemap: false,
    deps: { neverBundle },
    outputOptions: {
      entryFileNames: 'index.js',
    },
  },
  {
    // Plain ESM for Node verify scripts (no ModuleLoader banner).
    entry: { detectCoords: 'src/client/detectCoords.ts' },
    format: ['esm'],
    platform: 'neutral',
    outDir: 'lib',
    clean: false,
    dts: false,
    sourcemap: false,
    deps: { neverBundle },
    outputOptions: {
      entryFileNames: 'detectCoords.js',
    },
  },
  {
    entry: { client: 'src/client/index.ts' },
    format: ['cjs'],
    platform: 'browser',
    outDir: 'lib',
    clean: false,
    dts: false,
    sourcemap: true,
    deps: { neverBundle },
    outputOptions: {
      entryFileNames: 'client.js',
      // ModuleLoader factory receives require(); keep CommonJS requires.
      format: 'cjs',
      exports: 'named',
      banner: `window.__ModuleLoader__.load({ id: ${JSON.stringify('dsh-file-upload-ocr-plugin')}, factory: (require) => {`,
      footer: 'return module.exports;\n} });',
      intro: 'var module = { exports: {} };\nvar exports = module.exports;',
    },
  },
]

export default config
