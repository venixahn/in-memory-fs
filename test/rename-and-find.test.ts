import { describe, expect, it } from 'vitest'
import { connect, createFileSystem } from '@app/index.ts'

describe('rename, unlink, and find', function () {
  it('renames a file in the same directory', function () {
    const sh = connect(createFileSystem())
    sh.creat('notes').writeFile('notes', 'hi')
    sh.rename('notes', 'todo')
    expect(sh.readFile('todo')).toBe('hi')
    expect(function () {
      sh.readFile('notes')
    }).toThrow('ENOENT')
  })

  it('renames a directory across parents', function () {
    const sh = connect(createFileSystem())
    sh.mkdir('school').mkdir('home')
    sh.creat('school/notes').writeFile('school/notes', 'hi')
    sh.rename('school', 'home/class')
    expect(sh.readFile('home/class/notes')).toBe('hi')
  })

  it('throws EEXIST when the rename target exists', function () {
    const sh = connect(createFileSystem())
    sh.creat('notes').creat('todo')
    expect(function () {
      sh.rename('notes', 'todo')
    }).toThrow('EEXIST')
  })

  it('refuses to rename a directory under itself', function () {
    const sh = connect(createFileSystem())
    sh.mkdir('school').mkdir('school/homework')
    expect(function () {
      sh.rename('school', 'school/homework/loop')
    }).toThrow('EPERM')
  })

  it('unlinks a file', function () {
    const sh = connect(createFileSystem())
    sh.creat('notes').unlink('notes')
    expect(function () {
      sh.readFile('notes')
    }).toThrow('ENOENT')
  })

  it('throws EISDIR when unlinking a directory', function () {
    const sh = connect(createFileSystem())
    sh.mkdir('school')
    expect(function () {
      sh.unlink('school')
    }).toThrow('EISDIR')
  })

  it('throws EPERM when unlinking or renaming /', function () {
    const sh = connect(createFileSystem())
    expect(function () {
      sh.unlink('/')
    }).toThrow('EPERM')
    expect(function () {
      sh.rename('/', 'root')
    }).toThrow('EPERM')
  })

  it('finds every exact basename under cwd', function () {
    const sh = connect(createFileSystem())
    sh.mkdir('school').creat('school/notes')
    sh.mkdir('home').creat('home/notes')
    expect(sh.find('notes')).toEqual(['/school/notes', '/home/notes'])
  })

  it('does not descend through a symlink directory', function () {
    const sh = connect(createFileSystem())
    sh.mkdir('school').creat('school/notes')
    sh.symlink('school', 'class')
    expect(sh.find('notes')).toEqual(['/school/notes'])
  })

  it('does not loop through a directory hardlink', function () {
    const sh = connect(createFileSystem())
    sh.mkdir('school').creat('school/notes')
    sh.link('school', 'class')
    expect(sh.find('notes')).toEqual(['/school/notes'])
  })
})
