import type { UpdateArtifact, UpdateArtifactsResult } from '../types';

export function updateArtifacts({
  packageFileName,
  updatedDeps,
  newPackageFileContent,
  config,
}: UpdateArtifact): Promise<UpdateArtifactsResult[] | null> {
  return Promise.resolve(null);
}
