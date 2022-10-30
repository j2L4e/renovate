import is from '@sindresorhus/is';
import { logger } from '../../../logger';
import { exec } from '../../../util/exec';
import type { ExecOptions } from '../../../util/exec/types';
import { regEx } from '../../../util/regex';
import type { PackageFile } from '../types';

function parseNixPkgsBranch(url: string): string | null {
  const [protocol, , owner, , repo, , branch] = url.split(regEx(/([:/])/));
  if (
    protocol.toUpperCase() === 'GITHUB' &&
    owner.toUpperCase() === 'NIXOS' &&
    repo.toUpperCase() === 'NIXPKGS'
  ) {
    return branch;
  }
  return null;
}
export async function extractPackageFile(
  content: string,
  packageFile: string
): Promise<PackageFile | null> {
  const execOptions: ExecOptions = {
    cwdFile: packageFile,
    env: {
      PATH: `/home/jamie/.local/bin:${process.env.PATH!}`,
    },
    toolConstraints: [
      {
        toolName: 'nix',
        constraint: '2.11.1', // TODO: get from config
      },
    ],
    docker: {
      image: 'sidecar',
    },
  };

  const cmd = `nix \
    --extra-experimental-features nix-command \
    --extra-experimental-features flakes \
    eval --raw --file ${packageFile} inputs.nixpkgs.url`;
  try {
    const { stdout, stderr } = await exec(cmd, execOptions);

    if (is.nonEmptyStringAndNotWhitespace(stderr)) {
      logger.warn({ stderr }, 'Error extracting nixpkgs');
      return null;
    }

    if (is.emptyStringOrWhitespace(stdout)) {
      logger.warn('Error extracting nixpkgs');
      return null;
    }

    const branch = parseNixPkgsBranch(stdout);

    return {
      deps: [
        {
          depName: 'nixpkgs',
          currentValue: branch,
          skipReason: 'unsupported-version',
        },
      ],
    };
  } catch (err) {
    logger.warn({ err }, 'Error extracting nixpkgs');
    return null;
  }
}
