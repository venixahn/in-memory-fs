import { describe, expect, it } from 'vitest'
import { connect, createFileSystem } from '@app/index.ts'

describe('hardlinks', function () {
  it('shares file contents across two names', function () {
    const sh = connect(createFileSystem())
    sh.creat('notes').writeFile('notes', 'hi')
    sh.link('notes', 'also')
    expect(sh.readFile('also')).toBe('hi')
    sh.writeFile('also', 'yo')
    expect(sh.readFile('notes')).toBe('yo')
  })

  it('shares directory children across two names', function () {
    const sh = connect(createFileSystem())
    sh.mkdir('school').creat('school/notes')
    sh.writeFile('school/notes', 'hi')
    sh.link('school', 'class')
    expect(sh.readFile('class/notes')).toBe('hi')
  })

  it('uses the hardlink name in getcwd', function () {
    const sh = connect(createFileSystem())
    sh.mkdir('school').link('school', 'class')
    sh.chdir('class')
    expect(sh.getcwd()).toBe('/class')
  })

  it('refuses to hardlink a directory under itself', function () {
    const sh = connect(createFileSystem())
    sh.mkdir('school').mkdir('school/homework')
    expect(function () {
      sh.link('school', 'school/homework/loop')
    }).toThrow('EPERM')
  })
})
