import path from 'path';
import fs from 'fs-extra';

import { getDirSize, RushKit } from '../../utils';
import { PerformancePluginRspack, PluginBenchmark, Project } from '../base';

class NodeModulesPlugin extends PerformancePluginRspack {
  static id = 'node-modules-plugin';
  static title = 'Node Modules Size';

  getPackages(rushKit: RushKit) {
    return rushKit.filterCategory('packages').end()!;
  }

  async runEach(project: Project): Promise<PluginBenchmark> {
    const devDependencyPaths = project.packageJsonEditor.devDependencyList.map(
      (dep) =>
        path.join(path.join(project.absoluteFolder, 'node_modules', dep.name))
    );
    const size = await getDirSize(
      path.join(project.absoluteFolder, 'node_modules'),
      {
        // omit dev dependencies
        filter: (filePath) => !devDependencyPaths.includes(filePath),
      }
    );
    return {
      metrics: [
        {
          id: 'node-modules-size',
          title: 'Node Module Size',
          value: size,
          format: 'bytes',
        },
      ],
    };
  }
}

export { NodeModulesPlugin };
