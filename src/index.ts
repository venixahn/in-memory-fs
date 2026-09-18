type FileSystem = {
  rootPath: '/'
}

type Shell = {
  getcwd(): string
}

function createFileSystem(): FileSystem {
  return { rootPath: '/' }
}

function connect(fs: FileSystem): Shell {
  return {
    getcwd() {
      return fs.rootPath
    },
  }
}

export type { FileSystem, Shell }
export { createFileSystem, connect }
