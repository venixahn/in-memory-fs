import { describe, expect, it } from 'vitest'
import { connect, createFileSystem } from '@/index.js'

describe('navigate directories', function () {
  it('starts a new process at /', function () {
    const sh = connect(createFileSystem())
    expect(sh.getcwd()).toBe('/')
  })
})
