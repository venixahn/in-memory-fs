import { describe, expect, it } from 'vitest'
import { connect, createFileSystem } from '@app/index.ts'

describe('multi-client', function () {
  it('shares one tree across shells', function () {
    const fs = createFileSystem()
    const a = connect(fs)
    const b = connect(fs)
    a.mkdir('school')
    expect(b.readdir('/')).toEqual(['school'])
  })

  it('keeps cwd isolated per shell', function () {
    const fs = createFileSystem()
    const a = connect(fs)
    const b = connect(fs)
    a.mkdir('school').chdir('school')
    expect(a.getcwd()).toBe('/school')
    expect(b.getcwd()).toBe('/')
  })

  it('hides names that start with a dot', function () {
    const sh = connect(createFileSystem())
    sh.creat('.hidden').creat('notes')
    expect(sh.readdir()).toEqual(['notes'])
  })

  it('throws ENOTDIR when listing a file', function () {
    const sh = connect(createFileSystem())
    sh.creat('notes')
    expect(function () {
      sh.readdir('notes')
    }).toThrowError('ENOTDIR')
  })

  it('lets 500 shells create names a 501st can list', function () {
    const fs = createFileSystem()
    const expected: string[] = []
    let i = 0
    while (i < 500) {
      const name = 'c' + String(i)
      connect(fs).mkdir(name)
      expected.push(name)
      i += 1
    }
    expect(connect(fs).readdir('/')).toEqual(expected)
  })
})
