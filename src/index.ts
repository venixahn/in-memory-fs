import { FsError } from './error.js'
import { joinPath, splitPath } from './path.js'

type InodeKind = 'dir' | 'file'

type Inode = {
  kind: InodeKind
  data: string
  children: Map<string, Dentry>
}

type Dentry = {
  name: string
  parent: Dentry
  inode: Inode
}

type FileSystem = {
  root: Dentry
}

type Process = {
  cwd: Dentry
}

type Shell = {
  getcwd(): string
  chdir(path: string): Shell
  mkdir(path: string): Shell
  rmdir(path: string): Shell
  creat(path: string): Shell
  writeFile(path: string, contents: string): Shell
  readFile(path: string): string
}

const createDirInode = (): Inode => ({
  kind: 'dir',
  data: '',
  children: new Map(),
})

const createFileInode = (): Inode => ({
  kind: 'file',
  data: '',
  children: new Map(),
})

const createFileSystem = (): FileSystem => {
  const root = { name: '', inode: createDirInode() } as Dentry
  root.parent = root
  return { root }
}

const rootOf = (dentry: Dentry): Dentry => {
  let current = dentry
  while (current.parent !== current) {
    current = current.parent
  }
  return current
}

const pathOf = (dentry: Dentry): string => {
  const names: string[] = []
  let current = dentry
  while (current.parent !== current) {
    names.unshift(current.name)
    current = current.parent
  }
  return joinPath(names)
}

function step (node: Dentry, part: string): Dentry {
  if (node.inode.kind !== 'dir') {
    throw new FsError('ENOTDIR')
  }
  if (part === '.') {
    return node
  }
  if (part === '..') {
    return node.parent
  }
  const child = node.inode.children.get(part)
  if (child === undefined) {
    throw new FsError('ENOENT')
  }
  return child
}

const walk = (start: Dentry, path: string): Dentry => {
  let node = path.startsWith('/') ? rootOf(start) : start
  for (const part of splitPath(path)) {
    node = step(node, part)
  }
  return node
}

function parentAndName (
  cwd: Dentry,
  path: string,
): { dir: Dentry; name: string } {
  const parts = splitPath(path)
  if (parts.length === 0) {
    throw new FsError('EINVAL')
  }
  const name = parts[parts.length - 1]
  if (name === undefined || name === '.' || name === '..') {
    throw new FsError('EINVAL')
  }
  let dir = path.startsWith('/') ? rootOf(cwd) : cwd
  for (const part of parts.slice(0, -1)) {
    dir = step(dir, part)
  }
  if (dir.inode.kind !== 'dir') {
    throw new FsError('ENOTDIR')
  }
  return { dir, name }
}

const addChild = (cwd: Dentry, path: string, inode: Inode): void => {
  const named = parentAndName(cwd, path)
  if (named.dir.inode.children.has(named.name)) {
    throw new FsError('EEXIST')
  }
  named.dir.inode.children.set(named.name, {
    name: named.name,
    parent: named.dir,
    inode,
  })
}

function removeDir (cwd: Dentry, path: string): void {
  const dentry = walk(cwd, path)
  if (dentry.parent === dentry) {
    throw new FsError('EPERM')
  }
  if (dentry.inode.kind !== 'dir') {
    throw new FsError('ENOTDIR')
  }
  if (dentry.inode.children.size > 0) {
    throw new FsError('ENOTEMPTY')
  }
  dentry.parent.inode.children.delete(dentry.name)
}

const chdirTo = (cwd: Dentry, path: string): Dentry => {
  const dentry = walk(cwd, path)
  if (dentry.inode.kind !== 'dir') {
    throw new FsError('ENOTDIR')
  }
  return dentry
}

const writeFileAt = (cwd: Dentry, path: string, contents: string): void => {
  const dentry = walk(cwd, path)
  if (dentry.inode.kind === 'dir') {
    throw new FsError('EISDIR')
  }
  dentry.inode.data = contents
}

const readFileAt = (cwd: Dentry, path: string): string => {
  const dentry = walk(cwd, path)
  if (dentry.inode.kind === 'dir') {
    throw new FsError('EISDIR')
  }
  return dentry.inode.data
}

function connect (fs: FileSystem): Shell {
  const proc: Process = { cwd: fs.root }
  const sh: Shell = {
    getcwd: () => pathOf(proc.cwd),
    chdir (path) {
      proc.cwd = chdirTo(proc.cwd, path)
      return sh
    },
    mkdir (path) {
      addChild(proc.cwd, path, createDirInode())
      return sh
    },
    rmdir (path) {
      removeDir(proc.cwd, path)
      return sh
    },
    creat (path) {
      addChild(proc.cwd, path, createFileInode())
      return sh
    },
    writeFile (path, contents) {
      writeFileAt(proc.cwd, path, contents)
      return sh
    },
    readFile: (path) => readFileAt(proc.cwd, path),
  }
  return sh
}

export type { FileSystem, Shell }
export { createFileSystem, connect, FsError }
