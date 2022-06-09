import os from 'os'
import path from 'path'
import fs from 'fs-extra'

import { runCommand } from './src/utils/exec'

export const tmpRoot = path.join(os.homedir(), '.tmp/rspack-benchmark-action')

const USE_SSH =
  typeof process.env.USE_SSH !== 'undefined'
    ? process.env.USE_SSH === 'true'
    : true
const RSPACK_REPO = USE_SSH
  ? 'git@github.com:speedy-js/rspack.git'
  : 'https://github.com/speedy-js/rspack.git'
const FIXTURE_REPO = USE_SSH
  ? 'git@github.com:speedy-js/rspack.git'
  : 'https://github.com/speedy-js/rspack.git'
const PR_DIR = path.join(tmpRoot, '.tmp/pr')
const MAIN_DIR = path.join(tmpRoot, '.tmp/main')
const FIXTURE_DIR = path.join(tmpRoot, '.tmp/__speedy_fixtures__')

const git = {
  async clone (repoUrl: string, dest: string) {
    await runCommand('git', ['clone', repoUrl, dest])
  },
  async checkout (ref: string, repoDir: string) {
    const exists = await fs.pathExists(repoDir)
    if (!exists) {
      return console.warn('Repo dir does not exist: ', repoDir)
    }

    await runCommand('git', ['fetch'], {
      cwd: repoDir
    })
    await runCommand('git', ['checkout', ref], {
      cwd: repoDir
    })
  }
}

const yarn = {
  async install (cwd: string) {
    const exists = await fs.pathExists(cwd)
    if (!exists) {
      throw new Error(
        `Cannot install yarn deps in ${cwd}, directory does not exist`
      )
    }

    return runCommand('yarn', ['install'], {
      cwd
    })
  },
  async build (cwd: string) {
    const exists = await fs.pathExists(cwd)
    if (!exists) {
      throw new Error(
        `Cannot initiate yarn build in ${cwd}, directory does not exist`
      )
    }

    return runCommand('yarn', ['build:core'], {
      cwd
    })
  }
}

const prepareRspackCopies = async () => {
  const prepareRspack = async (dir: string, ref:string) => {
    await git.clone(RSPACK_REPO, dir)
    await git.checkout(ref, dir)
    await yarn.install(dir)
    await yarn.build(dir)
  }

  await Promise.all([prepareRspack(MAIN_DIR, 'main'), prepareRspack(PR_DIR, 'add-ast-hint')])
}

const prepareFixtureCopies = async () => {
  await git.clone(FIXTURE_REPO, FIXTURE_DIR)

  const sourceBenchmarkDir = FIXTURE_DIR
  const tmpBenchmarkDir = path.join(tmpRoot, '.tmp/benchmarks')
  await fs.copy(sourceBenchmarkDir, tmpBenchmarkDir, { recursive: true })
  await yarn.install(tmpBenchmarkDir)
}

const run = async () => {
  await fs.ensureDir(tmpRoot)

  await prepareRspackCopies()
  await prepareFixtureCopies()
}

run()
  .then(() => {
    console.log()
    console.log()
    console.log(
      'Debug setup complete, you can now run the benchmarks with `pnpm action:debug`'
    )
  })
  .catch((e) => {
    console.error('Error encountered on debug setup:', e)
    fs.remove(tmpRoot)
    process.exit(1)
  })
