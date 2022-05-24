/* eslint-disable @typescript-eslint/no-var-requires */
import fs from 'fs-extra'
import path from 'path'

import { runCommand } from './exec'
import { profileRepoDir } from '../run'

export const writeProfileToGitHubWithRetry = async (profilePath: string) => {
  const name = path.basename(profilePath)
  const profile = path.join(profileRepoDir, name)

  const exist = fs.existsSync(profile)

  if (exist) {
    console.log('profile exists, skipping upload', name)
    return
  } else {
    await fs.move(profilePath, profile)
  }

  let count = 3
  while (count--) {
    try {
      await runCommand('git', ['status'], {
        cwd: profileRepoDir
      })
      await runCommand('git', ['add', profile], {
        cwd: profileRepoDir
      })
      await runCommand('git', [
        '-c',
        'user.name=speedy-benchmark-action',
        '-c',
        'user.email=github@users.noreply.github.com',
        'commit',
        '-m',
        `add ${name} profile for ${require('../prepare/action-info').prRef}`
      ], {
        cwd: profileRepoDir
      })
      await require('../prepare/repo-setup').push('main', 'speedy-js/speedy-profiles', profileRepoDir)

      return
    } catch (e) {
      console.log(`Failed to upload profile, ${count} retries left`)
      console.log('upload profile error', e)
    }
  }

  console.log('Failed to upload profile, giving up...')
}
