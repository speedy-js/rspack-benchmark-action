import path from 'path';
import fs from 'fs-extra';

import {
  PerformancePluginFixture,
  PluginBenchmark,
  RunFixtureCtxt,
} from '../base';

const speedyCIPluginDev: [importStr: string, plugin: string] = [
  `import { RspackCIPluginDev } from "${path.resolve(
    __dirname,
    '../../speedy/plugins/RspackCIPluginDev'
  )}"`,
  'RspackCIPluginDev()',
];
const speedyESBuild: [importStr: string, plugin: string] = [
  '',
  `{
  name: 'local-esbuild',
  apply(compiler) {
    compiler.hooks.esbuild.tap('esbuild', () => {
      const speedyEsbuild = require('@speedy-js/esbuild')
      return  speedyEsbuild;
    });
  },
}`,
];

class HotReload extends PerformancePluginFixture {
  static id = 'hot-reload';
  static title = 'Hot reload';

  async runEach({
    tmpBenchmarkDir,
  }: RunFixtureCtxt): Promise<PluginBenchmark | void> {
    const devProfile = path.join(
      tmpBenchmarkDir,
      'speedy-benchmark-dev-profile.json'
    );
    const speedyConfig = await this.getRspackConfig(tmpBenchmarkDir);

    await speedyConfig
      .addPlugin(...speedyCIPluginDev)
      .setCache({
        transform: false,
      })
      .write();

    await this.runRspack(tmpBenchmarkDir, 'dev');

    await speedyConfig.restore();

    const hotReloadWithoutCache = await fs.readJSON(devProfile);

    await speedyConfig
      .addPlugin(...speedyCIPluginDev)
      .setCache({
        transform: true,
      })
      .write();

    await this.runRspack(tmpBenchmarkDir, 'dev');

    await speedyConfig.restore();

    const hotReloadWithCache = await fs.readJSON(devProfile);

    await speedyConfig
      .addPlugin(...speedyESBuild)
      .addPlugin(...speedyCIPluginDev)
      .setCache({
        transform: false,
      })
      .write();

    await this.runRspack(tmpBenchmarkDir, 'dev');

    await speedyConfig.restore();

    const hotReloadWithCustomizedESBuildNoCache = await fs.readJSON(devProfile);

    await speedyConfig
      .addPlugin(...speedyESBuild)
      .addPlugin(...speedyCIPluginDev)
      .setCache({
        transform: true,
      })
      .write();

    await this.runRspack(tmpBenchmarkDir, 'dev');

    await speedyConfig.restore();

    const hotReloadWithCustomizedESBuildAndCache = await fs.readJSON(
      devProfile
    );

    const nocache1 = hotReloadWithoutCache[0][1] - hotReloadWithoutCache[0][0];
    const nocache2 = hotReloadWithoutCache[1][1] - hotReloadWithoutCache[1][0];
    const nocache3 = hotReloadWithoutCache[2][1] - hotReloadWithoutCache[2][0];
    const nocacheAvg = (nocache1 + nocache2 + nocache3) / 3;

    const cache1 = hotReloadWithCache[0][1] - hotReloadWithCache[0][0];
    const cache2 = hotReloadWithCache[1][1] - hotReloadWithCache[1][0];
    const cache3 = hotReloadWithCache[2][1] - hotReloadWithCache[2][0];
    const cacheAvg = (cache1 + cache2 + cache3) / 3;

    const esbuildNoCache1 =
      hotReloadWithCustomizedESBuildNoCache[0][1] -
      hotReloadWithCustomizedESBuildNoCache[0][0];
    const esbuildNoCache2 =
      hotReloadWithCustomizedESBuildNoCache[1][1] -
      hotReloadWithCustomizedESBuildNoCache[1][0];
    const esbuildNoCache3 =
      hotReloadWithCustomizedESBuildNoCache[2][1] -
      hotReloadWithCustomizedESBuildNoCache[2][0];
    const esbuildNoCacheAvg =
      (esbuildNoCache1 + esbuildNoCache2 + esbuildNoCache3) / 3;

    const esbuildCache1 =
      hotReloadWithCustomizedESBuildAndCache[0][1] -
      hotReloadWithCustomizedESBuildAndCache[0][0];
    const esbuildCache2 =
      hotReloadWithCustomizedESBuildAndCache[1][1] -
      hotReloadWithCustomizedESBuildAndCache[1][0];
    const esbuildCache3 =
      hotReloadWithCustomizedESBuildAndCache[2][1] -
      hotReloadWithCustomizedESBuildAndCache[2][0];
    const esbuildCacheAvg = (esbuildCache1 + esbuildCache2 + esbuildCache3) / 3;

    return {
      metrics: [
        {
          id: 'hot-reload-nocache-avg',
          title: 'Reload(avg of 3)',
          value: nocacheAvg,
          format: 'ms',
        },
        {
          id: 'hot-reload-cache-avg',
          title: 'Reload(cached, avg of 3)',
          value: cacheAvg,
          format: 'ms',
        },
        {
          id: 'hot-reload-nocache-esbuild-avg',
          title: 'Reload(nocache-custom-esbuild, avg of 3)',
          value: esbuildNoCacheAvg,
          format: 'ms',
        },
        {
          id: 'hot-reload-cache-esbuild-avg',
          title: 'Reload(cached-custom-esbuild, avg of 3)',
          value: esbuildCacheAvg,
          format: 'ms',
        },
      ],
    };
  }
}

export { HotReload };
