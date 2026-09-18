export type FileSystem = {
  rootPath: '/';
};

export type Shell = {
  getcwd(): string;
};

export function createFileSystem(): FileSystem {
  return { rootPath: '/' };
}

export function connect(fs: FileSystem): Shell {
  return {
    getcwd() {
      return fs.rootPath;
    },
  };
}
