import path from 'path'
import fs from 'fs-extra'

import { BenchmarkConfig, MergeIntersection } from '../types'
import { CategorizedProjects, RushKit, runCommand } from '../utils'
import type { RspackPackages, RspackProject } from '../run'

export interface MetricNumber {
  value: number
  format: 'ms' | 'bytes'
}

// Metrics for markdown
export interface MetricString {
  value: string
}

export type Metric = MergeIntersection<
  {
    /* id under plugin */
    id: string
    /* title of generated metrics, which will be used in benchmark results */
    title?: string
  } & (MetricNumber | MetricString)
>;

export interface PluginBenchmark {
  /* Metrics generated by plugin, multiple metrics can be provided */
  metrics: Metric[]
}

export type PluginBenchmarks = Array<PluginBenchmark | null>;

export interface RunRspackCtxt {
  /* current testing project */
  pkg: RspackProject
}

export interface RunFixtureCtxt {
  benchmarkConfig: BenchmarkConfig
  tmpBenchmarkDir: string
  rspackBin: string
}

export type PluginRspackFinalize = () => {
  title: string
  columns: string[]
  data: string[]
};

abstract class PerformancePluginRspack {
  static id: string;
  static title: string;
  abstract runEach(project: RspackProject): Promise<PluginBenchmark | void>;
}

export type PluginFixtureFinalize = () => void;

abstract class PerformancePluginFixture {
  static id: string;
  static title: string;
  abstract runEach(ctxt: RunFixtureCtxt): Promise<PluginBenchmark | void>;
  checkFixtureStatus ({ tmpBenchmarkDir }: RunFixtureCtxt) {
    const configPath = path.join(tmpBenchmarkDir, 'speedy.config.ts')

    if (!fs.existsSync(configPath)) {
      throw new Error(
        `Unable to find speedy config file for package: ${tmpBenchmarkDir}, at ${configPath}`
      )
    }

    return {
      configPath
    }
  }

  // getRspackConfig (tmpBenchmarkDir: string, configRelPath?: string) {
  //   const configPath = path.join(
  //     tmpBenchmarkDir,
  //     configRelPath || 'speedy.config.ts'
  //   )

  //   if (!fs.existsSync(configPath)) {
  //     throw new Error(
  //       `Unable to find speedy config file for package: ${tmpBenchmarkDir}, at ${configPath}`
  //     )
  //   }

  //   return new RspackConfig(configPath)
  // }

  runRspack (
    bin: string,
    cwd: string,
    command: 'dev' | 'build' | (string & {}),
    args: string[] = []
  ) {
    return runCommand(
      bin,
      [command, cwd, ...args],
      {
        cwd: cwd
      }
    )
  }
}

export { PerformancePluginFixture, PerformancePluginRspack, RspackProject }