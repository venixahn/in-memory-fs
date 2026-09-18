// In-memory Unix-like VFS. Names live on dentries. File bytes, directory
// children, and symlink targets live on inodes. Hardlinks are extra
// dentries on the same inode. connect(fs) is a process with its own cwd.
import { FsError } from './error.js'
import { joinPath, splitPath } from './path.js'

type InodeKind = 'dir' | 'file' | 'symlink'

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

type Stat = {
  kind: InodeKind
}

type Shell = {
  getcwd(): string
  readdir(path?: string): string[]
  chdir(path: string): Shell
  mkdir(path: string): Shell
  rmdir(path: string): Shell
  unlink(path: string): Shell
  rename(from: string, to: string): Shell
  creat(path: string): Shell
  link(existing: string, path: string): Shell
  symlink(target: string, path: string): Shell
  writeFile(path: string, contents: string): Shell
  readFile(path: string): string
  readlink(path: string): string
  lstat(path: string): Stat
  stat(path: string): Stat
  find(basename: string): string[]
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

const createSymlinkInode = (target: string): Inode => ({
  kind: 'symlink',
  data: target,
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

const MAX_SYMLINKS = 40

function followLink (dentry: Dentry, depth: number): Dentry {
  if (dentry.inode.kind !== 'symlink') {
    return dentry
  }
  if (depth >= MAX_SYMLINKS) {
    throw new FsError('ELOOP')
  }
  return walkFrom(dentry.parent, dentry.inode.data, true, depth + 1)
}

function walkFrom (
  start: Dentry,
  path: string,
  followLast: boolean,
  depth: number,
): Dentry {
  let node = path.startsWith('/') ? rootOf(start) : start
  const parts = splitPath(path)
  for (const [i, part] of parts.entries()) {
    node = step(node, part)
    if (i < parts.length - 1 || followLast) {
      node = followLink(node, depth)
    }
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
    dir = followLink(step(dir, part), 0)
  }
  if (dir.inode.kind !== 'dir') {
    throw new FsError('ENOTDIR')
  }
  return { dir, name }
}

function wouldCycle (source: Inode, destDir: Dentry): boolean {
  if (source.kind !== 'dir') {
    return false
  }
  let current = destDir
  while (true) {
    if (current.inode === source) {
      return true
    }
    if (current.parent === current) {
      return false
    }
    current = current.parent
  }
}

const addChild = (cwd: Dentry, path: string, inode: Inode): void => {
  const named = parentAndName(cwd, path)
  if (wouldCycle(inode, named.dir)) {
    throw new FsError('EPERM')
  }
  if (named.dir.inode.children.has(named.name)) {
    throw new FsError('EEXIST')
  }
  named.dir.inode.children.set(named.name, {
    name: named.name,
    parent: named.dir,
    inode,
  })
}

const linkAt = (cwd: Dentry, existing: string, path: string): void => {
  addChild(cwd, path, walkFrom(cwd, existing, false, 0).inode)
}

function removeDir (cwd: Dentry, path: string): void {
  const dentry = walkFrom(cwd, path, false, 0)
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

function unlinkAt (cwd: Dentry, path: string): void {
  const dentry = walkFrom(cwd, path, false, 0)
  if (dentry.parent === dentry) {
    throw new FsError('EPERM')
  }
  if (dentry.inode.kind === 'dir') {
    throw new FsError('EISDIR')
  }
  dentry.parent.inode.children.delete(dentry.name)
}

function renameAt (cwd: Dentry, from: string, to: string): void {
  const src = walkFrom(cwd, from, false, 0)
  if (src.parent === src) {
    throw new FsError('EPERM')
  }
  const dest = parentAndName(cwd, to)
  if (dest.dir.inode.children.has(dest.name)) {
    throw new FsError('EEXIST')
  }
  if (wouldCycle(src.inode, dest.dir)) {
    throw new FsError('EPERM')
  }
  src.parent.inode.children.delete(src.name)
  src.name = dest.name
  src.parent = dest.dir
  dest.dir.inode.children.set(dest.name, src)
}

function collectNamed (
  dentry: Dentry,
  basename: string,
  seen: Set<Inode>,
  out: string[],
): void {
  if (seen.has(dentry.inode)) {
    return
  }
  seen.add(dentry.inode)
  for (const child of dentry.inode.children.values()) {
    if (child.name === basename) {
      out.push(pathOf(child))
    }
    if (child.inode.kind === 'dir') {
      collectNamed(child, basename, seen, out)
    }
  }
}

const findAt = (cwd: Dentry, basename: string): string[] => {
  const out: string[] = []
  collectNamed(cwd, basename, new Set(), out)
  return out
}

const chdirTo = (cwd: Dentry, path: string): Dentry => {
  const dentry = walkFrom(cwd, path, true, 0)
  if (dentry.inode.kind !== 'dir') {
    throw new FsError('ENOTDIR')
  }
  return dentry
}

const writeFileAt = (cwd: Dentry, path: string, contents: string): void => {
  const dentry = walkFrom(cwd, path, true, 0)
  if (dentry.inode.kind === 'dir') {
    throw new FsError('EISDIR')
  }
  dentry.inode.data = contents
}

const readFileAt = (cwd: Dentry, path: string): string => {
  const dentry = walkFrom(cwd, path, true, 0)
  if (dentry.inode.kind === 'dir') {
    throw new FsError('EISDIR')
  }
  return dentry.inode.data
}

const readlinkAt = (cwd: Dentry, path: string): string => {
  const dentry = walkFrom(cwd, path, false, 0)
  if (dentry.inode.kind !== 'symlink') {
    throw new FsError('EINVAL')
  }
  return dentry.inode.data
}

const lstatAt = (cwd: Dentry, path: string): Stat => ({
  kind: walkFrom(cwd, path, false, 0).inode.kind,
})

const statAt = (cwd: Dentry, path: string): Stat => ({
  kind: walkFrom(cwd, path, true, 0).inode.kind,
})

const readdirAt = (cwd: Dentry, path: string): string[] => {
  const dentry = walkFrom(cwd, path, true, 0)
  if (dentry.inode.kind !== 'dir') {
    throw new FsError('ENOTDIR')
  }
  const names: string[] = []
  for (const name of dentry.inode.children.keys()) {
    if (!name.startsWith('.')) {
      names.push(name)
    }
  }
  return names
}

function connect (fs: FileSystem): Shell {
  const proc: Process = { cwd: fs.root }
  const sh: Shell = {
    getcwd: () => pathOf(proc.cwd),
    readdir: (path = '.') => readdirAt(proc.cwd, path),
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
    unlink (path) {
      unlinkAt(proc.cwd, path)
      return sh
    },
    rename (from, to) {
      renameAt(proc.cwd, from, to)
      return sh
    },
    creat (path) {
      addChild(proc.cwd, path, createFileInode())
      return sh
    },
    link (existing, path) {
      linkAt(proc.cwd, existing, path)
      return sh
    },
    symlink (target, path) {
      addChild(proc.cwd, path, createSymlinkInode(target))
      return sh
    },
    writeFile (path, contents) {
      writeFileAt(proc.cwd, path, contents)
      return sh
    },
    readFile: (path) => readFileAt(proc.cwd, path),
    readlink: (path) => readlinkAt(proc.cwd, path),
    lstat: (path) => lstatAt(proc.cwd, path),
    stat: (path) => statAt(proc.cwd, path),
    find: (basename) => findAt(proc.cwd, basename),
  }
  return sh
}

export type { FileSystem, Shell, Stat }
export { createFileSystem, connect, FsError }
