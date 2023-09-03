import typescript from '@rollup/plugin-typescript'
import pkg from './package.json' assert { type: 'json' }
import json from '@rollup/plugin-json'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import replace from '@rollup/plugin-replace'

export default {
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'cjs',
    banner: '#!/usr/bin/env node'
  },
  external: [
    'tslib',
    'child_process',
    'axios'
  ],
  plugins: [
    typescript({ exclude: 'node_modules' }),
    nodeResolve({ exportConditions: ['node'], preferBuiltins: false }),
    commonjs({ includes: 'node_modules/**' }),
    json(),
    replace({
      VERSION: JSON.stringify(pkg.version)
    })
  ]
}
