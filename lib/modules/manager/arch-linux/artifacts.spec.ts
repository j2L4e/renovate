import { updateArtifacts } from './artifacts';

describe('modules/manager/arch-linux/artifacts', () => {
  describe('updateArtifacts()', () => {
    it('should return null if no updated deps', async () => {
      const res = await updateArtifacts({
        packageFileName: 'PKGBUILD',
        updatedDeps: [],
        newPackageFileContent: '',
        config: {},
      });
      expect(res).toBeNull();
    });
  });
});
