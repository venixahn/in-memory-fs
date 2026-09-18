import { describe, expect, it } from 'vitest'
import { connect, createFileSystem } from '@app/index.ts'

describe('file contents', function () {
  it('creates an empty file', function () {
    const sh = connect(createFileSystem())
    expect(sh.creat('notes').readFile('notes')).toBe('')
  })

  it('writes then reads file contents', function () {
    const sh = connect(createFileSystem())
    sh.creat('notes').writeFile('notes', 'hi')
    expect(sh.readFile('notes')).toBe('hi')
  })
})
