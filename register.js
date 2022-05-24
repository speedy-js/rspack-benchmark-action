/* eslint-disable @typescript-eslint/no-var-requires */

const os = require('os')
const path = require('path')
const fs = require('fs-extra')
const { register } = require('esbuild-register/dist/node')

if (process.env.NODE_ENV === 'debug') {
  const tmpRoot = path.join(os.homedir(), '.tmp/rspack-benchmark-action')

  if (!fs.existsSync(tmpRoot)) {
    throw new Error(`tmp root ${tmpRoot} does not exist, please run \`pnpm setup:debug\` first.`)
  }

  process.env.RSPACK_BENCH_TMP = tmpRoot
  process.env.GITHUB_REPOSITORY = 'speedy-js/rspack'
  process.env.GITHUB_REF = 'main'
}

const define = Object.keys(process.env).reduce((o, key) => {
  if (!key.startsWith('SPEEDY_BENCH_')) {
    return o
  }

  return {
    ...o,
    ['process.env.' + key]: JSON.stringify(process.env[key])
  }
}, {
  'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
})

register({
  target: 'node12',
  sourcemap: 'inline',
  define
})
