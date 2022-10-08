import { GithubTagsDatasource } from '../../datasource/github-tags';

export { extractPackageFile } from './extract';
export { updateDependency } from './update';
export { updateArtifacts } from './artifacts';

export const defaultConfig = {
  fileMatch: ['(^|/)PKGBUILD$'],
  enabled: false,
};

export const supportedDatasources = [GithubTagsDatasource.id];
