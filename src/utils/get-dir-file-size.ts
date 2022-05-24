import fs from 'fs-extra'
import path from 'path'

interface FileSize {
  path: string
  size: number
}

const helper = async (fullDir: string, baseDir = ''): Promise<FileSize[]> => {
  const dirent = await fs.readdir(fullDir, { withFileTypes: true })

  return dirent.reduce<Promise<FileSize[]>>(async (result, curr) => {
    if (curr.isFile()) {
      return [
        ...await result,
        {
          path: path.join(baseDir, curr.name),
          size: (await fs.stat(path.join(fullDir, curr.name))).size
        }
      ]
    }

    if (curr.isDirectory()) {
      return [
        ...await result,
        ...await helper(path.join(fullDir, curr.name), path.join(baseDir, curr.name))
      ]
    }

    return result
  }, Promise.resolve([]))
}

const getDirFileSize = async (dir: string): Promise<FileSize[]> => {
  if (!fs.pathExists(dir)) {
    throw new Error(`Dir ${dir} does not exist`)
  }

  return helper(dir)
}

export { getDirFileSize }
