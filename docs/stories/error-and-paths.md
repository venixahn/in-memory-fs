# Errors and paths

Merged to `develop`.

- Tests: [test/error-and-paths.test.ts](../../test/error-and-paths.test.ts)
- Implementation: [src/index.ts](../../src/index.ts), [src/error.ts](../../src/error.ts), [src/path.ts](../../src/path.ts)
- Board: [status.md](../status.md)
- Plan: [plan.md](../plan.md)
- Prompt: [task.md](../task.md)
- Previous: [File contents](file-contents.md)
- Next: [Symlinks](symlinks.md)

Done:

- `ENOENT` on a missing file (`readFile` / `writeFile`)
- `EEXIST` when `creat` hits an existing name
- `ENOTDIR` when a file is used as a directory
- `ENOTEMPTY` when `rmdir` hits a directory that still has children
- `EISDIR` when `readFile` / `writeFile` target a directory
- `EINVAL` for `/`, `.`, and `..` as a create name
- `EPERM` when `rmdir` targets `/`
- `..` at `/` stays `/`
- Absolute paths from `/`

`mkdir`, `chdir`, and `rmdir` exist here so those path and errno cases can run. [Navigate directories](navigate-directories.md) still owns `readdir`.
