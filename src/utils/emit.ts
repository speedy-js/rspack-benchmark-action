import fs from 'fs-extra'
import path from 'path'

const emitAssets = (filename: string, content: string) => {
  const destDir = path.resolve(__dirname, '../../assets')
  fs.ensureDirSync(destDir)
  fs.writeFileSync(path.resolve(destDir, filename), content, 'utf-8')
}

export { emitAssets }
