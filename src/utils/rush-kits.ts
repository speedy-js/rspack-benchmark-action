import path from 'path'
import * as rushLib from '@microsoft/rush-lib'

type ArrayType<T> = T extends (infer U)[] ? U : never

const getProjects = (configFile?: string) => {
  const rushConfiguration = configFile
    ? rushLib.RushConfiguration.loadFromConfigurationFile(configFile)
    : rushLib.RushConfiguration.loadFromDefaultLocation()

  const normalized = rushConfiguration.projects.map((project) => {
    return Object.assign(project, {
      shortFolder: path.basename(project.projectFolder),
      relativeFolder: project.projectRelativeFolder,
      absoluteFolder: project.projectFolder
    })
  })

  return normalized
}

export type CategorizedProjects = { [categoryName: string]: ReturnType<typeof getProjects>}

export type Project = ReturnType<typeof getProjects>[number];

const getCategorizedProjects = (configFile?: string) => {
  return getProjects(configFile).reduce((categories, project) => {
    const category = path.basename(project.absoluteFolder.replace(`/${project.shortFolder}`, ''))

    if (!categories[category]) {
      categories[category] = []
    }

    categories[category].push(project)

    return categories
  }, {} as CategorizedProjects)
}

class RushKit {
  private pending: CategorizedProjects | null = null;
  public projects: CategorizedProjects;
  constructor (categorized?: CategorizedProjects) {
    this.projects = categorized || {}
  }

  private get toFilter (): CategorizedProjects {
    return this.pending || this.projects
  }

  filterCategory (categoryName: string | string[]) {
    const categoryNameList = (Array.isArray(categoryName) ? categoryName : [categoryName])

    this.pending = Object.keys(this.toFilter).reduce((acc, name) => {
      if (categoryNameList.includes(name)) {
        acc[name] = this.toFilter[name]
      }
      return acc
    }, {} as CategorizedProjects)

    return this
  }

  /**
   * filterShortDirName
   * @param {string[] | string} shortDirName
   */
  filterShortDir (shortDir: string | string[]) {
    const shortDirList = Array.isArray(shortDir) ? shortDir : [shortDir]

    this.pending = Object.keys(this.toFilter).reduce((acc, categoryName) => {
      const filtered = this.toFilter[categoryName].filter((project: ArrayType<ReturnType<typeof getProjects>>) => {
        return shortDirList.includes(project.shortFolder)
      })

      return {
        ...acc,
        [categoryName]: filtered
      }
    }, {} as CategorizedProjects)

    return this
  }

  end () {
    const filtered = this.pending
    this.pending = null
    return filtered
  }

  clone () {
    const instance = new RushKit()
    instance.pending = null
    instance.projects = {
      ...this.projects
    }
    return instance
  }

  static fromRushDir (rushDir?: string) {
    return new this(getCategorizedProjects(rushDir ? path.join(rushDir, 'rush.json') : undefined))
  }
}

export {
  getCategorizedProjects,
  getProjects,
  RushKit
}
