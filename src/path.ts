const splitPath = (path: string): string[] =>
  path.split('/').filter((part) => part !== '')

const joinPath = (parts: string[]): string =>
  parts.length === 0 ? '/' : '/' + parts.join('/')

export { splitPath, joinPath }
