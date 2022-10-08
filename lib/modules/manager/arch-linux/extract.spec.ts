import { fs } from '../../../../test/util';
import { extractPackageFile } from './extract';

jest.mock('../../../util/fs');

describe('modules/manager/arch-linux/extract', () => {
  describe('extractPackageFile()', () => {
    it('should return null if no sibling .SRCINFO', async () => {
      const res = await extractPackageFile('', 'PKGBUILD');
      expect(res).toBeNull();
    });

    it('should return null if .SRCINFO is null', async () => {
      fs.findLocalSiblingOrParent.mockResolvedValueOnce('.SRCINFO');
      fs.readLocalFile.mockResolvedValueOnce(null);

      const res = await extractPackageFile('', 'PKGBUILD');

      expect(res).toBeNull();
    });

    it('should return null if .SRCINFO contains invalid line', async () => {
      fs.findLocalSiblingOrParent.mockResolvedValueOnce('.SRCINFO');
      fs.readLocalFile.mockResolvedValueOnce(`pkgbase @ google-chrome`);

      const res = await extractPackageFile('', 'PKGBUILD');

      expect(res).toBeNull();
    });

    it('should return null if .SRCINFO missing required entry', async () => {
      fs.findLocalSiblingOrParent.mockResolvedValueOnce('.SRCINFO');
      fs.readLocalFile.mockResolvedValueOnce(`pkgbase = google-chrome`);

      const res = await extractPackageFile('', 'PKGBUILD');

      expect(res).toBeNull();
    });

    it('should return null for multiple sources', async () => {
      fs.findLocalSiblingOrParent.mockResolvedValueOnce('.SRCINFO');
      fs.readLocalFile.mockResolvedValueOnce(`pkgbase = google-chrome
\tpkgver = 106.0.5249.103
\tpkgrel = 1
\tsource = https://dl.google.com/linux/chrome/deb/pool/main/g/google-chrome-stable/google-chrome-stable_106.0.5249.103-1_amd64.deb
\tsource = eula_text.html
\tsource = google-chrome-stable.sh

pkgname = google-chrome`);

      const res = await extractPackageFile('', 'PKGBUILD');

      expect(res).toBeNull();
    });

    it('should return null for unsupported source', async () => {
      fs.findLocalSiblingOrParent.mockResolvedValueOnce('.SRCINFO');
      fs.readLocalFile.mockResolvedValueOnce(`pkgbase = google-chrome
\tpkgver = 106.0.5249.103
\tpkgrel = 1
\tsource = https://dl.google.com/linux/chrome/deb/pool/main/g/google-chrome-stable/google-chrome-stable_106.0.5249.103-1_amd64.deb

pkgname = google-chrome`);

      const res = await extractPackageFile('', 'PKGBUILD');

      expect(res).toBeNull();
    });

    it('should extract package file', async () => {
      fs.findLocalSiblingOrParent.mockResolvedValueOnce('.SRCINFO');
      fs.readLocalFile.mockResolvedValueOnce(`pkgbase = yay
\tpkgver = 11.1.2
\tpkgrel = 1
\tsource = yay-11.1.2.tar.gz::https://github.com/Jguer/yay/archive/v11.1.2.tar.gz
\tsha256sums = 17240f2eca254814516d38e3cf235211a7015844e835df46465b9f062304d94a

pkgname = yay`);

      const res = await extractPackageFile('', 'PKGBUILD');

      expect(res).toStrictEqual({
        deps: [
          {
            depName: 'Jguer/yay',
            currentValue: 'v11.1.2',
            datasource: 'github-tags',
            managerData: {
              b2: undefined,
              md5: undefined,
              sha1: undefined,
              sha224: undefined,
              sha256:
                '17240f2eca254814516d38e3cf235211a7015844e835df46465b9f062304d94a',
              sha348: undefined,
              sha512: undefined,
            },
          },
        ],
      });
    });
  });
});
