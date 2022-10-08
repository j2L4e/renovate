export type SrcInfoLine = readonly [string, string];
export type SrcInfoLines = ReadonlyArray<SrcInfoLine>;

export const requiredFields = ['pkgname', 'pkgver', 'pkgrel'] as const;
export const optionalFields = [
  'epoch',
  'pkgdesc',
  'url',
  'install',
  'changelog',
] as const;
export const arrayFields = [
  'arch',
  'groups',
  'license',
  'noextract',
  'options',
  'backup',
  'validgpgkeys',
  'source',
  'depends',
  'checkdepends',
  'makedepends',
  'optdepends',
  'provides',
  'conflicts',
  'replaces',
  'md5sums',
  'sha1sums',
  'sha224sums',
  'sha256sums',
  'sha348sums',
  'sha512sums',
  'b2sums',
] as const;
export const digestFields = [
  'md5sums',
  'sha1sums',
  'sha224sums',
  'sha256sums',
  'sha348sums',
  'sha512sums',
  'b2sums',
] as const;

export type RequiredField = typeof requiredFields[number];
export type OptionalField = typeof optionalFields[number];
export type ArrayField = typeof arrayFields[number];
export type SrcInfo = Readonly<
  Record<RequiredField, string> &
    Partial<Record<OptionalField, string>> &
    Record<ArrayField, readonly string[]>
>;

export type DigestField = Record<typeof digestFields[number], string>;
export interface ArchLinuxManagerData {
  currentDigests?: Partial<DigestField>;
  newDigests?: Partial<DigestField>;
}
