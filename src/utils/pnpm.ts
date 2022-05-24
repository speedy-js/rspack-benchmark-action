import fs from 'fs-extra'

import { runCommand } from '../utils/exec'

async function link (cwd: string, pkgName?: string) {
  const exists = await fs.pathExists(cwd)
  if (!exists) {
    throw new Error(`Cannot link pnpm pkg in ${cwd}, directory does not exist`)
  }

  const args = ['link']
  if (pkgName) {
    args.push(pkgName)
  }

  return runCommand('pnpm', args, {
    cwd
  })
}

async function install (cwd: string) {
  const exists = await fs.pathExists(cwd)
  if (!exists) {
    throw new Error(`Cannot install pnpm deps in ${cwd}, directory does not exist`)
  }

  return runCommand('pnpm', ['install'], {
    cwd
  })
}

async function add (cwd: string, pkgs: string[], { dev }: {
  dev?: boolean
} = { dev: false }) {
  const exists = await fs.pathExists(cwd)
  if (!exists) {
    throw new Error(`Cannot install pnpm deps in ${cwd}, directory does not exist`)
  }

  return runCommand('pnpm', ['add', ...pkgs, dev ? '--save-dev' : ''], {
    cwd
  })
}

async function unlink (cwd: string, pkgName?: string) {
  const exists = await fs.pathExists(cwd)
  if (!exists) {
    throw new Error(`Cannot unlink pnpm pkg in ${cwd}, directory does not exist`)
  }

  const args = ['unlink']
  if (pkgName) {
    args.push(pkgName)
  }

  return runCommand('pnpm', args, {
    cwd
  })
}

const pnpm = {
  link,
  install,
  add,
  unlink
}

export { link as pnpmLink, install as pnpmInstall, unlink as pnpmUnlink, add as pnpmAdd, pnpm }
