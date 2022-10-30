import { join } from 'upath';
import {
  envMock,
  mockExecAll,
  mockExecSequence,
} from '../../../../test/exec-util';
import { env } from '../../../../test/util';
import { GlobalConfig } from '../../../config/global';
import type { RepoGlobalConfig } from '../../../config/types';
import * as docker from '../../../util/exec/docker';
import { extractPackageFile } from '.';

jest.mock('../../../util/exec/env');
jest.mock('../../../util/fs');

process.env.BUILDPACK = 'true';

const adminConfig: RepoGlobalConfig = {
  localDir: join('/tmp/github/some/repo'),
  cacheDir: join('/tmp/renovate/cache'),
  containerbaseDir: join('/tmp/renovate/cache/containerbase'),
};

const cmd = `nix \
    --extra-experimental-features nix-command \
    --extra-experimental-features flakes \
    eval --raw --file flake.nix inputs.nixpkgs.url`;

describe('modules/manager/nix/extract', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    env.getChildProcessEnv.mockReturnValue({
      ...envMock.basic,
      LANG: 'en_US.UTF-8',
      LC_ALL: 'en_US',
    });
    GlobalConfig.set(adminConfig);
    docker.resetPrefetchedImages();
  });

  it('returns null for empty stdout', async () => {
    const execSnapshots = mockExecSequence([{ stdout: '', stderr: '' }]);
    const res = await extractPackageFile('', 'flake.nix');

    expect(res).toBeNull();
    expect(execSnapshots).toMatchObject([
      {
        cmd,
      },
    ]);
  });

  it('returns nixpkgs-unstable', async () => {
    const execSnapshots = mockExecSequence([
      { stdout: 'github:nixos/nixpkgs/nixpkgs-unstable', stderr: '' },
    ]);
    const res = await extractPackageFile('', 'flake.nix');

    expect(res?.deps).toHaveLength(1);
    expect(res?.deps).toEqual([
      {
        depName: 'nixpkgs',
        currentValue: 'nixpkgs-unstable',
        skipReason: 'unsupported-version',
      },
    ]);
    expect(execSnapshots).toMatchObject([
      {
        cmd,
      },
    ]);
  });

  it('is case insensitive', async () => {
    const execSnapshots = mockExecSequence([
      { stdout: 'github:NixOS/nixpkgs/nixpkgs-unstable', stderr: '' },
    ]);

    const res = await extractPackageFile('', 'flake.nix');

    expect(res?.deps).toHaveLength(1);
    expect(res?.deps).toEqual([
      {
        depName: 'nixpkgs',
        currentValue: 'nixpkgs-unstable',
        skipReason: 'unsupported-version',
      },
    ]);
    expect(execSnapshots).toMatchObject([
      {
        cmd,
      },
    ]);
  });

  it('handles error', async () => {
    const execSnapshots = mockExecSequence([new Error()]);

    const res = await extractPackageFile('', 'flake.nix');

    expect(res).toBeNull();
    expect(execSnapshots).toMatchObject([
      {
        cmd,
      },
    ]);
  });

  it('handles stderr', async () => {
    const execSnapshots = mockExecSequence([{ stdout: '', stderr: 'error' }]);

    const res = await extractPackageFile('', 'flake.nix');

    expect(res).toBeNull();
    expect(execSnapshots).toMatchObject([
      {
        cmd,
      },
    ]);
  });

  it('supports docker mode', async () => {
    GlobalConfig.set({ ...adminConfig, binarySource: 'docker' });
    const execSnapshots = mockExecAll();

    const res = await extractPackageFile('', 'flake.nix');

    expect(res).toBeNull();
    expect(execSnapshots).toMatchObject([
      { cmd: 'docker pull renovate/sidecar' },
      { cmd: 'docker ps --filter name=renovate_sidecar -aq' },
      {
        cmd:
          'docker run --rm --name=renovate_sidecar --label=renovate_child ' +
          '-v "/tmp/github/some/repo":"/tmp/github/some/repo" ' +
          '-v "/tmp/renovate/cache":"/tmp/renovate/cache" ' +
          '-e BUILDPACK_CACHE_DIR ' +
          '-e CONTAINERBASE_CACHE_DIR ' +
          '-w "/tmp/github/some/repo" ' +
          'renovate/sidecar ' +
          'bash -l -c "' +
          'install-tool nix 2.11.1 ' +
          '&& ' +
          cmd +
          '"',
      },
    ]);
  });

  it('supports install mode', async () => {
    GlobalConfig.set({ ...adminConfig, binarySource: 'install' });
    const execSnapshots = mockExecAll({
      stdout: 'github:NixOS/nixpkgs/nixpkgs-unstable',
      stderr: '',
    });

    const res = await extractPackageFile('', 'flake.nix');

    expect(res?.deps).toHaveLength(1);
    expect(res?.deps).toEqual([
      {
        depName: 'nixpkgs',
        currentValue: 'nixpkgs-unstable',
        skipReason: 'unsupported-version',
      },
    ]);
    expect(execSnapshots).toMatchObject([
      { cmd: 'install-tool nix 2.11.1' },
      {
        cmd,
        options: { cwd: '/tmp/github/some/repo' },
      },
    ]);
  });
});
