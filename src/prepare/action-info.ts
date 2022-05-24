import path from 'path'
import { execSync } from 'child_process'

import { logger, getLastCommitId } from '../utils'

export default function getActionInfo () {
  let {
    ISSUE_ID,
    SKIP_CLONE,
    GITHUB_REF,
    LOCAL_STATS,
    GIT_ROOT_DIR,
    GITHUB_ACTION,
    GITHUB_BASE_REF,
    COMMENT_ENDPOINT,
    GITHUB_REPOSITORY,
    GITHUB_EVENT_PATH,
    PR_STATS_COMMENT_TOKEN
  } = process.env as { [key: string]: string }

  // only use custom endpoint if we don't have a token
  const commentEndpoint = !PR_STATS_COMMENT_TOKEN && COMMENT_ENDPOINT

  if (LOCAL_STATS === 'true') {
    const cwd = process.cwd()
    const parentDir = path.join(cwd, '../..')

    if (!GITHUB_REF) {
      // get the current branch name
      GITHUB_REF = execSync(`cd "${cwd}" && git rev-parse --abbrev-ref HEAD`).toString().trim()
    }
    if (!GIT_ROOT_DIR) {
      GIT_ROOT_DIR = path.join(parentDir, '/')
    }
    if (!GITHUB_REPOSITORY) {
      GITHUB_REPOSITORY = path.relative(parentDir, cwd)
    }
    if (!GITHUB_ACTION) {
      GITHUB_ACTION = 'opened'
    }
  }

  const info = {
    commentEndpoint: commentEndpoint as any,
    skipClone: SKIP_CLONE,
    actionName: GITHUB_ACTION,
    githubToken: PR_STATS_COMMENT_TOKEN,
    customCommentEndpoint: !!commentEndpoint,
    gitRoot: GIT_ROOT_DIR || 'https://github.com/',
    prRepo: GITHUB_REPOSITORY,
    prRef: GITHUB_REF,
    prTargetRef: GITHUB_BASE_REF,
    isLocal: LOCAL_STATS,
    commitId: null,
    issueId: ISSUE_ID
  }

  // get comment
  if (GITHUB_EVENT_PATH) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const event = require(GITHUB_EVENT_PATH)
    info.actionName = event.action || info.actionName

    // Since GITHUB_REPOSITORY and REF might not match the fork
    // use event data to get repository and ref info
    const prData = event.pull_request

    if (prData) {
      info.prRepo = prData.head.repo.full_name
      info.prRef = prData.head.ref
      info.issueId = prData.number

      if (!info.commentEndpoint) {
        info.commentEndpoint = prData._links.comments || ''
      }
      // comment endpoint might be under `href`
      if (typeof info.commentEndpoint === 'object') {
        info.commentEndpoint = info.commentEndpoint.href
      }
    }
  }

  logger('Got actionInfo:')
  logger.json({
    ...info,
    githubToken: PR_STATS_COMMENT_TOKEN ? 'found' : 'missing'
  })

  return info
}

export const actionInfo = getActionInfo()
