import { describe, expect, it } from 'vitest';
import { connect, createFileSystem } from '../src/index.js';

describe('navigate directories', () => {
  it('starts a new process at /', () => {
    const sh = connect(createFileSystem());
    expect(sh.getcwd()).toBe('/');
  });
});
