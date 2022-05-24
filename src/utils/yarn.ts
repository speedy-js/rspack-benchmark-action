import fs from 'fs-extra'

import { runCommand } from '../utils/exec'

async function link (cwd: string, pkgName?: string) {
  const exists = await fs.pathExists(cwd)
  if (!exists) {
    throw new Error(`Cannot link yarn pkg in ${cwd}, directory does not exist`)
  }

  const args = ['link']
  if (pkgName) {
    args.push(pkgName)
  }

  return runCommand('yarn', args, {
    cwd
  })
}

async function install (cwd: string) {
  const exists = await fs.pathExists(cwd)
  if (!exists) {
    throw new Error(`Cannot install yarn deps in ${cwd}, directory does not exist`)
  }

  return runCommand('yarn', ['install'], {
    cwd
  })
}

async function unlink (cwd: string, pkgName?: string) {
  const exists = await fs.pathExists(cwd)
  if (!exists) {
    throw new Error(`Cannot unlink yarn pkg in ${cwd}, directory does not exist`)
  }

  const args = ['unlink']
  if (pkgName) {
    args.push(pkgName)
  }

  return runCommand('yarn', args, {
    cwd
  })
}

const yarn = {
  link,
  install,
  unlink
}

export { link as yarnLink, install as yarnInstall, unlink as yarnUnlink, yarn }
