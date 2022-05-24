import path from 'path'
import fs from 'fs-extra'

// getDirSize recursively gets size of all files in a directory
async function getDirSize (dir: string, ctx: { size?: number; filter?: (filePath: string) => boolean } = {}) {
  ctx.size = ctx.size || 0
  let subDirs = await fs.readdir(dir)
  subDirs = subDirs.map((d) => path.join(dir, d))

  await Promise.all(
    subDirs.map(async (curDir) => {
      if (typeof ctx.filter === 'function' && !ctx.filter(curDir)) return

      const fileStat = await fs.stat(curDir)
      if (fileStat.isDirectory()) {
        return getDirSize(curDir, ctx)
      }
      ctx.size! += fileStat.size
    })
  )

  return ctx.size!
}

export { getDirSize }
