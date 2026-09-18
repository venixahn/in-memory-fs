class FsError extends Error {
  readonly code: string

  constructor (code: string) {
    super(code)
    this.name = 'FsError'
    this.code = code
  }
}

export { FsError }
