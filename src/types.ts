import { Metric, Project } from './performance-plugins/base';

export interface BenchmarkConfig {
  name: string;
  directory: string;
}

export type BenchmarkConfigs = Array<BenchmarkConfig>;

export type RspackBenchmark = {
  pluginId: string;
  pkg: Project;
  metrics: Metric[];
};

export type FixtureBenchmark = {
  pluginId: string;
  fixture: BenchmarkConfig;
  metrics: Metric[];
};

// helper types
export type MergeIntersection<T> = T extends object
  ? {
      [K in keyof T]: T[K] extends object ? MergeIntersection<T[K]> : T[K];
    }
  : T;

export type ArrayType<T extends any[]> = T extends (infer U)[] ? U : never;
