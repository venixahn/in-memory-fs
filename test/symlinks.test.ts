import { describe, expect, it } from 'vitest'
import { connect, createFileSystem } from '@app/index.ts'

describe('symlinks', function () {
  it('reads the target path from a symlink', function () {
    const sh = connect(createFileSystem())
    sh.creat('notes').symlink('notes', 'shortcut')
    expect(sh.readlink('shortcut')).toBe('notes')
  })

  it('reads file contents through a symlink', function () {
    const sh = connect(createFileSystem())
    sh.creat('notes').writeFile('notes', 'hi')
    sh.symlink('notes', 'shortcut')
    expect(sh.readFile('shortcut')).toBe('hi')
  })

  it('writes through a symlink to the real file', function () {
    const sh = connect(createFileSystem())
    sh.creat('notes').symlink('notes', 'shortcut')
    sh.writeFile('shortcut', 'hi')
    expect(sh.readFile('notes')).toBe('hi')
  })

  it('lstat sees a symlink and stat follows it', function () {
    const sh = connect(createFileSystem())
    sh.creat('notes').symlink('notes', 'shortcut')
    expect(sh.lstat('shortcut')).toEqual({ kind: 'symlink' })
    expect(sh.stat('shortcut')).toEqual({ kind: 'file' })
  })

  it('chdir follows a symlink to a directory', function () {
    const sh = connect(createFileSystem())
    sh.mkdir('school').symlink('school', 'class')
    sh.chdir('class')
    expect(sh.getcwd()).toBe('/school')
  })

  it('throws ELOOP when a symlink cycle is followed', function () {
    const sh = connect(createFileSystem())
    sh.symlink('loop', 'loop')
    expect(function () {
      sh.readFile('loop')
    }).toThrow('ELOOP')
  })

  it('throws EINVAL when readlink targets a non-symlink', function () {
    const sh = connect(createFileSystem())
    sh.creat('notes')
    expect(function () {
      sh.readlink('notes')
    }).toThrow('EINVAL')
  })
})
