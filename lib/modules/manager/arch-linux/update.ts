import { regEx } from '../../../util/regex';
import type { UpdateDependencyConfig } from '../types';
import type { ArchLinuxManagerData } from './types';

const packageReleaseLineRegex = regEx(
  /^\s*(?<key>pkgrel)\s*=\s*(?<value>.+)\s*$/m
);

function updateVersion(
  fileContent: string,
  oldVersion: string,
  newVersion: string
): string {
  if (fileContent.includes(oldVersion)) {
    return fileContent.replace(oldVersion, newVersion);
  } else if (
    oldVersion.startsWith('v') &&
    newVersion.startsWith('v') &&
    fileContent.includes(oldVersion.substring(1))
  ) {
    return fileContent.replace(
      oldVersion.substring(1),
      newVersion.substring(1)
    );
  }

  return fileContent;
}

function resetPackageRelease(fileContent: string): string {
  const pkgRelLine = packageReleaseLineRegex.exec(fileContent);
  if (pkgRelLine) {
    return fileContent.replace(pkgRelLine[0], `${pkgRelLine[1]}=1`);
  }
  return fileContent;
}

export function updateDependency({
  fileContent,
  upgrade,
}: UpdateDependencyConfig<ArchLinuxManagerData>): Promise<string | null> {
  const { currentValue, newValue, managerData } = upgrade;
  let updatedFileContent = updateVersion(fileContent, currentValue!, newValue!);
  if (updatedFileContent !== fileContent) {
    updatedFileContent = resetPackageRelease(updatedFileContent);
  }
  return Promise.resolve(updatedFileContent);
}
