import { describe, expect, it } from 'vitest'
import { connect, createFileSystem } from '@app/index.ts'

describe('errors and paths', function () {
  it('throws ENOENT when reading a missing file', function () {
    const sh = connect(createFileSystem())
    expect(function () {
      sh.readFile('missing')
    }).toThrowError('ENOENT')
  })

  it('throws ENOENT when writing a missing file', function () {
    const sh = connect(createFileSystem())
    expect(function () {
      sh.writeFile('missing', 'hi')
    }).toThrowError('ENOENT')
  })

  it('throws EEXIST when creating a name that already exists', function () {
    const sh = connect(createFileSystem())
    sh.creat('notes')
    expect(function () {
      sh.creat('notes')
    }).toThrowError('EEXIST')
  })

  it('reads a file through an absolute path', function () {
    const sh = connect(createFileSystem())
    sh.creat('notes').writeFile('/notes', 'hi')
    expect(sh.readFile('/notes')).toBe('hi')
  })

  it('treats .. at / as /', function () {
    const sh = connect(createFileSystem())
    sh.creat('notes').writeFile('notes', 'hi')
    sh.chdir('..')
    expect(sh.getcwd()).toBe('/')
    expect(sh.readFile('../notes')).toBe('hi')
  })

  it('throws ENOTDIR when a file is used as a directory', function () {
    const sh = connect(createFileSystem())
    sh.creat('notes')
    expect(function () {
      sh.readFile('notes/page')
    }).toThrowError('ENOTDIR')
  })

  it('throws ENOTEMPTY for a non-empty directory', function () {
    const sh = connect(createFileSystem())
    sh.mkdir('school').creat('school/notes')
    expect(function () {
      sh.rmdir('school')
    }).toThrowError('ENOTEMPTY')
  })

  it('reports getcwd after chdir and reads / from a nested cwd', function () {
    const sh = connect(createFileSystem())
    sh.creat('notes').writeFile('notes', 'hi')
    sh.mkdir('school').chdir('school')
    expect(sh.getcwd()).toBe('/school')
    expect(sh.readFile('/notes')).toBe('hi')
  })

  it('resolves a . component to the current directory', function () {
    const sh = connect(createFileSystem())
    sh.creat('notes').writeFile('notes', 'hi')
    expect(sh.readFile('./notes')).toBe('hi')
  })

  it('throws EINVAL when creating with an empty path', function () {
    const sh = connect(createFileSystem())
    expect(function () {
      sh.creat('/')
    }).toThrowError('EINVAL')
  })

  it('throws EINVAL when creating . or ..', function () {
    const sh = connect(createFileSystem())
    expect(function () {
      sh.creat('.')
    }).toThrowError('EINVAL')
    expect(function () {
      sh.creat('..')
    }).toThrowError('EINVAL')
  })

  it('throws ENOTDIR when creating under a file', function () {
    const sh = connect(createFileSystem())
    sh.creat('notes')
    expect(function () {
      sh.creat('notes/page')
    }).toThrowError('ENOTDIR')
  })

  it('throws EPERM when removing /', function () {
    const sh = connect(createFileSystem())
    expect(function () {
      sh.rmdir('/')
    }).toThrowError('EPERM')
  })

  it('throws ENOTDIR when rmdir or chdir target a file', function () {
    const sh = connect(createFileSystem())
    sh.creat('notes')
    expect(function () {
      sh.rmdir('notes')
    }).toThrowError('ENOTDIR')
    expect(function () {
      sh.chdir('notes')
    }).toThrowError('ENOTDIR')
  })

  it('throws EISDIR when reading or writing a directory', function () {
    const sh = connect(createFileSystem())
    sh.mkdir('school')
    expect(function () {
      sh.readFile('school')
    }).toThrowError('EISDIR')
    expect(function () {
      sh.writeFile('school', 'hi')
    }).toThrowError('EISDIR')
  })

  it('removes an empty directory', function () {
    const sh = connect(createFileSystem())
    sh.mkdir('school').rmdir('school')
    expect(function () {
      sh.chdir('school')
    }).toThrowError('ENOENT')
  })
})
