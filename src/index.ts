type FileSystem = {
  files: Map<string, string>
}

type Shell = {
  getcwd(): string
  creat(name: string): Shell
  writeFile(name: string, contents: string): Shell
  readFile(name: string): string
}

function createFileSystem(): FileSystem {
  return { files: new Map() }
}

function connect(fs: FileSystem): Shell {
  const sh: Shell = {
    getcwd() {
      return '/'
    },
    creat(name) {
      fs.files.set(name, '')
      return sh
    },
    writeFile(name, contents) {
      fs.files.set(name, contents)
      return sh
    },
    readFile(name) {
      return fs.files.get(name) ?? ''
    },
  }
  return sh
}

export type { FileSystem, Shell }
export { createFileSystem, connect }
