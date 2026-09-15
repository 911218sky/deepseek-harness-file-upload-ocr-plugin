/**
 * Standalone tsdown config for this plugin (no monorepo clientBundle import).
 * Host: ESM Node entry. Client: ModuleLoader factory with CSS Modules via lightningcss.
 */
import { readFile } from 'node:fs/promises'
import { dirname, isAbsolute, resolve as resolvePath } from 'node:path'
import { fileURLToPath } from 'node:url'
import { transform } from 'lightningcss'
import { defineConfig } from 'tsdown'

const PACKAGE_ID = 'dsh-file-upload-ocr-plugin'
const ROOT = dirname(fileURLToPath(import.meta.url))

const CSS_VIRTUAL_PREFIX = '\0dsh-css:'
const CSS_VIRTUAL_SUFFIX = '.mjs'

const CLIENT_EXTERNALS = [
  'react',
  'react/jsx-runtime',
  'react-dom',
  'react-dom/client',
  /^@deepseek-ai\//,
]

function styleInjectionModule(
  id: string,
  fileId: string,
  css: string,
  classMap?: Readonly<Record<string, string>>,
): string {
  const source = [
    `const css = ${JSON.stringify(css)};`,
    `const tagId = ${JSON.stringify(`${id}/${fileId.split(/[\\/]/).slice(-1)[0]}`)};`,
    'if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {',
    '  const tag = document.createElement("style");',
    `  tag.dataset.plugin = ${JSON.stringify(id)};`,
    '  tag.dataset.pluginCss = tagId;',
    '  tag.textContent = css;',
    '  document.head.appendChild(tag);',
    '}',
  ]
  if (classMap === undefined) {
    source.push('export {};')
  } else {
    source.push(`export default ${JSON.stringify(classMap)};`)
  }
  return source.join('\n')
}

function cssModulesPlugin(id: string) {
  return {
    name: 'dsh-css-modules',
    resolveId(source: string, importer: string | undefined) {
      if (!source.endsWith('.module.css')) return null
      const abs = importer !== undefined
        ? (isAbsolute(source) ? source : resolvePath(dirname(importer), source))
        : resolvePath(ROOT, source)
      return CSS_VIRTUAL_PREFIX + abs + CSS_VIRTUAL_SUFFIX
    },
    async load(virtualId: string) {
      if (!virtualId.startsWith(CSS_VIRTUAL_PREFIX)) return null
      const fileId = virtualId.slice(CSS_VIRTUAL_PREFIX.length, -CSS_VIRTUAL_SUFFIX.length)
      this.addWatchFile(fileId)
      const source = await readFile(fileId)
      const { code, exports: cssExports } = transform({
        filename: fileId,
        code: source,
        cssModules: { pattern: '[hash]_[local]' },
        minify: true,
      })
      const classMap: Record<string, string> = {}
      for (const [local, exp] of Object.entries(cssExports ?? {})) {
        classMap[local] = exp.name
      }
      return styleInjectionModule(id, fileId, code.toString(), classMap)
    },
  }
}

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: 'esm',
    outDir: 'lib',
    platform: 'node',
    dts: false,
    sourcemap: false,
    clean: false,
    external: [/^node:/, /^@deepseek-ai\//],
    outputOptions: {
      entryFileNames: 'index.js',
    },
  },
  {
    entry: ['src/client/index.ts'],
    format: ['cjs'],
    outDir: 'lib',
    platform: 'browser',
    dts: false,
    sourcemap: true,
    clean: false,
    external: CLIENT_EXTERNALS,
    plugins: [cssModulesPlugin(PACKAGE_ID)],
    outputOptions: {
      entryFileNames: 'client.js',
      format: 'cjs',
      banner: `window.__ModuleLoader__.load({ id: ${JSON.stringify(PACKAGE_ID)}, factory: (require) => {`,
      footer: 'return module.exports; } });',
      intro: 'var module = { exports: {} }; var exports = module.exports;',
    },
  },
])
