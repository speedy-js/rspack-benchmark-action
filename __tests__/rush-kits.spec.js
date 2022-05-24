const { expect } = require('chai');

const rushKit = require('../src/utils/rush-kits');

describe('rushKit', () => {
  it('should get all packages', () => {
    const projects = rushKit.getProjects();

    expect(projects.length).gt(0);
  });

  it('should get all packages without `shortName` duplications', () => {
    const projects = rushKit.getProjects();

    const shortFolders = projects.map((project) => project.shortFolder);

    expect(
      shortFolders.filter((name, index) => {
        return shortFolders.indexOf(name) === index;
      }).length
    ).eq(shortFolders.length);
  });

  it('should categorize all speedy projects', () => {
    const categorizedProjects = rushKit.getCategorizedProjects();

    expect(categorizedProjects && typeof categorizedProjects).eq('object');
    expect(categorizedProjects.packages && Array.isArray(categorizedProjects.packages)).to.be.true;
  });

  it('should filter correctly with category utilities', () => {
    const cat = rushKit.RushKit.create();

    const result = cat.filterCategory(['packages']).end();
    expect(Object.keys(result)).to.be.lengthOf(1);
  });
});
