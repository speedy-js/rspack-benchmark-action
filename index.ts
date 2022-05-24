import fs from 'fs-extra'

import { run, tmpRoot, isDebug } from './src/run'

if (isDebug) {
  console.log('Running speedy benchmark action in debug mode...')
}

run().then(() => {
  if (isDebug) {
    console.log('Done!')
  } else {
    console.log('Done!')
    console.log('Cleaning tmp dir...', tmpRoot)
    fs.removeSync(tmpRoot)
  }
}).catch((e) => {
  console.log('Error encountered', e)

  if (isDebug) {
    console.log('Debug mode, skip cleaning tmp dir...', tmpRoot)
    console.log('If this error keeps happening, please report it to issue tracker, or run `pnpm clean:debug && pnpm setup:debug` and try again')
  } else {
    console.log('Cleaning tmp dir...', tmpRoot)
    fs.removeSync(tmpRoot)
  }

  process.nextTick(() => process.exit(1))
})
