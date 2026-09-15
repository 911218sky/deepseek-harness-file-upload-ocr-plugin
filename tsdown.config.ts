import { readFile } from 'node:fs/promises'
import { dirname, resolve as resolvePath } from 'node:path'
import { transform } from 'lightningcss'
import type { UserConfig } from 'tsdown'

const PACKAGE_ID = 'dsh-file-upload-ocr-plugin'
const CSS_VIRTUAL_PREFIX = '\0dsh-css:'
const CSS_VIRTUAL_SUFFIX = '.mjs'

function styleInjectionModule(
  fileId: string,
  css: string,
  classMap?: Readonly<Record<string, string>>,
): string {
  const tagId = `${PACKAGE_ID}/${fileId.split(/[\\/]/).slice(-1)[0]}`
  const lines = [
    `const css = ${JSON.stringify(css)};`,
    `const tagId = ${JSON.stringify(tagId)};`,
    'if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {',
    '  const tag = document.createElement("style");',
    `  tag.dataset.plugin = ${JSON.stringify(PACKAGE_ID)};`,
    '  tag.dataset.pluginCss = tagId;',
    '  tag.textContent = css;',
    '  document.head.appendChild(tag);',
    '}',
  ]
  if (classMap !== undefined) {
    lines.push(`module.exports = ${JSON.stringify(classMap)};`)
  } else {
    lines.push('module.exports = {};')
  }
  return lines.join('\n')
}

const cssModulesPlugin = {
  name: 'dsh-css-modules',
  resolveId(source: string, importer: string | undefined) {
    if (!source.endsWith('.module.css')) return null
    const abs = importer !== undefined ? resolvePath(dirname(importer), source) : resolvePath(source)
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
    return styleInjectionModule(fileId, code.toString(), classMap)
  },
}

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
    entry: { client: 'src/client/index.ts' },
    format: ['cjs'],
    platform: 'browser',
    outDir: 'lib',
    clean: false,
    dts: false,
    sourcemap: true,
    deps: { neverBundle },
    plugins: [cssModulesPlugin],
    outputOptions: {
      entryFileNames: 'client.js',
      // ModuleLoader factory receives require(); keep CommonJS requires.
      format: 'cjs',
      exports: 'named',
      banner: `window.__ModuleLoader__.load({ id: ${JSON.stringify(PACKAGE_ID)}, factory: (require) => {`,
      footer: 'return module.exports;\n} });',
      intro: 'var module = { exports: {} };\nvar exports = module.exports;',
    },
  },
]

export default config
