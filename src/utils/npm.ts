import fs from 'fs-extra'

import { runCommand } from '../utils/exec'

async function link (cwd: string, pkgName?: string) {
  const exists = await fs.pathExists(cwd)
  if (!exists) {
    throw new Error(`Cannot link npm pkg in ${cwd}, directory does not exist`)
  }

  const args = ['link']
  if (pkgName) {
    args.push(pkgName)
  }

  return runCommand('npm', args, {
    cwd
  })
}

async function install (cwd: string) {
  const exists = await fs.pathExists(cwd)
  if (!exists) {
    throw new Error(`Cannot install npm deps in ${cwd}, directory does not exist`)
  }

  return runCommand('npm', ['install'], {
    cwd
  })
}

async function unlink (cwd: string, pkgName?: string) {
  const exists = await fs.pathExists(cwd)
  if (!exists) {
    throw new Error(`Cannot unlink npm pkg in ${cwd}, directory does not exist`)
  }

  const args = ['unlink']
  if (pkgName) {
    args.push(pkgName)
  }

  return runCommand('npm', args, {
    cwd
  })
}

const npm = {
  link,
  install,
  unlink
}

export { link as npmLink, install as npmInstall, unlink as npmUnlink, npm }
