import { createBabelInputPluginFactory } from '@rollup/plugin-babel'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import image from '@rollup/plugin-image'
import html from 'rollup-plugin-html'
import postcss from 'rollup-plugin-postcss'
import livereload from 'rollup-plugin-livereload'
import serve from 'rollup-plugin-serve'
import filesize from 'rollup-plugin-filesize'
import size from 'rollup-plugin-sizes'
import visualize from 'rollup-plugin-visualizer'
import { terser } from 'rollup-plugin-terser'
import pkg from './package.json'
import babelConfig from './babel.config.json'

const dev = !!process.env.DEV
const analyzeBundle = !!process.env.ANALYZE_BUNDLE
const minimize = !!process.env.MINIMIZE

const babelPluginForUMDBundle = createBabelInputPluginFactory()
const babelPluginForESMBundle = createBabelInputPluginFactory()
const babelPluginOptions = { ...babelConfig, exclude: 'node_modules/**', babelHelpers: 'bundled' }

const plugins = [
  image({ dom: true }),
  html(),
  postcss(),
  size(),
  filesize(),
  dev && serve({ contentBase: ['dist', 'public'], host: '0.0.0.0', port: '8080' }),
  dev && livereload({ watch: ['dist', 'public'] }),
  analyzeBundle && visualize({ open: true }),
]

const mainBundle = {
  input: 'src/main.js',
  external: ['@clappr/core'],
  output: [
    {
      name: 'MediaControl',
      file: pkg.main,
      format: 'umd',
      globals: { '@clappr/core': 'Clappr' },
    },
    minimize && {
      name: 'MediaControl',
      file: 'dist/clappr-media-control-plugin.min.js',
      format: 'umd',
      globals: { '@clappr/core': 'Clappr' },
      plugins: terser(),
    },
  ],
  plugins: [babelPluginForUMDBundle(babelPluginOptions), resolve(), commonjs(), ...plugins],
}

const esmBundle = {
  input: 'src/main.js',
  external: ['@clappr/core', /@babel\/runtime/],
  output: {
    name: 'MediaControl',
    file: pkg.module,
    format: 'esm',
    globals: { '@clappr/core': 'Clappr' },
  },
  plugins: [
    babelPluginForESMBundle({
      ...babelPluginOptions,
      plugins: ['@babel/plugin-transform-runtime'],
      babelHelpers: 'runtime',
    }),
    ...plugins,
  ],
}

const lightBundle = {
  input: 'src/light_bundle.js',
  external: ['@clappr/core'],
  output: [
    {
      name: 'MediaControl',
      file: 'dist/light-clappr-media-control-plugin.js',
      format: 'umd',
      globals: { '@clappr/core': 'Clappr' },
    },
    minimize && {
      name: 'MediaControl',
      file: 'dist/light-clappr-media-control-plugin.min.js',
      format: 'umd',
      globals: { '@clappr/core': 'Clappr' },
      plugins: terser(),
    },
  ],
  plugins: [babelPluginForUMDBundle(babelPluginOptions), resolve(), commonjs(), ...plugins],
}

const lightEsmBundle = {
  input: 'src/light_bundle.js',
  external: ['@clappr/core', /@babel\/runtime/],
  output: {
    name: 'MediaControl',
    file: 'dist/light-clappr-media-control-plugin.esm.js',
    format: 'esm',
    globals: { '@clappr/core': 'Clappr' },
  },
  plugins: [
    babelPluginForESMBundle({
      ...babelPluginOptions,
      plugins: ['@babel/plugin-transform-runtime'],
      babelHelpers: 'runtime',
    }),
    ...plugins,
  ],
}

const mainBundles = [mainBundle, esmBundle]
const lightBundles = [lightBundle, lightEsmBundle]
const bundles = minimize ? [...mainBundles, ...lightBundles] : [...mainBundles]

export default bundles
