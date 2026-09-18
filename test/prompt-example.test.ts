import { describe, expect, it } from 'vitest'
import { connect, createFileSystem } from '@app/index.ts'

describe('prompt example', function () {
  it('walks the school and homework tree from the assignment', function () {
    const sh = connect(createFileSystem())
    sh.mkdir('school').chdir('school')
    expect(sh.getcwd()).toBe('/school')
    sh.mkdir('homework').chdir('homework')
    sh.mkdir('math').mkdir('lunch').mkdir('history').mkdir('spanish')
    sh.rmdir('lunch')
    expect(sh.readdir()).toEqual(['math', 'history', 'spanish'])
    expect(sh.getcwd()).toBe('/school/homework')
    sh.chdir('..')
    sh.mkdir('cheatsheet')
    expect(sh.readdir()).toEqual(['homework', 'cheatsheet'])
    sh.rmdir('cheatsheet')
    sh.chdir('..')
    expect(sh.getcwd()).toBe('/')
  })
})
