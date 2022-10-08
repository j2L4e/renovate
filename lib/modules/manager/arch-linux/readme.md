The `arch-linux` manager supports updating [Arch Linux](https://www.archlinux.org/) [AUR packages](https://aur.archlinux.org/).

It currently has the following limitations:

- `.SRCINFO` files must be located in the same directory as the `PKGBUILD` file
  - Parsing `PKGBUILD` files directly requires running untrusted Bash code
- Only one [`source`](https://wiki.archlinux.org/title/PKGBUILD#source) entry is supported
- Only the `github-tags` datasource is currently supported
