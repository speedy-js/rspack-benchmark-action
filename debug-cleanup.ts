import fs from 'fs-extra'

import { tmpRoot } from './debug-setup'

console.log('Cleaning tmp debug dir...', tmpRoot)

fs.removeSync(tmpRoot)
