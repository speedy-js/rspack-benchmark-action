import path from 'path'

import {
  PerformancePluginFixture,
  PluginBenchmark,
  RunFixtureCtxt
} from '../base'

class ColdStartPlugin extends PerformancePluginFixture {
  static id = 'cold-start-plugin';
  static title = 'Cold start';

  async runEach ({
    tmpBenchmarkDir,
    rspackBin
  }: RunFixtureCtxt): Promise<PluginBenchmark | void> {
    const startTime1 = Date.now()
    await this.runRspack(rspackBin, tmpBenchmarkDir, 'build')
    const endTime1 = Date.now()

    const startTime2 = Date.now()
    await this.runRspack(rspackBin, tmpBenchmarkDir, 'build')
    const endTime2 = Date.now()

    const startTime3 = Date.now()
    await this.runRspack(rspackBin, tmpBenchmarkDir, 'build')
    const endTime3 = Date.now()

    return {
      metrics: [
        {
          id: 'cold-start-diff',
          title: 'Cold Start Diff',
          value: ((endTime3 - startTime3) + (endTime2 - startTime2) + (endTime1 - startTime1)) / 3,
          format: 'ms'
        }
      ]
    }
  }
}

export { ColdStartPlugin }
