import path from 'path'
import fs from 'fs-extra'

import { logger } from './logger'

const getEntryPoint = async (dir: string) => {
  logger(`getting entry point for dir: ${dir}`)

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const pkg = require(path.join(dir, 'package.json'))
  logger.json(pkg)

  const mainField = pkg && pkg.main

  if (!mainField) {
    return null
  }

  const mainPath = path.resolve(dir, mainField)

  let entryDir
  const mainFieldCasted = mainField.split('/')

  if (mainFieldCasted && mainFieldCasted.length === 1) {
    if (!path.basename(mainFieldCasted[0])) {
      throw new Error('Entry point is invalid')
    }
    entryDir = dir
  } else {
    entryDir = mainPath.replace(mainFieldCasted.slice(1).join('/'), '')
  }

  if (entryDir) {
    await fs.ensureDir(entryDir)
  }

  return entryDir
}

export { getEntryPoint }
