import { Metric, MetricNumber, Project } from '../performance-plugins/base'

import { BenchmarkConfig, FixtureBenchmark, RspackBenchmark } from '../types'

export type MetricComparison = {
  id: string
  title?: string
  diff: number
  format?: MetricNumber['format']
};

const compareMetrics = (mainMetrics: Metric[], prMetrics: Metric[]) => {
  const results: MetricComparison[] = []

  for (let i = 0; i < mainMetrics.length; i++) {
    const mainMetric = mainMetrics[i]
    const prMetric = prMetrics[i]

    if ('format' in mainMetric && 'format' in prMetric) {
      results.push({
        id: mainMetric.id,
        title: mainMetric.title,
        diff: prMetric.value - mainMetric.value,
        format: mainMetric.format
      })
    }

    // String metrics are not comparable
  }

  return results
}

const compareRspackBenchmark = (
  mainBenchmark: RspackBenchmark,
  prBenchmark: RspackBenchmark
) => {
  const mainMetrics = mainBenchmark.metrics
  const prMetrics = prBenchmark.metrics

  return compareMetrics(mainMetrics, prMetrics)
}

function categorizeRspackBenchmark (
  mainBenchmarks: RspackBenchmark[],
  prBenchmarks: RspackBenchmark[]
) {
  const categorized: {
    [pluginId: string]: [
      main: RspackBenchmark | null,
      pr: RspackBenchmark | null
    ][]
  } = {}

  for (let i = 0; i < mainBenchmarks.length; i++) {
    const mainBenchmark = mainBenchmarks[i]
    categorized[mainBenchmark.pluginId] =
      categorized[mainBenchmark.pluginId] || []
    categorized[mainBenchmark.pluginId].push([mainBenchmark, null])
  }

  for (let i = 0; i < prBenchmarks.length; i++) {
    const prBenchmark = prBenchmarks[i]
    categorized[prBenchmark.pluginId] = categorized[prBenchmark.pluginId] || []
    const mainBenchmarkRecord = categorized[prBenchmark.pluginId].find(
      (item) =>
        item[0]?.pluginId === prBenchmark.pluginId &&
        item[0]?.pkg.packageName === prBenchmark.pkg.packageName
    )

    if (mainBenchmarkRecord) {
      mainBenchmarkRecord[1] = prBenchmark
    } else {
      categorized[prBenchmark.pluginId].push([null, prBenchmark])
    }
  }

  return categorized
}

export type RspackBenchmarkCompared = {
  [pluginId: string]: {
    /* comparedMetric will skip if either of raw benchmarks not exist */
    metricsCmped: MetricComparison[] | null
    raw: [main: RspackBenchmark | null, pr: RspackBenchmark | null]
    pkg: Project
    pluginId: string
  }[]
};

const compareRspackBenchmarks = (
  mainBenchmarks: RspackBenchmark[],
  prBenchmarks: RspackBenchmark[]
): RspackBenchmarkCompared => {
  const categorized = categorizeRspackBenchmark(mainBenchmarks, prBenchmarks)
  const compared: RspackBenchmarkCompared = {}

  for (const [pluginId, catedBenchmarks] of Object.entries(categorized)) {
    compared[pluginId] = catedBenchmarks.reduce<
      RspackBenchmarkCompared[keyof RspackBenchmarkCompared]
    >((acc, item) => {
      return [
        ...acc,
        {
          metricsCmped:
            item[0] && item[1]
              ? compareRspackBenchmark(item[0], item[1])
              : null,
          raw: item,
          /* At least either of them would exist */
          pkg: (item[0]?.pkg || item[1]?.pkg)!,
          pluginId: (item[0]?.pluginId || item[1]?.pluginId)!
        }
      ]
    }, [])
  }

  return compared
}

export type FixtureBenchmarkCompared = {
  [pluginId: string]: {
    /* comparedMetric will skip if either of raw benchmarks not exist */
    metricsCmped: MetricComparison[] | null
    raw: [main: FixtureBenchmark | null, pr: FixtureBenchmark | null]
    fixture: BenchmarkConfig
    pluginId: string
  }[]
};

const compareFixtureBenchmark = (
  mainBenchmark: FixtureBenchmark,
  prBenchmark: FixtureBenchmark
) => {
  const mainMetrics = mainBenchmark.metrics
  const prMetrics = prBenchmark.metrics

  return compareMetrics(mainMetrics, prMetrics)
}

function categorizeFixtureBenchmark (
  mainBenchmarks: FixtureBenchmark[],
  prBenchmarks: FixtureBenchmark[]
) {
  const categorized: {
    [pluginId: string]: [
      main: FixtureBenchmark | null,
      pr: FixtureBenchmark | null
    ][]
  } = {}

  for (let i = 0; i < mainBenchmarks.length; i++) {
    const mainBenchmark = mainBenchmarks[i]
    categorized[mainBenchmark.pluginId] =
      categorized[mainBenchmark.pluginId] || []
    categorized[mainBenchmark.pluginId].push([mainBenchmark, null])
  }

  for (let i = 0; i < prBenchmarks.length; i++) {
    const prBenchmark = prBenchmarks[i]
    categorized[prBenchmark.pluginId] = categorized[prBenchmark.pluginId] || []
    const mainBenchmarkRecord = categorized[prBenchmark.pluginId].find(
      (item) =>
        item[0]?.pluginId === prBenchmark.pluginId &&
        item[0]?.fixture.name === prBenchmark.fixture.name
    )

    if (mainBenchmarkRecord) {
      mainBenchmarkRecord[1] = prBenchmark
    } else {
      categorized[prBenchmark.pluginId].push([null, prBenchmark])
    }
  }

  return categorized
}

const compareFixtureBenchmarks = (
  mainBenchmarks: FixtureBenchmark[],
  prBenchmarks: FixtureBenchmark[]
): FixtureBenchmarkCompared => {
  const categorized = categorizeFixtureBenchmark(mainBenchmarks, prBenchmarks)
  const compared: FixtureBenchmarkCompared = {}

  for (const [pluginId, catedBenchmarks] of Object.entries(categorized)) {
    compared[pluginId] = catedBenchmarks.reduce<
      FixtureBenchmarkCompared[keyof FixtureBenchmarkCompared]
    >((acc, item) => {
      return [
        ...acc,
        {
          metricsCmped:
            item[0] && item[1]
              ? compareFixtureBenchmark(item[0], item[1])
              : null,
          raw: item,
          /* At least either of them would exist */
          fixture: (item[0]?.fixture || item[1]?.fixture)!,
          pluginId: (item[0]?.pluginId || item[1]?.pluginId)!
        }
      ]
    }, [])
  }

  return compared
}

export { compareRspackBenchmarks, compareFixtureBenchmarks }

// let mainRspackBenchmarks = [{ metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 12819549, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@prebundle/detect-port' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 12815680, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@prebundle/mime-types' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 33426549, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@prebundle/prettier' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 21418431, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@prebundle/tsm' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 13946952, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@prebundle/webpack-bundle-analyzer' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 3396006271, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/antd-example' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 3234302075, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/counter-app' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 5254044629, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/cra' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 3324251577, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/library-example' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 3472127875, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/react-svgr' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 5039444561, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/ssr-react-example' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 3660151551, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/vue2-example' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 4030320225, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/vue3-example' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 96022, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/config' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 1213323, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/speedy-docs' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 90966170, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/eslint-config' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 12766709, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/prebundle' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 2429467, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/publish-test' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 94373400, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy/scripts' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 11419348784, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/playground' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 4548975672, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/test-cli' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 4907953099, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/test-configs' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 4548945830, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/test-errors' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 15289293356, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/test-fixture' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 12006009446, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/test-plugins' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 72627492, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/test-toolkit' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 3473622866, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/test-utils' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 179139701, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/speedy-config-loader' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 3144272669, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/speedy-core' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 764189131, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/speedy-error' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 1357077682, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/speedy-plugin-babel' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 1365790681, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/speedy-plugin-babel-preset' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 601676285, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/speedy-plugin-es5' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 327722699, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/speedy-plugin-external' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 278377914, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/speedy-plugin-progress' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 237775163, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/speedy-plugin-svgr' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 170762865, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/speedy-plugin-swc' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 233528886, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/speedy-plugin-vconsole' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 332385709, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/speedy-plugin-vue2' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 1465675081, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/speedy-plugin-web' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 170582639, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/speedy-types' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 352337445, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/speedy-utils' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 4689427610, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/universal' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 695336412, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/unplugin' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 0, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/speedy-node-rig' }]
// mainRspackBenchmarks = mainRspackBenchmarks.map(item => ({
//   ...item,
//   pkg: {
//     packageName: item.pkg
//   }
// }))
// let prRspackBenchmarks = [{ metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 12818603, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@prebundle/detect-port' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 12814862, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@prebundle/mime-types' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 33425675, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@prebundle/prettier' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 21417457, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@prebundle/tsm' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 13945934, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@prebundle/webpack-bundle-analyzer' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 2904292820, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/antd-example' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 2742591101, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/counter-app' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 4534068653, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/cra' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 2832539489, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/library-example' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 2980412653, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/react-svgr' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 4220068729, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/ssr-react-example' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 3168433933, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/vue2-example' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 3539950068, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/vue3-example' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 96022, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/config' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 1213095, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/speedy-docs' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 90965078, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/eslint-config' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 12766269, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/prebundle' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 94371942, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy/scripts' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 9616718421, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/playground' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 3810772272, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/test-cli' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 4170734320, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/test-configs' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 3810742558, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/test-errors' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 13344505667, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/test-fixture' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 10552932038, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/test-plugins' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 72627300, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/test-toolkit' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 2981907788, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/test-utils' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 179137365, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/speedy-config-loader' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 2653111063, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/speedy-core' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 517810577, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/speedy-error' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 1120205776, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/speedy-plugin-babel' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 1120312231, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/speedy-plugin-babel-preset' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 602656312, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/speedy-plugin-es5' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 327717311, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/speedy-plugin-external' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 277841942, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/speedy-plugin-progress' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 237770833, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/speedy-plugin-svgr' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 170758839, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/speedy-plugin-swc' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 233524676, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/speedy-plugin-vconsole' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 332380133, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/speedy-plugin-vue2' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 1220169942, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/speedy-plugin-web' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 170580850, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/speedy-types' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 352330796, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/speedy-utils' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 3872504488, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/universal' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 696315453, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/unplugin' }, { metrics: [{ id: 'node-modules-size', title: 'Node Module Size', value: 0, format: 'bytes' }], pluginId: 'node-modules-plugin', pkg: '@speedy-js/speedy-node-rig' }]
// prRspackBenchmarks = prRspackBenchmarks.map(item => ({
//   ...item,
//   pkg: {
//     packageName: item.pkg
//   }
// }))

// console.log(JSON.stringify(compareRspackBenchmarks(mainRspackBenchmarks, prRspackBenchmarks), null, 4))
