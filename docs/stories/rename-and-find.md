# Rename, unlink, and find

Merged to `develop`.

- Tests: [test/rename-and-find.test.ts](../../test/rename-and-find.test.ts)
- Implementation: [src/index.ts](../../src/index.ts)
- Board: [status.md](../status.md)
- Plan: [plan.md](../plan.md)
- Prompt: [task.md](../task.md)
- Previous: [Multi-client](multi-client.md)
- Next: [Prompt example](prompt-example.md)

Done:

- `rename` files and directories, including across parents; `EEXIST` if the target exists
- `unlink` non-directories (`EISDIR` on a directory)
- `find` exact basename under cwd; skip symlink dirs; visited-inode set for hardlinks
