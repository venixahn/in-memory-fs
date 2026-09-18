import { connect, createFileSystem } from './index.js'
import type { Shell } from './index.js'

const log = (line: string): void => {
  console.log(line)
}

const listed = (names: string[]): string =>
  '[' + names.map((name) => `'${name}'`).join(', ') + ']'

function mkdirNamed (sh: Shell, name: string): void {
  sh.mkdir(name)
  log(`make "${name}" directory`)
}

function chdirNamed (sh: Shell, name: string): void {
  sh.chdir(name)
  if (name === '..') {
    log('change directory to parent')
    return
  }
  log(`change directory to "${name}"`)
}

function rmdirNamed (sh: Shell, name: string): void {
  sh.rmdir(name)
  log(`delete "${name}" directory`)
}

function showCwd (sh: Shell): void {
  log(`get working directory => "${sh.getcwd()}"`)
}

function showListing (sh: Shell): void {
  log(`get working directory contents => ${listed(sh.readdir())}`)
}

function inHomework (sh: Shell): void {
  mkdirNamed(sh, 'homework')
  chdirNamed(sh, 'homework')
  mkdirNamed(sh, 'math')
  mkdirNamed(sh, 'lunch')
  mkdirNamed(sh, 'history')
  mkdirNamed(sh, 'spanish')
  rmdirNamed(sh, 'lunch')
  showListing(sh)
  showCwd(sh)
}

function backToRoot (sh: Shell): void {
  chdirNamed(sh, '..')
  mkdirNamed(sh, 'cheatsheet')
  showListing(sh)
  rmdirNamed(sh, 'cheatsheet')
  chdirNamed(sh, '..')
  showCwd(sh)
}

function main (): void {
  const sh = connect(createFileSystem())
  mkdirNamed(sh, 'school')
  chdirNamed(sh, 'school')
  showCwd(sh)
  inHomework(sh)
  backToRoot(sh)
}

main()
