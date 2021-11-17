/* @flow */
import {describe, it} from 'mocha';
import {assert} from 'chai';

import {
  withTempDir, execWebExtTty,
} from './common';

const getMaxDataLineLength = async (cmd) => {
  const { data } = await cmd.waitForExit;
  const lines = data.split(/\r?\n/);
  const lineLengths = lines.map((line) => line.length);
  const maxLineLength = Math.max(...lineLengths);
  return maxLineLength;
};

describe('web-ext yargs output width', () => {
  it('should include executable name in help output on pseudoterminal',
     () => withTempDir(async (tmpDir) => {
       const cmd = execWebExtTty(['--help'], {cwd: tmpDir.path()});
       const { data } = await cmd.waitForExit;
       // Smoke test to ensure the output isn't an execution error message.
       assert.equal(data.includes('Usage: web-ext [options] command'), true,
                    'help does include Usage: web-ext [options] command');
     }));

  it('should wrap help output at narrow terminal width',
     () => withTempDir(async (tmpDir) => {
       const cmd = execWebExtTty(['--help'],
                                 {cwd: tmpDir.path(), cols: 55, rows: 1000});
       const maxLineLength = await getMaxDataLineLength(cmd);
       assert.equal(maxLineLength, 55,
                    'line length is not wrapped at 55 characters');
     }));

  it('should wrap help output at maximum 80 characters',
     () => withTempDir(async (tmpDir) => {
       const cmd = execWebExtTty(['--help'],
                                 {cwd: tmpDir.path(), cols: 120, rows: 1000});
       const maxLineLength = await getMaxDataLineLength(cmd);
       assert.equal(maxLineLength, 80,
                    'line length is not wrapped at 80 characters');
     }));
});
