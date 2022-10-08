import { updateDependency } from './update';

describe('modules/manager/arch-linux/update', () => {
  describe('updateDependency()', () => {
    it('should return null if no updated deps', async () => {
      const fileContent = `pkgname=yay
pkgver=11.1.2
pkgrel=1
source=("\${pkgname}-\${pkgver}.tar.gz::https://github.com/Jguer/yay/archive/v\${pkgver}.tar.gz")
sha256sums=('17240f2eca254814516d38e3cf235211a7015844e835df46465b9f062304d94a')`;
      const res = await updateDependency({
        fileContent,
        upgrade: {
          currentValue: '11.1.2',
          newValue: '11.1.2',
        },
      });
      expect(res).toStrictEqual(fileContent);
    });

    it('should not reset pkgrel if no update', async () => {
      const fileContent = `pkgname=yay
pkgver=11.1.2
pkgrel=2
source=("\${pkgname}-\${pkgver}.tar.gz::https://github.com/Jguer/yay/archive/v\${pkgver}.tar.gz")
sha256sums=('17240f2eca254814516d38e3cf235211a7015844e835df46465b9f062304d94a')`;
      const res = await updateDependency({
        fileContent,
        upgrade: {
          currentValue: '11.1.2',
          newValue: '11.1.2',
        },
      });
      expect(res).toStrictEqual(fileContent);
    });

    it('should return updated content', async () => {
      const fileContent = `pkgname=yay
pkgver=11.1.2
pkgrel=2
source=("\${pkgname}-\${pkgver}.tar.gz::https://github.com/Jguer/yay/archive/v\${pkgver}.tar.gz")
sha256sums=('17240f2eca254814516d38e3cf235211a7015844e835df46465b9f062304d94a')`;
      const res = await updateDependency({
        fileContent,
        upgrade: {
          currentValue: '11.1.2',
          newValue: '11.2.0',
        },
      });
      expect(res).toBe(`pkgname=yay
pkgver=11.2.0
pkgrel=1
source=("\${pkgname}-\${pkgver}.tar.gz::https://github.com/Jguer/yay/archive/v\${pkgver}.tar.gz")
sha256sums=('17240f2eca254814516d38e3cf235211a7015844e835df46465b9f062304d94a')`);
    });

    it('should replace multiple instances', async () => {
      const fileContent = `pkgname=yay
pkgver=11.1.2
pkgrel=2
source=("yay-11.1.2.tar.gz::https://github.com/Jguer/yay/archive/v11.1.2.tar.gz")
sha256sums=('17240f2eca254814516d38e3cf235211a7015844e835df46465b9f062304d94a')`;
      const res = await updateDependency({
        fileContent,
        upgrade: {
          currentValue: '11.1.2',
          newValue: '11.2.0',
        },
      });
      expect(res).toBe(`pkgname=yay
pkgver=11.2.0
pkgrel=1
source=("\${pkgname}-\${pkgver}.tar.gz::https://github.com/Jguer/yay/archive/v\${pkgver}.tar.gz")
sha256sums=('17240f2eca254814516d38e3cf235211a7015844e835df46465b9f062304d94a')`);
    });
  });
});
