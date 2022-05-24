import path from 'path';
import fs from 'fs-extra';

import { getDirFileSize } from '../../utils';
import {
  PerformancePluginFixture,
  RunFixtureCtxt,
  PluginBenchmark,
} from '../base';

class DistSizePlugin extends PerformancePluginFixture {
  static id = 'dist-size-plugin';
  static title = 'Dist size';

  async runEach({
    tmpBenchmarkDir,
  }: RunFixtureCtxt): Promise<PluginBenchmark | void> {
    // TODO: configurable dist dir
    const dirPath = path.join(tmpBenchmarkDir, 'dist');

    if (!dirPath || !(await fs.pathExists(dirPath))) {
      await this.runRspack(tmpBenchmarkDir, 'build');
    }

    const distFileSize = await getDirFileSize(dirPath);

    const metrics = distFileSize
      .map((file) => {
        return {
          id: file.path,
          title: file.path,
          value: file.size,
          format: 'bytes',
        } as const;
      })
      .sort((a, b) => {
        return a.title.length - b.title.length;
      });

    return {
      metrics,
    };
  }
}

export { DistSizePlugin };
