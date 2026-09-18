# Symlinks

Merged to `develop`.

- Tests: [test/symlinks.test.ts](../../test/symlinks.test.ts)
- Implementation: [src/index.ts](../../src/index.ts)
- Board: [status.md](../status.md)
- Plan: [plan.md](../plan.md)
- Prompt: [task.md](../task.md)
- Previous: [Errors and paths](error-and-paths.md)
- Next: [Hardlinks](hardlinks.md)

Done:

- `symlink` / `readlink` (`readlink` does not follow)
- `readFile` / `writeFile` / `chdir` follow
- `lstat` vs `stat`
- `ELOOP` after 40 symlink hops
